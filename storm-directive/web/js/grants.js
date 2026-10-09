'use strict';
// Spawn Prawn - stain grants. The slide starts greyscale, you included. A grant is a permanent stain for one
// kind of colour: each turns up once ever, floating on the slide for you to swim into, and from then on it is
// on in every run (the pause menu switches it off). Stain cards in DNA strands still bring their own colours
// and boons for the run they're found in.
//   body:    Acridine Orange: you, your echoes and allies. Floats by the egg (the first game, until taken).
//   tracer:  Tracer Dye: your shots and weapon effects, and each damage type's colour. At level 5.
//   pickups: Gentian Violet: power-up pickups. At level 10, once you have the Tracer Dye.
// (Not in campaign levels: they wait for the next run elsewhere.)
// Hooks: grantsStart (newGame), grantsTick (update), drawGrants (render, world), grantCols / GRANT_EL
// (refreshPalette and col(), render.js), grantOn (foes.js, your health ring), grantsHtml (ui.js, pause menu).

const GRANTS = {
  body:    { name: 'Acridine Orange', key: () => PAL.you, cols: () => [PAL.you],
    see: 'You, your echoes and your allies, in your own colour',
    desc: 'The stain they use on real sperm: the healthy ones light up. From now on, so do you. Much easier to find yourself in a crowd.' },
  tracer:  { name: 'Tracer Dye', key: () => (G && G.seqCol) || PAL.upgrade, cols: () => (G && G.seqCol ? [G.seqCol] : []), elem: true, level: 5, after: 'body',
    see: 'Your shots and weapon effects, and every damage type in its own colour',
    desc: 'A fluorescent tracer in the barrel. Every shot, splash and trail you make shows up, and each damage type in its own colour.' },
  pickups: { name: 'Gentian Violet', key: () => PAL.pickup, cols: () => [PAL.pickup], level: 10, after: 'tracer',
    see: 'Power-up pickups and their effects',
    desc: 'A deep violet that soaks into anything worth picking up. Power-ups stand out from the grey at last.' },
};
const GRANT_ORDER = ['body', 'tracer', 'pickups'];
const grantHas = id => !!(META.grants && META.grants[id]);
const grantOn = id => grantHas(id) && !(META.grantOff && META.grantOff[id]);
let GRANT_EL = false; // damage-type colours let through (the Tracer Dye), set by refreshPalette
function grantCols() {
  GRANT_EL = grantOn('tracer');
  const out = [];
  for (const id of GRANT_ORDER) if (grantOn(id)) out.push(...GRANTS[id].cols());
  return out;
}

