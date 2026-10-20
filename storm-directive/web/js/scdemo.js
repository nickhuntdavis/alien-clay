'use strict';
// Spawn Prawn - Sister Cousin (old name Seeker Siblings: Blood, Projectile, homing): its preview and a scene per branch
// card (wup5.js), on the sidemo.js engine with bldemo.js helpers.
//  - Base: a volley of 2 little homing siblings (9 each, a wide 1.2 fan) every 0.45 s, 6 volleys then a 2 s reload,
//    reach 500. Slow swimmers (320) that turn hard. Each hit adds a Bleed stack. A sibling that kills splits in two
//    at the nearest other cells (within 300); 12 in flight at most (the counter under Spermy).
// Hooks: none (a PV_OWN entry).

const SCV = { id: 's_seeker', range: 0.85, speed: 0.55, cd: 0.45, mag: 6, reload: 2, dmg: 9, life: 1.6, turn: 5, near: 0.51, fav: 0.65 }; // (world 500, 320, 300, 380)
const SCV_FLAG = { A: 'plan', B: 'fav', C: 'rival', 'Family Planning': 'plan', 'Runts of the Litter': 'runts', Overcrowding: 'over', 'Hide and Seek': 'hide',
  'The Favourite': 'fav', 'Taste for It': 'taste', Nepotism: 'nepo', 'Sibling Squabble': 'squab', 'Sibling Rivalry': 'rival', 'Pack Hunting': 'pack',
  'Pile-On': 'pile', 'Dinner Time': 'dinner', 'Breeding Like Rabbits': 'babyboom', 'Family Reunion': 'reunion', 'Only Child': 'only' };

