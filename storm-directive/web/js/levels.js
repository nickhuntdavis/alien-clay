'use strict';
// Spawn Prawn - campaign levels. Hand-built mazes through the body, one after another, each a run of its own
// (you start fresh at Lv 1; DNA and the Gene Bank carry over as usual). A level is data: an ASCII map plus
// its zones, arenas, boss and hazards, so the next level is content rather than code.
//
// The map, one character per cell (LV_C units square), row 0 at the far end:
//   #  flesh (wall)        T  tooth (wall)          p  plaque: a wall you can shoot through
//   .  floor               ~  saliva: slows everything in it
//   1-9 a gate: shut until its arena (or boss) is beaten
//   S  start               E  the exit (the thing that looks like an egg)
//   f  food scrap: shoot it for a pick-up       v  a cavity: guarded, with something inside
//
// Two route maps (breadth-first, over the cells) drive everything that has to get round walls: one to the
// exit (autorun's "push on", the progress bar) and one to you (enemies chasing you round corners, spawn
// points out of sight along the corridors).
// Hooks: lvInit (newGame), lvTick (the director), lvPlayer / lvBody / lvShot (terrain.js), lvSteer
// (steerTerrain), lvChase (updateEnemies), lvSpawnPos (spawnPos), lvSlow, lvPushOn (autoSteer), drawLevel /
// drawLevelHud / drawLevelMap (render.js), lvOver (the end screen).

const LV_C = 80;
const LV_T = { floor: 0, wall: 1, tooth: 2, plaque: 3, saliva: 4, gate: 5, exit: 6 };
const LV_SAMPLE = { s007: 0 };

// The mouth's own germs: existing behaviours under new names.
const LV_FOES = {
  mutans:  Object.assign({}, ENEMIES.crawler, { id: 'mutans', name: 'Cavity Creep', color: '#f6d7a7', shape: 'cell', r: 11, hp: 14, speed: 66 }),
  strep:   Object.assign({}, ENEMIES.wisp, { id: 'strep', name: 'Strep Chain', color: '#ffe1ec', shape: 'cell', group: 8 }),
  thrush:  Object.assign({}, ENEMIES.spitter, { id: 'thrush', name: 'Thrush Spore', color: '#fff4d6', shape: 'yeast' }),
  amylase: Object.assign({}, ENEMIES.bomber, { id: 'amylase', name: 'Amylase Droplet', color: '#bde0fe' }),
  tartar:  Object.assign({}, ENEMIES.bulwark, { id: 'tartar', name: 'Tartar Crust', color: '#efe0b0' }),
};
for (const id in LV_FOES) { LV_FOES[id].from = 99999; LV_FOES[id].w = 0; }
Object.assign(ENEMY_INTRO, {
  mutans:  { what: 'The bacterium behind every cavity. Eats sugar, makes acid, never stops coming.', tip: 'Fodder. Keep moving and let your weapons chew through them.' },
  strep:   { what: 'A string of beads that slithers down the gum trenches all at once.', tip: 'One hit pops a bead. Anything that hits a line hits all of them.' },
  thrush:  { what: 'A spore of oral thrush. It hangs back and spits.', tip: 'Its spit is slow: swim across it, not along it.' },
  amylase: { what: 'A drop of the enzyme in spit. It drifts at you and bursts.', tip: 'Shoot it before it reaches you, or let it pop on the crowd.' },
  tartar:  { what: 'Hardened plaque that walks. Heavily armoured, and it shields the germs behind it.', tip: 'Shred, Static and big hits. Or go round.' },
});
// The Tartar Colony: the Colossus's moves in calcified plaque.
const LV_BOSSES = {
  tartar: Object.assign({}, BOSSES.find(b => b.id === 'colossus'), { id: 'tartar', name: 'THE TARTAR COLONY', title: 'Calcified, and Proud of It', color: '#efe0b0', shape: 'cell',
    hp: 2600, armour: 8, quote: 'Twenty years without a dentist. We built a city.',
    desc: 'A slab of hardened plaque at the back of the throat. Armoured, it cannot be shoved, and it charges in straight lines.',
    strengths: ['8 armour: small hits barely scratch it', 'Cannot be knocked back'], weaknesses: ['Static: +60% damage', 'Charges are telegraphed: side-step', 'The tonsils make good cover'] }),
};

