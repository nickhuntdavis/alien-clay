'use strict';
// Spawn Prawn - Private Schooled reimagined, part 1: Acid Spit and Rent Free (PRIVATE_REDESIGN.md, 30 Oct 2026).
// Private-only: wupRegFor('private', ...) (samplebranches.js), so every other sample keeps wup2.js / wup3.js's shared sets.
// The theme is privilege as a weapon: the toughest enemy becomes a liability to its own team. "Toughest" = highest max health in
// reach, Elites and bosses first (pv1Toughest). "Possessed" = pvPoss(e): charmed and not an ordinary zombie ally (fight.js f_possessed).
//  - Acid Spit (v_fire_proj, prefix pv_as), behaviour through wupOn hooks and global hooks, state in w.pv1 (flags in w.pv1.on):
//      A Silver Spoon     fire:after turns every glob of the shot towards the toughest enemy in reach (rotating the whole volley); +40% to
//                         Elites and bosses. Lv 6: Born to Rule (a hit on the toughest splashes 30% onto enemies within 60), Entitled (one more
//                         glob a shot while the toughest is a boss). Wild: Spoilt (every 5th glob x2 size and damage, 30% slower).
//                         Mastery: Head Boy (the toughest enemy's Corrosion bar fills 50% faster: a bar bump on its hits).
//      B Trust Fund       Acid damage (any weapon) on an enemy compounds: +10% a second while it stays Corroded, to +100% (e.pv1.tf, a dmgMul
//                         hook). Lv 6: Offshore Account (a dying compounding enemy hands its bonus to the nearest enemy), Inheritance (a kill by
//                         Acid heals you 1%). Wild: Gap Year (15% a second to stop for 2 s, then the bonus doubles, to +200%).
//                         Mastery: Old Money (the bonus never resets).
//      C Hostile Takeover an enemy whose Corrosion bar fills (a fightPayoff wrapper: 'corrode' or 'strip', from any source) is Possessed for
//                         6 s, one at a time (w.pv1.tks). Lv 6: Asset Stripping (a taken-over enemy takes double from Acid), Golden Handshake (when
//                         a takeover ends, or its enemy dies, it bursts in Acid, radius 80). Wild: Insider Trading (an ended takeover gives 4
//                         stamina). Mastery: Conglomerate (3 at once).
//  - Rent Free (v_soul_proj, prefix pv_rf). The slot is set to Holy (w.holyP = 1) so its soul bar Possesses (shared Rent Free is Damned):
//      A Old Boys' Network an enemy killed by a Possessed enemy rises as a Possessed copy (half health, a zombie ally, no xp), at most 4
//                         Possessed at once (allyAI is wrapped so a kill knows its killer). Lv 6: Secret Handshake (your weapons deal 50% less to
//                         Possessed enemies), Nepotism (Possessed Elites stay Possessed twice as long). Wild: Blackballed (15%: the copy refuses,
//                         hostile and Feared for 2 s). Mastery: Old School Tie (8 at once).
//      B The Help         Possessed enemies are pulled back to within 120 of you; enemy bullets within 40 of one are stopped. Lv 6: Butler (a
//                         Possessed enemy that dies heals you 2%), Live-in Staff (Possession lasts 50% longer). Wild: Below Stairs (every 3 s a
//                         Possessed enemy fills 25% of a Holy bar on enemies within 140). Mastery: Staff Quarters (a Possession about to end has
//                         a 25% chance to start again, for as long as it first lasted).
//      C Legacy Admission the first enemy Possessed each wave (each minute outside waves) stays Possessed until the wave changes, is 50% bigger
//                         (r) with 50% more health (so its allyAI hits are 50% stronger). Lv 6: Family Crest (the Legacy's hits add 20% of a
//                         Corrosion bar), Endowment (it heals 2% of its health a second). Wild: Disinherited (when it dies it bursts in
//                         Holy damage, radius 100). Mastery: Dynasty (two Legacies a wave).
//  State other files may read (the costume builder): w.pv1.p (branch letter), .on (flags), .fx (a counter per card), Acid Spit: .tough (the
//  toughest enemy or null), .tfN (enemies compounding), .tkN (takeovers up), .tks (Set of enemies); Rent Free: .possN (Possessed now),
//  .legs (the live Legacies); on enemies e.pv1: .tf (compounding bonus), .tk (taken over), .leg (a Legacy), .rec (a risen recruit).
//  Simplified: Old Boys' Network raises a Possessed copy of the dead enemy (the dead cannot be Possessed); Nepotism doubles every Possessed
//  Elite, not just recruits; Pulling Strings and the gated cards are part 2. Copy: every tag, cost, card text and float is TODO_COPY:<id> via
//  pv1T (the user writes it; privatecopy.js holds it); names are the drafted ones.
// Hooks: wupRegFor (samplebranches.js), wupOn; hookOn('fire:after' / 'dmgMul' / 'kill' / 'tick'); wraps fightPayoff (fight.js) and allyAI
// (arsenal.js). Loads after samplebranches.js, wup2.js, wup3.js and beta1.js.

