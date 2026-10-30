'use strict';
// Spawn Prawn - Beta reimagined, part 1: the A&E branches of Little Prick and One of These Days (BETA_REDESIGN.md, 30 Oct 2026).
// Beta-only: wupRegFor('beta', ...) (samplebranches.js), so every other sample keeps wup2.js / wup5.js's shared sets. Every branch
// pays off when Beta is low (hp < 40% of max: the Not Dead Yet line, be1Low) or brings it back from low.
//  - Little Prick (v_arcane_proj, prefix be_lp), behaviour through wupOn hooks on the slot (state in w.be1):
//      A IV Drip          a needle leaves a drip on what it hits (e.be1drip, 4 s, plus a Bleed if the hit gave none); while 3 or more
//                         enemies drip, you heal 1% a second. Lv 6: Saline Bag (the heal doubles while low), Cannula (pierce +1).
//                         Wild: Air Bubble (a needle landing on a dripping enemy sometimes pops it: Blood burst, radius 60).
//                         Mastery: Drip Feed (healing past full becomes a shield, at most 20%: G.be1.shield, taken off hits in hurt:before).
//      B Adrenaline Shot  fire rate +80% at 10% health, nothing at full (a rateBonus wrapper that reads AIMAT.w). Lv 6: Epinephrine
//                         (dropping below 40% gives 3 s of double fire rate, 20 s cooldown), Racing Heart (while low each needle that
//                         lands adds 2% swim speed for 2 s, to 20%: a mutSpeed wrapper). Wild: Overdose (needles 15%
//                         weaker at full health). Mastery: Crash Cart (once a wave a hit that would kill leaves you on 1 and fires a
//                         ring of 16 needles: hurt:late, before the death check).
//      C Blood Draw       a needle that lands on a Bleeding enemy fills a vial (w.be1.vials, 0 to 10); at 10 the next needle is a heavy
//                         hit (x4, strips a Shell layer, half a Poise bar) that heals 3%. Lv 6: Phlebotomist (Elites and bosses fill 2),
//                         Butterfly Needle (the heavy needle pierces everything). Wild: Squeamish (enemies within 100 of a heavy needle's
//                         hit flee for 1 s). Mastery: Blood Bank (a full vial is stored instead, up to 3: w.be1.stored; dropping below
//                         40% fires them all at once at the nearest enemies).
//  - One of These Days (s_duedate, prefix be_dd): the mark is e.due (toys.js), its payout is duePop, wrapped here (after wup5.js's wrap)
//    so the slot's payout can be scaled (s.repeat and s.dmg x M), topped up, repeated, spread or finished.
//      A Flatline         the payout grows as health falls: +150% at 10%. Lv 6: Code Blue (low at a payout: the strongest unmarked enemy
//                         in reach is marked at once), Heart Monitor (countdowns run 40% faster while low). Wild: Beep (each second of a
//                         countdown, a Blood pulse of radius 50 round the marked enemy). Mastery: Time of Death (a mark under 25% health
//                         at its payout dies outright; bosses take x3 instead).
//      B DNR              while a mark is up you cannot heal (a healPlayer wrapper, plus a per-frame guard on direct regeneration); payout
//                         x2.5. Lv 6: Living Will (the blocked healing, x3, is added to the payout), Last Rites (the payout makes
//                         everything within 120 Bleed). Wild: Paperwork (25%: a payout is paid twice). Mastery: Organ Harvest (a payout
//                         that kills splits its damage over the 3 nearest enemies).
//      C Triage           marks go on the 3 most wounded enemies (fire hook), countdown halved, payout x0.4. Lv 6: Waiting Room (marked
//                         enemies slowed 30%), Walk-in Clinic (a kill by a payout heals 2%). Wild: Wrong Patient (15% of the time a mark
//                         lands on you, f.self, and heals 5% when it pays out). Mastery: Mass Casualty (up to 5 marks; on any branch it
//                         caps the marks at 5).
//  State other files may read (betalook.js costumes): w.be1.p (branch letter), .dripN, .vials, .armed, .stored, .rh (Racing Heart), .epiT,
//  .marksN, .self; G.be1.shield (Drip Feed's shield, in health points).
//  Simplified: Epinephrine doubles Little Prick's own fire rate (not every weapon's); "dripping" is a 4 s timer on the enemy, separate from
//  the Bleed stacks; Heart Monitor drains the countdown (end -= 0.4 dt); Time of Death kills with killEnemy; Squeamish uses fearT (bosses
//  are not scared); Wrong Patient's mark on you is a countdown ring, not a drawn calendar. Copy: every card, tag, cost and float text is
//  TODO_COPY:<id> via be1T (the user writes it, betacopy.js holds it); names are the drafted ones.
// Hooks: wupRegFor (samplebranches.js), wupOn; hookOn('hurt:before' / 'hurt:late' / 'fire:after'); wraps rateBonus (arsenal.js), mutSpeed
// (mutations.js), healPlayer (game.js) and duePop (toys.js). Loads after samplebranches.js and alpha1.js.

