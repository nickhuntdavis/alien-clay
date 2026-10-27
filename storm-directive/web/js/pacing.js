'use strict';
// Spawn Prawn - pacing: the intensity cycle, wave shape and screens-in-lulls (user, 27 Oct).
//  - Free modes (the Race, Endless, the race to the egg): the spawn rate used to climb and never fall. Now it swells
//    and lulls on a PACING.cycle (75 s) loop: a lull at PACING.lull x for PACING.lullSec, then a ramp from 0.85x up to
//    PACING.swell x, so the average over a cycle is still 1.0 and the run is no easier or harder overall, just shaped.
//    A boss death forces a PACING.bossLull lull (and restarts the cycle from there). paceK() is the multiplier.
//  - Wave modes (Petri Dish, Endless): each wave's feed is a burst, a steady middle and a final surge (paceShape:
//    1.8x for the first 8% of the wave's feed time, 0.78x to 78%, then 1.45x; the integral is 1.0, so the budget
//    still lands in V.dur). The rest after a clear is PACING.rest (5 s, was 1.6 s): gems fly in, you heal, nothing
//    opens, then the rewards and the next-wave button.
//  - Screens in lulls (paceGap): the Reward Director's gap shrinks to PACING.gapLull of itself in a lull (so a screen
//    opens while it is quiet) and stretches by PACING.gapSwell seconds while the swell is at its peak (paceK() over
//    PACING.peak), unless three or more rewards are waiting. Wave modes are untouched (their window is the wave break).
//  - Telemetry in G.stats: lullT (seconds spent in lulls), lullScr (screens opened in a lull).
//  - PACING.on = false puts every mode back to the flat rate (sims: wave20.js --pre 'PACING.on = false').
// Hooks: game.js update spawn rate -> paceK; waves.js waveSpawn and campaign.js campSpawn feed -> paceShape;
//   waves.js waveClear -> PACING.rest; director.js dirGate -> paceGap. hookOn('kill', 'pacing:bossLull').

const PACING = { on: true, cycle: 75, lull: 0.6, lullSec: 12, swell: 1.3, bossLull: 10, rest: 5, gapLull: 0.5, gapSwell: 15, peak: 1.15 };
const paceS = () => G.pace || (G.pace = { lullT: 0, t0: 0 });
const paceFree = () => !!(G && !G.wave && !G.lvl && !G.debug);

// The spawn-rate multiplier this frame (free modes only; 1 elsewhere).
function paceK() {
  if (!PACING.on || !paceFree()) return 1;
  const S = paceS();
  if (S.lullT > 0) return PACING.lull;
  const L = PACING.lullSec / PACING.cycle, u = ((G.t - S.t0 + L * PACING.cycle) % PACING.cycle) / PACING.cycle; // (the run opens on the ramp, not a lull)
  if (u < L) return PACING.lull;
  return 0.85 + (PACING.swell - 0.85) * (u - L) / (1 - L);
}
const paceLull = () => PACING.on && paceFree() && paceK() <= PACING.lull + 1e-6;

// The feed shape of a wave: burst, steady, surge (a multiplier on budget / dur).
function paceShape(V) {
  if (!PACING.on) return V.t < 3 ? 2 : 1;
  const u = V.t / Math.max(1, V.dur);
  return u < 0.08 ? 1.8 : u < 0.78 ? 0.78 : 1.45;
}

// The Reward Director's gap, bent towards the lulls.
function paceGap(gap) {
  if (!PACING.on || !paceFree()) return gap;
  if (paceLull()) return gap * PACING.gapLull;
  if (paceK() >= PACING.peak && G.lootQueue.length < 3) return gap + PACING.gapSwell;
  return gap;
}

function paceTick(dt) {
  if (!G || !PACING.on || !paceFree()) return;
  const S = paceS();
  if (S.lullT > 0) S.lullT -= dt;
  if (G.stats && paceLull()) G.stats.lullT = (G.stats.lullT || 0) + dt;
}
function paceBossKill(e) {
  if (!e.boss || !paceFree()) return;
  const S = paceS();
  S.lullT = PACING.bossLull; S.t0 = G.t + PACING.bossLull; // (the cycle restarts on the ramp once the breather ends)
}
hookOn('tick', 'pacing:tick', dt => paceTick(dt));
hookOn('kill', 'pacing:bossLull', e => paceBossKill(e));
