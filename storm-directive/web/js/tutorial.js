'use strict';
// Spawn Prawn - first-time tutorial cards, and wave 0 (Pre-pre-pre-pre-school).
// Each card shows once ever (Settings > Tutorial brings them back), on the same stage as a first sighting.
// So as not to bury a new player, cards queue up and come at least TUT_GAP seconds of play apart; only a few
// (wave 0's welcome, Feats when you take your first one, your first sprint and your first Lateral Gene Transfer)
// jump the queue, because they explain something happening right now.
// Wave 0 runs before wave 1 the first time you play wave mode (and again after a tutorial reset): a handful of
// slow cells, a Lateral Gene Transfer to swim into and a box of upgrades at the end. Damage-type cards wait until
// it is over.
// Hooks: tutTick (update), tutSprintEnd (stamTick), tutBeforeLoot (main loop), tutElem (damageEnemy),
// tutReact (react), tutShow('grudge'|'tether'|'charm') (game.js, arsenal.js, chem.js), tutTerrainSeen (tutTick), tutShow('lgt') (vesBurst), tutWaveInit (campInit), tutWave0Begin (campBegin),
// tutWave0Clear (waveClear), tutSkip (the "skip tutorial" link).

const TUT_GAP = 25;
const TUT_NAME = 'PRE-PRE-PRE-PRE-SCHOOL';
const tutOff = () => (typeof window !== 'undefined' && window.TUT_OFF) || (typeof SET !== 'undefined' && (SET.intros === 'off' || SET.auto));
const tutSeen = key => !!(META.seenTut && META.seenTut[key]);
const tutWave0 = () => !!(G && G.wave && G.wave.camp && G.wave.n === 0 && G.wave.active);

// The reactions an element is part of: 'NEUTRALISED (Acid meets Base)'.
function tutMixes(id) {
  const n = ELEMENTS[id].name, out = [];
  for (const k in REACTIONS) { const d = REACTIONS[k].desc; if (new RegExp('\\b' + n + '\\b').test(d.split(':')[0])) out.push(`${REACTIONS[k].name}: ${d.split(':')[0].replace(/ \(either way round\)/, '')}.`); }
  return out;
}
const TUT_CARDS = {
  school: () => ({ title: 'WAVE 0', name: TUT_NAME, colour: PAL.upgrade,
    what: 'A practice drop before the real twenty: a few slow cells and nothing that hits hard.',
    head: 'THE BASICS', tips: [
      'Your weapons fire by themselves. All you do is swim.',
      'Left alone, you swim yourself (autorun). Touch and drag to take over; let go and autorun carries on.',
      'Push the stick right out to its edge to sprint.',
      'Swim over the XP the cells drop. Every level is a box of upgrades, opened when the wave is over.',
      'A green bubble will turn up: a Lateral Gene Transfer. Follow the arrows and swim into it.'],
    foot: 'Clear the dish to pass. Wave 1 is the real thing.' }),
  sprint: () => ({ title: 'YOU SPRINTED', name: 'STAMINA', colour: XR.white,
    what: 'Pushing the stick to its edge (or holding Shift) sprints: 55% faster, but it burns stamina, the thin ring inside your health ring.',
    head: 'HOW IT WORKS', tips: [
      'Run it dry and you are WINDED: no sprinting until it is back to 30%.',
      'It refills on its own once you stop for a moment.',
      'Attacking Feats spend the same stamina, so keep a little back.'] }),
  feats: () => {
    const att = Object.keys(SPELLS).filter(id => STAM_FEATS.has(id)).map(id => SPELLS[id].name);
    return { title: 'YOU FOUND A FEAT', name: 'FEATS', colour: PAL.upgrade,
      what: 'You just took your first Feat: a big move that goes off by itself. You have two Feat slots.',
      head: 'HOW THEY WORK', tips: [
        `The attacking ones (${att.join(', ')}) are paid for with stamina, the ring sprinting uses.`,
        'The rest (healing, slowing time, shields) wait on a cooldown.',
        'They level up like weapons. Weapons are still where most of your damage comes from.'] };
  },
  lgt: () => ({ title: 'YOU FOUND ONE', name: 'LATERAL GENE TRANSFER', colour: '#c7f9cc',
    what: 'A bubble of stray genes from a passing stranger. You get to staple one of four mutations into your genome' + (typeof wavesMode === 'function' && wavesMode() ? ' when the wave is over.' : '.'),
    head: 'HOW IT WORKS', tips: [
      `Mutations last the whole run, and your genome only has room for ${typeof mutCap === 'function' ? mutCap() : 6}.`,
      'More turn up every minute or so: follow the green arrows at the edge of the screen.',
      'Leave one too long and it pops by itself.'] }),
  react: () => ({ title: 'MIXING DAMAGE TYPES', name: 'REACTIONS', colour: '#ffd166',
    what: `Two different damage types on one enemy react. You just made ${G.tutReactName || 'one'}${G.tutReactPair ? ': ' + G.tutReactPair : ''}.`,
    head: 'WHY IT MATTERS', tips: [
      'Reactions hit hard, and some spread to the enemies nearby.',
      'A mixed build usually beats a pure one through utility and damage over time (slows, stuns, armour stripping, corrosion), not raw damage.',
      `There are ${Object.keys(REACTIONS).length}. The Codex lists them all.`] }),
  grudge: () => ({ title: 'NEW MECHANIC', name: 'GRUDGE', colour: '#ff4d6d',
    what: 'Whatever hurt you last gets a red crosshair and the word GRUDGE over it.',
    head: 'WHY IT MATTERS', tips: [
      'Grudge Rifle and any weapon set to GRUDGE targeting go for it first.',
      'Grudge Rifle shots do triple damage to it. Settle it and the crosshair goes.'] }),
  tether: () => ({ title: 'NEW MECHANIC', name: 'TETHERS', colour: PAL.upgrade,
    what: 'A glowing line now joins two enemies, or an enemy and you.',
    head: 'WHAT IT DOES', tips: [
      'It pulls the two together and damages them while it lasts.',
      'Slam them into each other, or break the line by killing one end.'] }),
  charm: () => ({ title: 'NEW MECHANIC', name: 'ALLIES', colour: PAL.you,
    what: 'An enemy just switched sides. For a few seconds it fights for you.',
    head: 'WHAT IT DOES', tips: [
      'Allies draw fire and hit their old friends. They are not yours for long.',
      'Do not shoot them: your weapons ignore them anyway.'] }),
};
// The two damage types behind each reaction, for the card.
const TUT_PAIR = { neutral: 'Acid + Base', battery: 'Acid + Static', ester: 'Acid + Ethanol', flashpoint: 'Static + Ethanol', electro: 'Static + Base',
  sanitiser: 'Base + Ethanol', sympathy: 'Voodoo + anything', suds: 'Force + Base', pushover: 'Force + Ethanol', bleach: 'Peroxide + Acid',
  toothpaste: 'Peroxide + Base', rocket: 'Peroxide + Ethanol', ozone: 'Peroxide + Static', exorcism: 'Peroxide + Voodoo', electrolyte: 'Brine + Static',
  wound: 'Brine + Acid', margarita: 'Brine + Ethanol', crust: 'Brine + Base', seafoam: 'Peroxide + Brine', blackout: 'Ethanol + Ethanol' };
