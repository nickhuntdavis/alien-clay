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
  const cards = await page.evaluate(() => [...document.querySelectorAll('#sampleList [data-v10]')].map(b => b.textContent));
  await page.screenshot({ path: 'v10_samples.png' });
  const bad = [];
  if (cards.length !== 2 || !/Wave Mode/.test(cards[0]) || !/Regular Mode/.test(cards[1])) bad.push('samples screen: ' + JSON.stringify(cards));
  await page.click('#sampleList [data-v10]'); await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    out.seq = G.genes.primary; out.sample = UI.sample; out.mode = !!G.wave;
    if (out.seq !== 'human1' || out.sample !== 's002' || !G.wave) bad.push('run: ' + JSON.stringify(out));
    const ids = Object.keys(WEAPONS).filter(id => WEAPONS[id].v10);
    if (ids.length !== 42) bad.push('weapons: ' + ids.length);
    const st = genLoot({ kind: 'start' });
    if (st.length !== 4 || st.some(o => !o.def.v10)) bad.push('start draft: ' + st.map(o => o.title));
    st[0].apply();
    const w0 = G.weapons.find(Boolean);
    const lv = genLoot({ kind: 'level' });
    if (lv.length !== 3 || lv[0].tag !== 'SWITCHED AT BIRTH' || lv.slice(1).some(o => o.tag !== 'DEFENCE')) bad.push('level box: ' + lv.map(o => o.tag + ' ' + o.title)); // (Switched at Birth plus two defence cards: pdef.js)
    out.switch = lv.map(o => o.title);
    lv[0].apply();
    const w1 = G.weapons.find(Boolean);
    if (w1.def.v10atk !== w0.def.v10atk || w1.def.v10type === w0.def.v10type) bad.push('switch: ' + w0.id + ' -> ' + w1.id);
    G.v10sw = null; if (!v10Box({ kind: 'level' }) || v10Box({ kind: 'level' })) bad.push('one level box a wave');
    for (const k of ['chest', 'boss', 'relic', 'vesicle', 'splice', 'myth']) if (v10Box({ kind: k })) bad.push('box not dropped: ' + k);
    const sl = genLoot({ kind: 'slot' });
    if (sl.length !== 3 || sl.some(o => o.def.v10atk === w1.def.v10atk)) bad.push('slot draft: ' + sl.map(o => o.title));
    // Every weapon deals damage on its own.
    const def = ENEMIES.chaser || Object.values(ENEMIES)[0], rows = [];
    for (const id of ids) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.stats.reactions = 0;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 70 + (i % 3) * 60; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); }
      let burnt = false;
      try { for (let f = 0; f < 300; f++) { update(1 / 60); if (G.enemies.some(e => e.v10burn > 0)) burnt = true; } } catch (err) { bad.push(id + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
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
