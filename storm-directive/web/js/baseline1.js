'use strict';
// Spawn Prawn - Baseline reimagined, part 1: the movie-cop SAMPLE branches (ideas.md, 29 Oct 2026 second batch; the user,
// 30 Oct: Rambo, Dirty Harry and Robocop are branches of the sample, not of Standard Issue, taken at sample Lv 15 through
// samplebranch.js). Standard Issue keeps its own branches again (Ricochet Brain / Through and Through / Marked for Bonking,
// wup1.js). Every effect below acts on every weapon you hold (never Feats), whichever weapons they are.
//      A Rambo        every weapon fires 25% faster and 15% weaker; magazines two thirds bigger, reloads in 0.64 of the time.
//                     Lv 20: Faster and faster (each shot in a magazine 5% sooner than the last, up to double; reload resets),
//                           First blood (hits Bleed; +20% on Bleeding enemies). Wild: Hot Start (the first shot of a magazine x2).
//      B Dirty Harry  every weapon fires at half the rate for x2.2 damage, +10 points crit; ranged weapons +120 range.
//                     Lv 20: Lucky shot (every hit on an Elite crits), The Sixth Round (the last round in a magazine hits 50%
//                           harder, strips a Shell layer and staggers). Wild: Feeling Lucky? (crit damage doubled, chance halved).
//      C Robocop      every 6 s a mark lands on the nearest Elite in range (else the nearest enemy): every weapon's shots stay on
//                     it, +50% to it; tapping an enemy on the slide marks it by hand; every 4th shot is a small Force rocket
//                     (150%, 40 area). The mark is also G.grudge, so the REVENGE directive follows it. Lv 20: Improved targeting
//                     (unlocks the FINISHER aim directive), Prime Directive (marks last until the target dies and pass to the
//                     next Elite). Wild: Double Booked (two marks at once).
//      Lv 25 masteries: Belt-Fed (no reload, 30% weaker; best A), Made Your Day (a crit that kills refills that weapon's
//                     magazine and its next shot crits; best B), Dead on Arrival (the mark takes triple and dies outright under
//                     15% health, not bosses; best C).
//  - Gated Feats (feats10.js feat(); eligible only once the branch is taken): Quick draw (B: when an enemy within 300 winds up
//    a shot, you shoot it first with a double crit; 10 stamina, 4 s) and Acid bath (C: tap, 14 stamina: the most-Shelled enemy
//    within 350 is sprayed with Acid, 60% of its Corrosion bar, and an Acid pool is left for 8 s).
//  - The costume on the body is baselinelook.js's; this file draws only the mark's crosshair in the world.
//  The mark (bl1SetMark, bl1Mark, bl1Unmark, G.bl1.marks, e.bl1mk) is shared with baseline2.js's Sperminator.
//  Copy: names, tags, costs and card lines from baselinecopy.js; the Rambo and Dirty Harry branch lines were rewritten for every
//  weapon (30 Oct).
// Hooks: smbReg (samplebranch.js); hookOn('fire') (the mark keeps every weapon on it), hookOn('fire:after'), hookOn('dmgMul'),
// hookOn('tick'); wraps computeStats, weapons24.js wupDmgMul, wupHit and wupKill (every weapon, not only branched ones),
// aimList (spsteer.js / aimplus.js), targetScore (game.js), drawPlates (bodymods.js: the crosshair); a pointerup listener on
// the canvas (tap-to-mark). DIRECTIVES.push('finisher'). Loads after samplebranch.js.

