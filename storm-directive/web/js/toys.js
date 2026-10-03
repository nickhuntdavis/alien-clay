'use strict';
// Spawn Prawn - toys: eight weapons that play unlike the rest. Colouring In (lasso), Due Date (delayed
// doom), Red Tape (shared damage), Imaginary Friend (a time-shifted copy of you), Peekaboo (vanish, then
// BOO), Twin Telepathy (a beam you aim by swimming), Bubble Wand (trap and throw) and Tooth Fairy (lure).
// Their data is in data.js (toy: 1). Hooks: toyFire (fireWeapon), toyTick (sigTick), toyHurt and
// toyDamageMul (damageEnemy), toyKill (killEnemy), toyHold and toySteer (updateEnemies), toyAim
// (shootPattern), toyBlock and toyPlayerHurt (hurtPlayer), toyAdapt (applyAdapt), drawToys (render).

const TOYS = () => G.toy || (G.toy = { marks: [], tapes: [], bubbles: [], teeth: [], soap: [], dots: [], shapes: [], path: [], friends: [] });
const toyOwned = kind => G.weapons.find(w => w && w.def.toy && w.def.kind === kind) || null;
const toyCan = e => !e.dead && !e.charmed && !e.egg && !e.phased;
const small = e => !e.boss && !e.rival && !e.bossDef && !e.final;

// ---------------------------------------------------------------- geometry
function segCross(a, b, c, d) {
  const d1 = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x), d2 = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x);
  const d3 = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x), d4 = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
function polyArea(P) { let s = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) s += (P[j].x + P[i].x) * (P[j].y - P[i].y); return Math.abs(s / 2); }
function inPoly(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i].y > y) !== (P[j].y > y) && x < (P[j].x - P[i].x) * (y - P[i].y) / (P[j].y - P[i].y) + P[i].x) c = !c;
  return c;
}
function segD(px, py, a, b) { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1, t = clamp(((px - a.x) * dx + (py - a.y) * dy) / l2, 0, 1); return Math.hypot(px - a.x - dx * t, py - a.y - dy * t); }
// Everything along a line, once each.
function alongLine(a, b, w, fn) {
  const L = Math.hypot(b.x - a.x, b.y - a.y);
  forNear((a.x + b.x) / 2, (a.y + b.y) / 2, L / 2 + w, e => { if (toyCan(e) && segD(e.x, e.y, a, b) < w + e.r) fn(e); });
}
function toySrc(w, name, extra) { return Object.assign(weaponSrc(w), { wname: name }, extra || {}); }

// ---------------------------------------------------------------- stat side (from applyAdapt)
function toyAdapt(w, s) {
  const P = G.P, has = id => hasSig(w, id);
  switch (w.def.kind) {
    case 'crayon': s.dmg *= 1 + 0.18 * P.multishot; s.lineW = 9 * (1 + 0.2 * P.pierce); break;
    case 'peek': s.dmg *= 1 + 0.18 * P.multishot; s.knock = 140 * (1 + 0.4 * P.pierce); if (has('objectperm')) s.dur *= 2; break;
    case 'duedate': s.repeat += 0.1 * P.pierce; if (has('overdue')) { s.dur *= 2; s.repeat *= 2; } s.repeat = Math.min(1.2, s.repeat); break;
    case 'tape': s.chain += P.pierce + (has('triplicate') ? 3 : 0); s.share = has('bureaucracy') ? 0.7 + (s.share - 0.35) : s.share; break;
    case 'friend': s.range *= 1 + 0.15 * P.pierce; s.count = Math.min(3, s.count + (has('secretclub') ? 1 : 0)); s.delay *= has('longmemory') ? 2 : 1;
      s.copy += (has('sharing') ? 0.35 : 0) + (has('tooreal') ? 0.35 : 0); s.copy *= has('longmemory') ? 1.3 : 1; break;
    case 'twin': s.width *= (1 + 0.15 * P.pierce) * (has('mindmeld') ? 2 : 1); s.count = Math.min(4, s.count + (has('quads') ? 2 : 0)); break;
    case 'bubble': s.hold *= (1 + 0.12 * P.pierce) * (has('extrasoapy') ? 2 : 1); break;
    case 'tooth': s.lure *= (1 + 0.12 * P.pierce) * (has('wisdomteeth') ? 1.6 : 1); if (has('wisdomteeth')) s.dur *= 2; break;
  }
}
// Extra damage taken (from sigDamageMul).
function toyDamageMul(e) {
  let m = 1;
  if (e.inkT > G.t) m *= 1.3;
  if (e.due && e.due.big) m *= 1.3;
  if (e.teeth && e.teethDecay) m *= 1 + 0.12 * Math.min(8, e.teeth);
  return m;
}

// ---------------------------------------------------------------- firing (from fireWeapon)
function toyFire(w, target, src) {
  switch (w.def.kind) {
    case 'crayon': crayonClose(w); break;
    case 'duedate': dueFire(w, target); break;
    case 'tape': tapeFire(w, target); break;
    case 'friend': friendPoke(w); break;
    case 'peek': peekFire(w); break;
    case 'twin': twinFire(w, target); break;
    case 'bubble': bubbleFire(w, target); break;
    case 'tooth': toothFire(w, target); break;
  }
}

// ---------------------------------------------------------------- per frame (from sigTick)
function toyTick(dt) {
  const T = TOYS();
  for (const w of G.weapons) {
    if (!w || !w.def.toy) continue;
    switch (w.def.kind) {
      case 'crayon': crayonTick(w, dt); break;
      case 'friend': friendTick(w, dt); break;
      case 'twin': twinTick(w, dt); break;
    }
  }
  dueTick(dt); tapeTick(dt); peekTick(dt); bubbleTick(dt); toothTick(dt);
  // Colouring In: shapes fading, dots joined by lines (Join the Dots).
  for (const sh of T.shapes) sh.life -= dt;
  compactArr(T.shapes, sh => sh.life > 0);
  if (T.dots.length) {
    compactArr(T.dots, d => d.end > G.t && !d.e.dead);
    const cw = toyOwned('crayon');
    if (cw && T.dots.length > 1 && !(T.dotT > G.t)) {
      T.dotT = G.t + 0.2;
      const src = toySrc(cw, 'Join the Dots', { noCrit: true });
      for (let i = 1; i < T.dots.length; i++) alongLine(T.dots[i - 1].e, T.dots[i].e, 6, e => damageEnemy(e, cw.s.dmg * 0.12, src));
    }
  }
  // Bubble Bath: soapy patches slow whatever swims through.
  for (const q of T.soap) forNear(q.x, q.y, q.r, e => { if (!e.boss) { e.chill = Math.max(e.chill, 0.3); e.chillAmt = Math.max(e.chillAmt, 0.4); } });
  compactArr(T.soap, q => q.end > G.t);
}

