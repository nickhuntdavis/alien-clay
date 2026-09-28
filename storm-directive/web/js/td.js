'use strict';
// Storm Directive - Chrono Anchor tower defence (pads, towers, siege rifts, scrap) and the
// Rewind / Paradox Echo time-travel mechanic.

// The real player, even while an echo temporarily stands in as G.player to fire its weapons.
function me() { return G.realPlayer || G.player; }

// ---------------------------------------------------------------- setup
function makeCore() { return { x: 0, y: 0, r: CORE.r, hp: CORE.hp, maxHp: CORE.hp, flash: 0 }; }
function makePads() {
  const pads = [];
  const ringOf = (n, r, off) => { for (let i = 0; i < n; i++) { const a = off + i / n * TAU; pads.push({ id: pads.length, x: Math.cos(a) * r, y: Math.sin(a) * r, tower: null }); } };
  ringOf(4, 150, Math.PI / 4);
  ringOf(8, 330, 0);
  return pads;
}
function newChrono() { return { energy: 0, charges: CHRONO.startCharges, max: CHRONO.maxCharges, snaps: [], snapT: 0, path: [] }; }

// ---------------------------------------------------------------- towers
// Each tower you already own makes the next one 30% pricier.
function towerCost(type) { return Math.round(TOWERS[type].cost * G.P.towerCost * (1 + 0.3 * G.pads.filter(p => p.tower).length)); }
function upgradeCost(t) { return Math.round(TOWERS[t.type].cost * t.lvl * G.P.towerCost); }
// Towers scale with level, the Engineer passive, half of Might, and "Anchor resonance" over time.
function towerStats(t) {
  const d = TOWERS[t.type], L = t.lvl, P = G.P;
  const resonance = 1 + G.t / 360;
  return {
    dmg: d.dmg * (1 + 0.5 * (L - 1)) * P.tower * (1 + (P.might - 1) * 0.5) * (t.type === 'beacon' ? 1 : resonance),
    rate: d.rate * (1 - 0.12 * (L - 1)),
    range: d.range * (1 + 0.12 * (L - 1)),
    area: (d.area || 0) * (1 + 0.15 * (L - 1)),
    chain: (d.chain || 0) + (L - 1) * 0.5 | 0,
  };
}
function makeTowerW(type) {
  const d = TOWERS[type];
  return { uid: uidSeq++, dir: d.dir || 'nearest', def: { name: d.name, elem: d.elem, color: d.color, style: 'bullet', base: { explode: 1 } },
    s: { dmg: d.dmg, speed: 640, size: 4, range: d.range, pierce: 0, spread: 0, count: 1, area: d.area || 0, dur: 0 } };
}
function buildTower(padId, type) {
  const pad = G.pads[padId], cost = towerCost(type);
  if (!pad || pad.tower || G.scrap < cost) return false;
  G.scrap -= cost;
  pad.tower = { type, lvl: 1, dir: TOWERS[type].dir, cd: 0.4, face: -Math.PI / 2, flash: 0, spent: cost, w: makeTowerW(type), born: G.realT };
  ring(pad.x, pad.y, 60, TOWERS[type].color, 0.5, 4);
  if (!G.show.achieved.tower || Math.random() < 0.3) sysLine('tower');
  achieve('tower');
  addLight(pad.x, pad.y, 120, TOWERS[type].color, 0.6);
  sfx('level');
  return true;
}
function upgradeTower(padId) {
  const t = G.pads[padId] && G.pads[padId].tower;
  if (!t || t.lvl >= TOWER_MAX_LVL) return false;
  const c = upgradeCost(t);
  if (G.scrap < c) return false;
  G.scrap -= c; t.spent += c; t.lvl++;
  ring(G.pads[padId].x, G.pads[padId].y, 70, '#ffd23f', 0.5, 4);
  sfx('level');
  return true;
}
function sellTower(padId) {
  const pad = G.pads[padId];
  if (!pad || !pad.tower) return;
  G.scrap += Math.floor(pad.tower.spent * 0.5);
  achieve('sell');
  spawnPart(pad.x, pad.y, '#ffd23f', 12, 140, 0.5);
  pad.tower = null;
}

