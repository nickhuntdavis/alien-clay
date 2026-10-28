'use strict';
// Spawn Prawn - the race course (s011): a campaign-style level (levels.js) that is a straight race, not a maze.
// You and five rival swimmers (names and colours from RIVALS) line up, count down, and swim one long obstacle
// course. Cross the finish line first, alive, and you win; if a rival crosses it first, the race is lost.
// The course is a levels.js map plus three marks of its own (all floor to lvInit):
//   b  a boost pad: a short burst of speed for whoever swims over it (you, or a rival)
//   o  a valve cell: each row of them opens and shuts on a cycle (shut = a gate cell, so it is solid)
//   =  a sweeper row: a bar slides back and forth across the row; touching it hurts you, stuns a rival
//   E  the finish line (the exit cells): crossing its row finishes you
// Plaque (p) walls off the short side of the fork: the rivals take the long way, you can shoot through.
// Rivals are not enemies: nothing targets them. They follow the route map, are slowed by spit, stunned by
// sweepers, held by shut valves, tangled by germs and barged by you, and keep loosely in touch (a light rubber band).
// Hooks: courseTick (lvTick), courseWin (lvWin), courseHud (drawLevelHud), courseFloor (drawLevel),
// courseDraw (drawLevelOver), courseMap (drawLevelMap), courseSteer (autoSteer), courseTitle / courseEulogy
// (the end screen, ui.js). Wraps lvSlow (boost pads). Save data: META.courseBest (best winning time, seconds).

