// Baseline costumes (baselinelook.js): the six weapon costumes draw without errors, the stage flag tables select them, the run picks the hero
// weapon fired last, drawn in the sharp body pass; Standard Issue's stage flags are its own again; a sample branch costume hides the weapon one.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], chk = (n, c, i) => { if (!c) bad.push(n + (i !== undefined ? ' [' + JSON.stringify(i) + ']' : '')); };
    const cv = document.createElement('canvas'); cv.width = cv.height = 200; const g = cv.getContext('2d');
    for (const k of BL_KINDS) for (const act of [0, 1]) { try { blDrawLook(g, k, 100, 100, 12, 0.5, 1.3, { act, speed: act, mark: !!act }); } catch (e) { bad.push('draw ' + k + ' threw ' + e.message); } }
    chk('six weapon kinds', BL_KINDS.length === 6);
    chk('Standard Issue stage flags are its own', SIV_FLAG.A === 'A' && SIV_FLAG.C === 'C' && !BL_BY_WEAPON.v_phys_proj, [SIV_FLAG.A, SIV_FLAG.C]);
    // each weapon's three letters map to three distinct costume flags in its stage tables
    for (const [id, tbl, key] of [['v_phys_spread', MGV_FLAG, 'MG'], ['v_phys_contact', NWV_FLAG, 'HG']]) {
      const got = ['A', 'B', 'C'].map(l => tbl[l]); chk(key + ' stage flags', got.every(f => BL_KINDS.includes(f)) && new Set(got).size === 3, got);
      chk(key + ' stage has a me hook', typeof PV_OWN[id].me === 'function');
      chk(key + ' flag letters match the costume table', ['A', 'B', 'C'].every(l => tbl[l] === BL_BY_WEAPON[id][l]));
    }
    // the stage preview draws the costume on its sperm
    for (const [id, flag] of [['v_phys_spread', 'evil'], ['v_phys_contact', 'biting']]) {
      try { const pv = makePreview(cv, WEAPONS[id], { perk: 'siv|' + flag }); dropPreview(pv); for (let i = 0; i < 90; i++) pv.own.step(pv, 1 / 30); drawPreview(pv); chk('preview ' + id + ' keeps the costume flag', pv.F.has(flag) && pv.me.x >= 0.3, pv.me.x); } catch (e) { bad.push('preview ' + id + ' threw ' + e.message); }
    }
    // the run: the hero weapon fired last decides the costume
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
    G.s10 = { id: 'baseline', strain: 1, run: 1, ev: 0, shiftT: 12, shiftI: 0, trailT: 0, low: false };
    G.weapons = [makeSlot('v_phys_spread', false, 1), makeSlot('v_phys_contact', false, 1), makeSlot('v_phys_proj', false, 1), null]; recomputeAll();
    chk('no costume without a branch', blPick() === null);
    const cs = genLoot({ kind: 'fork', w: G.weapons[0], lv: 3 }); cs[1].apply(); const cs2 = genLoot({ kind: 'fork', w: G.weapons[1], lv: 3 }); cs2[2].apply(); genLoot({ kind: 'fork', w: G.weapons[2], lv: 3 })[0].apply();
    G.weapons[0].firedT = 90; G.weapons[1].firedT = 95; G.weapons[2].firedT = 99; chk('last fired hero wins (Biting; Standard Issue has none)', blPick() && blPick().kind === 'biting', blPick() && blPick().kind);
    G.weapons[0].firedT = 99.5; chk('then Evil Dead', blPick() && blPick().kind === 'evil', blPick() && blPick().kind);
    let drawn = 0; const dl = blDrawLook; blDrawLook = function () { drawn++; return dl.apply(this, arguments); };
    try { for (let f = 0; f < 120; f++) update(1 / 60); render(); } catch (e) { bad.push('in-run draw threw ' + e.message); }
    chk('the weapon costume is drawn with your body', drawn > 0, drawn);
    genLoot({ kind: 'fork', smb: { lv: 3 } })[2].apply(); drawn = 0; render();
    chk('a sample branch costume hides it', drawn === 0 && blSmbKind() === 'robocop', [drawn, blSmbKind()]);
    blDrawLook = dl;
    return { bad };
  });
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('baselinelooktest OK');
  await b.close();
})();
