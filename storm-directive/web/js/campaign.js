'use strict';
// Spawn Prawn - wave mode (Sample 002, the default). Twenty drops into the Petri Dish. It starts easy: each
// ordinary wave brings in a couple of enemy types you have not had in this run yet, on top of the ones you
// have. Every fifth wave is a boss wave instead: the boss and its entourage, timed to its moves (snacks just
// before the Queen feeds, shooters behind the Colossus's wall). Beat the boss and the wave is beaten.
// From wave 15 the boss can be the FAILED EXPERIMENT: a copy of one of your own past runs, alone in the dish.
// Beat wave 20 and the scientist fertilises you in the dish: a win.
// Hooks (waves.js): campInit (initWaves), campBegin (waveBegin), campSpawn (waveSpawn), campTick (waveTick).

const CAMP = {
  waves: 20, bossEvery: 5, waveSec: 30,      // waveSec: the difficulty clock runs this many seconds per wave
  newPerWave: 2,                              // enemy types introduced per ordinary wave
  fixedWaves: 3, drawFrom: 6,                 // waves 1-3 bring them in order; later ones draw from the next 6 unmet
  lead: [16, 12, 10, 10],                      // boss waves: seconds of entourage before the boss drops in
  hp: [2.2, 13, 50, 160],                       // boss health, times its base, for the 1st to 4th boss wave
  hit: [0.55, 0.75, 0.9, 1],                     // boss attack strength, same order
  pulse: [7, 6.5, 6, 5.5],                    // seconds between entourage cues during a fight (at least)
  early: 0.12, earlyPT: 45, earlyTo: 12,      // waves before earlyTo: up to 12% more enemies and 45 s more on the clock (tougher, harder-hitting), fading out by then
};
// Who comes with each boss, where they arrive, and which of its moves cue them.
//   at: near (round the boss), behind (on the far side of the boss from you), ring (round you), flank (from both sides).
const ENTOURAGE = {
  queen:    { mix: ['crawler', 'crawler', 'skitter', 'wisp', 'krill'], at: 'near', on: ['summon', 'devour'], line: 'Snacks for the Queen. She eats her own to heal: get to them before she does.' },
  colossus: { mix: ['spitter', 'spitter', 'bulwark', 'crawler'], at: 'behind', on: ['charge'], line: 'Antibodies, shooting from behind the wall. He charges; they cover him.' },
  eye:      { mix: ['blinker', 'spitter', 'skitter', 'phantom'], at: 'behind', on: ['blink'], line: 'Every time the Eye blinks, more of its watchers turn up behind it.' },
  matron:   { mix: ['brute', 'medic', 'bulwark', 'charger'], at: 'near', on: ['wardround'], line: 'Patients for her ward round. Everything she heals comes back for more.' },
  pepsin:   { mix: ['bomber', 'bomber', 'splitter', 'crawler'], at: 'flank', on: ['acidrain'], line: 'Acid bubbles roll in from the sides whenever it rains acid.' },
  alpha:    { mix: ['charger', 'skitter', 'skitter', 'wisp'], at: 'ring', on: ['dash3'], line: 'His gym buddies charge in while he dashes. Do not skip leg day.' },
  fever:    { mix: ['spitter', 'bomber', 'crawler', 'warlock'], at: 'ring', on: ['firering'], line: 'Shooters on the outside keep you penned in his rings of heat.' },
  twins:    { mix: ['splitter', 'splitter', 'crawler', 'medic'], at: 'near', on: ['charge', 'spiral'], line: 'Mitotic cells, dividing round the twins.' },
  ghost:    { mix: ['phantom', 'phantom', 'wisp', 'blinker'], at: 'ring', on: ['blink'], line: 'Ghost swimmers drift in through the walls with it.' },
  failed:   { mix: [], at: 'ring', on: [], line: 'It came alone. It always did.' },
};
const DROP_NAMES = { queen: 'Feeding Time', colossus: 'Border Control', eye: 'Peer Review', matron: 'Ward Nine', pepsin: 'Indigestion', alpha: 'Leg Day', fever: 'Forty-One Degrees', twins: 'Double Dose', ghost: 'Something in the Dish', failed: 'Exhibit A' };