function updateTowers(dt) {
  const core = G.core, p = me();
  for (const pad of G.pads) {
    const t = pad.tower;
    if (!t) continue;
    const d = TOWERS[t.type], st = towerStats(t);
    t.cd -= dt; if (t.flash > 0) t.flash -= dt;
    t.w.s.dmg = st.dmg; t.w.s.range = st.range; t.w.s.area = st.area; t.w.dir = t.dir || 'nearest';
    const src = { elem: d.elem, wname: d.name + ' (tower)', crit: G.P.crit };
    switch (t.type) {
      case 'cannon': {
        if (t.cd > 0) break;
        const tg = acquire(t.dir, st.range, pad.x, pad.y);
        if (!tg) break;
        const a = Math.atan2(tg.y - pad.y, tg.x - pad.x);
        t.face = a; t.cd = st.rate; t.flash = 0.08;
        spawnProj(t.w, pad.x + Math.cos(a) * 16, pad.y + Math.sin(a) * 16, a + rand(-0.04, 0.04), src);
        break;
      }
      case 'tesla': {
        if (t.cd > 0) break;
        const tg = acquire(t.dir, st.range, pad.x, pad.y);
        if (!tg) break;
        t.cd = st.rate; t.flash = 0.15;
        doChain(pad.x, pad.y - 18, tg, st.dmg, st.chain, 150, src);
        break;
      }
      case 'cryo': {
        if (t.cd > 0) break;
        let any = false;
        forNear(pad.x, pad.y, st.range, () => { any = true; return true; });
        if (!any) break;
        t.cd = st.rate; t.flash = 0.2;
        forNear(pad.x, pad.y, st.range, e => { damageEnemy(e, st.dmg, src); });
        ring(pad.x, pad.y, st.range, '#bde0fe', 0.45, 3);
        break;
      }
      case 'mortar': {
        if (t.cd > 0) break;
        const tg = acquire(t.dir, st.range, pad.x, pad.y);
        if (!tg) break;
        t.cd = st.rate; t.face = Math.atan2(tg.y - pad.y, tg.x - pad.x); t.flash = 0.15;
        G.proj.push({ lob: true, sx: pad.x, sy: pad.y, tx: tg.x, ty: tg.y, x: pad.x, y: pad.y, t: 0, flight: 1.1, w: t.w, src, color: d.color, dead: false });
        break;
      }
      case 'stasis': {
        const until = G.realT + 0.15, r2 = st.range * st.range;
        forNear(pad.x, pad.y, st.range, e => { e.stasisT = until; });
        for (const b of G.ebul) { const dx = b.x - pad.x, dy = b.y - pad.y; if (dx * dx + dy * dy < r2) b.slowT = until; }
        t.face += dt * 1.3;
        break;
      }
      case 'beacon': {
        core.hp = Math.min(core.maxHp, core.hp + st.dmg * dt);
        if (Math.hypot(p.x - pad.x, p.y - pad.y) < st.range) healPlayer(st.dmg * 0.5 * dt, true);
        break;
      }
    }
  }
}

// ---------------------------------------------------------------- the Anchor
function updateCore(dt) {
  const core = G.core, p = me();
  if (core.flash > 0) core.flash -= dt;
  core.hp = Math.min(core.maxHp, core.hp + CORE.regen * dt);
  // Sanctuary: standing near the Anchor slowly heals you.
  if (Math.hypot(p.x - core.x, p.y - core.y) < CORE.sanctuary) healPlayer(2 * dt, true);
}
function coreHit(dmg, from) {
  const core = G.core;
  if (G.state !== 'play') return;
  core.hp -= dmg; core.flash = 0.25;
  G.stats.leaks++;
  achieve('anchorhit');
  cam.shake = Math.min(12, cam.shake + 4);
  floatText(core.x, core.y - 50, '-' + Math.round(dmg), '#ff4d6d', 16);
  addLight(core.x, core.y, 160, '#ff4d6d', 0.4);
  sfx('hurt');
  if (core.hp <= 0) {
    core.hp = 0;
    G.stats.lastHit = 'Anchor overrun by ' + from;
    if (!startRewind(true)) gameOver();
  }
}

