'use strict';
// Spawn Prawn - weapon branches, batch 5: Ewww, Gross (s_redtape), Blowing Bubbles (s_bubble), One of These Days (s_duedate),
// Sister Cousin (s_seeker). Spec: ../redesign docs/WEAPON_UPGRADES.md 19, 22, 23, 24. Engine and card interface: weapons24.js.
// Everything is inside one function (no globals). Each weapon has ONE dispatcher per hook kind that reads the flags its
// cards set on w.w5 (the Lv 3 card installs the dispatchers; Lv 6 and Lv 10 cards set a flag each). w.w5.fx counts each
// signature effect (the test reads it). Per-enemy scratch is e.w5.
// These four weapons' behaviour lives in toys.js (Red Tape, Bubble Wand, Due Date: bundles, bubbles and marks) and in the
// homing gun + modifiers.js 'multiplying' (Sister Cousin). The cards reach it by wrapping the toys.js / modifiers.js functions
// they change (canBubble, toyHold, bubbleSoak, bubbleHit, bubblePop, dueMark, duePop, toyHurt, modHit), each a no-op for a slot
// that has not taken a card; plus wupDmgMul (The Big Day), hooks.js hurt:before (Cotton Wool, Postponed, Lost in the Post), makeSlot
// (Sister Cousin starts with the 'multiplying' modifier, so a kill splits it as the weapon text says), v10Draw (marks, rings).
// Hook kinds used: stats, fire, tick, dmg (weapons24.js) and phit, pend (shared with wup1.js via globalThis.WUP_PROJ_HOOKS).
// Simplifications are listed in changes/claude-bold-hypatia-jadt4w.md.
(function () {
  const RT = 's_redtape', BB = 's_bubble', DD = 's_duedate', SC = 's_seeker';
  const TWO = Math.PI * 2;
  const RED = '#e01e2b', GRN = '#7fd04a', CYAN = '#9ff7ff', CRIM = '#a4133c', PINK = '#ff8fb3', BLUE = '#7fb6ff';
  const F = w => w.w5 || (w.w5 = { fx: {} });
  const fx = (w, k) => { const m = F(w).fx; m[k] = (m[k] || 0) + 1; };
  const E5 = e => e.w5 || (e.w5 = {});
  const liveW = w => !!(G && G.weapons && G.weapons.includes(w));
  const X = { hit: 0, depth: 0 }; // (context flags for the bubble wrappers)
  const throttleT = {};
  function say(key, x, y, txt, color, size, gap) { // floating text, at most once per gap seconds per key
    if ((throttleT[key] || 0) > G.realT) return;
    throttleT[key] = G.realT + (gap || 0.3); floatText(x, y, txt, color, size || 12, 0.7);
  }
  // A hit a card makes: real damage, but wupEcho so it never re-triggers hit hooks. echo=true makes it echo damage (matrix 12.1).
  function hit(w, atk, echo, extra) {
    return Object.assign(weaponSrc(w), { atk, knock: 0, mult: 1, wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name + (echo ? ' (echo)' : '') },
      echo ? { echo: true, noStatus: true } : null, extra);
  }
  function line(x1, y1, x2, y2, wd, c, life) {
    const L = G.v10fx || (G.v10fx = []);
    if (L.length > 160) return;
    L.push({ k: 'beam', x: x1, y: y1, x2, y2, w: wd, c, t: '', life: life || 0.15, max: life || 0.15 });
  }
  function shove(e, ux, uy, dist) { // knock e away along (ux, uy) by about dist units (bosses and eggs don't move)
    if (!e || e.dead || e.boss || e.egg || e.def.spongy || e.def.heavy) return false;
    const l = Math.hypot(ux, uy) || 1;
    const k = dist * 3.9 * (e.def.ai === 'aura' || e.def.hp > 200 ? 0.3 : 1) * (e.cd && e.cd.def === 'squishy' ? 0.5 : 1);
    e.kx += ux / l * k; e.ky += uy / l * k; return true;
  }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }
  function conjoin(a, b) { // Conjoined (fight.js fightTick): two creatures stick for 3 s
    for (const q of [a, b]) { q.conjT = G.t + 3; q.conjCd = G.t + 6; q.conjWith = q === a ? b : a; q.frozen = Math.max(q.frozen || 0, q.boss ? 0.5 : 3); }
    floatText((a.x + b.x) / 2, (a.y + b.y) / 2 - 14, 'CONJOINED', GRN, 11, 0.7);
  }
  const offscreen = (x, y) => { const sxx = sx(x), syy = sy(y); return sxx < -70 || sxx > W + 70 || syy < -70 || syy > H + 70; };
  const liveN = w => { let n = 0; for (const q of G.proj) if (q.w === w && !q.dead) n++; return n; };
  const bleedFill = (e, dps, by) => { const b = e.bleeds || (e.bleeds = []); while (b.length < 3) b.push({ dps, t: 3, by }); };
  // Sets a flag on the slot, installing the weapon's dispatchers first (so a mastery works on its own).
  const mk = inst => key => w => { inst(w); F(w)[key] = 1; };
  const mkP = inst => k => w => { inst(w); F(w).p = k; };

  // ================================================================ 19. EWWW, GROSS (Mucus, Projectile, shared damage)
  function rtInst(w) {
    const f = F(w); if (f.rt) return; f.rt = 1; f.bl = []; f.strips = [];
    wupOn(w, 'stats', rtStats); wupOn(w, 'tick', rtTick);
  }
  const rtSet = mk(rtInst), rtP = mkP(rtInst);
  function rtStats(w, s) {
    const f = F(w);
    if (f.p === 'A') { s.chain += 2; s.jump = 220; s.dur = 3; } // up to 6 linked (from 4), reach 220 (from 170); bundles last 3 s (from 5)
    else if (f.p === 'B') s.share = 0.2; // the shared damage drops to 20%
    else if (f.p === 'C') s.share = 0; // no damage is shared while they live
    if (f.bureau) s.share = 0.8;
  }
  function rtTick(w, dt) {
    const f = F(w), T = TOYS(), s = w.s; if (!s) return;
    for (const B of T.tapes) if (B.w === w && !B.w5k && !B.dead) { B.w5k = 1; B.w5m = B.members.slice(); B.w5pos = B.members.map(e => ({ x: e.x, y: e.y })); f.bl.push(B); }
    if (f.every) rtEvery(w, f, T);
    if (f.merge) rtMerge(w, f);
    for (const B of f.bl) {
      const prev = B.w5m || [], expired = G.t > B.end + 0.05;
      const gone = prev.filter(e => e.dead && !E5(e).sn);
      for (const d of gone) { E5(d).sn = 1; if (!expired && (f.p === 'C' || f.mad)) rtSnap(w, f, B, d, prev.filter(e => !e.dead)); }
      if (!B.dead) {
        const mem = B.members.filter(e => !e.dead);
        if (f.p === 'B') rtShare(w, f, B, mem);
        if (f.puppet) rtPuppet(w, f, mem, dt);
        if (f.gossip) rtGossip(w, f, B, mem);
        if (f.politics && G.t > (B.w5poT || 0)) { B.w5poT = G.t + 0.9; rtBump(w, f, mem); }
        B.w5m = mem.slice(); B.w5pos = mem.map(e => ({ x: e.x, y: e.y }));
      } else {
        B.w5end = 1;
        if (f.trail && B.w5pos && B.w5pos.length > 1) { // Paper Trail: the bundle's tape stays on the floor
          for (let i = 0; i < B.w5pos.length - 1 && i < 4; i++) {
            if (f.strips.length >= 12) f.strips.shift();
            const a = B.w5pos[i], b = B.w5pos[i + 1]; f.strips.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, life: 6, hit: new Map() });
          }
          fx(w, 'trail'); say('trail' + w.uid, B.w5pos[0].x, B.w5pos[0].y - 16, 'PAPER TRAIL', RED, 11, 0.5);
        }
      }
    }
    f.bl = f.bl.filter(B => !B.w5end);
    for (const st of f.strips) { // the strips snare whatever swims across them
      st.life -= dt;
      forNear((st.x1 + st.x2) / 2, (st.y1 + st.y2) / 2, Math.hypot(st.x2 - st.x1, st.y2 - st.y1) / 2 + 20, e => {
        if (e.dead || e.egg || e.charmed || (st.hit.get(e) || 0) > G.t) return false;
        if (segDist(e.x, e.y, st.x1, st.y1, st.x2, st.y2) > e.r + 5) return false;
        st.hit.set(e, G.t + 1.5); fightStatus(e, 'ice', 0, {}); e.snareT = Math.max(e.snareT, G.t + 3);
        fx(w, 'stripsnare'); ring(e.x, e.y, e.r + 6, RED, 0.3, 3); say('strip' + e.id, e.x, e.y - e.r - 8, 'STUCK', RED, 11, 0.4); return false;
      });
    }
    f.strips = f.strips.filter(st => st.life > 0);
    if (f.post) { // Lost in the Post: now and then a bundle includes you
      if (!f.youT) f.youT = G.t + 2;
      if (G.t >= f.youT) {
        f.youT = G.t + 8;
        let best = null, bd = 1e12; const p = G.player;
        for (const B of f.bl) { if (B.dead) continue; const c = B.members.find(e => !e.dead); if (!c) continue; const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; best = B; } }
        if (best) { f.you = { B: best, until: G.t + 4 }; fx(w, 'youtaped'); say('you' + w.uid, p.x, p.y - 30, 'TAPED TO YOU', RED, 12, 1); }
      }
    }
  }
  function rtShare(w, f, B, mem) { // Shared Trauma: a quarter of Snare, Burn and Corrosion flows along the tape, once a second
    if (G.t < (B.w5shT || 0)) return; B.w5shT = G.t + 1;
    const todo = [];
    for (const m of mem) {
      if (E5(m).got > G.t - 1.5) continue; // (what just arrived does not flow straight back)
      const cd = m.cd, st = snared(m), bf = cd ? (cd.burnT > 0 ? Math.max(0.25, cd.bars.fire) : cd.bars.fire) : 0, ba = cd ? Math.max(cd.bars.acid, corroded(m) ? 0.25 : 0) : 0;
      if (!st && bf < 0.05 && ba < 0.05) continue;
      for (const q of mem) if (q !== m) todo.push([m, q, st, bf, ba]);
    }
    for (const [m, q, st, bf, ba] of todo) {
      let kind = '';
      if (st && !(q.snareT > G.t + 0.6)) { q.snareT = G.t + 0.625; q.chill = Math.max(q.chill || 0, 0.6); q.chillAmt = Math.max(q.chillAmt || 0, q.boss ? 0.2 : 0.4); kind = 'snare'; }
      if (bf >= 0.05 && q.cd) { q.cd.bars.fire = Math.min(0.99, q.cd.bars.fire + 0.25 * bf); q.cd.barQuietT.fire = 0; kind = kind || 'burn'; }
      if (ba >= 0.05 && q.cd) { q.cd.bars.acid = Math.min(0.99, q.cd.bars.acid + 0.25 * ba); q.cd.barQuietT.acid = 0; if (corroded(m)) q.corrodedT = Math.max(q.corrodedT || 0, G.t + 0.25 * COMBAT.corrodedT); kind = kind || 'acid'; }
      if (!kind) continue;
      E5(q).got = G.t; fx(w, 'shared');
      line(m.x, m.y, q.x, q.y, 3, kind === 'snare' ? GRN : kind === 'burn' ? '#ff7a2f' : '#d7f06a', 0.45);
      say('shr' + q.id, q.x, q.y - q.r - 8, kind === 'snare' ? 'SHARED SNOT' : kind === 'burn' ? 'SHARED BURN' : 'SHARED ACID', GRN, 10, 0.5);
    }
  }
  function rtPuppet(w, f, mem, dt) { // Puppet Strings: a Possessed enemy drags its partners towards what it is after
    for (const m of mem) {
      if (!m.charmed) continue;
      let t = null, bd = 1e12;
      for (const o of G.enemies) { if (o.dead || o === m || o.egg || mem.includes(o)) continue; const d = (o.x - m.x) ** 2 + (o.y - m.y) ** 2; if (d < bd) { bd = d; t = o; } }
      if (!t) continue;
      for (const q of mem) {
        if (q === m || q.boss) continue;
        const dx = t.x - q.x, dy = t.y - q.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, 95 * dt), nx = q.x + dx / d * st, ny = q.y + dy / d * st;
        if (G.lvl && lvSolidAt(nx, ny)) continue;
        q.x = nx; q.y = ny; fx(w, 'puppet');
        if (G.frameN % 6 === 0) line(m.x, m.y, q.x, q.y, 2, RED, 0.2);
      }
      say('pup' + m.id, m.x, m.y - m.r - 10, 'PUPPET STRINGS', RED, 10, 0.8);
    }
  }
  function rtGossip(w, f, B, mem) { // Gossip: when one partner Ignites or loses a Shell layer, the rest do too (once per bundle)
    for (const m of mem) {
      const cd = m.cd, E = E5(m); if (!cd) continue;
      const burn = cd.burnT > 0, lay = cd.layers || 0;
      if (E.gb === undefined) { E.gb = burn; E.gl = lay; continue; }
      if (burn && !E.gb && !B.w5gI) {
        B.w5gI = 1;
        for (const q of mem) if (q !== m && q.cd) { burnAdd(q.cd, Math.max(10, (cd.burnPool || 0) / COMBAT.burnFrac)); q.burnBy = w.def.name; ring(q.x, q.y, q.r + 8, '#ff7a2f', 0.4, 4); line(m.x, m.y, q.x, q.y, 3, '#ff7a2f', 0.45); }
        fx(w, 'gossipburn'); say('gos' + B.w5gI + m.id, m.x, m.y - m.r - 10, 'GOSSIP', RED, 11, 0.6);
      }
      if (lay < (E.gl || 0) && !B.w5gL) {
        B.w5gL = 1;
        for (const q of mem) if (q !== m && q.cd && q.cd.def === 'shell' && q.cd.layers > 0) { dropLayer(q.cd, { layersLost: 0 }); ring(q.x, q.y, q.r + 8, FIGHT_COL.shell, 0.4, 4); line(m.x, m.y, q.x, q.y, 3, FIGHT_COL.shell, 0.45); }
        fx(w, 'gossiplayer'); say('gol' + m.id, m.x, m.y - m.r - 10, 'GOSSIP', RED, 11, 0.6);
      }
      E.gb = burn; E.gl = lay;
    }
  }
  function rtBump(w, f, mem) { // Office Politics: two partners bump and shove
    const c = mem.filter(e => !e.boss); if (c.length < 2) return;
    const a = c[Math.floor(Math.random() * c.length)]; let b = c[Math.floor(Math.random() * c.length)];
    if (b === a) b = c[(c.indexOf(a) + 1) % c.length];
    shove(a, b.x - a.x, b.y - a.y, 70); shove(b, a.x - b.x, a.y - b.y, 70);
    const d = (w.s.dmg || 10) * 0.4; // (a collision: 40% of the hit, echo damage)
    damageEnemy(a, d, hit(w, 'proj', true, { wname: 'Office Politics' })); damageEnemy(b, d, hit(w, 'proj', true, { wname: 'Office Politics' }));
    line(a.x, a.y, b.x, b.y, 4, RED, 0.25); ring((a.x + b.x) / 2, (a.y + b.y) / 2, 16, '#ffffff', 0.25, 3);
    say('bump' + a.id, (a.x + b.x) / 2, (a.y + b.y) / 2 - 12, 'BUMP', RED, 11, 0.3); fx(w, 'bump');
  }
  function rtMerge(w, f) { // Corporate Merger: two bundles that touch become one network (up to 10)
    const L = f.bl.filter(B => !B.dead && !B.w5end);
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const A = L[i], C = L[j];
      if (A.dead || C.dead || A.members.length + C.members.length > 10) continue;
      let touch = false;
      for (const a of A.members) { for (const c of C.members) if (!a.dead && !c.dead && Math.hypot(a.x - c.x, a.y - c.y) < a.r + c.r + 14) { touch = true; break; } if (touch) break; }
      if (!touch) continue;
      for (const c of C.members) { A.members.push(c); c.tape = A; }
      A.end = Math.max(A.end, C.end); A.max = Math.max(A.max, C.max); A.w5m = A.members.slice();
      C.members = []; C.dead = true; C.w5end = 1; fx(w, 'merge');
      const m0 = A.members[0]; ring(m0.x, m0.y, 40, RED, 0.4, 4); say('mrg' + w.uid, m0.x, m0.y - 20, 'MERGED', RED, 12, 0.5);
    }
  }
  function rtEvery(w, f, T) { // Red Tape Everywhere: every enemy on screen is in a bundle, re-formed every 3 s
    if (G.t < (f.evT || 0)) return; f.evT = G.t + 3;
    for (const B of T.tapes) if (B.w === w && !B.dead) { for (const e of B.members) if (e.tape === B) e.tape = null; B.members = []; B.dead = true; }
    const p = G.player;
    const pool = G.enemies.filter(e => !e.dead && !e.egg && !e.boss && toyCan(e) && !offscreen(e.x, e.y)).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, 60);
    const cap = Math.min(10, (w.s.chain || 3) + 1);
    let n = 0;
    while (pool.length > 1 && T.tapes.length < 40) {
      const g = [pool.shift()];
      while (g.length < cap) {
        const last = g[g.length - 1]; let bi = -1, bd = 300 * 300;
        for (let i = 0; i < pool.length; i++) { const d = (pool[i].x - last.x) ** 2 + (pool[i].y - last.y) ** 2; if (d < bd) { bd = d; bi = i; } }
        if (bi < 0) break; g.push(pool.splice(bi, 1)[0]);
      }
      if (g.length < 2) continue;
      const B = { w, members: g, end: G.t + 3.4, max: 3.4, stampT: G.t + 0.35 };
      for (const e of g) e.tape = B;
      T.tapes.push(B); n++;
    }
    if (n) { fx(w, 'everywhere'); floatText(p.x, p.y - 36, 'RED TAPE EVERYWHERE', RED, 14, 0.9); ring(p.x, p.y, 120, RED, 0.5, 5); }
  }
  function rtSnap(w, f, B, d, mem) { // a linked enemy died: the tape snaps
    B.w5n = (B.w5n || 0) + 1; fx(w, 'snap');
    say('snap' + d.id, d.x, d.y - d.r - 8, 'SNAP', RED, 14, 0.2); ring(d.x, d.y, d.r + 14, RED, 0.35, 5);
    const k = f.escal ? 1 + 0.5 * (B.w5n - 1) : 1, dm = d.maxHp * 0.3 * k;
    const weak = f.mad ? mem.filter(o => !o.dead && !o.boss && o.hp < o.maxHp * (o.elite ? 0.15 : 0.3)) : [];
    for (const o of mem) {
      if (o.dead) continue;
      line(d.x, d.y, o.x, o.y, 4, RED, 0.3);
      if (weak.includes(o)) { damageEnemy(o, o.hp + o.maxHp, hit(w, 'proj', true, { wname: 'Till Death Do Us Part' })); fx(w, 'mad'); say('mad' + o.id, o.x, o.y - o.r - 8, 'ASSURED', RED, 12, 0.3); }
      else if (f.p === 'C') damageEnemy(o, dm, hit(w, 'proj', true, { wname: 'Toxic Relationship' }));
      else if (f.mad && o.boss) damageEnemy(o, dm, hit(w, 'proj', true, { wname: 'Till Death Do Us Part' }));
    }
    if (f.escal && B.w5n > 1) say('esc' + d.id, d.x, d.y - d.r - 24, 'x' + k.toFixed(1), RED, 11, 0.3);
    if (f.knot) { // Tangled: the survivors are pulled together and Conjoined
      const al = mem.filter(o => !o.dead);
      if (al.length >= 2) {
        let cx = 0, cy = 0; for (const o of al) { cx += o.x; cy += o.y; } cx /= al.length; cy /= al.length;
        for (const o of al) if (!o.boss) { o.x += (cx - o.x) * 0.6; o.y += (cy - o.y) * 0.6; }
        for (let i = 0; i < al.length - 1; i++) conjoin(al[i], al[i + 1]);
        fx(w, 'knot');
      }
    }
  }
  wupReg(RT, {
    A: { name: 'Birds of a Feather', tag: 'Bigger networks', costs: 'bundles last 3 s (from 5).', shows: 'a web of red tape across the crowd.', modes: 'ORBIT keeps the network packed.',
      lv3: { desc: 'Bundles tape together more enemies, from further apart, but come unstuck sooner.', apply: rtP('A') },
      lv6: [{ name: 'Corporate Merger', desc: 'Two bundles that touch merge into one bigger network.', apply: rtSet('merge') },
        { name: 'Long Distance', desc: 'Hits shared along the tape reach bosses in full, however far apart the bundle drifts.', apply: rtSet('chat') }],
      wild: { name: 'Loose Ends', desc: 'When a bundle ends, its tape stays on the floor and Snares whatever crosses it.', apply: rtSet('trail') } },
    B: { name: 'Shared Trauma', tag: 'Share what is wrong with them', costs: 'the shared damage drops to 20%.', shows: 'statuses visibly flowing along the tape.', modes: 'any; strongest with a second weapon that applies statuses.',
      lv3: { desc: 'When one linked enemy is Snared, Burning or Corroded, its partners catch a share of it. Shared hit damage drops to 20%.', apply: rtP('B') },
      lv6: [{ name: 'Bad Influence', desc: 'A linked enemy that is Possessed drags its partners along after its targets.', apply: rtSet('puppet') },
        { name: 'Gossip', desc: 'When one partner Ignites or loses a Shell layer, every partner does too, once per bundle.', apply: rtSet('gossip') }],
      wild: { name: 'Office Politics', desc: 'Taped enemies blame each other: they bump and shove within their bundle.', apply: rtSet('politics') } },
    C: { name: 'Toxic Relationship', tag: 'Focus until it snaps', costs: 'no damage is shared while they live.', shows: 'the tape twanging tight, then snapping.', modes: 'HUNT focuses one linked enemy down.',
      lv3: { desc: 'When a linked enemy dies, the tape snaps and hits its partners hard. No damage is shared while they live.', apply: rtP('C') },
      lv6: [{ name: 'Tangled', desc: 'The snap pulls the survivors together, Conjoining them.', apply: rtSet('knot') },
        { name: 'Escalation', desc: 'Each snap in the same bundle hits harder than the last.', apply: rtSet('escal') }],
      wild: { name: 'Lost in the Post', desc: 'Now and then a bundle includes you, and much of each hit you take while taped is shared out to it.', apply: rtSet('post') } },
    lv10: [
      { name: 'Bureaucracy', best: 'A', desc: 'Bundles share most of every hit along the tape.', apply: rtSet('bureau') },
      { name: 'Small World', best: 'AB', desc: 'Every enemy in view is taped into a bundle, and the bundles re-form every few seconds.', apply: rtSet('every') },
      { name: 'Till Death Do Us Part', best: 'C', desc: 'When a linked enemy dies, badly hurt partners die with it. Bosses take a heavy hit instead.', apply: rtSet('mad') }] });

  // ================================================================ 22. BLOWING BUBBLES (Mucus, Projectile, traps)
  function bbInst(w) {
    const f = F(w); if (f.bb) return; f.bb = 1; f.soap = []; f.gum = [];
    wupOn(w, 'stats', bbStats); wupOn(w, 'fire', bbFire); wupOn(w, 'tick', bbTick);
  }
  const bbSet = mk(bbInst), bbP = mkP(bbInst);
  function bbStats(w, s) {
    const f = F(w);
    if (f.p === 'A') s.count = 1; // one bubble at a time (bbFire)
    else if (f.p === 'C') s.dur = 2; // bubbles hold enemies for 2 s (from 5)
  }
  function bbFire(w) { // Big Bubble Trouble: one bubble at a time
    const f = F(w);
    if (f.p !== 'A') return false;
    for (const b of TOYS().bubbles) if (b.w === w && !b.dead) return true;
    return false;
  }
  function bbTick(w, dt) {
    const f = F(w), T = TOYS(), s = w.s, p = G.player; if (!s) return;
    for (const b of T.bubbles) {
      if (b.w !== w || b.dead) continue;
      if (b.e && !b.w5c) {
        b.w5c = 1; fx(w, 'caught');
        const e = b.e;
        if (f.bigTrap && !f.instant && (e.elite || e.r > s.hold)) { E5(e).closeUntil = G.t + 0.8; b.w5close = G.t; fx(w, 'closing'); say('cl' + e.id, e.x, e.y - e.r - 10, 'CLOSING', CYAN, 11, 0.5); }
      }
      if (!b.e && f.snow) { // Snow Globe: an enemy shot that touches a free bubble is trapped inside it
        for (const q of G.ebul) {
          if (q.dead || (b.snow || 0) >= 6) continue;
          if (Math.hypot(q.x - b.x, q.y - b.y) < b.r + (q.r || 3) + 2) { q.dead = true; b.snow = (b.snow || 0) + 1; fx(w, 'snow'); ring(b.x, b.y, b.r, CYAN, 0.25, 3); say('snow' + w.uid, b.x, b.y - b.r - 6, 'SNOW GLOBE', CYAN, 10, 0.6); }
        }
      }
      if (!b.e) continue;
      const e = b.e;
      if (f.locked && e.elite) { fightCd(e).memQuietT = 0; fx(w, 'locked'); }
      if (f.chaperone && !(E5(e).closeUntil > G.t)) bbChaperone(w, b, dt);
      if (f.hamster && (b.w5d || 0) < 3 && !(E5(e).closeUntil > G.t)) bbHamster(w, f, b, dt);
    }
    // soap, gum and the Cotton Wool bubble
    if (f.soap.length) {
      f.soap = f.soap.filter(sp => G.t < sp.end);
      for (const sp of f.soap) if (Math.hypot(p.x - sp.x, p.y - sp.y) < sp.r + p.r) { if (!(f.skid > G.t)) { fx(w, 'skid'); say('skid' + w.uid, p.x, p.y - 28, 'WHEEE', CYAN, 12, 1); } f.skid = G.t + 2; }
    }
    if (f.skid > G.t) { G.penHasteK = G.penHasteT > G.t ? Math.max(G.penHasteK || 1, 1.4) : 1.4; G.penHasteT = G.t + 0.25; }
    f.gum = f.gum.filter(g => (g.life -= dt) > 0);
    for (const g of f.gum) forNear(g.x, g.y, 24, e => {
      if (e.dead || e.egg || e.charmed || g.life <= 0) return false;
      g.life = 0; fightStatus(e, 'ice', 0, {}); fx(w, 'gum'); ring(e.x, e.y, e.r + 8, PINK, 0.4, 4); say('gum' + e.id, e.x, e.y - e.r - 8, 'STUCK TO IT', PINK, 11, 0.5); return true;
    });
    if (f.woolOn) {
      const wl = f.wool || (f.wool = { n: 0, next: G.t });
      if (wl.n <= 0 && G.t >= wl.next) { wl.n = 3; fx(w, 'woolup'); ring(p.x, p.y, 40, CYAN, 0.5, 4); say('wool' + w.uid, p.x, p.y - 34, 'COTTON WOOL', CYAN, 13, 1); }
    }
  }
  function bbChaperone(w, b, dt) { // Chaperone: held bubbles float between you and the nearest shooter
    const p = G.player; let t = null, bd = 1e12;
    for (const o of G.enemies) { if (o.dead || o === b.e || o.egg || o.bubT > G.t) continue; const d = (o.x - p.x) ** 2 + (o.y - p.y) ** 2, sh = o.boss || o.def.shoot ? 0 : 1e9; if (d + sh < bd) { bd = d + sh; t = o; } }
    if (!t) return;
    const dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy) || 1, k = Math.min(110, d * 0.4) / d;
    const tx = p.x + dx * k, ty = p.y + dy * k, m = Math.min(1, dt * 1.8);
    b.x += (tx - b.x) * m; b.y += (ty - b.y) * m; b.e.x = b.x; b.e.y = b.y; fx(w, 'chaperone');
  }
  function bbHamster(w, f, b, dt) { // Hamster Ball: the bubble rolls at the nearest other enemy and pops on it, trapping that one
    const e = b.e; if (!e || e.dead) return;
    const inside = bubIn(b); let t = null, bd = 1e12;
    for (const o of G.enemies) {
      if (o.dead || inside.includes(o) || o.egg || o.boss || o.charmed || o.bubT > G.t || !toyCan(o)) continue;
      const d = (o.x - b.x) ** 2 + (o.y - b.y) ** 2; if (d < bd) { bd = d; t = o; }
    }
    if (!t || bd > 420 * 420) return;
    const d = Math.sqrt(bd) || 1, st = Math.min(d, 170 * dt);
    b.x += (t.x - b.x) / d * st; b.y += (t.y - b.y) / d * st; e.x = b.x; e.y = b.y;
    if (d - st < b.r + t.r) {
      const depth = b.w5d || 0, a = Math.atan2(t.y - b.y, t.x - b.x), T = TOYS(), s = w.s;
      bubblePop(b, a); fx(w, 'hamster');
      if (!t.dead && T.bubbles.length < 40) {
        T.bubbles.push({ x: t.x, y: t.y, vx: 0, vy: 0, r: t.r + 12, life: s.dur, w, e: t, seed: Math.random() * 10, heldAt: G.t, film: (s.film || 0) * s.dmg, soaked: 0, w5d: depth + 1, w5c: 1 });
        t.bubT = G.t + s.dur; t.kx = 0; t.ky = 0; say('ham' + t.id, t.x, t.y - t.r - 10, 'ROLLED', CYAN, 11, 0.4);
      }
    }
  }
  // The wrappers: each does nothing for a slot without the card.
  const canBubble0 = canBubble;
  canBubble = function (w, e) {
    const f = w && w.w5;
    if (f && f.bigTrap) {
      if (!toyCan(e) || e.boss || e.bossDef || e.final || e.rival || e.bubT > G.t || e.thrownT > G.t || e.dazeT > G.t || e.def.ai === 'phase') return false;
      return true; // (Big Bubble Trouble: any size but a boss)
    }
    return canBubble0(w, e);
  };
  const toyHold0 = toyHold;
  toyHold = function (e, dt) {
    if (e.w5 && e.w5.closeUntil > G.t) { // the bubble is still closing round it
      const B = TOYS().bubbles.find(b => !b.dead && b.e === e);
      return !!(B && B.w.w5 && B.w.w5.locked && e.elite); // Locked In: a trapped elite cannot attack, not even while the bubble closes
    }
    return toyHold0(e, dt);
  };
  const bsoak0 = bubbleSoak;
  bubbleSoak = function (b, d) {
    const w = b.w, f = w && w.w5;
    if (!f || !f.wrap) return bsoak0(b, d);
    if (X.hit) return bsoak0(b, d); // your own shots and Feats still pop it
    if (b.bumpT > G.t + 0.29) { fx(w, 'shrug'); return true; } // an enemy bumped it: shrugged off
    b.w5blk = (b.w5blk || 0) + 1; fx(w, 'block'); b.wob = G.realT;
    ring(b.x, b.y, b.r + 4, CYAN, 0.25, 3); say('blk' + b.x.toFixed(0), b.x, b.y - b.r - 8, 'BLOCKED', CYAN, 11, 0.25);
    if (f.send && b.w5blk >= 5) { // Return to Sender: five blocked shots, then it pops and fires them back
      const ts = acquireMany('nearest', 420, b.x, b.y, 5);
      for (let i = 0; i < 5; i++) {
        const t = ts[i % Math.max(1, ts.length)], a = t ? Math.atan2(t.y - b.y, t.x - b.x) : i / 5 * TWO, v = 420;
        spawnProj(w, b.x, b.y, a, hit(w, 'proj', false, { wname: 'Spit It Back' }), { speed: v, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.3, max: 1.3, r: 5, dmg: w.s.dmg * 1.2 * weaponMult(w), noMods: true });
      }
      fx(w, 'sender'); say('snd' + b.x.toFixed(0), b.x, b.y - b.r - 18, 'RETURN TO SENDER', CYAN, 12, 0.5); return false;
    }
    return true;
  };
  const bhit0 = bubbleHit;
  bubbleHit = function (e, src, dmg) {
    const b = TOYS().bubbles.find(o => !o.dead && (o.e === e || (o.extra && o.extra.includes(e))));
    const f = b && b.w && b.w.w5;
    if (f && f.wrap && !src.w && !src.spell) { fx(b.w, 'shrug'); return true; } // not from you: the bubble takes it and holds
    X.hit = 1; try { return bhit0(e, src, dmg); } finally { X.hit = 0; }
  };
  const bpop0 = bubblePop;
  bubblePop = function (b, throwA, fling) {
    const w = b.w, f = w && w.w5;
    if (b.dead || !f || !f.bb) return bpop0(b, throwA, fling);
    const x = b.x, y = b.y, e = b.e, depth = X.depth;
    if (f.cannon && e && e.elite && !e.dead && !fling) { // Cannonball: a popped elite is launched through its friends
      fling = true;
      if (throwA == null) { let t = null, bd = 1e12; for (const o of G.enemies) if (!o.dead && o !== e && !o.egg) { const d = (o.x - x) ** 2 + (o.y - y) ** 2; if (d < bd) { bd = d; t = o; } } throwA = t ? Math.atan2(t.y - y, t.x - x) : Math.atan2(y - G.player.y, x - G.player.x); }
      fx(w, 'cannon'); say('can' + e.id, x, y - 30, 'CANNONBALL', CYAN, 13, 0.5);
    }
    const snow = b.snow || 0;
    bpop0(b, throwA, fling);
    if (f.p === 'C') bbWave(w, f, x, y, depth);
    if (f.bath) { if (f.soap.length < 10) f.soap.push({ x, y, r: 60, end: G.t + 4 }); fxParts('bubble', x, y, CYAN, 6, 70, 0.6, 3); say('bath' + w.uid, x, y - 16, 'SOAP', CYAN, 11, 0.5); fx(w, 'soap'); }
    if (f.gumOn && f.gum.length < 8) { f.gum.push({ x, y, life: 8 }); fx(w, 'gumdrop'); }
    if (snow) { fxParts('spark', x, y, CYAN, 6 + snow, 100, 0.5, 2); fx(w, 'snowpop'); }
  };
  function bbWave(w, f, x, y, depth) { // Pop Goes the Prawn: a mucus shockwave (radius 90) Snares everything near
    const T = TOYS(), got = [];
    ring(x, y, 90, GRN, 0.45, 5); ring(x, y, 60, GRN, 0.3, 3); fxParts('bubble', x, y, GRN, 8, 120, 0.5, 3);
    forNear(x, y, 90, e => { if (e.dead || e.egg || e.charmed) return false; fightStatus(e, 'ice', 0, {}); got.push(e); return false; });
    fx(w, 'wave');
    if (f.chainpop && depth < 3) for (const o of T.bubbles) {
      if (o.dead || Math.hypot(o.x - x, o.y - y) > 90 + o.r) continue;
      fx(w, 'chainpop');
      after(0.1, () => { if (o.dead) return; const sv = X.depth; X.depth = depth + 1; try { bubblePop(o, Math.atan2(o.y - y, o.x - x)); } finally { X.depth = sv; } });
    }
    if (f.stuck && got.length >= 2) { // Stuck Together: what the wave Snares is Conjoined in pairs
      got.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
      const used = new Set(); let n = 0;
      for (const a of got) {
        if (used.has(a) || n >= 3) continue;
        const o = got.find(q => q !== a && !used.has(q) && Math.hypot(q.x - a.x, q.y - a.y) < a.r + q.r + 90);
        if (o) { used.add(a); used.add(o); conjoin(a, o); n++; fx(w, 'stuck'); }
      }
    }
  }
  wupReg(BB, {
    A: { name: 'Big Bubble Trouble', tag: 'Catch the elites', costs: 'one bubble at a time.', shows: 'a large bubble wobbling closed round a big enemy.', modes: 'HUNT.',
      lv3: { desc: 'Bubbles can trap anything except bosses, though they close slowly round big enemies. Only one bubble at a time.', apply: w => { bbP('A')(w); F(w).bigTrap = 1; } },
      lv6: [{ name: 'Locked In', desc: 'A trapped elite cannot attack, even while the bubble closes, and its Membrane stops regenerating.', apply: bbSet('locked') },
        { name: 'Cannonball', desc: "Popping an elite's bubble launches it like a cannonball through its friends.", apply: bbSet('cannon') }],
      wild: { name: 'Bath Time', desc: 'Popped bubbles leave soap that you skid on, giving a short burst of speed.', apply: bbSet('bath') } },
    B: { name: 'Bubble Wrap', tag: 'Walls you can move', costs: 'bubbles pop only to shots and you, not to enemies.', shows: 'shots splashing harmlessly on bubbles.', modes: 'KITE and NEST.',
      lv3: { desc: "Bubbles round trapped enemies block enemy shots. Only shots and you can pop them now, not enemies.", apply: w => { bbP('B')(w); F(w).wrap = 1; } },
      lv6: [{ name: 'Chaperone', desc: 'Bubbles drift towards you and float between you and the nearest shooter.', apply: bbSet('chaperone') },
        { name: 'Spit It Back', desc: 'When a bubble has blocked enough shots, it pops and fires them back.', apply: bbSet('send') }],
      wild: { name: 'Snow Globe', desc: 'Bubbles also trap enemy shots, which drift around inside them.', apply: bbSet('snow') } },
    C: { name: 'Pop Goes the Prawn', tag: 'Control bombs', costs: 'bubbles hold enemies for 2 s (from 5).', shows: 'a green ring spreading from each pop.', modes: 'ORBIT keeps bubbles near crowds.',
      lv3: { desc: 'Each pop releases a mucus shockwave that Snares everything nearby. Bubbles hold enemies for less time.', apply: bbP('C') },
      lv6: [{ name: 'Popcorn', desc: 'The shockwave pops other bubbles it reaches, setting off a short chain.', apply: bbSet('chainpop') },
        { name: 'Stuck Together', desc: 'The shockwave Conjoins the enemies it Snares.', apply: bbSet('stuck') }],
      wild: { name: 'Bubble Gum', desc: 'A popped bubble leaves a sticky patch that Snares the next enemy to swim through it.', apply: bbSet('gumOn') } },
    lv10: [
      { name: 'Cotton Wool', best: 'B', desc: 'Every few seconds you are wrapped in a bubble that blocks your next few hits.', apply: bbSet('woolOn') },
      { name: 'Bubble Boy', best: 'A', desc: 'Bubbles trap any enemy except bosses, instantly.', apply: w => { bbInst(w); F(w).bigTrap = 1; F(w).instant = 1; } },
      { name: 'Hamster Ball', best: 'C', desc: 'Trapped enemies roll into the nearest enemy and pop on it, trapping that one too, a few times over.', apply: bbSet('hamster') }] });

  // ================================================================ 23. ONE OF THESE DAYS (Blood, Projectile, mark)
  function ddInst(w) {
    const f = F(w); if (f.dd) return; f.dd = 1; f.mk = new Map(); f.pops = [];
    wupOn(w, 'stats', ddStats); wupOn(w, 'fire', ddFire); wupOn(w, 'tick', ddTick);
  }
  const ddSet = mk(ddInst), ddP = mkP(ddInst);
  function ddStats(w, s) {
    const f = F(w);
    if (f.p === 'A') s.count = 1;
    else if (f.p === 'B') s.repeat = 0.3; // the main mark repeats only 30%
    else if (f.p === 'C') { s.dur = 8; s.repeat = 0.7; }
    if (f.induced) s.repeat = 1.0;
    if (f.bigday) s.count = 3;
  }
  function ddFire(w) { // one mark at a time (A); three with The Big Day; Induced: one mark every 10 s
    const f = F(w), T = TOYS();
    const cap = f.bigday ? 3 : f.p === 'A' ? 1 : 99;
    if (cap < 99) {
      let n = 0; for (const e of T.marks) if (e.due && e.due.w === w && !e.dead) n++;
      if (n >= cap) return true;
      if (cap - n < w.s.count) { // (fewer free slots than the volley would mark)
        const p = G.player;
        for (const e of acquireMany(aimDir(w), w.s.range, p.x, p.y, cap - n + 3).filter(q => !q.due).slice(0, cap - n)) dueMark(w, e);
        return true;
      }
    }
    if (f.induced) { if (G.t < (f.indNext || 0)) return true; f.indNext = G.t + 10; fx(w, 'induced'); }
    return false;
  }
  function ddTick(w, dt) {
    const f = F(w), T = TOYS(), seen = new Set();
    for (const e of T.marks) {
      if (!e.due || e.due.w !== w || seen.has(e)) continue; seen.add(e);
      f.mk.set(e, { x: e.x, y: e.y, r: e.r, stored: e.due.stored, weak: e.due.weak || 0 });
      if (f.morning && !e.dead && offscreen(e.x, e.y)) { fx(w, 'morning'); say('morn' + e.id, e.x, e.y, 'MORNING AFTER', CRIM, 12, 0.5); duePop(e); }
    }
    for (const [e, sn] of f.mk) {
      if (e.dead) { f.mk.delete(e); if (!E5(e).spr) { E5(e).spr = 1; ddDeath(w, f, e, sn); } }
      else if (!e.due) f.mk.delete(e);
    }
  }
  function ddDeath(w, f, e, sn) { // an enemy died with a date on it
    if (f.p === 'B') ddSpread(w, f, sn.x, sn.y, sn.weak, e);
    if (f.ledger && sn.stored > 0) { // Compound Interest: a quarter of what it owed bursts onto its neighbours
      forNear(sn.x, sn.y, 130, o => { if (o !== e && !o.dead && toyCan(o)) damageEnemy(o, sn.stored * 0.25, hit(w, 'proj', true, { wname: 'Inheritance Tax' })); return false; });
      ring(sn.x, sn.y, 130, CRIM, 0.4, 4); say('led' + e.id, sn.x, sn.y - 20, 'WRITTEN OFF', CRIM, 12, 0.4); fx(w, 'kept');
    }
  }
  function ddSpread(w, f, x, y, weak, self) { // weaker marks on the 2 nearest enemies (passing on once more with Pass the Parcel)
    if (weak >= 2 || (weak === 1 && !f.parcel)) return;
    if (TOYS().marks.length > 14) return;
    const near = acquireMany('nearest', 260, x, y, 8).filter(o => o !== self && !o.due && !o.dead && !o.egg && toyCan(o)).slice(0, 2);
    for (const o of near) {
      dueMark(w, o, true);
      if (o.due) { o.due.weak = weak + 1; fx(w, 'spread'); line(x, y, o.x, o.y, 3, CRIM, 0.45); ring(o.x, o.y, o.r + 8, CRIM, 0.35, 3); }
    }
  }
  const dueMark0 = dueMark;
  dueMark = function (w, e, free) { dueMark0(w, e, free); if (e.due && w && w.w5) e.due.end0 = e.due.end; };
  const duePop0 = duePop;
  duePop = function (e) {
    const D = e.due, w = D && D.w, f = w && w.w5;
    if (!D || !f || !f.dd || !w.s) return duePop0(e);
    const s = w.s, rep0 = s.repeat, x = e.x, y = e.y, T = TOYS();
    f.mk.delete(e);
    const early = D.end0 && G.t < D.end0 - 0.05;
    let rep = rep0;
    if (D.weak) rep = 0.2; // a weaker mark repeats 20%
    if (early && f.early) { rep = Math.max(rep, 0.5); fx(w, 'early'); }
    f.pops = f.pops.filter(t => G.t - t < 1); f.pops.push(G.t);
    if (f.rush && f.pops.length >= 3) { rep = Math.max(rep, 0.4); fx(w, 'rush'); say('rush' + w.uid, x, y - e.r - 28, 'RUSH HOUR', CRIM, 13, 0.5); }
    s.repeat = rep;
    try { duePop0(e); } finally { s.repeat = rep0; }
    E5(e).spr = 1;
    if (f.p === 'B') ddSpread(w, f, x, y, D.weak || 0, e);
    if (early && f.stag && !e.dead) { fightPayoff(e, 'stagger', { raw: 0 }, {}); fx(w, 'stagger'); say('stg' + e.id, x, y - e.r - 28, 'SHORT NOTICE', CRIM, 12, 0.5); }
    if (f.reveal) ddReveal(w, e, x, y);
    if (f.fine && (e.boss || e.elite) && !e.dead && (E5(e).fp || 0) < 2) { E5(e).fp = (E5(e).fp || 0) + 1; dueMark0(w, e, true); if (e.due) e.due.end0 = e.due.end; fx(w, 'again'); say('fp' + e.id, x, y - e.r - 28, 'AGAIN', CRIM, 12, 0.5); }
    if (f.labour && !e.dead) { dueMark0(w, e, true); if (e.due) e.due.end0 = e.due.end; fx(w, 'labour'); say('lab' + e.id, x, y - e.r - 28, 'LABOUR', CRIM, 12, 0.5); }
  };
  function ddReveal(w, e, x, y) { // Gender Reveal: every date goes off with a random extra
    const k = Math.floor(Math.random() * 3), c = k === 1 ? PINK : BLUE;
    fxParts('spark', x, y, PINK, 8, 150, 0.6, 3); fxParts('spark', x, y, BLUE, 8, 150, 0.6, 3);
    if (k === 0) { forNear(x, y, 120, o => { if (o !== e) shove(o, o.x - x, o.y - y, 130); return false; }); ring(x, y, 120, BLUE, 0.4, 5); say('rev' + e.id, x, y - 40, "IT'S A BLAST", BLUE, 13, 0.5); fx(w, 'reveal_blast'); }
    else if (k === 1) { if (!e.dead) bleedFill(e, Math.max(1, w.s.dmg * 0.3 / 3), w.def.name); ring(x, y, 40, PINK, 0.4, 4); say('rev' + e.id, x, y - 40, "IT'S A BLEED", PINK, 13, 0.5); fx(w, 'reveal_bleed'); }
    else { healPlayer(G.P.maxHp * 0.03, true); ring(G.player.x, G.player.y, 30, c, 0.4, 4); say('rev' + e.id, x, y - 40, "IT'S A SNACK", BLUE, 13, 0.5); fx(w, 'reveal_heal'); }
    fx(w, 'reveal');
  }
  const toyHurt0 = toyHurt;
  toyHurt = function (e, lost, src) {
    toyHurt0(e, lost, src);
    if (!(lost > 0)) return;
    const D = e.due;
    if (D && D.w.w5 && D.w.w5.p === 'A' && D.w.w5.dd && !src.due && !src.echo && !src.dot) { // Any Day Now: every hit shortens the countdown by 0.1 s
      D.end = Math.max(G.t + 0.12, D.end - 0.1); fx(D.w, 'shorten');
      if (G.frameN % 4 === 0) { ring(e.x, e.y, e.r + 12, CRIM, 0.2, 2); say('sh' + e.id, e.x, e.y - e.r - 12, '-0.1', CRIM, 10, 0.25); }
    }
    const B = e.tape; // Group Chat: a shared hit reaches bosses in full (the base halves it for them)
    if (B && B.w.w5 && B.w.w5.chat && B.members.length > 1 && B.pool && !src.taped && !(src.echo && src.w && src.w.def.sig)) {
      for (const o of B.members) if (o !== e && !o.dead && o.boss) B.pool.set(o, (B.pool.get(o) || 0) + lost * B.w.s.share * 0.5);
      fx(B.w, 'chat');
      if (G.t > (B.w5chT || 0)) { B.w5chT = G.t + 0.4; say('chat' + e.id, e.x, e.y - e.r - 10, 'FORWARDED', RED, 10, 0.4); }
    }
  };
  const dmgMul0 = wupDmgMul;
  wupDmgMul = function (e, src) { // The Big Day: marked enemies take +50% from everything you own
    let k = dmgMul0(e, src);
    if (e.due && e.due.w.w5 && e.due.w.w5.bigday && src && src.w && !src.dot && !src.due) { k *= 1.5; fx(e.due.w, 'bigday'); }
    return k;
  };
  wupReg(DD, {
    A: { name: 'Any Day Now', tag: 'Commit and it comes sooner', costs: 'one mark at a time.', shows: 'the countdown clock spinning faster as you hit it.', modes: 'HUNT.',
      lv3: { desc: 'Each hit on the marked enemy makes its countdown run out sooner. One mark at a time.', apply: ddP('A') },
      lv6: [{ name: 'Early Delivery', desc: 'A date that goes off early repeats more of its stored damage.', apply: ddSet('early') },
        { name: 'Short Notice', desc: 'A date that goes off early staggers the target.', apply: ddSet('stag') }],
      wild: { name: 'Gender Reveal', desc: 'Each date goes off with a random extra: a knockback blast, a full Bleed stack, or a small heal for you.', apply: ddSet('reveal') } },
    B: { name: 'Double Booked', tag: 'Spread the dates', costs: 'the main mark repeats only 30%.', shows: 'little clocks hopping enemy to enemy.', modes: 'ORBIT.',
      lv3: { desc: 'When a date goes off or its enemy dies, the two nearest enemies get weaker marks. The main mark repeats less.', apply: ddP('B') },
      lv6: [{ name: 'Forwarding Address', desc: 'Weaker marks pass on once more when they go off.', apply: ddSet('parcel') },
        { name: 'Rush Hour', desc: 'When three dates go off in quick succession, the third repeats at full strength.', apply: ddSet('rush') }],
      wild: { name: 'Morning After', desc: 'A marked enemy that leaves the screen goes off at once.', apply: ddSet('morning') } },
    C: { name: 'Interest Accrued', tag: 'A long wait for a big cheque', costs: 'the slowest payoff in the game.', shows: 'a big ledger number growing over the target.', modes: 'HUNT and HOLD against bosses.',
      lv3: { desc: 'The countdown runs twice as long but repeats far more of the stored damage. The slowest payoff of any mark.', apply: ddP('C') },
      lv6: [{ name: 'Inheritance Tax', desc: 'The clock shows the stored total, and an enemy that dies early bursts part of it onto its neighbours.', apply: ddSet('ledger') },
        { name: 'Fine Print', desc: 'A mark that goes off on a boss or elite marks it again at once, up to twice per enemy.', apply: ddSet('fine') }],
      wild: { name: 'Postponed', desc: 'Now and then, one big hit on you is delayed for a moment and halved.', apply: ddSet('postp') } },
    lv10: [
      { name: 'Labour Day', best: 'AC', desc: 'A date that goes off re-marks the same enemy at once, every time, bosses included.', apply: ddSet('labour') },
      { name: 'The Big Day', best: 'B', desc: 'Marked enemies take much more damage from everything you have, and you can mark three at once.', apply: ddSet('bigday') },
      { name: 'Induced', best: 'C', desc: 'The repeat is all of the stored damage, but you can mark only once every ten seconds.', apply: ddSet('induced') }] });

  // ================================================================ 24. SISTER COUSIN (Blood, Projectile, homing)
  function scInst(w) {
    const f = F(w); if (f.sc) return; f.sc = 1; f.hiders = []; f.dins = [];
    if (!modHas(w, 'multiplying')) modAdd(w, 'multiplying'); // (the base weapon's kill-split)
    wupOn(w, 'stats', scStats); wupOn(w, 'fire', scFire); wupOn(w, 'phit', scHit); wupOn(w, 'pend', scEnd); wupOn(w, 'dmg', scDmg); wupOn(w, 'tick', scTick);
  }
  const scSet = mk(scInst), scP = mkP(scInst);
  const scCap = f => f.babyboom ? 24 : f.over ? 18 : 12;
  // Baby Boom's "24 in flight at most" holds for volleys too: a volley that would go over it waits (true skips the shot).
  const scFire = w => !!F(w).babyboom && liveN(w) + ((w.s && w.s.count) || 1) > scCap(F(w));
  function scStats(w, s) {
    const f = F(w);
    if (f.p === 'A') s.dmg *= 0.75; // each seeker is 25% weaker
    if (f.only) { s.count = 1; s.dmg *= 6; }
  }
  function scWeakest(x, y) { // the weakest enemy in range that is not a big threat
    let best = null, bv = 1e12, big = null, bb = 1e12;
    for (const e of G.enemies) {
      if (e.dead || e.egg || e.charmed || e.phased) continue;
      const d = Math.hypot(e.x - x, e.y - y); if (d > 380) continue;
      if (e.boss || e.elite || e.rival) { if (e.hp < bb) { bb = e.hp; big = e; } continue; }
      if (e.hp < bv) { bv = e.hp; best = e; }
    }
    return best || big;
  }
  function scSpawn(w, f, x, y, n, pr, e, over) { // up to n new seekers from (x, y) at the nearest other enemies
    const room = Math.min(n, scCap(f) - liveN(w)); if (room <= 0) return 0;
    const ts = acquireMany('nearest', 300, x, y, 5).filter(t => t !== e);
    for (let i = 0; i < room; i++) {
      const t = ts.length ? ts[i % ts.length] : null, a = t ? Math.atan2(t.y - y, t.x - x) : Math.random() * TWO;
      spawnProj(w, x, y, a, pr.src, Object.assign({ dmg: pr.dmg, mSplit: 1, pierce: 0, hits: e ? [e.id] : null }, over || null));
    }
    return room;
  }
  function scHit(w, pr, e) {
    const f = F(w), E = E5(e);
    if (f.p === 'C') { const L = E.sl || (E.sl = []); L.push(G.t); while (L.length && G.t - L[0] > 0.5) L.shift(); }
    if (f.pile) { // Pile-On: 4 hits inside 0.5 s fill the Bleed stack at once
      const L = E.sl || (E.sl = []);
      if (f.p !== 'C') { L.push(G.t); while (L.length && G.t - L[0] > 0.5) L.shift(); }
      if (L.length >= 4 && G.t > (E.pileT || 0) && !e.dead) { E.pileT = G.t + 2; L.length = 0; bleedFill(e, Math.max(1, pr.dmg * 0.3 / 3), w.def.name); ring(e.x, e.y, e.r + 12, w.def.color, 0.4, 5); say('pile' + e.id, e.x, e.y - e.r - 12, 'PILE-ON', w.def.color, 13, 0.5); fx(w, 'pile'); }
    }
    if (f.babyboom && liveN(w) < 24) { // Baby Boom: every sibling splits in two on every hit
      pr.mSplitDone = 1;
      if (scSpawn(w, f, e.x, e.y, 2, Object.assign({}, pr, { dmg: pr.dmg * 0.5 }), e)) { fx(w, 'boom'); ring(e.x, e.y, 14, w.def.color, 0.25, 3); say('bb' + w.uid, e.x, e.y - e.r - 8, 'BABY BOOM', w.def.color, 11, 0.3); }
    }
    if (!e.dead) return;
    pr.w5k = (pr.w5k || 0) + 1;
    if (f.p === 'A' && (pr.mSplit || !pr.mS)) { // Family Planning: every kill makes an extra seeker, not only a split
      const o = f.runts ? { speed: pr.speed * 1.4, vx: 0, vy: 0, r: Math.max(2, pr.r * 0.7), w5x: 1 } : { w5x: 1 };
      if (f.runts) { const a = Math.random() * TWO; o.vx = Math.cos(a) * o.speed; o.vy = Math.sin(a) * o.speed; }
      if (scSpawn(w, f, e.x, e.y, 1, pr, e, o)) { fx(w, 'extra'); ring(e.x, e.y, 16, w.def.color, 0.3, 3); say('ex' + w.uid, e.x, e.y - e.r - 10, '+1 SIBLING', w.def.color, 11, 0.3); if (f.runts) fx(w, 'runt'); }
    }
    if (f.dinner) { // Dinner Time: a sibling survives kills, and with 3 swims back to you
      pr.pierce = (pr.pierce || 0) + 1; pr.tgt = null; pr.mHlost = 0; // (it lives on, so it homes in on the next one)
      pr.life = Math.max(pr.life, (w.s.range || 300) / Math.max(60, Math.hypot(pr.vx || 0, pr.vy || 0))); // (and a fresh range of flight: reach stopped growing with level on 20 Oct, so 3 kills ran out of flight)
      if (pr.w5k >= 3 && !pr.back) { pr.back = true; pr.hits = null; pr.pierce = 99; pr.w5din = 1; f.dins.push(pr); fx(w, 'dinner_ready'); say('din' + w.uid, e.x, e.y - e.r - 10, 'DINNER TIME', w.def.color, 12, 0.4); }
    }
    if (f.only && pr.w5k >= 5) { pr.pierce = 0; fx(w, 'onlydone'); } // Only Child: five kills and it is done
  }
  function scEnd(w, pr) { // Hide and Seek: a sibling whose flight ends hides in place
    const f = F(w);
    if (!f.hide || pr.w5hid || f.hiders.length >= 8 || pr.w5din) return;
    f.hiders.push({ x: pr.x, y: pr.y, life: 6, src: pr.src, dmg: w.s.dmg * 1.5 }); fx(w, 'hid');
    say('hid' + w.uid, pr.x, pr.y - 10, 'SHH', w.def.color, 10, 0.4);
  }
  function scDmg(w, e) { // Sibling Rivalry: two or more seekers on one enemy deal +25% each
    const f = F(w); if (f.p !== 'C') return 1;
    let n = 0; for (const q of G.proj) if (q.w === w && !q.dead && Math.hypot(q.x - e.x, q.y - e.y) < 60 + e.r) n++;
    const E = e.w5, recent = E && E.sl && E.sl.some(t => G.t - t < 0.3 && G.t - t > 0);
    if (n >= 2 || recent) { fx(w, 'rivalry'); return 1.25; }
    return 1;
  }
  function scTick(w, dt) {
    const f = F(w), p = G.player, s = w.s; if (!s) return;
    const fresh = [];
    for (const pr of G.proj) if (pr.w === w && !pr.w5t && !pr.dead && !pr.lob) { pr.w5t = 1; fresh.push(pr); }
    let vt = null;
    for (const pr of fresh) {
      if (f.reunion) pr.reunion = 1;
      if (f.only) { pr.pierce = 999; pr.life = pr.max = 10; pr.homing = Math.max(pr.homing || 0, 7); pr.w5only = 1; pr.r *= 1.4; fx(w, 'only'); }
      if (f.p === 'B') { const t = scWeakest(pr.x, pr.y); if (t) { pr.tgt = t; fx(w, 'favourite'); } }
      else if (f.pack && !pr.mSplit && !f.only) { if (!vt) vt = acquire(w.dir, s.range, p.x, p.y); if (vt) { pr.tgt = vt; fx(w, 'pack'); } }
    }
    const mine = [];
    for (const pr of G.proj) if (pr.w === w && !pr.dead && !pr.lob) mine.push(pr);
    for (const pr of mine) {
      if (f.p === 'B' && (!pr.tgt || pr.tgt.dead)) { const t = scWeakest(pr.x, pr.y); if (t) { pr.tgt = t; fx(w, 'favourite'); } }
      if (f.only && (!pr.tgt || pr.tgt.dead)) { pr.tgt = acquire('nearest', 400, pr.x, pr.y); pr.life = Math.max(pr.life, 0.6); }
      if (f.reunion && pr.reunited && !(pr.orbitT > 0)) { pr.reunited = false; fx(w, 'reunion'); }
    }
    if (f.reunion && mine.length > 24) { let k = 0; for (const pr of mine) if (pr.reunited && k++ < mine.length - 24) pr.dead = true; } // (bounded: 24 at most)
    if (f.squab) { // Sibling Squabble: siblings that meet bounce off each other and pick different targets
      for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) {
        const a = mine[i], b = mine[j];
        if ((a.w5sq || 0) > G.t || (b.w5sq || 0) > G.t || a.max - a.life < 0.15 || b.max - b.life < 0.15 || a.orbitT > 0 || b.orbitT > 0) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) > 9) continue;
        a.w5sq = b.w5sq = G.t + 0.5;
        const ang = Math.atan2(a.y - b.y, a.x - b.x), sp = a.speed;
        a.vx = Math.cos(ang + 0.5) * sp; a.vy = Math.sin(ang + 0.5) * sp; b.vx = Math.cos(ang + Math.PI - 0.5) * sp; b.vy = Math.sin(ang + Math.PI - 0.5) * sp;
        const ts = acquireMany('nearest', 380, a.x, a.y, 4); a.tgt = ts[0] || null; b.tgt = ts.find(t => t !== a.tgt) || ts[0] || null;
        fx(w, 'squabble'); ring(a.x, a.y, 12, w.def.color, 0.25, 3); say('sq' + w.uid, a.x, a.y - 12, 'SQUABBLE', w.def.color, 10, 0.3);
      }
    }
    for (const h of f.hiders) { // hidden siblings ambush the next enemy that comes near
      h.life -= dt;
      let t = null; forNear(h.x, h.y, 70, e => { if (!t && !e.dead && !e.egg) t = e; return false; });
      if (t && liveN(w) < scCap(f) + 4) {
        h.life = 0; const a = Math.atan2(t.y - h.y, t.x - h.x);
        spawnProj(w, h.x, h.y, a, h.src, { dmg: h.dmg, mSplit: 1, pierce: 0, tgt: t, w5hid: 1 });
        fx(w, 'ambush'); say('amb' + t.id, t.x, t.y - t.r - 10, 'AMBUSH', w.def.color, 12, 0.3); ring(h.x, h.y, 16, w.def.color, 0.3, 3);
      }
    }
    f.hiders = f.hiders.filter(h => h.life > 0);
    if (f.dins.length) { // a fed sibling that got home heals you 1% of max health
      for (const pr of f.dins) {
        if (pr.w5paid) continue;
        if (Math.hypot(pr.x - p.x, pr.y - p.y) < 40) { pr.w5paid = 1; pr.dead = true; healPlayer(G.P.maxHp * 0.01, true); fx(w, 'dinner'); say('dn' + w.uid, p.x, p.y - 28, 'DINNER', w.def.color, 12, 0.4); ring(p.x, p.y, 26, w.def.color, 0.35, 4); }
        else if (pr.dead) pr.w5paid = 1;
      }
      f.dins = f.dins.filter(pr => !pr.w5paid);
    }
  }
  // modifiers.js modHit (a kill splits the shot): the caps and the card tweaks for this weapon.
  const modHit0 = modHit;
  modHit = function (pr, e) {
    const w = pr.w, f = w && w.w5;
    if (!f || !f.sc) return modHit0(pr, e);
    if (f.p === 'C' || f.only) pr.mSplitDone = 1; // no splitting
    const c = MODS10.multiplying.cap, keep = c.flight; c.flight = scCap(f);
    const n0 = G.proj.length;
    try { modHit0(pr, e); } finally { c.flight = keep; }
    let made = G.proj.length - n0;
    if (f.nepo && pr.mSplit && e.dead && !pr.w5g2 && !pr.w5nepo) { // Nepotism: a kill by a sibling born of a kill splits into three
      pr.w5nepo = 1;
      const n = scSpawn(w, f, e.x, e.y, 3, pr, e, { w5g2: 1 });
      if (n) { fx(w, 'nepo'); made += n; say('nep' + w.uid, e.x, e.y - e.r - 10, 'NEPOTISM', w.def.color, 11, 0.4); }
    }
    for (let i = n0; i < G.proj.length; i++) {
      const q = G.proj[i];
      if (q.w === w && q.mSplit && f.taste && e.dead) { q.dmg *= 1.3; q.w5taste = 1; fx(w, 'taste'); }
    }
    if (made > 0) { fx(w, 'split'); if (e.dead) say('spl' + w.uid, e.x, e.y - e.r - 6, 'SPLIT', w.def.color, 10, 0.3); }
  };
  // Sister Cousin starts with the 'multiplying' modifier, so that "a sibling that kills splits in two" is true from Lv 1.
  const makeSlot0 = makeSlot;
  makeSlot = function (id, isSpell, lvl) {
    const w = makeSlot0(id, isSpell, lvl);
    if (!isSpell && id === SC && typeof modAdd === 'function' && !(w.m10 && w.m10.includes('multiplying'))) modAdd(w, 'multiplying');
    return w;
  };
  wupReg(SC, {
    A: { name: 'Family Planning', tag: 'More children', costs: 'each seeker is 25% weaker.', shows: 'a swarm visibly growing through a crowd.', modes: 'ORBIT keeps them fed.',
      lv3: { desc: 'Every kill makes an extra seeker, not only a split. Each seeker is weaker.', apply: scP('A') },
      lv6: [{ name: 'Runts of the Litter', desc: 'The extra seekers are smaller and faster.', apply: scSet('runts') },
        { name: 'Overcrowding', desc: 'More seekers can be in flight at once.', apply: scSet('over') }],
      wild: { name: 'Hide and Seek', desc: 'Seekers that lose their target hide in place and ambush the next enemy that comes near.', apply: scSet('hide') } },
    B: { name: 'The Favourite', tag: 'Pick on the weak', costs: 'they ignore big threats.', shows: 'seekers zipping between the wounded.', modes: 'COLLECT follows the kills.',
      lv3: { desc: 'Seekers always chase the weakest enemy in range and ignore big threats.', apply: scP('B') },
      lv6: [{ name: 'Taste for It', desc: 'A seeker that kills hits its next target harder.', apply: scSet('taste') },
        { name: 'Nepotism', desc: 'A kill from a seeker that has already killed splits into three instead of two.', apply: scSet('nepo') }],
      wild: { name: 'Sibling Squabble', desc: 'Seekers that meet bounce off each other and pick different targets.', apply: scSet('squab') } },
    C: { name: 'Sibling Rivalry', tag: 'Gang up', costs: 'no splitting.', shows: 'a tight knot of seekers diving in together.', modes: 'HUNT.',
      lv3: { desc: 'Seekers hitting the same enemy each deal more damage. Seekers no longer split.', apply: scP('C') },
      lv6: [{ name: 'Pack Hunting', desc: 'All seekers in a volley pick the same target.', apply: scSet('pack') },
        { name: 'Pile-On', desc: 'When four seekers hit one enemy together, it gets a full Bleed stack at once.', apply: scSet('pile') }],
      wild: { name: 'Dinner Time', desc: 'A seeker with three kills swims back to you and heals you a little.', apply: scSet('dinner') } },
    lv10: [
      { name: 'Breeding Like Rabbits', best: 'A', desc: 'Every seeker splits into two on every hit, not just kills, up to a higher cap.', apply: scSet('babyboom') },
      { name: 'Family Reunion', best: 'B', desc: 'Seekers that miss circle you, eating enemy shots, then relaunch, and last until they hit.', apply: scSet('reunion') },
      { name: 'Only Child', best: 'C', desc: 'One seeker per volley that hits far harder, pierces everything and keeps homing until it has killed several.', apply: scSet('only') }] });

  // ================================================================ the 'fire' hook for toy weapons
  // fireWeapon (game.js) sends toy weapons (Red Tape, Due Date, Bubble Wand) to toyFire before it asks wupFire, so ask it here.
  const toyFire0 = toyFire;
  toyFire = function (w, target, src) {
    if (w.uh && w.uh.fire && wupFire(w, target, src)) return;
    return toyFire0(w, target, src);
  };

  // ================================================================ hurtPlayer: Cotton Wool, Postponed, Lost in the Post
  const W5_HURT = 40; let inPost = false; // (its hurt:before order: a Postponed hit comes back past this listener)
  hookOn('hurt:before', 'wup5:wool', (dmg, from, ent, kind) => {
    if (G && G.state === 'play' && G.weapons && !inPost) {
      const p = me();
      if (!(p.iframes > 0) && !(G.shieldT > 0)) {
        for (const w of G.weapons) {
          const f = w && w.w5; if (!f) continue;
          if (f.wool && f.wool.n > 0) { // Cotton Wool: the bubble takes the hit
            f.wool.n--; if (f.wool.n <= 0) f.wool.next = G.t + 6;
            p.iframes = Math.max(p.iframes, 0.3); ring(p.x, p.y, 36, CYAN, 0.4, 5); fxParts('bubble', p.x, p.y, CYAN, 6, 90, 0.4, 3); say('wl' + w.uid, p.x, p.y - 30, 'POP', CYAN, 13, 0.2); fx(w, 'wool'); return null;
          }
          if (f.postp && dmg > G.P.maxHp * 0.15 && G.t >= (f.postNext || 0)) { // Postponed: halved, and it lands 2 s later
            f.postNext = G.t + 10; fx(w, 'postponed'); say('post' + w.uid, p.x, p.y - 30, 'POSTPONED', CRIM, 13, 1); ring(p.x, p.y, 30, CRIM, 0.6, 4);
            const half = dmg * 0.5; after(2, () => { if (!G) return; inPost = true; try { hurtPlayer(half, from, ent, kind, W5_HURT); } finally { inPost = false; } });
            return null;
          }
          if (f.you && f.you.until > G.t && f.you.B && !f.you.B.dead) { // Lost in the Post: the bundle takes 40% of it
            const share = dmg * 0.4; dmg -= share;
            for (const o of f.you.B.members) if (!o.dead) { damageEnemy(o, share, hit(w, 'proj', true, { wname: 'Lost in the Post' })); line(p.x, p.y, o.x, o.y, 3, RED, 0.3); }
            fx(w, 'youshare');
          }
        }
      }
    }
    return dmg;
  }, W5_HURT);

  // ================================================================ the shared 'phit' and 'pend' hook kinds (wup1.js installs them; same guard)
  if (!globalThis.WUP_PROJ_HOOKS) {
    globalThis.WUP_PROJ_HOOKS = 1;
    const ph = projHit, pe = projEnd;
    projHit = function (pr, e) { ph(pr, e); const w = pr.w; if (w && w.uh && w.uh.phit) for (const f of w.uh.phit) f(w, pr, e); };
    projEnd = function (pr) { pe(pr); const w = pr.w; if (w && w.uh && w.uh.pend) for (const f of w.uh.pend) f(w, pr); };
  }

  // ================================================================ drawing (v10.js v10Draw, world space)
  function w5Draw() {
    if (!G || !G.weapons) return;
    const k = typeof S === 'number' ? S : 1, t = G.realT || 0, p = G.player, T = G.toy;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const w of G.weapons) {
      const f = w && w.w5; if (!f) continue;
      const c = col(w.def.color);
      if (f.strips && f.strips.length) { // Paper Trail: tape on the floor
        for (const st of f.strips) {
          ctx.globalAlpha = Math.min(1, st.life * 0.6) * 0.9; ctx.strokeStyle = col('#1a0507'); ctx.lineWidth = 7 * k; ctx.beginPath(); ctx.moveTo(sx(st.x1), sy(st.y1)); ctx.lineTo(sx(st.x2), sy(st.y2)); ctx.stroke();
          ctx.strokeStyle = col(RED); ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(sx(st.x1), sy(st.y1)); ctx.lineTo(sx(st.x2), sy(st.y2)); ctx.stroke();
        }
      }
      if (f.you && f.you.until > G.t && f.you.B && !f.you.B.dead) { // Lost in the Post: tape from you to the bundle
        ctx.globalAlpha = 0.8; ctx.strokeStyle = col(RED); ctx.lineWidth = 3 * k; ctx.setLineDash([7 * k, 6 * k]); ctx.lineDashOffset = -t * 30;
        for (const o of f.you.B.members) if (!o.dead) { ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(sx(o.x), sy(o.y)); ctx.stroke(); }
        ctx.setLineDash([]);
      }
      if (f.wool && f.wool.n > 0) { // Cotton Wool: the bubble round you
        ctx.globalAlpha = 0.55; ctx.strokeStyle = col(CYAN); ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 14 + Math.sin(t * 5) * 1.5) * k, 0, TWO); ctx.stroke();
        ctx.globalAlpha = 0.12; ctx.fillStyle = col(CYAN); ctx.fill();
        ctx.globalAlpha = 0.9; ctx.fillStyle = col('#ffffff'); for (let i = 0; i < f.wool.n; i++) { ctx.beginPath(); ctx.arc(sx(p.x) + (i - 1) * 9 * k, sy(p.y) - (p.r + 24) * k, 3 * k, 0, TWO); ctx.fill(); }
      }
      if (T && f.bb) {
        for (const b of T.bubbles) {
          if (b.w !== w || b.dead) continue;
          if (b.w5close && G.t - b.w5close < 0.8) { ctx.globalAlpha = 0.8; ctx.strokeStyle = col(CYAN); ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(sx(b.x), sy(b.y), b.r * (2 - (G.t - b.w5close) / 0.8) * k, 0, TWO); ctx.stroke(); }
          if (b.snow) { ctx.globalAlpha = 0.9; ctx.fillStyle = col('#ff6b6b'); for (let i = 0; i < b.snow; i++) { const a = t * 1.7 + i * TWO / b.snow; ctx.beginPath(); ctx.arc(sx(b.x + Math.cos(a) * b.r * 0.5), sy(b.y + Math.sin(a) * b.r * 0.5), 2.5 * k, 0, TWO); ctx.fill(); } }
        }
        for (const sp of f.soap) { ctx.globalAlpha = Math.min(0.5, (sp.end - G.t) * 0.3); ctx.fillStyle = col('#ffffff'); ctx.strokeStyle = col(CYAN); ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(sx(sp.x), sy(sp.y), sp.r * k, 0, TWO); ctx.fill(); ctx.stroke(); }
        for (const g of f.gum) { ctx.globalAlpha = 0.85; ctx.fillStyle = col(PINK); ctx.beginPath(); ctx.arc(sx(g.x), sy(g.y), 9 * k, 0, TWO); ctx.fill(); }
      }
      if (T && f.ledger) { // Compound Interest: the stored total over the target
        ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.font = 'bold ' + Math.max(11, 13 * k) + 'px monospace';
        for (const e of T.marks) if (e.due && e.due.w === w && !e.dead) { const txt = '$' + Math.round(e.due.stored); const x = sx(e.x), y = sy(e.y) - (e.r + 24) * k; ctx.fillStyle = col('#1a0507'); ctx.fillText(txt, x + 1, y + 1); ctx.fillStyle = col('#ffd6e0'); ctx.fillText(txt, x, y); }
      }
      if (f.hiders && f.hiders.length) { ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 6); ctx.fillStyle = c; for (const h of f.hiders) { ctx.beginPath(); ctx.arc(sx(h.x), sy(h.y), 3 * k, 0, TWO); ctx.fill(); } }
    }
    ctx.restore();
  }
  const vd0 = v10Draw;
  v10Draw = function () { vd0(); w5Draw(); };
})();