const COURSE_COL = '#9fe8ff';
const CRS = {
  racers: 5, count: 3, speed: 136, skill: [0.9, 1.03], // (rival speed: CRS.speed x skill; you swim at 165 x your speed)
  band: [8, 14, 0.82, 1.15], // (a rival more than [0] cells ahead of you slows to [2]; more than [1] behind speeds to [3])
  boost: 1.6, boostT: 1.1,
  valve: [2.6, 1.5], valveWarn: 0.6, // (open, shut, seconds; the warning flicker before it shuts)
  sweepHurt: 0.1, sweepStun: 0.9, sweepLen: 0.42, // (bar length: a share of the row's width)
  tangle: 0.55, barge: 0.35,
};
const COURSE = {
  id: 'course', no: 'R', name: 'Motility Test', course: true,
  pt: [12, 150], par: 1e9, // (no bristles: the rivals are the clock)
  zones: [ // by row, far end first
    { name: 'THE STARTING BLOCKS', to: 30, floor: '#f4bccb', mix: { crawler: 6, wisp: 3, bomber: 2 }, rate: 1.0, max: 18 },
    { name: 'THE OBSTACLES', to: 60, floor: '#eba3b4', mix: { crawler: 6, wisp: 4, spitter: 2 }, rate: 1.1, max: 20 },
    { name: 'THE BACK STRAIGHT', to: 103, floor: '#e8909a', mix: { crawler: 7, wisp: 3, spitter: 2, bomber: 1 }, rate: 1.1, max: 20 },
    { name: 'THE HOME STRAIGHT', to: 999, floor: '#f0a6b8', mix: { crawler: 8, wisp: 3 }, rate: 0.6, max: 12 },
  ],
  arenas: [], boss: null,
  map: [
    '########################',
    '########################',
    '###..................###',
    '###..................###',
    '###..................###',
    '###EEEEEEEEEEEEEEEEEE###', // the finish line
    '###..................###',
    '###..................###',
    '###...bbbbbbbbbbbb...###',
    '###...bbbbbbbbbbbb...###',
    '###..................###',
    '###..................###',
    '#######..........#######',
    '#######..........#######',
    '#######oooooooooo#######', // valves
    '#######..........#######',
    '#######..........#######',
    '#######..........#######',
    '#######oooooooooo#######',
    '#######..........#######',
    '#######..........#######',
    '#######..........#######',
    '#######oooooooooo#######',
    '#######..........#######',
    '#######..........#######',
    '###..................###',
    '###..................###',
    '###........#############', // S-bends
    '###........#############',
    '###..................###',
    '###..................###',
    '#############........###',
    '#############........###',
    '###..................###',
    '###..................###',
    '###........#############',
    '###........#############',
    '###..................###',
    '###..................###',
    '#####..............#####', // sweepers
    '#####==============#####',
    '#####..............#####',
    '#####..............#####',
    '#####==============#####',
    '#####..............#####',
    '#####..............#####',
    '#####==============#####',
    '#####..............#####',
    '#####..............#####',
    '#####==============#####',
    '#####..............#####',
    '#####..............#####',
    '###..................###',
    '###..................###', // the fork: left short and plaqued, right long and winding
    '###.......####.......###',
    '###.......####.......###',
    '###.......####.####..###',
    '###.......####.####..###',
    '###.......####.......###',
    '###.......####..####.###',
    '###.......####..####.###',
    '###ppppppp####.......###',
    '###ppppppp####.####..###',
    '###.......####.####..###',
    '###.......####.......###',
    '###.......####..####.###',
    '###.......####..####.###',
    '###.......####.......###',
    '###..................###',
    '###..................###',
    '###~~~~.....~~~~~~~~~###', // the swamp
    '###~~...~~~~~~~~~~~~~###',
    '###~~...~~~~~~~~~~~~~###',
    '###~...~~~~~~~~~~~~~~###',
    '###~...~~~~~~~~~~~~~~###',
    '###...~~~~~~~~~~~~~~~###',
    '###...~~~~~~~~~~~~~~~###',
    '###~...~~~~~~~~~~~~~~###',
    '###~~~~...~~~~~~~~~~~###',
    '###~~~~~~~...~~~~~~~~###',
    '###~~~~~~~~~~...~~~~~###',
    '###~~~~~~~~~~~~~...~~###',
    '###~~~~~~~~~~~~~~...~###',
    '###..~~~~~~~~~~~~~~..###',
    '###..................###',
    '###..................###',
    '###..................###',
    '###TTTTTTTTTTTT......###', // slalom
    '###TTTTTTTTTTTT......###',
    '###..................###',
    '###..................###',
    '###..................###',
    '###......TTTTTTTTTTTT###',
    '###......TTTTTTTTTTTT###',
    '###..................###',
    '###..................###',
    '###..................###',
    '###TTTTTTTTTTTT......###',
    '###TTTTTTTTTTTT......###',
    '###..................###',
    '###..................###',
    '###..................###',
    '###......TTTTTTTTTTTT###',
    '###......TTTTTTTTTTTT###',
    '###..................###',
    '###..................###',
    '###..................###',
    '###......bbbbbb......###', // boost straight
    '###......bbbbbb......###',
    '###..................###',
    '###..................###',
    '###..................###',
    '###..................###',
    '##....................##', // the start
    '##....................##',
    '##....................##',
    '##..........S.........##',
    '##....................##',
    '##....................##',
    '########################',
    '########################',
  ],
};
LEVELS.push(COURSE);
LV_SAMPLE.s011 = LEVELS.length - 1;
SAMPLES.push({ id: 's011', no: '011', order: 3, name: 'Motility Test', tag: 'RACE COURSE', open: true, desc: 'You and five rivals on one obstacle course. First over the line, alive, wins.' });
const courseOn = () => !!(G && G.lvl && G.lvl.L.course);
const CRS_GRID = [-8, -5, 3, 5, 8]; // (rivals' places on the start line, in cells either side of you)

