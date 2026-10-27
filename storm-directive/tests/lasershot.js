// The Laser and the modifier matrix (laser.js, modmatrix.js, spassives.js): Ordered Online's start draft offers its three
// starters, the Laser fires a Fire beam that hurts enemies, a level-up draft deals a modifier card, and modifiers fill the
// weapon's group slots. Screenshots: out/laserdraft.png (start draft), out/laser.png (the beam), out/lvdraft.png (a level-up).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const bad = [], out = {};
  await page.evaluate(() => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; UI.openLoot({ kind: 'start' }); });
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'laserdraft.png' });
  const r1 = await page.evaluate(() => ({ titles: UI.lootOpts.map(o => o.title || (o.def && o.def.name)), n: UI.lootOpts.length }));
  out.start = r1.titles;
  // (since v10.173 the start draft is exactly the sample's three weapons, SAMPLE_KIT: samplekit.js; the Laser is one of them)
  const fitN = await page.evaluate(() => SAMPLE_KIT.ordered.map(id => WEAPONS[id].name).filter(n => UI.lootOpts.some(o => (o.title || (o.def && o.def.name)) === n)).length);
  if (r1.n !== 3 || fitN !== 3) bad.push('start draft: ' + r1.titles);
  const r2 = await page.evaluate(() => {
    let i = UI.lootOpts.findIndex(o => /Laser/.test(o.title || ''));
    if (i < 0) { i = UI.lootOpts.findIndex(o => !(o.def && S10_FIT.ordered.includes(o.def.id))); UI.lootOpts[i] = optNewWeapon('v_flame_beam', 0); }
    UI.pickLoot(i);
    const w = G.weapons.find(Boolean); G.state = 'play'; G.lootQueue = [];
    const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + 140, p.y, {}); e.speed = 0; e.hp = e.maxHp = 5000; G.enemies.length = 0; G.enemies.push(e);
    return { id: w && w.id, atk: w && w.def.v10atk, elem: w && w.def.elem, hp0: e.hp };
  });
  out.weapon = r2;
  if (r2.id !== 'v_flame_beam' || r2.atk !== 'beam' || r2.elem !== 'flame') bad.push('weapon ' + JSON.stringify(r2));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'laser.png' });
  const r3 = await page.evaluate(() => {
    const e = G.enemies[0], w = G.weapons.find(Boolean), o = {};
    o.dmg = e ? Math.round(e.maxHp - e.hp) : -1;
    let mod = 0; for (let i = 0; i < 60; i++) if (draftCards(3, 'level').some(c => c.tag === 'MODIFIER')) mod++;
    o.lvlWithMod = mod;
    for (let i = 0; i < 4; i++) for (const k of modsFor(w)) if (!modHas(w, k)) modAdd(w, k);
    o.mods = (w.m10 || []).slice(); o.groups = [...mmHeld(w)]; o.slots = mmSlots(w); o.lvl = w.lvl;
    G.lootQueue = []; UI.openLoot({ kind: 'level' });
    o.lvCards = UI.lootOpts.map(c => c.tag + ':' + c.title + ' [' + c.sub + ']');
    return o;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'lvdraft.png' });
  Object.assign(out, r3);
  if (!(r3.dmg > 0)) bad.push('the Laser did no damage');
  if (!r3.lvlWithMod) bad.push('no level-up dealt a modifier');
  if (r3.groups.length > r3.slots) bad.push('more groups than slots');
  console.log(JSON.stringify(out));
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
