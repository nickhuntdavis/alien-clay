'use strict';
// Spawn Prawn - pacing: the intensity meter, wave shape and screens-in-lulls (user, 27 Oct).
//  - Free modes (the Race, Endless, the race to the egg): the spawn rate used to climb and never fall. Now an
//    invisible intensity meter (0 to 1, G.pace.meter) drives it, the way Left 4 Dead's director does:
//      build  the meter fills from enemies dying near you (PACING.killR), from hits you take (a share of max HP) and
//             slowly with time (PACING.timeFill a second, so a kiting player still meets a peak); the spawn rate is
//             1x + PACING.swellK x meter (up to 1.3x at full).
//      peak   the meter is full: PACING.peakSec seconds at the swell rate (1.3x).
//      relax  the spawn rate drops to PACING.lull (0.6x) while the meter drains at PACING.drain a second; build-up
//             resumes once it is under PACING.relaxTo or after PACING.relaxMax seconds. Telemetry: G.stats.peaks.
//    A boss death fills the meter (a peak, then the breather). PACING.mode = 'clock' swaps in the older fixed
//    75 s swell-and-lull loop (paceClock) for comparison; 'flat' is the old constant rate.
//  - Wave modes (Petri Dish, Endless): each wave's feed is a burst, a steady middle and a final surge (paceShape:
//    1.8x for the first 8% of the wave's feed time, 0.78x to 78%, then 1.45x; the integral is 1.0, so the budget
//    still lands in V.dur). The rest after a clear is PACING.rest (5 s, was 1.6 s): gems fly in, you heal, nothing
//    opens, then the rewards and the next-wave button.
//  - Screens in lulls (paceGap): the Reward Director's gap shrinks to PACING.gapLull of itself in a lull (so a screen
//    opens while it is quiet) and stretches by PACING.gapSwell seconds while a peak is on (paceK() over
//    PACING.peak), unless three or more rewards are waiting. Wave modes are untouched (their window is the wave break).
//  - Telemetry in G.stats: lullT (seconds spent in lulls), lullScr (screens opened in a lull), peaks.
//  - PACING.on = false puts every mode back to the flat rate (sims: wave20.js --pre 'PACING.on = false').
// Hooks: game.js update spawn rate -> paceK; waves.js waveSpawn and campaign.js campSpawn feed -> paceShape;
//   waves.js waveClear -> PACING.rest; director.js dirGate -> paceGap. hookOn('kill', 'pacing:kill'),
//   hookOn('hurt', 'pacing:hurt'), hookOn('tick', 'pacing:tick').

const PACING = { on: true, mode: 'meter', lull: 0.6, swell: 1.3, rest: 5, gapLull: 0.5, gapSwell: 15, peak: 1.15,
  // the meter
  killR: 260, killFill: 0.012, eliteFill: 0.04, hurtFill: 0.6, timeFill: 0.01, peakSec: 4, drain: 0.06, relaxTo: 0.3, relaxMax: 40, swellK: 0.3,
  // the clock (mode 'clock')
  cycle: 75, lullSec: 12, bossLull: 10 };
const paceS = () => G.pace || (G.pace = { lullT: 0, t0: 0, meter: 0, st: 'build', stT: 0 });
const paceFree = () => !!(G && !G.wave && !G.lvl && !G.debug);

// The spawn-rate multiplier this frame (free modes only; 1 elsewhere).
function paceK() {
  if (!PACING.on || !paceFree()) return 1;
  if (PACING.mode === 'flat') return 1;
  if (PACING.mode === 'clock') return paceClock();
  const S = paceS();
  if (S.st === 'relax') return PACING.lull;
  if (S.st === 'peak') return PACING.swell;
  return 1 + PACING.swellK * Math.min(1, S.meter);
}
// The older fixed loop: a lull at PACING.lull for PACING.lullSec, then a ramp from 0.85x to PACING.swell (average 1.0).
function paceClock() {
  const S = paceS();
  if (S.lullT > 0) return PACING.lull;
  const L = PACING.lullSec / PACING.cycle, u = ((G.t - S.t0 + L * PACING.cycle) % PACING.cycle) / PACING.cycle; // (the run opens on the ramp, not a lull)
  if (u < L) return PACING.lull;
  return 0.85 + (PACING.swell - 0.85) * (u - L) / (1 - L);
}
const paceLull = () => PACING.on && paceFree() && PACING.mode !== 'flat' && paceK() <= PACING.lull + 1e-6;

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
  if (PACING.mode === 'meter') {
    S.stT += dt;
    if (S.st === 'build') {
      S.meter += PACING.timeFill * dt;
      if (S.meter >= 1) { S.meter = 1; S.st = 'peak'; S.stT = 0; if (G.stats) G.stats.peaks = (G.stats.peaks || 0) + 1; }
    } else if (S.st === 'peak') {
      if (S.stT >= PACING.peakSec) { S.st = 'relax'; S.stT = 0; }
    } else {
      S.meter = Math.max(0, S.meter - PACING.drain * dt);
      if (S.meter <= PACING.relaxTo || S.stT >= PACING.relaxMax) { S.st = 'build'; S.stT = 0; }
    }
  }
  if (G.stats && paceLull()) G.stats.lullT = (G.stats.lullT || 0) + dt;
}
// The meter fills from stress: a kill near you, a hit you take, a boss going down.
function paceFill(x) { const S = paceS(); if (S.st === 'build') S.meter = Math.min(1, S.meter + x); }
function paceKill(e) {
  if (!PACING.on || !paceFree()) return;
  if (e.boss) { paceBossKill(e); return; }
  const p = me(); if (!p || Math.hypot(e.x - p.x, e.y - p.y) > PACING.killR) return;
  paceFill(e.elite ? PACING.eliteFill : PACING.killFill);
}
function paceHurt(d) { if (PACING.on && paceFree() && G.P && G.P.maxHp > 0) paceFill(PACING.hurtFill * d / G.P.maxHp); }
function paceBossKill(e) {
  if (!e.boss || !paceFree()) return;
  const S = paceS();
  S.lullT = PACING.bossLull; S.t0 = G.t + PACING.bossLull; // (clock: the cycle restarts on the ramp once the breather ends)
  S.meter = 1; S.st = 'peak'; S.stT = PACING.peakSec; // (meter: straight to the breather)
}
hookOn('tick', 'pacing:tick', dt => paceTick(dt));
hookOn('kill', 'pacing:kill', e => paceKill(e));
hookOn('hurt', 'pacing:hurt', d => paceHurt(d));
