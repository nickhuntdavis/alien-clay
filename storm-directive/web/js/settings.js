'use strict';
// Spawn Prawn - player settings (saved on the device) and the narrator packs.

const SETTINGS_DEF = [
  { id: 'darkfield', label: 'Darkfield microscope', hint: 'Black field, bright specimens (a real microscopy technique).', opts: [[false, 'OFF'], [true, 'ON']] },
  { id: 'detail', label: 'Specimen detail', hint: 'High adds organelles, textures and a proper zona breach. Costs a little performance.', opts: [['standard', 'STANDARD'], ['high', 'HIGH']] },
  { id: 'clinical', label: 'Clean clinical view', hint: 'No grain, lens blur, vignette or halos. Maximum readability.', opts: [[false, 'OFF'], [true, 'ON']] },
  { id: 'dof', label: 'Depth of field', hint: 'Out-of-focus layers and a soft lens blur at the edges.', opts: [[true, 'ON'], [false, 'OFF']] },
  { id: 'hud', label: 'HUD', hint: 'Minimal folds vitals, race and messages into one thin bar.', opts: [['full', 'FULL'], ['minimal', 'MINIMAL']] },
  { id: 'casa', label: 'CASA Pro panel', hint: 'Live motility stats, an enemy histogram and a track log, like sperm-analysis software.', opts: [[false, 'OFF'], [true, 'ON']] },
  { id: 'layout', label: 'Layout', hint: 'Landscape puts your weapons down the side. Auto follows the screen.', opts: [['auto', 'AUTO'], ['portrait', 'PORTRAIT'], ['landscape', 'LANDSCAPE']] },
  { id: 'narrator', label: 'Narrator', hint: 'Who comments on your life choices.', opts: [['system', 'THE SYSTEM'], ['documentary', 'DOCUMENTARY'], ['midwife', 'THE MIDWIFE'], ['mothers', 'THE MUMS']] },
  { id: 'sound', label: 'Sound', hint: '', opts: [[true, 'ON'], [false, 'OFF']] },
];
const SET = { darkfield: false, detail: 'standard', clinical: false, dof: true, hud: 'full', casa: false, layout: 'auto', narrator: 'system', sound: true };
try {
  const s = JSON.parse(localStorage.getItem('sd_settings') || '{}');
  for (const k in SET) if (k in s) SET[k] = s[k];
  // Older builds kept these separately.
  if (localStorage.getItem('sd_dof') === '0') SET.dof = false;
  if (localStorage.getItem('sd_sound') === '0') SET.sound = false;
} catch (e) { /* storage unavailable */ }
// Landscape layout: weapons down the left, a bigger minimap. Auto switches when the screen is wide.
const LAYOUT = { land: false, colW: 0 };
function applyLayout() {
  const w = window.innerWidth, h = window.innerHeight;
  LAYOUT.land = SET.layout === 'landscape' ? w > h : SET.layout === 'portrait' ? false : w > h * 1.15;
  LAYOUT.colW = LAYOUT.land ? 170 : 0;
  document.body.classList.toggle('land', LAYOUT.land);
  // The Android shell can lock the screen orientation to match.
  try { if (window.AndroidShell && AndroidShell.setOrientation) AndroidShell.setOrientation(SET.layout); } catch (e) { /* not in the app */ }
  if (typeof UI !== 'undefined' && typeof G !== 'undefined' && G) UI.refreshHud(true);
}
window.addEventListener('resize', () => applyLayout());
function saveSettings() { try { localStorage.setItem('sd_settings', JSON.stringify(SET)); } catch (e) { /* ignore */ } }