// ================================================================ Colouring In
function crayonTick(w, dt) {
  const p = G.player, s = w.s, L = w.line || (w.line = []);
  const last = L[L.length - 1];
  if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 14) {
    L.push({ x: p.x, y: p.y, t: G.t });
    // A loop: the newest stroke crosses an older one. Everything it encloses is coloured in, half as hard again.
    if (L.length > 8 && !(w.loopCd > G.t)) {
      const a = L[L.length - 2], b = L[L.length - 1];
      for (let i = 0; i < L.length - 6; i++) {
        if (!segCross(a, b, L[i], L[i + 1])) continue;
        if (colourIn(w, L.slice(i + 1, L.length - 1), true)) { w.loopCd = G.t + 0.5; L.splice(0, L.length - 1); }
        break;
      }
    }
  }
  while (L.length && G.t - L[0].t > s.dur) L.shift();
  // The line itself nicks what it touches.
  w.lineT = (w.lineT || 0) - dt;
  if (w.lineT <= 0 && L.length > 2) {
    w.lineT = 0.25;
    const scr = hasSig(w, 'scribble'), src = toySrc(w, 'Crayon line', { noCrit: !scr, zoneHit: true });
    for (let i = 1; i < L.length; i += 2) alongLine(L[i - 1], L[i], s.lineW || 9, e => {
      if (e.crayT === G.t) return;
      e.crayT = G.t;
      damageEnemy(e, s.dmg * (scr ? 0.32 : 0.08), src);
      if (scr && !e.boss) { e.chill = Math.max(e.chill, 0.5); e.chillAmt = Math.max(e.chillAmt, 0.4); }
    });
  }
}
// On the weapon's cooldown: close whatever shape the line makes with a straight stroke.
function crayonClose(w) {
  const L = w.line;
  if (L && L.length > 5 && colourIn(w, L.slice(), false)) L.splice(0, L.length - 1);
}
function colourIn(w, poly, loop) {
  if (poly.length < 4) return false;
  const A = polyArea(poly);
  if (A < 2600) return false; // too thin to colour
  const s = w.s, T = TOYS();
  let cx = 0, cy = 0; for (const q of poly) { cx += q.x; cy += q.y; } cx /= poly.length; cy /= poly.length;
  let R = 0; for (const q of poly) R = Math.max(R, Math.hypot(q.x - cx, q.y - cy));
  const inside = [];
  forNear(cx, cy, R, e => { if (toyCan(e) && inPoly(e.x, e.y, poly)) inside.push(e); });
  w.shapeN = (w.shapeN || 0) + 1;
  const framed = hasSig(w, 'masterpiece') && w.shapeN % 5 === 0;
  let k = (loop ? 1.5 : 1) * (framed ? 3 : 1);
  if (hasSig(w, 'paintbynumbers')) k *= 1 + Math.min(1.5, 0.15 * inside.length);
  const src = toySrc(w, loop ? 'Colouring In (loop)' : 'Colouring In');
  IN_AOE = true;
  for (const e of inside) {
    damageEnemy(e, s.dmg * k, src);
    if (hasSig(w, 'stayinlines') && !e.boss) e.inkT = G.t + 1.5;
    if (hasSig(w, 'jointhedots') && !e.dead && T.dots.length < 24 && !T.dots.some(d => d.e === e)) T.dots.push({ e, end: G.t + 2 });
  }
  IN_AOE = false;
  if (framed) { for (const b of G.ebul) if (inPoly(b.x, b.y, poly)) b.dead = true; floatText(cx, cy - 30, 'MASTERPIECE', w.def.color, 18, 1); cam.shake = Math.min(10, cam.shake + 5); }
  if (hasSig(w, 'fridgeart')) G.zones.push({ x: cx, y: cy, r: Math.min(220, Math.sqrt(A / Math.PI)), life: 3, max: 3, dps: s.dmg * 0.35, elem: 'phys', pull: 0, color: w.def.color, tick: 0, src: toySrc(w, 'Fridge Art') });
  if (G.pair.colouringbook) { const vw = owned('venom'); if (vw) { const z = venomZone(vw, cx, cy); z.r = Math.min(220, Math.max(z.r, Math.sqrt(A / Math.PI))); G.zones.push(z); } }
  T.shapes.push({ pts: poly.map(q => ({ x: q.x, y: q.y })), life: framed ? 0.9 : 0.5, max: framed ? 0.9 : 0.5, color: w.def.color, framed });
  if (loop || inside.length >= 3) floatText(cx, cy, loop ? 'LOOP!' : 'COLOURED IN', w.def.color, loop ? 16 : 13, 0.7);
  addLight(cx, cy, R * 1.2, w.def.color, 0.4);
  sfx(inside.length ? 'boom' : 'shot');
  return true;
}

// ================================================================ Due Date
function dueFire(w, target) {
  const s = w.s, p = G.player;
  // Big targets first, and ones without a date already.
  const ts = acquireMany(w.dir, s.range, p.x, p.y, s.count + 3).filter(e => !e.due).slice(0, s.count);
  if (!ts.length && target) ts.push(target);
  for (const e of ts) dueMark(w, e);
  sfx('shot');
}
function dueMark(w, e, free) {
  if (!toyCan(e)) return;
  const s = w.s;
  if (e.due) {
    // Double-booked: the dates merge. The countdown starts again with everything it already owed, and half as much again.
    e.due.stored *= 1.5; e.due.end = G.t + s.dur; e.due.max = s.dur;
    floatText(e.x, e.y - e.r - 14, 'DOUBLE BOOKED', w.def.color, 13, 0.8);
    quirkFound('doublebooked', e.x, e.y);
    return;
  }
  e.due = { w, end: G.t + s.dur, max: s.dur, stored: 0, big: hasSig(w, 'bigday') && (e.elite || e.boss || e.rival) };
  TOYS().marks.push(e);
  if (!free) damageEnemy(e, s.dmg, toySrc(w, 'Due Date'));
  ring(e.x, e.y, e.r + 14, w.def.color, 0.3, 3);
}
function duePop(e) {
  const D = e.due, w = D.w;
  e.due = null;
  if (!w || !w.s) return;
  const s = w.s, dmg = D.stored * s.repeat + s.dmg * 3;
  const src = toySrc(w, 'Due Date', { due: true, noCrit: true });
  floatText(e.x, e.y - e.r - 18, 'DUE!', w.def.color, 18, 0.9);
  G.fx.push({ type: 'flash', x: e.x, y: e.y, r: e.r * 2.5, color: w.def.color, life: 0.25, max: 0.25 });
  ring(e.x, e.y, e.r + 40, w.def.color, 0.45, 5);
  if (!e.dead) damageEnemy(e, dmg, src);
  if (hasSig(w, 'babyshower')) { IN_AOE = true; forNear(e.x, e.y, 130, o => { if (o !== e && toyCan(o)) damageEnemy(o, dmg * 0.5, src); }); IN_AOE = false; }
  if (hasSig(w, 'rebooked')) for (const o of acquireMany('nearest', 260, e.x, e.y, 4).filter(o => o !== e && !o.due).slice(0, 2)) dueMark(w, o, true);
  if (hasSig(w, 'labourday') && !e.dead) dueMark(w, e, true);
  sfx('boom');
}
function dueTick() {
  const M = TOYS().marks;
  for (const e of M) if (e.due && !e.dead && G.t >= e.due.end) duePop(e);
  compactArr(M, e => e.due && !e.dead);
}

// ================================================================ Red Tape
function tapeFire(w, target) {
  const s = w.s, p = G.player;
  const firsts = s.count > 1 ? acquireMany(w.dir, s.range, p.x, p.y, s.count).filter(e => !e.tape) : [target];
  for (const t of firsts) if (t && !t.tape) tapeUp(w, t, s.chain + 1);
  sfx('shot');
}
function tapeUp(w, first, n) {
  const s = w.s, members = [first];
  let cur = first;
  while (members.length < n) {
    let next = null, bd = s.jump * s.jump;
    forNear(cur.x, cur.y, s.jump, (e, d2) => { if (toyCan(e) && !e.tape && !members.includes(e) && d2 < bd) { bd = d2; next = e; } });
    if (!next) break;
    members.push(next); cur = next;
  }
  const B = { w, members, end: G.t + s.dur, max: s.dur };
  let infected = members.find(e => e.parasiteT > 0 && e.parasiteW);
  for (const e of members) {
    e.tape = B;
    // Contagious paperwork: an infection travels along the tape.
    if (infected && !(e.parasiteT > 0)) { e.parasiteW = infected.parasiteW; e.parasiteT = 6; }
  }
  if (infected && members.length > 1) quirkFound('paperworm', first.x, first.y);
  TOYS().tapes.push(B);
  // Only the first one is stamped; the rest of the bundle feels it through the tape.
  damageEnemy(first, s.dmg * 1.5, toySrc(w, 'Red Tape'));
  floatText(first.x, first.y - first.r - 12, 'STAMPED', w.def.color, 12, 0.5);
  return B;
}
function tapeTick(dt) {
  const T = TOYS();
  for (const B of T.tapes) {
    B.members = B.members.filter(e => !e.dead && e.tape === B);
    if (G.t >= B.end || B.members.length < 2) {
      for (const e of B.members) if (e.tape === B) e.tape = null;
      if (G.t >= B.end && hasSig(B.w, 'referral') && B.w.s && B.members.length) {
        const c = B.members[0], nb = acquireMany('nearest', 260, c.x, c.y, 6).filter(e => !e.tape).slice(0, 4);
        if (nb.length > 1) tapeUp(B.w, nb[0], nb.length);
      }
      B.dead = true; continue;
    }
    if (hasSig(B.w, 'stapled')) {
      let cx = 0, cy = 0; for (const e of B.members) { cx += e.x; cy += e.y; } cx /= B.members.length; cy /= B.members.length;
      for (const e of B.members) { if (e.boss) continue; e.x += (cx - e.x) * Math.min(1, dt * 1.5); e.y += (cy - e.y) * Math.min(1, dt * 1.5); e.chill = Math.max(e.chill, 0.3); e.chillAmt = Math.max(e.chillAmt, 0.4); }
    }
  }
  compactArr(T.tapes, B => !B.dead);
}
// Redacted: taped enemies can't shoot (from eBullet).
const tapeGagged = e => !!(e && e.tape && e.tape.w && hasSig(e.tape.w, 'redacted'));

// ================================================================ hit and kill hooks
// From damageEnemy, after the hit lands: lost is the health it actually took.
function toyHurt(e, lost, src) {
  if (lost <= 0) return;
  if (e.due && !src.due) {
    e.due.stored += lost;
    if (hasSig(e.due.w, 'earlyarrival') && !e.boss && e.hp > 0 && e.hp < e.maxHp * 0.3) duePop(e);
  }
  const B = e.tape;
  if (B && !src.taped && B.w.s && B.members.length > 1) {
    let k = B.w.s.share;
    if (src.due && G.pair.finalnotice) k = 1;
    if (src.elem === 'shock' && G.pair.livepaper) k *= 2;
    const ssrc = toySrc(B.w, 'Red Tape', { taped: true, due: src.due, dot: true, noCrit: true, noProc: true });
    for (const o of B.members) if (o !== e && !o.dead) damageEnemy(o, lost * k * (o.boss ? 0.5 : 1), ssrc);
  }
}
function toyKill(e, src) {
  const T = G.toy;
  if (!T) return;
  // A date that never came: everything it owed bursts out.
  if (e.due && e.due.stored > 0 && e.due.w.s) {
    const D = e.due, w = D.w; e.due = null;
    IN_AOE = true;
    forNear(e.x, e.y, 110 + e.r, o => { if (o !== e && toyCan(o)) damageEnemy(o, D.stored * w.s.repeat * 0.6, toySrc(w, 'Due Date (early)', { due: true, noCrit: true })); });
    IN_AOE = false;
    ring(e.x, e.y, 110 + e.r, w.def.color, 0.35, 4);
  }
  e.due = null;
  if (e.tape && hasSig(e.tape.w, 'jointliability') && e.tape.w.s && !src.taped) {
    const B = e.tape, d = Math.min(e.maxHp * 0.3, B.w.s.dmg * 8);
    for (const o of B.members) if (o !== e && !o.dead) damageEnemy(o, d, toySrc(B.w, 'Joint Liability', { taped: true, noCrit: true, noProc: true }));
  }
}

