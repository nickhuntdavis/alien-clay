'use strict';
// Storm Directive - engine: simulation, combat, AI, spawning, rendering.

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

const cv = document.getElementById('game');
let ctx = cv.getContext('2d', { alpha: false }); // (let: the pause menu borrows it to draw your portrait, render.js drawYouPortrait)
let W = 0, H = 0, DPR = 1, S = 1, S0 = 1; // screen size (css px), pixel ratio, world->screen scale (S0 before zoom)
const QUAL = { lv: 0, slow: 0, fast: 0 }; // adaptive quality level (see qualTick)
// Start one step above where this phone settled last time, so a weak phone doesn't stutter through every step
// in minute 1 (a strong one climbs back to full quality within seconds anyway).
try { QUAL.lv = Math.max(0, Math.min(4, (+localStorage.getItem('sd_qual') || 0) - 1)); } catch (e) { /* storage unavailable */ }
const qualSave = () => { try { localStorage.setItem('sd_qual', String(QUAL.lv)); } catch (e) { /* ignore */ } };
// Pinch (or mouse wheel) zoom, shown as the microscope's magnification. Gameplay (spawn distances) uses S0,
// so zooming in never brings monsters closer.
const ZOOM = { z: 1, min: 0.6, max: 2, until: 0, defocus: 0, lastT: 0 };
function refocusLeft() { return Math.max(0, 1 - (performance.now() - ZOOM.lastT) / 600); }
try { const z = +localStorage.getItem('sd_zoom'); if (z) ZOOM.z = Math.min(ZOOM.max, Math.max(ZOOM.min, z)); } catch (e) { /* storage unavailable */ }
function setZoom(z, save) {
  const nz = Math.min(ZOOM.max, Math.max(ZOOM.min, z));
  // Changing objective throws the image out of focus for a moment (see drawRefocus in render.js).
  if (nz !== ZOOM.z) {
    // A click for every detent the knob passes (about every 4% of magnification), at most one per 22 ms.
    ZOOM.turn = (ZOOM.turn || 0) + Math.log(nz / ZOOM.z);
    const now = performance.now();
    if (Math.abs(ZOOM.turn) > 0.04 && !(ZOOM.clickT > now - 22)) { knobClick(Math.sign(ZOOM.turn)); ZOOM.turn = 0; ZOOM.clickT = now; }
  }
  if (save && ZOOM.turned) { knobClick(0, true); ZOOM.turned = false; }
  if (nz !== ZOOM.z) ZOOM.turned = true;
  if (nz !== ZOOM.z) { ZOOM.defocus = Math.min(1, (ZOOM.defocus || 0) * refocusLeft() + Math.abs(Math.log(nz / ZOOM.z)) * 7); ZOOM.lastT = performance.now(); }
  ZOOM.z = nz;
  S = S0 * ZOOM.z; ZOOM.until = performance.now() + 1600;
  if (save) { try { localStorage.setItem('sd_zoom', ZOOM.z.toFixed(3)); } catch (e) { /* ignore */ } }
}
const cam = { x: 0, y: 0, shake: 0 };

function resize() {
  // Quality 4 (the lowest) draws at 75% resolution and lets the screen stretch it: about 44% fewer pixels for a
  // weak graphics chip, at the cost of slightly softer edges.
  DPR = Math.min(window.devicePixelRatio || 1, QUAL.lv < 2 ? 2 : QUAL.lv < 3 ? 1.5 : QUAL.lv < 4 ? 1 : 0.75);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  S0 = Math.min(W, H) / 640; // world units across the short side of the screen
  S = S0 * ZOOM.z;
}
window.addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------- state
let G = null;
let uidSeq = 1;
const CAPS = { enemies: 170, proj: 380, ebul: 800, parts: 300, texts: 40, gems: 350, zones: 120 }; // (was 240 enemies, 450 particles)
// Fewer, tougher monsters: 75% of the spawns, each worth 1.4x the XP (it was 1.8x: level-ups came so often they felt like speed bumps), and up to a third more HP, so the
// work per minute and the levelling stay where they were (you kill about half as many: XP_K was tuned in
// simulated runs to keep the old level curve), with a calmer screen. The extra HP builds up over
// the first four minutes (on the difficulty clock): early on your weapons are weak, and tougher fodder there
// just slowed your levelling and let crowds swamp you.
const SPAWN_K = 0.75, XP_K = 1.2, toughK = t => 1 + (1 / SPAWN_K - 1) * Math.min(1, t / 240);
// Adaptive quality: when frames run slow for a while (busy late game, slower phones), step the costly
// extras down; step back up once there's headroom again. 0: everything. 1: no lens blur or foreground
// debris, fewer floating numbers. 2: 1.5x resolution, plainer common enemies, fewer particles. 3: 1x resolution.
const qualParts = () => (QUAL.lv >= 2 ? 220 : CAPS.parts);
const qualTexts = () => (QUAL.lv >= 1 ? 20 : CAPS.texts);
function qualTick(raw) {
  if (raw > 1 / 40) { QUAL.slow += raw; QUAL.fast = 0; } else if (raw < 1 / 54) { QUAL.fast += raw; QUAL.slow = Math.max(0, QUAL.slow - raw * 0.5); }
  const now = performance.now();
  if (QUAL.slow > 1.5 && QUAL.lv < 4) {
    // Stepping straight back down after stepping up means that level is too much: stay put for a minute.
    if (now - (QUAL.upAt || -1e9) < 6000) QUAL.lockUntil = now + 60000;
    QUAL.lv++; QUAL.slow = 0; QUAL.fast = 0; if (QUAL.lv >= 2) resize(); qualSave();
  } else if (QUAL.fast > 10 && QUAL.lv > 0 && now > (QUAL.lockUntil || 0)) { QUAL.lv--; QUAL.upAt = now; QUAL.slow = 0; QUAL.fast = 0; if (QUAL.lv >= 1) resize(); qualSave(); }
}

function newStats() {
  return {
    might: 1, haste: 1, reloadSpd: 1, magMult: 1, multishot: 0, projSpeed: 1, range: 1, area: 1, dur: 1,
    pierce: 0, crit: 0.05, critDmg: 1.6, maxHp: 120, regen: 0, speed: 1, magnet: 1, armour: 0, luck: 0,
    lifesteal: 0, elem: { phys: 1, fire: 1, ice: 1, shock: 1, poison: 1, arcane: 1, oxi: 1, salt: 1 }, chain: 0, cocktail: 0, chainReact: 0, mixologist: 0, stamMax: 0, stamRegen: 1, sprintCost: 1, sprintSpd: 0, featCost: 1,
    poisonCap: 12, react: 1, cdr: 1, xp: 1, dodge: 0, chronoGain: 1, scrap: 1,
    lastRound: 0, tactical: 0, focus: 0, overkill: 0, crossfire: 0, momentum: 0, anchorLink: 0, future: 0, ram: 0, heft: 0, thorns: 0, grit: 0, echoInherit: 0,
    bankShot: 0, atpK: 0, ironGut: 0, brushOff: 0, flow: 0, skid: 0,
    bulletSpeed: 1, spawnMult: 1, healMult: 1, viewers: 1, noArmour: false, traction: 1,
  };
}

function newGame() {
  DMGNUM.log = null; DMGNUM.bigT = -9; // damage numbers re-learn the scale each run
  CORE.arena = typeof UI !== 'undefined' && (UI.sample === 's002' || UI.sample === 's006') ? DISH.arena : CORE.arena0;
  G = {
    state: 'play', t: 0, realT: 0,
    player: { x: 0, y: 0, vx: 0, vy: 0, r: 12, hp: 120, iframes: 0, face: -Math.PI / 2, flash: 0 },
    P: newStats(),
    enemies: [], proj: [], ebul: [], gems: [], pickups: [], zones: [], fx: [], parts: [], texts: [], turrets: [], timers: [],
    weapons: Array(BASE_SLOTS).fill(null), spells: [null, null], passives: {},
    moveDir: 'kite', manual: null,
    kills: 0, level: 1, xp: 0, xpNeed: xpNeed(1),
    lootQueue: [{ kind: 'start' }], rerolls: 2,
    warp: 0, rage: 0, shieldT: 0, barrier: 0, barrierR: 0, barrierDmg: 0,
    nextBoss: BOSS_INTERVAL + 20, bossCount: 0, boss: null, nextWave: 27,
    spawnAcc: 0, crowdT: 0, synergy: {}, banner: null,
    core: makeCore(), scrap: 0,
    chrono: newChrono(), echoes: [], rewind: null, realPlayer: null, lights: [], decals: [],
    tethers: [], grudge: null, mimicPat: null, curses: {}, scatter: false, pair: {}, relics: {}, hazards: [],
    show: newShow(),
    stats: { dmg: {}, hurt: {}, hurtKind: { bullets: 0, contact: 0, blast: 0, other: 0 }, lastHit: '', reactions: 0, reactBy: {}, merges: 0, bossKills: 0, maxCombo: 0, rewinds: 0, leaks: 0, absorbed: 0 },
  };
  G.bossRoster = bossRoster();
  G.ev = newEvents(); G.evm = Object.assign({}, EVM0);
  if (CORE.arena === DISH.arena) initWaves();
  if (typeof UI !== 'undefined' && UI.sample === 's000') initDebug();
  G.terrain = makeTerrain();
  cam.x = 0; cam.y = 0; cam.shake = 0;
  // In the Petri Dish you start at the bottom of the dish, facing the egg (not sitting on it).
  if (G.wave) { const p = G.player; p.y = DISH.arena * 0.72; unstick(p, p.r + 6); cam.x = p.x; cam.y = p.y; }
  if (typeof UI !== 'undefined' && LV_SAMPLE[UI.sample] != null) lvInit(LV_SAMPLE[UI.sample]); // a campaign level (levels.js)
  // G.dyes: which colours show. G.dyeBoon: which stains you found this run (their boons). Permanent stains
  // (one kept at the end of each finished run) start switched on, colour only; the pause menu toggles them.
  G.dyes = {}; G.dyeBoon = {};
  for (const id in (META.pstains || {})) if (DYES[id] && !(META.pstainOff || {})[id] && !(G.wave && id === 'rival')) G.dyes[id] = true;
  applyMeta(G);
  genesStart(G);
  refreshPalette(); // greyscale apart from your permanent stains: colour comes from stains picked up during the run
}

function angDiff(a, b) { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; }
function xpNeed(l) { return Math.floor(4 + (l - 1) * 2.5 + Math.pow(l - 1, 2.35) * 0.22); }
function hpMul(t) { return (1 + t / 120 + Math.pow(t / 220, 2.4)) * (t > 900 ? Math.pow(1.32, (t - 900) / 60) : 1); }
const SURGE_T = 900; // Storm Surge: from 15 minutes on the difficulty clock, enemy damage compounds every minute.
// A run lasts about 10 minutes: the difficulty clock runs 1.5 times faster than real time.
const PACE = 1.5;
function PT() { return G.lvl ? lvPT() : G.wave ? wavePT() : G.t * PACE; }
// Ahead of the curve? Enemies keep up. Levels you are past where a 10-minute run expects you to be
// (level 60 at 9 minutes) add 5% enemy health and 3% enemy damage each.
function levelsAhead() { if (G.wave || G.lvl) return 0; return Math.max(0, G.level - (1 + 59 * Math.pow(Math.min(1, G.t / 540), 0.85))); }
function hpNow() { return hpMul(PT()) * (1 + 0.05 * levelsAhead()); }
function dmgNow() { return dmgMul(PT()) * (1 + 0.03 * levelsAhead()); }
function dmgMul(t) { return (1 + t / 240 + Math.pow(t / 600, 2)) * (t > SURGE_T ? Math.pow(1.3, (t - SURGE_T) / 60) : 1); }
// Late-game fire-rate pressure for ranged enemies.
function fireMul(t) { return 1.1 + t / 380; }

// ---------------------------------------------------------------- spatial grid
const CELL = 80;
const grid = new Map();
function gridKey(cx, cy) { return (cx + 50000) * 100000 + (cy + 50000); }
function gridBuild() {
  grid.clear();
  G.bigR = 0;
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (e.r > G.bigR) G.bigR = e.r;
    const k = gridKey(Math.floor(e.x / CELL), Math.floor(e.y / CELL));
    let c = grid.get(k);
    if (!c) { c = []; grid.set(k, c); }
    c.push(e);
  }
}
// Calls fn(e, d2) for every live enemy whose body overlaps circle (x,y,r). fn returns true to stop.
// ---------------------------------------------------------------- tail snipping
// Swimmers (not rivals or bosses) lose their flagellum when a shot crosses it or hits them from behind:
// they slow to a twitching drift, and the severed tail wriggles away and fades.
const canSnip = e => !e.dead && !e.tailCut && !e.rival && !e.boss && !e.charmed && e.def.shape === 'sperm' && e.tail;
function cutTail(e) {
  e.tailCut = true;
  (G.severed || (G.severed = [])).push({ pts: e.tail.map(q => ({ x: q.x, y: q.y })), life: 1.6, max: 1.6, k: e.r / 8, seed: Math.random() * 9 });
  if (G.severed.length > 40) G.severed.shift();
  if (!(G.snipT > G.realT)) { G.snipT = G.realT + 0.6; floatText(e.x, e.y - e.r - 8, 'SNIP!', XR.white, 12, 0.7); }
  G.stats.snips = (G.stats.snips || 0) + 1;
}
function tailSnip(pr) {
  forNear(pr.x, pr.y, pr.r + 70, e => {
    if (!canSnip(e)) return;
    const t = e.tail, rr = (pr.r || 3) + 6;
    for (let i = 2; i < t.length - 1; i++) if (Math.abs(t[i].x - pr.x) < rr && Math.abs(t[i].y - pr.y) < rr) { cutTail(e); return; }
  });
}
function updateSevered(dt) {
  if (!G.severed) return;
  for (const s of G.severed) { s.life -= dt; for (const q of s.pts) { q.x += Math.sin(G.realT * 9 + s.seed + q.x * 0.05) * 14 * dt; q.y += Math.cos(G.realT * 7 + s.seed) * 10 * dt; } }
  G.severed = G.severed.filter(s => s.life > 0);
}

function forNear(x, y, r, fn) {
  const R = r + Math.max(60, G.bigR || 0); // max enemy radius margin
  const x0 = Math.floor((x - R) / CELL), x1 = Math.floor((x + R) / CELL);
  const y0 = Math.floor((y - R) / CELL), y1 = Math.floor((y + R) / CELL);
  for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
    const c = grid.get(gridKey(cx, cy));
    if (!c) continue;
    for (let i = 0; i < c.length; i++) {
      const e = c[i];
      if (e.dead) continue;
      const dx = e.x - x, dy = e.y - y, rr = r + e.r;
      const d2 = dx * dx + dy * dy;
      if (d2 <= rr * rr && fn(e, d2)) return;
    }
  }
}

// ---------------------------------------------------------------- targeting
function targetScore(dir, e, d2) {
  switch (dir) {
    case 'nearest': return -d2;
    case 'furthest': return d2;
    case 'strongest': return e.maxHp * 1e6 - d2;
    case 'weakest': return -e.maxHp * 1e6 - d2;
    case 'lowhp': return -e.hp * 1e6 - d2;
    case 'highhp': return e.hp * 1e6 - d2;
    case 'armour': return effArmour(e) * 1e6 - d2;
    case 'fastest': return e.speed * 1e6 - d2;
    case 'cluster': return e.crowd * 1e6 - d2;
    case 'elite': return (e.boss ? 2 : e.rival ? 1.5 : e.elite ? 1 : 0) * 1e9 - d2;
    case 'shooters': return (e.boss || e.def.shoot || e.def.ai === 'summon' || e.def.ai === 'medic' ? 1 : 0) * 1e9 - d2;
    case 'random': return Math.random();
    case 'revenge': return (e === G.grudge ? 1e12 : 0) - d2;
  }
  return -d2;
}
function acquire(dir, range, x, y, exclude) {
  // Once the egg is yours to break, half of all target picks in range go to it, whatever the directive.
  const egg = G.eggE;
  if (egg && !egg.dead && G.level >= EGG.level && egg !== exclude && Math.random() < 0.5 && Math.hypot(egg.x - x, egg.y - y) < range + egg.r) return egg;
  let best = null, bv = -Infinity;
  const r2 = range * range;
  for (const e of G.enemies) {
    if (e.dead || e.phased || e.charmed || e === exclude || (e.egg && G.level < EGG.level)) continue;
    const dx = e.x - x, dy = e.y - y, d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    const v = targetScore(dir, e, d2) + (e.evTag ? 1e13 : 0); // run-event targets come first
    if (v > bv) { bv = v; best = e; }
  }
  return best;
}
function acquireMany(dir, range, x, y, n) {
  const r2 = range * range, list = [];
  for (const e of G.enemies) {
    if (e.dead || e.phased || e.charmed || (e.egg && G.level < EGG.level)) continue;
    const dx = e.x - x, dy = e.y - y, d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    list.push({ e, v: targetScore(dir, e, d2) });
  }
  list.sort((a, b) => b.v - a.v);
  return list.slice(0, n).map(o => o.e);
}
// Enemy armour scales with the square root of the enemy health clock, so armour and shred still matter late.
function effArmour(e) { return Math.max(0, e.armour + (e.auraArm > 0 ? 4 : 0) - e.shred) * (e.armK || 1); }

// ---------------------------------------------------------------- inventory & stats
function makeSlot(id, isSpell, lvl) {
  const def = isSpell ? SPELLS[id] : WEAPONS[id];
  const w = { uid: uidSeq++, id, def, isSpell, lvl: lvl || 1, dir: def.dir, cd: 0.3, ammo: 0, reloadT: 0, reloadMax: 1,
    spin: 0, active: 0, ang: 0, blades: [], beamT: 0, beamTick: 0, beams: [], s: null,
    mods: [], perks: {}, dirs: def.committee ? [def.dir, 'nearest', 'shooters'] : null, heat: 0, stored: 0, gachaTier: 0, focusT: 0, lastTarget: null, curTarget: null };
  if (def.gacha) rollGacha(w, true);
  computeStats(w);
  w.ammo = w.s.mag;
  return w;
}

const WEAPON_LV_DMG = 0.35; // damage gained per weapon level
const REACH_START = 300;
const BOSS_HIT_CAP = 0.22;
const DODGE_CAP = 0.75; // one global ceiling, applied when dodge is rolled
// Defence keeps pace with the run: armour, regeneration and the lifesteal pool scale with the enemy damage clock
// (armour) or your max HP (pools), so they still matter at minute 10.
const defClock = () => Math.max(1, dmgNow());
const REACH_FREE = new Set(['mine', 'crayon', 'wake', 'orbit', 'melee', 'friend', 'heal']); // range means something else for these
function computeStats(w) {
  // Per-weapon tuning: the weapon sees your stats plus its own tuning while its stats are worked out.
  const realP = G.P;
  if (w.wp) G.P = weaponP(w);
  try { computeStatsInner(w); } finally { G.P = realP; }
}
function computeStatsInner(w) {
  const d = w.def, b = d.base, P = G.P, L = w.lvl, syn = G.synergy;
  const s = Object.assign({}, b);
  let dmgB = 0, areaB = 0, durB = 0, cdB = 0;
  for (let l = 2; l <= L; l++) {
    const bo = d.lv && d.lv[l];
    if (!bo) continue;
    for (const k in bo) {
      if (k === 'dmg') dmgB += bo[k];
      else if (k === 'area') areaB += bo[k];
      else if (k === 'dur') durB += bo[k];
      else if (k === 'cd') cdB += bo[k];
      else s[k] = (s[k] || 0) + bo[k];
    }
  }
  const elemMult = d.elem2 ? (P.elem[d.elem] + P.elem[d.elem2]) / 2 : P.elem[d.elem];
  if (d.kind === 'heal') s.dmg = b.dmg * (1 + dmgB) + 0.012 * (L - 1);
  else s.dmg = b.dmg * (1 + WEAPON_LV_DMG * (L - 1) + dmgB) * P.might * elemMult;
  const physBonus = syn.phys && d.elem === 'phys' ? 1.15 : 1;
  s.cd = (b.cd || 0) * Math.pow(0.95, L - 1) * (1 + cdB) / (w.isSpell ? 1 : P.haste * physBonus);
  if (w.isSpell) s.cd *= Math.max(0.4, P.cdr);
  s.mag = Math.max(1, Math.round((b.mag || 1) * (1 + 0.12 * (L - 1)) * P.magMult));
  s.reload = (b.reload || 0) * Math.pow(0.95, L - 1) / P.reloadSpd;
  const multi = MULTI_KINDS.includes(d.kind) ? Math.min(2, P.multishot) : 0; // (all sources together add at most 2 projectiles)
  const baseCount = s.count || 1, extraMulti = multi * (d.kind === 'ring' ? 4 : 1);
  s.count = baseCount + extraMulti;
  if (d.kind === 'gun' && s.pierce < 90) s.pierce = (s.pierce || 0) + P.pierce;
  if (d.kind === 'ring') s.pierce = (s.pierce || 0) + P.pierce;
  s.speed = (b.speed || 0) * P.projSpeed;
  const areaMult = P.area * (1 + areaB);
  // Starting reach: long-range weapons begin at what you can see on screen (about 300) and grow 30 a
  // level to their full range; Range upgrades multiply it as before.
  const reach = b.range > REACH_START && !REACH_FREE.has(d.kind) ? Math.min(b.range, REACH_START + 30 * (L - 1)) : (b.range || 0);
  s.range = reach * P.range * (d.style === 'flame' ? 1 + areaB * 0.5 : 1);
  if (s.area) s.area *= areaMult;
  if (s.explode && s.explode > 1) s.explode *= areaMult;
  if (s.aura) s.aura *= areaMult;
  if (s.radius) s.radius *= areaMult;
  if (d.style === 'flame' || d.kind === 'orbit' || d.style === 'void') s.size *= areaMult;
  // Guns with nothing area-shaped get bigger shots instead (easier to land, wider pass through a crowd).
  else if (d.kind === 'gun' && s.size && !s.area && !(s.explode > 1) && !s.aura && !s.radius) s.size *= 1 + (areaMult - 1) * 0.7;
  s.dur = (b.dur || 0) * P.dur * (1 + durB);
  s.chain = (s.chain || 0) + (d.elem === 'shock' || d.elem2 === 'shock' ? P.chain : 0);
  s.crit = P.crit + (b.critBonus || 0);
  for (const m of w.mods || []) {
    const mp = m.p || 1;
    if (m.id === 'ricochet') s.bounce = (s.bounce || 0) + 1 + Math.round(mp);
    if (m.id === 'seeking') s.homing = Math.max(s.homing || 0, 3 + 2 * mp);
    if (m.id === 'boomerang') s.boomerangMod = mp; // (power: harder on the way back)
    if (m.id === 'growing') s.grow = mp;
    if (m.id === 'orbiting') s.orbitMod = 1.2 * mp;
    if (m.id === 'splitting') s.splitHit = 2 + Math.round(mp);
    if (m.id === 'freezing') s.modFreeze = 0.18 * mp;
    if (m.id === 'exploding') s.modExplode = 0.3 * mp;
    if (m.id === 'mindctrl') { s.modCharm = 0.05 * mp; s.charmDur = 6 * mp; }
    if (m.id === 'chaining') { s.pArc = Math.max(s.pArc || 0, 0.25 * mp); s.pArcDmg = Math.max(s.pArcDmg || 0, 0.5); s.pArcN = Math.max(s.pArcN || 0, 1); }
    if (m.id === 'pulsing') { s.pulse = 0.15 * mp; s.pulseRate = 0.6; }
    if (m.id === 'magnetic') s.magnet = 70 * mp;
    if (m.id === 'delayed') s.delay = 0.3 * mp;
    if (m.id === 'mirror') s.mirror = 0.35 * mp;
  }
  // Duo combos.
  const has = id => (w.mods || []).some(m => m.id === id);
  s.duos = DUOS.filter(x => has(x.a) && has(x.b)).map(x => x.name);
  for (const n of s.duos) {
    if (n === 'Follow the Leader') s.shardHome = 1;
    if (n === 'Bath Bomb') s.cryoblast = 1;
    if (n === 'Halo') { s.pulse *= 2; s.pulseRate = 0.22; }
    if (n === 'Snowball') s.grow = (s.grow || 0) * 2;
    if (n === 'Bouncing Off the Walls') s.pArcN = 3;
    if (n === 'Pied Piper') s.charmDur *= 2;
    if (n === 'Kaleidoscope') s.kaleido = 1;
    if (n === 'Biological Clock') s.timeBomb = 1;
  }
  s.perkCount = 0;
  applyPerks(w, s);
  genesAdapt(w, s);
  // Extra projectiles (Split Personality, Plus One, Twins!, Octuplets) share the damage, and add half what they
  // used to: 3 extra shots on a one-shot weapon give about 1.65x damage in all (it was 2.3x).
  const n1 = baseCount + extraMulti + s.perkCount;
  if (n1 > baseCount && d.melee !== 'pulse') { const k = n1 / baseCount; s.dmg *= (1 + (Math.pow(k, 0.6) - 1) / 2) / k; }
  spellForkStats(w, s); // (a spell's Lv 4 path)
  w.s = s;
}

function recomputeAll() {
  const counts = {};
  for (const w of G.weapons.concat(G.spells)) {
    if (!w) continue;
    counts[w.def.elem] = (counts[w.def.elem] || 0) + 1;
    if (w.def.elem2) counts[w.def.elem2] = (counts[w.def.elem2] || 0) + 1;
  }
  G.synergy = {};
  for (const k in counts) if (counts[k] >= 2) G.synergy[k] = true;
  for (const w of G.weapons.concat(G.spells)) if (w) { computeStats(w); w.ammo = Math.min(w.ammo, w.s.mag); }
  updatePairings();
}


// ---------------------------------------------------------------- loot
// special: this card may come out Mythical or Celestial (ordinary DNA only, three a run at most).
function rollRarity(min, special) {
  if (G.mythBox) return Math.random() < 0.3 ? 6 : 5; // (Achievement DNA)
  const luck = G.P.luck;
  if (special && (G.mythN || 0) < 3) {
    const k = 1 + luck * 2;
    if (Math.random() < 0.0018 * k) return 6;
    if (Math.random() < 0.0055 * k) return 5;
  }
  const ws = RARITIES.map((r, i) => (i < min ? 0 : r.w * (1 + luck * i * 0.8)));
  let tot = ws.reduce((a, b) => a + b, 0), x = Math.random() * tot;
  for (let i = 0; i < ws.length; i++) { x -= ws[i]; if (x <= 0) return i; }
  return 4;
}

