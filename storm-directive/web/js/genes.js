'use strict';
// Spawn Prawn - genes: Epigenetic Profiles (pick a Primary Sequence before a run, splice in up to two more
// at half strength, each one ranks up with the kills it's expressed for) and Enzyme Vesicles (they pop up
// around the slide; burst one to staple one of four Mutations into your genome, up to a limited number).
// Hooks, called from the game: genesStart (newGame), genesTick (update), genesDamageMul / genesCrit /
// genesHit (damageEnemy), genesKill (killEnemy), genesHurt / genesLethal / genesArmour (hurtPlayer),
// genesPickup (applyPickup), genesRate / genesSpellRate / genesCast (weapons and spells), genesSpeed
// (updatePlayer), genesAdapt (computeStats), genesReload (startReload), genesMine (detonateMine).

// ================================================================ Epigenetic Profiles
// k is the trait's strength: 1 at Rank 1 as your Primary Sequence, half that when spliced in, doubling with
// each rank. Every apply() is additive, so a trait can be taken off again (-k) and re-applied.
const PROFILE_RANKS = [0, 5000, 25000]; // kills while expressed: Rank 2 at 5,000, Rank 3 after 20,000 more
const PROFILES = {
  vanguard: { name: 'The Vanguard', trait: 'Quick Reflexes', fmt: k => `+${pc(0.12 * k)} reload speed`, apply: (P, k) => { P.reloadSpd += 0.12 * k; },
    desc: 'The default sequence. Simple, honest flagellar violence.', weapons: ['blaster', 'seeker', 'glaive'] },
  bruiser: { name: 'The Bruiser', trait: 'Cellular Armour', fmt: k => `+${+(1 * k).toFixed(1)} armour`, apply: (P, k) => { P.armour += 1 * k; },
    desc: 'A thick, disgusting layer of armour on the outer membrane. Built to take a beating.', weapons: ['shotgun', 'paddle', 'onesie', 'mines'] },
  nerd: { name: 'The Mitochondrial Nerd', trait: 'Overclocked Organelles', fmt: k => `+${pc(0.06 * k)} fire rate, spells recharge ${pc(0.06 * k)} faster`, apply: (P, k) => { P.haste += 0.06 * k; P.cdr -= 0.06 * k; },
    desc: 'Lets the mitochondria do the work. Static, sparks and things that hum.', weapons: ['tesla', 'twin', 'void'] },
  eggseeker: { name: 'The Egg-Seeker', trait: 'Killer Instinct', fmt: k => `+${pc(0.04 * k)} crit chance, +${pc(0.15 * k)} crit damage`, apply: (P, k) => { P.crit += 0.04 * k; P.critDmg += 0.15 * k; },
    desc: 'Slow, heavy, precise. Built to execute bosses, not to chew through crowds.', weapons: ['duedate', 'frost', 'toothfairy'],
    unlock: { text: 'Survive 10 minutes in a single run', have: () => Math.floor(META.life.bestT / 60), need: 10 } },
  stealth: { name: 'The Stealth-Tadpole', trait: 'Up Close and Personal', fmt: k => `+${pc(0.12 * k)} melee and trail damage, +${pc(0.02 * k)} dodge`, apply: (P, k) => { P.meleeK += 0.12 * k; P.dodge += 0.02 * k; },
    desc: 'No spitting. Grows something sharp and swims straight through the meat grinder.', weapons: ['flail', 'wake', 'peekaboo'],
    unlock: { text: 'Beat 25 bosses (all runs)', have: () => META.life.bosses, need: 25 } },
  pusher: { name: 'The Enzyme-Pusher', trait: 'Self-Repair', fmt: k => `+${+(0.5 * k).toFixed(1)} HP/s regeneration`, apply: (P, k) => { P.regen += 0.5 * k; },
    desc: 'Aggressive self-healing, infections and freezing spit.', weapons: ['parasite', 'bubble', 'orbit'],
    unlock: { text: 'Pick up 100 power-ups (all runs)', have: () => META.life.pickups, need: 100 } },
  acid: { name: 'The Acid-Burner', trait: 'Burning Membrane', fmt: k => `up to +${pc(0.12 * k)} damage, the closer you are to bursting`, apply: () => {},
    desc: 'Melts things. Gets angrier the more you are hurt.', weapons: ['venom', 'flamer', 'redtape'],
    unlock: { text: 'Deal 2,000,000 elemental damage (all runs)', have: () => Math.floor(META.life.elem), need: 2e6 } },
  splicer: { name: 'The Gene-Splicer', trait: 'Fluid Amplifier', fmt: k => `your other sequences' traits are ${pc(Math.min(1, 0.25 * k))} stronger, +${pc(0.05 * k)} area`, apply: (P, k) => { P.area += 0.05 * k; },
    desc: 'Clever, strange and a bit of everything. Makes every other gene work harder.', weapons: ['friend', 'crayon', 'siphon'],
    unlock: { text: 'Cast 1,500 spells (all runs)', have: () => META.life.casts, need: 1500 } },
};
// Two sequences expressed together unlock a little extra.
const PROFILE_SYNERGIES = [
  { a: 'vanguard', b: 'nerd', name: 'Static Reload', desc: 'Every reload sends a spark into the two nearest enemies.' },
  { a: 'vanguard', b: 'acid', name: 'Scorched Trail', desc: 'You leave small burning patches behind you as you swim.' },
  { a: 'bruiser', b: 'pusher', name: 'Fury Mends', desc: 'Below half health, your regeneration doubles (and you get +1 HP/s).' },
  { a: 'bruiser', b: 'acid', name: 'Acid Mines', desc: 'Nappy Mines leave a burning puddle where they go off.' },
  { a: 'eggseeker', b: 'stealth', name: 'Assassin', desc: 'Hits on enemies at full health always crit.' },
];
const profUnlocked = id => { const u = PROFILES[id].unlock; return !u || u.have() >= u.need; };
const profKills = id => (META.prof[id] && META.prof[id].kills) || 0;
const profRank = id => profKills(id) >= PROFILE_RANKS[2] ? 3 : profKills(id) >= PROFILE_RANKS[1] ? 2 : 1;
const genesOn = id => !!(G && G.genes && G.genes.active.includes(id));
const synOn = (a, b) => genesOn(a) && genesOn(b);
function profK(id, primary) { return [1, 2, 4][profRank(id) - 1] * (primary ? 1 : 0.5); }

