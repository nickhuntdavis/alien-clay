// Pool weapons as water balloons (balloon.js): Nocturnal Emission and Hot Mess throw a balloon that follows the enemy it
// was aimed at and bursts on it, leaving the puddle round the face. Other lobbed weapons are untouched. Screenshot of a
// balloon in flight: out/balloon.png.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce);
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.hp = e.maxHp = 400; G.enemies.push(e); return e; };
    for (const id of ['v_ice_pool', 'v_flame_pool']) {
      const w = fresh(id), e = foe(220, 0); e.speed = 0;
      fireWeapon(w, e);
      const pr = G.proj.find(q => q.lob && q.w === w);
      if (!pr || !pr.bl || pr.bl.face !== e) { bad.push(id + ' lob not tagged with its face'); continue; }
      // The face moves sideways during the flight: the balloon follows and the puddle lands on it.
      for (let i = 0; i < 60 && !pr.dead; i++) { e.x += 1.5; e.y += 2; G.state = 'play'; update(1 / 60); G.player.hp = 1e6; }
      const z = G.zones.find(q => q.src && q.src.w === w);
      out[id] = { landed: pr.dead, hp: Math.round(e.maxHp - e.hp), zone: z ? Math.round(Math.hypot(z.x - e.x, z.y - e.y)) : null };
      if (!pr.dead) bad.push(id + ' balloon never landed');
      if (!(e.hp < e.maxHp)) bad.push(id + ' face not hit');
      if (!z || Math.hypot(z.x - e.x, z.y - e.y) > 20) bad.push(id + ' puddle not on the face ' + JSON.stringify(out[id]));
    }
    // A balloon whose face dies in flight lands where the face last was.
    let w = fresh('v_ice_pool'), e = foe(220, 0); e.speed = 0; fireWeapon(w, e);
    const pr = G.proj.find(q => q.lob && q.w === w); update(1 / 60); e.dead = true; const ex = e.x;
    for (let i = 0; i < 60 && !pr.dead; i++) { G.state = 'play'; update(1 / 60); }
    out.dead = Math.round(Math.abs(pr.tx - ex)); if (!pr.dead || out.dead > 5) bad.push('dead face ' + out.dead);
    // Other lobs are not balloons.
    w = fresh('v_fire_proj'); foe(200, 0); w2Lob(w, G.player.x + 100, G.player.y, weaponSrc(w), { area: 30, dmg: 5 });
    if (G.proj.some(q => q.lob && q.bl)) bad.push('acid glob became a balloon');
    // A frame with a balloon in the air, for the eye.
    w = fresh('v_flame_pool'); e = foe(160, -60); e.speed = 0; fireWeapon(w, e); for (let i = 0; i < 14; i++) { G.state = 'play'; update(1 / 60); }
    return { bad, out };
  });
  await page.waitForTimeout(100); await page.screenshot({ path: 'balloon.png' });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
