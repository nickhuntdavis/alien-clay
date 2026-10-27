'use strict';
// Spawn Prawn - six new fusion pairs (user, 27 Oct), built as transforming fusions like wfusion2.js and wfusion3.js. They
// join WF_LIST, so wfusion.js offers and merges them like the first fifteen. Enzyme Headbutt and Spark of Life had no
// fusion before.
//  - ram      Enzyme Headbutt + Skill Issue: every 3rd headbutt launches the enemy away from you as a living cannonball
//             (650 for 0.45 s): it hits everything it flies through (b x3) and splashes where it lands (90, b x3).
//  - reaper   Spark of Life + Acid Spit: a Spark or Acid Spit kill jumps the beam to the nearest enemy within 170 (a x14)
//             and leaves an acid splash there; its kills jump again (10 jumps a chain).
//  - reel     Red Flagship + Nervous Wreck: beam hits drag enemies towards you, and each snap fires a Force beam 320 long
//             straight through the snapped enemy (b x1.5 to everything on it).
//  - voodoo   Little Prick + Rent Free: every 4th Rent Free hit possesses a plain enemy (5 s), and every 0.6 s each
//             possessed enemy (4 at most) fires 3 Little Prick needles at its nearest mates (a x0.8; they Bleed).
//  - eggbomb  Eggs + Nappy Mines: an egg goes off when an enemy grabs it (130, b x3.5).
//  - peekhole Peekaboo + Family Ties: vanishing leaves a black hole where you were (pull 300, reach 150, 2.2 s) that
//             implodes at the end (150, b x4 + a x1).
// Names and card text: wfcopy.js.
// Hooks: none in shared files. hookOn proc 'wf4:proc', kill 'wf4:kill', tick 'wf4:tick'; wraps toothTaken, peekFire.
// Loads right after wfusion3.js.
const WF4_LIST = [
  { id: 'ram', a: 'acro_cap', b: 's_lard' },
  { id: 'reaper', a: 'acro_spark', b: 'v_fire_proj' },
  { id: 'reel', a: 'v_shock_beam', b: 'v_phys_contact' },
  { id: 'voodoo', a: 'v_arcane_proj', b: 'v_soul_proj' },
  { id: 'eggbomb', a: 's_toothfairy', b: 's_mines' },
  { id: 'peekhole', a: 's_peekaboo', b: 's_void' },
];
for (const f of WF4_LIST) { WF_LIST.push(f); WF_BY[f.id] = f; }
const WF4 = {
  ram: { every: 3, v: 650, t: 0.45, hitK: 3, landR: 90, landK: 3 },
  reap: { reach: 170, k: 14, jumps: 10, gap: 0.06, splashR: 45, splashT: 1.5, splashK: 1.2 },
  reel: { pull: 18, near: 70, len: 320, w: 12, k: 1.5, gap: 0.2 },
  voodoo: { every: 4, t: 5, rate: 0.6, max: 4, n: 3, k: 0.8 },
  egg: { r: 130, k: 3.5 },
  hole: { t: 2.2, aura: 150, pull: 300, r: 22, bK: 4, aK: 1 },
};

// ---------------------------------------------------------------- hits
function wf4Proc(e, src) {
  const w = src && src.w; if (!w || !G || !G.wf || src.wupEcho) return;
  const p = G.player; let F;
  // ram: every 4th headbutt launches the enemy
  if ((F = wfPair('ram')) && w === F.a && !e.dead && !e.boss && !e.rival && !e.egg && (G.wf4Ram = (G.wf4Ram || 0) + 1) % WF4.ram.every === 0) {
    const K = WF4.ram, a = Math.atan2(e.y - p.y, e.x - p.x);
    e.wf4Fly = { vx: Math.cos(a) * K.v, vy: Math.sin(a) * K.v, end: G.t + K.t, hit: new Set([e]), F };
    ring(e.x, e.y, e.r + 14, F.b.def.color, 0.25, 4); cam.shake = Math.min(10, cam.shake + 2); sfx('shot');
  }
  // reel: the beam drags enemies in
  if ((F = wfPair('reel')) && w === F.a && !e.dead && !e.boss && !e.rival && Math.hypot(e.x - p.x, e.y - p.y) > WF4.reel.near) shove(e, 2 * e.x - p.x, 2 * e.y - p.y, WF4.reel.pull);
  // reel: each snap fires a Force beam straight through the crowd
  if ((F = wfPair('reel')) && w === F.b && !(G.wf4ReelT > G.t)) {
    const K = WF4.reel, a = Math.atan2(e.y - p.y, e.x - p.x), x2 = p.x + Math.cos(a) * K.len, y2 = p.y + Math.sin(a) * K.len, src2 = wfSrc(F.b, { atk: 'beam', elem: 'phys' });
    G.wf4ReelT = G.t + K.gap;
    wf3Beam(p.x, p.y, x2, y2, '#ffffff', 10, 0.15);
    wf3Line(p.x, p.y, x2, y2, K.w, o => damageEnemy(o, F.b.s.dmg * K.k, src2));
  }
  // voodoo: every 4th Rent Free hit possesses
  if ((F = wfPair('voodoo')) && w === F.b && !e.charmed && ((G.wf4Voo = (G.wf4Voo || 0) + 1) % WF4.voodoo.every === 0)) curseFoe(e, WF4.voodoo.t);
}