const LEVELS = [{
  id: 'mouth', no: 1, name: 'THE MOUTH', sub: 'Lips to throat', next: 'Esophagus Descent',
  exitName: 'TONSIL STONE', exitText: 'The Egg is in another castle.',
  // Time on the difficulty clock at the start and at the exit (enemy toughness follows your progress).
  pt: [10, 200], par: 540,
  zones: [ // by row, far end first
    { name: 'THE THROAT', to: 23, floor: '#c25a7c', mix: { mutans: 5, strep: 4, amylase: 3, tartar: 3, thrush: 3 }, rate: 2.6, max: 55, cough: true },
    { name: 'THE TONGUE', to: 62, floor: '#e8909a', mix: { mutans: 6, strep: 4, amylase: 3, tartar: 2, thrush: 2 }, rate: 2.8, max: 55, cough: true, wash: [34, 60] },
    { name: 'THE GUM LINE', to: 108, floor: '#eba3b4', mix: { mutans: 8, strep: 4, thrush: 3 }, rate: 2.0, max: 40, colonies: true },
    { name: 'THE LIPS', to: 999, floor: '#f4bccb', mix: { mutans: 10 }, rate: 1.0, max: 22 },
  ],
  arenas: [ // cells [x0, y0, x1, y1]; quota: kills to open its gate
    { gate: '1', rect: [4, 112, 23, 123], quota: 30, name: 'BEHIND THE FRONT TEETH', mix: { mutans: 10 } },
    { gate: '2', rect: [3, 76, 19, 86], quota: 70, name: 'THE GUM POCKET', mix: { mutans: 6, strep: 4, thrush: 3 } },
    { rect: [4, 44, 23, 51], quota: 90, name: 'THE PAPILLAE', mix: { mutans: 5, strep: 4, amylase: 3, tartar: 1, thrush: 2 } }, // (no gate: the membrane round it is the only lock)
    { gate: '3', rect: [5, 24, 22, 32], quota: 110, name: 'THE BACK OF THE TONGUE', mix: { mutans: 5, strep: 4, amylase: 3, tartar: 2, thrush: 3 } },
  ],
  boss: { id: 'tartar', gate: '4', rect: [4, 8, 23, 17], mix: { mutans: 6, tartar: 2 } },
  map: [
    '############################',
    '############################',
    '###########......###########',
    '##########...EE...##########',
    '##########........##########',
    '###########......###########',
    '############4444############',
    '############4444############',
    '##########........##########',
    '#######..............#######',
    '######................######',
    '#####...TT........TT...#####',
    '#####...TT........TT...#####',
    '####....................####',
    '#####...TT........TT...#####',
    '#####...TT........TT...#####',
    '######................######',
    '#######..............#######',
    '##########........##########',
    '###########..~~..###########',
    '###########..~~..###########',
    '###########..~~..###########',
    '###########......###########',
    '###########333333###########',
    '##########........##########',
    '########............########',
    '######................######',
    '######.....~~~~~~.....######',
    '#####.....~~~~~~~~.....#####',
    '######.....~~~~~~.....######',
    '######................######',
    '########............########',
    '##########........##########',
    '###########......###########',
    '###......................###',
    '###.#..................#.###',
    '###......................###',
    '###...TT............TT...###',
    '###...TT............TT...###',
    '###..........TT..........###',
    '###..........TT..........###',
    '###............~~~.......###',
    '###............~~~.......###',
    '###......................###',
    '####....................####',
    '###......TT..............###',
    '###......TT......TT......###',
    '###..............TT......###',
    '###...~~~................###',
    '###...~~~................###',
    '###......................###',
    '###......................###',
    '###..TT..............TT..###',
    '###..TT......TT......TT..###',
    '###..........TT..........###',
    '###................~~~...###',
    '####...............~~~..####',
    '###......................###',
    '###......TT.......TT.....###',
    '###......TT.......TT.....###',
    '###......................###',
    '############....#####....###',
    '############....#####....###',
    '############pppp#####....###',
    '############pppp#####....###',
    '############....#####....###',
    '############....#####....###',
    '###......................###',
    '###...................f..###',
    '###..f...................###',
    '###......................###',
    '############....############',
    '############....############',
    '############....############',
    '############....############',
    '############2222############',
    '############....############',
    '##########........##########',
    '#########..........#########',
    '###.................########',
    '###.................########',
    '###.................########',
    '###.................########',
    '###....#............########',
    '###....##..........#########',
    '###....###........##########',
    '###.......##....############',
    '###.......##....############',
    '###....#..##....###......###',
    '###....#..##....###......###',
    '###.f..#..##pppp###...f..###',
    '###....#..##pppp###......###',
    '###....#..##pppp###......###',
    '###....#.f##....###......###',
    '###....#..##....###.f....###',
    '###....#..##....###......###',
    '###....#..##....###......###',
    '###......................###',
    '###....................v.###',
    '###......................###',
    '###.............############',
    '############....############',
    '############....############',
    '############....############',
    '############.f..############',
    '############....############',
    '############....############',
    '############....############',
    '############....############',
    '############....############',
    '############1111############',
    '############....############',
    '############....############',
    '#####TT#TT.TT...TT.TT#TT####',
    '#####TT.TT.TT...TT.TT#TT####',
    '#####..................#####',
    '#####..................#####',
    '####....................####',
    '####....................####',
    '####....................####',
    '#####..................#####',
    '#####..................#####',
    '#######..............#######',
    '########............########',
    '######................######',
    '######.f............f.######',
    '######.......S........######',
    '######................######',
    '############################',
    '############################'

  ],
}];

// ---------------------------------------------------------------- set-up
function lvInit(n) {
  const L = LEVELS[n], w = L.map[0].length, h = L.map.length, N = w * h;
  const V = { L, n, w, h, grid: new Uint8Array(N), gate: new Uint8Array(N), hp: new Float32Array(N), scrap: new Uint8Array(N),
    dEx: new Int16Array(N), dPl: new Int16Array(N), plCell: -1, plT: 0, exT: 0, startD: 1, maxP: 0,
    arena: null, done: {}, kills: 0, boss: null, bossDead: false, won: false, zone: null, msg: {},
    cough: { t: 18, warn: 0, gust: 0 }, wash: { t: 22, warn: 0, y: -1, hit: new Set() }, brush: { y: null }, colonyT: 4, cavity: null, startT: 0 };
  let sx = 0, sy = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = L.map[y][x], i = y * w + x;
    V.grid[i] = ch === '#' ? LV_T.wall : ch === 'T' ? LV_T.tooth : ch === 'p' ? LV_T.plaque : ch === '~' ? LV_T.saliva : ch === 'E' ? LV_T.exit : ch >= '1' && ch <= '9' ? LV_T.gate : LV_T.floor;
    if (ch >= '1' && ch <= '9') V.gate[i] = +ch;
    if (ch === 'p') V.hp[i] = 1;
    if (ch === 'f') V.scrap[i] = 1;
    if (ch === 'v') V.cavity = { x: (x + 0.5) * LV_C, y: (y + 0.5) * LV_C, open: false, ring: false };
    if (ch === 'S') { sx = x; sy = y; }
  }
  G.lvl = V;
  // No egg, no womb, no race: the level's own director runs everything.
  CORE.arena = 1e9; G.core = { x: 0, y: -1e7, r: CORE.r, flash: 0 };
  G.terrain = { list: [], grid: new Map(), regridT: 1e9 };
  G.nextBoss = 1e12; G.nextWave = 1e12; G.nextPill = 1e12; G.nextYeast = 1e12; G.rivalsInit = true; G.ev.next = 1e12;
  G.bossRoster = [L.boss.id]; G.bossCount = 0;
  const p = G.player; p.x = (sx + 0.5) * LV_C; p.y = (sy + 0.5) * LV_C; p.face = -Math.PI / 2;
  cam.x = p.x; cam.y = p.y;
  lvRouteExit(); lvRoutePlayer();
  V.startD = Math.max(1, V.dEx[sy * w + sx]);
}
const lvOn = () => !!(G && G.lvl);
const lvIdx = (x, y) => { const V = G.lvl, cx = Math.floor(x / LV_C), cy = Math.floor(y / LV_C); return cx < 0 || cy < 0 || cx >= V.w || cy >= V.h ? -1 : cy * V.w + cx; };
const lvSolidT = t => t === LV_T.wall || t === LV_T.tooth || t === LV_T.plaque || t === LV_T.gate;
function lvSolidAt(x, y) { const i = lvIdx(x, y); return i < 0 || lvSolidT(G.lvl.grid[i]); }
const lvCentre = i => ({ x: (i % G.lvl.w + 0.5) * LV_C, y: (Math.floor(i / G.lvl.w) + 0.5) * LV_C });

