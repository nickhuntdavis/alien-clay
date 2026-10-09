'use strict';
// Storm Directive - show-season arsenal: Bullet Siphon, Committee Cannon, Grudge Rifle, Wake Blade,
// Scrap Cannon, Mimic Core, Parasite Seeder, Thermal Lance, Tether Coil, Gacha Blaster, Prequel Launcher,
// plus the weapon-wide power-ups (Focus Lock, Crossfire, Momentum, Anchor Link, Last Word, Tactical Reload).

// Damage multiplier a weapon carries into every hit it makes.
function weaponMult(w) {
  // Focus, Crossfire and Momentum add together and cap at +150% so they can't snowball multiplicatively.
  const P = G.P;
  let bonus = 0;
  if (P.focus > 0) bonus += Math.min(P.focus, 0.03 * (w.focusT || 0));
  if (P.crossfire > 0 && w.cross) bonus += P.crossfire;
  if (P.momentum > 0) { const p = me(); bonus += P.momentum * Math.min(1.5, Math.hypot(p.vx || 0, p.vy || 0) / 150); }
  let m = 1 + Math.min(1.5, bonus);
  if (w.def.gacha) m *= GACHA_TIERS[w.gachaTier].mult;
  if (w.hk) m *= 1 + 2 * w.hk; // Hell's Kitchen
  if (w.copyK) m *= w.copyK; // an Imaginary Friend's copy
  m *= tankDamageOut(); // Big Boned, Stubborn Streak
  // Few mounts, focused genome: with only one or two weapons, each one hits much harder.
  const nw = G.weapons.filter(Boolean).length;
  if (!w.isSpell) m *= nw <= 1 ? 1.9 : nw === 2 ? 1.4 : 1;
  return m;
}

// Fire-rate multiplier from Crossfire (scatter) and Anchor Link.
function rateBonus() {
  const P = G.P;
  let r = 1;
  if (G.scatter) r *= 1 + P.crossfire;
  if (P.anchorLink > 0 && Math.hypot(me().x - G.core.x, me().y - G.core.y) < 450) r *= 1 + P.anchorLink;
  if (G.relics.feverdream) r *= 1 + Math.min(0.6, 0.03 * (G.feverN || 0));
  r *= boonRate(); // Twin Soul
  r *= genesRate(); // Hackerman, Powerhouse, Sugar Rush
  return r;
}

// Crossfire Protocol: weapons sharing a target hit harder; three different targets fire faster.
function updateCrossfire() {
  const P = G.P;
  const ws = G.weapons.filter(w => w && w.curTarget && !w.curTarget.dead);
  for (const w of G.weapons) if (w) w.cross = P.crossfire > 0 && !!w.curTarget && ws.some(o => o !== w && o.curTarget === w.curTarget);
  G.scatter = P.crossfire > 0 && ws.length >= 3 && new Set(ws.map(w => w.curTarget)).size === ws.length;
}

// Projectile overrides for special magazines (gacha tiers, Last Word rounds).
function gunOver(w) {
  let o = null;
  if (w.def.gacha) {
    const T = GACHA_TIERS[w.gachaTier];
    o = { color: T.color };
    if (w.gachaTier === 3) { o.explode = 45; o.chainHit = 2; o.pierce = (w.s.pierce || 0) + 2; }
  }
  if (w.isLast) o = Object.assign(o || {}, { explode: Math.max(50, w.s.explode || 0), color: '#ffd23f', r: (w.s.size || 4) * 1.6 });
  return o;
}

function rollGacha(w, silent) {
  const luck = G.P.luck;
  const ws = GACHA_TIERS.map((t, i) => t.w * (1 + luck * i));
  let x = Math.random() * ws.reduce((a, b) => a + b, 0), tier = 0;
  for (let i = 0; i < ws.length; i++) { x -= ws[i]; if (x <= 0) { tier = i; break; } }
  w.gachaTier = tier;
  if (silent || w.echo) return;
  const T = GACHA_TIERS[tier], p = me();
  floatText(p.x, p.y - 34, T.name + '!', T.color, tier >= 2 ? 16 : 12, 1);
  if (tier === 3) { banner('LEGENDARY MAG!', T.color); achieve('gachagold'); sysLine('gacha'); sfx('level'); }
}

// Every reload goes through here so Tactical Reload can fire its shockwave.
function startReload(w) {
  const P = G.P, p = G.player;
  w.reloadT = w.reloadMax = w.s.reload;
  if (w.rivals) w.rivals = 0; // Sibling Rivalry: everyone settles down
  sigReload(w);
  genesReload(w);
  tacticalWave();
}
// Tactical Nap's shockwave (reloads, and the angels' and the Siphon's own versions of a reload).
function tacticalWave() {
  const P = G.P, p = G.player;
  if (P.tactical <= 0) return;
  const r = 60 + 40 * P.tactical, r2 = r * r;
  for (const b of G.ebul) { const dx = b.x - p.x, dy = b.y - p.y; if (dx * dx + dy * dy < r2) { b.dead = true; spawnPart(b.x, b.y, '#e0fbff', 1, 50, 0.25); } }
  forNear(p.x, p.y, r, e => { damageEnemy(e, 5 * (1 + G.t / 120), { elem: 'phys', wname: 'Tactical Nap', noCrit: true, knock: 220, kx: e.x - p.x, ky: e.y - p.y }); });
  ring(p.x, p.y, r, '#e0fbff', 0.35, 4);
}

