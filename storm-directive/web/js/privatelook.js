'use strict';
// Spawn Prawn - the Private Schooled costumes (PRIVATE_REDESIGN.md, Costumes). Same idea as betalook.js: one drawer for every costume,
// used twice, and it only shows while the run is played as Private Schooled (sbrSample() === 'private', i.e. G.s10.id).
//  - DRAWING: blDrawLook is wrapped (after betalook.js's wrap), so the nine pv_* kinds draw here and every other kind goes on to the
//    earlier wraps. Units: u = the head's half-length, +x forward, the frame turned to the sperm's heading. Every piece has a pale
//    halo under a dark outline, so it reads in Lab view (no colour) as well as Arcade view. act (0 to 1) pulses on firing, speed
//    (0 to 1) follows swim speed, hit (0 to 1) is a pulse after you are hurt (read live from G.player.flash unless the caller
//    passes o.hit). Reactive bits:
//      pv_spoon     a glint runs along the silver and flares on a shot
//      pv_trust     the watch swings on its chain and its second hand ticks
//      pv_takeover  the case swings; a paper pops from the lid on a shot
//      pv_network   the stripes ripple back like a scarf, faster at speed
//      pv_help      the cloche rattles on its tray on a shot and when you are hit
//      pv_legacy    a shine sweeps the crest, brighter on a shot
//      pv_nda       the wax seal is pressed (swells) on a shot
//      pv_hush      the banknote slides out of the envelope on a shot
//      pv_lawyers   the wig bounces and tilts when you are hit
//  - IN THE RUN: blPick is wrapped. In a Private Schooled run the three Private weapons map by branch letter (w.up.p) to a kind,
//    and the hero weapon fired last wins (against Baseline's pick as well). baselinelook.js's drawPlates wrap then draws it (blInRun).
//  - BRANCH SCREENS: the Acid Spit, Rent Free and Ewww, Gross stage previews. Their flag tables get a Proxy (PV_OWN flags) that,
//    while the run is Private Schooled, answers the card names (drafted names, then the Private set's own names) and the letters
//    A, B, C (Lv 6 and 9) with the pv_ kind. The previews' `me` and `step` are wrapped as betalook.js does.
// Hooks: wraps blDrawLook and blPick (baselinelook.js); registers BL_WEAP kinds; replaces the flags of PV_OWN for v_fire_proj,
// v_soul_proj, s_redtape with a Proxy and wraps their `me` and `step`. Loads after betalook.js.

const PV_KINDS = ['pv_spoon', 'pv_trust', 'pv_takeover', 'pv_network', 'pv_help', 'pv_legacy', 'pv_nda', 'pv_hush', 'pv_lawyers'];
const PV_BY_WEAPON = {
  v_fire_proj: { A: 'pv_spoon', B: 'pv_trust', C: 'pv_takeover' },
  v_soul_proj: { A: 'pv_network', B: 'pv_help', C: 'pv_legacy' },
  s_redtape: { A: 'pv_nda', B: 'pv_hush', C: 'pv_lawyers' } };
const PV_NAMES = { 'Silver Spoon': 'pv_spoon', 'Trust Fund': 'pv_trust', 'Hostile Takeover': 'pv_takeover',
  "Old Boys' Network": 'pv_network', 'The Help': 'pv_help', 'Legacy Admission': 'pv_legacy',
  NDA: 'pv_nda', 'Hush Money': 'pv_hush', "Daddy's Lawyers": 'pv_lawyers' }; // (the drafted Lv 3 names)
const PV_DARK = 'rgb(30,34,32)', PV_HALO = 'rgba(255,255,255,0.85)', PV_GOLD = '#e6b422', PV_GOLD_D = '#a87a10', PV_NAVY = '#1f2c55', PV_SILVER = '#dde3ea';

const pvOn = () => sbrSample() === 'private';
let pvHitT = -9; // (realT of the last hit seen, for the wig)
function pvHitNow() {
  if (!G || !G.player) return 0;
  const rt = G.realT || 0; if (G.player.flash > 0.15) pvHitT = rt;
  return Math.max(0, Math.min(1, 1 - (rt - pvHitT) / 0.5));
}

