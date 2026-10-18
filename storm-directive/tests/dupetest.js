// Every loaded script parses, and no two declare the same global (a later function silently replaces an earlier one; a second
// const/let stops the whole file loading). This bit five times during the v10 rework (addBurn, bleeding, W, sigTick, nfTick).
const fs = require('fs'), path = require('path');
const web = path.resolve(__dirname, '../web');
const files = [...fs.readFileSync(web + '/index.html', 'utf8').matchAll(/src="(js\/[a-z0-9]+\.js)"/g)].map(m => m[1]);
const seen = {}, bad = [];
const { execFileSync } = require('child_process');
for (const f of files) { try { execFileSync(process.execPath, ['--check', web + '/' + f], { stdio: 'pipe' }); } catch (e) { bad.push('syntax error in ' + f + ': ' + String(e.stderr).split('\n').slice(0, 4).join(' ')); } } // (every script must parse: one bad file stops it loading)
for (const f of files) {
  const names = new Set([...fs.readFileSync(web + '/' + f, 'utf8').matchAll(/^(?:function|const|let|var|class) ([A-Za-z0-9_$]+)/gm)].map(m => m[1]));
  for (const n of names) { if (seen[n]) bad.push(`${n}: ${seen[n]} and ${f}`); else seen[n] = f; }
}
console.log(files.length + ' scripts, ' + Object.keys(seen).length + ' globals');
if (bad.length) { console.log('FAIL duplicate globals: ' + bad.join('; ')); process.exit(1); }
