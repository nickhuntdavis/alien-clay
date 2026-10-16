'use strict';
// Spawn Prawn - chemistry. Force (phys) is plain untyped damage. The eight damage types (internal keys in brackets)
// each leave a status on what they hit:
//   Acid (fire)      - Melting: damage over time that eats armour (e.burn); once the armour is gone it eats through, +50%.
//   Mucus (ice)      - Snotty: slower and slower (e.chill/chillAmt); enough and it's stuck fast (e.frozen).
//   Static (shock)   - Shocked: some damage it takes arcs to a neighbour (e.shock); every 4th Static hit stuns it.
//   Cooties (poison) - Sick: stacking damage over time (e.poison, e.poisonStacks); it sneezes it onto its mates and hits you softer.
//   Oil (oxi)        - Lubricated (e.fizz): no grip, so knockback sends it much further, and reactions on it are 50% stronger.
//   Water (salt)     - Soaking wet (e.pickle): each hit shoves it away; wet things carry Static twice as well.
//   Blood (arcane)   - Bleeding (e.bloodT, bloodDps, bloodN): damage over time that only ticks while it moves.
//   Soul (soul)      - Cursed (e.curse): Soul ignores armour; cursed enemies sometimes turn on their mates; bosses are Spooked.
// When a type lands on something already carrying another's status, they react (RX_PAIR in inspect.js, REACTIONS in data.js).
// Combos have chemistry too: fuse two weapons whose damage types are not their usual ones (Switched at Birth)
// and the combo picks up a TWIST from the pair it is made of.
// Hooks: applyElement and chemForce (damageEnemy), chemTick (status upkeep), chemWobble (enemy steering),
// chemMul (damage taken), chemKill, chemHaste (fire rate), chemDamageIn (damage to you), chemComboHit, chemKd (knockback grip).

const CHEM = { healGap: 0.5, chargeK: 0.12, stunEvery: 4 };
const drunk = e => e.poison > 0 && e.poisonStacks > 0; // (Sick: the old Ethanol slot)
const sick = drunk;
const lathered = e => e.chill > 0 || e.frozen > 0;
const bleeding = e => e.bloodT > 0;
// Which statuses an enemy carries, by damage type.
const chemHas = e => ({ fire: e.burn > 0, ice: lathered(e), shock: e.shock > 0, poison: sick(e), oxi: e.fizz > 0, salt: e.pickle > 0, arcane: bleeding(e), soul: e.curse > 0 });
const plainFoe = e => !e.boss && !e.rival && !e.egg;
// Reaction strength on this enemy (Oil makes everything react harder).
const rxK = e => G.P.react * (e.fizz > 0 ? 1.5 : 1);
const stun = (e, t) => { e.dazeT = Math.max(e.dazeT || 0, G.t + (e.boss ? t * 0.3 : t)); };
const shove = (e, fx, fy, f) => { if (e.boss || e.rival || e.egg) return; const dx = e.x - fx, dy = e.y - fy, d = Math.hypot(dx, dy) || 1; e.kx += dx / d * f; e.ky += dy / d * f; };
const addSick = (n, k, dps, by) => { n.poison = 4; n.poisonStacks = Math.min(G.P.poisonCap, (n.poisonStacks || 0) + k); setPoison(n, dps, by); };
const addBurn = (n, dps, by) => { n.burn = Math.max(n.burn || 0, 3); setBurn(n, dps, by); };
function curseFoe(e, t) {
  if (plainFoe(e) && !e.charmed) { e.charmed = true; e.charmT = t; e.frozen = 0; e.allyT = null; floatText(e.x, e.y - e.r - 12, 'POSSESSED', ELEMENTS.soul.color, 11, 0.7); }
}
const neighbours = (e, r, n) => acquireMany('nearest', r, e.x, e.y, n + 1).filter(o => o !== e && !o.dead);

function applyElement(e, elem, dmg, src) {
  const P = G.P, syn = G.synergy, has = chemHas(e);
  chemStick(e, dmg, src);
  const rsrc = { elem, noStatus: true, noArc: true, noCrit: true, wname: 'Reactions' };
  if (P.mixologist && chemCount(e) >= 2) dmg *= 1 + P.mixologist; // (Mixologist: stronger doses on an enemy that is already a cocktail)
  G.chemDmg = dmg; // (for Chain Reaction)
  // A reaction first: the first status already on it that pairs with this type.
  for (const k of ELEM_ORDER) {
    if (!has[k]) continue;
    const id = RX_PAIR[elem + '+' + k];
    if (id && k !== elem && react(e, id, src)) { reactDo(id, e, dmg, src, rsrc); break; }
  }
  if (e.dead) return;
  // Then this type's own status.
  switch (elem) {
    case 'fire': // Acid: Melting
      e.burn = syn.fire ? 4.5 : 3;
      setBurn(e, dmg * 0.4 * (syn.fire ? 1.5 : 1) * P.elem.fire, src);
      break;
    case 'ice': { // Mucus: Snotty
      e.chill = 2.5;
      e.chillAmt = Math.min(0.6, e.chillAmt + 0.14 * P.elem.ice);
      const thresh = syn.ice ? 0.3 : 0.58;
      if (e.chillAmt >= thresh && e.frozen <= 0) { e.frozen = e.boss ? 0.4 : 1.3; e.chillAmt = 0.2; }
      break;
    }
    case 'shock': // Static: Shocked
      e.shock = 2.2;
      e.shockN = (e.shockN || 0) + 1;
      if (e.shockN >= CHEM.stunEvery) { e.shockN = 0; stun(e, syn.shock ? 0.9 : 0.6); }
      break;
    case 'poison': // Cooties: Sick
      addSick(e, 1, dmg * 0.14 * P.elem.poison, src);
      if (e.poisonStacks >= P.poisonCap && !(e.pandT > G.t) && react(e, 'pandemic', src)) {
        e.pandT = G.t + 6;
        for (const n of neighbours(e, 170, 6)) { addSick(n, 2, e.poisonDps * 0.8, e.poisonBy); bolt(e.x, e.y, n.x, n.y, ELEMENTS.poison.color, 0.15); }
      }
      break;
    case 'oxi': // Oil: Lubricated, and it leaves a slick
      e.fizz = syn.oxi ? 4.5 : 3;
      if (!(e.slickT > G.t) && G.zones.length < 180) { e.slickT = G.t + 1.2; G.zones.push({ x: e.x, y: e.y, r: 48, life: 4, max: 4, dps: 0, elem: 'oxi', pull: 0, color: ELEMENTS.oxi.color, tick: 0, src: { elem: 'oxi', noStatus: true, wname: 'Oil slick' }, oil: true, quiet: true }); }
      break;
    case 'salt': { // Water: Soaking wet, and shoved
      e.pickle = syn.salt ? 4.5 : 3;
      const p = me(); shove(e, p.x, p.y, 90 * P.elem.salt);
      if (!(e.splashT > G.t) && chemCount(e) > 1) { e.splashT = G.t + 1; for (const n of neighbours(e, 100, 2)) { chemSplash(e, n); bolt(e.x, e.y, n.x, n.y, ELEMENTS.salt.color, 0.12); } }
      break;
    }
    case 'arcane': // Blood: Bleeding
      e.bloodT = syn.arcane ? 6 : 4;
      e.bloodN = Math.min(5, (e.bloodN || 0) + 1);
      e.bloodDps = Math.max((e.bloodDps || 0) * 0.85, dmg * 0.25 * P.elem.arcane) + dmg * 0.05 * e.bloodN;
      e.bloodBy = dotName(src);
      if (e.bloodN >= 5 && !(e.clotT > G.t)) { // five deep: the blood clots, dragging its neighbours into one slow lump
        e.clotT = G.t + 5; e.dazeSlowT = G.t + 2;
        forNear(e.x, e.y, 120, o => { if (o === e || !plainFoe(o)) return; const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1; o.kx += dx / d * 200; o.ky += dy / d * 200; o.dazeSlowT = G.t + 2; });
        floatText(e.x, e.y - e.r - 14, 'CLOTTED', ELEMENTS.arcane.color, 11, 0.7);
      }
      break;
    case 'soul': // Soul: Cursed
      e.curse = syn.soul ? 4.5 : 3;
      if (e.boss) { if (!(e.spookT > G.t)) { e.spookT = G.t + 4; e.dazeSlowT = G.t + 1.5; floatText(e.x, e.y - e.r - 14, 'SPOOKED', ELEMENTS.soul.color, 12, 0.8); } }
      else if (Math.random() < 0.12 * P.elem.soul) curseFoe(e, 2);
      break;
  }
  if (e.dead) return;
  chemOverload(e, elem, dmg, src, rsrc);
  if (!e.dead) chemTriple(e, dmg, src, rsrc);
  if (!e.dead) chemTerrain(e, elem, dmg, src, rsrc);
  if (!e.dead && chemFoes().has(e.def)) chemFoe(e, elem, dmg, src, rsrc);
  if (!e.dead) chemPuddle(e, elem);
}

