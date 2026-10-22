'use strict';
// Spawn Prawn - the eleven v9 samples back in the v10 Sample Rack (user request, 22 Oct 2026), mixed in after the v10
// ones (strains 10 to 20). Each keeps its v9 profile (genes.js PROFILES: trait, rank, starting ability SEQ_ABILITY,
// synergies, and twins.js / reborn.js / redtail.js behaviour), plus what a v10 sample has:
//  - a SAMPLES10 / S10_BY entry 'v9_<profile>' (types for the draft lean from its re-typed starters, starters from
//    v9arms.js, no Unique Feat), so the rack, Mode Select, s10Start and The Race's rescues work as for the others.
//  - Mode Select starts 's10_v9_<profile>'; the UI.startGame wrapper turns that into the v9 profile id (so G.genes.primary
//    is 'vanguard' and every v9 check still holds) and remembers the pick in META.v9pick. The profile carries .s10 (read
//    by samples10.js s10Of) only while it is the current pick, so a fresh save's default 'vanguard' stays as it was.
//  - Not rescued as kindred spirits (KIN.skip: no v10 body to draw); a v9 sample can rescue v10 ones.
//  - Rack picture: a pictogram instead of the drawn body (samplelooks.js has no v9 bodies; in a run they look as in v9).
// Copy: TODO_COPY:s9_origin and TODO_COPY:s9_family (Field Guide samples list); everything else is existing v9 text.
// Save data: META.v9pick (the v9 sample last picked). Hooks: none (wraps UI.startGame, genesStart and slPicStart).
// Off with window.V10_OFF. Loads after kindred.js, before dsheads.js.

const S9_IDS = ['vanguard', 'bruiser', 'nerd', 'eggseeker', 'stealth', 'pusher', 'acid', 'splicer', 'reborn', 'redtail', 'twins'];
const S9_NAME = Object.fromEntries(Object.entries(S10_TYPES).map(([n, t]) => [t, n])); // internal type -> sample type name
function s9Sync() { // tag only the current pick as a sample (samples10.js s10Of)
  for (const pid of S9_IDS) if (PROFILES[pid]) PROFILES[pid].s10 = META.v9pick === pid && META.profile === pid ? 'v9_' + pid : undefined;
}

(function () {
  if (typeof V10 === 'undefined' || !V10 || typeof SAMPLES10 === 'undefined' || typeof V9_IDS === 'undefined') return;
  for (const pid of S9_IDS) {
    const P = PROFILES[pid]; if (!P) continue;
    const id = 'v9_' + pid, base = (P.weapons || []).slice(0, 3);
    const weapons = base.map(w => 's_' + w).filter(w => WEAPONS[w] && W24_IDS.includes(w));
    const n = {}; for (const w of weapons) n[WEAPONS[w].v10type] = (n[WEAPONS[w].v10type] || 0) + 1;
    const order = weapons.map(w => WEAPONS[w].v10type).filter((t, i, a) => a.indexOf(t) === i).sort((a, b) => n[b] - n[a]);
    const types = [order[0] || 'phys', order[1] || order[0] || 'phys'].map(t => S9_NAME[t]);
    const L = (typeof SEQ_LOOK !== 'undefined' && SEQ_LOOK[pid]) || {};
    let pdesc = ''; try { pdesc = capFirst(P.fmt(1)) + '.'; } catch (e) { pdesc = ''; }
    const S = { id, name: P.name, origin: 'TODO_COPY:s9_origin', types, passive: P.trait, pdesc, line: L.quote || '', sci: '', unlock: null, v9: pid, weapons, strain: SAMPLES10.length + 1 };
    SAMPLES10.push(S); S10_BY[id] = S;
    if (typeof SL_FAMILY !== 'undefined') SL_FAMILY[id] = 'TODO_COPY:s9_family';
    if (typeof KIN !== 'undefined') KIN.skip.push(id);
  }
  s9Sync();
  const sg = UI.startGame;
  UI.startGame = function () {
    const m = /^s10_v9_(.+)$/.exec(META.profile || '');
    if (m && PROFILES[m[1]]) { META.profile = m[1]; META.v9pick = m[1]; saveMeta(); }
    s9Sync();
    return sg.apply(this, arguments);
  };
  const gs = genesStart; // (a picked v9 sample is open while S10_ALL is: genes.js profUnlocked would fall back to vanguard)
  genesStart = function () {
    const P = PROFILES[META.profile], u = P && P.s10 && S10_ALL ? P.unlock : null;
    if (u) delete P.unlock;
    try { return gs.apply(this, arguments); } finally { if (u) P.unlock = u; }
  };
  const sp = slPicStart;
  slPicStart = function () {
    document.querySelectorAll('canvas[data-slpic^="v9_"]').forEach(cv => {
      const d = document.createElement('div');
      d.style.cssText = `height:${cv.style.height || '96px'};display:flex;align-items:center;justify-content:center`;
      d.innerHTML = typeof pictoSVG === 'function' ? pictoSVG('swimmer') : '';
      cv.replaceWith(d);
    });
    return sp.apply(this, arguments);
  };
})();