const PV1 = { AS: 'v_fire_proj', RF: 'v_soul_proj', spoonElite: 1.4, bornSplash: 0.3, bornR: 60, spoiltEvery: 5, spoiltSlow: 0.7, trustRate: 0.1, trustCap: 1, trustCap2: 2,
  gapP: 0.15, gapT: 2, inherit: 0.01, takeT: 6, goldR: 80, goldK: 3, insiderStam: 4, stripK: 2, headBoy: 0.5,
  recCap: 4, tieCap: 8, recHp: 0.5, recT: 4, blackP: 0.15, blackFear: 2, shakeK: 0.5, nepoK: 2,
  helpR: 120, helpBullet: 40, butlerHeal: 0.02, liveK: 1.5, belowEvery: 3, belowR: 140, belowFill: 0.25, staffP: 0.25,
  legK: 1.5, crestFill: 0.2, endow: 0.02, disR: 100, disK: 6 };
const pv1T = id => (typeof PRIVATE_COPY !== 'undefined' && PRIVATE_COPY[id]) || 'TODO_COPY:' + id; // (copy is looked up by id once the user's text exists)
const pv1F = w => { const f = w.pv1 || (w.pv1 = {}); if (!f.on) f.on = {}; if (!f.fx) f.fx = {}; return f; };
const pv1E = e => e.pv1 || (e.pv1 = {});
const pv1Mark = (w, k) => { const f = pv1F(w); f.fx[k] = (f.fx[k] || 0) + 1; }; // (a counter per card, so the test can see it work)
const pv1Pal = { gold: '#f3c969', pale: '#fff1c4', acid: '#ff2fa8', holy: '#fff6d6', navy: '#1f2a5a' };
// A possessed enemy: charmed and not an ordinary zombie ally (a risen recruit is a zombie with e.pv1.rec).
const pvPoss = e => !!e && !e.dead && !!e.charmed && (!e.zombie || !!(e.pv1 && e.pv1.rec));
const pv1Big = e => !!(e.boss || e.elite || e.rival);
const pv1Dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pv1IsAcid = src => !!src && !src.fromAlly && FIGHT_TYPE[(src.w && src.w.typeOver) || src.elem || 'phys'] === 'acid';
const pv1Key = () => (G.wave && G.wave.n > 0 ? 'w' + G.wave.n : 'm' + Math.floor(G.t / 60)); // (a wave; outside the dish every minute stands in)
const pv1G = () => G.pv1 || (G.pv1 = { leg: { key: null, list: [] } });
const pv1Say_ = {};
function pv1Say(key, x, y, id, color, size, gap) { if ((pv1Say_[key] || 0) > G.realT) return; pv1Say_[key] = G.realT + (gap || 0.6); floatText(x, y, pv1T(id), color, size || 12, 0.8); }
function pv1Src(w, atk, extra) { return Object.assign({ elem: w.def.elem, w, atk, wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name }, extra); }
// The union of the slots' flags, cached for a frame (pv1Dirty after a card changes them): the slot that holds a flag, or null.
let PV1_FL = null, PV1_FLF = -1, PV1_FLG = null;
const pv1Dirty = () => { PV1_FLF = -1; };
function pv1Has(k) {
  if (!G || !G.weapons) return null;
  if (PV1_FLG !== G || PV1_FLF !== G.frameN || !PV1_FL) {
    PV1_FL = {}; PV1_FLF = G.frameN; PV1_FLG = G;
    for (const w of G.weapons) if (w && w.pv1 && w.pv1.on) for (const k2 in w.pv1.on) if (!PV1_FL[k2]) PV1_FL[k2] = w;
  }
  return PV1_FL[k] || null;
}