// ---------------------------------------------------------------- overloads (a type with itself)
// Six hits of one type inside 3 seconds overloads it (Cooties has its own: Pandemic, at its dose limit).
const OVERLOAD_OF = { fire: 'meltdown', ice: 'booger', shock: 'overload', oxi: 'slipnslide', salt: 'waterlogged', arcane: 'hemorrhage', soul: 'possession' };
function chemOverload(e, elem, dmg, src, rsrc) {
  const id = OVERLOAD_OF[elem];
  if (!id) return;
  const O = e.ov || (e.ov = {});
  if (!(O[elem + 'T'] > G.t - 3)) O[elem] = 0;
  O[elem + 'T'] = G.t; O[elem] = (O[elem] || 0) + 1;
  if (O[elem] < 6 || O[elem + 'cd'] > G.t) return;
  O[elem] = 0; O[elem + 'cd'] = G.t + 5;
  if (!react(e, id, src)) return;
  const rm = rxK(e), c = REACTIONS[id].color, p = me();
  switch (id) {
    case 'meltdown': // it melts into a puddle that burns its mates
      damageEnemy(e, ((e.burnDps || 0) * 4 + dmg) * rm, rsrc);
      if (G.zones.length < 200) G.zones.push({ x: e.x, y: e.y, r: 70, life: 3, max: 3, dps: ((e.burnDps || dmg * 0.4) * 1.5 + 4) * rm, elem: 'fire', pull: 0, color: c, tick: 0, src: rsrc });
      break;
    case 'booger': // stuck fast, then flicked into its mates
      if (plainFoe(e)) { e.frozen = 0; chemBowl(e, p, 650, dmg * 1.5 * rm, rsrc); } else damageEnemy(e, dmg * 2 * rm, rsrc);
      break;
    case 'overload': // every shocked enemy nearby discharges
      for (const n of G.enemies) if (!n.dead && n.shock > 0 && Math.hypot(n.x - e.x, n.y - e.y) < 450) { bolt(e.x, e.y, n.x, n.y, c, 0.18); damageEnemy(n, dmg * 0.9 * rm, Object.assign({}, rsrc, { elem: 'shock' })); stun(n, 0.4); }
      break;
    case 'slipnslide': // no grip at all: it bowls through the crowd
      if (plainFoe(e)) chemBowl(e, p, 700, dmg * 1.2 * rm, rsrc); else damageEnemy(e, dmg * 1.5 * rm, rsrc);
      break;
    case 'waterlogged': // it bloats, then bursts in a shove
      e.dazeSlowT = G.t + 1.5;
      after(1.2, () => { if (!G || e.dead) return; forNear(e.x, e.y, 140, o => { if (o !== e) shove(o, e.x, e.y, 420); }); aoe(e.x, e.y, 90, (dmg * 1.5 + 6) * rm, rsrc, c); });
      break;
    case 'hemorrhage': // it bursts and sprays its neighbours
      damageEnemy(e, ((e.bloodDps || 0) * 3 + dmg) * rm, rsrc);
      for (const n of neighbours(e, 140, 5)) { n.bloodT = Math.max(n.bloodT || 0, 3); n.bloodN = Math.min(5, (n.bloodN || 0) + 2); n.bloodDps = Math.max(n.bloodDps || 0, (e.bloodDps || dmg * 0.25) * 0.8); n.bloodBy = e.bloodBy; }
      fxParts('drop', e.x, e.y, c, 14, 200, 0.6, 3);
      break;
    case 'possession': // it fights for you for 6s (bosses: a long spook and a big hit)
      if (plainFoe(e)) curseFoe(e, 6); else { e.dazeSlowT = G.t + 3; damageEnemy(e, dmg * 3 * rm, rsrc); }
      break;
  }
}
// An enemy sent sliding: it hurts whatever it hits on the way (chemTick does the hitting).
function chemBowl(e, from, f, dmg, rsrc) { shove(e, from.x, from.y, f); e.bowlT = G.t + 0.7; e.bowlD = dmg; e.bowlS = rsrc; e.bowlHit = [e.id]; }

