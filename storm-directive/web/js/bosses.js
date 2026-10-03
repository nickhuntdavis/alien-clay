'use strict';
// Spawn Prawn - bosses: the run's roster (four of eight), the cinematic introduction, each boss's own
// abilities, strengths and weaknesses, the slow-motion death and the relic you choose afterwards.

// ---------------------------------------------------------------- roster & spawning
function bossRoster() { return shuffle(BOSSES.map(b => b.id)).slice(0, BOSSES_PER_RUN); }
const bossDef = id => BOSSES.find(b => b.id === id);

function spawnBoss() {
  if (!G.bossRoster) G.bossRoster = bossRoster();
  const idx = G.bossCount, round = Math.floor(idx / BOSSES_PER_RUN);
  const def = bossDef(G.bossRoster[idx % BOSSES_PER_RUN]);
  // Close enough to see: the introduction pans to it, and the fight starts right away.
  const a0 = Math.random() * TAU, p = me();
  const s = { x: p.x + Math.cos(a0) * 380, y: p.y + Math.sin(a0) * 380, a: a0 };
  const mk = (x, y) => {
    const e = makeEnemy(def, x, y);
    e.boss = true;
    // Proper fights: each boss in a run is much tougher than the last (your build grows fast too).
    e.hp = e.maxHp = def.hp * 5 * (1 + (idx % BOSSES_PER_RUN) * 0.9) * Math.pow(2.4, idx % BOSSES_PER_RUN) * (1 + PT() / 320) * (1 + 0.05 * levelsAhead()) * (1 + round * 4);
    e.armour = def.armour + round * 4;
    e.speed = def.speed;
    e.dmg = def.dmg * dmgNow();
    heatBoss(e); // Immune Response
    e.pat = 0; e.patT = 0; e.fireT = 0; e.st = 0;
    return e;
  };
  const e = mk(s.x, s.y);
  G.enemies.push(e);
  G.boss = e;
  if (def.twins) {
    const t = mk(s.x + Math.cos(s.a + 1.2) * 110, s.y + Math.sin(s.a + 1.2) * 110);
    e.name = 'MITCH'; t.name = 'OSIS'; e.twin = t; t.twin = e; t.pat = 2;
    G.enemies.push(t);
  }
  G.bossCount++;
  META.bosses[def.id] = (META.bosses[def.id] || 0) + 1; saveMeta();
  addViewers(5000);
  startBossIntro(e, idx);
}
// After a rewind the twins are fresh copies: tie them back together.
function relinkTwins() {
  const ts = G.enemies.filter(x => x.boss && x.def.twins && !x.dead);
  if (ts.length === 2) { ts[0].twin = ts[1]; ts[1].twin = ts[0]; }
}

// ---------------------------------------------------------------- the introduction
// The world stops, the camera swims over to the boss, it roars, and its file card comes up.
function startBossIntro(e, idx) {
  G.bossIntro = { e, t: 0, idx, roar: false, z0: ZOOM.z };
  G.state = 'bossIntro';
  INPUT.active = false; G.manual = null;
  sfx('boss'); vibrate(160);
  if (typeof UI !== 'undefined') UI.openBossIntro(e, idx);
}
function updateBossIntro(dt) {
  const I = G.bossIntro;
  if (!I) { G.state = 'play'; return; }
  I.t += dt; G.realT += dt;
  const e = I.e, off = H * 0.16 / S;
  const k = 1 - Math.pow(0.015, dt);
  // Push the objective in on the boss (no knob clicks: this is the camera, not you).
  ZOOM.z = lerp(ZOOM.z, Math.min(ZOOM.max, I.z0 * 1.45), 1 - Math.pow(0.05, dt)); S = S0 * ZOOM.z;
  cam.x = lerp(cam.x, e.x, k); cam.y = lerp(cam.y, e.y + off, k);
  e.age += dt; e.flash = Math.max(0, e.flash - dt);
  if (e.twin) e.twin.age += dt;
  if (I.t > 0.7 && !I.roar) {
    I.roar = true;
    for (const b of [e, e.twin].filter(Boolean)) { ring(b.x, b.y, b.r * 3, b.def.color, 0.9, 10); spawnPart(b.x, b.y, b.def.color, 30, 260, 0.8, 4); addLight(b.x, b.y, b.r * 5, b.def.color, 1.2); b.flash = 0.15; }
    cam.shake = 14; sfx('boom'); vibrate(90);
  }
  if (I.roar && Math.random() < dt * 3) ring(e.x, e.y, e.r * (1.6 + Math.random()), e.def.color, 0.6, 3);
  for (const q of G.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.92; q.vy *= 0.92; q.life -= dt; }
  for (const f of G.fx) f.life -= dt;
  for (const l of G.lights) l.life -= dt;
  compactArr(G.parts, x => x.life > 0); compactArr(G.fx, x => x.life > 0); compactArr(G.lights, x => x.life > 0);
  cam.shake = Math.max(0, cam.shake - dt * 20);
}
function endBossIntro() {
  if (!G || G.state !== 'bossIntro') return;
  const e = G.bossIntro.e;
  ZOOM.z = G.bossIntro.z0; S = S0 * ZOOM.z;
  G.bossIntro = null;
  G.state = 'play';
  bossArrive(e);
  banner('FIGHT: ' + e.def.name, PAL.danger);
  sysMsg('SYSTEM MESSAGE', `${e.def.name}, ${e.def.title}, has entered the arena. ${pick(SYSTEM_LINES.boss)}`, PAL.danger, true);
  lastTs = performance.now();
  if (typeof UI !== 'undefined') { UI.show('hud'); UI.refreshHud(true); }
}

