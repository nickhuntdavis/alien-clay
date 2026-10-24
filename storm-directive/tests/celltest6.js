// Weapon cells, part 6 (cellmods6.js): Rent Free and Chest Burster. Card rules (dealt and N/A, no fork screens, a plain card
// line for every cell), every cell at rank 1 and at its mastery against a crowd (no errors, the weapon still deals damage),
// and the headline behaviours: possession cells, the poltergeist, ghost mines, the undead cells, contagion and traps.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {} }, DMG = { n: 0 };
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce);
    damageEnemy = (orig => function (e, d, s) { if (s && s.w && G.weapons.includes(s.w) && !e.charmed) DMG.n += d || 0; return orig.apply(this, arguments); })(damageEnemy);
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.turrets.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const set = (w, m) => { w.m10 = m; computeStats(w); return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const step = n => { for (let i = 0; i < n; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; } };
    const run = s => { for (let i = 0; i < s * 60; i++) { step(1); if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    const RF = 'v_soul_proj', CB = 's_parasite';
    // 1. Card rules
    let w = fresh(RF);
    out.rfOk = ['ranged', 'melee', 'turncoat', 'piercing', 'orbiting', 'area'].map(id => modOk(w, id));
    if (out.rfOk.join() !== 'false,true,true,true,true,true') bad.push('rent free dealt ' + out.rfOk);
    w = fresh(CB); out.cbOk = ['ranged', 'turncoat', 'melee', 'mines', 'orbiting', 'area'].map(id => modOk(w, id));
    if (out.cbOk.join() !== 'false,false,true,true,true,true') bad.push('chest burster dealt ' + out.cbOk);
    for (const id of [RF, CB]) {
      w = fresh(id); SET.noLimits = true; modAdd(w, 'pull'); modAdd(w, 'pull'); modAdd(w, 'pull'); modAdd(w, 'pull'); SET.noLimits = false;
      if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on ' + id);
      for (const m of XC_W[id].cells) {
        const line = SLICE_COPY['cell_' + XC_W[id].tag + '_' + m];
        if (!line || /TODO_COPY/.test(line)) bad.push('no card line cell_' + XC_W[id].tag + '_' + m);
      }
      const c = modCard(w, 'knock'); if (!c.desc || /TODO_COPY/.test(c.desc)) bad.push('card text ' + c.desc);
      if (MM_SAB[id]) bad.push('switched at birth dealt on ' + id);
    }
    // 2. Every cell at rank 1 and at its mastery
    for (const id of [RF, CB]) for (const m of XC_W[id].cells) for (const n of [1, 4]) {
      w = set(fresh(id), Array(n).fill(m)); crowd(); DMG.n = 0;
      const k = XC_W[id].tag + ':' + m + n;
      try { run(4); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(DMG.n);
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
    }
    // 3. Behaviours: Rent Free
    const hit = (w, e) => { const p = G.player; spawnProj(w, p.x, p.y, Math.atan2(e.y - p.y, e.x - p.x), weaponSrc(w)); for (let i = 0; i < 90 && !(e.maxHp - e.hp > 0); i++) step(1); };
    w = set(fresh(RF), ['upclose']); let e = foe(90, 0); e.speed = 0; hit(w, e); // a close hit Possesses
    out.upclose = [!!e.charmed, e.c6H === w]; if (!e.charmed || e.c6H !== w) bad.push('up close possession ' + out.upclose);
    w = set(fresh(RF), ['knock', 'knock']); e = foe(150, 0); e.speed = 0; const x0 = e.x; hit(w, e); step(30); // the ghost pushes 60
    out.knock = Math.round(e.x - x0); if (!(out.knock > 25)) bad.push('rent free knock ' + out.knock);
    w = set(fresh(RF), ['pull']); e = foe(200, 30); e.speed = 0; const e0 = { x: e.x, y: e.y }; spawnProj(w, G.player.x, G.player.y + 30, 0, weaponSrc(w)); step(70); // a ghost passing drags it
    out.pull = Math.round(e.x - e0.x); if (!(out.pull > 15)) bad.push('rent free pull ' + out.pull);
    w = set(fresh(RF), ['ricochet', 'ricochet']); e = foe(150, 0); e.speed = 0; const pr = spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); const vx0 = pr.vx; step(60); // bounces back
    out.ric = [pr.c6Ric, Math.round(vx0), Math.round(pr.vx)]; if (!(pr.c6Ric < 3 && pr.vx < 0)) bad.push('rent free ricochet ' + out.ric);
    w = set(fresh(RF), ['area']); e = foe(250, 0); e.speed = 0; const nb = foe(275, 0); nb.speed = 0; const nx0 = nb.x; C6.poss(w, e, 3); step(20); // Cold spot
    out.cold = Math.round(nb.x - nx0); if (!(out.cold > 5)) bad.push('cold spot ' + out.cold);
    w = set(fresh(RF), ['connecting']); const h1 = foe(250, -120), h2 = foe(250, 120); h1.speed = h2.speed = 0; C6.poss(w, h1, 5); C6.poss(w, h2, 5); const gap0 = Math.hypot(h1.x - h2.x, h1.y - h2.y); step(60); // Hive mind
    out.hive = [Math.round(gap0), Math.round(Math.hypot(h1.x - h2.x, h1.y - h2.y))]; if (!(out.hive[1] < out.hive[0] - 30)) bad.push('hive mind ' + out.hive);
    w = set(fresh(RF), ['sticky']); e = foe(300, 0); C6.poss(w, e, 4); const sp0 = e.c6Spd; step(5); out.sticky = [sp0, +e.speed.toFixed(1)]; if (!(e.speed < sp0)) bad.push('sticky host speed ' + out.sticky);
    e.charmT = 0.01; step(5); out.stickyEnd = e.speed === sp0; if (!out.stickyEnd) bad.push('host speed not restored');
    w = set(fresh(RF), ['turncoat']); e = foe(300, 0); C6.rfPolter(w, e); const f = foe(320, 40); f.speed = 0; step(90); // poltergeist Fears
    out.polter = [C6.C().pg.length, f.fearT > 100]; if (!(out.polter[0] === 1 && out.polter[1])) bad.push('poltergeist ' + out.polter);
    w = set(fresh(RF), ['mines']); fireWeapon(w, foe(400, 0)); const mn = C6.C().mines.find(q => q.w === w); out.mine = !!mn;
    if (mn) { step(30); e = foe(mn.x - G.player.x + 10, mn.y - G.player.y, false); e.speed = 0; step(3); out.mine = [!!mn, mn.end === 0, !!e.charmed]; if (!e.charmed) bad.push('ghost mine ' + out.mine); } else bad.push('no ghost mine');
    w = set(fresh(RF), ['melee']); e = foe(16, 0); e.speed = 0; step(10); out.touch = !!e.charmed; if (!out.touch) bad.push('haunted touch');
    w = set(fresh(RF), ['orbiting']); e = foe(400, 0); fireWeapon(w, e); out.orbit = G.proj.some(q => q.w === w && q.orbitT > 0); if (!out.orbit) bad.push('ghost does not circle');
    w = set(fresh(RF), ['explode']); e = foe(150, 0); e.speed = 0; const n2 = foe(170, 0); n2.speed = 0; hit(w, e); step(30); out.burst = Math.round(n2.maxHp - n2.hp); if (!(out.burst > 0)) bad.push('ghost burst ' + out.burst);
    w = set(fresh(RF), ['dfa']); e = foe(200, 0); e.speed = 0; C6.dive(w, e); step(40); out.dive = [!!e.charmed, Math.round(e.maxHp - e.hp)]; if (!e.charmed) bad.push('dive ' + out.dive);
    // 4. Behaviours: Chest Burster
    const kill = (w, e) => { damageEnemy(e, 50, weaponSrc(w)); e.hp = 1; damageEnemy(e, 50, weaponSrc(w)); step(2); };
    w = set(fresh(CB), ['upclose', 'upclose']); e = foe(90, 0); e.speed = 0; hit(w, e); out.c6K = e.c6K; kill(w, e); // stronger undead from a close infection
    const tu = C6.undead(w)[0]; out.ucDmg = tu ? [Math.round(tu.dmg), Math.round(w.s.dmg * 1.2)] : null;
    if (!(tu && tu.dmg > w.s.dmg * 1.2 * 1.3)) bad.push('close undead not stronger ' + JSON.stringify(out.ucDmg));
    w = set(fresh(CB), ['kinship', 'kinship', 'kinship', 'kinship']); for (let i = 0; i < 7; i++) kill(w, foe(200 + i * 30, 0)); step(5); // the cap rises to 6
    out.cap6 = C6.undead(w).length; if (out.cap6 !== 6) bad.push('kinship undead cap ' + out.cap6);
    w = set(fresh(CB), []); for (let i = 0; i < 6; i++) kill(w, foe(200 + i * 30, 0)); step(5); out.cap4 = G.turrets.filter(t => t.w === w && t.life > 0).length; if (out.cap4 !== 4) bad.push('plain undead cap ' + out.cap4);
    w = set(fresh(CB), ['orbiting']); kill(w, foe(300, 0)); step(90); const g = C6.undead(w)[0]; out.guard = g ? Math.round(Math.hypot(g.x - G.player.x, g.y - G.player.y)) : null; if (!(g && out.guard < 110)) bad.push('bodyguard ' + out.guard);
    w = set(fresh(CB), ['melee']); e = foe(40, 0); e.speed = 0; step(20); out.hug = [!!(w.c6Fh && w.c6Fh.host === e), e.parasiteT > 0]; if (out.hug.includes(false)) bad.push('facehugger ' + out.hug);
    w = set(fresh(CB), ['mines']); fireWeapon(w, foe(400, 0)); const tr = C6.C().traps.find(q => q.w === w);
    if (tr) { step(30); e = foe(tr.x - G.player.x + 5, tr.y - G.player.y, false); e.speed = 0; step(3); out.trap = [tr.end === 0, e.parasiteT > 0]; if (out.trap.includes(false)) bad.push('trap ' + out.trap); } else bad.push('no trap');
    w = set(fresh(CB), ['connecting']); e = foe(250, 0); e.speed = 0; const m1 = foe(300, 0), m2 = foe(250, 60); m1.speed = m2.speed = 0; hit(w, e); step(5); // contagion
    out.contagion = [C6.C().links.length, m1.parasiteT > 0, m2.parasiteT > 0]; if (!(out.contagion[0] >= 2 && out.contagion[1] && out.contagion[2])) bad.push('contagion ' + out.contagion);
    w = set(fresh(CB), ['explode']); e = foe(250, 0); e.speed = 0; const m3 = foe(275, 0); m3.speed = 0; hit(w, e); kill(w, e); out.deathBurst = [Math.round(m3.maxHp - m3.hp), m3.parasiteT > 0]; if (out.deathBurst.includes(false) || !(out.deathBurst[0] > 0)) bad.push('death burst ' + out.deathBurst);
    w = set(fresh(CB), ['area']); kill(w, foe(250, 0)); out.cloud = C6.C().clouds.length; if (!(out.cloud >= 1)) bad.push('rot cloud ' + out.cloud);
    w = set(fresh(CB), ['nth']); e = foe(250, 0); e.speed = 0; const m4 = foe(280, 0); m4.speed = 0; for (let i = 0; i < 4; i++) { fireWeapon(w, e); step(40); } out.nth = m4.parasiteT > 0; if (!out.nth) bad.push('empowered shot infects round its target');
    w = set(fresh(CB), ['pull']); kill(w, foe(250, 0)); const pz = foe(300, 0); pz.speed = 0; const px0 = pz.x; step(30); out.cbPull = Math.round(px0 - pz.x); if (!(out.cbPull > 3)) bad.push('undead pull ' + out.cbPull);
    if (C6.err.length) bad.push('caught: ' + C6.err.slice(0, 3).join(' | '));
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
