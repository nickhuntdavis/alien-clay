'use strict';
// Spawn Prawn - MY OWN MESS: a targeting directive that aims one weapon at another's handiwork. Pick a weapon or
// Feat (or ANY MESS) and this one shoots whatever enemy is nearest that weapon's stuff on the slide: a black hole,
// a puddle, a lob still in the air (its landing spot), a pet, an orbit blade, a turret, a Feat's effect. ANY MESS
// takes your biggest thing in range that isn't this weapon's own. Nothing of it about: nearest, as usual.
// The chosen weapon is w.aimAt (its uid; 0 or unset = ANY MESS). Not saved: weapons are rebuilt each run.
// Works as the primary directive or as the tie-breaker (w.dir2, autorun.js).
// Hooks: game.js acquire/acquireMany -> aimOwnSet, targetScore case 'ownmess' -> aimOwnScore, autorun.js aimKey case
// 'ownmess' -> aimOwnKey, updateWeapon / updateSpellList / featTap -> AIMAT.w = w; ui.js armoury targeting and
// loadout.js target grid -> aimOwnPick / aimOwnBind.
const AIMAT = { w: null, pt: null };
DIRECTIVES.push({ id: 'ownmess', name: 'MY OWN MESS', short: 'MESS', desc: 'Whatever is nearest your own mess: a black hole, a puddle, a pet. You choose whose mess.' });

const aimOwner = o => o.w || (o.src && o.src.w) || null;
const aimTop = (w) => G.weapons.concat(G.spells).find(x => x && x.uid === w.aimAt) || null;

// Where the weapon being fired should aim: the best piece of the chosen weapon's stuff within reach.
function aimOwnAnchor(w, x, y, range) {
  const tw = w.aimAt ? aimTop(w) : null;
  if (w.aimAt && !tw) w.aimAt = 0; // (the chosen one was recycled: back to ANY MESS)
  let best = null, bv = -Infinity;
  const take = (o, ox, oy, r) => {
    const ow = aimOwner(o);
    if (!ow) return; // (enemy and level stuff has no weapon behind it)
    if (tw ? ow !== tw && !(ow.echo && ow.id === tw.id) : ow === w) return;
    const d = Math.hypot(ox - x, oy - y);
    if (d > range + r) return;
    const v = r * 4 - d; // biggest first, then nearest
    if (v > bv) { bv = v; best = { x: ox, y: oy }; }
  };
  for (const z of G.zones) if (z.life > 0) take(z, z.x, z.y, z.r || 20);
  for (const pr of G.proj) take(pr, pr.lob ? pr.tx : pr.x, pr.lob ? pr.ty : pr.y, pr.lob ? (pr.w.s && pr.w.s.area) || 40 : pr.r || 8);
  for (const t of G.turrets) take(t, t.x, t.y, 24);
  if (G.nf) for (const o of G.nf.fx) if (o.x != null) take(o, o.x, o.y, o.r || 30);
  for (const ow of tw ? [tw] : G.weapons.filter(q => q && q !== w)) {
    if (ow.pets) for (const q of ow.pets) take({ w: ow }, q.x, q.y, 12);
    for (let i = 0; ow.blades && i < ow.blades.length; i += 3) take({ w: ow }, ow.blades[i], ow.blades[i + 1], 14);
  }
  return best;
}
// From acquire/acquireMany (dir is 'ownmess', or a pair such as 'own>lowhp' or 'elite>own'): work out the aim point
// once, then score each enemy by how close it is to it. No mess about: 'ownmess' reads as 'nearest'.
function aimOwnSet(dir, x, y, range) {
  const w = AIMAT.w;
  AIMAT.pt = w && (w.dir === 'ownmess' || w.dir2 === 'ownmess' || (w.dirs && w.dirs.includes('ownmess'))) ? aimOwnAnchor(w, x, y, range) : null;
  return AIMAT.pt ? dir : dir.replace('ownmess', 'nearest');
}
function aimOwnScore(e, d2) {
  const pt = AIMAT.pt;
  return pt ? -((e.x - pt.x) ** 2 + (e.y - pt.y) ** 2) : -d2;
}
// The same as a tie-breaker key: 40-unit steps from the aim point, so near-equal enemies tie.
function aimOwnKey(e, d2) { const pt = AIMAT.pt; return -Math.floor((pt ? Math.hypot(e.x - pt.x, e.y - pt.y) : Math.sqrt(d2)) / 40); }

// ---------------------------------------------------------------- picking whose mess
function aimOwnPick(w, ...dirs) {
  if (!dirs.includes('ownmess')) return '';
  const all = G.weapons.concat(G.spells).filter(Boolean);
  const chip = (uid, label) => `<button class="chip ${(w.aimAt || 0) === uid ? 'sel' : ''}" data-aimat="${uid}" data-aimw="${w.uid}">${esc(label)}</button>`;
  return `<div class="chips aimown"><p class="hint">Whose mess:</p>${chip(0, 'ANY MESS')}${all.map(o => chip(o.uid, o.def.name.toUpperCase() + (o === w ? ' (ITSELF)' : ''))).join('')}</div>`;
}
function aimOwnBind(body, rerender) {
  body.querySelectorAll('[data-aimat]').forEach(b => b.addEventListener('click', () => {
    const w = G.weapons.concat(G.spells).find(x => x && x.uid === +b.dataset.aimw); if (!w) return;
    w.aimAt = +b.dataset.aimat; rerender();
  }));
}
