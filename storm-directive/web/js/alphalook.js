'use strict';
// Spawn Prawn - the Alpha hustle costumes (ALPHA_REDESIGN.md, Costumes). Same idea as baselinelook.js: one drawer for every
// costume, used twice, and it only shows while the run is played as Alpha (sbrSample() === 'alpha').
//  - DRAWING: blDrawLook is wrapped, so the twelve al_* kinds draw here and every other kind goes to the original.
//    Units: u = the head's half-length, +x forward, the frame turned to the sperm's heading. Every piece has a pale halo under a
//    dark outline, so it reads in Lab view (no colour) as well as Arcade view. act (0 to 1) pulses on firing, speed (0 to 1)
//    follows swim speed: laser eyes flare, the megaphone and the on-air lamp pulse, wings beat faster, sweat flies.
//  - IN THE RUN: blPick is wrapped. In an Alpha run the Alpha weapons map by branch letter (w.up.p) to a kind, and the hero
//    weapon fired last wins (against Baseline's pick as well). baselinelook.js's drawPlates wrap then draws it. Power Couple
//    also puts a small matching heart on the twin (drawPlates wrap, below).
//  - BRANCH SCREENS: the Red Flagship, Soulmate Signal and Unwanted Contact stage previews. The flag tables get the Alpha branch
//    names (Lv 3) and, while the run is Alpha, the letters A, B, C (Lv 6 and 9) read as the Alpha kind instead of the old scene
//    flag. The previews' `me` and `step` are wrapped as baselinelook.js does. Obligatory Podcast has no stage preview.
// Hooks: wraps blDrawLook, blPick (baselinelook.js) and drawPlates (bodymods.js); edits RFV_FLAG, TWV_FLAG, UCV_FLAG (asdemo.js)
// in place; wraps the `me` and `step` of PV_OWN for v_shock_beam, s_twin, s_tesla. Loads after samplebranches.js and baselinelook.js.

const AL_KINDS = ['al_grind', 'al_coach', 'al_crypto', 'al_wing', 'al_situ', 'al_couple', 'al_network', 'al_cold', 'al_influencer', 'al_hottake', 'al_threehour', 'al_callin'];
const AL_BY_WEAPON = {
  v_shock_beam: { A: 'al_grind', B: 'al_coach', C: 'al_crypto' },
  s_twin: { A: 'al_wing', B: 'al_situ', C: 'al_couple' },
  s_tesla: { A: 'al_network', B: 'al_cold', C: 'al_influencer' },
  v_phys_podcast: { A: 'al_hottake', B: 'al_threehour', C: 'al_callin' } };
// the Lv 3 card names on the branch screens (Obligatory Podcast has no stage preview, so its names are not here)
const AL_BY_NAME = { Grindset: 'al_grind', 'Life Coach': 'al_coach', 'Crypto Bro': 'al_crypto', Wingman: 'al_wing', Situationship: 'al_situ',
  'Power Couple': 'al_couple', 'Networking Event': 'al_network', 'Cold Caller': 'al_cold', Influencer: 'al_influencer' };
const AL_DARK = 'rgb(30,34,32)', AL_HALO = 'rgba(255,255,255,0.85)';

