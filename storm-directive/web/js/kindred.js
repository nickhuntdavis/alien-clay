'use strict';
// Spawn Prawn - kindred spirits (V11 brief, 21 Oct): rescue another sample mid-race and absorb it.
//  - The Race only (raceOn). At KIN.at (03:00 and 06:00) a stranded sperm of another sample appears KIN.dist from you.
//    A gold chevron on the screen edge points to it until you reach it (it never expires: a late rescue still counts).
//  - Swim into it: it is absorbed at once (kinAbsorb), then the Weapon Draft screen (CHOOSE YOUR DIFFERENCE, full pause)
//    shows who it is and its passive, and offers its three weapons. Your body takes on its look (grafts, below). Absorbing does three things:
//      1. its passive works alongside your own (samples10.js s10Has);
//      2. its three weapons join this run's weapon pool (kinPool: race drafts only offer your sample's and absorbed ones);
//      3. it unlocks as a starter for later runs (META.s10; S10_ALL still opens everything while testing).
//    The weapon you pick is equipped straight away on a new mount (KIN.mount). Weapons in a race: the first, a
//    draft at Lv 5 (KIN.slots, not SLOT_LEVELS' Lv 12) and one per rescue: four drafts, four weapons.
//    If you already hold every carried weapon, drafts fall back to the whole roster (never an empty screen).
//  - The rescue screen has the rescued sample's live portrait at the top (kinPic). Picking a weapon or skipping plays the
//    fusion (kinFuse): you and it swim together, flash, and you come out wearing its look; the run stays paused.
//  - Which sample: one you have never rescued (META.s10, read directly so S10_ALL does not hide it), else any other one
//    you are not carrying. KIN.skip keeps proposed samples out.
// Hooks: render.js drawHud -> kinPointers; sigweap.js v10Pool -> kinPool; game.js levelling -> kinSlotLv. Wraps v10Tick, v10Draw, draftBox, v10Loot,
// UI.openLoot and samplelooks.js slDraw (loads last, after ui.js).

const KIN = { at: [180, 360], dist: 900, touch: 46, mount: 1, skip: ['acro'], extras: ['prawn'], slots: [5] };
// game.js levelling: a race grows a weapon mount only at KIN.slots (the rescues bring the rest), elsewhere SLOT_LEVELS.
const kinSlotLv = lv => (raceOn() ? KIN.slots : SLOT_LEVELS).includes(lv);
const kinHas = id => !!(G && G.kin && G.kin.has.includes(id));

function kinInit() {
  if (G.kin || !G.s10) return;
  G.kin = { has: [G.s10.id], spirits: [], n: 0 };
}

// Race weapon drafts: only weapons whose sample you started as or absorbed (sigweap.js v10Pool).
function kinPool(id) {
  if (!raceOn() || typeof W24 === 'undefined') return true;
  kinInit(); if (!G.kin) return true;
  const r = W24.find(r => r[0] === id);
  if (!r || G.kin.has.includes(r[4])) return true;
  // Every carried weapon already held (a Recycle, a combo mount): open the rest rather than deal an empty draft.
  return W24.filter(x => G.kin.has.includes(x[4])).every(x => G.weapons.some(w => w && (w.sid || w.id) === x[0]));
}

function kinChoose() {
  const cand = SAMPLES10.filter(s => !kinHas(s.id) && !KIN.skip.includes(s.id) && s.weapons && s.weapons.length && !G.kin.spirits.some(k => k.id === s.id));
  const fresh = cand.filter(s => !(META.s10 && META.s10[s.id]));
  const pool = fresh.length ? fresh : cand;
  return pool.length ? pick(pool).id : null;
}
function kinSpawn() {
  const id = kinChoose(); if (!id) return;
  const p = G.player;
  let x = p.x, y = p.y;
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * TAU;
    x = p.x + Math.cos(a) * KIN.dist; y = p.y + Math.sin(a) * KIN.dist;
    if (typeof terrainDanger !== 'function' || !terrainDanger(x, y, 60)) break;
  }
  G.kin.spirits.push({ id, x, y, vx: 0, vy: 0, tailV: 60, face: Math.random() * TAU, t: 0 });
  banner('ONE OF YOUR OWN, STRANDED', PAL.reward);
  sfx('level'); vibrate(80);
}

// Every frame (wraps v10Tick).
function kinTick(dt) {
  if (!raceOn() || G.state !== 'play' || !G.s10) return;
  kinInit();
  const K = G.kin, p = G.player;
  while (K.n < KIN.at.length && G.t >= KIN.at[K.n]) { K.n++; kinSpawn(); }
  for (const s of K.spirits) {
    s.t += dt;
    // Stranded: it wriggles on the spot, turning slowly.
    s.face += Math.sin(s.t * 0.7) * 0.4 * dt;
    s.vx = Math.cos(s.face) * 60; s.vy = Math.sin(s.face) * 60;
    if (Math.hypot(s.x - p.x, s.y - p.y) < KIN.touch + (p.r || 12)) { s.got = true; kinRescue(s); }
  }
  K.spirits = K.spirits.filter(s => !s.got);
}

