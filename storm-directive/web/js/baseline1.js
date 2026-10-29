'use strict';
// Spawn Prawn - Baseline reimagined, part 1: Standard Issue's three movie-cop branches (ideas.md, 29 Oct 2026 second batch;
// the user's design, 29 Oct: replace Ricochet Brain / Through and Through / Marked for Bonking, absorb the mark into Robocop).
//  - Lv 3 branches (WUP['v_phys_proj'] re-registered over wup1.js; the old cards stay in wup1.js, unreachable):
//      A Rambo        magazine 20, reload 0.7 s, 25% faster, 15% less a shot; while held every weapon fires 10% faster.
//                     Lv 6: Faster and faster (each shot in a magazine 5% faster than the last, up to double; reload resets),
//                           First blood (hits Bleed; +20% on Bleeding enemies). Wild: Hot barrel (the first shot of a magazine x2).
//      B Dirty Harry  magazine 6, reload 1.4 s, half the fire rate, x2.2 damage, range +120, almost no spread; crit +10 points on
//                     every weapon. Lv 6: Lucky shot (every hit on an Elite crits), Six shooter (the last round in the magazine is a
//                     heavy hit that staggers). Wild: Do you feel lucky (a crit's damage is doubled, your crit chance halved).
//      C Robocop      every 6 s a mark lands on the nearest Elite in range (else the nearest enemy): shots stay on it, +50% to it;
//                     tapping an enemy on the slide marks it by hand; every 4th shot is a small Force rocket (150%, 40 area). The mark
//                     is also G.grudge, so the REVENGE directive follows it. Lv 6: Improved targeting (unlocks the FINISHER aim
//                     directive: nearest, but anything in range under 15% health first), Prime Directive (marks last until the target
//                     dies and pass to the next Elite). Wild: Target rich (two marks at once).
//      Lv 9 masteries: Belt-fed (no reload, 30% weaker; best A), Make my day (a crit that kills refills the magazine and the next
//                     shot crits; best B), Dead or Alive (the mark takes triple and dies outright under 15% health, not bosses; best C).
//  - Gated Feats (feats10.js feat(); eligible only once the branch is taken, f10Unlocked wrapped): Quick draw (B: when an enemy
//    within 300 winds up a shot, you shoot it first with a double crit; 10 stamina, 4 s) and Acid bath (C: tap, 14 stamina: the
//    most-Shelled enemy within 350 is sprayed with Acid, 60% of its Corrosion bar, and an Acid pool is left for 8 s).
//  - Costumes: the branch shows on your body (headband ribbons, a visor band, a chrome head with a sweeping visor), drawn in
//    the player's transform after bodymods.js drawPlates; the mark wears a crosshair ring. Shapes, not colours, so Lab view reads.
//  Copy: every card, Feat and directive text is TODO_COPY:<id> (the user writes it); names the user gave in ideas.md are kept.
// Hooks: wupReg (weapons24.js), hookOn('fire:after'), hookOn('tick'); wraps computeStats (the two sperm-wide passives), f10Unlocked
// (feats10.js), aimList (spsteer.js / aimplus.js), targetScore (game.js), drawPlates (bodymods.js); a pointerup listener on the
// canvas (tap-to-mark). DIRECTIVES.push('finisher'). Loads after branchback.js.

const BL1 = { SI: 'v_phys_proj', markEvery: 6, markRange: 520, markK: 1.5, rocketEvery: 4, rocketK: 1.5, rocketR: 40, quickR: 300, bathR: 350, tapR: 60 };
const bl1F = w => w.bl1 || (w.bl1 = {});
const bl1S = () => G.bl1 || (G.bl1 = { marks: [], markT: 0, shots: 0 });
const bl1Live = w => !!(G && G.weapons && G.weapons.includes(w));
// The Standard Issue slot on the sperm, and its branch letter.
const bl1W = () => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === BL1.SI) : null);
const bl1P = () => { const w = bl1W(); return w && w.bl1 ? w.bl1.p || '' : ''; };
const bl1Has = (w, k) => !!(w && w.bl1 && w.bl1[k]);
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

