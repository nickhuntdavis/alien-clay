'use strict';
// Spawn Prawn - weapon upgrade branches, batch 6 (spec: redesign docs/WEAPON_UPGRADES.md sections 12, 14, 15 and 16).
// Peekaboo (s_peekaboo), Eggs (s_toothfairy), Chest Burster (s_parasite) and The Runs (s_wake): each has three promises
// (Lv 3), two in-promise cards plus a wildcard per promise (Lv 6) and three masteries (Lv 10), registered with wupReg
// (weapons24.js). Cards add behaviour through wupOn (via w6On, which keeps an exception out of the frame loop: errors go to
// W6_ERR) and read the slot's own state in w.w6. Everything is inside one function so names can't clash with other batches.
// Rules every card follows (COMBAT_MATRIX 11.3, 11.5, 12.1 to 12.6):
//  - extra hits a card makes are marked src.wupEcho so they never fire the hit hooks again;
//  - a collision hit is 40% of the weapon's hit size; every chain or repeat has a fixed depth; every list is capped.
// Peekaboo and Eggs are toy weapons (toys.js): fireWeapon sends them to toyFire before the 'fire' hook is reached, so this
// file wraps the toy functions it needs (peekSpot, toySteer, toyAim, toothFire, toothTaken, toothLure). Also wrapped:
// hurtPlayer (Peekaboo B shield, Eggs B no-attack and Egg on Your Face), killEnemy (Chest Burster deaths), sigwTick (its
// undead are managed here once a card is taken), wupDmgMul (Sneak Attack) and v10Draw (outlines, glows, worms). No shared
// file is edited.
// Simplifications are noted at each card (search "simplified").
(function () {
  const TWO = Math.PI * 2;
  globalThis.W6_ERR = [];
  const W6_ERR = globalThis.W6_ERR;
  const w6S = w => w.w6 || (w.w6 = { c: {} });
  globalThis.w6S = w6S;
  const bump = (w, k) => { const c = w6S(w).c; c[k] = (c[k] || 0) + 1; };
  const live = e => !!e && !e.dead && !e.phased && !e.egg;
  const foe = e => live(e) && !e.charmed;
  const small = e => !e.boss && !e.rival && !e.bossDef && !e.final;
  const held = w => !!(G && G.weapons && G.weapons.includes(w));
  const mine = key => (G && G.weapons ? G.weapons.filter(w => w && w24Key(w) === key && w.w6 && w.w6.inst) : []);
  function w6On(w, kind, fn) {
    wupOn(w, kind, function () {
      try { return fn.apply(null, arguments); } catch (err) { if (W6_ERR.length < 20) W6_ERR.push(kind + ': ' + err.message + ' ' + String(err.stack).split('\n')[1]); return kind === 'dmg' ? 1 : undefined; }
    });
  }
  function safe(fn) { try { return fn(); } catch (err) { if (W6_ERR.length < 20) W6_ERR.push('wrap: ' + err.message + ' ' + String(err.stack).split('\n')[1]); } }
  const src6 = (w, extra) => Object.assign(weaponSrc(w), { wupEcho: true, noProc: true, knock: 0 }, extra || {});
  const hit6 = (e, dmg, w, extra) => (live(e) ? damageEnemy(e, dmg, src6(w, extra)) : 0);
  // A small blast: one hit on everything in r (bursts always land). onHit(e) runs for each enemy that took it.
  function blast6(w, x, y, r, dmg, extra, color, onHit, skip) {
    const src = src6(w, Object.assign({ atk: 'burst', noCrit: true }, extra || {})), got = [];
    const was = IN_AOE; IN_AOE = true;
    try { forNear(x, y, r, e => { if (e !== skip && foe(e)) { got.push(e); damageEnemy(e, dmg, src); } }); } finally { IN_AOE = was; }
    ring(x, y, r, color || w.def.color, 0.35, 4); fxParts('spark', x, y, color || w.def.color, 7, r * 3, 0.35, 2.5);
    if (onHit) for (const e of got) onHit(e);
    return got;
  }
  // Add to a build-up bar as if frac of it had been filled; returns the payoff that fired (or null).
  function bar6(e, k, frac, w) {
    if (!live(e)) return null;
    const cd = fightCd(e); cd.barQuietT[k] = 0; cd.bars[k] += frac;
    if (cd.bars[k] < 1) return null;
    cd.bars[k] = 0;
    const p = BAR_PAYOFF[k];
    fightPayoff(e, p, { raw: cd.maxHp * 0.02 }, src6(w));
    return p;
  }
  const near6 = (x, y, R, pred) => { let b = null, bd = R * R; for (const e of G.enemies) { if (!foe(e) || (pred && !pred(e))) continue; const d2 = (e.x - x) ** 2 + (e.y - y) ** 2; if (d2 < bd) { bd = d2; b = e; } } return b; };
  const count6 = (x, y, R) => { let n = 0; for (const e of G.enemies) if (foe(e) && (e.x - x) ** 2 + (e.y - y) ** 2 < (R + e.r) ** 2) n++; return n; };
  const walled = (x, y) => !!(G.lvl && lvSolidAt(x, y));
  const heading = p => { const v = Math.hypot(p.vx || 0, p.vy || 0); if (v > 5) return { x: p.vx / v, y: p.vy / v, v }; const a = p.hd != null ? p.hd : (p.face || 0); return { x: Math.cos(a), y: Math.sin(a), v }; };
  const throttle = {};
  function say(key, x, y, txt, color, size, gap) {
    if ((throttle[key] || 0) > G.realT) return;
    throttle[key] = G.realT + (gap || 0.3); floatText(x, y, txt, color, size || 12, 0.6);
  }
  const CARD = (name, desc, apply) => ({ name, desc, apply });
  const INST = {};
  const SET = flag => w => { const st = w6S(w); st[flag] = 1; INST[w24Key(w)](w); };
  const PRO = k => w => { const st = w6S(w); st.p = k; INST[w24Key(w)](w); };

  // ================================================================ Peekaboo (Alien, Burst, Fear)
  function pkInstall(w) {
    const st = w6S(w); if (st.inst) return; st.inst = 1;
    w6On(w, 'stats', (w, s) => {
      const t = w6S(w);
      if (t.p === 'C') s.dur = Math.min(s.dur, 1.2);          // Costs C: a shorter hide
      if (t.perm) { s.cd *= 0.5; s.area = Math.max(s.area, 760); } // Object Permanence: twice as often, the whole screen
      if (t.nysm) { s.dur = 3; s.cd = 4; }                      // Now You See Me: hidden 3 s out of every 4
    });
    w6On(w, 'dmg', (w, e, src) => {
      const t = w6S(w);
      if (src.wname === 'BOO!') return t.p === 'A' ? 0.7 : t.p === 'B' ? 0.6 : 1; // Costs A and B: a weaker BOO
      return 1;
    });
    w6On(w, 'hit', (w, e, res, src) => {
      const t = w6S(w);
      if (src.wname !== 'BOO!') return;
      bump(w, 'boo');
      if (t.p === 'C' && Math.hypot(e.x - G.player.x, e.y - G.player.y) < 150) e.w6boo = G.t; // Boo!: Fear lasts 3 s (applied in the tick: the Fear lands just after the hit)
      if (t.hyst && !e.boss) { // Mass Hysteria: the BOO fills the Alien bar of up to 5 enemies
        if (t.hystK !== G.peek) { t.hystK = G.peek; t.hystN = 0; }
        if ((t.hystN || 0) < 5) { t.hystN++; bar6(e, 'soul', 1.05, w); bump(w, 'hyst'); }
      }
    });
    w6On(w, 'tick', (w, dt) => pkTick(w, dt));
  }
  INST.s_peekaboo = pkInstall;
  function pkTick(w, dt) {
    const st = w6S(w), p = G.player, k = G.peek, T = TOYS();
    if (k && k.w === w) {
      if (k !== st.k) { st.k = k; pkHide(w, k); }
      if (k.boo && k !== st.booK) { st.booK = k; pkBoo(w, k); }
    }
    // A: the false position pops when it is crowded (3 enemies) or when you reappear (1 or more).
    const b = st.bait;
    if (b && !b.popped) {
      const n = count6(b.x, b.y, 90);
      if (n >= 3 || (G.t >= b.end && n >= 1)) {
        b.popped = true;
        const R = 90 + (st.grow ? Math.min(130, 14 * n) : 0);
        blast6(w, b.x, b.y, R, w.s.dmg, { wname: 'Peek-a-Boom' }, w.def.color);
        floatText(b.x, b.y - 24, 'BOOM', w.def.color, 14, 0.6); bump(w, 'pop'); if (st.grow) st.lastR = R;
      } else if (G.t >= b.end) st.bait = null;
    }
    if (st.p === 'C') for (const e of G.enemies) if (e.w6boo && G.t - e.w6boo < 0.2 && e.fearT > G.t && e.w6f3 !== e.w6boo) { e.w6f3 = e.w6boo; e.fearT = Math.max(e.fearT, e.w6boo + 3); bump(w, 'fear3'); }
    // B: shots aimed at you while hidden pass through the old position (the hurtPlayer wrapper); lingering confusion needs nothing here.
    // C: Fear spreads and feared enemies collide.
    if ((st.pass || st.stamp) && G.enemies.length > 1) {
      const L = []; for (const e of G.enemies) if (foe(e) && small(e) && e.fearT > G.t) { L.push(e); if (L.length >= 40) break; }
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
        const a = L[i], c = L[j];
        if ((a.x - c.x) ** 2 + (a.y - c.y) ** 2 > (a.r + c.r + 2) ** 2 || (a.w6colT > G.t && c.w6colT > G.t)) continue;
        a.w6colT = c.w6colT = G.t + 1.2;
        if (st.stamp) {
          hit6(a, w.s.dmg * 0.4, w, { atk: 'burst', wname: 'Stampede' }); hit6(c, w.s.dmg * 0.4, w, { atk: 'burst', wname: 'Stampede' });
          for (const o of [a, c]) { if (typeof o.shootCd === 'number') o.shootCd = Math.max(o.shootCd, 2); o.aimT = 0; }
          ring((a.x + c.x) / 2, (a.y + c.y) / 2, 14, w.def.color, 0.25, 3); bump(w, 'stampede');
        }
      }
      if (st.pass) for (const a of L) {
        if (a.w6sp) continue;
        for (const o of G.enemies) {
          if (o === a || !foe(o) || !small(o) || o.fearT > G.t || (a.x - o.x) ** 2 + (a.y - o.y) ** 2 > (a.r + o.r + 3) ** 2) continue;
          a.w6sp = 1; o.fearT = G.t + 2; bolt(a.x, a.y, o.x, o.y, w.def.color, 0.2); say('pk-pass', o.x, o.y - o.r - 8, 'PANIC', w.def.color, 11); bump(w, 'spread'); break;
        }
      }
    }
    // Sneak Attack and Silent Running shows
    if (st.run && peekHidden() && G.peek.w === w) { st.rs = (st.rs || 0) - dt; if (st.rs <= 0) { st.rs = 0.2; spawnPart(p.x, p.y, w.def.color, 1, 30, 0.3, 3); } }
  }
  function pkHide(w, k) {
    const st = w6S(w), p = G.player;
    bump(w, 'hide');
    if (st.rattle) { // Rattle (simplified): the rattle is flung 230 away from where you vanished, and the false position moves to it
      const h = heading(p), a = h.v > 5 ? Math.atan2(h.y, h.x) : Math.random() * TWO;
      let rx = k.x + Math.cos(a) * 230, ry = k.y + Math.sin(a) * 230;
      if (walled(rx, ry)) { rx = k.x; ry = k.y; }
      k.x = rx; k.y = ry; st.rat = { x: rx, y: ry, end: k.t }; bump(w, 'rattle');
      floatText(rx, ry - 18, 'RATTLE', w.def.color, 12, 0.7);
    }
    if (st.p === 'A') st.bait = { x: k.x, y: k.y, end: k.t, popped: false };
    if (st.mirror) {
      const a = Math.random() * TWO; let mx = k.x + Math.cos(a) * 260, my = k.y + Math.sin(a) * 260;
      if (walled(mx, my)) { mx = k.x - Math.cos(a) * 260; my = k.y - Math.sin(a) * 260; }
      st.mir = { x: mx, y: my, k }; bump(w, 'mirror');
    }
    if (st.run) w.perks[5] = 'hideandseek'; // the game's own +40% swim speed while hidden (game.js)
  }
  function pkBoo(w, k) {
    const st = w6S(w), p = G.player, T = TOYS();
    if (st.p === 'B') st.conf = { x: k.x, y: k.y, until: G.t + 1 };
    if (st.second && st.bait) { T.doll = { x: st.bait.x, y: st.bait.y, end: G.t + 4, w }; bump(w, 'second'); floatText(st.bait.x, st.bait.y - 20, 'ENCORE', w.def.color, 12, 0.7); }
    st.mir = null;
    if (st.cuckoo) {
      const t = near6(p.x, p.y, 420, e => small(e));
      if (t && !walled(t.x, t.y)) {
        const ox = p.x, oy = p.y; ring(ox, oy, 26, w.def.color, 0.4, 4); ring(t.x, t.y, 26, w.def.color, 0.4, 4);
        p.x = t.x; p.y = t.y; t.x = ox; t.y = oy; floatText(p.x, p.y - 30, 'CUCKOO', w.def.color, 14, 0.8); bump(w, 'cuckoo');
      }
    }
  }
  // The second false position (Mirror, Mirror): half the enemies swarm it.
  function pkMirror() { for (const w of mine('s_peekaboo')) { const t = w.w6; if (t.mirror && t.mir && G.peek === t.mir.k && G.peek.t > G.t) return t.mir; } return null; }
  function pkPatch() {
    const ps = peekSpot;
    peekSpot = function () { // Boo!/You Can't See Me: enemies keep searching the old spot for 1 s after you reappear
      const r = ps();
      if (r) return r;
      for (const w of mine('s_peekaboo')) { const c = w.w6.conf; if (c && c.until > G.t) return c; }
      return null;
    };
    const ts = toySteer;
    toySteer = function (e) {
      const r = ts(e);
      if (r && !e.boss && !(e.fearT > G.t) && !(e.inkT > G.t)) {
        const m = pkMirror();
        if (m && !toothLure(e)) {
          if (!e.w6m) e.w6m = Math.random() < 0.5 ? 1 : 2;
          if (e.w6m === 2) { const dx = m.x - e.x, dy = m.y - e.y, d = Math.hypot(dx, dy) || 1; return d < 20 ? { x: 0, y: 0 } : { x: dx / d, y: dy / d }; }
        }
      }
      return r;
    };
    const ta = toyAim;
    toyAim = function (e) {
      const a = ta(e);
      if (a != null && e.w6m === 2) { const m = pkMirror(); if (m) return Math.atan2(m.y - e.y, m.x - e.x); }
      return a;
    };
  }
  pkPatch();

  wupReg('s_peekaboo', {
    A: { name: 'Peek-a-Boom', tag: 'Punish the bait', costs: 'the BOO itself is 30% weaker.', shows: 'a faint sperm-shaped outline that pops when crowded.', modes: 'KITE leaves the bait far behind.',
      lv3: { desc: 'Your false position explodes in an Alien burst (radius 90) when 3 enemies crowd it, or when you reappear.', apply: PRO('A') },
      lv6: [CARD('Standing Room Only', 'The false position\'s burst grows with the number of enemies that reached it (+14 radius each, up to 220).', SET('grow')),
        CARD('Encore', 'The false position stays for 4 s after you reappear and goes off a second time.', SET('second'))],
      wild: CARD('Rattle', 'While hidden, a baby rattle is flung 230 units away and enemies swarm it instead of the empty spot.', SET('rattle')) },
    B: { name: 'You Can\'t See Me', tag: 'Stay gone', costs: 'the BOO is 40% weaker.', shows: 'shots passing through a ghost outline, enemies milling about.', modes: 'COLLECT uses the hidden time to sweep gems.',
      lv3: { desc: 'Enemies searching the decoy stay confused 1 s longer; enemy shots aimed at you while hidden pass harmlessly through.', apply: PRO('B') },
      lv6: [CARD('Silent Running', 'While hidden, you swim 40% faster.', SET('run')),
        CARD('Sneak Attack', 'While hidden, your other weapons keep firing from where you really are, and hit 30% harder.', SET('sneak'))],
      wild: CARD('Mirror, Mirror', 'Two false positions instead of one; enemies split between them.', SET('mirror')) },
    C: { name: 'Boo!', tag: 'Make them panic', costs: 'a shorter hide (1.2 s).', shows: 'enemies scattering and bumping into each other.', modes: 'HUNT reappears in the thick of it.',
      lv3: { desc: 'The BOO\'s Fear lasts 3 s (from 2) on enemies within 150 of you when you reappear.', apply: PRO('C') },
      lv6: [CARD('Pass It On', 'A fleeing enemy that bumps into another spreads Fear to it (once per enemy).', SET('pass')),
        CARD('Stampede', 'Feared enemies that run into each other collide for a hit and drop their next attack.', SET('stamp'))],
      wild: CARD('Cuckoo', 'When you reappear, you swap places with the nearest enemy.', SET('cuckoo')) },
    lv10: [
      { name: 'Object Permanence', best: 'BC', desc: 'You vanish twice as often, and the BOO reaches the whole screen.', apply: SET('perm') },
      { name: 'Mass Hysteria', best: 'C', desc: 'The BOO also fills the Alien bar of up to 5 enemies at once, so they are Possessed.', apply: SET('hyst') },
      { name: 'Now You See Me', best: 'AB', desc: 'You are hidden 3 s out of every 4; every reappearance is a BOO.', apply: SET('nysm') }] });

  // ================================================================ Eggs (Alien, Burst, lures)
  const egCap = w => { const st = w6S(w); return st.clutch ? 12 : st.big ? 6 : 3; };
  const egOwn = w => { let n = 0; for (const q of TOYS().teeth) if (q.w === w && !q.dead) n++; return n; };
  function egSmiteMul(w, g) { // the smite's size relative to base (Costs, and C's charge)
    const st = w6S(w); let m = 1;
    if (st.p === 'C' && g) m *= 1 + Math.min(1.5, 0.25 * g.age);
    return m;
  }
  function egInstall(w) {
    const st = w6S(w); if (st.inst) return; st.inst = 1; st.eggs = [];
    w6On(w, 'stats', (w, s) => {
      const t = w6S(w);
      if (t.p === 'A') s.dmg *= 0.75;                 // Costs A: each smite 25% weaker
      if (t.p === 'B') { s.dmg *= 0.8; s.lure *= 2; } // Costs B: 20% weaker; lure from twice as far
      if (t.p === 'C') { s.cd /= 0.6; s.dur = Math.max(s.dur, 7); } // Costs C: dropped 40% less often (simplified: eggs last 7 s so they can reach full charge at 6 s)
      if (t.glow) s.dur = Math.max(s.dur, 9);         // Warm Glow: a charged egg waits up to 3 s to be eaten (a 1 s window was too narrow)
      if (t.clutch) { s.count += 1; s.dur = Math.max(s.dur, 8); } // Clutch: two eggs a drop that last 8 s, so 12 on the ground is reachable (one a drop tops out near 6)
    });
    w6On(w, 'dmg', (w, e, src) => {
      const t = w6S(w);
      if (src.wname !== 'Tooth Fairy') return 1;
      let m = 1;
      if (e.w6egg && e.w6egg.pending) m *= egSmiteMul(w, e.w6egg);
      if (t.fee && e.boss) m *= 3;                    // Possession Fee: bosses take x3 instead
      return m;
    });
    w6On(w, 'hit', (w, e, res, src) => {
      const t = w6S(w), g = e.w6egg;
      if (src.wname !== 'Tooth Fairy' || !g || !g.pending) return;
      g.pending = false; bump(w, 'smite');
      const base = w.s.dmg * Math.min(5, e.teeth || 1) * (g.gold ? 1.5 : 1) * egSmiteMul(w, g);
      if (t.p === 'A' && egOwn(w) < egCap(w)) { egPlace(w, e.x + rand(-34, 34), e.y + rand(-34, 34), {}); floatText(e.x, e.y - e.r - 14, 'EGG', w.def.color, 12, 0.6); bump(w, 'laid'); }
      if (t.glow && g.age >= 6) { blast6(w, e.x, e.y, 100, base * 0.6, { wname: 'Warm Glow' }, w.def.color, null, e); bump(w, 'glow'); }
      if (t.goose) { blast6(w, e.x, e.y, 160, base, { wname: 'Golden Goose' }, '#ffd23f', null, e); bump(w, 'goose'); }
      if (t.fee && !e.boss && bar6(e, 'soul', 1.05, w)) bump(w, 'fee');
    });
    w6On(w, 'tick', (w, dt) => egTick(w, dt));
  }
  INST.s_toothfairy = egInstall;
  // An egg of ours on the ground (respecting the cap and the 30-egg ceiling).
  function egPlace(w, x, y, o) {
    const T = TOYS(), st = w6S(w);
    if (egOwn(w) >= egCap(w) || T.teeth.length >= 30 || walled(x, y)) return null;
    const t = { x, y, w, gold: !!o.gold, end: G.t + (o.life || w.s.dur), born: G.t, bite: 0 };
    if (o.all) t.w6all = 1;
    T.teeth.push(t); st.eggs.push(t); if (st.eggs.length > 40) st.eggs.shift();
    return t;
  }
  function egHatch(w) { // Broody: this egg is kept back and hatches a smite on a random elite (else the toughest enemy)
    const L = G.enemies.filter(e => foe(e) && (e.elite || e.boss)), pool = L.length ? L : G.enemies.filter(e => foe(e) && !e.boss);
    if (!pool.length) return;
    let e = pool[Math.floor(Math.random() * pool.length)];
    if (!L.length) for (const o of pool) if (o.maxHp > e.maxHp) e = o;
    const dmg = w.s.dmg * 3;
    G.fx.push({ type: 'star', x: e.x, y: e.y - e.r - 10, r: 14, color: w.def.color, life: 0.4, max: 0.4 });
    G.fx.push({ type: 'fall', x: e.x, y: e.y, r: e.r + 16, color: w.def.color, life: 0.25, max: 0.25 });
    after(0.5, () => { if (G && held(w) && live(e)) { hit6(e, dmg, w, { atk: 'burst', wname: 'Hatched' }); floatText(e.x, e.y - e.r - 12, 'HATCHED', w.def.color, 13, 0.7); bump(w, 'hatch'); } });
  }
  function egFire(w, target) {
    const s = w.s, p = G.player, st = w6S(w), T = TOYS();
    const order = st.easter ? G.enemies.filter(e => foe(e) && !e.boss).sort((a, b) => ((a.x - p.x) ** 2 + (a.y - p.y) ** 2) - ((b.x - p.x) ** 2 + (b.y - p.y) ** 2)) : null;
    for (let i = 0; i < s.count; i++) {
      st.n = (st.n || 0) + 1;
      if (st.broody && st.n % 3 === 0) { egHatch(w); continue; }
      if (egOwn(w) >= egCap(w) || T.teeth.length >= 30) break;
      let x, y; const o = {};
      if (st.gold && i === 0 && !T.teeth.some(q => q.w === w && q.gold && !q.dead)) { o.gold = true; o.all = true; o.life = 2; }
      if (st.easter && order && order.length) { // Easter Egg Hunt: the egg burrows and pops up under the nearest enemy
        const e = order[i % order.length]; ring(p.x, p.y, 16, w.def.color, 0.3, 3); fxParts('smoke', p.x, p.y, '#8a6a4a', 5, 60, 0.4, 3);
        after(0.5, () => { if (G && held(w) && egOwn(w) < egCap(w)) { const t = egPlace(w, e.x, e.y, o); if (t) { fxParts('smoke', e.x, e.y, '#8a6a4a', 7, 90, 0.4, 3); bump(w, 'burrow'); } } });
        continue;
      }
      if (st.clutch) { const a = Math.random() * TWO, d = 110 + Math.random() * 150; x = p.x + Math.cos(a) * d; y = p.y + Math.sin(a) * d; }
      else if (st.path) { const h = heading(p); x = p.x - h.x * 200 + rand(-40, 40); y = p.y - h.y * 200 + rand(-40, 40); }
      else { const k = 0.85 + rand(-0.1, 0.05); x = p.x + (target.x - p.x) * k + rand(-50, 50); y = p.y + (target.y - p.y) * k + rand(-50, 50); }
      egPlace(w, x, y, o);
    }
    sfx('gem');
  }
  function egTick(w, dt) {
    const st = w6S(w), p = G.player, T = TOYS();
    if (st.p === 'B') { // enemies chasing an egg stop attacking you
      for (const e of G.enemies) if (foe(e) && small(e) && toothLure(e)) { e.w6lure = G.t + 0.2; if (typeof e.shootCd === 'number' && e.shootCd < 0.5) e.shootCd = 0.5; }
    }
    for (let i = st.eggs.length - 1; i >= 0; i--) {
      const t = st.eggs[i];
      if (!t.dead) continue;
      if (st.timebomb && !t.w6taken && !t.w6done && t.end - t.born > 5.9 && G.t >= t.end - 0.05) { // an unclaimed, fully charged egg goes off
        t.w6done = 1; blast6(w, t.x, t.y, 160, w.s.dmg * 2.5, { wname: 'Time Bomb' }, w.def.color); bump(w, 'timebomb');
      }
      st.eggs.splice(i, 1);
    }
    // synchronised smite (Triple Yolk): 3 takes within 1 s
    if (st.triple && st.tk && st.tk.length >= 3) {
      const L = st.tk.slice(-3);
      if (L[2].t - L[0].t <= 1 && !(st.tripleT > G.t) && new Set(L.map(q => q.e)).size === 3) {
        st.tripleT = G.t + 2; st.tk.length = 0;
        const P = L.map(q => ({ x: q.e.x, y: q.e.y })), dmg = w.s.dmg * 1.5;
        for (const q of L) hit6(q.e, dmg, w, { atk: 'burst', wname: 'Triple Yolk' });
        const got = new Set(L.map(q => q.e));
        for (const e of G.enemies) if (foe(e) && !got.has(e) && inPoly(e.x, e.y, P)) hit6(e, dmg, w, { atk: 'burst', wname: 'Triple Yolk' });
        bolt(P[0].x, P[0].y, P[1].x, P[1].y, w.def.color, 0.4); bolt(P[1].x, P[1].y, P[2].x, P[2].y, w.def.color, 0.4); bolt(P[2].x, P[2].y, P[0].x, P[0].y, w.def.color, 0.4);
        floatText((P[0].x + P[1].x + P[2].x) / 3, (P[0].y + P[1].y + P[2].y) / 3, 'TRIPLE YOLK', w.def.color, 15, 0.9); bump(w, 'triple');
      }
    }
  }
  function egPatch() {
    const tf = toothFire;
    toothFire = function (w, target) { if (w && w.w6 && w.w6.inst) return egFire(w, target); return tf(w, target); };
    const tt = toothTaken;
    toothTaken = function (t, e) {
      const w = t.w, st = w && w.w6, on = !!(st && st.inst && w.s);
      if (on) {
        t.w6taken = 1; e.w6egg = { age: G.t - t.born, gold: t.gold, pending: true }; bump(w, 'take');
        (st.tk || (st.tk = [])).push({ e, t: G.t }); if (st.tk.length > 6) st.tk.shift();
      }
      tt(t, e);
    };
    const tl = toothLure;
    toothLure = function (e) {
      const r = tl(e);
      if (r) return r;
      const T = G && G.toy;
      if (T) for (const t of T.teeth) if (t.w6all && !t.dead && small(e) && t.w.w6 && t.w.w6.inst) return t;
      return null;
    };
  }
  egPatch();

  wupReg('s_toothfairy', {
    A: { name: 'Nest Egg', tag: 'Bait makes more bait', costs: 'each smite is 25% weaker.', shows: 'eggs rolling out of each smitten enemy.', modes: 'COLLECT and ORBIT keep you near the rolling eggs.',
      lv3: { desc: 'Every enemy smitten lays an egg of its own.', apply: PRO('A') },
      lv6: [CARD('Bigger Basket', 'Up to 6 eggs on the ground at once (from 3).', SET('big')),
        CARD('Triple Yolk', 'When 3 eggs are taken within 1 s, they smite all three takers and everything between them.', SET('triple'))],
      wild: CARD('Easter Egg Hunt', 'Eggs burrow and pop up under the nearest enemy instead of waiting.', SET('easter')) },
    B: { name: 'Egg On', tag: 'Steer the horde', costs: 'smites are 20% weaker.', shows: 'enemies peeling off the crowd and swimming for the glint.', modes: 'KITE drops eggs behind you; NEST draws enemies away from the egg.',
      lv3: { desc: 'Eggs lure from twice as far, and enemies chasing an egg stop attacking you.', apply: PRO('B') },
      lv6: [CARD('Egg Trail', 'Eggs land on your swim path, 200 units behind you.', SET('path')),
        CARD('Golden Opportunity', 'One golden egg at a time lures everything on screen (bosses excepted) for 2 s.', SET('gold'))],
      wild: CARD('Broody', 'Every 3rd egg is kept back and hatched, smiting a random elite.', SET('broody')) },
    C: { name: 'Don\'t Count Your Chickens', tag: 'Patience pays', costs: 'eggs are dropped 40% less often.', shows: 'eggs glowing brighter as they wait.', modes: 'HOLD and KITE give eggs time to charge.',
      lv3: { desc: 'An egg gains power while it waits: +25% smite damage per second, up to +150%.', apply: PRO('C') },
      lv6: [CARD('Warm Glow', 'Eggs last 9 s. A fully charged egg (6 s) glows, and its smite also hits everything within 100.', SET('glow')),
        CARD('Time Bomb', 'A fully charged egg that is never taken explodes when it expires, smiting everything within 160.', SET('timebomb'))],
      wild: CARD('Egg on Your Face', 'When you take damage, an egg drops at the feet of whatever hurt you.', SET('face')) },
    lv10: [
      { name: 'Golden Goose', best: 'AC', desc: 'Every smite hits everything within 160 of the victim at full damage.', apply: SET('goose') },
      { name: 'Clutch', best: 'AB', desc: 'Two eggs a drop, eggs last 8 s, up to 12 on the ground at once, scattered all round you.', apply: SET('clutch') },
      { name: 'Possession Fee', best: 'B', desc: 'Every smite Possesses the victim at once (bosses take x3 instead).', apply: SET('fee') }] });

  // ================================================================ Chest Burster (Alien, Projectile)
  const cbCap = w => { const st = w6S(w); return st.zombie ? 12 : st.p === 'A' ? 3 : 4; };
  function cbInstall(w) {
    const st = w6S(w); if (st.inst) return; st.inst = 1; st.cb = 1; st.und = []; st.worms = null;
    w6On(w, 'tick', (w, dt) => cbTick(w, dt));
  }
  INST.s_parasite = cbInstall;
  // Undead of ours: adopt new ones (before sigwTick would cap them), give them this weapon's life and damage.
  function cbAdopt(w) {
    const st = w6S(w);
    for (const t of G.turrets) {
      if (t.w !== w || t.w6) continue;
      t.w6 = { born: G.t, w, popped: false };
      t.src = Object.assign({}, t.src, { elem: w.def.elem });
      const life = st.p === 'A' ? 12 : st.p === 'B' ? 4 : 6;
      t.life = t.max = life; t.born = G.t;
      t.dmg *= st.p === 'A' ? 1.5 : st.p === 'B' ? 0.7 : st.p === 'C' ? 0.5 : 1;
      if (st.p === 'B') { t.src.parasite = true; t.src.w = w; } // Contagious Personality: what they bite catches the infection
      st.und.push(t); bump(w, 'rise');
    }
    st.und = st.und.filter(t => t.w6 && (st.p === 'C' ? !t.w6.popped : t.life > 0));
    const alive = st.und.filter(t => t.life > 0).sort((a, b) => (b.w6.keep != null ? 1e9 : b.born) - (a.w6.keep != null ? 1e9 : a.born)), cap = cbCap(w);
    for (let i = cap; i < alive.length; i++) alive[i].life = 0; // the oldest goes first
  }
  function cbPatch() {
    const sw = sigwTick;
    sigwTick = function (dt) {
      const hold = [];
      if (G && G.weapons && G.turrets) {
        safe(() => { for (const w of G.weapons) if (w && w.w6 && w.w6.cb && w.w6.inst) cbAdopt(w); });
        for (let i = G.turrets.length - 1; i >= 0; i--) if (G.turrets[i].w6) hold.push(G.turrets.splice(i, 1)[0]);
      }
      try { sw(dt); } finally { for (const t of hold) G.turrets.push(t); }
    };
    const ke = killEnemy;
    killEnemy = function (e, src) {
      const pw = e && !e.dead && e.parasiteT > 0 && e.parasiteW, wasInf = !!(pw && pw.w6 && pw.w6.cb && held(pw));
      const r = ke(e, src);
      if (wasInf && !e.w6died) { e.w6died = 1; safe(() => cbDied(pw, e)); }
      return r;
    };
  }
  cbPatch();
  const waveId = () => (G.wave ? G.wave.n : Math.floor(G.t / 60));
  function cbDied(w, e) {
    const st = w6S(w);
    bump(w, 'infdeath');
    if (st.worm != null) st.wormK = Math.min(2, (st.wormK || 0) + 0.1);
    if (st.keepelite && e.elite && !e.boss && st.keptWave !== waveId()) { // Adoption Papers: the first elite converted each wave stays for the whole wave
      cbAdopt(w);
      const t = G.turrets.find(q => q.w6 && q.w === w && Math.abs(q.x - e.x) < 2 && Math.abs(q.y - e.y) < 2);
      if (t) { st.keptWave = waveId(); t.w6.keep = waveId(); t.life = t.max = 90; bump(w, 'kept'); floatText(e.x, e.y - 30, 'ON THE PAYROLL', w.def.color, 13, 1); }
    }
    if (st.casket) { // Open Casket: the infection passes on to two neighbours
      let n = 0;
      for (const o of acquireMany('nearest', 160, e.x, e.y, 5)) { if (o === e || !foe(o) || o.boss || o.rival || o.parasiteT > 0 || n >= 2) continue; o.parasiteW = w; o.parasiteT = 6; n++; bolt(e.x, e.y, o.x, o.y, '#b5e48c', 0.25); }
      if (n) bump(w, 'casket');
    }
    if (st.adopt && e.elite && !e.boss && !e.rival && (st.adopted || 0) < 3) { // Adopted: the elite stays, as an ally
      st.adopted = (st.adopted || 0) + 1;
      const z = makeEnemy(e.def, e.x, e.y, { elite: true });
      z.charmed = true; z.charmT = 1e9; z.snatched = true; z.name = (e.name || 'Elite').replace(' (elite)', '') + ' (adopted)';
      G.enemies.push(z); bump(w, 'adopted');
      for (let i = G.turrets.length - 1; i >= 0; i--) { const t = G.turrets[i]; if (t.w6 && t.w === w && Math.abs(t.x - e.x) < 2 && Math.abs(t.y - e.y) < 2) { t.life = 0; t.w6.popped = true; break; } }
      floatText(e.x, e.y - 30, 'ADOPTED', w.def.color, 15, 1);
    }
  }
  function cbTick(w, dt) {
    const st = w6S(w), p = G.player, s = w.s;
    cbAdopt(w);
    const alive = st.und.filter(t => t.life > 0);
    // movement
    alive.forEach((t, i) => {
      if (t.w6.rush) { // Remote Detonation: rush the cluster and burst on arrival
        const r = t.w6.rush, dx = r.x - t.x, dy = r.y - t.y, d = Math.hypot(dx, dy) || 1;
        if (d < 34 || G.t > r.until) { t.life = 0; return; }
        t.x += dx / d * Math.min(d, 420 * dt); t.y += dy / d * Math.min(d, 420 * dt); return;
      }
      if (t.w6.keep != null && t.w6.keep !== false) { if (waveId() !== t.w6.keep) { t.life = 0; return; } t.life = Math.max(t.life, 2); }
      if (st.fetch && count6(t.x, t.y, 220) === 0) { // Doggy Bag: no fight on, so fetch a gem
        let g = null, bd = 380 * 380; for (const q of G.gems) { if (q.dead || q.mag) continue; const d2 = (q.x - t.x) ** 2 + (q.y - t.y) ** 2; if (d2 < bd) { bd = d2; g = q; } }
        if (g) { const dx = g.x - t.x, dy = g.y - t.y, d = Math.hypot(dx, dy) || 1; if (d < 24) { g.mag = true; bump(w, 'fetch'); ring(g.x, g.y, 14, w.def.color, 0.3, 3); } else { t.x += dx / d * 200 * dt; t.y += dy / d * 200 * dt; } return; }
      }
      if (st.hook) { // Hookworm: latch on and ride it until it dies
        if (!t.w6.host || !live(t.w6.host)) { t.w6.host = null; const h = near6(t.x, t.y, 320, e => small(e)); if (h) { t.w6.host = h; t.rate = Math.min(t.rate, 0.2); bump(w, 'latch'); } }
        if (t.w6.host) { t.x = t.w6.host.x + Math.cos(i * 2.1) * 6; t.y = t.w6.host.y + Math.sin(i * 2.1) * 6; t.life = Math.max(t.life, 0.6); t.w6.hosted = (t.w6.hosted || 0) + dt; if (t.w6.hosted > 14) t.life = 0; return; }
      }
      if (st.follow) { // The Staff: follow you and fight near you
        const a = G.realT * 0.9 + i * TWO / Math.max(1, alive.length), tx = p.x + Math.cos(a) * 70, ty = p.y + Math.sin(a) * 70, dx = tx - t.x, dy = ty - t.y, d = Math.hypot(dx, dy);
        if (d > 6) { t.x += dx / d * Math.min(d, 190 * dt); t.y += dy / d * Math.min(d, 190 * dt); }
      } else if (st.p === 'C') { // shamble into the crowd
        const c = cbDense(t.x, t.y, 520);
        if (c) { const dx = c.x - t.x, dy = c.y - t.y, d = Math.hypot(dx, dy) || 1; if (d > 20) { t.x += dx / d * 95 * dt; t.y += dy / d * 95 * dt; } }
      }
    });
    // bursts (Dead Useful)
    if (st.p === 'C') {
      for (const t of st.und) {
        if (t.life > 0 || t.w6.popped) continue;
        t.w6.popped = true; bump(w, 'pop');
        blast6(w, t.x, t.y, 70, s.dmg * 2.5, { wname: 'Dead Useful' }, w.def.color, st.soulbar ? e => { bar6(e, 'soul', 0.35, w); } : null);
        if (st.soulbar) bump(w, 'soulbar');
        floatText(t.x, t.y - 14, 'POP', w.def.color, 12, 0.5);
      }
      // Remote Detonation: every 8 s all undead rush the densest cluster
      if (st.rush) {
        st.rushT = (st.rushT == null ? 8 : st.rushT) - dt;
        if (st.rushT <= 0 && alive.length) {
          const c = cbDense(p.x, p.y, 700);
          if (c) { st.rushT = 8; for (const t of alive) t.w6.rush = { x: c.x, y: c.y, until: G.t + 2.2 }; ring(c.x, c.y, 50, w.def.color, 0.5, 4); floatText(c.x, c.y - 30, 'DETONATE', w.def.color, 14, 0.8); bump(w, 'rush'); }
          else st.rushT = 1;
        }
      }
    }
    // Contagious Personality: keep infection alive when asked (Chronic Condition)
    if (st.chronic) for (const e of G.enemies) if (e.parasiteW === w && e.parasiteT > 0 && e.parasiteT < 4) { e.parasiteT = 6; st.c.keep = 1; }
    // Gut Feeling: infected enemies flash red just before they attack
    if (st.gut) {
      for (const e of G.enemies) {
        if (!foe(e) || !(e.parasiteT > 0) || e.parasiteW !== w || (e.w6gutT || 0) > G.t) continue;
        const soon = (typeof e.shootCd === 'number' && e.shootCd > 0 && e.shootCd < 0.35) || e.aimT > 0 || Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r + 24;
        if (soon) { e.w6gutT = G.t + 0.7; ring(e.x, e.y, e.r + 6, '#ff3b30', 0.3, 3); floatText(e.x, e.y - e.r - 10, '!', '#ff3b30', 14, 0.4); bump(w, 'gut'); }
      }
    }
    // Mother of Worms: three tapeworms coil round you and bite what comes close
    if (st.worm != null) {
      if (!st.worms) st.worms = [0, 1, 2].map(i => ({ a: i * TWO / 3, cd: 0.3 * i, seg: [] }));
      for (const m of st.worms) {
        m.a += dt * 2.2; m.cd -= dt;
        const hx = p.x + Math.cos(m.a) * 38, hy = p.y + Math.sin(m.a) * 38;
        m.seg.unshift({ x: hx, y: hy }); if (m.seg.length > 9) m.seg.pop();
        if (m.cd <= 0) {
          const t = near6(p.x, p.y, 90);
          if (t) { m.cd = 0.45; hit6(t, s.dmg * 1.2 * (1 + (st.wormK || 0)), w, { wname: 'Tapeworm', atk: 'contact' }); m.seg[0] = { x: t.x, y: t.y }; bump(w, 'bite'); }
          else m.cd = 0.1;
        }
      }
    }
  }
  function cbDense(x, y, R) {
    let best = null, bn = 0;
    for (const e of G.enemies) {
      if (!foe(e) || (e.x - x) ** 2 + (e.y - y) ** 2 > R * R) continue;
      const n = count6(e.x, e.y, 100);
      if (n > bn) { bn = n; best = e; }
    }
    return best;
  }

  wupReg('s_parasite', {
    A: { name: 'The Family Business', tag: 'A durable army', costs: 'at most 3 undead (from 4).', shows: 'a little worm-ridden escort swimming with you.', modes: 'KITE keeps them between you and the crowd.',
      lv3: { desc: 'Undead last 12 s (from 6) and deal +50%.', apply: PRO('A') },
      lv6: [CARD('The Staff', 'Undead follow you and fight near you, instead of where they died.', SET('follow')),
        CARD('Adoption Papers', 'The first elite you convert each wave stays for the whole wave (counts towards the cap).', SET('keepelite'))],
      wild: CARD('Doggy Bag', 'Undead fetch gems back to you between fights.', SET('fetch')) },
    B: { name: 'Contagious Personality', tag: 'The army recruits', costs: 'undead last 4 s and deal 30% less.', shows: 'worm marks spreading enemy to enemy.', modes: 'ORBIT keeps the fight tightly packed for infection.',
      lv3: { desc: 'Undead infect the enemies they attack.', apply: PRO('B') },
      lv6: [CARD('Chronic Condition', 'Infection lasts until death (no timeout).', SET('chronic')),
        CARD('Open Casket', 'Any enemy that dies infected rises, whoever killed it, and passes the infection to two neighbours.', SET('casket'))],
      wild: CARD('Hookworm', 'Undead latch on to an enemy and ride it, biting, until it dies.', SET('hook')) },
    C: { name: 'Dead Useful', tag: 'An army of ammunition', costs: 'undead deal 50% less.', shows: 'undead shambling into crowds and popping.', modes: 'HUNT points them at a big target.',
      lv3: { desc: 'Undead shamble towards the crowd and burst in an Alien burst (radius 70) when they expire or are culled.', apply: PRO('C') },
      lv6: [CARD('Soul Searching', 'The burst adds Alien build-up to everything it hits.', SET('soulbar')),
        CARD('Remote Detonation', 'Every 8 s all undead rush the densest cluster and burst on arrival.', SET('rush'))],
      wild: CARD('Gut Feeling', 'Infected enemies flash red just before they attack.', SET('gut')) },
    lv10: [
      { name: 'Zombie Apocalypse', best: 'B', desc: 'This weapon\'s undead cap rises from 4 to 12 (overrides the pets cap).', apply: SET('zombie') },
      { name: 'Adopted', best: 'A', desc: 'Elites killed while infected become permanent allies (3 at most).', apply: SET('adopt') },
      { name: 'Mother of Worms', best: 'AC', desc: 'Three tapeworms coil round you and bite what comes close; every infected death adds +10% to their damage (up to +200%).', apply: w => { const st = w6S(w); st.worm = 0; INST[w24Key(w)](w); } }] });

  // ================================================================ The Runs (Fire, Pool, trail)
  function rnInstall(w) {
    const st = w6S(w); if (st.inst) return; st.inst = 1; st.path = []; st.waves = []; st.cells = new Map();
    w6On(w, 'stats', (w, s) => { const t = w6S(w); if (t.p === 'B') s.dmg *= 0.7; }); // Costs B: the trail burns 30% weaker
    w6On(w, 'dmg', (w, e, src) => {
      const t = w6S(w);
      if (t.habit && src.zoneHit && e.w6chase > G.t) { bump(w, 'habit'); return 1.5; } // Creature of Habit
      return 1;
    });
    w6On(w, 'tick', (w, dt) => rnTick(w, dt));
  }
  INST.s_wake = rnInstall;
  function rnNew(w, z) { // a trail piece the game just laid: shape it
    const st = w6S(w), p = G.player, h = heading(p), f = clamp(h.v / 190, 0, 1);
    z.w6 = { born: G.t, hx: h.x, hy: h.y, f };
    if (st.p === 'A') { z.dps *= 0.5 + 1.5 * f; z.r *= 1 + 0.3 * f; } // Can't Hold It: denser and hotter with speed, weak when slow
    if (st.p === 'C' && !st.scorch) { z.life = z.max = z.life * 3; z.dps0 = z.dps; z.ramp = 1; } // Leave a Little Behind: lasts 3x, builds up over 2 s
    if (st.scorch) { z.life = z.max = 20; }
    if (st.white && G.sprintT > G.t) { z.w6.white = 1; z.color = '#fffbe6'; bump(w, 'white'); } // Burning Rubber
    if (st.wrong) { z.x += h.x * 150; z.y += h.y * 150; }
    if (st.foot && f > 0.85 && G.zones.length < 255) { // Footloose: footprints either side, tripling the width
      for (const sg of [-1, 1]) {
        const q = Object.assign({}, z, { x: z.x - h.y * 26 * sg, y: z.y + h.x * 26 * sg, tick: Math.random() * 0.25, w6: { fp: 1, born: G.t, hx: h.x, hy: h.y } });
        if (!walled(q.x, q.y)) { G.zones.push(q); bump(w, 'foot'); }
      }
    }
    st.path.push(z); if (st.path.length > 260) st.path.shift();
    const key = Math.floor(z.x / 48) + ',' + Math.floor(z.y / 48);
    if (st.cells.size > 500) st.cells.clear();
    st.cells.set(key, (st.cells.get(key) || 0) + 1); z.w6.key = key;
  }
  // The Runs switched to Static (fitcheck.js lets Switched at Birth pick it): the trail's Fire bar becomes a visible
  // zap: a bolt from the trail to the enemy, Static damage, and a full hit jolts it (a stagger). Fire stays as it was.
  const rnStatic = w => w.def.elem === 'shock';
  function rnBar(w, e, frac, from) {
    if (!rnStatic(w)) return bar6(e, 'fire', frac, w);
    if (!live(e)) return null;
    if (from && (e.w6bolt || 0) <= G.t) { e.w6bolt = G.t + 0.25; bolt(from.x, from.y, e.x, e.y, '#bfe9ff', 0.18); }
    hit6(e, w.s.dmg * (1 + 2 * frac), w, { elem: 'shock', wname: 'The Runs (zap)' });
    if (frac >= 1 && live(e)) { fightPayoff(e, 'stagger', { raw: 0 }, src6(w)); fxParts('spark', e.x, e.y, '#e8f7ff', 6, 120, 0.3, 2); return 'jolt'; }
    return null;
  }
  function rnTick(w, dt) {
    const st = w6S(w), p = G.player;
    // new pieces
    for (const z of G.zones) if (z.trail && !z.w6 && z.src && z.src.w === w) rnNew(w, z);
    st.path = st.path.filter(z => z.life > 0);
    if (st.scorch) { let over = st.path.length - 80; for (const z of st.path) { if (over <= 0) break; if (z.life > 0.002) { z.life = 0.001; over--; } } } // Scorched Route: their own cap of 80
    // heat: build-up (C) and embers
    for (const z of st.path) {
      const g = z.w6; if (!g) continue;
      if (z.ramp) z.dps = z.dps0 * clamp(0.12 + 0.88 * ((G.t - g.born) / 2), 0.12, 1);
      if (st.ember && !g.ember && G.t - g.born >= 2 && (st.cells.get(g.key) || 0) >= 3) { g.ember = 1; z.life = Math.max(z.life, 10); z.max = Math.max(z.max, 10); z.color = '#ff9d2e'; bump(w, 'ember'); }
    }
    // throttled effects every 0.1 s
    st.fxT = (st.fxT || 0) - dt;
    if (st.fxT <= 0) {
      st.fxT = 0.1;
      for (const z of st.path) {
        const g = z.w6; if (!g) continue;
        if (g.white || st.after) { // Ignite at once (Burning Rubber once per enemy per 4 s, Afterburner per 3 s)
          const gap = st.after ? 3 : 4;
          forNear(z.x, z.y, z.r, e => { if (foe(e) && (e.w6ign || 0) <= G.t && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) { e.w6ign = G.t + gap; if (rnBar(w, e, 1.05, z)) bump(w, 'ignite'); } });
        }
        if (st.slip && G.t - g.born < 3) { // Slip Road: enemies crossing the trail skid forward along it
          forNear(z.x, z.y, z.r, e => {
            if (!foe(e) || e.boss || e.rival || (e.w6slip || 0) > G.t) return;
            e.w6slip = G.t + 0.4; e.kx += g.hx * 170; e.ky += g.hy * 170; bump(w, 'slip'); fxParts('spark', e.x, e.y, '#ffd8a8', 3, 90, 0.25, 2);
          });
        }
      }
      if (st.habit) for (const e of G.enemies) { // Creature of Habit: enemies following your path in the trail
        if (!foe(e)) continue;
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (e.w6d != null && d < e.w6d - 0.2) { for (const z of st.path) if (z.w6 && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) { e.w6chase = G.t + 0.4; break; } }
        e.w6d = d;
      }
    }
    // Breadcrumbs: gems you swim past follow the trail behind you
    if (st.crumbs) {
      for (const g of G.gems) {
        if (g.dead || g.mag) continue;
        const d = Math.hypot(g.x - p.x, g.y - p.y);
        if (!g.w6c && d < 90) { g.w6c = 1; bump(w, 'crumb'); }
        if (g.w6c && d > 14) { g.x += (p.x - g.x) / d * Math.min(d, 210 * dt); g.y += (p.y - g.y) / d * Math.min(d, 210 * dt); }
      }
    }
    // Backdraft: crossing your own trail
    if (st.p === 'B' || st.hot) {
      if (!(st.xT > G.t)) {
        for (let i = 0; i < st.path.length - 12; i++) {
          const z = st.path[i], g = z.w6; if (!g || g.fp) continue;
          if (Math.hypot(p.x - z.x, p.y - z.y) < 17 && G.t - g.born > 0.8) { st.xT = G.t + 1.5; rnCross(w, i); break; }
        }
      }
      rnWaves(w, dt);
    }
  }
  function rnCross(w, i) {
    const st = w6S(w), p = G.player, z = st.path[i], age = G.t - z.w6.born;
    bump(w, 'cross');
    if (st.p === 'B' && st.waves.length < 6) st.waves.push({ a: i, b: i, ra: i, rb: i, until: G.t + 1, id: (st.wid = (st.wid || 0) + 1), bursts: new Set() });
    if ((st.loop || st.hot) && age <= (st.hot ? 6 : 4)) { // closing a loop: everything inside
      const pts = st.path.slice(i).filter(q => q.w6 && !q.w6.fp).map(q => ({ x: q.x, y: q.y })); pts.push({ x: p.x, y: p.y });
      if (pts.length >= 6 && Math.abs(polyArea(pts)) > 6000) {
        let n = 0;
        const cx = pts.reduce((a, q) => a + q.x, 0) / pts.length, cy = pts.reduce((a, q) => a + q.y, 0) / pts.length, zap = rnStatic(w);
        if (zap) for (let k = 0; k < pts.length; k += 3) { const q = pts[k], r = pts[(k + 3) % pts.length]; bolt(q.x, q.y, r.x, r.y, '#bfe9ff', 0.35); } // (the circuit lights up)
        for (const e of G.enemies) if (foe(e) && inPoly(e.x, e.y, pts)) {
          n++; rnBar(w, e, st.hot || zap ? 1.05 : 0.7, zap ? { x: cx, y: cy } : null); // (Static: one bolt from the middle to each, and every one is jolted)
          if (!zap) fxParts('ember', e.x, e.y, '#ff7a2f', 4, 100, 0.4, 3);
        }
        ring(cx, cy, 60, zap ? '#bfe9ff' : '#ff7a2f', 0.5, 5); floatText(cx, cy - 20, zap ? 'CIRCUIT CLOSED' : st.hot ? 'HOT LAP' : 'LOOP', zap ? '#e8f7ff' : '#ffb703', 16, 0.9); bump(w, 'loop');
        if (st.hot) { G.sprintT = Math.max(G.sprintT || 0, G.t + 2); bump(w, 'hotlap'); }
        if (n) bump(w, 'loopin');
      }
    }
  }
  function rnWaves(w, dt) {
    const st = w6S(w);
    for (let wi = st.waves.length - 1; wi >= 0; wi--) {
      const v = st.waves[wi];
      if (G.t > v.until) { st.waves.splice(wi, 1); continue; }
      v.a -= 30 * dt; v.b += 30 * dt;
      const step = (from, to) => {
        const lo = Math.max(0, Math.min(from, to)), hi = Math.min(st.path.length - 1, Math.max(from, to));
        for (let k = Math.ceil(lo); k <= Math.floor(hi); k++) {
          const z = st.path[k]; if (!z) continue;
          forNear(z.x, z.y, z.r + 6, e => { if (foe(e) && Math.hypot(e.x - z.x, e.y - z.y) < z.r + 6 + e.r) rnBar(w, e, 0.5, z); });
          if (k % 2 === 0) fxParts(rnStatic(w) ? 'spark' : 'ember', z.x, z.y, rnStatic(w) ? '#bfe9ff' : '#ffb703', 2, 70, 0.3, 3);
        }
      };
      step(v.ra, v.a); step(v.rb, v.b); v.ra = v.a; v.rb = v.b;
      bump(w, 'wave');
    }
    if (st.flash) { // Flashpoint: a wave that meets another wave bursts where they meet
      for (let i = 0; i < st.waves.length; i++) for (let j = i + 1; j < st.waves.length; j++) {
        const A = st.waves[i], B = st.waves[j], key = A.id + ':' + B.id;
        if (A.bursts.has(key)) continue;
        for (const ha of [A.a, A.b]) for (const hb of [B.a, B.b]) {
          const za = st.path[clamp(Math.round(ha), 0, st.path.length - 1)], zb = st.path[clamp(Math.round(hb), 0, st.path.length - 1)];
          if (za && zb && Math.hypot(za.x - zb.x, za.y - zb.y) < 40 && !A.bursts.has(key)) {
            A.bursts.add(key); blast6(w, (za.x + zb.x) / 2, (za.y + zb.y) / 2, 90, w.s.dmg * 3, { wname: 'Flashpoint' }, '#ffb703'); bump(w, 'flash');
          }
        }
      }
    }
  }
  wupReg('s_wake', {
    A: { name: 'Can\'t Hold It', tag: 'Go fast', costs: 'standing still leaves nothing, and slow swimming leaves a weak trail.', shows: 'the trail brightens and widens with speed.', modes: 'KITE and ORBIT keep you moving fast.',
      lv3: { desc: 'The faster you swim, the denser and hotter the trail (up to x2 Burn rate at full speed; half as much when slow).', apply: PRO('A') },
      lv6: [CARD('Burning Rubber', 'Sprinting leaves a white-hot streak that Ignites anything crossing it at once (once per enemy per 4 s).', SET('white')),
        CARD('Footloose', 'At full speed you leave burning footprints either side of you as well, tripling the trail\'s width.', SET('foot'))],
      wild: CARD('Slip Road', 'Enemies that cross the trail skid forward along it.', SET('slip')) },
    B: { name: 'Backdraft', tag: 'Cross your own path', costs: 'the trail itself burns 30% weaker.', shows: 'a visible wave of fire racing along the trail.', modes: 'ORBIT crosses its own path constantly.',
      lv3: { desc: 'Crossing your own trail ignites it in a wave: fire runs along the path both ways (1 s, fills Burn bars by half).', apply: PRO('B') },
      lv6: [CARD('Full Circle', 'Closing a loop (crossing a trail you laid within 4 s) fills the Burn bar of most of what is inside the loop.', SET('loop')),
        CARD('Flashpoint', 'A wave that meets another wave bursts where they meet (a Burst of radius 90).', SET('flash'))],
      wild: CARD('Breadcrumbs', 'Gems you swim past follow you along the trail until you collect them.', SET('crumbs')) },
    C: { name: 'Leave a Little Behind', tag: 'Lay a route', costs: 'slow payoff; the fresh trail behind you does little.', shows: 'a trail that glows from dull to bright behind you.', modes: 'KITE drags pursuers along the route; NEST circles the egg on one route.',
      lv3: { desc: 'The trail lasts 3 times as long but starts at low heat, building up over 2 s.', apply: PRO('C') },
      lv6: [CARD('Creature of Habit', 'Enemies following your path through the trail take +50%.', SET('habit')),
        CARD('Well Trodden', 'Trail pieces on a route you keep using become embers that stay for 10 s once fully hot.', SET('ember'))],
      wild: CARD('Wrong Way', 'The trail is laid 150 units ahead of you instead of behind.', SET('wrong')) },
    lv10: [
      { name: 'Afterburner', best: 'A', desc: 'The trail Ignites everything it touches at once (once per enemy per 3 s).', apply: SET('after') },
      { name: 'Hot Lap', best: 'B', desc: 'Closing a loop erupts everything inside it (full Ignition) and doubles your swim speed for 2 s.', apply: SET('hot') },
      { name: 'Scorched Route', best: 'C', desc: 'The trail lasts 20 s at full heat (trail pieces get their own cap of 80).', apply: SET('scorch') }] });

  // ================================================================ shared wrappers
  const hp = hurtPlayer;
  hurtPlayer = function (dmg, from, ent, kind) {
    if (G && G.weapons) {
      for (const w of G.weapons) {
        const st = w && w.w6; if (!st || !st.inst) continue;
        const k = w24Key(w);
        if (k === 's_peekaboo' && st.p === 'B' && kind === 'bullets' && peekHidden()) { // shots pass through your old position
          say('pk-pass2', G.player.x, G.player.y - 26, 'PASSES THROUGH', w.def.color, 11, 0.5); bump(w, 'passed'); return;
        }
        if (k === 's_toothfairy') {
          if (st.p === 'B' && ent && ent.w6lure > G.t && kind === 'contact') { bump(w, 'spared'); say('eg-spare', ent.x, ent.y - 20, 'BUSY', w.def.color, 11, 0.5); return; }
          if (st.face && ent && live(ent) && !(st.faceT > G.t)) { st.faceT = G.t + 0.4; if (egPlace(w, ent.x, ent.y, {})) { bump(w, 'face'); floatText(ent.x, ent.y - ent.r - 12, 'EGG ON YOUR FACE', w.def.color, 12, 0.8); } }
        }
      }
    }
    return hp(dmg, from, ent, kind);
  };
  const dm = wupDmgMul;
  wupDmgMul = function (e, src) { // Sneak Attack: your other weapons hit 30% harder while Peekaboo has you hidden
    let k = dm(e, src);
    if (src && src.w && G && G.peek && G.peek.t > G.t && G.peek.w && G.peek.w !== src.w && G.peek.w.w6 && G.peek.w.w6.sneak) { k *= 1.3; bump(G.peek.w, 'sneak'); }
    return k;
  };
  function w6Ghost(x, y, a, color, h) {
    const X = sx(x), Y = sy(y);
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col(color); ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(X, Y, 8 * S, 0, TWO); ctx.moveTo(X - 8 * S, Y);
    ctx.bezierCurveTo(X - 18 * S, Y - 6 * S, X - 26 * S, Y + 8 * S, X - 36 * S, Y + (h || 0) * S); ctx.stroke(); ctx.restore();
  }
  function w6Draw() {
    if (!G || !G.weapons) return;
    const p = G.player;
    for (const w of G.weapons) {
      const st = w && w.w6; if (!st || !st.inst) continue;
      const key = w24Key(w), col0 = w.def.color;
      if (key === 's_peekaboo') {
        const k = G.peek;
        if (k && k.w === w && k.t > G.t) {
          if (st.p === 'A' || st.p === 'B') w6Ghost(k.x, k.y, 0.55 + 0.2 * Math.sin(G.realT * 8), col0);
          if (st.mir && st.mir.k === k) w6Ghost(st.mir.x, st.mir.y, 0.55, col0, 4);
          if (st.rat && st.rat.end > G.t) { ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = col('#ffd6e8'); ctx.beginPath(); ctx.arc(sx(st.rat.x), sy(st.rat.y), 7 * S, 0, TWO); ctx.fill(); ctx.restore(); }
        }
      } else if (key === 's_toothfairy') {
        for (const t of st.eggs) {
          if (t.dead) continue;
          const age = G.t - t.born;
          if (st.p === 'C' && age > 0.5) { const f = clamp(age / 6, 0, 1); ctx.save(); ctx.globalAlpha = 0.15 + 0.5 * f; ctx.strokeStyle = col('#fff3b0'); ctx.lineWidth = 1 + 3 * f; ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), (10 + 12 * f + (f >= 1 ? 3 * Math.sin(G.realT * 10) : 0)) * S, 0, TWO); ctx.stroke(); ctx.restore(); }
          if (t.w6all) { ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = col('#ffd23f'); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), (22 + 6 * Math.sin(G.realT * 6)) * S, 0, TWO); ctx.stroke(); ctx.restore(); }
        }
      } else if (key === 's_parasite') {
        if (st.worms) for (const m of st.worms) {
          if (m.seg.length < 2) continue;
          ctx.save(); ctx.strokeStyle = col('#b5e48c'); ctx.lineWidth = 4 * S; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 0.9;
          ctx.beginPath(); ctx.moveTo(sx(m.seg[0].x), sy(m.seg[0].y)); for (let i = 1; i < m.seg.length; i++) ctx.lineTo(sx(m.seg[i].x), sy(m.seg[i].y)); ctx.stroke(); ctx.restore();
        }
        for (const t of st.und) if (t.life > 0 && t.w6 && st.p === 'C' && t.life < 1.5) { ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = col(col0); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), 70 * S * (1 - t.life / 1.5), 0, TWO); ctx.stroke(); ctx.restore(); }
      } else if (key === 's_wake') {
        for (const v of st.waves) for (const h of [v.a, v.b]) {
          const z = st.path[clamp(Math.round(h), 0, st.path.length - 1)]; if (!z) continue;
          ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = col('#ffe08a'); ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), 7 * S, 0, TWO); ctx.fill(); ctx.restore();
        }
      }
    }
  }
  const vd = v10Draw;
  v10Draw = function () { vd(); safe(w6Draw); };
})();