const BE1 = { LP: 'v_arcane_proj', DD: 's_duedate', lowFrac: 0.4, bubbleP: 0.15, wrongP: 0.15, paperP: 0.25, epiCd: 20, epiDur: 3, dripLife: 4 };
const be1T = id => (typeof BETA_COPY !== 'undefined' && BETA_COPY[id]) || 'TODO_COPY:' + id; // (copy is looked up by id once the user's text exists)
const be1F = w => w.be1 || (w.be1 = {});
const be1G = () => G.be1 || (G.be1 = { shield: 0 });
const be1Slot = key => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === key) : null);
const be1Has = k => !!(G && G.weapons && G.weapons.some(w => w && w.be1 && w.be1[k]));
const be1Low = () => !!(G && G.player && G.P && G.player.hp < G.P.maxHp * BE1.lowFrac);
const be1Need = () => clamp((1 - G.player.hp / G.P.maxHp) / 0.9, 0, 1); // 0 at full health, 1 at 10% health
const be1Dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const be1Red = '#e63950', be1Pale = '#ffd6dc', be1Grn = '#7fe0b5';
const be1Say_ = {};
function be1Say(key, x, y, txt, color, size, gap) { if ((be1Say_[key] || 0) > G.realT) return; be1Say_[key] = G.realT + (gap || 0.6); floatText(x, y, txt, color, size || 12, 0.8); }
function be1Mark(w, k) { const f = be1F(w); (f.fx || (f.fx = {}))[k] = ((f.fx || {})[k] || 0) + 1; } // (a counter per card, so the test can see it work)
function be1Src(w, atk, extra) { return Object.assign({ elem: 'arcane', w, atk, wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name }, extra); }
function be1Bleed(e, dps, by) { if (!e || e.dead || e.egg) return; const b = e.bleeds || (e.bleeds = []); if (b.length >= 3) b.shift(); b.push({ dps, t: 3, by: by || 'Bleed' }); }
function be1Heavy(e, w, fill) { // a heavy hit's effects: one Shell layer off, Poise up by fill (1 = a stagger)
  if (!e || e.dead) return;
  const c = fightCd(e);
  if (c.def === 'shell' && c.layers > 0) {
    c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; if (typeof fst === 'function') fst().layers++;
    ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3);
  }
  if (fill) { c.bars.force += fill; c.barQuietT.force = 0; if (c.bars.force >= 1) { c.bars.force = 0; fightPayoff(e, 'stagger', { raw: 0 }, {}); } }
}
// Waves: the wave number. Outside the dish (a race, a level) every minute stands in for a wave.
const be1WaveKey = () => (G.wave && G.wave.n > 0 ? 'w' + G.wave.n : 'm' + Math.floor(G.t / 60));
const be1Marks = w => { const out = []; if (G && G.toy) for (const e of G.toy.marks) if (e.due && e.due.w === w && !e.dead && !out.includes(e)) out.push(e); return out; };

