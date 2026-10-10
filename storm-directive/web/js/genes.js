'use strict';
// Spawn Prawn - genes: Epigenetic Profiles (pick a Primary Sequence before a run, splice in up to two more
// at half strength, each one ranks up with the kills it's expressed for) and Mutations (a box of four: staple one
// into your genome, up to a limited number; from skipping a splice and from stashes found in campaign levels).
// Hooks, called from the game: genesStart (newGame), genesTick (update), genesDamageMul / genesCrit /
// genesHit (damageEnemy), genesKill (killEnemy), genesHurt / genesLethal / genesArmour (hurtPlayer),
// genesPickup (applyPickup), genesRate / genesSpellRate / genesCast (weapons and spells), genesSpeed
// (updatePlayer), genesAdapt (computeStats), genesReload (startReload), genesMine (detonateMine).

// ================================================================ Epigenetic Profiles
// k is the trait's strength: 1 at Rank 1 as your Primary Sequence, half that when spliced in, doubling with
// each rank. Every apply() is additive, so a trait can be taken off again (-k) and re-applied.
const PROFILE_RANKS = [0, 12000, 60000]; // kills while expressed: Rank 2 at 12,000 (about a run and a half), Rank 3 at 60,000 (about six runs)
const PROFILES = {
  vanguard: { name: 'The Firstborn', trait: 'Quick Recovery', fmt: k => `+${pc(0.12 * k)} reload speed`, apply: (P, k) => { P.reloadSpd += 0.12 * k; },
    desc: 'The default sequence. Simple, honest flagellar violence.', weapons: ['blaster', 'seeker', 'glaive'] },
  bruiser: { name: 'The Chonker', trait: 'Puppy Fat', fmt: k => `+${+(1 * k).toFixed(1)} armour`, apply: (P, k) => { P.armour += 1 * k; },
    desc: 'A thick, disgusting layer of armour on the outer membrane. Built to take a beating.', weapons: ['shotgun', 'paddle', 'onesie', 'mines'] },
  nerd: { name: 'The Bright Spark', trait: 'Early Developer', fmt: k => `+${pc(0.06 * k)} fire rate, Feats recharge ${pc(0.06 * k)} faster`, apply: (P, k) => { P.haste += 0.06 * k; P.cdr -= 0.06 * k; },
    desc: 'Lets the mitochondria do the work. Static, sparks and things that hum.', weapons: ['tesla', 'twin', 'void'] },
  eggseeker: { name: 'The Favourite', trait: 'Favouritism', fmt: k => `+${pc(0.04 * k)} crit chance, +${pc(0.15 * k)} crit damage`, apply: (P, k) => { P.crit += 0.04 * k; P.critDmg += 0.15 * k; },
    desc: 'Slow, heavy, precise. Built to execute bosses, not to chew through crowds.', weapons: ['duedate', 'frost', 'toothfairy'],
    unlock: { text: 'Survive 10 minutes in a single run', have: () => Math.floor(META.life.bestT / 60), need: 10 } },
  stealth: { name: 'The Quiet One', trait: 'Under Your Feet', fmt: k => `+${pc(0.12 * k)} melee and trail damage, +${pc(0.02 * k)} dodge`, apply: (P, k) => { P.meleeK += 0.12 * k; P.dodge += 0.02 * k; },
    desc: 'No spitting. Grows something sharp and swims straight through the meat grinder.', weapons: ['flail', 'wake', 'peekaboo'],
    unlock: { text: 'Beat 25 bosses (all runs)', have: () => META.life.bosses, need: 25 } },
  pusher: { name: 'The Good Eater', trait: 'Healthy Appetite', fmt: k => `+${+(0.5 * k).toFixed(1)} HP/s regeneration`, apply: (P, k) => { P.regen += 0.5 * k; },
    desc: 'Aggressive self-healing, infections and soapy spit.', weapons: ['parasite', 'bubble', 'orbit'],
    unlock: { text: 'Pick up 100 power-ups (all runs)', have: () => META.life.pickups, need: 100 } },
  acid: { name: 'The Problem Child', trait: 'Overtired', fmt: k => `up to +${pc(0.12 * k)} damage, the closer you are to bursting`, apply: () => {},
    desc: 'Dissolves things. Gets angrier the more you are hurt.', weapons: ['venom', 'flamer', 'redtape'],
    unlock: { text: 'Deal 2,000,000 chemical damage (all runs)', have: () => Math.floor(META.life.elem), need: 2e6 } },
  splicer: { name: 'The Designer Baby', trait: 'Good Genes', fmt: k => `your other sequences' traits are ${pc(Math.min(1, 0.25 * k))} stronger, +${pc(0.05 * k)} area`, apply: (P, k) => { P.area += 0.05 * k; },
    desc: 'Clever, strange and a bit of everything. Makes every other gene work harder.', weapons: ['friend', 'crayon', 'siphon'],
    unlock: { text: 'Perform 1,500 Feats (all runs)', have: () => META.life.casts, need: 1500 } },
};
// Two sequences expressed together unlock a little extra.
const PROFILE_SYNERGIES = [
  { a: 'vanguard', b: 'nerd', name: 'Rubbing Off', desc: 'Every reload sends a spark into the two nearest enemies.' },
  { a: 'vanguard', b: 'acid', name: 'Trail of Destruction', desc: 'You leave small acid patches behind you as you swim.' },
  { a: 'bruiser', b: 'pusher', name: 'Comfort Eating', desc: 'Below half health, your regeneration doubles (and you get +1 HP/s).' },
  { a: 'bruiser', b: 'acid', name: 'Blowout', desc: 'Nappy Mines leave an acid puddle where they go off.' },
  { a: 'eggseeker', b: 'stealth', name: 'First Impressions', desc: 'Hits on enemies at full health always crit.' },
  { a: 'splicer', b: 'eggseeker', name: 'Clean Living', desc: 'Lathered or saponified enemies take 30% more damage from you.' },
  { a: 'splicer', b: 'pusher', name: 'Batch Cooking', desc: 'Your starting ability (Soap Dispenser or Cluster Feeding, whichever is your primary\'s) heals you 3% of your max HP for every enemy it hits (up to 15%).' },
];
const profUnlocked = id => { const u = PROFILES[id].unlock; return !u || !!META.devAll || !!(META.seqGrand && META.seqGrand[id]) || u.have() >= u.need; }; // (devAll: developer mode's UNLOCK EVERYTHING, debug.js)
const capFirst = s => String(s).replace(/^./, c => c.toUpperCase()); // (trait lines read as sentences when shown on their own)
const profKills = id => (META.prof[id] && META.prof[id].kills) || 0;
// Ranks already earned under the old, lower thresholds (5,000 and 25,000) are kept (see meta.js: keep).
const profRank = id => Math.max(profKills(id) >= PROFILE_RANKS[2] ? 3 : profKills(id) >= PROFILE_RANKS[1] ? 2 : 1, (META.prof[id] && META.prof[id].keep) || 1);
const genesOn = id => !!(G && G.genes && G.genes.active.includes(id));
const synOn = (a, b) => genesOn(a) && genesOn(b);
function profK(id, primary) { return [1, 2, 4][Math.max(1, profRank(id)) - 1] * (primary ? 1 : 0.5); } // (a locked sequence, in the Daily Challenge, plays at rank I)

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