// ---------------------------------------------------------------- stats
function bl1Stats(w, s) {
  const f = bl1F(w);
  if (f.p === 'A') { s.mag = Math.max(s.mag, 20); s.reload *= 0.7 / 1.1; s.cd *= 0.8; s.dmg *= 0.85; if (f.beltfed) { s.mag = 9999; s.dmg *= 0.7 / 0.85; } }
  if (f.p === 'B') { s.mag = 6; s.reload *= 1.4 / 1.1; s.cd *= 2; s.dmg *= 2.2; s.range += 120; s.spread = Math.min(s.spread, 0.01); s.crit = (s.crit || 0) + 0.10; if (f.feel) s.crit *= 0.5; }
  if (f.p === 'C') { /* (the mark and the rocket are behaviour, not stats) */ }
}
// Sperm-wide passives: Rambo makes every weapon fire 10% faster; Dirty Harry gives every weapon +10 points crit.
computeStats = (orig => function (w) {
  orig(w);
  if (!G || !w || w.isSpell || !w.s) return;
  const p = bl1P(); if (!p) return;
  if (p === 'A') w.s.cd /= 1.1;
  if (p === 'B') w.s.crit = (w.s.crit || 0) + 0.10;
})(computeStats);

// ---------------------------------------------------------------- firing
function bl1Fire(w, target) { // Robocop: no switching off the mark while it is in range
  if (w._in || bl1F(w).p !== 'C') return false;
  const p = G.player, s = w.s, m = bl1Mark(p.x, p.y, s.range);
  if (m && m !== target) { w._in = 1; try { fireWeapon(w, m); } finally { w._in = 0; } return true; }
  return false;
}
hookOn('fire:after', 'baseline1:after', (w, target, n0) => {
  if (!w || w.isSpell || !w.bl1 || !w.bl1.p || w._in) return;
  const f = w.bl1, s = w.s, news = G.proj.slice(n0).filter(pr => pr.src && pr.src.w === w);
  if (!news.length) return;
  const tag = extra => { for (const pr of news) pr.src = Object.assign({}, pr.src, extra); };
  const fired = Math.max(1, s.mag - w.ammo + 1); // (shots fired from this magazine, this one included: the engine takes the round after this hook)
  if (f.p === 'A') {
    if (f.faster) f.cdK = Math.max(0.5, 1 - 0.05 * (fired - 1)); // Faster and faster (applied in bl1Tick: the engine sets w.cd after this hook)
    if (f.hot && fired === 1) { tag({ bl1hot: 1 }); for (const pr of news) pr.dmg *= 2; }
  }
  if (f.p === 'B') {
    if (f.six && w.ammo <= 1) tag({ bl1last: 1 }); // Six shooter: the round that empties the magazine
    if (f.nextCrit) { tag({ crit: 1 }); f.nextCrit = 0; } // Make my day
  }
  if (f.p === 'C') {
    const S = bl1S(); S.shots++;
    if (S.shots % BL1.rocketEvery === 0) { tag({ bl1rocket: 1 }); for (const pr of news) { pr.dmg *= BL1.rocketK; pr.r = (pr.r || 4) * 1.6; } }
  }
});

