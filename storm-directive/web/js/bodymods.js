'use strict';
// Spawn Prawn - three upgrade cards kept from the Devil's Threesome prototype (its triangle and Juice pool are gone).
//  - Rubber Johnny (P.plates): plates that each soak up to 8% of your max HP from one hit, then break. They regrow one
//    at a time once you stop getting hit. With 3, a breaking plate fires spines that clear nearby enemy bullets.
//  - Flinch (P.flinch): a hit that would land is dodged with a dart sideways, once every 8 s (4 s with two).
//  - Full Load (P.fullLoad): stamina Feats performed from a fuller bar hit harder. Level 1: from half a bar, x1.35,
//    +1 count and +20% area. Level 2: from 90%, x1.7 and a 1.5 s stun on what it hits.
// Hooks: modsTick (update), flinchHit / plateAbsorb (hurtPlayer), fullLoadFire (featFire), featPay notes the bar
// (G.loadK), drawPlates (render.js, by the armour ring), passiveUseful (Full Load needs a stamina Feat).
const BODYM = { soak: 0.08, regrowAfter: 3, regrowEvery: 5, flinchCd: [8, 4], spineR: 170, plateCol: '#9ef0ff', flinchCol: '#4dff9a', loadCol: '#ffb84d' };

function modsTick(dt) {
  const P = G.P, n = P.plates || 0;
  if (!n) return;
  if (G.platesN == null) { G.platesN = n; G.plateT = 0; }
  if (G.platesN > n) G.platesN = n;
  if (G.platesN < n && G.t - (G.plateHitT || -9) > BODYM.regrowAfter) {
    G.plateT += dt;
    if (G.plateT >= BODYM.regrowEvery) { G.plateT = 0; G.platesN++; }
  } else G.plateT = 0;
}

// A hit that would land: dodge it with a dart sideways.
function flinchHit(ent) {
  const lv = G.P.flinch || 0;
  if (!lv || G.t - (G.flinchT || -99) < BODYM.flinchCd[Math.min(lv, 2) - 1]) return false;
  const p = me(), hf = G.hitFrom || ent;
  let a = hf && hf.x != null ? Math.atan2(hf.y - p.y, hf.x - p.x) : p.face || 0;
  a += (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
  dashPlayer(Math.cos(a), Math.sin(a), 420); p.iframes = Math.max(p.iframes, 0.5);
  G.flinchT = G.t; G.hitFrom = null;
  floatText(p.x, p.y - 24, 'FLINCH', BODYM.flinchCol, 14);
  fxParts('spark', p.x, p.y, BODYM.flinchCol, 8, 120, 0.35, 2.5);
  return true;
}

// Rubber Johnny: a plate takes what it can of the hit and breaks.
function plateAbsorb(dmg) {
  const n = G.P.plates || 0;
  if (!n) return dmg;
  G.plateHitT = G.t;
  if (G.platesN == null) G.platesN = n;
  if (G.platesN < 1) return dmg;
  const p = me(), take = Math.min(dmg, G.P.maxHp * BODYM.soak);
  G.platesN--;
  G.armFlash = { t: G.realT, k: 1, a: null };
  fxParts('spark', p.x, p.y, BODYM.plateCol, 6, 90, 0.3, 2);
  if (n >= 3) {
    for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < BODYM.spineR) { b.dead = true; spawnPart(b.x, b.y, BODYM.plateCol, 1, 50, 0.25); }
    forNear(p.x, p.y, BODYM.spineR, e => { if (!e.charmed && !e.egg) damageEnemy(e, 10 + G.P.maxHp * 0.08, { elem: 'phys', wname: 'Rubber Spines', noProc: true }); });
    fxParts('spark', p.x, p.y, BODYM.plateCol, 18, 260, 0.45, 2.5);
  }
  dmg -= take;
  if (dmg <= 0) { floatText(p.x, p.y - 24, 'PLATED', BODYM.plateCol, 13); p.iframes = Math.max(p.iframes, 0.35); return 0; }
  return dmg;
}

