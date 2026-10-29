'use strict';
// Spawn Prawn - Weird Loot: about 1 in 6 level and DNA-strand boxes (never before 2 minutes) break the rules.
// Rules (req.rule, set once when the box opens, kept on the req so rerolls stay weird):
//   double   Double or Nothing: take a card, or GAMBLE (50%: two cards a rarity up, 50%: nothing).
//   sachet   Mystery Sachet: three sealed cards, only the border shows the rarity.
//   recycler The Recycler: give up two modifiers for one card two rarities up (max Legendary).
//   cursed   Cursed Bargain: one Mythical card with a forced curse; refuse it if you like.
//   empty    Nothing Box: nothing now, and the next ordinary box is all Immaculate (G.immNext -> req.imm).
// Hooks: weirdAssign / weirdInfo / weirdSealedCard / weirdRecycleList (ui.js openLoot and renderLootCards),
// weirdLoot (game.js genLoot), G.immBox (game.js rollRarity and the curse roll).

const WEIRD = {
  double:   { w: 30, title: 'DOUBLE OR NOTHING', quip: 'Take a card like a sensible person, or gamble for two. Fifty-fifty. Same odds as the last person who said "trust me".' },
  sachet:   { w: 25, title: 'MYSTERY SACHET', quip: 'Three sealed packets. Only the colour of the foil gives it away. Do not ask what is in them. It is probably fine.' },
  recycler: { w: 20, title: 'THE RECYCLER', quip: 'Hand over two of your upgrades for one much better one. The lab calls it a trade-in. Your genome calls it a mugging.' },
  cursed:   { w: 15, title: 'CURSED BARGAIN', quip: 'One Mythical gene with a curse stapled on. Read the small print. Or do not. Nobody ever does.' },
  empty:    { w: 10, title: 'NOTHING BOX', quip: 'Absolutely nothing in here. Take it anyway and the next box is all Immaculate. Delayed gratification. Very un-sperm-like.' },
  imm:      { title: 'IMMACULATE DNA', quip: 'Every card Immaculate. Earned by taking nothing. Restraint, in a sperm. Remarkable.' },
};
const WEIRD_KINDS = ['level', 'chest'];

// Things the Recycler can take: weapon modifiers.
function weirdOwned() {
  const out = [];
  for (const w of G.weapons) if (w) for (const m of w.mods) out.push({ key: w.uid + ':' + m.id, w, m, label: MODS[m.id].name + ' (' + w.def.name + ')' });
  return out;
}
function weirdAssign(req) {
  if (!G) return;
  if (req.rule !== undefined || req.imm) { if (req.rule === 'recycler' && weirdOwned().length < 2) req.rule = null; return; }
  req.rule = null;
  const ord = req.kind === 'level' || req.kind === 'chest' || req.kind === 'boss';
  if (ord && G.immNext) { G.immNext = false; req.imm = true; return; }
  if (!WEIRD_KINDS.includes(req.kind) || G.t < 120 || Math.random() > 1 / 6) return;
  const ok = Object.keys(WEIRD).filter(k => WEIRD[k].w && (k !== 'recycler' || weirdOwned().length >= 2) && (k !== 'cursed' || CURSES.some(c => !G.curses[c.id])));
  let x = Math.random() * ok.reduce((a, k) => a + WEIRD[k].w, 0);
  for (const k of ok) { x -= WEIRD[k].w; if (x <= 0) { req.rule = k; return; } }
  req.rule = ok[0] || null;
}
function weirdInfo(req) { return req.imm ? WEIRD.imm : req.rule ? WEIRD[req.rule] : null; }

