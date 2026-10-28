'use strict';
// Spawn Prawn - the Field Guide, rebuilt for v10 (user, 27 Oct: "update all of the field guide"). ui.js codexHtml was
// written for v9 and listed things a v10 run can no longer meet: the 37 v9 reactions (Cooties, Oil and Water are
// retired types), Rewind (off since norewind.js), armour, melting and snotty statuses, enemies with no live spawn,
// unreachable secrets and mutations, and combo twists for retired type pairs. This file replaces UI.codexHtml and
// lists only what can still happen, built from the live tables:
//  - RULES: the seven v10 damage types (V10_TYPES) with their bar or status from GLOSSARY, the 21 v10 reactions
//    (fight.js RX10 / FIGHT_RX, ? until set off), enemy defences and attack types (GLOSSARY).
//  - COMBOS: the weapon fusions (WF_LIST); the old combos, super combos and twists are retired.
//  - ENEMIES: only ids that can still spawn (intro.js introLive). BOSSES: the v10 signature line under each boss.
//  - SECRETS and MUTATIONS: only the ones a run can still give (CDX10_DEAD_QUIRKS, cdx10Muts; taken ones in META.cdxMut).
//  - SEQUENCES: the samples' ranks (a v10 sample is its own sequence), without the v9 Primary line.
// The damage type card (inspect.js INSPECTOR.elem) uses the same v10 type table.
// Copy still open: TODO_COPY:type_<id>_blurb (6), cdx_def_title/hint, cdx_atk_title/hint, cdx_rx_hint, cdx_seq_hint,
// cdx_mut_hint, cdx_wf_hint.
// Hooks: none in shared files. Replaces UI.codexHtml and INSPECTOR.elem (loads after ui.js and inspect.js).

// Each v10 damage type: the GLOSSARY entry for what it builds on a target, and its one-line summary.
const CDX10_TYPES = {
  phys:   { st: 'Poise',        blurb: 'Plain physics. Builds Poise: fill the bar and the enemy staggers. No status damage and no reactions.' },
  fire:   { st: 'Corrosion',    blurb: 'Eats armour. Fills Corrosion, and each full bar strips one Shell layer for good.' },
  shock:  { st: 'Charged',      blurb: 'Spreads. Charged enemies take 20% more Static and pass arcs on to their neighbours.' },
  ice:    { st: 'Snared',       blurb: 'Gums them up. Snared enemies slow right down, and it puts out Burning.' },
  arcane: { st: 'Bleeding',     blurb: 'Bleeds them. Kill one while it Bleeds and you heal a little, and it leaves a pool.' },
  soul:   { st: 'Holy/Damned bar', blurb: 'Every hit is Holy or Damned, depending on where it came from. Fill the bar Holy and the enemy is Possessed and fights its mates. Fill it Damned and it takes 30% more damage for 4 s, and passes some of that on when it dies.' },
  flame:  { st: 'Burn bar',     blurb: null }, // (ELEMENTS.flame.blurb is already v10)
};
const CDX10_DEFS = ['Membrane', 'Shell', 'Squishy', 'Thorns', 'Evasion'];
const CDX10_ATKS = ['Contact', 'Projectile', 'Spread', 'Burst', 'Beam', 'Pool'];
// Secrets whose trigger cannot happen now: a venom (boozy) puddle (venom is on hold), the parked amoeba, Imaginary Friend.
const CDX10_DEAD_QUIRKS = new Set(['wetwire', 'flammable', 'icerink', 'indigestion', 'doublebluff']);
// Mutations: none of genes.js MUTATIONS can be had now (elite drops and splices are off, spassives.js). The live ones
// are the sperm passive cards the draft deals (spslice.js SLICE.muts while the slice is on, else every genome card).
// Taking one logs it in META.cdxMut (its card's apply, wrapped below).
const cdx10Card = id => CARDS.find(c => c.id === id);
const cdx10Muts = () => [...new Set(SLICE.on ? SLICE.muts : CARDS.filter(c => c.slot === 'genome' && c.kind === 'acquire').map(c => c.id))].filter(cdx10Card);
const cdx10Gloss = n => { const g = GLOSSARY.find(r => r[1] === n); return g ? g[2] : ''; };
const cdx10Blurb = id => (CDX10_TYPES[id] && CDX10_TYPES[id].blurb) || ELEMENTS[id].blurb;
const cdx10Quirks = () => Object.keys(QUIRKS).filter(id => !CDX10_DEAD_QUIRKS.has(id));
// Weapon fusions (wfusion*.js WF_LIST) replaced the v10 combos, super combos and combo twists (all retired: availableCombos
// is empty, so G.combo never fills). Fusing one logs it in META.cdxWf (wfFuse, wrapped below).
const cdx10Wf = () => (typeof WF_LIST !== 'undefined' && WF.on ? WF_LIST.filter(f => WEAPONS[f.a] && WEAPONS[f.b] && WF_TEXT[f.id]) : []);

