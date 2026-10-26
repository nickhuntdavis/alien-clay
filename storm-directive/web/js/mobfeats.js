'use strict';
// Spawn Prawn - two mobility Feats (user, 26 Oct 2026; plan in NOTES.md). Card text: Claude-drafted (user, 26 Oct: "write copy for all missing copy").
//  - BRAVE PHASE (Force, Contact): you go see-through for a moment and race forward at 2.6x speed. Nothing can hurt
//    you, you swim straight through bodies, and each enemy you pass through takes one heavy hit. Autorun aims it down
//    the line with the most enemies in it; under manual steering it bends with your thumb (BP.turn radians a second).
//    Walls stop it (campaign levels). Forks: Lv 3 exit burst where it ends, or after-images that hit what touches
//    them; Lv 5 lasts 50% longer, or a shorter cooldown.
//  - PUDDLE JUMPER (Mucus, Burst): your puddles are portals (user, 26 Oct). While you hold it, swimming into one of your
//    puddles (any G.zones pool you made, not The Runs' trail or a Hotbox: pjPools) pops you out of your most distant
//    puddle (PJ.gap seconds between portal jumps, no stamina). A tap jumps you to the most distant puddle at once. With no
//    puddle to go to, the tap works as before: carrying a close-range weapon (Melee modifier, or a Contact weapon)
//    it lands you behind the biggest enemy within reach and backstabs it (150% damage); otherwise it lands you in the
//    safest spot within reach (THIS WAY's scoring: fewest enemies and bullets). Never into a wall, never across one
//    (the path is sampled), and every jump leaves with a Mucus splash (40%, radius 80) and a puddle where you were. Forks: Lv 3 two jumps per cooldown, or a
//    splash on landing that Snares; Lv 5 50% further, or a shorter cooldown.
// Hooks: none in shared files. hookOn('tick', 'mobTick'); wraps newfeats.js nfSpeed (Brave Phase speed) and
// feats10.js f10Draw. index.html loads this after gifts10.js.
(function () {
  if (typeof feat !== 'function') return;
  const BP = { speed: 2.6, turn: 6, line: 360 };
  const M = () => { const D = f10(); return D.mob || (D.mob = { trail: [], ghosts: [] }); };
  const wall = (x, y) => !!(G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y));
  const clearPath = (ax, ay, bx, by) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 20); for (let i = 1; i <= n; i++) if (wall(ax + (bx - ax) * i / n, ay + (by - ay) * i / n)) return false; return true; };
  const segD = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1); return Math.hypot(px - (ax + dx * t), py - (ay + dy * t)); };
  const closeRange = () => (G.weapons || []).some(w => w && w.def && ((typeof mwR === 'function' && mwR(w, 'melee')) || (typeof wAtk === 'function' ? wAtk(w) : w.def.atk) === 'contact'));

  // ================================================================ Brave Phase
  feat({ id: 'brave_phase', name: 'Brave Phase', icon: 'BP', ico: 'peek', type: 'force', atk: 'contact', start: 1, rar: 1, stam: 20,
    does: 'You go see-through and surge forward. Nothing can hurt you, and every enemy you pass through takes a heavy hit.',
    base: { dmg: 34, cd: 9, dur: 0.6 },
    stat: (w, s) => { if (f10Fk(w, 'long')) s.dur *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
    when: w => {
      const p = me(); let best = null;
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU, ex = p.x + Math.cos(a) * BP.line, ey = p.y + Math.sin(a) * BP.line;
        const n = G.enemies.filter(e => f10Live(e) && segD(e.x, e.y, p.x, p.y, ex, ey) < e.r + 24).length;
        if (n && (!best || n > best.n)) best = { a, n };
      }
      return best && (best.n >= 3 || f10Near(p.x, p.y, 110).length >= 3) ? { a: best.a } : null;
    },
    fire: (w, c) => {
      const p = me(), m = M();
      m.bp = { w, a: c.a != null ? c.a : (p.hd || p.face || 0), end: G.t + w.s.dur, hit: new Set() };
      p.iframes = Math.max(p.iframes || 0, w.s.dur + 0.1);
      ring(p.x, p.y, p.r + 12, w.def.color, 0.25, 3);
    },
    forks: { 3: [fk('exit', 'Exit Wound', 'Where the surge ends, a burst damages and shoves everything nearby.'), fk('ghosts', 'After-Images', 'You leave after-images behind. Anything that touches one takes a hit.')],
      5: [fk('long', 'Extended Release', 'The surge lasts 50% longer.'), fk('quick', 'Quick Recovery', 'Cooldown 30% shorter.')] } });

  function bpTick(m, p, dt) {
    const B = m.bp, w = B.w, s = w.s;
    if (G.t >= B.end) {
      m.bp = null; p.vx = Math.cos(B.a) * 240; p.vy = Math.sin(B.a) * 240; // (you come out of it still swimming)
      if (f10Fk(w, 'exit')) { f10Burst(w, p.x, p.y, 90, s.dmg * 0.6, null); for (const e of f10Near(p.x, p.y, 90)) f10Shove(e, p.x, p.y, 260); }
      return;
    }
    p.iframes = Math.max(p.iframes || 0, 0.1);
    if (G.manual && Math.hypot(G.manual.x, G.manual.y) > 0.3) { const da = angDiff(Math.atan2(G.manual.y, G.manual.x), B.a), t = BP.turn * dt; B.a += clamp(da, -t, t); }
    const v = 165 * (G.P.speed || 1) * BP.speed, nx = p.x + Math.cos(B.a) * v * dt, ny = p.y + Math.sin(B.a) * v * dt;
    if (wall(nx, ny)) { B.end = G.t; return; }
    p.x = nx; p.y = ny; p.hd = B.a; p.vx = p.vy = 0;
    forNear(p.x, p.y, p.r + 60, e => {
      if (!f10Live(e) || B.hit.has(e) || Math.hypot(e.x - p.x, e.y - p.y) > e.r + p.r + 6) return;
      B.hit.add(e); f10Hit(w, e, s.dmg, 'contact', { kx: Math.cos(B.a), ky: Math.sin(B.a) });
    });
    m.trail.push({ x: p.x, y: p.y, a: B.a, t: G.t });
    if (f10Fk(w, 'ghosts') && (!m.lastGhost || G.t - m.lastGhost > 0.08)) { m.lastGhost = G.t; m.ghosts.push({ x: p.x, y: p.y, end: G.t + 1, w, hit: new Set() }); }
  }

  // ================================================================ Puddle Jumper
  const PJ = { gap: 2.5, minR: 20, minLife: 0.6, inside: 0.8 };
  const pjPools = () => G.zones.filter(z => z.life > PJ.minLife && z.r >= PJ.minR && z.max >= 1 && !z.trail && !z.follow && !wall(z.x, z.y));
  const pjIn = (z, p) => Math.hypot(z.x - p.x, z.y - p.y) < z.r * PJ.inside;
  const pjFar = (p, skip) => { let best = null, bd = 0; for (const z of pjPools()) { if (skip.includes(z) || pjIn(z, p)) continue; const d = Math.hypot(z.x - p.x, z.y - p.y); if (d > bd) { bd = d; best = z; } } return best; };
  const pjSlot = () => (G.spells || []).find(x => x && x.def && x.def.f10 && x.def.f10.id === 'puddle_jumper');
  // Leave with a splash and a puddle where you were (itself a way back), come up at to.
  function pjGo(w, p, to) {
    const s = w.s, ox = p.x, oy = p.y;
    f10Burst(w, ox, oy, s.area, s.dmg * 0.4, null); // (the splash as you leave splatters whatever crowded you)
    f10Patch(w, ox, oy, 46, 3, 'mucus', 0.4);
    f10Mark(ox, oy, 30, 0.4, w.def.color);
    p.x = to.x; p.y = to.y; p.vx = p.vy = 0; p.iframes = Math.max(p.iframes || 0, 0.25);
    f10Mark(p.x, p.y, 30, 0.4, w.def.color); ring(p.x, p.y, p.r + 14, w.def.color, 0.3, 3);
    if (to.e && !to.e.dead) { p.hd = p.face = Math.atan2(to.e.y - p.y, to.e.x - p.x); f10Hit(w, to.e, s.dmg * 1.5, 'contact'); } // (the backstab)
    if (f10Fk(w, 'splash')) { const l = f10Near(p.x, p.y, s.area); f10Many(w, l, s.dmg * 0.4, 'burst'); for (const e of l) if (!e.boss) e.frozen = Math.max(e.frozen || 0, 1); }
  }
  // Swimming into a puddle you were not already in: out of the most distant one.
  function pjPortal(m, p) {
    const w = pjSlot(); if (!w || !w.s) { m.pjWas = null; return; }
    const now = pjPools().filter(z => pjIn(z, p)), was = m.pjWas || [];
    m.pjWas = now;
    if (G.t < (m.pjT || 0) || !now.some(z => !was.includes(z))) return;
    const to = pjFar(p, now); if (!to) return;
    pjGo(w, p, { x: to.x, y: to.y });
    m.pjT = G.t + PJ.gap; m.pjWas = pjPools().filter(z => pjIn(z, p)); // (standing in the one you came out of is not entering it)
  }
  feat({ id: 'puddle_jumper', name: 'Puddle Jumper', icon: 'PJ', ico: 'bubble', type: 'mucus', atk: 'burst', start: 1, rar: 1, stam: 14,
    does: 'Your puddles are connected. Nobody asked how. Swim into one and you come out of your furthest; tap to go at once. You leave a Mucus splash and a fresh puddle behind.', // (Claude-drafted at the user's request, 26 Oct)
    base: { dmg: 30, cd: 8, range: 300, area: 80 },
    stat: (w, s) => { if (f10Fk(w, 'far')) s.range *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
    when: w => {
      const p = me(), R = w.s.range;
      if (closeRange()) {
        let best = null; for (const e of f10Near(p.x, p.y, R)) if (!e.boss && (!best || e.maxHp > best.maxHp)) best = e;
        if (best && Math.hypot(best.x - p.x, best.y - p.y) > best.r + p.r + 40) return { e: best };
      }
      let bul = 0; for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < 120) bul++;
      return f10Near(p.x, p.y, 140).length >= 4 || bul >= 5 ? { away: 1 } : null;
    },
    fire: (w, c) => {
      const p = me(), s = w.s; let to = null;
      const far = pjFar(p, []); if (far) to = { x: far.x, y: far.y }; // (your most distant puddle first)
      if (!to && c.e && !c.e.dead) { // behind it, as seen from you
        const e = c.e, d = Math.hypot(e.x - p.x, e.y - p.y) || 1, x = e.x + (e.x - p.x) / d * (e.r + p.r + 14), y = e.y + (e.y - p.y) / d * (e.r + p.r + 14);
        if (!wall(x, y) && clearPath(p.x, p.y, x, y)) to = { x, y, e };
      }
      if (!to) { // the safest spot in reach
        let bv = 1e9;
        for (let i = 0; i < 16; i++) for (const r of [s.range * 0.6, s.range]) {
          const a = i / 16 * TAU, x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r; if (wall(x, y) || !clearPath(p.x, p.y, x, y)) continue;
          let v = f10Near(x, y, 160).length; for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - x, b.y - y) < 120) v += 0.5;
          if (v < bv) { bv = v; to = { x, y }; }
        }
      }
      if (!to) return;
      pjGo(w, p, to); const m = M(); m.pjT = G.t + PJ.gap; m.pjWas = pjPools().filter(z => pjIn(z, p));
      if (f10Fk(w, 'double')) { w.pjAlt = !w.pjAlt; if (w.pjAlt) after(0, () => { if (G && w.cd > 1.2) w.cd = 1.2; }); }
    },
    forks: { 3: [fk('double', 'Double Dip', 'Two jumps per cooldown.'), fk('splash', 'Belly Flop', 'Landing splashes Mucus around you and Snares what it hits.')],
      5: [fk('far', 'Long Jump', 'Jumps reach 50% further.'), fk('quick', 'Quick Turnaround', 'Cooldown 30% shorter.')] } });

  // ================================================================ hooks
  function mobTick(dt) {
    if (!G || G.state !== 'play' || (!G.f10 && !pjSlot())) return;
    const m = M(), p = me();
    pjPortal(m, p);
    if (m.bp) bpTick(m, p, dt);
    m.trail = m.trail.filter(t => G.t - t.t < 0.35);
    for (const g of m.ghosts) forNear(g.x, g.y, 60, e => { if (f10Live(e) && !g.hit.has(e) && Math.hypot(e.x - g.x, e.y - g.y) < e.r + 14) { g.hit.add(e); f10Hit(g.w, e, g.w.s.dmg * 0.4, 'contact'); } });
    m.ghosts = m.ghosts.filter(g => g.end > G.t);
  }
  window.mobTick = mobTick; // (hook names are globals: hookstest)
  hookOn('tick', 'mobTick', dt => mobTick(dt));
  const _speed = nfSpeed;
  nfSpeed = function () { const k = _speed(); return G && G.f10 && G.f10.mob && G.f10.mob.bp ? 0 : k; }; // (Brave Phase moves you itself)
  const _draw = f10Draw;
  f10Draw = function () {
    _draw();
    const m = G && G.f10 && G.f10.mob; if (!m) return;
    const pj = pjSlot();
    if (pj) { // (your puddles are portals: a faint dashed ring on each, brighter while the next jump is ready)
      ctx.save(); ctx.strokeStyle = col(pj.def.color); ctx.lineWidth = 1.5; ctx.setLineDash([4 * S, 6 * S]); ctx.globalAlpha = G.t < (m.pjT || 0) ? 0.15 : 0.4;
      let n = 0; for (const z of pjPools()) { if (n++ > 40) break; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * PJ.inside * S, 0, TAU); ctx.stroke(); }
      ctx.restore();
    }
    ctx.save(); ctx.fillStyle = col(F10_COL.force);
    for (const t of m.trail) { ctx.globalAlpha = 0.35 * (1 - (G.t - t.t) / 0.35); ctx.beginPath(); ctx.ellipse(sx(t.x), sy(t.y), 14 * S, 7 * S, t.a, 0, TAU); ctx.fill(); }
    for (const g of m.ghosts) { ctx.globalAlpha = 0.25 * (g.end - G.t); ctx.beginPath(); ctx.arc(sx(g.x), sy(g.y), 10 * S, 0, TAU); ctx.fill(); }
    ctx.restore();
  };
})();