// ---------------------------------------------------------------- strengths & weaknesses
let IN_AOE = false; // set while aoe() deals its damage, for bosses weak to blasts
function bossDamageMul(e, src) {
  const d = e.bossDef || e.def;
  let m = 1;
  const el = src.elem;
  if (el && d.weak && d.weak[el]) m *= d.weak[el];
  if (el && d.resist && d.resist[el] != null) m *= d.resist[el];
  if (d.weakAoe && (IN_AOE || src.zoneHit)) m *= d.weakAoe;
  if (e.glaring) m *= 2;
  if (e.winded > G.t) m *= 2;
  if (e.nurses && e.nurses.length && e.nurses.every(n => n.dead)) m *= 1.5;
  if (m !== 1 && !(e.weakLblT > G.realT) && !src.dot) {
    e.weakLblT = G.realT + 0.9;
    floatText(e.x, e.y - e.r - 18, m > 1 ? 'WEAK POINT!' : m === 0 ? 'IMMUNE' : 'RESISTED', m > 1 ? PAL.reward : XR.dim, m > 1 ? 14 : 12, 0.8);
  }
  return m;
}
// Chad Prime flexes out of the way of a shot (true: it missed).
function bossDodges(e) {
  if (!e.def.dodge || e.winded > G.t || Math.random() > e.def.dodge) return false;
  if (!(e.missT > G.realT)) { e.missT = G.realT + 0.4; floatText(e.x, e.y - e.r - 12, 'FLEX. MISS.', XR.white, 12, 0.6); }
  return true;
}

