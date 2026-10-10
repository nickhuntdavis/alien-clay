// The Twins (twins.js): the twin turns up and copies your weapons, Double Whammy doubles the second of a pair,
// Swapsies swaps you over, hits on the twin hurt you at half, and Double Dose unlocks it (seqlock.js rung 8).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    const out = { lockedFirst: profUnlocked('twins') };
    META.beatTwins = 1; out.unlocked = profUnlocked('twins'); META.profile = 'twins';
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    out.primary = G.genes.primary;
    G.weapons[0] = makeSlot('doubletrouble', false, 6); computeStats(G.weapons[0]); recomputeAll();
    const step = n => { for (let f = 0; f < n; f++) { if (G.state === 'play') update(1 / 30); else if (G.state === 'loot') { G.state = 'play'; UI.show('hud'); } else if (G.state === 'intro') updateIntro(1 / 30); G.lootQueue = []; } };
    step(60);
    out.twin = !!G.twin; out.copies = G.twin ? G.twin.weapons.map(w => w.id + '@' + w.copyK.toFixed(2)) : [];
    out.dist = G.twin ? Math.round(Math.hypot(G.twin.x - G.player.x, G.twin.y - G.player.y)) : -1;
    // Double Whammy: the second hit of a pair is doubled.
    const e = makeEnemy(ENEMIES.brute, G.player.x + 200, G.player.y); e.hp = e.maxHp = 1e7; e.armour = 0; G.enemies.push(e);
    const src = weaponSrc(G.weapons[0]); src.noCrit = true;
    const h0 = e.hp; damageEnemy(e, 100, src); const d1 = h0 - e.hp; damageEnemy(e, 100, src); const d2 = h0 - e.hp - d1;
    out.ratio = +(d2 / d1).toFixed(2);
    // Swapsies.
    const px = G.player.x, tx = G.twin.x; SEQ_ABILITY.twins.fire(true); out.swapped = Math.abs(G.player.x - tx) < 1 && Math.abs(G.twin.x - px) < 1;
    // A bullet on the twin hurts you at half.
    G.player.iframes = 0; G.shieldT = 0; G.P.dodge = 0; G.P.armour = 0; const hp0 = G.player.hp = G.P.maxHp;
    G.ebul.push({ x: G.twin.x, y: G.twin.y, vx: 0, vy: 0, dmg: 20, r: 5, color: '#f00', life: 2, from: 'Test bullets' });
    twinsTick(1 / 60); out.hurt = +(hp0 - G.player.hp).toFixed(1);
    step(30 * 20); // (twenty seconds of play with the twin about)
    out.alive = G.state;
    return out;
  });
  const fails = [];
  if (r.lockedFirst || !r.unlocked || r.primary !== 'twins') fails.push('unlock');
  if (!r.twin || !r.copies.length || r.dist > 250) fails.push('twin');
  if (!(r.ratio > 1.8 && r.ratio < 2.2)) fails.push('double');
  if (!r.swapped) fails.push('swap');
  if (!(r.hurt > 5 && r.hurt < 15)) fails.push('hurt');
  if (fails.length) console.log('FAIL', fails.join(','));
  await page.waitForTimeout(200); await page.screenshot({ path: 'twins.png', clip: { x: 0, y: 200, width: 400, height: 460 } });
  console.log(JSON.stringify(r), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
