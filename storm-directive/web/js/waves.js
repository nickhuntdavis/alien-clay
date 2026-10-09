'use strict';
// Spawn Prawn - the Petri Dish. A mad scientist is breeding super sperm. One drop goes into the dish at a
// time. No boxes open mid-wave: clear it, open everything you earned, then call the next drop.
//  - Wave mode (Sample 002, the default): twenty drops, a couple of new enemy types each, and a boss every
//    fifth (campaign.js). Beat wave 20 and the scientist fertilises you in the dish: you win.
//  - Endless (Sample 006, unlocked by winning wave mode): wave after wave, each nastier than the last, with
//    something big every fifth. How many can you take?

const DISH = { arena: 1150, waveSec: 75 };
const DROPS = ['Saline', 'Agar Broth', 'Growth Serum', 'Hormone Cocktail', 'Mutagen', 'Steroid Drip', 'Spicy Reagent', 'Unlabelled Vial',
  'Something Glowing', 'Formula X', 'The Good Stuff', 'Grant Money', 'Super Serum', 'Forbidden Pipette', 'Professor Nobody\'s Tears'];
const SCIENTIST = ['The scientist adjusts her goggles. "Again."', '"Fascinating. Make it stronger."', '"Write that down. No, the other notebook."',
  '"It survived? Double the dose."', '"For science. And possibly a patent."', '"The ethics board will never know."', '"Hmm. Hmm hmm hmm."'];

const wavesMode = () => !!(G && G.wave);

function initWaves() {
  G.wave = { n: 0, active: false, budget: 0, spawned: 0, t: 0, restT: 0, best: 0 };
  G.nextBoss = 1e12; G.nextWave = 1e12;
  G.nextPill = 1e12; G.nextYeast = 1e12; // the yeast and the pill are Sample 001's hazards (budding yeast would never let a wave end)
  G.rivalsInit = true; // no race in the dish: just you and whatever she drops in
  if (typeof UI === 'undefined' || UI.sample !== 's006') campInit(); // wave mode (campaign.js); Endless otherwise
}

// The difficulty clock in the dish follows the waves, not the stopwatch.
function wavePT() { const V = G.wave, k = V.camp ? CAMP.waveSec : DISH.waveSec; return k * Math.max(0, V.n - 1) + Math.min(V.t, k); } // (wave mode's 20 waves run a faster clock than Endless)

function waveBegin() {
  const V = G.wave;
  if (V.active) return;
  V.n++; V.active = true; V.t = 0; V.spawned = 0; V.started = true;
  if (V.camp) { campBegin(V); UI.refreshHud(true); return; }
  // Bigger waves, fed in over 45 to 90 seconds rather than all at once.
  V.budget = Math.round((50 + V.n * 20 + Math.pow(V.n, 1.5) * 4) * G.P.spawnMult);
  V.dur = Math.min(100, 55 + V.n * 3);
  const p = me(), a = Math.random() * TAU, x = p.x + Math.cos(a) * 160, y = p.y + Math.sin(a) * 160;
  const drop = DROPS[(V.n - 1) % DROPS.length];
  // The pipette: a big drop falls into the dish and the wave spreads out from the splash.
  G.fx.push({ type: 'drop', x, y, r: 26, color: '#ffffff', life: 0.7, max: 0.7 });
  after(0.7, () => { ring(x, y, 160, '#ffffff', 0.8, 8); ring(x, y, 300, '#ffffff', 1.1, 4); cam.shake = 8; sfx('boom'); });
  banner(`WAVE ${V.n}: ${drop.toUpperCase()}`, PAL.reward);
  if (V.n > 1) sysMsg('THE SCIENTIST', pick(SCIENTIST), XR.dim);
  // From wave 2 every drop has a side effect (a run event for the wave); DIRE from wave 10.
  if (V.n >= 2) after(1.2, () => { if (V.active) startEvent(V.n >= 10); });
  // Every 5th wave she drops in something big.
  if (V.n % 5 === 0) after(1.5, () => { if (V.active) spawnBoss(); });
  UI.refreshHud(true);
}

// Called from the director instead of its usual spawning while in the dish.
function waveSpawn(rate, dt, maxAlive, hostile) {
  const V = G.wave;
  if (V.camp) { campSpawn(dt, maxAlive, hostile); return; }
  if (!V.active || V.spawned >= V.budget) return;
  G.spawnAcc += V.budget / V.dur * dt * (V.t < 4 ? 2 : 1); // a burst from the splash, then a steady feed
  while (G.spawnAcc >= 1 && V.spawned < V.budget) {
    G.spawnAcc--;
    if (hostile >= maxAlive) break;
    const n0 = G.enemies.length;
    spawnRandom();
    V.spawned += Math.max(1, G.enemies.length - n0);
  }
}

function waveTick(dt) {
  const V = G.wave;
  G.ev.next = 1e12; // events only come with the drops
  if (!V.active) { if (V.restT > 0) V.restT -= dt; return; }
  V.t += dt;
  if (V.camp) { campTick(dt); return; }
  if (V.spawned < V.budget) return;
  // Everything is in the dish: stragglers (turrets, shy shooters, anything lost at the rim) get pipetted
  // back next to you every few seconds, so a wave can always be finished.
  V.herdT = (V.herdT || 0) - dt;
  if (V.herdT <= 0) {
    V.herdT = 4;
    const p = me();
    for (const e of G.enemies) {
      if (e.dead || e.charmed || e.egg || e.boss) continue;
      if (Math.hypot(e.x - p.x, e.y - p.y) > 520) { const a = Math.random() * TAU; e.x = p.x + Math.cos(a) * 380; e.y = p.y + Math.sin(a) * 380; e.kx = e.ky = 0; spawnPart(e.x, e.y, '#ffffff', 4, 60, 0.3); }
    }
  }
  if (G.boss || G.enemies.some(e => !e.dead && !e.charmed && !e.egg)) return;
  waveClear(V);
}
// Wave clear: everything you dropped flies to you, then the boxes open.
function waveClear(V) {
  V.active = false; V.restT = 1.6; V.best = V.n;
  for (const g of G.gems) g.mag = true;
  if (typeof vesWaveClear === 'function') vesWaveClear();
  for (const b of G.ebul) b.dead = true;
  for (const ev of G.ev.active) ev.left = 0;
  G.hazards.length = 0;
  healPlayer(G.P.maxHp * (0.25 + (G.P.magnet - 1) / 3)); // Clingy heals a little more in the dish
  if (!(V.camp && tutWave0Clear(V))) banner(V.camp ? `WAVE ${V.n} OF ${CAMP.waves} BEATEN` : `WAVE ${V.n} CLEAR`, PAL.upgrade);
  sfx('level'); vibrate([60, 40, 60]);
  addViewers(3000 * V.n);
  if (V.n === 5) achieve('wave5');
  if (V.n === 15) achieve('wave15');
}

// Boxes wait until the wave is over, except a boss's reward, which opens as soon as it dies.
const waveHoldsLoot = () => wavesMode() && (G.wave.active || G.wave.restT > 0) && !(G.lootQueue[0] && G.lootQueue[0].now);
// Ready for the next drop: wave over, boxes all opened.
const waveReady = () => wavesMode() && !G.wave.active && G.wave.restT <= 0 && !G.lootQueue.length && G.state === 'play';
