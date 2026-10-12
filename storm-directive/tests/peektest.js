// Peekaboo: the BOO hits only round you, not the spot you vanished from; the Decoy Doll (Lv 8) adds a burst there.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const run = doll => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      const w = makeSlot('peekaboo', false, doll ? 8 : 3); if (doll) w.perks = Object.assign(w.perks || {}, { 8: 'decoydoll' });
      G.weapons = [w]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const p = G.player, sx = p.x, sy = p.y, def = ENEMIES.chaser || Object.values(ENEMIES)[0];
      G.enemies.length = 0;
      const atSpot = makeEnemy(def, sx + 30, sy); atSpot.speed = 0; atSpot.hp = atSpot.maxHp = 1e9;
      const nearYou = makeEnemy(def, sx + 1630, sy); nearYou.speed = 0; nearYou.hp = nearYou.maxHp = 1e9;
      G.enemies.push(atSpot, nearYou);
      const boo = new Map(), de = damageEnemy;
      damageEnemy = (e, d, src) => { if (src && src.wname === 'BOO!') boo.set(e, (boo.get(e) || 0) + d); return de(e, d, src); };
      peekFire(w);
      for (let f = 0; f < 60 * 8; f++) { if (G.peek && !G.peek.boo) { p.x = sx + 1600; p.y = sy; } atSpot.x = sx + 30; atSpot.y = sy; nearYou.x = sx + 1630; nearYou.y = sy; update(1 / 60); G.state = 'play'; }
      damageEnemy = de;
      return { spot: Math.round(boo.get(atSpot) || 0), you: Math.round(boo.get(nearYou) || 0), sig: hasSig(w, 'decoydoll') };
    };
    return { base: run(false), doll: run(true) };
  });
  const ok = r.base.spot === 0 && r.base.you > 0 && r.doll.sig && r.doll.spot > 0;
  if (!ok) console.log('FAIL', JSON.stringify(r));
  console.log(JSON.stringify(r), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
