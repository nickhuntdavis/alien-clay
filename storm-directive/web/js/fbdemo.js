'use strict';
// Spawn Prawn - previews and branch scenes for the rest of the Force and Blood weapons (Baseline's two damage types), on
// the sidemo.js engine with bldemo.js helpers:
//  - Maximum Gains (v_phys_spread): a 7-pellet fan (6 each, 0.7 wide), 4 volleys 0.8 s apart, 1.5 s reload, reach 260.
//  - Nervous Wreck (v_phys_contact): jaws that clamp the nearest cell within 110 for 30 and knock it back, 4 clamps 0.6 s
//    apart, 1 s reload.
//  - Family Ties (s_void): a slow vortex (115) that drags cells in and nibbles them; two that touch merge; five merged go
//    supernova. Two orbs a magazine, 1.8 s apart, 2.5 s reload.
//  - Skill Issue (s_lard): a lobbed dollop (0.6 s flight) that blasts a cluster for 14 and sends cells flying; a flying
//    cell bowls into its mates once. 3 a magazine, 1.2 s apart, 1.8 s reload.
//  - There Is No Spoon (s_siphon): eats enemy shots within 90, stores up to 10 and fires them back fast, as hard as they
//    hit; with nothing stored it only dribbles.
//  - One of These Days (s_duedate): a red shot (20) that circles the strongest cell with a 4 s countdown; when it ends,
//    40% of everything the cell took while marked lands again; if it dies first, that bursts onto its neighbours.
// Hooks: none (PV_OWN entries).

const FB_LARD = '#e9d8a6', FB_GEM = '#7fd0ff';
// ---------------------------------------------------------------- shared helpers
function fbBase(pv, o) {
  sivInit(pv);
  Object.assign(pv, { pel: [], ebul: [], cd: 0.4, flyN: 0 }, o);
  pv.ammo = pv.mag;
  return pv.F;
}
const fbHome = pv => pv.home || (pv.home = { x: pv.me.x, y: pv.fh * 0.56 });
// Spermy drifts back home after a kick (and bobs).
function fbMe(pv, dt) {
  const me = pv.me, H = fbHome(pv);
  me.x += (me.kx || 0) * dt; me.kx = (me.kx || 0) * Math.exp(-dt * 4);
  me.x += (H.x - me.x) * Math.min(1, dt * 1.5);
  me.y = H.y + Math.sin(pv.t * 0.9) * 0.02;
  me.kick = Math.max(0, (me.kick || 0) - dt * 0.1);
}
function fbShot(pv, x, y, a, o) {
  const s = Object.assign({ x, y, a, v: 0.9, dist: 0, range: 0.8, dmg: 10, r: 0.006, col: pv.col, pierce: 1, hits: 0, hit: new Set(), trail: [] }, o);
  pv.pel.push(s); return s;
}
function fbStepShots(pv, dt, onHit, onEnd) {
  const H = pv.fh;
  for (const s of pv.pel) {
    if (s.dead) continue;
    if (s.home && s.home.hp > 0) { const a = Math.atan2(s.home.y - s.y, s.home.x - s.x), d = Math.atan2(Math.sin(a - s.a), Math.cos(a - s.a)); s.a += Math.max(-7 * dt, Math.min(7 * dt, d)); }
    const st = s.v * dt; s.x += Math.cos(s.a) * st; s.y += Math.sin(s.a) * st; s.dist += st;
    s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 5) s.trail.shift();
    if (s.dist > s.range || s.x < -0.05 || s.x > 1.05 || s.y < -0.05 || s.y > H + 0.05) { s.dead = true; if (onEnd) onEnd(pv, s); continue; }
    for (const e of sivAlive(pv)) {
      if (s.hit.has(e) || e.dying || (s.only && e !== s.only)) continue;
      if (sivD(e, s) < e.r + s.r) { s.hit.add(e); s.hits++; onHit(pv, s, e); if (s.hits >= s.pierce) { s.dead = true; break; } }
    }
  }
  pv.pel = pv.pel.filter(s => !s.dead);
}
function fbDrawShots(pv, g, X, Y, U) {
  for (const s of pv.pel) {
    const x = X(s.x), y = Y(s.y), r = U * s.r;
    if (s.trail.length > 1) { g.strokeStyle = s.col; g.globalAlpha = 0.4; g.lineWidth = Math.max(1, r); g.beginPath(); g.moveTo(X(s.trail[0].x), Y(s.trail[0].y)); for (const q of s.trail) g.lineTo(X(q.x), Y(q.y)); g.stroke(); g.globalAlpha = 1; }
    pvGlow(g, x, y, r * 3, s.col, s.heavy ? 0.9 : 0.6); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, Math.max(1.2, r * 0.8), 0, TAU); g.fill();
  }
}
// Spitters (purple rim) lob blobs at Spermy. eat(pv, b) runs first each frame for each blob (true: it is gone); hit(pv, b) when one lands.
function fbSpit(pv, dt, eat, hit) {
  const me = pv.me;
  for (const e of sivAlive(pv)) if (e.spit && !e.dying) {
    e.spitT = (e.spitT == null ? Math.random() * 1.5 : e.spitT) - dt;
    if (e.spitT <= 0) { e.spitT = e.spitCd || 2.2; const a = Math.atan2(me.y - e.y, me.x - e.x) + (Math.random() - 0.5) * 0.2, big = !!e.bigShot, v = big ? 0.22 : 0.3;
      pv.ebul.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, from: e, big, boss: !!e.boss, r: big ? 0.016 : 0.009, dmg: big ? 24 : 8 }); }
  }
  for (const b of pv.ebul) {
    if (b.dead) continue;
    if (eat && eat(pv, b)) { b.dead = true; continue; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (sivD(b, me) < 0.03) { b.dead = true; if (hit) hit(pv, b); else sivTxt(pv, me.x, me.y - 0.06, 'OW', BLV_SPIT, true); }
  }
  pv.ebul = pv.ebul.filter(b => !b.dead && b.x > -0.05 && b.x < 1.05 && b.y > -0.05 && b.y < pv.fh + 0.05);
}
function fbDrawSpit(pv, g, X, Y, U) {
  for (const b of pv.ebul) { g.fillStyle = '#000'; g.strokeStyle = b.boss ? '#ff3df2' : BLV_SPIT; g.lineWidth = b.big ? 2.5 : 1.5; g.beginPath(); g.arc(X(b.x), Y(b.y), U * b.r, 0, TAU); g.fill(); g.stroke(); }
}
// Flying cells: a launched cell bowls into the others it meets (onBump), and may meet a wall (onWall).
function fbLaunch(pv, e, vx, vy, o) {
  if (!e || e.boss || e.dying || e.hp <= 0) return;
  e.kx += vx; e.ky += vy; e.fly = 0.7; e.flyO = o || {}; e.bowled = new Set(); e.walled = false;
}
function fbStepFly(pv, dt, onBump, onWall) {
  const H = pv.fh;
  for (const e of sivAlive(pv)) {
    if (!(e.fly > 0) || e.dying) continue;
    e.fly -= dt;
    if (Math.hypot(e.kx, e.ky) < 0.12) { e.fly = 0; continue; }
    for (const o of sivAlive(pv)) if (o !== e && !o.dying && !e.bowled.has(o) && sivD(e, o) < e.r + o.r) { e.bowled.add(o); onBump(pv, e, o); if (e.hp <= 0) break; }
    if (onWall && !e.walled && (e.y < e.r + 0.004 || e.y > H - e.r - 0.004 || e.x > 0.995 || e.x < 0.005)) { e.walled = true; onWall(pv, e); }
  }
}
const fbAway = (e, from, v) => { const d = sivD(e, from) || 1; return [(e.x - from.x) / d * v, (e.y - from.y) / d * v]; };
function fbCluster(pv, from, range, R, skip) {
  const live = sivAlive(pv).filter(e => !e.dying && !e.spit && sivD(e, from) < range && e !== skip);
  let best = null, bn = -1;
  for (const e of live) { const n = live.filter(o => sivD(o, e) < R).length - sivD(e, from) * 0.3; if (n > bn) { bn = n; best = e; } }
  return best;
}
function fbNearest(pv, from, range, skip, test) {
  let best = null, bd = 1e9;
  for (const e of sivAlive(pv)) { if (e.dying || e === skip || (test && !test(e))) continue; const d = sivD(e, from); if (d < range && d < bd) { bd = d; best = e; } }
  return best;
}
// Grey pips: "your other weapon" (scenes where damage from everything matters).
function fbOther(pv, dt, dmgFn) {
  pv.otherCd = (pv.otherCd == null ? 0.3 : pv.otherCd) - dt; pv.pips = pv.pips || [];
  const me = pv.me, t = fbNearest(pv, me, 0.8, null, e => !e.spit);
  if (pv.otherCd <= 0 && t) { pv.otherCd = 0.45; pv.pips.push({ x: me.x, y: me.y, t, a: Math.atan2(t.y - me.y, t.x - me.x) + 0.4, life: 1.6 }); }
  for (const p of pv.pips) {
    if (p.t.hp <= 0) { p.life = 0; continue; }
    const a = Math.atan2(p.t.y - p.y, p.t.x - p.x); p.a += Math.atan2(Math.sin(a - p.a), Math.cos(a - p.a)) * Math.min(1, dt * 6);
    p.x += Math.cos(p.a) * 0.7 * dt; p.y += Math.sin(p.a) * 0.7 * dt; p.life -= dt;
    if (sivD(p, p.t) < p.t.r) { p.life = 0; dmgFn(pv, p.t, 6); }
  }
  pv.pips = pv.pips.filter(p => p.life > 0);
}
function fbStd(pv, dt) { // the end of every step: cells, particles, effects, the next group
  sivStepFoes(pv, dt);
  blvTail(pv, dt, pv.own.wave);
}

// ================================================================ Maximum Gains
const MGV = { id: 'v_phys_spread', range: 0.44, cd: 0.8, mag: 4, reload: 1.5, dmg: 6, n: 7, fan: 0.7, v: 0.89, close: 0.2 };
const MGV_FLAG = { A: 'wed', B: 'more', C: 'off', 'Shotgun Wedding': 'wed', Kickback: 'kick', 'Slug It Out': 'slug', Confetti: 'conf',
  'More Is More': 'more', Overspill: 'over', Roundabout: 'round', 'Wedding Rice': 'rice', 'Get Off Me!': 'off', 'Pile-Up': 'pile', Skittles: 'skit',
  Hiccups: 'hic', 'Baby Boom': 'baby', 'Riot Control': 'riot', 'Full Auto': 'auto' };
