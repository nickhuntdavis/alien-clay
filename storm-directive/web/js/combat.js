'use strict';
// Spawn Prawn - v10 combat resolution core (spec: ../redesign docs/COMBAT_MATRIX.md, 1, 3, 4, 7, 10, 11, 13).
// Owns: one-hit resolution in matrix 11.1 order (Evasion, Membrane, Shell, Squishy, crit, health), build-up bars
// (11.2: Corrosion, Burn, Poise, Alien), heavy Force hits (11.3), Thorns, echo damage (12.1), and the per-frame
// defence tick (Membrane recharge, bar drain). Every number is in COMBAT so tuning lives in one place.
// Pure: no G, ctx, DOM or game globals. Callers own the target state (makeDefence) and the dice (rng, crit).
// Canonical ids only: damage force/acid/static/mucus/blood/soul/fire; attack contact/proj/spread/burst/beam/pool;
// defence squishy/membrane/shell/thorns/evasion.
// Reaction damage is NOT a flat 60%/150%: only burst/hit reactions deal damage (handled later in react.js).
// Hooks: none yet (wired into game.js damageEnemy/hurtPlayer later).

const COMBAT = {
  evasionTypes: ['contact', 'proj', 'spread'], // attack types Evasion can miss (13)
  evasionDefault: 0.35, evasionCap: 0.5,       // 11.4
  membraneFrac: 0.5,           // Membrane capacity as a share of max health
  membraneForceK: 0.5,         // Force does this share against Membrane (so 2 damage per point)
  membraneDelay: 2, membraneFill: 2, // seconds without Membrane damage before recharge; seconds to refill fully
  staticRechargeFrac: 0.25, staticRechargeCd: 5,
  shellPerLayer: 3, shellFloor: 1, shellLayerHpFrac: 0.15,
  squishyForceCut: 0.35,
  squishyKnockCut: 0.5, // 11.4: 50% less knockback (and pull, 12.2)
  membraneKnockCut: 0.5, // 3: knocks back less while the Membrane is up (no figure given; Force does 50% to it, same number)
  critMult: 1.6,
  heavyFrac: { normal: 0.15, elite: 0.10, boss: 0.05 }, // raw Force vs max health (11.3)
  barSize: { acid: 0.25, fire: 0.4, force: 0.3, soul: 0.6 }, // acid is per Shell layer
  rankBarK: { normal: 1, elite: 1.5, boss: 3 },
  barDelay: 2, barDrain: 2,    // seconds quiet before draining; seconds to empty a full bar
  thornsBase: 5, thornsFrac: 0.35,
  corrodedT: 4,                // seconds of the visible Corroded state when a bar fills on a target with no Shell
  burnFrac: 0.20, burnCapFrac: 0.5, burnT: 3, // one shared burn per target (burnAdd)
};

// What a full bar does.
const BAR_PAYOFF = { acid: 'strip' /* 'corrode' with no layers */, fire: 'ignite', force: 'stagger', soul: 'possess' };

// Build a target's defence state with the 11.4 starting values.
function makeDefence(maxHp, def, rank, opts) {
  opts = opts || {};
  const layers = def === 'shell' ? (opts.layers == null ? 1 : opts.layers) : 0;
  const memMax = def === 'membrane' ? maxHp * (opts.memFrac == null ? COMBAT.membraneFrac : opts.memFrac) : 0;
  const ev = opts.evasion == null ? COMBAT.evasionDefault : opts.evasion;
  return {
    maxHp, hp: maxHp, rank: rank || 'normal', def: def || null,
    burnPool: 0, burnT: 0, burnDmg: 0,
    mem: memMax, memMax, memQuietT: 0, memStaticCd: 0,
    layers, layerHp: layers ? maxHp * COMBAT.shellLayerHpFrac : 0,
    bars: { acid: 0, fire: 0, force: 0, soul: 0 }, barQuietT: { acid: 0, fire: 0, force: 0, soul: 0 },
    evasion: def === 'evasion' ? Math.min(COMBAT.evasionCap, ev) : 0,
    thornsK: def === 'thorns' ? (opts.thornsK == null ? 1 : opts.thornsK) : 0,
  };
}

function dropLayer(t, res) {
  if (t.layers <= 0) return;
  t.layers--; res.layersLost++;
  t.layerHp = t.layers ? t.maxHp * COMBAT.shellLayerHpFrac : 0;
}

