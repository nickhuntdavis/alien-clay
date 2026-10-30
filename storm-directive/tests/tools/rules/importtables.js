// Moves the game's dealing tables into card rules (CARD_RULES.md), so the Loadout Planner can edit them:
//   node tests/tools/rules/importtables.js            (rewrites the audit, matrix and delivery rules; keeps every other rule)
// Reads the tables as the game applies them (with the tables in charge: CARD_RULES_OWNS off while reading):
//   MOD_DEAD (moddead.js, including the Delivery weapons' aliased rows and MOD_LIVE_WITH's exceptions) -> src 'audit'
//   MATRIX_NA (matrixna.js, with Knockback's Ranged exception)                                      -> src 'matrix'
//   DLV.deny (dlvrun.js)                                                                              -> src 'delivery'
// Rerun after `tests/tools/moddead.js --write` refreshes the audit table. Rules from the planner (no src) are kept as they are.
const { chromium } = require(process.env.NODE_PATH ? 'playwright' : '/opt/node22/lib/node_modules/playwright');
const path = require('path'), RF = require('./rulesfile');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + path.resolve(__dirname, '../../../web/index.html')); await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const out = [], ids = new Set(MATRIX_ONLY.weapons.filter(id => WEAPONS[id])), ok = id => !!MODS10[id];
    for (const [wid, forms] of Object.entries(MOD_DEAD)) if (ids.has(wid)) for (const [form, mods] of Object.entries(forms)) for (const id of mods) if (ok(id)) {
      const live = (MOD_LIVE_WITH[wid] || {})[id] || [];
      const r = { parent: 'w:' + wid, mode: 'dont', target: 'm:' + id, scope: 'weapon', src: 'audit' };
      r.form = form; // (the weapon's first Delivery modifier, '' for none: moddead.js modDeliveryOf)
      if (live.length) r.unless = live.map(x => 'm:' + x); // (MOD_LIVE_WITH: another card wakes it)
      out.push(r);
    }
    for (const [wid, mods] of Object.entries(MATRIX_NA)) if (ids.has(wid)) for (const id of mods) if (ok(id)) {
      const r = { parent: 'w:' + wid, mode: 'dont', target: 'm:' + id, scope: 'weapon', src: 'matrix' };
      if (id === 'knock' && ['v_phys_burst', 's_lard', 'v_phys_contact'].includes(wid)) r.unless = ['m:ranged']; // (matrixna.js: Ranged replaces the snap and the pulse)
      out.push(r);
    }
    for (const [wid, mods] of Object.entries(DLV.deny || {})) if (ids.has(wid)) for (const id of mods) if (ok(id)) out.push({ parent: 'w:' + wid, mode: 'dont', target: 'm:' + id, scope: 'weapon', src: 'delivery' });
    return out;
  });
  await b.close();
  const cur = RF.read(), keep = cur.rules.filter(x => !['audit', 'matrix', 'delivery'].includes(x.src));
  let n = 0; const fresh = r.map(x => Object.assign({ id: (x.src[0]) + (++n) }, x));
  const f = RF.write(keep.concat(fresh), Object.assign({}, cur.owns, { audit: true, matrix: true, delivery: true }), 'imported the audit, matrix and delivery tables');
  const by = {}; for (const x of fresh) by[x.src] = (by[x.src] || 0) + 1;
  console.log(f + '\n  kept ' + keep.length + ' planner rules; imported ' + JSON.stringify(by));
})();
