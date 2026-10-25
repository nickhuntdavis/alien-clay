// Elite affixes (elites10.js): each affix's effect, the role-matched picker, and Smouldering routed through it.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list); if (G.bigHaz) G.bigHaz.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.manual = { x: 0, y: 0 }; { const D = pdef(); D.mem.memMax = 0; D.mem.mem = 0; } G.elPools = []; G.ebul.length = 0; G.P.dodge = 0; BUL.keep.fill(1); };
    if (typeof pdefTick === 'function') pdefTick = () => {};
    const foe = (id, dx, dy, elite, mod) => { const p = G.player, e = makeEnemy(ENEMIES[id], p.x + dx, p.y + (dy || 0), { elite: !!elite }); e.hp = e.maxHp = e.hp * 20; G.enemies.push(e); if (mod) el10Pick(e, mod); gridBuild(); return e; };
    const run = (n, fn) => { for (let i = 0; i < n; i++) { G.state = 'play'; update(1 / 60); if (fn) fn(i); } };
    // Picker: each role gets an affix it is allowed; roles with none get Smouldering.
    const allow = { crawler: ['haste', 'smouldering'], charger: ['trail', 'smouldering'], spitter: ['fan', 'smouldering'], bulwark: ['gift', 'smouldering'], swarm: ['smouldering'] };
    const seen = {};
    for (const id of ['crawler', 'charger', 'spitter', 'bulwark']) {
      for (let i = 0; i < 40; i++) {
        fresh(); const e = foe(id, 500, 0, true); run(1);
        const ok = allow[id]; seen[id + ':' + e.elMod] = 1;
        if (!ok.includes(e.elMod)) bad.push(id + ' got ' + e.elMod);
        if ((e.elMod === 'smouldering') !== !!e.nfSm) bad.push('Smouldering flag not routed for ' + id + ' ' + e.elMod);
      }
    }
    out.seen = Object.keys(seen).join(' ');
    for (const k of ['crawler:haste', 'charger:trail', 'spitter:fan', 'bulwark:gift']) if (!seen[k]) bad.push('never picked ' + k);
    fresh(); { const e = foe('crawler', 500, 0, true, 'smouldering'); run(1); if (!e.nfSm) bad.push('forced Smouldering lost its flag'); }
    fresh(); { const e = foe('crawler', 500, 0, false); run(2); if (e.elMod != null) bad.push('a plain enemy got an affix'); }
    // Trailing: a charge leaves a Pool that hurts and expires
    fresh(); { const e = foe('charger', 200, 0, true, 'trail'); e.stT = 0; let n = 0; run(150, () => { n = Math.max(n, G.elPools.length); });
      out.pools = n; if (n < 3) bad.push('Trailing left ' + n + ' pool pieces');
      const z = G.elPools[0] || { x: e.x, y: e.y, life: 1, max: 2, t: 0, dmg: 5, r: 18, col: '#fff' };
      G.elPools = [{ x: G.player.x, y: G.player.y, r: 18, life: 2, max: 2, t: 0, dmg: 7, col: '#fff' }]; e.dead = true; const h0 = G.player.hp; run(5); if (!(G.player.hp < h0)) bad.push('pool did not hurt');
      G.elPools[0].life = 0.01; run(3); if (G.elPools.length) bad.push('pool did not expire'); }
    // Fanning: the third volley is a tell, then 5 bullets across about 60 degrees; the normal shot is skipped
    fresh(); { const e = foe('spitter', 260, 0, true, 'fan'); e.speed = 0; e.elVol = 2; e.shootCd = 0; let tell = false, tellFrames = 0;
      run(70, () => { if (e.elFan) { tell = true; tellFrames++; if (tellFrames === 1) e.shootCd = 99; } });
      out.tellFrames = tellFrames; if (!tell) bad.push('Fanning never telegraphed');
      if (tellFrames < 40) bad.push('tell too short: ' + tellFrames + ' frames');
      const bl = G.ebul.filter(x => x.owner === e); out.fanBullets = bl.length;
      if (bl.length !== 5) bad.push('fan fired ' + bl.length + ' bullets');
      else { const a0 = Math.atan2(bl[0].vy, bl[0].vx), as = bl.map(x => { let d = Math.atan2(x.vy, x.vx) - a0; return Math.atan2(Math.sin(d), Math.cos(d)); }).sort((a, c) => a - c); const arc = (as[4] - as[0]) * 180 / Math.PI; out.arc = Math.round(arc); if (Math.abs(arc - 60) > 4) bad.push('fan arc ' + arc); } }
    // Gifting: a nearby unshielded ally gets a 25% Membrane for 3 s, then loses it
    fresh(); { const e = foe('bulwark', 300, 0, true, 'gift'), a = foe('crawler', 340, 0); a.speed = 0; e.speed = 0; e.elT = G.t;
      run(30); const c = a.cd; out.gift = c && c.def; if (!c || c.def !== 'membrane' || Math.abs(c.memMax - a.maxHp * 0.25) > 1) bad.push('ally has no 25% Membrane: ' + (c && c.def + ' ' + c.memMax));
      if (!e.elG) bad.push('no visible link state');
      run(200); if (a.cd.def === 'membrane' || a.cd.memMax) bad.push('Membrane did not expire'); }
    // Hasty: x1.5 speed below 30% health, and not before
    fresh(); { const e = foe('crawler', 400, 0, true, 'haste'); const s0 = e.speed; run(2); if (e.speed !== s0) bad.push('Hasty early');
      e.hp = e.maxHp * 0.29; run(2); out.hasteK = Math.round(e.speed / s0 * 100) / 100; if (Math.abs(e.speed / s0 - 1.5) > 0.01) bad.push('Hasty speed x' + e.speed / s0);
      run(5); if (Math.abs(e.speed / s0 - 1.5) > 0.01) bad.push('Hasty stacked'); }
    // draw pass with every affix
    fresh(); for (const [id, m] of [['crawler', 'haste'], ['charger', 'trail'], ['spitter', 'fan'], ['bulwark', 'gift'], ['crawler', 'smouldering']]) foe(id, 100 + Math.random() * 50, 0, true, m);
    try { run(60); render(); } catch (err) { bad.push('draw threw: ' + err.message); }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  const bad = r.bad.concat(errors);
  if (bad.length) { console.log('FAIL elitetest\n  ' + bad.join('\n  ')); await b.close(); process.exit(1); }
  console.log('PASS elitetest'); await b.close();
})();