// ================================================================ Imaginary Friend
const NOCOPY = new Set(['friend', 'crayon', 'twin', 'wake']); // per-frame weapons that only make sense on you
function friendPath() {
  const T = TOYS(), p = G.player, P = T.path;
  if (!P.length || G.t - P[P.length - 1].t > 0.05) P.push({ x: p.x, y: p.y, t: G.t });
  while (P.length > 2 && G.t - P[1].t > 9) P.shift();
  return P;
}
function pathAt(P, t) {
  if (!P.length) return G.player;
  let i = P.length - 1;
  while (i > 0 && P[i - 1].t > t) i--;
  const a = P[Math.max(0, i - 1)], b = P[i], k = b.t === a.t ? 0 : clamp((t - a.t) / (b.t - a.t), 0, 1);
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
}
function friendTick(w, dt) {
  const s = w.s, P = friendPath(), real = G.player, F = w.friends || (w.friends = []);
  while (F.length < s.count) F.push({ x: real.x, y: real.y, vx: 0, vy: 0, face: real.face, r: real.r, hp: 1, iframes: 0, weapons: [], sig: '', born: G.t });
  F.length = Math.min(F.length, s.count);
  // Copies of every other weapon you own (rebuilt when your build changes).
  const sig = w.lvl + '|' + s.copy.toFixed(2) + '|' + G.weapons.filter(x => x && x !== w && !NOCOPY.has(x.def.kind)).map(x => x.uid + ':' + x.lvl + ':' + Object.values(x.perks || {}).join(',') + ':' + x.mods.map(m => m.id + m.p).join(',')).join(';');
  F.forEach((f, i) => {
    if (f.sig !== sig) {
      f.sig = sig;
      f.weapons = G.weapons.filter(x => x && x !== w && !NOCOPY.has(x.def.kind)).map(x => {
        const k = makeSlot(x.id, false, x.lvl); k.dir = x.dir; k.echo = true; k.copyK = s.copy; k.friendOf = w;
        k.mods = x.mods.slice(); k.perks = Object.assign({}, x.perks); computeStats(k); k.ammo = k.s.mag; return k;
      });
    }
    const delay = s.delay * (1 + 0.75 * i), pos = pathAt(P, G.t - delay);
    f.vx = (pos.x - f.x) / Math.max(dt, 1e-3); f.vy = (pos.y - f.y) / Math.max(dt, 1e-3);
    if (Math.hypot(f.vx, f.vy) > 10) f.face = Math.atan2(f.vy, f.vx);
    f.x = pos.x; f.y = pos.y; f.r = real.r; f.delay = delay;
    if (G.t - f.born < delay) return; // still catching up
    G.realPlayer = real; G.player = f;
    try { for (const k of f.weapons) updateWeapon(k, dt); } finally { G.player = real; G.realPlayer = null; }
    // It Was Them: the friend soaks up bullets.
    if (hasSig(w, 'blameit')) for (const b of G.ebul) if (!b.dead && Math.abs(b.x - f.x) < 26 && Math.abs(b.y - f.y) < 26) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 2, 60, 0.3); }
    // Too Real: it bowls through enemies.
    if (hasSig(w, 'tooreal') && !(f.bowlT > G.t)) { f.bowlT = G.t + 0.3; forNear(f.x, f.y, 18, e => { if (toyCan(e)) damageEnemy(e, s.dmg, toySrc(w, 'Imaginary Friend', { knock: 120, kx: e.x - f.x, ky: e.y - f.y })); }); }
    // Playdate: swim into your friend for a little heal.
    if (hasSig(w, 'playdate') && !(G.playdateT > G.t) && Math.hypot(real.x - f.x, real.y - f.y) < 40 && G.t - f.born > delay + 1) {
      G.playdateT = G.t + 6; healPlayer(G.P.maxHp * 0.04); floatText(real.x, real.y - 30, 'PLAYDATE', w.def.color, 13, 0.7);
    }
  });
}
// Its own attack: a poke at whatever is near the friend.
function friendPoke(w) {
  const F = w.friends || [];
  for (const f of F) {
    if (G.t - f.born < (f.delay || 2)) continue;
    const t = acquire('nearest', w.s.range, f.x, f.y);
    if (!t) continue;
    damageEnemy(t, w.s.dmg, toySrc(w, 'Imaginary Friend', { knock: 60, kx: t.x - f.x, ky: t.y - f.y }));
    G.fx.push({ type: 'swing', x: f.x, y: f.y, a: Math.atan2(t.y - f.y, t.x - f.x), arc: 1.2, r: Math.min(w.s.range, Math.hypot(t.x - f.x, t.y - f.y) + t.r), color: w.def.color, life: 0.18, max: 0.18 });
  }
}

// ================================================================ Peekaboo
function peekFire(w) {
  const p = G.player, s = w.s;
  // A copy (the Imaginary Friend's) can't make you vanish: it just jumps out from where it is.
  if (w.echo) { peekBoo(w, p.x, p.y, 4, true); return; }
  if (G.peek && G.peek.t > G.t) return;
  G.peek = { x: p.x, y: p.y, t: G.t + s.dur, w, boo: false };
  floatText(p.x, p.y - 30, 'PEEKABOO', w.def.color, 14, 0.6);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; spawnPart(p.x + Math.cos(a) * 16, p.y + Math.sin(a) * 16, w.def.color, 1, 40, 0.4); }
  sfx('shot');
}
// Where enemies think you are.
function peekSpot() {
  const k = G.peek;
  if (k && k.t > G.t) {
    if (G.pair.hidenseek) { const fw = toyOwned('friend'), f = fw && fw.friends && fw.friends[0]; if (f) return f; }
    return k;
  }
  const doll = G.toy && G.toy.doll;
  if (doll && doll.end > G.t) return doll;
  return null;
}
const peekHidden = () => !!(G.peek && G.peek.t > G.t);
function peekTick(dt) {
  const k = G.peek, T = TOYS();
  if (k && !k.boo && G.t >= k.t) {
    k.boo = true;
    const w = k.w, p = G.player;
    if (w.s) {
      peekBoo(w, p.x, p.y, 0, false);
      if (hasSig(w, 'decoydoll')) T.doll = { x: k.x, y: k.y, end: G.t + 4, w };
    }
  }
  if (T.doll && T.doll.end <= G.t && !T.doll.done) { T.doll.done = true; if (T.doll.w.s) peekBoo(T.doll.w, T.doll.x, T.doll.y, 0, true); }
  if (T.doll && T.doll.end < G.t - 1) T.doll = null;
  // Hidden: enemy bullets that miss you find someone else.
  if (k && k.t > G.t && k.w.s) {
    const ff = hasSig(k.w, 'whosthere') ? 3 : 1, src = { wname: 'Friendly fire', noCrit: true, noProc: true, elem: 'phys' };
    for (const b of G.ebul) {
      if (b.dead) continue;
      forNear(b.x, b.y, b.r, e => { if (b.dead || e === b.owner || !toyCan(e) || e.boss) return; b.dead = true; damageEnemy(e, (b.dmg + k.w.s.dmg * 0.1) * ff, src); return true; });
    }
  }
}
function peekBoo(w, x, y, minLook, quiet) {
  const s = w.s, spot = G.peek || { x, y };
  let lookers = 0;
  for (const e of G.enemies) if (!e.dead && !e.charmed && Math.hypot(e.x - spot.x, e.y - spot.y) < 520) lookers++;
  const big = hasSig(w, 'bigboo'), R = big ? 650 : s.area, dmg = s.dmg * (1 + 0.05 * Math.min(20, Math.max(minLook, lookers))) * (big ? 0.6 : 1);
  const src = toySrc(w, 'BOO!', { knock: s.knock || 140 }), hit = new Set(), jump = hasSig(w, 'jumpscare'), fear = hasSig(w, 'bigboo') ? 3 : 1.5;
  const scare = e => {
    if (hit.has(e) || !toyCan(e)) return;
    hit.add(e);
    // Scared stiff: something already frozen solid shatters from the fright.
    if (e.frozen > 0 && small(e)) { e.hp = 0; killEnemy(e, src); fxParts('shard', e.x, e.y, '#bde0fe', 8, 200, 0.5, 4); quirkFound('scaredstiff', e.x, e.y); return; }
    damageEnemy(e, dmg, Object.assign({}, src, { kx: e.x - x, ky: e.y - y }));
    if (e.dead) return;
    if (!small(e)) return;
    if (jump) e.frozen = Math.max(e.frozen, 1.2); else e.fearT = G.t + fear;
  };
  IN_AOE = true;
  forNear(x, y, R, scare);
  if (!quiet && G.peek) forNear(G.peek.x, G.peek.y, R, scare);
  IN_AOE = false;
  floatText(x, y - 36, 'BOO!', w.def.color, 24, 0.9);
  ring(x, y, R, w.def.color, 0.45, 6);
  G.fx.push({ type: 'flash', x, y, r: R * 0.6, color: '#ffffff', life: 0.18, max: 0.18 });
  cam.shake = Math.min(12, cam.shake + 6);
  sfx('boom');
  // A double bluff: two BOOs in quick succession (you and your Imaginary Friend).
  if (G.lastBooT && G.t - G.lastBooT < 3 && G.lastBooW !== w) quirkFound('doublebluff', x, y);
  G.lastBooT = G.t; G.lastBooW = w;
  comboBoo(w, x, y);
}

