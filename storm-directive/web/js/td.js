'use strict';
// Spawn Storm - the egg's healing glow and the Rewind / Paradox Echo time-travel mechanic.

// The real player, even while an echo temporarily stands in as G.player to fire its weapons.
function me() { return G.realPlayer || G.player; }

// ---------------------------------------------------------------- the egg (heals you nearby)
function makeCore() { return { x: 0, y: 0, r: CORE.r, flash: 0 }; }
function newChrono() { return { energy: 0, charges: CHRONO.startCharges, max: CHRONO.maxCharges, snaps: [], snapT: 0, path: [] }; }

function updateCore(dt) {
  const core = G.core, p = me();
  if (core.flash > 0) core.flash -= dt;
  // Standing in the egg's glow slowly heals you.
  if (Math.hypot(p.x - core.x, p.y - core.y) < CORE.sanctuary) healPlayer(2.5 * dt, true);
}

// Scrap only matters to weapons that fire it.
function ownsScrapWeapon() { return G.weapons.some(w => w && w.def.scrapAmmo); }
function dropScrap(x, y, v) { dropGem(x + rand(-8, 8), y + rand(-8, 8), v * G.P.scrap, 's'); }

// ---------------------------------------------------------------- chrono: rewind & paradox echoes
function takeSnap() {
  const p = me();
  return {
    t: G.t, px: p.x, py: p.y, hp: p.hp,
    enemies: G.enemies.filter(e => !e.dead).map(e => Object.assign({}, e, { hitT: {} })),
    ebul: G.ebul.filter(b => !b.dead).map(b => Object.assign({}, b)),
    nextBoss: G.nextBoss, nextWave: G.nextWave, bossCount: G.bossCount, surge: G.surge,
  };
}

function gainChrono(v) {
  const c = G.chrono;
  if (c.charges >= c.max) { c.energy = Math.min(c.energy, CHRONO.energyPerCharge); return; }
  c.energy += v * G.P.chronoGain;
  if (c.energy >= CHRONO.energyPerCharge) {
    c.energy = 0; c.charges++;
    banner('REWIND CHARGE READY', '#8dffc0');
    sfx('spell');
  }
}

function updateChrono(dt) {
  const c = G.chrono, p = me();
  c.path.push({ t: G.t, x: p.x, y: p.y });
  while (c.path.length && c.path[0].t < G.t - CHRONO.window - 0.3) c.path.shift();
  c.snapT -= dt;
  if (c.snapT <= 0) {
    c.snapT = CHRONO.snapEvery;
    c.snaps.push(takeSnap());
    while (c.snaps.length && c.snaps[0].t < G.t - CHRONO.window) c.snaps.shift();
  }
  updateEchoes(dt);
}

// Rewind time by up to CHRONO.window seconds. Your "future self" becomes a Paradox Echo that walks
// backwards through the timeline you just erased, firing copies of your weapons, then collapses.
function startRewind(auto) {
  const c = G.chrono;
  if (!G || G.state !== 'play' || c.charges < 1 || c.snaps.length < 2) return false;
  c.charges--;
  const target = c.snaps[0], now = takeSnap();
  const span = Math.max(0.5, G.t - target.t);
  const p = me();
  const echo = {
    path: c.path.filter(q => q.t >= target.t).map(q => ({ t: q.t - target.t, x: q.x, y: q.y })),
    t: 0, dur: span + 0.6, x: p.x, y: p.y, hp: 1, r: 12, face: p.face, vx: 0, vy: 0, iframes: 0, flash: 0,
    weapons: G.weapons.filter(Boolean).map(w => { const k = makeSlot(w.id, false, w.lvl); k.dir = w.dir; k.echo = true; k.mods = w.mods.slice(); k.perks = Object.assign({}, w.perks); k.dirs = w.dirs && w.dirs.slice(); computeStats(k); return k; }),
    spells: G.P.echoInherit ? G.spells.filter(Boolean).map(w => { const k = makeSlot(w.id, true, w.lvl); k.dir = w.dir; k.echo = true; return k; }) : [],
    span,
  };
  if (!echo.path.length) echo.path.push({ t: 0, x: p.x, y: p.y });
  if (G.P.echoInherit) echo.dur = span * 2 + 0.6;
  achieve(auto ? 'autorewind' : 'rewind');
  sysLine('rewind', true);
  addViewers(3000);
  G.rewind = { frames: [now].concat(c.snaps.slice().reverse()), t: 0, dur: CHRONO.animDur, echo, auto, target };
  G.state = 'rewind';
  G.stats.rewinds++;
  INPUT.active = false; G.manual = null;
  sfx('rewind'); vibrate(80);
  return true;
}