// Breadth-first distances over the cells. passPlaque: plaque counts as open (enemies don't; autorun doesn't).
function lvBfs(out, seeds) {
  const V = G.lvl, w = V.w, N = out.length, q = new Int32Array(N);
  out.fill(-1);
  let head = 0, tail = 0;
  for (const s of seeds) if (s >= 0 && out[s] < 0) { out[s] = 0; q[tail++] = s; }
  while (head < tail) {
    const i = q[head++], d = out[i] + 1, x = i % w;
    const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
    for (const j of nb) {
      if (j < 0 || j >= N || out[j] >= 0 || lvSolidT(V.grid[j])) continue;
      out[j] = d; q[tail++] = j;
    }
  }
}
function lvRouteExit() {
  const V = G.lvl, seeds = [];
  for (let i = 0; i < V.grid.length; i++) if (V.grid[i] === LV_T.exit) seeds.push(i);
  // (Shut gates count as open for the route, so the bar and autorun lead to them.)
  const g = V.grid, shut = [];
  for (let i = 0; i < g.length; i++) if (g[i] === LV_T.gate) { shut.push(i); g[i] = LV_T.floor; }
  lvBfs(V.dEx, seeds);
  for (const i of shut) g[i] = LV_T.gate;
}
function lvRoutePlayer() {
  const V = G.lvl, p = me(), i = lvIdx(p.x, p.y);
  V.plCell = i;
  lvBfs(V.dPl, [i]);
}
// Progress through the level, 0 at the start to 1 at the exit.
function lvProgress() {
  const V = G.lvl, i = lvIdx(me().x, me().y), d = i >= 0 && V.dEx[i] >= 0 ? V.dEx[i] : V.startD;
  V.maxP = Math.max(V.maxP, clamp(1 - d / V.startD, 0, 1));
  return V.maxP;
}
function lvPT() { const L = G.lvl.L; return L.pt[0] + (L.pt[1] - L.pt[0]) * lvProgress() + G.t * 0.1; }
function lvZone() { const V = G.lvl, row = Math.floor(me().y / LV_C); return V.L.zones.find(z => row <= z.to) || V.L.zones[V.L.zones.length - 1]; }

// ---------------------------------------------------------------- collision
// Push a circle out of solid cells (it slides along them). Returns the push normal, or null.
const LV_N = { x: 0, y: 0 };
function lvPush(o, r) {
  const V = G.lvl;
  let hit = false;
  const x0 = Math.floor((o.x - r) / LV_C), x1 = Math.floor((o.x + r) / LV_C), y0 = Math.floor((o.y - r) / LV_C), y1 = Math.floor((o.y + r) / LV_C);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    const out = cx < 0 || cy < 0 || cx >= V.w || cy >= V.h;
    if (!out && !lvSolidT(V.grid[cy * V.w + cx])) continue;
    const bx = cx * LV_C, by = cy * LV_C;
    const nx = clamp(o.x, bx, bx + LV_C), ny = clamp(o.y, by, by + LV_C);
    let dx = o.x - nx, dy = o.y - ny, d = Math.hypot(dx, dy);
    if (d >= r) continue;
    if (d < 0.01) { // centre inside the cell: out the nearest side
      const l = o.x - bx, rr = bx + LV_C - o.x, t = o.y - by, b = by + LV_C - o.y, m = Math.min(l, rr, t, b);
      dx = m === l ? -1 : m === rr ? 1 : 0; dy = m === t ? -1 : m === b ? 1 : 0; d = 0;
      o.x += dx * (m + r); o.y += dy * (m + r);
    } else { o.x += dx / d * (r - d); o.y += dy / d * (r - d); dx /= d; dy /= d; }
    LV_N.x = dx; LV_N.y = dy; hit = true;
  }
  return hit ? LV_N : null;
}
function lvPlayer(p) {
  const V = G.lvl, sf = V.safe;
  // A dash or a blink that ends in a wall, or jumps one (a shut gate included), puts you back where you were.
  if (sf && (lvSolidAt(p.x, p.y) || (Math.abs(p.x - sf.x) + Math.abs(p.y - sf.y) > 30 && !lvSight(sf.x, sf.y, p.x, p.y)))) { p.x = sf.x; p.y = sf.y; p.vx *= 0.3; p.vy *= 0.3; }
  const n = lvPush(p, p.r);
  if (n) { const vn = p.vx * n.x + p.vy * n.y; if (vn < 0) { p.vx -= vn * n.x; p.vy -= vn * n.y; } }
  if (!lvSolidAt(p.x, p.y)) V.safe = { x: p.x, y: p.y };
}
function lvBody(e) { if (!e.def.ethereal) lvPush(e, Math.min(e.r, LV_C * 0.45)); }
// Shots: walls stop them; yours chip plaque and break food scraps. true: the shot is gone.
function lvShot(s, hostile) {
  const V = G.lvl, i = lvIdx(s.x, s.y);
  if (i < 0) { s.dead = true; return true; }
  if (!hostile && V.scrap[i]) lvScrap(i);
  const t = V.grid[i];
  if (!lvSolidT(t)) return false;
  s.dead = true;
  if (t === LV_T.plaque && !hostile) lvChip(i, s.dmg || 10);
  else if (Math.random() < 0.25) spawnPart(s.x, s.y, t === LV_T.tooth ? '#fffaf0' : '#ffb3c6', 1, 50, 0.25, 2);
  return true;
}
// Plaque: a few dozen hits (more further in). Breaking it drops XP and opens a shortcut.
function lvChip(i, dmg) {
  const V = G.lvl, c = lvCentre(i);
  V.hp[i] -= dmg / (120 * hpNow());
  if (Math.random() < 0.3) spawnPart(c.x + rand(-30, 30), c.y + rand(-30, 30), '#ead9a0', 1, 70, 0.4, 2.5);
  if (V.hp[i] > 0) return;
  V.grid[i] = LV_T.floor;
  spawnPart(c.x, c.y, '#ead9a0', 14, 160, 0.6, 3.5); sfx('hit');
  dropGem(c.x, c.y, 2);
  if (!V.msg.plaque) { V.msg.plaque = 1; sysMsg('SYSTEM MESSAGE', 'Plaque gives way if you keep shooting it. Some of it hides a shortcut.', '#ead9a0', true); }
  lvRouteExit(); lvRoutePlayer();
}
function lvScrap(i) {
  const V = G.lvl, c = lvCentre(i);
  V.scrap[i] = 0;
  spawnPart(c.x, c.y, '#c9a26b', 10, 120, 0.5, 3); sfx('pickup');
  G.pickups.push(makePickup(Math.random() < 0.2 ? 'chest' : pick(['heal', 'heal', 'magnet', 'rage'].concat(PU_NEW || [])), c.x, c.y, { t: 'drop', name: 'Food Scrap' }));
}
// Autorun: how bad heading through (x, y) is (walls are felt early, like terrain).
function lvSteer(x, y, r) {
  let dn = 0;
  for (const [ox, oy] of [[0, 0], [r + 26, 0], [-r - 26, 0], [0, r + 26], [0, -r - 26]]) if (lvSolidAt(x + ox, y + oy)) dn += ox || oy ? 1.1 : 4;
  return dn;
}
// Slowing: saliva.
function lvSlow(x, y) { const i = lvIdx(x, y); return i >= 0 && G.lvl.grid[i] === LV_T.saliva ? 0.62 : 1; }

