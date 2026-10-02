'use strict';
// Spawn Prawn - signature upgrades (each weapon's own Lv 5 and Lv 10 forks) and Pairings (secret combos
// between two weapons you own). The hooks here are called from game.js and arsenal.js.

const owned = id => G.weapons.find(w => w && w.id === id) || null;
const ownSig = (wid, sid) => { const w = owned(wid); return w && hasSig(w, sid) ? w : null; };

// ---------------------------------------------------------------- stat side (from applyPerks)
function applySigStats(w, s) {
  const has = id => hasSig(w, id);
  if (has('kidneystone')) { s.dmg *= 4; s.pierce = 99; s.shred = (s.shred || 0) + 3; s.cd *= 2; s.speed *= 2.4; s.range *= 1.3; s.style = 'rail'; s.spread = 0.02; }
  if (has('vomit')) { s.cd /= 4; s.dmg *= 0.45; s.pierce = (s.pierce || 0) + 1; s.spread = 0.55; s.mag = Math.round(s.mag * 3); }
  if (has('slug')) { const n = s.count; s.count = 1; s.dmg *= n * 0.9; s.pierce = (s.pierce || 0) + 3; s.knock = 260; s.spread = 0.02; s.size = 7; s.speed *= 1.3; }
  if (has('dragonbreath')) { s.elem = 'fire'; s.pIgnite = Math.max(s.pIgnite || 0, 0.4); }
  if (has('aroundworld')) s.count += 2;
  if (has('razorwire')) { s.dur *= 2; s.pChill = 1; }
  if (has('afterburner')) s.elem = 'fire';
  if (has('blueflame')) { s.range *= 1.7; s.spread *= 0.35; s.dmg *= 1.4; s.speed *= 1.5; }
  if (has('dragon')) s.count *= 2;
  if (has('hellkitchen')) { s.mag = 9999; s.reload = 0; }
  if (has('minefield')) { s.count += 2; s.cd *= 0.5; s.life *= 2; s.mag *= 2; }
  if (has('icicle')) s.pierce = (s.pierce || 0) + 4;
  if (has('shortcircuit')) s.chain += 3;
  if (has('swamp')) s.dur *= 4;
  if (has('boom')) { s.splitHit = Math.max(s.splitHit || 0, 2); s.shardHome = 1; }
  if (has('clingy')) s.dmg *= 0.75;
  if (has('buffet')) s.area *= 1.4;
  if (has('ninetails')) { s.count += 4; s.dmg *= 0.6; s.spread = 0.3; }
  if (has('farsight')) s.range *= 1.6;
  if (has('buckshot')) { s.count += 4; s.dmg *= 0.75; }
  if (has('supermassive')) { s.size *= 1.6; s.aura *= 1.6; s.pull *= 2; s.speed *= 0.5; }
  if (has('spreadlove')) { s.count *= 3; s.dmg *= 0.45; }
  if (has('kamikaze')) s.explode = Math.max(s.explode || 0, 42);
  if (has('hivemind')) s.dur *= 1.5;
  // Boss relics that reach into every weapon.
  if (G.relics && G.relics.mirror && PROJ_KINDS.includes(w.def.kind)) s.mirror = Math.max(s.mirror || 0, 0.5);
}

// ---------------------------------------------------------------- pairings
function updatePairings() {
  const had = G.pair || {};
  G.pair = {};
  for (const q of PAIRINGS) {
    const a = owned(q.a), b = owned(q.b);
    if (!a || !b || a.lvl < PAIR_LEVEL || b.lvl < PAIR_LEVEL) continue;
    G.pair[q.id] = true;
    if (!had[q.id] && !(G.pairSeen || (G.pairSeen = {}))[q.id]) {
      G.pairSeen[q.id] = true;
      const first = !META.pairs[q.id];
      META.pairs[q.id] = true; saveMeta();
      banner('PAIRING: ' + q.name.toUpperCase(), PAL.upgrade);
      sysMsg(first ? 'SECRET PAIRING FOUND' : 'PAIRING', `${WEAPONS[q.a].name} + ${WEAPONS[q.b].name}: ${q.desc}`, PAL.upgrade, true);
      sfx('level');
      addViewers(12000);
    }
  }
}

// ---------------------------------------------------------------- firing (gun kind)
// Returns per-shot overrides and the angle to fire at, for signature tricks that change a volley.
function sigVolley(w, a0) {
  const s = w.s, out = { a0, over: null, extra: 0, big: false };
  if (hasSig(w, 'loogie')) {
    w.shotN = (w.shotN || 0) + 1;
    if (w.shotN % 4 === 0) { out.over = { dmg: s.dmg * 3, pierce: 99, r: (s.size || 4) * 2.4, explode: 60, color: '#e8f0ff' }; floatText(me().x, me().y - 30, 'HOCK', '#e8f0ff', 12, 0.5); }
  }
  if (hasSig(w, 'hiccupfit')) {
    w.blastN = (w.blastN || 0) + 1;
    if (w.blastN % 3 === 0) {
      const p = me(), src = weaponSrc(w);
      for (let i = 0; i < 18; i++) spawnProj(w, p.x, p.y, i / 18 * TAU, src);
      for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < 140) { b.dead = true; spawnPart(b.x, b.y, '#ffd6a5', 1, 50, 0.25); }
      ring(p.x, p.y, 140, '#ffd6a5', 0.35, 4);
      floatText(p.x, p.y - 30, 'HIC!', '#ffd6a5', 15, 0.7);
    }
  }
  if (hasSig(w, 'dragon')) { w.dragA = (w.dragA || 0) + 0.42; out.a0 = w.dragA; }
  if (hasSig(w, 'rivalry')) out.extra = w.rivals || 0;
  if (hasSig(w, 'bigbrother')) out.big = true;
  // Recoil Jump: the blast kicks you away from the target.
  if (hasSig(w, 'recoil') && !(w.recoilT > G.t)) { w.recoilT = G.t + 0.3; dashPlayer(-Math.cos(a0), -Math.sin(a0), 420); }
  // Hailstorm: every 3rd volley, hail on the crowd round the target.
  if (hasSig(w, 'hailstorm') && (w.hailN = (w.hailN || 0) + 1) % 3 === 0 && w.curTarget) {
    const t = w.curTarget, src = Object.assign(weaponSrc(w), { wname: 'Hailstorm' });
    acquireMany('random', 220, t.x, t.y, 6).forEach((e, i) => after(0.08 * i, () => {
      if (e.dead) return;
      G.fx.push({ type: 'warn', x: e.x, y: e.y, r: 30, color: '#bde0fe', life: 0.15, max: 0.15 });
      aoe(e.x, e.y, 34, s.dmg * 0.9, src, '#bde0fe');
    }));
  }
  // Swarm Intelligence: a different target for every sibling.
  if (hasSig(w, 'swarmsmart')) { w.swarmL = acquireMany('nearest', s.range, me().x, me().y, 12); w.swarmI = 0; }
  if (hasSig(w, 'sender') && w.owners && w.owners.length) {
    const o = w.owners.shift();
    if (o && !o.dead) out.owner = o;
  }
  return out;
}
// Extra fields for a freshly spawned projectile (from spawnProj).
function sigProj(pr, w) {
  const id = w.id;
  if (id === 'shotgun') { if (hasSig(w, 'pointblank')) pr.pb = 1; if (hasSig(w, 'dragonbreath')) pr.dragonB = 1; }
  else if (id === 'glaive') {
    if (hasSig(w, 'walkdog')) pr.hangT = 1;
    if (hasSig(w, 'blackyoyo')) { pr.hangT = 1.5; pr.hangPull = 240; }
    if (hasSig(w, 'crashdiet')) pr.crash = 1;
    if (hasSig(w, 'aroundworld')) pr.catchHeal = 1;
    if (G.pair.tetherball) pr.magnet = 90;
  } else if (id === 'frost') { if (hasSig(w, 'icicle')) pr.icicle = 1; if (hasSig(w, 'iceage')) pr.iceAge = 1; }
  else if (id === 'seeker') { if (hasSig(w, 'reunion')) pr.reunion = 1; if (w.swarmL && w.swarmL.length) { pr.tgt = w.swarmL[(w.swarmI++) % w.swarmL.length]; pr.homing = Math.max(pr.homing, 6); } }
  else if (id === 'void') { pr.dealt = 0; pr.r0 = pr.r; pr.aura0 = pr.aura; }
}

