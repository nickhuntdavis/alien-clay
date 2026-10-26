'use strict';
// Spawn Prawn - the Passive Feat slot and aura Feats (user, 26 Oct: "New slot that sits on the bottom row").
//  - ONE SLOT, on the Feat row (its own HUD key, #pfSlot, after the Feat slots). It holds an aura: either an aura Feat
//    (Flame Cloak, Pearl Necklace) or a weapon that took Melee or Orbiting.
//  - MELEE / ORBITING turn a weapon into an aura (user, 22 and 26 Oct; this also ends Delivery stacking): the weapon moves
//    to the Passive Feat slot (it stays in G.weapons underneath, marked w.pfAura, so every modifier and cell keeps
//    working; its weapon-row slot is hidden), a weapon mount opens with a weapon draft, and the modifiers the audit finds
//    do nothing under that Delivery (moddead.js MOD_DEAD[weapon][melee|orbiting]) come off; the hold view of the Melee
//    and Orbiting cards says so before you take them. Melee and Orbiting are only dealt while the slot is free (or to the
//    weapon already in it).
//  - AURA FEATS (drafted like Feats, levels 1 to 5, no stamina, always on):
//      Flame Cloak (Fire): burns everything within PF.cloakR of you, four times a second.
//      Pearl Necklace (Mucus): pearls circle you (PF.pearlR) and pop on the first enemy they touch (Mucus: Snare),
//        growing back after PF.regrow s; from level 4 they also pop on enemy shots, destroying them.
//    Each level: +35% damage; levels 3 and 5 widen the aura (and add a pearl).
//  - Also fixes the HUD for weapon mounts past the first three (fusion's and this file's): weapon-row keys are added as
//    G.weapons grows (ui.js builds MAX_WEAPONS at start).
//  - Card text is TODO_COPY (PF_TEXT).
// Hooks: none in shared files. hookOn tick 'pfTick'; wraps modAdd, modOk, hcWeapon (holdcopy.js), cardOpt (draft.js),
// sbSlotMark, comboBonds (fusion.js, called at the end of UI.refreshHud) and modDraw. Loads after holdcopy.js.
const PF = { on: !(typeof window !== 'undefined' && window.V10_OFF), cloakR: 70, cloakDmg: 5, cloakTick: 0.25, pearlR: 56, pearlN: 5, pearlDmg: 9, pearlSpin: 2.6, regrow: 1.5, lvK: 0.35 };
const PF_TEXT = {
  slotEmpty: 'TODO_COPY:pf_slot_empty', slotWeapon: 'TODO_COPY:pf_slot_weapon', holdMoves: 'TODO_COPY:pf_hold_moves', holdLoses: 'TODO_COPY:pf_hold_loses',
  flame_cloak: { desc: 'TODO_COPY:pf_flame_cloak_desc', up: 'TODO_COPY:pf_flame_cloak_up' },
  pearl_necklace: { desc: 'TODO_COPY:pf_pearl_necklace_desc', up: 'TODO_COPY:pf_pearl_necklace_up' },
};
const PF_AURAS = {
  flame_cloak: { id: 'flame_cloak', name: 'Flame Cloak', type: 'fire', elem: 'flame', icon: 'FC', ico: 'flame' },
  pearl_necklace: { id: 'pearl_necklace', name: 'Pearl Necklace', type: 'mucus', elem: 'ice', icon: 'PN', ico: 'bubble' },
};
for (const a of Object.values(PF_AURAS)) { a.def = { name: a.name, icon: a.icon, elem: a.elem, color: ELEMENTS[a.elem].color, desc: PF_TEXT[a.id].desc }; if (typeof DEF_ID !== 'undefined') DEF_ID.set(a.def, 'pf_' + a.id); if (typeof ICON_OF !== 'undefined') ICON_OF['pf_' + a.id] = a.ico; }
const pfS = () => G.pf || (G.pf = { w: null, feat: null, pearls: [] });
const pfWeapon = () => { const P = G && G.pf; return P && P.w && G.weapons.includes(P.w) ? P.w : null; };
const pfFeat = () => (G && G.pf && G.pf.feat) || null;
const pfFree = () => !pfWeapon() && !pfFeat();
const pfK = F => 1 + PF.lvK * (F.lvl - 1);
const pfLive = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
const pfSrc = F => ({ elem: PF_AURAS[F.id].elem, wname: PF_AURAS[F.id].name, noCrit: true, noProc: true, atk: F.id === 'flame_cloak' ? 'pool' : 'proj', pfAura: F.id });

