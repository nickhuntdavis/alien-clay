// Early Race threat (s001, first 7 minutes, mortal bot): node sim/early.js 6 ['RACE.hurt=0.9']
// Per minute: damage taken, lowest HP %, enemies alive (mean), and when a run dies. The bot dodges worse than a person,
// so read it as a before/after comparison, not as what a player feels.
const { chromium } = require('playwright');
const N = +(process.argv[2] || 6), TUNE = process.argv[3] || '', END = 420;
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.eggMet = 1;
    hookOn('hurt', 'sim:early', d => { if (window.__m) __m[Math.min(6, Math.floor(G.t / 60))].dmg += d; }); });
  if (TUNE) await page.evaluate(TUNE);
  const all = [];
  for (let seed = 0; seed < N; seed++) {
    const r = await page.evaluate(async ([seed, END]) => {
      let s = 1000 + seed * 7919; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      META.profile = 's10_baseline'; SET.auto = true; UI.sample = 's001'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      window.__m = Array.from({ length: 7 }, () => ({ dmg: 0, low: 1, en: 0, n: 0 }));
      let died = null;
      for (let f = 0; f < 30 * (END + 120) && G && G.t < END; f++) {
        if (UI.kinFuse && !UI.kinFuse.done && $('kinFuse')) { UI.kinFuse.t0 -= 1e4; $('kinFuse').onpointerdown({ stopPropagation() {} }); }
        if (G.state === 'play') { let vb; if (G.lootQueue.length && (vb = v10Box(G.lootQueue[0])) !== 'wait') { const q = G.lootQueue.shift(); if (vb) UI.openLoot(q); } else update(1 / 30); }
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale' || G.state === 'over') { died = Math.round(G.t) + 's by ' + G.stats.lastHit; break; }
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        const m = __m[Math.min(6, Math.floor(G.t / 60))]; m.low = Math.min(m.low, G.player.hp / G.P.maxHp); m.en += G.enemies.length; m.n++;
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      return { died, lv: G.level, m: __m.map(x => ({ dmg: Math.round(x.dmg), low: Math.round(x.low * 100), en: x.n ? Math.round(x.en / x.n) : 0, mhp: 0 })), mhp: Math.round(G.P.maxHp) };
    }, [seed, END]);
    all.push(r);
    console.log(`RUN ${seed} ${r.died ? 'DIED ' + r.died : 'alive'} lv${r.lv} maxHp${r.mhp} | ` + r.m.map((x, i) => `m${i + 1} ${x.dmg}dmg low${x.low}% e${x.en}`).join(' | '));
  }
  const avg = k => all[0].m.map((_, i) => Math.round(all.reduce((a, r) => a + r.m[i][k], 0) / all.length));
  console.log('MEAN dmg/min ' + avg('dmg').join(' ') + ' | low% ' + avg('low').join(' ') + ' | enemies ' + avg('en').join(' ') + ` | died ${all.filter(r => r.died).length}/${N}`);
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