function lvBonusText(def, from, to) {
  const parts = [];
  for (let l = from + 1; l <= to; l++) {
    const bo = def.lv && def.lv[l];
    if (!bo) continue;
    for (const k in bo) {
      const v = bo[k];
      const label = { count: 'projectiles', pierce: 'pierce', chain: 'chain jumps', bounce: 'bounces', shred: 'armour shred' }[k];
      if (label) parts.push(`+${v} ${label}`);
      else if (k === 'dmg') parts.push(`+${pc(v)} ${def.kind === 'heal' ? 'healing' : 'damage'}`);
      else if (k === 'area') parts.push(`+${pc(v)} area`);
      else if (k === 'dur') parts.push(`+${pc(v)} duration`);
      else if (k === 'cd') parts.push(`${pc(-v)} faster`);
      else if (k === 'film') parts.push('thicker bubbles (they soak up hits and add them to the pop)');
      else if (k === 'rainbow') parts.push('rainbow pops (a random element each time)');
    }
  }
  return parts.join(', ');
}

function genLoot(req) {
  const opts = [];
  if (req.kind === 'myth') { // Achievement DNA: Mythical or Celestial cards only
    G.mythBox = true;
    try {
      const out = [];
      for (let k = 0; k < 10 && out.length < 3; k++) for (const o of genLoot(Object.assign({}, req, { kind: 'chest' }))) if (o.rarity >= 5 && !o.cursed && out.length < 3 && !out.some(q => q.title === o.title)) out.push(o);
      return out.length ? out : genLoot(Object.assign({}, req, { kind: 'chest' }));
    } finally { G.mythBox = false; }
  }
  const minR = redLoot(req, req.kind === 'boss' || req.kind === 'chest' ? 3 : 0); // level boxes Common+ (the Redtail: Uncommon+), Fan and boss boxes Epic+
  if (req.kind === 'slot') {
    // A weapon draft for a new mount: three fresh weapons, Rare or better.
    const owned = new Set(G.weapons.filter(Boolean).map(w => w.id));
    let pool = G.genes && !G.debug ? seqPool().filter(id => !owned.has(id)) : [];
    if (!pool.length) pool = Object.keys(WEAPONS).filter(id => !WEAPONS[id].merged && !WEAPONS[id].seqOnly && !owned.has(id)); // nothing left in your sequences
    const ids = shuffle(pool).slice(0, 3);
    return ids.map(id => optNewWeapon(id, Math.max(2, rollRarity(2))));
  }
  if (req.kind === 'relic') return spoilsRelics(req.boss);
  if (req.kind === 'spoils') return spoilsOpts();
  if (req.kind === 'rrelic') { const o = RIVAL_RELICS[req.rid].filter(id => !G.relics[id]).map(id => optRivalRelic(id, req.rid)); if (o.length) return o; req.kind = 'chest'; return genLoot(req); }
  if (req.kind === 'sfork') { const w = G.spells.find(x => x && x.uid === req.uid); if (w && !w.fork) return spellForkOpts(w); req.kind = 'level'; return genLoot(req); }
  if (req.kind === 'vesicle') return vesicleOpts();
  if (req.kind === 'splice') return spliceOpts();
  if (req.kind === 'branch') {
    const w = G.weapons.find(x => x && x.uid === req.uid);
    if (w && !w.perks[req.lvl]) return weaponTree(w.def)[req.lvl].map(id => optPerk(w, req.lvl, id));
    req.kind = 'level'; return genLoot(req); // the weapon was fused or recycled meanwhile
  }
  if (req.kind === 'start') {
    // Your Primary Sequence's own weapons, plus one Gene Bank wildcard if you've unlocked any.
    const own = G.genes ? PROFILES[G.genes.primary].weapons.filter(id => WEAPONS[id]) : starterPool().slice(0, 3);
    const wild = Object.keys(META.starters || {}).filter(id => META.starters[id] && WEAPONS[id] && !own.includes(id));
    const ids = own.concat(wild.length ? [pick(wild)] : []);
    for (const id of ids) opts.push(optNewWeapon(id, 0));
    return opts;
  }
  const cands = [];
  for (const c of availableCombos()) cands.push({ w: 60, make: () => optCombo(c), key: 'fuse' + c.id });
  G.weapons.forEach((w, i) => { if (w && w.lvl < wCap(w)) cands.push({ w: 14, key: 'wu' + i, make: r => optUpgrade(w, r) }); });
  G.spells.forEach((w, i) => { if (w && w.lvl < MAX_WLVL) cands.push({ w: 8, key: 'su' + i, make: r => optUpgrade(w, r) }); });
  // New weapons only come from weapon drafts (level 1, 8 and 22), never from ordinary DNA.
  if (G.spells.some(w => !w)) {
    const owned = new Set(G.spells.filter(Boolean).map(w => w.id));
    const pool = shuffle(Object.keys(SPELLS).filter(id => !owned.has(id) && (!SPELLS[id].seqOnly || (G.genes && G.genes.active.includes(SPELLS[id].seqOnly))))).slice(0, 3);
    for (const id of pool) cands.push({ w: G.t > 30 ? 6 : 3, key: 'sn' + id, make: r => optNewSpell(id, r) });
  }
  G.weapons.forEach(w => {
    if (!w) return;
    // New modifiers while slots are free; otherwise offer to power up one it already has.
    const fits = id => !MODS[id].kinds || MODS[id].kinds.includes(w.def.kind);
    const ids = w.mods.length < MOD_SLOTS ? Object.keys(MODS).filter(id => fits(id) && !w.mods.some(m => m.id === id)) : w.mods.filter(m => m.p < MOD_MAX_POWER).map(m => m.id);
    if (ids.length) { const id = pick(ids); cands.push({ w: 8, key: 'mod' + w.uid, make: r => optMod(w, id, r) }); }
  });
  const ownedElems = new Set(); for (const w of G.weapons.concat(G.spells)) if (w) { ownedElems.add(w.def.elem); if (w.def.elem2) ownedElems.add(w.def.elem2); }
  for (const id in PASSIVES) {
    const st = G.passives[id] || 0;
    // Weapon tuning (fire rate, projectiles, area...) has its own stacks on every weapon.
    const full = PER_WEAPON.has(id) ? !G.weapons.some(w => w && (w.wpN && w.wpN[id] || 0) < PASSIVES[id].max) && st >= PASSIVES[id].max : st >= PASSIVES[id].max;
    if (full || (PASSIVES[id].needsScrap && !ownsScrapWeapon()) || !passiveUseful(id)) continue;
    if (PASSIVES[id].seq && !(G.genes && G.genes.active.includes(PASSIVES[id].seq))) continue; // (a sequence's own upgrades)
    if (PASSIVES[id].terrain && !(G.terrain && G.terrain.list.some(o => o.type === PASSIVES[id].terrain))) continue; // terrain upgrades need that terrain
    // Element cards only for elements you actually use.
    if (ELEM_PASSIVE_OF[id] && !ownedElems.has(ELEM_PASSIVE_OF[id])) continue;
    cands.push({ w: PASSIVES[id].terrain ? 1 : 1.8, key: 'p' + id, pmin: PASSIVES[id].minRarity || 0, make: r => optPassive(id, r) });
  }
  // Stains you don't have yet.
  // (Not one you already see: a permanent stain switched on in the pause menu counts.)
  for (const id in DYES) if (!G.dyeBoon[id] && !G.dyes[id] && !(G.wave && id === 'rival')) cands.push({ w: 4, key: 'dye' + id, make: () => optDye(id) });
  // Guarantee a fusion option when one is available.
  const chosen = [];
  const mc = cands.filter(c => c.key.startsWith('fuse')); // (this used to match modifiers too, forcing one into every box)
  if (mc.length) chosen.push(mc[0]);
  // The first level-ups always offer the GFP tag, so you can find yourself early.
  else if (!G.dyeBoon.gfp && !G.dyes.gfp && req.kind === 'level' && G.level <= 3) chosen.push(cands.find(c => c.key === 'dyegfp'));
  // Never the same upgrade twice in one box (say, at two rarities): a card that matches one already in it is
  // thrown back and another drawn.
  const same = (o, q) => o.title === q.title && (o.modFor || '') === (q.modFor || '');
  const tried = new Set();
  for (const c of chosen.filter(Boolean)) { tried.add(c); const o = withBoon(c.make(Math.max(rollRarity(minR, true), c.pmin || 0))); if (!opts.some(q => same(o, q))) opts.push(o); }
  while (opts.length < 3) {
    const rest = cands.filter(c => !tried.has(c));
    if (!rest.length) break;
    let tot = rest.reduce((a, c) => a + c.w, 0), x = Math.random() * tot, c = rest[rest.length - 1];
    for (const r of rest) { x -= r.w; if (x <= 0) { c = r; break; } }
    tried.add(c);
    const o = withBoon(c.make(Math.max(rollRarity(minR, true), c.pmin || 0)));
    if (!opts.some(q => same(o, q))) opts.push(o);
  }
  // Occasionally the System slips a cursed card into the box.
  const curses = CURSES.filter(c => !G.curses[c.id]);
  if (curses.length && !G.mythBox && Math.random() < 0.12 && opts.length) opts[opts.length - 1] = optCurse(pick(curses));
  if (opts.length && Math.random() < 0.45) pick(opts).quip = pick(CARD_QUIPS);
  const fillers = [optHeal, optRerolls, optOvercharge];
  for (const f of fillers) { if (opts.length >= 3) break; const o = f(); if (!opts.some(q => q.title === o.title)) opts.push(o); }
  return opts;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function optNewWeapon(id, r) {
  const def = WEAPONS[id], lvl = [1, 1, 2, 3, 4, 4, 4][r] || 1;
  return { def, rarity: r, tag: 'NEW WEAPON', icon: def.icon, color: def.color, elem: def.elem, title: def.name,
    sub: `${ELEMENTS[def.elem].name} | Lv ${lvl}`, desc: def.desc + comboHint(id),
    apply: () => { const i = G.weapons.findIndex(w => !w); if (i >= 0) { G.weapons[i] = makeSlot(id, false, lvl); setWeaponLevel(G.weapons[i], lvl, 1); recomputeAll(); } } };
}
function optNewSpell(id, r) {
  const def = SPELLS[id], lvl = [1, 1, 2, 3, 4, 4, 4][r] || 1;
  return { def, rarity: r, tag: 'NEW FEAT', icon: def.icon, color: def.color, elem: def.elem, title: def.name,
    sub: `${ELEMENTS[def.elem].name} Feat | Lv ${lvl}`, desc: def.desc,
    apply: () => { const i = G.spells.findIndex(w => !w); if (i >= 0) { G.spells[i] = makeSlot(id, true, lvl); recomputeAll(); } } };
}
// Only one weapon a run can reach mastery (Lv 10): once one has, the others stop at Lv 9.
function masterOf(w) { return G.weapons.find(o => o && o !== w && o.lvl >= MAX_WLVL) || null; }
function wCap(w) { return !w.isSpell && masterOf(w) ? MAX_WLVL - 1 : MAX_WLVL; }
function optUpgrade(w, r) {
  const n = RARITIES[r].lvls, to = Math.min(wCap(w), w.lvl + n);
  const bonus = lvBonusText(w.def, w.lvl, to);
  let desc = `+${pc(WEAPON_LV_DMG * (to - w.lvl))} damage, faster cycling` + (bonus ? `. ${bonus}` : '');
  if (!w.isSpell && to >= COMBO_LEVEL && w.lvl < COMBO_LEVEL && COMBOS.some(c => (c.a === w.id || c.b === w.id) && !(G.combo && G.combo[c.id]) && (owned(c.a === w.id ? c.b : c.a) || {}).lvl >= COMBO_LEVEL)) desc += '. Unlocks a COMBO!';
  if (!w.isSpell && to === MAX_WLVL) desc += '. MASTERY: only one weapon a run can reach Lv 10, and this takes it.';
  else if (!w.isSpell && to === MAX_WLVL - 1 && masterOf(w)) desc += `. Stops at Lv 9: ${masterOf(w).def.name} is your mastery weapon.`;
  return { def: w.def, w, wup: !w.isSpell, from: w.lvl, to, rarity: r, tag: w.isSpell ? 'FEAT UPGRADE' : 'UPGRADE', icon: w.def.icon, color: w.def.color, elem: w.def.elem, title: w.def.name,
    sub: `Lv ${w.lvl} > ${to}${to === MAX_WLVL ? ' (MAX)' : ''}`, desc,
    apply: () => { setWeaponLevel(w, to); computeStats(w); w.ammo = w.s.mag; w.reloadT = 0; } };
}
function optDye(id) {
  const D = DYES[id];
  // The card says the two things that matter: what you'll see, and what you get.
  return { rarity: 2, tag: 'STAIN', icon: 'DY', color: D.key || '#9fb3c8', title: D.name, sub: 'For the rest of the run', desc: `Shows: ${D.see}. Boon: ${D.boon}`,
    apply: () => {
      G.dyes[id] = true; G.dyeBoon[id] = true; if (D.apply) D.apply(G.P, G); recomputeAll(); refreshPalette();
      banner('STAIN: ' + D.name.toUpperCase(), D.key || PAL.upgrade);
      sysMsg('STAIN APPLIED', D.see + '. ' + D.boon, D.key || PAL.upgrade, true);
    } };
}
// Weapon tuning: below Legendary these power-ups go on ONE weapon you choose (on the card); Legendary and up
// tune every weapon at once. Each weapon keeps its own stacks.
const ELEM_PASSIVE_OF = { pyro: 'fire', cryo: 'ice', storm: 'shock', toxin: 'poison', arcanum: 'arcane', kinetic: 'phys' };
const PER_WEAPON = new Set(['haste', 'reload', 'mag', 'multishot', 'velocity', 'area', 'duration', 'pierce']);
const WP_KEYS = ['haste', 'reloadSpd', 'magMult', 'multishot', 'projSpeed', 'range', 'area', 'dur', 'pierce'];
function weaponP(w) {
  if (!w || !w.wp) return G.P;
  const o = Object.create(G.P);
  for (const k in w.wp) o[k] = G.P[k] + w.wp[k];
  return o;
}
// Only weapons the tuning actually does something for (or that turn it into their own twist).
function wpRelevant(w, id) {
  const d = w.def, b = d.base, tw = ADAPT[id] && ADAPT[id][w.id];
  if (tw) return true;
  if (id === 'pierce' && !((d.kind === 'gun' || d.kind === 'ring') && (b.pierce || 0) < 90)) return false;
  if (id === 'mag' && !((b.mag || 1) > 1)) return false;
  if (id === 'reload' && !((b.reload || 0) > 0)) return false;
  if (id === 'multishot' && !MULTI_KINDS.includes(d.kind)) return false;
  return wpChanges(w, id);
}
// Dry run: would this upgrade change anything about the weapon's stats? (Cached per level, upgrades and mods.)
function wpChanges(w, id) {
  if (!w.s) return true;
  const key = id + ':' + w.lvl + ':' + Object.values(w.perks || {}).join() + ':' + (w.mods || []).map(m => m.id).join();
  w.relC = w.relC || {};
  if (key in w.relC) return w.relC[key];
  const d = {}; for (const k of WP_KEYS) d[k] = 0;
  d.elem = G.P.elem; PASSIVES[id].apply(d, PASSIVES[id].v, G);
  const wp0 = w.wp, before = JSON.stringify(w.s);
  w.wp = Object.assign({}, wp0); for (const k of WP_KEYS) if (d[k]) w.wp[k] = (w.wp[k] || 0) + d[k];
  computeStats(w);
  const changed = JSON.stringify(w.s) !== before;
  w.wp = wp0; computeStats(w);
  return (w.relC[key] = changed);
}
// Upgrades that only do something with certain weapons: offer them only when you own one.
const FUTURE_KINDS = ['gun', 'chain', 'lob', 'mine', 'melee', 'orbit', 'siphon', 'wake'];
const PASSIVE_NEEDS = {
  lastround: w => (w.s.mag > 1 && !w.def.scrapAmmo) || !!ADAPT.lastround[w.id],
  tactical: w => w.s.reload > 0 || !!ADAPT.tactical[w.id],
  future: w => FUTURE_KINDS.includes(w.def.kind) || !!ADAPT.future[w.id],
};
function passiveUseful(id) {
  const ws = G.weapons.filter(w => w && w.s);
  if (PER_WEAPON.has(id)) return ws.some(w => wpRelevant(w, id));
  if (PASSIVE_NEEDS[id]) return ws.some(PASSIVE_NEEDS[id]);
  return true;
}
function wpTargets(id) { const max = PASSIVES[id].max; return G.weapons.filter(w => w && (w.wpN && w.wpN[id] || 0) < max && wpRelevant(w, id)); }
function wpApply(w, id, v) {
  const d = {}; for (const k of WP_KEYS) d[k] = 0;
  d.elem = G.P.elem; PASSIVES[id].apply(d, v, G);
  w.wp = w.wp || {}; w.wpN = w.wpN || {};
  for (const k of WP_KEYS) if (d[k]) w.wp[k] = (w.wp[k] || 0) + d[k];
  w.wpN[id] = (w.wpN[id] || 0) + 1;
  G.passives[id] = (G.passives[id] || 0); // (the global count is for Legendary, all-weapon tuning)
  recomputeAll();
  floatText(me().x, me().y - 34, w.def.name.toUpperCase() + ' TUNED', PAL.upgrade, 13, 0.8);
}
function optPassive(id, r) {
  const p = PASSIVES[id], intish = ['multishot', 'pierce', 'armour', 'heft', 'thorns', 'grit', 'bankshot', 'batteries', 'castiron', 'brushoff', 'withflow', 'skidmarks'].includes(id);
  const v = intish ? Math.max(1, Math.floor(RARITIES[r].mult)) * p.v : p.v * RARITIES[r].mult;
  const st = G.passives[id] || 0;
  const extra = adaptNotes(ADAPT[id]);
  const targets = PER_WEAPON.has(id) && r < 4 ? wpTargets(id) : null;
  if (targets && targets.length) {
    return { rarity: r, tag: 'TUNE A WEAPON', icon: p.icon, color: '#9fb3c8', title: p.name, sub: 'One weapon you choose (Legendary: all of them)',
      desc: p.fmt(v).replace(/ for all weapons/, '') + extra, pickW: targets.map(w => ({ uid: w.uid, def: w.def, lvl: w.lvl, n: w.wpN && w.wpN[id] || 0, max: p.max })),
      apply: uid => { const w = targets.find(x => x.uid === uid) || pick(targets); wpApply(w, id, v); } };
  }
  if (PER_WEAPON.has(id) && (st >= p.max || r < 4)) return optHeal(); // no weapon it would help (or all full)
  return { rarity: r, tag: 'POWER-UP', icon: p.icon, color: '#9fb3c8', title: p.name, sub: `Stack ${st + 1}/${p.max}`, desc: p.fmt(v) + extra,
    apply: () => { p.apply(G.P, v, G); G.passives[id] = st + 1; recomputeAll(); } };
}
function optMod(w, id, r) {
  const M = MODS[id], rr = Math.max(1, r), pw = MOD_POWER[rr];
  const have = w.mods.find(m => m.id === id);
  let elem = null, desc;
  if (id === 'elemental' && !have) { elem = pick(Object.keys(ELEMENTS).filter(e => e !== 'phys' && e !== w.def.elem)); desc = `Converts ${w.def.name} to ${ELEMENTS[elem].name} damage.${pw > 1 ? ` +${Math.round(15 * (pw - 1))}% damage.` : ''}` + elemTwistNote(w, elem); }
  else { const np = have ? Math.min(MOD_MAX_POWER, have.p + pw * 0.5) : pw; desc = have ? `Power ${have.p.toFixed(2)} > ${np.toFixed(2)}: ${M.desc(np)}` : M.desc(pw); }
  return { rarity: rr, tag: have ? 'MODIFIER BOOST' : 'MODIFIER', icon: M.icon, color: M.color, elem: elem || w.def.elem, title: M.name,
    sub: have ? `Boosts ${w.def.name}'s ${M.name}` : `Installs into ${w.def.name} (slot ${w.mods.length + 1}/${MOD_SLOTS})`, desc, modFor: w.def.name,
    apply: () => {
      if (have) have.p = Math.min(MOD_MAX_POWER, have.p + pw * 0.5);
      else w.mods.push({ id, elem, p: pw });
      computeStats(w); achieve('modded');
      if (w.mods.length >= MOD_SLOTS) achieve('fullmods');
    } };
}
function optCurse(c) {
  return { rarity: 4, cursed: true, tag: 'CURSED', icon: '!?', color: '#9d4edd', title: c.name, sub: 'Boon: ' + c.boon, desc: 'Bane: ' + c.bane + '.',
    apply: () => { G.curses[c.id] = true; c.apply(G.P, G); recomputeAll(); achieve('cursed'); sysLine('cursed'); } };
}
function optHeal() { return { rarity: 0, tag: 'SUPPLY', icon: '+', color: '#8ac926', title: 'Field Medkit', sub: 'Instant', desc: 'Restore 50% of max HP.', apply: () => healPlayer(G.P.maxHp * 0.5) }; }
function optRerolls() { return { rarity: 2, tag: 'SUPPLY', icon: 'RR', color: '#ffca3a', title: 'Reroll Tokens', sub: 'Instant', desc: '+2 loot rerolls.', apply: () => { G.rerolls += 2; } }; }
function optOvercharge() { return { rarity: 2, tag: 'SUPPLY', icon: 'OC', color: '#ff924c', title: 'Overcharge Core', sub: 'Permanent', desc: '+5% damage for everything.', apply: () => { G.P.might += 0.05; recomputeAll(); } }; }

// ---------------------------------------------------------------- effects helpers
function spawnPart(x, y, color, n, spd, life, size) {
  for (let i = 0; i < n; i++) {
    if (G.parts.length >= qualParts()) return;
    const a = Math.random() * TAU, v = rand(0.3, 1) * spd;
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life * rand(0.6, 1), max: life, color, size: size || 3 });
  }
}
function floatText(x, y, txt, color, size, life, big) {
  // When full, drop the oldest ordinary text first, so a big hit isn't pushed off by small ones.
  while (G.texts.length >= qualTexts()) { const i = G.texts.findIndex(t => !t.big); G.texts.splice(i < 0 ? 0 : i, 1); }
  G.texts.push({ x: x + rand(-6, 6), y, txt, color, size: size || 13, life: life || 0.7, max: life || 0.7, big: big || 0 });
}
// Damage numbers sized by how the hit compares with your typical hit right now (a running average in log
// terms), coloured by damage type. Small hits don't show; big ones grow; huge ones get the full show,
// but only one huge number at a time (the bigger one wins).
const DMGNUM = { log: null, bigT: -9, bigD: 0, busyT: 0, busyN: 0 };
function dmgNumber(e, d, src, crit) {
  if (!(d > 0)) return;
  const L = Math.log(d);
  DMGNUM.log = DMGNUM.log == null ? L : DMGNUM.log + (L - DMGNUM.log) * 0.015;
  const r = d / Math.exp(DMGNUM.log), now = G.realT;
  if (r < 0.75 && !crit) return; // everyday chip damage stays quiet
  // A small budget for ordinary numbers: about 10 every quarter second, fewer when the screen is busy.
  if (now - DMGNUM.busyT > 0.25) { DMGNUM.busyT = now; DMGNUM.busyN = 0; }
  let tier = r >= 12 ? 3 : r >= 4 ? 2 : 1;
  if (tier >= 2) {
    // Big numbers are rationed: at most two on screen, and a new one inside half a second only shows if it's bigger.
    const live = G.texts.filter(t => t.big && t.life > 0.2);
    if ((now - DMGNUM.bigT < 0.5 || live.length >= 2) && d <= DMGNUM.bigD) tier = 1;
    else {
      DMGNUM.bigT = now; DMGNUM.bigD = d;
      if (live.length >= 2) live[0].life = Math.min(live[0].life, 0.2); // a bigger one bumps the oldest off
    }
  }
  if (now - DMGNUM.bigT > 1.5) DMGNUM.bigD = 0; // the bar resets once the last big one has gone
  if (tier === 1) {
    const cap = (typeof FX === 'undefined' ? 1 : FX.k) * 10;
    if (DMGNUM.busyN >= cap && !(crit && DMGNUM.busyN < cap + 4)) return;
    DMGNUM.busyN++;
  }
  const el = src.elem || (src.w && src.w.def.elem) || 'phys', c = (ELEMENTS[el] || ELEMENTS.phys).color;
  const size = clamp(11 + 6 * Math.log2(Math.max(1, r)), 11, 44) + (crit ? 3 : 0);
  const txt = fmtDmg(d) + (crit ? '!' : '');
  floatText(e.x, e.y - e.r, txt, c, size, tier === 3 ? 1.5 : tier === 2 ? 1.0 : 0.7, tier >= 2 ? tier : 0);
  if (tier === 3) { ring(e.x, e.y, e.r + 40, c, 0.4, 5); cam.shake = Math.min(10, cam.shake + 3); }
}
const fmtDmg = v => v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M' : v >= 1e4 ? Math.round(v / 1e3) + 'k' : Math.round(v) + '';
function banner(text, color) { G.banner = { text, color: color || '#fff', t: 2.4 }; }
function ring(x, y, r, color, life, width) { G.fx.push({ type: 'ring', x, y, r, color, life: life || 0.35, max: life || 0.35, w: width || 3 }); }
// Shaped particles. k: 'spark' (a hot streak along its motion), 'ember' (a rising glow), 'smoke' (a growing
// puff), 'drop' (goo), 'shard' (a spinning splinter), 'bubble' and 'plus' (rise and fade). dir/spread aim them.
// Counts thin out when the screen is busy (FX.k).
function fxParts(k, x, y, color, n, spd, life, size, dir, spread) {
  n = Math.max(1, Math.round(n * (typeof FX !== 'undefined' ? 0.35 + 0.65 * FX.k : 1)));
  for (let i = 0; i < n; i++) {
    if (G.parts.length >= qualParts()) return;
    const a = dir == null ? Math.random() * TAU : dir + rand(-1, 1) * (spread == null ? 0.5 : spread), v = rand(0.35, 1) * spd;
    G.parts.push({ k, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life * rand(0.6, 1), max: life, color, size: size || 3, rot: Math.random() * TAU, vr: rand(-8, 8) });
  }
}
// What a hit looks like in each element.
const HIT_FX = { oxi: ['bubble', '#9ff7ff'], salt: ['drop', '#ffb3c6'], phys: ['spark', '#ffffff'], fire: ['ember', '#ff7a2f'], ice: ['shard', '#bde0fe'], shock: ['spark', '#ffe94a'], poison: ['drop', '#8dff4a'], arcane: ['ember', '#d0a3ff'] };
function hitFx(e, src, crit, d) {
  if ((G.hitFxN = (G.hitFxN || 0) + 1) > 14) return; // a handful a frame is plenty
  const H = HIT_FX[src.elem] || HIT_FX.phys, kx = src.kx != null ? src.kx : e.x - me().x, ky = src.ky != null ? src.ky : e.y - me().y;
  const a = Math.atan2(ky, kx) || 0, n = crit ? 7 : d > e.maxHp * 0.25 ? 5 : 3;
  fxParts(H[0], e.x - Math.cos(a) * e.r * 0.6, e.y - Math.sin(a) * e.r * 0.6, H[1], n, crit ? 300 : 200, crit ? 0.35 : 0.25, H[0] === 'spark' ? 2 : 3, a + Math.PI, 1.1);
  if (crit) G.fx.push({ type: 'star', x: e.x, y: e.y, r: e.r + 14, color: '#ffffff', life: 0.22, max: 0.22, rot: Math.random() });
}
function bolt(x1, y1, x2, y2, color, life) {
  const pts = [x1, y1];
  const n = 7, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  for (let i = 1; i < n; i++) { const t = i / n, o = rand(-1, 1) * Math.min(20, len * 0.12); pts.push(x1 + dx * t + nx * o, y1 + dy * t + ny * o); }
  pts.push(x2, y2);
  // A fork or two off the main channel, like real lightning.
  const forks = [];
  if (len > 60) for (let f = 0; f < (len > 200 ? 2 : 1); f++) {
    const i = 1 + Math.floor(Math.random() * (n - 2)), bx = pts[i * 2], by = pts[i * 2 + 1], fa = Math.atan2(dy, dx) + rand(-1, 1) * 0.9, fl = len * rand(0.15, 0.3);
    forks.push([bx, by, bx + Math.cos(fa) * fl * 0.5 + rand(-6, 6), by + Math.sin(fa) * fl * 0.5 + rand(-6, 6), bx + Math.cos(fa) * fl, by + Math.sin(fa) * fl]);
  }
  G.fx.push({ type: 'bolt', pts, forks, color, life: life || 0.15, max: life || 0.15 });
  if (G.fx.length < 260) fxParts('spark', x2, y2, color, 2, 160, 0.18, 1.6);
}
function after(t, fn) { G.timers.push({ t, fn }); }

