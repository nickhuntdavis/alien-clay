'use strict';
// Spawn Prawn - the Figma Screen Header on the start flow and the card screens (UI_PRINCIPLES.md 3): a counter on the
// left ("01/02", "LV 03") with its context on the right ("Step 1 of 2", "Splice one gene"), a 3px rule, then the title.
// Also the Figma copy on those headers (Sample Rack, Mode Select, Weapon Draft, DNA Loot), type swatches instead of
// type names on sample cards, and no restating kicker or repeated description on the draft.
// Owns: dsHead(host, count, ctx). Hooks: none (wraps s10Samples, s10Modes, UI.openDraft and UI.openLoot; loads after
// v11ui.js, kindred.js and power11.js so it wraps their versions). Save data: none.

const dsPad = n => String(Math.max(0, n | 0)).padStart(2, '0');
const dsSentence = s => { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''; };
function dsHead(host, count, ctx) {
  if (!host) return;
  let h = host.querySelector(':scope > .shead');
  if (!h) { h = document.createElement('div'); h.className = 'shead'; h.innerHTML = '<b class="scount"></b><span class="sctx"></span>'; host.insertBefore(h, host.firstChild); }
  h.querySelector('.scount').textContent = count || '';
  h.querySelector('.sctx').textContent = ctx || '';
  h.style.display = count ? '' : 'none';
  host.classList.toggle('has-shead', !!count);
}

// 02 Sample Rack and 03 Mode Select: 01/02 and 02/02
if (typeof s10Samples === 'function') {
  const s10SamplesBase = s10Samples;
  s10Samples = function () {
    const r = s10SamplesBase.apply(this, arguments);
    const wrap = document.querySelector('#samples .pwrap');
    dsHead(wrap, '01/02', 'Step 1 of 2');
    const t = document.getElementById('sampTitle'); if (t) t.textContent = 'CHOOSE SPERM SAMPLE';
    wrap && wrap.classList.remove('step2');
    // Type swatches instead of the written type names (UI_PRINCIPLES 1)
    document.querySelectorAll('#sampleList [data-s10]').forEach(b => {
      const s = typeof SAMPLES10 !== 'undefined' && SAMPLES10.find(x => x.id === b.dataset.s10), em = b.querySelector('.sx-txt em');
      if (!s || !em || !s10Open(s.id)) return;
      em.innerHTML = s.types.map(t => { const c = ELEMENTS[S10_TYPES[t]].color; return `<i class="sw" style="background:${typeof pictoInk === 'function' && !pictoInk(c) ? 'var(--color-text-primary)' : c}"></i>`; }).join('');
      em.classList.add('swatches');
    });
    return r;
  };
}
if (typeof s10Modes === 'function') {
  const s10ModesBase = s10Modes;
  s10Modes = function (id) {
    const r = s10ModesBase.apply(this, arguments);
    const wrap = document.querySelector('#samples .pwrap');
    dsHead(wrap, '02/02', 'Step 2 of 2');
    const t = document.getElementById('sampTitle'); if (t) t.textContent = 'CHOOSE EXPERIMENT';
    wrap && wrap.classList.add('step2');
    const s = typeof S10_BY !== 'undefined' && S10_BY[id], h = document.querySelector('#sampleList .sx-h');
    if (s && h) h.textContent = s.name.toUpperCase() + ' SAMPLE';
    return r;
  };
}

// 04 Weapon Draft: LV nn / context, WEAPON DRAFT
if (typeof UI !== 'undefined' && UI.openDraft) {
  const openDraftBase = UI.openDraft;
  UI.openDraft = function (req) {
    const r = openDraftBase.apply(this, arguments);
    if (!req || req.kind === 'level') return r;
    const k = document.getElementById('dKick'), wrap = document.querySelector('#draft .dwrap');
    const kick = k ? k.textContent : '', ctx = kick.includes('|') ? kick.split('|').pop() : kick;
    dsHead(wrap, 'LV ' + dsPad(G && G.level), dsSentence(ctx));
    if (k) k.style.display = 'none';
    if (req.kind === 'start' || req.kind === 'slot') { const t = document.getElementById('dTitle'); if (t) t.textContent = 'WEAPON DRAFT'; }
    if (req.kind === 'start') { const s = document.getElementById('dSub'); if (s) s.textContent = 'This is how you\'ll fight.'; }
    return r;
  };
}

