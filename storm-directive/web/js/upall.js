// Upgrade All: on a card screen, spend 5 rerolls to raise every card in the box one rarity (20% chance of two),
// up to Mythical. Curses, sealed cards and cards that can't be rebuilt (supplies, stains, weird boxes) stay as they
// are; Achievement DNA and Immaculate boxes hide the button. Do-Over and Finders Keepers don't apply.
// Cards are rebuilt from the candidate that made them (o.remake, set in genLoot), so they stay the same upgrade.
// Hooks: genLoot (o.remake), UI.updateReroll (upAllShow), index.html (#upAllBtn), ui.js init (click).
const UPALL = { cost: 5, jump2: 0.2, top: 5 };

function upAllOk(o) { return !!(o && o.remake && !o.cursed && !o.taken && !o.sealed && o.rarity < UPALL.top && o.tag !== 'STAIN' && !(o.tag === 'APPETITE' && o.rarity >= 4)); } // (stains have one rarity; appetites stop at Legendary)
function upAllCan() { return !!(G && UI.lootOpts && G.rerolls >= UPALL.cost && !G.mythBox && !G.immBox && !(UI.lootReq && (UI.lootReq.kind === 'myth' || UI.lootReq.imm)) && UI.lootOpts.some(upAllOk)); }
function upAllShow() {
  const b = $('upAllBtn'); if (!b) return;
  b.style.display = upAllCan() && $('rerollBtn').style.display !== 'none' ? '' : 'none';
  b.textContent = `UPGRADE ALL (${UPALL.cost})`;
}
function upgradeAll() {
  if (!upAllCan() || !$('lootCards').classList.contains('ready')) return;
  G.rerolls -= UPALL.cost;
  const jumped = [];
  UI.lootOpts = UI.lootOpts.map((o, i) => {
    if (!upAllOk(o)) return o;
    const to = Math.min(UPALL.top, o.rarity + (Math.random() < UPALL.jump2 ? 2 : 1));
    const n = withBoon(o.remake(to));
    if (!n || !(n.rarity > o.rarity)) return o;
    n.remake = o.remake; if (o.pk) n.pk = o.pk; if (o.quip) n.quip = o.quip;
    jumped.push([i, n.rarity - o.rarity]);
    return n;
  });
  UI.renderLootCards(); UI.rarityBanner(); UI.updateReroll();
  // Mark the upgraded cards (+2 gets its own badge). The card list interleaves section headers, so skip them.
  const els = [...$('lootCards').children].filter(c => !c.classList.contains('lsec'));
  for (const [i, k] of jumped) {
    const c = els[i]; if (!c) continue;
    c.classList.add('upflash');
    if (k >= 2) c.insertAdjacentHTML('beforeend', '<span class="plus2">+2</span>');
  }
  sfx('pickup'); vibrate(40);
}