// ---------------------------------------------------------------- damage & reactions
function damageEnemy(e, dmg, src) {
  if (e.dead || e.phased || (e.charmed && !src.fromAlly)) return 0;
  if (e.bubT > G.t && !src.dot && bubbleHit(e, src, dmg)) return 0; // Bubble Wand: the bubble takes the hit and pops
  const P = G.P, syn = G.synergy;
  let d = dmg * (src.mult || 1) * G.evm.out; // Glass Womb
  // The Final Five can't be burst down in one go: no single hit takes more than 6% of one.
  if (e.final) d = Math.min(d, e.maxHp * 0.06);
  if (e.boss) d = Math.min(d, e.maxHp * 0.04); // no one-shotting a boss
  // Water bears curl into a 'tun' once when badly hurt: nearly invulnerable for a few seconds.
  if (e.def.tun) {
    if (e.tunT > G.t) d *= 0.08;
    else if (!e.tunUsed && e.hp - d < e.maxHp * 0.3) { e.tunUsed = true; e.tunT = G.t + 2.5; d *= 0.08; floatText(e.x, e.y - e.r - 10, 'TUN!', XR.white, 13); }
  }
  if (src.grudge && e === G.grudge) d *= 3;
  if (G.inCurrent && G.P.flow && (src.w || src.spell)) d *= 1 + 0.3 * G.P.flow; // Go With the Flow
  d *= sigDamageMul(e, src) * toyDamageMul(e) * genesDamageMul(e, src) * comboDamageMul(e, src) * pair2Mul(e, src) * chemMul(e, src) * twistMul(e, src);
  // Stain boons: you can see who matters.
  if (G.dyeBoon.luciferase && (e.elite || e.boss)) d *= 1.25; // (boons only from stains found this run)
  if (G.dyeBoon.motility && e.def.speed >= 95 && !e.boss) d *= 1.3;
  if (G.dyeBoon.rival && e.rival) d *= 1.4;
  if (e.boss || e.bossDef) d *= bossDamageMul(e, src);
  if (src.w && src.w.mods && src.w.mods.length) d *= sillyModMul(e, src); // (silly.js modifiers)
  if (src.w) d *= rrelicDmgMul(e, src) * redDmgMul(); // (rival relics, rrelics.js; Keeping It in the Family, redtail.js)
  if (src.w && src.w.s) {
    const ws = src.w.s;
    if (ws.pExec && e.hp < e.maxHp * 0.35) d *= 1 + ws.pExec;
    if (ws.pGiant && (e.elite || e.boss || e.rival)) d *= 1 + ws.pGiant;
  }
  if (src.parasite) { e.parasiteW = src.w; e.parasiteT = 6; }
  let crit = false;
  // Crit chance over 100% isn't wasted: the overflow adds to crit damage one for one.
  const cc = (src.crit != null ? src.crit : P.crit) + genesCrit(e, src) + (G.clarityT > G.t ? 0.4 : 0); // (Post-Nut Clarity: you see every weak spot)
  if (!src.noCrit && Math.random() < cc) { crit = true; d *= P.critDmg + Math.max(0, cc - 1); }
  if (e.mark > 0) d *= syn.arcane ? 1.5 : 1.3;
  if (e.edited > G.t) d *= geneDamageMul(e); // (edited by the Gene Gun)
  if (e.frozen > 0 && syn.ice) d *= 1.25;
  if (!src.dot) d = Math.max(d * 0.15, d - effArmour(e) * (G.relics.ectoplasm ? 0.5 : 1)); // (Ectoplasm: hits pass half through armour)
  if (e.egg) {
    // Sealed to you until you're big enough (a rival may have opened it early).
    if (G.level < EGG.level) {
      if (!(G.sealT > G.realT)) { G.sealT = G.realT + 1; floatText(e.x, e.y - e.r, 'SEALED: REACH LV ' + EGG.level, '#ffd6e8', 13, 0.8); }
      return 0;
    }
    // The membrane gives way slowly, no matter how big your build: at most 2.5% of it per second.
    const sec = Math.floor(G.t);
    if (e.capT !== sec) { e.capT = sec; e.capUsed = 0; }
    d = Math.min(d, e.maxHp * 0.025 - e.capUsed);
    if (d <= 0) return 0;
    e.capUsed += d;
  }
  const hp0 = e.hp;
  e.hp -= d;
  if (e.boss && !src.dot && !src.zoneHit && (crit || d >= e.maxHp * 0.02) && hitStop(0.035, 0.8)) buzz('bossHit');
  if (!src.dot && !src.zoneHit) {
    e.flash = 0.07;
    // Hit feedback (drawn in real time): a recoil stutter away from the hit and a flash. Big hits and crits kick harder.
    const hx = src.kx != null ? src.kx : e.x - me().x, hy = src.ky != null ? src.ky : e.y - me().y;
    e.hitRT = G.realT; e.hitA = Math.atan2(hy, hx) || 0; e.hitK = crit || d > e.maxHp * 0.2 ? 1.7 : 1;
  } else if (!(G.realT - (e.tickRT || -9) < 0.3)) e.tickRT = G.realT; // ticks get a soft flicker, at most every 0.3s
  const key = src.wname || 'Other';
  G.stats.dmg[key] = (G.stats.dmg[key] || 0) + Math.min(d, Math.max(0, hp0)); // damage actually dealt (overkill isn't counted)
  if (src.w) { const wk = (src.w.friendOf || src.w).uid, W = G.stats.wdmg || (G.stats.wdmg = {}); W[wk] = (W[wk] || 0) + d; } // per weapon, for the Armoury
  // Damage numbers thin out when the screen is busy (crits always show).
  if (!src.dot && !IN_AOE) { hitFx(e, src, crit, d); sfx(crit ? 'crit' : 'hit'); }
  if (!src.dot && e.puddleT > G.t) puddleQuirks(e, src, dmg); // lightning, fire and frost meet a puddle
  if (!src.dot) dmgNumber(e, d, src, crit);
  if (src.shred) e.shred = Math.min(e.armour + 4, e.shred + src.shred);
  if (src.knock && !e.boss && !e.def.spongy && !e.def.heavy) {
    const k = src.knock * (e.def.ai === 'aura' || e.def.hp > 200 ? 0.3 : 1) * (e.chill > 0 ? 1.5 : 1); // (lathered enemies slide further)
    const kx = src.kx != null ? src.kx : e.x - G.player.x, ky = src.ky != null ? src.ky : e.y - G.player.y;
    const l = Math.hypot(kx, ky) || 1;
    e.kx += kx / l * k; e.ky += ky / l * k;
  }
  if (src.freezeHit && !e.boss) { e.frozen = Math.max(e.frozen, 1.2); }
  if (src.w && !src.noProc && !src.dot) { modProcs(e, dmg, src); if (src.w.s) perkProcs(e, dmg, src); sigHit(e, dmg, src); comboHit(e, dmg, src); pair2Hit(e, dmg, src); puHit(e, d, src); }
  if ((src.combo || (src.w && !src.noProc)) && !src.dot) chemComboHit(e, dmg, src); // combo twists (chem.js)
  if (!src.dot) relicHit(e, d, src);
  if (!src.dot && !src.env && (src.w || src.combo || src.elem)) tutElem(src.elem || 'phys'); // (a first-time chemistry card: tutorial.js)
  if (src.elem && src.elem !== 'phys' && !src.noStatus) applyElement(e, src.elem, dmg, src);
  else if ((src.elem || 'phys') === 'phys') chemForce(e, dmg, src); // Force: soap bursts, drunks fall over (chem.js)
  // Charged enemies arc a portion of incoming damage to a neighbour.
  if (e.shock > 0 && !src.noArc && src.elem !== 'shock' && Math.random() < (syn.shock ? 0.5 : 0.25) * (e.pickle > 0 ? 2 : 1)) { // (pickled: conducts twice as well)
    const n = acquire('nearest', 130, e.x, e.y, e);
    if (n) {
      bolt(e.x, e.y, n.x, n.y, ELEMENTS.shock.color, 0.12); damageEnemy(n, dmg * 0.45, { elem: 'shock', noStatus: true, noArc: true, noCrit: true, wname: 'Static arcs' });
      if (!n.boss && !n.dead) { const cx = e.x - n.x, cy = e.y - n.y, cl = Math.hypot(cx, cy) || 1; n.kx += cx / cl * 90; n.ky += cy / cl * 90; } // (static cling)
    }
  }
  if (G.toy) toyHurt(e, Math.min(d, Math.max(0, hp0)), src); // Due Date keeps count; Red Tape shares it
  if (src.elem && src.elem !== 'phys') G.stats.elemDmg = (G.stats.elemDmg || 0) + d; // for the Acid-Burner unlock
  if (src.w) genesHit(e, d, src, crit);
  if (e.hp <= 0 && !e.dead) {
    const excess = -e.hp;
    killEnemy(e, src);
    if (excess >= 1000 && !src.dot) achieve('overkill');
    // Overkill Transfer: the leftover damage jumps to the next victim.
    if (P.overkill > 0 && !src.ok && !src.dot && excess > 1) {
      const n = acquire(src.dir || 'nearest', 260, e.x, e.y, e);
      if (n) overkillJump(e, n, Math.min(excess, e.maxHp) * Math.min(1, P.overkill), Object.assign({}, src, { ok: true, mult: 1, noStatus: true, noCrit: true, wname: 'Overkill transfer' }));
    }
  }
  return d;
}

function react(e, id, src) {
  if (e.reactCd > 0 && !(G.pair.hotcold && id === 'neutral')) return false;
  e.reactCd = 0.35;
  G.stats.reactions++;
  tutReact(id);
  addViewers(8);
  if (G.stats.reactions === 50) achieve('reactions');
  if (G.stats.reactions === 1000) achieve('breakingbad');
  if (!G.stats.reactBy[id] && Object.keys(G.stats.reactBy).length === 9) achieve('chemwar'); // (this one makes ten different)
  G.stats.reactBy[id] = (G.stats.reactBy[id] || 0) + 1;
  const R = REACTIONS[id];
  // Throttle reaction labels so big fights stay readable.
  G.reactLabel = G.reactLabel || {};
  if (!(G.reactLabel[id] > G.realT)) { G.reactLabel[id] = G.realT + 0.6; floatText(e.x, e.y - e.r - 14, R.name, R.color, 14, 0.9); }
  sfx('react');
  // Chain Reaction: now and then the same reaction goes off again in a nearby enemy that carries any chemical.
  if (G.P.chainReact && !G.inChain && src && src.elem && Math.random() < G.P.chainReact) {
    const n = acquireMany('nearest', 180, e.x, e.y, 6).find(o => o !== e && !o.dead && chemCount(o) > 0);
    if (n) { G.inChain = true; n.reactCd = 0; bolt(e.x, e.y, n.x, n.y, R.color, 0.2); try { applyElement(n, src.elem, G.chemDmg || 10, src); } finally { G.inChain = false; } }
  }
  return true;
}

// (applyElement: chem.js)

function aoe(x, y, r, dmg, src, color) {
  IN_AOE = true;
  forNear(x, y, r, e => { damageEnemy(e, dmg, src); });
  IN_AOE = false;
  popAmbient(x, y, r);
  const c = color || '#ffae42', el = src && src.elem;
  // A white-hot flash, the shockwave, flying sparks, then smoke (and embers when it's fire).
  G.fx.push({ type: 'flash', x, y, r: r * 0.9, color: c, life: 0.14, max: 0.14 });
  ring(x, y, r, c, 0.35, 4);
  addLight(x, y, r * 1.8, c, 0.45);
  if (r > 50) addDecal(x, y, r * 0.8, '#000');
  fxParts('spark', x, y, c, Math.min(14, 5 + r / 9), r * 4.5, 0.3, 2.2);
  spawnPart(x, y, c, Math.min(10, 3 + r / 12), r * 2.4, 0.45, 3.5);
  if (r > 45) fxParts('smoke', x, y, '#2e3330', Math.min(5, 2 + r / 40), r * 0.9, 0.9, r * 0.22);
  if (el === 'fire') fxParts('ember', x, y, '#ff9e00', Math.min(8, 3 + r / 15), r * 1.6, 0.8, 3);
  cam.shake = Math.min(8, cam.shake + r / 40);
  sfx('boom');
}

function doChain(x, y, first, dmg, jumps, jumpR, src) {
  let cur = first, px = x, py = y, prev = null;
  const hit = [first];
  for (let k = 0; k <= jumps && cur; k++) {
    const el = src.elem2 && k % 2 ? src.elem2 : src.elem;
    bolt(px, py, cur.x, cur.y, ELEMENTS[el].color, 0.16);
    const wet = G.pair.conductive && cur.wetT > G.t ? 2 : 1;
    damageEnemy(cur, dmg * Math.pow(src.overcharge ? 1.2 : 0.88, k) * wet, Object.assign({}, src, { elem: el }));
    if (G.pair.monitor) chainNearMine(cur.x, cur.y);
    px = cur.x; py = cur.y;
    let next = null, bd = jumpR * jumpR;
    // Short Circuit: the lightning may bounce back to anything but the one it just left.
    forNear(px, py, jumpR, (e, d2) => { if (e !== cur && e !== prev && (src.revisit || !hit.includes(e)) && d2 < bd) { bd = d2; next = e; } });
    if (!next && src.revisit && prev && !prev.dead) next = prev;
    if (next) hit.push(next);
    prev = cur; cur = next;
  }
  return hit;
}

function killEnemy(e, src) {
  if (e.rival) { if (rivalSurvives(e)) return; rivalDown(e); sfx('killBig'); if (hitStop(0.08)) buzz('elite'); return; }
  if (e.egg) { e.dead = true; G.eggE = null; victory(e); return; }
  e.dead = true;
  G.kills++;
  if (e.elite && !e.boss && hitStop(0.05)) buzz('elite');
  sfx(e.elite || e.boss ? 'killBig' : 'kill');
  if (e.def.shape === 'sperm') G.stats.spermKills = (G.stats.spermKills || 0) + 1;
  countKill(e.x, e.y);
  const P = G.P;
  onShowKill(e, src);
  sigKill(e, src);
  foeKill(e, src);
  puKill(e);
  sillyKill(e, src);
  pair2Kill(e, src);
  chemKill(e, src);
  toyKill(e, src);
  genesKill(e, src);
  heatKill(e);
  relicKill(e, src);
  eventKill(e);
  boonKill();
  // Split on Kill mod.
  const shrap = src.w && !src.noSplit && src.w.mods && src.w.mods.find(m => m.id === 'shrapnel');
  if (shrap) {
    // Power: more shards (3 at Common, up to 5) that hit harder (30% up to 50%).
    const ss = Object.assign({}, src, { noSplit: true, mult: 1 }), sp = shrap.p || 1, sk = 0.3 + 0.1 * (sp - 1);
    for (let i = 0, n = 2 + Math.round(sp); i < n; i++) {
      const a = Math.random() * TAU;
      spawnProj(src.w, e.x, e.y, a, ss, { noMods: true, speed: 420, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, life: 0.5, dmg: src.w.s.dmg * sk, pierce: 0, bounce: 0, homing: 0, explode: 0, r: 3, style: 'bullet', chainHit: 0, aura: 0 });
    }
  }
  // Chain Reaction perk: the corpse goes off.
  if (src.w && src.w.s && src.w.s.pBurst && !src.burst) {
    const bs = Object.assign({}, src, { burst: true, noProc: true, noCrit: true, mult: 1, wname: 'Chain reaction' });
    aoe(e.x, e.y, 60 + e.r, Math.max(src.w.s.dmg, e.maxHp * 0.3) * src.w.s.pBurst, bs, '#ff5a36');
  }
  // Parasite Seeder: infected corpses become turrets.
  // Petri Dish pairing: anything that dies in a puddle was infected all along.
  if (!(e.parasiteT > 0) && G.pair.petri && e.puddleT > G.t) { e.parasiteW = owned('parasite'); e.parasiteT = 1; }
  if (e.parasiteT > 0 && e.parasiteW && G.weapons.includes(e.parasiteW) && !wormCorpse(e, e.parasiteW) && G.turrets.length < 24) {
    const pw = e.parasiteW;
    const tu = { x: e.x, y: e.y, life: pw.s.dur || 8, max: pw.s.dur || 8, cd: 0.3, rate: 0.35, dmg: pw.s.dmg * 1.2, range: 320, w: pw,
      src: { elem: 'poison', wname: 'Tapeworm turrets', crit: G.P.crit }, face: 0, color: '#b5e48c' };
    wormTurret(tu, pw);
    G.turrets.push(tu);
    achieve('parasite');
  }
  // Mimic Core learns attack patterns from dead shooters.
  const pat = e.boss ? e.def.patterns[e.pat] : e.def.shoot && e.def.shoot.pattern;
  if (pat && ['aimed', 'ring', 'spiral', 'snipe', 'aimedFan', 'doubleSpiral', 'flower'].includes(pat) && pat !== G.mimicPat) {
    G.mimicPat = pat;
    if (G.weapons.some(w => w && w.def.kind === 'mimic')) floatText(me().x, me().y - 40, 'COPIED: ' + pat.toUpperCase(), '#f15bb5', 14, 1.2);
  }
  // The pop: goo flies, a little flash, and elites and bosses go out with a shockwave.
  spawnPart(e.x, e.y, e.def.color || e.color, e.boss ? 24 : 3, e.boss ? 260 : 130, 0.5, e.boss ? 5 : 3);
  fxParts('drop', e.x, e.y, e.def.color || e.color, e.boss ? 24 : e.elite ? 10 : 5, e.boss ? 320 : 170, 0.55, e.boss ? 6 : 3.5);
  if (e.elite || e.boss) { G.fx.push({ type: 'flash', x: e.x, y: e.y, r: e.r * 2.5, color: '#ffffff', life: 0.18, max: 0.18 }); ring(e.x, e.y, e.r * 3, '#ffffff', 0.4, 5); }
  // XP
  if (e.xp > 0) dropGem(e.x, e.y, e.xp);
  if (e.stolen > 0) for (let i = 0; i < 5; i++) dropGem(e.x + rand(-25, 25), e.y + rand(-25, 25), e.stolen * 1.3 / 5); // a rotifer gives back what it hoovered up, with interest
  if (ownsScrapWeapon() && Math.random() < (e.boss || e.elite ? 1 : 0.5)) dropScrap(e.x, e.y, e.boss ? 60 : e.elite ? 14 : 2 + (Math.random() < 0.25 ? 3 : 0));
  gainChrono(e.boss ? CHRONO.energyPerCharge : e.elite ? 25 : 1);
  if (e.boss) { G.chrono.charges = Math.min(G.chrono.max, G.chrono.charges + 1); }
  addDecal(e.x, e.y, e.r * (e.boss ? 2.2 : 1.4), e.def.color || e.color);
  if (P.lifesteal > 0 && G.lsBudget > 0) { const h = Math.min(P.lifesteal, G.lsBudget); G.lsBudget -= h; healPlayer(h, true); }
  if (e.def.split) {
    for (let i = 0; i < (e.def.splitN || 2) && G.enemies.length < CAPS.enemies; i++) {
      const s = makeEnemy(ENEMIES[e.def.split], e.x + rand(-12, 12), e.y + rand(-12, 12));
      G.enemies.push(s);
    }
  }
  if (e.def.ai === 'bomber') bomberBlast(e);
  if (e.def.spongy && e.r > 140) achieve('bigamoeba');
  if (e.boss) {
    // A boss stays dead even if you rewind past its death (no farming the same boss for relics).
    bossDown(e);
  } else if (e.elite || (e.def.spongy && e.r > 100)) {
    // Loot boxes are special: most elites drop a Glucose Hit or Magnet instead.
    G.pickups.push(makePickup((e.def.spongy && e.r > 100) || Math.random() < 0.85 ? chestOr('heal') : pick(['heal', 'magnet', 'rage'].concat(PU_NEW)), e.x, e.y, { t: e.def.spongy ? 'amoeba' : 'elite', name: e.name.replace(' (elite)', ''), meals: e.meals || 0 }));
  } else if (Math.random() < 0.0055 * (1 + P.luck) * (G.mut && G.mut.heavymetal ? 2 : 1)) { // (half as many power-ups as before, each about 1.5x as strong)
    const types = ['magnet', 'nuke', 'rage', 'heal', 'shield', 'freeze', 'heal', 'magnet'].concat(PU_NEW, PU_NEW);
    G.pickups.push(makePickup(Math.random() < 0.5 ? chestOr(pick(types)) : pick(types), e.x, e.y, { t: 'drop', name: e.name }));
  }
}
// Loot boxes from kills are rationed: at most one every LOOT_GAP seconds (bosses and rivals don't count).
const LOOT_GAP = 45; // with boss, rival and achievement boxes: about 25 extra boxes on a run
function chestOr(alt) {
  if (G.t < (G.nextChest || 45)) return alt;
  G.nextChest = G.t + LOOT_GAP;
  return 'chest';
}

function bomberBlast(e) {
  const r = 60, dmg = e.dmg;
  ring(e.x, e.y, r, '#ff2e2e', 0.35, 5);
  spawnPart(e.x, e.y, '#ff5a36', 14, 220, 0.45, 4);
  forNear(e.x, e.y, r, o => { if (o !== e) damageEnemy(o, dmg * 2, { elem: 'fire', noCrit: true, wname: 'Bomber friendly fire', friendly: true }); });
  const p = me();
  if (Math.hypot(p.x - e.x, p.y - e.y) < r + p.r) hurtPlayer(dmg, 'Bomber blast', null, 'blast');
}

// kind: 'x' = experience gem, 's' = scrap (tower currency).
// (as #rrggbb, because glows add their own alpha digits)
function hslHex(h, s, l) {
  const f = n => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l), c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
}
// Each power-up kind has its own colour on the slide: hues spread evenly round the wheel.
const PU_COL = {};
function puColour(type, dark) {
  if (!PU_COL[type]) { const ks = Object.keys(POWERUPS).filter(k => k !== 'chest'), i = Math.max(0, ks.indexOf(type)), h = i / ks.length * 360; PU_COL[type] = [hslHex(h, 0.85, 0.6), hslHex(h, 0.7, 0.28)]; }
  return PU_COL[type][dark ? 1 : 0];
}
// Twice a second: granules lying close together merge into one bigger one (fewer things on screen).
function gemMerge() {
  if (G.gemMergeT > G.t || G.gems.length < 40) return;
  G.gemMergeT = G.t + 0.5;
  const cell = new Map();
  for (const g of G.gems) {
    if (g.dead || g.mag || g.kind !== 'x') continue;
    const k = Math.floor(g.x / 44) * 100003 + Math.floor(g.y / 44), h = cell.get(k);
    if (h) { h.v += g.v; g.dead = true; } else cell.set(k, g);
  }
  compactArr(G.gems, g => !g.dead);
}
function dropGem(x, y, v, kind) {
  kind = kind || 'x';
  if (kind === 'x') G.stats.xpDrop = (G.stats.xpDrop || 0) + v;
  if (G.gems.length >= CAPS.gems) {
    // Merge into a random existing gem of the same kind to keep counts bounded.
    for (let k = 0; k < 8; k++) { const g = G.gems[Math.floor(Math.random() * G.gems.length)]; if (g.kind === kind) { g.v += v; return; } }
  }
  G.gems.push({ x: x + rand(-5, 5), y: y + rand(-5, 5), v, kind, mag: false, vx: 0, vy: 0 });
}
// src: where a box came from ({ t: 'elite' | 'amoeba' | 'drop' | 'rival' | 'sponsor', name }), for the loot screen's story line.
function makePickup(type, x, y, src) { return unstick({ type, x, y, life: 25, bob: Math.random() * TAU, src }, 14); }

// Worn armour grows back: half a point a second, after 2.5s without a hit (a bit faster with more armour to mend).
function armourRegen(dt) {
  if (!(G.armourLost > 0) || G.t - (G.armourHitT || 0) < 2.5) return;
  G.armourLost = Math.max(0, G.armourLost - dt * (0.5 + G.P.armour * 0.03));
}
function healPlayer(n, silent) {
  const p = me(), P = G.P;
  const before = p.hp;
  p.hp = Math.min(P.maxHp, p.hp + n * P.healMult);
  if (!silent && p.hp - before >= 1) floatText(p.x, p.y - 24, '+' + Math.round(p.hp - before), '#8ac926', 15);
}

