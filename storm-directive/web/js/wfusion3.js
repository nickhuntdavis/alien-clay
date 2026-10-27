'use strict';
// Spawn Prawn - transforming fusions, the other ten (user, 27 Oct). wfusion2.js rebuilt five pairs; this file rebuilds
// the remaining ten the same way (a new pattern, a new look, a bigger spike). wfusion.js still offers and merges them.
//  - acidmess   Acid Spit + Hot Mess: globs drip a small burning patch every 45 along their flight and splash a big one
//               on hit (40 patches at most).
//  - hotcore    Family Ties + Hot Mess: each black hole burns its core, and when it ends it collapses: a blast (1.6x its
//               pull reach, a x8 + b x4) that leaves a big burning pool.
//  - snotfire   Nocturnal Emission + Hot Mess: the puddles burn, and each one boils over when it ends (1.5x its size,
//               b x1 plus half again for every enemy still stuck in it).
//  - tapezap    Ewww, Gross + Unwanted Contact: taped bundles crackle (every 0.8 s each member takes b x0.2 Static and is
//               Charged), and when a taped enemy dies the tape jumps to the nearest free enemy within 170.
//  - wormsibs   Chest Burster + Sister Cousin: siblings infect what they hit (so more of the dead rise), risen allies spit
//               homing siblings every 0.6 s, and burst into 6 more when they expire.
//  - redlaser   Laser + Red Flagship: whatever the Laser hits splits it into 3 Static beams fanning out behind it (220
//               long, b x0.6).
//  - possessed  Rent Free + Panic Button: every 4th Rent Free hit possesses a plain enemy (4 s); possessed enemies pulse
//               every 1.5 s, and when one dies its possession jumps to the 2 nearest enemies with a big pulse.
//  - gainsneeze Maximum Gains + Enzyme Sneeze: pellets landing within 180 of you pump an enemy; at 4 it ruptures in an
//               acid cone 180 deep behind it (b x3) and leaves an acid patch.
//  - nervepanic Nervous Wreck + Panic Button: each snap pulses (as before) and fills a meter round you; at 6 a meltdown
//               throws everything within 280 (b x3.5) and stuns it for 1 s.
//  - crossbeam  Red Flagship + Soulmate Signal: a live Static beam tethers you to each twin (a x2.5 to anything on it,
//               5 a second), and every twin fires a Red Flagship beam of its own.
// Names and card text: wfcopy.js.
// Hooks: none in shared files. hookOn proc 'wf3:proc', kill 'wf3:kill', tick 'wf3:tick'; wraps modDraw. Loads right
// after wfusion2.js.
const WF3 = {
  acid: { drip: 45, dripR: 26, dripT: 1.5, dripK: 0.9, splashR: 60, splashT: 2.5, splashK: 1.2, cap: 40 },
  nova: { rK: 1.6, aK: 8, bK: 4, poolR: 100, poolT: 3, poolK: 1.2, core: 45, coreK: 1 },
  boil: { burnK: 0.6, k: 1, per: 0.5, rK: 1.5 },
  wire: { every: 0.8, k: 0.2, jump: 170, add: 1.5 },
  brood: { every: 0.6, n: 6, k: 1, spit: 0.8 },
  prism: { n: 3, fan: 0.45, len: 220, k: 0.6, gap: 0.15 },
  ghost: { every: 4, t: 4, pulse: 1.5, jump: 2, reach: 220, r: 140, k: 1.5 },
  pump: { reach: 180, n: 4, depth: 180, cone: 0.6, k: 3 },
  panic: { n: 6, r: 280, k: 3.5, stun: 1 },
  tether: { every: 0.2, k: 2.5, w: 10, beamK: 2.5 }, // (Red Flagship's own hit is a 0.1 s tick, so these are per 0.2 s)
};