// Full Load: how full the bar was when the Feat was paid for (G.loadK, set in featPay) sets its tier.
function fullLoadFire(w, target) {
  const lv = G.P.fullLoad || 0, k = G.loadK;
  G.loadK = null;
  const tier = !lv || w.echo || k == null || !STAM_FEATS.has(w.id) ? 1 : lv >= 2 && k >= 0.9 ? 3 : k >= 0.5 ? 2 : 1;
  if (tier < 2) { fireWeapon(w, target); return; }
  const s0 = w.s, s = Object.assign({}, s0);
  s.dmg = s0.dmg * (tier >= 3 ? 1.7 : 1.35);
  if (s.count) s.count += 1;
  if (s.area) s.area *= 1.2;
  w.s = s;
  try { fireWeapon(w, target); } finally { w.s = s0; }
  const p = me();
  floatText(p.x, p.y - 40, tier >= 3 ? 'FULL LOAD!' : 'LOADED', BODYM.loadCol, 13, 0.7);
  if (tier >= 3) {
    const x = target ? target.x : p.x, y = target ? target.y : p.y, r = (s.area || 120) + 40;
    after(Math.min(0.8, (s.delay || 0) + 0.05), () => forNear(x, y, r, e => { if (!e.boss && !e.rival && !e.egg && !e.charmed && !e.dead) e.frozen = Math.max(e.frozen || 0, 1.5); }));
  }
}

// Plates: short arcs just outside the armour forcefield, one per plate still on.
function drawPlates(px, py) {
  const n = G.P.plates || 0, k = G.platesN == null ? n : G.platesN;
  if (!n || !k) return;
  const R = 24 * S0 * ZOOM.z * playerScale() * 1.85, a0 = ctx.globalAlpha, span = TAU / n, top = -Math.PI / 2;
  ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, 2.4 * Math.min(1.6, S0 * ZOOM.z)); ctx.strokeStyle = BODYM.plateCol; ctx.globalAlpha = a0 * 0.6;
  ctx.beginPath();
  for (let i = 0; i < k; i++) { const c = top + span * i; ctx.moveTo(px + Math.cos(c - span * 0.3) * R, py + Math.sin(c - span * 0.3) * R); ctx.arc(px, py, R, c - span * 0.3, c + span * 0.3); }
  ctx.stroke(); ctx.globalAlpha = a0;
}