// ---------------------------------------------------------------- hits and kills
// Multiplier a hit gets from statuses your signatures put on enemies (from damageEnemy).
function sigDamageMul(e, src) {
  let m = 1;
  if (e.soggyT > G.t) m *= 1.3;
  if (e.guiltT > G.t) m *= 1.35;
  if (src.w && src.w.id === 'shotgun' && G.pair.suckerpunch && e.pulledT > G.t) m *= 2;
  if (e.corrT > G.t) m *= 1.25; // Corrosive
  if (e.burn > 0 && ownSig('flamer', 'heatwave')) m *= 1.5;
  if (src.w && src.w.id === 'blaster' && hasSig(src.w, 'farsight') && Math.hypot(e.x - me().x, e.y - me().y) > 250) m *= 2;
  if (src.w && src.w.id === 'void' && e.holdLast > G.t - 0.3 && hasSig(src.w, 'crushdepth')) m *= 1 + Math.min(2, G.t - e.holdT0);
  return m;
}
// On-hit effects (from damageEnemy's proc step).
function sigHit(e, dmg, src) {
  const w = src.w;
  if (!w || !w.perks) return;
  if (w.id === 'blaster') {
    if (hasSig(w, 'wetwilly')) e.soggyT = G.t + 3;
    if (G.pair.conductive) e.wetT = G.t + 3;
  } else if (w.id === 'frost') {
    if (hasSig(w, 'brainfreeze') && !e.boss && !e.rival && (e.bfN = (e.bfN || 0) + 1) % 3 === 0) { e.frozen = Math.max(e.frozen, 1.5); ring(e.x, e.y, e.r + 8, '#bde0fe', 0.3, 2); }
    if (hasSig(w, 'shatter') && e.frozen > 0 && !e.dead) {
      e.frozen = 0;
      aoe(e.x, e.y, 62, dmg * 2.5, Object.assign({}, src, { noProc: true, noCrit: true, mult: 1, wname: 'Shatter' }), '#bde0fe');
      floatText(e.x, e.y - e.r - 10, 'SHATTER', '#bde0fe', 13);
    }
  } else if (w.id === 'orbit') {
    if (hasSig(w, 'guilttrip')) e.guiltT = G.t + 4;
    if (G.pair.bbq) { e.burn = Math.max(e.burn, 3); e.burnDps = Math.max(e.burnDps, dmg * 0.5); }
  }
  // Bloodletting and Barbed Tail: 60% of the hit bleeds out again over the next few seconds.
  if ((w.id === 'wake' && hasSig(w, 'bloodletting')) || (w.id === 'flail' && hasSig(w, 'barbed'))) e.bleed = Math.min(e.maxHp, (e.bleed || 0) + dmg * (src.mult || 1) * 0.6);
  // Power Grid: other weapons' hits set off a Static Cling chain now and then.
  if (G.gridW && w !== G.gridW && !src.grid && Math.random() < 0.15 && !(G.gridCd > G.realT)) {
    G.gridCd = G.realT + 0.05;
    const gw = G.gridW;
    doChain(e.x, e.y, e, gw.s.dmg, gw.s.chain, gw.s.jump, Object.assign(weaponSrc(gw), { grid: true }));
  }
}
function sigKill(e, src) {
  const w = src.w;
  if (w && w.id === 'seeker' && hasSig(w, 'rivalry')) w.rivals = Math.min(8, (w.rivals || 0) + 1);
  // Bleeding enemies pass what's left of it on to the nearest one.
  if (e.bleed > 1) { const n = acquire('nearest', 160, e.x, e.y, e); if (n) { n.bleed = Math.min(n.maxHp, (n.bleed || 0) + e.bleed); bolt(e.x, e.y, n.x, n.y, '#ff3b3b', 0.12); } e.bleed = 0; }
  if (e.parasiteT > 0 && e.parasiteW && hasSig(e.parasiteW, 'feedingtube')) healPlayer(G.P.maxHp * 0.01, true); // Feeding Tube
  // Indigestion: burning enemies go up in flames (a few per frame, so chains stay readable).
  const fw = e.burn > 0 && ownSig('flamer', 'indigestion');
  if (fw && (G.indiF !== G.frameN || (G.indiN || 0) < 6)) {
    if (G.indiF !== G.frameN) { G.indiF = G.frameN; G.indiN = 0; }
    G.indiN++;
    aoe(e.x, e.y, 70, fw.s.dmg * 8 + e.maxHp * 0.12, Object.assign(weaponSrc(fw), { noCrit: true, wname: 'Indigestion' }), '#ff7a2f');
  }
  // Puddle deaths.
  if (e.puddleT > G.t) {
    const vw = ownSig('venom', 'toxicspread');
    if (vw && G.zones.length < 120) G.zones.push(venomZone(vw, e.x, e.y));
  }
}
function venomZone(w, x, y) {
  const s = w.s, z = { x, y, r: s.area, life: s.dur, max: s.dur, dps: s.dmg * 0.9, elem: 'poison', pull: 0, color: w.def.color, tick: 0, src: weaponSrc(w), venom: true };
  if (hasSig(w, 'swamp')) { z.grow = s.area * 0.12; z.r0 = s.area; }
  if (hasSig(w, 'geyser')) z.onEnd = q => { aoe(q.x, q.y, q.r * 1.15, s.dmg * 3, Object.assign(weaponSrc(w), { wname: 'Geyser' }), '#8dff4a'); spawnPart(q.x, q.y, '#8dff4a', 8, 160, 0.5); };
  return z;
}
// Called for every enemy standing in a zone, each zone tick.
function sigZone(z, e, dt) {
  if (z.venom || (z.src && z.src.w && z.src.w.id === 'venom')) {
    e.puddleT = G.t + 0.4; e.puddleZ = z;
    if (z.ice) e.iceT = G.t + 0.4;
    if (e.burn > 0 && !z.burning && !z.ice) puddleQuirks(e, { elem: 'fire' }, 0);
    if (hasSig(z.src.w, 'corrosive')) { e.shred = Math.max(e.shred, e.armour); e.corrT = G.t + 0.4; }
    if (hasSig(z.src.w, 'nausea')) { e.chill = Math.max(e.chill, 0.4); e.chillAmt = Math.max(e.chillAmt, 0.45); e.weakT = G.t + 0.4; }
  }
  if (z.freeze && !e.boss && !e.rival) e.frozen = Math.max(e.frozen, 1);
  // Pushy + Scalpel: the trail shoves enemies aside.
  if (z.trail && z.src && z.src.w && z.src.w.s.knock && !e.boss && !e.def.heavy) { const dx = e.x - z.x, dy = e.y - z.y, d = Math.hypot(dx, dy) || 1; e.kx += dx / d * z.src.w.s.knock; e.ky += dy / d * z.src.w.s.knock; }
}

