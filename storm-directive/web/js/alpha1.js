'use strict';
// Spawn Prawn - Alpha reimagined, part 1: the hustle branches of Red Flagship and Soulmate Signal (ALPHA_REDESIGN.md, 30 Oct 2026).
// Alpha-only: wupRegFor('alpha', ...) (samplebranches.js), so every other sample keeps wup2.js / wup4.js's shared sets.
//  - Red Flagship (v_shock_beam, prefix al_rf), behaviour through wupOn hooks on the slot (state in w.al1):
//      A Grindset      the beam climbs while you swim (+60% in 3 s), resets after 1 s still. Lv 6: 4am Club (x2 the first 10 s of a wave;
//                      outside waves, the first 10 s of each minute), Cold Plunge (the held target is slowed 40%). Wild: Rise and Grind
//                      (the beam leaves Static trails that zap). Mastery: Sigma (at full climb the beam forks onto a second target).
//      B Life Coach    while the beam holds a target, your other weapons hit it 20% harder and fire 15% faster (global dmgMul hook and a
//                      rateBonus wrapper that reads AIMAT.w, the weapon being updated). Lv 6: Accountability Partner (a Force heavy hit
//                      every 3 s), Vision Board (reach +40%). Wild: Toxic Positivity (heals 1% a second while it holds). Mastery:
//                      Breakthrough (the bonus passes to the next target, stacking twice).
//      C Crypto Bro    half of each hit is pumped into the target (e.al1pump); when it dies the pump bursts on its neighbours. A pump that is
//                      not fed fades. Lv 6: HODL (never fades, the burst grows with the hold), Rug Pull (switching target dumps the old pump).
//                      Wild: NFT (a pumped kill drops a token that pays out stamina). Mastery: To the Moon (the burst chains to the next
//                      pumped enemy). AL1.onPumpBurst: functions called with (w, enemy) on every burst (alpha2.js Diamond Hands).
//  - Soulmate Signal (s_twin, prefix al_ss). The twin is the mirror of you across w.anchor (toys.js twinPoints), so a swap with the twin is
//    just standing where it stands. twinPoints / twinSegs are wrapped (after wup4.js's wrap) for the tether that switches off, the twin that
//    vanishes, the dashing twin and the triangle.
//      A Wingman       enemy bullets within 120 of the twin are drawn into it (no damage to anyone). Lv 6: Hype Man (shooters whose fire the
//                      twin draws, and enemies touching it, are Charged), Bro Code (hurt: swap with the twin, 6 s). Wild: Pull Up (the twin
//                      dashes to the nearest Elite for 3.5 s, every 10 s). Mastery: Ride or Die (the twin also fires your Unwanted Contact).
//      B Situationship the tether is 1 s on, 1 s off, x2.2 while on. Lv 6: Ghosting (off: the twin vanishes, on: it reappears behind the
//                      crowd), Breadcrumbing (each flick-on leaves Static crumbs). Wild: Red Flag (sometimes the tether stings you: 2% of your
//                      health, never lethal). Mastery: It's Complicated (the flicker speeds up as enemies die).
//      C Power Couple  +60% to both ends at the twin, falling off to nothing at 120. Lv 6: Matching Outfits (the twin's hits carry your other
//                      weapons' status, and your hits Charge), Couples Therapy (touching the twin heals 2%). Wild: PDA (swimming through
//                      the twin sends out a Force pulse). Mastery: Soulmates (a second twin and a triangle tether).
//  Simplified: Matching Outfits is "your hits Charge, the twin's hits carry a random other weapon's status"; Rise and Grind's trail is a
//  set of beam ghosts (as Screen Burn); Wingman bends bullets into the twin rather than modelling bullet ownership; NFT tokens are a
//  list in G.al1tok drawn as flashes. Copy: every card, tag, cost and float text is TODO_COPY:<id> (the user writes it); names are the drafted ones.
// Hooks: wupRegFor (samplebranches.js), wupOn; hookOn('dmgMul' / 'kill' / 'hurt' / 'proc' / 'fire:after'); wraps rateBonus (arsenal.js),
// twinPoints and twinSegs (toys.js). Loads after samplebranches.js.

