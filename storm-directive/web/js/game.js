'use strict';
// Storm Directive - engine: simulation, combat, AI, spawning, rendering.

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

const cv = document.getElementById('game');
const ctx = cv.getContext('2d', { alpha: false });
let W = 0, H = 0, DPR = 1, S = 1, S0 = 1; // screen size (css px), pixel ratio, world->screen scale (S0 before zoom)
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
  DPR = Math.min(window.devicePixelRatio || 1, 2);
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
const CAPS = { enemies: 240, proj: 900, ebul: 800, parts: 450, texts: 60, gems: 350 };

function newStats() {
  return {
    might: 1, haste: 1, reloadSpd: 1, magMult: 1, multishot: 0, projSpeed: 1, range: 1, area: 1, dur: 1,
    pierce: 0, crit: 0.05, critDmg: 1.6, maxHp: 120, regen: 0, speed: 1, magnet: 1, armour: 0, luck: 0,
    lifesteal: 0, elem: { phys: 1, fire: 1, ice: 1, shock: 1, poison: 1, arcane: 1 }, chain: 0,
    poisonCap: 12, react: 1, cdr: 1, xp: 1, dodge: 0, chronoGain: 1, scrap: 1,
    lastRound: 0, tactical: 0, focus: 0, overkill: 0, crossfire: 0, momentum: 0, anchorLink: 0, future: 0, echoInherit: 0,
    bulletSpeed: 1, spawnMult: 1, healMult: 1, viewers: 1, noArmour: false, traction: 1,
  };
}

function newGame() {
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
    nextBoss: BOSS_INTERVAL, bossCount: 0, boss: null, nextWave: 40,
    spawnAcc: 0, crowdT: 0, synergy: {}, banner: null,
    core: makeCore(), scrap: 0,
    chrono: newChrono(), echoes: [], rewind: null, realPlayer: null, lights: [], decals: [],
    tethers: [], grudge: null, mimicPat: null, curses: {}, scatter: false, pair: {}, relics: {}, hazards: [],
    show: newShow(),
    stats: { dmg: {}, hurt: {}, lastHit: '', reactions: 0, reactBy: {}, merges: 0, bossKills: 0, maxCombo: 0, rewinds: 0, leaks: 0, absorbed: 0 },
  };
  G.bossRoster = bossRoster();
  G.terrain = makeTerrain();
  cam.x = 0; cam.y = 0; cam.shake = 0;
  G.dyes = {};
  applyMeta(G);
  refreshPalette(); // back to greyscale: colour comes from stains picked up during the run
  CASA.log.length = 0; CASA.pts.length = 0;
}

function angDiff(a, b) { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU; return d; }
function xpNeed(l) { return Math.floor(4 + (l - 1) * 2.5 + Math.pow(l - 1, 2.35) * 0.22); }
function hpMul(t) { return (1 + t / 120 + Math.pow(t / 220, 2.4)) * (t > 900 ? Math.pow(1.32, (t - 900) / 60) : 1); }
const SURGE_T = 900; // Storm Surge: after 15 minutes enemy damage compounds every minute.
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
    const v = targetScore(dir, e, d2);
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
function effArmour(e) { return Math.max(0, e.armour + (e.auraArm > 0 ? 4 : 0) - e.shred); }

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
function computeStats(w) {
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
  if (w.isSpell) s.cd *= P.cdr;
  s.mag = Math.max(1, Math.round((b.mag || 1) * (1 + 0.12 * (L - 1)) * P.magMult));
  s.reload = (b.reload || 0) * Math.pow(0.95, L - 1) / P.reloadSpd;
  const multi = ['gun', 'lob', 'chain', 'mine', 'orbit', 'ring', 'strike', 'siphon', 'mimic', 'tether', 'prequel'].includes(d.kind) ? P.multishot : 0;
  s.count = (s.count || 1) + multi * (d.kind === 'ring' ? 4 : 1);
  if (d.kind === 'gun' && s.pierce < 90) s.pierce = (s.pierce || 0) + P.pierce;
  if (d.kind === 'ring') s.pierce = (s.pierce || 0) + P.pierce;
  s.speed = (b.speed || 0) * P.projSpeed;
  const areaMult = P.area * (1 + areaB);
  s.range = (b.range || 0) * P.range * (d.style === 'flame' ? 1 + areaB * 0.5 : 1);
  if (s.area) s.area *= areaMult;
  if (s.explode && s.explode > 1) s.explode *= areaMult;
  if (s.aura) s.aura *= areaMult;
  if (s.radius) s.radius *= areaMult;
  if (d.style === 'flame' || d.kind === 'orbit' || d.style === 'void') s.size *= areaMult;
  s.dur = (b.dur || 0) * P.dur * (1 + durB);
  s.chain = (s.chain || 0) + (d.elem === 'shock' || d.elem2 === 'shock' ? P.chain : 0);
  s.crit = P.crit + (b.critBonus || 0);
  for (const m of w.mods || []) {
    const mp = m.p || 1;
    if (m.id === 'ricochet') s.bounce = (s.bounce || 0) + 1 + Math.round(mp);
    if (m.id === 'seeking') s.homing = Math.max(s.homing || 0, 3 + 2 * mp);
    if (m.id === 'boomerang') s.boomerangMod = 1;
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
    if (m.id === 'mirror') s.mirror = 0.5 * mp;
  }
  // Duo combos.
  const has = id => (w.mods || []).some(m => m.id === id);
  s.duos = DUOS.filter(x => has(x.a) && has(x.b)).map(x => x.name);
  for (const n of s.duos) {
    if (n === 'Cluster Hunter') s.shardHome = 1;
    if (n === 'Cryoblast') s.cryoblast = 1;
    if (n === 'Halo') { s.pulse *= 2; s.pulseRate = 0.22; }
    if (n === 'Snowball') s.grow = (s.grow || 0) * 2;
    if (n === 'Pinball Wizard') s.pArcN = 3;
    if (n === 'Pied Piper') s.charmDur *= 2;
    if (n === 'Kaleidoscope') s.kaleido = 1;
    if (n === 'Time Bomb') s.timeBomb = 1;
  }
  applyPerks(w, s);
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

function availableMerges() {
  const out = [];
  for (const m of MERGES) {
    const a = G.weapons.find(w => w && w.id === m.a), b = G.weapons.find(w => w && w.id === m.b);
    if (a && b && a.lvl >= MERGE_MIN_LEVEL && b.lvl >= MERGE_MIN_LEVEL) out.push(m);
  }
  return out;
}
function doMerge(m) {
  const ia = G.weapons.findIndex(w => w && w.id === m.a), ib = G.weapons.findIndex(w => w && w.id === m.b);
  if (ia < 0 || ib < 0) return;
  const lvl = Math.min(MAX_WLVL, Math.max(G.weapons[ia].lvl, G.weapons[ib].lvl));
  const dir = G.weapons[ia].dir;
  const mods = G.weapons[ia].mods.concat(G.weapons[ib].mods).slice(0, MOD_SLOTS);
  G.weapons[ib] = null;
  const w = makeSlot(m.out, false, lvl);
  w.dir = dir; w.mods = mods;
  setWeaponLevel(w, lvl, 1);
  G.weapons[ia] = w;
  G.stats.merges++;
  recomputeAll();
  banner('FUSION: ' + w.def.name.toUpperCase(), w.def.color);
  sfx('level');
  achieve('fusion'); sysLine('fusion'); addViewers(8000);
}

// ---------------------------------------------------------------- loot
function rollRarity(min) {
  const luck = G.P.luck;
  const ws = RARITIES.map((r, i) => (i < min ? 0 : r.w * (1 + luck * i * 1.2)));
  let tot = ws.reduce((a, b) => a + b, 0), x = Math.random() * tot;
  for (let i = 0; i < ws.length; i++) { x -= ws[i]; if (x <= 0) return i; }
  return ws.length - 1;
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
      else if (k === 'dmg') parts.push(`+${pc(v)} damage`);
      else if (k === 'area') parts.push(`+${pc(v)} area`);
      else if (k === 'dur') parts.push(`+${pc(v)} duration`);
      else if (k === 'cd') parts.push(`${pc(-v)} faster`);
    }
  }
  return parts.join(', ');
}

