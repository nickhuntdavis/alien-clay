// The Runs rolls a damage type per card (runstype.js): new cards roll among the seven types, leaning towards held weapons'
// types; picking one fixes the trail's type (its pieces deal it); upgrade cards keep it; Force shoves, Static arcs between
// pieces, Blood heals you, Parasite drags enemies along the trail.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    const start = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.P.maxHp = 1000; G.player.hp = 500; G.player.x = 0; G.player.y = 0; G.invuln = 1e9; G.weapons = [null, null, null]; G.manual = { x: 1, y: 0 }; G.spRuns = null; G.spRunsType = null; };
    const card = () => CARDS.find(c => c.id === 'sp_runs');
    const foe = (x, y) => { const e = makeEnemy(ENEMIES.crawler, x, y); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); } };
    // ---- rolls: every type turns up; a held weapon's type leans
    start(); const n = {}; for (let i = 0; i < 700; i++) { const o = cardOpt(card()); n[o.runsType] = (n[o.runsType] || 0) + 1; } out.plain = n;
    if (Object.keys(n).length !== 7) bad.push('not every type rolls: ' + Object.keys(n));
    G.weapons[0] = makeSlot('v_shock_beam', false, 1); G.weapons[1] = makeSlot('s_tesla', false, 1); const m = {}; for (let i = 0; i < 700; i++) { const o = cardOpt(card()); m[o.runsType] = (m[o.runsType] || 0) + 1; } out.static = m.shock;
    if (!(m.shock > n.shock * 1.8)) bad.push('Static weapons did not lean the roll: ' + n.shock + ' > ' + m.shock);
    { const o = cardOpt(card()); if (o.desc !== RUNS_TEXT[o.runsType] || !o.sub.includes(ELEMENTS[o.runsType].name)) bad.push('card does not show its type'); }
    // ---- picking fixes the type; the trail deals it; upgrades keep it
    const pickAs = t => { start(); let o; for (let i = 0; i < 200 && !(o && o.runsType === t); i++) o = cardOpt(card()); o.apply(); return o; };
    for (const t of ['ice', 'phys']) { pickAs(t); if (G.spRunsType !== t) bad.push('picked ' + t + ', type ' + G.spRunsType); run(1); const z = G.zones.find(z => z.trail && z.src && z.src.w === G.spRuns.w); if (!z || z.elem !== t) bad.push(t + ' trail deals ' + (z && z.elem)); }
    { const up = cardOpt(card()); if (up.runsType || !up.sub.includes(ELEMENTS.phys.name)) bad.push('upgrade card rerolled or hid the type'); up.apply(); if (G.spRunsType !== 'phys') bad.push('upgrade changed the type'); }
    // ---- the four extras
    pickAs('phys'); run(1); { const z = G.zones.filter(z => z.trail)[3], e = foe(z.x, z.y + 4); const y0 = e.y; G.manual = { x: 0, y: 0 }; run(0.6); out.shove = Math.round(Math.hypot(e.x - z.x, e.y - y0)); if (out.shove < 10) bad.push('Force trail did not shove ' + out.shove); }
    pickAs('shock'); run(1.2); { const Z = G.zones.filter(z => z.trail); const a = Z[4], c = Z[5]; const e = foe((a.x + c.x) / 2, (a.y + c.y) / 2 + 2); let arcs = 0; const dE = damageEnemy; damageEnemy = function (q, d, src) { if (src && src.runsArc) arcs++; return dE.apply(this, arguments); }; G.manual = { x: 0, y: 0 }; run(1.5); damageEnemy = dE; out.arcs = arcs; if (!arcs) bad.push('Static trail never arced'); }
    pickAs('arcane'); run(1); { const z = G.zones.filter(z => z.trail)[3]; foe(z.x, z.y); G.manual = { x: 0, y: 0 }; const h0 = G.player.hp; run(1); out.heal = +(G.player.hp - h0).toFixed(1); if (!(out.heal > 0)) bad.push('Blood trail did not heal'); }
    pickAs('soul'); run(1); { const Z = G.zones.filter(z => z.trail), z = Z[Z.length - 2], e = foe(z.x, z.y); const d0 = Math.hypot(e.x - G.player.x, e.y - G.player.y); G.manual = { x: 0, y: 0 }; run(0.5); out.drag = Math.round(Math.hypot(e.x - G.player.x, e.y - G.player.y) - d0); if (!(out.drag > 5)) bad.push('Parasite trail did not drag the enemy away from you ' + out.drag); }
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
