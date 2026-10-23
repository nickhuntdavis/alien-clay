// The Tackle Box's LOADOUT tab (its first tab): everything you change or check most while playing, on one page.
// - Autorun: the six modes as buttons.
// - Weapons: one row each (level, next milestone, share of damage, mods), with a target button that opens all 12.
// - Feats: cooldown, and each Feat's own timing (AUTO or WHEN I TAP; w.timing overrides Settings > Feat timing).
// - Combos: every combo, super combo and pairing your weapons are part of, closest first, with what's still needed.
// - Build: the damage types you deal, Acquired Taste / Gone Off It, rerolls, mastery.
// Also opened from a card screen (YOUR BUILD, UI.openBuild) so you can check before you pick.
// Hooks: UI.renderArmoury (tab 'L', loadoutHtml / loadoutBind), game.js Feat auto-perform (featWaits).

// Does this Feat wait for a tap? Its own setting first, then Settings > Feat timing.
function featWaits(w) { return w.timing ? w.timing === 'tap' : SET.featAuto === false; }

function loadoutNext(w) {
  if (w.isSpell) return '';
  const d = w.def, l = PERK_LEVELS.find(x => x > w.lvl);
  if (w.lvl >= MAX_WLVL) return 'Mastered';
  if (w.lvl >= wCap(w)) return `Stops at Lv ${wCap(w)}`;
  if (!l) return `Lv ${MAX_WLVL}: mastery`;
  return `Lv ${l}: ` + (l >= MAX_WLVL ? 'mastery' : d.sig && d.sig[l] ? 'signature' : 'pick an upgrade');
}

// Every combo, super combo and pairing involving a weapon you own, with how close it is (0 to 1).
function loadoutCombos() {
  const rows = [], lv = id => (owned(id) || {}).lvl || 0, mine = new Set(G.weapons.filter(Boolean).map(w => w.id));
  const need = (id, L) => { const o = owned(id); return o ? (o.lvl >= L ? `${WEAPONS[id].name} ready` : `${WEAPONS[id].name} Lv ${o.lvl}/${L}`) : `${WEAPONS[id].name} (not owned)`; };
  const prog = (ids, L) => ids.reduce((a, id) => a + Math.min(1, lv(id) / L), 0) / ids.length;
  for (const c of wl_combos()) {
    if (!mine.has(c.a) && !mine.has(c.b)) continue;
    const on = !!(G.combo && G.combo[c.id]);
    rows.push({ kind: 'COMBO', name: c.name, on, p: on ? 2 : prog([c.a, c.b], COMBO_LEVEL), need: on ? 'Fused' : [need(c.a, COMBO_LEVEL), need(c.b, COMBO_LEVEL)].join(' + '), desc: c.desc, col: '#ff3df2' });
  }
  if (typeof SUPERS !== 'undefined') for (const s of wl_supers()) {
    const ws = superWeapons(s);
    if (!ws.some(id => mine.has(id))) continue;
    const on = superOn(s.id), known = META.supers && META.supers[s.id];
    const combos = [s.x, s.y].map(id => (G.combo && G.combo[id] ? '' : 'needs ' + COMBO_BY[id].name)).filter(Boolean);
    rows.push({ kind: 'SUPER', name: known || on ? s.name : '???', on, p: on ? 2 : prog(ws, SUPER_LEVEL) * 0.9, need: on ? 'Fused' : (combos.length ? combos.join(', ') + '; ' : '') + `all ${ws.length} weapons Lv ${SUPER_LEVEL}+`, desc: known || on ? s.desc : 'A secret. Fuse both combos and find out.', col: SUPER_COLOR });
  }
  for (const q of wl_pairs()) {
    if (!mine.has(q.a) && !mine.has(q.b)) continue;
    const on = !!(G.pair && G.pair[q.id]), known = META.pairs && META.pairs[q.id];
    rows.push({ kind: 'PAIRING', name: known ? q.name : '???', on, p: on ? 2 : prog([q.a, q.b], PAIR_LEVEL), need: on ? 'Active' : [need(q.a, PAIR_LEVEL), need(q.b, PAIR_LEVEL)].join(' + '), desc: known ? q.desc : 'A secret. Try it.', col: PAL.upgrade });
  }
  return rows.sort((a, b) => b.p - a.p);
}