const AL1 = { onPumpBurst: [], RF: 'v_shock_beam', SS: 's_twin', climbT: 3, grindMax: 0.6, burstR: 110, drawR: 120, redFlagP: 0.2 };
const al1T = id => (typeof ALPHA_COPY !== 'undefined' && ALPHA_COPY[id]) || 'TODO_COPY:' + id; // (copy is looked up by id once the user's text exists)
const al1F = w => w.al1 || (w.al1 = {});
const al1W = key => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === key) : null);
const al1Elite = e => !!(e && (e.elite || e.rival) && !e.boss);
const al1Dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const al1Pale = '#f1ecff', al1Yel = '#ffe94a';
const al1Say_ = {};
function al1Say(key, x, y, txt, color, size, gap) { if ((al1Say_[key] || 0) > G.realT) return; al1Say_[key] = G.realT + (gap || 0.6); floatText(x, y, txt, color, size || 12, 0.8); }
function al1Mark(w, k) { const f = al1F(w); (f.fx || (f.fx = {}))[k] = ((f.fx || {})[k] || 0) + 1; } // (a counter per card, so the test can see it work)
function al1Src(w, atk, extra) { return Object.assign({ elem: 'shock', w, atk, wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name }, extra); }
function al1Line(x1, y1, x2, y2, wd, c, life) {
  const F = G.v10fx || (G.v10fx = []); if (F.length > 160) return;
  F.push({ k: 'beam', x: x1, y: y1, x2, y2, w: wd, c, t: 'shock', life: life || 0.12, max: life || 0.12 });
}
function al1SegDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}
function al1Heavy(e, fill) { // a heavy hit's effects: one Shell layer off, Poise up by fill (1 = a stagger)
  if (!e || e.dead) return;
  const c = fightCd(e);
  if (c.def === 'shell' && c.layers > 0) {
    c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; if (typeof fst === 'function') fst().layers++;
    ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3);
  }
  if (fill) { c.bars.force += fill; c.barQuietT.force = 0; if (c.bars.force >= 1) { c.bars.force = 0; fightPayoff(e, 'stagger', { raw: 0 }, {}); } }
}
const al1Moving = () => { const p = G.player; return Math.hypot(p.vx || 0, p.vy || 0) > 20; };
// Waves: the first 10 s of the wave. Outside the dish (a race, a level) the first 10 s of every minute stand in for it.
const al1Early = () => (G.wave && G.wave.n > 0 ? G.wave.active && G.wave.t < 10 : (G.t % 60) < 10);

// ================================================================ RED FLAGSHIP
// How long the beam has held its target. Called from the fire hook (a beam tick). Fires al1Switch when the hold breaks.
function al1Hold(w, tgt) {
  const f = al1F(w), old = f.hTgt;
  if (old !== tgt || G.t - (f.hLast || 0) > 1.6 || (old && old.dead)) {
    if (old) al1Switch(w, old, tgt);
    f.hTgt = tgt; f.hT0 = G.t; f.hold = 0;
  }
  f.hLast = G.t; f.hold = G.t - f.hT0;
  return f.hold;
}
function al1Switch(w, old, tgt) { // the hold ended: Rug Pull dumps the pump, Breakthrough only carries across a kill
  const f = al1F(w), lost = G.t - (f.hLast || 0) > 1.6;
  if (f.rug && !old.dead && old.al1pump > 0) { al1Burst(w, old, 0); al1Mark(w, 'rug'); al1Say('rug', old.x, old.y - old.r - 12, al1T('al_rf_rug_float'), al1Yel, 12, 0.8); }
  if (!old.dead || lost) f.stack = 0;
}
// The beam's held target, if it held it just now.
const al1Held = w => { const f = w.al1; return f && f.hTgt && !f.hTgt.dead && G.t - (f.hLast || 0) < 0.4 ? f.hTgt : null; };
// Life Coach: how many bonus steps (1, or up to 3 with Breakthrough) the held target carries.
const al1CoachN = w => { const f = w.al1; return f && f.p === 'B' && al1Held(w) ? 1 + (f.breakthrough ? Math.min(2, f.stack || 0) : 0) : 0; };
const al1CoachW = () => (G && G.weapons ? G.weapons.find(w => w && w.al1 && w.al1.p === 'B' && w.al1.inst && w24Key(w) === AL1.RF) : null);