// The way to somewhere along a route map: the centre of the best neighbouring cell (no corner cutting).
function lvNext(dist, i) {
  const V = G.lvl, w = V.w, x = i % w;
  let best = -1, bd = dist[i] < 0 ? 1e9 : dist[i];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const nx = x + dx, j = i + dx + dy * w;
    if (nx < 0 || nx >= w || j < 0 || j >= dist.length || dist[j] < 0 || dist[j] >= bd) continue;
    if (dx && dy && (lvSolidT(V.grid[i + dx]) || lvSolidT(V.grid[i + dy * w]))) continue;
    bd = dist[j]; best = j;
  }
  return best;
}
// Enemies: straight at you when you're close or in sight down a corridor; otherwise round the walls.
const LV_D = { x: 0, y: 0 };
function lvChase(e, ux, uy, dist) {
  const V = G.lvl, i = lvIdx(e.x, e.y);
  if (i < 0 || V.dPl[i] < 0 || V.dPl[i] <= 1 || (dist < 260 && lvSight(e.x, e.y, me().x, me().y))) return null;
  const j = lvNext(V.dPl, i);
  if (j < 0) return null;
  const c = lvCentre(j), dx = c.x - e.x, dy = c.y - e.y, d = Math.hypot(dx, dy) || 1;
  LV_D.x = dx / d; LV_D.y = dy / d;
  return LV_D;
}
function lvSight(x0, y0, x1, y1) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (LV_C * 0.5));
  for (let k = 1; k < n; k++) if (lvSolidAt(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n)) return false;
  return true;
}
// Autorun's pull along the way to the exit (none while an arena or the boss is on: fight there instead).
function lvPushOn(p) {
  const V = G.lvl;
  if (V.arena || (V.boss && !V.bossDead)) return null;
  const i = lvIdx(p.x, p.y);
  if (i < 0) return null;
  const j = lvNext(V.dEx, i);
  return j < 0 ? null : lvCentre(j);
}
// Where to put a new arrival: a floor cell 9 to 14 cells away by the route (out of sight round the bends),
// usually ahead of you. Falls back to further out.
function lvSpawnPos(lo, hi, ahead) {
  const V = G.lvl, p = me(), N = V.grid.length, myEx = V.dEx[lvIdx(p.x, p.y)] ?? 0;
  lo = lo || 9; hi = hi || 14;
  for (let tries = 0; tries < 60; tries++) {
    const i = Math.floor(Math.random() * N), d = V.dPl[i];
    if (d < lo || d > hi || V.grid[i] !== LV_T.floor && V.grid[i] !== LV_T.saliva) continue;
    if (ahead && tries < 40 && V.dEx[i] > myEx) continue;
    const c = lvCentre(i);
    if (Math.abs(c.x - cam.x) < W / 2 / S + 40 && Math.abs(c.y - cam.y) < H / 2 / S + 40) continue;
    return { x: c.x + rand(-20, 20), y: c.y + rand(-20, 20), a: Math.atan2(c.y - p.y, c.x - p.x) };
  }
  return lo > 3 ? lvSpawnPos(Math.max(3, lo - 4), hi + 6, false) : { x: p.x, y: p.y - 400, a: -Math.PI / 2 };
}
// A floor cell inside a rect, away from you (arena arrivals).
function lvRectPos(rc, away) {
  const V = G.lvl, p = me();
  for (let tries = 0; tries < 50; tries++) {
    const x = Math.floor(rand(rc[0], rc[2] + 1)), y = Math.floor(rand(rc[1], rc[3] + 1)), i = y * V.w + x;
    if (lvSolidT(V.grid[i])) continue;
    const c = lvCentre(i);
    if (Math.hypot(c.x - p.x, c.y - p.y) < away) continue;
    return c;
  }
  return lvSpawnPos(4, 10, false);
}
function lvFoe(id) { return LV_FOES[id] || ENEMIES[id] || ENEMIES.crawler; }
function lvPickMix(mix) { let tot = 0; for (const k in mix) tot += mix[k]; let r = Math.random() * tot; for (const k in mix) { r -= mix[k]; if (r <= 0) return k; } return Object.keys(mix)[0]; }
function lvSpawn(mix, at) {
  const d = lvFoe(lvPickMix(mix)), s = at || lvSpawnPos(9, 14, Math.random() < 0.6), k = Math.max(1, Math.ceil((d.group || 1) * 0.6));
  for (let j = 0; j < k; j++) {
    if (G.enemies.length >= CAPS.enemies) return j;
    const e = makeEnemy(d, s.x + rand(-18, 18), s.y + rand(-18, 18));
    lvPush(e, Math.min(e.r, LV_C * 0.45));
    G.enemies.push(e);
  }
  return k;
}
const lvInRect = (rc, x, y) => { const cx = Math.floor(x / LV_C), cy = Math.floor(y / LV_C); return cx >= rc[0] && cx <= rc[2] && cy >= rc[1] && cy <= rc[3]; };
// While an arena or the boss is on, the way back seals too (a membrane over every opening), so the fight
// stays in the room.
function lvLock(rc) {
  const V = G.lvl, lock = [];
  for (let y = rc[1] - 1; y <= rc[3] + 1; y++) for (let x = rc[0] - 1; x <= rc[2] + 1; x++) {
    if (x >= rc[0] && x <= rc[2] && y >= rc[1] && y <= rc[3]) continue;
    if (x < 0 || y < 0 || x >= V.w || y >= V.h) continue;
    const i = y * V.w + x, t = V.grid[i];
    if (lvSolidT(t) || t === LV_T.exit) continue;
    lock.push([i, t]); V.grid[i] = LV_T.gate;
  }
  V.lock = lock;
  lvRoutePlayer();
}
function lvUnlock() {
  const V = G.lvl;
  for (const [i, t] of V.lock || []) if (V.grid[i] === LV_T.gate) V.grid[i] = t;
  V.lock = null;
  lvRoutePlayer();
}
function lvOpenGate(id) {
  const V = G.lvl;
  for (let i = 0; i < V.grid.length; i++) if (V.gate[i] === +id && V.grid[i] === LV_T.gate) { V.grid[i] = LV_T.floor; const c = lvCentre(i); spawnPart(c.x, c.y, '#ff7aa2', 6, 120, 0.6, 3); }
  lvRouteExit(); lvRoutePlayer();
  sfx('level'); vibrate([40, 30, 40]);
}