const BL1 = { SI: 'v_phys_proj', markEvery: 6, markRange: 520, markK: 1.5, rocketEvery: 4, rocketK: 1.5, rocketR: 40, quickR: 300, bathR: 350, tapR: 60 };
const bl1F = w => w.bl1 || (w.bl1 = {}); // (per-weapon counters: Faster and faster, Made Your Day)
const bl1S = () => G.bl1 || (G.bl1 = { marks: [], markT: 0, shots: 0 });
const bl1Live = w => !!(G && G.weapons && G.weapons.includes(w));
// The Standard Issue slot on the sperm (Quick draw fires from it when it is held).
const bl1W = () => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === BL1.SI) : null);
// The Baseline sample branch taken ('' until sample Lv 15), and its cards' flags.
const bl1P = () => (smbId() === 'baseline' ? smbP() : '');
const bl1H = k => bl1P() !== '' && smbHas(k);
const bl1Gun = w => !!(w && !w.isSpell && w.def && w.s); // (a weapon, not a Feat)
const bl1Mag = w => w.s.mag > 1 && w.s.mag < 999; // (has a magazine to empty)
const bl1Pale = '#f1ecff';

// ---------------------------------------------------------------- shared helpers (as wup1.js keeps them, closed over there)
function bl1Src(w, atk, extra) { return Object.assign({ elem: 'phys', w, atk, wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name }, extra); }
function bl1Heavy(e, w, fill) { // one Shell layer off, Poise up by fill (1 = a stagger)
  if (!e || e.dead) return 0;
  const c = fightCd(e); let shed = 0;
  if (c.def === 'shell' && c.layers > 0) {
    c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; if (typeof fst === 'function') fst().layers++; shed = 1;
    ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3);
  }
  if (fill) { c.bars.force += fill; c.barQuietT.force = 0; if (c.bars.force >= 1) { c.bars.force = 0; fightPayoff(e, 'stagger', { raw: 0 }, {}); } }
  return shed;
}
const bl1T = {};
function bl1Say(key, x, y, txt, color, size, gap) { if ((bl1T[key] || 0) > G.realT) return; bl1T[key] = G.realT + (gap || 0.25); floatText(x, y, txt, color, size || 12, 0.6); }
const bl1Elite = e => !!(e && (e.elite || e.rival) && !e.boss);

// ---------------------------------------------------------------- stats (every weapon)
computeStats = (orig => function (w) {
  orig(w);
  if (!G || !bl1Gun(w)) return;
  const p = bl1P(); if (!p) return;
  const s = w.s, mag = bl1Mag(w), atk = typeof wAtk === 'function' ? wAtk(w) : 'proj';
  if (p === 'A') { s.cd *= 0.8; s.dmg *= 0.85; if (mag) { s.mag = Math.ceil(s.mag * 5 / 3); s.reload *= 0.7 / 1.1; } }
  if (p === 'B') { s.cd *= 2; s.dmg *= 2.2; if (atk === 'proj' || atk === 'spread' || atk === 'beam') s.range += 120; s.crit = (s.crit || 0) + 0.10; if (bl1H('feel')) s.crit *= 0.5; }
  if (bl1H('beltfed') && mag) { s.mag = 9999; s.dmg *= p === 'A' ? 0.7 / 0.85 : 0.7; } // (Belt-Fed: 30% weaker in all, Rambo's 15% included)
})(computeStats);

// ---------------------------------------------------------------- firing
function bl1Fire(w, target) { // Robocop: no weapon switches off the mark while it is in range
  if (w._in || bl1P() !== 'C' || !bl1Gun(w)) return false;
  const p = G.player, m = bl1Mark(p.x, p.y, w.s.range);
  if (m && m !== target) { w._in = 1; try { fireWeapon(w, m); } finally { w._in = 0; } return true; }
  return false;
}
hookOn('fire', 'baseline1:mark', (w, target) => bl1Fire(w, target), 45); // (after the toys and the Armoury, before the branches)
hookOn('fire:after', 'baseline1:after', (w, target, n0) => {
  const p = bl1P();
  if (!p || !bl1Gun(w) || w._in) return;
  const f = bl1F(w), s = w.s, news = G.proj.slice(n0).filter(pr => pr.src && pr.src.w === w);
  if (!news.length) return;
  const tag = extra => { for (const pr of news) pr.src = Object.assign({}, pr.src, extra); };
  const mag = bl1Mag(w), fired = mag ? Math.max(1, s.mag - w.ammo + 1) : 0; // (shots fired from this magazine, this one included: the engine takes the round after this hook)
  if (mag && bl1H('faster')) f.cdK = Math.max(0.5, 1 - 0.05 * (fired - 1)); // Faster and faster (applied in the tick: the engine sets w.cd after this hook)
  if (mag && bl1H('hot') && fired === 1) { tag({ bl1hot: 1 }); for (const pr of news) pr.dmg *= 2; }
  if (mag && bl1H('six') && w.ammo <= 1) tag({ bl1last: 1 }); // The Sixth Round: the round that empties the magazine
  if (f.nextCrit) { tag({ crit: 1 }); f.nextCrit = 0; } // Made Your Day
  if (p === 'C') {
    const S = bl1S(); S.shots++;
    if (S.shots % BL1.rocketEvery === 0) { tag({ bl1rocket: 1 }); for (const pr of news) { pr.dmg *= BL1.rocketK; pr.r = (pr.r || 4) * 1.6; } }
  }
});

