// The Armoury/Playpen combos, batch 2 (combos4.js): each is offered at Lv 5, fusing opens a bonus mount, its power deals damage under its own name, and its twist link (src.combo) resolves.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const R = {}, IDS = ['c_fertile', 'c_openwide', 'c_bugzapper', 'c_pickroll', 'c_nightterrors', 'c_bloodbank', 'c_lunarcycle', 'c_catchbin'];
    for (const id of IDS) {
      const c = COMBO_BY[id];
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 200; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies = [];
      G.weapons = [makeSlot(c.a, false, 6), makeSlot(c.b, false, 6), null]; recomputeAll();
      const offered = availableCombos().some(x => x.id === id);
      optCombo(c).apply();
      const mount = G.weapons.length === 4 && G.lootQueue.some(q => q.kind === 'slot');
      G.lootQueue = []; G.P.maxHp = 1e6; G.player.hp = 1e6; G.stats.dmg = {};
      
      for (let f = 0; f < 30 * 25; f++) {
        G.lootQueue = []; G.player.hp = 1e6;
        if (f % 15 === 0 && G.enemies.length < 30) for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28; const e = makeEnemy(Object.values(ENEMIES)[0], G.player.x + Math.cos(a) * rand(80, 260), G.player.y + Math.sin(a) * rand(80, 260)); e.hp = e.maxHp = 400; G.enemies.push(e); }
        G.player.x += Math.cos(f / 25) * 4; G.player.y += Math.sin(f / 25) * 4;
        update(1 / 30); G.state = 'play';
        if (id === 'c_catchbin' && f % 20 === 0) for (let i = 0; i < 6; i++) G.ebul.push({ x: G.player.x + rand(-80, 80), y: G.player.y + rand(-80, 80), vx: 0, vy: 0, r: 4, dmg: 1, life: 3, dead: false, color: '#fff' });
      }
      const NAME = c.name;
      const dmg = G.stats.dmg || {}, key = Object.keys(dmg).find(k => k.includes(NAME));
      R[id] = { offered, mount, linked: comboIdOf(NAME) === id, dmg: Math.round(key ? dmg[key] : 0), top: Object.entries(dmg).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ':' + Math.round(v)).join(' ') };
    }
    return R;
  });
  let bad = 0;
  for (const k in r) { console.log(k, JSON.stringify(r[k])); if (!r[k].offered || !r[k].mount || !r[k].linked || !(r[k].dmg > 0)) bad++; }
  console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 5).join('\n') : 'none', bad ? 'FAIL ' + bad + ' combos broken' : '');
  await b.close();
})();
