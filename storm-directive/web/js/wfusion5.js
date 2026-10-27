'use strict';
// Spawn Prawn - six more fusion pairs (user, 27 Oct), transforming fusions like wfusion2.js to wfusion4.js, for weapons
// that had only one fusion. They join WF_LIST, so wfusion.js offers and merges them.
//  - lens     Standard Issue + Blowing Bubbles: a Standard Issue bullet that passes through (or 14 from) a bubble carries
//             on and throws 2 more out either side (a x0.8 each, 0.45 off its line); a bullet splits once. A Standard Issue hit on
//             a trapped enemy pops its bubble at full size (held 3 s, x1.5) and throws 2 more bullets.
//  - bundle   Maximum Gains + Ewww, Gross: a pellet on a taped enemy drags the rest of its bundle towards it and 40% of
//             the hit lands on each of them (6 at most).
//  - brood2   Nocturnal Emission + Chest Burster: puddles infect what they snare (so the dead rise as allies), and risen
//             allies fire twice as fast and leave a small puddle where they stand every 2 s.
//  - sneeze   Enzyme Sneeze + Soulmate Signal: every twin sneezes Enzyme Sneeze's volley at what is within 240 of it, on
//             Enzyme Sneeze's own cooldown (a x4, no knockback: it pushed the crowd off the twin's beam).
//  - induce   Spark of Life + One of These Days: a Spark hit on a countdown ends it at once with double what it owed, and
//             the payout splashes 60% onto everything within 140.
//  - ambush   Enzyme Headbutt + Peekaboo: headbutts while you are vanished hit x3 and Fear everything within 140, and
//             the BOO headbutts everything within 160 (a x2.5).
// Hooks: none in shared files. hookOn proc 'wf5:proc', dmgMul 'wf5:ambush', hit:before 'wf5:lens', tick 'wf5:tick'; wraps duePop, peekBoo. Loads right after wfusion4.js.
const WF5_LIST = [
  { id: 'lens', a: 'v_phys_proj', b: 's_bubble' },
  { id: 'bundle', a: 'v_phys_spread', b: 's_redtape' },
  { id: 'brood2', a: 'v_ice_pool', b: 's_parasite' },
  { id: 'sneeze', a: 'acro_spray', b: 's_twin' },
  { id: 'induce', a: 'acro_spark', b: 's_duedate' },
  { id: 'ambush', a: 'acro_cap', b: 's_peekaboo' },
];
for (const f of WF5_LIST) { WF_LIST.push(f); WF_BY[f.id] = f; }
const WF5 = {
  lens: { n: 2, fan: 0.45, k: 0.8, catch: 14, boost: 1.5 },
  sneeze: { reach: 240, k: 4 },
  bundle: { pull: 160, share: 0.4, max: 6 },
  brood: { every: 0.5, drop: 2, r: 40, t: 2.5, k: 0.5 },
  induce: { k: 2, r: 140, splash: 0.6 },
  ambush: { k: 3, r: 140, fear: 1.5, booR: 160, booK: 2.5 },
};

