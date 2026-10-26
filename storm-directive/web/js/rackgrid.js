'use strict';
// Spawn Prawn - the Sample Rack as a two-column grid (user, 24 Oct 2026), with a RANDOM card first.
// Takes the sample cards samples10.js drew, moves them into one .sx-grid.sx-rack (picture, name and type swatches only;
// the description is hidden in the grid, CSS in style.css) and adds a card that opens Mode Select (step 2) for a random
// unlocked sample. Hooks: none (wraps s10Samples). Loads after dsheads.js so the swatches are already in.
// Copy: the RANDOM label is the user's; its tag is "Pot luck".

(function () {
  if (typeof s10Samples !== 'function') return;
  const base = s10Samples;
  s10Samples = function () {
    const r = base.apply(this, arguments);
    const list = $('sampleList'); if (!list) return r;
    const cards = [...list.querySelectorAll('[data-s10]')]; if (!cards.length) return r;
    const grid = document.createElement('div'); grid.className = 'sx-grid sx-rack';
    cards[0].parentNode.insertBefore(grid, cards[0]);
    const open = SAMPLES10.filter(s => s10Open(s.id));
    grid.insertAdjacentHTML('beforeend', uiSampleCard({ cls: 'sx-random', attrs: 'data-rnd="1"', style: `--c:${PAL.reward}`,
      art: '<svg viewBox="0 0 120 120"><rect x="22" y="22" width="76" height="76" rx="14" fill="none" stroke="currentColor" stroke-width="4"/><g fill="currentColor"><circle cx="46" cy="46" r="6"/><circle cx="74" cy="46" r="6"/><circle cx="60" cy="60" r="6"/><circle cx="46" cy="74" r="6"/><circle cx="74" cy="74" r="6"/></g></svg>',
      kicker: '#?', name: 'RANDOM', tag: 'Pot luck' }));
    for (const c of cards) { c.classList.remove('hero'); grid.appendChild(c); }
    const rnd = grid.querySelector('[data-rnd]');
    rnd.addEventListener('click', () => {
      if (!open.length) { rnd.classList.remove('nope'); void rnd.offsetWidth; rnd.classList.add('nope'); return; }
      s10Modes(open[Math.floor(Math.random() * open.length)].id);
    });
    return r;
  };
})();
