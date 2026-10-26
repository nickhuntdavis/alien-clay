'use strict';
// Spawn Prawn - v10 look: Arcade is the default view (Lab is a Settings option again since v10.32), and one palette
// for the seven damage types (DAMAGE_TYPES.md): Force white/pale grey, Acid shocking pink, Static yellow, Mucus green,
// Blood red, Parasite purple, Fire orange. Internal ids stay phys/fire/shock/ice/arcane/soul/flame.
// Loads FIRST (before data.js).
// Hooks: data.js ELEMENTS colours, settings.js (default view, one-time Arcade reset SET.lab10), render.js (ELEM_SWAP l10Swap, acid
// terrain colours), ui.js settings row filter, tutorial.js viewOffer, v10.js V10_COL, fight.js/pdef.js/mutations.js/feats10.js colours.
const L10 = true; // (always on since the v9 fallback went: v10.js)
// (The v10 values must match the --color-type-* tokens at the top of style.css and the Figma color/type/* variables.)
const TYPE_PAL = { phys: '#e8eef8', fire: '#ff2fa8', shock: '#ffe94a', ice: '#7fd04a', arcane: '#c9184a', soul: '#b06cff', flame: '#ff6a2a' };
const DEF_PAL = { membrane: '#5aa9ff', shell: '#9a6b3f', thorns: '#d8c9a8' }; // (DEFENCE_TYPES.md: Membrane blue ring, Shell brown rings)
// Acid terrain (pools, crypts): dark centre, bright rim, bubbles.
const ACID_TERR = { dk: '#7a0f55', mid: '#ff2fa8', fleck: '#ffc2e6', bub: '255,194,230' };
// Old acid greens become Acid pink and old Mucus olives Mucus green, wherever code still hard-codes them (col() runs ELEM_SWAP).
const L10_REMAP = {
  '#c6ff3d': '#ff2fa8', '#a8e61d': '#e0208f', '#d4ff6b': '#ff6fc4', '#b5f23a': '#ff49b5', '#e2ff9a': '#ff9bd8', '#9fd61a': '#d41a85', '#ccff4d': '#ff5cbc',
  '#7fbf2a': '#ff2fa8', '#3d5a1f': '#7a0f55', '#c6f07a': '#ffc2e6',
  '#a8b84a': '#7fd04a', '#b5c96a': '#9be070', '#e3e8c0': '#d4f5bd',
};
function l10Swap(m) {
  for (const [k, v] of m) if (L10_REMAP[v]) m.set(k, L10_REMAP[v]);
  for (const k in L10_REMAP) m.set(k, L10_REMAP[k]);
}