function pvDrawLook(g, kind, x, y, u, ang, t, o) {
  o = o || {}; const act = o.act || 0, spd = o.speed || 0, PI = Math.PI, TAU = PI * 2;
  const hit = o.hit != null ? o.hit : pvHitNow();
  g.save(); g.translate(x, y); g.rotate(ang); g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]);
  const path = pts => { g.beginPath(); g.moveTo(pts[0][0] * u, pts[0][1] * u); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] * u, pts[i][1] * u); };
  // style 0: pale halo then colour. 1: pale halo, dark outline, colour. 2: colour only.
  const line = (pts, w, col, style) => {
    path(pts);
    if (style !== 2) { g.strokeStyle = PV_HALO; g.lineWidth = w + u * (style === 1 ? 0.56 : 0.34); g.stroke(); }
    if (style === 1) { g.strokeStyle = PV_DARK; g.lineWidth = w + u * 0.24; g.stroke(); }
    g.strokeStyle = col; g.lineWidth = w; g.stroke();
  };
  const edgeW = Math.max(1, u * 0.16);
  const dot = (cx, cy, r, fill, edge) => { g.beginPath(); g.arc(cx * u, cy * u, r * u, 0, TAU); g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || PV_DARK; g.stroke(); };
  const poly = (pts, fill, edge, halo) => {
    path(pts); g.closePath();
    if (halo !== false) { g.strokeStyle = PV_HALO; g.lineWidth = u * 0.5; g.stroke(); }
    g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || PV_DARK; g.stroke();
  };
  const rrect = (cx, cy, w, h, r, fill, edge, halo) => { // a rounded rectangle centred on (cx, cy), in head units
    const X = (cx - w / 2) * u, Y = (cy - h / 2) * u, W = w * u, Hh = h * u, R = Math.min(r * u, W / 2, Hh / 2);
    g.beginPath(); g.moveTo(X + R, Y); g.lineTo(X + W - R, Y); g.quadraticCurveTo(X + W, Y, X + W, Y + R); g.lineTo(X + W, Y + Hh - R); g.quadraticCurveTo(X + W, Y + Hh, X + W - R, Y + Hh);
    g.lineTo(X + R, Y + Hh); g.quadraticCurveTo(X, Y + Hh, X, Y + Hh - R); g.lineTo(X, Y + R); g.quadraticCurveTo(X, Y, X + R, Y); g.closePath();
    if (halo !== false) { g.strokeStyle = PV_HALO; g.lineWidth = u * 0.5; g.stroke(); }
    g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || PV_DARK; g.stroke();
  };
  const ell = (cx, cy, rx, ry, rot, fill, edge, halo) => {
    g.beginPath(); g.ellipse(cx * u, cy * u, rx * u, ry * u, rot || 0, 0, TAU);
    if (halo !== false) { g.strokeStyle = PV_HALO; g.lineWidth = u * 0.5; g.stroke(); }
    g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || PV_DARK; g.stroke();
  };
  const star = (cx, cy, r, a) => { // a four-point glint
    if (a <= 0) return; g.save(); g.globalAlpha *= Math.min(1, a); g.fillStyle = '#ffffff'; g.strokeStyle = 'rgba(30,34,32,0.5)'; g.lineWidth = edgeW * 0.5;
    g.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.22 : r, aa = i * PI / 4; g.lineTo((cx + Math.cos(aa) * rr) * u, (cy + Math.sin(aa) * rr) * u); } g.closePath(); g.fill(); g.stroke(); g.restore();
  };
  const silver = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0 * u, y0 * u, x1 * u, y1 * u); gr.addColorStop(0, '#f6f9fc'); gr.addColorStop(0.45, '#b9c2cc'); gr.addColorStop(1, '#eef2f6'); return gr; };
  // a panel that stays upright on the screen, floated off the head along the screen's own up (dx, dy in head units, screen axes)
  const ua = o.upAng != null ? o.upAng : ang; // (the screen's tilt in the frame; the run draws inside an already turned context, so it passes the heading)
  const upright = (dx, dy, fn) => { g.save(); g.translate((dx * Math.cos(ua) + dy * Math.sin(ua)) * u, (-dx * Math.sin(ua) + dy * Math.cos(ua)) * u); g.rotate(-ua); fn(); g.restore(); };
  const A0 = g.globalAlpha;

  if (kind === 'pv_spoon') { // a silver spoon held in the mouth: the bowl at the lip, the handle out front, a glint that runs along the silver
    const sw = Math.sin(t * 2.5 + spd * 2) * 0.03 - act * 0.05, c = Math.cos(sw), s = Math.sin(sw), P = (a, b) => [a * c - b * s, a * s + b * c];
    const hnd = [[1.6, -0.22], [3.3, -0.3], [3.95, -0.5], [4.15, -0.2], [3.95, 0.1], [3.3, -0.02], [1.6, 0.22]].map(p => P(p[0], p[1]));
    poly(hnd, silver(1.5, -0.5, 3.9, 0.2)); // (the handle widens to a fiddle end)
    line([P(1.9, -0.06), P(3.5, -0.2)], u * 0.07, 'rgba(255,255,255,0.9)', 2);
    g.save(); g.translate(1.25 * u, 0); g.rotate(sw);
    ell(0, 0, 0.9, 0.64, 0, silver(-0.7, -0.6, 0.7, 0.6)); // (the bowl, with its dip)
    ell(0.05, 0.02, 0.64, 0.4, 0, '#c2ccd7', 'rgba(30,34,32,0.5)', false);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(-0.18 * u, -0.14 * u, 0.26 * u, 0.1 * u, -0.4, 0, TAU); g.fill();
    g.restore();
    const ph = (t * 0.6 + spd * 0.3) % 1; star(...P(1.5 + ph * 2.6, -0.25), 0.5, Math.sin(ph * PI) * 0.9 + act); // (the glint)
  } else if (kind === 'pv_trust') { // a pocket watch on a gold chain, hung upright from the head; the second hand ticks
    upright(0, 0, () => {
      const sw = Math.sin(t * 1.8 + spd * 2) * 0.06, wx = -0.2 + Math.sin(t * 1.8 + spd * 2) * 0.12, wy = 2.5;
      const ch = []; for (let i = 0; i <= 10; i++) { const f = i / 10; ch.push([0.45 + (wx - 0.45) * f + Math.sin(f * PI) * 0.45, 0.2 + (wy - 0.82 - 0.2) * f]); }
      line(ch, u * 0.16, PV_GOLD, 1); for (let i = 1; i < 10; i += 2) dot(ch[i][0], ch[i][1], 0.07, PV_GOLD_D, PV_GOLD_D);
      g.save(); g.translate(wx * u, wy * u); g.rotate(sw);
      rrect(0, -0.98, 0.42, 0.34, 0.08, PV_GOLD); // (the crown)
      g.beginPath(); g.arc(0, -1.1 * u, 0.24 * u, 0, TAU); g.strokeStyle = PV_GOLD_D; g.lineWidth = u * 0.1; g.stroke(); // (the bow)
      dot(0, 0, 0.86, PV_GOLD); dot(0, 0, 0.66, '#fbf6e4', PV_GOLD_D);
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12, l = i % 3 ? 0.07 : 0.16; line([[Math.sin(a) * (0.6 - l), -Math.cos(a) * (0.6 - l)], [Math.sin(a) * 0.6, -Math.cos(a) * 0.6]], u * (i % 3 ? 0.05 : 0.09), PV_DARK, 2); }
      const sa = Math.floor(t * 3) * (TAU / 24); // (the second hand clicks round)
      line([[0, 0], [Math.sin(-1.1) * 0.35, -Math.cos(-1.1) * 0.35]], u * 0.1, PV_DARK, 2);
      line([[0, 0], [Math.sin(0.6) * 0.5, -Math.cos(0.6) * 0.5]], u * 0.07, PV_DARK, 2);
      line([[-Math.sin(sa) * 0.12, Math.cos(sa) * 0.12], [Math.sin(sa) * 0.55, -Math.cos(sa) * 0.55]], u * 0.05, '#c1121f', 2);
      dot(0, 0, 0.08, PV_GOLD_D);
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(-0.42 * u, -0.42 * u, 0.2 * u, 0.09 * u, -0.8, 0, TAU); g.fill();
      if (act > 0.1) star(0.5, -0.5, 0.5, act);
      g.restore();
    });
  } else if (kind === 'pv_takeover') { // a briefcase carried off the flank on a strap, gold clasps, a paper that pops out on a shot
    const sw = Math.sin(t * 2.6 + spd * 2) * 0.07, pop = Math.max(act, 0);
    line([[-0.3, 0.7], [-0.6, 1.4], [-1.0, 1.75]], u * 0.17, '#4a3226', 1); line([[0.4, 0.7], [0.1, 1.4], [-0.3, 1.75]], u * 0.17, '#4a3226', 1); // (the strap)
    g.save(); g.translate(-0.8 * u, 2.9 * u); g.rotate(sw);
    line([[-0.65, -0.85], [-0.65, -1.35], [0.65, -1.35], [0.65, -0.85]], u * 0.2, '#4a3226', 1); // (the handle, towards the head)
    g.save(); g.translate(0, -pop * 0.35 * u); g.rotate(-0.08 * pop); rrect(0.25, -0.95, 0.95, 0.9, 0.05, '#fbfbf4'); g.fillStyle = '#9aa5b1'; for (let i = 0; i < 3; i++) g.fillRect(-0.0 * u, (-1.15 + i * 0.22) * u, 0.5 * u, 0.07 * u); g.restore(); // (the paper)
    rrect(0, 0, 2.8, 1.9, 0.25, '#5a3b2b'); rrect(0, -0.5, 2.8, 0.85, 0.25, '#6e4a37', PV_DARK, false); // (the case, its lid)
    line([[-1.2, 0.05], [1.2, 0.05]], u * 0.07, '#2b1c14', 2);
    for (const sx of [-0.8, 0.8]) { rrect(sx, 0.05, 0.42, 0.34, 0.06, PV_GOLD, PV_GOLD_D, false); dot(sx, 0.05, 0.06, PV_GOLD_D, PV_GOLD_D); }
    for (const cx of [-1.15, 1.15]) for (const cy of [-0.7, 0.7]) dot(cx, cy, 0.06, PV_GOLD, PV_GOLD_D);
    g.restore();
  } else if (kind === 'pv_network') { // a striped old school tie round the neck, streaming back like a scarf
    const n = 14, pts = [], wd = [], fl = 0.22 + spd * 0.25, ph = t * (3 + spd * 4);
    for (let i = 0; i <= n; i++) { const f = i / n, off = Math.sin(ph - f * 5) * fl * f; pts.push([-0.95 - f * 3.9, off]); wd.push(f < 0.15 ? 0.3 : f < 0.9 ? 0.3 + (f - 0.15) * 1.5 : Math.max(0.02, (1 - f) * 11)); }
    const edge = []; for (let i = 0; i <= n; i++) edge.push([pts[i][0], pts[i][1] - wd[i] / 2]); for (let i = n; i >= 0; i--) edge.push([pts[i][0], pts[i][1] + wd[i] / 2]);
    path(edge); g.closePath(); g.strokeStyle = PV_HALO; g.lineWidth = u * 0.5; g.stroke();
    for (let i = 0; i < n; i++) { // (diagonal stripes, slice by slice)
      const a = pts[i], b = pts[i + 1], wa = wd[i] / 2, wb = wd[i + 1] / 2;
      g.beginPath(); g.moveTo(a[0] * u, (a[1] - wa) * u); g.lineTo(b[0] * u, (b[1] - wb) * u); g.lineTo(b[0] * u, (b[1] + wb) * u); g.lineTo(a[0] * u, (a[1] + wa) * u); g.closePath();
      g.fillStyle = i % 4 === 0 ? PV_GOLD : i % 4 === 2 ? '#f4efe2' : PV_NAVY; g.fill(); g.strokeStyle = g.fillStyle; g.lineWidth = 0.6; g.stroke();
    }
    path(edge); g.closePath(); g.lineWidth = edgeW; g.strokeStyle = PV_DARK; g.stroke();
    poly([[-0.75, -0.3], [-1.15, -0.4], [-1.25, 0], [-1.15, 0.4], [-0.75, 0.3]], PV_NAVY); // (the knot)
    line([[-0.9, -0.2], [-1.0, 0.2]], u * 0.07, PV_GOLD, 2);
  } else if (kind === 'pv_help') { // a butler's bow tie at the neck; a gloved hand holds a silver tray and cloche over the head
    const bt = 0.12 * Math.sin(t * 3 + spd);
    poly([[-0.95, 0], [-2.0, -0.85 + bt], [-2.0, 0.85 - bt]], '#22222c'); // (the bow tie, wings back)
    poly([[-0.95, 0], [-1.9, -0.2], [-1.9, 0.2]], '#3a3a48', PV_DARK, false);
    dot(-0.95, 0, 0.22, '#22222c', PV_DARK);
    upright(0.1, -3.0, () => {
      const rat = (act + hit) > 0.05 ? Math.sin(t * 38) * 0.07 * Math.min(1, act + hit) : 0;
      line([[0, 0.1], [0, 2.45]], u * 0.22, '#f4f6f8', 1); // (the arm, ending in a white glove)
      dot(0, 0.45, 0.34, '#ffffff');
      g.save(); g.translate(rat * u, -Math.abs(rat) * 0.6 * u);
      g.beginPath(); g.arc(0, -0.2 * u, 1.05 * u, PI, TAU); g.closePath(); g.strokeStyle = PV_HALO; g.lineWidth = u * 0.5; g.stroke(); g.fillStyle = silver(-1, -1.2, 1, -0.2); g.fill(); g.lineWidth = edgeW; g.strokeStyle = PV_DARK; g.stroke(); // (the cloche)
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(-0.45 * u, -0.78 * u, 0.28 * u, 0.1 * u, -0.7, 0, TAU); g.fill();
      dot(0, -1.42, 0.17, PV_SILVER);
      g.restore();
      rrect(0, -0.04, 3.1, 0.3, 0.14, silver(-1.5, -0.2, 1.5, 0.1)); // (the tray)
    });
  } else if (kind === 'pv_legacy') { // a blazer breast pocket with the family crest on it; a shine sweeps the crest
    upright(-0.3, 0, () => {
      g.scale(1.3, 1.3);
      poly([[-0.85, -0.7], [0.85, -0.7], [0.85, 0.35], [0, 0.85], [-0.85, 0.35]], PV_NAVY); // (the pocket)
      g.fillStyle = '#2e3f78'; g.fillRect(-0.85 * u, -0.7 * u, 1.7 * u, 0.26 * u); g.strokeStyle = PV_DARK; g.lineWidth = edgeW; g.strokeRect(-0.85 * u, -0.7 * u, 1.7 * u, 0.26 * u); // (the welt)
      line([[-0.7, -0.3], [-0.7, 0.3], [0, 0.7], [0.7, 0.3], [0.7, -0.3]], u * 0.06, PV_GOLD, 2); // (gold piping)
      const gl = Math.max(0, act);
      poly([[-0.42, -0.28], [0.42, -0.28], [0.42, 0.14], [0, 0.6], [-0.42, 0.14]], gl > 0.3 ? '#a02339' : '#7a1626', PV_GOLD, false); // (the shield)
      line([[-0.3, 0.05], [0, -0.1], [0.3, 0.05]], u * 0.1, PV_GOLD, 2); // (a chevron)
      dot(0, 0.27, 0.09, PV_GOLD, PV_GOLD_D);
      line([[-0.28, -0.17], [-0.12, -0.17]], u * 0.07, PV_GOLD, 2); line([[0.12, -0.17], [0.28, -0.17]], u * 0.07, PV_GOLD, 2);
      const sh = ((t * 0.5) % 1.8) - 0.4; // (the shine, a diagonal band)
      if (sh > -0.3 && sh < 1.1 || gl > 0.1) { g.save(); path([[-0.42, -0.28], [0.42, -0.28], [0.42, 0.14], [0, 0.6], [-0.42, 0.14]]); g.clip(); g.globalAlpha = A0 * (0.55 + gl * 0.4); g.fillStyle = '#ffffff'; const bx = (-0.5 + sh * 1.0) * u; g.beginPath(); g.moveTo(bx, -0.4 * u); g.lineTo(bx + 0.22 * u, -0.4 * u); g.lineTo(bx + 0.02 * u, 0.7 * u); g.lineTo(bx - 0.2 * u, 0.7 * u); g.closePath(); g.fill(); g.restore(); }
    });
  } else if (kind === 'pv_nda') { // a cream band sealed with a red wax seal across the head, tails trailing; the seal is pressed on a shot
    const fl = Math.sin(t * 3 + spd * 3) * 0.12, pr = 1 + act * 0.25;
    for (const s of [-1, 1]) poly([[0.1, -0.2 * s], [0.1, 0.2 * s], [-1.9, s * 1.0 + fl * s + 0.3], [-1.5, s * 0.45 + fl * s + 0.3], [-1.6, s * 0.2 + fl * s]], '#f3ead2'); // (the ribbon tails)
    rrect(0.15, 0, 0.95, 2.6, 0.14, '#f3ead2'); // (the band round the head)
    line([[0.15, -1.0], [0.15, 1.0]], u * 0.05, '#cfc3a2', 2);
    g.save(); g.translate(0.15 * u, 0); g.scale(pr, pr);
    g.beginPath(); for (let i = 0; i < 24; i++) { const a = i * TAU / 24, r = 0.78 + Math.sin(i * 2.3) * 0.04 + Math.sin(a * 3 + 1) * 0.03; g.lineTo(Math.cos(a) * r * u, Math.sin(a) * r * u); } g.closePath();
    g.strokeStyle = PV_HALO; g.lineWidth = u * 0.5; g.stroke(); g.fillStyle = '#c4161f'; g.fill(); g.lineWidth = edgeW; g.strokeStyle = PV_DARK; g.stroke();
    g.beginPath(); g.arc(0, 0, 0.56 * u, 0, TAU); g.strokeStyle = '#8c0d16'; g.lineWidth = u * 0.1; g.stroke();
    g.fillStyle = '#e8575a'; g.beginPath(); g.ellipse(-0.26 * u, -0.28 * u, 0.15 * u, 0.07 * u, -0.7, 0, TAU); g.fill();
    g.fillStyle = '#8c0d16'; g.fillRect(-0.2 * u, -0.02 * u, 0.4 * u, 0.3 * u); g.beginPath(); g.arc(0, -0.04 * u, 0.15 * u, PI, TAU); g.lineWidth = u * 0.07; g.strokeStyle = '#8c0d16'; g.stroke(); // (a padlock, embossed)
    g.restore();
    dot(0.15, 1.0, 0.14, '#c4161f'); // (a drip off the seal)
  } else if (kind === 'pv_hush') { // a brown envelope carried off the flank on a string, a banknote sliding out on a shot
    const sw = Math.sin(t * 2.3 + spd * 2) * 0.06, slide = 0.2 + act * 0.6 + Math.sin(t * 2) * 0.05;
    line([[-0.2, 0.7], [-0.5, 1.3], [-0.9, 1.7]], u * 0.1, '#7a5a38', 1);
    g.save(); g.translate(-1.0 * u, 2.7 * u); g.rotate(sw - 0.1);
    g.save(); g.translate(0, -slide * u); rrect(0.15, -0.55, 1.35, 1.0, 0.1, '#8fc47f'); ell(0.15, -0.55, 0.22, 0.22, 0, '#b9e0ac', 'rgba(30,34,32,0.5)', false); line([[-0.4, -0.95], [0.7, -0.95]], u * 0.06, '#4d8a43', 2); g.restore(); // (the cash)
    rrect(0, 0, 2.7, 1.8, 0.1, '#c8975a');
    g.beginPath(); g.moveTo(-1.35 * u, -0.9 * u); g.lineTo(0, 0.05 * u); g.lineTo(1.35 * u, -0.9 * u); g.strokeStyle = PV_DARK; g.lineWidth = edgeW; g.stroke(); // (the flap)
    poly([[-1.3, -0.88], [0, 0.0], [1.3, -0.88]], '#d9ae72', PV_DARK, false);
    g.beginPath(); g.moveTo(-1.35 * u, 0.9 * u); g.lineTo(-0.3 * u, 0.1 * u); g.moveTo(1.35 * u, 0.9 * u); g.lineTo(0.3 * u, 0.1 * u); g.strokeStyle = 'rgba(30,34,32,0.55)'; g.lineWidth = edgeW * 0.7; g.stroke();
    dot(0, 0.02, 0.13, '#a8793e'); // (the brad)
    g.restore();
  } else if (kind === 'pv_lawyers') { // a barrister's wig of rolled curls over the head and two buckle tails behind; it bounces and tilts when you are hit
    const lift = hit * 0.7, wob = Math.sin(t * 40) * hit * 0.2;
    upright(0, -lift, () => {
      g.rotate(ua + wob);
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) dot(-1.55 - i * 0.28, s * (0.62 + i * 0.04), 0.34, '#f1ecdd'); // (the tails: stacks of buckles)
      ell(-0.15, 0, 1.35, 1.12, 0, '#f1ecdd');
      for (const [cx, h] of [[0.6, 1.5], [0.0, 1.9], [-0.6, 1.7]]) { // (rolled curls across the dome)
        rrect(cx, 0, 0.5, h, 0.22, '#faf7ee', PV_DARK, false);
        line([[cx - 0.08, -h / 2 + 0.3], [cx - 0.08, h / 2 - 0.3]], u * 0.05, 'rgba(30,34,32,0.45)', 2);
      }
    });
  }
  g.restore();
}

