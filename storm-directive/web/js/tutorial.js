'use strict';
// Spawn Prawn - first-time tutorial cards, and wave 0 (Pre-pre-pre-pre-school).
// Each card shows once ever (Settings > Tutorial brings them back), on the same stage as a first sighting.
// So as not to bury a new player, cards queue up and come well apart, the essentials first (TUT_GAPS, TUT_FROM); only a few
// (wave 0's welcome, Feats when you take your first one, your first sprint, your first junk DNA, the egg and your first stain)
// jump the queue, because they explain something happening right now.
// Wave 0 runs before wave 1 the first time you play wave mode (and again after a tutorial reset): a handful of
// slow cells, a junk DNA carrier to kill and a box of upgrades at the end. Damage-type cards wait until
// it is over.
// Damage types: a card soon after you first use each (Force has none), and the type is in colour from then on (elemOn, render.js col()).
// Hooks: tutTick (update; also the egg's first meeting, eggMeetTick), eggKnown (render.js, the egg arrow), tutSprintEnd (stamTick), tutBeforeLoot (main loop), tutElem (damageEnemy),
// tutReact (react), tutShow('grudge'|'tether'|'charm') (game.js, arsenal.js, chem.js), tutTerrainSeen (tutTick), tutShow('lgt') (junkAbsorb), tutWaveInit (campInit), tutWave0Begin (campBegin),
// tutWave0Clear (waveClear), tutSkip (the "skip tutorial" link).

// Cards come in this order (mechanics first, then damage types, reactions, and terrain last), and each kind
// leaves a longer quiet spell after it (TUT_GAPS, seconds). A kind also waits until that many seconds of the run have passed (TUT_FROM).
const TUT_GAPS = [40, 45, 90, 80];
const TUT_FROM = [0, 15, 120, 100];
const tutCat = key => key.startsWith('el_') ? 1 : key === 'react' ? 2 : key.startsWith('tr_') ? 3 : 0;
const TUT_NAME = 'PRE-PRE-PRE-PRE-SCHOOL';
const tutOff = () => (typeof window !== 'undefined' && window.TUT_OFF) || (typeof SET !== 'undefined' && (SET.intros === 'off' || SET.auto));
const tutSeen = key => !!(META.seenTut && META.seenTut[key]);
const tutWave0 = () => !!(G && G.wave && G.wave.camp && G.wave.n === 0 && G.wave.active);

