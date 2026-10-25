'use strict';
// Spawn Prawn - the event hub. The core (game.js) announces a moment once ("an enemy died", "you were hurt", "a frame
// passed") and every feature that cares has registered for it, so a new feature adds one hookOn line in its OWN file
// instead of a call in game.js (where every branch used to collide).
//  - hookOn(ev, name, fn, order): register. `order` sorts the listeners (lower runs first; ties keep load order);
//    leave it out to run after everything below (HOOK_LAST). `name` labels errors and makes the list readable.
//  - Listeners are called with the event's own arguments (table below). Wrap the call in a closure,
//    (e, src) => myKill(e, src), so a later file that replaces myKill (the wrap-and-replace pattern) still gets called.
//  - Errors are NOT swallowed (tests catch them as page errors), except on 'tick', whose listeners run through safely()
//    as they always have.
// Events (where they fire, arguments):
//   kill:early  game.js killEnemy, just after e.dead, before the kill counts         (e, src)
//   kill        game.js killEnemy, after the kill counts, before drops and loot      (e, src)
//   dmgMul      game.js damageEnemy, a multiplier on one hit (hookMul: return 1 for no change)   (e, src)
//   proc        game.js damageEnemy, a weapon hit landed (src.w, not a DoT, not noProc)  (e, dmg, src, d)  dmg: raw, d: dealt
//   hit:late    game.js damageEnemy, after statuses and arcs, before the kill check  (e, d, src, crit, hp0)
//   hurtMul     game.js hurtPlayer, a multiplier on damage you take (hookMul)       (ent, kind, from)
//   hurt        game.js hurtPlayer, just after you lose HP                           (d, ent, hf)
//   hurt:late   game.js hurtPlayer, after the hit's feedback, before the death check (d, ent, hf)
//   fire        game.js fireWeapon, first listener to return true takes the shot (hookFirst)   (w, target, src)
//   tick        game.js update, each frame, between the weapons and the projectiles (hookSafe)   (dt)
// Hooks: game.js killEnemy, damageEnemy, hurtPlayer, fireWeapon and update call hookRun / hookMul / hookFirst / hookSafe.
// Loads after icons.js, before game.js (feature files register at load time).

const HOOKS = {};
const HOOK_LAST = 1000; // (the default order: after every wired-in listener below)
function hookOn(ev, name, fn, order) {
  const L = HOOKS[ev] || (HOOKS[ev] = []), h = { name, fn, order: order == null ? HOOK_LAST : order };
  let i = L.length;
  while (i > 0 && L[i - 1].order > h.order) i--;
  L.splice(i, 0, h);
}
function hookRun(ev, a, b, c, d, e) { const L = HOOKS[ev]; if (L) for (const h of L) h.fn(a, b, c, d, e); }
function hookMul(ev, a, b, c) { const L = HOOKS[ev]; let k = 1; if (L) for (const h of L) k *= h.fn(a, b, c); return k; }
function hookFirst(ev, a, b, c) { const L = HOOKS[ev]; if (L) for (const h of L) if (h.fn(a, b, c)) return true; return false; }
function hookSafe(ev, a) { const L = HOOKS[ev]; if (L) for (const h of L) safely(h.name, () => h.fn(a)); }