// Burn and poison keep the name of whatever applied the strongest dose, so the run log can credit the weapon.
const dotName = src => typeof src === 'string' ? src : (src && src.wname) || '?';
function setBurn(e, dps, src) { if (!(dps < (e.burnDps || 0))) e.burnBy = dotName(src); e.burnDps = Math.max(e.burnDps || 0, dps); }
function setPoison(e, dps, src) { if (!(dps < (e.poisonDps || 0))) e.poisonBy = dotName(src); e.poisonDps = Math.max(e.poisonDps || 0, dps); }

// kind: 'bullets', 'contact', 'blast' or 'other' (beams, hazards), for the run log.
function hurtPlayer(dmg, from, ent, kind) {
  const p = me(), P = G.P;
  if (G.state !== 'play' || p.iframes > 0 || G.shieldT > 0 || (G.debug && G.debug.god)) return;
  if (Math.random() < Math.min(DODGE_CAP, P.dodge + (G.pbDodge ? 0.1 : 0))) { floatText(p.x, p.y - 24, 'DODGE', '#9ef0ff', 14); p.iframes = 0.25; relicDodge(); return; }
  if (toyBlock()) return; // Bubble Boy
  if (ent && ent.weakT > G.t) dmg *= 0.6; // Nausea
  dmg *= G.evm.in * tankDamageIn() * (G.slip ? 0.75 : 1) * puHurt() * (P.takenMul || 1);
  dmg = relicDamageIn(dmg, ent);
  if (dmg <= 0) return;
  // No one-shots from a boss: a single boss hit (body, beam or bullet) takes at most 22% of your max HP.
  // The cap has a fixed part (22% of a 120 HP swimmer, growing with the clock) and a part from your own max HP,
  // so more max HP still means more boss hits to go down (it used to be 22% of yours, so HP made no difference).
  if (ent && (ent.boss || ent.bossDef) && !ent.egg) dmg = Math.min(dmg, P.maxHp * 0.15 + 120 * 0.07 * defClock());
  // Armour is flat but scales with the enemy damage clock (1 armour blocks about 1 point of a minute-0 hit, about 7 at minute 10), and never blocks more than 75% of a hit.
  // Your armour wears down: every hit that lands knocks a point off (two from a boss), and it grows back slowly once
  // you stop getting hit (armourRegen). Temporary plating (Bear Hug, Fortress) does not wear.
  const armBase = Math.max(0, P.armour - (G.armourLost || 0));
  const arm = P.noArmour ? 0 : (armBase + (G.hugArm || 0) + (G.fortArm || 0) + genesArmour()) * defClock();
  const d = Math.max(1, dmg * 0.25, dmg - arm); // Bear Hug, Fortress and Clingy Cell Velcro add armour
  if (!P.noArmour && P.armour > 0) { G.armFlash = { t: G.realT, k: Math.min(1, armBase / 20) }; G.armourLost = Math.min(P.armour, (G.armourLost || 0) + (ent && (ent.boss || ent.bossDef) ? 2 : 1)); G.armourHitT = G.t; } // (the forcefield flashes: armourRing)
  if (sillyInsure(d) || rrelicSave(d)) return; // (Life Insurance; Not Today, Undead Membership)
  p.hp -= d;
  sillyHurt(); redHurt(); // (Trash Talk; the Redtail's Sister-Cousin)
  if (ent && !ent.dead) G.grudge = ent;
  G.lastHitEnt = ent || null;
  rebornHurt(d); // (Karma)
  rivalLeech(ent); // (rivals with the leech trait) // (the end-of-run screen shows whoever finished you off)
  if (p.hp > 0 && p.hp < P.maxHp * 0.05) achieve('lowhp');
  const k = from || 'Unknown';
  G.stats.hurt[k] = (G.stats.hurt[k] || 0) + d;
  const hk = G.stats.hurtKind; hk[kind || 'other'] = (hk[kind || 'other'] || 0) + d;
  G.stats.lastHit = k;
  p.iframes = 0.7; p.flash = 0.2;
  cam.shake = Math.min(10, cam.shake + 5);
  floatText(p.x, p.y - 24, '-' + Math.round(d), '#ff4d6d', 15);
  sfx('hurt');
  if (d > P.maxHp * 0.15) { hitStop(0.07, 0.4); buzz('bigHurt'); } else buzz('hurt');
  acidReflux();
  relicHurt(d, ent);
  thornsHit(ent);
  sigHurt();
  toyPlayerHurt();
  genesHurt(d);
  boonHurt();
  if (p.hp <= 0) { p.hp = 0; if (!genesLethal() && !boonSave() && !startRewind(true)) gameOver(); }
}

// ---------------------------------------------------------------- enemies
// Fewer, stronger enemies. Strength ramps from "chunky" at the start to "brutal" by 15 minutes.
function enemyScale(t) {
  const k = Math.min(1, t / 900);
  return { hp: 0.72 + 1.04 * k, dmg: 0.62 + 1.13 * Math.pow(k, 1.5), xp: 0.88, r: 1.12, speed: 1 + 0.12 * k };
}
function makeEnemy(def, x, y, opts) {
  const t = PT(), hm = hpNow(), dm = dmgNow();
  const e = {
    id: uidSeq++, def, name: def.name, x, y, vx: 0, vy: 0, kx: 0, ky: 0,
    hp: def.hp * hm, maxHp: def.hp * hm, armour: def.armour, r: def.r, speed: def.speed * (1 + Math.min(0.6, t / 2000)),
    dmg: def.dmg * dm, xp: def.xp, color: def.color, elite: false, boss: false, dead: false, flash: 0, hitT: {},
    burn: 0, burnDps: 0, chill: 0, chillAmt: 0, frozen: 0, shock: 0, poison: 0, poisonStacks: 0, poisonDps: 0, mark: 0, shred: 0,
    reactCd: 0, auraArm: 0, crowd: 0, shootCd: rand(0.5, 2), st: 0, stT: rand(1, 3), side: Math.random() < 0.5 ? 1 : -1, spin: Math.random() * TAU,
    phased: false, age: 0, dashX: 0, dashY: 0,
  };
  // Fewer, stronger enemies: every monster is a bigger, tougher, more rewarding threat.
  if (!def.patterns) { const K = enemyScale(t); const tk = toughK(t); e.hp *= K.hp * tk; e.maxHp *= K.hp * tk; e.dmg *= K.dmg; e.xp *= K.xp * XP_K; e.r *= K.r; e.speed *= K.speed; }
  if (opts && opts.elite) {
    e.elite = true; e.hp *= 5; e.maxHp *= 5; e.r *= 1.35; e.armour += 2; e.dmg *= 1.4; e.xp *= 6;
  }
  e.armK = Math.min(3, Math.pow(hpMul(t), 0.3)); // armour keeps pace a little (x1 at the start, about x2.8 by minute 9)
  heatEnemy(e); // Immune Response
  return e;
}

function spawnPos() {
  if (G.lvl) return lvSpawnPos();
  const a = Math.random() * TAU;
  const vw = W / 2 / S0, vh = H / 2 / S0;
  const d = Math.hypot(vw, vh) + rand(30, 90);
  return { x: G.player.x + Math.cos(a) * d, y: G.player.y + Math.sin(a) * d, a };
}

// Spotlight: the first time you ever meet an enemy type (the same moment as its introduction card, intro.js),
// it gets the stage for about 17 seconds. It arrives as a pack, 90% of new spawns are more of it in small
// groups, the rest of the crowd near you backs off, and scripted waves wait, so you get a feel for it.
// One at a time (others queue). Types you have already met just join the run as normal.
const SPOT = { until: 300, len: 25, share: 0.9, back: 420 };
function spotTick() {
  if (G.lvl) return;
  const t = PT(), S2 = G.spot || (G.spot = { q: [], done: {}, cur: null, end: 0 });
  if (t > SPOT.until + 30) { S2.cur = null; return; }
  for (const id in ENEMIES) { const d = ENEMIES[id]; if (d.w > 0 && d.from > 10 && d.from <= SPOT.until && d.from <= t && !S2.done[id]) { S2.done[id] = 1; if (typeof seenFoe !== 'function' || !seenFoe(id)) S2.q.push(id); } }
  if (S2.cur && t < S2.end) {
    // Keep it in view: fewer than 5 of them near you and another group swims in (every 1.5s at most).
    if (!(S2.refT > t)) {
      S2.refT = t + 1.5;
      let near = 0; const p = G.player;
      for (const e of G.enemies) if (e.def === S2.cur && !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 700) near++;
      if (near < (S2.cur.pack ? S2.cur.pack * 4 : 5)) { const q = spawnPos(); for (let i = 0; i < (S2.cur.pack || 3) && G.enemies.length < CAPS.enemies; i++) G.enemies.push(makeEnemy(S2.cur, q.x + rand(-40, 40), q.y + rand(-40, 40))); }
    }
    return;
  }
  S2.cur = null;
  const id = S2.q.shift();
  if (!id) return;
  S2.cur = ENEMIES[id]; S2.end = t + SPOT.len;
  // It arrives as a pack, together, from one side (smaller packs of the big ones).
  const d = S2.cur, n = d.pack || Math.max(2, Math.min(8, Math.round(10 - d.hp / 15))), p = spawnPos();
  for (let i = 0; i < n && G.enemies.length < CAPS.enemies; i++) G.enemies.push(makeEnemy(d, p.x + rand(-50, 50), p.y + rand(-50, 50)));
}
const spotOn = () => !!(G.spot && G.spot.cur && PT() < G.spot.end);
function spawnRandom() {
  const t = PT();
  const pool = [];
  let tot = 0;
  // Shooters become more common as the storm builds.
  // Shooters stay as common as they were before the swarms got denser: the extra bodies are melee and swarmers.
  const wOf = d => d.w * (d.shoot ? 0.4 * (1 + t / 300) : 1);
  for (const id in ENEMIES) { const d = ENEMIES[id]; if (d.w > 0 && d.from <= t) { pool.push(d); tot += wOf(d); } }
  let x = Math.random() * tot, def = pool[0];
  for (const d of pool) { x -= wOf(d); if (x <= 0) { def = d; break; } }
  const spot = spotOn() && Math.random() < SPOT.share;
  if (spot) def = G.spot.cur; // the newcomer's turn
  const p = spawnPos();
  const n0 = Math.ceil((def.group || 1) * 0.8), n = Math.max(n0, spot && def.hp < 100 && !def.pack ? 3 : 1); // (a bunch of them, unless they're big)
  if (n > n0) G.spawnAcc = (G.spawnAcc || 0) - (n - n0); // ...charged to the spawn budget, so the slide is no busier than usual
  const eliteChance = Math.min(0.24, (0.01 + t / 3000) * heatElite());
  for (let i = 0; i < n; i++) {
    if (G.enemies.length >= CAPS.enemies) return;
    G.enemies.push(makeEnemy(def, p.x + rand(-30, 30), p.y + rand(-30, 30), { elite: n === 1 && t > 45 && Math.random() < eliteChance }));
  }
}

function waveEvent() {
  const t = PT(), p = G.player;
  const kind = pick(t < 120 ? ['ring', 'swarm', 'krill'] : t < 200 ? ['ring', 'swarm', 'elite', 'barrage', 'krill'] : ['ring', 'swarm', 'elite', 'barrage', 'pond']);
  if (kind === 'ring') {
    const n = Math.min(18, 8 + Math.floor(t / 40)), d = Math.hypot(W / S0, H / S0) / 2 + 40;
    const def = t > 150 ? ENEMIES.skitter : ENEMIES.crawler;
    for (let i = 0; i < n; i++) { const a = i / n * TAU; G.enemies.push(makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d)); }
    banner('ENCIRCLEMENT', '#ff4d6d');
  } else if (kind === 'swarm') {
    for (let k = 0; k < 2; k++) { const s = spawnPos(); for (let i = 0; i < 6; i++) G.enemies.push(makeEnemy(ENEMIES.wisp, s.x + rand(-40, 40), s.y + rand(-40, 40))); }
    banner('SWARM INCOMING', '#fee440');
  } else if (kind === 'krill') {
    for (let k = 0; k < 3; k++) { const s = spawnPos(); for (let i = 0; i < 10; i++) G.enemies.push(makeEnemy(ENEMIES.krill, s.x + rand(-45, 45), s.y + rand(-45, 45))); }
    banner('KRILL SHOAL', '#fee440');
  } else if (kind === 'pond') {
    const s = spawnPos();
    G.enemies.push(makeEnemy(ENEMIES.volvox, s.x, s.y));
    for (let i = 0; i < 5; i++) { const q = spawnPos(); G.enemies.push(makeEnemy(ENEMIES.paramecium, q.x, q.y)); }
    for (let i = 0; i < 2; i++) { const q = spawnPos(); G.enemies.push(makeEnemy(ENEMIES.rotifer, q.x, q.y)); }
    banner('POND LIFE', '#fee440');
  } else if (kind === 'elite') {
    for (let k = 0; k < 2; k++) { const s = spawnPos(); G.enemies.push(makeEnemy(pick([ENEMIES.brute, ENEMIES.charger, ENEMIES.warlock, ENEMIES.bulwark]), s.x, s.y, { elite: true })); }
    banner('ELITES APPROACH', '#ffd23f');
  } else {
    for (let k = 0; k < 3; k++) { const s = spawnPos(); G.enemies.push(makeEnemy(ENEMIES.spitter, s.x, s.y)); }
    banner('BULLET STORM', '#e056fd');
  }
}

let shooterName = '', shooterEnt = null;
// Fewer, heavier bullets: every volley keeps 3 of each 5 shots (evenly, so patterns keep their shape),
// and each one that flies hits 1.7x as hard.
const BUL = { keep: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1], dmg: 1.7, size: 1 }; // 9 of every 10 shots fly (was 3 of 5) // small and dense, like real specks
function eBullet(x, y, a, speed, dmg, r, color) {
  if (G.ebul.length >= CAPS.ebul || (G.toy && tapeGagged(shooterEnt))) return;
  G.bulSeq = ((G.bulSeq || 0) + 1) % BUL.keep.length;
  if (!BUL.keep[G.bulSeq]) return;
  dmg *= BUL.dmg * (shooterEnt && shooterEnt.weakT > G.t ? 0.6 : 1); r = (r || 5) * BUL.size;
  speed *= (1 + Math.min(0.7, PT() / 1500)) * G.P.bulletSpeed * G.evm.bulspd * heatBullet();
  G.ebul.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, dmg, r: r || 5, color: PAL.danger, life: 7, from: (shooterName || 'Enemy') + ' bullets', owner: shooterEnt });
  // A boss opening fire flares up.
  if (shooterEnt && shooterEnt.boss && !shooterEnt.egg && !(shooterEnt.fireFxT > G.realT)) { shooterEnt.fireFxT = G.realT + 0.15; G.fx.push({ type: 'flash', x: shooterEnt.x, y: shooterEnt.y, r: shooterEnt.r * 1.8, color: shooterEnt.bphase ? '#ff3b3b' : shooterEnt.def.color, life: 0.15, max: 0.15 }); }
}

function shootPattern(e, pat, a0) {
  if (e.soapT > G.t && !e.boss) return; // soaped up (Bubble Bath): can't shoot
  const p = G.player, sh = e.def.shoot || {};
  const aim = ((G.toy || G.decoy) && toyAim(e)) ?? Math.atan2(p.y - e.y, p.x - e.x);
  const dm = dmgNow(), bd = (sh.dmg || e.def.dmg * 0.4 || 8) * dm;
  switch (pat) {
    case 'aimed': {
      // Antibodies fan out as the run goes on, but a fan's bullets are lighter (late fans were the top killer).
      // (v7.65: 3 then 2 bullets instead of 4 then 3, still the top source of damage taken in most runs.)
      const n = PT() > 600 ? 3 : PT() > 300 ? 2 : 1, fk = n > 2 ? 0.7 : n > 1 ? 0.8 : 1;
      for (let i = 0; i < n; i++) eBullet(e.x, e.y, aim + (i - (n - 1) / 2) * 0.22, sh.speed || 170, bd * fk, 5, '#ff5df2');
      break;
    }
    case 'ring': { const n = sh.count || 8, off = Math.random() * TAU; for (let i = 0; i < n; i++) eBullet(e.x, e.y, off + i / n * TAU, sh.speed || 140, bd, 5, '#b388ff'); break; }
    case 'spiral': e.spin += 0.37; for (let k = 0; k < 2; k++) eBullet(e.x, e.y, e.spin + k * Math.PI, sh.speed || 125, bd, 4.5, '#ff006e'); break;
    case 'snipe': eBullet(e.x, e.y, a0 != null ? a0 : aim, sh.speed || 430, bd, 4, '#ffffff'); break;
  }
}

function updateEnemies(dt) {
  const p = G.player, syn = G.synergy;
  const warpF = G.warp > 0 ? 0.3 : 1;
  const edt = dt * warpF;
  for (const e of G.enemies) {
    if (e.dead) continue;
    shooterName = e.name; shooterEnt = e;
    e.age += dt;
    // Status effects.
    if (e.flash > 0) e.flash -= dt;
    if (e.reactCd > 0) e.reactCd -= dt;
    if (e.auraArm > 0) e.auraArm -= dt;
    if (e.shred > 0) e.shred = Math.max(0, e.shred - dt * 0.4);
    if (e.mark > 0) e.mark -= dt;
    if (e.shock > 0) e.shock -= dt;
    if (e.frozen > 0) e.frozen -= dt;
    if (e.chill > 0) { e.chill -= dt; if (e.chill <= 0) e.chillAmt = 0; }
    chemTick(e, dt); // corrosion eats armour; batteries zap (chem.js)
    if (e.burn > 0) {
      e.burn -= dt;
      damageEnemy(e, e.burnDps * dt, { dot: true, noCrit: true, noStatus: true, noArc: true, wname: (e.burnBy || '?') + ' (corrosion)' });
      if (Math.random() < dt * 6) fxParts('ember', e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r) * 0.5, '#ff7a2f', 1, 25, 0.6, 2.5, -Math.PI / 2, 0.6);
      if (e.dead) continue;
    }
    if (e.poison > 0) {
      e.poison -= dt;
      damageEnemy(e, e.poisonDps * e.poisonStacks * (syn.poison ? 2 : 1) * dt, { dot: true, noCrit: true, noStatus: true, noArc: true, wname: (e.poisonBy || '?') + ' (ethanol)' });
      if (Math.random() < dt * 3) fxParts('bubble', e.x + rand(-e.r, e.r) * 0.6, e.y, '#8dff4a', 1, 18, 0.9, 2.5, -Math.PI / 2, 0.4);
      if (e.poison <= 0) e.poisonStacks = 0;
      if (e.dead) continue;
    }
    if ((e.bubT || e.thrownT > G.t) && toyHold(e, dt)) continue; // in a bubble, or flung
    if (e.egg) { eggAI(e, edt); continue; }
    if (e.rival) { rivalAI(e, edt); continue; }
    if (e.charmed) {
      e.charmT -= dt;
      if (e.charmT <= 0) { if (e.zombie) { e.dead = true; spawnPart(e.x, e.y, '#b5e48c', 8, 80, 0.5); continue; } e.charmed = false; ring(e.x, e.y, e.r + 10, PAL.you, 0.3); }
      else { allyAI(e, dt); continue; }
    }
    const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy) || 1;
    let ux = dx / dist, uy = dy / dist;
    if (G.lvl) { const c = lvChase(e, ux, uy, dist); if (c) { ux = c.x; uy = c.y; } } // (round the walls of a level)
    let mx = ux, my = uy, spd = e.speed;
    const frozen = e.frozen > 0 || e.dazeT > G.t; // (dazed out of a popped bubble: stopped, like frozen)
    const slow = frozen ? 0 : (G.lvl ? lvSlow(e.x, e.y) : 1) * (1 - e.chillAmt) * (e.stasisT > G.realT ? 0.35 : 1) * (e.guiltT > G.t ? 0.6 : 1) * (e.dazeSlowT > G.t ? 0.5 : 1) * (e.soapT > G.t ? 0.5 : 1) * (e.formT > G.t ? (e.boss ? 0.75 : 0.4) : 1) * (e.pickle > 0 ? 0.85 : 1); // dazed or soaped (Bubble Wand)
    if (e.boss) {
      bossAI(e, edt, dist, ux, uy);
      mx = e.mvx; my = e.mvy; spd = e.mvs;
    } else if (e.orbitBoss && orbitNurse(e, edt)) {
      mx = 0; my = 0;
    } else if (!frozen) {
      switch (e.def.ai) {
        case 'yeast': {
          // Buds grow to full size over 3 s; every 5 to 7 s each cell buds again (the colony is capped).
          if (e.grow < 1) { e.grow = Math.min(1, e.grow + edt / 3); e.r = e.baseR * (0.4 + 0.6 * e.grow); }
          e.budT = (e.budT == null ? rand(4, 6) : e.budT) - edt;
          if (e.budT <= 0 && e.grow >= 1 && (G.yeastN || 0) < YEAST.cap && G.enemies.length < CAPS.enemies) {
            e.budT = rand(6, 8);
            const a = Math.random() * TAU, c = makeEnemy(ENEMIES.yeast, e.x + Math.cos(a) * e.r * 1.7, e.y + Math.sin(a) * e.r * 1.7);
            c.baseR = c.r; c.grow = 0; c.r = c.baseR * 0.4; c.parent = e; G.enemies.push(c); G.yeastN = (G.yeastN || 0) + 1;
          }
          spd = e.speed;
          break;
        }
        case 'ciliate': {
          // Swims in long straight lines, turning slowly towards you; after a bump (or every few seconds)
          // it backs up and swings off in a new direction, like a real paramecium's avoiding reaction.
          if (e.hd == null) { e.hd = Math.atan2(uy, ux); e.stT = rand(2, 4); }
          e.stT -= edt;
          if (e.backT > 0) { e.backT -= edt; mx = -Math.cos(e.hd) * 0.6; my = -Math.sin(e.hd) * 0.6; break; }
          if (e.stT <= 0 || dist < p.r + e.r + 4) { e.backT = 0.45; e.stT = rand(2.5, 4.5); e.hd += rand(-1.6, 1.6); break; }
          let da = Math.atan2(uy, ux) - e.hd; da = Math.atan2(Math.sin(da), Math.cos(da));
          e.hd += clamp(da, -1.1 * edt, 1.1 * edt);
          mx = Math.cos(e.hd); my = Math.sin(e.hd);
          break;
        }
        case 'thief': {
          // Rotifer: its wheel organ sucks in XP granules nearby; it heads for the richest ones first.
          let best = null, bd = 380;
          for (const g of G.gems) { if (g.dead || g.mag || g.kind === 's') continue; const gd = Math.hypot(g.x - e.x, g.y - e.y); if (gd < bd) { bd = gd; best = g; } }
          if (best) { const gx = best.x - e.x, gy = best.y - e.y, gl = Math.hypot(gx, gy) || 1; mx = gx / gl; my = gy / gl; }
          for (const g of G.gems) {
            if (g.dead || g.mag || g.kind === 's') continue;
            const gx = e.x - g.x, gy = e.y - g.y, gd = Math.hypot(gx, gy);
            if (gd < 150) { g.x += gx / (gd || 1) * 160 * edt; g.y += gy / (gd || 1) * 160 * edt; }
            if (gd < e.r) { g.dead = true; e.stolen = (e.stolen || 0) + g.v; }
          }
          break;
        }
        case 'krill': {
          // Flick-swimming: a sharp kick, a glide, a new heading off to one side, repeat.
          const ph = e.age * 5 + e.id, k = Math.max(0, Math.sin(ph)), w = Math.sin(Math.floor(ph / TAU) * 12.9898 + e.id) * 0.7;
          spd = e.speed * (0.25 + 1.7 * k * k); e.flick = k;
          mx = ux * Math.cos(w) - uy * Math.sin(w); my = uy * Math.cos(w) + ux * Math.sin(w);
          break;
        }
        case 'ranged': {
          if (dist > 280) { mx = ux; my = uy; }
          else if (dist < 190) { mx = -ux; my = -uy; }
          else { mx = -uy * e.side; my = ux * e.side; }
          e.shootCd -= edt;
          const sh = e.def.shoot;
          if (sh.pattern === 'snipe') {
            if (e.aimT > 0) { e.aimT -= edt; spd = 0; if (e.aimT <= 0) { shootPattern(e, 'snipe', e.aimA); e.shootCd = sh.cd; } }
            else if (e.shootCd <= 0 && dist < 560) { e.aimT = 0.8; e.aimA = Math.atan2(dy, dx); }
          } else if (e.shootCd <= 0 && dist < 520) { shootPattern(e, sh.pattern); e.shootCd = sh.cd * rand(0.85, 1.15) / fireMul(PT()) / G.evm.fire; }
          break;
        }
        case 'turret':
          e.shootCd -= edt;
          if (e.shootCd <= 0 && dist < 560) { shootPattern(e, 'spiral'); e.shootCd = e.def.shoot.cd / G.evm.fire; }
          break;
        case 'engulf': { const m = engulfAI(e, edt, dist, ux, uy); mx = m.x; my = m.y; spd = e.speed; break; }
        case 'flee': {
          // The Golden Swimmer: runs from you, weaving, and never quite leaves the screen.
          const wv = Math.sin(e.age * 2.3 + e.id) * 0.7;
          mx = -ux * Math.cos(wv) + uy * Math.sin(wv); my = -uy * Math.cos(wv) - ux * Math.sin(wv);
          if (dist > 300) { mx = -mx * 0.3; my = -my * 0.3; }
          if (Math.random() < edt * 8) spawnPart(e.x, e.y, '#ffd23f', 1, 30, 0.5, 2);
          break;
        }
        case 'bomber':
          if (dist < e.r + p.r + 10) { e.hp = 0; killEnemy(e, {}); continue; }
          break;
        case 'blink':
          e.stT -= edt;
          if (e.stT <= 0 && dist > 130) {
            spawnPart(e.x, e.y, e.color, 8, 120, 0.3);
            const a = Math.random() * TAU, r = rand(110, 170);
            e.x = p.x + Math.cos(a) * r; e.y = p.y + Math.sin(a) * r; e.stT = rand(3, 4.5);
            ring(e.x, e.y, 26, e.color, 0.3);
          }
          break;
        case 'medic':
          e.stT -= edt;
          if (e.stT <= 0) {
            e.stT = 3;
            forNear(e.x, e.y, 130, o => { if (o !== e && !o.boss) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.12); } });
            ring(e.x, e.y, 130, '#7bed9f', 0.5, 2);
          }
          if (dist < 220) { mx = -ux; my = -uy; spd *= 0.7; }
          break;
        case 'charge':
          if (e.st === 0) { e.stT -= edt; if (e.stT <= 0 && dist < 300) { e.st = 1; e.stT = 0.7; e.dashX = ux; e.dashY = uy; } }
          else if (e.st === 1) { spd = 0; e.stT -= edt; if (e.stT <= 0) { e.st = 2; e.stT = 0.55; } }
          else { mx = e.dashX; my = e.dashY; spd *= 4.4; e.stT -= edt; if (e.stT <= 0) { e.st = 0; e.stT = 2.4; } }
          break;
        case 'aura':
          e.stT -= edt;
          if (e.stT <= 0) { e.stT = 0.5; forNear(e.x, e.y, 115, o => { if (o !== e) o.auraArm = 0.6; }); }
          break;
        case 'phase':
          e.stT -= edt;
          if (e.stT <= 0) { e.phased = !e.phased; e.stT = e.phased ? 1.4 : 2.2; }
          break;
        default:
          if (FOE_AI[e.def.ai]) { const m = FOE_AI[e.def.ai](e, edt, dist, ux, uy, dx, dy); if (m) { mx = m.x; my = m.y; if (m.s != null) spd = m.s; } }
          break;
        case 'summon':
          if (dist < 260) { mx = -ux; my = -uy; }
          e.shootCd -= edt;
          if (e.shootCd <= 0) {
            e.shootCd = 5;
            for (let i = 0; i < 2 && G.enemies.length < CAPS.enemies; i++) G.enemies.push(makeEnemy(ENEMIES.skitter, e.x + rand(-20, 20), e.y + rand(-20, 20)));
            ring(e.x, e.y, 40, e.color, 0.3);
          }
          break;
      }
    }
    // Drunks weave about (chem.js).
    const wob = chemWobble(e);
    if (wob) { const c = Math.cos(wob), sn = Math.sin(wob), x0 = mx; mx = mx * c - my * sn; my = x0 * sn + my * c; }
    // Movement (knockback decays).
    const f = frozen || e.tunT > G.t ? 0 : slow;
    if (e.tailCut) spd *= 0.15; // no flagellum: it can only twitch and drift
    const tide = e.boss || e.egg ? 0 : 0.8;
    // Scared, lured, stuck in the lines, or looking for you where you vanished (toys.js).
    if (G.toy || G.decoy) { const ts = toySteer(e); if (ts) { mx = ts.x; my = ts.y; } }
    // Spotlight on a newcomer: the rest of the crowd near you backs off and gives it the stage.
    if (G.spot && G.spot.cur && e.def !== G.spot.cur && !e.boss && !e.rival && !e.final && !e.egg && dist < SPOT.back && spotOn()) { mx = -ux; my = -uy; spd *= 0.7; }
    // On an ice rink, steering becomes shoving: they slide about. (svx/svy: how it is swimming, for head-on rams.)
    if (e.iceT > G.t && !e.boss) { e.kx += mx * spd * 3 * dt; e.ky += my * spd * 3 * dt; spd *= 0.2; }
    e.svx = mx * spd * f * warpF * G.evm.espd; e.svy = my * spd * f * warpF * G.evm.espd;
    e.x += (mx * spd * f * warpF * G.evm.espd + e.kx + G.evm.tideX * tide) * dt;
    e.y += (my * spd * f * warpF * G.evm.espd + e.ky + G.evm.tideY * tide) * dt;
    const kd = Math.pow(0.02, dt);
    e.kx *= kd; e.ky *= kd;
    // Nothing swims through the egg.
    { const ox = e.x - G.core.x, oy = e.y - G.core.y, od = Math.hypot(ox, oy) || 1, mr = CORE.r + e.r; if (od < mr) { e.x = G.core.x + ox / od * mr; e.y = G.core.y + oy / od * mr; } }
    terrainBody(e, dt);
    if (e.dead) continue;
    // Contact damage.
    if (!e.phased && dist < e.r + p.r) {
      if (G.barrier > 0) {
        e.kx -= ux * 300; e.ky -= uy * 300;
        if (!(e.hitT.b > G.t)) { e.hitT.b = G.t + 0.4; damageEnemy(e, G.barrierDmg, { elem: 'arcane', wname: 'Latex Barrier' }); }
      } else if (G.relics.swallow && !e.elite && !e.boss && !e.rival && !e.bossDef && !e.charmed && !e.egg && e.r <= p.r * 1.3) {
        e.hp = 0; killEnemy(e, { wname: 'Swallow Whole' }); healPlayer(3, true);
        if (!(G.gulpT > G.realT)) { G.gulpT = G.realT + 0.5; floatText(p.x, p.y - 26, 'GULP', PAL.you, 13); }
        continue;
      } else {
        const rk = ramHit(e, p);
        if (!frozen && !e.dead && e.dmg > 0) hurtPlayer(e.dmg * G.evm.contact * (1 - 0.4 * rk), e.name + (e.elite ? ' (elite)' : ''), e, 'contact');
        if (e.dead) continue;
      }
    }
    // Leash: recycle enemies left far behind.
    if (dist > 1500 && !e.boss && !wormBody(e)) { const s = spawnPos(); e.x = s.x; e.y = s.y; } // (a worm's body follows its head)
  }
  // Separation.
  for (const e of G.enemies) {
    if (e.dead || e.boss) continue;
    forNear(e.x, e.y, e.r * 0.8, o => {
      if (o === e || wormMate(e, o)) return;
      const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 0.01, ov = e.r + o.r - d;
      if (ov > 0) { const push = Math.min(ov, 4) * 0.5; e.x += dx / d * push; e.y += dy / d * push; }
    });
  }
}

