'use strict';
// Spawn Prawn - previews and branch scenes for the Alien weapons, on the sidemo.js engine with the bldemo.js, fbdemo.js
// and asdemo.js (xs* statuses) helpers. Alien hits fill the Alien bar; a full bar Possesses a cell, and it fights its mates.
//  - Rent Free (v_soul_proj): a slow pale ghost (22, 240 speed) at the nearest cell in reach (440), 8 a magazine.
//  - Peekaboo (s_peekaboo): every 5.5 s you vanish for 1.8 s; cells swarm the empty spot (shooters hit each other), then
//    BOO: everything near takes 20 and is Feared for 2 s.
//  - Eggs (s_toothfairy): spectral eggs (3 down at once, 6 s) lure the nearest greedy cell within 230; whoever takes one is
//    smitten for 34.
//  - Chest Burster (s_parasite): fast needles (12) at the strongest cell infect it; an infected cell that dies rises as
//    undead and fights for you for 6 s (4 at most).
// Hooks: none (PV_OWN entries).

const AL_PALE = '#e0d7ff', AL_WORM = '#9bd17a';
function alShooters(pv, n, H) { for (let i = 0; i < n; i++) sivFoe(pv, 0.9, H * (0.15 + i * 0.7), { hp: 400, sp: 0.002, spit: true, spitCd: 1.1 + i * 0.3 }); }

// ================================================================ Rent Free (ghost shot)
const GTV = { id: 'v_soul_proj', range: 0.75, cd: 0.6, mag: 8, reload: 1.2, dmg: 22, v: 0.41, alien: 0.3 };
const GTV_FLAG = { A: 'through', B: 'return', C: 'unfinished', 'Ghost Through': 'through', 'Cold Spot': 'cold', 'Second Sighting': 'second', 'Nine-Tenths of the Law': 'nine',
  'Revolving Door': 'return', 'Ghostly Tug': 'tug', 'Hitching a Ride': 'ride', 'Haunted House': 'haunted', 'Unfinished Business': 'unfinished',
  'Spreading Spooks': 'spooks', 'Friendly Ghost': 'friendly', Seance: 'seance', 'Mass Possession': 'mass', Poltergeist: 'polter', 'Ghost Army': 'army' };
