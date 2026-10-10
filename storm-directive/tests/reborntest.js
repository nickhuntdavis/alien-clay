const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(400);
  const r = await page.evaluate(() => { const out = {};
    out.lockedAtStart = !profUnlocked('reborn'); out.unlockText = PROFILES.reborn.unlock.text + ' ' + PROFILES.reborn.unlock.have() + '/' + PROFILES.reborn.unlock.need;
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    // Force it on for the test.
    PROFILES.reborn.unlock.have = () => 8; META.profile = 'reborn'; UI.sample = 's001'; UI.startGame(false);
    const opts = genLoot(G.lootQueue.shift()); out.startOpts = opts.map(o => o.title);
    G.weapons = [makeSlot('dejavu', false, 10), makeSlot('ghosts', false, 10), makeSlot('karma', false, 10)];
    G.weapons[0].perks = { 5: 'rbthird', 10: 'rbgroundhog' }; G.weapons[1].perks = { 5: 'rbunfinished', 10: 'rblegion' }; G.weapons[2].perks = { 5: 'rbinstant', 10: 'rbwheel' };
    G.spells = [makeSlot('oob', true, 5), null]; G.spells[0].fork = 'b'; recomputeAll();
    G.t = 120; G.nextBoss = 1e9; const d0 = {};
    for (let f = 0; f < 60 * 30; f++) { G.player.hp = G.P.maxHp; G.state = 'play'; G.lootQueue = []; update(1 / 60 * GAME_SPEED); if (f === 600) { G.player.hp = 1; hurtPlayer(5, 'test', null, 'other'); } }
    out.dmg = Object.fromEntries(Object.entries(G.stats.dmg).filter(([k]) => /Déjà|Ghost|Karma|Out of|Second/.test(k)).map(([k, v]) => [k, Math.round(v)]));
    // Memories.
    for (const lv of [6, 14, 24, 34, 46, 56]) rebornLevel(lv);
    out.memories = G.memories + ' memMax ' + META.memMax + ' desc: ' + PROFILES.reborn.desc;
    // Loot gating.
    let sawOld = 0; for (let i = 0; i < 40; i++) if (genLoot({ kind: 'level' }).some(o => /Old Soul|Muscle Memory|Nine Lives/.test(o.title))) sawOld++;
    out.ownUpgradesOffered = sawOld + '/40';
    return out; });
  console.log(JSON.stringify(r, null, 1));
  await page.evaluate(() => { G.state = 'play'; UI.togglePause(); });
  await page.waitForTimeout(500); await page.screenshot({ path: 'reborn_you.png' });
  await page.evaluate(() => { UI.togglePause(); G.state = 'pause'; UI.show('none'); openSeq(); seqPick('reborn'); });
  await page.waitForTimeout(800); await page.screenshot({ path: 'reborn_seq.png' });
  console.log('ERRORS:', errors.length ? errors.slice(0, 4) : 'none'); await b.close();
})();
