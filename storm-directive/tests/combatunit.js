'use strict';
// Pure unit tests for web/js/combat.js (matrix 11.1 to 11.5, 12.1, 13). No browser: node tests/combatunit.js
const assert = require('assert');
const { COMBAT, makeDefence, resolveHit, tickDefence, burnAdd } = require('../web/js/combat.js');

let n = 0;
const T = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL ' + name + '\n' + e.stack); process.exit(1); } };
const near = (a, b, m) => assert(Math.abs(a - b) < 1e-9, (m || '') + ' expected ' + b + ' got ' + a);
const hit = (t, type, amt, o) => { o = o || {};
  return resolveHit(t, { atk: o.atk || 'proj', comps: o.comps || [{ type, amt }], crit: !!o.crit, echo: !!o.echo }, () => (o.rng == null ? 0.99 : o.rng)); };
const D = (def, rank, opts) => makeDefence(100, def, rank, opts);
const TYPES = ['force', 'acid', 'static', 'fire'];

T('makeDefence starting values', () => {
  const m = D('membrane'); near(m.mem, 50); near(m.memMax, 50);
  const s = D('shell'); assert.equal(s.layers, 1); near(s.layerHp, 15);
  assert.equal(D('shell', 'boss', { layers: 6 }).layers, 6);
  near(D('evasion').evasion, 0.35); near(D('evasion', 'normal', { evasion: 0.9 }).evasion, 0.5);
  assert.equal(D(null).def, null);
});

// Squishy
T('squishy cuts Force by 35%, nothing else', () => {
  near(hit(D('squishy'), 'force', 20).toHp, 13);
  for (const k of ['acid', 'static', 'fire', 'blood', 'soul', 'mucus']) near(hit(D('squishy'), k, 20).toHp, 20, k);
});
T('squishy cuts only the Force part of a mixed hit', () => {
  near(hit(D('squishy'), null, 0, { comps: [{ type: 'force', amt: 10 }, { type: 'blood', amt: 10 }] }).toHp, 16.5);
});

// Membrane
T('membrane: Force costs 2 per point', () => {
  const t = D('membrane'), r = hit(t, 'force', 20);
  near(r.toMem, 20); near(t.mem, 10); near(r.toHp, 0); near(t.hp, 100);
});
T('membrane: acid, static, fire cost 1 per point', () => {
  for (const k of ['acid', 'static', 'fire']) { const t = D('membrane'), r = hit(t, k, 20); near(t.mem, k === 'static' ? 42.5 : 30, k); near(r.toHp, 0, k); }
});
T('membrane: overflow reaches health', () => {
  const t = D('membrane'), r = hit(t, 'force', 30);
  near(t.mem, 0); near(r.toMem, 25); near(r.toHp, 5); assert(r.statusOk);
  near(hit(D('membrane'), 'acid', 70).toHp, 20);
});
T('membrane: fully absorbed hit has statusOk false, no bars, no payoffs', () => {
  const t = D('membrane'), r = hit(t, 'fire', 40);
  assert.equal(r.statusOk, false); assert.deepEqual(r.payoffs, []); near(t.bars.fire, 0);
});
T('membrane: partly absorbed hit fills bars from full raw damage', () => {
  const t = D('membrane'), r = hit(t, 'fire', 60);
  assert(r.statusOk); assert.deepEqual(r.payoffs, ['ignite']);
});
T('membrane recharge timing', () => {
  const t = D('membrane'); hit(t, 'acid', 50); near(t.mem, 0);
  tickDefence(t, 1.9); near(t.mem, 0);
  tickDefence(t, 0.1); near(t.mem, 0, 'delay');
  tickDefence(t, 1); near(t.mem, 25, 'half way');
  tickDefence(t, 1); near(t.mem, 50, 'full in 2 s');
  tickDefence(t, 5); near(t.mem, 50, 'capped');
});
T('membrane damage resets the recharge delay', () => {
  const t = D('membrane'); hit(t, 'acid', 49); tickDefence(t, 1.5); hit(t, 'acid', 1); near(t.mem, 0);
  tickDefence(t, 1.5); near(t.mem, 0); tickDefence(t, 1.5); near(t.mem, 25);
});
T('membrane recharge handles a dt that straddles the delay', () => {
  const t = D('membrane'); hit(t, 'acid', 50); tickDefence(t, 3); near(t.mem, 25);
});
T('static recharges Membrane +25% once per 5 s', () => {
  const t = D('membrane'); hit(t, 'acid', 40); near(t.mem, 10);
  let r = hit(t, 'static', 1); assert(r.staticRecharge); near(t.mem, 10 - 1 + 12.5);
  r = hit(t, 'static', 1); assert(!r.staticRecharge); near(t.mem, 20.5, 'no second recharge');
  tickDefence(t, 4.9); r = hit(t, 'static', 1); assert(!r.staticRecharge);
  tickDefence(t, 0.2); r = hit(t, 'static', 1); assert(r.staticRecharge);
});
T('static recharge caps at capacity; other types do not recharge', () => {
  const t = D('membrane'); hit(t, 'static', 1); near(t.mem, 50);
  const u = D('membrane'); assert(!hit(u, 'acid', 10).staticRecharge);
});