// ---------------------------------------------------------------- triples (three statuses at once)
const TRIPLES = [
  ['zombie', ['arcane', 'soul', 'poison']], ['baptism', ['salt', 'soul', 'oxi']], ['napalm', ['fire', 'oxi', 'shock']],
  ['flesheating', ['fire', 'arcane', 'poison']], ['fluseason', ['ice', 'poison', 'salt']], ['oilrig', ['shock', 'salt', 'oxi']],
];
function chemTriple(e, dmg, src, rsrc) {
  if (e.triT > G.t) return;
  const has = chemHas(e), T = TRIPLES.find(([, ks]) => ks.every(k => has[k]));
  if (!T) return;
  const id = T[0];
  e.reactCd = 0;
  if (!react(e, id, src)) return;
  e.triT = G.t + 6;
  const rm = rxK(e), c = REACTIONS[id].color, far = (r, f) => { for (const n of G.enemies) if (!n.dead && n !== e && Math.hypot(n.x - e.x, n.y - e.y) < r) f(n); };
  switch (id) {
    case 'zombie': // it fights for you, and what dies near it gets back up on your side
      curseFoe(e, 6); e.zombify = G.t + 6;
      break;
    case 'baptism': // converted for good (not bosses; 3 at most)
      if (plainFoe(e) && G.enemies.filter(o => o.baptised && !o.dead).length < 3) { e.charmed = true; e.charmT = 1e9; e.baptised = true; e.frozen = 0; e.allyT = null; e.name = e.name + ' (born again)'; floatText(e.x, e.y - e.r - 12, 'BORN AGAIN', ELEMENTS.soul.color, 12, 0.9); }
      else damageEnemy(e, dmg * 3 * rm, rsrc);
      break;
    case 'napalm': // a sticky burning patch that spreads
      if (G.zones.length < 200) G.zones.push({ x: e.x, y: e.y, r: 100, r0: 100, grow: 18, life: 5, max: 5, dps: (dmg * 1.2 + 8) * rm, elem: 'fire', pull: 0, color: c, tick: 0, src: rsrc, flame: true });
      break;
    case 'flesheating': // melting spreads to every sick enemy nearby
      far(320, n => { if (sick(n)) { addBurn(n, (e.burnDps || dmg * 0.4) * rm, rsrc.wname); bolt(e.x, e.y, n.x, n.y, c, 0.12); } });
      break;
    case 'fluseason': { // the whole screen catches it
      let k = 0; far(700, n => { if (k++ < 30) addSick(n, 1, e.poisonDps || dmg * 0.14, rsrc.wname); });
      break;
    }
    case 'oilrig': // every oil slick nearby goes up
      for (const z of G.zones) if (z.oil && z.life > 0 && Math.hypot(z.x - e.x, z.y - e.y) < 500) { z.life = 0; aoe(z.x, z.y, z.r + 30, (dmg * 1.2 + 6) * rm, rsrc, c); }
      aoe(e.x, e.y, 70, dmg * rm, rsrc, c);
      break;
  }
}

// ---------------------------------------------------------------- terrain reactions
const terrAt = (x, y, type) => { const c = tCell(x, y); if (c) for (const ob of c) if (ob.type === type && Math.hypot(x - ob.x, y - ob.y) < ob.r) return ob; return null; };
function chemTerrain(e, elem, dmg, src, rsrc) {
  if (!G.terrain || src.dot) return;
  const inOb = (ob, f) => forNear(ob.x, ob.y, ob.r, o => { if (Math.hypot(o.x - ob.x, o.y - ob.y) < ob.r) f(o); });
  if (elem === 'shock' || elem === 'poison') {
    const ob = terrAt(e.x, e.y, 'current');
    if (ob && !(ob.rxT > G.t)) {
      if (elem === 'shock' && react(e, 'livewire', src)) { ob.rxT = G.t + 1.5; inOb(ob, o => { if (o !== e) { damageEnemy(o, dmg * 0.6 * rxK(o), Object.assign({}, rsrc, { elem: 'shock' })); o.shock = Math.max(o.shock || 0, 1.5); } }); }
      else if (elem === 'poison' && react(e, 'downstream', src)) { ob.rxT = G.t + 1.5; inOb(ob, o => { if (o !== e) addSick(o, 1, e.poisonDps || dmg * 0.14, rsrc.wname); }); }
    }
  }
  if (elem === 'oxi' || elem === 'salt') {
    const ob = terrAt(e.x, e.y, 'acid');
    if (ob && !(ob.rxT > G.t)) {
      if (elem === 'oxi' && react(e, 'flareup', src)) { ob.rxT = G.t + 5; ob.flareT = G.t + 5; ob.dilT = 0; }
      else if (elem === 'salt' && react(e, 'diluted', src)) { ob.rxT = G.t + 4; ob.dilT = G.t + 4; ob.flareT = 0; }
    }
  }
}
// Static shots into a mitochondrion overcharge it (terrainShot, terrain.js): three times the fill.
function chemMitoK(s, ob) {
  if (!(s.src && s.src.elem === 'shock')) return 1;
  if (!(ob.ocT > G.t)) { ob.ocT = G.t + 3; floatText(ob.x, ob.y - ob.r - 10, REACTIONS.overcharged.name, REACTIONS.overcharged.color, 13, 0.8); G.stats.reactBy.overcharged = (G.stats.reactBy.overcharged || 0) + 1; inspectSeeRx('overcharged'); typeRxFx(ob.x, ob.y, ob.r * 0.5, 'overcharged'); }
  return 3;
}

// ---------------------------------------------------------------- reactions with particular enemies
let CHEM_FOES_M = null; // (built on first use: foes2.js adds these enemies after chem.js loads)
const chemFoes = () => CHEM_FOES_M || (CHEM_FOES_M = new Map(['grease', 'leech', 'puffball', 'shell', 'callus', 'platelet', 'pube', 'bogey'].filter(k => ENEMIES[k]).map(k => [ENEMIES[k], k])));
function chemFoe(e, elem, dmg, src, rsrc) {
  const D = e.def, k = chemFoes().get(D), rm = rxK(e), say = id => react(e, id, src);
  if (D.grease && elem === 'shock' && !(e.fbT > G.t) && say('fireball')) { e.fbT = G.t + 4; chemBowl(e, me(), 600, dmg * 1.5 * rm, Object.assign({}, rsrc, { elem: 'fire' })); e.burn = 3; setBurn(e, dmg * 0.5, rsrc.wname); }
  else if (k === 'leech' && elem === 'arcane' && say('gorged')) aoe(e.x, e.y, 90, (e.maxHp + dmg) * rm, rsrc, REACTIONS.gorged.color);
  else if (D.puff && elem === 'poison' && !(e.fbT > G.t) && say('sporesneeze')) { e.fbT = G.t + 3; forNear(e.x, e.y, 160, o => { if (o !== e) addSick(o, 2, dmg * 0.14, rsrc.wname); }); }
  else if (k === 'shell' && elem === 'fire' && e.armour > 0 && say('shellshock')) { e.armour = 0; e.shred = 0; }
  else if (k === 'callus' && elem === 'salt' && !(e.softT > G.t) && say('softened')) e.softT = G.t + 6;
  else if (D.clot && elem === 'arcane' && !(e.thinT > G.t) && say('thinned')) e.thinT = G.t + 6;
  else if (k === 'pube' && elem === 'ice' && say('gluedown')) e.frozen = Math.max(e.frozen, 3);
  else if (k === 'bogey' && elem === 'salt' && say('washedoff')) { e.stuck = null; damageEnemy(e, e.hp + 1, rsrc); }
}