function gtvInit(pv) {
  const F = xsInit(pv, { range: GTV.range, mag: GTV.mag, reload: GTV.reload, rate: GTV.cd, ghosts: [], sunk: [], friends: [], seanceT: 4, dead: [] });
  pv.me.x = 0.16;
}
function gtvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  const line = F.has('through') || F.has('return') || F.has('polter');
  for (let i = 0; i < 7; i++) sivFoe(pv, line ? 0.4 + i * 0.07 : 0.55 + R() * 0.4, line ? H * 0.56 + (R() - 0.5) * 0.04 : H * (0.12 + R() * 0.76), { hp: F.has('unfinished') || F.has('army') ? 40 : F.has('nine') || F.has('ride') ? 130 : 75, sp: 0.03 });
  if (F.has('haunted')) for (const e of pv.foes) { e.dodge = (R() < 0.5 ? 1 : -1) * 2; e.x = 1 + R() * 0.15; }
  if (F.has('friendly')) sivFoe(pv, 0.6, H * 0.3, { r: 0.045, hp: 90, sp: 0.02, elite: true });
  if (F.has('seance')) alShooters(pv, 1, H);
}
function gtvGhost(pv, x, y, a, o) {
  const F = pv.F;
  const g0 = Object.assign({ x, y, sx: x, sy: y, a, v: GTV.v * (F.has('return') ? 0.7 : 1), dist: 0, hits: 0, hit: new Set(), dmg: GTV.dmg, trail: [], pass: F.has('through') ? 4 : 1, back: false, wander: F.has('polter') ? 6 : 0 }, o);
  pv.ghosts.push(g0); return g0;
}
function gtvFire(pv) {
  const F = pv.F, me = pv.me;
  if (F.has('polter') && pv.ghosts.length >= 6) return false;
  const t = fbNearest(pv, me, GTV.range, null, e => !e.spit); if (!t) return false;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.008;
  gtvGhost(pv, me.x, me.y, me.a);
  return true;
}
function gtvHit(pv, g0, e) {
  const F = pv.F;
  let k = g0.dmg * (F.has('unfinished') ? 0.8 : 1);
  if (F.has('through')) k *= g0.hits === 0 ? 0.85 : Math.pow(0.8, g0.hits);
  g0.hit.add(e); g0.hits++;
  sivDamage(pv, e, k, false, AL_PALE);
  const a = F.has('mass') ? 0.5 : F.has('ride') || F.has('nine') ? 0.5 : F.has('cold') || g0.hits === 1 ? GTV.alien : 0;
  if (F.has('through') && g0.hits > 1) xsHint(pv, 'gt', 'GHOST THROUGH: ' + g0.hits + ' DEEP', AL_PALE);
  if (F.has('mass')) xsHint(pv, 'mp', 'MASS POSSESSION: HALF A BAR A HIT', XS.alien);
  if (a) { xsAdd(pv, e, 'alien', a); if (F.has('cold') && g0.hits > 1) xsHint(pv, 'cs', 'COLD SPOT: EVERY ONE FILLS', XS.alien); }
  if (e.poss > 0 && F.has('mass')) e.poss = Math.max(e.poss, 8);
  if (F.has('unfinished') && e.hp > 0) e.haunt = { t: 3, gen: g0.gen || 0 };
  if (g0.back && F.has('ride') && e.poss > 0) { e.ride = { g: g0, t: 1 }; sivTxt(pv, e.x, e.y - e.r - 0.04, 'HITCHING A RIDE', XS.alien); }
}
function gtvKill(pv, e) {
  const F = pv.F;
  pv.dead.push({ x: e.x, y: e.y }); if (pv.dead.length > 5) pv.dead.shift();
  if (F.has('army')) { pv.friends.push({ x: e.x, y: e.y, t: 5, shootT: 0.3, army: true }); sivTxt(pv, e.x, e.y - e.r - 0.04, 'GHOST ARMY', AL_PALE); }
  if (e.haunt && e.haunt.t > 0) {
    if (F.has('friendly') && e.elite) { pv.friends.push({ x: e.x, y: e.y, t: 4, biteT: 0, friendly: true }); sivTxt(pv, e.x, e.y - e.r - 0.05, 'FRIENDLY GHOST', AL_PALE, true); return; }
    sivRing(pv, e.x, e.y, 0.12, AL_PALE, 0.4); sivTxt(pv, e.x, e.y - e.r - 0.05, 'UNFINISHED BUSINESS', AL_PALE, true);
    for (const o of sivAlive(pv)) if (o !== e && !o.dying && sivD(o, e) < 0.12) { sivDamage(pv, o, GTV.dmg * 0.6, false, AL_PALE); xsAdd(pv, o, 'alien', 0.3); if (F.has('spooks') && e.haunt.gen < 1) { o.haunt = { t: 3, gen: e.haunt.gen + 1 }; sivTxt(pv, o.x, o.y - o.r, 'SPREADING SPOOKS', AL_PALE); } }
  }
}
function gtvPossHit(pv, e, o) { if (pv.F.has('nine') && !(e.nineT > pv.t)) { e.nineT = pv.t + 1; gtvGhost(pv, e.x, e.y, Math.atan2(o.y - e.y, o.x - e.x), { pass: 1, own: e }); sivTxt(pv, e.x, e.y - e.r - 0.04, 'NINE-TENTHS', XS.alien); } }
function gtvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  fbMe(pv, dt);
  blvGun(pv, dt, gtvFire);
  for (const g0 of pv.ghosts) {
    if (g0.dead) continue;
    if (g0.wander > 0) { // Poltergeist: it wanders for 6 s, hitting everything it touches
      g0.wander -= dt; const o = fbNearest(pv, g0, 1, null, q => !g0.hit.has(q)); if (o) { const a = Math.atan2(o.y - g0.y, o.x - g0.x); g0.a += Math.atan2(Math.sin(a - g0.a), Math.cos(a - g0.a)) * Math.min(1, dt * 3); }
      if (g0.wander <= 0) g0.dead = true; if (Math.random() < dt * 0.4) sivTxt(pv, g0.x, g0.y - 0.03, 'POLTERGEIST', AL_PALE);
      if (Math.random() < dt) g0.hit.clear();
    }
    const st = g0.v * dt; g0.x += Math.cos(g0.a) * st; g0.y += Math.sin(g0.a) * st; g0.dist += st;
    g0.trail.push({ x: g0.x, y: g0.y }); if (g0.trail.length > 8) g0.trail.shift();
    if (g0.back) { // Return to Sender: retracing its path back to you (Ghostly Tug pulls what it passes)
      const a = Math.atan2(me.y - g0.y, me.x - g0.x); g0.a = a;
      if (sivD(g0, me) < 0.03) { g0.dead = true; continue; }
    } else if (!g0.wander && (g0.dist > GTV.range || g0.x > 1.05 || g0.y < -0.05 || g0.y > H + 0.05)) {
      if (F.has('second') && !g0.again) { g0.again = true; g0.x = g0.sx; g0.y = g0.sy; g0.dist = 0; g0.hit.clear(); g0.hits = 0; sivTxt(pv, g0.x, g0.y - 0.05, 'SECOND SIGHTING', AL_PALE); continue; }
      if (F.has('haunted') && !g0.hits) { pv.sunk.push({ x: Math.min(0.85, g0.x), y: Math.max(0.03, Math.min(H - 0.03, g0.y)), t: 8 }); sivTxt(pv, g0.x, g0.y - 0.03, 'SINKS IN', AL_PALE); }
      g0.dead = true; continue;
    }
    for (const e of sivAlive(pv)) {
      if (g0.hit.has(e) || e.dying || e === g0.own || (e.spit && !g0.own)) continue;
      if (sivD(e, g0) < e.r + 0.012) {
        if (g0.back) { g0.hit.add(e); sivDamage(pv, e, g0.dmg * 0.7, false, AL_PALE); if (F.has('ride')) xsAdd(pv, e, 'alien', 0.5); if (F.has('tug')) { const d = sivD(e, me) || 1; e.kx += (me.x - e.x) / d * 0.25; e.ky += (me.y - e.y) / d * 0.25; sivTxt(pv, e.x, e.y - e.r, 'GHOSTLY TUG', AL_PALE); } if (F.has('ride') && e.poss > 0 && !e.ride) { e.ride = { g: g0, t: 1 }; sivTxt(pv, e.x, e.y - e.r - 0.04, 'HITCHING A RIDE', XS.alien); } continue; }
        gtvHit(pv, g0, e);
        if (g0.hits >= g0.pass && !g0.wander) { if (F.has('return')) { g0.back = true; g0.hit.clear(); sivTxt(pv, g0.x, g0.y - 0.04, 'RETURN TO SENDER', AL_PALE); } else g0.dead = true; break; }
      }
    }
  }
  pv.ghosts = pv.ghosts.filter(g0 => !g0.dead);
  // Haunted House: sunk ghosts pop up under the next cell that swims over them.
  for (const s of pv.sunk) { s.t -= dt; for (const e of sivAlive(pv)) if (!e.dying && sivD(e, s) < e.r + 0.1) { s.t = 0; gtvHit(pv, { dmg: GTV.dmg, hit: new Set(), hits: 0 }, e); sivTxt(pv, e.x, e.y - e.r - 0.04, 'HAUNTED HOUSE', AL_PALE, true); break; } }
  pv.sunk = pv.sunk.filter(s => s.t > 0);
  for (const e of sivAlive(pv)) {
    if (e.haunt) { e.haunt.t -= dt; if (e.haunt.t <= 0) e.haunt = null; }
    if (e.ride) { e.ride.t -= dt; const g0 = e.ride.g; e.x = g0.x; e.y = g0.y; for (const o of sivAlive(pv)) if (o !== e && sivD(o, e) < o.r + e.r && !(o.bumpT > pv.t)) { o.bumpT = pv.t + 0.5; sivDamage(pv, o, 8, false, XS.alien); } if (e.ride.t <= 0 || g0.dead) e.ride = null; }
  }
  // Friendly ghosts and the ghost army fight for you; Seance flickers the dead back to draw fire.
  for (const f of pv.friends) { f.t -= dt; const o = fbNearest(pv, f, 0.6, null, q => !q.spit); if (!o) continue; if (f.army) { f.shootT -= dt; if (f.shootT <= 0) { f.shootT = 0.8; gtvGhost(pv, f.x, f.y, Math.atan2(o.y - f.y, o.x - f.x), { pass: 1, dmg: GTV.dmg * 0.6 }); } } else { const d = sivD(o, f) || 1; f.x += (o.x - f.x) / d * 0.15 * dt; f.y += (o.y - f.y) / d * 0.15 * dt; f.biteT -= dt; if (d < o.r + 0.02 && f.biteT <= 0) { f.biteT = 0.5; sivDamage(pv, o, 12, false, AL_PALE); } } }
  pv.friends = pv.friends.filter(f => f.t > 0);
  if (F.has('seance')) { pv.seanceT -= dt; if (pv.seanceT <= 0 && pv.dead.length) { pv.seanceT = 8; pv.flick = pv.dead.map(d => ({ x: d.x, y: d.y, t: 1 })); sivTxt(pv, 0.5, H * 0.15, 'SEANCE', AL_PALE, true); } }
  if (pv.flick) { for (const f of pv.flick) f.t -= dt; pv.flick = pv.flick.filter(f => f.t > 0); }
  fbSpit(pv, dt, (pv, b) => { if (pv.flick && pv.flick.length) { const f = pv.flick[0]; if (!b.aimed) { b.aimed = true; const a = Math.atan2(f.y - b.y, f.x - b.x); b.vx = Math.cos(a) * 0.3; b.vy = Math.sin(a) * 0.3; } if (sivD(f, b) < 0.03) { sivTxt(pv, f.x, f.y - 0.04, 'DECOY', AL_PALE); return true; } } return false; });
  if (F.has('return')) xsHint(pv, 'rs', 'THERE AND BACK', AL_PALE);
  for (const e of sivAlive(pv)) if (e.dodge) e.y += Math.sin(pv.t * 3 + e.wob) * e.dodge * 0.25 * dt;
  xsStep(pv, dt);
}
function gtvOver(pv, g, X, Y, U, c) {
  for (const g0 of pv.ghosts) {
    if (g0.trail.length > 1) { g.strokeStyle = AL_PALE; g.globalAlpha = 0.3; g.lineWidth = U * 0.012; g.beginPath(); g.moveTo(X(g0.trail[0].x), Y(g0.trail[0].y)); for (const q of g0.trail) g.lineTo(X(q.x), Y(q.y)); g.stroke(); g.globalAlpha = 1; }
    pvGlow(g, X(g0.x), Y(g0.y), U * 0.035, g0.own ? XS.alien : AL_PALE, g0.back ? 0.5 : 0.8); g.fillStyle = '#fff'; g.beginPath(); g.arc(X(g0.x), Y(g0.y), U * 0.008, 0, TAU); g.fill();
  }
  for (const f of pv.friends) { pvGlow(g, X(f.x), Y(f.y), U * 0.04, AL_PALE, 0.7); }
  for (const f of pv.flick || []) { g.globalAlpha = f.t; g.strokeStyle = AL_PALE; g.lineWidth = 1.5; g.beginPath(); g.arc(X(f.x), Y(f.y), U * 0.026, 0, TAU); g.stroke(); }
  for (const s of pv.sunk) { g.globalAlpha = 0.4; g.fillStyle = AL_PALE; g.beginPath(); g.ellipse(X(s.x), Y(s.y), 6, 2, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
}
function gtvCell2(pv, g, e, x, y, r) { if (e.haunt) { const a = pv.t * 4; g.fillStyle = AL_PALE; g.beginPath(); g.arc(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5), 2, 0, TAU); g.fill(); } }
PV_OWN[GTV.id] = { init: gtvInit, step: gtvStep, draw: sivDraw, flags: GTV_FLAG, wave: gtvWave, under: (pv, g, X, Y, U) => fbDrawSpit(pv, g, X, Y, U), over: gtvOver, cell: xsCellHook, cell2: gtvCell2, kill: gtvKill, possHit: gtvPossHit };

// ================================================================ Peekaboo
const PKV = { id: 's_peekaboo', cd: 5.5, hide: 1.8, dmg: 20, area: 0.39, fear: 2, boom: 0.15 };
const PKV_FLAG = { A: 'boom', B: 'cantsee', C: 'boo', 'Peek-a-Boom': 'boom', 'Standing Room Only': 'room', Encore: 'encore', Rattle: 'rattle',
  "You Can't See Me": 'cantsee', 'Silent Running': 'silent', 'Sneak Attack': 'sneak', 'Mirror, Mirror': 'mirror', 'Boo!': 'boo', 'Tell a Friend': 'passon',
  Stampede: 'stampede', Cuckoo: 'cuckoo', 'Object Permanence': 'perm', 'Mass Hysteria': 'hysteria', 'Now You See Me': 'nysm' };
function pkvInit(pv) {
  const F = xsInit(pv, { range: PKV.area, mag: 1, reload: 0.1, hideT: 0, cdT: 1.5, decoys: [] });
  pv.cdMax = F.has('nysm') ? 4 : PKV.cd / (F.has('perm') ? 2 : 1); pv.hideMax = F.has('nysm') ? 3 : F.has('boo') ? 1.2 : PKV.hide;
  pv.me.x = 0.35; pv.patrol = true;
}
function pkvWave(pv) {
  const H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 7; i++) sivFoe(pv, 0.6 + R() * 0.35, H * (0.12 + R() * 0.76), { hp: 70, sp: 0.07 });
  alShooters(pv, 2, H);
}
function pkvVanish(pv) {
  const F = pv.F, me = pv.me;
  pv.hideT = pv.hideMax; pv.decoys = [{ x: me.x, y: me.y, n: 0, t: 99 }];
  if (F.has('mirror')) { pv.decoys.push({ x: me.x + 0.2, y: Math.max(0.05, me.y - 0.15), n: 0, t: 99 }); xsHint(pv, 'mm', 'MIRROR, MIRROR', XS.alien); }
  if (F.has('rattle')) { pv.decoys = [{ x: Math.min(0.9, me.x + 0.39), y: me.y, n: 0, t: 99, rattle: true }]; sivTxt(pv, me.x + 0.3, me.y - 0.05, 'RATTLE', XS.alien); }
  sivTxt(pv, me.x, me.y - 0.07, 'PEEKABOO', XS.alien, true);
}
function pkvDecoyBoom(pv, D, why) {
  const F = pv.F, R = Math.min(0.37, PKV.boom + (F.has('room') ? 0.024 * D.n : 0));
  sivRing(pv, D.x, D.y, R, XS.alien, 0.4); sivTxt(pv, D.x, D.y - 0.06, why, XS.alien, true);
  for (const e of sivAlive(pv)) if (!e.dying && sivD(e, D) < R + e.r) { sivDamage(pv, e, PKV.dmg, false, XS.alien); xsAdd(pv, e, 'alien', 0.3); }
}
function pkvBoo(pv) {
  const F = pv.F, me = pv.me, R = F.has('perm') ? 2 : F.has('boo') ? 0.26 : PKV.area, k = PKV.dmg * (F.has('boom') ? 0.7 : 1) * (F.has('cantsee') ? 0.6 : 1);
  sivTxt(pv, me.x, me.y - 0.08, F.has('perm') ? 'BOO (WHOLE SCREEN)' : F.has('boo') ? 'BOO! 3 s FEAR' : F.has('nysm') ? 'NOW YOU SEE ME: BOO' : 'BOO', '#ffffff', true); sivRing(pv, me.x, me.y, Math.min(R, 0.6), XS.alien, 0.5);
  let hyst = 0;
  for (const e of sivAlive(pv)) if (!e.dying && sivD(e, me) < R) { sivDamage(pv, e, k, false, XS.alien); if (!e.spit) e.fear = F.has('boo') ? 3 : PKV.fear; if (F.has('hysteria') && hyst < 5 && !e.spit) { hyst++; e.xs = e.xs || {}; e.xs.alien = 0.99; xsAdd(pv, e, 'alien', 0.1); } }
  if (hyst) sivTxt(pv, me.x, me.y - 0.12, 'MASS HYSTERIA', XS.alien, true);
  if (F.has('cuckoo')) { const o = fbNearest(pv, me, 0.5, null, q => !q.spit); if (o) { const x = me.x, y = me.y; me.x = o.x; me.y = o.y; o.x = x; o.y = y; fbHome(pv).x = me.x; sivTxt(pv, me.x, me.y - 0.06, 'CUCKOO', XS.alien, true); } }
}
function pkvFear(pv, e, dt) { // a Feared cell runs from you (Pass It On, Stampede)
  const F = pv.F, me = pv.me, d = sivD(e, me) || 1;
  e.x += (e.x - me.x) / d * 0.25 * dt; e.y += (e.y - me.y) / d * 0.25 * dt;
  e.x = Math.max(0.02, Math.min(1.1, e.x)); e.y = Math.max(e.r, Math.min(pv.fh - e.r, e.y));
  for (const o of sivAlive(pv)) if (o !== e && !o.dying && !o.spit && sivD(o, e) < o.r + e.r && !(o.fbT > pv.t)) {
    o.fbT = pv.t + 0.6;
    if (F.has('passon') && !(o.fear > 0) && !o.passed) { o.passed = true; o.fear = 2; sivTxt(pv, o.x, o.y - o.r - 0.03, 'PASS IT ON', XS.alien); }
    if (F.has('stampede')) { sivDamage(pv, o, 8, false, XS.alien); sivDamage(pv, e, 8, false, XS.alien); sivTxt(pv, o.x, o.y - o.r - 0.03, 'STAMPEDE', XS.alien); }
  }
}
function pkvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh, hidden = pv.hideT > 0;
  mfPatrol(pv, dt, t => 0.3 + Math.sin(t * 0.6) * 0.12, t => H * (0.5 + Math.sin(t * 0.9) * 0.3), hidden && F.has('silent') ? 4.2 : 3);
  if (hidden && F.has('silent')) xsHint(pv, 'sr', 'SILENT RUNNING +40%', XS.alien);
  if (!hidden) { pv.cdT -= dt; if (pv.cdT <= 0) { pv.cdT = pv.cdMax; pkvVanish(pv); } }
  else {
    pv.hideT -= dt;
    // While hidden: cells swarm the decoy(s); a crowd sets off Peek-a-Boom.
    for (const D of pv.decoys) {
      const arrived = sivAlive(pv).filter(e => !e.spit && sivD(e, D) < 0.06); D.n = Math.max(D.n, arrived.length);
      if (F.has('boom') && !D.boomed && arrived.length >= 3) { D.boomed = true; pkvDecoyBoom(pv, D, F.has('room') ? 'STANDING ROOM ONLY: ' + D.n : 'PEEK-A-BOOM'); }
    }
    if (F.has('sneak')) { xsHint(pv, 'sa', 'SNEAK ATTACK +30%', XS.alien); fbOther(pv, dt, (pv, e, k) => sivDamage(pv, e, k * 1.3, false, '#8a959a')); }
    if (pv.hideT <= 0) {
      for (const D of pv.decoys) { if (F.has('boom') && !D.boomed) pkvDecoyBoom(pv, D, F.has('room') ? 'STANDING ROOM ONLY: ' + D.n : 'PEEK-A-BOOM'); if (F.has('encore')) { D.t = 4; D.boomed = false; } }
      pv.decoys = F.has('encore') ? pv.decoys : [];
      pkvBoo(pv);
    }
  }
  for (const D of pv.decoys) if (!hidden) { D.t -= dt; if (D.t <= 0 && F.has('encore')) { pkvDecoyBoom(pv, D, 'ENCORE'); D.gone = true; } }
  pv.decoys = pv.decoys.filter(D => !D.gone && (hidden || D.t < 99));
  // Who the cells chase: the decoy while you are hidden (spread over the decoys), you otherwise.
  const target = e => (pv.decoys.length && (hidden || pv.decoys[0].t < 99) ? pv.decoys[(e.id9 || (e.id9 = 1 + Math.floor(Math.random() * 9))) % pv.decoys.length] : null);
  const fix = [];
  for (const e of sivAlive(pv)) { const D = target(e); if (D && !e.spit && !(e.fear > 0)) { const d = sivD(e, D) || 1; if (d > 0.04) { e.x += (D.x - e.x) / d * e.sp * 1.5 * dt; e.y += (D.y - e.y) / d * e.sp * 1.5 * dt; } fix.push([e, e.x, e.y]); } }
  // Shooters aim at where they think you are; while you hide, their shots hit their mates at the decoy.
  fbSpit(pv, dt, (pv, b) => {
    if (hidden && !b.aimed) { b.aimed = true; const D = pv.decoys[0]; if (D) { const a = Math.atan2(D.y - b.y, D.x - b.x); b.vx = Math.cos(a) * 0.3; b.vy = Math.sin(a) * 0.3; } }
    for (const e of sivAlive(pv)) if (!e.spit && b.aimed && sivD(e, b) < e.r + b.r) { sivDamage(pv, e, b.dmg, false, BLV_SPIT); sivTxt(pv, e.x, e.y - e.r - 0.03, 'FRIENDLY FIRE', BLV_SPIT); return true; }
    if (hidden && F.has('cantsee') && sivD(b, me) < 0.04) { sivTxt(pv, me.x, me.y - 0.06, 'PASSED THROUGH', XS.alien); return true; }
    return false;
  });
  sivStepFoes(pv, 0); // (no extra movement)
  for (const [e, x, y] of fix) { e.x = x; e.y = y; }
  xsStep(pv, dt);
  for (const [e, x, y] of fix) { e.x = x; e.y = y; }
}
function pkvOver(pv, g, X, Y, U, c) {
  for (const D of pv.decoys) { const x = X(D.x), y = Y(D.y), hr = U * 0.022; g.globalAlpha = 0.5; g.strokeStyle = PAL.you; g.setLineDash([3, 3]); g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, hr * 1.2, hr * 0.85, 0, 0, TAU); g.stroke(); g.setLineDash([]); if (D.rattle) { g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); } }
  g.globalAlpha = 1;
}
function pkvMe(pv, g, hx, hy, hr, U) { // hidden: a faint outline; the cooldown under you
  if (pv.hideT > 0) { g.fillStyle = '#05070a'; g.globalAlpha = 0.75; g.beginPath(); g.arc(hx, hy, hr * 2.2, 0, TAU); g.fill(); g.globalAlpha = 1; g.strokeStyle = PAL.you + '66'; g.lineWidth = 1; g.beginPath(); g.ellipse(hx, hy, hr * 1.2, hr * 0.85, 0, 0, TAU); g.stroke(); }
  else { g.strokeStyle = XS.alien; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, hr * 1.9, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - pv.cdT / pv.cdMax)); g.stroke(); }
}
PV_OWN[PKV.id] = { init: pkvInit, step: pkvStep, draw: sivDraw, flags: PKV_FLAG, wave: pkvWave, under: (pv, g, X, Y, U) => fbDrawSpit(pv, g, X, Y, U), over: pkvOver, cell: xsCellHook, me: pkvMe, fearMove: pkvFear };

