'use strict';
// Spawn Prawn - Field Guide portraits: every enemy, rival and boss, alive and moving on its own little patch of
// slide, drawn by the game's own enemy renderer (drawEnemy). Ones you haven't met are dark silhouettes.
const PORT = { on: false, root: null, ents: {}, last: 0 };
// A stand-in enemy for a portrait: the shape of a real one, none of the run behind it.
function portraitFoe(kind, id) {
  let def, extra = {};
  if (kind === 'rival') {
    const R = RIVALS.find(r => r.id === id);
    def = { id: 'rival', name: R.name, hp: 1, speed: 100, armour: 2, r: 15 * ((R.mod && R.mod.r) || 1), dmg: 0, xp: 0, color: R.color, shape: 'sperm', ai: 'rival', patterns: [] };
    extra = { rival: true, rid: R.id, R, lvl: 1, mode: 'roam', face: 0, name: '' };
  } else if (kind === 'boss') { def = bossDef(id); extra = { boss: true, pat: 0, patT: 0, fireT: 0 }; }
  else def = ENEMIES[id];
  let h = 0; for (const c of kind + id) h = (h * 31 + c.charCodeAt(0)) % 9973;
  const e = {
    id: 5000 + h, def, name: def.name, x: 0, y: 0, vx: 0, vy: 0, kx: 0, ky: 0, hp: def.hp, maxHp: def.hp, armour: def.armour || 0, r: def.r, speed: def.speed, dmg: 0, xp: 0,
    color: def.color, elite: false, boss: false, dead: false, flash: 0, hitT: {}, burn: 0, burnDps: 0, chill: 0, chillAmt: 0, frozen: 0, shock: 0, poison: 0, poisonStacks: 0,
    poisonDps: 0, mark: 0, shred: 0, reactCd: 0, auraArm: 0, crowd: 0, shootCd: 9, st: 0, stT: 9, side: 1, spin: 0, phased: false, age: 0, dashX: 1, dashY: 0, armK: 1, portrait: true,
  };
  return Object.assign(e, extra);
}
// A run-less world for the title screen's Field Guide, just enough for the enemy renderer.
function portraitWorld() {
  return { realT: 0, t: 0, player: { x: 1e5, y: 0, r: 10 }, enemies: [], dyes: {}, dyeBoon: {}, boons: {}, evm: {}, P: {}, pair: {}, synergy: {}, fx: [], parts: [], lights: [], peek: null, toy: null, grudge: null, debug: null };
}
// Draw e on canvas context g (css size Wc x Hc) at time t; dark: a silhouette (not met yet).
function drawFoePortrait(g, Wc, Hc, e, t, dark) {
  const keep = { ctx, W, H, S, cx: cam.x, cy: cam.y, G, raw: RAW_COL, df: WORLD_DF }, stub = !G;
  const bg = g.createRadialGradient(Wc * 0.5, Hc * 0.45, 0, Wc * 0.5, Hc * 0.5, Math.max(Wc, Hc) * 0.7);
  bg.addColorStop(0, '#c4cbc2'); bg.addColorStop(0.65, MIC.fluid); bg.addColorStop(1, MIC.edge);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = bg; g.fillRect(0, 0, Wc, Hc);
  let rt0 = 0;
  try {
    if (stub) G = portraitWorld();
    rt0 = G.realT; G.realT = t;
    ctx = g; W = Wc; H = Hc; WORLD_DF = false;
    const sperm = e.def.shape === 'sperm';
    // Swimmers are mostly tail: fit the whole length. Everything else fills about two thirds of the frame.
    S = sperm ? Wc * 0.95 / (e.r * 10) : Math.min(Wc, Hc) * (e.boss ? 0.27 : 0.3) / e.r;
    e.age = t; e.x = t * 90; e.y = Math.sin(t * 1.1 + e.id) * 2;
    if (sperm) { e.face = 0; e.vx = 90; e.vy = 0; }
    G.player.x = e.x + 1e5; G.player.y = e.y;
    cam.x = e.x - (sperm ? e.r * 3.2 : 0); cam.y = 0;
    drawEnemy(e, false);
  } finally {
    ctx = keep.ctx; W = keep.W; H = keep.H; S = keep.S; cam.x = keep.cx; cam.y = keep.cy; RAW_COL = keep.raw; WORLD_DF = keep.df;
    if (stub) G = null; else G.realT = rt0;
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  if (dark) {
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(14,16,18,0.94)'; g.fillRect(0, 0, Wc, Hc);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.font = `900 ${Math.round(Hc * 0.3)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', Wc / 2, Hc / 2);
  }
}
// Start animating the portraits inside root (the Field Guide screen, or the pause menu's Field Guide tab).
function portraitsStart(root) {
  PORT.root = root;
  if (!PORT.on) { PORT.on = true; requestAnimationFrame(portraitFrame); }
}
function portraitFrame(now) {
  const root = PORT.root, cs = root && root.isConnected && root.getClientRects().length ? root.querySelectorAll('canvas.cdxp') : [];
  if (!cs.length) { PORT.on = false; return; }
  requestAnimationFrame(portraitFrame);
  if (now - PORT.last < 33) return; // 30 fps is plenty
  PORT.last = now;
  const dpr = Math.min(2, window.devicePixelRatio || 1), vh = window.innerHeight;
  for (const c of cs) {
    if (c.dataset.bad) continue;
    const r = c.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > vh) continue;
    if (c.width !== Math.round(r.width * dpr)) { c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); }
    const key = c.dataset.pk + ':' + c.dataset.pe;
    try {
      const e = PORT.ents[key] || (PORT.ents[key] = portraitFoe(c.dataset.pk, c.dataset.pe));
      const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFoePortrait(g, r.width, r.height, e, now / 1000 + (e.id % 17), !!c.dataset.dark);
    } catch (err) { c.dataset.bad = 1; ERRS.last = 'portrait ' + key + ': ' + (err && err.message); }
  }
}
// The canvas tag for one portrait.
function portraitTag(kind, id, met) { return `<canvas class="cdxp" data-pk="${kind}" data-pe="${id}"${met ? '' : ' data-dark="1"'}></canvas>`; }