// ---------------------------------------------------------------- damage and hits
function bl1Dmg(w, e, src) {
  if (src.wupEcho) return 1;
  const p = bl1P(); let k = 1;
  if (bl1H('blood') && f_bleeding(e)) k *= 1.2;
  if (src.bl1last) k *= 1.5;
  if (bl1Marked(e)) k *= bl1H('deadalive') ? 3 : p === 'C' ? BL1.markK : 1;
  return k;
}
wupDmgMul = (orig => function (e, src) { const k = orig(e, src), w = src && src.w; return bl1P() && bl1Gun(w) ? k * bl1Dmg(w, e, src) : k; })(wupDmgMul);
// Lucky shot: every hit on an Elite crits. The crit is rolled after the dmgMul hooks (game.js damageEnemy), so the chance is set there.
hookOn('dmgMul', 'baseline1:lucky', (e, src) => {
  const w = src && src.w; if (!bl1H('lucky') || !bl1Gun(w) || src.wupEcho || src.echo) return 1;
  if (src.bl1c0 == null) src.bl1c0 = src.crit != null ? src.crit : G.P.crit;
  src.crit = bl1Elite(e) ? 1 : src.bl1c0;
  return 1;
});
function bl1Hit(w, e, res, src) {
  if (bl1H('blood') && res && res.toHp > 0) fightStatus(e, 'arcane', res.raw || res.toHp, src); // First blood
  if (res && res.crit) {
    e.bl1critT = G.t; e.bl1critW = w;
    if (bl1H('feel')) damageEnemy(e, (res.toHp || 0), bl1Src(w, 'proj', { echo: true, noStatus: true })); // (Feeling Lucky?: the doubled crit lands as an echo; the dmg hook can't see the roll)
  }
  if (src.bl1last) { bl1Heavy(e, w, 1); ring(e.x, e.y, e.r + 14, '#ffffff', 0.3, 6); cam.shake = Math.min(8, cam.shake + 2); }
  if (src.bl1rocket && !src.bl1boom) { src.bl1boom = 1; aoe(e.x, e.y, BL1.rocketR, w.s.dmg * BL1.rocketK, bl1Src(w, 'burst'), w.def.color); ring(e.x, e.y, BL1.rocketR, bl1Pale, 0.25, 3); }
  if (bl1H('deadalive') && bl1Marked(e) && !e.boss && !e.dead && e.hp > 0 && e.hp < e.maxHp * 0.15) { damageEnemy(e, e.hp * 3, bl1Src(w, 'proj', { noCrit: true })); bl1Say('doa', e.x, e.y - e.r - 14, 'DOA', bl1Pale, 13, 0.5); }
}
wupHit = (orig => function (e, res, src) { orig(e, res, src); const w = src && src.w; if (bl1P() && bl1Gun(w) && !src.wupEcho) bl1Hit(w, e, res, src); })(wupHit);
function bl1Kill(w, e) {
  if (bl1H('makeday') && e.bl1critT === G.t && e.bl1critW === w) { w.ammo = w.s.mag; w.reloadT = 0; bl1F(w).nextCrit = 1; ring(G.player.x, G.player.y, 22, bl1Pale, 0.3, 3); }
  if (bl1P() === 'C' && bl1Marked(e)) { bl1Unmark(e); if (bl1H('prime')) bl1MarkNew(true); }
}
wupKill = (orig => function (e, src) { orig(e, src); const w = src && src.w; if (bl1P() && bl1Gun(w)) bl1Kill(w, e); })(wupKill);