// ---------------------------------------------------------------- a weapon becomes an aura
function pfConvert(w, via) {
  if (!w || w.pfAura || !pfFree()) return false;
  const P = pfS(), dead = ((typeof MOD_DEAD !== 'undefined' && MOD_DEAD[w24Key(w)]) || {})[via] || [];
  const lost = [...new Set((w.m10 || []).filter(id => dead.includes(id)))];
  w.m10 = (w.m10 || []).filter(id => !dead.includes(id));
  w.pfAura = via; w.pfLost = lost; P.w = w;
  G.weapons.push(null); // (the mount it leaves)
  if (!G.lootQueue.some(r => r.kind === 'slot')) G.lootQueue.push({ kind: 'slot' });
  const p = G.player; ring(p.x, p.y, 90, w.def.color, 0.5, 5);
  recomputeAll();
  return true;
}
const pfLoses = (w, via) => { const dead = ((typeof MOD_DEAD !== 'undefined' && MOD_DEAD[w24Key(w)]) || {})[via] || []; return [...new Set((w.m10 || []).filter(id => dead.includes(id)))]; };

// ---------------------------------------------------------------- aura Feats: cards
for (const a of Object.values(PF_AURAS)) {
  const base = { slot: 'pfeat', family: 'feat:' + a.type, type: a.type, rarity: 1, start: true, title: a.name, icon: a.icon, color: a.def.color, maxRank: 5 };
  const own = () => { const F = pfFeat(); return F && F.id === a.id ? F : null; };
  draftRegister(Object.assign({ id: 'feat_pf_' + a.id, kind: 'acquire', desc: PF_TEXT[a.id].desc, eligible: () => PF.on && pfFree(), apply: () => { if (pfFree()) { pfS().feat = { id: a.id, lvl: 1 }; pfS().pearls = []; } }, rank: () => 0 }, base));
  draftRegister(Object.assign({ id: 'feat_pf_' + a.id + '_up', kind: 'enhance', desc: PF_TEXT[a.id].up, eligible: () => { const F = own(); return !!F && F.lvl < 5; }, apply: () => { const F = own(); if (F && F.lvl < 5) F.lvl++; }, rank: () => { const F = own(); return F ? F.lvl : 0; } }, base));
}

// ---------------------------------------------------------------- aura Feats: each frame
function pfTick(dt) {
  if (!G || G.state !== 'play' || !G.pf) return;
  const F = pfFeat(), p = G.player; if (!F) return;
  const P = G.pf, k = pfK(F), wide = 1 + (F.lvl >= 3 ? 0.15 : 0) + (F.lvl >= 5 ? 0.15 : 0);
  if (F.id === 'flame_cloak') {
    const R = PF.cloakR * wide;
    if (!(P.cloakT > G.t)) {
      P.cloakT = G.t + PF.cloakTick;
      forNear(p.x, p.y, R + 30, e => { if (pfLive(e) && Math.hypot(e.x - p.x, e.y - p.y) < R + e.r) damageEnemy(e, PF.cloakDmg * k, pfSrc(F)); });
    }
    if (typeof tlEmit === 'function') for (let i = 0; i < 2; i++) { const a = Math.random() * TAU; tlEmit('flame', p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, 5); }
  } else if (F.id === 'pearl_necklace') {
    const n = PF.pearlN + (F.lvl >= 3 ? 1 : 0) + (F.lvl >= 5 ? 1 : 0), R = PF.pearlR * wide;
    while (P.pearls.length < n) P.pearls.push({ back: 0 });
    P.spin = (P.spin || 0) + PF.pearlSpin * dt;
    P.pearls.forEach((q, i) => {
      const a = P.spin + i / n * TAU; q.x = p.x + Math.cos(a) * R; q.y = p.y + Math.sin(a) * R;
      if (q.back > G.t) return;
      let hit = null; forNear(q.x, q.y, 40, e => { if (!hit && pfLive(e) && Math.hypot(e.x - q.x, e.y - q.y) < e.r + 7) hit = e; });
      if (hit) { damageEnemy(hit, PF.pearlDmg * k, pfSrc(F)); q.back = G.t + PF.regrow; fxParts('bubble', q.x, q.y, ELEMENTS.ice.color, 5, 70, 0.35, 2); return; }
      if (F.lvl >= 4) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - q.x, b.y - q.y) < 9) { b.dead = true; q.back = G.t + PF.regrow; fxParts('bubble', q.x, q.y, ELEMENTS.ice.color, 4, 60, 0.3, 2); break; }
    });
  }
}
hookOn('tick', 'pfTick', dt => pfTick(dt));