// Terrain: one card the first time each kind comes on screen.
const TUT_TERRAIN = {
  ridge:   { what: 'A hard lump of cartilage growing in the womb.', tips: ['Nothing can swim through it: you, the swarm and bosses slide round it.', 'Shots bounce off it. Use it as cover.'] },
  mito:    { what: 'The cell\'s power plant. It is the only thing here that wants your bullets.', tips: ['It soaks up shots, yours and theirs, until it is full.', 'Then it bursts: enemies in range are hurt, enemy bullets vanish and you get a rush of speed and fire rate. Stand close.'] },
  acid:    { what: 'A pit of stomach acid. It burns whatever touches it.', tips: ['It hurts you, and it hurts enemies that wander in.', 'Shots that hit it melt away. Lure enemies through it.'] },
  cilia:   { what: 'A bed of waving hairs that shoves everything away from its middle.', tips: ['It pushes you and the swarm outwards, so you can use it to shake pursuers.', 'You can fight the push, but sprinting through the middle is slow.'] },
  current: { what: 'A current in the tube that carries everything along with it.', tips: ['You, enemies and shots all drift with the flow.', 'Ride it to cover ground, or swim across it with care.'] },
  slick:   { what: 'A patch of lubricant. Smooth.', tips: ['You lose most of your grip: you keep sliding and turn slowly.', 'Enemies are not affected. Cross it in straight lines.'] },
};
for (const type in TUT_TERRAIN) TUT_CARDS['tr_' + type] = () => ({ title: 'NEW TERRAIN', name: OBSTACLES[type].name.toUpperCase(), colour: OBSTACLES[type].color === '#b0b0b0' ? '#cfd8e3' : OBSTACLES[type].color,
  what: TUT_TERRAIN[type].what, head: 'WHAT IT DOES', tips: TUT_TERRAIN[type].tips });
for (const id in ELEMENTS) TUT_CARDS['el_' + id] = () => {
  const E = ELEMENTS[id], mix = tutMixes(id);
  return { title: 'NEW DAMAGE TYPE', name: E.name.toUpperCase(), colour: E.color, what: E.blurb,
    head: mix.length ? 'MIX IT WITH' : 'HOW IT WORKS',
    tips: mix.length ? mix.slice(0, 3) : ['It leaves enemies ' + E.status + '.'],
    foot: mix.length > 3 ? `And ${mix.length - 3} more in the Codex.` : '' };
};

