'use strict';
// Spawn Prawn - Ordered Online's body: a synthetic nanobot (SAMPLES.md 5, COMBAT_MATRIX.md decision 43). Cosmetic only:
// hitbox, swim physics, kit, passive, Feat and the Mucus trail's rules are unchanged.
//  - Head: a segmented, glossy shell (nose cone, body and rear cap with panel gaps), a seam down its length, a gloss
//    streak, a lens at the nose. The midpiece is a jointed servo coupling with a status light: cyan, amber after a
//    glitch, red when hit, a bright blink when it corrects a corner.
//  - Tail: rigid links with joints. Its wave moves in exact steps (the phase snaps to one of SERVO.steps poses a beat).
//  - Glitch: every few seconds the head twitches for two frames (a servo recalibrating), with a cyan ghost of its outline.
//  - Corners: while turning, the head leads past its heading (the overshoot); once the turn ends it holds a moment,
//    then corrects in one exact step. The head pivots about its neck, so the tail stays attached.
//  - Mucus trail (samples10.js s10Tick drops the zones): drawn over as a glossy synthetic-gel ribbon (a gel band and
//    a specular line). Colour and sheen only.
// Hooks: none in shared files. Replaces samplelooks.js SL_HEAD / SL_TAIL entries for 'ordered' and adds SL_UNDER.ordered
// (the overshoot, the glitch and the stepped tail, run each frame after stepTail and before the tail is drawn);
// wraps feats10.js f10Draw (v10.js v10Draw, world space, over the zones and under you) for the ribbon.
// index.html loads this after gifts10.js (needs the SL tables, slFlush, f10Draw).
(function () {
  if (typeof SL === 'undefined' || !SL.ordered) return;
  const ID = 'ordered';
  const C = { hi: '#f2f6fb', top: '#cdd6e0', mid: '#8d9aab', dk: '#3a4452', gap: '#161b22', joint: '#5a6371', led: '#46f0ff', amber: '#ffb52e' };
  const SERVO = { steps: 4, ampStep: 3, ov: 0.3, lead: 0.07, turn: 1.5, hold: 0.12, gapMin: 2.5, gapMax: 6, twitch: 2 };
  // (tail poses a beat, amplitude steps in world units, most overshoot in radians, overshoot per rad/s of turn,
  // turn rate in rad/s that counts as turning, seconds held before the correction, seconds between glitches, frames)
  SL[ID] = Object.assign({}, SL[ID], { beat: 0.45 }); // (a slower beat: about 11 steps a second, so each one reads)

  // ------------------------------------------------------------ each frame, before the tail is drawn
  SL_UNDER[ID] = (x, y, face, k, a, now, B, body) => {
    const O = B.nb || (B.nb = { t: now, f: face, ov: 0, hold: 0, next: now + 1.5, gl: 0, glT: -9, snapT: -9, gr: 0, gy: 0 });
    const dt = Math.min(0.1, Math.max(0, now - O.t)); O.t = now;
    if (dt > 0) {
      const rate = angDiff(face, O.f) / dt;
      if (Math.abs(rate) > SERVO.turn) { O.ov += (clamp(rate * SERVO.lead, -SERVO.ov, SERVO.ov) - O.ov) * Math.min(1, dt * 14); O.hold = 0; }
      else if (O.ov) { O.hold += dt; if (O.hold >= SERVO.hold) { O.ov = 0; O.snapT = now; } } // (the one exact step)
    }
    O.f = face;
    if (O.gl > 0) O.gl--;
    else if (now >= O.next) {
      O.gl = SERVO.twitch; O.glT = now; O.next = now + SERVO.gapMin + Math.random() * (SERVO.gapMax - SERVO.gapMin);
      O.gr = (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.1); O.gy = (Math.random() - 0.5) * 1.6;
    }
    nbServoTail(body, O);
  };
  // The shared tail (render.js stepTail) waves smoothly; redo its visible wave with the phase and amplitude in steps.
  function nbServoTail(o, O) {
    const t = o.tail, D = o.tailDraw; if (!t || !D || D.length !== t.length) return;
    const n = t.length; let len = 0; for (let i = 1; i < n; i++) len += Math.hypot(t[i].x - t[i - 1].x, t[i].y - t[i - 1].y);
    const speed = o.tailV != null ? o.tailV : Math.hypot(o.vx || 0, o.vy || 0), tk = (o.turnK ?? 1) * (1 + 0.9 * (o.kick || 0));
    const st = TAU / SERVO.steps, si = Math.floor((o.beat || 0) / st) + (O.gl > 0 ? 1 : 0), ph = si * st;
    if (si !== O.si || O.amp == null) { O.si = si; O.amp = Math.round(Math.min(len * 0.15, 38) * (0.75 + 0.25 * Math.min(1, speed / 150)) * tk / SERVO.ampStep) * SERVO.ampStep; } // (the stroke size changes only on a step too)
    const amp = O.amp;
    for (let i = 0; i < n; i++) {
      const p = t[Math.max(0, i - 1)], q = t[Math.min(n - 1, i + 1)], f = i / (n - 1);
      let nx = -(q.y - p.y), ny = q.x - p.x; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
      const w = Math.sin(ph - f * 4.8) * amp * Math.pow(f, 0.6); // (stepTail's wave, frozen between steps)
      D[i].x = t[i].x + nx * w; D[i].y = t[i].y + ny * w;
    }
  }

  // ------------------------------------------------------------ the tail: rigid links
  SL_TAIL[ID] = (t, k, a) => {
    ctx.globalAlpha = a; drawTail(t, C.gap, 3.4 * k, 4.2 * k); drawTail(t, C.mid, 2.3 * k, 3 * k);
    ctx.globalAlpha = a * 0.8; drawTail(t, C.hi, 0.8 * k, 1.1 * k); ctx.globalAlpha = a; // (the sheen down the middle)
    ctx.strokeStyle = C.gap; ctx.lineWidth = 0.6 * k; ctx.beginPath(); // (a joint at every link)
    for (let i = 1; i < t.length - 1; i++) {
      const p = t[i - 1], q = t[i + 1], ang = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2, h = 1.6 * k * (1 - i / t.length * 0.7), mx = sx(t[i].x), my = sy(t[i].y);
      ctx.moveTo(mx + Math.cos(ang) * h, my + Math.sin(ang) * h); ctx.lineTo(mx - Math.cos(ang) * h, my - Math.sin(ang) * h);
    }
    ctx.stroke();
  };

  // ------------------------------------------------------------ the head (local frame: +x forward, units of k)
  const shell = k => {
    ctx.beginPath(); ctx.moveTo(8.2 * k, 0);
    ctx.bezierCurveTo(8 * k, -3.4 * k, 5 * k, -4.8 * k, 1.5 * k, -4.8 * k); ctx.lineTo(-4 * k, -4.8 * k); ctx.quadraticCurveTo(-6 * k, -4.8 * k, -6 * k, -2.8 * k);
    ctx.lineTo(-6 * k, 2.8 * k); ctx.quadraticCurveTo(-6 * k, 4.8 * k, -4 * k, 4.8 * k); ctx.lineTo(1.5 * k, 4.8 * k); ctx.bezierCurveTo(5 * k, 4.8 * k, 8 * k, 3.4 * k, 8.2 * k, 0);
    ctx.closePath();
  };
  const metal = (k, h) => { const g = ctx.createLinearGradient(0, -h * k, 0, h * k); g.addColorStop(0, C.hi); g.addColorStop(0.3, C.top); g.addColorStop(0.68, C.mid); g.addColorStop(1, C.dk); return g; };
  SL_HEAD[ID] = (k, a, now, tag, hit, B) => {
    const O = B.nb || {}, gl = O.gl > 0, rot = (O.ov || 0) + (gl ? O.gr : 0);
    if (rot || gl) { ctx.translate(-12 * k, (gl ? O.gy : 0) * k); ctx.rotate(rot); ctx.translate(12 * k, 0); } // (pivots about the neck)
    // The servo coupling: three short cylinders, the status light on the middle one.
    ctx.fillStyle = C.gap; ctx.fillRect(-12.2 * k, -0.9 * k, 7 * k, 1.8 * k);
    ctx.fillStyle = metal(k, 1.7); ctx.strokeStyle = C.gap; ctx.lineWidth = 0.4 * k;
    for (const [x0, w, h] of [[-12, 1.9, 1.5], [-9.7, 2.3, 1.8], [-7, 1.8, 1.5]]) { ctx.beginPath(); ctx.roundRect(x0 * k, -h * k, w * k, 2 * h * k, 0.5 * k); ctx.fill(); ctx.stroke(); }
    const sinceGl = now - (O.glT ?? -9), lit = hit ? SL_HIT : sinceGl < 0.35 ? C.amber : C.led;
    const on = hit || gl ? !gl : sinceGl < 0.35 ? Math.floor(sinceGl * 20) % 2 === 0 : (now % 1.2) < 1.05; // (a steady blink; it stutters after a glitch)
    const flash = now - (O.snapT ?? -9) < 0.08 ? 1.6 : 1;
    ctx.fillStyle = on ? lit : '#1d3a40'; slEll(-8.55 * k, 0, 0.75 * k, 0.75 * k); ctx.fill();
    if (on) { ctx.globalCompositeOperation = 'lighter'; glow(-8.55 * k, 0, 3.2 * flash * k, lit, a * 0.7); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; }
    // The shell: glossy, three segments, a seam down the middle.
    shell(k); ctx.fillStyle = metal(k, 4.8); ctx.fill();
    ctx.save(); shell(k); ctx.clip();
    ctx.lineWidth = 0.55 * k; ctx.strokeStyle = C.gap; ctx.beginPath();
    for (const gx of [-1.6, 4.2]) { ctx.moveTo(gx * k, -5 * k); ctx.quadraticCurveTo((gx + 0.9) * k, 0, gx * k, 5 * k); }
    ctx.moveTo(8.5 * k, 0); ctx.lineTo(-6.5 * k, 0); ctx.stroke();
    ctx.lineWidth = 0.3 * k; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); // (bevels: the lit edge behind each gap)
    for (const gx of [-1.6, 4.2]) { ctx.moveTo((gx + 0.45) * k, -5 * k); ctx.quadraticCurveTo((gx + 1.35) * k, 0, (gx + 0.45) * k, 5 * k); }
    ctx.moveTo(8 * k, -0.4 * k); ctx.lineTo(-6 * k, -0.4 * k); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = C.gap; ctx.lineWidth = 0.6 * k; shell(k); ctx.stroke();
    ctx.fillStyle = C.hi; ctx.globalAlpha = a * 0.8; slEll(1.8 * k, -3.1 * k, 4.4 * k, 0.75 * k, -0.04); ctx.fill(); // (the gloss)
    ctx.globalAlpha = a; ctx.fillStyle = '#ffffff'; slEll(6 * k, -2.2 * k, 0.55 * k, 0.4 * k, -0.6); ctx.fill();
    ctx.fillStyle = C.joint; for (const ry of [-2.9, 2.9]) { slEll(-4.4 * k, ry * k, 0.4 * k, 0.4 * k); ctx.fill(); } // (rivets)
    ctx.fillStyle = C.gap; slEll(7 * k, 0, 0.75 * k, 0.75 * k); ctx.fill(); // (the lens)
    ctx.fillStyle = on ? lit : C.joint; slEll(7.2 * k, -0.25 * k, 0.25 * k, 0.25 * k); ctx.fill();
    if (gl) { ctx.strokeStyle = C.led; ctx.globalAlpha = a * 0.5; ctx.lineWidth = 0.5 * k; ctx.save(); ctx.translate(-1.2 * k, 0.6 * k); shell(k); ctx.stroke(); ctx.restore(); ctx.globalAlpha = a; } // (the twitch's ghost)
    slFlush(() => shell(k), a, hit);
  };

  // ------------------------------------------------------------ the Mucus trail as synthetic gel
  function nbGel() {
    const Z = G.zones.filter(z => z.s10trail && z.life > 0); if (Z.length < 2) return;
    const runs = [[Z[0]]];
    for (let i = 1; i < Z.length; i++) { const l = runs[runs.length - 1], p = l[l.length - 1]; if (Math.hypot(Z[i].x - p.x, Z[i].y - p.y) < 110) l.push(Z[i]); else runs.push([Z[i]]); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const R of runs) {
      if (R.length < 2) continue;
      const P = R.map(z => [sx(z.x), sy(z.y), z.r * S, clamp(z.life / z.max, 0, 1)]);
      const line = (ox, oy) => { ctx.beginPath(); ctx.moveTo(P[0][0] + ox, P[0][1] + oy); for (let i = 1; i < P.length - 1; i++) ctx.quadraticCurveTo(P[i][0] + ox, P[i][1] + oy, (P[i][0] + P[i + 1][0]) / 2 + ox, (P[i][1] + P[i + 1][1]) / 2 + oy); ctx.lineTo(P[P.length - 1][0] + ox, P[P.length - 1][1] + oy); };
      const r = P[P.length - 1][2], age = P.reduce((s, p) => s + p[3], 0) / P.length;
      ctx.globalAlpha = 0.3 * age; ctx.strokeStyle = R[0].color; ctx.lineWidth = r * 0.9; line(0, 0); ctx.stroke(); // (one gel band, no beads)
      ctx.globalAlpha = 0.5 * age; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.12); line(-r * 0.18, -r * 0.22); ctx.stroke(); // (the sheen, lit from the top left)
      ctx.globalAlpha = 0.85 * age; ctx.lineWidth = Math.max(0.6, r * 0.04); line(-r * 0.18, -r * 0.22); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  }
  if (typeof f10Draw === 'function') {
    const _draw = f10Draw;
    f10Draw = function () { _draw(); if (G && G.s10 && G.s10.id === ID) nbGel(); };
  }
})();