// ================================================================ Twin Telepathy
function twinPoints(w) {
  const p = G.player, s = w.s, A = w.anchor;
  // One twin is your mirror image; more twins fan out either side of it, so every beam still crosses the crowd.
  const vx = p.x - A.x, vy = p.y - A.y, n = Math.max(1, Math.round(s.count)), pts = [];
  for (let k = 0; k < n; k++) {
    const th = Math.PI + (k - (n - 1) / 2) * 0.45, c = Math.cos(th), sn = Math.sin(th);
    pts.push({ x: A.x + vx * c - vy * sn, y: A.y + vx * sn + vy * c });
  }
  return pts;
}
function twinSegs(w) { const p = G.player; return twinPoints(w).map(t => [p, t]); }
function twinTick(w, dt) {
  const p = G.player, s = w.s;
  if (!w.anchor) w.anchor = { x: p.x + Math.cos(p.face || 0) * 120, y: p.y + Math.sin(p.face || 0) * 120 };
  // The anchor is dragged along so the beam is never longer than the weapon's range.
  const A = w.anchor, d = Math.hypot(p.x - A.x, p.y - A.y), half = s.range / 2;
  if (d > half) { A.x = p.x + (A.x - p.x) * half / d; A.y = p.y + (A.y - p.y) * half / d; }
  w.twins = twinPoints(w);
  w.beamT = (w.beamT || 0) - dt;
  const segs = twinSegs(w);
  if (hasSig(w, 'wavelength')) for (const b of G.ebul) if (!b.dead) for (const [a, c] of segs) if (segD(b.x, b.y, a, c) < s.width + b.r) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 1, 40, 0.2); break; }
  if (w.beamT <= 0) {
    w.beamT = 0.2;
    const hit = new Set(), src = toySrc(w, 'Twin Telepathy'), meld = hasSig(w, 'mindmeld'), cold = G.pair.coldread;
    for (const [a, c] of segs) alongLine(a, c, s.width, e => {
      if (hit.has(e)) return;
      hit.add(e);
      damageEnemy(e, s.dmg * 0.2, src);
      if (meld && !e.boss) { e.chill = Math.max(e.chill, 0.6); e.chillAmt = Math.max(e.chillAmt, 0.35); }
      if (cold && small(e)) { e.beamN = (e.beamT2 > G.t - 0.3 ? e.beamN || 0 : 0) + 1; e.beamT2 = G.t; if (e.beamN >= 5) { e.beamN = 0; e.frozen = Math.max(e.frozen, 1.2); } }
    });
  }
  // Switcheroo: swap places with the twin now and then.
  if (hasSig(w, 'switcheroo') && !(w.swapT > G.t) && w.twins.length) {
    w.swapT = G.t + 6;
    const t = w.twins[0], from = { x: p.x, y: p.y };
    if (Math.hypot(t.x, t.y) < CORE.arena - 60) {
      p.x = t.x; p.y = t.y; p.iframes = Math.max(p.iframes, 0.4);
      alongLine(from, t, 20, e => damageEnemy(e, s.dmg * 2, toySrc(w, 'Switcheroo')));
      bolt(from.x, from.y, t.x, t.y, w.def.color, 0.3);
      floatText(p.x, p.y - 30, 'SWITCHEROO', w.def.color, 13, 0.6);
    }
  }
}
function twinFire(w, target) {
  const s = w.s, p = G.player;
  if (target) w.anchor = { x: target.x, y: target.y };
  w.twins = twinPoints(w);
  const src = toySrc(w, 'Twin pulse');
  IN_AOE = true;
  for (const c of [p].concat(w.twins)) { forNear(c.x, c.y, s.area, e => { if (toyCan(e)) damageEnemy(e, s.dmg * 0.9, src); }); ring(c.x, c.y, s.area, w.def.color, 0.3, 3); }
  if (hasSig(w, 'psychic')) { const hit = new Set(); for (const [a, c] of twinSegs(w)) alongLine(a, c, s.width * 1.5, e => { if (!hit.has(e)) { hit.add(e); damageEnemy(e, s.dmg * 2, toySrc(w, 'Psychic Link')); } }); }
  IN_AOE = false;
  sfx('zap');
}
// From hurtPlayer: Sympathetic Pain.
function toyPlayerHurt() {
  const w = toyOwned('twin');
  if (w && hasSig(w, 'sympathy') && !(G.sympT > G.t) && w.twins && w.twins.length) {
    G.sympT = G.t + 1.5;
    const t = w.twins[0];
    aoe(t.x, t.y, w.s.area * 1.4, w.s.dmg * 3, toySrc(w, 'Sympathetic Pain'), w.def.color);
  }
}

