'use strict';
// Spawn Prawn - the Laser's branches (user, 24 Oct; designed one by one with the user). Opens at weapon Lv 3, 6 and 9 like
// every weapon's (branchback.js). Choices live on the slot as usual (w.up) and as flags here (w.xlz).
//  A LASER HAIR REMOVAL: the beam strips Membrane, then Shell layers, off what it holds. 20% less damage.
//     Lv 6: Ingrown (a stripped-bare enemy takes +30% from all your weapons while the beam is on it), Wax Strip (when the
//     beam leaves a stripped enemy it rips: 50% of what the beam dealt it). Wildcard: Patch Test (every 5 s the beam
//     flicks to another enemy and strips a layer).
//  B CAT TOY: the red dot where the beam lands lures small enemies to it. 25% less damage.
//     Lv 6: Dot Trail (the dot leaves a burning trail), Bigger Dot (twice the reach; pulls any non-elite).
//     Wildcard: Two Dots (a second dot past the crowd takes half the chasers).
//  C OVERCLOCKED: the damage ramp climbs three times as high; about 4 s of beam (its own heat, xlz.heat, which cools at a
//     fifth of the speed while off) overheats it: it vents for 1.5 s (no firing) with a burst round you.
//     Lv 6: Heat Sink (1 s vent, burst twice the size), Redline (the last second before overheating: double damage,
//     the beam glows white). Wildcard: Meltdown (overheating leaves a burning patch under the target for the vent).
//  Masteries (Lv 9): Full Body Wax (strips everything the beam passes through), Laser Show (the dot dances round the
//  crowd on its own), Death Ray (fully ramped, the beam is three times as wide and burns through everything in line).
// Hooks: none in shared files. Registers WUP.v_flame_beam (weapons24.js wupReg); uses the wup hooks (stats, dmg, hit,
// tick); wraps laserbeam.js lzRamp, weapons24.js wupDmgMul (Ingrown) and modifiers.js modDraw.
// Loads after laserbeam.js.

const XL = { stripRate: 0.6, lure: 220, small: 18 };
const xlF = w => w.xlz || (w.xlz = {});
const xlOn = (w, k) => !!(w && w.xlz && w.xlz[k]);
const xlP = w => (w && w.up && w.up.p) || null;
function xlInstall(w) {
  const F = xlF(w); if (F.inst) return; F.inst = 1;
  wupOn(w, 'stats', (w, s) => { const p = xlP(w); if (p === 'A') s.dmg *= 0.8; if (p === 'B') s.dmg *= 0.75; });
  wupOn(w, 'dmg', (w, e) => (xlRed(w) ? 2 : 1)); // Redline
  wupOn(w, 'hit', (w, e, res) => { if (res && res.toHp > 0) e.xlDmg = (e.xlDmg || 0) + res.toHp; }); // (Wax Strip reads it)
  wupOn(w, 'tick', xlTick);
}
const XL_HOT = 4; // (Overclocked: seconds of beam to overheat; it cools at a fifth of the speed while off, so reloads don't reset it)
const xlRed = w => xlOn(w, 'red') && (w.xlz.heat || 0) >= XL_HOT - 1 && !(w.xlz.ventEnd > G.t);
const xlPromise = k => w => { xlF(w).p = k; xlInstall(w); };
const xlSet = k => w => { xlF(w)[k] = 1; xlInstall(w); };

// ---------------------------------------------------------------- stripping (Hair Removal)
function xlStrip(e, amt) {
  if (!e || e.dead) return;
  if (e.boss) amt *= 0.5; // (bosses strip at half speed)
  const c = fightCd(e); if (!c) return;
  if (c.memMax > 0 && c.mem > 0) c.mem = Math.max(0, c.mem - c.memMax * amt);
  else if (c.layers > 0) { e.xlS = (e.xlS || 0) + amt; if (e.xlS >= 1) { e.xlS = 0; c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; ring(e.x, e.y, e.r + 8, LASER.col, 0.3, 2); } }
  if ((c.def === 'membrane' || c.def === 'shell') && !(c.mem > 0) && !(c.layers > 0)) e.xlBare = true;
}
const xlSegNear = (s, e) => { const vx = s.x2 - s.x1, vy = s.y2 - s.y1, l2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((e.x - s.x1) * vx + (e.y - s.y1) * vy) / l2)); return Math.hypot(e.x - (s.x1 + vx * t), e.y - (s.y1 + vy * t)) < e.r + 6; };