// ---------------------------------------------------------------- the mark (Robocop)
const bl1Marked = e => !!(e && e.bl1mk);
function bl1Mark(x, y, range) { // the nearest live mark in range, or null
  const S = bl1S(); let best = null, bd = range * range;
  S.marks = S.marks.filter(e => !e.dead && e.bl1mk);
  for (const e of S.marks) { const d2 = (e.x - x) ** 2 + (e.y - y) ** 2; if (d2 < bd) { bd = d2; best = e; } }
  return best;
}
function bl1Unmark(e) { if (!e) return; e.bl1mk = 0; const S = bl1S(); S.marks = S.marks.filter(x => x !== e); if (G.grudge === e) G.grudge = null; }
function bl1SetMark(w, e, byHand) { // (w is unused since the mark became the sample's; kept for callers)
  if (!e || e.dead || e.egg || e.charmed) return false;
  const S = bl1S(), cap = bl1H('rich') ? 2 : 1;
  S.marks = S.marks.filter(x => !x.dead && x.bl1mk && x !== e);
  while (S.marks.length >= cap) bl1Unmark(S.marks[0]);
  e.bl1mk = 1; e.bl1mkT = G.t; S.marks.push(e); G.grudge = e;
  ring(e.x, e.y, e.r + 10, '#ff4d6d', 0.35, 4); bl1Say('mark', e.x, e.y - e.r - 12, byHand ? 'BOOKED' : 'MARKED', '#ff4d6d', 12, 0.4);
  return true;
}
function bl1MarkNew() { // the nearest Elite in range, else the nearest enemy
  const p = G.player, r = BL1.markRange;
  let best = null, bd = 1e18, bestE = null, bdE = 1e18;
  forNear(p.x, p.y, r, (e, d2) => { if (e.dead || e.egg || e.charmed || e.bl1mk) return false; if (bl1Elite(e) && d2 < bdE) { bdE = d2; bestE = e; } if (d2 < bd) { bd = d2; best = e; } return false; });
  const e = bestE || best; if (e) bl1SetMark(null, e, false);
  return !!e;
}
hookOn('tick', 'baseline1:tick', () => {
  if (!G || !G.weapons) return;
  for (const w of G.weapons) if (w && w.bl1 && w.bl1.cdK) { w.cd *= w.bl1.cdK; w.bl1.cdK = 0; } // (Faster and faster)
  if (bl1P() !== 'C' || G.state !== 'play') return;
  const S = bl1S(), rich = bl1H('rich');
  S.marks = S.marks.filter(e => !e.dead && e.bl1mk);
  if (!bl1H('prime')) for (const e of S.marks.slice()) if (G.t - e.bl1mkT > BL1.markEvery * 2) bl1Unmark(e); // (a mark the shots never reach fades)
  if (G.t >= S.markT && (rich ? S.marks.length < 2 : !S.marks.length)) { S.markT = G.t + BL1.markEvery; bl1MarkNew(); }
});
// Tap an enemy on the slide to mark it by hand (Robocop).
(function () {
  const cv = document.getElementById('game'); if (!cv) return;
  let d0 = null;
  cv.addEventListener('pointerdown', ev => { d0 = { x: ev.clientX, y: ev.clientY, t: performance.now() }; }, true);
  cv.addEventListener('pointerup', ev => {
    if (!d0 || !G || G.state !== 'play') return;
    const moved = Math.hypot(ev.clientX - d0.x, ev.clientY - d0.y), held = performance.now() - d0.t; d0 = null;
    if (moved > 12 || held > 350) return;
    if (bl1P() !== 'C') return;
    const r = cv.getBoundingClientRect(), wx = (ev.clientX - r.left) * (W / r.width) / S + cam.x - W / 2 / S, wy = (ev.clientY - r.top) * (H / r.height) / S + cam.y - H / 2 / S;
    let best = null, bd = BL1.tapR * BL1.tapR;
    for (const e of G.enemies) { if (e.dead || e.egg) continue; const d2 = (e.x - wx) ** 2 + (e.y - wy) ** 2 - e.r * e.r; if (d2 < bd) { bd = d2; best = e; } }
    if (best) bl1SetMark(null, best, true);
  }, true);
})();

