'use strict';
// Spawn Prawn - weapon fusion (user, 26 Oct; pairs 1 to 8 of the table in chat; replaces the v10 combos, combos10.js).
//  - Two weapons that make a listed pair, both at Lv 3 as the HUD shows it (wTier), offer a fusion card (loot kind
//    'wfuse', ahead of other boxes). Fusing merges them: the second (b) folds into the first (a) and leaves the HUD
//    (it still fires, keeps its own modifiers, and levels with a: w.wfIn), a weapon slot opens (G.weapons grows by one
//    empty mount, as the old combo mounts did) and the pair's fused power switches on. Declining asks again when the
//    first weapon next gains a level.
//  - The absorbed weapon is never offered modifiers of its own (modOk).
//  - Under v10 the old combos are retired: availableCombos is empty, promise cards no longer say what they fuse with,
//    and the weapon draft no longer swaps in combo partners (C10 and COMBOS are emptied for those calls). WF.on = false
//    brings them back (tests of the old combos).
//  - Fused powers (a + b):
//      zapbub    Unwanted Contact + Blowing Bubbles: a popped bubble arcs to up to 6 enemies within 150 (a's damage, Charges).
//      acidmess  Acid Spit + Hot Mess: an Acid Spit hit leaves a small burning patch (b's damage, 2 s; 6 at once).
//      sibshot   Standard Issue + Sister Cousin: a Standard Issue hit bursts into 2 homing siblings (b's damage, 50%).
//      peekegg   Peekaboo + Eggs: vanishing drops an egg where you were, for the crowd to grab.
//      hotcore   Family Ties + Hot Mess: each black hole burns what is in its core (radius 45, b's damage, Fire).
//      lardmine  Nappy Mines + Skill Issue: mine blasts launch enemies outward into their mates.
//      pinclock  Little Prick + One of These Days: needles start a 3 s countdown; at zero every Bleed stack on the
//                enemy goes off at once (plus 50% of b's damage a needle).
//      snotfire  Nocturnal Emission + Hot Mess: the puddles burn too (b's damage, Fire, twice a second).
//  Names and card text are TODO_COPY.
// Hooks: none in shared files. hookOn tick 'wfTick' and proc 'wfProc'; wraps v10Loot, draftTitle, availableCombos,
// wupForkCards, sbSlotMark (hides the absorbed weapon's HUD slot), modOk, bubblePop, peekFire,
// detonateMine. Loads after combos10.js, fusion.js, sandbox.js, modmatrix.js and moddead.js (right after moddead.js).
const WF = { on: !(typeof window !== 'undefined' && window.V10_OFF), tier: 3, mount: 1 };
const WF_LIST = [
  { id: 'zapbub', a: 's_tesla', b: 's_bubble' },
  { id: 'acidmess', a: 'v_fire_proj', b: 'v_flame_pool' },
  { id: 'sibshot', a: 'v_phys_proj', b: 's_seeker' },
  { id: 'peekegg', a: 's_peekaboo', b: 's_toothfairy' },
  { id: 'hotcore', a: 's_void', b: 'v_flame_pool' },
  { id: 'lardmine', a: 's_mines', b: 's_lard' },
  { id: 'pinclock', a: 'v_arcane_proj', b: 's_duedate' },
  { id: 'snotfire', a: 'v_ice_pool', b: 'v_flame_pool' },
];
const WF_BY = Object.fromEntries(WF_LIST.map(f => [f.id, f]));
const wfSlot = sid => (G && G.weapons.find(w => w && !w.isSpell && w.sid === sid)) || null;
const wfFree = w => w && !w.wfIn && !w.wfWith;
const wfTierOf = w => (typeof wTier === 'function' ? wTier(w) : w.lvl);
const wfOn = id => !!(G && G.wf && G.wf[id]);
const wfPair = id => { const F = G && G.wf && G.wf[id]; return F && F.a && F.b && G.weapons.includes(F.a) ? F : null; };
const wfLive = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
const wfSrc = (w, extra) => Object.assign(weaponSrc(w), { noProc: true, wupEcho: true }, extra || {});

