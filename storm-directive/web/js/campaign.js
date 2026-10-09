'use strict';
// Spawn Prawn - wave mode (Sample 002, the default). Eight drops into the Petri Dish, each built around one
// boss. Every wave opens with the boss's entourage (a warm-up act chosen to suit it), then the boss drops in,
// and from then on its supporting cast arrives on cue, timed to its moves: snacks just before the Queen feeds,
// shooters behind the Colossus's wall, Chad's gym buddies while he dashes. Beat the boss and the wave is beaten
// (whatever is left is rinsed out). Beat all eight and the scientist fertilises you in the dish: a win.
// Hooks (waves.js): campInit (initWaves), campBegin (waveBegin), campSpawn (waveSpawn), campTick (waveTick).

const CAMP = {
  waves: 8,
  lead: [30, 18, 15, 14, 12, 12, 11, 10],         // seconds of warm-up act before the boss drops in
  hp: [0.45, 3.5, 11, 26, 58, 110, 190, 320],          // boss health, times its base
  pulse: [7, 7, 6.5, 6.5, 6, 6, 5.5, 5],            // seconds between entourage cues during the fight (at least)
};
// Who comes with each boss, where they arrive, and which of its moves cue them.
//   at: near (round the boss), behind (on the far side of the boss from you), ring (round you), flank (from both sides).
const ENTOURAGE = {
  queen:    { mix: ['crawler', 'crawler', 'skitter', 'wisp', 'krill'], at: 'near', on: ['summon', 'devour'], line: 'Snacks for the Queen. She eats her own to heal: get to them before she does.' },
  colossus: { mix: ['spitter', 'spitter', 'bulwark', 'crawler'], at: 'behind', on: ['charge'], line: 'Antibodies, shooting from behind the wall. He charges; they cover him.' },
  eye:      { mix: ['blinker', 'spitter', 'skitter', 'phantom'], at: 'ring', on: ['glare', 'blink'], line: 'While the Eye glares at you, everything else closes in.' },
  matron:   { mix: ['brute', 'medic', 'bulwark', 'charger'], at: 'near', on: ['wardround'], line: 'Patients for her ward round. Everything she heals comes back for more.' },
  pepsin:   { mix: ['bomber', 'bomber', 'splitter', 'crawler'], at: 'flank', on: ['acidrain'], line: 'Acid bubbles roll in from the sides whenever it rains acid.' },
  alpha:    { mix: ['charger', 'skitter', 'skitter', 'wisp'], at: 'ring', on: ['dash3'], line: 'His gym buddies charge in while he dashes. Do not skip leg day.' },
  fever:    { mix: ['spitter', 'bomber', 'crawler', 'warlock'], at: 'ring', on: ['firering'], line: 'Shooters on the outside keep you penned in his rings of heat.' },
  twins:    { mix: ['splitter', 'splitter', 'crawler', 'medic'], at: 'near', on: ['charge', 'spiral'], line: 'Mitotic cells, dividing round the twins.' },
};
const DROP_NAMES = { queen: 'Feeding Time', colossus: 'Border Control', eye: 'Peer Review', matron: 'Ward Nine', pepsin: 'Indigestion', alpha: 'Leg Day', fever: 'Forty-One Degrees', twins: 'Double Dose' };

const campOn = () => !!(G && G.wave && G.wave.camp);
const V0 = () => G.wave;
function campInit() {
  const V = G.wave;
  V.camp = true;
  // All eight bosses, one per wave, in a random order: the first two from the gentler openers, and the two
  // hardest-hitting kept for the back half.
  const ids = BOSSES.map(b => b.id), open = shuffle(['pepsin', 'twins', 'eye'].filter(id => ids.includes(id))).slice(0, 2);
  const late = ['alpha', 'fever'].filter(id => ids.includes(id)), rest = shuffle(ids.filter(id => !open.includes(id) && !late.includes(id)));
  const order = open.concat(rest.slice(0, 2), shuffle(rest.slice(2).concat(late)));
  G.bossRoster = order.slice(0, CAMP.waves);
  G.bossCount = 0;
}
const campBossId = n => G.bossRoster[(n - 1) % G.bossRoster.length];