// ---------------------------------------------------------------- per-frame
function sigTick(dt) {
  const p = me();
  G.gridW = ownSig('tesla', 'powergrid');
  for (const w of G.weapons) {
    if (!w) continue;
    if (hasSig(w, 'coldsnap')) {
      w.snapT = (w.snapT == null ? 4 : w.snapT) - dt;
      if (w.snapT <= 0) {
        w.snapT = 4;
        const r = 170 * G.P.area;
        forNear(p.x, p.y, r, e => { if (!e.boss && !e.rival && !e.egg && !e.charmed) e.frozen = Math.max(e.frozen, 1.5); damageEnemy(e, w.s.dmg * 1.5, Object.assign(weaponSrc(w), { noProc: true, wname: 'Cold Snap' })); });
        ring(p.x, p.y, r, '#caf0f8', 0.5, 6);
        spawnPart(p.x, p.y, '#caf0f8', 16, r * 2, 0.5);
      }
    }
    if (hasSig(w, 'hellkitchen')) w.hk = G.t - (w.firedT || -9) < 0.25 ? Math.min(1, (w.hk || 0) + dt / 4) : Math.max(0, (w.hk || 0) - dt * 0.5);
  }
  if (G.relics) relicTick(dt);
  spoilerBlink(dt);
  sig8Tick(dt);
  voidMerge(dt);
  quirkTick(dt);
  toyTick(dt);
}

// ---------------------------------------------------------------- Slipstream Scalpel extras (from updateWake)
function wakeExtras(w, p) {
  const s = w.s;
  // Closing the Loop: the path crosses itself, and everything inside the loop gets cut.
  if (hasSig(w, 'closeloop')) {
    const path = w.path || (w.path = []);
    path.push({ x: p.x, y: p.y, t: G.t });
    while (path.length && path[0].t < G.t - 7) path.shift();
    if (!(w.loopCd > G.t)) {
      for (let i = 0; i < path.length - 1; i++) {
        const q = path[i];
        if (G.t - q.t < 0.7) break;
        if (Math.hypot(q.x - p.x, q.y - p.y) < 28) {
          const pts = path.slice(i);
          let cx = 0, cy = 0; for (const o of pts) { cx += o.x; cy += o.y; } cx /= pts.length; cy /= pts.length;
          let r = 0; for (const o of pts) r += Math.hypot(o.x - cx, o.y - cy); r /= pts.length;
          if (r > 45) {
            let n = 0;
            forNear(cx, cy, r, e => { damageEnemy(e, s.dmg * 9, Object.assign(weaponSrc(w), { wname: 'Closing the Loop' })); n++; });
            ring(cx, cy, r, '#e0fbfc', 0.6, 6);
            addLight(cx, cy, r * 1.6, '#e0fbfc', 0.5);
            floatText(cx, cy, n >= 8 ? 'SURGICAL!' : 'LOOP!', '#e0fbfc', n >= 8 ? 20 : 15, 1);
            cam.shake = Math.min(8, cam.shake + 3);
            sfx('boom');
            w.loopCd = G.t + 0.6;
          }
          w.path = [{ x: p.x, y: p.y, t: G.t }];
          break;
        }
      }
    }
  }
  // Trail Mix pairing: a mine every 1.5 s.
  if (G.pair.trailmix) {
    const mw = owned('mines');
    if (mw && !(w.mixT > G.t)) { w.mixT = G.t + 1.5; G.proj.push({ mine: true, x: p.x, y: p.y, life: mw.s.life, arm: 0.5, r: 7, w: mw, src: weaponSrc(mw), color: mw.def.color, dead: false }); }
  }
}
function wakeZone(w, x, y) {
  const s = w.s, src = weaponSrc(w), p = me();
  let dps = s.dmg;
  if (hasSig(w, 'afterburner')) dps *= 1 + 1.5 * Math.min(1, Math.hypot(p.vx || 0, p.vy || 0) / 200);
  if (G.pair.nappytrail) { src.elem = 'poison'; }
  return { x, y, r: s.area, life: s.dur, max: s.dur, dps, elem: src.elem, pull: 0, color: src.elem === 'fire' ? '#ff7a2f' : src.elem === 'poison' ? '#8dff4a' : w.def.color, tick: Math.random() * 0.25, src, trail: true };
}
// Surgical Team: two ghost scalpels orbit you, each cutting its own trail.
function surgicalTeam(w, dt) {
  if (!hasSig(w, 'surgicalteam')) return;
  const p = me();
  w.teamT = (w.teamT || 0) - dt;
  if (w.teamT > 0 || G.zones.length > 300) return;
  w.teamT = 0.07;
  for (let i = 0; i < 2; i++) {
    const a = G.realT * 3.2 + i * Math.PI;
    G.zones.push(wakeZone(w, p.x + Math.cos(a) * 75, p.y + Math.sin(a) * 75));
  }
}

