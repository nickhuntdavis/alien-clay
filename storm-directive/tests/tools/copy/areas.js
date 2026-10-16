'use strict';
// Which sheet tab each string goes on. First matching rule wins; ordered as the player meets things.
const TABS = [
  '1 Menus & Screens', '2 Tutorials & Hints', '3 Sequences', '4 Weapons', '5 Feats', '6 Cards & Upgrades',
  '7 Damage Types', '8 Enemies & Bosses', '9 Rivals & Egg', '10 Modes & Levels', '11 Narrator & Awards', '12 Other'
];
const RULES = [
  // [tab, file regexp, group regexp (optional)]
  [11, /data\.js/, /^(KILL_LINES|SYSTEM_LINES|LONGING_LINES|NO_REWARD|CARD_QUIPS|ACHIEVEMENTS|SPONSORS|GACHA_TIERS)$/],
  [11, /show\.js|silly\.js|finale\.js|twins\.js.*/, /LINES|WHISPERS|show|Show|SILLY|finale|^$/],
  [11, /settings\.js/, /NARRATORS/],
  [9, /data\.js/, /^RIVALS$/], [9, /rivals\.js|rrelics\.js/], [9, /game\.js/, /EGG_DEF|announceEgg/],
  [8, /data\.js/, /^(ENEMIES|BOSSES|OBSTACLES)$/], [8, /bosses\.js|brood\.js|portraits\.js|foes\.js/], [8, /levels\.js/, /LV_FOES|LV_BOSSES/],
  [7, /data\.js/, /^(ELEMENTS|REACTIONS|SYNERGIES)$/], [7, /chem\.js|quirks\.js/],
  [5, /data\.js/, /^SPELLS$/], [5, /spellfork\.js|seqfeats\.js|stamina\.js/],
  [4, /data\.js/, /^(WEAPONS|SIGS|PAIRINGS|MODS|DUOS)$/], [4, /arsenal\.js|toys\.js|genegun\.js|pairs2\.js|combos3\.js|sigs\.js|combos\.js|preview\.js|aim\.js/],
  [3, /genes\.js/, /PROFILES|PROFILE_SYNERGIES|SEQ_ABILITY/], [3, /reborn\.js|redtail\.js|twins\.js|seqlock\.js|seqreveal\.js|evolve\.js|seqsel\.js/],
  [3, /prestige\.js/, /BABY_TRAITS|GEN_NAMES|babyTick|openBirth|bornCards/],
  [6, /data\.js/, /^(PASSIVES|PERKS|ADAPT|PERK_ADAPT|CURSES|RELICS|POWERUPS|DYES|DIRECTIVES|MOVE_DIRECTIVES|RARITIES)$/],
  [6, /boons\.js|junk\.js|spoils\.js|pickups\.js|grants\.js|juice\.js|redtail\.js/], [6, /genes\.js/], [6, /game\.js/, /^opt|label|desc|^$/],
  [2, /tutorial\.js|intro\.js|statusintro\.js|glossary\.js/],
  [10, /data\.js/, /^SAMPLES$/], [10, /campaign\.js|waves\.js|dishfx\.js|levels\.js|events\.js|td\.js|terrain\.js|prestige\.js/],
  [1, /index\.html|ui\.js|settings\.js|lab\.js|splash\.js|debug\.js|daily\.js|meta\.js|render\.js|icons\.js/],
];
function tabOf(r) {
  for (const [t, f, g] of RULES) if (f.test(r.file) && (!g || g.test(r.group || ''))) return TABS[t - 1];
  return TABS[11];
}
module.exports = { TABS, tabOf };