// ---------------------------------------------------------------- the FINISHER directive (Improved targeting)
DIRECTIVES.push({ id: 'finisher', name: 'FINISHER', short: 'FINISH', desc: 'Nearest, but anything in range under 15% health comes first. It is basically palliative care.' });
const bl1Finisher = () => bl1P() === 'C' && bl1H('targeting');
aimList = (orig => function () { const L = orig(); return bl1Finisher() ? L : L.filter(d => d.id !== 'finisher'); })(aimList);
targetScore = (orig => function (dir, e, d2) {
  if (dir === 'finisher') return (!e.boss && e.hp < e.maxHp * 0.15 ? 1e12 : 0) - d2;
  return orig(dir, e, d2);
})(targetScore);

// ---------------------------------------------------------------- the sample branch cards (samplebranch.js)
(function () {
  const C = (name, desc, k) => ({ name, desc, apply: smbSet(k) });
  const none = () => {};
  smbReg('baseline', {
    A: { name: 'Rambo', kind: 'rambo', tag: 'Spray, then spray again', costs: 'each shot is 15% weaker.',
      lv3: { desc: 'Every weapon: 25% faster fire, magazines two thirds bigger, reloads a third quicker. Also how fertilisation works.', apply: none },
      lv6: [C('Faster and faster', 'Each shot in a magazine comes 5% sooner than the last, up to twice as fast. A reload resets it, as reloads do.', 'faster'), C('First blood', 'Hits Bleed (30% of the hit over 3 s). Shots on a Bleeding enemy do 20% more. Spilt first, counted later.', 'blood')],
      wild: C('Hot Start', 'The first shot of every magazine does double damage. It is always the most enthusiastic one.', 'hot') },
    B: { name: 'Dirty Harry', kind: 'harry', tag: 'Make every round count', costs: 'the fire rate is halved.',
      lv3: { desc: 'Every weapon hits 2.2x as hard with +10 crit chance, and ranged ones reach 120 further. Only one ever needs to land.', apply: none },
      lv6: [C('Lucky shot', 'Every hit on an Elite is a crit (1.6x). Bosses are not Elites, whatever they have told you.', 'lucky'), C('The Sixth Round', 'The last round in each magazine hits 50% harder, knocks a Shell layer off and staggers. It has been saving up.', 'six')],
      wild: C('Feeling Lucky?', 'A crit does double damage, but your crit chance is halved. Results may vary.', 'feel') },
    C: { name: 'Robocop', kind: 'robocop', tag: 'One target, all of you', costs: 'your shots will not leave the mark.',
      lv3: { desc: 'Every 6 s the nearest Elite (else nearest enemy) is marked: +50% to it. Tap one to mark it yourself. Every 4th shot: Force rocket, 150%, 40 area.', apply: none },
      lv6: [C('Improved targeting', 'Adds the FINISHER rule to every weapon aim menu: nearest, but anything in range under 15% health comes first. Triage, basically.', 'targeting'), C('Prime Directive', 'Marks never fade. When the mark dies it passes to the next Elite at once. Paperwork, but quicker.', 'prime')],
      wild: C('Double Booked', 'Two marks at once. Both have been told to wait where they are.', 'rich') },
    lv10: [
      { name: 'Belt-Fed', best: 'A', desc: 'No reload, ever. Shots are 30% weaker. Worn across the chest, where it will not be missed.',
        apply: () => { smbS().f.beltfed = 1; for (const w of G.weapons) if (bl1Gun(w)) { computeStats(w); if (w.s.mag > 1000) { w.ammo = w.s.mag; w.reloadT = 0; } } } },
      { name: 'Made Your Day', best: 'B', desc: 'A crit that kills refills the magazine, and the next shot is a crit. A very good afternoon.', apply: smbSet('makeday') },
      { name: 'Dead on Arrival', best: 'C', desc: 'The marked enemy takes triple damage and dies outright under 15% health. Not bosses. Bosses arrive alive.', apply: smbSet('deadalive') }] });
})();