// ---------------------------------------------------------------- Nappy Mines extras
function mineDrop(w, x, y) {
  const s = w.s, pr = { mine: true, x, y, life: s.life, arm: 0.5, r: 7, w, src: weaponSrc(w), color: w.def.color, dead: false };
  if (w.isLast) pr.big = true; // Last Word
  // Spoilers: the mine was already under them.
  if (G.P.future > 0 && Math.random() < G.P.future) { const t = acquire('cluster', 380, me().x, me().y); if (t) { pr.x = t.x; pr.y = t.y; pr.arm = 0; ring(t.x, t.y, 20, w.def.color, 0.3, 2); } }
  if (hasSig(w, 'nuclear')) { w.mineN = (w.mineN || 0) + 1; if (w.mineN % 6 === 0) { pr.nuke = true; pr.color = '#ffffff'; } }
  if (hasSig(w, 'sticky')) {
    const t = acquire('nearest', 280, me().x, me().y);
    if (t) { pr.stick = t; pr.fuse = 1.2; pr.x = t.x; pr.y = t.y; pr.arm = 99; bolt(me().x, me().y, t.x, t.y, '#ff9f1c', 0.12); }
  }
  return pr;
}
function mineScale(pr) {
  let k = pr.dominoK || 1, r = 1;
  if (pr.nuke) { k *= 6; r = 3; }
  if (pr.big) { k *= 3 + Math.min(4, G.P.lastRound); r *= 1.5; }
  return { k, r: r * Math.sqrt(pr.dominoK || 1) };
}
function afterMine(pr) {
  if (hasSig(pr.w, 'claymore')) {
    // Claymore: a fan of shrapnel at the nearest enemy.
    const t = acquire('nearest', 400, pr.x, pr.y), a0 = t ? Math.atan2(t.y - pr.y, t.x - pr.x) : Math.random() * TAU;
    for (let i = 0; i < 8; i++) { const a = a0 + (i / 7 - 0.5) * 0.9, sp = 520; spawnProj(pr.w, pr.x, pr.y, a, Object.assign({}, pr.src, { wname: 'Claymore' }), { speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6, max: 0.6, r: 3, dmg: pr.w.s.dmg * 0.35, pierce: 1, style: 'bullet', explode: 0, homing: 0, bounce: 0, boomerang: 0, noMods: true }); }
  }
  if (pr.nuke) { cam.shake = 18; floatText(pr.x, pr.y - 30, 'NUCLEAR NAPPY', '#ffffff', 20, 1.2); addLight(pr.x, pr.y, 500, '#ffffff', 0.8); sfx('boss'); vibrate(80); }
  if (hasSig(pr.w, 'domino')) {
    const k = (pr.dominoK || 1) * 1.25;
    for (const o of G.proj) {
      if (!o.mine || o.dead || o === pr || Math.hypot(o.x - pr.x, o.y - pr.y) > 170) continue;
      o.dead = true; o.dominoK = Math.min(3, k);
      after(0.09, () => detonateMine(o));
    }
  }
}
function updateStickyMine(pr, dt) {
  if (!pr.stick && pr.w && hasSig(pr.w, 'homingnappy')) {
    // Homing Nappies: crawl after the nearest enemy.
    const t = acquire('nearest', 320, pr.x, pr.y);
    if (t) { const dx = t.x - pr.x, dy = t.y - pr.y, d = Math.hypot(dx, dy) || 1; pr.x += dx / d * Math.min(d, 150 * dt); pr.y += dy / d * Math.min(d, 150 * dt); }
  }
  if (!pr.stick) return false;
  if (!pr.stick.dead) { pr.x = pr.stick.x; pr.y = pr.stick.y; }
  pr.fuse -= dt;
  if (pr.fuse <= 0) { pr.dead = true; detonateMine(pr); }
  return true;
}
// Baby Monitor Network pairing: a lightning hit sets off a nearby mine.
function chainNearMine(x, y) {
  for (const o of G.proj) if (o.mine && !o.dead && Math.abs(o.x - x) < 110 && Math.abs(o.y - y) < 110) { o.dead = true; bolt(x, y, o.x, o.y, '#ffe94a', 0.15); detonateMine(o); return; }
}

// ---------------------------------------------------------------- Static Cling extras (after a chain)
function afterChain(w, hit, src) {
  // Grounded: the chain earths through you.
  if (hasSig(w, 'grounded') && G.lsBudget > 0) { const h = Math.min(G.lsBudget * 2, hit.length * G.P.maxHp * 0.004); G.lsBudget = Math.max(0, G.lsBudget - h / 2); healPlayer(h, true); }
  // Ball Lightning: every 4th bolt leaves a crackling ball where it struck.
  if (hasSig(w, 'balllightning') && (w.ballN = (w.ballN || 0) + 1) % 4 === 0 && hit.length && G.zones.length < 200) {
    const t = hit[hit.length - 1];
    G.zones.push({ x: t.x, y: t.y, r: 90, life: 3, max: 3, dps: w.s.dmg * 1.5, elem: 'shock', pull: 0, color: '#ffe94a', tick: 0, src: Object.assign({}, src, { wname: 'Ball Lightning' }) });
    ring(t.x, t.y, 90, '#ffe94a', 0.4, 3);
  }
  if (hasSig(w, 'umbilical') && hit.length >= 2 && G.tethers.length < 12) {
    const [a, b] = hit;
    if (!a.dead && !b.dead && a !== b && !G.tethers.some(t => t.a === a || t.b === a || t.a === b || t.b === b))
      G.tethers.push({ a, b, life: 2.5, max: 2.5, dmg: w.s.dmg, pull: 200, src, tick: 0, slamCd: 0 });
  }
}

// ---------------------------------------------------------------- Tapeworm extras (from killEnemy)
function wormCorpse(e, pw) {
  const s = pw.s;
  if (hasSig(pw, 'brood')) {
    let n = 0;
    for (const o of acquireMany('nearest', 220, e.x, e.y, 5)) { if (o === e || o.boss || o.rival || n >= 3) continue; o.parasiteW = pw; o.parasiteT = 6; n++; bolt(e.x, e.y, o.x, o.y, '#b5e48c', 0.2); }
  }
  if (hasSig(pw, 'bodysnatcher') && e.elite && !e.boss && !e.rival && (G.snatched || 0) < 3) {
    G.snatched = (G.snatched || 0) + 1;
    const z = makeEnemy(e.def, e.x, e.y, { elite: true });
    z.charmed = true; z.charmT = 1e9; z.snatched = true; z.name = e.name.replace(' (elite)', '') + ' (yours)';
    G.enemies.push(z);
    floatText(e.x, e.y - 30, 'BODY SNATCHED', PAL.you, 16, 1.2);
    return true;
  }
  if (hasSig(pw, 'walkingdead')) {
    if (e.boss || e.rival || e.egg || e.def.shape === 'yeast' || G.enemies.filter(o => o.charmed && o.zombie).length >= 14) return true;
    const z = makeEnemy(e.def, e.x, e.y);
    z.charmed = true; z.charmT = s.dur * 1.5; z.zombie = true; z.xp = 0;
    G.enemies.push(z);
    ring(e.x, e.y, e.r + 12, '#b5e48c', 0.4, 3);
    return true;
  }
  return false;
}
function wormTurret(t, pw) {
  if (hasSig(pw, 'bigworm')) { t.life *= 2; t.max *= 2; t.rate *= 0.67; t.dmg *= 2; }
  if (hasSig(pw, 'hivemind')) t.dmg *= 2;
  if (G.pair.familytree) t.sibs = true;
}

// ---------------------------------------------------------------- Placental Siphon extras
function siphonAte(w, b) {
  if (hasSig(w, 'sender') && b.owner) { (w.owners || (w.owners = [])).push(b.owner); if (w.owners.length > 60) w.owners.shift(); }
  if (hasSig(w, 'buffet') && G.lsBudget > 0) { const h = Math.min(G.lsBudget, 0.35); G.lsBudget -= h; healPlayer(h, true); }
  if (G.pair.discharge && (w.eaten = (w.eaten || 0) + 1) % 12 === 0) {
    const tw = owned('tesla'), p = me();
    if (tw) for (const t of acquireMany('nearest', 400, p.x, p.y, 4)) doChain(p.x, p.y, t, tw.s.dmg, tw.s.chain, tw.s.jump, weaponSrc(tw));
  }
}
function siphonOverflow(w) {
  if (!hasSig(w, 'overflow') || w.stored < w.s.mag) return;
  const p = me(), src = weaponSrc(w), q = w.q || [], n = Math.min(48, q.length);
  src.mult *= q.reduce((a, b) => a + b, 0) / (q.length || 1);
  for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, i / n * TAU, src);
  w.q = []; w.stored = 0;
  ring(p.x, p.y, 90, '#ff3df2', 0.4, 5);
  floatText(p.x, p.y - 30, 'OVERFLOW', '#ff3df2', 15);
}
// Mirror Womb: some bullets bounce off you, back at whoever fired them. Returns true if it bounced.
function mirrorWomb(b) {
  const w = ownSig('siphon', 'mirrorwomb');
  if (!w || Math.random() > 0.3) return false;
  const p = me(), o = b.owner && !b.owner.dead ? b.owner : null;
  const a = o ? Math.atan2(o.y - p.y, o.x - p.x) : Math.atan2(-b.vy, -b.vx);
  const pr = spawnProj(w, b.x, b.y, a, weaponSrc(w));
  if (pr && o) { pr.homing = 8; pr.tgt = o; pr.vsOwner = o; }
  spawnPart(b.x, b.y, '#ff3df2', 3, 80, 0.25);
  return true;
}