// ---------------------------------------------------------------- damage and hits
function bl1Dmg(w, e, src) {
  const f = bl1F(w); let k = 1;
  if (src.wupEcho) return 1;
  if (f.p === 'A' && f.blood && f_bleeding(e)) k *= 1.2;
  if (f.p === 'B') {
    if (src.bl1last) k *= 1.5;
  }
  if (f.p === 'C' && bl1Marked(e)) k *= f.deadalive ? 3 : BL1.markK;
  return k;
}
// Lucky shot: every hit on an Elite crits. The crit is rolled after the dmgMul hooks (game.js damageEnemy), so the chance is set there.
hookOn('dmgMul', 'baseline1:lucky', (e, src) => {
  const w = src && src.w; if (!w || !w.bl1 || !w.bl1.lucky || src.wupEcho || src.echo) return 1;
  if (src.bl1c0 == null) src.bl1c0 = src.crit != null ? src.crit : G.P.crit;
  src.crit = bl1Elite(e) ? 1 : src.bl1c0;
  return 1;
});
function bl1Hit(w, e, res, src) {
  const f = bl1F(w);
  if (f.p === 'A' && f.blood && res && res.toHp > 0) fightStatus(e, 'arcane', res.raw || res.toHp, src); // First blood
  if (f.p === 'B') {
    if (res && res.crit) { e.bl1critT = G.t; if (f.feel) { /* (doubled crit damage: the dmg hook can't see the roll, so it lands as an echo) */ damageEnemy(e, (res.toHp || 0), bl1Src(w, 'proj', { echo: true, noStatus: true })); } }
    if (src.bl1last) { bl1Heavy(e, w, 1); ring(e.x, e.y, e.r + 14, '#ffffff', 0.3, 6); cam.shake = Math.min(8, cam.shake + 2); }
  }
  if (f.p === 'C') {
    if (src.bl1rocket && !src.bl1boom) { src.bl1boom = 1; aoe(e.x, e.y, BL1.rocketR, w.s.dmg * BL1.rocketK, bl1Src(w, 'burst'), w.def.color); ring(e.x, e.y, BL1.rocketR, bl1Pale, 0.25, 3); }
    if (f.deadalive && bl1Marked(e) && !e.boss && !e.dead && e.hp > 0 && e.hp < e.maxHp * 0.15) { damageEnemy(e, e.hp * 3, bl1Src(w, 'proj', { noCrit: true })); bl1Say('doa', e.x, e.y - e.r - 14, 'TODO_COPY:si_doa_float', bl1Pale, 13, 0.5); }
  }
}
function bl1Kill(w, e) {
  const f = bl1F(w);
  if (f.p === 'B' && f.makeday && e.bl1critT === G.t) { w.ammo = w.s.mag; w.reloadT = 0; f.nextCrit = 1; ring(G.player.x, G.player.y, 22, bl1Pale, 0.3, 3); }
  if (f.p === 'C' && bl1Marked(e)) { bl1Unmark(e); if (f.prime) bl1MarkNew(w, true); }
}

// ---------------------------------------------------------------- the mark (Robocop)
const bl1Marked = e => !!(e && e.bl1mk);
function bl1Mark(x, y, range) { // the nearest live mark in range, or null
  const S = bl1S(); let best = null, bd = range * range;
  S.marks = S.marks.filter(e => !e.dead && e.bl1mk);
  for (const e of S.marks) { const d2 = (e.x - x) ** 2 + (e.y - y) ** 2; if (d2 < bd) { bd = d2; best = e; } }
  return best;
}
function bl1Unmark(e) { if (!e) return; e.bl1mk = 0; const S = bl1S(); S.marks = S.marks.filter(x => x !== e); if (G.grudge === e) G.grudge = null; }
function bl1SetMark(w, e, byHand) {
  if (!e || e.dead || e.egg || e.charmed) return false;
  const S = bl1S(), f = bl1F(w), cap = f.rich ? 2 : 1;
  S.marks = S.marks.filter(x => !x.dead && x.bl1mk && x !== e);
  while (S.marks.length >= cap) bl1Unmark(S.marks[0]);
  e.bl1mk = 1; e.bl1mkT = G.t; S.marks.push(e); G.grudge = e;
  ring(e.x, e.y, e.r + 10, '#ff4d6d', 0.35, 4); bl1Say('mark', e.x, e.y - e.r - 12, byHand ? 'TODO_COPY:si_mark_tap_float' : 'TODO_COPY:si_mark_float', '#ff4d6d', 12, 0.4);
  return true;
}
function bl1MarkNew(w, now) { // the nearest Elite in range, else the nearest enemy
  const p = G.player, r = BL1.markRange;
  let best = null, bd = 1e18, bestE = null, bdE = 1e18;
  forNear(p.x, p.y, r, (e, d2) => { if (e.dead || e.egg || e.charmed || e.bl1mk) return false; if (bl1Elite(e) && d2 < bdE) { bdE = d2; bestE = e; } if (d2 < bd) { bd = d2; best = e; } return false; });
  const e = bestE || best; if (e) bl1SetMark(w, e, false);
  return !!e;
}
function bl1Tick(w, dt) {
  const f = bl1F(w);
  if (f.cdK) { w.cd *= f.cdK; f.cdK = 0; }
  if (f.p !== 'C') return;
  const S = bl1S();
  S.marks = S.marks.filter(e => !e.dead && e.bl1mk);
  if (!f.prime) for (const e of S.marks.slice()) if (G.t - e.bl1mkT > BL1.markEvery * 2) bl1Unmark(e); // (a mark the shots never reach fades)
  if (G.t >= S.markT && (f.rich ? S.marks.length < 2 : !S.marks.length)) { S.markT = G.t + BL1.markEvery; bl1MarkNew(w, false); }
}
// Tap an enemy on the slide to mark it by hand (Robocop).
(function () {
  const cv = document.getElementById('game'); if (!cv) return;
  let d0 = null;
  cv.addEventListener('pointerdown', ev => { d0 = { x: ev.clientX, y: ev.clientY, t: performance.now() }; }, true);
  cv.addEventListener('pointerup', ev => {
    if (!d0 || !G || G.state !== 'play') return;
    const moved = Math.hypot(ev.clientX - d0.x, ev.clientY - d0.y), held = performance.now() - d0.t; d0 = null;
    if (moved > 12 || held > 350) return;
    const w = bl1W(); if (!w || bl1F(w).p !== 'C') return;
    const r = cv.getBoundingClientRect(), wx = (ev.clientX - r.left) * (W / r.width) / S + cam.x - W / 2 / S, wy = (ev.clientY - r.top) * (H / r.height) / S + cam.y - H / 2 / S;
    let best = null, bd = BL1.tapR * BL1.tapR;
    for (const e of G.enemies) { if (e.dead || e.egg) continue; const d2 = (e.x - wx) ** 2 + (e.y - wy) ** 2 - e.r * e.r; if (d2 < bd) { bd = d2; best = e; } }
    if (best) bl1SetMark(w, best, true);
  }, true);
})();