function alDrawLook(g, kind, x, y, u, ang, t, o) {
  o = o || {}; const act = o.act || 0, spd = o.speed || 0, PI = Math.PI;
  g.save(); g.translate(x, y); g.rotate(ang); g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]);
  const path = pts => { g.beginPath(); g.moveTo(pts[0][0] * u, pts[0][1] * u); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] * u, pts[i][1] * u); };
  // style 0: pale halo then colour. 1: pale halo, dark outline, colour. 2: colour only.
  const line = (pts, w, col, style) => {
    path(pts);
    if (style !== 2) { g.strokeStyle = AL_HALO; g.lineWidth = w + u * (style === 1 ? 0.56 : 0.34); g.stroke(); }
    if (style === 1) { g.strokeStyle = AL_DARK; g.lineWidth = w + u * 0.24; g.stroke(); }
    g.strokeStyle = col; g.lineWidth = w; g.stroke();
  };
  const edgeW = Math.max(1, u * 0.16);
  const dot = (cx, cy, r, fill, edge) => { g.beginPath(); g.arc(cx * u, cy * u, r * u, 0, PI * 2); g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || AL_DARK; g.stroke(); };
  const ell = (cx, cy, rx, ry, rot, fill, edge) => { g.beginPath(); g.ellipse(cx * u, cy * u, Math.max(0.01, rx) * u, ry * u, rot || 0, 0, PI * 2); g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || AL_DARK; g.stroke(); };
  const poly = (pts, fill, edge, halo) => {
    path(pts); g.closePath();
    if (halo !== false) { g.strokeStyle = AL_HALO; g.lineWidth = u * 0.5; g.stroke(); }
    g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || AL_DARK; g.stroke();
  };
  const heart = (cx, cy, s, fill, rot, halo) => { // the point faces the tail unless rot says otherwise
    g.save(); g.translate(cx * u, cy * u); g.rotate(rot == null ? PI / 2 : rot); g.scale(s * u, s * u);
    g.beginPath(); g.moveTo(0, 0.9); g.bezierCurveTo(-1.4, 0.1, -0.9, -0.9, 0, -0.35); g.bezierCurveTo(0.9, -0.9, 1.4, 0.1, 0, 0.9); g.closePath();
    if (halo !== false) { g.strokeStyle = AL_HALO; g.lineWidth = 0.7; g.stroke(); }
    g.fillStyle = fill; g.fill(); g.lineWidth = Math.max(0.05, edgeW / (s * u)); g.strokeStyle = AL_DARK; g.stroke(); g.restore();
  };
  const arc = (cx, cy, r, a0, a1, w, col) => { // a sound arc: pale under dark under nothing, thin
    g.beginPath(); g.arc(cx * u, cy * u, r * u, a0, a1); g.strokeStyle = AL_HALO; g.lineWidth = w + u * 0.3; g.stroke(); g.strokeStyle = col || AL_DARK; g.lineWidth = w; g.stroke();
  };
  const A0 = g.globalAlpha;

  if (kind === 'al_grind') { // a white terry sweatband with two green stripes; sweat flicks off, more of it the faster you swim
    line([[0.2, -0.95], [0.2, 0.95]], u * 0.6, '#ffffff', 1);
    line([[0.02, -0.9], [0.02, 0.9]], u * 0.1, '#2fbf71', 2); line([[0.38, -0.9], [0.38, 0.9]], u * 0.1, '#2fbf71', 2);
    const n = spd > 0.35 || act > 0.2 ? 4 : 3;
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
      const ph = (t * (1.1 + spd * 2.4 + act * 1.5) + i / n + (s > 0 ? 0.37 : 0)) % 1;
      g.globalAlpha = A0 * (1 - ph); dot(0.35 - ph * 1.7, s * (1.05 + ph * 1.5), 0.3 * (1 - ph * 0.4), '#9fdcff');
    }
    g.globalAlpha = A0;
  } else if (kind === 'al_coach') { // a call-in headset: navy band, white ear cups, a boom mic with an orange foam ball
    line([[-0.15, -1.05], [-0.25, 0], [-0.15, 1.05]], u * 0.3, '#2c3a55', 1);
    ell(-0.15, -1.1, 0.42, 0.62, 0, '#f4f6f8'); ell(-0.15, 1.1, 0.42, 0.62, 0, '#f4f6f8');
    line([[0.0, 1.45], [0.75, 1.75], [1.45, 1.35], [1.75, 0.65]], u * 0.17, '#2c3a55', 1);
    dot(1.78, 0.6, 0.34 + act * 0.1, '#ff9f1c');
    const sp = 0.4 + act; g.strokeStyle = '#ffd23f'; g.lineWidth = Math.max(1, u * 0.14);
    if (act > 0.08) for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.9; g.beginPath(); g.moveTo((1.78 + Math.cos(a) * 0.6) * u, (0.6 + Math.sin(a) * 0.6) * u); g.lineTo((1.78 + Math.cos(a) * (0.6 + sp)) * u, (0.6 + Math.sin(a) * (0.6 + sp)) * u); g.stroke(); }
  } else if (kind === 'al_crypto') { // laser eyes: they glow, and flare into two long red beams on every shot. A spinning coin trails behind.
    const flare = Math.max(act, 0.18 + 0.1 * Math.sin(t * 6));
    for (const s of [-1, 1]) {
      const gr = g.createRadialGradient(0.85 * u, s * 0.42 * u, 0, 0.85 * u, s * 0.42 * u, (0.5 + flare * 1.6) * u);
      gr.addColorStop(0, 'rgba(255,60,50,0.75)'); gr.addColorStop(1, 'rgba(255,60,50,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0.85 * u, s * 0.42 * u, (0.5 + flare * 1.6) * u, 0, PI * 2); g.fill();
    }
    if (act > 0.05) { const L = 3 + act * 5; for (const s of [-1, 1]) { line([[1.1, s * 0.42], [1.1 + L, s * 0.42]], u * (0.3 + act * 0.2), '#ff2e2e', 0); line([[1.1, s * 0.42], [1.1 + L, s * 0.42]], u * 0.1, '#ffffff', 2); } }
    for (const s of [-1, 1]) { ell(0.75, s * 0.42, 0.34, 0.28, 0, '#ffffff'); dot(0.88, s * 0.42, 0.17 + flare * 0.06, '#ff2e2e', '#7a0d0d'); }
    const cs = Math.cos(t * 3);
    g.save(); g.translate(-2.0 * u, -1.5 * u); g.rotate(-ang); // (the coin stays upright)
    g.beginPath(); g.ellipse(0, 0, Math.max(0.12, Math.abs(cs)) * 0.62 * u, 0.62 * u, 0, 0, PI * 2); g.fillStyle = '#f7b731'; g.fill(); g.lineWidth = edgeW; g.strokeStyle = AL_DARK; g.stroke();
    if (Math.abs(cs) > 0.45) { g.fillStyle = AL_DARK; g.font = '900 ' + Math.round(u * 0.85) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('B', 0, u * 0.04); }
    g.restore();
  } else if (kind === 'al_wing') { // a pair of gold pilot's wings pinned on, one on each side; they beat faster with speed
    const flap = Math.sin(t * (4 + spd * 9 + act * 6)) * 0.22;
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const phi = 0.25 + i * 0.3 + flap, L = 2.3 - i * 0.38, bx = 0.1, by = s * 0.92;
      line([[bx, by], [bx - Math.sin(phi) * L, by + s * Math.cos(phi) * L]], u * 0.42, i % 2 ? '#e8b535' : '#f7cf5a', 1);
    }
    dot(0.1, -0.88, 0.2, '#ffffff'); dot(0.1, 0.88, 0.2, '#ffffff');
  } else if (kind === 'al_situ') { // a phone held out front: a heart on the screen, a red notification dot, and typing dots that never finish
    line([[0.9, 0.6], [1.7, 0.85]], u * 0.34, '#f0b88e', 1);
    g.save(); g.translate(2.15 * u, 0.9 * u); g.rotate(0.28);
    const pw = 0.95, ph = 1.7; poly([[-pw / 2, -ph / 2], [pw / 2, -ph / 2], [pw / 2, ph / 2], [-pw / 2, ph / 2]], '#2b2f38');
    g.fillStyle = '#bfe3ff'; g.fillRect(-pw / 2 * u + u * 0.1, -ph / 2 * u + u * 0.18, (pw - 0.2) * u, (ph - 0.36) * u);
    g.restore();
    g.save(); g.translate(2.15 * u, 0.9 * u); g.rotate(0.28);
    heart(0, 0.05, 0.38 * (1 + 0.14 * Math.sin(t * 6 + act * 4)), '#ff4f87', 0, false);
    dot(0.5, -0.8, 0.2 + act * 0.1, '#ff3b30', '#ffffff'); g.restore();
    // the typing bubble, three dots that bounce in turn
    ell(1.6, -1.15, 0.8, 0.45, 0, '#ffffff');
    for (let i = 0; i < 3; i++) dot(1.25 + i * 0.35, -1.15 - Math.max(0, Math.sin(t * 6 - i * 0.9)) * 0.18, 0.1, AL_DARK, AL_DARK);
  } else if (kind === 'al_couple') { // a big heart on the head, small hearts that drift up off it (the twin wears one too)
    const beat = 1 + 0.12 * Math.max(Math.sin(t * 5), 0) + act * 0.2;
    heart(0.25, 0, 0.95 * beat, '#ff4f87', PI / 2);
    dot(0.55, -0.45, 0.14, '#ffd0e0', '#ffd0e0');
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.7 + i / 3) % 1; g.globalAlpha = A0 * Math.min(1, (1 - ph) * 1.6);
      heart(0.3 + Math.sin(ph * 6 + i * 2) * 0.5 - ph * 0.8, (i - 1) * 0.6 + (i === 1 ? 0 : (i - 1) * ph * 1.4), 0.3, '#ff8fb3');
    }
    g.globalAlpha = A0;
  } else if (kind === 'al_twinheart') { // (the twin's matching heart)
    heart(0.2, 0, 0.7 * (1 + 0.1 * Math.max(Math.sin(t * 5), 0)), '#ff4f87', PI / 2);
  } else if (kind === 'al_network') { // a teal lanyard round the neck and a name badge swinging behind
    const sw = Math.sin(t * 2.2 + spd) * 0.3 * (0.4 + spd);
    line([[0.0, -0.95], [-1.5, -0.35 + sw * 0.3], [-2.2, sw]], u * 0.26, '#1f7a8c', 1); line([[0.0, 0.95], [-1.5, 0.35 + sw * 0.3], [-2.2, sw]], u * 0.26, '#1f7a8c', 1);
    g.save(); g.translate(-3.3 * u, sw * u); g.rotate(sw * 0.4);
    const bw = 1.0, bh = 0.85; poly([[-bw, -bh], [bw, -bh], [bw, bh], [-bw, bh]], '#ffffff');
    g.fillStyle = '#e03a4e'; g.fillRect(bw * u * 0.45, -bh * u, bw * u * 0.55, bh * 2 * u); // (the red HELLO band)
    g.strokeStyle = AL_DARK; g.lineWidth = edgeW; g.strokeRect(-bw * u, -bh * u, bw * 2 * u, bh * 2 * u);
    g.beginPath(); g.arc(-0.35 * u, 0, 0.3 * u, 0, PI * 2); g.fillStyle = '#9aa7b4'; g.fill(); g.stroke();
    line([[-0.3, -0.62], [0.2, -0.62]], u * 0.12, AL_DARK, 2); line([[-0.3, 0.62], [0.2, 0.62]], u * 0.12, AL_DARK, 2);
    g.fillStyle = '#6b7480'; g.fillRect(bw * u - u * 0.05, -u * 0.18, u * 0.3, u * 0.36); g.restore();
  } else if (kind === 'al_cold') { // a telephone handset strapped across the head, a curly cord behind it, and the thing rings
    const jit = act > 0.1 ? Math.sin(t * 40) * 0.05 : Math.sin(t * 11) * 0.012; g.rotate(jit);
    const cord = []; for (let i = 0; i <= 22; i++) cord.push([0.2 - i * 0.2, 1.35 + Math.sin(i * 1.9 + t * 3) * 0.3 * Math.min(1, i / 4)]);
    line(cord, u * 0.13, '#2b2f38', 0);
    line([[0.5, -1.15], [1.05, -0.4], [1.05, 0.4], [0.5, 1.15]], u * 0.42, '#d63a3a', 1);
    ell(0.45, -1.15, 0.5, 0.42, 0, '#d63a3a'); ell(0.45, 1.15, 0.5, 0.42, 0, '#d63a3a');
    dot(0.45, -1.15, 0.12, '#2b2f38'); dot(0.45, 1.15, 0.12, '#2b2f38');
    for (let i = 0; i < 2; i++) { const ph = (t * 1.6 + i * 0.5 + act) % 1; g.globalAlpha = A0 * (1 - ph); arc(0.45, -1.15, 0.8 + ph * 1.3, -PI * 0.9, -PI * 0.1, u * 0.14, '#2b2f38'); }
    g.globalAlpha = A0;
  } else if (kind === 'al_influencer') { // a ring light round the head (halo, outline, warm white) with LEDs, and likes floating up
    const rx = 2.2, ry = 2.05, flash = act;
    const gr = g.createRadialGradient(0.1 * u, 0, 0.6 * u, 0.1 * u, 0, (rx + 0.7) * u);
    gr.addColorStop(0, 'rgba(255,246,214,0)'); gr.addColorStop(0.75, 'rgba(255,246,214,' + (0.3 + flash * 0.3) + ')'); gr.addColorStop(1, 'rgba(255,246,214,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0.1 * u, 0, (rx + 0.7) * u, 0, PI * 2); g.fill();
    g.beginPath(); g.ellipse(0.1 * u, 0, rx * u, ry * u, 0, 0, PI * 2);
    g.strokeStyle = AL_HALO; g.lineWidth = u * 0.95; g.stroke(); g.strokeStyle = AL_DARK; g.lineWidth = u * 0.62; g.stroke(); g.strokeStyle = '#fff6d6'; g.lineWidth = u * 0.4; g.stroke();
    for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2 + t * 0.4; g.globalAlpha = A0 * (0.55 + 0.45 * Math.sin(t * 5 + i)); dot(0.1 + Math.cos(a) * rx, Math.sin(a) * ry, 0.07, '#ffffff', '#ffffff'); }
    g.globalAlpha = A0;
    for (let i = 0; i < 2; i++) { const ph = (t * 0.55 + i * 0.5) % 1; g.globalAlpha = A0 * (1 - ph); heart(-0.3 - ph * 1.6, (i ? 1 : -1) * (2.5 + ph * 0.6), 0.34, '#ff4f87'); }
    g.globalAlpha = A0;
  } else if (kind === 'al_hottake') { // a megaphone out front: the bell kicks and sound arcs roll out of it
    const k = 1 + act * 0.16, sh = act > 0.2 ? Math.sin(t * 50) * 0.04 : 0;
    g.translate(0, sh * u);
    poly([[0.75, -0.62], [0.75, 0.62], [1.2, 0.62], [3.4 * k, 1.5 * k], [3.4 * k, -1.5 * k], [1.2, -0.62]], '#ff6b1a');
    line([[2.15, -0.95 * 1.0], [2.15, 0.95 * 1.0]], u * 0.28, '#ffffff', 2);
    ell(3.4 * k, 0, 0.3, 1.5 * k, 0, '#4a1f0a');
    poly([[1.55, 0.7], [2.0, 0.7], [2.0, 1.45], [1.55, 1.45]], '#2b2f38', null, false);
    for (let i = 0; i < 3; i++) { const ph = (t * (0.9 + act * 1.6) + i / 3) % 1; g.globalAlpha = A0 * (1 - ph); arc(3.4, 0, 0.9 + ph * 2.2, -0.75, 0.75, u * 0.16, AL_DARK); }
    g.globalAlpha = A0;
  } else if (kind === 'al_threehour') { // big headphones: a red band across the head, fat cups at both sides, a blinking REC dot, and a clock stuck at three
    line([[-0.05, -1.15], [0.1, 0], [-0.05, 1.15]], u * 0.42, '#d63a3a', 1);
    for (const s of [-1, 1]) { ell(-0.2, s * 1.3, 0.95, 0.5, 0, '#3a3f4a'); ell(-0.2, s * 1.05, 0.6, 0.2, 0, '#c2c7d0'); }
    if (Math.sin(t * 3.2) > -0.3 || act > 0.1) dot(-0.5, 1.35, 0.17, '#ff2e2e', '#7a0d0d');
    g.save(); g.translate(-2.5 * u, -1.9 * u); g.rotate(-ang);
    g.beginPath(); g.arc(0, 0, 0.95 * u, 0, PI * 2); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = AL_HALO; g.lineWidth = u * 0.36; g.stroke(); g.strokeStyle = AL_DARK; g.lineWidth = u * 0.17; g.stroke();
    g.strokeStyle = AL_DARK; g.lineCap = 'round'; g.lineWidth = u * 0.15; g.beginPath(); g.moveTo(0, 0); g.lineTo(0.5 * u, 0); g.stroke();
    const ma = -PI / 2 + t * 2.4; g.lineWidth = u * 0.11; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(ma) * 0.75 * u, Math.sin(ma) * 0.75 * u); g.stroke();
    for (const [cx, cy] of [[0, -0.78], [0.78, 0], [0, 0.78], [-0.78, 0]]) { g.beginPath(); g.arc(cx * u, cy * u, u * 0.06, 0, PI * 2); g.fillStyle = AL_DARK; g.fill(); }
    g.restore();
  } else if (kind === 'al_callin') { // a studio mic on a boom arm, a pop filter in front of it, and an ON AIR lamp
    line([[-1.5, 2.8], [0.2, 2.65], [1.6, 1.5]], u * 0.22, '#2b2f38', 1);
    line([[1.6, 1.5], [2.05, 0.95]], u * 0.18, '#2b2f38', 1);
    ell(2.35, 0.3, 0.58, 1.0, 0, '#454b57');
    g.strokeStyle = '#c2c7d0'; g.lineWidth = Math.max(1, u * 0.1); for (const yy of [-0.45, -0.1, 0.25, 0.6]) { g.beginPath(); g.moveTo(1.9 * u, (0.3 + yy) * u); g.lineTo(2.8 * u, (0.3 + yy) * u); g.stroke(); }
    g.beginPath(); g.ellipse(3.2 * u, 0.3 * u, 0.18 * u, 1.25 * u, 0, 0, PI * 2); g.strokeStyle = AL_HALO; g.lineWidth = u * 0.5; g.stroke(); g.strokeStyle = AL_DARK; g.lineWidth = u * 0.28; g.stroke(); g.strokeStyle = '#e8ebef'; g.lineWidth = u * 0.14; g.stroke();
    const on = act > 0.1 || Math.sin(t * 2.4) > 0;
    if (on) { const gr = g.createRadialGradient(1.6 * u, 1.5 * u, 0, 1.6 * u, 1.5 * u, 1.4 * u); gr.addColorStop(0, 'rgba(255,46,46,0.6)'); gr.addColorStop(1, 'rgba(255,46,46,0)'); g.fillStyle = gr; g.beginPath(); g.arc(1.6 * u, 1.5 * u, 1.4 * u, 0, PI * 2); g.fill(); }
    dot(1.6, 1.5, 0.3, on ? '#ff2e2e' : '#6b2a2a', on ? '#7a0d0d' : AL_DARK);
  }
  g.restore();
}