// ---------------------------------------------------------------- set-up (on the first tick)
function courseInit(V) {
  const L = V.L, w = V.w, p = me();
  const C = V.crs = { cd: CRS.count + 0.6, t0: null, over: false, order: [], you: 0, boostT: 0, hitT: 0, msg: {},
    sx: p.x, sy: p.y, pad: new Uint8Array(V.grid.length), valves: [], sweeps: [], racers: [], fy: 0, place: 1 };
  for (let y = 0; y < V.h; y++) {
    const row = L.map[y];
    if (row.includes('E')) C.fy = (y + 0.5) * LV_C;
    if (row.includes('o')) { const cells = []; for (let x = 0; x < w; x++) if (row[x] === 'o') cells.push(y * w + x); C.valves.push({ y, cells, ph: C.valves.length * 1.3, shut: false }); }
    if (row.includes('=')) {
      const a = row.indexOf('='), b = row.lastIndexOf('=') + 1, span = (b - a) * LV_C, len = span * CRS.sweepLen;
      C.sweeps.push({ y: (y + 0.5) * LV_C, x0: a * LV_C + len / 2, x1: b * LV_C - len / 2, len, per: 3.2 + (C.sweeps.length % 3) * 0.7, ph: C.sweeps.length * 1.9 });
    }
    for (let x = 0; x < w; x++) if (row[x] === 'b') C.pad[y * w + x] = 1;
  }
  // Two route maps: the rivals' (V.dEx as set up: plaque solid, valves open) and standings (plaque open).
  C.rd = V.dEx.slice();
  C.sd = new Int16Array(V.grid.length);
  const pl = []; for (let i = 0; i < V.grid.length; i++) if (V.grid[i] === LV_T.plaque) { pl.push(i); V.grid[i] = LV_T.floor; }
  const seeds = []; for (let i = 0; i < V.grid.length; i++) if (V.grid[i] === LV_T.exit) seeds.push(i);
  lvBfs(C.sd, seeds);
  for (const i of pl) V.grid[i] = LV_T.plaque;
  const set = shuffle(RIVALS.slice()).slice(0, CRS.racers);
  set.forEach((R, k) => C.racers.push({ R, name: R.name, color: R.color, x: p.x + CRS_GRID[k] * LV_C, y: p.y + (k % 2 ? 0.4 : -0.2) * LV_C, vx: 0, vy: 0, face: -Math.PI / 2,
    skill: rand(CRS.skill[0], CRS.skill[1]) * (R.skill ? 0.9 + R.skill * 0.1 : 1), stunT: 0, boostT: 0, slowT: 0, band: 1, done: false, wob: k * 1.7 }));
  sysMsg('SYSTEM MESSAGE', 'Five rivals, one lane, one finish line. First over it alive wins. Second place is not recorded.', COURSE_COL, true);
  return C;
}
const crsCell = (x, y) => lvIdx(x, y);
// Standing distance to the line (cells), smaller is further on. Finished swimmers count as -1.
function crsDist(x, y) { const C = G.lvl.crs, i = crsCell(x, y); return i >= 0 && C.sd[i] >= 0 ? C.sd[i] : 999; }

