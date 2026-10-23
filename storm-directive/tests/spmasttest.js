// Branching sperm passive masteries (spmast.js): the fork on the 4th card, levels for the 1-level cards, defence
// mastery cards, and a sample of the A/B effects.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = 1000; G.player.hp = 1000; G.level = 30; G.weapons[0] = makeSlot('v_phys_proj', false, 3); G.weapons[1] = makeSlot('v_fire_proj', false, 3); G.weapons[2] = makeSlot('v_soul_proj', false, 3); for (const w of G.weapons) if (w) computeStats(w); };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + (dy || 0), {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); return e; };
    const card = id => CARDS.find(c => c.id === id);
    const master = (id, k) => { const c = card(id); for (let i = 0; i < 4; i++) if (c.eligible(G)) c.apply(G); const q = G.lootQueue.find(x => x.spm && x.sp === id); const cs = q && genLoot(q); if (cs) { G.lootQueue.splice(G.lootQueue.indexOf(q), 1); cs[k === 'B' ? 1 : 0].apply(); } return cs && cs.map(c => c.title); };
    // 1. The fork: 4th Slipstream card opens it; the pick sticks
    fresh(); out.slip = master('m_slip', 'B'); if (!out.slip || out.slip.length !== 2 || spmB('m_slip') !== 'B') bad.push('fork ' + out.slip);
    out.title = draftTitle({ kind: 'fork', spm: 1, sp: 'm_slip' })[0];
    // 2. Levels for a 1-level card: Big Brain 25/35/45%, then a mastery
    fresh(); const m0 = G.P.might; const bb = card('x_brain'); bb.apply(G); bb.apply(G); bb.apply(G); out.brain = +(G.P.might / m0).toFixed(2); out.brainR = mr('x_brain');
    if (out.brain !== 1.45 || out.brainR !== 3) bad.push('Big Brain levels ' + [out.brain, out.brainR]);
    G.spM = []; out.brainM = master('x_brain', 'A'); if (spmB('x_brain') !== 'A') bad.push('Big Brain mastery');
    // 3. Defence mastery: needs the defence; no slot; fork
    fresh(); const sq = card('spm_squishy'); out.sqNo = sq.eligible(G); pdefCard('squishy').apply(); out.sqYes = sq.eligible(G); const held = mutsHeld();
    sq.apply(G); const q = G.lootQueue.find(x => x.spm); genLoot(q)[1].apply(); out.sq = [spmB('squishy'), mutsHeld() - held];
    if (out.sqNo || !out.sqYes || out.sq[0] !== 'B' || out.sq[1] !== 0) bad.push('defence mastery ' + JSON.stringify([out.sqNo, out.sqYes, out.sq]));
    // 4. Effects: Evasion Counter (+50% next hit); Cushion halves the hit past half health
    fresh(); G.spMx = { evasion: 1 }; G.spB = { evasion: 'A' }; G.spEvT = G.t + 1; G.muts = {}; mutSt();
    const e = foe(200); const k1 = mutDmg(e, weaponSrc(G.weapons[0]), 'force'); out.counter = k1; if (Math.abs(k1 - 1.5) > 0.01) bad.push('Counter ' + k1);
    fresh(); master('m_pad', 'B'); G.player.hp = 0.55 * G.P.maxHp; const d = mutHurtIn(0.2 * G.P.maxHp, null, 'proj'); out.cushion = +(d / G.P.maxHp).toFixed(2); if (out.cushion !== 0.1) bad.push('Cushion ' + d);
    // 5. Group Project Third Wheel: three weapons in the window
    fresh(); master('r_group', 'B'); const g = foe(300); mutDmg(g, weaponSrc(G.weapons[0]), 'force'); G.t += 0.1; mutDmg(g, weaponSrc(G.weapons[1]), 'acid'); G.t += 0.1;
    out.third = +mutDmg(g, weaponSrc(G.weapons[2]), 'soul').toFixed(2); if (out.third < 1.9) bad.push('Third Wheel ' + out.third);
    // 6. Heartbeat Double Beat: a second burst after 0.3 s
    fresh(); master('m_heart', 'B'); const h = foe(40); const h0 = h.hp; mutBurst(G.player.x, G.player.y, 120, 10, 'Heartbeat', 'heart'); const h1 = h.hp; for (let i = 0; i < 30; i++) update(1 / 60);
    out.beat = [Math.round(h0 - h1), Math.round(h1 - h.hp)]; if (!(h.hp < h1)) bad.push('Double Beat ' + out.beat);
    // 7. every branch has two cards with text
    out.missing = Object.keys(SPM_BR).filter(id => SPM_BR[id].length !== 4 || SPM_BR[id].some(x => !x));
    if (out.missing.length) bad.push('branch text ' + out.missing);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