function wf5Proc(e, dmg, src) {
  const w = src && src.w; if (!w || !G || !G.wf || src.wupEcho) return;
  let F;
  // bundle: the pellet drags the bundle together and shares the hit
  if ((F = wfPair('bundle')) && w === F.a && e.tape && e.tape.end > G.t && !e.dead) {
    const K = WF5.bundle, src2 = wfSrc(F.a, { elem: 'phys' }); let n = 0;
    for (const o of e.tape.members) {
      if (o === e || !wfLive(o) || o.tape !== e.tape || n >= K.max) continue; n++;
      if (!o.boss && !o.rival) shove(o, 2 * o.x - e.x, 2 * o.y - e.y, K.pull);
      damageEnemy(o, dmg * K.share, src2);
    }
  }
  // induce: the Spark brings the countdown forward
  if ((F = wfPair('induce')) && w === F.a && e.due && !e.due.wf5Ind && e.due.w === F.b) {
    const D = e.due; D.wf5Ind = 1; D.stored *= WF5.induce.k; D.end = G.t;
    ring(e.x, e.y, e.r + 20, F.b.def.color, 0.3, 4); fxParts('spark', e.x, e.y, F.a.def.color, 8, 160, 0.3, 2);
  }
  // ambush: a headbutt from hiding Fears the crowd
  if ((F = wfPair('ambush')) && w === F.a && typeof peekHidden === 'function' && peekHidden() && !(G.wf5AmbT > G.t)) {
    const K = WF5.ambush; G.wf5AmbT = G.t + 0.3;
    forNear(e.x, e.y, K.r, o => { if (wfLive(o) && !o.boss) o.fearT = Math.max(o.fearT || 0, G.t + K.fear); });
    ring(e.x, e.y, K.r, F.b.def.color, 0.35, 5); cam.shake = Math.min(10, cam.shake + 3);
  }
}
function wf5Mul(e, src) {
  const F = src && src.w && wfPair('ambush');
  return F && src.w === F.a && typeof peekHidden === 'function' && peekHidden() ? WF5.ambush.k : 1;
}
// sneeze: every twin sneezes the volley at its nearest enemy, on Enzyme Sneeze's own cooldown
function wf5Sneeze() {
  const F = wfPair('sneeze'); if (!F || !F.b.twins || !F.b.twins.length || G.wf5SnT > G.t) return;
  G.wf5SnT = G.t + Math.max(0.3, F.a.s.cd || 0.8);
  const A = F.a, n = Math.max(1, A.s.count || 1), sp = A.s.spread || 0.5;
  for (const t of F.b.twins) {
    const o = acquire('nearest', WF5.sneeze.reach, t.x, t.y); if (!o) continue;
    const a = Math.atan2(o.y - t.y, o.x - t.x);
    for (let i = 0; i < n; i++) spawnProj(A, t.x, t.y, a + (n > 1 ? (i / (n - 1) - 0.5) * sp : 0), Object.assign(weaponSrc(A), { knock: 0 }), { wf5Sn: 1, dmg: A.s.dmg * WF5.sneeze.k, noMods: true }); // (no knock: it pushed the crowd off the twin's beam)
    fxParts('spark', t.x, t.y, A.def.color, 4, 90, 0.25, 2, a, 0.5);
  }
}
function wf5Tick(dt) {
  if (!G || G.state !== 'play' || !G.wf) return;
  let F;
  wf5Sneeze();
  // lens: bullets split in bubbles
  if ((F = wfPair('lens')) && G.toy && G.toy.bubbles.length) {
    const K = WF5.lens, A = F.a;
    for (let i = G.proj.length - 1; i >= 0; i--) {
      const pr = G.proj[i];
      if (pr.w !== A || pr.dead || pr.wf5Lens) continue;
      const b = G.toy.bubbles.find(q => !q.dead && Math.hypot(q.x - pr.x, q.y - pr.y) < q.r + K.catch);
      if (!b) continue;
      pr.wf5Lens = 1;
      const a = Math.atan2(pr.vy, pr.vx), sp = Math.hypot(pr.vx, pr.vy) || A.s.speed || 500;
      for (let j = 0; j < K.n; j++) {
        const c = a + (j ? 1 : -1) * K.fan;
        const q = spawnProj(A, b.x, b.y, c, pr.src || weaponSrc(A), { vx: Math.cos(c) * sp, vy: Math.sin(c) * sp, dmg: (pr.dmg || A.s.dmg) * K.k, wf5Lens: 1, noMods: true });
        if (q) q.wf5Lens = 1;
      }
      ring(b.x, b.y, b.r + 4, A.def.color, 0.2, 2); // (the bullet itself carries on, so a trapped enemy's bubble still pops)
    }
  }
  // brood2: puddles infect, and risen allies leave puddles
  if ((F = wfPair('brood2')) && !(G.wf5BroodT > G.t)) {
    const K = WF5.brood, A = F.a, B = F.b; G.wf5BroodT = G.t + K.every;
    for (const z of G.zones) if (z.life > 0 && z.src && z.src.w === A) forNear(z.x, z.y, z.r, e => { if (wfLive(e) && !e.boss && !(e.parasiteT > 0) && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) { e.parasiteW = B; e.parasiteT = 6; } });
    for (const tu of G.turrets) if (tu.w === B && !tu.wf5Fast) { tu.wf5Fast = 1; tu.rate *= 0.5; }
    for (const tu of G.turrets) if (tu.w === B && tu.life > 0 && !(tu.wf5Drop > G.t)) { tu.wf5Drop = G.t + K.drop; wf3Zone(A, tu.x, tu.y, K.r, K.t, K.k, 'ice', 'wf5Pud'); }
  }
}

hookOn('proc', 'wf5:proc', (e, dmg, src) => wf5Proc(e, dmg, src));
hookOn('dmgMul', 'wf5:ambush', (e, src) => wf5Mul(e, src));
hookOn('tick', 'wf5:tick', dt => wf5Tick(dt));
// lens: a Standard Issue hit on a trapped enemy pops its bubble at full size, and the bullet splits
hookOn('hit:before', 'wf5:lens', (e, dmg, src) => {
  const F = src && src.w && wfPair('lens'); if (!F || src.w !== F.a || !(e.bubT > G.t) || !G.toy) return false;
  const b = G.toy.bubbles.find(q => !q.dead && (q.e === e || (q.extra && q.extra.includes(e)))); if (!b || b.wf5Big) return false;
  b.wf5Big = 1; b.heldAt = G.t - 3; b.boost = Math.max(b.boost || 1, WF5.lens.boost);
  const A = F.a, a = Math.atan2(e.y - G.player.y, e.x - G.player.x);
  for (const d of [-WF5.lens.fan, WF5.lens.fan]) { const q = spawnProj(A, b.x, b.y, a + d, weaponSrc(A), { dmg: A.s.dmg * WF5.lens.k, wf5Lens: 1, noMods: true }); if (q) q.wf5Lens = 1; }
  return false;
});

// induce: the induced payout splashes onto the neighbours
duePop = (orig => function (e) {
  const D = e && e.due, F = wfPair('induce');
  const dmg = D && D.wf5Ind && F && D.w && D.w.s ? D.stored * D.w.s.repeat + D.w.s.dmg * 3 : 0;
  const r = orig.apply(this, arguments);
  if (dmg > 0) {
    const K = WF5.induce, src2 = wfSrc(F.b, { elem: 'arcane', atk: 'burst' });
    forNear(e.x, e.y, K.r, o => { if (o !== e && wfLive(o) && Math.hypot(o.x - e.x, o.y - e.y) < K.r + o.r) damageEnemy(o, dmg * K.splash, src2); });
    ring(e.x, e.y, K.r, F.a.def.color, 0.4, 5);
  }
  return r;
})(duePop);

// ambush: the BOO headbutts everything near you
peekBoo = (orig => function (w, x, y, minLook, quiet) {
  const r = orig.apply(this, arguments), F = wfPair('ambush');
  if (F && w === F.b && !w.echo && G.player) {
    const K = WF5.ambush, p = G.player, src2 = weaponSrc(F.a);
    forNear(p.x, p.y, K.booR, e => { if (wfLive(e) && Math.hypot(e.x - p.x, e.y - p.y) < K.booR + e.r) damageEnemy(e, F.a.s.dmg * K.booK, src2); });
    ring(p.x, p.y, K.booR, F.a.def.color, 0.35, 5);
  }
  return r;
})(peekBoo);