function loadoutHtml() {
  const A = UI.arm || {};
  let h = '';
  // Autorun.
  h += uiPanel('Autorun', `<div class="lomv">${moveModes().map(m => `<button class="lob ${G.moveDir === m.id ? 'sel' : ''}" data-mv="${m.id}">${pictoFor(m.id, 'move')}<b>${m.name}</b><span>${esc(m.desc)}</span></button>`).join('')}</div>`, 'lo');
  // Weapons.
  const W = G.stats.wdmg || {}, tot = G.weapons.reduce((a, x) => a + (x ? W[x.uid] || 0 : 0), 0) || 1;
  h += `${uiPanelOpen('Weapons', 'lo')}`;
  G.weapons.forEach((w, i) => {
    if (!w) return;
    const c = elemCol(wElem(w)), sh = Math.round((W[w.uid] || 0) / tot * 100), dr = DIRECTIVES.find(x => x.id === w.dir), open = A.tgt === w.uid;
    h += `<div class="low" style="--c:${c}"><div class="lowh"><span class="loi">${defPicto(w.def, c) || iconSVG(w.def, 24, c)}</span><div class="lon"><b>${esc(w.def.name)}</b><em>Lv ${w.lvl}/${MAX_WLVL} | ${esc(loadoutNext(w))}</em>
      <div class="losh"><i style="width:${sh}%"></i></div><small>${sh}% of your damage${w.mods.length ? ' | ' + w.mods.map(m => esc(MODS[m.id].name)).join(', ') : ''}</small></div>
      ${w.def.noTarget ? '' : `<button class="lot ${open ? 'on' : ''}" data-tg="${w.uid}">${dr ? dr.short + (w.dir2 && !w.dirs ? '›' + DIRECTIVES.find(x => x.id === w.dir2).short : '') : '?'}</button>`}<button class="lod" data-go="w${i}">&rsaquo;</button></div>`;
    if (open) h += `<div class="lotg">${aimList().map(d => uiChip(d.name, { sel: w.dir === d.id, attrs: `data-dir2="${d.id}" data-uid="${w.uid}" title="${esc(d.desc)}"` })).join('')}${uiHint(esc((DIRECTIVES.find(x => x.id === w.dir) || {}).desc || ''))}${w.dirs ? '' : `${uiHint('Then (breaks ties, and takes over when nothing fits):')}${[{ id: '', name: 'NONE' }].concat(aimList().filter(d => d.id !== w.dir)).map(d => uiChip(d.name, { sel: (w.dir2 || '') === d.id, attrs: `data-dir3="${d.id}" data-uid="${w.uid}"` })).join('')}`}${aimOwnPick(w, w.dir, w.dirs ? null : w.dir2)}</div>`;
    h += `</div>`;
  });
  h += `${uiPanelClose()}`;
  // Feats.
  if (G.spells.some(Boolean)) {
    h += `${uiPanelOpen('Feats', 'lo')}`;
    G.spells.forEach((w, i) => {
      if (!w) return;
      const c = elemCol(wElem(w)), ready = !(w.cd > 0.05), waits = featWaits(w);
      h += `<div class="low" style="--c:${c}"><div class="lowh"><span class="loi">${defPicto(w.def, c) || iconSVG(w.def, 24, c)}</span><div class="lon"><b>${esc(w.def.name)}</b><em>Lv ${w.lvl}/${MAX_WLVL} | ${ready ? 'ready' : Math.ceil(w.cd) + 's'} | every ${w.s ? w.s.cd.toFixed(0) : '?'}s</em></div>
        ${uiChips(`${uiChip('AUTO', { sel: !waits, attrs: `data-fa="${i}" data-v="auto"` })}${uiChip('TAP', { sel: waits, attrs: `data-fa="${i}" data-v="tap"` })}`, 'lofa')}<button class="lod" data-go="s${i}">&rsaquo;</button></div></div>`;
    });
    h += `${uiHint('AUTO: performs itself when ready. TAP: waits for you to tap its button.')}${uiPanelClose()}`;
  }
  // Combos.
  const cr = loadoutCombos();
  if (cr.length) {
    h += uiPanel('Combos to build', uiList(cr.map(r => `<div class="li loc ${r.on ? 'on' : ''}" style="--c:${r.col}"><b style="color:${r.on ? r.col : 'inherit'}">${esc(r.name)}</b> <em>${r.kind}</em><div class="losh"><i style="width:${Math.round(Math.min(1, r.p) * 100)}%"></i></div><span>${esc(r.need)}</span><br><span class="lodesc">${esc(r.desc)}</span></div>`).join('')), 'lo');
  }
  // Build.
  const els = {};
  G.weapons.forEach(w => { if (w) { const e = wElem(w); els[e] = (els[e] || 0) + (W[w.uid] || 0); } });
  const et = Object.values(els).reduce((a, b) => a + b, 0) || 1;
  const B = G.elemBias || {}, mo = G.weapons.find(w => w && w.lvl >= MAX_WLVL);
  h += uiPanel('Your build', `<div class="loel">${Object.entries(els).sort((a, b) => b[1] - a[1]).map(([e, v]) => `<span style="--c:${elemCol(e)}"><i style="width:${Math.max(4, Math.round(v / et * 100))}%"></i>${esc(ELEMENTS[e].name)} ${Math.round(v / et * 100)}%</span>`).join('')}</div>
    ${uiTiles(`${uiTile(G.rerolls, 'Rerolls')}${uiTile(B.up ? esc(ELEMENTS[B.up].name) : '-', 'Acquired Taste')}${uiTile(B.down ? esc(ELEMENTS[B.down].name) : '-', 'Gone Off It')}${uiTile(mo ? esc(mo.def.name) : 'Open', 'Mastery')}`)}`, 'lo');
  return h;
}

