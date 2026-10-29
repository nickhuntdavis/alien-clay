'use strict';
// Spawn Prawn - the Baseline hero costumes, big enough to see (user, 29 Oct: "the visuals for the baseline hero branches aren't
// really visible at all"). One drawer, `blDrawLook`, draws any of the nine branch costumes on a canvas context; it is used twice:
//  - IN THE RUN: a drawPlates wrap draws it at about twice the head's size over your body, for the hero weapon you fired last
//    (so a Rambo Standard Issue and a Samurai Hand-to-gland swap costumes as you switch). The older small costumes in
//    baseline1.js / baseline2.js / baseline3.js stay underneath (state pieces: the mark crosshair, the husk, the skeleton).
//  - ON THE BRANCH SCREEN: the stage previews (sidemo.js SIV, fbdemo.js MGV and NWV) now know the costume flags
//    ('rambo' ... 'biting') and draw the same costume on the preview sperm through their `me` hook.
// Every piece has a pale halo under a dark outline, so the shape reads in Lab view (no colour) as well as Arcade view.
// Units: u = the head's half-length. The frame is rotated to the sperm's heading, +x forward. act (0 to 1) is a pulse that
// follows firing; speed (0 to 1) follows swim speed.
// Hooks: wraps drawPlates (bodymods.js); edits SIV_FLAG, MGV_FLAG, NWV_FLAG (sidemo.js, fbdemo.js) in place; wraps the `me` of
// PV_OWN for v_phys_proj, v_phys_spread, v_phys_contact. Loads after baseline3.js.

const BL_KINDS = ['rambo', 'harry', 'robocop', 'sperm', 'evil', 'ride', 'kungfu', 'samurai', 'biting'];
const BL_BY_WEAPON = { v_phys_proj: { A: 'rambo', B: 'harry', C: 'robocop' }, v_phys_spread: { A: 'sperm', B: 'evil', C: 'ride' }, v_phys_contact: { A: 'kungfu', B: 'samurai', C: 'biting' } };
const BL_RED = '#e03a4e', BL_STEEL = '#aab4c0', BL_DARK = 'rgb(30,34,32)', BL_HALO = 'rgba(255,255,255,0.85)';