// ---------------------------------------------------------------- abilities (from bossAI)
function bossSpecial(e, pat, dt, dist, ux, uy, aim, bd) {
  const p = G.player;
  switch (pat) {
    case 'devour': {
      // The Queen pulls her own minions in and eats them.
      e.mvs = e.speed * 0.4;
      forNear(e.x, e.y, 290, o => {
        if (o === e || o.boss || o.rival || o.charmed || o.egg || o.dead) return;
        const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1;
        o.x += dx / d * 180 * dt; o.y += dy / d * 180 * dt;
        if (d < e.r + o.r) {
          o.dead = true;
          e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.03);
          spawnPart(o.x, o.y, e.def.color, 6, 120, 0.4);
          if (!(e.healLblT > G.realT)) { e.healLblT = G.realT + 0.8; floatText(e.x, e.y - e.r - 10, 'NOM (+HEALTH)', PAL.danger, 13); }
        }
      });
      if (e.fireT <= 0) { e.fireT = 1.2; ring(e.x, e.y, 290, e.def.color, 0.6, 2); shootPattern(e, 'aimed'); }
      return true;
    }
    case 'glare': {
      // The Eye locks on, then sweeps a beam after you. It can't dodge while it glares.
      e.mvs = 0;
      if (e.st === 0) { e.st = 1; e.stT = 1.1; e.glareA = aim; e.glaring = false; }
      if (e.st === 1) {
        e.stT -= dt; e.glareA += clamp(angDiff(aim, e.glareA), -2.2 * dt, 2.2 * dt);
        if (e.stT <= 0) { e.st = 2; e.stT = 2.1; e.glaring = true; sfx('zap'); }
      } else if (e.st === 2) {
        e.stT -= dt; e.glareA += clamp(angDiff(aim, e.glareA), -0.8 * dt, 0.8 * dt);
        const cx = Math.cos(e.glareA), cy = Math.sin(e.glareA), px = p.x - e.x, py = p.y - e.y;
        const along = px * cx + py * cy, perp = Math.abs(px * cy - py * cx);
        if (along > 0 && along < 950 && perp < 15 + p.r) hurtPlayer(bd * 1.4, e.name + ' death stare', e);
        if (e.stT <= 0) { e.st = 3; e.glaring = false; }
      }
      return true;
    }
    case 'wardround': {
      // The Matron heals everything nearby and tops up her ring of nurses.
      if (e.st === 0) {
        e.st = 1;
        const k = e.poison > 0 ? 0.5 : 1;
        forNear(e.x, e.y, 650, o => { if (o.rival || o.charmed || o.egg || (o.boss && o !== e)) return; o.hp = Math.min(o.maxHp, o.hp + o.maxHp * (o === e ? 0.05 : 0.2) * k); });
        ring(e.x, e.y, 650, e.def.color, 0.9, 3);
        floatText(e.x, e.y - e.r - 12, k < 1 ? 'WARD ROUND (POISONED: HALF)' : 'WARD ROUND', PAL.danger, 14, 1);
        e.nurses = (e.nurses || []).filter(n => !n.dead);
        while (e.nurses.length < 4 && G.enemies.length < CAPS.enemies) {
          const n = makeEnemy(ENEMIES.medic, e.x, e.y);
          n.orbitBoss = e; n.hp = n.maxHp = e.maxHp * 0.035; n.orbA = e.nurses.length / 4 * TAU; n.xp = 4;
          e.nurses.push(n); G.enemies.push(n);
        }
      }
      if (e.fireT <= 0) { e.fireT = 1.1; shootPattern(e, 'aimed'); }
      return true;
    }
    case 'acidrain': {
      if (e.fireT <= 0) {
        e.fireT = 1.7;
        for (let i = 0; i < 3; i++) addHazard(p.x + rand(-160, 160), p.y + rand(-160, 160), 52, 4.5, bd * 0.8, e.def.color, e.name + ' acid');
      }
      return true;
    }
    case 'dash3': {
      // Chad Prime: three telegraphed dashes, then he's winded (stunned, double damage).
      if (e.winded > G.t) { e.mvs = 0; return true; }
      if (e.st === 0) { e.st = 1; e.stT = 0.55; }
      if (e.st === 1) {
        e.mvs = 0; e.stT -= dt;
        if (e.stT > 0.15) { e.dashX = ux; e.dashY = uy; }
        if (e.stT <= 0) { e.st = 2; e.stT = 0.36; sfx('zap'); }
      } else if (e.st === 2) {
        e.mvx = e.dashX; e.mvy = e.dashY; e.mvs = e.speed * 7; e.stT -= dt;
        if (Math.random() < dt * 30) spawnPart(e.x, e.y, '#d4c1a4', 1, 40, 0.4);
        if (e.stT <= 0) {
          e.dashN = (e.dashN || 0) + 1;
          if (e.dashN >= 3) { e.dashN = 0; e.winded = G.t + 2.4; e.st = 3; floatText(e.x, e.y - e.r - 12, 'WINDED!', PAL.reward, 16, 1.2); }
          else e.st = 0;
        }
      }
      return true;
    }
    case 'tailwhip': {
      if (e.fireT <= 0) { e.fireT = 0.75; const sw = Math.sin(G.t * 3) * 0.5; for (let i = -4; i <= 4; i++) eBullet(e.x, e.y, aim + i * 0.17 + sw, 210, bd, 5.5); }
      return true;
    }
    case 'firering': {
      if (e.fireT <= 0) {
        e.fireT = 1.0; e.st++;
        const n = 20, off = e.st % 2 ? Math.PI / n : 0;
        for (let i = 0; i < n; i++) eBullet(e.x, e.y, off + i / n * TAU, 150, bd, 6);
        addHazard(e.x, e.y, e.r * 2.2, 3.5, bd * 0.8, '#ff7a2f', e.name + ' burning ground', 0.4);
      }
      return true;
    }
  }
  return false;
}
// Per-frame boss upkeep outside of their attack patterns (from bossAI, before patterns).
function bossUpkeep(e, dt) {
  const d = e.def;
  if (d.resist && d.resist.fire === 0) e.burn = 0;
  // The Fever: freezing it snuffs out whatever it was doing; below 35% it rages.
  if (d.id === 'fever') {
    if (e.frozen > 0 && e.patT < 5) { e.patT = 5.4; e.fireT = 0.8; }
    if (e.hp < e.maxHp * 0.35 && !e.raged) { e.raged = true; banner('THE FEVER SPIKES: 42 DEGREES', PAL.danger); e.speed *= 1.5; }
    if (e.raged) return 2;
  }
  // The Pepsinator splits off blobs at 60% and 30%.
  if (d.id === 'pepsin') {
    for (const th of [0.6, 0.3]) {
      if (e.hp < e.maxHp * th && !(e.split || (e.split = {}))[th]) {
        e.split[th] = true;
        for (let i = 0; i < 2 && G.enemies.length < CAPS.enemies; i++) {
          const a = Math.random() * TAU, j = makeEnemy(ENEMIES.pepsinjr, e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r);
          j.hp = j.maxHp = e.maxHp * 0.09; j.bossDef = d; j.dmg = e.dmg * 0.6; j.xp = 12;
          G.enemies.push(j);
        }
        floatText(e.x, e.y - e.r - 12, 'SPLIT!', PAL.danger, 16);
        ring(e.x, e.y, e.r * 2, d.color, 0.5, 5);
      }
    }
  }
  return 1;
}
// Matron's nurses circle her (from updateEnemies).
function orbitNurse(e, dt) {
  const b = e.orbitBoss;
  if (!b || b.dead) { e.orbitBoss = null; return false; }
  e.orbA += 1.4 * dt;
  e.x = b.x + Math.cos(e.orbA) * (b.r + 45); e.y = b.y + Math.sin(e.orbA) * (b.r + 45);
  return true;
}

