'use strict';
// Spawn Prawn - weapon cells, part 8: Unwanted Contact (s_tesla, tag uc; redesign docs/MODIFIER_MATRIX.md 5.9 and the
// weapon's row in every table of sections 3 and 4). Same engine as cellmods.js (XC_W masking, no fork screens, rank 1 to
// 3 then the mastery). Card text cell_uc_<modifier> in cellcopy8.js.
//  - THE CHAIN: once the weapon holds any cell, this file fires it (XC_FIRE.uc) with its own bounded chain (ucxChain, a copy
//    of game.js doChain: 88% a jump, Charge, Conductive Spit, Baby Monitor Network, sigs.js afterChain), so every cell can
//    act on each jump. Hits per attack (a "volley") are capped at 48; hits that are not part of a normal chain (Ricochet's
//    bounces and the chains they start, Piercing's mastery chains, crossing chains, loops) share a budget of 12 a volley
//    (the matrix's "12 hits in all"). Burst hits (Arc flash, Exploding Rounds) carry chainHop, so they never start Charge
//    arcs or new chains.
//  - KEPT SHARED FORMS (not masked): Range (falloff, speed; the cell adds jump range), Up Close (falloff; the cell adds
//    jumps to close chains), Rapid Fire (rate), Catalyst (bars, reactions; the cell makes Charge last longer), Kinship,
//    Area (aoe; this file scales its own bursts with areaK). Every other cell replaces the shared form (masked).
//  - "CHARGED TWICE" (Up Close mastery, Death from Above Lv 3): the enemy holds a second Charge, so it arcs a second time
//    (fight.js fightArc is wrapped). Drawn as a second ring.
//  - N/A: Primer (Charged enemies arcing to your other weapons is already its job), Ranged, Switched at Birth (no MM_SAB
//    entry; Charging is the whole weapon).
// Deviations from the table (also in MODIFIER_MATRIX.md 5.9): Charged adds +60% chain damage at ranks 1 to 3 (+20% at the
// mastery) so its wind-up passes the rule 19 DPS check; Homing on an instant bolt is +15% reach a rank and a bent opening
// bolt; Death from Above's opening strike lands after a 0.4 s reticle and hits for 140%.
// Hooks: none in shared files. Fills cellmods.js XC_W/XC_FIRE/XC_STATS/XC_TICK/XC_RUN/XC_LIFE; wraps fight.js fightArc,
// weapons24.js wupHit, modifiers.js modDraw. Loads after cellmods.js.
(function () {
  XC_W.s_tesla = { tag: 'uc',
    cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting', 'area'],
    mask: ['charged', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
    deny: ['primer', 'ranged', 'chaining'],
    atkOk: [] };
  const CAP = 48, XB = 12, MAXJ = 20; // (hits a volley; extra hits a volley; jumps a chain)
  const S_x = () => (typeof S === 'number' ? S : 1);
  const live = w => !!(G && G.weapons && G.weapons.includes(w));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const UCX = window.UCX = { fx: {} }; // (counters the test reads: one per signature effect)
  const mark = k => { UCX.fx[k] = (UCX.fx[k] || 0) + 1; };
  const volley = () => ({ n: 0, cap: CAP, xb: XB });
  const foeOk = e => e && !e.dead && !e.charmed && !e.phased && !(e.egg && !(e.woke && eggBreakable())); // (the egg only once it can be broken, as game.js acquire)
  function next(x, y, R, seen) { // the nearest enemy within jump range not yet hit
    let best = null, bd = R;
    forNear(x, y, R, e => { if (!foeOk(e) || seen.has(e)) return; const d = Math.hypot(e.x - x, e.y - y) - (e.r || 0) * 0.5; if (d < bd) { bd = d; best = e; } });
    return best;
  }
  const charge = (e, t) => { e.chargeT = Math.max(e.chargeT || 0, G.t + (t || 3)); };
  const dbl = e => { charge(e); e.xcUc2 = e.chargeT; mark('double'); };
  const family = w => G.weapons.filter(x => x && !x.isSpell && x.def && mwType(x) === 'shock').length;

  // ---------------------------------------------------------------- the numbers for one chain
  function plan(w, first, from, extra) {
    const R = id => xcR(w, id), s = w.s, p = G.player, o = Object.assign({ jumps: Math.max(0, s.chain || 0), jumpR: s.jump || 140, fall: 0.88 }, extra || {});
    if (R('charged')) { o.jumps += XC_RAMP(R('charged')); o.fall = R('charged') >= 4 ? 1 : 0.8; }
    if (R('upclose') && first && Math.hypot(first.x - from.x, first.y - from.y) < 120 && from.x === p.x && from.y === p.y) o.jumps += xcLv([1, 2, 3, 3], R('upclose'));
    if (R('kinship') >= 4 && family(w) >= 3) o.fall = 1;
    if (o.emp) { o.jumps += 2; if (R('nth') >= 3) o.fall = 1; }
    if (R('dfa') >= 2 && o.dfa) o.jumps += 1;
    o.jumps = Math.min(MAXJ, o.jumps);
    return o;
  }

  // ---------------------------------------------------------------- one jump
  function burst(w, x, y, r, dmg, src, not) { // a light Static burst (no flash, no shake): Arc flash and Exploding Rounds
    r *= xcArea(w);
    const bs = Object.assign({}, src, { chainHop: 1, mwBoom: 1, noCrit: true });
    let n = 0;
    IN_AOE = true;
    try { forNear(x, y, r, e => { if (!foeOk(e) || e === not || n >= 12) return; n++; damageEnemy(e, dmg, bs); charge(e); }); } finally { IN_AOE = false; }
    ring(x, y, r, w.def.color, 0.25, 2);
    if (G.fx.length < 240) fxParts('spark', x, y, w.def.color, 4, r * 3, 0.25, 1.6);
  }
  function hop(w, e, prev, px, py, k, o, k2) {
    const R = id => xcR(w, id), p = G.player, c = w.def.color;
    if (o.curve && k === 0) { // Homing: the opening bolt bends on to its target
      const mx = (px + e.x) / 2, my = (py + e.y) / 2, l = Math.hypot(e.x - px, e.y - py) || 1, off = Math.min(60, l * 0.25) * (Math.random() < 0.5 ? -1 : 1);
      const qx = mx - (e.y - py) / l * off, qy = my + (e.x - px) / l * off;
      bolt(px, py, qx, qy, c, 0.16); bolt(qx, qy, e.x, e.y, c, 0.16);
    } else bolt(px, py, e.x, e.y, c, o.emp ? 0.26 : 0.16);
    if (o.emp && G.fx.length < 240) bolt(px, py, e.x, e.y, '#ffffff', 0.1);
    const wet = G.pair && G.pair.conductive && e.wetT > G.t ? 2 : 1;
    const d = o.dmg * Math.pow(o.fall, k) * wet * (k2 || 1) * (k === 0 && o.firstK ? o.firstK : 1);
    const src = Object.assign({}, o.src, k || o.hopX ? { chainHop: 1 } : null); // (a jump: no Charge arcs)
    if (k && R('catalyst') >= 4 && e.rxT) { e.rxT = {}; mark('rxfree'); } // (every jump may set off a reaction: the lock is lifted)
    damageEnemy(e, d, src);
    if (G.pair && G.pair.monitor) chainNearMine(e.x, e.y);
    // Charge
    if (R('catalyst')) charge(e, 3 * (1 + 0.25 * Math.min(3, R('catalyst'))));
    if (R('upclose') >= 4 && Math.hypot(e.x - p.x, e.y - p.y) < 120) dbl(e);
    if (k === 0 && o.dbl) dbl(e);
    if (e.dead) { if (R('area')) burst(w, e.x, e.y, 40, d * 0.25, src, e); return d; }
    // Crowd
    const kn = R('knock');
    if (kn && !e.boss) {
      if (kn >= 4) { shove(e, px, py, 300); e.xcCan = { w, t: G.t + 0.6, f: 200, k: 0.4 }; mark('launch'); } // (cellmods.js xcTick: what it lands on takes 40%)
      else { shove(e, px, py, 85 * kn); mark('shove'); }
    }
    if (R('pull') && prev && !prev.dead) { mwPull(e, prev.x, prev.y, 30 * Math.min(3, R('pull'))); mark('tug'); }
    const st = R('sticky');
    if (st >= 4) { msSnare(e, 0.8); mark('snare'); }
    else if (st >= 3) { if (!(e.xcUcStT > G.t)) e.xcUcStN = 0; e.xcUcStT = G.t + 3; e.xcUcStN = (e.xcUcStN || 0) + 1; if (e.xcUcStN >= 3) { e.xcUcStN = 0; msSnare(e, 1); mark('snare'); } }
    // Flight
    if (R('area')) { burst(w, e.x, e.y, 40, d * 0.25, src, e); mark('arcflash'); } // Arc flash
    if (R('explode') >= 4) { burst(w, e.x, e.y, 80, d * 0.8, src, e); mark('jumpburst'); }
    if (R('dfa') >= 4 && k > 0) { bolt(e.x, e.y - 280, e.x, e.y, c, 0.18); damageEnemy(e, d * 0.5, Object.assign({}, src, { chainHop: 1 })); mark('sky'); } // every jump struck from above
    return d;
  }

  // ---------------------------------------------------------------- one chain (bounded)
  // o: { V, jumps, jumpR, fall, dmg, src, sec (its hits use the extra budget), seen (Set), firstK, dbl, emp, curve }
  function chain(w, x, y, first, o) {
    const V = o.V, seen = o.seen || new Set(), hit = [], R = id => xcR(w, id);
    let cur = first, px = x, py = y, prev = null, lastD = o.dmg, ix = x, iy = y;
    for (let k = 0; k <= o.jumps && foeOk(cur); k++) {
      if (V.n >= V.cap || (o.sec && V.xb <= 0)) break;
      V.n++; if (o.sec) V.xb--;
      hit.push(cur); seen.add(cur);
      lastD = hop(w, cur, prev, px, py, k, o);
      ix = px; iy = py; px = cur.x; py = cur.y; prev = cur;
      cur = next(px, py, o.jumpR, seen);
    }
    if (!hit.length) return { hit, seen };
    const last = hit[hit.length - 1];
    if (R('explode') && R('explode') < 4) { const er = R('explode'); burst(w, last.x, last.y, [40, 60, 80][er - 1], lastD * [0.4, 0.6, 0.8][er - 1], o.src, null); mark('lastburst'); } // the last target bursts
    if (R('pull') >= 4 && hit.length > 1) { for (const e of hit.slice(1)) if (!e.dead) mwPull(e, hit[0].x, hit[0].y, 80); ring(hit[0].x, hit[0].y, 40, w.def.color, 0.3, 3); mark('contract'); } // the chain contracts
    if (R('connecting') && hit.length > 1) link(w, hit);
    afterChain(w, hit, o.src);
    return { hit, seen, last, ix, iy, lastD };
  }
  function extraHop(w, from, e, o, k2) { // a hop outside a normal chain: uses the extra budget
    const V = o.V; if (!foeOk(e) || V.n >= V.cap || V.xb <= 0) return false;
    V.n++; V.xb--; (o.seen || (o.seen = new Set())).add(e);
    hop(w, e, from, from.x, from.y, 0, Object.assign({}, o, { firstK: 0, dbl: 0, curve: 0, hopX: 1 }), k2);
    return true;
  }

  // ---------------------------------------------------------------- one shot: the opening, the chain, what follows
  function shot(w, t, V, opt) {
    const R = id => xcR(w, id), p = G.player, s = w.s, from = opt.from || { x: p.x, y: p.y };
    const o = plan(w, t, from, { V, dmg: s.dmg * (opt.dk || 1) * (opt.fk || 1), src: opt.src, emp: opt.emp, dfa: opt.dfa, firstK: opt.firstK, dbl: opt.dbl, curve: !!R('homing'), seen: opt.seen || new Set() });
    let start = t, sx0 = from.x, sy0 = from.y;
    // Homing mastery: the shot retargets until it can start a chain
    if (R('homing') >= 4) for (let i = 0; i < 3 && start && !next(start.x, start.y, o.jumpR, new Set([start])); i++) {
      let alt = null, bd = 1e9;
      for (const e of G.enemies) { if (!foeOk(e) || e === start || Math.hypot(e.x - p.x, e.y - p.y) > s.range) continue; if (!next(e.x, e.y, o.jumpR, new Set([e]))) continue; const d = dist(e, start); if (d < bd) { bd = d; alt = e; } }
      if (!alt) break;
      V.n++; hop(w, start, null, sx0, sy0, 0, Object.assign({}, o, { emp: 0 }), 0.5); o.seen.add(start); sx0 = start.x; sy0 = start.y; start = alt; mark('retarget');
    }
    // Piercing: the opening shot passes through 1 / 3 / 6 (12) enemies in line; the chain starts from the last
    const pr = R('piercing');
    if (pr && start) {
      const a = Math.atan2(start.y - sy0, start.x - sx0), ca = Math.cos(a), sa = Math.sin(a), L = s.range * 1.15;
      const line = [];
      for (const e of G.enemies) { if (!foeOk(e) || o.seen.has(e)) continue; const u = (e.x - sx0) * ca + (e.y - sy0) * sa; if (u <= 0 || u > L) continue; if (Math.abs(-(e.x - sx0) * sa + (e.y - sy0) * ca) < (e.r || 10) + 8) line.push([u, e]); }
      line.sort((A, B) => A[0] - B[0]);
      const run = line.slice(0, 1 + XC_RAMP(pr)).map(q => q[1]);
      if (run.length > 1) {
        bolt(sx0, sy0, run[run.length - 1].x, run[run.length - 1].y, w.def.color, 0.14); // (the straight line it took)
        let fx = sx0, fy = sy0;
        for (let i = 0; i < run.length - 1; i++) {
          const e = run[i]; if (V.n >= V.cap) break; V.n++; o.seen.add(e);
          damageEnemy(e, o.dmg * Math.pow(0.85, i) * (o.firstK || 1), o.src); mark('pierce');
          if (pr >= 4) { const n = next(e.x, e.y, o.jumpR, o.seen); if (n) { chain(w, e.x, e.y, n, Object.assign({}, o, { sec: 1, hopX: 1, firstK: 0, dbl: 0, curve: 0, seen: o.seen })); mark('piercechain'); } }
          fx = e.x; fy = e.y;
        }
        start = run[run.length - 1]; sx0 = fx; sy0 = fy; o.dmg *= Math.pow(0.85, run.length - 1); o.curve = false;
      }
    }
    if (!foeOk(start)) return null;
    const C = chain(w, sx0, sy0, start, o);
    if (!C.hit.length) return C;
    const first = C.hit[0];
    // Every Nth mastery: the empowered chain loops back; Focused Intensity mastery: at full ramp, back to the first
    if ((o.emp && R('nth') >= 4) || (opt.full && R('focus') >= 4)) { if (C.hit.length > 1 && extraHop(w, C.last, first, o, 1)) mark('loop'); }
    // Ricochet: the arc bounces on after the chain ends, at the angle it came in (a 70-degree cone), -20% a bounce
    const rc = R('ricochet');
    if (rc && C.last) {
      let at = C.last, a = Math.atan2(at.y - C.iy, at.x - C.ix), k2 = 1;
      for (let b = 0; b < XC_RAMP(rc) && V.xb > 0; b++) {
        let nx = null, bd = o.jumpR * 2;
        for (const e of G.enemies) { if (!foeOk(e) || o.seen.has(e)) continue; const d = dist(e, at); if (d > bd) continue; if (Math.abs(angDiff(Math.atan2(e.y - at.y, e.x - at.x), a)) > 0.6) continue; bd = d; nx = e; }
        if (!nx) break;
        k2 *= 0.8;
        const d0 = C.lastD / Math.max(1e-6, o.dmg);
        if (!extraHop(w, at, nx, o, k2 * d0)) break;
        mark('bounce');
        if (rc >= 4) { const n = next(nx.x, nx.y, o.jumpR, o.seen); if (n) { chain(w, nx.x, nx.y, n, Object.assign({}, o, { sec: 1, hopX: 1, firstK: 0, dbl: 0, curve: 0, emp: 0, seen: o.seen, dmg: o.dmg * k2 })); mark('bouncechain'); } }
        a = Math.atan2(nx.y - at.y, nx.x - at.x); at = nx;
      }
    }
    // Rapid Fire mastery: chains that cross each other both gain a jump
    if (R('rapid') >= 4) cross(w, C, o, sx0, sy0);
    return C;
  }

  // ---------------------------------------------------------------- Rapid Fire mastery: crossing chains
  const segX = (a, b, c, d) => { const r = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x); if (Math.abs(r) < 1e-6) return false; const t = ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / r, u = ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) / r; return t > 0 && t < 1 && u > 0 && u < 1; };
  function cross(w, C, o, x0, y0) {
    const L = w.xcUcX || (w.xcUcX = []), pts = [{ x: x0, y: y0 }, ...C.hit.map(e => ({ x: e.x, y: e.y }))];
    const rec = { t: G.t, pts, C, o, gained: false };
    for (let i = L.length - 1; i >= 0; i--) if (G.t - L[i].t > 0.5) L.splice(i, 1);
    for (const q of L) {
      if (q.gained || rec.gained) continue;
      let hitX = false;
      for (let i = 1; i < pts.length && !hitX; i++) for (let j = 1; j < q.pts.length && !hitX; j++) if (segX(pts[i - 1], pts[i], q.pts[j - 1], q.pts[j])) hitX = true;
      if (!hitX) continue;
      q.gained = rec.gained = true; mark('cross');
      for (const R_ of [rec, q]) { const last = R_.C.last; if (!last || last.dead) continue; const n = next(last.x, last.y, R_.o.jumpR, R_.C.seen); if (n) extraHop(w, last, n, Object.assign({}, R_.o, { V: o.V, seen: R_.C.seen }), Math.pow(R_.o.fall, R_.C.hit.length)); }
    }
    L.push(rec); if (L.length > 12) L.shift();
  }

  // ---------------------------------------------------------------- Connecting: Aftershocks
  function link(w, hit) {
    const R = xcR(w, 'connecting'), L = w.xcUcL || (w.xcUcL = []);
    const g = { w, m: hit.slice(0, 8), end: G.t + (R >= 3 ? 5 : 3), next: G.t + 0.3, cdT: 0 };
    for (const e of g.m) e.xcUcL = g;
    L.push(g); while (L.length > 6) { const o = L.shift(); for (const e of o.m) if (e.xcUcL === o) e.xcUcL = null; }
    mark('link');
  }
  const linkSrc = w => Object.assign(weaponSrc(w), { xcUcLk: 1, wupEcho: true, chainHop: 1, noCrit: true });
  function linkTick(w, dt, q4) {
    const L = w.xcUcL; if (!L) return;
    const r = xcR(w, 'connecting'), c = w.def.color;
    for (let i = L.length - 1; i >= 0; i--) {
      const g = L[i]; g.m = g.m.filter(e => !e.dead);
      if (g.end < G.t || g.m.length < 2 || !r) { for (const e of g.m) if (e.xcUcL === g) e.xcUcL = null; L.splice(i, 1); continue; }
      if (G.t >= g.next) { // a stuttering spark between two of them
        g.next = G.t + (r >= 2 ? 0.25 : 0.5) * rand(0.7, 1.3);
        const j = Math.floor(Math.random() * (g.m.length - 1)), a = g.m[j], b = g.m[j + 1];
        bolt(a.x, a.y, b.x, b.y, c, 0.1);
        damageEnemy(b, w.s.dmg * 0.1, linkSrc(w)); mark('spark');
      }
      if (r >= 4 && q4) for (let j = 1; j < g.m.length; j++) { // Charge whatever wanders between two linked enemies (checked 4 times a second)
        const a = g.m[j - 1], b = g.m[j], vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
        forNear((a.x + b.x) / 2, (a.y + b.y) / 2, Math.sqrt(l2) / 2 + 10, e => {
          if (!foeOk(e) || e.xcUcL === g || e.xcUcWT > G.t) return;
          const t = clamp(((e.x - a.x) * vx + (e.y - a.y) * vy) / l2, 0, 1);
          if (Math.hypot(e.x - (a.x + vx * t), e.y - (a.y + vy * t)) < (e.r || 10) + 4) { e.xcUcWT = G.t + 1; charge(e); ring(e.x, e.y, (e.r || 10) + 6, c, 0.3, 2); mark('wander'); }
        });
      }
    }
  }
  wupHit = (orig => function (e, res, src) { // any hit on a linked enemy arcs to the others (25% of it, 4 a second per group)
    orig(e, res, src);
    const g = e && e.xcUcL;
    if (!G || !g || g.end < G.t || !src || src.dot || src.echo || src.wupEcho || src.rx || src.xcUcLk || !(res && res.toHp > 0) || g.cdT > G.t || !live(g.w)) return;
    g.cdT = G.t + 0.25;
    for (const o of g.m) if (o !== e && !o.dead) { bolt(e.x, e.y, o.x, o.y, g.w.def.color, 0.12); damageEnemy(o, res.toHp * 0.25, linkSrc(g.w)); }
    mark('linkarc');
  })(wupHit);

  // ---------------------------------------------------------------- "Charged twice": a second arc
  fightArc = (orig => function (e, dmg, jumps) {
    const two = e && e.xcUc2 > G.t && e.chargeT > G.t;
    orig(e, dmg, jumps);
    if (two && e.arcRT > G.t) { e.xcUc2 = 0; e.arcRT = 0; orig(e, dmg, jumps); mark('arc2'); }
  })(fightArc);

  // ---------------------------------------------------------------- firing
  function focus(w, t) { // Focused Intensity: chains starting on the same target ramp (+10% a 0.5 s)
    const r = xcR(w, 'focus'); if (!r) return { k: 1, full: false };
    let F = w.xcUcF;
    if (!F || F.e !== t || t.dead || G.t - F.last > 1.5) F = w.xcUcF = { e: t, t0: G.t };
    F.last = G.t;
    const top = xcLv([0.4, 0.8, 1.2, 1.6], r), b = Math.min(top, 0.1 * Math.floor((G.t - F.t0) / 0.5));
    if (b > 0) ring(t.x, t.y, (t.r || 10) + 4 + b * 8, w.def.color, 0.2, 1 + b * 2);
    return { k: 1 + b, full: b >= top - 1e-6 };
  }
  XC_FIRE.uc = function (w, target, src) {
    const R = id => xcR(w, id), p = G.player, s = w.s;
    if (R('melee') || R('orbiting')) return true; // (Bad touch and the orbs run in the tick)
    if (R('mines')) { // Charged mines, laid where you are
      const M = w.xcUcM || (w.xcUcM = []);
      M.push({ x: p.x + rand(-20, 20), y: p.y + rand(-20, 20), arm: G.t + 0.4, end: G.t + 14 });
      while (M.length > (R('mines') >= 2 ? 5 : 3)) M.shift();
      return true;
    }
    if (!target) return false;
    if (w.isLast) src.mult = (src.mult || 1) * (3 + Math.min(4, G.P.lastRound));
    const V = volley();
    let emp = false;
    if (R('nth')) { w.xcN = (w.xcN || 0) + 1; if (w.xcN % (R('nth') >= 2 ? 3 : 4) === 0) { emp = true; ring(p.x, p.y, 34, w.def.color, 0.35, 4); mark('empowered'); } }
    const F = focus(w, target);
    if (R('dfa')) { // a bolt strikes the first target from above after a 0.4 s reticle, then chains as normal
      const x = target.x, y = target.y;
      G.fx.push({ type: 'warn', x, y, r: (target.r || 10) + 10, color: w.def.color, life: 0.4, max: 0.4 });
      after(0.4, () => {
        if (!G || !live(w)) return;
        const t = foeOk(target) && Math.hypot(target.x - x, target.y - y) < 80 ? target : xcFoe(x, y, 80);
        if (!t) return;
        bolt(t.x, t.y - 300, t.x, t.y, w.def.color, 0.22); ring(t.x, t.y, (t.r || 10) + 12, w.def.color, 0.3, 3);
        shot(w, t, V, { src, emp, fk: F.k, full: F.full, dfa: 1, firstK: 1.4, dbl: R('dfa') >= 3, from: { x: t.x, y: t.y - 300 } }); mark('strike');
      });
      sfx('zap'); return true;
    }
    const ex = R('extra'), n = ex ? 1 + xcLv([1, 2, 2, 7], ex) : 1, dk = Math.pow(1 / n, 0.4); // (more chains, less each: rule 5)
    let starts;
    if (ex >= 4) { // a chain shot in every direction
      starts = [];
      for (let i = 0; i < 8; i++) {
        const a0 = i / 8 * TAU; let best = null, bd = s.range;
        for (const e of G.enemies) { if (!foeOk(e) || starts.includes(e)) continue; const d = dist(e, p); if (d > bd + (e.r || 0)) continue; if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), a0)) > TAU / 16) continue; bd = d; best = e; }
        if (best) starts.push(best);
      }
      if (!starts.length) starts = [target];
    } else if (ex >= 3) { starts = acquireMany(aimDir(w), s.range, p.x, p.y, n); if (!starts.length) starts = [target]; }
    else starts = Array(n).fill(target);
    const shared = new Set(); // (extra chains from the same target branch off different ways)
    starts.forEach((t, i) => {
      const seen = new Set(shared); seen.delete(t);
      const C = shot(w, t, V, { src: Object.assign({}, src), emp, fk: F.k, full: F.full, dk, seen });
      if (C) for (const e of C.hit) shared.add(e);
      if (i) mark('extra');
    });
    sfx('zap');
    return true;
  };

  // ---------------------------------------------------------------- stats
  XC_STATS.uc = function (w, s) {
    const R = id => xcR(w, id);
    if (R('charged')) { const r = R('charged'); s.cd += xcLv([0.5, 0.4, 0.3, 0.3], r); s.dmg *= xcLv([1.6, 1.6, 1.6, 1.2], r); w.xcUcWind = xcLv([0.5, 0.4, 0.3, 0.3], r); } else w.xcUcWind = 0;
    if (R('homing')) s.range *= 1 + 0.15 * Math.min(3, R('homing'));
    if (R('range')) s.jump = R('range') >= 4 ? (s.jump || 140) * 2 : (s.jump || 140) + xcLv([20, 40, 60], R('range'));
  };

  // ---------------------------------------------------------------- every frame
  XC_TICK.uc = function (w, dt) {
    const R = id => xcR(w, id), p = G.player, s = w.s, c = w.def.color;
    const q4 = !(w.xcUcQ > G.t); if (q4) w.xcUcQ = G.t + 0.25;
    // Sticky: Charged enemies are slowed
    if (R('sticky') && q4) for (const e of G.enemies) if (e.chargeT > G.t && foeOk(e)) msSlow(e, xcLv([0.3, 0.5, 0.7, 0.7], R('sticky')), 0.35);
    linkTick(w, dt, q4);
    // Melee: Bad touch
    if (R('melee')) {
      const r = R('melee');
      if (!(w.xcUcBtG > G.t)) forNear(p.x, p.y, (p.r || 12) + 6, e => {
        if (!foeOk(e) || e.xcUcBtT > G.t) return;
        e.xcUcBtT = G.t + 0.6; w.xcUcBtG = G.t + 0.2;
        const o = plan(w, null, p, { V: volley(), dmg: s.dmg * 1.3, src: Object.assign(weaponSrc(w), { atk: 'contact' }) });
        o.jumps = Math.min(MAXJ, (r >= 2 ? 4 : 3) + Math.max(0, (s.chain || 3) - 3));
        chain(w, p.x, p.y, e, o); mark('badtouch');
        if (r >= 3 && !e.boss && !e.dead) { shove(e, p.x, p.y, 320); mark('throw'); }
        return true;
      });
      if (r >= 4 && !(w.xcUcBtC > G.t)) { w.xcUcBtC = G.t + 1; const RR = 80 * xcArea(w); forNear(p.x, p.y, RR, e => { if (foeOk(e)) charge(e); }); ring(p.x, p.y, RR, c, 0.3, 2); mark('aura'); }
    }
    // Mines: Charged mines start a chain when tripped
    const M = w.xcUcM;
    if (M && M.length) {
      if (!R('mines')) w.xcUcM = null;
      else {
        for (const m of M) {
          if (m.gone || m.arm > G.t) continue;
          if (m.end < G.t) { m.gone = 1; continue; }
          let trig = null; forNear(m.x, m.y, 40, e => { if (foeOk(e)) { trig = e; return true; } });
          if (trig) mineGo(w, m, trig, true);
        }
        w.xcUcM = M.filter(m => !m.gone);
      }
    }
    // Orbiting: Charged orbs
    if (R('orbiting')) {
      const r = R('orbiting'), n = r >= 2 ? 3 : 2, rad = 80, O = w.xcUcO || (w.xcUcO = { a: 0, slots: [] });
      O.a += 2.5 * dt; while (O.slots.length < n) O.slots.push({ ready: 0 }); O.slots.length = n;
      const cool = Math.max(0.8, (s.cd || 0.7) * 1.6);
      O.slots.forEach((sl, i) => {
        const a = O.a + i / n * TAU; sl.x = p.x + Math.cos(a) * rad; sl.y = p.y + Math.sin(a) * rad;
        if (sl.ready > G.t) return;
        const e = xcFoe(sl.x, sl.y, 40);
        if (!e) return;
        sl.ready = G.t + cool;
        const o = plan(w, null, sl, { V: volley(), dmg: s.dmg, src: weaponSrc(w) }); if (r >= 3) o.jumps = Math.min(MAXJ, o.jumps + 1);
        chain(w, sl.x, sl.y, e, o); mark('orb');
      });
      if (r >= 4 && q4) for (let i = 0; i < n; i++) { // the ring: what crosses it between two orbs is zapped
        const a = O.slots[i], b = O.slots[(i + 1) % n], vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
        forNear((a.x + b.x) / 2, (a.y + b.y) / 2, Math.sqrt(l2) / 2 + 10, e => {
          if (!foeOk(e) || e.xcUcRT > G.t) return;
          const t = clamp(((e.x - a.x) * vx + (e.y - a.y) * vy) / l2, 0, 1);
          if (Math.hypot(e.x - (a.x + vx * t), e.y - (a.y + vy * t)) > (e.r || 10) + 6) return;
          e.xcUcRT = G.t + 0.5; damageEnemy(e, s.dmg * 0.3, Object.assign(weaponSrc(w), { chainHop: 1 })); charge(e); mark('ringzap');
        });
      }
    } else w.xcUcO = null;
  };
  function mineGo(w, m, trig, root) {
    if (m.gone) return; m.gone = 1;
    const R = id => xcR(w, id), s = w.s;
    ring(m.x, m.y, 30, w.def.color, 0.3, 3);
    const o = plan(w, null, m, { V: volley(), dmg: s.dmg * 1.2, src: weaponSrc(w) }); if (R('mines') >= 3) o.jumps = Math.min(MAXJ, o.jumps + 1);
    if (trig) chain(w, m.x, m.y, trig, o);
    mark('mine');
    if (root && R('mines') >= 4) for (const q of w.xcUcM || []) { // the chain runs on through the other Charged mines
      if (q.gone || q.arm > G.t || Math.hypot(q.x - m.x, q.y - m.y) > 220) continue;
      bolt(m.x, m.y, q.x, q.y, w.def.color, 0.16); mark('minelink');
      const t = xcFoe(q.x, q.y, (s.jump || 140) * 1.5);
      if (t) mineGo(w, q, t, false); else { q.gone = 1; ring(q.x, q.y, 30, w.def.color, 0.3, 3); }
    }
  }

  // ---------------------------------------------------------------- Turncoat: Tesla zombies
  XC_LIFE.uc = () => 5;
  XC_RUN.uc = function (z, dt) {
    const w = z.xcRun.w, r = xcR(w, 'turncoat');
    const o = xcFoe(z.x, z.y, 400, [z]);
    if (o) { const d = dist(o, z) || 1; if (d > 50) { z.x += (o.x - z.x) / d * 60 * dt; z.y += (o.y - z.y) / d * 60 * dt; } }
    if (!(z.xcUcZT > G.t)) {
      z.xcUcZT = G.t + (r >= 3 ? 0.6 : 1);
      const t = xcFoe(z.x, z.y, 100, [z]);
      if (t) {
        const op = { V: volley(), jumps: r >= 2 ? 3 : 2, jumpR: w.s.jump || 140, fall: 0.88, dmg: w.s.dmg * 0.6, src: Object.assign(weaponSrc(w), { wname: w.def.name }), seen: new Set([z]) };
        chain(w, z.x, z.y, t, op); mark('zombie');
        if (r >= 4) { forNear(z.x, z.y, 100, e => { if (foeOk(e) && e !== z) charge(e); }); ring(z.x, z.y, 100, w.def.color, 0.3, 2); }
      }
    }
    if (z.xcRun.end <= G.t) z.dead = true;
  };

  // ---------------------------------------------------------------- drawing (world space)
  const jag = (x1, y1, x2, y2, n) => { ctx.beginPath(); ctx.moveTo(x1, y1); for (let i = 1; i < n; i++) { const t = i / n; ctx.lineTo(x1 + (x2 - x1) * t + rand(-3, 3) * S_x(), y1 + (y2 - y1) * t + rand(-3, 3) * S_x()); } ctx.lineTo(x2, y2); ctx.stroke(); };
  modDraw = (orig => function () {
    orig();
    if (!G || !G.weapons) return;
    const p = G.player, Z = S_x();
    let any = false;
    for (const w of G.weapons) if (w && xcIs(w, 'uc') && xcAny(w)) { any = true; break; }
    if (!any) return;
    ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * Z);
    for (const w of G.weapons) {
      if (!w || !xcIs(w, 'uc') || !xcAny(w)) continue;
      const c = col(w.def.color);
      ctx.strokeStyle = c; ctx.fillStyle = c;
      if (w.xcUcWind && w.reloadT <= 0 && w.cd < w.xcUcWind && w.cd > 0) { const k = 1 - w.cd / w.xcUcWind; ctx.globalAlpha = 0.25 + 0.6 * k; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 6 + 14 * (1 - k)) * Z, 0, TAU * k); ctx.stroke(); } // the wind-up
      if (w.xcUcO) { // the orbs (and their ring)
        const sl = w.xcUcO.slots;
        for (const o of sl) { if (o.x == null) continue; ctx.globalAlpha = o.ready > G.t ? 0.3 : 0.95; ctx.beginPath(); ctx.arc(sx(o.x), sy(o.y), 5 * Z, 0, TAU); ctx.fill(); }
        if (xcR(w, 'orbiting') >= 4) { ctx.globalAlpha = 0.5; for (let i = 0; i < sl.length; i++) { const a = sl[i], b = sl[(i + 1) % sl.length]; if (a.x != null && b.x != null) jag(sx(a.x), sy(a.y), sx(b.x), sy(b.y), 6); } }
      }
      if (w.xcUcM) for (const m of w.xcUcM) { const x = sx(m.x), y = sy(m.y), r = 6 * Z; ctx.globalAlpha = m.arm > G.t ? 0.35 : 0.6 + 0.3 * Math.sin(G.realT * 14 + m.x); ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.stroke(); } // Charged mines
      if (w.xcUcL) { ctx.globalAlpha = 0.25; ctx.setLineDash([3 * Z, 6 * Z]); for (const g of w.xcUcL) for (let j = 1; j < g.m.length; j++) { const a = g.m[j - 1], b = g.m[j]; ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y)); ctx.lineTo(sx(b.x), sy(b.y)); ctx.stroke(); } ctx.setLineDash([]); } // Aftershocks
      if (xcR(w, 'melee')) { ctx.globalAlpha = 0.15 + 0.1 * Math.sin(G.realT * 20); ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 6) * Z, 0, TAU); ctx.stroke(); } // Bad touch
    }
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (e.xcUc2 > G.t) { ctx.globalAlpha = 0.7; ctx.strokeStyle = col(V10_COL.shock || '#ffe94a'); ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), ((e.r || 10) + 9) * Z, 0, TAU); ctx.stroke(); } // Charged twice
      if (e.xcRun && e.xcRun.tag === 'uc') { ctx.globalAlpha = 0.6; ctx.strokeStyle = col(e.xcRun.w.def.color); const R = (e.r || 10) + 8; for (let i = 0; i < 3; i++) { const a = G.realT * 6 + i * 2.1; jag(sx(e.x + Math.cos(a) * R), sy(e.y + Math.sin(a) * R), sx(e.x + Math.cos(a + 0.9) * R), sy(e.y + Math.sin(a + 0.9) * R), 3); } } // a crackling zombie
    }
    ctx.restore();
  })(modDraw);
  UCX.chain = chain; UCX.shot = shot; UCX.volley = volley; UCX.plan = plan;
})();