// The toughest enemy in reach: Elites, bosses and rivals first, then the most max health (ties: the nearer).
function pv1Toughest(w) {
  const f = pv1F(w);
  if (f.toughF === G.frameN && f.toughG === G && (!f.tough || !f.tough.dead)) return f.tough;
  const p = G.player, R = w.s.range || 400; let best = null, bk = -1;
  for (const e of G.enemies) {
    if (e.dead || e.charmed || e.egg || e.phased) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y); if (d > R + e.r) continue;
    const k = (pv1Big(e) ? 1e12 : 0) + e.maxHp - d * 1e-6;
    if (k > bk) { bk = k; best = e; }
  }
  f.tough = best; f.toughF = G.frameN; f.toughG = G; return best;
}

// ---------------------------------------------------------------- Corrosion helpers
const pv1AcidFrac = (e, raw) => { const cd = fightCd(e); return raw / (COMBAT.barSize.acid * (cd.def === 'shell' && cd.layers > 0 ? cd.layers : 1) * COMBAT.rankBarK[cd.rank || 'normal'] * cd.maxHp); };
// Add a share of the Corrosion bar and pay it off like the resolver does (a full bar strips a Shell layer, or Corrodes).
function pv1BarBump(e, frac, src) {
  if (!e || e.dead || e.egg) return null;
  const cd = fightCd(e); cd.bars.acid += frac; cd.barQuietT.acid = 0;
  if (cd.bars.acid < 1) return null;
  cd.bars.acid = 0;
  if (cd.def === 'shell' && cd.layers > 0) {
    dropLayer(cd, { layersLost: 0 }); fst().layers++;
    ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3);
    pv1Filled(e, src); return 'strip';
  }
  fightPayoff(e, 'corrode', { raw: 0 }, src || {}); return 'corrode'; // (the fightPayoff wrapper below calls pv1Filled)
}
// A Holy build-up share on an enemy (Below Stairs): a full bar Possesses.
function pv1SoulBar(o, frac, src) {
  if (!o || o.dead || o.egg || o.charmed) return;
  const cd = fightCd(o); cd.bars.soul += frac; cd.barQuietT.soul = 0; cd.polSum = (cd.polSum || 0) + frac;
  if (cd.bars.soul >= 1) { cd.bars.soul = 0; fightPayoff(o, 'possess', { raw: 0 }, src || {}); }
}

// ---------------------------------------------------------------- the wrappers
// fightPayoff: a Corrosion bar that fills (from any source) is a Hostile Takeover.
{
  const pv1Pay0 = fightPayoff;
  fightPayoff = function (e, p, res, src) {
    pv1Pay0(e, p, res, src);
    if ((p === 'corrode' || p === 'strip') && G && G.weapons && pv1Has('takeover')) pv1Filled(e, src);
  };
}
// allyAI: who is acting (so a kill knows its killer), and the Legacy's hits build Corrosion (Family Crest).
let PV1_ACT = null;
{
  const pv1Ally0 = allyAI;
  allyAI = function (e, dt) {
    const prev = PV1_ACT; PV1_ACT = e;
    try { pv1Ally0(e, dt); } finally { PV1_ACT = prev; }
    if (e.pv1 && e.pv1.leg && e.atkCd === 0.5 && G && pv1Has('crest')) { // (an attack was made this call: atkCd was just set to 0.5)
      const t = e.allyT, w = pv1Has('crest');
      if (t && !t.dead && !t.charmed) { pv1BarBump(t, PV1.crestFill, { wname: 'Family Crest', elem: 'fire', w, wupEcho: true }); pv1Mark(w, 'crest'); }
    }
  };
}

