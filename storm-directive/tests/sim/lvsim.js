const { chromium } = require('playwright');
const N = +(process.argv[2] || 1), GOD = process.argv[3] !== 'mortal', MODE = process.argv[4] || 'kite', STEER = process.argv[5] !== 'auto', LIMIT = +(process.argv[6] || 1500);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; });
  for (let seed = 0; seed < N; seed++) {
    const r = await page.evaluate(async ([GOD, MODE, STEER, LIMIT]) => {
      SET.auto = true; UI.sample = 's007'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      const ev = []; let leak = 0, lastB = 0, lastZ = null, lastA = null, stuck = 0, lastP = 0, lastPT = 0;
      for (let f = 0; f < 30 * LIMIT && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !G.tutNow) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 2) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') { ev.push('finale ' + G.finale.kind); break; }
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        G.moveDir = MODE;
        if (STEER && G.state === 'play') { const n = lvPushOn(G.player), near = G.enemies.some(e => !e.dead && !e.charmed && Math.hypot(e.x - G.player.x, e.y - G.player.y) < 170); if (n && !near) { const dx = n.x - G.player.x, dy = n.y - G.player.y, d = Math.hypot(dx, dy) || 1; G.manual = { x: dx / d, y: dy / d }; } else G.manual = null; }
        if (GOD && G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        const V = G.lvl; if (!V) { ev.push('no lvl'); break; }
        if (G.state === 'play' && lvSolidAt(G.player.x, G.player.y) && (leak = (leak || 0) + 1) < 6) ev.push(`  IN WALL t=${G.t.toFixed(1)} cell ${Math.floor(G.player.x / LV_C)},${Math.floor(G.player.y / LV_C)} gust=${V.cough.gust.toFixed(2)} sprint=${G.stam && G.stam.sprint} kx=${Math.round(G.player.kx||0)} vx=${Math.round(G.player.vx)},${Math.round(G.player.vy)} abil=${G.genes && G.genes.primary}`);
        if (V.zone !== lastZ) { lastZ = V.zone; ev.push(`${V.zone.name} t=${Math.round(G.t)} lv${G.level}`); }
        const a = V.arena ? V.arena.A.name : null; if (a !== lastA) { ev.push(a ? `  arena ${a} t=${Math.round(G.t)}` : `  arena done t=${Math.round(G.t)} lv${G.level}`); lastA = a; }
        if (f % 300 === 0) { const pr = lvProgress(); if (pr <= lastP + 0.001 && !V.arena && !(V.boss && !V.bossDead)) stuck++; else stuck = 0; lastP = pr; if (stuck === 4) ev.push(`  STUCK? t=${Math.round(G.t)} at ${Math.round(G.player.x / LV_C)},${Math.round(G.player.y / LV_C)} p=${pr.toFixed(2)}`); }
        if (V.boss && !lastB) { lastB = 1; ev.push(`  BOSS t=${Math.round(G.t)} hp=${G.boss && Math.round(G.boss.maxHp)} lv${G.level}`); }
        if (V.bossDead && lastB === 1) { lastB = 2; ev.push(`  boss dead t=${Math.round(G.t)}`); }
        if (f % 450 === 0 && G.boss && !G.boss.dead) { const b = G.boss; ev.push(`    @${Math.round(G.t)} boss ${Math.round(100*b.hp/b.maxHp)}% at ${(b.x/LV_C).toFixed(1)},${(b.y/LV_C).toFixed(1)} pat=${b.def.patterns[b.pat]} me ${(G.player.x/LV_C).toFixed(1)},${(G.player.y/LV_C).toFixed(1)} sight=${lvSight(b.x,b.y,G.player.x,G.player.y)} inWall=${lvSolidAt(b.x,b.y)}`); } if (false) ev.push(`    @${Math.round(G.t)} killed ${V.arena.killed}/${V.arena.A.quota} alive ${G.enemies.filter(e=>!e.dead&&!e.charmed).length} dPl ${G.enemies.filter(e=>!e.dead).slice(0,8).map(e=>{const i=lvIdx(e.x,e.y);return i<0?'X':V.dPl[i]}).join(',')} me ${Math.floor(G.player.x/LV_C)},${Math.floor(G.player.y/LV_C)} acc ${G.spawnAcc.toFixed(1)}`); if (false) ev.push(`    @${Math.round(G.t)} cell ${Math.floor(G.player.x / LV_C)},${Math.floor(G.player.y / LV_C)} hp${Math.round(G.player.hp)} foes${G.enemies.filter(e=>!e.dead).length}`);
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      const V = G.lvl;
      ev.push(`lastHit=${G.stats.lastHit} hurtBy=${JSON.stringify(Object.entries(G.stats.hurt).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]+':'+Math.round(x[1])))}`); ev.push(`END state=${G.state} t=${Math.round(G.t)} lvl=${G.level} kills=${G.kills} prog=${lvProgress().toFixed(2)} won=${V && V.won} hurt=${JSON.stringify(G.stats.hurtKind)} enemies=${G.enemies.filter(e => !e.dead).length}`);
      return ev.join('\n  ');
    }, [GOD, MODE, STEER, LIMIT]);
    console.log('RUN', seed, '\n  ' + r);
  }
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 6) : 'none'); await b.close();
})();
