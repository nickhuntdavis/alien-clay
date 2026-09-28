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
  return m;
}

// Fire-rate multiplier from Crossfire (scatter) and Anchor Link.
function rateBonus() {
  const P = G.P;
  let r = 1;
  if (G.scatter) r *= 1 + P.crossfire;
  if (P.anchorLink > 0 && Math.hypot(me().x - G.core.x, me().y - G.core.y) < 450) r *= 1 + P.anchorLink;
  return r;
}

// Crossfire Protocol: weapons sharing a target hit harder; three different targets fire faster.
function updateCrossfire() {
  const P = G.P;
  const ws = G.weapons.filter(w => w && w.curTarget && !w.curTarget.dead);
  for (const w of G.weapons) if (w) w.cross = P.crossfire > 0 && !!w.curTarget && ws.some(o => o !== w && o.curTarget === w.curTarget);
  G.scatter = P.crossfire > 0 && ws.length === 3 && new Set(ws.map(w => w.curTarget)).size === 3;
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
  if (P.tactical <= 0) return;
  const r = 60 + 40 * P.tactical, r2 = r * r;
  for (const b of G.ebul) { const dx = b.x - p.x, dy = b.y - p.y; if (dx * dx + dy * dy < r2) { b.dead = true; spawnPart(b.x, b.y, '#e0fbff', 1, 50, 0.25); } }
  forNear(p.x, p.y, r, e => { damageEnemy(e, 5 * (1 + G.t / 120), { elem: 'phys', wname: 'Tactical Reload', noCrit: true, knock: 220, kx: e.x - p.x, ky: e.y - p.y }); });
  ring(p.x, p.y, r, '#e0fbff', 0.35, 4);
}

// ---------------------------------------------------------------- Bullet Siphon / Hailreturn
function updateSiphon(w, dt) {
  const s = w.s, d = w.def, p = G.player, r2 = s.area * s.area;
  for (const b of G.ebul) {
    if (b.dead || w.stored >= s.mag) continue;
    const dx = b.x - p.x, dy = b.y - p.y;
    if (dx * dx + dy * dy < r2) {
      b.dead = true; w.stored++;
      if (!w.echo && ++G.stats.absorbed === 200) achieve('siphoned');
      if (Math.random() < 0.3) spawnPart(b.x, b.y, d.color, 1, 60, 0.25, 2);
    }
  }
  // A slow trickle so the Siphon is never completely dry in quiet moments.
  w.trickle = (w.trickle || 0) + dt * 2;
  if (w.trickle >= 1 && w.stored < s.mag) { w.trickle -= 1; w.stored++; } else if (w.trickle >= 1) w.trickle = 1;
  w.ammo = w.stored;
  if (w.lastTarget && !w.lastTarget.dead) w.focusT += dt;
  w.cd -= dt * (G.rage > 0 ? 2 : 1) * rateBonus();
  if (w.cd > 0 || w.stored < 1) { if (w.cd < 0) w.cd = 0; return; }
  const t = acquire(w.dir, s.range, p.x, p.y);
  if (!t) { w.cd = 0; w.curTarget = null; return; }
  w.cd = s.cd; w.stored--;
  if (t !== w.lastTarget) { w.focusT = 0; w.lastTarget = t; }
  w.curTarget = t;
  const src = weaponSrc(w), a0 = Math.atan2(t.y - p.y, t.x - p.x), over = gunOver(w);
  for (let i = 0; i < s.count; i++) spawnProj(w, p.x, p.y, a0 + (i - (s.count - 1) / 2) * 0.12 + rand(-s.spread, s.spread) * 0.5, src, over);
  sfx('shot');
}

// ---------------------------------------------------------------- Wake Blade / Plague Trail
function updateWake(w, dt) {
  const s = w.s, d = w.def, p = G.player;
  w.ammo = Math.min(1, Math.hypot(p.vx || 0, p.vy || 0) / 150) * s.mag;
  if (w.lx == null) { w.lx = p.x; w.ly = p.y; }
  if (Math.hypot(p.x - w.lx, p.y - w.ly) < 16) return;
  w.lx = p.x; w.ly = p.y;
  if (G.zones.length < 260) {
    G.zones.push({ x: p.x, y: p.y, r: s.area, life: s.dur, max: s.dur, dps: s.dmg, elem: d.elem, pull: 0, color: d.color, tick: Math.random() * 0.25, src: weaponSrc(w), trail: true });
  }
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
  if (src.modFreeze && !e.boss && e.frozen <= 0 && Math.random() < src.modFreeze) {
    e.frozen = 1.5;
    ring(e.x, e.y, e.r + 8, '#bde0fe', 0.3, 2);
  }
  if (src.modExplode && !(src.w.expCd > G.realT)) {
    src.w.expCd = G.realT + 0.15;
    const ex = Object.assign({}, src, { noProc: true, noCrit: true, mult: 1, knock: 0, wname: 'Exploding modifier' });
    aoe(e.x, e.y, 42, dmg * (src.mult || 1) * src.modExplode, ex, '#ff7a2f');
  }
  if (src.modCharm && !e.boss && !e.elite && !e.charmed && e.hp > 0 && Math.random() < src.modCharm && G.enemies.filter(o => o.charmed).length < MAX_ALLIES) {
    e.charmed = true; e.charmT = src.charmDur; e.frozen = 0; e.allyT = null;
    G.stats.charms = (G.stats.charms || 0) + 1;
    floatText(e.x, e.y - e.r - 12, 'MINE NOW', '#ff8fab', 14);
    ring(e.x, e.y, e.r + 14, '#ff8fab', 0.4, 3);
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
    spawnPart(t.x, t.y, '#ff8fab', 3, 90, 0.25);
  }
}