// Resolve one hit (one pellet for Spread; one tick for Beam/Pool) against t, mutating t. See 11.1.
function resolveHit(t, a, rng) {
  const res = { miss: false, raw: 0, toMem: 0, toShell: 0, layersLost: 0, toHp: 0, crit: false, heavy: false,
    thorns: 0, payoffs: [], staticRecharge: false, statusOk: true };
  const echo = !!a.echo, contact = a.atk === 'contact';
  // 1. Evasion. Echo cannot miss.
  if (!echo && t.def === 'evasion' && t.evasion > 0 && COMBAT.evasionTypes.indexOf(a.atk) >= 0 && rng() < t.evasion) {
    res.miss = true; res.statusOk = false; return res;
  }
  // 2. Raw damage, by component.
  const amt = {}; let raw = 0;
  for (const c of a.comps) { amt[c.type] = (amt[c.type] || 0) + c.amt; raw += c.amt; }
  res.raw = raw;
  const rank = t.rank || 'normal';
  const force = amt.force || 0;
  const heavy = !echo && force > 0 && force >= COMBAT.heavyFrac[rank] * t.maxHp;
  res.heavy = heavy;
  // Per-type copy of what is left after each defence.
  const left = {}; for (const k in amt) left[k] = amt[k];
  const sum = () => { let s = 0; for (const k in left) s += left[k]; return s; };
  const scale = f => { for (const k in left) left[k] *= f; };
  // 3. Membrane: absorbs first; Force costs 2 per point. The absorbed share is the same for every component.
  let blocked = false;
  if (t.def === 'membrane' && t.memMax > 0) {
    let cost = 0;
    for (const k in left) cost += left[k] * (k === 'force' ? 1 / COMBAT.membraneForceK : 1);
    if (cost > 0 && t.mem > 0) {
      const f = Math.min(1, t.mem / cost);
      res.toMem = raw * f; t.mem = Math.max(0, t.mem - cost * f); t.memQuietT = 0;
      scale(1 - f);
      if (f >= 1) { blocked = true; res.statusOk = false; }
    }
    if (!echo && (amt.static || 0) > 0 && t.memStaticCd <= 0) {
      t.mem = Math.min(t.memMax, t.mem + COMBAT.staticRechargeFrac * t.memMax);
      t.memStaticCd = COMBAT.staticRechargeCd; res.staticRecharge = true;
    }
  }
  // 4. Shell: fixed cut per layer (floor 1), then wear the outer layer; a heavy Force hit sheds one instead.
  if (t.def === 'shell' && t.layers > 0 && sum() > 0) {
    const before = sum();
    const blk = Math.max(0, Math.min(COMBAT.shellPerLayer * t.layers, before - Math.min(before, COMBAT.shellFloor)));
    scale((before - blk) / before);
    res.toShell = blk; t.layerHp -= blk; // wear = damage Shell blocked; excess does not carry over
    if (t.layerHp <= 0) dropLayer(t, res);
    if (heavy) dropLayer(t, res);        // a heavy Force hit removes one more outright
  }
  // 5. Squishy: blunt (Force) only.
  if (t.def === 'squishy' && left.force) left.force *= 1 - COMBAT.squishyForceCut;
  // 6. Crit (never on echo).
  let dmg = sum();
  if (a.crit && !echo) { dmg *= COMBAT.critMult; res.crit = true; }
  // 7. Health, then bars, then Thorns.
  res.toHp = dmg; t.hp = Math.max(0, t.hp - dmg);
  if (!echo && !blocked) {
    for (const k of ['acid', 'fire', 'force', 'soul']) {
      if (!(amt[k] > 0)) continue;
      let size = COMBAT.barSize[k];
      if (k === 'acid' && t.def === 'shell' && t.layers > 0) size *= t.layers; // else sized as one layer
      t.barQuietT[k] = 0;
      t.bars[k] += amt[k] * ((a.barK && a.barK[k]) || 1) / (size * COMBAT.rankBarK[rank] * t.maxHp); // (a.barK: Concentration, mutations.js)
      if (t.bars[k] >= 1) {
        t.bars[k] = 0;
        if (k === 'acid' && !(t.def === 'shell' && t.layers > 0)) res.payoffs.push('corrode');
        else res.payoffs.push(BAR_PAYOFF[k]);
        if (k === 'acid' && t.def === 'shell') dropLayer(t, res);
      }
    }
  }
  if (!echo && contact && t.def === 'thorns') res.thorns = (COMBAT.thornsBase + COMBAT.thornsFrac * raw) * t.thornsK;
  return res;
}

// Fire damage feeds the target's single shared burn: 20% of it, capped at 50% max health; timer refreshes.
function burnAdd(t, fireDmg) {
  t.burnPool = Math.min(COMBAT.burnCapFrac * t.maxHp, t.burnPool + COMBAT.burnFrac * fireDmg);
  t.burnT = COMBAT.burnT;
}

// Advance timers by dt seconds (burn damage lands in t.burnDmg; the caller applies it and zeroes it): Membrane recharge and bar drain. Handles a dt that crosses a delay boundary.
function tickDefence(t, dt) {
  if (t.burnT > 0) {
    const use = Math.min(dt, t.burnT), d = t.burnPool * use / t.burnT;
    t.burnPool -= d; t.burnDmg += d; t.burnT -= use;
    if (t.burnT <= 0) t.burnPool = 0;
  }
  if (t.memStaticCd > 0) t.memStaticCd = Math.max(0, t.memStaticCd - dt);
  if (t.def === 'membrane' && t.memMax > 0) {
    const before = t.memQuietT; t.memQuietT += dt;
    const active = t.memQuietT - Math.max(before, COMBAT.membraneDelay);
    if (active > 0 && t.mem < t.memMax) t.mem = Math.min(t.memMax, t.mem + t.memMax * active / COMBAT.membraneFill);
  }
  for (const k in t.bars) {
    const before = t.barQuietT[k]; t.barQuietT[k] += dt;
    const active = t.barQuietT[k] - Math.max(before, COMBAT.barDelay);
    if (active > 0 && t.bars[k] > 0) t.bars[k] = Math.max(0, t.bars[k] - active / COMBAT.barDrain);
  }
}

if (typeof module !== 'undefined') module.exports = { COMBAT, BAR_PAYOFF, makeDefence, resolveHit, tickDefence, burnAdd };