// ================================================================ LITTLE PRICK
function be1LpInstall(w) {
  const f = be1F(w); if (f.inst) return; f.inst = 1; f.lp = 1;
  wupOn(w, 'stats', be1LpStats); wupOn(w, 'dmg', be1LpDmg); wupOn(w, 'hit', be1LpHit); wupOn(w, 'tick', be1LpTick);
}
function be1LpStats(w, s) { const f = be1F(w); if (f.cannula) s.pierce = (s.pierce || 0) + 1; }
function be1LpDmg(w, e, src) {
  if (src.wupEcho) return 1;
  const f = be1F(w);
  if (f.overdose && G.player.hp >= G.P.maxHp - 0.001) { be1Mark(w, 'overdose'); return 0.85; } // a joke cost: full health makes the needles weaker
  return 1;
}
function be1Tag(w, pr) { // this needle is a heavy one
  const f = be1F(w); f.hid = (f.hid || 0) + 1;
  pr.dmg *= 4; pr.r *= 1.6; pr.be1heavy = 1; pr.color = '#ffffff';
  if (f.butterfly) pr.pierce = 99;
  pr.src = Object.assign({}, pr.src, { be1heavy: 1, be1id: f.hid });
}
function be1HeavyLand(w, e, src) {
  const f = be1F(w), H = f.healed || (f.healed = new Set());
  be1Heavy(e, w, 0.5); ring(e.x, e.y, e.r + 14, '#ffffff', 0.3, 6); cam.shake = Math.min(8, cam.shake + 2); be1Mark(w, 'heavyhit');
  if (!H.has(src.be1id)) { // the heavy needle heals 3%, once
    if (H.size > 60) H.clear(); H.add(src.be1id);
    healPlayer(G.P.maxHp * 0.03, true); be1Mark(w, 'heavyheal');
    be1Say('heavy', G.player.x, G.player.y - 30, be1T('be_lp_heavy_float'), be1Red, 13, 0.6);
  }
  if (f.squeam) { // Squeamish: the crowd round it flees for 1 s
    forNear(e.x, e.y, 100, o => { if (o !== e && !o.dead && !o.boss && !o.egg && !o.charmed) { o.fearT = Math.max(o.fearT || 0, G.t + 1); be1Mark(w, 'squeam'); } });
    ring(e.x, e.y, 100, be1Pale, 0.3, 3); be1Say('squeam', e.x, e.y - e.r - 16, be1T('be_lp_squeamish_float'), be1Pale, 12, 0.8);
  }
}
function be1LpHit(w, e, res, src) {
  const f = be1F(w);
  if (src.be1heavy) { be1HeavyLand(w, e, src); return; }
  if (f.iv && !e.egg) { // IV Drip: it leaves a drip, and a Bleed if the hit gave none
    const was = e.be1drip > G.t;
    e.be1drip = G.t + BE1.dripLife; (f.drips || (f.drips = new Set())).add(e);
    if (!res || !res.statusOk) be1Bleed(e, (w.s.dmg * 0.3) / 3, w.def.name);
    be1Mark(w, 'drip');
    if (f.bubble && was && !e.dead && Math.random() < BE1.bubbleP) { // Air Bubble: a dripping enemy pops in a small Blood burst
      aoe(e.x, e.y, 60, w.s.dmg * 2, be1Src(w, 'burst', { wname: 'Air Bubble' }), be1Red);
      be1Mark(w, 'bubble'); be1Say('bubble', e.x, e.y - e.r - 14, be1T('be_lp_airbubble_float'), be1Pale, 12, 0.6);
    }
  }
  if (f.draw && e.bleeds && e.bleeds.length) { // Blood Draw: a needle that lands on a Bleeding enemy fills a vial
    const fill = f.phleb && (e.elite || e.rival || e.boss) ? 2 : 1;
    f.vials = (f.vials || 0) + fill;
    if (f.vials >= 10) {
      if (f.bank && !be1Low()) { if ((f.stored || 0) < 3) { f.stored = (f.stored || 0) + 1; f.vials = 0; be1Mark(w, 'stored'); } else f.vials = 10; }
      else if (!f.armed) { f.armed = true; f.vials = 0; be1Mark(w, 'armed'); }
      else f.vials = 10;
    }
    be1Mark(w, 'vial');
  }
  if (f.racing && be1Low()) { // Racing Heart: each needle is 2% more swim speed for 2 s, ten at most
    const L = f.rhL || (f.rhL = []); L.push(G.t + 2); if (L.length > 10) L.shift(); f.rh = 0.02 * L.length; be1Mark(w, 'racing');
  }
}
function be1LpTick(w, dt) {
  const f = be1F(w), p = G.player, low = be1Low();
  if (f.drips) { // IV Drip: with 3 or more dripping, you heal 1% a second
    let n = 0;
    for (const e of f.drips) { if (e.dead || !(e.be1drip > G.t)) f.drips.delete(e); else { n++; if (!(e.be1pipT > G.realT) && G.fx.length < 220) { e.be1pipT = G.realT + 0.5; ring(e.x, e.y - e.r - 6, 3, be1Red, 0.4, 2); } } }
    f.dripN = n;
    if (f.iv && n >= 3) { healPlayer(G.P.maxHp * 0.01 * dt * (f.saline && low ? 2 : 1), true); be1Mark(w, 'dripheal'); }
  } else f.dripN = 0;
  if (f.wasLow === undefined) f.wasLow = low;
  if (low && !f.wasLow) {
    if (f.epi && G.t >= (f.epiCd || 0)) { // Epinephrine: 3 s of double fire rate
      f.epiT = G.t + BE1.epiDur; f.epiCd = G.t + BE1.epiCd; ring(p.x, p.y, 34, be1Red, 0.5, 5); be1Mark(w, 'epi');
      be1Say('epi', p.x, p.y - 34, be1T('be_lp_epinephrine_float'), be1Red, 13, 1);
    }
    if (f.bank && (f.stored || 0) > 0) be1BankFire(w); // Blood Bank: the stored needles go at once
  }
  f.wasLow = low;
  if (f.rhL && f.rhL.length) { while (f.rhL.length && f.rhL[0] <= G.t) f.rhL.shift(); f.rh = 0.02 * f.rhL.length; } // Racing Heart: each needle's 2% lasts 2 s
}
function be1BankFire(w) {
  const f = be1F(w), p = G.player, n = f.stored || 0; f.stored = 0;
  const ts = acquireMany('nearest', w.s.range, p.x, p.y, Math.max(1, n));
  let made = 0;
  for (let i = 0; i < n; i++) {
    const t = ts.length ? ts[i % ts.length] : null, a = t ? Math.atan2(t.y - p.y, t.x - p.x) : Math.random() * Math.PI * 2;
    const pr = spawnProj(w, p.x, p.y, a, Object.assign(weaponSrc(w), { knock: 0 }), {});
    if (pr) { be1Tag(w, pr); made++; }
  }
  ring(p.x, p.y, 40, be1Red, 0.5, 6); be1Mark(w, 'bank'); be1Say('bank', p.x, p.y - 36, be1T('be_lp_bloodbank_float'), be1Red, 13, 1);
  return made;
}
// The next needle after a full vial is the heavy one.
hookOn('fire:after', 'beta1:heavy', (w, target, n0) => {
  if (!G || !w || w.isSpell || !w.be1 || !w.be1.lp || !w.be1.armed || w24Key(w) !== BE1.LP) return;
  for (let i = n0; i < G.proj.length; i++) {
    const pr = G.proj[i];
    if (pr && pr.w === w && !pr.dead && !pr.lob) { be1Tag(w, pr); w.be1.armed = false; be1Mark(w, 'heavy'); break; }
  }
});
// Adrenaline Shot and Epinephrine: Little Prick's fire rate.
if (typeof rateBonus === 'function') {
  const be1Rate0 = rateBonus;
  rateBonus = function () {
    let k = be1Rate0();
    const cur = typeof AIMAT !== 'undefined' ? AIMAT.w : null, f = cur && cur.be1;
    if (f && f.lp && !cur.isSpell && G && G.player && G.P) {
      if (f.p === 'B') k *= 1 + 0.8 * be1Need();
      if (f.epiT > G.t) k *= 2;
    }
    return k;
  };
}
// Racing Heart: swim speed.
if (typeof mutSpeed === 'function') {
  const be1Spd0 = mutSpeed;
  mutSpeed = function () {
    const k = be1Spd0(), w = G && G.weapons ? G.weapons.find(x => x && x.be1 && x.be1.rh > 0) : null;
    return w ? k * (1 + w.be1.rh) : k;
  };
}
// Crash Cart: the hit that would have killed you leaves you on 1 and fires a ring of 16 needles (once a wave).
hookOn('hurt:late', 'beta1:crash', () => {
  if (!G || !G.player || G.player.hp > 0) return;
  const w = G.weapons.find(x => x && x.be1 && x.be1.lp && x.be1.crash); if (!w) return;
  const g = be1G(), key = be1WaveKey(); if (g.crashKey === key) return;
  g.crashKey = key; const p = G.player;
  p.hp = 1; p.iframes = Math.max(p.iframes || 0, 1);
  for (let i = 0; i < 16; i++) spawnProj(w, p.x, p.y, (i / 16) * Math.PI * 2, Object.assign(weaponSrc(w), { knock: 0 }), {});
  ring(p.x, p.y, 60, '#ffffff', 0.5, 6); ring(p.x, p.y, 36, be1Red, 0.5, 4); cam.shake = Math.min(10, cam.shake + 4); be1Mark(w, 'crash');
  be1Say('crash', p.x, p.y - 38, be1T('be_lp_crashcart_float'), '#ffffff', 14, 1);
});

