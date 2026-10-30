'use strict';
// Spawn Prawn - the Baseline hero costumes. Two kinds:
//  - SAMPLE BRANCH costumes (Rambo, Dirty Harry, Robocop: samplebranch.js, baseline1.js): drawn in the head's own frame by a
//    wrap of samplelooks.js SL_HEAD.baseline, so they sit on the head at its true size, squash and rock with it, and land on
//    the sharp body canvas (youhd.js) with the rest of you. (The v10.225 costumes were drawn on the slide under that canvas,
//    which is why they did not show; v10.226 drew them 1.5x so they poked out. Both are gone.) Shaded like the sample
//    bodies (gradients, highlights, a dark edge), so they read in Lab view too:
//      rambo    a red cloth headband round the head, a knot at the nape and two ribbon tails that trail on their own
//               follow-the-leader rope (SL_UNDER.baseline) and flutter harder while you fire.
//      harry    a .44 in a leather holster on the right flank, its long barrel past the nose, the strap over the neck;
//               a muzzle flash and a wisp of smoke when you fire.
//      robocop  a chrome helmet over the front of the head with ear pieces, rivets and a black visor; a red scanner light
//               sweeps the visor, faster while a mark is live. The back of the head stays bare.
//    The sample branch screen draws the same costumes on its cards (samplebranch.js smbLookKind).
//  - WEAPON BRANCH costumes (the six Shotgun and Hand-to-gland heroes): `blDrawLook`, drawn after your body inside the sharp
//    canvas pass (a drawSeqMods wrap) at the head's size, for the hero weapon you fired last; hidden while a sample branch
//    costume is worn (one head, one costume). The stage previews (fbdemo.js MGV and NWV) know their flags.
// Units: u = the head's half-length. The frame is rotated to the sperm's heading, +x forward. act (0 to 1) is a pulse that
// follows firing; speed (0 to 1) follows swim speed.
// Hooks: wraps samplelooks.js SL_HEAD.baseline, sets SL_UNDER.baseline, wraps seqsel.js drawSeqMods; edits MGV_FLAG, NWV_FLAG
// (fbdemo.js) in place; wraps the `me` of PV_OWN for v_phys_spread, v_phys_contact. Loads after baseline3.js.

const BL_KINDS = ['sperm', 'evil', 'ride', 'kungfu', 'samurai', 'biting'];
const BL_BY_WEAPON = { v_phys_spread: { A: 'sperm', B: 'evil', C: 'ride' }, v_phys_contact: { A: 'kungfu', B: 'samurai', C: 'biting' } };
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
  if (kind === 'sperm') { // Sperminator: steel plates across the head, a red eye, steel rings down the tail
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
    const p = key === 'v_phys_spread' ? bl2P() : hgP();
    if (!p || !map[p]) continue;
    const ft = w.firedT || 0; if (ft >= bt) { bt = ft; best = { w, kind: map[p] }; }
  }
  return best;
}
const BL_BIG = 1; // (the head's own size: v10.226's 1.5x only made up for the costume being drawn under the body)
function blInRun(px, py) {
  if (blSmbKind()) return; // (a sample branch costume is on the head)
  const pk = blPick(); if (!pk) return;
  const pl = G.player, k = S * (typeof playerScale === 'function' ? playerScale() : 1), face = (pl.hd != null ? pl.hd : pl.face) + (pl.yaw || 0);
  const w = pk.w;
  const act = Math.max(0, 1 - (G.t - (w.firedT || -9)) / 0.3);
  const sp = Math.min(1, Math.hypot(pl.vx || 0, pl.vy || 0) / 165);
  const raw = RAW_COL; RAW_COL = true;
  const ga = ctx.globalAlpha; ctx.globalAlpha = (G.oob ? 0.5 : 1) * (G.peek && G.peek.t > G.t ? 0.2 : 1);
  blDrawLook(ctx, pk.kind, px, py, 7.5 * k * BL_BIG, face, G.realT, { act, speed: sp, mark: !!(G.bl1 && G.bl1.marks && G.bl1.marks.length) });
  ctx.globalAlpha = ga; RAW_COL = raw;
}
drawSeqMods = (orig => function (x, y, face, alpha, scale, body) { orig.apply(this, arguments); if (G && body && body === G.player) try { blInRun(x, y); } catch (e) { } })(drawSeqMods); // (inside youhd.js's pass: after the body, on its canvas)