function weirdLoot(req) {
  const plain = Object.assign({}, req, { rule: null, imm: false });
  if (req.imm) { // the box after a Nothing Box: all Immaculate
    G.immBox = true;
    try {
      const out = [];
      for (let k = 0; k < 20 && out.length < 3; k++) for (const o of genLoot(Object.assign({}, plain, { kind: 'chest' }))) if (o.rarity >= 6 && !o.cursed && out.length < 3 && !out.some(q => q.title === o.title && (q.modFor || '') === (o.modFor || ''))) out.push(o);
      return out.length ? out : null;
    } finally { G.immBox = false; }
  }
  switch (req.rule) {
    case 'double': {
      const opts = genLoot(plain);
      opts.push({ rarity: 3, gamble: true, tag: 'GAMBLE', icon: '??', color: '#ffca3a', title: 'GAMBLE', sub: 'Fifty-fifty',
        desc: 'Pass on these. Half the time you take TWO cards, a rarity better than these. The other half you get nothing at all.',
        apply: () => {
          if (Math.random() < 0.5) {
            const got = [];
            for (const o of genLoot(Object.assign({}, plain, { boost: (req.boost || 0) + 1 }))) if (!o.cursed && !o.wup && got.length < 2 && !got.some(q => q.title === o.title)) got.push(o);
            for (const o of got) o.apply();
            floatText(me().x, me().y - 40, 'DOUBLE! TWO CARDS', PAL.reward, 15, 1.4);
          } else floatText(me().x, me().y - 40, 'NOTHING. HA.', '#ff6b6b', 15, 1.4);
        } });
      return opts;
    }
    case 'sachet': {
      const opts = genLoot(plain);
      for (const o of opts) { o.sealed = true; const ap = o.apply; o.apply = u => { ap(u); floatText(me().x, me().y - 40, 'IT WAS: ' + o.title.toUpperCase(), PAL.reward, 13, 1.6); }; }
      return opts;
    }
    case 'recycler': {
      if (weirdOwned().length < 2) return null;
      req.recSel = [];
      const bump = Object.assign({}, plain, { boost: (req.boost || 0) + 2 });
      let pickC = null;
      for (let k = 0; k < 12 && !pickC; k++) pickC = genLoot(bump).find(o => !o.cursed && !o.wup && o.rarity <= 4) || null;
      if (!pickC) return null;
      const ap = pickC.apply;
      return [Object.assign({}, pickC, { desc: pickC.desc + ' Costs the two things you tick below.',
        locked: () => (req.recSel || []).length !== 2,
        apply: u => {
          for (const key of req.recSel) { const it = weirdOwned().find(q => q.key === key); if (it) { it.w.mods.splice(it.w.mods.indexOf(it.m), 1); computeStats(it.w); } }
          ap(u);
        } })];
    }
    case 'cursed': {
      const cs = CURSES.filter(c => !G.curses[c.id]); if (!cs.length) return null;
      const c = pick(cs);
      let m = null;
      for (let k = 0; k < 10 && !m; k++) m = genLoot({ kind: 'myth' }).find(o => o.rarity === 5 && !o.cursed) || null;
      if (!m) m = genLoot({ kind: 'myth' }).find(o => !o.cursed);
      if (!m) return null;
      const ap = m.apply;
      return [Object.assign({}, m, { tag: 'CURSED GIFT', desc: m.desc + ' CURSE: ' + c.name + '. Boon: ' + c.boon + '. Bane: ' + c.bane + '.',
        apply: u => { ap(u); G.curses[c.id] = true; c.apply(G.P, G); recomputeAll(); achieve('cursed'); } }),
        { rarity: 0, tag: 'REFUSE', icon: 'NO', color: '#9fb3c8', title: 'Refuse the Offer', sub: 'Nothing happens', desc: 'Walk away. Coward. The curse goes back in the jar.', apply: () => {} }];
    }
    case 'empty':
      return [{ rarity: 0, tag: 'NOTHING', icon: '--', color: '#9fb3c8', title: 'Nothing At All', sub: 'The next box is all Immaculate',
        desc: 'You get nothing. Absolutely nothing. Hold it together: the next ordinary box has only Immaculate cards.',
        apply: () => { G.immNext = true; floatText(me().x, me().y - 40, 'NEXT BOX: ALL IMMACULATE', PAL.reward, 14, 1.6); } }];
  }
  return null;
}

// A sealed Mystery Sachet card: only the border (rarity) shows.
function weirdSealedCard(o, i) {
  const r = RARITIES[o.rarity], c = document.createElement('button');
  c.className = 'card sealed r-' + r.id + ' noico';
  c.style.setProperty('--rar', r.color); c.style.setProperty('--rc', r.color); c.style.setProperty('--ic', r.color);
  c.style.animationDelay = (0.45 + i * 0.12) + 's';
  c.innerHTML = '<div class="tag">SEALED</div><div class="ctitle">???</div><div class="csub">Only the foil gives it away</div>';
  holdable(c, () => '<b>Sealed.</b><p>Sealed. No peeking.</p>', () => {
    if (!$('lootCards').classList.contains('ready') || !(UI.lastDown > UI.lootOpenT)) return;
    UI.pickLoot(i);
  });
  return c;
}
// The Recycler's list: tick two modifiers to hand over.
function weirdRecycleList(req) {
  const d = document.createElement('div'); d.className = 'lsec wlist';
  const sync = () => {
    d.querySelectorAll('button').forEach(b => b.classList.toggle('on', req.recSel.includes(b.dataset.k)));
    d.firstChild.textContent = `GIVE UP TWO (${req.recSel.length}/2):`;
    const card = $('lootCards').querySelector('.card'); if (card) card.style.opacity = req.recSel.length === 2 ? '' : '0.55';
  };
  d.innerHTML = '<div></div>' + weirdOwned().map(it => `<button class="btn" data-k="${esc(it.key)}">${esc(it.label)}</button>`).join('');
  d.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k, a = req.recSel, ix = a.indexOf(k);
    if (ix >= 0) a.splice(ix, 1); else { a.push(k); if (a.length > 2) a.shift(); }
    sync();
  }));
  setTimeout(sync, 0);
  return d;
}
