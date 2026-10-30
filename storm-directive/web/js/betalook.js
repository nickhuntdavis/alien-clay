'use strict';
// Spawn Prawn - the Beta costumes (BETA_REDESIGN.md, Costumes). Same idea as alphalook.js: one drawer for every costume, used
// twice, and it only shows while the run is played as Beta (sbrSample() === 'beta', i.e. G.s10.id).
//  - DRAWING: blDrawLook is wrapped (after alphalook.js's wrap), so the nine be_* kinds draw here and every other kind goes on to the
//    earlier wraps. Units: u = the head's half-length, +x forward, the frame turned to the sperm's heading. Every piece has a pale
//    halo under a dark outline, so it reads in Lab view (no colour) as well as Arcade view. act (0 to 1) pulses on firing, speed
//    (0 to 1) follows swim speed. Reactive bits (read live from G unless the caller passes o.hpf / o.vials):
//      be_draw      the vials fill as the slot's vial count climbs (any `vials` number on the slot or its state objects; no count, no fill)
//      be_flatline  the monitor beats; when low (G.player.hp < G.P.maxHp * 0.4) the trace goes flat and red
//      be_triage    the tag is green, amber, then red by your health
//      be_adren     the plunger is pushed in as health falls, and the needle tip glows once low
//  - IN THE RUN: blPick is wrapped. In a Beta run the Beta weapons map by branch letter (w.up.p) to a kind, and the hero weapon
//    fired last wins (against Baseline's pick as well). baselinelook.js's drawPlates wrap then draws it (blInRun).
//  - BRANCH SCREENS: the Little Prick, One of These Days and Sister Cousin stage previews. Their flag tables get a Proxy (PV_OWN
//    flags) that, while the run is Beta, answers the Beta card names (read from the Beta set, drafted names as a fallback) and the
//    letters A, B, C (Lv 6 and 9) with the Beta kind. The previews' `me` and `step` are wrapped as alphalook.js does.
// Hooks: wraps blDrawLook and blPick (baselinelook.js); replaces the flags of PV_OWN for v_arcane_proj, s_duedate, s_seeker with a
// Proxy and wraps their `me` and `step`. Loads after alphalook.js.

const BE_KINDS = ['be_iv', 'be_adren', 'be_draw', 'be_flatline', 'be_dnr', 'be_triage', 'be_kin', 'be_donor', 'be_transfusion'];
const BE_BY_WEAPON = {
  v_arcane_proj: { A: 'be_iv', B: 'be_adren', C: 'be_draw' },
  s_duedate: { A: 'be_flatline', B: 'be_dnr', C: 'be_triage' },
  s_seeker: { A: 'be_kin', B: 'be_donor', C: 'be_transfusion' } };
const BE_NAMES = { 'IV Drip': 'be_iv', 'Adrenaline Shot': 'be_adren', 'Blood Draw': 'be_draw', Flatline: 'be_flatline', DNR: 'be_dnr', Triage: 'be_triage',
  'Next of Kin': 'be_kin', 'Organ Donor': 'be_donor', Transfusion: 'be_transfusion' }; // (the drafted Lv 3 names)
const BE_DARK = 'rgb(30,34,32)', BE_HALO = 'rgba(255,255,255,0.85)', BE_RED = '#c1121f', BE_LOW = 0.4;

const beOn = () => sbrSample() === 'beta';
const beHpf = () => (G && G.player && G.P && G.P.maxHp > 0) ? Math.max(0, Math.min(1, G.player.hp / G.P.maxHp)) : 1;
const beLow = hpf => hpf < BE_LOW;
// the hero slot's vial count: the first numeric `vials` on the slot or on a state object hung off it (beta1.js keeps its own)
function beVials(w) {
  if (!w) return null;
  const pick = o => (o && typeof o.vials === 'number' && isFinite(o.vials)) ? o.vials : null;
  let v = pick(w); if (v != null) return v;
  for (const k in w) { if (k === 'def' || k === 's' || k === 'uh' || k === 'up') continue; const o = w[k]; if (o && typeof o === 'object' && !Array.isArray(o)) { v = pick(o); if (v != null) return v; } }
  return null;
}
const beSlot = (key, letter) => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === key && w.up && w.up.p === letter) : null);