function genLoot(req) {
  const opts = [];
  const minR = req.kind === 'boss' || req.kind === 'chest' ? 2 : 0; // level boxes Bronze+, Fan and boss boxes Gold+
  if (req.kind === 'slot') {
    // A weapon draft for a new mount: three fresh weapons, Silver or better.
    const owned = new Set(G.weapons.filter(Boolean).map(w => w.id));
    const ids = shuffle(Object.keys(WEAPONS).filter(id => !WEAPONS[id].merged && !owned.has(id))).slice(0, 3);
    return ids.map(id => optNewWeapon(id, Math.max(1, rollRarity(1))));
  }
  if (req.kind === 'relic') return bossDef(req.boss).relics.map(id => optRelic(id, req.boss));
  if (req.kind === 'branch') {
    const w = G.weapons.find(x => x && x.uid === req.uid);
    if (w && !w.perks[req.lvl]) return weaponTree(w.def)[req.lvl].map(id => optPerk(w, req.lvl, id));
    req.kind = 'level'; return genLoot(req); // the weapon was fused or recycled meanwhile
  }
  if (req.kind === 'start') {
    // One of your Gene Bank starters is always on offer, if you've bought any.
    const pool = starterPool(), own = pool.filter(id => META.starters[id]);
    const first = own.length ? [pick(own)] : [];
    const ids = first.concat(shuffle(pool.filter(id => !first.includes(id))).slice(0, 3 - first.length));
    for (const id of ids) opts.push(optNewWeapon(id, 0));
    return opts;
  }
  const cands = [];
  const merges = availableMerges();
  for (const m of merges) cands.push({ w: 60, make: () => optMerge(m) , key: 'fuse' + m.out });
  G.weapons.forEach((w, i) => { if (w && w.lvl < MAX_WLVL) cands.push({ w: 11, key: 'wu' + i, make: r => optUpgrade(w, r) }); });
  G.spells.forEach((w, i) => { if (w && w.lvl < MAX_WLVL) cands.push({ w: 8, key: 'su' + i, make: r => optUpgrade(w, r) }); });
  // New weapons only come from weapon drafts (level 1, 10, 20, 35, 50), never from ordinary DNA.
  if (G.spells.some(w => !w)) {
    const owned = new Set(G.spells.filter(Boolean).map(w => w.id));
    const pool = shuffle(Object.keys(SPELLS).filter(id => !owned.has(id))).slice(0, 3);
    for (const id of pool) cands.push({ w: G.t > 30 ? 6 : 3, key: 'sn' + id, make: r => optNewSpell(id, r) });
  }
  G.weapons.forEach(w => {
    if (!w) return;
    // New modifiers while slots are free; otherwise offer to power up one it already has.
    const fits = id => !MODS[id].kinds || MODS[id].kinds.includes(w.def.kind);
    const ids = w.mods.length < MOD_SLOTS ? Object.keys(MODS).filter(id => fits(id) && !w.mods.some(m => m.id === id)) : w.mods.filter(m => m.id !== 'elemental' && m.id !== 'shrapnel' && m.id !== 'boomerang' && m.p < MOD_MAX_POWER).map(m => m.id);
    if (ids.length) { const id = pick(ids); cands.push({ w: 8, key: 'mod' + w.uid, make: r => optMod(w, id, r) }); }
  });
  for (const id in PASSIVES) {
    const st = G.passives[id] || 0;
    if (st >= PASSIVES[id].max || (PASSIVES[id].needsScrap && !ownsScrapWeapon())) continue;
    cands.push({ w: 3.2, key: 'p' + id, pmin: PASSIVES[id].minRarity || 0, make: r => optPassive(id, r) });
  }
  // Stains you don't have yet.
  for (const id in DYES) if (!G.dyes[id]) cands.push({ w: 4, key: 'dye' + id, make: () => optDye(id) });
  // Guarantee a fusion option when one is available.
  const chosen = [];
  const mc = cands.filter(c => c.key.startsWith('fuse')); // (this used to match modifiers too, forcing one into every box)
  if (mc.length) chosen.push(mc[0]);
  // The first level-ups always offer the GFP tag, so you can find yourself early.
  else if (!G.dyes.gfp && req.kind === 'level' && G.level <= 3) chosen.push(cands.find(c => c.key === 'dyegfp'));
  while (chosen.length < 3) {
    const rest = cands.filter(c => !chosen.includes(c));
    if (!rest.length) break;
    let tot = rest.reduce((a, c) => a + c.w, 0), x = Math.random() * tot;
    for (const c of rest) { x -= c.w; if (x <= 0) { chosen.push(c); break; } }
  }
  for (const c of chosen) opts.push(c.make(Math.max(rollRarity(minR), c.pmin || 0)));
  // Occasionally the System slips a cursed card into the box.
  const curses = CURSES.filter(c => !G.curses[c.id]);
  if (curses.length && Math.random() < 0.12 && opts.length) opts[opts.length - 1] = optCurse(pick(curses));
  if (opts.length && Math.random() < 0.45) pick(opts).quip = pick(CARD_QUIPS);
  const fillers = [optHeal, optRerolls, optOvercharge];
  let fi = 0;
  while (opts.length < 3) opts.push(fillers[fi++ % 3]());
  return opts;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function optNewWeapon(id, r) {
  const def = WEAPONS[id], lvl = [1, 2, 3, 4][r];
  return { def, rarity: r, tag: 'NEW WEAPON', icon: def.icon, color: def.color, elem: def.elem, title: def.name,
    sub: `${ELEMENTS[def.elem].name} | Lv ${lvl}`, desc: def.desc + (def.merged ? '' : fuseHint(id)),
    apply: () => { const i = G.weapons.findIndex(w => !w); if (i >= 0) { G.weapons[i] = makeSlot(id, false, lvl); setWeaponLevel(G.weapons[i], lvl, 1); recomputeAll(); } } };
}
function optNewSpell(id, r) {
  const def = SPELLS[id], lvl = [1, 2, 3, 4][r];
  return { def, rarity: r, tag: 'NEW SPELL', icon: def.icon, color: def.color, elem: def.elem, title: def.name,
    sub: `${ELEMENTS[def.elem].name} spell | Lv ${lvl}`, desc: def.desc,
    apply: () => { const i = G.spells.findIndex(w => !w); if (i >= 0) { G.spells[i] = makeSlot(id, true, lvl); recomputeAll(); } } };
}
function optUpgrade(w, r) {
  const n = RARITIES[r].lvls, to = Math.min(MAX_WLVL, w.lvl + n);
  const bonus = lvBonusText(w.def, w.lvl, to);
  let desc = `+${pc(WEAPON_LV_DMG * (to - w.lvl))} damage, faster cycling` + (bonus ? `. ${bonus}` : '');
  if (!w.isSpell && to >= MERGE_MIN_LEVEL && w.lvl < MERGE_MIN_LEVEL && !w.def.merged) desc += '. Unlocks fusion!';
  return { def: w.def, w, wup: !w.isSpell, from: w.lvl, to, rarity: r, tag: w.isSpell ? 'SPELL UPGRADE' : 'UPGRADE', icon: w.def.icon, color: w.def.color, elem: w.def.elem, title: w.def.name,
    sub: `Lv ${w.lvl} > ${to}${to === MAX_WLVL ? ' (MAX)' : ''}`, desc,
    apply: () => { setWeaponLevel(w, to); computeStats(w); w.ammo = w.s.mag; w.reloadT = 0; } };
}
function optDye(id) {
  const D = DYES[id];
  return { rarity: 1, tag: 'STAIN', icon: 'DY', color: '#9fb3c8', title: D.name, sub: 'Colour and a boon, for the rest of the run', desc: D.boon + ' ' + D.desc,
    apply: () => { G.dyes[id] = true; if (D.apply) D.apply(G.P, G); recomputeAll(); refreshPalette(); } };
}
function optPassive(id, r) {
  const p = PASSIVES[id], intish = ['multishot', 'pierce', 'armour'].includes(id);
  const v = intish ? Math.max(1, Math.floor(RARITIES[r].mult)) * p.v : p.v * RARITIES[r].mult;
  const st = G.passives[id] || 0;
  const extra = adaptNotes(ADAPT[id]);
  return { rarity: r, tag: 'POWER-UP', icon: p.icon, color: '#9fb3c8', title: p.name, sub: `Stack ${st + 1}/${p.max}`, desc: p.fmt(v) + extra,
    apply: () => { p.apply(G.P, v, G); G.passives[id] = st + 1; recomputeAll(); } };
}
function optMod(w, id, r) {
  const M = MODS[id], rr = Math.max(1, r), pw = MOD_POWER[rr];
  const have = w.mods.find(m => m.id === id);
  let elem = null, desc;
  if (id === 'elemental') { elem = pick(Object.keys(ELEMENTS).filter(e => e !== 'phys' && e !== w.def.elem)); desc = `Converts ${w.def.name} to ${ELEMENTS[elem].name} damage.`; }
  else { const np = have ? Math.min(MOD_MAX_POWER, have.p + pw * 0.5) : pw; desc = have ? `Power ${have.p.toFixed(2)} > ${np.toFixed(2)}: ${M.desc(np)}` : M.desc(pw); }
  return { rarity: rr, tag: have ? 'MODIFIER BOOST' : 'MODIFIER', icon: M.icon, color: M.color, elem: elem || w.def.elem, title: M.name,
    sub: have ? `Boosts ${w.def.name}'s ${M.name}` : `Installs into ${w.def.name} (slot ${w.mods.length + 1}/${MOD_SLOTS})`, desc, modFor: w.def.icon,
    apply: () => {
      if (have) have.p = Math.min(MOD_MAX_POWER, have.p + pw * 0.5);
      else w.mods.push({ id, elem, p: pw });
      computeStats(w); achieve('modded');
      if (w.mods.length >= MOD_SLOTS) achieve('fullmods');
    } };
}
function optCurse(c) {
  return { rarity: 3, cursed: true, tag: 'CURSED', icon: '!?', color: '#9d4edd', title: c.name, sub: 'Boon: ' + c.boon, desc: 'Bane: ' + c.bane + '.',
    apply: () => { G.curses[c.id] = true; c.apply(G.P, G); recomputeAll(); achieve('cursed'); sysLine('cursed'); } };
}
function optMerge(m) {
  const def = WEAPONS[m.out];
  return { def, rarity: 3, tag: 'FUSION', icon: def.icon, color: def.color, elem: def.elem, title: def.name, fusion: true,
    sub: `${WEAPONS[m.a].name} + ${WEAPONS[m.b].name}`, desc: def.desc + ' Frees a weapon slot.',
    apply: () => doMerge(m) };
}
function optHeal() { return { rarity: 0, tag: 'SUPPLY', icon: '+', color: '#8ac926', title: 'Field Medkit', sub: 'Instant', desc: 'Restore 50% of max HP.', apply: () => healPlayer(G.P.maxHp * 0.5) }; }
function optRerolls() { return { rarity: 1, tag: 'SUPPLY', icon: 'RR', color: '#ffca3a', title: 'Reroll Tokens', sub: 'Instant', desc: '+2 loot rerolls.', apply: () => { G.rerolls += 2; } }; }
function optOvercharge() { return { rarity: 1, tag: 'SUPPLY', icon: 'OC', color: '#ff924c', title: 'Overcharge Core', sub: 'Permanent', desc: '+5% damage for everything.', apply: () => { G.P.might += 0.05; recomputeAll(); } }; }
function fuseHint(id) {
  const m = MERGES.filter(m => m.a === id || m.b === id);
  if (!m.length) return '';
  return ' Fuses with ' + m.map(x => WEAPONS[x.a === id ? x.b : x.a].name).join(' / ') + '.';
}

// ---------------------------------------------------------------- effects helpers
function spawnPart(x, y, color, n, spd, life, size) {
  for (let i = 0; i < n; i++) {
    if (G.parts.length >= CAPS.parts) return;
    const a = Math.random() * TAU, v = rand(0.3, 1) * spd;
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life * rand(0.6, 1), max: life, color, size: size || 3 });
  }
}
function floatText(x, y, txt, color, size, life) {
  if (G.texts.length >= CAPS.texts) G.texts.shift();
  G.texts.push({ x: x + rand(-6, 6), y, txt, color, size: size || 13, life: life || 0.7, max: life || 0.7 });
}
function banner(text, color) { G.banner = { text, color: color || '#fff', t: 2.4 }; }
function ring(x, y, r, color, life, width) { G.fx.push({ type: 'ring', x, y, r, color, life: life || 0.35, max: life || 0.35, w: width || 3 }); }
function bolt(x1, y1, x2, y2, color, life) {
  const pts = [x1, y1];
  const n = 6, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  for (let i = 1; i < n; i++) { const t = i / n, o = rand(-1, 1) * Math.min(18, len * 0.12); pts.push(x1 + dx * t + nx * o, y1 + dy * t + ny * o); }
  pts.push(x2, y2);
  G.fx.push({ type: 'bolt', pts, color, life: life || 0.15, max: life || 0.15 });
}
function after(t, fn) { G.timers.push({ t, fn }); }