// ---------------------------------------------------------------- every frame (from lvTick)
function courseTick(dt) {
  const V = G.lvl, C = V.crs || courseInit(V), p = me();
  if (C.over) return;
  if (C.cd > 0) { // the countdown: everyone held on the line, no germs yet
    const was = Math.ceil(C.cd - 0.6);
    C.cd -= dt; G.spawnAcc = 0;
    p.x = C.sx; p.y = C.sy; p.vx = 0; p.vy = 0;
    const now = Math.ceil(C.cd - 0.6);
    if (now !== was && now > 0) { sfx('hit'); vibrate(30); } // (the number itself: courseTrack)
    if (C.cd <= 0) { C.t0 = G.t; banner('GO', COURSE_COL); sfx('boss'); vibrate(80); }
    return;
  }
  const t = G.t - C.t0;
  crsValves(V, C, t);
  crsSweeps(C, t, dt, p);
  const pi = crsCell(p.x, p.y);
  if (pi >= 0 && C.pad[pi]) C.boostT = G.t + CRS.boostT;
  for (const r of C.racers) crsRacer(V, C, r, dt, p);
  // Standings.
  const myD = crsDist(p.x, p.y);
  C.place = 1 + C.racers.filter(r => r.done || crsDist(r.x, r.y) < myD).length;
  // The line.
  for (const r of C.racers) if (!r.done && r.y < C.fy) {
    r.done = true; C.order.push(r.name);
    if (C.order.length === 1) return crsLose(r);
  }
  if (p.y < C.fy) crsWin(p);
  // First sight of each obstacle.
  const row = Math.floor(p.y / LV_C), near = (y, k) => y < row && row - y < 8 && !C.msg[k];
  if (C.sweeps.some(s => near(s.y / LV_C, 'sw'))) { C.msg.sw = 1; sysMsg('SYSTEM MESSAGE', 'Sweepers ahead. The bar hurts you and stuns anyone else. Time it.', COURSE_COL, true); }
  if (C.valves.some(v => near(v.y, 'va'))) { C.msg.va = 1; sysMsg('SYSTEM MESSAGE', 'Valves ahead. They open and shut on a cycle, and flicker just before they shut.', COURSE_COL, true); }
  if (!C.msg.fork && V.L.map[row] && V.L.map[row - 3] && V.L.map[row - 3].includes('####.')) { C.msg.fork = 1; sysMsg('SYSTEM MESSAGE', 'The course forks. The short side is walled with plaque: the rivals go round, you can shoot through.', COURSE_COL, true); }
}
// Valves: each row opens and shuts on its own beat (shut cells are gates, so routes and collisions follow).
function crsValves(V, C, t) {
  const per = CRS.valve[0] + CRS.valve[1];
  for (const v of C.valves) {
    const ph = (t + v.ph) % per, shut = ph > CRS.valve[0];
    v.warn = !shut && ph > CRS.valve[0] - CRS.valveWarn;
    if (shut === v.shut) continue;
    v.shut = shut;
    for (const i of v.cells) V.grid[i] = shut ? LV_T.gate : LV_T.floor;
    const c = lvCentre(v.cells[v.cells.length >> 1]);
    if (Math.abs(c.y - me().y) < 600) { if (shut) sfx('hit'); spawnPart(c.x, c.y, LV_COL.gate, 6, 120, 0.5, 3); }
  }
}
function crsSweepX(s, t) { return s.x0 + (s.x1 - s.x0) * (0.5 + 0.5 * Math.sin(t * TAU / s.per + s.ph)); }
// Sweepers: a bar that slides across its row. You take a knock and get shoved back; a rival is stunned.
function crsSweeps(C, t, dt, p) {
  for (const s of C.sweeps) {
    s.x = crsSweepX(s, t);
    const hit = (o, r) => Math.abs(o.y - s.y) < r + 9 && Math.abs(o.x - s.x) < s.len / 2 + r;
    const shove = (o, r) => { const dn = o.y >= s.y ? 1 : -1; o.y = s.y + dn * (r + 12); o.vy = dn * 380; };
    if (hit(p, p.r) && C.hitT < G.t) {
      C.hitT = G.t + 0.8; shove(p, p.r);
      hurtPlayer(G.P.maxHp * CRS.sweepHurt, 'Sweeper', null, 'other');
      cam.shake = Math.max(cam.shake, 5); spawnPart(p.x, s.y, '#ffffff', 8, 160, 0.4, 2.5);
    }
    for (const r of C.racers) if (!r.done && hit(r, 13) && r.stunT < G.t) { r.stunT = G.t + CRS.sweepStun; shove(r, 13); spawnPart(r.x, s.y, '#ffffff', 6, 140, 0.4, 2.5); }
  }
}
// A rival: along its route map, a few cells ahead when it can see that far (so it swims lines, not steps).
function crsRacer(V, C, r, dt, p) {
  if (r.done) { r.vx *= 0.96; r.vy *= 0.96; r.x += r.vx * dt; r.y += r.vy * dt; lvPush(r, 13); return; }
  let i = crsCell(r.x, r.y), tx = r.x, ty = r.y - LV_C;
  if (i >= 0 && C.rd[i] >= 0) {
    let j = i;
    for (let k = 0; k < 4; k++) { const n = lvNext(C.rd, j); if (n < 0) break; const c = lvCentre(n); if (k && !lvSight(r.x, r.y, c.x, c.y)) break; j = n; tx = c.x; ty = c.y; }
  }
  if (i >= 0 && C.pad[i]) r.boostT = G.t + CRS.boostT;
  // The rubber band: by route distance to you.
  const gap = crsDist(p.x, p.y) - crsDist(r.x, r.y), bw = gap > CRS.band[0] ? CRS.band[2] : gap < -CRS.band[1] ? CRS.band[3] : 1;
  r.band += (bw - r.band) * Math.min(1, dt * 0.8);
  // Germs in the way tangle it; you barge it.
  for (const e of G.enemies) if (!e.dead && !e.charmed && Math.abs(e.x - r.x) < e.r + 14 && Math.abs(e.y - r.y) < e.r + 14) { r.slowT = G.t + 0.3; break; }
  const bx = r.x - p.x, by = r.y - p.y, bd = Math.hypot(bx, by), touch = p.r + 14;
  if (bd < touch && bd > 0.01) {
    r.x += bx / bd * (touch - bd) * 0.8; r.y += by / bd * (touch - bd) * 0.8;
    p.x -= bx / bd * (touch - bd) * 0.2; p.y -= by / bd * (touch - bd) * 0.2;
    if (Math.hypot(p.vx, p.vy) > 120 && r.stunT < G.t) { r.stunT = G.t + CRS.barge; r.vx += bx / bd * 220; r.vy += by / bd * 220; }
  }
  for (const o of C.racers) { if (o === r) continue; const ox = r.x - o.x, oy = r.y - o.y, od = Math.hypot(ox, oy); if (od < 28 && od > 0.01) { r.x += ox / od * (28 - od) * 0.5; r.y += oy / od * (28 - od) * 0.5; } }
  const stun = r.stunT > G.t;
  const spd = stun ? 0 : CRS.speed * r.skill * r.band * lvSlowRaw(r.x, r.y) * (r.boostT > G.t ? CRS.boost : 1) * (r.slowT > G.t ? CRS.tangle : 1);
  const dx = tx - r.x, dy = ty - r.y, d = Math.hypot(dx, dy) || 1, k = Math.min(1, dt * (stun ? 2 : 5));
  r.vx += (dx / d * spd - r.vx) * k; r.vy += (dy / d * spd - r.vy) * k;
  r.x += r.vx * dt; r.y += r.vy * dt;
  lvPush(r, 13);
  if (!stun && Math.hypot(r.vx, r.vy) > 20) r.face = Math.atan2(r.vy, r.vx);
}
// Boost pads: lvSlow scales your speed (and every germ's); on a pad, or just off one, yours goes up.
const lvSlowRaw = lvSlow;
lvSlow = function (x, y) {
  const k = lvSlowRaw(x, y), C = G && G.lvl && G.lvl.crs;
  return C && C.boostT > G.t && x === G.player.x && y === G.player.y ? k * CRS.boost : k;
};