// ---------------------------------------------------------------- offering and fusing
function wfReady() {
  const out = [];
  if (!WF.on || !G || !G.weapons) return out;
  for (const f of WF_LIST) {
    if (wfOn(f.id)) continue;
    const A = wfSlot(f.a), B = wfSlot(f.b);
    if (!wfFree(A) || !wfFree(B) || wfTierOf(A) < WF.tier || wfTierOf(B) < WF.tier) continue;
    out.push({ f, A, B });
  }
  return out;
}
function wfCheck() {
  if (!G || G.state !== 'play') return;
  const asked = G.wfAsked || (G.wfAsked = {});
  for (const { f, A } of wfReady()) {
    if (asked[f.id] != null && asked[f.id] >= A.lvl) continue;
    if (G.lootQueue.some(r => r.kind === 'wfuse' && r.id === f.id)) continue;
    asked[f.id] = A.lvl;
    G.lootQueue.unshift({ kind: 'wfuse', id: f.id, now: true });
  }
}
function wfFuse(f) {
  const A = wfSlot(f.a), B = wfSlot(f.b);
  if (!wfFree(A) || !wfFree(B)) return false;
  (G.wf || (G.wf = {}))[f.id] = { a: A, b: B };
  A.wfWith = B; B.wfIn = A;
  if (B.lvl < A.lvl) setWeaponLevel(B, A.lvl, B.lvl);
  if (WF.mount) G.weapons.push(null); // (the slot it frees: a new empty mount)
  const p = G.player; ring(p.x, p.y, 160, A.def.color, 0.6, 8); cam.shake = Math.min(12, cam.shake + 5); sfx('level');
  G.stats.merges = (G.stats.merges || 0) + 1;
  recomputeAll();
  if (WF.mount && !G.lootQueue.some(r => r.kind === 'slot')) G.lootQueue.push({ kind: 'slot' }); // (fill the new mount)
  return true;
}
function wfOpts(req) {
  const f = WF_BY[req.id], A = f && wfSlot(f.a), B = f && wfSlot(f.b);
  if (!f || !A || !B) return [{ title: 'TODO_COPY:wf_skip', tag: 'TODO_COPY:wf_tag', icon: '', color: '#cfe7ff', desc: '', rarity: 0, apply: () => {} }];
  return [
    { def: A.def, rarity: 4, tag: 'TODO_COPY:wf_tag', icon: A.def.icon, color: A.def.color, elem: A.def.elem, title: 'TODO_COPY:wf_' + f.id + '_name',
      sub: `${A.def.name} + ${B.def.name}`, desc: 'TODO_COPY:wf_' + f.id + '_desc', c10: true, wfuse: f.id, apply: () => wfFuse(f) },
    { rarity: 0, tag: 'TODO_COPY:wf_tag', icon: A.def.icon, color: '#9aa4b2', elem: A.def.elem, title: 'TODO_COPY:wf_skip', sub: '', desc: 'TODO_COPY:wf_skip_desc', apply: () => {} },
  ];
}

// ---------------------------------------------------------------- the fused powers
function wfProc(e, dmg, src) {
  const w = src && src.w; if (!w || !G || !G.wf || src.wupEcho) return;
  let F;
  if ((F = wfPair('acidmess')) && w === F.a && G.zones.filter(z => z.wfAcid).length < 6 && G.zones.length < 150) {
    const B = F.b, z = { x: e.x, y: e.y, r: 40, life: 2, max: 2, dps: B.s.dmg * 0.6, elem: 'flame', pull: 0, color: B.def.color, tick: 0, wfAcid: 1, src: wfSrc(B, { atk: 'pool', zoneHit: true, elem: 'flame' }) };
    G.zones.push(z);
  }
  if ((F = wfPair('sibshot')) && w === F.a && !(e.wfSibT > G.t)) {
    e.wfSibT = G.t + 0.3; const B = F.b;
    for (let i = 0; i < 2; i++) {
      const o = acquire('nearest', 260, e.x + rand(-30, 30), e.y + rand(-30, 30)), a = o && o !== e ? Math.atan2(o.y - e.y, o.x - e.x) : Math.random() * TAU;
      spawnProj(B, e.x, e.y, a + rand(-0.4, 0.4), wfSrc(B), { r: 4, speed: 330, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, life: 1.4, dmg: B.s.dmg * 0.5, pierce: 0, style: 'sperm', color: B.def.color, bounce: 0, homing: 6 });
    }
  }
  if ((F = wfPair('pinclock')) && w === F.a && !e.dead) {
    const C = e.wfClock || (e.wfClock = { end: G.t + 3, n: 0, F });
    C.n++;
  }
}
function wfTick(dt) {
  if (!G || G.state !== 'play') return;
  if (!(G.wfAt > G.t)) { G.wfAt = G.t + 0.25; wfCheck(); }
  if (!G.wf) return;
  for (const id in G.wf) { const F = G.wf[id]; if (F.b && F.a && F.b.lvl < F.a.lvl) setWeaponLevel(F.b, F.a.lvl, F.b.lvl); }
  let F;
  if ((F = wfPair('hotcore')) && !(G.wfCoreT > G.t)) {
    G.wfCoreT = G.t + 0.3;
    for (const pr of G.proj) if (pr.style === 'void' && !pr.dead && pr.w === F.a) {
      forNear(pr.x, pr.y, 45, e => { if (wfLive(e) && Math.hypot(e.x - pr.x, e.y - pr.y) < 45 + e.r) damageEnemy(e, F.b.s.dmg * 0.4, wfSrc(F.b, { atk: 'pool', elem: 'flame' })); });
      ring(pr.x, pr.y, 45, F.b.def.color, 0.2, 2);
    }
  }
  if ((F = wfPair('snotfire')) && !(G.wfSnotT > G.t)) {
    G.wfSnotT = G.t + 0.5;
    for (const z of G.zones) if (z.life > 0 && z.src && z.src.w === F.a) forNear(z.x, z.y, z.r, e => { if (wfLive(e) && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) damageEnemy(e, F.b.s.dmg * 0.3, wfSrc(F.b, { atk: 'pool', elem: 'flame' })); });
  }
  if (wfPair('pinclock')) for (const e of G.enemies) { // One of These Days: at zero, every Bleed stack goes off at once
    const C = e.wfClock; if (!C || C.end > G.t) continue;
    e.wfClock = null; if (!wfLive(e)) continue;
    const left = (e.bleeds || []).reduce((a, b) => a + b.dps * b.t, 0); e.bleeds = [];
    damageEnemy(e, left + C.F.b.s.dmg * 0.5 * C.n, wfSrc(C.F.b, { elem: 'arcane' }));
    ring(e.x, e.y, e.r + 20, C.F.b.def.color, 0.35, 4);
  }
}
hookOn('tick', 'wfTick', dt => wfTick(dt));
hookOn('proc', 'wfProc', (e, dmg, src) => wfProc(e, dmg, src));

