'use strict';
// node build.js out.json  -> adds tab, repeats and code-flag columns, ready for xlsx.py
const fs = require('fs'), { exportAll } = require('./extract.js'), { tabOf } = require('./areas.js');
const rows = exportAll();
const seen = {}; rows.forEach(r => (seen[r.text.trim().toLowerCase()] = seen[r.text.trim().toLowerCase()] || []).push(r));
rows.forEach(r => {
  r.id = r.file.replace(/^js\//, '').replace(/\.(js|html)$/, '') + '#' + r.n; r.tab = tabOf(r);
  const o = seen[r.text.trim().toLowerCase()].filter(x => x !== r);
  r.repeats = o.length ? o.length + ' more: ' + o.slice(0, 3).map(x => x.file.replace('js/', '') + ':' + x.line).join(', ') + (o.length > 3 ? ' ...' : '') : '';
  const warn = [];
  if (/\$\{/.test(r.text)) warn.push('Contains ${...} code: keep it exactly');
  if (/<[a-z\/][^>]*>/i.test(r.text)) warn.push('Contains <tags>: keep them');
  if (r.kind === 'tpl') warn.push('Built text (backticks)');
  r.note = warn.join('. ');
});
rows.sort((a, b) => a.tab.localeCompare(b.tab, undefined, { numeric: true }) || (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));
fs.writeFileSync(process.argv[2], JSON.stringify(rows));
const c = {}; rows.forEach(r => c[r.tab] = (c[r.tab] || 0) + 1); console.log(JSON.stringify(c));