// ================================================================ ACID SPIT
function pv1AsDmg(w, e, src) { // Silver Spoon: +40% to Elites and bosses
  if (src.wupEcho) return 1;
  return w.pv1 && w.pv1.on.spoon && pv1Big(e) ? PV1.spoonElite : 1;
}
function pv1AsHit(w, e, res, src) {
  const f = pv1F(w), on = f.on;
  if (!(on.born || on.headboy)) return;
  if (pv1Toughest(w) !== e) return;
  if (on.headboy && res.statusOk && !e.dead) { pv1BarBump(e, PV1.headBoy * pv1AcidFrac(e, res.raw), pv1Src(w, 'proj')); pv1Mark(w, 'headboy'); } // Head Boy: the bar fills 50% faster
  if (on.born) { // Born to Rule: a hit on the toughest splashes 30% onto enemies within 60
    let n = 0; const dmg = res.raw * PV1.bornSplash;
    IN_AOE = true;
    forNear(e.x, e.y, PV1.bornR, o => { if (o !== e && !o.dead && !o.charmed && !o.egg) { damageEnemy(o, dmg, pv1Src(w, 'burst', { wname: 'Born to Rule' })); n++; } });
    IN_AOE = false;
    if (n) { ring(e.x, e.y, PV1.bornR, pv1Pal.gold, 0.3, 3); pv1Mark(w, 'born'); }
  }
}
// Silver Spoon (every glob goes for the toughest), Entitled (one more at a boss) and Spoilt (every 5th glob is big), all at the moment of firing.
hookOn('fire:after', 'private1:acid', (w, target, n0) => {
  if (!G || !w || w.isSpell || !w.pv1 || w24Key(w) !== PV1.AS) return;
  const f = w.pv1, on = f.on, p = G.player;
  if (on.spoon) {
    const t = pv1Toughest(w);
    if (t) {
      const aN = Math.atan2(t.y - p.y, t.x - p.x), aT = target ? Math.atan2(target.y - p.y, target.x - p.x) : aN, rot = aN - aT, cs = Math.cos(rot), sn = Math.sin(rot);
      if (target !== t) {
        for (let i = n0; i < G.proj.length; i++) {
          const pr = G.proj[i]; if (!pr || pr.w !== w || pr.dead) continue;
          if (pr.lob) { pr.tx = t.x + (pr.tx - (target ? target.x : t.x)); pr.ty = t.y + (pr.ty - (target ? target.y : t.y)); }
          else { const vx = pr.vx, vy = pr.vy; pr.vx = vx * cs - vy * sn; pr.vy = vx * sn + vy * cs; }
        }
        pv1Mark(w, 'aim');
      }
      p.face = aN;
      if (on.entitled && (t.boss || t.rival)) { // Entitled: one more glob a shot at a boss
        const pr = spawnProj(w, p.x, p.y, aN + rand(-w.s.spread, w.s.spread) * 0.5, weaponSrc(w));
        if (pr) { ring(p.x, p.y, p.r + 10, pv1Pal.gold, 0.25, 3); pv1Mark(w, 'entitled'); }
      }
    }
  }
  if (on.spoilt) { // Spoilt: every 5th glob is twice the size and damage, and slower
    for (let i = n0; i < G.proj.length; i++) {
      const pr = G.proj[i]; if (!pr || pr.w !== w || pr.dead || pr.lob) continue;
      f.shotN = (f.shotN || 0) + 1;
      if (f.shotN % PV1.spoiltEvery) continue;
      pr.dmg *= 2; pr.r *= 2; pr.speed *= PV1.spoiltSlow; pr.vx *= PV1.spoiltSlow; pr.vy *= PV1.spoiltSlow; pr.life /= PV1.spoiltSlow; pr.max = pr.life; pr.pv1big = 1;
      pv1Mark(w, 'spoilt'); pv1Say('spoilt', p.x, p.y - 32, 'pv_as_spoilt_float', pv1Pal.gold, 12, 0.8);
    }
  }
});

// Hostile Takeover: a full Corrosion bar Possesses (one at a time; Conglomerate 3).
function pv1Filled(e, src) {
  const w = pv1Has('takeover'); if (!w || !e || e.dead || e.charmed || e.egg) return;
  const f = pv1F(w), tks = f.tks || (f.tks = new Set());
  const cap = f.on.conglom ? 3 : 1; if (tks.size >= cap) return;
  curseFoe(e, PV1.takeT);
  if (!e.charmed) return; // (bosses and rivals cannot be taken over)
  const P = pv1E(e); P.tk = 1; tks.add(e);
  ring(e.x, e.y, e.r + 12, pv1Pal.gold, 0.5, 5); fxParts('spark', e.x, e.y, pv1Pal.gold, 8, 120, 0.4, 3); pv1Mark(w, 'takeover');
}
function pv1TakeoverEnd(w, e) {
  const f = pv1F(w), on = f.on, P = pv1E(e); P.tk = 0;
  if (on.golden) { // Golden Handshake: it bursts in Acid, radius 80
    IN_AOE = true;
    forNear(e.x, e.y, PV1.goldR, o => { if (o !== e && !o.dead && !o.charmed && !o.egg) damageEnemy(o, w.s.dmg * PV1.goldK, pv1Src(w, 'burst', { wname: 'Golden Handshake' })); });
    IN_AOE = false;
    ring(e.x, e.y, PV1.goldR, pv1Pal.acid, 0.4, 5); fxParts('bubble', e.x, e.y, pv1Pal.acid, 8, 110, 0.5, 4); pv1Mark(w, 'golden');
    pv1Say('golden', e.x, e.y - e.r - 14, 'pv_as_goldenhandshake_float', pv1Pal.gold, 12, 0.6);
  }
  if (on.insider && G.stam) { // Insider Trading: an ended takeover gives 4 stamina
    G.stam.cur = Math.min(stamMax(), G.stam.cur + PV1.insiderStam); pv1Mark(w, 'insider');
    pv1Say('insider', G.player.x, G.player.y - 32, 'pv_as_insidertrading_float', pv1Pal.gold, 12, 0.8);
  }
}

