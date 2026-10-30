'use strict';
// Alpha costumes (alphalook.js): all twelve kinds draw, the run picks by branch letter in an Alpha run only (the hero weapon fired
// last wins, Baseline's included), the three stage tables map the Alpha names, and the stage previews keep the costume.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], chk = (n, c, i) => { if (!c) bad.push(n + (i !== undefined ? ' [' + JSON.stringify(i) + ']' : '')); };
    const cv = document.createElement('canvas'); cv.width = cv.height = 240; const g = cv.getContext('2d');
    chk('twelve kinds', AL_KINDS.length === 12 && new Set(AL_KINDS).size === 12);
    // every kind draws, calm and pulsing, and leaves ink on the canvas
    for (const k of AL_KINDS) for (const act of [0, 1]) {
      try { g.clearRect(0, 0, 240, 240); blDrawLook(g, k, 120, 120, 14, 0.5, 1.7, { act, speed: act }); const d = g.getImageData(0, 0, 240, 240).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; chk(k + ' draws something', n > 40, n); }
      catch (e) { bad.push('draw ' + k + ' threw ' + e.message); }
    }
    try { blDrawLook(g, 'sperm', 120, 120, 14, 0, 1, {}); } catch (e) { bad.push('Baseline kind through the wrap threw ' + e.message); }
    // the three stage tables map the Alpha names, and the letters follow the run's sample
    const names = { RFV_FLAG: [RFV_FLAG, ['Grindset', 'Life Coach', 'Crypto Bro'], 'v_shock_beam'], TWV_FLAG: [TWV_FLAG, ['Wingman', 'Situationship', 'Power Couple'], 's_twin'], UCV_FLAG: [UCV_FLAG, ['Networking Event', 'Cold Caller', 'Influencer'], 's_tesla'] };
    for (const id in names) {
      const [tbl, nm, wid] = names[id];
      nm.forEach((n, i) => chk(id + ' name ' + n, tbl[n] === AL_BY_WEAPON[wid]['ABC'[i]] && AL_KINDS.includes(tbl[n]), tbl[n]));
      SBR.as = 'alpha'; chk(id + ' letters are costumes in Alpha', ['A', 'B', 'C'].every(l => tbl[l] === AL_BY_WEAPON[wid][l]), ['A', 'B', 'C'].map(l => tbl[l]));
      SBR.as = 'baseline'; chk(id + ' letters keep the old scene flag elsewhere', ['A', 'B', 'C'].every(l => tbl[l] && !AL_KINDS.includes(tbl[l])), ['A', 'B', 'C'].map(l => tbl[l]));
      SBR.as = null;
      chk(id + ' stage has me and step hooks', typeof PV_OWN[wid].me === 'function' && typeof PV_OWN[wid].step === 'function');
    }
    // the stage preview keeps the costume flag and stands clear of the arrow buttons
    for (const [wid, flag] of [['v_shock_beam', 'al_crypto'], ['s_twin', 'al_couple'], ['s_tesla', 'al_cold']]) {
      try { const pv = makePreview(cv, WEAPONS[wid], { perk: 'siv|' + flag }); dropPreview(pv); for (let i = 0; i < 90; i++) pv.own.step(pv, 1 / 30); drawPreview(pv); chk('preview ' + wid + ' keeps ' + flag, pv.F.has(flag) && pv.me.x >= 0.3, pv.me.x); } catch (e) { bad.push('preview ' + wid + ' threw ' + e.message); }
    }
    // the run: the Alpha pick, per weapon and letter
    const run = (sample, fn) => { SBR.as = sample; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; try { fn(); } finally { SBR.as = null; } };
    for (const wid in AL_BY_WEAPON) for (const l of ['A', 'B', 'C']) {
      run('alpha', () => { G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; const p = blPick(); chk('alpha pick ' + wid + ' ' + l, p && p.kind === AL_BY_WEAPON[wid][l], p && p.kind); });
      run('baseline', () => { G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; const p = blPick(); chk('no Alpha costume in a Baseline run ' + wid + ' ' + l, !p || !AL_KINDS.includes(p.kind), p && p.kind); });
    }
    run('alpha', () => { G.weapons = [makeSlot('v_shock_beam', false, 1), makeSlot('s_twin', false, 1), null, null]; recomputeAll(); chk('no letter, no costume', blPick() === null);
      G.weapons[0].up = { p: 'A' }; G.weapons[1].up = { p: 'C' }; G.weapons[0].firedT = 90; G.weapons[1].firedT = 95;
      chk('last fired wins (Power Couple)', blPick() && blPick().kind === 'al_couple', blPick() && blPick().kind);
      G.weapons[0].firedT = 99; chk('then Grindset', blPick() && blPick().kind === 'al_grind', blPick() && blPick().kind);
      G.weapons[1].firedT = 100; chk('the pick follows the weapon fired last', blPick().w === G.weapons[1]);
      try { for (let f = 0; f < 120; f++) update(1 / 60); render(); blInRun(sx(G.player.x), sy(G.player.y)); alTwinHearts(); } catch (e) { bad.push('in-run draw threw ' + e.message); } });
    // an Alpha run that also holds a Baseline hero weapon: the one fired last wins
    run('alpha', () => { G.weapons = [makeSlot('v_shock_beam', false, 1), makeSlot('v_phys_spread', false, 1), null, null]; recomputeAll(); G.weapons[0].up = { p: 'B' }; // (Shotgun: Standard Issue's heroes are sample branches now)
      const cs = genLoot({ kind: 'fork', w: G.weapons[1], lv: 3 }); if (cs && cs[0] && cs[0].apply) cs[0].apply();
      G.weapons[0].firedT = 90; G.weapons[1].firedT = 95; const a = blPick(); chk('Baseline weapon fired last wins in an Alpha run', a && !AL_KINDS.includes(a.kind), a && a.kind);
      G.weapons[0].firedT = 99; chk('and the Alpha one when it fires last', blPick() && blPick().kind === 'al_coach', blPick() && blPick().kind); });
    return { bad };
  });
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('alphalooktest OK');
  await b.close();
})();