// ---------------------------------------------------------------- puddles you can use (C)
// Water hits leave a brief puddle; a Mucus enemy stuck fast leaves a blob of snot. Swim through them.
function chemPuddle(e, elem) {
  if (G.zones.length > 180) return;
  if (elem === 'salt' && !(e.pudT > G.t)) { e.pudT = G.t + 1.5; G.zones.push({ x: e.x, y: e.y, r: 34, life: 2, max: 2, dps: 0, elem: 'salt', pull: 0, color: ELEMENTS.salt.color, tick: 0, src: { elem: 'salt', noStatus: true, wname: 'Puddle' }, water: true, quiet: true }); }
  if (elem === 'ice' && e.frozen > 0 && !(e.pudT > G.t)) { e.pudT = G.t + 3; G.zones.push({ x: e.x, y: e.y, r: 28, life: 5, max: 5, dps: 0, elem: 'ice', pull: 0, color: ELEMENTS.ice.color, tick: 0, src: { elem: 'ice', noStatus: true, wname: 'Snot' }, snot: true, quiet: true }); }
}
// Every frame (game.js update): what your own puddles do for you.
function chemPlayerZones() {
  if (!G || G.state !== 'play') return;
  const q = me(), say = id => { const R = REACTIONS[id]; if (!(G['say' + id] > G.t)) { G['say' + id] = G.t + 6; floatText(q.x, q.y - 30, R.name, R.color, 12, 0.8); G.stats.reactBy[id] = (G.stats.reactBy[id] || 0) + 1; inspectSeeRx(id); typeRxFx(q.x, q.y, q.r, id); } };
  let lube = false;
  for (const z of G.zones) {
    if (!(z.oil || z.water || z.snot) || z.life <= 0 || Math.hypot(q.x - z.x, q.y - z.y) > z.r + (q.r || 12)) continue;
    if (z.oil) lube = true;
    if (z.water && (G.acidOn > G.t || G.bogeyN || G.tangleT > G.t)) {
      G.acidOn = 0; G.sizzle = 0; G.tangleT = 0;
      for (const b of G.enemies) if (b.stuck && !b.dead) { b.stuck = null; shove(b, q.x, q.y, 300); }
      say('rinse');
    }
    if (z.snot && !G.snotShield && !(G.snotCd > G.t)) { G.snotShield = true; G.snotCd = G.t + 10; say('snotshield'); }
  }
  if (lube && !G.lubeOn) say('lubedup');
  G.lubeOn = lube;
}
const chemPlayerSpeed = () => (G && G.lubeOn ? 1.3 : 1) * (G && G.penHasteT > G.t ? G.penHasteK || 1 : 1); // (Egg White lane: playpen.js)