// ================================================================ HEALING: the DNR block and Drip Feed's shield
// One wrapper on healPlayer: a DNR mark up means nothing heals (what was blocked is kept for Living Will); healing past full becomes shield.
function be1Blocker() { const w = G && G.weapons ? G.weapons.find(x => x && x.be1 && x.be1.dd && x.be1.p === 'B') : null; return w && be1Marks(w).length ? w : null; }
if (typeof healPlayer === 'function') {
  const be1Heal0 = healPlayer;
  healPlayer = function (n, silent) {
    if (!G || !G.player || !G.P || !(n > 0)) return be1Heal0(n, silent);
    const p = G.player, amt = n * G.P.healMult, room = Math.max(0, G.P.maxHp - p.hp), blk = be1Blocker();
    if (blk) {
      blk.be1.blocked = (blk.be1.blocked || 0) + Math.min(amt, room); be1Mark(blk, 'blocked');
      if (amt >= 1) be1Say('blocked', p.x, p.y - 30, be1T('be_dd_dnr_float'), '#9aa4a8', 12, 1);
      return;
    }
    be1Heal0(n, silent);
    const over = amt - room;
    if (over > 0.01 && be1Has('dripfeed')) { // Drip Feed: healing past full health becomes a shield, at most 20%
      const g = be1G(), cap = G.P.maxHp * 0.2; g.shield = Math.min(cap, (g.shield || 0) + over);
      const w = G.weapons.find(x => x && x.be1 && x.be1.dripfeed); if (w) be1Mark(w, 'shield');
    }
  };
}
hookOn('hurt:before', 'beta1:shield', dmg => {
  const g = G && G.be1; if (!g || !(g.shield > 0) || !(dmg > 0)) return;
  const take = Math.min(g.shield, dmg); g.shield -= take;
  const w = G.weapons.find(x => x && x.be1 && x.be1.dripfeed); if (w) be1Mark(w, 'shieldtook');
  ring(G.player.x, G.player.y, G.player.r + 12, be1Pale, 0.3, 4);
  return dmg - take;
});

