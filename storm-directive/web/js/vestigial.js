'use strict';
// Spawn Prawn - Vestigial Masses: hidden growths that reward exploring (user, 28 Oct).
//  - WHERE: a few lumps of tissue grow off the beaten track. The Race and Endless/Petri Dish place them inside the arena
//    (VM.near to VM.far from the core, at least VM.gap from you and each other); a new one grows every VM.every s while
//    fewer than VM.max are waiting, up to VM.total a run. Level 1 places VM.lv of them at the start on floor cells off
//    the shortest route (a detour of VM.lvDetour cells or more by levels.js dPl + dEx, VM.lvMin cells or more from the start), so dead ends are worth a look.
//  - QUIET: a mass is drawn small and dim and nothing points at it. Within VM.reveal of you it wakes: a banner, a
//    sound, a glow with pings and an edge pointer while it waits. Some have guardians (VM.guardP): VM.guards[0..1]
//    enemies of kinds already on the slide, tougher (VM.guardHp), wake round it at the reveal.
//  - THE POP: touch it. VM.slotP of the time, when a weapon mount is free, a weapon draft (three new weapons);
//    otherwise a card screen whose stat cards roll Legendary, Mythical or Celestial (VM.rar weights; statup.js steps
//    6, 8 and 10). Both go through G.lootQueue, so wave mode opens them at the break like everything else.
// Hooks: render.js drawHud -> vmPointers (edge pointer). Wraps v10Draw (the masses, world space), v10Loot and draftBox
// (the weapon draft from a mass opens in every mode, the Race included), wmStatRar (the rarity roll). hookOn('tick').
// Save data: none (G.vm is run state; G.stats.masses counts pops). Loads after kindred.js, wmods.js and levels.js.

const VM = { reveal: 620, touch: 46, gap: 900, near: 0.4, far: 0.92, every: 110, max: 2, total: 6, raceMax: 3, raceTotal: 9,
  lv: 4, lvMin: 12, lvDetour: 8, guardP: 0.5, guards: [2, 4], guardHp: 2.5, slotP: 0.3, rar: [[4, 50], [5, 35], [6, 15]],
  col: '#d9567f', hi: '#ffb0c8', dk: '#5a1030', gold: '#ffd23f' };

const vmOn = () => !!(G && G.state === 'play' && !G.debug && !(typeof sbOn === 'function' && sbOn()) && (G.lvl ? G.lvl.dPl : G.core));
const vmS = () => G.vm || (G.vm = { list: [], n: 0, nextT: 20, lvDone: false });

// ---------------------------------------------------------------- placing them
function vmPlace() {
  const S = vmS(), p = G.player;
  if (G.lvl) { // Level 1: off the shortest route, spread out
    const V = G.lvl, L = V.dEx[lvIdx(p.x, p.y)] ?? 0, cells = [];
    for (let i = 0; i < V.grid.length; i++) {
      if (V.grid[i] !== LV_T.floor) continue;
      const a = V.dPl[i], b = V.dEx[i]; if (a == null || b == null || a < VM.lvMin || a > 1e8 || b > 1e8) continue;
      if (a + b - L >= VM.lvDetour) cells.push(i);
    }
    for (const i of shuffle(cells)) {
      if (S.list.length >= VM.lv) break;
      const c = lvCentre(i); if (S.list.some(m => Math.hypot(m.x - c.x, m.y - c.y) < VM.gap)) continue;
      vmAdd(c.x, c.y);
    }
    return;
  }
  const c = G.core, R = CORE.arena;
  for (let k = 0; k < 40; k++) {
    const a = Math.random() * TAU, d = R * (VM.near + Math.random() * (VM.far - VM.near)), x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
    if (Math.hypot(x - p.x, y - p.y) < VM.gap || S.list.some(m => Math.hypot(m.x - x, m.y - y) < VM.gap)) continue;
    if (typeof terrainDanger === 'function' && terrainDanger(x, y, 80)) continue;
    vmAdd(x, y); return;
  }
}
function vmAdd(x, y) { const S = vmS(); S.n++; S.list.push({ x, y, seen: false, t: 0, seed: Math.random() * 100, guard: Math.random() < VM.guardP }); }

