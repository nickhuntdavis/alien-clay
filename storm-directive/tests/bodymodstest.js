const { chromium } = require('playwright');
// Rubber Johnny plates, Flinch and Full Load (bodymods.js), and that each turns up as a card.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.nextBoss = 1e9; G.enemies.length = 0; window.spawnRandom = () => {};
    update(1 / 30); const p = G.player, P = G.P, out = {};
    const hit = () => { p.iframes = 0; const h = p.hp; hurtPlayer(20, 'test', null, 'bullets'); return Math.round(h - p.hp); };
    out.plain = hit();
    // Rubber Johnny x3: three hits soaked, the fourth lands; they regrow.
    P.plates = 3; G.platesN = null; G.ebul.push({ x: p.x + 50, y: p.y, vx: 0, vy: 0, dmg: 5, r: 5, life: 5 });
    out.plated = [hit(), hit(), hit(), hit()].join('/'); out.bulletCleared = G.ebul.some(b => b.dead) || G.ebul.length === 0;
    for (let i = 0; i < 30 * 9; i++) { update(1 / 30); G.state = 'play'; }
    out.regrown = G.platesN;
    P.plates = 0;
    // Flinch: one dodge, then the cooldown.
    P.flinch = 1; G.flinchT = -99; out.flinch = [hit(), hit()].join('/'); P.flinch = 0;
    // Full Load: Feats from a full bar are stronger.
    G.spells[0] = makeSlot('thunder', true, 1); recomputeAll();
    out.cardUseful = passiveUseful('fullload');
    for (let i = 0; i < 4; i++) { const e = makeEnemy(ENEMIES.brute, p.x + 150, p.y + i * 30); e.hp = e.maxHp = 1e6; G.enemies.push(e); }
    const feat = lv => { P.fullLoad = lv; G.stam.cur = stamMax(); G.spells[0].cd = 0; G.enemies.forEach((e, k) => { e.x = p.x + 150; e.y = p.y + k * 30; e.frozen = 0; e.hp = e.maxHp; }); const f = []; const ft = floatText; window.floatText = (x, y, t, ...a) => { f.push(t); return ft(x, y, t, ...a); }; updateSpellList(G.spells, 1 / 30); window.floatText = ft; for (let i = 0; i < 40; i++) { G.enemies.forEach((e, k) => { e.x = p.x + 150; e.y = p.y + k * 30; }); update(1 / 30); G.state = 'play'; } return [f.filter(t => /LOAD/.test(t)).join(','), Math.round(G.enemies.reduce((s, e) => s + e.maxHp - e.hp, 0)), G.enemies.filter(e => e.frozen > 0).length].join(' '); };
    out.load0 = feat(0); out.load1 = feat(1); out.load2 = feat(2);
    out.inPool = ['plating', 'flinch', 'fullload'].every(id => PASSIVES[id]);
    out.noTrio = typeof trioDraw === 'undefined' && !('trio' in SET);
    return out;
  });
  console.log(JSON.stringify(r)); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