function al1RfStats(w, s) {
  const f = al1F(w);
  if (f.vision) s.range *= 1.4;
}
function al1RfDmg(w, e, src) {
  if (src.wupEcho) return 1;
  const f = al1F(w); let k = 1;
  if (f.p === 'A') { k *= 1 + AL1.grindMax * (f.grind || 0); if (f.club && al1Early()) k *= 2; }
  return k;
}
function al1RfFire(w, t, src) {
  const f = al1F(w), p = G.player; al1Hold(w, t);
  if (f.p === 'A' && f.rise && !(f.riseT > G.t)) { // Rise and Grind: a ghost of the beam stays where it was
    f.riseT = G.t + 0.5; const a = Math.atan2(t.y - p.y, t.x - p.x), L = Math.min(w.s.range, al1Dist(t, p) + 10);
    (f.ghosts || (f.ghosts = [])).push({ x1: p.x, y1: p.y, x2: p.x + Math.cos(a) * L, y2: p.y + Math.sin(a) * L, life: 2, zt: 0 });
    while (f.ghosts.length > 5) f.ghosts.shift();
    ring(p.x, p.y, 16, al1Yel, 0.3, 2);
  }
  if (f.sigma && (f.grind || 0) >= 1) { // Sigma: at full climb the beam forks onto a second target
    let best = null, bd = 260 * 260;
    forNear(t.x, t.y, 260, (o, d2) => { if (o !== t && !o.dead && !o.charmed && !o.egg && d2 < bd) { bd = d2; best = o; } return false; });
    if (best) {
      damageEnemy(best, w.s.dmg, Object.assign(weaponSrc(w), { atk: 'beam', wname: 'Sigma' }));
      al1Line(t.x, t.y, best.x, best.y, 5, al1Pale, 0.12); al1Mark(w, 'fork');
    }
  }
  return false; // (the beam still fires as it always did)
}
function al1RfHit(w, e, res, src) {
  const f = al1F(w);
  if (f.p === 'A' && f.plunge && e === f.hTgt) { // Cold Plunge: the held target slows 40% (bosses 20%)
    e.chill = Math.max(e.chill || 0, 0.6); e.chillAmt = Math.max(e.chillAmt || 0, e.boss ? 0.2 : 0.4);
    if (!(e.al1plT > G.realT)) { e.al1plT = G.realT + 0.6; ring(e.x, e.y, e.r + 6, '#9fd8ff', 0.3, 2); } al1Mark(w, 'plunge');
  }
  if (f.p === 'C') al1PumpAdd(w, e, (res && (res.raw || res.toHp)) || w.s.dmg);
}
function al1RfTick(w, dt) {
  const f = al1F(w), p = G.player;
  if (f.p === 'A' || f.sigma) { // the climb: 3 s of swimming for the full +60%, gone after 1 s still
    if (al1Moving()) { f.still = 0; f.grind = Math.min(1, (f.grind || 0) + dt / AL1.climbT); if (f.grind > 0.999) f.grind = 1; }
    else { f.still = (f.still || 0) + dt; if (f.still >= 1 && f.grind) { f.grind = 0; ring(p.x, p.y, 18, '#8a959a', 0.3, 2); } }
  }
  if (f.club) { const on = al1Early(); if (on && !f.clubOn) { ring(p.x, p.y, 40, al1Yel, 0.5, 3); al1Mark(w, 'club'); } f.clubOn = on; }
  if (f.ghosts && f.ghosts.length) { // Rise and Grind: the trail zaps
    const src = al1Src(w, 'beam');
    for (const g of f.ghosts) {
      g.life -= dt; g.zt -= dt;
      if (!(g.dT > G.realT)) { g.dT = G.realT + 0.1; al1Line(g.x1, g.y1, g.x2, g.y2, 3, al1Yel, 0.14); }
      if (g.zt <= 0) { g.zt = 0.3; for (const e of G.enemies) if (!e.dead && !e.charmed && !e.egg && al1SegDist(e.x, e.y, g.x1, g.y1, g.x2, g.y2) <= e.r + 8) { damageEnemy(e, w.s.dmg * 2, src); al1Mark(w, 'trail'); } }
    }
    f.ghosts = f.ghosts.filter(g => g.life > 0);
  }
  const held = al1Held(w);
  if (f.p === 'B' && held) {
    if (f.partner && G.t >= (f.partT || 0)) { // Accountability Partner: a Force heavy hit every 3 s
      f.partT = G.t + 3;
      damageEnemy(held, w.s.dmg * 8, al1Src(w, 'proj', { elem: 'phys', wname: 'Accountability' })); al1Heavy(held, 0.5);
      ring(held.x, held.y, held.r + 12, '#ffffff', 0.35, 5); al1Mark(w, 'partner'); al1Say('partner', held.x, held.y - held.r - 14, al1T('al_rf_partner_float'), '#ffffff', 12, 1);
    }
    if (f.toxic) healPlayer(G.P.maxHp * 0.01 * dt, true); // Toxic Positivity
    if (f.toxic) al1Mark(w, 'toxic');
  }
  if (f.p === 'C') al1CrTick(w, dt);
}
// ---- Crypto Bro: the pump
function al1PumpAdd(w, e, dealt) {
  if (!e || e.dead || e.egg) return;
  const f = al1F(w), cap = w.s.dmg * 60;
  if (!(e.al1pump > 0)) { e.al1pt0 = G.t; (f.pumped || (f.pumped = [])).push(e); if (f.pumped.length > 40) f.pumped.shift(); }
  e.al1pump = Math.min(cap, (e.al1pump || 0) + dealt * 0.5); e.al1pLast = G.t; e.al1pw = w; al1Mark(w, 'pump');
}
function al1PumpedList(w) { const f = al1F(w); f.pumped = (f.pumped || []).filter(e => !e.dead && e.al1pump > 0); return f.pumped; }
// The burst: the pump lands on the enemies round e (never on e itself). depth bounds To the Moon's chain.
function al1Burst(w, e, depth) {
  const f = al1F(w); let amt = e.al1pump || 0; if (amt <= 0) return;
  if (f.hodl) amt *= Math.min(3, 1 + (G.t - (e.al1pt0 || G.t)) * 0.15); // HODL: the burst grows with the hold
  e.al1pump = 0;
  const src = al1Src(w, 'burst', { wname: 'Pump burst' }), near = [];
  forNear(e.x, e.y, AL1.burstR, o => { if (o !== e && !o.dead && !o.charmed && !o.egg) near.push(o); return false; });
  for (const o of near.slice(0, 10)) { damageEnemy(o, amt, src); al1Line(e.x, e.y, o.x, o.y, 3, al1Yel, 0.18); }
  ring(e.x, e.y, AL1.burstR, al1Yel, 0.4, 4); fxParts('spark', e.x, e.y, al1Yel, 10, 170, 0.4, 3);
  al1Say('burst', e.x, e.y - e.r - 12, al1T('al_rf_burst_float'), al1Yel, 12, 0.8); al1Mark(w, 'burst');
  for (const fn of AL1.onPumpBurst) fn(w, e);
  if (f.moon && depth < 4) { // To the Moon: the burst chains to the next pumped enemy
    let nx = null, bd = 320 * 320;
    for (const o of al1PumpedList(w)) { if (o === e) continue; const d2 = (o.x - e.x) ** 2 + (o.y - e.y) ** 2; if (d2 < bd) { bd = d2; nx = o; } }
    if (nx) { al1Line(e.x, e.y, nx.x, nx.y, 6, '#ffffff', 0.25); al1Mark(w, 'moon'); al1Burst(w, nx, depth + 1); }
  }
}
function al1CrTick(w, dt) {
  const f = al1F(w), p = G.player;
  for (const e of al1PumpedList(w)) {
    if (!f.hodl && G.t - (e.al1pLast || 0) > 2) { e.al1pump *= Math.max(0, 1 - 0.6 * dt); if (e.al1pump < 0.5) { e.al1pump = 0; continue; } } // a pump nobody feeds fades
    if (!(e.al1pipT > G.realT) && G.fx.length < 220) { e.al1pipT = G.realT + 0.4; ring(e.x, e.y - e.r - 8, 3 + Math.min(5, e.al1pump / (w.s.dmg * 10)), al1Yel, 0.35, 2); }
  }
  const T = G.al1tok; // NFT tokens drift to you and pay out stamina
  if (T && T.length) {
    for (const k of T) {
      k.age += dt; const dx = p.x - k.x, dy = p.y - k.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, (60 + k.age * 140) * dt);
      k.x += dx / d * st; k.y += dy / d * st;
      if (!(k.fxT > G.realT)) { k.fxT = G.realT + 0.12; G.fx.push({ type: 'flash', x: k.x, y: k.y, r: 8, color: al1Yel, life: 0.14, max: 0.14 }); }
      if (d < p.r + 14) { k.got = true; if (G.stam) G.stam.cur = Math.min(stamMax(), G.stam.cur + 5); ring(p.x, p.y, 24, al1Yel, 0.3, 3); al1Mark(w, 'tokenpaid'); }
      if (k.age > 10) k.got = true;
    }
    G.al1tok = T.filter(k => !k.got);
  }
}
// A pumped enemy died, whoever killed it: the pump bursts on its neighbours; NFT drops a token.
hookOn('kill', 'alpha1:kill', (e, src) => {
  if (!G) return;
  for (const w of G.weapons) {
    if (!w || !w.al1) continue;
    const f = w.al1;
    if (f.p === 'B' && f.breakthrough && e === f.hTgt) f.stack = Math.min(2, (f.stack || 0) + 1); // Breakthrough: the bonus carries to the next target
    if (f.p === 'C' && e.al1pump > 0 && e.al1pw === w) {
      if (f.nft) { (G.al1tok || (G.al1tok = [])).push({ x: e.x, y: e.y, age: 0 }); al1Mark(w, 'token'); al1Say('nft', e.x, e.y - e.r - 24, al1T('al_rf_nft_float'), al1Yel, 12, 0.8); }
      al1Burst(w, e, 0);
    }
    if (f.ss && f.complicated) f.cmp = Math.min(2, (f.cmp || 0) + 0.04);
  }
});
// Life Coach: your other weapons hit the held target 20% harder (a step per Breakthrough stack); and fire 15% faster.
hookOn('dmgMul', 'alpha1:coach', (e, src) => {
  const cw = al1CoachW(); if (!cw || !src || !src.w || src.w === cw || src.w.isSpell) return 1;
  const n = al1CoachN(cw); return n && e === cw.al1.hTgt ? 1 + 0.2 * n : 1;
});
if (typeof rateBonus === 'function') {
  const al1Rate0 = rateBonus;
  rateBonus = function () {
    let k = al1Rate0();
    const cw = al1CoachW(), cur = typeof AIMAT !== 'undefined' ? AIMAT.w : null;
    if (cw && cur && cur !== cw && !cur.isSpell) { const n = al1CoachN(cw); if (n) k *= 1 + 0.15 * n; }
    return k;
  };
}
function al1RfInstall(w) {
  const f = al1F(w); if (f.inst) return; f.inst = 1;
  wupOn(w, 'stats', al1RfStats); wupOn(w, 'fire', al1RfFire); wupOn(w, 'dmg', al1RfDmg); wupOn(w, 'hit', al1RfHit); wupOn(w, 'tick', al1RfTick);
}

