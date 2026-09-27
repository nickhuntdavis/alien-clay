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
let W = 0, H = 0, DPR = 1, S = 1; // screen size (css px), pixel ratio, world->screen scale
const cam = { x: 0, y: 0, shake: 0 };

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  S = Math.min(W, H) / 520;
}
window.addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------- state
let G = null;
let uidSeq = 1;
const CAPS = { enemies: 300, proj: 900, ebul: 800, parts: 450, texts: 60, gems: 350 };

function newStats() {
  return {
    might: 1, haste: 1, reloadSpd: 1, magMult: 1, multishot: 0, projSpeed: 1, range: 1, area: 1, dur: 1,
    pierce: 0, crit: 0.05, critDmg: 1.6, maxHp: 120, regen: 0, speed: 1, magnet: 1, armour: 0, luck: 0,
    lifesteal: 0, elem: { phys: 1, fire: 1, ice: 1, shock: 1, poison: 1, arcane: 1 }, chain: 0,
    poisonCap: 12, react: 1, cdr: 1, xp: 1, dodge: 0,
  };
}

function newGame() {
  G = {
    state: 'play', t: 0, realT: 0,
    player: { x: 0, y: 0, vx: 0, vy: 0, r: 12, hp: 120, iframes: 0, face: -Math.PI / 2, flash: 0 },
    P: newStats(),
    enemies: [], proj: [], ebul: [], gems: [], pickups: [], zones: [], fx: [], parts: [], texts: [], turrets: [], timers: [],
    weapons: [null, null, null], spells: [null, null], passives: {},
    moveDir: 'kite', manual: null,
    kills: 0, level: 1, xp: 0, xpNeed: xpNeed(1),
    lootQueue: [{ kind: 'start' }], rerolls: 2,
    warp: 0, rage: 0, shieldT: 0, barrier: 0, barrierR: 0, barrierDmg: 0,
    nextBoss: BOSS_INTERVAL, bossCount: 0, boss: null, nextWave: 40,
    spawnAcc: 0, crowdT: 0, synergy: {}, banner: null,
    stats: { dmg: {}, hurt: {}, lastHit: '', reactions: 0, reactBy: {}, merges: 0, bossKills: 0, maxCombo: 0 },
  };
  cam.x = 0; cam.y = 0; cam.shake = 0;
}

function xpNeed(l) { return Math.floor(4 + (l - 1) * 2.5 + Math.pow(l - 1, 2.15) * 0.28); }
function hpMul(t) { return 1 + t / 120 + Math.pow(t / 220, 2.4); }
const SURGE_T = 900; // Storm Surge: after 15 minutes enemy damage compounds every minute.
function dmgMul(t) { return (1 + t / 240 + Math.pow(t / 600, 2)) * (t > SURGE_T ? Math.pow(1.3, (t - SURGE_T) / 60) : 1); }
// Late-game fire-rate pressure for ranged enemies.
function fireMul(t) { return 1 + t / 420; }

