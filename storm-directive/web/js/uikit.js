'use strict';
// Spawn Prawn - UI kit: one builder per design-system component, so menus are assembled from the same parts as the
// Figma file (https://www.figma.com/design/waCztn7dWzQVMt7il1lwvB/ac, Components page). Each builder returns an HTML
// string using the classes style.css already styles. Text passes through untouched: callers escape it as before.
// No hooks: plain globals, loaded before every file that builds menus (ui.js, loadout.js, pinhide.js, samples10.js).
//
// Builder           Figma component         Classes
// uiPanel           Panel                   .sec, optional <h3> title (uiPanelOpen/uiPanelClose when built in steps)
// uiHint            (body text)             p.hint
// uiChip / uiChips  Chip                    .chip (.small, .sel) inside .chips
// uiTabs            Chip (tabs)             .ptabs
// uiTile / uiTiles  Stat Tile               .tile inside .tiles
// uiList            (list grid)             .list
// uiButton          Button                  .btn (.primary, .danger)
// uiSectionHead     Section Header          .sx-h
// uiSampleCard      Sample Card / Mode Card .sx-card (.hero, .locked)
// uiTraitRow        Trait Row               .brow
// uiDamageRow       Damage Row              .dmgrow
// uiLoadoutTab      Loadout Tab             .atab (.sel, .empty, .spell, .locked)
// uiModSlot         (modifier slot)         .modslot (.empty)
// uiHud             HUD (whole overlay)     #hud: uiHudKey, uiWeaponSlot*, uiRewindButton, uiToast, uiSystemMessage
// uiBossIntro       Boss Intro Card         #bossIntro: letterbox bars, warning strip, uiBossCard
// uiLootCard        Loot Card               .card body (tag, icon, title, sub, desc); uiLootSection for .lsec
//
// #hud and #bossIntro are filled from these builders as soon as this file loads (the scripts sit at the end of
// <body>, and nothing reads those elements before ui.js), so every id the code looks up still exists.

const uiCls = (...c) => c.filter(Boolean).join(' ');
const uiAt = a => (a ? ' ' + a : '');

// Panel: a film sheet with an optional title. cls adds classes (e.g. 'setrow'); attrs adds raw attributes.
function uiPanel(title, body, cls, attrs) { return `<div class="${uiCls('sec', cls)}"${uiAt(attrs)}>${title ? `<h3>${title}</h3>` : ''}${body}</div>`; }
// For panels whose contents are added over several statements: uiPanelOpen() ... uiPanelClose().
function uiPanelOpen(title, cls, attrs) { return `<div class="${uiCls('sec', cls)}"${uiAt(attrs)}>${title ? `<h3>${title}</h3>` : ''}`; }
function uiPanelClose() { return '</div>'; }
// Hint: a line of secondary text.
function uiHint(html, cls, attrs) { return `<p class="${uiCls('hint', cls)}"${uiAt(attrs)}>${html}</p>`; }
// Chip: a pill used for tabs, toggles and choices. o: { sel, small, cls, attrs }.
function uiChip(label, o) { o = o || {}; return `<button class="${uiCls('chip', o.small && 'small', o.cls, o.sel && 'sel')}"${uiAt(o.attrs)}>${label}</button>`; }
function uiChips(html, cls, attrs) { return `<div class="${uiCls('chips', cls)}"${uiAt(attrs)}>${html}</div>`; }
function uiTabs(html) { return `<div class="ptabs">${html}</div>`; }
// Stat tile: a big value over a small label.
function uiTile(value, label, cls, attrs) { return `<div class="${uiCls('tile', cls)}"${uiAt(attrs)}><b>${value}</b><span>${label}</span></div>`; }
function uiTiles(html, cls) { return `<div class="${uiCls('tiles', cls)}">${html}</div>`; }
// List: the auto-fill grid that holds .li rows.
function uiList(html, cls, attrs) { return `<div class="${uiCls('list', cls)}"${uiAt(attrs)}>${html}</div>`; }
// Button: o: { cls ('primary', 'danger' ...), attrs (id, data-...), disabled }.
function uiButton(label, o) { o = o || {}; return `<button class="${uiCls('btn', o.cls)}"${uiAt(o.attrs)}${o.disabled ? ' disabled' : ''}>${label}</button>`; }
// Section header: the small kicker with a rule on the sample rack.
function uiSectionHead(label, cls) { return `<div class="${uiCls('sx-h', cls)}">${label}</div>`; }
// Sample card (sample rack, mode select, dev cards). o: { cls, attrs, style, art, kicker, name, desc, tag }.
// art and desc are optional; leave them undefined to omit their element.
function uiSampleCard(o) {
  return `<button class="${uiCls('sx-card', o.cls)}"${uiAt(o.attrs)}${o.style ? ` style="${o.style}"` : ''}>${o.art != null ? `<span class="sx-art">${o.art}</span>` : ''}`
    + `<span class="sx-txt"><i>${o.kicker}</i><b>${o.name}</b>${o.desc != null ? `<span>${o.desc}</span>` : ''}<em>${o.tag}</em></span></button>`;
}
// Gene Bank row: an optional lead (icon or dye swatch), the body, and an action (price chip or status).
function uiTraitRow(lead, body, action) { return `<div class="brow">${lead || ''}<div>${body}</div>${action || ''}</div>`; }
// Damage share row on the game-over screens: pct is 0-100.
function uiDamageRow(label, pct, value) { return `<div class="dmgrow"><span>${label}</span><i style="width:${pct}%"></i><b>${value}</b></div>`; }
// Tackle Box slot tab. o: { cls, sel, attrs, style, icon, label, pips }.
function uiLoadoutTab(o) { return `<button class="${uiCls('atab', o.cls, o.sel && 'sel')}"${uiAt(o.attrs)}${o.style ? ` style="${o.style}"` : ''}><b>${o.icon}</b><span>${o.label}</span>${o.pips != null ? `<em>${o.pips}</em>` : ''}</button>`; }
// Modifier slot in the Tackle Box. Without a body it is the empty slot.
function uiModSlot(body, style) { return body == null ? '<div class="modslot empty">Empty slot. Modifier cards come in DNA strands.</div>' : `<div class="modslot"${style ? ` style="${style}"` : ''}>${body}</div>`; }