// ---------------------------------------------------------------- drawing: every other kind goes to the earlier wraps
blDrawLook = (orig => function (g, kind, x, y, u, ang, t, o) {
  if (PV_KINDS.includes(kind)) return pvDrawLook(g, kind, x, y, u, ang, t, o);
  return orig.apply(this, arguments);
})(blDrawLook);

// ---------------------------------------------------------------- in the run
// baselinelook.js's blInRun calls BL_WEAP[kind](k, t, o) on the global ctx, already at the body, turned to the heading (k = the body
// scale in pixels, o = blState's act). Same adapter as betalook.js's, plus the heading so the upright pieces stay upright.
function pvWeap(kind) {
  return (k, t, o) => {
    const pl = G && G.player, face = pl ? (pl.hd != null ? pl.hd : pl.face || 0) + (pl.yaw || 0) : 0;
    pvDrawLook(ctx, kind, k, 0, 7.5 * k, 0, t, Object.assign({}, o, { upAng: face }));
  };
}
if (typeof BL_WEAP !== 'undefined') for (const kind of PV_KINDS) BL_WEAP[kind] = pvWeap(kind);
const pvLetter = w => (w && w.up && w.up.p) || '';
blPick = (orig => function () {
  const base = orig.apply(this, arguments);
  if (!pvOn() || !G || !G.weapons) return base;
  let best = null, bt = -1;
  for (const w of G.weapons) {
    if (!w || w.isSpell || !w.def) continue;
    const map = PV_BY_WEAPON[w24Key(w)], k = map && map[pvLetter(w)]; if (!k) continue;
    const ft = w.firedT || 0; if (ft >= bt) { bt = ft; best = { w, kind: k }; }
  }
  if (!best) return base;
  return base && (base.w.firedT || 0) > bt ? base : best; // (the hero weapon fired last wins, Baseline's included)
})(blPick);