function bossAI(e, dt, dist, ux, uy) {
  const pats = e.def.patterns;
  dt *= bossUpkeep(e, dt);
  e.patT += dt;
  if (e.patT > 5.5) { e.patT = 0; e.pat = (e.pat + 1) % pats.length; e.fireT = 0; e.st = 0; e.glaring = false; }
  const pat = pats[e.pat];
  const p = G.player;
  const aim = ((G.toy || G.decoy) && toyAim(e)) ?? Math.atan2(p.y - e.y, p.x - e.x);
  const bd = e.def.dmg * 0.35 * dmgNow() * (e.campK || 1); // (wave mode: the first bosses hit softer)
  // Default movement: keep medium distance.
  e.mvx = dist > 230 ? ux : dist < 150 ? -ux : -uy; e.mvy = dist > 230 ? uy : dist < 150 ? -uy : ux; e.mvs = e.speed;
  // Bosses don't let you kite them off screen: far away, they close in fast.
  if (dist > 380) e.mvs = Math.max(e.speed, 140 * G.P.speed);
  if (e.patT < 0.6) return; // brief pause between patterns
  e.fireT -= dt;
  if (bossSpecial(e, pat, dt, dist, ux, uy, aim, bd)) return;
  switch (pat) {
    case 'spiral':
      if (e.fireT <= 0) { e.fireT = 0.09; e.spin += 0.23; for (let k = 0; k < 3; k++) eBullet(e.x, e.y, e.spin + k * TAU / 3, 130, bd, 6, '#ff4d6d'); }
      break;
    case 'doubleSpiral':
      if (e.fireT <= 0) { e.fireT = 0.11; e.spin += 0.19; for (let k = 0; k < 4; k++) { eBullet(e.x, e.y, e.spin + k * TAU / 4, 120, bd, 5.5, '#c77dff'); eBullet(e.x, e.y, -e.spin + k * TAU / 4 + 0.4, 150, bd, 4.5, '#ff3df2'); } }
      break;
    case 'ring':
      if (e.fireT <= 0) { e.fireT = 0.95; e.st++; const n = 26, off = e.st % 2 ? Math.PI / n : 0; for (let i = 0; i < n; i++) eBullet(e.x, e.y, off + i / n * TAU, 135, bd, 6, '#ff9e00'); }
      break;
    case 'aimedFan':
      if (e.fireT <= 0) { e.fireT = 0.65; for (let i = -3; i <= 3; i++) eBullet(e.x, e.y, aim + i * 0.13, 190, bd, 5, '#ffe94a'); }
      break;
    case 'flower':
      if (e.fireT <= 0) { e.fireT = 0.5; e.st++; const n = 18; for (let i = 0; i < n; i++) eBullet(e.x, e.y, e.spin + i / n * TAU, i % 2 ? 105 : 160, bd, 5, i % 2 ? '#9d4edd' : '#ff3df2'); e.spin += 0.17; }
      break;
    case 'summon':
      if (e.st === 0) {
        e.st = 1;
        for (let i = 0; i < 8 && G.enemies.length < CAPS.enemies; i++) { const a = i / 8 * TAU; G.enemies.push(makeEnemy(pick([ENEMIES.skitter, ENEMIES.crawler, ENEMIES.bomber]), e.x + Math.cos(a) * 70, e.y + Math.sin(a) * 70)); }
        ring(e.x, e.y, 90, e.color, 0.5, 5);
      }
      if (e.fireT <= 0) { e.fireT = 1.2; shootPattern(e, 'aimed'); }
      break;
    case 'charge':
      if (e.st === 0) { e.st = 1; e.stT = 0.8; e.dashX = ux; e.dashY = uy; }
      if (e.st === 1) { e.mvs = 0; e.stT -= dt; if (e.stT <= 0) { e.st = 2; e.stT = 0.9; } }
      else if (e.st === 2) { e.mvx = e.dashX; e.mvy = e.dashY; e.mvs = e.speed * 6; e.stT -= dt; if (e.fireT <= 0) { e.fireT = 0.12; eBullet(e.x, e.y, Math.atan2(e.dashY, e.dashX) + Math.PI + rand(-0.5, 0.5), 90, bd, 6, '#adb5bd'); } if (e.stT <= 0) { e.st = 0; } }
      break;
    case 'blink':
      if (e.fireT <= 0) {
        e.fireT = 1.6;
        spawnPart(e.x, e.y, e.color, 14, 160, 0.4);
        const a = Math.random() * TAU; e.x = p.x + Math.cos(a) * 220; e.y = p.y + Math.sin(a) * 220;
        for (let i = 0; i < 14; i++) eBullet(e.x, e.y, i / 14 * TAU, 125, bd, 6, '#7b2cbf');
        ring(e.x, e.y, 70, '#c77dff', 0.4, 4);
      }
      break;
  }
}

// ---------------------------------------------------------------- weapons
function weaponSrc(w) {
  const s = w.s, d = w.def, P = G.P;
  const mod = w.mods && w.mods.find(m => m.id === 'elemental');
  const nearAnchor = Math.hypot(me().x - G.core.x, me().y - G.core.y) < 450;
  return { elem: mod ? mod.elem : s.elem || d.elem, elem2: d.elem2, wname: (w.echo ? 'Echo ' : '') + d.name, crit: s.crit + (!nearAnchor ? P.anchorLink : 0),
    shred: s.shred || 0, knock: s.knock || 0, freezeHit: s.freezeHit, echoHit: s.echoHit, w, dir: w.dir, echo: !!w.echo,
    grudge: !!d.grudge, parasite: !!d.parasite, mult: weaponMult(w) * (mod ? 1 + 0.15 * ((mod.p || 1) - 1) : 1), // (Switched at Birth: power adds damage)
    modFreeze: s.modFreeze || 0, modExplode: s.modExplode || 0, modCharm: s.modCharm || 0, charmDur: s.charmDur || 0 };
}

function updateWeapon(w, dt) {
  const s = w.s, d = w.def;
  const rage = G.rage > 0;
  if (d.kind === 'orbit') { updateOrbit(w, dt); return; }
  if (d.kind === 'wake') { updateWake(w, dt); return; }
  if (d.kind === 'siphon') { updateSiphon(w, dt); return; }
  if (d.heat) { updateHeat(w, dt); return; }
  if (w.lastTarget && !w.lastTarget.dead) w.focusT += dt;
  if (d.kind === 'beam' && w.beamT > 0) updateBeam(w, dt);
  if (w.reloadT > 0) {
    w.reloadT -= dt * (rage ? 3 : 1);
    if (w.reloadT <= 0) { w.reloadT = 0; w.ammo = s.mag; if (d.gacha) rollGacha(w); }
    w.spin = Math.max(0, w.spin - dt);
    return;
  }
  if (d.scrapAmmo && G.scrap < 1) { if (!w.broke) { w.broke = true; achieve('broke'); } w.cd = Math.max(w.cd, 0); return; }
  w.broke = false;
  let rate = (G.clarityT > G.t ? 0.65 : 1) * (rage ? 2 : 1) * (d.spinup ? 1 + 2 * w.spin : 1) * rateBonus() * (w.rateK || 1) * rrelicHaste() * redHaste() * chemHaste();
  if (d.kind === 'crayon') { w.durK = Math.max(1, rate); rate = 1 / Math.max(1, rate); } // (Colouring In: fire rate works backwards, toys.js)
  w.cd -= dt * rate;
  let shots = 0;
  while (w.cd <= 0 && shots < 3) {
    let target = null;
    if (!d.noTarget && d.kind !== 'mine') {
      target = d.grudge && G.grudge && !G.grudge.dead && !G.grudge.phased ? G.grudge : acquire(w.dir, s.range, G.player.x, G.player.y);
      if (!target) { w.cd = Math.max(w.cd, -s.cd); w.spin = Math.max(0, w.spin - dt); w.curTarget = null; return; }
      if (target !== w.lastTarget) { w.focusT = 0; w.lastTarget = target; }
      w.curTarget = target;
    }
    if (d.kind === 'mine' && !acquire('nearest', s.range, G.player.x, G.player.y)) { w.cd = 0; return; }
    w.isLast = !rage && !d.scrapAmmo && G.P.lastRound > 0 && w.ammo === 1;
    fireWeapon(w, target);
    comboFire(w, target); pair2Fire(w, target);
    w.firedT = G.t;
    w.isLast = false;
    shots++;
    w.cd += s.cd;
    if (d.spinup) w.spin = Math.min(1, w.spin + s.cd * 0.6);
    if (d.scrapAmmo) { G.scrap = Math.max(0, G.scrap - 1); if (G.scrap < 1) return; }
    else if (!rage) {
      w.ammo--;
      if (w.ammo <= 0) { startReload(w); w.cd = Math.max(w.cd, 0); return; }
    }
  }
}

function dronePos(w, i, n) {
  const a = G.realT * 1.6 + i / n * TAU, r = 42 + (n > 2 ? 10 : 0);
  return { x: G.player.x + Math.cos(a) * r, y: G.player.y + Math.sin(a) * r };
}

function fireWeapon(w, target) {
  const s = w.s, d = w.def, p = G.player, src = weaponSrc(w);
  if (d.toy) { toyFire(w, target, src); return; }
  if (d.reborn && rebornFire(w, target, src)) return; // (Prawn Again's weapons, reborn.js)
  if (d.gene && geneFire(w, target, src)) return; // (the Gene Gun, genegun.js)
  if (d.redtail && redFire(w, target, src)) return; // (the Redtail's weapons, redtail.js)
  if (d.reborn) after(0, () => rebornAfterFire(w));
  switch (d.kind) {
    case 'gun': {
      if (d.drones) {
        for (let i = 0; i < s.count; i++) {
          const o = dronePos(w, i, s.count);
          const a = Math.atan2(target.y - o.y, target.x - o.x);
          spawnProj(w, o.x, o.y, a + rand(-s.spread, s.spread) * 0.5, src);
        }
      } else {
        const barrels = d.committee ? w.dirs.map(dd => acquire(dd, s.range, p.x, p.y) || target) : [target];
        const over = gunOver(w);
        const fsrc = w.isLast ? Object.assign({}, src, { last: true, mult: src.mult * (3 + Math.min(4, G.P.lastRound)) }) : src;
        for (const tg of barrels) {
          const V = sigVolley(w, Math.atan2(tg.y - p.y, tg.x - p.x));
          const a0 = V.a0, vo = V.over ? Object.assign({}, over || {}, V.over) : over;
          const n = s.count + V.extra;
          for (let i = 0; i < n; i++) {
            const a = n > 1 ? a0 + (i / (n - 1) - 0.5) * s.spread + rand(-0.04, 0.04) : a0 + rand(-s.spread, s.spread) * 0.5;
            const o = V.big && i === 0 ? Object.assign({}, vo || {}, { dmg: s.dmg * 4, r: (s.size || 4) * 3, pierce: 3 }) : vo;
            let pr;
            if (G.P.future > 0 && Math.random() < G.P.future) {
              // Future Rounds: this bullet was fired a moment from now, so it's already arriving.
              const fx = tg.x - Math.cos(a) * 40, fy = tg.y - Math.sin(a) * 40;
              ring(fx, fy, 14, '#8dffc0', 0.25, 2);
              pr = spawnProj(w, fx, fy, a, fsrc, o);
            } else pr = spawnProj(w, p.x, p.y, a, fsrc, o);
            if (pr && V.owner) { pr.homing = Math.max(pr.homing, 8); pr.tgt = V.owner; pr.vsOwner = V.owner; }
          }
          if (!hasSig(w, 'dragon')) p.face = a0;
          // Muzzle flash (flames are their own flash).
          if (d.style !== 'flame' && !(w.muzT > G.realT)) { w.muzT = G.realT + 0.06; G.fx.push({ type: 'muzzle', x: p.x, y: p.y, a: a0, color: d.color, life: 0.08, max: 0.08 }); }
        }
      }
      if (d.style !== 'flame' || Math.random() < 0.2) sfx('shot');
      break;
    }
    case 'chain': {
      const ts = s.count > 1 ? acquireMany(w.dir, s.range, p.x, p.y, s.count) : [target];
      const csrc = w.isLast ? Object.assign({}, src, { mult: src.mult * (3 + Math.min(4, G.P.lastRound)) }) : src;
      // Spoilers: a bolt that starts from the far side of the crowd.
      if (G.P.future > 0 && Math.random() < G.P.future) { const far = acquire('furthest', s.range, p.x, p.y); if (far) doChain(far.x, far.y, far, s.dmg, s.chain, s.jump, Object.assign({}, csrc)); }
      for (const t of ts) afterChain(w, doChain(p.x, p.y, t, s.dmg, s.chain, s.jump, Object.assign(csrc, { overcharge: hasSig(w, 'overcharge'), revisit: hasSig(w, 'shortcircuit') })), src);
      sfx('zap');
      break;
    }
    case 'beam':
      w.beamT = s.dur; w.beamTick = 0; w.beams = [];
      break;
    case 'mimic': fireMimic(w, target, src); sfx('shot'); break;
    case 'melee': fireMelee(w, target, src); break;
    case 'tether': fireTether(w, target, src); sfx('zap'); break;
    case 'prequel': firePrequel(w, target, src); break;
    case 'lob':
      for (let i = 0; i < s.count; i++) {
        const tx = target.x + (i === 0 && s.count < 3 ? 0 : rand(-s.spread, s.spread)), ty = target.y + (i === 0 && s.count < 3 ? 0 : rand(-s.spread, s.spread));
        const fut = G.P.future > 0 && Math.random() < G.P.future; // Spoilers: it landed before you threw it
        G.proj.push({ lob: true, sx: fut ? tx : p.x, sy: fut ? ty : p.y, tx, ty, x: p.x, y: p.y, t: 0, flight: fut ? 0.02 : s.flight * rand(0.9, 1.15), w, src: w.isLast ? Object.assign({}, src, { last: true, mult: src.mult * (3 + Math.min(4, G.P.lastRound)) }) : src, color: d.color, dead: false });
      }
      break;
    case 'mine':
      for (let i = 0; i < s.count; i++) {
        G.proj.push(mineDrop(w, p.x + rand(-26, 26), p.y + rand(-26, 26)));
      }
      mineTrim();
      break;
    // ---- spells
    case 'strike': {
      const ts = acquireMany(w.dir, s.range, p.x, p.y, s.count);
      for (const t of ts) {
        const tx = t.x + t.vx * 0, ty = t.y;
        G.fx.push({ type: 'warn', x: tx, y: ty, r: s.area, color: d.color, life: s.delay, max: s.delay });
        G.fx.push({ type: 'fall', x: tx, y: ty, r: s.area, color: d.color, life: s.delay, max: s.delay });
        after(s.delay, () => {
          aoe(tx, ty, s.area, s.dmg, src, d.color);
          const hw = spellFork(w, 'b') ? 1 : 0; // Hot Water Bottle
          G.zones.push({ x: tx, y: ty, r: s.area * 0.7 * (hw ? 1.4 : 1), life: s.dur * (hw ? 2 : 1), max: s.dur * (hw ? 2 : 1), dps: s.dmg * 0.15, elem: 'fire', pull: 0, color: '#ff5400', tick: 0, src });
        });
      }
      break;
    }
    case 'nova':
      aoe(p.x, p.y, s.area, s.dmg, src, d.color);
      forNear(p.x, p.y, s.area, e => { if (!e.boss) e.frozen = Math.max(e.frozen, spellFork(w, 'a') ? 3.2 : 1.6); }); // (Ice Bath: twice as long)
      if (spellFork(w, 'b') && !src.again) after(1, () => { const q = me(); aoe(q.x, q.y, s.area, s.dmg, Object.assign({}, src, { again: true }), d.color); forNear(q.x, q.y, s.area, e => { if (!e.boss) e.frozen = Math.max(e.frozen, 1.6); }); ring(q.x, q.y, s.area, '#caf0f8', 0.5, 6); }); // Power Shower
      for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < s.area) { b.dead = true; spawnPart(b.x, b.y, '#90e0ef', 1, 60, 0.3); }
      ring(p.x, p.y, s.area, '#caf0f8', 0.5, 6);
      fxParts('shard', p.x, p.y, '#caf0f8', 22, s.area * 3, 0.55, 4.5);
      G.fx.push({ type: 'frost', x: p.x, y: p.y, r: s.area, color: '#caf0f8', life: 0.6, max: 0.6 });
      break;
    case 'thunder': {
      const ts = acquireMany(w.dir, s.range, p.x, p.y, s.count);
      ts.forEach((t, i) => after(i * 0.07, () => {
        bolt(t.x + rand(-30, 30), t.y - 500, t.x, t.y, '#fdf0d5', 0.3);
        bolt(t.x + rand(-60, 60), t.y - 420, t.x, t.y, '#ffe94a', 0.2);
        aoe(t.x, t.y, s.area, s.dmg, src, '#ffe94a');
        G.flashT = Math.max(G.flashT || 0, 0.12); // the sky lights up
        if (spellFork(w, 'a')) for (const n of acquireMany('nearest', 220, t.x, t.y, 3).filter(n => n !== t).slice(0, 2)) { bolt(t.x, t.y, n.x, n.y, '#ffe94a', 0.15); damageEnemy(n, s.dmg * 0.5, src); } // Brainwave
        if (spellFork(w, 'b')) forNear(t.x, t.y, s.area, e => { if (!e.boss) e.dazeT = Math.max(e.dazeT || 0, G.t + 1); }); // Thunderclap
      }));
      break;
    }
    case 'zone':
      G.zones.push({ x: target.x, y: target.y, r: s.area, life: s.dur, max: s.dur, dps: s.dmg, elem: d.elem, pull: s.pull, color: d.color, tick: 0, src, spell: w.id,
        follow: w.id === 'cloud' && spellFork(w, 'b'), // Hotbox
        onEnd: w.id === 'blackhole' && spellFork(w, 'b') ? z => { aoe(z.x, z.y, z.r * 1.3, s.dmg * 4, src, d.color); ring(z.x, z.y, z.r * 1.3, d.color, 0.5, 6); } : null }); // Loose Change
      break;
    case 'heal':
      if (spellFork(w, 'a')) p.iframes = Math.max(p.iframes, 1.5); // Plaster
      if (spellFork(w, 'b')) aoe(p.x, p.y, 180, G.P.maxHp * s.dmg * 1.5, src, '#80ffdb'); // Kiss Chase
      healPlayer(G.P.maxHp * s.dmg); ring(p.x, p.y, 60, '#80ffdb', 0.5, 4); fxParts('plus', p.x, p.y, '#80ffdb', 10, 70, 1.1, 7); G.fx.push({ type: 'flash', x: p.x, y: p.y, r: 70, color: '#80ffdb', life: 0.3, max: 0.3 }); break;
    case 'warp': G.warp = s.dur; banner('TIME WARP', '#b8c0ff'); break;
    case 'barrier': G.barrier = s.dur; G.barrierR = s.area; G.barrierDmg = s.dmg; break;
    case 'oob': rebornOOB(w); break;
    case 'ring':
      for (let i = 0; i < s.count; i++) spawnProj(w, p.x, p.y, i / s.count * TAU + G.realT, src);
      break;
    case 'sentry':
      for (let i = 0; i < s.count; i++) {
        const a = Math.random() * TAU;
        G.turrets.push({ x: p.x + Math.cos(a) * 50, y: p.y + Math.sin(a) * 50, life: s.dur, max: s.dur, cd: 0, rate: s.rate, dmg: s.dmg, range: s.range, w, src, face: 0 });
      }
      break;
  }
}

