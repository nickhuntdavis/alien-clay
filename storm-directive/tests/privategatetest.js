// Private Schooled's gated cards (cardrules.js g12 to g15): dealt only to a Private Schooled run holding the branch, never without it, never to another sample.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const scene = (wid, sample) => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.s10 = Object.assign({}, G.s10 || {}, { id: sample });
      G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); return G.weapons[0]; };
    const take = (w, L) => { const cs = genLoot({ kind: 'fork', w, lv: 3 }), S = WUP[w24Key(w)], c = cs.find(x => S && S[L] && x.title === S[L].name); if (!c) throw new Error('no ' + L + ' card: ' + cs.map(x => x.title)); c.apply(); };
    for (const [wid, L, card, other] of [['v_fire_proj', 'B', 'feat_pv_card', 'A'], ['v_soul_proj', 'B', 'feat_pv_expelled', 'C'], ['v_soul_proj', 'A', 'pass_pv_signet', 'B'], ['s_redtape', 'C', 'pass_pv_immunity', 'A']]) {
      const c = CARDS.find(x => x.id === card); if (!c) { bad.push('no card ' + card); continue; }
      let w = scene(wid, 'private'); if (cardOk(c)) bad.push(card + ' dealt with no branch');
      take(w, other); if (cardOk(c)) bad.push(card + ' dealt on branch ' + other);
      w = scene(wid, 'private'); take(w, L); out[card] = cardOk(c); if (!cardOk(c)) bad.push(card + ' not dealt on its branch ' + L);
      w = scene(wid, 'baseline'); try { take(w, L); } catch (e) { } if (cardOk(c)) bad.push(card + ' dealt to Baseline');
    }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out)); if (errors.length) r.bad.push('ERRORS ' + errors.slice(0, 3).join(' | '));
  if (r.bad.length) { console.log('FAIL ' + r.bad.join('; ')); process.exitCode = 1; } await b.close();
})();
