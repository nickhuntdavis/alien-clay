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
//  - WEAPON BRANCH costumes (the six Shotgun and Hand-to-gland heroes, BL_WEAP), shaded the same way and drawn after your body
//    inside the sharp canvas pass (a drawSeqMods wrap), in the head's frame fitted to your sample's head (SL_SHAPE), for the
//    hero weapon you fired last; hidden while a sample branch costume is worn (one head, one costume):
//      sperm    Sperminator: the right half of the head torn open on a chrome endoskeleton with a red eye; after Come back the
//               whole chrome skull, both eyes and metal vertebrae down the midpiece; a dry brown husk for the 2 s before.
//      evil     Evil Dead: a red chainsaw on the right flank, its bar past the nose (longer with Hail to the King); the chain
//               runs, the motor smokes and the tip throws blood while it cuts.
//      ride     Riding shotgun: amber riding goggles in chrome rims on a stitched leather strap; wind streams off you at speed.
//      kungfu   Kung fu: a black belt knotted at the neck, its ends trailing; taped fists up in a guard, the right one strikes
//               on a kick, the left jabs on a hit.
//      samurai  Samurai: an oiled topknot tied with white cord; a katana in a black lacquer scabbard on the left flank, drawn
//               and swept across the front on a cut.
//      biting   Biting: gums and a row of teeth round the front (canines at the corners) over a dark maw; it gapes and snaps
//               on a bite, blood on the canines after one, and a string of drool.
//    `blDrawLook` draws any of them on another canvas (the stage previews, fbdemo.js MGV and NWV, and tests).
// Units: u = the head's half-length. The frame is rotated to the sperm's heading, +x forward. act (0 to 1) is a pulse that
// follows firing; speed (0 to 1) follows swim speed.
// Hooks: wraps samplelooks.js SL_HEAD.baseline, sets SL_UNDER.baseline, wraps seqsel.js drawSeqMods; edits MGV_FLAG, NWV_FLAG
// (fbdemo.js) in place; wraps the `me` of PV_OWN for v_phys_spread, v_phys_contact. Loads after baseline3.js.