function beDrawLook(g, kind, x, y, u, ang, t, o) {
  o = o || {}; const act = o.act || 0, spd = o.speed || 0, PI = Math.PI;
  const hpf = o.hpf != null ? o.hpf : beHpf(), low = beLow(hpf);
  g.save(); g.translate(x, y); g.rotate(ang); g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([]);
  const path = pts => { g.beginPath(); g.moveTo(pts[0][0] * u, pts[0][1] * u); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] * u, pts[i][1] * u); };
  // style 0: pale halo then colour. 1: pale halo, dark outline, colour. 2: colour only.
  const line = (pts, w, col, style) => {
    path(pts);
    if (style !== 2) { g.strokeStyle = BE_HALO; g.lineWidth = w + u * (style === 1 ? 0.56 : 0.34); g.stroke(); }
    if (style === 1) { g.strokeStyle = BE_DARK; g.lineWidth = w + u * 0.24; g.stroke(); }
    g.strokeStyle = col; g.lineWidth = w; g.stroke();
  };
  const edgeW = Math.max(1, u * 0.16);
  const dot = (cx, cy, r, fill, edge) => { g.beginPath(); g.arc(cx * u, cy * u, r * u, 0, PI * 2); g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || BE_DARK; g.stroke(); };
  const poly = (pts, fill, edge, halo) => {
    path(pts); g.closePath();
    if (halo !== false) { g.strokeStyle = BE_HALO; g.lineWidth = u * 0.5; g.stroke(); }
    g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || BE_DARK; g.stroke();
  };
  const rrect = (cx, cy, w, h, r, fill, edge, halo) => { // a rounded rectangle centred on (cx, cy), in head units
    const X = (cx - w / 2) * u, Y = (cy - h / 2) * u, W = w * u, Hh = h * u, R = Math.min(r * u, W / 2, Hh / 2);
    g.beginPath(); g.moveTo(X + R, Y); g.lineTo(X + W - R, Y); g.quadraticCurveTo(X + W, Y, X + W, Y + R); g.lineTo(X + W, Y + Hh - R); g.quadraticCurveTo(X + W, Y + Hh, X + W - R, Y + Hh);
    g.lineTo(X + R, Y + Hh); g.quadraticCurveTo(X, Y + Hh, X, Y + Hh - R); g.lineTo(X, Y + R); g.quadraticCurveTo(X, Y, X + R, Y); g.closePath();
    if (halo !== false) { g.strokeStyle = BE_HALO; g.lineWidth = u * 0.5; g.stroke(); }
    g.fillStyle = fill; g.fill(); g.lineWidth = edgeW; g.strokeStyle = edge || BE_DARK; g.stroke();
  };
  const cross = (cx, cy, s, col) => { g.fillStyle = col; g.fillRect((cx - s * 0.5) * u, (cy - s * 0.17) * u, s * u, s * 0.34 * u); g.fillRect((cx - s * 0.17) * u, (cy - s * 0.5) * u, s * 0.34 * u, s * u); };
  const A0 = g.globalAlpha;
  // a panel that stays upright on the screen, floated off the head along the screen's own up (dx, dy in head units, screen axes)
  const ua = o.upAng != null ? o.upAng : ang; // (the screen's tilt in the frame; the run draws inside an already turned context, so it passes the heading)
  const upright = (dx, dy, fn) => { g.save(); g.translate((dx * Math.cos(ua) + dy * Math.sin(ua)) * u, (-dx * Math.sin(ua) + dy * Math.cos(ua)) * u); g.rotate(-ua); fn(); g.restore(); };

  if (kind === 'be_iv') { // a saline bag hung on a little pole behind the head, a clear tube to the head, a drop that never quite falls
    const sw = Math.sin(t * 2 + spd * 3) * 0.06;
    line([[-1.9, -3.4], [-1.9, 0.2]], u * 0.16, '#6b7480', 1); line([[-2.7, -3.4], [-1.1, -3.4]], u * 0.16, '#6b7480', 1); line([[-2.6, 0.2], [-1.2, 0.2]], u * 0.16, '#6b7480', 1);
    g.save(); g.translate(-1.9 * u, -2.5 * u); g.rotate(sw);
    rrect(0, 0, 1.5, 1.9, 0.45, '#dff3ff'); // (the bag, with its level of fluid and a red cross)
    const lvl = low ? 0.45 : 0.65; g.fillStyle = '#7cc6ee'; g.fillRect(-0.62 * u, (0.9 - lvl * 1.7) * u, 1.24 * u, lvl * 1.7 * u - 0.1 * u);
    rrect(0, 0, 1.5, 1.9, 0.45, 'rgba(255,255,255,0)', BE_DARK, false); cross(0, -0.15, 0.7, BE_RED);
    dot(0, 1.05, 0.2, '#dff3ff'); g.restore();
    const ph = (t * (0.9 + act * 2)) % 1; // (the drip falls in the chamber)
    g.globalAlpha = A0 * (1 - ph * 0.6); dot(-1.9, -1.35 + ph * 0.55, 0.12, '#7cc6ee'); g.globalAlpha = A0;
    line([[-1.9, -1.4], [-1.9, -0.7], [-1.2, -0.45], [-0.3, -0.4], [0.35, -0.55]], u * 0.17, '#bfe6fb', 1);
    dot(0.45, -0.58, 0.2, '#ffffff'); // (the cannula)
  } else if (kind === 'be_adren') { // a big syringe strapped on along the side, orange adrenaline in it, the needle out front
    const push = low ? 0.55 : Math.min(0.5, (1 - hpf) * 0.8) + act * 0.25; // (the plunger goes in as you lose health)
    const px = -1.5 - 0.0, f0 = -1.3 + push * 1.2;
    line([[px - push * 1.2, 1.35], [f0 - 0.2, 1.35]], u * 0.16, '#6b7480', 1); // (the plunger rod, then its thumb rest)
    line([[px - push * 1.2 - 0.05, 0.85], [px - push * 1.2 - 0.05, 1.85]], u * 0.22, '#6b7480', 1);
    line([[-1.5, 1.35], [0.8, 1.35]], u * 0.8, '#f4f6f8', 1);
    line([[f0, 1.35], [0.65, 1.35]], u * 0.46, '#ff9f1c', 2);
    for (let i = 0; i < 4; i++) line([[-1.1 + i * 0.5, 1.1], [-1.1 + i * 0.5, 1.2]], u * 0.07, BE_DARK, 2);
    line([[0.8, 1.35], [1.0, 1.35]], u * 0.34, '#c2c7d0', 1);
    line([[1.0, 1.35], [2.9, 1.35]], u * 0.1, '#c2c7d0', 1);
    line([[-0.9, 1.9], [-0.9, 0.9]], u * 0.14, BE_RED, 1); line([[0.3, 1.9], [0.3, 0.9]], u * 0.14, BE_RED, 1); // (the straps, short: the head stays clear)
    if (low || act > 0.1) {
      const gl = 0.55 + 0.45 * Math.sin(t * 9), gr = g.createRadialGradient(2.9 * u, 1.35 * u, 0, 2.9 * u, 1.35 * u, 0.9 * u);
      gr.addColorStop(0, 'rgba(255,159,28,' + (0.9 * gl) + ')'); gr.addColorStop(1, 'rgba(255,159,28,0)'); g.fillStyle = gr; g.beginPath(); g.arc(2.9 * u, 1.35 * u, 0.9 * u, 0, PI * 2); g.fill();
    }
  } else if (kind === 'be_draw') { // a bandolier of five blood vials across the head; they fill with the vial count (no count, no fill)
    const vc = o.vials !== undefined ? o.vials : beVials(beSlot('v_arcane_proj', 'C')), tot = vc == null ? 0 : Math.max(0, Math.min(10, vc)) / 10 * 5;
    line([[-0.25, -1.65], [-0.25, 1.65]], u * 0.34, '#4a3b32', 1);
    for (let i = 0; i < 5; i++) {
      const yy = -1.2 + i * 0.6, fill = vc == null ? 0.45 : Math.max(0, Math.min(1, tot - i));
      line([[-0.8, yy], [0.55, yy]], u * 0.5, '#f4f6f8', 1);
      if (fill > 0) line([[-0.8, yy], [-0.8 + 1.35 * fill, yy]], u * 0.3, fill >= 1 ? BE_RED : '#e0364a', 2);
      dot(0.75, yy, 0.2, '#4a3b32');
    }
    if (vc != null && vc >= 10) { g.globalAlpha = A0 * (0.5 + 0.5 * Math.sin(t * 8)); g.beginPath(); g.arc(0, 0, 1.9 * u, 0, PI * 2); g.strokeStyle = BE_RED; g.lineWidth = edgeW * 1.5; g.stroke(); g.globalAlpha = A0; }
  } else if (kind === 'be_flatline') { // a heart monitor floating over the head: a beating trace, flat and red when you are low
    line([[0, -0.5], [0, -1.6]], u * 0.1, BE_DARK, 0); // (the lead; short, the monitor floats clear of the head)
    upright(0, -3.5, () => {
      const pw = 3.6, ph = 1.9;
      rrect(0, 0, pw, ph, 0.3, low ? '#2a1517' : '#13261c');
      const pts = [], n = 36, sc = (t * (1.1 + spd * 0.6)) % 1;
      for (let i = 0; i <= n; i++) {
        const xx = -pw / 2 + 0.22 + (pw - 0.44) * i / n; let yy = 0;
        if (!low) { const p = (((i / n) - sc) % 1 + 1) % 1, b = (p % 0.5) / 0.5; yy = b < 0.12 ? -Math.sin(b / 0.12 * PI) * 0.25 : b >= 0.2 && b < 0.24 ? -(b - 0.2) / 0.04 : b >= 0.24 && b < 0.28 ? -1 + (b - 0.24) / 0.04 * 1.5 : b >= 0.28 && b < 0.31 ? 0.5 - (b - 0.28) / 0.03 * 0.5 : b >= 0.4 && b < 0.52 ? -Math.sin((b - 0.4) / 0.12 * PI) * 0.3 : 0; }
        pts.push([xx, yy * 0.5]);
      }
      line(pts, u * 0.17, low ? '#ff4d4d' : '#5dff9a', 2);
      if (low) dot(pw / 2 - 0.4, -ph / 2 + 0.38, 0.14, Math.sin(t * 6) > 0 ? '#ff2e2e' : '#6b2a2a', BE_DARK);
      else if (Math.sin(t * 7) > 0.2) dot(pw / 2 - 0.4, -ph / 2 + 0.38, 0.13, '#5dff9a', BE_DARK);
    });
  } else if (kind === 'be_dnr') { // a toe tag on a loop of string round the neck, swinging behind
    const sw = Math.sin(t * 2.2 + spd) * 0.28 * (0.4 + spd);
    g.beginPath(); g.ellipse(-1.5 * u, 0, 0.45 * u, 1.0 * u, 0, 0, PI * 2); g.strokeStyle = BE_HALO; g.lineWidth = u * 0.5; g.stroke(); g.strokeStyle = BE_DARK; g.lineWidth = u * 0.3; g.stroke(); g.strokeStyle = '#d9d2c4'; g.lineWidth = u * 0.14; g.stroke();
    line([[-1.5, 0.95], [-2.4, 1.15 + sw * 0.4], [-3.0, 1.0 + sw]], u * 0.13, '#d9d2c4', 1);
    g.save(); g.translate(-3.1 * u, (1.0 + sw) * u); g.rotate(sw * 0.5 + 0.15);
    poly([[0.1, -0.35], [-0.2, -0.9], [1.9, -0.9], [1.9, 0.9], [-0.2, 0.9], [0.1, 0.35]].map(p => [p[0] - 1.0, p[1]]), '#f6efd9');
    g.fillStyle = BE_RED; g.fillRect(-0.45 * u, -0.9 * u, 0.3 * u, 1.8 * u); // (the red bar)
    for (let i = 0; i < 3; i++) line([[-0.05, -0.5 + i * 0.5], [0.8, -0.5 + i * 0.5]], u * 0.09, BE_DARK, 2);
    dot(-0.75, 0, 0.1, '#ffffff'); g.restore();
  } else if (kind === 'be_triage') { // a coloured triage tag hung from a loop round the head: green, amber, red by your health
    const col = hpf > 0.7 ? '#2fbf71' : hpf >= BE_LOW ? '#ffb020' : '#e5252a', sw = Math.sin(t * (low ? 7 : 2) + spd * 2) * (low ? 0.2 : 0.12);
    line([[0.1, -0.85], [-0.3, -1.5]], u * 0.12, '#4a3b32', 1);
    g.save(); g.translate(-0.4 * u, -2.7 * u); g.rotate(sw);
    rrect(0, 0, 1.7, 2.3, 0.18, '#fbf7ea');
    g.fillStyle = col; g.fillRect(-0.85 * u, -1.15 * u, 1.7 * u, 1.05 * u);
    g.strokeStyle = BE_DARK; g.lineWidth = edgeW; g.strokeRect(-0.85 * u, -1.15 * u, 1.7 * u, 1.05 * u);
    cross(0, -0.62, 0.62, '#ffffff');
    for (let i = 0; i < 3; i++) line([[-0.55, 0.25 + i * 0.32], [0.55 - (i === 2 ? 0.5 : 0), 0.25 + i * 0.32]], u * 0.08, BE_DARK, 2);
    dot(0, -1.0, 0.1, '#ffffff'); g.restore();
  } else if (kind === 'be_kin') { // a sticking plaster across the head (and a smaller one crossed over it)
    const tw = Math.sin(t * 3) * 0.015;
    g.save(); g.rotate(0.55 + tw);
    rrect(0.15, 0, 3.4, 1.15, 0.5, '#f2c59a');
    g.fillStyle = '#ffffff'; g.fillRect(-0.55 * u, -0.38 * u, 1.4 * u, 0.76 * u); g.strokeStyle = BE_DARK; g.lineWidth = edgeW * 0.7; g.strokeRect(-0.55 * u, -0.38 * u, 1.4 * u, 0.76 * u);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) dot(0.15 + s * 1.3, (i - 1) * 0.28, 0.06, '#c9966b', '#c9966b');
    g.restore();
    g.save(); g.rotate(-0.7); rrect(0.5, 0.2, 2.3, 0.8, 0.35, '#f2c59a'); g.fillStyle = '#ffffff'; g.fillRect(0.0 * u, -0.05 * u, 1.0 * u, 0.5 * u); g.restore();
  } else if (kind === 'be_donor') { // an organ cool box carried like a rucksack on the tail end, a cold mist rising off it
    line([[-0.3, -0.95], [-1.6, -0.5]], u * 0.2, '#4a3b32', 1); line([[-0.3, 0.95], [-1.6, 0.5]], u * 0.2, '#4a3b32', 1);
    const bob = Math.sin(t * 3 + spd * 2) * 0.08;
    g.save(); g.translate(-3.0 * u, bob * u);
    line([[-0.7, -0.6], [-0.7, -1.4], [0.7, -1.4], [0.7, -0.6]], u * 0.2, '#4a3b32', 1); // (the handle)
    rrect(0, 0.2, 2.5, 1.7, 0.2, '#f4f6f8'); rrect(0, -0.55, 2.7, 0.62, 0.15, '#e03a4e');
    cross(0, 0.45, 0.8, '#e03a4e');
    for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; g.globalAlpha = A0 * (1 - ph) * 0.9; dot(-0.7 + i * 0.7 + Math.sin(ph * 6 + i) * 0.15, -1.6 - ph * 1.2, 0.14, '#bfe6fb', '#bfe6fb'); }
    g.globalAlpha = A0; g.restore();
  } else if (kind === 'be_transfusion') { // a blood bag held out to the side, a tube to the head with beads of blood running along it
    const sw = Math.sin(t * 2.4) * 0.05;
    g.save(); g.translate(-1.6 * u, 2.2 * u); g.rotate(sw - 0.2);
    poly([[-0.8, -1.0], [0.8, -1.0], [0.95, 0.75], [0.4, 1.1], [-0.4, 1.1], [-0.95, 0.75]], '#d0202f');
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(-0.55 * u, -0.8 * u, 0.2 * u, 1.3 * u);
    g.fillStyle = '#ffffff'; g.fillRect(-0.05 * u, -0.6 * u, 0.7 * u, 0.55 * u); g.strokeStyle = BE_DARK; g.lineWidth = edgeW * 0.7; g.strokeRect(-0.05 * u, -0.6 * u, 0.7 * u, 0.55 * u);
    dot(0, -1.15, 0.16, '#f4f6f8'); // (the hanging hole)
    g.restore();
    const tube = [[-1.6, 1.3], [-1.2, 0.8], [-0.4, 0.55], [0.35, 0.5]];
    line(tube, u * 0.17, '#e5a0a8', 1);
    for (let i = 0; i < 3; i++) {
      const ph = (t * (0.7 + act * 1.5) + i / 3) % 1, k = ph * (tube.length - 1), j = Math.min(tube.length - 2, Math.floor(k)), f = k - j;
      dot(tube[j][0] + (tube[j + 1][0] - tube[j][0]) * f, tube[j][1] + (tube[j + 1][1] - tube[j][1]) * f, 0.1, BE_RED, BE_RED);
    }
    dot(0.45, 0.48, 0.2, '#ffffff'); // (the cannula)
  }
  g.restore();
}