// Shell
T('shell: 3 off per layer, all four types', () => {
  for (const k of TYPES) { const t = D('shell'), r = hit(t, k, 10); near(r.toHp, 7, k); near(r.toShell, 3, k); near(t.layerHp, 12, k); }
  near(hit(D('shell', 'normal', { layers: 2 }), 'static', 10).toHp, 4);
});
T('shell: floor of 1 damage', () => {
  near(hit(D('shell'), 'static', 2).toHp, 1); near(hit(D('shell'), 'static', 1).toHp, 1);
  near(hit(D('shell', 'normal', { layers: 4 }), 'acid', 5).toHp, 1);
  near(hit(D('shell'), 'static', 1).toShell, 0);
});
T('shell: outer layer wears by the damage blocked, then breaks', () => {
  const t = D('shell'); let lost = 0;
  for (let i = 0; i < 5; i++) lost += hit(t, 'static', 4).layersLost;
  assert.equal(lost, 1); assert.equal(t.layers, 0);
});
T('shell: next layer starts full and excess wear does not carry', () => {
  const t = D('shell', 'normal', { layers: 2 }); t.layerHp = 1;
  const r = hit(t, 'static', 10); assert.equal(r.layersLost, 1); assert.equal(t.layers, 1); near(t.layerHp, 15);
});
T('shell: heavy Force removes one layer outright, in addition to wear', () => {
  const t = D('shell', 'normal', { layers: 3 }), r = hit(t, 'force', 15);
  assert(r.heavy); assert.equal(r.layersLost, 1); assert.equal(t.layers, 2); near(r.toHp, 6);
  assert(!hit(D('shell', 'normal', { layers: 3 }), 'force', 14).heavy);
});
T('heavy thresholds: normal 15%, elite 10%, boss 5%', () => {
  for (const [rank, thr] of [['normal', 15], ['elite', 10], ['boss', 5]]) {
    const r = hit(D('shell', rank, { layers: 3 }), 'force', thr);
    assert(r.heavy && r.layersLost === 1, rank); assert(!hit(D('shell', rank, { layers: 3 }), 'force', thr - 0.5).heavy, rank);
  }
});
T('heavy needs Force: acid at threshold is not heavy', () => { assert(!hit(D('shell'), 'acid', 50).heavy); });

// Evasion
T('evasion: miss means no damage, no bars, no Thorns, statusOk false', () => {
  for (const atk of ['contact', 'proj', 'spread']) {
    const t = D('evasion'), r = hit(t, 'fire', 40, { atk, rng: 0.1 });
    assert(r.miss && !r.statusOk && r.toHp === 0 && r.thorns === 0, atk); near(t.hp, 100); near(t.bars.fire, 0);
  }
});
T('evasion: rng at or above chance hits', () => { assert(!hit(D('evasion'), 'force', 5, { atk: 'contact', rng: 0.35 }).miss); });
T('evasion never applies to burst, beam, pool', () => {
  for (const atk of ['burst', 'beam', 'pool']) { const t = D('evasion'), r = hit(t, 'acid', 10, { atk, rng: 0 }); assert(!r.miss, atk); near(r.toHp, 10); }
});
T('evasion: spread rolls per pellet', () => {
  const t = D('evasion'), seq = [0.1, 0.9, 0.1, 0.9]; let i = 0, hits = 0;
  for (let p = 0; p < 4; p++) if (!resolveHit(t, { atk: 'spread', comps: [{ type: 'force', amt: 2 }] }, () => seq[i++]).miss) hits++;
  assert.equal(hits, 2); near(t.hp, 96);
});
T('evasion does not reduce damage when it hits', () => { near(hit(D('evasion'), 'force', 20).toHp, 20); });

