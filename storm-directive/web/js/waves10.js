'use strict';
// Spawn Prawn - v10 wave-mode encounters, built from enemy roles (ENEMY_DESIGN 10 "Spawn composition", 13 step 5).
//
// Owns: WAVES10, the table of what each of the Petri Dish's 20 waves sends (roles, enemy ids and weights), the
// population rules, and the spawner that follows the table. Under V10 only; with V10 off, or W10_OFF set, wave mode
// is exactly as campaign.js left it (random newcomers from the `from` order).
//   Waves 1 to 4 meet one behaviour each, alone: Chaser, Sprinter (Evasion), Shooter, Tank (Squishy). A new enemy
//   (Ingrown Hair, Mosquito, Static Sock, Stress Ball, Matchstick, Birthday Candle, Trapped Wind) always arrives in a
//   wave with no other first-timer from the new list, then returns in the bigger mixes. Pairs from section 10 follow
//   (Shooter + Chaser, Shell tank + Shooter, Healer + Swarm, Summoner + Charger, Controller + Shooter,
//   Carrier + Swarm); wave 19 is the big mix. Every fifth wave is a boss wave and stays as campaign.js builds it.
//   The wave's budget, length and spawn rhythm are CAMP's, untouched: only WHO arrives changes.
// Population rules (W10 and w10Check):
//   - max active enemies per wave (entry.max); summoned and split enemies count, because the count is every hostile.
//   - no two different enemies in one composition that apply the same disruptive status (W10_STATUS), or that both
//     leave Pools (W10_POOLS); at most two different shooter ids per composition.
//   - while the wave runs: at most W10.maxShooters shooters and W10.maxPools Pool-makers alive at once, plus each
//     type's own roster `cap` (foes2.js foeRoom, G.typeN).
//   - the first spawns of a wave are one of each listed enemy, so the lesson always turns up; then weighted draws.
// Hooks: campaign.js campBegin -> w10Fresh (the wave's first-timers); campSpawnMob -> w10Spawn; campSpawn -> w10Max.
// Save data: none.

const W10 = { maxShooters: 7, maxPools: 4, maxPerShooterId: 2 };

