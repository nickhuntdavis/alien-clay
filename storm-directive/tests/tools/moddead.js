// Builds the MOD_DEAD table for web/js/moddead.js from the NO-OP lines of the modifier audit.
//   NODE_PATH=/opt/node22/lib/node_modules node tools/moddead.js [out/modaudit_r1.txt] > /tmp/table.txt
// Prints the one-line-per-weapon table body; paste it between the markers in moddead.js (or run with --write).
// Then run tests/tools/rules/importtables.js: the dealing filter is card rules now (cardrules.js), the table feeds passivefeat.js.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const A = process.argv.slice(2), file = A.find(a => !a.startsWith('--')) || path.resolve(__dirname, '../out/modaudit_r1.txt');
(async () => {
  const b = await chromium.launch(), page = await b.newPage();
  await page.goto('file://' + path.resolve(__dirname, '../../web/index.html'));
  await page.evaluate(() => (window.TUT_OFF = 1, splashEnd()));
  const names = await page.evaluate(() => Object.fromEntries(MATRIX_ONLY.weapons.map(id => [WEAPONS[id].name, id]))); await b.close();
  const dead = {}; let cur = null, base = '';
  for (const ln of fs.readFileSync(file, 'utf8').split('\n')) {
    const h = ln.match(/^(.+?) \(\w+\)(?: \+(\S+))?\s*(?:\(all visible\))?$/);
    if (h && !ln.startsWith(' ')) { cur = names[h[1]]; base = h[2] || ''; if (!cur) console.error('unknown weapon', h[1]); continue; }
    const m = ln.match(/^  NO-OP\s+(\w+)/);
    // Range and Up Close are never hidden (COMBAT_MATRIX.md 15.5, reach.js): the audit misses reach-only changes.
    if (m && cur && m[1] !== 'range' && m[1] !== 'upclose') ((dead[cur] = dead[cur] || {})[base] = dead[cur][base] || []).push(m[1]);
  }
  let out = '';
  for (const w of Object.keys(dead)) out += `  ${w}: { ${Object.keys(dead[w]).map(k => `'${k}': [${dead[w][k].map(x => `'${x}'`).join(', ')}]`).join(', ')} },\n`;
  if (A.includes('--write')) {
    const f = path.resolve(__dirname, '../../web/js/moddead.js'), s = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, s.replace(/(\/\/ TABLE START\n)[\s\S]*(\/\/ TABLE END)/, (_, a, z) => a + out + z));
  } else process.stdout.write(out);
})();