// ---------------------------------------------------------------- the FINISHER directive (Improved targeting)
DIRECTIVES.push({ id: 'finisher', name: 'TODO_COPY:dir_fin', short: 'FINISH', desc: 'TODO_COPY:dir_fin_desc' });
const bl1Finisher = () => { const w = bl1W(); return !!(w && bl1F(w).p === 'C' && bl1F(w).targeting); };
aimList = (orig => function () { const L = orig(); return bl1Finisher() ? L : L.filter(d => d.id !== 'finisher'); })(aimList);
targetScore = (orig => function (dir, e, d2) {
  if (dir === 'finisher') return (!e.boss && e.hp < e.maxHp * 0.15 ? 1e12 : 0) - d2;
  return orig(dir, e, d2);
})(targetScore);

// ---------------------------------------------------------------- install and the cards
function bl1Install(w) {
  const f = bl1F(w); if (f.inst) return; f.inst = 1;
  wupOn(w, 'stats', bl1Stats); wupOn(w, 'fire', bl1Fire); wupOn(w, 'dmg', bl1Dmg); wupOn(w, 'hit', bl1Hit); wupOn(w, 'kill', bl1Kill); wupOn(w, 'tick', bl1Tick);
}
(function () {
  const C = (name, desc, apply) => ({ name, desc, apply });
  const set = k => w => { bl1F(w)[k] = 1; if (k === 'beltfed') { computeStats(w); w.ammo = w.s.mag; w.reloadT = 0; } };
  const P = k => w => { bl1F(w).p = k; bl1Install(w); recomputeAll(); };
  wupReg(BL1.SI, {
    A: { name: 'Rambo', tag: 'TODO_COPY:si_rambo_tag', costs: 'TODO_COPY:si_rambo_costs', shows: 'a headband with two ribbons.', modes: 'ORBIT keeps the magazine busy.',
      lv3: { desc: 'TODO_COPY:si_rambo_desc', apply: P('A') },
      lv6: [C('Faster and faster', 'TODO_COPY:si_faster_desc', set('faster')), C('First blood', 'TODO_COPY:si_firstblood_desc', set('blood'))],
      wild: C('TODO_COPY:si_hot_name', 'TODO_COPY:si_hot_desc', set('hot')) },
    B: { name: 'Dirty Harry', tag: 'TODO_COPY:si_harry_tag', costs: 'TODO_COPY:si_harry_costs', shows: 'a dark visor band and long tracers.', modes: 'HUNT and ELITES & BOSSES, which pick one target.',
      lv3: { desc: 'TODO_COPY:si_harry_desc', apply: P('B') },
      lv6: [C('Lucky shot', 'TODO_COPY:si_lucky_desc', set('lucky')), C('TODO_COPY:si_six_name', 'TODO_COPY:si_six_desc', set('six'))],
      wild: C('TODO_COPY:si_feel_name', 'TODO_COPY:si_feel_desc', set('feel')) },
    C: { name: 'Robocop', tag: 'TODO_COPY:si_robo_tag', costs: 'TODO_COPY:si_robo_costs', shows: 'a chrome head with a sweeping red visor; the mark wears a crosshair.', modes: 'REVENGE follows the mark.',
      lv3: { desc: 'TODO_COPY:si_robo_desc', apply: P('C') },
      lv6: [C('Improved targeting', 'TODO_COPY:si_targeting_desc', set('targeting')), C('TODO_COPY:si_prime_name', 'TODO_COPY:si_prime_desc', set('prime'))],
      wild: C('TODO_COPY:si_rich_name', 'TODO_COPY:si_rich_desc', set('rich')) },
    lv10: [
      { name: 'TODO_COPY:si_beltfed_name', best: 'A', desc: 'TODO_COPY:si_beltfed_desc', apply: set('beltfed') },
      { name: 'TODO_COPY:si_makeday_name', best: 'B', desc: 'TODO_COPY:si_makeday_desc', apply: set('makeday') },
      { name: 'TODO_COPY:si_doa_name', best: 'C', desc: 'TODO_COPY:si_doa_desc', apply: set('deadalive') }] });
})();

