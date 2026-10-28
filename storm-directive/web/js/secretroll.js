'use strict';
// Spawn Prawn - a secret reroll on the Weapon Draft (user, 28 Oct): an invisible tap zone in the top-right corner deals
// the draft again, as often as you like, free. It re-opens the same request (UI.openDraft), so every draft kind (new
// weapon, mount, branch, Feat path, weapon tiers) rerolls through its own generator; the box count is left as it was.
// A Daily Challenge's fixed weapons (req.fixed) and the start draft (always the sample's three, samplekit.js) only
// reshuffle. No text: it is a secret.
// Hooks: none in shared files. Adds #dSecretRoll to #draft (style.css). Loads after ui.js and samplekit.js.
function srRoll() {
  const D = UI.draft;
  if (!G || G.state !== 'loot' || !D || !D.req || D.req.kind === 'level' || UI.pickedOne) return;
  const st = G.stats, boxes = st.boxes, by = st.boxBy && Object.assign({}, st.boxBy);
  if (D.pv) { dropPreview(D.pv); D.pv = null; }
  UI.openDraft(D.req);
  st.boxes = boxes; if (by) st.boxBy = by; // (a reroll is not another box)
  G.stats.secretRolls = (G.stats.secretRolls || 0) + 1;
}
{
  const b = document.createElement('button');
  b.id = 'dSecretRoll'; b.type = 'button'; b.tabIndex = -1;
  b.addEventListener('click', e => { e.stopPropagation(); srRoll(); });
  const box = document.getElementById('draft'); if (box) box.appendChild(b);
}