// ---------------------------------------------------------------- Bullet Siphon / Hailreturn
// The store is a queue of bullets, each remembering how hard it hit: a returned shot hits with that strength
// (half to twice normal), so heavy fire comes back heavy. With nothing to eat, it only dribbles out a weak
// spit (40%) every 1.5s: the Siphon is a counter, and it needs bullets to be any good.
const SIPHON = { trickle: 1 / 1.5, dry: 0.4, min: 0.5, max: 2 };
function siphonStrength(b) { return clamp(b.dmg / (12 * BUL.dmg * dmgNow()), SIPHON.min, SIPHON.max); }
function siphonStore(w, k) { const q = w.q || (w.q = []); if (q.length >= w.s.mag) return false; q.push(k); w.stored = q.length; return true; }
function updateSiphon(w, dt) {
  const s = w.s, d = w.def, p = G.player, r2 = s.area * s.area;
  w.q = w.q || [];
  for (const b of G.ebul) {
    if (b.dead || w.q.length >= s.mag) continue;
    const dx = b.x - p.x, dy = b.y - p.y;
    if (dx * dx + dy * dy < r2) {
      b.dead = true; siphonStore(w, siphonStrength(b)); siphonAte(w, b);
      if (!w.echo && ++G.stats.absorbed === 200) achieve('siphoned');
      if (Math.random() < 0.3) spawnPart(b.x, b.y, d.color, 1, 60, 0.25, 2);
    }
  }
  // Dry: a weak spit now and then, so it's never completely useless.
  if (!w.q.length) { w.trickle = (w.trickle || 0) + dt * SIPHON.trickle; if (w.trickle >= 1) { w.trickle = 0; siphonStore(w, SIPHON.dry); } } else w.trickle = 0;
  siphonOverflow(w);
  w.stored = w.q.length;
  w.ammo = w.stored;
  if (w.lastTarget && !w.lastTarget.dead) w.focusT += dt;
  w.cd -= dt * (G.rage > 0 ? 2 : 1) * rateBonus();
  if (w.cd > 0 || w.stored < 1) { if (w.cd < 0) w.cd = 0; return; }
  const t = acquire(w.dir, s.range, p.x, p.y);
  if (!t) { w.cd = 0; w.curTarget = null; return; }
  w.cd = s.cd;
  const k = w.q.shift(); w.stored = w.q.length;
  if (w.stored === 0 && !(w.dryT > G.t)) { w.dryT = G.t + 2; tacticalWave(); }
  if (t !== w.lastTarget) { w.focusT = 0; w.lastTarget = t; }
  w.curTarget = t;
  const src = weaponSrc(w), a0 = Math.atan2(t.y - p.y, t.x - p.x), over = gunOver(w);
  src.mult *= k;
  const V = sigVolley(w, a0), tg = V.owner || t, a1 = V.owner ? Math.atan2(tg.y - p.y, tg.x - p.x) : a0;
  // Last Word: the last stored bullet hits like the rest put together.
  if (hasSig(w, 'savings')) src.mult *= 1 + Math.min(0.8, 0.02 * w.stored); // Savings Account
  const lsrc = w.stored === 0 && G.P.lastRound > 0 ? Object.assign({}, src, { mult: src.mult * (3 + Math.min(4, G.P.lastRound)) }) : src;
  for (let i = 0; i < s.count; i++) {
    const a = a1 + (i - (s.count - 1) / 2) * 0.12 + rand(-s.spread, s.spread) * 0.5;
    const fut = G.P.future > 0 && Math.random() < G.P.future; // Spoilers: it's already there
    const pr = spawnProj(w, fut ? tg.x - Math.cos(a) * 40 : p.x, fut ? tg.y - Math.sin(a) * 40 : p.y, a, lsrc, over);
    if (pr && V.owner) { pr.homing = 8; pr.tgt = V.owner; pr.vsOwner = V.owner; }
  }
  sfx('shot');
}

// ---------------------------------------------------------------- Wake Blade / Plague Trail
function updateWake(w, dt) {
  const s = w.s, p = G.player;
  w.ammo = Math.min(1, Math.hypot(p.vx || 0, p.vy || 0) / 150) * s.mag;
  surgicalTeam(w, dt);
  // Tunnel Vision: Pub Crawl's focus is how long you keep swimming fast.
  if (Math.hypot(p.vx || 0, p.vy || 0) > 80) w.focusT = (w.focusT || 0) + dt; else w.focusT = 0;
  if (w.lx == null) { w.lx = p.x; w.ly = p.y; }
  if (Math.hypot(p.x - w.lx, p.y - w.ly) < 16) return;
  w.lx = p.x; w.ly = p.y;
  if (G.zones.length < 260) G.zones.push(wakeZone(w, p.x, p.y));
  wakeExtras(w, p);
}

