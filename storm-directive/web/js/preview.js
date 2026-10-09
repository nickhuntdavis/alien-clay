'use strict';
// Spawn Prawn - animated weapon previews for the Weapon Draft, upgrade paths and upgrade cards. Each one is a
// tiny looping scene on its own canvas: Spermy using the weapon on a few dummy cells, drawn in the weapon's
// type colour (menus keep their colour).

const PREVIEWS = new Set();

function makePreview(canvas, def, opts) {
  const pv = { canvas, def, t: 0, cd: 0.3, shots: [], parts: [], fx: [], puddles: [], mines: [], trail: [], targets: [], opts: opts || {}, ang: 0, stored: 0, seq: 0 };
  pv.col = elemCol(def.elem);
  pv.m = pvTags(pv.opts.perk); pv.n = 0; pv.dx = 0; pv.dy = 0; pv.allies = []; pv.zones = [];
  resetTargets(pv);
  PREVIEWS.add(pv);
  return pv;
}
function dropPreview(pv) { PREVIEWS.delete(pv); }
function clearPreviews(root) { for (const pv of [...PREVIEWS]) if (!pv.canvas.isConnected || (root && root.contains(pv.canvas))) PREVIEWS.delete(pv); }

function resetTargets(pv) {
  pv.targets = [];
  for (let i = 0; i < 5; i++) pv.targets.push({ x: 0.62 + Math.random() * 0.3, y: 0.18 + i * 0.16 + (Math.random() - 0.5) * 0.06, r: 0.045 + Math.random() * 0.02, hp: 1, flash: 0, vy: (Math.random() - 0.5) * 0.04, frozen: 0, burn: 0 });
}

// Advance every visible preview (called from UI.tick).
function updatePreviews(dt) {
  for (const pv of PREVIEWS) {
    if (!pv.canvas.isConnected) { PREVIEWS.delete(pv); continue; }
    if (!pv.canvas.offsetParent) continue; // hidden
    try { stepPreview(pv, Math.min(dt, 1 / 20)); drawPreview(pv); } catch (e) { PREVIEWS.delete(pv); safely('preview ' + defId(pv.def), () => { throw e; }); }
  }
}

