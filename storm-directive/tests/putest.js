const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 760 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    const out = {};
    const setup = () => { UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies = []; G.weapons = [makeSlot('blaster', false, 3), null]; recomputeAll(); G.player.x += 600; G.t = 200; G.lsBudget = 50; };
    const foes = n => { for (let i = 0; i < n; i++) { const a = i / n * 6.28, e = makeEnemy(ENEMIES.crawler, G.player.x + Math.cos(a) * 160, G.player.y + Math.sin(a) * 160); G.enemies.push(e); } gridBuild(); };
    for (const id of PU_NEW) {
      setup(); foes(12);
      for (let i = 0; i < 5; i++) eBullet(G.player.x + 60, G.player.y, Math.PI, 30, 5, 5);
      G.player.hp = G.P.maxHp * 0.5; const hp0 = G.player.hp, x0 = G.player.x, xp0 = G.xp;
      applyPickup(id);
      const k0 = G.kills || 0;
      for (let f = 0; f < 90; f++) { G.lootQueue = []; G.player.hp = Math.max(G.player.hp, 1); update(1 / 30); G.state = 'play'; if (id === 'goldrush' && f === 5) gainXp(1); }
      const dmg = G.stats.dmg || {};
      out[id] = { chip: !!((G.pu || {})[id] > 0), kills: (G.kills || 0) - k0, dmgKeys: Object.keys(dmg).filter(k => !/Spitball/.test(k)).map(k => k + ':' + Math.round(dmg[k])).join(' '), allies: G.enemies.filter(e => e.hired && !e.dead).length, healed: Math.round(G.player.hp - hp0), r: +G.player.r.toFixed(1) };
    }
    setup(); out.scaleHp120 = +playerScale().toFixed(2); G.P.maxHp = 400; out.scaleHp400 = +playerScale().toFixed(2); G.P.maxHp = 800; out.scaleHp800 = +playerScale().toFixed(2);
    G.level = 50; G.lookKey = null; const L = shipLook(); out.tail = L.levelTail + '/' + L.tailN + '/' + L.tailLen;
    // Draw a frame with a few pickups and chips.
    G.P.maxHp = 120; G.pu = { giant: 5, centrifuge: 3 }; foes(10);
    PU_NEW.forEach((id, i) => G.pickups.push(makePickup(id, G.player.x - 160 + (i % 5) * 80, G.player.y + 120 + Math.floor(i / 5) * 70)));
    for (let f = 0; f < 5; f++) { update(1 / 30); G.state = 'play'; }
    cam.x = G.player.x; cam.y = G.player.y + 40; render(); out.url = document.querySelector('canvas').toDataURL();
    return out;
  });
  fs.writeFileSync('pu.png', Buffer.from(r.url.split(',')[1], 'base64')); delete r.url;
  for (const k in r) console.log(k, JSON.stringify(r[k]));
  console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 5) : 'none'); await b.close();
})();