// ---------------------------------------------------------------- Premature Evangelation extras (per blade)
function bladeEats(w, bx, by, size) {
  const nan = hasSig(w, 'nan'), op = G.pair.overprotective;
  if (!nan && !op) return;
  const sw = op ? owned('siphon') : null;
  for (const b of G.ebul) {
    if (b.dead || Math.abs(b.x - bx) > size + b.r || Math.abs(b.y - by) > size + b.r) continue;
    b.dead = true; spawnPart(b.x, b.y, '#c77dff', 1, 40, 0.2);
    if (sw) siphonStore(sw, siphonStrength(b));
  }
}

// ---------------------------------------------------------------- Morning Sickness: Acid Reflux (from hurtPlayer)
function acidReflux() {
  const w = ownSig('venom', 'acidreflux');
  if (!w || G.refluxT > G.t) return;
  G.refluxT = G.t + 1.5;
  const p = me(), src = weaponSrc(w);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    G.proj.push({ lob: true, sx: p.x, sy: p.y, tx: p.x + Math.cos(a) * 120, ty: p.y + Math.sin(a) * 120, x: p.x, y: p.y, t: 0, flight: 0.45, w, src, color: w.def.color, dead: false });
  }
  floatText(p.x, p.y - 30, 'BLEURGH', '#8dff4a', 15);
}

// ---------------------------------------------------------------- projectile hooks (from updateProjectiles)
function projHit(pr, e) {
  pr.nHit = (pr.nHit || 0) + 1;
  if (pr.crash && pr.r < 40) { pr.dmg *= 1.1; pr.r *= 1.1; }
  if (pr.iceAge && !pr.patched) { pr.patched = true; frostPatch(pr.w, e.x, e.y); }
  if (pr.w.id === 'glaive' && G.pair.yoyosibs && !(pr.sibT > G.realT)) {
    pr.sibT = G.realT + 0.15;
    const sw = owned('seeker');
    if (sw) spawnProj(sw, pr.x, pr.y, Math.random() * TAU, weaponSrc(sw));
  }
}
// A projectile reaching the end of its flight.
function projEnd(pr) {
  if (isOrb(pr) || (pr.style === 'void' && pr.w && pr.w.id === 'void')) orbCollapse(pr);
  if (pr.style === 'flame' && Math.random() < 0.12) fxParts('smoke', pr.x, pr.y, '#2e3330', 1, 25, 0.8, 5, -Math.PI / 2, 0.8); // flames leave smoke
  if (pr.w.id === 'flamer' && hasSig(pr.w, 'napalm') && Math.random() < 0.2 && G.zones.length < 200) G.zones.push({ x: pr.x, y: pr.y, r: 26, life: 2, max: 2, dps: pr.dmg * 3, elem: 'fire', pull: 0, color: '#ff7a2f', tick: 0, src: Object.assign({}, pr.src, { wname: 'Napalm' }) });
  if (pr.dragonB && Math.random() < 0.35 && G.zones.length < 200) G.zones.push({ x: pr.x, y: pr.y, r: 24, life: 1.6, max: 1.6, dps: pr.dmg * 0.8, elem: 'fire', pull: 0, color: '#ff7a2f', tick: 0, src: pr.src });
  if (pr.iceAge && !pr.patched) frostPatch(pr.w, pr.x, pr.y);
  if (pr.dealt > 0 && hasSig(pr.w, 'bigbang')) {
    aoe(pr.x, pr.y, (pr.aura || 70) * 1.7, Math.min(pr.dealt * 0.5, pr.w.s.dmg * 400), Object.assign({}, pr.src, { noProc: true, noCrit: true, mult: 1, wname: 'Big Bang' }), '#c77dff');
    cam.shake = Math.min(12, cam.shake + 6);
    floatText(pr.x, pr.y - 20, 'BIG BANG', '#e0aaff', 16);
  }
}
function frostPatch(w, x, y) {
  if (G.zones.length > 200) return;
  G.zones.push({ x, y, r: 42, life: 3, max: 3, dps: w.s.dmg * 0.3, elem: 'ice', pull: 0, color: '#caf0f8', tick: 0, src: weaponSrc(w), freeze: true });
}
// Toddler Gravity: per enemy caught, per tick.
function gravityTick(pr, e) {
  const w = pr.w;
  if (e.holdPr !== pr || !(e.holdLast > G.t - 0.3)) { e.holdPr = pr; e.holdT0 = G.t; }
  e.holdLast = G.t; // Crush Depth
  if (hasSig(w, 'horizon') && !e.dead && !e.boss && !e.rival && !e.egg && e.hp < e.maxHp * 0.2 && Math.hypot(e.x - pr.x, e.y - pr.y) < pr.r + e.r * 0.6 + 8) {
    e.hp = 0; floatText(e.x, e.y - e.r, 'GULP', '#e0aaff', 13); killEnemy(e, pr.src);
  }
  if (G.pair.snowglobe && !e.dead && !e.boss) { e.chill = Math.max(e.chill, 1); e.chillAmt = Math.min(0.6, e.chillAmt + 0.12); if (e.chillAmt >= 0.5) e.frozen = Math.max(e.frozen, 1.2); }
}
// Toddler Gravity: once per tick for the orb.
function gravityOrb(pr, caught) {
  const w = pr.w;
  if (hasSig(w, 'nomnom')) {
    const r2 = pr.aura * pr.aura;
    for (const b of G.ebul) {
      if (b.dead) continue;
      const dx = b.x - pr.x, dy = b.y - pr.y;
      if (dx * dx + dy * dy < r2) { b.dead = true; pr.eaten = (pr.eaten || 0) + 1; }
    }
    const k = 1 + Math.min(1, (pr.eaten || 0) * 0.04);
    pr.r = pr.r0 * k; pr.aura = pr.aura0 * k;
  }
  if (hasSig(w, 'parking') && !pr.parked && caught >= 4) {
    pr.parked = true; pr.vx = 0; pr.vy = 0; pr.pull *= 2.5; pr.life += pr.life + 1; pr.max = pr.life;
    ring(pr.x, pr.y, pr.aura, '#c77dff', 0.4, 4);
  }
}