function mgvInit(pv) {
  const F = fbBase(pv, { range: MGV.range * (F0(pv, 'wed') ? 0.77 : 1), mag: MGV.mag, reload: MGV.reload, rate: MGV.cd * (F0(pv, 'hic') ? 0.8 : 1), conf: [], vn: 0 });
  if (F.has('auto')) { pv.rate = MGV.cd / 4; pv.mag = pv.ammo = 99; }
  pv.me.x = F.has('rice') ? 0.5 : 0.2;
}
function F0(pv, k) { const p = pv.opts.perk || ''; return p.startsWith('siv|') && p.slice(4).split(',').includes(k); }
function mgvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  if (F.has('rice')) { for (let i = 0; i < 6; i++) sivFoe(pv, i % 2 ? 0.95 : 0.05, H * (0.2 + R() * 0.6), { hp: 40, sp: 0.06 }); return; }
  const tight = F.has('off') || F.has('pile') || F.has('skit') || F.has('riot');
  const x = 0.7 + R() * 0.1, y = H * (0.35 + R() * 0.3);
  for (let i = 0; i < 6; i++) sivFoe(pv, tight ? x + (i % 3) * 0.05 : 0.65 + R() * 0.35, tight ? y + (Math.floor(i / 3) - 0.5) * 0.06 : H * (0.15 + R() * 0.7), { hp: F.has('kick') ? 70 : 45, sp: F.has('kick') ? 0.09 : 0.06 });
}
function mgvFire(pv) {
  const F = pv.F, me = pv.me; pv.vn++;
  if (F.has('hic')) { pv.cd = pv.rate * (0.3 + Math.random() * 1.4); if (Math.random() < 0.25) { pv.cd = 0.08; sivTxt(pv, me.x, me.y - 0.07, 'HIC', SIV_PALE); } }
  let t = fbNearest(pv, me, pv.range);
  const back = F.has('rice') && pv.vn % 2 === 0;
  if (back) { t = fbNearest(pv, me, pv.range, null, e => e.x < me.x); if (!t) return false; sivTxt(pv, me.x, me.y - 0.07, 'REAR VOLLEY', SIV_PALE); }
  else if (F.has('rice')) t = fbNearest(pv, me, pv.range, null, e => e.x >= me.x) || t;
  if (!t) return false;
  const a0 = Math.atan2(t.y - me.y, t.x - me.x); me.a = a0; me.kick = 0.012;
  const vol = { n: 0, hits: new Map(), id: pv.vn };
  if (F.has('slug') && pv.vn % 3 === 0) { fbShot(pv, me.x, me.y, a0, { dmg: MGV.dmg * MGV.n * 0.8, r: 0.014, pierce: 3, heavy: true, range: pv.range, vol, slug: true }); sivTxt(pv, me.x, me.y - 0.07, 'SLUG', SIV_PALE, true); return true; }
  if (F.has('round') && pv.vn % 4 === 0) { for (let i = 0; i < 20; i++) fbShot(pv, me.x, me.y, i / 20 * TAU, { dmg: MGV.dmg, v: MGV.v, range: pv.range, vol }); vol.n = 20; sivTxt(pv, me.x, me.y - 0.07, 'ROUNDABOUT', SIV_PALE, true); return true; }
  let n = MGV.n * (F.has('baby') ? 3 : 1), fan = MGV.fan / (F.has('wed') ? 3 : 1) * (F.has('more') ? 1.5 : 1);
  const extra = F.has('more') && !F.has('baby') ? 5 : 0;
  for (let i = 0; i < n + extra; i++) {
    const small = i >= n, a = a0 + (Math.random() - 0.5) * fan;
    fbShot(pv, me.x, me.y, a, { dmg: MGV.dmg * (small ? 0.6 : 1) * (F.has('auto') ? 0.6 : 1) * (F.has('off') ? 0.85 : 1), r: small ? 0.004 : 0.0055, v: MGV.v * (0.9 + Math.random() * 0.2), range: pv.range, vol });
  }
  vol.n = n + extra;
  if (F.has('baby')) { me.kx = -0.6; sivTxt(pv, me.x, me.y - 0.08, 'BABY BOOM', SIV_PALE); }
  return true;
}
function mgvHit(pv, s, e) {
  const F = pv.F, me = pv.me;
  let k = s.dmg;
  if (F.has('wed') && sivD(s, me) < MGV.close) k *= 1.6;
  sivDamage(pv, e, k, !!s.heavy);
  const V = s.vol, c = (V.hits.get(e) || 0) + 1; V.hits.set(e, c);
  if (e.hp <= 0) return;
  const a = s.a, kn = F.has('riot') ? 0.18 : F.has('off') ? 0.07 : 0.02;
  if (F.has('off') || F.has('riot') || F.has('pile') || F.has('skit')) fbLaunch(pv, e, Math.cos(a) * kn * (F.has('off') && c >= 3 ? 2 : 1), Math.sin(a) * kn * (F.has('off') && c >= 3 ? 2 : 1));
  else { e.kx += Math.cos(a) * kn; e.ky += Math.sin(a) * kn; }
  if (F.has('off') && c === 3) sivTxt(pv, e.x, e.y - e.r - 0.04, 'GET OFF ME!', SIV_PALE);
  if (F.has('kick') && c === Math.min(V.n, 7) && !V.kicked) { V.kicked = true; fbLaunch(pv, e, Math.cos(a) * 0.9, Math.sin(a) * 0.9); me.kx = -0.45; sivTxt(pv, e.x, e.y - e.r - 0.05, 'KICKBACK', SIV_PALE, true); }
}
function mgvEnd(pv, s) {
  const F = pv.F;
  if (s.hits) return;
  if (F.has('conf') && pv.conf.length < 40) pv.conf.push({ x: s.x, y: s.y, t: 2, c: ['#ff5d8f', '#ffd23f', '#7fd0ff', '#8ac926'][Math.floor(Math.random() * 4)], hit: new Set() });
  if (F.has('over') && !s.child) { for (const d of [-0.35, 0.35]) fbShot(pv, s.x, s.y, s.a + d, { dmg: MGV.dmg * 0.4, r: 0.004, range: 0.12, child: true, vol: s.vol, col: SIV_PALE }); if (Math.random() < 0.2) sivTxt(pv, s.x, s.y - 0.03, 'OVERSPILL', SIV_PALE); }
}
function mgvBump(pv, e, o) {
  const F = pv.F;
  if (!(F.has('pile') || F.has('skit') || F.has('riot'))) return;
  sivDamage(pv, e, 8, false, SIV_PALE); sivDamage(pv, o, 8, false, SIV_PALE);
  sivTxt(pv, (e.x + o.x) / 2, (e.y + o.y) / 2 - 0.03, F.has('skit') ? 'SKITTLES' : 'PILE-UP', SIV_PALE);
  if (F.has('skit') && !(e.flyO.depth >= 1)) fbLaunch(pv, o, e.kx * 0.8, e.ky * 0.8, { depth: (e.flyO.depth || 0) + 1 });
  if (F.has('riot')) { sivRing(pv, o.x, o.y, 0.06, '#ffffff', 0.25); for (const q of sivAlive(pv)) if (q !== o && sivD(q, o) < 0.06) sivDamage(pv, q, 6, false); }
}
function mgvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  fbMe(pv, dt);
  blvGun(pv, dt, mgvFire);
  fbStepShots(pv, dt, mgvHit, mgvEnd);
  for (const c of pv.conf) { c.t -= dt; for (const e of sivAlive(pv)) if (!c.hit.has(e) && sivD(e, c) < e.r) { c.hit.add(e); sivDamage(pv, e, MGV.dmg, false, c.c); if (Math.random() < 0.3) sivTxt(pv, e.x, e.y - e.r - 0.03, 'CONFETTI', c.c); } }
  pv.conf = pv.conf.filter(c => c.t > 0);
  fbStepFly(pv, dt, mgvBump, (pv, e) => { if (pv.F.has('pile') || pv.F.has('skit')) { sivDamage(pv, e, 8, false, SIV_PALE); sivTxt(pv, e.x, e.y - 0.03, 'WALL', SIV_PALE); } });
  fbStd(pv, dt);
}
function mgvUnder(pv, g, X, Y, U) { for (const c of pv.conf) { g.globalAlpha = Math.min(1, c.t * 2); g.fillStyle = c.c; g.fillRect(X(c.x) - 2, Y(c.y) - 2, 4, 4); } g.globalAlpha = 1; }
PV_OWN[MGV.id] = { init: mgvInit, step: mgvStep, draw: sivDraw, flags: MGV_FLAG, wave: mgvWave, under: mgvUnder, over: fbDrawShots };

// ================================================================ Nervous Wreck
const NWV = { id: 'v_phys_contact', range: 0.19, cd: 0.6, mag: 4, reload: 1, dmg: 30, knock: 0.35 };
const NWV_FLAG = { A: 'vice', B: 'shellg', C: 'back', 'Vice Grip': 'vice', Getaway: 'getaway', 'Bring a Friend': 'friend', 'Tooth and Nail': 'tooth',
  'Shell Game': 'shellg', Seepage: 'seep', 'Cracked Open': 'open', 'Nut Sack': 'nuts', 'Back Off!': 'back', 'Knock-On': 'knockon', 'Closing Time': 'closing',
  'Hug It Out': 'hug', 'Jaws of Life': 'jaws', 'Crack Addict': 'crack', Untouchable: 'untouch' };