// ---------------------------------------------------------------- helpers
// Everything alive within wd of the segment (x1, y1) to (x2, y2).
function wf3Line(x1, y1, x2, y2, wd, fn) {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1;
  for (const e of G.enemies) { if (!wfLive(e)) continue; const k = clamp(((e.x - x1) * dx + (e.y - y1) * dy) / l2, 0, 1); if (Math.hypot(e.x - (x1 + dx * k), e.y - (y1 + dy * k)) < e.r + wd) fn(e); }
}
const wf3Beam = (x, y, x2, y2, c, w, life) => (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x, y, x2, y2, w: w || 8, c, t: 'shock', life: life || 0.12, max: life || 0.12 });
function wf3Zone(B, x, y, r, t, k, elem, tag) {
  if (G.zones.length >= 150) return null;
  const z = { x, y, r, life: t, max: t, dps: B.s.dmg * k, elem, pull: 0, color: B.def.color, tick: 0, src: wfSrc(B, { atk: 'pool', zoneHit: true, elem }) };
  z[tag] = 1; G.zones.push(z); return z;
}
const wf3Sib = (B, x, y, k) => {
  const o = acquire('nearest', 300, x, y), a = o ? Math.atan2(o.y - y, o.x - x) + rand(-0.5, 0.5) : Math.random() * TAU;
  spawnProj(B, x, y, a, wfSrc(B), { r: 4, speed: 330, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, life: 1.4, dmg: B.s.dmg * k, pierce: 0, style: 'sperm', color: B.def.color, bounce: 0, homing: 6, noMods: true });
};
const wf3Acid = () => { let n = 0; for (const z of G.zones) if (z.wf3Acid && z.life > 0) n++; return n; };
// Watch things the game owns (black holes, puddles, risen allies) and call fn once when each one ends.
function wf3Watch(key, list, pick, ended, fn) {
  const W = G[key] || (G[key] = []);
  for (const o of list) if (!o.wf3W && pick(o)) { o.wf3W = 1; W.push(o); }
  if (W.length > 200) W.splice(0, W.length - 200); // (anything cleared some other way never ends: drop the oldest)
  for (let i = W.length - 1; i >= 0; i--) if (ended(W[i])) { const o = W[i]; W.splice(i, 1); fn(o); }
}

// ---------------------------------------------------------------- hits
function wf3Proc(e, src) {
  const w = src && src.w; if (!w || !G || !G.wf || src.wupEcho) return;
  const p = G.player; let F;
  // acidmess: a big splash where the glob lands
  if ((F = wfPair('acidmess')) && w === F.a && wf3Acid() < WF3.acid.cap) { const K = WF3.acid; wf3Zone(F.b, e.x, e.y, K.splashR, K.splashT, K.splashK, 'flame', 'wf3Acid'); }
  // wormsibs: Sister Cousin's siblings infect what they hit, so more of the dead rise
  if ((F = wfPair('wormsibs')) && w === F.b && !e.boss && !(e.parasiteT > 0)) { e.parasiteW = F.a; e.parasiteT = 6; }
  // redlaser: the target splits the Laser into a fan of Static beams behind it
  if ((F = wfPair('redlaser')) && w === F.a && !(e.wf3PrT > G.t)) {
    const K = WF3.prism, a = Math.atan2(e.y - p.y, e.x - p.x), src2 = wfSrc(F.b, { atk: 'beam', elem: 'shock' });
    e.wf3PrT = G.t + K.gap;
    for (let i = 0; i < K.n; i++) {
      const b = a + (i - (K.n - 1) / 2) * K.fan, x2 = e.x + Math.cos(b) * K.len, y2 = e.y + Math.sin(b) * K.len;
      wf3Beam(e.x, e.y, x2, y2, F.b.def.color, 7);
      wf3Line(e.x, e.y, x2, y2, 8, o => { if (o !== e) damageEnemy(o, F.b.s.dmg * K.k, src2); });
    }
  }
  // possessed: every 4th Rent Free hit possesses a plain enemy
  if ((F = wfPair('possessed')) && w === F.a && !e.charmed && ((G.wf3Ghost = (G.wf3Ghost || 0) + 1) % WF3.ghost.every === 0)) curseFoe(e, WF3.ghost.t);
  // gainsneeze: close pellets pump an enemy until it ruptures
  if ((F = wfPair('gainsneeze')) && w === F.a && !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < WF3.pump.reach && (e.wf3Pump = (e.wf3Pump || 0) + 1) >= WF3.pump.n) {
    const K = WF3.pump, a = Math.atan2(e.y - p.y, e.x - p.x), src2 = wfSrc(F.b, { elem: 'fire', atk: 'spread' });
    e.wf3Pump = 0;
    forNear(e.x, e.y, K.depth, o => {
      if (!wfLive(o)) return;
      const d = Math.hypot(o.x - e.x, o.y - e.y), da = Math.abs(((Math.atan2(o.y - e.y, o.x - e.x) - a + Math.PI * 3) % TAU) - Math.PI);
      if (o === e || (d < K.depth + o.r && da < K.cone)) damageEnemy(o, F.b.s.dmg * K.k, src2);
    });
    fxParts('spark', e.x, e.y, F.b.def.color, 16, 320, 0.4, 3, a, K.cone);
    wf3Zone(F.b, e.x + Math.cos(a) * 50, e.y + Math.sin(a) * 50, 50, 2, 0.5, 'fire', 'wf3Acid');
    ring(e.x, e.y, e.r + 16, F.b.def.color, 0.25, 3);
  }
  // nervepanic: each snap pulses and fills the meter
  if ((F = wfPair('nervepanic')) && w === F.a && !(G.wf3SnapT > G.t)) {
    G.wf3SnapT = G.t + 0.15; wfPulse(F.b, e.x, e.y, e);
    if ((G.wf3Panic = (G.wf3Panic || 0) + 1) >= WF3.panic.n) {
      const K = WF3.panic, src2 = wfSrc(F.b, { atk: 'burst', elem: 'phys' });
      G.wf3Panic = 0;
      forNear(p.x, p.y, K.r, o => {
        if (!wfLive(o) || Math.hypot(o.x - p.x, o.y - p.y) > K.r + o.r) return;
        damageEnemy(o, F.b.s.dmg * K.k, src2);
        if (!o.dead && !o.boss) { shove(o, p.x, p.y, 420); o.dazeT = Math.max(o.dazeT || 0, G.t + K.stun); }
      });
      ring(p.x, p.y, K.r, F.b.def.color, 0.5, 7); ring(p.x, p.y, K.r * 0.6, '#ffffff', 0.35, 4);
      cam.shake = Math.min(16, cam.shake + 8); sfx('boom');
    }
  }
}