function kinRescue(s) {
  kinAbsorb(s.id);
  ring(s.x, s.y, 80, PAL.reward, 0.6, 6);
  G.lootQueue.unshift({ kind: 'kindred', id: s.id, now: true });
}
// Its passive, its weapons in the pool, and the unlock.
function kinAbsorb(id) {
  const K = G.kin, sm = S10_BY[id];
  if (K.has.includes(id)) return;
  K.has.push(id);
  if (sm.evasion) G.s10.ev = Math.max(G.s10.ev || 0, sm.evasion); // (Ordered Online's built-in Evasion)
  if (id === 'baseline' && G.genes) { PROFILES.s10_baseline.apply(G.P, 1); G.genes.applied.push(['s10_baseline', 1]); }
  (META.s10 || (META.s10 = {}))[id] = 1; saveMeta();
  G.stats.kin = K.has.slice(1);
  if (typeof recomputeAll === 'function') recomputeAll();
}

// The card screen: its three weapons, the pick goes on a new mount.
function kinCards(req) {
  const sm = S10_BY[req.id];
  return sm.weapons.filter(id => WEAPONS[id]).map(id => {
    const o = optNewWeapon(id, 0), eq = o.apply;
    o.apply = () => {
      if (!G.weapons.some(w => !w) && KIN.mount) { G.weapons.push(null); G.comboMounts = (G.comboMounts || 0) + KIN.mount; }
      eq();
    };
    return o;
  });
}

// ---------------------------------------------------------------- drawing
// Grafts (user, 21 Oct: you take on some of the rescued sample's body, as v9's spliced sequences did): your tail is
// split into lengths, yours at the root and each absorbed sample's after it in rescue order (Beta's coiled tip, Redtail's
// fray, Private Schooled's braided cord, Ordered Online's links). Not of This World, having no tail, grafts a glow down
// your whole tail in its current colour. Prawn Again also brings its halo (KIN.extras). An alien player takes no graft.
const kinGrafts = () => (G.kin.has.length > 1 && G.s10.id !== 'alien' ? G.kin.has.slice(1) : []);
function kinTail(own, g, t, k, a, now, B, sc) {
  const tails = g.filter(id => SL_TAIL[id]), n = t.length, cut = [0.5, 0.38][tails.length - 1] || 0.38;
  if (!tails.length || n < 8) own(t, k, a, now, B, sc);
  else {
    const at = [0, ...tails.map((_, i) => Math.round(n * (cut + (1 - cut) * i / tails.length))), n - 1];
    own(t.slice(0, at[1] + 1), k, a, now, B, sc);
    tails.forEach((id, i) => SL_TAIL[id](t.slice(at[i + 1], at[i + 2] + 1), k, a, now, B, sc));
  }
  if (g.includes('alien')) { // (its glow, in Adaptive Biology's current colour)
    const c = ELEMENTS[S10_BY.alien.shift[((G.s10 && G.s10.shiftI) || 0) % 3]].color;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * (0.5 + 0.2 * Math.sin(now * 4)); drawTail(t, c, 2.6 * k, 3.4 * k);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  }
}
// World space (wraps v10Draw): the stranded sperm, drawn as its own sample, with a slow gold halo.
function kinDraw() {
  if (!G || !G.kin || !G.kin.spirits.length) return;
  for (const s of G.kin.spirits) {
    const x = sx(s.x), y = sy(s.y), pulse = 0.5 + 0.5 * Math.sin(G.realT * 3);
    if (x < -200 || y < -200 || x > W + 200 || y > H + 200) continue;
    const rawc = RAW_COL; RAW_COL = true;
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.25 * pulse; ctx.strokeStyle = PAL.reward; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, (KIN.touch + 8 * pulse) * S, 0, TAU); ctx.stroke();
    ctx.restore();
    if (s.id === 'alien') { if (typeof alienDraw === 'function') alienDraw(x, y, s.face, null, 1, 1, s, G.realT, ELEMENTS.soul.color, 'curious'); }
    else if (typeof SL !== 'undefined' && SL[s.id]) slDraw(s.id, x, y, s.face, null, 1, 1, s, G.realT);
    RAW_COL = rawc;
  }
}
// render.js drawHud: a gold chevron to each waiting spirit (pointer is drawHud's own edge-arrow helper).
function kinPointers(pointer) {
  if (!G || !G.kin) return;
  for (const s of G.kin.spirits) pointer(s.x, s.y, PAL.reward, 1.2, 0.75 + 0.25 * Math.sin(G.realT * 6));
}