// ================================================================ Bubble Wand
function bubbleFire(w, target) {
  const s = w.s, p = G.player, T = TOYS();
  const a0 = Math.atan2(target.y - p.y, target.x - p.x);
  for (let i = 0; i < s.count; i++) {
    if (T.bubbles.length >= 40) break;
    const a = a0 + (s.count > 1 ? (i / (s.count - 1) - 0.5) * 0.7 : 0) + rand(-0.08, 0.08);
    T.bubbles.push({ x: p.x, y: p.y, vx: Math.cos(a) * s.speed, vy: Math.sin(a) * s.speed, r: s.size, life: 2.6, w, e: null, seed: Math.random() * 10 });
  }
  sfx('shot');
}
function canBubble(w, e) {
  if (!toyCan(e) || !small(e) || e.bubT > G.t || e.thrownT > G.t || e.def.ai === 'phase') return false;
  if (e.elite && !hasSig(w, 'extrasoapy')) return false;
  return e.r <= w.s.hold;
}
// From updateEnemies: a trapped or flung enemy does nothing else this frame.
function toyHold(e, dt) {
  if (e.thrownT > G.t) return true;
  if (e.bubT > G.t) return true;
  if (e.bubT) { e.bubT = 0; e.phased = false; }
  return false;
}
function bubblePop(b, throwA) {
  const e = b.e, w = b.w, s = w.s, T = TOYS();
  b.dead = true;
  fxParts('bubble', b.x, b.y, w.def.color, 8, 90, 0.5, 3);
  if (hasSig(w, 'bubblebath') && T.soap.length < 12) T.soap.push({ x: b.x, y: b.y, r: 60, end: G.t + 3 });
  if (!e) return;
  e.bubT = 0; e.phased = false;
  if (e.dead) return;
  if (throwA == null) { damageEnemy(e, s.dmg, toySrc(w, 'Bubble pop')); return; }
  // Flung: a heavy, living projectile.
  const v = 560;
  e.thrownT = G.t + 0.6; e.thrown = { vx: Math.cos(throwA) * v, vy: Math.sin(throwA) * v, dmg: s.dmg * 2 + Math.min(e.maxHp * 0.2, s.dmg * 6), hit: new Set([e]), w };
  floatText(e.x, e.y - e.r - 10, 'YEET', w.def.color, 13, 0.5);
  sfx('shot');
}
function bubbleTick(dt) {
  const T = TOYS(), p = G.player;
  for (const b of T.bubbles) {
    if (b.dead) continue;
    const w = b.w, s = w.s;
    if (!s || !G.weapons.includes(w) && !w.echo) { if (b.e) { b.e.bubT = 0; b.e.phased = false; } b.dead = true; continue; }
    b.life -= dt;
    const wob = Math.sin(G.realT * 3 + b.seed) * 20;
    if (!b.e) {
      b.x += (b.vx + -b.vy / s.speed * wob) * dt; b.y += (b.vy + b.vx / s.speed * wob) * dt;
      b.vx *= Math.pow(0.6, dt); b.vy *= Math.pow(0.6, dt);
      let caught = null, bump = null;
      forNear(b.x, b.y, b.r, e => { if (!toyCan(e)) return; if (canBubble(w, e)) { caught = e; return true; } bump = bump || e; });
      if (caught) {
        b.e = caught; caught.bubT = G.t + s.dur; caught.phased = true; b.life = s.dur; b.r = caught.r + 12; b.x = caught.x; b.y = caught.y;
        caught.kx = 0; caught.ky = 0;
        if (caught.teeth && caught.teeth > 0) floatText(caught.x, caught.y - caught.r - 10, 'GOT IT', w.def.color, 11, 0.5);
      } else if (bump) { damageEnemy(bump, s.dmg, toySrc(w, 'Bubble Wand')); if (!bump.boss) { bump.chill = Math.max(bump.chill, 1); bump.chillAmt = Math.max(bump.chillAmt, 0.3); } bubblePop(b); continue; }
      if (b.life <= 0) bubblePop(b);
      continue;
    }
    // Holding something: drift towards you (Hamster Ball: roll at the nearest other enemy instead).
    const e = b.e;
    if (e.dead) { b.e = null; bubblePop(b); continue; }
    let tx = p.x, ty = p.y, sp = 55;
    if (hasSig(w, 'hamsterball')) {
      const o = acquire('nearest', 400, b.x, b.y, e);
      if (o) { tx = o.x; ty = o.y; sp = 150; }
      if (!(b.rollT > G.t)) { b.rollT = G.t + 0.4; forNear(b.x, b.y, b.r, o2 => { if (o2 !== e && toyCan(o2)) damageEnemy(o2, s.dmg * 0.7, toySrc(w, 'Hamster Ball', { knock: 160, kx: o2.x - b.x, ky: o2.y - b.y })); }); }
    }
    const dx = tx - b.x, dy = ty - b.y, dd = Math.hypot(dx, dy) || 1;
    b.x += dx / dd * sp * dt + Math.cos(G.realT * 2 + b.seed) * 8 * dt; b.y += dy / dd * sp * dt + Math.sin(G.realT * 2.3 + b.seed) * 8 * dt;
    e.x = b.x; e.y = b.y;
    // Swim into it: pop and fling, the way you were swimming.
    if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + p.r) {
      const sp2 = Math.hypot(p.vx || 0, p.vy || 0), a = sp2 > 30 ? Math.atan2(p.vy, p.vx) : Math.atan2(b.y - p.y, b.x - p.x);
      bubblePop(b, a); continue;
    }
    // Bubble Hockey: the Paddle bats bubbles away.
    if (G.pair.bubblehockey && G.lastSwing && G.lastSwing.t > G.t - 0.05 && Math.hypot(G.lastSwing.x - b.x, G.lastSwing.y - b.y) < G.lastSwing.r + b.r) { bubblePop(b, G.lastSwing.a); continue; }
    if (b.life <= 0) bubblePop(b);
  }
  compactArr(T.bubbles, b => !b.dead);
  // Flung enemies.
  for (const e of G.enemies) {
    if (!e.thrown || e.dead) continue;
    const F = e.thrown;
    if (e.thrownT > G.t) {
      e.x += F.vx * dt; e.y += F.vy * dt;
      forNear(e.x, e.y, e.r + 4, o => {
        if (F.hit.has(o) || !toyCan(o)) return;
        F.hit.add(o);
        damageEnemy(o, F.dmg, toySrc(F.w, 'Flung enemy', { knock: 220, kx: F.vx, ky: F.vy }));
      });
      // Chain Pop: hitting another bubble flings that one too.
      if (hasSig(F.w, 'chainpop')) for (const b of T.bubbles) if (!b.dead && b.e && b.e !== e && Math.hypot(b.x - e.x, b.y - e.y) < b.r + e.r) bubblePop(b, Math.atan2(F.vy, F.vx));
      // A hole in one: a flung enemy that sails over a tooth grabs it on the way.
      for (const t of T.teeth) if (!t.dead && Math.hypot(t.x - e.x, t.y - e.y) < e.r + 10) { toothTaken(t, e); quirkFound('holeinone', e.x, e.y); }
      continue;
    }
    // Landing.
    e.thrown = null;
    damageEnemy(e, F.dmg, toySrc(F.w, 'Flung enemy'));
    if (hasSig(F.w, 'cannonball')) aoe(e.x, e.y, 80 + e.r, F.dmg * 0.8, toySrc(F.w, 'Cannonball'), F.w.def.color);
    if (G.pair.toiltrouble) { const vw = owned('venom'); if (vw) G.zones.push(venomZone(vw, e.x, e.y)); }
  }
}
// From hurtPlayer: Bubble Boy blocks a hit.
function toyBlock() {
  const w = toyOwned('bubble');
  if (!w || !hasSig(w, 'bubbleboy')) return false;
  if (!(G.bubbleBoyT > G.t) && !(G.bubbleBoy > 0)) { G.bubbleBoy = 3; }
  if (G.bubbleBoy > 0) {
    G.bubbleBoy--;
    const p = me();
    fxParts('bubble', p.x, p.y, w.def.color, 6, 80, 0.4, 3);
    p.iframes = Math.max(p.iframes, 0.3);
    if (G.bubbleBoy <= 0) { G.bubbleBoyT = G.t + 8; floatText(p.x, p.y - 30, 'POP', w.def.color, 13, 0.5); }
    return true;
  }
  return false;
}

// ================================================================ Tooth Fairy
function toothFire(w, target) {
  const s = w.s, p = G.player, T = TOYS();
  for (let i = 0; i < s.count; i++) {
    if (T.teeth.length >= 30) break;
    w.toothN = (w.toothN || 0) + 1;
    const gold = hasSig(w, 'goldtooth') && w.toothN % 4 === 0;
    // Dropped just short of the crowd, so they come out to get it.
    const k = 0.85 + rand(-0.1, 0.05), x = p.x + (target.x - p.x) * k + rand(-50, 50), y = p.y + (target.y - p.y) * k + rand(-50, 50);
    T.teeth.push({ x, y, w, gold, end: G.t + s.dur, born: G.t, bite: 0 });
    if (G.pair.baitswitch) { const mw = owned('mines'); if (mw && G.proj.length < CAPS.proj) { const m = mineDrop(mw, x, y); T.teeth[T.teeth.length - 1].mine = m; G.proj.push(m); } }
  }
  sfx('gem');
}
function toothTaken(t, e) {
  t.dead = true;
  const w = t.w;
  if (!w.s) return;
  e.teeth = (e.teeth || 0) + 1;
  if (hasSig(w, 'toothdecay')) e.teethDecay = true;
  const victim = e;
  after(0.3, () => {
    if (victim.dead) return;
    const s = w.s, src = toySrc(w, 'Tooth Fairy'), dmg = s.dmg * Math.min(5, victim.teeth || 1) * (t.gold ? 1.5 : 1);
    G.fx.push({ type: 'fall', x: victim.x, y: victim.y, r: victim.r + 16, color: w.def.color, life: 0.25, max: 0.25 });
    G.fx.push({ type: 'star', x: victim.x, y: victim.y - victim.r - 10, r: 14, color: w.def.color, life: 0.4, max: 0.4 });
    damageEnemy(victim, dmg, src);
    if (t.gold || hasSig(w, 'fairyring')) {
      IN_AOE = true;
      forNear(victim.x, victim.y, t.gold ? 160 : 140, o => { if (o !== victim && toyCan(o)) damageEnemy(o, dmg * (t.gold ? 1 : 0.5), src); });
      IN_AOE = false;
      ring(victim.x, victim.y, t.gold ? 160 : 140, w.def.color, 0.35, 3);
    }
    floatText(victim.x, victim.y - victim.r - 12, 'SMITE x' + Math.min(5, victim.teeth || 1), w.def.color, 13, 0.6);
  });
  if (t.mine && !t.mine.dead) { t.mine.dead = true; detonateMine(t.mine); }
}
function toothTick(dt) {
  const T = TOYS();
  for (const t of T.teeth) {
    if (t.dead) continue;
    const w = t.w;
    if (!w.s) { t.dead = true; continue; }
    if (G.t >= t.end) {
      t.dead = true;
      if (hasSig(w, 'underpillow')) { dropGem(t.x, t.y, 12 + G.level); floatText(t.x, t.y - 16, 'UNDER THE PILLOW', w.def.color, 11, 0.6); }
      continue;
    }
    // Something greedy grabs it.
    let taker = null;
    forNear(t.x, t.y, 10, e => { if (toyCan(e) && !e.rival && !(e.bubT > G.t) && !(e.thrownT > G.t)) { taker = e; return true; } });
    if (taker) { toothTaken(t, taker); continue; }
    // Rivals are greedy too.
    for (const e of G.enemies) if (e.rival && !e.dead && Math.hypot(e.x - t.x, e.y - t.y) < e.r + 12) { toothTaken(t, e); quirkFound('tooththief', e.x, e.y); break; }
    if (t.dead) continue;
    if (hasSig(w, 'underpillow') && G.t - t.born >= 4) { t.end = G.t; continue; }
    if (hasSig(w, 'dentures') && !(t.bite > G.t)) {
      t.bite = G.t + 0.5;
      forNear(t.x, t.y, 40, e => { if (toyCan(e)) damageEnemy(e, w.s.dmg * 0.5, toySrc(w, 'Dentures')); });
    }
  }
  compactArr(T.teeth, t => !t.dead);
}
// The nearest tooth whose lure reaches this enemy.
function toothLure(e) {
  const T = G.toy;
  if (!T || !T.teeth.length) return null;
  let best = null, bd = 1e9;
  for (const t of T.teeth) {
    if (t.dead || !t.w.s) continue;
    const L = t.w.s.lure * (t.gold ? 2 : 1), d = Math.hypot(t.x - e.x, t.y - e.y);
    if (d < L && d < bd) { bd = d; best = t; }
  }
  return best;
}