// ---------------------------------------------------------------- the director (every frame)
function lvTick(dt, maxAlive, hostile) {
  const V = G.lvl, L = V.L, p = me();
  if (V.won) return;
  G.ev.next = 1e12;
  // Route maps: yours whenever you change cell (and twice a second anyway).
  V.plT -= dt;
  if (V.plT <= 0 || lvIdx(p.x, p.y) !== V.plCell) { V.plT = 0.5; lvRoutePlayer(); }
  // Germs that can no longer reach you (sealed out of an arena, cut off behind plaque) and are out of sight
  // drift off, so they don't hold up the next arrivals.
  V.cullT = (V.cullT || 0) - dt;
  if (V.cullT <= 0) {
    V.cullT = 1;
    for (const e of G.enemies) {
      if (e.dead || e.boss || e.charmed) continue;
      const i = lvIdx(e.x, e.y);
      if (i >= 0 && V.dPl[i] >= 0) continue;
      if (Math.abs(e.x - cam.x) < W / 2 / S + 60 && Math.abs(e.y - cam.y) < H / 2 / S + 60) continue;
      e.dead = true; hostile--;
    }
  }
  const Z = lvZone();
  if (Z !== V.zone) {
    if (V.zone) { banner(Z.name, '#ffb3c6'); sfx('level'); }
    V.zone = Z;
    if (Z.wash && !V.msg.wash) { V.msg.wash = 1; sysMsg('SYSTEM MESSAGE', 'The tongue gets rinsed. When the mouthwash comes, get behind a tooth: it scours everything out in the open, germs included.', '#7ff0e0', true); }
  }
  // Arenas: step in and the gate ahead stays shut until you have cleared the quota.
  if (!V.arena) for (const A of L.arenas) if (!V.done[A.name] && lvInRect(A.rect, p.x, p.y)) {
    V.arena = { A, killed: 0, sent: 0, t: 0 }; V.kills0 = G.kills;
    lvLock(A.rect);
    banner(A.name, '#ff7aa2'); sfx('boss'); vibrate(80);
    sysMsg('SYSTEM MESSAGE', `Clear ${A.quota} to open the way on.`, '#ff7aa2', true);
    break;
  }
  if (V.arena) {
    const R = V.arena, A = R.A;
    R.t += dt; R.killed = G.kills - V.kills0;
    if (R.killed >= A.quota) {
      V.done[A.name] = true; V.arena = null;
      lvUnlock(); if (A.gate) lvOpenGate(A.gate);
      banner('THE WAY IS OPEN', '#ffb3c6');
      // A drop pod for your trouble.
      G.pickups.push(makePickup('chest', p.x + rand(-40, 40), p.y - 50, { t: 'drop', name: A.name }));
    } else {
      G.spawnAcc += (1 + A.quota / 60) * dt * G.P.spawnMult;
      const left = A.quota - R.killed;
      while (G.spawnAcc >= 1) { G.spawnAcc--; if (hostile < Math.min(maxAlive, left + 6)) hostile += lvSpawn(A.mix, lvRectPos(A.rect, 260)); }
    }
  } else if (V.boss && !V.bossDead) {
    // Its entourage, lightly.
    G.spawnAcc += 0.9 * dt * G.P.spawnMult;
    while (G.spawnAcc >= 1) { G.spawnAcc--; if (hostile < 18) hostile += lvSpawn(L.boss.mix, lvRectPos(L.boss.rect, 300)); }
    if (!G.boss || G.boss.dead) { V.bossDead = true; lvUnlock(); lvOpenGate(L.boss.gate); banner('THE THROAT IS CLEAR', '#ffb3c6'); }
  } else {
    // Out in the corridors: a steady trickle from ahead and behind, out of sight round the bends.
    G.spawnAcc += Z.rate * (1 + lvProgress() * 0.6) * dt * G.P.spawnMult;
    while (G.spawnAcc >= 1) { G.spawnAcc--; if (hostile < Math.min(maxAlive, Z.max)) hostile += lvSpawn(Z.mix); }
    if (G.spawnAcc > 4) G.spawnAcc = 4;
  }
  // The boss: step into its room.
  if (!V.boss && lvInRect(L.boss.rect, p.x, p.y)) {
    V.boss = true;
    lvLock(L.boss.rect);
    spawnBoss();
    const b = G.boss;
    if (b) {
      const c = { x: (L.boss.rect[0] + L.boss.rect[2] + 1) / 2 * LV_C, y: (L.boss.rect[1] + 2) * LV_C };
      b.x = c.x; b.y = c.y;
      b.hp = b.maxHp = b.def.hp * (1 + lvPT() / 320) * (1 + 0.04 * G.level);
      b.campK = 0.65; // (its attacks: softer than a Petri Dish boss, it is level 1)
    }
  }
  // Plaque colonies grow germs near you (on the gum line).
  if (Z.colonies) {
    V.colonyT -= dt;
    if (V.colonyT <= 0 && hostile < Z.max) {
      V.colonyT = rand(4, 7);
      const pi = lvIdx(p.x, p.y), cx = pi % V.w, cy = Math.floor(pi / V.w);
      for (let tries = 0; tries < 20; tries++) {
        const x = cx + Math.floor(rand(-7, 8)), y = cy + Math.floor(rand(-7, 8)), i = y * V.w + x;
        if (x < 0 || x >= V.w || y < 0 || y >= V.h || V.grid[i] !== LV_T.plaque) continue;
        const c = lvCentre(i);
        if (Math.hypot(c.x - p.x, c.y - p.y) < 200) continue;
        for (let k = 0; k < 2; k++) { const e = makeEnemy(LV_FOES.mutans, c.x + rand(-30, 30), c.y + rand(-30, 30)); lvPush(e, e.r); G.enemies.push(e); }
        spawnPart(c.x, c.y, '#ead9a0', 6, 80, 0.5, 2.5);
        break;
      }
    }
  }
  lvCavity(dt);
  lvHazards(dt, Z);
  // The exit.
  const ex = lvExitPos();
  if (ex && Math.hypot(ex.x - p.x, ex.y - p.y) < LV_C * 1.1) lvWin(ex);
}
function lvExitPos() {
  const V = G.lvl;
  if (V.exitPos) return V.exitPos;
  let sx = 0, sy = 0, n = 0;
  for (let i = 0; i < V.grid.length; i++) if (V.grid[i] === LV_T.exit) { const c = lvCentre(i); sx += c.x; sy += c.y; n++; }
  return (V.exitPos = n ? { x: sx / n, y: sy / n } : null);
}

// A cavity in a dead end: a ring of germs closes in as you get near (it is guarded), and inside it there is a
// mutation and a DNA strand.
function lvCavity(dt) {
  const V = G.lvl, C = V.cavity, p = me();
  if (!C || C.open) return;
  const d = Math.hypot(C.x - p.x, C.y - p.y);
  if (!C.ring && d < LV_C * 6) {
    C.ring = true;
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, e = makeEnemy(LV_FOES[k % 4 ? 'mutans' : 'tartar'], C.x + Math.cos(a) * 150, C.y + Math.sin(a) * 150); lvPush(e, e.r); G.enemies.push(e); }
    banner('A CAVITY!', '#ead9a0');
  }
  if (d < LV_C * 0.8) {
    C.open = true;
    spawnPart(C.x, C.y, '#ffd23f', 20, 200, 0.8, 4); ring(C.x, C.y, 120, PAL.reward, 0.5, 5); sfx('level');
    G.lootQueue.push({ kind: 'vesicle' });
    G.pickups.push(makePickup('chest', C.x, C.y - 30, { t: 'drop', name: 'Cavity' }));
    floatText(C.x, C.y - 40, 'SOMETHING STUCK IN A TOOTH', PAL.reward, 14, 1.4);
  }
}

