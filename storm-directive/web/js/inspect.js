'use strict';
// Spawn Prawn - tap to inspect. Tap an enemy or boss in the world (a quick touch that barely moves) and its card
// comes up: stats, damage, weaknesses and its joke line. Damage types and statuses have cards too (tap a
// weakness on a card, or a row in Active effects), and every damage type card opens the Reaction chart.
// Settings > Inspect speed: PAUSE stops the game while a card is open; HALF slows it to half speed.
// Unmet enemies (META.seen / META.bosses), statuses (META.seenSt) and reactions (META.seenRx) show locked.
// An enemy's card lists its Active effects (user, 26 Oct): every status, damage over time and build-up bar on it now, with
// time left, damage a second and the weapon that put it there; a row opens its Field Guide line. Refreshed while open in HALF.
// Hooks: inspectTap (game.js, endTouch), inspectMul (game.js loop), inspectSeeRx (game.js, react),
// rxChartHtml and data-insp buttons (ui.js Field Guide), data-insp="st:KEY" rows (ui.js status panel).

const INSPECT = { open: false, prev: null, hist: [], pause: true, half: false };
const INSPECT_TAP = { ms: 250, move: 10, pad: 24 };
const inspectMul = () => (INSPECT.open && INSPECT.half ? 0.5 : 1) * (typeof raceMul === 'function' ? raceMul() : 1) * (typeof wsMul === 'function' ? wsMul() : 1); // (the race standings: race15.js; whisper.js: 10% while a line is open)
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
  m['soul+soul'] = 'possession';
  return m;
})();
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