// ---------------------------------------------------------------- Thermal Lance
function updateHeat(w, dt) {
  const s = w.s, p = G.player;
  if (w.reloadT > 0) {
    w.reloadT -= dt * (G.rage > 0 ? 3 : 1);
    w.heat = Math.max(0, w.reloadT / w.reloadMax);
    w.beams = []; w.beamT = 0;
    if (w.reloadT <= 0) { w.reloadT = 0; w.heat = 0; }
    w.ammo = (1 - w.heat) * s.mag;
    return;
  }
  const t = acquire(w.dir, s.range, p.x, p.y);
  if (t) {
    if (t !== w.lastTarget) { w.focusT = 0; w.lastTarget = t; }
    w.focusT += dt; w.curTarget = t;
    w.beamT = Math.max(w.beamT, 0.12);
    updateBeam(w, dt);
    w.heat += dt / s.dur * (G.rage > 0 ? 0.5 : 1);
    if (w.heat >= 1) {
      // Vent: the whole reservoir comes out at once.
      w.heat = 1;
      aoe(p.x, p.y, s.area, s.dmg * 2.5, weaponSrc(w), '#ff5400');
      for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < s.area) b.dead = true;
      if (!w.echo) floatText(p.x, p.y - 34, 'VENT!', '#ff9e00', 16);
      w.beams = []; w.beamT = 0;
      startReload(w);
    }
  } else {
    w.heat = Math.max(0, w.heat - dt * 0.5);
    w.beamT = 0; w.beams = []; w.curTarget = null;
  }
  w.ammo = (1 - w.heat) * s.mag;
}

// ---------------------------------------------------------------- Mimic Core
function fireMimic(w, target, src) {
  const p = G.player, s = w.s, n = s.count, pat = G.mimicPat || 'ring';
  const a0 = Math.atan2(target.y - p.y, target.x - p.x);
  if (G.mimicPat && !w.echo) achieve('mimic');
  const sh = (a, speed, extra) => {
    const sp = speed || s.speed;
    spawnProj(w, p.x, p.y, a, src, Object.assign({ speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: s.range / sp }, extra || {}));
  };
  switch (pat) {
    case 'aimed': for (let k = 0; k < n; k++) for (let i = -1; i <= 1; i++) sh(a0 + i * 0.2 + k * 0.06); break;
    case 'aimedFan': for (let k = 0; k < n; k++) for (let i = -3; i <= 3; i++) sh(a0 + i * 0.13 + k * 0.05); break;
    case 'spiral': { w.ang += 0.55; const m = 3 * n; for (let i = 0; i < m; i++) sh(w.ang + i / m * TAU); break; }
    case 'doubleSpiral': { w.ang += 0.45; const m = 4 * n; for (let i = 0; i < m; i++) { sh(w.ang + i / m * TAU); sh(-w.ang + i / m * TAU + 0.3); } break; }
    case 'snipe': for (let k = 0; k < n; k++) sh(a0 + (k - (n - 1) / 2) * 0.05, 1300, { dmg: s.dmg * 4, pierce: 6, style: 'rail', r: 3, life: s.range * 1.5 / 1300 }); break;
    case 'flower': { const m = 16 * n; for (let i = 0; i < m; i++) sh(i / m * TAU + w.ang, i % 2 ? s.speed * 0.7 : s.speed * 1.2); w.ang += 0.2; break; }
    default: { const m = 10 * n; for (let i = 0; i < m; i++) sh(i / m * TAU + w.ang); w.ang += 0.3; }
  }
}

// ---------------------------------------------------------------- Tether Coil
function fireTether(w, target, src) {
  const s = w.s, p = G.player;
  const firsts = s.count > 1 ? acquireMany(w.dir, s.range, p.x, p.y, s.count) : [target];
  for (const a of firsts) {
    let b = null, bd = s.jump * s.jump;
    for (const e of G.enemies) {
      if (e.dead || e === a || e.phased) continue;
      const dx = e.x - a.x, dy = e.y - a.y, d2 = dx * dx + dy * dy;
      if (d2 < bd && !G.tethers.some(t => t.a === e || t.b === e)) { bd = d2; b = e; }
    }
    bolt(p.x, p.y, a.x, a.y, '#9ef0ff', 0.15);
    if (!b) { damageEnemy(a, s.dmg, src); continue; }
    G.tethers.push({ a, b, life: s.dur, max: s.dur, dmg: s.dmg, pull: s.pull, src, tick: 0, slamCd: 0 });
  }
}
function updateTethers(dt) {
  for (const t of G.tethers) {
    t.life -= dt;
    if (t.a.dead || t.b.dead) { t.life = 0; continue; }
    const dx = t.b.x - t.a.x, dy = t.b.y - t.a.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const step = Math.min(d / 2, t.pull * dt);
    if (!t.a.boss) { t.a.x += ux * step; t.a.y += uy * step; }
    if (!t.b.boss) { t.b.x -= ux * step; t.b.y -= uy * step; }
    t.tick -= dt;
    if (t.tick <= 0) { t.tick = 0.25; damageEnemy(t.a, t.dmg * 0.15, t.src); damageEnemy(t.b, t.dmg * 0.15, t.src); }
    t.slamCd -= dt;
    if (d < t.a.r + t.b.r + 6 && t.slamCd <= 0) {
      t.slamCd = 0.7;
      const mx = (t.a.x + t.b.x) / 2, my = (t.a.y + t.b.y) / 2, ss = Object.assign({}, t.src, { knock: 0 });
      damageEnemy(t.a, t.dmg * 3, ss); damageEnemy(t.b, t.dmg * 3, ss);
      ring(mx, my, 40, '#9ef0ff', 0.3, 4);
      spawnPart(mx, my, '#e0fbff', 8, 160, 0.35);
      floatText(mx, my - 20, 'SLAM!', '#9ef0ff', 14);
      cam.shake = Math.min(8, cam.shake + 2);
      achieve('tethered');
    }
  }
}

