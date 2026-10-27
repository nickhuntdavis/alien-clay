// Builds web/js/wstars.js: the four weapon card bars (POWER, FIRE RATE, REACH, CROWDS) for every matrix weapon,
// measured in a fixed arena (Lab Bench, the weapon at Lv 1 with no modifiers, immortal enemies, same seed) and ranked
// against each other into 1 to 5 (fifths of the field).
//  - REACH: one still enemy steps in from 640 towards you; the farthest distance it was hurt at.
//  - POWER: damage a second to one still enemy at 60% of that reach.
//  - FIRE RATE: attacks a second from the weapon's own numbers (magazine, delay between shots, reload).
//  - CROWDS: damage a second to a pack of 10 around that same spot.
//  A weapon that cannot touch a still enemy (mines, some contact weapons) is measured against enemies walking in from
//  260 (40 a second, back to the start on reaching you) instead, for all three trials.
//  Damage that is not the weapon's (the Lab Bench perks) is taken off: a run with no weapon at all is subtracted by source.
// Each trial runs in a fresh page (as modaudit.js: the game carries state between runs).
// node tools/wstars.js [--secs 20] [--pages 6] [--print]   (--print: show the raw numbers, write nothing)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const A = process.argv.slice(2), arg = (k, d) => { const i = A.indexOf(k); return i >= 0 ? A[i + 1] : d; };
const SECS = +arg('--secs', 20), PAGES = +arg('--pages', 6), PRINT = A.includes('--print');
const INDEX = 'file://' + path.resolve(__dirname, '../../web/index.html');
(async () => {
  const b = await chromium.launch(), errors = [];
  const fresh = async page => {
    await page.goto(INDEX); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(120);
    await page.evaluate(() => {
      META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
      self.WS = { m: null };
      hookOn('hit:late', 'wstars', (e, d, src) => {
        const M = WS.m; if (!M || !e.wsOn) return;
        const k = (src && (src.wname || (src.w && src.w.def && src.w.def.name))) || (src && src.dot ? 'dot' : '?');
        M.by[k] = (M.by[k] || 0) + d;
        M.far[k] = Math.max(M.far[k] || 0, Math.round(Math.hypot(e.x - G.player.x, e.y - G.player.y)));
      });
      self.wsSeed = s => { let t = s >>> 0; Math.random = () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };
      // spots: [[dx, dy]] where the enemies stand; steps: { d: [...], every } moves the first one in (reach trial);
      // walk: they walk in from their spot and start again on reaching you.
      self.wsTrial = (wid, spots, secs, o) => {
        o = o || {}; wsSeed(7);
        UI.sample = 's000'; SET.auto = false; newGame(); UI.show('hud'); if (G.state !== 'play') G.state = 'play';
        G.debug = null;
        const w = wid ? makeSlot(wid, false, 1) : null; if (w) w.m10 = []; G.weapons = w ? [w] : [];
        G.spells = (G.spells || []).map(() => null); if (w) computeStats(w); recomputeAll(); G.P.spawnMult = 0;
        const p = G.player, cx = p.x, cy = p.y;
        G.enemies.length = 0;
        const es = spots.map(([dx, dy]) => { const e = makeEnemy(ENEMIES.crawler, cx + dx, cy + dy); e.hp = e.maxHp = 1e9; e.speed = 0; e.xp = 0; e.wsOn = 1; G.enemies.push(e); return e; });
        const M = WS.m = { by: {}, far: {} };
        for (let f = 0; f < 30 * secs; f++) {
          if (o.steps) { const k = Math.floor(f / (30 * o.steps.every)); if (k >= o.steps.d.length) break; spots[0] = [o.steps.d[k], 0]; }
          update(1 / 30);
          if (typeof QUAL !== 'undefined') { QUAL.lv = 0; QUAL.slow = 0; } if (typeof FPS !== 'undefined') { FPS.v = 60; FPS.low = 60; }
          p.x = cx; p.y = cy; p.vx = p.vy = 0; p.hp = G.P.maxHp; G.P.spawnMult = 0; G.lootQueue.length = 0;
          es.forEach((e, i) => {
            let [dx, dy] = spots[i];
            if (o.walk) { const L = Math.hypot(dx, dy), k = 1 - ((f / 30 * 40 + i * 37) % (L - 20)) / L; dx *= k; dy *= k; }
            e.x = cx + dx; e.y = cy + dy; e.vx = e.vy = 0; e.hp = e.maxHp; e.dead = false; if (!G.enemies.includes(e)) G.enemies.push(e);
          });
          G.enemies = G.enemies.filter(e => e.wsOn);
        }
        WS.m = null;
        const s = w ? w.s : {};
        return { by: M.by, far: M.far, name: w ? w.def.name : '', rate: s.cd ? (s.mag || 1) / ((s.mag || 1) * s.cd + (s.reload || 0)) : 0 };
      };
    });
  };
  const page0 = await b.newPage(); await fresh(page0);
  const ids = await page0.evaluate(() => MATRIX_ONLY.weapons.filter(i => WEAPONS[i]));
  const D = [640, 520, 420, 340, 300, 260, 230, 190, 155, 125, 100, 80, 60, 45, 32];
  const pack = d => { const a = []; for (let i = 0; i < 10; i++) { const t = i * 2.39996, r = 18 + 55 * Math.sqrt(i / 10); a.push([d + Math.cos(t) * r, Math.sin(t) * r]); } return a; };
  // What the arena hurts with no weapon (perks): taken off every trial, source by source.
  const base = {};
  for (const [k, spots, o] of [['reach', [[D[0], 0]], { steps: { d: D, every: 1.5 } }], ['one', [[120, 0]], {}], ['walk', [[260, 0]], { walk: 1 }]]) {
    await fresh(page0); base[k] = (await page0.evaluate(([s, o, secs]) => wsTrial(null, s, secs, o), [spots, o, o.steps ? 999 : SECS])).by;
  }
  await page0.close();
  const own = (r, b) => { let n = 0; for (const k in r.by) if (!(k in (b || {}))) n += r.by[k]; return n; };
  const ownFar = (r, b) => Math.max(0, ...Object.keys(r.far).filter(k => !(k in (b || {}))).map(k => r.far[k]));
  const out = {}; for (const id of ids) out[id] = { id };
  const run = async (job, page) => {
    await fresh(page);
    const o = out[job.id], ev = (spots, opt) => page.evaluate(([id, s, opt, secs]) => wsTrial(id, s, secs, opt), [job.id, spots, opt, opt.steps ? 999 : SECS]);
    if (job.kind === 'reach') { const r = await ev([[D[0], 0]], { steps: { d: D, every: 1.5 } }); o.reach = ownFar(r, base.reach); o.rate = r.rate; o.name = r.name; return; }
    if (job.kind === 'walk') { const r = await ev([[260, 0]], { walk: 1 }); o.walk = 1; o.reach = ownFar(r, base.walk); o.power = own(r, base.walk) / SECS; const p = await (async () => { await fresh(page); return ev(pack(260), { walk: 1 }); })(); o.crowd = own(p, base.walk) / SECS; return; }
    const d = Math.max(30, Math.min(0.6 * o.reach, o.reach - 15));
    if (job.kind === 'one') { o.power = own(await ev([[d, 0]], {}), base.one) / SECS; return; }
    o.crowd = own(await ev(pack(d), {}), base.one) / SECS;
  };
  const pool = async list => {
    let i = 0;
    await Promise.all(Array.from({ length: PAGES }, async () => {
      const page = await b.newPage(); page.on('pageerror', e => errors.push(e.message));
      while (i < list.length) { const j = list[i++]; await run(j, page); }
      await page.close();
    }));
  };
  await pool(ids.map(id => ({ id, kind: 'reach' })));
  await pool(ids.filter(id => out[id].reach > 0).flatMap(id => [{ id, kind: 'one' }, { id, kind: 'pack' }]));
  await pool(ids.filter(id => !(out[id].reach > 0) || !(out[id].power > 0)).map(id => ({ id, kind: 'walk' })));
  await b.close();
  const keys = ['power', 'rate', 'reach', 'crowd'], rows = ids.map(id => out[id]);
  for (const k of keys) { // fifths of the field; equal values share the top bar of their group
    const q = x => k === 'reach' ? Math.round((x || 0) / 20) * 20 : x || 0; // (reach: within 20 is the same reach)
    const vals = rows.map(r => q(r[k])).sort((a, b) => a - b);
    for (const r of rows) { const v = q(r[k]), hi = vals.lastIndexOf(v); r['s_' + k] = Math.min(5, 1 + Math.floor(hi * 5 / vals.length)); }
  }
  if (PRINT || errors.length) {
    console.log('perks taken off:', JSON.stringify(base));
    for (const r of rows) console.log((r.name || r.id).padEnd(20), keys.map(k => `${k} ${(+(r[k] || 0)).toFixed(1)} [${r['s_' + k]}]`).join('  '), r.walk ? '(walking)' : '');
    if (errors.length) { console.log('ERRORS', errors.slice(0, 5)); process.exit(1); }
    if (PRINT) return;
  }
  const tbl = rows.map(r => `  ${r.id}: [${keys.map(k => r['s_' + k]).join(', ')}], // ${r.name}: ${Math.round(r.power)} dps, ${r.rate.toFixed(1)}/s, reach ${r.reach}, ${Math.round(r.crowd)} dps into 10${r.walk ? ' (walking enemies)' : ''}`).join('\n');
  fs.writeFileSync(path.resolve(__dirname, '../../web/js/wstars.js'), `'use strict';
// Spawn Prawn - the weapon card bars (POWER, FIRE RATE, REACH, CROWDS), measured, not guessed. GENERATED by
// tests/tools/wstars.js (rerun it after a balance change): each matrix weapon at Lv 1 with no modifiers in a fixed arena,
// ranked against the others in fifths (1 to 5). Reach: the farthest a stepping-in enemy is hurt. Power: damage a second
// to one enemy at 60% of that. Fire rate: attacks a second (magazine, delay, reload). Crowds: damage a second to a pack
// of 10 at the same spot. Weapons that cannot hit a still enemy (mines) are measured against enemies walking in.
// Hooks: none. Sets WEAPONS[id].stars (read by ui.js weapon details and the Weapon Draft). Loads after the weapon tables.

const WSTARS = {
${tbl}
};
for (const id in WSTARS) if (typeof WEAPONS !== 'undefined' && WEAPONS[id]) WEAPONS[id].stars = WSTARS[id];
`);
  console.log('wrote web/js/wstars.js,', rows.length, 'weapons');
})();