// ---------------------------------------------------------------- the end
function crsLose(r) {
  const C = G.lvl.crs;
  C.over = true; G.rivalWinner = r.name; G.stats.lastHit = r.name;
  banner('BEATEN TO THE LINE', PAL.danger); sfx('boss'); vibrate([80, 40, 80]);
  after(1.4, () => { if (G && G.lvl && G.state === 'play') gameOver(); });
}
function crsWin(p) {
  const V = G.lvl, C = V.crs;
  if (C.over) return;
  C.over = true; V.won = true; C.time = G.t - C.t0;
  META.courseBest = META.courseBest && META.courseBest < C.time ? META.courseBest : C.time;
  saveMeta();
  for (const e of G.enemies) if (!e.dead && !e.charmed) { e.dead = true; spawnPart(e.x, e.y, '#ffffff', 3, 70, 0.4); }
  spawnPart(p.x, p.y, COURSE_COL, 36, 260, 1.1, 4); ring(p.x, p.y, 220, PAL.reward, 0.9, 6);
  cam.shake = 8; sfx('level'); vibrate([60, 40, 120]);
  banner('FIRST OVER THE LINE', PAL.reward);
  after(2.6, () => { if (G && G.lvl && G.state === 'play') { G.state = 'won'; if (typeof UI !== 'undefined') UI.showVictory(); } });
}
// lvWin's own exit check (near the middle of the line) is not the finish: the line is.
function courseWin(at) { crsWin(me()); }
function courseTitle(won) { return won ? 'FIRST PAST THE POST' : G.rivalWinner ? 'ALSO RAN' : 'DID NOT FINISH'; }
function courseEulogy(won) {
  const C = G.lvl.crs, t = C && C.time != null ? C.time : C && C.t0 != null ? G.t - C.t0 : 0, best = META.courseBest;
  const line = won ? 'First over the line, alive. The time has been written down.' : G.rivalWinner ? 'Someone else crossed first. The result stands. There is no appeals process.' : 'Did not finish. The course has been reset for the next one.';
  return `<div class="eulogy">${line}</div><div class="big${won ? ' born' : ''}">${fmtTime(t)}</div>`
    + `<div class="hint">${G.rivalWinner ? `<b style="color:${PAL.danger}">${esc(G.rivalWinner)}</b> | ` : ''}${C ? C.place : '-'}/${CRS.racers + 1}${best ? ' | ' + fmtTime(best) : ''}</div>`;
}

// ---------------------------------------------------------------- autorun
// It swims you on along the course (a race, not a maze), about as strong as the dodging.
function courseSteer(p) {
  const C = G.lvl.crs;
  if (!C || C.cd > 0 || C.over) return null;
  const n = lvPushOn(p);
  return n ? { x: n.x, y: n.y, w: 1.5 } : null;
}

