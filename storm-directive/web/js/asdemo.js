'use strict';
// Spawn Prawn - previews and branch scenes for the Acid and Static weapons, plus the shared status look for every
// typed preview (xs*: Corrosion, Burn and Alien bars; Charged, Snared, Ignited, Possessed), on the sidemo.js engine with
// bldemo.js and fbdemo.js helpers.
//  - Acid Spit (v_fire_proj): a pink glob (16) at the nearest cell in reach (440), 8 a magazine; hits fill Corrosion,
//    and a full bar strips a Shell layer.
//  - Red Flagship (v_shock_beam): a held beam (35 a second) on the nearest cell within 300; 3 s of beam a magazine.
//  - Soulmate Signal (s_twin): your twin mirrors you across the crowd; the beam between you burns what it crosses and you
//    sweep it by swimming; every 1.6 s it re-anchors on the crowd and both ends pulse.
//  - Unwanted Contact (s_tesla): a bolt (13) that jumps 3 times (140 each, 88% a jump) and Charges what it hits.
// Hooks: none (PV_OWN entries).

// ================================================================ statuses (shared by asdemo, mfdemo, aldemo)
const XS = { cor: '#ff2fa8', chg: '#ffe94a', snr: '#7fd04a', burn: '#ff6a2a', alien: '#b06cff' };
// Bars: Corrosion ('cor'), Burn ('burn') and Alien ('alien') fill 0..1; full returns true and fires the status.
function xsAdd(pv, e, k, a) {
  if (!e || e.hp <= 0 || e.dying) return false;
  const B = e.xs || (e.xs = {});
  B[k] = (B[k] || 0) + a;
  if (B[k] < 1) return false;
  B[k] = 0;
  if (k === 'cor') { if (e.shell > 0) { e.shell--; sivBits(pv, e.x, e.y, 6, DEF_PAL.shell, 0.3); sivTxt(pv, e.x, e.y - e.r - 0.05, 'CORRODED', XS.cor); } else { e.corT = 3; sivTxt(pv, e.x, e.y - e.r - 0.05, 'CORRODED', XS.cor); } }
  if (k === 'burn') { e.ign = 3; sivTxt(pv, e.x, e.y - e.r - 0.05, 'IGNITED', XS.burn); }
  if (k === 'alien') { if (!e.boss) { e.poss = 4; sivTxt(pv, e.x, e.y - e.r - 0.05, 'POSSESSED', XS.alien); } }
  if (pv.own.full) pv.own.full(pv, e, k);
  return true;
}
const xsCharge = (e, t) => { e.chg = Math.max(e.chg || 0, t || 3); };
const xsSnare = (e, t) => { e.snr = Math.max(e.snr || 0, t || 1.5); };
// Status upkeep each frame; then the cells move (Snared: slower; stuck: not at all; Possessed: they hunt their mates).
function xsStep(pv, dt) {
  const fix = [];
  for (const e of sivAlive(pv)) {
    if (e.dying) continue;
    for (const k of ['chg', 'snr', 'corT', 'stuck', 'fear']) if (e[k] > 0) e[k] -= dt;
    if (e.ign > 0) { e.ign -= dt; e.igT = (e.igT || 0) + dt; if (e.igT > 0.5) { e.igT = 0; sivDamage(pv, e, 3, false, XS.burn); } if (Math.random() < dt * 8) pv.parts.push({ x: e.x + (Math.random() - 0.5) * e.r, y: e.y - e.r * 0.5, vx: 0, vy: -0.1, life: 0.35, color: XS.burn }); }
    if (e.poss > 0) { // it turns on its mates
      e.poss -= dt;
      const o = fbNearest(pv, e, 0.6, e, q => !(q.poss > 0) && !q.spit);
      if (o) { const d = sivD(o, e) || 1; e.x += (o.x - e.x) / d * 0.12 * dt; e.y += (o.y - e.y) / d * 0.12 * dt; e.biteT = (e.biteT || 0) - dt; if (d < e.r + o.r + 0.01 && e.biteT <= 0) { e.biteT = 0.6; sivDamage(pv, o, 8, false, XS.alien); if (pv.own.possHit) pv.own.possHit(pv, e, o); } }
      fix.push([e, e.x, e.y]); continue;
    }
    if (e.stuck > 0 || (e.fear > 0 && pv.own.fearMove)) { if (e.fear > 0) pv.own.fearMove(pv, e, dt); fix.push([e, e.x, e.y]); continue; }
    if (e.snr > 0) { const sp = e.sp; e.slowK = e.slowK || 0.4; fix.push([e, null, null, sp]); e.sp = sp * e.slowK; }
  }
  sivStepFoes(pv, dt);
  for (const [e, x, y, sp] of fix) { if (sp != null) { e.sp = sp; continue; } e.x = x; e.y = y; }
  blvTail(pv, dt, pv.own.wave);
}
function xsCell(pv, g, e, x, y, r, U) {
  blvSpitCell(g, e, x, y, r);
  const B = e.xs || {}; let i = 0;
  for (const k of ['cor', 'burn', 'alien']) if (B[k] > 0) { const R = r + 4 + i * 3; g.strokeStyle = XS[k]; g.lineWidth = 2; g.beginPath(); g.arc(x, y, R, Math.PI * 0.6, Math.PI * 0.6 + Math.PI * 1.8 * B[k]); g.stroke(); i++; }
  if (e.corT > 0) { g.fillStyle = XS.cor + '55'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  if (e.chg > 0) { g.strokeStyle = XS.chg; g.lineWidth = 1.5; g.setLineDash([2, 3]); g.lineDashOffset = pv.t * 30; g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0; }
  if (e.snr > 0 || e.stuck > 0) { g.fillStyle = XS.snr + (e.stuck > 0 ? '99' : '55'); g.beginPath(); g.ellipse(x, y + r * 0.4, r * 1.3, r * 0.7, 0, 0, TAU); g.fill(); }
  if (e.ign > 0) { pvGlow(g, x, y - r * 0.3, r * 1.6, XS.burn, 0.45); }
  if (e.poss > 0) { g.fillStyle = XS.alien + '66'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.fillRect(x - 3, y - 2, 2, 2); g.fillRect(x + 1, y - 2, 2, 2); }
  if (e.fear > 0) { g.fillStyle = XS.alien; g.font = `900 ${Math.round(U * 0.03)}px sans-serif`; g.textAlign = 'center'; g.fillText('!', x, y - r - 4); }
}
const xsCellHook = (pv, g, e, x, y, r, U) => { xsCell(pv, g, e, x, y, r, U); lpvCell(pv, g, e, x, y, r, U); if (pv.own.cell2) pv.own.cell2(pv, g, e, x, y, r, U); };
function xsBeam(g, X, Y, a, b, col, w, wob) { // a crackling beam
  const ax = X(a.x), ay = Y(a.y), bx = X(b.x), by = Y(b.y);
  g.strokeStyle = col; g.globalAlpha = 0.35; g.lineWidth = w * 2.5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  g.globalAlpha = 1; g.lineWidth = Math.max(1, w * 0.6); g.beginPath(); g.moveTo(ax, ay);
  const n = 8, nx = -(by - ay), ny = bx - ax, L = Math.hypot(nx, ny) || 1;
  for (let i = 1; i < n; i++) { const k = i / n, j = (Math.random() - 0.5) * (wob || 6); g.lineTo(ax + (bx - ax) * k + nx / L * j, ay + (by - ay) * k + ny / L * j); }
  g.lineTo(bx, by); g.stroke();
}
function xsArc(pv, a, b, col) { pv.fx.push({ type: 'line', a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, color: col || XS.chg, life: 0.25, max: 0.25 }); }
// A label for an effect that is mostly visual (shown near Spermy every 3 s while it is on).
function xsHint(pv, key, txt, col) { pv.hints = pv.hints || {}; if (!(pv.hints[key] > pv.t)) { pv.hints[key] = pv.t + 3; sivTxt(pv, pv.me.x, pv.me.y - 0.1, txt, col || pv.col); } }
function xsInit(pv, o) { const F = fbBase(pv, o); pv.puddles = []; pv.gemsF = []; return F; }
// Acid pools (shared): { x, y, r, t } that Corrode what stands in them.
function xsPools(pv, dt, k) {
  for (const P of pv.puddles) { P.t -= dt; for (const e of sivAlive(pv)) if (!e.dying && sivD(e, P) < P.r + e.r * 0.5) { e.poolT = (e.poolT || 0) + dt; if (e.poolT > 0.5) { e.poolT = 0; sivDamage(pv, e, 3, false, P.col || XS.cor); xsAdd(pv, e, k || 'cor', 0.15); } } }
  // (touching pools merge: Acid House)
  if (pv.F.has('house')) for (let i = 0; i < pv.puddles.length; i++) for (let j = i + 1; j < pv.puddles.length; j++) { const A = pv.puddles[i], B = pv.puddles[j]; if (!A.gone && !B.gone && sivD(A, B) < A.r + B.r) { B.gone = true; A.r = Math.min(0.2, Math.hypot(A.r, B.r)); A.t = Math.max(A.t, B.t); sivTxt(pv, A.x, A.y - A.r, 'MERGED', XS.cor); } }
  pv.puddles = pv.puddles.filter(P => P.t > 0 && !P.gone);
}
function xsDrawPools(pv, g, X, Y, U, col) { for (const P of pv.puddles) { g.globalAlpha = Math.min(1, P.t) * 0.35; g.fillStyle = P.col || col; g.beginPath(); g.ellipse(X(P.x), Y(P.y), U * P.r, U * P.r * 0.75, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; }

// ================================================================ Acid Spit
const ACV = { id: 'v_fire_proj', range: 0.75, cd: 0.45, mag: 8, reload: 1.2, dmg: 16, cor: 0.25 };
const ACV_FLAG = { A: 'spit', B: 'splash', C: 'after', 'Spit Take': 'spit', 'Second Helping': 'helping', 'Stripped Bare': 'bare', Spittoon: 'spittoon',
  'Splash Damage': 'splash', Backsplash: 'back', 'Nasty Fifth': 'fifth', Gargle: 'gargle', 'Bad Aftertaste': 'after', 'Wet Floor': 'wet', 'Pyramid Scheme': 'passon',
  'Leapfrog': 'lob', 'Battery Acid': 'battery', 'Projectile Vomit': 'vomit', 'Acid House': 'house' };
function acvInit(pv) {
  const F = xsInit(pv, { range: ACV.range, mag: ACV.mag, reload: ACV.reload, rate: ACV.cd, lobs: [], big: 0, idle: 0, vomit: null });
  pv.me.x = 0.18;
  if (F.has('spittoon')) pv.patrol = true;
  if (F.has('vomit')) { pv.mag = pv.ammo = 99; }
}
function acvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  const far = F.has('gargle'), line = F.has('lob') || F.has('vomit');
  for (let i = 0; i < 6; i++) {
    const e = sivFoe(pv, line ? 0.45 + i * 0.08 : (far ? 1.05 : 0.6) + R() * 0.35, line ? H * 0.56 + (R() - 0.5) * 0.02 : H * (0.15 + R() * 0.7), { hp: F.has('after') || F.has('house') ? 34 : F.has('bare') || F.has('helping') ? 130 : 60, sp: far ? 0.06 : 0.03, shell: F.has('spit') || F.has('battery') || F.has('bare') ? 2 : 1 });
    if (F.has('spittoon')) e.dodge = (R() < 0.5 ? 1 : -1) * 2;
  }
}
function acvShoot(pv, t, o) {
  const me = pv.me, a = Math.atan2(t.y - me.y, t.x - me.x) + (Math.random() - 0.5) * 0.08;
  me.a = a; me.kick = 0.008;
  return fbShot(pv, me.x, me.y, a, Object.assign({ dmg: ACV.dmg * (pv.F.has('splash') ? 0.85 : 1), r: 0.008 * (pv.big > 0 ? 2 : 1), col: XS.cor, v: 0.95, range: ACV.range }, o));
}
function acvFire(pv) {
  const F = pv.F, me = pv.me;
  let t = F.has('spit') && pv.lock && pv.lock.hp > 0 ? pv.lock : fbNearest(pv, me, ACV.range);
  if (!t) { pv.idle += pv.rate; return false; }
  if (F.has('spit')) pv.lock = t;
  if (F.has('gargle') && pv.idle >= 2) { pv.idle = 0; for (let i = -2; i <= 2; i++) acvShoot(pv, t).a += i * 0.12; sivTxt(pv, me.x, me.y - 0.07, 'GARGLE', XS.cor, true); return true; }
  pv.idle = 0;
  if (F.has('fifth') && pv.n % 5 === 4) { pv.lobs.push({ sx: me.x, sy: me.y, tx: t.x, ty: t.y, k: 0, pool: true }); sivTxt(pv, me.x, me.y - 0.07, 'NASTY FIFTH', XS.cor); return true; }
  if (F.has('lob')) { const behind = fbNearest(pv, t, 0.25, t, q => q.x > t.x) || t; pv.lobs.push({ sx: me.x, sy: me.y, tx: behind.x, ty: behind.y, k: 0, e: behind }); return true; }
  if (pv.big > 0) { pv.big--; sivTxt(pv, me.x, me.y - 0.07, 'BIG SPIT', XS.cor); }
  const s0 = acvShoot(pv, t); if (pv.F.has('spittoon')) s0.tgt = t;
  return true;
}
function acvHit(pv, s, e, drop) {
  const F = pv.F;
  const B = e.xs || {};
  let k = s.dmg * (drop ? 0.3 : 1);
  if (F.has('spit')) k *= 1 + 0.4 * (B.cor || 0);
  if (e.bare > 0) k *= 2;
  const sh = e.shell;
  sivDamage(pv, e, k, false, drop ? XS.cor : null);
  let a = ACV.cor * (F.has('spit') ? 1.5 : 1) * (drop ? 0.3 : 1) * (s.big ? 2 : 1);
  if (F.has('battery')) { a = 1; xsHint(pv, 'bat', 'BATTERY ACID: FULL BAR', XS.cor); }
  if (xsAdd(pv, e, 'cor', a)) {
    if (F.has('helping') && sh > 0) { e.xs.cor = 0.5; sivTxt(pv, e.x + 0.05, e.y - e.r, 'SECOND HELPING', XS.cor); }
    if (F.has('bare') && sh === 1) { e.bare = 4; sivTxt(pv, e.x, e.y - e.r - 0.08, 'STRIPPED BARE x2', XS.cor, true); }
  }
  if (F.has('after') || F.has('passon')) e.resid = Math.max(e.resid || 0, drop ? (s.gen || 0) : 1);
  if (F.has('splash') && !drop) for (const o of sivAlive(pv).filter(q => q !== e && !q.dying && sivD(q, e) < 0.1).slice(0, 3)) pv.drops = (pv.drops || []).concat([{ x: e.x, y: e.y, o, k: 0, gen: 0 }]);
  if (drop && F.has('back') && (B.cor || 0) > 0 && !(s.gen > 0)) { const o = fbNearest(pv, e, 0.1, e); if (o) { pv.drops.push({ x: e.x, y: e.y, o, k: 0, gen: 1 }); sivTxt(pv, e.x, e.y - e.r, 'BACKSPLASH', XS.cor); } }
}
function acvKill(pv, e) {
  const F = pv.F;
  if ((F.has('after') || F.has('passon')) && e.resid) { // the residue splashes onto its neighbours
    sivTxt(pv, e.x, e.y - e.r - 0.03, 'SPLAT', XS.cor, true); sivRing(pv, e.x, e.y, 0.12, XS.cor, 0.35);
    for (const o of sivAlive(pv)) if (o !== e && !o.dying && sivD(o, e) < 0.12) { xsAdd(pv, o, 'cor', 0.5); if (F.has('passon') && e.resid < 3) { o.resid = e.resid + 1; sivTxt(pv, o.x, o.y - o.r, 'PASS IT ON', XS.cor); } }
    if (F.has('wet')) pv.puddles.push({ x: e.x, y: e.y, r: 0.06, t: 2 });
  }
  if (F.has('house') && e.xs && e.xs.cor > 0) { pv.puddles.push({ x: e.x, y: e.y, r: 0.1, t: 3 }); sivTxt(pv, e.x, e.y - e.r, 'ACID HOUSE', XS.cor); }
}
function acvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.patrol) { const h = fbHome(pv); const sp = pv.puddles.find(P => P.spit); h.x = sp ? sp.x : 0.35 + Math.sin(pv.t * 0.8) * 0.2; h.y = H * (0.5 + Math.cos(pv.t * 1.1) * 0.3); me.x += (h.x - me.x) * Math.min(1, dt * 3); me.y += (h.y - me.y) * Math.min(1, dt * 3); }
  else fbMe(pv, dt);
  if (F.has('vomit')) { // a continuous stream through everything
    const t = fbNearest(pv, me, ACV.range);
    pv.vomit = t ? { a: Math.atan2(t.y - me.y, t.x - me.x) } : null;
    if (pv.vomit) { me.a = pv.vomit.a; pv.vt = (pv.vt || 0) + dt; if (pv.vt > 0.15) { pv.vt = 0; const end = { x: me.x + Math.cos(me.a) * ACV.range, y: me.y + Math.sin(me.a) * ACV.range }; for (const e of sivAlive(pv)) if (!e.dying && blvSeg(e, me, end) < e.r + 0.01) { sivDamage(pv, e, 4, false); xsAdd(pv, e, 'cor', ACV.cor * 1.5 * 0.35); } } if (!pv.vtold) { pv.vtold = 1; sivTxt(pv, me.x, me.y - 0.08, 'PROJECTILE VOMIT', XS.cor, true); } }
  } else blvGun(pv, dt, acvFire);
  if (!fbNearest(pv, me, ACV.range)) pv.idle += dt;
  for (const s of pv.pel) if (s.tgt && !s.hits && !s.dead && s.x > s.tgt.x + 0.06) { s.dead = true; pv.puddles.push({ x: s.x, y: s.y, r: 0.04, t: 5, spit: true }); sivTxt(pv, s.x, s.y - 0.03, 'MISS', '#8a959a'); } // (Spittoon: a glob that misses lands)
  fbStepShots(pv, dt, (pv, s, e) => acvHit(pv, s, e), (pv, s) => { if (F.has('spittoon') && !s.hits && !s.tgt) pv.puddles.push({ x: s.x, y: s.y, r: 0.04, t: 4, spit: true }); });
  for (const L of pv.lobs) { L.k += dt / 0.55; if (L.k >= 1) { L.done = true; if (L.pool) { pv.puddles.push({ x: L.tx, y: L.ty, r: 0.085, t: 3 }); sivRing(pv, L.tx, L.ty, 0.085, XS.cor, 0.3); } else { const e = L.e && L.e.hp > 0 ? L.e : fbNearest(pv, { x: L.tx, y: L.ty }, 0.05); if (e) { acvHit(pv, { dmg: ACV.dmg }, e); sivTxt(pv, e.x, e.y - e.r - 0.03, 'LOB', XS.cor); } } } }
  pv.lobs = pv.lobs.filter(L => !L.done);
  for (const d of pv.drops || []) { d.k += dt / 0.3; if (d.k >= 1) { d.done = true; if (d.o.hp > 0) acvHit(pv, { dmg: ACV.dmg, gen: d.gen }, d.o, true); } }
  pv.drops = (pv.drops || []).filter(d => !d.done);
  // Spittoon: swim through a puddle of your own and the next 3 spits are double size.
  for (const P of pv.puddles) if (P.spit && sivD(P, me) < P.r + 0.02) { P.t = 0; pv.big = 3; sivTxt(pv, me.x, me.y - 0.07, 'SPITTOON', XS.cor, true); }
  for (const e of sivAlive(pv)) { if (e.bare > 0) e.bare -= dt; if (e.dodge) e.y += Math.sin(pv.t * 3 + e.wob) * e.dodge * 0.25 * dt; }
  xsPools(pv, dt);
  xsStep(pv, dt);
}
function acvUnder(pv, g, X, Y, U) { xsDrawPools(pv, g, X, Y, U, XS.cor); }
function acvOver(pv, g, X, Y, U) {
  fbDrawShots(pv, g, X, Y, U);
  for (const L of pv.lobs) { const x = X(L.sx + (L.tx - L.sx) * L.k), y = Y(L.sy + (L.ty - L.sy) * L.k) - Math.sin(L.k * Math.PI) * U * 0.1; pvGlow(g, x, y, U * 0.03, XS.cor, 0.8); }
  for (const d of pv.drops || []) { const x = X(d.x + (d.o.x - d.x) * d.k), y = Y(d.y + (d.o.y - d.y) * d.k) - Math.sin(d.k * Math.PI) * U * 0.04; g.fillStyle = XS.cor; g.beginPath(); g.arc(x, y, 2.5, 0, TAU); g.fill(); }
  if (pv.vomit) { const me = pv.me; xsBeam(g, X, Y, me, { x: me.x + Math.cos(pv.vomit.a) * ACV.range, y: me.y + Math.sin(pv.vomit.a) * ACV.range }, XS.cor, 5, 4); }
}
function acvCell2(pv, g, e, x, y, r) { if (e.resid) { g.fillStyle = '#8ac926'; for (let i = 0; i < 2; i++) g.fillRect(x - r * 0.5 + i * r, y + r * 0.8 + ((pv.t * 2 + i) % 1) * 5, 2, 3); } if (e.bare > 0) { g.strokeStyle = XS.cor; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, r + 1, 0, TAU); g.stroke(); } }
PV_OWN[ACV.id] = { init: acvInit, step: acvStep, draw: sivDraw, flags: ACV_FLAG, wave: acvWave, under: acvUnder, over: acvOver, cell: xsCellHook, cell2: acvCell2, kill: acvKill };

