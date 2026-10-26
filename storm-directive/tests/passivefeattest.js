// The Passive Feat slot (passivefeat.js): Melee or Orbiting moves a weapon into it (weapon key hidden, a mount and a weapon
// draft open, dead modifiers come off and the hold view says so); while it is full, no other weapon is dealt Melee or
// Orbiting and no aura Feat is offered; Flame Cloak burns what is near; Pearl Necklace pearls pop on enemies and regrow
// (and eat shots from level 4); the HUD shows the slot and adds keys for weapon mounts past three.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    const start = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.x = 0; G.player.y = 0; G.invuln = 1e9; G.weapons = [null, null, null]; G.manual = { x: 0, y: 0 }; G.pf = null; };
    const foe = (x, y) => { const e = makeEnemy(ENEMIES.crawler, x, y); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); } };
    const gun = (i, id) => { const w = makeSlot(id, false, 3); G.weapons[i] = w; w.m10 = []; recomputeAll(); return w; };
    const card = id => CARDS.find(c => c.id === id);
    // ---- Melee moves a weapon into the slot
    start(); let a = gun(0, 'v_phys_proj'), c = gun(1, 'v_fire_proj');
    a.m10.push('homing', 'ricochet'); recomputeAll();
    const dead = (MOD_DEAD.v_phys_proj || {}).melee || []; out.deadMelee = dead;
    const hold = hcWeapon(a, 'melee', { tag: '', desc: '' }); if (!hold.includes(PF_TEXT.holdMoves)) bad.push('hold view does not say it moves to the Passive Feat slot');
    const n0 = G.weapons.length; if (!modAdd(a, 'melee')) bad.push('modAdd melee refused');
    if (pfWeapon() !== a || a.pfAura !== 'melee') bad.push('weapon not in the Passive Feat slot');
    if (G.weapons.length !== n0 + 1) bad.push('no new mount'); if (!G.lootQueue.some(q => q.kind === 'slot')) bad.push('no weapon draft');
    if (a.m10.some(id => dead.includes(id))) bad.push('dead modifiers kept: ' + a.m10);
    if (modOk(c, 'melee') || modOk(c, 'orbiting')) bad.push('a second weapon is dealt Melee or Orbiting while the slot is full');
    if (cardOk(card('feat_pf_flame_cloak'))) bad.push('aura Feat offered while the slot is full');
    UI.refreshHud(true); { const el = $('pfSlot'); if (!el || el.style.display === 'none') bad.push('no Passive Feat key on the HUD'); const wk = $('wslots').children[0]; if (wk && wk.style.display !== 'none') bad.push('the aura weapon still has a weapon key'); out.wkeys = $('wslots').children.length; if (out.wkeys < G.weapons.length) bad.push('weapon keys ' + out.wkeys + ' for ' + G.weapons.length + ' mounts'); }
    { const e = foe(60, 0); run(2); if (!(e.hp < e.maxHp)) bad.push('the aura weapon stopped hitting'); }
    // ---- Orbiting does the same; removing the weapon frees the slot
    start(); a = gun(0, 'v_shock_beam'); if (!modAdd(a, 'orbiting') || pfWeapon() !== a) bad.push('Orbiting did not move the weapon'); G.weapons[0] = null; if (!pfFree()) bad.push('slot not freed when the weapon goes');
    // ---- Flame Cloak
    start(); gun(0, 'v_phys_proj'); if (!cardOk(card('feat_pf_flame_cloak'))) bad.push('Flame Cloak not offered with the slot free'); card('feat_pf_flame_cloak').apply(G);
    if (!pfFeat() || pfFeat().id !== 'flame_cloak') bad.push('Flame Cloak not in the slot');
    G.weapons[0].cd = 99; G.weapons[0].reloadT = 99; { const near = foe(50, 0), far = foe(200, 0); run(1); out.cloak = Math.round(near.maxHp - near.hp); if (!(out.cloak > 0)) bad.push('Flame Cloak burned nothing'); if (far.hp < far.maxHp) bad.push('Flame Cloak reached 200'); }
    if (modOk(G.weapons[0], 'melee')) bad.push('Melee dealt while Flame Cloak holds the slot');
    card('feat_pf_flame_cloak_up').apply(G); if (pfFeat().lvl !== 2) bad.push('Flame Cloak did not level');
    // ---- Pearl Necklace
    start(); card('feat_pf_pearl_necklace').apply(G); run(0.1); out.pearls = G.pf.pearls.length; if (out.pearls !== PF.pearlN) bad.push('pearls ' + out.pearls);
    { const e = foe(PF.pearlR, 0); run(1); if (!(e.hp < e.maxHp)) bad.push('pearls hit nothing'); if (!G.pf.pearls.some(q => q.back > G.t)) bad.push('no pearl popped'); run(PF.regrow + 0.2); }
    G.pf.feat.lvl = 4; G.enemies.length = 0; gridBuild(); G.pf.pearls.forEach(q => { q.back = 0; }); run(0.05); { const q = G.pf.pearls[0]; G.ebul.push({ x: q.x, y: q.y, vx: 0, vy: 0, r: 4, dmg: 5, life: 2 }); run(0.05); if (!G.ebul.every(b2 => b2.dead)) bad.push('a level 4 pearl did not eat a shot'); }
    // ---- a fight with drawing
    start(); card('feat_pf_pearl_necklace').apply(G); gun(0, 'v_phys_proj'); for (let i = 0; i < 8; i++) foe(Math.cos(i) * 70, Math.sin(i) * 70); for (let i = 0; i < 180; i++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); if (i % 30 === 0) { render(); UI.refreshHud(); } }
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