// ---------------------------------------------------------------- on the branch screen
// The stage engines read flags from these tables (letters at Lv 6 and 9, card names at Lv 3). The old scene flags are left in
// place; the new ones just select a costume. The hero cards' later names fall through to the promise's letter.
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

// ---------------------------------------------------------------- the sample branch costumes (in the head's frame)
const BL_SMB = { rambo: 'A', harry: 'B', robocop: 'C' }, BL_SMB_K = { A: 'rambo', B: 'harry', C: 'robocop' };
// The costume to draw: a branch card's picture (samplebranch.js), else the branch you took.
const blSmbKind = () => (typeof smbLookKind !== 'undefined' && smbLookKind && BL_SMB[smbLookKind] ? smbLookKind : BL_SMB_K[typeof bl1P === 'function' ? bl1P() : ''] || null);
// The firing pulse (0 to 1): the last shot of any weapon; on a card, a shot every 1.1 s.
function blSmbAct(now) {
  if (typeof smbLookKind !== 'undefined' && smbLookKind) return Math.max(0, 1 - (now % 1.1) / 0.28);
  if (!G || !G.weapons) return 0;
  let ft = -9; for (const w of G.weapons) if (w && !w.isSpell && (w.firedT || -9) > ft) ft = w.firedT;
  return Math.max(0, 1 - (G.t - ft) / 0.3);
}
const blEll = (x, y, rx, ry, k) => { ctx.beginPath(); ctx.ellipse(x * k, y * k, rx * k, ry * k, 0, 0, TAU); };

