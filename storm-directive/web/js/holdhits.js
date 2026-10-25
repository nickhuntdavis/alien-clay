'use strict';
// Spawn Prawn - Objects hold hits (redesign docs/COMBAT_MATRIX.md 15.4): your ground objects store the last hit your attacks
// land on them and relay it when they go off. This batch: mines only (modwide.js Mines Delivery and the Nappy and Laser mines
// in G.proj); hits from blasts, shots and your pools (beams, pools and eggs later).
//  - o.hh = { dmg, elem, w, t }: one per object, the newest replaces. Dot, echo, reaction, arc and relayed hits are not stored,
//    nor is a hit with no weapon. A mine's own weapon's blast never stores into a neighbour while it goes off.
//  - Stored from: aoe (every blast and pool-tick area hit), your shots overlapping a mine (once per shot), your pools (every 0.5 s).
//  - hhDeliver: after a mine's own blast, the stored hit goes off at the mine's spot at its damage and type, as a hit from the
//    weapon that made it ("(relayed)"). It is spent; a relay never arcs, chains or knocks (noArc, hh), and does not store.
//    The type applies its status as for an enemy (Fire burns, Mucus snares, Acid corrodes, Static charges).
//  - Charged mine (stored Static hit under 3 s old): an arc node. fightArc jumps to it, refreshes the hold, the mine takes
//    nothing and passes the arc on at full strength; the jump counts against the 3.
//  - A small ring marks a mine that holds a hit.
// Hooks: wrap-and-replace of aoe, mwMineGo, detonateMine and fightArc; hookOn('tick', 'hhTick'). No shared-file edits.

const HH_DECAY = 3, HH_BODY_R = 14;
let hhDelivering = null, hhGoing = null;

const hhMines = () => (typeof bdList === 'function' && G ? bdList().filter(b => b.kind === 'mine' || b.kind === 'pmine') : []);
const hhCharged = o => !!(o.hh && o.hh.elem === 'shock' && G.t - o.hh.t < HH_DECAY);
const hhColor = (elem, w) => (typeof ELEMENTS !== 'undefined' && ELEMENTS[elem] && ELEMENTS[elem].color) || (w && w.def && w.def.color) || '#fff';

// Store a hit on a body (one per object; the newest replaces).
function hhStore(body, dmg, src) {
  if (!G || !body || !body.o || !src || !src.w || src.dot || src.echo || src.rx || src.arc || src.hh) return;
  if (hhDelivering) return;
  if (hhGoing && (body.o === hhGoing.o || src.w === hhGoing.w)) return; // (a mine's own blast does not store itself in its neighbours)
  if (!(dmg > 0)) return;
  body.o.hh = { dmg, elem: src.elem || 'phys', w: src.w, t: G.t };
}

// Deliver the stored hit after the mine's own blast.
function hhDeliver(o, kind) {
  if (!G || !o || !o.hh) return;
  const h = o.hh; o.hh = null;
  if (!h.w || !h.w.def) return;
  const r = kind === 'mine' ? 60 * (o.big > 1 ? 2 : 1) : (o.w && o.w.s && o.w.s.explode) || 60;
  const src = Object.assign({}, weaponSrc(h.w), { elem: h.elem, hh: true, noArc: true, knock: 0, wname: (h.w.def.name || 'Weapon') + ' (relayed)' });
  const was = hhDelivering; hhDelivering = o;
  try { aoe(o.x, o.y, r, h.dmg, src, hhColor(h.elem, h.w)); } finally { hhDelivering = was; }
}

function hhTick(dt) {
  if (!G || G.state !== 'play' || typeof bdList !== 'function') return;
  const bodies = hhMines(); if (!bodies.length) return;
  // (b) your shots overlapping a mine
  if (G.proj) for (const pr of G.proj) {
    if (pr.dead || pr.mine || pr.lob || !pr.src || !pr.src.w) continue;
    for (const b of bodies) {
      const o = b.o; if (Math.hypot(o.x - pr.x, o.y - pr.y) >= HH_BODY_R + (pr.r || 0)) continue;
      const seen = pr.hhSeen || (pr.hhSeen = new Set());
      if (seen.has(o)) continue; seen.add(o);
      hhStore(b, pr.dmg != null ? pr.dmg : pr.src.w.s ? pr.src.w.s.dmg : 0, pr.src);
    }
  }
  // (c) your pools, a hit every 0.5 s
  if (G.zones) for (const z of G.zones) {
    if (!(z.life > 0) || !z.src || !z.src.w || !(z.dps > 0)) continue;
    for (const b of bodies) {
      const o = b.o; if (Math.hypot(o.x - z.x, o.y - z.y) > z.r) continue;
      if (o.hhPoolT > G.t) continue; o.hhPoolT = G.t + 0.5;
      hhStore(b, z.dps * 0.5, z.src);
    }
  }
  // the mark
  for (const b of bodies) {
    const o = b.o; if (!o.hh || o.hhMarkT > G.t) continue; o.hhMarkT = G.t + 0.5;
    ring(o.x, o.y, 10, hhColor(o.hh.elem, o.hh.w), 0.3, 2);
  }
}

// ---------------------------------------------------------------- the wraps
{
  const _aoe0 = aoe;
  aoe = function (x, y, r, dmg, src, color) {
    const out = _aoe0(x, y, r, dmg, src, color);
    if (G && src && src.w && !hhDelivering && typeof bdList === 'function') for (const b of hhMines()) if (Math.hypot(b.o.x - x, b.o.y - y) <= r) hhStore(b, dmg, src);
    return out;
  };
  const _mine0 = mwMineGo;
  mwMineGo = function (q) {
    const was = hhGoing; hhGoing = { o: q, w: q.w };
    try { _mine0(q); } finally { hhGoing = was; }
    hhDeliver(q, 'mine');
  };
  const _det0 = detonateMine;
  detonateMine = function (pr) {
    const was = hhGoing; hhGoing = { o: pr, w: pr.w };
    try { _det0(pr); } finally { hhGoing = was; }
    hhDeliver(pr, 'pmine');
  };
  // fight.js fightArc, with Charged mines as nodes: the arc jumps to and through them without damage or loss.
  fightArc = function (e, dmg, jumps) {
    if (!(e.chargeT > G.t) || e.arcRT > G.t || jumps <= 0) return;
    e.arcRT = G.t + 0.3;
    let from = e, amt = dmg * 0.7;
    const hit = new Set([e]);
    const nodes = hhMines().map(b => b.o).filter(hhCharged);
    for (let j = 0; j < jumps; j++) {
      let best = null, bd = 110, node = null;
      for (const o of G.enemies) { if (o.dead || hit.has(o) || o.charmed) continue; const dd = Math.hypot(o.x - from.x, o.y - from.y); if (dd < bd) { bd = dd; best = o; node = null; } }
      for (const o of nodes) { if (hit.has(o)) continue; const dd = Math.hypot(o.x - from.x, o.y - from.y); if (dd < bd) { bd = dd; best = o; node = o; } }
      if (!best) break;
      hit.add(best); bolt(from.x, from.y, best.x, best.y, FIGHT_COL.charged, 0.12);
      if (node) { node.hh.t = G.t; from = node; continue; } // (a mine passes it on at full strength)
      damageEnemy(best, amt, { elem: 'shock', arc: true, noArc: true, noCrit: true, atk: 'burst', wname: 'Static arcs' });
      from = best; amt *= 0.7;
    }
  };
}
hookOn('tick', 'hhTick', dt => hhTick(dt));