// The reactions. e has just been hit by one type while carrying another's status.
function reactDo(id, e, dmg, src, rsrc) {
  const P = G.P, rm = rxK(e), p = me(), R = REACTIONS[id], c = R.color;
  const hitN = (list, f) => { for (const n of list) { bolt(e.x, e.y, n.x, n.y, c, 0.15); f(n); } };
  switch (id) {
    case 'bath': { // Water + Static: every soaking-wet enemy on screen is zapped
      let k = 0;
      for (const n of G.enemies) {
        if (n.dead || !(n.pickle > 0) || k >= 14 || Math.hypot(n.x - e.x, n.y - e.y) > 650) continue;
        k++; bolt(e.x, e.y, n.x, n.y, c, 0.2); damageEnemy(n, dmg * 0.8 * rm, Object.assign({}, rsrc, { elem: 'shock' })); n.xrayT = G.t + 0.25;
      }
      e.xrayT = G.t + 0.25;
      break;
    }
    case 'greasefire': // Static + Oil: the slick goes up
      e.fizz = 0;
      if (G.zones.length < 200) G.zones.push({ x: e.x, y: e.y, r: 75, life: 3, max: 3, dps: (dmg * 0.9 + 6) * rm, elem: 'fire', pull: 0, color: c, tick: 0, src: rsrc, flame: true });
      fxParts('ember', e.x, e.y, '#ff9e00', 10, 160, 0.8, 3);
      break;
    case 'holywater': // Water + Soul: the curse is boiled out
      e.curse = 0;
      damageEnemy(e, (dmg * 2.5 + 10) * rm * (e.boss ? 2 : 1), rsrc);
      fxParts('smoke', e.x, e.y, '#ffffff', 5, 60, 0.9, 6, -Math.PI / 2, 0.6);
      break;
    case 'penicillin': { // Acid + Cooties: clears it in one big hit
      const d = (e.poisonDps * e.poisonStacks * 4 + dmg) * rm;
      e.poison = 0; e.poisonStacks = 0;
      damageEnemy(e, d, rsrc);
      break;
    }
    case 'soulrot': // Acid + Soul: the ghost comes out spitting acid
      hitN(neighbours(e, 160, 3), n => addBurn(n, dmg * 0.5 * rm, rsrc.wname));
      break;
    case 'bloodclot': // Blood + Oil: everything nearby congeals into one slow lump
      forNear(e.x, e.y, 130, o => { if (o === e || !plainFoe(o)) return; const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1; o.kx += dx / d * 260; o.ky += dy / d * 260; o.dazeSlowT = G.t + 2.5; });
      e.dazeSlowT = G.t + 2.5;
      break;
    case 'sushi': // Cooties + Oil: it throws up on its mates
      forNear(e.x, e.y, 140, o => { if (o === e) return; addSick(o, 2, e.poisonDps || dmg * 0.14, rsrc.wname); damageEnemy(o, dmg * 0.4 * rm, rsrc); });
      fxParts('drop', e.x, e.y, c, 12, 220, 0.6, 3);
      break;
    case 'publicpool': // Water + Cooties: everything wet catches it
      for (const n of G.enemies) if (!n.dead && n !== e && n.pickle > 0 && Math.hypot(n.x - e.x, n.y - e.y) < 320) addSick(n, 1, e.poisonDps || dmg * 0.14, rsrc.wname);
      break;
    case 'ectoplasm': // Mucus + Soul: ghost slime on everything nearby
      forNear(e.x, e.y, 130, o => { o.chill = 2.5; o.chillAmt = Math.min(0.6, o.chillAmt + 0.3); });
      break;
    case 'cardiac': { // Blood + Static: a stun, then all the bleeding at once
      stun(e, 1);
      const d = ((e.bloodDps || 0) * 4 + dmg) * rm;
      e.bloodT = 0; e.bloodN = 0;
      damageEnemy(e, d, rsrc);
      break;
    }
    case 'lastrites': // Soul + Oil: anointed
      if (plainFoe(e)) curseFoe(e, 5); else damageEnemy(e, dmg * 2 * rm, rsrc);
      break;
    case 'snotrocket': // Mucus + Cooties: the sneeze carries twice as far
      hitN(neighbours(e, 240, 4), n => addSick(n, 2, e.poisonDps || dmg * 0.14, rsrc.wname));
      break;
    case 'dirtyneedle': // Blood + Cooties: every bleeder catches it
      for (const n of G.enemies) if (!n.dead && n !== e && n.bloodT > 0 && Math.hypot(n.x - e.x, n.y - e.y) < 380) { addSick(n, 2, e.poisonDps || dmg * 0.14, rsrc.wname); bolt(e.x, e.y, n.x, n.y, c, 0.12); }
      break;
    case 'crimescene': // Blood + Water: the blood spreads into a pool
      if (G.zones.length < 200) G.zones.push({ x: e.x, y: e.y, r: 80, life: 3.5, max: 3.5, dps: ((e.bloodDps || dmg * 0.25) + 4) * rm, elem: 'arcane', pull: 0, color: c, tick: 0, src: rsrc });
      break;
    case 'scab': // Blood + Mucus: it crusts over, then the scab gets picked
      stun(e, 1.5); e.scabT = G.t + 4;
      break;
    case 'bloodpact': // Blood + Soul: the ghost drains it and feeds you
      damageEnemy(e, dmg * 1.2 * rm, rsrc);
      if (!(G.saltT > G.t)) { G.saltT = G.t + CHEM.healGap; healPlayer(P.maxHp * 0.01, true); }
      break;
    case 'battery': // Acid + Static: a battery that zaps its neighbours, and charges you up
      e.shock = 0; battery(e, dmg);
      break;
    case 'acidrain': // Acid + Water: weaker melting over a wide area
      forNear(e.x, e.y, 150, o => { if (o !== e) addBurn(o, (e.burnDps || dmg * 0.4) * 0.5 * rm, rsrc.wname); });
      break;
    case 'heartburn': // Acid + Mucus: acid glue splashes its mates
      aoe(e.x, e.y, 75, (dmg * 1.2 + 6) * rm * (G.pair.hotcold ? 2 : 1), rsrc, c);
      forNear(e.x, e.y, 75, o => { if (o !== e) addBurn(o, (e.burnDps || dmg * 0.4) * 0.6, rsrc.wname); });
      break;
    case 'ulcer': // Acid + Blood: bursts through
      e.shred = Math.min(e.armour + 4, e.shred + 4);
      damageEnemy(e, (((e.burnDps || 0) + (e.bloodDps || 0)) * 3 + dmg) * rm, rsrc);
      break;
    case 'vinaigrette': // Acid + Oil: a dressing for everything nearby
      hitN(neighbours(e, 130, 4), n => { addBurn(n, (e.burnDps || dmg * 0.4) * 0.7 * rm, rsrc.wname); n.fizz = Math.max(n.fizz || 0, 2); });
      break;
    case 'dontmix': // Water + Oil: the crowd repels apart
      forNear(e.x, e.y, 170, o => { if (o !== e) shove(o, e.x, e.y, 520 * Math.min(1.5, rm)); });
      shove(e, p.x, p.y, 300);
      break;
    case 'snotslick': // Mucus + Water: stuck, and sliding
      if (plainFoe(e)) { e.frozen = Math.max(e.frozen, 1.2); shove(e, p.x, p.y, 380); }
      forNear(e.x, e.y, 110, o => { o.chill = 2.5; o.chillAmt = Math.min(0.6, o.chillAmt + 0.15); });
      break;
    case 'snailtrail': // Mucus + Oil: the slick spreads the snot
      forNear(e.x, e.y, 150, o => { o.chill = 2.5; o.chillAmt = Math.min(0.6, o.chillAmt + 0.25); o.fizz = Math.max(o.fizz || 0, 1.5); });
      break;
    case 'shortcircuit': // Mucus + Static: stuck things stay stuck
      if (e.frozen > 0) e.frozen = Math.min(e.boss ? 1 : 3, e.frozen * 2 + 0.5); else stun(e, 0.8);
      aoe(e.x, e.y, 55, dmg * 0.6 * rm, rsrc, c);
      break;
    case 'poltergeist': // Static + Soul: the ghost throws arcs
      hitN(neighbours(e, 180, 4), n => damageEnemy(n, dmg * 0.6 * rm, Object.assign({}, rsrc, { elem: 'shock' })));
      break;
    case 'shakes': // Static + Cooties: a shivering stun that spreads
      stun(e, 0.7);
      forNear(e.x, e.y, 120, o => { if (o !== e && sick(o)) stun(o, 0.5); });
      break;
    case 'patientzero': // Soul + Cooties: it runs into its mates, full of it
      addSick(e, G.P.poisonCap, e.poisonDps || dmg * 0.14, rsrc.wname);
      curseFoe(e, 3);
      break;
  }
}
// Acid meets Static: a battery. It zaps its neighbours for a couple of seconds, and charges you up.
function battery(e, dmg) {
  e.battT = G.t + 2; e.battD = Math.max(e.battD && e.battT > G.t ? e.battD : 0, dmg * 0.5 * G.P.react); e.battZ = 0;
  if (!(G.chargeUpT > G.t)) { const p = me(); floatText(p.x, p.y - 30, 'CHARGED UP', '#f4ff8a', 12, 0.8); }
  G.chargeUpT = G.t + 3;
}
// Force hits (from damageEnemy): Force is untyped, so no reactions.
function chemForce(e, dmg, src) { chemStick(e, dmg, src); }
// Mucus: shots stick in snotty enemies, and pop out when they die (chemKill).
function chemStick(e, dmg, src) { if (e.chill > 0 && !src.dot && !src.noStatus && dmg > 0) e.snot = Math.min(e.maxHp * 0.5, (e.snot || 0) + dmg * 0.15); }
// Water: a splash carries an enemy's other statuses onto a neighbour, at half strength.
function chemSplash(e, n) {
  if (e.burn > 0) addBurn(n, (e.burnDps || 0) * 0.5, e.burnBy);
  if (sick(e)) addSick(n, 1, (e.poisonDps || 0) * 0.5, e.poisonBy);
  if (e.shock > 0) n.shock = Math.max(n.shock || 0, 1.2);
  if (e.fizz > 0) n.fizz = Math.max(n.fizz || 0, 1.5);
  if (e.chill > 0) { n.chill = 2.5; n.chillAmt = Math.min(0.6, (n.chillAmt || 0) + e.chillAmt * 0.5); }
  if (e.bloodT > 0) { n.bloodT = Math.max(n.bloodT || 0, 2); n.bloodDps = Math.max(n.bloodDps || 0, (e.bloodDps || 0) * 0.5); n.bloodBy = e.bloodBy; }
  if (e.curse > 0) n.curse = Math.max(n.curse || 0, 1.5);
}
// A Blood pool (left by a bleeding kill) heals you while you're in it.
function chemPool(z) { const q = me(); if (G.poolHealT > G.t) return; if (Math.hypot(q.x - z.x, q.y - z.y) < z.r + (q.r || 12)) { G.poolHealT = G.t + 0.24; healPlayer(G.P.maxHp * z.heal, true); if (!(G.saytopup > G.t)) { G.saytopup = G.t + 6; floatText(q.x, q.y - 30, 'TOP-UP', REACTIONS.topup.color, 12, 0.8); G.stats.reactBy.topup = (G.stats.reactBy.topup || 0) + 1; inspectSeeRx('topup'); typeRxFx(q.x, q.y, q.r, 'topup'); } } } // (pools don't stack)
// Soul shots pass through walls, shields, mirrors and dodges.
const soulShot = pr => !!(pr.src && pr.src.elem === 'soul');
// Per enemy per frame (status upkeep): melting eats armour; batteries zap; the sick sneeze; bleeders bleed as they move.
function chemTick(e, dt) {
  if (e.burn > 0 && e.armour > 0) e.shred = Math.min(e.armour + 4, e.shred + dt * 0.8);
  if (e.pickle > 0) e.pickle -= dt;
  if (e.fizz > 0) e.fizz -= dt;
  if (e.curse > 0) e.curse -= dt;
  if (e.shock <= 0) e.shockN = 0;
  if (sick(e)) {
    e.sneezeT = (e.sneezeT || 1.6) - dt;
    if (e.sneezeT <= 0) {
      e.sneezeT = 1.6;
      const n = neighbours(e, 110, 3).find(o => !sick(o));
      if (n) { addSick(n, 1, e.poisonDps * 0.7, e.poisonBy); fxParts('bubble', e.x, e.y, ELEMENTS.poison.color, 4, 80, 0.5, 2); }
    }
  }
  if (e.bloodT > 0) {
    e.bloodT -= dt;
    const mv = e.lbx != null ? Math.hypot(e.x - e.lbx, e.y - e.lby) / Math.max(dt, 1e-3) : 0;
    if (mv > 12 || G.synergy.arcane) {
      damageEnemy(e, e.bloodDps * dt, { dot: true, noCrit: true, noStatus: true, noArc: true, wname: (e.bloodBy || '?') + ' (bleeding)' });
      if (Math.random() < dt * 5) spawnPart(e.x, e.y, ELEMENTS.arcane.color, 1, 20, 0.6, 2);
    }
    if (e.bloodT <= 0) { e.bloodN = 0; e.bloodDps = 0; }
  }
  e.lbx = e.x; e.lby = e.y;
  if (e.bowlT > G.t) forNear(e.x, e.y, e.r + 14, o => { if (o.charmed || e.bowlHit.includes(o.id)) return; e.bowlHit.push(o.id); damageEnemy(o, e.bowlD, e.bowlS); shove(o, e.x, e.y, 260); });
  if (e.battT > G.t) {
    e.battZ -= dt;
    if (e.battZ <= 0) {
      e.battZ = 0.5;
      let k = 0;
      for (const n of acquireMany('nearest', 150, e.x, e.y, 3)) {
        if (n === e || k >= 2) continue;
        k++; bolt(e.x, e.y, n.x, n.y, '#f4ff8a', 0.12);
        damageEnemy(n, e.battD, { elem: 'shock', noStatus: true, noArc: true, noCrit: true, wname: 'Reactions' });
      }
    }
  }
}
// Sick enemies stagger about (the sicker, the worse). Returns the angle to turn their steering by.
const chemWobble = e => (sick(e) && !e.boss ? Math.sin(e.age * 3.1 + (e.id || 0)) * Math.min(1, e.poisonStacks * 0.08) : 0);
// Damage taken: picked scabs, and Cocktail Hour.
const chemMul = (e, src) => (e.scabT > G.t && !(e.dazeT > G.t) ? 1.4 : 1) * (G.P.cocktail && src && !src.dot ? 1 + G.P.cocktail * chemCount(e) : 1);
// Acid that has eaten all the armour eats through: its melting does +50%.
const chemBurnK = e => (e.armour > 0 && e.shred >= e.armour ? 1.5 : 1);
// Knockback grip: lubricated enemies slide much further.
const chemKd = e => (e.fizz > 0 ? 0.12 : 0.02);
// How many different statuses an enemy carries right now.
const chemCount = e => { const h = chemHas(e); let n = 0; for (const k in h) n += h[k] ? 1 : 0; return n; };
// A ghost of e that fights for you for a few seconds.
function chemGhost(e) {
  const z = makeEnemy(e.def, e.x, e.y);
  z.charmed = true; z.charmT = G.synergy.soul ? 6 : 4; z.zombie = true; z.ghost = true; z.xp = 0; z.hp = z.maxHp * 0.5; z.name = 'Ghost of ' + e.name;
  G.enemies.push(z); floatText(e.x, e.y - e.r - 12, 'GHOST', ELEMENTS.soul.color, 11, 0.7);
}
// A cursed enemy dies: its ghost haunts the nearest one.
function chemKill(e, src) {
  if (e.curse > 0) {
    const n = acquire('nearest', 220, e.x, e.y, e); if (n) { n.curse = Math.max(n.curse || 0, 2); bolt(e.x, e.y, n.x, n.y, ELEMENTS.soul.color, 0.15); }
    // Its ghost fights for you for a few seconds (not bosses, rivals or ghosts; 6 at most).
    if (plainFoe(e) && !e.ghost && !e.charmed && G.enemies.filter(o => o.ghost && !o.dead).length < 6) chemGhost(e);
  } else if (plainFoe(e) && !e.ghost && !e.charmed && G.enemies.some(o => o.zombify > G.t && !o.dead && Math.hypot(o.x - e.x, o.y - e.y) < 160) && G.enemies.filter(o => o.ghost && !o.dead).length < 6) chemGhost(e); // (ZOMBIE)
  if (e.snot > 1 && !e.ghost) { aoe(e.x, e.y, 60 + e.r, e.snot, { elem: 'ice', noStatus: true, noArc: true, noCrit: true, wname: 'Snot pop' }, ELEMENTS.ice.color); e.snot = 0; }
  if (e.bloodT > 0 && !e.ghost && Math.random() < 0.35 && G.zones.filter(z => z.heal).length < 6) G.zones.push({ x: e.x, y: e.y, r: 40, life: 4, max: 4, dps: 0, elem: 'arcane', pull: 0, color: ELEMENTS.arcane.color, tick: 0, src: { elem: 'arcane', noStatus: true, wname: 'Blood pool' }, heal: 0.006, quiet: true });
  twistKill(e, src);
}
const chemHaste = () => (G.chargeUpT > G.t ? 1 + CHEM.chargeK : 1);
// Damage coming at you: the sick hit softer; Shock Absorber's barrier.
function chemDamageIn(dmg, ent) {
  if (dmg > 0 && G.snotShield) { G.snotShield = false; const p = me(); floatText(p.x, p.y - 26, 'BLOCKED', ELEMENTS.ice.color, 12, 0.7); p.iframes = Math.max(p.iframes || 0, 0.3); return 0; }
  if (ent && sick(ent)) dmg *= 0.8;
  if (dmg > 0 && G.absorbOn) { G.absorbOn = false; G.absorbT = G.t + 8; const p = me(); ring(p.x, p.y, 40, '#ffe94a', 0.4, 4); floatText(p.x, p.y - 26, 'ABSORBED', '#ffe94a', 12, 0.7); p.iframes = Math.max(p.iframes || 0, 0.3); return 0; }
  return dmg;
}

