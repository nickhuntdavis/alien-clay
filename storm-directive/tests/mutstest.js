// v10 mutation cards (mutations.js): every card registers with a valid shape, the starting pool of 8 does something
// measurable, ranks stack, weapon mutations cap at 3 per weapon, and ineligible cards say why.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; META.rxSeen = []; };
    const give = id => { if (!G.weapons.some(w => !w)) G.weapons.push(null); optNewWeapon(id, 0).apply(); return G.weapons.find(w => w && w.id === id); };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + (dx == null ? 90 : dx), p.y + (dy || 0)); e.hp = e.maxHp = 1000; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const card = id => CARDS.find(c => c.id === id);
    const tick = (s) => { for (let i = 0; i < s * 60; i++) mutTick(1 / 60); };
    // 1. Shape
    const MUT = CARDS.filter(c => /^[mwtxr]_/.test(c.id)), CAT = CARDS.filter(c => /^cat_/.test(c.id)), CONC = CARDS.filter(c => /^conc_/.test(c.id));
    out.counts = [MUT.length, CAT.length, CONC.length];
    if (MUT.length !== 33) bad.push('mutation cards: ' + MUT.length);
    if (CAT.length < 19) bad.push('catalysts: ' + CAT.length);
    if (CONC.length !== 4) bad.push('concentration cards: ' + CONC.length);
    const TYPES = ['force', 'acid', 'static', 'mucus', 'blood', 'soul', 'fire', null];
    for (const c of MUT.concat(CAT, CONC)) {
      const miss = ['id', 'kind', 'family', 'title', 'desc', 'icon', 'color'].filter(k => !c[k]);
      if (miss.length) bad.push(c.id + ' missing ' + miss);
      if (!['acquire', 'enhance', 'specialise'].includes(c.kind)) bad.push(c.id + ' kind');
      if (![null, 'genome', 'weaponmut'].includes(c.slot)) bad.push(c.id + ' slot ' + c.slot);
      if (!TYPES.includes(c.type)) bad.push(c.id + ' type ' + c.type);
      if (!(c.rarity >= 0 && c.rarity <= 5)) bad.push(c.id + ' rarity');
      for (const f of ['eligible', 'apply', 'rank']) if (typeof c[f] !== 'function') bad.push(c.id + ' no ' + f);
      if (!(c.maxRank >= 1)) bad.push(c.id + ' maxRank');
      if (/element|cast\b|—/i.test(c.title + c.desc)) bad.push(c.id + ' banned word');
    }
    const starts = MUT.filter(c => c.start).map(c => c.title).sort();
    out.starts = starts;
    if (starts.length !== 8) bad.push('starting pool size ' + starts.length);
    // 2. Ineligible cards say why
    fresh(); genLoot({ kind: 'start' })[0].apply();
    for (const id of ['t_soul', 'r_group', 'r_mess', 'cat_splash', 'conc_soul']) {
      const c = card(id);
      if (c.eligible(G) || !c.why(G)) bad.push(id + ' should be ineligible with a reason: ' + c.why(G));
    }
    out.why = card('t_soul').why(G);
    // 3. Starting pool: each does something measurable
    fresh(); const wp = give('v_phys_proj'); give('v_phys_contact'); const wc = G.weapons.find(w => w && w.id === 'v_phys_contact');
    G.p0 = G.player;
    card('m_slip').apply(G); G.player.vx = 120; tick(3.1);
    if (!(mutSpeed() > 1.15)) bad.push('Slipstream: ' + mutSpeed());
    G.player.vx = 0; tick(2); if (!(mutSpeed() < 1.1)) bad.push('Slipstream did not fade');
    const mg0 = G.P.magnet; card('m_fingers').apply(G); if (!(G.P.magnet > mg0)) bad.push('Sticky Fingers');
    const gem = { x: G.player.x + 200, y: G.player.y, v: 1, kind: 'x', mag: false, vx: 0, vy: 0 }; G.gems.push(gem); mutLevel(2); if (!gem.mag) bad.push('Sticky Fingers level pull');
    const mp0 = G.P.might, hp0 = G.P.maxHp; card('x_brain').apply(G);
    if (!(Math.abs(G.P.might / mp0 - 1.25) < 1e-6) || !(Math.abs(G.P.maxHp / hp0 - 0.8) < 1e-6)) bad.push('Big Brain');
    card('t_wires').apply(G); META.rxSeen = ['splash'];
    if (!(mutRxLock('splash') === 1 && mutRxLock('rocket') === 1.5)) bad.push('Crossed Wires lockout');
    if (!(Math.abs(mutDmg(foe(), { rx: 'splash' }, 'force') - 1.25) < 1e-6)) bad.push('Crossed Wires damage');
    // Group Project: two different weapons, same enemy, inside 0.5 s
    card('r_group').apply(G); const gp = foe(); const s1 = weaponSrc(wp), s2 = weaponSrc(wc);
    const a = mutDmg(gp, s1, 'force'), bb = mutDmg(gp, s2, 'force');
    if (!(a === 1 && Math.abs(bb - 1.3) < 1e-6)) bad.push('Group Project: ' + [a, bb]);
    // Can't Pick One: forced split
    card('w_split').apply(G, wp); if (wmN(wp, 'w_split') !== 1) bad.push('Can\'t Pick One not attached');
    const rnd = Math.random; Math.random = () => 0.01;
    G.proj.length = 0; const pr = spawnProj(wp, G.player.x, G.player.y, 0, weaponSrc(wp)); const tg = foe(); mutProjHit(pr, tg); Math.random = rnd;
    if (G.proj.filter(q => q.mSplit).length !== 2) bad.push('split shots: ' + G.proj.filter(q => q.mSplit).length);
    const sp = G.proj.find(q => q.mSplit); Math.random = () => 0.01; const before = G.proj.length; mutProjHit(sp, tg); Math.random = rnd;
    if (G.proj.length !== before) bad.push('a split shot split again');
    // Not Finished Yet: the kill flies on
    card('w_nfy').apply(G, wp);
    G.enemies.length = 0; const k1 = foe(60), k2 = foe(110); k1.hp = 5; const h2 = k2.hp;
    damageEnemy(k1, 500, weaponSrc(wp)); for (let i = 0; i < 4; i++) update(1 / 60);
    if (!k1.dead || !(k2.hp < h2)) bad.push('Not Finished Yet: ' + [k1.dead, k2.hp]);
    // Keep Spinning on a Contact weapon: damage ramps with hits in a row
    card('w_spin').apply(G, wc); const ks = foe(); let last = 1; for (let i = 0; i < 12; i++) last = mutDmg(ks, weaponSrc(wc), 'force');
    if (!(last > 1.4 && last <= 1.5001)) bad.push('Keep Spinning ramp: ' + last);
    // 4. Ranks stack and cap
    fresh(); give('v_phys_proj'); const sc = card('m_slip');
    for (let i = 0; i < 5; i++) sc.apply(G);
    if (sc.rank(G) !== 3 || G.muts.m_slip !== 3) bad.push('rank cap: ' + sc.rank(G));
    out.rank = sc.rank(G);
    META.rxSeen = ['rocket']; const cc = card('cat_rocket'); if (!cc.eligible(G)) bad.push('catalyst not eligible once discovered');
    cc.apply(G); cc.apply(G); if (cc.rank(G) !== 2 || !(mutRxLock('rocket') < 1.5)) bad.push('catalyst stack');
    // 5. Weapon mutations cap at 3 per weapon
    fresh(); const w1 = give('v_phys_contact'); const sk = card('w_spin');
    for (let i = 0; i < 5; i++) if (sk.eligible(G)) sk.apply(G, w1);
    out.wm10 = w1.wm10.slice();
    if (w1.wm10.length !== 3) bad.push('weapon mutation cap: ' + w1.wm10.length);
    if (sk.eligible(G) || !sk.why(G)) bad.push('capped weapon mutation still eligible');
    if (card('w_split').eligible(G)) bad.push('Can\'t Pick One offered with no Projectile weapon');
    // 6. Draft integration: Genome slots fill from G.muts
    fresh(); give('v_phys_proj'); for (const id of ['m_slip', 'm_fingers', 'x_brain', 'x_qty']) card(id).apply(G);
    if (genomeFree() !== 0) bad.push('genome free ' + genomeFree());
    if (cardOk(card('m_heart'))) bad.push('new Genome card offered with slots full');
    if (!cardOk(card('m_slip')) && card('m_slip').rank(G) < card('m_slip').maxRank) bad.push('owned card should still be offered to rank up');
    // 7. Smoke: every eligible card applies and a few seconds of play do not throw
    fresh(); give('v_phys_proj'); give('v_shock_contact'); give('v_arcane_pool'); give('v_soul_proj');
    META.rxSeen = ['splash', 'rocket'];
    const e1 = foe(70), e2 = foe(-80); e1.hp = e1.maxHp = e2.hp = e2.maxHp = 1e5;
    let applied = 0;
    for (const c of MUT.concat(CAT, CONC)) { try { if (c.eligible(G)) { c.apply(G, c.slot === 'weaponmut' ? draftMutTarget() : null); applied++; } } catch (e) { bad.push('apply ' + c.id + ': ' + e.message); } }
    recomputeAll(); out.applied = applied;
    for (let i = 0; i < 360; i++) { try { update(1 / 60); } catch (e) { bad.push('update: ' + e.message); break; } if (G.state !== 'play') break; }
    // Heartbeat measurably hurts a neighbour
    fresh(); card('m_heart').apply(G); const hb = foe(50); G.mut10 = null; mutSt(); G.mut10.hbT = 0.01; const hh = hb.hp; mutTick(0.02);
    if (!(hb.hp < hh)) bad.push('Heartbeat did nothing');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
