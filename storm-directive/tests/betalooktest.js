'use strict';
// Beta costumes (betalook.js): all nine kinds draw (60 frames each, calm, pulsing, low and full health), the run picks by branch letter
// in a Beta run only, no other sample gets one, the three stage flag tables answer Beta's names and letters only while Beta, and the
// stage previews keep the costume. Writes one PNG per costume to tests/out/ (colour on top, Lab-view grey below; healthy left, low right).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], chk = (n, c, i) => { if (!c) bad.push(n + (i !== undefined ? ' [' + JSON.stringify(i) + ']' : '')); };
    const cv = document.createElement('canvas'); cv.width = cv.height = 240; const g = cv.getContext('2d');
    chk('nine kinds', BE_KINDS.length === 9 && new Set(BE_KINDS).size === 9);
    const ink = () => { const d = g.getImageData(0, 0, 240, 240).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; };
    // every kind draws for 60 frames, healthy and low, calm and pulsing, and leaves ink
    for (const k of BE_KINDS) for (const [act, hpf, vials] of [[0, 1, undefined], [1, 0.2, 10], [0, 0.55, 4]]) {
      try { for (let f = 0; f < 60; f++) { g.clearRect(0, 0, 240, 240); blDrawLook(g, k, 120, 120, 14, f * 0.1, f / 30, { act: f % 20 < 5 ? act : 0, speed: act, hpf, vials }); }
        chk(k + ' draws something', ink() > 40, ink()); }
      catch (e) { bad.push('draw ' + k + ' threw ' + e.message); }
    }
    try { blDrawLook(g, 'sperm', 120, 120, 14, 0, 1, {}); blDrawLook(g, 'al_grind', 120, 120, 14, 0, 1, {}); } catch (e) { bad.push('earlier kinds through the wrap threw ' + e.message); }
    // a canvas of full-size pictures: colour, then Lab grey; healthy and low
    const shots = {};
    for (const k of BE_KINDS) {
      const S = 190, sheet = document.createElement('canvas'); sheet.width = S * 2; sheet.height = S * 2; const sg = sheet.getContext('2d');
      sg.fillStyle = '#f4ece6'; sg.fillRect(0, 0, S * 2, S * 2);
      const cell = (cx, cy, hpf, vials) => {
        const u = 17, x = cx + 12, y = cy;
        sg.save(); sg.lineCap = 'round'; sg.strokeStyle = '#f2b6c8'; sg.lineWidth = u * 0.4; sg.beginPath(); sg.moveTo(x - u, y); sg.bezierCurveTo(x - u * 3, y + u * 1.4, x - u * 4.5, y - u * 1.4, x - u * 6, y + u * 0.6); sg.stroke();
        sg.beginPath(); sg.ellipse(x, y, u, u * 0.82, 0, 0, Math.PI * 2); sg.fillStyle = '#f7c6d4'; sg.fill(); sg.strokeStyle = 'rgb(30,34,32)'; sg.lineWidth = 2; sg.stroke(); sg.restore();
        beDrawLook(sg, k, x, y, u, 0.0, 2.3, { act: 0, speed: 0.4, hpf, vials });
      };
      cell(S * 0.55, S * 0.55, 1, 7); cell(S * 1.55, S * 0.55, 0.2, 10);
      sg.save(); sg.translate(0, S); sg.filter = 'grayscale(1)'; sg.drawImage(sheet, 0, 0, S * 2, S, 0, 0, S * 2, S); sg.restore();
      shots[k] = sheet.toDataURL('image/png');
    }
    // the stage tables map the Beta names and letters while Beta, and keep the shared flags otherwise
    const tbls = { v_arcane_proj: ['IV Drip', 'Adrenaline Shot', 'Blood Draw'], s_duedate: ['Flatline', 'DNR', 'Triage'], s_seeker: ['Next of Kin', 'Organ Donor', 'Transfusion'] };
    for (const wid in tbls) {
      const FL = PV_OWN[wid].flags;
      SBR.as = 'beta';
      tbls[wid].forEach((n, i) => { chk(wid + ' name ' + n, FL[n] === BE_BY_WEAPON[wid]['ABC'[i]], FL[n]); chk(wid + ' letter ' + 'ABC'[i], FL['ABC'[i]] === BE_BY_WEAPON[wid]['ABC'[i]], FL['ABC'[i]]); });
      for (const s of ['alpha', 'baseline', null]) { SBR.as = s; chk(wid + ' keeps the shared flags for ' + s, ['A', 'B', 'C'].every(l => FL[l] && !BE_KINDS.includes(FL[l])), ['A', 'B', 'C'].map(l => FL[l])); }
      SBR.as = null;
      chk(wid + ' stage has me and step hooks', typeof PV_OWN[wid].me === 'function' && typeof PV_OWN[wid].step === 'function');
    }
    // the stage preview keeps the costume flag and stands clear of the arrow buttons
    for (const [wid, flag] of [['v_arcane_proj', 'be_draw'], ['s_duedate', 'be_flatline'], ['s_seeker', 'be_transfusion']]) {
      try { const pv = makePreview(cv, WEAPONS[wid], { perk: 'siv|' + flag }); dropPreview(pv); for (let i = 0; i < 90; i++) pv.own.step(pv, 1 / 30); drawPreview(pv); chk('preview ' + wid + ' keeps ' + flag, pv.F.has(flag) && pv.me.x >= 0.3, pv.me.x); } catch (e) { bad.push('preview ' + wid + ' threw ' + e.message); }
    }
    // the run: the Beta pick, per weapon and letter, and nothing under another sample
    const run = (sample, fn) => { SBR.as = sample; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; try { fn(); } finally { SBR.as = null; } };
    for (const wid in BE_BY_WEAPON) for (const l of ['A', 'B', 'C']) {
      run('beta', () => { G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; const p = blPick(); chk('beta pick ' + wid + ' ' + l, p && p.kind === BE_BY_WEAPON[wid][l], p && p.kind); });
      for (const s of ['alpha', 'baseline', 'gamma', null]) run(s, () => { G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; const p = blPick(); chk('no Beta costume under ' + s + ' ' + wid + ' ' + l, !p || !BE_KINDS.includes(p.kind), p && p.kind); });
    }
    // under the real run id (G.s10.id), not only SBR.as
    UI.sample = 's001'; newGame(); G.state = 'play'; G.t = 100; G.s10 = Object.assign({}, G.s10, { id: 'beta' }); G.weapons = [makeSlot('s_duedate', false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: 'B' };
    chk('G.s10.id beta picks be_dnr', blPick() && blPick().kind === 'be_dnr', blPick() && blPick().kind);
    G.s10.id = 'alpha'; chk('G.s10.id alpha picks none', !blPick() || !BE_KINDS.includes(blPick().kind));
    // each kind, in a real run, for 60 frames: the pick, the update, the render and the costume (healthy, then low)
    for (const wid in BE_BY_WEAPON) for (const l of ['A', 'B', 'C']) run('beta', () => {
      G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; G.weapons[0].firedT = 99;
      try { for (let f = 0; f < 60; f++) { if (f === 30) G.player.hp = G.P.maxHp * 0.2; update(1 / 60); render(); blInRun(sx(G.player.x), sy(G.player.y)); } }
      catch (e) { bad.push('in-run ' + BE_BY_WEAPON[wid][l] + ' threw ' + e.message); }
    });
    // the run's BL_WEAP adapter (baselinelook.js's blInRun): registered when the table exists, and each kind draws through it on the live ctx
    if (typeof BL_WEAP !== 'undefined') chk('every Beta kind is in BL_WEAP', BE_KINDS.every(k => typeof BL_WEAP[k] === 'function'));
    run('beta', () => { for (const k of BE_KINDS) { try { for (let f = 0; f < 60; f++) { ctx.save(); ctx.translate(120, 300); ctx.rotate(f * 0.1); beWeap(k)(3, f / 30, { act: f % 20 < 5 ? 1 : 0 }); ctx.restore(); } } catch (e) { bad.push('BL_WEAP adapter ' + k + ' threw ' + e.message); } } });
    // the vial count is read when the slot has one: more vials, more red
    const red = v => { g.clearRect(0, 0, 240, 240); blDrawLook(g, 'be_draw', 120, 120, 14, 0, 1, { vials: v }); const d = g.getImageData(0, 0, 240, 240).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 150 && d[i + 1] < 70 && d[i + 2] < 80 && d[i + 3] > 200) n++; return n; };
    const r0 = red(0), r5 = red(5), r10 = red(10); chk('vials fill with the count', r0 < r5 && r5 < r10, [r0, r5, r10]);
    run('beta', () => { G.weapons = [makeSlot('v_arcane_proj', false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: 'C' }; G.weapons[0].be1 = { vials: 6 };
      chk('beVials reads a state object', beVials(G.weapons[0]) === 6, beVials(G.weapons[0])); G.weapons[0].vials = 3; chk('beVials reads the slot first', beVials(G.weapons[0]) === 3); chk('no count, null', beVials({ def: {} }) === null); });
    // the flatline and triage react to health
    const px = (kind, hpf) => { g.clearRect(0, 0, 240, 240); blDrawLook(g, kind, 120, 120, 14, 0, 1, { hpf }); return g.getImageData(0, 0, 240, 240).data; };
    const cnt = (d, f) => { let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && f(d[i], d[i + 1], d[i + 2])) n++; return n; };
    chk('triage green when healthy', cnt(px('be_triage', 1), (r, gg, b) => gg > 150 && r < 90 && b < 140) > 20);
    chk('triage amber at half', cnt(px('be_triage', 0.55), (r, gg, b) => r > 220 && gg > 150 && gg < 200 && b < 80) > 20);
    chk('triage red when low', cnt(px('be_triage', 0.2), (r, gg, b) => r > 200 && gg < 70 && b < 70) > 20);
    chk('monitor trace red and flat when low', cnt(px('be_flatline', 0.2), (r, gg, b) => r > 220 && gg < 110 && b < 110) > 20 && cnt(px('be_flatline', 1), (r, gg, b) => gg > 220 && r < 140) > 20);
    return { bad, shots };
  });
  for (const k in r.shots) fs.writeFileSync(path.resolve(__dirname, 'out', k + '.png'), Buffer.from(r.shots[k].split(',')[1], 'base64'));
  // a phone-scale shot of the real game with a costume on, for one look at the in-run size
  await page.evaluate(() => { SBR.as = 'beta'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.weapons = [makeSlot('s_duedate', false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: 'C' }; G.weapons[0].firedT = G.t; G.player.hp = G.P.maxHp * 0.25; for (let f = 0; f < 90; f++) { update(1 / 60); G.weapons[0].firedT = G.t; } render(); });
  await page.screenshot({ path: path.resolve(__dirname, 'out', 'be_inrun.png') });
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('betalooktest OK');
  await b.close();
})();
