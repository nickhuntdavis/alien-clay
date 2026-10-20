// v10 test build (v10.js): one sample card; a 4-card start draft from the 42-weapon matrix; level-ups offer only
// Switched at Birth, one card a wave (same attack type, new damage type); other boxes are dropped; every one of the 42 weapons
// deals damage; Fire leaves Burning; no automatic reactions.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { localStorage.removeItem('sd_dev'); window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.click('#playBtn'); await page.waitForTimeout(300);
  const cards = await page.evaluate(() => [...document.querySelectorAll('#sampleList [data-s10]')].map(b => b.textContent));
  await page.screenshot({ path: 'v10_samples.png' });
  const bad = [];
  const NAMES = ['Baseline', 'Alpha', 'Beta', 'Private Schooled', 'Ordered Online', 'Redtail', 'Prawn Again', 'Not of This World'];
  const nine = await page.evaluate(() => typeof S10_BY.acro !== 'undefined'); // (PROPOSED Sample 9, acrosample.js, is a ninth card while it is loaded)
  if (cards.length !== (nine ? 9 : 8) || NAMES.some((n, i) => !cards[i].includes(n) || /LOCKED/.test(cards[i]))) bad.push('samples screen: ' + JSON.stringify(cards)); // (the eight samples, all open: samples10.js)
  await page.click('#sampleList [data-s10="baseline"]'); await page.waitForTimeout(300);
  const modes = await page.evaluate(() => [...document.querySelectorAll('#sampleList [data-mode]')].map(b => b.dataset.mode));
  if (modes.join() !== 's002,s001,s006,s007') bad.push('experiments: ' + modes); // (v10.35: the Petri Dish, The Race, Endless and Level 1)
  await page.click('#sampleList [data-mode="s001"]'); await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    out.seq = G.genes.primary; out.sample = UI.sample; out.mode = !!G.wave;
    if (out.seq !== 's10_baseline' || out.sample !== 's001' || G.wave) bad.push('run: ' + JSON.stringify(out));
    const ids = Object.keys(WEAPONS).filter(id => WEAPONS[id].v10 && !WEAPONS[id].sig);
    if (ids.length !== (typeof S10_BY.acro !== 'undefined' ? 45 : 42)) bad.push('weapons: ' + ids.length); // (PROPOSED Sample 9 brings three starters: acro.js)
    const st = genLoot({ kind: 'start' });
    if (st.map(o => o.def.name).join() !== w24Starters('baseline').map(id => WEAPONS[id].name).join() || st.length !== 3) bad.push('start draft is not the three Baseline starters: ' + st.map(o => o.title)); // (weapons24.js)
    st[0].apply();
    const w0 = G.weapons.find(Boolean);
    const lv = genLoot({ kind: 'level' });
    if (lv.length !== 3) bad.push('level box: ' + lv.map(o => o.tag + ' ' + o.title)); // (one draft: draft.js)
    out.switch = lv.map(o => o.tag + ' ' + o.title);
    v10Switch()[0].apply();
    const w1 = G.weapons.find(Boolean);
    if (w1.def.v10atk !== w0.def.v10atk || w1.def.v10type === w0.def.v10type) bad.push('switch: ' + w0.id + ' -> ' + w1.id);
    if (!v10Box({ kind: 'level' }) || !v10Box({ kind: 'level' })) bad.push('wave mode: level boxes queue for the break, none dropped');
    for (const k of ['relic', 'vesicle', 'splice', 'myth']) if (v10Box({ kind: k })) bad.push('box not dropped: ' + k);
    const sl = genLoot({ kind: 'slot' });
    if (sl.length !== 3 || sl.some(o => !o.c10 && o.def.v10atk === w1.def.v10atk) || sl.filter(o => o.c10).length > 1) bad.push('slot draft: ' + sl.map(o => o.title + (o.c10 ? ' (combo partner)' : ''))); // (one card may be a combo partner of any attack type: combos10.js)
    // Every weapon deals damage on its own.
    const def = ENEMIES.chaser || Object.values(ENEMIES)[0], rows = [];
    for (const id of ids) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.stats.reactions = 0;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 70 + (i % 3) * 60; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); }
      let burnt = false;
      try { for (let f = 0; f < 300; f++) { update(1 / 60); if (G.enemies.some(e => e.v10burn > 0 || (e.cd && e.cd.burnT > 0))) burnt = true; } } catch (err) { bad.push(id + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
      const dealt = Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
      if (!(dealt > 0)) bad.push(id + ': no damage');
      if (WEAPONS[id].elem === 'flame' && !burnt) bad.push(id + ': no Burning');
      if (G.stats.reactions) bad.push(id + ': reactions ' + G.stats.reactions);
      rows.push(WEAPONS[id].name + ' ' + Math.round(dealt / 5) + '/s');
    }
    // Mixed types on one enemy: still no reactions.
    newGame(); G.state = 'play'; G.stats.reactions = 0;
    const e = makeEnemy(def, G.player.x + 80, G.player.y); e.hp = e.maxHp = 1e5; G.enemies.push(e);
    for (const el of ['fire', 'shock', 'ice', 'arcane', 'soul', 'flame']) damageEnemy(e, 5, { elem: el, wname: 'test' });
    if (G.stats.reactions) bad.push('mixed types reacted: ' + G.stats.reactions);
    out.rows = rows;
    return { bad, out };
  });
  bad.push(...r.bad);
  console.log(JSON.stringify(r.out.switch)); console.log(r.out.rows.join(' | '));
  if (bad.length) console.log('FAIL', bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
})();