// ---------------------------------------------------------------- gated Feats
const bl1Fk = (id, title, desc) => ({ id, title, desc });
feat({ id: 'quick_draw', name: 'Quick draw', icon: 'QD', ico: 'nova', type: 'force', atk: 'proj', trig: 1, ev: 1, rar: 1, stam: 10, gate: () => bl1P() === 'B',
  line: 'TODO_COPY:feat_quickdraw_line', does: 'TODO_COPY:feat_quickdraw_does',
  base: { dmg: 24, cd: 4, range: BL1.quickR },
  stat: (w, s) => { if (f10Fk(w, 'reach')) s.range *= 1.5; if (f10Fk(w, 'fast')) s.cd *= 0.6; },
  fire: (w, c) => {
    const p = me(), e = c.e; if (!e || e.dead) return;
    const si = bl1W(), dmg = (si ? si.s.dmg : w.s.dmg) * (f10Fk(w, 'triple') ? 3 : 2), n = f10Fk(w, 'two') ? 2 : 1;
    for (let i = 0; i < n; i++) after(i * 0.08, () => { if (e.dead) return; const a = Math.atan2(e.y - p.y, e.x - p.x); if (si && bl1Live(si)) spawnProj(si, p.x, p.y, a, Object.assign(weaponSrc(si), { crit: 1, wupEcho: true, wname: w.def.name }), { dmg }); else f10Hit(w, e, dmg, 'proj', { crit: 1 }); });
    bolt(p.x, p.y, e.x, e.y, bl1Pale, 0.12); bl1Say('qd', p.x, p.y - 30, 'TODO_COPY:feat_quickdraw_float', bl1Pale, 13, 0.5);
    e.bl1qdT = G.t;
  },
  forks: { 3: [bl1Fk('reach', 'TODO_COPY:feat_qd_reach_name', 'TODO_COPY:feat_qd_reach_desc'), bl1Fk('triple', 'TODO_COPY:feat_qd_triple_name', 'TODO_COPY:feat_qd_triple_desc')],
    5: [bl1Fk('two', 'TODO_COPY:feat_qd_two_name', 'TODO_COPY:feat_qd_two_desc'), bl1Fk('fast', 'TODO_COPY:feat_qd_fast_name', 'TODO_COPY:feat_qd_fast_desc')] } });
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
  line: 'TODO_COPY:feat_acidbath_line', does: 'TODO_COPY:feat_acidbath_does',
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
  forks: { 3: [bl1Fk('bigger', 'TODO_COPY:feat_ab_bigger_name', 'TODO_COPY:feat_ab_bigger_desc'), bl1Fk('full', 'TODO_COPY:feat_ab_full_name', 'TODO_COPY:feat_ab_full_desc')],
    5: [bl1Fk('two', 'TODO_COPY:feat_ab_two_name', 'TODO_COPY:feat_ab_two_desc'), bl1Fk('longer', 'TODO_COPY:feat_ab_longer_name', 'TODO_COPY:feat_ab_longer_desc')] } });