// ================================================================ Eggs
const EGV = { id: 's_toothfairy', cd: 1.1, mag: 3, reload: 2, dmg: 34, max: 3, life: 6, lure: 0.39 };
const EGV_FLAG = { A: 'nest', B: 'eggon', C: 'chickens', 'Nest Egg': 'nest', 'Bigger Basket': 'basket', 'Triple Yolk': 'triple', 'Surprise Inside': 'hunt',
  'Egg On': 'eggon', 'Egg Trail': 'trail', 'Golden Opportunity': 'golden', Broody: 'broody', "Don't Count Your Chickens": 'chickens', 'Warm Glow': 'warm',
  'Time Bomb': 'bomb', 'Egg on Your Face': 'face', 'Golden Goose': 'goose', Clutch: 'clutch', 'Possession Fee': 'fee' };
function egvInit(pv) {
  const F = xsInit(pv, { range: 0.7, mag: EGV.mag, reload: EGV.reload, rate: EGV.cd / (F0(pv, 'chickens') ? 0.6 : 1), eggs: [], taken: [], laid: 0 });
  pv.maxE = F.has('clutch') ? 12 : F.has('basket') ? 6 : EGV.max; pv.life = F.has('clutch') ? 8 : F.has('warm') ? 9 : EGV.life;
  pv.me.x = 0.25; if (F.has('trail')) pv.patrol = true;
}
function egvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 7; i++) sivFoe(pv, 0.55 + R() * 0.4, H * (0.12 + R() * 0.76), { hp: F.has('chickens') ? 110 : 70, sp: 0.03 });
  if (F.has('broody')) sivFoe(pv, 0.85, H * 0.3, { r: 0.045, hp: 200, sp: 0.01, elite: true });
  if (F.has('eggon') || F.has('face')) alShooters(pv, 1, H);
}
function egvLay(pv, x, y, o) { if (pv.eggs.length >= pv.maxE) return null; const E = Object.assign({ x, y, t: pv.life, age: 0, by: null }, o); pv.eggs.push(E); return E; }
function egvFire(pv) {
  const F = pv.F, me = pv.me; pv.laid++;
  if (F.has('broody') && pv.laid % 3 === 0) { const el = sivAlive(pv).find(e => e.elite); if (el) { sivTxt(pv, me.x, me.y - 0.07, 'BROODY', XS.alien); egvSmite(pv, el, EGV.dmg); return true; } }
  const n = F.has('clutch') ? 2 : 1;
  for (let i = 0; i < n; i++) {
    let x, y;
    if (F.has('clutch')) { const a = Math.random() * TAU; x = me.x + Math.cos(a) * 0.15; y = me.y + Math.sin(a) * 0.12; }
    else if (F.has('trail')) { x = me.x - Math.cos(me.a) * 0.34; y = me.y - Math.sin(me.a) * 0.34; }
    else if (F.has('chickens')) { x = me.x + 0.06; y = Math.random() < 0.5 ? 0.06 : pv.fh - 0.06; } // (out of the way, so they wait and charge)
    else { const t = fbCluster(pv, me, 0.6, 0.15); if (!t) return false; x = t.x - 0.08; y = t.y; }
    const golden = F.has('golden') && !pv.eggs.some(E => E.golden);
    const E = egvLay(pv, Math.max(0.03, Math.min(0.97, x)), Math.max(0.03, Math.min(pv.fh - 0.03, y)), { golden });
    if (E && golden) sivTxt(pv, E.x, E.y - 0.05, 'GOLDEN OPPORTUNITY', '#ffd23f', true);
    if (E && F.has('hunt')) { E.burrow = 0.8; sivTxt(pv, E.x, E.y - 0.04, 'EASTER EGG HUNT', XS.alien); }
  }
  return true;
}
function egvSmite(pv, e, k, E) {
  const F = pv.F, at = { x: e.x, y: e.y };
  k *= (F.has('nest') ? 0.75 : 1) * (F.has('eggon') ? 0.8 : 1);
  if (E && F.has('chickens')) k *= 1 + Math.min(1.5, E.age * 0.25);
  if (F.has('fee') && !e.boss) { e.xs = e.xs || {}; e.xs.alien = 0.99; xsAdd(pv, e, 'alien', 0.1); sivTxt(pv, e.x, e.y - e.r - 0.08, 'POSSESSION FEE', XS.alien); }
  sivRing(pv, e.x, e.y, e.r * 2.5, XS.alien, 0.35); sivTxt(pv, e.x, e.y - e.r - 0.05, 'SMITE', XS.alien, true);
  sivDamage(pv, e, k, false, XS.alien);
  const splash = F.has('goose') ? 0.27 : E && F.has('warm') && E.age >= 6 ? 0.17 : 0;
  if (splash) { sivRing(pv, at.x, at.y, splash, XS.alien, 0.4); sivTxt(pv, at.x, at.y - 0.08, F.has('goose') ? 'GOLDEN GOOSE' : 'WARM GLOW', '#ffd23f'); for (const o of sivAlive(pv)) if (o !== e && sivD(o, at) < splash) sivDamage(pv, o, F.has('goose') ? k : k * 0.5, false, XS.alien); }
  if (F.has('nest')) { if (egvLay(pv, at.x + 0.03, at.y + 0.02)) sivTxt(pv, at.x, at.y + 0.05, 'NEST EGG', XS.alien); }
}
function egvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.patrol) mfPatrol(pv, dt, t => 0.4 + Math.sin(t * 0.7) * 0.25, t => H * (0.5 + Math.sin(t * 1.2) * 0.3)); else fbMe(pv, dt);
  blvGun(pv, dt, egvFire);
  const fix = [], claimed = new Set();
  for (const E of pv.eggs) {
    E.t -= dt; E.age += dt;
    if (E.burrow > 0) { E.burrow -= dt; if (E.burrow <= 0) { const o = fbNearest(pv, E, 1, null, q => !q.spit); if (o) { E.x = o.x; E.y = o.y; } } continue; }
    if (E.t <= 0) { if (F.has('bomb') && E.age >= 6) { sivRing(pv, E.x, E.y, 0.27, XS.alien, 0.5); sivTxt(pv, E.x, E.y - 0.06, 'TIME BOMB', XS.alien, true); for (const o of sivAlive(pv)) if (sivD(o, E) < 0.27) sivDamage(pv, o, EGV.dmg, false, XS.alien); } E.gone = true; continue; }
    // the greedy come for it (Egg On: from twice as far; Golden: everything for 2 s)
    const lure = E.golden && E.age < 2 ? 2 : EGV.lure * (F.has('eggon') ? 2 : 1) * (F.has('warm') ? (E.age >= 6 ? 1.5 : 0.2) : F.has('chickens') ? 0.5 : 1);
    const list = E.golden && E.age < 2 ? sivAlive(pv).filter(q => !q.dying && !q.boss) : [fbNearest(pv, E, lure, null, q => !claimed.has(q) && (!q.spit || F.has('eggon')))].filter(Boolean);
    for (const e of list) {
      claimed.add(e); const d = sivD(e, E) || 1;
      e.x += (E.x - e.x) / d * Math.min(d, 0.12 * dt); e.y += (E.y - e.y) / d * Math.min(d, 0.12 * dt); fix.push([e, e.x, e.y]);
      if (e.spit && F.has('eggon')) { e.spitT = Math.max(e.spitT || 0, 0.3); xsHint(pv, 'eo', 'EGG ON: TOO BUSY TO SHOOT', XS.alien); }
      if (d < e.r + 0.012 && !E.gone) { E.gone = true; pv.taken.push({ t: pv.t, e }); egvSmite(pv, e, EGV.dmg, E); break; }
    }
  }
  pv.eggs = pv.eggs.filter(E => !E.gone);
  // Triple Yolk: three taken inside a second smite all three takers and everything between them.
  pv.taken = pv.taken.filter(T => pv.t - T.t < 1);
  if (F.has('triple') && pv.taken.length >= 3) { const L = pv.taken.splice(0, 3).map(T => T.e); sivTxt(pv, L[0].x, L[0].y - 0.08, 'TRIPLE YOLK', '#ffd23f', true); for (const e of sivAlive(pv)) if (L.includes(e) || xsInTri(e, L[0], L[1], L[2])) sivDamage(pv, e, EGV.dmg, false, XS.alien); }
  // Egg on Your Face: whatever hurts you gets an egg dropped at its feet.
  fbSpit(pv, dt, null, (pv, b) => { sivTxt(pv, me.x, me.y - 0.06, 'OW', BLV_SPIT, true); if (F.has('face') && b.from && b.from.hp > 0) { const E = egvLay(pv, b.from.x - 0.03, b.from.y); if (E) sivTxt(pv, E.x, E.y - 0.05, 'EGG ON YOUR FACE', XS.alien); } });
  if (F.has('chickens') && pv.eggs.length) xsHint(pv, 'ch', 'CHARGING +' + Math.round(Math.min(1.5, Math.max(...pv.eggs.map(E => E.age)) * 0.25) * 100) + '%', XS.alien);
  if (F.has('clutch')) xsHint(pv, 'cl', 'CLUTCH: ' + pv.eggs.length + '/12', XS.alien);
  if (F.has('basket') && pv.eggs.length > 3) xsHint(pv, 'bb', 'BIGGER BASKET: ' + pv.eggs.length + '/6', XS.alien);
  if (F.has('trail')) xsHint(pv, 'et', 'EGG TRAIL: BEHIND YOU', XS.alien);
  sivStepFoes(pv, 0);
  for (const [e, x, y] of fix) { e.x = x; e.y = y; }
  xsStep(pv, dt);
  for (const [e, x, y] of fix) { e.x = x; e.y = y; }
}
function egvUnder(pv, g, X, Y, U) {
  for (const E of pv.eggs) {
    const x = X(E.x), y = Y(E.y), s = U * 0.014, glow = pv.F.has('chickens') ? Math.min(1, E.age / 6) : 0.3;
    if (E.burrow > 0) { g.fillStyle = '#ffffff33'; g.beginPath(); g.ellipse(x, y, s, s * 0.4, 0, 0, TAU); g.fill(); continue; }
    pvGlow(g, x, y, s * (3 + glow * 3), E.golden ? '#ffd23f' : XS.alien, 0.3 + glow * 0.5);
    g.fillStyle = E.golden ? '#ffd23f' : '#f1ecff'; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(x, y, s * 0.8, s, 0, 0, TAU); g.fill(); g.globalAlpha = 1;
  }
  fbDrawSpit(pv, g, X, Y, U);
}
PV_OWN[EGV.id] = { init: egvInit, step: egvStep, draw: sivDraw, flags: EGV_FLAG, wave: egvWave, under: egvUnder, cell: xsCellHook };

