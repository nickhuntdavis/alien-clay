'use strict';
// Spawn Prawn - V11 reward screens (user, 21 Oct): one heading per kind of choice, and weapon drafts can be skipped.
//  - Headings (the V11 brief's table): general upgrades CHOOSE AN UPGRADE, weapon choices CHOOSE A WEAPON, weapon
//    upgrades and modifications UPGRADE A WEAPON, mutations CHOOSE A MUTATION (a rescue keeps CHOOSE YOUR DIFFERENCE:
//    kindred.js). Subtitles are unchanged. A rule-breaking box (weird.js) keeps its own title.
//  - Skip on the Weapon Draft screen (every weapon draft but the first): the mount stays empty for a later draft or a
//    rescue to fill, and you get V11UI.skipRerolls rerolls.
// Hooks: none in shared files. Wraps UI.openLoot and UI.openDraft (loads after kindred.js); listens on #skipBtn.

const V11UI = { skipRerolls: 2 };
const V11_HEAD = { level: 'CHOOSE AN UPGRADE', chest: 'CHOOSE AN UPGRADE', boss: 'CHOOSE AN UPGRADE', wup: 'UPGRADE A WEAPON', wupfork: 'UPGRADE A WEAPON', mutation: 'CHOOSE A MUTATION' };

function v11Head(req) {
  if (!V10 || req.rule || req.imm) return;
  let h = V11_HEAD[req.kind];
  if ((req.kind === 'chest' || req.kind === 'boss') && typeof boxModsOnly === 'function' && boxModsOnly()) h = 'UPGRADE A WEAPON';
  if (h) $('lootTitle').textContent = h;
}

// Skipping a screen counts as closing it: anything else waiting follows at once (director.js DIRECTOR.chain).
const v11Chain = () => { if (G && G.state === 'play' && G.lootQueue.length && typeof dirS === 'function') dirS().chain = G.t; };
function v11Skip() {
  if (!G || G.state !== 'loot' || UI.v11Draft !== UI.lootReq || UI.lootReq.kind !== 'slot' || performance.now() - UI.lootOpenT < 500) return;
  clearPreviews(); G.rerolls += V11UI.skipRerolls; sfx('pickup');
  G.state = 'play'; UI.v11Draft = null; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now();
  v11Chain();
}

{
  const open = UI.openLoot, draft = UI.openDraft;
  $('skipBtn').addEventListener('click', v11Chain); // (after ui.js's own skip handler)
  UI.openLoot = function (req) {
    open.call(UI, req);
    if (G && G.state === 'loot' && UI.v11Draft !== req) v11Head(req);
  };
  UI.openDraft = function (req) {
    draft.call(UI, req);
    if (req.kind === 'level') return; // (openDraft hands a lost branch back as an ordinary strand)
    UI.v11Draft = req;
    if (req.kind === 'start' || req.kind === 'slot') $('dTitle').textContent = 'CHOOSE A WEAPON';
    let b = $('dSkip');
    if (!b) {
      b = document.createElement('button'); b.id = 'dSkip'; b.className = 'btn'; b.textContent = 'SKIP (+2 REROLLS)';
      b.addEventListener('click', v11Skip);
      $('dPick').parentNode.appendChild(b);
    }
    b.style.display = req.kind === 'slot' ? '' : 'none';
  };
}