// ---------------------------------------------------------------- gated Feats
const bl1Fk = (id, title, desc) => ({ id, title, desc });
feat({ id: 'quick_draw', name: 'Quick draw', icon: 'QD', ico: 'nova', type: 'force', atk: 'proj', trig: 1, ev: 1, rar: 1, stam: 10, gate: () => bl1P() === 'B',
  line: '"It aims. We shoot first. Simple."', does: 'Performs itself: when an enemy within 300 starts winding up a shot, you shoot first with a double crit. 10 stamina, 4 s cooldown.',
  base: { dmg: 24, cd: 4, range: BL1.quickR },
  stat: (w, s) => { if (f10Fk(w, 'reach')) s.range *= 1.5; if (f10Fk(w, 'fast')) s.cd *= 0.6; },
  fire: (w, c) => {
    const p = me(), e = c.e; if (!e || e.dead) return;
    const si = bl1W(), dmg = (si ? si.s.dmg : w.s.dmg) * (f10Fk(w, 'triple') ? 3 : 2), n = f10Fk(w, 'two') ? 2 : 1;
    for (let i = 0; i < n; i++) after(i * 0.08, () => { if (e.dead) return; const a = Math.atan2(e.y - p.y, e.x - p.x); if (si && bl1Live(si)) spawnProj(si, p.x, p.y, a, Object.assign(weaponSrc(si), { crit: 1, wupEcho: true, wname: w.def.name }), { dmg }); else f10Hit(w, e, dmg, 'proj', { crit: 1 }); });
    bolt(p.x, p.y, e.x, e.y, bl1Pale, 0.12); bl1Say('qd', p.x, p.y - 30, 'FIRST', bl1Pale, 13, 0.5);
    e.bl1qdT = G.t;
  },
  forks: { 3: [bl1Fk('reach', 'Long Barrel', 'Reach 450 instead of 300. Compensating for something, but accurately.'), bl1Fk('triple', 'Big Calibre', 'A triple crit instead of double. The recoil is your problem.')],
    5: [bl1Fk('two', 'Lost Count', 'Two shots instead of one. Nobody is counting.'), bl1Fk('fast', 'Practice Rounds', 'Cooldown 2.4 s instead of 4. Mostly paperwork and repetition.')] } });