// ================================================================ Mutations (from splice skips and stashes)
// tier: 0 common, 1 rare, 2 epic (the card's rarity). apply: once, when you take it. Everything else is a hook
// that looks at G.mut.
const MUTATIONS = {
  spite:       { tier: 1, name: 'Bursts Into Tears', desc: 'Get hit and you burst: a blast hits everything near you and shoves it away.' },
  stemcell:    { tier: 1, name: 'Hollow Legs', desc: '+1 HP/s regeneration for every 200 max HP you have.' },
  macjaw:      { tier: 0, name: 'Borrowed Jaw', desc: 'Weapons +10% damage and +5% crit chance. Feats -10% damage. The owner has stopped asking.', apply: P => { P.wDmg += 0.1; P.crit += 0.05; P.sDmg -= 0.1; } },
  nuhuh:       { tier: 0, name: 'Fussy Eater', desc: '+2 rerolls right now and +10% luck. Sends everything back.', apply: P => { P.luck += 0.1; G.rerolls += 2; } },
  jittery:     { tier: 0, name: "Ants in Your Pants", desc: '+5% dodge chance, +2.5% swim speed. Cannot sit still.', apply: P => { P.dodge += 0.05; P.speed += 0.025; } },
  tcells:      { tier: 1, name: 'Chip on the Shoulder', desc: '+30% damage to elites, bosses and rival champions.' },
  soup:        { tier: 0, name: 'Thumb Sucker', desc: '+2 HP/s regeneration, but -15% max HP. The dentist disapproves.', apply: P => { P.regen += 2; P.maxHp = Math.round(P.maxHp * 0.85); G.player.hp = Math.min(G.player.hp, P.maxHp); } },
  sludge:      { tier: 1, name: 'Screen Time', desc: 'Stay still and it builds: up to +30% damage after 3s. Swimming wears it off.' },
  receptors:   { tier: 0, name: 'Sticky Fingers', desc: '+30% pickup range.', apply: P => { P.magnet += 0.3; } },
  sugardaddy:  { tier: 1, name: 'Heavy-Handed', desc: '+1% crit chance for every 100 max HP you have.' },
  powerhouse:  { tier: 1, name: 'Sticker Chart', desc: 'Killing a boss: 6s of +25% fire rate, and your Feats recharge 25% faster.' },
  magbact:     { tier: 0, name: 'Runs in the Family', desc: '+5% swim speed, and you hit up to 15% harder the faster you swim.', apply: P => { P.speed += 0.05; P.momentum += 0.1; } },
  vippass:     { tier: 1, name: 'Lucky Dip', desc: '+20% luck, so your DNA strands come out rarer.', apply: P => { P.luck += 0.2; } },
  bipolar:     { tier: 1, name: 'Mood Swings', desc: 'Acid, Base and Static +40%. Force, Ethanol and Histamine -10%.', apply: P => { P.elem.fire += 0.4; P.elem.ice += 0.4; P.elem.shock += 0.4; P.elem.phys -= 0.1; P.elem.poison -= 0.1; P.elem.arcane -= 0.1; } },
  velcro:      { tier: 1, name: 'Middle Child', desc: 'Alone (nothing within 250): +15% swim speed. In a crowd (8 or more): +3 armour. Anything in between: +10% damage. Adapts.' },
  zappy:       { tier: 0, name: 'Little Magpie', desc: '+30% pickup range, and picking up any power-up pulls in every XP granule near you.', apply: P => { P.magnet += 0.3; } },
  frostbitten: { tier: 1, name: 'Character Building', desc: 'Every hit you take: +1 max HP (up to +150), and +1 armour for every 50 hits.' },
  bonk:        { tier: 0, name: 'Soft Spot', desc: 'Force hits have a 4% chance to stun what they hit (1% on bosses, briefly). Everyone has one.' },
  overachiever:{ tier: 2, name: 'First Dibs', desc: 'Weapon hits on enemies at full health always crit.' },
  chernobyl:   { tier: 2, name: 'Small but Mighty', desc: 'Double damage. Half max HP.', apply: P => { P.might *= 2; P.maxHp = Math.round(P.maxHp * 0.5); G.player.hp = Math.min(G.player.hp, P.maxHp); } },
  bonejuice:   { tier: 0, name: 'Strong Bones', desc: '+1 max HP for every 15 kills (elites count as 5), up to +100. Milk helps.' },
  skeletonkey: { tier: 1, name: 'Double Yolk', desc: 'Every mutation box has a 30% chance to let you take two mutations.' },
  proteinchug: { tier: 0, name: 'Sweet Tooth', desc: 'Glucose Hits heal three times as much, and all healing is 20% stronger.', apply: P => { P.healMult += 0.2; } },
  heavymetal:  { tier: 0, name: 'Spoilt Rotten', desc: 'Power-ups drop from enemies twice as often.' },
  lube:        { tier: 0, name: 'Non-Slip Socks', desc: '+10% swim speed and +30% traction.', apply: P => { P.speed += 0.1; P.traction += 0.3; } },
  sniperrna:   { tier: 1, name: 'First Word', desc: 'Your Feats always crit on enemies at full health, and crits hit 25% harder.', apply: P => { P.critDmg += 0.25; } },
  corpsefarts: { tier: 0, name: 'Trapped Wind', desc: 'Drunk enemies leave a cloud of Ethanol fumes when they die. Better out than in.' },
  tasernoodle: { tier: 1, name: 'Pass the Parcel', desc: 'Charged enemies pass a jolt to a neighbour every second.' },
  combustion:  { tier: 1, name: 'Flare-Up', desc: 'Corroding enemies can burst (about 1 in 10 each second) in a small acid blast.' },
  coldshoulder:{ tier: 0, name: 'Contagious Lather', desc: 'Saponified enemies lather everything near them.' },
  spicybrain:  { tier: 0, name: 'Highly Strung', desc: 'Static +30%, Ethanol -20%.', apply: P => { P.elem.shock += 0.3; P.elem.poison -= 0.2; } },
  zombiecore:  { tier: 2, name: 'Dropped as a Baby', desc: 'Once, when you would die, you come back on 50% health. After that: -50% max HP for the rest of the run. Never quite the same.' },
  buffet:      { tier: 0, name: 'Gold Star', desc: '+10% XP.', apply: P => { P.xp += 0.1; } },
  payload:     { tier: 1, name: 'Backed Up', desc: 'Weapons with a magazine bigger than 1 hold twice as much.' },
  ointment:    { tier: 1, name: 'Magic Cream', desc: 'Heals you fully now, +40 max HP, and every 5th Glucose Hit heals you fully. Fixes everything.', apply: P => { P.maxHp += 40; G.player.hp = P.maxHp; } },
  hackerman:   { tier: 1, name: 'Overexcited', desc: 'Every crit gives +0.5% fire rate for 2s (up to +25%).' },
  turbo:       { tier: 0, name: 'Short Attention Span', desc: 'Every Feat you perform has a 15% chance to recharge twice as fast.' },
  greedyhands: { tier: 1, name: 'One in Each Hand', desc: 'Every timed power-up also gives you another random one. +20% pickup range.', apply: P => { P.magnet += 0.2; } },
  roidrage:    { tier: 1, name: 'Too Many Sweets', desc: 'A Glucose Hit picked up at full health: +50% damage for 20s.' },
  plaguemask:  { tier: 0, name: "Runny Nose", desc: 'Ethanol +30%, Static -20%.', apply: P => { P.elem.poison += 0.3; P.elem.shock -= 0.2; } },
  tooangry:    { tier: 2, name: 'Five More Minutes', desc: 'A hit that would burst you leaves you on 1 HP instead. Once every 90s.' },
  allnighter:  { tier: 0, name: 'Past Bedtime', desc: 'Timed power-ups last twice as long.' },
  codependency:{ tier: 1, name: 'Attention Seeker', desc: 'Getting hit instantly reloads a random weapon and recharges a random Feat (every 2s at most).' },
  mystery:     { tier: 1, name: 'Keeping It a Surprise', desc: 'Hidden until you take it.' },
  pointy:      { tier: 1, name: 'Rough and Tumble', desc: 'Force +40%. Acid, Base and Static -10%.', apply: P => { P.elem.phys += 0.4; P.elem.fire -= 0.1; P.elem.ice -= 0.1; P.elem.shock -= 0.1; } },
  peerpressure:{ tier: 0, name: 'Showing Off', desc: 'Every elite or boss that dies near you: +5% damage for 10s, stacking 5 times.' },
  rerolldice:  { tier: 0, name: 'Do-Over', desc: 'The first reroll on every card screen is free.' },
  slappy:      { tier: 0, name: 'Salt in the Wound', desc: '+20% crit chance against enemies that are lathered, saponified, drunk or corroding.' },
  salad:       { tier: 0, name: 'Eat Your Greens', desc: '+5% fire rate, and Feats recharge 5% faster.', apply: P => { P.haste += 0.05; P.cdr -= 0.05; } },
  brainfreeze: { tier: 0, name: 'Soft Hands', desc: 'Base +30%, Acid -20%. Washes up nicely.', apply: P => { P.elem.ice += 0.3; P.elem.fire -= 0.2; } },
  pustule:     { tier: 0, name: 'Sour Face', desc: 'Acid +30%, Base -20%.', apply: P => { P.elem.fire += 0.3; P.elem.ice -= 0.2; } },
  runningjuice:{ tier: 0, name: 'Runner\'s High', desc: '+2 HP/s regeneration while you swim fast.' },
  sugarrush:   { tier: 0, name: 'E Numbers', desc: 'Killing an elite: 3s of +25% fire rate. The blue ones are worst.' },
  trojan:      { tier: 0, name: 'Surprise Package', desc: 'Absorbing junk DNA blows everything near you away.' },
  waterbear:   { tier: 1, name: 'Finders Keepers', desc: 'Rerolls have a 35% chance not to be used up. +5% luck.', apply: P => { P.luck += 0.05; } },
  snottrail:   { tier: 0, name: 'Snot Trail', desc: '+5% swim speed, Ethanol +5%.', apply: P => { P.speed += 0.05; P.elem.poison += 0.05; } },
  stiff:       { tier: 0, name: 'Stiff as a Board', desc: '+10% dodge chance, -20% swim speed.', apply: P => { P.dodge += 0.1; P.speed -= 0.2; } },
  leech:       { tier: 0, name: 'Biting Phase', desc: 'Hits heal you a little (within the lifesteal limit). It is just a phase.', apply: P => { P.lifesteal += 0.6; } },
  toothpick:   { tier: 0, name: 'Teacher\'s Pet', desc: 'Weapons and Feats -5% damage. +25% XP.', apply: P => { P.wDmg -= 0.05; P.sDmg -= 0.05; P.xp += 0.25; } },
  origami:     { tier: 0, name: 'Bookworm', desc: 'Feats +15% damage. Weapons -10% damage.', apply: P => { P.sDmg += 0.15; P.wDmg -= 0.1; } },
  ohno:        { tier: 2, name: 'Fair\'s Fair', desc: 'Every damage type at normal strength or weaker gets +25%. Any already boosted loses 10%.', apply: P => { for (const el in P.elem) P.elem[el] += P.elem[el] <= 1 ? 0.25 : -0.1; } },
};
const MUT_SLOTS = 6;
const mutOn = id => !!(G && G.mut && G.mut[id]);
const mutCap = () => MUT_SLOTS + (META.ranks.incubated || 0);
const mutCount = () => Object.keys(G.mut || {}).filter(id => !G.mutHidden || !G.mutHidden[id]).length;