for (const id of ['quick_draw', 'acid_bath']) { // only once the branch is taken (and never twice)
  const c = typeof CARDS !== 'undefined' && CARDS.find(x => x.id === 'feat_' + id); if (c) c.eligible = g => !!(F10[id].gate() && !f10Own(id));
}
// The old Standard Issue branch scenes (sidemo.js) belong to the retired cards: branch screens use the plain layout until new scenes exist.
if (typeof SIV_DRAFT !== 'undefined') SIV_DRAFT = false;

// ---------------------------------------------------------------- costumes
function bl1Costume(px, py) {
  if (!G || !G.player) return;
  const w = bl1W(), p = bl1P(); if (!w || !p) return;
  const pl = G.player, k = S * (typeof playerScale === 'function' ? playerScale() : 1), face = pl.hd != null ? pl.hd : pl.face, t = G.realT;
  const raw = RAW_COL; RAW_COL = true;
  ctx.save(); ctx.translate(px, py); ctx.rotate(face + (pl.yaw || 0)); ctx.lineCap = 'round';
  if (p === 'A') { // Rambo: a headband round the head with two ribbons streaming behind it
    ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2.4 * k; ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.moveTo(1 * k, -7 * k); ctx.lineTo(1 * k, 7 * k); ctx.stroke();
    ctx.lineWidth = 1.8 * k;
    for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, sgn * 5.5 * k); for (let i = 1; i <= 6; i++) { const f = i / 6; ctx.lineTo(-f * 30 * k, sgn * (6 + 4 * f) * k + Math.sin(t * 14 - f * 6) * 3 * k * f); } ctx.stroke(); }
  }
  if (p === 'B') { // Dirty Harry: a dark visor band across the head, and a glint
    ctx.strokeStyle = 'rgb(24,28,26)'; ctx.lineWidth = 4 * k; ctx.globalAlpha = 0.92;
    ctx.beginPath(); ctx.moveTo(3.5 * k, -7 * k); ctx.lineTo(3.5 * k, 7 * k); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1 * k; ctx.globalAlpha = 0.5 + 0.4 * Math.max(0, Math.sin(t * 3));
    ctx.beginPath(); ctx.moveTo(3.9 * k, -4 * k); ctx.lineTo(3.9 * k, -1.5 * k); ctx.stroke();
  }
  if (p === 'C') { // Robocop: a chrome plate over the head and a red visor line that sweeps
    ctx.globalAlpha = 0.55; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(1.5 * k, 0, 7 * k, 4.6 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.strokeStyle = 'rgb(58,64,60)'; ctx.lineWidth = 1 * k; ctx.stroke();
    const sw = Math.sin(t * 5) * 3.2 * k;
    ctx.strokeStyle = '#ff2e2e'; ctx.lineWidth = 2.2 * k; ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.moveTo(4.5 * k, sw - 2 * k); ctx.lineTo(4.5 * k, sw + 2 * k); ctx.stroke();
  }
  ctx.restore();
  if (p === 'C') for (const e of bl1S().marks) { // the mark: a crosshair ring in the world
    if (e.dead || !e.bl1mk) continue;
    const x = sx(e.x), y = sy(e.y), r = (e.r + 9) * S, a = t * 1.5;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.strokeStyle = '#ff2e2e'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 4; i++) { const q = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(q) * (r - 5), Math.sin(q) * (r - 5)); ctx.lineTo(Math.cos(q) * (r + 6), Math.sin(q) * (r + 6)); ctx.stroke(); }
    ctx.restore();
  }
  ctx.globalAlpha = 1; RAW_COL = raw;
}
drawPlates = (orig => function (px, py) { orig(px, py); try { bl1Costume(px, py); } catch (e) { } })(drawPlates);
