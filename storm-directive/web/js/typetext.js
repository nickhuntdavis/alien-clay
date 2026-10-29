'use strict';
// Spawn Prawn - damage-type colour in text (user, 29 Oct, from the Card Atlas artefact comments).
//  - Words that speak to a damage type (Acid, Corrosion, Mucus, Snare, Charged, Bleed, Possessed, Burning, Force ...) in any DOM
//    screen take that type's menu colour: the --color-type-* tokens in eink.css, which read on Paper and on Ink (Force is plain ink).
//  - Weapon and Feat names (loot card titles, the "For weapon:" line, Tackle Box rows, the Armoury header) take the weapon's
//    current damage type colour (Switched at Birth changes it).
//  - The Armoury sub line says the type name in its colour instead of "weapon" (a Feat keeps "Feat").
//  - A Feat upgrade card leads with the Feat's own "what it does" line (F10 d.does, existing text), then the stat change.
// How: one MutationObserver per .screen tints what a render adds. No render function is changed. CSS: eink.css (end) and style.css
// (.card .cfor b, #lootCards left border). Hooks: none. Save data: none.

const TY_VAR = { phys: 'force', fire: 'acid', shock: 'static', ice: 'mucus', arcane: 'blood', soul: 'alien', flame: 'fire' };
const tyVar = e => (TY_VAR[e] ? `var(--color-type-${TY_VAR[e]})` : (e && typeof elemCol === 'function' ? elemCol(e) : ''));
// Word -> internal damage type id. Case matters: only the capitalised game terms count (lower case "fire" and "force" are plain English),
// except "slime", which only ever means Mucus.
const TY_WORD = { Acid: 'fire', Corrosion: 'fire', Corroded: 'fire', Corrodes: 'fire', Mucus: 'ice', slime: 'ice', Snare: 'ice', Snares: 'ice', Snared: 'ice', Snotty: 'ice',
  Static: 'shock', Charged: 'shock', Charging: 'shock', Blood: 'arcane', Bleed: 'arcane', Bleeding: 'arcane', Parasite: 'soul', Possessed: 'soul', Holy: 'soul', Damned: 'soul',
  Burning: 'flame', Fire: 'flame', Force: 'phys' };
// "Fire rate" and "Rate of Fire" are stats, not the Fire damage type.
const TY_RE = /\b(Acid|Corrosion|Corroded|Corrodes|Mucus|slime|Snares?|Snared|Snotty|Static|Charged|Charging|Blood|Bleed|Bleeding|Parasite|Possessed|Holy|Damned|Burning|Force|(?<!of )Fire(?! rate))\b/g;
const TY_SKIP = '.sel, .btn, .chip, .atab, .rchip, .cfoot, .tyw, .tyn, .ostats, #hud, canvas, svg, script, style, textarea, input, select';
const TY_NAMES = '.ctitle, .aname, .lon b, .cfor b, .dname';
let TY_NAME_ELEM = null;

function tyNameElem(name) {
  name = (name || '').trim(); if (!name) return null;
  if (typeof G !== 'undefined' && G && G.weapons) { // a held weapon or Feat: its current type
    const own = G.weapons.concat(G.spells || []).find(w => w && w.def && w.def.name === name);
    if (own && typeof wElem === 'function') return wElem(own);
  }
  if (!TY_NAME_ELEM) {
    TY_NAME_ELEM = {};
    for (const id in WEAPONS) if (WEAPONS[id].name && WEAPONS[id].elem) TY_NAME_ELEM[WEAPONS[id].name] = WEAPONS[id].elem;
    for (const id in SPELLS) if (SPELLS[id].name && SPELLS[id].elem) TY_NAME_ELEM[SPELLS[id].name] = SPELLS[id].elem;
  }
  return TY_NAME_ELEM[name] || null;
}
function tyPaint(el, elem) { const v = tyVar(elem); if (!v) return; el.classList.add('tyn'); el.style.setProperty('--tyc', v); }