// ---------------------------------------------------------------- simulation (unit square, 0..1)
function pvShooter(pv) {
  const d = pv.def;
  const o = pv.dx || 0, q = pv.dy || 0, sp = pv.m && pv.m.speed ? 1.7 : 1;
  if (d.kind === 'mine' || d.kind === 'wake' || d.kind === 'crayon' || d.kind === 'friend' || d.kind === 'twin') { const a = pv.t * 1.3 * sp; return { x: 0.32 + Math.cos(a) * 0.16 + o, y: 0.5 + Math.sin(a * 2) * 0.2 + q, a: Math.atan2(Math.cos(a * 2) * 0.4, -Math.sin(a) * 0.16) }; }
  if (d.kind === 'melee' && d.melee !== 'lash') return { x: 0.42 + o, y: 0.5 + Math.sin(pv.t * 0.9) * 0.08 + q, a: 0 };
  return { x: 0.2 + o, y: 0.5 + Math.sin(pv.t * 0.9) * 0.06 + q, a: 0 };
}
const pvAlive = pv => pv.targets.filter(t => t.hp > 0);
function pvHit(pv, t, k, noFx) {
  if (t.hp <= 0) return;
  if (!noFx) k = pvOnHit(pv, t, k);
  t.hp -= k; t.flash = 0.12;
  if (t.hp <= 0 && !noFx) pvOnKill(pv, t);
  if (t.hp <= 0) { for (let i = 0; i < 8; i++) { const a = Math.random() * TAU; pv.parts.push({ x: t.x, y: t.y, vx: Math.cos(a) * 0.3, vy: Math.sin(a) * 0.3, life: 0.5 }); } }
}
function stepPreview(pv, dt) {
  const d = pv.def, b = d.base, me0 = pvShooter(pv);
  pv.t += dt;
  for (const t of pv.targets) { t.flash = Math.max(0, t.flash - dt); if (t.frozen > 0) t.frozen -= dt; else t.y += t.vy * dt; if (t.y < 0.12 || t.y > 0.88) t.vy *= -1; if (t.burn > 0) { t.burn -= dt; t.hp -= dt * 0.15; } }
  if (!pvAlive(pv).length || pv.t > (pv.resetAt || 9)) { resetTargets(pv); pv.resetAt = pv.t + 9; pv.shots = []; pv.puddles = []; pv.mines = []; }
  const live = pvAlive(pv), tgt = live[pv.seq % Math.max(1, live.length)];
  pv.cd -= dt;
  const rate = Math.max(0.1, Math.min(0.9, (b.cd || 0.6) * (d.style === 'flame' ? 3 : 1) * (pv.m.rapid ? 0.6 : 1) * (pv.m.hose ? 0.35 : 1)));
  // Echo upgrades (replays, second rings): the volley goes off again a beat later, echo times over.
  if (pv.echoT > 0) { pv.echoT -= dt; if (pv.echoT <= 0) pv.echoNow = true; }
  const fire = pv.cd <= 0 || pv.echoNow;
  if (fire) {
    if (pv.echoNow) { pv.echoNow = false; pv.echoed = (pv.echoed || 0) + 1; if (pv.echoed < pv.m.echo) pv.echoT = 0.3; pvTxt(pv, me0.x, me0.y, 'AGAIN'); }
    else { pv.cd = d.style === 'flame' ? 0.05 : rate; pv.n++; pv.echoed = 0; if (pv.m.echo) pv.echoT = 0.3; }
  }
  switch (d.kind) {
    case 'orbit': {
      pv.ang += dt * 3.4;
      const n = Math.min(5, b.count || 3);
      for (let ri = 0; ri < (pv.m.orbit2 ? 2 : 1); ri++) for (let i = 0; i < n; i++) {
        const a = (ri ? -pv.ang * 0.8 : pv.ang) + i / n * TAU, rr = ri ? 0.26 : 0.13, x = me0.x + Math.cos(a) * rr, y = me0.y + Math.sin(a) * rr * 1.6;
        for (const t of live) if (Math.hypot(t.x - x, (t.y - y) / 1.6) < t.r + 0.03 && !(t.flash > 0)) pvHit(pv, t, 0.25);
      }
      for (const t of live) { t.x -= dt * 0.06; if (t.x < me0.x + 0.1) t.x = 0.9; }
      break;
    }
    case 'chain':
      if (fire && tgt) {
        pv.seq++;
        const hops = [me0].concat(live.slice(0, Math.min(live.length, (b.chain || 3) + 1 + (pv.m.chain || 0))));
        if (pv.m.tether && hops.length > 2) { const A = hops[1], B = hops[2]; pv.fx.push({ type: 'line', a: A, b: B, life: 0.6 }); A.y += (B.y - A.y) * 0.4; B.y += (A.y - B.y) * 0.4; }
        for (let i = 1; i < hops.length; i++) { pvHit(pv, hops[i], 0.3); pv.fx.push({ type: 'bolt', a: { x: hops[i - 1].x, y: hops[i - 1].y }, b: { x: hops[i].x, y: hops[i].y }, life: 0.35 }); }
        pv.cd = 0.55;
      }
      break;
    case 'lob':
      if (fire && tgt) { pv.seq++; pv.shots.push({ lob: true, sx: me0.x, sy: me0.y, tx: tgt.x, ty: tgt.y, k: 0 }); pv.cd = 0.8; }
      break;
    case 'mine':
      if (fire) {
        for (let k = 0; k < (pv.m.multiMine ? 3 : 1); k++) {
          const m = { x: me0.x + (k ? (Math.random() - 0.5) * 0.08 : 0), y: me0.y + (k ? (Math.random() - 0.5) * 0.1 : 0), arm: 0.4 };
          if (pv.m.nuke && pv.n % 3 === 0 && !k) m.nuke = true;
          if (pv.m.sticky && tgt) { m.stick = tgt; m.arm = 0.6; pv.fx.push({ type: 'line', a: { x: me0.x, y: me0.y }, b: tgt, life: 0.2 }); }
          pv.mines.push(m);
        }
        pv.cd = 0.55;
      }
      for (const m of pv.mines) {
        if (m.stick) { m.x = m.stick.x; m.y = m.stick.y; m.arm -= dt; if (m.arm <= 0) m.fuse = true; }
        if (pv.m.homingMine && live.length) { const t = live.reduce((a, o) => Math.hypot(o.x - m.x, o.y - m.y) < Math.hypot(a.x - m.x, a.y - m.y) ? o : a); m.x += (t.x - m.x) * dt * 1.2; m.y += (t.y - m.y) * dt * 1.2; }
      }
      for (const t of live) { t.x -= dt * 0.08; if (t.x < 0.05) t.x = 0.95; }
      break;
    case 'wake':
      pv.trail.push({ x: me0.x, y: me0.y, life: pv.m.longTrail ? 3.2 : 1.6 });
      if (pv.m.ghost) for (const k of [0, Math.PI]) { const ga = pv.t * 3 + k; pv.trail.push({ x: me0.x + Math.cos(ga) * 0.12, y: me0.y + Math.sin(ga) * 0.19, life: 1 }); }
      for (const t of live) { t.x -= dt * 0.05; if (t.x < 0.05) t.x = 0.95; for (const q of pv.trail) if (Math.hypot(q.x - t.x, (q.y - t.y) / 1.6) < t.r + 0.02 && !(t.flash > 0)) { pvHit(pv, t, 0.2); break; } }
      break;
    case 'siphon':
      if (Math.random() < dt * 5 && live.length) { const s = pick(live); pv.shots.push({ enemy: true, x: s.x, y: s.y, vx: (me0.x - s.x) * 1.1, vy: (me0.y - s.y) * 1.1 }); }
      if (fire && pv.stored > 0 && tgt) { pv.stored--; pv.seq++; const a = Math.atan2(tgt.y - me0.y, tgt.x - me0.x); pv.shots.push({ x: me0.x, y: me0.y, vx: Math.cos(a) * 1.2, vy: Math.sin(a) * 1.2, r: 0.014, style: 'bullet' }); pv.cd = 0.12; }
      break;
    case 'melee': {
      // Targets drift in; every swing, lash or pulse hits whatever is in reach.
      for (const t of live) { t.x -= dt * 0.07; if (t.x < me0.x - 0.25) t.x = 0.95; }
      if (fire) {
        pv.cd = d.melee === 'pulse' ? 0.6 : d.melee === 'lash' ? 0.45 : 0.75;
        const near = live.slice().sort((p1, p2) => Math.hypot(p1.x - me0.x, p1.y - me0.y) - Math.hypot(p2.x - me0.x, p2.y - me0.y))[0];
        const a = near ? Math.atan2((near.y - me0.y) / 1.6, near.x - me0.x) : 0;
        const big = (pv.m.pulseBig && pv.n % 3 === 0) || (pv.m.pound && pv.n % 4 === 0), wideK = pv.m.wide ? 1.3 : 1;
        const R = (d.melee === 'pulse' ? 0.17 : d.melee === 'lash' ? 0.62 : 0.22) * (big ? 1.8 : 1) * wideK, arc = d.melee === 'sweep' && !pv.m.arc360 && !big ? 2.4 : TAU;
        const spin = pv.m.spin && pv.n % 3 === 0, fan = pv.m.fan5 ? 5 : 1;
        if (d.melee === 'lash') { if (spin) for (let i = 0; i < 12; i++) pv.fx.push({ type: 'lash', x: me0.x, y: me0.y, a: a + i / 12 * TAU, r: R * 0.7, life: 0.3 }); else for (let i = 0; i < fan; i++) pv.fx.push({ type: 'lash', x: me0.x, y: me0.y, a: a + (i - (fan - 1) / 2) * 0.3, r: R, life: 0.3 }); }
        else pv.fx.push({ type: d.melee, x: me0.x, y: me0.y, a, r: R, life: 0.3, full: arc >= TAU });
        if (big) { pv.fx.push({ type: 'boom', x: me0.x, y: me0.y, r: R, life: 0.4 }); pv.fx.push({ type: 'text', x: me0.x, y: me0.y - 0.12, txt: pv.m.pound ? 'POUND' : 'POP!', life: 0.6 }); }
        if (pv.m.wave) pv.fx.push({ type: 'sweep', x: me0.x, y: me0.y, a, r: R * 2.4, life: 0.4, full: arc >= TAU });
        if (pv.m.spines && d.melee === 'pulse') for (let i = 0; i < 8; i++) { const sa = i / 8 * TAU + pv.n; pv.shots.push({ x: me0.x, y: me0.y, vx: Math.cos(sa) * 0.9, vy: Math.sin(sa) * 0.9, style: 'needle', life: 0.5, r: 0.01, hit: new Set(), pierce: 1 }); }
        if (pv.m.dash === 'fwd' && near) { pv.dx = 0.12; }
        for (const t of live) {
          const dx = t.x - me0.x, dy = (t.y - me0.y) / 1.6, dist = Math.hypot(dx, dy);
          let hit;
          if (d.melee === 'lash') { hit = spin ? dist < R * 0.7 + t.r : false; for (let i = 0; i < fan && !hit; i++) { const la = a + (i - (fan - 1) / 2) * 0.3, al = dx * Math.cos(la) + dy * Math.sin(la), sd = Math.abs(-dx * Math.sin(la) + dy * Math.cos(la)); hit = al > -t.r && al < R && sd < t.r + 0.02; } }
          else hit = dist < R + t.r && (arc >= TAU || Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - a), Math.cos(Math.atan2(dy, dx) - a))) < arc / 2 + 0.3);
          if (hit) { pvHit(pv, t, (d.melee === 'pulse' ? 0.2 : 0.35) * (big ? 1.5 : 1)); t.x += Math.cos(a) * (pv.m.pull ? -0.05 : pv.m.knock ? 0.14 : 0.05); if (pv.m.pound && big) t.frozen = 0.8; }
        }
      }
      break;
    }
    default: // guns
      if (pvSpecial(pv, dt, me0, live, fire, tgt)) break; // (weapons with their own look: rings, helices, replays)
      if (d.toy) { pvToy(pv, dt, me0, live, fire, tgt); break; }
      if (fire && tgt) {
        pv.seq++;
        const M = pv.m, style = M.rail ? 'rail' : d.style || 'bullet'; // (void fires three, to show them merge)
        const n = M.slug ? 1 : Math.min(9, (d.style === 'void' ? 3 : b.count || 1) + (M.count || 0) + (M.hose ? 2 : 0)), sp = (d.style === 'flame' ? (M.narrow ? 0.15 : 0.5) : Math.min(0.8, b.spread || 0.06)) * (M.fan ? 2.2 : 1) + (M.hose ? 0.5 : 0);
        let a0 = Math.atan2(tgt.y - me0.y, tgt.x - me0.x);
        if (M.dragon) { pv.dragA = (pv.dragA || 0) + 0.5; a0 = pv.dragA; }
        const spd = (style === 'flame' ? 0.7 * (M.narrow ? 1.6 : 1) : style === 'rail' ? 3 : d.style === 'void' ? 0.18 * (M.bigger ? 0.6 : 1) : d.style === 'sperm' ? 0.55 : 1.1);
        const bigShot = M.big && pv.n % M.big === 0;
        for (let i = 0; i < n; i++) {
          const a = n > 1 ? a0 + (i / (n - 1) - 0.5) * sp : a0 + (Math.random() - 0.5) * sp;
          const r0 = d.style === 'void' ? 0.05 * (M.bigger ? 1.6 : 1) : 0.012 * (M.power ? 1.4 : 1) * (M.hose ? 0.7 : 1);
          const big = (bigShot && i === 0) || M.slug;
          pv.shots.push({ x: me0.x, y: me0.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, style: big && style !== 'rail' ? 'big' : style, life: style === 'flame' ? 0.4 * (M.narrow ? 1.5 : 1) : 2, back: false, boom: !!b.boomerang, home: (b.homing || M.homing) ? (M.spread ? live[i % live.length] : tgt) : null, r: big ? r0 * 3 : r0, big, pierce: M.pierce || big || M.slug, hit: new Set() });
        }
        if (M.dash === 'back') pv.dx = -0.12;
      }
  }
  // Projectiles.
  for (const s of pv.shots) {
    if (s.dead) continue;
    if (s.lob) {
      s.k += dt / 0.7;
      if (s.k >= 1) { s.dead = true; pv.puddles.push({ x: s.tx, y: s.ty, life: pv.m.bigPud ? 5 : 2.5, max: pv.m.bigPud ? 5 : 2.5, big: pv.m.bigPud || pv.m.wide }); for (const t of live) if (Math.hypot(t.x - s.tx, (t.y - s.ty) / 1.6) < 0.1) pvHit(pv, t, 0.3); }
      continue;
    }
    if (s.enemy) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (Math.hypot(s.x - me0.x, (s.y - me0.y) / 1.6) < 0.11) { s.dead = true; pv.stored++; pv.fx.push({ type: 'ring', x: me0.x, y: me0.y, r: 0.11, life: 0.2 }); }
      continue;
    }
    if (!s.hit) s.hit = new Set(); // every shot keeps a list of what it already hit
    if (s.home && s.home.hp > 0) { const a = Math.atan2(s.home.y - s.y, s.home.x - s.x), c = Math.atan2(s.vy, s.vx), dd = Math.atan2(Math.sin(a - c), Math.cos(a - c)), na = c + Math.max(-4 * dt, Math.min(4 * dt, dd)), v = Math.hypot(s.vx, s.vy); s.vx = Math.cos(na) * v; s.vy = Math.sin(na) * v; }
    if (s.boom && !s.back && Math.hypot(s.x - me0.x, s.y - me0.y) > 0.5) { s.back = true; s.hit.clear(); }
    if (s.back) { const a = Math.atan2(me0.y - s.y, me0.x - s.x), v = Math.hypot(s.vx, s.vy); s.vx = Math.cos(a) * v; s.vy = Math.sin(a) * v; if (Math.hypot(me0.x - s.x, me0.y - s.y) < 0.03) s.dead = true; }
    if (s.helix != null) { s.bx += s.vx * dt; s.by += s.vy * dt; s.ht += dt; const hs = Math.hypot(s.vx, s.vy) || 1, o = 0.035 * Math.sin(s.ht * 14 + s.helix); s.x = s.bx - s.vy / hs * o; s.y = s.by + s.vx / hs * o; }
    else { s.x += s.vx * dt; s.y += s.vy * dt; }
    if (s.life != null) { s.life -= dt; if (s.life <= 0) s.dead = true; }
    if (s.x > 1.1 || s.x < -0.1 || s.y < -0.1 || s.y > 1.1) s.dead = true;
    for (const t of live) {
      if (s.hit.has(t)) continue;
      const rr = s.style === 'void' ? 0.16 : t.r + s.r;
      const d2 = Math.hypot(t.x - s.x, (t.y - s.y) / 1.6);
      if (s.style === 'void') { if (d2 < rr) { t.x += (s.x - t.x) * dt * 1.5; t.y += (s.y - t.y) * dt * 1.5; if (Math.random() < dt * 4) pvHit(pv, t, 0.08); } continue; }
      if (d2 < rr) {
        pvHit(pv, t, s.style === 'flame' ? 0.06 : s.style === 'rail' ? 0.6 : 0.3);
        if (d.elem === 'ice') t.frozen = 0.8;
        if (d.elem === 'fire') t.burn = 1;
        if (s.big) pv.fx.push({ type: 'boom', x: t.x, y: t.y, r: 0.08, life: 0.3 });
        if (pv.m.grow && s.boom) s.r = Math.min(0.06, s.r * 1.25);
        if (d.style === 'rail' || d.style === 'flame' || s.boom || s.pierce || s.style === 'rail' || (b.pierce || 0) > 2) s.hit.add(t);
        else if (pv.m.bounce && !s.bounced) { s.bounced = true; s.hit.add(t); const o = live.find(x => x !== t && x.hp > 0); if (o) { const ba = Math.atan2(o.y - s.y, o.x - s.x), v = Math.hypot(s.vx, s.vy); s.vx = Math.cos(ba) * v; s.vy = Math.sin(ba) * v; } }
        else { s.dead = true; break; }
      }
    }
  }
  // Black holes pull together and merge (Toddler Gravity).
  const voids = pv.shots.filter(s => s.style === 'void' && !s.dead);
  for (let i = 0; i < voids.length; i++) for (let j = i + 1; j < voids.length; j++) {
    const A = voids[i], B = voids[j]; if (A.dead || B.dead) continue;
    const dx = B.x - A.x, dy = B.y - A.y, dd = Math.hypot(dx, dy) || 1;
    if (dd < (A.r + B.r) * 0.5) { B.dead = true; A.r = Math.cbrt(A.r ** 3 + B.r ** 3); A.mass = (A.mass || 1) + (B.mass || 1); A.vx = (A.vx + B.vx) / 2; A.vy = (A.vy + B.vy) / 2; pv.fx.push({ type: 'boom', x: A.x, y: A.y, r: A.r * 1.5, life: 0.3 }); continue; }
    const k = (0.2 + dd * 3) * dt; A.x += dx / dd * k; A.y += dy / dd * k; B.x -= dx / dd * k; B.y -= dy / dd * k;
    pv.fx.push({ type: 'line', a: { x: A.x, y: A.y }, b: { x: B.x, y: B.y }, life: 0.04 });
  }
  pv.shots = pv.shots.filter(s => !s.dead);
  pvExtras(pv, dt, me0, live, fire, tgt);
  for (const m of pv.mines) {
    m.arm -= dt;
    if (m.arm <= 0 && !m.dead) for (const t of live) if (m.fuse || Math.hypot(t.x - m.x, (t.y - m.y) / 1.6) < 0.08) { pvMineBoom(pv, m, live); break; }
  }
  pv.mines = pv.mines.filter(m => !m.dead).slice(-10);
  for (const q of pv.puddles) { q.life -= dt; for (const t of live) if (Math.hypot(t.x - q.x, (t.y - q.y) / 1.6) < (q.big ? 0.13 : 0.09)) { t.hp -= dt * 0.12; t.flash = Math.max(t.flash, 0.03); if (pv.m.slow) t.vy *= 0.9; } }
  for (const q of pv.puddles) if (q.life <= 0 && pv.m.erupt && !q.erupted) { q.erupted = true; pv.fx.push({ type: 'boom', x: q.x, y: q.y, r: 0.12, life: 0.4 }); for (const t of live) if (Math.hypot(t.x - q.x, (t.y - q.y) / 1.6) < 0.13) pvHit(pv, t, 0.4, true); }
  pv.puddles = pv.puddles.filter(q => q.life > 0);
  for (const q of pv.trail) q.life -= dt;
  pv.trail = pv.trail.filter(q => q.life > 0);
  for (const q of pv.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
  pv.parts = pv.parts.filter(q => q.life > 0);
  for (const f of pv.fx) f.life -= dt;
  pv.fx = pv.fx.filter(f => f.life > 0);
}

