'use strict';
// Spawn Prawn - tap to inspect. Tap an enemy or boss in the world (a quick touch that barely moves) and its card
// comes up: stats, damage, weaknesses and its joke line. Damage types and statuses have cards too (tap a
// weakness on a card, or a row in Active effects), and every damage type card opens the Reaction chart.
// Settings > Inspect speed: PAUSE stops the game while a card is open; HALF slows it to half speed.
// Unmet enemies (META.seen / META.bosses), statuses (META.seenSt) and reactions (META.seenRx) show locked.
// Hooks: inspectTap (game.js, endTouch), inspectMul (game.js loop), inspectSeeRx (game.js, react),
// rxChartHtml and data-insp buttons (ui.js Field Guide), data-insp="st:KEY" rows (ui.js status panel).

const INSPECT = { open: false, prev: null, hist: [], pause: true, half: false };
const INSPECT_TAP = { ms: 250, move: 10, pad: 24 };
const inspectMul = () => (INSPECT.open && INSPECT.half ? 0.5 : 1);
const ELEM_ORDER = ['phys', 'fire', 'ice', 'shock', 'poison', 'oxi', 'salt', 'arcane', 'soul'];
// Which reaction two damage types set off (either way round). Force has none; a type with itself is its overload.
const RX_PAIR = (() => {
  const m = {}, set = (a, b, id) => { m[a + '+' + b] = id; m[b + '+' + a] = id; };
  set('salt', 'shock', 'bath'); set('shock', 'oxi', 'greasefire'); set('salt', 'soul', 'holywater'); set('fire', 'poison', 'penicillin');
  set('fire', 'soul', 'soulrot'); set('arcane', 'oxi', 'bloodclot'); set('poison', 'oxi', 'sushi'); set('salt', 'poison', 'publicpool');
  set('ice', 'soul', 'ectoplasm'); set('arcane', 'shock', 'cardiac'); set('soul', 'oxi', 'lastrites'); set('ice', 'poison', 'snotrocket');
  set('arcane', 'poison', 'dirtyneedle'); set('arcane', 'salt', 'crimescene'); set('arcane', 'ice', 'scab'); set('arcane', 'soul', 'bloodpact');
  set('fire', 'shock', 'battery'); set('fire', 'salt', 'acidrain'); set('fire', 'ice', 'heartburn'); set('fire', 'arcane', 'ulcer');
  set('fire', 'oxi', 'vinaigrette'); set('salt', 'oxi', 'dontmix'); set('ice', 'salt', 'snotslick'); set('ice', 'oxi', 'snailtrail');
  set('ice', 'shock', 'shortcircuit'); set('shock', 'soul', 'poltergeist'); set('shock', 'poison', 'shakes'); set('soul', 'poison', 'patientzero');
  m['poison+poison'] = 'pandemic';
  return m;
})();
const RX_ABBR = { bath: 'BATH', greasefire: 'FIRE', holywater: 'HOLY', penicillin: 'PEN', soulrot: 'ROT', bloodclot: 'CLOT', sushi: 'SUSHI', publicpool: 'POOL',
  ectoplasm: 'ECTO', cardiac: 'CARD', lastrites: 'RITE', snotrocket: 'SNOT', dirtyneedle: 'NDL', crimescene: 'CRIM', scab: 'SCAB', bloodpact: 'PACT',
  battery: 'BATT', acidrain: 'RAIN', heartburn: 'HBRN', ulcer: 'ULC', vinaigrette: 'VIN', dontmix: 'MIX', snotslick: 'SLCK', snailtrail: 'SNAIL',
  shortcircuit: 'SHRT', poltergeist: 'POLT', shakes: 'SHAK', patientzero: 'PT0', pandemic: 'PAND' };
const rxSeen = id => !!((META.seenRx && META.seenRx[id]) || (typeof G !== 'undefined' && G && G.stats && G.stats.reactBy && G.stats.reactBy[id]));
// From react() in game.js: log a reaction the first time it ever goes off.
function inspectSeeRx(id) { META.seenRx = META.seenRx || {}; if (!META.seenRx[id]) { META.seenRx[id] = 1; saveMeta(); } }

// ---------------------------------------------------------------- the tap
// From endTouch (game.js): the down point, where it lifted, and how long it was held (ms).
function inspectTap(x0, y0, x1, y1, held) {
  if (!G || G.state !== 'play' || held >= INSPECT_TAP.ms || Math.hypot(x1 - x0, y1 - y0) >= INSPECT_TAP.move) return false;
  let best = null, bd = 1e9;
  for (const e of G.enemies) {
    if (e.dead || e.egg || e.rival || e.final || !e.def) continue;
    const d = Math.hypot(sx(e.x) - x0, sy(e.y) - y0) - ((e.r || e.def.r || 10) * S + INSPECT_TAP.pad);
    if (d <= 0 && d < bd) { bd = d; best = e; }
  }
  if (!best) return false;
  INSPECTOR.foe(best);
  return true;
}