function nwvInit(pv) {
  const F = fbBase(pv, { range: NWV.range, mag: NWV.mag, reload: NWV.reload, rate: NWV.cd * (F0(pv, 'vice') ? 0.8 / 0.6 : 1), bites: [], enter: [], nutN: 0, toothT: 0 });
  pv.me.x = 0.38;
  if (F.has('getaway')) pv.patrol = true;
}
function nwvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  const shell = F.has('shellg') || F.has('crack');
  const n = F.has('closing') ? 4 : 5;
  for (let i = 0; i < n; i++) {
    const side = F.has('closing') ? 1 : (i % 3 === 2 ? -1 : 1), y = F.has('closing') ? pv.me.y + (i - 1.5) * 0.07 : H * (0.15 + R() * 0.7);
    sivFoe(pv, side > 0 ? 0.85 + (F.has('closing') ? 0 : R() * 0.2) : 0, y, { hp: F.has('shellg') ? 220 : shell ? 90 : 70, sp: F.has('closing') ? 0.12 : 0.07 + R() * 0.03, shell: F.has('seep') ? 0 : shell ? 2 : 0 });
  }
  if (F.has('tooth') || F.has('hug') || F.has('getaway')) sivFoe(pv, 0.9, H * 0.12, { hp: 300, sp: 0.003, spit: true, spitCd: 1.1 });
}
function nwvClampOne(pv, e, mult, heavy) {
  const F = pv.F, me = pv.me;
  let k = NWV.dmg * (mult || 1);
  if (F.has('shellg')) { e.cc = (e.cc || 0) + 1; if (e.cc % 3 === 0) { if (e.shell > 0) { heavy = true; if (e.shell === 1 && F.has('open')) { k *= 3; e.stun = 1; sivTxt(pv, e.x, e.y - e.r - 0.07, 'CRACKED OPEN', SIV_BONK, true); } } else if ((e.cracks || 0) < 3) { e.cracks = (e.cracks || 0) + 1; sivTxt(pv, e.x, e.y - e.r - 0.05, '+15%', SIV_BONK); } } k *= 1 + 0.15 * (e.cracks || 0); }
  if (F.has('crack')) heavy = true;
  const sh = e.shell;
  sivDamage(pv, e, k, heavy);
  if (F.has('crack') && e.shell < sh) sivTxt(pv, me.x, me.y - 0.07, '+1%', BLV_GREEN);
  pv.bites.push({ x: e.x, y: e.y, e, t: F.has('vice') ? 0.4 : 0.18, max: F.has('vice') ? 0.4 : 0.18 });
  if (F.has('seep') && e.cracks) for (const o of sivAlive(pv)) if (o !== e && !o.dying && sivD(o, e) < e.r + o.r + 0.03) { sivDamage(pv, o, k * 0.3, false, SIV_BONK); sivTxt(pv, o.x, o.y - o.r, 'SEEP', SIV_BONK); }
  if (F.has('nuts')) { pv.nutN++; if (pv.nutN >= 6) { pv.nutN = 0; let far = null; for (const o of sivAlive(pv)) if (!o.dying && !o.spit && (!far || sivD(o, me) > sivD(far, me))) far = o; if (far) { fbShot(pv, me.x, me.y, Math.atan2(far.y - me.y, far.x - me.x), { dmg: 60, r: 0.012, heavy: true, col: SIV_NUT, only: far, range: 1.2 }); sivTxt(pv, me.x, me.y - 0.08, 'NUT SACK', SIV_NUT, true); } } }
  if (e.hp <= 0) return;
  if (F.has('vice')) { e.held = 0.4; e.kx = e.ky = 0; if (F.has('getaway')) sivTxt(pv, me.x, me.y - 0.08, '+25% SPEED', SIV_PALE); }
  else if (!F.has('hug')) { const [vx, vy] = fbAway(e, me, NWV.knock * (heavy ? 1.6 : 1)); fbLaunch(pv, e, vx, vy); }
  if (F.has('friend') && F.has('vice')) { const o = fbNearest(pv, e, 0.22, e, q => !q.spit); if (o) { e.held = 0; const [vx, vy] = fbAway(o, e, -1); fbLaunch(pv, e, vx * 0.9, vy * 0.9, { friend: true }); sivTxt(pv, e.x, e.y - e.r - 0.05, 'BRING A FRIEND', SIV_PALE); } }
  if (F.has('hug')) { e.hug = 1; sivTxt(pv, e.x, e.y - e.r - 0.05, 'HUG IT OUT', SIV_PALE); }
}
function nwvClamp(pv) {
  const F = pv.F, me = pv.me;
  const inR = sivAlive(pv).filter(e => !e.dying && !e.spit && sivD(e, me) < pv.range + e.r);
  if (!inR.length) return false;
  me.kick = 0.006;
  if (F.has('jaws')) { // Jaws of Life: everything within 240, every clamp
    for (const e of sivAlive(pv).filter(e => !e.dying && !e.spit && sivD(e, me) < 0.41)) nwvClampOne(pv, e, 1);
    sivRing(pv, me.x, me.y, 0.41, SIV_PALE, 0.35); sivTxt(pv, me.x, me.y - 0.09, 'JAWS OF LIFE', SIV_PALE); return true;
  }
  const t = inR.sort((a, b) => sivD(a, me) - sivD(b, me))[0];
  me.a = Math.atan2(t.y - me.y, t.x - me.x);
  let mult = 1, heavy = false;
  if (F.has('back') || F.has('untouch')) { if (!(t.counterT > pv.t)) { t.counterT = pv.t + (F.has('untouch') ? 0.3 : 4); mult = F.has('back') ? 2 : 1; heavy = true; sivTxt(pv, t.x, t.y - t.r - 0.05, 'BACK OFF!', SIV_BONK, true); } else if (F.has('back')) mult = 0.8; }
  nwvClampOne(pv, t, mult, heavy);
  if (heavy && t.hp > 0 && (F.has('back') || F.has('untouch'))) { const [vx, vy] = fbAway(t, me, 0.6); fbLaunch(pv, t, vx, vy, { counter: true }); }
  return true;
}
function nwvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me;
  if (pv.patrol) { fbHome(pv).x = 0.3 + Math.sin(pv.t * 0.6) * 0.1 * (pv.foes.some(e => e.held > 0) ? 1.25 : 1); }
  fbMe(pv, dt);
  // Closing Time: three or more come into range within a second: they are all snapped at once.
  for (const e of sivAlive(pv)) { const inR = sivD(e, me) < pv.range + e.r; if (inR && !e.inR) pv.enter.push(pv.t); e.inR = inR; }
  pv.enter = pv.enter.filter(t => pv.t - t < 1);
  if (F.has('closing') && pv.enter.length >= 3) {
    pv.enter = []; sivTxt(pv, me.x, me.y - 0.09, 'CLOSING TIME', SIV_BONK, true); sivRing(pv, me.x, me.y, pv.range + 0.03, SIV_BONK, 0.4);
    for (const e of sivAlive(pv).filter(e => !e.dying && !e.spit && sivD(e, me) < pv.range + e.r + 0.02)) nwvClampOne(pv, e, 1, true);
  }
  if (F.has('untouch')) for (const e of sivAlive(pv)) if (e.inR && !e.spit && !(e.counterT > pv.t) && !e.dying) { e.counterT = pv.t + 0.3; nwvClampOne(pv, e, 1, true); sivTxt(pv, e.x, e.y - e.r - 0.05, 'COUNTER', SIV_BONK); const [vx, vy] = fbAway(e, me, 0.5); fbLaunch(pv, e, vx, vy); break; }
  blvGun(pv, dt, nwvClamp);
  for (const b of pv.bites) b.t -= dt;
  pv.bites = pv.bites.filter(b => b.t > 0);
  for (const e of sivAlive(pv)) {
    if (e.held > 0) { e.held -= dt; e.kx = e.ky = 0; }
    if (e.hug > 0) { e.hug -= dt; e.x = me.x + Math.cos(me.a) * 0.06; e.y = me.y + Math.sin(me.a) * 0.06; e.kx = e.ky = 0; }
    // Contact: a cell that reaches you hurts (Untouchable: half), then bounces off.
    if (!e.spit && !e.dying && sivD(e, me) < e.r + 0.03) { const near = sivAlive(pv).some(o => o.inR && !o.spit); sivTxt(pv, me.x, me.y - 0.06, F.has('untouch') && near ? 'OUCH -5' : 'OUCH -10', BLV_RED); const [vx, vy] = fbAway(e, me, 0.4); e.kx += vx; e.ky += vy; }
  }
  // Tooth and Nail: the jaws crush a shot that comes into range (once per 0.5 s). Hug It Out: the hugged cell soaks shots. Getaway: shots lose track.
  pv.toothT -= dt;
  fbSpit(pv, dt, (pv, b) => {
    if (F.has('tooth') && pv.toothT <= 0 && sivD(b, me) < pv.range) { pv.toothT = 0.5; sivTxt(pv, b.x, b.y - 0.03, 'CRUNCH', SIV_PALE); sivRing(pv, b.x, b.y, 0.03, SIV_PALE, 0.2); return true; }
    const h = sivAlive(pv).find(e => e.hug > 0); if (h && sivD(b, h) < h.r + b.r) { sivTxt(pv, h.x, h.y - h.r, 'SOAKED', SIV_PALE); return true; }
    if (F.has('getaway') && !b.lost && pv.foes.some(e => e.held > 0) && sivD(b, me) < 0.3) { b.lost = true; const a = Math.atan2(b.vy, b.vx) + (Math.random() < 0.5 ? 1 : -1) * 0.9; b.vx = Math.cos(a) * 0.3; b.vy = Math.sin(a) * 0.3; sivTxt(pv, b.x, b.y - 0.03, 'LOST YOU', SIV_PALE); }
    return false;
  });
  fbStepShots(pv, dt, (pv, s, e) => sivDamage(pv, e, s.dmg, s.heavy));
  fbStepFly(pv, dt, (pv, e, o) => {
    if (e.flyO.friend) { sivDamage(pv, e, 12, false, SIV_PALE); sivDamage(pv, o, 12, false, SIV_PALE); sivTxt(pv, o.x, o.y - o.r - 0.03, 'CLONK', SIV_PALE); e.kx *= 0.2; e.ky *= 0.2; return; }
    if (F.has('knockon') && e.flyO.counter) { fbLaunch(pv, o, e.kx * 0.7, e.ky * 0.7); sivTxt(pv, o.x, o.y - o.r - 0.03, 'KNOCK-ON', SIV_BONK); sivDamage(pv, o, 8, false, SIV_BONK); }
  });
  const held = pv.foes.filter(e => e.held > 0).map(e => [e, e.x, e.y]); // (held cells don't swim)
  fbStd(pv, dt);
  for (const [e, x, y] of held) { e.x = x; e.y = y; }
}
function nwvUnder(pv, g, X, Y, U, c) {
  const me = pv.me; g.globalAlpha = 0.25; g.strokeStyle = c; g.setLineDash([3, 5]); g.lineWidth = 1; g.beginPath(); g.arc(X(me.x), Y(me.y), U * pv.range, 0, TAU); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
  fbDrawSpit(pv, g, X, Y, U);
}
function nwvOver(pv, g, X, Y, U, c) {
  for (const b of pv.bites) { // two jaws snapping shut on the cell
    const e = b.e, x = X(e.hp > 0 ? e.x : b.x), y = Y(e.hp > 0 ? e.y : b.y), k = 1 - b.t / b.max, R = U * (e.r + 0.018), o = (1 - Math.min(1, k * 3)) * 0.7 + 0.15;
    g.strokeStyle = c; g.lineWidth = 3; g.globalAlpha = 0.9;
    g.beginPath(); g.arc(x, y - R * o * 0.4, R, Math.PI + 0.5, TAU - 0.5); g.stroke();
    g.beginPath(); g.arc(x, y + R * o * 0.4, R, 0.5, Math.PI - 0.5); g.stroke();
  }
  g.globalAlpha = 1;
  fbDrawShots(pv, g, X, Y, U);
}
function nwvMe(pv, g, hx, hy, hr) { if (pv.F.has('nuts')) for (let i = 0; i < pv.nutN; i++) { g.fillStyle = SIV_NUT; g.beginPath(); g.arc(hx - hr * 2.2 + i * hr * 0.9, hy - hr * 2, hr * 0.3, 0, TAU); g.fill(); } }
function nwvCell(pv, g, e, x, y, r) { blvSpitCell(g, e, x, y, r); for (let i = 0; i < (e.cracks || 0); i++) { g.strokeStyle = SIV_BONK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x - r * 0.6 + i * r * 0.5, y - r * 0.7); g.lineTo(x - r * 0.4 + i * r * 0.5, y); g.lineTo(x - r * 0.6 + i * r * 0.5, y + r * 0.6); g.stroke(); } }
PV_OWN[NWV.id] = { init: nwvInit, step: nwvStep, draw: sivDraw, flags: NWV_FLAG, wave: nwvWave, under: nwvUnder, over: nwvOver, me: nwvMe, cell: nwvCell };