// ================================================================ SOULMATE SIGNAL
const al1Twin = w => (w && w.twins && w.twins[0]) || null;
{ // the twin: gone while the tether is off (Ghosting), dashing (Pull Up); the tether: gone while off, with a third side (Soulmates)
  const tp0 = twinPoints;
  twinPoints = function (w) {
    const pts = tp0(w), f = w && w.al1;
    if (!f || !f.ss) return pts;
    if (f.off && f.ghost) return [];
    if (f.pu && f.pu.on && pts.length) pts[0] = f.pu.pos;
    return pts;
  };
  const ts0 = twinSegs;
  twinSegs = function (w) {
    const f = w && w.al1;
    if (!f || !f.ss) return ts0(w);
    if (f.off) return [];
    const segs = ts0(w);
    if (f.tri && w.twins && w.twins.length >= 2) segs.push([w.twins[0], w.twins[1]]);
    return segs;
  };
}
function al1SsStats(w, s) {
  const f = al1F(w);
  if (f.tri) s.count = Math.min(5, s.count + 1); // Soulmates
}
function al1SsDmg(w, e, src) {
  if (src.wupEcho) return 1;
  const f = al1F(w), p = G.player; let k = 1;
  if (f.p === 'B' && src.wname === 'Twin Telepathy') k *= 2.2; // the tether hits 2.2 times as hard (it is on half the time)
  if (f.p === 'C') { const t = al1Twin(w); if (t) k *= 1 + 0.6 * Math.max(0, Math.min(1, (120 - al1Dist(p, t)) / 120)); } // up to +60% within 120
  return k;
}
const al1Others = w => G.weapons.filter(o => o && o !== w && !o.isSpell && o.def);
function al1SsHit(w, e, res, src) {
  const f = al1F(w);
  if (f.p === 'C' && f.outfits && !(e.al1moT > G.t)) { // Matching Outfits: the twin's hit carries another weapon's status
    const os = al1Others(w).filter(o => (o.s.elem || o.def.elem) !== 'shock');
    if (os.length) {
      e.al1moT = G.t + 0.5; const o = os[Math.floor(Math.random() * os.length)], el = o.s.elem || o.def.elem;
      fightStatus(e, el, (res && (res.raw || res.toHp)) || w.s.dmg, Object.assign({}, src, { elem: el })); al1Mark(w, 'outfitsA');
    }
  }
}
function al1FlickOn(w) {
  const f = al1F(w), p = G.player, s = w.s;
  if (f.ghost) { // Ghosting: it reappears behind the crowd
    let n = 0, cx = 0, cy = 0;
    forNear(p.x, p.y, s.range * 0.6, e => { if (!e.dead && !e.charmed && !e.egg) { cx += e.x; cy += e.y; n++; } return false; });
    if (n) {
      cx /= n; cy /= n; const d = al1Dist({ x: cx, y: cy }, p) || 1, L = Math.min(d + 110, s.range * 0.95), ux = (cx - p.x) / d, uy = (cy - p.y) / d;
      w.anchor = { x: p.x + ux * L / 2, y: p.y + uy * L / 2 }; w.twins = twinPoints(w); al1Mark(w, 'ghost');
      const t = al1Twin(w); if (t) ring(t.x, t.y, 20, al1Yel, 0.35, 3);
    }
  }
  const t = al1Twin(w);
  if (f.crumbs && t) { // Breadcrumbing: Static crumbs along the tether
    for (let i = 1; i <= 3 && G.zones.length < 140; i++) {
      const k = i / 4, x = p.x + (t.x - p.x) * k, y = p.y + (t.y - p.y) * k;
      G.zones.push({ x, y, r: 26, life: 4, max: 4, dps: s.dmg * 0.8, elem: 'shock', pull: 0, color: al1Yel, tick: 0, src: al1Src(w, 'pool', { zoneHit: true, wname: 'Breadcrumbs' }) });
    }
    al1Mark(w, 'crumbs');
  }
  if (f.redflag && Math.random() < AL1.redFlagP) { // Red Flag: the tether sometimes turns on you (a small sting, never lethal)
    p.hp = Math.max(1, p.hp - Math.max(1, G.P.maxHp * 0.02)); p.flash = 0.15;
    al1Line(p.x, p.y, t ? t.x : p.x + 40, t ? t.y : p.y, 6, '#ff4d6d', 0.25); al1Mark(w, 'redflag');
    al1Say('redflag', p.x, p.y - 30, al1T('al_ss_redflag_float'), '#ff4d6d', 12, 0.8);
  }
}
function al1SsTick(w, dt) {
  const f = al1F(w), p = G.player, s = w.s;
  if (!w.twins) return;
  const T = w.twins;
  if (f.p === 'A') {
    if (f.pu) al1PullUp(w, dt);
    for (const b of G.ebul) { // Wingman: fire within 120 of the twin is drawn into it
      if (b.dead) continue;
      if (!b.al1w) { let near = null; for (const t of T) if (Math.hypot(b.x - t.x, b.y - t.y) < AL1.drawR) { near = t; break; } if (!near) continue; b.al1w = 1; if (f.hype && b.owner && !b.owner.dead) { b.owner.chargeT = Math.max(b.owner.chargeT || 0, G.t + 3); al1Mark(w, 'hype'); } al1Mark(w, 'drawn'); }
      let tt = T[0], bd = 1e18; for (const t of T) { const d2 = (b.x - t.x) ** 2 + (b.y - t.y) ** 2; if (d2 < bd) { bd = d2; tt = t; } }
      if (!tt) continue;
      const sp = Math.hypot(b.vx, b.vy) || 200, d = Math.sqrt(bd) || 1;
      if (d < 16 + (b.r || 4)) { b.dead = true; ring(tt.x, tt.y, 14, al1Pale, 0.25, 2); continue; }
      b.vx = (tt.x - b.x) / d * sp; b.vy = (tt.y - b.y) / d * sp;
    }
    if (f.hype && !(f.hypeT > G.t)) { // enemies that reach the twin are Charged
      f.hypeT = G.t + 0.3;
      for (const t of T) forNear(t.x, t.y, 20, e => { if (!e.dead && !e.egg && !e.charmed) { e.chargeT = Math.max(e.chargeT || 0, G.t + 3); al1Mark(w, 'hype'); } return false; });
    }
  }
  if (f.p === 'B') {
    const speed = 1 + (f.cmp || 0); f.flT = (f.flT == null ? 1 : f.flT) - dt * speed;
    if (f.complicated && f.cmp) f.cmp = Math.max(0, f.cmp - 0.03 * dt); // (the flicker calms down again if nothing dies)
    if (f.flT <= 0) { f.flT = 1; f.off = !f.off; if (f.off) al1Mark(w, 'off'); else { al1Mark(w, 'on'); al1FlickOn(w); } }
  }
  if (f.p === 'C' && T[0]) {
    const t = T[0], d = al1Dist(p, t);
    if (f.therapy && d < p.r + 16 && !(f.thT > G.t)) { f.thT = G.t + 2; healPlayer(G.P.maxHp * 0.02); ring(p.x, p.y, 22, '#ff9ecb', 0.35, 3); al1Mark(w, 'therapy'); }
    if (f.pda && d < 22 && !(f.pdaT > G.t)) { // PDA: swimming through the twin sends out a Force pulse
      f.pdaT = G.t + 1.5; aoe(t.x, t.y, 90, s.dmg * 4, al1Src(w, 'burst', { elem: 'phys', wname: 'PDA' }), '#ffffff'); al1Mark(w, 'pda');
      al1Say('pda', t.x, t.y - 24, al1T('al_ss_pda_float'), '#ffffff', 12, 0.8);
    }
  }
}
// Pull Up: every 10 s the twin dashes to the nearest Elite for 3.5 s.
function al1PullUp(w, dt) {
  const f = al1F(w), p = G.player, P = f.pu, t0 = al1Twin(w);
  if (!P.on) {
    if (G.t < (P.cd || 0) || !t0) return;
    const el = acquire('elite', 900, p.x, p.y);
    if (!el || !al1Elite(el)) return;
    P.on = true; P.tgt = el; P.t = 3.5; P.cd = G.t + 10; P.pos = { x: t0.x, y: t0.y };
    al1Mark(w, 'pullup'); al1Say('pullup', p.x, p.y - 36, al1T('al_ss_pullup_float'), al1Yel, 13, 1);
    return;
  }
  P.t -= dt;
  if (P.t <= 0 || !P.tgt || P.tgt.dead) { P.on = false; P.pos = null; return; }
  const dx = P.tgt.x - P.pos.x, dy = P.tgt.y - P.pos.y, d = Math.hypot(dx, dy) || 1, m = Math.min(d, 520 * dt);
  P.pos.x += dx / d * m; P.pos.y += dy / d * m;
  const px = P.pos.x - p.x, py = P.pos.y - p.y, pd = Math.hypot(px, py), lim = w.s.range * 0.98;
  if (pd > lim) { P.pos.x = p.x + px / pd * lim; P.pos.y = p.y + py / pd * lim; }
  if (!(P.fxT > G.realT)) { P.fxT = G.realT + 0.15; ring(P.pos.x, P.pos.y, 16, al1Yel, 0.3, 3); }
}
// Bro Code: when you are hit, you and the twin trade places (6 s).
function al1Swap(w) {
  const f = al1F(w), p = G.player, t = al1Twin(w);
  if (!t || G.t < (f.broT || 0)) return false;
  if (Math.hypot(t.x - G.core.x, t.y - G.core.y) >= CORE.arena - 60) return false;
  const from = { x: p.x, y: p.y };
  f.broT = G.t + 6; p.x = t.x; p.y = t.y; p.iframes = Math.max(p.iframes || 0, 0.5);
  bolt(from.x, from.y, p.x, p.y, w.def.color, 0.3); ring(p.x, p.y, 26, al1Yel, 0.4, 4); al1Mark(w, 'bro');
  al1Say('bro', p.x, p.y - 32, al1T('al_ss_bro_float'), al1Yel, 13, 1);
  return true;
}
hookOn('hurt', 'alpha1:bro', () => {
  if (!G) return;
  for (const w of G.weapons) if (w && w.al1 && w.al1.ss && w.al1.bro) { if (al1Swap(w)) break; }
});
// Matching Outfits, the other way: your hits Charge (Static is the twin's status).
hookOn('proc', 'alpha1:outfits', (e, dmg, src) => {
  if (!G || !src || !src.w || src.w.isSpell || !e || e.dead) return;
  const tw = al1W(AL1.SS); if (!tw || !tw.al1 || !tw.al1.outfits || src.w === tw) return;
  if (!(e.chargeT > G.t + 1.5)) { e.chargeT = Math.max(e.chargeT || 0, G.t + 3); al1Mark(tw, 'outfitsB'); }
});
// Ride or Die: when Unwanted Contact fires, the twin fires one too, from its own end.
hookOn('fire:after', 'alpha1:ride', (w, target) => {
  if (!G || !w || w._al1ride || w.isSpell || w24Key(w) !== 's_tesla') return;
  const tw = al1W(AL1.SS); if (!tw || !tw.al1 || !tw.al1.ride) return;
  const t = al1Twin(tw); if (!t) return;
  const e = acquire('nearest', w.s.range, t.x, t.y); if (!e) return;
  w._al1ride = 1;
  try {
    doChain(t.x, t.y, e, w.s.dmg, Math.max(1, w.s.chain || 3), w.s.jump || 140, Object.assign(weaponSrc(w), { wname: 'Ride or Die' }));
    al1Mark(tw, 'ride'); al1Say('ride', t.x, t.y - 20, al1T('al_ss_ride_float'), al1Yel, 12, 1);
  } finally { w._al1ride = 0; }
});
function al1SsInstall(w) {
  const f = al1F(w); if (f.inst) return; f.inst = 1; f.ss = 1;
  wupOn(w, 'stats', al1SsStats); wupOn(w, 'dmg', al1SsDmg); wupOn(w, 'hit', al1SsHit); wupOn(w, 'tick', al1SsTick);
}