// ---------------------------------------------------------------- the card
const inspectEsc = s => (typeof esc === 'function' ? esc(s) : String(s));
function inspectEl() {
  let el = document.getElementById('inspect');
  if (!el) {
    el = document.createElement('div'); el.id = 'inspect';
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-insp]');
      if (!b) { if (ev.target === el && INSPECT.pause) INSPECTOR.close(); return; }
      const i = b.dataset.insp.indexOf(':'), k = b.dataset.insp.slice(0, i), v = b.dataset.insp.slice(i + 1);
      if (k === 'close') INSPECTOR.close(); else if (k === 'back') INSPECTOR.back();
      else if (k === 'el') INSPECTOR.elem(v); else if (k === 'st') INSPECTOR.status(v);
      else if (k === 'rx') INSPECTOR.chart(); else if (k === 'rxcell') INSPECTOR.cell(v);
    });
    document.body.appendChild(el);
  }
  return el;
}
const INSPECTOR = {
  // Show a card. Pause mode (the default) stops the slide; half mode runs it at half speed.
  show(html, colour, back) {
    const el = inspectEl();
    if (!INSPECT.open) {
      INSPECT.open = true; INSPECT.hist = [];
      INSPECT.prev = G ? G.state : null;
      INSPECT.pause = !(typeof SET !== 'undefined' && SET.inspect === 'half');
      INSPECT.half = !INSPECT.pause;
      if (G) { INPUT.active = false; INPUT.id = null; G.manual = null; if (INSPECT.pause && G.state === 'play') G.state = 'pause'; }
    }
    if (!back) INSPECT.hist.push({ html, colour });
    el.className = 'on' + (INSPECT.pause ? ' pausing' : '');
    el.style.setProperty('--ic', colour || '#d1ddef');
    const resume = INSPECT.pause && INSPECT.prev === 'play';
    el.innerHTML = `<div class="icard">${html}<div class="ibtns">${INSPECT.hist.length > 1 ? '<button class="btn" data-insp="back:">BACK</button>' : ''}<button class="btn primary" data-insp="close:">${resume ? 'RESUME' : 'CLOSE'}</button></div></div>`;
  },
  back() { if (INSPECT.hist.length > 1) { INSPECT.hist.pop(); const h = INSPECT.hist[INSPECT.hist.length - 1]; INSPECTOR.show(h.html, h.colour, true); } },
  close() {
    if (!INSPECT.open) return;
    INSPECT.open = false; INSPECT.hist = [];
    inspectEl().className = '';
    if (G && INSPECT.pause && INSPECT.prev === 'play' && G.state === 'pause') { G.state = 'play'; if (typeof lastTs !== 'undefined') lastTs = performance.now(); }
  },
  // An enemy or boss. Unmet ones are a silhouette.
  foe(e) {
    const d = e.def, boss = !!(e.boss || e.bossDef), id = boss ? d.id : introKey(e);
    const met = boss ? !!(META.bosses && META.bosses[d.id]) : (!id || !ENEMY_INTRO[id] || seenFoe(id));
    if (!met) {
      INSPECTOR.show('<div class="isil"></div><h3>???</h3><p class="hint">Not met yet.</p><p>Run into it first. It will introduce itself.</p>', '#555');
      return;
    }
    const I = (!boss && id && ENEMY_INTRO[id]) || null, hp = Math.round(e.maxHp || d.hp), arm = Math.round(e.armour != null ? e.armour : d.armour || 0);
    const dmg = `${Math.round(e.dmg != null ? e.dmg : d.dmg || 0)} on touch` + (d.shoot ? `, ${d.shoot.dmg} per shot` : '');
    const typ = o => Object.keys(o || {}).filter(k => ELEMENTS[k]).map(k => `<button class="ichip" style="--c:${ELEMENTS[k].color}" data-insp="el:${k}">${inspectEsc(ELEMENTS[k].name)}${o[k] === 0 ? ' (immune)' : ' x' + o[k]}</button>`).join('') || '<span class="hint">none known</span>';
    const html = `<div class="idot" style="background:${d.color}"></div><h3>${inspectEsc(d.name)}</h3>` + (boss && d.title ? `<em>${inspectEsc(d.title)}</em>` : '') +
      `<div class="istats"><span>HP <b>${hp}</b></span><span>Speed <b>${Math.round(d.speed || 0)}</b></span><span>Armour <b>${arm}</b></span></div>` +
      `<p>Hits for <b>${dmg}</b>.</p><div class="irow"><h4>WEAK TO</h4>${typ(d.weak)}</div><div class="irow"><h4>RESISTS</h4>${typ(d.resist)}</div>` +
      (I ? `<p class="ijoke">${inspectEsc(I.what)}</p><p class="hint">${inspectEsc(I.tip)}</p>` : boss && d.quote ? `<p class="ijoke">${inspectEsc(d.quote)}</p>` : '');
    INSPECTOR.show(html, d.color);
  },
  // A damage type: what it does, its status, and the reaction chart.
  elem(id) {
    const E = ELEMENTS[id]; if (!E) return;
    const st = GLOSSARY.find(g => g[1].toLowerCase().startsWith(E.status.slice(0, 5)));
    const html = `<h3 style="color:${E.color}">${inspectEsc(E.name)}</h3><em>DAMAGE TYPE</em><p>${inspectEsc(E.blurb)}</p>` +
      `<p><b>Status:</b> ${inspectEsc(E.status)}${st ? '. ' + inspectEsc(st[2]) : ''}</p>` +
      `<div class="irow"><h4>REACTS WITH</h4>${ELEM_ORDER.filter(o => RX_PAIR[id + '+' + o]).map(o => { const r = RX_PAIR[id + '+' + o]; return `<button class="ichip" style="--c:${ELEMENTS[o].color}" data-insp="rxcell:${id}+${o}">${inspectEsc(ELEMENTS[o].name)}: ${rxSeen(r) ? inspectEsc(REACTIONS[r].name) : '?'}</button>`; }).join('')}</div>` +
      '<p id="rxDetail" class="hint"></p><button class="btn" data-insp="rx:">REACTIONS</button>';
    INSPECTOR.show(html, E.color);
  },
  // A buff or debuff (statusintro.js). Not yet seen: locked.
  status(key) {
    const I = statusInfo(key);
    if (!I) return;
    if (!(META.seenSt && META.seenSt[key])) { INSPECTOR.show('<div class="isil"></div><h3>???</h3><p class="hint">Not met yet.</p>', '#555'); return; }
    INSPECTOR.show(`<h3>${inspectEsc(key)}</h3><em>${I.buff ? 'BUFF' : 'DEBUFF'}</em><p>${inspectEsc(I.what)}</p><p class="hint">${inspectEsc(I.tip)}</p>`, I.buff ? '#8affc1' : '#ff758f');
  },
  chart() { INSPECTOR.show(rxChartHtml(), '#d1ddef'); },
  // A square of the chart (or a reaction chip on a damage type card): the reaction, in the line below.
  cell(pair) {
    const id = RX_PAIR[pair], R = id && REACTIONS[id], box = document.getElementById('rxDetail');
    if (box) box.innerHTML = !id ? 'These two do not react.' : rxSeen(id) ? `<b style="color:${R.color}">${inspectEsc(R.name)}</b>: ${inspectEsc(R.desc)}` : 'Not seen yet. Set it off in a run.';
  },
};
// The chart as html: 8 damage types by 8. Unseen reactions are "?", pairs that do not react are "-".
function rxChartHtml() {
  const lab = k => `<i class="rxh" style="color:${ELEMENTS[k].color}">${inspectEsc(ELEMENTS[k].name.slice(0, 3).toUpperCase())}</i>`;
  let cells = '', seen = 0;
  const ids = new Set(Object.values(RX_PAIR));
  for (const a of ELEM_ORDER) {
    cells += lab(a);
    for (const b of ELEM_ORDER) {
      const id = RX_PAIR[a + '+' + b], s = id && rxSeen(id);
      cells += `<button class="rxc ${id ? (s ? 'got' : 'unk') : 'none'}" ${s ? `style="--c:${REACTIONS[id].color}"` : ''} data-insp="rxcell:${a}+${b}">${id ? (s ? RX_ABBR[id] : '?') : '-'}</button>`;
    }
  }
  for (const id of ids) if (rxSeen(id)) seen++;
  return `<h3>Reactions</h3><em>${seen} OF ${ids.size} FOUND</em><div class="rxgrid"><i></i>${ELEM_ORDER.map(lab).join('')}${cells}</div><p id="rxDetail" class="hint">Tap a square. A question mark is one you have not set off yet.</p>`;
}
// Field Guide: the damage types as tappable chips, and the chart under them (ui.js codexHtml).
function inspectGuideHtml() {
  return `<div class="irow">${ELEM_ORDER.map(k => `<button class="ichip" style="--c:${ELEMENTS[k].color}" data-insp="el:${k}">${inspectEsc(ELEMENTS[k].name)}</button>`).join('')}</div><button class="btn" data-insp="rx:">REACTION CHART</button>`;
}
// Outside the card (the Field Guide, Active effects) buttons carry data-insp too: one listener for the page.
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-insp]');
  if (!b || b.closest('#inspect')) return;
  const i = b.dataset.insp.indexOf(':'), k = b.dataset.insp.slice(0, i), v = b.dataset.insp.slice(i + 1);
  if (k === 'el') INSPECTOR.elem(v); else if (k === 'st') INSPECTOR.status(v); else if (k === 'rx') INSPECTOR.chart();
});