// Re-apply every active trait (after a splice or a rank-up).
function genesReapply() {
  const g = G.genes, P = G.P;
  for (const [id, k] of g.applied) PROFILES[id].apply(P, -k);
  g.applied = [];
  g.k = {};
  const amp = g.active.includes('splicer') ? 1 + Math.min(1, 0.25 * profK('splicer', g.primary === 'splicer')) : 1;
  for (const id of g.active) {
    const k = profK(id, id === g.primary) * (id === 'splicer' ? 1 : amp);
    PROFILES[id].apply(P, k); g.applied.push([id, k]); g.k[id] = k;
  }
  if (typeof recomputeAll === 'function' && G.weapons) recomputeAll();
}
function genesSplice(id) {
  if (G.genes.active.includes(id) || G.genes.active.length >= 3) return;
  G.genes.active.push(id);
  genesReapply();
  banner('SPLICED: ' + PROFILES[id].name.toUpperCase(), PAL.upgrade);
}

// ================================================================ Mutations (from Enzyme Vesicles)
// tier: 0 common, 1 rare, 2 epic (the card's rarity). apply: once, when you take it. Everything else is a hook
// that looks at G.mut.
const MUTATIONS = {
  spite:       { tier: 1, name: 'The Squelching Spore of Spite', desc: 'Get hit and you burst: a blast of gross inside-juice hits everything near you and shoves it away. Clean-up on aisle everywhere.' },
  stemcell:    { tier: 1, name: 'Wet Noodle of Life', desc: '+1 HP/s regeneration for every 200 max HP you have. It throbs. Do not look directly at it.' },
  macjaw:      { tier: 0, name: 'Ripped-Off Macrophage Jaw', desc: 'Weapons +10% damage and +5% crit chance. Spells -10% damage. You pulled the mouth off a white blood cell, you absolute sicko.', apply: P => { P.wDmg += 0.1; P.crit += 0.05; P.sDmg -= 0.1; } },
  nuhuh:       { tier: 0, name: 'The "Nuh-Uh" Suppressor', desc: '+2 rerolls right now and +10% luck, which you need, because your genetics are rubbish.', apply: P => { P.luck += 0.1; G.rerolls += 2; } },
  jittery:     { tier: 0, name: "Jittery Lil' Flagella", desc: '+5% dodge chance, +2.5% swim speed. Wiggle, little microbe, wiggle.', apply: P => { P.dodge += 0.05; P.speed += 0.025; } },
  tcells:      { tier: 1, name: 'Murder-Happy T-Cells', desc: '+30% damage to elites, bosses and rival champions. They carry tiny microscopic shivs.' },
  soup:        { tier: 0, name: 'Forbidden Soup', desc: '+2 HP/s regeneration, but -15% max HP. Tastes like dirty foot water. Delicious.', apply: P => { P.regen += 2; P.maxHp = Math.round(P.maxHp * 0.85); G.player.hp = Math.min(G.player.hp, P.maxHp); } },
  sludge:      { tier: 1, name: 'Sticky Floor Sludge', desc: 'Stay still and a crust of grossness builds up around you: up to +30% damage after 3s. Swimming wears it off.' },
  receptors:   { tier: 0, name: 'Greedy Little Receptors', desc: '+30% pickup range, for when you are too lazy to swim over to your food.', apply: P => { P.magnet += 0.3; } },
  sugardaddy:  { tier: 1, name: 'Sugar Daddy Vacuole', desc: '+1% crit chance for every 100 max HP you have. Sweet, sweet diabetic energy.' },
  powerhouse:  { tier: 1, name: 'The Mitochondria Is the Powerhouse', desc: 'Killing a boss: 6s of +25% fire rate, and your spells recharge 25% faster. Say it with me.' },
  magbact:     { tier: 0, name: 'Creepy Magnetic Bacteria', desc: '+5% swim speed, and you hit up to 15% harder the faster you swim. How do magnets work? Nobody knows.', apply: P => { P.speed += 0.05; P.momentum += 0.1; } },
  vippass:     { tier: 1, name: 'VIP DNA Pass', desc: '+20% luck, so your DNA strands come out rarer. Oh, aren\'t you a special little germ.', apply: P => { P.luck += 0.2; } },
  bipolar:     { tier: 1, name: 'Bipolar Metabolism', desc: 'Fire, ice and shock +40%. Physical, poison and arcane -10%. You run hot, you run cold.', apply: P => { P.elem.fire += 0.4; P.elem.ice += 0.4; P.elem.shock += 0.4; P.elem.phys -= 0.1; P.elem.poison -= 0.1; P.elem.arcane -= 0.1; } },
  velcro:      { tier: 1, name: 'Clingy Cell Velcro', desc: 'Alone (nothing within 250): +15% swim speed. In a crowd (8 or more): +3 armour. Anything in between: +10% damage.' },
  zappy:       { tier: 0, name: 'Zappy Grabbers', desc: '+30% pickup range, and picking up any power-up pulls in every XP granule near you. Zap zap, give me the snacks.', apply: P => { P.magnet += 0.3; } },
  frostbitten: { tier: 1, name: 'Frostbitten Cell Wall', desc: 'Every hit you take: +1 max HP (up to +150), and +1 armour for every 50 hits. You cold, unfeeling monster.' },
  bonk:        { tier: 0, name: 'Blunt Force Phage Trauma', desc: 'Physical hits have a 4% chance to stun what they hit (1% on bosses, briefly). Bonk.' },
  overachiever:{ tier: 2, name: 'The Overachieving Leukocyte', desc: 'Weapon hits on enemies at full health always crit. Because forget that guy in particular.' },
  chernobyl:   { tier: 2, name: 'Chernobyl Juice', desc: 'Double damage. Half max HP. Live fast, die violently in a puddle of your own dissolving cytoplasm.', apply: P => { P.might *= 2; P.maxHp = Math.round(P.maxHp * 0.5); G.player.hp = Math.min(G.player.hp, P.maxHp); } },
  bonejuice:   { tier: 0, name: 'Bone Hurting Juice', desc: '+1 max HP for every 15 kills (elites count as 5), up to +100. Drink your milk, you invertebrate.' },
  skeletonkey: { tier: 1, name: 'The Skeleton Key-Protein', desc: 'Every Enzyme Vesicle has a 30% chance to let you take two mutations.' },
  proteinchug: { tier: 0, name: 'Pulsing Protein Chug', desc: 'Glucose Hits heal three times as much, and all healing is 20% stronger. Chug! Chug! Chug!', apply: P => { P.healMult += 0.2; } },
  heavymetal:  { tier: 0, name: 'Heavy Metal Poisoning', desc: 'Power-ups drop from enemies twice as often. Aggressive cellular headbanging.' },
  lube:        { tier: 0, name: 'Lube-Tastic Myelin', desc: '+10% swim speed and +30% grip. Slippery little sucker, aren\'t you?', apply: P => { P.speed += 0.1; P.traction += 0.3; } },
  sniperrna:   { tier: 1, name: 'Sniper RNA', desc: 'Your spells always crit on enemies at full health, and crits hit 25% harder. Boom. Headshot.', apply: P => { P.critDmg += 0.25; } },
  corpsefarts: { tier: 0, name: 'Gassy Corpse Farts', desc: 'Poisoned enemies leave a cloud of toxic gas when they die. Blue cheese, despair and a changing room.' },
  tasernoodle: { tier: 1, name: 'The Taser Noodle', desc: 'Shocked enemies pass a jolt to a neighbour every second. Dance, little cells, dance.' },
  combustion:  { tier: 1, name: 'Spontaneous Combustion Core', desc: 'Burning enemies can burst (about 1 in 10 each second) in a small fiery blast. Pop, pop, squelch.' },
  coldshoulder:{ tier: 0, name: 'The Cold Shoulder', desc: 'Frozen enemies chill everything near them.' },
  spicybrain:  { tier: 0, name: 'Spicy Brain Chemicals', desc: 'Shock damage +30%.', apply: P => { P.elem.shock += 0.3; } },
  zombiecore:  { tier: 2, name: 'Zombie Cell Core', desc: 'Once, when you would die, you come back on 50% health. After that you are a zombie: -50% max HP for the rest of the run. Surprise!' },
  buffet:      { tier: 0, name: 'The Buffet Bounty', desc: '+10% XP. You greedy little germ.', apply: P => { P.xp += 0.1; } },
  payload:     { tier: 1, name: 'Massive Spermatozoa Payload', desc: 'Weapons with a magazine bigger than 1 hold twice as much. That is a lot of squirming little swimmers.' },
  ointment:    { tier: 1, name: 'Miracle Phage Ointment', desc: 'Heals you fully now, +40 max HP, and every 5th Glucose Hit heals you fully. Ahh, refreshing.', apply: P => { P.maxHp += 40; G.player.hp = P.maxHp; } },
  hackerman:   { tier: 1, name: 'Hackerman RNA', desc: 'Every crit gives +0.5% fire rate for 2s (up to +25%). You are in the mainframe now.' },
  turbo:       { tier: 0, name: 'Turbo-chondrial Engine', desc: 'Every spell cast has a 15% chance to recharge twice as fast. Tweak it out.' },
  greedyhands: { tier: 1, name: 'Swarm of Greedy Hands', desc: 'Every timed power-up also gives you another random one. +20% pickup range. Mine. Mine. Mine.', apply: P => { P.magnet += 0.2; } },
  roidrage:    { tier: 1, name: 'Roid-Rage Vesicles', desc: 'A Glucose Hit picked up at full health: +50% damage for 20s. Do you even divide, bro?' },
  plaguemask:  { tier: 0, name: "Plague Doctor's Snot Rag", desc: 'Poison +30%, shock -20%.', apply: P => { P.elem.poison += 0.3; P.elem.shock -= 0.2; } },
  tooangry:    { tier: 2, name: 'Too Angry to Die', desc: 'A hit that would burst you leaves you on 1 HP instead. Once every 90s.' },
  allnighter:  { tier: 0, name: 'All-Nighter Override', desc: 'Timed power-ups (Adrenaline, Shield, Stasis) last twice as long. Who needs sleep?' },
  codependency:{ tier: 1, name: 'Toxic Co-Dependency', desc: 'Getting hit instantly reloads a random weapon and recharges a random spell (every 2s at most). Stop hitting yourself!' },
  mystery:     { tier: 1, name: 'Mystery Meat Cyst', desc: 'This one is a secret. Maybe it does something cool. Maybe it gives you space herpes.' },
  pointy:      { tier: 1, name: 'Sharp Pointy Bits', desc: 'Physical +40%. Fire, ice and shock -10%. Stab stab stab.', apply: P => { P.elem.phys += 0.4; P.elem.fire -= 0.1; P.elem.ice -= 0.1; P.elem.shock -= 0.1; } },
  peerpressure:{ tier: 0, name: 'Peer Pressure Ring', desc: 'Every elite or boss that dies near you: +5% damage for 10s, stacking 5 times. All the cool germs are doing it.' },
  rerolldice:  { tier: 0, name: 'The Re-Roller of Dice', desc: 'The first reroll on every card screen is free.' },
  slappy:      { tier: 0, name: 'Wet Slappy Pseudopod', desc: '+20% crit chance against enemies that are slowed, frozen, poisoned or burning. Slap them while they are down.' },
  salad:       { tier: 0, name: 'Stolen Salad Parts', desc: '+5% fire rate, and spells recharge 5% faster. You are part plant now. Go photosynthesise.', apply: P => { P.haste += 0.05; P.cdr -= 0.05; } },
  brainfreeze: { tier: 0, name: 'Brain-Freeze Protein', desc: 'Ice +30%, fire -20%.', apply: P => { P.elem.ice += 0.3; P.elem.fire -= 0.2; } },
  pustule:     { tier: 0, name: 'Disgusting Popping Pustule', desc: "Fire +30%, ice -20%. Don't squeeze it. Or do. I want to watch.", apply: P => { P.elem.fire += 0.3; P.elem.ice -= 0.2; } },
  runningjuice:{ tier: 0, name: 'Running Juice', desc: '+2 HP/s regeneration while you swim fast. Keep running, little swimmer.' },
  sugarrush:   { tier: 0, name: 'Sugar Rush', desc: 'Killing an elite: 3s of +25% fire rate.' },
  trojan:      { tier: 0, name: 'Surprise Package', desc: 'Popping an Enzyme Vesicle blows everything near you away. A Trojan virus, but rude.' },
  waterbear:   { tier: 1, name: 'Indestructible Water Bear Armour', desc: 'Rerolls have a 35% chance not to be used up. +5% luck.', apply: P => { P.luck += 0.05; } },
  snottrail:   { tier: 0, name: 'Snot Trail', desc: '+5% swim speed, poison +5%. You are leaving a sticky mess all over my nice clean floor.', apply: P => { P.speed += 0.05; P.elem.poison += 0.05; } },
  stiff:       { tier: 0, name: 'Stiff as a Board', desc: '+10% dodge chance, -20% swim speed.', apply: P => { P.dodge += 0.1; P.speed -= 0.2; } },
  leech:       { tier: 0, name: 'The Leechy Parasite', desc: 'Hits heal you a little (within the lifesteal limit).', apply: P => { P.lifesteal += 0.6; } },
  toothpick:   { tier: 0, name: 'Wooden Toothpick', desc: 'Weapons and spells -5% damage. +25% XP. It is literally just a piece of wood.', apply: P => { P.wDmg -= 0.05; P.sDmg -= 0.05; P.xp += 0.25; } },
  origami:     { tier: 0, name: 'Origami Protein', desc: 'Spells +15% damage. Weapons -10% damage.', apply: P => { P.sDmg += 0.15; P.wDmg -= 0.1; } },
  ohno:        { tier: 2, name: 'The "Oh No" Button', desc: 'Every element at normal strength or weaker gets +25%; any already boosted loses 10%. Absolute cellular chaos.', apply: P => { for (const el in P.elem) P.elem[el] += P.elem[el] <= 1 ? 0.25 : -0.1; } },
};
const VESICLE = { first: 40, every: [45, 70], max: 2, life: 60, slots: 6, near: [450, 900] };
const mutOn = id => !!(G && G.mut && G.mut[id]);
const mutCap = () => VESICLE.slots + (META.ranks.incubated || 0);
const mutCount = () => Object.keys(G.mut || {}).filter(id => !G.mutHidden || !G.mutHidden[id]).length;

