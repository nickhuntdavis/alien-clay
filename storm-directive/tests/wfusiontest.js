// Weapon fusion (wfusion.js): a listed pair at HUD Lv 3 each queues a fusion card; fusing hides the second weapon, opens a
// weapon mount and switches on the pair's power; declining asks again after a level; the old combos are retired; every
// one of the fused powers works (the five transforming ones of wfusion2.js included).
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
    if ((P = fuse('hotcore'))) { const e = foe(120, 0); fireWeapon(P.A, e); run(2.5); if (!dealtBy.get(P.B)) bad.push('hotcore: core never burned'); }
    if ((P = fuse('snotfire'))) { const e = foe(120, 0); fireWeapon(P.A, e); run(2); if (!dealtBy.get(P.B)) bad.push('snotfire: puddle never burned'); }
    // ---- the five transforming fusions (wfusion2.js)
    if ((P = fuse('sibshot'))) { const e = foe(100, 0); e.hp = 1; for (let i = 0; i < 4; i++) foe(180 + i * 30, (i % 2) * 40); P.B.cd = 1e9; P.A.cd = 0; fireWeapon(P.A, e); const shot = G.proj.find(pr => pr.w === P.A); if (shot && !(shot.homing > 0)) bad.push('sibshot: Standard Issue shot does not home'); killEnemy(e, weaponSrc(P.A)); const g1 = G.proj.filter(pr => pr.wfFam === 1).length; out.fam1 = g1; if (g1 !== 3) bad.push('sibshot: kill released ' + g1 + ' siblings, not 3'); const v = foe(300, 0); v.hp = 1; killEnemy(v, G.proj.find(pr => pr.wfFam === 1).src); if (G.proj.filter(pr => pr.wfFam === 2).length !== 2) bad.push('sibshot: sibling kill did not split in two'); const v4 = foe(320, 0); v4.hp = 1; const n4 = G.proj.length; killEnemy(v4, wfSrc(P.B, { wfFam: 4 })); if (G.proj.length !== n4) bad.push('sibshot: generation 5 spawned'); for (let i = 0; i < 20; i++) { const z = foe(400, i * 5); killEnemy(z, weaponSrc(P.A)); } if (G.proj.filter(pr => pr.wfFam && !pr.dead).length > WF2.fam.cap) bad.push('sibshot: over the cap'); }
    if ((P = fuse('pinclock'))) { const e = foe(100, 0), n1 = foe(180, 0), n2 = foe(200, 60); e.bleeds = [{ dps: 50, t: 2 }]; n1.bleeds = [{ dps: 50, t: 2 }]; wfProc(e, 10, weaponSrc(P.A)); hookRun('proc', e, 10, weaponSrc(P.A)); hookRun('proc', e, 10, weaponSrc(P.A)); if (!e.wfClock || e.wfClock.n !== 2) bad.push('pinclock: needles not counted ' + (e.wfClock && e.wfClock.n)); const h0 = e.hp, h1 = n1.hp; G.t += 3.1; run(0.05); if (!(h0 - e.hp >= 150)) bad.push('pinclock: Bleed did not go off at once ' + Math.round(h0 - e.hp)); if (!n1.wfClock || n1.wfClock.end > G.t + 0.2) bad.push('pinclock: Bleeding neighbour not set to go off'); if (!n2.wfClock) bad.push('pinclock: neighbour got no countdown'); run(0.3); if (!(h1 - n1.hp >= 100)) bad.push('pinclock: chain did not reach the Bleeding neighbour ' + Math.round(h1 - n1.hp)); }
    if ((P = fuse('zapbub'))) { const e = foe(30, 0); const T = TOYS(); const nb = T.bubbles.length; P.A.cd = 1e9; for (let i = 0; i < 3; i++) { P.B.cd = 0; fireWeapon(P.B, e); } run(0.2); if (T.bubbles.length > nb) bad.push('zapbub: loose bubbles still blown'); if (!G.wf2Storm) bad.push('zapbub: no storm bubble'); else { if (!dealtBy.get(P.A)) bad.push('zapbub: storm never zapped'); const far = foe(380, 0); dealtBy = new Map(); G.wf2Storm.charge = WF2.storm.full; run(0.05); if (G.wf2Storm.charge !== 0) bad.push('zapbub: no burst at full'); if (far.hp >= far.maxHp) bad.push('zapbub: burst did not reach 380'); } }
    if ((P = fuse('peekegg'))) { const e = foe(200, 0); e.speed = 60; P.B.cd = 1e9; fireWeapon(P.A, e); if (!G.wf2Egg) bad.push('peekegg: no decoy egg'); else { const egg = G.wf2Egg; G.player.x = -600; if (toothLure(e) !== egg) bad.push('peekegg: egg does not lure'); const h0 = e.hp; e.x = egg.x + 60; e.y = egg.y; gridBuild(); G.t = egg.end + 0.01; run(0.05); if (!(e.hp < h0)) bad.push('peekegg: egg never exploded'); if (!(e.fearT > G.t)) bad.push('peekegg: no Fear'); if (G.wf2Egg) bad.push('peekegg: egg left behind'); } }
    if ((P = fuse('lardmine'))) { const m1 = mineDrop(P.A, 0, 0), m2 = mineDrop(P.A, 250, 0); G.proj.push(m1, m2); const v = foe(30, 0), x0 = v.x; P.A.cd = P.B.cd = 1e9; m1.dead = true; detonateMine(m1); if (!v.wf2Fly || !(v.wf2Fly.vx > 0)) bad.push('lardmine: not thrown at the next mine'); let far = 0; for (let i = 0; i < 30; i++) { P.A.cd = P.B.cd = 1e9; run(1 / 60); far = Math.max(far, v.x - x0); } out.lard = Math.round(far); if (out.lard < 80) bad.push('lardmine: thrown only ' + out.lard); if (!m2.dead) bad.push('lardmine: the next mine did not chain'); }
    // ---- pairs 9 to 16
    if ((P = fuse('tapezap'))) { const t = foe(120, 0), m1 = foe(150, 20), m2 = foe(150, -20); tapeUp(P.A, t, 3); wfProc(t, 10, weaponSrc(P.B)); if (!dealtBy.get(P.B)) bad.push('tapezap: no arcs through the bundle'); }
    if ((P = fuse('wormsibs'))) { foe(150, 0); G.turrets.push({ x: 60, y: 0, life: 5, max: 5, cd: 99, rate: 99, dmg: 1, range: 1, w: P.A, src: { elem: 'poison' }, face: 0, color: '#b5e48c' }); G.wfWormT = 0; wfTick(1 / 60); if (!G.proj.some(pr => pr.w === P.B)) bad.push('wormsibs: the risen ally spat no siblings'); }
    if ((P = fuse('redlaser'))) { const e = foe(120, 0); foe(160, 20); wfProc(e, 10, weaponSrc(P.A)); if (!dealtBy.get(P.B)) bad.push('redlaser: no Static arcs'); }
    if ((P = fuse('possessed'))) { const e = foe(120, 0), m = foe(150, 0); e.charmed = true; G.wfPossT = 0; wfTick(1 / 60); if (!dealtBy.get(P.B)) bad.push('possessed: no pulse from the possessed enemy'); }
    if ((P = fuse('gainsneeze'))) { const e = foe(80, 0); wfProc(e, 10, weaponSrc(P.A)); if (!dealtBy.get(P.B)) bad.push('gainsneeze: no acid up close'); const far = foe(400, 0); dealtBy = new Map(); wfProc(far, 10, weaponSrc(P.A)); if (dealtBy.get(P.B)) bad.push('gainsneeze: acid reached 400'); }
    if ((P = fuse('nervepanic'))) { const e = foe(60, 0); foe(90, 20); G.wfNerveT = 0; wfProc(e, 10, weaponSrc(P.A)); if (!dealtBy.get(P.B)) bad.push('nervepanic: no pulse'); }
    if ((P = fuse('crossbeam'))) { for (let i = 0; i < 5; i++) foe(100 + i * 40, 60); const cdA = () => { P.A.cd = 1e9; }; for (let i = 0; i < 90; i++) { cdA(); run(1 / 60); } if (!(P.B.twins && P.B.twins.length)) bad.push('crossbeam: no twins'); else if (!dealtBy.get(P.A)) bad.push('crossbeam: no beams'); }
    if (WF_BY.spoonbub) bad.push('pair 13 should be parked');
    // ---- pair 13 as a passive pairing: There Is No Spoon + Blowing Bubbles
    const spoonRun = withBub => { start(); CARDS.find(c => c.id === 'sp_spoon').apply(G); if (withBub) gun(0, 's_bubble'); const e = foe(220, 0); const n0 = G.weapons.length;
      for (let i = 0; i < 90; i++) { if (G.weapons[0]) G.weapons[0].cd = 1e9; if (i % 10 === 0) G.ebul.push({ x: G.player.x + 30, y: G.player.y, vx: -1, vy: 0, r: 4, dmg: 8, life: 2, elem: 'phys' }); run(1 / 60); }
      return { e, grew: G.weapons.length !== n0 }; };
    { const r1 = spoonRun(true); out.spoonHit = r1.e.hp < r1.e.maxHp; if (!out.spoonHit) bad.push('spoonbub: Spoon never fired back (test set-up)'); else if (!(r1.e.wfBubT > 0)) bad.push('spoonbub: returned bullets did not trap'); if (r1.grew) bad.push('spoonbub: the pairing opened a mount'); if (!G.wfSbOn) bad.push('spoonbub: pairing never switched on'); }
    { const r2 = spoonRun(false); if (r2.e.wfBubT > 0) bad.push('spoonbub: trapped without Blowing Bubbles'); }
    damageEnemy = dE;
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