// ---------------------------------------------------------------- hazards
// Cough: a rumble, then a gust that carries everything along the way to the throat (you and the swarm).
// Mouthwash: a cold front sweeps down the tongue; anything out in the open takes a scouring, germs included.
// The toothbrush: past par time it sweeps up from the lips; nothing survives the bristles.
const LV_HZ = { coughEvery: [15, 21], coughWarn: 1.1, gust: 0.7, gustSpd: 520, washEvery: [24, 30], washWarn: 2.4, washSpd: 520, washBand: 3, washHurt: 0.16, washFoe: 0.4, brushSpd: 110, brushDps: 0.3 };
function lvHazards(dt, Z) {
  const V = G.lvl, p = me(), H2 = LV_HZ;
  // Cough.
  const C = V.cough;
  if (Z.cough && !V.won) {
    if (C.gust > 0) {
      C.gust -= dt;
      const push = (o, k) => { const i = lvIdx(o.x, o.y); if (i < 0) return; const j = lvNext(V.dEx, i); if (j < 0) return; const c = lvCentre(j), dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy) || 1; o.x += dx / d * H2.gustSpd * k * dt; o.y += dy / d * H2.gustSpd * k * dt; lvPush(o, Math.min(o.r || 12, LV_C * 0.45)); };
      push(p, 1);
      for (const e of G.enemies) if (!e.dead && !e.boss && Math.abs(e.y - p.y) < 900) push(e, 0.85);
      if (Math.random() < dt * 30) spawnPart(p.x + rand(-300, 300), p.y + rand(-500, 500), '#ffffff', 1, 300, 0.4, 2, -Math.PI / 2, 0.3);
    } else if (C.warn > 0) {
      C.warn -= dt; cam.shake = Math.max(cam.shake, 4 + (H2.coughWarn - C.warn) * 6);
      if (C.warn <= 0) { C.gust = H2.gust; banner('COUGH!', '#ffffff'); sfx('boom'); vibrate(120); }
    } else if ((C.t -= dt) <= 0) {
      C.t = rand(H2.coughEvery[0], H2.coughEvery[1]); C.warn = H2.coughWarn;
      floatText(p.x, p.y - 50, '*rumble*', '#ffd6e0', 13, 1);
      if (!V.msg.cough) { V.msg.cough = 1; sysMsg('SYSTEM MESSAGE', 'The host coughs: everything gets blown on towards the throat. You, and every germ around you.', '#ffffff', true); }
    }
  }
  // Mouthwash.
  const M = V.wash;
  if (Z.wash) {
    const top = Z.wash[0] * LV_C, bot = (Z.wash[1] + 1) * LV_C;
    if (M.y >= 0) {
      M.y += H2.washSpd * dt;
      const band = H2.washBand * LV_C;
      const inBand = o => o.y > M.y - band && o.y < M.y;
      const covered = o => { const cx = Math.floor(o.x / LV_C), cy = Math.floor(o.y / LV_C); for (let k = 1; k <= 3; k++) { const t = G.lvl.grid[(cy - k) * V.w + cx]; if (t === LV_T.tooth || t === LV_T.wall) return true; } return false; };
      if (inBand(p) && !M.hit.has(p)) {
        M.hit.add(p);
        if (covered(p)) floatText(p.x, p.y - 30, 'SHELTERED', '#7ff0e0', 13, 0.9);
        else hurtPlayer(G.P.maxHp * H2.washHurt, 'Mouthwash', null, 'other');
      }
      for (const e of G.enemies) if (!e.dead && !e.boss && !M.hit.has(e) && inBand(e)) { M.hit.add(e); if (!covered(e)) damageEnemy(e, e.maxHp * H2.washFoe, { elem: 'ice', noCrit: true, env: true, wname: 'Mouthwash' }); }
      if (M.y > bot + band) { M.y = -1; M.hit.clear(); }
    } else if (M.warn > 0) {
      M.warn -= dt;
      if (M.warn <= 0) { M.y = top; sfx('boom'); }
    } else if ((M.t -= dt) <= 0) {
      M.t = rand(H2.washEvery[0], H2.washEvery[1]); M.warn = H2.washWarn;
      banner('MOUTHWASH! GET BEHIND A TOOTH', '#7ff0e0'); sfx('boss'); vibrate(60);
    }
  } else if (M.y >= 0 && !Z.wash) { M.y = -1; M.hit.clear(); }
  // The toothbrush.
  const B = V.brush, par = V.L.par;
  if (G.t > par - 30 && !B.warned) { B.warned = true; banner('THE TOOTHBRUSH IS COMING', '#ffffff'); sysMsg('SYSTEM MESSAGE', 'Thirty seconds until the host brushes. Keep moving towards the throat: nothing survives the bristles.', '#ffffff', true); }
  if (G.t > par && !(V.boss && !V.bossDead)) { // (it waits while you fight the boss)
    if (B.y == null) { B.y = V.h * LV_C; sfx('boss'); }
    B.y = Math.min(B.y, p.y + 1400) - LV_HZ.brushSpd * dt; // (it never falls far behind)
    if (p.y > B.y) hurtPlayer(G.P.maxHp * LV_HZ.brushDps * dt, 'The Toothbrush', null, 'other');
    for (const e of G.enemies) if (!e.dead && !e.boss && e.y > B.y + 20) { e.dead = true; spawnPart(e.x, e.y, '#ffffff', 3, 80, 0.4); }
  }
}

// ---------------------------------------------------------------- the end
function lvWin(at) {
  const V = G.lvl;
  if (V.won) return;
  V.won = true;
  META.lvUnlocked = Math.max(META.lvUnlocked || 1, V.n + 2);
  META.lvBest = META.lvBest || {};
  if (!META.lvBest[V.L.id] || G.t < META.lvBest[V.L.id]) META.lvBest[V.L.id] = G.t;
  saveMeta();
  for (const e of G.enemies) if (!e.dead && !e.charmed) { e.dead = true; spawnPart(e.x, e.y, '#ffffff', 3, 70, 0.4); }
  // It crumbles: not the egg. A stinky tonsil stone.
  spawnPart(at.x, at.y, '#efe6c8', 40, 260, 1.2, 5); spawnPart(at.x, at.y, '#b5a77a', 24, 180, 1.4, 4);
  ring(at.x, at.y, 200, '#efe6c8', 0.8, 8); cam.shake = 10; sfx('boom'); vibrate([60, 40, 120]);
  floatText(at.x, at.y - 60, 'IT IS A TONSIL STONE', '#efe6c8', 16, 2);
  banner('THE EGG IS IN ANOTHER CASTLE', '#ffd6e8');
  sysMsg('THE NARRATOR', `That was not an egg. That was a tonsil stone, and it stinks. The egg is in another castle. ${V.L.next ? 'Level 2, ' + V.L.next + ', is unlocked.' : ''}`, '#ffd6e8', true);
  after(2.6, () => { if (G && G.lvl && G.state === 'play') { G.state = 'won'; if (typeof UI !== 'undefined') UI.showVictory(); } });
}