// ---------------------------------------------------------------- drawing
// Under the swimmers: the finish line (chequered), the boost pads (chevrons) and valve warnings.
function courseFloor() {
  const V = G.lvl, C = V.crs, c = LV_C, cs = c * S, [x0, x1, y0, y1] = lvView();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * V.w + x, X = sx(x * c), Y = sy(y * c);
    if (V.grid[i] === LV_T.exit) {
      const q = cs / 4;
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { ctx.fillStyle = (a + b + x) % 2 ? '#ffffff' : '#2a0f1c'; ctx.fillRect(X + a * q, Y + b * q, q + 0.5, q + 0.5); }
    } else if (C && C.pad[i] || !C && V.L.map[y][x] === 'b') {
      const ph = (G.realT * 1.6 + y * 0.25) % 1;
      ctx.globalAlpha = 0.35 + 0.35 * (1 - ph); ctx.fillStyle = COURSE_COL;
      ctx.beginPath(); ctx.moveTo(X + cs * 0.5, Y + cs * 0.15); ctx.lineTo(X + cs * 0.85, Y + cs * 0.55); ctx.lineTo(X + cs * 0.68, Y + cs * 0.55);
      ctx.lineTo(X + cs * 0.5, Y + cs * 0.36); ctx.lineTo(X + cs * 0.32, Y + cs * 0.55); ctx.lineTo(X + cs * 0.15, Y + cs * 0.55); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  if (!C) return;
  for (const v of C.valves) if (v.warn) for (const i of v.cells) {
    const cc = lvCentre(i);
    ctx.globalAlpha = 0.25 + 0.25 * Math.sin(G.realT * 18); ctx.fillStyle = LV_COL.gate;
    ctx.fillRect(sx(cc.x - c / 2), sy(cc.y - c * 0.15), cs, cs * 0.3);
  }
  ctx.globalAlpha = 1;
}
// Over the swimmers: the sweepers and the rivals.
function courseDraw() {
  const V = G.lvl, C = V.crs;
  if (!C) return;
  const raw = RAW_COL; RAW_COL = true;
  const t = C.t0 != null ? G.t - C.t0 : 0;
  for (const s of C.sweeps) {
    const x = s.x != null ? s.x : crsSweepX(s, t), X = sx(x), Y = sy(s.y), hl = s.len / 2 * S;
    if (Math.abs(Y - H / 2) > H) continue;
    ctx.strokeStyle = '#fff4f8'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(4, 14 * S);
    ctx.beginPath(); ctx.moveTo(X - hl, Y); ctx.lineTo(X + hl, Y); ctx.stroke();
    ctx.strokeStyle = '#ff9fbf'; ctx.lineWidth = Math.max(1, 2 * S); ctx.beginPath(); // (cilia on the bar)
    for (let k = -hl; k <= hl; k += 8 * S) { const w = Math.sin(G.realT * 12 + k) * 4 * S; ctx.moveTo(X + k, Y - 6 * S); ctx.lineTo(X + k + w, Y - 15 * S); ctx.moveTo(X + k, Y + 6 * S); ctx.lineTo(X + k - w, Y + 15 * S); }
    ctx.stroke(); ctx.lineCap = 'butt';
  }
  for (const r of C.racers) crsDrawRacer(r);
  RAW_COL = raw;
}
function crsDrawRacer(r) {
  const X = sx(r.x), Y = sy(r.y);
  if (X < -60 || X > W + 60 || Y < -60 || Y > H + 60) return;
  const a = r.face, ca = Math.cos(a), sa = Math.sin(a), stun = r.stunT > G.t;
  ctx.strokeStyle = r.color; ctx.lineWidth = Math.max(1.5, 2.5 * S); ctx.beginPath();
  for (let k = 0; k <= 12; k++) {
    const d = 11 + k * 3.2, w = Math.sin(G.realT * (stun ? 4 : 14) + k * 0.7 + r.wob) * k * 0.55;
    const px = r.x - ca * d - sa * w, py = r.y - sa * d + ca * w;
    k ? ctx.lineTo(sx(px), sy(py)) : ctx.moveTo(sx(px), sy(py));
  }
  ctx.stroke();
  ctx.save(); ctx.translate(X, Y); ctx.rotate(a);
  ctx.fillStyle = r.color; ctx.beginPath(); ctx.ellipse(0, 0, 13 * S, 9 * S, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(4 * S, -3 * S, 4 * S, 2.2 * S, 0, 0, TAU); ctx.fill();
  ctx.restore();
  if (stun) { ctx.fillStyle = '#ffffff'; for (let k = 0; k < 3; k++) { const q = G.realT * 6 + k * TAU / 3; ctx.beginPath(); ctx.arc(X + Math.cos(q) * 12 * S, Y - 16 * S + Math.sin(q) * 4 * S, 2 * S, 0, TAU); ctx.fill(); } }
  ctx.font = `bold ${Math.max(9, Math.round(9 * S))}px ${MONO}`; ctx.textAlign = 'center'; ctx.fillStyle = r.color;
  ctx.fillText(r.name, X, Y - 22 * S);
}
// The minimap: the rivals as coloured dots.
function courseMap(mx, my, k) {
  const C = G.lvl.crs, p = me();
  if (!C) return;
  for (const r of C.racers) { ctx.fillStyle = r.color; ctx.beginPath(); ctx.arc(mx + (r.x - p.x) * k, my + (r.y - p.y) * k, 3, 0, TAU); ctx.fill(); }
}
// The track along the top (every view): start to the line, a dot per rival, you on top, your place and the clock
// at the right; the countdown big in the middle of the screen.
function courseTrack(top) {
  const V = G.lvl, C = V.crs;
  if (!C) return;
  const x0 = 16, x1 = W - 96, y = top + 66, tot = Math.max(1, C.sd[lvIdx(C.sx, C.sy)]);
  const at = (x, y2) => x0 + (x1 - x0) * clamp(1 - crsDist(x, y2) / tot, 0, 1);
  const raw = RAW_COL; RAW_COL = true;
  ctx.save(); ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.fillRect(x0, y - 0.5, x1 - x0, 1);
  ctx.globalAlpha = 0.9; for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#ffffff' : '#2a0f1c'; ctx.fillRect(x1 + 2, y - 6 + k * 3, 3, 3); ctx.fillStyle = k % 2 ? '#2a0f1c' : '#ffffff'; ctx.fillRect(x1 + 5, y - 6 + k * 3, 3, 3); }
  for (const r of C.racers) { ctx.globalAlpha = 0.95; ctx.fillStyle = r.color; ctx.beginPath(); ctx.arc(r.done ? x1 + 5 : at(r.x, r.y), y, 4, 0, TAU); ctx.fill(); }
  const p = me(); ctx.globalAlpha = 1; ctx.fillStyle = PAL.you; ctx.beginPath(); ctx.arc(V.won ? x1 + 5 : at(p.x, p.y), y, 5.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
  const t = C.t0 != null ? (C.time != null ? C.time : G.t - C.t0) : 0;
  ctx.textAlign = 'right'; ctx.fillStyle = XR.white; ctx.font = 'bold 15px ' + MONO; ctx.fillText(`${C.place}/${CRS.racers + 1}`, W - 16, y + 1);
  ctx.fillStyle = XR.dim; ctx.font = '10px ' + MONO; ctx.fillText(fmtTime(t), W - 16, y + 14);
  if (C.cd > 0) {
    const n = Math.max(1, Math.ceil(C.cd - 0.6)), f = (C.cd - 0.6) % 1;
    ctx.textAlign = 'center'; ctx.globalAlpha = 0.4 + 0.6 * f; ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(64 + 30 * (1 - f))}px ` + MONO;
    ctx.fillText(String(n), W / 2, H * 0.38);
  }
  ctx.restore(); RAW_COL = raw;
}
// The HUD's top line: your place and the race clock (the zone, or the countdown, above it).
function courseHud(mid, by) {
  const V = G.lvl, C = V.crs;
  const sub = C && C.cd > 0 ? String(Math.max(1, Math.ceil(C.cd - 0.6))) : V.zone ? V.zone.name : COURSE.name;
  const t = C && C.t0 != null ? (C.time != null ? C.time : G.t - C.t0) : 0;
  ctx.fillStyle = XR.dim; ctx.font = '10px ' + MONO; ctx.fillText(sub, mid, by - 18);
  ctx.fillStyle = XR.white; ctx.font = 'bold 21px ' + MONO; ctx.fillText(`${C ? C.place : 1}/${CRS.racers + 1}  ${fmtTime(t)}`, mid, by + 4);
}