// ---------------------------------------------------------------- spatial grid
const CELL = 80;
const grid = new Map();
function gridKey(cx, cy) { return (cx + 50000) * 100000 + (cy + 50000); }
function gridBuild() {
  grid.clear();
  for (const e of G.enemies) {
    if (e.dead) continue;
    const k = gridKey(Math.floor(e.x / CELL), Math.floor(e.y / CELL));
    let c = grid.get(k);
    if (!c) { c = []; grid.set(k, c); }
    c.push(e);
  }
}
// Calls fn(e, d2) for every live enemy whose body overlaps circle (x,y,r). fn returns true to stop.
function forNear(x, y, r, fn) {
  const R = r + 60; // max enemy radius margin
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
    case 'elite': return (e.boss ? 2 : e.elite ? 1 : 0) * 1e9 - d2;
    case 'shooters': return (e.boss || e.def.shoot || e.def.ai === 'summon' || e.def.ai === 'medic' ? 1 : 0) * 1e9 - d2;
    case 'random': return Math.random();
  }
  return -d2;
}
function acquire(dir, range, x, y, exclude) {
  let best = null, bv = -Infinity;
  const r2 = range * range;
  for (const e of G.enemies) {
    if (e.dead || e.phased || e === exclude) continue;
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
    if (e.dead || e.phased) continue;
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
    spin: 0, active: 0, ang: 0, blades: [], beamT: 0, beamTick: 0, beams: [], s: null };
  computeStats(w);
  w.ammo = w.s.mag;
  return w;
}

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
  else s.dmg = b.dmg * (1 + 0.25 * (L - 1) + dmgB) * P.might * elemMult;
  const physBonus = syn.phys && d.elem === 'phys' ? 1.15 : 1;
  s.cd = (b.cd || 0) * Math.pow(0.95, L - 1) * (1 + cdB) / (w.isSpell ? 1 : P.haste * physBonus);
  if (w.isSpell) s.cd *= P.cdr;
  s.mag = Math.max(1, Math.round((b.mag || 1) * (1 + 0.12 * (L - 1)) * P.magMult));
  s.reload = (b.reload || 0) * Math.pow(0.95, L - 1) / P.reloadSpd;
  const multi = ['gun', 'lob', 'chain', 'mine', 'orbit', 'ring', 'strike'].includes(d.kind) ? P.multishot : 0;
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
  const lvl = Math.min(8, Math.max(G.weapons[ia].lvl, G.weapons[ib].lvl));
  const dir = G.weapons[ia].dir;
  G.weapons[ib] = null;
  const w = makeSlot(m.out, false, lvl);
  w.dir = dir;
  G.weapons[ia] = w;
  G.stats.merges++;
  recomputeAll();
  banner('FUSION: ' + w.def.name.toUpperCase(), w.def.color);
  sfx('level');
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
  const minR = req.kind === 'boss' ? 2 : req.kind === 'chest' ? 1 : 0;
  if (req.kind === 'start') {
    const pool = ['blaster', 'smg', 'shotgun', 'flamer', 'frost', 'tesla', 'glaive', 'needler', 'seeker', 'rocket', 'railgun', 'venom'];
    const ids = shuffle(pool).slice(0, 3);
    for (const id of ids) opts.push(optNewWeapon(id, 0));
    return opts;
  }
  const cands = [];
  const merges = availableMerges();
  for (const m of merges) cands.push({ w: 60, make: () => optMerge(m) , key: 'm' + m.out });
  G.weapons.forEach((w, i) => { if (w && w.lvl < 8) cands.push({ w: 11, key: 'wu' + i, make: r => optUpgrade(w, r) }); });
  G.spells.forEach((w, i) => { if (w && w.lvl < 8) cands.push({ w: 8, key: 'su' + i, make: r => optUpgrade(w, r) }); });
  if (G.weapons.some(w => !w)) {
    const owned = new Set(G.weapons.filter(Boolean).map(w => w.id));
    const pool = shuffle(Object.keys(WEAPONS).filter(id => !WEAPONS[id].merged && !owned.has(id))).slice(0, 4);
    for (const id of pool) cands.push({ w: 7, key: 'wn' + id, make: r => optNewWeapon(id, r) });
  }
  if (G.spells.some(w => !w)) {
    const owned = new Set(G.spells.filter(Boolean).map(w => w.id));
    const pool = shuffle(Object.keys(SPELLS).filter(id => !owned.has(id))).slice(0, 3);
    for (const id of pool) cands.push({ w: G.t > 30 ? 6 : 3, key: 'sn' + id, make: r => optNewSpell(id, r) });
  }
  for (const id in PASSIVES) {
    const st = G.passives[id] || 0;
    if (st >= PASSIVES[id].max) continue;
    cands.push({ w: 3.2, key: 'p' + id, pmin: PASSIVES[id].minRarity || 0, make: r => optPassive(id, r) });
  }
  // Guarantee a fusion option when one is available.
  const chosen = [];
  const mc = cands.filter(c => c.key[0] === 'm');
  if (mc.length) chosen.push(mc[0]);
  while (chosen.length < 3) {
    const rest = cands.filter(c => !chosen.includes(c));
    if (!rest.length) break;
    let tot = rest.reduce((a, c) => a + c.w, 0), x = Math.random() * tot;
    for (const c of rest) { x -= c.w; if (x <= 0) { chosen.push(c); break; } }
  }
  for (const c of chosen) opts.push(c.make(Math.max(rollRarity(minR), c.pmin || 0)));
  const fillers = [optHeal, optRerolls, optOvercharge];
  let fi = 0;
  while (opts.length < 3) opts.push(fillers[fi++ % 3]());
  return opts;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function optNewWeapon(id, r) {
  const def = WEAPONS[id], lvl = [1, 2, 3, 4][r];
  return { rarity: r, tag: 'NEW WEAPON', icon: def.icon, color: def.color, elem: def.elem, title: def.name,
    sub: `${ELEMENTS[def.elem].name} | Lv ${lvl}`, desc: def.desc + (def.merged ? '' : fuseHint(id)),
    apply: () => { const i = G.weapons.findIndex(w => !w); if (i >= 0) { G.weapons[i] = makeSlot(id, false, lvl); recomputeAll(); } } };
}
function optNewSpell(id, r) {
  const def = SPELLS[id], lvl = [1, 2, 3, 4][r];
  return { rarity: r, tag: 'NEW SPELL', icon: def.icon, color: def.color, elem: def.elem, title: def.name,
    sub: `${ELEMENTS[def.elem].name} spell | Lv ${lvl}`, desc: def.desc,
    apply: () => { const i = G.spells.findIndex(w => !w); if (i >= 0) { G.spells[i] = makeSlot(id, true, lvl); recomputeAll(); } } };
}
function optUpgrade(w, r) {
  const n = RARITIES[r].lvls, to = Math.min(8, w.lvl + n);
  const bonus = lvBonusText(w.def, w.lvl, to);
  let desc = `+${pc(0.25 * (to - w.lvl))} damage, faster cycling` + (bonus ? `. ${bonus}` : '');
  if (!w.isSpell && to >= MERGE_MIN_LEVEL && w.lvl < MERGE_MIN_LEVEL && !w.def.merged) desc += '. Unlocks fusion!';
  return { rarity: r, tag: w.isSpell ? 'SPELL UPGRADE' : 'UPGRADE', icon: w.def.icon, color: w.def.color, elem: w.def.elem, title: w.def.name,
    sub: `Lv ${w.lvl} > ${to}${to === 8 ? ' (MAX)' : ''}`, desc,
    apply: () => { w.lvl = to; computeStats(w); w.ammo = w.s.mag; w.reloadT = 0; } };
}
function optPassive(id, r) {
  const p = PASSIVES[id], intish = ['multishot', 'pierce', 'armour'].includes(id);
  const v = intish ? Math.max(1, Math.floor(RARITIES[r].mult)) * p.v : p.v * RARITIES[r].mult;
  const st = G.passives[id] || 0;
  return { rarity: r, tag: 'POWER-UP', icon: p.icon, color: '#9fb3c8', title: p.name, sub: `Stack ${st + 1}/${p.max}`, desc: p.fmt(v),
    apply: () => { p.apply(G.P, v, G); G.passives[id] = st + 1; recomputeAll(); } };
}
function optMerge(m) {
  const def = WEAPONS[m.out];
  return { rarity: 3, tag: 'FUSION', icon: def.icon, color: def.color, elem: def.elem, title: def.name, fusion: true,
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
  if (e.dead || e.phased) return 0;
  const P = G.P, syn = G.synergy;
  let d = dmg;
  let crit = false;
  if (!src.noCrit && Math.random() < (src.crit != null ? src.crit : P.crit)) { crit = true; d *= P.critDmg; }
  if (e.mark > 0) d *= syn.arcane ? 1.5 : 1.3;
  if (e.frozen > 0 && syn.ice) d *= 1.25;
  if (!src.dot) d = Math.max(d * 0.15, d - effArmour(e));
  e.hp -= d;
  e.flash = 0.07;
  const key = src.wname || 'Other';
  G.stats.dmg[key] = (G.stats.dmg[key] || 0) + d;
  if (!src.dot && (crit || d >= 4 || Math.random() < 0.3)) {
    floatText(e.x, e.y - e.r, Math.round(d) + (crit ? '!' : ''), crit ? '#ffd23f' : src.elem && src.elem !== 'phys' ? ELEMENTS[src.elem].color : '#ffffff', crit ? 17 : 12);
  }
  if (src.shred) e.shred = Math.min(e.armour + 4, e.shred + src.shred);
  if (src.knock && !e.boss) {
    const k = src.knock * (e.def.ai === 'aura' || e.def.hp > 200 ? 0.3 : 1);
    const kx = src.kx != null ? src.kx : e.x - G.player.x, ky = src.ky != null ? src.ky : e.y - G.player.y;
    const l = Math.hypot(kx, ky) || 1;
    e.kx += kx / l * k; e.ky += ky / l * k;
  }
  if (src.freezeHit && !e.boss) { e.frozen = Math.max(e.frozen, 1.2); }
  if (src.elem && src.elem !== 'phys' && !src.noStatus) applyElement(e, src.elem, dmg, src);
  // Shocked enemies arc a portion of incoming damage to a neighbour.
  if (e.shock > 0 && !src.noArc && src.elem !== 'shock' && Math.random() < (syn.shock ? 0.5 : 0.25)) {
    const n = acquire('nearest', 130, e.x, e.y, e);
    if (n) { bolt(e.x, e.y, n.x, n.y, ELEMENTS.shock.color, 0.12); damageEnemy(n, dmg * 0.45, { elem: 'shock', noStatus: true, noArc: true, noCrit: true, wname: 'Shock arcs' }); }
  }
  if (e.hp <= 0 && !e.dead) killEnemy(e, src);
  return d;
}

function react(e, id, src) {
  if (e.reactCd > 0) return false;
  e.reactCd = 0.35;
  G.stats.reactions++;
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
        damageEnemy(e, dmg * 2.5 * rm + 10, rsrc);
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
        aoe(e.x, e.y, 70, (dmg * 1.4 + 6) * rm, rsrc, '#e0fbfc');
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
  forNear(x, y, r, e => { damageEnemy(e, dmg, src); });
  ring(x, y, r, color || '#ffae42', 0.35, 4);
  spawnPart(x, y, color || '#ffae42', Math.min(18, 6 + r / 8), r * 2.4, 0.45, 3.5);
  cam.shake = Math.min(8, cam.shake + r / 40);
  sfx('boom');
}

function doChain(x, y, first, dmg, jumps, jumpR, src) {
  let cur = first, px = x, py = y;
  const hit = [first];
  for (let k = 0; k <= jumps && cur; k++) {
    const el = src.elem2 && k % 2 ? src.elem2 : src.elem;
    bolt(px, py, cur.x, cur.y, ELEMENTS[el].color, 0.16);
    damageEnemy(cur, dmg * Math.pow(0.88, k), Object.assign({}, src, { elem: el }));
    px = cur.x; py = cur.y;
    let next = null, bd = jumpR * jumpR;
    forNear(px, py, jumpR, (e, d2) => { if (!hit.includes(e) && d2 < bd) { bd = d2; next = e; } });
    if (next) hit.push(next);
    cur = next;
  }
}

function killEnemy(e, src) {
  e.dead = true;
  G.kills++;
  const P = G.P;
  spawnPart(e.x, e.y, e.def.color || e.color, e.boss ? 40 : 7, e.boss ? 260 : 130, 0.5, e.boss ? 5 : 3);
  // XP
  if (e.xp > 0) dropGem(e.x, e.y, e.xp);
  if (P.lifesteal > 0 && G.lsBudget > 0) { const h = Math.min(P.lifesteal, G.lsBudget); G.lsBudget -= h; healPlayer(h, true); }
  if (e.def.split) {
    for (let i = 0; i < 2; i++) {
      const s = makeEnemy(ENEMIES[e.def.split], e.x + rand(-12, 12), e.y + rand(-12, 12));
      G.enemies.push(s);
    }
  }
  if (e.def.ai === 'bomber') bomberBlast(e);
  if (e.boss) {
    G.boss = null;
    G.stats.bossKills++;
    G.lootQueue.push({ kind: 'boss' });
    healPlayer(P.maxHp * 0.3);
    banner(e.name + ' DESTROYED', '#ffd23f');
    for (let i = 0; i < 12; i++) dropGem(e.x + rand(-60, 60), e.y + rand(-60, 60), e.xp / 12);
    cam.shake = 14;
    sfx('boss');
  } else if (e.elite) {
    G.pickups.push(makePickup('chest', e.x, e.y));
  } else if (Math.random() < 0.011 * (1 + P.luck)) {
    const types = ['magnet', 'nuke', 'rage', 'heal', 'shield', 'freeze', 'heal', 'magnet'];
    G.pickups.push(makePickup(Math.random() < 0.12 ? 'chest' : pick(types), e.x, e.y));
  }
}

function bomberBlast(e) {
  const r = 60, dmg = e.dmg;
  ring(e.x, e.y, r, '#ff2e2e', 0.35, 5);
  spawnPart(e.x, e.y, '#ff5a36', 14, 220, 0.45, 4);
  forNear(e.x, e.y, r, o => { if (o !== e) damageEnemy(o, dmg * 2, { elem: 'fire', noCrit: true, wname: 'Bomber friendly fire' }); });
  const p = G.player;
  if (Math.hypot(p.x - e.x, p.y - e.y) < r + p.r) hurtPlayer(dmg, 'Bomber blast');
}

function dropGem(x, y, v) {
  if (G.gems.length >= CAPS.gems) {
    // Merge into a random existing gem to keep counts bounded.
    const g = G.gems[Math.floor(Math.random() * G.gems.length)];
    g.v += v; return;
  }
  G.gems.push({ x: x + rand(-5, 5), y: y + rand(-5, 5), v, mag: false, vx: 0, vy: 0 });
}
function makePickup(type, x, y) { return { type, x, y, life: 25, bob: Math.random() * TAU }; }

function healPlayer(n, silent) {
  const p = G.player, P = G.P;
  const before = p.hp;
  p.hp = Math.min(P.maxHp, p.hp + n);
  if (!silent && p.hp - before >= 1) floatText(p.x, p.y - 24, '+' + Math.round(p.hp - before), '#8ac926', 15);
}

function hurtPlayer(dmg, from) {
  const p = G.player, P = G.P;
  if (G.state !== 'play' || p.iframes > 0 || G.shieldT > 0) return;
  if (Math.random() < P.dodge) { floatText(p.x, p.y - 24, 'DODGE', '#9ef0ff', 14); p.iframes = 0.25; return; }
  const d = Math.max(1, dmg - P.armour);
  p.hp -= d;
  const k = from || 'Unknown';
  G.stats.hurt[k] = (G.stats.hurt[k] || 0) + d;
  G.stats.lastHit = k;
  p.iframes = 0.7; p.flash = 0.2;
  cam.shake = Math.min(10, cam.shake + 5);
  floatText(p.x, p.y - 24, '-' + Math.round(d), '#ff4d6d', 15);
  sfx('hurt');
  vibrate(25);
  if (p.hp <= 0) { p.hp = 0; gameOver(); }
}

// ---------------------------------------------------------------- enemies
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
  if (opts && opts.elite) {
    e.elite = true; e.hp *= 5; e.maxHp *= 5; e.r *= 1.35; e.armour += 2; e.dmg *= 1.4; e.xp *= 6;
  }
  return e;
}