// ================================================================ run start (from newGame, after applyMeta)
function genesStart(G) {
  G.mut = {}; G.mutHidden = {}; G.mutT = {}; G.vesicles = []; G.nextVesicle = VESICLE.first;
  const id = PROFILES[META.profile] && profUnlocked(META.profile) ? META.profile : 'vanguard';
  G.genes = { primary: id, active: [id], applied: [], k: {} };
  G.P.wDmg = 1; G.P.sDmg = 1; G.P.meleeK = 1;
  const P = G.P;
  for (const [pid, k] of G.genes.applied) PROFILES[pid].apply(P, -k);
  G.genes.applied = [];
  const k = profK(id, true);
  PROFILES[id].apply(P, k); G.genes.applied.push([id, k]); G.genes.k[id] = k;
  G.player.hp = Math.max(G.player.hp, P.maxHp);
}

// ================================================================ loot: vesicles and splices (from genLoot)
function vesicleOpts() {
  const pool = shuffle(Object.keys(MUTATIONS).filter(id => !G.mut[id]));
  return pool.slice(0, 4).map(id => {
    const M = MUTATIONS[id];
    return { rarity: [1, 3, 4][M.tier], tag: 'MUTATION', icon: M.name.replace(/^The /, '').replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(), color: PAL.upgrade,
      title: M.name, sub: `Enzyme Vesicle | genome ${mutCount()}/${mutCap()}`, desc: M.desc, apply: () => mutTake(id) };
  });
}
function mutTake(id) {
  const M = MUTATIONS[id];
  G.mut[id] = true;
  META.muts = META.muts || {}; META.muts[id] = true;
  if (M.apply) M.apply(G.P);
  if (id === 'mystery') {
    // A hidden mutation, revealed in the Codex once you've had it.
    const pool = Object.keys(MUTATIONS).filter(x => x !== 'mystery' && !G.mut[x] && !['zombiecore', 'chernobyl'].includes(x));
    const h = pick(pool); G.mut[h] = true; G.mutHidden[h] = true; META.muts[h] = true;
    if (MUTATIONS[h].apply) MUTATIONS[h].apply(G.P);
  }
  recomputeAll();
  floatText(me().x, me().y - 40, M.name.toUpperCase(), PAL.upgrade, 13, 1.2);
}
function spliceOpts() {
  const ids = Object.keys(PROFILES).filter(id => profUnlocked(id) && !G.genes.active.includes(id));
  return shuffle(ids).slice(0, 3).map(id => {
    const Pr = PROFILES[id], r = profRank(id);
    return { rarity: 4, tag: 'SPLICE A SEQUENCE', icon: Pr.name.replace(/^The /, '').slice(0, 2).toUpperCase(), color: PAL.upgrade, title: Pr.name,
      sub: `Rank ${r} | spliced in at half strength`, desc: `${Pr.trait}: ${Pr.fmt(profK(id, false))}. Adds its exclusive weapons to your drafts: ${Pr.weapons.map(w => WEAPONS[w].name).join(', ')}.` + profSynText(id),
      apply: () => genesSplice(id) };
  });
}
function profSynText(id) {
  const s = PROFILE_SYNERGIES.filter(q => (q.a === id && genesOn(q.b)) || (q.b === id && genesOn(q.a)));
  return s.length ? ' With what you already express: ' + s.map(q => q.name + ' (' + q.desc + ')').join(' ') : '';
}
// Splice offers come at these levels while you have room for another sequence.
const SPLICE_LEVELS = [6, 18]; // just before the weapon drafts at 8 and 22, so a splice widens them
function genesLevel(lvl) {
  if (!SPLICE_LEVELS.includes(lvl) || G.genes.active.length >= 3 || G.debug) return;
  if (Object.keys(PROFILES).some(id => profUnlocked(id) && !G.genes.active.includes(id))) { G.lootQueue.push({ kind: 'splice' }); banner('SEQUENCE SPLICE AVAILABLE', PAL.upgrade); }
}
// Every weapon belongs to exactly one sequence. Drafts only offer weapons from the sequences you express, plus
// any you've unlocked in the Gene Bank (those are wildcards: any sequence can draft them).
function seqPool(primaryOnly) {
  const ids = primaryOnly ? PROFILES[G.genes.primary].weapons : G.genes.active.flatMap(id => PROFILES[id].weapons);
  return [...new Set(ids.concat(Object.keys(META.starters || {}).filter(id => META.starters[id])))].filter(id => WEAPONS[id]);
}
const weaponSeq = id => Object.keys(PROFILES).find(p => PROFILES[p].weapons.includes(id));