(function wfWrap() {
  if (typeof bubblePop === 'function') { const bp = bubblePop; bubblePop = function (b, throwA, fling) {
    const was = b && !b.dead, F = wfPair('zapbub');
    const r = bp.apply(this, arguments);
    if (was && F && b.w === F.b) {
      let n = 0; forNear(b.x, b.y, 150, e => { if (n < 6 && wfLive(e)) { n++; bolt(b.x, b.y, e.x, e.y, F.a.def.color, 0.15); damageEnemy(e, F.a.s.dmg * 0.8, wfSrc(F.a, { elem: 'shock' })); if (!e.dead) e.chargeT = Math.max(e.chargeT || 0, G.t + 3); } });
    }
    return r;
  }; }
  if (typeof peekFire === 'function') { const pf = peekFire; peekFire = function (w) {
    const r = pf.apply(this, arguments), F = wfPair('peekegg');
    if (F && w === F.a && !w.echo && G.peek && G.peek.w === w && typeof toothFire === 'function') toothFire(F.b, { x: G.peek.x, y: G.peek.y });
    return r;
  }; }
  if (typeof detonateMine === 'function') { const dm = detonateMine; detonateMine = function (pr) {
    const F = wfPair('lardmine'), x = pr && pr.x, y = pr && pr.y, mine = F && pr && pr.w === F.a;
    const r = dm.apply(this, arguments);
    if (mine) { forNear(x, y, 110, e => { if (wfLive(e) && !e.boss) shove(e, x, y, 420); }); ring(x, y, 110, F.b.def.color, 0.3, 4); }
    return r;
  }; }
  // The absorbed weapon: off the HUD, no cards of its own.
  if (typeof sbSlotMark === 'function') { const sm = sbSlotMark; sbSlotMark = function (el, w) { sm(el, w); if (w && w.wfIn && G && G.weapons.includes(w.wfIn)) el.style.display = 'none'; }; }
  if (typeof modOk === 'function') { const mo = modOk; modOk = function (w, id) { if (w && w.wfIn) return false; return mo.apply(this, arguments); }; }
  // Retire the v10 combos.
  if (typeof availableCombos === 'function') { const ac = availableCombos; availableCombos = function () { return WF.on ? [] : ac.apply(this, arguments); }; }
  const without = (fn, self, args) => { // (run fn with the combo tables empty)
    const c10 = typeof C10 !== 'undefined' ? C10.splice(0) : [], cs = typeof COMBOS !== 'undefined' ? COMBOS.splice(0) : [];
    try { return fn.apply(self, args); } finally { if (c10.length) C10.push(...c10); if (cs.length) COMBOS.push(...cs); }
  };
  if (typeof wupForkCards === 'function') { const wf = wupForkCards; wupForkCards = function () { return WF.on ? without(wf, this, arguments) : wf.apply(this, arguments); }; }
  const vl = v10Loot;
  v10Loot = function (req) {
    if (req && req.kind === 'wfuse') return wfOpts(req);
    return WF.on && req && req.kind === 'slot' ? without(vl, this, arguments) : vl.apply(this, arguments);
  };
  if (typeof draftTitle === 'function') { const dt = draftTitle; draftTitle = function (req) { return req && req.kind === 'wfuse' ? ['TODO_COPY:wf_title', 'TODO_COPY:wf_title_sub'] : dt.apply(this, arguments); }; }
})();
