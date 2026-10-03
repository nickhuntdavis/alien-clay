'use strict';
// Spawn Prawn - first sightings. The first time you ever see an enemy type, the slide stops and it gets a
// short version of the boss treatment: the camera swims over, it flinches, and its file card comes up.
// Once ever (saved in META.seen), not once a run. Settings > Tutorial resets it. Bosses always get the
// full introduction (bosses.js). Everything you've met goes in the Codex.

// what: what it is and does. tip: how to deal with it.
const ENEMY_INTRO = {
  crawler:    { what: 'One of the four hundred million. Not a threat on its own. There is never one on its own.', tip: 'Anything that hits a crowd. Keep swimming and let your weapons mow them down.' },
  skitter:    { what: 'Small, fast and fragile. It reaches you before you have noticed it.', tip: 'Fast fire and wide shots. One hit is enough.' },
  spitter:    { what: 'Part of the host\'s immune system. Keeps its distance and spits at you.', tip: 'Its shots are slow. Swim across them, not along them. SHOOTERS FIRST targeting helps.' },
  brute:      { what: 'A big eater with a little armour. Swallows whatever it catches.', tip: 'Armour shred and big single hits. Don\'t let it pin you against a wall.' },
  bomber:     { what: 'A bubble of stomach acid that rushes you and bursts.', tip: 'Kill it at range, or swim clear when it swells. Its blast hurts other enemies too.' },
  splitter:   { what: 'Divides when it dies: two smaller, faster cells come out.', tip: 'Splash damage handles the halves. Kill it where your blasts can catch them.' },
  splitling:  { what: 'Half of a cell that just divided. Quick and angry.', tip: 'It is fragile. Anything that hits more than one target.' },
  krill:      { what: 'Shoals of tiny crustaceans that dart in bursts. Nobody knows how they got in here.', tip: 'Wide, sweeping weapons. They scatter, then regroup.' },
  wisp:       { what: 'A swarm of spermlets: tiny, fast and everywhere at once.', tip: 'Area damage and auras. Single shots waste time on them.' },
  blinker:    { what: 'Teleports short distances when you aim at it.', tip: 'Homing shots and chaining lightning don\'t care where it went.' },
  medic:      { what: 'Heals the enemies around it.', tip: 'Kill it first: set a weapon to SHOOTERS FIRST, which counts healers.' },
  charger:    { what: 'Lowers its head, winds up, then charges in a straight line.', tip: 'When it stops and shakes, sidestep. It can\'t turn mid-charge.' },
  bulwark:    { what: 'A slow wall of mucus with heavy armour that shields the enemies behind it.', tip: 'Armour shred, damage over time (it ignores armour) and HIGHEST ARMOUR targeting.' },
  warlock:    { what: 'Fires rings of cytokines in every direction.', tip: 'Find the gaps in the ring and slip through them. Kill it before the rings stack up.' },
  phantom:    { what: 'Fades out of phase: shots pass straight through it while it is faded.', tip: 'Hit it when it is solid. Auras and trails catch it as it comes back.' },
  summoner:   { what: 'Keeps budding new enemies until it dies.', tip: 'It is the source: kill it, not the children. STRONGEST targeting helps.' },
  spire:      { what: 'Rooted to the spot, spraying a spiral of enzymes.', tip: 'Stay out of its reach or kill it fast. The spiral has gaps: time your way through.' },
  lancer:     { what: 'A sniper. A thin line shows where it is aiming, then a fast, heavy shot.', tip: 'Move when you see the line. Kill it from the side.' },
  amoeba:     { what: 'Soft, slow and huge. It eats other enemies and grows, and shrugs off knockback.', tip: 'Fire and big blasts. Don\'t let it eat its way to a giant size.' },
  plasmod:    { what: 'A giant amoeba made of many. It splits into amoebas when it dies.', tip: 'Save your area damage for when it bursts.' },
  pinworm:    { what: 'A wriggling worm. Tougher than it looks and hard to hit side on.', tip: 'Piercing shots go down its length.' },
  diatom:     { what: 'A glass-shelled turret: heavy armour and a ring of shots.', tip: 'Armour shred and big hits. Its rings have gaps.' },
  waterbear:  { what: 'A tardigrade: very tough, very armoured, and it curls into a near-indestructible ball when hurt.', tip: 'Back off while it is curled up, then finish it. Damage over time ignores its armour.' },
  paramecium: { what: 'Swims in long straight lines and backs off when it bumps into you.', tip: 'Predictable: put a trap or a mine in its path.' },
  rotifer:    { what: 'A hoover. It goes for your XP granules and eats them before you can.', tip: 'Kill it quickly: it drops what it ate. Collect XP before it does.' },
  volvox:     { what: 'A hollow colony that bursts into daughter colonies when it dies.', tip: 'Area damage cleans up the burst.' },
  volvoxling: { what: 'A daughter colony from a burst Volvox. Small and quick.', tip: 'Splash damage.' },
  yeast:      { what: 'Candida: every cell buds a daughter every few seconds, so a colony doubles and doubles. Sticky to swim through.', tip: 'Burn it out early, before it spreads. Fire and poison clouds work well.' },
  pepsinjr:   { what: 'A small Pepsinator. All the stomach, half the size.', tip: 'Treat it like a mini boss: keep moving and hit it hard.' },
  juggernaut: { what: 'A huge rival swimmer, armoured and hard-hitting.', tip: 'Shred its armour and keep your distance. Its charge is slow to start.' },
  sperminator:{ what: 'A nanobot. It locks on with a red laser before firing a burst, and destroying it is only half the job.', tip: 'Move as soon as the laser settles on you. Something comes out of the wreck.' },
  endoskeleton:{ what: 'What climbs out of a wrecked Booster: lighter, faster and still coming.', tip: 'It has no armour left. Finish it before it reaches you.' },
  alien:      { what: 'A Natural Killer: it weaves in, crouches, then pounces. Its blood is acid.', tip: 'When it crouches, get clear. Don\'t stand where it dies.' },
};
const INTRO_GAP = 12; // seconds between introductions in a run, so a first run isn't all pauses
const seenFoe = id => !!(META.seen && META.seen[id]);
const introKey = e => Object.keys(ENEMIES).find(k => ENEMIES[k] === e.def);
function markSeen(id) { META.seen = META.seen || {}; if (!META.seen[id]) { META.seen[id] = 1; saveMeta(); } }
// From update: every half second, look for an enemy type you've never seen, on screen.
function introTick() {
  if (!G || G.state !== 'play' || G.debug) return;
  if (G.t < 3 || G.t < (G.introNext || 0) || G.introCheck > G.t) return;
  G.introCheck = G.t + 0.5;
  for (const e of onScreen(999)) {
    if (e.dead || e.boss || e.rival || e.final || e.egg || e.charmed || e.hired || e.bossDef) continue;
    const id = introKey(e);
    if (!id || seenFoe(id) || !ENEMY_INTRO[id]) continue;
    markSeen(id);
    G.introNext = G.t + INTRO_GAP;
    startFoeIntro(e, id);
    return;
  }
}
function startFoeIntro(e, id) {
  G.bossIntro = { e, t: 0, idx: 0, roar: false, z0: ZOOM.z, foe: id };
  G.state = 'bossIntro';
  INPUT.active = false; G.manual = null;
  sfx('level'); vibrate(60);
  if (typeof UI !== 'undefined') UI.openFoeIntro(e, id);
}
// Settings > Tutorial: see the introductions (and the first-time tips) again.
function resetTutorial() { META.seen = {}; saveMeta(); }
