// Mutations from elites (mutdrop.js) and modifiers in loot boxes (modcards.js): no mutation card in any draft, a DNA
// strand always deals a modifier and a level-up never does, an elite carrier drops a labelled strand, and swimming
// into it staples the mutation in.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0;
    const wid = W24_IDS.find(i => WEAPONS[i] && WEAPONS[i].v10atk === 'proj' && !WEAPONS[i].sig);
    if (!G.weapons.some(x => !x)) G.weapons.push(null); optNewWeapon(wid, 0).apply();
    // 1. Drafts: no mutations anywhere; boxes lead with a modifier, level-ups have none.
    let mutSeen = 0, boxNoMod = 0, lvlMod = 0;
    for (let i = 0; i < 120; i++) {
      const box = i % 2 === 0, cs = draftCards(3, box ? 'chest' : 'level');
      if (cs.some(c => c.card && mdIsMut({ id: c.card, slot: (CARDS.find(x => x.id === c.card) || {}).slot }))) mutSeen++;
      const mods = cs.filter(c => c.tag === 'MODIFIER').length;
      if (box && !mods) boxNoMod++;
      if (!box && mods) lvlMod++;
    }
    out.drafts = { mutSeen, boxNoMod, lvlMod };
    if (mutSeen) bad.push('mutation cards still in drafts: ' + mutSeen);
    if (boxNoMod) bad.push('loot boxes with no modifier: ' + boxNoMod);
    if (lvlMod) bad.push('level-ups with a modifier: ' + lvlMod);
    // 2. An elite carrier: marked, killed, drops a labelled strand, absorbed on touch.
    const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + 300, p.y, { elite: true }); e.speed = 0; G.enemies.push(e);
    const keep = MUTDROP.chance; MUTDROP.chance = 1; mdTick(1 / 60); MUTDROP.chance = keep;
    if (!e.mdCarry) bad.push('elite not marked as a carrier');
    const before = Object.values(G.muts || {}).reduce((a, b) => a + b, 0) + G.weapons.reduce((a, w) => a + ((w && w.wm10) || []).length, 0);
    e.hp = 0; killEnemy(e, {});
    const d = mdS().drops[0];
    out.drop = d && d.c.title;
    if (!d) bad.push('no strand dropped');
    else {
      p.x = d.x; p.y = d.y; mdTick(1 / 60);
      const after = Object.values(G.muts || {}).reduce((a, b) => a + b, 0) + G.weapons.reduce((a, w) => a + ((w && w.wm10) || []).length, 0);
      out.taken = [before, after];
      if (after !== before + 1 || mdS().drops.length) bad.push('strand not absorbed: ' + out.taken);
    }
    // 3. Ordinary enemies never carry.
    const o = makeEnemy(ENEMIES.crawler, p.x + 100, p.y); G.enemies.push(o); MUTDROP.chance = 1; mdTick(1 / 60); MUTDROP.chance = keep;
    if (o.mdCarry) bad.push('an ordinary enemy carried a mutation');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS', JSON.stringify(errors));
  await b.close();
})();
