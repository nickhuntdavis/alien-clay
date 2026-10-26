// The slice's new modifiers (modslice.js): Rank 2 opens a branch fork and the mastery a mastery fork; Rapid Fire speeds the
// weapon up; Focused Intensity ramps on one target; Sticky slows and Snares; Connecting links and shares; Catalyst fills
// bars faster; Extra Projectiles adds beams; Catalyst and Switched at Birth share a slot; Ricochet bounces the Laser and
// Orbiting turns it into a ring. The generic checks (forks, Rapid Fire, Sticky, Catalyst) run on Standard Issue: the Laser
// has its own Rapid Fire forks and Sticky (laserbeam.js, v10.94) and Catalyst is a dead card on it (moddead.js). Screenshot: out/slice.png (the Laser with Orbiting and links).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = (wid) => {
      META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.manual = { x: 0, y: 0 };
      G.weapons[0] = makeSlot(wid || 'v_flame_beam', false, 9); for (let i = 1; i < G.weapons.length; i++) G.weapons[i] = null;
      computeStats(G.weapons[0]); return G.weapons[0];
    };
    const foe = (dx, dy, hp) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + (dy || 0), {}); e.speed = 0; e.hp = e.maxHp = hp || 1e5; G.enemies.push(e); return e; };
    const run = (t) => { for (let f = 0; f < t * 60; f++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); } };
    const add = (w, id, n) => { for (let i = 0; i < n; i++) modAdd(w, id); computeStats(w); };
    // 1. Fork screens
    const SI = 'v_phys_proj'; // (Standard Issue: plain modifier forms; the Laser's own are in laserbeam.js)
    let w = fresh(SI); add(w, 'rapid', 2);
    const fq = G.lootQueue.find(q => q.ms); out.fork = fq && genLoot(fq).map(c => c.title);
    if (!fq || out.fork.join() !== 'Hail,Burst Fire') bad.push('branch fork: ' + out.fork);
    else genLoot(fq)[1].apply();
    if (msBr(w, 'rapid') !== 'B') bad.push('branch not set');
    G.lootQueue = []; add(w, 'rapid', 2); const mq = G.lootQueue.find(q => q.ms && q.ms.st === 'm'); out.mfork = mq && genLoot(mq).map(c => c.title);
    if (!mq || out.mfork.join() !== 'Clip Dump,Overheat') bad.push('mastery fork: ' + out.mfork);
    if (draftTitle(mq)[0] !== 'RAPID FIRE MASTERY') bad.push('fork title ' + draftTitle(mq)[0]);
    // 2. Rapid Fire: faster, weaker per hit
    w = fresh(SI); const cd0 = w.s.cd, d0 = w.s.dmg; add(w, 'rapid', 1); out.rapid = [+(cd0 / w.s.cd).toFixed(2), +(w.s.dmg / d0).toFixed(2)];
    if (!(w.s.cd < cd0 && w.s.dmg < d0)) bad.push('rapid ' + out.rapid);
    // 3. Focused Intensity ramps on one target
    w = fresh('v_phys_proj'); add(w, 'focus', 1); const ef = foe(120); /* (not the Laser: it ramps its own way, laserbeam.js) */ const k0 = msDmgMul(ef, weaponSrc(w)); let k1 = 1; for (let i = 0; i < 9; i++) { G.t += 0.25; k1 = msDmgMul(ef, weaponSrc(w)); }
    out.focus = [+k0.toFixed(2), +k1.toFixed(2)]; if (!(k1 > k0 + 0.3)) bad.push('focus ramp ' + out.focus);
    // 4. Sticky slows, Snares on the 3rd hit at Rank 3
    w = fresh(SI); add(w, 'sticky', 3); const es = foe(120); for (let i = 0; i < 3; i++) damageEnemy(es, 1, weaponSrc(w));
    out.sticky = [+es.chillAmt.toFixed(2), es.snareT > G.t]; if (!(es.chillAmt >= 0.69) || !(es.snareT > G.t)) bad.push('sticky ' + out.sticky);
    // 5. Connecting links and shares
    w = fresh(); add(w, 'connecting', 1); const c1 = foe(120), c2 = foe(150, 20); damageEnemy(c1, 100, weaponSrc(w)); const h2 = c2.hp; damageEnemy(c1, 100, weaponSrc(w));
    out.link = [msS().links.length, Math.round(h2 - c2.hp)]; if (!msS().links.length || !(c2.hp < h2)) bad.push('connecting ' + out.link);
    // 6. Catalyst: bars fill faster
    const bar = (cat) => { const ww = fresh(SI); if (cat) add(ww, 'catalyst', 3); const e = foe(120, 0, 3000); damageEnemy(e, 40, weaponSrc(ww)); const B = fightCd(e).bars; return Math.max(...Object.values(B)); };
    out.cat = [+bar(false).toFixed(3), +bar(true).toFixed(3)]; if (!(out.cat[1] > out.cat[0])) bad.push('catalyst bars ' + out.cat);
    // 7. Catalyst and Switched at Birth share the Chemistry slot
    w = fresh(SI); add(w, 'catalyst', 1); if (modCount(w, 'catalyst') !== 1) bad.push('Catalyst not taken'); if (sabCard()) bad.push('Switched at Birth offered with Catalyst held');
    w = fresh(SI); if (!modOk(w, 'catalyst')) bad.push('Catalyst not offered on an unswitched weapon'); sabSwitch(w, 'fire'); if (modOk(w, 'catalyst')) bad.push('Catalyst offered on a switched weapon');
    // 8. Extra Projectiles: a second beam locks its own enemy (laserbeam.js lzXUpdate, v10.93: it charges before it fires)
    w = fresh(); add(w, 'extra', 1); const x1 = foe(120), x2 = foe(60, 100); run(3);
    const xt = (w.lzX || []).map(x => x.tgt).filter(Boolean);
    out.extra = [xt.length, x1.hp < x1.maxHp, x2.hp < x2.maxHp]; if (xt.length < 1 || !(x1.hp < x1.maxHp) || !(x2.hp < x2.maxHp)) bad.push('extra beams ' + out.extra);
    // 9. Ricochet bounces the beam on to another enemy
    w = fresh(); add(w, 'ricochet', 1); const r1 = foe(150), r2 = foe(90, 90); G.v10fx = []; w.lzFireT = G.t; v10Fire(w, r1, weaponSrc(w));
    out.rico = [(w.lzShotSegs || []).length]; if ((w.lzShotSegs || []).length < 2) bad.push('ricochet beam ' + JSON.stringify(out.rico));
    // 10. Orbiting: the hula hoop hurts what touches it, and the Laser no longer fires its beam
    w = fresh(); add(w, 'orbiting', 1); const o1 = foe(72), o2 = foe(200); run(1.5);
    out.hoop = [Math.round(o1.maxHp - o1.hp), Math.round(o2.maxHp - o2.hp)]; if (!(out.hoop[0] > 0) || out.hoop[1] > 0) bad.push('hula hoop ' + out.hoop);
    return { bad, out };
  });
  await page.evaluate(() => { const w = G.weapons[0]; modAdd(w, 'catalyst'); const p = G.player; for (let i = 0; i < 6; i++) { const e = makeEnemy(ENEMIES.brute, p.x + 60 + i * 30, p.y - 60 + (i % 2) * 120, {}); e.speed = 0; G.enemies.push(e); } G.state = 'play'; });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'slice.png' });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