function tyTintText(n) {
  const p = n.parentElement; if (!p || p.closest(TY_SKIP)) return;
  const t = n.nodeValue; TY_RE.lastIndex = 0; if (!TY_RE.test(t)) return;
  const f = document.createDocumentFragment(); let last = 0, m; TY_RE.lastIndex = 0;
  while ((m = TY_RE.exec(t))) {
    if (m.index > last) f.appendChild(document.createTextNode(t.slice(last, m.index)));
    const s = document.createElement('span'), id = TY_WORD[m[0]];
    s.className = 'tyw' + (id === 'phys' ? ' tyf' : ''); s.style.setProperty('--tyc', tyVar(id)); s.textContent = m[0]; f.appendChild(s);
    last = m.index + m[0].length;
  }
  if (last < t.length) f.appendChild(document.createTextNode(t.slice(last)));
  n.parentNode.replaceChild(f, n);
}
function tyNames(root) {
  const els = Array.from(root.querySelectorAll(TY_NAMES)); if (root.matches && root.matches(TY_NAMES)) els.unshift(root);
  els.forEach(el => {
    if (el.classList.contains('tyn') || el.closest('.sel')) return;
    const first = el.firstChild, name = first && first.nodeType === 3 ? first.nodeValue : el.textContent; // (.aname: the name, then a combo note)
    const e = tyNameElem(name); if (e) tyPaint(el, e);
  });
}
// Armoury sub line: "<Type> weapon ..." -> the type name in its colour, no "weapon".
function tyArmSub(root) {
  const subs = Array.from(root.querySelectorAll('.asub')); if (root.matches && root.matches('.asub')) subs.unshift(root);
  subs.forEach(s => {
    const b = s.querySelector('b'); if (!b || b.classList.contains('tyn')) return;
    const txt = b.textContent.trim(), id = Object.keys(ELEMENTS).find(k => ELEMENTS[k].name === txt) || (txt === 'Fire' ? 'flame' : null);
    if (id) tyPaint(b, id);
    for (const c of s.childNodes) if (c.nodeType === 3 && /\bweapon\b/.test(c.nodeValue)) c.nodeValue = c.nodeValue.replace(/\s*\bweapon\b/, '');
  });
}
// Feat upgrade card: what the Feat does first, the stat change second.
function tyFeatUp(root) {
  const cards = Array.from(root.querySelectorAll('.card.rw-feat')); if (root.matches && root.matches('.card.rw-feat')) cards.unshift(root);
  cards.forEach(c => {
    const d = c.querySelector('.cdesc'), t = c.querySelector('.ctitle');
    if (!d || !t || c.querySelector('.cwhat') || !/^Level \d+:/.test(d.textContent)) return;
    const name = t.textContent.trim(), sp = Object.keys(SPELLS).map(k => SPELLS[k]).find(s => s.f10 && s.name === name);
    if (!sp || !sp.f10.does) return;
    const w = document.createElement('div'); w.className = 'cdesc cwhat'; w.textContent = sp.f10.does;
    d.parentNode.insertBefore(w, d); d.classList.add('cup');
  });
}
function tyTree(n) {
  if (n.nodeType === 3) { tyTintText(n); return; }
  if (n.nodeType !== 1 || n.classList.contains('tyw')) return;
  tyArmSub(n); tyFeatUp(n); tyNames(n);
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), texts = [];
  while (w.nextNode()) texts.push(w.currentNode);
  texts.forEach(tyTintText);
}
function tyInit() {
  const screens = document.querySelectorAll('.screen'); if (!screens.length) return false;
  const mo = new MutationObserver(recs => {
    const nodes = []; for (const r of recs) r.addedNodes.forEach(n => nodes.push(n));
    for (const n of nodes) if (n.isConnected) tyTree(n);
    mo.takeRecords(); // (our own edits are not new renders)
  });
  screens.forEach(s => mo.observe(s, { childList: true, subtree: true }));
  return true;
}
if (typeof document !== 'undefined' && !tyInit()) document.addEventListener('DOMContentLoaded', tyInit);