// ---------------------------------------------------------------- kills
function wf3Kill(e) {
  if (!G || !G.wf) return;
  let F;
  // tapezap: the tape jumps to the nearest free enemy
  if ((F = wfPair('tapezap')) && e.tape && e.tape.w === F.a && e.tape.end > G.t) {
    const T = e.tape; let next = null, bd = WF3.wire.jump;
    forNear(e.x, e.y, WF3.wire.jump, o => { const d = Math.hypot(o.x - e.x, o.y - e.y); if (wfLive(o) && !o.tape && toyCan(o) && d < bd) { bd = d; next = o; } });
    if (next) { T.members.push(next); next.tape = T; T.end = Math.max(T.end, G.t + WF3.wire.add); bolt(e.x, e.y, next.x, next.y, F.b.def.color, 0.25); }
  }
  // possessed: a possessed enemy's death jumps the possession on, with a big pulse
  if ((F = wfPair('possessed')) && e.charmed) {
    const K = WF3.ghost, src2 = wfSrc(F.b, { atk: 'burst', elem: 'phys' });
    forNear(e.x, e.y, K.r, o => { if (o !== e && wfLive(o) && Math.hypot(o.x - e.x, o.y - e.y) < K.r + o.r) { damageEnemy(o, F.b.s.dmg * K.k, src2); if (!o.dead && !o.boss) shove(o, e.x, e.y, 260); } });
    ring(e.x, e.y, K.r, F.b.def.color, 0.35, 5);
    const near = G.enemies.filter(o => o !== e && wfLive(o) && Math.hypot(o.x - e.x, o.y - e.y) < K.reach).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y)).slice(0, K.jump);
    for (const o of near) { bolt(e.x, e.y, o.x, o.y, ELEMENTS.soul.color, 0.25); curseFoe(o, K.t); }
  }
}