function spawnPos() {
  const a = Math.random() * TAU;
  const vw = W / 2 / S, vh = H / 2 / S;
  const d = Math.hypot(vw, vh) + rand(30, 90);
  return { x: G.player.x + Math.cos(a) * d, y: G.player.y + Math.sin(a) * d, a };
}

function spawnRandom() {
  const t = G.t;
  const pool = [];
  let tot = 0;
  // Shooters become more common as the storm builds.
  const wOf = d => d.w * (d.shoot ? 1 + t / 300 : 1);
  for (const id in ENEMIES) { const d = ENEMIES[id]; if (d.w > 0 && d.from <= t) { pool.push(d); tot += wOf(d); } }
  let x = Math.random() * tot, def = pool[0];
  for (const d of pool) { x -= wOf(d); if (x <= 0) { def = d; break; } }
  const p = spawnPos();
  const n = def.group || 1;
  const eliteChance = Math.min(0.05, 0.004 + t / 7000);
  for (let i = 0; i < n; i++) {
    if (G.enemies.length >= CAPS.enemies) return;
    G.enemies.push(makeEnemy(def, p.x + rand(-30, 30), p.y + rand(-30, 30), { elite: n === 1 && t > 45 && Math.random() < eliteChance }));
  }
}

function waveEvent() {
  const t = G.t, p = G.player;
  const kind = pick(t < 120 ? ['ring', 'swarm'] : ['ring', 'swarm', 'elite', 'barrage']);
  if (kind === 'ring') {
    const n = Math.min(36, 16 + Math.floor(t / 20)), d = Math.hypot(W / S, H / S) / 2 + 40;
    const def = t > 150 ? ENEMIES.skitter : ENEMIES.crawler;
    for (let i = 0; i < n; i++) { const a = i / n * TAU; G.enemies.push(makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d)); }
    banner('ENCIRCLEMENT', '#ff4d6d');
  } else if (kind === 'swarm') {
    for (let k = 0; k < 3; k++) { const s = spawnPos(); for (let i = 0; i < 10; i++) G.enemies.push(makeEnemy(ENEMIES.wisp, s.x + rand(-40, 40), s.y + rand(-40, 40))); }
    banner('SWARM INCOMING', '#fee440');
  } else if (kind === 'elite') {
    for (let k = 0; k < 2; k++) { const s = spawnPos(); G.enemies.push(makeEnemy(pick([ENEMIES.brute, ENEMIES.charger, ENEMIES.warlock, ENEMIES.bulwark]), s.x, s.y, { elite: true })); }
    banner('ELITES APPROACH', '#ffd23f');
  } else {
    for (let k = 0; k < 5; k++) { const s = spawnPos(); G.enemies.push(makeEnemy(ENEMIES.spitter, s.x, s.y)); }
    banner('BULLET STORM', '#e056fd');
  }
}

function spawnBoss() {
  const def = BOSSES[G.bossCount % BOSSES.length];
  const round = Math.floor(G.bossCount / BOSSES.length);
  const s = spawnPos();
  const e = makeEnemy(def, s.x, s.y);
  e.boss = true;
  e.hp = e.maxHp = def.hp * (1 + G.bossCount * 0.9) * (1 + G.t / 320) * (1 + round);
  e.armour = def.armour + round * 4;
  e.speed = def.speed;
  e.dmg = def.dmg * dmgMul(G.t);
  e.pat = 0; e.patT = 0; e.fireT = 0;
  G.enemies.push(e);
  G.boss = e;
  G.bossCount++;
  banner('WARNING: ' + def.name, '#ff4d6d');
  sfx('boss');
  vibrate(120);
}