// ================================================================ RENT FREE
// Roll for a new Possessed enemy the frame it is first seen (any source: the soul bar, a takeover, a recruit).
function pv1NewPoss(e, P) {
  if (pv1Has('livein')) e.charmT *= PV1.liveK; // Live-in Staff
  if (pv1Has('nepotism') && e.elite) e.charmT *= PV1.nepoK; // Nepotism
  P.dur = e.charmT; P.rolled = false; P.bsT = G.t + PV1.belowEvery;
  const w = pv1Has('legacy');
  if (w) {
    const L = pv1G().leg, cap = pv1Has('dynasty') ? 2 : 1;
    pv1LegCheck();
    if (L.list.length < cap && !P.leg) { // Legacy Admission: this one stays for the wave, bigger and stronger
      P.leg = 1; P.r0 = e.r; P.hp0 = e.maxHp; e.r *= PV1.legK; e.maxHp *= PV1.legK; e.hp *= PV1.legK; e.charmT = P.dur = 1e9; L.list.push(e);
      ring(e.x, e.y, e.r + 14, pv1Pal.gold, 0.6, 6); ring(e.x, e.y, e.r + 28, pv1Pal.pale, 0.4, 3); pv1Mark(w, 'legacy');
      pv1Say('legacy', e.x, e.y - e.r - 18, 'pv_rf_legacyadmission_float', pv1Pal.gold, 13, 0.8);
    }
  }
}
function pv1LegCheck() { // the wave moved on: the Legacies retire
  const g = pv1G(), L = g.leg, key = pv1Key();
  if (L.key === key) return;
  for (const e of L.list) if (e && !e.dead && e.pv1 && e.pv1.leg) { e.dead = true; ring(e.x, e.y, e.r + 10, pv1Pal.pale, 0.4, 4); fxParts('smoke', e.x, e.y, pv1Pal.pale, 6, 50, 0.6, 3); }
  L.key = key; L.list = [];
}
// Old Boys' Network: a kill by a Possessed enemy rises as a Possessed copy.
function pv1Recruit(v, w) {
  const f = pv1F(w), cap = f.on.tie ? PV1.tieCap : PV1.recCap;
  let n = 0; for (const o of G.enemies) if (pvPoss(o)) n++;
  if (n >= cap || G.enemies.length >= CAPS.enemies) return;
  if (v.boss || v.rival || v.egg || v.charmed || v.zombie || v.final) return;
  const z = makeEnemy(v.def, v.x, v.y);
  z.xp = 0; z.name = v.name; z.r = v.r; z.maxHp = v.maxHp * PV1.recHp; z.hp = z.maxHp; z.dmg = v.dmg; z.elite = v.elite; z.zombie = true;
  const P = pv1E(z); P.rec = 1;
  if (f.on.blackball && Math.random() < PV1.blackP) { // Blackballed: the recruit refuses, hostile and Feared
    P.rec = 0; z.zombie = false; z.fearT = G.t + PV1.blackFear; G.enemies.push(z); pv1Mark(w, 'blackball');
    ring(z.x, z.y, z.r + 10, pv1Pal.navy, 0.4, 4); pv1Say('black', z.x, z.y - z.r - 14, 'pv_rf_blackballed_float', pv1Pal.pale, 12, 0.6);
    return;
  }
  z.charmed = true; z.charmT = PV1.recT; G.enemies.push(z); pv1Mark(w, 'recruit');
  ring(z.x, z.y, z.r + 10, pv1Pal.gold, 0.4, 4); fxParts('spark', z.x, z.y, pv1Pal.gold, 6, 90, 0.4, 3);
  pv1Say('recruit', z.x, z.y - z.r - 14, 'pv_rf_oldboysnetwork_float', pv1Pal.gold, 12, 0.6);
}