// ================================================================ Chest Burster (infect, raise undead)
const CBV = { id: 's_parasite', range: 0.73, cd: 0.4, mag: 8, reload: 1.6, dmg: 12, inf: 8, life: 6, cap: 4, bite: 8 };
const CBV_FLAG = { A: 'family', B: 'contag', C: 'useful', 'The Family Business': 'family', 'The Staff': 'staff', 'Foster Care': 'adopt', 'Doggy Bag': 'bag',
  'Contagious Personality': 'contag', 'Chronic Condition': 'chronic', 'Open Casket': 'casket', Hookworm: 'hook', 'Dead Useful': 'useful', 'Soul Searching': 'soul',
  'Remote Detonation': 'remote', 'Gut Feeling': 'gut', 'Zombie Apocalypse': 'zombie', Adopted: 'adopted', 'Mother of Worms': 'mother' };
function cbvInit(pv) {
  const F = xsInit(pv, { range: CBV.range, mag: CBV.mag, reload: CBV.reload, rate: CBV.cd, undead: [], gems: [], remT: 8, adoptedN: 0, motherK: 1, worms: F0(pv, 'mother') ? [0, 1, 2] : [] });
  pv.cap = F.has('zombie') ? 12 : F.has('family') ? 3 : CBV.cap;
  pv.ulife = F.has('family') ? 12 : F.has('contag') ? 4 : CBV.life;
  pv.udmg = CBV.bite * (F.has('family') ? 1.5 : 1) * (F.has('contag') ? 0.7 : 1) * (F.has('useful') ? 0.5 : 1);
  pv.me.x = 0.18;
}
function cbvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 8; i++) sivFoe(pv, 0.5 + R() * 0.45, H * (0.12 + R() * 0.76), { hp: F.has('adopt') || F.has('adopted') ? 20 : 45, sp: 0.03 });
  if (F.has('adopt') || F.has('adopted')) sivFoe(pv, 0.7, H * 0.5, { r: 0.045, hp: 120, sp: 0.015, elite: true });
  if (F.has('gut')) sivFoe(pv, 0.75, H * 0.2, { hp: 90, sp: 0.01, spit: true, spitCd: 1.6 });
  if (F.has('bag')) for (let i = 0; i < 4; i++) pv.gems.push({ x: 0.4 + R() * 0.5, y: H * (0.15 + R() * 0.7) });
}
function cbvInfect(pv, e, t) { if (!e || e.hp <= 0 || e.dying) return; e.inf = pv.F.has('chronic') ? 1e9 : Math.max(e.inf || 0, t || CBV.inf); }
function cbvFire(pv) {
  const me = pv.me; let t = null;
  for (const e of sivAlive(pv)) if (!e.dying && sivD(e, me) < pv.range && (!t || e.hp > t.hp)) t = e; // (the strongest)
  if (!t) return false;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.004;
  fbShot(pv, me.x, me.y, me.a + (Math.random() - 0.5) * 0.16, { dmg: CBV.dmg, r: 0.005, col: AL_WORM, v: 0.95, range: pv.range });
  return true;
}
function cbvRise(pv, e) {
  const F = pv.F, perm = (F.has('adopted') && e.elite && pv.adoptedN < 3) || (F.has('adopt') && e.elite && !pv.adoptWave);
  if (pv.undead.length >= pv.cap && !perm) { if (F.has('useful')) { const u = pv.undead.shift(); cbvBurst(pv, u, 'CULLED'); } else return; }
  const u = { x: e.x, y: e.y, t: perm ? 99 : pv.ulife, biteT: 0, big: !!e.elite, host: null };
  if (perm) { if (F.has('adopted')) pv.adoptedN++; else pv.adoptWave = true; sivTxt(pv, e.x, e.y - e.r - 0.05, F.has('adopted') ? 'ADOPTED' : 'ADOPTION PAPERS', AL_WORM, true); }
  else sivTxt(pv, e.x, e.y - e.r - 0.04, 'RISES', AL_WORM);
  pv.undead.push(u);
}
function cbvBurst(pv, u, why) {
  const F = pv.F; u.t = 0;
  sivRing(pv, u.x, u.y, 0.12, XS.alien, 0.4); sivTxt(pv, u.x, u.y - 0.05, why || 'DEAD USEFUL', XS.alien, true);
  for (const o of sivAlive(pv)) if (sivD(o, u) < 0.12) { sivDamage(pv, o, 20, false, XS.alien); if (F.has('soul')) xsAdd(pv, o, 'alien', 0.4); }
}
function cbvKill(pv, e) {
  const F = pv.F;
  if (!(e.inf > 0)) return;
  if (F.has('mother')) { pv.motherK = Math.min(3, pv.motherK + 0.1); xsHint(pv, 'mw', 'MOTHER OF WORMS +' + Math.round((pv.motherK - 1) * 100) + '%', AL_WORM); }
  if (e.killedBy === 'cb' || F.has('casket')) {
    cbvRise(pv, e);
    if (F.has('casket') && e.killedBy !== 'cb') { sivTxt(pv, e.x, e.y - e.r - 0.07, 'OPEN CASKET', AL_WORM); }
    if (F.has('casket')) for (const o of sivAlive(pv).filter(o => o !== e && !o.dying).sort((a, b) => sivD(a, e) - sivD(b, e)).slice(0, 2)) cbvInfect(pv, o);
  }
}
function cbvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me;
  fbMe(pv, dt);
  blvGun(pv, dt, cbvFire);
  fbStepShots(pv, dt, (pv, s, e) => { e.killedBy = 'cb'; cbvInfect(pv, e); sivDamage(pv, e, s.dmg, false, AL_WORM); e.killedBy = null; });
  for (const e of sivAlive(pv)) {
    if (e.inf > 0) { e.inf -= dt; if (Math.random() < dt * 2) pv.parts.push({ x: e.x + (Math.random() - 0.5) * e.r, y: e.y, vx: 0, vy: 0.03, life: 0.4, color: AL_WORM }); }
    if (F.has('gut') && e.spit && e.inf > 0 && e.spitT < 0.4 && !(e.gutT > pv.t)) { e.gutT = pv.t + 1; e.flash = 0.3; sivTxt(pv, e.x, e.y - e.r - 0.04, 'GUT FEELING', '#ff3b3b'); }
  }
  // Remote Detonation: every 8 s the undead rush the crowd and burst.
  if (F.has('remote')) { pv.remT -= dt; if (pv.remT <= 0 && pv.undead.length) { pv.remT = 8; const t = fbCluster(pv, me, 1, 0.15); if (t) for (const u of pv.undead) u.rush = { x: t.x, y: t.y }; sivTxt(pv, me.x, me.y - 0.08, 'REMOTE DETONATION', XS.alien, true); } }
  // The undead: swim to a cell and bite (The Staff: stay near you; Hookworm: ride it; Contagious: infect; Dead Useful: burst at the end).
  for (const u of pv.undead) {
    u.t -= dt;
    if (u.t <= 0) { if (F.has('useful')) cbvBurst(pv, u); continue; }
    if (u.rush) { const d = sivD(u, u.rush) || 1; u.x += (u.rush.x - u.x) / d * Math.min(d, 0.5 * dt); u.y += (u.rush.y - u.y) / d * Math.min(d, 0.5 * dt); if (d < 0.02) { cbvBurst(pv, u, 'REMOTE DETONATION'); u.t = 0; } continue; }
    if (u.host) { if (u.host.hp <= 0) u.host = null; else { u.x = u.host.x + 0.01; u.y = u.host.y - u.host.r; u.biteT -= dt; if (u.biteT <= 0) { u.biteT = 0.5; sivDamage(pv, u.host, pv.udmg, false, AL_WORM); } continue; } }
    const home = F.has('staff') ? me : u, o = fbNearest(pv, home, F.has('staff') ? 0.2 : F.has('bag') && pv.gems.length ? 0.15 : 1, null, q => !q.spit || F.has('gut'));
    if (F.has('bag') && (!o || u === pv.undead[0]) && pv.gems.some(gm => !gm.carried)) { const gm = pv.gems.find(q => !q.carried), d = sivD(gm, u) || 1; u.x += (gm.x - u.x) / d * 0.15 * dt; u.y += (gm.y - u.y) / d * 0.15 * dt; if (d < 0.02) { gm.carried = u; } continue; }
    const goal = o || (F.has('staff') ? { x: me.x + 0.06, y: me.y } : null);
    if (goal) { const d = sivD(goal, u) || 1; u.x += (goal.x - u.x) / d * Math.min(d, 0.12 * dt); u.y += (goal.y - u.y) / d * Math.min(d, 0.12 * dt); if (F.has('staff')) xsHint(pv, 'st', 'THE STAFF: AT YOUR SIDE', AL_WORM); }
    u.biteT -= dt;
    if (o && sivD(o, u) < o.r + 0.02 && u.biteT <= 0) {
      u.biteT = 0.6; o.killedBy = 'cb'; sivDamage(pv, o, pv.udmg, false, AL_WORM); o.killedBy = null;
      if (F.has('contag') && !(o.inf > 0)) { cbvInfect(pv, o); sivTxt(pv, o.x, o.y - o.r - 0.03, 'INFECTED', AL_WORM); }
      if (F.has('hook') && !u.host) { u.host = o; sivTxt(pv, o.x, o.y - o.r - 0.04, 'HOOKWORM', AL_WORM); }
    }
  }
  pv.undead = pv.undead.filter(u => u.t > 0);
  // Doggy Bag: undead fetch gems back to you.
  for (const gm of pv.gems) if (gm.carried) { const u = gm.carried; gm.x = u.x; gm.y = u.y; const d = sivD(u, me) || 1; u.x += (me.x - u.x) / d * 0.2 * dt; u.y += (me.y - u.y) / d * 0.2 * dt; if (d < 0.04) { gm.got = true; sivTxt(pv, me.x, me.y - 0.07, 'DOGGY BAG', FB_GEM); } }
  pv.gems = pv.gems.filter(gm => !gm.got);
  // Mother of Worms: three worms coil round you and bite what comes close.
  if (pv.worms.length) { pv.wT = (pv.wT || 0) - dt; if (pv.wT <= 0) { pv.wT = 0.4; for (const e of sivAlive(pv)) if (sivD(e, me) < 0.12) { sivDamage(pv, e, 6 * pv.motherK, false, AL_WORM); } } }
  if (F.has('zombie') && pv.undead.length) xsHint(pv, 'za', 'ZOMBIE APOCALYPSE: ' + pv.undead.length + '/12', AL_WORM);
  if (F.has('family') && pv.undead.length) xsHint(pv, 'fb', 'THE FAMILY BUSINESS: 12 s, +50%', AL_WORM);
  if (F.has('chronic')) xsHint(pv, 'cc', 'CHRONIC: NEVER WEARS OFF', AL_WORM);
  fbSpit(pv, dt);
  xsStep(pv, dt);
}
function cbvOver(pv, g, X, Y, U) {
  fbDrawShots(pv, g, X, Y, U);
  g.globalCompositeOperation = 'source-over';
  for (const u of pv.undead) { const x = X(u.x), y = Y(u.y), r = U * (u.big ? 0.035 : 0.022); g.fillStyle = '#3d5a3a'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = AL_WORM; g.lineWidth = 1.5; g.stroke(); g.beginPath(); g.moveTo(x - r * 0.5, y); g.quadraticCurveTo(x, y - r * 0.6, x + r * 0.5, y); g.stroke(); }
  for (const gm of pv.gems) { g.fillStyle = FB_GEM; g.save(); g.translate(X(gm.x), Y(gm.y)); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore(); }
  const me = pv.me; for (const i of pv.worms) { const a = pv.t * 2 + i / 3 * TAU, x = X(me.x) + Math.cos(a) * U * 0.07, y = Y(me.y) + Math.sin(a) * U * 0.07; g.strokeStyle = AL_WORM; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 5, a, a + 2.5); g.stroke(); }
  g.globalCompositeOperation = 'lighter';
}
function cbvCell2(pv, g, e, x, y, r) { if (e.inf > 0) { g.strokeStyle = AL_WORM; g.lineWidth = 1.2; for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(x - r * 0.3 + i * r * 0.6, y, r * 0.3, 0, Math.PI); g.stroke(); } } }
function cbvMe(pv, g, hx, hy, hr, U) { g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = AL_WORM; g.fillText(pv.undead.length + '/' + pv.cap, hx, hy + hr * 3.6); }
PV_OWN[CBV.id] = { init: cbvInit, step: cbvStep, draw: sivDraw, flags: CBV_FLAG, wave: cbvWave, under: (pv, g, X, Y, U) => fbDrawSpit(pv, g, X, Y, U), over: cbvOver, cell: xsCellHook, cell2: cbvCell2, me: cbvMe, kill: cbvKill };