// ---------------------------------------------------------------- enemy steering (from updateEnemies)
// Returns a direction to swim instead (or null): scared, lured, rooted, or chasing a decoy.
function toySteer(e) {
  if (e.boss || e.rival || e.egg) return null;
  if (e.inkT > G.t) return { x: 0, y: 0 };
  const p = G.player;
  if (e.fearT > G.t) { const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
  const t = toothLure(e);
  if (t) { const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
  const spot = peekSpot();
  if (spot) { const dx = spot.x - e.x, dy = spot.y - e.y, d = Math.hypot(dx, dy) || 1; return d < 20 ? { x: 0, y: 0 } : { x: dx / d, y: dy / d }; }
  return null;
}
// Where an enemy aims its shots (from shootPattern).
function toyAim(e) {
  const spot = peekSpot();
  return spot ? Math.atan2(spot.y - e.y, spot.x - e.x) : null;
}

// ---------------------------------------------------------------- drawing (from render)
function drawToysUnder() {
  const T = G.toy;
  if (!T) return;
  ctx.globalCompositeOperation = 'source-over';
  // Crayon lines: a fat waxy stroke with a darker grain.
  for (const w of G.weapons) {
    if (!w || w.def.kind !== 'crayon' || !w.line || w.line.length < 2) continue;
    const L = w.line, c = col(w.def.color);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [lw, al] of [[(w.s.lineW || 9) * 1.4, 0.25], [(w.s.lineW || 9) * 0.6, 0.75]]) {
      ctx.strokeStyle = c; ctx.lineWidth = lw * S; ctx.globalAlpha = al;
      ctx.beginPath(); ctx.moveTo(sx(L[0].x), sy(L[0].y));
      for (let i = 1; i < L.length; i++) ctx.lineTo(sx(L[i].x) + Math.sin(i * 2.7) * 1.5 * S, sy(L[i].y) + Math.cos(i * 1.9) * 1.5 * S);
      ctx.stroke();
    }
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.globalAlpha = 1;
  }
  // Coloured-in shapes: a hatched fill that fades.
  for (const sh of T.shapes) {
    const k = sh.life / sh.max, c = col(sh.color);
    ctx.globalAlpha = 0.35 * k; ctx.fillStyle = c; ctx.beginPath();
    sh.pts.forEach((q, i) => i ? ctx.lineTo(sx(q.x), sy(q.y)) : ctx.moveTo(sx(q.x), sy(q.y)));
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = k; ctx.strokeStyle = sh.framed ? '#ffffff' : c; ctx.lineWidth = (sh.framed ? 6 : 3) * S; ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Soap patches.
  for (const q of T.soap) { const k = Math.min(1, (q.end - G.t)); ctx.globalAlpha = 0.25 * k; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(sx(q.x + Math.cos(i * 1.7) * q.r * 0.6), sy(q.y + Math.sin(i * 2.3) * q.r * 0.6), (5 + i) * S, 0, TAU); ctx.stroke(); } }
  ctx.globalAlpha = 1;
  // Peekaboo: the empty spot they're all staring at, and the doll.
  const spot = peekSpot();
  if (spot) { ctx.globalAlpha = 0.35 + 0.15 * Math.sin(G.realT * 8); ctx.strokeStyle = '#ffffff'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx(spot.x), sy(spot.y), 18 * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#ffffff'; ctx.font = `900 ${Math.round(16 * S)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('?', sx(spot.x), sy(spot.y) + 6 * S); ctx.globalAlpha = 1; }
  if (T.doll && T.doll.end > G.t) drawShip(sx(T.doll.x), sy(T.doll.y), 0, col(T.doll.w.def.color), 0.55, playerScale());
}
function drawToysOver() {
  const T = G.toy;
  if (!T) return;
  // Imaginary friends: chalky outlines of you, a little behind.
  for (const w of G.weapons) {
    if (!w || w.def.kind !== 'friend' || !w.friends) continue;
    for (const f of w.friends) {
      if (G.t - f.born < 0.3) continue;
      ctx.globalCompositeOperation = 'lighter'; glow(sx(f.x), sy(f.y), 34 * S, w.def.color, 0.25); ctx.globalCompositeOperation = 'source-over';
      drawShip(sx(f.x), sy(f.y), f.face || 0, col(w.def.color), 0.6, playerScale());
      ctx.globalAlpha = 0.5; ctx.strokeStyle = col(w.def.color); ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), 20 * S * playerScale(), 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      drawWeaponFx(f.weapons, f.x, f.y, 0.35);
    }
  }
  // Red Tape: taut strips between bundled enemies.
  for (const B of T.tapes) {
    const k = Math.min(1, (B.end - G.t) / 0.5), c = col(B.w.def.color);
    ctx.globalAlpha = 0.9 * k; ctx.strokeStyle = c; ctx.lineWidth = Math.max(3, 4 * S); ctx.setLineDash([9, 4]);
    ctx.beginPath(); B.members.forEach((e, i) => i ? ctx.lineTo(sx(e.x), sy(e.y)) : ctx.moveTo(sx(e.x), sy(e.y))); ctx.stroke(); ctx.setLineDash([]);
    // A little stamp on each one.
    ctx.fillStyle = c; for (const e of B.members) { const q = Math.max(4, 5 * S); ctx.fillRect(sx(e.x) - q, sy(e.y) - e.r * S - q * 2.6, q * 2, q * 1.4); }
  }
  ctx.globalAlpha = 1;
  ctx.globalAlpha = 1;
  // Teeth: little white molars (gold ones glow).
  for (const t of T.teeth) {
    const x = sx(t.x), y = sy(t.y) + Math.sin(G.realT * 4 + t.born) * 2 * S, r = Math.max(6, 7 * S);
    if (t.gold) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, 26 * S, PAL.reward, 0.5); ctx.globalCompositeOperation = 'source-over'; }
    ctx.fillStyle = t.gold ? col(PAL.reward) : '#f8f9fa'; ctx.strokeStyle = '#212529'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x - r, y - r * 0.6); ctx.quadraticCurveTo(x - r, y - r * 1.2, x - r * 0.3, y - r * 0.9); ctx.quadraticCurveTo(x, y - r * 0.6, x + r * 0.3, y - r * 0.9);
    ctx.quadraticCurveTo(x + r, y - r * 1.2, x + r, y - r * 0.6); ctx.lineTo(x + r * 0.7, y + r); ctx.lineTo(x + r * 0.2, y + r * 0.2); ctx.lineTo(x - r * 0.2, y + r * 0.2); ctx.lineTo(x - r * 0.7, y + r); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (t.w.s) { ctx.globalAlpha = 0.12; ctx.strokeStyle = col(t.w.def.color); ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), t.w.s.lure * (t.gold ? 2 : 1) * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
  }
  ctx.globalCompositeOperation = 'lighter';
  // Twin Telepathy: the beam and the twins.
  for (const w of G.weapons) {
    if (!w || w.def.kind !== 'twin' || !w.twins) continue;
    const c = col(w.def.color), fl = 0.8 + Math.random() * 0.3;
    for (const [a, b] of twinSegs(w)) {
      ctx.strokeStyle = c;
      // A thin, wavy thread of telepathy: a wave travels along it, pinned at both ends.
      const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L, waves = Math.max(2, L / 70);
      for (const [lw, al] of [[Math.max(1.5, w.s.width * 0.3 * fl), 0.15], [Math.max(0.8, w.s.width * 0.07), 1]]) {
        ctx.globalAlpha = al; ctx.lineWidth = lw * Math.min(S, 1.2); ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y));
        const n = 40; for (let i = 1; i <= n; i++) { const k = i / n, wob = Math.sin(k * TAU * waves - G.realT * 14) * Math.sin(k * Math.PI) * 9; ctx.lineTo(sx(lerp(a.x, b.x, k) + nx * wob), sy(lerp(a.y, b.y, k) + ny * wob)); }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    for (const t of w.twins) drawShip(sx(t.x), sy(t.y), (G.player.face || 0) + Math.PI, c, 0.6, playerScale());
    ctx.globalCompositeOperation = 'lighter';
    if (w.anchor) { ctx.globalAlpha = 0.5; ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx(w.anchor.x), sy(w.anchor.y), 6 * S, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  ctx.globalCompositeOperation = 'source-over';
  // Bubbles: a thin iridescent film with a highlight.
  for (const b of T.bubbles) {
    const x = sx(b.x), y = sy(b.y), r = b.r * S * (1 + Math.sin(G.realT * 6 + b.seed) * 0.04);
    ctx.globalAlpha = 0.12; ctx.fillStyle = col(b.w.def.color); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.strokeStyle = col(b.w.def.color); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.92, G.realT + b.seed, G.realT + b.seed + 1.4); ctx.stroke();
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.45, r * 0.18, r * 0.1, -0.7, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Due dates: a little calendar with the countdown running out.
  for (const e of T.marks) {
    if (!e.due || e.dead) continue;
    const D = e.due, k = clamp((D.end - G.t) / D.max, 0, 1), sz = Math.max(7, 9 * S), x = sx(e.x), y = sy(e.y - e.r) - sz * 2, c = col(D.w.def.color);
    ctx.fillStyle = '#f8f9fa'; ctx.fillRect(x - sz, y - sz, sz * 2, sz * 2);
    ctx.fillStyle = c; ctx.fillRect(x - sz, y - sz, sz * 2, sz * 0.6);
    ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + sz * 0.3, sz * 0.55, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
    if (k < 0.25 && Math.floor(G.realT * 10) % 2) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, 20 * S, D.w.def.color, 0.6); ctx.globalCompositeOperation = 'source-over'; }
  }
  // Bubble Boy.
  if (G.bubbleBoy > 0) { const p = G.player; ctx.globalAlpha = 0.6; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 30 * S * playerScale(), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
}

