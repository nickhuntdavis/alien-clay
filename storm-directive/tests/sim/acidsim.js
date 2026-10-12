// Acid: how often autorun ends up in it, and how enemies treat it (wade through vs steer round).
// node sim/acidsim.js [runs] [minutes]
const { chromium } = require('playwright');
const N = +(process.argv[2] || 3), MIN = +(process.argv[3] || 4);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; });
  for (let seed = 0; seed < N; seed++) {
    const r = await page.evaluate(async MIN => {
      SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      let fr = 0, inAcid = 0, near = 0, entries = 0, was = false;
      const seen = new Set(), wade = new Set(), avoid = new Set();
      for (let f = 0; f < 30 * 60 * MIN && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') break;
        if (G.state === 'play' && waveReady()) waveBegin();
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        if (G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        if (G.state !== 'play') continue;
        fr++;
        const p = G.player, z = zoneForce(p.x, p.y, p.r, true);
        if (z.acid) { inAcid++; if (!was) entries++; was = true; } else was = false;
        if (G.terrain && G.terrain.list.some(o => o.type === 'acid' && Math.hypot(o.x - p.x, o.y - p.y) < o.r + 200)) near++;
        if (f % 15 === 0) for (const e of G.enemies) {
          if (e.dead || e.boss) continue;
          const c = tCell(e.x, e.y); if (!c) continue;
          for (const o of c) if (o.type === 'acid') { const d = Math.hypot(e.x - o.x, e.y - o.y); if (d < o.r + e.r + 4) { seen.add(e); if (d < o.r - 4) wade.add(e); } }
        }
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      for (const e of seen) if (!wade.has(e)) avoid.add(e);
      const pits = G.terrain ? G.terrain.list.filter(o => o.type === 'acid').length : 0;
      return `pits ${pits} | you: in acid ${(100 * inAcid / fr).toFixed(1)}% of play (${entries} times), near acid ${(100 * near / fr).toFixed(0)}% | acid hurt ${Math.round((G.stats.hurtKind || {})['Acid Crypt'] || 0)} | enemies at acid ${seen.size}: waded ${wade.size}, kept out ${avoid.size}`;
    }, MIN);
    console.log('RUN', seed, r);
  }
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
