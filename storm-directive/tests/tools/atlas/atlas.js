// Builds the Weapon Atlas (https://claude.ai/artifact/LBga1dJ3q2QyAX1uee8Ef9) from the live v10 game data:
//   node tests/tools/atlas/atlas.js        writes tests/out/weapon-atlas.html
// Then republish that file to the Atlas URL with the Artifact tool (read the artifact first). The page code lives in
// template.html next to this file; only its /*DATA*/null placeholder is filled in here.
// v10 shape: samples (samples10.js) -> starter weapons (weapons24.js W24) -> promise / branch / mastery cards (WUP, wup1-6.js)
// -> branch combos (combos10.js C10) and the 21 type reactions (fight.js RX10).
const { chromium } = require(process.env.NODE_PATH ? 'playwright' : '/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../../../web/index.html')); await page.waitForTimeout(800);
  const D = await page.evaluate(() => {
    const fix = s => String(s == null ? '' : s);
    const types = {};
    for (const k of RX10_ORDER) types[k] = { name: ELEMENTS[k].name, status: ELEMENTS[k].status, blurb: ELEMENTS[k].blurb, col: (typeof V10_COL !== 'undefined' && V10_COL[k]) || ELEMENTS[k].color };
    const ATK = { proj: 'Projectile', spread: 'Spread', contact: 'Contact', burst: 'Burst', beam: 'Beam', pool: 'Pool' };
    const key = id => (W24_BY[id] ? id : W24_BY['s_' + id] ? 's_' + id : id); // (combos10.js still names a few weapons by their old id)
    const cards = a => (a || []).map(c => ({ name: fix(c.name), desc: fix(c.desc) }));
    const weapons = {};
    for (const id of W24_IDS.concat(Object.keys(W24_BY).filter(x => !W24_IDS.includes(x)))) {
      const r = W24_BY[id], S = WUP[id] || {};
      const promises = ['A', 'B', 'C'].filter(k => S[k]).map(k => ({ k, name: fix(S[k].name), tag: fix(S[k].tag), desc: fix(S[k].lv3.desc), costs: fix(S[k].costs), shows: fix(S[k].shows), modes: fix(S[k].modes),
        branches: cards(S[k].lv6), wild: S[k].wild ? { name: fix(S[k].wild.name), desc: fix(S[k].wild.desc) } : null }));
      weapons[id] = { name: r.name, type: r.type, atk: ATK[r.atk] || r.atk, starter: r.starter, desc: fix(W24_DESC[id]), promises,
        masteries: (S.lv10 || []).map(c => ({ name: fix(c.name), desc: fix(c.desc), best: (c.best || '').split('').filter(k => S[k]).map(k => S[k].name) })) };
    }
    const samples = SAMPLES10.map(s => ({ id: s.id, strain: s.strain, name: fix(s.name), origin: fix(s.origin), types: s.types.map(t => S10_TYPES[t]), passive: fix(s.passive), pdesc: fix(s.pdesc), weapons: s.weapons }));
    const combos = C10.map(c => ({ a: key(c.a), b: key(c.b), pa: c.pa, pb: c.pb, name: fix(c.name), desc: fix(c.desc).replace(/ Needs .*$/, '') }));
    const rx = Object.keys(RX10).map(k => ({ a: k.split('+')[0], b: k.split('+')[1], desc: RX10[k][1] }));
    return { version: APP_VERSION, types, order: RX10_ORDER, samples, weapons, combos, rx };
  });
  const out = path.resolve(__dirname, '../../out/weapon-atlas.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  if (!tpl.includes('/*DATA*/null')) throw new Error('template.html has lost its /*DATA*/null placeholder');
  fs.writeFileSync(out, tpl.replace('/*DATA*/null', () => JSON.stringify(D)));
  const bad = [];
  for (const c of D.combos) for (const w of [c.a, c.b]) if (!D.weapons[w]) bad.push('combo ' + c.name + ' ' + w);
  for (const s of D.samples) for (const w of s.weapons) if (!D.weapons[w]) bad.push('starter ' + w);
  for (const [id, w] of Object.entries(D.weapons)) if (w.promises.length !== 3 || w.masteries.length !== 3) bad.push('shape ' + id);
  console.log(out + '\n ', 'v' + D.version, 'weapons', Object.keys(D.weapons).length, 'samples', D.samples.length, 'combos', D.combos.length, 'rx', D.rx.length, 'bad', bad, 'errs', errs);
  await b.close();
})();
