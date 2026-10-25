// Weapon modifier no-op audit: for each matrix weapon, each Delivery it can hold (and no Delivery), and each other
// modifier the draft could offer on top, run a fixed arena (Lab Bench, 14 stationary crawlers in a ring, same seed) with
// and without the modifier and compare what happened. A modifier that changes nothing measurable is a NO-OP; one that
// only moves damage or hit counts (no new entities, no displacement, no new hit sources) is NUMBERS; the rest is VISIBLE.
// Every trial runs in a freshly loaded page (something in the game carries the previous trial's modifiers over; the
// per-trial page keeps trials identical for identical inputs), four pages at a time.
// node sim/modaudit.js [--w v_flame_beam] [--mod charged] [--secs 20] [--rank 1] [--all] [--pages 4]   (--all: rank 3 too)
const { chromium } = require('playwright');
const A = process.argv.slice(2), arg = (k, d) => { const i = A.indexOf(k); return i >= 0 ? A[i + 1] : d; };
const ONLY_W = arg('--w', ''), ONLY_M = arg('--mod', ''), SECS = +arg('--secs', 20), RANKS = A.includes('--all') ? [1, 3] : [+arg('--rank', 1)], PAGES = +arg('--pages', 4);
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
      self.audTrial = (wid, mods, secs, seed) => {
        audSeed(seed);
        if (!AUD.meta) AUD.meta = JSON.stringify(META); else { for (const k in META) delete META[k]; Object.assign(META, JSON.parse(AUD.meta)); } // (one-off achievements and profile tallies leak between trials: restore)
        if (typeof uidSeq !== 'undefined') uidSeq = 1000;
        UI.sample = 's000'; SET.auto = false; newGame(); UI.show('hud'); if (G.state !== 'play') G.state = 'play';
        const w = makeSlot(wid, false, 9); w.lvl = 9; w.m10 = mods.slice(); G.weapons = [w]; G.spells = (G.spells || []).map(() => null); computeStats(w); recomputeAll();
        const p = G.player, cx = p.x, cy = p.y, R = [70, 120, 180, 250, 320, 400, 480], N = 14, slots = [];
        const put = i => { const a = i / N * TAU, r = R[i % R.length], e = makeEnemy(ENEMIES.crawler, cx + Math.cos(a) * r, cy + Math.sin(a) * r); e.hp = e.maxHp = 400; e.speed = 0; e.xp = 0; e.x0 = e.x; e.y0 = e.y; G.enemies.push(e); slots[i] = e; };
        for (let i = 0; i < N; i++) put(i);
        const M = AUD.m = { dmg: 0, dot: 0, hits: 0, typed: 0, kills: 0, fires: 0, mult: 0, names: new Set(), ents: 0, disp: 0, pmoved: 0, proj: 0 };
        const ent = () => { let n = 0; const a = G.mwS, l = G.lzS, m = G.m10; if (a) n += a.mines.length + a.allies.length + a.marks.length; if (l) n += l.orb.length + l.mines.length; if (m) n += m.wells.length + m.mines.length + m.lobs.length + m.pets.length; n += G.enemies.filter(e => e.charmed).length; return n; };
        for (let f = 0; f < 30 * secs; f++) {
          update(1 / 30);
          if (typeof QUAL !== 'undefined') { QUAL.lv = 0; QUAL.slow = 0; } if (typeof FPS !== 'undefined') { FPS.v = 60; FPS.low = 60; } // (adaptive quality reads real frame times: pin it, or trials differ run to run)
          M.pmoved += Math.hypot(p.x - cx, p.y - cy); p.x = cx; p.y = cy; p.vx = p.vy = 0; p.hp = G.P.maxHp;
          for (let i = 0; i < N; i++) { const e = slots[i]; if (!e || e.dead || !G.enemies.includes(e)) put(i); }
          if (f % 3 === 0) { M.ents += ent(); M.proj += G.proj.filter(q => !q.dead).length; for (const e of slots) M.disp += Math.hypot(e.x - e.x0, e.y - e.y0); }
        }
        AUD.m = null;
        return { dmg: M.dmg, dot: M.dot, hits: M.hits, typed: M.typed, kills: M.kills, fires: M.fires, mult: M.mult, ents: M.ents, disp: M.disp, pmoved: M.pmoved, proj: M.proj, names: [...M.names].sort() };
      };
      self.audPlan = (onlyW, onlyM) => { // weapons x bases (none + each Delivery that fits) x modifiers the draft could offer on top
        const plan = [];
        UI.sample = 's000'; SET.auto = false; newGame(); // (makeSlot needs a live G)
        for (const wid of MATRIX_ONLY.weapons) {
          if (onlyW && wid !== onlyW) continue;
          const w = makeSlot(wid, false, 9); w.lvl = 9; w.m10 = [];
          const dl = Object.keys(MODS10).filter(id => MM_GROUP[id] === 'delivery' && modOk(w, id));
          for (const base of [[], ...dl.map(d => [d])]) {
            w.m10 = base.slice();
            const ms = Object.keys(MODS10).filter(id => (!onlyM || id === onlyM) && !base.includes(id) && modOk(w, id));
            plan.push({ wid, name: WEAPONS[wid].name, atk: WEAPONS[wid].v10atk, base, mods: ms });
          }
        }
        return plan;
      };
    });
  };
  const pages = []; for (let i = 0; i < PAGES; i++) { const pg = await b.newPage({ viewport: { width: 400, height: 860 } }); pg.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1])); pages.push(pg); }
  const free = pages.slice(), waiters = [];
  const trial = async (wid, mods, secs) => { // one trial on a fresh page, PAGES at a time
    const pg = free.length ? free.pop() : await new Promise(r => waiters.push(r));
    try { await fresh(pg); return await pg.evaluate(([wid, mods, secs]) => audTrial(wid, mods, secs, 7), [wid, mods, secs]); }
    finally { if (waiters.length) waiters.shift()(pg); else free.push(pg); }
  };
  const page = pages[0]; await fresh(page);
  const plan = await page.evaluate(([w, m]) => audPlan(w, m), [ONLY_W, ONLY_M]);
  const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-9);
  const classify = (o, b) => { // o: with the modifier, b: without
    const nd = rel(o.dmg, b.dmg), nh = rel(o.hits, b.hits), nt = rel(o.typed, b.typed), nk = rel(o.kills, b.kills), ne = rel(o.ents, b.ents), ns = rel(o.disp, b.disp), np = rel(o.proj, b.proj), nf = rel(o.fires, b.fires);
    const newNames = o.names.filter(n => !b.names.includes(n));
    const seen = (o.ents !== b.ents && ne > 0.05) || ns > 0.15 || (o.pmoved - b.pmoved) > 30 || newNames.length || np > 0.2 || nf > 0.2 || Math.abs(o.mult - b.mult) > 3;
    const num = nd > 0.08 || nh > 0.08 || nt > 0.08 || nk > 0.08;
    const why = `dmg${sgn(o.dmg, b.dmg)} hits${sgn(o.hits, b.hits)} typed${sgn(o.typed, b.typed)} fires${sgn(o.fires, b.fires)} ents${sgn(o.ents, b.ents)} disp${sgn(o.disp, b.disp)} proj${sgn(o.proj, b.proj)}${newNames.length ? ' new:' + newNames.join('/') : ''}`;
    return { cls: seen ? 'VISIBLE' : num ? 'NUMBERS' : 'NO-OP', why };
  };
  const sgn = (a, b) => { const r = b ? Math.round(100 * (a - b) / b) : (a ? '+new' : 0); return typeof r === 'number' ? (r > 0 ? '+' : '') + r + '%' : r; };
  const tally = { 'NO-OP': [], NUMBERS: [], VISIBLE: [] }, byMod = {};
  let n = 0; const t0 = Date.now();
  for (const P of plan) {
    const tag = `${P.name} (${P.atk})${P.base.length ? ' +' + P.base.join('+') : ''}`;
    const lines = [];
    for (const rank of RANKS) {
      const jobs = [trial(P.wid, P.base, SECS), ...P.mods.map(m => trial(P.wid, [...P.base, ...Array(rank).fill(m)], SECS))];
      const [base, ...outs] = await Promise.all(jobs);
      if (!base.fires && !base.hits) lines.push(`  !! base itself does nothing (fires ${base.fires}, hits ${base.hits})`);
      P.mods.forEach((m, i) => {
        const c = classify(outs[i], base); n++;
        const key = `${P.name}${P.base.length ? ' +' + P.base.join('+') : ''} +${m}${rank > 1 ? ' r' + rank : ''}`;
        tally[c.cls].push(key); (byMod[m] = byMod[m] || { 'NO-OP': 0, NUMBERS: 0, VISIBLE: 0 })[c.cls]++;
        if (c.cls !== 'VISIBLE') lines.push(`  ${c.cls.padEnd(7)} ${m}${rank > 1 ? ' r' + rank : ''}: ${c.why}`);
      });
    }
    console.log(tag + (lines.length ? '\n' + lines.join('\n') : '  (all visible)'));
  }
  console.log(`\n== ${n} combos in ${Math.round((Date.now() - t0) / 1000)} s: NO-OP ${tally['NO-OP'].length}, NUMBERS ${tally.NUMBERS.length}, VISIBLE ${tally.VISIBLE.length}`);
  console.log('== by modifier (no-op / numbers / visible):'); for (const m of Object.keys(byMod).sort((a, b) => byMod[b]['NO-OP'] - byMod[a]['NO-OP'])) { const t = byMod[m]; console.log(`  ${m.padEnd(11)} ${t['NO-OP']} / ${t.NUMBERS} / ${t.VISIBLE}`); }
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 6) : 'none'); await b.close();
})();
