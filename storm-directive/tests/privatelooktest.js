'use strict';
// Private Schooled costumes (privatelook.js): all nine kinds draw (60 frames each, calm, pulsing and hit), the run picks by branch letter
// in a Private Schooled run only, no other sample gets one, the three stage flag tables answer Private's names and letters only while
// Private, and the stage previews keep the costume. Writes one PNG per costume to tests/out/ (colour on top, Lab-view grey below;
// calm left, pulsing and hit right).
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
    chk('nine kinds', PV_KINDS.length === 9 && new Set(PV_KINDS).size === 9);
    const ink = () => { const d = g.getImageData(0, 0, 240, 240).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; };
    // every kind draws for 60 frames, calm, pulsing and hit, and leaves ink
    for (const k of PV_KINDS) for (const [act, hit] of [[0, 0], [1, 1], [0, 0.5]]) {
      try { for (let f = 0; f < 60; f++) { g.clearRect(0, 0, 240, 240); blDrawLook(g, k, 120, 120, 14, f * 0.1, f / 30, { act: f % 20 < 5 ? act : 0, speed: act, hit }); }
        chk(k + ' draws something', ink() > 40, ink()); }
      catch (e) { bad.push('draw ' + k + ' threw ' + e.message); }
    }
    try { blDrawLook(g, 'sperm', 120, 120, 14, 0, 1, {}); blDrawLook(g, 'be_iv', 120, 120, 14, 0, 1, {}); blDrawLook(g, 'al_grind', 120, 120, 14, 0, 1, {}); } catch (e) { bad.push('earlier kinds through the wrap threw ' + e.message); }
    // a canvas of full-size pictures: colour, then Lab grey; calm and pulsing
    const shots = {};
    for (const k of PV_KINDS) {
      const S = 190, sheet = document.createElement('canvas'); sheet.width = S * 2; sheet.height = S * 2; const sg = sheet.getContext('2d');
      sg.fillStyle = '#f4ece6'; sg.fillRect(0, 0, S * 2, S * 2);
      const cell = (cx, cy, act, hit) => {
        const u = 17, x = cx + 12, y = cy;
        sg.save(); sg.lineCap = 'round'; sg.strokeStyle = '#f2b6c8'; sg.lineWidth = u * 0.4; sg.beginPath(); sg.moveTo(x - u, y); sg.bezierCurveTo(x - u * 3, y + u * 1.4, x - u * 4.5, y - u * 1.4, x - u * 6, y + u * 0.6); sg.stroke();
        sg.beginPath(); sg.ellipse(x, y, u, u * 0.82, 0, 0, Math.PI * 2); sg.fillStyle = '#f7c6d4'; sg.fill(); sg.strokeStyle = 'rgb(30,34,32)'; sg.lineWidth = 2; sg.stroke(); sg.restore();
        pvDrawLook(sg, k, x, y, u, 0.0, 2.3, { act, speed: 0.4, hit });
      };
      cell(S * 0.5, S * 0.55, 0, 0); cell(S * 1.5, S * 0.55, 1, 1);
      sg.save(); sg.translate(0, S); sg.filter = 'grayscale(1)'; sg.drawImage(sheet, 0, 0, S * 2, S, 0, 0, S * 2, S); sg.restore();
      shots[k] = sheet.toDataURL('image/png');
    }
    // the stage tables map Private's names and letters while Private, and keep the shared flags otherwise
    const tbls = { v_fire_proj: ['Silver Spoon', 'Trust Fund', 'Hostile Takeover'], v_soul_proj: ["Old Boys' Network", 'The Help', 'Legacy Admission'], s_redtape: ['NDA', 'Hush Money', "Daddy's Lawyers"] };
    for (const wid in tbls) {
      const FL = PV_OWN[wid].flags;
      SBR.as = 'private';
      tbls[wid].forEach((n, i) => { chk(wid + ' name ' + n, FL[n] === PV_BY_WEAPON[wid]['ABC'[i]], FL[n]); chk(wid + ' letter ' + 'ABC'[i], FL['ABC'[i]] === PV_BY_WEAPON[wid]['ABC'[i]], FL['ABC'[i]]); });
      for (const s of ['alpha', 'beta', 'baseline', null]) { SBR.as = s; chk(wid + ' keeps the shared flags for ' + s, ['A', 'B', 'C'].every(l => FL[l] && !PV_KINDS.includes(FL[l])), ['A', 'B', 'C'].map(l => FL[l])); chk(wid + ' names mean nothing to ' + s, tbls[wid].every(n => !PV_KINDS.includes(FL[n])), tbls[wid].map(n => FL[n])); }
      SBR.as = null;
      chk(wid + ' stage has me and step hooks', typeof PV_OWN[wid].me === 'function' && typeof PV_OWN[wid].step === 'function');
    }
    // the stage preview keeps the costume flag and stands clear of the arrow buttons
    for (const [wid, flag] of [['v_fire_proj', 'pv_spoon'], ['v_soul_proj', 'pv_help'], ['s_redtape', 'pv_lawyers']]) {
      try { const pv = makePreview(cv, WEAPONS[wid], { perk: 'siv|' + flag }); dropPreview(pv); for (let i = 0; i < 90; i++) pv.own.step(pv, 1 / 30); drawPreview(pv); chk('preview ' + wid + ' keeps ' + flag, pv.F.has(flag) && pv.me.x >= 0.3, pv.me.x); } catch (e) { bad.push('preview ' + wid + ' threw ' + e.message); }
    }
    // the run: the Private pick, per weapon and letter, and nothing under another sample
    const run = (sample, fn) => { SBR.as = sample; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; try { fn(); } finally { SBR.as = null; } };
    for (const wid in PV_BY_WEAPON) for (const l of ['A', 'B', 'C']) {
      run('private', () => { G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; const p = blPick(); chk('private pick ' + wid + ' ' + l, p && p.kind === PV_BY_WEAPON[wid][l], p && p.kind); });
      for (const s of ['alpha', 'beta', 'baseline', 'gamma', null]) run(s, () => { G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; const p = blPick(); chk('no Private costume under ' + s + ' ' + wid + ' ' + l, !p || !PV_KINDS.includes(p.kind), p && p.kind); });
    }
    // under the real run id (G.s10.id), not only SBR.as
    UI.sample = 's001'; newGame(); G.state = 'play'; G.t = 100; G.s10 = Object.assign({}, G.s10, { id: 'private' }); G.weapons = [makeSlot('s_redtape', false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: 'B' };
    chk('G.s10.id private picks pv_hush', blPick() && blPick().kind === 'pv_hush', blPick() && blPick().kind);
    G.s10.id = 'alpha'; chk('G.s10.id alpha picks none', !blPick() || !PV_KINDS.includes(blPick().kind));
    // each kind, in a real run, for 60 frames: the pick, the update, the render and the costume (calm, then hit)
    for (const wid in PV_BY_WEAPON) for (const l of ['A', 'B', 'C']) run('private', () => {
      G.weapons = [makeSlot(wid, false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: l }; G.weapons[0].firedT = 99;
      try { for (let f = 0; f < 60; f++) { if (f === 30) G.player.flash = 0.2; update(1 / 60); render(); blInRun(sx(G.player.x), sy(G.player.y)); } }
      catch (e) { bad.push('in-run ' + PV_BY_WEAPON[wid][l] + ' threw ' + e.message); }
    });
    // the run's BL_WEAP adapter (baselinelook.js's blInRun): registered when the table exists, and each kind draws through it on the live ctx
    if (typeof BL_WEAP !== 'undefined') chk('every Private kind is in BL_WEAP', PV_KINDS.every(k => typeof BL_WEAP[k] === 'function'));
    run('private', () => { for (const k of PV_KINDS) { try { for (let f = 0; f < 60; f++) { ctx.save(); ctx.translate(120, 300); ctx.rotate(f * 0.1); pvWeap(k)(3, f / 30, { act: f % 20 < 5 ? 1 : 0 }); ctx.restore(); } } catch (e) { bad.push('BL_WEAP adapter ' + k + ' threw ' + e.message); } } });
    // the wig bounces when hit: its ink moves up the screen; the live hit pulse reads G.player.flash
    const top = h => { g.clearRect(0, 0, 240, 240); blDrawLook(g, 'pv_lawyers', 120, 120, 14, 0, 1, { hit: h }); const d = g.getImageData(0, 0, 240, 240).data; for (let y = 0; y < 240; y++) for (let x = 0; x < 240; x++) if (d[(y * 240 + x) * 4 + 3] > 0) return y; return 240; };
    chk('wig lifts when hit', top(1) < top(0), [top(0), top(1)]);
    run('private', () => { G.player.flash = 0.2; chk('live hit pulse', pvHitNow() > 0.9, pvHitNow()); });
    // the watch hand ticks: the picture changes between ticks
    const wf = t => { g.clearRect(0, 0, 240, 240); blDrawLook(g, 'pv_trust', 120, 100, 14, 0, t, { act: 0 }); return g.getImageData(0, 0, 240, 240).data.reduce((a, v, i) => (a + v * (i % 97)) % 1e9, 0); };
    chk('watch hand ticks', wf(1.0) !== wf(1.4), 0);
    return { bad, shots };
  });
  for (const k in r.shots) fs.writeFileSync(path.resolve(__dirname, 'out', k + '.png'), Buffer.from(r.shots[k].split(',')[1], 'base64'));
  // a phone-scale shot of the real game with a costume on, for one look at the in-run size
  await page.evaluate(() => { SBR.as = 'private'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.weapons = [makeSlot('s_redtape', false, 1), null, null, null]; recomputeAll(); G.weapons[0].up = { p: 'C' }; G.weapons[0].firedT = G.t; for (let f = 0; f < 90; f++) { update(1 / 60); G.weapons[0].firedT = G.t; } render(); });
  await page.screenshot({ path: path.resolve(__dirname, 'out', 'pv_inrun.png') });
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('privatelooktest OK');
  await b.close();
})();
