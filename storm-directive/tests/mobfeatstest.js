// Brave Phase and Puddle Jumper (mobfeats.js): Brave Phase races you through a line of enemies, untouchable, hitting each
// once; manual steering bends it; walls stop it. Puddle Jumper lands you behind the biggest enemy with a close-range
// weapon (and backstabs it), else in the safest spot, never across a wall, leaving a Mucus puddle; every fork performs.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const start = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; };
    const scene = () => { G.enemies.length = 0; G.zones.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list); G.stats.dmg = {}; G.manual = { x: 0, y: 0 }; G.weapons.forEach((w, i) => { if (w) G.weapons[i] = null; }); G.spells.forEach((w, i) => { G.spells[i] = null; }); if (!G.stam) stamInit(); G.stam.cur = stamMax(); G.f10 = null; G.state = "play"; G.lootQueue = []; };
    const foe = (dx, dy, o) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + (dy || 0)); e.hp = e.maxHp = 1e4; e.speed = 0; if (o) Object.assign(e, o); G.enemies.push(e); gridBuild(); return e; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = "play"; update(1 / 60); } }; // (first sightings would pause it)
    const give = (id, lv, forks) => { const w = f10Give(id, lv || 1); if (forks) for (const k of forks) (w.f10fk || (w.f10fk = {}))[k] = 1; recomputeAll(); w.cd = 0; return w; };
    for (const id of ['brave_phase', 'puddle_jumper']) {
      if (!F10[id]) { bad.push(id + ' not registered'); continue; }
      for (const lv of [3, 5]) for (const c of ['feat_' + id, 'feat_' + id + '_up']) { const f = FORKS['feat:' + c + '@' + lv]; if (!f || f.length !== 2) bad.push('forks ' + c + '@' + lv); }
    }
    // ---- Brave Phase: a line of 4 to the right
    start(); scene(); let w = give('brave_phase');
    const line = [60, 120, 180, 240].map(d => foe(d, 0));
    const x0 = G.player.x, c = F10.brave_phase.when(w);
    if (!c || Math.abs(Math.cos(c.a) - 1) > 0.05) bad.push('Brave Phase does not aim down the line ' + JSON.stringify(c));
    out.go = f10Go(w, c); out.mob0 = !!(G.f10 && G.f10.mob && G.f10.mob.bp); const hp0 = G.player.hp; G.ebul.push({ x: G.player.x + 4, y: G.player.y, vx: 0, vy: 0, r: 6, dmg: 50, life: 1 });
    run(0.7);
    out.bpHit = line.filter(e => e.hp < e.maxHp).length; out.bpMoved = Math.round(G.player.x - x0);
    if (out.bpHit < 4) bad.push('Brave Phase hit ' + out.bpHit + ' of 4');
    if (out.bpMoved < 250) bad.push('Brave Phase moved only ' + out.bpMoved);
    if (G.player.hp < hp0) bad.push('hurt during Brave Phase');
    if (line.some(e => e.maxHp - e.hp > F10.brave_phase.base.dmg * 4)) bad.push('Brave Phase hit an enemy more than once');
    // manual steering bends it
    scene(); w = give('brave_phase'); const y0 = G.player.y; f10Go(w, { a: 0 }); G.manual = { x: 0, y: 1 }; run(0.6); G.manual = { x: 0, y: 0 };
    out.bpBend = Math.round(G.player.y - y0); if (out.bpBend < 60) bad.push('manual steering did not bend Brave Phase ' + out.bpBend);
    // forks: exit burst, after-images
    scene(); w = give('brave_phase', 3, ['exit']); { const far = foe(200, 60); f10Go(w, { a: 0 }); run(0.8); if (!(far.hp < far.maxHp)) bad.push('exit burst missed'); }
    scene(); w = give('brave_phase', 3, ['ghosts']); f10Go(w, { a: 0 }); run(0.3); { const g = G.f10 && G.f10.mob && G.f10.mob.ghosts[0]; if (!g) bad.push('no after-images'); else { const e = foe(g.x - G.player.x, g.y - G.player.y); run(0.1); if (!(e.hp < e.maxHp)) bad.push('after-image did not hit'); } }
    scene(); w = give('brave_phase', 5, ['long']); f10Go(w, { a: 0 }); if (!(G.f10 && G.f10.mob && G.f10.mob.bp) || Math.abs(G.f10.mob.bp.end - G.t - 0.9) > 0.01) bad.push('Long fork duration ' + (G.f10.mob.bp.end - G.t));
    // ---- Puddle Jumper, escape: surrounded, with a clear side
    scene(); w = give('puddle_jumper'); for (let i = 0; i < 6; i++) foe(Math.cos(i) * 80, Math.sin(i) * 80);
    const p0 = { x: G.player.x, y: G.player.y }, cE = F10.puddle_jumper.when(w);
    if (!cE || !cE.away) bad.push('Puddle Jumper did not want to escape ' + JSON.stringify(cE));
    f10Go(w, cE); out.pjAway = Math.round(Math.hypot(G.player.x - p0.x, G.player.y - p0.y));
    if (out.pjAway < 150) bad.push('Puddle Jumper escape jumped only ' + out.pjAway);
    if (!G.zones.some(z => z.elem === 'ice' && Math.hypot(z.x - p0.x, z.y - p0.y) < 5)) bad.push('no Mucus puddle where you were');
    // close range: behind the biggest, with a backstab
    scene(); w = give('puddle_jumper'); G.weapons[0] = makeSlot('v_phys_contact', false, 1); recomputeAll(); // (Nervous Wreck: a Contact weapon)
    const small = foe(100, 0), big = foe(220, 0); big.maxHp = big.hp = 5e4;
    const cB = F10.puddle_jumper.when(w); if (!cB || cB.e !== big) bad.push('Puddle Jumper did not pick the biggest enemy');
    else { f10Go(w, cB); if (!(G.player.x > big.x)) bad.push('not behind the big enemy: ' + Math.round(G.player.x - big.x)); if (!(big.hp < big.maxHp)) bad.push('no backstab'); }
    G.weapons[0] = null;
    // forks: splash, double
    scene(); w = give('puddle_jumper', 3, ['splash']); { const e = foe(200, 0); f10Go(w, { e }); if (!(e.frozen > 0) || !(e.hp < e.maxHp)) bad.push('splash did not Snare ' + e.frozen); }
    scene(); w = give('puddle_jumper', 3, ['double']); f10Go(w, { away: 1 }); run(0.05); if (!(w.cd <= 1.2)) bad.push('double: first jump did not leave a quick second ' + w.cd); w.cd = 0; G.stam.cur = stamMax(); f10Go(w, { away: 1 }); run(0.05); if (!(w.cd > 1.2)) bad.push('double: the second jump should start the full cooldown ' + w.cd);
    // stamina
    for (const id of ['brave_phase', 'puddle_jumper']) { scene(); const q = give(id); if (!(f10Cost(q) > 0)) bad.push(id + ' costs no stamina'); }
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