// ---------------------------------------------------------------- drawing
function drawPreview(pv) {
  const cv = pv.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
  const W2 = cv.clientWidth, H2 = cv.clientHeight;
  if (!W2 || !H2) return;
  if (cv.width !== Math.round(W2 * dpr) || cv.height !== Math.round(H2 * dpr)) { cv.width = Math.round(W2 * dpr); cv.height = Math.round(H2 * dpr); }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const X = x => x * W2, Y = y => y * H2, U = Math.min(W2, H2 * 1.6) * (pv.opts.mini ? 1.5 : 1);
  const c = pv.col, d = pv.def, me0 = pvShooter(pv);
  // Background: a dark slide with a faint grid and a glow in the weapon's colour.
  g.fillStyle = '#05070a'; g.fillRect(0, 0, W2, H2);
  const bg = g.createRadialGradient(X(0.5), Y(0.5), 0, X(0.5), Y(0.5), Math.max(W2, H2) * 0.7);
  bg.addColorStop(0, c + '22'); bg.addColorStop(1, '#00000000'); g.fillStyle = bg; g.fillRect(0, 0, W2, H2);
  if (!pv.opts.mini) { g.strokeStyle = '#ffffff0c'; g.lineWidth = 1; for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(X(i / 10), 0); g.lineTo(X(i / 10), H2); g.stroke(); } for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, Y(i / 6)); g.lineTo(W2, Y(i / 6)); g.stroke(); } }
  g.globalCompositeOperation = 'lighter';
  for (const q of pv.trail) { g.globalAlpha = q.life / 1.6 * 0.5; g.fillStyle = c; g.beginPath(); g.arc(X(q.x), Y(q.y), U * 0.022, 0, TAU); g.fill(); }
  for (const q of pv.puddles) { g.globalAlpha = Math.min(1, q.life) * 0.35; g.fillStyle = c; g.beginPath(); g.ellipse(X(q.x), Y(q.y), U * (q.big ? 0.13 : 0.09), U * (q.big ? 0.13 : 0.09) * 0.65, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  // Targets.
  for (const t of pv.targets) {
    if (t.hp <= 0) continue;
    g.fillStyle = t.flash > 0 ? '#ffffff' : t.frozen > 0 ? '#bde0fe' : '#5a6068';
    g.beginPath(); g.arc(X(t.x), Y(t.y), U * t.r, 0, TAU); g.fill();
    g.strokeStyle = t.burn > 0 ? '#ff8a3d' : '#c9d1d9'; g.lineWidth = 1.5; g.stroke();
    // A thin health ring once it's hurt, and only with the Anti-Immune Stain (as in the run).
    if (!pv.opts.mini && t.hp < 0.995 && G && G.dyes && G.dyes.immuno) { g.strokeStyle = '#e6e6e6'; g.lineWidth = 1.2; g.beginPath(); g.arc(X(t.x), Y(t.y), U * t.r + 5, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, t.hp)); g.stroke(); }
  }
  for (const m of pv.mines) { g.fillStyle = '#111'; g.beginPath(); g.arc(X(m.x), Y(m.y), U * 0.018, 0, TAU); g.fill(); g.fillStyle = m.arm > 0 || Math.floor(pv.t * 6) % 2 ? c : '#fff'; g.beginPath(); g.arc(X(m.x), Y(m.y), U * 0.009, 0, TAU); g.fill(); }
  // Spermy.
  const ha = d.kind === 'mine' || d.kind === 'wake' ? me0.a : (pv.targets.find(t => t.hp > 0) ? Math.atan2(pv.targets.find(t => t.hp > 0).y - me0.y, pv.targets.find(t => t.hp > 0).x - me0.x) : 0);
  const hx = X(me0.x), hy = Y(me0.y), hr = U * 0.03;
  g.strokeStyle = PAL.you; g.lineWidth = Math.max(1, U * 0.006); g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - Math.cos(ha) * hr, hy - Math.sin(ha) * hr);
  for (let i = 1; i <= 10; i++) { const f = i / 10, w = Math.sin(pv.t * 18 - f * 7) * hr * 0.8 * f, L = hr + hr * 4 * f; g.lineTo(hx - Math.cos(ha) * L - Math.sin(ha) * w, hy - Math.sin(ha) * L + Math.cos(ha) * w); }
  g.stroke(); g.lineCap = 'butt';
  g.fillStyle = PAL.you; g.beginPath(); g.ellipse(hx, hy, hr * 1.2, hr * 0.85, ha, 0, TAU); g.fill();
  if (d.kind === 'siphon') { g.setLineDash([4, 5]); g.strokeStyle = c + 'aa'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(hx, hy, U * 0.11, U * 0.11, 0, 0, TAU); g.stroke(); g.setLineDash([]); }
  // Orbiting blades.
  g.globalCompositeOperation = 'lighter';
  if (d.kind === 'orbit') {
    const n = Math.min(5, d.base.count || 3);
    for (let ri = 0; ri < (pv.m.orbit2 ? 2 : 1); ri++) for (let i = 0; i < n; i++) { const a = (ri ? -pv.ang * 0.8 : pv.ang) + i / n * TAU, rr = ri ? 0.26 : 0.13, x = X(me0.x) + Math.cos(a) * U * rr, y = Y(me0.y) + Math.sin(a) * U * rr; pvGlow(g, x, y, U * 0.05, c); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, U * 0.014, 0, TAU); g.fill(); }
  }
  pvDrawExtras(pv, g, X, Y, U, c, me0);
  if (d.toy) pvDrawToy(pv, g, X, Y, U, c, me0);
  // Projectiles.
  for (const s of pv.shots) {
    if (s.lob) { const x = X(s.sx + (s.tx - s.sx) * s.k), y = Y(s.sy + (s.ty - s.sy) * s.k) - Math.sin(s.k * Math.PI) * H2 * 0.18; pvGlow(g, x, y, U * 0.03, c); g.fillStyle = c; g.beginPath(); g.arc(x, y, U * 0.012, 0, TAU); g.fill(); continue; }
    const x = X(s.x), y = Y(s.y), a = Math.atan2(s.vy, s.vx);
    if (s.enemy) { g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.strokeStyle = '#ffffff99'; g.beginPath(); g.arc(x, y, U * 0.01, 0, TAU); g.fill(); g.stroke(); g.globalCompositeOperation = 'lighter'; continue; }
    switch (s.style) {
      case 'flame': pvGlow(g, x, y, U * (0.03 + (0.4 - s.life) * 0.12), c, 0.8); break;
      case 'rail': g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.moveTo(x - Math.cos(a) * U * 0.12, y - Math.sin(a) * U * 0.12); g.lineTo(x, y); g.stroke(); break;
      case 'void': g.globalCompositeOperation = 'source-over'; pvGlow(g, x, y, U * 0.16, c, 0.5); g.fillStyle = '#000'; g.beginPath(); g.arc(x, y, U * 0.035, 0, TAU); g.fill(); g.strokeStyle = c; g.lineWidth = 2; g.stroke(); g.globalCompositeOperation = 'lighter'; break;
      case 'glaive': g.save(); g.translate(x, y); g.rotate(pv.t * 18); g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const aa = i / 10 * TAU, rr = i % 2 ? U * 0.012 : U * 0.028; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.fill(); g.restore(); break;
      case 'sperm': g.strokeStyle = c; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); for (let i = 1; i <= 6; i++) { const f = i / 6, w = Math.sin(pv.t * 25 - f * 6) * U * 0.008 * f; g.lineTo(x - Math.cos(a) * U * 0.05 * f - Math.sin(a) * w, y - Math.sin(a) * U * 0.05 * f + Math.cos(a) * w); } g.stroke(); g.fillStyle = c; g.beginPath(); g.ellipse(x, y, U * 0.012, U * 0.008, a, 0, TAU); g.fill(); break;
      case 'shard': case 'needle': case 'bolt': g.strokeStyle = c; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - Math.cos(a) * U * 0.04, y - Math.sin(a) * U * 0.04); g.lineTo(x, y); g.stroke(); break;
      case 'big': pvGlow(g, x, y, U * 0.07, c, 0.8); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, U * 0.025, 0, TAU); g.fill(); break;
      default: pvGlow(g, x, y, U * 0.025 * (pv.m.power ? 1.5 : 1), c, 0.6); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, U * 0.008 * (pv.m.power ? 1.5 : 1), 0, TAU); g.fill();
    }
  }
  for (const f of pv.fx) {
    g.globalAlpha = Math.min(1, f.life * 5);
    if (f.type === 'bolt') { g.strokeStyle = c; for (const [lw, al] of [[6, 0.3], [2, 1]]) { g.globalAlpha = al * Math.min(1, f.life * 6); g.lineWidth = lw; g.beginPath(); g.moveTo(X(f.a.x), Y(f.a.y)); for (let i = 1; i < 5; i++) { const k = i / 5; g.lineTo(X(f.a.x + (f.b.x - f.a.x) * k) + (Math.random() - 0.5) * 10, Y(f.a.y + (f.b.y - f.a.y) * k) + (Math.random() - 0.5) * 10); } g.lineTo(X(f.b.x), Y(f.b.y)); g.stroke(); } }
    else if (f.type === 'sweep') { const k = Math.min(1, f.life / 0.3), h = f.full ? Math.PI : 1.2; g.globalAlpha = k * 0.6; g.fillStyle = c; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r, f.a - h, f.a + h); g.arc(X(f.x), Y(f.y), U * f.r * 0.5, f.a + h, f.a - h, true); g.closePath(); g.fill(); g.globalAlpha = k; g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r, f.a - h, f.a + h); g.stroke(); }
    else if (f.type === 'boom') { const k = Math.min(1, f.life / 0.4); pvGlow(g, X(f.x), Y(f.y), U * f.r * (1.6 - k * 0.6), f.color || c, 0.9 * k); g.globalAlpha = k; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r * (1.3 - k * 0.5), 0, TAU); g.stroke(); }
    else if (f.type === 'line') { g.globalAlpha = Math.min(1, f.life * 4); g.strokeStyle = f.color || c; g.lineWidth = 2; g.beginPath(); g.moveTo(X(f.a.x), Y(f.a.y)); g.lineTo(X(f.b.x), Y(f.b.y)); g.stroke(); }
    else if (f.type === 'text') { g.globalAlpha = Math.min(1, f.life * 3); g.globalCompositeOperation = 'source-over'; g.font = `900 ${Math.round(U * 0.06)}px sans-serif`; g.textAlign = 'center'; g.fillStyle = f.color || '#fff'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText(f.txt, X(f.x), Y(f.y) - (0.6 - f.life) * U * 0.1); g.fillText(f.txt, X(f.x), Y(f.y) - (0.6 - f.life) * U * 0.1); g.globalCompositeOperation = 'lighter'; }
    else if (f.type === 'lash') { const k = f.life / 0.3, L = f.r * Math.min(1, (1 - k) * 4); g.globalAlpha = k; g.strokeStyle = c; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 10; i++) { const t = i / 10, wob = Math.sin(t * 9 + pv.t * 20) * 0.015 * t; g.lineTo(X(f.x + Math.cos(f.a) * L * t - Math.sin(f.a) * wob), Y(f.y + (Math.sin(f.a) * L * t + Math.cos(f.a) * wob) * 1.6)); } g.stroke(); g.lineCap = 'butt'; }
    else if (f.type === 'pulse') { const k = f.life / 0.3, R = U * f.r * (0.6 + 0.4 * (1 - k)); g.globalAlpha = k * 0.8; g.fillStyle = c; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.moveTo(X(f.x) + Math.cos(a - 0.12) * R * 0.55, Y(f.y) + Math.sin(a - 0.12) * R * 0.55); g.lineTo(X(f.x) + Math.cos(a) * R, Y(f.y) + Math.sin(a) * R); g.lineTo(X(f.x) + Math.cos(a + 0.12) * R * 0.55, Y(f.y) + Math.sin(a + 0.12) * R * 0.55); } g.fill(); }
    else { g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r * (1.2 - f.life), 0, TAU); g.stroke(); }
  }
  g.globalAlpha = 1;
  g.fillStyle = '#fff';
  for (const q of pv.parts) { g.globalAlpha = Math.min(1, q.life * 2); g.fillStyle = q.red ? '#ff3b3b' : '#fff'; g.fillRect(X(q.x), Y(q.y), 2, 2); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function pvGlow(g, x, y, r, c, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, c + Math.round((a == null ? 0.7 : a) * 255).toString(16).padStart(2, '0')); gr.addColorStop(1, c + '00');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}

