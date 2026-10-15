// Appetite cards: steer which damage types your loot leans towards.
// - Acquired Taste: [type]: cards of that damage type come up more often (x2.25 Uncommon, x2.5 Rare ... x3 Legendary).
// - Gone Off It: [type]: cards of that damage type come up less often (x0.25 Uncommon ... x0.1 Legendary, never zero).
// You hold one of each at a time (G.elemBias = { up, upK, down, downK }); a new pick replaces the old one. Only cards that
// have a damage type are affected (weapon and Feat upgrades, new Feats, modifiers, damage type power-ups).
// Hooks: genLoot (biasK on candidate weights and the Feat pool, biasCands adds the cards), UI.renderPause (biasStatus).
const BIAS = { from: 3, w: 3, up: r => 2 + 0.25 * r, down: r => Math.max(0.05, 0.3 - 0.05 * r) };

// The weight multiplier for a card whose damage types are `els` (an array; null/undefined entries ignored).
function biasK(els) {
  const B = G && G.elemBias;
  if (!B || !els) return 1;
  let k = 1;
  if (B.up && els.includes(B.up)) k *= B.upK;
  if (B.down && els.includes(B.down)) k *= B.downK;
  return k;
}

function biasCands(cands, ownedElems) {
  if (!G || G.level < BIAS.from) return;
  const B = G.elemBias || {}, all = Object.keys(ELEMENTS), own = [...ownedElems].filter(e => ELEMENTS[e]);
  const ups = (own.length ? own : all).filter(e => e !== B.up && e !== B.down);
  const downs = own.filter(e => e !== B.down && e !== B.up);
  if (ups.length) { const e = pick(ups); cands.push({ w: BIAS.w, key: 'btaste' + e, nk: 'btaste', make: r => optBias('up', e, r) }); }
  if (downs.length && own.length >= 2) { const e = pick(downs); cands.push({ w: BIAS.w, key: 'boff' + e, nk: 'boff', make: r => optBias('down', e, r) }); }
}

function optBias(dir, e, r) {
  r = Math.max(1, Math.min(4, r));
  const B = G.elemBias || {}, nm = ELEMENTS[e].name, up = dir === 'up';
  const k = up ? BIAS.up(r) : BIAS.down(r), old = up ? B.up : B.down;
  const desc = up
    ? `${nm} cards come up x${k.toFixed(2).replace(/0$/, '')} as often. You can't stop thinking about it.`
    : `${nm} cards come up ${Math.round(k * 100)}% as often. One bad night and you never touch it again.`;
  return { rarity: r, tag: 'APPETITE', icon: up ? 'AT' : 'GO', color: elemCol(e), elem: e, title: (up ? 'Acquired Taste: ' : 'Gone Off It: ') + nm,
    sub: old && ELEMENTS[old] ? `Replaces ${up ? 'Acquired Taste' : 'Gone Off It'}: ${ELEMENTS[old].name}` : 'For the rest of the run',
    desc,
    apply: () => {
      const b = G.elemBias = G.elemBias || {};
      if (up) { b.up = e; b.upK = k; } else { b.down = e; b.downK = k; }
      floatText(me().x, me().y - 34, (up ? 'CRAVING ' : 'OFF ') + nm.toUpperCase(), elemCol(e), 13, 0.9);
    } };
}

// For the pause screen's stats line.
function biasStatus() {
  const B = G && G.elemBias;
  if (!B) return '';
  return (B.up ? ` | Taste: ${ELEMENTS[B.up].name}` : '') + (B.down ? ` | Off: ${ELEMENTS[B.down].name}` : '');
}