// ---------------------------------------------------------------- HUD
// A HUD control: AUTO, speed, pause, Tackle Box, move. id is the element id the HUD code looks up.
function uiHudKey(id, label, aria, cls) { return `<button id="${id}"${cls ? ` class="${cls}"` : ''}${aria ? ` aria-label="${aria}"` : ''}>${label}</button>`; }
// Weapon / Feat slot on the dock. ui.js makeSlotEl creates the element; refreshHud fills these parts.
function uiWeaponSlotClass(kind) { return 'slot ' + (kind === 's' ? 'spell' : 'weapon'); }
function uiWeaponSlotInner() { return '<div class="ico"></div><div class="lv"></div><div class="mp"></div><div class="dir"></div><div class="bar"><i></i></div>'; }
function uiRewindButton() { return '<button id="rewindBtn"><span class="rl">&lt;&lt;</span><span class="rt">REWIND</span><span class="pips"></span></button>'; }
function uiToast() { return '<div id="toast"></div>'; }
function uiSystemMessage() { return '<div id="sysmsg"><b>SYSTEM MESSAGE</b><span></span></div>'; }
const UI_ICON_TACKLE = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M2 9.5h14.5l1.6-1.8H22v4.6h-3.2v1.6h-4.6l-1.1 4.4H9.6l1.1-4.4H2z"/><rect x="4" y="11" width="9" height="1.2" fill="#000" opacity=".45"/></svg>';
function uiHud() {
  return `<div id="hudTop">${uiHudKey('autoBtn', 'AUTO', 'Full Auto')}${uiHudKey('spdBtn', 'x1', 'Game speed')}${uiHudKey('schoolSkip', 'SKIP TUTORIAL')}</div>`
    + uiButton('START WAVE 1', { cls: 'primary', attrs: 'id="waveBtn"' })
    + uiHudKey('dbgBtn', 'DEBUG') + '<div id="dbgPanel"></div>'
    + `<div id="bottom"><div id="wslots"></div><div id="row2"><div id="sslots"></div>${uiHudKey('moveBtn', '<span class="mvk">RUN</span><span class="mvl">KITE</span>')}${uiHudKey('armBtn', UI_ICON_TACKLE, 'Tackle Box')}${uiHudKey('pauseBtn', '<i></i><i></i>', 'Pause')}</div></div>`
    + `<div id="side">${uiHudKey('abilBtn', '<b></b><span></span>')}${uiRewindButton()}</div>`
    + uiToast() + uiSystemMessage();
}

// ---------------------------------------------------------------- boss introduction
// The boss file card. ui.js openBossIntro fills it by id (biCount, biTitle, biName ...).
function uiBossCard() {
  return '<div class="bi-card"><div class="bi-count" id="biCount"></div><div class="bi-title" id="biTitle"></div><div class="bi-name" id="biName"></div>'
    + '<div class="bi-quote" id="biQuote"></div><div class="bi-desc" id="biDesc"></div>'
    + '<div class="bi-cols"><div class="bi-col str"><h4>STRENGTHS</h4><ul id="biStr"></ul></div><div class="bi-col weak"><h4>WEAKNESSES</h4><ul id="biWeak"></ul></div></div>'
    + `<div class="bi-reward" id="biReward"></div>${uiButton('FIGHT', { attrs: 'id="biFight"' })}<button id="biOff" class="bi-off">skip tutorial</button></div>`;
}
function uiBossIntro() { return '<div class="bi-bar top"></div><div class="bi-bar bot"></div><div class="bi-warn">' + '<span>WARNING</span>'.repeat(6) + '</div>' + uiBossCard(); }

// ---------------------------------------------------------------- loot cards
// Body of a DNA loot card. The <button class="card r-..."> itself is made in ui.js (it carries the rarity
// colours and the tap handlers). o: { lead, tag, rarity, icon, iconColor, title, titleColor, sub, meter, desc, extra }.
function uiLootCard(o) {
  return (o.lead || '') + `<div class="tag">${o.tag} <b>${o.rarity}</b></div>`
    + (o.icon ? `<div class="cico" style="--ic:${o.iconColor}">${o.icon}</div>` : o.iconHtml || '')
    + `<div class="ctitle"${o.titleColor ? ` style="color:${o.titleColor}"` : ''}>${o.title}</div><div class="csub">${o.sub}</div>`
    + (o.meter != null ? `<div class="wlv">${o.meter}</div>` : '')
    + `<div class="cdesc">${o.desc}</div>${o.extra || ''}`;
}
function uiLootSection(label) { return `<div class="lsec">${label}</div>`; }

// Fill the screens whose markup lives here.
{ const hud = document.getElementById('hud'), bi = document.getElementById('bossIntro');
  if (hud) hud.innerHTML = uiHud();
  if (bi) bi.innerHTML = uiBossIntro(); }
