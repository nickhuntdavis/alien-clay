'use strict';
// Spawn Prawn - weapon upgrade branches, batch 4 (redesign docs/WEAPON_UPGRADES.md 13, 17, 18, 21):
//   There Is No Spoon (s_siphon), Nappy Mines (s_mines), Soulmate Signal (s_twin), Unwanted Contact (s_tesla).
// Each weapon: 3 promises (Lv 3), 9 Lv 6 cards (two per promise plus its wildcard), 3 masteries (Lv 10), all registered with
// wupReg (weapons24.js) and acting through wupOn hooks. One IIFE, every name w4*, so it merges with the other wupN.js files.
// Conventions:
//   - per-slot state lives in w.w4 (flags the cards set, plus fx: a counter per signature effect, so the test can see a card work).
//   - damage a card makes itself goes through damageEnemy with src.wupEcho (it never re-triggers hit hooks).
//   - every repeat is bounded (caps noted at each card); every card draws something (ring, line, floatText).
// The four weapons do not all go through fireWeapon, so some cards replace or wrap the weapon's own code (all at load, no shared
// file edited):
//   Siphon: updateSiphon is replaced by w4SipUpdate once any card is taken (it is a copy of arsenal.js updateSiphon plus the cards).
//   Mines: mineDrop, mineScale and detonateMine are wrapped. Twin: twinPoints is wrapped (Evil Twin, Conjoined Twins).
//   Tesla: fires through a 'fire' hook with its own bounded chain (a copy of game.js doChain plus the cards).
//   Also wrapped: pdefHurt (Umbilical Membrane), wupDmgMul (Conductive Personality), killEnemy and rateBonus (Last Spark),
//   fightArc (Feedback Loop), fightPayoff (Flare Up), wupHit (Tumble Dryer), projHit/projEnd (the 'phit' and 'pend' hook kinds).
// Simplified (see changes/ fragment): staleness of stored bullets is not modelled (the base weapon has none).
(function () {
  const SI = 's_siphon', NM = 's_mines', TW = 's_twin', UC = 's_tesla';
  const TWO = Math.PI * 2;
  const PINK = '#ffb3c6', YEL = '#ffe94a', ORG = '#ffb347', WHITE = '#ffffff', FIRE = '#ff7a2f', TAPE = '#f1ecff';
  const A4 = w => w.w4 || (w.w4 = { fx: {} });
  const mark = (w, k) => { const S = A4(w); S.fx[k] = (S.fx[k] || 0) + 1; };
  const live = w => !!(G && G.weapons && G.weapons.includes(w));
  const anyW = flag => !!(G && G.weapons && G.weapons.some(w => w && w.w4 && w.w4[flag]));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const pull01 = (v, lo, hi) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

  // ------------------------------------------------------------ shared helpers
  function cardSrc(w, over) { // a hit a card makes: real damage, no hook re-trigger, no multiplier of ours
    return Object.assign(weaponSrc(w), { wupEcho: true, noCrit: true, noProc: true, w4raw: 1, wname: w.def.name }, over || {});
  }
  function line(x1, y1, x2, y2, wd, c, life, jit) {
    const L = G.v10fx || (G.v10fx = []);
    if (L.length > 160) return;
    L.push({ k: 'beam', x: x1, y: y1, x2, y2, w: wd, c, t: jit ? 'shock' : '', life: life || 0.12, max: life || 0.12 });
  }
  const sayT = {};
  function say(key, x, y, txt, color, size, gap) { // floating text, at most once per gap seconds per key
    if ((sayT[key] || 0) > G.realT) return;
    sayT[key] = G.realT + (gap || 0.5); floatText(x, y, txt, color, size || 12, 0.7);
  }
  function nearE(x, y, r, skip) {
    let b = null, bd = Infinity;
    forNear(x, y, r, (e, d2) => { if (e.dead || e.charmed || (skip && skip(e))) return; if (d2 < bd) { bd = d2; b = e; } });
    return b;
  }
  function poise(e, fill) { // Poise bar (matrix: the Force bar), a full bar staggers
    if (!e || e.dead) return;
    const c = fightCd(e); c.bars.force += fill; c.barQuietT.force = 0;
    if (c.bars.force >= 1) { c.bars.force = 0; fightPayoff(e, 'stagger', { raw: 0 }, {}); }
  }
  function heavy(e, fill) { // a heavy hit's effects: one Shell layer off, Poise up
    if (!e || e.dead) return;
    const c = fightCd(e);
    if (c.def === 'shell' && c.layers > 0) {
      c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; fst().layers++;
      ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3);
    }
    if (fill) poise(e, fill);
  }
  function pullTo(e, tx, ty, str, dt) { // Pull (matrix 12.2): elites 50%, bosses 25%, Squishy halves; never through a wall
    if (e.egg || e.dead) return;
    let f = str / (e.r / 12) * dt;
    if (e.boss) f *= 0.25; else if (e.elite) f *= 0.5;
    if (fightCd(e).def === 'squishy') f *= 0.5;
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1, m = Math.min(d, f), nx = e.x + dx / d * m, ny = e.y + dy / d * m;
    if (G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(nx, ny)) return;
    e.x = nx; e.y = ny;
  }
  function segX(a, b, c, d) { // where segments ab and cd cross, or null
    const r1x = b.x - a.x, r1y = b.y - a.y, r2x = d.x - c.x, r2y = d.y - c.y, den = r1x * r2y - r1y * r2x;
    if (Math.abs(den) < 1e-6) return null;
    const t = ((c.x - a.x) * r2y - (c.y - a.y) * r2x) / den, u = ((c.x - a.x) * r1y - (c.y - a.y) * r1x) / den;
    return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98 ? { x: a.x + r1x * t, y: a.y + r1y * t } : null;
  }
  const C = (name, desc, fn) => ({ name, desc, apply: fn });
  const flag = (k, v) => w => { A4(w)[k] = v === undefined ? true : v; };
  // fight.js and pdef.js load after this file, so their functions are wrapped the first time any of our cards is taken.
  const lateFns = []; let lateDone = false;
  function w4Late() { if (lateDone) return; lateDone = true; for (const f of lateFns) f(); }

  // ================================================================ 21. THERE IS NO SPOON (Force, Projectile)
  // Store entries: a number (the strength the bullet came in with) or { k, big, boss } (a big shot: one entry, three slots) or
  // { fill: 1 } (the two spare slots behind a big entry).
  const ek = x => (typeof x === 'number' ? x : x.k);
  const sipBig = b => b.r >= 7 || b.dmg >= 0.15 * G.P.maxHp || !!(b.owner && (b.owner.elite || b.owner.boss));
  const sipPoolCap = w => Math.min(0.15, w.q.length * 0.01) * G.P.maxHp;

  function sipShot(w, ent, a, o) {
    o = o || {};
    const A = A4(w), p = G.player, big = typeof ent !== 'number' && ent.big;
    const src = weaponSrc(w); src.mult *= ek(ent) * (A.dmgK || 1) * (o.mul || 1);
    let over = null;
    if (A.rpierce && big) { over = { pierce: 99 }; mark(w, 'pierce'); }
    if (A.swap) { // Swap Meet: the shot is one of your other weapons' (its damage type and attack type)
      const os = G.weapons.filter(x => x && x !== w && !x.isSpell);
      if (os.length) {
        const q = os[Math.floor(Math.random() * os.length)], k = W24_BY[w24Key(q)];
        src.elem = q.def.elem; if (k) src.atk = k.atk; src.wname = q.def.name + ' (swapped)';
        over = Object.assign(over || {}, { color: V10_COL[q.def.elem] || q.def.color });
        mark(w, 'swap'); say('swap', p.x, p.y - 34, 'SWAP MEET', V10_COL[q.def.elem] || PINK, 11, 0.6);
      }
    }
    const pr = spawnProj(w, o.x == null ? p.x : o.x, o.y == null ? p.y : o.y, a, src, over);
    if (pr) {
      if (o.tgt) { pr.homing = Math.max(pr.homing || 0, 8); pr.tgt = o.tgt; }
      if (o.heavy) pr.w4heavy = 1;
    }
    if (A.hic && Math.random() < 0.25 && !o.dup) { mark(w, 'hiccup'); say('hic', p.x, p.y - 30, 'hic', PINK, 11, 0.4); sipShot(w, ent, a + rand(-0.06, 0.06), Object.assign({}, o, { dup: 1 })); }
    return pr;
  }
  // Fire a list of store entries: a fan (tight or wide), or a ring.
  function sipVolley(w, ents, aim, o) {
    o = o || {};
    const A = A4(w), n = ents.length, half = A.tight ? 0.07 : 0.38;
    for (let i = 0; i < n; i++) {
      const ent = ents[i];
      let a = o.ring ? i / n * TWO + (o.rot || 0) : aim + (n > 1 ? (i / (n - 1) - 0.5) * 2 * half : 0) + rand(-0.02, 0.02);
      const so = {};
      if (typeof ent !== 'number' && ent.boss && !ent.boss.dead) { a = Math.atan2(ent.boss.y - G.player.y, ent.boss.x - G.player.x); so.tgt = ent.boss; so.heavy = 1; mark(w, 'paternity'); }
      sipShot(w, ent, a, so);
    }
    return n;
  }
  const sipReal = q => q.filter(x => typeof x === 'number' || !x.fill);
  // The whole store out at once (a full-store volley, or the Membrane breaking).
  function sipDump(w, t, o) {
    const A = A4(w), s = w.s, p = G.player;
    const ents = sipReal(w.q); w.q.length = 0; w.stored = 0;
    if (!ents.length) return 0;
    const aim = t ? Math.atan2(t.y - p.y, t.x - p.x) : (p.face || 0);
    sipVolley(w, ents, aim, o);
    ring(p.x, p.y, 40 + ents.length * 2, PINK, 0.4, 5); fxParts('spark', p.x, p.y, PINK, 10, 160, 0.4, 3);
    return ents.length;
  }
  function sipFull(w, t) { // the store is full: one big volley
    const A = A4(w), s = w.s, p = G.player;
    const n = sipReal(w.q).length, ents = sipReal(w.q).slice();
    if (A.ring) {
      sipDump(w, t, { ring: true, rot: 0 }); mark(w, 'ring');
      after(0.3, () => { if (live(w)) { sipVolley(w, ents.map(x => ek(x)), 0, { ring: true, rot: Math.PI / Math.max(1, ents.length) }); ring(p.x, p.y, 70, PINK, 0.4, 5); } });
      floatText(p.x, p.y - 40, 'LET-DOWN', PINK, 16, 0.9);
    } else {
      sipDump(w, t); mark(w, 'volley'); floatText(p.x, p.y - 40, 'FULL TERM', PINK, 15, 0.9);
      if (A.after) after(0.35, () => {
        if (!live(w)) return;
        const el = acquire('elite', s.range * 1.4, p.x, p.y) || acquire('nearest', s.range * 1.4, p.x, p.y);
        if (!el) return;
        sipVolley(w, ents.map(x => ek(x)), Math.atan2(el.y - p.y, el.x - p.x), {});
        mark(w, 'after'); floatText(p.x, p.y - 40, 'AFTERBIRTH', PINK, 14, 0.8); line(p.x, p.y, el.x, el.y, 3, PINK, 0.25);
      });
    }
    return n;
  }
  function sipBreak(w) { // the Membrane broke: every stored bullet bursts out in a ring
    const p = G.player, A = A4(w);
    if (!w.q.length) return;
    const ents = sipReal(w.q).slice(0, 24); w.q.length = 0; w.stored = 0;
    sipVolley(w, ents, 0, { ring: true });
    mark(w, 'burst'); ring(p.x, p.y, 90, PINK, 0.5, 6); floatText(p.x, p.y - 40, 'WATER BREAKS', PINK, 15, 0.9);
  }

  function w4SipUpdate(w, dt) {
    const s = w.s, d = w.def, p = G.player, A = A4(w), r2 = s.area * s.area;
    w.q = w.q || [];
    if (A.pool == null) A.pool = 0;
    // Suction Cup: while the Membrane holds, shots within 120 are pulled in to be eaten.
    if (A.pull && A.pool > 0) {
      let n = 0;
      for (const b of G.ebul) {
        if (b.dead) continue;
        const dx = p.x - b.x, dy = p.y - b.y, dd = Math.hypot(dx, dy);
        if (dd < 120 && dd > s.area * 0.7) { const m = Math.min(dd - 1, 340 * dt); b.x += dx / dd * m; b.y += dy / dd * m; n++; }
      }
      if (n && !(A.pullT > G.realT)) { A.pullT = G.realT + 0.3; mark(w, 'pull'); ring(p.x, p.y, 120, PINK, 0.25, 2); }
    }
    let mirrored = 0;
    for (const b of G.ebul) {
      if (b.dead) continue;
      const dx = b.x - p.x, dy = b.y - p.y;
      if (dx * dx + dy * dy >= r2) continue;
      const big = sipBig(b);
      if (A.rich && !big) continue; // Eat the Rich: small shots are not eaten
      if (A.mirror && mirrored < 6 && G.proj.length < 300 && Math.random() < 0.5) { // Mirror Womb: back at whoever fired it
        const o = b.owner && !b.owner.dead ? b.owner : nearE(p.x, p.y, 900);
        b.dead = true; mirrored++;
        const src = weaponSrc(w); src.mult *= siphonStrength(b);
        const a = o ? Math.atan2(o.y - b.y, o.x - b.x) : Math.atan2(-b.vy, -b.vx);
        const pr = spawnProj(w, b.x, b.y, a, src);
        if (pr && o) { pr.homing = 8; pr.tgt = o; }
        mark(w, 'mirror'); spawnPart(b.x, b.y, d.color, 3, 80, 0.25, 2); say('mirror', b.x, b.y - 10, 'BOUNCE', PINK, 10, 0.4);
        continue;
      }
      if (w.q.length >= s.mag) continue;
      b.dead = true;
      const k = siphonStrength(b);
      if (A.rich && big) {
        w.q.push({ k: k * 3, big: 1, boss: A.boss && b.owner && b.owner.boss ? b.owner : null });
        for (let i = 0; i < 2; i++) if (w.q.length < s.mag) w.q.push({ k: 0, fill: 1 });
        mark(w, 'rich'); floatText(b.x, b.y - 10, 'SWALLOWED', PINK, 12, 0.7); ring(p.x, p.y, s.area * 0.8, PINK, 0.3, 5);
      } else w.q.push(k);
      w.stored = w.q.length;
      siphonAte(w, b);
      if (!w.echo && ++G.stats.absorbed === 200) achieve('siphoned');
      if (A.memb) { A.pool = Math.min(sipPoolCap(w), A.pool + 0.01 * G.P.maxHp); mark(w, 'ate'); }
      if (Math.random() < 0.3) spawnPart(b.x, b.y, d.color, 1, 60, 0.25, 2);
    }
    if (!w.q.length) { w.trickle = (w.trickle || 0) + dt * SIPHON.trickle; if (w.trickle >= 1) { w.trickle = 0; siphonStore(w, SIPHON.dry); } } else w.trickle = 0;
    // The Membrane tracks the store (1% of max health a bullet, 15% at most) and mends a little.
    if (A.memb) {
      const cap = sipPoolCap(w);
      A.pool = Math.min(cap, A.pool + 0.015 * G.P.maxHp * dt);
      if (A.pool > 0 && !(A.ringT > G.realT)) { A.ringT = G.realT + 0.25; const k = A.pool / (0.15 * G.P.maxHp); ring(p.x, p.y, p.r + 10 + k * 10, PINK, 0.3, 2 + k * 6); mark(w, 'bubble'); }
    }
    w.stored = w.q.length; w.ammo = w.stored;
    if (w.lastTarget && !w.lastTarget.dead) w.focusT += dt;
    w.cd -= dt * (G.rage > 0 ? 2 : 1) * rateBonus();
    if (A.full) { // Return to Womb: nothing leaves until the store is full
      if (!(A.swellT > G.realT)) { A.swellT = G.realT + 0.25; const f = w.q.length / s.mag; ring(p.x, p.y, p.r + 6 + f * 18, PINK, 0.3, 2 + f * 5); mark(w, 'swell'); }
      if (w.q.length < s.mag) { if (w.cd < 0) w.cd = 0; return; }
      const t = acquire(aimDir(w), s.range, p.x, p.y);
      if (!t) { w.cd = 0; return; }
      sipFull(w, t); w.cd = 0.5;
      if (!(G.dryT > G.t)) { G.dryT = G.t + 2; tacticalWave(); }
      return;
    }
    if (w.cd > 0 || w.stored < 1) { if (w.cd < 0) w.cd = 0; return; }
    const t = A.regift ? (acquire('furthest', s.range, p.x, p.y)) : acquire(aimDir(w), s.range, p.x, p.y);
    if (!t) { w.cd = 0; w.curTarget = null; return; }
    w.cd = s.cd;
    while (w.q.length && typeof w.q[0] !== 'number' && w.q[0].fill) w.q.shift();
    if (!w.q.length) return;
    const ent = w.q.shift();
    if (typeof ent !== 'number') while (w.q.length && typeof w.q[0] !== 'number' && w.q[0].fill) w.q.shift();
    w.stored = w.q.length;
    if (w.stored === 0 && !(w.dryT > G.t)) { w.dryT = G.t + 2; tacticalWave(); }
    if (t !== w.lastTarget) { w.focusT = 0; w.lastTarget = t; }
    w.curTarget = t;
    if (A.regift) { mark(w, 'regift'); line(p.x, p.y, t.x, t.y, 1.5, PINK, 0.12); }
    const lastK = w.stored === 0 && G.P.lastRound > 0 ? 3 + Math.min(4, G.P.lastRound) : 1;
    const a0 = Math.atan2(t.y - p.y, t.x - p.x);
    for (let i = 0; i < s.count; i++) {
      const a = a0 + (i - (s.count - 1) / 2) * 0.12 + rand(-s.spread, s.spread) * 0.5, so = {};
      if (typeof ent !== 'number' && ent.boss && !ent.boss.dead) { so.tgt = ent.boss; so.heavy = 1; mark(w, 'paternity'); sipShotAt(w, ent, ent.boss, lastK, so); } else sipShot(w, ent, a, Object.assign(so, { mul: lastK }));
    }
    sfx('shot');
  }
  function sipShotAt(w, ent, tg, mul, so) { sipShot(w, ent, Math.atan2(tg.y - G.player.y, tg.x - G.player.x), Object.assign({ mul }, so)); }

  function sipInstall(w) {
    w4Late(); const A = A4(w); if (A.sipI) return; A.sipI = 1; A.sip = 1; A.pool = 0;
    wupOn(w, 'phit', (w, pr, e) => { if (pr.w4heavy) { heavy(e, 1); mark(w, 'heavy'); say('sh', e.x, e.y - e.r - 10, 'HEAVY', PINK, 11, 0.4); } });
  }
  const sipP = (k) => w => { sipInstall(w); A4(w).p = k; };

  wupReg(SI, {
    A: { name: 'Return to Womb', tag: 'HOLD', costs: 'nothing fires until the store is full.', shows: 'a placenta swelling round the sperm, then one big volley.', modes: 'KITE survives while it fills.',
      lv3: { desc: 'Holds up to 25 eaten shots and fires them all as one volley once full. Nothing fires until then.', apply(w) {
        sipP('A')(w); const A = A4(w); A.full = true;
        wupOn(w, 'stats', (w, s) => { s.mag = Math.max(s.mag, 25); });
      } },
      lv6: [
        C('Full Term', 'A full-store volley leaves in a tight cone, every shot at one target.', flag('tight')),
        C('Afterbirth', 'A full-store volley is followed a moment later by a second one of the same size at the nearest elite.', flag('after'))],
      wild: C('Hiccup', 'Each returned shot has a chance to fire twice.', flag('hic')) },
    B: { name: 'Umbilical Shield', tag: 'NEST', costs: 'returned shots do 40% less.', shows: 'a cord-and-membrane bubble that thickens as the store fills.', modes: 'NEST and HOLD stand in the bullets.',
      lv3: { desc: 'Each stored shot adds a little Membrane, building to a solid layer. Returned shots are 40% weaker.', apply(w) {
        sipP('B')(w); const A = A4(w); A.memb = true; A.dmgK = 0.6;
      } },
      lv6: [
        C('Suction Cup', 'While the Membrane holds, nearby enemy shots are pulled in to be eaten.', flag('pull')),
        C('Water Breaks', 'When the Membrane breaks, every stored shot bursts out in a ring.', flag('burst'))],
      wild: C('Re-Gift', 'Returned shots go to the furthest enemy in range, not the one that fired them.', flag('regift')) },
    C: { name: 'Eat the Rich', tag: 'HUNT', costs: 'small shots are no longer eaten.', shows: 'big shots visibly swallowed and spat back.', modes: 'HUNT goes near bosses and elites.',
      lv3: { desc: 'Big enemy shots count as 3 stored and come back at triple damage. Small shots are no longer eaten.', apply(w) {
        sipP('C')(w); A4(w).rich = true;
      } },
      lv6: [
        C('In One Ear', 'A returned big shot pierces everything in its path.', flag('rpierce')),
        C('Paternity Test', 'An eaten boss shot goes back to its boss, homing, as a heavy hit.', flag('boss'))],
      wild: C('Swap Meet', "Each returned shot copies the damage type and attack type of one of your other weapons, at random.", flag('swap')) },
    lv10: [
      { name: 'Mirror Womb', best: 'BC', desc: 'Half of all enemy shots that reach you bounce back at whoever fired them.', apply(w) { sipInstall(w); A4(w).mirror = true; } },
      { name: 'Let-Down Reflex', best: 'A', desc: 'Holds 40 shots; when full, it bursts in a ring of all 40, twice.', apply(w) {
        sipInstall(w); const A = A4(w); A.full = true; A.ring = true;
        wupOn(w, 'stats', (w, s) => { s.mag = Math.max(s.mag, 40); });
      } },
      { name: 'Bullet Sponge', best: 'AB', desc: 'Pulls in enemy shots from three times as far away.', apply(w) { sipInstall(w); wupOn(w, 'stats', (w, s) => { s.area *= 3; }); mark(w, 'sponge'); } }] });

  // ================================================================ 17. NAPPY MINES (Fire, Burst, delayed)
  function nmInstall(w) {
    w4Late(); const A = A4(w); if (A.nm) return; A.nm = 1; A.groups = [];
    wupOn(w, 'tick', nmTick);
  }
  const nmP = k => w => { nmInstall(w); A4(w).p = k; };
  const nmMines = w => G.proj.filter(q => q.mine && !q.dead && q.w === w);

  function nmTick(w, dt) {
    const A = A4(w), p = G.player, ms = nmMines(w);
    // Proximity Problems: a mine goes off as soon as an enemy is within 50; it blinks faster as they near.
    if (A.prox) {
      let blink = 0;
      for (const m of ms) {
        if (m.stick) continue;
        const e = nearE(m.x, m.y, 160);
        if (e && m.arm <= 0 && dist(e, m) < 50 + e.r && !e.egg) { m.dead = true; m.w4contact = e; mark(w, 'prox'); detonateMine(m); continue; }
        if (e && blink < 14) {
          blink++; m.w4b = (m.w4b || 0) - dt;
          if (m.w4b <= 0) { const k = clamp(dist(e, m) / 160, 0.1, 1); m.w4b = 0.1 + k * 0.5; ring(m.x, m.y, 7, '#ff4d6d', 0.14, 2); mark(w, 'blink'); }
        }
      }
    }
    // Crawling Baby: mines creep after the nearest enemy within 150.
    if (A.crawl) {
      for (const m of ms) {
        if (m.stick || m.arm > 0) continue;
        const e = nearE(m.x, m.y, 150, q => q.egg); if (!e) continue;
        const dd = dist(e, m) || 1, st = Math.min(dd, 45 * dt); m.x += (e.x - m.x) / dd * st; m.y += (e.y - m.y) / dd * st; m.w4crawl = (m.w4crawl || 0) + st;
        if (m.w4crawl > 12 && !(A.crawlT > G.realT)) { A.crawlT = G.realT + 0.4; mark(w, 'crawl'); }
      }
    }
    // Cluster Diaper: tape between linked mines, and their fuse does not run down (45 s at most).
    if (A.link) {
      A.tapeT = (A.tapeT || 0) - dt;
      for (const g of A.groups) {
        g.mines = g.mines.filter(m => !m.dead);
        if (g.fired || g.mines.length < 2) continue;
        for (const m of g.mines) { m.w4age = (m.w4age || 0) + dt; if (m.w4age < 45 && !m.stick) m.life += dt; }
        if (A.tapeT <= 0) for (let i = 1; i < g.mines.length; i++) line(g.mines[i - 1].x, g.mines[i - 1].y, g.mines[i].x, g.mines[i].y, 2.5, TAPE, 0.22);
      }
      if (A.tapeT <= 0) A.tapeT = 0.15;
      A.groups = A.groups.filter(g => !g.fired && g.mines.length);
    }
    // Changing Mat: stop swimming and a ring of mines is laid round you.
    if (A.mat) {
      const v = A.lp ? Math.hypot(p.x - A.lp.x, p.y - A.lp.y) / Math.max(dt, 1e-3) : 999; // (how far you swam since last frame)
      A.lp = { x: p.x, y: p.y };
      A.still = v < 25 ? (A.still || 0) + dt : 0;
      if (A.still > 0.6 && !(A.matT > G.t)) {
        A.matT = G.t + 3; A.still = 0;
        for (let i = 0; i < 6; i++) { const a = i / 6 * TWO; G.proj.push(mineDrop(w, p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 70)); }
        mineTrim(); mark(w, 'mat'); ring(p.x, p.y, 70, FIRE, 0.4, 4); floatText(p.x, p.y - 36, 'CHANGING MAT', FIRE, 13, 0.8);
      }
    }
    // patches: the Flare Up ends
    for (const z of G.zones) {
      const Z = z.w4; if (!Z || Z.w !== w) continue;
      if (Z.flareEnd && G.t > Z.flareEnd) { Z.flareEnd = 0; z.r = Z.baseR; z.r0 = Z.baseR0; }
    }
  }

  const nmDrop0 = mineDrop;
  mineDrop = function (w, x, y) {
    const pr = nmDrop0(w, x, y), A = w && w.w4;
    if (!A || !A.nm) return pr;
    pr.w4age = 0;
    if (A.nukeEvery) { A.nukeN = (A.nukeN || 0) + 1; if (A.nukeN % A.nukeEvery === 0) { pr.nuke = true; pr.color = WHITE; mark(w, 'nuke'); } }
    if (A.link) { // link to a mine within 120 (a group of 8 at most)
      let near = null, bd = 120 * 120;
      for (const q of G.proj) { if (!q.mine || q.dead || q.w !== w || q === pr) continue; const d2 = (q.x - x) * (q.x - x) + (q.y - y) * (q.y - y); if (d2 < bd && (!q.w4g || (!q.w4g.fired && q.w4g.mines.length < 8))) { bd = d2; near = q; } }
      if (near) {
        const g = near.w4g || (near.w4g = { mines: [near], fired: false });
        if (!A.groups.includes(g)) A.groups.push(g);
        pr.w4g = g; g.mines.push(pr); mark(w, 'link');
      }
    }
    return pr;
  };
  const nmScale0 = mineScale;
  mineScale = function (pr) {
    const o = nmScale0(pr);
    if (pr.w4rk) { o.k *= pr.w4rk; o.r *= pr.w4rk; }
    if (pr.w4big) o.r *= pr.w4big;
    return o;
  };

  function nmTri(x, y, R) { // a nappy: a triangle, point down
    const a = { x: x - R * 0.8, y: y - R * 0.55 }, b = { x: x + R * 0.8, y: y - R * 0.55 }, c = { x, y: y + R * 0.85 };
    line(a.x, a.y, b.x, b.y, 5, WHITE, 0.6); line(b.x, b.y, c.x, c.y, 5, WHITE, 0.6); line(c.x, c.y, a.x, a.y, 5, WHITE, 0.6);
  }
  const nmDet0 = detonateMine;
  detonateMine = function (pr) {
    const w = pr.w, A = w && w.w4;
    if (!A || !A.nm) return nmDet0(pr);
    const fuse = !(pr.life > 0) || pr.dominoK || pr.domChain || pr.w4bounce || pr.w4carry || pr.stick;
    // Hand-Me-Down: the enemy that touches a mine picks it up and carries it for 1 s.
    if (A.hand && !fuse) {
      const e = nearE(pr.x, pr.y, 60, q => q.boss || q.egg);
      if (e) {
        pr.dead = false; pr.stick = e; pr.fuse = 1; pr.arm = 99; pr.w4carry = 1;
        mark(w, 'carry'); floatText(e.x, e.y - e.r - 12, 'HAND-ME-DOWN', FIRE, 11, 0.8); ring(e.x, e.y, e.r + 6, FIRE, 0.3, 3);
        return;
      }
    }
    const contact = pr.w4contact || (!fuse ? nearE(pr.x, pr.y, 60, q => q.egg) : null);
    // Cluster Diaper: one blast sets off the whole linked group.
    const g = pr.w4g;
    if (g && !g.fired) {
      g.fired = true;
      const mem = g.mines.filter(m => m !== pr && !m.dead).sort((a, b) => dist(a, pr) - dist(b, pr)).slice(0, 7);
      mem.forEach((m, i) => {
        m.dead = true;
        if (A.grow && i < 2) m.w4rk = Math.pow(1.2, i + 1);
        if (A.pin && i === 1) m.w4big = 3;
        after(0.09 * (i + 1), () => { detonateMine(m); });
      });
      if (mem.length) {
        mark(w, 'group');
        if (A.grow) mark(w, 'grow');
        if (A.pin && mem.length >= 2) { mark(w, 'pin'); nmTri(mem[1].x, mem[1].y, 90); floatText(mem[1].x, mem[1].y - 30, 'NAPPY PIN', WHITE, 13, 0.9); }
      }
    }
    const zn = G.zones.length;
    nmDet0(pr);
    // Proximity Problems (Pass the Parcel): the enemy is flung towards the next mine.
    if (A.fling && contact && !contact.dead && !contact.boss) {
      const nx = nmMines(w).filter(m => m !== pr).sort((a, b) => dist(a, contact) - dist(b, contact))[0];
      if (nx) {
        const dx = nx.x - contact.x, dy = nx.y - contact.y, l = Math.hypot(dx, dy) || 1;
        contact.kx += dx / l * 480; contact.ky += dy / l * 480; mark(w, 'fling'); line(contact.x, contact.y, nx.x, nx.y, 2, FIRE, 0.25); say('fl', contact.x, contact.y - 20, 'PASS', FIRE, 10, 0.4);
      }
    }
    // the patch this blast left (Lingering Smoulder)
    for (let i = G.zones.length - 1; i >= zn && i >= 0; i--) {
      const z = G.zones[i];
      if (z.src && z.src.wname === 'Nappy Mines (pool)' && !z.w4) nmPatch(w, z);
    }
    // Bouncy Castle: the mine hops 100 units on and goes off once more.
    if (A.bounce && !pr.w4bounce && !pr.dominoK && !pr.w4big) {
      const t = nearE(pr.x, pr.y, 400, q => q.egg), a = t ? Math.atan2(t.y - pr.y, t.x - pr.x) : Math.random() * TWO;
      const nx = pr.x + Math.cos(a) * 100, ny = pr.y + Math.sin(a) * 100;
      line(pr.x, pr.y, nx, ny, 3, FIRE, 0.4); ring(nx, ny, 22, FIRE, 0.4, 3); mark(w, 'bounce');
      after(0.4, () => { const c = Object.assign({}, pr, { x: nx, y: ny, w4bounce: 1, dead: true, arm: 0, w4g: null, w4rk: 0, w4big: 0 }); detonateMine(c); });
    }
  };
  function nmPatch(w, z) {
    const A = A4(w);
    z.w4 = { w, born: G.t }; mark(w, 'patch');
    if (A.patchR) z.r *= A.patchR;
    if (A.patchLife) { z.life = z.max = A.patchLife; }
    z.r0 = z.r; if (A.patchGrow) z.grow = A.patchGrow;
    if (A.merge) { // patches that touch merge into one bigger patch (radius 160 at most)
      for (const o of G.zones) {
        if (o === z || !o.w4 || o.w4.w !== w || o.life <= 0.05) continue;
        if (Math.hypot(o.x - z.x, o.y - z.y) < Math.max(o.r, z.r)) {
          o.r = Math.min(160, Math.sqrt(o.r * o.r + z.r * z.r)); o.r0 = Math.max(o.r0 || 0, o.r); o.life = o.max = Math.max(o.life, z.life); o.dps = Math.max(o.dps, z.dps) * 1.1;
          z.life = 0.001; z.quiet = true; mark(w, 'merge'); ring(o.x, o.y, o.r, FIRE, 0.4, 4); floatText(o.x, o.y - 20, 'POOLING', FIRE, 11, 0.7);
          break;
        }
      }
    }
  }
  lateFns.push(() => { const nmPay0 = fightPayoff;
  fightPayoff = function (e, kind, res, src) {
    nmPay0(e, kind, res, src);
    if (kind === 'ignite' && G && !e.dead) {
      for (const z of G.zones) { // Flare Up: an enemy that ignites on a patch makes it flare to double size for 1 s
        const Z = z.w4; if (!Z || z.life <= 0.05 || !Z.w.w4.flare || Z.flareEnd || Z.flareCd > G.t) continue;
        if (Math.hypot(e.x - z.x, e.y - z.y) > z.r + e.r) continue;
        Z.flareCd = G.t + 3; Z.flareEnd = G.t + 1; Z.baseR = z.r; Z.baseR0 = z.r0 || z.r; z.r *= 2; z.r0 = z.r;
        mark(Z.w, 'flare'); ring(z.x, z.y, z.r, FIRE, 0.5, 6); floatText(z.x, z.y - z.r * 0.4, 'FLARE UP', FIRE, 13, 0.9);
        break;
      }
    }
  }; });

  wupReg(NM, {
    A: { name: 'Proximity Problems', tag: 'KITE', costs: 'blasts do 15% less damage.', shows: 'mines blinking faster as enemies near.', modes: 'KITE lays them in the path of pursuers.',
      lv3: { desc: 'Mines also go off when an enemy comes close, not just on their fuse. Blasts are 15% weaker.', apply(w) {
        nmP('A')(w); A4(w).prox = true; wupOn(w, 'stats', (w, s) => { s.dmg *= 0.85; });
      } },
      lv6: [
        C('Pass the Parcel', 'A mine set off by contact flings the enemy back towards the next mine.', flag('fling')),
        C('Crawling Baby', 'Mines crawl slowly after the nearest enemy.', flag('crawl'))],
      wild: C('Hand-Me-Down', 'An enemy that touches a mine carries it back into its group before it goes off.', flag('hand')) },
    B: { name: 'Cluster Diaper', tag: 'HOLD', costs: 'linked mines do not go off on their own until an enemy touches one in the group.', shows: 'taped-together mines going off in sequence.', modes: 'HOLD and NEST drop mines in one place.',
      lv3: { desc: 'Mines dropped close together are taped into a group that goes off at once, but only after an enemy touches one.', apply(w) {
        nmP('B')(w); A4(w).link = true;
      } },
      lv6: [
        C('Compound Interest', 'Each mine in a chain goes off bigger than the one before.', flag('grow')),
        C('Nappy Pin', 'A chain of 3 ends in one huge, nappy-shaped blast.', flag('pin'))],
      wild: C('Changing Mat', 'When you stop swimming, a ring of mines is laid round you.', flag('mat')) },
    C: { name: 'Lingering Smoulder', tag: 'KITE', costs: 'the blast itself is 25% weaker.', shows: 'smouldering patches spreading behind you.', modes: 'KITE turns a retreat into a burning route.',
      lv3: { desc: 'Each blast\'s burning patch lasts longer and slowly grows. Blasts are 25% weaker.', apply(w) {
        nmP('C')(w); const A = A4(w); A.patchLife = 5.25; A.patchGrow = 8; wupOn(w, 'stats', (w, s) => { s.dmg *= 0.75; });
      } },
      lv6: [
        C('Pooling Resources', 'Burning patches that touch merge into one bigger patch.', flag('merge')),
        C('Flare Up', 'An enemy that catches fire on a patch makes it flare out to double size for a moment.', flag('flare'))],
      wild: C('Bouncy Castle', 'A blast throws its mine further on, where it goes off once more.', flag('bounce')) },
    lv10: [
      { name: 'Nuclear Nappy', best: 'B', desc: 'Every 4th mine is a nuke: a far bigger blast for far more damage.', apply(w) { nmInstall(w); A4(w).nukeEvery = 4; } },
      { name: 'Minefield', best: 'AB', desc: 'Three mines per drop, twice as often, and they last twice as long.', apply(w) {
        nmInstall(w); wupOn(w, 'stats', (w, s) => { s.count *= 3; s.cd *= 0.5; s.life *= 2; }); mark(w, 'field');
      } },
      { name: 'Nappy Rash', best: 'C', desc: 'Burning patches are three times the size, last longer and merge.', apply(w) {
        nmInstall(w); const A = A4(w); A.patchR = 1.75; A.patchLife = 6; A.patchGrow = 8; A.merge = true;
      } }] });
  // Pass the Parcel / Compound Interest etc. rely on the Lv 3 flags being set before the blast: nothing else to wire.

  // ================================================================ 13. SOULMATE SIGNAL (Static, Beam, anchored)
  function twInstall(w) {
    const A = A4(w); if (A.tw) return; A.tw = 1; A.ex = []; A.ramp = [];
    wupOn(w, 'dmg', twDmg); wupOn(w, 'tick', twTick);
  }
  const twP = k => w => { twInstall(w); A4(w).p = k; };
  function twDmg(w, e, src) {
    if (src && src.w4raw) return 1;
    const A = A4(w); let k = 1;
    if (A.stretch) { const t = w.twins && w.twins[0]; if (t) k *= 1 + 0.6 * pull01(dist(t, G.player), 0, w.s.range); }
    if (A.rampOn) { const r = A.ramp.filter(t => t > G.t).length; k *= (1 + 0.1 * r) * (r < 3 ? 0.8 : 1); }
    if (A.fused) k *= 4;
    return k;
  }
  const twRamp = A => A.ramp.filter(t => t > G.t).length;
  const tpWrap0 = twinPoints;
  twinPoints = function (w) {
    const pts = tpWrap0(w), A = w && w.w4;
    if (!A || !A.tw) return pts;
    if (A.fused) { // Conjoined Twins: fused beside you, one beam straight ahead
      const p = G.player, L = Math.min(1500, w.s.range * 0.98), a = A.fa == null ? (p.face || 0) : A.fa;
      return [{ x: p.x + Math.cos(a) * L, y: p.y + Math.sin(a) * L }];
    }
    if (A.evil && A.evil.on && A.evil.pos && pts.length) pts[0] = A.evil.pos;
    return pts;
  };
  function twScan(w) { // every enemy on a beam right now
    const s = w.s, on = new Set();
    for (const [a, c] of twinSegs(w)) alongLine(a, c, s.width, e => on.add(e));
    return on;
  }
  function twTick(w, dt) {
    const A = A4(w), s = w.s, p = G.player;
    if (!w.twins) return;
    // per frame -------------------------------------------------
    if (A.fused) { const t = nearE(p.x, p.y, s.range); A.fa = t ? Math.atan2(t.y - p.y, t.x - p.x) : (p.face || 0); mark(w, 'fused'); }
    if (A.evil) { // Evil Twin: once a wave the twin goes off on its own for 5 s after the nearest elite
      const E = A.evil, key = G.wave ? G.wave.n : Math.floor(G.t / 25);
      if (!E.on && key !== E.key) {
        const el = acquire('elite', 900, p.x, p.y);
        if (el && w.twins[0]) { E.on = true; E.key = key; E.t = 5; E.tgt = el; E.pos = { x: w.twins[0].x, y: w.twins[0].y }; mark(w, 'evil'); floatText(p.x, p.y - 40, 'EVIL TWIN', '#b06cff', 14, 1); }
      }
      if (E.on) {
        E.t -= dt;
        if (E.t <= 0 || !E.tgt || E.tgt.dead) { E.on = false; E.pos = null; }
        else {
          const dx = E.tgt.x - E.pos.x, dy = E.tgt.y - E.pos.y, dd = Math.hypot(dx, dy) || 1, m = Math.min(dd, 300 * dt);
          E.pos.x += dx / dd * m; E.pos.y += dy / dd * m;
          const px = E.pos.x - p.x, py = E.pos.y - p.y, pd = Math.hypot(px, py), lim = s.range * 0.98;
          if (pd > lim) { E.pos.x = p.x + px / pd * lim; E.pos.y = p.y + py / pd * lim; }
          if (!(E.fxT > G.realT)) { E.fxT = G.realT + 0.2; ring(E.pos.x, E.pos.y, 16, '#b06cff', 0.3, 3); }
        }
      }
    }
    if (A.tug && w.twins[0]) { // Tug of Love: the twin's end drags what it touches towards you
      const t = w.twins[0]; let n = 0;
      forNear(t.x, t.y, 34, e => { if (e.dead || e.egg) return; pullTo(e, p.x, p.y, 170, dt); n++; });
      if (n && !(A.tugT > G.realT)) { A.tugT = G.realT + 0.4; mark(w, 'tug'); ring(t.x, t.y, 34, YEL, 0.3, 2); }
    }
    if (A.mirrorImg && w.twins[0]) { // Mirror Image: a quarter of the shots aimed at you hit your twin instead
      const t = w.twins[0];
      for (const b of G.ebul) {
        if (b.dead || b.w4m) continue;
        const dx = p.x - b.x, dy = p.y - b.y, dd = Math.hypot(dx, dy);
        if (dd < 110 && dx * b.vx + dy * b.vy > 0) {
          b.w4m = 1;
          if (Math.random() < 0.25) { b.dead = true; mark(w, 'mirror'); line(b.x, b.y, t.x, t.y, 2, YEL, 0.2, true); ring(t.x, t.y, 20, YEL, 0.3, 3); say('mir', t.x, t.y - 22, 'MIRROR', YEL, 11, 0.4); }
        }
      }
    }
    // every 0.2 s (the beam's own tick) -------------------------
    A.t4 = (A.t4 || 0) - dt; if (A.t4 > 0) return; A.t4 = 0.2;
    const segs = twinSegs(w), on = twScan(w);
    if (A.rampOn) { // Toxic Codependency: every enemy crossed adds 10% for 2 s (+100% at most)
      for (const e of on) if (!(e.w4cx > G.t)) { e.w4cx = G.t + 2; A.ramp.push(G.t + 2); mark(w, 'cross'); }
      A.ramp = A.ramp.filter(t => t > G.t).slice(-10);
      const r = A.ramp.length;
      if (r) for (const [a, c] of segs) line(a.x, a.y, c.x, c.y, 3 + r * 0.7, r >= 10 && A.white ? WHITE : '#fff3b0', 0.25, true);
      if (r >= 10 && A.white) { // Boiling Point: the full beam Charges everything it touches for 3 s
        for (const e of on) { e.chargeT = Math.max(e.chargeT || 0, G.t + 3); }
        if (on.size) { mark(w, 'white'); say('wh', p.x, p.y - 36, 'WHITE HOT', WHITE, 12, 1); }
      }
      if (r >= 10 && A.swap && !(A.swapT > G.t) && w.twins[0]) { // Swapsies: you and your twin trade places, hitting everything on the line
        const t = w.twins[0], from = { x: p.x, y: p.y };
        if (Math.hypot(t.x, t.y) < CORE.arena - 60) {
          A.swapT = G.t + 4; p.x = t.x; p.y = t.y; p.iframes = Math.max(p.iframes, 0.4);
          alongLine(from, t, 22, e => damageEnemy(e, s.dmg * 2, cardSrc(w, { wname: 'Swapsies' })));
          line(from.x, from.y, t.x, t.y, 8, WHITE, 0.4, true); A.ramp.length = 0; mark(w, 'swapped'); floatText(p.x, p.y - 34, 'SWAPSIES', YEL, 14, 0.8);
        }
      }
    }
    if (A.fingers) { // Sticky Fingers: gems the beam crosses are dropped at your feet
      let n = 0;
      for (const g of G.gems) {
        if (g.dead || n >= 8 || Math.hypot(g.x - p.x, g.y - p.y) < 40) continue;
        let hit = false;
        for (const [a, c] of segs) if (segD(g.x, g.y, a, c) < s.width + 14) { hit = true; break; }
        if (hit) { line(g.x, g.y, p.x, p.y, 1.5, YEL, 0.15); g.x = p.x + rand(-14, 14); g.y = p.y + rand(-14, 14); n++; }
      }
      if (n) { mark(w, 'gems'); say('gem', p.x, p.y - 30, 'STICKY', YEL, 11, 0.5); }
    }
    if (A.thirdOn) { // Third Wheel: a Charged enemy on the beam throws a second, shorter beam to the nearest enemy for 1 s
      A.ex = A.ex.filter(x => x.t > 0 && !x.a.dead && !x.b.dead);
      const max = A.moreEx ? 3 : 1;
      for (const e of on) {
        if (A.ex.length >= max) break;
        if (!(e.chargeT > G.t) || A.ex.some(x => x.a === e)) continue;
        const b = nearE(e.x, e.y, 260, q => q === e || q.egg); if (!b) continue;
        A.ex.push({ a: e, b, t: 1 }); mark(w, 'extra');
      }
      for (const x of A.ex) {
        x.t -= 0.2;
        line(x.a.x, x.a.y, x.b.x, x.b.y, 5, YEL, 0.25, true);
        alongLine(x.a, x.b, s.width * 0.8, q => { if (q !== x.a) damageEnemy(q, s.dmg * 0.12, cardSrc(w, { wname: 'Third Wheel' })); });
        mark(w, 'extrahit');
      }
      if (A.moreEx) { // Crossed Wires: a spark where beams cross
        let sparks = 0;
        const all = segs.map(([a, c]) => [a, c]).concat(A.ex.map(x => [x.a, x.b]));
        for (let i = 0; i < A.ex.length && sparks < 3; i++) {
          const ea = A.ex[i];
          for (let j = 0; j < all.length && sparks < 3; j++) {
            if (all[j][0] === ea.a && all[j][1] === ea.b) continue;
            const pt = segX(ea.a, ea.b, all[j][0], all[j][1]); if (!pt) continue;
            sparks++; forNear(pt.x, pt.y, 50, q => { damageEnemy(q, s.dmg * 0.4, cardSrc(w, { wname: 'Mixed Signals' })); });
            ring(pt.x, pt.y, 50, YEL, 0.3, 3); fxParts('spark', pt.x, pt.y, YEL, 6, 120, 0.3, 2.5); mark(w, 'spark');
          }
        }
      }
    }
    if (A.tri && w.twins.length >= 2) { // Love Triangle: the three of you make a triangle and everything inside is Charged
      const t0 = w.twins[0], t1 = w.twins[1], P = [p, t0, t1];
      line(t0.x, t0.y, t1.x, t1.y, 5, YEL, 0.25, true); mark(w, 'tri');
      alongLine(t0, t1, s.width, q => { damageEnemy(q, s.dmg * 0.12, cardSrc(w, { wname: 'Love Triangle' })); });
      const cx = (p.x + t0.x + t1.x) / 3, cy = (p.y + t0.y + t1.y) / 3, R = Math.max(dist(p, { x: cx, y: cy }), dist(t0, { x: cx, y: cy }), dist(t1, { x: cx, y: cy }));
      let n = 0; forNear(cx, cy, R, q => { if (!q.dead && !q.charmed && inPoly(q.x, q.y, P)) { q.chargeT = Math.max(q.chargeT || 0, G.t + 3); n++; } });
      if (n) { mark(w, 'trifill'); if (!(A.triT > G.realT)) { A.triT = G.realT + 0.5; ring(cx, cy, 30, YEL, 0.4, 3); } }
    }
    if (A.psy) { // Psychic Link: every 1.5 s a pulse runs along every beam for 300%, tagged Poise
      A.psyT = (A.psyT || 0) + 0.2;
      if (A.psyT >= 1.5) {
        A.psyT = 0; const seen = new Set();
        for (const [a, c] of segs) {
          line(a.x, a.y, c.x, c.y, 12, WHITE, 0.35, true);
          alongLine(a, c, s.width * 1.5, e => { if (seen.has(e)) return; seen.add(e); damageEnemy(e, s.dmg * 3, cardSrc(w, { wname: 'Psychic Link' })); poise(e, 0.5); });
        }
        mark(w, 'psychic'); floatText(p.x, p.y - 40, 'PSYCHIC LINK', WHITE, 13, 0.8);
      }
    }
  }

  wupReg(TW, {
    A: { name: 'Long-Distance Love', tag: 'KITE', costs: 'much harder to keep the beam on one target.', shows: 'a long beam slashing across the screen.', modes: 'KITE and ORBIT both sweep it naturally.',
      lv3: { desc: 'Your twin stays twice as far away, so the beam is twice as long. Much harder to keep it on one target.', apply(w) {
        twP('A')(w); wupOn(w, 'stats', (w, s) => { s.range *= 2; }); mark(w, 'long');
      } },
      lv6: [
        C('Absence Makes It Grow', 'Beam damage grows with its length, strongest at full stretch.', flag('stretch')),
        C('Tug of Love', "The twin's end drags anything it touches along the beam towards you.", flag('tug'))],
      wild: C('Evil Twin', 'Once a wave your twin goes off alone for a few seconds, chasing the nearest elite with its end of the beam.', w => { A4(w).evil = { on: false, key: null, t: 0 }; }) },
    B: { name: 'Toxic Codependency', tag: 'ORBIT', costs: '-20% beam damage when crossing few enemies.', shows: 'the beam brightening step by step as it sweeps.', modes: 'ORBIT.',
      lv3: { desc: 'Each enemy the beam crosses boosts it for a short while, stacking up. Weaker when crossing only a few.', apply(w) {
        twP('B')(w); A4(w).rampOn = true;
      } },
      lv6: [
        C('Boiling Point', 'At full boost the beam turns white and Charges everything it touches.', flag('white')),
        C('Swapsies', 'At full boost your twin swaps places with you along the beam, hitting everything on the line.', flag('swap'))],
      wild: C('Gold Digger', 'The beam picks up the gems it crosses and drops them at your feet.', flag('fingers')) },
    C: { name: 'Third Wheel', tag: 'HUNT', costs: 'the main beam is 20% thinner.', shows: 'branching beams and crossing sparks.', modes: 'ORBIT and HUNT weave through clusters.',
      lv3: { desc: 'A Charged enemy hit by the beam throws a short second beam to the nearest enemy. Main beam 20% thinner.', apply(w) {
        twP('C')(w); A4(w).thirdOn = true; wupOn(w, 'stats', (w, s) => { s.width *= 0.8; });
      } },
      lv6: [
        C('Mixed Signals', 'Up to 3 extra beams at once; where two cross, a spark hits everything near it.', flag('moreEx')),
        C('Love Triangle', 'A third anchor joins: the beams form a triangle and everything inside it is Charged.', w => { A4(w).tri = true; wupOn(w, 'stats', (w, s) => { s.count = Math.min(5, s.count + 1); }); })],
      wild: C('Mirror Image', 'Some enemy shots aimed at you hit your twin instead. It cannot be hurt.', flag('mirrorImg')) },
    lv10: [
      { name: 'Quadruplets', best: 'AC', desc: 'Two more twins join, each with its own beam.', apply(w) { twInstall(w); wupOn(w, 'stats', (w, s) => { s.count = Math.min(5, s.count + 2); }); mark(w, 'quads'); } },
      { name: 'Psychic Link', best: 'B', desc: 'Every so often a heavy pulse runs along every beam, knocking Poise off what it hits.', apply(w) { twInstall(w); A4(w).psy = true; } },
      { name: 'Conjoined Twins', best: 'B', desc: 'Your twin fuses beside you: one long, straight, far stronger beam ahead. No more sweeping.', apply(w) {
        twInstall(w); A4(w).fused = true; wupOn(w, 'stats', (w, s) => { s.range *= 3; });
      } }] });

  // ================================================================ 18. UNWANTED CONTACT (Static, Projectile, chaining)
  function ucInstall(w) {
    w4Late(); const A = A4(w); if (A.uc) return; A.uc = 1; A.balloons = [];
    wupOn(w, 'fire', ucFire); wupOn(w, 'tick', ucTick);
    wupOn(w, 'kill', (w, e, src) => {
      const B = A4(w);
      if (B.balloon && B.balloons.length < 6 && !(src && src.w4balloon)) { B.balloons.push({ x: e.x, y: e.y, age: 0 }); mark(w, 'balloon'); floatText(e.x, e.y - 14, 'balloon', '#ff7ad9', 11, 0.7); }
    });
  }
  const ucP = k => w => { ucInstall(w); A4(w).p = k; };
  const ucOpts = w => { const A = A4(w); return { jumps: Math.max(0, w.s.chain), jumpR: w.s.jump, fall: A.fall || 0.88, rise: A.rise, fork: A.fork }; };
  function ucNext(w, cur, hit, jumpR) {
    const A = A4(w);
    if (A.rodE && !A.rodE.dead && !hit.has(A.rodE) && A.rodE !== cur && dist(cur, A.rodE) < jumpR * 2.6) { mark(w, 'rodhit'); return A.rodE; }
    let best = null, bd = Infinity, bu = null, bud = Infinity;
    forNear(cur.x, cur.y, jumpR, (e, d2) => {
      if (e === cur || e.dead || e.charmed || e.egg || hit.has(e)) return;
      if (d2 < bd) { bd = d2; best = e; }
      if (A.fresh && !(e.chargeT > G.t) && d2 < bud) { bud = d2; bu = e; }
    });
    return A.fresh && bu ? bu : best;
  }
  // A bounded chain (a copy of game.js doChain with the cards): at most s.chain + 1 enemies per branch, one fork.
  // Switched to Fire (fitcheck.js lets Switched at Birth pick it): Wildfire. The chain is a flame that leaps enemy to
  // enemy: Fire hits (so they Burn and Ignite), a lick of flame along each jump, and each one it catches is marked as
  // kindling (the chain's Charged mark, so every card still finds them) and burns where you can see it.
  const ucWild = w => w.def.elem === 'flame', ucElem = w => (ucWild(w) ? 'flame' : 'shock'), FLAME = '#ff7a2f';
  function ucLick(w, fx, fy, e) {
    bolt(fx, fy, e.x, e.y, FLAME, 0.2);
    for (let i = 1; i <= 3; i++) { const t = i / 4; fxParts('ember', fx + (e.x - fx) * t, fy + (e.y - fy) * t, FLAME, 1, 50, 0.5, 3, -Math.PI / 2, 0.5); }
    e.chargeT = Math.max(e.chargeT || 0, G.t + 3);
    if (!(e.w4catchT > G.t)) { e.w4catchT = G.t + 3; say('catch' + (e.id || ''), e.x, e.y - e.r - 10, 'CAUGHT', FLAME, 10, 0.5); mark(w, 'caught'); }
  }
  function ucChain(w, x0, y0, first, dmg, src, o) {
    const A = A4(w), hit = new Set(), ends = [];
    const strike = (e, k, fx, fy) => {
      if (ucWild(w)) ucLick(w, fx, fy, e); else bolt(fx, fy, e.x, e.y, YEL, 0.16);
      damageEnemy(e, dmg * (o.rise ? Math.pow(1.25, k) : Math.pow(o.fall, k)), Object.assign({}, src, { elem: ucElem(w) }));
      hit.add(e);
    };
    const tail = (fromX, fromY, e, k) => {
      let cur = e, fx = fromX, fy = fromY, last = null;
      while (cur && k <= o.jumps) {
        strike(cur, k, fx, fy); last = cur; fx = cur.x; fy = cur.y;
        cur = ucNext(w, cur, hit, o.jumpR); k++;
      }
      if (last) ends.push(last);
    };
    if (!first) return hit;
    if (o.fork && o.jumps >= 1) { // Split Ends: at the first enemy the chain splits into two
      strike(first, 0, x0, y0);
      const n1 = ucNext(w, first, hit, o.jumpR); if (n1) hit.add(n1);
      const n2 = n1 ? ucNext(w, first, hit, o.jumpR) : null;
      if (n1) { hit.delete(n1); if (n2) hit.add(n2); tail(first.x, first.y, n1, 1); if (n2) hit.delete(n2); }
      if (n2) { tail(first.x, first.y, n2, 1); mark(w, 'fork'); ring(first.x, first.y, 26, YEL, 0.3, 3); }
      if (!n1) ends.push(first);
    } else tail(x0, y0, first, 0);
    if (A.glow) for (const e of ends) if (e && !e.dead) { e.chargeT = Math.max(e.chargeT || 0, G.t + 6); ring(e.x, e.y, e.r + 8, YEL, 0.6, 4); mark(w, 'afterglow'); }
    A.lastHit = hit.size;
    return hit;
  }
  function ucStorm(w, src) { // Brainstorm: the bolt reaches every Charged enemy on screen (12 at most)
    const p = G.player, s = w.s;
    const cs = G.enemies.filter(e => !e.dead && !e.egg && e.chargeT > G.t).sort((a, b) => dist(a, p) - dist(b, p)).slice(0, 12);
    if (!cs.length) return false;
    let fx = p.x, fy = p.y;
    for (const e of cs) { if (ucWild(w)) ucLick(w, fx, fy, e); else bolt(fx, fy, e.x, e.y, WHITE, 0.25); damageEnemy(e, s.dmg, Object.assign({}, src, { elem: ucElem(w) })); fx = e.x; fy = e.y; }
    mark(w, 'storm'); floatText(p.x, p.y - 44, ucWild(w) ? 'WILDFIRE' : 'STORM', ucWild(w) ? FLAME : WHITE, 18, 1); G.flashT = Math.max(G.flashT || 0, 0.1);
    return true;
  }
  function ucFire(w, target, src) {
    const A = A4(w), s = w.s, p = G.player;
    if (A.storm) { A.storm = false; if (ucStorm(w, src)) { sfx('zap'); return true; } }
    let ts = s.count > 1 ? acquireMany(aimDir(w), s.range, p.x, p.y, s.count) : [target];
    if (A.fresh && s.count <= 1) { const un = acquireMany(aimDir(w), s.range, p.x, p.y, 6).find(e => !(e.chargeT > G.t)); if (un) { ts = [un]; mark(w, 'fresh'); } }
    const o = ucOpts(w);
    for (const t of ts) { if (t) ucChain(w, p.x, p.y, t, s.dmg, Object.assign({}, src), o); }
    sfx('zap');
    return true;
  }
  function ucTick(w, dt) {
    const A = A4(w), s = w.s, p = G.player;
    // Odd Sock: one enemy each wave becomes a lightning rod
    if (A.sock) {
      const key = G.wave ? G.wave.n : Math.floor(G.t / 20);
      if (key !== A.rodKey && (!A.rodE || A.rodE.dead)) {
        const c = G.enemies.filter(e => !e.dead && !e.boss && !e.egg && dist(e, p) < 600);
        if (c.length) { A.rodE = c[Math.floor(Math.random() * c.length)]; A.rodKey = key; mark(w, 'rod'); floatText(A.rodE.x, A.rodE.y - A.rodE.r - 14, 'ODD SOCK', YEL, 13, 1); }
      }
      if (A.rodE && !A.rodE.dead && !(A.rodT > G.realT)) { A.rodT = G.realT + 0.3; ring(A.rodE.x, A.rodE.y, A.rodE.r + 8 + Math.random() * 4, YEL, 0.3, 3); fxParts('spark', A.rodE.x, A.rodE.y, YEL, 2, 60, 0.3, 2); }
    }
    // Bad Hair Day: Charged enemies are gently pulled towards each other
    if (A.hair) {
      const cs = G.enemies.filter(e => !e.dead && !e.egg && !e.boss && e.chargeT > G.t).slice(0, 24);
      if (cs.length > 1) {
        for (const e of cs) {
          let b = null, bd = 260;
          for (const o of cs) { if (o === e) continue; const d = dist(e, o); if (d < bd) { bd = d; b = o; } }
          if (b && bd > e.r + b.r + 4) pullTo(e, b.x, b.y, 38, dt);
        }
        if (!(A.hairT > G.realT)) { A.hairT = G.realT + 0.5; mark(w, 'hair'); say('hair', cs[0].x, cs[0].y - cs[0].r - 10, 'static cling', YEL, 10, 0.8); }
      }
    }
    // Balloon Animal: static balloons float to the nearest enemy and pop on it
    if (A.balloons.length) {
      for (const b of A.balloons) {
        b.age += dt;
        const e = nearE(b.x, b.y, 700, q => q.egg);
        if (e) { const dd = dist(e, b) || 1, st = Math.min(dd, 120 * dt); b.x += (e.x - b.x) / dd * st; b.y += (e.y - b.y) / dd * st; if (dd < e.r + 12) { b.pop = e; } }
        if (!(b.fxT > G.realT)) { b.fxT = G.realT + 0.1; G.fx.push({ type: 'flash', x: b.x, y: b.y, r: 9, color: '#ff7ad9', life: 0.14, max: 0.14 }); }
        if (b.age > 8) b.pop = b.pop || true;
      }
      for (const b of A.balloons) {
        if (!b.pop) continue;
        if (b.pop !== true) {
          forNear(b.x, b.y, 55, q => { if (!q.dead) damageEnemy(q, s.dmg * 1.2, cardSrc(w, { wname: 'Balloon Animal', w4balloon: 1 })); });
          ring(b.x, b.y, 55, '#ff7ad9', 0.4, 4); fxParts('spark', b.x, b.y, '#ff7ad9', 8, 130, 0.35, 2.5); floatText(b.x, b.y - 10, 'POP', '#ff7ad9', 12, 0.5); mark(w, 'pop');
        }
        b.dead = true;
      }
      A.balloons = A.balloons.filter(b => !b.dead);
    }
    // Grid Lock: every Charged enemy is joined to the nearest other Charged one by a live arc (8 at most)
    if (A.grid) {
      A.gridT = (A.gridT || 0) - dt;
      if (A.gridT <= 0) {
        A.gridT = 0.25;
        const cs = G.enemies.filter(e => !e.dead && !e.egg && e.chargeT > G.t).sort((a, b) => dist(a, p) - dist(b, p)).slice(0, 12);
        const seen = new Set(); let n = 0;
        for (const e of cs) {
          if (n >= 8) break;
          let b = null, bd = 420;
          for (const o of cs) { if (o === e) continue; const d = dist(e, o); if (d < bd) { bd = d; b = o; } }
          if (!b) continue;
          const key = e.id < b.id ? e.id + '_' + b.id : b.id + '_' + e.id;
          if (seen.has(key)) continue; seen.add(key); n++;
          line(e.x, e.y, b.x, b.y, 3, ucWild(w) ? FLAME : YEL, 0.3, true);
          alongLine(e, b, 10, q => { if (q === e || q === b || q.w4gT > G.t) return; q.w4gT = G.t + 0.5; damageEnemy(q, s.dmg * 0.4, cardSrc(w, { wname: 'Grid Lock' })); mark(w, 'gridhit'); });
        }
        if (n) mark(w, 'grid');
      }
    }
  }

  // Feedback Loop: arcs feed arcs (wrapper on fight.js fightArc)
  function ucLoopArc(w, e, amt, depth, maxDepth) {
    const A = A4(w);
    if (depth >= maxDepth || Math.random() >= 0.3) return;
    const t = nearE(e.x, e.y, 110, q => q === e || q.egg); if (!t) return;
    const a2 = amt * 0.5;
    bolt(e.x, e.y, t.x, t.y, ORG, 0.16);
    damageEnemy(t, a2, { elem: ucElem(w), arc: true, noArc: true, noCrit: true, atk: 'burst', wname: 'Feedback Loop' });
    mark(w, depth ? 'arc2' : 'arc1'); if (!depth) say('loop', t.x, t.y - 16, 'FEEDBACK', ORG, 10, 0.4);
    if (t.chargeT > G.t && !t.dead) ucLoopArc(w, t, a2, depth + 1, maxDepth);
  }
  let ucSrc = null; // the hit whose status call is running (so a weapon's own arcs don't feed its Feedback Loop)
  lateFns.push(() => { const ucFs0 = fightStatus;
  fightStatus = function (e, elem, dmg, src) { ucSrc = src; const r = ucFs0(e, elem, dmg, src); ucSrc = null; return r; };
  const ucArc0 = fightArc;
  fightArc = function (e, dmg, jumps) {
    const before = e.arcRT;
    ucArc0(e, dmg, jumps);
    if (G && G.weapons && e.arcRT !== before && e.arcRT > G.t) {
      for (const w of G.weapons) {
        const A = w && w.w4; if (!A || !A.loop || (ucSrc && ucSrc.w === w)) continue;
        A.arcN = (A.arcN || 0) + 1; mark(w, 'arcs');
        ucLoopArc(w, e, dmg * 0.7, 0, A.deep ? 3 : 1);
        if (A.stormOn && A.arcN % 20 === 0) { A.storm = true; mark(w, 'brew'); floatText(G.player.x, G.player.y - 30, 'STORM BREWING', WHITE, 12, 0.9); }
      }
    }
  }; });
  // Conductive Personality: Charged enemies take +20% from all your weapons
  const ucDm0 = wupDmgMul;
  wupDmgMul = function (e, src) {
    let k = ucDm0(e, src);
    if (src && src.w && !src.dot && e.chargeT > G.t && anyW('cond')) k *= 1.2;
    return k;
  };
  // Last Spark: a Charged enemy dying makes all your weapons fire 20% faster for 2 s (does not stack)
  const ucKill0 = killEnemy;
  killEnemy = function (e, src) {
    const ch = !!(e && e.chargeT > G.t && !e.egg);
    ucKill0(e, src);
    if (ch && G && e.dead && G.weapons) {
      const w = G.weapons.find(x => x && x.w4 && x.w4.haste);
      if (w) {
        if (!(G.w4haste > G.t)) { mark(w, 'haste'); ring(G.player.x, G.player.y, G.player.r + 14, YEL, 0.5, 4); floatText(G.player.x, G.player.y - 34, 'LAST SPARK', YEL, 12, 0.8); }
        G.w4haste = G.t + 2;
      }
    }
  };
  const ucRate0 = rateBonus;
  rateBonus = function () { return ucRate0() * (G && G.w4haste > G.t ? 1.2 : 1); };
  // Tumble Dryer: 20% of the hits from your other weapons start a chain
  const ucHit0 = wupHit;
  wupHit = function (e, res, src) {
    ucHit0(e, res, src);
    if (!src || !src.w || src.wupEcho || src.echo || src.arc || src.dot || !G || !G.weapons || e.dead) return;
    const T = G.weapons.find(x => x && x.w4 && x.w4.dryer);
    if (!T || src.w === T || G.w4dryT > G.realT) return;
    if (Math.random() < 0.2) {
      G.w4dryT = G.realT + 0.08;
      ucChain(T, e.x, e.y, e, T.s.dmg, cardSrc(T, { wname: 'Tumble Dryer' }), ucOpts(T));
      mark(T, 'dryer'); say('dry', e.x, e.y - e.r - 12, 'TUMBLE', YEL, 10, 0.4);
    }
  };

  wupReg(UC, {
    A: { name: "It's Spreading", tag: 'ORBIT', costs: 'each jump loses more (the chain keeps 75% a jump, from 88%).', shows: 'long branching arcs across the crowd.', modes: 'ORBIT keeps a crowd within jump range.',
      lv3: { desc: 'The chain makes 3 more jumps and reaches further between enemies, but each jump loses more damage.', apply(w) {
        ucP('A')(w); A4(w).fall = 0.75; wupOn(w, 'stats', (w, s) => { s.chain += 3; s.jump = Math.max(s.jump, 140); });
      } },
      lv6: [
        C('Split Ends', 'At the first enemy the chain splits into two chains.', flag('fork')),
        C('Still Buzzing', 'The last enemy in each chain stays Charged for twice as long.', flag('glow'))],
      wild: C('Bad Hair Day', 'Charged enemies are gently pulled towards each other, like hair to a balloon.', flag('hair')) },
    B: { name: 'Conductive Personality', tag: 'HUNT', costs: "Unwanted Contact's own damage is 30% lower.", shows: 'crackling Charged outlines on many enemies at once.', modes: 'HUNT pairs it with a heavy hitter.',
      lv3: { desc: 'Charged enemies take more damage from all your weapons, not just Static. Unwanted Contact\'s own damage is 30% lower.', apply(w) {
        ucP('B')(w); A4(w).cond = true; wupOn(w, 'stats', (w, s) => { s.dmg *= 0.7; });
      } },
      lv6: [
        C('Spread the Love', 'Unwanted Contact aims at enemies that are not yet Charged, spreading the setup.', flag('fresh')),
        C('Last Spark', 'When a Charged enemy dies, all your weapons fire faster for a moment.', flag('haste'))],
      wild: C('Odd Sock', 'One enemy each wave becomes a lightning rod: every chain passes through it.', flag('sock')) },
    C: { name: 'Feedback Loop', tag: 'ANY', costs: 'Unwanted Contact fires 25% slower.', shows: 'arcs spawning arcs in visible cascades.', modes: 'any mode with a fast-firing second weapon.',
      lv3: { desc: "When another weapon makes a Charged enemy arc, it may throw a second, smaller arc. Unwanted Contact fires 25% slower.", apply(w) {
        ucP('C')(w); A4(w).loop = true; wupOn(w, 'stats', (w, s) => { s.cd *= 1.33; });
      } },
      lv6: [
        C('Echo Chamber', 'A second arc that lands on another Charged enemy can throw one more.', flag('deep')),
        C('Brainstorm', 'Every 20 arcs, the next bolt chains to every Charged enemy on screen.', flag('stormOn'))],
      wild: C('Balloon Animal', 'A chain that kills leaves a static balloon that floats to the nearest enemy and pops on it.', flag('balloon')) },
    lv10: [
      { name: 'Tumble Dryer', best: 'BC', desc: 'Some hits from all your other weapons start an Unwanted Contact chain.', apply(w) { ucInstall(w); A4(w).dryer = true; } },
      { name: 'Worked Up', best: 'A', desc: '8 jumps, and each jump hits harder than the last instead of weaker.', apply(w) {
        ucInstall(w); A4(w).rise = true; wupOn(w, 'stats', (w, s) => { s.chain = 8; });
      } },
      { name: 'Grid Lock', best: 'AB', desc: 'Each Charged enemy is joined to the nearest other by a live arc that hits anything crossing it.', apply(w) { ucInstall(w); A4(w).grid = true; } }] });

  // ------------------------------------------------------------ wrappers shared with the other wup files and this one
  if (!globalThis.WUP_PROJ_HOOKS) { // the 'phit' and 'pend' hook kinds (shared by every wup*.js file)
    globalThis.WUP_PROJ_HOOKS = 1;
    const ph = projHit, pe = projEnd;
    projHit = function (pr, e) { ph(pr, e); const w = pr.w; if (w && w.uh && w.uh.phit) for (const f of w.uh.phit) f(w, pr, e); };
    projEnd = function (pr) { pe(pr); const w = pr.w; if (w && w.uh && w.uh.pend) for (const f of w.uh.pend) f(w, pr); };
  }
  const us0 = updateSiphon;
  updateSiphon = function (w, dt) { if (w.w4 && w.w4.sip) return w4SipUpdate(w, dt); return us0(w, dt); };
  lateFns.push(() => { const siphonHurt0 = pdefHurt; // Umbilical Shield: the Membrane soaks damage before your health does
  pdefHurt = function (dmg, from, ent, kind) {
    let d = siphonHurt0(dmg, from, ent, kind);
    if (d > 0 && G && G.weapons) {
      for (const w of G.weapons) {
        const A = w && w.w4;
        if (!A || !A.memb || !(A.pool > 0)) continue;
        const a = Math.min(d, A.pool); A.pool -= a; d -= a; mark(w, 'soaked');
        const p = G.player; ring(p.x, p.y, p.r + 14, PINK, 0.3, 4);
        if (A.pool <= 1e-6) { A.pool = 0; if (A.burst) sipBreak(w); }
        if (d <= 0) return 0;
      }
    }
    return d;
  }; });
})();
