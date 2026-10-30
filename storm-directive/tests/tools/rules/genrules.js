// Writes web/js/cardrules.js from rules saved in the Loadout Planner (CARD_RULES.md).
//   node tests/tools/rules/genrules.js <rules.json>        (an array of rules, or { rules: [...] } as the planner's database doc holds)
// Every rule is checked against the live game: both keys must resolve (crKnown), mode and scope must be valid, a weight needs k.
// Rules that fail are listed and left out. Contradictions (a pair in both Do and Don't) stop the write.
const { chromium } = require(process.env.NODE_PATH ? 'playwright' : '/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs'), RF = require('./rulesfile');
(async () => {
  const src = process.argv[2]; if (!src) { console.log('usage: node genrules.js <rules.json>'); process.exit(1); }
  let rules = JSON.parse(fs.readFileSync(src, 'utf8')); if (!Array.isArray(rules)) rules = rules.rules || [];
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + path.resolve(__dirname, '../../../web/index.html')); await page.waitForTimeout(600);
  const r = await page.evaluate(rules => {
    const ok = [], bad = [];
    for (const x of rules) {
      const why = [];
      if (!crKnown(x.parent) || /^tag:/.test(x.parent)) why.push('parent ' + x.parent);
      if (!crKnown(x.target)) why.push('target ' + x.target);
      if (!['do', 'dont', 'weight'].includes(x.mode)) why.push('mode ' + x.mode);
      if (!['weapon', 'run'].includes(x.scope || 'weapon')) why.push('scope ' + x.scope);
      if (x.mode === 'weight' && !(+x.k >= 0)) why.push('k ' + x.k);
      if (x.sample && !crKnown('s:' + x.sample)) why.push('sample ' + x.sample);
      if (x.branch && !crKnown(x.branch)) why.push('branch ' + x.branch);
      for (const k of [].concat(x.with || [], x.unless || [])) if (!crKnown(k)) why.push('condition ' + k);
      if (x.form != null && x.form !== '' && !MODS10[x.form]) why.push('form ' + x.form);
      const clean = { id: x.id, parent: x.parent, mode: x.mode, target: x.target, scope: x.scope || 'weapon' };
      if (x.mode === 'weight') clean.k = +x.k; if (x.sample) clean.sample = x.sample; if (x.branch) clean.branch = x.branch;
      if (x.src) clean.src = x.src; if (x.form != null) clean.form = x.form; if (x.with) clean.with = x.with; if (x.unless) clean.unless = x.unless;
      (why.length ? bad : ok).push(why.length ? { rule: x, why: why.join(', ') } : clean);
    }
    const clash = ok.filter(a => a.mode !== 'weight' && ok.some(o => o !== a && o.mode !== 'weight' && o.mode !== a.mode && ((o.parent === a.parent && o.target === a.target) || (o.parent === a.target && o.target === a.parent))));
    return { ok, bad, clash: clash.map(a => crName(a.parent) + ' / ' + crName(a.target)), names: ok.map(a => a.mode + ': ' + crName(a.parent) + ' -> ' + crName(a.target) + (a.k != null ? ' x' + a.k : '') + ' (' + a.scope + (a.sample ? ', ' + a.sample : '') + (a.branch ? ', if ' + crName(a.branch) : '') + ')') };
  }, rules);
  await b.close();
  for (const x of r.bad) console.log('LEFT OUT', x.why, JSON.stringify(x.rule));
  if (r.clash.length) { console.log('CONTRADICTIONS (nothing written):', [...new Set(r.clash)].join('; ')); process.exit(1); }
  const out = RF.write(r.ok, RF.read().owns, 'saved from the Loadout Planner');
  console.log(out + '\n  ' + r.ok.length + ' rules written, ' + r.bad.length + ' left out');
  for (const n of r.names) console.log('  ' + n);
})();
