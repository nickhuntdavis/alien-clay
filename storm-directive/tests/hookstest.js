// The event hub (hooks.js): every wired listener names a function that exists, the lists are in order, and a short
// wave-mode run fires the kill, hit, hurt, fire and tick events.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; if (typeof splashEnd === 'function') splashEnd(); }); await page.waitForTimeout(500);
  const r = await page.evaluate(() => {
    const missing = [], unsorted = [];
    for (const ev in HOOKS) {
      HOOKS[ev].forEach((h, i) => { if (i && HOOKS[ev][i - 1].order > h.order) unsorted.push(ev + ':' + h.name); });
      for (const h of HOOKS[ev]) { let t; try { t = eval('typeof ' + h.name); } catch (e) { t = 'error'; } if (t !== 'function') missing.push(ev + ':' + h.name); }
    }
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
    SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    const seen = {};
    for (const ev of ['kill:early', 'kill', 'dmgMul', 'proc', 'hit:late', 'hurtMul', 'hurt', 'hurt:late', 'fire', 'tick']) hookOn(ev, 'test', () => { seen[ev] = (seen[ev] || 0) + 1; return ev === 'dmgMul' || ev === 'hurtMul' ? 1 : false; }, -1); // (first: 'fire' stops at the listener that takes the shot)
    for (let f = 0; f < 30 * 90; f++) {
      if (G.state === 'play') { let vb; if (G.lootQueue.length && !waveHoldsLoot() && (vb = v10Box(G.lootQueue[0])) !== 'wait') { const q = G.lootQueue.shift(); if (vb) UI.openLoot(q); } else update(1 / 30); }
      else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30);
      if (G.state === 'play' && waveReady()) waveBegin();
      UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
      if (f % 300 === 150 && G.state === 'play') { G.player.iframes = 0; hurtPlayer(5, 'test', null, 'test'); }
      G.player.hp = G.P.maxHp;
    }
    const counts = Object.fromEntries(Object.entries(HOOKS).map(([k, L]) => [k, L.length]));
    return { missing, unsorted, counts, seen, kills: G.kills };
  });
  const quiet = ['kill:early', 'kill', 'dmgMul', 'proc', 'hit:late', 'hurtMul', 'hurt', 'hurt:late', 'fire', 'tick'].filter(ev => !r.seen[ev]);
  const ok = !r.missing.length && !r.unsorted.length && !quiet.length && !errors.length;
  console.log(ok ? 'OK' : 'FAIL', JSON.stringify(r), quiet.length ? 'never fired: ' + quiet.join(', ') : '', errors.length ? errors : 'no errors');
  await b.close();
})();