function scvInit(pv) {
  sivInit(pv);
  const F = pv.F;
  Object.assign(pv, { range: SCV.range, mag: SCV.mag, reload: SCV.reload, ammo: SCV.mag, rate: SCV.cd, cd: 0.3, sibs: [], hiders: [], ebul: [], cap: 3 });
  pv.capN = F.has('babyboom') ? 24 : F.has('over') ? 18 : 12;
  pv.me.x = 0.16;
}
function scvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  const n = F.has('only') ? 7 : 7, hp = (F.has('rival') || F.has('only')) && !F.has('dinner') ? 45 : 12;
  for (let i = 0; i < n; i++) {
    const e = sivFoe(pv, 0.5 + R() * 0.45, H * (0.12 + R() * 0.76), { hp: F.has('dinner') ? 8 : hp + Math.round(R() * 14), sp: 0.03 });
    if (F.has('fav') && i % 3 === 0) e.hp = Math.round(e.max * 0.35); // a few wounded ones for The Favourite
    if (F.has('fav') && i === 0) { e.r = 0.045; e.hp = e.max = 160; e.elite = true; } // the big threat it ignores
  }
  if (F.has('reunion')) sivFoe(pv, 0.55, H * 0.12, { hp: 400, sp: 0.004, spit: true });
}
const scvLive = pv => pv.sibs.filter(s => !s.dead).length;
// The nearest (or weakest) cell to (x, y) within reach r, skipping one.
function scvPick(pv, x, y, r, skip, weakest, busy) {
  let best = null, bv = 1e9;
  for (const e of sivAlive(pv)) {
    if (e.dying || e === skip || e.spit) continue;
    const d = Math.hypot(e.x - x, e.y - y); if (d > r) continue;
    if (weakest && e.elite) continue; // (The Favourite ignores big threats)
    const v = weakest ? e.hp : d + (busy && busy.has(e) ? 0.5 : 0);
    if (v < bv) { bv = v; best = e; }
  }
  return best;
}
function scvSib(pv, x, y, a, o) {
  if (scvLive(pv) >= pv.capN && !(o && o.free)) return null;
  const s = Object.assign({ x, y, a, v: SCV.speed, life: SCV.life, dmg: SCV.dmg * (pv.F.has('plan') ? 0.75 : 1), tgt: null, hit: new Set(), kills: 0, gen: 0, r: 1, trail: [], wig: Math.random() * 6 }, o);
  pv.sibs.push(s); return s;
}
function scvFire(pv) {
  const F = pv.F, me = pv.me;
  if (F.has('babyboom') && scvLive(pv) + 2 > pv.capN) return false; // (a volley that would go over 24 waits)
  const t0 = scvPick(pv, me.x, me.y, pv.range, null, true) || scvPick(pv, me.x, me.y, pv.range);
  if (!t0) return false;
  const a0 = Math.atan2(t0.y - me.y, t0.x - me.x), n = F.has('only') ? 1 : 2;
  me.a = a0; me.kick = 0.006;
  for (let i = 0; i < n; i++) {
    const s = scvSib(pv, me.x, me.y, a0 + (n > 1 ? (i ? 0.6 : -0.6) : 0), F.has('only') ? { dmg: SCV.dmg * 6, r: 1.6, life: 10, only: true } : null);
    if (!s) continue;
    s.tgt = F.has('pack') || F.has('fav') || F.has('only') ? t0 : null; // (otherwise each one picks its own once it is out)
    if (F.has('pack') && i === 0) sivTxt(pv, t0.x, t0.y - t0.r - 0.04, 'PACK', SIV_PALE);
  }
  return true;
}
// Up to n new siblings from (x, y) at the nearest other cells.
function scvSplit(pv, x, y, n, from, e, o) {
  const busy = new Set(); let made = 0;
  for (let i = 0; i < n; i++) {
    const t = scvPick(pv, x, y, SCV.near, e, false, busy); if (t) busy.add(t);
    const s = scvSib(pv, x, y, t ? Math.atan2(t.y - y, t.x - x) : Math.random() * TAU, Object.assign({ dmg: from.dmg, gen: from.gen + 1, tgt: t }, o));
    if (s) { s.hit.add(e); made++; }
  }
  return made;
}
function scvHit(pv, s, e) {
  const F = pv.F;
  let k = s.dmg;
  if (s.taste) { k *= 1.3; s.taste = false; }
  if (F.has('rival')) { // two or more on the same cell
    const n = pv.sibs.filter(o => !o.dead && o !== s && Math.hypot(o.x - e.x, o.y - e.y) < 0.09).length;
    if (n >= 1) { k *= 1.25; if (Math.random() < 0.3) sivTxt(pv, e.x, e.y - e.r - 0.03, 'RIVALRY', SIV_BONK); }
  }
  s.hit.add(e);
  lpvBleed(pv, e, 1);
  if (F.has('pile')) { // 4 hits inside 0.5 s fill the Bleed stack
    const L = e.sl || (e.sl = []); L.push(pv.t); while (L.length && pv.t - L[0] > 0.5) L.shift();
    if (L.length >= 4 && !(e.pileT > pv.t)) { e.pileT = pv.t + 2; L.length = 0; lpvBleed(pv, e, 3); sivTxt(pv, e.x, e.y - e.r - 0.05, 'PILE-ON', BLV_RED, true); sivRing(pv, e.x, e.y, e.r * 2.4, BLV_RED, 0.4); }
  }
  sivDamage(pv, e, k, false);
  if (F.has('babyboom') && scvSplit(pv, e.x, e.y, 2, Object.assign({}, s, { dmg: s.dmg * 0.5 }), e)) { if (Math.random() < 0.3) sivTxt(pv, e.x, e.y - e.r - 0.04, 'BABY BOOM', pv.col); }
  if (e.hp <= 0) {
    s.kills++;
    if (!F.has('rival') && !F.has('only') && !F.has('babyboom')) { // a kill splits it (Nepotism: three, for one born of a kill)
      const three = F.has('nepo') && s.gen > 0;
      const n = scvSplit(pv, e.x, e.y, three ? 3 : 2, s, e, F.has('taste') ? { taste: true } : null);
      if (n) sivTxt(pv, e.x, e.y - e.r - 0.03, three ? 'NEPOTISM' : 'SPLIT', three ? SIV_BONK : pv.col, three);
      if (F.has('taste') && n) sivTxt(pv, e.x + 0.05, e.y - e.r, '+30%', SIV_BONK);
    }
    if (F.has('plan')) { // Family Planning: every kill makes one more
      const o = F.has('runts') ? { v: SCV.speed * 1.4, r: 0.7, runt: true } : null;
      if (scvSplit(pv, e.x, e.y, 1, s, e, o)) sivTxt(pv, e.x, e.y - e.r - 0.06, F.has('runts') ? '+1 RUNT' : '+1 SIBLING', pv.col);
    }
    if (F.has('dinner') && !s.back) { // it lives on; with 3 kills it swims home
      s.tgt = null; s.life = Math.max(s.life, 1);
      if (s.kills >= 3) { s.back = true; sivTxt(pv, s.x, s.y - 0.04, 'DINNER TIME', BLV_GREEN); }
      return;
    }
    if (s.only) { if (s.kills >= 5) { s.dead = true; sivTxt(pv, s.x, s.y - 0.04, 'ONLY CHILD: DONE', SIV_PALE); } else s.tgt = null; return; }
  }
  if (!s.only) s.dead = true;
}
// A sibling's flight runs out (Hide and Seek: it hides; Family Reunion: it comes round you and goes again).
function scvEnd(pv, s) {
  const F = pv.F;
  if (F.has('reunion')) { s.orbit = { a: Math.atan2(s.y - pv.me.y, s.x - pv.me.x), turned: 0 }; s.tgt = null; return; }
  s.dead = true;
  if (F.has('hide') && pv.hiders.length < 8) { pv.hiders.push({ x: s.x, y: s.y, life: 6 }); sivTxt(pv, s.x, s.y - 0.03, 'SHH', pv.col); }
}
function scvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  me.y = H * 0.56 + Math.sin(pv.t * 0.9) * 0.02; me.kick = Math.max(0, (me.kick || 0) - dt * 0.1);
  blvGun(pv, dt, scvFire);
  for (const s of pv.sibs) {
    if (s.dead) continue;
    s.wig += dt * 20;
    if (s.orbit) { // Family Reunion: once round you, eating enemy shots, then out again
      const O = s.orbit, st = TAU / 0.8 * dt; O.a += st; O.turned += st;
      s.x = me.x + Math.cos(O.a) * 0.08; s.y = me.y + Math.sin(O.a) * 0.08; s.a = O.a + Math.PI / 2;
      for (const b of pv.ebul) if (!b.dead && sivD(b, s) < 0.025) { b.dead = true; sivTxt(pv, s.x, s.y - 0.03, 'NOM', pv.col); }
      if (O.turned >= TAU) { s.orbit = null; s.life = SCV.life; s.hit.clear(); if (!pv.reTold || pv.t - pv.reTold > 2) { pv.reTold = pv.t; sivTxt(pv, me.x, me.y - 0.08, 'REUNION', pv.col); } }
      s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 6) s.trail.shift();
      continue;
    }
    // Who to chase.
    let t = s.back ? null : s.tgt;
    if (s.back) { const d = sivD(s, me); s.a += Math.max(-8 * dt, Math.min(8 * dt, Math.atan2(Math.sin(Math.atan2(me.y - s.y, me.x - s.x) - s.a), Math.cos(Math.atan2(me.y - s.y, me.x - s.x) - s.a)))); if (d < 0.04) { s.dead = true; sivTxt(pv, me.x, me.y - 0.07, 'DINNER +1%', BLV_GREEN, true); sivRing(pv, me.x, me.y, 0.06, BLV_GREEN, 0.4); } }
    else {
      if (!t || t.hp <= 0 || t.dying) t = s.tgt = (SCV.life - s.life > 0.12 || s.gen > 0 || s.only) ? scvPick(pv, s.x, s.y, s.only ? 0.7 : SCV.fav, null, F.has('fav')) : null;
      if (t) { const a = Math.atan2(t.y - s.y, t.x - s.x), d = Math.atan2(Math.sin(a - s.a), Math.cos(a - s.a)); s.a += Math.max(-SCV.turn * dt, Math.min(SCV.turn * dt, d)); }
    }
    s.x += Math.cos(s.a) * s.v * dt; s.y += Math.sin(s.a) * s.v * dt;
    if (!s.back && !s.only && !F.has('reunion')) s.life -= dt;
    if (s.only || F.has('reunion')) s.life -= dt * (s.only ? 0.1 : 1);
    s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 6) s.trail.shift();
    if (s.x < -0.05 || s.x > 1.05 || s.y < -0.05 || s.y > H + 0.05) { if (F.has('reunion')) scvEnd(pv, s); else { s.dead = true; continue; } }
    if (s.life <= 0 && !s.back) { scvEnd(pv, s); if (s.dead) continue; }
    if (s.back) continue;
    for (const e of sivAlive(pv)) { if (s.hit.has(e) || e.dying || e.spit) continue; if (sivD(e, s) < e.r + 0.008 * s.r) { scvHit(pv, s, e); break; } }
  }
  // Sibling Squabble: two that meet bounce apart and pick different cells.
  if (F.has('squab')) {
    const L = pv.sibs.filter(s => !s.dead && !s.orbit);
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const a = L[i], b = L[j];
      if ((a.sq || 0) > pv.t || (b.sq || 0) > pv.t || sivD(a, b) > 0.02) continue;
      a.sq = b.sq = pv.t + 0.5; const ang = Math.atan2(a.y - b.y, a.x - b.x); a.a = ang + 0.5; b.a = ang + Math.PI - 0.5;
      a.tgt = scvPick(pv, a.x, a.y, SCV.fav); b.tgt = scvPick(pv, b.x, b.y, SCV.fav, a.tgt) || a.tgt;
      sivTxt(pv, a.x, a.y - 0.03, 'SQUABBLE', pv.col); sivRing(pv, a.x, a.y, 0.03, pv.col, 0.25);
    }
  }
  pv.sibs = pv.sibs.filter(s => !s.dead);
  // Hidden siblings ambush the next cell that comes near.
  for (const h of pv.hiders) {
    h.life -= dt;
    const t = scvPick(pv, h.x, h.y, 0.12);
    if (t) { h.life = 0; const s = scvSib(pv, h.x, h.y, Math.atan2(t.y - h.y, t.x - h.x), { dmg: SCV.dmg * 1.5, tgt: t, free: true, gen: 1 }); if (s) sivTxt(pv, t.x, t.y - t.r - 0.04, 'AMBUSH', pv.col, true); }
  }
  pv.hiders = pv.hiders.filter(h => h.life > 0);
  // Bleed ticks.
  for (const e of sivAlive(pv)) {
    if (!e.bl || !e.bl.length || e.dying) continue;
    e.bl = e.bl.map(t => t - dt).filter(t => t > 0);
    e.bacc = (e.bacc || 0) + e.bl.length * 0.9 * dt; e.btk = (e.btk || 0) + dt;
    if (Math.random() < dt * 5) pv.parts.push({ x: e.x + (Math.random() - 0.5) * e.r, y: e.y + e.r * 0.6, vx: 0, vy: 0.08, life: 0.4, color: BLV_RED });
    if (e.btk > 0.6 && e.bacc >= 1) { e.btk = 0; const d = Math.floor(e.bacc); e.bacc -= d; sivDamage(pv, e, d, false, BLV_RED); }
  }
  blvSpit(pv, dt, pv => sivTxt(pv, me.x, me.y - 0.06, 'OW', BLV_SPIT, true));
  sivStepFoes(pv, dt);
  blvTail(pv, dt, scvWave);
}
function scvUnder(pv, g, X, Y, U, c) {
  for (const h of pv.hiders) { const x = X(h.x), y = Y(h.y); g.globalAlpha = 0.35 + 0.2 * Math.sin(pv.t * 4); g.fillStyle = c; g.beginPath(); g.ellipse(x, y, U * 0.008, U * 0.006, 0, 0, TAU); g.fill(); g.setLineDash([2, 3]); g.strokeStyle = c; g.lineWidth = 1; g.beginPath(); g.arc(x, y, U * 0.12, 0, TAU); g.stroke(); g.setLineDash([]); }
  g.globalAlpha = 1;
  blvDrawSpit(pv, g, X, Y, U);
}
function scvMe(pv, g, hx, hy, hr, U) { // siblings in flight / the cap
  g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = pv.col; g.fillText(scvLive(pv) + '/' + pv.capN, hx, hy + hr * 3.6);
}
function scvOver(pv, g, X, Y, U, c) {
  for (const s of pv.sibs) { // little sperm: a head and a wiggling tail
    const x = X(s.x), y = Y(s.y), a = s.a, hr = U * 0.008 * s.r, col = s.back ? BLV_GREEN : s.taste ? SIV_BONK : c;
    if (s.taste || s.only) pvGlow(g, x, y, hr * 4, col, 0.5);
    g.strokeStyle = col; g.lineWidth = Math.max(1, hr * 0.5); g.beginPath(); g.moveTo(x, y);
    for (let i = 1; i <= 6; i++) { const f = i / 6, w = Math.sin(s.wig - f * 6) * hr * 0.9 * f; g.lineTo(x - Math.cos(a) * hr * 5 * f - Math.sin(a) * w, y - Math.sin(a) * hr * 5 * f + Math.cos(a) * w); }
    g.stroke();
    g.fillStyle = col; g.beginPath(); g.ellipse(x, y, hr * 1.4, hr, a, 0, TAU); g.fill();
  }
}
PV_OWN[SCV.id] = { init: scvInit, step: scvStep, draw: sivDraw, flags: SCV_FLAG, under: scvUnder, over: scvOver, cell: lpvCell, me: scvMe };