// Rambo. The band hugs the head's outline (centre 1, 0; 7.5 by 5 units), the knot sits at the nape.
const BL_RAG = { lit: '#ef4b58', mid: '#c4232f', dk: '#6e0d17', back: '#86131e', edge: 'rgba(48,8,12,0.75)' };
function blRamboHead(k, a, now, act) {
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
  // The band: a cloth ring a little proud of the outline, lit from the upper left, darker where it turns under.
  const g = ctx.createLinearGradient(-3 * k, -6 * k, 4 * k, 6 * k); g.addColorStop(0, BL_RAG.lit); g.addColorStop(0.45, BL_RAG.mid); g.addColorStop(1, BL_RAG.dk);
  ctx.strokeStyle = BL_RAG.edge; ctx.lineWidth = 1.85 * k; blEll(1, 0, 7.2, 4.75, k); ctx.stroke(); // (its dark edge)
  ctx.strokeStyle = g; ctx.lineWidth = 1.35 * k; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,190,190,0.5)'; ctx.lineWidth = 0.35 * k; ctx.beginPath(); ctx.ellipse(1 * k, 0, 6.9 * k, 4.45 * k, 0, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke(); // (the sheen along its inner top)
  // Folds: short creases across the cloth, bunching towards the knot.
  ctx.strokeStyle = 'rgba(70,6,14,0.4)'; ctx.lineWidth = 0.22 * k; ctx.beginPath();
  for (const an of [2.35, -2.35, 2.7, -2.7]) { // (only where it is pulled tight into the knot)
    const c = Math.cos(an), sn = Math.sin(an), w = 0.6;
    ctx.moveTo((1 + c * (7.2 - w)) * k, sn * (4.75 - w * 0.65) * k); ctx.quadraticCurveTo((1 + c * 7.2 + 0.4) * k, sn * 4.75 * k, (1 + c * (7.2 + w)) * k, sn * (4.75 + w * 0.65) * k);
  }
  ctx.stroke();
  // The knot: two bunched lobes and a wrap, at the back of the head where the ends leave.
  for (const [ky, r] of [[-0.95, 1.05], [0.95, 1.05]]) {
    const kg = ctx.createRadialGradient(-6.5 * k, (ky - 0.4) * k, 0.1 * k, -6.3 * k, ky * k, r * 1.4 * k); kg.addColorStop(0, BL_RAG.lit); kg.addColorStop(1, BL_RAG.dk);
    ctx.fillStyle = kg; blEll(-6.35, ky, r * 1.15, r, k); ctx.fill(); ctx.strokeStyle = BL_RAG.edge; ctx.lineWidth = 0.35 * k; ctx.stroke();
  }
  ctx.fillStyle = BL_RAG.mid; blEll(-6.6, 0, 0.75, 0.85, k); ctx.fill(); ctx.strokeStyle = BL_RAG.edge; ctx.lineWidth = 0.35 * k; ctx.stroke();
  ctx.restore();
  void now; void act;
}
// The two ribbon ends: a rope of nodes each (world units on the body's own state), pulled by the knot, drifting back.
function blRamboRibbons(x, y, face, k, a, now, B, body, sc) {
  const R = B.rb || (B.rb = { t: now, ends: null }), dt = Math.min(0.05, Math.max(0, now - R.t)); R.t = now;
  const f = face + (body.yaw || 0), n = 13, L = 1.9 * sc, act = blSmbAct(now);
  const kx = body.x + Math.cos(f) * -7.1 * sc, ky = body.y + Math.sin(f) * -7.1 * sc;
  if (!R.ends || Math.hypot(R.ends[0][0].x - kx, R.ends[0][0].y - ky) > 60 * sc) R.ends = [-1, 1].map(s => Array.from({ length: n }, (_, i) => ({ x: kx - Math.cos(f) * L * i, y: ky - Math.sin(f) * L * i + s * 0.01 })));
  const bx = -Math.cos(f), by = -Math.sin(f);
  ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round';
  R.ends.forEach((P, ri) => {
    const s = ri ? 1 : -1;
    P[0].x = kx - Math.sin(f) * s * 0.55 * sc; P[0].y = ky + Math.cos(f) * s * 0.55 * sc;
    for (let i = 1; i < n; i++) { // (follow the one in front at a fixed spacing; drift back and a little apart when still)
      const q = P[i], o = P[i - 1];
      q.x += (bx * 24 - Math.sin(f) * s * 2.2) * sc * dt; q.y += (by * 24 + Math.cos(f) * s * 2.2) * sc * dt;
      const dx = q.x - o.x, dy = q.y - o.y, d = Math.hypot(dx, dy) || 1; q.x = o.x + dx / d * L; q.y = o.y + dy / d * L;
    }
    // Screen points with a flutter across the rope, stronger towards the free end and while firing.
    const pts = P.map((p, i) => {
      const q = P[Math.min(n - 1, i + 1)], o = P[Math.max(0, i - 1)], an = Math.atan2(q.y - o.y, q.x - o.x), u = i / (n - 1);
      const fl = Math.sin(now * (9 + 7 * act) - u * 6 + ri * 1.9) * (0.45 + 1.3 * act) * u * sc;
      return { x: sx(p.x) - Math.sin(an) * fl * S, y: sy(p.y) + Math.cos(an) * fl * S, nx: -Math.sin(an), ny: Math.cos(an), u };
    });
    // The cloth: a strip that narrows and twists (the darker back shows on the turns), the end cut in a notch.
    const tw = i => Math.cos(now * 3.1 + i * 0.7 + ri * 2), hw = i => (1.05 - 0.35 * pts[i].u) * k * (0.3 + 0.7 * Math.abs(tw(i)));
    const L1 = pts.map((p, i) => [p.x + p.nx * hw(i), p.y + p.ny * hw(i)]), L2 = pts.map((p, i) => [p.x - p.nx * hw(i), p.y - p.ny * hw(i)]);
    const e = pts[n - 1], d = pts[n - 2], notch = [e.x - (e.x - d.x) * 0.55, e.y - (e.y - d.y) * 0.55];
    for (let i = 0; i < n - 1; i++) { // (each stretch its own face, no seams drawn)
      ctx.beginPath(); ctx.moveTo(L1[i][0], L1[i][1]); ctx.lineTo(L1[i + 1][0], L1[i + 1][1]);
      if (i === n - 2) ctx.lineTo(notch[0], notch[1]);
      ctx.lineTo(L2[i + 1][0], L2[i + 1][1]); ctx.lineTo(L2[i][0], L2[i][1]); ctx.closePath();
      ctx.fillStyle = tw(i) + tw(i + 1) > 0 ? BL_RAG.mid : BL_RAG.back; ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.5; ctx.stroke(); // (a hairline in its own colour hides the joins)
    }
    ctx.beginPath(); L1.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineTo(notch[0], notch[1]); for (let i = n - 1; i >= 0; i--) ctx.lineTo(L2[i][0], L2[i][1]);
    ctx.strokeStyle = BL_RAG.edge; ctx.lineWidth = 0.3 * k; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,170,175,0.4)'; ctx.lineWidth = 0.28 * k; ctx.beginPath(); // (the sheen on the faces turned up)
    for (let i = 0; i < n - 1; i++) if (tw(i) > 0.3 && tw(i + 1) > 0.3) { ctx.moveTo((pts[i].x + L2[i][0]) / 2, (pts[i].y + L2[i][1]) / 2); ctx.lineTo((pts[i + 1].x + L2[i + 1][0]) / 2, (pts[i + 1].y + L2[i + 1][1]) / 2); }
    ctx.stroke();
  });
  ctx.restore();
}