// ---------------------------------------------------------------- damage & reactions
function damageEnemy(e, dmg, src) {
  if (e.dead || e.phased || (e.charmed && !src.fromAlly)) return 0;
  const P = G.P, syn = G.synergy;
  let d = dmg * (src.mult || 1);
  // The Final Five can't be burst down in one go: no single hit takes more than 6% of one.
  if (e.final) d = Math.min(d, e.maxHp * 0.06);
  if (e.boss) d = Math.min(d, e.maxHp * 0.04); // no one-shotting a boss
  // Water bears curl into a 'tun' once when badly hurt: nearly invulnerable for a few seconds.
  if (e.def.tun) {
    if (e.tunT > G.t) d *= 0.08;
    else if (!e.tunUsed && e.hp - d < e.maxHp * 0.3) { e.tunUsed = true; e.tunT = G.t + 2.5; d *= 0.08; floatText(e.x, e.y - e.r - 10, 'TUN!', XR.white, 13); }
  }
  if (src.grudge && e === G.grudge) d *= 3;
  d *= sigDamageMul(e, src);
  // Stain boons: you can see who matters.
  if (G.dyes.luciferase && (e.elite || e.boss)) d *= 1.25;
  if (G.dyes.motility && e.def.speed >= 95 && !e.boss) d *= 1.3;
  if (G.dyes.rival && e.rival) d *= 1.4;
  if (e.boss || e.bossDef) d *= bossDamageMul(e, src);
  if (src.w && src.w.s) {
    const ws = src.w.s;
    if (ws.pExec && e.hp < e.maxHp * 0.35) d *= 1 + ws.pExec;
    if (ws.pGiant && (e.elite || e.boss || e.rival)) d *= 1 + ws.pGiant;
  }
  if (src.parasite) { e.parasiteW = src.w; e.parasiteT = 6; }
  let crit = false;
  if (!src.noCrit && Math.random() < (src.crit != null ? src.crit : P.crit)) { crit = true; d *= P.critDmg; }
  if (e.mark > 0) d *= syn.arcane ? 1.5 : 1.3;
  if (e.frozen > 0 && syn.ice) d *= 1.25;
  if (!src.dot) d = Math.max(d * 0.15, d - effArmour(e));
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
  e.hp -= d;
  e.flash = 0.07;
  const key = src.wname || 'Other';
  G.stats.dmg[key] = (G.stats.dmg[key] || 0) + d;
  // Damage numbers thin out when the screen is busy (crits always show).
  if (!src.dot && (crit || d >= 4 || Math.random() < 0.3) && (crit || typeof FX === 'undefined' || FX.k > 0.6 || Math.random() < FX.k * 0.5)) {
    floatText(e.x, e.y - e.r, Math.round(d) + (crit ? '!' : ''), '#ffffff', crit ? 17 : 12);
  }
  if (src.shred) e.shred = Math.min(e.armour + 4, e.shred + src.shred);
  if (src.knock && !e.boss && !e.def.spongy && !e.def.heavy) {
    const k = src.knock * (e.def.ai === 'aura' || e.def.hp > 200 ? 0.3 : 1);
    const kx = src.kx != null ? src.kx : e.x - G.player.x, ky = src.ky != null ? src.ky : e.y - G.player.y;
    const l = Math.hypot(kx, ky) || 1;
    e.kx += kx / l * k; e.ky += ky / l * k;
  }
  if (src.freezeHit && !e.boss) { e.frozen = Math.max(e.frozen, 1.2); }
  if (src.w && !src.noProc && !src.dot) { modProcs(e, dmg, src); if (src.w.s) perkProcs(e, dmg, src); sigHit(e, dmg, src); }
  if (!src.dot) relicHit(e, d, src);
  if (src.elem && src.elem !== 'phys' && !src.noStatus) applyElement(e, src.elem, dmg, src);
  // Shocked enemies arc a portion of incoming damage to a neighbour.
  if (e.shock > 0 && !src.noArc && src.elem !== 'shock' && Math.random() < (syn.shock ? 0.5 : 0.25)) {
    const n = acquire('nearest', 130, e.x, e.y, e);
    if (n) { bolt(e.x, e.y, n.x, n.y, ELEMENTS.shock.color, 0.12); damageEnemy(n, dmg * 0.45, { elem: 'shock', noStatus: true, noArc: true, noCrit: true, wname: 'Shock arcs' }); }
  }
  if (e.hp <= 0 && !e.dead) {
    const excess = -e.hp;
    killEnemy(e, src);
    if (excess >= 1000 && !src.dot) achieve('overkill');
    // Overkill Transfer: the leftover damage jumps to the next victim.
    if (P.overkill > 0 && !src.ok && !src.dot && excess > 1) {
      const n = acquire(src.dir || 'nearest', 260, e.x, e.y, e);
      if (n) { bolt(e.x, e.y, n.x, n.y, '#ff924c', 0.15); damageEnemy(n, Math.min(excess, e.maxHp) * Math.min(1, P.overkill), Object.assign({}, src, { ok: true, mult: 1, noStatus: true, noCrit: true, wname: 'Overkill transfer' })); }
    }
  }
  return d;
}

