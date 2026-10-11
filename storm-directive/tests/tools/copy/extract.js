'use strict';
// Copy extractor/applier: finds every player-facing string in web/js/*.js and web/index.html.
//   node extract.js export out.json        -> list of strings with context
//   node extract.js apply edits.json       -> rewrites the source files from [{id,file,n,old,new}]
// Each JS string is addressed by (file, n) where n is its position among ALL string nodes in that file;
// the old text is checked before any replacement, so a stale sheet never corrupts the code.
const fs = require('fs'), path = require('path');
const ACORN = ['/opt/node-tools/node_modules/acorn', 'acorn'].find(p => { try { require.resolve(p); return true } catch (e) { return false } });
const acorn = require(ACORN), walk = require(ACORN.replace(/acorn$/, 'acorn-walk'));
const WEB = path.resolve(__dirname, '../../../web');
const COPY_KEYS = new Set('name desc title tip what quote reward short play role tag nick bio text label hint head wake boon line trait story ability blurb sub bane see status lore intro outro flavour flavor say msg message caption verdict note teaser sell upside downside cost weak strength weakness wname nm lines tagline summary label1 label2 header body tooltip'.split(' '));
const NOT_COPY_KEYS = new Set('color col id icon elem shape dir ai style type kind at count font fill stroke cls class sprite anim key sfx sound snd voice tex pattern orbit paddle flail siphon seeker tesla mines twin terrain shot venom a b letter no t'.split(' '));
const CODE_RE = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|\.|#|https?:|data:|M\d|\d+(px|em|%|s|ms)\b|[a-z]+-[a-z-]+$|[A-Za-z_$][\w$]*(\.[\w$]+)+$)/i;
function prose(s) {
  if (!/[A-Za-z]{2}/.test(s)) return false;
  if (CODE_RE.test(s.trim())) return false;
  if (/[{};]\s*$/.test(s) && /:/.test(s)) return false;           // css
  if (/^[\w$.\-\/]+$/.test(s)) return false;                      // identifier / path / single token
  if (/^(M|L|C|Q|Z|m|l|c|q|z)[ \d.,\-]/.test(s)) return false;     // svg path
  return /[A-Za-z]{2,}[^A-Za-z]+[A-Za-z]{2,}/.test(s);            // at least two words
}
function sibName(obj) {
  if (!obj || obj.type !== 'ObjectExpression') return '';
  for (const k of ['name', 'title', 'nick', 'wname', 'id', 'label']) {
    const p = obj.properties.find(p => p.type === 'Property' && !p.computed && (p.key.name === k || p.key.value === k) && p.value.type === 'Literal' && typeof p.value.value === 'string');
    if (p) return p.value.value;
  }
  return '';
}
function keyName(p) { return p.key.name || String(p.key.value) }
function calleeName(c) { return c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && !c.computed ? c.property.name : '?' }
function ctxOf(anc, node) {
  const parent = anc[anc.length - 2];
  let group = '', item = '', field = '', key = '';
  for (let i = anc.length - 2; i >= 0; i--) {
    const a = anc[i];
    if (!group && a.type === 'VariableDeclarator' && a.id.type === 'Identifier') group = a.id.name;
    if (!group && (a.type === 'FunctionDeclaration') && a.id) group = a.id.name + '()';
    if (!group && a.type === 'AssignmentExpression' && a.left.type === 'MemberExpression') group = src.slice(a.left.start, a.left.end).slice(0, 40);
  }
  if (parent.type === 'Property' && parent.value === node) { key = keyName(parent); field = key; }
  else if (parent.type === 'CallExpression') { field = 'text in ' + calleeName(parent.callee) + '()'; key = '' }
  else if (parent.type === 'ArrayExpression') { field = 'list entry ' + (parent.elements.indexOf(node) + 1); }
  else if (parent.type === 'BinaryExpression') field = 'joined text';
  else if (parent.type === 'ConditionalExpression') field = 'either/or text';
  else if (parent.type === 'AssignmentExpression') field = 'assigned text';
  else field = 'text';
  // item: nearest enclosing object with a name, else its property key
  for (let i = anc.length - 2; i >= 0; i--) {
    const a = anc[i];
    if (a.type === 'ObjectExpression') {
      item = sibName(a);
      if (!item) { const pp = anc[i - 1]; if (pp && pp.type === 'Property') item = keyName(pp); }
      if (item) break;
    }
  }
  return { group, item, field, key };
}
let src = '';
function jsStrings(file) {
  src = fs.readFileSync(path.join(WEB, 'js', file), 'utf8');
  let ast; try { ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true }) } catch (e) { return { err: e.message, nodes: [] } }
  const nodes = [];
  walk.ancestor(ast, {
    Literal(n, st, anc) { if (typeof n.value === 'string') nodes.push({ n, anc: anc.slice(), kind: 'str' }) },
    TemplateLiteral(n, st, anc) { nodes.push({ n, anc: anc.slice(), kind: 'tpl' }) }
  });
  nodes.sort((a, b) => a.n.start - b.n.start);
  return { nodes, ast };
}
function nodeText(x) {
  if (x.kind === 'str') return x.n.value;
  return src.slice(x.n.start + 1, x.n.end - 1);       // raw template body, ${...} kept as written
}
function relevant(x) {
  const t = nodeText(x); const parent = x.anc[x.anc.length - 2];
  if (!/[A-Za-z]/.test(t)) return false;
  if (x.kind === 'tpl' && parent.type === 'TaggedTemplateExpression') return false;
  if (parent.type === 'Property' && parent.value === x.n) {
    const k = keyName(parent);
    if (NOT_COPY_KEYS.has(k) && !COPY_KEYS.has(k)) return false;
    if (COPY_KEYS.has(k)) return t.trim().length > 0 && !CODE_RE.test(t.trim()) && !/^[a-z]+$/.test(t) || (COPY_KEYS.has(k) && /^[A-Z]/.test(t));
  }
  if (parent.type === 'CallExpression' && parent.arguments[0] === x.n) {
    const c = calleeName(parent.callee);
    if (/^(getElementById|querySelector|querySelectorAll|addEventListener|removeEventListener|createElement|getItem|setItem|removeItem|require|push|includes|indexOf|has|add|delete|get|set|test|match|replace|split|join|startsWith|endsWith|getContext|sfx|play|beep|snd|sound|S|hasOwnProperty|log10|fillStyle)$/.test(c)) return false;
  }
  if (parent.type === 'BinaryExpression' && ['===', '!==', '==', '!='].includes(parent.operator)) return false;
  if (parent.type === 'SwitchCase' || parent.type === 'MemberExpression' && parent.property === x.n) return false;
  if (parent.type === 'ImportDeclaration' || parent.type === 'ExpressionStatement' && /^use strict$/.test(t)) return false;
  return prose(t);
}