// ---------------------------------------------------------------- every frame
function wf3Tick(dt) {
  if (!G || G.state !== 'play' || !G.wf) return;
  let F;
  // acidmess: globs drip burning patches along their flight
  if ((F = wfPair('acidmess'))) {
    const K = WF3.acid;
    for (const pr of G.proj) if (pr.w === F.a && !pr.dead && !pr.lob && !pr.mine) {
      pr.wf3D = (pr.wf3D || 0) + Math.hypot(pr.vx, pr.vy) * dt;
      if (pr.wf3D >= K.drip) { pr.wf3D = 0; if (wf3Acid() < K.cap) wf3Zone(F.b, pr.x, pr.y, K.dripR, K.dripT, K.dripK, 'flame', 'wf3Acid'); }
    }
  }
  // hotcore: black holes burn their core, and collapse into a blast and a burning pool when they end
  if ((F = wfPair('hotcore'))) {
    const K = WF3.nova, A = F.a, B = F.b;
    if (!(G.wf3CoreT > G.t)) {
      G.wf3CoreT = G.t + 0.3;
      for (const pr of G.proj) if (pr.style === 'void' && !pr.dead && pr.w === A) {
        forNear(pr.x, pr.y, K.core, e => { if (wfLive(e) && Math.hypot(e.x - pr.x, e.y - pr.y) < K.core + e.r) damageEnemy(e, B.s.dmg * K.coreK, wfSrc(B, { atk: 'pool', elem: 'flame' })); });
        ring(pr.x, pr.y, K.core, B.def.color, 0.2, 2);
      }
    }
    wf3Watch('wf3Voids', G.proj, pr => pr.style === 'void' && pr.w === A && !pr.dead, pr => pr.dead || pr.life <= 0, pr => {
      const R = (pr.aura || 72) * K.rK, src2 = wfSrc(B, { atk: 'burst', elem: 'flame' });
      forNear(pr.x, pr.y, R, e => { if (wfLive(e) && Math.hypot(e.x - pr.x, e.y - pr.y) < R + e.r) damageEnemy(e, A.s.dmg * K.aK + B.s.dmg * K.bK, src2); });
      wf3Zone(B, pr.x, pr.y, K.poolR, K.poolT, K.poolK, 'flame', 'wf3Nova');
      ring(pr.x, pr.y, R, B.def.color, 0.45, 6); ring(pr.x, pr.y, R * 0.4, '#ffffff', 0.3, 4);
      fxParts('spark', pr.x, pr.y, B.def.color, 20, 260, 0.5, 4);
      cam.shake = Math.min(14, cam.shake + 5); sfx('boom');
    });
  }
  // snotfire: the puddles burn, then boil over when they end
  if ((F = wfPair('snotfire'))) {
    const K = WF3.boil, A = F.a, B = F.b;
    if (!(G.wf3SnotT > G.t)) { // (the burn is noRx: it would set off Mucus + Acid, which wipes the puddle)
      G.wf3SnotT = G.t + 0.5;
      for (const z of G.zones) if (z.life > 0 && z.src && z.src.w === A) {
        forNear(z.x, z.y, z.r, e => { if (wfLive(e) && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) damageEnemy(e, B.s.dmg * K.burnK, wfSrc(B, { atk: 'pool', elem: 'flame', noRx: true })); });
        fxParts('bubble', z.x + rand(-z.r, z.r) * 0.6, z.y + rand(-z.r, z.r) * 0.6, B.def.color, 2, 30, 0.5, 3);
      }
    }
    wf3Watch('wf3Puds', G.zones, z => z.src && z.src.w === A && z.life > 0, z => z.life <= 0, z => {
      let n = 0; for (const e of G.enemies) if (wfLive(e) && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) n++;
      const R = z.r * K.rK, dmg = B.s.dmg * (K.k + K.per * n), src2 = wfSrc(B, { atk: 'burst', elem: 'flame' });
      forNear(z.x, z.y, R, e => { if (wfLive(e) && Math.hypot(e.x - z.x, e.y - z.y) < R + e.r) damageEnemy(e, dmg, src2); });
      ring(z.x, z.y, R, B.def.color, 0.4, 4 + Math.min(4, n));
      fxParts('bubble', z.x, z.y, B.def.color, 8 + n * 2, 160, 0.5, 4);
      if (n >= 3) { cam.shake = Math.min(12, cam.shake + 3); sfx('boom'); }
    });
  }
  // tapezap: taped bundles crackle
  if ((F = wfPair('tapezap')) && !(G.wf3WireT > G.t) && G.toy) {
    G.wf3WireT = G.t + WF3.wire.every;
    const src2 = wfSrc(F.b, { elem: 'shock' });
    for (const T of G.toy.tapes || []) {
      if (T.w !== F.a || !(T.end > G.t)) continue;
      const M = T.members.filter(o => wfLive(o) && o.tape === T);
      for (let i = 0; i < M.length; i++) {
        if (i) bolt(M[i - 1].x, M[i - 1].y, M[i].x, M[i].y, F.b.def.color, 0.15);
        damageEnemy(M[i], F.b.s.dmg * WF3.wire.k, src2);
        if (!M[i].dead) M[i].chargeT = Math.max(M[i].chargeT || 0, G.t + 3);
      }
    }
  }
  // wormsibs: risen allies spit siblings, and burst into more when they expire
  if ((F = wfPair('wormsibs'))) {
    const A = F.a, B = F.b;
    if (!(G.wf3WormT > G.t)) {
      G.wf3WormT = G.t + WF3.brood.every;
      for (const tu of G.turrets) if (tu.w === A && tu.life > 0 && acquire('nearest', 300, tu.x, tu.y)) wf3Sib(B, tu.x, tu.y, WF3.brood.spit);
    }
    wf3Watch('wf3Turs', G.turrets, tu => tu.w === A && tu.life > 0, tu => tu.life <= 0, tu => {
      for (let i = 0; i < WF3.brood.n; i++) wf3Sib(B, tu.x, tu.y, WF3.brood.k);
      ring(tu.x, tu.y, 50, B.def.color, 0.3, 3); fxParts('spark', tu.x, tu.y, B.def.color, 10, 140, 0.4, 3);
    });
  }
  // possessed: possessed enemies pulse
  if ((F = wfPair('possessed')) && !(G.wf3PossT > G.t)) {
    G.wf3PossT = G.t + WF3.ghost.pulse; let n = 0;
    for (const e of G.enemies) if (!e.dead && e.charmed && n < 4) { n++; wfPulse(F.b, e.x, e.y, e); }
  }
  // crossbeam: a live beam to each twin, and every twin fires its own Red Flagship
  if ((F = wfPair('crossbeam')) && !(G.wf3TethT > G.t) && F.b.twins && F.b.twins.length) {
    const K = WF3.tether, A = F.a, p = G.player, src2 = wfSrc(A, { atk: 'beam', elem: 'shock' });
    G.wf3TethT = G.t + K.every;
    for (const t of F.b.twins) {
      wf3Beam(p.x, p.y, t.x, t.y, A.def.color, 6, K.every + 0.02);
      wf3Line(p.x, p.y, t.x, t.y, K.w, e => damageEnemy(e, A.s.dmg * K.k, src2));
      const o = acquire('nearest', 320, t.x, t.y); if (!o) continue;
      wf3Beam(t.x, t.y, o.x, o.y, A.def.color, 8);
      wf3Line(t.x, t.y, o.x, o.y, 8, e => damageEnemy(e, A.s.dmg * K.beamK, src2));
    }
  }
}

hookOn('proc', 'wf3:proc', (e, dmg, src) => wf3Proc(e, src));
hookOn('kill', 'wf3:kill', e => wf3Kill(e));
hookOn('tick', 'wf3:tick', dt => wf3Tick(dt));

// The panic meter: an arc round you that fills with each snap.
modDraw = (orig => function () {
  orig.apply(this, arguments);
  if (!G || !G.wf || !G.wf3Panic || !wfPair('nervepanic')) return;
  const F = wfPair('nervepanic'), p = G.player, k = G.wf3Panic / WF3.panic.n;
  ctx.save(); ctx.strokeStyle = col(F.b.def.color); ctx.lineWidth = 4 * S; ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 34 * S, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 0.85 + (k > 0.7 ? Math.sin(G.t * 30) * 0.15 : 0);
  ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 34 * S, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke();
  ctx.restore();
})(modDraw);