// Past PROJ_SOFT shots in the air, shots are merged: only every 2nd (past 1.6x, every 3rd) one flies, carrying
// the damage of the ones it replaces and a little bigger. Same damage, a fraction of the work (a Scattergun
// with its echoes put nearly 900 shots up at once and the frame rate fell apart).
const PROJ_SOFT = 170, MINE_CAP = 90; // (past PROJ_SOFT shots merge: fewer, harder ones, same damage)
// Mines lie about for a long time and bypassed every limit: a big mine build left 800+ on the slide. Past
// MINE_CAP, the oldest ones fold into the newest: they vanish, and the newest mines blow up harder
// (charge: 60% of each one folded in, so a huge field is still worth having, just not 800 objects).
function mineTrim() {
  const ms = []; for (const q of G.proj) if (q.mine && !q.dead) ms.push(q);
  let over = ms.length - MINE_CAP;
  if (over <= 0) return;
  for (let i = 0, j = ms.length - 1; i < ms.length && over > 0; i++) {
    const q = ms[i]; if (q.stick) continue;
    q.dead = true; over--;
    const to = ms[j]; to.charge = (to.charge || 1) + 0.6 * (q.charge || 1); j = j > ms.length - 10 ? j - 1 : ms.length - 1; // (spread over the 10 newest)
  }
}
function spawnProj(w, x, y, a, src, over) {
  if (G.proj.length >= CAPS.proj) return;
  let merge = 1;
  if (G.proj.length >= PROJ_SOFT) { merge = G.proj.length >= PROJ_SOFT * 1.6 ? 3 : 2; G.projSkip = ((G.projSkip || 0) + 1) % merge; if (G.projSkip) return; }
  const s = w.s, d = w.def;
  let speed = s.speed * (d.style === 'flame' ? rand(0.75, 1.1) : 1);
  const el = d.elem2 && Math.random() < 0.5 ? d.elem2 : src.elem || d.elem;
  const pr = {
    x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, speed, r: s.size || 4, dmg: s.dmg, pierce: s.pierce || 0,
    life: (s.range || 400) / speed, max: 0, w, src: el !== src.elem ? Object.assign({}, src, { elem: el }) : src,
    color: d.color, style: s.style || d.style || 'bullet', explode: s.explode || 0, homing: s.homing || 0,
    bounce: s.bounce || 0, boomerang: s.boomerang || 0, chainHit: s.chainHit || 0, aura: s.aura || 0, pull: s.pull || 0,
    hits: null, tick: 0, dead: false, tgt: null, back: false,
  };
  const mods = !(over && over.noMods);
  if (mods && s.boomerangMod && !pr.boomerang && d.kind !== 'ring') { pr.boomerang = 1; pr.backK = 1 + 0.35 * (s.boomerangMod - 1); }
  if (pr.boomerang) pr.life = s.range / speed * 2 + 0.3;
  pr.max = pr.life;
  if (over) Object.assign(pr, over);
  if (w.def.reborn && w.id === 'karma') pr.dmg *= karmaMul(); // (Karma: charged by the hits you take, reborn.js)
  if (merge > 1) { pr.dmg *= 1 + 0.5 * (merge - 1); pr.r *= 1 + 0.15 * (merge - 1); } // (half the merged damage: one big hit loses far less to armour than several small ones)
  if (w.perks && !(over && over.noMods)) sigProj(pr, w);
  if (mods) {
    if (s.grow) { pr.grow = s.grow; pr.r0 = pr.r; pr.dmg0 = pr.dmg; pr.age = 0; }
    if (s.orbitMod) { pr.orbitT = s.orbitMod; pr.oa = Math.random() * TAU; pr.orad = rand(42, 70); }
    if (s.splitHit && pr.splitHit == null) pr.splitHit = s.splitHit;
    if (s.pulse) { pr.pulse = s.pulse; pr.pulseT = s.pulseRate; }
    if (s.magnet) pr.magnet = s.magnet;
    if (s.delay) { pr.delayAt = 0.15; pr.delayB = s.delay; }
  }
  G.proj.push(pr);
  if (w.def.replay) rebornReplay(w, x, y, a, src, over, pr); // (Deja Vu: the same shot again, later)
  // Mirror: a twin fired the opposite way.
  if (mods && s.mirror && !(over && over.mirrored)) {
    const tw = Object.assign({}, over || {}, { mirrored: true, dmg: (over && over.dmg || s.dmg) * s.mirror });
    if (s.kaleido && s.splitHit) tw.splitHit = s.splitHit * 2;
    spawnProj(w, x, y, a + Math.PI, src, tw);
  }
  return pr;
}

function updateOrbit(w, dt) {
  const s = w.s, p = G.player;
  w.blades.length = 0;
  if (w.active > 0) {
    w.active -= dt;
    if (w.active <= 0) { w.reloadT = w.reloadMax = s.reload; angelsClockOff(w); }
  } else if (w.reloadT > 0) {
    w.reloadT -= dt * (G.rage > 0 ? 3 : 1);
    if (w.reloadT <= 0) { w.reloadT = 0; w.active = s.dur; }
    return;
  } else { w.active = s.dur; }
  if (hasSig(w, 'clingy')) { w.active = s.dur; w.reloadT = 0; }
  w.focusT = (w.focusT || 0) + dt; // Tunnel Vision: the longer the shift, the harder they hit
  angelSpoilers(w, dt);
  w.ang += s.spin * dt;
  const rad = s.radius * (w.def.base.pulse ? 1 + 1.1 * (0.5 - 0.5 * Math.cos(G.realT * 2.2)) : 1);
  const src = weaponSrc(w);
  if (!w.hitKeys || w.hitKeys.length < s.count) w.hitKeys = Array.from({ length: s.count }, (_, i) => w.uid + '_' + i);
  // Heavenly Host: a second ring, twice as far out, spinning the other way.
  const rings = hasSig(w, 'extended') ? 2 : 1;
  if (w.hitKeys.length < s.count * rings) w.hitKeys = Array.from({ length: s.count * rings }, (_, i) => w.uid + '_' + i);
  for (let ri = 0; ri < rings; ri++) for (let i = 0; i < s.count; i++) {
    const a = (ri ? -w.ang * 0.8 : w.ang) + i / s.count * TAU;
    const rr = ri ? rad * 2 : rad;
    const bx = p.x + Math.cos(a) * rr, by = p.y + Math.sin(a) * rr;
    const hk = w.hitKeys[ri * s.count + i];
    w.blades.push(bx, by, a);
    bladeEats(w, bx, by, s.size);
    forNear(bx, by, s.size, e => {
      if (e.hitT[hk] > G.t) return;
      e.hitT[hk] = G.t + (s.hitCd || 0.4);
      damageEnemy(e, s.dmg, Object.assign({}, src, { knock: 50, kx: e.x - p.x, ky: e.y - p.y }));
    });
  }
}

function updateBeam(w, dt) {
  const s = w.s, p = G.player;
  w.beamT -= dt; w.beamTick -= dt;
  if (w.beamT <= 0) { w.beams = []; return; }
  // Re-acquire targets and swing beams towards them.
  const ts = acquireMany(w.dir, s.range * 1.05, p.x, p.y, s.count);
  if (!ts.length) { w.beams = []; return; }
  while (w.beams.length < ts.length) w.beams.push({ a: Math.atan2(ts[w.beams.length].y - p.y, ts[w.beams.length].x - p.x) });
  w.beams.length = ts.length;
  const doTick = w.beamTick <= 0;
  if (doTick) w.beamTick = 0.1;
  const src = weaponSrc(w);
  ts.forEach((t, i) => {
    const b = w.beams[i];
    const ta = Math.atan2(t.y - p.y, t.x - p.x);
    let da = ((ta - b.a + Math.PI * 3) % TAU) - Math.PI;
    b.a += clamp(da, -8 * dt, 8 * dt);
    if (!doTick) return;
    const cx = Math.cos(b.a), cy = Math.sin(b.a), L = s.range;
    // Sample along the beam using grid queries.
    const seen = new Set();
    for (let d = 20; d <= L; d += 50) {
      forNear(p.x + cx * d, p.y + cy * d, 40, e => {
        if (seen.has(e)) return;
        const ex = e.x - p.x, ey = e.y - p.y, along = ex * cx + ey * cy;
        if (along < 0 || along > L) return;
        const perp = Math.abs(ex * cy - ey * cx);
        if (perp < s.size + e.r) { seen.add(e); damageEnemy(e, s.dmg * 0.1, src); }
      });
    }
  });
}

function updateProjectiles(dt) {
  const p = G.player, wells = aimHoles(); // (gravity wells your shots can slingshot round, aim.js)
  for (const pr of G.proj) {
    if (pr.dead) continue;
    if (pr.lob) {
      pr.t += dt;
      const k = Math.min(1, pr.t / pr.flight);
      pr.x = lerp(pr.sx, pr.tx, k); pr.y = lerp(pr.sy, pr.ty, k); pr.h = Math.sin(k * Math.PI) * 90;
      if (k >= 1) { pr.dead = true; landLob(pr); }
      continue;
    }
    if (pr.mine) {
      if (updateStickyMine(pr, dt)) continue;
      pr.life -= dt; pr.arm -= dt;
      if (pr.arm <= 0) {
        let trig = false;
        forNear(pr.x, pr.y, 34, () => { trig = true; return true; });
        if (trig || pr.life <= 0) { pr.dead = true; detonateMine(pr); }
      }
      continue;
    }
    // Orbiting modifier: circle the player eating enemy bullets, then launch.
    if (pr.orbitT > 0) {
      pr.orbitT -= dt; pr.oa += 6 * dt;
      pr.x = p.x + Math.cos(pr.oa) * pr.orad; pr.y = p.y + Math.sin(pr.oa) * pr.orad;
      for (const b of G.ebul) { if (!b.dead && Math.abs(b.x - pr.x) < pr.r + b.r + 3 && Math.abs(b.y - pr.y) < pr.r + b.r + 3) { b.dead = true; spawnPart(b.x, b.y, '#8dffc0', 1, 40, 0.2); } }
      if (pr.orbitT <= 0) {
        const t = acquire(pr.w.dir === 'revenge' ? 'nearest' : pr.w.dir, (pr.w.s.range || 400) * 1.2, pr.x, pr.y);
        const a = t ? Math.atan2(t.y - pr.y, t.x - pr.x) : pr.oa + Math.PI / 2;
        pr.vx = Math.cos(a) * pr.speed; pr.vy = Math.sin(a) * pr.speed; pr.hits = null;
      }
    }
    // Growing modifier: bigger and nastier the longer it flies.
    // Forge modifiers: delayed launch, pulses, magnetic drag.
    if (pr.delayAt != null && !pr.launched) {
      pr.fAge = (pr.fAge || 0) + dt;
      if (!pr.hold && pr.fAge > pr.delayAt) { pr.hold = 0.35; pr.hx = pr.x; pr.hy = pr.y; pr.life += 0.35; }
      if (pr.hold) {
        pr.hold -= dt;
        if (pr.hold <= 0) {
          pr.launched = true; pr.vx *= 1.6; pr.vy *= 1.6; pr.speed *= 1.6; pr.dmg *= 1 + pr.delayB;
          if (pr.w.s.timeBomb) aoe(pr.x, pr.y, 55, pr.dmg * 0.6, Object.assign({}, pr.src, { noProc: true, noCrit: true, wname: 'Biological Clock' }), '#ff7a2f');
        }
      }
    }
    if (pr.pulse) { pr.pulseT -= dt; if (pr.pulseT <= 0) { pr.pulseT = pr.w.s.pulseRate || 0.45; aoe(pr.x, pr.y, 38, pr.dmg * pr.pulse, Object.assign({}, pr.src, { noProc: true, noCrit: true, wname: 'Pulse' }), '#cfe3ff'); } }
    // Magnetic pull: one pull per enemy per frame, however many magnetic shots are near it (they used to stack, so a
    // cloud of orbiting magnetic shots yanked enemies across the slide at thousands of units a second).
    if (pr.magnet) forNear(pr.x, pr.y, pr.magnet, e => { if (!e.boss && !e.egg && !e.rival && e.magF !== G.frameN) { e.magF = G.frameN; const dx = pr.x - e.x, dy = pr.y - e.y, dd = Math.hypot(dx, dy) || 1, m = Math.min(dd, 90 * dt); e.x += dx / dd * m; e.y += dy / dd * m; } });
    if (pr.grow) { pr.age += dt; const k = Math.min(1, pr.age / Math.max(0.3, pr.max * 0.8)); pr.r = pr.r0 * (1 + 2 * k); pr.dmg = pr.dmg0 * (1 + pr.grow * k); }
    // Homing.
    if (pr.homing && !(pr.orbitT > 0)) {
      if (!pr.tgt || pr.tgt.dead) pr.tgt = acquire(pr.w.dir === 'random' ? 'nearest' : pr.w.dir, 380, pr.x, pr.y);
      if (pr.tgt) {
        const ta = Math.atan2(pr.tgt.y - pr.y, pr.tgt.x - pr.x), ca = Math.atan2(pr.vy, pr.vx);
        const da = ((ta - ca + Math.PI * 3) % TAU) - Math.PI;
        const na = ca + clamp(da, -pr.homing * dt, pr.homing * dt);
        pr.vx = Math.cos(na) * pr.speed; pr.vy = Math.sin(na) * pr.speed;
      }
    }
    // Boomerang return (Walk the Dog / Black Hole Yo-Yo: hang at full reach first).
    if (pr.boomerang && !pr.back && pr.life < pr.max / 2) {
      if (pr.hangT > 0) {
        if (!pr.hanging) { pr.hanging = true; pr.hx = pr.x; pr.hy = pr.y; }
        pr.hangT -= dt; pr.life += dt;
        pr.hitReset = (pr.hitReset || 0) - dt;
        if (pr.hitReset <= 0) { pr.hitReset = 0.2; pr.hits = null; }
        if (pr.hangPull) forNear(pr.x, pr.y, 130, e => { if (!e.boss && !e.egg && !e.rival) { const dx = pr.x - e.x, dy = pr.y - e.y, dd = Math.hypot(dx, dy) || 1; e.x += dx / dd * Math.min(dd, pr.hangPull * dt); e.y += dy / dd * Math.min(dd, pr.hangPull * dt); } });
      } else { pr.back = true; pr.hits = null; pr.hanging = false; if (pr.hangPull) pr.magnet = 140; if (pr.backK) pr.dmg *= pr.backK; }
    }
    if (pr.back) {
      const dx = p.x - pr.x, dy = p.y - pr.y, d = Math.hypot(dx, dy) || 1;
      pr.vx = dx / d * pr.speed * 1.15; pr.vy = dy / d * pr.speed * 1.15;
      if (d < 18) {
        pr.dead = true;
        if (pr.catchHeal && pr.nHit && G.lsBudget > 0) { const h = Math.min(G.lsBudget * 2, pr.nHit * 0.6); G.lsBudget = Math.max(0, G.lsBudget - h / 2); healPlayer(h, true); }
        continue;
      }
    }
    if (wells) aimBend(pr, dt);
    if (pr.helix && pr.pair && !(pr.orbitT > 0) && !(pr.hold > 0) && !pr.hanging) geneStep(pr, dt); // (Gene Gun strands twist round each other)
    else if (!(pr.orbitT > 0)) { pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt; }
    if (pr.helix && pr.pair && (pr.orbitT > 0 || pr.hold > 0 || pr.hanging) && pr.pair.strands[0] === pr) { pr.pair.cx = pr.x; pr.pair.cy = pr.y; } // (a held or orbiting helix picks up where its lead strand is)
    if (pr.hold > 0 || pr.hanging) { pr.x = pr.hx; pr.y = pr.hy; }
    if (pr.life <= 0) {
      // Family Reunion: a sibling that missed swims back to circle you, then goes again.
      if (pr.reunion && !pr.reunited) { pr.reunited = true; pr.orbitT = 2; pr.oa = Math.atan2(pr.y - p.y, pr.x - p.x); pr.orad = rand(40, 70); pr.life = pr.max; pr.hits = null; continue; }
      pr.dead = true;
      if (pr.explode) aoe(pr.x, pr.y, pr.explode, pr.dmg, pr.src, pr.color);
      projEnd(pr);
      continue;
    }
    if (!(pr.orbitT > 0) && !pr.back && terrainShot(pr, false, dt)) continue;
    // Aura projectiles (void orb): periodic area damage and pull.
    if (pr.aura) {
      pr.tick -= dt;
      const tick = pr.tick <= 0;
      let caught = 0;
      forNear(pr.x, pr.y, pr.aura, e => {
        caught++;
        e.pulledT = G.t + 0.3;
        if (!e.boss) { const dx = pr.x - e.x, dy = pr.y - e.y, d = Math.hypot(dx, dy) || 1; e.x += dx / d * pr.pull * dt; e.y += dy / d * pr.pull * dt; }
        if (tick) { const dd = damageEnemy(e, pr.dmg, pr.src); if (pr.dealt != null) pr.dealt += dd || 0; gravityTick(pr, e); }
      });
      if (tick) { pr.tick = 0.25; gravityOrb(pr, caught); }
      continue;
    }
    // A shot that crosses a swimmer's flagellum snips it (checked every other frame; tails are thin).
    tailSnip(pr);
    popAmbient(pr.x, pr.y, (pr.r || 3) + 4);
    // Collision.
    forNear(pr.x, pr.y, pr.r, e => {
      if (pr.hits && pr.hits.includes(e.id)) return;
      if (e.boss && bossDodges(e)) { (pr.hits || (pr.hits = [])).push(e.id); return; }
      // Hit from behind: the tail takes it.
      if (canSnip(e) && Math.random() < 0.5) { const fx = G.player.x - e.x, fy = G.player.y - e.y, fl = Math.hypot(fx, fy) || 1, vl = Math.hypot(pr.vx, pr.vy) || 1; if ((pr.vx * fx + pr.vy * fy) / (fl * vl) > 0.5) cutTail(e); }
      if (pr.orbitT > 0) {
        // Orbiting shots slice through things without being used up.
        damageEnemy(e, pr.dmg, pr.src);
        (pr.hits || (pr.hits = [])).push(e.id);
        return false;
      }
      const hm = (pr.pb ? 1 + 1.5 * clamp(pr.life / pr.max, 0, 1) : 1) * (pr.vsOwner === e ? 3 : 1) * aimMul(pr, e); // (range falloff, sniper shots: aim.js)
      damageEnemy(e, pr.dmg * hm, Object.assign({}, pr.src, pr.src.knock ? { kx: pr.vx, ky: pr.vy } : null));
      projHit(pr, e);
      if (pr.ghost) rebornHit(pr, e); // (Ghosts of You: reborn.js)
      if (pr.pair) geneHit(pr, e); // (Gene Gun: edits)
      if (pr.note) redNoteHit(pr, e); // (Duelling Banjo: Hoedown)
      if (pr.src.echoHit) {
        // Paradox Rifle: the same hit arrives again from one second in the future.
        const tgt = e, dmg = pr.dmg * 0.9;
        G.fx.push({ type: 'echoMark', x: e.x, y: e.y, e: tgt, life: 1, max: 1 });
        after(1, () => { if (!tgt.dead) { ring(tgt.x, tgt.y, 22, '#8dffc0', 0.3, 2); damageEnemy(tgt, dmg, { elem: 'arcane', wname: 'Deja Vu Rifle (echo)', noStatus: true }); } });
      }
      spawnPart(pr.x, pr.y, pr.color, 1, 80, 0.2, 2);
      if (pr.splitHit && !pr.didSplit) {
        // Splitting modifier: the shot shatters into shards on its first hit.
        pr.didSplit = true;
        const n = pr.splitHit, a0 = Math.atan2(pr.vy, pr.vx), ss = Object.assign({}, pr.src, { noSplit: true });
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / (n - 1 || 1) - 0.5) * 1.4;
          spawnProj(pr.w, pr.x, pr.y, a, ss, { noMods: true, speed: 460, vx: Math.cos(a) * 460, vy: Math.sin(a) * 460, life: 0.5, dmg: pr.dmg * 0.3,
            r: Math.max(2, pr.r * 0.6), pierce: 0, bounce: 0, homing: pr.w.s.shardHome ? 6 : 0, explode: 0, chainHit: 0, aura: 0, boomerang: 0, hits: [e.id] });
        }
      }
      if (pr.explode) { pr.dead = true; aoe(pr.x, pr.y, pr.explode, pr.dmg * 0.8, pr.src, pr.color); return true; }
      if (pr.chainHit) doChain(e.x, e.y, acquire('nearest', 140, e.x, e.y, e) || e, pr.dmg * 0.55, pr.chainHit - 1, 140, Object.assign({}, pr.src, { noArc: true }));
      if (!pr.hits) pr.hits = [];
      pr.hits.push(e.id);
      if (pr.bounce > 0) {
        pr.bounce--;
        let nx = null, bd = 260 * 260;
        forNear(e.x, e.y, 260, (o, d2) => { if (!pr.hits.includes(o.id) && d2 < bd) { bd = d2; nx = o; } });
        if (nx) {
          const a = Math.atan2(nx.y - pr.y, nx.x - pr.x);
          pr.vx = Math.cos(a) * pr.speed; pr.vy = Math.sin(a) * pr.speed; pr.life = Math.max(pr.life, 0.7);
          return true;
        }
        pr.dead = true; return true;
      }
      if (pr.pierce > 0) { pr.pierce--; if (pr.icicle) pr.dmg *= 1.25; return false; }
      pr.dead = true; return true;
    });
  }
}

function landLob(pr) {
  const s = pr.w.s, d = pr.w.def;
  if (d.base.explode) aoe(pr.tx, pr.ty, s.area, s.dmg, pr.src, pr.color);
  else { forNear(pr.tx, pr.ty, s.area * 0.6, e => { damageEnemy(e, s.dmg, pr.src); }); spawnPart(pr.tx, pr.ty, pr.color, 8, 90, 0.4); }
  if (d.salvage && Math.random() < 0.5) dropScrap(pr.tx, pr.ty, 1);
  if (pr.w.id === 'venom') { if (G.zones.length < 260) G.zones.push(venomZone(pr.w, pr.tx, pr.ty)); }
  else if (s.dur > 0) G.zones.push({ x: pr.tx, y: pr.ty, r: s.area, life: s.dur, max: s.dur, dps: s.dmg * (d.base.explode ? 0.3 : 0.9), elem: d.elem, pull: 0, color: pr.color, tick: 0, src: pr.src });
  if (d.redtail) redLand(pr); // (Moonshine Jug: bad batches and the rest, redtail.js)
}

function detonateMine(pr) {
  const s = pr.w.s;
  genesMine(pr); // Acid Mines (Bruiser + Acid-Burner)
  if (s.singularity) {
    G.zones.push({ x: pr.x, y: pr.y, r: s.explode * 1.2, life: 1.2, max: 1.2, dps: s.dmg * 0.3, elem: 'arcane', pull: 260, color: '#9d4edd', tick: 0, src: pr.src,
      onEnd: z => aoe(z.x, z.y, s.explode, s.dmg, pr.src, '#c77dff') });
  } else { const k = mineScale(pr), ch = pr.charge || 1; aoe(pr.x, pr.y, s.explode * k.r * Math.min(1.6, Math.sqrt(ch)), s.dmg * k.k * ch, pr.src, pr.color); }
  afterMine(pr);
}

function updateSpells(dt) { updateSpellList(G.spells, dt); }
function updateSpellList(list, dt) {
  for (const w of list) {
    if (!w) continue;
    w.cd -= dt * genesSpellRate();
    if (w.cd > 0) continue;
    let target = null;
    if (!w.def.noTarget) {
      target = acquire(w.dir, w.s.range, G.player.x, G.player.y);
      if (!target) { w.cd = 0; continue; }
    } else if (w.def.kind === 'heal' && G.player.hp > G.P.maxHp * 0.85) { w.cd = 0; continue; }
    else if ((w.def.kind === 'warp' || w.def.kind === 'barrier' || w.def.kind === 'ring') && !acquire('nearest', 300, G.player.x, G.player.y)) { w.cd = 0; continue; }
    if (!featPay(w)) { w.cd = 0.2; continue; } // (stamina Feats: not enough in the bar yet)
    fireWeapon(w, target);
    w.cd = featCost(w) ? w.s.cd * 0.35 : w.s.cd; // (stamina Feats only wait a short beat)
    genesCast(w); // Turbo-chondrial Engine
    if (!w.echo) G.stats.casts = (G.stats.casts || 0) + 1;
    w.reloadMax = w.s.cd;
    sfx('spell');
  }
}

// Too many ground effects at once (long trails plus burning and poison pools) made the update the slow part
// of late-game frames. Past the cap, the oldest ones fade out early; permanent ones (Bottomless Pit) stay.
const ZONE_CAP = 150;
function updateZones(dt) {
  if (G.zones.length > ZONE_CAP) {
    let over = G.zones.length - ZONE_CAP;
    for (const z of G.zones) { if (over <= 0) break; if (z.life > 0 && z.life < 1e6) { z.life = Math.min(z.life, 0.001); over--; } }
  }
  for (const z of G.zones) {
    z.life -= dt; z.tick -= dt;
    if (z.follow) { const q = me(); z.x += (q.x - z.x) * Math.min(1, dt * 3); z.y += (q.y - z.y) * Math.min(1, dt * 3); } // Hotbox
    const doTick = z.tick <= 0;
    if (doTick) z.tick = 0.25;
    if (doTick || z.pull) forNear(z.x, z.y, z.r, e => { // (nothing to do between damage ticks unless it pulls)
      if (z.pull && !e.boss) {
        const dx = z.x - e.x, dy = z.y - e.y, d = Math.hypot(dx, dy) || 1;
        const f = Math.min(d, z.pull * dt);
        e.x += dx / d * f; e.y += dy / d * f;
      }
      if (doTick) { sigZone(z, e); damageEnemy(e, z.dps * 0.25, Object.assign({}, z.src, { noCrit: true, knock: 0, zoneHit: true })); }
    });
    if (z.grow) z.r = Math.min(z.r0 * 1.9, z.r + z.grow * dt);
    if (z.life <= 0 && z.onEnd) z.onEnd(z);
  }
}

function updateTurrets(dt) {
  for (const t of G.turrets) {
    t.life -= dt; t.cd -= dt;
    if (t.cd <= 0) {
      const e = acquire(t.w.dir, t.range, t.x, t.y);
      if (e) {
        t.cd = t.rate;
        const a = Math.atan2(e.y - t.y, e.x - t.x); t.face = a;
        if (t.sibs) spawnProj(t.w, t.x, t.y, a, t.src, { r: 4, speed: 330, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, life: 1.6, dmg: t.dmg, pierce: 0, style: 'sperm', color: '#d0a3ff', bounce: 0, homing: 6, explode: 0, noMods: true });
        else spawnProj(t.w, t.x, t.y, a, t.src, { r: 3.5, speed: 620, vx: Math.cos(a) * 620, vy: Math.sin(a) * 620, life: t.range / 620, dmg: t.dmg, pierce: 0, style: 'bullet', color: t.color || '#ffd60a', bounce: 0, homing: 0, explode: 0, noMods: true });
      }
    }
  }
}