// ---------------------------------------------------------------- every frame
hookOn('tick', 'vm:tick', dt => {
  if (!vmOn()) return;
  const S = vmS(), p = G.player;
  if (G.lvl) { if (!S.lvDone) { S.lvDone = true; vmPlace(); } }
  else {
    const race = !G.wave, max = race ? VM.raceMax : VM.max, total = race ? VM.raceTotal : VM.total;
    if (G.t >= S.nextT) { S.nextT = G.t + VM.every; if (S.list.length < max && S.n < total) vmPlace(); }
  }
  for (const m of S.list) {
    m.t += dt;
    const d = Math.hypot(m.x - p.x, m.y - p.y);
    if (!m.seen && d < VM.reveal) vmReveal(m);
    if (d < VM.touch + (p.r || 12)) vmPop(m);
  }
  S.list = S.list.filter(m => !m.gone);
});

function vmReveal(m) {
  m.seen = true; m.seenT = G.realT;
  banner('VESTIGIAL MASS', VM.hi); sfx('pickup'); vibrate(60);
  ring(m.x, m.y, 140, VM.hi, 0.6, 4);
  if (!m.guard) return;
  const kinds = [...new Set(G.enemies.filter(e => !e.dead && !e.boss && !e.elite && !e.rival && !e.egg && !e.charmed && e.def && !e.def.spongy).map(e => e.def))];
  const def = kinds.length ? pick(kinds) : ENEMIES.crawler, n = VM.guards[0] + Math.floor(Math.random() * (VM.guards[1] - VM.guards[0] + 1));
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, e = makeEnemy(def, m.x + Math.cos(a) * 70, m.y + Math.sin(a) * 70);
    e.hp = e.maxHp = e.maxHp * VM.guardHp; e.vmGuard = true;
    G.enemies.push(e);
    if (typeof fxParts === 'function') fxParts('smoke', e.x, e.y, VM.dk, 6, 60, 0.5, 3);
  }
}

function vmPop(m) {
  m.gone = true;
  const free = G.weapons.filter(Boolean).length < MAX_WEAPONS;
  const slot = free && Math.random() < VM.slotP;
  G.lootQueue.push(slot ? { kind: 'slot', mass: true } : { kind: 'level', mass: true });
  G.stats.masses = (G.stats.masses || 0) + 1;
  banner(slot ? 'VESTIGIAL MASS: A NEW WEAPON' : 'VESTIGIAL MASS: SOMETHING RARE', VM.gold);
  sfx('level'); vibrate([60, 30, 90]); cam.shake = Math.min(10, cam.shake + 4);
  ring(m.x, m.y, 90, VM.hi, 0.5, 6); ring(m.x, m.y, 170, VM.gold, 0.7, 4);
  if (typeof fxParts === 'function') { fxParts('spark', m.x, m.y, VM.gold, 18, 200, 0.7, 3); fxParts('smoke', m.x, m.y, VM.col, 14, 120, 0.8, 5); }
}

// ---------------------------------------------------------------- the rewards
wmStatRar = (orig => function () {
  const q = typeof UI !== 'undefined' && UI.lootReq;
  if (!(q && q.mass)) return orig.apply(this, arguments);
  const tot = VM.rar.reduce((a, r) => a + r[1], 0); let x = Math.random() * tot;
  for (const [i, w] of VM.rar) { x -= w; if (x <= 0) return Math.min(WM.statSteps.length - 1, i); }
  return 4;
})(wmStatRar);
draftBox = (orig => function (req) {
  if (req && req.mass && req.kind === 'slot') { // (opens in every mode, the Race included; dropped once every mount is full)
    if (G.weapons.filter(Boolean).length >= MAX_WEAPONS) return false;
    return typeof dirGate === 'function' ? dirGate(req) : true;
  }
  return orig.apply(this, arguments);
})(draftBox);
v10Loot = (orig => function (req) {
  if (!(req && req.mass && req.kind === 'slot')) return orig.apply(this, arguments);
  const own = G.weapons.filter(Boolean);
  const pool = shuffle(v10Pool().filter(id => WEAPONS[id] && !own.some(w => (w.sid || w.id) === id))).slice(0, 3);
  return pool.map(id => { const o = optNewWeapon(id, 0), ap = o.apply; o.apply = () => { if (!G.weapons.some(w => !w)) G.weapons.push(null); ap(); }; return o; });
})(v10Loot);