// ---------------------------------------------------------------- Prequel Launcher
function firePrequel(w, target, src) {
  const s = w.s, p = G.player;
  for (let i = 0; i < s.count; i++) {
    const tx = target.x + (i ? rand(-s.spread, s.spread) : 0), ty = target.y + (i ? rand(-s.spread, s.spread) : 0);
    aoe(tx, ty, s.area, s.dmg, Object.assign({}, src, { prequel: true }), w.def.color);
    // ...and only now does the shell fly, backwards, into the barrel.
    const a = Math.atan2(p.y - ty, p.x - tx), dist = Math.hypot(p.x - tx, p.y - ty), sp = s.speed;
    spawnProj(w, tx, ty, a, Object.assign({}, src, { mult: src.mult * 0.35, prequel: true }),
      { speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: Math.max(0.1, (dist - 15) / sp), pierce: 99, r: 6, style: 'prequel', explode: 0, homing: 0, bounce: 0 });
  }
}

// ---------------------------------------------------------------- Modifier procs (Freezing, Exploding, Mind Control)
function modProcs(e, dmg, src) {
  sillyProcs(e, dmg, src);
  if (src.modFreeze && !e.boss && e.frozen <= 0 && Math.random() < src.modFreeze) {
    e.frozen = 1.5;
    ring(e.x, e.y, e.r + 8, '#bde0fe', 0.3, 2);
  }
  if (src.modExplode && !(src.w.expCd > G.realT)) {
    src.w.expCd = G.realT + 0.15;
    const ex = Object.assign({}, src, { noProc: true, noCrit: true, mult: 1, knock: 0, wname: 'Exploding modifier' });
    aoe(e.x, e.y, 42, dmg * (src.mult || 1) * src.modExplode, ex, '#ff7a2f');
    if (src.w.s && src.w.s.cryoblast) forNear(e.x, e.y, 42, o => { if (!o.boss && !o.dead) o.frozen = Math.max(o.frozen, 1.2); });
  }
  if (src.modCharm && !e.boss && !e.elite && !e.rival && !e.charmed && e.hp > 0 && Math.random() < src.modCharm && G.enemies.filter(o => o.charmed).length < MAX_ALLIES) {
    e.charmed = true; e.charmT = src.charmDur; e.frozen = 0; e.allyT = null;
    G.stats.charms = (G.stats.charms || 0) + 1;
    floatText(e.x, e.y - e.r - 12, 'MINE NOW', PAL.you, 14);
    ring(e.x, e.y, e.r + 14, PAL.you, 0.4, 3);
    if (!src.echo) achieve('mindctrl');
  }
}

// Mind-controlled monsters hunt the nearest free monster and maul it; with nobody to fight they heel by you.
function allyAI(e, dt) {
  let t = e.allyT;
  if (!t || t.dead || t.charmed || Math.hypot(t.x - e.x, t.y - e.y) > 600) {
    t = null;
    let bd = 520 * 520;
    for (const o of G.enemies) {
      if (o.dead || o.charmed || o.phased) continue;
      const dx = o.x - e.x, dy = o.y - e.y, d2 = dx * dx + dy * dy;
      if (d2 < bd) { bd = d2; t = o; }
    }
    e.allyT = t;
  }
  const p = me(), tx = t ? t.x : p.x, ty = t ? t.y : p.y;
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1;
  const reach = t ? t.r + e.r - 2 : 80;
  if (d > reach) { const sp = e.speed * 1.3; e.x += dx / d * sp * dt; e.y += dy / d * sp * dt; }
  e.x += e.kx * dt; e.y += e.ky * dt;
  const kd = Math.pow(0.02, dt); e.kx *= kd; e.ky *= kd;
  e.atkCd = (e.atkCd || 0) - dt;
  if (t && d < t.r + e.r + 6 && e.atkCd <= 0) {
    e.atkCd = 0.5;
    damageEnemy(t, e.maxHp * 0.2, { fromAlly: true, noCrit: true, wname: 'Mind-controlled allies', knock: 60, kx: dx, ky: dy });
    spawnPart(t.x, t.y, PAL.you, 3, 90, 0.25);
  }
}

