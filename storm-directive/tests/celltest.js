// Weapon cells (cellmods.js, cellmods2.js): Nappy Mines, Blowing Bubbles, Hot Mess and Eggs get their own modifier effects. Every cell runs at Lv 1 and at
// its mastery against a crowd of small and big enemies: no errors, and the weapon still deals damage. Plus the card rules
// (which modifiers are dealt, no fork screens, the two Switched at Birth alternates) and a few behaviours.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {} }, DMG = { n: 0 };
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce); // (no cilia: a player spawned in them can't attack)
    damageEnemy = (orig => function (e, d, s) { if (s && s.w && G.weapons.includes(s.w) && !e.charmed) DMG.n += d || 0; return orig.apply(this, arguments); })(damageEnemy); // (every hit counts, even on enemies that die)
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    // (run keeps the game in play: a level-up screen would pause it)
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    // 1. Card rules
    let w = fresh('s_mines');
    out.nmOk = ['rapid', 'sticky', 'ricochet', 'connecting', 'extra', 'orbiting', 'range', 'piercing', 'mines'].map(id => modOk(w, id));
    if (out.nmOk.join() !== 'true,true,true,true,true,true,false,false,false') bad.push('nappy dealt ' + out.nmOk);
    w = fresh('s_bubble'); out.bbOk = ['ranged', 'piercing', 'mines', 'melee'].map(id => modOk(w, id));
    if (out.bbOk.join() !== 'false,true,true,true') bad.push('bubble dealt ' + out.bbOk);
    w = fresh('s_mines'); SET.noLimits = true; modAdd(w, 'pull'); modAdd(w, 'pull'); SET.noLimits = false;
    if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on a cell');
    const c = modCard(w, 'pull'); if (!c.desc || /TODO_COPY/.test(c.desc)) bad.push('card text ' + c.desc); // (cellcopy.js)
    const alts = new Set(); for (let i = 0; i < 40; i++) { const k = sabCard(); if (k) alts.add(k.elem); } out.alts = [...alts];
    if (!(alts.has('fire') && alts.has('ice') && alts.size === 2)) bad.push('nappy alternates ' + out.alts);
    // 2. Every cell at Lv 1 and at mastery
    for (const id of ['s_mines', 's_bubble', 'v_flame_pool', 's_toothfairy', 'v_shock_beam', 's_twin', 'acro_spark', 'v_phys_spread', 'acro_spray']) for (const m of XC_W[id].cells) for (const n of [1, 4]) {
      w = fresh(id); w.m10 = Array(n).fill(m); computeStats(w); crowd();
      DMG.n = 0;
      const k = XC_W[id].tag + ':' + m + n;  // (bubbles deal damage when they pop, often only once the 5 s hold ends)
      try { run(id === 's_bubble' ? (m === 'charged' ? 12 : 8) : 5); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(DMG.n);
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k + ' ' + JSON.stringify({ st: G.state, t: Math.round(G.t), en: G.enemies.filter(e => !e.dead && !e.charmed).length, near: Math.round(Math.min(...G.enemies.filter(e => !e.dead).map(e => Math.hypot(e.x - G.player.x, e.y - G.player.y)))), ws: G.weapons.filter(Boolean).length, w0: G.weapons[0] === w, cd: +w.cd.toFixed(2), ammo: w.ammo, rl: w.reloadT, hp: G.player.hp, P: [Math.round(G.player.x), Math.round(G.player.y)] }));
    }
    // 3. Behaviours
    w = fresh('s_mines'); w.m10 = ['nth', 'nth']; computeStats(w); crowd(); out.loaded = 0; // Loaded nappy: bigger patches
    for (let i = 0; i < 6 * 60; i++) { run(1 / 60); out.loaded = Math.max(out.loaded, ...G.zones.filter(z => z.xcNm === w).map(z => Math.round(z.r))); }
    if (!(out.loaded > 60)) bad.push('loaded patch ' + out.loaded);
    w = fresh('s_mines'); w.m10 = ['ricochet']; computeStats(w); foe(150, 0); xcNmFire(w); const mine = G.proj.find(q => q.mine && q.w === w);
    out.slide = !!(mine && mine.xcSlide); if (!out.slide) bad.push('ricochet mine does not slide');
    w = fresh('s_bubble'); w.m10 = ['melee']; computeStats(w); update(1 / 60); out.shield = !!(w.xcSh && w.xcSh.up); if (!out.shield) bad.push('no bubble round you');
    w = fresh('s_bubble'); w.m10 = ['mines']; computeStats(w); crowd(); run(1); out.machines = xcS().mach.length; if (!(out.machines >= 1)) bad.push('no bubble machine');
    w = fresh('s_bubble'); foe(200, 0); bubbleFire(w, G.enemies[0]); update(1 / 60); update(1 / 60); // every bubble inflates first
    const ib = TOYS().bubbles.find(q => q.w === w); out.inflate = ib ? [Math.round(ib.r), Math.round(ib.xcInf ? ib.xcInf.r : 0)] : null;
    if (!(ib && ib.xcInf && ib.r < ib.xcInf.r * 0.5)) bad.push('bubble not inflating ' + out.inflate);
    for (let i = 0; i < 30; i++) update(1 / 60); out.sent = !!(ib && ib.xcInfDone && Math.hypot(ib.vx, ib.vy) > 0); if (!out.sent) bad.push('bubble never sent');
    w = fresh('s_bubble'); w.m10 = ['melee']; computeStats(w); update(1 / 60); const e9 = foe(10, 0); e9.speed = 0; update(1 / 60); update(1 / 60); // the bubble round you pops, then grows back
    out.melee = [w.xcSh.up, +w.xcSh.g.toFixed(2), Math.round(e9.maxHp - e9.hp)];
    if (w.xcSh.up || !(w.xcSh.g < 0.2) || !(e9.hp < e9.maxHp)) bad.push('melee bubble ' + out.melee);
    w = fresh('v_flame_pool'); out.hmOk = ['rapid', 'sticky', 'mines', 'orbiting', 'ricochet', 'range'].map(id => modOk(w, id));
    if (out.hmOk.join() !== 'true,true,true,true,false,false') bad.push('hot mess dealt ' + out.hmOk);
    w = fresh('s_toothfairy'); out.egOk = ['ricochet', 'extra', 'melee', 'charged', 'mines'].map(id => modOk(w, id));
    if (out.egOk.join() !== 'true,true,true,false,false') bad.push('eggs dealt ' + out.egOk);
    w = fresh('v_flame_pool'); w.m10 = ['sticky']; computeStats(w); const e1 = foe(0, 200); e1.speed = 0; xcHmPatch(w, e1.x, e1.y); update(1 / 60); update(1 / 60); // Tar pit slows without Snaring
    out.tar = [e1.chill > 0, !(e1.snareT > G.t)]; if (out.tar.includes(false)) bad.push('tar pit ' + out.tar);
    w = fresh('v_flame_pool'); w.m10 = ['charged']; computeStats(w); const z1 = xcHmPatch(w, 0, 0); update(1 / 60); const d0 = z1.dps; for (let i = 0; i < 120; i++) update(1 / 60); // Simmer heats up
    out.simmer = [Math.round(d0 * 10) / 10, Math.round(z1.dps * 10) / 10]; if (!(z1.dps > d0 * 1.2)) bad.push('simmer ' + out.simmer);
    w = fresh('s_toothfairy'); w.m10 = ['nth']; computeStats(w); const e2 = foe(250, 0); e2.speed = 0; for (let i = 0; i < 6; i++) { TOYS().teeth.length = 0; toothFire(w, e2); } // Golden egg
    out.gold = TOYS().teeth.some(t => t.xcGoldE) || w.toothN; if (!(w.toothN >= 4)) bad.push('eggs not laid ' + w.toothN);
    w = fresh('s_toothfairy'); w.m10 = ['orbiting']; computeStats(w); out.orbEggs = 0; for (let i = 0; i < 200; i++) { update(1 / 60); out.orbEggs = Math.max(out.orbEggs, TOYS().teeth.filter(t => t.xcOrb && !t.dead).length); } // (enemies may grab them: count the most seen) if (!(out.orbEggs >= 1)) bad.push('no orbiting eggs');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
