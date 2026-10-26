// Weapon fusion (wfusion.js): a listed pair at HUD Lv 3 each queues a fusion card; fusing hides the second weapon, opens a
// weapon mount and switches on the pair's power; declining asks again after a level; the old combos are retired; every
// one of the 8 fused powers lands damage from the right weapon.
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
    const start = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.x = 0; G.player.y = 0; G.invuln = 1e9; G.weapons = [null, null, null]; G.spells.forEach((w, i) => { G.spells[i] = null; }); G.manual = { x: 0, y: 0 }; };
    const foe = (x, y, o) => { const e = makeEnemy(ENEMIES.crawler, x, y); e.hp = e.maxHp = 1e5; e.speed = 0; if (o) Object.assign(e, o); G.enemies.push(e); gridBuild(); return e; };
    const gun = (i, id, lv) => { const w = makeSlot(id, false, 1); setWeaponLevel(w, lv || 6, 1); w.cd = 0; G.weapons[i] = w; recomputeAll(); return w; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; update(1 / 60); G.lootQueue = G.lootQueue.filter(q => q.kind === 'wfuse'); } };
    let dealtBy = new Map(); const dE = damageEnemy;
    damageEnemy = function (e, d, src) { if (src && src.w) dealtBy.set(src.w, (dealtBy.get(src.w) || 0) + 1); return dE.apply(this, arguments); };
    const fuse = id => { const f = WF_BY[id]; start(); const A = gun(0, f.a), B = gun(1, f.b); wfCheck(); const q = G.lootQueue.find(r => r.kind === 'wfuse' && r.id === id); if (!q) { bad.push(id + ': no fusion card'); return null; } G.lootQueue = []; wfOpts(q)[0].apply(); G.lootQueue = []; dealtBy = new Map(); return { A, B }; };
    // ---- the offer
    start(); { const A = gun(0, 's_tesla', 1), B = gun(1, 's_bubble', 6); wfCheck(); if (G.lootQueue.some(q => q.kind === 'wfuse')) bad.push('offered below Lv 3'); setWeaponLevel(A, 6, 1); recomputeAll(); out.tierA = wTier(A); wfCheck(); const q = G.lootQueue.find(q => q.kind === 'wfuse'); if (!q || q.id !== 'zapbub') bad.push('no offer at Lv 3 each');
      // decline, then asked again only after a level
      const opts = genLoot(q); if (opts.length !== 2) bad.push('fusion card has ' + opts.length + ' options'); opts[1].apply(); G.lootQueue = []; wfCheck(); if (G.lootQueue.some(q => q.kind === 'wfuse')) bad.push('asked again straight after declining');
      setWeaponLevel(A, 7, 6); wfCheck(); if (!G.lootQueue.some(q => q.kind === 'wfuse')) bad.push('not asked again after a level');
      // fuse
      const n0 = G.weapons.length; G.lootQueue = []; genLoot(q)[0].apply();
      if (G.weapons.length !== n0 + 1) bad.push('no new mount: ' + G.weapons.length);
      if (!(B.wfIn === A && A.wfWith === B)) bad.push('not merged');
      if (modOk(B, 'range')) bad.push('absorbed weapon still takes modifiers');
      if (!G.lootQueue.some(q => q.kind === 'slot')) bad.push('no weapon draft for the new mount');
      setWeaponLevel(A, 8, 7); run(0.1); if (B.lvl !== 8) bad.push('absorbed weapon does not level with its partner ' + B.lvl);
      wfCheck(); if (G.lootQueue.some(q => q.kind === 'wfuse')) bad.push('a fused pair is offered again');
      // the fused name shows wherever the weapon's name does, and survives a def swap
      if (A.def.name !== WF_TEXT.zapbub.name || A.def.desc !== WF_TEXT.zapbub.desc) bad.push('fused name not shown: ' + A.def.name);
      recomputeAll(); if (A.def.name !== WF_TEXT.zapbub.name) bad.push('fused name lost on recompute');
      A.def = WEAPONS.s_tesla; run(0.1); if (A.def.name !== WF_TEXT.zapbub.name) bad.push('fused name not restored after a def swap');
      if (WEAPONS.s_tesla.name === WF_TEXT.zapbub.name) bad.push('fused name leaked onto the shared weapon');
      if (!zpIs(A)) bad.push('renamed Unwanted Contact no longer fires its spark');
      UI.refreshHud(true); const el = $('wslots').children[1]; if (el && el.style.display !== 'none') bad.push('absorbed weapon still on the HUD');
    }
    // ---- old combos retired
    start(); gun(0, 's_tesla', 9); gun(1, 's_seeker', 9); if (availableCombos().length) bad.push('old combos still available');
    // ---- the 8 powers
    let P;
    if ((P = fuse('acidmess'))) { const e = foe(100, 0); wfProc(e, 10, weaponSrc(P.A)); if (!G.zones.some(z => z.wfAcid)) bad.push('acidmess: no burning patch'); run(0.6); if (!dealtBy.get(P.B)) bad.push('acidmess: patch did no damage'); }
    if ((P = fuse('sibshot'))) { const e = foe(100, 0); foe(160, 40); wfProc(e, 10, weaponSrc(P.A)); if (G.proj.filter(pr => pr.w === P.B).length < 2) bad.push('sibshot: no siblings'); run(1); if (!dealtBy.get(P.B)) bad.push('sibshot: siblings hit nothing'); }
    if ((P = fuse('pinclock'))) { const e = foe(100, 0); e.bleeds = [{ dps: 50, t: 2 }]; wfProc(e, 10, weaponSrc(P.A)); wfProc(e, 10, weaponSrc(P.A)); if (!e.wfClock || e.wfClock.n !== 2) bad.push('pinclock: needles not counted'); const h0 = e.hp; G.t += 3.1; run(0.05); if (!(h0 - e.hp >= 100)) bad.push('pinclock: Bleed did not go off at once ' + Math.round(h0 - e.hp)); }
    if ((P = fuse('hotcore'))) { const e = foe(120, 0); fireWeapon(P.A, e); run(2.5); if (!dealtBy.get(P.B)) bad.push('hotcore: core never burned'); }
    if ((P = fuse('snotfire'))) { const e = foe(120, 0); fireWeapon(P.A, e); run(2); if (!dealtBy.get(P.B)) bad.push('snotfire: puddle never burned'); }
    if ((P = fuse('zapbub'))) { for (let i = 0; i < 5; i++) foe(80 + i * 20, (i % 2) * 30); fireWeapon(P.B, G.enemies[0]); run(3); out.zapbub = dealtBy.get(P.A) || 0; if (!out.zapbub) bad.push('zapbub: popped bubbles never arced'); }
    if ((P = fuse('peekegg'))) { foe(150, 0); fireWeapon(P.A, G.enemies[0]); const T = TOYS(); if (!T.teeth.some(t => t.w === P.B)) bad.push('peekegg: no egg left behind'); }
    if ((P = fuse('lardmine'))) { const e = foe(30, 0); for (let i = 0; i < 4 && !G.proj.some(pr => pr.mine && pr.w === P.A); i++) { P.A.cd = 0; fireWeapon(P.A, e); } const m = G.proj.find(pr => pr.mine && pr.w === P.A); if (!m) bad.push('lardmine: no mine'); else { const v = foe(m.x + 20, m.y); const x0 = v.x; detonateMine(m); run(0.3); out.lard = Math.round(Math.hypot(v.x - x0, 0)); if (out.lard < 15) bad.push('lardmine: blast did not launch ' + out.lard); } }
    damageEnemy = dE;
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
