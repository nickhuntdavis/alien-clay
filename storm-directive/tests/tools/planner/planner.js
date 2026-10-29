// Builds the Loadout Planner artifact from the live game data:
//   node tests/tools/planner/planner.js        writes tests/out/loadout-planner.html
// Then republish that file to the planner's artifact URL with the Artifact tool (read the artifact first). The page code lives in
// template.html next to this file; only its /*DATA*/null placeholder is filled in here.
// Data: matrixonly.js weapons and modifiers (plus Area, Lifesteal and the built-in Delivery modifiers), what fits what (modOk on a
// fresh slot), modifier groups (modmatrix.js), forks and masteries (modslice.js MSB, slicecopy.js), weapon branch trees (WUP), samples.
const { chromium } = require(process.env.NODE_PATH ? 'playwright' : '/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../../../web/index.html')); await page.waitForTimeout(800);
  const D = await page.evaluate(() => {
    const fix = s => String(s == null ? '' : s);
    MATRIX_ONLY.force = true; // (TUT_OFF is not set here, but be safe)
    const types = {};
    for (const k of Object.keys(ELEMENTS)) types[k] = { name: ELEMENTS[k].name, status: ELEMENTS[k].status, col: (typeof V10_COL !== 'undefined' && V10_COL[k]) || ELEMENTS[k].color };
    const ATK = { proj: 'Projectile', spread: 'Spread', contact: 'Contact', burst: 'Burst', beam: 'Beam', pool: 'Pool' };
    const cards = a => (a || []).map(c => ({ name: fix(c.name), desc: fix(c.desc) }));
    // a fake run so computeStats / modOk work off the title screen
    try { if (!G) newGame('s002'); } catch (e) { }
    const weapons = {};
    for (const id of MATRIX_ONLY.weapons) {
      const r = W24_BY[id], def = WEAPONS[id]; if (!def) continue;
      const S = WUP[id] || {};
      let w = null; try { w = makeSlot(id); } catch (e) { }
      const mods = w ? MATRIX_ONLY.mods.filter(m => { try { return modOk(w, m); } catch (e) { return false; } }) : [];
      const extraMods = w ? ['area', 'bloodsucker', 'umbilical'].filter(m => MODS10[m] && (() => { try { return modOk(w, m); } catch (e) { return false; } })()) : [];
      const promises = ['A', 'B', 'C'].filter(k => S[k]).map(k => ({ k, name: fix(S[k].name), tag: fix(S[k].tag), desc: fix(S[k].lv3 && S[k].lv3.desc), branches: cards(S[k].lv6), wild: S[k].wild ? { name: fix(S[k].wild.name), desc: fix(S[k].wild.desc) } : null }));
      weapons[id] = { id, name: r ? r.name : def.name, type: (r && r.type) || def.v10type || def.elem, atk: ATK[(r && r.atk) || def.v10atk] || (r && r.atk) || def.v10atk, starter: r && r.starter, desc: fix(typeof W24_DESC !== 'undefined' && W24_DESC[id]) || fix(def.desc),
        dlv: def.dlv || null, sab: MM_SAB[id] || null, mods: Array.from(new Set(mods.concat(extraMods))), promises,
        masteries: (S.lv10 || []).map(c => ({ name: fix(c.name), desc: fix(c.desc), best: fix(c.best) })) };
    }
    const mods = {};
    for (const id of Array.from(new Set(MATRIX_ONLY.mods.concat(['area', 'bloodsucker', 'umbilical', 'melee', 'mines', 'dfa', 'ranged'])))) {
      const m = MODS10[id]; if (!m) continue;
      const sc = (typeof SLICE_MODS !== 'undefined' && SLICE_MODS[id]) || null;
      mods[id] = { id, name: m.name, desc: fix(m.desc || (sc && sc[0])), group: mmGroup(id), gname: MM_GNAME[mmGroup(id)] || mmGroup(id), max: m.max, atk: m.atk,
        ranks: sc ? sc.slice(0, 3) : (MODUP[id] ? [fix(m.desc)].concat(MODUP[id]) : [fix(m.desc)]),
        br: MSB[id] || null, brText: sc ? sc.slice(3) : null };
    }
    const samples = SAMPLES10.filter(s => s.strain <= 9).map(s => ({ id: s.id, strain: s.strain, name: fix(s.name), origin: fix(s.origin), types: s.types.map(t => S10_TYPES[t]), passive: fix(s.passive), pdesc: fix(s.pdesc), weapons: s.weapons, fit: (typeof S10_FIT !== 'undefined' && S10_FIT[s.id]) || [] }));
    return { version: APP_VERSION, types, samples, weapons, mods, maxW: MAX_WEAPONS, mmOpen: MM.open, gnames: MM_GNAME };
  });
  const out = path.resolve(__dirname, '../../out/loadout-planner.html'); fs.mkdirSync(path.dirname(out), { recursive: true });
  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  if (!tpl.includes('/*DATA*/null')) throw new Error('template.html has lost its /*DATA*/null placeholder');
  fs.writeFileSync(out, tpl.replace('/*DATA*/null', () => JSON.stringify(D).replace(/<\//g, '<\\/')));
  console.log(out);
  console.log('v' + D.version, 'weapons', Object.keys(D.weapons).length, 'mods', Object.keys(D.mods).length, 'samples', D.samples.length, 'maxW', D.maxW, 'errs', errs.slice(0, 3));
  for (const w of Object.values(D.weapons)) console.log(w.id.padEnd(16), (w.atk||'').padEnd(10), (w.type||'').padEnd(7), String(w.mods.length).padStart(2), 'mods', w.promises.length, 'prom', w.masteries.length, 'mast', w.dlv ? 'dlv:' + w.dlv : '', w.sab ? 'sab:' + w.sab : '', '|', w.name);
  console.log(Object.values(D.mods).map(m => m.id + ':' + m.group + (m.br ? '*' : '')).join(' '));
  console.log(D.samples.map(s => s.id + '(' + s.strain + ')').join(' '));
  await b.close();
})();