// ---------------------------------------------------------------- combo twists
// A combo made of two weapons on their usual elements does what it says. Change either element (Switched at
// Birth) and the combo takes on the chemistry of the new pair: a TWIST. It fires on every hit the combo itself
// deals, and now and then on either weapon's own hits.
const TWISTS = {
  'fire+ice':      { name: 'Acid Glue',      desc: 'Combo hits splash acid glue: a burst round the target that sets its mates melting.' },
  'fire+shock':    { name: 'Car Battery',    desc: 'Combo hits turn the target into a battery that zaps its neighbours for 2s.' },
  'fire+poison':   { name: 'Antiseptic',     desc: 'Combo hits burn the sickness out of the target in one big hit.' },
  'arcane+fire':   { name: 'Weeping Wounds', desc: 'Combo hits make the target bleed and melt, hard.' },
  'fire+phys':     { name: 'Acid Wash',      desc: 'Combo hits strip 2 armour for good (1 from bosses).' },
  'ice+shock':     { name: 'Fried Snot',     desc: 'Combo hits fry the snot: a small pop round the target that strips armour.' },
  'ice+poison':    { name: 'Head Cold',      desc: 'Combo hits make the target sneeze: 4 enemies nearby get two doses of Cooties.' },
  'arcane+ice':    { name: 'Scab Picker',    desc: 'Combo hits scab the target over: it stops for a second (not bosses).' },
  'ice+phys':      { name: 'Slip and Slide', desc: 'Combo hits lather the target and send it skidding a long way.' },
  'poison+shock':  { name: 'Fever',          desc: 'Combo hits spike a fever: a small blast that makes everything in it a dose sicker.' },
  'arcane+shock':  { name: 'Flatline',       desc: 'Combo hits stop the heart of badly hurt enemies (under 30% health): they fight for you for 5s.' },
  'phys+shock':    { name: 'Crumple Zone',  desc: 'Combo hits charge a barrier that blocks the next hit you take (recharges after 8s).' },
  'arcane+poison': { name: 'Bad Transfusion', desc: 'Enemies the combo kills spray their blood into the nearest enemy for a share of their health.' },
  'phys+poison':   { name: 'Coughing Fit',   desc: 'Combo hits start a coughing fit: the target hacks up on everything next to it.' },
  'arcane+phys':   { name: 'Pin Cushion',    desc: 'Every 4th combo hit on the same enemy deals triple damage.' },
  'fire+fire':     { name: 'Concentrated',   desc: 'Combo hits deal +35% damage and eat 1 armour.' },
  'ice+ice':       { name: 'Glued Shut',     desc: 'Combo hits leave ordinary enemies stuck fast on the spot.' },
  'shock+shock':   { name: 'Supercharged',   desc: 'Combo hits arc on to three more enemies.' },
  'poison+poison': { name: 'Double Dose',    desc: 'Combo hits give two doses of Cooties at once.' },
  'arcane+arcane': { name: 'Blood Rite',     desc: 'Bleeding enemies the combo kills explode.' },
  'phys+phys':     { name: 'Brute Squad',    desc: 'Combo hits deal +25% damage and knock enemies flying.' },
};
const twistKey = (a, b) => [a, b].sort().join('+');
const wElemOf = w => { const m = w && w.mods && w.mods.find(x => x.id === 'elemental'); return m ? m.elem : w ? w.s && w.s.elem || w.def.elem : null; };
// The twist a combo would have with these two elements (null if they are its usual pair).
function twistFor(c, ea, eb) {
  const da = WEAPONS[c.a].elem, db = WEAPONS[c.b].elem;
  if (twistKey(ea, eb) === twistKey(da, db)) return null;
  return TWISTS[twistKey(ea, eb)] ? Object.assign({ key: twistKey(ea, eb) }, TWISTS[twistKey(ea, eb)]) : null;
}
function comboTwist(c) {
  const a = owned(c.a), b = owned(c.b);
  return a && b ? twistFor(c, wElemOf(a), wElemOf(b)) : null;
}
// Fused combos with a twist, refreshed every half second: [{ c, tw }].
function activeTwists() {
  if (!G.combo) return [];
  if (G.twistAt > G.t && G.twists) return G.twists;
  G.twistAt = G.t + 0.5;
  G.twists = [];
  for (const c of COMBOS) if (G.combo[c.id]) { const tw = comboTwist(c); if (tw) G.twists.push({ c, tw }); }
  return G.twists;
}
const twistLabel = tw => `${tw.key.split('+').map(k => ELEMENTS[k].name).join(' + ')} TWIST: ${tw.name}`;
// Which twist (if any) a hit belongs to: combo damage (src.combo) always; either combo weapon's own hits now and then.
function twistOf(src) {
  const T = activeTwists();
  if (!T.length) return null;
  if (src.combo) { const t = T.find(x => x.c.id === src.combo); return t ? t.tw : null; }
  if (!src.w || src.noProc || src.dot || Math.random() > 0.12) return null;
  const t = T.find(x => x.c.a === src.w.id || x.c.b === src.w.id);
  return t ? t.tw : null;
}
// Extra damage from a twist (damageEnemy's multiplier chain).
function twistMul(e, src) {
  if (!src.combo) return 1;
  const tw = activeTwists().length && twistOf(src);
  if (!tw) return 1;
  if (tw.key === 'fire+fire') return 1.35;
  if (tw.key === 'phys+phys') return 1.25;
  if (tw.key === 'arcane+phys') { e.pinN = (e.pinN || 0) + 1; if (e.pinN % 4 === 0) { floatText(e.x, e.y - e.r - 12, 'PIN', '#c9184a', 12, 0.5); return 3; } }
  return 1;
}
// After a hit: the twist's effect.
function chemComboHit(e, dmg, src) {
  if (e.dead || !G.combo) return;
  const tw = twistOf(src);
  if (!tw || e.twistCd > G.t) return;
  if ((G.twistF === G.frameN ? ++G.twistN : (G.twistF = G.frameN, G.twistN = 1)) > 4) return; // (a few a frame at most)
  e.twistCd = G.t + (src.combo ? 0.3 : 0.6);
  const P = G.P, tsrc = { elem: src.elem, noStatus: true, noArc: true, noCrit: true, noProc: true, wname: tw.name };
  const plain = !e.boss && !e.rival && !e.egg;
  if (!(G.twistSayT > G.t)) { G.twistSayT = G.t + 2.5; floatText(e.x, e.y - e.r - 24, tw.name.toUpperCase(), '#ff3df2', 12, 0.8); }
  switch (tw.key) {
    case 'fire+ice': reactDo('heartburn', e, dmg * 0.7, src, tsrc); break;
    case 'fire+shock': battery(e, dmg); break;
    case 'fire+poison': if (sick(e)) reactDo('penicillin', e, dmg * 0.5, src, tsrc); break;
    case 'arcane+fire': e.bloodT = Math.max(e.bloodT || 0, 3); e.bloodDps = Math.max(e.bloodDps || 0, dmg * 0.5); e.burn = Math.max(e.burn, 3); setBurn(e, dmg * 0.8, tw.name); break;
    case 'fire+phys': if (e.armour > 0) e.armour = Math.max(0, e.armour - (e.boss ? 1 : 2)); break;
    case 'ice+shock': e.shred = Math.min(e.armour + 6, e.shred + 4); aoe(e.x, e.y, 60, dmg * 0.5, tsrc, '#bde0fe'); break;
    case 'ice+poison': reactDo('snotrocket', e, dmg, src, tsrc); break;
    case 'arcane+ice': if (plain) { e.dazeT = Math.max(e.dazeT || 0, G.t + 1); floatText(e.x, e.y - e.r - 12, 'SCABBED', '#ff758f', 11, 0.6); } break;
    case 'ice+phys': {
      e.chill = 2.5; e.chillAmt = Math.min(0.6, e.chillAmt + 0.2);
      if (plain) { const p = me(), dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; e.kx += dx / d * 420; e.ky += dy / d * 420; }
      break;
    }
    case 'poison+shock':
      IN_AOE = true;
      forNear(e.x, e.y, 65, o => { damageEnemy(o, dmg * 0.5, tsrc); if (!o.dead) addSick(o, 1, dmg * 0.1, tw.name); });
      IN_AOE = false;
      ring(e.x, e.y, 65, '#ffba08', 0.35, 4); break;
    case 'arcane+shock':
      if (plain && e.hp < e.maxHp * 0.3 && !e.charmed) { e.charmed = true; e.charmT = 5; e.frozen = 0; e.allyT = null; ring(e.x, e.y, e.r + 12, PAL.you, 0.4, 3); floatText(e.x, e.y - e.r - 12, 'FLATLINED', '#ff758f', 11, 0.7); }
      break;
    case 'phys+shock': if (!G.absorbOn && !(G.absorbT > G.t)) { G.absorbOn = true; const p = me(); ring(p.x, p.y, 34, '#ffe94a', 0.4, 3); } break;
    case 'phys+poison':
      IN_AOE = true;
      forNear(e.x, e.y, 75, o => { if (o !== e) damageEnemy(o, Math.max(dmg * 0.5, (e.dmg || 5) * 3), tsrc); });
      IN_AOE = false;
      ring(e.x, e.y, 75, '#ffe5b4', 0.3, 3); break;
    case 'fire+fire': if (e.armour > 0) e.armour = Math.max(0, e.armour - 1); break;
    case 'ice+ice': if (plain) { e.frozen = Math.max(e.frozen, 1.4); e.chillAmt = 0.2; } break;
    case 'shock+shock': {
      let k = 0;
      for (const n of acquireMany('nearest', 160, e.x, e.y, 4)) { if (n === e || k >= 3) continue; k++; bolt(e.x, e.y, n.x, n.y, '#ffe94a', 0.14); damageEnemy(n, dmg * 0.4, tsrc); }
      break;
    }
    case 'poison+poison': addSick(e, 2, dmg * 0.14, tw.name); break;
    case 'phys+phys': if (plain) { const p = me(), dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; e.kx += dx / d * 500; e.ky += dy / d * 500; } break;
    // (arcane+poison, arcane+arcane and arcane+phys work on kills and in twistMul)
  }
}
// An enemy dies to a twisted combo.
function twistKill(e, src) {
  if (!src || !src.combo || !G.combo) return;
  const t = activeTwists().find(x => x.c.id === src.combo);
  if (!t) return;
  const k = t.tw.key, tsrc = { noStatus: true, noArc: true, noCrit: true, noProc: true, wname: t.tw.name };
  if (k === 'arcane+poison' && !e.boss) {
    const n = acquire('nearest', 300, e.x, e.y, e);
    if (n) { bolt(e.x, e.y, n.x, n.y, '#ff758f', 0.25); damageEnemy(n, Math.min(e.maxHp * 0.5, (src.w && src.w.s ? src.w.s.dmg : 20) * 6), Object.assign({ elem: 'arcane' }, tsrc)); }
  }
  if (k === 'arcane+arcane' && e.bloodT > 0 && (G.hexBoomF !== G.frameN)) {
    G.hexBoomF = G.frameN;
    aoe(e.x, e.y, 75, Math.min(e.maxHp * 0.3, (src.w && src.w.s ? src.w.s.dmg : 20) * 5), Object.assign({ elem: 'arcane' }, tsrc), '#c9184a');
  }
}
// For a Switched at Birth card: what switching this weapon to elem would do to its combos (fused or not).
function elemTwistNote(w, elem) {
  const out = [];
  for (const c of COMBOS) {
    if (c.a !== w.id && c.b !== w.id) continue;
    const other = owned(c.a === w.id ? c.b : c.a);
    if (!other) continue; // (only combos you could actually make)
    const eo = wElemOf(other);
    const tw = c.a === w.id ? twistFor(c, elem, eo) : twistFor(c, eo, elem);
    if (tw) out.push(`${c.name} gets the ${tw.name} twist`);
  }
  return out.length ? ' Combo chemistry: ' + out.slice(0, 2).join('; ') + '.' : '';
}