let shooterName = '';
function eBullet(x, y, a, speed, dmg, r, color) {
  if (G.ebul.length >= CAPS.ebul) return;
  speed *= 1 + Math.min(0.7, G.t / 1500);
  G.ebul.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, dmg, r: r || 5, color: color || '#ff3df2', life: 7, from: (shooterName || 'Enemy') + ' bullets' });
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
    shooterName = e.name;
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
    const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist, uy = dy / dist;
    let mx = ux, my = uy, spd = e.speed;
    const frozen = e.frozen > 0;
    const slow = frozen ? 0 : (1 - e.chillAmt);
    if (e.boss) {
      bossAI(e, edt, dist, ux, uy);
      mx = e.mvx; my = e.mvy; spd = e.mvs;
    } else if (!frozen) {
      switch (e.def.ai) {
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
            for (let i = 0; i < 3 && G.enemies.length < CAPS.enemies; i++) G.enemies.push(makeEnemy(ENEMIES.skitter, e.x + rand(-20, 20), e.y + rand(-20, 20)));
            ring(e.x, e.y, 40, e.color, 0.3);
          }
          break;
      }
    }
    // Movement (knockback decays).
    const f = frozen ? 0 : slow;
    e.x += (mx * spd * f * warpF + e.kx) * dt;
    e.y += (my * spd * f * warpF + e.ky) * dt;
    const kd = Math.pow(0.02, dt);
    e.kx *= kd; e.ky *= kd;
    // Contact damage.
    if (!e.phased && dist < e.r + p.r) {
      if (G.barrier > 0) {
        e.kx -= ux * 300; e.ky -= uy * 300;
        if (!(e.hitT.b > G.t)) { e.hitT.b = G.t + 0.4; damageEnemy(e, G.barrierDmg, { elem: 'arcane', wname: 'Aegis Barrier' }); }
      } else if (!frozen) hurtPlayer(e.dmg, e.name + (e.elite ? ' (elite)' : ''));
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
  e.patT += dt;
  if (e.patT > 5.5) { e.patT = 0; e.pat = (e.pat + 1) % pats.length; e.fireT = 0; e.st = 0; }
  const pat = pats[e.pat];
  const p = G.player;
  const aim = Math.atan2(p.y - e.y, p.x - e.x);
  const bd = e.def.dmg * 0.35 * dmgMul(G.t);
  // Default movement: keep medium distance.
  e.mvx = dist > 230 ? ux : dist < 150 ? -ux : -uy; e.mvy = dist > 230 ? uy : dist < 150 ? -uy : ux; e.mvs = e.speed;
  if (e.patT < 0.6) return; // brief pause between patterns
  e.fireT -= dt;
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
  const s = w.s, d = w.def;
  return { elem: d.elem, elem2: d.elem2, wname: d.name, crit: s.crit, shred: s.shred || 0, knock: s.knock || 0, freezeHit: s.freezeHit };
}

function updateWeapon(w, dt) {
  const s = w.s, d = w.def;
  const rage = G.rage > 0;
  if (d.kind === 'orbit') { updateOrbit(w, dt); return; }
  if (d.kind === 'beam' && w.beamT > 0) updateBeam(w, dt);
  if (w.reloadT > 0) {
    w.reloadT -= dt * (rage ? 3 : 1);
    if (w.reloadT <= 0) { w.reloadT = 0; w.ammo = s.mag; }
    w.spin = Math.max(0, w.spin - dt);
    return;
  }
  const rate = (rage ? 2 : 1) * (d.spinup ? 1 + 2 * w.spin : 1);
  w.cd -= dt * rate;
  let shots = 0;
  while (w.cd <= 0 && shots < 3) {
    let target = null;
    if (!d.noTarget && d.kind !== 'mine') {
      target = acquire(w.dir, s.range, G.player.x, G.player.y);
      if (!target) { w.cd = Math.max(w.cd, -s.cd); w.spin = Math.max(0, w.spin - dt); return; }
    }
    if (d.kind === 'mine' && !acquire('nearest', s.range, G.player.x, G.player.y)) { w.cd = 0; return; }
    fireWeapon(w, target);
    shots++;
    w.cd += s.cd;
    if (d.spinup) w.spin = Math.min(1, w.spin + s.cd * 0.6);
    if (!rage) {
      w.ammo--;
      if (w.ammo <= 0) { w.reloadT = w.reloadMax = s.reload; w.cd = Math.max(w.cd, 0); return; }
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
        const a0 = Math.atan2(target.y - p.y, target.x - p.x);
        const n = s.count;
        for (let i = 0; i < n; i++) {
          const a = n > 1 ? a0 + (i / (n - 1) - 0.5) * s.spread + rand(-0.04, 0.04) : a0 + rand(-s.spread, s.spread) * 0.5;
          spawnProj(w, p.x, p.y, a, src);
        }
        p.face = a0;
      }
      if (d.style !== 'flame' || Math.random() < 0.2) sfx('shot');
      break;
    }
    case 'chain': {
      const ts = s.count > 1 ? acquireMany(w.dir, s.range, p.x, p.y, s.count) : [target];
      for (const t of ts) doChain(p.x, p.y, t, s.dmg, s.chain, s.jump, src);
      sfx('zap');
      break;
    }
    case 'beam':
      w.beamT = s.dur; w.beamTick = 0; w.beams = [];
      break;
    case 'lob':
      for (let i = 0; i < s.count; i++) {
        const tx = target.x + (i === 0 && s.count < 3 ? 0 : rand(-s.spread, s.spread)), ty = target.y + (i === 0 && s.count < 3 ? 0 : rand(-s.spread, s.spread));
        G.proj.push({ lob: true, sx: p.x, sy: p.y, tx, ty, x: p.x, y: p.y, t: 0, flight: s.flight * rand(0.9, 1.15), w, src, color: d.color, dead: false });
      }
      break;
    case 'mine':
      for (let i = 0; i < s.count; i++) {
        G.proj.push({ mine: true, x: p.x + rand(-26, 26), y: p.y + rand(-26, 26), life: s.life, arm: 0.5, r: 7, w, src, color: d.color, dead: false });
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
  const el = d.elem2 && Math.random() < 0.5 ? d.elem2 : d.elem;
  const pr = {
    x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, speed, r: s.size || 4, dmg: s.dmg, pierce: s.pierce || 0,
    life: (s.range || 400) / speed, max: 0, w, src: el !== src.elem ? Object.assign({}, src, { elem: el }) : src,
    color: el !== d.elem ? ELEMENTS[el].color : d.color, style: d.style || 'bullet', explode: s.explode || 0, homing: s.homing || 0,
    bounce: s.bounce || 0, boomerang: s.boomerang || 0, chainHit: s.chainHit || 0, aura: s.aura || 0, pull: s.pull || 0,
    hits: null, tick: 0, dead: false, tgt: null, back: false,
  };
  if (pr.boomerang) pr.life = s.range / speed * 2 + 0.3;
  pr.max = pr.life;
  if (over) Object.assign(pr, over);
  G.proj.push(pr);
  return pr;
}

function updateOrbit(w, dt) {
  const s = w.s, p = G.player;
  w.blades.length = 0;
  if (w.active > 0) {
    w.active -= dt;
    if (w.active <= 0) { w.reloadT = w.reloadMax = s.reload; }
  } else if (w.reloadT > 0) {
    w.reloadT -= dt * (G.rage > 0 ? 3 : 1);
    if (w.reloadT <= 0) { w.reloadT = 0; w.active = s.dur; }
    return;
  } else { w.active = s.dur; }
  w.ang += s.spin * dt;
  const rad = s.radius * (w.def.base.pulse ? 1 + 1.1 * (0.5 - 0.5 * Math.cos(G.realT * 2.2)) : 1);
  const src = weaponSrc(w);
  if (!w.hitKeys || w.hitKeys.length < s.count) w.hitKeys = Array.from({ length: s.count }, (_, i) => w.uid + '_' + i);
  for (let i = 0; i < s.count; i++) {
    const a = w.ang + i / s.count * TAU;
    const bx = p.x + Math.cos(a) * rad, by = p.y + Math.sin(a) * rad;
    const hk = w.hitKeys[i];
    w.blades.push(bx, by, a);
    forNear(bx, by, s.size, e => {
      if (e.hitT[hk] > G.t) return;
      e.hitT[hk] = G.t + 0.4;
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
      pr.life -= dt; pr.arm -= dt;
      if (pr.arm <= 0) {
        let trig = false;
        forNear(pr.x, pr.y, 34, () => { trig = true; return true; });
        if (trig || pr.life <= 0) { pr.dead = true; detonateMine(pr); }
      }
      continue;
    }
    // Homing.
    if (pr.homing) {
      if (!pr.tgt || pr.tgt.dead) pr.tgt = acquire(pr.w.dir === 'random' ? 'nearest' : pr.w.dir, 380, pr.x, pr.y);
      if (pr.tgt) {
        const ta = Math.atan2(pr.tgt.y - pr.y, pr.tgt.x - pr.x), ca = Math.atan2(pr.vy, pr.vx);
        const da = ((ta - ca + Math.PI * 3) % TAU) - Math.PI;
        const na = ca + clamp(da, -pr.homing * dt, pr.homing * dt);
        pr.vx = Math.cos(na) * pr.speed; pr.vy = Math.sin(na) * pr.speed;
      }
    }
    // Boomerang return.
    if (pr.boomerang && !pr.back && pr.life < pr.max / 2) { pr.back = true; pr.hits = null; }
    if (pr.back) {
      const dx = p.x - pr.x, dy = p.y - pr.y, d = Math.hypot(dx, dy) || 1;
      pr.vx = dx / d * pr.speed * 1.15; pr.vy = dy / d * pr.speed * 1.15;
      if (d < 18) { pr.dead = true; continue; }
    }
    pr.x += pr.vx * dt; pr.y += pr.vy * dt;
    pr.life -= dt;
    if (pr.life <= 0) { pr.dead = true; if (pr.explode) aoe(pr.x, pr.y, pr.explode, pr.dmg, pr.src, pr.color); continue; }
    // Aura projectiles (void orb): periodic area damage and pull.
    if (pr.aura) {
      pr.tick -= dt;
      forNear(pr.x, pr.y, pr.aura, e => {
        if (!e.boss) { const dx = pr.x - e.x, dy = pr.y - e.y, d = Math.hypot(dx, dy) || 1; e.x += dx / d * pr.pull * dt; e.y += dy / d * pr.pull * dt; }
        if (pr.tick <= 0) damageEnemy(e, pr.dmg, pr.src);
      });
      if (pr.tick <= 0) pr.tick = 0.25;
      continue;
    }
    // Collision.
    forNear(pr.x, pr.y, pr.r, e => {
      if (pr.hits && pr.hits.includes(e.id)) return;
      damageEnemy(e, pr.dmg, Object.assign({}, pr.src, pr.src.knock ? { kx: pr.vx, ky: pr.vy } : null));
      spawnPart(pr.x, pr.y, pr.color, 1, 80, 0.2, 2);
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
      if (pr.pierce > 0) { pr.pierce--; return false; }
      pr.dead = true; return true;
    });
  }
}

function landLob(pr) {
  const s = pr.w.s, d = pr.w.def;
  if (d.base.explode) aoe(pr.tx, pr.ty, s.area, s.dmg, pr.src, pr.color);
  else { forNear(pr.tx, pr.ty, s.area * 0.6, e => { damageEnemy(e, s.dmg, pr.src); }); spawnPart(pr.tx, pr.ty, pr.color, 8, 90, 0.4); }
  if (s.dur > 0) G.zones.push({ x: pr.tx, y: pr.ty, r: s.area, life: s.dur, max: s.dur, dps: s.dmg * (d.base.explode ? 0.3 : 0.9), elem: d.elem, pull: 0, color: pr.color, tick: 0, src: pr.src });
}

function detonateMine(pr) {
  const s = pr.w.s;
  if (s.singularity) {
    G.zones.push({ x: pr.x, y: pr.y, r: s.explode * 1.2, life: 1.2, max: 1.2, dps: s.dmg * 0.3, elem: 'arcane', pull: 260, color: '#9d4edd', tick: 0, src: pr.src,
      onEnd: z => aoe(z.x, z.y, s.explode, s.dmg, pr.src, '#c77dff') });
  } else aoe(pr.x, pr.y, s.explode, s.dmg, pr.src, pr.color);
}

function updateSpells(dt) {
  for (const w of G.spells) {
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
      if (doTick) damageEnemy(e, z.dps * 0.25, Object.assign({}, z.src, { noCrit: true, knock: 0 }));
    });
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
        spawnProj(t.w, t.x, t.y, a, t.src, { r: 3.5, speed: 620, vx: Math.cos(a) * 620, vy: Math.sin(a) * 620, life: t.range / 620, dmg: t.dmg, pierce: 0, style: 'bullet', color: '#ffd60a' });
      }
    }
  }
}