// ---------------------------------------------------------------- drawing: every other kind goes to the earlier wraps
blDrawLook = (orig => function (g, kind, x, y, u, ang, t, o) {
  if (BE_KINDS.includes(kind)) return beDrawLook(g, kind, x, y, u, ang, t, o);
  return orig.apply(this, arguments);
})(blDrawLook);

// ---------------------------------------------------------------- in the run
// baselinelook.js's blInRun calls BL_WEAP[kind](k, t, o) on the global ctx, already at the body, turned to the heading (k = the body
// scale in pixels, o = blState's act). Same adapter as alphalook.js's, plus the heading so the monitor stays upright.
function beWeap(kind) {
  return (k, t, o) => {
    const pl = G && G.player, face = pl ? (pl.hd != null ? pl.hd : pl.face || 0) + (pl.yaw || 0) : 0;
    beDrawLook(ctx, kind, k, 0, 7.5 * k, 0, t, Object.assign({}, o, { upAng: face }));
  };
}
if (typeof BL_WEAP !== 'undefined') for (const kind of BE_KINDS) BL_WEAP[kind] = beWeap(kind);
const beLetter = w => (w && w.up && w.up.p) || '';
blPick = (orig => function () {
  const base = orig.apply(this, arguments);
  if (!beOn() || !G || !G.weapons) return base;
  let best = null, bt = -1;
  for (const w of G.weapons) {
    if (!w || w.isSpell || !w.def) continue;
    const map = BE_BY_WEAPON[w24Key(w)], k = map && map[beLetter(w)]; if (!k) continue;
    const ft = w.firedT || 0; if (ft >= bt) { bt = ft; best = { w, kind: k }; }
  }
  if (!best) return base;
  return base && (base.w.firedT || 0) > bt ? base : best; // (the hero weapon fired last wins, Baseline's included)
})(blPick);

