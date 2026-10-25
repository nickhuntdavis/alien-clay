'use strict';
// Spawn Prawn - Switched at Birth in three levels (user request, 25 Oct; modcards.js sabSwitch, modmatrix.js sabCard).
//  - Level 1: the first card on a weapon switches it, but only SAB_TIER.share[0] (35%) of its attacks use the new damage type.
//  - Level 2: a second card on the same weapon: share[1] (70%).
//  - Level 3: a third card, then a fork screen (draft.js forkRegister/forkCards, the same "FORK" screen the Feats use):
//      (a) FULL: every attack uses the new damage type.
//      (b) BLEND: every attack uses the new damage type AND carries the original one. Each hit lands at blendMain (60%) as
//          the new type, plus an echo hit of the original type at blendEcho (60%) of the raw damage (hits land twice, so
//          both damage types' statuses and bars go on and an unstable reaction can pair them; total about 120%).
//    Chosen over "reliably trigger the pair's reaction" because the echo is an ordinary damageEnemy hit: the statuses,
//    bars, reaction triggers (fight.js, chem.js), colours and caps all stay in their one existing place.
//  - PER ATTACK: at levels 1 and 2 the weapon's def is swapped to the switched or the original one each time it fires
//    (fireWeapon wrap), so the shot's elem (weaponSrc), colour (spawnProj) and any weapon-specific switched effect
//    (cellmods.js w.def.sab) follow that attack. The def stays until the next attack (beams, zones and pools read it
//    while they run). w.sab holds the state; mmHeld/modOk count the Chemistry slot as held whatever the def is now.
//  - A weapon that started switched (samplestart.js) has no w.sab: it stays fully switched and is never ranked.
// Hooks: none in shared files. hookOn('dmgMul') and hookOn('proc') from this file. Wraps fireWeapon, sabCard, modDraftCands,
// mmHeld, modOk. Loads after cellmods4.js (the last file to wrap sabCard).

const SAB_TIER = { share: [0.35, 0.7], blendMain: 0.6, blendEcho: 0.6 };

const sabWeapons = () => (G && G.weapons || []).filter(w => w && !w.isSpell && w.def);
const sabUps = () => sabWeapons().filter(w => w.sab && w.sab.lv < 3);

// A fresh switch just applied: remember both defs. (w.def is the switched one; its prototype is the original.)
function sabInit(w) {
  if (!w.def.sab) return;
  w.sab = { lv: 1, mode: null, dN: w.def, dO: Object.getPrototypeOf(w.def) };
}
// Which def the weapon wears for its next attack. Returns false when something else replaced the def (then it is left alone).
function sabFace(w, wantNew) {
  const S = w.sab; if (!S) return false;
  if (w.def !== S.dN && w.def !== S.dO) { // (colour override or another file re-wrapped it: resync)
    if (w.def.sab) { S.dN = w.def; S.dO = Object.getPrototypeOf(w.def); } else return false;
  }
  const d = wantNew ? S.dN : S.dO;
  if (w.def !== d) { w.def = d; computeStats(w); }
  return true;
}
const sabShare = w => (w.sab.lv >= 3 ? 1 : SAB_TIER.share[w.sab.lv - 1]);
const sabOld = w => w.sab.dO.elem;

fireWeapon = (orig => function (w, target) {
  if (w && w.sab && !w.isSpell) sabFace(w, w.sab.lv >= 3 || Math.random() < sabShare(w));
  return orig.apply(this, arguments);
})(fireWeapon);

// The Chemistry slot stays taken (and Catalyst stays out) while the weapon wears its original def.
mmHeld = (orig => function (w) { const g = orig(w); if (w && w.sab) g.add('chemistry'); return g; })(mmHeld);
modOk = (orig => function (w, id) { if (w && w.sab && mmGroup(id) === 'chemistry') return false; return orig(w, id); })(modOk);

// ---------------------------------------------------------------- the cards
function sabRankCard(w) {
  const S = w.sab, n = S.lv + 1, E = ELEMENTS[S.dN.elem], O = ELEMENTS[S.dO.elem];
  return { card: 'switch', family: 'switch', rarity: n === 2 ? 2 : 3, tag: 'TYPE SWAP', icon: w.def.icon, color: (typeof V10_COL !== 'undefined' && V10_COL[S.dN.elem]) || E.color, elem: S.dN.elem,
    title: `${S.dO.name} → ${E.name} ${['', '', 'II', 'III'][n]}`, sub: `${O.name} > ${E.name} | Level ${S.lv} > ${n} of 3`,
    desc: 'TODO_COPY:sab_l' + n + '_desc',
    apply: () => {
      if (!G.weapons.includes(w) || !w.sab) return;
      S.lv = n; sabFace(w, true); // (the card ranks; the next attack rolls)
      if (n === 3) { // the fork: full or blend
        forkRegister('sab', 3, [
          { title: 'TODO_COPY:sab_l3a_name', desc: 'TODO_COPY:sab_l3a_desc', apply: () => { if (w.sab) { w.sab.mode = 'full'; sabFace(w, true); } } },
          { title: 'TODO_COPY:sab_l3b_name', desc: 'TODO_COPY:sab_l3b_desc', apply: () => { if (w.sab) { w.sab.mode = 'blend'; sabFace(w, true); } } },
        ]);
        G.lootQueue.unshift({ kind: 'fork', key: 'sab', lv: 3, w, v10ok: true });
      }
      computeStats(w); recomputeAll();
    } };
}

// One Switched at Birth card: either a rank-up for a weapon already switched or a new switch (the existing chain of wraps).
sabCard = (orig => function () {
  const ups = sabUps(), fresh = ups.length && Math.random() < 0.5 ? null : orig();
  if (!fresh) { if (ups.length) return sabRankCard(pick(ups)); return orig(); }
  const ap = fresh.apply;
  fresh.desc = 'TODO_COPY:sab_l1_desc';
  fresh.sub = fresh.sub.replace(/\|.*$/, '| Level 1 of 3');
  fresh.apply = function () { const r = ap.apply(this, arguments); for (const w of sabWeapons()) if (w.def.sab && !w.sab) sabInit(w); return r; };
  return fresh;
})(sabCard);

// A weapon already switched can be offered its next level even with no other weapon left to switch.
modDraftCands = (orig => function (kind) {
  const c = orig(kind);
  if (!c.some(x => x.fam === 'switch') && sabUps().length && !banished('switch') && G.sabAt !== G.draftN - 1) {
    const n = G.draftN;
    c.push({ o: () => { const k = sabCard(); G.sabAt = n; return k; }, w: 0.6 * famK('switch'), fam: 'switch' });
  }
  return c;
})(modDraftCands);

// ---------------------------------------------------------------- Blend (level 3, option b)
const sabBlend = src => !!(src && src.w && src.w.sab && src.w.sab.mode === 'blend');
hookOn('dmgMul', 'sabBlendMul', (e, src) => (sabBlend(src) && !src.sabEcho ? SAB_TIER.blendMain : 1));
hookOn('proc', 'sabBlendProc', (e, dmg, src) => {
  if (!sabBlend(src) || src.sabEcho || e.dead) return;
  damageEnemy(e, dmg * SAB_TIER.blendEcho, Object.assign({}, src, { elem: sabOld(src.w), elem2: undefined, sabEcho: true, noProc: true, noCrit: true, noArc: true }));
});