// ================================================================ per frame (from update)
function genesTick(dt) {
  if (!G.genes) return;
  const p = G.player, P = G.P, T = G.mutT, sp = Math.hypot(p.vx || 0, p.vy || 0);
  // Vesicles.
  if (G.t >= G.nextVesicle && !G.debug) {
    G.nextVesicle = G.t + rand(VESICLE.every[0], VESICLE.every[1]);
    if (G.vesicles.length < VESICLE.max && mutCount() < mutCap()) {
      for (let tries = 0; tries < 12; tries++) {
        const a = Math.random() * TAU, d = rand(VESICLE.near[0], VESICLE.near[1]), x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
        if (Math.hypot(x, y) > CORE.arena - 80 || Math.hypot(x - G.core.x, y - G.core.y) < CORE.r + 60) continue;
        const v = unstick({ x, y, born: G.t, seed: Math.random() * 10 }, 26);
        G.vesicles.push(v);
        if (!G.vesSeen) { G.vesSeen = true; sysMsg('ENZYME VESICLE', 'A vesicle has bulged up somewhere on the slide. Follow the glow at the edge of the screen and burst it for a mutation.', PAL.upgrade, true); }
        break;
      }
    }
  }
  for (const v of G.vesicles) {
    if (G.t - v.born > VESICLE.life) { v.dead = true; continue; }
    if (Math.hypot(p.x - v.x, p.y - v.y) < p.r + 24) {
      v.dead = true;
      if (mutCount() >= mutCap()) { floatText(v.x, v.y - 20, 'GENOME FULL', PAL.danger, 14); continue; }
      G.lootQueue.push({ kind: 'vesicle' });
      G.vesTwo = mutOn('skeletonkey') && Math.random() < 0.3;
      fxParts('drop', v.x, v.y, '#e9f5db', 14, 220, 0.6, 4); ring(v.x, v.y, 70, PAL.upgrade, 0.4, 4); sfx('pickup');
      if (mutOn('trojan')) { aoe(p.x, p.y, 180, 40 * (1 + G.level * 0.12) * P.might, { elem: 'phys', wname: 'Surprise Package', knock: 400, noCrit: true }, '#e9f5db'); }
    }
  }
  compactArr(G.vesicles, v => !v.dead);
  // Regeneration-type mutations and the Fury Mends synergy.
  let heal = 0;
  if (mutOn('stemcell')) heal += Math.floor(P.maxHp / 200);
  if (mutOn('runningjuice') && sp > 100) heal += 2;
  if (synOn('bruiser', 'pusher') && p.hp < P.maxHp * 0.5) heal += P.regen + 1;
  if (heal > 0 && p.hp > 0) p.hp = Math.min(P.maxHp, p.hp + heal * dt);
  // Sticky Floor Sludge.
  if (mutOn('sludge')) G.sludge = clamp((G.sludge || 0) + (sp < 30 ? dt / 3 : -dt), 0, 1);
  // Clingy Cell Velcro: alone, crowd, or in between.
  if (mutOn('velcro') && !(T.velcroT > G.t)) {
    T.velcroT = G.t + 0.25; let n = 0;
    forNear(p.x, p.y, 250, e => { if (!e.charmed && !e.egg) n++; });
    G.velcro = n === 0 ? 'alone' : n >= 8 ? 'crowd' : 'mid';
  }
  // Status-spreading mutations, once a second.
  if (!(T.statT > G.t)) {
    T.statT = G.t + 1;
    let jolts = 0, pops = 0;
    for (const e of G.enemies) {
      if (e.dead || e.charmed) continue;
      if (mutOn('tasernoodle') && e.shock > 0 && jolts < 20) { const n = acquire('nearest', 140, e.x, e.y, e); if (n) { jolts++; bolt(e.x, e.y, n.x, n.y, ELEMENTS.shock.color, 0.12); damageEnemy(n, 6 + G.level * 0.8, { elem: 'shock', noArc: true, noCrit: true, wname: 'Taser Noodle' }); } }
      if (mutOn('combustion') && e.burn > 0 && pops < 6 && Math.random() < 0.1) { pops++; aoe(e.x, e.y, 70, e.burnDps * 3 + 10, { elem: 'fire', noStatus: true, noCrit: true, wname: 'Spontaneous Combustion' }, '#ff7a2f'); }
      if (mutOn('coldshoulder') && e.frozen > 0) forNear(e.x, e.y, 90, o => { if (o !== e && !o.boss) { o.chill = Math.max(o.chill, 1.2); o.chillAmt = Math.max(o.chillAmt, 0.3); } });
    }
  }
  // Scorched Trail (Vanguard + Acid-Burner).
  if (synOn('vanguard', 'acid') && sp > 60 && !(T.trailT > G.t)) {
    T.trailT = G.t + 0.6;
    G.zones.push({ x: p.x, y: p.y, r: 34, life: 2.5, max: 2.5, dps: 6 + G.level * 0.9, elem: 'fire', pull: 0, color: '#ff7a2f', tick: 0, src: { elem: 'fire', wname: 'Scorched Trail', noCrit: true } });
  }
}