function blDrawLook(g, kind, x, y, u, ang, t, o) {
  o = o || {}; const act = o.act || 0, spd = o.speed || 0, lw = Math.max(1, u * 0.28);
  g.save(); g.translate(x, y); g.rotate(ang); g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]);
  const line = (pts, w, col, halo) => { // a polyline with a pale halo under it
    g.beginPath(); g.moveTo(pts[0][0] * u, pts[0][1] * u); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] * u, pts[i][1] * u);
    if (halo !== false) { g.strokeStyle = BL_HALO; g.lineWidth = w + u * 0.34; g.stroke(); }
    g.strokeStyle = col; g.lineWidth = w; g.stroke();
  };
  const dot = (cx, cy, r, fill, edge) => { g.beginPath(); g.arc(cx * u, cy * u, r * u, 0, Math.PI * 2); g.fillStyle = fill; g.fill(); g.lineWidth = Math.max(1, u * 0.16); g.strokeStyle = edge || BL_DARK; g.stroke(); };
  const wave = (i, n, amp) => Math.sin(t * (9 + act * 8) - i / n * 6) * amp;
  if (kind === 'rambo') { // a red headband with two long ribbons whipping behind; they whip harder as the magazine empties
    line([[0.15, -0.95], [0.15, 0.95]], u * 0.5, BL_RED);
    for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 8; i++) { const f = i / 8; pts.push([0.1 - f * 4, s * (0.85 + f * 0.9) + wave(i, 8, (0.35 + 0.9 * act) * f)]); } line(pts, u * 0.28, BL_RED); }
  } else if (kind === 'harry') { // a dark visor, a glint, and a revolver out in front; the muzzle flashes when it fires
    line([[0.5, -0.95], [0.5, 0.95]], u * 0.62, BL_DARK, false);
    const gl = 0.45 + 0.55 * Math.max(act, Math.max(0, Math.sin(t * 2.4)));
    g.fillStyle = '#ffffff'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = (i % 2 ? 0.12 : 0.42) * gl; g.lineTo((0.62 + Math.cos(a) * r) * u, (-0.45 + Math.sin(a) * r) * u); } g.closePath(); g.fill();
    line([[1.0, 0.7], [3.1, 0.7]], u * 0.42, BL_DARK); dot(1.45, 0.7, 0.5, BL_STEEL); line([[0.8, 0.7], [0.55, 1.35]], u * 0.4, BL_DARK);
    if (act > 0.2) { g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(3.1 * u, 0.7 * u); g.lineTo(3.9 * u, 0.3 * u); g.lineTo(3.5 * u, 0.7 * u); g.lineTo(3.9 * u, 1.1 * u); g.closePath(); g.fill(); }
  } else if (kind === 'robocop') { // a chrome helmet with a red visor and a scanner dot that sweeps faster when a mark is live
    g.beginPath(); g.ellipse(0.1 * u, 0, 1.3 * u, 0.98 * u, 0, 0, Math.PI * 2); g.fillStyle = '#e3e9f0'; g.fill(); g.lineWidth = Math.max(1, u * 0.2); g.strokeStyle = BL_DARK; g.stroke();
    line([[0.6, -0.78], [0.6, 0.78]], u * 0.42, BL_DARK, false);
    const sy = Math.sin(t * (4 + (o.mark ? 6 : 0) + act * 6)) * 0.6; dot(0.6, sy, 0.2, '#ff2e2e', '#ff2e2e');
    line([[-0.5, -0.9], [-0.9, -1.7]], u * 0.18, BL_DARK); dot(-0.9, -1.75, 0.2, '#ff2e2e', BL_DARK);
  } else if (kind === 'sperm') { // Sperminator: steel plates across the head, a red eye, steel rings down the tail
    for (const px of [-0.45, 0.1, 0.65]) line([[px, -0.85 + Math.abs(px) * 0.3], [px, 0.85 - Math.abs(px) * 0.3]], u * 0.34, BL_STEEL);
    dot(0.62, -0.18, 0.3, '#ff2e2e', '#7a0d0d');
    for (const rx of [-2.0, -3.0, -4.0]) { g.beginPath(); g.ellipse(rx * u, 0, 0.22 * u, 0.62 * u, 0, 0, Math.PI * 2); g.strokeStyle = BL_HALO; g.lineWidth = u * 0.5; g.stroke(); g.strokeStyle = BL_STEEL; g.lineWidth = u * 0.3; g.stroke(); }
  } else if (kind === 'evil') { // a chainsaw on its head: motor, bar, and chain teeth running along it
    const L = 3.6, off = ((t * (6 + act * 10)) % 0.5);
    g.fillStyle = '#e07a1f'; g.fillRect(0.9 * u, -0.6 * u, 1.0 * u, 1.2 * u); g.strokeStyle = BL_DARK; g.lineWidth = Math.max(1, u * 0.16); g.strokeRect(0.9 * u, -0.6 * u, 1.0 * u, 1.2 * u);
    g.beginPath(); g.moveTo(1.9 * u, -0.38 * u); g.lineTo(L * u, -0.3 * u); g.arc(L * u, 0, 0.3 * u, -Math.PI / 2, Math.PI / 2); g.lineTo(1.9 * u, 0.38 * u); g.closePath(); g.fillStyle = BL_STEEL; g.fill(); g.strokeStyle = BL_DARK; g.stroke();
    g.fillStyle = BL_DARK; for (let i = 0; i < 6; i++) { const cx = (1.95 + i * 0.5 + off) * u; if (cx > (L + 0.2) * u) continue; g.fillRect(cx - u * 0.07, -0.5 * u, u * 0.14, u * 0.2); g.fillRect(cx - u * 0.07, 0.3 * u, u * 0.14, u * 0.2); }
    if (act > 0.15) { g.fillStyle = BL_RED; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc((L + 0.3 + Math.random() * 0.8) * u, (Math.random() - 0.5) * 1.6 * u, u * 0.1, 0, Math.PI * 2); g.fill(); } }
  } else if (kind === 'ride') { // goggles, and speed lines that stretch with your swim speed
    line([[0.1, -0.85], [0.1, 0.85]], u * 0.22, BL_DARK, false);
    for (const s of [-1, 1]) dot(0.62, s * 0.42, 0.36, '#2a2f36', '#ffffff');
    dot(0.55, -0.55, 0.1, '#ffffff', '#ffffff');
    for (const [yy, ph] of [[-1.15, 0], [0, 0.4], [1.15, 0.8]]) { const L = 1.6 + spd * 3.6 + Math.sin(t * 12 + ph) * 0.3; g.globalAlpha = 0.55 + 0.4 * spd; line([[-1.6, yy], [-1.6 - L, yy]], u * 0.22, BL_DARK); g.globalAlpha = 1; }
  } else if (kind === 'kungfu') { // a white headband with a knot, and two fists circling the head (they jab on a hit)
    line([[0.1, -0.95], [0.1, 0.95]], u * 0.46, '#ffffff'); dot(-0.15, -1.0, 0.2, '#ffffff'); line([[-0.15, -1.0], [-0.9, -1.55]], u * 0.2, '#ffffff'); line([[-0.15, -1.0], [-0.7, -0.45]], u * 0.2, '#ffffff');
    for (const s of [0, 1]) { const a = t * 2.2 + s * Math.PI, r = 2.6 + act * 1.4; dot(Math.cos(a) * r, Math.sin(a) * r * 0.8, 0.8, '#f0b88e'); line([[Math.cos(a) * r + 0.15, Math.sin(a) * r * 0.8 - 0.45], [Math.cos(a) * r + 0.15, Math.sin(a) * r * 0.8 + 0.45]], u * 0.14, BL_DARK, false); }
  } else if (kind === 'samurai') { // a topknot and a katana held out to the side; it cuts an arc when it strikes
    dot(-0.3, -1.3, 0.55, BL_DARK, '#ffffff'); line([[-0.3, -0.85], [-0.3, -1.1]], u * 0.3, BL_DARK, false);
    const sw = -0.5 - act * 1.4;
    g.save(); g.translate(0.5 * u, -0.9 * u); g.rotate(sw);
    line([[0, 0], [1.1, 0]], u * 0.6, BL_DARK); line([[1.1, 0], [5.4, 0]], u * 0.5, BL_DARK, false); line([[1.1, 0], [5.4, 0]], u * 0.28, '#f4f6f8', false); g.restore();
    if (act > 0.15) { g.beginPath(); g.arc(0, 0, 3.2 * u, -1.9, -0.2); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = u * 0.3; g.stroke(); }
  } else if (kind === 'biting') { // a row of teeth round the front of the head that chomps; a little blood
    const open = 0.15 + 0.5 * Math.abs(Math.sin(t * 5 + act * 3)) + act * 0.3;
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) {
      const a = s * (0.2 + i * 0.24), rr = 1.15; const bx = Math.cos(a) * rr * 1.0, by = Math.sin(a) * rr * 0.72;
      g.beginPath(); g.moveTo((bx - Math.sin(a) * 0.3) * u, (by + Math.cos(a) * 0.3) * u); g.lineTo((bx + Math.cos(a) * (0.95 + open * 0.7)) * u, (by + Math.sin(a) * (0.95 + open * 0.7)) * u); g.lineTo((bx + Math.sin(a) * 0.3) * u, (by - Math.cos(a) * 0.3) * u); g.closePath();
      g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = Math.max(1, u * 0.14); g.strokeStyle = BL_DARK; g.stroke();
    }
    dot(1.9, 0.0, 0.14, BL_RED, BL_RED);
  }
  g.restore();
}