// ================================================================ Family Ties (vortex)
const FTV = { id: 's_void', range: 0.68, cd: 1.8, mag: 2, reload: 2.5, dmg: 8, v: 0.2, life: 3.4, aura: 0.12, pull: 0.16, r: 0.022, nova: 5 };
const FTV_FLAG = { A: 'horizon', B: 'orbit', C: 'bang', 'Event Horizon': 'horizon', 'Roach Motel': 'motel', Compaction: 'compact', 'Lost Property': 'lost',
  Orbituary: 'orbit', 'Bumper Cars': 'bump', 'Let Go': 'letgo', 'Gravity Assist': 'assist', 'Big Bang, Eventually': 'bang', Appetite: 'appetite',
  Afterglow: 'afterglow', 'White Hole': 'white', Supermassive: 'super', Spaghettification: 'spag', Wormhole: 'worm' };
function ftvInit(pv) {
  const F = fbBase(pv, { range: FTV.range, mag: FTV.mag, reload: FTV.reload, rate: FTV.cd, orbs: [], wells: [], gems: [], on: 0 });
  pv.me.x = 0.16;
  if (F.has('assist')) pv.patrol = true;
}
function ftvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 7; i++) sivFoe(pv, 0.55 + R() * 0.4, H * (0.15 + R() * 0.7), { hp: F.has('spag') ? 60 : 80, sp: 0.03 });
  if (F.has('appetite')) sivFoe(pv, 0.95, H * 0.12, { hp: 400, sp: 0.002, spit: true, spitCd: 1 });
}
function ftvOrb(pv, x, y, tx, ty, o) {
  const F = pv.F, slow = F.has('bang') ? 0.7 : 1, a = Math.atan2(ty - y, tx - x);
  const b = Object.assign({ x, y, a, tx, ty, v: FTV.v * slow, life: FTV.life * (F.has('bang') ? 1.6 : 1), m: 1, dealt: 0, tick: 0, n: ++pv.on, ate: 0 }, o);
  b.white = F.has('white') && b.n % 3 === 0;
  if (b.white) sivTxt(pv, x, y - 0.05, 'WHITE HOLE', '#ffffff');
  pv.orbs.push(b); return b;
}
const ftvSize = (pv, b) => FTV.r * Math.cbrt(b.m) * (pv.F.has('super') ? 2 : 1);
const ftvAura = (pv, b) => FTV.aura * (0.8 + 0.2 * b.m) * (pv.F.has('super') ? 2 : 1);
function ftvFire(pv) {
  const F = pv.F, me = pv.me, t = fbCluster(pv, me, pv.range, 0.12);
  if (!t) return false;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.01;
  const b = ftvOrb(pv, me.x, me.y, t.x, t.y);
  if (F.has('worm')) { const o = fbCluster(pv, me, pv.range, 0.12, t) || t; const b2 = ftvOrb(pv, me.x, me.y, o.x + 0.15, Math.max(0.05, o.y - 0.15)); b.twin = b2; b2.twin = b; }
  return true;
}
function ftvEnd(pv, b) { // the orb ends: Compaction, Let Go
  const F = pv.F;
  b.dead = true;
  for (const e of sivAlive(pv)) {
    if (e.pinned === b) e.pinned = null;
    if (e.orbAt === b) { e.orbAt = null; if (F.has('letgo')) { const a = Math.atan2(e.y - b.y, e.x - b.x) + Math.PI / 2; fbLaunch(pv, e, Math.cos(a) * 0.7, Math.sin(a) * 0.7, { letgo: true }); } }
  }
  if (F.has('letgo') && sivAlive(pv).some(e => e.flyO && e.flyO.letgo && e.fly > 0)) sivTxt(pv, b.x, b.y - 0.06, 'LET GO', SIV_PALE, true);
  if (F.has('compact')) { const crushed = sivAlive(pv).filter(e => !e.dying && sivD(e, b) < ftvSize(pv, b) + e.r + 0.02); if (crushed.length) { sivTxt(pv, b.x, b.y - 0.06, 'COMPACTION', SIV_BONK, true); sivRing(pv, b.x, b.y, 0.08, SIV_BONK, 0.35); for (const e of crushed) { sivDamage(pv, e, 25, true); if (e.hp <= 0) ftvLost(pv, e); } } }
}
function ftvLost(pv, e) { if (pv.F.has('lost')) { pv.gems.push({ x: e.x, y: e.y }); sivTxt(pv, e.x, e.y - e.r - 0.03, 'LOST PROPERTY', FB_GEM); } }
function ftvNova(pv, b) {
  const F = pv.F, k = (F.has('afterglow') ? 1 + Math.min(1, b.dealt / 200) : 1) * (F.has('super') ? 3 : 1);
  sivTxt(pv, b.x, b.y - 0.08, 'SUPERNOVA', '#ffffff', true); sivRing(pv, b.x, b.y, 0.3, '#ffffff', 0.5); sivBits(pv, b.x, b.y, 24, pv.col, 0.6);
  pv.flash = pv.flash || []; pv.flash.push({ x: b.x, y: b.y, r: 0.3, life: 0.4 });
  for (const e of sivAlive(pv)) if (!e.dying && sivD(e, b) < 0.3) { sivDamage(pv, e, 40 * k, true); if (e.hp <= 0) ftvLost(pv, e); }
  if (F.has('afterglow')) { pv.wells.push({ x: b.x, y: b.y, t: 3 }); sivTxt(pv, b.x, b.y + 0.06, 'AFTERGLOW', pv.col); }
  b.dead = true;
}
function ftvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, need = F.has('super') ? 3 : FTV.nova;
  if (pv.patrol) { fbHome(pv).x = 0.35 + Math.sin(pv.t * 0.8) * 0.2; fbHome(pv).y = pv.fh * (0.5 + Math.cos(pv.t * 0.8) * 0.25); }
  if (pv.patrol) { const H = fbHome(pv); me.x += (H.x - me.x) * Math.min(1, dt * 3) * (me.boost > 0 ? 1.6 : 1); me.y += (H.y - me.y) * Math.min(1, dt * 3); me.boost = Math.max(0, (me.boost || 0) - dt); for (const b of pv.orbs) if (sivD(b, me) < 0.07 && !(b.slung)) { b.slung = true; me.boost = 1; sivTxt(pv, me.x, me.y - 0.07, 'SLINGSHOT +60%', SIV_PALE, true); } }
  else fbMe(pv, dt);
  blvGun(pv, dt, ftvFire);
  // Orbs: drift to the spot, pull each other, merge.
  for (const b of pv.orbs) {
    if (b.dead) continue;
    const d = Math.hypot(b.tx - b.x, b.ty - b.y), v = b.v * Math.min(1, d / 0.08 + 0.15);
    b.x += Math.cos(b.a) * v * dt; b.y += Math.sin(b.a) * v * dt; b.life -= dt;
    if (b.life <= 0) { ftvEnd(pv, b); continue; }
    for (const o of pv.orbs) {
      if (o === b || o.dead || b.dead || b.twin === o) continue;
      const dd = sivD(o, b) || 1;
      if (dd < ftvSize(pv, b) + ftvSize(pv, o)) { o.dead = true; b.m += o.m; b.dealt += o.dealt; b.life = Math.max(b.life, o.life) + 0.5; sivTxt(pv, b.x, b.y - 0.05, 'MERGED x' + b.m, pv.col, true); sivRing(pv, b.x, b.y, 0.06, pv.col, 0.3); if (b.m >= need) ftvNova(pv, b); }
      else if (dd < 0.45) { const k = 0.12 * dt / Math.max(0.1, dd); b.x += (o.x - b.x) * k; b.y += (o.y - b.y) * k; }
    }
  }
  pv.orbs = pv.orbs.filter(b => !b.dead);
  // Cells: pulled in (or pushed out, or put in orbit), nibbled.
  for (const e of sivAlive(pv)) {
    if (e.dying || e.spit) continue;
    for (const b of pv.orbs) {
      const A = ftvAura(pv, b), d = sivD(e, b), s = ftvSize(pv, b);
      if (d > A + e.r) continue;
      let pull = FTV.pull * (F.has('super') ? 2.5 : 1);
      if (F.has('horizon')) pull *= d < A / 2 ? 2 : 0.7;
      if (b.white) { const [vx, vy] = fbAway(e, b, pull * dt * 1.5); e.x += vx; e.y += vy; continue; }
      if (F.has('orbit') && !e.pinned) { e.orbAt = b; e.oa = Math.atan2(e.y - b.y, e.x - b.x) + dt * 3; const R = Math.max(s + e.r + 0.01, Math.min(d, A * 0.6)); e.x += (b.x + Math.cos(e.oa) * R - e.x) * Math.min(1, dt * 8); e.y += (b.y + Math.sin(e.oa) * R - e.y) * Math.min(1, dt * 8); }
      else if (d > 0.004) { e.x += (b.x - e.x) / d * Math.min(d, pull * dt); e.y += (b.y - e.y) / d * Math.min(d, pull * dt); }
      if (F.has('motel') && !e.pinned && d < s + 0.005 && !e.boss) { e.pinned = b; sivTxt(pv, e.x, e.y - e.r - 0.04, 'ROACH MOTEL', SIV_PALE); }
      if (b.twin && !b.dead && d < s + 0.01 && !(e.wormT > pv.t)) { // Wormhole: in one, out of the other
        e.wormT = pv.t + 1; e.x = b.twin.x; e.y = b.twin.y; e.pinned = null; const a = Math.random() * TAU; fbLaunch(pv, e, Math.cos(a) * 0.9, Math.sin(a) * 0.9, { worm: true }); sivTxt(pv, e.x, e.y - e.r - 0.04, 'WORMHOLE', '#ff3df2', true); continue;
      }
      b.tick = b.tick || 0;
    }
    if (e.pinned && !e.pinned.dead) { e.x = e.pinned.x; e.y = e.pinned.y; e.stun = 0.05; }
  }
  for (const b of pv.orbs) { // the nibble, twice a second
    b.tick -= dt; if (b.tick > 0) continue; b.tick = 0.5;
    const A = ftvAura(pv, b) * 0.7, s = ftvSize(pv, b);
    for (const e of sivAlive(pv)) {
      if (e.dying || e.spit || sivD(e, b) > A + e.r || b.white) continue;
      let k = FTV.dmg * (F.has('bang') ? 1 + 0.5 * (b.m - 1) : 1) * (F.has('orbit') ? 0.6 : 1);
      const centre = sivD(e, b) < s + e.r;
      if (F.has('spag') && centre) { k *= 4; if (e.hp / e.max < 0.3) { k = e.hp + 1; sivTxt(pv, e.x, e.y - e.r - 0.05, 'SPAGHETTIFIED', '#ff3df2', true); } }
      b.dealt += k; sivDamage(pv, e, k, false);
      if (e.hp <= 0 && centre) ftvLost(pv, e);
    }
  }
  // Orbiting cells bump (Bumper Cars); flung cells hit what they meet.
  if (F.has('bump')) { const L = sivAlive(pv).filter(e => e.orbAt && !e.orbAt.dead); for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], b = L[j]; if (sivD(a, b) < a.r + b.r && !(a.bumpT > pv.t)) { a.bumpT = b.bumpT = pv.t + 0.5; sivDamage(pv, a, 6, false, SIV_PALE); sivDamage(pv, b, 6, false, SIV_PALE); sivTxt(pv, a.x, a.y - a.r - 0.03, 'BUMP', SIV_PALE); } } }
  fbStepFly(pv, dt, (pv, e, o) => { sivDamage(pv, o, 10, false, SIV_PALE); const [vx, vy] = fbAway(o, e, 0.3); o.kx += vx; o.ky += vy; });
  // Appetite: at 3 merged an orb eats enemy shots.
  fbSpit(pv, dt, (pv, b) => { const o = pv.orbs.find(q => q.m >= 3 && sivD(q, b) < ftvAura(pv, q) * 0.6); if (o && F.has('appetite')) { sivTxt(pv, b.x, b.y - 0.03, 'NOM', pv.col); return true; } return false; });
  for (const w of pv.wells) { w.t -= dt; for (const e of sivAlive(pv)) { const d = sivD(e, w); if (d < 0.15 && d > 0.01) { e.x += (w.x - e.x) / d * 0.1 * dt; e.y += (w.y - e.y) / d * 0.1 * dt; } } }
  pv.wells = pv.wells.filter(w => w.t > 0);
  for (const gm of pv.gems) { const d = sivD(gm, me) || 1; gm.x += (me.x - gm.x) / d * Math.min(d, 0.6 * dt); gm.y += (me.y - gm.y) / d * Math.min(d, 0.6 * dt); if (d < 0.03) { gm.got = true; sivTxt(pv, me.x, me.y - 0.06, '+GEM', FB_GEM); } }
  pv.gems = pv.gems.filter(gm => !gm.got);
  if (pv.flash) { for (const f of pv.flash) f.life -= dt; pv.flash = pv.flash.filter(f => f.life > 0); }
  fbStd(pv, dt);
}
function ftvUnder(pv, g, X, Y, U, c) {
  for (const w of pv.wells) { g.globalAlpha = Math.min(1, w.t) * 0.35; g.fillStyle = c; g.beginPath(); g.arc(X(w.x), Y(w.y), U * 0.15, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  for (const b of pv.orbs) { // the pull zone, swirling
    const A = U * ftvAura(pv, b), x = X(b.x), y = Y(b.y);
    g.strokeStyle = b.white ? '#ffffff' : c; g.globalAlpha = 0.35; g.lineWidth = 1; g.setLineDash([3, 5]); g.lineDashOffset = (b.white ? 1 : -1) * pv.t * 20; g.beginPath(); g.arc(x, y, A, 0, TAU); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
    if (b.twin) { g.globalAlpha = 0.4; g.strokeStyle = '#ff3df2'; g.beginPath(); g.moveTo(x, y); g.lineTo(X(b.twin.x), Y(b.twin.y)); g.stroke(); }
  }
  g.globalAlpha = 1;
  fbDrawSpit(pv, g, X, Y, U);
}
function ftvOver(pv, g, X, Y, U, c) {
  for (const f of pv.flash || []) pvGlow(g, X(f.x), Y(f.y), U * f.r, '#ffffff', 0.6 * f.life / 0.4);
  g.globalCompositeOperation = 'source-over';
  for (const b of pv.orbs) {
    const x = X(b.x), y = Y(b.y), s = U * ftvSize(pv, b);
    pvGlow(g, x, y, s * 2.4, b.white ? '#ffffff' : c, 0.6);
    g.fillStyle = b.white ? '#ffffff' : '#000'; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); g.strokeStyle = c; g.lineWidth = 2; g.stroke();
    if (b.m > 1 || pv.F.has('bang') || pv.F.has('appetite')) { g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(b.m + '/' + (pv.F.has('super') ? 3 : FTV.nova), x, y - s - 5); }
  }
  for (const gm of pv.gems) { g.fillStyle = FB_GEM; g.save(); g.translate(X(gm.x), Y(gm.y)); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore(); }
  g.globalCompositeOperation = 'lighter';
}
PV_OWN[FTV.id] = { init: ftvInit, step: ftvStep, draw: sivDraw, flags: FTV_FLAG, wave: ftvWave, under: ftvUnder, over: ftvOver, cell: (pv, g, e, x, y, r) => blvSpitCell(g, e, x, y, r) };

// ================================================================ Skill Issue (lard)
const SKV = { id: 's_lard', range: 0.65, cd: 1.2, mag: 3, reload: 1.8, dmg: 14, area: 0.11, flight: 0.6, fling: 0.75, coll: 10 };
const SKV_FLAG = { A: 'pinball', B: 'meat', C: 'grinder', 'Pinball Wizard': 'pinball', 'Bank Shot': 'bank', 'Hat Trick': 'hat', 'Sausage Link': 'sausage',
  'Heavy Meat': 'meat', 'Weight Class': 'weight', 'Prime Cut': 'prime', 'Meat Shield': 'shield', 'Meat Grinder': 'grinder', 'Splatter Zone': 'splatter',
  'Chain Tenderising': 'chainT', Leftovers: 'leftovers', 'Perfect Game': 'perfect', Tenderiser: 'tender', 'Human Cannonball': 'cannon' };
function skvInit(pv) {
  const F = fbBase(pv, { range: SKV.range, mag: SKV.mag, reload: SKV.reload, rate: SKV.cd, lobs: [], walls: [], chunks: [], strings: [], cannonT: 2 });
  pv.me.x = F.has('shield') ? 0.3 : 0.18;
  if (F.has('leftovers')) pv.patrol = true;
}
function skvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  const big = F.has('meat') || F.has('prime');
  for (let c = 0; c < 2; c++) {
    const cx = (F.has('shield') ? 0.45 : 0.6) + c * 0.2, cy = H * (F.has('bank') ? (c ? 0.86 : 0.14) : c ? 0.68 : 0.38);
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + R(), d = i ? 0.05 : 0; sivFoe(pv, cx + Math.cos(a) * d, cy + Math.sin(a) * d, i === 0 && big ? { r: 0.045, hp: 160, sp: 0.02, elite: true } : { hp: 50, sp: F.has('shield') ? 0.06 : 0.025, shell: F.has('tender') ? 1 : 0 }); }
  }
  if (F.has('shield')) sivFoe(pv, 0.95, H * 0.14, { hp: 400, sp: 0.002, spit: true, spitCd: 0.9 });
}
function skvFire(pv) {
  const F = pv.F, me = pv.me;
  let t = fbCluster(pv, me, pv.range, 0.11);
  if (F.has('shield') && pv.n % 2 === 0) t = fbNearest(pv, me, 0.3, null, e => !e.spit) || t; // (Meat Shield: some land near you)
  if (!t) return false;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.01;
  pv.lobs.push({ sx: me.x, sy: me.y, tx: t.x, ty: t.y, k: 0 });
  return true;
}
const skvFling = pv => SKV.fling * (pv.F.has('grinder') ? 0.7 : 1) * (pv.F.has('perfect') ? 2 : 1);
function skvLand(pv, L) {
  const F = pv.F, me = pv.me, at = { x: L.tx, y: L.ty };
  sivRing(pv, at.x, at.y, SKV.area, FB_LARD, 0.35); sivBits(pv, at.x, at.y, 12, FB_LARD, 0.35);
  for (const e of sivAlive(pv)) {
    if (e.dying || e.spit || sivD(e, at) > SKV.area + e.r) continue;
    sivDamage(pv, e, SKV.dmg * (F.has('pinball') ? 0.8 : 1), F.has('tender'));
    let v = skvFling(pv) * (e.elite ? (F.has('prime') ? 0.9 : 0.4) : 1);
    const [vx, vy] = fbAway(e, at, v); fbLaunch(pv, e, vx, vy, { depth: 0, root: L, hits: 0 });
    if (F.has('prime') && e.elite) sivTxt(pv, e.x, e.y - e.r - 0.04, 'PRIME CUT', SIV_BONK, true);
  }
  L.knocked = 0;
  if (F.has('shield') && sivD(at, me) < 0.22) { pv.walls.push({ x: at.x, y: at.y, t: 2 }); sivTxt(pv, at.x, at.y - 0.05, 'MEAT SHIELD', FB_LARD, true); }
}
function skvMark(pv, e, depth) { // Meat Grinder: three impact marks and it bursts
  const F = pv.F;
  if (!F.has('grinder') || e.hp <= 0) return;
  e.im = (e.im || 0) + 1;
  if (e.im < 3) return;
  e.im = 0; sivTxt(pv, e.x, e.y - e.r - 0.05, 'TENDERISED', SIV_BONK, true); sivRing(pv, e.x, e.y, 0.08, SIV_BONK, 0.3);
  for (const o of sivAlive(pv)) {
    if (o === e || o.dying || sivD(o, e) > 0.08 + o.r) continue;
    sivDamage(pv, o, 10, false, SIV_BONK);
    if (F.has('splatter')) { const [vx, vy] = fbAway(o, e, 0.4); fbLaunch(pv, o, vx, vy, { depth: 1 }); if (Math.random() < 0.4) sivTxt(pv, o.x, o.y - o.r - 0.03, 'SPLATTER', SIV_BONK); }
    if (F.has('chainT') && depth < 3) { skvMark(pv, o, depth + 1); if (o.im === 2) sivTxt(pv, o.x, o.y - o.r - 0.03, 'CHAIN', SIV_BONK); }
  }
  sivDamage(pv, e, 10, false, SIV_BONK);
}
function skvBump(pv, e, o) {
  const F = pv.F, O = e.flyO || {}, maxD = F.has('perfect') ? 4 : 2;
  let k = SKV.coll * (F.has('meat') ? Math.min(2, e.r / 0.026) : 1);
  const heavy = F.has('tender') || (F.has('prime') && e.elite);
  sivDamage(pv, e, k * 0.5, heavy, SIV_PALE); sivDamage(pv, o, k, heavy, SIV_PALE);
  skvMark(pv, e, 0); skvMark(pv, o, 0);
  if (F.has('meat') && e.r > 0.03) sivTxt(pv, o.x, o.y - o.r - 0.03, 'HEAVY MEAT', SIV_PALE);
  if (F.has('leftovers') && pv.chunks.length < 8) pv.chunks.push({ x: o.x, y: o.y, t: 4 });
  if ((O.depth || 0) + 1 < maxD) { // it bowls its mate on
    let v = Math.hypot(e.kx, e.ky) * 0.8 * (F.has('weight') && e.r > o.r ? 2 : 1);
    if (F.has('weight') && e.r > o.r) sivTxt(pv, o.x, o.y - o.r - 0.05, 'WEIGHT CLASS', SIV_PALE);
    const [vx, vy] = fbAway(o, e, Math.max(0.3, v)); fbLaunch(pv, o, vx, vy, { depth: (O.depth || 0) + 1, root: O.root });
    if (O.root) { O.root.knocked = (O.root.knocked || 0) + 1; if (O.root.knocked === 3) sivTxt(pv, o.x, o.y - o.r - 0.06, 'STRIKE', SIV_BONK, true); }
  }
  if (F.has('pinball')) { // rebound and carry on at 70%
    const [vx, vy] = fbAway(e, o, Math.hypot(e.kx, e.ky) * 0.7); e.kx = vx; e.ky = vy; e.fly = 0.5;
    O.hits = (O.hits || 0) + 1; if (Math.random() < 0.35) sivTxt(pv, e.x, e.y - e.r - 0.03, 'REBOUND', SIV_PALE);
    if (F.has('hat') && O.hits === 3) { sivTxt(pv, e.x, e.y - e.r - 0.05, 'HAT TRICK', SIV_BONK, true); sivRing(pv, e.x, e.y, 0.07, '#ffffff', 0.3); for (const q of sivAlive(pv)) if (q !== e && sivD(q, e) < 0.07) sivDamage(pv, q, 12, false); }
  } else { e.kx *= 0.3; e.ky *= 0.3; }
}
function skvWall(pv, e) {
  const F = pv.F, H = pv.fh;
  if (!F.has('bank') && !F.has('pinball')) return;
  if (e.y < e.r + 0.01 || e.y > H - e.r - 0.01) e.ky = -e.ky * 0.7; else e.kx = -e.kx * 0.7;
  e.walled = false; e.fly = 0.5;
  if (F.has('bank')) { sivDamage(pv, e, SKV.coll, false, SIV_PALE); sivTxt(pv, e.x, e.y - e.r - 0.03, 'BANK SHOT', SIV_PALE); skvMark(pv, e, 0); }
}
function skvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me;
  if (pv.patrol) { const H = fbHome(pv); H.x = 0.45 + Math.sin(pv.t * 0.7) * 0.25; H.y = pv.fh * (0.56 + Math.cos(pv.t * 0.7) * 0.2); me.x += (H.x - me.x) * Math.min(1, dt * 3); me.y += (H.y - me.y) * Math.min(1, dt * 3); }
  else if (!pv.cannon) fbMe(pv, dt);
  // Human Cannonball: every 4 s Spermy launches itself 320, bowling over everything it touches.
  if (F.has('cannon')) {
    pv.cannonT -= dt;
    if (pv.cannonT <= 0 && !pv.cannon) { const t = fbCluster(pv, me, 0.6, 0.1); if (t) { pv.cannon = { a: Math.atan2(t.y - me.y, t.x - me.x), d: 0, hit: new Set() }; me.a = pv.cannon.a; sivTxt(pv, me.x, me.y - 0.07, 'HUMAN CANNONBALL', SIV_BONK, true); } pv.cannonT = 4; }
    if (pv.cannon) {
      const C = pv.cannon, st = 1.6 * dt; me.x += Math.cos(C.a) * st; me.y += Math.sin(C.a) * st; C.d += st;
      for (const e of sivAlive(pv)) if (!C.hit.has(e) && !e.dying && sivD(e, me) < e.r + 0.03) { C.hit.add(e); sivDamage(pv, e, SKV.coll * 2, true); const [vx, vy] = fbAway(e, me, skvFling(pv)); fbLaunch(pv, e, vx, vy, { depth: 1 }); }
      if (C.d > 0.55) pv.cannon = null;
    }
  }
  blvGun(pv, dt, skvFire);
  for (const L of pv.lobs) { L.k += dt / SKV.flight; if (L.k >= 1) { L.done = true; skvLand(pv, L); } }
  pv.lobs = pv.lobs.filter(L => !L.done);
  // Sausage Link: a flying cell tugs the next one it passes along behind it.
  if (F.has('sausage')) for (const e of sivAlive(pv)) if (e.fly > 0 && !e.tow) { const o = fbNearest(pv, e, 0.09, e, q => !(q.fly > 0.3) && !q.towed && !q.spit && !q.tow); if (o) { e.tow = o; o.towed = e; sivTxt(pv, o.x, o.y - o.r - 0.03, 'SAUSAGE LINK', FB_LARD); } }
  for (const e of sivAlive(pv)) if (e.tow) { const o = e.tow; if (o.hp <= 0 || !(e.fly > 0)) { o.towed = null; e.tow = null; continue; } const d = sivD(e, o); if (d > 0.06) { o.x += (e.x - o.x) * Math.min(1, dt * 6); o.y += (e.y - o.y) * Math.min(1, dt * 6); } }
  fbStepFly(pv, dt, skvBump, skvWall);
  // Meat Shield walls block shots; Leftovers heal when you swim through them.
  for (const w of pv.walls) w.t -= dt;
  pv.walls = pv.walls.filter(w => w.t > 0);
  fbSpit(pv, dt, (pv, b) => { const w = pv.walls.find(q => sivD(q, b) < 0.05); if (w) { sivTxt(pv, b.x, b.y - 0.03, 'BLOCKED', FB_LARD); return true; } return false; });
  for (const c of pv.chunks) { c.t -= dt; if (sivD(c, me) < 0.04) { c.t = 0; sivTxt(pv, me.x, me.y - 0.06, '+0.5%', BLV_GREEN); } }
  pv.chunks = pv.chunks.filter(c => c.t > 0);
  fbStd(pv, dt);
}
function skvUnder(pv, g, X, Y, U) {
  for (const w of pv.walls) { g.globalAlpha = Math.min(1, w.t); g.fillStyle = '#b5838d'; g.beginPath(); g.ellipse(X(w.x), Y(w.y), U * 0.05, U * 0.03, 0, 0, TAU); g.fill(); g.strokeStyle = FB_LARD; g.lineWidth = 2; g.stroke(); }
  for (const c of pv.chunks) { g.globalAlpha = Math.min(1, c.t); g.fillStyle = '#c9184a'; g.fillRect(X(c.x) - 3, Y(c.y) - 2, 6, 4); }
  g.globalAlpha = 1;
  for (const e of sivAlive(pv)) if (e.tow) { g.strokeStyle = FB_LARD; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(e.x), Y(e.y)); g.lineTo(X(e.tow.x), Y(e.tow.y)); g.stroke(); }
  fbDrawSpit(pv, g, X, Y, U);
}
function skvOver(pv, g, X, Y, U) {
  for (const L of pv.lobs) { const x = X(L.sx + (L.tx - L.sx) * L.k), y = Y(L.sy + (L.ty - L.sy) * L.k) - Math.sin(L.k * Math.PI) * U * 0.12; g.fillStyle = FB_LARD; g.beginPath(); g.ellipse(x, y, U * 0.016, U * 0.012, L.k * 4, 0, TAU); g.fill(); }
}
function skvCell(pv, g, e, x, y, r) { blvSpitCell(g, e, x, y, r); for (let i = 0; i < (e.im || 0); i++) { g.fillStyle = SIV_BONK; g.beginPath(); g.arc(x - 3 + i * 6, y + r + 6, 2.2, 0, TAU); g.fill(); } }
PV_OWN[SKV.id] = { init: skvInit, step: skvStep, draw: sivDraw, flags: SKV_FLAG, wave: skvWave, under: skvUnder, over: skvOver, cell: skvCell };

