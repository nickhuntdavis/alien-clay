// Type pools (typepools.js): one damage type per sample; weapon pools by type; the opening draft is the signature plus two
// from the type's pool; the run pool filters every weapon draft (kinPool/v10Pool); Private Schooled is on hold.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const start = sid => { META.profile = 's10_' + sid; UI.sample = 's001'; newGame(); G.state = 'play'; return s10Start(); };
    // 1. Pool sizes
    const want = { phys: 6, shock: 3, ice: 3, arcane: 3, fire: 3, soul: 4, flame: 8 };
    out.sizes = {}; for (const t in want) { out.sizes[t] = tpPool(t).length; if (out.sizes[t] !== want[t]) bad.push('pool ' + t + ' ' + out.sizes[t]); }
    if (tpPool('*').length !== w24Live().length) bad.push('* pool');
    // 2. Private Schooled on hold
    if (SAMPLES10.some(s => s.id === 'private')) bad.push('private still on the rack');
    if (!S10_BY.private || !PROFILES.s10_private) bad.push('S10_BY.private / profile gone');
    if (!tpPool('soul').includes('v_soul_proj') || !tpPool('fire').includes('v_fire_proj')) bad.push('private weapons not live in pools');
    // 3. One type per sample, display and API
    for (const sid of Object.keys(TP_TYPE)) {
      const s = S10_BY[sid]; if (!s) { bad.push('no sample ' + sid); continue; }
      if (sid !== 'alien' && s.types.length !== 1) bad.push(sid + ' types ' + s.types);
      if (sid !== 'alien' && S10_TYPES[s.types[0]] !== (sid === 'acro' ? 'fire' : TP_TYPE[sid])) bad.push(sid + ' display ' + s.types);
      if (s.weapons[0] !== TP_SIG[sid]) bad.push(sid + ' weapons[0] ' + s.weapons[0]);
      if (sid !== 'alien' && s.weapons.some(id => W24_BY[id].type !== TP_TYPE[sid])) bad.push(sid + ' mixed weapons ' + s.weapons);
      if (tpOf(sid) !== TP_TYPE[sid]) bad.push('tpOf ' + sid);
    }
    if (S10_BY.alien.types.length !== 3) bad.push('alien types');
    // 4. Every sample's opening draft: 3 distinct cards, signature among them, all of its type
    out.drafts = {};
    for (const sid of Object.keys(TP_TYPE)) for (let k = 0; k < 20; k++) {
      const o = start(sid), ids = o.map(x => W24_IDS.find(id => WEAPONS[id] === x.def) || x.def.id);
      if (o.length !== 3 || new Set(ids).size !== 3) { bad.push('draft ' + sid + ' ' + ids); break; }
      if (!ids.includes(TP_SIG[sid])) { bad.push('no signature ' + sid + ' ' + ids); break; }
      if (sid !== 'alien' && ids.some(id => W24_BY[id].type !== TP_TYPE[sid])) { bad.push('off-type ' + sid + ' ' + ids); break; }
      if (JSON.stringify(tpRunTypes()) !== JSON.stringify([TP_TYPE[sid]])) { bad.push('G.tp ' + sid + ' ' + JSON.stringify(tpRunTypes())); break; }
      out.drafts[sid] = ids.join(',');
    }
    // alien: over many deals every type turns up
    { const seen = new Set(); for (let k = 0; k < 150; k++) start('alien').forEach(x => { const id = W24_IDS.find(i => WEAPONS[i] === x.def); if (id) seen.add(W24_BY[id].type); });
      out.alienTypes = [...seen].sort().join(','); if (seen.size < 6) bad.push('alien draft types ' + out.alienTypes); }
    // 5. Alpha: three Static cards with the beam among them
    { const o = start('alpha'), ids = o.map(x => W24_IDS.find(id => WEAPONS[id] === x.def));
      if (o.length !== 3 || ids.some(id => W24_BY[id].type !== 'shock') || !ids.includes('v_shock_beam')) bad.push('alpha ' + ids); }
    // 6. Run pool filters drafts; tpAdd opens another type; a held weapon passes; alien takes everything
    start('alpha');
    const types = () => new Set(v10Pool().map(id => W24_BY[id].type));
    out.alphaPool = [...types()].join(','); if (out.alphaPool !== 'shock') bad.push('alpha pool ' + out.alphaPool);
    for (let k = 0; k < 20; k++) { const c = genLoot({ kind: 'slot' }); if (c.some(x => { const id = W24_IDS.find(i => WEAPONS[i] === x.def); return id && W24_BY[id].type !== 'shock'; })) { bad.push('slot draft off-type'); break; } }
    tpAdd('phys'); tpAdd('phys');
    if (tpRunTypes().join() !== 'shock,phys') bad.push('tpAdd ' + tpRunTypes());
    out.addedPool = [...types()].sort().join(','); if (out.addedPool !== 'phys,shock') bad.push('after tpAdd ' + out.addedPool);
    if (!tpOk('v_phys_proj') || tpOk('v_flame_pool')) bad.push('tpOk after add');
    start('alpha'); G.weapons[0] = makeSlot('v_flame_pool', false, 1);
    if (!tpOk('v_flame_pool') || !v10Pool().includes('v_flame_pool')) bad.push('held weapon filtered out');
    // all three Static held: the draft opens the rest instead of going empty
    start('alpha'); G.weapons[0] = makeSlot('v_shock_beam', false, 1); G.weapons[1] = makeSlot('s_twin', false, 1); G.weapons[2] = makeSlot('s_tesla', false, 1);
    out.exhausted = v10Pool().length; if (v10Pool().length < 10) bad.push('exhausted pool did not open ' + v10Pool().length);
    { const c = genLoot({ kind: 'slot' }); if (!c || !c.length) bad.push('empty draft when pool exhausted'); }
    start('alien'); if (types().size < 6) bad.push('alien pool types ' + [...types()]);
    // no run: harmless
    G = null; if (tpRunTypes().length !== 0 || tpOk('v_phys_proj') !== true) bad.push('no-run API');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
