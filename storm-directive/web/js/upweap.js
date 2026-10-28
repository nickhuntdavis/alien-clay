'use strict';
// Spawn Prawn - which weapon you are upgrading, in big letters (user, 28 Oct). The upgrade and modifier screens in the
// Weapon Draft layout (branches and masteries: branchback.js; modifier level-ups: wmods.js) named the weapon only in the
// kicker, which dsheads.js trims to its context, and in the small badge on the preview. A banner above the title now
// shows the weapon's icon and name, in its damage-type colour; the badge text is larger too (style.css #dWeap, .dbadge).
// Hooks: none (wraps UI.openDraft; loads after dsheads.js so it runs after its header). Save data: none.

function upWeapOf(req) {
  if (!req || req.kind === 'start' || req.kind === 'slot' || req.kind === 'kindred' || req.kin) return null;
  const w = req.w || (req.xbr && req.xbr.w) || (req.wm && req.wm.w);
  return w && w.def ? w : null;
}
if (typeof UI !== 'undefined' && UI.openDraft) {
  const od = UI.openDraft;
  UI.openDraft = function (req) {
    const r = od.apply(this, arguments);
    const t = document.getElementById('dTitle'); if (!t) return r;
    let el = document.getElementById('dWeap');
    if (!el) { el = document.createElement('div'); el.id = 'dWeap'; t.parentNode.insertBefore(el, t); }
    const w = upWeapOf(req);
    if (!w) { el.style.display = 'none'; return r; }
    const c = (w.typeOver && typeof V10_COL !== 'undefined' && V10_COL[w.typeOver]) || elemCol(w.def.elem);
    el.style.display = ''; el.style.setProperty('--wc', c);
    el.innerHTML = `${typeof iconSVG === 'function' ? iconSVG(w.def, 40, c) : ''}<span>${esc(w.def.name)}</span>`;
    return r;
  };
}