// ---------------------------------------------------------------- drawing (world space, after the v10 layer)
v10Draw = (orig => function () { orig(); if (G && G.vm && G.vm.list.length) vmDraw(); })(v10Draw);
function vmDraw() {
  const t = G.realT, rc = RAW_COL; RAW_COL = true;
  for (const m of G.vm.list) {
    const x = sx(m.x), y = sy(m.y); if (x < -200 || y < -200 || x > W + 200 || y > H + 200) continue;
    const k = S, beat = 0.5 + 0.5 * Math.sin(t * (m.seen ? 3 : 1.4) + m.seed), r = (m.seen ? 30 : 22) * k * (1 + 0.08 * beat);
    ctx.save();
    if (m.seen) { // awake: a glow and slow pings
      ctx.globalCompositeOperation = 'lighter';
      glow(x, y, r * 3.2, VM.col, 0.35 + 0.2 * beat);
      for (let i = 0; i < 2; i++) { const ph = (t * 0.6 + i / 2) % 1; ctx.globalAlpha = 0.5 * (1 - ph); ctx.strokeStyle = VM.hi; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 160 * k * ph, 0, TAU); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = m.seen ? 1 : 0.6;
    // A lumpy body: a ring of bulges round a core, with dark veins.
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, b = 1 + 0.16 * Math.sin(a * 5 + m.seed) + 0.08 * Math.sin(a * 3 - t * 1.5 + m.seed); ctx.lineTo(x + Math.cos(a) * r * b, y + Math.sin(a) * r * b * 0.86); }
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.2); g.addColorStop(0, VM.hi); g.addColorStop(0.55, VM.col); g.addColorStop(1, VM.dk);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = VM.dk; ctx.lineWidth = Math.max(1, 1.6 * k); ctx.stroke();
    ctx.strokeStyle = VM.dk; ctx.globalAlpha *= 0.6; ctx.lineWidth = Math.max(0.6, 0.9 * k); ctx.beginPath();
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + m.seed; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a + 0.5) * r * 0.5, y + Math.sin(a + 0.5) * r * 0.5, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.8); }
    ctx.stroke();
    // Little nodules on top.
    ctx.globalAlpha = m.seen ? 1 : 0.6; ctx.fillStyle = VM.hi;
    for (let i = 0; i < 4; i++) { const a = i * 1.7 + m.seed; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.45, r * (0.12 + 0.04 * Math.sin(t * 2 + i)), 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  RAW_COL = rc;
}
// Screen space (render.js drawHud): an edge badge for an awake mass that is off screen.
function vmPointers() {
  if (!G || !G.vm || !G.vm.list.length) return;
  const rc = RAW_COL; RAW_COL = true;
  for (const m of G.vm.list) {
    if (!m.seen) continue;
    const dx = (m.x - cam.x) * S, dy = (m.y - cam.y) * S;
    if (Math.abs(dx) < W / 2 - 30 && Math.abs(dy) < H / 2 - 30) continue;
    const a = Math.atan2(dy, dx), hw = W / 2 - 40, hh = H / 2 - 40, d = Math.min(hw / Math.abs(Math.cos(a) || 1e-6), hh / Math.abs(Math.sin(a) || 1e-6));
    const px = W / 2 + Math.cos(a) * d, py = clamp(H / 2 + Math.sin(a) * d, (UI.safeTop || 0) + 110, H - (UI.bottomH || 200) - 30);
    ctx.save(); ctx.globalAlpha = 0.85 + 0.15 * Math.sin(G.realT * 5);
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.arc(px, py, 14, 0, TAU); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = VM.hi; ctx.stroke();
    ctx.fillStyle = VM.col; ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.fill();
    ctx.translate(px + Math.cos(a) * 22, py + Math.sin(a) * 22); ctx.rotate(a);
    ctx.fillStyle = VM.hi; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, 7); ctx.lineTo(-5, -7); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  RAW_COL = rc;
}