// ---------------------------------------------------------------- HUD: the Passive Feat key, and more weapon keys
function pfInfo() {
  const w = pfWeapon(), F = pfFeat();
  if (w) return `<b style="color:${elemCol(wElem(w))}">${esc(w.def.name)}</b> <em>${wLvText(w)}</em><p>${esc(PF_TEXT.slotWeapon)}</p><p>${esc(w.def.desc || '')}</p>`;
  if (F) { const a = PF_AURAS[F.id]; return `<b style="color:${elemCol(a.elem)}">${esc(a.name)}</b> <em>Lv ${F.lvl}</em><p>${esc(PF_TEXT[F.id].desc)}</p>`; }
  return `<p>${esc(PF_TEXT.slotEmpty)}</p>`;
}
function pfHud() {
  if (!G || !PF.on) return;
  const ws = $('wslots'); // (fusion and auras add weapon mounts past the HUD's first MAX_WEAPONS keys)
  if (ws) while (ws.children.length < G.weapons.length) ws.appendChild(UI.makeSlotEl('w', ws.children.length));
  const ss = $('sslots'); if (!ss) return;
  let el = $('pfSlot');
  if (!el) {
    el = document.createElement('div'); el.id = 'pfSlot'; el.className = uiWeaponSlotClass('s') + ' pfslot'; el.innerHTML = uiWeaponSlotInner(); ss.appendChild(el);
    holdable(el, pfInfo, () => { const w = pfWeapon(); if (w && G && G.state === 'play') UI.openArmoury('w', G.weapons.indexOf(w)); });
  }
  const w = pfWeapon(), F = pfFeat(), key = w ? 'w' + w.uid + ':' + w.lvl : F ? 'f' + F.id + ':' + F.lvl : 'empty';
  if (el.dataset.k !== key) {
    el.dataset.k = key; el.style.display = '';
    const def = w ? w.def : F ? PF_AURAS[F.id].def : null, c = w ? elemCol(wElem(w)) : F ? elemCol(PF_AURAS[F.id].elem) : '#6b7a8c';
    el.classList.toggle('empty', !def); el.style.setProperty('--c', c); el.style.borderStyle = def ? '' : 'dashed';
    el.querySelector('.ico').innerHTML = def ? iconSVG(def, 18, c) : '';
    el.querySelector('.lv').textContent = w ? 'Lv' + wTier(w) : F ? 'Lv' + F.lvl : '';
    el.querySelector('.dir').textContent = '';
    el.querySelector('.bar i').style.width = def ? '100%' : '0%';
  }
}

// ---------------------------------------------------------------- wraps
(function pfWrap() {
  modAdd = (orig => function (w, id) {
    const r = orig.apply(this, arguments);
    if (r && PF.on && (id === 'melee' || id === 'orbiting') && w && !w.isSpell && !w.pfAura) pfConvert(w, id);
    return r;
  })(modAdd);
  modOk = (orig => function (w, id) {
    if (PF.on && (id === 'melee' || id === 'orbiting') && w && !w.pfAura && !pfFree()) return false; // (one aura at a time)
    return orig.apply(this, arguments);
  })(modOk);
  if (typeof hcWeapon === 'function') hcWeapon = (orig => function (w, id, o) {
    let h = orig.apply(this, arguments);
    if (PF.on && (id === 'melee' || id === 'orbiting') && w && !w.pfAura) {
      const lost = pfLoses(w, id);
      h = h.replace(/<\/div>$/, `<p class="hcr">${esc(PF_TEXT.holdMoves)}</p>` + (lost.length ? `<p class="hcr">${esc(PF_TEXT.holdLoses)} ${lost.map(x => esc((MODS10[x] || {}).name || x)).join(', ')}</p>` : '') + '</div>');
    }
    return h;
  })(hcWeapon);
  if (typeof cardOpt === 'function') cardOpt = (orig => function (c) { const o = orig.apply(this, arguments); if (c && c.slot === 'pfeat') o.tag = (c.rank && c.rank(G)) ? 'FEAT UPGRADE' : 'NEW FEAT'; return o; })(cardOpt);
  if (typeof sbSlotMark === 'function') { const sm = sbSlotMark; sbSlotMark = function (el, w) { sm(el, w); if (w && w.pfAura && pfWeapon() === w) el.style.display = 'none'; }; }
  if (typeof comboBonds === 'function') { const cb = comboBonds; comboBonds = function () { const r = cb.apply(this, arguments); try { pfHud(); } catch (e) { /* (HUD only) */ } return r; }; }
  modDraw = (orig => function () {
    orig.apply(this, arguments);
    const F = pfFeat(); if (!F || !G) return;
    const p = G.player, P = G.pf, wide = 1 + (F.lvl >= 3 ? 0.15 : 0) + (F.lvl >= 5 ? 0.15 : 0);
    ctx.save();
    if (F.id === 'flame_cloak') { const R = PF.cloakR * wide; ctx.strokeStyle = col('#ff6a2a'); ctx.globalAlpha = 0.25 + 0.1 * Math.sin(G.realT * 9); ctx.lineWidth = 5 * S; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), R * S, 0, TAU); ctx.stroke(); }
    else for (const q of P.pearls || []) {
      if (q.back > G.t || q.x == null) continue;
      ctx.globalAlpha = 0.95; ctx.fillStyle = col('#eef7e6'); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 6 * S, 0, TAU); ctx.fill();
      ctx.strokeStyle = col(ELEMENTS.ice.color); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 0.8; ctx.fillStyle = col('#ffffff'); ctx.beginPath(); ctx.arc(sx(q.x) - 2 * S, sy(q.y) - 2 * S, 1.6 * S, 0, TAU); ctx.fill();
    }
    ctx.restore();
  })(modDraw);
})();
