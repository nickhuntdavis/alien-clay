// v10 bosses (boss10.js): defences from the roster, no type weaknesses or immunities, capped Queen summons, readable intro text.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const boss = id => { UI.sample = 's002'; newGame(); G.state = 'play'; G.enemies.length = 0; G.bossRoster = [id]; G.bossCount = 0; spawnBoss(); return G.boss; };
    const st = boss('stone'); const c = fightCd(st);
    out.stone = [c.def, c.layers];
    if (c.def !== 'shell' || c.layers !== 6) bad.push('Kidney Stone defence ' + out.stone);
    const al = boss('alpha'); if (fightCd(al).def !== 'evasion') bad.push('Chad Prime evasion');
    const q = boss('queen'); if (fightCd(q).def !== 'squishy') bad.push('Queen squishy');
    for (const B of BOSSES) if (B.weak && Object.keys(B.weak).length && bossDamageMul({ def: B, bossDef: B }, { elem: Object.keys(B.weak)[0] }) !== 1) { bad.push(B.id + ' still has a type weakness'); break; }
    const fe = BOSSES.find(B => B.id === 'fever'); if (fe && fe.strengths.some(s => /immune/i.test(s))) bad.push('Fever intro still says immune');
    out.queenText = BOSSES.find(B => B.id === 'queen').strengths;
    if (!boss10SummonOk(q)) bad.push('summons blocked with no adds');
    for (let i = 0; i < 8; i++) { const o = makeEnemy(ENEMIES.crawler, q.x, q.y); o.summonedBy = q; G.enemies.push(o); }
    if (boss10SummonOk(q)) bad.push('summon cap not enforced');
    // A1a: a boss kill queues a relic then spoils; both open, and picking a relic sets G.relics.
    const bk = boss('alpha'); G.lootQueue.length = 0; bossDown(bk);
    const rq = G.lootQueue[0];
    if (!rq || rq.kind !== 'relic') bad.push('boss kill does not queue a relic first');
    else {
      if (!draftBox(rq)) bad.push('draftBox refuses the relic');
      UI.openLoot(rq);
      const ro = UI.lootOpts || [];
      if (ro.length < 3) bad.push('relic screen has ' + ro.length + ' cards');
      else { const rid = ro[0].rid || ro[0].id; ro[0].apply(); if (!(G.relics && Object.values(G.relics).some(Boolean))) bad.push('picking a relic sets nothing in G.relics'); }
    }
    const sq = G.lootQueue.find(q => q.kind === 'spoils'); if (!sq || !draftBox(sq)) bad.push('spoils box does not open');
    // C2 boss telegraphs (bosstells10.js): each tell shows before its attack and nothing lands inside it.
    const tellBoss = (id, pat) => { const b = boss(id); G.lootQueue.length = 0; G.nextBoss = 1e9; G.ev.next = 1e9; b.pat = b.def.patterns.indexOf(pat); b.patT = 0; b.fireT = 0; b.st = 0; b.hp = b.maxHp = 1e9; b.speed = 0; G.player.x = b.x + 300; G.player.y = b.y; G.player.iframes = 1e9; G.ebul.length = 0; G.hazards.length = 0; return b; };
    const step = (n, fn) => { let t = 0; for (let i = 0; i < n; i++) { update(1 / 60); t += 1 / 60; if (fn && fn(t, i)) break; } return t; };
    for (const id of ['colossus', 'twins']) { // a lane while winding up, no bullets until the dash
      const b = tellBoss(id, 'charge'); let lane = 0, early = 0;
      step(150, () => { if (b.st === 1) { lane++; if (G.ebul.some(q => q.owner === b)) { early++; } render(); } return b.st === 2; });
      if (!lane) bad.push(id + ' never wound up a charge'); if (early) bad.push(id + ' fired during the charge wind-up');
      if (!b.tl10) bad.push(id + ' has no tell state');
    }
    for (const id of ['ghost', 'eye']) { // blink: a landing marker 0.5 s ahead, same spot it lands on, ring 0.3 s after arrival
      const b = tellBoss(id, 'blink'); let tellAt = -1, jumpAt = -1, dest = null, ringAt = -1;
      step(240, (t) => {
        const s = b.tl10; if (s.dest && tellAt < 0) { tellAt = t; dest = { x: s.dest.x, y: s.dest.y }; render(); }
        if (jumpAt < 0 && dest && Math.hypot(b.x - dest.x, b.y - dest.y) < 1) jumpAt = t;
        if (jumpAt > 0 && ringAt < 0 && G.ebul.length) ringAt = t;
        return ringAt > 0;
      });
      if (tellAt < 0) bad.push(id + ' showed no blink marker'); else if (jumpAt < 0) bad.push(id + ' did not land on its marker');
      else { if (jumpAt - tellAt < 0.45) bad.push(id + ' blinked ' + (jumpAt - tellAt).toFixed(2) + ' s after the marker (want 0.5)'); if (ringAt - jumpAt < 0.25) bad.push(id + ' ring ' + (ringAt - jumpAt).toFixed(2) + ' s after arrival (want 0.3)'); }
      out[id + 'Blink'] = [tellAt, jumpAt, ringAt].map(v => +v.toFixed(2)).join('/');
    }
    { const b = tellBoss('queen', 'summon'); let from = -1, first = -1; const n0 = G.enemies.length; // pulse 0.6 s, then the adds
      step(150, t => { if (b.patT >= 0.6 && from < 0) from = t; if (from > 0 && b.tl10.t > 0 && b.tl10.t < 0.6) render(); if (b.st === 1) { first = t; return true; } });
      if (first < 0) bad.push('Queen never summoned'); else if (first - from < 0.55) bad.push('Queen summoned ' + (first - from).toFixed(2) + ' s after the pulse began (want 0.6)');
      out.queenSummon = (first - from).toFixed(2); }
    { const b = tellBoss('matron', 'wardround'); let from = -1, first = -1, hurtEarly = 0; const hp0 = G.player.hp; // ring 1 s, then heal and nurses
      step(200, t => { if (b.patT >= 0.6 && from < 0) from = t; if (b.tl10.t > 0 && b.tl10.t < 1) render(); if (b.st === 1) { first = t; return true; } if (G.player.hp < hp0) hurtEarly++; });
      if (first < 0) bad.push('Matron never did a ward round'); else if (first - from < 0.95) bad.push('Matron ward round came ' + (first - from).toFixed(2) + ' s after the ring began (want 1.0)');
      if (hurtEarly) bad.push('Matron hurt the player during the ward ring');
      out.matronWard = (first - from).toFixed(2); }
    { const b = tellBoss('fever', 'firering'); let from = -1, first = -1, shown = 0; // outline 0.7 s, then the ring and the scalding ground
      step(200, t => { if (b.patT >= 0.6 && from < 0) from = t; if (b.fireT > 0 && b.fireT <= 0.7 && b.patT >= 0.6) { shown++; render(); } if (G.ebul.length || G.hazards.length) { first = t; return true; } });
      if (first < 0) bad.push('Fever never fired its ring'); else if (first - from < 0.65) bad.push('Fever ring came ' + (first - from).toFixed(2) + ' s after the outline began (want 0.7)');
      if (!shown) bad.push('Fever outline never drawn');
      out.feverRing = (first - from).toFixed(2); }
    // C3 tier 1 signature beats (bosssig10_t1.js): the tell shows first, nothing lands inside it, then the beat does what it says.
    { const hurts = []; const hp0 = window.hurtPlayer; window.hurtPlayer = function (d, f) { hurts.push(G.t); (window.hn = window.hn || []).push(f); return hp0.apply(this, arguments); };
      const beat = (id, pat) => { const b = tellBoss(id, pat); hurts.length = 0; window.hn = []; G.zones.length = 0; G.P.speed = 0; G.manual = { x: 0, y: 0 }; if (G.genes) G.genes.abilT = 1e9; b.t0 = -1; b.x = G.core.x; b.y = G.core.y; G.player.x = b.x + 300; G.player.y = b.y; return b; }; // (you hold still)
      const run = (b, secs, fn) => step(secs * 60, t => { if (b.t0 < 0 && b.patT >= 0.6) b.t0 = G.t; const bt = Math.max(0, b.patT - 0.6); b.rel = h => h - b.t0; if (b.sg1 && b.sg1.on) render(); return fn && fn(bt); });
      { const b = beat('litmus', 'titration'); let first = -1, n = 0, rows = 0, early = 0;
        run(b, 4.6, bt => { if (b.sg1.on && bt < 0.9 && G.hazards.length) early++; if (hurts.length && first < 0) first = bt; });
        n = G.hazards.length; rows = b.sg1.k;
        if (!b.sg1 || b.sg1.t < 1) bad.push('Litmus never started Titration'); if (early) bad.push('Litmus dropped drips inside the line tell');
        if (first >= 0 && first < 1.0) bad.push('Litmus drip hurt ' + first.toFixed(2) + ' s in (tell is 1.0)');
        if (rows < 4 || n < 20) bad.push('Titration left ' + n + ' drips over ' + rows + ' rows (want 4 rows)');
        if (n && G.hazards[0].color !== ELEMENTS[b.lit].color) bad.push('Titration drips are not the current colour');
        out.titration = [rows, n].join('/'); }
      { const b = beat('johnny', 'unroll'); let exposedEarly = 0, band = null, crossed = 0, started = -1;
        const p = G.player;
        run(b, 1.6, bt => { if (b.sg1.on && bt < 0.7 && b.bpExposed > G.t) exposedEarly++; if (b.sg1.band) { started = bt; return true; } });
        if (started < 0) bad.push('Johnny band never stretched'); else {
          if (started < 0.75) bad.push('Johnny band stretched ' + started.toFixed(2) + ' s in (tell is 0.8)');
          if (!(b.bpExposed > G.t)) bad.push('Johnny not exposed while the band is stretched');
          const s = b.sg1, a = s.a, nx = -Math.sin(a), ny = Math.cos(a), mx = b.x + Math.cos(a) * s.L * 0.5, my = b.y + Math.sin(a) * s.L * 0.5;
          p.x = mx + nx * 30; p.y = my + ny * 30; let side = 1;
          for (let i = 0; i < 40; i++) { p.x -= nx * 6; p.y -= ny * 6; update(1 / 60); if ((p.x - mx) * nx + (p.y - my) * ny < 0) crossed++; if (!s.band) break; }
          if (crossed) bad.push('Johnny band let the player through (' + crossed + ' frames)');
        }
        if (exposedEarly) bad.push('Johnny exposed during the band tell'); }
      { const b = beat('mucus', 'drip'); let landed = -1, early = 0, seen = 0;
        run(b, 4.5, bt => { if (b.sg1.marks.length && !seen) { seen = bt; render(); } if (hurts.length && landed < 0) landed = bt; });
        const patches = G.zones.filter(z => z.rxMade === 'mucusdrip').length;
        if (!seen && seen !== 0) bad.push('Plug drip never marked a drop');
        if (landed >= 0 && landed < 0.65) bad.push('Plug drop hit ' + landed.toFixed(2) + ' s in (mark is 0.6 s)');
        if (patches < 3) bad.push('Plug drip left ' + patches + ' Mucus patches (want 3 or 4)');
        out.drip = patches + '@' + landed.toFixed(2); }
      { const b = beat('cramp', 'contract'); const p = G.player; let pulledEarly = 0, d0 = Math.hypot(p.x - b.x, p.y - b.y), hitAt = -1;
        run(b, 3.7, bt => { if (bt < 0.78 && Math.abs(Math.hypot(p.x - b.x, p.y - b.y) - d0) > 3) pulledEarly++; if (hurts.length && hitAt < 0) hitAt = bt; });
        const d1 = Math.hypot(p.x - b.x, p.y - b.y);
        if (pulledEarly) bad.push('Cramp pulled during the ring tell');
        if (d1 > d0 - 40) bad.push('Cramp contraction pulled nothing (' + d0.toFixed(0) + ' to ' + d1.toFixed(0) + ')');
        if (hurts.length !== 1) bad.push('Cramp contraction hurt ' + hurts.length + ' times (want once): ' + window.hn.slice(0, 4)); else if (hitAt < 2.75) bad.push('Cramp hurt ' + hitAt.toFixed(2) + ' s in (ring shuts at 2.8) by ' + window.hn + ' d ' + Math.hypot(p.x - b.x, p.y - b.y).toFixed(0));
        const c2 = beat('cramp', 'contract'); const q = G.player; q.x = c2.x + 300; q.y = c2.y; // swimming outward all the way: nothing lands
        run(c2, 3.7, () => { q.x += 5; });
        if (hurts.length) bad.push('Cramp contraction hurt a player swimming outward');
        out.contract = [d0.toFixed(0), d1.toFixed(0), hitAt.toFixed(2)].join('/'); }
      { const b = beat('sneeze', 'sniffle'); let first = -1, early = 0;
        run(b, 4.5, bt => { if (G.ebul.some(q => q.owner === b) && first < 0) first = bt; });
        const patches = G.zones.filter(z => z.rxMade === 'sniffle').length;
        if (first < 0.75) bad.push('Sneeze cloud launched ' + first.toFixed(2) + ' s in (tell is 0.8)');
        if (patches < 3) bad.push('Sniffle left ' + patches + ' Mucus patches (want about 10)');
        out.sniffle = first.toFixed(2) + '/' + patches; }
      window.hurtPlayer = hp0; }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