// Ask for a card. now: it explains something happening this moment, so it skips the queue.
function tutShow(key, now) {
  if (!G || tutOff() || tutSeen(key) || !TUT_CARDS[key]) return;
  G.tutQ = G.tutQ || [];
  if (G.tutQ.includes(key)) return;
  if (now) G.tutQ.unshift(key); else G.tutQ.push(key);
  if (now) G.tutNow = key;
}
// Each kind of terrain gets a card the first time one is on screen.
function tutTerrainSeen() {
  if (!G || !G.terrain || G.lvl || G.state !== 'play' || G.debug || tutOff() || G.t < 3 || G.tutTerrCheck > G.t) return;
  G.tutTerrCheck = G.t + 0.5;
  const p = me(), R = Math.hypot(W / S, H / S) / 2;
  for (const o of G.terrain.list) if (TUT_TERRAIN[o.type] && !tutSeen('tr_' + o.type) && Math.hypot(o.x - p.x, o.y - p.y) < R + o.r * 0.5) tutShow('tr_' + o.type);
}
// From update: the next card in the queue, when the moment is right.
function tutTick() {
  tutTerrainSeen();
  if (!G || !G.tutQ || !G.tutQ.length || G.state !== 'play' || G.debug || tutOff()) return;
  const key = G.tutQ[0], now = G.tutNow === key;
  if (!now) {
    if (G.t < (G.tutNext || 0) || G.t < (G.stIntroNext || 0) || G.t < (G.introNext || 0) - 4) return;
    if (tutWave0() && key !== 'school') return; // (damage-type waits until pre-school is over)
    if (G.player.hp < G.P.maxHp * 0.35 || (G.boss && !G.boss.dead && G.wave && G.wave.phase === 'lead')) return; // (not in a tight spot)
  }
  G.tutQ.shift(); G.tutNow = null;
  tutOpen(key);
}
function tutOpen(key) {
  if (tutSeen(key)) return false;
  META.seenTut = META.seenTut || {}; META.seenTut[key] = 1; saveMeta();
  G.tutNext = G.t + TUT_GAP; G.stIntroNext = Math.max(G.stIntroNext || 0, G.t + 6);
  const C = TUT_CARDS[key]();
  if (typeof SET !== 'undefined' && SET.intros === 'quiet') { sysMsg('TUTORIAL: ' + C.name, `${C.what} ${C.tips[0]}`, C.colour, true); return false; }
  const p = me(), spot = { x: p.x, y: p.y, r: p.r || 14, def: { color: C.colour, name: C.name }, age: 0, flash: 0, name: C.name };
  G.bossIntro = { e: spot, t: 0, idx: 0, roar: true, z0: ZOOM.z, foe: 'tut', tut: key };
  G.state = 'bossIntro';
  INPUT.active = false; G.manual = null;
  sfx('level'); vibrate(40);
  if (typeof UI !== 'undefined') UI.openTutorial(C);
  return true;
}
// Your first sprint, once you let go of it.
function tutSprintEnd() { tutShow('sprint', true); }
// (Feats are introduced by tutShow('feats') the moment the first one is taken, not before a box.)
function tutBeforeLoot(req) { return false; } // (the Feats card now comes when you take your first Feat: game.js, optNewSpell)
// The first time one of your hits carries each chemical, and the first reaction.
function tutElem(elem) { if (!tutSeen('el_' + elem)) tutShow('el_' + elem); }
function tutReact(id) { if (!tutSeen('react')) { G.tutReactName = REACTIONS[id] ? REACTIONS[id].name : null; G.tutReactPair = TUT_PAIR[id] || ''; tutShow('react'); } }

// ---------------------------------------------------------------- wave 0
// At the start of a wave-mode run: does it open with pre-school?
function tutWaveInit(V) {
  if (META.tutWave == null && RUNLOG.some(r => r.wave)) { META.tutWave = 1; saveMeta(); } // (not your first wave run: no pre-school unless you reset the tutorial)
  if (!META.tutWave && !tutOff()) { V.n = -1; V.tut = true; }
}
function tutWave0Begin(V) {
  V.boss = null; V.phase = 'mobs'; V.fresh = [];
  V.budget = 10; V.dur = 22;
  banner('WAVE 0: ' + TUT_NAME, PAL.upgrade);
  G.introNext = Math.max(G.introNext || 0, G.t + 6); // (the welcome first, then the cells)
  G.nextVesicle = G.t + 12; // (a Lateral Gene Transfer to practise on)
  META.seenTut = META.seenTut || {}; delete META.seenTut.school;
  after(0.9, () => { if (tutWave0()) tutShow('school', true); });
}
function tutWave0Clear(V) {
  if (V.n !== 0) return false;
  META.tutWave = 1; saveMeta();
  banner(TUT_NAME + ' PASSED', PAL.upgrade);
  sysMsg('THE SCIENTIST', '"Adequate. Now the real thing: twenty drops, a boss every fifth."', XR.dim, true);
  return true;
}
// The "skip tutorial" link on every card: no more cards, and pre-school ends where it stands.
function tutSkip() {
  if (typeof SET !== 'undefined') { SET.intros = 'off'; saveSettings(); }
  META.tutWave = 1; saveMeta();
  if (G) {
    G.tutQ = [];
    if (tutWave0()) {
      const V = G.wave; V.spawned = V.budget;
      for (const e of G.enemies) if (!e.dead && !e.charmed && !e.egg) { e.dead = true; spawnPart(e.x, e.y, '#ffffff', 3, 70, 0.4); }
    }
  }
}
