// Flight and Crowd modifiers on the Mines Delivery (delivforms.js, MODIFIER_MATRIX.md 5.11): Homing creeps, Bounce flings
// and slides to rest, Returning rolls back, Link's tripwires set off both ends, Pull implodes, Knockback shoves from the
// mine; and the Laser's mines creep with Homing.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = (wid, mods) => {
      META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 400; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6;
      G.weapons = [makeSlot(wid || 'v_phys_proj', false, 9), null, null];
      const w = G.weapons[0];
      for (const [id, n] of mods) for (let i = 0; i < n; i++) if (!modAdd(w, id)) w.m10.push(id); // (the draft filter may still hide it: this tests the form)
      computeStats(w); G.mwAny = true; return w;
    };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + dy, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); gridBuild(); return e; };
    const tick = (t, fn) => { for (let f = 0; f < t * 60; f++) { G.t += 1 / 60; (fn || mwTick)(1 / 60); gridBuild(); } };
    const lay = w => { mwLay(w, G.enemies[0] || null, weaponSrc(w)); return mwS().mines[mwS().mines.length - 1]; };
        // Homing: an armed mine creeps towards an enemy 200 away
    let w = fresh('v_phys_proj', [['mines', 1], ['homing', 1]]); let e = foe(200, 0); let q = lay(w); const x0 = q.x; tick(1);
    out.homing = Math.round(q.x - x0); if (!(out.homing > 30)) bad.push('homing ' + out.homing);
    // Bounce: the new mine is flung at the enemy, bounces and comes to rest, then arms
    w = fresh('v_phys_proj', [['mines', 1], ['ricochet', 1]]); e = foe(120, 0); q = lay(w); const sl = !!q.xdSl; tick(2);
    out.bounce = [sl, Math.round(Math.hypot(q.x - G.player.x, q.y - G.player.y)), !q.xdSl]; if (!sl || !(out.bounce[1] > 25) || q.xdSl) bad.push('bounce ' + out.bounce);
    // Returning: a mine left 6 s rolls back towards you
    w = fresh('v_phys_proj', [['mines', 1], ['returning', 1]]); q = lay(w); q.x += 300; q.xdT0 = G.t - 7; q.armed = G.t; const d0 = Math.hypot(q.x - G.player.x, q.y - G.player.y); tick(1);
    out.ret = Math.round(d0 - Math.hypot(q.x - G.player.x, q.y - G.player.y)); if (!(out.ret > 80)) bad.push('returning ' + out.ret);
    // Link: an enemy on the wire between two mines sets off both
    w = fresh('v_phys_proj', [['mines', 1], ['connecting', 2]]); const a = lay(w), c = lay(w); a.x = G.player.x - 66; c.x = G.player.x + 66; a.y = c.y = G.player.y + 200; a.armed = c.armed = G.t;
    e = foe(0, 200); e.r = 4; gridBuild(); tick(0.1);
    out.link = [a.gone, c.gone, Math.round(e.maxHp - e.hp)]; if (!a.gone || !c.gone || !(out.link[2] > 0)) bad.push('link ' + out.link);
    // Pull: a tripped mine drags an enemy 110 away in before it goes off
    w = fresh('v_phys_proj', [['mines', 1], ['pull', 3]]); q = lay(w); q.x = G.player.x + 200; q.armed = G.t; foe(240, 0); const far = foe(200, 110);
    const fd0 = Math.hypot(far.x - q.x, far.y - q.y); tick(0.2); const imp = !!q.xdImpT; const fd1 = Math.hypot(far.x - q.x, far.y - q.y); tick(0.3);
    out.pull = [imp, Math.round(fd0 - fd1), q.gone]; if (!imp || !(fd0 - fd1 > 10) || !q.gone) bad.push('pull ' + out.pull);
    // Knockback: the blast shoves outward from the mine (an enemy beside the mine, square to you, moves sideways)
    w = fresh('v_phys_proj', [['mines', 1], ['knock', 1]]); q = lay(w); q.x = G.player.x + 200; q.y = G.player.y; q.armed = G.t; e = foe(200, 30); const ey = e.y;
    mwMineGo(q); out.knock = Math.round((e.y - ey) + (e.vy || 0) * 0.1 + (e.ky || 0)); if (!(out.knock > 0)) bad.push('knockback ' + out.knock);
    // The Laser's mines creep with Homing
    w = fresh('v_flame_beam', [['mines', 1], ['homing', 1]]); e = foe(200, 0); lzMineLay(w, weaponSrc(w), false); const m = lzS().mines[lzS().mines.length - 1]; m.armed = G.t; const lx = m.x;
    tick(0.5, dt => xdMines(XD_LZ, dt)); out.lzHoming = Math.round(m.x - lx); if (!(out.lzHoming > 15)) bad.push('laser homing ' + out.lzHoming);
    // Card text: a Mines weapon's Homing card describes the Mines form (placeholder until the user writes it)
    w = fresh('v_phys_proj', [['mines', 1]]); out.card = (modCard(w, 'homing') || {}).desc; if (out.card !== 'TODO_COPY:xd_mines_homing' && !/creep|mine/i.test(out.card || '')) bad.push('card ' + out.card);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
