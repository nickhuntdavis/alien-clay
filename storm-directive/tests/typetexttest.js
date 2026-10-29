const { chromium } = require('playwright');
// typetext.js: damage-type words, weapon and Feat names, the "For weapon:" line, the Armoury sub line, the Feat upgrade "what it does" line, rarity left border.
(async () => {
  const b = await chromium.launch(); const errors = []; const out = [];
  const ok = (name, cond, extra) => { out.push((cond ? 'ok   ' : 'FAIL ') + name + (cond ? '' : ' ' + JSON.stringify(extra))); };
  for (const menus of ['paper', 'ink']) {
    const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
    await page.evaluate(m => {
      META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
      SET.autoWaves = false; SET.auto = false; SET.menus = m; UI.applySettings(); UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
      G.weapons[0] = makeSlot('v_phys_proj', false, 3); G.weapons[1] = makeSlot('v_fire_proj', false, 1); G.spells[0] = makeSlot('f10_little_bubble', true, 1); recomputeAll();
      window.__orig = window.genLoot;
      window.genLoot = () => [
        { rarity: 1, tag: 'MODIFIER', icon: 'x', color: '#fff', title: 'Charge-Up', sub: 'Rank 1', desc: 'Corrosion fills 25% faster. Fire rate is untouched.', modFor: 'Acid Spit', elem: 'fire', apply() {} },
        { rarity: 4, tag: 'MODIFIER', icon: 'x', color: '#fff', title: 'Pop', sub: 'Rank 1', desc: 'Plain text.', modFor: 'Standard Issue', elem: 'phys', apply() {} },
        cardOpt(CARDS.find(c => c.id === 'feat_little_bubble_up')), optNewWeapon('v_arcane_proj', 2)];
      UI.openLoot({ kind: 'chest' });
    }, menus);
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('#lootCards .card')], cs = e => getComputedStyle(e);
      const tyw = cards[0].querySelector('.cdesc .tyw'), cfor = cards[0].querySelector('.cfor'), cforB = cards[0].querySelector('.cfor b');
      return { tyw: tyw && [tyw.textContent, cs(tyw).color], fireRateTinted: [...cards[0].querySelectorAll('.cdesc .tyw')].map(e => e.textContent),
        cfor: [cs(cfor).fontSize, cs(cforB).fontSize, cs(cforB).color, cs(cforB).fontWeight], forForce: cs(cards[1].querySelector('.cfor b')).color,
        borders: cards.map(c => [cs(c).borderLeftWidth, cs(c).borderLeftColor]), what: (cards[2].querySelector('.cwhat') || {}).textContent, does: F10.little_bubble.does,
        pricks: (() => { const pr = document.createElement('span'); pr.style.color = 'var(--color-type-blood)'; document.body.appendChild(pr); const want = cs(pr).color; pr.remove(); return [cs(cards[3].querySelector('.ctitle')).color, want]; })() };
    });
    ok(menus + ' Corrosion tinted acid', r.tyw && r.tyw[0] === 'Corrosion' && /var|rgb/.test(r.tyw[1]) && r.tyw[1] !== 'rgb(30, 30, 30)', r.tyw);
    ok(menus + ' "Fire rate" not tinted', !r.fireRateTinted.includes('Fire'), r.fireRateTinted);
    ok(menus + ' For weapon: same size, bold', r.cfor[0] === r.cfor[1] && r.cfor[3] >= 600, r.cfor);
    ok(menus + ' weapon name takes type colour', r.cfor[2] === r.tyw[1], [r.cfor[2], r.tyw[1]]);
    ok(menus + ' left border 4px, rarity coloured', r.borders.every(x => x[0] === '4px') && r.borders[0][1] !== r.borders[1][1], r.borders);
    ok(menus + ' Feat upgrade leads with what it does', r.what && r.what === r.does, [r.what, r.does]);
    ok(menus + ' new-weapon card title in its type colour', r.pricks[0] === r.pricks[1], r.pricks);
    await page.evaluate(() => { window.genLoot = window.__orig; G.state = 'play'; UI.openArmoury('L', 0); }); await page.waitForTimeout(700);
    const t = await page.evaluate(() => [...document.querySelectorAll('#armBody .lon b')].map(e => [e.textContent, getComputedStyle(e).color, e.classList.contains('tyn')]));
    const acid = t.find(x => x[0] === 'Acid Spit'); ok(menus + ' Tackle Box weapon name tinted', acid && acid[2] && acid[1] === r.tyw[1], t);
    await page.evaluate(() => { G.state = 'play'; UI.openArmoury('w', 1); }); await page.waitForTimeout(700);
    const s = await page.evaluate(() => { const a = document.querySelector('#armBody .asub'); return a && [a.textContent, a.querySelector('b') && getComputedStyle(a.querySelector('b')).color]; });
    ok(menus + ' Armoury sub line: type name, no "weapon"', s && !/weapon/.test(s[0]) && /Acid/.test(s[0]) && s[1] === r.tyw[1], s);
    await page.close();
  }
  console.log(out.join('\n')); console.log(out.some(l => l.startsWith('FAIL')) ? 'FAIL typetext' : 'typetext OK', 'ERRORS', errors.length ? errors.slice(0, 3) : '[]'); await b.close();
})();
