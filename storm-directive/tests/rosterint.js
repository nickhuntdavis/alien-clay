// Roster integrity (ENEMY_HANDOFF.md E3), plain node, no browser: reads the game's source files.
//   every ROSTER `ai` has a FOE_AI entry or a `case '<ai>'` in game.js's AI switch (or is a plain id the switch handles by `default`),
//   every ROSTER `shape` has a MICROBES entry or a `case '<shape>'` in render.js,
//   no table (ENEMIES, ROSTER, BOSSES, FOE_AI, MICROBES) defines a key twice (the later one silently wins).
// Run: NODE_PATH=/opt/node22/lib/node_modules node tests/rosterint.js     Exit 1 on any finding.
const fs = require('fs'), path = require('path');
const ts = require('typescript');
const JS = path.resolve(__dirname, '../web/js');
const files = fs.readdirSync(JS).filter(f => f.endsWith('.js'));
const src = {}; for (const f of files) src[f] = fs.readFileSync(path.join(JS, f), 'utf8');
const bad = [];
const BASE_AI = new Set(['chase']); // (no case: the base steering in game.js is the chase)
const keyOf = n => n.name && (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name) || ts.isNumericLiteral(n.name)) ? n.name.text : null;
// every top-level `const NAME = {...}` / `[...]` and every `Object.assign(NAME, {...})` / `NAME.k = ...` that extends a table
const parsed = {}; for (const f of files) parsed[f] = ts.createSourceFile(f, src[f], ts.ScriptTarget.ES2020, true);
const keys = (table) => { // [{key, file}] in load order of every literal key defined for the table
  const out = [];
  for (const f of files) {
    const sf = parsed[f];
    const take = lit => { if (lit && ts.isObjectLiteralExpression(lit)) for (const p of lit.properties) { const k = keyOf(p); if (k != null) out.push({ key: k, file: f, line: sf.getLineAndCharacterOfPosition(p.getStart()).line + 1 }); } };
    const takeArr = lit => { if (lit && ts.isArrayLiteralExpression(lit)) for (const el of lit.elements) if (ts.isObjectLiteralExpression(el)) { const p = el.properties.find(q => keyOf(q) === 'id'); if (p && ts.isPropertyAssignment(p) && ts.isStringLiteral(p.initializer)) out.push({ key: p.initializer.text, file: f, line: sf.getLineAndCharacterOfPosition(p.getStart()).line + 1 }); } };
    sf.forEachChild(n => {
      if (ts.isVariableStatement(n)) for (const d of n.declarationList.declarations) if (d.name.getText() === table && d.initializer) { take(d.initializer); takeArr(d.initializer); }
    });
  }
  return out;
};
const dups = (table) => { const seen = {}; for (const k of keys(table)) { if (seen[k.key]) bad.push(`duplicate key ${table}.${k.key}: ${seen[k.key]} and ${k.file}:${k.line}`); else seen[k.key] = `${k.file}:${k.line}`; } return Object.keys(seen); };
const T = {}; for (const t of ['ENEMIES', 'ROSTER', 'BOSSES', 'FOE_AI', 'MICROBES']) T[t] = dups(t);
// keys added later by feature files (FOE_AI.x = ..., Object.assign(FOE_AI, {...}), MICROBES.x = ...)
const extra = (table) => {
  const ks = new Set(T[table]);
  for (const f of files) {
    const sf = parsed[f];
    const walk = n => {
      if (ts.isCallExpression(n) && n.expression.getText() === 'Object.assign' && n.arguments[0] && n.arguments[0].getText() === table && n.arguments[1] && ts.isObjectLiteralExpression(n.arguments[1])) for (const p of n.arguments[1].properties) { const k = keyOf(p); if (k != null) ks.add(k); }
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        const l = n.left; if ((ts.isPropertyAccessExpression(l) || ts.isElementAccessExpression(l)) && l.expression.getText() === table) { const k = ts.isPropertyAccessExpression(l) ? l.name.text : (ts.isStringLiteral(l.argumentExpression) ? l.argumentExpression.text : null); if (k) ks.add(k); }
      }
      ts.forEachChild(n, walk);
    };
    walk(sf);
  }
  return ks;
};
const FOE_AI = extra('FOE_AI'), MICROBES = extra('MICROBES');
// ROSTER rows: ai and shape per id (read from the literal)
const rows = {};
for (const f of files) parsed[f].forEachChild(n => {
  if (!ts.isVariableStatement(n)) return;
  for (const d of n.declarationList.declarations) if (d.name.getText() === 'ROSTER' && d.initializer && ts.isObjectLiteralExpression(d.initializer))
    for (const p of d.initializer.properties) { if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer)) continue; const r = {}; for (const q of p.initializer.properties) { const k = keyOf(q); if ((k === 'ai' || k === 'shape') && ts.isPropertyAssignment(q) && ts.isStringLiteral(q.initializer)) r[k] = q.initializer.text; } rows[keyOf(p)] = r; }
});
// `case 'x':` labels in game.js (the AI switch) and render.js (shape switch); ai ids handled elsewhere by name are listed in ALSO
const cases = f => { const s = new Set(); parsed[f].forEachChild(function w(n) { if (ts.isCaseClause(n) && ts.isStringLiteral(n.expression)) s.add(n.expression.text); n.forEachChild(w); }); return s; };
const gameCases = cases('game.js'), renderCases = cases('render.js');
const anyCase = new Set(); for (const f of files) for (const c of cases(f)) anyCase.add(c);
for (const [id, r] of Object.entries(rows)) {
  if (r.ai && !BASE_AI.has(r.ai) && !FOE_AI.has(r.ai) && !gameCases.has(r.ai)) bad.push(`ROSTER.${id}: ai '${r.ai}' has no FOE_AI entry and no case in game.js` + (anyCase.has(r.ai) ? ' (a case exists in another file)' : ''));
  if (r.shape && !MICROBES.has(r.shape) && !renderCases.has(r.shape)) bad.push(`ROSTER.${id}: shape '${r.shape}' has no MICROBES entry and no case in render.js` + (anyCase.has(r.shape) ? ' (a case exists in another file)' : ''));
}
console.log(`rosterint: ${Object.keys(rows).length} roster rows, literal keys ${Object.entries(T).map(([k, v]) => k + ' ' + v.length).join(', ')}; with later additions FOE_AI ${FOE_AI.size}, MICROBES ${MICROBES.size}`);
if (bad.length) { console.log('FAIL ' + bad.length + ' finding(s):'); for (const b of bad) console.log('  ' + b); process.exit(1); }
console.log('ok');
