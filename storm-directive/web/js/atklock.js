'use strict';
// Spawn Prawn - attack types are a branch, not a swap (user, 27 Oct). Melee, Ranged, Mines and Orbiting each change
// how a weapon attacks:
//  - LOCKED: once a weapon holds one, no other attack type is offered on it again (replaces atkswap.js's switch card).
//  - DECLINED: an attack-type card shown on a reward screen and not taken (picked something else, rerolled, skipped)
//    is never offered again this run, on any weapon (G.atkNo).
//  - CONFIRM: tapping a card that gives a weapon its first attack type asks once more (ATL_COPY, TODO_COPY:atk_lock_*).
//    Only a fresh tap asks; autorun's picks, tests and sims go straight through.
// The Sandbox and no-limits play (mmFree) keep the free swap.
// Hooks: none in shared files. Wraps modOk, genLoot, UI.renderLootCards, UI.renderDraft, UI.pickLoot; hookOn('tick').
// Loads last (after wmods.js and modpick.js, so it wraps outermost).

const ATL = { ids: ['melee', 'ranged', 'mines', 'orbiting'], pend: new Set(), took: new Set(), req: null, arr: null, ask: null };
const ATL_COPY = {}; // (the user writes these: atk_lock_title, atk_lock_body, atk_lock_yes, atk_lock_no; {attack} and {weapon} are filled in)
const atlT = id => ATL_COPY[id] || 'TODO_COPY:' + id;
const atlOn = () => !!G && !(typeof mmFree === 'function' && mmFree());
const atlId = o => { const f = (o && (o.family || o.fam)) || ''; return f.startsWith('mod:') && ATL.ids.includes(f.slice(4)) ? f.slice(4) : null; };
function atlWeapons(o, wuid) { // the weapon(s) the card could land on
  const live = (G && G.weapons || []).filter(Boolean);
  if (wuid != null) return live.filter(w => w.uid === wuid);
  if (o.pickW && o.pickW.length) return live.filter(w => o.pickW.some(p => p.uid === w.uid));
  if (o.atkW) return [o.atkW];
  return live;
}
// A card that would give a weapon an attack type it does not hold yet (rank-ups and masteries are not a choice of branch).
function atlNew(o, wuid) { const id = atlId(o); return !!id && atlWeapons(o, wuid).some(w => !modHas(w, id)); }

modOk = (orig => function (w, id) {
  if (w && ATL.ids.includes(id) && atlOn() && !modHas(w, id)) {
    if (G.atkNo && G.atkNo.includes(id)) return false;
    if ((w.m10 || []).some(x => x !== id && ATL.ids.includes(x))) return false;
  }
  return orig(w, id);
})(modOk);

// ---------------------------------------------------------------- declines
function atlCommit() {
  if (G && ATL.pend.size) { G.atkNo = G.atkNo || []; for (const id of ATL.pend) if (!ATL.took.has(id) && !G.atkNo.includes(id)) G.atkNo.push(id); }
  ATL.pend.clear(); ATL.took.clear(); ATL.req = null; ATL.arr = null;
}
// The recorded screen is over once another opens or play resumes.
function atlCheck() { if (ATL.req && (!G || UI.lootReq !== ATL.req || G.state === 'play')) atlCommit(); }
function atlSeen() {
  if (!atlOn() || G.state !== 'loot' || !UI.lootOpts) return;
  atlCheck();
  const opts = UI.lootOpts.filter(Boolean);
  if (ATL.req === UI.lootReq && ATL.arr !== UI.lootOpts) { // a reroll: what left the screen untaken is declined
    const still = new Set(opts.map(atlId));
    for (const id of ATL.pend) if (!still.has(id) && !ATL.took.has(id)) { G.atkNo = G.atkNo || []; if (!G.atkNo.includes(id)) G.atkNo.push(id); ATL.pend.delete(id); }
  }
  ATL.req = UI.lootReq; ATL.arr = UI.lootOpts;
  for (const o of opts) if (atlNew(o)) { ATL.pend.add(atlId(o)); o.warn = true; }
}
genLoot = (orig => function () { atlCheck(); return orig.apply(this, arguments); })(genLoot);
UI.renderLootCards = (orig => function () { atlSeen(); orig.apply(this, arguments); })(UI.renderLootCards); // (first, so lootfilter.js sees o.warn)
UI.renderDraft = (orig => function () { atlSeen(); orig.apply(this, arguments); })(UI.renderDraft);
hookOn('tick', 'atklock:check', () => atlCheck());

// ---------------------------------------------------------------- the confirm
UI.pickLoot = (orig => function (i, wuid) {
  const o = UI.lootOpts && UI.lootOpts[i];
  if (o && !o.taken && atlOn() && atlNew(o, wuid) && atlFresh() && ATL.ask !== o) { atlAsk(o, () => { ATL.ask = o; UI.pickLoot(i, wuid); }, wuid); return; }
  ATL.ask = null;
  const id = atlId(o); if (id) ATL.took.add(id);
  orig.apply(this, arguments);
  if (!G || G.state !== 'loot') atlCommit();
})(UI.pickLoot);
function atlFresh() { const d = performance.now() - (UI.lastDown || 0); return d >= 0 && d < 600; } // (a real tap just now; tests that fake one set lastDown ahead)
function atlAsk(o, yes, wuid) {
  const old = document.getElementById('atlAsk'); if (old) old.remove();
  const w = atlWeapons(o, wuid).find(x => !modHas(x, atlId(o))), fill = s => esc(s.replace('{attack}', MODS10[atlId(o)].name).replace('{weapon}', w ? w.def.name : ''));
  const d = document.createElement('div');
  d.id = 'atlAsk';
  d.innerHTML = `<div class="atlBox"><h3>${fill(atlT('atk_lock_title'))}</h3><p>${fill(atlT('atk_lock_body'))}</p>`
    + uiButton(fill(atlT('atk_lock_yes')), { cls: 'primary', attrs: 'data-atl="yes"' }) + uiButton(fill(atlT('atk_lock_no')), { attrs: 'data-atl="no"' }) + '</div>';
  for (const ev of ['pointerdown', 'touchstart', 'mousedown']) d.addEventListener(ev, e => e.stopPropagation());
  d.addEventListener('click', e => {
    const b = e.target.closest('[data-atl]'); if (!b) return;
    d.remove();
    if (b.dataset.atl === 'yes' && G && G.state === 'loot') yes();
  });
  document.body.appendChild(d);
}
{
  const st = document.createElement('style');
  st.textContent = '#atlAsk{position:fixed;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px}'
    + '#atlAsk .atlBox{max-width:340px;width:100%;background:var(--color-bg-sheet);color:var(--color-text-primary);border:2px solid var(--line);border-radius:10px;padding:14px;text-align:center;overflow-wrap:anywhere}'
    + '#atlAsk h3{margin:0 0 8px}#atlAsk p{margin:0 0 6px;font:500 14px/1.35 sans-serif}';
  document.head.appendChild(st);
}