// ---------------------------------------------------------------- drawing: every other kind goes to the original
blDrawLook = (orig => function (g, kind, x, y, u, ang, t, o) {
  if (kind === 'al_twinheart' || AL_KINDS.includes(kind)) return alDrawLook(g, kind, x, y, u, ang, t, o);
  return orig.apply(this, arguments);
})(blDrawLook);

// ---------------------------------------------------------------- in the run
const alLetter = w => (w && w.up && w.up.p) || '';
blPick = (orig => function () {
  const base = orig.apply(this, arguments);
  if (sbrSample() !== 'alpha' || !G || !G.weapons) return base;
  let best = null, bt = -1;
  for (const w of G.weapons) {
    if (!w || w.isSpell || !w.def) continue;
    const map = AL_BY_WEAPON[w24Key(w)], k = map && map[alLetter(w)]; if (!k) continue;
    const ft = w.firedT || 0; if (ft >= bt) { bt = ft; best = { w, kind: k }; }
  }
  if (!best) return base;
  return base && (base.w.firedT || 0) > bt ? base : best; // (the hero weapon fired last wins, Baseline's included)
})(blPick);

// Power Couple: a small matching heart on the twin (the twin is drawn in toys.js; this just sits on top of it)
function alTwinHearts() {
  if (sbrSample() !== 'alpha' || !G || !G.weapons || !G.player) return;
  for (const w of G.weapons) {
    if (!w || w24Key(w) !== 's_twin' || alLetter(w) !== 'C' || !w.twins) continue;
    const k = S * (typeof playerScale === 'function' ? playerScale() : 1), face = (G.player.face || 0) + Math.PI;
    const raw = RAW_COL; RAW_COL = true; const ga = ctx.globalAlpha; ctx.globalAlpha = (G.oob ? 0.5 : 1) * 0.95;
    for (const t of w.twins) alDrawLook(ctx, 'al_twinheart', sx(t.x), sy(t.y), 7.5 * k * 1.1, face, G.realT, {});
    ctx.globalAlpha = ga; RAW_COL = raw;
  }
}
drawPlates = (orig => function (px, py) { orig(px, py); try { alTwinHearts(); } catch (e) { } })(drawPlates);
// baselinelook.js's in-run pass draws BL_WEAP[kind](k, t, o) on a canvas already at the head: Alpha's kinds answer there too.
for (const kind of AL_KINDS) BL_WEAP[kind] = (k, t, o) => alDrawLook(ctx, kind, k, 0, 7.5 * k, 0, t, o);