// Thorns
T('thorns: contact only, 5 + 35% of the hit, once', () => {
  const r = hit(D('thorns'), 'force', 20, { atk: 'contact' });
  near(r.thorns, 12); near(r.toHp, 20);
  for (const atk of ['proj', 'spread', 'burst', 'beam', 'pool']) near(hit(D('thorns'), 'force', 20, { atk }).thorns, 0, atk);
  near(hit(D('thorns'), null, 0, { atk: 'contact', comps: [{ type: 'force', amt: 10 }, { type: 'acid', amt: 10 }] }).thorns, 12, 'once per attack');
});
T('thorns: only on the thorns defence; thornsK scales', () => {
  near(hit(D('squishy'), 'force', 20, { atk: 'contact' }).thorns, 0);
  near(hit(D('thorns', 'normal', { thornsK: 2 }), 'force', 20, { atk: 'contact' }).thorns, 24);
});

// Crit and bars
T('crit multiplies what is left (x1.6)', () => {
  near(hit(D('shell'), 'static', 10, { crit: true }).toHp, 7 * 1.6);
  near(hit(D(null), 'acid', 10, { crit: true }).toHp, 16);
});
T('crit fills bars and judges heavy from pre-crit damage only', () => {
  const f = D(null); hit(f, 'force', 10, { crit: true }); near(f.bars.force, 10 / 30); // not x1.6
  const b = D(null); hit(b, 'fire', 10, { crit: true }); near(b.bars.fire, 0.25);
  const s = D('shell', 'normal', { layers: 2 }); assert(!hit(s, 'force', 14, { crit: true }).heavy); assert.equal(s.layers, 2); // 14 x1.6 > 15, but raw 14 < 15
  const h = D('shell', 'normal', { layers: 2 }); const r = hit(h, 'force', 15, { crit: true }); assert(r.heavy && r.crit); assert.equal(h.layers, 1);
});
T('bars: Burn 0.4, Poise 0.3, Soul 0.6; payoff and reset', () => {
  let t = D(null), r = hit(t, 'fire', 20); near(t.bars.fire, 0.5); assert.deepEqual(r.payoffs, []);
  r = hit(t, 'fire', 20); assert.deepEqual(r.payoffs, ['ignite']); near(t.bars.fire, 0);
  t = D(null); r = hit(t, 'force', 30); assert.deepEqual(r.payoffs, ['stagger']); near(t.bars.force, 0);
  t = D(null); r = hit(t, 'soul', 60); assert.deepEqual(r.payoffs, ['possess']); near(t.bars.soul, 0);
  t = D(null); hit(t, 'soul', 30); near(t.bars.soul, 0.5);
});
T('static and mucus fill no bar', () => {
  const t = D(null); hit(t, 'static', 50); hit(t, 'mucus', 50);
  assert.deepEqual(Object.values(t.bars), [0, 0, 0, 0]);
});
T('corrosion on Shell: bar is 0.25 per layer; full strips a layer', () => {
  let t = D('shell'), r = hit(t, 'acid', 25);
  assert.deepEqual(r.payoffs, ['strip']); assert.equal(t.layers, 0); near(t.bars.acid, 0);
  t = D('shell', 'normal', { layers: 2 }); r = hit(t, 'acid', 25);
  near(t.bars.acid, 0.5); assert.deepEqual(r.payoffs, []);
  r = hit(t, 'acid', 25); assert.deepEqual(r.payoffs, ['strip']); assert.equal(t.layers, 1); near(t.bars.acid, 0);
});
T('corrosion strip removes one layer on top of wear', () => {
  const t = D('shell', 'normal', { layers: 3 }); t.bars.acid = 0.9; const r = hit(t, 'acid', 10);
  assert.deepEqual(r.payoffs, ['strip']); assert.equal(t.layers, 2); assert.equal(r.layersLost, 1);
});
T('corrosion with no Shell: sized as one layer, payoff corrode, resets', () => {
  const t = D(null); let r = hit(t, 'acid', 12.5); near(t.bars.acid, 0.5); assert.deepEqual(r.payoffs, []);
  r = hit(t, 'acid', 12.5); assert.deepEqual(r.payoffs, ['corrode']); near(t.bars.acid, 0); assert.equal(COMBAT.corrodedT, 4);
  const u = D('shell'); u.layers = 0; u.layerHp = 0;
  assert.deepEqual(hit(u, 'acid', 25).payoffs, ['corrode'], 'shell target with no layers left');
  assert.deepEqual(hit(D('squishy'), 'acid', 25).payoffs, ['corrode']);
});
T('elite bars x1.5, boss x3', () => {
  let t = D(null, 'elite'); hit(t, 'fire', 40); near(t.bars.fire, 40 / 60);
  t = D(null, 'boss'); hit(t, 'fire', 40); near(t.bars.fire, 40 / 120);
  t = D(null, 'elite'); hit(t, 'acid', 25); near(t.bars.acid, 25 / 37.5);
  t = D(null, 'boss'); assert.deepEqual(hit(t, 'soul', 180).payoffs, ['possess']);
});
T('bar drain: 2 s quiet, then empties over 2 s', () => {
  const t = D(null); hit(t, 'fire', 20); tickDefence(t, 2); near(t.bars.fire, 0.5);
  tickDefence(t, 0.5); near(t.bars.fire, 0.25); tickDefence(t, 0.5); near(t.bars.fire, 0);
  hit(t, 'fire', 20); tickDefence(t, 1.5); hit(t, 'fire', 4); near(t.bars.fire, 0.6);
  tickDefence(t, 1.9); near(t.bars.fire, 0.6, 'a qualifying hit restarted the delay');
  const u = D(null); hit(u, 'force', 15); tickDefence(u, 10); near(u.bars.force, 0);
});
T('bar drain is per bar', () => {
  const t = D(null); hit(t, 'fire', 20); tickDefence(t, 1.5); hit(t, 'soul', 30);
  tickDefence(t, 1); near(t.bars.fire, 0.25); near(t.bars.soul, 0.5);
});

