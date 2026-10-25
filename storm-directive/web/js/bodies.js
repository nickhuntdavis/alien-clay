'use strict';
// Spawn Prawn - Bodies (redesign docs/COMBAT_MATRIX.md 15.2): your ground objects are moved by displacement effects as
// enemies are. This batch: gravity wells pull, hold and fling them; knockback blasts scatter them.
//  - A body is { kind: 'mine' | 'pmine' | 'pool', o, w, mass }: 'mine' = Mines Delivery (modwide.js mwS().mines), 'pmine' = a
//    mine in G.proj (Nappy and Laser mines, game.js), 'pool' = one of your pools in G.zones (z.src.w; enemy zones never move,
//    nor do wells-as-pools with z.pull). Mass: mines 0.5, pools 0.25 (an enemy is 1).
//  - Wells (modifiers.js wellTick): a well with wl.bodies pulls bodies within wl.r at the enemy formula x mass, never into a
//    wall. A body within 10 of the centre is held (o.bdHeld = well id). When the well is gone it flings its held bodies
//    outward at wl.pull x mass a second (+50% after a supernova).
//  - Knockback (game.js aoe): an area hit from a weapon with src.knock scatters bodies in the blast by knock x mass, away
//    from its centre (not the mine the blast came from).
//  - Motion: o.bdVx/o.bdVy, integrated each frame with friction (0.9 per 1/60 s) and stopped by walls; mines mid-slide
//    (delivforms.js xdSl) and imploding or sticky mines are left alone. Nothing is created: caps are untouched.
//  - bdTrip(body) sets a body off now (collisions will call it).
// Hooks: wrap-and-replace of wellTick, aoe, mwMineGo and detonateMine; hookOn('tick', 'bdTick'). No shared-file edits.

const BD = { mine: 0.5, pool: 0.25, held: 10, fric: 0.9, stop: 5, novaK: 1.5 };
const BD_K = -60 * Math.log(BD.fric); // (a push of d units of travel is a start speed of d x BD_K, since friction sums to 1 / BD_K)
let bdG = null, bdFrom = null;
const bdHeld = new Map(), bdLast = new Map();

const bdSolid = (x, y) => !!(G && G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y));
function bdReset() { if (bdG !== G) { bdG = G; bdHeld.clear(); bdLast.clear(); bdFrom = null; } }

// One uniform list of your ground bodies.
function bdList() {
  const out = [];
  if (!G) return out;
  if (G.mwS && G.mwS.mines) for (const q of G.mwS.mines) {
    if (q.gone || q.xdSl || q.xdImpT || !q.w) continue;
    out.push({ kind: 'mine', o: q, w: q.w, mass: BD.mine });
  }
  if (G.proj) for (const pr of G.proj) {
    if (!pr.mine || pr.dead || pr.stick || !pr.w) continue;
    out.push({ kind: 'pmine', o: pr, w: pr.w, mass: BD.mine });
  }
  if (G.zones) for (const z of G.zones) {
    if (z.life <= 0 || z.follow || z.pocket || z.pull > 0 || !z.src || !z.src.w) continue;
    out.push({ kind: 'pool', o: z, w: z.src.w, mass: BD.pool });
  }
  return out;
}

// Set a body off now.
function bdTrip(b) {
  if (!G || !b || !b.o) return;
  const o = b.o;
  if (b.kind === 'mine') {
    if (o.gone) return;
    mwMineGo(o);
    if (o.rearm) { o.rearm = 0; o.armed = G.t + 1; } else o.gone = true;
  } else if (b.kind === 'pmine') {
    if (o.dead) return;
    o.dead = true; detonateMine(o);
  } // (a pool is set off by standing in it already)
}

// Push every body within r of (x, y) away from it by dist x mass units of travel. `not` is an object to skip.
function bdPush(x, y, r, dist, not) {
  for (const b of bdList()) {
    const o = b.o; if (o === not) continue;
    const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy);
    if (d > r) continue;
    const a = d < 1 ? Math.random() * TAU : Math.atan2(dy, dx), v = dist * b.mass * BD_K;
    o.bdVx = (o.bdVx || 0) + Math.cos(a) * v; o.bdVy = (o.bdVy || 0) + Math.sin(a) * v;
    if (o.bdHeld) bdRelease(o);
  }
}
function bdRelease(o) { const s = bdHeld.get(o.bdHeld); if (s) s.delete(o); o.bdHeld = 0; }