// ---------------------------------------------------------------- upgrade previews
// Each upgrade (signature, mastery or branch) shows itself in the preview: the tags below switch on small
// effects in the scene (a nuke every 3rd mine, a second ring of angels, a hose of spit, and so on).
const PV_TAGS = {
  // branches any weapon can take
  power: 'power', overdrive: 'power', apex: 'power crit', rapid: 'rapid', frenzy: 'rapid', overclock: 'rapid', deepmag: 'rapid', wide: 'wide',
  pierce: 'pierce', ricochet: 'bounce', keen: 'crit', execute: 'crit', executioner: 'execute', chill: 'freeze', freeze: 'freeze', ignite: 'burn',
  seek: 'homing', split: 'split', arc: 'chain1', storm: 'chain2', venom: 'poison', blast: 'explode', chainburst: 'explode', volley: 'count1', twin: 'count2',
  legion: 'count3', vamp: 'heal', lifeline: 'heal', giant: 'big2', slayer: 'big2',
  // Spitball
  loogie: 'big4 explode', wetwilly: 'soggy', kidneystone: 'rail', vomit: 'hose', farsight: 'rail crit', phlegmfan: 'ring4',
  // Hiccup Scattergun
  pointblank: 'crit', slug: 'slug', hiccupfit: 'ring3 clearBul', dragonbreath: 'burn firePud', buckshot: 'count3 fan', recoil: 'dashBack',
  // Yo-Yo Diet
  walkdog: 'hang', crashdiet: 'grow', aroundworld: 'count2 heal', blackyoyo: 'hang pull', yoyoshield: 'eatBul', cradle: 'string',
  // Incompatible Viral Load
  closeloop: 'loop', razorwire: 'longTrail slow', surgicalteam: 'ghost', afterburner: 'burn speed', bloodletting: 'bleed', slipstream: 'speed',
  // Heartburn
  blueflame: 'narrow', indigestion: 'burn explode', dragon: 'dragon', hellkitchen: 'rapid power', napalm: 'firePud', heatwave: 'burn crit',
  // Nappy Mines
  domino: 'domino', sticky: 'sticky', nuclear: 'nuke', minefield: 'multiMine', claymore: 'shrapnel', homingnappy: 'homingMine',
  // Antacid
  shatter: 'freeze shatter', icicle: 'pierce', iceage: 'freeze icePatch', coldsnap: 'nova', brainfreeze: 'freeze', hailstorm: 'hail',
  // Static Cling
  shortcircuit: 'chain3', umbilical: 'tether', overcharge: 'power chain1', powergrid: 'chain2', balllightning: 'zone', grounded: 'heal',
  // Morning Sickness
  nausea: 'slow', toxicspread: 'spreadPud', swamp: 'bigPud', acidreflux: 'ringPud', corrosive: 'crit', geyser: 'erupt',
  // Tapeworm Seeder
  walkingdead: 'zombie', bigworm: 'turret', brood: 'chain1', bodysnatcher: 'zombie', hivemind: 'turret power', feedingtube: 'heal',
  // Seeker Siblings
  bigbrother: 'big3', rivalry: 'count2', boom: 'split', reunion: 'eatBul', kamikaze: 'explode', swarmsmart: 'homing spread',
  // Toddler Gravity
  horizon: 'swallow', nomnom: 'eatBul', bigbang: 'bigBang', parking: 'pull', supermassive: 'bigger pull', crushdepth: 'crit',
  // Premature Evangelation
  nan: 'eatBul', clingy: 'rapid', extended: 'orbit2', guilttrip: 'slow crit', smite: 'smite', martyr: 'martyr',
  // Placental Siphon
  sender: 'homing', buffet: 'heal', mirrorwomb: 'eatBul', overflow: 'ring4', spreadlove: 'count2 fan', savings: 'power',
  // Placenta Paddle
  fullcircle: 'arc360', homerun: 'knock', afterwave: 'wave', smother: 'crit', tantrum: 'rapid', groundpound: 'pound',
  // Flagellum Flail
  whipcrack: 'crit', getoverhere: 'pull', ninetails: 'fan5', spincycle: 'spin', barbed: 'bleed', snapback: 'dashFwd',
  // Thorny Onesie
  spiky: 'thorns', bearhug: 'pull armour', bubblewrap: 'pulseBig', growthspurt: 'wide heal', porcupine: 'spines', fortress: 'armour rapid',
  // Colouring In
  scribble: 'slow power', stayinlines: 'root crit', paintbynumbers: 'power', fridgeart: 'linger', masterpiece: 'frame', jointhedots: 'dots',
  // Deja Vu, Ghosts of You, Karma (Prawn Again)
  rbthird: 'echo', rbpremonition: 'pierce rapid', rbgroundhog: 'echo3', rbsamedream: 'homing echo',
  rbunfinished: 'split', rbchills: 'slow', rblegion: 'count2', rbreunion: 'heal',
  rbinstant: 'ring2', rbgood: 'rapid', rbwheel: 'echo', rbnirvana: 'heal',
  // Gene Gun
  ggtriple: 'count1', ggcrispr: 'crit explode', ggchimera: 'burn poison', ggrecomb: 'split',
  // Shotgun Wedding, Moonshine Jug, Duelling Banjo (the Redtail)
  rtrice: 'ring2', rtboth: 'count3 fan', rtreception: 'ring4', rtelope: 'dashFwd speed',
  rtproof: 'bigPud', rtstill: 'count2', rtbadbatch: 'explode big2', rthooch: 'heal',
  rtpick: 'count3', rtduel: 'echo', rthoedown: 'knock', rtencore: 'echo power',
  // Due Date
  overdue: 'power', earlyarrival: 'execute', babyshower: 'explode', rebooked: 'spreadMark', labourday: 'remark', bigday: 'crit',
  // Red Tape
  triplicate: 'bigBundle', jointliability: 'explode', stapled: 'slow', redacted: 'clearBul', bureaucracy: 'power', referral: 'spreadMark',
  // Imaginary Friend
  sharing: 'power', blameit: 'eatBul', longmemory: 'power', playdate: 'heal', tooreal: 'crit', secretclub: 'count1',
  // Peekaboo
  hideandseek: 'speed', jumpscare: 'freeze', whosthere: 'crit', decoydoll: 'explode', objectperm: 'rapid', bigboo: 'wide',
  // Twin Telepathy
  mindmeld: 'wide slow', switcheroo: 'swap', sympathy: 'martyr', wavelength: 'eatBul', quads: 'count2', psychic: 'power',
  // Bubble Wand
  extrasoapy: 'wide', bubblebath: 'slow', cannonball: 'explode', chainpop: 'chain1', hamsterball: 'knock', bubbleboy: 'armour',
  // Tooth Fairy
  goldtooth: 'explode', wisdomteeth: 'wide', underpillow: 'heal', dentures: 'crit', fairyring: 'chain2', toothdecay: 'power',
};
function pvTags(id) {
  const m = {};
  for (const tag of (PV_TAGS[id] || '').split(' ').filter(Boolean)) {
    const k = tag.match(/^([a-zA-Z]+?)(\d*)$/), name = k[1], n = k[2] ? +k[2] : 0;
    m[tag] = true; // (literal too: orbit2, arc360)
    if (name === 'count' || name === 'chain' || name === 'big' || name === 'ring' || name === 'echo') m[name] = n || 1;
    else if (name === 'dashBack') m.dash = 'back'; else if (name === 'dashFwd') m.dash = 'fwd';
    else m[name] = true;
  }
  return m;
}
const pvTxt = (pv, x, y, txt) => { if (pv.fx.length < 40) pv.fx.push({ type: 'text', x, y: y - 0.08, txt, life: 0.6 }); };
function pvNear(pv, t, r) { return pvAlive(pv).filter(o => o !== t && Math.hypot(o.x - t.x, (o.y - t.y) / 1.6) < r); }
// What a hit does with the upgrade on. Returns the damage to apply.
function pvOnHit(pv, t, k) {
  const M = pv.m;
  if (M.power) k *= 1.4;
  if (M.crit && Math.random() < 0.4) { k *= 2; pvTxt(pv, t.x, t.y, 'CRIT!'); }
  if (M.execute && t.hp < 0.35) { k = t.hp + 1; pvTxt(pv, t.x, t.y, 'EXECUTED'); }
  if (M.swallow && t.hp < 0.4) { k = t.hp + 1; pvTxt(pv, t.x, t.y, 'GULP'); }
  if (M.freeze) { t.frozen = 1.2; }
  if (M.shatter && t.frozen > 0.9 && Math.random() < 0.5) { pv.fx.push({ type: 'boom', x: t.x, y: t.y, r: 0.1, life: 0.35 }); pvTxt(pv, t.x, t.y, 'SUDS'); for (const o of pvNear(pv, t, 0.12)) pvHit(pv, o, 0.3, true); }
  if (M.burn) t.burn = 1.5;
  if (M.bleed) { t.bleed = 2; for (let i = 0; i < 3; i++) pv.parts.push({ x: t.x, y: t.y, vx: (Math.random() - 0.5) * 0.2, vy: Math.random() * 0.3, life: 0.6, red: true }); }
  if (M.poison) t.poison = 2;
  if (M.soggy) { t.soggy = 3; }
  if (M.slow) t.vy *= 0.3;
  if (M.explode && Math.random() < 0.6) { pv.fx.push({ type: 'boom', x: t.x, y: t.y, r: 0.08, life: 0.3 }); for (const o of pvNear(pv, t, 0.1)) pvHit(pv, o, 0.15, true); }
  if (M.chain && !pv.chaining) {
    pv.chaining = true;
    let from = t;
    for (const o of pvNear(pv, t, 0.4).slice(0, M.chain)) { pv.fx.push({ type: 'bolt', a: { x: from.x, y: from.y }, b: { x: o.x, y: o.y }, life: 0.25 }); pvHit(pv, o, k * 0.5, true); from = o; }
    pv.chaining = false;
  }
  if (M.split && Math.random() < 0.5) for (let i = 0; i < 3; i++) { const a = Math.random() * TAU; pv.shots.push({ x: t.x, y: t.y, vx: Math.cos(a) * 0.8, vy: Math.sin(a) * 0.8, style: 'bullet', life: 0.4, r: 0.007, hit: new Set([t]) }); }
  if (M.heal && Math.random() < 0.3) { const me0 = pvShooter(pv); pv.fx.push({ type: 'text', x: me0.x, y: me0.y - 0.04, txt: '+', color: '#8ac926', life: 0.6 }); }
  if (M.pull) { const me0 = pvShooter(pv); t.x += (me0.x + 0.12 - t.x) * 0.15; }
  if (M.firePud && Math.random() < 0.3 && pv.puddles.length < 12) pv.puddles.push({ x: t.x, y: t.y, life: 1.6, max: 1.6, fire: true });
  if (M.icePatch && Math.random() < 0.4 && pv.puddles.length < 12) pv.puddles.push({ x: t.x, y: t.y, life: 2, max: 2, ice: true });
  return k;
}
function pvOnKill(pv, t) {
  const M = pv.m;
  if (M.zombie && pv.allies.length < 3) { pv.allies.push({ x: t.x, y: t.y, life: 4 }); pvTxt(pv, t.x, t.y, 'RISE'); }
  if (M.turret && pv.allies.length < 3) pv.allies.push({ x: t.x, y: t.y, life: 4, turret: true, cd: 0 });
  if (M.spreadPud && pv.puddles.length < 12) pv.puddles.push({ x: t.x, y: t.y, life: 2.5, max: 2.5 });
  if (M.explode && Math.random() < 0.5) pv.fx.push({ type: 'boom', x: t.x, y: t.y, r: 0.1, life: 0.35 });
}
function pvMineBoom(pv, m, live) {
  m.dead = true;
  const R = m.nuke ? 0.38 : 0.16 * (pv.m.wide ? 1.3 : 1);
  pv.fx.push({ type: m.nuke ? 'boom' : 'ring', x: m.x, y: m.y, r: R, life: m.nuke ? 0.6 : 0.35, color: m.nuke ? '#ffffff' : null });
  if (m.nuke) pvTxt(pv, m.x, m.y, 'NUCLEAR NAPPY');
  for (const o of live) if (Math.hypot(o.x - m.x, (o.y - m.y) / 1.6) < R) pvHit(pv, o, m.nuke ? 1 : 0.55);
  if (pv.m.shrapnel) for (let i = 0; i < 6; i++) { const a = -0.6 + i * 0.24; pv.shots.push({ x: m.x, y: m.y, vx: Math.cos(a) * 1.1, vy: Math.sin(a) * 1.1, style: 'bullet', life: 0.4, r: 0.008, hit: new Set() }); }
  if (pv.m.domino) for (const o of pv.mines) if (!o.dead && o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 0.25) { o.arm = 0; o.fuse = true; o.delay = 0.1; }
}
function pvExtras(pv, dt, me0, live, fire, tgt) {
  const M = pv.m, d = pv.def;
  pv.dx *= Math.pow(0.02, dt); pv.dy *= Math.pow(0.02, dt);
  for (const t of live) { if (t.bleed > 0) { t.bleed -= dt; t.hp -= dt * 0.1; } if (t.poison > 0) { t.poison -= dt; t.hp -= dt * 0.08; } if (t.soggy > 0) t.soggy -= dt; }
  // Rings of shots (Phlegm Fan, Hiccup Fit, Overflow).
  if (fire && M.ring && pv.n % M.ring === 0) {
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; pv.shots.push({ x: me0.x, y: me0.y, vx: Math.cos(a) * 0.9, vy: Math.sin(a) * 0.9, style: 'bullet', life: 0.6, r: 0.01, hit: new Set() }); }
    if (M.clearBul) { pv.fx.push({ type: 'boom', x: me0.x, y: me0.y, r: 0.14, life: 0.35 }); for (const s of pv.shots) if (s.enemy) s.dead = true; }
  }
  // Enemy bullets to eat or clear (Guardian Angel, Nom Nom, Yo-Yo Shield, Thorns...).
  if ((M.eatBul || M.clearBul || M.thorns || M.armour) && Math.random() < dt * 3 && live.length) { const s = pick(live); pv.shots.push({ enemy: true, x: s.x, y: s.y, vx: (me0.x - s.x) * 0.9, vy: (me0.y - s.y) * 0.9 }); }
  for (const s of pv.shots) if (s.enemy && !s.dead && (M.eatBul || M.thorns || M.armour) && d.kind !== 'siphon') {
    const dd = Math.hypot(s.x - me0.x, (s.y - me0.y) / 1.6);
    if (dd < (M.eatBul ? 0.14 : 0.06)) {
      s.dead = true;
      if (M.thorns && live.length) { const t = pick(live); pv.fx.push({ type: 'bolt', a: { x: me0.x, y: me0.y }, b: { x: t.x, y: t.y }, life: 0.2 }); pvHit(pv, t, 0.3, true); pvTxt(pv, me0.x, me0.y, 'OUCH. YOU TOO.'); }
      else pv.fx.push({ type: 'ring', x: s.x, y: s.y, r: 0.04, life: 0.2 });
    }
    if (dd < 0.03) s.dead = true;
  }
  // Allies and turrets from the dead.
  for (const a of pv.allies) {
    a.life -= dt;
    const t = live[0];
    if (!t) continue;
    if (a.turret) { a.cd -= dt; if (a.cd <= 0) { a.cd = 0.5; const an = Math.atan2(t.y - a.y, t.x - a.x); pv.shots.push({ x: a.x, y: a.y, vx: Math.cos(an) * 1.1, vy: Math.sin(an) * 1.1, style: 'bullet', life: 1, r: 0.008, hit: new Set() }); } }
    else { a.x += (t.x - a.x) * dt * 1.5; a.y += (t.y - a.y) * dt * 1.5; if (Math.hypot(t.x - a.x, t.y - a.y) < 0.05 && Math.random() < dt * 4) pvHit(pv, t, 0.15, true); }
  }
  pv.allies = pv.allies.filter(a => a.life > 0);
  // Ball Lightning and other lingering zones.
  if (fire && M.zone && pv.n % 3 === 0 && tgt) pv.zones.push({ x: tgt.x, y: tgt.y, life: 2.5 });
  for (const z of pv.zones) { z.life -= dt; if (Math.random() < dt * 6) { const o = live.find(t => Math.hypot(t.x - z.x, (t.y - z.y) / 1.6) < 0.14); if (o) { pv.fx.push({ type: 'bolt', a: { x: z.x, y: z.y }, b: { x: o.x, y: o.y }, life: 0.15 }); pvHit(pv, o, 0.08, true); } } }
  pv.zones = pv.zones.filter(z => z.life > 0);
  // Hailstorm, Smite and Cold Snap.
  if (fire && M.hail && pv.n % 3 === 0) for (const t of live.slice(0, 3)) { pv.fx.push({ type: 'boom', x: t.x, y: t.y, r: 0.06, life: 0.3, color: '#bde0fe' }); pvHit(pv, t, 0.2, true); }
  if (M.smite) { pv.smiteT = (pv.smiteT || 0) + dt; if (pv.smiteT > 1.6 && live.length) { pv.smiteT = 0; for (const t of live.slice(0, 3)) { pv.fx.push({ type: 'bolt', a: { x: me0.x, y: me0.y }, b: { x: t.x, y: t.y }, life: 0.25 }); pvHit(pv, t, 0.3, true); } } }
  if (M.nova) { pv.novaT = (pv.novaT || 0) + dt; if (pv.novaT > 2.5) { pv.novaT = 0; pv.fx.push({ type: 'boom', x: me0.x, y: me0.y, r: 0.3, life: 0.5, color: '#bde0fe' }); for (const t of live) if (Math.hypot(t.x - me0.x, (t.y - me0.y) / 1.6) < 0.35) { t.frozen = 1.5; pvHit(pv, t, 0.1, true); } } }
  if (M.martyr) { pv.martT = (pv.martT || 0) + dt; if (pv.martT > 2.2) { pv.martT = 0; pvTxt(pv, me0.x, me0.y, 'MARTYRDOM'); pv.fx.push({ type: 'boom', x: me0.x, y: me0.y, r: 0.3, life: 0.5 }); for (const t of live) if (Math.hypot(t.x - me0.x, (t.y - me0.y) / 1.6) < 0.32) pvHit(pv, t, 0.4, true); } }
  // Closing the Loop: a big cut inside the loop every few seconds.
  if (M.loop) { pv.loopT = (pv.loopT || 0) + dt; if (pv.loopT > 4.8) { pv.loopT = 0; pv.fx.push({ type: 'boom', x: 0.32, y: 0.5, r: 0.22, life: 0.6 }); pvTxt(pv, 0.32, 0.5, 'LOOP!'); for (const t of live) if (Math.hypot(t.x - 0.32, (t.y - 0.5) / 1.6) < 0.25) pvHit(pv, t, 0.8, true); } }
  // Cat's Cradle: strings from you to each yo-yo cut what crosses them.
  if (M.string) for (const s of pv.shots) if (!s.enemy && !s.dead && s.boom) for (const t of live) { const dd = pvSegDist(t.x, t.y, me0.x, me0.y, s.x, s.y); if (dd < t.r && Math.random() < dt * 6) pvHit(pv, t, 0.06, true); }
  // Walk the Dog: yo-yos hang at the end of the string.
  if (M.hang) for (const s of pv.shots) if (s.boom && !s.back && !s.hung && Math.hypot(s.x - me0.x, s.y - me0.y) > 0.42) { s.hung = 0.7; s.vx0 = s.vx; s.vy0 = s.vy; s.vx = 0; s.vy = 0; }
  for (const s of pv.shots) if (s.hung > 0) { s.hung -= dt; for (const t of live) if (Math.hypot(t.x - s.x, (t.y - s.y) / 1.6) < (M.pull ? 0.2 : 0.06)) { if (M.pull) { t.x += (s.x - t.x) * dt * 2; t.y += (s.y - t.y) * dt * 2; } if (Math.random() < dt * 5) pvHit(pv, t, 0.05, true); } if (s.hung <= 0) { s.vx = s.vx0; s.vy = s.vy0; s.hung = -1; } }
  // Big Bang: void orbs end in a blast.
  if (M.bigBang) for (const s of pv.shots) if (s.style === 'void' && !s.dead && s.x > 0.92) { s.dead = true; pv.fx.push({ type: 'boom', x: s.x - 0.05, y: s.y, r: 0.25, life: 0.6 }); pvTxt(pv, s.x - 0.1, s.y, 'BIG BANG'); for (const t of live) if (Math.hypot(t.x - s.x, (t.y - s.y) / 1.6) < 0.3) pvHit(pv, t, 0.6, true); }
  // Acid Reflux: puddles in a ring now and then.
  if (M.ringPud) { pv.refT = (pv.refT || 0) + dt; if (pv.refT > 3) { pv.refT = 0; pvTxt(pv, me0.x, me0.y, 'BLEURGH'); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; pv.puddles.push({ x: me0.x + Math.cos(a) * 0.12, y: me0.y + Math.sin(a) * 0.19, life: 2, max: 2 }); } } }
  // Mines that were told to go off.
  for (const m of pv.mines) if (m.fuse && !m.dead && !m.stick) { m.delay = (m.delay || 0) - dt; if (m.delay <= 0) pvMineBoom(pv, m, live); }
  for (const m of pv.mines) if (m.fuse && !m.dead && m.stick && m.arm <= 0) pvMineBoom(pv, m, live);
}
function pvSegDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)); return Math.hypot(px - ax - dx * t, py - ay - dy * t); }
function pvDrawExtras(pv, g, X, Y, U, c, me0) {
  const M = pv.m;
  for (const a of pv.allies) { pvGlow(g, X(a.x), Y(a.y), U * 0.04, PAL.you, 0.7); g.fillStyle = PAL.you; g.beginPath(); g.arc(X(a.x), Y(a.y), U * (a.turret ? 0.012 : 0.02), 0, TAU); g.fill(); }
  for (const z of pv.zones) { pvGlow(g, X(z.x), Y(z.y), U * 0.14, c, 0.35 + 0.2 * Math.sin(pv.t * 20)); }
  if (M.string) { g.strokeStyle = c; g.lineWidth = 1.5; g.globalAlpha = 0.8; for (const s of pv.shots) if (s.boom && !s.dead && !s.enemy) { g.beginPath(); g.moveTo(X(me0.x), Y(me0.y)); g.lineTo(X(s.x), Y(s.y)); g.stroke(); } g.globalAlpha = 1; }
  if (M.armour) { g.strokeStyle = c; g.lineWidth = 2.5; g.globalAlpha = 0.6; g.beginPath(); g.arc(X(me0.x), Y(me0.y), U * 0.05, 0, TAU); g.stroke(); g.globalAlpha = 1; }
  for (const q of pv.puddles) if (q.fire || q.ice) { g.globalAlpha = Math.min(1, q.life) * 0.5; pvGlow(g, X(q.x), Y(q.y), U * 0.06, q.fire ? '#c6ff3d' : '#5b8cff', 0.7); g.globalAlpha = 1; }
  for (const t of pv.targets) if (t.hp > 0 && (t.soggy > 0 || t.poison > 0)) { g.strokeStyle = t.poison > 0 ? '#e8a33d' : c; g.globalAlpha = 0.7; g.lineWidth = 2; g.beginPath(); g.arc(X(t.x), Y(t.y), U * (t.r + 0.012), 0, TAU); g.stroke(); g.globalAlpha = 1; }
}