// ================================================================ the frame
function pv1Frame(dt) {
  if (!G || !G.player || !G.weapons || !G.weapons.some(w => w && w.pv1)) return;
  const p = G.player, g = pv1G(), H = k => pv1Has(k);
  pv1LegCheck();
  const poss = []; let tfN = 0;
  const trust = H('trust'), gap = H('gap'), keep = H('oldmoney'), help = H('help'), endow = H('endow'), staff = H('staff'), below = H('belowstairs');
  for (const e of G.enemies) {
    if (e.dead || e.egg) continue;
    let P = e.pv1;
    if (trust) { // Trust Fund: +10% a second while Corroded
      if (corroded(e)) {
        P = P || pv1E(e);
        if (P.tfPause > 0) {
          if (G.t >= P.tfPause) { P.tfPause = 0; P.tf = Math.min(PV1.trustCap2, P.tf * 2); pv1Mark(trust, 'gapdouble'); ring(e.x, e.y, e.r + 8, pv1Pal.gold, 0.4, 4); pv1Say('gap', e.x, e.y - e.r - 14, 'pv_as_gapyear_float', pv1Pal.gold, 12, 0.6); }
        } else {
          if (!(P.tf >= PV1.trustCap)) P.tf = Math.min(PV1.trustCap, (P.tf || 0) + PV1.trustRate * dt);
          if (gap && P.tf > 0) { P.tfRoll = (P.tfRoll || 0) + dt; if (P.tfRoll >= 1) { P.tfRoll -= 1; if (Math.random() < PV1.gapP) { P.tfPause = G.t + PV1.gapT; pv1Mark(gap, 'gappause'); } } }
        }
      } else if (P && P.tf > 0 && !keep && !(G.t < (P.tfGrace || 0))) { P.tf = 0; P.tfPause = 0; }
      if (P && P.tf > 0) { tfN++; if (!(P.tfPipT > G.realT) && G.fx.length < 220) { P.tfPipT = G.realT + 0.6; ring(e.x, e.y - e.r - 6, 2 + 3 * Math.min(1, P.tf), pv1Pal.gold, 0.4, 2); } }
    }
    if (pvPoss(e)) {
      P = P || pv1E(e); poss.push(e);
      if (!P.seen) { P.seen = true; pv1NewPoss(e, P); }
      if (staff && e.charmT > 0 && e.charmT <= 0.1 && !P.rolled) { // Staff Quarters: a Possession that would end may start again
        P.rolled = true;
        if (Math.random() < PV1.staffP) { e.charmT = P.dur || PV1.recT; P.rolled = false; pv1Mark(staff, 'staff'); ring(e.x, e.y, e.r + 10, pv1Pal.pale, 0.4, 4); pv1Say('staff', e.x, e.y - e.r - 14, 'pv_rf_staffquarters_float', pv1Pal.pale, 12, 0.6); }
      }
      if (P.leg && endow) { e.hp = Math.min(e.maxHp, e.hp + e.maxHp * PV1.endow * dt); pv1Mark(endow, 'endow'); } // Endowment
      if (help) { // The Help: stay within 120 of you
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
        if (d > PV1.helpR) { const m = Math.min(d - PV1.helpR, 520 * dt); e.x -= dx / d * m; e.y -= dy / d * m; pv1Mark(help, 'leash'); }
      }
      if (below && G.t >= (P.bsT || 0)) { // Below Stairs: every 3 s the staff give the neighbours Holy build-up
        P.bsT = G.t + PV1.belowEvery;
        forNear(e.x, e.y, PV1.belowR, o => { if (o !== e) pv1SoulBar(o, PV1.belowFill, { wname: 'Below Stairs', w: below }); });
        ring(e.x, e.y, PV1.belowR, pv1Pal.holy, 0.35, 3); pv1Mark(below, 'below'); pv1Say('below', e.x, e.y - e.r - 14, 'pv_rf_belowstairs_float', pv1Pal.holy, 12, 0.8);
      }
    } else if (P && P.seen) { P.seen = false; P.rolled = false; }
  }
  if (help && poss.length && G.ebul) { // The Help: enemy shots that pass within 40 of a Possessed enemy stop on it
    for (const b of G.ebul) {
      if (b.dead) continue;
      for (const q of poss) if (Math.hypot(b.x - q.x, b.y - q.y) <= PV1.helpBullet) { b.dead = true; spawnPart(b.x, b.y, pv1Pal.gold, 3, 50, 0.3, 2); pv1Mark(help, 'stop'); break; }
    }
  }
  // takeovers that ended (the Possession ran out, or the enemy died)
  for (const w of G.weapons) {
    if (!w || !w.pv1 || !w.pv1.tks) continue;
    for (const e of Array.from(w.pv1.tks)) if (e.dead || !e.charmed) { w.pv1.tks.delete(e); pv1TakeoverEnd(w, e); }
  }
  // readable state
  const legs = g.leg.list.filter(e => e && !e.dead);
  for (const w of G.weapons) {
    if (!w || !w.pv1) continue;
    const f = w.pv1; f.possN = poss.length; f.legs = legs; f.tfN = tfN; f.tkN = f.tks ? f.tks.size : 0;
    if (w24Key(w) === PV1.AS && (f.on.spoon || f.on.born || f.on.headboy)) pv1Toughest(w);
  }
}
hookOn('tick', 'private1:frame', dt => pv1Frame(dt));

