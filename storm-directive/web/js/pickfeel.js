// pickfeel.js: feedback on screens where you take more than one card (Seconds, Double Yolk, take-two level drafts).
// A "0/2 chosen" chip above the cards; the card you took stays on screen with a tick and a held glow; the rest lean in.
// Hooks: ui.js openLoot -> pfInit; ui.js pickLoot (second-pick branch) -> pfTaken.
function pfTotal(req) {
  const k = req && req.kind;
  if (req && req.picks > 1) return req.picks;
  if (!G || ['start', 'slot', 'branch', 'sfork', 'relic', 'rrelic'].includes(k)) return 1;
  return (G.relics.twinpick || (k === 'vesicle' && G.vesTwo)) ? 2 : 1;
}
function pfChip() {
  let el = document.getElementById('pfCount');
  if (!el) {
    el = document.createElement('div'); el.id = 'pfCount';
    const c = document.getElementById('lootCards'); c.parentNode.insertBefore(el, c);
  }
  return el;
}
function pfInit(req) {
  const el = pfChip(), n = pfTotal(req);
  el.style.display = n > 1 ? '' : 'none';
  if (n > 1) pfSet(0, n);
}
function pfSet(done, n) {
  const el = pfChip();
  el.classList.toggle('half', done > 0);
  el.innerHTML = `<b>${done}/${n}</b> <span>${done ? 'One more. No refunds.' : 'Take two. Start with one.'}</span>`;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}
// After a card is taken and more are still owed.
function pfTaken(el, done, n) {
  if (el) el.classList.add('taken');
  const c = document.getElementById('lootCards');
  if (c) c.classList.add('stare');
  pfSet(done, n);
}