// ---------------------------------------------------------------- on the branch screens
// Lv 3 passes the card name; Lv 6 and 9 pass the branch letter. While the run is Beta both read as the Beta kind. The tables are
// shared by the older scenes, so PV_OWN gets a Proxy over them and the other samples keep exactly what they had.
function beNameKind(id, name) {
  if (BE_NAMES[name]) return BE_NAMES[name];
  let spec = null; try { spec = wupSpecFor(id, 'beta'); } catch (e) { }
  if (spec) for (const l of ['A', 'B', 'C']) if (spec[l] && spec[l].name === name) return BE_BY_WEAPON[id][l];
  return null;
}
for (const id of Object.keys(BE_BY_WEAPON)) {
  const O = PV_OWN[id]; if (!O) continue;
  if (O.flags) O.flags = new Proxy(O.flags, { get(tbl, k, rcv) {
    if (typeof k === 'string' && beOn()) { if (BE_BY_WEAPON[id][k]) return BE_BY_WEAPON[id][k]; const bk = beNameKind(id, k); if (bk) return bk; }
    return Reflect.get(tbl, k, rcv);
  } });
  const has = pv => pv.F && BE_KINDS.find(k => pv.F.has(k));
  O.step = (orig => function (pv, dt) { // (costume previews stand clear of the stage's arrow buttons)
    if (orig) orig.apply(this, arguments);
    if (pv.me && has(pv)) { if (pv.me.x < 0.3) pv.me.x = 0.3; if (pv.home && pv.home.x < 0.3) pv.home.x = 0.3; }
  })(O.step);
  O.me = (orig => function (pv, g, hx, hy, hr, U) {
    if (orig) orig.apply(this, arguments);
    const kind = has(pv); if (!kind) return;
    if (pv.me && pv.me.x < 0.3) pv.me.x = 0.3;
    const act = Math.max(0, 1 - (pv.t - (pv.lastShot || -9)) / 0.3);
    // (the stage has no health: it walks through full, amber and low, and the vials fill, so every state shows)
    const cyc = (pv.t % 9) / 9, hpf = cyc < 0.45 ? 1 : cyc < 0.7 ? 0.55 : 0.2;
    beDrawLook(g, kind, hx, hy, hr * 1.2 * 1.25, pv.me.a || 0, pv.t, { act: pv.shotFlash || act, speed: 0.6, hpf, vials: Math.floor((pv.t * 1.5) % 11) });
  })(O.me);
}
