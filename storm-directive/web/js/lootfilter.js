'use strict';
// Spawn Prawn - tabs, filters, search and sort on long loot lists (user, 23 Oct): the no-limits level-up list (every
// modifier, passive and defence: modwide.js mwAllCards) and the Sandbox weapon pick (all 27). Shown when a list has more
// than LF.min cards. Filtering hides cards and sorting reorders them (CSS order), so each card keeps its own tap handler.
//  - Tabs: All, Modifiers, one per weapon, Passives, Defences (level-ups); All and one per attack type (weapons).
//  - Chips under the tabs: modifier group, passive kind or damage type. Search matches title, sub-line and text.
//  - Sort: as dealt, A to Z, or by group. The choice is kept for the session (UI.lf), per list kind.
// Also marks attack-type switch cards (atkswap.js o.warn) with a warning border.
// Hooks: none in shared files. Wraps ui.js UI.renderLootCards, UI.renderDraft. Loads after atkswap.js.

const LF = { min: 8 };
const LF_ATK = { proj: 'Projectile', spread: 'Spread', beam: 'Beam', pool: 'Pool', burst: 'Burst', contact: 'Contact', orbit: 'Orbit' };
const LF_MUT = f => f.startsWith('mut:type') ? 'Damage type' : f === 'mut:trade' ? 'Trade-off' : f === 'mut:rules' ? 'Rules' : f === 'mut:def' ? 'Defence mastery' : f === 'mut:rare' ? 'Rare' : 'Body';
function lfInfo(o) { // tab, chip and group label for one card
  const f = o.family || '';
  if (f.startsWith('mod:') || f === 'switch') {
    const id = f.slice(4), w = o.modFor || (o.title || '').split(' →')[0];
    return { kind: 'mod', tab: 'w:' + w, chip: f === 'switch' ? 'Chemistry' : (typeof MM_GNAME !== 'undefined' ? MM_GNAME[mmGroup(id)] : 'Modifier') };
  }
  if (f.startsWith('mut:')) return { kind: 'passive', tab: 'passive', chip: LF_MUT(f) };
  if (f === 'def') return { kind: 'def', tab: 'def', chip: 'Defence' };
  if (o.def) return { kind: 'weapon', tab: 'a:' + (o.def.v10atk || 'other'), chip: (ELEMENTS[o.def.elem] || {}).name || 'Other' };
  return { kind: 'other', tab: 'other', chip: 'Other' };
}
const lfTabName = t => t === 'all' ? 'ALL' : t === 'mods' ? 'MODIFIERS' : t === 'passive' ? 'PASSIVES' : t === 'def' ? 'DEFENCES' : t === 'other' ? 'OTHER'
  : t.startsWith('w:') ? t.slice(2).toUpperCase() : t.startsWith('a:') ? (LF_ATK[t.slice(2)] || t.slice(2)).toUpperCase() : t;
