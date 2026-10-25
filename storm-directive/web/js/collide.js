'use strict';
// Spawn Prawn - Collisions (redesign docs/COMBAT_MATRIX.md 15.3): a body knocked faster than its own base speed is FAST.
// A fast enemy that hits a mate, a wall or one of your ground objects deals collision damage and moves the mate on.
//  - Fast: knockback speed |kx, ky| above max(40, e.speed). Only fast enemies are looked at (cheap).
//  - Enemy against enemy: Force damage to both, h x f, where h is the launching hit (the last knocking hit, e.cdLast, or the
//    Knockback modifier's weapon, e.mwKnW) and f runs 40% at twice base speed to 100% at four times (Knockback branch A
//    ranks 2 and 3 add 20% and 40%). Elites take half, bosses a quarter, Squishy 65%. The struck gets half the striker's
//    speed (Bowling Ball 80%), the striker keeps 30%, and the struck is never faster than the striker was. Bosses, heavy
//    and spongy enemies do not move. A pair collides once per 0.5 s.
//  - Enemy against a wall (campaign levels): damage to it alone, velocity reflected at 30% (Trampoline 60%).
//  - Enemy against one of your mines (modwide 'mine', Nappy and Laser 'pmine'): it goes off (bodies.js bdTrip), no extra damage.
//  - Collision damage is Force, never echo, never knocks, and does not re-trigger Knockback / Primer procs (mwDet).
// Hooks: hookOn('tick', 'cdTick') and hookOn('proc', 'cdProc'); modwide.js mwTick skips its Wall Slam loop when cdOn().
// No other shared-file edits. Loads after bodies.js.

const CD = { gap: 0.5, hitMemory: 1.5, trig: { mine: 60, pmine: 34 } };

const cdOn = () => !!G && !window.V10_OFF;

// Remember the last knocking hit on an enemy (the launching hit of its next collision).
function cdProc(e, dmg, src) {
  if (!cdOn() || !src || !(src.knock > 0) || src.cdHit) return;
  e.cdLast = { dmg, w: src.w, t: G.t };
}
hookOn('proc', 'cdProc', (e, dmg, src, d) => cdProc(e, dmg, src));

// The launching hit of a fast enemy: { dmg, w }.
function cdHit(e) {
  if (e.cdLast && G.t - e.cdLast.t <= CD.hitMemory) return { dmg: e.cdLast.dmg || 0, w: e.cdLast.w };
  if (e.mwKnW && e.mwKnW.s) return { dmg: e.mwKnW.s.dmg || 0, w: e.mwKnW };
  return { dmg: 0, w: null };
}
// How much of the launching hit a collision deals (0.4 at twice base speed, 1 at four times, less below twice).
function cdFrac(k, base, w) {
  const r = k / base;
  let f = r >= 2 ? 0.4 + 0.6 * Math.max(0, Math.min(1, (r - 2) / 2)) : 0.4 * Math.max(0, r - 1);
  if (w && typeof msA === 'function') { if (msA(w, 'knock', 3)) f += 0.4; else if (msA(w, 'knock', 2)) f += 0.2; }
  return f;
}
function cdTake(e) {
  if (e.boss) return 0.25;
  if (e.elite) return 0.5;
  const c = typeof fightCd === 'function' ? fightCd(e) : null;
  return c && c.def === 'squishy' ? 0.65 : 1;
}
const cdBase = e => Math.max(40, e.speed || 0);
const cdWall = (x, y) => !!(G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y));

function cdDamage(e, o, h, f, w) {
  if (!(h > 0) || !w) return;
  const src = Object.assign({}, weaponSrc(w), { elem: 'phys', knock: 0, noCrit: true, wname: 'Collision', cdHit: true, mwDet: true });
  if (e && !e.dead) damageEnemy(e, h * f * cdTake(e), src);
  if (o && !o.dead) damageEnemy(o, h * f * cdTake(o), src);
}
function cdFx(x, y) {
  ring(x, y, 14, '#fff', 0.2, 2);
  if (typeof fxParts === 'function') fxParts('spark', x, y, '#fff', 4, 120, 0.3, 2);
}
const cdPair = (e, o) => (e.cdT && e.cdT.get(o)) || -9;
function cdMark(e, o) { (e.cdT || (e.cdT = new Map())).set(o, G.t); (o.cdT || (o.cdT = new Map())).set(e, G.t); }

function cdTick(dt) {
  if (!cdOn() || G.state !== 'play') return;
  const mines = (typeof bdList === 'function') ? bdList().filter(b => b.kind === 'mine' || b.kind === 'pmine') : [];
  for (const e of G.enemies.slice()) {
    if (e.dead || e.boss || e.egg) continue;
    const k = Math.hypot(e.kx || 0, e.ky || 0), base = cdBase(e);
    if (!(k > base)) continue;
    const hit = cdHit(e), w = hit.w, f = cdFrac(k, base, w);
    // A mate
    const o = msNear(e.x, e.y, e.r + 2, [e]);
    if (o && !o.egg && G.t - cdPair(e, o) >= CD.gap) {
      cdMark(e, o);
      cdDamage(e, o, hit.dmg, f, w);
      let ux = o.x - e.x, uy = o.y - e.y, d = Math.hypot(ux, uy);
      if (d < 0.5) { ux = e.kx; uy = e.ky; d = k; }
      ux /= d; uy /= d;
      const still = o.boss || (o.def && (o.def.heavy || o.def.spongy));
      if (!still) {
        const v = Math.min(k, k * (w && msMa(w, 'knock') === 'A1' ? 0.8 : 0.5));
        let nx = (o.kx || 0) + ux * v, ny = (o.ky || 0) + uy * v, nk = Math.hypot(nx, ny);
        if (nk > k) { nx *= k / nk; ny *= k / nk; } // (never faster than the striker was)
        o.kx = nx; o.ky = ny;
        o.cdLast = { dmg: hit.dmg, w, t: G.t }; // (the launching hit travels on; the speed drop ends the chain)
      }
      e.kx *= 0.3; e.ky *= 0.3;
      cdFx((e.x + o.x) / 2, (e.y + o.y) / 2);
      if (e.dead) continue;
    }
    // A wall (campaign levels)
    if (G.lvl && G.t - (e.cdWallT || -9) >= CD.gap) {
      const nx = e.x + e.kx * dt, ny = e.y + e.ky * dt;
      if (cdWall(nx, ny)) {
        e.cdWallT = G.t;
        cdDamage(e, null, hit.dmg, f, w);
        const s = w && msMa(w, 'knock') === 'B2' ? 0.6 : 0.3, bx = cdWall(nx, e.y), by = cdWall(e.x, ny);
        if (bx || !by) e.kx *= -s; else e.kx *= s;
        if (by || !bx) e.ky *= -s; else e.ky *= s;
        cdFx(nx, ny);
        if (e.dead) continue;
      }
    }
    // Your ground objects
    for (const b of mines) {
      const q = b.o; if (q.gone || q.dead) continue;
      if (Math.hypot(q.x - e.x, q.y - e.y) <= CD.trig[b.kind]) { bdTrip(b); cdFx(q.x, q.y); }
    }
  }
}
hookOn('tick', 'cdTick', dt => cdTick(dt));