// ---------------------------------------------------------------- in the run
function blPick() { // the hero weapon you fired last (a costume per weapon would overlap on one head)
  if (!G || !G.weapons) return null;
  let best = null, bt = -1;
  for (const w of G.weapons) {
    if (!w || w.isSpell || !w.def) continue;
    const key = w24Key(w), map = BL_BY_WEAPON[key]; if (!map) continue;
    const p = key === 'v_phys_proj' ? bl1P() : key === 'v_phys_spread' ? bl2P() : hgP();
    if (!p || !map[p]) continue;
    const ft = w.firedT || 0; if (ft >= bt) { bt = ft; best = { w, kind: map[p] }; }
  }
  return best;
}
const BL_BIG = 1.5; // (the costume is drawn at this much more than the body's own scale: it has to read at phone size)
function blInRun(px, py) {
  const pk = blPick(); if (!pk) return;
  const pl = G.player, k = S * (typeof playerScale === 'function' ? playerScale() : 1), face = (pl.hd != null ? pl.hd : pl.face) + (pl.yaw || 0);
  const w = pk.w, mag = w.s && w.s.mag > 0 && w.s.mag < 999 ? w.s.mag : 0;
  let act = Math.max(0, 1 - (G.t - (w.firedT || -9)) / 0.3);
  if (pk.kind === 'rambo' && mag) act = Math.max(act, 1 - Math.max(0, w.ammo) / mag);
  const sp = Math.min(1, Math.hypot(pl.vx || 0, pl.vy || 0) / 165);
  const raw = RAW_COL; RAW_COL = true;
  const ga = ctx.globalAlpha; ctx.globalAlpha = (G.oob ? 0.5 : 1) * (G.peek && G.peek.t > G.t ? 0.2 : 1);
  blDrawLook(ctx, pk.kind, px, py, 7.5 * k * BL_BIG, face, G.realT, { act, speed: sp, mark: !!(G.bl1 && G.bl1.marks && G.bl1.marks.length) });
  ctx.globalAlpha = ga; RAW_COL = raw;
}
drawPlates = (orig => function (px, py) { orig(px, py); try { blInRun(px, py); } catch (e) { } })(drawPlates);