// 06 DNA Loot: LV nn / Splice one gene, LEVEL UP, "Level n strand | splice one gene"
if (typeof UI !== 'undefined' && UI.openLoot) {
  const openLootBase = UI.openLoot;
  UI.openLoot = function (req) {
    const r = openLootBase.apply(this, arguments);
    const wrap = document.querySelector('#loot .lwrap');
    if (!req || !G) return r;
    if (req.kind === 'level') {
      dsHead(wrap, 'LV ' + dsPad(G.level), 'Splice one gene');
      const t = document.getElementById('lootTitle'); if (t) t.textContent = 'LEVEL UP';
      const s = document.getElementById('lootSub'); if (s) s.textContent = `Level ${G.level} strand | splice one gene`;
    } else dsHead(wrap, '', '');
    return r;
  };
}

// The draft panel: no "PROJECTILE | FORCE" kicker (the chosen option above says it), and the description once.
if (typeof UI !== 'undefined' && UI.renderDraft) {
  const renderDraftBase = UI.renderDraft;
  UI.renderDraft = function () {
    const r = renderDraftBase.apply(this, arguments);
    const p = document.querySelector('#draft .dplay'), d = document.querySelector('#draft .ddesc');
    if (p && d && p.textContent.trim() === d.textContent.trim()) d.style.display = 'none';
    return r;
  };
}

// 06 DNA Loot cards in the Figma Reward Card layout: the rarity chip sits flush under the pictogram tile, and the
// category moves to the bottom row beside its colour swatch (the top kicker goes).
if (typeof UI !== 'undefined' && UI.renderLootCards) {
  const renderLootBase = UI.renderLootCards;
  UI.renderLootCards = function () {
    const r = renderLootBase.apply(this, arguments);
    document.querySelectorAll('#lootCards .card').forEach(c => {
      const tag = c.querySelector(':scope > .tag'), ico = c.querySelector(':scope > .cico'); if (!tag || c.querySelector('.rchip')) return;
      const rb = tag.querySelector('b'), rar = rb ? rb.textContent : '';
      if (rb) rb.remove();
      const cat = tag.textContent.trim();
      if (ico && rar) { const chip = document.createElement('div'); chip.className = 'rchip'; chip.textContent = rar; ico.appendChild(chip); }
      tag.innerHTML = `<i class="sw"></i>${esc(dsSentence(cat))}`; tag.classList.add('cfoot');
      c.appendChild(tag);
    });
    return r;
  };
}

// 18 It's a Baby: the title sits in the counter slot, the generation on the right (Figma)
if (typeof openBirth === 'function') {
  const openBirthBase = openBirth;
  openBirth = function () {
    const r = openBirthBase.apply(this, arguments);
    const k = document.getElementById('bornKick');
    dsHead(document.querySelector('#born .sqwrap'), "IT'S A BABY!", k ? dsSentence(k.textContent).replace(/: (\w)/, (m, c) => ': ' + c.toUpperCase()) : '');
    return r;
  };
}

// 13 Game Over / 20 Victory: the title in the counter slot with "Run over" on the right; the time joins the readouts
for (const fn of ['showGameOver', 'showDishOver']) {
  if (typeof UI === 'undefined' || !UI[fn]) continue;
  const base = UI[fn];
  UI[fn] = function () {
    const r = base.apply(this, arguments);
    const t = document.getElementById('overTitle'), wrap = document.querySelector('#over .owrap');
    if (t && wrap) dsHead(wrap, t.textContent, 'Run over');
    return r;
  };
}