const BL_KINDS = ['sperm', 'evil', 'ride', 'kungfu', 'samurai', 'biting'];
const BL_BY_WEAPON = { v_phys_spread: { A: 'sperm', B: 'evil', C: 'ride' }, v_phys_contact: { A: 'kungfu', B: 'samurai', C: 'biting' } };
const BL_DARK = 'rgb(30,34,32)';
// The six weapon branch costumes, in the head's frame (units of k: the head is centred on (1, 0), 7.5 long and 5 wide either
// side of its axis, +x forward, +y the right flank), shaded like the sample bodies. o: act (a firing pulse), speed (0 to 1 of
// top swim speed), skel and husk (Sperminator after Come back, and the 2 s husk before it), saw (the chainsaw is running),
// hail (Hail to the King's longer bar), kick, cut, bite (0 to 1 pulses that fade).
const blE = (x, y, rx, ry, k, r) => { ctx.beginPath(); ctx.ellipse(x * k, y * k, rx * k, ry * k, r || 0, 0, TAU); };
function blChrome(y0, y1, k) { // a chrome fill whose reflections run along the head
  const g = ctx.createLinearGradient(0, y0 * k, 0, y1 * k);
  for (const [o, c] of [[0, '#4b535c'], [0.12, '#eef3f7'], [0.3, '#b4bec8'], [0.5, '#69737d'], [0.64, '#d8e0e7'], [0.85, '#8a949e'], [1, '#3f474f']]) g.addColorStop(o, c);
  return g;
}
function blGlow(x, y, r, col, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
const BL_SKIN = { lit: '#f6d2b4', mid: '#dfa47e', dk: '#9a6142', edge: 'rgba(70,36,20,0.85)' };

function blSperm(k, now, o) { // Sperminator: the right half of the head torn open on a chrome endoskeleton with a red eye
  if (o.husk) { // the dry husk while it comes back
    const hg = ctx.createRadialGradient(2 * k, -1.5 * k, 0.5 * k, 1 * k, 0, 8.5 * k); hg.addColorStop(0, '#b89466'); hg.addColorStop(1, '#5e4428');
    blE(1, 0, 8.1, 5.6, k); ctx.fillStyle = hg; ctx.fill(); ctx.strokeStyle = 'rgba(52,36,18,0.9)'; ctx.lineWidth = 0.45 * k; ctx.stroke();
    ctx.strokeStyle = 'rgba(52,36,18,0.6)'; ctx.lineWidth = 0.25 * k; ctx.beginPath();
    for (const [x0, y0, x1, y1] of [[-5, -2, 2, -3.2], [-3, 2.5, 5, 1.8], [0, -0.5, 7, -0.2], [-6, 0.5, -1, 0.8]]) { ctx.moveTo(x0 * k, y0 * k); ctx.quadraticCurveTo((x0 + x1) / 2 * k, ((y0 + y1) / 2 + 0.8) * k, x1 * k, y1 * k); }
    ctx.stroke(); return;
  }
  const head = () => blE(1, 0, 7.55, 5.05, k);
  const eye = (y, a) => { ctx.fillStyle = '#16090a'; blE(5.0, y, 1.45, 1.15, k); ctx.fill(); blGlow(5.1 * k, y * k, 3.4 * k, 'rgba(255,40,30,0.85)', a); ctx.fillStyle = '#ff3b2a'; blE(5.15, y, 0.7, 0.6, k); ctx.fill(); ctx.fillStyle = 'rgba(255,230,210,0.95)'; blE(5.35, y - 0.18, 0.22, 0.18, k); ctx.fill(); };
  const pulse = 0.75 + 0.25 * Math.sin(now * 5) + 0.3 * (o.act || 0);
  if (o.skel) { // after Come back: the whole skull, both eyes, and a spine of vertebrae down the midpiece
    for (let i = 0; i < 4; i++) { const x = -6.2 - i * 1.45; ctx.fillStyle = blChrome(-1.3, 1.3, k); ctx.beginPath(); ctx.roundRect((x - 0.55) * k, -1.25 * k, 1.1 * k, 2.5 * k, 0.35 * k); ctx.fill(); ctx.strokeStyle = 'rgb(32,36,42)'; ctx.lineWidth = 0.22 * k; ctx.stroke(); }
    head(); ctx.fillStyle = blChrome(-5, 5, k); ctx.fill(); ctx.strokeStyle = 'rgb(32,36,42)'; ctx.lineWidth = 0.45 * k; ctx.stroke();
    ctx.strokeStyle = 'rgba(30,34,40,0.75)'; ctx.lineWidth = 0.28 * k; ctx.beginPath(); // (the cranial seams and the temple vents)
    ctx.moveTo(-5.8 * k, 0); ctx.lineTo(2.6 * k, 0); ctx.moveTo(-1.5 * k, -4.6 * k); ctx.quadraticCurveTo(-0.6 * k, 0, -1.5 * k, 4.6 * k);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.moveTo((-4.6 + i * 0.9) * k, s * 2.6 * k); ctx.lineTo((-4.6 + i * 0.9) * k, s * 3.7 * k); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(14,16,20,0.85)'; ctx.beginPath(); ctx.moveTo(8.4 * k, 0); ctx.lineTo(7.0 * k, -0.7 * k); ctx.lineTo(7.0 * k, 0.7 * k); ctx.closePath(); ctx.fill(); // (the nasal cavity)
    eye(-1.9, pulse); eye(1.9, pulse);
    blGlow(3.2 * k, -2.6 * k, 2.6 * k, 'rgba(255,255,255,0.7)', 1); return;
  }
  // The torn half: clipped to the head and to the right of a ragged line just off the axis.
  const tear = [[-6.9, -0.2], [-5.2, 0.5], [-3.9, -0.4], [-2.4, 0.6], [-0.9, -0.3], [0.6, 0.7], [2.1, -0.2], [3.4, 0.5], [4.6, -0.6], [6.0, 0.2], [7.2, -0.5], [8.8, 0.1]];
  const torn = () => { ctx.beginPath(); tear.forEach(([x, y], i) => (i ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k))); ctx.lineTo(8.8 * k, 6 * k); ctx.lineTo(-6.9 * k, 6 * k); ctx.closePath(); };
  ctx.save(); head(); ctx.clip(); torn(); ctx.clip();
  head(); ctx.fillStyle = blChrome(-1, 5.2, k); ctx.fill();
  ctx.strokeStyle = 'rgba(30,34,40,0.8)'; ctx.lineWidth = 0.28 * k; ctx.beginPath(); // (plate seams, a piston along the cheek)
  ctx.moveTo(-1.8 * k, 0.5 * k); ctx.quadraticCurveTo(-1.2 * k, 3 * k, -2.2 * k, 5 * k); ctx.moveTo(2.4 * k, 0.4 * k); ctx.quadraticCurveTo(2.9 * k, 2.8 * k, 2.2 * k, 5 * k);
  ctx.moveTo(-5 * k, 3.1 * k); ctx.lineTo(1.2 * k, 3.6 * k); ctx.moveTo(-5 * k, 3.7 * k); ctx.lineTo(1.2 * k, 4.2 * k); ctx.stroke();
  ctx.fillStyle = '#2c3238'; for (const [x, y] of [[-4, 1.6], [0.4, 1.4], [-5.2, 3.4], [1.3, 3.9]]) { blE(x, y, 0.32, 0.32, k); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; for (const [x, y] of [[-4.1, 1.5], [0.3, 1.3]]) { blE(x, y, 0.12, 0.12, k); ctx.fill(); }
  ctx.restore();
  // The ragged edge of the membrane where it peeled back, a darker lip with a highlight.
  ctx.save(); head(); ctx.clip();
  ctx.beginPath(); tear.forEach(([x, y], i) => (i ? ctx.lineTo(x * k, (y - 0.15) * k) : ctx.moveTo(x * k, (y - 0.15) * k)));
  ctx.strokeStyle = 'rgba(120,70,64,0.9)'; ctx.lineWidth = 0.55 * k; ctx.stroke(); ctx.strokeStyle = 'rgba(255,225,215,0.55)'; ctx.lineWidth = 0.18 * k; ctx.translate(0, -0.3 * k); ctx.stroke();
  ctx.restore();
  eye(1.9, pulse);
}

function blEvil(k, now, o) { // Evil Dead: a chainsaw on the right flank, its bar past the nose; the chain runs while it cuts
  const on = !!o.saw, L = o.hail ? 19.5 : 15.5, jig = on ? (Math.random() - 0.5) * 0.25 * k : 0;
  ctx.save(); ctx.translate(0.4 * k + jig, 6.1 * k + jig); ctx.rotate(-0.2);
  // The guide bar: steel, a groove down it, a riveted nose.
  const bg = ctx.createLinearGradient(0, -1.05 * k, 0, 1.05 * k); bg.addColorStop(0, '#e8edf1'); bg.addColorStop(0.45, '#9aa4ae'); bg.addColorStop(1, '#4a525a');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(3 * k, -0.95 * k); ctx.lineTo(L * k, -0.85 * k); ctx.arc(L * k, 0, 0.85 * k, -Math.PI / 2, Math.PI / 2); ctx.lineTo(3 * k, 0.95 * k); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(20,22,26,0.9)'; ctx.lineWidth = 0.3 * k; ctx.stroke();
  ctx.strokeStyle = 'rgba(30,34,40,0.6)'; ctx.lineWidth = 0.2 * k; ctx.beginPath(); ctx.moveTo(3.4 * k, 0); ctx.lineTo((L - 0.6) * k, 0); ctx.stroke();
  ctx.fillStyle = '#2a2f35'; blE(L - 0.1, 0, 0.32, 0.32, k); ctx.fill();
  // The chain: cutters round the bar's edge, moving forward along the top while it runs (a blur of them at speed).
  const off = on ? (now * 26) % 1.1 : 0.3;
  ctx.fillStyle = '#23272c';
  for (let x = 3.3 + off; x < L; x += 1.1) { ctx.fillRect(x * k, -1.35 * k, 0.55 * k, 0.45 * k); ctx.fillRect((L + 3.3 - x) * k, 0.9 * k, 0.55 * k, 0.45 * k); }
  if (on) { ctx.strokeStyle = 'rgba(220,226,232,0.55)'; ctx.lineWidth = 0.35 * k; ctx.beginPath(); ctx.moveTo(3.3 * k, -1.15 * k); ctx.lineTo(L * k, -1.05 * k); ctx.moveTo(3.3 * k, 1.15 * k); ctx.lineTo(L * k, 1.05 * k); ctx.stroke(); }
  // The motor: a red housing with cooling fins, the top handle and the pull-start.
  const mg = ctx.createLinearGradient(0, -2.3 * k, 0, 2.3 * k); mg.addColorStop(0, '#f06a3a'); mg.addColorStop(0.5, '#c23a1c'); mg.addColorStop(1, '#5a1608');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.roundRect(-3.6 * k, -2.2 * k, 7 * k, 4.4 * k, 1.1 * k); ctx.fill(); ctx.strokeStyle = 'rgba(40,10,4,0.9)'; ctx.lineWidth = 0.32 * k; ctx.stroke();
  ctx.strokeStyle = 'rgba(40,10,4,0.65)'; ctx.lineWidth = 0.28 * k; ctx.beginPath(); for (let i = 0; i < 4; i++) { const x = -2.6 + i * 0.75; ctx.moveTo(x * k, -1.5 * k); ctx.lineTo(x * k, 1.5 * k); } ctx.stroke();
  ctx.strokeStyle = '#1d2024'; ctx.lineWidth = 0.6 * k; ctx.beginPath(); ctx.moveTo(-2.2 * k, -2.1 * k); ctx.quadraticCurveTo(0.2 * k, -4.0 * k, 2.4 * k, -2.1 * k); ctx.stroke(); // (the top handle)
  ctx.strokeStyle = '#d8dde2'; ctx.lineWidth = 0.25 * k; ctx.beginPath(); ctx.moveTo(-1.6 * k, 2.2 * k); ctx.lineTo(-1.6 * k, 3.1 * k); ctx.stroke();
  ctx.fillStyle = '#1d2024'; ctx.beginPath(); ctx.roundRect(-2.5 * k, 3.0 * k, 1.8 * k, 0.6 * k, 0.3 * k); ctx.fill(); // (the pull-start grip)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; blE(-0.5, -1.2, 2.2, 0.5, k); ctx.fill(); // (the shine on the housing)
  if (on) { // exhaust out of the back, and what the chain throws off the tip
    for (let i = 0; i < 3; i++) { const p = (now * 2.5 + i / 3) % 1; ctx.fillStyle = `rgba(200,204,210,${(0.45 * (1 - p)).toFixed(3)})`; blE(-4 - p * 4, -1 + Math.sin(i * 2.1 + now * 7) * 0.8, 0.6 + p * 1.2, 0.6 + p * 1.2, k); ctx.fill(); }
    ctx.fillStyle = '#8c1420'; for (let i = 0; i < 4; i++) { const a = Math.random() * 1.6 - 0.8, r = 1 + Math.random() * 2.2; blE(L + 0.6 + Math.cos(a) * r, Math.sin(a) * r, 0.22, 0.22, k); ctx.fill(); }
  }
  ctx.restore();
}

function blRide(k, now, o) { // Riding shotgun: riding goggles on a leather strap round the head; wind streams off you at speed
  const spd = o.speed || 0;
  if (spd > 0.5) { // the wind: streaks peeling off the flanks
    const a = Math.min(1, (spd - 0.5) * 2.2);
    for (const [y, ph, len] of [[-5.6, 0, 1], [5.6, 1.7, 1], [-3.2, 0.8, 0.7], [3.2, 2.6, 0.7]]) {
      const L = (10 + spd * 16) * len, x0 = -1 + Math.sin(now * 13 + ph) * 1.2;
      const g = ctx.createLinearGradient(x0 * k, 0, (x0 - L) * k, 0); g.addColorStop(0, `rgba(255,255,255,${(0.75 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 0.35 * k; ctx.beginPath(); ctx.moveTo(x0 * k, y * k); ctx.quadraticCurveTo((x0 - L / 2) * k, (y * 1.12) * k, (x0 - L) * k, (y * 1.3) * k); ctx.stroke();
    }
  }
  // The strap: leather round the head, stitched, with a buckle at the back.
  ctx.strokeStyle = 'rgba(40,22,10,0.85)'; ctx.lineWidth = 1.25 * k; blE(1, 0, 7.25, 4.8, k); ctx.stroke();
  ctx.strokeStyle = '#7a4c28'; ctx.lineWidth = 0.85 * k; ctx.stroke();
  ctx.setLineDash([0.3 * k, 0.45 * k]); ctx.strokeStyle = 'rgba(235,205,160,0.7)'; ctx.lineWidth = 0.13 * k; blE(1, 0, 7.25, 4.8, k); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#c9b06a'; ctx.strokeStyle = 'rgba(60,44,10,0.9)'; ctx.lineWidth = 0.22 * k; ctx.beginPath(); ctx.roundRect(-6.85 * k, -0.85 * k, 1.1 * k, 1.7 * k, 0.25 * k); ctx.fill(); ctx.stroke();
  // The goggles: a leather mask, two round lenses in chrome rims, amber glass with a moving glint.
  ctx.fillStyle = '#3b2414'; ctx.beginPath(); ctx.ellipse(5.4 * k, -2.15 * k, 2.35 * k, 2.25 * k, 0, 0, TAU); ctx.ellipse(5.4 * k, 2.15 * k, 2.35 * k, 2.25 * k, 0, 0, TAU); ctx.fill();
  ctx.fillRect(4.6 * k, -0.6 * k, 1.6 * k, 1.2 * k);
  for (const s of [-1, 1]) {
    const cx = 5.5 * k, cy = s * 2.15 * k;
    ctx.strokeStyle = blChrome(s * 2.15 - 2, s * 2.15 + 2, k); ctx.lineWidth = 0.55 * k; ctx.beginPath(); ctx.arc(cx, cy, 1.75 * k, 0, TAU); ctx.stroke();
    const lg = ctx.createRadialGradient(cx - 0.5 * k, cy - 0.6 * k, 0.1 * k, cx, cy, 1.6 * k); lg.addColorStop(0, '#f7c76a'); lg.addColorStop(0.55, '#b06a1e'); lg.addColorStop(1, '#3a1a06');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(cx, cy, 1.5 * k, 0, TAU); ctx.fill();
    const gl = now * 0.9 + s;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.28 * k; ctx.beginPath(); ctx.arc(cx, cy, 1.05 * k, gl % TAU, gl % TAU + 0.9); ctx.stroke();
  }
}

function blKungfu(k, now, o) { // Kung fu: a black belt knotted at the neck, and two taped fists up in a guard; one strikes on a kick
  // The belt: a band round the neck, a square knot, two ends that trail and flutter.
  for (const s of [-1, 1]) {
    ctx.strokeStyle = '#121314'; ctx.lineWidth = 0.95 * k; ctx.beginPath(); ctx.moveTo(-6.7 * k, s * 0.4 * k);
    for (let i = 1; i <= 6; i++) { const f = i / 6; ctx.lineTo((-6.7 - f * 7) * k, (s * (0.6 + f * 2.2) + Math.sin(now * 9 - f * 5 + s) * 0.5 * f) * k); }
    ctx.stroke();
  }
  ctx.strokeStyle = '#121314'; ctx.lineWidth = 1.4 * k; ctx.beginPath(); ctx.moveTo(-6.1 * k, -2.1 * k); ctx.quadraticCurveTo(-6.9 * k, 0, -6.1 * k, 2.1 * k); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.25 * k; ctx.stroke();
  ctx.fillStyle = '#1a1b1d'; ctx.beginPath(); ctx.roundRect(-7.5 * k, -1.0 * k, 1.8 * k, 2.0 * k, 0.45 * k); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.18 * k; ctx.stroke();
  // The fists: in a guard either side of the head, bobbing; the right one shoots out on a kick, the left jabs on a hit.
  const kick = o.kick || 0, jab = o.act || 0;
  for (const s of [-1, 1]) {
    const bob = Math.sin(now * 6 + (s > 0 ? 0 : 1.6)) * 0.4, out = s > 0 ? kick * 8 : jab * 3;
    const x = 6.4 + out + bob, y = s * (6.6 - out * 0.35);
    if (out > 1) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.3 * k; ctx.beginPath(); for (const dy of [-0.9, 0, 0.9]) { ctx.moveTo((x - 1.8) * k, (y + dy) * k); ctx.lineTo((x - 1.8 - out * 0.9) * k, (y + dy) * k); } ctx.stroke(); }
    ctx.save(); ctx.translate(x * k, y * k); ctx.scale(1.35, 1.35);
    const fg = ctx.createRadialGradient(0.4 * k, -0.7 * k, 0.2 * k, 0, 0, 2.2 * k); fg.addColorStop(0, BL_SKIN.lit); fg.addColorStop(0.6, BL_SKIN.mid); fg.addColorStop(1, BL_SKIN.dk);
    ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(-1.6 * k, -1.35 * k, 3.2 * k, 2.7 * k, 1.0 * k); ctx.fill(); ctx.strokeStyle = BL_SKIN.edge; ctx.lineWidth = 0.28 * k; ctx.stroke();
    ctx.fillStyle = BL_SKIN.lit; for (let i = 0; i < 4; i++) { blE(1.45, -1.0 + i * 0.66, 0.36, 0.3, k); ctx.fill(); ctx.stroke(); } // (the knuckles)
    ctx.strokeStyle = 'rgba(90,50,30,0.5)'; ctx.lineWidth = 0.15 * k; ctx.beginPath(); for (let i = 1; i < 4; i++) { ctx.moveTo(0.2 * k, (-1.33 + i * 0.66) * k); ctx.lineTo(1.2 * k, (-1.33 + i * 0.66) * k); } ctx.stroke();
    ctx.fillStyle = '#f2efe8'; ctx.beginPath(); ctx.roundRect(-1.75 * k, -1.4 * k, 1.3 * k, 2.8 * k, 0.4 * k); ctx.fill(); ctx.strokeStyle = 'rgba(120,112,100,0.8)'; ctx.lineWidth = 0.15 * k; ctx.stroke(); // (the hand wrap)
    ctx.beginPath(); ctx.moveTo(-1.5 * k, -1.1 * k); ctx.lineTo(-0.7 * k, 1.2 * k); ctx.moveTo(-1.0 * k, -1.3 * k); ctx.lineTo(-0.5 * k, 0.1 * k); ctx.stroke();
    ctx.restore();
  }
}

function blSamurai(k, now, o) { // Samurai: an oiled topknot, and a katana in its scabbard on the left flank; drawn and swept on a cut
  const cut = o.cut || 0;
  // The topknot: the folded queue lying forward along the crown, a white cord at its root, and the gloss of the oil.
  const hg = ctx.createLinearGradient(0, -1 * k, 0, 1 * k); hg.addColorStop(0, '#3a3c40'); hg.addColorStop(0.5, '#0c0d0f'); hg.addColorStop(1, '#000000');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(-4.4 * k, -1.05 * k); ctx.quadraticCurveTo(-1 * k, -0.95 * k, 2.6 * k, -0.45 * k); ctx.quadraticCurveTo(3.4 * k, 0, 2.6 * k, 0.45 * k); ctx.quadraticCurveTo(-1 * k, 0.95 * k, -4.4 * k, 1.05 * k); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0e0f11'; blE(-4.6, 0, 1.55, 1.45, k); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.22 * k; ctx.beginPath(); ctx.moveTo(-3.6 * k, -0.45 * k); ctx.quadraticCurveTo(-0.5 * k, -0.5 * k, 2.2 * k, -0.2 * k); ctx.stroke();
  ctx.beginPath(); ctx.arc(-4.8 * k, -0.4 * k, 0.8 * k, -2.4, -0.9); ctx.stroke();
  ctx.strokeStyle = '#f4f2ec'; ctx.lineWidth = 0.35 * k; ctx.beginPath(); ctx.moveTo(-3.3 * k, -1.0 * k); ctx.lineTo(-3.3 * k, 1.0 * k); ctx.moveTo(-2.8 * k, -0.95 * k); ctx.lineTo(-2.8 * k, 0.95 * k); ctx.stroke();
  // The katana: scabbard of black lacquer along the left flank (-y), round guard, a handle in its diamond wrap.
  const Y = -6.6;
  ctx.save(); ctx.translate(0, Y * k);
  const sg = ctx.createLinearGradient(0, -0.75 * k, 0, 0.75 * k); sg.addColorStop(0, '#5a5e66'); sg.addColorStop(0.3, '#16181c'); sg.addColorStop(1, '#050506');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-0.6 * k, -0.62 * k); ctx.quadraticCurveTo(5 * k, -0.95 * k, 10.6 * k, -0.15 * k); ctx.quadraticCurveTo(11 * k, 0.35 * k, 10.4 * k, 0.5 * k); ctx.quadraticCurveTo(5 * k, -0.05 * k, -0.6 * k, 0.62 * k); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 0.22 * k; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.15 * k; ctx.beginPath(); ctx.moveTo(0 * k, -0.42 * k); ctx.quadraticCurveTo(5 * k, -0.72 * k, 9.8 * k, -0.15 * k); ctx.stroke();
  ctx.fillStyle = '#b08a3e'; ctx.fillRect(1.6 * k, -0.68 * k, 0.4 * k, 1.3 * k); // (the cord fitting)
  const tg = ctx.createRadialGradient(-0.9 * k, -0.4 * k, 0.1 * k, -0.9 * k, 0, 1.4 * k); tg.addColorStop(0, '#d9b45a'); tg.addColorStop(1, '#5c4314');
  ctx.fillStyle = tg; blE(-0.9, 0, 0.42, 1.35, k); ctx.fill(); ctx.strokeStyle = 'rgba(30,20,4,0.9)'; ctx.lineWidth = 0.18 * k; ctx.stroke(); // (the guard)
  if (cut < 0.05) { // (the handle is in the scabbard's mouth only while the blade is in)
    ctx.fillStyle = '#1b1c20'; ctx.beginPath(); ctx.roundRect(-5.6 * k, -0.55 * k, 4.4 * k, 1.1 * k, 0.4 * k); ctx.fill();
    ctx.strokeStyle = '#ece6d8'; ctx.lineWidth = 0.17 * k; ctx.beginPath(); for (let x = -5.2; x < -1.6; x += 0.8) { ctx.moveTo(x * k, -0.5 * k); ctx.lineTo((x + 0.4) * k, 0); ctx.lineTo(x * k, 0.5 * k); } ctx.stroke();
    ctx.fillStyle = '#7a6024'; ctx.beginPath(); ctx.roundRect(-5.95 * k, -0.6 * k, 0.5 * k, 1.2 * k, 0.2 * k); ctx.fill();
  }
  ctx.restore();
  if (cut >= 0.05) { // drawn: the blade sweeps across the front, a pale arc behind it
    const a = -1.25 + (1 - cut) * 2.3, R = 13;
    ctx.save(); ctx.translate(2.5 * k, 0);
    ctx.strokeStyle = `rgba(255,255,255,${(0.55 * cut).toFixed(3)})`; ctx.lineWidth = 1.4 * k; ctx.beginPath(); ctx.arc(0, 0, R * 0.8 * k, a - 0.9, a); ctx.stroke();
    ctx.rotate(a);
    ctx.fillStyle = '#1b1c20'; ctx.beginPath(); ctx.roundRect(2.2 * k, -0.5 * k, 3.6 * k, 1.0 * k, 0.4 * k); ctx.fill();
    const bl = ctx.createLinearGradient(0, -0.5 * k, 0, 0.5 * k); bl.addColorStop(0, '#ffffff'); bl.addColorStop(0.5, '#c9d2da'); bl.addColorStop(1, '#6c7680');
    ctx.fillStyle = bl; ctx.beginPath(); ctx.moveTo(6.2 * k, -0.42 * k); ctx.quadraticCurveTo(11 * k, -0.55 * k, (R + 1.2) * k, -0.05 * k); ctx.lineTo(6.2 * k, 0.4 * k); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(30,34,40,0.8)'; ctx.lineWidth = 0.15 * k; ctx.stroke();
    ctx.fillStyle = '#c9a24a'; blE(6.0, 0, 0.35, 1.0, k); ctx.fill();
    ctx.restore();
  }
}

function blBiting(k, now, o) { // Biting: gums and a row of teeth round the front of the head; it gapes, then snaps shut on a bite
  const b = o.bite || 0, gape = 0.06 + 0.04 * Math.sin(now * 2.3) + Math.sin(Math.min(1, b) * Math.PI) * 0.32, snap = b > 0 ? 1 - b * 0.12 : 1;
  const A0 = 1.05, at = (an, r) => [(1 + Math.cos(an) * 7.15 * r) * k, Math.sin(an) * 4.75 * r * k];
  // The maw behind the teeth (dark, wider while it gapes).
  ctx.fillStyle = `rgba(40,6,10,${(0.55 + gape).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(1 * k, 0, 7.15 * k, 4.75 * k, 0, -A0, A0); ctx.ellipse(1 * k, 0, (6.1 - gape * 4) * k, (3.9 - gape * 2.4) * k, 0, A0, -A0, true); ctx.closePath(); ctx.fill();
  // The gums: a fleshy band along the front edge.
  const gg = ctx.createLinearGradient(3 * k, 0, 9 * k, 0); gg.addColorStop(0, '#8e2a3a'); gg.addColorStop(0.6, '#d0566a'); gg.addColorStop(1, '#f08a98');
  ctx.strokeStyle = 'rgba(70,10,20,0.9)'; ctx.lineWidth = 1.5 * k; ctx.beginPath(); ctx.ellipse(1 * k, 0, 7.15 * k, 4.75 * k, 0, -A0, A0); ctx.stroke();
  ctx.strokeStyle = gg; ctx.lineWidth = 1.05 * k; ctx.stroke();
  // The teeth: incisors in the middle, canines bigger at the corners, smaller ones round the sides; they splay as it gapes.
  const teeth = [[-0.95, 0.7], [-0.72, 1.05], [-0.5, 1.6], [-0.3, 0.95], [-0.1, 0.85], [0.1, 0.85], [0.3, 0.95], [0.5, 1.6], [0.72, 1.05], [0.95, 0.7]];
  for (const [a0, sz] of teeth) {
    const an = a0 * (1 + gape * 0.25) * snap, [bx, by] = at(an, 1.02), nx = Math.cos(an), ny = Math.sin(an) * 0.75, nl = Math.hypot(nx, ny), ux = nx / nl, uy = ny / nl;
    const L = (0.95 + sz * 0.75 + b * 0.25) * k, W = (0.38 + sz * 0.16) * k;
    const tg = ctx.createLinearGradient(bx, by, bx + ux * L, by + uy * L); tg.addColorStop(0, '#d9cfb4'); tg.addColorStop(0.45, '#fffdf6'); tg.addColorStop(1, '#e9e3d2');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(bx - uy * W, by + ux * W); ctx.quadraticCurveTo(bx + ux * L * 0.6 - uy * W * 0.8, by + uy * L * 0.6 + ux * W * 0.8, bx + ux * L, by + uy * L); ctx.quadraticCurveTo(bx + ux * L * 0.6 + uy * W * 0.8, by + uy * L * 0.6 - ux * W * 0.8, bx + uy * W, by - ux * W); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(70,60,44,0.85)'; ctx.lineWidth = 0.16 * k; ctx.stroke();
    if (o.blood && sz > 1.2) { ctx.fillStyle = 'rgba(150,14,26,0.85)'; blE((bx + ux * L * 0.75) / k, (by + uy * L * 0.75) / k, 0.22, 0.22, k); ctx.fill(); }
  }
  // A string of drool off the front, swinging.
  const dx = 8.9, dy = 0.9 + Math.sin(now * 2.1) * 0.3, dl = 1.2 + 0.5 * Math.sin(now * 1.3);
  ctx.strokeStyle = 'rgba(225,240,245,0.6)'; ctx.lineWidth = 0.18 * k; ctx.beginPath(); ctx.moveTo(8.3 * k, 0.6 * k); ctx.quadraticCurveTo((dx + 0.3) * k, dy * k, (dx + dl) * k, (dy + 0.2) * k); ctx.stroke();
  ctx.fillStyle = 'rgba(225,240,245,0.75)'; blE(dx + dl, dy + 0.25, 0.3, 0.36, k); ctx.fill();
}
const BL_WEAP = { sperm: blSperm, evil: blEvil, ride: blRide, kungfu: blKungfu, samurai: blSamurai, biting: blBiting };
// On any canvas: g at (x, y) facing ang, u = the head's half-length in pixels (the head's centre at x, y). Stage previews and tests.
function blDrawLook(g, kind, x, y, u, ang, t, o) {
  const keep = ctx, raw = RAW_COL; ctx = g; RAW_COL = true;
  try { const k = u / 7.5; ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.translate(-k, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]); BL_WEAP[kind](k, t, o || {}); ctx.restore(); }
  finally { ctx = keep; RAW_COL = raw; }
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
// The costume's live state for the weapon that wears it (see the drawers above).
function blState(w, kind) {
  const f2 = w.bl2 || {}, fh = w.hg || {}, S2 = G.bl2 || {}, rt = G.realT, pl = G.player;
  const o = { act: Math.max(0, 1 - (G.t - (w.firedT || -9)) / 0.3) };
  if (kind === 'sperm') { o.skel = !!S2.skel; o.husk = S2.huskT > G.t; }
  if (kind === 'evil') { o.saw = G.t - (f2.sawOn || -9) < 0.3; o.hail = !!f2.hail; }
  if (kind === 'ride') o.speed = typeof bl2Spd === 'function' ? Math.min(1.4, bl2Spd() / bl2Top()) : Math.min(1, Math.hypot(pl.vx || 0, pl.vy || 0) / 165);
  if (kind === 'kungfu') o.kick = Math.max(0, 1 - (rt - (fh.kickT || -9)) / 0.25);
  if (kind === 'samurai') o.cut = Math.max(0, 1 - (G.t - (fh.cutT == null ? -9 : fh.cutT)) / 0.25);
  if (kind === 'biting') { o.bite = Math.max(0, 1 - (rt - (fh.biteT || -9)) / 0.3); o.blood = rt - (fh.biteT || -9) < 4; }
  return o;
}
function blInRun(px, py) {
  if (blSmbKind()) return; // (a sample branch costume is on the head)
  let pk = blPick(); if (!pk) return;
  if (G.bl2 && G.bl2.huskT > G.t && typeof bl2W === 'function' && bl2W() && bl2P() === 'A') pk = { w: bl2W(), kind: 'sperm' }; // (the husk shows whatever fired last)
  const pl = G.player, id = G.s10 && G.s10.id, D = id && typeof SL !== 'undefined' && SL[id], sh = (id && typeof SL_SHAPE !== 'undefined' && SL_SHAPE[id]) || [1, 7.5, 5];
  const k = S * (typeof playerScale === 'function' ? playerScale() : 1) * (D ? D.size : 1), face = (pl.hd != null ? pl.hd : pl.face) + (pl.yaw || 0);
  const raw = RAW_COL; RAW_COL = true;
  ctx.save(); ctx.globalAlpha = (G.oob ? 0.5 : 1) * (G.peek && G.peek.t > G.t ? 0.2 : 1);
  ctx.translate(px, py); ctx.rotate(face); ctx.translate((sh[0] - 1) * k, 0); ctx.scale(sh[1] / 7.5, sh[2] / 5); // (fitted to this sample's head)
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);
  try { BL_WEAP[pk.kind](k, G.realT, blState(pk.w, pk.kind)); } finally { ctx.restore(); RAW_COL = raw; }
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
    const pulse = (pv.t % 1.4) < 0.3 ? 1 - (pv.t % 1.4) / 0.3 : 0; // (the stage has no chainsaw, kick, cut or bite of its own: a beat every 1.4 s)
    blDrawLook(g, kind, hx, hy, hr * 1.2 * 1.25, pv.me.a || 0, pv.t, { act: pv.shotFlash || act, speed: 1, saw: true, kick: pulse, cut: pulse, bite: pulse, blood: true });
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