// ---------------------------------------------------------------- wrappers
{
  const tick = v10Tick, draw = v10Draw, box = draftBox, loot = v10Loot, open = UI.openLoot, sl = slDraw;
  // Your body wears what you absorbed (samplelooks.js slDraw, you only).
  slDraw = function (id, x, y, face, tag, alpha, scale, body, now) {
    const T = SL_TAIL[id], g = body.kinG || (G && body === G.player && G.kin ? kinGrafts() : []); // (body.kinG: the fusion's bodies)
    if (!g.length) return sl(id, x, y, face, tag, alpha, scale, body, now);
    SL_TAIL[id] = (t, k, a, n, B, sc) => kinTail(T, g, t, k, a, n, B, sc);
    try { sl(id, x, y, face, tag, alpha, scale, body, now); } finally { SL_TAIL[id] = T; }
    for (const gid of g) if (SL_OVER[gid] && KIN.extras.includes(gid)) { SL_OVER[gid](x, y, face, S * (scale || 1) * SL[id].size, alpha, now, body.sl, body, (scale || 1) * SL[id].size); ctx.globalAlpha = 1; }
  };
  v10Tick = function (dt) { tick(dt); if (V10 && G) kinTick(dt); };
  v10Draw = function () { draw(); if (V10) kinDraw(); };
  draftBox = function (req) { return req.kind === 'kindred' ? (S10_BY[req.id] ? true : false) : box(req); }; // (full pause, never held back)
  v10Loot = function (req) { return req.kin ? kinCards({ id: req.kin }) : loot(req); };
  // The pick is a weapon choice, so it gets the Weapon Draft screen (the one the starting weapons use), headed for the sample.
  UI.openLoot = function (req) {
    if (req.kind !== 'kindred') return open.call(UI, req);
    const sm = S10_BY[req.id];
    UI.openDraft(Object.assign(req, { kind: 'slot', kin: req.id }));
    $('dKick').textContent = `${sm.name.toUpperCase()} | ${sm.passive.toUpperCase()}`;
    $('dTitle').textContent = 'CHOOSE YOUR DIFFERENCE';
    $('dSub').textContent = sm.pdesc;
  };
  // Its live portrait above the heading (hidden on every other draft); the pick or the skip plays the fusion.
  const od = UI.openDraft, pk = UI.pickLoot;
  UI.openDraft = function (req) { od.call(UI, req); kinPic(req.kin || null); };
  UI.pickLoot = function (i, wuid) {
    const r = UI.lootReq; pk.call(UI, i, wuid);
    if (r && r.kin && G && G.state === 'play') kinFuse(r.kin);
  };
}

// ---------------------------------------------------------------- the rescue screen's portrait and the fusion
// The Weapon Draft screen, for a rescue, has the rescued sample swimming at the top (samplelooks.js slPicStart).
// (position:relative because canvases are absolute by default.)
function kinPic(id) {
  let cv = $('kinPic');
  if (!cv && !id) return;
  if (!cv) { cv = document.createElement('canvas'); cv.id = 'kinPic'; cv.style.cssText = 'position:relative;inset:auto;display:block;width:100%;margin:0 auto 6px'; $('dKick').parentNode.insertBefore(cv, $('dKick')); }
  if (!id) { cv.style.display = 'none'; delete cv.dataset.slpic; return; }
  cv.style.display = 'block'; cv.style.height = (id === 'alien' ? 140 : 120) + 'px'; cv.width = cv.height = 0;
  cv.dataset.slpic = id;
  if (typeof slPicStart === 'function') slPicStart();
}