// Dirty Harry: a long-barrelled revolver in a shoulder holster on the right flank (+y), the strap over the neck.
const BL_GUN = { hi: '#c9d0d8', mid: '#5f6770', dk: '#23282e', wood: '#7a4a28', woodHi: '#a8703f', woodDk: '#3f2312', lea: '#8a5a33', leaHi: '#b07a4a', leaDk: '#4a2c14' };
function blHarryHead(k, a, now, act) {
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // The squint: two deep creases over the front of the head, drawn in towards the middle.
  for (const s of [-1, 1]) {
    ctx.strokeStyle = 'rgba(16,18,20,0.85)'; ctx.lineWidth = 0.7 * k; ctx.beginPath(); ctx.moveTo(4.2 * k, s * 3.0 * k); ctx.quadraticCurveTo(5.6 * k, s * 2.4 * k, 6.5 * k, s * 0.9 * k); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.25 * k; ctx.beginPath(); ctx.moveTo(3.7 * k, s * 2.6 * k); ctx.quadraticCurveTo(5.0 * k, s * 2.0 * k, 5.8 * k, s * 0.7 * k); ctx.stroke();
  }
  const Y = 6.75; // (the gun's axis, on the right flank)
  // The strap: from the holster, round the neck to the far side, with a buckle.
  const sg = ctx.createLinearGradient(-5.4 * k, -6 * k, -5.4 * k, 6 * k); sg.addColorStop(0, BL_GUN.leaDk); sg.addColorStop(0.5, BL_GUN.leaHi); sg.addColorStop(1, BL_GUN.lea);
  ctx.strokeStyle = 'rgba(30,16,6,0.8)'; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(-2.6 * k, 5.6 * k); ctx.quadraticCurveTo(-6.8 * k, 0, -4.2 * k, -5.7 * k); ctx.stroke();
  ctx.strokeStyle = sg; ctx.lineWidth = 1.1 * k; ctx.stroke();
  ctx.fillStyle = '#d8c27a'; ctx.strokeStyle = 'rgba(60,44,10,0.9)'; ctx.lineWidth = 0.25 * k; ctx.beginPath(); ctx.roundRect(-6.2 * k, -1.0 * k, 1.1 * k, 1.5 * k, 0.25 * k); ctx.fill(); ctx.stroke();
  // The grip: walnut, out of the back of the holster, with its grain and the butt.
  const gg = ctx.createLinearGradient(0, (Y - 1) * k, 0, (Y + 1) * k); gg.addColorStop(0, BL_GUN.woodHi); gg.addColorStop(0.55, BL_GUN.wood); gg.addColorStop(1, BL_GUN.woodDk);
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(-3.6 * k, (Y - 0.85) * k); ctx.lineTo(-7.2 * k, (Y - 1.0) * k); ctx.quadraticCurveTo(-8.3 * k, Y * k, -7.2 * k, (Y + 1.0) * k); ctx.lineTo(-3.6 * k, (Y + 0.85) * k); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.9)'; ctx.lineWidth = 0.32 * k; ctx.stroke();
  ctx.strokeStyle = 'rgba(40,18,6,0.45)'; ctx.lineWidth = 0.18 * k; ctx.beginPath(); for (const gy of [-0.45, 0, 0.45]) { ctx.moveTo(-4 * k, (Y + gy) * k); ctx.quadraticCurveTo(-5.6 * k, (Y + gy * 1.3 + 0.15) * k, -7.1 * k, (Y + gy * 1.1) * k); } ctx.stroke();
  ctx.fillStyle = BL_GUN.dk; ctx.beginPath(); ctx.roundRect(-4.25 * k, (Y - 0.4) * k, 1.0 * k, 0.8 * k, 0.25 * k); ctx.fill(); // (the hammer spur)
  // The barrel past the holster: gunmetal, a ventilated top rib, the front sight, the muzzle.
  const bg = ctx.createLinearGradient(0, (Y - 0.6) * k, 0, (Y + 0.6) * k); bg.addColorStop(0, BL_GUN.hi); bg.addColorStop(0.35, BL_GUN.mid); bg.addColorStop(1, BL_GUN.dk);
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(2.0 * k, (Y - 0.6) * k, 8.9 * k, 1.2 * k, 0.25 * k); ctx.fill(); ctx.strokeStyle = 'rgba(14,16,20,0.9)'; ctx.lineWidth = 0.28 * k; ctx.stroke();
  ctx.strokeStyle = 'rgba(240,245,250,0.8)'; ctx.lineWidth = 0.22 * k; ctx.beginPath(); ctx.moveTo(2.8 * k, (Y - 0.24) * k); ctx.lineTo(10.4 * k, (Y - 0.24) * k); ctx.stroke(); // (the rib's highlight)
  ctx.fillStyle = 'rgba(14,16,20,0.6)'; for (let x = 3.6; x < 10; x += 1.1) ctx.fillRect(x * k, (Y - 0.1) * k, 0.45 * k, 0.22 * k); // (the rib's vents)
  ctx.fillStyle = BL_GUN.dk; ctx.fillRect(10.1 * k, (Y - 0.85) * k, 0.55 * k, 0.4 * k); // (the front sight)
  ctx.fillStyle = '#0b0c0e'; blEll(10.9, Y, 0.2, 0.45, k); ctx.fill();
  // The holster: tooled leather over the frame and the cylinder (its bulge), stitched along the edge.
  const hg = ctx.createLinearGradient(0, (Y - 1.5) * k, 0, (Y + 1.5) * k); hg.addColorStop(0, BL_GUN.leaHi); hg.addColorStop(0.5, BL_GUN.lea); hg.addColorStop(1, BL_GUN.leaDk);
  ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(-3.6 * k, (Y - 1.2) * k); ctx.quadraticCurveTo(-1.5 * k, (Y - 1.65) * k, 0.4 * k, (Y - 1.3) * k); ctx.lineTo(2.6 * k, (Y - 0.85) * k); ctx.quadraticCurveTo(3.3 * k, Y * k, 2.6 * k, (Y + 0.85) * k); ctx.lineTo(0.4 * k, (Y + 1.3) * k); ctx.quadraticCurveTo(-1.5 * k, (Y + 1.65) * k, -3.6 * k, (Y + 1.2) * k); ctx.quadraticCurveTo(-4.1 * k, Y * k, -3.6 * k, (Y - 1.2) * k); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(36,18,6,0.9)'; ctx.lineWidth = 0.32 * k; ctx.stroke();
  ctx.setLineDash([0.35 * k, 0.45 * k]); ctx.strokeStyle = 'rgba(240,210,160,0.7)'; ctx.lineWidth = 0.15 * k; ctx.beginPath(); ctx.moveTo(-3.1 * k, (Y - 0.9) * k); ctx.quadraticCurveTo(-1.5 * k, (Y - 1.3) * k, 2.2 * k, (Y - 0.62) * k); ctx.moveTo(-3.1 * k, (Y + 0.9) * k); ctx.quadraticCurveTo(-1.5 * k, (Y + 1.3) * k, 2.2 * k, (Y + 0.62) * k); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,230,190,0.25)'; blEll(-1.5, Y - 0.55, 1.6, 0.45, k); ctx.fill(); // (the light on the cylinder's bulge)
  // Firing: a muzzle flash, then a wisp of smoke off the muzzle.
  if (act > 0.55) {
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,214,120,0.95)'; ctx.beginPath();
    const fx = 11.1, L = 2.6 + act * 1.8; ctx.moveTo(fx * k, (Y - 0.55) * k); ctx.lineTo((fx + L) * k, Y * k); ctx.lineTo(fx * k, (Y + 0.55) * k); ctx.lineTo((fx + L * 0.45) * k, (Y + 1.3) * k); ctx.lineTo((fx + 0.4) * k, Y * k); ctx.lineTo((fx + L * 0.45) * k, (Y - 1.3) * k); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  } else if (act > 0) {
    ctx.strokeStyle = `rgba(225,228,232,${(0.55 * act / 0.55).toFixed(3)})`; ctx.lineWidth = 0.4 * k; ctx.beginPath();
    const r = 1 - act / 0.55; ctx.moveTo(11.1 * k, Y * k); ctx.bezierCurveTo((11.8 + r) * k, (Y - 0.6) * k, (11.2 + r) * k, (Y - 1.2 - r) * k, (12.2 + r * 1.5) * k, (Y - 1.8 - r * 1.4) * k); ctx.stroke();
  }
  ctx.restore();
  void now;
}

