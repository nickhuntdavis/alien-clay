'use strict';
// Spawn Prawn - which pictogram (pictos.js) goes with which thing in the game. Keys are the Figma names in kebab case,
// with a category prefix for everything but weapons, situations and run events ('feat/little-bubble', 'stat/xp').
// Names are looked up in the preferred category first, then everywhere, so new content with a matching Figma
// pictogram picks it up by itself. PICTO_ALIAS covers things that share a pictogram (stat genes, Gene Bank traits,
// baby traits, the "More ..." reaction mutations).
// Owns: pictoKey(name, kind), pictoFor(name, kind, cls), defPicto(def, colour), lootPictoHtml(o), PICTO_ALIAS. Hooks: none (index.html
// script tag after pictos.js; ui.js and friends call these where a card or row leads with an icon). Save data: none.

const pictoSlug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const PICTO_PREFIX = { weapon: '', feat: 'feat/', mutation: 'mutation/', reaction: 'reaction/', gene: 'gene/', stat: 'stat/', powerup: 'power-up/', modifier: 'modifier/', defence: 'defence/', achievement: 'achievement/', rival: 'rival/', event: '' };
const PICTO_ALIAS = {
  // Lateral Gene Transfer cards that are a plain stat (Figma Content page)
  'gene:quick-off-the-mark': 'stat/swim-speed', 'gene:darting': 'stat/dodge', 'gene:thick-skin': 'stat/armour', 'gene:swarm-mind': 'stat/area',
  'gene:light-fingered': 'stat/pickup-range', 'gene:wriggle-through': 'stat/pierce', 'gene:colony': 'stat/xp', 'gene:licence-to-kill': 'stat/crit-chance',
  'gene:alpha': 'stat/damage', 'gene:booster-shot': 'stat/fire-rate', 'gene:shell-suit': 'stat/armour', 'gene:second-wind': 'feat/second-wind',
  'gene:hard-skin': 'stat/crit-damage', 'gene:clear-your-throat': 'stat/projectile-speed', 'gene:bless-you': 'stat/dodge',
  // Gene Bank (META_BONUSES)
  'bank:hp': 'defence/thicker-membrane', 'bank:dmg': 'stat/damage', 'bank:xp': 'stat/xp', 'bank:reroll': 'achievement/peer-reviewed', 'bank:grip': 'gene/cilia',
  'bank:magnet': 'stat/pickup-range', 'bank:rewind': 'achievement/time-paradox-murder', 'bank:armour': 'stat/armour', 'bank:luck': 'achievement/bad-decision-maker',
  'bank:crit': 'stat/crit-chance', 'bank:incubated': 'mutation',
  // Baby Traits (BABY_TRAITS)
  'baby:colic': 'feat/jump-scare', 'baby:chubby': 'stat/max-hp', 'baby:teething': 'stat/crit-damage', 'baby:terrible': 'stat/damage', 'baby:babytalk': 'stat/xp',
  'baby:cradlecap': 'stat/armour', 'baby:grabby': 'stat/pickup-range', 'baby:naptime': 'stat/regen', 'baby:vomit': 'stat/fire-rate',
  'baby:silverspoon': 'achievement/bad-decision-maker', 'baby:dummy': "achievement/baby-s-first-homicide",
  // Mutations that speed up a status bar
  'mutation:eaten-away': 'corroded', 'mutation:slow-burn': 'burning', 'mutation:thin-veil': 'possessed', 'mutation:off-balance': 'stagger',
  // Statuses with no pickup of their own
  'powerup:stuck-in-yeast': 'snared', 'powerup:pill': 'snared', 'powerup:infection': 'identical-twins', 'powerup:armour': 'stat/armour', 'powerup:crumple-zone': 'defence/shell-layer',
  // Stat upgrades (PASSIVES, the UPGRADE cards)
  'passive:might': 'stat/damage', 'passive:haste': 'stat/fire-rate', 'passive:reload': 'stat/fire-rate', 'passive:mag': 'stat/fire-rate', 'passive:multishot': 'mutation/mitosis', 'passive:velocity': 'stat/projectile-speed', 'passive:area': 'stat/area', 'passive:duration': 'one-of-these-days', 'passive:pierce': 'stat/pierce', 'passive:crit': 'stat/crit-chance', 'passive:critdmg': 'stat/crit-damage', 'passive:vital': 'stat/max-hp', 'passive:regen': 'stat/regen', 'passive:grip': 'gene/cilia', 'passive:hydro': 'gene/hard-head', 'passive:speed': 'stat/swim-speed', 'passive:armour': 'stat/armour', 'passive:luck': 'achievement/bad-decision-maker', 'passive:vamp': 'power-up/leech', 'passive:pyro': 'acid', 'passive:cryo': 'nocturnal-emission', 'passive:storm': 'charged', 'passive:toxin': 'power-up/oxytocin', 'passive:arcanum': 'bleeding', 'passive:kinetic': 'gene/hard-head', 'passive:lungs': 'stat/stamina', 'passive:secondwind': 'feat/second-wind', 'passive:cardio': 'stat/stamina', 'passive:efficient': 'stat/stamina', 'passive:cocktail': 'mutation/crossed-wires', 'passive:chainreact': 'mutation/crossed-wires', 'passive:mixologist': 'reaction/held-in-suspension', 'passive:catalyst': 'lab-bench', 'passive:echo': 'one-of-these-days', 'passive:scholar': 'stat/xp', 'passive:lastround': 'achievement/the-last-word', 'passive:tactical': 'mutation/hair-trigger', 'passive:focus': 'hunt', 'passive:overkill': 'mutation/serial-monogamy', 'passive:crossfire': 'hunt', 'passive:momentum': 'mutation/slipstream', 'passive:anchorlink': 'soulmate-signal', 'passive:future': 'achievement/spoilers', 'passive:ram': 'gene/hard-head', 'passive:heft': 'gene/big-boned', 'passive:thorns': 'defence/thorns', 'passive:grit': 'gene/hard-to-kill', 'passive:evasion': 'stat/dodge', 'passive:bankshot': 'modifier/ricochet', 'passive:batteries': 'charged', 'passive:castiron': 'acid', 'passive:brushoff': 'gene/cilia', 'passive:withflow': 'waters-breaking', 'passive:skidmarks': 'the-runs',
  'passive:plating': 'defence/latex-protection', 'passive:flinch': 'stat/dodge', 'passive:fullload': 'stat/stamina', 'passive:temporal': 'achievement/undo-button-enthusiast', 'passive:echoinherit': 'feat/vanishing-twin', 'passive:oldsoul': 'stat/xp', 'passive:musclememory': 'stat/fire-rate', 'passive:ninelives': 'stat/dodge', 'passive:moonshinep': 'power-up/oxytocin', 'passive:thickskin': 'stat/armour',
  'achievement:tag-you-re-it': 'tagged-specimen',
  // Autorun: NEST's id is 'defend'
  'move:defend': 'nest',
};
// The pictogram key for a name (or id) of a kind, or '' when there is none.
function pictoKey(name, kind) {
  if (typeof PICTO_SRC === 'undefined' || name == null) return '';
  const s = pictoSlug(name), a = PICTO_ALIAS[(kind || '') + ':' + s];
  if (a && PICTO_SRC[a]) return a;
  if (kind === 'mutation' && /^more-/.test(s)) { const r = s.slice(5); if (PICTO_SRC['reaction/' + r]) return 'reaction/' + r; if (PICTO_SRC['feat/' + r]) return 'feat/' + r; }
  const pre = PICTO_PREFIX[kind];
  if (pre != null && PICTO_SRC[pre + s]) return pre + s;
  if (PICTO_SRC[s]) return s;
  for (const p of Object.values(PICTO_PREFIX)) if (p && PICTO_SRC[p + s]) return p + s;
  // a stat upgrade named on a card (PASSIVES): its shared stat pictogram
  if (kind !== 'passive' && typeof PASSIVES !== 'undefined') { const pid = Object.keys(PASSIVES).find(id => pictoSlug(PASSIVES[id].name) === s); if (pid) return pictoKey(pid, 'passive'); }
  return '';
}
// Inline SVG for a name of a kind ('' when there is none).
function pictoFor(name, kind, cls) { const k = pictoKey(name, kind); return k ? pictoSVG(k, cls) : ''; }

