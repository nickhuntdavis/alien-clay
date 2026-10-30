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
    // Feats (feats10.js): the drafted pool in F10_ORDER plus each sample's Unique Feat; forks at levels 3 and 5.
    const feat = f => ({ id: f.id, name: fix(f.name), type: F10_INT[f.type] || f.type || null, atk: f.atk ? (ATK[f.atk] || f.atk) : null, trig: !!f.trig, stam: f.stam || 0, does: fix(f.does), line: fix(f.line), sample: f.sample || null,
      forks: { 3: (f.forks && f.forks[3] || []).map(o => ({ name: fix(o.title), desc: fix(o.desc) })), 5: (f.forks && f.forks[5] || []).map(o => ({ name: fix(o.title), desc: fix(o.desc) })) } });
    const feats = F10_ORDER.filter(id => F10[id]).map(id => feat(F10[id]));
    for (const [sid, fid] of Object.entries(F10_UNIQUE)) if (F10[fid] && !feats.some(f => f.id === fid)) feats.push(Object.assign(feat(F10[fid]), { sample: sid }));
    // Sperm passives (spassives.js over mutations.js): genome cards still dealt, with their A/B masteries (spmast.js SPM_BR).
    const cut = new Set(SP.cut);
    const passives = MUT_REG.filter(m => m.slot === 'genome' && m.kind === 'acquire' && !cut.has(m.id) && m.family !== 'mut:weapon')
      .map(m => ({ id: m.id, name: fix(m.title), desc: fix(m.desc), family: fix(m.family).replace('mut:', ''), maxRank: m.maxRank || 3, flavour: fix(m.flavour),
        mast: SPM_BR[m.id] ? [{ name: fix(SPM_BR[m.id][0]), desc: fix(SPM_BR[m.id][1]) }, { name: fix(SPM_BR[m.id][2]), desc: fix(SPM_BR[m.id][3]) }] : null }));
    const families = {}; for (const m of MUT_REG) families[m.family + '/' + m.slot + '/' + m.kind] = (families[m.family + '/' + m.slot + '/' + m.kind] || 0) + 1;
    // Current rules (CARD_RULES.md): the rule file's rules load as the planner's editable defaults; the built-in tables (matrix N/A,
    // Delivery weapons' denied modifiers, the audit's dead modifiers by Delivery form) load as locked rules with their reason.
    const rules0 = (typeof CARD_RULES !== 'undefined' ? CARD_RULES : []).map(r => Object.assign({}, r));
    const builtin = [], roster = new Set(Object.keys(weapons)), okMod = id => !!mods[id];
    for (const [wid, ids] of Object.entries(typeof MATRIX_NA !== 'undefined' ? MATRIX_NA : {})) if (roster.has(wid)) for (const id of ids) if (okMod(id))
      builtin.push({ w: wid, mod: id, src: 'matrix', why: 'N/A in the modifier matrix: the weapon already does this', unless: ['v_phys_burst', 's_lard', 'v_phys_contact'].includes(wid) && id === 'knock' ? 'ranged' : '' });
    for (const [wid, ids] of Object.entries((typeof DLV !== 'undefined' && DLV.deny) || {})) if (roster.has(wid)) for (const id of ids) if (okMod(id))
      builtin.push({ w: wid, mod: id, src: 'delivery', why: 'does nothing on this Delivery weapon' });
    for (const [wid, forms] of Object.entries(typeof MOD_DEAD !== 'undefined' ? MOD_DEAD : {})) if (roster.has(wid)) for (const [form, ids] of Object.entries(forms)) for (const id of ids) if (okMod(id))
      builtin.push({ w: wid, mod: id, form, src: 'audit', why: 'the modifier audit found it does nothing here' + (form ? ' (with ' + (MODS10[form] ? MODS10[form].name : form) + ')' : '') });
    return { version: APP_VERSION, types, samples, weapons, mods, maxW: MAX_WEAPONS, mmOpen: MM.open, gnames: MM_GNAME, feats, featSlots: F10_SLOTS, passives, passSlots: SP.base + SP.at.length, families, rules0, builtin };
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
  console.log('feats', D.feats.length, D.feats.filter(f => f.sample).length + ' unique', '| passives', D.passives.length, D.passives.filter(p => p.mast).length + ' with masteries', '| families', JSON.stringify(D.families));
  await b.close();
})();
