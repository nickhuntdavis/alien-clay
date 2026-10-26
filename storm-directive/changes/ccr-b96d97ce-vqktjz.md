## 2026-10-26 Tackle Box and BUILD tab split by job (v10.169)
- Systems: ui (Tackle Box Loadout tab, pause BUILD tab)
- Files: pagesplit.js (new), index.html, ARCHITECTURE.md, tests/pagesplittest.js (new), tests/buildbtntest.js
- What: the Tackle Box is weapons, targeting and Feats: Autorun leaves it; each weapon row gains its branch, modifiers with rank pips, slots used and weapon mutations; Feat rows show level pips and forks taken; a Next panel (weapon upgrade, weapon slot) follows the Feats. The BUILD tab (sperm key) opens with Autorun as two columns of compact rows (current mode's full hint below), then Genome rows with pips, Upgrades (slotless cards held, with pips), Stat bonuses and the non-weapon Next lines. Hold a Genome or Upgrades row for its card.
- Save data: none
- Hooks: none in shared files. Replaces buildpanel.js bpHtml (statup.js's Stat bonuses wrap is folded in); wraps loadout.js loadoutHtml and ui.js UI.renderPause.
- Risk: a branch that wraps bpHtml before this loads loses its wrap (only statup.js did); the Loadout post-process keys on .lomv, .low, [data-go] and .lon in loadout.js.