// ---------------------------------------------------------------- the red dot (Cat Toy)
function xlDots(w) {
  if (!lzOnNow(w)) return [];
  const p = G.player, R = w.s.range || 400;
  let d = null;
  if (xlOn(w, 'show')) { const c = acquire('cluster', R, p.x, p.y) || w.lzTgt; if (c) d = { x: c.x + Math.cos(G.t * 2.5) * 120, y: c.y + Math.sin(G.t * 2.5) * 120 }; } // Laser Show: it dances round the crowd
  else { const s = (w.lzSegs || []).find(q => q.hit); d = s ? { x: s.x2, y: s.y2 } : w.lzTgt && !w.lzTgt.dead ? { x: w.lzTgt.x, y: w.lzTgt.y } : null; }
  if (!d) return [];
  const out = [d];
  if (xlOn(w, 'two')) { const c = acquire('cluster', R, p.x, p.y); if (c) { const dx = c.x - p.x, dy = c.y - p.y, l = Math.hypot(dx, dy) || 1; out.push({ x: c.x + dx / l * 120, y: c.y + dy / l * 120 }); } }
  return out;
}

// ---------------------------------------------------------------- every frame
function xlTick(w, dt) {
  if (!G || G.state !== 'play' || !lzIs(w)) return;
  const F = xlF(w), p = xlP(w), on = lzOnNow(w) && !w.lzOver, cur = on && w.lzE && !w.lzE.dead ? w.lzE : null, s = w.s;
  // Hair Removal: strip what the beam holds (Full Body Wax: everything it passes through)
  if (p === 'A') {
    if (cur) xlStrip(cur, XL.stripRate * dt);
    if (xlOn(w, 'fbw') && on) for (const e of G.enemies) if (!e.dead && !e.charmed && e !== cur && (w.lzSegs || []).some(q => xlSegNear(q, e))) xlStrip(e, XL.stripRate * dt);
    if (F.prev && F.prev !== cur) { // Wax Strip: leaving a stripped enemy rips
      const e = F.prev;
      if (xlOn(w, 'wax') && !e.dead && e.xlBare && e.xlDmg > 0) { damageEnemy(e, e.xlDmg * 0.5, msEcho(weaponSrc(w))); ring(e.x, e.y, e.r + 14, LASER.col, 0.35, 4); }
      e.xlDmg = 0;
    }
    F.prev = cur;
    if (xlOn(w, 'patch') && !(F.patchT > G.t)) { // Patch Test: a flick to another enemy
      F.patchT = G.t + 5;
      let best = null, bd = s.range || 400;
      for (const e of G.enemies) { if (e.dead || e.charmed || e === cur) continue; const c = fightCd(e); if (!(c.mem > 0 || c.layers > 0)) continue; const d = Math.hypot(e.x - G.player.x, e.y - G.player.y); if (d < bd) { bd = d; best = e; } }
      if (best) { xlStrip(best, 1); lzFx(w, G.player.x, G.player.y, best.x, best.y, 1); }
    }
  }
  // Cat Toy: the dot lures; Dot Trail burns where it has been
  if (p === 'B') {
    const dots = xlDots(w), big = xlOn(w, 'big'), R = XL.lure * (big ? 2 : 1);
    F.dots = dots;
    dots.forEach((d, i) => {
      for (const e of G.enemies) {
        if (e.dead || e.charmed || e.boss || e.elite || e.egg || (!big && e.r > XL.small)) continue;
        if (dots.length > 1 && e.id % 2 !== i) continue; // (Two Dots: half the chasers each)
        if (Math.hypot(e.x - d.x, e.y - d.y) < R) mwPull(e, d.x, d.y, 70 * dt);
      }
    });
    if (xlOn(w, 'trail') && dots[0]) {
      const d = dots[0];
      if (F.tx == null || Math.hypot(d.x - F.tx, d.y - F.ty) > 25) { F.tx = d.x; F.ty = d.y;
        if (G.zones.length < 150) G.zones.push({ x: d.x, y: d.y, r: 22, life: 2, max: 2, dps: s.dmg * 0.5 / Math.max(0.05, s.cd || 0.1) * 0.1, elem: w.def.elem, pull: 0, color: LASER.col, tick: 0, src: Object.assign(weaponSrc(w), { zoneHit: true }) }); }
    }
  } else F.dots = null;
  // Overclocked: its own heat; overheating vents (no firing) with a burst round you
  if (p === 'C') {
    const firing = lzOnNow(w) && !(F.ventEnd > G.t);
    F.heat = Math.max(0, Math.min(XL_HOT, (F.heat || 0) + (firing ? dt : -0.2 * dt)));
    if (F.ventEnd > G.t) w.cd = Math.max(w.cd, F.ventEnd - G.t);
    else if (F.heat >= XL_HOT) {
      const sink = xlOn(w, 'sink'), vent = sink ? 1 : 1.5, R = 120 * (sink ? 2 : 1), P = G.player;
      F.ventEnd = G.t + vent; F.vents = (F.vents || 0) + 1; F.heat = 0; w.cd = Math.max(w.cd, vent);
      aoe(P.x, P.y, R, s.dmg * 6, weaponSrc(w), LASER.col);
      const t = w.lzTgt && !w.lzTgt.dead ? w.lzTgt : null;
      if (xlOn(w, 'melt') && t && G.zones.length < 150) G.zones.push({ x: t.x, y: t.y, r: 60, life: vent, max: vent, dps: s.dmg * 1.5 / Math.max(0.05, s.cd || 0.1) * 0.1, elem: w.def.elem, pull: 0, color: LASER.col, tick: 0, src: Object.assign(weaponSrc(w), { zoneHit: true }) }); // Meltdown
    }
  }
  // Death Ray: fully ramped, a beam three times as wide burns through everything in line
  F.ray = !!(xlOn(w, 'ray') && on && w.lzA != null && lzFull(w));
  if (F.ray && !(F.rayT > G.t)) {
    F.rayT = G.t + 0.1;
    const P = G.player, a = w.lzA, L = s.range || 400, wd = (s.width || 10) * 3, dps = s.dmg * (w.lzPow || 1) / Math.max(0.05, s.cd || 0.1);
    for (const e of G.enemies) {
      if (e.dead || e.charmed || e === cur) continue;
      const t = (e.x - P.x) * Math.cos(a) + (e.y - P.y) * Math.sin(a); if (t < 0 || t > L) continue;
      if (Math.hypot(e.x - (P.x + Math.cos(a) * t), e.y - (P.y + Math.sin(a) * t)) < e.r + wd) damageEnemy(e, dps * 0.1, weaponSrc(w));
    }
  }
}