// ================================================================ the cards
(function () {
  const C = (name, desc, apply) => ({ name, desc, apply });
  const flag = (inst, k) => w => { inst(w); al1F(w)[k] = 1; };
  const P = (inst, k) => w => { inst(w); al1F(w).p = k; recomputeAll(); };
  const rf = k => flag(al1RfInstall, k), ss = k => flag(al1SsInstall, k);
  const T = al1T;
  wupRegFor('alpha', AL1.RF, {
    A: { name: 'Grindset', tag: T('al_rf_grind_tag'), costs: T('al_rf_grind_costs'), shows: '', modes: '',
      lv3: { desc: T('al_rf_grind_desc'), apply: P(al1RfInstall, 'A') },
      lv6: [C('4am Club', T('al_rf_4amclub_desc'), rf('club')), C('Cold Plunge', T('al_rf_coldplunge_desc'), rf('plunge'))],
      wild: C('Rise and Grind', T('al_rf_riseandgrind_desc'), rf('rise')) },
    B: { name: 'Life Coach', tag: T('al_rf_coach_tag'), costs: T('al_rf_coach_costs'), shows: '', modes: '',
      lv3: { desc: T('al_rf_coach_desc'), apply: P(al1RfInstall, 'B') },
      lv6: [C('Accountability Partner', T('al_rf_accountabilitypartner_desc'), rf('partner')), C('Vision Board', T('al_rf_visionboard_desc'), w => { al1RfInstall(w); al1F(w).vision = 1; recomputeAll(); })],
      wild: C('Toxic Positivity', T('al_rf_toxicpositivity_desc'), rf('toxic')) },
    C: { name: 'Crypto Bro', tag: T('al_rf_crypto_tag'), costs: T('al_rf_crypto_costs'), shows: '', modes: '',
      lv3: { desc: T('al_rf_crypto_desc'), apply: P(al1RfInstall, 'C') },
      lv6: [C('HODL', T('al_rf_hodl_desc'), rf('hodl')), C('Rug Pull', T('al_rf_rugpull_desc'), rf('rug'))],
      wild: C('NFT', T('al_rf_nft_desc'), rf('nft')) },
    lv10: [
      { name: 'Sigma', best: 'A', desc: T('al_rf_sigma_desc'), apply: rf('sigma') },
      { name: 'Breakthrough', best: 'B', desc: T('al_rf_breakthrough_desc'), apply: rf('breakthrough') },
      { name: 'To the Moon', best: 'C', desc: T('al_rf_tothemoon_desc'), apply: rf('moon') }] });
  wupRegFor('alpha', AL1.SS, {
    A: { name: 'Wingman', tag: T('al_ss_wing_tag'), costs: T('al_ss_wing_costs'), shows: '', modes: '',
      lv3: { desc: T('al_ss_wing_desc'), apply: P(al1SsInstall, 'A') },
      lv6: [C('Hype Man', T('al_ss_hypeman_desc'), ss('hype')), C('Bro Code', T('al_ss_brocode_desc'), ss('bro'))],
      wild: C('Pull Up', T('al_ss_pullup_desc'), w => { al1SsInstall(w); al1F(w).pu = { on: false, cd: 0 }; }) },
    B: { name: 'Situationship', tag: T('al_ss_situ_tag'), costs: T('al_ss_situ_costs'), shows: '', modes: '',
      lv3: { desc: T('al_ss_situ_desc'), apply: P(al1SsInstall, 'B') },
      lv6: [C('Ghosting', T('al_ss_ghosting_desc'), ss('ghost')), C('Breadcrumbing', T('al_ss_breadcrumbing_desc'), ss('crumbs'))],
      wild: C('Red Flag', T('al_ss_redflag_desc'), ss('redflag')) },
    C: { name: 'Power Couple', tag: T('al_ss_couple_tag'), costs: T('al_ss_couple_costs'), shows: '', modes: '',
      lv3: { desc: T('al_ss_couple_desc'), apply: P(al1SsInstall, 'C') },
      lv6: [C('Matching Outfits', T('al_ss_matchingoutfits_desc'), ss('outfits')), C('Couples Therapy', T('al_ss_couplestherapy_desc'), ss('therapy'))],
      wild: C('PDA', T('al_ss_pda_desc'), ss('pda')) },
    lv10: [
      { name: 'Ride or Die', best: 'A', desc: T('al_ss_rideordie_desc'), apply: ss('ride') },
      { name: "It's Complicated", best: 'B', desc: T('al_ss_itscomplicated_desc'), apply: w => { al1SsInstall(w); al1F(w).complicated = 1; } },
      { name: 'Soulmates', best: 'C', desc: T('al_ss_soulmates_desc'), apply: w => { al1SsInstall(w); al1F(w).tri = 1; recomputeAll(); } }] });
})();
