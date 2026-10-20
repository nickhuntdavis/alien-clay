// v10 Feats (feats10.js): every Feat card registers with a valid shape; every Feat performs (on its moment or on a tap) and
// damages or does its utility; stamina is paid by attacking Feats and not by utility ones; levels apply; level 3 and 5
// forks register and every fork variant performs without errors.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    window.F10_ALL = 1; draftAbsorb();
    // ---- cards and forks
    const ids = F10_ORDER.slice();
    out.feats = ids.length;
    if (ids.length < 15) bad.push('only ' + ids.length + ' Feats');
    const TYPES = ['force', 'acid', 'static', 'mucus', 'blood', 'soul', 'fire'];
    for (const id of ids) {
      const d = F10[id];
      for (const cid of ['feat_' + id, 'feat_' + id + '_up']) {
        const c = CARDS.find(x => x.id === cid);
        if (!c) { bad.push('card missing ' + cid); continue; }
        const okShape = ['acquire', 'enhance'].includes(c.kind) && c.slot === 'feat' && /^feat:(utility|force|acid|static|mucus|blood|soul|fire)$/.test(c.family) && (c.type === null || TYPES.includes(c.type))
          && c.rarity >= 0 && c.rarity <= 5 && typeof c.start === 'boolean' && c.title && c.desc && c.icon && c.color && typeof c.eligible === 'function' && typeof c.apply === 'function' && typeof c.rank === 'function' && c.maxRank === 5;
        if (!okShape) bad.push('card shape ' + cid);
        if (/\b(cast|element)/i.test(c.desc)) bad.push('banned word in ' + cid);
        if (c.family !== 'feat:' + (d.type || 'utility')) bad.push('family ' + cid);
        for (const lv of [3, 5]) { const f = FORKS['feat:' + cid + '@' + lv]; if (!f || f.length !== 2 || f.some(o => !o.title || !o.desc || typeof o.apply !== 'function')) bad.push('fork ' + cid + ' ' + lv); }
      }
      if (!d.type && d.stam) bad.push('utility with stamina: ' + id);
      if (d.type && !d.atk) bad.push('attack Feat without attack type: ' + id);
    }
    const typesSeen = new Set(ids.filter(i => F10[i].start).map(i => F10[i].type).filter(Boolean));
    for (const t of TYPES) if (!typesSeen.has(t)) bad.push('starting pool lacks ' + t);
    out.start = ids.filter(i => F10[i].start).length;
    if (out.start !== 18) bad.push('starting pool is ' + out.start); // (FEATS.md 5: 15, plus Van de Graaff added 20 Oct, plus main's Hagfish and Running With Scissors)

    // ---- harness
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list); G.stats.dmg = {}; G.manual = { x: 0, y: 0 }; if (!G.stam) stamInit(); G.stam.cur = stamMax(); };
    const foe = (dx, dy, o) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + (dy || 0)); e.hp = e.maxHp = 1e6; e.speed = 0; if (o) Object.assign(e, o); G.enemies.push(e); gridBuild(); return e; };
    const ring = (n, d, o) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; foe(Math.cos(a) * d, Math.sin(a) * d, o); } };
    const run = s => { let minSt = 1e9; for (let i = 0; i < s * 60; i++) { update(1 / 60); if (G.state === 'bossIntro') G.state = 'play'; /* (first-sighting cards would pause the longer Feats) */ if (G.stam) minSt = Math.min(minSt, G.stam.cur); } return minSt; };
    const dealt = () => Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
    const hurt = (n, ent) => { pdef().mem.mem = 0; G.player.iframes = 0; hurtPlayer(n, 't', ent || null, 'contact'); };
    const full = () => { G.stam.cur = stamMax(); };
    // per Feat: set the scene (after the Feat is held), act, and a check for utility effects. All attack Feats must also deal damage.
    const T = {
      little_bubble: { pre: () => { G.P.maxHp = G.player.hp = 1000; ring(6, 85); }, act: () => { hurt(300); return G.player.hp; }, sec: 0.3, ok: hp => hp === 1000 || 'hit not absorbed' },
      oopsie: { pre: () => { ring(8, 100); }, act: () => {}, sec: 0.5, ok: () => (G.peek && G.peek.t > G.t) || 'did not hide' },
      anhydrobiosis: { pre: () => { G.P.maxHp = G.player.hp = 1000; ring(5, 130); }, act: () => { hurt(1150); return G.player.hp; }, sec: 3.2, ok: hp => hp === 1000 || 'hit not missed' },
      big_feelings: { pre: () => ring(6, 70), act: () => {}, sec: 0.5 },
      sticky_business: { pre: () => foe(60, 0, { elite: true }), act: () => {}, sec: 0.5, ok: () => G.enemies.some(e => e.snareT > G.t) || 'nothing Snared' },
      jump_scare: { pre: () => ring(4, 50), act: () => {}, sec: 0.5, ok: () => G.enemies.some(e => e.fearT > G.t) || 'nothing Feared' },
      kiss_it_better: { pre: () => { G.P.maxHp = 1000; G.player.hp = 500; }, act: () => { hurt(5); hurt(5); hurt(5); }, sec: 0.2, ok: () => G.player.hp > 500 || 'no heal' },
      more: { pre: () => { G.P.maxHp = 1000; G.player.hp = 100; G.gems.push({ x: G.player.x + 200, y: G.player.y, v: 1, kind: 'x', mag: false, vx: 0, vy: 0 }); }, act: () => gainXp(1), sec: 0.1, ok: () => G.gems.some(g => g.mag) || 'orbs not called' },
      and_another_thing: { pre: () => { foe(40, 0); foe(0, 40); }, act: () => { for (let i = 0; i < 3; i++) { const e = foe(30 + i * 5, -30); e.hp = 1; killEnemy(e, {}); } }, sec: 1.6 },
      brown_fat: { pre: () => ring(6, 150), act: () => {}, sec: 4.5, ok: () => (G.fst && G.fst.ignite > 0) || 'nothing ignited' },
      sofa_crevice: { pre: () => ring(6, 150), act: () => {}, sec: 1.5 },
      formic_acid: { pre: () => { foe(150, 0); foe(190, 0); }, act: () => {}, sec: 0.6 },
      tonic_immobility: { pre: () => ring(5, 120), act: () => {}, sec: 0.5, ok: () => G.enemies.some(e => e.dazeT > G.t) || 'nothing staggered' },
      shed_the_lining: { pre: () => { G.player.face = 0; foe(120, 0); foe(160, 40); }, act: () => {}, sec: 3, ok: () => G.enemies.some(e => e.bleeds && e.bleeds.length) || 'nothing bleeding' },
      vanishing_twin: { pre: () => { foe(150, 0); foe(160, 50); }, act: () => {}, sec: 0.6, ok: () => (G.fst && G.fst.possess > 0) || 'nothing Possessed' },
      not_yet: { pre: () => { G.P.maxHp = 1000; G.player.hp = 100; ring(5, 130); }, act: () => { hurt(500); return G.player.hp; }, sec: 0.5, ok: hp => (hp >= 1 && hp < 400) || 'not saved: ' + hp },
      wait_wait_wait: { pre: () => { G.P.maxHp = 1000; G.player.hp = 300; ring(7, 120); }, act: () => {}, sec: 0.5, ok: () => G.enemies.some(e => e.snareT > G.t) || 'nothing Snared' },
      come_back_here: { pre: () => { G.P.maxHp = 1000; G.player.hp = 500; }, act: () => { const e = foe(80, 0); e.hp = 1; killEnemy(e, {}); }, sec: 0.1, ok: () => G.player.hp > 500 || 'no heal' },
      that_one: { pre: () => { G.P.maxHp = 1000; G.player.hp = 900; foe(150, 0); ring(3, 100); }, act: () => { const e = G.enemies[0]; hurt(20, e); hurt(20, e); update(0.3); G.f10.hurtBy.forEach(h => { h.e = e; }); update(0.3); e.hp = 1; killEnemy(e, {}); }, sec: 0.3 },
      nesting: { pre: () => { ring(3, 70); }, act: () => {}, sec: 2.6, ok: () => G.zones.filter(z => z.elem === 'ice').length >= 6 || 'no patches' },
      mine: { pre: () => {}, act: () => { for (let i = 0; i < 10; i++) gainXp(1); }, sec: 0.1, ok: () => (G.f10.mem && G.f10.mem.hp > 0) || 'no halo' },
      packed_lunch: { pre: () => { G.P.maxHp = 1000; G.player.hp = 200; }, act: () => {}, sec: 0.3, ok: () => { if (!G.f10.yolk) return 'no yolk'; const h = G.player.hp; G.player.x = G.f10.yolk.x; G.player.y = G.f10.yolk.y; run(0.1); return G.player.hp > h || 'no heal'; } },
      hagfish: { pre: () => ring(4, 100), act: () => {}, sec: 0.5, ok: () => G.enemies.some(e => e.snareT > G.t) || 'nothing Snared' },
      running_with_scissors: { pre: () => ring(4, 100), act: () => {}, sec: 0.5, ok: () => G.enemies.some(e => e.bleeds && e.bleeds.length) || 'nothing bleeding' },
      van_de_graaff: { pre: () => { foe(150, 0); const p = G.player; for (let i = 0; i < 4; i++) eBullet(p.x + 120, p.y + (i - 1.5) * 12, Math.PI, 60, 1, 5, '#ffffff'); }, act: () => {}, sec: 4.5 },
      acro_x9: { pre: () => ring(3, 60), act: () => {}, sec: 1.6, ok: () => G.zones.some(z => z.elem === 'fire') || 'no Acid Pool' },
      // gifts10.js: the eight sample-exclusive gifts and six later-unlock gifts
      x1_baby: { pre: () => ring(6, 150), act: () => { for (let i = 0; i < 5; i++) hurt(1); }, sec: 0.3, ok: () => G.f10.noSnare > G.t || 'no shockwave' },
      x2_first: { pre: () => { G.player.face = 0; G.player.vx = 200; G.player.vy = 0; foe(80, 0); foe(120, 10); }, act: () => { f10().swimT = 5; }, sec: 0.5 },
      x3_look: { pre: () => ring(4, 50), act: () => { hurt(10); }, sec: 1.5, ok: () => G.enemies.some(e => e.bleeds && e.bleeds.length) || 'nothing bleeding' },
      x4_friends: { pre: () => { ring(2, 300); foe(36, 0); }, act: () => {}, sec: 0.3, ok: () => (G.f10.friends && G.f10.friends.length >= 3) || 'no friends' },
      x5_whered: { pre: () => { const e = foe(100, 0); e.windT = 0.3; }, act: () => {}, sec: 0.3, ok: () => G.zones.some(z => z.elem === 'ice') || 'did not slip away' },
      x6_together: { pre: () => ring(6, 60), act: () => {}, sec: 0.4, ok: () => G.enemies.some(e => e.chargeT > G.t) || 'nothing Charged' },
      x7_extras: { pre: () => { G.weapons[0] = makeSlot('v_phys_proj', false, 1); recomputeAll(); foe(150, 0); }, act: () => { const e = foe(60, 0, { elite: true }); e.hp = 1; killEnemy(e, {}); }, sec: 1, ok: () => (G.f10.copies && G.f10.copies.length > 0) || 'no copy' },
      x8_notreal: { pre: () => ring(4, 100), act: () => { pdef(); G.pd.snareT = G.t + 2; }, sec: 0.3, ok: () => !(G.pd.snareT > G.t) || 'status not cleared' },
      this_way: { pre: () => ring(7, 100), act: () => { f10().twDanger = 4; }, sec: 0.2, ok: () => !!G.f10.trail || 'no trail' },
      capacitation: { pre: () => { foe(100, 0); foe(150, 0); foe(200, 0); }, act: () => {}, sec: 0.5 },
      bombardier: { pre: () => { G.player.face = 0; foe(-120, 0); foe(-150, 10); }, act: () => {}, sec: 0.5 },
      spinnbarkeit: { pre: () => { foe(100, 0); foe(130, 0); foe(-100, 0); foe(-130, 0); }, act: () => {}, sec: 0.5, ok: () => G.enemies.some(e => e.conjT > G.t) || 'nothing Conjoined' },
      wandering_womb: { pre: () => ring(5, 150), act: () => {}, sec: 2 },
      ear_candling: { pre: () => ring(4, 200), act: () => {}, sec: 2.5 },
    };
    for (const id of ids) if (!T[id]) bad.push('no test for ' + id);
    const trial = (id, lvl, flags, label) => {
      const t = T[id], d = F10[id];
      try {
        fresh(); const w = f10Give(id, lvl);
        if (!w) { bad.push(label + ': no slot'); return null; } w.cd = 0;
        if (flags) { w.f10fk = {}; for (const f of flags) w.f10fk[f] = 1; recomputeAll(); }
        t.pre(); gridBuild(); full();
        const st0 = G.stam.cur;
        const av = t.act();
        const minSt = run(t.sec || 0.5);
        const dm = dealt(), msg = t.ok ? t.ok(av) : true;
        if (msg !== true) bad.push(label + ': ' + msg);
        if (d.type && id !== 'sofa_crevice' && !(id === 'x4_friends' && !(flags && flags.includes('plusones'))) && !(flags && flags.includes('thick')) && !(dm > 0)) bad.push(label + ': no damage');
        return { w, dm, paid: st0 - minSt };
      } catch (err) { bad.push(label + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); return null; }
    };
    const rows = [];
    for (const id of ids) {
      const d = F10[id];
      const r1 = trial(id, 1, null, id + ' Lv1');
      if (r1) {
        const cost = f10Cost(r1.w);
        if (!d.type && cost !== 0) bad.push(id + ': utility costs stamina');
        if (d.type && d.stam && cost <= 0) bad.push(id + ': attack Feat costs nothing');
        if (d.stam && r1.paid < 1 && d.type) bad.push(id + ': stamina not paid (' + r1.paid.toFixed(1) + ')');
        if (!d.stam && r1.paid > 0.5) bad.push(id + ': paid stamina it should not');
        rows.push(id + ' ' + Math.round(r1.dm) + '/' + Math.round(r1.paid));
      }
      // tap: an active Feat performs early
      if (!d.trig) {
        try { fresh(); const w = f10Give(id, 1); T[id].pre(); gridBuild(); full(); w.cd = 0; const ok = featTap(w); if (ok !== true) bad.push(id + ': tap did not perform'); } catch (err) { bad.push(id + ' tap threw: ' + err.message); }
      } else {
        try { fresh(); const w = f10Give(id, 1); if (featTap(w) !== false) bad.push(id + ': trigger gift could be tapped'); } catch (err) { bad.push(id + ' tap threw: ' + err.message); }
      }
      // forks: every option at levels 3 and 5 performs without errors
      for (const lv of [3, 5]) {
        const opts = FORKS['feat:feat_' + id + '@' + lv] || [];
        for (let i = 0; i < opts.length; i++) {
          fresh(); const w0 = f10Give(id, lv); opts[i].apply(G); recomputeAll();
          const flags = Object.keys(w0.f10fk || {}); if (flags.length !== 1) { bad.push(id + ' fork ' + lv + '/' + i + ' set ' + flags); continue; }
          trial(id, lv, flags, id + ' fork ' + flags[0]);
        }
      }
    }
    out.rows = rows;
    // ---- levels through the cards
    fresh(); const w = f10Give('big_feelings', 1); const up = CARDS.find(c => c.id === 'feat_big_feelings_up');
    const d1 = w.s.dmg, cd1 = w.s.cd;
    if (up.rank(G) !== 1 || !up.eligible(G)) bad.push('enhance card at Lv1');
    for (let i = 0; i < 4; i++) up.apply(G); recomputeAll();
    if (w.lvl !== 5 || up.rank(G) !== 5 || up.eligible(G)) bad.push('enhance to Lv5: ' + w.lvl);
    if (!(w.s.dmg > d1 * 1.8) || !(w.s.cd < cd1 * 0.8)) bad.push('levels did not scale: ' + [d1, w.s.dmg, cd1, w.s.cd]);
    out.lv = [d1, w.s.dmg, cd1, w.s.cd].map(x => +x.toFixed(2));
    // ---- slots and draft integration
    fresh();
    if (G.spells.length !== 3) bad.push('Feat slots: ' + G.spells.length);
    const acq = CARDS.find(c => c.id === 'feat_oopsie');
    if (!cardOk(acq)) bad.push('acquire card not offered with a free slot');
    window.F10_ALL = 0; if (cardOk(CARDS.find(c => c.id === 'feat_nesting'))) bad.push('later unlock offered before unlocking'); window.F10_ALL = 1;
    f10Give('oopsie'); f10Give('kiss_it_better'); f10Give('more');
    if (cardOk(CARDS.find(c => c.id === 'feat_big_feelings'))) bad.push('acquire card offered with slots full');
    if (!cardOk(CARDS.find(c => c.id === 'feat_oopsie_up'))) bad.push('enhance card not offered for a held Feat');
    const o = cardOpt(CARDS.find(c => c.id === 'feat_oopsie_up')); G.lootQueue.length = 0; o.apply(); o.apply(); // Lv1 to 2 to 3: the fork queues
    if (!G.lootQueue.some(q => q.kind === 'fork' && q.key === 'feat:feat_oopsie_up' && q.lv === 3)) bad.push('level 3 fork not queued: ' + JSON.stringify(G.lootQueue));
    if (forkCards(G.lootQueue.find(q => q.kind === 'fork')).length !== 2) bad.push('fork screen needs 2 cards');
    // ---- gifts10.js spec details: X5 slips a charger's wind-up and the dash hits its own side; X7's copy fires the real
    // first weapon and counts as a pet; X8 clears a Complement Protein's mark.
    try {
      fresh(); let w = f10Give('x5_whered'); w.cd = 0;
      const c = foe(150, 0, { st: 1, stT: 0.3, dashX: -1, dashY: 0 }); c.def = Object.assign({}, c.def, { ai: 'charge' }); c.dmg = 9;
      const mate = foe(150, 40); run(0.2);
      if (!(c.f10ff > G.t)) bad.push('X5: charger wind-up not slipped');
      mate.x = c.x; mate.y = c.y + c.r; const h0 = mate.hp; run(0.1);
      if (!(mate.hp < h0)) bad.push('X5: dodged dash did not hit its own side');
    } catch (err) { bad.push('X5 spec threw: ' + err.message); }
    try {
      fresh(); G.weapons[0] = makeSlot('v_phys_proj', false, 1); recomputeAll(); const w = f10Give('x7_extras'); w.cd = 0; foe(200, 0);
      const pets0 = sigPetCount(); const e = foe(60, 0, { elite: true }); e.hp = 1; killEnemy(e, {}); run(0.05);
      if (sigPetCount() !== pets0 + 1) bad.push('X7: copy not counted as a pet');
      const n0 = G.stats.dmg && Object.keys(G.stats.dmg).length; run(1.2);
      if (!Object.keys(G.stats.dmg).some(k => /^Echo /.test(k))) bad.push('X7: copy did not fire the first weapon (' + Object.keys(G.stats.dmg) + ')');
    } catch (err) { bad.push('X7 spec threw: ' + err.message); }
    try {
      fresh(); const w = f10Give('x8_notreal'); w.cd = 0; ring(3, 100); pdef(); run(0.05);
      G.complT = G.t + 5; run(0.2);
      if (G.complT > G.t) bad.push('X8: mark not cleared');
    } catch (err) { bad.push('X8 spec threw: ' + err.message); }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