function applySnapForView(s) {
  G.enemies = s.enemies; G.ebul = s.ebul;
  G.player.x = s.px; G.player.y = s.py; G.player.hp = s.hp; G.t = s.t;
}

function updateRewind(dt) {
  const r = G.rewind;
  r.t += dt; G.realT += dt;
  const k = Math.min(1, r.t / r.dur);
  // Ease so the scrub accelerates then settles.
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const idx = Math.min(r.frames.length - 1, Math.floor(e * (r.frames.length - 1) + 0.0001));
  applySnapForView(r.frames[idx]);
  for (const q of G.parts) { q.x -= q.vx * dt; q.y -= q.vy * dt; q.life -= dt; } // particles run backwards
  for (const f of G.fx) f.life -= dt;
  for (const t of G.texts) t.life -= dt;
  compactArr(G.parts, x => x.life > 0); compactArr(G.fx, x => x.life > 0); compactArr(G.texts, x => x.life > 0);
  cam.x = lerp(cam.x, G.player.x, 0.2); cam.y = lerp(cam.y, G.player.y, 0.2);
  if (k < 1) return;
  // Land in the past.
  const s = r.target;
  applySnapForView(s);
  G.proj = []; G.timers = []; G.lights = [];
  G.nextBoss = s.nextBoss; G.nextWave = s.nextWave; G.bossCount = s.bossCount; G.surge = s.surge;
  if (G.bossDead) G.enemies = G.enemies.filter(x => !(x.boss && G.bossDead[x.id]));
  G.boss = G.enemies.find(x => x.boss && !x.egg) || null;
  G.eggE = G.enemies.find(x => x.egg) || null;
  const P = G.P;
  if (r.auto) G.player.hp = Math.max(G.player.hp, P.maxHp * 0.3);
  G.player.hp = Math.max(1, G.player.hp);
  G.player.iframes = 1.5;
  G.echoes.push(r.echo);
  G.chrono.snaps = []; G.chrono.path = []; G.chrono.snapT = 0;
  G.rewind = null;
  G.state = 'play';
  banner(r.auto ? 'PARADOX SAVE: YOUR FUTURE SELF FIGHTS ON' : 'PARADOX ECHO DEPLOYED', '#8dffc0');
  ring(G.player.x, G.player.y, 90, '#8dffc0', 0.6, 5);
}

function echoPos(echo) {
  // The echo walks the erased timeline in reverse: from where you were, back to where you are.
  const tt = Math.max(0, echo.span * (1 - echo.t / (echo.dur - 0.6))), path = echo.path;
  let i = path.length - 1;
  while (i > 0 && path[i - 1].t >= tt) i--;
  const a = path[Math.max(0, i - 1)], b = path[i];
  const k = b.t === a.t ? 0 : clamp((tt - a.t) / (b.t - a.t), 0, 1);
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
}

function updateEchoes(dt) {
  if (!G.echoes.length) return;
  const real = G.player;
  for (const echo of G.echoes) {
    echo.t += dt;
    const pos = echoPos(echo);
    echo.vx = (pos.x - echo.x) / Math.max(dt, 1e-3); echo.vy = (pos.y - echo.y) / Math.max(dt, 1e-3);
    echo.x = pos.x; echo.y = pos.y;
    if (echo.t < echo.dur - 0.6) {
      G.realPlayer = real; G.player = echo;
      try { for (const w of echo.weapons) updateWeapon(w, dt); updateSpellList(echo.spells, dt); } finally { G.player = real; G.realPlayer = null; }
    } else if (!echo.collapsed) {
      // Paradox collapse: the echo implodes, wiping nearby bullets and blasting enemies.
      echo.collapsed = true;
      const dmg = 30 * (1 + G.t / 90) * G.P.might;
      aoe(echo.x, echo.y, 190, dmg, { elem: 'arcane', wname: 'Paradox collapse' }, '#8dffc0');
      for (const b of G.ebul) if (Math.hypot(b.x - echo.x, b.y - echo.y) < 190) b.dead = true;
      addLight(echo.x, echo.y, 260, '#8dffc0', 0.7);
    }
    if (echo.t >= echo.dur) echo.dead = true;
  }
  compactArr(G.echoes, e => !e.dead);
}