// ---------------------------------------------------------------- on the branch screen
// The stage engines read flags from these tables (letters at Lv 6 and 9, card names at Lv 3). The old scene flags are left in
// place; the new ones just select a costume. The hero cards' later names fall through to the promise's letter.
Object.assign(SIV_FLAG, { A: 'rambo', B: 'harry', C: 'robocop', Rambo: 'rambo', 'Dirty Harry': 'harry', Robocop: 'robocop' });
Object.assign(MGV_FLAG, { A: 'sperm', B: 'evil', C: 'ride', Sperminator: 'sperm', 'Evil Dead': 'evil', 'Riding shotgun': 'ride' });
Object.assign(NWV_FLAG, { A: 'kungfu', B: 'samurai', C: 'biting', 'Kung fu': 'kungfu', Samurai: 'samurai', Biting: 'biting' });
for (const id of Object.keys(BL_BY_WEAPON)) {
  const O = PV_OWN[id]; if (!O) continue;
  O.step = (orig => function (pv, dt) { // (the scenes put the sperm at the left edge, under the stage's arrow buttons: costume previews stand further in)
    orig.apply(this, arguments);
    if (pv.me && pv.F && BL_KINDS.some(k => pv.F.has(k)) && pv.me.x < 0.3) pv.me.x = 0.3;
  })(O.step);
  O.me = (orig => function (pv, g, hx, hy, hr, U) {
    if (orig) orig.apply(this, arguments);
    const kind = BL_KINDS.find(k => pv.F && pv.F.has(k)); if (!kind) return;
    if (pv.me && pv.me.x < 0.3) pv.me.x = 0.3; // (clear of the stage's arrow buttons, with room for the costume behind the head)
    const act = Math.max(0, 1 - (pv.t - (pv.lastShot || -9)) / 0.3);
    blDrawLook(g, kind, hx, hy, hr * 1.2 * 1.25, pv.me.a || 0, pv.t, { act: pv.shotFlash || act, speed: 0.6 });
  })(O.me);
}
