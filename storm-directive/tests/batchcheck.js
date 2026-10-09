// Boss reward opens at once in wave mode; Feats card after the first Feat; terrain/grudge cards; reaction pair; HUD shots.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => splashEnd()); await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const out = {};
    SET.auto = false; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1; META.seenTut = {};
    UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    // 2: boss reward during an active wave
    G.wave.active = true; G.lootQueue.push({ kind: 'level' });
    const e = { def: { id: 'pepsin', name: 'X' } };
    G.lootQueue.unshift({ kind: 'relic', boss: 'pepsin', now: true });
    out.holdsWithBossReward = waveHoldsLoot();
    G.lootQueue.shift(); out.holdsWithPlainBox = waveHoldsLoot();
    G.wave.active = false; G.lootQueue.length = 0;
    // 3: no Feats card from a box; card after a Feat is taken
    out.beforeLoot = tutBeforeLoot({ kind: 'level' });
    const sp = Object.keys(SPELLS)[0]; const o = optNewSpell(sp, 0); o.apply();
    out.featsQueued = (G.tutQ || []).includes('feats');
    // 4: reaction pair, terrain, grudge
    G.tutQ = []; tutReact('neutral'); out.react = TUT_CARDS.react().what;
    META.seenTut = {}; G.tutQ = [];
    G.t = 10; const p = me(); G.terrain.list.push({ type: 'cilia', def: OBSTACLES.cilia, x: p.x + 50, y: p.y, r: 100, a: 0, charge: 0, flash: 0, seed: 1, burstT: 0 });
    tutTerrainSeen(); out.terrainQueued = G.tutQ.join(',');
    for (const k of Object.keys(TUT_CARDS)) { const c = TUT_CARDS[k](); if (!c.title || !c.name || !c.tips) out['bad_' + k] = 1; }
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  const ok = r.holdsWithBossReward === false && r.holdsWithPlainBox === true && r.beforeLoot === false && r.featsQueued && /Acid \+ Base/.test(r.react) && /tr_cilia/.test(r.terrainQueued) && !Object.keys(r).some(k => k.startsWith('bad_'));
  // screenshots: kicker card, HUD with health bar (normal and immersive), stamina ring
  await page.evaluate(() => { META.seenTut = {}; G.tutQ = []; G.state = 'play'; G.manual = null; G.tutNext = 0; tutOpen('grudge'); });
  await page.waitForTimeout(2600); await page.screenshot({ path: 'batch_card.png' });
  await page.evaluate(() => { UI.show('hud'); endBossIntro && endBossIntro(); G.state = 'play'; G.player.hp = G.P.maxHp * 0.55; G.stam.cur = G.stam.cur * 0.5; });
  await page.waitForTimeout(500); await page.screenshot({ path: 'batch_hud.png' });
  await page.evaluate(() => { SET.immersive = true; UI.applySettings(); });
  await page.waitForTimeout(500); await page.screenshot({ path: 'batch_imm.png' });
  console.log('ERRORS', JSON.stringify(errors), ok ? 'ok' : 'FAIL');
  await b.close(); process.exit(ok && !errors.length ? 0 : 1);
})();