UI.codexHtml = function () {
  const run = !!G, cyan = PAL.upgrade, sec = UI.codexSec || 'all', box = (title, inner, hint) => uiPanel(`${title}`, `${hint ? uiHint(hint) : ''}${inner}`);
  const wids = wl_wids(), used = wids.filter(id => wl_stat(id));
  const pf = wl_pairs().filter(q => META.pairs[q.id]), qs = cdx10Quirks(), qf = qs.filter(id => META.quirks[id]);
  const foes = introIds(), beasts = foes.filter(seenFoe).length;
  const met = BOSSES.filter(b => META.bosses[b.id]).length, rel = Object.keys(RELICS).filter(id => META.relics[id]);
  const pids = wl_profiles(), pu = pids.filter(profUnlocked), mids = cdx10Muts(), mf = mids.filter(id => META.cdxMut && META.cdxMut[id]);
  const wfs = cdx10Wf(), cf = wfs.filter(f => META.cdxWf && META.cdxWf[f.id]);
  const got = used.length + cf.length + pf.length + qf.length + met + rel.length + pu.length + mf.length + beasts;
  const all = wids.length + wfs.length + wl_pairs().length + qs.length + BOSSES.length + Object.keys(RELICS).length + pids.length + mids.length + foes.length;
  let h = uiPanel('', `<div class="cdxpct"><b>${Math.round(got / all * 100)}%</b><span>FIELD GUIDE COMPLETE</span></div><div class="cdxbar"><i style="width:${(got / all * 100).toFixed(1)}%"></i></div>
    <div class="cdxcount"><span>Weapons ${used.length}/${wids.length}</span><span>Fusions ${cf.length}/${wfs.length}</span><span>Pairings ${pf.length}/${wl_pairs().length}</span><span>Secrets ${qf.length}/${qs.length}</span><span>Enemies ${beasts}/${foes.length}</span><span>Bosses ${met}/${BOSSES.length}</span><span>Trophies ${rel.length}/${Object.keys(RELICS).length}</span><span>Sequences ${pu.length}/${pids.length}</span><span>Mutations ${mf.length}/${mids.length}</span></div>`, 'cdxhead');
  h += uiChips([['all', 'ALL'], ['samples', 'SAMPLES'], ['weapons', 'WEAPONS'], ['feats', 'FEATS'], ['genes', 'SEQUENCES'], ['muts', 'MUTATIONS'], ['pairs', 'COMBOS'], ['secrets', 'SECRETS'], ['beasts', 'ENEMIES'], ['bosses', 'BOSSES'], ['rules', 'RULES']].map(([id, l]) => uiChip(l, { sel: sec === id, attrs: `data-cdx="${id}"` })).join(''), 'cdxtabs');
  const show = id => sec === 'all' || sec === id;
  if (show('weapons')) {
    let l = '';
    for (const id of wids) {
      const d = WEAPONS[id], r = wl_stat(id), own = run && G.weapons.some(w => w && (w.sid || w.id) === id);
      l += `<div class="li cdxw ${own ? 'on' : ''}"><span class="bico">${defPicto(d, r ? elemCol(d.elem) : '') || iconSVG(d, 22, r ? elemCol(d.elem) : '#ffffff40')}</span><div><b style="color:${r ? 'inherit' : '#ffffff80'}">${esc(d.name)}</b> <span class="brole">${esc((d.role || '').toUpperCase())}${d.toy ? ' | TOY' : ''}</span><br><span>${esc(d.play || d.desc)}</span><br><em>${r ? `${r.runs} run${r.runs > 1 ? 's' : ''}, born ${r.born}, best Lv ${r.best}` : 'Never taken into a run.'}</em></div></div>`;
    }
    h += box(`Weapons (${used.length}/${wids.length} used)`, uiList(l), 'Every weapon in the fridge. Take one into a run to log it.');
  }
  if (show('feats')) {
    let l = '';
    for (const id in SPELLS) {
      if (!wl_feat(id)) continue;
      const d = SPELLS[id], own = run && G.spells.some(w => w && w.id === id), F = SPELL_FORKS[id];
      const cost = d.passive ? 'performs itself, ' + d.base.cd + 's cooldown' : STAM_FEATS.has(id) ? 'stamina' : d.base.cd + 's cooldown';
      const seq = d.seqOnly && PROFILES[d.seqOnly] ? ` (${esc(PROFILES[d.seqOnly].name)} only)` : '';
      l += `<div class="li cdxw ${own ? 'on' : ''}"><span class="bico">${defPicto(d, elemCol(d.elem)) || iconSVG(d, 22, elemCol(d.elem))}</span><div><b>${esc(d.name)}</b> <span class="brole">${esc(ELEMENTS[d.elem].name.toUpperCase())}, ${cost}${seq}</span><br><span>${esc(d.desc)}</span>${F ? `<br><span class="hint">Lv ${SPELL_FORK_LV}: <b>${esc(F[0].name)}</b> (${esc(F[0].desc)}) or <b>${esc(F[1].name)}</b> (${esc(F[1].desc)})</span>` : ''}</div></div>`;
    }
    h += box(`Feats (${Object.keys(SPELLS).filter(wl_feat).length})`, uiList(l), 'Every Feat in the Tackle Box. Attacking Feats are paid for in stamina; the rest wait on a cooldown.');
  }
  if (show('samples') && typeof slCodex === 'function') h += slCodex(box);
  if (show('genes')) {
    // A v10 sample is its own sequence: its trait and rank (the v9 "as your Primary" line repeated the trait).
    const row = id => {
      const Pr = PROFILES[id], u = Pr.unlock, open = profUnlocked(id), r = profRank(id), next = PROFILE_RANKS[r] || 0;
      const prog = !open ? `<em>LOCKED: ${esc(u.text)} (${fmtNum(Math.min(u.have(), u.need))}/${fmtNum(u.need)})</em>` : `<em>Rank ${r}${next ? ` | ${fmtNum(profKills(id))}/${fmtNum(next)} kills to Rank ${r + 1}` : ' (max)'}</em>`;
      return `<div class="li ${run && genesOn(id) ? 'on' : ''}"><b>${esc(Pr.name)}</b> <span class="brole">${esc(Pr.trait.toUpperCase())}</span><br><span>${esc(Pr.desc)}</span><br>${prog}</div>`;
    };
    h += box(`Epigenetic Profiles (${pu.length}/${pids.length} unlocked)`, uiList(pids.map(row).join('')), 'Every sample on the rack. Rescue one in a run and finish that run to unlock it.');
  }
  if (show('muts')) {
    h += box(`Mutations found (${mf.length}/${mids.length})`, uiList(mids.map(id => { const k = META.cdxMut && META.cdxMut[id], M = cdx10Card(id); return `<div class="li ${run && G.muts && G.muts[id] ? 'on' : ''}"><b style="color:${k ? cyan : 'inherit'}">${k ? esc(M.title) : '???'}</b><br><span>${k ? esc(M.desc) : 'Not stapled to your genome yet.'}</span></div>`; }).join('')), 'Cards that change the sperm itself. Take one in a run to log it.');
  }
  if (show('pairs')) {
    let lc = '';
    for (const f of wfs) {
      const known = META.cdxWf && META.cdxWf[f.id], on = run && wfOn(f.id), T = WF_TEXT[f.id];
      lc += `<div class="li cdxw ${on ? 'on' : ''}"><span class="bico">${defPicto(WEAPONS[f.a], known ? elemCol(WEAPONS[f.a].elem) : '') || iconSVG(WEAPONS[f.a], 22, known ? elemCol(WEAPONS[f.a].elem) : '#ffffff40')}</span><div><b style="color:${known ? '#ff3df2' : 'inherit'}">${esc(T.name)}</b>${on ? ' (FUSED)' : known ? '' : ' (not fused yet)'}<br><span>${esc(WEAPONS[f.a].name)} + ${esc(WEAPONS[f.b].name)}: ${esc(T.desc)}</span></div></div>`;
    }
    h += box(`Fusions (${cf.length}/${wfs.length} fused)`, uiList(lc), 'Some pairs of weapons fuse into something else. Hold both in a run to find out which.');
    let l = '';
    for (const q of wl_pairs()) {
      const known = META.pairs[q.id], on = run && G.pair && G.pair[q.id];
      l += `<div class="li ${on ? 'on' : ''}"><b style="color:${known ? cyan : 'inherit'}">${known ? esc(q.name) : '???'}</b>${on ? ' (ACTIVE)' : ''}<br><span>${known ? esc(WEAPONS[q.a].name) + ' + ' + esc(WEAPONS[q.b].name) + ': ' + esc(q.desc) : 'Two weapons, both Lv ' + PAIR_LEVEL + '+. Nobody has told you which.'}</span></div>`;
    }
    h += box(`Pairings found (${pf.length}/${wl_pairs().length})`, uiList(l));
  }
  if (show('secrets')) {
    let l = '';
    for (const id of qs) { const known = META.quirks[id], Q = QUIRKS[id]; l += `<div class="li ${run && G.quirks && G.quirks[id] ? 'on' : ''}"><b style="color:${known ? cyan : 'inherit'}">${known ? esc(Q.name) : '???'}</b><br><span>${known ? esc(Q.desc) : 'Undiscovered.'}</span></div>`; }
    h += box(`Secrets found (${qf.length}/${qs.length})`, uiList(l), 'Things that happen when the rules collide. Nobody will tell you what they are.');
  }
  if (show('beasts')) {
    let l = '';
    for (const id of foes) {
      const d = ENEMIES[id] || (typeof LV_FOES !== 'undefined' && LV_FOES[id]), I = ENEMY_INTRO[id], m = seenFoe(id); // (campaign germs live in LV_FOES)
      if (!d) continue;
      l += `<div class="li cdxe">${portraitTag('foe', id, m)}<div><b${m ? ` style="color:${col(d.color)}"` : ''}>${m ? esc(d.name) : '???'}</b><br><span>${m ? esc(I.what) + ' <i>' + esc(I.tip) + '</i>' : 'Not met yet.'}</span></div></div>`;
    }
    let rv = '';
    for (const R of RIVALS) {
      const m = META.seen && META.seen['rival_' + R.id];
      rv += `<div class="li cdxe">${portraitTag('rival', R.id, m)}<div><b${m ? ` style="color:${R.color}"` : ''}>${m ? esc(R.name) : '???'}</b>${m ? ' <em>' + esc(R.nick) + '</em>' : ''}<br><span>${m ? esc(R.bio) + UI.rivalBars(R) + R.specs.map(x => '<b>' + esc(x.name) + '</b>: ' + esc(x.desc)).join('<br>') + '<br><i>' + esc(R.tip) + '</i>' : 'Not met yet.'}</span></div></div>`;
    }
    h += box(`Rivals (${RIVALS.filter(R => META.seen && META.seen['rival_' + R.id]).length}/${RIVALS.length} met)`, uiList(rv), 'The other swimmers in the race, with their specialities.');
    h += box(`Enemies (${beasts}/${foes.length} met)`, uiList(l), 'Every enemy type you have met, with how to beat it. Settings > Tutorial lets you meet them again.');
  }
  if (show('bosses')) {
    let l = '';
    for (const b of BOSSES) {
      const m = META.bosses[b.id], now = run && G.bossRoster && G.bossRoster.indexOf(b.id) >= 0 && G.bossRoster.indexOf(b.id) < G.bossCount;
      const rl = b.relics.map(id => (META.relics[id] ? `<b style="color:${PAL.reward}">${esc(RELICS[id].name)}</b>` : esc(RELICS[id].name))).join(', ');
      l += `<div class="li cdxe boss ${now ? 'on' : ''}">${portraitTag('boss', b.id, m)}<div><b>${m ? esc(b.name) : '???'}</b>${m ? ' <em>' + esc(b.title) + '</em>' : ''}<br><span>${m ? cdx10Boss(b) + ' Relics: ' + rl : 'Not met yet.'}</span></div></div>`;
    }
    h += box(`The boss ward (${met}/${BOSSES.length} met, ${rel.length}/${Object.keys(RELICS).length} trophies taken)`, uiList(l), `Every run you meet ${BOSSES_PER_RUN} of them, in a random order. Trophies you have taken are in gold.`);
  }
  if (show('rules')) {
    let el = '';
    for (const id of V10_TYPES) {
      const T = CDX10_TYPES[id], E = ELEMENTS[id];
      el += `<div class="li"><b style="color:${E.color}">${esc(E.name)}</b> <em>${esc(T.st)}</em><br><span>${esc(cdx10Blurb(id))}</span><br><span class="hint">${esc(cdx10Gloss(T.st))}</span></div>`;
    }
    h += box('Damage types', inspectGuideHtml() + uiList(el), 'Every weapon has one. Switched at Birth changes it. Tap one for its card.');
    let rl = '', seen = 0;
    for (const k in RX10) {
      const [rid, how] = RX10[k], R = FIGHT_RX[rid], s = rx10Seen(rid), [a, b] = k.split('+');
      if (s) seen++;
      rl += `<div class="li"><b${s ? ` style="color:${R.color}"` : ''}>${s ? esc(R.name) : '???'}</b> <em>${esc(ELEMENTS[a].name)} + ${esc(ELEMENTS[b].name)}</em>${run && G.stats.reactBy[rid] ? ' x' + G.stats.reactBy[rid] : ''}<br><span>${s ? esc(how) : 'Not seen yet. Set it off in a run.'}</span></div>`;
    }
    h += box(`Unstable reactions (${seen}/${Object.keys(RX10).length} found)`, uiList(rl), 'Two different damage types on one enemy set off an unstable reaction. Each is logged the first time it goes off.');
    h += box('Defences', uiList(CDX10_DEFS.map(n => `<div class="li"><b>${esc(n)}</b><br><span>${esc(cdx10Gloss(n))}</span></div>`).join('')), 'What enemies wear to keep you out.');
    h += box('Attack types', uiList(CDX10_ATKS.map(n => `<div class="li"><b>${esc(n)}</b><br><span>${esc(cdx10Gloss(n))}</span></div>`).join('')), 'How each attack lands, and what can dodge it.');
  }
  return h;
};

