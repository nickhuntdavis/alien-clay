'use strict';
// Spawn Prawn - the eight sample-exclusive gifts (X1 to X8) and the six shared gifts feats10.js did not have yet
// (spec: ../redesign docs/FEATS.md sections 2 to 4; card lines: giftvoice.js; personas: CONSCIOUSNESS.md).
//  - Exclusive gifts: drafted like any Feat, but their acquire card is eligible only while you play their sample
//    (the `start` getter, as acrosample.js does for X9). Slot 1 stays the sample's Unique Feat.
//      X1 TOO MUCH BABY (Baseline)      5 hits in 3 s: you swell with each one, then a Force shockwave; 3 s of no Snare.
//      X2 FIRST! (Alpha)                4 s of non-stop swimming: a Static lunge that bowls through everything in the way.
//      X3 LOOK WHAT YOU DID (Beta)      each hit taken sheds a blood droplet that erupts 1 s later (4 at once).
//      X4 LOOK AFTER EACH OTHER (P. S.) every 12 s three tiny friends circle you; each swallows one enemy shot, then pops.
//      X5 Where'd You Go (Ordered)      a telegraphed area about to land on you, or a winding-up attacker: you slip past it.
//      X6 EVERYBODY TOGETHER (Redtail)  6+ enemies bunched within 160: the whole cluster is Charged.
//      X7 I MADE EXTRAS (Prawn Again)   killing an elite or a 100+ health enemy: a see-through copy of you for 4 s.
//      X8 YOU'RE NOT REAL (Not of This World) gaining a status: a ripple clears it and hits with the current type.
//  - Shared gifts (later unlocks, like NOT YET; F10_ALL opens them for tests): THIS WAY (G10), Capacitation (F2),
//    Bombardier Beetle (F5), Spinnbarkeit (F8), Wandering Womb (F13), Ear Candling (F15).
//  - Level 3 forks follow FEATS.md; level 5 forks are written here (the docs only list level 3), as feats10.js does.
//  - X5 reads newfoes.js telegraphs (G.nfBurst areas, wind-ups) and chargers' and bosses' state-1 wind-ups aimed at you;
//    the attack you slipped carries on and hits its own side (12.4). X7's copies fire your real first weapon (an echo
//    slot at half damage) and count as pets towards the 8-pet cap (12.3). X8 reacts to statuses and to the Complement mark.
// Hooks: none in shared files. Wraps feats10.js f10Hurt, f10Kill, f10Tick, f10Draw; sigweap.js sigPetCount; autorun.js arGoal (THIS WAY's trail);
// samplelooks.js sampleLook (X1's swelling). index.html loads this after acrosample.js.
(function () {
  if (typeof V10 === 'undefined' || !V10 || typeof feat !== 'function') return;
  const D = () => f10(), mine = id => !!(G && G.s10 && G.s10.id === id);
  const only = (d, id) => { Object.defineProperty(d, 'start', { get: () => mine(id), configurable: true }); return d; };
  const segD = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1); return Math.hypot(px - (ax + dx * t), py - (ay + dy * t)); };
  const heading = p => (Math.hypot(p.vx || 0, p.vy || 0) > 20 ? Math.atan2(p.vy, p.vx) : p.face || 0);
  const firstW = () => (G.weapons || []).find(w => w && w.def) || null;
  const nowType = () => { const S = typeof S10_BY !== 'undefined' && S10_BY.alien; return S && S.shift ? S.shift[(G.s10 && G.s10.shiftI) || 0] : 'soul'; }; // (internal id)
  const elemCol = el => (ELEMENTS[el] && ELEMENTS[el].color) || F10_COL.soul;
  const wall = (x, y) => !!(G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y));
  function conj(a, b) { // the Conjoined status (fight.js fightTick reads these), as wup5.js conjoin
    for (const q of [a, b]) { q.conjT = G.t + 3; q.conjCd = G.t + 6; q.conjWith = q === a ? b : a; q.frozen = Math.max(q.frozen || 0, q.boss ? 0.5 : 3); }
  }

  // ================================================================ X1. TOO MUCH BABY (Baseline)
  feat(only({ id: 'x1_baby', name: 'TOO MUCH BABY', icon: 'X1', ico: 'bubble', type: 'force', atk: 'burst', trig: 1, ev: 1, rar: 1, stam: 16,
    does: 'You swell with every hit you take. On the fifth in three seconds you let go: a huge shockwave knocks everything back, and nothing can Snare you for 3 seconds.',
    base: { dmg: 24, cd: 12, area: 220 },
    stat: (w, s) => { if (f10Fk(w, 'growth')) s.area *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.6; s.need = f10Fk(w, 'hair') ? 4 : 5; },
    fire: w => {
      const p = me(), d = D(), s = w.s, l = f10Near(p.x, p.y, s.area); d.babyHits = [];
      f10Burst(w, p.x, p.y, s.area, s.dmg, null); for (const e of l) f10Shove(e, p.x, p.y, 460);
      d.noSnare = G.t + 3; ring(p.x, p.y, s.area, w.def.color, 0.5, 6); cam.shake = Math.min(10, cam.shake + 5);
      if (f10Fk(w, 'space')) d.space = { x: p.x, y: p.y, r: s.area, end: G.t + 3 };
    },
    forks: { 3: [fk('space', 'Personal Space', 'The shockwave leaves a ring for 3 seconds that shoves back anything crossing it.'), fk('growth', 'Growth Spurt', 'A 50% wider shockwave.')],
      5: [fk('hair', 'Hair Trigger', 'It lets go on the fourth hit, not the fifth.'), fk('quick', 'Growing Fast', 'A much shorter cooldown.')] } }, 'baseline'));

  // ================================================================ X2. FIRST! (Alpha)
  feat(only({ id: 'x2_first', name: 'FIRST!', icon: 'X2', ico: 'storm', type: 'static', atk: 'contact', trig: 1, rar: 1, stam: 14,
    does: 'After four seconds of swimming without stopping, you launch forward and bowl through everything in the way, Charging it and knocking it aside.',
    base: { dmg: 30, cd: 8, range: 160 },
    stat: (w, s) => { if (f10Fk(w, 'long')) s.range = 320; s.need = f10Fk(w, 'pace') ? 3 : 4; },
    when: w => (D().swimT >= w.s.need ? {} : null),
    fire: w => {
      const p = me(), d = D(), s = w.s, a = heading(p), ex = p.x + Math.cos(a) * s.range, ey = p.y + Math.sin(a) * s.range; d.swimT = 0;
      const hit = G.enemies.filter(e => f10Live(e) && segD(e.x, e.y, p.x, p.y, ex, ey) < e.r + p.r + 12).sort((u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y));
      for (const e of hit) { f10Hit(w, e, s.dmg, 'contact'); const side = ((e.x - p.x) * -Math.sin(a) + (e.y - p.y) * Math.cos(a)) >= 0 ? 1 : -1; f10Shove(e, e.x + Math.sin(a) * side * 40, e.y - Math.cos(a) * side * 40, 300); }
      f10Lunge(Math.cos(a) * s.range, Math.sin(a) * s.range); bolt(p.x, p.y, ex, ey, w.def.color, 0.25);
      if (f10Fk(w, 'lap')) { let x = ex, y = ey; for (const e of G.enemies.filter(e => f10Live(e) && e.elite && Math.hypot(e.x - ex, e.y - ey) < 300).slice(0, 2)) { bolt(x, y, e.x, e.y, w.def.color, 0.25); f10Hit(w, e, s.dmg, 'contact'); x = e.x; y = e.y; } }
      const last = hit[hit.length - 1];
      if (last && f10Fk(w, 'photo')) for (const o of acquireMany('nearest', 260, last.x, last.y, 3)) if (o !== last) { bolt(last.x, last.y, o.x, o.y, w.def.color, 0.2); f10Hit(w, o, s.dmg * 0.6, 'proj'); }
      floatText(p.x, p.y - 36, 'FIRST', w.def.color, 14, 0.8);
    },
    forks: { 3: [fk('lap', 'Victory Lap', 'It bounces to up to two elites on the way, then carries on.'), fk('photo', 'Photo Finish', 'The last enemy hit discharges an arc at once.')],
      5: [fk('long', 'Lap Record', 'The lunge goes twice as far.'), fk('pace', 'Early Start', 'It only needs three seconds of swimming.')] } }, 'alpha'));

  // ================================================================ X3. LOOK WHAT YOU DID (Beta)
  feat(only({ id: 'x3_look', name: 'LOOK WHAT YOU DID', icon: 'X3', ico: 'droplet', type: 'blood', atk: 'burst', trig: 1, ev: 1, rar: 1, stam: 4,
    does: 'Every hit you take sheds a droplet of blood. A second later it erupts and makes everything near it Bleed. Bigger hits, bigger eruptions.',
    base: { dmg: 14, cd: 1.5 },
    stat: (w, s) => { s.rk = f10Fk(w, 'big') ? 1.3 : 1; s.max = f10Fk(w, 'more') ? 6 : 4; },
    fire: (w, c) => { const p = me(), d = D(); (d.drops || (d.drops = [])).push({ x: p.x + rand(-12, 12), y: p.y + rand(-12, 12), t: G.t + 1, r: (c.big ? 110 : 70) * w.s.rk, w }); },
    forks: { 3: [fk('clot', 'Clotting', 'Droplets that touch merge into one bigger eruption.'), fk('late', 'Late Bloomer', 'Below 30% health, each droplet erupts twice.')],
      5: [fk('big', 'Haemorrhage', 'Every eruption is 30% wider.'), fk('more', 'Bleeder', 'Up to six droplets at once.')] } }, 'beta'));
  function x3Erupt(dr) {
    const d = D(), w = dr.w, p = me(); let r = dr.r;
    if (f10Fk(w, 'clot')) for (const o of d.drops) if (o !== dr && !o.done && Math.hypot(o.x - dr.x, o.y - dr.y) < 50) { o.done = true; r = Math.min(150, r + 30); }
    const go = () => { if (G && G.state === 'play') { f10Burst(w, dr.x, dr.y, r, w.s.dmg, null); ring(dr.x, dr.y, r, F10_COL.blood, 0.35, 4); } };
    go(); if (f10Fk(w, 'late') && p.hp < G.P.maxHp * 0.3) after(0.4, go);
  }

  // ================================================================ X4. LOOK AFTER EACH OTHER (Private Schooled)
  feat(only({ id: 'x4_friends', name: 'LOOK AFTER EACH OTHER', icon: 'X4', ico: 'twins', type: 'soul', atk: 'contact', trig: 1, rar: 1, stam: 10,
    does: 'Every 12 seconds, three tiny friends circle you. Each one swallows one enemy shot, then pops.',
    base: { dmg: 6, cd: 12 },
    stat: (w, s) => { s.n = f10Fk(w, 'connections') ? 4 : 3; s.orb = f10Fk(w, 'wide') ? 52 : 36; s.lives = f10Fk(w, 'sturdy') ? 2 : 1; },
    when: () => (D().friends && D().friends.length ? null : {}),
    fire: w => { const d = D(); d.friends = []; for (let i = 0; i < w.s.n; i++) d.friends.push({ a: i / w.s.n * TAU, lives: w.s.lives, hitT: 0, w, end: G.t + 12 }); },
    forks: { 3: [fk('plusones', 'Plus Ones', 'Friends also swat enemies they touch, building Alien.'), fk('connections', 'Connections', 'Four friends instead of three.')],
      5: [fk('wide', 'Wider Circle', 'Friends circle farther out and catch more.'), fk('sturdy', 'Old Money', 'Each friend swallows two shots before it pops.')] } }, 'private'));

  // ================================================================ X5. Where'd You Go (Ordered Online)
  feat(only({ id: 'x5_whered', name: "Where'd You Go", icon: 'X5', ico: 'peek', trig: 1, rar: 1,
    does: 'When a big telegraphed attack is about to land on you, you slip out to the far side of the attacker and leave a Mucus patch where you were.',
    base: { cd: 10 },
    stat: (w, s) => { if (f10Fk(w, 'slippery')) s.cd = 6; },
    when: () => {
      const p = me();
      for (const b of G.nfBurst || []) if (b.t > 0 && b.t < 0.45 && Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r) { const e = acquire('nearest', b.r + 120, b.x, b.y); return { e, x: b.x, y: b.y, b }; }
      for (const e of G.enemies) {
        if (!f10Live(e)) continue;
        const dd = Math.hypot(e.x - p.x, e.y - p.y);
        if ((e.windT > 0 || e.sbWind > 0 || e.dripW > 0) && dd < 200 + e.r) return { e, x: e.x, y: e.y };
        // Chargers and bosses telegraph a dash or a big attack in state 1 (game.js 'charge', bosses.js): aimed at you, about to go.
        if ((e.def.ai === 'charge' || e.boss) && e.st === 1 && e.stT > 0 && e.stT < 0.4 && dd < (e.boss ? 420 : 300) + e.r) {
          const ax = e.dashX, ay = e.dashY, aimed = ax == null || ((p.x - e.x) * ax + (p.y - e.y) * ay) / (dd || 1) > 0.7;
          if (aimed) return { e, x: e.x, y: e.y, dash: e };
        }
      }
      return null;
    },
    fire: (w, c) => {
      const p = me(), d = D(), ox = p.x, oy = p.y, t = c.e && !c.e.dead ? c.e : null;
      // The attack carries on without you and can hit its own side (their damage, COMBAT_MATRIX.md 12.4).
      if (c.b) (d.x5b || (d.x5b = [])).push({ b: c.b, w });
      if (c.dash) c.dash.f10ff = G.t + 1.6;
      let a = t ? Math.atan2(t.y - p.y, t.x - p.x) : Math.atan2(p.y - c.y, p.x - c.x), len = t ? Math.min(160, Math.hypot(t.x - p.x, t.y - p.y) + t.r + 40) : 160;
      if (!f10Lunge(Math.cos(a) * len, Math.sin(a) * len)) { a += Math.PI; f10Lunge(Math.cos(a) * 160, Math.sin(a) * 160); }
      f10Patch(w, ox, oy, f10Fk(w, 'puddle') ? 80 : 50, 4, 'mucus', 2);
      if (f10Fk(w, 'decoy')) G.peek = { x: ox, y: oy, t: G.t + 1, w, boo: false };
      if (f10Fk(w, 'ribbon') && d.oPath && d.oPath.length > 2) d.ghost = { path: d.oPath.slice(), t0: G.t, w, hit: new Set() };
      floatText(p.x, p.y - 34, 'Relocated.', F10_COL.utility, 12, 0.8);
    },
    forks: { 3: [fk('ribbon', 'Ghost Ribbon', 'A see-through copy repeats your last second of swimming, Snaring what it touches.'), fk('slippery', 'Slippery When Wet', 'A 6 second cooldown.')],
      5: [fk('decoy', 'Return to Sender', 'You leave a decoy behind for a second, and enemies attack it.'), fk('puddle', 'Spillage', 'A much wider Mucus patch.')] } }, 'ordered'));

  // ================================================================ X6. EVERYBODY TOGETHER (Redtail)
  const x6Cluster = (x, y, range, skip) => {
    const l = f10Near(x, y, range).filter(e => !skip || !skip.has(e));
    for (const e of l) { const g = l.filter(o => Math.hypot(o.x - e.x, o.y - e.y) < 160); if (g.length >= 6) return g; }
    return null;
  };
  feat(only({ id: 'x6_together', name: 'EVERYBODY TOGETHER', icon: 'X6', ico: 'link', type: 'static', atk: 'burst', trig: 1, rar: 1, stam: 14,
    does: 'When six or more enemies bunch up, arcs link the whole cluster: every one of them is Charged.',
    base: { dmg: 8, cd: 10, range: 420 },
    stat: (w, s) => { if (f10Fk(w, 'loud')) s.dmg *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.6; },
    when: w => { const p = me(), g = x6Cluster(p.x, p.y, w.s.range); return g ? { g } : null; },
    fire: (w, c) => {
      const link = g => {
        g = g.filter(e => !e.dead); if (!g.length) return null;
        f10Many(w, g, w.s.dmg, 'burst'); for (let i = 1; i < g.length; i++) bolt(g[i - 1].x, g[i - 1].y, g[i].x, g[i].y, w.def.color, 0.3);
        const cx = g.reduce((a, e) => a + e.x, 0) / g.length, cy = g.reduce((a, e) => a + e.y, 0) / g.length;
        if (f10Fk(w, 'hold')) D().pulls.push({ x: cx, y: cy, r: 200, end: G.t + 1 });
        return { cx, cy };
      };
      const m = link(c.g || []);
      if (m && f10Fk(w, 'chat') && c.g.length >= 10) { const g2 = x6Cluster(m.cx, m.cy, 300, new Set(c.g)); if (g2) link(g2); }
    },
    forks: { 3: [fk('chat', 'Group Chat', 'If the cluster had ten or more, it jumps to a second cluster nearby.'), fk('hold', 'Hold Tight', 'The cluster is squeezed together for a second.')],
      5: [fk('loud', 'Everybody Louder', 'The arcs hit 50% harder.'), fk('quick', 'Again Again', 'A much shorter cooldown.')] } }, 'redtail'));

  // ================================================================ X7. I MADE EXTRAS (Prawn Again)
  feat(only({ id: 'x7_extras', name: 'I MADE EXTRAS', icon: 'X7', ico: 'twins', type: 'soul', atk: 'contact', trig: 1, ev: 1, rar: 1, stam: 10,
    does: 'Killing an elite or a big enemy makes a see-through copy of you for a few seconds. It swims with you and fires your first weapon at half damage, then bursts.',
    base: { dmg: 14, cd: 10 },
    stat: (w, s) => { s.life = f10Fk(w, 'shift') ? 8 : 4; s.share = f10Fk(w, 'aim') ? 0.75 : 0.5; s.boom = f10Fk(w, 'loud') ? 240 : 120; },
    fire: (w, c) => x7Copy(w, (c && c.gen) || 0),
    forks: { 3: [fk('extras', 'Extras of Extras', 'A copy that helps kill a big enemy makes one more copy. Never a third.'), fk('shift', 'Long Shift', 'Copies last 8 seconds.')],
      5: [fk('aim', 'Muscle Memory', 'Copies fire at three quarters of your damage.'), fk('loud', 'Going Out Loud', 'A copy bursts twice as wide.')] } }, 'prawn'));
  // Copies are pets (COMBAT_MATRIX.md 12.3): at most two, and they count towards the 8-pet cap (sigweap.js sigPetCount).
  function x7Copy(w, gen) {
    const d = D(), p = me(), L = d.copies || (d.copies = []);
    if (L.length >= 2 || (typeof sigPetCount === 'function' && sigPetCount() >= 8)) return;
    L.push({ x: p.x, y: p.y, end: G.t + w.s.life, shotT: 0, gen, w, side: L.length ? -1 : 1 });
  }
  // The copy fires your real first weapon from where it swims, at a share of the damage (an echo slot: no stats, no stamina).
  function x7Fire(c) {
    const fw = firstW(); if (!fw || !fw.s) return 0.5;
    const t = fw.def.noTarget ? null : acquire(fw.dir || 'nearest', fw.s.range || 400, c.x, c.y);
    if (!t && !fw.def.noTarget) return 0.3;
    const echo = Object.assign(Object.create(Object.getPrototypeOf(fw)), fw, { s: Object.assign({}, fw.s, { dmg: (fw.s.dmg || 0) * c.w.s.share }), echo: true, cd: 0, f10copy: true });
    const P = G.player, R = G.realPlayer, ox = P.x, oy = P.y, rx = R && R.x, ry = R && R.y;
    P.x = c.x; P.y = c.y; if (R) { R.x = c.x; R.y = c.y; }
    try { fireWeapon(echo, t); } catch (e) { /* a weapon that cannot fire from a copy skips this shot */ }
    finally { P.x = ox; P.y = oy; if (R) { R.x = rx; R.y = ry; } }
    return Math.max(0.25, fw.s.cd || 0.6);
  }

  // ================================================================ X8. YOU'RE NOT REAL (Not of This World)
  feat(only({ id: 'x8_notreal', name: "YOU'RE NOT REAL", icon: 'X8', ico: 'spiral', type: 'soul', atk: 'burst', trig: 1, ev: 1, rar: 1, stam: 12,
    does: 'When you gain a status or a mark, a ripple bursts out of you: it removes them all from you and hits everything nearby with your current damage type.',
    base: { dmg: 22, cd: 12, area: 160 },
    stat: (w, s) => { if (f10Fk(w, 'far')) s.area *= 1.5; if (f10Fk(w, 'calm')) s.cd *= 0.65; if (f10Fk(w, 'loud')) s.dmg *= 1.5; },
    fire: w => {
      const p = me(), s = w.s, P = G.pd, el = nowType(), l = f10Near(p.x, p.y, s.area);
      if (P) { P.snareT = 0; P.bleeds = []; P.burnT = 0; P.burnPool = 0; P.chargeT = 0; } G.complT = 0; // (and a Complement Protein's mark: foes2.js)
      f10Burst(w, p.x, p.y, s.area, s.dmg, { elem: el }, elemCol(el)); ring(p.x, p.y, s.area, elemCol(el), 0.45, 5);
      if (f10Fk(w, 'planet')) for (const e of l) if (!e.dead && e.elite) f10Stagger(e);
    },
    forks: { 3: [fk('planet', 'Wrong Planet', 'The ripple also staggers elites mid-attack.'), fk('far', 'Not From Here', 'A 50% wider ripple.')],
      5: [fk('loud', 'First Language', 'The ripple hits 50% harder.'), fk('calm', 'Unbothered', 'A much shorter cooldown.')] } }, 'alien'));

  // ================================================================ shared gifts the pool lacked
  // G10. THIS WAY
  feat({ id: 'this_way', name: 'THIS WAY', icon: 'TW', ico: 'wake', trig: 1, rar: 3,
    does: 'After a few seconds in danger, a faint trail of motes points to the safest pocket nearby. Reach the end for a burst of speed.',
    base: { cd: 15, range: 400 },
    stat: (w, s) => { if (f10Fk(w, 'quick')) s.cd *= 0.6; s.boost = f10Fk(w, 'long') ? 6 : 3; },
    when: w => { const d = D(); if (d.trail) return null; if (d.twDanger >= 3) return { safe: false }; if (f10Fk(w, 'shortcut') && d.twCalm >= 3 && G.gems.some(g => !g.dead && Math.hypot(g.x - me().x, g.y - me().y) < w.s.range)) return { safe: true }; return null; },
    fire: (w, c) => {
      const p = me(), d = D(), R = w.s.range; let bx = null, by = null, bv = 1e9;
      if (c.safe) { for (const g of G.gems) { if (g.dead) continue; const v = Math.hypot(g.x - p.x, g.y - p.y); if (v < bv && v < R) { bv = v; bx = g.x; by = g.y; } } }
      else for (let i = 0; i < 16; i++) for (const r of [R * 0.6, R]) {
        const a = i / 16 * TAU, x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r; if (wall(x, y)) continue;
        let v = f10Near(x, y, 160).length; for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - x, b.y - y) < 120) v += 0.5;
        if (v < bv) { bv = v; bx = x; by = y; }
      }
      if (bx == null) return; d.trail = { x: bx, y: by, end: G.t + 6, w }; d.twDanger = 0; d.twCalm = 0;
    },
    forks: { 3: [fk('snack', 'Snack at the End', 'Reaching the end heals 5%.'), fk('shortcut', 'Shortcut', 'When you are safe, the trail points to the nearest pickup instead.')],
      5: [fk('long', 'Second Wind', 'The burst of speed lasts twice as long.'), fk('quick', 'Know the Way', 'A much shorter cooldown.')] } });

  // F2. Capacitation
  feat({ id: 'capacitation', name: 'Capacitation', icon: 'CP', ico: 'shield', type: 'force', atk: 'contact', rar: 2, stam: 22,
    does: 'You drive head-first through a line of enemies. Every one you pass through makes the next hit harder, so the last in line takes the most.',
    base: { dmg: 40, cd: 7, range: 320 },
    stat: (w, s) => { if (f10Fk(w, 'hyper')) s.range = 640; if (f10Fk(w, 'acro')) s.dmg *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
    when: w => {
      const p = me(), R = w.s.range; let best = null;
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU, ex = p.x + Math.cos(a) * R, ey = p.y + Math.sin(a) * R;
        const l = G.enemies.filter(e => f10Live(e) && segD(e.x, e.y, p.x, p.y, ex, ey) < e.r + 30);
        if (l.length && (!best || l.length > best.l.length)) best = { a, l };
      }
      return best;
    },
    fire: (w, c) => {
      const p = me(), s = w.s, l = (c.l || []).filter(e => !e.dead).sort((u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y));
      let k = 1; for (const e of l) { f10Hit(w, e, s.dmg * k, 'contact'); k = Math.min(2, k + 0.1); }
      const last = l[l.length - 1]; if (last && f10Fk(w, 'zona')) f10Stagger(last);
      const far = last ? Math.min(s.range, Math.hypot(last.x - p.x, last.y - p.y) + last.r + 30) : s.range;
      f10Lunge(Math.cos(c.a) * far, Math.sin(c.a) * far); ring(p.x, p.y, p.r + 10, w.def.color, 0.25, 3);
    },
    forks: { 3: [fk('hyper', 'Hyperactivated', 'You drive twice as far.'), fk('zona', 'Zona Binding', 'The last enemy in line is staggered.')],
      5: [fk('acro', 'Acrosome Reaction', 'Every hit is 50% harder.'), fk('quick', 'Head Start', 'A shorter cooldown.')] } });

  // F5. Bombardier Beetle
  feat({ id: 'bombardier', name: 'Bombardier Beetle', icon: 'BB', ico: 'spray', type: 'acid', atk: 'spread', rar: 2, stam: 18,
    does: 'A boiling cone of acid sprays at the nearest enemy behind you, and the recoil throws you the other way.',
    base: { dmg: 12, cd: 6, range: 300 },
    stat: (w, s) => { if (f10Fk(w, 'caustic')) s.dmg *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
    when: w => { const p = me(), f = heading(p); let best = null, bd = 1e9; for (const e of f10Near(p.x, p.y, w.s.range)) { const a = Math.atan2(e.y - p.y, e.x - p.x), dd = Math.hypot(e.x - p.x, e.y - p.y) * (Math.abs(angDiff(a, f)) > Math.PI / 2 ? 1 : 2); if (dd < bd) { bd = dd; best = e; } } return best ? { a: Math.atan2(best.y - p.y, best.x - p.x) } : null; },
    fire: (w, c) => {
      const p = me(), s = w.s;
      const spray = a => { if (!G || G.state !== 'play') return; const q = me();
        for (let i = 0; i < 6; i++) { const b = a + (i - 2.5) * 0.09, ex = q.x + Math.cos(b) * s.range, ey = q.y + Math.sin(b) * s.range;
          for (const e of G.enemies) if (f10Live(e) && segD(e.x, e.y, q.x, q.y, ex, ey) < e.r + 10) f10Hit(w, e, s.dmg, 'spread');
          (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: q.x, y: q.y, x2: ex, y2: ey, w: 8, c: w.def.color, t: 'fire', life: 0.2, max: 0.2 }); } };
      spray(c.a);
      if (f10Lunge(-Math.cos(c.a) * 160, -Math.sin(c.a) * 160) && f10Fk(w, 'escape')) p.iframes = Math.max(p.iframes, 0.3);
      if (f10Fk(w, 'turret')) for (let i = 1; i <= 4; i++) after(i * 0.25, () => { if (!G) return; const q = me(), t = acquire('cluster', s.range, q.x, q.y); if (t) spray(Math.atan2(t.y - q.y, t.x - q.x)); });
    },
    forks: { 3: [fk('turret', 'Turret', 'The cone keeps spraying for a second, tracking the densest crowd.'), fk('escape', 'Escape Artist', 'Nothing can hurt you during the recoil dash.')],
      5: [fk('caustic', 'Caustic', 'The spray hits 50% harder.'), fk('quick', 'Hair Trigger', 'A shorter cooldown.')] } });

  // F8. Spinnbarkeit
  feat({ id: 'spinnbarkeit', name: 'Spinnbarkeit', icon: 'SP', ico: 'web', type: 'mucus', atk: 'proj', rar: 2, stam: 16,
    does: 'Stretchy strings tie pairs of nearby enemies together. Both ends are Snared and Conjoined for 3 seconds.',
    base: { dmg: 12, cd: 7, range: 300 },
    stat: (w, s) => { s.pairs = f10Fk(w, 'more') ? 6 : 4; if (f10Fk(w, 'thick')) s.dmg *= 1.5; },
    when: w => { const p = me(), l = f10Near(p.x, p.y, w.s.range); return l.length >= 2 ? { l } : null; },
    fire: (w, c) => {
      const p = me(), d = D(), s = w.s, used = new Set(), str = d.strings || (d.strings = []), size = f10Fk(w, 'fern') ? 3 : 2;
      const pool = (c.l || []).filter(e => !e.dead && !(e.conjCd > G.t)).sort((u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y));
      let n = 0;
      for (const a of pool) {
        if (n >= s.pairs || used.has(a)) continue;
        const g = [a]; for (const o of pool) { if (g.length >= size) break; if (!used.has(o) && !g.includes(o) && Math.hypot(o.x - a.x, o.y - a.y) < 200) g.push(o); }
        if (g.length < 2) continue;
        for (const e of g) { used.add(e); f10Hit(w, e, s.dmg, 'proj'); }
        for (let i = 1; i < g.length; i++) { conj(g[i - 1], g[i]); str.push({ a: g[i - 1], b: g[i], end: G.t + 3 }); }
        if (f10Fk(w, 'elastic')) after(3, () => { if (!G || G.state !== 'play') return; for (let i = 1; i < g.length; i++) { const u = g[i - 1], v = g[i]; if (u.dead || v.dead) continue; f10Hit(w, u, s.dmg, 'proj'); f10Hit(w, v, s.dmg, 'proj'); f10Shove(u, v.x, v.y, -200); f10Shove(v, u.x, u.y, -200); } });
        n++;
      }
      if (n) floatText(p.x, p.y - 34, 'Stretchy.', w.def.color, 12, 0.7);
    },
    forks: { 3: [fk('elastic', 'Elastic', 'When a string ends, it flings both ends into each other for one more hit each.'), fk('fern', 'Ferning', 'Each string branches to a third enemy: groups of three.')],
      5: [fk('more', 'Ovulation', 'Six strings instead of four.'), fk('thick', 'Thick and Clear', 'The strings hit 50% harder.')] } });

  // F13. Wandering Womb
  feat({ id: 'wandering_womb', name: 'Wandering Womb', icon: 'WO', ico: 'spiral', type: 'soul', atk: 'proj', rar: 2, stam: 20,
    does: 'A ghostly womb drifts slowly across the screen, through walls, building Alien on everything it passes and dragging enemies into its path.',
    base: { dmg: 14, cd: 8, range: 450 },
    stat: (w, s) => { if (f10Fk(w, 'heavy')) s.dmg *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
    when: w => { const p = me(), t = acquire('cluster', w.s.range, p.x, p.y); return t ? { a: Math.atan2(t.y - p.y, t.x - p.x) } : null; },
    fire: (w, c) => {
      const p = me(), d = D(), L = d.wombs || (d.wombs = []);
      const one = a => L.push({ x: p.x, y: p.y, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, end: G.t + 4, hitT: new Map(), w, stuck: null });
      if (f10Fk(w, 'bicorn')) { one(c.a - 0.35); one(c.a + 0.35); } else one(c.a);
      while (L.length > 4) L.shift();
    },
    forks: { 3: [fk('ectopic', 'Ectopic', 'It stops on the toughest enemy it meets and stays there for 3 seconds.'), fk('bicorn', 'Bicornuate', 'Two wombs, angled apart.')],
      5: [fk('heavy', 'Hysteria', 'It hits 50% harder.'), fk('quick', 'Restless', 'A shorter cooldown.')] } });

  // F15. Ear Candling
  feat({ id: 'ear_candling', name: 'Ear Candling', icon: 'EC', ico: 'flask', type: 'fire', atk: 'pool', rar: 2, stam: 16,
    does: 'You plant a lit candle behind you. Greedy enemies come to look at it, and it drips fire under itself.',
    base: { dmg: 10, cd: 7 },
    stat: (w, s) => { s.life = f10Fk(w, 'tall') ? 6 : 4; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
    when: () => { const p = me(); return f10Near(p.x, p.y, 350).length ? {} : null; },
    fire: w => {
      const p = me(), d = D(), s = w.s, a = heading(p) + Math.PI, C = d.candles || (d.candles = []);
      const one = off => { const x = p.x + Math.cos(a) * 60 - Math.sin(a) * off, y = p.y + Math.sin(a) * 60 + Math.cos(a) * off; f10Patch(w, x, y, 75, s.life, 'fire', s.dmg); C.push({ x, y, end: G.t + s.life, w, lured: null }); };
      if (f10Fk(w, 'vigil')) { one(-60); one(60); } else one(0);
    },
    forks: { 3: [fk('vigil', 'Vigil', 'Two candles.'), fk('snuffed', 'Snuffed', 'When it burns out, it bursts in a ring of fire.')],
      5: [fk('tall', 'Tall Candle', 'Candles burn for 6 seconds.'), fk('quick', 'Tealights', 'A shorter cooldown.')] } });

  // ================================================================ hooks (wrapped)
  const _hurt = f10Hurt, _kill = f10Kill, _tick = f10Tick, _draw = f10Draw;
  f10Hurt = function (d, ent, kind) {
    if (_hurt(d, ent, kind)) return true;
    const p = me(), Dd = D();
    let w = f10Own('x1_baby');
    if (w) { const h = Dd.babyHits || (Dd.babyHits = []); h.push(G.t); Dd.babyHits = h.filter(t => G.t - t < 3); if (w.cd <= 0 && Dd.babyHits.length >= w.s.need) f10Go(w, {}); }
    w = f10Evs('x3_look');
    if (w && (Dd.drops || []).filter(x => !x.done).length < w.s.max) f10Go(w, { big: d >= G.P.maxHp * 0.10 });
    return false;
  };
  f10Kill = function (e, src) {
    _kill(e, src);
    const w = f10Own('x7_extras'); if (!w || !(e.elite || e.boss || e.maxHp >= 100)) return;
    const d = D(), helped = (d.copies || []).find(c => c.gen === 0 && c.end > G.t);
    if (helped && f10Fk(w, 'extras') && !helped.made) { helped.made = true; x7Copy(w, 1); }
    else if (w.cd <= 0) f10Go(w, { gen: 0 });
  };
  f10Tick = function (dt) {
    _tick(dt);
    if (!G || !G.f10) return;
    const d = G.f10, p = me();
    // X1: no Snare while it lasts; Personal Space shoves back anything crossing the ring.
    if (d.noSnare > G.t && G.pd) G.pd.snareT = 0;
    if (d.space) { if (d.space.end < G.t) d.space = null; else for (const e of f10Near(d.space.x, d.space.y, d.space.r + 20)) if (Math.hypot(e.x - d.space.x, e.y - d.space.y) > d.space.r - 20) f10Shove(e, d.space.x, d.space.y, 160); }
    // X2: the swimming clock.
    if (Math.hypot(p.vx || 0, p.vy || 0) > 40) d.swimT = (d.swimT || 0) + dt; else d.swimT = 0;
    // X3: droplets erupt.
    if (d.drops) { for (const x of d.drops) if (!x.done && G.t >= x.t) { x.done = true; x3Erupt(x); } d.drops = d.drops.filter(x => !x.done); }
    // X4: friends circle and swallow shots.
    if (d.friends && d.friends.length) {
      const w = d.friends[0].w, R = w.s.orb;
      for (const f of d.friends) {
        f.a += dt * 3; f.x = p.x + Math.cos(f.a) * R; f.y = p.y + Math.sin(f.a) * R;
        for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - f.x, b.y - f.y) < 9 + (b.r || 4)) { b.dead = true; if (--f.lives <= 0) { f.dead = true; ring(f.x, f.y, 10, F10_COL.soul, 0.25, 2); break; } }
        if (!f.dead && f10Fk(w, 'plusones') && G.t > f.hitT) for (const e of f10Near(f.x, f.y, 14)) { f10Hit(w, e, w.s.dmg, 'contact'); f.hitT = G.t + 0.5; break; }
      }
      d.friends = d.friends.filter(f => !f.dead && f.end > G.t);
    }
    // X5: the last second of swimming (Ghost Ribbon) and the replay.
    const op = d.oPath || (d.oPath = []); op.push({ x: p.x, y: p.y, t: G.t }); while (op.length && G.t - op[0].t > 1) op.shift();
    if (d.ghost) {
      const g = d.ghost, k = (G.t - g.t0) / 1, i = Math.min(g.path.length - 1, Math.floor(k * g.path.length)), q = g.path[i];
      if (k >= 1) d.ghost = null;
      else { g.x = q.x; g.y = q.y; for (const e of f10Near(q.x, q.y, 20)) if (!g.hit.has(e)) { g.hit.add(e); f10Hit(g.w, e, 4, 'contact', { elem: 'ice' }); } }
    }
    // X5: the attack you slipped hits its own side. A dodged area hits the enemies inside it when it goes off; a dodged
    // charger or boss dash hits whoever it ploughs into for the next 1.6 s (their damage).
    if (d.x5b && d.x5b.length) {
      for (const o of d.x5b) if (o.b.t <= dt || !(G.nfBurst || []).includes(o.b)) {
        o.done = true; IN_AOE = true;
        try { for (const e of f10Near(o.b.x, o.b.y, o.b.r)) damageEnemy(e, o.b.dmg || 12, { elem: 'phys', atk: 'burst', wname: "Where'd You Go", noCrit: true, noProc: true, w: o.w }); } finally { IN_AOE = false; }
        ring(o.b.x, o.b.y, o.b.r, F10_COL.utility, 0.3, 3);
      }
      d.x5b = d.x5b.filter(o => !o.done);
    }
    for (const e of G.enemies) {
      if (!(e.f10ff > G.t) || e.dead) continue;
      for (const o of f10Near(e.x, e.y, e.r + 30)) if (o !== e && !(o.f10ffT > G.t) && Math.hypot(o.x - e.x, o.y - e.y) < o.r + e.r + 4) { o.f10ffT = G.t + 0.5; damageEnemy(o, e.dmg || 10, { elem: 'phys', atk: 'contact', wname: "Where'd You Go", noCrit: true, noProc: true }); }
    }
    // X6 uses feats10.js's pulls. X7: copies swim with you and fire.
    if (d.copies && d.copies.length) {
      for (const c of d.copies) {
        const a = heading(p) + Math.PI / 2 * c.side, tx = p.x + Math.cos(a) * 34, ty = p.y + Math.sin(a) * 34, k = Math.min(1, dt * 6);
        c.x += (tx - c.x) * k; c.y += (ty - c.y) * k;
        if ((c.shotT -= dt) <= 0) c.shotT = x7Fire(c);
        if (G.t >= c.end) { c.done = true; f10Burst(c.w, c.x, c.y, c.w.s.boom, c.w.s.dmg, null); ring(c.x, c.y, c.w.s.boom, F10_COL.soul, 0.4, 4); }
      }
      d.copies = d.copies.filter(c => !c.done);
    }
    // X8: a status you did not have a moment ago.
    const w8 = f10Own('x8_notreal');
    if (w8 && G.pd) {
      const P = G.pd, now = { sn: P.snareT > G.t, bl: !!(P.bleeds && P.bleeds.length), bu: P.burnT > 0, ch: P.chargeT > G.t, mk: G.complT > G.t }, was = d.nrWas || {};
      d.nrWas = now;
      if (w8.cd <= 0 && Object.keys(now).some(k => now[k] && !was[k])) f10Go(w8, {});
    }
    // THIS WAY: the danger and calm clocks, and the trail.
    const danger = (d.hits && d.hits.some(t => G.t - t < 0.6)) || f10Near(p.x, p.y, 150).length >= 6;
    d.twDanger = danger ? (d.twDanger || 0) + dt : 0; d.twCalm = danger ? 0 : (d.twCalm || 0) + dt;
    if (d.trail) {
      const T = d.trail;
      if (G.t > T.end) d.trail = null;
      else if (Math.hypot(p.x - T.x, p.y - T.y) < 45) { d.boost = G.t + T.w.s.boost; if (f10Fk(T.w, 'snack')) healPlayer(G.P.maxHp * 0.05); floatText(p.x, p.y - 34, 'This way.', F10_COL.utility, 12, 0.8); d.trail = null; }
    }
    // Wandering Womb.
    if (d.wombs && d.wombs.length) {
      for (const m of d.wombs) {
        if (m.stuck && (m.stuck.dead || G.t > m.stuckEnd)) m.end = 0;
        if (m.stuck && !m.stuck.dead) { m.x = m.stuck.x; m.y = m.stuck.y; } else { m.x += m.vx * dt; m.y += m.vy * dt; }
        for (const e of f10Near(m.x, m.y, 70)) {
          if (!e.boss) { const dx = m.x - e.x, dy = m.y - e.y, dd = Math.hypot(dx, dy) || 1, f = Math.min(dd, 140 * dt), nx = e.x + dx / dd * f, ny = e.y + dy / dd * f; if (!wall(nx, ny)) { e.x = nx; e.y = ny; } }
          if (Math.hypot(e.x - m.x, e.y - m.y) < 40 + e.r && (m.hitT.get(e) || 0) < G.t) { m.hitT.set(e, G.t + 0.6); f10Hit(m.w, e, m.w.s.dmg, 'proj'); if (!m.stuck && f10Fk(m.w, 'ectopic') && (e.elite || e.boss || e.maxHp >= 100)) { m.stuck = e; m.stuckEnd = G.t + 3; } }
        }
      }
      d.wombs = d.wombs.filter(m => G.t < m.end || (m.stuck && !m.stuck.dead && G.t < m.stuckEnd));
    }
    // Ear Candling: the lure (bosses ignore it, elites half as often, at most 3 per candle).
    if (d.candles && d.candles.length) {
      for (const c of d.candles) {
        if (!c.lured) c.lured = f10Near(c.x, c.y, 350).filter(e => !e.boss && !e.rival && (!e.elite || Math.random() < 0.5)).slice(0, 3);
        for (const e of c.lured) if (!e.dead) { const dx = c.x - e.x, dy = c.y - e.y, dd = Math.hypot(dx, dy); if (dd > 20) { const f = Math.min(dd - 20, 110 * dt); e.x += dx / dd * f; e.y += dy / dd * f; } }
        if (G.t >= c.end) { c.done = true; if (f10Fk(c.w, 'snuffed')) { f10Burst(c.w, c.x, c.y, 110, c.w.s.dmg * 2, null); ring(c.x, c.y, 110, F10_COL.fire, 0.4, 5); } }
      }
      d.candles = d.candles.filter(c => !c.done);
    }
    if (d.strings) d.strings = d.strings.filter(s => s.end > G.t && !s.a.dead && !s.b.dead);
  };
  f10Draw = function () {
    _draw();
    const d = G && G.f10; if (!d) return;
    const p = me(), t = G.t; ctx.save(); ctx.lineCap = 'round';
    for (const x of d.drops || []) { ctx.fillStyle = col(F10_COL.blood); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(sx(x.x), sy(x.y), 4 * S, 0, TAU); ctx.fill(); }
    for (const f of d.friends || []) { if (f.x == null) continue; ctx.fillStyle = col(F10_COL.soul); ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), 4.5 * S, 0, TAU); ctx.fill(); }
    if (d.ghost && d.ghost.x != null) { ctx.fillStyle = col(F10_COL.mucus); ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(sx(d.ghost.x), sy(d.ghost.y), (p.r + 2) * S, 0, TAU); ctx.fill(); }
    for (const c of d.copies || []) {
      const a = 0.35 + 0.1 * Math.sin(t * 8);
      try { drawShip(sx(c.x), sy(c.y), heading(p), null, a, 1, p); } catch (e) { ctx.fillStyle = col(F10_COL.soul); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(sx(c.x), sy(c.y), p.r * S, 0, TAU); ctx.fill(); }
    }
    if (d.trail) { const T = d.trail, n = 9; ctx.fillStyle = col(F10_COL.utility); for (let i = 1; i <= n; i++) { const k = i / n, x = p.x + (T.x - p.x) * k, y = p.y + (T.y - p.y) * k; ctx.globalAlpha = 0.25 + 0.4 * ((t * 2 + k) % 1); ctx.beginPath(); ctx.arc(sx(x), sy(y), (i === n ? 5 : 2.5) * S, 0, TAU); ctx.fill(); } }
    for (const m of d.wombs || []) { ctx.fillStyle = col(F10_COL.soul); ctx.strokeStyle = col(F10_COL.soul); ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.ellipse(sx(m.x), sy(m.y), 30 * S, 22 * S, Math.atan2(m.vy, m.vx), 0, TAU); ctx.fill(); ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.stroke(); }
    for (const c of d.candles || []) { const x = sx(c.x), y = sy(c.y); ctx.fillStyle = col('#f3ead2'); ctx.globalAlpha = 0.95; ctx.fillRect(x - 2.5 * S, y - 14 * S, 5 * S, 14 * S); ctx.fillStyle = col(F10_COL.fire); ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 18); ctx.beginPath(); ctx.ellipse(x, y - 18 * S, 3 * S, 5 * S, 0, 0, TAU); ctx.fill(); }
    if (d.strings && d.strings.length) { ctx.strokeStyle = col(F10_COL.mucus); ctx.lineWidth = 2; ctx.globalAlpha = 0.6; for (const s of d.strings) { ctx.beginPath(); ctx.moveTo(sx(s.a.x), sy(s.a.y)); ctx.lineTo(sx(s.b.x), sy(s.b.y)); ctx.stroke(); } }
    if (d.space) { ctx.strokeStyle = col(F10_COL.force); ctx.globalAlpha = 0.45; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx(d.space.x), sy(d.space.y), d.space.r * S, 0, TAU); ctx.stroke(); }
    ctx.restore();
  };
  // X7: the copies count towards the 8-pet cap.
  if (typeof sigPetCount === 'function') {
    const _pets = sigPetCount;
    sigPetCount = function () { return _pets() + ((G && G.f10 && G.f10.copies) || []).length; };
  }
  // THIS WAY: autorun follows the trail.
  if (typeof arGoal === 'function') {
    const _goal = arGoal;
    arGoal = function (p, mode, goal, add) { const r = _goal(p, mode, goal, add); const T = G && G.f10 && G.f10.trail; if (T) goal(T.x, T.y, 2.5); return r; };
  }
  // X1: the swelling shows on the body (one size step per recent hit), not on a meter.
  if (typeof sampleLook === 'function') {
    const _look = sampleLook;
    sampleLook = function (x, y, face, tag, alpha, scale, body, look) {
      const d = G && G.f10, n = body && G && body === G.player && d && d.babyHits && f10Own('x1_baby') ? d.babyHits.filter(t => G.t - t < 3).length : 0;
      return _look(x, y, face, tag, alpha, n ? (scale || 1) * (1 + 0.08 * n) : scale, body, look);
    };
  }
})();