// ================================================================ ONE OF THESE DAYS
function be1DdInstall(w) {
  const f = be1F(w); if (f.inst) return; f.inst = 1; f.dd = 1;
  wupOn(w, 'stats', be1DdStats); wupOn(w, 'fire', be1DdFire); wupOn(w, 'tick', be1DdTick);
}
function be1DdStats(w, s) { const f = be1F(w); if (f.p === 'C') s.dur *= 0.5; }
// Triage (and Mass Casualty): the marks go where the wounded are; a card-set cap on how many are up.
function be1DdFire(w) {
  const f = be1F(w), p = G.player, s = w.s;
  if (f.p !== 'C' && !f.mass) return false;
  const cap = f.mass ? 5 : 3, mine = be1Marks(w);
  let need = cap - mine.length - (f.self ? 1 : 0);
  if (need <= 0) return true;
  if (f.p === 'C') {
    if (f.wrong && !f.self && Math.random() < BE1.wrongP) { // Wrong Patient: this one lands on you
      f.self = { end: G.t + s.dur, max: s.dur }; need--; be1Mark(w, 'wrongself');
      ring(p.x, p.y, p.r + 18, be1Grn, 0.5, 4); be1Say('wrong', p.x, p.y - 34, be1T('be_dd_wrong_float'), be1Grn, 13, 1);
    }
    const cands = G.enemies.filter(e => toyCan(e) && !e.due && be1Dist(e, p) <= s.range).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || be1Dist(a, p) - be1Dist(b, p));
    for (const e of cands.slice(0, Math.max(0, need))) { dueMark(w, e); be1Mark(w, 'triage'); }
  } else {
    for (const e of acquireMany(aimDir(w), s.range, p.x, p.y, need + 3).filter(q => !q.due).slice(0, need)) dueMark(w, e);
  }
  sfx('shot'); return true;
}
function be1DdTick(w, dt) {
  const f = be1F(w), p = G.player, low = be1Low(), marks = be1Marks(w);
  f.marksN = marks.length;
  for (const e of marks) {
    if (f.monitor && low) { e.due.end -= 0.4 * dt; be1Mark(w, 'monitor'); } // Heart Monitor: the countdown runs 40% faster
    if (f.waiting) { e.chill = Math.max(e.chill || 0, 0.3); e.chillAmt = Math.max(e.chillAmt || 0, 0.3); be1Mark(w, 'waiting'); } // Waiting Room: slowed 30%
    if (f.beep) { // Beep: each second of the countdown, a small Blood pulse round the marked enemy
      if (e.be1bT === undefined || e.be1bw !== w) { e.be1bT = G.t + 1; e.be1bw = w; }
      if (G.t >= e.be1bT) {
        e.be1bT += 1; ring(e.x, e.y, 50, be1Red, 0.3, 3);
        IN_AOE = true; forNear(e.x, e.y, 50, o => { if (o !== e && toyCan(o)) damageEnemy(o, w.s.dmg * 0.6, be1Src(w, 'burst', { wname: 'Beep' })); }); IN_AOE = false;
        be1Mark(w, 'beep');
      }
    }
  }
  if (f.p === 'B') { // DNR: nothing heals while a mark is up (direct regeneration is pulled back here; healPlayer is blocked in its wrapper)
    if (marks.length) {
      if (f.guard != null && p.hp > f.guard + 0.01) { f.blocked = (f.blocked || 0) + (p.hp - f.guard); p.hp = f.guard; be1Mark(w, 'guard'); } else f.guard = p.hp;
    } else { f.guard = null; f.blocked = 0; }
  }
  if (f.self) { // Wrong Patient: the mark on you pays out as a heal
    if (!(f.selfPipT > G.realT)) { f.selfPipT = G.realT + 0.5; ring(p.x, p.y, p.r + 10 + 10 * (1 - (f.self.end - G.t) / f.self.max), be1Grn, 0.35, 2); }
    if (G.t >= f.self.end) {
      f.self = null; healPlayer(G.P.maxHp * 0.05, true); ring(p.x, p.y, 40, be1Grn, 0.5, 5); be1Mark(w, 'wrongpay');
      be1Say('wrongpay', p.x, p.y - 34, be1T('be_dd_wrongpay_float'), be1Grn, 13, 1);
    }
  }
}
// The payout. M scales stored x repeat and the three-hit floor together, so it is the whole payout x M; the rest is added around it.
{
  const be1Pop0 = duePop;
  duePop = function (e) {
    const D = e.due, w = D && D.w, f = w && w.be1;
    if (!D || !f || !f.dd || !w.s) return be1Pop0(e);
    const s = w.s, x = e.x, y = e.y, low = be1Low(), hpFrac = e.hp / e.maxHp;
    let M = 1;
    if (f.p === 'A') M *= 1 + 1.5 * be1Need(); // Flatline
    if (f.p === 'B') M *= 2.5; // DNR
    if (f.p === 'C') M *= 0.4; // Triage
    const tod = !!f.tod && hpFrac < 0.25;
    if (tod && e.boss) { M *= 3; be1Mark(w, 'todboss'); }
    let extra = 0;
    if (f.p === 'B' && f.will && f.blocked > 0) { extra = f.blocked * 3; f.blocked = 0; be1Mark(w, 'will'); } // Living Will
    const T = (D.stored * s.repeat + s.dmg * 3) * M + extra, rep0 = s.repeat, dmg0 = s.dmg;
    f.last = { M, T, low };
    s.repeat = rep0 * M; s.dmg = dmg0 * M;
    try { be1Pop0(e); } finally { s.repeat = rep0; s.dmg = dmg0; }
    const src = be1Src(w, 'proj', { due: true, wname: 'Due Date' });
    if (extra > 0 && !e.dead) damageEnemy(e, extra, Object.assign({}, src, { wname: 'Living Will' }));
    if (f.p === 'B' && f.rites) { // Last Rites: everything within 120 Bleeds
      forNear(x, y, 120, o => { if (o !== e && toyCan(o)) be1Bleed(o, (s.dmg * 0.3) / 3, 'Last Rites'); });
      ring(x, y, 120, be1Red, 0.4, 4); be1Mark(w, 'rites'); be1Say('rites', x, y - e.r - 30, be1T('be_dd_lastrites_float'), be1Red, 12, 0.6);
    }
    if (tod && !e.boss && !e.dead) { // Time of Death: under 25% at the payout, it dies outright
      e.hp = 0; killEnemy(e, Object.assign({}, src, { wname: 'Time of Death' }));
      ring(x, y, e.r + 20, '#ffffff', 0.4, 5); be1Mark(w, 'tod'); be1Say('tod', x, y - e.r - 30, be1T('be_dd_timeofdeath_float'), '#ffffff', 13, 0.6);
    }
    if (e.dead && f.harvest) { // Organ Harvest: a payout that kills splits across the 3 nearest
      const near = acquireMany('nearest', 420, x, y, 8).filter(o => o !== e && toyCan(o)).slice(0, 3);
      for (const o of near) { damageEnemy(o, T / 3, Object.assign({}, src, { wname: 'Organ Harvest' })); bolt(x, y, o.x, o.y, be1Red, 0.25); }
      if (near.length) { be1Mark(w, 'harvest'); be1Say('harvest', x, y - e.r - 30, be1T('be_dd_organharvest_float'), be1Red, 12, 0.6); }
    }
    if (e.dead && f.clinic) { healPlayer(G.P.maxHp * 0.02, true); ring(G.player.x, G.player.y, 24, be1Grn, 0.35, 3); be1Mark(w, 'clinic'); be1Say('clinic', G.player.x, G.player.y - 30, be1T('be_dd_walkinclinic_float'), be1Grn, 12, 0.8); }
    if (f.paper && !e.dead && Math.random() < BE1.paperP) { // Paperwork: paid twice
      damageEnemy(e, T, Object.assign({}, src, { wname: 'Paperwork' })); ring(x, y, e.r + 30, be1Pale, 0.4, 4); be1Mark(w, 'paper');
      be1Say('paper', x, y - e.r - 30, be1T('be_dd_paperwork_float'), be1Pale, 12, 0.6);
    }
    if (f.code && low) { // Code Blue: low at a payout, the strongest unmarked enemy in reach is marked at once
      const pl = G.player, c = G.enemies.filter(o => o !== e && toyCan(o) && !o.due && be1Dist(o, pl) <= s.range + 150).sort((a, b) => b.hp - a.hp)[0];
      if (c) { dueMark(w, c, true); if (c.due) { bolt(x, y, c.x, c.y, be1Pale, 0.3); be1Mark(w, 'codeblue'); be1Say('codeblue', c.x, c.y - c.r - 18, be1T('be_dd_codeblue_float'), be1Pale, 13, 0.6); } }
    }
    be1Mark(w, 'paid');
  };
}

