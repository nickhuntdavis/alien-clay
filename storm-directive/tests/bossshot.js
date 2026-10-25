// The boss pack (bosspack.js): all six sprites (Litmus Strip, Johnny with its back open, Mucus Plug in its seal
// with the four plugs, Cramp, Sneeze, cracked Kidney Stone) in both fields, then the Sneeze's cone and the
// Cramp's tendon. Also checks the gimmicks: litmus types, the Johnny no longer bouncing a shot, the seal widening, the stone cracking a Shell layer per enrage.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const setup = (df, focus) => page.evaluate(([df, focus]) => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    SET.darkfield = df; SET.fullColour = true; UI.applySettings();
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid([]);
    const p = G.player; p.hp = 1e9; G.P.maxHp = 1e9;
    const mk = (id, x, y) => { const e = makeEnemy(bossDef(id), x, y); e.boss = true; e.speed = 0; e.campK = 0.5; G.enemies.push(e); bpSpawn(e); return e; };
    if (!focus) {
      const ids = ['litmus', 'johnny', 'cramp', 'sneeze', 'stone'], out = {};
      ids.forEach((id, i) => mk(id, p.x - 110 + (i % 2) * 220, p.y - 300 + Math.floor(i / 2) * 230));
      const m = mk('mucus', p.x + 110, p.y + 160); G.boss = m; bpSeal(m);
      const j = G.enemies.find(e => e.def.id === 'johnny'); j.face = Math.atan2(j.y - p.y, j.x - p.x); j.bpExposed = G.t + 99; // (its back to you)
      G.enemies.find(e => e.def.id === 'stone').bphase = 2;
      for (let i = 0; i < 3; i++) update(1 / 60);
      for (const e of G.enemies) if (e.boss) { e.x = e.x; }
      G.bpRing.r = G.bpRing.want; for (const e of G.enemies) if (e.plugA != null) bpPlug(e); G.enemies.find(e => e.def.id === 'litmus').soakUntil = 0; G.banner = null; G.fx.length = 0; // (the seal settled, no transient rings)
      cam.x = p.x; cam.y = p.y; G.ebul.length = 0; G.state = 'pause';
      return null;
    }
    const e = mk(focus, p.x, p.y - 220); G.boss = e;
    e.pat = e.def.patterns.indexOf(focus === 'sneeze' ? 'sneezecone' : 'crampgrip'); e.patT = 1;
    for (let i = 0; i < (focus === 'sneeze' ? 40 : 75); i++) { update(1 / 60); e.x = p.x; e.y = p.y - 220; G.player.hp = 1e9; }
    cam.x = p.x; cam.y = p.y - 110; G.ebul.length = 0; G.state = 'pause';
    return { st: e.st, gripping: !!e.gripping, coneA: e.coneA != null };
  }, [df, focus]);
  for (const df of [false, true]) { await setup(df, null); await page.waitForTimeout(200); await page.screenshot({ path: `boss_${df ? 'df' : 'light'}.png` }); }
  const sn = await setup(true, 'sneeze'); await page.waitForTimeout(150); await page.screenshot({ path: 'boss_sneeze.png' });
  const cr = await setup(false, 'cramp'); await page.waitForTimeout(150); await page.screenshot({ path: 'boss_cramp.png' });
  // Gimmicks.
  const g = await page.evaluate(() => {
    G.state = 'play';
    const p = G.player, out = {};
    const mk = id => { const e = makeEnemy(bossDef(id), p.x + 200, p.y); e.boss = true; e.speed = 0; e.maxHp = e.hp = 1e6; G.enemies.push(e); bpSpawn(e); return e; };
    const L = mk('litmus'); L.soakUntil = 0; const right = L.lit, wrong = LITMUS_TYPES.find(t => t !== right);
    out.litmus = [bossDamageMul(L, { elem: right === 'phys' ? null : right }), bossDamageMul(L, { elem: wrong === 'phys' ? null : wrong })];
    const J = mk('johnny'); J.face = Math.PI; // facing you (you are to its left)
    const pr = { x: J.x - J.r, y: J.y, vx: 400, vy: 0, dead: false };
    const n0 = G.ebul.length; out.bounce = bossDodges(J, pr) || pr.dead || G.ebul.length > n0; // (v10: no front bounce, so all three are false)
    const pr2 = { x: J.x + J.r, y: J.y, vx: -400, vy: 0, dead: false }; out.backHit = !bossDodges(J, pr2) && bossDamageMul(J, {}) >= 1;
    const S2 = mk('stone'); const L0 = fightCd(S2).layers; bpPhase(S2, 1); out.stoneArmour = L0; out.stoneCracked = fightCd(S2).layers; out.frontMul = bossDamageMul(J, {});
    G.enemies = G.enemies.filter(e => e.def.id !== 'mucus' && e.plugA == null);
    const M = mk('mucus'); G.boss = M; M.sealed = false; bpUpkeep(M, 1 / 60); const r0 = G.bpRing.r, plugs = G.enemies.filter(e => e.plugA != null);
    out.plugs = plugs.length; plugs[0].dead = true; for (let i = 0; i < 120; i++) bpTick(1 / 60); out.widened = G.bpRing.want > 380;
    for (const q of plugs) q.dead = true; bpTick(1 / 60); out.open = !G.bpRing && M.bpOpen;
    return out;
  });
  console.log(JSON.stringify({ sn, cr, g }));
  const ok = g.litmus[0] > 1 && g.litmus[1] === 0.65 && !g.bounce && g.backHit && g.frontMul === 1 && g.stoneArmour === 6 && g.stoneCracked === 5 && g.plugs === 4 && g.widened && g.open && sn.coneA && cr.gripping;
  if (!ok) console.log('FAIL gimmicks');
  console.log('ERRORS', JSON.stringify(errors)); await b.close(); process.exit(errors.length || !ok ? 1 : 0);
})();
