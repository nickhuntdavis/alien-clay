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
    // C3 tier 2 signature beats (bosssig10_t2.js): the tell shows first, no damage lands before it ends, and the beat does what it says.
    const mid = (b, dx) => { const c = G.core; G.player.x = c.x; G.player.y = c.y; b.x = c.x - (dx == null ? 300 : dx); b.y = c.y; if (b.twin) { b.twin.x = b.x - 60; b.twin.y = b.y + 40; } return b; }; // (player in the middle of the dish, the boss to its left)
    const spy = () => { const log = [], h0 = hurtPlayer; let T = 0; window.__sgT = () => T; hurtPlayer = function (dmg, from, ent, kind) { log.push({ from: String(from), ent, kind, t: window.__sgNow }); return h0.apply(this, arguments); }; return { log, restore: () => { hurtPlayer = h0; } }; };
    const run = (n, fn) => { let t = 0; for (let i = 0; i < n; i++) { window.__sgNow = t; update(1 / 60); t += 1 / 60; if (fn && fn(t, i)) break; } return t; };
    { // Mitch & Osis: crossfire
      const b = mid(tellBoss('twins', 'crossfire')), tw = b.twin; tw.hp = tw.maxHp = 1e9; tw.speed = 0; tw.pat = tw.def.patterns.indexOf('charge'); tw.patT = 0; tw.st = 0;
      const sp = spy(); let own = null, laneT = -1, fireT = -1, lane = null, endT = -1, shown = 0, between = false, partnerShots = 0;
      run(420, t => {
        const o = [b, tw].find(x => x.sg2 && x.sg2.cf); const cf = o && o.sg2.cf;
        if (cf && cf.ph === 1 && laneT < 0) { laneT = t; own = o; const q = o === b ? tw : b; lane = { ax: cf.ax, ay: cf.ay, bx: cf.bx, by: cf.by }; between = ((cf.ax - G.player.x) * (cf.bx - G.player.x) + (cf.ay - G.player.y) * (cf.by - G.player.y)) < 0 && Math.hypot(cf.ax - o.x, cf.ay - o.y) < 2 && Math.hypot(cf.bx - q.x, cf.by - q.y) < 2; }
        if (cf && cf.ph === 1) { shown++; render(); }
        if (cf && cf.ph === 2 && fireT < 0) fireT = t;
        if (own && G.ebul.some(q => q.owner && q.owner.twin === own || q.owner === own.twin)) partnerShots++;
        if (cf && cf.ph === 3) { endT = t; return true; }
      sp.restore();
      const hits = sp.log.filter(h => /crossfire/.test(h.from));
      if (laneT < 0) bad.push('Twins never lit a crossfire lane'); else {
        if (!between) bad.push('Twins lane is not between the two bodies on opposite sides of the player');
        if (!shown) bad.push('Twins lane never drawn');
        if (fireT - laneT < 0.85) bad.push('Twins Beam came ' + (fireT - laneT).toFixed(2) + ' s after the lane lit (want 0.9)');
        if (!hits.length) bad.push('Twins Beam never hit a player standing in the lane');
        if (hits.some(h => h.ent !== own)) bad.push('Twins crossfire hit from the body that should hold fire');
        if (hits.some(h => h.t < laneT + 0.85)) bad.push('Twins crossfire hurt before its tell ended');
        if (endT - fireT < 0.35) bad.push('Twins Beam ran ' + (endT - fireT).toFixed(2) + ' s (want 0.4)');
        if (partnerShots) bad.push('Twins fired bullets during the crossfire');
      }
      out.twinsCross = [laneT, fireT, endT].map(v => +v.toFixed(2)).join('/');
    { // Kidney Stone: each shed layer rolls a chunk down a marked lane
      const b = mid(tellBoss('stone', 'gravel')), c = fightCd(b), sp = spy(); let marked = 0, n0 = 0, rollT = -1, hitT = -1, t0 = 0;
      run(5);
      const l0 = c.layers; t0 = 1; dropLayer(c, { layersLost: 0 }); run(1); dropLayer(c, { layersLost: 0 }); run(1);
      const n = (b.sg2.chunks || []).length; out.stoneChunks = n + '/' + (l0 - c.layers);
      if (n !== l0 - c.layers || n !== 2) bad.push('Stone shed ' + (l0 - c.layers) + ' layers but ' + n + ' chunks');
      const tShed = 0; let el = 0; run(120, t => { el = t; if (b.sg2.chunks.length && b.sg2.chunks[0].t < 0.75) { marked++; render(); } if (b.sg2.chunks.length && b.sg2.chunks[0].t > 0.8 && rollT < 0) rollT = t; });
      sp.restore();
      const gh = sp.log.filter(h => /gravel/.test(h.from) && h.kind === 'bullets');
      if (!marked) bad.push('Stone chunk lane never drawn');
      if (!gh.length) bad.push('Stone chunk never reached a player in its lane');
      if (gh.some(h => h.t < 0.75)) bad.push('Stone chunk hurt before its lane tell ended');
      const b2 = mid(tellBoss('stone', 'fragment')); run(60); if (!(b2.sg2.chunks && b2.sg2.chunks.length)) bad.push('Stone fragment pattern calved no chunk');
    { // The Matron: route marked bed to bed, then she heals what she passes
      const b = mid(tellBoss('matron', 'rounds')); const o = makeEnemy(ENEMIES.crawler, b.x, b.y); o.speed = 0; G.enemies.push(o); const sp = spy();
      let tellAt = -1, goAt = -1, x0 = null, pts = null, moved0 = 0, healed = -1, maxLeg = 0;
      run(360, t => {
        const rd = b.sg2 && b.sg2.rd;
        if (rd && rd.ph === 0) { if (tellAt < 0) { tellAt = t; x0 = { x: b.x, y: b.y }; pts = rd.pts.map(q => ({ x: q.x, y: q.y })); o.x = pts[0].x; o.y = pts[0].y; o.hp = o.maxHp * 0.3; } moved0 = Math.max(moved0, Math.hypot(b.x - x0.x, b.y - x0.y)); render(); if (o.hp > o.maxHp * 0.31 && healed < 0) healed = -2; }
        if (rd && rd.ph === 1 && goAt < 0) goAt = t;
        if (rd && rd.ph === 1) { maxLeg = rd.leg; if (o.hp > o.maxHp * 0.31 && healed < 0) healed = t; }
        if (rd && rd.ph === 2) return true;
      sp.restore();
      if (tellAt < 0) bad.push('Matron never marked a route'); else {
        if (!pts || pts.length !== 3) bad.push('Matron route is not 3 beds');
        if (goAt - tellAt < 0.85) bad.push('Matron walked ' + (goAt - tellAt).toFixed(2) + ' s after marking (want 0.9)');
        if (moved0 > 4) bad.push('Matron moved during her route tell');
        if (healed === -2) bad.push('Matron healed during her route tell');
        if (healed < 0) bad.push('Matron healed nothing on her route');
        if (maxLeg < 2) bad.push('Matron did not walk the route (leg ' + maxLeg + ')');
      }
      out.matronRoute = [tellAt, goAt].map(v => +v.toFixed(2)).join('/');
    { // The Phantom Pregnancy: copies are not enemies, the real one is the autoaim target, copies fade
      const b = mid(tellBoss('ghost', 'falsepos')); G.enemies.length = 0; G.enemies.push(b); G.player.hp = 1e9; let tellAt = -1, copies = 0, tgt = null, faded = false, bulletBeforeJump = 0, jumps = 0, firstRing = -1, firstJump = -1, lastX = b.x, lastY = b.y;
      run(300, t => {
        const fp = b.sg2 && b.sg2.fp;
        if (fp) { if (tellAt < 0) tellAt = t; copies = Math.max(copies, fp.cp.length); if (fp.t > 0.4 && fp.t < 0.6) { tgt = acquire('nearest', 3000, G.player.x, G.player.y); render(); } if (fp.t > 3.8) faded = true; }
        if (fp && (b.x !== lastX || b.y !== lastY) && fp.jump > jumps) { jumps = fp.jump; if (firstJump < 0) firstJump = t; }
        lastX = b.x; lastY = b.y;
        if (firstJump < 0 && G.ebul.length) bulletBeforeJump++;
        if (firstJump > 0 && firstRing < 0 && G.ebul.length) firstRing = t;
        if (G.enemies.length > 1) { bad.push('Phantom copies became enemies'); return true; }
        return fp && fp.t > 4.1;
      if (copies !== 2) bad.push('Phantom made ' + copies + ' copies (want 2)');
      if (tgt !== b) bad.push('Phantom autoaim did not pick the real one');
      if (!faded) bad.push('Phantom copies never reached the fade');
      if (bulletBeforeJump) bad.push('Phantom fired before its landing marker resolved');
      if (firstRing - firstJump < 0.25) bad.push('Phantom ring came ' + (firstRing - firstJump).toFixed(2) + ' s after landing (want 0.3)');
      if (jumps < 2) bad.push('Phantom blinked only ' + jumps + ' times in 4 s');
      out.ghostFalse = [tellAt, firstJump, firstRing].map(v => +v.toFixed(2)).join('/');
    { // The Immune Eye: the glare sweeps a marked 60 degree sector
      for (const off of [0, 1]) {
        const b = mid(tellBoss('eye', 'saccade')); const sp = spy(); let tellAt = -1, sweepAt = -1, a0 = 0, a1 = 0, endT = -1;
        if (off) { G.player.x = b.x; G.player.y = b.y + 300; }
        run(300, t => {
          const sc = b.sg2 && b.sg2.sc;
          if (sc && sc.ph === 0) { if (tellAt < 0) tellAt = t; render(); }
          if (sc && sc.ph === 1) { if (sweepAt < 0) { sweepAt = t; a0 = sc.ang; } a1 = sc.ang; }
          if (sc && sc.ph === 2) { endT = t; return true; }
        sp.restore();
        const hits = sp.log.filter(h => /saccade/.test(h.from));
        if (tellAt < 0) bad.push('Eye never marked a sector');
        else if (!off) {
          if (sweepAt - tellAt < 0.75) bad.push('Eye swept ' + (sweepAt - tellAt).toFixed(2) + ' s after marking (want 0.8)');
          if (Math.abs(Math.abs(a1 - a0) - Math.PI / 3) > 0.1) bad.push('Eye sector spans ' + (Math.abs(a1 - a0) * 180 / Math.PI).toFixed(0) + ' degrees (want 60)');
          if (endT - sweepAt < 1.1 || endT - sweepAt > 1.4) bad.push('Eye sweep ran ' + (endT - sweepAt).toFixed(2) + ' s (want 1.2)');
          if (!hits.length) bad.push('Eye sweep never hit a player inside the sector');
          if (hits.some(h => h.t < tellAt + 0.75)) bad.push('Eye hurt before its sector tell ended');
          out.eyeSaccade = [tellAt, sweepAt, endT].map(v => +v.toFixed(2)).join('/');
        } else if (hits.length) bad.push('Eye sweep hit a player outside the sector');
      }
    { // The Pepsinator: reflux floods one marked half, rolling out over a second
      const b = mid(tellBoss('pepsin', 'reflux')); let tellAt = -1, firstP = -1, lastP = -1, n = 0, side = null, early = 0, wrong = 0, shown = 0;
      run(300, t => {
        const rf = b.sg2 && b.sg2.rf;
        if (rf && tellAt < 0) { tellAt = t; side = { x: rf.x0, y: rf.y0, nx: Math.cos(rf.a), ny: Math.sin(rf.a) }; }
        if (rf && rf.t < 1) { shown++; render(); }
        if (side) {
          const hz = G.hazards.filter(h => /reflux/.test(h.name)); if (hz.length && firstP < 0) firstP = t; if (hz.length > n) { n = hz.length; lastP = t; }
          if (hz.length && tellAt > 0 && t - tellAt < 0.95) early++;
          for (const h of hz) if ((h.x - side.x) * side.nx + (h.y - side.y) * side.ny < -1) wrong++;
        return lastP > 0 && t - lastP > 0.4;
      if (tellAt < 0) bad.push('Pepsinator never started a reflux'); else {
        if (!shown) bad.push('Pepsinator half never drawn');
        if (early) bad.push('Pepsinator pools landed inside the 1 s tell');
        if (n < 12) bad.push('Pepsinator left only ' + n + ' pools');
        if (wrong) bad.push('Pepsinator pools on the unmarked half');
        if (lastP - firstP < 0.5) bad.push('Pepsinator wave rolled out in ' + (lastP - firstP).toFixed(2) + ' s (want about 1)');
      }
      out.pepsinReflux = [tellAt, firstP, lastP, n].map(v => +v.toFixed(2)).join('/');
    { // The Macrophage Queen: adds queue on one marked line, rush it, then she devours the survivors
      const b = mid(tellBoss('queen', 'dinner')); G.enemies.length = 0; G.enemies.push(b); const adds = [];
      for (let i = 0; i < 5; i++) { const o = makeEnemy(ENEMIES.crawler, b.x + 80 * Math.cos(i), b.y + 80 * Math.sin(i)); o.summonedBy = b; G.enemies.push(o); adds.push(o); }
      b.hp = b.maxHp * 0.5; const sp = spy(); let tellAt = -1, rushAt = -1, lined = 0, off = 0, moved = 0, p0 = null, eaten = -1, shown = 0;
      run(420, t => {
        const dn = b.sg2 && b.sg2.dn;
        if (dn && dn.ph === 0) { if (tellAt < 0) tellAt = t; shown++; render(); }
        if (dn && dn.ph === 1 && rushAt < 0) {
          rushAt = t; const dx = Math.cos(dn.a), dy = Math.sin(dn.a);
          for (const o of adds) if (!o.dead) { lined++; if (Math.abs((o.x - b.x) * dy - (o.y - b.y) * dx) > 14) off++; }
          p0 = adds.map(o => ({ x: o.x, y: o.y }));
        if (dn && dn.ph === 2 && p0 && !moved) moved = Math.max(...adds.map((o, i) => Math.hypot(o.x - p0[i].x, o.y - p0[i].y)));
        if (dn && dn.ph === 2 && eaten < 0 && adds.some(o => o.dead)) eaten = t;
        if (dn && dn.ph === 2 && t - rushAt > 3) return true;
      sp.restore();
      if (tellAt < 0) bad.push('Queen never rang the dinner bell'); else {
        if (!shown) bad.push('Queen line never drawn');
        if (rushAt - tellAt < 0.85) bad.push('Queen adds rushed ' + (rushAt - tellAt).toFixed(2) + ' s after the line showed (want 0.9)');
        if (off || lined < 4) bad.push('Queen adds not in one line (' + off + ' of ' + lined + ' off it)');
        if (moved < 100) bad.push('Queen adds only rushed ' + moved.toFixed(0) + ' px');
        if (eaten < 0 || !(b.hp > b.maxHp * 0.5)) bad.push('Queen did not devour the survivors to heal');
        if (sp.log.some(h => h.t < tellAt + 0.85)) bad.push('Queen adds hurt the player during the tell');
      }
      out.queenDinner = [tellAt, rushAt, eaten].map(v => +v.toFixed(2)).join('/');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