function campBegin(V) {
  const id = campBossId(V.n), B = bossDef(id), E = ENTOURAGE[id] || ENTOURAGE.queen, i = V.n - 1;
  V.boss = id; V.phase = 'lead'; V.leadT = CAMP.lead[i] || 10; V.pulseT = 0; V.lastPat = -1; V.bphase = 0;
  V.leadN = Math.round((10 + V.n * 6) * G.P.spawnMult); V.leadDone = 0;
  V.budget = 1; V.spawned = 0; // (the HUD counts the boss)
  const p = me(), a = Math.random() * TAU, x = p.x + Math.cos(a) * 160, y = p.y + Math.sin(a) * 160;
  G.fx.push({ type: 'drop', x, y, r: 26, color: '#ffffff', life: 0.7, max: 0.7 });
  after(0.7, () => { ring(x, y, 160, '#ffffff', 0.8, 8); ring(x, y, 300, '#ffffff', 1.1, 4); cam.shake = 8; sfx('boom'); });
  banner(`WAVE ${V.n} OF ${CAMP.waves}: ${(DROP_NAMES[id] || 'THE DROP').toUpperCase()}`, PAL.reward);
  sysMsg('THE SCIENTIST', `"${B.name.replace(/^THE /, 'The ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}, and friends." ${E.line}`, XR.dim, true);
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
  const d = ENEMIES[id], k = Math.max(1, Math.ceil((d.group || 1) * 0.5));
  for (let j = 0; j < k; j++) { if (G.enemies.length >= CAPS.enemies) return k; G.enemies.push(makeEnemy(d, x + rand(-25, 25), y + rand(-25, 25), { elite: elite && j === 0 })); }
  return k;
}
function campPulse(V, big) {
  const E = ENTOURAGE[V.boss] || ENTOURAGE.queen, n = Math.round(Math.min(20, 4 + V.n * 1.6) * (big ? 1.6 : 1) * G.P.spawnMult);
  let made = 0;
  for (let i = 0; made < n && i < n * 2; i++) made += campSpawnOne(E, V.n, big && i === 0 && V.n >= 3);
  if (G.boss && !G.boss.dead) ring(G.boss.x, G.boss.y, G.boss.r * 2.4, '#ffffff', 0.4, 3);
}
// From the director, every frame of a wave.
function campSpawn(dt, maxAlive, hostile) {
  const V = G.wave;
  if (!V.active) return;
  const E = ENTOURAGE[V.boss] || ENTOURAGE.queen;
  if (V.phase === 'lead') {
    // The warm-up act: fed in steadily, a burst from the splash first.
    const want = V.leadN * Math.min(1, (V.t + 2) / V.leadT);
    while (V.leadDone < want && hostile < maxAlive) { V.leadDone += campSpawnOne(E, V.n, V.n >= 4 && Math.random() < 0.05); hostile++; }
    return;
  }
  // The fight: a light trickle, plus cues from the boss's moves (below, campTick).
  G.spawnAcc += (1.2 + V.n * 0.35) * G.P.spawnMult * dt;
  while (G.spawnAcc >= 1 && hostile < maxAlive * 0.7) { G.spawnAcc--; campSpawnOne(E, V.n, false); hostile++; }
  if (G.spawnAcc > 3) G.spawnAcc = 3;
}
function campTick(dt) {
  const V = G.wave;
  if (V.phase === 'lead') {
    V.leadT -= dt;
    if (V.leadT <= 0 && G.state === 'play') campBoss(V);
    return;
  }
  const b = G.boss;
  if (V.phase === 'boss' && b && !b.dead) {
    // Cues: a new move from the boss's list of triggers, an enrage, or a lull that has gone on too long.
    const E = ENTOURAGE[V.boss] || ENTOURAGE.queen, pat = b.def.patterns[b.pat];
    V.pulseT -= dt;
    if (b.pat !== V.lastPat) { V.lastPat = b.pat; if (E.on.includes(pat) && V.pulseT < CAMP.pulse[V.n - 1] * 0.5) { campPulse(V, false); V.pulseT = CAMP.pulse[V.n - 1]; } }
    if ((b.bphase || 0) > V.bphase) { V.bphase = b.bphase; campPulse(V, true); V.pulseT = CAMP.pulse[V.n - 1]; }
    if (V.pulseT <= -CAMP.pulse[V.n - 1]) { campPulse(V, false); V.pulseT = CAMP.pulse[V.n - 1]; }
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
  G.bossCount = V.n - 1;
  spawnBoss();
  const k = CAMP.hp[V.n - 1] || CAMP.hp[CAMP.hp.length - 1];
  for (const e of [G.boss, G.boss && G.boss.twin]) {
    if (!e) continue;
    e.hp = e.maxHp = e.def.hp * k * (1 + PT() / 600);
    e.armour = e.def.armour + Math.floor(V.n / 3);
  }
  V.lastPat = G.boss ? G.boss.pat : -1;
}
// All eight beaten: IVF. The scientist drops you onto the egg in the middle of the dish.
function campWin() {
  if (!G || G.state === 'over' || G.state === 'finale') return;
  META.waveWins = (META.waveWins || 0) + 1; saveMeta();
  sysMsg('THE SCIENTIST', '"Eight for eight. Remarkable. Pass me the egg." In vitro, in the end. It still counts.', XR.dim, true);
  G.wave.won = true;
  victory(null);
}
const endlessOpen = () => (META.waveWins || 0) > 0;
