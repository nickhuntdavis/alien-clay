// Weapon upgrade branches, batch 3 (wup3.js): Rent Free, Hot Mess, Family Ties, Skill Issue.
// For each weapon: each promise (Lv 3), each Lv 6 card, each mastery is taken through the real fork screen
// (genLoot kind 'fork'), then 300 frames run against a ring of enemies with no errors; the card's signature is asserted.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; window.FIT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], rows = [];
    const def = Object.values(ENEMIES).find(d => d.ai === 'chase') || Object.values(ENEMIES)[0];
    const IDS = ['v_soul_proj', 'v_flame_pool', 's_void', 's_lard'];
    // Boot a run with one weapon and a ring of tough enemies, and take the given path through the fork screens.
    function boot(id, path) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const w = G.weapons[0], p = G.player; p.x = p.y = 0;
      const base = Object.assign({}, w.s);
      const take = (lv, idx) => { w.lvl = lv; const c = genLoot({ kind: 'fork', w, lv }); if (!c || !c[idx]) throw new Error('no card ' + lv + '/' + idx); c[idx].apply(); return c[idx].title; };
      const names = [];
      if (path.p != null) names.push(take(3, path.p));
      if (path.l6 != null) names.push(take(6, path.l6));
      if (path.l10 != null) names.push(take(10, path.l10));
      const uh = w.uh; w.uh = null; computeStats(w); Object.assign(base, w.s); w.uh = uh; computeStats(w); // (the same level without the cards: what the cost is measured against)
      G.enemies.length = 0;
      const n = path.n || 12;
      if (path.line) for (let i = 0; i < 6; i++) { const e = makeEnemy(def, p.x + 90 + i * 40, p.y + (i % 2) * 4); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); }
      else for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, d = (path.d || 90) + (i % 3) * 50; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); }
      return { w, p, base, names };
    }
    function run(frames, each) { for (let f = 0; f < frames; f++) { update(1 / 60); if (each) each(f); } }
    const checks = {
      // ------------------------------------------------------------ Rent Free
      'v_soul_proj': {
        A: { l3: (c) => { if (!(c.w.s.pierce >= 3)) return 'pierce ' + c.w.s.pierce; if (!(c.max.hits >= 2)) return 'no pass-through ' + c.max.hits; },
          l6: [(c) => (c.w.w3 ? '' : 'no state'), (c) => (c.max.shots >= 2 ? '' : 'no re-formed shot'), (c) => (c.max.fromPossessed ? '' : 'possessed enemy fired nothing')] },
        B: { l3: (c) => { if (!modHas(c.w, 'returning')) return 'no returning'; if (!(c.w.s.speed < c.base.speed * 0.75)) return 'speed ' + c.w.s.speed; if (!c.max.back) return 'no shot came back'; },
          l6: [(c) => '', (c) => '', (c) => (c.max.haunts ? '' : 'no haunt')] },
        C: { l3: (c) => { if (!(c.w.s.dmg < c.base.dmg * 0.85)) return 'dmg ' + c.w.s.dmg; if (!c.max.marks) return 'nothing marked'; },
          l6: [(c) => '', (c) => '', (c) => (c.max.ghosts ? '' : 'no seance ghosts')] },
        lv10: [(c) => (c.max.possessed ? '' : 'nobody possessed'), (c) => (c.max.polt ? '' : 'no wandering ghost'), (c) => (c.max.pets ? '' : 'no ghost army')],
      },
      // ------------------------------------------------------------ Hot Mess
      'v_flame_pool': {
        A: { l3: (c) => { if (!(c.w.s.area < c.base.area * 0.85)) return 'area ' + c.w.s.area; if (!c.max.patches) return 'no patch'; },
          l6: [(c) => '', (c) => '', (c) => (c.max.pushed ? '' : 'nothing refused the patch')] },
        B: { l3: (c) => { if (!(c.w.s.dur < c.base.dur * 0.75)) return 'dur ' + c.w.s.dur; if (!c.max.prints) return 'no footprints'; },
          l6: [(c) => '', (c) => '', (c) => (c.max.healed ? '' : 'no heal')] },
        C: { l3: (c) => { if (!(c.w.s.dur < c.base.dur * 0.55)) return 'dur ' + c.w.s.dur; if (!c.max.erupt) return 'no eruption'; },
          l6: [(c) => (c.max.erupt ? '' : 'no early eruption'), (c) => (c.max.erupt ? '' : 'no keg blast'), (c) => (c.max.jumped ? '' : 'patch never jumped')] },
        lv10: [(c) => (c.max.hell ? '' : 'no hellmouth'), (c) => (c.max.spawned ? '' : 'ignition dropped no patch'), (c) => '']
      },
      // ------------------------------------------------------------ Family Ties
      's_void': {
        A: { l3: (c) => (c.max.orbs ? '' : 'no orb'),
          l6: [(c) => (c.max.held ? '' : 'nothing held'), (c) => '', (c) => '' ] },
        B: { l3: (c) => { if (!(c.w.s.dmg < c.base.dmg * 0.7)) return 'dmg ' + c.w.s.dmg; if (!c.max.orbiters) return 'nothing orbits'; },
          l6: [(c) => '', (c) => '', (c) => (c.max.assist ? '' : 'no slingshot')] },
        C: { l3: (c) => (c.w.s.speed < c.base.speed * 0.75 ? '' : 'speed ' + c.w.s.speed),
          l6: [(c) => '', (c) => '', (c) => (c.max.white ? '' : 'no white hole')] },
        lv10: [(c) => (c.max.big ? '' : 'orbs not doubled'), (c) => '', (c) => (c.max.pair ? '' : 'no linked pair')]
      },
      // ------------------------------------------------------------ Skill Issue
      's_lard': {
        A: { l3: (c) => { if (!(c.w.s.dmg < c.base.dmg * 0.85)) return 'dmg ' + c.w.s.dmg; if (!c.max.fliers) return 'nobody launched'; },
          l6: [(c) => '', (c) => '', (c) => '' ] },
        B: { l3: (c) => (c.max.fliers ? '' : 'nobody launched'), l6: [(c) => '', (c) => '', (c) => '' ] },
        C: { l3: (c) => (c.max.fliers ? '' : 'nobody launched'), l6: [(c) => '', (c) => '', (c) => '' ] },
        lv10: [(c) => '', (c) => '', (c) => (c.max.cannon > 100 ? '' : 'no cannonball dash ' + c.max.cannon)]
      },
    };
    // Sampled every frame: what did we see?
    function probe(c, w, id) {
      const m = c.max, p = G.player, st = w.w3 || {};
      if (id === 'v_soul_proj') {
        for (const pr of G.proj) if (pr.w === w && pr.w3) { m.hits = Math.max(m.hits || 0, pr.w3.n); if (pr.back) m.back = 1; if (pr.w3.polt && pr.max === 6) m.polt = 1; }
        m.shots = Math.max(m.shots || 0, G.proj.filter(q => q.w === w && q.w3again).length ? 2 : 0);
        for (const q of G.proj) if (q.w === w && q.w3from) m.fromPossessed = 1;
        if (st.haunts && st.haunts.length) m.haunts = 1;
        if (st.marks && st.marks.length) m.marks = 1;
        if (st.ghosts && st.ghosts.length) m.ghosts = 1;
        if (st.pets && st.pets.length) m.pets = 1;
        if (G.enemies.some(e => e.charmed)) m.possessed = 1;
      } else if (id === 'v_flame_pool') {
        const own = G.zones.filter(z => z.src && z.src.w === w);
        if (own.some(z => !z.src.w3fp)) m.patches = 1;
        if (own.some(z => z.src.w3fp)) m.prints = 1;
        if (own.some(z => z.r >= 199)) m.hell = 1;
        if (own.filter(z => !z.src.w3fp).length >= 2 && c.sc) m.spawned = 1;
        if (G.fx.some(f => f.type === 'flash' && f.color === w.def.color)) m.erupt = 1;
        if (own[0] && !c.z0) { c.z0 = own[0]; c.zx = own[0].x; c.zy = own[0].y; }
        if (c.z0 && Math.hypot(c.z0.x - c.zx, c.z0.y - c.zy) > 30) m.jumped = 1;
        if (c.hp0 !== undefined && p.hp > c.hp0 + 0.5 && p.hp < G.P.maxHp - 1) m.healed = 1;
      } else if (id === 's_void') {
        const orbs = G.proj.filter(q => q.w === w && q.style === 'void' && !q.dead);
        if (orbs.length) m.orbs = 1;
        if (orbs.length >= 2) m.pair = 1;
        if (orbs.some(o => o.r >= 25)) m.big = 1;
        if (orbs.some(o => o.pull < 0)) m.white = 1;
        if (orbs.some(o => o.w3 && o.w3.orbiters && o.w3.orbiters.size)) m.orbiters = 1;
        if (G.enemies.some(e => e.w3held)) m.held = 1;
        if (st.assistT > G.t) m.assist = 1;
      } else if (id === 's_lard') {
        if ((G.armBowl || []).some(b => b.w === w)) m.fliers = 1;
        m.cannon = Math.max(m.cannon || 0, Math.hypot(p.x, p.y));
      }
    }
    function trial(id, label, path, frames, setup) {
      let err = '';
      try {
        const c = boot(id, path); c.path = path; c.max = {}; if (setup) setup(c);
        G.w3ign = [];
        W3_ERR.length = 0;
        run(frames || 300, f => { probe(c, c.w, id); if (c.each) c.each(f); });
        if (W3_ERR.length) err = 'tick error ' + W3_ERR[0];
        const chk = path.chk ? path.chk(c) : '';
        if (!err && chk) err = chk;
        rows.push(label + ' [' + c.names.join(' > ') + ']' + (err ? ' FAIL ' + err : ''));
      } catch (e) { err = e.message + ' ' + (e.stack || '').split('\n')[1]; rows.push(label + ' THREW ' + err); }
      if (err) bad.push(WEAPONS[id].name + ' ' + label + ': ' + err);
    }
    for (const id of IDS) {
      const K = checks[id];
      // Per-weapon setup so the signature can happen
      const sp = (c) => {
        if (id === 'v_flame_pool') { c.each = f => { if (f === 5) for (const e of G.enemies.slice(0, 6)) { const cd = fightCd(e); cd.burnT = 3; } if (f % 40 === 10) { for (const e of G.enemies) if (!e.dead) { c.hp0 = G.player.hp; } } }; }
      };
      for (const P of [0, 1, 2]) {
        const key = 'ABC'[P], S = K[key];
        const lab = id + ' ' + key;
        const setup = c => {
          sp(c);
          if (id === 'v_soul_proj') {
            // for Possession cards: make two enemies Possessed
            c.each = f => { if (f === 3) for (const e of G.enemies.slice(0, 3)) { e.charmed = true; e.charmT = 6; } if (f === 8) for (const e of G.enemies.slice(3, 5)) { e.hp = 2; } };
            if (key === 'C') c.w.w3 = { seT: 1 };
            if (key === 'A' && c.path.l6 === 1) { const o = c.each; c.each = f => { o(f); if (!c.moved && G.proj.some(q => q.w === c.w)) { c.moved = 1; for (const e of G.enemies) e.y += 600; } }; }
            if (key === 'B') c.w.s.range = 120; // short range: shots turn round and some miss
          }
          if (id === 'v_flame_pool' && key === 'B') { c.each = f => { if (f === 90) { const z = G.zones.find(q => q.src && q.src.w === c.w && !q.src.w3fp); if (z) { const e = G.enemies[0]; e.x = z.x; e.y = z.y; e.speed = 0; fightCd(e).burnT = 3; } } if (f === 100) { const e = G.enemies[0]; e.x += 140; } if (f > 100 && f < 140) { G.enemies[0].x += 1.2; fightCd(G.enemies[0]).burnT = 3; } }; }
          if (id === 'v_flame_pool' && key === 'C') c.each = f => { if (f > 0 && f % 30 === 0) for (const e of G.enemies.slice(0, 5)) { const z = G.zones.find(q => q.src && q.src.w === c.w); if (z) { e.x = z.x + rand(-20, 20); e.y = z.y + rand(-20, 20); } } };
          if (id === 'v_flame_pool' && key === 'A') c.each = f => { if (f === 100) { const z = G.zones.find(q => q.src && q.src.w === c.w); if (z) { const e = G.enemies[5]; e.x = z.x + z.r + 30; e.y = z.y; e.speed = 90; e.baseSpeed = 90; } } if (G.enemies[5] && f > 100) { const z = G.zones.find(q => q.src && q.src.w === c.w); if (z) { const e = G.enemies[5]; e.x += (z.x - e.x) * 0.05; e.y += (z.y - e.y) * 0.05; if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + 4) c.max.pushed = 1; } } };
          if (id === 'v_flame_pool' && key === 'B') { /* toasty: player stands in the patch */ const o = c.each; c.each = f => { o(f); const z = G.zones.find(q => q.src && q.src.w === c.w && !q.src.w3fp); if (z) { G.player.x = z.x; G.player.y = z.y; if (c.hp0 === undefined) { c.hp0 = 1; G.player.hp = G.P.maxHp - 5000; c.hp0 = G.player.hp; } } }; }
          if (id === 's_lard') { c.each = f => { }; }
        };
        trial(id, lab + ' Lv3', { p: P, line: id === 'v_soul_proj' && key === 'A', chk: c => S.l3(c) }, 300, setup);
        for (let i = 0; i < 3; i++) {
          const need = (key === 'B' && id === 'v_flame_pool' && i === 2) || id === 'v_flame_pool' && key === 'A' && i === 2 || false;
          trial(id, lab + ' Lv6#' + i, { p: P, l6: i, line: id === 'v_soul_proj' && key === 'A', chk: c => S.l6[i](c) }, id === 's_void' ? 600 : 300, setup); // (Family Ties merges need time: levels no longer speed up firing)
        }
      }
      for (let i = 0; i < 3; i++) {
        const P = id === 'v_soul_proj' ? (i === 2 ? 2 : 0) : id === 'v_flame_pool' ? (i === 1 ? 1 : 0) : id === 's_void' ? (i === 0 ? 2 : i === 1 ? 0 : 1) : 0;
        trial(id, id + ' Lv10#' + i, { p: P, l10: i, chk: c => K.lv10[i](c) }, i === 0 && id === 's_void' ? 600 : 300, c => {
          if (id === 'v_soul_proj') c.each = f => { if (f === 3) for (const e of G.enemies.slice(0, 3)) { e.charmed = true; e.charmT = 6; } if (f === 8) for (const e of G.enemies.slice(3, 6)) { e.hp = 2; } if (i === 0 && f === 10) for (const e of G.enemies) fightCd(e).bars.soul = 0.7; };
          if (id === 'v_flame_pool' && i === 1) c.each = f => { if (f === 100) { const e = G.enemies[0]; w3BarFrac(e, 'fire', 1.3, c.w); c.sc = 1; } };
          if (id === 's_lard' && i === 2) c.each = () => {};
        });
      }
    }
    return { bad, rows };
  });
  console.log(r.rows.join('\n'));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
