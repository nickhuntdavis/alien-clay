'use strict';
// Spawn Prawn - one damage type per sample, and weapon pools by type (user decision).
//  - Each sample is a specialist of ONE damage type (TP_TYPE; internal ids phys, fire, shock, ice, arcane, soul, flame).
//    Baseline Force, Alpha Static, Beta Blood, Ordered Online Mucus, Redtail Fire, Prawn Again Parasite, the Acrobat
//    Acid. Not of This World ('*') drafts from every pool and keeps its three shifting display types.
//  - Private Schooled is ON HOLD: taken off SAMPLES10 (no screen lists it); S10_BY.private, its profile and its
//    weapons stay, and its weapons live on in their type pools.
//  - A type's pool is every live weapon (weapons24.js w24Live, so W24_HOLD and matrixonly.js count) of that type.
//  - THE OPENING DRAFT: the sample's signature weapon (TP_SIG) plus two random others from its pool, in a random order.
//    Alien: its signature plus two from all live weapons. S10_BY[id].weapons, PROFILES['s10_<id>'].weapons, SAMPLE_KIT
//    and the W24 starter column are set to [signature, ...rest of the pool] (Field Guide, rescues).
//  - THE RUN POOL: G.tp = { types: [...] } is set at run start (alien ['*']); every weapon draft offers only weapons
//    whose type is in it (tpOk; in The Race this replaces kindred.js's sample-ownership gate). A weapon you hold always passes, and when every weapon of the allowed types is held
//    the rest open up rather than dealing an empty draft (as kindred.js does).
// API (plain globals): TP_TYPE, TP_SIG, tpPool(type), tpRunTypes(), tpAdd(type), tpOk(id), tpOf(sampleId).
// Hooks: none in shared files. Wraps samplekit.js s10Start (its deal is replaced) and kindred.js kinPool (sigweap.js
// v10Pool filters through it). Loads after samplekit.js. Save data: none.

const TP_TYPE = { baseline: 'phys', alpha: 'shock', beta: 'arcane', ordered: 'ice', redtail: 'flame', prawn: 'soul', acro: 'fire', alien: '*' };
const TP_SIG = { baseline: 'v_phys_proj', alpha: 'v_shock_beam', beta: 'v_arcane_proj', ordered: 's_bubble', redtail: 'v_flame_pool', prawn: 's_parasite', acro: 'acro_cap', alien: 's_void' };
// The single display name each specialist shows (samples10.js S10_TYPES names). Alien keeps its three.
const TP_DISPLAY = { baseline: ['force'], alpha: ['static'], beta: ['blood'], ordered: ['mucus'], redtail: ['fire'], prawn: ['soul'], acro: ['acid'] };

const tpOf = sampleId => TP_TYPE[sampleId] || '*'; // (a sample with no entry, such as a v9 one, is unrestricted)
function tpPool(type) {
  const live = typeof w24Live === 'function' ? w24Live() : [];
  return !type || type === '*' ? live : live.filter(id => W24_BY[id] && W24_BY[id].type === type);
}

// Private Schooled off the rack (on hold). Its S10_BY entry and profile stay.
{
  const i = typeof SAMPLES10 !== 'undefined' ? SAMPLES10.findIndex(s => s.id === 'private') : -1;
  if (i >= 0) SAMPLES10.splice(i, 1);
}

// One type per sample: display types, weapon lists, the W24 starter column.
{
  const owner = {};
  for (const sid of Object.keys(TP_TYPE)) {
    const s = typeof S10_BY !== 'undefined' && S10_BY[sid]; if (!s) continue;
    if (TP_DISPLAY[sid]) s.types = TP_DISPLAY[sid].slice();
    const sig = TP_SIG[sid];
    // (Alien keeps its three-weapon kit: "every pool" is not a list for the Field Guide or a rescue card.)
    const kit = TP_TYPE[sid] === '*' ? (typeof SAMPLE_KIT !== 'undefined' && SAMPLE_KIT[sid] || [sig]).filter(id => id !== sig) : tpPool(TP_TYPE[sid]).filter(id => id !== sig);
    const list = [sig, ...kit].filter(id => typeof WEAPONS !== 'undefined' && WEAPONS[id]);
    s.weapons = list.slice();
    if (typeof PROFILES !== 'undefined' && PROFILES['s10_' + sid]) PROFILES['s10_' + sid].weapons = s.weapons;
    if (typeof SAMPLE_KIT !== 'undefined') SAMPLE_KIT[sid] = list.slice();
    if (TP_TYPE[sid] !== '*') for (const id of list) if (!owner[id]) owner[id] = sid;
  }
  if (typeof W24 !== 'undefined') for (const r of W24) {
    if (owner[r[0]]) r[4] = owner[r[0]];
    else if (r[4] && TP_TYPE[r[4]] && r[4] !== 'private') r[4] = ''; // (no longer anyone's starter)
    if (W24_BY && W24_BY[r[0]]) W24_BY[r[0]].starter = r[4];
  }
}

// ---------------------------------------------------------------- the run pool
function tpInit(sampleId) {
  if (!G) return null;
  const sid = sampleId || (typeof s10Of === 'function' && s10Of()) || null;
  if (!sid && !(G.genes && G.genes.primary)) return null; // (the run has no profile yet: ask again later)
  if (!G.tp || G.tp.sid !== (sid || null)) G.tp = { types: [tpOf(sid)], sid: sid || null };
  return G.tp;
}
const tpRunTypes = () => (typeof G !== 'undefined' && G && (G.tp || tpInit()) ? G.tp.types : []);
function tpAdd(type) {
  if (typeof G === 'undefined' || !G || !type) return;
  const t = G.tp || tpInit(); if (!t) return;
  if (!t.types.includes(type)) t.types.push(type);
}
function tpOk(id) {
  if (typeof G === 'undefined' || !G) return true;
  if (typeof sbOn === 'function' && sbOn()) return true; // (Sandbox: every weapon)
  const types = tpRunTypes();
  if (!types.length || types.includes('*')) return true;
  const row = W24_BY[id]; if (!row) return true; // (not a roster weapon: not ours to filter)
  if (types.includes(row.type)) return true;
  const held = x => G.weapons.some(w => w && (w.sid || w.id) === x);
  if (held(id)) return true;
  // Every weapon of the allowed types is already held: open the rest rather than deal an empty draft.
  const allowed = types.flatMap(t => tpPool(t));
  return allowed.every(held);
}
// A sample run's pool is its type pool (and whatever tpAdd opened): in The Race that replaces kindred.js's "your and
// absorbed samples' weapons" gate, which would otherwise hide a type added by a rescue. A run with no sample keeps the old gate.
kinPool = (orig => function (id) { return typeof G !== 'undefined' && G && (G.tp || tpInit()) && G.tp.sid ? tpOk(id) : orig(id) && tpOk(id); })(kinPool);

// ---------------------------------------------------------------- the opening draft
s10Start = (orig => function () {
  const r = orig(), sid = typeof s10Of === 'function' && s10Of();
  if (!sid || !TP_TYPE[sid] || !S10_BY[sid]) return r; // (v9 samples keep the deal they had)
  tpInit(sid);
  const type = TP_TYPE[sid], sig = TP_SIG[sid], live = tpPool(type);
  const rest = shuffle(live.filter(id => id !== sig && WEAPONS[id])).slice(0, 2);
  const ids = [live.includes(sig) && WEAPONS[sig] ? sig : null, ...rest].filter(Boolean);
  return ids.length ? shuffle(ids).map(id => optNewWeapon(id, 0)) : r;
})(s10Start);
