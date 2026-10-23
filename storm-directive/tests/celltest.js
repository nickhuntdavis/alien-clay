// Weapon cells (cellmods.js): Nappy Mines and Blowing Bubbles get their own modifier effects. Every cell runs at Lv 1 and at
// its mastery against a crowd of small and big enemies: no errors, and the weapon still deals damage. Plus the card rules
// (which modifiers are dealt, no fork screens, the two Switched at Birth alternates) and a few behaviours.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {} };
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const run = s => { for (let i = 0; i < s * 60; i++) { update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    // 1. Card rules
    let w = fresh('s_mines');
    out.nmOk = ['rapid', 'sticky', 'ricochet', 'connecting', 'extra', 'orbiting', 'range', 'piercing', 'mines'].map(id => modOk(w, id));
    if (out.nmOk.join() !== 'true,true,true,true,true,true,false,false,false') bad.push('nappy dealt ' + out.nmOk);
    w = fresh('s_bubble'); out.bbOk = ['ranged', 'piercing', 'mines', 'melee'].map(id => modOk(w, id));
    if (out.bbOk.join() !== 'false,true,true,true') bad.push('bubble dealt ' + out.bbOk);
    w = fresh('s_mines'); SET.noLimits = true; modAdd(w, 'pull'); modAdd(w, 'pull'); SET.noLimits = false;
    if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on a cell');
    const c = modCard(w, 'pull'); if (c.desc !== 'TODO_COPY:cell_nm_pull') bad.push('card text ' + c.desc);
    const alts = new Set(); for (let i = 0; i < 40; i++) { const k = sabCard(); if (k) alts.add(k.elem); } out.alts = [...alts];
    if (!(alts.has('fire') && alts.has('ice') && alts.size === 2)) bad.push('nappy alternates ' + out.alts);
    // 2. Every cell at Lv 1 and at mastery
    for (const id of ['s_mines', 's_bubble']) for (const m of XC_W[id].cells) for (const n of [1, 4]) {
      w = fresh(id); w.m10 = Array(n).fill(m); computeStats(w); crowd();
      const hp0 = () => G.enemies.reduce((s, e) => s + (e.charmed ? 0 : e.maxHp - Math.max(0, e.hp)), 0);
      const k = id.slice(2) + ':' + m + n;
      try { run(5); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(hp0() + (G.stats.kills || 0));
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
    }
    // 3. Behaviours
    w = fresh('s_mines'); w.m10 = ['nth', 'nth']; computeStats(w); crowd(); run(4); // Loaded nappy: bigger patches
    out.loaded = Math.max(0, ...G.zones.filter(z => z.xcNm === w).map(z => Math.round(z.r)));
    if (!(out.loaded > 60)) bad.push('loaded patch ' + out.loaded);
    w = fresh('s_mines'); w.m10 = ['ricochet']; computeStats(w); foe(150, 0); xcNmFire(w); const mine = G.proj.find(q => q.mine && q.w === w);
    out.slide = !!(mine && mine.xcSlide); if (!out.slide) bad.push('ricochet mine does not slide');
    w = fresh('s_bubble'); w.m10 = ['melee']; computeStats(w); update(1 / 60); out.shield = !!(w.xcSh && w.xcSh.up); if (!out.shield) bad.push('no bubble round you');
    w = fresh('s_bubble'); w.m10 = ['mines']; computeStats(w); crowd(); run(1); out.machines = xcS().mach.length; if (!(out.machines >= 1)) bad.push('no bubble machine');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
