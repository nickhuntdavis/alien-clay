'use strict';
// Spawn Prawn - weapon tags (redesign docs/COMBAT_MATRIX.md 15.1; base tags in redesign docs/WEAPON_TAGS.md).
// Every N/A row, pair-bonus condition and combo-mastery condition is written against a tag, never a weapon name.
//  - WTAG_IDS: the fixed vocabulary. WTAGS: each weapon's base tags (W24 ids plus sample 9's three acro_ ids).
//  - wTags(w): a Set, live. The base tags plus the ones its modifiers and type add while equipped: displaces (Knockback,
//    Pulling, Gravity, Lunge), places (Mines, Death from Above, Delayed, Lobbed, Trail), chains, orbits, pets, burns
//    (the internal type 'flame' is the player-facing Fire; 'fire' is Acid and does not burn).
//  - Weapons not in the table (v9 arms) get derived base tags from their attack type (WTAGS_DERIVED).
//  - wHas(w, tag), wTagsBase(id). A load-time check warns (never throws) about a W24 id with no WTAGS row.
// Hooks: none. Read-only; loaded after modwide.js (needs modHas, mwR, w24Key, W24_IDS).

const WTAG_IDS = ['shots', 'beam', 'burst', 'melee', 'places', 'displaces', 'chains', 'burns', 'pets', 'orbits'];
const WTAGS = {
  v_phys_proj: ['shots'],
  v_phys_spread: ['shots'],
  v_phys_contact: ['melee', 'displaces'],
  v_phys_burst: ['burst', 'displaces'],
  v_fire_proj: ['shots'],
  v_shock_beam: ['beam'],
  v_ice_pool: ['places'],
  v_arcane_proj: ['shots'],
  v_soul_proj: ['shots'],
  v_flame_pool: ['places', 'burns'],
  s_void: ['shots', 'displaces', 'places'],
  s_lard: ['burst', 'displaces'],
  s_siphon: ['shots'],
  s_mines: ['burst', 'places', 'burns'],
  s_twin: ['beam', 'chains'],
  s_tesla: ['shots', 'chains'],
  s_redtape: ['shots'],
  s_bubble: ['shots', 'places'],
  s_duedate: ['shots'],
  s_seeker: ['shots'],
  s_peekaboo: ['burst'],
  s_toothfairy: ['burst', 'places'],
  s_parasite: ['shots', 'pets'],
  s_wake: ['places', 'burns'], // (not in WEAPON_TAGS.md: Fire Pool, so by the table's own rule: places, burns)
  acro_cap: ['melee'],         // (Acid Contact; not in WEAPON_TAGS.md)
  acro_spray: ['shots'],       // (Acid Spread)
  acro_spark: ['beam', 'burns'], // (Fire Beam)
  v_flame_beam: ['beam', 'burns'], // (Laser, laser.js: "Laser (new)" in WEAPON_TAGS.md)
};
// Weapons outside that table (the v9 arms in v9arms.js) get the attack-type tag from the W24 attack column, plus burns for Fire.
// Derived, not hand-checked: edit WTAGS above to override one. WTAGS_DERIVED lists them.
const WTAGS_DERIVED = [];
const WTAG_BY_ATK = { proj: 'shots', spread: 'shots', beam: 'beam', burst: 'burst', contact: 'melee', pool: 'places' };
for (const id of W24_IDS) {
  const b = W24_BY[id];
  if (WTAGS[id] || !b || !WTAG_BY_ATK[b.atk]) continue;
  WTAGS[id] = [WTAG_BY_ATK[b.atk]].concat(b.type === 'flame' ? ['burns'] : []); WTAGS_DERIVED.push(id);
}

const wTagsBase = id => new Set(WTAGS[id] || []);

function wTags(w) {
  const t = wTagsBase(w24Key(w));
  if (!w) return t;
  const has = id => typeof modHas === 'function' && modHas(w, id);
  const r = id => (typeof mwR === 'function' ? mwR(w, id) : 0);
  if (r('knock') || r('pull') || has('gravity') || has('lunge')) t.add('displaces');
  if (r('mines') || r('dfa') || has('delayed') || has('lobbed') || has('trail')) t.add('places');
  if (has('chaining')) t.add('chains');
  if (has('orbiting')) t.add('orbits');
  if (has('summoned')) t.add('pets');
  const ty = w.typeOver || (w.def && w.def.elem) || (W24_BY[w24Key(w)] || {}).type;
  if (ty === 'flame') t.add('burns');
  return t;
}
const wHas = (w, tag) => wTags(w).has(tag);

(function () {
  const miss = W24_IDS.filter(id => !WTAGS[id]);
  if (miss.length) console.warn('wtags: no tags for ' + miss.join(', '));
})();