// ================================================================ Red Flagship (beam)
const RFV = { id: 'v_shock_beam', range: 0.51, dps: 35, mag: 3, reload: 1.2 };
const RFV_FLAG = { A: 'over', B: 'crit', C: 'pixels', Overclocked: 'over', 'Hard Interrupt': 'interrupt', 'Static Cling': 'cling', 'Screen Burn': 'sburn',
  'Critical Error': 'crit', 'Cascade Failure': 'cascade', 'Rolling Blackout': 'blackout', 'Off and On Again': 'restart', 'Dead Pixels': 'pixels',
  'Stuck Pixels': 'stuck', 'Packet Loss': 'packet', 'Wrong Cable': 'wrong', 'Blue Screen of Death': 'bsod', 'Multi-Monitor Setup': 'multi', 'Kernel Panic': 'kernel' };
function rfvInit(pv) {
  const F = xsInit(pv, { range: RFV.range, mag: 1, reload: RFV.reload, beamT: RFV.mag, held: null, holdT: 0, kills: 0, ghosts: [], dead: [], glitchT: 0, offT: 6, off: 0 });
  pv.me.x = F.has('wrong') ? 0.6 : 0.2;
  if (F.has('multi')) { pv.me.x = 0.5; pv.patrol = true; }
}
function rfvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  const weak = F.has('crit') || F.has('kernel'), tough = F.has('over') || F.has('bsod');
  for (let i = 0; i < 6; i++) { const back = F.has('wrong') ? i % 2 === 0 : F.has('multi') ? i % 3 === 0 : false; sivFoe(pv, back ? 0.05 + R() * 0.15 : 0.55 + R() * 0.35, H * (0.15 + R() * 0.7), { hp: weak ? 30 : tough ? 260 : 110, sp: 0.04 }); }
  if (F.has('interrupt')) sivFoe(pv, 0.62, H * 0.5, { hp: 400, sp: 0.004, spit: true, spitCd: 2.4 });
}
// The beam's line(s) this frame: [{ a, b, k }] (k: damage share).
function rfvLines(pv) {
  const F = pv.F, me = pv.me, R = RFV.range;
  if (pv.off > 0) return [];
  if (F.has('multi')) { const a0 = pv.t * 0.8; return [0, 1, 2, 3].map(i => { const a = a0 + i * Math.PI / 2; return { a: me, b: { x: me.x + Math.cos(a) * R, y: me.y + Math.sin(a) * R }, k: 1 }; }); }
  if (F.has('packet')) { const t = fbNearest(pv, me, R * 0.6), a0 = t ? Math.atan2(t.y - me.y, t.x - me.x) : 0; if (t) me.a = a0; return t ? [-3, -2, -1, 0, 1, 2, 3].map(i => ({ a: me, b: { x: me.x + Math.cos(a0 + i * 0.18) * R * 0.5, y: me.y + Math.sin(a0 + i * 0.18) * R * 0.5 }, k: 0.35 })) : []; }
  const t = pv.held && pv.held.hp > 0 && sivD(pv.held, me) < R + pv.held.r ? pv.held : fbNearest(pv, me, R, null, e => !e.spit || F.has('interrupt'));
  if (t !== pv.held) { if (pv.held && F.has('over') && pv.holdT > 0.5) sivTxt(pv, me.x, me.y - 0.07, 'SWITCH: RESET', '#8a959a'); pv.held = t; pv.holdT = 0; }
  if (!t) return [];
  me.a = Math.atan2(t.y - me.y, t.x - me.x);
  const from = F.has('wrong') ? { x: me.x - Math.cos(me.a) * 0.04, y: me.y - Math.sin(me.a) * 0.04 } : me;
  return [{ a: from, b: t, k: F.has('pixels') ? 0.7 : 1, t }];
}
function rfvHurt(pv, e, k) {
  const F = pv.F;
  sivDamage(pv, e, k, false, XS.chg);
  xsCharge(e, 1);
  if (e.hp <= 0) rfvDied(pv, e, 0);
}
function rfvDied(pv, e, depth) {
  const F = pv.F;
  if (e.rfDone) return; e.rfDone = true;
  pv.kills++;
  if (F.has('crit') || F.has('cascade')) { // Critical Error: a pulse (Cascade Failure: 3 deep)
    sivRing(pv, e.x, e.y, 0.1, XS.chg, 0.3); if (depth) sivTxt(pv, e.x, e.y - e.r - 0.03, 'CASCADE', XS.chg); else sivTxt(pv, e.x, e.y - e.r - 0.03, 'CRITICAL ERROR', XS.chg);
    for (const o of sivAlive(pv)) if (o !== e && !o.dying && sivD(o, e) < 0.1) { sivDamage(pv, o, RFV.dps * 0.5, false, XS.chg); if (o.hp <= 0 && F.has('cascade') && depth < 2) rfvDied(pv, o, depth + 1); }
  }
  if (F.has('blackout') && pv.kills % 10 === 0) { pv.flick = 0.3; for (const o of sivAlive(pv)) xsCharge(o, 3); sivTxt(pv, 0.5, pv.fh * 0.2, 'ROLLING BLACKOUT', XS.chg, true); }
  if (F.has('kernel') && !(e.kp >= 3)) { // Charges everything near, and the beam jumps to the nearest
    const near = sivAlive(pv).filter(o => o !== e && !o.dying && sivD(o, e) < 0.26);
    for (const o of near) { xsCharge(o, 3); xsArc(pv, e, o); }
    if (near.length) { const o = near.sort((a, b) => sivD(a, e) - sivD(b, e))[0]; o.kp = (e.kp || 0) + 1; pv.jump = { from: e, to: o, t: 0.6 }; sivTxt(pv, e.x, e.y - e.r - 0.05, 'KERNEL PANIC', XS.chg, true); }
  }
}
function rfvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.patrol) { const h = fbHome(pv); h.x = 0.5 + Math.cos(pv.t * 0.8) * 0.12; h.y = H * (0.56 + Math.sin(pv.t * 0.8) * 0.2); me.x += (h.x - me.x) * Math.min(1, dt * 3); me.y += (h.y - me.y) * Math.min(1, dt * 3); }
  else fbMe(pv, dt);
  // Have You Tried Turning It Off: every 6 s it blinks off; the restart Charges everything on its line.
  if (F.has('restart')) { pv.offT -= dt; if (pv.offT <= 0) { pv.offT = 6; pv.off = 0.4; } if (pv.off > 0) { pv.off -= dt; if (pv.off <= 0) { pv.restart = true; sivTxt(pv, me.x, me.y - 0.08, 'OFF AND ON AGAIN', XS.chg, true); } } }
  let lines = [];
  if (pv.rel > 0) { pv.rel -= dt; if (pv.rel <= 0) pv.beamT = RFV.mag; }
  else { lines = rfvLines(pv); if (lines.length) { pv.beamT -= dt; if (pv.beamT <= 0) { pv.rel = RFV.reload; sivTxt(pv, me.x, me.y - 0.06, 'RELOAD', '#8a959a'); } } }
  pv.lines = lines; pv.ammo = pv.rel > 0 ? 0 : 1;
  if (lines.length) { if (F.has('packet')) xsHint(pv, 'pk', 'PACKET LOSS'); if (F.has('wrong')) xsHint(pv, 'wr', 'WRONG CABLE: OUT OF YOUR TAIL'); if (F.has('multi')) xsHint(pv, 'mm', 'MULTI-MONITOR SETUP'); if (F.has('pixels')) xsHint(pv, 'px', 'DEAD PIXELS'); if (F.has('over') && pv.holdT > 1) xsHint(pv, 'oc', 'OVERCLOCKED +' + Math.round(Math.min(1, pv.holdT / 3) * 100) + '%', '#ffffff'); }
  if (lines.length && lines[0].t) pv.holdT += dt;
  const charge = F.has('over') ? Math.min(1, pv.holdT / 3) : 0;
  pv.tick = (pv.tick || 0) - dt;
  if (pv.tick <= 0 && lines.length) {
    pv.tick = 0.1;
    const hit = new Set();
    for (const L of lines) for (const e of sivAlive(pv)) {
      if (e.dying || hit.has(e)) continue;
      if (L.t ? e !== L.t : blvSeg(e, L.a, L.b) > e.r + 0.01) continue;
      hit.add(e);
      let k = RFV.dps * 0.1 * L.k * (F.has('crit') ? 0.9 : 1) * (1 + charge);
      if (F.has('bsod') && L.t && pv.holdT >= 2 && !e.bsod) { e.bsod = true; k *= 5; e.stun = 1; sivTxt(pv, e.x, e.y - e.r - 0.06, 'BLUE SCREEN', '#5aa9ff', true); sivRing(pv, e.x, e.y, e.r * 3, '#5aa9ff', 0.4); }
      if (pv.restart) { xsCharge(e, 3); }
      rfvHurt(pv, e, k);
    }
    pv.restart = false;
    if (charge >= 1 && lines[0].t) {
      const t = lines[0].t;
      if (F.has('interrupt') && t.spit && !(t.intT > pv.t)) { t.intT = pv.t + 1.5; t.spitT = 2; sivTxt(pv, t.x, t.y - t.r - 0.05, 'INTERRUPTED', '#ffffff', true); }
      if (F.has('cling')) { xsCharge(t, 1); pv.clingT = (pv.clingT || 0) + 0.1; if (pv.clingT >= 0.5) { pv.clingT = 0; const o = fbNearest(pv, t, 0.2, t); if (o) { xsArc(pv, t, o); rfvHurt(pv, o, 6); sivTxt(pv, o.x, o.y - o.r, 'STATIC CLING', XS.chg); } } }
    }
  }
  // Screen Burn: where the beam rests 1 s, a ghost of it stays 3 s and still zaps.
  if (F.has('sburn') && lines.length && lines[0].t) { pv.restT = (pv.restT || 0) + dt; if (pv.restT > 1) { pv.restT = 0; pv.ghosts.push({ a: { x: me.x, y: me.y }, b: { x: lines[0].t.x, y: lines[0].t.y }, t: 3 }); sivTxt(pv, lines[0].t.x, lines[0].t.y - 0.06, 'SCREEN BURN', XS.chg); } }
  for (const G2 of pv.ghosts) { G2.t -= dt; G2.z = (G2.z || 0) - dt; if (G2.z <= 0) { G2.z = 0.3; for (const e of sivAlive(pv)) if (!e.dying && blvSeg(e, G2.a, G2.b) < e.r + 0.01) rfvHurt(pv, e, 3); } }
  pv.ghosts = pv.ghosts.filter(G2 => G2.t > 0);
  // Dead Pixels: three short zaps beside the line every 0.5 s (Stuck Pixels: they stay on the floor 1 s).
  if (F.has('pixels') && lines.length && lines[0].t) {
    pv.glitchT -= dt;
    if (pv.glitchT <= 0) {
      pv.glitchT = 0.5; const L = lines[0], a = Math.atan2(L.b.y - L.a.y, L.b.x - L.a.x), nx = -Math.sin(a), ny = Math.cos(a);
      for (const o of [-1, 0.5, 1.6]) { const k = 0.3 + Math.random() * 0.5, cx = L.a.x + (L.b.x - L.a.x) * k + nx * o * 0.05, cy = L.a.y + (L.b.y - L.a.y) * k + ny * o * 0.05;
        const A = { x: cx - Math.cos(a) * 0.05, y: cy - Math.sin(a) * 0.05 }, B = { x: cx + Math.cos(a) * 0.05, y: cy + Math.sin(a) * 0.05 };
        xsArc(pv, A, B); for (const e of sivAlive(pv)) if (!e.dying && blvSeg(e, A, B) < e.r + 0.01) rfvHurt(pv, e, RFV.dps * 0.5 * 0.5);
        if (F.has('stuck')) pv.dead.push({ x: cx, y: cy, t: 1 }); }
    }
  }
  for (const d of pv.dead) { d.t -= dt; for (const e of sivAlive(pv)) if (!e.dying && sivD(e, d) < e.r + 0.012 && !(e.pixT > pv.t)) { e.pixT = pv.t + 0.4; rfvHurt(pv, e, 5); sivTxt(pv, e.x, e.y - e.r, 'STUCK PIXEL', XS.chg); } }
  pv.dead = pv.dead.filter(d => d.t > 0);
  if (pv.jump) { pv.jump.t -= dt; if (pv.jump.to.hp > 0) { pv.held = pv.jump.to; } if (pv.jump.t <= 0) pv.jump = null; }
  if (pv.flick > 0) pv.flick -= dt;
  fbSpit(pv, dt);
  xsStep(pv, dt);
}
function rfvUnder(pv, g, X, Y, U) {
  for (const G2 of pv.ghosts) { g.globalAlpha = Math.min(1, G2.t) * 0.3; g.strokeStyle = XS.chg; g.lineWidth = 4; g.beginPath(); g.moveTo(X(G2.a.x), Y(G2.a.y)); g.lineTo(X(G2.b.x), Y(G2.b.y)); g.stroke(); }
  for (const d of pv.dead) { g.globalAlpha = d.t; g.fillStyle = XS.chg; g.fillRect(X(d.x) - 2, Y(d.y) - 2, 4, 4); }
  g.globalAlpha = 1; fbDrawSpit(pv, g, X, Y, U);
}
function rfvOver(pv, g, X, Y, U, c) {
  const F = pv.F, charge = F.has('over') ? Math.min(1, pv.holdT / 3) : 0;
  for (const L of pv.lines || []) xsBeam(g, X, Y, L.a, L.b, charge >= 1 ? '#ffffff' : c, 2 + charge * 4, F.has('pixels') ? 10 : 5);
  if (pv.flick > 0) { g.globalAlpha = pv.flick; g.fillStyle = XS.chg; g.fillRect(0, 0, X(1), Y(pv.fh)); g.globalAlpha = 1; }
}
function rfvMe(pv, g, hx, hy, hr, U) { // beam left this magazine; Rolling Blackout's kill count
  g.fillStyle = pv.rel > 0 ? '#ffffff22' : pv.col; g.fillRect(hx - hr * 1.6, hy + hr * 2.6, hr * 3.2 * Math.max(0, pv.beamT / RFV.mag), 3);
  if (pv.F.has('blackout')) { g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = XS.chg; g.fillText(pv.kills % 10 + '/10', hx, hy + hr * 4.2); }
}
PV_OWN[RFV.id] = { init: rfvInit, step: rfvStep, draw: sivDraw, flags: RFV_FLAG, wave: rfvWave, under: rfvUnder, over: rfvOver, cell: xsCellHook, me: rfvMe };