// ---------------------------------------------------------------- Spoilers + Slipstream Scalpel
// Spoilers makes shots appear next to their target. The Scalpel's "shot" is you, so every few seconds you
// appear next to an enemy instead: you blink straight through it, and the whole line you skipped gets cut.
function spoilerBlink(dt) {
  const w = owned('wake'), f = G.P.future;
  if (!w || f <= 0 || G.state !== 'play') return;
  G.blinkT = (G.blinkT == null ? 2 : G.blinkT) - dt;
  if (G.blinkT > 0) return;
  G.blinkT = clamp(0.5 / f, 1.5, 6); // 10%: every 5s ... 33%+: every 1.5s
  const p = me(), t = acquire('cluster', 520, p.x, p.y) || acquire('nearest', 520, p.x, p.y);
  if (!t) { G.blinkT = 0.5; return; }
  const dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  const L = d + t.r + p.r + 30; // land just past it
  let ex = p.x + ux * L, ey = p.y + uy * L;
  const c = G.core, od = Math.hypot(ex - c.x, ey - c.y);
  if (od > CORE.arena - 40) { ex = c.x + (ex - c.x) / od * (CORE.arena - 40); ey = c.y + (ey - c.y) / od * (CORE.arena - 40); }
  const sx0 = p.x, sy0 = p.y, src = Object.assign(weaponSrc(w), { wname: 'Spoiler Blink' });
  // The cut: everything along the line takes a heavy slash, and the line stays sharp for a moment.
  const hit = new Set(), len = Math.hypot(ex - sx0, ey - sy0);
  for (let s = 0; s <= len; s += 18) {
    const x = sx0 + ux * s, y = sy0 + uy * s;
    forNear(x, y, w.s.area + 12, e => { if (!hit.has(e)) { hit.add(e); damageEnemy(e, w.s.dmg * 2, src); } });
    if (G.zones.length < 300 && s % 36 < 18) G.zones.push(wakeZone(w, x, y));
    if (Math.random() < 0.5) spawnPart(x, y, w.def.color, 1, 60, 0.35, 2);
  }
  ring(sx0, sy0, 28, w.def.color, 0.3, 3);
  p.x = ex; p.y = ey; pushOut(p, p.r, 0);
  p.vx = ux * 220; p.vy = uy * 220; p.hd = Math.atan2(uy, ux);
  p.iframes = Math.max(p.iframes || 0, 0.35);
  w.lx = p.x; w.ly = p.y; // the trail carries on from where you land
  ring(p.x, p.y, 40, w.def.color, 0.35, 4);
  addLight(p.x, p.y, 120, w.def.color, 0.4);
  G.fx.push({ type: 'bolt', pts: [sx0, sy0, ex, ey], color: '#e0fbfc', life: 0.25, max: 0.25 });
  if (!(G.blinkLblT > G.realT)) { G.blinkLblT = G.realT + 3; floatText(p.x, p.y - 30, hit.size >= 4 ? 'SPOILER: EVERYONE DIES' : 'SPOILER!', '#e0fbfc', 14, 0.8); }
  sfx('zap');
}

// ---------------------------------------------------------------- upgrades given a weapon's own twist (see ADAPT)
function applyAdapt(w, s) {
  const P = G.P;
  switch (w.id) {
    case 'tesla': s.chain += P.pierce; break;
    case 'venom': s.area *= 1 + 0.12 * P.pierce; s.flight = (s.flight || 0.6) / P.projSpeed; break;
    case 'mines': s.knock = (s.knock || 0) + 120 * P.pierce; break;
    case 'siphon': s.pierce = (s.pierce || 0) + P.pierce; break;
    case 'orbit': s.hitCd = 0.4 / (1 + 0.35 * P.pierce); s.spin *= P.haste; s.radius *= 1 + (P.projSpeed - 1) * 0.6; s.size *= P.magMult; break;
    case 'paddle': case 'flail': {
      // The swing's reach grows with area; the target range covers the reach plus a body width.
      s.reach = s.range * s.area * (w.id === 'flail' ? 1 + 0.12 * P.pierce : 1);
      if (w.id === 'paddle') s.arc *= 1 + 0.15 * P.pierce;
      s.width = (s.width || 15) * Math.sqrt(s.area);
      s.range = s.reach + 18;
      break;
    }
    case 'onesie':
      // The tank weapon: hits harder the bigger and tougher you are.
      s.dmg *= 1 + Math.max(0, P.maxHp - 120) / 250 + P.armour * 0.08;
      if (hasSig(w, 'growthspurt')) s.area *= 1 + 0.1 * P.maxHp / 100;
      s.knock = (s.knock || 0) + 80 * P.pierce;
      s.range = s.area;
      break;
    case 'wake':
      s.knock = 60 * P.pierce; s.dmg *= P.haste; s.dur *= P.reloadSpd; s.area *= P.magMult;
      // Split Personality: one bigger, longer blade rather than more of them.
      s.area *= 1 + 0.18 * P.multishot; s.dur *= 1 + 0.18 * P.multishot;
      for (const l in w.perks || {}) { const k = w.perks[l]; if (k === 'rapid') s.dmg *= 1.33; if (k === 'frenzy') s.dmg *= 1.6; if (k === 'overclock') s.dmg *= 2; }
      break;
  }
  if (w.def.toy) toyAdapt(w, s);
}
// The notes for the weapons you own, for an upgrade card.
function adaptNotes(map) {
  if (!map || !G) return '';
  const n = G.weapons.filter(w => w && map[w.id]).map(w => map[w.id]);
  return n.length ? ' ' + n.join(' ') : '';
}
// Premature Evangelation clocking off: Last Word burst and Tactical Nap shockwave.
function angelsClockOff(w) {
  const p = me();
  w.focusT = 0;
  if (G.P.lastRound > 0) aoe(p.x, p.y, w.s.radius + 40, w.s.dmg * (2 + Math.min(4, G.P.lastRound)), Object.assign(weaponSrc(w), { wname: 'Angels clocking off' }), '#c77dff');
  tacticalWave();
}
// Spoilers + angels: now and then one pops up next to an enemy to bless it early.
function angelSpoilers(w, dt) {
  if (G.P.future <= 0) return;
  w.spoilT = (w.spoilT || 1.2) - dt;
  if (w.spoilT > 0) return;
  w.spoilT = 1.2;
  if (Math.random() > Math.min(1, G.P.future * 3)) return;
  const p = me(), t = acquire('nearest', 280, p.x, p.y);
  if (!t) return;
  bolt(p.x, p.y, t.x, t.y, '#c77dff', 0.15); ring(t.x, t.y, t.r + 12, '#c77dff', 0.3, 3);
  damageEnemy(t, w.s.dmg * 1.5, Object.assign(weaponSrc(w), { wname: 'Premature Evangelation' }));
}