// The trigger: an enemy in reach has started winding up a shot (snipers aim, roster shooters show a tell, plain shooters are a beat from firing).
const bl1Winding = e => (e.aimT > 0) || (e.s10T > 0) || (e.shootCd != null && e.shootCd > 0 && e.shootCd < 0.15 && e.def && e.def.shoot);
hookOn('tick', 'baseline1:quickdraw', dt => {
  if (!G || G.state !== 'play') return;
  const w = f10Evs('quick_draw'); if (!w) return;
  const p = G.player, r = w.s.range || BL1.quickR; let best = null, bd = r * r;
  forNear(p.x, p.y, r, (e, d2) => { if (e.dead || e.charmed || e.bl1qdT === G.t || !bl1Winding(e)) return false; if (d2 < bd) { bd = d2; best = e; } return false; });
  if (best) f10Go(w, { e: best });
});
feat({ id: 'acid_bath', name: 'Acid bath', icon: 'AB', ico: 'flask', type: 'acid', atk: 'burst', rar: 1, stam: 14, gate: () => bl1P() === 'C',
  line: '"Hard one. Spray it. It goes soft. Next."', does: 'Tap to spray the most-Shelled enemy within 350: a hit, 60% of its Corrosion bar, an Acid pool for 8 s. 14 stamina, 9 s cooldown.',
  base: { dmg: 18, cd: 9, area: 70, range: BL1.bathR, dur: 8 },
  stat: (w, s) => { if (f10Fk(w, 'bigger')) s.area *= 1.5; if (f10Fk(w, 'longer')) s.dur *= 1.75; },
  when: w => { // the most-Shelled enemy in range, else the toughest
    const p = me(); let best = null, bk = -1;
    forNear(p.x, p.y, w.s.range, (e, d2) => { if (e.dead || e.charmed || e.egg) return false; const c = fightCd(e), k = (c.def === 'shell' ? c.layers * 1e6 : 0) + e.maxHp - d2 * 1e-6; if (k > bk) { bk = k; best = e; } return false; });
    return best ? { t: best } : null;
  },
  fire: (w, c) => {
    if (!c || !c.t) { c = w.def.f10.when(w); if (!c) return; } // (a tap arrives with no target picked)
    const ts = [c.t]; if (f10Fk(w, 'two')) { const p = me(); const o = acquire('elite', w.s.range, p.x, p.y, [c.t]); if (o && o !== c.t) ts.push(o); }
    for (const t of ts) {
      if (!t || t.dead) continue;
      const fill = f10Fk(w, 'full') ? 0.9 : 0.6, c2 = fightCd(t); c2.bars.acid = Math.min(0.9999999, (c2.bars.acid || 0) + fill); c2.barQuietT.acid = 0;
      f10Hit(w, t, w.s.dmg, 'burst'); bolt(me().x, me().y, t.x, t.y, w.def.color, 0.2); ring(t.x, t.y, t.r + 10, w.def.color, 0.3, 4);
      if (G.zones.length < 150) G.zones.push({ x: t.x, y: t.y, r: w.s.area, life: w.s.dur, max: w.s.dur, dps: w.s.dmg * 0.6, elem: 'fire', color: w.def.color, tick: 0, src: f10Src(w, { atk: 'pool', zoneHit: true }), bl1bath: true });
    }
  },
  forks: { 3: [bl1Fk('bigger', 'Industrial Spill', 'The pool is 50% wider. Somebody should have put a sign up.'), bl1Fk('full', 'Mostly Liquid', 'The spray fills 90% of the Corrosion bar instead of 60%. The rest is a formality.')],
    5: [bl1Fk('two', 'Double Dose', 'A second target, the next Elite, gets the same bath. Acid is not fussy.'), bl1Fk('longer', 'Slow Leak', 'The pool lasts 14 s instead of 8. Nobody has come to clean it up.')] } });

for (const id of ['quick_draw', 'acid_bath']) { // only once the branch is taken (and never twice)
  const c = typeof CARDS !== 'undefined' && CARDS.find(x => x.id === 'feat_' + id); if (c) c.eligible = g => !!(F10[id].gate() && !f10Own(id));
}
// Shotgun's and Hand-to-gland's new branches (baseline2.js, baseline3.js) have no stage scenes yet: weapon tier screens opened
// from a 'wup' box use the plain layout (the branch screens at weapon Lv 3, 6 and 9 open in the Weapon Draft: branchback.js).
if (typeof SIV_DRAFT !== 'undefined') SIV_DRAFT = false;

// ---------------------------------------------------------------- the mark's crosshair (in the world, on the slide)
function bl1Costume() {
  if (!G || !G.player || bl1P() !== 'C') return;
  const t = G.realT, raw = RAW_COL; RAW_COL = true;
  for (const e of bl1S().marks) {
    if (e.dead || !e.bl1mk) continue;
    const x = sx(e.x), y = sy(e.y), r = (e.r + 9) * S, a = t * 1.5;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.strokeStyle = '#ff2e2e'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 4; i++) { const q = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(q) * (r - 5), Math.sin(q) * (r - 5)); ctx.lineTo(Math.cos(q) * (r + 6), Math.sin(q) * (r + 6)); ctx.stroke(); }
    ctx.restore();
  }
  ctx.globalAlpha = 1; RAW_COL = raw;
}
drawPlates = (orig => function (px, py) { orig(px, py); try { bl1Costume(); } catch (e) { } })(drawPlates);