// After the pick (or the skip): the two of you swim together, meet in a flash, and what comes out is you with its
// look grafted on (kinGrafts). The run stays paused; a tap after KIN.fuseMin seconds, or KIN.fuseMax, closes it.
Object.assign(KIN, { fuseMeet: 1.3, fuseFlash: 0.6, fuseMin: 2.6, fuseMax: 5 });
function kinFuse(id) {
  const you = G.s10.id, all = kinGrafts(), before = all.filter(x => x !== id);
  let el = $('kinFuse');
  if (!el) {
    el = document.createElement('div'); el.id = 'kinFuse';
    el.style.cssText = 'position:fixed;inset:0;z-index:60;display:none;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#2a200a,#000 70%)';
    el.innerHTML = '<canvas style="position:relative;inset:auto;width:100vw;height:58vh;display:block"></canvas><div class="kf-n" style="font:900 22px sans-serif;letter-spacing:3px;color:#ffd23f;text-align:center;opacity:0;transition:opacity .5s;padding:0 16px"></div>';
    document.body.appendChild(el);
  }
  const cv = el.querySelector('canvas'), nm = el.querySelector('.kf-n');
  nm.textContent = `${S10_BY[you].name.toUpperCase()} + ${S10_BY[id].name.toUpperCase()}`; nm.style.opacity = 0;
  el.style.display = 'flex';
  G.state = 'loot'; // (paused while it plays)
  const F = { you, id, t0: performance.now(), done: false,
    a: { x: -70, y: 0, vx: 140, vy: 0, tailV: 140, id: -3, kinG: before },
    b: { x: 70, y: 0, vx: -140, vy: 0, tailV: 140, id: -4 },
    r: { x: 0, y: 0, vx: 140, vy: 0, tailV: 140, id: -5, kinG: all } };
  UI.kinFuse = F;
  const close = () => {
    if (F.done) return; F.done = true; el.style.display = 'none'; UI.kinFuse = null;
    if (G && G.state === 'loot') G.state = 'play';
    lastTs = performance.now();
  };
  el.onpointerdown = e => { e.stopPropagation(); if ((performance.now() - F.t0) / 1000 >= KIN.fuseMin) close(); };
  sfx('level'); vibrate(120);
  const frame = () => {
    if (F.done) return;
    const T = (performance.now() - F.t0) / 1000;
    if (T >= KIN.fuseMax) { close(); return; }
    requestAnimationFrame(frame);
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(cv.clientWidth * dpr)) { cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr); }
    kinFuseDraw(cv, F, T);
    if (T > KIN.fuseMeet + KIN.fuseFlash * 0.6) nm.style.opacity = 1;
  };
  requestAnimationFrame(frame);
}
// One frame of the fusion, drawn with the world's own sample bodies (borrows the drawing globals like slPicDraw).
function kinFuseDraw(cv, F, T) {
  const g = cv.getContext('2d'), keep = { ctx, S, W, H, cx: cam.x, cy: cam.y, G }, real = G;
  try {
    ctx = g; W = cv.width; H = cv.height; S = Math.min(W / 240, H / 110); cam.x = 0; cam.y = 0; // (about 240 world units across: a whole fused sperm fits a phone's width)
    G = { realT: T, s10: real.s10 };
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    const rawc = RAW_COL; RAW_COL = true;
    const body = (id, b, face, alpha, scale) => {
      if (id === 'alien') { if (typeof alienDraw === 'function') alienDraw(sx(b.x), sy(b.y), face, null, alpha, scale, b, T, ELEMENTS[S10_BY.alien.shift[0]].color, 'curious'); return; }
      if (!SL[id]) return;
      const nat = id === 'baseline' || id === 'alpha' || id === 'beta';
      slDraw(id, sx(b.x), sy(b.y), face, nat ? PAL.you : null, alpha, scale, b, T);
    };
    const m = KIN.fuseMeet, f = KIN.fuseFlash;
    if (T < m + f * 0.5) { // swimming in, head to head
      const e = Math.min(1, T / m), k = e * e * (3 - 2 * e);
      F.a.x = -70 + 58 * k; F.b.x = 70 - 58 * k; F.a.y = Math.sin(T * 5) * 3; F.b.y = -Math.sin(T * 5) * 3;
      const al = T < m ? 1 : 1 - (T - m) / (f * 0.5);
      glow(W / 2, H / 2, (20 + 40 * k) * S, '#ffd23f', 0.25 * k);
      body(F.you, F.a, 0, al, 1.3); body(F.id, F.b, Math.PI, al, 1.3);
    }
    if (T >= m && T < m + f) { // the flash
      const p = (T - m) / f, a = Math.sin(p * Math.PI);
      g.globalCompositeOperation = 'lighter'; glow(W / 2, H / 2, (30 + 90 * p) * S, '#fff2c0', a); g.globalCompositeOperation = 'source-over';
      g.globalAlpha = a; g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.beginPath(); g.arc(W / 2, H / 2, (20 + 120 * p) * S, 0, TAU); g.stroke(); g.globalAlpha = 1;
    }
    if (T >= m + f * 0.5) { // what came out: you, wearing it
      const p = Math.min(1, (T - m - f * 0.5) / 0.6);
      F.r.y = Math.sin(T * 2) * 3; F.r.x = 48 + Math.sin(T * 0.9) * 4; // (head right of centre: the long tail trails left)
      glow(W / 2, H / 2, 70 * S, '#ffd23f', 0.15 * p);
      body(F.you, F.r, 0, p, 1 + 0.2 * p);
    }
    RAW_COL = rawc;
  } finally { ctx = keep.ctx; S = keep.S; W = keep.W; H = keep.H; cam.x = keep.cx; cam.y = keep.cy; G = keep.G; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
}