// mix: enemy id -> draw weight. roles: what the wave is about. max: most hostiles alive at once (summons included).
// teaches: one line on the lesson. Boss waves (boss: true) are built by campaign.js, untouched.
const WAVES10 = {
  1:  { roles: ['chaser'], mix: { crawler: 1 }, max: 28,
    teaches: 'Chaser: a plain swimmer that closes on you. Move, shoot, learn to kite.' },
  2:  { roles: ['sprinter'], mix: { skitter: 3, crawler: 1 }, max: 30,
    teaches: 'Sprinter (Evasion): small, quick, and 35% of single shots miss it. Burst and Beam never miss.' },
  3:  { roles: ['shooter', 'chaser'], mix: { spitter: 2, crawler: 3, skitter: 1 }, max: 32,
    teaches: 'Shooter: the Antibody stops and fires one shot. Break the line, close the gap, or pick it first.' },
  4:  { roles: ['tank', 'chaser'], mix: { brute: 2, crawler: 3, skitter: 1 }, max: 34,
    teaches: 'Tank (Squishy): the Macrophage soaks Force and barely moves. Use another damage type, or walk away.' },
  5:  { boss: true, teaches: 'Boss wave (campaign.js): the first boss and its entourage.' },
  6:  { roles: ['chaser'], mix: { ingrown: 3, crawler: 2, spitter: 1 }, max: 38,
    teaches: 'Thorns: the Ingrown Hair hurts Contact weapons. Projectile, Spread, Burst, Beam and Pool treat it as a chaser.' },
  7:  { roles: ['tank', 'shooter'], mix: { shell: 2, spitter: 2, crawler: 2 }, max: 40,
    teaches: 'Shell tank + Shooter: the Shell Cell holds space while the Antibody fires. Acid or one heavy hit sheds the shell.' },
  8:  { roles: ['leech', 'sprinter'], mix: { mosquito: 2, crawler: 2, skitter: 1, spitter: 1 }, max: 40,
    teaches: 'Mosquito: a fixed bite, then it flies off. Kill it within 4 s and you get half the bite back.' },
  9:  { roles: ['support', 'tank'], mix: { bulwark: 2, crawler: 3, brute: 1 }, max: 42,
    teaches: 'Membrane: the Mucus Wall soaks half of every hit until broken. Force is poor into it; Static only recharges it.' },
  10: { boss: true, teaches: 'Boss wave (campaign.js): the second boss and its entourage.' },
  11: { roles: ['support', 'swarm'], mix: { medic: 1, krill: 3, crawler: 1 }, max: 46,
    teaches: 'Healer + Swarm: the Nurse Cell mends the shoal. Hunt it first, or burst the whole crowd.' },
  12: { roles: ['chaser'], mix: { staticsock: 3, crawler: 2, shell: 1 }, max: 46,
    teaches: 'Static Sock: Crackle builds by distance swum, in 3 steps. At full, one heavy zap. Kill it before it fills.' },
  13: { roles: ['charger', 'shooter'], mix: { matchstick: 3, spitter: 2, crawler: 1 }, max: 48,
    teaches: 'Matchstick: strikes, lights its lane, charges and leaves a burning trail. Step out of the lane, then avoid the trail.' },
  14: { roles: ['tank', 'chaser'], mix: { stressball: 2, brute: 1, crawler: 2 }, max: 50,
    teaches: 'Stress Ball (Squishy): every 5th Force hit springs it back and knocks you off. Back away at full squeeze.' },
  15: { boss: true, teaches: 'Boss wave (campaign.js): the third boss and its entourage.' },
  16: { roles: ['summoner', 'charger'], mix: { summoner: 1, charger: 2, crawler: 2 }, max: 54,
    teaches: 'Summoner + Charger: the Mother Cell adds Sprinters (they count against the cap) while the Headbutter threatens a lane.' },
  17: { roles: ['controller', 'shooter'], mix: { candle: 1, spitter: 3, shell: 1, crawler: 2 }, max: 56,
    teaches: 'Controller + Shooter: the Birthday Candle drips wax walls that block movement and shots while Antibodies fire past them.' },
  18: { roles: ['carrier', 'swarm'], mix: { trappedwind: 2, krill: 3, crawler: 1 }, max: 58,
    teaches: 'Carrier + Swarm: Trapped Wind goes up in one Burst if a Fire hit lights it. Light it while it sits among the shoal.' },
  19: { roles: ['mixed'], mix: { crawler: 2, skitter: 1, ingrown: 1, spitter: 2, shell: 1, medic: 1, krill: 2, charger: 1, stressball: 1, mosquito: 1, staticsock: 1 }, max: 64,
    teaches: 'The big mix: every defence and most roles at once, one Pool-maker and one shooter type at most.' },
  20: { boss: true, teaches: 'Boss wave (campaign.js): the final boss and its entourage.' },
};

// Disruptive statuses and Pool-makers, by enemy id (ENEMY_DESIGN 10: do not stack the same status).
const W10_STATUS = { snare: ['hocker', 'bogey', 'snotbubble'], burning: ['matchstick', 'candle', 'trappedwind', 'warlock'], tangle: ['pube'],
  drain: ['leech'], mark: ['complement'], engulf: ['amoeba'] };
const W10_POOLS = ['bomber', 'matchstick', 'candle', 'hocker', 'snotbubble'];
const w10Shooter = id => { const r = typeof ROSTER !== 'undefined' && ROSTER[id]; return !!r && r.role.some(x => x === 'shooter' || x === 'sniper'); };
const w10Pool = id => W10_POOLS.includes(id);