// ---------------------------------------------------------------- weapons with their own look
// Karma and the Duelling Banjo play rings; the Gene Gun fires twisting strands; Deja Vu's shots replay a
// moment later from where you were; Ghosts of You send homing souls. Returns true when it handled the weapon.
function pvShot(me0, a, sp, o) { return Object.assign({ x: me0.x, y: me0.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, style: 'bullet', life: 2, back: false, boom: false, home: null, r: 0.012, big: false, pierce: false, hit: new Set() }, o || {}); }
function pvSpecial(pv, dt, me0, live, fire, tgt) {
  const id = defId(pv.def), M = pv.m;
  if (id === 'karma' || id === 'banjo') {
    if (fire) {
      pv.seq++;
      const n = (id === 'banjo' ? 10 : 12) + (M.count || 0) * 2, off = pv.n * 0.3, lo = id === 'banjo' && pv.n % 2 === 0;
      for (let i = 0; i < n; i++) pv.shots.push(pvShot(me0, off + i / n * TAU, lo ? 0.45 : 0.9, { style: lo || M.power ? 'big' : 'bullet', life: lo ? 0.9 : 0.6, r: lo ? 0.02 : 0.012 }));
      pv.fx.push({ type: 'ring', x: me0.x, y: me0.y, r: 0.08, life: 0.25 });
      if (id === 'karma' && pv.n % 2) pvTxt(pv, me0.x, me0.y, 'KARMA');
    }
    return true;
  }
  if (id === 'genegun') {
    if (fire && tgt) {
      pv.seq++;
      const a = Math.atan2(tgt.y - me0.y, tgt.x - me0.x), n = 2 + (M.count ? 1 : 0);
      for (let i = 0; i < n; i++) pv.shots.push(pvShot(me0, a, 0.8, { helix: i / n * TAU, bx: me0.x, by: me0.y, ht: 0, r: 0.011, pierce: true }));
    }
    return true;
  }
  if (id === 'dejavu') {
    pv.replays = pv.replays || [];
    for (const r of pv.replays) if ((r.t -= dt) <= 0 && !r.done) { r.done = true; pv.shots.push(pvShot(r, r.a, 1, { style: 'big', r: 0.016, pierce: true })); pvTxt(pv, r.x, r.y, 'DEJA VU'); }
    pv.replays = pv.replays.filter(r => !r.done);
    if (fire && tgt) {
      pv.seq++;
      const a = Math.atan2(tgt.y - me0.y, tgt.x - me0.x);
      pv.shots.push(pvShot(me0, a, 1));
      pv.replays.push({ x: me0.x, y: me0.y, a, t: 0.8 });
      pv.fx.push({ type: 'ring', x: me0.x, y: me0.y, r: 0.04, life: 0.8 });
    }
    return true;
  }
  if (id === 'ghosts') {
    if (fire && tgt) {
      pv.seq++;
      for (let i = 0; i < 2 + (M.count || 0); i++) pv.shots.push(pvShot(me0, -Math.PI / 2 + (i - 0.5) * 1.6, 0.5, { style: 'sperm', home: live[(pv.seq + i) % Math.max(1, live.length)] || tgt, life: 2.5 }));
    }
    return true;
  }
  return false;
}