// ---------------------------------------------------------------- player
function updatePlayer(dt) {
  const p = G.player, P = G.P;
  const speed = 150 * P.speed;
  let dx = 0, dy = 0;
  if (G.manual) { dx = G.manual.x; dy = G.manual.y; }
  else { const s = autoSteer(); dx = s.x; dy = s.y; }
  const m = Math.hypot(dx, dy);
  if (m > 1) { dx /= m; dy /= m; }
  const k = 1 - Math.pow(0.0005, dt);
  p.vx = lerp(p.vx, dx * speed, k); p.vy = lerp(p.vy, dy * speed, k);
  p.x += p.vx * dt; p.y += p.vy * dt;
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
  if (mode === 'collect' || mode === 'kite') {
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
    if (d2 < 380 * 380 && !e.phased) near.push(e);
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
  if (Math.hypot(p.x, p.y) > 2500) goal(0, 0, 0.4);
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
    const interest = dx * gx + dy * gy;
    const score = interest - danger + (i < 0 ? (mode === 'hold' ? 0.4 : -0.1) : 0);
    if (score > best) { best = score; bx = dx; by = dy; }
  }
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
      if (d < p.r + 8) { g.dead = true; gainXp(g.v); }
    }
  }
  for (const u of G.pickups) {
    if (u.dead) continue;
    u.life -= dt; u.bob += dt * 4;
    if (u.life <= 0) { u.dead = true; continue; }
    const dx = p.x - u.x, dy = p.y - u.y, d = Math.hypot(dx, dy) || 1;
    if (d < 55) { u.x += dx / d * 200 * dt; u.y += dy / d * 200 * dt; }
    if (d < p.r + 14) { u.dead = true; applyPickup(u.type); }
  }
}

function applyPickup(type) {
  const p = G.player, P = G.P;
  sfx('pickup');
  banner(POWERUPS[type].name, POWERUPS[type].color);
  switch (type) {
    case 'magnet': for (const g of G.gems) g.mag = true; break;
    case 'nuke':
      ring(p.x, p.y, 480, '#ff595e', 0.7, 10);
      cam.shake = 16;
      for (const e of G.enemies) {
        if (e.dead || Math.hypot(e.x - p.x, e.y - p.y) > 520) continue;
        if (e.boss) damageEnemy(e, e.maxHp * 0.15, { noCrit: true, dot: true, wname: 'Nuke' });
        else { e.hp = 0; killEnemy(e, {}); }
      }
      G.ebul.length = 0;
      break;
    case 'rage': G.rage = 8; break;
    case 'heal': healPlayer(P.maxHp * 0.35); break;
    case 'shield': G.shieldT = 5; break;
    case 'freeze': for (const e of G.enemies) e.frozen = e.boss ? 1.5 : 4; break;
    case 'chest': G.lootQueue.push({ kind: 'chest' }); break;
  }
}

function gainXp(v) {
  G.xp += v * G.P.xp;
  sfx('gem');
  while (G.xp >= G.xpNeed) {
    G.xp -= G.xpNeed;
    G.level++;
    G.xpNeed = xpNeed(G.level);
    G.lootQueue.push({ kind: 'level' });
  }
}