// ---------------------------------------------------------------- narrator packs
// Each pack overrides some System lines; anything it doesn't cover falls back to the System.
const NARRATORS = {
  system: { head: 'SYSTEM MESSAGE', lines: {} },
  documentary: {
    head: 'NARRATOR',
    lines: {
      start: ['Here, in the warm dark, four hundred million hopefuls begin the most competitive migration on Earth. Only one will arrive.', 'Dawn breaks over the cervix. The great swim begins.'],
      level: ['The young swimmer grows. Its tail is stronger now. Its choices are not.', 'Remarkable. With every meal of immune cells, our hero becomes a little more dangerous.', 'Growth, here, is not optional. It is the only way home.'],
      boss: ['And now the apex predator of the uterine savannah arrives. The others scatter. Ours does not. Brave, or simply confused.', 'A giant of the immune system. Few swimmers survive the encounter. Fewer still enjoy it.'],
      lowhp: ['Wounded, the swimmer must decide: flee, or fight on. It will, of course, fight on.', 'It is badly hurt. Out here, weakness is noticed quickly.'],
      rewind: ['Extraordinary. The swimmer has simply declined to accept the last four seconds.', 'Time itself folds back. Nature has never documented this before, and would prefer not to again.'],
      fusion: ['Two weapons become one. A partnership forged in desperation.'],
      cursed: ['It has taken the cursed gift. In the wild, curiosity is rarely rewarded. Let us watch.'],
      surge: ['The host has noticed the invasion. From here on, the landscape itself is hostile.'],
      idle: ['The egg waits at the heart of the chamber, vast and indifferent.', 'Every swimmer here is driven by a single instinct: arrive first.'],
      death: ['And so the journey ends, as it does for almost all of them. The cycle continues without it.', 'Absorbed. Its material will be reused. Nothing, here, is wasted.'],
      eggReady: ['Of four hundred million, one remains. The egg, at last, receives its visitor.'],
      finalFive: ['Six remain. The strongest of the strong, circling one another in the dark. Only one will be a person.'],
      rivalLevel: ['{n} grows stronger, level {l}, somewhere out in the chamber.', 'Across the chamber, {n} reaches level {l}. The race tightens.'],
      rivalEgg: ['{n} has reached the egg first and begins to force its way in. If it succeeds, our hero\'s story ends here.'],
      rivalDead: ['{n} has fallen. {k}', 'The chamber claims {n}. {k}'],
      rivalWin: ['{n} has done it. A new life begins, and it is not ours. Such is nature.'],
      amoebaHuge: ['An amoeba has consumed {n} of its neighbours. Left alone, it will simply keep eating.'],
      born: ['Against impossible odds, one swimmer has arrived. A life begins. Somewhere, a very long story starts here.'],
      slot: ['A new mount forms along the midpiece. Evolution, here, happens in minutes.'],
    },
  },
  midwife: {
    head: 'THE MIDWIFE',
    lines: {
      start: ['Right. Four hundred million of you, one egg, and I\'m on a double shift. Let\'s get this over with.', 'I\'ve delivered eleven thousand babies and not one of them started like this. Swim.'],
      level: ['Levelled up. Lovely. Very proud. Keep moving.', 'Oh, you\'ve grown. I\'ll alert the papers.', 'Another level. Still not a baby, is it.'],
      boss: ['Oh, that\'s a big one. Don\'t look at me, I\'m not paid for immune cells.', 'Here comes trouble. Breathe. No, not like that.'],
      lowhp: ['You\'re looking very peaky, love. Have a lie down. Not there.', 'That\'s a lot of damage for someone who hasn\'t been born yet.'],
      rewind: ['Did you just undo the last four seconds? We don\'t do that on my ward.', 'Rewinding, is it. Wish I could do that with my shifts.'],
      fusion: ['Two weapons into one. Tidy. At least someone\'s reducing clutter.'],
      cursed: ['You took the cursed one. Course you did. They always do.'],
      surge: ['Right, the body\'s fighting back now. It does that. Don\'t take it personally.'],
      idle: ['The egg\'s right there. I haven\'t got all day.', 'Push. Metaphorically.'],
      death: ['And that\'s that. Next!', 'Absorbed. I\'ll put it in the notes. Under "tried".'],
      eggReady: ['Just you left, is it? Go on then. Gently.'],
      finalFive: ['Final five. I have seen this a thousand times. It is always messy. Try not to get it on the walls.'],
      rivalLevel: ['{n}\'s at level {l}. I\'m not saying anything. I\'m just saying.', '{n}, level {l}. Their mum must be thrilled.'],
      rivalEgg: ['{n}\'s at the egg. If they get in first, I\'m filling out their paperwork, not yours.'],
      rivalDead: ['{n}\'s out. {k}', 'Oh dear. {n}. {k}'],
      rivalWin: ['{n} made it. Lovely healthy baby. Not you, obviously.'],
      amoebaHuge: ['There\'s an amoeba out there that\'s had {n} dinners. Somebody deal with that.'],
      born: ['There we are. Congratulations, it\'s Spermy. Ten fingers, ten toes, one ridiculous arsenal.'],
      slot: ['You\'ve grown an extra weapon mount. That is not in any textbook I own.'],
    },
  },
  mothers: {
    head: 'THE MUMS',
    lines: {
      start: ['Big Steve\'s mum here. My Steven\'s been training for this since Tuesday. Good luck to the rest of you, you\'ll need it.', 'Chad\'s mum. He\'s a lovely boy. Very strong tail. Just so you know.'],
      level: ['Kevin\'s mum: oh, you\'ve levelled up. Kevin levelled up earlier. Just saying.', 'Professor Wiggles\' mum: he has a doctorate, you know. Well done you, though.', 'Lil\' Zygo\'s mum: good for you, sweetheart. He\'s bigger.'],
      boss: ['Big Steve\'s mum: my Steven wouldn\'t be scared of that. My Steven would\'ve eaten it.', 'Chad\'s mum: don\'t get hurt, dear. Chad needs someone to beat.'],
      lowhp: ['Kevin\'s mum: oh, you look awful. Have you eaten?', 'Zygo\'s mum: that looked like it hurt. Good.'],
      rewind: ['Professor Wiggles\' mum: rewinding is cheating. I\'ve written to the committee.'],
      fusion: ['Chad\'s mum: Chad fused two weapons once. Four, actually.'],
      cursed: ['Big Steve\'s mum: taking the cursed card. Your mother must be so proud.'],
      surge: ['Kevin\'s mum: it\'s getting nasty out there. Kevin, love, wrap up warm.'],
      idle: ['All the mums: the egg is RIGHT THERE.'],
      death: ['Big Steve\'s mum: well. That\'s one fewer. Steven sends his condolences, and his regards.', 'Chad\'s mum: shame. Chad will be devastated. For about a second.'],
      eggReady: ['All the mums, quietly: well. It is you, then. Congratulations. We are fine. We are FINE.'],
      finalFive: ['All the mums: IT IS THE FINAL. Come on, boys! COME ON! Not you, Spermy.'],
      rivalLevel: ['{n}\'s mum: that\'s my boy! Level {l}! Did you see? Did everyone see?', '{n}\'s mum: level {l}. I always knew.'],
      rivalEgg: ['{n}\'s mum: HE\'S AT THE EGG. Oh I can\'t look. Stop him, would you? No, don\'t.'],
      rivalDead: ['{n}\'s mum: WHAT. {k}', '{n}\'s mum is now inconsolable. {k}'],
      rivalWin: ['{n}\'s mum: THAT\'S MY BABY. That\'s my baby! Sorry, love, better luck never.'],
      amoebaHuge: ['Kevin\'s mum: there\'s a thing out there that\'s eaten {n} people. Kevin, come home.'],
      born: ['All the mums, reluctantly: congratulations. You were very good. Our boys were better on the day, but well done.'],
      slot: ['Zygo\'s mum: another weapon slot? Zygo had seven by your age.'],
    },
  },
};
const BASE_LINES = Object.assign({}, SYSTEM_LINES);
function applyNarrator() {
  const pack = NARRATORS[SET.narrator] || NARRATORS.system;
  for (const k in BASE_LINES) SYSTEM_LINES[k] = pack.lines[k] || BASE_LINES[k];
}
function narratorHead(head) { return head === 'SYSTEM MESSAGE' ? (NARRATORS[SET.narrator] || NARRATORS.system).head : head; }
applyNarrator();