// The reactions an element is part of: 'NEUTRALISED (Acid meets Mucus)'.
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
      'One cell will wear a white helix: junk DNA. Kill it to absorb a little of what it was.'],
    foot: 'Clear the dish to pass. Wave 1 is the real thing.' }),
  sprint: () => ({ title: 'YOU SPRINTED', name: 'STAMINA', colour: XR.white,
    what: 'Pushing the stick to its edge (or holding Shift) sprints: 55% faster, but it burns stamina, the thin ring inside your health ring.',
    head: 'HOW IT WORKS', tips: [
      'Run it dry and you are WINDED: no sprinting until it is back to 30%.',
      'It refills on its own once you stop for a moment.',
      'Attacking Feats spend the same stamina, so keep a little back.'] }),
  feats: () => {
    const att = V10 && typeof F10_ORDER !== 'undefined' ? F10_ORDER.filter(id => F10[id].stam && !F10[id].trig).slice(0, 4).map(id => F10[id].name) : Object.keys(SPELLS).filter(id => STAM_FEATS.has(id)).map(id => SPELLS[id].name); // (V10: its own Feats)
    return { title: 'YOU FOUND A FEAT', name: 'FEATS', colour: PAL.upgrade,
      what: `You just took your first Feat: a big move that goes off by itself. You have ${typeof F10_SLOTS !== 'undefined' ? F10_SLOTS : 2} Feat slots.`,
      head: 'HOW THEY WORK', tips: [
        `The attacking ones (${att.join(', ')}) are paid for with stamina, the ring sprinting uses.`,
        'The rest (healing, slowing time, shields) wait on a cooldown.',
        'They level up like weapons. Weapons are still where most of your damage comes from.'] };
  },
  lgt: () => {
    const L = G.lgtLast, J = L && JUNK_POWERS[L.id];
    return { title: 'LATERAL GENE TRANSFER', name: J ? J.name.toUpperCase() : 'JUNK DNA', colour: '#e9f5db',
    what: J ? `You picked up junk DNA from the ${ENEMIES[L.id].name} and gained a power: ${J.fmt(L.k)}. It lasts the rest of the run.` : 'Junk DNA from something you just killed. You keep a small power of whatever it was, for the rest of the run.',
    head: 'HOW IT WORKS', tips: [
      'Every so often an enemy wears a white helix. Kill it before it sheds the junk (30 seconds), then swim into the helix it drops.',
      `Each kind of enemy gives its own power. The same kind again stacks it, up to ${JUNK.stacks} times.`,
      'The pause menu lists what you have absorbed.'] };
  },
  react: () => ({ title: 'MIXING DAMAGE TYPES', name: 'REACTIONS', colour: '#ffd166',
    what: `Two different damage types on one enemy react. You just made ${G.tutReactName || 'one'}${G.tutReactPair ? ': ' + G.tutReactPair : ''}.`,
    head: 'WHY IT MATTERS', tips: [
      'Reactions hit hard, and some spread to the enemies nearby.',
      'A mixed build usually beats a pure one through utility and damage over time (slows, stuns, armour stripping, melting), not raw damage.',
      `There are ${Object.keys(REACTIONS).length}. The Field Guide lists them all.`] }),
  grudge: () => ({ title: 'NEW MECHANIC', name: 'GRUDGE', colour: '#ff4d6d',
    what: 'Whatever hurt you last gets a red crosshair and the word GRUDGE over it.',
    head: 'WHY IT MATTERS', tips: [
      'Any weapon set to GRUDGE targeting goes for it first.',
      'Settle it and the crosshair goes.'] }),
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
  egg: () => ({ title: 'YOU HAVE MET', name: 'THE EGG', colour: '#ffd6e8',
    what: 'This is your goal, and your destiny.',
    head: 'BUT FIRST', tips: [
      'Before it accepts you into its warm embrace, you must prove yourself.',
      G.wave && G.wave.camp ? 'Defeat every other suitor, and any critter in your way.' : `Get the sperm count down to one (or reach LV ${EGG.level}), then swim into it and break its membrane. It fights back.`,
      G.wave && G.wave.camp ? 'Here in the dish, that means all twenty waves.' : `A rival who reaches LV ${EGG.level} first will try to break in. Stop them. A pink arrow points back here.`] }),
};
// The egg, first time: no arrow points to it until you have met it (render.js) or it is ready, and the
// first time you swim close, its card. (Not in campaign levels: no egg there.)
const EGG_MEET = 380;
function eggMeetTick() {
  if (!G || G.lvl || G.state !== 'play' || !G.core || G.t < 8) return; // (in a race you start on top of it: give it a moment)
  if (G.eggNear) return;
  const p = me();
  if (Math.hypot(p.x - G.core.x, p.y - G.core.y) > EGG_MEET) return;
  G.eggNear = true;
  if (!META.eggMet) { META.eggMet = 1; saveMeta(); }
  tutShow('egg', true);
}
const eggKnown = () => !!(META.eggMet || (G && (G.fertile || G.eggAnnounced)));
// The two damage types behind each reaction, for the card.
let TUT_PAIR_M = null; // (built on first use: RX_PAIR lives in inspect.js, which loads later)
const tutPair = id => (TUT_PAIR_M = TUT_PAIR_M || (() => { const m = {}; for (const k in RX_PAIR) { const [a, b] = k.split('+'); if (!m[RX_PAIR[k]]) m[RX_PAIR[k]] = a === b ? ELEMENTS[a].name + ' to its limit' : ELEMENTS[a].name + ' + ' + ELEMENTS[b].name; } return m; })())[id] || '';
// After your first Petri Dish wave in Lab view: one offer of Arcade view (Settings > Colour > View).
TUT_CARDS.arcade = () => ({ title: 'HOW DO YOU LIKE IT?', name: 'A MORE ARCADE EXPERIENCE?', colour: '#ff5fa2',
  what: 'You are playing in Lab view: a real microscope slide, with no colour on anything. Realism over readability.', head: 'ARCADE VIEW',
  tips: ['Everything in full colour: you, danger, damage types, enemies, terrain.', 'Coloured rings drain to show how long each effect has left.', 'Switch back any time: Settings > Colour > View.'],
  footHtml: '<button class="chip" id="arcadeYes">SWITCH TO ARCADE VIEW</button> <span class="hint">or GOT IT to stay in Lab view.</span>',
  bind: el => { const b = el.querySelector('#arcadeYes'); if (b) b.onclick = () => { SET.view = 'arcade'; saveSettings(); refreshPalette(); b.textContent = 'ARCADE VIEW ON'; b.disabled = true; }; } });