// ---------------------------------------------------------------- weapon panel stats (from the Armoury)
function toyStats(w, T) {
  const s = w.s;
  switch (w.def.kind) {
    case 'crayon': T('Line life', s.dur.toFixed(1) + 's'); break;
    case 'duedate': T('Countdown', s.dur.toFixed(1) + 's'); T('Repeat', Math.round(s.repeat * 100) + '%'); break;
    case 'tape': T('Bundle', (s.chain + 1) + ' enemies'); T('Shared', Math.round(s.share * 100) + '%'); T('Lasts', s.dur.toFixed(1) + 's'); break;
    case 'friend': T('Copies hit', Math.round(s.copy * 100) + '%'); T('Behind you', s.delay.toFixed(1) + 's'); break;
    case 'peek': T('Hidden', s.dur.toFixed(1) + 's'); break;
    case 'twin': T('Beam length', Math.round(s.range)); break;
    case 'bubble': T('Holds up to', 'size ' + Math.round(s.hold)); T('Trapped for', s.dur.toFixed(1) + 's'); break;
    case 'tooth': T('Lure', Math.round(s.lure)); T('Teeth last', s.dur.toFixed(1) + 's'); break;
  }
}

// ---------------------------------------------------------------- secrets (see quirks.js)
Object.assign(QUIRKS, {
  doublebooked: { name: 'Double Booked', desc: 'Two Due Dates landed on the same enemy. The dates merged: the countdown started again, owing half as much more.' },
  paperworm:    { name: 'Contagious Paperwork', desc: 'Red Tape bundled an infected enemy with healthy ones. The infection travelled along the tape to all of them.' },
  scaredstiff:  { name: 'Scared Stiff', desc: 'BOO! hit something that was already frozen solid. It shattered from the fright.' },
  doublebluff:  { name: 'Double Bluff', desc: 'Your Imaginary Friend copied Peekaboo. Two BOOs, back to back, from two places at once.' },
  holeinone:    { name: 'Hole in One', desc: 'A flung enemy sailed over a baby tooth and grabbed it mid-air. The Tooth Fairy noticed.' },
  tooththief:   { name: 'Tooth Thief', desc: 'A rival champion picked up one of your baby teeth. The Tooth Fairy does not check whose tooth it was.' },
});