const campOn = () => !!(G && G.wave && G.wave.camp);
const V0 = () => G.wave;
const isBossWave = n => n % CAMP.bossEvery === 0;
const campEarly = n => clamp(1 - (n - 1) / (CAMP.earlyTo - 1), 0, 1); // 1 at wave 1, 0 from earlyTo
const bossSlot = n => n / CAMP.bossEvery - 1; // 0..3

function campInit() {
  const V = G.wave;
  V.camp = true; V.met = []; // enemy types brought in so far, in order
  // Four boss waves: a gentle opener at wave 5; the two hardest hitters saved for the back half; the Failed
  // Experiment (if you have a past run to copy) at wave 15 or 20, always alone.
  const ids = BOSSES.map(b => b.id), opener = pick(['pepsin', 'eye'].filter(id => ids.includes(id)));
  const late = ['alpha', 'fever'].filter(id => ids.includes(id)), mid = shuffle(ids.filter(id => id !== opener && !late.includes(id)));
  const order = [opener, mid[0], pick([mid[1]].concat(late)), pick(late.concat(mid.slice(2, 4)))];
  G.failedDef = failedExperimentDef();
  if (G.failedDef) order[Math.random() < 0.5 ? 2 : 3] = 'failed';
  if (order[2] === order[3]) order[3] = late.find(id => id !== order[2]) || mid[3];
  G.bossRoster = order;
  G.bossCount = 0;
  tutWaveInit(V); // (wave 0 first, the first time: tutorial.js)
}
const campBossId = n => G.bossRoster[bossSlot(n)];