// Wells: pull and hold.
function bdWell(wl, dt) {
  if (!G || !wl) return;
  bdReset();
  const rec = bdLast.get(wl.id) || { nova: false };
  rec.x = wl.x; rec.y = wl.y; rec.pull = wl.pull;
  if (typeof VOID_MERGE !== 'undefined' && G.novaT && G.novaT - G.t > VOID_MERGE.gap - 0.5) rec.nova = true; // (a supernova just now)
  bdLast.set(wl.id, rec);
  if (!wl.bodies) return;
  const held = bdHeld.get(wl.id) || new Set(); bdHeld.set(wl.id, held);
  for (const b of bdList()) {
    const o = b.o;
    if (o.bdHeld && o.bdHeld !== wl.id) continue; // (another well has it)
    const dx = wl.x - o.x, dy = wl.y - o.y, d = Math.hypot(dx, dy);
    if (o.bdHeld === wl.id) continue; // (held: stays put)
    if (d > wl.r) continue;
    if (d <= BD.held) { o.bdHeld = wl.id; o.bdMass = b.mass; o.bdVx = o.bdVy = 0; o.bdOut = d > 0.5 ? Math.atan2(-dy, -dx) : Math.random() * TAU; held.add(o); continue; }
    const f = wl.pull / (wl.r / 12) * dt * b.mass, m = Math.min(d, f), nx = o.x + dx / d * m, ny = o.y + dy / d * m;
    if (bdSolid(nx, ny)) continue;
    o.bdOut = Math.atan2(-dy, -dx);
    o.x = nx; o.y = ny;
    if (Math.hypot(wl.x - nx, wl.y - ny) <= BD.held) { o.bdHeld = wl.id; o.bdMass = b.mass; o.bdVx = o.bdVy = 0; held.add(o); }
  }
}

// Every frame: fling what a vanished well held, then integrate the velocities.
function bdTick(dt) {
  if (!G) return;
  bdReset();
  if (bdHeld.size) {
    const live = new Set(typeof modS === 'function' ? modS().wells.map(q => q.id) : []);
    for (const [id, set] of [...bdHeld]) {
      if (live.has(id)) continue;
      const rec = bdLast.get(id) || { pull: 300, nova: false };
      for (const o of set) {
        o.bdHeld = 0;
        if (o.gone || o.dead) continue;
        const mass = o.bdMass || BD.mine;
        const v = rec.pull * mass * (rec.nova ? BD.novaK : 1), a = o.bdOut != null ? o.bdOut : Math.random() * TAU;
        o.bdVx = Math.cos(a) * v; o.bdVy = Math.sin(a) * v;
      }
      bdHeld.delete(id); bdLast.delete(id);
    }
  }
  const k = Math.pow(BD.fric, dt * 60);
  for (const b of bdList()) {
    const o = b.o;
    if (!o.bdVx && !o.bdVy) continue;
    if (o.bdHeld) { o.bdVx = o.bdVy = 0; continue; }
    const nx = o.x + o.bdVx * dt, ny = o.y + o.bdVy * dt;
    if (bdSolid(nx, ny)) o.bdVx = o.bdVy = 0; else { o.x = nx; o.y = ny; }
    o.bdVx *= k; o.bdVy *= k;
    if (Math.hypot(o.bdVx, o.bdVy) < BD.stop) o.bdVx = o.bdVy = 0;
  }
}

// ---------------------------------------------------------------- the wraps
{
  const _wellTick0 = wellTick;
  wellTick = function (wl, dt) { _wellTick0(wl, dt); bdWell(wl, dt); };
  const _aoe0 = aoe;
  aoe = function (x, y, r, dmg, src, color) {
    const out = _aoe0(x, y, r, dmg, src, color);
    if (G && src && src.w && src.knock > 0) bdPush(x, y, r, src.knock, bdFrom);
    return out;
  };
  const _mine0 = mwMineGo;
  mwMineGo = function (q) { const was = bdFrom; bdFrom = q; try { return _mine0(q); } finally { bdFrom = was; } };
  const _det0 = detonateMine;
  detonateMine = function (pr) { const was = bdFrom; bdFrom = pr; try { return _det0(pr); } finally { bdFrom = was; } };
}
hookOn('tick', 'bdTick', dt => bdTick(dt));