// ---------------------------------------------------------------- on the branch screens
// Lv 3 passes the card name; Lv 6 and 9 pass the branch letter. While the run is Private Schooled both read as the pv_ kind. The
// tables are shared by the older scenes, so PV_OWN gets a Proxy over them and the other samples keep exactly what they had.
function pvNameKind(id, name) {
  if (PV_NAMES[name] && Object.values(PV_BY_WEAPON[id]).includes(PV_NAMES[name])) return PV_NAMES[name];
  let spec = null; try { spec = wupSpecFor(id, 'private'); } catch (e) { }
  if (spec) for (const l of ['A', 'B', 'C']) if (spec[l] && spec[l].name === name) return PV_BY_WEAPON[id][l];
  return null;
}
for (const id of Object.keys(PV_BY_WEAPON)) {
  const O = PV_OWN[id]; if (!O) continue;
  if (O.flags) O.flags = new Proxy(O.flags, { get(tbl, k, rcv) {
    if (typeof k === 'string' && pvOn()) { if (PV_BY_WEAPON[id][k]) return PV_BY_WEAPON[id][k]; const pk = pvNameKind(id, k); if (pk) return pk; }
    return Reflect.get(tbl, k, rcv);
  } });
  const has = pv => pv.F && PV_KINDS.find(k => pv.F.has(k));
  O.step = (orig => function (pv, dt) { // (costume previews stand clear of the stage's arrow buttons)
    if (orig) orig.apply(this, arguments);
    if (pv.me && has(pv)) { if (pv.me.x < 0.3) pv.me.x = 0.3; if (pv.home && pv.home.x < 0.3) pv.home.x = 0.3; }
  })(O.step);
  O.me = (orig => function (pv, g, hx, hy, hr, U) {
    if (orig) orig.apply(this, arguments);
    const kind = has(pv); if (!kind) return;
    if (pv.me && pv.me.x < 0.3) pv.me.x = 0.3;
    const act = Math.max(0, 1 - (pv.t - (pv.lastShot || -9)) / 0.3);
    const hit = Math.max(0, 1 - ((pv.t % 4) / 0.5)); // (the stage has no health: the wig is "hit" every 4 s so the bounce shows)
    pvDrawLook(g, kind, hx, hy, hr * 1.2 * 1.25, pv.me.a || 0, pv.t, { act: pv.shotFlash || act, speed: 0.6, hit });
  })(O.me);
}
