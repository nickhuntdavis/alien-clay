// Loot rules (lootrules.js): card screens only from level-ups and boss kills. No DNA strands or mutation carriers,
// mutations back in level drafts, a boss kill opens a box at once (mid-wave too), a weapon upgrade jumps the queue.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0;
    const wid = W24_IDS.find(i => WEAPONS[i] && WEAPONS[i].v10atk === 'proj' && !WEAPONS[i].sig);
    if (!G.weapons.some(x => !x)) G.weapons.push(null); optNewWeapon(wid, 0).apply();
    // 1. Old sources are dropped, level ones kept.
    for (const k of ['chest', 'mutation', 'myth', 'vesicle', 'boss']) if (draftBox({ kind: k }) !== false) bad.push(k + ' box not dropped');
    if (draftBox({ kind: 'level' }) === false) bad.push('level box dropped');
    // 2. No DNA strands: elites and the race's spare strand.
    if (chestOr('heal') !== 'heal') bad.push('chestOr still gives a strand');
    if (MUTDROP.chance !== 0) bad.push('mutation carriers still roll');
    G.pickups.push(makePickup('chest', G.player.x + 200, G.player.y, { t: 'drop', name: 'x' })); v10Tick(1 / 60);
    if (G.pickups.some(u => u.type === 'chest')) bad.push('a strand pickup survived');
    // 3. Mutations come back into level drafts.
    let mut = 0; for (let i = 0; i < 150; i++) if (draftCards(3, 'level').some(c => c.tag === 'MUTATION')) mut++;
    out.mutDrafts = mut; if (!mut) bad.push('no mutation in 150 level drafts');
    // 4. A boss kill: one box, first in the queue, opens mid-wave.
    G.lootQueue = [{ kind: 'level' }];
    const e = makeEnemy(ENEMIES[Object.keys(ENEMIES).find(k => ENEMIES[k].boss)] || ENEMIES.brute, G.player.x + 200, G.player.y); e.boss = true; e.id = e.id || 77;
    G.bossDead = {}; bossDown(e);
    const bq = G.lootQueue.filter(q => q.kind === 'boss');
    if (bq.length !== 1) bad.push('boss kill boxes: ' + bq.length);
    if (G.lootQueue.some(q => q.kind === 'relic' || q.kind === 'spoils') && G.lootQueue.filter(q => draftBox(q) !== false).length > 2) bad.push('relic/spoils not dropped');
    G.lootQueue = G.lootQueue.filter(q => q.kind === 'boss' || q.kind === 'level');
    if (G.wave) { G.wave.active = true; }
    v10Tick(1 / 60);
    out.head = G.lootQueue[0] && G.lootQueue[0].kind;
    if (out.head !== 'boss') bad.push('boss box not first: ' + out.head);
    if (typeof waveHoldsLoot === 'function' && waveHoldsLoot()) bad.push('wave holds the boss box');
    if (draftBox(G.lootQueue[0]) !== true) bad.push('boss box does not open at once');
    const cards = genLoot(G.lootQueue[0]); out.bossCards = cards.length; if (!cards.length) bad.push('boss box has no cards');
    // 5. A weapon upgrade jumps a waiting level draft, mid-wave.
    G.lootQueue = [{ kind: 'level' }, { kind: 'wup', v10ok: true }]; v10Tick(1 / 60);
    if (G.lootQueue[0].kind !== 'wup' || !G.lootQueue[0].now) bad.push('weapon upgrade not first and immediate');
    // 6. LOOT_ANY brings the old sources back.
    window.LOOT_ANY = 1; if (MUTDROP.chance === 0) bad.push('LOOT_ANY: carriers still off'); window.LOOT_ANY = 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  const bad = r.bad.concat(errors);
  if (bad.length) { console.log('FAIL lootrulestest:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('PASS lootrulestest'); await b.close();
})();