// ---------------------------------------------------------------- siege
function updateSiege(dt) {
  if (G.t >= G.nextSiege - SIEGE_WARN && !G.siegePending) {
    G.siegePending = true;
    const n = G.t < 400 ? 2 : 3, a0 = Math.random() * TAU;
    for (let i = 0; i < n; i++) {
      const a = a0 + i / n * TAU + rand(-0.35, 0.35);
      G.rifts.push({ x: Math.cos(a) * 1080, y: Math.sin(a) * 1080, warn: SIEGE_WARN, queue: 5 + Math.floor(G.t / 28), spawnT: 0, close: 0, age: 0, dead: false });
    }
    banner(`SIEGE: ${n} RIFTS OPENING`, '#c77dff');
    sysLine('siege', true);
    sfx('boss');
  }
  if (G.t >= G.nextSiege) { G.nextSiege += SIEGE_INTERVAL; G.siegePending = false; G.siegeCount++; }
  const pool = SIEGE_POOL.filter(id => ENEMIES[id].from <= G.t + 40);
  for (const r of G.rifts) {
    r.age += dt;
    if (r.warn > 0) { r.warn -= dt; continue; }
    if (r.queue > 0) {
      r.spawnT -= dt;
      if (r.spawnT <= 0 && G.enemies.length < CAPS.enemies) {
        r.spawnT = 0.42; r.queue--;
        const e = makeEnemy(ENEMIES[pick(pool)], r.x + rand(-20, 20), r.y + rand(-20, 20));
        e.siege = true; e.xp *= 1.5;
        G.enemies.push(e);
      }
    } else if ((r.close += dt) > 1.5) r.dead = true;
  }
}

function dropScrap(x, y, v) { dropGem(x + rand(-8, 8), y + rand(-8, 8), v * G.P.scrap, 's'); }

// ---------------------------------------------------------------- chrono: rewind & paradox echoes
function takeSnap() {
  const p = me();
  return {
    t: G.t, px: p.x, py: p.y, hp: p.hp, coreHp: G.core.hp,
    enemies: G.enemies.filter(e => !e.dead).map(e => Object.assign({}, e, { hitT: {} })),
    ebul: G.ebul.filter(b => !b.dead).map(b => Object.assign({}, b)),
    rifts: G.rifts.map(r => Object.assign({}, r)),
    nextBoss: G.nextBoss, nextWave: G.nextWave, nextSiege: G.nextSiege, siegePending: G.siegePending, bossCount: G.bossCount, surge: G.surge,
  };
}

function gainChrono(v) {
  const c = G.chrono;
  if (c.charges >= c.max) { c.energy = Math.min(c.energy, CHRONO.energyPerCharge); return; }
  c.energy += v * G.P.chronoGain;
  if (c.energy >= CHRONO.energyPerCharge) {
    c.energy = 0; c.charges++;
    banner('REWIND CHARGE READY', '#7df9ff');
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
    weapons: G.weapons.filter(Boolean).map(w => { const k = makeSlot(w.id, false, w.lvl); k.dir = w.dir; k.echo = true; k.mods = w.mods.slice(); k.dirs = w.dirs && w.dirs.slice(); computeStats(k); return k; }),
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
  G.enemies = s.enemies; G.ebul = s.ebul; G.rifts = s.rifts;
  G.player.x = s.px; G.player.y = s.py; G.player.hp = s.hp; G.core.hp = s.coreHp; G.t = s.t;
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
  G.nextBoss = s.nextBoss; G.nextWave = s.nextWave; G.nextSiege = s.nextSiege; G.siegePending = s.siegePending; G.bossCount = s.bossCount; G.surge = s.surge;
  G.boss = G.enemies.find(x => x.boss) || null;
  const P = G.P;
  if (r.auto) { G.player.hp = Math.max(G.player.hp, P.maxHp * 0.5); G.core.hp = Math.max(G.core.hp, G.core.maxHp * 0.35); }
  G.player.hp = Math.max(1, G.player.hp); G.core.hp = Math.max(1, G.core.hp);
  G.player.iframes = 1.5;
  G.echoes.push(r.echo);
  G.chrono.snaps = []; G.chrono.path = []; G.chrono.snapT = 0;
  G.rewind = null;
  G.state = 'play';
  banner(r.auto ? 'PARADOX SAVE: YOUR FUTURE SELF FIGHTS ON' : 'PARADOX ECHO DEPLOYED', '#7df9ff');
  ring(G.player.x, G.player.y, 90, '#7df9ff', 0.6, 5);
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
      aoe(echo.x, echo.y, 190, dmg, { elem: 'arcane', wname: 'Paradox collapse' }, '#7df9ff');
      for (const b of G.ebul) if (Math.hypot(b.x - echo.x, b.y - echo.y) < 190) b.dead = true;
      addLight(echo.x, echo.y, 260, '#7df9ff', 0.7);
    }
    if (echo.t >= echo.dur) echo.dead = true;
  }
  compactArr(G.echoes, e => !e.dead);
}