// ================================================================ hit, crit, kill, hurt
function genesDamageMul(e, src) {
  if (!G.genes) return 1;
  let m = 1;
  if (mutOn('tcells') && (e.elite || e.boss || e.rival)) m *= 1.3;
  if (mutOn('sludge')) m *= 1 + 0.3 * (G.sludge || 0);
  if (mutOn('velcro') && G.velcro === 'mid') m *= 1.1;
  if (G.mutT.roidT > G.t) m *= 1.5;
  if (G.mutT.peerT > G.t) m *= 1 + 0.05 * (G.mutT.peerN || 0);
  if (genesOn('acid')) m *= 1 + (G.genes.k.acid || 0) * 0.12 * (1 - clamp(G.player.hp / G.P.maxHp, 0, 1));
  return m;
}
// Extra crit chance for this hit.
function genesCrit(e, src) {
  if (!G.genes) return 0;
  let c = 0;
  const full = e.hp >= e.maxHp - 0.01, spell = src.w && src.w.isSpell;
  if (full && ((mutOn('overachiever') && src.w && !spell) || (mutOn('sniperrna') && spell) || synOn('eggseeker', 'stealth'))) c += 1;
  if (mutOn('slappy') && (e.chill > 0 || e.frozen > 0 || e.poison > 0 || e.burn > 0)) c += 0.2;
  if (mutOn('sugardaddy')) c += 0.01 * Math.floor(G.P.maxHp / 100);
  return c;
}
function genesHit(e, dmg, src, crit) {
  if (!G.genes || src.dot) return;
  if (mutOn('bonk') && (src.elem || 'phys') === 'phys' && Math.random() < (e.boss ? 0.01 : 0.04)) { e.frozen = Math.max(e.frozen, e.boss ? 0.3 : 0.8); if (Math.random() < 0.3) floatText(e.x, e.y - e.r - 8, 'BONK', '#ffffff', 11, 0.5); }
  if (crit && mutOn('hackerman')) { const T = G.mutT; T.hackN = Math.min(50, (T.hackT > G.t ? T.hackN || 0 : 0) + 1); T.hackT = G.t + 2; }
}
function genesKill(e, src) {
  if (!G.genes || e.charmed) return;
  // Every kill counts towards the ranks of what you're expressing.
  let ranked = false;
  for (const id of G.genes.active) {
    const r = META.prof[id] || (META.prof[id] = { kills: 0 }), before = profRank(id);
    r.kills++;
    if (profRank(id) > before) { ranked = true; banner(`${PROFILES[id].name.toUpperCase()}: RANK ${profRank(id)}`, PAL.upgrade); sysMsg('SEQUENCE EVOLVED', `${PROFILES[id].name} reached Rank ${profRank(id)}: ${PROFILES[id].trait} doubles.`, PAL.upgrade, true); }
  }
  if (ranked) genesReapply();
  const T = G.mutT, p = G.player;
  if (mutOn('bonejuice')) { T.boneN = (T.boneN || 0) + (e.elite ? 5 : 1); if (T.boneN >= 15 && (T.boneHp || 0) < 100) { T.boneN -= 15; T.boneHp = (T.boneHp || 0) + 1; G.P.maxHp += 1; p.hp += 1; } }
  if (mutOn('corpsefarts') && e.poison > 0 && G.zones.length < 120) G.zones.push({ x: e.x, y: e.y, r: 50 + e.r, life: 2.5, max: 2.5, dps: Math.max(4, e.poisonDps * e.poisonStacks * 0.5), elem: 'poison', pull: 0, color: '#8dff4a', tick: 0, src: { elem: 'poison', wname: 'Gassy Corpse Farts', noCrit: true } });
  if (e.boss && mutOn('powerhouse')) { T.powerT = G.t + 6; floatText(p.x, p.y - 34, 'POWERHOUSE', PAL.upgrade, 13); }
  if (e.elite && mutOn('sugarrush')) T.sugarT = G.t + 3;
  if ((e.elite || e.boss) && mutOn('peerpressure') && Math.hypot(e.x - p.x, e.y - p.y) < 500) { T.peerN = Math.min(5, (T.peerT > G.t ? T.peerN || 0 : 0) + 1); T.peerT = G.t + 10; }
}
// From hurtPlayer, after the damage lands.
function genesHurt(d) {
  if (!G.genes) return;
  const p = me(), P = G.P, T = G.mutT;
  if (mutOn('spite') && !(T.spiteT > G.t)) { T.spiteT = G.t + 1.5; aoe(p.x, p.y, 150, 30 * (1 + G.level * 0.15) * P.might, { elem: 'poison', wname: 'Spore of Spite', knock: 300, noCrit: true }, '#8dff4a'); }
  if (mutOn('frostbitten')) { T.frostN = (T.frostN || 0) + 1; if (T.frostN <= 150) { P.maxHp += 1; p.hp += 1; } if (T.frostN % 50 === 0) P.armour += 1; }
  if (mutOn('codependency') && !(T.codepT > G.t)) {
    T.codepT = G.t + 2;
    const ws = G.weapons.filter(w => w && w.reloadT > 0); if (ws.length) { const w = pick(ws); w.reloadT = 0; w.ammo = w.s.mag; }
    const ss = G.spells.filter(w => w && w.cd > 0); if (ss.length) pick(ss).cd = 0;
  }
}
// From hurtPlayer when a hit would burst you: true if a mutation saved you.
function genesLethal() {
  if (!G.genes) return false;
  const p = me(), P = G.P, T = G.mutT;
  if (mutOn('tooangry') && !(T.angryT > G.t)) { T.angryT = G.t + 90; p.hp = 1; p.iframes = 1; floatText(p.x, p.y - 34, 'TOO ANGRY TO DIE', PAL.danger, 15, 1.2); return true; }
  if (mutOn('zombiecore') && !T.zombie) {
    T.zombie = true; P.maxHp = Math.max(30, Math.round(P.maxHp * 0.5)); p.hp = P.maxHp * 0.5; p.iframes = 2;
    banner('ZOMBIE CELL CORE: BACK FROM THE DEAD', PAL.upgrade); cam.shake = 14;
    return true;
  }
  return false;
}
const genesArmour = () => (mutOn('velcro') && G.velcro === 'crowd' ? 3 : 0);
const genesSpeed = () => (mutOn('velcro') && G.velcro === 'alone' ? 1.15 : 1);
function genesRate() {
  if (!G || !G.genes) return 1;
  const T = G.mutT;
  let r = 1;
  if (T.hackT > G.t) r *= 1 + 0.005 * (T.hackN || 0);
  if (T.powerT > G.t) r *= 1.25;
  if (T.sugarT > G.t) r *= 1.25;
  return r;
}
const genesSpellRate = () => (G && G.mutT && G.mutT.powerT > G.t ? 1.25 : 1);
function genesCast(w) { if (mutOn('turbo') && Math.random() < 0.15) w.cd *= 0.5; }
function genesPickup(type) {
  if (!G.genes) return;
  const p = G.player, P = G.P, T = G.mutT;
  if (type === 'heal') {
    if (mutOn('proteinchug')) healPlayer(P.maxHp * 0.35 * 2);
    if (mutOn('ointment') && (T.healN = (T.healN || 0) + 1) % 5 === 0) healPlayer(P.maxHp);
    if (mutOn('roidrage') && p.hp >= P.maxHp - 0.5 && (T.prevHp || 0) >= P.maxHp - 0.5) { T.roidT = G.t + 20; floatText(p.x, p.y - 34, 'ROID RAGE', PAL.danger, 15, 1); }
  }
  if (mutOn('zappy')) for (const g of G.gems) if (Math.hypot(g.x - p.x, g.y - p.y) < 700) g.mag = true;
  const timed = ['rage', 'shield', 'freeze', 'magnet'];
  if (timed.includes(type) && mutOn('greedyhands') && !T.greedy) { T.greedy = true; applyPickup(pick(timed.filter(x => x !== type))); T.greedy = false; }
  if (mutOn('allnighter')) { if (type === 'rage') G.rage *= 2; if (type === 'shield') G.shieldT *= 2; if (type === 'freeze') for (const e of G.enemies) if (e.frozen > 0) e.frozen *= 2; }
}
// Stat side, from computeStats: weapon/spell damage mutations, Massive Payload, the Stealth-Tadpole's melee.
function genesAdapt(w, s) {
  const P = G.P;
  if (!G.genes) return;
  s.dmg *= w.isSpell ? (P.sDmg || 1) : (P.wDmg || 1);
  if (!w.isSpell && (w.def.kind === 'melee' || w.def.kind === 'wake')) s.dmg *= P.meleeK || 1;
  if (!w.isSpell && mutOn('payload') && (w.def.base.mag || 1) > 1) s.mag *= 2;
}
// Static Reload (Vanguard + Nerd), from startReload.
function genesReload(w) {
  if (!synOn('vanguard', 'nerd') || w.echo) return;
  const p = me();
  for (const t of acquireMany('nearest', 300, p.x, p.y, 2)) { bolt(p.x, p.y, t.x, t.y, ELEMENTS.shock.color, 0.15); damageEnemy(t, w.s.dmg * 0.8, Object.assign(weaponSrc(w), { elem: 'shock', wname: 'Static Reload', noProc: true })); }
}
// Acid Mines (Bruiser + Acid-Burner), from detonateMine.
function genesMine(pr) {
  if (!synOn('bruiser', 'acid') || G.zones.length > 120) return;
  G.zones.push({ x: pr.x, y: pr.y, r: 60, life: 3, max: 3, dps: pr.w.s.dmg * 0.4, elem: 'fire', pull: 0, color: '#ff7a2f', tick: 0, src: Object.assign({}, pr.src, { elem: 'fire', wname: 'Acid Mines', noCrit: true }) });
}
// Lifetime counts for the profile unlocks, added up when the run is banked.
function genesBank(G) {
  const L = META.life;
  L.bestT = Math.max(L.bestT, G.t);
  L.bosses += G.stats.bossKills || 0;
  L.pickups += G.stats.pickups || 0;
  L.elem += G.stats.elemDmg || 0;
  L.casts += G.stats.casts || 0;
}

