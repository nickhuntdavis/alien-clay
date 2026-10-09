'use strict';
// Spawn Prawn - first-time tutorial cards, and wave 0 (Pre-pre-pre-pre-school).
// Each card shows once ever (Settings > Tutorial brings them back), on the same stage as a first sighting.
// So as not to bury a new player, cards queue up and come at least TUT_GAP seconds of play apart; only a few
// (wave 0's welcome, Feats before your first upgrade, your first sprint and your first Lateral Gene Transfer)
// jump the queue, because they explain something happening right now.
// Wave 0 runs before wave 1 the first time you play wave mode (and again after a tutorial reset): a handful of
// slow cells, a Lateral Gene Transfer to swim into and a box of upgrades at the end. Damage-type cards wait until
// it is over.
// Hooks: tutTick (update), tutSprintEnd (stamTick), tutBeforeLoot (main loop), tutElem (damageEnemy),
// tutReact (react), tutShow('lgt') (vesBurst), tutWaveInit (campInit), tutWave0Begin (campBegin),
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
    return { title: 'BEFORE YOUR FIRST UPGRADE', name: 'FEATS', colour: PAL.upgrade,
      what: 'Some upgrade cards are Feats: big moves that go off by themselves. You have two Feat slots.',
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
    what: `Two different damage types on one enemy react. You just made ${G.tutReactName || 'one'}.`,
    head: 'WHY IT MATTERS', tips: [
      'Reactions hit hard, and some spread to the enemies nearby.',
      'A mixed build usually beats a pure one through utility and damage over time (slows, stuns, armour stripping, corrosion), not raw damage.',
      `There are ${Object.keys(REACTIONS).length}. The Codex lists them all.`] }),
};
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
// From update: the next card in the queue, when the moment is right.
function tutTick() {
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
// Before the first upgrade box (not the starting pick): what Feats are. true: a card went up, open the box next frame.
function tutBeforeLoot(req) {
  if (!req || req.kind === 'start' || tutOff() || tutSeen('feats') || G.debug) return false;
  return tutOpen('feats');
}
// The first time one of your hits carries each chemical, and the first reaction.
function tutElem(elem) { if (!tutSeen('el_' + elem)) tutShow('el_' + elem); }
function tutReact(id) { if (!tutSeen('react')) { G.tutReactName = REACTIONS[id] ? REACTIONS[id].name : null; tutShow('react'); } }

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
