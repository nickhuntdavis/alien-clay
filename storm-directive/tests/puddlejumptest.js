// Puddle Jumper: your puddles are portals (mobfeats.js pjPortal). Swim into one, come out of the most distant; a tap
// jumps to the most distant puddle; The Runs' trail does not count.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's002'; newGame(); UI.openLoot(G.lootQueue.shift()); UI.lootOpts[0].apply(); G.lootQueue = []; G.state = 'play'; UI.show('hud');
    CARDS.find(c => c.id === 'feat_puddle_jumper').apply(G); recomputeAll();
    const w = G.spells.find(x => x && x.def.f10 && x.def.f10.id === 'puddle_jumper'); if (!w) return { bad: ['no feat'], out };
    w.cd = 99; G.enemies.length = 0; G.zones.length = 0;
    const p = me(), x0 = p.x, y0 = p.y;
    const pool = (x, y, extra) => { const z = Object.assign({ x, y, r: 60, life: 5, max: 5, dps: 1, elem: 'ice', pull: 0, color: '#9f9', tick: 0, src: weaponSrc(G.weapons.find(Boolean)) }, extra || {}); G.zones.push(z); return z; };
    const A = pool(x0 + 200, y0), B = pool(x0 + 500, y0 + 300), T = pool(x0 + 2000, y0, { trail: true });
    mobTick(0.016); // outside every puddle
    p.x = A.x; p.y = A.y; mobTick(0.016);
    out.portal = [Math.round(p.x - B.x), Math.round(p.y - B.y)];
    if (Math.hypot(p.x - B.x, p.y - B.y) > 1) bad.push('portal to B ' + out.portal);
    mobTick(0.016); out.stay = Math.round(Math.hypot(p.x - B.x, p.y - B.y)); if (out.stay > 1) bad.push('bounced out of B');
    // the tap: from B, the most distant puddle (not the trail)
    G.t += 5; const d = w.def.f10; d.fire(w, {});
    out.tap = [Math.round(p.x - x0), Math.round(p.y - y0)];
    const far = [A, ...G.zones.filter(z => z !== B && z !== T && z !== A)].sort((a, b2) => Math.hypot(b2.x - B.x, b2.y - B.y) - Math.hypot(a.x - B.x, a.y - B.y))[0];
    if (Math.hypot(p.x - T.x, p.y - T.y) < 1) bad.push('jumped to the trail');
    if (Math.hypot(p.x - far.x, p.y - far.y) > 1) bad.push('tap not to the most distant ' + out.tap);
    out.desc = d.does;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
