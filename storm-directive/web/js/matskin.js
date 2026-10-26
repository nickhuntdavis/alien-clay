'use strict';
// Spawn Prawn - the material skin Feat (user, 26 Oct: "stone skin or iron skin ... you become really tough but you lose a
// lot of traction ... you tumble in a direction ... bowling"). Name and card text in MS_TEXT (Claude-drafted at the user's request, 26 Oct).
//  - PERFORMED (Force, Contact, stamina): for MS.dur seconds you turn to a hard material. You take MS.cut less damage, and
//    you lose your grip: you swim on momentum (MS.velocity builds at MS.accel towards where you point, bleeds slowly,
//    tops out at MS.top of your speed). Enemies you roll into are bowled over: Force damage scaled by your speed and a
//    shove along your path (once per MS.gap per enemy). Bosses aren't shoved.
//  - LEVEL 4 (the user's "pull"): enemies ahead of you, within MS.pullR and MS.pullCone, are dragged into your path.
//  - LEVEL 3 FORK: Chitin (harder: MS.cutHard less damage) or Calcified (heavier: bowling damage and shove x MS.heavy).
//  - LEVEL 5 FORK: Enamel (enemy shots that reach you bounce back at the nearest enemy) or Latex (you bounce off bosses,
//    elites and the edge of the arena instead of stopping, keeping your speed).
//  - Autorun performs it when MS.crowd enemies are within 160, or below half health with enemies close.
// Hooks: none in shared files. hookOn tick 'msTick2' and hurtMul 'msHurtMul'; wraps newfeats.js nfSpeed and feats10.js
// f10Draw. Loads after mobfeats.js.
const MS = { dur: 4, cut: 0.6, cutHard: 0.8, accel: 260, bleed: 0.25, top: 1.7, minHit: 110, gap: 0.4, shove: 260, heavy: 2, pullR: 220, pullCone: 1.05, pull: 140, crowd: 5 };
const MS_TEXT = { name: 'Petrified', desc: 'You turn to stone for a few seconds. Hits barely register. Neither does steering. Whatever is in the way gets bowled over.',
  f3a: 'Chitin', f3aD: 'The same stuff as a prawn\'s shell. You take even less damage.', f3b: 'Kidney Stone', f3bD: 'Twice as heavy. Hits twice as hard. Passing it is not your problem.',
  f5a: 'Enamel', f5aD: 'The hardest thing the body makes. Shots bounce off and go back.', f5b: 'Latex', f5bD: 'You bounce off big enemies and the edge. Tested for durability.' };
