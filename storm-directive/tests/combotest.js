// Every combo: offered at Lv 5, fusing opens a bonus mount, and its power actually deals damage.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const R = {};
    const NAME = { bigsib: 'Big Sibling', spityoyo: 'Spit Yo-Yo', whackamole: 'Nappy Mines', porcupine: 'Porcupine Hug', teacup: 'Storm in a Teacup', partyline: 'Party Line', coldcase: 'Cold Case', coldcomfort: 'Tooth Fairy', whiplash: 'Whiplash', ghosttrail: 'Pub Crawl', wormfarm: 'Bubble pop', bubblehalo: 'Bubble pop', flashpoint: 'Flash Point', sticky: 'Morning Sickness', jointhedots: 'Colouring In', invisishield: 'Placental Siphon' };
    for (const c of COMBOS) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 200; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies = [];
      G.weapons = [makeSlot(c.a, false, 6), makeSlot(c.b, false, 6), null]; recomputeAll();
      const offered = availableCombos().some(x => x.id === c.id);
      const opt = optCombo(c); opt.apply();
      const mount = G.weapons.length === 4 && G.lootQueue.some(q => q.kind === 'slot');
      G.lootQueue = []; G.P.maxHp = 1e6; G.player.hp = 1e6;
      G.stats.dmg = {};
      const before = {};
      for (let f = 0; f < 30 * 20; f++) {
        G.lootQueue = []; G.player.hp = 1e6;
        if (f % 15 === 0 && G.enemies.length < 30) for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28; const e = makeEnemy(ENEMIES.crawler || Object.values(ENEMIES)[0], G.player.x + Math.cos(a) * rand(80, 260), G.player.y + Math.sin(a) * rand(80, 260)); e.hp = e.maxHp = 400; G.enemies.push(e); }
        if (c.id === 'ghosttrail' && f % 90 === 0) peekFire(owned('peekaboo'));
        if (c.id === 'invisishield' && f % 10 === 0) for (const fr of owned('friend').friends || []) eBullet(fr.x + 20, fr.y, Math.PI, 60, 5, 5);
        G.player.x += Math.cos(f / 25) * 4; G.player.y += Math.sin(f / 25) * 4;
        update(1 / 30); G.state = 'play';
      }
      const dmg = G.stats.dmg || {};
      const key = Object.keys(dmg).find(k => k.includes(NAME[c.id]));
      R[c.id] = { offered, mount, dmg: Math.round(key ? dmg[key] : 0), top: Object.entries(dmg).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ':' + Math.round(v)).join(' ') };
      if (c.id === 'invisishield') R[c.id].stored = owned('siphon').stored;
      if (c.id === 'wormfarm') R[c.id].infected = G.enemies.filter(e => e.parasiteT > 0).length;
    }
    // Mounts: a third combo opens no further mount.
    newGame(); G.state = 'play'; G.lootQueue = [];
    G.weapons = ['tesla', 'twin', 'void'].map(id => makeSlot(id, false, 6)); recomputeAll();
    for (const c of availableCombos()) optCombo(c).apply();
    R.mountsAfterTwo = G.weapons.length + ' comboMounts=' + G.comboMounts;
    R.count = COMBOS.length;
    return R;
  });
  for (const k in r) console.log(k, JSON.stringify(r[k]));
  console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 5).join('\n') : 'none'); await b.close();
})();