function exportAll() {
  const out = [];
  for (const f of fs.readdirSync(path.join(WEB, 'js')).sort()) {
    if (!f.endsWith('.js')) continue;
    const { nodes, err } = jsStrings(f);
    if (err) { console.error('PARSE FAIL', f, err); continue }
    nodes.forEach((x, i) => {
      if (!relevant(x)) return;
      const c = ctxOf(x.anc, x.n);
      out.push({ file: 'js/' + f, n: i, line: x.n.loc.start.line, text: nodeText(x), kind: x.kind, ...c });
    });
  }
  out.push(...htmlStrings());
  return out;
}
// ---------- index.html: visible text nodes and placeholder/title attributes ----------
function htmlItems(h) {
  const items = []; const re = /<(script|style)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->|(>)([^<>]+)(?=<)|\b(title|placeholder|alt|aria-label)="([^"]*)"/g; let m;
  while ((m = re.exec(h))) {
    if (m[3] !== undefined) { const t = m[3]; if (/[A-Za-z]{2}/.test(t) && t.trim()) { const s = m.index + 1 + t.indexOf(t.trim()); items.push({ start: s, text: t.trim(), field: 'text' }) } }
    else if (m[5] !== undefined && /[A-Za-z]{2}/.test(m[5])) { const s = m.index + m[0].indexOf('"') + 1; items.push({ start: s, text: m[5], field: m[4] + ' attribute' }) }
  }
  return items;
}
function htmlStrings() {
  const h = fs.readFileSync(path.join(WEB, 'index.html'), 'utf8');
  return htmlItems(h).map((it, i) => ({ file: 'index.html', n: i, line: h.slice(0, it.start).split('\n').length, text: it.text, kind: 'html', group: 'index.html', item: '', field: it.field, key: '' }));
}
// ---------- apply ----------
function quote(s, q) {
  let o = JSON.stringify(s).slice(1, -1).replace(/\\"/g, '"');
  if (q === "'") o = o.replace(/'/g, "\\'"); else if (q === '"') o = o.replace(/"/g, '\\"');
  return q + o + q;
}
function applyAll(edits) {
  const by = {}; edits.forEach(e => (by[e.file] = by[e.file] || []).push(e));
  const report = { done: 0, skipped: [] };
  for (const file of Object.keys(by)) {
    const full = path.join(WEB, file); let text = fs.readFileSync(full, 'utf8'); const reps = [];
    if (file === 'index.html') {
      const items = htmlItems(text);
      for (const e of by[file]) { const it = items[e.n]; if (it && it.text === e.old) reps.push({ s: it.start, e: it.start + it.text.length, v: e.new }); else report.skipped.push([e.id, 'index.html text changed since export']) }
    } else {
      const { nodes } = jsStrings(file.replace(/^js\//, '')); src = text;
      for (const e of by[file]) {
        let x = nodes[e.n];
        if (!x || nodeText(x) !== e.old) {                       // fall back to a unique match by text
          const c = nodes.filter(y => nodeText(y) === e.old);
          x = c.length === 1 ? c[0] : null;
        }
        if (!x) { report.skipped.push([e.id, 'source text no longer matches (code changed since export)']); continue }
        if (x.kind === 'tpl') { reps.push({ s: x.n.start + 1, e: x.n.end - 1, v: e.new }); continue }
        const q = src[x.n.start];
        reps.push({ s: x.n.start, e: x.n.end, v: quote(e.new, q) });
      }
    }
    reps.sort((a, b) => b.s - a.s);
    for (const r of reps) { text = text.slice(0, r.s) + r.v + text.slice(r.e); report.done++ }
    fs.writeFileSync(full, text);
  }
  return report;
}
if (require.main === module) {
  const [mode, f] = process.argv.slice(2);
  if (mode === 'export') { const o = exportAll(); fs.writeFileSync(f, JSON.stringify(o)); console.log('strings', o.length) }
  else if (mode === 'apply') { const r = applyAll(JSON.parse(fs.readFileSync(f, 'utf8'))); console.log(JSON.stringify(r)) }
  else console.log('usage: extract.js export|apply file.json');
}
module.exports = { exportAll, applyAll };
