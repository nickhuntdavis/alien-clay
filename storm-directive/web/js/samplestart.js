'use strict';
// Spawn Prawn - how a sample is unlocked and what it starts with (user, 23 Oct).
//  - UNLOCKS: Baseline is open; every other sample unlocks the first time you earn its achievement (S10_ACH), in any run.
//    Achievements are now remembered between runs (META.achEver). Rescues in The Race (kindred.js) no longer unlock
//    samples. Developer mode (META.devAll) still opens everything.
//  - STARTING OFFER: three random weapons from the matrix's 27 (matrixonly.js), not the sample's fixed three:
//      1. one whose own damage type is one of the sample's types (its first type when it can);
//      2. one that has had Switched at Birth into one of the sample's types (modmatrix.js MM_SAB first; any weapon that
//         can be switched when none fits); the card shows the new type, and the weapon starts switched;
//      3. any other weapon.
//    The offers come in a random order.
// Hooks: none in shared files. Wraps samples10.js s10Start and s10Unlock; show.js achieve. samples10.js reads s10LockTxt
// (the locked card's line). Save data: META.achEver { id: 1 }. Loads after matrixonly.js.

const S10_ACH = { alpha: 'survive5', beta: 'lowhp', private: 'boss', ordered: 'kills1000', redtail: 'survive10', prawn: 'wave5', alien: 'born', acro: 'flawless' };
S10_ALL = false;
for (const s of SAMPLES10) s.unlock = S10_ACH[s.id] ? { txt: 'Earn the achievement ' + ACHIEVEMENTS[S10_ACH[s.id]].name + ': ' + ACHIEVEMENTS[S10_ACH[s.id]].desc, ach: S10_ACH[s.id], secret: s.unlock && s.unlock.secret } : null;
const s10LockTxt = s => 'LOCKED. ' + (s.unlock ? s.unlock.txt : '');

let S10_ACH_UNLOCK = false; // (only an achievement unlocks a sample now)
s10Unlock = (orig => function (id) { if (S10_ACH_UNLOCK) return orig(id); })(s10Unlock);
achieve = (orig => function (id) {
  const first = G && !(G.show && G.show.achieved && G.show.achieved[id]);
  orig(id);
  if (!first || !ACHIEVEMENTS[id]) return;
  if (!(META.achEver && META.achEver[id])) { (META.achEver || (META.achEver = {}))[id] = 1; saveMeta(); }
  for (const sid in S10_ACH) if (S10_ACH[sid] === id) { S10_ACH_UNLOCK = true; try { s10Unlock(sid); } finally { S10_ACH_UNLOCK = false; } }
})(achieve);
// Achievements earned before this build open their samples on load.
for (const sid in S10_ACH) if (META.achEver && META.achEver[S10_ACH[sid]] && !(META.s10 && META.s10[sid])) (META.s10 || (META.s10 = {}))[sid] = 1;

// ---------------------------------------------------------------- the starting offer
function s10Pool() {
  const ids = typeof MATRIX_ONLY !== 'undefined' ? MATRIX_ONLY.weapons : Object.keys(WEAPONS);
  return ids.filter(id => WEAPONS[id] && !(typeof W24_HOLD !== 'undefined' && W24_HOLD.includes(id)) && WEAPONS[id].elem);
}
const s10Shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function s10Offer(s) {
  const types = s.types.map(t => S10_TYPES[t]), pool = s10Shuffle(s10Pool()), used = new Set(), out = [];
  const take = id => { used.add(id); return id; };
  // 1. naturally the sample's type (its first type when it can)
  const nat = pool.find(id => WEAPONS[id].elem === types[0]) || pool.find(id => types.includes(WEAPONS[id].elem));
  if (nat) out.push(optNewWeapon(take(nat), 0));
  // 2. Switched at Birth into one of its types
  let sw = pool.find(id => !used.has(id) && typeof MM_SAB !== 'undefined' && types.includes(MM_SAB[id]) && !types.includes(WEAPONS[id].elem));
  let to = sw && MM_SAB[sw];
  if (!sw) { sw = pool.find(id => !used.has(id) && typeof MM_SAB !== 'undefined' && MM_SAB[id] && !types.includes(WEAPONS[id].elem)); to = types[0]; }
  if (sw) out.push(s10SabOpt(take(sw), to));
  // 3. any other
  const any = pool.find(id => !used.has(id));
  if (any) out.push(optNewWeapon(take(any), 0));
  return s10Shuffle(out);
}
// A starting card for a weapon that comes already switched to type t (internal id).
function s10SabOpt(id, t) {
  const o = optNewWeapon(id, 0), base = o.def, E = ELEMENTS[t], col = (typeof V10_COL !== 'undefined' && V10_COL[t]) || E.color, ap = o.apply;
  o.def = Object.create(base, { elem: { value: t, enumerable: true }, v10type: { value: t, enumerable: true }, color: { value: col, writable: true, enumerable: true } });
  o.elem = t; o.color = col; o.sab = t;
  o.sub = `${ELEMENTS[base.elem].name} > ${E.name} (Switched at Birth) | Lv 1`;
  o.desc = `Starts Switched at Birth: deals ${E.name} damage. ` + o.desc;
  o.apply = () => { const before = G.weapons.slice(); ap(); const w = G.weapons.find((x, i) => x && x !== before[i]); if (w && typeof sabSwitch === 'function') sabSwitch(w, t); };
  return o;
}
s10Start = (orig => function () {
  const r = orig(); if (!r) return r;
  const s = S10_BY[s10Of()];
  const o = s && s10Offer(s);
  return o && o.length ? o : r;
})(s10Start);