// Acrosome Ram: enemies you swim into take damage, more the faster you're going (from updateEnemies).
// It scales with your level, max HP and armour, so it's the tank build's main weapon. At speed it also
// sends out a shockwave. Returns how hard you hit (0 to 1), which also softens their contact damage.
function ramHit(e, p) {
  const P = G.P;
  if (P.ram <= 0 || e.charmed || e.egg) return 0;
  const v = Math.hypot(p.vx || 0, p.vy || 0);
  let k = 0.25 + 0.75 * Math.min(1, v / 200);
  // Head-on: what counts is how fast you're closing on each other, not just your own speed.
  // (At full speed you can pass through each other inside one frame, so it's the relative speed whenever you're swimming at each other.)
  const dx = e.x - p.x, dy = e.y - p.y, dl = Math.hypot(dx, dy) || 1, pvx = p.vx || 0, pvy = p.vy || 0, evx = e.svx || 0, evy = e.svy || 0;
  const closing = pvx * evx + pvy * evy < 0 ? Math.hypot(pvx - evx, pvy - evy) : 0;
  const head = closing > 230 && Math.hypot(e.svx || 0, e.svy || 0) > 60 ? Math.min(1.9, closing / 230) : 1;
  k *= head;
  if (e.ramT > G.t) return Math.min(1, k);
  e.ramT = G.t + 0.2;
  // Frozen things are brittle: a fast ram shatters them, and the shards fly on.
  if (e.frozen > 0 && k > 0.6 && !e.boss && !e.rival) {
    const ux = dx / dl, uy = dy / dl;
    e.hp = 0; killEnemy(e, { wname: 'Icebreaker' });
    fxParts('shard', e.x, e.y, '#e6f4ff', 14, 420, 0.5, 4, Math.atan2(uy, ux), 0.6);
    forNear(e.x + ux * 70, e.y + uy * 70, 75, o => { if (o !== e && !o.charmed && !o.egg) damageEnemy(o, (30 + G.level * 6) * P.might * 3, { elem: 'ice', wname: 'Icebreaker', noCrit: true, knock: 260, kx: ux, ky: uy }); });
    ring(e.x, e.y, e.r + 20, '#e6f4ff', 0.3, 4);
    quirkFound('icebreaker', e.x, e.y);
    return 1;
  }
  const dmg = P.ram * (30 + G.level * 6 + P.maxHp * 0.3 + P.armour * 8) * P.might * k * 4 * G.evm.ram * tankDamageOut();
  const src = { elem: 'phys', wname: 'Acrosome Ram', noCrit: k < 0.6, knock: 160 + 320 * Math.min(1.5, k) };
  damageEnemy(e, dmg, Object.assign({ kx: dx, ky: dy }, src));
  if (head > 1.3) { floatText(e.x, e.y - e.r - 8, 'HEAD-ON!', PAL.you, 15, 0.6); quirkFound('headon', e.x, e.y); }
  if (k > 0.7) {
    const R = 60 + 12 * P.ram;
    forNear(e.x, e.y, R, o => { if (o !== e && !o.charmed && !o.egg) damageEnemy(o, dmg * 0.5, Object.assign({ kx: o.x - p.x, ky: o.y - p.y, noCrit: true }, src)); });
    ring(e.x, e.y, R, PAL.you, 0.25, 3); cam.shake = Math.min(6, cam.shake + 1.5);
    if (!(G.ramLblT > G.realT) && head <= 1.3) { G.ramLblT = G.realT + 1.2; floatText(e.x, e.y - e.r - 8, 'RAMMED', PAL.you, 13, 0.6); }
  }
  return Math.min(1, k);
}

// ---------------------------------------------------------------- tank builds
// Big Boned: damage from your bulk. Stubborn Streak: below half health you hit harder and take less.
const lowHp = () => G.player.hp < G.P.maxHp * 0.5;
function tankDamageOut() {
  const P = G.P;
  return (1 + P.heft * 0.04 * P.maxHp / 100) * (P.grit > 0 && lowHp() ? 1 + 0.12 * P.grit : 1);
}
function tankDamageIn() { const P = G.P; return P.grit > 0 && lowHp() ? Math.max(0.4, 1 - 0.1 * P.grit) : 1; }
// Prickly Personality (and the Thorny Onesie's Spiky Personality): whatever hurts you gets hurt back.
function thornsHit(ent) {
  const P = G.P, ow = ownSig('onesie', 'spiky');
  const k = P.thorns + (ow ? 2 : 0);
  if (k <= 0) return;
  const p = me(), dmg = k * (15 + P.maxHp * 0.2 + P.armour * 6) * P.might * tankDamageOut();
  const src = { elem: 'phys', wname: 'Thorns', noCrit: true, knock: 220 };
  if (ent && !ent.dead && !ent.charmed && !ent.egg) damageEnemy(ent, dmg, Object.assign({ kx: ent.x - p.x, ky: ent.y - p.y }, src));
  forNear(p.x, p.y, 90, o => { if (o !== ent && !o.charmed && !o.egg) damageEnemy(o, dmg * 0.4, Object.assign({ kx: o.x - p.x, ky: o.y - p.y }, src)); });
  ring(p.x, p.y, 90, '#ff8fab', 0.3, 3);
}

// ---------------------------------------------------------------- Lv 8 signatures: per-frame and helpers
// A burst of speed in a direction, untouchable while it lasts (Recoil Jump, Snap Back).
function dashPlayer(ux, uy, v) {
  const p = G.player;
  p.vx += ux * v; p.vy += uy * v; p.x += ux * v * 0.06; p.y += uy * v * 0.06;
  p.iframes = Math.max(p.iframes, 0.35);
}
function sigReload(w) {
  if (!hasSig(w, 'phlegmfan')) return;
  // Phlegm Fan: a ring of spit every reload.
  const p = me(), src = Object.assign(weaponSrc(w), { wname: 'Phlegm Fan' });
  for (let i = 0; i < 12; i++) spawnProj(w, p.x, p.y, i / 12 * TAU + Math.random() * 0.2, src);
}
// From hurtPlayer: Martyrdom.
function sigHurt() {
  const ow = ownSig('orbit', 'martyr');
  if (!ow || G.martyrT > G.t) return;
  G.martyrT = G.t + 2;
  const p = me();
  aoe(p.x, p.y, ow.s.radius + 70, ow.s.dmg * 3, Object.assign(weaponSrc(ow), { wname: 'Martyrdom' }), '#c77dff');
  floatText(p.x, p.y - 34, 'MARTYRDOM', '#c77dff', 14, 0.6);
}
const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
function sig8Tick(dt) {
  const p = me();
  // Bleeding (Bloodletting, Barbed Tail).
  for (const e of G.enemies) {
    if (!(e.bleed > 0) || e.dead) continue;
    const d = Math.max(e.bleed * dt / 1.5, Math.min(e.bleed, 2 * dt));
    e.bleed -= d;
    damageEnemy(e, d, { dot: true, noCrit: true, noStatus: true, noArc: true, wname: 'Bleed' });
    if (Math.random() < dt * 4) spawnPart(e.x, e.y, '#ff3b3b', 1, 30, 0.4, 2);
  }
  G.slip = false; G.fortArm = 0;
  for (const w of G.weapons) {
    if (!w) continue;
    w.rateK = 1;
    if (w.id === 'glaive' && (hasSig(w, 'yoyoshield') || hasSig(w, 'cradle'))) {
      const shield = hasSig(w, 'yoyoshield'), cradle = hasSig(w, 'cradle');
      const tick = cradle && !(w.cradleT > G.t);
      if (tick) w.cradleT = G.t + 0.2;
      for (const pr of G.proj) {
        if (pr.w !== w || pr.dead || pr.mine) continue;
        if (shield) for (const b of G.ebul) if (!b.dead && Math.abs(b.x - pr.x) < pr.r + 8 && Math.abs(b.y - pr.y) < pr.r + 8) { b.dead = true; spawnPart(b.x, b.y, '#f1f1f1', 1, 50, 0.2); }
        if (tick) {
          const mx = (p.x + pr.x) / 2, my = (p.y + pr.y) / 2, half = Math.hypot(pr.x - p.x, pr.y - p.y) / 2;
          forNear(mx, my, half + 10, e => { if (!e.charmed && segDist(e.x, e.y, p.x, p.y, pr.x, pr.y) < e.r + 6) damageEnemy(e, w.s.dmg * 0.3, Object.assign(weaponSrc(w), { wname: "Cat's Cradle", noCrit: true })); });
          G.fx.push({ type: 'bolt', pts: [p.x, p.y, pr.x, pr.y], color: '#f1f1f1', life: 0.15, max: 0.15 });
        }
      }
    }
    if (w.id === 'orbit' && hasSig(w, 'smite') && w.blades.length) {
      w.smiteT = (w.smiteT == null ? 2.5 : w.smiteT) - dt;
      if (w.smiteT <= 0) {
        w.smiteT = 2.5;
        const n = w.blades.length / 3, ts = acquireMany('random', 340, p.x, p.y, n), src = Object.assign(weaponSrc(w), { wname: 'Smite' });
        ts.forEach((t, i) => { bolt(w.blades[i * 3], w.blades[i * 3 + 1], t.x, t.y, '#e0aaff', 0.2); damageEnemy(t, w.s.dmg * 1.5, src); });
      }
    }
    if (w.id === 'wake' && hasSig(w, 'slipstream') && !G.slip) {
      for (const z of G.zones) if (z.trail && z.src && z.src.w === w && z.max - z.life > 0.5 && Math.abs(z.x - p.x) < z.r && Math.abs(z.y - p.y) < z.r) { G.slip = true; break; }
    }
    if (w.id === 'paddle' && hasSig(w, 'tantrum')) { if (!(w.tantT > G.t)) w.tant = Math.max(0, (w.tant || 0) - dt * 6); w.rateK = 1 + 0.05 * (w.tant || 0); }
    if (w.id === 'onesie' && hasSig(w, 'fortress') && Math.hypot(p.vx || 0, p.vy || 0) < 60) { G.fortArm = 4; w.rateK = 1.5; }
  }
}

