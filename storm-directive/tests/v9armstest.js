// The v9 weapons and samples back under v10 (v9arms.js, samples9.js): every v9 weapon is on the live roster with a
// live damage type and an attack type, fires and does damage on its own for 8 s without errors; the v9 combos are
// listed and one fuses; the rack shows all samples; each v9 sample starts as its v9 profile with the matrix starting offer (samplestart.js) and
// plays a few seconds; the default profile (no pick) is untouched.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; WF.on = false; splashEnd(), (typeof matrixRestore === "function" && matrixRestore()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {} };
    const LIVE = ['phys', 'fire', 'shock', 'ice', 'arcane', 'soul', 'flame'];
    if (V9_IDS.length < 60) bad.push('only ' + V9_IDS.length + ' v9 weapons');
    for (const id of V9_IDS) { const d = WEAPONS[id];
      if (!w24Live().includes(id) || d.archived) bad.push(id + ' not live');
      if (!LIVE.includes(d.v10type) || !LIVE.includes(d.elem)) bad.push(id + ' type ' + d.v10type);
      if (!V10_ATK[d.v10atk]) bad.push(id + ' atk ' + d.v10atk); }
    if (wl_combos().length < 50 || wl_pairs().length < 30) bad.push('combo lists ' + wl_combos().length + '/' + wl_pairs().length);
    // Each weapon alone for 8 s.
    const de = damageEnemy; let sum = 0;
    damageEnemy = function (e, dmg) { if (G && G.state === 'play' && dmg > 0) sum += dmg; return de.apply(this, arguments); };
    for (const id of V9_IDS) {
      try {
        META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 30;
        G.spells = []; G.weapons = [makeSlot(id, false, 3)]; recomputeAll(); G.player.hp = 1e6; G.P.maxHp = 1e6;
        const kind = ENEMIES[Object.keys(ENEMIES).find(k => ENEMIES[k].w > 0 && !ENEMIES[k].boss) || Object.keys(ENEMIES)[0]];
        for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, e = makeEnemy(kind, G.player.x + Math.cos(a) * (50 + i * 15), G.player.y + Math.sin(a) * (50 + i * 15)); e.hp = e.maxHp = 5000; e.speed = 0; G.enemies.push(e); }
        gridBuild();
        sum = 0;
        for (let f = 0; f < 480; f++) { G.lootQueue = []; G.state = 'play'; update(1 / 60); }
        if (!(sum > 0)) for (let f = 0; f < 480; f++) { G.lootQueue = []; G.state = 'play'; update(1 / 60); } // (random movers, e.g. Greased Piglet, can miss for 8 s)
        out.dmg[id] = Math.round(sum);
        if (!(sum > 0)) bad.push(id + ' did no damage');
      } catch (e) { bad.push(id + ' threw ' + e.message); }
    }
    damageEnemy = de;
    // A v9 combo fuses (Big Sibling: Spitball + Sister Cousin, both Lv 5).
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    G.weapons = [makeSlot('s_blaster', false, 5), makeSlot('s_seeker', false, 5)]; recomputeAll();
    if (!availableCombos().some(c => c.id === 'bigsib')) bad.push('bigsib not available');
    else { comboFuse(COMBO_BY.bigsib); for (let f = 0; f < 120; f++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); } if (!G.combo.bigsib) bad.push('bigsib not fused'); }
    // Tier screens: a v9 weapon's tiers are modifier cards, up to internal Lv 10 (so its combos at Lv 5 can happen).
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    { const w = makeSlot('s_blaster', false, 1); G.weapons = [w]; recomputeAll();
      for (const lv of [3, 6, 10]) {
        if (wupNextLv(w) !== lv) { bad.push('blaster next tier ' + wupNextLv(w) + ' not ' + lv); break; }
        const cs = wupRaise(w, lv); if (!cs.length || cs.some(c => c.tag !== 'MODIFIER')) { bad.push('blaster tier cards ' + cs.map(c => c.tag)); break; }
        cs[0].apply();
      }
      out.tiers = w.lvl + ' ' + (w.m10 || []).join('/'); if (w.lvl !== 10 || !(w.m10 || []).length) bad.push('blaster tiers ' + out.tiers); }
    // The rack.
    s10Samples();
    out.rack = document.querySelectorAll('#sampleList [data-s10]').length;
    if (out.rack !== SAMPLES10.length || out.rack < 20) bad.push('rack ' + out.rack + '/' + SAMPLES10.length);
    if (document.querySelectorAll('canvas[data-slpic^="v9_"]').length < S9_IDS.length) bad.push('v9 body missing from the rack'); // (v9looks.js)
    // Each v9 sample.
    for (const pid of S9_IDS) {
      try {
        META.profile = 's10_v9_' + pid; UI.sample = 's002'; UI.startGame(false);
        if (G.genes.primary !== pid) bad.push(pid + ' primary ' + G.genes.primary);
        if (!G.s10 && s10Of() !== 'v9_' + pid) bad.push(pid + ' not a sample');
        const opts = v10Loot({ kind: 'start' }), pool = s10Pool(), ids = (opts || []).map(o => W24_IDS.find(k => WEAPONS[k] === o.def || WEAPONS[k] === Object.getPrototypeOf(o.def)));
        if (!opts || opts.length !== 4 || !ids.every(id => pool.includes(id)) || new Set(ids).size !== 4 || !S10_FIT['v9_' + pid].every(id => ids.includes(id))) bad.push(pid + ' starters ' + (opts || []).map(o => o.title));
        opts[0].apply(); G.state = 'play';
        for (let f = 0; f < 300; f++) { G.lootQueue = []; G.state = 'play'; update(1 / 60); }
        if (!G.s10 || G.s10.id !== 'v9_' + pid) bad.push(pid + ' G.s10 ' + (G.s10 && G.s10.id));
      } catch (e) { bad.push(pid + ' threw ' + e.message); }
    }
    UI.show('none');
    // A fresh save's default profile is not a v9 sample.
    META.v9pick = undefined; META.profile = 'vanguard'; s9Sync(); newGame();
    if (s10Of()) bad.push('default profile became a sample');
    const d = Object.entries(out.dmg).sort((a, b) => a[1] - b[1]);
    out.med = d[d.length >> 1].join(' '); out.low = d.slice(0, 5).map(x => x.join(' ')).join(', '); out.high = d.slice(-5).map(x => x.join(' ')).join(', ');
    return { bad, out: { rack: out.rack, tiers: out.tiers, med: out.med, low: out.low, high: out.high } };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