// ---------------------------------------------------------------- the wiring that used to be written out in game.js
// Moved here in its old call order (v10.125). New features register from their own file, not here.
[
  ['fightDeath', (e, src) => fightDeath(e, src)], // (a Charged enemy discharges: fight.js)
  ['mutKill', (e, src) => mutKill(e, src)], // (mutation cards: mutations.js)
  ['mdKill', e => { if (typeof mdKill === 'function') mdKill(e); }], // (elites drop mutations: mutdrop.js, branchback.js)
  ['wupKill', (e, src) => wupKill(e, src)], // (weapon branches: weapons24.js)
  ['f10Kill', (e, src) => f10Kill(e, src)], // (v10 Feats that watch kills: feats10.js)
  ['nf10Kill', (e, src) => nf10Kill(e, src)], // (Mosquito refund and blood pool, Smouldering: newfoes.js)
  ['dummyBurst', e => { if (e.dummy) dummyBurst(e); }], // (Dummy Spit: game.js)
  ['nfKill', (e, src) => { if (G.nf) nfKill(e, src); }], // (Hostile Environment grows: newfeats.js)
].forEach(([n, f], i) => hookOn('kill:early', n, f, i * 10));
[
  ['onShowKill', (e, src) => onShowKill(e, src)], // (show.js)
  ['sigKill', (e, src) => sigKill(e, src)],
  ['foeKill', (e, src) => foeKill(e, src)],
  ['puKill', e => puKill(e)],
  ['sillyKill', (e, src) => sillyKill(e, src)],
  ['pair2Kill', (e, src) => pair2Kill(e, src)],
  ['chemKill', (e, src) => chemKill(e, src)],
  ['toyKill', (e, src) => toyKill(e, src)],
  ['genesKill', (e, src) => genesKill(e, src)],
  ['junkKill', (e, src) => junkKill(e, src)], // (junk DNA: junk.js)
  ['heatKill', e => heatKill(e)], // (prestige.js)
  ['relicKill', (e, src) => relicKill(e, src)], // (bosses.js)
  ['eventKill', e => eventKill(e)], // (events.js)
  ['boonKill', () => boonKill()],
].forEach(([n, f], i) => hookOn('kill', n, f, i * 10));
[
  ['sigDamageMul', (e, src) => sigDamageMul(e, src)],
  ['toyDamageMul', e => toyDamageMul(e)],
  ['genesDamageMul', (e, src) => genesDamageMul(e, src)],
  ['junkDmgMul', (e, src) => junkDmgMul(e, src)],
  ['comboDamageMul', (e, src) => comboDamageMul(e, src)],
  ['pair2Mul', (e, src) => pair2Mul(e, src)],
  ['chemMul', (e, src) => chemMul(e, src)],
  ['twistMul', (e, src) => twistMul(e, src)],
  ['sillyModMul', (e, src) => src.w && src.w.mods && src.w.mods.length ? sillyModMul(e, src) : 1], // (silly.js modifiers)
  ['rrelicDmgMul', (e, src) => src.w ? rrelicDmgMul(e, src) * redDmgMul() : 1], // (rival relics, rrelics.js; Keeping It in the Family, redtail.js)
].forEach(([n, f], i) => hookOn('dmgMul', n, f, i * 10));
[
  ['modProcs', (e, dmg, src) => modProcs(e, dmg, src)], // (arsenal.js)
  ['perkProcs', (e, dmg, src) => { if (src.w.s) perkProcs(e, dmg, src); }], // (arsenal.js)
  ['sigHit', (e, dmg, src) => sigHit(e, dmg, src)],
  ['comboHit', (e, dmg, src) => comboHit(e, dmg, src)],
  ['pair2Hit', (e, dmg, src) => pair2Hit(e, dmg, src)],
  ['puHit', (e, dmg, src, d) => puHit(e, d, src)],
].forEach(([n, f], i) => hookOn('proc', n, f, i * 10));
[
  ['toyHurt', (e, d, src, crit, hp0) => { if (G.toy) toyHurt(e, Math.min(d, Math.max(0, hp0)), src); }], // Due Date keeps count; Red Tape shares it
  ['nfDamaged', (e, d, src, crit, hp0) => { if (G.nf && d > 0) nfDamaged(e, Math.min(d, Math.max(0, hp0)), src); }], // (Shared Placenta, Brown Fat, Fecal Transplant: newfeats.js)
  ['genesHit', (e, d, src, crit) => { if (src.w) genesHit(e, d, src, crit); }],
  ['junkHit', (e, d, src) => { if (src.w) junkHit(e, d, src); }],
].forEach(([n, f], i) => hookOn('hit:late', n, f, i * 10));
[
  ['foes2HurtMul', ent => foes2HurtMul(ent)], // (marked by a Complement Protein: foes2.js)
  ['f10HurtMul', () => f10HurtMul()], // (Survivor's Guilt: feats10.js)
  ['puHurt', () => puHurt()],
  ['seqFeatHurt', () => seqFeatHurt()], // (Personal Space: seqfeats.js)
  ['nfHurtMul', (ent, kind, from) => nfHurtMul(ent, kind, from)],
].forEach(([n, f], i) => hookOn('hurtMul', n, f, i * 10));
[
  ['tantrumHurt', d => tantrumHurt(d)],
  ['seqHurt', () => seqHurt()], // (a clean boss fight: seqlock.js)
  ['sillyHurt', () => sillyHurt()], // (Trash Talk)
  ['redHurt', () => redHurt()], // (the Redtail's Sister-Cousin)
  ['mutHurt', d => mutHurt(d)], // (mutation cards: mutations.js)
  ['rebornHurt', d => rebornHurt(d)], // (Karma)
  ['rivalLeech', (d, ent) => rivalLeech(ent)], // (rivals with the leech trait)
].forEach(([n, f], i) => hookOn('hurt', n, f, i * 10));
[
  ['acidReflux', () => acidReflux()],
  ['relicHurt', (d, ent) => relicHurt(d, ent)],
  ['thornsHit', (d, ent) => thornsHit(ent)],
  ['sigHurt', () => sigHurt()],
  ['toyPlayerHurt', () => toyPlayerHurt()],
  ['genesHurt', d => genesHurt(d)],
  ['boonHurt', () => boonHurt()],
].forEach(([n, f], i) => hookOn('hurt:late', n, f, i * 10));
[
  ['toyFire', (w, t, src) => { if (!w.def.toy) return false; toyFire(w, t, src); return true; }],
  ['rebornFire', (w, t, src) => w.def.reborn && rebornFire(w, t, src)], // (Prawn Again's weapons, reborn.js)
  ['geneFire', (w, t, src) => w.def.gene && geneFire(w, t, src)], // (the Gene Gun, genegun.js)
  ['redFire', (w, t, src) => w.def.redtail && redFire(w, t, src)], // (the Redtail's weapons, redtail.js)
  ['armFire', (w, t, src) => w.def.armoury && armFire(w, t, src)], // (the Armoury's weapons, armoury.js)
  ['wupFire', (w, t, src) => w.uh && wupFire(w, t, src)], // (weapon branches: weapons24.js)
  ['modFire', (w, t, src) => w.def.v10 && w.m10 && modFire(w, t, src)], // (v10 modifiers, modifiers.js)
  ['mutFire', (w, t, src) => { mutFire(w, t, src); return false; }], // (Everywhere!: mutations.js; never takes the shot)
  ['v10Fire', (w, t, src) => w.def.v10 && v10Fire(w, t, src)], // (v10 beams and bursts, v10.js)
].forEach(([n, f], i) => hookOn('fire', n, f, i * 10));
[
  ['sigTick', dt => sigTick(dt)],
  ['comboTick', dt => comboTick(dt)],
  ['bigHazTick', dt => bigHazTick(dt)],
  ['overkillTick', dt => overkillTick(dt)],
  ['puTick', dt => puTick(dt)],
  ['redTick', dt => redTick(dt)],
  ['twinsTick', dt => twinsTick(dt)],
  ['rebornTick', dt => rebornTick(dt)],
  ['introTick', () => introTick()], // first sightings
  ['tutTick', () => tutTick()], // first-time tutorial cards (tutorial.js)
  ['chemPlayerZones', () => chemPlayerZones()], // (your own puddles: chem.js)
  ['pstTick', dt => pstTick(dt)], // (Sick: pstatus.js)
  ['junkTick', dt => junkTick(dt)], // junk DNA carriers and powers (junk.js)
  ['foes2Tick', dt => foes2Tick(dt)], // caps, support buffs, bogeys (foes2.js)
  ['nf10Tick', dt => nf10Tick(dt)], // v10 enemies: wax, bursts, trails (newfoes.js)
  ['boonTick', dt => boonTick(dt)],
].forEach(([n, f], i) => hookOn('tick', n, f, i * 10));