// ---- The armour bubble (drawn by armourRing in stamina.js) is a body of its own while you have armour:
//  - Elastic: it lags behind your changes of speed on a damped spring (G.bub.ox/oy), so a sudden start or stop
//    makes it slosh and squash.
//  - Solid: it meets obstacles and walls at its own edge, well outside your body. It gives (a soft push back, so you
//    can still squeeze through a gap; your body's own hard collision is unchanged), flattens against the surface
//    (G.bubC) and bounces you off it. Hitting a surface too fast dents it: armour wears like a hit and it ripples.
const BUB = { k: 220, damp: 12, mass: 0.5, give: 14, bounceV: 60, rest: 0.6, dentV: 210, dentCd: 0.5 };
const bubbleR = () => 24 * playerScale() * 1.6 * (G && G.pd && G.pd.n.wide ? 1.6 : 1); // (world units: the forcefield's drawn radius; Bigger Membrane: pdef.js)
const bubbleOn = () => V10 ? pdefShieldUp() : G.P.armour > 0 && !G.P.noArmour; // (v10: only while the shield is up, pdef.js)
// The nearest surface within reach of a circle: terrain obstacles and campaign walls. {nx, ny, d} or null.
const BUB_N = { nx: 0, ny: 0, d: 0 };
function bubbleNear(p, R) {
  let best = R;
  const c = tCell(p.x, p.y);
  if (c) for (const ob of c) {
    if (!ob.def.solid || ob.type === 'acid') continue;
    const dx = p.x - ob.x, dy = p.y - ob.y, dd = Math.hypot(dx, dy) || 0.01, d = dd - ob.r;
    if (d < best) { best = d; BUB_N.nx = dx / dd; BUB_N.ny = dy / dd; }
  }
  if (G.lvl) {
    const V = G.lvl, x0 = Math.floor((p.x - R) / LV_C), x1 = Math.floor((p.x + R) / LV_C), y0 = Math.floor((p.y - R) / LV_C), y1 = Math.floor((p.y + R) / LV_C);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      const out = cx < 0 || cy < 0 || cx >= V.w || cy >= V.h;
      if (!out && !lvSolidT(V.grid[cy * V.w + cx])) continue;
      const bx = cx * LV_C, by = cy * LV_C, qx = clamp(p.x, bx, bx + LV_C), qy = clamp(p.y, by, by + LV_C), dx = p.x - qx, dy = p.y - qy, d = Math.hypot(dx, dy);
      if (d > 0.01 && d < best) { best = d; BUB_N.nx = dx / d; BUB_N.ny = dy / d; }
    }
  }
  if (best >= R) return null;
  BUB_N.d = best;
  return BUB_N;
}
function bubbleBump(p, dt) {
  if (!bubbleOn() || !(dt > 0)) { G.bubC = null; return; }
  const B = G.bub || (G.bub = { ox: 0, oy: 0, vx: 0, vy: 0, pvx: p.vx, pvy: p.vy });
  // The slosh: a damped spring driven by your acceleration.
  const ax = clamp((p.vx - B.pvx) / dt, -6000, 6000), ay = clamp((p.vy - B.pvy) / dt, -6000, 6000);
  B.vx += (-BUB.k * B.ox - BUB.damp * B.vx - BUB.mass * ax) * dt; B.vy += (-BUB.k * B.oy - BUB.damp * B.vy - BUB.mass * ay) * dt;
  B.ox += B.vx * dt; B.oy += B.vy * dt;
  const R = bubbleR(), om = Math.hypot(B.ox, B.oy), cap = R * 0.3;
  if (om > cap) { B.ox *= cap / om; B.oy *= cap / om; }
  // Surfaces.
  const n = G.state === 'play' ? bubbleNear(p, R) : null;
  if (!n) { G.bubC = null; B.pvx = p.vx; B.pvy = p.vy; return; }
  const pen = R - n.d, vn = p.vx * n.nx + p.vy * n.ny;
  G.bubC = { nx: n.nx, ny: n.ny, pen: Math.min(pen, R * 0.65) };
  p.x += n.nx * pen * (1 - Math.exp(-dt * BUB.give)); p.y += n.ny * pen * (1 - Math.exp(-dt * BUB.give));
  if (vn < -BUB.bounceV) {
    const s = -vn;
    p.vx -= (1 + BUB.rest) * vn * n.nx; p.vy -= (1 + BUB.rest) * vn * n.ny;
    B.vx -= n.nx * s * 0.25; B.vy -= n.ny * s * 0.25; // (the bubble squashes into the surface, then springs back)
    const a = Math.atan2(-n.ny, -n.nx);
    if (s > BUB.dentV && G.t - (G.bubDentT || -9) > BUB.dentCd) {
      G.bubDentT = G.t;
      if (V10) pdefDent(s > BUB.dentV * 1.5 ? 2 : 1); else { G.armourLost = Math.min(G.P.armour, (G.armourLost || 0) + (s > BUB.dentV * 1.5 ? 2 : 1)); G.armourHitT = G.t; }
      G.armFlash = { t: G.realT, k: 0.6, a };
      floatText(p.x, p.y - 30, 'BONK', '#9ef0ff', 13, 0.6); cam.shake = Math.min(10, cam.shake + 3); sfx('hit');
    } else if (s > BUB.bounceV * 1.8) G.armFlash = { t: G.realT, k: 0, a, soft: true };
  }
  B.pvx = p.vx; B.pvy = p.vy;
}