// ================================================================ There Is No Spoon (siphon)
const SPV = { id: 's_siphon', range: 0.78, cd: 0.08, store: 10, area: 0.15, dribble: 1.2 };
const SPV_FLAG = { A: 'womb', B: 'shield', C: 'rich', 'Return to Womb': 'womb', 'Full Term': 'term', Afterbirth: 'afterb', Hiccup: 'hic',
  'Umbilical Shield': 'shield', 'Suction Cup': 'suction', 'Water Breaks': 'water', 'Re-Gift': 'regift', 'Eat the Rich': 'rich',
  'Return to Sender': 'sender', 'Paternity Test': 'paternity', 'Swap Meet': 'swap', 'Mirror Womb': 'mirror', 'Let-Down Reflex': 'letdown', 'Bullet Sponge': 'sponge' };
function spvInit(pv) {
  const F = fbBase(pv, { range: SPV.range, mag: 1, reload: 1, rate: SPV.cd, q: [], dryT: 0, memb: 0, membHits: 0 });
  pv.capS = F.has('letdown') ? 40 : F.has('womb') ? 25 : SPV.store;
  pv.area = SPV.area * (F.has('sponge') ? 3 : 1);
  pv.me.x = 0.32;
}
function spvWave(pv) {
  const F = pv.F, H = pv.fh;
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 4; i++) sivFoe(pv, 0.75 + (i % 2) * 0.12, H * (0.15 + i * 0.23), { hp: 70, sp: 0.004, spit: true, spitCd: 0.9 + i * 0.25, bigShot: F.has('rich') ? i % 2 === 0 : i === 3 && (F.has('water')), plainSpit: true });
  if (F.has('afterb') || F.has('rich') || F.has('paternity')) sivFoe(pv, 0.62, H * 0.5, F.has('paternity') ? { r: 0.06, hp: 600, sp: 0.002, spit: true, spitCd: 1.6, bigShot: true, boss: true, elite: true } : { r: 0.045, hp: 200, sp: 0.01, elite: true });
}
function spvRet(pv, k, at) { // one returned shot
  const F = pv.F, me = pv.me;
  let t = at || fbNearest(pv, me, pv.range);
  if (F.has('regift')) { let far = null; for (const e of sivAlive(pv)) if (!e.dying && (!far || sivD(e, me) > sivD(far, me))) far = e; if (far) t = far; }
  if (!t) return;
  const cols = [TYPE_PAL.fire, TYPE_PAL.shock, TYPE_PAL.ice, TYPE_PAL.soul, TYPE_PAL.flame];
  const col = F.has('swap') ? cols[Math.floor(Math.random() * cols.length)] : k.big ? SIV_BONK : pv.col;
  const s = fbShot(pv, me.x, me.y, Math.atan2(t.y - me.y, t.x - me.x) + (Math.random() - 0.5) * 0.12, { dmg: k.dmg * (k.big && F.has('rich') ? 3 : 1) * (F.has('shield') ? 0.6 : 1), r: k.big ? 0.01 : 0.006, col, v: 1.1, range: pv.range + 0.2, pierce: k.big && F.has('sender') ? 99 : 1, heavy: k.heavy, home: k.home });
  if (F.has('regift') && Math.random() < 0.15) sivTxt(pv, me.x, me.y - 0.07, 'RE-GIFT', SIV_PALE);
  if (F.has('swap') && Math.random() < 0.2) sivTxt(pv, me.x, me.y - 0.07, 'SWAP MEET', col);
  if (F.has('hic') && Math.random() < 0.25) { fbShot(pv, me.x, me.y, s.a + 0.15, Object.assign({}, s, { hit: new Set(), trail: [] })); sivTxt(pv, me.x, me.y - 0.07, 'HIC', SIV_PALE); }
  me.a = s.a; me.kick = 0.004;
}
function spvVolley(pv, list, cone, at) { // a full-store volley (Hiccup: some go twice)
  if (pv.F.has('hic')) { const n = list.length; list = list.concat(list.filter(() => Math.random() < 0.25)); if (list.length > n) sivTxt(pv, pv.me.x, pv.me.y - 0.11, 'HIC x' + (list.length - n), SIV_PALE); }
  const me = pv.me, t = at || fbNearest(pv, me, pv.range);
  const a0 = t ? Math.atan2(t.y - me.y, t.x - me.x) : 0;
  list.forEach((k, i) => { const a = cone ? a0 + (i / Math.max(1, list.length - 1) - 0.5) * 0.25 : i / list.length * TAU; fbShot(pv, me.x, me.y, a, { dmg: k.dmg, r: 0.006, v: 1.1, range: 0.9, col: pv.col, home: cone && t ? t : null }); });
}
function spvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me;
  fbMe(pv, dt);
  // Eat what comes near (Eat the Rich: only the big ones; Suction Cup pulls them in while the Membrane holds).
  fbSpit(pv, dt, (pv, b) => {
    const d = sivD(b, me);
    if (F.has('suction') && pv.memb > 0 && d < 0.2 && d > pv.area && !b.sucked) { b.sucked = true; sivTxt(pv, b.x, b.y - 0.03, 'SUCTION', '#7fd0ff'); }
    if (F.has('suction') && pv.memb > 0 && d < 0.2 && d > 0.01) { b.x += (me.x - b.x) / d * 0.4 * dt; b.y += (me.y - b.y) / d * 0.4 * dt; }
    if (d > pv.area || pv.q.length >= pv.capS || (F.has('rich') && !b.big)) return false;
    const n = b.big && F.has('rich') ? 3 : 1;
    for (let i = 0; i < n && pv.q.length < pv.capS; i++) pv.q.push({ dmg: b.dmg / n, big: b.big, heavy: b.boss && F.has('paternity'), home: b.boss && F.has('paternity') ? b.from : null, from: b.from });
    if (b.boss && F.has('paternity')) sivTxt(pv, me.x, me.y - 0.08, 'PATERNITY TEST', '#ff3df2', true);
    else if (b.big && F.has('rich')) sivTxt(pv, me.x, me.y - 0.07, 'x3', SIV_BONK);
    if (F.has('shield')) pv.memb = Math.min(0.15, pv.memb + 0.01);
    sivBits(pv, b.x, b.y, 3, pv.col, 0.1);
    return true;
  }, (pv, b) => {
    if (F.has('mirror') && Math.random() < 0.5 && b.from && b.from.hp > 0) { fbShot(pv, me.x, me.y, Math.atan2(b.from.y - me.y, b.from.x - me.x), { dmg: b.dmg, only: b.from, col: '#ffffff', v: 1, range: 1.2 }); sivTxt(pv, me.x, me.y - 0.07, 'MIRROR', '#ffffff'); return; }
    if (F.has('shield') && pv.memb > 0) { pv.memb = Math.max(0, pv.memb - b.dmg / 200); if (pv.memb <= 0.001 && F.has('water') && pv.q.length) { sivTxt(pv, me.x, me.y - 0.08, 'WATER BREAKS', '#7fd0ff', true); spvVolley(pv, pv.q.splice(0), false); } return; }
    sivTxt(pv, me.x, me.y - 0.06, 'OW', BLV_SPIT, true);
  });
  // Water Breaks needs the Membrane to break: a big blob now and then.
  if (F.has('water') && pv.memb >= 0.06) { pv.membHits += dt; if (pv.membHits > 3) { pv.membHits = 0; pv.memb = 0; sivTxt(pv, me.x, me.y - 0.08, 'WATER BREAKS', '#7fd0ff', true); if (pv.q.length) spvVolley(pv, pv.q.splice(0), false); } }
  // Fire back.
  pv.cd -= dt;
  if (F.has('womb') || F.has('letdown')) {
    if (pv.q.length >= pv.capS) {
      const L = pv.q.splice(0);
      if (F.has('letdown')) { spvVolley(pv, L, false); pv.later = { t: 0.35, L, ring: true }; sivTxt(pv, me.x, me.y - 0.08, 'LET-DOWN', SIV_BONK, true); }
      else { spvVolley(pv, L, F.has('term')); sivTxt(pv, me.x, me.y - 0.08, F.has('term') ? 'FULL TERM' : 'RETURN TO WOMB', SIV_BONK, true); if (F.has('afterb')) pv.later = { t: 0.35, L, at: sivAlive(pv).find(e => e.elite) }; }
    }
  } else if (pv.cd <= 0 && pv.q.length) { pv.cd = SPV.cd; spvRet(pv, pv.q.shift()); }
  if (pv.later) { pv.later.t -= dt; if (pv.later.t <= 0) { const Lt = pv.later; pv.later = null; spvVolley(pv, Lt.L, !Lt.ring, Lt.at); if (!Lt.ring) sivTxt(pv, me.x, me.y - 0.08, 'AFTERBIRTH', SIV_BONK, true); } }
  // Dry: a weak dribble now and then.
  if (!pv.q.length && !(F.has('womb') || F.has('letdown'))) { pv.dryT += dt; if (pv.dryT > SPV.dribble) { pv.dryT = 0; spvRet(pv, { dmg: 3 }); if (Math.random() < 0.5) sivTxt(pv, me.x, me.y - 0.06, 'dribble', '#8a959a'); } }
  fbStepShots(pv, dt, (pv, s, e) => { sivDamage(pv, e, s.dmg, !!s.heavy, s.col === pv.col ? null : s.col); if (s.hits === 2 && s.pierce > 1) sivTxt(pv, e.x, e.y - e.r - 0.04, 'RETURN TO SENDER', SIV_BONK); });
  fbStd(pv, dt);
}
function spvUnder(pv, g, X, Y, U, c) {
  const me = pv.me; g.globalAlpha = 0.3; g.strokeStyle = c; g.setLineDash([3, 5]); g.lineWidth = 1; g.beginPath(); g.arc(X(me.x), Y(me.y), U * pv.area, 0, TAU); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
  fbDrawSpit(pv, g, X, Y, U);
}
function spvMe(pv, g, hx, hy, hr, U) {
  const n = pv.q.length, F = pv.F;
  if (F.has('womb') || F.has('letdown')) { g.globalAlpha = 0.35; g.fillStyle = '#ffb3c6'; g.beginPath(); g.arc(hx, hy, hr * (1.5 + 2 * n / pv.capS), 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (pv.memb > 0) { g.strokeStyle = '#7fd0ff'; g.lineWidth = 1 + pv.memb * 40; g.beginPath(); g.arc(hx, hy, hr * 2.4, 0, TAU); g.stroke(); }
  for (let i = 0; i < Math.min(n, 40); i++) { const a = pv.t * 2 + i / Math.max(n, 6) * TAU; g.fillStyle = c0(pv); g.beginPath(); g.arc(hx + Math.cos(a) * hr * 1.8, hy + Math.sin(a) * hr * 1.8, 1.8, 0, TAU); g.fill(); }
  g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = c0(pv); g.fillText(n + '/' + pv.capS, hx, hy + hr * 3.6);
}
const c0 = pv => pv.col;
PV_OWN[SPV.id] = { init: spvInit, step: spvStep, draw: sivDraw, flags: SPV_FLAG, wave: spvWave, under: spvUnder, over: fbDrawShots, me: spvMe, cell: (pv, g, e, x, y, r) => blvSpitCell(g, e, x, y, r) };

// ================================================================ One of These Days (due date)
const DDV = { id: 's_duedate', range: 0.82, cd: 0.9, mag: 3, reload: 2, dmg: 20, dur: 4, rep: 0.4 };
const DDV_FLAG = { A: 'anyday', B: 'multi', C: 'interest', 'Any Day Now': 'anyday', 'Early Delivery': 'early', 'Short Notice': 'short', 'Gender Reveal': 'reveal',
  'Multiplying Responsibilities': 'multi', 'Pass the Parcel': 'parcel', 'Rush Hour': 'rush', 'Morning After': 'morning', 'Interest Accrued': 'interest',
  'Compound Interest': 'compound', 'Fine Print': 'fine', Postponed: 'postp', 'Labour Day': 'labour', 'The Big Day': 'bigday', Induced: 'induced' };
function ddvInit(pv) {
  const F = fbBase(pv, { range: DDV.range, mag: DDV.mag, reload: DDV.reload, rate: DDV.cd, offs: [], markCd: 0, post: [] });
  pv.me.x = 0.16;
}
function ddvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  sivFoe(pv, 0.6, H * 0.5, { r: 0.045, hp: F.has('fine') ? 600 : 260, sp: 0.012, elite: true });
  for (let i = 0; i < 5; i++) sivFoe(pv, 0.55 + R() * 0.35, H * (0.12 + R() * 0.76), { hp: 70, sp: 0.02 });
  if (F.has('morning')) for (const e of pv.foes) if (!e.elite) e.drift = (R() < 0.5 ? -1 : 1) * 0.06;
  if (F.has('postp')) sivFoe(pv, 0.95, H * 0.12, { hp: 400, sp: 0.002, spit: true, spitCd: 2.5, bigShot: true });
}
const ddvRep = (pv, m) => m.weak ? 0.2 : pv.F.has('induced') ? 1 : pv.F.has('interest') ? 0.7 : pv.F.has('multi') ? 0.3 : DDV.rep;
function ddvMark(pv, e, o) {
  const F = pv.F;
  if (!e || e.hp <= 0 || e.dying || e.spit) return null;
  const dur = o && o.weak ? 4 : F.has('interest') ? 8 : DDV.dur;
  e.due = Object.assign({ t: dur, max: dur, stored: 0, weak: false, depth: 0 }, o);
  sivRing(pv, e.x, e.y, e.r * 2, BLV_RED, 0.3);
  return e.due;
}
// Damage through the ledger: a marked cell stores what it takes (The Big Day: +50%).
function ddvHurt(pv, e, k, heavy, col) {
  if (e.due && pv.F.has('bigday')) k *= 1.5;
  if (e.due) e.due.stored += Math.min(k, e.hp);
  sivDamage(pv, e, k, heavy, col);
}
function ddvGo(pv, e, why) { // a date goes off (why: 'time' | 'early' | 'death' | 'off')
  const F = pv.F, m = e.due; if (!m) return;
  e.due = null;
  let rep = ddvRep(pv, m);
  const early = why !== 'death' && (m.el || 0) < m.max - 0.1;
  if (early && F.has('early')) rep = 0.5;
  if (pv.rush && !m.weak) { pv.rush.push(pv.t); pv.rush = pv.rush.filter(t => pv.t - t < 1); }
  if (F.has('rush')) { pv.rushL = (pv.rushL || []).filter(t => pv.t - t < 1); pv.rushL.push(pv.t); if (pv.rushL.length >= 3) { rep = 0.4; pv.rushL = []; sivTxt(pv, e.x, e.y - e.r - 0.09, 'RUSH HOUR', SIV_BONK, true); } }
  const k = Math.round(m.stored * rep);
  if (why === 'death') { // bursts out onto its neighbours
    const kk = F.has('compound') ? Math.round(m.stored * 0.25) : k;
    sivTxt(pv, e.x, e.y - e.r - 0.06, 'BURST ' + kk, BLV_RED, true); sivRing(pv, e.x, e.y, 0.12, BLV_RED, 0.4);
    for (const o of sivAlive(pv)) if (o !== e && !o.dying && sivD(o, e) < 0.12) ddvHurt(pv, o, kk, false, BLV_RED);
  } else {
    sivTxt(pv, e.x, e.y - e.r - 0.06, (why === 'off' ? 'MORNING AFTER ' : 'DUE ') + k, BLV_RED, true); sivRing(pv, e.x, e.y, e.r * 3, BLV_RED, 0.45);
    if (k > 0) sivDamage(pv, e, k, true, BLV_RED);
    if (early && F.has('short') && e.hp > 0) { e.stun = 1; sivTxt(pv, e.x + 0.05, e.y - e.r, 'STAGGERED', '#ffffff'); }
    if (F.has('reveal')) { const r = Math.floor(Math.random() * 3); sivTxt(pv, e.x, e.y + e.r + 0.05, ['IT\'S A SHOVE', 'IT\'S A BLEED', 'IT\'S A HEAL'][r], ['#7fd0ff', BLV_RED, BLV_GREEN][r]); if (r === 0) for (const o of sivAlive(pv)) { if (o !== e && sivD(o, e) < 0.12) { const [vx, vy] = fbAway(o, e, 0.4); o.kx += vx; o.ky += vy; } } if (r === 1) lpvBleed(pv, e, 3); if (r === 2) sivTxt(pv, pv.me.x, pv.me.y - 0.06, '+HP', BLV_GREEN); }
    if (e.hp > 0 && F.has('labour')) { ddvMark(pv, e); sivTxt(pv, e.x, e.y - e.r - 0.1, 'LABOUR DAY', SIV_BONK); }
    else if (e.hp > 0 && F.has('fine') && e.elite && (e.fineN || 0) < 2) { e.fineN = (e.fineN || 0) + 1; ddvMark(pv, e); sivTxt(pv, e.x, e.y - e.r - 0.1, 'FINE PRINT', SIV_BONK); }
  }
  // Multiplying Responsibilities: two weaker marks hop to the nearest cells (Pass the Parcel: once more).
  if (F.has('multi') && (!m.weak || (F.has('parcel') && m.depth < 2))) {
    const ts = sivAlive(pv).filter(o => o !== e && !o.dying && !o.due && !o.spit).sort((a, b) => sivD(a, e) - sivD(b, e)).slice(0, 2);
    for (const o of ts) { ddvMark(pv, o, { weak: true, depth: m.depth + 1 }); pv.fx.push({ type: 'line', a: { x: e.x, y: e.y }, b: { x: o.x, y: o.y }, color: BLV_RED, life: 0.4, max: 0.4 }); }
    if (ts.length && m.weak) sivTxt(pv, e.x, e.y - e.r - 0.03, 'PASS THE PARCEL', BLV_RED);
  }
}
function ddvFire(pv) {
  const F = pv.F, me = pv.me;
  let best = null;
  for (const e of sivAlive(pv)) if (!e.dying && !e.spit && sivD(e, me) < pv.range && (!best || e.hp > best.hp)) best = e; // the strongest
  if (!best) return false;
  const marks = sivAlive(pv).filter(e => e.due && !e.due.weak).length, room = F.has('bigday') ? 3 : 1;
  let t = best;
  if (!best.due && marks >= room) t = sivAlive(pv).find(e => e.due && !e.due.weak) || best; // (one mark at a time: keep on it)
  else if (best.due && marks < room && F.has('bigday')) t = sivAlive(pv).filter(e => !e.due && !e.dying && !e.spit && sivD(e, me) < pv.range).sort((a, b) => b.hp - a.hp)[0] || best;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.008;
  fbShot(pv, me.x, me.y, me.a, { dmg: DDV.dmg, r: 0.008, col: BLV_RED, v: 1, range: pv.range + 0.1, only: t });
  return true;
}
function ddvHit(pv, s, e) {
  const F = pv.F;
  if (!e.due && !(F.has('induced') && pv.markCd > 0)) { if (ddvMark(pv, e)) { if (F.has('induced')) pv.markCd = 10; sivTxt(pv, e.x, e.y - e.r - 0.05, 'MARKED', BLV_RED); } }
  else if (e.due && F.has('anyday')) { e.due.t = Math.max(0.01, e.due.t - 0.1); }
  ddvHurt(pv, e, s.dmg, false);
}
function ddvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  fbMe(pv, dt);
  pv.markCd = Math.max(0, pv.markCd - dt);
  blvGun(pv, dt, ddvFire);
  fbStepShots(pv, dt, ddvHit);
  fbOther(pv, dt, (pv, e, k) => ddvHurt(pv, e, k, false, '#8a959a'));
  for (const e of pv.foes) {
    if (e.drift && e.hp > 0) { e.y += e.drift * dt; if (e.y < -0.03 || e.y > H + 0.03) { if (e.due) ddvGo(pv, e, 'off'); e.y = H * 0.5; e.x = 1.02; } }
    if (!e.due) continue;
    if (e.hp <= 0) { ddvGo(pv, e, 'death'); continue; }
    e.due.t -= dt; e.due.el = (e.due.el || 0) + dt; if (e.due.t <= 0) ddvGo(pv, e, 'time');
  }
  // Postponed: a big hit on you comes 2 s later, halved.
  fbSpit(pv, dt, null, (pv, b) => { if (F.has('postp') && !(pv.postCd > pv.t)) { pv.postCd = pv.t + 10; pv.post.push({ t: 2, k: Math.round(b.dmg / 2) }); sivTxt(pv, me.x, me.y - 0.08, 'POSTPONED', SIV_PALE, true); } else sivTxt(pv, me.x, me.y - 0.06, 'OW -' + b.dmg, BLV_SPIT, true); });
  for (const p of pv.post) { p.t -= dt; if (p.t <= 0) sivTxt(pv, me.x, me.y - 0.07, 'OW -' + p.k, BLV_SPIT, true); }
  pv.post = pv.post.filter(p => p.t > 0);
  // Bleed (Gender Reveal) ticks.
  for (const e of sivAlive(pv)) if (e.bl && e.bl.length) { e.bl = e.bl.map(t => t - dt).filter(t => t > 0); e.bacc = (e.bacc || 0) + e.bl.length * 1.6 * dt; if (e.bacc >= 3) { const d = Math.floor(e.bacc); e.bacc -= d; ddvHurt(pv, e, d, false, BLV_RED); } }
  fbStd(pv, dt);
}
function ddvCell(pv, g, e, x, y, r, U) {
  blvSpitCell(g, e, x, y, r); lpvCell(pv, g, e, x, y, r, U);
  const m = e.due; if (!m) return;
  const R = r + 6, k = m.t / m.max; // a red circle with a countdown hand, and the ledger
  g.strokeStyle = BLV_RED; g.lineWidth = m.weak ? 1.2 : 2.2; g.beginPath(); g.arc(x, y, R, 0, TAU); g.stroke();
  g.fillStyle = BLV_RED + '55'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + TAU * k); g.closePath(); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(-Math.PI / 2 + TAU * (1 - k)) * R, y + Math.sin(-Math.PI / 2 + TAU * (1 - k)) * R); g.stroke();
  if (!m.weak) { g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = BLV_RED; g.fillText(Math.round(m.stored) + (pv.F.has('compound') ? '' : ' > ' + Math.round(m.stored * ddvRep(pv, m))), x, y + R + 12); }
}
function ddvOver(pv, g, X, Y, U) {
  fbDrawShots(pv, g, X, Y, U);
  for (const p of pv.pips || []) { g.fillStyle = '#8a959a'; g.beginPath(); g.arc(X(p.x), Y(p.y), U * 0.006, 0, TAU); g.fill(); }
}
function ddvUnder(pv, g, X, Y, U) { fbDrawSpit(pv, g, X, Y, U); }
function ddvMe(pv, g, hx, hy, hr, U) { if (pv.F.has('induced') && pv.markCd > 0) { g.font = `700 ${Math.round(U * 0.024)}px monospace`; g.textAlign = 'center'; g.fillStyle = BLV_RED; g.fillText('next mark ' + pv.markCd.toFixed(0) + 's', hx, hy + hr * 3.6); } }
PV_OWN[DDV.id] = { init: ddvInit, step: ddvStep, draw: sivDraw, flags: DDV_FLAG, wave: ddvWave, under: ddvUnder, over: ddvOver, cell: ddvCell, me: ddvMe };