// ---------------------------------------------------------------- damage multipliers (Trust Fund, Asset Stripping, Secret Handshake)
hookOn('dmgMul', 'private1:mul', (e, src) => {
  if (!G || !G.weapons || !src) return 1;
  let k = 1; const P = e.pv1;
  if (P && P.tf > 0 && pv1IsAcid(src) && pv1Has('trust')) k *= 1 + P.tf; // Trust Fund
  if (P && P.tk && e.charmed && pv1IsAcid(src) && pv1Has('stripping')) k *= PV1.stripK; // Asset Stripping
  if ((src.w || src.spell) && !src.fromAlly && pvPoss(e) && pv1Has('handshake')) k *= PV1.shakeK; // Secret Handshake
  return k;
});

// ---------------------------------------------------------------- kills
hookOn('kill', 'private1:kill', (e, src) => {
  if (!G || !G.weapons || !G.weapons.some(w => w && w.pv1)) return;
  const P = e.pv1, p = G.player;
  let w;
  if (pv1IsAcid(src) && (w = pv1Has('inherit'))) { // Inheritance: a kill by Acid damage heals you 1%
    healPlayer(G.P.maxHp * PV1.inherit, true); pv1Mark(w, 'inherit'); pv1Say('inherit', p.x, p.y - 30, 'pv_as_inheritance_float', pv1Pal.gold, 12, 0.8);
  }
  if (P && P.tf > 0 && (w = pv1Has('offshore'))) { // Offshore Account: the bonus moves to the nearest enemy
    let best = null, bd = 400 * 400;
    for (const o of G.enemies) { if (o === e || o.dead || o.egg || o.charmed) continue; const d2 = (o.x - e.x) ** 2 + (o.y - e.y) ** 2; if (d2 < bd) { bd = d2; best = o; } }
    if (best) {
      const Q = pv1E(best); Q.tf = Math.max(Q.tf || 0, P.tf); Q.tfGrace = G.t + 3; Q.tfPause = 0; bolt(e.x, e.y, best.x, best.y, pv1Pal.gold, 0.3);
      pv1Mark(w, 'offshore'); pv1Say('offshore', best.x, best.y - best.r - 14, 'pv_as_offshoreaccount_float', pv1Pal.gold, 12, 0.6);
    }
  }
  if (src && src.fromAlly && PV1_ACT && pvPoss(PV1_ACT) && PV1_ACT !== e && (w = pv1Has('network'))) pv1Recruit(e, w); // Old Boys' Network
  if (e.charmed && (!e.zombie || (P && P.rec)) && (w = pv1Has('butler'))) { // Butler: a Possessed enemy that dies heals you 2%
    healPlayer(G.P.maxHp * PV1.butlerHeal, true); pv1Mark(w, 'butler'); pv1Say('butler', p.x, p.y - 30, 'pv_rf_butler_float', pv1Pal.holy, 12, 0.8);
  }
  if (P && P.leg && (w = pv1Has('disinherit'))) { // Disinherited: the Legacy bursts in Holy damage, radius 100
    IN_AOE = true;
    forNear(e.x, e.y, PV1.disR, o => { if (o !== e && !o.dead && !o.charmed && !o.egg) damageEnemy(o, w.s.dmg * PV1.disK, pv1Src(w, 'burst', { wname: 'Disinherited' })); });
    IN_AOE = false;
    ring(e.x, e.y, PV1.disR, pv1Pal.holy, 0.5, 6); fxParts('smoke', e.x, e.y, pv1Pal.pale, 8, 90, 0.6, 4); pv1Mark(w, 'disinherit');
    pv1Say('disinherit', e.x, e.y - e.r - 16, 'pv_rf_disinherited_float', pv1Pal.holy, 13, 0.8);
  }
});

