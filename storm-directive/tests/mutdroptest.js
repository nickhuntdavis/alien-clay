// Mutations from elites (mutdrop.js) and modifiers in loot boxes (modcards.js): no mutation card in any draft, a DNA
// strand always deals a modifier and a level-up never does, killing an elite carrier secures the mutation (the strand
// flies to you as the show), and a full Genome offers swaps.
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
    out.drop = !!d;
    if (!G.lootQueue.length || G.lootQueue[0].kind !== 'mutation') bad.push('kill did not secure a mutation screen');
    if (!d) bad.push('no strand dropped');
    else {
      p.x = d.x; p.y = d.y; mdTick(1 / 60);
      if (mdS().drops.length || G.lootQueue.length !== 1) bad.push('strand absorb should only be the show');
      const cs = genLoot({ kind: 'mutation' });
      out.screen = cs.map(c => c.title);
      if (cs.length !== 3 || cs.some(c => c.tag !== 'MUTATION')) bad.push('mutation screen cards: ' + cs.map(c => c.tag));
      cs[0].apply();
      const after = Object.values(G.muts || {}).reduce((a, b) => a + b, 0) + G.weapons.reduce((a, w) => a + ((w && w.wm10) || []).length, 0);
      out.taken = [before, after];
      if (after !== before + 1) bad.push('mutation not taken: ' + out.taken);
      const ch = genLoot({ kind: 'chest' });
      out.chest = ch.map(c => c.tag + ':' + c.title);
      if (!ch.length || ch.some(c => c.tag !== 'MODIFIER' || !c.modFor)) bad.push('DNA strand not all weapon modifiers: ' + out.chest);
    }
    // 2b. Genome full of mutations: the screen offers swaps that replace the lowest-ranked one.
    const swappable = CARDS.filter(c => mdIsMut(c) && c.slot === 'genome' && !c.sticky && (!c.eligible || c.eligible(G)));
    G.muts = {}; for (const c of swappable.slice(0, DRAFT.genome)) G.muts[c.id] = c.maxRank;
    if (typeof pdef === 'function') for (const k in pdef().n) pdef().n[k] = 0;
    G.weapons.forEach(w => { if (w && !w.isSpell) w.wm10 = ['x', 'x', 'x']; });
    const sw = genLoot({ kind: 'mutation' });
    out.swap = sw.map(c => c.tag + ':' + c.title + ' (' + c.sub + ')');
    if (!sw.length || sw.some(c => c.tag !== 'SWAP')) bad.push('full Genome: no swap cards: ' + out.swap);
    else { const n0 = Object.values(G.muts).filter(v => v > 0).length; sw[0].apply(); const n1 = Object.values(G.muts).filter(v => v > 0).length; if (n1 !== n0) bad.push('swap changed the mutation count: ' + [n0, n1]); }
    G.weapons.forEach(w => { if (w && !w.isSpell) w.wm10 = []; });
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