function viewOffer(V) {
  if (!V || !V.camp || V.n !== 1 || L10 || SET.view !== 'lab' || META.arcadeAsked) return;
  META.arcadeAsked = 1; saveMeta();
  if (tutOff()) { sysMsg('A MORE ARCADE EXPERIENCE?', 'Settings > Colour > View > ARCADE puts everything in full colour, with rings on timed effects.', '#ff5fa2', true); return; }
  tutShow('arcade', true);
}
// Terrain: one card the first time each kind comes on screen.
const TUT_TERRAIN = {
  ridge:   { what: 'A hard lump of cartilage growing in the womb.', tips: ['Nothing can swim through it: you, the swarm and bosses slide round it.', 'Shots bounce off it. Use it as cover.'] },
  mito:    { what: 'The cell\'s power plant. It is the only thing here that wants your bullets.', tips: ['It soaks up shots, yours and theirs, until it is full.', 'Then it bursts: enemies in range are hurt, enemy bullets vanish and you get a rush of speed and fire rate. Stand close.'] },
  acid:    { what: 'A pit of stomach acid. You can swim through it, but it burns, and it clings to you for a few seconds after you get out.', tips: ['Enemies can\'t follow you in, so it is an escape route if you can take the burn.', 'Shots that hit it melt away. Lure enemies against it.'] },
  cilia:   { what: 'A bed of waving hairs. You can swim through it, but it tangles you: you crawl, and you can\'t attack until you are out.', tips: ['Enemies get shoved out of it, so it can shake off pursuers.', 'Never get caught in it with a swarm waiting at the edge.'] },
  current: { what: 'A current in the tube that carries everything along with it.', tips: ['You, enemies and shots all drift with the flow.', 'Ride it to cover ground, or swim across it with care.'] },
  slick:   { what: 'A patch of lubricant. Smooth.', tips: ['You lose most of your grip: you keep sliding and turn slowly.', 'Enemies are not affected. Cross it in straight lines.'] },
};
for (const type in TUT_TERRAIN) TUT_CARDS['tr_' + type] = () => ({ title: 'NEW TERRAIN', name: OBSTACLES[type].name.toUpperCase(), colour: OBSTACLES[type].color === '#b0b0b0' ? '#cfd8e3' : OBSTACLES[type].color,
  what: TUT_TERRAIN[type].what, head: 'WHAT IT DOES', tips: TUT_TERRAIN[type].tips });
