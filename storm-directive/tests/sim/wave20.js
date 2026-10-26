const { chromium } = require('playwright');
// node sim/wave20.js 4 mortal twins: play as that sequence. --boss <id> forces that boss into its tier's slot (campaign.js campInit).
const ARGS = process.argv.slice(2), BI = ARGS.indexOf('--boss'), BOSS = BI >= 0 ? ARGS.splice(BI, 2)[1] : '';
// --feat <id> puts that Feat in the first Feat slot at the start of every run (balance checks for one Feat).
const FI = ARGS.indexOf('--feat'), FEAT = FI >= 0 ? ARGS.splice(FI, 2)[1] : '';
// --move <id> runs the whole thing on that autorun mode (kite, collect, orbit, hunt, hold, defend).
const MI = ARGS.indexOf('--move'), MOVE = MI >= 0 ? ARGS.splice(MI, 2)[1] : '';
// --pre <js> runs that code once after loading (balance experiments: e.g. --pre 'SP.base = 4').
const PI = ARGS.indexOf('--pre'), PRE = PI >= 0 ? ARGS.splice(PI, 2)[1] : '';
const N = +(ARGS[0] || 2), GOD = ARGS[1] !== 'mortal', SEQ = ARGS[2] || '';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    RUNLOG.push({ n: 77, at: '2026-10-09 10:55', res: 'LOST', lvl: 44, seq: 'redtail+acid', w: ['wedding9[elemental]', 'orbit8', 'venom7'] }); });
  if (PRE) await page.evaluate(PRE);
  for (let seed = 0; seed < N; seed++) {
    const r = await page.evaluate(async ([GOD, SEQ, BOSS, FEAT, MOVE]) => {
      self.FORCE_BOSS = BOSS || null;
      if (SEQ) { META.devAll = 1; META.profile = SEQ; }
      SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      if (MOVE) G.moveDir = MOVE;
      if (FEAT) { G.spells[0] = makeSlot(FEAT, true, 1); computeStats(G.spells[0]); recomputeAll(); }
      const ev = [`roster ${G.bossRoster.join(',')}`]; let lastN = 0, t0 = 0, h0 = 0, lvB = 0;
      const hurtNow = () => Object.values(G.stats.hurtKind || {}).reduce((a, b) => a + b, 0);
      for (let f = 0; f < 30 * 2400 && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (G.state === 'play') { // (boxes go through v10Box like the real main loop: drafts, forks, the 40 s budget)
          if (G.lootQueue.length && !waveHoldsLoot()) { const vb = typeof v10Box === 'function' ? v10Box(G.lootQueue[0]) : true; if (vb === 'wait') { G.lootQueue.push(G.lootQueue.shift()); update(1 / 30); } else if (!vb) G.lootQueue.shift(); else UI.openLoot(G.lootQueue.shift()); }
          else update(1 / 30);
        }
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') { ev.push(G.finale.kind === 'win' ? 'WIN t=' + Math.round(G.t) : 'DIED wave ' + G.wave.n + ' t=' + Math.round(G.t) + ' lv' + G.level + ' by ' + G.stats.lastHit + ' boss ' + (G.boss ? Math.round(100 * G.boss.hp / G.boss.maxHp) + '% of ' + Math.round(G.boss.maxHp) : '-') + ' hurt ' + JSON.stringify(Object.entries(G.stats.hurt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0] + ':' + Math.round(x[1])))); break; }
        if (G.state === 'play' && waveReady()) waveBegin();
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        if (GOD && G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        const V = G.wave;
        if (V.active && V.n !== lastN) { lastN = V.n; t0 = G.t; h0 = hurtNow(); lvB = 0; }
        if (V.phase === 'boss' && !lvB) lvB = G.level + '@' + Math.round(G.t - t0) + 's hp' + Math.round(G.boss ? G.boss.maxHp : 0);
        if (!V.active && lastN && !ev[lastN]) ev[lastN] = `w${lastN} ${V.boss || (V.fresh || []).join('+')} lv${G.level}${lvB ? ' boss@lv' + lvB : ''} ${Math.round(G.t - t0)}s hurt${Math.round(hurtNow() - h0)}/${Math.round(G.P.maxHp)} t${Math.round(G.t)} wl${G.weapons.filter(w => w && !w.isSpell).map(w => w.lvl).join('/')}`;
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      if (G && G.fst) { const S = G.fst, r = n => Math.round(n); ev.push('fst rx ' + JSON.stringify(S.rx) + ' dmg w' + r(S.dmg.weapon) + '/rx' + r(S.dmg.reaction) + '/dot' + r(S.dmg.dot) + ' miss' + S.miss + ' memSoak' + r(S.mem) + ' layers' + S.layers + ' stagger' + S.stagger + ' possess' + S.possess + ' snare' + r(S.snareT) + 's heal' + r(S.heal || 0) + ' | you: mem' + r(S.pMem || 0) + ' layers' + (S.pLayers || 0) + ' miss' + (S.pMiss || 0) + ' thorns' + r(S.pThorns || 0)); }
      if (G) ev.push('build ' + G.weapons.filter(Boolean).map(w => w.def.name + w.lvl + (w.m10 && w.m10.length ? '[' + w.m10 + ']' : '')).join(', ') + (G.pd ? ' def ' + JSON.stringify(G.pd.n) : '') + (G.muts ? ' muts ' + JSON.stringify(G.muts) : '') + ' feats ' + (G.spells || []).filter(Boolean).map(s => s.def.name + s.lvl).join(',') + (G.stats.ddLv ? ' dnadrop ' + (G.stats.ddGot || 0) + '/' + G.stats.ddLv : ''));
      return ev.filter(Boolean).join('\n  ');
    }, [GOD, SEQ, BOSS, FEAT, MOVE]);
    console.log('RUN', seed, '\n  ' + r);
  }
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
