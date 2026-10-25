// Weapon tags (COMBAT_MATRIX.md 15.1): every weapon has base tags from the fixed vocabulary, attack-type tags are exclusive,
// Pool weapons place, and a live modifier (Mines) adds a tag.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], four = ['shots', 'beam', 'burst', 'melee'];
    for (const id of W24_IDS) {
      const tags = WTAGS[id];
      if (!tags) { bad.push('no tags ' + id); continue; }
      for (const t of tags) if (!WTAG_IDS.includes(t)) bad.push(id + ' bad tag ' + t);
      const n = four.filter(t => tags.includes(t)).length, atk = W24_BY[id].atk;
      if (atk === 'pool') { if (n || !tags.includes('places')) bad.push(id + ' pool tags ' + tags); }
      else if (n !== 1) bad.push(id + ' attack tags ' + n);
    }
    META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play';
    G.weapons = [makeSlot('v_phys_proj', false, 9), null, null];
    const w = G.weapons[0];
    const before = wHas(w, 'places');
    if (before) bad.push('places before mines');
    modAdd(w, 'mines') || w.m10.push('mines'); computeStats(w);
    if (!wHas(w, 'places')) bad.push('no places after mines');
    if (!wHas(w, 'shots') || wHas(w, 'beam')) bad.push('base tags lost');
    return { bad, n: W24_IDS.length, tags: [...wTags(w)] };
  });
  const fails = r.bad.concat(errors.map(e => 'page error ' + e));
  console.log(fails.length ? 'FAIL wtags ' + fails.join('; ') : 'PASS wtags (' + r.n + ' weapons, ' + r.tags.join('/') + ')');
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