// ================================================================ the cards
(function () {
  const C = (name, desc, apply) => ({ name, desc, apply });
  const T = be1T;
  const lp = k => w => { be1LpInstall(w); be1F(w)[k] = 1; recomputeAll(); };
  const dd = k => w => { be1DdInstall(w); be1F(w)[k] = 1; recomputeAll(); };
  const lpP = (p, ...flags) => w => { be1LpInstall(w); const f = be1F(w); if (p) f.p = p; for (const k of flags) f[k] = 1; recomputeAll(); };
  const ddP = p => w => { be1DdInstall(w); be1F(w).p = p; recomputeAll(); };
  wupRegFor('beta', BE1.LP, {
    A: { name: 'IV Drip', tag: T('be_lp_iv_tag'), costs: T('be_lp_iv_costs'), shows: '', modes: '',
      lv3: { desc: T('be_lp_iv_desc'), apply: lpP('A', 'iv') },
      lv6: [C('Saline Bag', T('be_lp_salinebag_desc'), lp('saline')), C('Cannula', T('be_lp_cannula_desc'), lp('cannula'))],
      wild: C('Air Bubble', T('be_lp_airbubble_desc'), lp('bubble')) },
    B: { name: 'Adrenaline Shot', tag: T('be_lp_adren_tag'), costs: T('be_lp_adren_costs'), shows: '', modes: '',
      lv3: { desc: T('be_lp_adren_desc'), apply: lpP('B') },
      lv6: [C('Epinephrine', T('be_lp_epinephrine_desc'), lp('epi')), C('Racing Heart', T('be_lp_racingheart_desc'), lp('racing'))],
      wild: C('Overdose', T('be_lp_overdose_desc'), lp('overdose')) },
    C: { name: 'Blood Draw', tag: T('be_lp_draw_tag'), costs: T('be_lp_draw_costs'), shows: '', modes: '',
      lv3: { desc: T('be_lp_draw_desc'), apply: lpP('C', 'draw') },
      lv6: [C('Phlebotomist', T('be_lp_phlebotomist_desc'), lp('phleb')), C('Butterfly Needle', T('be_lp_butterflyneedle_desc'), lp('butterfly'))],
      wild: C('Squeamish', T('be_lp_squeamish_desc'), lp('squeam')) },
    lv10: [
      { name: 'Drip Feed', best: 'A', desc: T('be_lp_dripfeed_desc'), apply: lpP(undefined, 'iv', 'dripfeed') },
      { name: 'Crash Cart', best: 'B', desc: T('be_lp_crashcart_desc'), apply: lp('crash') },
      { name: 'Blood Bank', best: 'C', desc: T('be_lp_bloodbank_desc'), apply: w => { be1LpInstall(w); const f = be1F(w); f.draw = 1; f.bank = 1; recomputeAll(); } }] });
  wupRegFor('beta', BE1.DD, {
    A: { name: 'Flatline', tag: T('be_dd_flatline_tag'), costs: T('be_dd_flatline_costs'), shows: '', modes: '',
      lv3: { desc: T('be_dd_flatline_desc'), apply: ddP('A') },
      lv6: [C('Code Blue', T('be_dd_codeblue_desc'), dd('code')), C('Heart Monitor', T('be_dd_heartmonitor_desc'), dd('monitor'))],
      wild: C('Beep', T('be_dd_beep_desc'), dd('beep')) },
    B: { name: 'DNR', tag: T('be_dd_dnr_tag'), costs: T('be_dd_dnr_costs'), shows: '', modes: '',
      lv3: { desc: T('be_dd_dnr_desc'), apply: ddP('B') },
      lv6: [C('Living Will', T('be_dd_livingwill_desc'), dd('will')), C('Last Rites', T('be_dd_lastrites_desc'), dd('rites'))],
      wild: C('Paperwork', T('be_dd_paperwork_desc'), dd('paper')) },
    C: { name: 'Triage', tag: T('be_dd_triage_tag'), costs: T('be_dd_triage_costs'), shows: '', modes: '',
      lv3: { desc: T('be_dd_triage_desc'), apply: ddP('C') },
      lv6: [C('Waiting Room', T('be_dd_waitingroom_desc'), dd('waiting')), C('Walk-in Clinic', T('be_dd_walkinclinic_desc'), dd('clinic'))],
      wild: C('Wrong Patient', T('be_dd_wrongpatient_desc'), dd('wrong')) },
    lv10: [
      { name: 'Time of Death', best: 'A', desc: T('be_dd_timeofdeath_desc'), apply: dd('tod') },
      { name: 'Organ Harvest', best: 'B', desc: T('be_dd_organharvest_desc'), apply: dd('harvest') },
      { name: 'Mass Casualty', best: 'C', desc: T('be_dd_masscasualty_desc'), apply: dd('mass') }] });
})();