// The list being filtered: UI.lfCtx = { list: [{ o, el, i }], bar, key, onHide }.
function lfApply() {
  const C = UI.lfCtx; if (!C || !C.bar.isConnected) return;
  const S = UI.lf[C.key], L = C.list, bar = C.bar;
  const inTab = x => S.tab === 'all' || x.i.tab === S.tab || (S.tab === 'mods' && x.i.kind === 'mod');
  const q = S.q.trim().toLowerCase();
  const shown = L.filter(x => inTab(x) && (S.chip === 'all' || x.i.chip === S.chip) && (!q || (x.o.title + ' ' + (x.o.sub || '') + ' ' + (x.o.desc || '')).toLowerCase().includes(q)));
  const order = shown.slice();
  if (S.sort === 'az') order.sort((a, b) => a.o.title.localeCompare(b.o.title));
  if (S.sort === 'group') order.sort((a, b) => a.i.chip.localeCompare(b.i.chip) || a.o.title.localeCompare(b.o.title));
  for (const x of L) { x.el.style.display = shown.includes(x) ? '' : 'none'; x.el.style.order = order.indexOf(x); }
  const chips = [...new Set(L.filter(inTab).map(x => x.i.chip))].sort();
  if (S.chip !== 'all' && !chips.includes(S.chip)) { S.chip = 'all'; return lfApply(); }
  bar.querySelector('.lfChips').innerHTML = chips.length > 1 ? ['all'].concat(chips).map(c => uiChip(c === 'all' ? 'ANY' : c.toUpperCase(), { small: true, sel: S.chip === c, attrs: `data-lfc="${esc(c)}"` })).join('') : '';
  bar.querySelectorAll('[data-lft]').forEach(b => b.classList.toggle('sel', b.dataset.lft === S.tab));
  bar.querySelectorAll('[data-lfs]').forEach(b => b.classList.toggle('sel', b.dataset.lfs === S.sort));
  bar.querySelector('.lfN').textContent = shown.length + ' / ' + L.length;
  bar.querySelectorAll('[data-lfc]').forEach(b => b.addEventListener('click', () => { S.chip = b.dataset.lfc; lfApply(); }));
  if (C.onHide && order.length) C.onHide(order);
}
// A bar before `before` for these cards; kept (with its search box) while the same list is on screen.
function lfMount(opts, els, before, keepId) {
  if (opts.length <= LF.min || els.length !== opts.length) { const old = $('lfBar'); if (old && old.dataset.k !== keepId) old.remove(); UI.lfCtx = null; return false; }
  const L = opts.map((o, i) => ({ o, el: els[i], i: lfInfo(o) }));
  const key = L.every(x => x.i.kind === 'weapon') ? 'weapons' : 'cards';
  UI.lf = UI.lf || {}; const S = UI.lf[key] || (UI.lf[key] = { q: '', tab: 'all', chip: 'all', sort: 'default' });
  const tabs = ['all'];
  if (key === 'cards' && L.some(x => x.i.kind === 'mod')) tabs.push('mods');
  for (const x of L) if (!tabs.includes(x.i.tab)) tabs.push(x.i.tab);
  if (!tabs.includes(S.tab)) S.tab = 'all';
  let bar = $('lfBar');
  if (!bar || bar.dataset.k !== keepId || bar.nextElementSibling !== before) {
    if (bar) bar.remove();
    bar = document.createElement('div');
    bar.id = 'lfBar'; bar.dataset.k = keepId;
    bar.innerHTML = `<div class="lfRow"><input class="lfQ" type="search" placeholder="Search" value="${esc(S.q)}"><span class="lfN"></span></div>`
      + `<div class="lfRow lfTabs">${tabs.map(t => uiChip(lfTabName(t), { small: true, attrs: `data-lft="${esc(t)}"` })).join('')}</div>`
      + `<div class="lfRow lfChips"></div>`
      + `<div class="lfRow">SORT ${[['default', 'AS DEALT'], ['az', 'A TO Z'], ['group', 'BY GROUP']].map(([k, n]) => uiChip(n, { small: true, attrs: `data-lfs="${k}"` })).join('')}</div>`;
    before.parentNode.insertBefore(bar, before);
    const q = bar.querySelector('.lfQ');
    q.addEventListener('input', () => { S.q = q.value; lfApply(); });
    for (const ev of ['pointerdown', 'touchstart', 'mousedown', 'keydown']) bar.addEventListener(ev, e => e.stopPropagation());
    bar.querySelectorAll('[data-lft]').forEach(b => b.addEventListener('click', () => { S.tab = b.dataset.lft; S.chip = 'all'; lfApply(); }));
    bar.querySelectorAll('[data-lfs]').forEach(b => b.addEventListener('click', () => { S.sort = b.dataset.lfs; lfApply(); }));
  }
  UI.lfCtx = { list: L, bar, key };
  return true;
}
function lfBuild() { // the loot list (level-ups with no slot limits)
  const wrap = $('lootCards'); if (!wrap) return;
  const opts = UI.lootOpts || [], els = [...wrap.children].filter(c => c.classList.contains('card'));
  els.forEach((el, i) => { const o = opts[i]; if (o && o.warn) el.classList.add('lfWarn'); });
  wrap.classList.remove('lfOn');
  if (!lfMount(opts, els, wrap, 'loot')) return;
  wrap.classList.add('mwall', 'lfOn');
  lfApply();
}
function lfDraft() { // the weapon pick (Weapon Draft tabs), new weapons only
  const D = UI.draft, tabs = $('dTabs'); if (!D || !tabs) return;
  if (D.weap || !['start', 'slot'].includes(D.req && D.req.kind)) { const old = $('lfBar'); if (old && old.dataset.k === 'draft') old.remove(); return; }
  const els = [...tabs.querySelectorAll('.dtab')];
  if (!lfMount(UI.lootOpts || [], els, tabs, 'draft')) return;
  tabs.classList.add('lfOn');
  UI.lfCtx.onHide = order => { if (els[D.i] && els[D.i].style.display === 'none') { D.i = UI.lootOpts.indexOf(order[0].o); UI.renderDraft(); } };
  lfApply();
}
UI.renderLootCards = (orig => function () { orig.apply(this, arguments); try { lfBuild(); } catch (e) { console.error(e); } })(UI.renderLootCards);
UI.renderDraft = (orig => function () { orig.apply(this, arguments); try { lfDraft(); } catch (e) { console.error(e); } })(UI.renderDraft);
{
  const st = document.createElement('style');
  st.textContent = '#lfBar{display:flex;flex-direction:column;gap:4px;margin:0 0 6px;width:100%;position:relative;z-index:3}#lfBar .lfRow{display:flex;flex-wrap:wrap;gap:4px;align-items:center;font:700 11px monospace;color:var(--color-text-primary)}'
    + '#lfBar .lfTabs{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch}#lfBar .lfTabs .chip{flex:none}'
    + '#lfBar .lfQ{flex:1;min-width:0;font:600 14px sans-serif;padding:6px 8px;border-radius:6px;border:1px solid var(--line);background:var(--color-bg-sheet);color:var(--color-text-primary)}#lfBar .lfN{min-width:56px;text-align:right}'
    + '#dTabs.lfOn{max-height:34vh;overflow-y:auto}#lootCards.lfOn{max-height:56vh}.card.lfWarn{box-shadow:0 0 0 2px #ff5a4e inset}';
  document.head.appendChild(st);
}