// ---------------------------------------------------------------- weapon upgrade trees
// Lv 3 and Lv 8: three upgrades any weapon can take (fixed per weapon, seeded by its id, so you can plan
// ahead in the Armoury). Lv 5 and Lv 10: the weapon's own two signature upgrades (SIGS).
function weaponTree(def) {
  if (def.tree) return def.tree;
  let seed = 7;
  for (const ch of def.id || def.name) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tiers = { 3: [1], 8: [2, 3] }, tree = {};
  for (const lvl of PERK_LEVELS) {
    if (def.sig && def.sig[lvl]) { tree[lvl] = def.sig[lvl].slice(); continue; }
    const pool = Object.keys(PERKS).filter(id => (tiers[lvl] || [4]).includes(PERKS[id].tier) && (!PERKS[id].fit || PERKS[id].fit(def)));
    tree[lvl] = [];
    while (tree[lvl].length < 3 && pool.length) tree[lvl].push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  def.tree = tree;
  return tree;
}
// A branch perk or a signature upgrade, with what the UI needs to show it.
function perkDef(id) {
  if (PERKS[id]) return PERKS[id];
  const g = SIGS[id];
  if (!g) return { name: id, desc: '', icon: '?', color: PAL.upgrade };
  if (!g.icon) { g.icon = g.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(); g.color = PAL.upgrade; g.sig = true; }
  return g;
}
const hasSig = (w, id) => !!(w && w.perks && (w.perks[5] === id || w.perks[8] === id || w.perks[10] === id));

// Raise a weapon's level, queueing a branch choice for every milestone it passes.
function setWeaponLevel(w, to, from) {
  from = from != null ? from : w.lvl;
  w.lvl = to;
  if (w.isSpell) { if (from < SPELL_FORK_LV && to >= SPELL_FORK_LV && !w.fork && SPELL_FORKS[w.id]) G.lootQueue.push({ kind: 'sfork', uid: w.uid }); return; }
  if (to >= MAX_WLVL) { achieve('mastery'); if (from < MAX_WLVL && G.player && typeof masteryJuice === 'function') masteryJuice(w); }
  w.perks = w.perks || {};
  for (const m of PERK_LEVELS) if (from < m && to >= m && !w.perks[m]) G.lootQueue.push({ kind: 'branch', uid: w.uid, lvl: m });
}

// Upgrades that work best with a particular targeting directive say so on the card (if the weapon isn't
// already set to it).
const SIG_HINT = { farsight: 'furthest', bigbrother: 'strongest', walkingdead: 'lowhp', hivemind: 'lowhp', bodysnatcher: 'elite', icicle: 'cluster' };
function optPerk(w, lvl, id) {
  const K = perkDef(id), hd = SIG_HINT[id] && SIG_HINT[id] !== w.dir && DIRECTIVES.find(d => d.id === SIG_HINT[id]);
  return { perk: id, rarity: lvl >= 10 ? 4 : lvl >= 8 ? 3 : lvl >= 5 ? 3 : 2, tag: K.sig ? (lvl >= 10 ? 'MASTERY' : 'SIGNATURE') : 'BRANCH', icon: K.icon, color: K.color, elem: w.def.elem, title: K.name,
    sub: `${w.def.name} | Lv ${lvl} ${K.sig ? 'only this weapon' : 'branch'}`, desc: K.desc + (PERK_ADAPT[id] && PERK_ADAPT[id][w.id] ? ' ' + PERK_ADAPT[id][w.id] : '') + (hd ? ` Tip: tap the weapon to switch it to ${hd.name}.` : ''),
    apply: () => { w.perks[lvl] = id; computeStats(w); floatText(me().x, me().y - 40, K.name.toUpperCase(), PAL.upgrade, 15, 1.2); } };
}

// Stat side of perks (called from computeStats).
function applyPerks(w, s) {
  if (!w.perks) return;
  const mulArea = k => { for (const f of ['area', 'aura', 'radius', 'size']) if (s[f]) s[f] *= k; if (s.explode > 1) s.explode *= k; };
  for (const lvl in w.perks) {
    switch (w.perks[lvl]) {
      case 'power': s.dmg *= 1.4; break;
      case 'overdrive': s.dmg *= 1.75; break;
      case 'rapid': s.cd *= 0.75; s.reload *= 0.75; break;
      case 'frenzy': s.cd *= 0.6; s.reload *= 0.6; break;
      case 'deepmag': s.mag = Math.round(s.mag * 1.6); break;
      case 'wide': mulArea(1.35); s.range *= 1.15; break;
      case 'pierce': s.pierce = (s.pierce || 0) + 2; break;
      case 'ricochet': s.bounce = (s.bounce || 0) + 2; break;
      case 'keen': s.crit += 0.15; break;
      case 'chill': s.pChill = 1; break;
      case 'ignite': s.pIgnite = 0.25; break;
      case 'seek': s.homing = Math.max(s.homing || 0, 5); break;
      case 'split': s.splitHit = Math.max(s.splitHit || 0, 3); break;
      case 'arc': s.pArc = 0.3; s.pArcDmg = 0.5; s.pArcN = 1; break;
      case 'storm': s.pArc = 0.5; s.pArcDmg = 0.6; s.pArcN = 2; break;
      case 'execute': s.pExec = 0.6; break;
      case 'venom': s.pVenom = 1; break;
      case 'freeze': s.modFreeze = (s.modFreeze || 0) + 0.12; break;
      case 'blast': s.modExplode = (s.modExplode || 0) + 0.35; break;
      case 'volley': s.count = (s.count || 1) + 1; s.perkCount += 1; break;
      case 'twin': s.count = (s.count || 1) + 2; s.perkCount += 2; break;
      case 'vamp': s.pVamp = 0.02; break;
      case 'giant': s.pGiant = (s.pGiant || 0) + 1; break;
      case 'slayer': s.pGiant = (s.pGiant || 0) + 1.5; break;
      case 'chainburst': s.pBurst = 0.6; break;
      case 'apex': s.dmg *= 2; s.crit += 0.2; break;
      case 'overclock': s.cd *= 0.5; s.reload *= 0.5; s.mag = Math.round(s.mag * 1.5); break;
      case 'legion': s.count = (s.count || 1) + 3; s.perkCount += 3; break;
      case 'lifeline': s.pVamp = 0.05; s.pVampCap = 4; break;
      case 'executioner': s.pExecKill = 0.2; break;
    }
  }
  applySigStats(w, s);
  applyAdapt(w, s);
}

// Hit side of perks (called from damageEnemy's proc step).
function perkProcs(e, dmg, src) {
  const s = src.w.s;
  if (s.pChill && !e.boss) { e.chill = Math.max(e.chill, 1.5); e.chillAmt = Math.max(e.chillAmt, 0.35); }
  if (s.pIgnite) { e.burn = Math.max(e.burn, 2); setBurn(e, dmg * s.pIgnite, src); }
  if (s.pVenom) { e.poison = 3; e.poisonStacks = Math.min(G.P.poisonCap, e.poisonStacks + 1); setPoison(e, dmg * 0.08, src); }
  if (s.pVamp && G.lsBudget > 0) { const h = Math.min(G.lsBudget * (s.pVampCap || 1), dmg * s.pVamp); G.lsBudget = Math.max(0, G.lsBudget - h / (s.pVampCap || 1)); healPlayer(h, true); }
  if (s.pExecKill && !e.boss && !e.rival && !e.dead && e.hp > 0 && e.hp < e.maxHp * s.pExecKill) { e.hp = 0; floatText(e.x, e.y - e.r, 'EXECUTED', '#ffffff', 12); killEnemy(e, src); return; }
  if (s.pArc && Math.random() < s.pArc) {
    let from = e;
    for (let k = 0; k < s.pArcN; k++) {
      const n = acquire('nearest', 150, from.x, from.y, from);
      if (!n || n === e) break;
      bolt(from.x, from.y, n.x, n.y, '#ffe94a', 0.12);
      damageEnemy(n, dmg * s.pArcDmg, Object.assign({}, src, { noProc: true, noArc: true, noCrit: true, mult: 1, wname: 'Static arcs' }));
      from = n;
    }
  }
}

// ---------------------------------------------------------------- amoebas
// Engulfers drift towards whatever is closer and tastier: a smaller monster, or you. Anything they touch
// that is smaller than them gets absorbed: its health, bulk and XP become theirs. Left alone they get huge.
const ENGULF_SKIP = e => e.boss || e.rival || e.egg || e.charmed || e.dead;
function engulfAI(e, dt, dist, ux, uy) {
  const base = e.def.speed * (1 + Math.min(0.6, G.t / 2000));
  e.speed = base * Math.max(0.45, Math.sqrt(e.def.r / e.r));
  if (e.hp < e.maxHp) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.01 * dt); // spongy: slowly knits back together
  e.stT -= dt;
  if (e.stT <= 0 || (e.prey && e.prey.dead)) {
    e.stT = 0.5; e.prey = null;
    let bd = (e.r + 220) * (e.r + 220);
    forNear(e.x, e.y, e.r + 220, (o, d2) => {
      if (o === e || ENGULF_SKIP(o) || o.r >= e.r * 0.8) return false;
      if (d2 < bd) { bd = d2; e.prey = o; }
      return false;
    });
    // Only bother with food that's clearly closer than you.
    if (e.prey && Math.sqrt(bd) > dist * 0.8) e.prey = null;
  }
  amoebaIndigestion(e); // mines and black holes don't agree with it (quirks.js)
  // Swallow anything small enough that it's overlapping.
  forNear(e.x, e.y, e.r * 0.7, o => {
    if (o === e || ENGULF_SKIP(o) || o.r >= e.r * 0.8) return false;
    engulf(e, o);
    return false;
  });
  if (e.prey && !e.prey.dead) {
    const dx = e.prey.x - e.x, dy = e.prey.y - e.y, d = Math.hypot(dx, dy) || 1;
    return { x: dx / d, y: dy / d };
  }
  return { x: ux, y: uy };
}
function engulf(e, o) {
  amoebaAteInfected(e, o);
  o.dead = true;
  const gain = o.maxHp * 1.2;
  e.maxHp += gain; e.hp += gain;
  e.xp += (o.xp || 1) * 1.5;
  e.dmg += o.dmg * 0.12;
  e.armour = Math.min(e.def.armour + 8, e.armour + 0.15);
  e.r = Math.min(e.def.max, Math.sqrt(e.r * e.r + o.r * o.r * 0.9));
  e.meals = (e.meals || 0) + 1;
  e.flash = 0.05;
  if (Math.abs(e.x - me().x) < 900 && Math.abs(e.y - me().y) < 900) {
    spawnPart(o.x, o.y, e.color, 6, 60, 0.5, 3);
    ring(e.x, e.y, e.r + 4, e.color, 0.3, 2);
  }
  G.stats.engulfed = (G.stats.engulfed || 0) + 1;
  if (e.r > 95 && !e.bigNews) {
    e.bigNews = true;
    sysMsg('SYSTEM MESSAGE', pick(SYSTEM_LINES.amoebaHuge).replace('{n}', e.meals), '#7fd8b0');
    achieve('amoeba');
  }
}