// A loot / reward card's pictogram tile: the item's own pictogram, else its reward category's. In the item's colour.
function lootPictoHtml(o) {
  if (!o) return '';
  let k = '', col = '';
  const cat = typeof rwCatOf === 'function' ? rwCatOf(o) : null;
  if (o.def) { k = pictoKey(o.def.name, o.def.isSpell || (typeof F10 !== 'undefined' && F10[o.def.key]) ? 'feat' : 'weapon'); col = o.elem ? elemCol(o.elem) : ''; }
  else if (cat) {
    const kind = { feat: 'feat', modifier: 'modifier', defence: 'defence', mutation: 'mutation' }[cat];
    if (kind) k = pictoKey(o.title, kind);
    if (!k && /^(GENE|LATERAL|JUNK)/i.test(o.tag || '')) k = pictoKey(o.title, 'gene');
    if (!k) k = pictoKey(cat);
    col = typeof rwCol === 'function' ? rwCol(o) : '';
  } else k = pictoKey(o.title, 'gene') || pictoKey(o.title);
  if (!k && typeof PASSIVES !== 'undefined') { const pid = Object.keys(PASSIVES).find(id => PASSIVES[id].name === o.title); if (pid) k = pictoKey(pid, 'passive'); }
  if (!k) return '';
  return `<div class="cico pk"${pictoInk(col) ? ` style="--ic:${col}"` : ''}>${pictoSVG(k)}</div>`;
}
// A type colour is only used for a pictogram if it reads on paper: near-white ones (Force) fall back to ink.
function pictoInk(col) {
  const m = /^#([0-9a-f]{6})/i.exec(col || ''); if (!m) return !!col;
  const v = parseInt(m[1], 16), l = ((v >> 16) & 255) * 0.3 + ((v >> 8) & 255) * 0.59 + (v & 255) * 0.11;
  return l < 200;
}
// A weapon's or Feat's pictogram in its colour, or '' (callers fall back to the line icon).
function defPicto(def, col) {
  if (!def) return '';
  const k = pictoKey(def.name, def.isSpell || (typeof F10 !== 'undefined' && F10[def.key]) ? 'feat' : 'weapon');
  return k ? `<span class="pk"${pictoInk(col) ? ` style="--pc:${col}"` : ''}>${pictoSVG(k)}</span>` : '';
}
// How to Play (#how under the title): each paragraph leads with a pictogram for its rule (Figma 15 How to Play).
const HOW_PICTO = { 'you are spermy': 'swimmer', 'weapon trees': 'branch', 'amoebas': 'achievement/portion-control', 'swimming takes skill': 'gene/cilia',
  'rival champions': 'rival/big-steve', "you don't aim": 'shoot', 'tackle box': 'achievement/aftermarket-parts', 'weapon drafts': 'weapon',
  'autorun directive': 'kite', 'dna strands': 'power-up/dna-strand', 'modifiers': 'modifier', 'fusion': 'conjoined', 'damage types': 'mutation/crossed-wires',
  'rewind': 'achievement/undo-button-enthusiast', 'deep trees': 'branch', 'modifier forge': 'modifier/wind-up', 'krill': 'school', 'run log': 'achievement/statistically-powered',
  'yeast infections': 'identical-twins', 'the morning-after pill': 'needle', 'zoom': 'achievement/peer-reviewed', 'mutations': 'mutation', 'gene bank': 'mutation',
  'settings': 'modifier', "the egg's glow": 'egg' };
function howPictos() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('#how > p').forEach(p => {
    const b = p.querySelector('b'); if (!b || p.querySelector('.picto')) return;
    const t = b.textContent.toLowerCase().replace(/[.:]+$/, ''), key = Object.keys(HOW_PICTO).find(k => t.startsWith(k));
    if (!key || !PICTO_SRC[HOW_PICTO[key]]) return;
    p.classList.add('howp'); p.insertAdjacentHTML('afterbegin', pictoSVG(HOW_PICTO[key])); const body = document.createElement('span'); while (p.childNodes.length > 1) body.appendChild(p.childNodes[1]); p.appendChild(body);
  });
}
if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', howPictos); else howPictos(); }