// ---------------------------------------------------------------- previews (weapon draft and upgrade cards)
// Unit-square scenes, like preview.js: Spermy (me0) and five dummy cells (live).
const pvD = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) / 1.6);
function pvToy(pv, dt, me0, live, fire, tgt) {
  const d = pv.def, M = pv.m;
  switch (d.kind) {
    case 'crayon': {
      pv.trail.push({ x: me0.x, y: me0.y, life: 2.4 });
      for (const t of live) { t.x -= dt * 0.03; if (t.x < 0.08) t.x = 0.9; }
      if (fire) {
        pv.cd = 1.6;
        const poly = pv.trail.filter((q, i) => i % 3 === 0).map(q => ({ x: q.x, y: q.y }));
        if (poly.length > 6) {
          const k = (M.power ? 1.4 : 1) * (M.frame && pv.n % 3 === 0 ? 2 : 1);
          let n = 0;
          for (const t of live) if (inPoly(t.x, t.y, poly)) { pvHit(pv, t, 0.45 * k); n++; if (M.root) t.vy = 0; }
          pv.fx.push({ type: 'shape', pts: poly, life: 0.5 });
          if (n) pvTxt(pv, me0.x, me0.y, n > 1 ? 'COLOURED IN' : 'LOOP!');
          pv.trail = pv.trail.slice(-2);
        }
      }
      break;
    }
    case 'duedate': {
      if (fire && tgt) { pv.seq++; pv.cd = 1.2; if (!(tgt.due > 0)) { tgt.due = M.power ? 2.4 : 1.6; tgt.dueMax = tgt.due; pvHit(pv, tgt, 0.05); } }
      // Something else is chipping at them meanwhile; the date remembers.
      for (const t of live) {
        if (Math.random() < dt * 3) { pvHit(pv, t, 0.02, true); if (t.due > 0) t.owed = (t.owed || 0) + 0.02; }
        if (t.due > 0) { t.due -= dt; if (t.due <= 0) { pv.fx.push({ type: 'boom', x: t.x, y: t.y, r: 0.1, life: 0.35 }); pvTxt(pv, t.x, t.y, 'DUE!'); pvHit(pv, t, 0.35 + (t.owed || 0) * 4); t.owed = 0; if (M.explode) for (const o of pvNear(pv, t, 0.15)) pvHit(pv, o, 0.2, true); if (M.remark && t.hp > 0) { t.due = 1.6; t.dueMax = 1.6; } } }
      }
      break;
    }
    case 'tape': {
      if (fire && tgt) { pv.cd = 2.6; pv.tape = { members: [tgt].concat(pvNear(pv, tgt, 0.5).slice(0, M.bigBundle ? 4 : 2)), life: 2.4 }; }
      if (pv.tape) {
        pv.tape.life -= dt;
        pv.tape.members = pv.tape.members.filter(t => t.hp > 0);
        pv.tapeT = (pv.tapeT || 0) - dt;
        if (pv.tapeT <= 0 && pv.tape.members.length) {
          pv.tapeT = 0.45;
          const hit = pick(pv.tape.members);
          pv.fx.push({ type: 'bolt', a: { x: me0.x, y: me0.y }, b: { x: hit.x, y: hit.y }, life: 0.12 });
          pvHit(pv, hit, 0.12);
          for (const o of pv.tape.members) if (o !== hit) pvHit(pv, o, 0.12 * (M.power ? 0.7 : 0.35), true);
        }
        if (pv.tape.life <= 0) pv.tape = null;
      }
      for (const t of live) { t.x -= dt * 0.02; if (t.x < 0.4) t.x = 0.9; }
      break;
    }
    case 'friend': {
      const t0 = pv.t; pv.t = t0 - 1.1; pv.friend = pvShooter(pv); pv.t = t0;
      const f = pv.friend;
      if (fire && live.length) {
        pv.cd = 0.5;
        // You fire a spitball; your friend fires a fainter copy a moment later, from where you were.
        const a = Math.atan2(tgt.y - me0.y, tgt.x - me0.x);
        pv.shots.push({ x: me0.x, y: me0.y, vx: Math.cos(a) * 1.1, vy: Math.sin(a) * 1.1, style: 'bullet', life: 1, r: 0.01, hit: new Set() });
        const ft = live.reduce((b, o) => pvD(o, f) < pvD(b, f) ? o : b), fa = Math.atan2(ft.y - f.y, ft.x - f.x);
        pv.shots.push({ x: f.x, y: f.y, vx: Math.cos(fa) * 1.1, vy: Math.sin(fa) * 1.1, style: 'bullet', life: 1, r: 0.007, hit: new Set(), faint: true });
      }
      if (M.eatBul) for (const s of pv.shots) if (s.enemy && pvD(s, f) < 0.05) s.dead = true;
      break;
    }
    case 'peek': {
      pv.peekT = (pv.peekT || 0) + dt;
      const cyc = M.rapid ? 2.2 : 3;
      if (pv.peekT > cyc) {
        pv.peekT = 0; pv.hidden = 0;
        const R = M.wide ? 0.5 : 0.32;
        pv.fx.push({ type: 'boom', x: me0.x, y: me0.y, r: R * 0.6, life: 0.4 }); pvTxt(pv, me0.x, me0.y, 'BOO!');
        for (const t of live) if (pvD(t, me0) < R) { pvHit(pv, t, 0.3 + 0.05 * live.length); t.x += 0.12; if (M.freeze) t.frozen = 1.2; }
      } else if (pv.peekT > cyc - 1.4) {
        // Hidden: they all crowd the spot where you were, and bump into each other.
        if (!pv.hidden) { pv.hidden = 1; pv.spot = { x: me0.x + 0.18, y: me0.y }; pvTxt(pv, me0.x, me0.y, 'PEEKABOO'); }
        for (const t of live) { t.x += (pv.spot.x - t.x) * dt * 1.2; t.y += (pv.spot.y - t.y) * dt * 1.2; if (Math.random() < dt * 2) pvHit(pv, t, 0.03, true); }
      } else for (const t of live) { t.x += (0.75 - t.x) * dt * 0.5; }
      break;
    }
    case 'twin': {
      const T0 = live[0] || { x: 0.7, y: 0.5 }, A = { x: me0.x + (T0.x - me0.x) * 0.55, y: me0.y + (T0.y - me0.y) * 0.55 };
      pv.anchor = A;
      const n = 1 + (M.count || 0);
      pv.twins = [];
      for (let k = 0; k < n; k++) { const th = Math.PI + (k - (n - 1) / 2) * 0.45, vx = me0.x - A.x, vy = (me0.y - A.y) / 1.6; pv.twins.push({ x: A.x + vx * Math.cos(th) - vy * Math.sin(th), y: A.y + (vx * Math.sin(th) + vy * Math.cos(th)) * 1.6 }); }
      const segs = pv.twins.map(t => [me0, t]);
      for (const t of live) for (const [a, b] of segs) if (pvSegDist(t.x, t.y / 1.6, a.x, a.y / 1.6, b.x, b.y / 1.6) < t.r + 0.01) { t.hp -= dt * 0.18; t.flash = 0.03; if (M.slow) t.vy *= 0.95; break; }
      if (fire) { pv.cd = 1.2; for (const c of [me0].concat(pv.twins)) { pv.fx.push({ type: 'ring', x: c.x, y: c.y, r: 0.08, life: 0.3 }); for (const t of live) if (pvD(t, c) < 0.1) pvHit(pv, t, 0.15); } }
      for (const t of live) { t.x += Math.sin(pv.t + t.y * 9) * dt * 0.05; }
      break;
    }
    case 'bubble': {
      pv.bubs = pv.bubs || [];
      if (fire && tgt && pv.bubs.length < 4) { pv.cd = 1.1; pv.bubs.push({ x: me0.x, y: me0.y, tx: tgt, k: 0 }); }
      for (const b of pv.bubs) {
        if (!b.held) { b.x += (b.tx.x - b.x) * dt * 2; b.y += (b.tx.y - b.y) * dt * 2; if (pvD(b, b.tx) < 0.04 && b.tx.hp > 0) { b.held = b.tx; b.tx.held = true; } if (b.tx.hp <= 0) b.dead = true; continue; }
        const t = b.held; t.x += (me0.x + 0.05 - t.x) * dt * 0.9; t.y += (me0.y - t.y) * dt * 0.9; b.x = t.x; b.y = t.y;
        if (pvD(t, me0) < 0.08) {
          b.dead = true; t.held = false; pvTxt(pv, t.x, t.y, 'YEET');
          const others = live.filter(o => o !== t); const o = others[0];
          if (o) { pv.fx.push({ type: 'line', a: { x: t.x, y: t.y }, b: { x: o.x, y: o.y }, life: 0.3 }); t.x = o.x - 0.03; t.y = o.y; pvHit(pv, o, 0.45); if (M.explode) pv.fx.push({ type: 'boom', x: o.x, y: o.y, r: 0.1, life: 0.35 }); }
          pvHit(pv, t, 0.45);
        }
      }
      pv.bubs = pv.bubs.filter(b => !b.dead);
      break;
    }
    case 'tooth': {
      pv.teeth = pv.teeth || [];
      if (fire && tgt && pv.teeth.length < 3) { pv.cd = 1.4; pv.n2 = (pv.n2 || 0) + 1; pv.teeth.push({ x: me0.x + (tgt.x - me0.x) * 0.6, y: tgt.y + (Math.random() - 0.5) * 0.2, gold: M.explode && pv.n2 % 3 === 0 }); }
      for (const q of pv.teeth) {
        const R = M.wide ? 0.45 : 0.3;
        for (const t of live) if (pvD(t, q) < R) { t.x += (q.x - t.x) * dt * 1.5; t.y += (q.y - t.y) * dt * 1.5; if (pvD(t, q) < 0.03 && !q.dead) { q.dead = true; t.teeth = (t.teeth || 0) + 1; pv.fx.push({ type: 'bolt', a: { x: t.x, y: 0 }, b: { x: t.x, y: t.y }, life: 0.25 }); pvTxt(pv, t.x, t.y, 'SMITE x' + t.teeth); pvHit(pv, t, 0.25 * t.teeth); if (q.gold) for (const o of pvNear(pv, t, 0.2)) pvHit(pv, o, 0.25, true); } }
      }
      pv.teeth = pv.teeth.filter(q => !q.dead);
      for (const t of live) if (!pv.teeth.length) t.x += (0.75 - t.x) * dt * 0.4;
      break;
    }
  }
}
function pvDrawToy(pv, g, X, Y, U, c, me0) {
  const d = pv.def;
  for (const f of pv.fx) if (f.type === 'shape') { g.globalAlpha = Math.min(1, f.life * 2) * 0.4; g.fillStyle = c; g.beginPath(); f.pts.forEach((q, i) => i ? g.lineTo(X(q.x), Y(q.y)) : g.moveTo(X(q.x), Y(q.y))); g.closePath(); g.fill(); g.globalAlpha = 1; }
  if (d.kind === 'duedate') for (const t of pv.targets) if (t.hp > 0 && t.due > 0) { const x = X(t.x), y = Y(t.y) - U * (t.r + 0.05); g.fillStyle = '#f8f9fa'; g.fillRect(x - 6, y - 6, 12, 12); g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.arc(x, y + 1, 4, -Math.PI / 2, -Math.PI / 2 + TAU * t.due / t.dueMax); g.stroke(); }
  if (d.kind === 'tape' && pv.tape) { g.strokeStyle = c; g.lineWidth = 2.5; g.setLineDash([6, 3]); g.beginPath(); pv.tape.members.forEach((t, i) => i ? g.lineTo(X(t.x), Y(t.y)) : g.moveTo(X(t.x), Y(t.y))); g.stroke(); g.setLineDash([]); }
  if (d.kind === 'friend' && pv.friend) { const f = pv.friend; g.globalAlpha = 0.45; pvGlow(g, X(f.x), Y(f.y), U * 0.06, c, 0.6); g.fillStyle = c; g.beginPath(); g.ellipse(X(f.x), Y(f.y), U * 0.036, U * 0.026, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (d.kind === 'peek' && pv.hidden && pv.spot) { g.fillStyle = '#fff'; g.font = `900 ${Math.round(U * 0.07)}px sans-serif`; g.textAlign = 'center'; g.fillText('?', X(pv.spot.x), Y(pv.spot.y) + U * 0.02); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#05070acc'; g.beginPath(); g.arc(X(me0.x), Y(me0.y), U * 0.05, 0, TAU); g.fill(); g.globalCompositeOperation = 'lighter'; }
  if (d.kind === 'twin' && pv.twins) {
    g.strokeStyle = c; for (const [lw, al] of [[3, 0.25], [1, 1]]) { g.globalAlpha = al; g.lineWidth = lw; g.beginPath(); for (const t of pv.twins) { const x0 = X(me0.x), y0 = Y(me0.y), x1 = X(t.x), y1 = Y(t.y), L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L; g.moveTo(x0, y0); for (let i = 1; i <= 30; i++) { const k = i / 30, wob = Math.sin(k * TAU * 3 - pv.t * 14) * Math.sin(k * Math.PI) * 5; g.lineTo(x0 + (x1 - x0) * k + nx * wob, y0 + (y1 - y0) * k + ny * wob); } } g.stroke(); }
    g.globalAlpha = 0.7; g.fillStyle = c; for (const t of pv.twins) { g.beginPath(); g.ellipse(X(t.x), Y(t.y), U * 0.036, U * 0.026, 0, 0, TAU); g.fill(); } g.globalAlpha = 1;
  }
  if (d.kind === 'bubble' && pv.bubs) for (const b of pv.bubs) { g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.globalAlpha = 0.8; g.beginPath(); g.arc(X(b.x), Y(b.y), U * (b.held ? 0.07 : 0.03), 0, TAU); g.stroke(); g.globalAlpha = 0.15; g.fillStyle = c; g.fill(); g.globalAlpha = 1; }
  if (d.kind === 'tooth' && pv.teeth) for (const q of pv.teeth) { g.globalCompositeOperation = 'source-over'; g.fillStyle = q.gold ? PAL.reward : '#f8f9fa'; g.beginPath(); g.ellipse(X(q.x), Y(q.y), U * 0.014, U * 0.018, 0, 0, TAU); g.fill(); g.globalAlpha = 0.25; g.strokeStyle = c; g.setLineDash([3, 5]); g.beginPath(); g.arc(X(q.x), Y(q.y), U * 0.3, 0, TAU); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; g.globalCompositeOperation = 'lighter'; }
}
