// Pin and hide loot cards. Each ordinary loot card has a pin and a hide button, side by side at the top right.
// A pinned card is put in the next box it fits; a hidden one never comes back this run. Both clear when the run ends.
// Data: G.pins (max PH.maxPin) and G.hides (max PH.maxHide), entries are o.pk = candidate key + '|' + novelty key (set in genLoot).
// Hooks: genLoot (game.js), newGame (G.pins/hides/pinName), UI.renderLootCards and UI.upgradeCard (phButtons), UI.pickLoot (phTaken), UI.renderPause (phPauseHtml/phPauseBind).
const PH = { maxPin: 3, maxHide: 5 };

function phButtons(c, o) {
  if (!o.pk || !G) return;
  const mk = (cls, txt, label, fn) => {
    const b = document.createElement('span'); b.className = 'phb ' + cls; b.textContent = txt; b.setAttribute('role', 'button'); b.title = label;
    for (const ev of ['pointerdown', 'pointerup', 'click']) b.addEventListener(ev, e => e.stopPropagation());
    b.addEventListener('click', e => { e.preventDefault(); if ($('lootCards').classList.contains('ready')) fn(b); });
    c.appendChild(b); return b;
  };
  let pb = null, hb = null;
  const sync = () => {
    const on = G.pins.includes(o.pk);
    pb.classList.toggle('on', on); c.classList.toggle('pinned', on);
    pb.classList.toggle('full', !on && G.pins.length >= PH.maxPin);
    hb.classList.toggle('full', G.hides.length >= PH.maxHide);
  };
  pb = mk('pin', '\u{1F4CC}', 'Pin: offer this again', () => {
    if (G.pins.includes(o.pk)) { G.pins = G.pins.filter(p => p !== o.pk); UI.toast('Unpinned.'); sync(); return; }
    if (G.pins.length >= PH.maxPin) { UI.toast(`${PH.maxPin} pinned. That's your lot.`); return; }
    G.pins.push(o.pk); G.pinName[o.pk] = o.title; UI.toast('Pinned: ' + o.title); sync();
  });
  hb = mk('hide', '✕', 'Hide: never offer this again', () => {
    if (G.hides.length >= PH.maxHide) { UI.toast(`${PH.maxHide} hidden. That's your lot.`); return; }
    G.hides.push(o.pk); G.pinName[o.pk] = o.title; G.pins = G.pins.filter(p => p !== o.pk);
    UI.toast('Hidden: ' + o.title);
    const i = UI.lootOpts.indexOf(o); if (i < 0) return;
    // Swap in a fresh card (not one already in the box).
    let rep = null;
    try { rep = genLoot(UI.lootReq).find(q => !UI.lootOpts.some(x => x.title === q.title && (x.modFor || '') === (q.modFor || ''))); } catch (e) { rep = null; }
    if (rep) UI.lootOpts[i] = rep; else UI.lootOpts.splice(i, 1);
    UI.lootOpts = UI.sortLoot(UI.lootOpts);
    UI.renderLootCards();
  });
  sync();
}
// Taking a pinned card clears its pin.
function phTaken(o) { if (G && o && o.pk) G.pins = G.pins.filter(p => p !== o.pk); }

function phPauseHtml() {
  if (!G || !(G.pins.length || G.hides.length)) return '';
  const row = (arr, kind, mark) => arr.map(p => `<div class="li" data-ph="${kind}" data-pk="${esc(p)}"><b>${mark} ${esc(G.pinName[p] || p.split('|')[0])}</b> <em>tap to ${kind === 'pin' ? 'unpin' : 'unhide'}</em></div>`).join('');
  return uiPanel('Pinned and hidden', uiList(`${row(G.pins, 'pin', '\u{1F4CC}')}${row(G.hides, 'hide', '✕')}`));
}
function phPauseBind(box, redraw) {
  box.querySelectorAll('[data-ph]').forEach(el => el.addEventListener('click', () => {
    const k = el.dataset.pk;
    if (el.dataset.ph === 'pin') G.pins = G.pins.filter(p => p !== k); else G.hides = G.hides.filter(p => p !== k);
    redraw();
  }));
}
