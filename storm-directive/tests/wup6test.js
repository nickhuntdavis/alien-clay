// Weapon upgrade branches, batch 6 (wup6.js): Peekaboo, Eggs, Chest Burster, The Runs.
// For each weapon: each promise (Lv 3), each Lv 6 card and each mastery is taken through the real fork screen
// (genLoot kind 'fork'), then 300+ frames run against a ring of enemies with no errors; the card's signature is asserted.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], rows = [];
    const def = Object.values(ENEMIES).find(d => d.ai === 'chase') || Object.values(ENEMIES)[0];
    // The player is driven by the test (no autorun): window.MV() gives its velocity each frame.
    const up0 = updatePlayer; window.MV = null;
    updatePlayer = function (dt) {
      const p = G.player;
      if (!window.MV) { p.vx = p.vy = 0; return; }
      const m = window.MV(); p.vx = m.vx; p.vy = m.vy; p.x += m.vx * dt; p.y += m.vy * dt; p.hd = Math.atan2(m.vy, m.vx);
    };
    function boot(id, path) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), path.other ? makeSlot(path.other, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const w = G.weapons[0], p = G.player; p.x = p.y = 0; p.hd = 0; window.MV = null;
      const base = Object.assign({}, w.s);
      const take = (lv, idx) => { w.lvl = lv; const c = genLoot({ kind: 'fork', w, lv }); if (!c || !c[idx]) throw new Error('no card ' + lv + '/' + idx); c[idx].apply(); return c[idx].title; };
      const names = [];
      if (path.p != null) names.push(take(3, path.p));
      if (path.l6 != null) names.push(take(6, path.l6));
      if (path.l10 != null) names.push(take(10, path.l10));
      const uh = w.uh; w.uh = null; computeStats(w); Object.assign(base, w.s); w.uh = uh; computeStats(w);
      G.enemies.length = 0;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 90 + (i % 3) * 50; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e5; e.speed = 0; e.baseSpeed = 0; G.enemies.push(e); }
      return { w, p, base, names, max: {} };
    }
    const sq = () => { const f = (G.t - 100) * 60; const k = Math.floor(f / 23) % 4; return [{ vx: 240, vy: 0 }, { vx: 0, vy: 240 }, { vx: -240, vy: 0 }, { vx: 0, vy: -240 }][k]; }; // a square about 90 across
    const line = () => ({ vx: 240, vy: 0 });
    const C = c => c.w.w6 ? c.w.w6.c : {};
    const dmgMul = (c, e, name, extra) => wupDmgMul(e, Object.assign({ w: c.w, wname: name }, extra || {}));
    const moveOnto = (e, t) => { e.x = t.x; e.y = t.y; };
    const eggsOf = c => (G.toy ? G.toy.teeth.filter(t => t.w === c.w && !t.dead) : []);
    const undead = c => G.turrets.filter(t => t.w6 && t.w === c.w);
    const infect = (c, e) => { e.parasiteW = c.w; e.parasiteT = 6; };
    const kill = (c, e) => { infect(c, e); e.hp = 0; killEnemy(e, { elem: 'soul' }); };

    // spec per weapon: setup(c, key, i) installs c.each / c.mv; chk(c, key, i) asserts. key in A B C, i in 0 (Lv3) 1..3 (Lv6) ; masteries separate
    const SPEC = {
      's_peekaboo': {
        frames: 480,
        l3: {
          A: c => (C(c).pop >= 1 ? '' : 'false position never popped') || (Math.abs(dmgMul(c, G.enemies[0], 'BOO!') - 0.7) < 0.01 ? '' : 'BOO not 30% weaker ' + dmgMul(c, G.enemies[0], 'BOO!')),
          B: c => (Math.abs(dmgMul(c, G.enemies[0], 'BOO!') - 0.6) < 0.01 ? '' : 'BOO not 40% weaker') || (C(c).passed ? '' : 'no shot passed through'),
          C: c => (c.w.s.dur <= 1.2 ? '' : 'hide ' + c.w.s.dur) || (C(c).fear3 ? '' : 'Fear never 3 s'),
        },
        l6: {
          A: [c => (c.w.w6.lastR > 90 ? '' : 'burst did not grow ' + c.w.w6.lastR), c => (C(c).second ? '' : 'no second burst'), c => (C(c).rattle && c.max.rat > 150 ? '' : 'no rattle ' + c.max.rat)],
          B: [c => (c.w.perks[5] === 'hideandseek' ? '' : 'no speed card'), c => (C(c).sneak ? '' : 'other weapon did not sneak'), c => (C(c).mirror && c.max.m2 ? '' : 'no second false position')],
          C: [c => (C(c).spread ? '' : 'Fear did not spread'), c => (C(c).stampede ? '' : 'no stampede'), c => (C(c).cuckoo ? '' : 'no swap')],
        },
        lv10: [c => (c.w.s.area >= 700 && c.w.s.cd < c.base.cd * 0.6 ? '' : 'area/cd ' + c.w.s.area + ' ' + c.w.s.cd), c => (C(c).hyst ? '' : 'nobody possessed'), c => (c.w.s.dur === 3 && c.w.s.cd === 4 ? '' : 'dur/cd ' + c.w.s.dur + ' ' + c.w.s.cd)],
        setup: (c, key, kind, i) => {
          c.each = f => {
            const k = G.peek;
            if (k && k.w === c.w && k.t > G.t) {
              if (key === 'B' && kind === 'l3' && !c.did) { c.did = 1; const hp0 = G.player.hp; hurtPlayer(5, 'test', null, 'bullets'); if (G.player.hp < hp0) c.max.hurt = 1; }
              if (c.w.w6.rat) c.max.rat = Math.hypot(k.x - G.player.x, k.y - G.player.y);
              if (G.enemies.some(e => e.w6m === 2)) c.max.m2 = 1;
            }
            // Feared pairs: put two feared enemies on top of each other so Pass It On / Stampede have something to do.
            if ((kind === 'l6' && key === 'C' && i < 2) && f % 30 === 5) { const a = G.enemies[0], d = G.enemies[1]; a.fearT = G.t + 3; d.fearT = i === 1 ? G.t + 3 : 0; d.x = a.x + 3; d.y = a.y; }
          };
          if (kind === 'l6' && key === 'B' && i === 1) c.other = 'v_phys_proj';
          if (kind === 'l10' && i === 1) c.each = f => { };
        },
      },
      's_toothfairy': {
        frames: 600,
        l3: {
          A: c => (c.w.s.dmg < c.base.dmg * 0.85 ? '' : 'dmg ' + c.w.s.dmg) || (C(c).laid ? '' : 'no egg laid by a smitten enemy'),
          B: c => (c.w.s.lure > c.base.lure * 1.9 ? '' : 'lure ' + c.w.s.lure + '/' + c.base.lure) || (C(c).spared ? '' : 'a lured enemy still attacked'),
          C: c => (c.w.s.cd > c.base.cd * 1.5 ? '' : 'cd ' + c.w.s.cd) || (dmgMul(c, (() => { const e = G.enemies[0]; e.w6egg = { age: 4, pending: true }; return e; })(), 'Tooth Fairy') > 1.9 ? '' : 'no charge bonus'),
        },
        l6: {
          A: [c => (c.max.own > 3 ? '' : 'cap not raised ' + c.max.own), c => (C(c).triple ? '' : 'no triple smite'), c => (C(c).burrow ? '' : 'no burrowing egg')],
          B: [c => (c.max.behind ? '' : 'no egg on the swim path'), c => (c.max.goldAll ? '' : 'no golden lure'), c => (C(c).hatch ? '' : 'nothing hatched')],
          C: [c => (C(c).glow ? '' : 'no glow splash'), c => (C(c).timebomb ? '' : 'no time bomb'), c => (C(c).face ? '' : 'no egg on your face')],
        },
        lv10: [c => (C(c).goose ? '' : 'no goose splash'), c => (c.max.own > 6 ? '' : 'clutch cap ' + c.max.own), c => (C(c).fee ? '' : 'nobody possessed')],
        setup: (c, key, kind, i) => {
          const take = () => { // put enemies onto eggs so they are taken
            for (const t of eggsOf(c)) { if (kind === 'l6' && key === 'C' && i === 0) { if (G.t - t.born < 6.05) continue; } else if (kind === 'l6' && key === 'C' && i === 1) continue; else if (kind === 'l6' && key === 'A' && i === 0) continue; const e = G.enemies.find(q => !q.dead && !q.w6used); if (e) { e.w6used = 1; moveOnto(e, t); } break; }
          };
          c.each = f => {
            const own = eggsOf(c).length; c.max.own = Math.max(c.max.own || 0, own);
            if (((kind === 'l6' && key === 'C' && i < 2) || (kind === 'l6' && key === 'A' && i === 1 && f < 150)) && !(f === 150)) for (const t of eggsOf(c)) for (const e of G.enemies) if (!e.w6used && Math.hypot(e.x - t.x, e.y - t.y) < 36) { e.x += 70; e.y += 70; } // keep greedy neighbours off the eggs: these cards need an egg that waits
            if (f % 25 === 12 && !(kind === 'l6' && key === 'A' && i === 1) && !(kind === 'l3' && key === 'B')) take();
            if (kind === 'l6' && key === 'A' && i === 1 && f === 150) { const E = eggsOf(c).slice(0, 3); if (E.length === 3) E.forEach((t, k) => { const e = G.enemies[k]; moveOnto(e, t); e.w6used = 1; }); }
            if (kind === 'l3' && key === 'B' && f === 120) { const e = G.enemies.find(q => !q.dead && toothLure(q)); if (e) { e.x = 40; e.y = 0; hurtPlayer(5, 'test', e, 'contact'); } else c.max.nolure = 1; }
            if (kind === 'l6' && key === 'C' && i === 2 && f === 100) hurtPlayer(5, 'test', G.enemies[0], 'contact');
            if (kind === 'l6' && key === 'B' && i === 0) { G.player.hd = 0; if (eggsOf(c).some(t => t.x < -140 && Math.abs(t.y) < 90)) c.max.behind = 1; }
            if (kind === 'l6' && key === 'B' && i === 1) { if (f === 80) { const far = G.enemies[11]; far.x = 900; far.y = 0; c.far = far; } if (c.far && eggsOf(c).some(t => t.gold && t.w6all) && toothLure(c.far)) c.max.goldAll = 1; }
          };
        },
      },
      's_parasite': {
        frames: 420,
        l3: {
          A: c => (c.max.maxLife > 11 ? '' : 'life ' + c.max.maxLife) || (c.max.alive <= 3 ? '' : 'cap ' + c.max.alive) || (c.max.alive >= 2 ? '' : 'no undead') || (c.max.dmg > c.w.s.dmg * 1.5 ? '' : 'dmg ' + c.max.dmg),
          B: c => (c.max.maxLife <= 4.01 && c.max.maxLife > 0 ? '' : 'life ' + c.max.maxLife) || (c.max.infect ? '' : 'undead do not infect'),
          C: c => (c.max.alive >= 2 ? '' : 'no undead') || (c.max.moved > 20 ? '' : 'undead did not move ' + c.max.moved) || (C(c).pop ? '' : 'no burst'),
        },
        l6: {
          A: [c => (c.max.near ? '' : 'undead did not follow'), c => (C(c).kept ? '' : 'elite not kept'), c => (C(c).fetch ? '' : 'no gem fetched')],
          B: [c => (C(c).keep ? '' : 'infection not kept') , c => (C(c).casket ? '' : 'no spread'), c => (C(c).latch ? '' : 'nothing latched')],
          C: [c => (C(c).soulbar ? '' : 'no Soul build-up'), c => (C(c).rush ? '' : 'no rush'), c => (C(c).gut ? '' : 'no warning flash')],
        },
        lv10: [c => (c.max.alive > 4 && c.max.alive <= 12 ? '' : 'cap ' + c.max.alive), c => (C(c).adopted && c.max.ally ? '' : 'no adopted ally'), c => (c.w.w6.worms && c.w.w6.worms.length === 3 && C(c).bite && c.w.w6.wormK > 0 ? '' : 'no worms/bonus ' + C(c).bite + ' ' + c.w.w6.wormK)],
        setup: (c, key, kind, i) => {
          const many = kind === 'l10' && i === 0;
          c.each = f => {
            const U = undead(c).filter(t => t.life > 0);
            c.max.alive = Math.max(c.max.alive || 0, U.length);
            for (const t of U) { c.max.maxLife = Math.max(c.max.maxLife || 0, t.life); c.max.dmg = Math.max(c.max.dmg || 0, t.dmg); if (t.src && t.src.parasite) c.max.infect = 1; if (Math.hypot(t.x - G.player.x, t.y - G.player.y) < 100) c.max.near = 1; c.max.moved = Math.max(c.max.moved || 0, Math.hypot(t.x - (c.spawnX || t.x), t.y - (c.spawnY || t.y))); }
            if (G.enemies.some(e => e.snatched)) c.max.ally = 1;
            if (f === 20) { // the killing
              const n = many ? 8 : 5;
              for (let k = 0; k < n; k++) { const e = G.enemies[k]; if (kind === 'l6' && key === 'A' && i === 1 && k === 0) e.elite = true; if (kind === 'l10' && i === 1 && k === 0) e.elite = true; kill(c, e); }
              if (kind === 'l6' && key === 'B' && i === 0) { const e = G.enemies[8]; infect(c, e); e.parasiteT = 2; }
              if (kind === 'l6' && key === 'B' && i === 1) { for (const e of G.enemies.slice(8, 11)) e.parasiteT = 0; const v = G.enemies[7]; v.x = G.enemies[9].x + 12; v.y = G.enemies[9].y; kill(c, v); }
              if (kind === 'l10' && i === 2) kill(c, G.enemies[9]);
            }
            if (f === 22) { const T = undead(c)[0]; if (T) { c.spawnX = T.x; c.spawnY = T.y; } }
            if (f === 30 && kind === 'l6' && key === 'A' && i === 2) { for (const e of G.enemies) if (!e.dead) e.x += 3000; const t = undead(c)[0]; if (t) dropGem(t.x + 120, t.y, 5); }
            if (f === 30 && kind === 'l6' && key === 'C' && i === 0) for (const t of undead(c)) t.life = 0.4;
            if (f === 40 && kind === 'l6' && key === 'C' && i === 1) { c.w.w6.rushT = 0.1; }
            if (f === 60 && kind === 'l6' && key === 'C' && i === 1) for (const t of undead(c)) if (t.life > 0.5) t.life = Math.min(t.life, 2);
            if (f === 40 && kind === 'l6' && key === 'C' && i === 2) { const e = G.enemies[11]; infect(c, e); e.x = 30; e.y = 0; e.shootCd = 0.2; }
            if (f === 60 && kind === 'l6' && key === 'B' && i === 0) { /* chronic: nothing more */ }
            if (kind === 'l10' && i === 2 && f === 40) for (const e of G.enemies) if (!e.dead && Math.hypot(e.x, e.y) < 100) { /* worms bite what is near */ }
          };
          if (kind === 'l6' && key === 'C' && i === 0) c.postSetup = () => { };
        },
      },
      's_wake': {
        frames: 360,
        l3: {
          A: c => (c.max.dps > c.base.dmg * 1.7 ? '' : 'trail not hotter at speed ' + c.max.dps + '/' + c.base.dmg),
          B: c => (c.w.s.dmg < c.base.dmg * 0.75 ? '' : 'dmg ' + c.w.s.dmg) || (C(c).cross ? '' : 'never crossed') || (C(c).wave ? '' : 'no wave'),
          C: c => (c.max.life > 6 ? '' : 'life ' + c.max.life) || (c.max.ramp < 0.4 ? '' : 'trail not cold at birth ' + c.max.ramp) || (c.max.ramp2 > 0.9 ? '' : 'trail never heated'),
        },
        l6: {
          A: [c => (C(c).white && C(c).ignite ? '' : 'no white-hot ignite ' + C(c).white + ' ' + C(c).ignite), c => (C(c).foot ? '' : 'no footprints'), c => (C(c).slip ? '' : 'nothing skidded')],
          B: [c => (C(c).loop && C(c).loopin ? '' : 'no loop fill'), c => (C(c).flash ? '' : 'no flashpoint'), c => (C(c).crumb ? '' : 'no gem followed')],
          C: [c => (C(c).habit ? '' : 'no habit bonus'), c => (C(c).ember ? '' : 'no embers'), c => (c.max.ahead > 100 ? '' : 'trail not ahead ' + c.max.ahead)],
        },
        lv10: [c => (C(c).ignite ? '' : 'trail ignited nothing'), c => (C(c).hotlap ? '' : 'no hot lap'), c => (c.max.life >= 19 && c.max.paths <= 81 ? '' : 'scorch ' + c.max.life + ' ' + c.max.paths)],
        setup: (c, key, kind, i) => {
          const loopy = (kind === 'l3' && key === 'B') || (kind === 'l6' && key === 'B') || (kind === 'l10' && i === 1);
          window.MV = loopy ? sq : line;
          if (kind === 'l6' && key === 'A' && i === 0) G.sprintT = 1e9;
          if (loopy && ((kind === 'l6' && i === 0) || kind === 'l10')) for (const e of G.enemies.slice(0, 4)) { const k = G.enemies.indexOf(e); e.x = 30 + k * 12; e.y = 30 + k * 12; }
          c.each = f => {
            const own = G.zones.filter(z => z.trail && z.src && z.src.w === c.w);
            for (const z of own) {
              c.max.dps = Math.max(c.max.dps || 0, z.dps); c.max.life = Math.max(c.max.life || 0, z.max);
              if (z.ramp && z.dps0) { const age = G.t - z.w6.born; if (age < 0.2) c.max.ramp = Math.min(c.max.ramp == null ? 9 : c.max.ramp, z.dps / z.dps0); if (age > 2.1) c.max.ramp2 = Math.max(c.max.ramp2 || 0, z.dps / z.dps0); }
              if (z.w6 && c.w.w6.wrong) c.max.ahead = Math.max(c.max.ahead || 0, z.x - G.player.x);
            }
            c.max.paths = c.w.w6 && c.w.w6.path ? c.w.w6.path.length : 0;
            if (kind === 'l6' && key === 'B' && i === 2 && f === 5) dropGem(70, 10, 5);
            if (kind === 'l6' && key === 'B' && i === 1 && f === 150) { const st = c.w.w6; if (st.path.length > 24) { st.waves.push({ a: 4, b: 4, ra: 4, rb: 4, until: G.t + 1, id: 101, bursts: new Set() }); st.waves.push({ a: 20, b: 20, ra: 20, rb: 20, until: G.t + 1, id: 102, bursts: new Set() }); } }
            if (kind === 'l6' && key === 'C' && i === 0) { const e = G.enemies[0], p = G.player; e.x = p.x - Math.max(15, 120 - f * 0.7); e.y = p.y; }
            if (kind === 'l6' && key === 'A' && i === 2) { /* enemies at (90,0) are crossed by the trail */ }
          };
        },
      },
    };

    function trial(id, label, path, chk, setup, frames) {
      let err = '';
      try {
        const c = boot(id, path); c.path = path; W6_ERR.length = 0;
        if (setup) setup(c);
        if (c.other && !G.weapons[1]) { /* handled in boot via path.other */ }
        for (let f = 0; f < frames; f++) { update(1 / 60); if (c.each) c.each(f); }
        if (W6_ERR.length) err = 'tick error ' + W6_ERR[0];
        const m = chk(c);
        if (!err && m) err = m;
        rows.push(label + ' [' + c.names.join(' > ') + ']' + (err ? ' FAIL ' + err : ''));
      } catch (e) { err = e.message + ' ' + (e.stack || '').split('\n')[1]; rows.push(label + ' THREW ' + err); }
      if (err) bad.push(label + ': ' + err);
      window.MV = null;
    }
    for (const id of ['s_peekaboo', 's_toothfairy', 's_parasite', 's_wake']) {
      const S = SPEC[id];
      for (let P = 0; P < 3; P++) {
        const key = 'ABC'[P];
        trial(id, id + ' ' + key + ' Lv3', { p: P }, S.l3[key], c => S.setup(c, key, 'l3', 0), S.frames);
        for (let i = 0; i < 3; i++) {
          const path = { p: P, l6: i };
          if (id === 's_peekaboo' && key === 'B' && i === 1) path.other = 'v_phys_proj';
          trial(id, id + ' ' + key + ' Lv6#' + i, path, S.l6[key][i], c => S.setup(c, key, 'l6', i), id === 's_wake' ? 420 : S.frames);
        }
      }
      for (let i = 0; i < 3; i++) {
        const P = id === 's_peekaboo' ? [2, 2, 1][i] : id === 's_toothfairy' ? [0, 0, 1][i] : id === 's_parasite' ? [1, 0, 0][i] : [0, 1, 2][i];
        trial(id, id + ' Lv10#' + i, { p: P, l10: i }, S.lv10[i], c => S.setup(c, 'ABC'[P], 'l10', i), id === 's_toothfairy' && i === 1 ? 600 : S.frames);
      }
    }
    return { bad, rows };
  });
  console.log(r.rows.join('\n'));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
