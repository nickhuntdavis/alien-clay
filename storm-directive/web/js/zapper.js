'use strict';
// Spawn Prawn - Unwanted Contact fires like the v9 Static Cling zip-zap (user, 26 Oct; table approved in chat).
// Replaces the old 'chain' shot (game.js fireWeapon, doChain) for Unwanted Contact only (s_tesla, and its Switched at
// Birth copy: the one v10 weapon of kind 'chain').
//  - BASE: one quick spark from your head to the target: it can't miss (Evasion aside), deals its damage and Charges a
//    little (every Static hit does). No jumps of its own: jumps from elsewhere (the Chain Letter passive, promise cards:
//    s.chain above the def's base) still chain on from the target, 88% a jump, as doChain did.
//  - RICOCHET: each hit forks the spark to 1 / 2 / 3 new enemies within ZP.fork (70% each); mastery: the forks fork
//    once more. ZP.cap targets a zap at most.
//  - PIERCING: the spark carries on in a straight line through 1 / 3 / 6 enemies behind the target (12 at mastery), 75% each.
//  - HOMING: it never misses anyway, so it picks enemies not yet Charged first (spreads Charge); mastery: enemies already
//    carrying another status first (one hit from an unstable reaction).
//  - AREA: the spark ends in a splash (radius 30 + 15 a rank, 40%).
//  - CHARGED: the generic wind-up and bonus stay (modwide.js mwStats); on top, the bolt is thick and fills Charge in one
//    hit, and at mastery it also zaps every Charged enemy within 200 (50%).
//  - RAPID FIRE mastery: two sparks a zap, at different enemies.
//  Extra Projectiles (s.count, modslice.js msStats), Every Nth, Focused Intensity, Exploding Rounds, Catalyst, Kinship
//  and the rest act through the hits as on any weapon; Delivery modifiers and promise cards take the shot before this
//  (they fire earlier in the 'fire' hooks).
// Hooks: none in shared files. Wraps v10.js v10Fire (loads after laserbeam.js and modslice.js).
const ZP = { off: 0, fork: 140, keepFork: 0.7, keepPierce: 0.75, keepJump: 0.88, width: 16, cap: 12, splash: 0.4 };
const zpIs = w => !!(w && w.def && w.def.v10 && (w.sid === 's_tesla' || w.def.kind === 'chain'));
const zpLive = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
const zpCharged = e => e.chargeT > G.t || !!(e.cd && e.cd.charge > 0);
function zpCol(src) { const el = (src && src.elem) || 'shock'; return (ELEMENTS[el] && ELEMENTS[el].color) || TYPE_PAL.shock; }
// Homing's choice of first target (and of the sparks after it).
function zpPick(w, x, y, R, not) {
  const hr = msR(w, 'homing'), list = [];
  forNear(x, y, R, e => { if (zpLive(e) && !not.has(e)) list.push(e); });
  if (!list.length) return null;
  const d = e => Math.hypot(e.x - x, e.y - y);
  const score = e => d(e) + (hr ? (zpCharged(e) ? 400 : 0) : 0) - (hr >= 4 && typeof chemHas === 'function' && Object.keys(chemHas(e) || {}).some(k => k !== 'shock') ? 600 : 0);
  return list.sort((a, b) => score(a) - score(b))[0];
}
// One spark from (x, y) to e. depth: forks left (Ricochet mastery forks once more).
function zpSpark(w, x, y, e, dmg, src, hit, depth) {
  if (!zpLive(e) || hit.size >= ZP.cap) return;
  hit.add(e);
  const col = zpCol(src), cr = mwR(w, 'charged');
  bolt(x, y, e.x, e.y, col, 0.14); if (cr) bolt(x + 2, y + 2, e.x, e.y, col, 0.18);
  const ex = e.x, ey = e.y;
  damageEnemy(e, dmg, src);
  if (cr && !e.dead) e.chargeT = Math.max(e.chargeT || 0, G.t + 3); // (a charged bolt: Charged in one hit)
  const ar = modCount(w, 'area');
  if (ar) { const R = 30 + 15 * Math.min(4, ar); aoe(ex, ey, R, dmg * ZP.splash, Object.assign({}, src, { noProc: true }), col); ring(ex, ey, R, col, 0.2, 2); }
  const rr = msR(w, 'ricochet');
  if (rr && depth > 0) {
    const n = [0, 1, 2, 3, 3][Math.min(4, rr)];
    for (let i = 0; i < n && hit.size < ZP.cap; i++) { const o = zpPick(w, ex, ey, ZP.fork, hit); if (!o) break; zpSpark(w, ex, ey, o, dmg * ZP.keepFork, src, hit, depth - 1); }
  }
}
function zpPierce(w, x, y, e, dmg, src, hit) {
  const n = [0, 1, 3, 6, 12][Math.min(4, msR(w, 'piercing'))]; if (!n) return;
  const a = Math.atan2(e.y - y, e.x - x), ca = Math.cos(a), sa = Math.sin(a), L = (w.s.range || 300) * 1.2, line = [];
  for (const o of G.enemies) {
    if (!zpLive(o) || hit.has(o)) continue;
    const u = (o.x - x) * ca + (o.y - y) * sa, v = Math.abs(-(o.x - x) * sa + (o.y - y) * ca);
    if (u > Math.hypot(e.x - x, e.y - y) && u < L && v < o.r + ZP.width) line.push({ o, u });
  }
  line.sort((p, q) => p.u - q.u);
  let px = e.x, py = e.y;
  for (const { o } of line.slice(0, n)) { if (hit.size >= ZP.cap) break; hit.add(o); bolt(px, py, o.x, o.y, zpCol(src), 0.14); px = o.x; py = o.y; damageEnemy(o, dmg * ZP.keepPierce, src); }
}
function zpFire(w, target, src) {
  const s = w.s, p = G.player, hit = new Set();
  const n = Math.max(1, s.count || 1) + (modCount(w, 'rapid') >= 4 ? 1 : 0);
  const extraJ = Math.max(0, (s.chain || 0) - ((w.def.base && w.def.base.chain) || 0));
  const depth = modCount(w, 'ricochet') >= 4 ? 2 : 1;
  const firsts = [];
  let t0 = msR(w, 'homing') ? zpPick(w, p.x, p.y, s.range || 300, hit) || target : target;
  if (zpLive(t0)) firsts.push(t0);
  while (firsts.length < n) { const o = zpPick(w, p.x, p.y, s.range || 300, new Set(firsts)); if (!o) break; firsts.push(o); }
  for (const e of firsts) {
    const ex = e.x, ey = e.y;
    zpSpark(w, p.x, p.y, e, s.dmg, src, hit, depth);
    zpPierce(w, p.x, p.y, { x: ex, y: ey }, s.dmg, src, hit);
    if (extraJ && !e.dead) { // jumps from the Chain Letter passive and promise cards, as the old chain did
      let px = ex, py = ey, k = ZP.keepJump;
      for (let j = 0; j < extraJ && hit.size < ZP.cap; j++, k *= ZP.keepJump) {
        const nx = zpPick(w, px, py, s.jump || 140, hit); if (!nx) break;
        hit.add(nx); bolt(px, py, nx.x, nx.y, zpCol(src), 0.14); px = nx.x; py = nx.y;
        damageEnemy(nx, s.dmg * k, Object.assign({}, src, { chainHop: 1 })); // (a jump: no Charge arcs, as doChain)
      }
    }
    if (modCount(w, 'charged') >= 4) forNear(ex, ey, 200, o => { if (zpLive(o) && !hit.has(o) && zpCharged(o) && hit.size < ZP.cap) { hit.add(o); bolt(ex, ey, o.x, o.y, zpCol(src), 0.12); damageEnemy(o, s.dmg * 0.5, src); } });
  }
  if (typeof afterChain === 'function') afterChain(w, [...hit], src);
  sfx('zap');
  return true;
}
v10Fire = (orig => function (w, target, src) {
  if (ZP.off || !zpIs(w) || !target) return orig(w, target, src); // (ZP.off: the old chain, for balance sims)
  return zpFire(w, target, src);
})(v10Fire);