// ================================================================ Soulmate Signal (twin beam)
const TWV = { id: 's_twin', cd: 1.6, mag: 3, reload: 2, dmg: 24, half: 0.44, area: 0.15 };
const TWV_FLAG = { A: 'long', B: 'toxic', C: 'third', 'Long-Distance Love': 'long', 'Absence Makes It Grow': 'stretch', 'Tug of Love': 'tug', 'Evil Twin': 'evil',
  'Toxic Codependency': 'toxic', 'Boiling Point': 'boil', Swapsies: 'swap', 'Gold Digger': 'sticky', 'Third Wheel': 'third', 'Mixed Signals': 'crossed',
  'Love Triangle': 'triangle', 'Mirror Image': 'mirror', Quadruplets: 'quads', 'Psychic Link': 'psychic', 'Conjoined Twins': 'conjoined' };
function twvInit(pv) {
  const F = xsInit(pv, { range: 0.9, mag: TWV.mag, reload: TWV.reload, rate: TWV.cd, anchor: null, boost: [], extra: [], gems: [], evilT: 3, evil: 0, pulseT: 1.5 });
  pv.me.x = 0.3; pv.patrol = !F.has('conjoined');
}
function twvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < (F.has('toxic') ? 12 : 7); i++) sivFoe(pv, 0.4 + R() * 0.55, H * (0.12 + R() * 0.76), { hp: F.has('toxic') ? 90 : 70, sp: 0.02 });
  if (F.has('evil')) sivFoe(pv, 0.85, H * 0.2, { r: 0.045, hp: 300, sp: 0.01, elite: true });
  if (F.has('mirror')) sivFoe(pv, 0.9, H * 0.85, { hp: 500, sp: 0.002, spit: true, spitCd: 1 });
  if (F.has('sticky')) for (let i = 0; i < 6; i++) pv.gems.push({ x: 0.35 + R() * 0.5, y: H * (0.15 + R() * 0.7) });
}
// Your twin(s): the mirror of you through the anchor (more twins fan out either side).
function twvTwins(pv) {
  const F = pv.F, me = pv.me, A = pv.anchor;
  if (F.has('conjoined')) return [{ x: me.x + Math.cos(me.a) * 0.02, y: me.y + Math.sin(me.a) * 0.02, fused: true }];
  if (!A) return [];
  const n = F.has('quads') ? 3 : 1, vx = me.x - A.x, vy = me.y - A.y, pts = [];
  for (let k = 0; k < n; k++) { const th = Math.PI + (k - (n - 1) / 2) * 0.45, c = Math.cos(th), s = Math.sin(th); pts.push({ x: A.x + vx * c - vy * s, y: A.y + vx * s + vy * c }); }
  if (pv.evil > 0 && pv.evilAt) pts[0] = pv.evilAt;
  return pts;
}
function twvFire(pv) {
  const F = pv.F, me = pv.me, t = fbCluster(pv, me, 0.6, 0.15);
  if (!t) return false;
  pv.anchor = { x: t.x, y: t.y };
  if (F.has('triangle')) pv.third = { x: t.x + 0.1, y: Math.max(0.05, t.y - 0.18) };
  for (const c of [me].concat(twvTwins(pv))) { sivRing(pv, c.x, c.y, TWV.area, pv.col, 0.3); for (const e of sivAlive(pv)) if (!e.dying && sivD(e, c) < TWV.area) twvHurt(pv, e, TWV.dmg * 0.9); }
  return true;
}
function twvHurt(pv, e, k) { sivDamage(pv, e, k, false, XS.chg); xsCharge(e, 2); }
function twvSegs(pv) {
  const F = pv.F, me = pv.me, tw = twvTwins(pv);
  if (F.has('conjoined')) { const t = fbNearest(pv, me, 0.9); if (t) me.a = Math.atan2(t.y - me.y, t.x - me.x); return [[me, { x: me.x + Math.cos(me.a) * 0.9, y: me.y + Math.sin(me.a) * 0.9 }]]; }
  const segs = tw.map(t => [me, t]);
  if (pv.third && tw[0]) segs.push([tw[0], pv.third], [pv.third, me]);
  return segs;
}
function twvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.patrol) { const h = fbHome(pv); h.x = 0.28 + Math.sin(pv.t * 0.7) * 0.08; h.y = H * (0.56 + Math.sin(pv.t * 1.1) * 0.3); me.x += (h.x - me.x) * Math.min(1, dt * 3); me.y += (h.y - me.y) * Math.min(1, dt * 3); }
  else fbMe(pv, dt);
  // The anchor is dragged along so the beam is never longer than its reach (Long-Distance: twice as far).
  const half = TWV.half * (F.has('long') ? 2 : 1);
  if (pv.anchor) { const A = pv.anchor, d = sivD(A, me); if (d > half / 2) { A.x = me.x + (A.x - me.x) * half / 2 / d; A.y = me.y + (A.y - me.y) * half / 2 / d; } }
  blvGun(pv, dt, twvFire);
  // Evil Twin: once in a while your twin wanders off after the elite with its end of the beam.
  if (F.has('evil')) { pv.evilT -= dt; const el = sivAlive(pv).find(e => e.elite); if (pv.evilT <= 0 && el) { pv.evilT = 9; pv.evil = 5; pv.evilAt = { x: (twvTwins(pv)[0] || el).x, y: (twvTwins(pv)[0] || el).y }; sivTxt(pv, el.x, el.y - el.r - 0.05, 'EVIL TWIN', XS.chg, true); } if (pv.evil > 0) { pv.evil -= dt; if (el) { const d = sivD(el, pv.evilAt) || 1; pv.evilAt.x += (el.x - pv.evilAt.x) / d * Math.min(d, 0.3 * dt); pv.evilAt.y += (el.y - pv.evilAt.y) / d * Math.min(d, 0.3 * dt); } } }
  const segs = twvSegs(pv); pv.segs = segs;
  if (segs.length) { if (F.has('long')) xsHint(pv, 'ld', 'LONG-DISTANCE: TWICE AS FAR'); if (F.has('quads')) xsHint(pv, 'q', 'QUADRUPLETS'); if (F.has('conjoined')) xsHint(pv, 'cj', 'CONJOINED: x4 STRAIGHT AHEAD'); if (F.has('triangle') && pv.third) xsHint(pv, 'lt', 'LOVE TRIANGLE'); if (F.has('stretch')) xsHint(pv, 'sm', 'STRETCH MARKS +' + Math.round(60 * Math.min(1, sivD(segs[0][0], segs[0][1]) / (TWV.half * (F.has('long') ? 2 : 1)))) + '%'); }
  // Toxic Codependency: each cell crossed adds +10% for 2 s.
  pv.boost = pv.boost.filter(t => pv.t - t < 2);
  const bonus = F.has('toxic') ? Math.min(1, pv.boost.length * 0.1) : 0;
  if (F.has('toxic') && bonus > 0) xsHint(pv, 'tx', 'TOXIC +' + Math.round(bonus * 100) + '%', bonus >= 1 ? '#ffffff' : pv.col);
  pv.tick = (pv.tick || 0) - dt;
  if (pv.tick <= 0 && segs.length) {
    pv.tick = 0.2;
    const hit = new Set();
    for (const [a, b] of segs) for (const e of sivAlive(pv)) {
      if (e.dying || hit.has(e) || blvSeg(e, a, b) > e.r + 0.01) continue;
      hit.add(e);
      let k = TWV.dmg * 0.2 * (F.has('toxic') ? (hit.size < 3 ? 0.8 : 1) * (1 + bonus) : 1) * (F.has('third') ? 0.8 : 1) * (F.has('conjoined') ? 4 : 1);
      if (F.has('stretch')) k *= 1 + 0.6 * Math.min(1, sivD(a, b) / (half));
      if (F.has('toxic') && !(e.boostT > pv.t)) { e.boostT = pv.t + 0.4; pv.boost.push(pv.t); }
      if (bonus >= 1 && F.has('boil')) { xsCharge(e, 3); if (Math.random() < 0.15) sivTxt(pv, e.x, e.y - e.r, 'BOILING POINT', '#ffffff'); }
      const wasChg = e.chg > 0;
      twvHurt(pv, e, k);
      if (F.has('tug') && b !== me && sivD(e, b) < 0.12) { const d = sivD(e, me) || 1; e.kx += (me.x - e.x) / d * 0.25; e.ky += (me.y - e.y) / d * 0.25; if (Math.random() < 0.2) sivTxt(pv, e.x, e.y - e.r, 'TUG OF LOVE', XS.chg); }
      if (F.has('third') && wasChg) { const n = pv.extra.length, max = F.has('crossed') ? 3 : 1; if (n < max) { const o = fbNearest(pv, e, 0.25, e); if (o) { pv.extra.push({ a: e, b: o, t: 1 }); if (Math.random() < 0.3) sivTxt(pv, e.x, e.y - e.r - 0.03, 'THIRD WHEEL', XS.chg); } } }
    }
    for (const X2 of pv.extra) for (const e of sivAlive(pv)) if (!e.dying && blvSeg(e, X2.a, X2.b) < e.r + 0.01) twvHurt(pv, e, TWV.dmg * 0.1);
    // Crossed Wires: where two extra beams cross, a spark.
    if (F.has('crossed') && pv.extra.length > 1 && Math.random() < 0.3) { const A = pv.extra[0], B = pv.extra[1], m = { x: (A.b.x + B.b.x) / 2, y: (A.b.y + B.b.y) / 2 }; sivRing(pv, m.x, m.y, 0.05, XS.chg, 0.25); sivTxt(pv, m.x, m.y - 0.04, 'CROSSED WIRES', XS.chg); for (const e of sivAlive(pv)) if (sivD(e, m) < 0.05) twvHurt(pv, e, 6); }
    // Love Triangle: everything inside it is Charged.
    if (pv.third) { const tw = twvTwins(pv)[0]; if (tw) for (const e of sivAlive(pv)) if (xsInTri(e, me, tw, pv.third)) xsCharge(e, 1); }
  }
  for (const X2 of pv.extra) X2.t -= dt;
  pv.extra = pv.extra.filter(X2 => X2.t > 0 && X2.a.hp > 0 && X2.b.hp > 0);
  // Swapsies: at +100%, you and your twin trade places along the beam.
  if (F.has('swap') && bonus >= 1 && !(pv.swapT > pv.t)) { const tw = twvTwins(pv)[0]; if (tw) { pv.swapT = pv.t + 3; for (const e of sivAlive(pv)) if (blvSeg(e, me, tw) < e.r + 0.02) twvHurt(pv, e, TWV.dmg); xsArc(pv, me, tw, '#ffffff'); const h = fbHome(pv); me.x = tw.x; me.y = tw.y; pv.anchor = { x: (me.x + h.x) / 2, y: (me.y + h.y) / 2 }; sivTxt(pv, me.x, me.y - 0.07, 'SWAPSIES', '#ffffff', true); } }
  // Psychic Link: every 1.5 s a pulse runs along every beam.
  if (F.has('psychic')) { pv.pulseT -= dt; if (pv.pulseT <= 0) { pv.pulseT = 1.5; pv.pulse = 0.3; for (const [a, b] of segs) for (const e of sivAlive(pv)) if (!e.dying && blvSeg(e, a, b) < e.r + 0.015) { twvHurt(pv, e, TWV.dmg * 3 * 0.2); e.stun = 0.4; } sivTxt(pv, me.x, me.y - 0.07, 'PSYCHIC LINK', '#ffffff'); } if (pv.pulse > 0) pv.pulse -= dt; }
  // Sticky Fingers: gems the beam crosses come to your feet.
  for (const gm of pv.gems) { if (!gm.carry && segs.some(([a, b]) => blvSeg(gm, a, b) < 0.015)) { gm.carry = true; sivTxt(pv, gm.x, gm.y - 0.03, 'STICKY FINGERS', FB_GEM); } if (gm.carry) { const d = sivD(gm, me) || 1; gm.x += (me.x - gm.x) / d * Math.min(d, 0.6 * dt); gm.y += (me.y - gm.y) / d * Math.min(d, 0.6 * dt); if (d < 0.03) gm.got = true; } }
  pv.gems = pv.gems.filter(gm => !gm.got);
  // Mirror Image: a quarter of the shots at you hit your twin instead.
  fbSpit(pv, dt, (pv, b) => { const tw = twvTwins(pv)[0]; if (F.has('mirror') && tw && !b.rolled) { b.rolled = true; if (Math.random() < 0.5) { const a = Math.atan2(tw.y - b.y, tw.x - b.x); b.vx = Math.cos(a) * 0.3; b.vy = Math.sin(a) * 0.3; b.toTwin = true; } } if (b.toTwin && tw) { const a = Math.atan2(tw.y - b.y, tw.x - b.x); b.vx = Math.cos(a) * 0.3; b.vy = Math.sin(a) * 0.3; } if (b.toTwin && tw && sivD(b, tw) < 0.04) { sivTxt(pv, tw.x, tw.y - 0.05, 'MIRROR IMAGE', XS.chg); return true; } return false; });
  xsStep(pv, dt);
}
function xsInTri(p, a, b, c) { const s = (a, b, c) => (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y), d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); }
function twvOver(pv, g, X, Y, U, c) {
  const F = pv.F, me = pv.me, bonus = F.has('toxic') ? Math.min(1, pv.boost.length * 0.1) : 0, white = bonus >= 1 && F.has('boil');
  if (pv.third) { const tw = twvTwins(pv)[0]; if (tw) { g.globalAlpha = 0.12; g.fillStyle = XS.chg; g.beginPath(); g.moveTo(X(me.x), Y(me.y)); g.lineTo(X(tw.x), Y(tw.y)); g.lineTo(X(pv.third.x), Y(pv.third.y)); g.closePath(); g.fill(); g.globalAlpha = 1; } }
  for (const [a, b] of pv.segs || []) xsBeam(g, X, Y, a, b, white || pv.pulse > 0 ? '#ffffff' : c, (F.has('third') ? 1.6 : 2) * (1 + bonus) * (F.has('conjoined') ? 2 : 1), 5);
  for (const X2 of pv.extra) xsBeam(g, X, Y, X2.a, X2.b, c, 1, 4);
  g.globalCompositeOperation = 'source-over';
  for (const t of twvTwins(pv)) if (!t.fused) { const x = X(t.x), y = Y(t.y), hr = U * 0.022; g.fillStyle = pv.evil > 0 ? '#ff5d8f' : PAL.you; g.globalAlpha = 0.8; g.beginPath(); g.ellipse(x, y, hr * 1.2, hr * 0.85, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (pv.third) { g.fillStyle = XS.chg; g.beginPath(); g.arc(X(pv.third.x), Y(pv.third.y), 4, 0, TAU); g.fill(); }
  for (const gm of pv.gems) { g.fillStyle = FB_GEM; g.save(); g.translate(X(gm.x), Y(gm.y)); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore(); }
  g.globalCompositeOperation = 'lighter';
}
PV_OWN[TWV.id] = { init: twvInit, step: twvStep, draw: sivDraw, flags: TWV_FLAG, wave: twvWave, under: (pv, g, X, Y, U) => fbDrawSpit(pv, g, X, Y, U), over: twvOver, cell: xsCellHook };

// ================================================================ Unwanted Contact (chain lightning)
const UCV = { id: 's_tesla', range: 0.56, cd: 0.7, mag: 6, reload: 1.8, dmg: 13, jumps: 3, jump: 0.24, keep: 0.88 };
const UCV_FLAG = { A: 'spread', B: 'conduct', C: 'feedback', "It's Spreading": 'spread', 'Split Ends': 'split', Afterglow: 'afterglow', 'Bad Hair Day': 'hair',
  'Conductive Personality': 'conduct', 'Spread the Love': 'love', 'Last Spark': 'last', 'Odd Sock': 'sock', 'Feedback Loop': 'feedback', 'Echo Chamber': 'echo',
  Brainstorm: 'brain', 'Balloon Animal': 'balloon', 'Tumble Dryer': 'dryer', 'Worked Up': 'worked', 'Grid Lock': 'grid' };
function ucvInit(pv) {
  const F = xsInit(pv, { range: UCV.range, mag: UCV.mag, reload: UCV.reload, rate: UCV.cd * (F0(pv, 'feedback') ? 1.25 : 1), arcs: 0, balloons: [], fast: 0 });
  pv.me.x = 0.18;
  pv.other = F.has('conduct') || F.has('feedback') || F.has('echo') || F.has('brain') || F.has('dryer') || F.has('last');
}
function ucvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 8; i++) sivFoe(pv, 0.45 + R() * 0.45, H * (0.12 + R() * 0.76), { hp: F.has('balloon') || F.has('last') ? 30 : 70, sp: 0.025 });
  if (F.has('sock')) { const e = pv.foes[pv.foes.length - 1]; e.rod = true; sivTxt(pv, e.x, e.y - e.r - 0.04, 'ODD SOCK', XS.chg); }
}
// A chain from a source cell: jumps to the nearest un-hit cells (Spread the Love: uncharged ones first).
function ucvChain(pv, from, first, o) {
  const F = pv.F;
  o = o || {};
  const jumps = o.jumps != null ? o.jumps : F.has('worked') ? 8 : F.has('spread') ? 6 : UCV.jumps;
  const keep = F.has('worked') ? 1.25 : F.has('spread') ? 0.75 : UCV.keep;
  let k = (o.dmg || UCV.dmg) * (F.has('conduct') ? 0.7 : 1), prev = from, cur = first; const hit = new Set();
  const rod = sivAlive(pv).find(e => e.rod && !e.dying);
  for (let j = 0; j <= jumps && cur; j++) {
    hit.add(cur); xsArc(pv, prev, cur);
    ucvHurt(pv, cur, k, true);
    if (j === 0 && F.has('split') && !o.fork) { const o2 = fbNearest(pv, cur, UCV.jump, cur, q => !hit.has(q)); if (o2) { sivTxt(pv, cur.x, cur.y - cur.r - 0.04, 'SPLIT ENDS', XS.chg); ucvChain(pv, cur, o2, { fork: true, jumps: jumps - 1, dmg: k * keep }); hit.add(o2); } }
    k *= keep; prev = cur;
    if (rod && !hit.has(rod) && j === 0) { cur = rod; continue; } // (Odd Sock: every chain passes through it)
    const pick = q => !hit.has(q) && (!F.has('love') || !(q.chg > 0));
    cur = fbNearest(pv, prev, UCV.jump, prev, pick) || (F.has('love') ? fbNearest(pv, prev, UCV.jump, prev, q => !hit.has(q)) : null);
    if (!cur && F.has('afterglow')) { xsCharge(prev, 6); if (Math.random() < 0.4) sivTxt(pv, prev.x, prev.y - prev.r - 0.04, 'AFTERGLOW 6s', XS.chg); }
  }
  if (F.has('worked')) xsHint(pv, 'wu', 'WORKED UP: +25% A JUMP', XS.chg);
  if (F.has('love')) xsHint(pv, 'sl', 'SPREAD THE LOVE: UNCHARGED FIRST', XS.chg);
}
function ucvHurt(pv, e, k, own, col) {
  const F = pv.F;
  if (!own && e.chg > 0 && F.has('conduct')) k *= 1.2;
  sivDamage(pv, e, k, false, col || XS.chg);
  if (own) xsCharge(e, 3);
  if (e.hp <= 0) {
    if (F.has('last') && e.chg > 0 && !(pv.fast > 0)) { pv.fast = 2; sivTxt(pv, pv.me.x, pv.me.y - 0.07, 'LAST SPARK +20%', XS.chg, true); }
    if (F.has('balloon') && own) { pv.balloons.push({ x: e.x, y: e.y, t: 3 }); sivTxt(pv, e.x, e.y - e.r - 0.03, 'BALLOON ANIMAL', XS.chg); }
  }
}
function ucvFire(pv) {
  const F = pv.F, me = pv.me;
  const t = fbCluster(pv, me, UCV.range, 0.2); if (!t) return false;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.006;
  if (F.has('brain') && pv.arcs >= 20) { pv.arcs = 0; sivTxt(pv, me.x, me.y - 0.08, 'BRAINSTORM', '#ffffff', true); for (const e of sivAlive(pv)) if (e.chg > 0 && !e.dying) { xsArc(pv, me, e, '#ffffff'); ucvHurt(pv, e, UCV.dmg, true); } return true; }
  ucvChain(pv, me, t);
  return true;
}
function ucvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me;
  fbMe(pv, dt);
  if (pv.fast > 0) { pv.fast -= dt; pv.cd -= dt * 0.2; }
  blvGun(pv, dt, ucvFire);
  // Your other weapon (grey): it makes Charged cells arc (Feedback Loop, Echo Chamber, Tumble Dryer, Conductive Personality).
  if (pv.other) fbOther(pv, dt, (pv, e, k) => {
    const was = e.chg > 0;
    ucvHurt(pv, e, k * (pv.fast > 0 ? 1 : 1), false, '#8a959a');
    if (was && F.has('conduct') && Math.random() < 0.3) sivTxt(pv, e.x, e.y - e.r - 0.03, '+20%', XS.chg);
    if (was) { const o = fbNearest(pv, e, UCV.jump, e); if (o) { xsArc(pv, e, o); ucvHurt(pv, o, 5, false); pv.arcs++; if (F.has('feedback') && Math.random() < 0.3) { const o2 = fbNearest(pv, o, UCV.jump, o, q => q !== e); if (o2) { xsArc(pv, o, o2, '#ffffff'); ucvHurt(pv, o2, 2.5, false); pv.arcs++; sivTxt(pv, o.x, o.y - o.r - 0.03, 'FEEDBACK', XS.chg); if (F.has('echo') && o2.chg > 0) { const o3 = fbNearest(pv, o2, UCV.jump, o2, q => q !== o && q !== e); if (o3) { xsArc(pv, o2, o3, '#ffffff'); ucvHurt(pv, o3, 1.5, false); sivTxt(pv, o2.x, o2.y - o2.r - 0.03, 'ECHO', XS.chg); } } } } } }
    if (F.has('dryer') && Math.random() < 0.2) { sivTxt(pv, e.x, e.y - e.r - 0.04, 'TUMBLE DRYER', XS.chg); ucvChain(pv, e, fbNearest(pv, e, UCV.jump, e) || e, { jumps: 2 }); }
  });
  // Bad Hair Day: Charged cells drift towards each other.
  if (F.has('hair')) for (const e of sivAlive(pv)) if (e.chg > 0) { const o = fbNearest(pv, e, 0.3, e, q => q.chg > 0); if (o) { const d = sivD(o, e) || 1; e.x += (o.x - e.x) / d * 0.05 * dt; e.y += (o.y - e.y) / d * 0.05 * dt; if (Math.random() < dt * 0.3) sivTxt(pv, e.x, e.y - e.r, 'BAD HAIR DAY', XS.chg); } }
  // Grid Lock: Charged cells are wired to their nearest Charged neighbour; the wire hurts what crosses it.
  pv.grid = [];
  if (F.has('grid') && pv.grid.length) xsHint(pv, 'gl', 'GRID LOCK', XS.chg);
  if (F.has('grid')) { const L = sivAlive(pv).filter(e => e.chg > 0 && !e.dying); for (const e of L) { const o = fbNearest(pv, e, 0.35, e, q => q.chg > 0); if (o && pv.grid.length < 8 && !pv.grid.some(g2 => g2[0] === o && g2[1] === e)) pv.grid.push([e, o]); } pv.gT = (pv.gT || 0) - dt; if (pv.gT <= 0) { pv.gT = 0.3; for (const [a, b] of pv.grid) for (const e of sivAlive(pv)) if (e !== a && e !== b && blvSeg(e, a, b) < e.r) { ucvHurt(pv, e, 4, false); if (Math.random() < 0.3) sivTxt(pv, e.x, e.y - e.r, 'GRID LOCK', XS.chg); } } }
  for (const b of pv.balloons) { b.t -= dt; const o = fbNearest(pv, b, 1); if (o) { const d = sivD(o, b) || 1; b.x += (o.x - b.x) / d * 0.15 * dt; b.y += (o.y - b.y) / d * 0.15 * dt; if (d < o.r + 0.01) { b.t = 0; sivRing(pv, b.x, b.y, 0.06, XS.chg, 0.25); ucvHurt(pv, o, 10, true); sivTxt(pv, b.x, b.y - 0.03, 'POP', XS.chg); } } }
  pv.balloons = pv.balloons.filter(b => b.t > 0);
  xsStep(pv, dt);
}
function ucvOver(pv, g, X, Y, U, c) {
  for (const [a, b] of pv.grid || []) xsBeam(g, X, Y, a, b, c, 1, 3);
  for (const b of pv.balloons) { g.strokeStyle = XS.chg; g.lineWidth = 1.5; g.beginPath(); g.ellipse(X(b.x), Y(b.y), 5, 7, 0, 0, TAU); g.stroke(); }
  for (const p of pv.pips || []) { g.fillStyle = '#8a959a'; g.beginPath(); g.arc(X(p.x), Y(p.y), U * 0.006, 0, TAU); g.fill(); }
}
function ucvCell2(pv, g, e, x, y, r) { if (e.rod) { g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - r - 10); g.lineTo(x, y - r); g.stroke(); } }
function ucvMe(pv, g, hx, hy, hr, U) { if (pv.F.has('brain')) { g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = XS.chg; g.fillText(Math.min(20, pv.arcs) + '/20', hx, hy + hr * 3.6); } }
PV_OWN[UCV.id] = { init: ucvInit, step: ucvStep, draw: sivDraw, flags: UCV_FLAG, wave: ucvWave, over: ucvOver, cell: xsCellHook, cell2: ucvCell2, me: ucvMe };