// The composition rules, as a function so the test (and anyone tuning the table) can run them. Returns problems.
function w10Check(n) {
  const E = WAVES10[n], bad = [];
  if (!E) return ['no entry for wave ' + n];
  if (E.boss) return bad;
  const ids = Object.keys(E.mix);
  for (const tag in W10_STATUS) { const hit = ids.filter(id => W10_STATUS[tag].includes(id)); if (hit.length > 1) bad.push(`wave ${n}: ${hit} all apply ${tag}`); }
  const pools = ids.filter(w10Pool); if (pools.length > 1) bad.push(`wave ${n}: Pool-makers stacked: ${pools}`);
  const sh = ids.filter(w10Shooter); if (sh.length > W10.maxPerShooterId) bad.push(`wave ${n}: too many shooter types: ${sh}`);
  return bad;
}

const w10On = () => typeof ROSTER !== 'undefined' && !(typeof window !== 'undefined' && window.W10_OFF) && !!(G && G.wave && G.wave.camp);
const w10Entry = V => (w10On() && V && V.phase === 'mobs' && V.n >= 1 && WAVES10[V.n] && !WAVES10[V.n].boss) ? WAVES10[V.n] : null;

// campBegin: the ids this wave brings for the first time (the table replaces the random newcomers).
function w10Fresh(V) {
  const E = w10Entry({ n: V.n, phase: 'mobs' });
  if (!E) return null;
  return Object.keys(E.mix).filter(id => ENEMIES[id] && !V.met.includes(id));
}
// campSpawn: the wave's own ceiling on hostiles alive (summons included).
function w10Max(V, maxAlive) { const E = w10Entry(V); return E ? Math.min(maxAlive, E.max) : maxAlive; }

const w10Alive = test => G.enemies.reduce((n, e) => n + (!e.dead && !e.charmed && !e.rival && !e.egg && test(foeKey(e.def)) ? 1 : 0), 0);
// campSpawnMob: draw from the table. Returns how many bodies were made (0 = not mine, fall back to campaign.js).
function w10Spawn(V) {
  const E = w10Entry(V);
  if (!E) return 0;
  const ids = Object.keys(E.mix).filter(id => ENEMIES[id]);
  if (!ids.length) return 0;
  if (!V.w10 || V.w10.n !== V.n) V.w10 = { n: V.n, q: shuffle(ids.slice()), cnt: {} }; // per wave; q = the lesson first: one of each listed enemy
  const N = V.w10.cnt, q = V.w10.q;
  const roomFor = id => foeRoom(ENEMIES[id]);
  const shootersFull = w10Alive(w10Shooter) >= W10.maxShooters, poolsFull = w10Alive(w10Pool) >= W10.maxPools;
  const ok = id => roomFor(id) && !(shootersFull && w10Shooter(id)) && !(poolsFull && w10Pool(id));
  let id = null;
  while (q.length && !id) { const c = q.shift(); if (ok(c)) id = c; }
  if (!id) {
    const cand = ids.filter(ok); let tot = 0; for (const c of cand) tot += E.mix[c];
    let r = Math.random() * tot; for (const c of cand) { r -= E.mix[c]; if (r <= 0) { id = c; break; } }
    if (!id && cand.length) id = cand[0];
  }
  if (!id) return 1; // everything at its cap: this draw is spent, as campSpawnMob does
  const d = ENEMIES[id], s = spawnPos(), k = Math.max(1, Math.ceil((d.group || 1) * 0.6)), elite = V.n >= 6 && k === 1 && Math.random() < Math.min(0.12, 0.01 * V.n);
  let made = 0;
  for (let j = 0; j < k; j++) { if (G.enemies.length >= CAPS.enemies) break; const p = dishFix(s.x + rand(-CAMP.spread, CAMP.spread), s.y + rand(-CAMP.spread, CAMP.spread)); G.enemies.push(makeEnemy(d, p.x, p.y, { elite: elite && j === 0 })); made++; }
  N[id] = (N[id] || 0) + made;
  return made || 1;
}
