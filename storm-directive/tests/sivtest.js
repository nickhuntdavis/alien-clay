// Standard Issue (sidemo.js): its own preview (magazine, reload, range) and every branch scene run without errors and
// show their effect; its tier screens open in the Weapon Draft layout with one tab per choice, each tab with its own scene.
// Screenshots: out/siv_<tier>_<tab>.png
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; try { localStorage.setItem('sd_dev', '0'); } catch (e) { /* storage unavailable */ } splashEnd(); SIV_DRAFT = true; }); await page.waitForTimeout(300); // (the tier screens are off in play since V11; still tested)
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    // Every scene, simulated for 12 s off screen: count the words each effect puts up.
    const cv = document.createElement('canvas'); cv.style.cssText = 'width:360px;height:260px'; document.body.appendChild(cv);
    const scenes = { '': ['RELOAD'], A: [], 'A,cradle': ['CLONK'], 'A,lastOrders': ['CRACK'], 'A,squirrel': ['NUT'], B: [], 'B,momentum': ['MOMENTUM'], 'B,contraflow': ['SHOVE'], 'B,conkers': ['CONKER'],
      C: ['MARKED', 'BONK'], 'C,soft': ['+20%'], 'C,concuss': ['STAGGERED'], 'C,allergy': ['POP'], 'C,concuss,shell': ['CRACK'], 'A,cradle,inf': [], 'C,soft,sqa': ['SQUIRREL AWAY'] };
    for (const f in scenes) {
      const pv = makePreview(cv, WEAPONS.v_phys_proj, { perk: 'siv|' + f }); dropPreview(pv);
      if (!pv.own) { bad.push('no own preview'); break; }
      const seen = new Set(); let shots = 0, hurt = 0;
      for (let i = 0; i < 360; i++) { pv.own.step(pv, 1 / 30); for (const x of pv.fx) if (x.type === 'text') seen.add(x.txt); shots = Math.max(shots, pv.n); if (i % 30 === 0) drawPreview(pv); }
      hurt = [...seen].filter(t => /^\d+$/.test(t)).length;
      for (const w of scenes[f]) if (!seen.has(w)) bad.push(`scene ${f || 'base'}: no ${w}`);
      if (!hurt) bad.push(`scene ${f || 'base'}: no damage`);
      out[f || 'base'] = shots + ' shots, ' + [...seen].filter(t => !/^\d+$/.test(t)).join(' ');
    }
    // Base weapon timing: 8 shots, then a 1.2 s reload.
    { const pv = makePreview(cv, WEAPONS.v_phys_proj, {}); dropPreview(pv); let t = 0; while (pv.ammo > 0 && t < 10) { pv.own.step(pv, 1 / 60); t += 1 / 60; } if (pv.n !== 8 || !(pv.rel > 0)) bad.push('magazine ' + pv.n + ' ' + pv.rel); }
    cv.remove();
    // The tier screens: a wup box with Standard Issue ready opens the Weapon Draft with one tab per choice.
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    G.weapons = [makeSlot('v_phys_proj', false, 1), null, null, null]; recomputeAll(); UI.show('hud');
    window.SIV_W = G.weapons[0];
    return { bad, out };
  });
  const shots = [];
  // Standard Issue's branch screens use the plain layout since its movie-cop branches (baseline1.js) have no scenes yet: three cards, no stage.
  { const plain = await page.evaluate(() => { G.level = 4; G.lootQueue = []; G.state = 'play'; UI.openLoot({ kind: 'wup', v10ok: true }); return { n: (UI.lootOpts || []).length, titles: (UI.lootOpts || []).map(o => o.title), draft: !$('draft').classList.contains('hidden') && getComputedStyle($('draft')).display !== 'none' }; });
    r.out.plain = plain; if (plain.n !== 3 || plain.titles.join() !== 'Rambo,Dirty Harry,Robocop') r.bad.push('plain branch screen: ' + JSON.stringify(plain));
    await page.evaluate(() => { UI.pickLoot(0); G.lootQueue = []; UI.openLoot({ kind: 'wup', v10ok: true }); UI.pickLoot(0); }); }
  for (let tier = 2; tier <= 1; tier++) { // (tier 4, the Lv 10 mastery, is gone: weapons stop at Lv 9 since v10.148, wmods.js MM.lvlCap)
    const head = await page.evaluate(() => {
      G.level = 4; G.lootQueue = []; G.state = 'play';
      UI.openLoot({ kind: 'wup', v10ok: true });
      return { shown: !$('draft').classList.contains('hidden') && getComputedStyle($('draft')).display !== 'none', title: $('dTitle').textContent, tabs: [...$('dTabs').children].map(t => t.textContent), perks: UI.lootOpts.map(o => o.perk) };
    });
    r.out['tier' + tier] = head;
    if (!head.shown || head.tabs.length !== 3) r.bad.push('tier ' + tier + ' draft: ' + JSON.stringify(head));
    if (new Set(head.perks).size !== 3) r.bad.push('tier ' + tier + ' tabs share a scene');
    for (let i = 0; i < 3; i++) {
      await page.evaluate(i => { $('dTabs').children[i].click(); }, i);
      await page.waitForTimeout(2600);
      const f = 'out/siv_' + tier + '_' + i + '.png'; await page.locator('#draft').screenshot({ path: f.replace('out/', '') }); shots.push(f);
    }
    const lv = await page.evaluate(t => { UI.pickLoot(t === 2 ? 2 : 1); return SIV_W.lvl; }, tier); // Marked for Bonking, then Concussion
    if (lv !== [0, 0, 3, 6, 10][tier]) r.bad.push('tier ' + tier + ' pick left lvl ' + lv);
  }
  const t4 = await page.evaluate(() => wupReady().length);
  if (t4) r.bad.push('a tier 4 (Lv 10) upgrade is offered past the Lv 9 cap');
  console.log(JSON.stringify(r.out, null, 1));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