// ---------------------------------------------------------------- on the branch screens
// Lv 3 passes the card name; Lv 6 and 9 pass the branch letter. While the run is Alpha the letters read as the Alpha kind.
for (const [tbl, id] of [[RFV_FLAG, 'v_shock_beam'], [TWV_FLAG, 's_twin'], [UCV_FLAG, 's_tesla']]) {
  Object.assign(tbl, AL_BY_NAME);
  for (const l of ['A', 'B', 'C']) {
    let old = tbl[l];
    Object.defineProperty(tbl, l, { configurable: true, enumerable: true, get() { return sbrSample() === 'alpha' ? AL_BY_WEAPON[id][l] : old; }, set(v) { old = v; } });
  }
  const O = PV_OWN[id]; if (!O) continue;
  const has = pv => pv.F && AL_KINDS.find(k => pv.F.has(k));
  O.step = (orig => function (pv, dt) { // (the scenes put the sperm at the left edge, under the stage's arrow buttons: costume previews stand further in)
    if (orig) orig.apply(this, arguments);
    if (pv.me && has(pv)) { if (pv.me.x < 0.3) pv.me.x = 0.3; if (pv.home && pv.home.x < 0.3) pv.home.x = 0.3; }
  })(O.step);
  O.me = (orig => function (pv, g, hx, hy, hr, U) {
    if (orig) orig.apply(this, arguments);
    const kind = has(pv); if (!kind) return;
    if (pv.me && pv.me.x < 0.3) pv.me.x = 0.3;
    const act = Math.max(0, 1 - (pv.t - (pv.lastShot || -9)) / 0.3);
    alDrawLook(g, kind, hx, hy, hr * 1.2 * 1.25, pv.me.a || 0, pv.t, { act: pv.shotFlash || act, speed: 0.6 });
    if (kind === 'al_couple' && typeof twvTwins === 'function') for (const tw of twvTwins(pv)) alDrawLook(g, 'al_twinheart', tw.x * U, tw.y * U, hr * 1.2 * 1.1, (pv.me.a || 0) + Math.PI, pv.t, {}); // (the twin's matching heart)
  })(O.me);
}