// ---------------------------------------------------------------- player
function updatePlayer(dt) {
  const p = G.player, P = G.P;
  G.inPill = inPill(p.x, p.y);
  // Yeast colonies are sticky: brushing through one slows you.
  G.sticky = false;
  if (G.yeastN) forNear(p.x, p.y, 40, e => { if (!G.sticky && e.def.ai === 'yeast' && !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r + 8) G.sticky = true; });
  const speed = 165 * P.speed * oobSpeed() * // (base 165: was 150; Out of Body: faster)
    (G.inCurrent && P.flow ? 1 + 0.2 * P.flow : 1) * (p.slick && P.skid ? 1 + 0.4 * P.skid : 1) * (G.sprintT > G.t ? 2.3 : 1) * sprintMul() * (p.atpT > 0 ? 1.3 : 1) * (G.inPill ? 0.65 : 1) * (G.sticky ? 0.7 : 1) * (G.lvl ? lvSlow(p.x, p.y) : 1) * G.evm.pspd * (G.slip ? 1.35 : 1) * (G.onIce ? 1.4 : 1) * (G.peek && G.peek.t > G.t && hasSig(G.peek.w, 'hideandseek') ? 1.4 : 1) * genesSpeed() * puSpeed();
  // You grow 1.5% per level (your hitbox grows half as fast).
  p.r = 12 * hpScale(0.5) * puScale() * (G.relics.smallmercies ? 0.75 : 1); // bigger with more max HP (the hitbox grows half as fast as the body)
  let dx = 0, dy = 0;
  if (G.manual) { dx = G.manual.x; dy = G.manual.y; }
  else { const s = autoSteer(); dx = s.x; dy = s.y; }
  let m = Math.hypot(dx, dy);
  if (m > 1) { dx /= m; dy /= m; m = 1; }
  // Swim physics: the head can only turn so fast (traction), thrust drops mid-turn,
  // and sideways momentum drifts off rather than stopping dead.
  if (p.hd == null) p.hd = p.face;
  const trac = P.traction * (p.slick ? OBSTACLES.slick.traction : 1) * (G.onIce ? 0.35 : 1);
  const cur = Math.hypot(p.vx, p.vy);
  let thrust = 0;
  if (m > 0.05) {
    const da = angDiff(Math.atan2(dy, dx), p.hd);
    // Turning circle: the head can only turn as fast as your speed over the tightest arc your traction allows
    // (low traction: a wide sweeping arc; every point in grip tightens it), plus a slow pivot when nearly still
    // that also grows with traction. High traction turns almost on a dime.
    const rMin = SWIM.arc / Math.pow(trac, 1.4), wMax = SWIM.turn * trac * (1 + SWIM.pivot * Math.max(0, trac - 1));
    const turn = clamp(Math.max(cur, speed * 0.25) / rMin, SWIM.pivotMin * trac, wMax) * dt;
    p.hd = Math.atan2(Math.sin(p.hd + clamp(da, -turn, turn)), Math.cos(p.hd + clamp(da, -turn, turn)));
    thrust = m * speed * (0.85 + 0.15 * Math.max(0, Math.cos(da))); // (still swimming along the arc)
  }
  // The tail is the engine. p.stroke: how hard it's beating (1 = normal, near 0 mid-turn, eased to a stop
  // over a few frames); p.kick: the burst of extra-strong strokes the moment a turn ends. The tail you see
  // draws from these too (stepTail). Thrust follows the stroke: through a hard turn you coast on momentum,
  // and those first big strokes after it get you back up to speed fast.
  { const rt = dt / GAME_SPEED; // (real seconds: the easing is in screen frames)
    const rate = Math.abs(angDiff(p.hd, p.hdPrev ?? p.hd)) / Math.max(1e-4, dt); p.hdPrev = p.hd;
    const radius = Math.hypot(p.vx, p.vy) / Math.max(1e-3, rate); // (how tight the turn is: a wide arc keeps the beat, a tight one stops it)
    // Wide arcs: the wag carries on at near full beat. As the arc tightens it drops off slowly at first, then
    // ever faster, to almost nothing on the tightest turns (tight: 0 at radius 70 or more, 1 at 15).
    const tight = clamp((70 - radius) / 55, 0, 1), want = rate < 0.35 ? 1 : Math.max(0.04, 1 - Math.pow(tight, 2.5)), cur = p.stroke ?? 1;
    if (want < cur) p.stroke = lerp(cur, want, 1 - Math.exp(-rt * 25)); // to a stop in about 4 frames
    else p.stroke = lerp(cur, want, 1 - Math.exp(-rt * 12));
    if (p.stroke < 0.45) p.turned = true;
    // The big first strokes: once a hard turn is over AND the tail has swung back behind you, or when you set
    // off from (nearly) still. They fade over about two wags.
    if (Math.hypot(p.vx, p.vy) < speed * 0.25) p.rested = true;
    const behind = p.behind ?? 1;
    if ((p.turned && want > 0.9 && behind > 0.8) || (p.rested && m > 0.05 && behind > 0.8)) { p.kick = 1; p.turned = false; p.rested = false; }
    p.kick = (p.kick || 0) * Math.pow(0.5, rt / 0.15); }
  // (never quite zero: sperm still drift forward on the last stroke). A tail swung round or curled up close to
  // the body pushes little water: thrust needs it stretched out behind you.
  // Only a tail trailing behind you pushes you forward: swung out to the side, or curled up, it can't.
  const reach = (p.ext == null ? 1 : clamp((p.ext - 0.45) / 0.4, 0, 1)) * (p.behind ?? 1);
  const power = (0.55 + 0.45 * p.stroke) * (0.5 + 0.5 * reach); // (turns cost some speed, not most of it)
  const hx = Math.cos(p.hd), hy = Math.sin(p.hd);
  let fwd = p.vx * hx + p.vy * hy, lat = -p.vx * hy + p.vy * hx;
  const want = thrust * power * (1 + 0.12 * p.kick);
  fwd = want >= fwd ? lerp(fwd, want, 1 - Math.pow(0.004, dt * (1 + 4 * p.kick))) // stroke: quick; the big first strokes, much quicker
    : lerp(fwd, want, 1 - Math.pow(0.4, dt)); // no stroke: glide on momentum, slowly bleeding speed
  // Carving: the grip that stops you sliding sideways turns part of that sideways momentum into forward
  // speed, so you come out of a turn still moving instead of having to build up from nothing.
  { const bled = Math.abs(lat) * (1 - Math.exp(-SWIM.grip * trac * dt)); lat *= Math.exp(-SWIM.grip * trac * dt); fwd = Math.min(fwd + bled * 0.55, Math.max(fwd, speed)); } // (never past top speed)
  p.vx = fwd * hx - lat * hy; p.vy = fwd * hy + lat * hx;
  p.x += (p.vx + G.evm.tideX) * dt; p.y += (p.vy + G.evm.tideY) * dt;
  terrainPlayer(p, dt);
  // The arena ends at the edge of the womb's field; the egg itself is solid.
  const cdx = p.x - G.core.x, cdy = p.y - G.core.y, cdist = Math.hypot(cdx, cdy) || 1;
  if (cdist > CORE.arena) { p.x = G.core.x + cdx / cdist * CORE.arena; p.y = G.core.y + cdy / cdist * CORE.arena; }
  if (cdist < CORE.r + p.r) { p.x = G.core.x + cdx / cdist * (CORE.r + p.r); p.y = G.core.y + cdy / cdist * (CORE.r + p.r); }
  if (Math.hypot(p.vx, p.vy) > 20 && !acquire('nearest', 400, p.x, p.y)) p.face = Math.atan2(p.vy, p.vx);
  if (p.iframes > 0) p.iframes -= dt;
  if (p.flash > 0) p.flash -= dt;
  if (P.regen > 0) p.hp = Math.min(P.maxHp, p.hp + P.regen * Math.max(1, P.maxHp / 120) * dt); // regeneration grows with your max HP
}

// Autorun steering (context steering): scores 16 candidate directions plus "stay" by
// goal interest (per movement directive) minus danger from predicted enemy/bullet positions.
const STEER_DIRS = Array.from({ length: 16 }, (_, i) => [Math.cos(i / 16 * TAU), Math.sin(i / 16 * TAU)]);
function autoSteer() {
  const p = G.player, mode = G.moveDir;
  // Goal vector.
  let gx = 0, gy = 0;
  const goal = (tx, ty, w) => { const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy) || 1; gx += dx / d * w; gy += dy / d * w; };
  let bestPick = null, bpd = Infinity;
  for (const u of G.pickups) { const d = Math.hypot(u.x - p.x, u.y - p.y); if (d < bpd) { bpd = d; bestPick = u; } }
  if (bestPick && bpd < (mode === 'collect' ? 900 : 380)) goal(bestPick.x, bestPick.y, mode === 'hold' ? 0.3 : 1.2);
  // COLLECT also goes for Lateral Gene Transfers (mutations), the nearest first, ahead of gems.
  // (A full genome still wants them: they turn into DNA strands.) Close in, it commits: a much stronger pull,
  // little momentum bias and no cap, so the swimmer turns into it instead of circling round it.
  let homing = false;
  if (mode === 'collect' && G.vesicles && G.vesicles.length) {
    let bv = null, bvd = Infinity;
    for (const v of G.vesicles) { const d = Math.hypot(v.x - p.x, v.y - p.y); if (d < bvd) { bvd = d; bv = v; } }
    if (bv) { homing = bvd < 260; goal(bv.x, bv.y, homing ? 4 : 1.6); }
  }
  if (mode === 'collect' && !homing && bestPick && bpd < 200) { homing = true; goal(bestPick.x, bestPick.y, 2.5); }
  if (mode === 'collect' || mode === 'kite' || mode === 'defend') {
    let bg = null, bgd = Infinity;
    for (const g of G.gems) { const d = Math.hypot(g.x - p.x, g.y - p.y); const sc = d / Math.sqrt(g.v); if (sc < bgd && d < (mode === 'collect' ? 800 : 400)) { bgd = sc; bg = g; } }
    if (bg) goal(bg.x, bg.y, mode === 'collect' ? 1.1 : 0.45);
  }
  let cx = 0, cy = 0, cn = 0;
  const near = [];
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - p.x, dy = e.y - p.y, d2 = dx * dx + dy * dy;
    if (d2 < 600 * 600) { cx += e.x; cy += e.y; cn++; }
    if (d2 < 380 * 380 && !e.phased && !e.charmed) near.push(e);
  }
  if (cn > 0) {
    cx /= cn; cy /= cn;
    const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) || 1;
    if (mode === 'orbit') { gx += -dy / d * 1.0 + dx / d * (240 - d) / 200; gy += dx / d * 1.0 + dy / d * (240 - d) / 200; }
    if (mode === 'kite') { gx += dx / d * 0.35 - dy / d * 0.3; gy += dy / d * 0.35 + dx / d * 0.3; }
  }
  if (mode === 'hunt') {
    const w0 = G.weapons.find(Boolean);
    const t = acquire(w0 ? w0.dir : 'nearest', 700, p.x, p.y);
    if (t) {
      const dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d > 130) goal(t.x, t.y, 1.2);
      else {
        // Close enough: sweep past it on whichever side we're already turning, instead of backing off.
        const side = Math.sign(Math.cos(p.hd || 0) * -dy / d + Math.sin(p.hd || 0) * dx / d) || 1;
        gx += -dy / d * side * 1.0 - dx / d * 0.2; gy += dx / d * side * 1.0 - dy / d * 0.2;
      }
    }
  }
  // Run events: chase the Golden Swimmer or the bounty.
  if (mode !== 'hold') for (const e of G.enemies) if (e.evTag && !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 1400) goal(e.x, e.y, e.evTag === 'golden' ? 1.3 : 0.7);
  const core = G.core, cdist = Math.hypot(p.x - core.x, p.y - core.y);
  if (mode === 'defend') {
    // NEST: hold inside the egg's healing glow, drifting around it.
    if (cdist > CORE.sanctuary * 0.8) goal(core.x, core.y, 1.4);
    else { gx += -(p.y - core.y) / (cdist || 1) * 0.5; gy += (p.x - core.x) / (cdist || 1) * 0.5; }
  }
  // The race: head for the egg once it is yours to break, or to stop a rival breaking it.
  // Sperm count 1: head straight into the egg.
  if (G.fertile && mode !== 'hold') goal(core.x, core.y, 1.8);
  // Stay inside the womb.
  if (cdist > CORE.arena - 350) goal(core.x, core.y, (cdist - (CORE.arena - 350)) / 120);
  // Cruise: with nothing much to aim for, keep swimming the way you're heading (with a slow lazy curve)
  // rather than dithering on the spot.
  // Terrain upgrades: drift towards the terrain they use.
  if (mode !== 'hold' && mode !== 'defend' && !homing) { const tl = terrainLure(p); if (tl) goal(tl.x, tl.y, tl.w); }
  // A campaign level: push on along the route to the exit.
  if (G.lvl && mode !== 'hold') { const n = lvPushOn(p); if (n) goal(n.x, n.y, mode === 'hunt' ? 0.8 : 1.2); }
  if (mode !== 'hold' && mode !== 'defend' && !homing) {
    const gl0 = Math.hypot(gx, gy), hd = (p.hd || 0) + Math.sin(G.t * 0.35) * 0.35, cw = Math.max(0, 0.6 - gl0 * 0.4);
    gx += Math.cos(hd) * cw; gy += Math.sin(hd) * cw;
  }
  const gl = Math.hypot(gx, gy);
  const gcap = homing ? 4 : 1.5;
  if (gl > gcap) { gx = gx / gl * gcap; gy = gy / gl * gcap; }
  // Danger sampling.
  const bw = G.warp > 0 ? 0.3 : 1;
  const bul = [];
  for (const b of G.ebul) { const dx = b.x - p.x, dy = b.y - p.y; if (dx * dx + dy * dy < 300 * 300) bul.push(b); }
  const threatR = mode === 'hold' ? 80 : mode === 'hunt' ? 120 : 250;
  const step = 150 * G.P.speed * 0.45;
  let best = -Infinity, bx = 0, by = 0, pick = -1;
  for (let i = -1; i < 16; i++) {
    const dx = i < 0 ? 0 : STEER_DIRS[i][0], dy = i < 0 ? 0 : STEER_DIRS[i][1];
    const qx = p.x + dx * step, qy = p.y + dy * step, mx = p.x + dx * step * 0.5, my = p.y + dy * step * 0.5;
    let danger = 0;
    for (const e of near) {
      // Enemies close in on us, so predict them a little towards the player.
      const ex = e.x + (p.x - e.x) * 0.15, ey = e.y + (p.y - e.y) * 0.15;
      const d = Math.hypot(qx - ex, qy - ey) - e.r - p.r;
      const w = (e.boss ? 3 : e.elite ? 1.6 : 1) * (e.def.ai === 'bomber' || e.def.ai === 'charge' ? 1.8 : 1) * (e.frozen > 0 ? 0.3 : 1);
      if (d < threatR) { const k = (threatR - d) / threatR; danger += w * k * k * 1.2; }
      if (d < 14) danger += 4 * w;
    }
    for (const b of bul) {
      for (let k = 1; k <= 2; k++) {
        const t = 0.225 * k * bw, ax = k === 1 ? mx : qx, ay = k === 1 ? my : qy;
        const d = Math.hypot(b.x + b.vx * t - ax, b.y + b.vy * t - ay) - b.r - p.r * 0.6;
        if (d < 16) danger += 2.5 + (16 - d) * 0.25;
      }
    }
    // The slide itself: look along this heading at three distances (near counts most).
    if (i >= 0) for (const [k, wgt] of [[0.5, 0.6], [1, 1], [2.2, 0.45]]) {
      const tx = p.x + dx * step * k, ty = p.y + dy * step * k;
      danger += steerTerrain(tx, ty, p.r, dx, dy) * wgt + (G.pill && inPill(tx, ty) ? 2.2 * wgt : 0);
    } else danger += steerTerrain(p.x, p.y, p.r, 0, 0) + (G.pill && inPill(p.x, p.y) ? 2.2 : 0);
    // The egg is solid: steer round it (unless it is yours to break).
    if (!G.fertile && i >= 0) for (const [k, wgt] of [[0.5, 1], [1, 0.8], [2.2, 0.35]]) {
      const d = Math.hypot(p.x + dx * step * k - core.x, p.y + dy * step * k - core.y) - CORE.r - p.r;
      if (d < 40) danger += (d < 0 ? 3 : 1.5 * (40 - d) / 40) * wgt;
    }
    if (G.hazards.length || G.boss) danger += hazardDanger(qx, qy, p.r) + hazardDanger(mx, my, p.r) * 0.5;
    // Turning is slow, so mildly prefer directions close to where the head already points.
    // Forward momentum: favour the heading and the last pick (so it doesn't flip between near-equal
    // options), and only stop dead when holding.
    const mom = mode === 'hold' ? 0.18 : homing ? 0.08 : 0.42;
    const interest = dx * gx + dy * gy + (i < 0 ? 0 : mom * (Math.cos(p.hd || 0) * dx + Math.sin(p.hd || 0) * dy) / Math.max(0.6, G.P.traction)) + (i === G.steerPick ? 0.12 : 0);
    const score = interest - danger + (i < 0 ? (mode === 'hold' ? 0.4 : -0.35) : 0);
    if (score > best) { best = score; bx = dx; by = dy; pick = i; }
  }
  G.steerPick = pick;
  // Pinned against a wall (trying to swim but barely moving)? Slide along it for a moment.
  const spd = Math.hypot(p.vx || 0, p.vy || 0);
  G.stuckT = (bx || by) && spd < 25 ? (G.stuckT || 0) + 1 / 30 : 0;
  if (G.stuckT > 0.5) { G.slideT = G.t + 1; G.slideSide = G.slideSide || (Math.random() < 0.5 ? 1 : -1); G.stuckT = 0; }
  if (G.slideT > G.t) { const tx = -by * G.slideSide, ty = bx * G.slideSide; bx = bx * 0.3 + tx * 0.9; by = by * 0.3 + ty * 0.9; }
  else if (!(G.slideT > G.t - 3)) G.slideSide = 0;
  // Smooth to avoid jitter.
  const sm = G.steer || (G.steer = { x: 0, y: 0 });
  sm.x = lerp(sm.x, bx, 0.35); sm.y = lerp(sm.y, by, 0.35);
  return { x: sm.x, y: sm.y };
}

// ---------------------------------------------------------------- pickups
function updatePickups(dt) {
  const p = G.player, P = G.P;
  const magR = 105 * P.magnet;
  for (const g of G.gems) {
    if (g.dead) continue;
    const dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy) || 1;
    if (!g.mag && d < magR) g.mag = true;
    // Loose gems slowly drift towards the player so kiting doesn't strand XP.
    if (!g.mag && d < 650) { const k = Math.min(d, 85 * dt); g.x += dx / d * k; g.y += dy / d * k; }
    if (g.mag) {
      const sp = 380 + (g.sp = (g.sp || 0) + dt * 600);
      g.x += dx / d * Math.min(d, sp * dt); g.y += dy / d * Math.min(d, sp * dt);
      if (d < p.r + 8) { g.dead = true; if (g.kind === 's') { G.scrap += g.v; sfx('gem'); } else gainXp(g.v); }
    }
  }
  for (const u of G.pickups) {
    if (u.dead) continue;
    u.life -= dt; u.bob += dt * 4;
    if (u.life <= 0) { u.dead = true; continue; }
    const dx = p.x - u.x, dy = p.y - u.y, d = Math.hypot(dx, dy) || 1;
    if (d < 55) { u.x += dx / d * 200 * dt; u.y += dy / d * 200 * dt; }
    if (d < p.r + 14) { u.dead = true; applyPickup(u.type, u.src); }
  }
}

function applyPickup(type, src) {
  const p = G.player, P = G.P;
  if (G.mutT) G.mutT.prevHp = p.hp;
  G.stats.pickups = (G.stats.pickups || 0) + 1;
  sfx('pickup');
  banner(POWERUPS[type].name, type === 'chest' ? PAL.reward : PAL.pickup);
  if (puApply(type)) { genesPickup(type); return; }
  switch (type) {
    case 'magnet': for (const g of G.gems) g.mag = true; break;
    case 'nuke':
      ring(p.x, p.y, 600, '#ff595e', 0.7, 10);
      cam.shake = 16;
      for (const e of G.enemies) {
        if (e.dead || Math.hypot(e.x - p.x, e.y - p.y) > 650) continue;
        if (e.boss) damageEnemy(e, e.maxHp * 0.22, { noCrit: true, dot: true, wname: 'Nuke' });
        else if (e.rival) damageEnemy(e, e.maxHp * 0.22, { noCrit: true, dot: true, wname: 'Nuke' }); // rivals and the Final Five just take a big hit
        else { e.hp = 0; killEnemy(e, {}); }
      }
      G.ebul.length = 0;
      break;
    case 'rage': G.rage = 12; break;
    case 'heal': healPlayer(P.maxHp * 0.5 * heatHeal()); break;
    case 'shield': G.shieldT = 7.5; break;
    case 'freeze': for (const e of G.enemies) e.frozen = e.boss ? 2.2 : 6; break;
    case 'chest': G.lootQueue.push({ kind: 'chest', src }); break;
  }
  genesPickup(type);
}

const XP_PACE = 1.1; // 10-minute runs: you grow faster (enemies keep up if you get ahead, see levelsAhead)
function gainXp(v) {
  // XP bonuses from upgrades count half (they stacked up to x1.9 and runs finished 10-30 levels ahead of the curve).
  const xpUp = G.P.xp > 1 ? 1 + (G.P.xp - 1) * 0.5 : G.P.xp;
  const xk = XP_PACE * xpUp * G.evm.xp * (G.inPill ? 0.5 : 1) * puXp();
  G.xp += v * xk;
  G.stats.xpRaw = (G.stats.xpRaw || 0) + v; G.stats.xpGot = (G.stats.xpGot || 0) + v * xk; // run-log telemetry // the morning-after pill halves growth
  sfx('gem');
  const lv0 = G.level;
  while (G.xp >= G.xpNeed) {
    G.xp -= G.xpNeed;
    G.level++;
    G.xpNeed = xpNeed(G.level);
      // A box every level to Lv 8, every second level to Lv 24, then every third.
    if (G.level <= 8 || (G.level <= 24 ? G.level % 2 === 0 : G.level % 3 === 0)) G.lootQueue.push({ kind: 'level' });
    genesLevel(G.level); // a chance to splice in another Epigenetic Profile
    rebornLevel(G.level); // (Prawn Again: memories of a past life)
    redLevel(); // (the Redtail: a bane every level)
    evolveCheck(G.level); // (your Primary Sequence evolves at Lv 5, 10, 20 and 50: evolve.js)
    // Weapon drafts: a new weapon mount at every SLOT_LEVELS level.
    if (SLOT_LEVELS.includes(G.level) && G.weapons.length < MAX_WEAPONS + (G.comboMounts || 0)) {
      G.weapons.push(null);
      G.lootQueue.push({ kind: 'slot' });
      banner('WEAPON DRAFT!', PAL.upgrade);
      sysLine('slot', true); achieve('slot');
    }
  }
  if (G.level > lv0 && G.player) { levelJuice(G.level); rrelicLevel(); }
}

// ---------------------------------------------------------------- the egg (win condition)
// At EGG.level the egg's membrane becomes a target. Break it and you're born.
function openEgg(by) {
  if (G.eggE && !G.eggE.dead) return announceEgg(by);
  const def = { id: 'egg', name: "THE EGG'S MEMBRANE", hp: 1, speed: 0, armour: EGG.armour, r: CORE.r, dmg: 0, xp: 0, color: '#ffd6e8', shape: 'none', patterns: [] };
  const e = makeEnemy(def, G.core.x, G.core.y);
  e.hp = e.maxHp = EGG.hpBase * hpNow();
  e.boss = true; e.egg = true; e.shootCd = 2; e.stT = 5;
  G.enemies.push(e);
  G.eggE = e;
  announceEgg(by);
}
// by: the rival that forced it open, or nothing when you reached EGG.level yourself.
function announceEgg(by) {
  if (by) {
    if (!G.eggE.openedBy) { G.eggE.openedBy = by.name; banner(by.name.toUpperCase() + ' IS BREAKING INTO THE EGG!', '#ff4d6d'); cam.shake = 10; }
    return;
  }
  if (G.eggAnnounced) return;
  G.eggAnnounced = true; G.eggAt = G.t;
  banner('THE EGG IS READY: BREAK IN!', '#ffd6e8');
  sysLine('eggReady', true); achieve('eggready');
  cam.shake = 10; vibrate(150); sfx('boss');
}
function eggAI(e, dt) {
  e.x = G.core.x; e.y = G.core.y; e.kx = e.ky = 0; e.frozen = 0;
  // The membrane defends itself: rings of bullets, and immune cells budding off its surface.
  e.shootCd -= dt;
  const pd = Math.hypot(me().x - e.x, me().y - e.y);
  if (pd > 1100) return; // it saves its temper for whoever is close enough to see it
  if (e.shootCd <= 0) {
    // Weaker membrane = angrier egg: faster rings as it cracks, plus volleys aimed at you.
    const rage = 1 - e.hp / e.maxHp;
    e.shootCd = 1.7 - rage * 0.7; e.spin += 0.3;
    const n = 28, bd = 10 * dmgNow(), p = me();
    for (let i = 0; i < n; i++) eBullet(e.x + Math.cos(e.spin + i / n * TAU) * e.r, e.y + Math.sin(e.spin + i / n * TAU) * e.r, e.spin + i / n * TAU, 125, bd, 6, '#ff8fb8');
    const aim = ((G.toy || G.decoy) && toyAim(e)) ?? Math.atan2(p.y - e.y, p.x - e.x);
    for (let i = -2; i <= 2; i++) eBullet(e.x + Math.cos(aim) * e.r, e.y + Math.sin(aim) * e.r, aim + i * 0.12, 200, bd * 1.3, 5, '#ffffff');
  }
  e.stT -= dt;
  if (e.stT <= 0) {
    e.stT = 5;
    const pool = [ENEMIES.brute, ENEMIES.spitter, ENEMIES.lancer, ENEMIES.bulwark, ENEMIES.warlock];
    for (let i = 0; i < 5 && G.enemies.length < CAPS.enemies; i++) {
      const a = Math.random() * TAU;
      G.enemies.push(makeEnemy(pick(pool), e.x + Math.cos(a) * (e.r + 30), e.y + Math.sin(a) * (e.r + 30), { elite: i === 0 }));
    }
    ring(e.x, e.y, e.r + 30, '#ff8fb8', 0.5, 5);
  }
}
function victory(at) {
  if (G.state === 'finale' || G.state === 'won') return;
  G.banner = null;
  achieve('born');
  sysLine('born', true);
  vibrate(60);
  startFinale('win', at); // (the egg cracks and hatches, then the end screen)
}

