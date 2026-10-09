const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    const out = { unlock: PROFILES.redtail.unlock.text + ' have ' + PROFILES.redtail.unlock.have() };
    const start = () => { META.profile = 'redtail'; DAILY.on = true; UI.sample = 's001'; newGame(); DAILY.on = false; META.profile = 'vanguard'; UI.show('hud'); G.state = 'play'; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e5; G.player.hp = 1e5; G.player.x = 700; G.player.y = 300; };
    start();
    out.startDraft = genLoot({ kind: 'start' }).map(o => o.title).join(', ');
    // banes: 40 level ups
    const lv0 = G.level; G.lootQueue = []; for (let i = 0; i < 40; i++) gainXp(G.xpNeed * 1.01 / (XP_PACE * G.P.xp * G.evm.xp * puXp()));
    out.banes = JSON.stringify(G.banes); out.levels = G.level - lv0;
    out.levelBoxMinRarity = Math.min(...Array.from({ length: 30 }, () => Math.min(...genLoot({ kind: 'level' }).filter(o => !o.cursed).map(o => o.rarity))));
    // weapons and sigs
    const fight = (id, perks) => { start(); const w = makeSlot(id, false, 10); w.perks = perks; G.weapons = [w, null, null]; recomputeAll(); G.enemies.length = 0;
      for (let i = 0; i < 40; i++) { const a = i * 0.5, d = 120 + (i % 5) * 50; const e = makeEnemy(ENEMIES.brute, 700 + Math.cos(a) * d, 300 + Math.sin(a) * d); e.hp = e.maxHp = 3000; G.enemies.push(e); } gridBuild(); G.stats.dmg = {};
      for (let f = 0; f < 360; f++) { G.lootQueue = []; G.player.hp = 1e5; update(1 / 60); G.state = 'play'; }
      return Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ':' + Math.round(v)).join(' '); };
    out.wedding_a = fight('wedding', { 5: 'rtrice', 10: 'rtreception' });
    out.wedding_b = fight('wedding', { 5: 'rtboth', 10: 'rtelope' });
    out.moon_a = fight('moonshine', { 5: 'rtproof', 10: 'rtbadbatch' });
    out.moon_b = fight('moonshine', { 5: 'rtstill', 10: 'rthooch' });
    out.banjo_a = fight('banjo', { 5: 'rtpick', 10: 'rthoedown' });
    out.banjo_b = fight('banjo', { 5: 'rtduel', 10: 'rtencore' });
    // Sister-Cousin
    start(); G.weapons = [makeSlot('wedding', false, 3), null, null]; recomputeAll(); G.genes.abilT = 0;
    let splits = 0; for (let i = 0; i < 40 && !G.cousin; i++) { G.player.iframes = 0; hurtPlayer(5, 'test', null, 'contact'); G.genes.abilT = 0; splits++; }
    out.cousinAfterHits = !!G.cousin + ' after ' + splits;
    for (let f = 0; f < 90; f++) { G.lootQueue = []; update(1 / 60); G.state = 'play'; }
    const C = G.cousin; out.cousinDist = C ? Math.round(Math.hypot(C.x - G.player.x, C.y - G.player.y)) : 'gone';
    if (C) { G.player.x = C.x; G.player.y = C.y; } update(1 / 60);
    out.recombined = !G.cousin && G.familyT > G.t;
    out.manualTap = (() => { G.genes.abilT = 0; G.cousin = null; abilityTap(); return !!G.cousin; })();
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await page.evaluate(() => { for (let f = 0; f < 30; f++) { G.lootQueue = []; update(1 / 60); G.state = 'play'; } for (let i = 0; i < 20; i++) G.enemies.push(makeEnemy(ENEMIES.brute, G.player.x + 150 + i * 10, G.player.y + (i % 4) * 40)); G.weapons = [makeSlot('banjo', false, 5), makeSlot('moonshine', false, 5), makeSlot('wedding', false, 5)]; recomputeAll(); for (let f = 0; f < 50; f++) { G.lootQueue = []; update(1 / 60); G.state = 'play'; } ZOOM.z = 1.5; S = S0 * 1.5; });
  await page.waitForTimeout(300); await page.screenshot({ path: 'redtail.png' });
  console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
