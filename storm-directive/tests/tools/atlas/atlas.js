// Builds the Weapon Atlas (https://claude.ai/artifact/LBga1dJ3q2QyAX1uee8Ef9) from the live game data:
//   node tests/tools/atlas/atlas.js        writes tests/out/weapon-atlas.html
// Then republish that file to the Atlas URL with the Artifact tool (read the artifact first). The page code lives in
// template.html next to this file; only its /*DATA*/ line is filled in here.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../../../web/index.html')); await page.waitForTimeout(500);
  const D = await page.evaluate(() => {
    const elements = {};
    for (const k in ELEMENTS) elements[k] = { name: ELEMENTS[k].name, status: ELEMENTS[k].status, blurb: ELEMENTS[k].blurb, col: ELEM_UI[k] || ELEMENTS[k].color };
    const seqs = Object.keys(PROFILES).map(id => {
      const P = PROFILES[id], A = (typeof SEQ_ABILITY !== 'undefined' && SEQ_ABILITY[id]) || {}, L = (typeof SEQ_LOOK !== 'undefined' && SEQ_LOOK[id]) || {};
      return { id, name: L.short || P.name.replace(/^The /, ''), profile: P.name, trait: P.trait, desc: P.desc, weapons: P.weapons.filter(w => WEAPONS[w]), ability: A.name || '', abilityDesc: A.desc || '', col: L.color || '#888888',
        evolve: (EVOLVE[id] || []).map((e, i) => ({ lv: EVOLVE_LV[i], name: e.name, desc: e.desc })) };
    });
    const cls = typeof ARM_CLASS !== 'undefined' ? ARM_CLASS : {};
    const weapons = {};
    for (const id in WEAPONS) {
      const d = WEAPONS[id], t = weaponTree(Object.assign(d, { id: d.id || id }));
      const c = cls[id], role = d.role || '';
      weapons[id] = { name: d.name, elem: d.elem, role: c && role.toLowerCase() !== c ? `${role} | ${c}` : role, play: d.play || d.desc || '', stars: d.stars || null, seqOnly: d.seqOnly || null,
        tree: PERK_LEVELS.filter(l => t[l]).map(l => ({ lv: l, sig: !!(d.sig && d.sig[l]), opts: t[l].map(pid => { const p = perkDef(pid) || {}; return { name: p.name || pid, desc: p.desc || '' }; }) })) };
    }
    const combos = COMBOS.map(c => ({ a: c.a, b: c.b, name: c.name, desc: c.desc }));
    const pairs = PAIRINGS.map(p => ({ a: p.a, b: p.b, name: p.name, desc: p.desc }));
    const reactions = Object.values(REACTIONS).map(r => ({ name: r.name, desc: r.desc }));
    const twists = (Array.isArray(TWISTS) ? TWISTS.map(t => [t.k, t]) : Object.entries(TWISTS)).map(([k, t]) => ({ k, name: t.name, desc: t.desc }));
    const syn = PROFILE_SYNERGIES.map(s => ({ a: s.a, b: s.b, name: s.name }));
    return { elements, seqs, weapons, combos, pairs, reactions, twists, syn };
  });
  const out = path.resolve(__dirname, '../../out/weapon-atlas.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  if (!tpl.includes('/*DATA*/null')) throw new Error('template.html has lost its /*DATA*/null placeholder');
  fs.writeFileSync(out, tpl.replace('/*DATA*/null', () => JSON.stringify(D)));
  const bad = []; for (const s of D.seqs) for (const w of s.weapons) if (!D.weapons[w]) bad.push(w);
  for (const t of D.twists) for (const k of t.k.split('+')) if (!D.elements[k]) bad.push('twist ' + t.k);
  for (const c of D.combos.concat(D.pairs)) for (const w of [c.a, c.b]) if (!D.weapons[w]) bad.push('rel ' + w);
  const orphan = Object.keys(D.weapons).filter(w => !D.seqs.some(s => s.weapons.includes(w)));
  console.log(out + '\n ', 'weapons', Object.keys(D.weapons).length, 'seqs', D.seqs.length, 'combos', D.combos.length, 'pairs', D.pairs.length, 'rx', D.reactions.length, 'twists', D.twists.length, 'bad', bad, 'orphans', orphan, 'errs', errs);
  await b.close();
})();