// ---------------------------------------------------------------- hazards (enemy ground effects that hurt you)
function addHazard(x, y, r, life, dmg, color, name, warn) {
  if (G.hazards.length > 40) return;
  G.hazards.push({ x, y, r, life, max: life, dmg, color, name, warn: warn == null ? 0.8 : warn });
}
function updateHazards(dt) {
  const p = me();
  for (const h of G.hazards) {
    if (h.warn > 0) { h.warn -= dt; continue; }
    h.life -= dt;
    if (Math.hypot(p.x - h.x, p.y - h.y) < h.r + p.r * 0.5) hurtPlayer(h.dmg, h.name);
  }
  compactArr(G.hazards, h => h.life > 0);
}

// ---------------------------------------------------------------- death, revival and the relic
function bossDown(e) {
  const P = G.P;
  if (e.twin && !e.twin.dead) {
    // One twin down: the other starts rebuilding it.
    G.revive = { e, t: G.t + 8 };
    G.boss = e.twin;
    banner(`FINISH ${e.twin.name} WITHIN 8s!`, PAL.reward);
    sfx('boss');
    return;
  }
  G.revive = null;
  (G.bossDead || (G.bossDead = {}))[e.id] = true;
  if (e.twin) G.bossDead[e.twin.id] = true;
  G.boss = null;
  G.stats.bossKills++;
  (G.stats.bossesBeaten || (G.stats.bossesBeaten = [])).push(e.def.id);
  G.lootQueue.push({ kind: 'relic', boss: e.def.id, src: { t: 'boss', name: e.def.name } });
  healPlayer(P.maxHp * 0.3);
  banner(e.def.name + ' DEFEATED', PAL.reward);
  for (let i = 0; i < 12; i++) dropGem(e.x + rand(-60, 60), e.y + rand(-60, 60), e.xp / 12);
  // Slow motion, a chain of bursts across its body, then one last blast and a pillar of light.
  G.slowmo = 2.2;
  for (let i = 0; i < 10; i++) after(i * 0.1, () => {
    const x = e.x + rand(-e.r, e.r), y = e.y + rand(-e.r, e.r);
    G.fx.push({ type: 'flash', x, y, r: rand(50, 100), color: e.def.color, life: 0.2, max: 0.2 });
    ring(x, y, rand(40, 90), e.def.color, 0.5, 6); fxParts('spark', x, y, '#ffffff', 10, 420, 0.4, 2.2); spawnPart(x, y, e.def.color, 8, 240, 0.7, 4); addLight(x, y, 200, e.def.color, 0.6);
    cam.shake = Math.min(16, cam.shake + 5); sfx('boom');
  });
  after(1.05, () => {
    G.fx.push({ type: 'flash', x: e.x, y: e.y, r: e.r * 8, color: '#ffffff', life: 0.6, max: 0.6 });
    G.fx.push({ type: 'pillar', x: e.x, y: e.y, r: e.r * 1.8, color: '#ffffff', life: 1.6, max: 1.6 });
    for (const [rr, w, l] of [[e.r * 4, 12, 0.6], [e.r * 8, 8, 0.9], [e.r * 13, 4, 1.2]]) ring(e.x, e.y, rr, '#ffffff', l, w);
    fxParts('drop', e.x, e.y, e.def.color, 40, 520, 0.9, 6); fxParts('smoke', e.x, e.y, '#2e3330', 10, 260, 1.6, e.r * 0.7); fxParts('ember', e.x, e.y, '#ffffff', 20, 300, 1.2, 3);
    addLight(e.x, e.y, 900, '#ffffff', 1); G.flashT = 0.3; cam.shake = 22; sfx('boss'); vibrate(250);
  });
  cam.shake = 16;
  sfx('boss'); vibrate(200);
}
function updateRevive() {
  const R = G.revive;
  if (!R) return;
  const t = R.e.twin;
  if (!t || t.dead) { G.revive = null; return; }
  if (G.t < R.t) return;
  const e = R.e;
  e.dead = false; e.hp = e.maxHp * 0.6; e.x = t.x + rand(-60, 60); e.y = t.y + rand(-60, 60); e.flash = 0.3;
  G.enemies.push(e);
  G.revive = null;
  ring(e.x, e.y, e.r * 2.5, e.def.color, 0.6, 6);
  banner(`${t.name} REBUILT ${e.name}`, PAL.danger);
}