// ---------------------------------------------------------------- Overclocked: the ramp and the vent
lzRamp = (orig => function (w, e) {
  const r = orig(w, e);
  return xlP(w) === 'C' ? LZ.start + (r - LZ.start) * (3 * LZ.peak - LZ.start) / (LZ.peak - LZ.start) : r;
})(lzRamp);

// Ingrown: a stripped-bare enemy takes more from all your weapons while the beam is on it.
wupDmgMul = (orig => function (e, src) {
  const k = orig(e, src);
  if (!G || !e || !e.xlBare) return k;
  return G.weapons.some(l => l && xlOn(l, 'ingrown') && l.lzE === e && lzOnNow(l) && !l.lzOver) ? k * 1.3 : k;
})(wupDmgMul);

// ---------------------------------------------------------------- the branch cards
wupReg(LASER.id, {
  A: { name: 'Laser Hair Removal', tag: 'Strip the tough ones',
    lv3: { desc: 'The beam strips Shell and Membrane off whatever it holds, so tough enemies stop being tough. 20% less damage.', apply: xlPromise('A') },
    lv6: [{ name: 'Ingrown', desc: 'An enemy stripped bare takes 30% more from all your weapons while the beam is on it.', apply: xlSet('ingrown') },
      { name: 'Wax Strip', desc: 'When the beam leaves a stripped enemy, it rips: half of what the beam dealt it, all at once.', apply: xlSet('wax') }],
    wild: { name: 'Patch Test', desc: 'Every 5 s the beam flicks to another enemy for a moment and strips a layer off it.', apply: xlSet('patch') } },
  B: { name: 'Cat Toy', tag: 'Herd them',
    lv3: { desc: 'The red dot at the end of the beam lures small enemies towards it, like a cat after a laser pointer. 25% less damage.', apply: xlPromise('B') },
    lv6: [{ name: 'Dot Trail', desc: 'The red dot leaves a burning trail as it moves, so the chasers run through fire.', apply: xlSet('trail') },
      { name: 'Bigger Dot', desc: 'The lure reaches twice as far and pulls bigger enemies too (not elites).', apply: xlSet('big') }],
    wild: { name: 'Two Dots', desc: 'A second red dot appears past the crowd and takes half the chasers.', apply: xlSet('two') } },
  C: { name: 'Overclocked', tag: 'Run it hot',
    lv3: { desc: 'The damage ramp climbs three times as high. Overheating vents for 1.5 s with a burst round you.', apply: xlPromise('C') },
    lv6: [{ name: 'Heat Sink', desc: 'The vent is shorter (1 s) and its burst is twice as big.', apply: xlSet('sink') },
      { name: 'Redline', desc: 'The last second before overheating deals double damage, and the beam glows white.', apply: xlSet('red') }],
    wild: { name: 'Meltdown', desc: 'Overheating leaves a burning patch under the target for the whole vent.', apply: xlSet('melt') } },
  lv10: [
    { name: 'Full Body Wax', best: 'A', desc: 'The beam strips everything it passes through on the way to its target, not just the target.', apply: xlSet('fbw') },
    { name: 'Laser Show', best: 'B', desc: 'The dot dances round the crowd on its own, dragging the chasers in circles while the beam burns them.', apply: xlSet('show') },
    { name: 'Death Ray', best: 'C', desc: 'Fully ramped, the beam widens to three times and burns through everything in a line.', apply: xlSet('ray') }],
});