// Players from before grants: a kept GFP Tag becomes the first two grants, a kept H&E kit the third.
function grantsMigrate() {
  const ps = META.pstains;
  if (!ps || !(ps.gfp || ps.he) || META.grantsMig) return;
  const g = META.grants || (META.grants = {});
  if (ps.gfp) { g.body = 1; g.tracer = 1; delete ps.gfp; }
  if (ps.he) g.pickups = 1;
  META.grantsMig = 1; saveMeta();
}
function grantsStart(G) {
  grantsMigrate();
  G.grant = null; // the one floating on the slide, if any
}
// The next grant you're due, if this is the moment for it.
function grantDue() {
  if (G.lvl || G.debug || !G.core) return null;
  if (!grantHas('body')) return 'body';
  for (const id of ['tracer', 'pickups']) { const D = GRANTS[id]; if (!grantHas(id) && grantHas(D.after) && G.level >= D.level) return id; }
  return null;
}
function grantsTick(dt) {
  if (!G || G.state !== 'play') return;
  const p = me();
  if (!G.grant) {
    const id = grantDue();
    if (!id) return;
    if (id === 'body') {
      // By the egg, on the side you swim in from.
      const c = G.core, a = Math.atan2(p.y - c.y, p.x - c.x) || Math.PI / 2;
      G.grant = unstick({ id, x: c.x + Math.cos(a) * (CORE.r + 110), y: c.y + Math.sin(a) * (CORE.r + 110), born: G.t }, 30);
    } else {
      // Right in front of you, so you can't miss it.
      const a = Math.random() * TAU;
      G.grant = unstick({ id, x: p.x + Math.cos(a) * 170, y: p.y + Math.sin(a) * 170, born: G.t }, 30);
      banner('A STAIN GRANT!', GRANTS[id].key()); sfx('level'); vibrate(40);
    }
    return;
  }
  const g = G.grant;
  if (g.id === 'body' && !G.eggNear) return; // (meet the egg first: its card comes before this one)
  if (Math.hypot(p.x - g.x, p.y - g.y) < (p.r || 12) + 32) grantTake(g.id);
}
function grantTake(id) {
  const D = GRANTS[id], g = G.grant;
  G.grant = null;
  (META.grants || (META.grants = {}))[id] = 1;
  if (META.grantOff) delete META.grantOff[id];
  saveMeta();
  refreshPalette();
  const c = D.key();
  if (g) { ring(g.x, g.y, 90, c, 0.6, 5); ring(g.x, g.y, 180, c, 0.9, 3); fxParts('drop', g.x, g.y, c, 18, 220, 0.7, 4); }
  cam.shake = Math.max(cam.shake, 6); sfx('level'); vibrate(80);
  banner(D.name.toUpperCase(), c); // (the message underneath says it's a stain grant: the banner has room for a name)
  if (id === 'body') tutShow('stains', true); // (what stains are: tutorial.js)
  sysMsg('STAIN GRANT: ' + D.name.toUpperCase(), `${D.desc} Yours for good (switch it off in the pause menu).`, c, true);
}

// ---------------------------------------------------------------- drawing (world space, from render)
function drawGrants() {
  const g = G && G.grant;
  if (!g) return;
  const D = GRANTS[g.id], c = D.key(), x = sx(g.x), y = sy(g.y + Math.sin(G.realT * 2) * 6), r = 16 * S * (1 + Math.sin(G.realT * 3) * 0.06);
  RAW_COL = true; // a grant shows the very colour it brings
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2); gr.addColorStop(0, c + '88'); gr.addColorStop(1, c + '00');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill();
  // An ink drop: round at the bottom, drawn to a point at the top.
  ctx.fillStyle = c; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - r * 1.9); ctx.quadraticCurveTo(x + r * 1.1, y - r * 0.2, x + r, y + r * 0.2); ctx.arc(x, y + r * 0.2, r, 0, Math.PI); ctx.quadraticCurveTo(x - r * 1.1, y - r * 0.2, x, y - r * 1.9); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x - r * 0.35, y, r * 0.22, 0, TAU); ctx.fill();
  ctx.font = '900 11px monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000000'; ctx.fillStyle = c;
  const by = y - r * 2.3 - 8;
  ctx.strokeText('STAIN GRANT', x, by); ctx.fillText('STAIN GRANT', x, by);
  RAW_COL = false;
}

// ---------------------------------------------------------------- pause menu (ui.js stainsHtml)
function grantsHtml() {
  const got = GRANT_ORDER.filter(grantHas);
  if (!got.length) return '';
  return `<h3 style="margin-top:10px">Stain grants</h3><div class="list">${got.map(id => { const D = GRANTS[id], on = grantOn(id);
    return `<div class="li on stain"><i class="sw" style="background:${D.key()}"></i><div><b>${esc(D.name)}</b><br><span>${esc(D.see)}.</span><br><button class="chip ${on ? 'sel' : ''}" data-grant="${id}">${on ? 'ON' : 'OFF'}</button></div></div>`; }).join('')}</div>`
    + `<p class="hint">Yours for good. Switch any off if you'd rather not see its colour.</p>`;
}
function grantsBind(box, redraw) {
  box.querySelectorAll('[data-grant]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.grant, off = META.grantOff || (META.grantOff = {});
    if (off[id]) delete off[id]; else off[id] = 1;
    saveMeta(); refreshPalette(); redraw();
  }));
}