function optRelic(id, boss) {
  const R = RELICS[id], B = bossDef(boss);
  return { rarity: 4, tag: 'BOSS RELIC', icon: R.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), color: PAL.reward, title: R.name,
    sub: 'From ' + B.name.replace(/^THE /, 'the ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()), desc: R.desc, relic: true,
    apply: () => applyRelic(id) };
}
function applyRelic(id) {
  const P = G.P, p = me();
  G.relics[id] = true;
  switch (id) {
    case 'secondstomach': { const add = Math.round(P.maxHp * 0.6); P.maxHp += add; p.hp += add; break; }
    case 'borderwall': { P.armour += 10; const add = Math.round(P.maxHp * 0.4); P.maxHp += add; p.hp += add; P.speed -= 0.1; break; }
    case 'thirdeye': P.crit += 0.25; P.critDmg += 1; break;
    case 'precog': P.dodge = Math.max(P.dodge, Math.min(0.7, P.dodge + 0.25)); break;
    case 'proteinpro': P.speed += 0.35; P.momentum += 0.5; break;
    case 'doubletrouble': P.multishot += 1; P.pierce += 1; P.chain += 1; break;
    case 'diplomatic': G.dipAt = 0; break;
  }
  recomputeAll();
  banner('RELIC: ' + RELICS[id].name.toUpperCase(), PAL.reward);
}

