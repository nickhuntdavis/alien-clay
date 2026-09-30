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
  else if (id === 'seeker') { if (hasSig(w, 'reunion')) pr.reunion = 1; }
  else if (id === 'void') { pr.dealt = 0; pr.r0 = pr.r; pr.aura0 = pr.aura; }
}

// ---------------------------------------------------------------- hits and kills
// Multiplier a hit gets from statuses your signatures put on enemies (from damageEnemy).
function sigDamageMul(e, src) {
  let m = 1;
  if (e.soggyT > G.t) m *= 1.3;
  if (e.guiltT > G.t) m *= 1.35;
  if (src.w && src.w.id === 'shotgun' && G.pair.suckerpunch && e.pulledT > G.t) m *= 2;
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
    if (hasSig(w, 'shatter') && e.frozen > 0 && !e.dead) {
      e.frozen = 0;
      aoe(e.x, e.y, 62, dmg * 2.5, Object.assign({}, src, { noProc: true, noCrit: true, mult: 1, wname: 'Shatter' }), '#bde0fe');
      floatText(e.x, e.y - e.r - 10, 'SHATTER', '#bde0fe', 13);
    }
  } else if (w.id === 'orbit') {
    if (hasSig(w, 'guilttrip')) e.guiltT = G.t + 4;
    if (G.pair.bbq) { e.burn = Math.max(e.burn, 3); e.burnDps = Math.max(e.burnDps, dmg * 0.5); }
  }
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
  return z;
}
// Called for every enemy standing in a zone, each zone tick.
function sigZone(z, e, dt) {
  if (z.venom || (z.src && z.src.w && z.src.w.id === 'venom')) {
    e.puddleT = G.t + 0.4;
    if (hasSig(z.src.w, 'nausea')) { e.chill = Math.max(e.chill, 0.4); e.chillAmt = Math.max(e.chillAmt, 0.45); e.weakT = G.t + 0.4; }
  }
  if (z.freeze && !e.boss && !e.rival) e.frozen = Math.max(e.frozen, 1);
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
  return { k, r: r * Math.sqrt(pr.dominoK || 1) };
}
function afterMine(pr) {
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
  const p = me(), src = weaponSrc(w), n = Math.min(48, w.stored);
  for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, i / n * TAU, src);
  w.stored = 0;
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
    if (sw && sw.stored < sw.s.mag) sw.stored++;
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