// ================================================================ the cards
function pv1Inst(w) {
  const f = pv1F(w); if (f.inst) return; f.inst = 1;
  const k = w24Key(w);
  if (k === PV1.AS) { wupOn(w, 'dmg', pv1AsDmg); wupOn(w, 'hit', pv1AsHit); }
  if (k === PV1.RF) w.holyP = 1; // a spirit that Possesses: Holy (the shared Rent Free is Damned)
}
const pv1Apply = (p, ...flags) => w => { const f = pv1F(w); if (p) f.p = p; for (const k of flags) f.on[k] = 1; pv1Inst(w); pv1Dirty(); };
const pv1Slug = n => n.toLowerCase().replace(/[^a-z]/g, '');
(function () {
  const C = (pre, name, ...flags) => ({ name, desc: pv1T(pre + '_' + pv1Slug(name) + '_desc'), apply: pv1Apply(null, ...flags) });
  const M = (pre, name, best, ...flags) => ({ name, best, desc: pv1T(pre + '_' + pv1Slug(name) + '_desc'), apply: pv1Apply(null, ...flags) });
  const B = (pre, key, name, letter, flag) => ({ name, tag: pv1T(pre + '_' + key + '_tag'), costs: pv1T(pre + '_' + key + '_costs'), shows: '', modes: '',
    lv3: { desc: pv1T(pre + '_' + key + '_desc'), apply: pv1Apply(letter, flag) } });
  const as = 'pv_as', rf = 'pv_rf';
  wupRegFor('private', PV1.AS, {
    A: Object.assign(B(as, 'spoon', 'Silver Spoon', 'A', 'spoon'), { lv6: [C(as, 'Born to Rule', 'born'), C(as, 'Entitled', 'entitled')], wild: C(as, 'Spoilt', 'spoilt') }),
    B: Object.assign(B(as, 'trust', 'Trust Fund', 'B', 'trust'), { lv6: [C(as, 'Offshore Account', 'offshore'), C(as, 'Inheritance', 'inherit')], wild: C(as, 'Gap Year', 'gap') }),
    C: Object.assign(B(as, 'takeover', 'Hostile Takeover', 'C', 'takeover'), { lv6: [C(as, 'Asset Stripping', 'stripping'), C(as, 'Golden Handshake', 'golden')], wild: C(as, 'Insider Trading', 'insider') }),
    lv10: [M(as, 'Head Boy', 'A', 'headboy'), M(as, 'Old Money', 'B', 'trust', 'oldmoney'), M(as, 'Conglomerate', 'C', 'takeover', 'conglom')] });
  wupRegFor('private', PV1.RF, {
    A: Object.assign(B(rf, 'network', "Old Boys' Network", 'A', 'network'), { lv6: [C(rf, 'Secret Handshake', 'handshake'), C(rf, 'Nepotism', 'nepotism')], wild: C(rf, 'Blackballed', 'blackball') }),
    B: Object.assign(B(rf, 'help', 'The Help', 'B', 'help'), { lv6: [C(rf, 'Butler', 'butler'), C(rf, 'Live-in Staff', 'livein')], wild: C(rf, 'Below Stairs', 'belowstairs') }),
    C: Object.assign(B(rf, 'legacy', 'Legacy Admission', 'C', 'legacy'), { lv6: [C(rf, 'Family Crest', 'crest'), C(rf, 'Endowment', 'endow')], wild: C(rf, 'Disinherited', 'disinherit') }),
    lv10: [M(rf, 'Old School Tie', 'A', 'network', 'tie'), M(rf, 'Staff Quarters', 'B', 'staff'), M(rf, 'Dynasty', 'C', 'legacy', 'dynasty')] });
})();