// Robocop: a chrome helmet over the front two thirds of the head; the back of the head stays bare.
function blRoboHead(k, a, now, act) {
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const rx = 7.85, ry = 5.3, t0 = Math.acos((-2.3 - 1) / rx);
  const helm = () => { ctx.beginPath(); ctx.ellipse(1 * k, 0, rx * k, ry * k, 0, -t0, t0); ctx.quadraticCurveTo(-3.7 * k, 0, (1 + Math.cos(-t0) * rx) * k, Math.sin(-t0) * ry * k); ctx.closePath(); };
  // The ear pieces first, so the shell overlaps their roots.
  for (const s of [-1, 1]) {
    const eg = ctx.createLinearGradient(0, s * 4.6 * k, 0, s * 6.6 * k); eg.addColorStop(0, '#e9eef2'); eg.addColorStop(0.6, '#8d97a1'); eg.addColorStop(1, '#3a4148');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.roundRect(-0.6 * k, (s > 0 ? 4.3 : -6.5) * k, 3.2 * k, 2.2 * k, 0.9 * k); ctx.fill(); ctx.strokeStyle = 'rgb(34,38,44)'; ctx.lineWidth = 0.32 * k; ctx.stroke();
    ctx.fillStyle = '#2a3036'; blEll(1.0, s * 5.6, 0.55, 0.5, k); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; blEll(0.85, s * 5.45, 0.18, 0.15, k); ctx.fill();
  }
  // The shell: chrome, its reflections running round it in bands, a hot spot upper front.
  const cg = ctx.createLinearGradient(0, -ry * k, 0, ry * k);
  for (const [o, c] of [[0, '#4b535c'], [0.1, '#eef3f7'], [0.27, '#b4bec8'], [0.47, '#69737d'], [0.6, '#d8e0e7'], [0.82, '#8a949e'], [1, '#3f474f']]) cg.addColorStop(o, c);
  helm(); ctx.fillStyle = cg; ctx.fill();
  const sp = ctx.createRadialGradient(3.6 * k, -2.7 * k, 0.1 * k, 3.6 * k, -2.7 * k, 3.4 * k); sp.addColorStop(0, 'rgba(255,255,255,0.95)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sp; ctx.fill();
  ctx.strokeStyle = 'rgb(32,36,42)'; ctx.lineWidth = 0.5 * k; ctx.stroke();
  // The crest down the middle, and the rivets along the back edge.
  ctx.strokeStyle = 'rgba(40,44,50,0.7)'; ctx.lineWidth = 0.3 * k; ctx.beginPath(); ctx.moveTo(-2.7 * k, 0.15 * k); ctx.lineTo(4.4 * k, 0.15 * k); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.2 * k; ctx.beginPath(); ctx.moveTo(-2.6 * k, -0.2 * k); ctx.lineTo(4.4 * k, -0.2 * k); ctx.stroke();
  for (const ry2 of [-3.4, 0, 3.4]) { const x = -2.6 + Math.abs(ry2) * 0.12; ctx.fillStyle = '#3a4148'; blEll(x, ry2 * 0.9, 0.36, 0.36, k); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.75)'; blEll(x - 0.1, ry2 * 0.9 - 0.12, 0.13, 0.13, k); ctx.fill(); }
  // The visor: a black glossy band round the front.
  const v0 = 1.02, vis = () => { ctx.beginPath(); ctx.ellipse(1 * k, 0, 7.1 * k, 4.75 * k, 0, -v0, v0); ctx.ellipse(1 * k, 0, 5.3 * k, 3.45 * k, 0, v0, -v0, true); ctx.closePath(); };
  vis(); ctx.fillStyle = '#0c0e11'; ctx.fill(); ctx.strokeStyle = 'rgba(200,210,220,0.55)'; ctx.lineWidth = 0.22 * k; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.32)'; ctx.lineWidth = 0.22 * k; ctx.beginPath(); ctx.ellipse(1 * k, 0, 6.6 * k, 4.35 * k, 0, -0.85, -0.1); ctx.stroke(); // (the gloss)
  // The scanner: a red light sweeping the visor, quicker while a mark is live.
  const mark = !!(G && G.bl1 && G.bl1.marks && G.bl1.marks.length), sw = Math.sin(now * (2.6 + (mark ? 4 : 0) + act * 3)) * 0.78;
  ctx.save(); vis(); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (const [w, al] of [[1.6, 0.35], [0.7, 0.95]]) { ctx.strokeStyle = `rgba(255,40,40,${al})`; ctx.lineWidth = w * k; ctx.beginPath(); ctx.ellipse(1 * k, 0, 6.2 * k, 4.1 * k, 0, sw - 0.13, sw + 0.13); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}

SL_HEAD.baseline = (orig => function (k, a, now) {
  orig.apply(this, arguments);
  const kind = blSmbKind(); if (!kind) return;
  const act = blSmbAct(now), raw = RAW_COL; RAW_COL = true;
  try { if (kind === 'rambo') blRamboHead(k, a, now, act); else if (kind === 'harry') blHarryHead(k, a, now, act); else blRoboHead(k, a, now, act); }
  finally { RAW_COL = raw; ctx.globalAlpha = a; }
})(SL_HEAD.baseline);
SL_UNDER.baseline = (orig => function (x, y, face, k, a, now, B, body, sc) {
  if (orig) orig.apply(this, arguments);
  if (blSmbKind() === 'rambo' && body && B) blRamboRibbons(x, y, face, k, a, now, B, body, sc || 1);
})(SL_UNDER.baseline);
