'use strict';
// Spawn Prawn - v10 look: Arcade is the only view (Lab view retired, COMBAT_MATRIX decisions 20, 21, 28), and one palette
// for the seven damage types (DAMAGE_TYPES.md): Force white/pale grey, Acid shocking pink, Static yellow, Mucus green,
// Blood red, Alien purple, Fire orange. Internal ids stay phys/fire/shock/ice/arcane/soul/flame.
// Loads FIRST (before data.js). window.V10_OFF restores the old look.
// Hooks: data.js ELEMENTS colours, settings.js (viewArcade, immersiveOn, view row hide), render.js (ELEM_SWAP l10Swap, acid
// terrain colours), ui.js settings row filter, tutorial.js viewOffer, v10.js V10_COL, fight.js/pdef.js/mutations.js/feats10.js colours.
const L10 = !(typeof window !== 'undefined' && window.V10_OFF);
const TYPE_PAL = L10
  ? { phys: '#e8eef8', fire: '#ff2fa8', shock: '#ffe94a', ice: '#7fd04a', arcane: '#c9184a', soul: '#b06cff', flame: '#ff6a2a' }
  : { phys: '#e8eef8', fire: '#c6ff3d', shock: '#ffe94a', ice: '#a8b84a', arcane: '#c9184a', soul: '#bff4ff', flame: '#ff6a2a' };
const DEF_PAL = { membrane: '#5aa9ff', shell: '#9a6b3f', thorns: '#d8c9a8' }; // (DEFENCE_TYPES.md: Membrane blue ring, Shell brown rings)
// Acid terrain (pools, crypts): dark centre, bright rim, bubbles.
const ACID_TERR = L10 ? { dk: '#7a0f55', mid: '#ff2fa8', fleck: '#ffc2e6', bub: '255,194,230' } : { dk: '#3d5a1f', mid: '#7fbf2a', fleck: '#c6f07a', bub: '230,255,190' };
// Old acid greens become Acid pink and old Mucus olives Mucus green, wherever code still hard-codes them (col() runs ELEM_SWAP).
const L10_REMAP = {
  '#c6ff3d': '#ff2fa8', '#a8e61d': '#e0208f', '#d4ff6b': '#ff6fc4', '#b5f23a': '#ff49b5', '#e2ff9a': '#ff9bd8', '#9fd61a': '#d41a85', '#ccff4d': '#ff5cbc',
  '#7fbf2a': '#ff2fa8', '#3d5a1f': '#7a0f55', '#c6f07a': '#ffc2e6',
  '#a8b84a': '#7fd04a', '#b5c96a': '#9be070', '#e3e8c0': '#d4f5bd',
};
function l10Swap(m) {
  if (!L10) return;
  for (const [k, v] of m) if (L10_REMAP[v]) m.set(k, L10_REMAP[v]);
  for (const k in L10_REMAP) m.set(k, L10_REMAP[k]);
}