// ================================================================ drawing
function drawVesicles() {
  if (!G.vesicles || !G.vesicles.length) return;
  const p = G.player;
  for (const v of G.vesicles) {
    const x = sx(v.x), y = sy(v.y), pulse = 1 + Math.sin(G.realT * 4 + v.seed) * 0.08, r = 20 * S * pulse;
    const left = VESICLE.life - (G.t - v.born);
    ctx.globalAlpha = left < 8 && Math.floor(G.realT * 6) % 2 ? 0.4 : 1;
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 3, '#c7f9cc', 0.45); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#e9f5db'; ctx.strokeStyle = col('#b5e48c'); ctx.lineWidth = 2;
    ctx.beginPath(); for (let i = 0; i <= 18; i++) { const a = i / 18 * TAU, rr = r * (1 + 0.1 * Math.sin(a * 3 + G.realT * 3 + v.seed)); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col('#b5e48c'); ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.2, r * 0.25, 0, TAU); ctx.arc(x + r * 0.3, y + r * 0.15, r * 0.18, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    // Off screen: a glowing marker at the edge of your vision, pointing to it.
    const m = 26;
    if (x < 0 || x > W || y < 0 || y > H) {
      const cx = W / 2, cy = H / 2, a = Math.atan2(y - cy, x - cx), k = Math.min((W / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (H / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
      const ex = cx + Math.cos(a) * k, ey = cy + Math.sin(a) * k;
      ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, 40, '#c7f9cc', 0.55 + 0.25 * Math.sin(G.realT * 5)); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#e9f5db'; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * 12, ey + Math.sin(a) * 12); ctx.lineTo(ex + Math.cos(a + 2.5) * 9, ey + Math.sin(a + 2.5) * 9); ctx.lineTo(ex + Math.cos(a - 2.5) * 9, ey + Math.sin(a - 2.5) * 9); ctx.closePath(); ctx.fill();
      ctx.font = '700 10px monospace'; ctx.textAlign = 'center'; ctx.fillText(Math.round(Math.hypot(v.x - p.x, v.y - p.y) / 10) * 10 + '', ex - Math.cos(a) * 18, ey - Math.sin(a) * 18 + 3);
    }
  }
}