// Burning
T('burnAdd: 20% of fire damage, capped at 50% max health, timer refreshes', () => {
  const t = D(null); burnAdd(t, 50); near(t.burnPool, 10); near(t.burnT, 3);
  burnAdd(t, 1000); near(t.burnPool, 50);
});
T('burn drains evenly over the remaining timer into burnDmg', () => {
  const t = D(null); burnAdd(t, 50); tickDefence(t, 1);
  near(t.burnDmg, 10 / 3); near(t.burnPool, 20 / 3);
  tickDefence(t, 1); near(t.burnDmg, 20 / 3); tickDefence(t, 5);
  near(t.burnDmg, 10); near(t.burnPool, 0); assert(t.burnT <= 0);
});
T('ignition is separate from burn: the bar payoff leaves the burn pool alone', () => {
  const t = D(null); hit(t, 'fire', 40); near(t.burnPool, 0);
});

// Echo
T('echo: through Membrane, Shell and Squishy, but never bars, heavy, Thorns, miss, crit', () => {
  const e = { echo: true, atk: 'contact', rng: 0 };
  let t = D('evasion'); let r = hit(t, 'fire', 40, e); assert(!r.miss); near(r.toHp, 40); near(t.bars.fire, 0);
  t = D('shell', 'normal', { layers: 2 }); r = hit(t, 'force', 50, e); assert(!r.heavy); near(r.toHp, 44); assert.equal(t.layers, 2); near(t.bars.force, 0);
  t = D('thorns'); r = hit(t, 'force', 20, e); near(r.thorns, 0);
  t = D('squishy'); near(hit(t, 'force', 20, e).toHp, 13);
  t = D('membrane'); r = hit(t, 'force', 20, e); near(r.toMem, 20); near(r.toHp, 0);
  r = hit(D(null), 'acid', 10, { echo: true, crit: true }); near(r.toHp, 10); assert(!r.crit);
});
T('echo does not recharge Membrane with Static', () => {
  const t = D('membrane'); const r = hit(t, 'static', 10, { echo: true }); assert(!r.staticRecharge); near(t.mem, 40);
});
T('echo wears Shell like any other hit', () => {
  const t = D('shell'); hit(t, 'force', 10, { echo: true }); near(t.layerHp, 12);
});

// Misc
T('health clamps at 0; raw sums components', () => {
  const t = D(null), r = hit(t, null, 0, { comps: [{ type: 'force', amt: 80 }, { type: 'fire', amt: 80 }] });
  near(r.raw, 160); near(t.hp, 0);
});
T('plain target takes raw damage', () => { for (const k of TYPES) near(hit(D(null), k, 7).toHp, 7); });

console.log(n + ' passed');
