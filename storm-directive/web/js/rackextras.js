'use strict';
// Spawn Prawn - two v9 ways in that the v10 start flow had lost (user, 22 Oct 2026: "fix it all"):
//  - Daily Challenge: back on the main menu (24 Oct 2026), so no longer a card on the Sample Rack.
//  - Immune Response: only the v9 sequence screen could set it, so Mode Select carries the same stepper (META.heat, up to
//    META.heatMax; meta.js applies it to the run, prestige.js unlocks the next level on a birth at the top one).
// No new copy: the card and stepper reuse the v9 strings. Hooks: none (wraps s10Samples and s10Modes). Off with V10_OFF.
// Loads after samples9.js, before dsheads.js (which wraps both again).

(function () {
  if (typeof V10 === 'undefined' || !V10 || typeof s10Samples !== 'function') return;
  const modes = s10Modes;
  s10Modes = function () {
    const r = modes.apply(this, arguments);
    const back = $('s10Back');
    if (back && typeof IMMUNE !== 'undefined') { back.insertAdjacentHTML('beforebegin', '<div id="s10Heat" class="sqheatbox"></div>'); rxHeat(); }
    return r;
  };
  // The v9 stepper (seqsel.js seqHeat), drawn into Mode Select.
  function rxHeat() {
    const box = $('s10Heat'); if (!box) return;
    const max = META.heatMax || 0, lv = Math.min(META.heat || 0, max);
    META.heat = lv;
    let h = `<div class="sqh">IMMUNE RESPONSE</div><div class="sqheat"><button class="sqhb" data-h="-1" ${lv <= 0 ? 'disabled' : ''}>&minus;</button><div class="sqhv"><b>${lv}</b><span>${lv ? '+' + Math.round(IMMUNE_DNA * lv * 100) + '% DNA' : 'NORMAL'}</span></div><button class="sqhb" data-h="1" ${lv >= max ? 'disabled' : ''}>+</button></div>`;
    h += `<div class="sqhl">${IMMUNE.map((x, i) => `<div class="${i < lv ? 'on' : i < max ? '' : 'locked'}"><b>${i + 1}</b> ${i < max ? `${esc(x.name)}: ${esc(x.desc)}` : 'Locked: be born at level ' + i + ' to unlock.'}</div>`).join('')}</div>`;
    box.innerHTML = h;
    box.querySelectorAll('[data-h]').forEach(b => b.addEventListener('click', () => { META.heat = clamp(lv + +b.dataset.h, 0, max); saveMeta(); rxHeat(); sfx('pickup'); }));
  }
})();