function react(e, id, src) {
  if (e.reactCd > 0 && !(G.pair.hotcold && (id === 'thermal' || id === 'steam'))) return false;
  e.reactCd = 0.35;
  G.stats.reactions++;
  addViewers(8);
  if (G.stats.reactions === 50) achieve('reactions');
  G.stats.reactBy[id] = (G.stats.reactBy[id] || 0) + 1;
  const R = REACTIONS[id];
  // Throttle reaction labels so big fights stay readable.
  G.reactLabel = G.reactLabel || {};
  if (!(G.reactLabel[id] > G.realT)) { G.reactLabel[id] = G.realT + 0.6; floatText(e.x, e.y - e.r - 14, R.name, R.color, 14, 0.9); }
  sfx('react');
  return true;
}

function applyElement(e, elem, dmg, src) {
  const P = G.P, syn = G.synergy, rm = P.react;
  const rsrc = { elem, noStatus: true, noArc: true, noCrit: true, wname: 'Reactions' };
  switch (elem) {
    case 'fire':
      if ((e.chill > 0 || e.frozen > 0) && react(e, 'thermal', src)) {
        e.chill = 0; e.chillAmt = 0; e.frozen = 0;
        damageEnemy(e, (dmg * 2.5 * rm + 10) * (G.pair.hotcold ? 2 : 1), rsrc);
        spawnPart(e.x, e.y, '#ffb3b3', 10, 160, 0.4);
      } else if (e.poison > 0 && e.poisonStacks >= 3 && react(e, 'combust', src)) {
        const boom = (e.poisonDps * e.poisonStacks * 2.5 + dmg) * rm;
        e.poison = 0; e.poisonStacks = 0;
        aoe(e.x, e.y, 75, boom, rsrc, '#ffba08');
      } else if (e.shock > 0 && react(e, 'overload', src)) {
        e.shock = 0;
        aoe(e.x, e.y, 65, (dmg * 1.6 + 8) * rm, rsrc, '#fff3b0');
      }
      e.burn = syn.fire ? 4.5 : 3;
      e.burnDps = Math.max(e.burnDps, dmg * 0.4 * (syn.fire ? 1.5 : 1) * P.elem.fire);
      break;
    case 'ice': {
      if (e.burn > 0 && react(e, 'steam', src)) {
        e.burn = 0;
        aoe(e.x, e.y, 70, (dmg * 1.4 + 6) * rm * (G.pair.hotcold ? 2 : 1), rsrc, '#e0fbfc');
      }
      e.chill = 2.5;
      e.chillAmt = Math.min(0.6, e.chillAmt + 0.14 * P.elem.ice);
      const thresh = syn.ice ? 0.3 : 0.58;
      if (e.chillAmt >= thresh && e.frozen <= 0) { e.frozen = e.boss ? 0.4 : 1.3; e.chillAmt = 0.2; }
      break;
    }
    case 'shock':
      if (e.poison > 0 && react(e, 'toxicarc', src)) {
        const ns = acquireMany('nearest', 140, e.x, e.y, 4).filter(n => n !== e);
        for (const n of ns) {
          bolt(e.x, e.y, n.x, n.y, '#d4ff5c', 0.2);
          n.poison = 4; n.poisonStacks = Math.min(P.poisonCap, n.poisonStacks + Math.ceil(e.poisonStacks / 2)); n.poisonDps = Math.max(n.poisonDps, e.poisonDps);
        }
      } else if ((e.chill > 0 || e.frozen > 0) && react(e, 'supercon', src)) {
        e.shred = Math.min(e.armour + 6, e.shred + 6 * rm);
        damageEnemy(e, dmg * 0.8 * rm, rsrc);
      }
      e.shock = 2.2;
      break;
    case 'poison':
      e.poison = 4;
      e.poisonStacks = Math.min(P.poisonCap, e.poisonStacks + 1);
      e.poisonDps = Math.max(e.poisonDps, dmg * 0.14 * P.elem.poison);
      break;
    case 'arcane':
      if ((e.burn > 0 || e.chill > 0 || e.poison > 0 || e.shock > 0) && react(e, 'resonance', src)) {
        damageEnemy(e, dmg * 1.0 * rm, rsrc);
        const ns = acquireMany('nearest', 120, e.x, e.y, 3);
        for (const n of ns) if (n !== e) n.mark = 3;
        ring(e.x, e.y, 50, '#e0aaff', 0.3);
      }
      e.mark = 3;
      break;
  }
}

function aoe(x, y, r, dmg, src, color) {
  IN_AOE = true;
  forNear(x, y, r, e => { damageEnemy(e, dmg, src); });
  IN_AOE = false;
  popAmbient(x, y, r);
  ring(x, y, r, color || '#ffae42', 0.35, 4);
  addLight(x, y, r * 1.8, color || '#ffae42', 0.45);
  if (r > 50) addDecal(x, y, r * 0.8, '#000');
  spawnPart(x, y, color || '#ffae42', Math.min(18, 6 + r / 8), r * 2.4, 0.45, 3.5);
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
  if (e.rival) { casaLog(`${e.name} eliminated`); rivalDown(e); return; }
  if (e.egg) { e.dead = true; G.eggE = null; spawnPart(e.x, e.y, '#ffd6e8', 60, 320, 0.9, 6); cam.shake = 16; victory(); return; }
  e.dead = true;
  G.kills++;
  if (e.def.shape === 'sperm') G.stats.spermKills = (G.stats.spermKills || 0) + 1;
  countKill(e.x, e.y);
  if (e.boss || e.elite || (e.def.spongy && e.r > 60)) casaLog(`TRK#${e.id} ${e.name} lysed`);
  const P = G.P;
  onShowKill(e, src);
  sigKill(e, src);
  relicKill(e, src);
  // Split on Kill mod.
  if (src.w && !src.noSplit && src.w.mods && src.w.mods.some(m => m.id === 'shrapnel')) {
    const ss = Object.assign({}, src, { noSplit: true, mult: 1 });
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * TAU;
      spawnProj(src.w, e.x, e.y, a, ss, { noMods: true, speed: 420, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, life: 0.5, dmg: src.w.s.dmg * 0.4, pierce: 0, bounce: 0, homing: 0, explode: 0, r: 3, style: 'bullet', chainHit: 0, aura: 0 });
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
  spawnPart(e.x, e.y, e.def.color || e.color, e.boss ? 40 : 7, e.boss ? 260 : 130, 0.5, e.boss ? 5 : 3);
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
    G.pickups.push(makePickup((e.def.spongy && e.r > 100) || Math.random() < 0.85 ? chestOr('heal') : pick(['heal', 'magnet', 'rage']), e.x, e.y, { t: e.def.spongy ? 'amoeba' : 'elite', name: e.name.replace(' (elite)', ''), meals: e.meals || 0 }));
  } else if (Math.random() < 0.011 * (1 + P.luck)) {
    const types = ['magnet', 'nuke', 'rage', 'heal', 'shield', 'freeze', 'heal', 'magnet'];
    G.pickups.push(makePickup(Math.random() < 0.5 ? chestOr(pick(types)) : pick(types), e.x, e.y, { t: 'drop', name: e.name }));
  }
}
// Loot boxes from kills are rationed: at most one every LOOT_GAP seconds (bosses and rivals don't count).
const LOOT_GAP = 9; // with boss, rival and achievement boxes: about 45 extra boxes on a run to Lv 60
function chestOr(alt) {
  if (G.t < (G.nextChest || 20)) return alt;
  G.nextChest = G.t + LOOT_GAP;
  return 'chest';
}

function bomberBlast(e) {
  const r = 60, dmg = e.dmg;
  ring(e.x, e.y, r, '#ff2e2e', 0.35, 5);
  spawnPart(e.x, e.y, '#ff5a36', 14, 220, 0.45, 4);
  forNear(e.x, e.y, r, o => { if (o !== e) damageEnemy(o, dmg * 2, { elem: 'fire', noCrit: true, wname: 'Bomber friendly fire', friendly: true }); });
  const p = me();
  if (Math.hypot(p.x - e.x, p.y - e.y) < r + p.r) hurtPlayer(dmg, 'Bomber blast');
}