// ---------------------------------------------------------------- relic effects
function relicHit(e, d, src) {
  const R = G.relics;
  if (!src.w || e.dead) return;
  if (R.transfusion && G.lsBudget > 0) { const h = Math.min(G.lsBudget, d * 0.01); G.lsBudget -= h; healPlayer(h, true); }
  if (R.corrosive) { e.shred = Math.min(e.armour + 4, e.shred + 1); e.poison = Math.max(e.poison, 3); e.poisonStacks = Math.min(G.P.poisonCap, e.poisonStacks + 1); e.poisonDps = Math.max(e.poisonDps, d * 0.05); }
  if (R.runninghot && !(e.boss && e.def.resist && e.def.resist.fire === 0)) { e.burn = Math.max(e.burn, 2.5); e.burnDps = Math.max(e.burnDps, d * 0.3); }
}
function relicKill(e, src) {
  const R = G.relics, P = G.P;
  if (R.secondstomach) healPlayer(1, true);
  if (R.ulcer && G.zones.length < 200 && Math.random() < 0.5) G.zones.push({ x: e.x, y: e.y, r: 46, life: 3, max: 3, dps: (8 + G.level * 3) * P.might, elem: 'poison', pull: 0, color: '#b8f35a', tick: 0, src: { elem: 'poison', wname: 'Ulcer' } });
  if (R.heatstroke && e.burn > 0 && (G.heatF !== G.frameN || (G.heatN || 0) < 6)) {
    if (G.heatF !== G.frameN) { G.heatF = G.frameN; G.heatN = 0; }
    G.heatN++;
    aoe(e.x, e.y, 66, Math.max(e.maxHp * 0.25, (20 + G.level * 5) * P.might), { elem: 'fire', wname: 'Heatstroke', noCrit: true }, '#ff7a2f');
  }
}
// Incoming damage adjustments; 0 means blocked.
function relicDamageIn(dmg, ent) {
  const R = G.relics, p = me();
  if (R.diplomatic && G.t >= (G.dipAt || 0)) {
    G.dipAt = G.t + 5;
    ring(p.x, p.y, 34, PAL.reward, 0.4, 4); floatText(p.x, p.y - 26, 'DIPLOMATIC IMMUNITY', PAL.reward, 12);
    p.iframes = 0.4;
    return 0;
  }
  if (R.bouncer && ent && !ent.dead && !ent.boss && !ent.rival && !ent.egg && ent.hp != null) {
    const dx = ent.x - p.x, dy = ent.y - p.y, l = Math.hypot(dx, dy) || 1;
    ent.kx += dx / l * 700; ent.ky += dy / l * 700;
    damageEnemy(ent, ent.dmg * 10, { elem: 'phys', wname: 'Bouncer', noCrit: true });
    dmg *= 0.6;
  }
  return dmg;
}
function relicHurt(d) {
  const R = G.relics, p = me(), P = G.P;
  if (R.acidblood) aoe(p.x, p.y, 130, d * 10, { elem: 'poison', wname: 'Acid Blood', noCrit: true }, '#b8f35a');
  if (R.triage && p.hp < P.maxHp * 0.25 && G.t >= (G.triageAt || 0)) {
    G.triageAt = G.t + 45;
    p.hp = P.maxHp * 0.7; p.iframes = 2;
    banner('TRIAGE: PATCHED UP', PAL.reward);
    ring(p.x, p.y, 80, '#7bed9f', 0.6, 5);
  }
}
function relicDodge() {
  if (!G.relics.precog) return;
  const p = me();
  for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < 115) { b.dead = true; spawnPart(b.x, b.y, '#9ef0ff', 1, 50, 0.25); }
  ring(p.x, p.y, 115, '#9ef0ff', 0.35, 4);
}
function relicTick(dt) {
  const R = G.relics, p = me(), P = G.P;
  if (R.bedside) healPlayer(P.maxHp * 0.015 * dt, true);
  // The Queen's Court: three guards, each back 15 s after it falls.
  if (R.court) {
    G.court = (G.court || []).filter(g => !g.dead && g.charmed);
    if (G.court.length < 3 && G.t >= (G.courtT || 0)) {
      G.courtT = G.t + (G.court.length ? 15 : 0);
      const g = makeEnemy(ENEMIES.brute, p.x + rand(-40, 40), p.y + rand(-40, 40));
      g.charmed = true; g.charmT = 1e9; g.guard = true; g.name = 'Royal Guard'; g.hp = g.maxHp = g.maxHp * 4; g.xp = 0;
      G.court.push(g); G.enemies.push(g);
      ring(g.x, g.y, 30, PAL.you, 0.4, 3);
    }
  }
  // Death Stare: every 4 s, a 1.5 s beam at the toughest thing on screen.
  if (R.deathstare) {
    G.stareT = (G.stareT == null ? 2 : G.stareT) - dt;
    if (G.stareT <= 0 && !G.stare) { const t = acquire('strongest', 560, p.x, p.y); if (t) { G.stare = { t, life: 1.5, a: Math.atan2(t.y - p.y, t.x - p.x), tick: 0 }; sfx('zap'); } G.stareT = 4; }
    const S2 = G.stare;
    if (S2) {
      S2.life -= dt; S2.tick -= dt;
      if (!S2.t.dead) S2.a += clamp(angDiff(Math.atan2(S2.t.y - p.y, S2.t.x - p.x), S2.a), -3 * dt, 3 * dt);
      if (S2.tick <= 0) {
        S2.tick = 0.1;
        const cx = Math.cos(S2.a), cy = Math.sin(S2.a), dps = (40 + G.level * 12) * P.might;
        for (let d = 20; d <= 560; d += 50) forNear(p.x + cx * d, p.y + cy * d, 40, e => {
          const ex = e.x - p.x, ey = e.y - p.y, along = ex * cx + ey * cy;
          if (along > 0 && along < 560 && Math.abs(ex * cy - ey * cx) < 12 + e.r && e.stareTick !== G.frameN) { e.stareTick = G.frameN; damageEnemy(e, dps * 0.1, { elem: 'arcane', wname: 'Death Stare', noCrit: true }); }
        });
      }
      if (S2.life <= 0) G.stare = null;
    }
  }
  // Tail Whip: twice a second, everything behind you gets lashed.
  if (R.tailwhip) {
    G.whipT = (G.whipT || 0) - dt;
    if (G.whipT <= 0) {
      G.whipT = 0.5;
      const h = p.hd != null ? p.hd : p.face, bx = p.x - Math.cos(h) * 40 * playerScale(), by = p.y - Math.sin(h) * 40 * playerScale();
      let n = 0;
      forNear(bx, by, 58, e => { n++; damageEnemy(e, (25 + G.level * 6) * P.might, { elem: 'phys', wname: 'Tail Whip', knock: 160, kx: e.x - p.x, ky: e.y - p.y }); });
      if (n) { ring(bx, by, 58, PAL.you, 0.25, 3); sfx('shot'); }
    }
  }
  // Sprint Start: every 5 s, a surge forward and a shockwave where you were.
  if (R.sprint) {
    G.sprintCd = (G.sprintCd == null ? 3 : G.sprintCd) - dt;
    if (G.sprintCd <= 0 && G.state === 'play') {
      G.sprintCd = 5; G.sprintT = G.t + 0.6; p.iframes = Math.max(p.iframes || 0, 0.6);
      aoe(p.x, p.y, 110, (30 + G.level * 8) * P.might, { elem: 'phys', wname: 'Sprint Start', knock: 300 }, '#e0fbfc');
    }
  }
  // Fever Dream: count the burning enemies near you.
  if (R.feverdream) {
    G.feverScanT = (G.feverScanT || 0) - dt;
    if (G.feverScanT <= 0) { G.feverScanT = 0.25; let n = 0; forNear(p.x, p.y, 230, e => { if (e.burn > 0) n++; }); G.feverN = n; }
  }
}

