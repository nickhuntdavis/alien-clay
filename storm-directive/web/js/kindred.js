'use strict';
// Spawn Prawn - kindred spirits (V11 brief, 21 Oct): rescue another sample mid-race and absorb it.
//  - The Race only (raceOn). At KIN.at (05:00 and 10:00) a stranded sperm of another sample appears KIN.dist from you.
//    A gold chevron on the screen edge points to it until you reach it (it never expires: a late rescue still counts).
//  - Swim into it: it is absorbed at once (kinAbsorb), then a full-pause card screen (CHOOSE YOUR DIFFERENCE) shows
//    who it is and its passive, and offers its three weapons. Absorbing does three things:
//      1. its passive works alongside your own (samples10.js s10Has);
//      2. its three weapons join this run's weapon pool (kinPool: race drafts only offer your sample's and absorbed ones);
//      3. it unlocks as a starter for later runs (META.s10; S10_ALL still opens everything while testing).
//    The weapon you pick is equipped straight away on a new mount (KIN.mount: every 3 mounts are full by 05:00).
//    If you already hold every carried weapon, drafts fall back to the whole roster (never an empty screen).
//  - Which sample: one you have never rescued (META.s10, read directly so S10_ALL does not hide it), else any other one
//    you are not carrying. KIN.skip keeps proposed samples out.
// Hooks: render.js drawHud -> kinPointers; sigweap.js v10Pool -> kinPool. Wraps v10Tick, v10Draw, draftBox, v10Loot,
// draftTitle and UI.openLoot (loads last, after ui.js).

const KIN = { at: [300, 600], dist: 900, touch: 46, mount: 1, skip: ['acro'] };
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
  banner('TODO_COPY:kin_banner', PAL.reward);
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
  const tick = v10Tick, draw = v10Draw, box = draftBox, loot = v10Loot, title = draftTitle, open = UI.openLoot;
  v10Tick = function (dt) { tick(dt); if (V10 && G) kinTick(dt); };
  v10Draw = function () { draw(); if (V10) kinDraw(); };
  draftBox = function (req) { return req.kind === 'kindred' ? (S10_BY[req.id] ? true : false) : box(req); }; // (full pause, never held back)
  v10Loot = function (req) { return req.kind === 'kindred' ? kinCards(req) : loot(req); };
  draftTitle = function (req) {
    if (req.kind !== 'kindred') return title(req);
    const sm = S10_BY[req.id];
    return ['CHOOSE YOUR DIFFERENCE', `${sm.name}. ${sm.passive}: ${sm.pdesc}`];
  };
  UI.openLoot = function (req) {
    open.call(UI, req);
    if (req.kind === 'kindred') { $('rerollBtn').style.display = 'none'; $('skipBtn').style.display = 'none'; }
  };
}