function loadoutBind(body, rerender) {
  const keep = fn => () => { const y = body.closest('.screen').scrollTop; fn(); rerender(); body.closest('.screen').scrollTop = y; };
  body.querySelectorAll('[data-mv]').forEach(b => b.addEventListener('click', keep(() => { G.moveDir = b.dataset.mv; UI.refreshHud(true); })));
  body.querySelectorAll('[data-tg]').forEach(b => b.addEventListener('click', keep(() => { UI.arm.tgt = UI.arm.tgt === +b.dataset.tg ? null : +b.dataset.tg; })));
  body.querySelectorAll('[data-dir2]').forEach(b => b.addEventListener('click', keep(() => {
    const w = G.weapons.find(x => x && x.uid === +b.dataset.uid); if (!w) return;
    w.dir = b.dataset.dir2; if (w.dirs) w.dirs[0] = w.dir; if (w.dir2 === w.dir) w.dir2 = null; UI.refreshHud(true);
  })));
  body.querySelectorAll('[data-dir3]').forEach(b => b.addEventListener('click', keep(() => {
    const w = G.weapons.find(x => x && x.uid === +b.dataset.uid); if (!w) return;
    w.dir2 = b.dataset.dir3 || null; UI.arm.tgt = w.dir2 === 'ownmess' ? w.uid : null; UI.refreshHud(true); // (MY OWN MESS stays open to pick whose)
  })));
  aimOwnBind(body, keep(() => {})); // (aimat.js)
  body.querySelectorAll('[data-fa]').forEach(b => b.addEventListener('click', keep(() => { const w = G.spells[+b.dataset.fa]; if (w) w.timing = b.dataset.v; })));
  body.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.go[0], i = +b.dataset.go.slice(1);
    UI.arm = { k, i, bar: 0, recycle: false, from: UI.arm.from }; UI.renderArmoury(); body.closest('.screen').scrollTop = 0;
  }));
}