// ---------------------------------------------------------------- main update
function update(dt) {
  G.t += dt; G.realT += dt; G.frameN = (G.frameN || 0) + 1; updateSevered(dt); updatePill(dt); updateYeast(dt); gemMerge(); stamTick(dt); armourRegen(dt);
  // Balancing timeline for the run log: level and HP% at every minute.
  if (G.t >= (G.nextLogT || 60)) { G.nextLogT = (G.nextLogT || 60) + 60; (G.tl || (G.tl = [])).push(G.level + '/' + Math.round(G.player.hp / G.P.maxHp * 100)); (G.perfTl || (G.perfTl = [])).push(perfMinute()); (G.fpsTl || (G.fpsTl = [])).push(Math.round(FPS.runN ? FPS.runSum / FPS.runN : FPS.v) + '/' + Math.round(FPS.runLow < 999 ? FPS.runLow : FPS.low) + (QUAL.lv ? 'q' + (4 - QUAL.lv) : '')); FPS.runN = 0; FPS.runSum = 0; FPS.runLow = 999; }
  if (G.t >= (G.nextLiveT || 30)) { G.nextLiveT = G.t + 20; liveSave(G); }
  const p = G.player;
  gridBuild();
  G.crowdT -= dt;
  if (G.crowdT <= 0) {
    G.crowdT = 0.25;
    for (const e of G.enemies) { if (e.dead) continue; let n = 0; forNear(e.x, e.y, 70, () => { n++; }); e.crowd = n + (e.boss ? 5 : 0); }
  }
  if (G.warp > 0) { G.warp -= dt; if (G.spells.some(x => spellFork(x, 'b') && x.id === 'warp')) healPlayer(G.P.maxHp * 0.03 * dt, true); } // Power Nap
  const lsCap = (G.relics.transfusion ? 9 : 3) * Math.max(1, G.P.maxHp / 120); // the lifesteal pool grows with your max HP
  G.lsBudget = Math.min(lsCap, (G.lsBudget || 0) + dt * lsCap); // lifesteal heals at most ~3 HP/s
  if (G.rage > 0) { G.rage -= dt; if (G.rage <= 0) startClarity(); } // (Oxytocin wears off: Post-Nut Clarity, silly.js)
  if (G.shieldT > 0) G.shieldT -= dt;
  if (G.barrier > 0) G.barrier -= dt;
  updatePlayer(dt);
  updateCrossfire();
  for (const w of G.weapons) if (w) updateWeapon(w, dt);
  sigTick(dt);
  comboTick(dt);
  overkillTick(dt);
  puTick(dt); redTick(dt);
  rebornTick(dt);
  introTick(); // first sightings
  tutTick(); // first-time tutorial cards (tutorial.js)
  boonTick(dt);
  updateTethers(dt);
  meleeTick(dt);
  updateShow(dt);
  updateSpells(dt);
  updateProjectiles(dt * PROJ_K);
  updateZones(dt);
  updateTurrets(dt);
  for (const tm of G.timers) { tm.t -= dt; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(); } }
  updateEnemies(dt);
  updateTerrain(dt);
  updateCore(dt);
  updateBosses(dt);
  updateEvents(dt);
  if (G.evNote) { G.evNote.t -= dt; if (G.evNote.t <= 0) G.evNote = null; }
  updateChrono(dt);
  // Enemy bullets.
  const bw0 = G.warp > 0 ? 0.3 : 1;
  for (const b of G.ebul) {
    if (b.dead) continue;
    const bw = bw0 * (b.slowT > G.realT ? 0.35 : 1);
    b.x += b.vx * dt * bw * PROJ_K; b.y += b.vy * dt * bw * PROJ_K; b.life -= dt * PROJ_K;
    if (b.life <= 0) { b.dead = true; continue; }
    if (terrainShot(b, true, dt)) continue;
    const dx = b.x - p.x, dy = b.y - p.y, d2 = dx * dx + dy * dy;
    if (G.barrier > 0 && d2 < G.barrierR * G.barrierR) {
      b.dead = true;
      // Reflect as a player projectile.
      const bs = G.spells.find(w => w && w.id === 'barrier');
      if (bs && G.proj.length < CAPS.proj) {
        const a = Math.atan2(dy, dx);
        G.proj.push({ x: b.x, y: b.y, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, speed: 420, r: 5, dmg: G.barrierDmg, pierce: 1, life: 1, max: 1, w: bs,
          src: { elem: 'arcane', wname: 'Latex Barrier' }, color: '#48cae4', style: 'bullet', explode: 0, homing: 0, bounce: 0, boomerang: 0, chainHit: 0, aura: 0, pull: 0, hits: null, tick: 0, dead: false });
      }
      continue;
    }
    const rr = b.r + p.r * 0.6;
    if (d2 < rr * rr) { b.dead = true; if (!(p.iframes > 0) && mirrorWomb(b)) continue; hurtPlayer(b.dmg, b.from, b.owner, 'bullets'); }
  }
  updatePickups(dt);
  updateAmbient(dt);
  // Director.
  // Dense swarms (each monster is weaker to match: see enemyScale).
  const T = PT(), maxAlive = Math.min(CAPS.enemies - 30, (24 + T * 0.5) * SPAWN_K);
  const rate = Math.min(9, (0.55 + T / 90 + Math.pow(T / 300, 2) * 0.9) * 1.7) * PACE * heatSpawn() * SPAWN_K;
  const hostile = G.enemies.reduce((n, e) => n + (e.charmed || e.rival || e.egg ? 0 : 1), 0);
  if (G.debug) debugTick(); // the Lab Bench: only what you send in
  else if (G.lvl) lvTick(dt, maxAlive, hostile); // a campaign level: its own director (levels.js)
  else if (G.wave) { waveSpawn(rate * G.P.spawnMult, dt, maxAlive, hostile); waveTick(dt); } // the Petri Dish: a set number per wave
  else {
    G.spawnAcc += rate * dt * G.P.spawnMult * (G.showdown ? 0.35 : 1); // quieter while the Final Five fight you
    while (G.spawnAcc >= 1) { G.spawnAcc--; if (hostile < maxAlive) spawnRandom(); }
  }
  spotTick();
  if (G.t >= G.nextWave && !G.debug) { if (spotOn()) G.nextWave += 6; else { G.nextWave += 30; waveEvent(); } } // (scripted waves wait for a spotlight to finish)
  updateRivals(dt);
  if (!G.wave && !G.lvl && !G.debug) updateShowdown();
  if (PT() >= SURGE_T && !G.surge) { achieve('surge'); sysLine('surge'); G.surge = true; banner('STORM SURGE: THE HOST FIGHTS BACK', '#ff3df2'); sfx('boss'); vibrate(200); }
  // (Never two bosses at once: the next one waits until the current one is dead, then 25s more; bosses.js sets that.)
  if (G.t >= G.nextBoss && !(G.boss && !G.boss.dead)) { G.nextBoss += G.bossCount >= 3 ? BOSS_INTERVAL * 2 : BOSS_INTERVAL; spawnBoss(); }
  // FX.
  G.hitFxN = 0;
  if (G.flashT > 0) G.flashT -= dt;
  for (const q of G.parts) {
    q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
    const drag = q.k === 'spark' ? 0.86 : q.k === 'smoke' ? 0.9 : 0.92; q.vx *= drag; q.vy *= drag;
    if (q.k === 'ember' || q.k === 'bubble' || q.k === 'plus') q.vy -= 60 * dt; // they rise
    if (q.k === 'smoke') q.size += 30 * dt;
    if (q.rot != null) q.rot += (q.vr || 0) * dt;
  }
  for (const f of G.fx) f.life -= dt;
  for (const l of G.lights) l.life -= dt;
  for (const d of G.decals) d.life -= dt;
  for (const t of G.texts) { t.life -= dt; t.y -= (t.big ? 18 : 32) * dt; }
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  compact();
  // Camera.
  cam.x = lerp(cam.x, p.x, 1 - Math.pow(0.002, dt)); cam.y = lerp(cam.y, p.y, 1 - Math.pow(0.002, dt));
  cam.shake = Math.max(0, cam.shake - dt * 30);
}

function compactArr(a, alive) { let j = 0; for (let i = 0; i < a.length; i++) if (alive(a[i])) a[j++] = a[i]; a.length = j; }
function compact() {
  compactArr(G.enemies, e => !e.dead);
  compactArr(G.proj, x => !x.dead);
  compactArr(G.ebul, x => !x.dead);
  compactArr(G.gems, x => !x.dead);
  compactArr(G.pickups, x => !x.dead);
  compactArr(G.zones, x => x.life > 0);
  // Hard cap on ground effects (puddles, clouds, patches): past it, the oldest go first. Busy late runs
  // stacked up to 270 of them, and the worst frames came with them.
  if (G.zones.length > CAPS.zones) G.zones.splice(0, G.zones.length - CAPS.zones);
  compactArr(G.turrets, x => x.life > 0);
  compactArr(G.parts, x => x.life > 0);
  compactArr(G.fx, x => x.life > 0);
  compactArr(G.texts, x => x.life > 0);
  compactArr(G.timers, x => !x.done);
  compactArr(G.lights, x => x.life > 0);
  compactArr(G.decals, x => x.life > 0);
  compactArr(G.tethers, x => x.life > 0);
}

function gameOver() {
  if (G.state === 'finale' || G.state === 'over') return;
  sysLine('death', true);
  G.banner = null;
  sfx('death');
  vibrate(300);
  startFinale('death'); // (slow motion on whatever got you, then the end screen)
}

// ---------------------------------------------------------------- input
const INPUT = { active: false, id: null, ox: 0, oy: 0, keys: {} };
// Two fingers pinch to zoom; one finger steers.
const PTRS = new Map();
let PINCH = null;
const pinchDist = () => { const [a, b] = [...PTRS.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
cv.addEventListener('pointerdown', ev => {
  // A new first finger means a new gesture: forget any finger whose lift we never saw (e.g. one that
  // skipped the intro and was lifted over the loot screen).
  if (ev.isPrimary) { PTRS.clear(); PINCH = null; }
  if (!G || (G.state !== 'play' && G.state !== 'pause')) return;
  PTRS.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
  if (PTRS.size >= 2) {
    PINCH = { d0: pinchDist(), z0: ZOOM.z };
    INPUT.active = false; INPUT.id = null; if (G) G.manual = null;
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
    return;
  }
  if (PINCH) return;
  if (!G || G.state !== 'play') return;
  // A tap on a buff or debuff chip: pause and show them all.
  if (UI.chipRects && UI.chipRects.some(r => ev.clientX >= r.x - 6 && ev.clientX <= r.x + r.w + 6 && ev.clientY >= r.y - 4 && ev.clientY <= r.y + r.h + 4)) { PTRS.delete(ev.pointerId); UI.openStatusPanel(); return; }
  INPUT.active = true; INPUT.id = ev.pointerId; INPUT.ox = ev.clientX; INPUT.oy = ev.clientY;
  INPUT.sx = ev.clientX; INPUT.sy = ev.clientY; INPUT.t0 = performance.now(); INPUT.moved = false;
  G.manual = { x: 0, y: 0 };
  try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
});
cv.addEventListener('pointermove', ev => {
  if (PTRS.has(ev.pointerId)) PTRS.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (PINCH && PTRS.size >= 2) { setZoom(PINCH.z0 * pinchDist() / PINCH.d0); return; }
  if (!INPUT.active || ev.pointerId !== INPUT.id || !G.manual) return;
  if (Math.hypot(ev.clientX - INPUT.sx, ev.clientY - INPUT.sy) > 12) INPUT.moved = true;
  let dx = ev.clientX - INPUT.ox, dy = ev.clientY - INPUT.oy;
  const d = Math.hypot(dx, dy);
  // The stick reads full speed at 50px; pushing on past it (up to 70px) is a sprint (stamina.js).
  if (d > STAM.stick) { INPUT.ox += dx / d * (d - STAM.stick); INPUT.oy += dy / d * (d - STAM.stick); dx = ev.clientX - INPUT.ox; dy = ev.clientY - INPUT.oy; }
  const dd = Math.hypot(dx, dy) || 1, k = Math.min(dd, 50) / dd;
  G.manual.x = dx * k / 50; G.manual.y = dy * k / 50; G.manual.sprint = dd > STAM.push;
});
const endTouch = ev => {
  PTRS.delete(ev.pointerId);
  if (PINCH && PTRS.size < 2) { PINCH = null; setZoom(ZOOM.z, true); }
  if (ev.pointerId !== INPUT.id) return;
  INPUT.active = false; INPUT.id = null;
  if (!G) return;
  G.manual = null;
};
cv.addEventListener('pointerup', endTouch);
cv.addEventListener('pointercancel', endTouch);
// Fingers lifted over an overlay still count as lifted.
window.addEventListener('pointerup', ev => { if (ev.target !== cv) PTRS.delete(ev.pointerId); });
window.addEventListener('pointercancel', ev => { if (ev.target !== cv) PTRS.delete(ev.pointerId); });
let wheelT = 0;
cv.addEventListener('wheel', ev => {
  if (!G) return;
  ev.preventDefault(); setZoom(ZOOM.z * Math.exp(-ev.deltaY * 0.0015));
  clearTimeout(wheelT); wheelT = setTimeout(() => setZoom(ZOOM.z, true), 180); // settle click and save once the wheel stops
}, { passive: false });
window.addEventListener('keydown', ev => {
  INPUT.keys[ev.key.toLowerCase()] = true;
  if (ev.key === 'Escape' && typeof UI !== 'undefined') UI.togglePause();
});
window.addEventListener('keyup', ev => { INPUT.keys[ev.key.toLowerCase()] = false; });
function keyboardSteer() {
  if (!G || INPUT.active) return;
  const k = INPUT.keys;
  const x = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0), y = (k.s || k.arrowdown ? 1 : 0) - (k.w || k.arrowup ? 1 : 0);
  G.manual = x || y ? { x, y, sprint: !!k.shift } : null; // (Shift sprints)
}

// ---------------------------------------------------------------- audio
const AUDIO = { ctx: null, on: true, last: {} };
try { AUDIO.on = localStorage.getItem('sd_sound') !== '0'; } catch (e) { /* storage unavailable */ }
function initAudio() {
  if (AUDIO.ctx) { if (AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume(); return; }
  try { AUDIO.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AUDIO.ctx = null; }
}
// (Sound effects and music: audio.js.)
// Focus knob: a filtered noise click with a tiny resonant body. dir > 0 zooming in (brighter), < 0 out;
// heavy = the settling click when you let go.
function knobClick(dir, heavy) {
  if (!AUDIO.on || !AUDIO.ctx || AUDIO.ctx.state !== 'running') return;
  const ac = AUDIO.ctx, now = ac.currentTime;
  if (!AUDIO.noise) {
    const b = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.05), ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    AUDIO.noise = b;
  }
  const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = AUDIO.noise; src.playbackRate.value = 0.9 + Math.random() * 0.2;
  bp.type = 'bandpass'; bp.Q.value = heavy ? 4 : 7; bp.frequency.value = (heavy ? 1500 : dir > 0 ? 3600 : 2600) * (0.95 + Math.random() * 0.1);
  g.gain.setValueAtTime(heavy ? 0.22 : 0.12, now); g.gain.exponentialRampToValueAtTime(0.0001, now + (heavy ? 0.06 : 0.025));
  src.connect(bp); bp.connect(g); g.connect(ac.destination);
  src.start(now); src.stop(now + 0.07);
  // The knob's little metallic ring.
  const o = ac.createOscillator(), og = ac.createGain();
  o.type = 'sine'; o.frequency.value = heavy ? 420 : dir > 0 ? 1250 : 980;
  og.gain.setValueAtTime(heavy ? 0.05 : 0.018, now); og.gain.exponentialRampToValueAtTime(0.0001, now + (heavy ? 0.09 : 0.04));
  o.connect(og); og.connect(ac.destination); o.start(now); o.stop(now + 0.1);
}
// Shared little synth helpers for one-off sound designs (loot box).
function sndNoiseBuf() {
  const ac = AUDIO.ctx;
  if (!AUDIO.noise1 || AUDIO.noise1.sampleRate !== ac.sampleRate) {
    const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    AUDIO.noise1 = b;
  }
  return AUDIO.noise1;
}
function sndNoise(t, dur, type, f0, f1, q, vol) {
  const ac = AUDIO.ctx, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = sndNoiseBuf(); f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.01, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(ac.destination); src.start(t); src.stop(t + dur + 0.05);
}
function sndTone(t, f0, f1, dur, vol, type) {
  const ac = AUDIO.ctx, o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
// DNA strand (loot): wriggles, then unzips rung by rung (0.36 s, with the CSS animation), then
// a glassy chime that gets longer and brighter with the best rarity inside (Bronze 2 notes up to Legendary 5
// plus a shimmer), and a soft swish as each card flies in. Branch choices ring softer; boss boxes thud deeper;
// a cursed card adds a sour low note.
function lootSound(kind, best, cursed, cards) {
  if (!AUDIO.on || !AUDIO.ctx || AUDIO.ctx.state !== 'running') return;
  const t = AUDIO.ctx.currentTime + 0.01, deep = kind === 'boss' ? 0.7 : 1;
  // The strand wriggles (soft squelchy whooshes), then unzips: a fast run of tiny snaps as each rung breaks.
  [0.02, 0.13, 0.24].forEach((d, i) => sndNoise(t + d, 0.1, 'bandpass', 500 * deep, 1400 * deep, 2, 0.1 - i * 0.02));
  for (let i = 0; i < 14; i++) { const at = t + 0.36 + i * 0.022; sndNoise(at, 0.02, 'highpass', 3200 + i * 120, 3200 + i * 120, 0.8, 0.08); sndTone(at, 1800 + i * 90, 1800 + i * 90, 0.02, 0.012, 'square'); }
  sndNoise(t + 0.45, 0.3, 'bandpass', 900, 3000, 1.2, 0.05);
  const notes = [1047, 1319, 1568, 1760, 2093], n = 2 + Math.min(3, Math.floor(best * 0.75)), soft = kind === 'branch' ? 0.6 : 1;
  for (let i = 0; i < n; i++) {
    const at = t + 0.46 + i * 0.075, f = notes[i] * (kind === 'branch' ? 0.75 : 1);
    sndTone(at, f, f, 0.5 + i * 0.05, 0.05 * soft, 'sine');
    sndTone(at, f * 2.76, f * 2.76, 0.18, 0.012 * soft, 'sine');
  }
  if (best >= 4) sndNoise(t + 0.5, 1.1, 'highpass', 6000, 9000, 0.5, 0.03);
  if (best >= 5) { for (let i = 0; i < 6; i++) sndTone(t + 0.9 + i * 0.06, 2093 * (1 + i * 0.12), 2093 * (1 + i * 0.12), 0.6, 0.03, 'sine'); sndTone(t + 0.85, 130, 65, 1.2, 0.08, 'triangle'); }
  if (cursed) sndTone(t + 0.55, 98, 92, 0.7, 0.05, 'sawtooth');
  for (let i = 0; i < cards; i++) sndNoise(t + 0.45 + i * 0.12, 0.16, 'bandpass', 700, 2200, 1.2, 0.035);
}
function vibrate(ms) { if (typeof SET !== 'undefined' && SET.vibe === false) return; try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* unsupported */ } }

// ---------------------------------------------------------------- loop
// The whole game runs at 70% speed: everything moves, fires and spawns 30% slower than real time.
// Game pace: 77% of the old 0.7. Projectiles (yours and enemy bullets) run on a slightly faster clock, so
// they fly at 85% of their old speed (same range, they just get there sooner).
const GAME_SPEED = 0.7 * 0.77, PROJ_K = 0.85 / 0.77;
// Settings > Game speed (x0.5 to x2) scales all of that.
const SPEED_OPTS = [0.5, 0.75, 1, 1.5, 2];
const gameSpeed = () => (typeof SET !== 'undefined' && SPEED_OPTS.includes(SET.speed) ? SET.speed : 1);
let lastTs = 0;
// Frame-rate meter: frames counted over each real second (v), plus the slowest frame in that second as an FPS
// (low), so hitches show up instead of being smoothed away. The run log keeps a per-minute average and low.
const FPS = { v: 60, low: 60, n: 0, acc: 0, worst: 0, runN: 0, runSum: 0, runLow: 999 };
function fpsTick(raw) {
  if (!(raw > 0) || raw > 2) return;
  FPS.n++; FPS.acc += raw; FPS.worst = Math.max(FPS.worst, raw);
  if (FPS.acc >= 1) {
    FPS.v = FPS.n / FPS.acc; FPS.low = 1 / FPS.worst; FPS.n = 0; FPS.acc = 0; FPS.worst = 0;
    if (G && G.state === 'play') { FPS.runN++; FPS.runSum += FPS.v; FPS.runLow = Math.min(FPS.runLow, FPS.low); }
  }
}
let frameFrozen = false;
// Frame cap (Settings > Frame rate, 60 by default): on a 90 or 120 Hz screen the game skips display frames
// to draw about 60 a second, half the work, so the phone runs cooler and has headroom for busy moments.
let capNext = 0;
// Run-log telemetry: the worst frame of each minute, split into update and draw time, with what was on screen.
const PERF = { w: null, long: 0 };
function perfNote(gap, u, r) {
  if (!G || G.state !== 'play') return;
  if (gap > 50) PERF.long++;
  if (PERF.w && gap <= PERF.w.gap) return;
  PERF.w = { gap, u, r, e: G.enemies.length, b: G.ebul.length, s: G.proj.length, p: G.parts.length, z: G.zones.length, q: QUAL.lv };
}
function perfMinute() {
  const W2 = PERF.w, out = W2 ? `${Math.round(W2.gap)}(u${Math.round(W2.u)} d${Math.round(W2.r)}) e${W2.e} b${W2.b} s${W2.s} p${W2.p} z${W2.z} L${PERF.long}` : '-';
  PERF.w = null; PERF.long = 0;
  return out;
}
// Device tag for the run log, so logs from different phones can be told apart: screen size (CSS px), pixel
// ratio, the screen's refresh rate (measured from the display's own frame timing, before the cap), cores, memory.
const DEVICE = { iv: [], last: 0 };
function deviceTag() {
  const iv = DEVICE.iv.slice().sort((a, b) => a - b), med = iv.length ? iv[iv.length >> 1] : 0;
  const hz = med ? [60, 72, 90, 120, 144].reduce((a, b) => Math.abs(1000 / med - b) < Math.abs(1000 / med - a) ? b : a) : '?';
  const n = navigator || {}, sc = typeof screen !== 'undefined' ? screen : { width: W, height: H };
  return `${sc.width}x${sc.height} dpr${+(window.devicePixelRatio || 1).toFixed(2)} ${hz}Hz ${n.hardwareConcurrency || '?'}cpu ${n.deviceMemory ? n.deviceMemory + 'GB' : '?GB'}`;
}
function frame(ts) {
  // Schedule the next frame first, and keep each stage separate, so one error can never freeze the game.
  requestAnimationFrame(frame);
  if (DEVICE.last) { const g = ts - DEVICE.last; if (g > 3 && g < 40) { DEVICE.iv.push(g); if (DEVICE.iv.length > 120) DEVICE.iv.shift(); } }
  DEVICE.last = ts;
  const cap = typeof SET !== 'undefined' && SET.fpsCap ? 1000 / SET.fpsCap : 0;
  if (cap && lastTs) {
    if (ts < capNext - 2) return; // not time for a frame yet
    capNext = Math.max(capNext + cap, ts - cap);
  }
  const raw = (ts - lastTs) / 1000, t0 = performance.now();
  if (raw > 0.004) fpsTick(raw); // (a just-reset clock gives tiny or negative gaps: skip them)
  const dt = clamp(raw || 0, 0, 1 / 30);
  lastTs = ts;
  if (G && G.state === 'play' && raw > 0.004 && raw < 0.5) qualTick(raw);
  safely('update', () => {
    if (G && G.state === 'play') {
      keyboardSteer();
      // A boss death plays out in slow motion before its relic box opens.
      // Hit-stop: a big moment freezes the slide for a few hundredths of a second (juice.js).
      if (G.lootHold > 0) G.lootHold -= dt;
      if (G.hitStop > 0) G.hitStop -= dt;
      else if (G.slowmo > 0) { G.slowmo -= dt; update(dt * 0.3 * GAME_SPEED * gameSpeed()); }
      else if (G.lootQueue.length && typeof UI !== 'undefined' && !waveHoldsLoot() && !(G.lootHold > 0) && !G.tutNow) { if (!tutBeforeLoot(G.lootQueue[0])) UI.openLoot(G.lootQueue.shift()); }
      else if (!(G.debug && G.debug.freeze)) { update(dt * GAME_SPEED * gameSpeed()); const su = G.spdUse || (G.spdUse = {}); su[gameSpeed()] = (su[gameSpeed()] || 0) + dt; } // (time at each speed, for the run log)
    } else if (G && G.state === 'bossIntro') updateBossIntro(dt);
    else if (G && G.state === 'rewind') updateRewind(dt);
    else if (G && G.state === 'intro') updateIntro(dt);
    else if (G && G.state === 'finale') updateFinale(dt);
  });
  const t1 = performance.now();
  // While a menu (weapon draft, loot, pause...) covers the paused game, the world can't change: draw it once,
  // then leave the canvas alone so the menu and its previews get the whole frame budget.
  const covered = G && G.state !== 'play' && G.state !== 'intro' && G.state !== 'rewind' && G.state !== 'bossIntro' && G.state !== 'finale' && typeof UI !== 'undefined' && UI.menuOn();
  if (!covered || !frameFrozen) safely('render', render);
  frameFrozen = !!covered;
  // (A frame's gap mostly holds the previous frame's work, so the gap is paired with that frame's update and draw times.)
  if (raw > 0.004 && raw < 2) perfNote(raw * 1000, PERF.lu || 0, PERF.ld || 0);
  PERF.lu = t1 - t0; PERF.ld = performance.now() - t1;
  if (typeof UI !== 'undefined') safely('ui', () => UI.tick(dt));
  if (typeof musicTick === 'function') safely('music', () => musicTick(dt));
}
// Errors are shown once on screen (and kept for the run log) instead of silently stopping the game.
const ERRS = { seen: {}, last: '' };
function safely(where, fn) {
  try { fn(); } catch (e) {
    const msg = where + ': ' + (e && e.message || e) + ' @ ' + ((e && e.stack || '').split('\n')[1] || '').trim().replace(/^at /, '').replace(/.*\/js\//, '');
    if (ERRS.seen[msg]) return;
    ERRS.seen[msg] = true; ERRS.last = msg;
    try { const d = new Date(), pad = n => (n < 10 ? '0' : '') + n; localStorage.setItem('sd_err', 'v' + APP_VERSION + ' ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' ' + msg); } catch (e2) { /* ignore */ }
    let el = document.getElementById('errBox');
    if (!el) { el = document.createElement('div'); el.id = 'errBox'; el.style.cssText = 'position:fixed;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));z-index:99;background:#300;color:#fff;font:12px monospace;padding:8px;border:1px solid #f55;border-radius:4px;pointer-events:none;white-space:pre-wrap'; document.body.appendChild(el); }
    el.textContent = 'Something broke (the game kept going). Please send this: v' + APP_VERSION + ' ' + msg;
    setTimeout(() => { el.remove(); }, 12000);
  }
}