// ---------------------------------------------------------------- drawing
// Inside a body, not on a slide: the level keeps its colour (pink flesh, ivory teeth, cream plaque, minty
// mouthwash) whatever stains you have. Floors are unions of soft discs, so the corridors read as wet tissue
// rather than tiles; a darker rim underneath gives the gum line.
const LV_COL = { flesh: '#4a1027', rim: '#9c3554', tooth: '#f5efe2', toothSh: '#d9cfbd', plaque: '#e9d8a0', saliva: '#d8ecff', gate: '#ff7aa2', scrap: '#c9a26b', herb: '#7fb069', wash: '#7ff0e0', stone: '#efe6c8' };
const lvHash = i => { let h = Math.imul(i, 2654435761) >>> 0; h = (h ^ (h >>> 15)) >>> 0; return (h % 1000) / 1000; };
function lvView() {
  const V = G.lvl, c = LV_C;
  return [Math.max(0, Math.floor((cam.x - W / 2 / S) / c) - 1), Math.min(V.w - 1, Math.floor((cam.x + W / 2 / S) / c) + 1),
    Math.max(0, Math.floor((cam.y - H / 2 / S) / c) - 1), Math.min(V.h - 1, Math.floor((cam.y + H / 2 / S) / c) + 1)];
}
function drawLevel() {
  const V = G.lvl, L = V.L, c = LV_C, cs = c * S, [x0, x1, y0, y1] = lvView(), T = LV_T;
  const raw = RAW_COL; RAW_COL = true;
  const br = 0.5 + 0.5 * Math.sin(G.realT * 0.9); // breathing
  ctx.fillStyle = LV_COL.flesh; ctx.fillRect(-20, -20, W + 40, H + 40);
  // Folds in the flesh beyond the walls.
  ctx.globalAlpha = 0.18; ctx.strokeStyle = '#7a2442'; ctx.lineWidth = Math.max(2, 6 * S);
  for (let y = y0; y <= y1; y += 2) { ctx.beginPath(); for (let x = x0; x <= x1 + 1; x++) { const X = sx(x * c), Y = sy(y * c + Math.sin(x * 1.3 + y) * c * 0.3); x === x0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); } ctx.stroke(); }
  ctx.globalAlpha = 1;
  const open = t => t !== T.wall;
  // The rim, then the floor, zone by zone.
  for (const pass of [0, 1]) {
    let zi = -1;
    for (let y = y0; y <= y1; y++) {
      const z = L.zones.findIndex(q => y <= q.to);
      if (pass && z !== zi) { if (zi >= 0) ctx.fill(); zi = z; ctx.fillStyle = L.zones[z].floor; ctx.beginPath(); }
      if (!pass && y === y0) { ctx.fillStyle = LV_COL.rim; ctx.beginPath(); }
      for (let x = x0; x <= x1; x++) {
        const t = V.grid[y * V.w + x];
        if (!open(t) || t === T.tooth) continue;
        const X = sx((x + 0.5) * c), Y = sy((y + 0.5) * c), r = cs * (pass ? 0.72 : 0.84);
        ctx.moveTo(X + r, Y); ctx.arc(X, Y, r, 0, TAU);
      }
    }
    ctx.fill();
  }
  // Wet gloss: soft highlights that come and go with the breathing.
  ctx.fillStyle = '#ffffff';
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * V.w + x, t = V.grid[i];
    if (t !== T.floor && t !== T.saliva) continue;
    const h = lvHash(i);
    if (h > 0.35) continue;
    ctx.globalAlpha = (0.06 + 0.06 * br) * (h / 0.35 + 0.4);
    ctx.beginPath(); ctx.ellipse(sx((x + 0.3 + h) * c), sy((y + 0.35 + h * 0.5) * c), cs * (0.18 + h * 0.3), cs * 0.07, -0.5 + h, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Saliva pools.
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * V.w + x;
    if (V.grid[i] !== T.saliva) continue;
    const X = sx((x + 0.5) * c), Y = sy((y + 0.5) * c);
    ctx.globalAlpha = 0.42; ctx.fillStyle = LV_COL.saliva; ctx.beginPath(); ctx.arc(X, Y, cs * 0.72, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, 1.5 * S);
    const ph = (G.realT * 0.4 + lvHash(i)) % 1; ctx.beginPath(); ctx.arc(X, Y, cs * 0.6 * ph, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Teeth, plaque, gates, scraps, the cavity and the stone.
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * V.w + x, t = V.grid[i], X = sx(x * c), Y = sy(y * c);
    if (t === T.tooth) {
      ctx.fillStyle = LV_COL.toothSh; lvRound(X - 1, Y + 2, cs + 2, cs, cs * 0.3); ctx.fill();
      ctx.fillStyle = LV_COL.tooth; lvRound(X - 1, Y - 1, cs + 2, cs, cs * 0.3); ctx.fill();
      ctx.globalAlpha = 0.55; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(X + cs * 0.32, Y + cs * 0.28, cs * 0.16, cs * 0.07, -0.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    } else if (t === T.plaque) {
      const hp = clamp(V.hp[i], 0, 1);
      ctx.fillStyle = LV_COL.plaque;
      for (let k = 0; k < 4; k++) { const h = lvHash(i * 4 + k); ctx.beginPath(); ctx.arc(X + cs * (0.25 + 0.5 * (k % 2)) + (h - 0.5) * cs * 0.2, Y + cs * (0.25 + 0.5 * (k >> 1)), cs * (0.3 + h * 0.12), 0, TAU); ctx.fill(); }
      if (hp < 0.99) { ctx.strokeStyle = '#8a7440'; ctx.lineWidth = Math.max(1, 1.6 * S); ctx.beginPath(); ctx.moveTo(X + cs * 0.2, Y + cs * 0.3); ctx.lineTo(X + cs * 0.5, Y + cs * (0.3 + (1 - hp) * 0.4)); ctx.lineTo(X + cs * 0.8, Y + cs * 0.55); ctx.stroke(); }
    } else if (t === T.gate) {
      const live = !!V.arena || (V.boss && !V.bossDead);
      ctx.globalAlpha = 0.5 + 0.25 * Math.sin(G.realT * (live ? 6 : 2) + x); ctx.fillStyle = LV_COL.gate;
      ctx.fillRect(X, Y + cs * 0.1, cs, cs * 0.8);
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#ffd6e0'; ctx.lineWidth = Math.max(1, 2 * S);
      ctx.beginPath(); for (let k = 0; k <= 6; k++) { const px = X + cs * k / 6, py = Y + cs * 0.5 + Math.sin(G.realT * 3 + k + x) * cs * 0.12; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (V.scrap[i]) {
      const h = lvHash(i);
      ctx.fillStyle = h > 0.5 ? LV_COL.scrap : LV_COL.herb;
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(X + cs * (0.3 + 0.2 * k), Y + cs * (0.45 + 0.1 * Math.sin(k + h * 6)), cs * (0.09 + 0.04 * k), 0, TAU); ctx.fill(); }
    }
  }
  const C = V.cavity;
  if (C && !C.open) {
    const X = sx(C.x), Y = sy(C.y);
    ctx.fillStyle = '#3a2216'; ctx.beginPath(); ctx.ellipse(X, Y, LV_C * 0.38 * S, LV_C * 0.3 * S, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(G.realT * 4); ctx.fillStyle = PAL.reward; ctx.beginPath(); ctx.arc(X + 6 * S, Y - 4 * S, 4 * S, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  const ex = lvExitPos();
  if (ex && !V.won) {
    // It looks like the egg: a pale glowing ball in a warm halo. (It is not the egg.)
    const X = sx(ex.x), Y = sy(ex.y), r = LV_C * 0.75 * S;
    ctx.globalCompositeOperation = 'lighter'; glow(X, Y, r * 3, '#ffd6e8', 0.35 + 0.1 * br); ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(X - r * 0.3, Y - r * 0.3, r * 0.1, X, Y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, LV_COL.stone); g.addColorStop(1, '#cbbf9a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,245,0.8)'; ctx.lineWidth = Math.max(2, 3 * S); ctx.beginPath(); ctx.arc(X, Y, r * 1.12, 0, TAU); ctx.stroke(); // (a zona, just like the real thing)
  }
  RAW_COL = raw;
}
function lvRound(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// Over the swimmers: the mouthwash front, the toothbrush, and a chevron along the way on.
function drawLevelOver() {
  const V = G.lvl, raw = RAW_COL; RAW_COL = true;
  const M = V.wash, Z = V.zone;
  if (Z && Z.wash) {
    const xa = sx(3 * LV_C), xb = sx(25 * LV_C);
    if (M.warn > 0) { ctx.globalAlpha = 0.25 + 0.2 * Math.sin(G.realT * 10); ctx.fillStyle = LV_COL.wash; const y = sy(Z.wash[0] * LV_C); ctx.fillRect(xa, y - 40 * S, xb - xa, 80 * S); }
    if (M.y >= 0) {
      const yb = sy(M.y), ya = sy(M.y - LV_HZ.washBand * LV_C), g = ctx.createLinearGradient(0, ya, 0, yb);
      g.addColorStop(0, 'rgba(127,240,224,0)'); g.addColorStop(0.7, 'rgba(127,240,224,0.4)'); g.addColorStop(1, 'rgba(200,255,250,0.75)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(xa, ya, xb - xa, yb - ya);
    }
  }
  if (V.brush.y != null) {
    const y = sy(V.brush.y);
    ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, y, W, H - y + 40);
    ctx.globalAlpha = 1; ctx.strokeStyle = '#7fd8ff'; ctx.lineWidth = Math.max(2, 4 * S);
    ctx.beginPath(); for (let x = 0; x < W; x += 10 * S) { ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(G.realT * 8 + x) * 4 * S, y - 26 * S); } ctx.stroke();
  }
  // Which way: a faint chevron a little way along the route (not during a fight).
  const p = me();
  if (!V.arena && !(V.boss && !V.bossDead) && !V.won) {
    let i = lvIdx(p.x, p.y);
    for (let k = 0; k < 3 && i >= 0; k++) { const j = lvNext(V.dEx, i); if (j < 0) break; i = j; }
    if (i >= 0) {
      const c = lvCentre(i), a = Math.atan2(c.y - p.y, c.x - p.x), X = sx(p.x) + Math.cos(a) * 46 * S, Y = sy(p.y) + Math.sin(a) * 46 * S;
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(G.realT * 3); ctx.fillStyle = '#ffffff';
      ctx.save(); ctx.translate(X, Y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(9 * S, 0); ctx.lineTo(-5 * S, 7 * S); ctx.lineTo(-2 * S, 0); ctx.lineTo(-5 * S, -7 * S); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  ctx.globalAlpha = 1; RAW_COL = raw;
}
// The HUD's top line: where you are, and what is in the way.
function drawLevelHud(mid, by) {
  const V = G.lvl, R = V.arena;
  const pct = Math.round(lvProgress() * 100);
  let sub = V.zone ? V.zone.name : V.L.name;
  if (R) sub = `${R.A.name}: ${Math.max(0, R.A.quota - R.killed)} TO GO`;
  else if (V.boss && !V.bossDead && G.boss) sub = G.boss.def.name;
  else if (G.t > V.L.par - 30 && !V.won) sub = V.brush.y != null ? 'THE TOOTHBRUSH! MOVE!' : `TOOTHBRUSH IN ${Math.max(0, Math.ceil(V.L.par - G.t))}s`;
  ctx.fillStyle = XR.dim; ctx.font = '9px ' + MONO; ctx.fillText(sub, mid, by - 14);
  ctx.fillStyle = XR.white; ctx.font = 'bold 16px ' + MONO; ctx.fillText(`${V.L.name}  ${pct}%`, mid, by + 4);
}
// The minimap: the maze round you.
function drawLevelMap(mx, my, R) {
  const V = G.lvl, p = me(), span = 13, k = R / (span * LV_C), raw = RAW_COL; RAW_COL = true;
  ctx.save(); ctx.beginPath(); ctx.arc(mx, my, R - 1, 0, TAU); ctx.clip();
  const pcx = Math.floor(p.x / LV_C), pcy = Math.floor(p.y / LV_C), s = LV_C * k + 0.5;
  for (let y = pcy - span; y <= pcy + span; y++) for (let x = pcx - span; x <= pcx + span; x++) {
    if (x < 0 || y < 0 || x >= V.w || y >= V.h) continue;
    const t = V.grid[y * V.w + x];
    if (t === LV_T.wall) continue;
    ctx.fillStyle = t === LV_T.tooth ? '#f5efe2' : t === LV_T.plaque ? '#b8a874' : t === LV_T.gate ? LV_COL.gate : t === LV_T.exit ? PAL.reward : t === LV_T.saliva ? '#9fb8d8' : '#b56a82';
    ctx.globalAlpha = t === LV_T.floor ? 0.55 : 0.9;
    ctx.fillRect(mx + (x * LV_C - p.x) * k, my + (y * LV_C - p.y) * k, s, s);
  }
  ctx.globalAlpha = 1;
  for (const e of G.enemies) if (e.boss && !e.dead) { ctx.fillStyle = PAL.danger; ctx.fillRect(mx + (e.x - p.x) * k - 3, my + (e.y - p.y) * k - 3, 6, 6); }
  ctx.fillStyle = '#ffffff'; ctx.fillRect(mx - 2, my - 2, 4, 4);
  ctx.restore(); RAW_COL = raw;
}
