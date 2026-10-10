const { chromium } = require('playwright');
const N = +(process.argv[2] || 6), SMP = process.argv[3] || 's002';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  const r = await page.evaluate(async ([N, SMP]) => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1;
    const seen = {}, taken = {}, boxes = { n: 0 };
    const orig = genLoot;
    window.genLoot = req => { const o = orig(req); if (['level', 'chest', 'boss'].includes(req.kind)) { boxes.n++; for (const c of o) { const k = (c.tag || '?') + '|' + c.title; seen[k] = (seen[k] || 0) + 1; } } return o; };
    const origPick = UI.pickLoot.bind(UI); UI.pickLoot = i => { const c = UI.lootOpts && UI.lootOpts[i]; if (c) { const k = (c.tag || '?') + '|' + c.title; taken[k] = (taken[k] || 0) + 1; } return origPick(i); };
    for (let run = 0; run < N; run++) {
      SET.auto = true; SET.autoWaves = true; UI.sample = SMP; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      for (let f = 0; f < 30 * 600 && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 2) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') break;
        if (G.state === 'play' && waveReady()) waveBegin();
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        if (G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
    }
    const names = { feat: Object.keys(SPELLS).map(id => SPELLS[id].name), passive: Object.keys(PASSIVES).map(id => PASSIVES[id].name), mod: Object.keys(MODS).map(id => MODS[id].name) };
    const titles = Object.keys(seen).map(k => k.split('|')[1]);
    const count = n => Object.keys(seen).filter(k => k.split('|')[1].startsWith(n)).reduce((a, k) => a + seen[k], 0);
    const out = {};
    for (const g in names) out[g] = names[g].map(n => [n, count(n)]).sort((a, b) => a[1] - b[1]);
    const tags = {}; for (const k in seen) { const t = k.split('|')[0]; tags[t] = (tags[t] || 0) + seen[k]; }
    return { boxes: boxes.n, tags, out };
  }, [N, SMP]);
  console.log('boxes', r.boxes, JSON.stringify(r.tags));
  for (const g in r.out) { const z = r.out[g].filter(x => x[1] === 0).map(x => x[0]); console.log(`\n${g}: ${r.out[g].length} total, never offered ${z.length}: ${z.join(', ')}`); console.log('  rarest offered:', r.out[g].filter(x => x[1] > 0).slice(0, 12).map(x => x.join(':')).join(', ')); console.log('  most:', r.out[g].slice(-8).map(x => x.join(':')).join(', ')); }
  console.log('ERRORS', errors.slice(0, 3)); await b.close();
})();
