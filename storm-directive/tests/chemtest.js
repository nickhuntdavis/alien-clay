const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    const out = {};
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e6; G.player.hp = 1e6; G.player.x = 700; G.player.y = 300;
    const fresh = () => { G.enemies.length = 0; for (let i = 0; i < 12; i++) { const an = i * 0.5, d = 60 + (i % 3) * 30; const e = makeEnemy(ENEMIES.brute, 900 + Math.cos(an) * d, 300 + Math.sin(an) * d); e.hp = e.maxHp = 2500; G.enemies.push(e); } gridBuild(); G.stats.reactBy = {}; return G.enemies[0]; };
    const P = G.P; P.cocktail = 0.24; P.chainReact = 0.5; P.mixologist = 0.5;
    const seqs = { neutral: ['fire', 'ice'], neutral2: ['ice', 'fire'], battery: ['shock', 'fire'], battery2: ['fire', 'shock'], ester: ['poison', 'fire'], flashpoint: ['poison', 'poison', 'shock'], electro: ['ice', 'shock'], sanitiser: ['poison', 'ice'], sympathy: ['fire', 'arcane'], suds: ['ice', 'ice', 'ice', 'ice', 'ice', 'phys'], pushover: ['poison', 'poison', 'poison', 'phys'], blackout: Array(30).fill('poison'), bleach: ['oxi', 'fire'], toothpaste: ['ice', 'oxi'], rocket: ['oxi', 'poison'], ozone: ['shock', 'oxi'], exorcism: ['arcane', 'oxi'], electrolyte: ['salt', 'shock'], wound: ['fire', 'salt'], margarita: ['poison', 'salt'], crust: ['salt', 'ice'], seafoam: ['oxi', 'salt'], fizzpop: ['oxi', 'oxi', 'oxi'], cocktail: ['fire', 'shock', 'phys'] };
    for (const k in seqs) {
      const e = fresh(); const hp0 = G.enemies.reduce((s, x) => s + x.hp, 0);
      for (const el of seqs[k]) { e.reactCd = 0; damageEnemy(e, 30, { elem: el, wname: 'T' }); }
      for (let f = 0; f < 60; f++) { G.player.hp = 1e6; update(1 / 60); G.state = 'play'; }
      out[k] = JSON.stringify(G.stats.reactBy) + ' dmg ' + Math.round(hp0 - G.enemies.reduce((s, x) => s + Math.max(0, x.hp), 0)) + (k.startsWith('battery') ? ' chargeUp ' + (G.chargeUpT > G.t - 2) : '') + (k === 'blackout' ? ' hang ' + (e.hangT > G.t) : '');
    }
    // Twists: every element pair on Cold Case's weapons (duedate+frost), and on Big Sibling.
    const res = {};
    for (const ea of Object.keys(ELEMENTS)) for (const eb of Object.keys(ELEMENTS)) {
      const key = twistKey(ea, eb); if (res[key]) continue;
      fresh();
      G.weapons = [makeSlot('blaster', false, 6), makeSlot('seeker', false, 6), null]; recomputeAll(); G.combo = { bigsib: true };
      for (const [w, el] of [[G.weapons[0], ea], [G.weapons[1], eb]]) { w.mods = w.mods.filter(m => m.id !== 'elemental'); if (el !== w.def.elem) w.mods.push({ id: 'elemental', elem: el, p: 1 }); computeStats(w); }
      G.twistAt = 0; const T = activeTwists(); G.stats.dmg = {};
      for (let f = 0; f < 600; f++) { G.player.hp = 1e6; G.lootQueue = []; update(1 / 60); G.state = 'play'; if (G.enemies.filter(x => !x.dead).length < 4) fresh(); }
      res[key] = (T[0] ? T[0].tw.name : 'none') + ' ' + Math.round(G.stats.dmg[T[0] ? T[0].tw.name : 'x'] || 0);
    }
    out.twists = res;
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