// The enemy types an ordinary wave can send: everything met so far, plus a couple of new ones.
const CAMP_ORDER = () => Object.keys(ENEMIES).filter(id => ENEMIES[id].w > 0).sort((a, b) => ENEMIES[a].from - ENEMIES[b].from);
function campBegin(V) {
  const p = me(), a = Math.random() * TAU, x = p.x + Math.cos(a) * 160, y = p.y + Math.sin(a) * 160;
  G.fx.push({ type: 'drop', x, y, r: 26, color: '#ffffff', life: 0.7, max: 0.7 });
  after(0.7, () => { ring(x, y, 160, '#ffffff', 0.8, 8); ring(x, y, 300, '#ffffff', 1.1, 4); cam.shake = 8; sfx('boom'); });
  V.spawned = 0;
  if (V.n === 0) { tutWave0Begin(V); return; } // Pre-pre-pre-pre-school
  if (isBossWave(V.n)) {
    const id = campBossId(V.n), B = bossDef(id), E = ENTOURAGE[id] || ENTOURAGE.queen, s = bossSlot(V.n);
    V.boss = id; V.phase = 'lead'; V.leadT = id === 'failed' ? 1.5 : CAMP.lead[s]; V.pulseT = 0; V.lastPat = -1; V.bphase = 0;
    V.leadN = id === 'failed' ? 0 : Math.round((10 + V.n * 1.5) * G.P.spawnMult); V.leadDone = 0;
    V.budget = 1;
    banner(`WAVE ${V.n} OF ${CAMP.waves}: ${(DROP_NAMES[id] || 'THE DROP').toUpperCase()}`, PAL.danger);
    sysMsg('THE SCIENTIST', id === 'failed' ? `"Subject ${G.failedDef.run}. One of yours, from before. It did not make it. Let us see if you do better." ${E.line}` : `"${B.name.replace(/^THE /, 'The ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}, and friends." ${E.line}`, XR.dim, true);
    return;
  }
  // An ordinary wave: a couple of newcomers join the mix.
  V.boss = null; V.phase = 'mobs';
  // The first few waves teach the basics in a fixed order; after that the newcomers are drawn at random from
  // the next few you haven't had, so no two runs meet the slide in the same order (and nothing big comes early).
  const next = CAMP_ORDER().filter(id => !V.met.includes(id));
  const fresh = V.n <= CAMP.fixedWaves ? next.slice(0, CAMP.newPerWave) : shuffle(next.slice(0, CAMP.drawFrom)).slice(0, CAMP.newPerWave);
  V.fresh = fresh; V.met.push(...fresh);
  V.budget = Math.round((16 + V.n * 7 + Math.pow(V.n, 1.6)) * (1 + CAMP.early * campEarly(V.n)) * G.P.spawnMult);
  V.dur = Math.min(55, 20 + V.n * 1.8);
  // (What's in the drop stays a surprise until it lands.)
  banner(`WAVE ${V.n} OF ${CAMP.waves}`, PAL.reward);
  if (V.n > 1) sysMsg('THE SCIENTIST', `${pick(SCIENTIST)} Next boss: wave ${Math.ceil(V.n / CAMP.bossEvery) * CAMP.bossEvery}.`, XR.dim);
}
// One of the entourage, at the right spot.
function campSpawnOne(E, n, elite) {
  const p = me(), b = G.boss && !G.boss.dead ? G.boss : null, t = PT();
  let id = pick(E.mix);
  if (!ENEMIES[id] || ENEMIES[id].from > t + 90) id = 'crawler';
  let x, y;
  const off = spawnPos();
  const at = E.at === 'near' && V0().boss === 'queen' && Math.random() < 0.5 ? 'ring' : E.at; // (not every snack lands in the Queen's lap)
  if (b && at === 'near') { const a = Math.random() * TAU, d = b.r + rand(60, 140); x = b.x + Math.cos(a) * d; y = b.y + Math.sin(a) * d; }
  else if (b && at === 'behind') { const a = Math.atan2(b.y - p.y, b.x - p.x) + rand(-0.6, 0.6), d = b.r + rand(80, 160); x = b.x + Math.cos(a) * d; y = b.y + Math.sin(a) * d; }
  else if (at === 'flank') { const fa = Math.atan2(off.y - p.y, off.x - p.x), side = Math.random() < 0.5 ? 1 : -1, d = Math.hypot(off.x - p.x, off.y - p.y); x = p.x + Math.cos(fa + side * Math.PI / 2) * d; y = p.y + Math.sin(fa + side * Math.PI / 2) * d; }
  else { x = off.x; y = off.y; }
  ({ x, y } = dishFix(x, y)); // (inside the dish, never on top of you: game.js)
  const d = ENEMIES[id], k = Math.max(1, Math.ceil((d.group || 1) * 0.5));
  for (let j = 0; j < k; j++) { if (G.enemies.length >= CAPS.enemies) return k; G.enemies.push(makeEnemy(d, x + rand(-25, 25), y + rand(-25, 25), { elite: elite && j === 0 })); }
  return k;
}
// An ordinary wave's spawn: newcomers twice as likely as the old hands.
function campSpawnMob(V) {
  const ids = V.met.length ? V.met : ['crawler'];
  let tot = 0; const wOf = id => ENEMIES[id].w * (V.fresh.includes(id) ? 2 : 1);
  for (const id of ids) tot += wOf(id);
  let r = Math.random() * tot, id = ids[0];
  for (const k of ids) { r -= wOf(k); if (r <= 0) { id = k; break; } }
  const d = ENEMIES[id], s = spawnPos(), k = Math.max(1, Math.ceil((d.group || 1) * 0.6)), elite = V.n >= 6 && k === 1 && Math.random() < Math.min(0.12, 0.01 * V.n);
  for (let j = 0; j < k; j++) { if (G.enemies.length >= CAPS.enemies) return j; G.enemies.push(makeEnemy(d, s.x + rand(-30, 30), s.y + rand(-30, 30), { elite: elite && j === 0 })); }
  return k;
}
function campPulse(V, big) {
  const E = ENTOURAGE[V.boss] || ENTOURAGE.queen;
  if (!E.mix.length) return;
  const n = Math.round(Math.min(20, 4 + V.n * 0.6) * (big ? 1.6 : 1) * G.P.spawnMult);
  let made = 0;
  for (let i = 0; made < n && i < n * 2; i++) made += campSpawnOne(E, V.n, big && i === 0 && V.n >= 10);
  if (G.boss && !G.boss.dead) ring(G.boss.x, G.boss.y, G.boss.r * 2.4, '#ffffff', 0.4, 3);
}
// From the director, every frame of a wave.
function campSpawn(dt, maxAlive, hostile) {
  const V = G.wave;
  if (!V.active) return;
  if (V.phase === 'mobs') {
    if (V.spawned >= V.budget) return;
    G.spawnAcc += V.budget / V.dur * dt * (V.t < 3 ? 2 : 1); // a burst from the splash, then a steady feed
    while (G.spawnAcc >= 1 && V.spawned < V.budget && hostile < maxAlive) { G.spawnAcc--; const k = campSpawnMob(V); V.spawned += Math.max(1, k); hostile += k; }
    return;
  }
  const E = ENTOURAGE[V.boss] || ENTOURAGE.queen;
  if (!E.mix.length) return; // (the Failed Experiment comes alone)
  if (V.phase === 'lead') {
    const want = V.leadN * Math.min(1, (V.t + 2) / Math.max(1, V.leadT + V.t));
    while (V.leadDone < want && hostile < maxAlive) { V.leadDone += campSpawnOne(E, V.n, false); hostile++; }
    return;
  }
  // The fight: a light trickle, plus cues from the boss's moves (below, campTick).
  G.spawnAcc += (0.8 + V.n * 0.08) * G.P.spawnMult * dt;
  while (G.spawnAcc >= 1 && hostile < maxAlive * 0.6) { G.spawnAcc--; campSpawnOne(E, V.n, false); hostile++; }
  if (G.spawnAcc > 3) G.spawnAcc = 3;
}
function campTick(dt) {
  const V = G.wave;
  if (V.phase === 'mobs') {
    if (V.spawned < V.budget) return;
    // Everything is in the dish: stragglers get pipetted back next to you, so a wave can always be finished.
    V.herdT = (V.herdT || 0) - dt;
    if (V.herdT <= 0) {
      V.herdT = 4;
      const p = me();
      for (const e of G.enemies) {
        if (e.dead || e.charmed || e.egg || e.boss) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) > 520) { const q = dishNear(SPAWN_SAFE); e.x = q.x; e.y = q.y; e.kx = e.ky = 0; spawnPart(e.x, e.y, '#ffffff', 4, 60, 0.3); }
      }
    }
    if (G.enemies.some(e => !e.dead && !e.charmed && !e.egg)) return;
    V.phase = 'done';
    waveClear(V);
    return;
  }
  if (V.phase === 'lead') {
    V.leadT -= dt;
    if (V.leadT <= 0 && G.state === 'play') campBoss(V);
    return;
  }
  const b = G.boss, s = bossSlot(V.n);
  if (V.phase === 'boss' && b && !b.dead) {
    // Cues: a new move from the boss's list of triggers, an enrage, or a lull that has gone on too long.
    const E = ENTOURAGE[V.boss] || ENTOURAGE.queen, pat = b.def.patterns[b.pat];
    V.pulseT -= dt;
    if (b.pat !== V.lastPat) { V.lastPat = b.pat; if (E.on.includes(pat) && V.pulseT < CAMP.pulse[s] * 0.5) { campPulse(V, false); V.pulseT = CAMP.pulse[s]; } }
    if ((b.bphase || 0) > V.bphase) { V.bphase = b.bphase; campPulse(V, true); V.pulseT = CAMP.pulse[s]; }
    if (V.pulseT <= -CAMP.pulse[s]) { campPulse(V, false); V.pulseT = CAMP.pulse[s]; }
  }
  // Boss beaten (both twins): the wave is beaten. Whatever is left is rinsed out.
  if (V.phase === 'boss' && !G.boss && !G.revive) {
    V.phase = 'done';
    for (const e of G.enemies) {
      if (e.dead || e.charmed || e.egg || e.rival) continue;
      e.dead = true; spawnPart(e.x, e.y, '#ffffff', 3, 70, 0.4);
      if (e.xp && Math.random() < 0.5) dropGem(e.x, e.y, e.xp);
    }
    waveClear(V);
    if (V.n >= CAMP.waves) after(1.2, campWin);
  }
}
function campBoss(V) {
  V.phase = 'boss';
  const s = bossSlot(V.n);
  G.bossCount = s;
  spawnBoss();
  for (const e of [G.boss, G.boss && G.boss.twin]) {
    if (!e) continue;
    e.hp = e.maxHp = e.def.hp * CAMP.hp[s] * (1 + PT() / 600) * (V.boss === 'failed' ? 1.4 : 1); // (alone, so a little tougher)
    e.armour = e.def.armour + s;
    e.campK = CAMP.hit[s]; // (its attacks: softer in the first boss wave, while your build is thin)
  }
  V.lastPat = G.boss ? G.boss.pat : -1;
}
// Wave 20 beaten: IVF. The scientist drops you onto the egg in the middle of the dish.
function campWin() {
  if (!G || G.state === 'over' || G.state === 'finale') return;
  META.waveWins = (META.waveWins || 0) + 1; saveMeta();
  sysMsg('THE SCIENTIST', `"${CAMP.waves} for ${CAMP.waves}. Remarkable. Pass me the egg." In vitro, in the end. It still counts.`, XR.dim, true);
  G.wave.won = true;
  victory(null);
}
const endlessOpen = () => (META.waveWins || 0) > 0;