// ---------------------------------------------------------------- main update
function update(dt) {
  G.t += dt; G.realT += dt;
  const p = G.player;
  gridBuild();
  G.crowdT -= dt;
  if (G.crowdT <= 0) {
    G.crowdT = 0.25;
    for (const e of G.enemies) { if (e.dead) continue; let n = 0; forNear(e.x, e.y, 70, () => { n++; }); e.crowd = n + (e.boss ? 5 : 0); }
  }
  if (G.warp > 0) G.warp -= dt;
  G.lsBudget = Math.min(3, (G.lsBudget || 0) + dt * 3); // lifesteal heals at most ~3 HP/s
  if (G.rage > 0) G.rage -= dt;
  if (G.shieldT > 0) G.shieldT -= dt;
  if (G.barrier > 0) G.barrier -= dt;
  updatePlayer(dt);
  for (const w of G.weapons) if (w) updateWeapon(w, dt);
  updateSpells(dt);
  updateProjectiles(dt);
  updateZones(dt);
  updateTurrets(dt);
  for (const tm of G.timers) { tm.t -= dt; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(); } }
  updateEnemies(dt);
  // Enemy bullets.
  const bw = G.warp > 0 ? 0.3 : 1;
  for (const b of G.ebul) {
    if (b.dead) continue;
    b.x += b.vx * dt * bw; b.y += b.vy * dt * bw; b.life -= dt;
    if (b.life <= 0) { b.dead = true; continue; }
    const dx = b.x - p.x, dy = b.y - p.y, d2 = dx * dx + dy * dy;
    if (G.barrier > 0 && d2 < G.barrierR * G.barrierR) {
      b.dead = true;
      // Reflect as a player projectile.
      const bs = G.spells.find(w => w && w.id === 'barrier');
      if (bs && G.proj.length < CAPS.proj) {
        const a = Math.atan2(dy, dx);
        G.proj.push({ x: b.x, y: b.y, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, speed: 420, r: 5, dmg: G.barrierDmg, pierce: 1, life: 1, max: 1, w: bs,
          src: { elem: 'arcane', wname: 'Aegis Barrier' }, color: '#48cae4', style: 'bullet', explode: 0, homing: 0, bounce: 0, boomerang: 0, chainHit: 0, aura: 0, pull: 0, hits: null, tick: 0, dead: false });
      }
      continue;
    }
    const rr = b.r + p.r * 0.6;
    if (d2 < rr * rr) { b.dead = true; hurtPlayer(b.dmg, b.from); }
  }
  updatePickups(dt);
  // Director.
  const maxAlive = Math.min(CAPS.enemies - 30, 25 + G.t * 0.5);
  const rate = Math.min(13, 1 + G.t / 40 + Math.pow(G.t / 300, 2) * 2);
  G.spawnAcc += rate * dt;
  while (G.spawnAcc >= 1) { G.spawnAcc--; if (G.enemies.length < maxAlive) spawnRandom(); }
  if (G.t >= G.nextWave) { G.nextWave += 45; waveEvent(); }
  if (G.t >= SURGE_T && !G.surge) { G.surge = true; banner('STORM SURGE: DAMAGE RISING EVERY MINUTE', '#ff3df2'); sfx('boss'); vibrate(200); }
  if (G.t >= G.nextBoss) { G.nextBoss += BOSS_INTERVAL; spawnBoss(); }
  // FX.
  for (const q of G.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.92; q.vy *= 0.92; q.life -= dt; }
  for (const f of G.fx) f.life -= dt;
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
}

function gameOver() {
  G.state = 'over';
  G.banner = null;
  sfx('boss');
  vibrate(300);
  if (typeof UI !== 'undefined') UI.showGameOver();
}

// ---------------------------------------------------------------- rendering
function sx(x) { return (x - cam.x) * S + W / 2; }
function sy(y) { return (y - cam.y) * S + H / 2; }

function drawShape(shape, x, y, r, rot) {
  ctx.beginPath();
  switch (shape) {
    case 'tri': for (let i = 0; i < 3; i++) { const a = rot + i / 3 * TAU; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } break;
    case 'square': ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7); break;
    case 'diamond': ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.8, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.8, y); break;
    case 'hex': for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rot * 0.2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } break;
    case 'oct': for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } break;
    case 'star': for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + rot * 0.3, rr = i % 2 ? r * 0.5 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } break;
    case 'spike': for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + rot, rr = i % 2 ? r * 0.7 : r * 1.1; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } break;
    case 'cross': { const t = r * 0.38; ctx.rect(x - t, y - r, t * 2, r * 2); ctx.rect(x - r, y - t, r * 2, t * 2); break; }
    default: ctx.arc(x, y, r, 0, TAU);
  }
  ctx.closePath();
}

