// Flight and Crowd modifiers on the Mines Delivery (delivforms.js, MODIFIER_MATRIX.md 5.11): Homing creeps, Bounce flings
// and slides to rest, Returning rolls back, Link's tripwires set off both ends, Pull implodes, Knockback shoves from the
// mine; and the Laser's mines creep with Homing. Melee: Homing slashes, Bounce rebounds, Returning sweeps back, Link shares,
// Pull draws in, Knockback (Bouncer) collides; the Laser's sword slashes and rebounds. Strike from Above: the marker
// follows (Homing) and pulls (Pull), the strike bounces, walks back, links to the last one and shoves from where it lands;
// the Laser's orbital strike bounces, sweeps back and pulls. Orbiting: a body chases (Homing) and rebounds (Bounce), the
// ring flings out (Returning), the bodies' beam hurts (Link), the ring drags in (Pull) and bats away (Knockback); the
// Laser's ring sends a spark, flings, hits what crosses it and pulls; the hoop's hit rebounds.
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
    // ---- Melee (batch 2): a swing at an enemy 60 in front
    const swing = (w, t) => mwMelee(w, t, weaponSrc(w));
    const tickT = t => tick(t, dt => { mwTick(dt); for (const tm of G.timers) { tm.t -= dt; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(); } } }); // (with the after() timers)
    const lost = e => Math.round(e.maxHp - e.hp);
    // Homing: a slash flies at an enemy just out of reach
    w = fresh('v_phys_proj', [['melee', 1], ['homing', 1]]); e = foe(60, 0); let fo = foe(230, 0); swing(w, e); const nSl = G.xdM ? G.xdM.sl.length : 0; tickT(1);
    out.mHoming = [nSl, lost(fo)]; if (!nSl || !(lost(fo) > 0)) bad.push('melee homing ' + out.mHoming);
    // Bounce: the last hit rebounds to an enemy behind it, out of the arc
    w = fresh('v_phys_proj', [['melee', 1], ['ricochet', 1]]); e = foe(60, 0); fo = foe(60 + e.r * 2 + 40, 0); const fb = lost(fo); swing(w, e); tickT(0.2);
    out.mBounce = [fb, lost(fo)]; if (fb || !(lost(fo) > 0)) bad.push('melee bounce ' + out.mBounce);
    // Returning: the swing sweeps back 0.2 s later
    w = fresh('v_phys_proj', [['melee', 1], ['returning', 1]]); e = foe(60, 0); swing(w, e); const r1 = lost(e); tickT(0.3);
    out.mRet = [r1, lost(e)]; if (!(r1 > 0) || !(lost(e) > r1 * 1.3)) bad.push('melee returning ' + out.mRet);
    // Link: two enemies hit by one swing share a later hit on one of them
    w = fresh('v_phys_proj', [['melee', 1], ['connecting', 1]]); e = foe(60, -25); fo = foe(60, 25); swing(w, e); const l0 = lost(fo); damageEnemy(e, 1000, weaponSrc(w));
    out.mLink = [!!e.xdLk, lost(fo) - l0]; if (!e.xdLk || !(lost(fo) - l0 > 50)) bad.push('melee link ' + out.mLink);
    // Pull: an enemy just outside the reach is drawn a step in before the swing lands
    w = fresh('v_phys_proj', [['melee', 1], ['pull', 1]]); e = foe(60, 0); fo = foe(0, -(110 + 20)); const pd0 = Math.hypot(fo.x - G.player.x, fo.y - G.player.y); swing(w, e);
    out.mPull = Math.round(pd0 - Math.hypot(fo.x - G.player.x, fo.y - G.player.y)); if (!(out.mPull > 10)) bad.push('melee pull ' + out.mPull);
    // Knockback (Bouncer): the shoved enemy runs into another and both take collision damage
    w = fresh('v_phys_proj', [['melee', 1], ['knock', 1]]); e = foe(60, 0); fo = foe(260, 0); swing(w, e); const k0 = lost(fo);
    e.x = fo.x - e.r - fo.r + 1; gridBuild(); tickT(0.05);
    out.mKnock = [k0, lost(fo)]; if (k0 || !(lost(fo) > 0)) bad.push('melee knockback ' + out.mKnock);
    // The Laser's sword: Homing slashes and Bounce rebounds too
    w = fresh('v_flame_beam', [['melee', 1], ['homing', 1]]); e = foe(60, 0); fo = foe(230, 0); lzSwordSwing(w, e, weaponSrc(w), false); tickT(1);
    out.lzSwHoming = lost(fo); if (!(lost(fo) > 0)) bad.push('laser sword homing ' + out.lzSwHoming);
    w = fresh('v_flame_beam', [['melee', 1], ['ricochet', 1]]); e = foe(60, 0); fo = foe(60 + e.r * 2 + 40, 0); lzSwordSwing(w, e, weaponSrc(w), false); tickT(0.2);
    out.lzBounce = lost(fo); if (!(lost(fo) > 0)) bad.push('laser sword bounce ' + out.lzBounce);
    // Card text: a Melee weapon's Bounce card describes the Melee form
    w = fresh('v_phys_proj', [['melee', 1]]); out.mCard = (modCard(w, 'ricochet') || {}).desc; if (out.mCard !== 'TODO_COPY:xd_melee_ricochet' && !/swing|rebound/i.test(out.mCard || '')) bad.push('melee card ' + out.mCard);
    // ---- Strike from Above (batch 3): one marked strike at an enemy 200 away
    const strike = (w, t) => { mwDfa(w, t, weaponSrc(w), 1); };
    // Homing: the marker follows a target that moves during the warning, so the strike still hits it
    w = fresh('v_phys_proj', [['dfa', 1], ['homing', 1]]); e = foe(200, 0); strike(w, e); e.x += 80; gridBuild(); tickT(0.5);
    out.dHoming = lost(e); if (!(lost(e) > 0)) bad.push('strike homing ' + out.dHoming);
    // Bounce: the strike lands again on an enemy 100 from the target, outside its blast
    w = fresh('v_phys_proj', [['dfa', 1], ['ricochet', 1]]); e = foe(200, 0); fo = foe(200, 100); strike(w, e); tickT(0.45); const db0 = lost(fo); tickT(0.3);
    out.dBounce = [db0, lost(fo)]; if (db0 || !(lost(fo) > 0)) bad.push('strike bounce ' + out.dBounce);
    // Returning: small strikes walk back and hit an enemy halfway between the target and you
    w = fresh('v_phys_proj', [['dfa', 1], ['returning', 1]]); e = foe(300, 0); fo = foe(160, 0); strike(w, e); tickT(0.45); const dr0 = lost(fo); tickT(1);
    out.dRet = [dr0, lost(fo)]; if (dr0 || !(lost(fo) > 0)) bad.push('strike returning ' + out.dRet);
    // Link: a second strike is joined to the first by a beam that hurts an enemy standing on it
    w = fresh('v_phys_proj', [['dfa', 1], ['connecting', 1]]); e = foe(200, -150); const e2 = foe(200, 150); fo = foe(200, 0); strike(w, e); tickT(0.5); strike(w, e2); tickT(0.35); const dl0 = lost(fo); tickT(1);
    out.dLink = [dl0, lost(fo), G.xdD ? G.xdD.lk.length : 0]; if (dl0 || !(lost(fo) > 0)) bad.push('strike link ' + out.dLink);
    // Pull: an enemy beside the marker is dragged towards it during the warning
    w = fresh('v_phys_proj', [['dfa', 1], ['pull', 1]]); e = foe(200, 0); fo = foe(200, 80); strike(w, e); const pd = fo.y - e.y; tickT(0.3);
    out.dPull = Math.round(pd - (fo.y - e.y)); if (!(out.dPull > 10)) bad.push('strike pull ' + out.dPull);
    // Knockback: an enemy beside the blast, square to you, is thrown sideways (outward from the strike: shoved from you, it would move about 18)
    w = fresh('v_phys_proj', [['dfa', 1], ['knock', 1]]); e = foe(200, 0); fo = foe(200, 25); strike(w, e); tickT(0.45);
    out.dKnock = Math.round((fo.y - G.player.y - 25) + (fo.ky || 0)); if (!(out.dKnock > 100)) bad.push('strike knockback ' + out.dKnock);
    // The Laser's orbital strike: Bounce adds a second orbital strike; Returning sweeps a beam back; Pull drags in during the mark
    w = fresh('v_flame_beam', [['dfa', 1], ['ricochet', 1]]); e = foe(200, 0); fo = foe(200, 100); lzOrbital(w, e); const lt = dt => { lzExtrasTick(dt); mwTick(dt); };
    tick(1.45, lt); const lb0 = lost(fo); tick(0.8, lt); out.lzSBounce = [lb0, lost(fo)]; if (lb0 || !(lost(fo) > 0)) bad.push("laser strike bounce " + out.lzSBounce);
    w = fresh('v_flame_beam', [['dfa', 1], ['returning', 1]]); e = foe(300, 0); fo = foe(160, 0); lzOrbital(w, e); tick(1.4, lt); const lr0 = lost(fo); tick(0.7, lt);
    out.lzRet = [lr0, lost(fo)]; if (lr0 || !(lost(fo) > lr0)) bad.push('laser strike returning ' + out.lzRet);
    w = fresh('v_flame_beam', [['dfa', 1], ['pull', 1]]); e = foe(200, 0); fo = foe(200, 80); lzOrbital(w, e); const lp = fo.y; tick(0.3, lt);
    out.lzPull = Math.round(lp - fo.y); if (!(out.lzPull > 10)) bad.push('laser strike pull ' + out.lzPull);
    // Card text: a Strike from Above weapon's Link card describes the Strike form
    w = fresh('v_phys_proj', [['dfa', 1]]); out.dCard = (modCard(w, 'connecting') || {}).desc; if (out.dCard !== 'TODO_COPY:xd_dfa_connecting' && !/strike|beam/i.test(out.dCard || '')) bad.push('strike card ' + out.dCard);
    // ---- Orbiting (batch 4): bodies round you (Standard Issue), the Laser's ring and the hoop
    const ot = dt => { modTick(dt); mwTick(dt); for (const tm of G.timers) { tm.t -= dt; if (tm.t <= 0 && !tm.done) { tm.done = true; tm.fn(); } } };
    const at = (e, d, an) => { const p = G.player; e.x = p.x + Math.cos(an || 0) * d; e.y = p.y + Math.sin(an || 0) * d; gridBuild(); return e; };
    const dist = e => Math.hypot(e.x - G.player.x, e.y - G.player.y);
    // Homing: a body breaks off for an enemy 190 away (out of the ring's reach) and comes back
    w = fresh('v_phys_proj', [['orbiting', 1], ['homing', 1]]); e = at(foe(0, 0), 190); let went = 0; tick(1.5, dt => { ot(dt); if (w.xdOb && w.xdOb.some(o => o.st)) went = 1; });
    out.oHoming = [went, lost(e), w.xdOb.every(o => !o.st || o.st === 'back') ? 1 : 0]; if (!went || !(lost(e) > 0)) bad.push('orbit homing ' + out.oHoming);
    w = fresh('v_phys_proj', [['orbiting', 1]]); e = at(foe(0, 0), 190); tick(1.5, ot); if (lost(e)) bad.push('orbit homing: hit without it ' + lost(e));
    // Bounce: a body that hits an enemy on the ring goes on to one 70 behind it
    w = fresh('v_phys_proj', [['orbiting', 1], ['ricochet', 1]]); e = at(foe(0, 0), 72); fo = at(foe(0, 0), 142); fo.r = 8; tick(1.5, ot);
    out.oBounce = [lost(e), lost(fo)]; if (!(lost(e) > 0) || !(lost(fo) > 0)) bad.push('orbit bounce ' + out.oBounce);
    // Returning: the ring flings out over an enemy at 135 (out of its reach at rest)
    w = fresh('v_phys_proj', [['orbiting', 1], ['returning', 1]]); e = at(foe(0, 0), 135); e.r = 8; tick(1.5, ot); const or0 = lost(e); tick(2.5, ot);
    out.oRet = [or0, lost(e)]; if (or0 || !(lost(e) > 0)) bad.push('orbit returning ' + out.oRet);
    // Link: the beam between the bodies hurts an enemy inside the ring that no body touches
    w = fresh('v_phys_proj', [['orbiting', 1], ['connecting', 1]]); e = at(foe(0, 0), 34); e.r = 8; tick(2, ot);
    out.oLink = lost(e); if (!(lost(e) > 0)) bad.push('orbit link ' + out.oLink);
    // Pull: an enemy 50 outside the ring is dragged onto it
    w = fresh('v_phys_proj', [['orbiting', 1], ['pull', 1]]); e = at(foe(0, 0), 122, 2); const op0 = dist(e); tick(0.3, ot);
    out.oPull = Math.round(op0 - dist(e)); if (!(out.oPull > 10)) bad.push('orbit pull ' + out.oPull);
    // Knockback: a body bats an enemy on the ring harder than the bodies' own nudge
    const bat = mods => { const w = fresh('v_phys_proj', mods), e = at(foe(0, 0), 72), x = e.x, y = e.y; let m = 0; tick(0.6, dt => { ot(dt); m = Math.max(m, Math.hypot(e.x - x, e.y - y) + Math.hypot(e.kx || 0, e.ky || 0) * 0.1); }); return Math.round(m); };
    out.oKnock = [bat([['orbiting', 1]]), bat([['orbiting', 1], ['knock', 1]])]; if (!(out.oKnock[1] > out.oKnock[0] + 10)) bad.push('orbit knockback ' + out.oKnock);
    // The Laser's ring (held on: lzFireT): a spark chases an enemy 100 outside it; the ring flings over one at 130;
    // an enemy crossing it is hit; one 40 outside is dragged onto it
    const lzOn = w => dt => { w.lzFireT = G.t; w.lzPow = 1; ot(dt); };
    w = fresh('v_flame_beam', [['orbiting', 1], ['homing', 1]]); e = at(foe(0, 0), 175); let spk = 0; tick(1.5, dt => { lzOn(w)(dt); if (G.xdO && G.xdO.ch.length) spk = 1; });
    out.lzOHoming = [spk, lost(e)]; if (!spk || !(lost(e) > 0)) bad.push('laser orbit homing ' + out.lzOHoming);
    w = fresh('v_flame_beam', [['orbiting', 1], ['returning', 1]]); e = at(foe(0, 0), 130); e.r = 8; tick(4, lzOn(w));
    out.lzORet = lost(e); if (!(lost(e) > 0)) bad.push('laser orbit returning ' + out.lzORet);
    w = fresh('v_flame_beam', [['orbiting', 1], ['connecting', 1]]); e = at(foe(0, 0), 90); tick(0.1, lzOn(w)); const lc0 = lost(e); at(e, 55); tick(0.1, lzOn(w));
    out.lzOLink = [lc0, lost(e)]; if (lc0 || !(lost(e) > 0)) bad.push('laser orbit link ' + out.lzOLink);
    w = fresh('v_flame_beam', [['orbiting', 1], ['pull', 1]]); e = at(foe(0, 0), 115, 1); const lp0 = dist(e); tick(0.3, lzOn(w));
    out.lzOPull = Math.round(lp0 - dist(e)); if (!(out.lzOPull > 10)) bad.push('laser orbit pull ' + out.lzOPull);
    // The hoop (Static's beam): Bounce sends a hit on the hoop to an enemy 60 outside it
    w = fresh('v_shock_beam', [['orbiting', 1], ['ricochet', 1]]); e = at(foe(0, 0), 72); fo = at(foe(0, 0), 140); fo.r = 8; wupFire(w, e, weaponSrc(w)); tick(0.2, ot);
    out.hoopBounce = [lost(e), lost(fo)]; if (!(lost(e) > 0) || !(lost(fo) > 0)) bad.push('hoop bounce ' + out.hoopBounce);
    // Card text: an Orbiting weapon's Pull card describes the Orbiting form
    w = fresh('v_phys_proj', [['orbiting', 1]]); out.oCard = (modCard(w, 'pull') || {}).desc; if (out.oCard !== 'TODO_COPY:xd_orbiting_pull' && !/ring|orbit/i.test(out.oCard || '')) bad.push('orbit card ' + out.oCard);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