// ---------------------------------------------------------------- the Failed Experiment
// A copy of one of your past runs (a lost one if you have any): its sequence's colour, its level, and an
// attack for each weapon it carried. Built when the run starts, so the same copy turns up when its wave comes.
const FAILED_MOVES = { blaster: 'aimedFan', shotgun: 'aimedFan', wedding: 'aimedFan', glaive: 'doubleSpiral', seeker: 'spiral', genegun: 'doubleSpiral', tesla: 'ring', banjo: 'flower', karma: 'ring',
  venom: 'acidrain', moonshine: 'acidrain', mines: 'acidrain', flamer: 'firering', redtape: 'firering', frost: 'ring', void: 'spiral', orbit: 'flower', paddle: 'charge', flail: 'charge', onesie: 'ring', peekaboo: 'blink', ghosts: 'blink', dejavu: 'spiral' };
function failedExperimentDef() {
  const past = (typeof RUNLOG !== 'undefined' ? RUNLOG : []).filter(r => r && r.w && r.w.length && r.lvl >= 5);
  if (!past.length) return null;
  const lost = past.filter(r => r.res !== 'WON'), r = pick((lost.length ? lost : past).slice(-12));
  const wids = r.w.map(s => (s.match(/^[a-z]+/) || [''])[0]).filter(id => WEAPONS[id]);
  const moves = [...new Set(wids.map(id => FAILED_MOVES[id] || 'aimedFan'))].slice(0, 4);
  while (moves.length < 3) moves.push(['aimedFan', 'spiral', 'ring'][moves.length]);
  const seq = (r.seq || '').split('+')[0], col = (SEQ_LOOK[seq] || {}).color || '#d6e4f0';
  const pool = []; for (const b of BOSSES) for (const id of b.relics) if (!G.relics[id]) pool.push(id);
  return {
    id: 'failed', name: 'THE FAILED EXPERIMENT', title: `Subject ${r.n}: you, ${r.at || 'a while ago'}`, run: '#' + r.n, shape: 'sperm', color: col,
    hp: 2600 + r.lvl * 25, speed: 78, armour: 3 + Math.floor(r.lvl / 20), r: 38, dmg: 28, xp: 90, patterns: moves,
    quote: 'I know every move you are about to make. I made them first.',
    desc: `A copy of your run #${r.n} (Lv ${r.lvl}${r.seq ? ', ' + r.seq : ''}), grown back in the dish. It fights with what that run carried: ${wids.map(id => WEAPONS[id].name).join(', ') || 'nothing much'}.`,
    strengths: ['Fights alone, with your old weapons', `Lv ${r.lvl} of experience`], weaknesses: ['It only knows the old build', 'No entourage to hide behind'],
    relics: shuffle(pool).slice(0, 3),
  };
}