// kind: 'x' = experience gem, 's' = scrap (tower currency).
function dropGem(x, y, v, kind) {
  kind = kind || 'x';
  if (G.gems.length >= CAPS.gems) {
    // Merge into a random existing gem of the same kind to keep counts bounded.
    for (let k = 0; k < 8; k++) { const g = G.gems[Math.floor(Math.random() * G.gems.length)]; if (g.kind === kind) { g.v += v; return; } }
  }
  G.gems.push({ x: x + rand(-5, 5), y: y + rand(-5, 5), v, kind, mag: false, vx: 0, vy: 0 });
}
// src: where a box came from ({ t: 'elite' | 'amoeba' | 'drop' | 'rival' | 'sponsor', name }), for the loot screen's story line.
function makePickup(type, x, y, src) { return unstick({ type, x, y, life: 25, bob: Math.random() * TAU, src }, 14); }

function healPlayer(n, silent) {
  const p = me(), P = G.P;
  const before = p.hp;
  p.hp = Math.min(P.maxHp, p.hp + n * P.healMult);
  if (!silent && p.hp - before >= 1) floatText(p.x, p.y - 24, '+' + Math.round(p.hp - before), '#8ac926', 15);
}

function hurtPlayer(dmg, from, ent) {
  const p = me(), P = G.P;
  if (G.state !== 'play' || p.iframes > 0 || G.shieldT > 0) return;
  if (Math.random() < P.dodge) { floatText(p.x, p.y - 24, 'DODGE', '#9ef0ff', 14); p.iframes = 0.25; relicDodge(); return; }
  if (ent && ent.weakT > G.t) dmg *= 0.6; // Nausea
  dmg = relicDamageIn(dmg, ent);
  if (dmg <= 0) return;
  const d = Math.max(1, dmg - (P.noArmour ? 0 : P.armour));
  p.hp -= d;
  if (ent && !ent.dead) G.grudge = ent;
  if (p.hp > 0 && p.hp < P.maxHp * 0.05) achieve('lowhp');
  const k = from || 'Unknown';
  G.stats.hurt[k] = (G.stats.hurt[k] || 0) + d;
  G.stats.lastHit = k;
  p.iframes = 0.7; p.flash = 0.2;
  cam.shake = Math.min(10, cam.shake + 5);
  floatText(p.x, p.y - 24, '-' + Math.round(d), '#ff4d6d', 15);
  sfx('hurt');
  vibrate(25);
  acidReflux();
  relicHurt(d, ent);
  if (p.hp <= 0) { p.hp = 0; if (!startRewind(true)) gameOver(); }
}

// ---------------------------------------------------------------- enemies
// Fewer, stronger enemies. Strength ramps from "chunky" at the start to "brutal" by 15 minutes.
function enemyScale(t) {
  const k = Math.min(1, t / 900);
  return { hp: 0.72 + 1.04 * k, dmg: 0.62 + 1.13 * Math.pow(k, 1.5), xp: 0.88, r: 1.12, speed: 1 + 0.12 * k };
}
function makeEnemy(def, x, y, opts) {
  const t = G.t, hm = hpMul(t), dm = dmgMul(t);
  const e = {
    id: uidSeq++, def, name: def.name, x, y, vx: 0, vy: 0, kx: 0, ky: 0,
    hp: def.hp * hm, maxHp: def.hp * hm, armour: def.armour, r: def.r, speed: def.speed * (1 + Math.min(0.6, t / 2000)),
    dmg: def.dmg * dm, xp: def.xp, color: def.color, elite: false, boss: false, dead: false, flash: 0, hitT: {},
    burn: 0, burnDps: 0, chill: 0, chillAmt: 0, frozen: 0, shock: 0, poison: 0, poisonStacks: 0, poisonDps: 0, mark: 0, shred: 0,
    reactCd: 0, auraArm: 0, crowd: 0, shootCd: rand(0.5, 2), st: 0, stT: rand(1, 3), side: Math.random() < 0.5 ? 1 : -1, spin: Math.random() * TAU,
    phased: false, age: 0, dashX: 0, dashY: 0,
  };
  // Fewer, stronger enemies: every monster is a bigger, tougher, more rewarding threat.
  if (!def.patterns) { const K = enemyScale(t); e.hp *= K.hp; e.maxHp *= K.hp; e.dmg *= K.dmg; e.xp *= K.xp; e.r *= K.r; e.speed *= K.speed; }
  if (opts && opts.elite) {
    e.elite = true; e.hp *= 5; e.maxHp *= 5; e.r *= 1.35; e.armour += 2; e.dmg *= 1.4; e.xp *= 6;
  }
  return e;
}

function spawnPos() {
  const a = Math.random() * TAU;
  const vw = W / 2 / S0, vh = H / 2 / S0;
  const d = Math.hypot(vw, vh) + rand(30, 90);
  return { x: G.player.x + Math.cos(a) * d, y: G.player.y + Math.sin(a) * d, a };
}

function spawnRandom() {
  const t = G.t;
  const pool = [];
  let tot = 0;
  // Shooters become more common as the storm builds.
  // Shooters stay as common as they were before the swarms got denser: the extra bodies are melee and swarmers.
  const wOf = d => d.w * (d.shoot ? 0.4 * (1 + t / 300) : 1);
  for (const id in ENEMIES) { const d = ENEMIES[id]; if (d.w > 0 && d.from <= t) { pool.push(d); tot += wOf(d); } }
  let x = Math.random() * tot, def = pool[0];
  for (const d of pool) { x -= wOf(d); if (x <= 0) { def = d; break; } }
  const p = spawnPos();
  const n = Math.ceil((def.group || 1) * 0.8);
  const eliteChance = Math.min(0.12, 0.01 + t / 3000);
  for (let i = 0; i < n; i++) {
    if (G.enemies.length >= CAPS.enemies) return;
    G.enemies.push(makeEnemy(def, p.x + rand(-30, 30), p.y + rand(-30, 30), { elite: n === 1 && t > 45 && Math.random() < eliteChance }));
  }
}

function waveEvent() {
  const t = G.t, p = G.player;
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
  if (G.ebul.length >= CAPS.ebul) return;
  G.bulSeq = ((G.bulSeq || 0) + 1) % BUL.keep.length;
  if (!BUL.keep[G.bulSeq]) return;
  dmg *= BUL.dmg * (shooterEnt && shooterEnt.weakT > G.t ? 0.6 : 1); r = (r || 5) * BUL.size;
  speed *= (1 + Math.min(0.7, G.t / 1500)) * G.P.bulletSpeed;
  G.ebul.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, dmg, r: r || 5, color: PAL.danger, life: 7, from: (shooterName || 'Enemy') + ' bullets', owner: shooterEnt });
}

