// Weapon modifier no-op audit: for each matrix weapon, each Delivery it can hold (and no Delivery), and each other
// modifier the draft could offer on top, run a fixed arena (Lab Bench, 16 slow crawlers walking in from random distances,
// same seed; Same Type Bonus and Mark and Detonate get a partner weapon) with and without the modifier and compare what
// happened (damage, hits, statuses, reactions, shoves, mines/allies/marks, shots, hit sources). A modifier that changes
// nothing measurable is a NO-OP; one that only moves damage or hit counts is NUMBERS; the rest is VISIBLE.
// A second attack-type card (Melee, Ranged, Mines) is tried as the swap it is in the game (atkswap.js), not stacked.
// Blind spots: the arena has no walls (Bounce bounces off walls only) and one enemy kind (no elites, bosses or shooters).
// Every trial runs in a freshly loaded page (something in the game carries the previous trial's modifiers over; a fresh
// page keeps identical trials identical), several pages at a time.
// node sim/modaudit.js [--w v_flame_beam] [--mod charged] [--secs 20] [--rank 1] [--all] [--pages 6]   (--all: rank 3 too)
const { chromium } = require('playwright');
const A = process.argv.slice(2), arg = (k, d) => { const i = A.indexOf(k); return i >= 0 ? A[i + 1] : d; };
const ONLY_W = arg('--w', ''), ONLY_M = arg('--mod', ''), SECS = +arg('--secs', 20), RANKS = A.includes('--all') ? [1, 3] : [+arg('--rank', 1)], PAGES = +arg('--pages', 6);
(async () => {
  const b = await chromium.launch();
  const errors = [];
  const INDEX = 'file://' + require('path').resolve(__dirname, '../../web/index.html');
  const fresh = async page => { // a clean game: load the page, past the splash, the audit's hooks and helpers
    await page.goto(INDEX); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(150);
    await page.evaluate(() => {
      META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
      MATRIX_ONLY.force = true; // (what the shipped game offers, not every modifier)
      self.AUD = { m: null };
      hookOn('hit:late', 'audit', (e, d, src) => { const M = AUD.m; if (!M) return; M.dmg += d; if (src.dot) M.dot += d; else { M.hits++; if (src.elem && src.elem !== 'phys') M.typed++; } M.names.add(src.wname || (src.w && src.w.def && src.w.def.name) || src.elem || '?'); if (src.mult && src.mult !== 1) M.mult++; });
      hookOn('kill', 'audit', () => { if (AUD.m) AUD.m.kills++; });
      hookOn('fire', 'audit', () => { if (AUD.m) AUD.m.fires++; return false; }, -1);
      self.audSeed = s => { let t = s >>> 0; Math.random = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
      self.audTrial = (wid, mods, secs, seed, w2id) => { // w2id: a partner weapon (Same Type Bonus, Mark and Detonate need one)
        audSeed(seed);
        UI.sample = 's000'; SET.auto = false; newGame(); UI.show('hud'); if (G.state !== 'play') G.state = 'play';
        G.debug = null; // (the Lab Bench flag turns the range falloff system off, power11.js p11On, so Long Range and Close Range would never show; spawns are stopped below instead)
        const w = makeSlot(wid, false, 9); w.lvl = 9; w.m10 = mods.slice(); G.weapons = [w];
        if (w2id) { const w2 = makeSlot(w2id, false, 1); w2.m10 = []; G.weapons.push(w2); }
        G.spells = (G.spells || []).map(() => null); for (const x of G.weapons) computeStats(x); recomputeAll(); G.P.spawnMult = 0;
        const p = G.player, cx = p.x, cy = p.y, N = 16, slots = [];
        // Enemies walk in slowly from random distances (60 to 420); one that reaches you, or dies, comes back further out.
        const put = (i, far) => { const a = Math.random() * TAU, r = far ? 250 + Math.random() * 170 : 60 + Math.random() * 360, e = makeEnemy(ENEMIES.crawler, cx + Math.cos(a) * r, cy + Math.sin(a) * r); e.hp = e.maxHp = 400; e.speed *= 0.5; e.xp = 0; e._px = e.x; e._py = e.y; G.enemies.push(e); slots[i] = e; };
        for (let i = 0; i < N; i++) put(i, false);
        const M = AUD.m = { dmg: 0, dot: 0, hits: 0, typed: 0, kills: 0, fires: 0, mult: 0, names: new Set(), ents: 0, shoved: 0, pmoved: 0, proj: 0, status: 0 };
        const ent = () => { let n = 0; const a = G.mwS, l = G.lzS, m = G.m10; if (a) n += a.mines.length + a.allies.length + a.marks.length; if (l) n += l.orb.length + l.mines.length; if (m) n += m.wells.length + m.mines.length + m.lobs.length + m.pets.length; n += G.enemies.filter(e => e.charmed).length; return n; };
        const stat = e => (e.snareT > G.t ? 1 : 0) + (e.chargeT > G.t ? 1 : 0) + (e.bleeds ? e.bleeds.length : 0) + (e.chill > 0 ? e.chillAmt || 0.5 : 0) + (e.stunT > G.t ? 1 : 0) + (e.cd && e.cd.bars ? Object.values(e.cd.bars).reduce((a, b) => a + (b || 0), 0) : 0) + (e.v10burn > 0 ? 1 : 0) + (e.charmed ? 1 : 0);
        for (let f = 0; f < 30 * secs; f++) {
          update(1 / 30);
          if (typeof QUAL !== 'undefined') { QUAL.lv = 0; QUAL.slow = 0; } if (typeof FPS !== 'undefined') { FPS.v = 60; FPS.low = 60; } // (adaptive quality reads real frame times: pin it)
          M.pmoved += Math.hypot(p.x - cx, p.y - cy); p.x = cx; p.y = cy; p.vx = p.vy = 0; p.hp = G.P.maxHp; G.P.spawnMult = 0; G.lootQueue.length = 0;
          for (let i = 0; i < N; i++) {
            const e = slots[i];
            if (!e || e.dead || !G.enemies.includes(e)) { put(i, true); continue; }
            const mv = Math.hypot(e.x - e._px, e.y - e._py); M.shoved += Math.max(0, mv - e.speed / 30 * 1.1); e._px = e.x; e._py = e.y; // (movement beyond its own walking: shoves, pulls)
            if (Math.hypot(e.x - cx, e.y - cy) < 45) { e.dead = true; const k = G.enemies.indexOf(e); if (k >= 0) G.enemies.splice(k, 1); put(i, true); }
          }
          if (f % 3 === 0) { M.ents += ent(); M.proj += G.proj.filter(q => !q.dead).length; for (const e of G.enemies) if (!e.dead) M.status += stat(e); }
        }
        AUD.m = null;
        const S = G.fst || {}, rx = Object.values(S.rx || {}).reduce((a, b) => a + b, 0) + (S.stagger || 0) + (S.possess || 0) + (S.corrode || 0) + (S.ignite || 0);
        return { dmg: M.dmg, dot: M.dot, hits: M.hits, typed: M.typed, kills: M.kills, fires: M.fires, mult: M.mult, ents: M.ents, shoved: M.shoved, pmoved: M.pmoved, proj: M.proj, status: M.status, rx, names: [...M.names].sort() };
      };
      self.audPlan = (onlyW, onlyM) => { // weapons x bases (none + each Delivery that fits) x modifiers the draft could offer on top
        const plan = [];
        UI.sample = 's000'; SET.auto = false; newGame(); // (makeSlot needs a live G)
        for (const wid of MATRIX_ONLY.weapons) {
          if (onlyW && wid !== onlyW) continue;
          const w = makeSlot(wid, false, 9); w.lvl = 9; w.m10 = [];
          const dl = Object.keys(MODS10).filter(id => MM_GROUP[id] === 'delivery' && modOk(w, id));
          const ty = WEAPONS[wid].v10type || WEAPONS[wid].elem;
          const kin = MATRIX_ONLY.weapons.find(id => id !== wid && (WEAPONS[id].v10type || WEAPONS[id].elem) === ty && WEAPONS[id].v10atk !== WEAPONS[wid].v10atk) || MATRIX_ONLY.weapons.find(id => id !== wid && (WEAPONS[id].v10type || WEAPONS[id].elem) === ty) || null;
          const w2 = { kinship: kin, primer: wid === 'v_phys_proj' ? 'v_phys_spread' : 'v_phys_proj' }; // (a same-type partner; any partner)
          for (const base of [[], ...dl.map(d => [d])]) {
            w.m10 = base.slice();
            const ms = Object.keys(MODS10).filter(id => (!onlyM || id === onlyM) && !base.includes(id) && modOk(w, id));
            plan.push({ wid, name: WEAPONS[wid].name, atk: WEAPONS[wid].v10atk, base, mods: ms, w2 });
          }
        }
        return plan;
      };
    });
  };
  const pages = []; for (let i = 0; i < PAGES; i++) { const pg = await b.newPage({ viewport: { width: 400, height: 860 } }); pg.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); pages.push(pg); }
  const free = pages.slice(), waiters = [];
  const trial = async (wid, mods, secs, w2) => { // one trial on a fresh page, PAGES at a time
    const pg = free.length ? free.pop() : await new Promise(r => waiters.push(r));
    try { await fresh(pg); return await pg.evaluate(([wid, mods, secs, w2]) => audTrial(wid, mods, secs, 7, w2 || null), [wid, mods, secs, w2]); }
    finally { if (waiters.length) waiters.shift()(pg); else free.push(pg); }
  };
  const page = pages[0]; await fresh(page);
  const plan = await page.evaluate(([w, m]) => audPlan(w, m), [ONLY_W, ONLY_M]);
  const WNAME = await page.evaluate(() => Object.fromEntries(MATRIX_ONLY.weapons.map(id => [id, WEAPONS[id].name])));
  const SWAP = await page.evaluate(() => (typeof ATKSW !== 'undefined' ? ATKSW.ids : [])); // (atkswap.js: taking one of these swaps out the one held)
  const withMod = (base, m, rank) => [...(SWAP.includes(m) ? base.filter(x => !SWAP.includes(x)) : base), ...Array(rank).fill(m)];
  const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-9);
  const sgn = (a, b) => { const r = b ? Math.round(100 * (a - b) / b) : (a ? '+new' : 0); return typeof r === 'number' ? (r > 0 ? '+' : '') + r + '%' : r; };
  const classify = (o, b) => { // o: with the modifier, b: without
    const nd = rel(o.dmg, b.dmg), nh = rel(o.hits, b.hits), nt = rel(o.typed, b.typed), nk = rel(o.kills, b.kills), ne = rel(o.ents, b.ents), ns = rel(o.shoved, b.shoved), np = rel(o.proj, b.proj), nf = rel(o.fires, b.fires), nst = rel(o.status, b.status), nrx = rel(o.rx, b.rx);
    const newNames = o.names.filter(n => !b.names.includes(n));
    const seen = (o.ents !== b.ents && ne > 0.05) || (ns > 0.25 && Math.abs(o.shoved - b.shoved) > 200) || (o.pmoved - b.pmoved) > 30 || newNames.length || np > 0.2 || nf > 0.2 || Math.abs(o.mult - b.mult) > 3 || nst > 0.15 || (nrx > 0.25 && Math.abs(o.rx - b.rx) > 3);
    const num = nd > 0.08 || nh > 0.08 || nt > 0.08 || nk > 0.08;
    const why = `dmg${sgn(o.dmg, b.dmg)} hits${sgn(o.hits, b.hits)} typed${sgn(o.typed, b.typed)} status${sgn(o.status, b.status)} rx${sgn(o.rx, b.rx)} fires${sgn(o.fires, b.fires)} ents${sgn(o.ents, b.ents)} shoved${sgn(o.shoved, b.shoved)} proj${sgn(o.proj, b.proj)}${newNames.length ? ' new:' + newNames.join('/') : ''}`;
    return { cls: seen ? 'VISIBLE' : num ? 'NUMBERS' : 'NO-OP', why };
  };
  const tally = { 'NO-OP': [], NUMBERS: [], VISIBLE: [] }, byMod = {};
  let n = 0; const t0 = Date.now();
  for (const P of plan) {
    const tag = `${P.name} (${P.atk})${P.base.length ? ' +' + P.base.join('+') : ''}`;
    const lines = [];
    for (const rank of RANKS) {
      const bases = { '': trial(P.wid, P.base, SECS, '') }; // (one base per partner weapon)
      for (const m of P.mods) { const k = P.w2[m] || ''; if (!bases[k]) bases[k] = trial(P.wid, P.base, SECS, k); }
      const outs = await Promise.all(P.mods.map(m => (m === 'kinship' && !P.w2.kinship) ? null : trial(P.wid, withMod(P.base, m, rank), SECS, P.w2[m] || '')));
      const base = await bases[''];
      if (!base.fires && !base.hits) lines.push(`  !! base itself does nothing (fires ${base.fires}, hits ${base.hits})`);
      for (let i = 0; i < P.mods.length; i++) {
        const m = P.mods[i];
        if (!outs[i]) { lines.push(`  SKIP    ${m}: no other weapon of this type to partner`); continue; }
        const c = classify(outs[i], await bases[P.w2[m] || '']); n++;
        const key = `${P.name}${P.base.length ? ' +' + P.base.join('+') : ''} +${m}${rank > 1 ? ' r' + rank : ''}`;
        tally[c.cls].push(key); (byMod[m] = byMod[m] || { 'NO-OP': 0, NUMBERS: 0, VISIBLE: 0 })[c.cls]++;
        if (c.cls !== 'VISIBLE') lines.push(`  ${c.cls.padEnd(7)} ${m}${rank > 1 ? ' r' + rank : ''}${P.w2[m] ? ' (with ' + WNAME[P.w2[m]] + ')' : ''}: ${c.why}`);
      }
    }
    console.log(tag + (lines.length ? '\n' + lines.join('\n') : '  (all visible)'));
  }
  console.log(`\n== ${n} combos in ${Math.round((Date.now() - t0) / 1000)} s: NO-OP ${tally['NO-OP'].length}, NUMBERS ${tally.NUMBERS.length}, VISIBLE ${tally.VISIBLE.length}`);
  console.log('== by modifier (no-op / numbers / visible):'); for (const m of Object.keys(byMod).sort((a, b) => byMod[b]['NO-OP'] - byMod[a]['NO-OP'])) { const t = byMod[m]; console.log(`  ${m.padEnd(11)} ${t['NO-OP']} / ${t.NUMBERS} / ${t.VISIBLE}`); }
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 6) : 'none'); await b.close();
})();