// A boss's line: its v10 strengths (defence and signature second beat), then its weaknesses.
// (boss10.js writes both from the boss's v10 defence; bosssig10_t*.js add the signature line, holdcopy.js fills it.)
function cdx10Boss(b) {
  const st = (b.strengths || []).filter(x => x && !/^TODO_COPY/.test(x)), wk = b.weaknesses || [];
  return (st.length ? esc(st.join('. ')) + '. ' : '') + (wk.length ? 'Weak to: ' + esc(wk.join('; ')) + '.' : '');
}

// The damage type card (tap a type chip): the v10 summary and what it builds, then its reactions.
INSPECTOR.elem = function (id) {
  const E = ELEMENTS[id], T = CDX10_TYPES[id]; if (!E || !T) return;
  const html = `<h3 style="color:${E.color}">${inspectEsc(E.name)}</h3><em>DAMAGE TYPE</em><p>${inspectEsc(cdx10Blurb(id))}</p>` +
    `<p><b>${inspectEsc(T.st)}:</b> ${inspectEsc(cdx10Gloss(T.st))}</p>` +
    `<div class="irow"><h4>REACTS WITH</h4>${RX10_ORDER.filter(o => o !== id).map(o => { const P = rx10Pair(id, o); return `<button class="ichip" style="--c:${ELEMENTS[o].color}" data-insp="rxcell:${id}+${o}">${inspectEsc(ELEMENTS[o].name)}: ${rx10Seen(P[0]) ? inspectEsc(FIGHT_RX[P[0]].name) : '?'}</button>`; }).join('')}</div>` +
    '<p id="rxDetail" class="hint"></p><button class="btn" data-insp="rx:">REACTIONS</button>';
  INSPECTOR.show(html, E.color);
};

// Log each live mutation the first time it is taken (META.cdxMut), for the MUTATIONS tab.
for (const id of new Set([...SLICE.muts, ...CARDS.filter(c => c.slot === 'genome').map(c => c.id)])) {
  const c = cdx10Card(id); if (!c || !c.apply || c.cdxLog) continue;
  c.apply = (orig => function () { META.cdxMut = META.cdxMut || {}; if (!META.cdxMut[id]) { META.cdxMut[id] = 1; saveMeta(); } return orig.apply(this, arguments); })(c.apply);
  c.cdxLog = 1;
}

// Log each fusion the first time it is made (META.cdxWf), for the COMBOS tab.
if (typeof wfFuse === 'function') wfFuse = (orig => function (f) { META.cdxWf = META.cdxWf || {}; if (f && !META.cdxWf[f.id]) { META.cdxWf[f.id] = 1; saveMeta(); } return orig.apply(this, arguments); })(wfFuse);