// ---------------------------------------------------------------- per-frame (from update)
function updateBosses(dt) {
  updateHazards(dt);
  updateRevive();
  bossFx(dt);
}

// ---------------------------------------------------------------- boss spectacle
// The arrival: a pillar of light, a shockwave that shoves everything back, and a flash.
function bossArrive(e) {
  for (const o of [e, e.twin].filter(Boolean)) {
    G.fx.push({ type: 'pillar', x: o.x, y: o.y, r: o.r * 1.4, color: o.def.color, life: 1.1, max: 1.1 });
    G.fx.push({ type: 'flash', x: o.x, y: o.y, r: o.r * 4, color: o.def.color, life: 0.4, max: 0.4 });
    ring(o.x, o.y, o.r * 6, '#ffffff', 0.9, 10); ring(o.x, o.y, o.r * 3.5, o.def.color, 0.7, 6);
    fxParts('spark', o.x, o.y, '#ffffff', 26, 700, 0.6, 2.5);
    fxParts('smoke', o.x, o.y, '#2e3330', 8, 220, 1.4, o.r * 0.6);
    forNear(o.x, o.y, o.r * 6, n => { if (n !== o && !n.boss && !n.charmed) { const dx = n.x - o.x, dy = n.y - o.y, d = Math.hypot(dx, dy) || 1; n.kx += dx / d * 520; n.ky += dy / d * 520; } });
  }
  G.flashT = 0.2; cam.shake = 18; vibrate([80, 40, 160]);
}
// Per frame: energy drawn into the boss (more as it gets angry), and the enrage at 66% and 33%.
function bossFx(dt) {
  for (const e of [G.boss, G.boss && G.boss.twin]) {
    if (!e || e.dead || e.egg) continue;
    const frac = e.hp / e.maxHp, ph = frac < 0.33 ? 2 : frac < 0.66 ? 1 : 0;
    if (ph > (e.bphase || 0)) bossEnrage(e, ph);
    e.moteT = (e.moteT || 0) - dt;
    if (e.moteT <= 0 && G.parts.length < CAPS.parts - 40) {
      e.moteT = 0.06 / (1 + (e.bphase || 0)) / (0.4 + 0.6 * FX.k);
      const a = Math.random() * TAU, R = e.r * rand(2.2, 3.2), v = rand(120, 200);
      // Spiralling in: aimed at the boss, swung a little sideways.
      const ia = a + Math.PI + 0.6;
      G.parts.push({ k: 'ember', x: e.x + Math.cos(a) * R, y: e.y + Math.sin(a) * R, vx: Math.cos(ia) * v, vy: Math.sin(ia) * v, life: 0.7, max: 0.7, color: e.bphase ? '#ff3b3b' : e.def.color, size: 2.5 });
    }
  }
}
function bossEnrage(e, ph) {
  e.bphase = ph;
  banner(ph === 2 ? e.name + ': FINAL PHASE' : e.name + ' IS ENRAGED', PAL.danger);
  G.fx.push({ type: 'flash', x: e.x, y: e.y, r: e.r * 5, color: '#ff3b3b', life: 0.5, max: 0.5 });
  ring(e.x, e.y, e.r * 7, '#ffffff', 1, 12); ring(e.x, e.y, e.r * 4, '#ff3b3b', 0.8, 8);
  fxParts('spark', e.x, e.y, '#ff3b3b', 30, 800, 0.7, 3);
  forNear(e.x, e.y, e.r * 7, n => { if (n !== e && !n.boss && !n.charmed) { const dx = n.x - e.x, dy = n.y - e.y, d = Math.hypot(dx, dy) || 1; n.kx += dx / d * 600; n.ky += dy / d * 600; } });
  G.flashT = 0.16; cam.shake = 16; sfx('boss'); vibrate([60, 30, 120]);
}

// Autorun: how dangerous a spot is because of boss ground hazards and the Eye's glare (from autoSteer).
function hazardDanger(x, y, r) {
  let d = 0;
  for (const h of G.hazards) { const dd = Math.hypot(x - h.x, y - h.y) - h.r - r; if (dd < 10) d += 2.5 + (h.warn > 0 ? 0 : 1.5); }
  const b = G.boss;
  if (b && !b.dead && b.glareA != null && (b.st === 1 || b.st === 2) && b.def.patterns[b.pat] === 'glare') {
    const cx = Math.cos(b.glareA), cy = Math.sin(b.glareA), px = x - b.x, py = y - b.y;
    // The death stare: autorun keeps well clear of the beam (it tracks you, so give it a wide berth).
    if (px * cx + py * cy > 0 && Math.abs(px * cy - py * cx) < 55 + r) d += 7;
  }
  return d;
}