// ---------------------------------------------------------------- Toddler Gravity: black holes merge
// Orbs fire out as usual, but they're black holes: any two near each other are pulled together like a
// rubber band (harder the further apart they are) and merge into one bigger orb. Volumes add (the radius
// grows with the cube root), damage adds up and the pull grows. Twenty merged: SUPERNOVA, at most once
// every 40 s. Until one is allowed, orbs that would reach twenty don't pull together.
const VOID_MERGE = { reach: 200, band: 1.6, supernova: 20, gap: 40 };
function voidMerge(dt) {
  G.voidBands = [];
  const orbs = G.proj.filter(pr => pr.style === 'void' && !pr.dead && pr.w && pr.w.id === 'void' && !pr.lob);
  if (orbs.length < 2) return;
  for (let i = 0; i < orbs.length; i++) for (let j = i + 1; j < orbs.length; j++) {
    const a = orbs[i], b = orbs[j];
    if (a.dead || b.dead) continue;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    if (d > VOID_MERGE.reach) continue;
    if ((a.mass || 1) + (b.mass || 1) >= VOID_MERGE.supernova && G.t < (G.novaT || 0)) continue;
    if (d < (a.r + b.r) * 0.65) { voidCombine(a.r >= b.r ? a : b, a.r >= b.r ? b : a); continue; }
    // The rubber band: each is dragged towards the other, the heavier one less.
    const ma = a.mass || 1, mb = b.mass || 1, pull = (40 + d * VOID_MERGE.band) * dt, ux = dx / d, uy = dy / d;
    a.x += ux * pull * mb / (ma + mb) * 2; a.y += uy * pull * mb / (ma + mb) * 2;
    b.x -= ux * pull * ma / (ma + mb) * 2; b.y -= uy * pull * ma / (ma + mb) * 2;
    G.voidBands.push(a, b);
  }
}
function voidCombine(a, b) {
  const ma = a.mass || 1, mb = b.mass || 1, m = ma + mb, k = Math.cbrt(Math.pow(a.r, 3) + Math.pow(b.r, 3)) / a.r;
  a.mass = m; b.dead = true;
  // Whatever either had swallowed comes along (see quirks.js).
  if (b.mines) { a.mines = (a.mines || 0) + b.mines; a.mineDmg = (a.mineDmg || 0) + b.mineDmg; a.mineSrc = a.mineSrc || b.mineSrc; }
  if (b.loot) a.loot = (a.loot || []).concat(b.loot);
  a.r *= k; a.aura = (a.aura || 0) * k; a.r0 = (a.r0 || a.r / k) * k; a.aura0 = (a.aura0 || a.aura / k) * k;
  a.dmg += b.dmg; a.pull = Math.max(a.pull, b.pull) * 1.12;
  a.dealt = (a.dealt || 0) + (b.dealt || 0);
  a.life = (a.life * ma + b.life * mb) / m; // fresh orbs barely extend a big one's life
  // Momentum: the merged orb keeps drifting the weighted-average way.
  a.vx = (a.vx * ma + b.vx * mb) / m; a.vy = (a.vy * ma + b.vy * mb) / m;
  if (b.hits) for (const id of b.hits) (a.hits || (a.hits = [])).includes(id) || a.hits.push(id);
  G.fx.push({ type: 'flash', x: a.x, y: a.y, r: a.aura * 0.8, color: '#c77dff', life: 0.25, max: 0.25 });
  ring(a.x, a.y, a.aura, '#e0aaff', 0.4, 4);
  fxParts('ember', a.x, a.y, '#e0aaff', 6, 160, 0.5, 3);
  cam.shake = Math.min(8, cam.shake + 1 + m * 0.3);
  if (m >= 3) floatText(a.x, a.y - a.r - 12, 'MERGE x' + m, '#e0aaff', 12 + Math.min(8, m), 0.7);
  if (m >= VOID_MERGE.supernova && G.t >= (G.novaT || 0)) { G.novaT = G.t + VOID_MERGE.gap; voidSupernova(a); }
}
function voidSupernova(a) {
  a.dead = true;
  orbCollapse(a);
  const R = Math.max(220, a.aura * 3.5), src = Object.assign({}, a.src, { noProc: true, noCrit: true, mult: 1, wname: 'Supernova' });
  aoe(a.x, a.y, R, a.dmg * (a.mass || 10) * 2 + (a.dealt || 0) * 0.5, src, '#e0aaff');
  for (const b of G.ebul) if (Math.hypot(b.x - a.x, b.y - a.y) < R) b.dead = true;
  G.fx.push({ type: 'flash', x: a.x, y: a.y, r: R * 1.4, color: '#ffffff', life: 0.6, max: 0.6 });
  G.fx.push({ type: 'pillar', x: a.x, y: a.y, r: 120, color: '#e0aaff', life: 1.2, max: 1.2 });
  for (const [rr, w, l] of [[R * 0.5, 14, 0.6], [R, 9, 0.9], [R * 1.5, 4, 1.2]]) ring(a.x, a.y, rr, '#ffffff', l, w);
  fxParts('spark', a.x, a.y, '#ffffff', 40, R * 4, 0.7, 3); fxParts('ember', a.x, a.y, '#e0aaff', 24, R * 1.5, 1.2, 4);
  addLight(a.x, a.y, R * 2.5, '#ffffff', 1);
  floatText(a.x, a.y - 40, 'SUPERNOVA', '#ffffff', 26, 1.4);
  banner('SUPERNOVA', '#e0aaff');
  G.flashT = 0.3; cam.shake = 22; sfx('boss'); vibrate([100, 50, 200]);
}