function shootPattern(e, pat, a0) {
  const p = G.player, sh = e.def.shoot || {};
  const aim = Math.atan2(p.y - e.y, p.x - e.x);
  const dm = dmgMul(G.t), bd = (sh.dmg || e.def.dmg * 0.4 || 8) * dm;
  switch (pat) {
    case 'aimed': {
      const n = G.t > 600 ? 5 : G.t > 300 ? 3 : 1;
      for (let i = 0; i < n; i++) eBullet(e.x, e.y, aim + (i - (n - 1) / 2) * 0.22, sh.speed || 170, bd, 5, '#ff5df2');
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
    if (e.burn > 0) {
      e.burn -= dt;
      damageEnemy(e, e.burnDps * dt, { dot: true, noCrit: true, noStatus: true, noArc: true, wname: 'Burn' });
      if (Math.random() < dt * 6) spawnPart(e.x + rand(-e.r, e.r), e.y, '#ff7a2f', 1, 30, 0.4, 2.5);
      if (e.dead) continue;
    }
    if (e.poison > 0) {
      e.poison -= dt;
      damageEnemy(e, e.poisonDps * e.poisonStacks * (syn.poison ? 2 : 1) * dt, { dot: true, noCrit: true, noStatus: true, noArc: true, wname: 'Poison' });
      if (e.poison <= 0) e.poisonStacks = 0;
      if (e.dead) continue;
    }
    if (e.egg) { eggAI(e, edt); continue; }
    if (e.rival) { rivalAI(e, edt); continue; }
    if (e.charmed) {
      e.charmT -= dt;
      if (e.charmT <= 0) { if (e.zombie) { e.dead = true; spawnPart(e.x, e.y, '#b5e48c', 8, 80, 0.5); continue; } e.charmed = false; ring(e.x, e.y, e.r + 10, PAL.you, 0.3); }
      else { allyAI(e, dt); continue; }
    }
    const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist, uy = dy / dist;
    let mx = ux, my = uy, spd = e.speed;
    const frozen = e.frozen > 0;
    const slow = frozen ? 0 : (1 - e.chillAmt) * (e.stasisT > G.realT ? 0.35 : 1) * (e.guiltT > G.t ? 0.6 : 1);
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
          } else if (e.shootCd <= 0 && dist < 520) { shootPattern(e, sh.pattern); e.shootCd = sh.cd * rand(0.85, 1.15) / fireMul(G.t); }
          break;
        }
        case 'turret':
          e.shootCd -= edt;
          if (e.shootCd <= 0 && dist < 560) { shootPattern(e, 'spiral'); e.shootCd = e.def.shoot.cd; }
          break;
        case 'engulf': { const m = engulfAI(e, edt, dist, ux, uy); mx = m.x; my = m.y; spd = e.speed; break; }
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
    // Movement (knockback decays).
    const f = frozen || e.tunT > G.t ? 0 : slow;
    if (e.tailCut) spd *= 0.15; // no flagellum: it can only twitch and drift
    e.x += (mx * spd * f * warpF + e.kx) * dt;
    e.y += (my * spd * f * warpF + e.ky) * dt;
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
      } else if (!frozen) hurtPlayer(e.dmg, e.name + (e.elite ? ' (elite)' : ''), e);
    }
    // Leash: recycle enemies left far behind.
    if (dist > 1500 && !e.boss) { const s = spawnPos(); e.x = s.x; e.y = s.y; }
  }
  // Separation.
  for (const e of G.enemies) {
    if (e.dead || e.boss) continue;
    forNear(e.x, e.y, e.r * 0.8, o => {
      if (o === e) return;
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
  const aim = Math.atan2(p.y - e.y, p.x - e.x);
  const bd = e.def.dmg * 0.35 * dmgMul(G.t);
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
    grudge: !!d.grudge, parasite: !!d.parasite, mult: weaponMult(w),
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
  const rate = (rage ? 2 : 1) * (d.spinup ? 1 + 2 * w.spin : 1) * rateBonus();
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
      break;
    // ---- spells
    case 'strike': {
      const ts = acquireMany(w.dir, s.range, p.x, p.y, s.count);
      for (const t of ts) {
        const tx = t.x + t.vx * 0, ty = t.y;
        G.fx.push({ type: 'warn', x: tx, y: ty, r: s.area, color: d.color, life: s.delay, max: s.delay });
        after(s.delay, () => {
          aoe(tx, ty, s.area, s.dmg, src, d.color);
          G.zones.push({ x: tx, y: ty, r: s.area * 0.7, life: s.dur, max: s.dur, dps: s.dmg * 0.15, elem: 'fire', pull: 0, color: '#ff5400', tick: 0, src });
        });
      }
      break;
    }
    case 'nova':
      aoe(p.x, p.y, s.area, s.dmg, src, d.color);
      forNear(p.x, p.y, s.area, e => { if (!e.boss) e.frozen = Math.max(e.frozen, 1.6); });
      for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < s.area) { b.dead = true; spawnPart(b.x, b.y, '#90e0ef', 1, 60, 0.3); }
      ring(p.x, p.y, s.area, '#caf0f8', 0.5, 6);
      break;
    case 'thunder': {
      const ts = acquireMany(w.dir, s.range, p.x, p.y, s.count);
      ts.forEach((t, i) => after(i * 0.07, () => {
        bolt(t.x + rand(-30, 30), t.y - 500, t.x, t.y, '#fdf0d5', 0.25);
        aoe(t.x, t.y, s.area, s.dmg, src, '#ffe94a');
      }));
      break;
    }
    case 'zone':
      G.zones.push({ x: target.x, y: target.y, r: s.area, life: s.dur, max: s.dur, dps: s.dmg, elem: d.elem, pull: s.pull, color: d.color, tick: 0, src, spell: w.id });
      break;
    case 'heal': healPlayer(G.P.maxHp * s.dmg); ring(p.x, p.y, 60, '#80ffdb', 0.5, 4); break;
    case 'warp': G.warp = s.dur; banner('TIME WARP', '#b8c0ff'); break;
    case 'barrier': G.barrier = s.dur; G.barrierR = s.area; G.barrierDmg = s.dmg; break;
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

function spawnProj(w, x, y, a, src, over) {
  if (G.proj.length >= CAPS.proj) return;
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
  if (mods && s.boomerangMod && !pr.boomerang && d.kind !== 'ring') pr.boomerang = 1;
  if (pr.boomerang) pr.life = s.range / speed * 2 + 0.3;
  pr.max = pr.life;
  if (over) Object.assign(pr, over);
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
  // Extended Family: a second ring, twice as far out, spinning the other way.
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
  const p = G.player;
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
          if (pr.w.s.timeBomb) aoe(pr.x, pr.y, 55, pr.dmg * 0.6, Object.assign({}, pr.src, { noProc: true, noCrit: true, wname: 'Time Bomb' }), '#ff7a2f');
        }
      }
    }
    if (pr.pulse) { pr.pulseT -= dt; if (pr.pulseT <= 0) { pr.pulseT = pr.w.s.pulseRate || 0.45; aoe(pr.x, pr.y, 38, pr.dmg * pr.pulse, Object.assign({}, pr.src, { noProc: true, noCrit: true, wname: 'Pulse' }), '#cfe3ff'); } }
    if (pr.magnet) forNear(pr.x, pr.y, pr.magnet, e => { if (!e.boss && !e.egg && !e.rival) { const dx = pr.x - e.x, dy = pr.y - e.y, dd = Math.hypot(dx, dy) || 1; e.x += dx / dd * 90 * dt; e.y += dy / dd * 90 * dt; } });
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
      } else { pr.back = true; pr.hits = null; pr.hanging = false; if (pr.hangPull) pr.magnet = 140; }
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
    if (!(pr.orbitT > 0)) { pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt; }
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
      const hm = (pr.pb ? 1 + 1.5 * clamp(pr.life / pr.max, 0, 1) : 1) * (pr.vsOwner === e ? 3 : 1);
      damageEnemy(e, pr.dmg * hm, Object.assign({}, pr.src, pr.src.knock ? { kx: pr.vx, ky: pr.vy } : null));
      projHit(pr, e);
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
          spawnProj(pr.w, pr.x, pr.y, a, ss, { noMods: true, speed: 460, vx: Math.cos(a) * 460, vy: Math.sin(a) * 460, life: 0.5, dmg: pr.dmg * 0.45,
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
}

function detonateMine(pr) {
  const s = pr.w.s;
  if (s.singularity) {
    G.zones.push({ x: pr.x, y: pr.y, r: s.explode * 1.2, life: 1.2, max: 1.2, dps: s.dmg * 0.3, elem: 'arcane', pull: 260, color: '#9d4edd', tick: 0, src: pr.src,
      onEnd: z => aoe(z.x, z.y, s.explode, s.dmg, pr.src, '#c77dff') });
  } else { const k = mineScale(pr); aoe(pr.x, pr.y, s.explode * k.r, s.dmg * k.k, pr.src, pr.color); }
  afterMine(pr);
}

function updateSpells(dt) { updateSpellList(G.spells, dt); }
function updateSpellList(list, dt) {
  for (const w of list) {
    if (!w) continue;
    w.cd -= dt;
    if (w.cd > 0) continue;
    let target = null;
    if (!w.def.noTarget) {
      target = acquire(w.dir, w.s.range, G.player.x, G.player.y);
      if (!target) { w.cd = 0; continue; }
    } else if (w.def.kind === 'heal' && G.player.hp > G.P.maxHp * 0.85) { w.cd = 0; continue; }
    else if ((w.def.kind === 'warp' || w.def.kind === 'barrier' || w.def.kind === 'ring') && !acquire('nearest', 300, G.player.x, G.player.y)) { w.cd = 0; continue; }
    fireWeapon(w, target);
    w.cd = w.s.cd;
    w.reloadMax = w.s.cd;
    sfx('spell');
  }
}

function updateZones(dt) {
  for (const z of G.zones) {
    z.life -= dt; z.tick -= dt;
    const doTick = z.tick <= 0;
    if (doTick) z.tick = 0.25;
    forNear(z.x, z.y, z.r, e => {
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
  const speed = 150 * P.speed * (G.sprintT > G.t ? 2.3 : 1) * (p.atpT > 0 ? 1.3 : 1) * (G.inPill ? 0.65 : 1) * (G.sticky ? 0.7 : 1);
  // You grow 1.5% per level (your hitbox grows half as fast).
  p.r = 12 * (1 + SWIM.hitGrowth * (G.level - 1));
  let dx = 0, dy = 0;
  if (G.manual) { dx = G.manual.x; dy = G.manual.y; }
  else { const s = autoSteer(); dx = s.x; dy = s.y; }
  let m = Math.hypot(dx, dy);
  if (m > 1) { dx /= m; dy /= m; m = 1; }
  // Swim physics: the head can only turn so fast (traction), thrust drops mid-turn,
  // and sideways momentum drifts off rather than stopping dead.
  if (p.hd == null) p.hd = p.face;
  const trac = P.traction * (p.slick ? OBSTACLES.slick.traction : 1);
  const cur = Math.hypot(p.vx, p.vy);
  let thrust = 0;
  if (m > 0.05) {
    const da = angDiff(Math.atan2(dy, dx), p.hd);
    const turn = SWIM.turn * trac * (1 + SWIM.pivot * (1 - Math.min(1, cur / speed))) * dt;
    p.hd = Math.atan2(Math.sin(p.hd + clamp(da, -turn, turn)), Math.cos(p.hd + clamp(da, -turn, turn)));
    thrust = m * speed * (0.4 + 0.6 * Math.max(0, Math.cos(da)));
  }
  const hx = Math.cos(p.hd), hy = Math.sin(p.hd);
  let fwd = p.vx * hx + p.vy * hy, lat = -p.vx * hy + p.vy * hx;
  fwd = lerp(fwd, thrust, 1 - Math.pow(0.004, dt));
  lat *= Math.exp(-SWIM.grip * trac * dt);
  p.vx = fwd * hx - lat * hy; p.vy = fwd * hy + lat * hx;
  p.x += p.vx * dt; p.y += p.vy * dt;
  terrainPlayer(p, dt);
  // The arena ends at the edge of the womb's field; the egg itself is solid.
  const cdx = p.x - G.core.x, cdy = p.y - G.core.y, cdist = Math.hypot(cdx, cdy) || 1;
  if (cdist > CORE.arena) { p.x = G.core.x + cdx / cdist * CORE.arena; p.y = G.core.y + cdy / cdist * CORE.arena; }
  if (cdist < CORE.r + p.r) { p.x = G.core.x + cdx / cdist * (CORE.r + p.r); p.y = G.core.y + cdy / cdist * (CORE.r + p.r); }
  if (Math.hypot(p.vx, p.vy) > 20 && !acquire('nearest', 400, p.x, p.y)) p.face = Math.atan2(p.vy, p.vx);
  if (p.iframes > 0) p.iframes -= dt;
  if (p.flash > 0) p.flash -= dt;
  if (P.regen > 0) p.hp = Math.min(P.maxHp, p.hp + P.regen * dt);
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
    if (t) { const d = Math.hypot(t.x - p.x, t.y - p.y); if (d > 130) goal(t.x, t.y, 1.2); else goal(t.x, t.y, -0.4); }
  }
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
  const gl = Math.hypot(gx, gy);
  if (gl > 1.5) { gx = gx / gl * 1.5; gy = gy / gl * 1.5; }
  // Danger sampling.
  const bw = G.warp > 0 ? 0.3 : 1;
  const bul = [];
  for (const b of G.ebul) { const dx = b.x - p.x, dy = b.y - p.y; if (dx * dx + dy * dy < 300 * 300) bul.push(b); }
  const threatR = mode === 'hold' ? 80 : mode === 'hunt' ? 120 : 250;
  const step = 150 * G.P.speed * 0.45;
  let best = -Infinity, bx = 0, by = 0;
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
    if (G.hazards.length || G.boss) danger += hazardDanger(qx, qy, p.r) + hazardDanger(mx, my, p.r) * 0.5;
    // Turning is slow, so mildly prefer directions close to where the head already points.
    const interest = dx * gx + dy * gy + (i < 0 ? 0 : 0.18 * (Math.cos(p.hd || 0) * dx + Math.sin(p.hd || 0) * dy) / Math.max(0.6, G.P.traction));
    const score = interest - danger + (i < 0 ? (mode === 'hold' ? 0.4 : -0.1) : 0);
    if (score > best) { best = score; bx = dx; by = dy; }
  }
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
  sfx('pickup');
  banner(POWERUPS[type].name, type === 'chest' ? PAL.reward : PAL.pickup);
  switch (type) {
    case 'magnet': for (const g of G.gems) g.mag = true; break;
    case 'nuke':
      ring(p.x, p.y, 480, '#ff595e', 0.7, 10);
      cam.shake = 16;
      for (const e of G.enemies) {
        if (e.dead || Math.hypot(e.x - p.x, e.y - p.y) > 520) continue;
        if (e.boss) damageEnemy(e, e.maxHp * 0.15, { noCrit: true, dot: true, wname: 'Nuke' });
        else if (e.rival) damageEnemy(e, e.maxHp * 0.15, { noCrit: true, dot: true, wname: 'Nuke' }); // rivals and the Final Five just take a big hit
        else { e.hp = 0; killEnemy(e, {}); }
      }
      G.ebul.length = 0;
      break;
    case 'rage': G.rage = 8; break;
    case 'heal': healPlayer(P.maxHp * 0.35); break;
    case 'shield': G.shieldT = 5; break;
    case 'freeze': for (const e of G.enemies) e.frozen = e.boss ? 1.5 : 4; break;
    case 'chest': G.lootQueue.push({ kind: 'chest', src }); break;
  }
}

function gainXp(v) {
  G.xp += v * G.P.xp * (G.inPill ? 0.5 : 1); // the morning-after pill halves growth
  sfx('gem');
  while (G.xp >= G.xpNeed) {
    G.xp -= G.xpNeed;
    G.level++;
    G.xpNeed = xpNeed(G.level);
    casaLog(`LV ${G.level}  head +1.5%`);
    // Every level up is rewarded with a box.
    G.lootQueue.push({ kind: 'level' });
    // Weapon drafts: a new weapon mount at every SLOT_LEVELS level.
    if (SLOT_LEVELS.includes(G.level) && G.weapons.length < MAX_WEAPONS) {
      G.weapons.push(null);
      G.lootQueue.push({ kind: 'slot' });
      banner('WEAPON DRAFT!', PAL.upgrade);
      sysLine('slot', true); achieve('slot');
    }
  }
}

// ---------------------------------------------------------------- the egg (win condition)
// At EGG.level the egg's membrane becomes a target. Break it and you're born.
function openEgg(by) {
  if (G.eggE && !G.eggE.dead) return announceEgg(by);
  const def = { id: 'egg', name: "THE EGG'S MEMBRANE", hp: 1, speed: 0, armour: EGG.armour, r: CORE.r, dmg: 0, xp: 0, color: '#ffd6e8', shape: 'none', patterns: [] };
  const e = makeEnemy(def, G.core.x, G.core.y);
  e.hp = e.maxHp = EGG.hpBase * hpMul(G.t);
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
    const n = 28, bd = 10 * dmgMul(G.t), p = me();
    for (let i = 0; i < n; i++) eBullet(e.x + Math.cos(e.spin + i / n * TAU) * e.r, e.y + Math.sin(e.spin + i / n * TAU) * e.r, e.spin + i / n * TAU, 125, bd, 6, '#ff8fb8');
    const aim = Math.atan2(p.y - e.y, p.x - e.x);
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
function victory() {
  G.state = 'won';
  G.banner = null;
  achieve('born');
  sysLine('born', true);
  sfx('level'); vibrate([100, 60, 100, 60, 300]);
  if (typeof UI !== 'undefined') UI.showVictory();
}

// ---------------------------------------------------------------- main update
function update(dt) {
  G.t += dt; G.realT += dt; G.frameN = (G.frameN || 0) + 1; updateSevered(dt); updatePill(dt); updateYeast(dt);
  // Balancing timeline for the run log: level and HP% at every minute.
  if (G.t >= (G.nextLogT || 60)) { G.nextLogT = (G.nextLogT || 60) + 60; (G.tl || (G.tl = [])).push(G.level + '/' + Math.round(G.player.hp / G.P.maxHp * 100)); }
  const p = G.player;
  gridBuild();
  G.crowdT -= dt;
  if (G.crowdT <= 0) {
    G.crowdT = 0.25;
    for (const e of G.enemies) { if (e.dead) continue; let n = 0; forNear(e.x, e.y, 70, () => { n++; }); e.crowd = n + (e.boss ? 5 : 0); }
  }
  if (G.warp > 0) G.warp -= dt;
  const lsCap = G.relics.transfusion ? 9 : 3;
  G.lsBudget = Math.min(lsCap, (G.lsBudget || 0) + dt * lsCap); // lifesteal heals at most ~3 HP/s
  if (G.rage > 0) G.rage -= dt;
  if (G.shieldT > 0) G.shieldT -= dt;
  if (G.barrier > 0) G.barrier -= dt;
  updatePlayer(dt);
  updateCrossfire();
  for (const w of G.weapons) if (w) updateWeapon(w, dt);
  sigTick(dt);
  updateTethers(dt);
  updateShow(dt);
  updateSpells(dt);
  updateProjectiles(dt);
  updateZones(dt);
  updateTurrets(dt);
  for (const tm of G.timers) { tm.t -= dt; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(); } }
  updateEnemies(dt);
  updateTerrain(dt);
  updateCore(dt);
  updateBosses(dt);
  updateChrono(dt);
  // Enemy bullets.
  const bw0 = G.warp > 0 ? 0.3 : 1;
  for (const b of G.ebul) {
    if (b.dead) continue;
    const bw = bw0 * (b.slowT > G.realT ? 0.35 : 1);
    b.x += b.vx * dt * bw; b.y += b.vy * dt * bw; b.life -= dt;
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
    if (d2 < rr * rr) { b.dead = true; if (!(p.iframes > 0) && mirrorWomb(b)) continue; hurtPlayer(b.dmg, b.from, b.owner); }
  }
  updatePickups(dt);
  updateAmbient(dt);
  // Director.
  // Dense swarms (each monster is weaker to match: see enemyScale).
  const maxAlive = Math.min(CAPS.enemies - 30, 24 + G.t * 0.5);
  const rate = Math.min(9, (0.55 + G.t / 90 + Math.pow(G.t / 300, 2) * 0.9) * 1.7);
  G.spawnAcc += rate * dt * G.P.spawnMult * (G.showdown ? 0.35 : 1); // quieter while the Final Five fight you
  const hostile = G.enemies.reduce((n, e) => n + (e.charmed || e.rival || e.egg ? 0 : 1), 0);
  while (G.spawnAcc >= 1) { G.spawnAcc--; if (hostile < maxAlive) spawnRandom(); }
  if (G.t >= G.nextWave) { G.nextWave += 45; waveEvent(); }
  updateRivals(dt);
  updateShowdown();
  if (G.t >= SURGE_T && !G.surge) { achieve('surge'); sysLine('surge'); G.surge = true; banner('IMMUNE SURGE: THE HOST FIGHTS BACK', '#ff3df2'); sfx('boss'); vibrate(200); }
  if (G.t >= G.nextBoss) { G.nextBoss += BOSS_INTERVAL; spawnBoss(); }
  // FX.
  for (const q of G.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.92; q.vy *= 0.92; q.life -= dt; }
  for (const f of G.fx) f.life -= dt;
  for (const l of G.lights) l.life -= dt;
  for (const d of G.decals) d.life -= dt;
  for (const t of G.texts) { t.life -= dt; t.y -= 32 * dt; }
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
  G.state = 'over';
  sysLine('death', true);
  G.banner = null;
  sfx('boss');
  vibrate(300);
  if (typeof UI !== 'undefined') UI.showGameOver();
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
  if (d > 50) { INPUT.ox += dx / d * (d - 50); INPUT.oy += dy / d * (d - 50); dx = ev.clientX - INPUT.ox; dy = ev.clientY - INPUT.oy; }
  G.manual.x = dx / 50; G.manual.y = dy / 50;
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
  G.manual = x || y ? { x, y } : null;
}

// ---------------------------------------------------------------- audio
const AUDIO = { ctx: null, on: true, last: {} };
try { AUDIO.on = localStorage.getItem('sd_sound') !== '0'; } catch (e) { /* storage unavailable */ }
function initAudio() {
  if (AUDIO.ctx) { if (AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume(); return; }
  try { AUDIO.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AUDIO.ctx = null; }
}
const SFX = {
  shot:   { gap: 0.07, type: 'square',   f0: 880, f1: 420, dur: 0.045, vol: 0.025 },
  zap:    { gap: 0.08, type: 'sawtooth', f0: 1400, f1: 300, dur: 0.08, vol: 0.03 },
  boom:   { gap: 0.09, type: 'sawtooth', f0: 140, f1: 40, dur: 0.25, vol: 0.07 },
  gem:    { gap: 0.05, type: 'sine',     f0: 1200, f1: 1600, dur: 0.05, vol: 0.03 },
  pickup: { gap: 0.1,  type: 'triangle', f0: 500, f1: 1400, dur: 0.2, vol: 0.08 },
  hurt:   { gap: 0.15, type: 'square',   f0: 220, f1: 70, dur: 0.18, vol: 0.08 },
  react:  { gap: 0.1,  type: 'sine',     f0: 600, f1: 1300, dur: 0.12, vol: 0.05 },
  spell:  { gap: 0.2,  type: 'triangle', f0: 300, f1: 900, dur: 0.2, vol: 0.05 },
  level:  { gap: 0.2,  type: 'triangle', f0: 520, f1: 1560, dur: 0.35, vol: 0.09 },
  boss:   { gap: 0.5,  type: 'sawtooth', f0: 90, f1: 45, dur: 0.8, vol: 0.12 },
  rewind: { gap: 0.5,  type: 'sawtooth', f0: 1800, f1: 120, dur: 1.0, vol: 0.09 },
};
function sfx(name) {
  if (!AUDIO.on || !AUDIO.ctx || AUDIO.ctx.state !== 'running') return;
  const d = SFX[name], now = AUDIO.ctx.currentTime;
  if (!d || (AUDIO.last[name] && now - AUDIO.last[name] < d.gap)) return;
  AUDIO.last[name] = now;
  const o = AUDIO.ctx.createOscillator(), g = AUDIO.ctx.createGain();
  o.type = d.type;
  o.frequency.setValueAtTime(d.f0, now);
  o.frequency.exponentialRampToValueAtTime(d.f1, now + d.dur);
  g.gain.setValueAtTime(d.vol, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + d.dur);
  o.connect(g); g.connect(AUDIO.ctx.destination);
  o.start(now); o.stop(now + d.dur + 0.02);
}
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
  const notes = [1047, 1319, 1568, 1760, 2093], n = 2 + Math.min(3, best), soft = kind === 'branch' ? 0.6 : 1;
  for (let i = 0; i < n; i++) {
    const at = t + 0.46 + i * 0.075, f = notes[i] * (kind === 'branch' ? 0.75 : 1);
    sndTone(at, f, f, 0.5 + i * 0.05, 0.05 * soft, 'sine');
    sndTone(at, f * 2.76, f * 2.76, 0.18, 0.012 * soft, 'sine');
  }
  if (best >= 3) sndNoise(t + 0.5, 1.1, 'highpass', 6000, 9000, 0.5, 0.03);
  if (cursed) sndTone(t + 0.55, 98, 92, 0.7, 0.05, 'sawtooth');
  for (let i = 0; i < cards; i++) sndNoise(t + 0.45 + i * 0.12, 0.16, 'bandpass', 700, 2200, 1.2, 0.035);
}
function vibrate(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* unsupported */ } }

// ---------------------------------------------------------------- loop
let lastTs = 0;
const FPS = { v: 60 };
function frame(ts) {
  // Schedule the next frame first, and keep each stage separate, so one error can never freeze the game.
  requestAnimationFrame(frame);
  const raw = (ts - lastTs) / 1000;
  if (raw > 0 && raw < 0.5) FPS.v += (1 / raw - FPS.v) * 0.05;
  const dt = clamp(raw || 0, 0, 1 / 30);
  lastTs = ts;
  safely('update', () => {
    if (G && G.state === 'play') {
      keyboardSteer();
      // A boss death plays out in slow motion before its relic box opens.
      if (G.slowmo > 0) { G.slowmo -= dt; update(dt * 0.3); }
      else if (G.lootQueue.length && typeof UI !== 'undefined') UI.openLoot(G.lootQueue.shift());
      else update(dt);
    } else if (G && G.state === 'bossIntro') updateBossIntro(dt);
    else if (G && G.state === 'rewind') updateRewind(dt);
    else if (G && G.state === 'intro') updateIntro(dt);
  });
  safely('render', render);
  if (typeof UI !== 'undefined') safely('ui', () => UI.tick(dt));
}
// Errors are shown once on screen (and kept for the run log) instead of silently stopping the game.
const ERRS = { seen: {}, last: '' };
function safely(where, fn) {
  try { fn(); } catch (e) {
    const msg = where + ': ' + (e && e.message || e) + ' @ ' + ((e && e.stack || '').split('\n')[1] || '').trim().replace(/^at /, '').replace(/.*\/js\//, '');
    if (ERRS.seen[msg]) return;
    ERRS.seen[msg] = true; ERRS.last = msg;
    try { localStorage.setItem('sd_err', msg); } catch (e2) { /* ignore */ }
    let el = document.getElementById('errBox');
    if (!el) { el = document.createElement('div'); el.id = 'errBox'; el.style.cssText = 'position:fixed;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));z-index:99;background:#300;color:#fff;font:12px monospace;padding:8px;border:1px solid #f55;border-radius:4px;pointer-events:none;white-space:pre-wrap'; document.body.appendChild(el); }
    el.textContent = 'Something broke (the game kept going). Please send this: v' + APP_VERSION + ' ' + msg;
    setTimeout(() => { el.remove(); }, 12000);
  }
}