function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#07060f';
  ctx.fillRect(0, 0, W, H);
  if (!G) return;
  const shx = cam.shake ? rand(-cam.shake, cam.shake) : 0, shy = cam.shake ? rand(-cam.shake, cam.shake) : 0;
  ctx.save();
  ctx.translate(shx, shy);
  drawBackground();
  const p = G.player;
  const vx0 = cam.x - W / 2 / S - 80, vx1 = cam.x + W / 2 / S + 80, vy0 = cam.y - H / 2 / S - 80, vy1 = cam.y + H / 2 / S + 80;
  const vis = o => o.x > vx0 && o.x < vx1 && o.y > vy0 && o.y < vy1;

  // Zones.
  for (const z of G.zones) {
    const a = Math.min(1, z.life / 0.4) * 0.35;
    ctx.globalAlpha = a;
    ctx.fillStyle = z.color;
    ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S, 0, TAU); ctx.fill();
    ctx.globalAlpha = a * 2;
    ctx.strokeStyle = z.color; ctx.lineWidth = 2;
    if (z.pull) { for (let k = 0; k < 3; k++) { const rr = ((G.realT * 0.8 + k / 3) % 1) * z.r; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), (z.r - rr) * S, 0, TAU); ctx.stroke(); } ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), 14 * S, 0, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S, 0, TAU); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;

  // Gems.
  for (const g of G.gems) {
    if (!vis(g)) continue;
    const r = (g.v >= 20 ? 7 : g.v >= 5 ? 5.5 : 4) * S;
    ctx.fillStyle = g.v >= 20 ? '#ffd23f' : g.v >= 5 ? '#80ffdb' : '#4cc9f0';
    const x = sx(g.x), y = sy(g.y);
    ctx.beginPath(); ctx.moveTo(x, y - r * 1.3); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r * 1.3); ctx.lineTo(x - r, y); ctx.fill();
  }
  // Pickups.
  for (const u of G.pickups) {
    if (!vis(u)) continue;
    const d = POWERUPS[u.type], x = sx(u.x), y = sy(u.y) + Math.sin(u.bob) * 3, r = 13 * S;
    if (u.life < 5 && Math.floor(u.life * 6) % 2) continue;
    ctx.fillStyle = d.color; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(x, y, r * 1.7, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    drawShape('hex', x, y, r, 0); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = d.color; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = d.color; ctx.font = `bold ${Math.round(14 * S)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.letter, x, y + 1);
  }
  // Mines & lob shadows.
  for (const pr of G.proj) {
    if (pr.mine) {
      const x = sx(pr.x), y = sy(pr.y);
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x, y, 7 * S, 0, TAU); ctx.fill();
      ctx.fillStyle = pr.arm > 0 || Math.floor(G.realT * 5) % 2 ? pr.color : '#fff';
      ctx.beginPath(); ctx.arc(x, y, 3.5 * S, 0, TAU); ctx.fill();
    } else if (pr.lob) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(sx(pr.x), sy(pr.y), 6 * S, 0, TAU); ctx.fill();
    }
  }
  // Turrets.
  for (const t of G.turrets) {
    const x = sx(t.x), y = sy(t.y);
    ctx.fillStyle = '#333'; drawShape('hex', x, y, 12 * S, 0); ctx.fill();
    ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t.face) * 16 * S, y + Math.sin(t.face) * 16 * S); ctx.lineWidth = 4; ctx.stroke();
  }

  // Enemies.
  for (const e of G.enemies) {
    if (!vis(e)) continue;
    const x = sx(e.x), y = sy(e.y), r = e.r * S;
    ctx.globalAlpha = e.phased ? 0.25 : 1;
    if (e.elite || e.boss) { ctx.fillStyle = e.boss ? 'rgba(255,60,90,0.18)' : 'rgba(255,210,63,0.2)'; ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, TAU); ctx.fill(); }
    if (e.def.ai === 'charge' && e.st === 1) { ctx.strokeStyle = 'rgba(241,91,181,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + e.dashX * 250 * S, y + e.dashY * 250 * S); ctx.stroke(); }
    if (e.aimT > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 - e.aimT) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(e.aimA) * 700 * S, y + Math.sin(e.aimA) * 700 * S); ctx.stroke(); }
    const rot = e.age * (e.def.shape === 'spike' ? 3 : 1) + (e.def.shape === 'tri' ? Math.atan2(G.player.y - e.y, G.player.x - e.x) : 0);
    if (e.def.shape === 'eye') {
      ctx.fillStyle = e.flash > 0 ? '#fff' : '#2d0a4e'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = e.color; ctx.lineWidth = 4; ctx.stroke();
      const la = Math.atan2(G.player.y - e.y, G.player.x - e.x);
      ctx.fillStyle = '#ff3df2'; ctx.beginPath(); ctx.arc(x + Math.cos(la) * r * 0.4, y + Math.sin(la) * r * 0.4, r * 0.35, 0, TAU); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x + Math.cos(la) * r * 0.5, y + Math.sin(la) * r * 0.5, r * 0.15, 0, TAU); ctx.fill();
    } else {
      drawShape(e.def.shape, x, y, r, rot);
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#bde0fe' : e.color;
      ctx.fill();
      ctx.lineWidth = e.elite || e.boss ? 3 : 1.5;
      ctx.strokeStyle = e.elite ? '#ffd23f' : e.boss ? '#fff' : 'rgba(0,0,0,0.5)';
      ctx.stroke();
    }
    // Status rings.
    let si = 0;
    const st = (c) => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 3 + si * 3, 0, TAU); ctx.stroke(); si++; };
    if (e.burn > 0) st('#ff7a2f');
    if (e.chill > 0) st('#6fd8ff');
    if (e.poison > 0) st('#8dff4a');
    if (e.shock > 0) st('#ffe94a');
    if (e.mark > 0) st('#c77dff');
    if ((e.auraArm > 0 || e.armour >= 8) && !e.boss) { ctx.strokeStyle = '#8da9c4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r + 1, -2.4, -0.7); ctx.stroke(); }
    if ((e.elite || e.hp < e.maxHp) && !e.boss && e.maxHp > 30) {
      const bw = Math.max(18, r * 2);
      ctx.fillStyle = '#000'; ctx.fillRect(x - bw / 2, y - r - 8, bw, 3);
      ctx.fillStyle = e.elite ? '#ffd23f' : '#ff4d6d'; ctx.fillRect(x - bw / 2, y - r - 8, bw * Math.max(0, e.hp / e.maxHp), 3);
    }
  }
  ctx.globalAlpha = 1;

  // Player.
  const px = sx(p.x), py = sy(p.y);
  if (G.barrier > 0) { ctx.strokeStyle = 'rgba(72,202,228,0.8)'; ctx.fillStyle = 'rgba(72,202,228,0.12)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, G.barrierR * S, 0, TAU); ctx.fill(); ctx.stroke(); }
  if (G.shieldT > 0) { ctx.strokeStyle = '#48cae4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 22 * S, 0, TAU); ctx.stroke(); }
  if (G.rage > 0) { ctx.fillStyle = 'rgba(255,146,76,0.25)'; ctx.beginPath(); ctx.arc(px, py, (24 + Math.sin(G.realT * 20) * 3) * S, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = p.iframes > 0 && Math.floor(G.realT * 20) % 2 ? 0.4 : 1;
  ctx.save(); ctx.translate(px, py); ctx.rotate(p.face);
  ctx.fillStyle = p.flash > 0 ? '#ff4d6d' : '#3cf0ff';
  ctx.beginPath(); ctx.moveTo(16 * S, 0); ctx.lineTo(-10 * S, 10 * S); ctx.lineTo(-5 * S, 0); ctx.lineTo(-10 * S, -10 * S); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
  // Player mini HP bar.
  ctx.fillStyle = '#000'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S, 4);
  ctx.fillStyle = p.hp / G.P.maxHp < 0.3 ? '#ff4d6d' : '#8ac926'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S * (p.hp / G.P.maxHp), 4);

  // Drones & orbit blades & beams.
  ctx.globalCompositeOperation = 'lighter';
  for (const w of G.weapons) {
    if (!w) continue;
    if (w.def.drones) {
      for (let i = 0; i < w.s.count; i++) { const o = dronePos(w, i, w.s.count); ctx.fillStyle = w.def.color; drawShape('diamond', sx(o.x), sy(o.y), 7 * S, 0); ctx.fill(); }
    }
    if (w.blades.length) {
      for (let i = 0; i < w.blades.length; i += 3) {
        const x = sx(w.blades[i]), y = sy(w.blades[i + 1]);
        ctx.save(); ctx.translate(x, y); ctx.rotate(w.blades[i + 2] + G.realT * 8);
        ctx.fillStyle = w.def.color; ctx.fillRect(-w.s.size * S, -2.5 * S, w.s.size * 2 * S, 5 * S); ctx.fillRect(-2.5 * S, -w.s.size * 0.6 * S, 5 * S, w.s.size * 1.2 * S);
        ctx.restore();
      }
    }
    if (w.beams.length && w.beamT > 0) {
      for (const b of w.beams) {
        const L = w.s.range * S, x2 = px + Math.cos(b.a) * L, y2 = py + Math.sin(b.a) * L;
        ctx.strokeStyle = w.def.color; ctx.globalAlpha = 0.35; ctx.lineWidth = w.s.size * 2.4 * S; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = w.s.size * 0.6 * S; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }
  }
  // Projectiles.
  for (const pr of G.proj) {
    if (pr.mine || !vis(pr)) continue;
    const x = sx(pr.x), y = sy(pr.y);
    if (pr.lob) {
      const yy = y - (pr.h || 0) * S;
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(x, yy, 6 * S, 0, TAU); ctx.fill();
      continue;
    }
    const a = Math.atan2(pr.vy, pr.vx), r = pr.r * S;
    ctx.fillStyle = pr.color; ctx.strokeStyle = pr.color;
    switch (pr.style) {
      case 'flame': {
        const k = 1 - pr.life / pr.max;
        ctx.globalAlpha = 0.7 * (1 - k);
        if (k < 0.35 && pr.src.elem === 'fire') ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.arc(x, y, r * (0.6 + k * 1.4), 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
      case 'rail': ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 60 * S, y - Math.sin(a) * 60 * S); ctx.lineTo(x, y); ctx.stroke(); break;
      case 'bolt': case 'needle': case 'shard':
        ctx.lineWidth = (pr.style === 'shard' ? 4 : 2.5) * S; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * 3.5, y - Math.sin(a) * r * 3.5); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke(); break;
      case 'glaive': case 'disc':
        ctx.save(); ctx.translate(x, y); ctx.rotate(G.realT * 18);
        drawShape(pr.style === 'glaive' ? 'star' : 'hex', 0, 0, r, 0); ctx.fill(); ctx.restore(); break;
      case 'void':
        ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(x, y, pr.aura * S, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); break;
      case 'rocket': case 'missile':
        ctx.lineWidth = r * 1.2; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * 2.4, y - Math.sin(a) * r * 2.4); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke();
        if (Math.random() < 0.5) spawnPart(pr.x - pr.vx * 0.02, pr.y - pr.vy * 0.02, '#ff9e00', 1, 20, 0.25, 2);
        break;
      default: ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }
  // Particles.
  for (const q of G.parts) {
    if (!vis(q)) continue;
    ctx.globalAlpha = Math.max(0, q.life / q.max);
    ctx.fillStyle = q.color;
    const s = q.size * S;
    ctx.fillRect(sx(q.x) - s / 2, sy(q.y) - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  // FX.
  for (const f of G.fx) {
    const k = f.life / f.max;
    if (f.type === 'ring') {
      ctx.globalAlpha = k; ctx.strokeStyle = f.color; ctx.lineWidth = f.w * k + 1;
      ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S * (1.1 - k * 0.4), 0, TAU); ctx.stroke();
    } else if (f.type === 'bolt') {
      ctx.globalAlpha = k; ctx.strokeStyle = f.color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(sx(f.pts[0]), sy(f.pts[1]));
      for (let i = 2; i < f.pts.length; i += 2) ctx.lineTo(sx(f.pts[i]), sy(f.pts[i + 1]));
      ctx.stroke();
    } else if (f.type === 'warn') {
      ctx.globalAlpha = 0.5; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 0.2; ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S * (1 - k), 0, TAU); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // Enemy bullets on top: outer glow + white core, batched.
  const byColor = {};
  for (const b of G.ebul) { if (!vis(b)) continue; (byColor[b.color] || (byColor[b.color] = [])).push(b); }
  for (const c in byColor) {
    ctx.fillStyle = c; ctx.beginPath();
    for (const b of byColor[c]) { const x = sx(b.x), y = sy(b.y), r = (b.r + 2) * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill();
  }
  ctx.fillStyle = '#fff'; ctx.beginPath();
  for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x), y = sy(b.y), r = b.r * 0.5 * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
  ctx.fill();

  // Floating texts.
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of G.texts) {
    ctx.globalAlpha = Math.min(1, t.life / t.max * 2);
    ctx.font = `bold ${Math.round(t.size * Math.max(0.8, S))}px sans-serif`;
    ctx.fillStyle = '#000'; ctx.fillText(t.txt, sx(t.x) + 1, sy(t.y) + 1);
    ctx.fillStyle = t.color; ctx.fillText(t.txt, sx(t.x), sy(t.y));
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (G.warp > 0) { ctx.fillStyle = 'rgba(120,130,255,0.08)'; ctx.fillRect(0, 0, W, H); }
  if (p.hp / G.P.maxHp < 0.3) { ctx.fillStyle = `rgba(255,0,40,${0.08 + Math.sin(G.realT * 6) * 0.05})`; ctx.fillRect(0, 0, W, H); }
  drawHud();
}

function drawBackground() {
  const gs = 64;
  const x0 = cam.x - W / 2 / S, y0 = cam.y - H / 2 / S;
  ctx.strokeStyle = 'rgba(80,90,160,0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = Math.floor(x0 / gs) * gs; gx < x0 + W / S; gx += gs) { const x = sx(gx); ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let gy = Math.floor(y0 / gs) * gs; gy < y0 + H / S; gy += gs) { const y = sy(gy); ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  // Deterministic specks.
  ctx.fillStyle = 'rgba(160,170,255,0.25)';
  const cs = 128;
  for (let gx = Math.floor(x0 / cs); gx <= Math.floor((x0 + W / S) / cs); gx++) for (let gy = Math.floor(y0 / cs); gy <= Math.floor((y0 + H / S) / cs); gy++) {
    const h = Math.abs(Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1;
    const h2 = Math.abs(Math.sin(gx * 39.3468 + gy * 11.135) * 24634.6345) % 1;
    ctx.fillRect(sx(gx * cs + h * cs), sy(gy * cs + h2 * cs), 2, 2);
  }
}

function drawHud() {
  const p = G.player, top = UI.safeTop || 0;
  // XP bar.
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, top, W, 8);
  ctx.fillStyle = '#4cc9f0'; ctx.fillRect(0, top, W * Math.min(1, G.xp / G.xpNeed), 8);
  // HP bar.
  const hw = Math.min(200, W * 0.34);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(10, top + 14, hw, 14);
  ctx.fillStyle = p.hp / G.P.maxHp < 0.3 ? '#ff4d6d' : '#8ac926'; ctx.fillRect(10, top + 14, hw * Math.max(0, p.hp / G.P.maxHp), 14);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(10, top + 14, hw, 14);
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText(`${Math.ceil(p.hp)} / ${G.P.maxHp}`, 16, top + 21.5);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`LV ${G.level}`, 10, top + 42);
  ctx.fillStyle = '#ff8fab'; ctx.fillText(`${G.kills} kills`, 58, top + 42);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif';
  const m = Math.floor(G.t / 60), s = Math.floor(G.t % 60);
  ctx.fillText(`${m}:${s < 10 ? '0' : ''}${s}`, W / 2, top + 24);
  // Status chips.
  let chips = [];
  if (G.rage > 0) chips.push(['OVERDRIVE', '#ff924c']);
  if (G.shieldT > 0) chips.push(['SHIELD', '#48cae4']);
  if (G.warp > 0) chips.push(['WARP', '#b8c0ff']);
  if (G.barrier > 0) chips.push(['AEGIS', '#48cae4']);
  if (G.manual) chips.push(['MANUAL', '#fff']);
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
  chips.forEach((c, i) => { ctx.fillStyle = c[1]; ctx.fillText(c[0], 10 + i * 78, top + 60); });
  // Boss bar.
  if (G.boss && !G.boss.dead) {
    const b = G.boss, bw = Math.min(360, W - 40), bx = (W - bw) / 2, by = top + 76;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, by, bw, 12);
    ctx.fillStyle = '#ff4d6d'; ctx.fillRect(bx, by, bw * Math.max(0, b.hp / b.maxHp), 12);
    ctx.strokeStyle = '#fff'; ctx.strokeRect(bx, by, bw, 12);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText(b.name + (b.armour ? `  [ARMOUR ${Math.round(effArmour(b))}]` : ''), W / 2, by - 8);
    // Off-screen pointer.
    const dx = b.x - cam.x, dy = b.y - cam.y;
    if (Math.abs(dx * S) > W / 2 || Math.abs(dy * S) > H / 2) {
      const a = Math.atan2(dy, dx), r = Math.min(W, H) / 2 - 40;
      const ax = W / 2 + Math.cos(a) * r, ay = H / 2 + Math.sin(a) * r;
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = '#ff4d6d';
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, 9); ctx.lineTo(-8, -9); ctx.fill(); ctx.restore();
    }
  }
  // Banner.
  if (G.banner) {
    const b = G.banner, a = Math.min(1, b.t * 2);
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = `900 ${Math.min(26, W / 16)}px sans-serif`;
    ctx.fillStyle = '#000'; ctx.fillText(b.text, W / 2 + 2, H * 0.3 + 2);
    ctx.fillStyle = b.color; ctx.fillText(b.text, W / 2, H * 0.3);
    ctx.globalAlpha = 1;
  }
  // Joystick.
  if (INPUT.active) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(INPUT.ox, INPUT.oy, 50, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(INPUT.ox + G.manual.x * 50, INPUT.oy + G.manual.y * 50, 20, 0, TAU); ctx.fill();
  }
}

// ---------------------------------------------------------------- input
const INPUT = { active: false, id: null, ox: 0, oy: 0, keys: {} };
cv.addEventListener('pointerdown', ev => {
  if (!G || G.state !== 'play') return;
  INPUT.active = true; INPUT.id = ev.pointerId; INPUT.ox = ev.clientX; INPUT.oy = ev.clientY;
  G.manual = { x: 0, y: 0 };
  try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
});
cv.addEventListener('pointermove', ev => {
  if (!INPUT.active || ev.pointerId !== INPUT.id || !G.manual) return;
  let dx = ev.clientX - INPUT.ox, dy = ev.clientY - INPUT.oy;
  const d = Math.hypot(dx, dy);
  if (d > 50) { INPUT.ox += dx / d * (d - 50); INPUT.oy += dy / d * (d - 50); dx = ev.clientX - INPUT.ox; dy = ev.clientY - INPUT.oy; }
  G.manual.x = dx / 50; G.manual.y = dy / 50;
});
const endTouch = ev => { if (ev.pointerId !== INPUT.id) return; INPUT.active = false; INPUT.id = null; if (G) G.manual = null; };
cv.addEventListener('pointerup', endTouch);
cv.addEventListener('pointercancel', endTouch);
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
function vibrate(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* unsupported */ } }

// ---------------------------------------------------------------- loop
let lastTs = 0;
function frame(ts) {
  const dt = Math.min(1 / 30, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  if (G && G.state === 'play') {
    keyboardSteer();
    if (G.lootQueue.length && typeof UI !== 'undefined') UI.openLoot(G.lootQueue.shift());
    else update(dt);
  }
  render();
  if (typeof UI !== 'undefined') UI.tick(dt);
  requestAnimationFrame(frame);
}