// ================================================================ run start (from newGame, after applyMeta)
function genesStart(G) {
  G.mut = {}; G.mutHidden = {}; G.mutT = {};
  const id = PROFILES[META.profile] && (profUnlocked(META.profile) || (typeof DAILY !== 'undefined' && DAILY.on)) ? META.profile : 'vanguard';
  G.genes = { primary: id, active: [id], applied: [], k: {} };
  seqWeaponColour(id);
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
  G.vesTwo = mutOn('skeletonkey') && Math.random() < 0.3; // (Double Yolk: ui.js lets you take two)
  const pool = shuffle(Object.keys(MUTATIONS).filter(id => !G.mut[id]));
  return pool.slice(0, 4).map(id => {
    const M = MUTATIONS[id];
    return { rarity: [1, 3, 4][M.tier], tag: 'MUTATION', icon: M.name.replace(/^The /, '').replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(), color: PAL.upgrade,
      title: M.name, sub: `Mutation | genome ${mutCount()}/${mutCap()}`, desc: M.desc, apply: () => mutTake(id) };
  });
}
function mutTake(id) {
  const M = MUTATIONS[id];
  G.mut[id] = true;
  META.muts = META.muts || {}; META.muts[id] = true;
  if (M.apply) M.apply(G.P);
  if (id === 'mystery') {
    // A hidden mutation, revealed in the Field Guide once you've had it.
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
// The SKIP button on a splice screen: keep your genome as it is and take a mutation instead (two rerolls
// if your genome is already full of them).
const spliceSkipMut = () => mutCount() < mutCap();
function spliceSkip() {
  floatText(G.player.x, G.player.y - 30, 'STAYING PURE', '#adb5bd', 14, 0.8);
  if (spliceSkipMut()) G.lootQueue.unshift({ kind: 'vesicle' });
  else G.rerolls += 2;
}
function profSynText(id) {
  const s = PROFILE_SYNERGIES.filter(q => (q.a === id && genesOn(q.b)) || (q.b === id && genesOn(q.a)));
  return s.length ? ' With what you already express: ' + s.map(q => q.name + ' (' + q.desc + ')').join(' ') : '';
}
// Splice offers come at these levels while you have room for another sequence.
const SPLICE_LEVELS = [6, 20, 40]; // spread out, and the first two land just before the Lv 8 and Lv 22 weapon drafts so a splice's weapons can be drafted; two splices at most
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

// ================================================================ per frame (from update)
function genesTick(dt) {
  if (!G.genes) return;
  abilityTick();
  const p = G.player, P = G.P, T = G.mutT, sp = Math.hypot(p.vx || 0, p.vy || 0);
  // (Lateral Gene Transfers are junk DNA carried by enemies now: junk.js. No more floating vesicles.)
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
      if (mutOn('combustion') && e.burn > 0 && pops < 6 && Math.random() < 0.1) { pops++; aoe(e.x, e.y, 70, e.burnDps * 3 + 10, { elem: 'fire', noStatus: true, noCrit: true, wname: 'Flare-Up' }, '#ff7a2f'); }
      if (mutOn('coldshoulder') && e.frozen > 0) forNear(e.x, e.y, 90, o => { if (o !== e && !o.boss) { o.chill = Math.max(o.chill, 1.2); o.chillAmt = Math.max(o.chillAmt, 0.3); } });
    }
  }
  // Scorched Trail (Vanguard + Acid-Burner).
  if (synOn('vanguard', 'acid') && sp > 60 && !(T.trailT > G.t)) {
    T.trailT = G.t + 0.6;
    G.zones.push({ x: p.x, y: p.y, r: 34, life: 2.5, max: 2.5, dps: 6 + G.level * 0.9, elem: 'fire', pull: 0, color: '#ff7a2f', tick: 0, src: { elem: 'fire', wname: 'Trail of Destruction', noCrit: true } });
  }
}

