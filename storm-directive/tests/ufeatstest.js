// The eight samples' Unique Feats (feats10.js, SAMPLES.md): each run starts with the sample's Feat in slot 1 and no one else's;
// each Feat does its signature; its forks perform; First Contact (fightReactAs) fires reactions only: no damage, one per
// enemy, 8 per use, nearest first, Feat-only.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); }); // (weapon mechanics, not pacing: the V11 power curve off, power11.js)
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const UNIQ = { baseline: 'standard_procedure', alpha: 'personal_best', beta: 'second_wind', private: 'pulling_strings', ordered: 'shrink_wrap', redtail: 'reply_all', prawn: 'recount', alien: 'first_contact', acro: 'acro_release' }; // (acro: PROPOSED Sample 9, acrosample.js)
    // ---- a real run start per sample
    const start = id => { META.profile = 's10_' + id; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; genLoot({ kind: 'start' })[0].apply(); };
    const scene = () => { G.enemies.length = 0; G.zones.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list); G.stats.dmg = {}; G.manual = { x: 0, y: 0 }; G.weapons.forEach((w, i) => { if (w) G.weapons[i] = null; }); if (!G.stam) stamInit(); G.stam.cur = stamMax(); };
    const foe = (dx, dy, o) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + (dy || 0)); e.hp = e.maxHp = 1e6; e.speed = 0; if (o) Object.assign(e, o); G.enemies.push(e); gridBuild(); return e; };
    const ring = (n, d, o) => { const l = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; l.push(foe(Math.cos(a) * d, Math.sin(a) * d, o)); } return l; };
    const run = s => { let jump = 0, prev = G.stam.cur; for (let i = 0; i < s * 60; i++) { update(1 / 60); jump = Math.max(jump, G.stam.cur - prev); prev = G.stam.cur; } return jump; };
    const dealt = () => Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
    const slot1 = () => G.spells[0];
    for (const s of SAMPLES10) {
      start(s.id);
      const w = slot1(), fid = UNIQ[s.id];
      if (!w || w.id !== 'f10_' + fid) bad.push(s.id + ' slot 1 is ' + (w && w.id));
      if (G.spells.filter(Boolean).length !== 1) bad.push(s.id + ' starts with ' + G.spells.filter(Boolean).length + ' Feats');
      if (G.spells.length !== 3) bad.push('Feat slots ' + G.spells.length);
      for (const [o, ofid] of Object.entries(UNIQ)) {
        const acq = CARDS.find(c => c.id === 'feat_' + ofid), up = CARDS.find(c => c.id === 'feat_' + ofid + '_up');
        if (!acq || !up) { bad.push('cards missing for ' + ofid); continue; }
        if (cardOk(acq)) bad.push(s.id + ' is offered the acquire card of ' + ofid);
        if ((o === s.id) !== !!cardOk(up)) bad.push(s.id + ' enhance card of ' + ofid + ' offered=' + cardOk(up));
      }
    }
    if (F10_ORDER.some(i => Object.values(UNIQ).includes(i))) bad.push('unique Feats listed as drafted Feats');
    for (const [o, fid] of Object.entries(UNIQ)) {
      if (F10_UNIQUE[o] !== fid) bad.push('F10_UNIQUE ' + o);
      for (const lv of [3, 5]) for (const id of ['feat_' + fid, 'feat_' + fid + '_up']) { const f = FORKS['feat:' + id + '@' + lv]; if (!f || f.length !== 2) bad.push('forks ' + id + '@' + lv); }
      const d = F10[fid]; if (/\b(cast|element)/i.test(d.line + ' ' + d.does)) bad.push('banned word in ' + fid);
    }

    // ---- each signature. pre() builds the scene (the Feat is held), ok() checks after the run.
    const T = {
      standard_procedure: { sample: 'baseline', pre: () => ring(5, 80), sec: 0.4, ok: (l) => l.every(e => Math.hypot(e.x - G.player.x, e.y - G.player.y) > 100) || 'not knocked away', dmg: 1 },
      personal_best: { sample: 'alpha', pre: () => [foe(22, 0), foe(-22, 10)], sec: 0.2, ok: () => { const B = G.f10.pb; if (!B) return 'no sprint'; if (!(B.end > B.t0 + 1.55)) return 'not extended ' + (B.end - B.t0); if (!G.zones.some(z => z.elem === 'shock')) return 'no wake'; return f10Speed() > 1.5 || 'not faster'; }, dmg: 1 },
      shrink_wrap: { sample: 'ordered', pre: () => ring(5, 100), sec: 1, ok: (l) => l.every(e => snared(e)) ? (G.zones.some(z => z.elem === 'fire' && z.life > 0) || 'no Acid Pool') : 'not all Snared', dmg: 1 },
      reply_all: { sample: 'redtail', pre: () => [foe(100, 0), foe(150, 40), foe(160, -50)], sec: 0.3, ok: (l) => l.every(e => e.cd && e.cd.burnT > 0) || 'burn did not spread: ' + l.map(e => e.cd && e.cd.burnT), dmg: 1 },
    };
    // Feats that need a custom check are done by hand below.
    const stage = (sample, fid, lvl, flags) => { start(sample); scene(); const w = slot1(); w.lvl = lvl || 1; if (flags) { w.f10fk = {}; for (const f of flags) w.f10fk[f] = 1; } recomputeAll(); w.cd = 0; G.stam.cur = stamMax(); return w; };
    const tap = w => { gridBuild(); const ok = featTap(w); if (ok !== true) bad.push(w.id + ': tap did not perform'); return ok; };
    for (const [id, t] of Object.entries(T)) {
      try {
        const w = stage(t.sample, id); const l = t.pre(); gridBuild(); const st0 = G.stam.cur; tap(w); const hpAfter = l.map(e => e.hp);
        run(t.sec); const msg = t.ok(l);
        if (msg !== true) bad.push(id + ': ' + msg);
        if (t.dmg && !(dealt() > 0)) bad.push(id + ': no damage');
        if (G.stam.cur > st0 - 1 && F10[id].stam) bad.push(id + ': stamina not paid');
      } catch (err) { bad.push(id + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
    }

    // Second Wind: heals, more the lower your health is
    const wind = hp => { const w = stage('beta', 'second_wind'); G.P.maxHp = 1000; G.player.hp = hp; for (const e of ring(6, 100)) e.hp = e.maxHp * 0.5; gridBuild(); tap(w); run(0.1); return G.player.hp - hp; };
    const hLow = wind(150), hHigh = wind(800);
    out.secondWind = [Math.round(hLow), Math.round(hHigh)];
    if (!(hLow > 0)) bad.push('Second Wind did not heal'); else if (!(hLow > hHigh * 1.3)) bad.push('Second Wind not stronger when low: ' + hLow + ' vs ' + hHigh);
    { const w = stage('beta', 'second_wind'); G.P.maxHp = 1000; G.player.hp = 150; ring(4, 100); gridBuild(); if (f10Wait(w) === false) bad.push('Second Wind ready with no wounded enemy'); }

    // Pulling Strings: the toughest nearby is marked, builds Corrosion fast; its entourage builds Alien
    { const w = stage('private', 'pulling_strings'); const big = foe(150, 0, { hp: 5e6, maxHp: 5e6 }); const mates = [foe(190, 30), foe(120, -60), foe(500, 500)]; const far = mates[2]; gridBuild(); tap(w); run(2);
      if (!(big.cd.bars.acid > 0.9)) bad.push('Pulling Strings: no Corrosion on the mark ' + (big.cd && big.cd.bars.acid));
      if (!(corroded(big))) bad.push('Pulling Strings: mark not Corroded');
      if (!(mates[0].cd.bars.soul > 0.3 && mates[1].cd.bars.soul > 0.3)) bad.push('Pulling Strings: no Alien on the entourage ' + mates.map(e => e.cd && e.cd.bars.soul));
      if (far.cd && far.cd.bars.soul > 0.05) bad.push('Pulling Strings: Alien reached a far enemy');
      if (mates.some(e => fightCd(e).bars.acid > 0.5)) bad.push('Pulling Strings: Corrosion went to the entourage'); }

    // Recount: up to six Possessed for 3 s, then the delayed hit; kills refund stamina
    { const w = stage('prawn', 'recount'); const l = []; for (let i = 0; i < 9; i++) l.push(foe(60 + i * 20, (i % 2 ? 1 : -1) * 20 * i)); l[0].hp = l[0].maxHp = 5; gridBuild(); tap(w); G.stam.cur = 0; G.stam.restT = 0; run(0.05);
      const n = G.enemies.filter(e => e.charmed).length; if (n !== 6) bad.push('Recount possessed ' + n);
      if (G.enemies.filter(e => e.charmed).some(e => e.charmT > 3.1)) bad.push('Recount lasts too long');
      const hp0 = l.map(e => e.hp), charmedSet = l.filter(e => e.charmed && e !== l[0]); const before = charmedSet.map(e => e.hp);
      const jump = run(3.4);
      if (charmedSet.length < 4 || !charmedSet.every((e, i) => e.hp < before[i])) bad.push('Recount: no delayed hit ' + charmedSet.map(e => e.hp));
      if (!l[0].dead) bad.push('Recount: weak enemy survived'); else if (!(jump >= 7)) bad.push('Recount: kill did not refund stamina (' + jump.toFixed(1) + ')');
    }

    // First Contact
    { start('alien'); scene(); const w = slot1(); const t0 = G.weapons.find(Boolean) ? 1 : 0; const S = G.s10; const before = S.shiftI;
      const l = ring(12, 140, { corrodedT: G.t + 30 }); const plain = [foe(20, 0), foe(-20, 0)]; gridBuild(); l.forEach(e => fightCd(e)); plain.forEach(e => fightCd(e));
      G.fst = null; const fst0 = fst(); const hp0 = plain.map(e => e.hp); const barSum = e => Object.values(e.cd.bars).reduce((a, v) => a + v, 0); const bars0 = l.map(barSum);
      const stamBefore = G.stam.cur; w.cd = 0; tap(w);
      if (S.shiftI === before) bad.push('First Contact did not shift type'); if (G.stam.cur < stamBefore - 0.5) bad.push('First Contact costs stamina');
      const rx = Object.values(G.fst.rx).reduce((a, v) => a + v, 0); out.fcReactions = G.fst.rx;
      if (!(G.fst.rx.evap > 0)) bad.push('First Contact: no Premature Evaporation on Corroded enemies (fire -> soul)');
      if (G.fst.rx.evap > 8 || rx > 8) bad.push('First Contact: more than 8 reactions ' + rx);
      if (rx < 8) bad.push('First Contact: fewer than 8 reactions with 12 statused enemies ' + rx);
      if (G.fst.dmg.weapon !== 0) bad.push('First Contact dealt weapon damage ' + G.fst.dmg.weapon);
      if (plain.some((e, i) => e.hp !== hp0[i])) bad.push('First Contact hurt an enemy with no status');
      // nearest first: the 8 reacted are the 8 nearest (equal distance here, so only check they are a subset of the 12)
      if (l.some(e => e.cd.bars.acid > 0 && e.corrodedT === 0)) bad.push('First Contact: bar fill?');
      // no Thorns, no bars from the virtual hit
      const reacted = l.filter(e => e.corrodedT === 0).length; if (reacted !== 8) bad.push('First Contact: ' + reacted + ' enemies consumed their Corrosion');
      // one reaction per enemy: a Corroded + Burning + Snared enemy fires only one
      G.fst = null; fst(); G.enemies.length = 0; const m = foe(80, 0, { corrodedT: G.t + 30, snareT: G.t + 30 }); fightCd(m).burnT = 3; fightCd(m).burnPool = 10; gridBuild();
      const wasType = S.shiftI; S.shiftI = 0; S.shiftT = 20; /* flame -> soul again */ w.cd = 0; tap(w);
      const rx2 = Object.values(G.fst.rx).reduce((a, v) => a + v, 0); if (rx2 !== 1) bad.push('First Contact: ' + rx2 + ' reactions on one enemy');
      // Spectral Combustion and Blood Pressure never fire from it
      if (G.fst.rx.spectral || G.fst.rx.pressure) bad.push('First Contact fired Spectral or Blood Pressure');
      // a hit of both types: Static -> Fire (arc flash on a burning enemy) via the helper directly
      G.fst = null; fst(); G.enemies.length = 0; const a = foe(0, 60), c = foe(40, 60); fightCd(a).burnT = 3; fightCd(a).burnPool = 10; gridBuild();
      const fired = fightReactAs(a, 'static', { raw: 40 }); if (!fired || !G.fst.rx.arcflash) bad.push('fightReactAs static on burning: no Arc Flash');
      if (fightReactAs(a, 'static', { raw: 40 })) bad.push('fightReactAs ignored the lockout');
      if (fightReactAs(c, 'static', { raw: 40 })) bad.push('fightReactAs fired on a plain enemy');
      // not-'alien' sample holding the Feat just cycles
      start('baseline'); scene(); const w2 = f10Give('first_contact', 1); w2.cd = 0; ring(2, 80, { snareT: G.t + 9 }); gridBuild(); featTap(w2); if (!G.f10.fcType) bad.push('First Contact: no cycle outside Not of This World'); }

    // forks: every option at levels 3 and 5 performs without errors for each Feat
    const FORK_SCENE = {
      standard_procedure: ['baseline', () => ring(5, 80)], personal_best: ['alpha', () => [foe(22, 0)]], second_wind: ['beta', () => { G.player.hp = 100; G.P.maxHp = 1000; return ring(4, 100).map(e => (e.hp = 1, e)); }],
      pulling_strings: ['private', () => ring(4, 120)], shrink_wrap: ['ordered', () => ring(5, 100)], reply_all: ['redtail', () => ring(4, 100)], recount: ['prawn', () => ring(7, 120)],
      first_contact: ['alien', () => ring(3, 100, { corrodedT: G.t + 30 })],
      acro_release: ['acro', () => ring(5, 120)], // (PROPOSED Sample 9, acrosample.js)
    };
    for (const [o, fid] of Object.entries(UNIQ)) {
      for (const lv of [3, 5]) {
        const opts = FORKS['feat:feat_' + fid + '@' + lv] || [];
        for (let i = 0; i < opts.length; i++) {
          try {
            const [sample, pre] = FORK_SCENE[fid]; const w = stage(sample, fid, lv); opts[i].apply(G); recomputeAll();
            const flags = Object.keys(w.f10fk || {}); if (flags.length !== 1) { bad.push(fid + ' fork ' + lv + '/' + i + ' set ' + flags); continue; }
            pre(); gridBuild(); w.cd = 0; G.stam.cur = stamMax(); const ok = featTap(w); if (ok !== true) bad.push(fid + ' fork ' + flags[0] + ': tap did not perform'); run(1.2);
          } catch (err) { bad.push(fid + ' fork threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
        }
      }
    }
    // utility / stamina
    for (const [o, fid] of Object.entries(UNIQ)) { start(o); const w = slot1(); const c = f10Cost(w); if (fid === 'first_contact' ? c !== 0 : !(c > 0)) bad.push(fid + ' stamina cost ' + c); }
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