// ---------------------------------------------------------------- drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  const P = G.player;
  ctx.save();
  for (const w of G.weapons) {
    if (!w || !w.xlz) continue;
    const F = w.xlz;
    for (const d of F.dots || []) { // the red dot
      const r = (6 + Math.sin(G.realT * 10) * 1.5) * S, g = ctx.createRadialGradient(sx(d.x), sy(d.y), 0, sx(d.x), sy(d.y), r * 3);
      g.addColorStop(0, col('#ff3b30')); g.addColorStop(1, 'rgba(255,59,48,0)');
      ctx.globalAlpha = 0.8; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx(d.x), sy(d.y), r * 3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = col('#ffd0cc'); ctx.beginPath(); ctx.arc(sx(d.x), sy(d.y), r * 0.5, 0, TAU); ctx.fill();
    }
    if (xlRed(w) && lzOnNow(w) && w.lzSegs) { // Redline: the beam glows white
      ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.8; ctx.lineWidth = 3 * S; ctx.lineCap = 'round';
      for (const q of w.lzSegs) { ctx.beginPath(); ctx.moveTo(sx(q.x1), sy(q.y1)); ctx.lineTo(sx(q.x2), sy(q.y2)); ctx.stroke(); }
    }
    if (F.ray && w.lzA != null) { // Death Ray: the wide beam
      const L = w.s.range || 400, x2 = P.x + Math.cos(w.lzA) * L, y2 = P.y + Math.sin(w.lzA) * L;
      ctx.strokeStyle = col(LASER.col); ctx.globalAlpha = 0.28; ctx.lineWidth = (w.s.width || 10) * 6 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx(P.x), sy(P.y)); ctx.lineTo(sx(x2), sy(y2)); ctx.stroke();
    }
  }
  ctx.restore();
})(modDraw);