// ================================================================ hit, crit, kill, hurt
function genesDamageMul(e, src) {
  if (!G.genes) return 1;
  let m = 1;
  if (mutOn('tcells') && (e.elite || e.boss || e.rival)) m *= 1.3;
  if ((e.frozen > 0 || e.chill > 0) && synOn('splicer', 'eggseeker')) m *= 1.3; // Fresh Frozen
  if (mutOn('sludge')) m *= 1 + 0.3 * (G.sludge || 0);
  if (mutOn('velcro') && G.velcro === 'mid') m *= 1.1;
  if (G.mutT.roidT > G.t) m *= 1.5;
  if (G.mutT.furyT > G.t) m *= 1.5; // Hormonal Fury
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
  if (mutOn('corpsefarts') && e.poison > 0 && G.zones.length < 120) G.zones.push({ x: e.x, y: e.y, r: 50 + e.r, life: 2.5, max: 2.5, dps: Math.max(4, e.poisonDps * e.poisonStacks * 0.5), elem: 'poison', pull: 0, color: '#8dff4a', tick: 0, src: { elem: 'poison', wname: 'Trapped Wind', noCrit: true } });
  if (e.boss && mutOn('powerhouse')) { T.powerT = G.t + 6; floatText(p.x, p.y - 34, 'STICKER CHART', PAL.upgrade, 13); }
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
  if (mutOn('tooangry') && !(T.angryT > G.t)) { T.angryT = G.t + 90; p.hp = 1; p.iframes = 1; floatText(p.x, p.y - 34, 'FIVE MORE MINUTES', PAL.danger, 15, 1.2); return true; }
  if (mutOn('zombiecore') && !T.zombie) {
    T.zombie = true; P.maxHp = Math.max(30, Math.round(P.maxHp * 0.5)); p.hp = P.maxHp * 0.5; p.iframes = 2;
    banner('ZOMBIE CELL CORE: BACK FROM THE DEAD', PAL.upgrade); cam.shake = 14;
    return true;
  }
  return false;
}
const genesArmour = () => (mutOn('velcro') && G.velcro === 'crowd' ? 3 : 0) + (G.mutT && G.mutT.furyT > G.t ? 5 : 0);
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
    if (mutOn('roidrage') && p.hp >= P.maxHp - 0.5 && (T.prevHp || 0) >= P.maxHp - 0.5) { T.roidT = G.t + 20; floatText(p.x, p.y - 34, 'TOO MANY SWEETS', PAL.danger, 15, 1); }
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
  for (const t of acquireMany('nearest', 300, p.x, p.y, 2)) { bolt(p.x, p.y, t.x, t.y, ELEMENTS.shock.color, 0.15); damageEnemy(t, w.s.dmg * 0.8, Object.assign(weaponSrc(w), { elem: 'shock', wname: 'Rubbing Off', noProc: true })); }
}
// Acid Mines (Bruiser + Acid-Burner), from detonateMine.
function genesMine(pr) {
  if (!synOn('bruiser', 'acid') || G.zones.length > 120) return;
  G.zones.push({ x: pr.x, y: pr.y, r: 60, life: 3, max: 3, dps: pr.w.s.dmg * 0.4, elem: 'fire', pull: 0, color: '#ff7a2f', tick: 0, src: Object.assign({}, pr.src, { elem: 'fire', wname: 'Blowout', noCrit: true }) });
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
// ================================================================ Starting abilities (Primary Sequence only)
// Each sequence comes with one ability of its own. It fires by itself whenever it's ready and has something to
// do (the game is autorun); tap its button to fire it the moment it's ready. Stronger with each rank.
const abilDmg = () => (15 + G.level * 2.5) * G.P.might * (1 + 0.25 * (profRank(G.genes.primary) - 1));
const abilSrc = (name, extra) => Object.assign({ wname: name, noProc: true }, extra || {});
const SEQ_ABILITY = {
  vanguard: { name: 'Head First', short: 'CHARGE', cd: 8, desc: 'Every 8s: headbutt-dash through whatever is in front of you, hitting everything along the way. You cannot be hurt mid-charge.',
    fire(manual) {
      const p = G.player, t = acquire('nearest', 240, p.x, p.y);
      if (!t && !manual) return false;
      const a = t ? Math.atan2(t.y - p.y, t.x - p.x) : p.face || 0, from = { x: p.x, y: p.y }, to = { x: p.x + Math.cos(a) * 200, y: p.y + Math.sin(a) * 200 };
      if (Math.hypot(to.x, to.y) > CORE.arena - 40) return false;
      p.x = to.x; p.y = to.y; p.vx = Math.cos(a) * 260; p.vy = Math.sin(a) * 260; p.iframes = Math.max(p.iframes, 0.5); p.face = a;
      alongLine(from, to, 26, e => damageEnemy(e, abilDmg() * 3, abilSrc('Head First', { knock: 260, kx: Math.cos(a), ky: Math.sin(a) })));
      for (let i = 0; i < 6; i++) G.fx.push({ type: 'flash', x: lerp(from.x, to.x, i / 5), y: lerp(from.y, to.y, i / 5), r: 26 - i * 2, color: SEQ_LOOK.vanguard.color, life: 0.25, max: 0.25 });
      cam.shake = Math.min(10, cam.shake + 4); return true;
    } },
  bruiser: { name: 'Mood Swing', short: 'FURY', cd: 30, desc: 'Drop below half health and you go berserk for 6s: +50% damage, +5 armour, and a shockwave that throws everything back. Every 30s.',
    fire(manual) {
      const p = G.player;
      if (!manual && p.hp > G.P.maxHp * 0.5) return false;
      G.mutT.furyT = G.t + 6;
      aoe(p.x, p.y, 170, abilDmg() * 1.5, abilSrc('Mood Swing', { knock: 420 }), SEQ_LOOK.bruiser.color);
      floatText(p.x, p.y - 40, 'MOOD SWING', SEQ_LOOK.bruiser.color, 16, 1); return true;
    } },
  nerd: { name: 'Short Fuse', short: 'EMP', cd: 10, desc: 'Every 10s: grows a cyst that bursts a second later, shocking everything within 220 and wiping enemy bullets.',
    fire(manual) {
      const p = G.player;
      if (!manual && !acquire('nearest', 260, p.x, p.y)) return false;
      const x = p.x, y = p.y;
      G.fx.push({ type: 'warn', x, y, r: 220, color: SEQ_LOOK.nerd.color, life: 1, max: 1 });
      after(1, () => {
        IN_AOE = true; forNear(x, y, 220, e => { damageEnemy(e, abilDmg() * 1.2, abilSrc('Short Fuse', { elem: 'shock' })); e.shock = Math.max(e.shock, 2.5); }); IN_AOE = false;
        for (const b of G.ebul) if (Math.hypot(b.x - x, b.y - y) < 220) b.dead = true;
        ring(x, y, 220, SEQ_LOOK.nerd.color, 0.5, 6); G.fx.push({ type: 'flash', x, y, r: 160, color: '#ffffff', life: 0.2, max: 0.2 });
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; bolt(x, y, x + Math.cos(a) * 200, y + Math.sin(a) * 200, ELEMENTS.shock.color, 0.25); }
        sfx('zap');
      });
      return true;
    } },
  eggseeker: { name: 'Telling Tales', short: 'SNIPE', cd: 7, desc: 'Every 7s: marks the toughest enemy in range, then a second later hits it with a guaranteed crit for huge damage.',
    fire() {
      const p = G.player, t = acquire('highhp', 480, p.x, p.y);
      if (!t) return false;
      G.fx.push({ type: 'warn', x: t.x, y: t.y, r: t.r + 20, color: SEQ_LOOK.eggseeker.color, life: 1, max: 1 });
      floatText(t.x, t.y - t.r - 14, 'MARKED', SEQ_LOOK.eggseeker.color, 12, 0.8);
      after(1, () => { if (t.dead) return; bolt(G.player.x, G.player.y, t.x, t.y, SEQ_LOOK.eggseeker.color, 0.2); damageEnemy(t, abilDmg() * 5, abilSrc('Telling Tales', { crit: 1 })); ring(t.x, t.y, t.r + 30, SEQ_LOOK.eggseeker.color, 0.4, 4); });
      return true;
    } },
  stealth: { name: 'Slipped Out', short: 'SLIP', cd: 9, desc: 'Every 9s, when something gets close: you slip straight through it to the far side, slicing everything in between. Untouchable for a moment.',
    fire(manual) {
      const p = G.player, t = acquire('nearest', manual ? 260 : 130, p.x, p.y);
      if (!t) return false;
      const a = Math.atan2(t.y - p.y, t.x - p.x), from = { x: p.x, y: p.y }, to = { x: t.x + Math.cos(a) * (t.r + 90), y: t.y + Math.sin(a) * (t.r + 90) };
      if (Math.hypot(to.x, to.y) > CORE.arena - 40) return false;
      p.x = to.x; p.y = to.y; p.iframes = Math.max(p.iframes, 0.8);
      alongLine(from, to, 20, e => damageEnemy(e, abilDmg() * 3.3, abilSrc('Slipped Out', { crit: 0.5 })));
      G.fx.push({ type: 'lash', x: from.x, y: from.y, a, r: Math.hypot(to.x - from.x, to.y - from.y), w: 6, color: SEQ_LOOK.stealth.color, life: 0.25, max: 0.25, seed: 1 });
      fxParts('smoke', from.x, from.y, '#2b2440', 6, 60, 0.6, 8); return true;
    } },
  pusher: { name: 'Cluster Feeding', short: 'DRAIN', cd: 10, desc: 'Every 10s: drains the six nearest enemies within 250 and heals you for a fifth of what it took.',
    fire() {
      const p = G.player, ts = acquireMany('nearest', 250, p.x, p.y, 6);
      if (!ts.length) return false;
      let got = 0;
      for (const t of ts) { got += damageEnemy(t, abilDmg() * 1.2, abilSrc('Cluster Feeding', { elem: 'poison' })) || 0; bolt(t.x, t.y, p.x, p.y, SEQ_LOOK.pusher.color, 0.3); }
      healPlayer(Math.min(G.P.maxHp * 0.15, got * 0.2));
      if (synOn('splicer', 'pusher')) healPlayer(G.P.maxHp * Math.min(0.15, 0.03 * ts.length)); // Batch Cooking
      return true;
    } },
  acid: { name: 'Bringing It Up', short: 'ERUPT', cd: 9, desc: 'Every 9s: a ring of six acid pools erupts around you. They corrode harder the more hurt you are.',
    fire(manual) {
      const p = G.player;
      if (!manual && !acquire('nearest', 220, p.x, p.y)) return false;
      const hurt = 1 + (1 - clamp(p.hp / G.P.maxHp, 0, 1));
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, x = p.x + Math.cos(a) * 90, y = p.y + Math.sin(a) * 90; G.zones.push({ x, y, r: 55, life: 3, max: 3, dps: abilDmg() * 0.8 * hurt, elem: 'fire', pull: 0, color: SEQ_LOOK.acid.color, tick: 0, src: abilSrc('Bringing It Up', { elem: 'fire', noCrit: true }) }); fxParts('drop', x, y, SEQ_LOOK.acid.color, 4, 120, 0.5, 3); }
      ring(p.x, p.y, 140, SEQ_LOOK.acid.color, 0.4, 5); return true;
    } },
  splicer: { name: 'Soap Dispenser', short: 'SOAP', cd: 11, desc: 'Every 11s: a squirt of lye hits the biggest crowd within 320, saponifying everything in it (bosses only briefly).',
    fire() {
      const p = G.player, t = acquire('cluster', 320, p.x, p.y);
      if (!t) return false;
      const x = t.x, y = t.y;
      let n = 0;
      IN_AOE = true; forNear(x, y, 130, e => { damageEnemy(e, abilDmg() * 1.3, abilSrc('Soap Dispenser', { elem: 'ice' })); e.frozen = Math.max(e.frozen, e.boss ? 0.4 : 1.6); n++; }); IN_AOE = false;
      if (n && synOn('splicer', 'pusher')) healPlayer(G.P.maxHp * Math.min(0.15, 0.03 * n)); // Batch Cooking
      G.fx.push({ type: 'frost', x, y, r: 130, color: SEQ_LOOK.splicer.color, life: 0.6, max: 0.6 }); ring(x, y, 130, SEQ_LOOK.splicer.color, 0.5, 5); fxParts('shard', x, y, '#caf0f8', 12, 260, 0.6, 4);
      return true;
    } },
};
// From genesTick: keep the ability ticking; from the HUD button: fire it now.
function abilityTick() {
  const g = G.genes, A = g && SEQ_ABILITY[g.primary];
  if (!A || G.debug) return;
  if (g.abilT == null) g.abilT = G.t + 3;
  if (G.t >= g.abilT && A.fire(false)) { g.abilT = G.t + A.cd; abilityCast(A); }
}
function abilityTap() {
  const g = G && G.genes, A = g && SEQ_ABILITY[g.primary];
  if (!A || G.state !== 'play' || G.t < (g.abilT || 0)) return;
  if (A.fire(true)) { g.abilT = G.t + A.cd; abilityCast(A); }
}
function abilityCast(A) { const p = G.player; floatText(p.x, p.y - 34, A.name.toUpperCase(), SEQ_LOOK[G.genes.primary].color, 12, 0.7); sfx('spell'); }