// ---------------------------------------------------------------- melee: Placenta Paddle, Flagellum Flail, Thorny Onesie
// No projectiles: every swing, lash or pulse hits whatever is in reach at that moment.
function fireMelee(w, target, src) {
  const s = w.s, p = me(), d = w.def;
  const msrc = w.isLast ? Object.assign({}, src, { mult: src.mult * (3 + Math.min(4, G.P.lastRound)) }) : src;
  if (d.melee === 'pulse') { onesiePulse(w, msrc); return; }
  const a0 = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.face;
  p.face = a0;
  w.swingN = (w.swingN || 0) + 1;
  if (d.melee === 'sweep' && hasSig(w, 'groundpound') && w.swingN % 4 === 0) groundPound(w, msrc);
  else if (d.melee === 'sweep') {
    for (let i = 0; i < s.count; i++) meleeSweep(w, p.x, p.y, a0 + i / s.count * TAU, msrc);
  } else if (hasSig(w, 'spincycle') && w.swingN % 3 === 0) {
    for (let i = 0; i < 12; i++) meleeLash(w, p.x, p.y, a0 + i / 12 * TAU, Object.assign({}, msrc, { mult: msrc.mult / (hasSig(w, 'ninetails') ? 0.6 : 1) }), 1.5);
    floatText(p.x, p.y - 30, 'SPIN CYCLE', d.color, 13, 0.6);
  } else {
    for (let i = 0; i < s.count; i++) meleeLash(w, p.x, p.y, a0 + (i - (s.count - 1) / 2) * s.spread, msrc, 1);
  }
  // Spoilers: the same swing also lands on someone further off, as if you'd already been there.
  if (G.P.future > 0 && Math.random() < G.P.future * 2) {
    const far = acquire('random', s.reach * 3, p.x, p.y, target);
    if (far) {
      const a = Math.atan2(far.y - p.y, far.x - p.x), ox = far.x - Math.cos(a) * s.reach * 0.5, oy = far.y - Math.sin(a) * s.reach * 0.5;
      ring(ox, oy, 14, '#8dffc0', 0.25, 2);
      if (d.melee === 'sweep') meleeSweep(w, ox, oy, a, msrc); else meleeLash(w, ox, oy, a, msrc, 0.7);
    }
  }
  sfx('shot');
}

