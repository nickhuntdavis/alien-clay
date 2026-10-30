// Card rules (cardrulesengine.js, CARD_RULES.md): Don't (symmetric), Do (any one), Weight, scope, conditions, inheritance,
// every deal point (modifiers, branch screens, modifier forks, Feats, passives, new weapons), the debug line, and no change with no rules.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], chk = (n, c, i) => { if (!c) bad.push(n + (i !== undefined ? ' [' + JSON.stringify(i) + ']' : '')); };
    const block = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ' threw ' + e.message + ' ' + (e.stack || '').split('\n')[1]); } };
    const SHIPPED = CARD_RULES.slice(), set = rules => { CARD_RULES.length = 0; CARD_RULES.push(...rules); };
    const fresh = (wids, sample) => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
      G.weapons = wids.map(id => makeSlot(id, false, 1)).concat([null, null, null, null]).slice(0, 4); recomputeAll();
      if (sample) G.s10 = Object.assign({}, G.s10 || {}, { id: sample });
      return G.weapons;
    };
    const SI = 'v_phys_proj', MG = 'v_phys_spread';
    const branch = (w, i) => { genLoot({ kind: 'fork', w, lv: 3 })[i].apply(); };

    block('no rules: nothing changes', () => {
      set([]); const [w] = fresh([SI]);
      chk('modOk unchanged', modOk(w, 'charged') === true); chk('crAllowed true', crAllowed('m:charged', { w }));
      chk('keys known', ['w:' + SI, 'm:charged', 'b:' + SI + ':A', 'f:quick_draw', 'p:m_slip', 's:baseline', 'tag:g:tempo', 'mf:range:A1'].every(crKnown), ['w:' + SI, 'm:charged'].map(crKnown));
      chk('nonsense not known', !crKnown('m:nope') && !crKnown('zz') && !crKnown('b:' + SI + ':Z'));
    });
    block("don't, symmetric, weapon scope", () => {
      set([{ id: 'r1', parent: 'b:' + SI + ':A', mode: 'dont', target: 'm:charged', scope: 'weapon' }]);
      let [a, bb] = fresh([SI, MG]); branch(a, 0); // Rambo on Standard Issue
      chk('Rambo blocks Charged on its weapon', !modOk(a, 'charged'), crWhy('m:charged', { w: a }));
      chk('weapon scope: Charged still fine on the Shotgun', modOk(bb, 'charged') || !MODS10.charged.atk.includes(bb.def.v10atk));
      [a] = fresh([SI]); modAdd(a, 'charged'); recomputeAll();
      const titles = genLoot({ kind: 'fork', w: a, lv: 3 }).map(c => c.title);
      chk('symmetric: holding Charged, Rambo is not offered', !titles.includes('Rambo') && titles.length === 2, titles);
      chk('reason names the holder', /Charge/.test(crWhy('b:' + SI + ':A', { w: a }) || ''), crWhy('b:' + SI + ':A', { w: a }));
    });
    block("don't, run scope", () => {
      set([{ id: 'r2', parent: 'b:' + SI + ':A', mode: 'dont', target: 'm:charged', scope: 'run' }]);
      const [a, bb] = fresh([SI, MG]); branch(a, 0);
      chk('run scope: Charged blocked on the Shotgun too', !modOk(bb, 'charged'));
    });
    block('inheritance: a branch rule covers its Lv 6 cards; a modifier rule covers its forks', () => {
      set([{ id: 'r3', parent: 'm:charged', mode: 'dont', target: 'b:' + SI + ':B', scope: 'weapon' }]);
      chk('covers Gathering Momentum', crCovers('b:' + SI + ':B', 'wb:' + SI + ':Gathering Momentum')); // (Through and Through's Lv 6 card: Dirty Harry moved to the Baseline sample, samplebranch.js)
      chk('m covers mf', crCovers('m:range', 'mf:range:A1'));
      const [a] = fresh([SI]); modAdd(a, 'charged'); a.up = { p: 'B' }; // (held before the rule mattered: it stays)
      const six = genLoot({ kind: 'fork', w: a, lv: 6 });
      chk('Lv 6 screen never empty (rules give way)', six.length > 0, six.length);
    });
    block('do: any one, and gates the Feat card', () => {
      set([{ id: 'r4', parent: 'b:' + SI + ':B', mode: 'do', target: 'f:brown_fat', scope: 'run' }, { id: 'r5', parent: 'b:' + SI + ':C', mode: 'do', target: 'f:brown_fat', scope: 'run' }]);
      const c = CARDS.find(x => x.id === 'feat_brown_fat');
      let [a] = fresh([SI]);
      chk('without a parent: not dealt', !cardOk(c), crWhy('f:brown_fat', { w: null }));
      branch(a, 2); chk('with either parent (Robocop): dealt', cardOk(c), crWhy('f:brown_fat', { w: null }));
      [a] = fresh([SI]); branch(a, 1); chk('with the other parent (Dirty Harry): dealt', cardOk(c));
    });
    block('passives and sample condition', () => {
      set([{ id: 'r6', parent: 'w:' + SI, mode: 'dont', target: 'p:m_slip', scope: 'run', sample: 'baseline' }]);
      const c = CARDS.find(x => x.id === 'm_slip'); chk('m_slip card exists', !!c);
      fresh([SI], 'alpha'); chk('other sample: rule off', cardOk(c));
      fresh([SI], 'baseline'); chk('Baseline: blocked', !cardOk(c), crWhy('p:m_slip', { w: null }));
    });
    block('branch condition', () => {
      set([{ id: 'r7', parent: 'w:' + SI, mode: 'dont', target: 'm:range', scope: 'weapon', branch: 'b:' + SI + ':C' }]);
      let [a] = fresh([SI]); chk('condition not held: allowed', modOk(a, 'range'));
      branch(a, 2); chk('condition held (Robocop): blocked', !modOk(a, 'range'));
    });
    block('tags', () => {
      set([{ id: 'r8', parent: 'b:' + SI + ':A', mode: 'dont', target: 'tag:g:tempo', scope: 'weapon' }]);
      const [a] = fresh([SI]); branch(a, 0);
      chk('Tempo modifiers blocked', !modOk(a, 'range') && !modOk(a, 'rapid'), [modOk(a, 'range'), modOk(a, 'rapid')]);
      chk('others fine', modOk(a, 'piercing') || !MODS10.piercing.atk.includes(a.def.v10atk));
    });
    block('modifier forks', () => {
      set([{ id: 'r9', parent: 'b:' + SI + ':A', mode: 'dont', target: 'mf:range:A', scope: 'weapon' }]);
      const [a] = fresh([SI]); branch(a, 0); modAdd(a, 'range'); modAdd(a, 'range'); recomputeAll();
      const cs = forkCards({ kind: 'fork', ms: { w: a, id: 'range', st: 'b' } });
      chk('fork A held back', cs.length === 1 && cs[0].title === MSB.range[1], cs.map(c => c.title));
    });
    block('weapons in the slot draft', () => {
      set([{ id: 'r10', parent: 'b:' + SI + ':A', mode: 'dont', target: 'w:' + MG, scope: 'run' }]);
      const [a] = fresh([SI]); branch(a, 0);
      let seen = 0; for (let i = 0; i < 30; i++) { const o = v10Loot({ kind: 'slot' }) || []; if (o.some(x => x.def && (x.def.sigOf || x.def.id) === MG)) seen++; }
      chk('Shotgun never offered with Rambo', seen === 0, seen);
    });
    block('weight', () => {
      set([{ id: 'r11', parent: 'b:' + SI + ':A', mode: 'weight', k: 5, target: 'm:rapid', scope: 'weapon' }]);
      const [a] = fresh([SI]); branch(a, 0);
      chk('crWeight 5', crWeight('m:rapid', { w: a }) === 5, crWeight('m:rapid', { w: a }));
      const keep = G.weapons; let rapid = 0, n = 0;
      for (let i = 0; i < 200; i++) { G.weapons = [a]; const cs = modDraftCands('wm'); G.weapons = keep; const t = cs.reduce((s, c) => s + c.w, 0), rc = cs.find(c => c.fam === 'mod:rapid'); if (rc && t > 0) { rapid += rc.w / t; n++; } }
      set([]); let base = 0, m = 0; for (let i = 0; i < 50; i++) { G.weapons = [a]; const cs = modDraftCands('wm'); G.weapons = keep; const t = cs.reduce((s, c) => s + c.w, 0), rc = cs.find(c => c.fam === 'mod:rapid'); if (rc && t > 0) { base += rc.w / t; m++; } }
      chk('Rapid Fire more likely with Rambo', n && m && rapid / n > (base / m) * 2.5, [rapid / n, base / m]);
      set([{ id: 'r12', parent: 'b:' + SI + ':A', mode: 'weight', k: 0, target: 'f:brown_fat', scope: 'run' }]);
      chk('weight 0 on a Feat card', crCardW(CARDS.find(x => x.id === 'feat_brown_fat')) === 0);
    });
    block('debug line', () => {
      set([{ id: 'r13', parent: 'w:' + SI, mode: 'weight', k: 2, target: 'tag:k:m', scope: 'weapon' }]);
      const [a] = fresh([SI]); SET.ruleDebug = true;
      const cs = genLoot({ kind: 'fork', wm: { w: a } }) || [];
      SET.ruleDebug = false;
      chk('a dealt card carries the rules line', cs.some(c => /\[rules: /.test(c.desc || '')), cs.map(c => c.desc).slice(0, 3));
    });
    // The game tables moved into rules (importtables.js): every weapon in every Delivery form is dealt exactly the same modifiers
    // with the tables in charge (CARD_RULES_OWNS off, their rules out) as with the rules in charge.
    block('tables and rules agree', () => {
      const OWN = Object.assign({}, CARD_RULES_OWNS), tableRules = SHIPPED.filter(r => r.src), other = SHIPPED.filter(r => !r.src);
      chk('the tables are owned by rules', OWN.audit && OWN.matrix && OWN.delivery, OWN);
      chk('imported rules present', tableRules.length > 400, tableRules.length);
      const mods = Object.keys(MODS10), deliv = mods.filter(id => mmGroup(id) === 'delivery');
      const states = [];
      for (const wid of MATRIX_ONLY.weapons) if (WEAPONS[wid]) {
        states.push([wid, []]);
        for (const d of deliv) states.push([wid, [d]]);
        states.push([wid, ['ranged']], [wid, ['ricochet']], [wid, ['piercing']]); // (the two exceptions: Ranged, MOD_LIVE_WITH)
      }
      const dealt = (wid, extra) => { const [w] = fresh([wid]); for (const x of extra) modAdd(w, x); recomputeAll(); if (extra.some(x => !(w.m10 || []).includes(x))) return null; return mods.filter(id => { try { return modOk(w, id); } catch (e) { return false; } }).join(','); };
      const old = {}, now = {};
      for (const k of Object.keys(OWN)) CARD_RULES_OWNS[k] = false; set(other);
      for (const [wid, ex] of states) old[wid + '+' + ex.join('+')] = dealt(wid, ex);
      for (const k of Object.keys(OWN)) CARD_RULES_OWNS[k] = OWN[k]; set(SHIPPED);
      for (const [wid, ex] of states) now[wid + '+' + ex.join('+')] = dealt(wid, ex);
      let n = 0; const diff = [];
      for (const k of Object.keys(old)) { if (old[k] == null) continue; n++; if (old[k] !== now[k]) diff.push(k + ' old[' + old[k] + '] new[' + now[k] + ']'); }
      chk('same modifiers dealt in ' + n + ' weapon states', !diff.length, diff.slice(0, 3));
    });
    set(SHIPPED);
    return { bad };
  });
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('cardrulestest OK');
  await b.close();
})();
