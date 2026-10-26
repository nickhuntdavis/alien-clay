// The material skin Feat (matskin.js): performing it cuts damage taken, swaps swimming for momentum (speed builds slowly
// and carries on after you turn), bowls enemies over by speed, drags enemies into your path at level 4, and ends after its
// duration; the forks: Chitin (harder), Calcified (heavier hits), Enamel (shots bounce back), Latex (bounces off the edge).
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
    const scene = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.x = G.core.x + 600; G.player.y = G.core.y; G.player.vx = G.player.vy = 0; G.player.hd = 0; G.player.face = 0; G.weapons = [null, null, null]; G.spells.forEach((w, i) => { G.spells[i] = null; }); G.manual = { x: 1, y: 0 }; if (!G.stam) stamInit(); G.stam.cur = stamMax(); G.f10 = null; };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); } };
    const skin = (lv, forks) => { const w = f10Give('material_skin', lv || 1); for (const k of forks || []) (w.f10fk || (w.f10fk = {}))[k] = 1; recomputeAll(); w.cd = 0; if (!f10Go(w, {})) bad.push('could not perform it'); return w; };
    const spd = () => Math.hypot(G.player.vx, G.player.vy);
    if (!F10.material_skin) bad.push('not registered');
    // ---- tough, and on momentum
    scene(); let w = skin(1); out.mul = +hookMul('hurtMul', null, 'contact', null).toFixed(2); if (Math.abs(out.mul - 0.4) > 0.01) bad.push('damage taken x' + out.mul);
    run(0.25); const s1 = spd(); run(1); const s2 = spd(); out.speed = [Math.round(s1), Math.round(s2)]; if (!(s2 > s1 * 1.5)) bad.push('speed did not build slowly ' + out.speed);
    G.manual = { x: -1, y: 0 }; const x0 = G.player.x; run(0.3); out.slide = Math.round(G.player.x - x0); if (!(out.slide > 20)) bad.push('turning round stopped you dead: no momentum ' + out.slide);
    run(3); if (G.f10.skin) bad.push('still on after its duration'); if (hookMul('hurtMul', null, 'contact', null) !== 1) bad.push('damage cut stayed on');
    // ---- bowling
    scene(); w = skin(1); run(1); { const e = foe(70, 0); const ex = e.x; run(0.5); out.bowl = Math.round(e.maxHp - e.hp); if (!(out.bowl > 0)) bad.push('rolled into an enemy and did no damage'); if (!(Math.abs(e.x - ex) > 10 || Math.abs(e.y) > 0)) bad.push('the enemy was not bowled over'); }
    scene(); w = skin(3, ['calcified']); run(1); { const e = foe(70, 0); run(0.5); out.heavy = Math.round(e.maxHp - e.hp); if (!(out.heavy > out.bowl * 1.4)) bad.push('Calcified hit no harder ' + out.heavy + ' vs ' + out.bowl); }
    scene(); w = skin(3, ['chitin']); if (Math.abs(hookMul('hurtMul', null, 'contact', null) - 0.2) > 0.01) bad.push('Chitin not harder');
    // ---- level 4 pull
    scene(); w = skin(4); run(0.8); { const e = foe(200, 90); const d0 = Math.abs(e.y - G.player.y); run(0.4); out.pull = Math.round(d0 - Math.abs(e.y - G.player.y)); if (!(out.pull > 20)) bad.push('level 4 did not drag an enemy into your path ' + out.pull); }
    // ---- Enamel
    scene(); w = skin(5, ['enamel']); { const e = foe(-150, 0); G.ebul.push({ x: G.player.x + 4, y: G.player.y, vx: 0, vy: 0, r: 4, dmg: 10, life: 2 }); run(0.1); if (!G.ebul.every(q => q.dead)) bad.push('Enamel did not stop the shot'); if (!(e.hp < e.maxHp)) bad.push('Enamel shot came back at nobody'); }
    // ---- Latex at the edge
    scene(); G.player.x = G.core.x + CORE.arena - 20; w = skin(5, ['latex']); G.f10.skin.vx = 250; run(0.3); out.latex = Math.round(G.player.vx); if (!(G.player.vx < 0)) bad.push('Latex did not bounce off the edge ' + out.latex);
    // ---- a fight with drawing
    scene(); w = skin(4); for (let i = 0; i < 10; i++) foe(60 + i * 30, (i % 3 - 1) * 40); for (let i = 0; i < 180; i++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); if (i % 30 === 0) render(); }
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