// Inside a swing: within reach and inside the arc (allowing for the enemy's size).
function inArc(e, x, y, a, arc) {
  if (arc >= TAU - 0.01) return true;
  const dd = Math.hypot(e.x - x, e.y - y) || 1;
  return Math.abs(angDiff(Math.atan2(e.y - y, e.x - x), a)) <= arc / 2 + Math.atan(e.r / dd);
}

function meleeHit(w, e, dmg, src) {
  let m = 1;
  if (w.id === 'paddle') {
    if (G.pair.icehockey && e.frozen > 0) m *= 3;
    if (G.pair.onetwo && e.lashT > G.t) m *= 2;
    if (hasSig(w, 'tantrum')) { w.tant = Math.min(12, (w.tant || 0) + 1); w.tantT = G.t + 3; }
  } else if (w.id === 'flail') e.lashT = G.t + 2;
  else if (w.id === 'onesie' && G.pair.nappyrash) { e.poison = 3; e.poisonStacks = Math.min(G.P.poisonCap, e.poisonStacks + 1); setPoison(e, dmg * 0.1, src); }
  damageEnemy(e, dmg * m, src);
  if (hasSig(w, 'smother') && !e.dead) {
    e.smother = (e.smother || 0) + 1;
    if (e.smother >= 3) {
      e.smother = 0;
      damageEnemy(e, dmg * (e.boss ? 1.5 : 4), Object.assign({}, src, { noProc: true, noCrit: true, knock: 0, wname: 'Counting to Three' }));
      floatText(e.x, e.y - e.r - 10, 'THREE', w.def.color, 13);
      ring(e.x, e.y, e.r + 12, w.def.color, 0.3, 4);
    }
  }
}

function meleeSweep(w, x, y, a, src) {
  const s = w.s, R = s.reach, full = hasSig(w, 'fullcircle'), arc = full ? TAU : s.arc;
  const homer = hasSig(w, 'homerun') && w.swingN % 3 === 0;
  const dmg = s.dmg * (full ? 0.85 : 1);
  forNear(x, y, R, e => {
    if (e.charmed || !inArc(e, x, y, a, arc)) return;
    if (homer && !e.boss && !e.egg) { e.homerT = G.t + 0.7; e.homerHit = new Set([e]); e.homerSrc = { w, dmg, src }; (G.homers || (G.homers = [])).push(e); }
    meleeHit(w, e, dmg, Object.assign({}, src, { knock: (s.knock || 0) * (homer ? 3 : 1), kx: e.x - x, ky: e.y - y }));
  });
  G.fx.push({ type: 'swing', x, y, a, arc, r: R, color: w.def.color, life: 0.22, max: 0.22 });
  G.lastSwing = { x, y, a, r: R, t: G.t };
  if (homer) floatText(x, y - 30, 'HOME RUN', w.def.color, 12, 0.5);
  if (hasSig(w, 'afterwave')) after(0.1, () => {
    forNear(x, y, R * 3, e => {
      if (e.charmed || Math.hypot(e.x - x, e.y - y) < R * 0.8 || !inArc(e, x, y, a, arc)) return;
      meleeHit(w, e, dmg * 0.6, Object.assign({}, src, { knock: 90, kx: e.x - x, ky: e.y - y, wname: 'Afterbirth Wave' }));
    });
    G.fx.push({ type: 'swing', x, y, a, arc, r: R * 3, color: w.def.color, life: 0.3, max: 0.3, wave: 1 });
  });
}