(function () {
  if (typeof feat !== 'function') return;
  const M = () => { const D = f10(); return D.skin || null; };
  const live = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
  feat({ id: 'material_skin', name: MS_TEXT.name, icon: 'MS', ico: 'shield', type: 'force', atk: 'contact', start: 1, rar: 1, stam: 22,
    does: MS_TEXT.desc,
    base: { dmg: 30, cd: 14, dur: MS.dur },
    when: w => { const p = me(), n = f10Near(p.x, p.y, 160).length; return n >= MS.crowd || (n && p.hp < G.P.maxHp * 0.5) ? {} : null; },
    fire: w => { const p = me(); f10().skin = { w, end: G.t + w.s.dur, vx: p.vx || 0, vy: p.vy || 0, spin: 0, hit: new Map() }; ring(p.x, p.y, p.r + 14, '#b8b2a6', 0.3, 4); },
    forks: { 3: [fk('chitin', MS_TEXT.f3a, MS_TEXT.f3aD), fk('calcified', MS_TEXT.f3b, MS_TEXT.f3bD)],
      5: [fk('enamel', MS_TEXT.f5a, MS_TEXT.f5aD), fk('latex', MS_TEXT.f5b, MS_TEXT.f5bD)] } });

  function skinTick(dt) {
    const K = M(); if (!K || !G || G.state !== 'play') return;
    const p = me(), w = K.w;
    if (G.t >= K.end || !G.spells.includes(w)) { f10().skin = null; return; }
    const top = 165 * (G.P.speed || 1) * MS.top, a = p.hd != null ? p.hd : p.face || 0;
    K.vx += Math.cos(a) * MS.accel * dt; K.vy += Math.sin(a) * MS.accel * dt;
    K.vx *= 1 - MS.bleed * dt; K.vy *= 1 - MS.bleed * dt;
    let v = Math.hypot(K.vx, K.vy); if (v > top) { K.vx *= top / v; K.vy *= top / v; v = top; }
    // Latex: the arena's edge bounces you back in
    if (f10Fk(w, 'latex') && G.core) { const dx = p.x - G.core.x, dy = p.y - G.core.y, d = Math.hypot(dx, dy) || 1; if (d > CORE.arena - p.r - 2 && (K.vx * dx + K.vy * dy) > 0) { const nx = dx / d, ny = dy / d, dot = K.vx * nx + K.vy * ny; K.vx -= 2 * dot * nx; K.vy -= 2 * dot * ny; ring(p.x, p.y, p.r + 10, '#ffb3d1', 0.2, 3); } }
    p.vx = K.vx; p.vy = K.vy; K.spin += v * dt * 0.05;
    // Bowling
    const heavy = f10Fk(w, 'calcified') ? MS.heavy : 1, ux = K.vx / (v || 1), uy = K.vy / (v || 1);
    forNear(p.x, p.y, p.r + 60, e => {
      if (!live(e) || Math.hypot(e.x - p.x, e.y - p.y) > e.r + p.r + 4) return;
      if (f10Fk(w, 'latex') && (e.boss || e.elite)) { const nx = (p.x - e.x), ny = (p.y - e.y), d = Math.hypot(nx, ny) || 1, dot = (K.vx * nx + K.vy * ny) / d; if (dot < 0) { K.vx -= 2 * dot * nx / d; K.vy -= 2 * dot * ny / d; } }
      if (v < MS.minHit || K.hit.get(e) > G.t) return;
      K.hit.set(e, G.t + MS.gap);
      f10Hit(w, e, w.s.dmg * (v / top) * heavy, 'contact', { kx: ux, ky: uy });
      if (!e.boss && !e.dead) shove(e, e.x - ux * 10, e.y - uy * 10, MS.shove * heavy * (v / top));
    });
    // Level 4: enemies ahead are dragged into your path
    if (w.lvl >= 4 && v > 40) forNear(p.x, p.y, MS.pullR, e => {
      if (!live(e) || e.boss) return;
      const dx = e.x - p.x, dy = e.y - p.y, along = dx * ux + dy * uy; if (along <= 0) return;
      if (Math.abs(Math.atan2(-dx * uy + dy * ux, along)) > MS.pullCone) return;
      const tx = p.x + ux * along, ty = p.y + uy * along, d = Math.hypot(tx - e.x, ty - e.y); if (d < 4) return;
      const f = Math.min(d, MS.pull * dt); e.x += (tx - e.x) / d * f; e.y += (ty - e.y) / d * f;
    });
    // Enamel: shots bounce off you at the nearest enemy
    if (f10Fk(w, 'enamel')) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < p.r + 8) { b.dead = true; const t = acquire('nearest', 400, p.x, p.y); if (t) { bolt(p.x, p.y, t.x, t.y, '#f4f1e8', 0.12); f10Hit(w, t, Math.max(8, (b.dmg || 8) * 2), 'proj'); } }
  }
  window.msTick2 = skinTick; window.msHurtMul = () => { const K = G && G.f10 && G.f10.skin; return K ? 1 - (f10Fk(K.w, 'chitin') ? MS.cutHard : MS.cut) : 1; }; // (hook names are globals: hookstest)
  hookOn('tick', 'msTick2', dt => msTick2(dt));
  hookOn('hurtMul', 'msHurtMul', () => msHurtMul());
  const _speed = nfSpeed;
  nfSpeed = function () { const k = _speed(); return G && G.f10 && G.f10.skin ? Math.min(k, 0.05) : k; }; // (no swimming strokes: you roll on momentum)
  const _draw = f10Draw;
  f10Draw = function () {
    _draw();
    const K = G && G.f10 && G.f10.skin; if (!K) return;
    const p = me(), x = sx(p.x), y = sy(p.y), R = (p.r + 15) * S, left = Math.max(0, K.end - G.t), fade = Math.min(1, left / 0.4);
    ctx.save(); ctx.globalAlpha = 0.82 * fade; ctx.fillStyle = col(f10Fk(K.w, 'latex') ? '#ff8fbf' : f10Fk(K.w, 'enamel') ? '#f4f1e8' : '#8a8378');
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = col('#d8d2c4'); ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const a = K.spin + i * 2.1; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R * 0.2, y + Math.sin(a) * R * 0.2); ctx.lineTo(x + Math.cos(a + 0.4) * R * 0.85, y + Math.sin(a + 0.4) * R * 0.85); ctx.stroke(); }
    ctx.strokeStyle = col('#3b3731'); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
    ctx.restore();
  };
})();
