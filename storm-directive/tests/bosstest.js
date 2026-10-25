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
    // C3 tier 3 signature beats (bosssig10_t3.js): the tell shows first, nothing lands inside it, the beat does what the table says.
    const step3 = (n, fn) => step(n, (t, i) => { G.state = 'play'; return fn(t, i); });
    const hs = () => Object.values(G.stats.hurt).reduce((a, b) => a + b, 0); // (damage taken so far: hp is clamped to max)
    const place = (b, ang, d) => { G.state = 'play'; G.player.x = b.x + Math.cos(ang) * d; G.player.y = b.y + Math.sin(ang) * d; G.player.iframes = 0; };
    if (BOSSES.some(B => ['fever', 'alpha', 'colossus'].includes(B.id) && B.patterns.some(q => ['aimedFan', 'spiral', 'ring'].includes(q)))) bad.push('tier 3 still has a generic spray slot');
    { // Flush: gaps marked 0.7 s first, a player in the gap takes nothing, a player outside it does
      const run = inGap => {
        const b = tellBoss('fever', 'flush'); const hp0 = hs(); let tellSeen = 0, hurtTell = 0, hurt = 0, tellEnd = -1;
        step3(420, t => {
          const s = b.sg3, f = s && s.fl; if (!f) { place(b, 0, 250); return false; }
          if (f.t < 0) { tellSeen++; render(); if (hs() > hp0) hurtTell++; } else if (tellEnd < 0) tellEnd = t;
          let n = 0; while (n < 2 && sg3FlushR(b, n, f.t) > 250 + 30) n++;
          place(b, inGap ? sg3FlushGap(s, n) : sg3FlushGap(s, n) + Math.PI, 250);
          if (hs() > hp0) hurt++;
          return f.done;
        });
        return { tellSeen, hurtTell, hurt, hp: hs() > hp0, b };
      };
      const a = run(true), c = run(false);
      if (!a.tellSeen) bad.push('Flush showed no gap mark'); if (a.hurtTell || c.hurtTell) bad.push('Flush hurt during its mark');
      if (a.hp) bad.push('standing in the Flush gap still took damage'); if (!c.hp) bad.push('standing outside the Flush gap took nothing');
      const s = a.b.sg3; if (Math.abs(sg3FlushGap(s, 1) - sg3FlushGap(s, 0) - SG3.flushStep) > 1e-6) bad.push('Flush gap does not step');
      out.flush = [a.tellSeen, a.hp, c.hp].join('/');
    }
    { // Flex: the landing is marked, the shockwave comes 0.3 s after it, a player clear of the spot is untouched
      const run = near => {
        const b = tellBoss('alpha', 'dash3'); const hp0 = hs(); let land = -1, hurtAt = -1, marker = 0, fx = null, hold = null;
        step3(480, t => {
          const f = b.sg3 && b.sg3.flex;
          if (!f) { if (land < 0) place(b, Math.PI, 700); else if (land > 0 && hs() <= hp0) return t - land > 0.6; return false; }
          if (land < 0) { land = t; G.state = 'play'; fx = { x: f.x, y: f.y, R: f.R }; hold = { x: f.x + (near ? 70 : f.R * 2 + 80), y: f.y }; }
          if (hold) { G.player.x = hold.x; G.player.y = hold.y; G.player.iframes = 0; }
          marker++; render();
          return false;
        });
        return { land, marker, hurt: hs() > hp0, fx, b };
      };
      const n = run(true), f = run(false);
      if (n.land < 0) bad.push('Chad never landed a dash');
      else { if (!n.marker) bad.push('Flex showed no marker'); if (!n.hurt) bad.push('Flex shockwave did not hit a player on the landing spot'); if (f.hurt) bad.push('Flex hit a player well clear of the landing'); }
      if (n.fx && Math.abs(n.fx.R - n.b.r * 2.5) > 1) bad.push('Flex radius ' + n.fx.R + ' (want 2.5 x r)');
      out.flex = [n.land > 0, n.hurt, f.hurt].join('/');
    }
    { // Flex timing: no damage before 0.3 s after the landing
      const b = tellBoss('alpha', 'dash3'); const hp0 = hs(); let land = -1, hurtAt = -1, hold = null;
      step3(480, t => {
        const f = b.sg3 && b.sg3.flex;
        if (!f && land < 0) { place(b, Math.PI, 700); return false; }
        if (f && land < 0) { land = t; hold = { x: f.x + 70, y: f.y }; }
        if (hold) { G.player.x = hold.x; G.player.y = hold.y; G.player.iframes = 0; }
        if (land > 0 && hurtAt < 0 && hs() > hp0) { hurtAt = t; return true; }
        return land > 0 && t - land > 1;
      });
      if (hurtAt < 0) bad.push('Flex timing: no hit'); else if (hurtAt - land < 0.25) bad.push('Flex landed ' + (hurtAt - land).toFixed(2) + ' s after the dash (want 0.3)');
      out.flexT = (hurtAt - land).toFixed(2);
    }
    { // Y-volley: three lanes 120 degrees apart, a player between the arms is safe, one on a lane is hit only after the mark
      const run = onLane => {
        const b = tellBoss('colossus', 'yvolley'); const hp0 = hs(); let tellSeen = 0, hurtTell = 0, sweepAt = -1, hurtAt = -1, lanes = null, set = false, hold = null;
        step3(300, t => {
          const s = b.sg3; if (!s || s.y == null) { place(b, 0, 250); return false; }
          if (s.y === 0) { tellSeen++; render(); if (hs() > hp0) hurtTell++; if (!lanes) lanes = [0, 1, 2].map(k => sg3YAng(s, k, 0.5)); if (!set) { set = true; hold = onLane ? s.a0 : s.a0 - SG3.yOff; } }
          if (hold != null) place(b, hold, 250);
          if (s.y === 1 && sweepAt < 0) sweepAt = t;
          if (hs() > hp0 && hurtAt < 0) hurtAt = t;
          return s.y === 2;
        });
        return { tellSeen, hurtTell, sweepAt, hurtAt, lanes, hurt: hs() > hp0 };
      };
      const safe = run(false), hit = run(true);
      if (!safe.tellSeen) bad.push('Y-volley showed no lane mark'); if (safe.hurtTell || hit.hurtTell) bad.push('Y-volley hurt during its mark ');
      if (safe.hurt) bad.push('standing between the arms still took a Y-volley hit'); if (!hit.hurt) bad.push('standing on a Y-volley lane took nothing');
      else if (hit.hurtAt < hit.sweepAt) bad.push('Y-volley hit before the sweep began');
      if (safe.lanes) for (let k = 0; k < 3; k++) { const d = Math.abs(angDiff(safe.lanes[(k + 1) % 3], safe.lanes[k])); if (Math.abs(d - TAU / 3) > 1e-6) bad.push('Y-volley lanes are not 120 degrees apart'); }
      out.yvolley = [safe.tellSeen, safe.hurt, hit.hurt].join('/');
    }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