// A damage type's first card: its colour, what it does in plain words, and what its odd words mean.
const TUT_EL = {
  phys:   { c: 'white', what: 'Plain physics, and the base damage under most attacks. It just hurts.', terms: 'Shoved: knocked back.' },
  fire:   { c: 'lime green', what: 'Acid eats through things: damage over time that wears armour away, and hits harder once the armour is gone.', terms: 'Melting: being eaten away by acid.' },
  ice:    { c: 'snot green', what: 'Mucus gums enemies up. Every hit slows them more, and enough leaves them stuck fast.', terms: 'Snotty: slowed by mucus. Stuck: stopped dead until it wears off.' },
  shock:  { c: 'electric yellow', what: 'Static spreads. Some of the damage a shocked enemy takes jumps to a neighbour and drags it closer, and every 4th hit stuns it.', terms: 'Shocked: carrying a charge. Stunned: stopped for a moment.' },
  poison: { c: 'rash pink', what: 'Cooties are catching. Sick enemies take damage that builds over time, hit you softer, and sneeze it onto their mates.', terms: 'Sick: stacking damage over time, and it spreads. A dose is one stack.' },
  oxi:    { c: 'amber, like oil', what: 'Oil does little on its own, but it is highly reactive. Lubricated enemies slide much further when knocked, and every reaction on them is 50% stronger.', terms: 'Lubricated: no grip at all.' },
  salt:   { c: 'deep blue', what: 'Water pushes enemies around: every hit shoves them away. Soaking-wet enemies carry Static twice as well.', terms: 'Soaking wet: dripping, and a great conductor.' },
  arcane: { c: 'blood red', what: 'Blood makes enemies bleed: damage over time, but only while they move. Five deep, it clots them together, and bleeding kills can leave a pool that heals you.', terms: 'Bleeding: losing blood with every move.' },
  soul:   { c: 'ghostly pale blue', what: 'Soul passes straight through walls, shields and armour. Cursed enemies sometimes turn on their mates, and when one dies its ghost fights for you.', terms: 'Cursed: haunted for a few seconds. Spooked: a boss slowed by fright.' },
};
// Saves from before the damage type rework (v9.10): the reworked types get their cards again.
if (typeof META !== 'undefined' && META && !META.rxV2) {
  META.rxV2 = 1; META.seenRx = {};
  for (const k of ['ice', 'poison', 'oxi', 'salt', 'arcane']) { if (META.elemSeen) delete META.elemSeen[k]; if (META.seenTut) delete META.seenTut['el_' + k]; }
  if (typeof saveMeta === 'function') saveMeta();
}
for (const id in ELEMENTS) TUT_CARDS['el_' + id] = () => {
  const E = ELEMENTS[id], mix = tutMixes(id), X = TUT_EL[id];
  return { title: 'NEW DAMAGE TYPE', name: E.name.toUpperCase(), colour: E.color, what: `Its colour is ${X.c}. ${X.what}`, desc: X.terms,
    head: mix.length ? 'MIX IT WITH' : 'HOW IT WORKS',
    tips: mix.length ? mix.slice(0, 3) : ['It leaves enemies ' + E.status + '.'],
    foot: mix.length > 3 ? `And ${mix.length - 3} more in the Field Guide.` : '' };
};
// A damage type turns from grey to colour when its card comes up, soon after you first use it (at once with
// tutorials off). Saves from before this get colour for every type they had a card for.
const elemOn = e => {
  if (!META.elemMig) { META.elemSeen = META.elemSeen || {}; for (const k in (META.seenTut || {})) if (k.startsWith('el_')) META.elemSeen[k.slice(3)] = 1; META.elemMig = 1; }
  return !!(META.elemSeen && META.elemSeen[e]);
};
function elemUnlock(e) {
  if (elemOn(e)) return;
  META.elemSeen[e] = 1; saveMeta();
  if (typeof COL !== 'undefined') { COL.clear(); COLDF.clear(); SPR.glow.clear(); }
}

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
  eggMeetTick();
  tutTerrainSeen();
  if (!G || !G.tutQ || !G.tutQ.length || G.state !== 'play' || G.debug || tutOff()) return;
  let at = G.tutNow ? G.tutQ.indexOf(G.tutNow) : -1;
  const now = at >= 0;
  if (!now) { // (the most essential kind first; a kind may also be too early in the run)
    let best = -1;
    G.tutQ.forEach((k, i) => { const c = tutCat(k); if (G.t >= TUT_FROM[c] && (best < 0 || c < tutCat(G.tutQ[best]))) best = i; });
    if (best < 0) return;
    at = best;
  }
  const key = G.tutQ[at];
  if (!now) {
    if (G.t < (G.tutNext || 0) || G.t < (G.stIntroNext || 0) || G.t < (G.introNext || 0) - 4) return;
    if (tutWave0() && key !== 'school') return; // (damage-type waits until pre-school is over)
    if (G.player.hp < G.P.maxHp * 0.35 || (G.boss && !G.boss.dead && G.wave && G.wave.phase === 'lead')) return; // (not in a tight spot)
  }
  G.tutQ.splice(at, 1); G.tutNow = null;
  tutOpen(key);
}
function tutOpen(key) {
  if (tutSeen(key)) return false;
  META.seenTut = META.seenTut || {}; META.seenTut[key] = 1; saveMeta();
  if (key.startsWith('el_')) elemUnlock(key.slice(3)); // (in colour from its introduction on)
  G.tutNext = G.t + TUT_GAPS[tutCat(key)]; G.stIntroNext = Math.max(G.stIntroNext || 0, G.t + 6);
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
function tutElem(elem) {
  if (elemOn(elem)) return;
  if (elem === 'phys' || tutOff() || tutSeen('el_' + elem)) { elemUnlock(elem); return; } // (no card to wait for: colour at once)
  tutShow('el_' + elem);
}
function tutReact(id) { if (!tutSeen('react')) { G.tutReactName = REACTIONS[id] ? REACTIONS[id].name : null; G.tutReactPair = tutPair(id); tutShow('react'); } }

// ---------------------------------------------------------------- wave 0
// At the start of a wave-mode run: does it open with pre-school?
function tutWaveInit(V) {
  return; // (retired in v9.11: Level 0, Swimming Lessons, teaches the basics now. The wave 0 code below is kept but not reached.)
  if (META.tutWave == null && RUNLOG.some(r => r.wave)) { META.tutWave = 1; saveMeta(); } // (not your first wave run: no pre-school unless you reset the tutorial)
  if (!META.tutWave && !tutOff()) { V.n = -1; V.tut = true; }
}
function tutWave0Begin(V) {
  V.boss = null; V.phase = 'mobs'; V.fresh = [];
  V.budget = 10; V.dur = 22;
  banner('WAVE 0: ' + TUT_NAME, PAL.upgrade);
  G.introNext = Math.max(G.introNext || 0, G.t + 6); // (the welcome first, then the cells)
  G.nextJunk = G.t + 10; // (junk DNA to practise on: junk.js)
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