// ---------------------------------------------------------------- an enemy's Active effects
// [name (a GLOSSARY term or an existing status name), colour, detail] for everything on it now
function inspectFxList(e) {
  const L = [], now = G.t, c = e.cd, sec = t => (t > 0 ? t.toFixed(1) + ' s' : ''), by = n => (n ? ' · ' + n : '');
  const glOr = (n, alt) => (GLOSSARY.some(g => g[1] === n) ? n : alt);
  if (typeof f_burning === 'function' && f_burning(e)) L.push(['Burn bar', '#ff6a2a', `${Math.round(c.burnPool / Math.max(0.1, c.burnT))}/s · ${sec(c.burnT)}${by(e.burnBy)}`, 'Burning']);
  if (typeof f_bleeding === 'function' && f_bleeding(e)) { const b = e.bleeds; L.push(['Bleeding', '#c9184a', `×${b.length} · ${Math.round(b.reduce((t, q) => t + q.dps, 0))}/s · ${sec(Math.max(...b.map(q => q.t)))}${by(b[b.length - 1].by)}`]); }
  if (typeof snared === 'function' && snared(e)) L.push(['Snared', FIGHT_COL.snared, sec(e.snareT - now)]);
  if (typeof charged === 'function' && charged(e)) L.push(['Charged', '#c9a400', sec(e.chargeT - now)]);
  if (e.corrodedT > now) L.push(['Corrosion', FIGHT_COL.corroded, sec(e.corrodedT - now), 'Corroded']);
  if (e.dazeT > now) L.push(['Stunned', '#8a94a6', sec(e.dazeT - now)]);
  if (e.charmed) L.push(['Parasite bar', '#b06cff', '', 'Possessed']);
  if (e.conjT > now && e.conjWith && !e.conjWith.dead) L.push(['Conjoined', FIGHT_COL.snared, sec(e.conjT - now)]);
  // the older statuses a few weapons and Feats still leave (chem.js)
  if (e.poison > 0 && e.poisonStacks > 0) L.push(['Sick', ELEMENTS.poison.color, `×${e.poisonStacks} · ${Math.round((e.poisonDps || 0) * e.poisonStacks)}/s · ${sec(e.poison)}${by(e.poisonBy)}`]);
  if (e.burn > 0 && !(typeof f_burning === 'function' && f_burning(e))) L.push(['Melting', ELEMENTS.fire.color, sec(e.burn)]);
  if ((e.chill > 0 || e.frozen > 0) && !(typeof snared === 'function' && snared(e))) L.push([e.frozen > 0 ? 'Glued' : 'Snotty', ELEMENTS.ice.color, sec(Math.max(e.chill || 0, e.frozen || 0))]);
  for (const [k, on] of [['oxi', e.fizz > 0], ['salt', e.pickle > 0], ['soul', e.curse > 0]]) if (on && ELEMENTS[k]) L.push([ELEMENTS[k].status, ELEMENTS[k].color, '']);
  if (e.due && e.due.end > now && WEAPONS.s_duedate) L.push([WEAPONS.s_duedate.name, '#c9184a', sec(e.due.end - now)]);
  if (e.tape && WEAPONS.s_redtape) L.push([WEAPONS.s_redtape.name, ELEMENTS.ice.color, '']);
  // build-up bars, while they fill
  if (c && c.bars) for (const [k, n, cc] of [['acid', 'Corrosion', FIGHT_COL.corroded], ['force', 'Poise', '#8a94a6'], ['fire', 'Burn bar', '#ff6a2a'], ['soul', 'Parasite bar', '#b06cff']]) {
    const v = c.bars[k]; if (v > 0.02) L.push([n, cc, Math.round(Math.min(1, v) * 100) + '%']);
  }
  return L.map(([n, cc, d, label]) => ({ gl: glOr(n, null), label: label || n, colour: cc, detail: d }));
}
const inspectFx = e => {
  const L = inspectFxList(e); if (!L.length) return '';
  return `<div class="irow"><h4>ACTIVE EFFECTS</h4>${L.map(r => `<button class="ichip" style="--c:${col(r.colour)}"${r.gl ? ` data-insp="gl:${inspectEsc(r.gl)}"` : ''}>${inspectEsc(r.label)}${r.detail ? ' <b>' + inspectEsc(r.detail) + '</b>' : ''}</button>`).join('')}</div>`;
};
// HALF speed: the card keeps up with the enemy (4 times a second)
hookOn('tick', 'inspect:foe', () => {
  const e = INSPECT.foe; if (!INSPECT.open || !e) return;
  if (G.t < (INSPECT.foeT || 0)) return; INSPECT.foeT = G.t + 0.25;
  if (!e.dead) INSPECTOR.foe(e, true);
});

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
      else if (k === 'gl') INSPECTOR.gloss(v);
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
    if (back !== 'top') INSPECT.foe = null; // (another card on top: stop refreshing the enemy's)
    if (!back) INSPECT.hist.push({ html, colour }); else if (back === 'top') INSPECT.hist[INSPECT.hist.length - 1] = { html, colour };
    el.className = 'on' + (INSPECT.pause ? ' pausing' : '');
    el.style.setProperty('--ic', colour || '#d1ddef');
    const resume = INSPECT.pause && INSPECT.prev === 'play';
    el.innerHTML = `<div class="icard">${html}<div class="ibtns">${INSPECT.hist.length > 1 ? '<button class="btn" data-insp="back:">BACK</button>' : ''}${uiButton(resume ? 'RESUME' : 'CLOSE', { cls: 'primary', attrs: 'data-insp="close:"' })}</div></div>`;
  },
  back() { if (INSPECT.hist.length > 1) { const first = INSPECT.hist.length === 2; INSPECT.hist.pop(); const h = INSPECT.hist[INSPECT.hist.length - 1]; INSPECTOR.show(h.html, h.colour, true); if (first && INSPECT.foeAt && !INSPECT.foeAt.dead) INSPECT.foe = INSPECT.foeAt; } },
  close() {
    if (!INSPECT.open) return;
    INSPECT.open = false; INSPECT.hist = []; INSPECT.foe = INSPECT.foeAt = null;
    inspectEl().className = '';
    if (G && INSPECT.pause && INSPECT.prev === 'play' && G.state === 'pause') { G.state = 'play'; if (typeof lastTs !== 'undefined') lastTs = performance.now(); }
  },
  // An enemy or boss. Unmet ones are a silhouette.
  foe(e, refresh) {
    const d = e.def, boss = !!(e.boss || e.bossDef), id = boss ? d.id : introKey(e);
    const met = boss ? !!(META.bosses && META.bosses[d.id]) : (!id || !ENEMY_INTRO[id] || seenFoe(id));
    if (!met) {
      INSPECTOR.show('<div class="isil"></div><h3>???</h3><p class="hint">Not met yet.</p><p>Run into it first. It will introduce itself.</p>', '#555');
      return;
    }
    const I = (!boss && id && ENEMY_INTRO[id]) || null, hp = Math.round(e.maxHp || d.hp);
    const dmg = `${Math.round(e.dmg != null ? e.dmg : d.dmg || 0)} on touch` + (d.shoot ? `, ${d.shoot.dmg} per shot` : '');
    const html = `<div class="idot" style="background:${d.color}"></div><h3>${inspectEsc(d.name)}</h3>` + (boss && d.title ? `<em>${inspectEsc(d.title)}</em>` : '') +
      `<div class="istats"><span>HP <b>${hp}</b></span><span>Speed <b>${Math.round(d.speed || 0)}</b></span></div>` +
      `<p>Hits for <b>${dmg}</b>.</p>` +
      inspectFx(e) +
      (I ? `<p class="ijoke">${inspectEsc(I.what)}</p>${uiHint(inspectEsc(I.tip))}` : boss && d.quote ? `<p class="ijoke">${inspectEsc(d.quote)}</p>` : '');
    INSPECTOR.show(html, d.color, refresh ? 'top' : false);
    INSPECT.foe = e; if (!refresh) INSPECT.foeAt = e;
  },
  // A Field Guide term (an Active effects row on an enemy card)
  gloss(name) {
    const g = GLOSSARY.find(r => r[1] === name); if (!g) return;
    INSPECTOR.show(`<h3>${inspectEsc(g[1])}</h3><p>${inspectEsc(g[2])}</p>`, '#d1ddef');
  },
  // A damage type: what it does, its status, and the reaction chart.
  elem(id) {
    const E = ELEMENTS[id]; if (!E) return;
    const st = GLOSSARY.find(g => g[1].toLowerCase().startsWith(E.status.slice(0, 5)));
    const html = `<h3 style="color:${E.color}">${inspectEsc(E.name)}</h3><em>DAMAGE TYPE</em><p>${inspectEsc(E.blurb)}</p>` +
      `<p><b>Status:</b> ${inspectEsc(E.status)}${st ? '. ' + inspectEsc(st[2]) : ''}</p>` +
      `<div class="irow"><h4>REACTS WITH</h4>${RX10_ORDER.filter(o => o !== id).map(o => { const P = rx10Pair(id, o); return `<button class="ichip" style="--c:${ELEMENTS[o].color}" data-insp="rxcell:${id}+${o}">${inspectEsc(ELEMENTS[o].name)}: ${rx10Seen(P[0]) ? inspectEsc(FIGHT_RX[P[0]].name) : '?'}</button>`; }).join('')}</div>` +
      '<p id="rxDetail" class="hint"></p><button class="btn" data-insp="rx:">REACTIONS</button>';
    INSPECTOR.show(html, E.color);
  },
  // A buff or debuff (statusintro.js). Not yet seen: locked.
  status(key) {
    const I = statusInfo(key);
    if (!I) return;
    if (!(META.seenSt && META.seenSt[key])) { INSPECTOR.show('<div class="isil"></div><h3>???</h3><p class="hint">Not met yet.</p>', '#555'); return; }
    INSPECTOR.show(`<h3>${inspectEsc(key)}</h3><em>${I.buff ? 'BUFF' : 'DEBUFF'}</em><p>${inspectEsc(I.what)}</p>${uiHint(inspectEsc(I.tip))}`, I.buff ? '#8affc1' : '#ff758f');
  },
  chart() { INSPECTOR.show(rxChartHtml(), '#d1ddef'); },
  // A square of the chart (or a reaction chip on a damage type card): the reaction, in the line below.
  cell(pair) {
    rxCell10(pair); // (fight.js)
  },
};
// The chart as html: 8 damage types by 8. Unseen reactions are "?", pairs that do not react are "-".
function rxChartHtml() {
  return rxChart10(); // (the 21 v10 reactions: fight.js)
}
// Field Guide: the damage types as tappable chips, and the chart under them (ui.js codexHtml).
function inspectGuideHtml() {
  return `<div class="irow">${RX10_ORDER.map(k => `<button class="ichip" style="--c:${ELEMENTS[k].color}" data-insp="el:${k}">${inspectEsc(ELEMENTS[k].name)}</button>`).join('')}</div>${uiButton('REACTION CHART', { attrs: 'data-insp="rx:"' })}`;
}
// Outside the card (the Field Guide, Active effects) buttons carry data-insp too: one listener for the page.
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-insp]');
  if (!b || b.closest('#inspect')) return;
  const i = b.dataset.insp.indexOf(':'), k = b.dataset.insp.slice(0, i), v = b.dataset.insp.slice(i + 1);
  if (k === 'el') INSPECTOR.elem(v); else if (k === 'st') INSPECTOR.status(v); else if (k === 'rx') INSPECTOR.chart();
});