function meleeLash(w, x, y, a, src, scale) {
  const s = w.s, L = s.reach * scale, wd = s.width, ca = Math.cos(a), sa = Math.sin(a);
  const crack = hasSig(w, 'whipcrack'), pull = hasSig(w, 'getoverhere');
  let tip = null, tipD = -1;
  forNear(x + ca * L / 2, y + sa * L / 2, L / 2 + wd, e => {
    if (e.charmed) return;
    const dx = e.x - x, dy = e.y - y, along = dx * ca + dy * sa, side = Math.abs(-dx * sa + dy * ca);
    if (along < -e.r || along > L + e.r || side > wd + e.r) return;
    const o = Object.assign({}, src, pull && !e.boss ? { knock: 240, kx: -dx, ky: -dy } : { kx: ca, ky: sa });
    if (crack && along > L * 0.67) { o.mult = (src.mult || 1) * 3; o.crit = 1; }
    meleeHit(w, e, s.dmg, o);
    if (along > tipD) { tipD = along; tip = e; }
  });
  G.fx.push({ type: 'lash', x, y, a, r: L, w: wd, color: w.def.color, life: 0.2, max: 0.2, seed: Math.random() * 10 });
  comboLash(w, x, y, a, L);
  // Snap Back: the lash yanks you along it.
  if (hasSig(w, 'snapback') && tip && tipD > 70 && !(w.snapT > G.t)) { w.snapT = G.t + 0.8; dashPlayer(Math.cos(a), Math.sin(a), Math.min(560, tipD * 2.4)); }
  if (G.pair.livewire && tip && !tip.dead && !(G.wireT > G.realT)) {
    const tw = owned('tesla');
    if (tw) { G.wireT = G.realT + 0.25; doChain(tip.x, tip.y, tip, tw.s.dmg, tw.s.chain, tw.s.jump, Object.assign(weaponSrc(tw), { wname: 'Live Wire' })); }
  }
}

function onesiePulse(w, src) {
  const s = w.s, p = me();
  w.pulseN = (w.pulseN || 0) + 1;
  const big = hasSig(w, 'bubblewrap') && w.pulseN % 6 === 0, hug = hasSig(w, 'bearhug');
  const R = s.area * (big ? 2 : 1), dmg = s.dmg * (big ? 2.5 : 1) * (1 + 0.18 * (s.count - 1));
  let n = 0;
  forNear(p.x, p.y, R, e => {
    if (e.charmed) return;
    n++;
    meleeHit(w, e, dmg, Object.assign({}, src, hug && !e.boss ? { knock: 160, kx: p.x - e.x, ky: p.y - e.y } : { kx: e.x - p.x, ky: e.y - p.y }));
  });
  if (hug) { G.hugArm = Math.min(6, n); G.hugT = G.t + 1.5; }
  if (hasSig(w, 'growthspurt') && n) healPlayer(Math.min(3, n) * G.P.maxHp * 0.004, true);
  if (big) {
    for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < R) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 1, 60, 0.3); }
    floatText(p.x, p.y - 34, 'POP!', w.def.color, 15, 0.6);
    cam.shake = Math.min(8, cam.shake + 3);
  }
  if (hasSig(w, 'porcupine')) for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + w.pulseN * 0.4, sp = 480;
    spawnProj(w, p.x, p.y, a, src, { speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.55, max: 0.55, r: 3, dmg: dmg * 0.5, pierce: 1, style: 'needle', explode: 0, homing: 0, bounce: 0, boomerang: 0, noMods: true });
  }
  comboPulse(w);
  G.fx.push({ type: 'spikes', x: p.x, y: p.y, r: R, color: w.def.color, life: big ? 0.4 : 0.25, max: big ? 0.4 : 0.25, rot: Math.random() * TAU });
}

// Per frame: Home Run victims bowling into others, and Bear Hug's armour wearing off.
function meleeTick(dt) {
  if (G.hugArm && !(G.hugT > G.t)) G.hugArm = 0;
  if (!G.homers || !G.homers.length) return;
  for (const e of G.homers) {
    if (e.dead || !(e.homerT > G.t)) continue;
    const H = e.homerSrc;
    forNear(e.x, e.y, e.r + 4, o => {
      if (e.homerHit.has(o) || o.charmed || o.egg) return;
      e.homerHit.add(o);
      meleeHit(H.w, o, H.dmg, Object.assign({}, H.src, { knock: 260, kx: o.x - e.x, ky: o.y - e.y, wname: 'Home Run' }));
      spawnPart(o.x, o.y, H.w.def.color, 4, 120, 0.3);
    });
  }
  G.homers = G.homers.filter(e => !e.dead && e.homerT > G.t);
}

// Ground Pound (Placenta Paddle): a slam all the way round you that stuns.
function groundPound(w, src) {
  const s = w.s, p = me(), R = s.reach * 1.6;
  forNear(p.x, p.y, R, e => {
    if (e.charmed) return;
    meleeHit(w, e, s.dmg * 1.2, Object.assign({}, src, { knock: 140, kx: e.x - p.x, ky: e.y - p.y, wname: 'Putting Your Foot Down' }));
    if (!e.boss && !e.dead) e.frozen = Math.max(e.frozen, 0.8);
  });
  G.fx.push({ type: 'swing', x: p.x, y: p.y, a: 0, arc: TAU, r: R, color: w.def.color, life: 0.3, max: 0.3 });
  floatText(p.x, p.y - 30, 'POUND', w.def.color, 13, 0.5);
  cam.shake = Math.min(8, cam.shake + 3);
}
