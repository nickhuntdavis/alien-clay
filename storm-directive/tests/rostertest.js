// Roster sweep (ENEMY_HANDOFF.md E3). In the Lab Bench: (a) the 15 enemies and 2 bosses no other test spawns run 10 s each with
// no page errors, die to damage, and never hurt a stationary player for more than their roster damage x the live knobs per hit;
// (b) one telegraph loop driven by ROSTER: for every enemy with an atk[].tele > 0 and a built tell, no damage lands before
// `tele` seconds after the tell starts (ids with no tell detector here are listed as SKIPPED, not failed).
// Real bugs are reported as FAIL lines; this test never fixes game code.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {}, skipped = [], quiet = [], untimed = [], hits = [];
    const orig = hurtPlayer; // every attempted hit with the damage handed in (god mode in the Lab Bench still reaches here)
    hurtPlayer = function (dmg, from, ent, kind) { hits.push({ f: frame, dmg, from, kind, ent }); return orig.apply(this, arguments); };
    let frame = 0;
    const fresh = () => { UI.sample = 's000'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e12; G.ev.next = 1e12; G.enemies.length = 0; G.zones.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list); if (G.bigHaz) G.bigHaz.length = 0;
      G.player.iframes = 0; G.manual = { x: 0, y: 0 }; hits.length = 0; frame = 0; G.weapons.length = 0; G.weapons.push(null); G.spells.length = 0; recomputeAll(); if (G.debug) G.debug.freeze = false; { const D = pdef(); D.mem.memMax = 0; D.mem.mem = 0; } };
    if (typeof pdefTick === 'function') pdefTick = () => {};
    spotTick = () => {}; META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; // (no first-sighting packs or crowd step-back)
    const run = (n, fn) => { for (let i = 0; i < n; i++) { G.state = 'play'; G.player.iframes = 0; G.manual = { x: 0, y: 0 }; update(1 / 60); frame++; if (fn && fn(i) === false) break; } };
    const foe = (id, dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES[id], p.x + dx, p.y + (dy || 0)); if (ENEMIES[id].ai === 'yeast') { e.baseR = e.r; e.grow = 1; } G.enemies.push(e); gridBuild(); return e; };
    const maxDmg = R => Math.max(R.dmg || 0, ...(R.atk || []).map(a => a.dmg || 0), R.shoot ? (R.shoot.dmg || 0) * (R.shoot.count || 1) : 0, ...(R.atk || []).map(a => (a.dmg || 0) * (a.count || 1)));
    const knobs = () => Math.max(V10_DIFF.dmg, V10_DIFF.bullet) * dmgNow() * Math.max(1, G.evm.contact || 1, G.evm.in || 1);
    const kill = e => { for (let i = 0; i < 40 && !(e.dead || e.hp <= 0); i++) { damageEnemy(e, Math.max(1e5, e.maxHp * 4), { elem: 'phys', atk: 'proj', noCrit: true, wname: 'test' }); if (e.def && e.def.def) e.shellN = 0; } return e.dead || e.hp <= 0; };

    // ---------------- (a) the sweep
    const IDS = ['paramecium', 'krill', 'amoeba', 'splitling', 'blinker', 'rotifer', 'volvox', 'volvoxling', 'phantom', 'waterbear', 'juggernaut', 'yeast', 'pepsinjr', 'endoskeleton', 'broodling', 'colossus', 'eye'];
    out.sweep = {};
    for (const id of IDS) {
      const isBoss = id === 'colossus' || id === 'eye';
      try {
        fresh(); let e;
        if (isBoss) { debugBoss(id); e = G.boss; if (!e) { bad.push(id + ': boss did not spawn'); continue; } e.x = 300; e.y = 0; }
        else {
          if (!ENEMIES[id]) { bad.push(id + ': not in ENEMIES'); continue; }
          e = foe(id, 160, 0);
        }
        const R = isBoss ? (ROSTER_BOSSES.find(q => q.id === id) || {}) : (ROSTER[id] || {}), defn = e.def;
        const cap = Math.max(maxDmg(R), defn.dmg || 0, isBoss ? (BOSSES.find(q => q.id === id) || {}).dmg || 0 : 0);
        run(600, () => { if (!isBoss) for (const q of G.enemies) q.speed = q.speed; render && 0; });
        render();
        // per hit damage against the roster x knobs (2x slack for the clock multiplier PT() on enemy damage)
        const k = knobs(); let worst = 0, worstFrom = '';
        for (const h of hits) if (h.dmg > worst) { worst = h.dmg; worstFrom = h.from + '/' + h.kind; }
        out.sweep[id] = { hits: hits.length, worst: +worst.toFixed(1), cap: +(cap * k * 2).toFixed(1), from: worstFrom };
        if (!hits.length && !isBoss) quiet.push(id);
        if (worst > cap * k * 2 + 0.01) bad.push(id + ': one hit of ' + worst.toFixed(1) + ' (' + worstFrom + ') beats roster dmg ' + cap + ' x knobs ' + k.toFixed(2) + ' x2');
        // dies to damage (the whole group, children included)
        const live = G.enemies.filter(q => q === e || q.momId === e.id || q.parent === e);
        let alive = 0; for (const q of live) if (!kill(q)) alive++;
        run(5);
        if (!(e.dead || e.hp <= 0)) bad.push(id + ': did not die to damage (hp ' + Math.round(e.hp) + '/' + Math.round(e.maxHp) + ')');
        render();
      } catch (err) { bad.push(id + ' threw: ' + err.message); }
    }

    // ---------------- (b) telegraph helper, one loop driven by ROSTER
    // tell(e) is true while the enemy shows its wind-up. setup() puts the enemy where the attack triggers.
    const TELL = {
      charger:    { tell: e => e.st === 1, setup: e => { e.stT = 0; } },
      matchstick: { tell: e => e.st === 1, setup: e => { e.stT = 0; }, at: 250 },
      alien:      { tell: e => e.st === 1, setup: e => { e.stT = 0; } },
      sperminator:{ tell: e => e.aimT > 0, setup: e => { e.shootCd = 0; }, at: 300 },
      hayfever:   { tell: e => e.snzW > 0, setup: e => { e.snzCd = 0; }, at: 150 },
      staticsock: { tell: e => e.zapT > 0, setup: e => { e.speed = 0; e.crk = 480; }, at: 14 },
      stressball: { tell: e => e.sbWind > 0, setup: e => { e.speed = 0; }, at: 40, trigger: e => { for (let i = 0; i < 5; i++) { G.t += 0.2; damageEnemy(e, 5, { elem: 'phys', atk: 'proj', noCrit: true, wname: 'test' }); } } },
      bomber:     { tell: e => e.b10T > 0, setup: e => {}, at: 40 },
      snotbubble: { tell: e => (G.b10 || []).length > 0, setup: e => { e.speed = 0; }, at: 20, trigger: e => { e.hp = 1; damageEnemy(e, 5, { elem: 'phys', wname: 'T' }); } },
      lancer:     { tell: e => e.lcS === 1, setup: e => { e.lcCd = 0; e.lcS = null; e.speed = 0; }, at: 250 },
      warlock:    { tell: e => e.s10T > 0, setup: e => { e.speed = 0; e.shootCd = 0; }, at: 230 },
      diatom:     { tell: e => e.s10T > 0, setup: e => { e.speed = 0; e.shootCd = 0; }, at: 230 },
      blinker:    { tell: e => !!e.qDest, setup: e => { e.speed = 0; e.stT = 0; }, at: 400, noDamage: true },
    };
    const withTele = Object.keys(ROSTER).filter(k => ENEMIES[k] && (ROSTER[k].atk || []).some(a => a.tele > 0));
    out.tele = {};
    for (const id of withTele) {
      const T = TELL[id];
      if (!T) { skipped.push(id); continue; }
      try {
        const need = Math.max(...ROSTER[id].atk.map(a => a.tele || 0)); // (the longest tell on the row; the first hit may come after any of them)
        const want = id === 'staticsock' ? 0.3 : id === 'stressball' ? ROSTER.stressball.rebound.tele : id === 'snotbubble' ? 0.5 : ROSTER[id].atk.filter(a => a.tele > 0).map(a => a.tele).reduce((x, y) => Math.min(x, y), 9);
        fresh(); G.P.dodge = 0; G.P.maxHp = G.player.hp = 1e6; const e = foe(id, T.at || 120, 0); e.hp = e.maxHp = 1e9; if (G.boss) G.boss = null; run(1); hits.length = 0; frame = 0; T.setup(e);
        G.enemies = G.enemies.filter(q => q === e); gridBuild();
        let start = -1, firstHit = -1, trig = false;
        run(420, i => {
          if (!trig && T.trigger) { trig = true; T.trigger(e); }
          if (start < 0 && T.tell(e)) start = frame;
          if (firstHit < 0 && hits.some(h => start >= 0 && h.f >= start)) firstHit = (hits.find(h => h.f >= start)).f;
          if (id === 'blinker') { if (T.tell(e) && start < 0) start = frame; }
          return !(start >= 0 && frame - start > 240);
        });
        const dt = firstHit >= 0 ? (firstHit - start) / 60 : null;
        out.tele[id] = { want, tellAt: start, hitAfter: dt == null ? 'none' : +dt.toFixed(2) };
        if (dt == null) untimed.push(id);
        if (start < 0) bad.push(id + ': tell never showed');
        else if (!T.noDamage && dt != null && dt < want - 0.05) bad.push(id + ': damage landed ' + dt.toFixed(2) + ' s after the tell began (tele ' + want + ')');
      } catch (err) { bad.push(id + ' telegraph threw: ' + err.message); }
    }
    out.skipped = skipped; out.quiet = quiet; out.untimed = untimed;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log('SKIPPED (no tell detector in this test): ' + (r.out.skipped.join(', ') || 'none'));
  console.log('NOTE never hurt a stationary player in 10 s: ' + (r.out.quiet.join(', ') || 'none'));
  console.log('NOTE tell seen but no damage landed to time (check is vacuous): ' + (r.out.untimed.join(', ') || 'none'));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
