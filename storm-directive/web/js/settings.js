'use strict';
// Spawn Prawn - player settings (saved on the device).

// tab: which Settings tab it sits on. hint: shown under (?). off(): a reason it does nothing right now (the row dims).
// slider: a 0 to 100% volume instead of chips.
const SETTINGS_DEF = [
  // GAME
  { id: 'speed', tab: 'game', label: 'Game speed', hint: 'How fast the whole game runs. Also in the pause menu. The run log notes the speeds you played at.', opts: [[0.5, 'x0.5'], [0.75, 'x0.75'], [1, 'x1'], [1.5, 'x1.5'], [2, 'x2']] },
  { id: 'autoFire', tab: 'game', label: 'Autofire', hint: 'ON: your weapons fire by themselves. OFF: each weapon gets a FIRE button on the right; hold it to fire, tap for one shot.', opts: [[true, 'ON'], [false, 'OFF']] },
  { id: 'featAuto', tab: 'game', label: 'Feat timing', hint: 'AUTOMATIC: each Feat performs itself as soon as it is ready (you can still tap one to perform it early). WHEN I TAP: Feats wait for your tap, so you can save one for the right moment.', opts: [[true, 'AUTOMATIC'], [false, 'WHEN I TAP']] },
  { id: 'auto', tab: 'game', label: 'Full Auto', hint: 'Picks DNA strands, weapons and upgrades at random for you, so a run plays itself. Also the AUTO button in the pause menu.', opts: [[false, 'OFF'], [true, 'ON']] },
  { id: 'autoWaves', tab: 'game', label: 'Full Auto starts waves', hint: 'In the Petri Dish, Full Auto also starts the next wave for you.', opts: [[true, 'ON'], [false, 'OFF']], off: () => !SET.auto && 'Only with Full Auto on.' },
  { id: 'inspect', tab: 'game', label: 'Tap an enemy', hint: 'Tap an enemy for its card (health, weaknesses, a joke). PAUSE stops the game while the card is open; HALF SPEED keeps it running slowly.', opts: [['pause', 'PAUSE'], ['half', 'HALF SPEED']] },
  { id: 'intros', tab: 'game', label: 'New enemy introductions', hint: 'The first time you meet an enemy or rival. FULL stops the slide for its card; QUIET shows a short message and keeps playing; AUTO does the full card for your first five, then goes quiet; OFF says nothing. Everything still goes in your Field Guide. Bosses always get their full entrance.', opts: [['auto', 'AUTO'], ['full', 'FULL'], ['quiet', 'QUIET'], ['off', 'OFF']] },
  // SCREEN
  { id: 'view', tab: 'screen', label: 'View', hint: 'LAB: a real microscope. Nothing on the slide has colour, you included; effects show in each cell\'s body. ARCADE: everything in full colour, with coloured rings that drain as effects run out.', opts: [['lab', 'LAB'], ['arcade', 'ARCADE']] },
  { id: 'menus', tab: 'screen', label: 'Menus', hint: 'PAPER: grey e-ink, easy to read in daylight. INK: black, easier on the eyes in the dark. AUTO: follows your phone\'s dark setting. The slide has its own Darkfield setting.', opts: [['paper', 'PAPER'], ['ink', 'INK'], ['auto', 'AUTO']] },
  { id: 'darkfield', tab: 'screen', label: 'Darkfield', hint: 'A black field with bright specimens (a real microscopy technique).', opts: [[false, 'OFF'], [true, 'ON']] },
  { id: 'clinical', tab: 'screen', label: 'Clean clinical view', hint: 'No grain, lens blur, vignette, halos or eyepiece dust. The most readable picture.', opts: [[false, 'OFF'], [true, 'ON']] },
  { id: 'dof', tab: 'screen', label: 'Depth of field', hint: 'Out-of-focus layers and a soft lens blur at the edges.', opts: [[true, 'ON'], [false, 'OFF']], off: () => SET.clinical && 'Clean clinical view turns this off.' },
  { id: 'detail', tab: 'screen', label: 'Specimen detail', hint: 'HIGH adds organelles, textures and a proper zona breach. Costs a little performance.', opts: [['standard', 'STANDARD'], ['high', 'HIGH']] },
  { id: 'fx', tab: 'screen', label: 'Your effects', hint: 'How strongly your shots, trails and sparks are drawn. AUTO fades them back when the screen gets busy, so enemies and their bullets stay readable.', opts: [['auto', 'AUTO'], ['faded', 'FADED'], ['full', 'FULL']] },
  { id: 'dmgNums', tab: 'screen', label: 'Damage numbers', hint: 'ALL: numbers for hits bigger than your usual (small hits are always quiet). BIG HITS: only crits and hits at least twice your usual. OFF: none.', opts: [['all', 'ALL'], ['big', 'BIG HITS'], ['off', 'OFF']] },
  { id: 'shake', tab: 'screen', label: 'Screen shake', hint: 'The slide jolts on explosions, big hits and bosses. OFF keeps the view perfectly still.', opts: [[true, 'ON'], [false, 'OFF']] },
  { id: 'layout', tab: 'screen', label: 'Layout', hint: 'LANDSCAPE puts your weapons down the side. AUTO follows the way you hold the phone.', opts: [['auto', 'AUTO'], ['portrait', 'PORTRAIT'], ['landscape', 'LANDSCAPE']] },
  { id: 'fpsCap', tab: 'screen', label: 'Frame rate', hint: '60 is smoother over a whole run: on a 90 or 120 Hz screen it halves the work, so the phone stays cooler and has room for busy moments.', opts: [[60, '60'], [0, 'UNCAPPED']] },
  // SOUND
  { id: 'sfxVol', tab: 'sound', label: 'Sound effects', hint: 'Shots, hits, pickups and menus. 0% is silent.', slider: true },
  { id: 'musVol', tab: 'sound', label: 'Music', hint: 'It builds with the fight: busier swarms, bosses and the Final Five each change it. 0% turns it off.', slider: true },
  { id: 'vibe', tab: 'sound', label: 'Vibration', hint: 'Buzzes on big hits, kills, level ups and bosses.', opts: [[true, 'ON'], [false, 'OFF']] },
];
const SET_TABS = [['game', 'GAME'], ['screen', 'SCREEN'], ['sound', 'SOUND'], ['data', 'DATA']];
const SET_DEFAULTS = { view: 'arcade', fx: 'auto', darkfield: false, detail: 'standard', clinical: false, dof: true, fpsCap: 60, layout: 'auto', sfxVol: 1, musVol: 1, shake: true, vibe: true, auto: false, autoWaves: true, intros: 'auto', inspect: 'pause', speed: 1, featAuto: true, autoFire: true, immersive: 'auto', menus: 'paper', dmgNums: 'all', setTab: 'game', lab10: 0 };
const SET = Object.assign({}, SET_DEFAULTS);
// Sound or music at 0% counts as off (the old ON/OFF switches became volumes in v9.20).
// Immersive mode: AUTO means on in Arcade view.
const immersiveOn = () => true; // (the Figma Immersive HUD is the only in-run HUD since the design-system port; SET.immersive is ignored)
const soundOn = () => SET.sfxVol > 0 || SET.musVol > 0;
try {
  const s = JSON.parse(localStorage.getItem('sd_settings') || '{}');
  for (const k in SET) if (k in s) SET[k] = s[k];
  // Older builds kept these separately, or as switches.
  if (localStorage.getItem('sd_dof') === '0') SET.dof = false;
  if (s.sound === false || localStorage.getItem('sd_sound') === '0') { SET.sfxVol = 0; SET.musVol = 0; }
  if (s.music === false) SET.musVol = 0;
  if (s.immersive === false && !('setTab' in s)) SET.immersive = 'auto'; // (OFF was the old default: AUTO is the new one, v9.20)
  if (SET.view === 'eink') { SET.view = 'arcade'; SET.menus = 'paper'; } // (the EINK view became the only menu style: Menus PAPER / INK)
  if (s.fullColour && !s.view) SET.view = 'arcade'; // (Full colour became Arcade view in v9.11)
  if (!s.lab10) { SET.view = 'arcade'; SET.lab10 = 1; } // (v10 starts everyone in Arcade once; Lab is an option again from v10.32)
  if (!SET_TABS.some(t => t[0] === SET.setTab)) SET.setTab = 'game';
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
// Arcade view: everything in full colour (no stains to find any more). Lab view: the grey slide.
const viewArcade = () => SET.view === 'arcade'; // (v10: Arcade by default, Lab an option again)
// Menus: every DOM screen and the HUD use the e-ink design system (eink.css, always on). Menus picks the mode:
// PAPER (html.paper, the default), INK (html.ink) or AUTO (html.menus-auto: follows the phone's dark setting).
function applyEink() { const m = SET.menus || 'paper', r = document.documentElement, l = document.getElementById('einkCss'); if (l) l.media = 'all'; r.classList.toggle('paper', m === 'paper'); r.classList.toggle('ink', m === 'ink'); r.classList.toggle('menus-auto', m === 'auto'); }
applyEink();
function saveSettings() { try { localStorage.setItem('sd_settings', JSON.stringify(SET)); } catch (e) { /* ignore */ } }

// The one caption header for the old narrator strip (show.js sysLine): no narrator personas since 29 Oct 2026.
function narratorHead(head) { return head === 'SYSTEM MESSAGE' ? 'LAB LOG' : head; }