// ---------------------------------------------------------------- kills
function wf4Kill(e, src) {
  const F = wfPair('reaper'); if (!F || !src || !G) return;
  if (src.w !== F.a && src.w !== F.b && !src.wf4Reap) return;
  const K = WF4.reap, n = src.wf4Reap || 0; if (n >= K.jumps) return;
  let o = null, bd = K.reach;
  forNear(e.x, e.y, K.reach, q => { const d = Math.hypot(q.x - e.x, q.y - e.y); if (q !== e && wfLive(q) && d < bd) { bd = d; o = q; } });
  if (!o) return;
  const x = e.x, y = e.y;
  after(K.gap, () => {
    if (!wfLive(o) || !wfPair('reaper')) return;
    wf3Beam(x, y, o.x, o.y, F.a.def.color, 9, 0.15);
    wf3Zone(F.b, o.x, o.y, K.splashR, K.splashT, K.splashK, 'fire', 'wf4Acid');
    damageEnemy(o, F.a.s.dmg * K.k, wfSrc(F.a, { wf4Reap: n + 1 }));
  });
}

// ---------------------------------------------------------------- every frame
function wf4Tick(dt) {
  if (!G || G.state !== 'play' || !G.wf) return;
  let F;
  // ram: cannonballs in flight
  for (const e of G.enemies) {
    const Fl = e.wf4Fly; if (!Fl) continue;
    const B = Fl.F.b, K = WF4.ram;
    if (e.dead) { e.wf4Fly = null; continue; }
    if (G.t > Fl.end) {
      e.wf4Fly = null;
      const src2 = wfSrc(B, { atk: 'burst', elem: 'phys' });
      forNear(e.x, e.y, K.landR, o => { if (wfLive(o) && Math.hypot(o.x - e.x, o.y - e.y) < K.landR + o.r) damageEnemy(o, B.s.dmg * K.landK, src2); });
      ring(e.x, e.y, K.landR, B.def.color, 0.35, 5); fxParts('spark', e.x, e.y, B.def.color, 10, 180, 0.4, 3);
      continue;
    }
    e.x += Fl.vx * dt; e.y += Fl.vy * dt;
    fxParts('spark', e.x, e.y, B.def.color, 1, 40, 0.3, 2);
    forNear(e.x, e.y, e.r + 6, o => { if (o === e || Fl.hit.has(o) || !wfLive(o)) return; Fl.hit.add(o); damageEnemy(o, B.s.dmg * K.hitK, wfSrc(B, { elem: 'phys' })); if (!o.dead) shove(o, e.x, e.y, 220); });
  }
  // voodoo: possessed enemies fire needles at their mates
  if ((F = wfPair('voodoo')) && !(G.wf4VooT > G.t)) {
    const K = WF4.voodoo, A = F.a; G.wf4VooT = G.t + K.rate; let m = 0;
    for (const e of G.enemies) {
      if (e.dead || !e.charmed || m >= K.max) continue; m++;
      const T = G.enemies.filter(o => o !== e && wfLive(o) && Math.hypot(o.x - e.x, o.y - e.y) < 300).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y)).slice(0, K.n);
      for (const o of T) { const a = Math.atan2(o.y - e.y, o.x - e.x); spawnProj(A, e.x, e.y, a, weaponSrc(A), { dmg: A.s.dmg * K.k, wf4Voo: 1, noMods: true }); }
      if (T.length) ring(e.x, e.y, e.r + 8, A.def.color, 0.2, 2);
    }
  }
  // peekhole: the black hole implodes at the end
  const H = G.wf4Hole;
  if (H && G.t >= H.end) {
    G.wf4Hole = null;
    if ((F = wfPair('peekhole'))) {
      const K = WF4.hole, src2 = wfSrc(F.b, { atk: 'burst', elem: 'soul' });
      forNear(H.x, H.y, K.aura, e => { if (wfLive(e) && Math.hypot(e.x - H.x, e.y - H.y) < K.aura + e.r) damageEnemy(e, F.b.s.dmg * K.bK + F.a.s.dmg * K.aK, src2); });
      ring(H.x, H.y, K.aura, F.b.def.color, 0.5, 6); ring(H.x, H.y, K.aura * 0.4, '#ffffff', 0.3, 4);
      fxParts('spark', H.x, H.y, F.b.def.color, 20, 260, 0.5, 4);
      cam.shake = Math.min(14, cam.shake + 6); sfx('boom');
    }
  }
}

hookOn('proc', 'wf4:proc', (e, dmg, src) => wf4Proc(e, src));
hookOn('kill', 'wf4:kill', (e, src) => wf4Kill(e, src));
hookOn('tick', 'wf4:tick', dt => wf4Tick(dt));

(function wf4Wrap() {
  // eggbomb: a grabbed egg goes off
  const tt = toothTaken;
  toothTaken = function (t, e) {
    const r = tt.apply(this, arguments), F = wfPair('eggbomb');
    if (F && t && t.w === F.a) aoe(t.x, t.y, WF4.egg.r, F.b.s.dmg * WF4.egg.k, wfSrc(F.b, { atk: 'burst', elem: 'flame' }), F.b.def.color);
    return r;
  };
  // peekhole: vanishing leaves a black hole where you were
  const pf = peekFire;
  peekFire = function (w) {
    const r = pf.apply(this, arguments), F = wfPair('peekhole');
    if (F && w === F.a && !w.echo && G.peek && G.peek.w === w && !(G.wf4Hole && G.wf4Hole.end > G.t)) {
      const K = WF4.hole, x = G.peek.x, y = G.peek.y;
      spawnProj(F.b, x, y, 0, wfSrc(F.b), { vx: 0, vy: 0, speed: 0, life: K.t, r: K.r, style: 'void', aura: K.aura, pull: K.pull, pierce: 99, dmg: F.b.s.dmg, homing: 0, bounce: 0, boomerang: 0, noMods: true });
      G.wf4Hole = { x, y, end: G.t + K.t };
    }
    return r;
  };
})();
