'use strict';
// Spawn Prawn - chemistry. Six elements: Force, Acid, Base, Static, Ethanol and Voodoo (the internal keys are
// phys, fire, ice, shock, poison and arcane). Each leaves a status on what it hits:
//   Acid    - corroding: damage over time that eats a little armour as it goes (e.burn).
//   Base    - lathered: slower, and slides further when hit (e.chill); enough and it saponifies: soap, stuck solid (e.frozen).
//   Static  - charged: damage it takes arcs to a neighbour, and drags that neighbour closer (e.shock).
//   Ethanol - drunk: stacking damage over time, and it weaves about (e.poison, e.poisonStacks).
//   Voodoo  - hexed: takes more from everything; the hex passes on when it dies (e.mark).
// When an element lands on something already carrying another's status, they react (REACTIONS in data.js).
// Combos have chemistry too: fuse two weapons whose elements are not their usual ones (Switched at Birth)
// and the combo picks up a TWIST from the pair of elements it is made of.
// Hooks: applyElement and chemForce (damageEnemy), chemTick (status upkeep), chemWobble (enemy steering),
// chemMul (damage taken), chemKill, chemHaste (fire rate), chemDamageIn (damage to you), chemComboHit.

const CHEM = { healGap: 0.5, chargeK: 0.12 };
const drunk = e => e.poison > 0 && e.poisonStacks > 0;
const lathered = e => e.chill > 0 || e.frozen > 0;

function applyElement(e, elem, dmg, src) {
  const P = G.P, syn = G.synergy, rm = P.react;
  const rsrc = { elem, noStatus: true, noArc: true, noCrit: true, wname: 'Reactions' };
  switch (elem) {
    case 'fire': // Acid
      if (lathered(e) && react(e, 'neutral', src)) { neutralise(e, dmg, rsrc); return; }
      if (e.shock > 0 && react(e, 'battery', src)) { e.shock = 0; battery(e, dmg); }
      else if (drunk(e) && react(e, 'ester', src)) ester(e, dmg, rsrc);
      e.burn = syn.fire ? 4.5 : 3;
      setBurn(e, dmg * 0.4 * (syn.fire ? 1.5 : 1) * P.elem.fire, src);
      break;
    case 'ice': { // Base
      if (e.burn > 0 && react(e, 'neutral', src)) { neutralise(e, dmg, rsrc); return; }
      if (drunk(e) && react(e, 'sanitiser', src)) sanitise(e, dmg, rsrc);
      e.chill = 2.5;
      e.chillAmt = Math.min(0.6, e.chillAmt + 0.14 * P.elem.ice);
      const thresh = syn.ice ? 0.3 : 0.58;
      if (e.chillAmt >= thresh && e.frozen <= 0) { e.frozen = e.boss ? 0.4 : 1.3; e.chillAmt = 0.2; }
      break;
    }
    case 'shock': // Static
      if (drunk(e) && e.poisonStacks >= 2 && react(e, 'flashpoint', src)) flashpoint(e, dmg, rsrc);
      else if (e.burn > 0 && react(e, 'battery', src)) battery(e, dmg);
      else if (lathered(e) && react(e, 'electro', src)) {
        e.shred = Math.min(e.armour + 6, e.shred + 6 * rm);
        aoe(e.x, e.y, 55, dmg * 0.6 * rm, rsrc, '#bde0fe');
      }
      e.shock = 2.2;
      break;
    case 'poison': // Ethanol
      e.poison = 4;
      e.poisonStacks = Math.min(P.poisonCap, e.poisonStacks + 1);
      setPoison(e, dmg * 0.14 * P.elem.poison, src);
      if (e.shock > 0 && e.poisonStacks >= 2 && react(e, 'flashpoint', src)) flashpoint(e, dmg, rsrc);
      else if (e.burn > 0 && react(e, 'ester', src)) ester(e, dmg, rsrc);
      else if (lathered(e) && react(e, 'sanitiser', src)) sanitise(e, dmg, rsrc);
      else if (e.poisonStacks >= P.poisonCap && !(e.hangT > G.t) && react(e, 'blackout', src)) {
        e.dazeT = G.t + (e.boss ? 0.5 : 2); e.hangT = G.t + 7;
        floatText(e.x, e.y - e.r - 26, 'zzz', '#cdb4db', 12, 0.9);
      }
      break;
    case 'arcane': // Voodoo
      if ((e.burn > 0 || e.chill > 0 || e.poison > 0 || e.shock > 0) && react(e, 'sympathy', src)) {
        damageEnemy(e, dmg * 1.0 * rm, rsrc);
        for (const n of acquireMany('nearest', 140, e.x, e.y, 3)) {
          if (n === e || n.dead) continue;
          if (e.burn > 0) { n.burn = Math.max(n.burn, 2.5); setBurn(n, e.burnDps * 0.7, e.burnBy); }
          if (e.chill > 0) { n.chill = 2.5; n.chillAmt = Math.max(n.chillAmt, e.chillAmt * 0.7); }
          if (e.shock > 0) n.shock = Math.max(n.shock, 2.2);
          if (e.poison > 0) { n.poison = 4; n.poisonStacks = Math.min(P.poisonCap, Math.max(n.poisonStacks, Math.ceil(e.poisonStacks / 2))); setPoison(n, e.poisonDps, e.poisonBy); }
          n.mark = 3;
          bolt(e.x, e.y, n.x, n.y, '#e0aaff', 0.15);
        }
        ring(e.x, e.y, 50, '#e0aaff', 0.3);
      }
      e.mark = 3;
      break;
  }
}
// Acid meets Base: both cancel, a hot burst, and the salt water does you good.
function neutralise(e, dmg, rsrc) {
  e.burn = 0; e.chill = 0; e.chillAmt = 0; e.frozen = 0;
  aoe(e.x, e.y, 75, (dmg * 1.8 + 8) * G.P.react * (G.pair.hotcold ? 2 : 1), rsrc, '#e6f4ff');
  fxParts('bubble', e.x, e.y, '#e6f4ff', 6, 90, 0.7, 3, -Math.PI / 2, 0.8);
  if (!(G.saltT > G.t)) { G.saltT = G.t + CHEM.healGap; healPlayer(G.P.maxHp * 0.01, true); }
}
// Acid meets Static: a battery. It zaps its neighbours for a couple of seconds, and charges you up.
function battery(e, dmg) {
  e.battT = G.t + 2; e.battD = Math.max(e.battD && e.battT > G.t ? e.battD : 0, dmg * 0.5 * G.P.react); e.battZ = 0;
  if (!(G.chargeUpT > G.t)) { const p = me(); floatText(p.x, p.y - 30, 'CHARGED UP', '#f4ff8a', 12, 0.8); }
  G.chargeUpT = G.t + 3;
}
// Acid on Ethanol: pear drops. Everything nearby comes over for a sniff.
function ester(e, dmg, rsrc) {
  forNear(e.x, e.y, 170, o => {
    if (o === e || o.boss || o.rival || o.egg || o.charmed) return;
    const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1;
    o.kx += dx / d * 300; o.ky += dy / d * 300;
  });
  damageEnemy(e, dmg * 0.6 * G.P.react, rsrc);
  ring(e.x, e.y, 170, '#ffd6a5', 0.5, 3);
}
// Static on Ethanol: the fumes go up.
function flashpoint(e, dmg, rsrc) {
  const boom = (e.poisonDps * e.poisonStacks * 2.5 + dmg) * G.P.react;
  e.poison = 0; e.poisonStacks = 0;
  aoe(e.x, e.y, 80, boom, rsrc, '#ffba08');
}
// Base on Ethanol: hand sanitiser. Kills 99.9% of germs.
function sanitise(e, dmg, rsrc) {
  e.poison = 0; e.poisonStacks = 0;
  let n = 0;
  forNear(e.x, e.y, 95, o => {
    if (o.boss || o.rival || o.egg || o.charmed || o.dead) return;
    if (o.hp < o.maxHp * 0.12) { n++; damageEnemy(o, o.hp * 3 + 20, rsrc); }
    else damageEnemy(o, dmg * 0.6 * G.P.react, rsrc);
  });
  ring(e.x, e.y, 95, '#d0f4de', 0.4, 4);
  if (n >= 2) floatText(e.x, e.y - e.r - 26, '99.9%', '#d0f4de', 12, 0.8);
}
// Force hits (from damageEnemy, for weapons whose element is Force): soap bursts, drunks fall over.
function chemForce(e, dmg, src) {
  if (src.noStatus || src.dot || e.dead || e.boss) return;
  if (e.frozen > 0 && !(G.pair.icehockey && src.w && src.w.id === 'paddle') && react(e, 'suds', src)) {
    e.frozen = 0; e.chillAmt = 0;
    aoe(e.x, e.y, 70 + e.r, (dmg * 1.5 + 8) * G.P.react, { elem: 'ice', noStatus: true, noArc: true, noCrit: true, wname: 'Reactions' }, '#e6f4ff');
    fxParts('bubble', e.x, e.y, '#e6f4ff', 10, 200, 0.6, 4, -Math.PI / 2, 1);
  } else if (drunk(e) && e.poisonStacks >= 3 && !(e.dazeT > G.t) && react(e, 'pushover', src)) {
    const p = me(), dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
    e.dazeT = G.t + 1.2; e.kx += dx / d * 420; e.ky += dy / d * 420;
  }
}
// Per enemy per frame (status upkeep): corrosion eats armour; batteries zap.
function chemTick(e, dt) {
  if (e.burn > 0 && e.armour > 0) e.shred = Math.min(e.armour + 4, e.shred + dt * 0.8);
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
// Drunk enemies weave about (the more rounds, the worse). Returns the angle to turn their steering by.
const chemWobble = e => (drunk(e) && !e.boss ? Math.sin(e.age * 3.1 + (e.id || 0)) * Math.min(1, e.poisonStacks * 0.12) : 0);
// Damage taken: hungover enemies take more.
const chemMul = e => (e.hangT > G.t ? 1.25 : 1);
// A hexed enemy dies: the hex passes to the nearest one.
function chemKill(e, src) {
  if (e.mark > 0) { const n = acquire('nearest', 220, e.x, e.y, e); if (n) { n.mark = Math.max(n.mark, 3); bolt(e.x, e.y, n.x, n.y, '#c77dff', 0.15); } }
  twistKill(e, src);
}
const chemHaste = () => (G.chargeUpT > G.t ? 1 + CHEM.chargeK : 1);
// Damage coming at you: Shock Absorber's barrier.
function chemDamageIn(dmg) {
  if (dmg > 0 && G.absorbOn) { G.absorbOn = false; G.absorbT = G.t + 8; const p = me(); ring(p.x, p.y, 40, '#ffe94a', 0.4, 4); floatText(p.x, p.y - 26, 'ABSORBED', '#ffe94a', 12, 0.7); p.iframes = Math.max(p.iframes || 0, 0.3); return 0; }
  return dmg;
}

// ---------------------------------------------------------------- combo twists
// A combo made of two weapons on their usual elements does what it says. Change either element (Switched at
// Birth) and the combo takes on the chemistry of the new pair: a TWIST. It fires on every hit the combo itself
// deals, and now and then on either weapon's own hits.
const TWISTS = {
  'fire+ice':      { name: 'Neutral Ground', desc: 'Combo hits neutralise: a hot burst round the target, and the salt water heals you a little.' },
  'fire+shock':    { name: 'Car Battery',    desc: 'Combo hits turn the target into a battery that zaps its neighbours for 2s.' },
  'fire+poison':   { name: 'Pear Drops',     desc: 'Combo hits make the target smell of pear drops: everything nearby is drawn in for a sniff.' },
  'arcane+fire':   { name: 'Curdled Curse',  desc: 'Combo hits hex the target and corrode it, hard.' },
  'fire+phys':     { name: 'Acid Wash',      desc: 'Combo hits strip 2 armour for good (1 from bosses).' },
  'ice+shock':     { name: 'Hydrogen Pop',   desc: 'Combo hits split water: a small pop round the target that strips armour.' },
  'ice+poison':    { name: 'Hand Sanitiser', desc: 'Combo hits kill 99.9% of germs: ordinary enemies near the target on 15% health or less die.' },
  'arcane+ice':    { name: 'Soap Opera',     desc: 'Combo hits are so dramatic the target faints for a second (not bosses).' },
  'ice+phys':      { name: 'Slip and Slide', desc: 'Combo hits lather the target and send it skidding a long way.' },
  'poison+shock':  { name: 'Lit Up',         desc: 'Combo hits light the fumes: a small blast that gets everything in it a round drunker.' },
  'arcane+shock':  { name: 'Seance',         desc: 'Combo hits possess badly hurt enemies (under 30% health): they fight for you for 5s.' },
  'phys+shock':    { name: 'Crumple Zone',  desc: 'Combo hits charge a barrier that blocks the next hit you take (recharges after 8s).' },
  'arcane+poison': { name: 'Spirits',        desc: 'Enemies the combo kills give up their spirit: it flies into the nearest enemy for a share of their health.' },
  'phys+poison':   { name: 'Bar Fight',      desc: 'Combo hits start a bar fight: the target swings at everything next to it.' },
  'arcane+phys':   { name: 'Pin Cushion',    desc: 'Every 4th combo hit on the same enemy deals triple damage.' },
  'fire+fire':     { name: 'Concentrated',   desc: 'Combo hits deal +35% damage and eat 1 armour.' },
  'ice+ice':       { name: 'Lye',            desc: 'Combo hits saponify ordinary enemies on the spot.' },
  'shock+shock':   { name: 'Supercharged',   desc: 'Combo hits arc on to three more enemies.' },
  'poison+poison': { name: 'Double Shot',    desc: 'Combo hits pour two rounds of Ethanol at once.' },
  'arcane+arcane': { name: 'Hex Bomb',       desc: 'Hexed enemies the combo kills explode.' },
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
  if (tw.key === 'arcane+phys') { e.pinN = (e.pinN || 0) + 1; if (e.pinN % 4 === 0) { floatText(e.x, e.y - e.r - 12, 'PIN', '#c77dff', 12, 0.5); return 3; } }
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
    case 'fire+ice': neutralise(e, dmg * 0.7, tsrc); break;
    case 'fire+shock': battery(e, dmg); break;
    case 'fire+poison': ester(e, dmg * 0.5, tsrc); break;
    case 'arcane+fire': e.mark = Math.max(e.mark, 3); e.burn = Math.max(e.burn, 3); setBurn(e, dmg * 0.8, tw.name); break;
    case 'fire+phys': if (e.armour > 0) e.armour = Math.max(0, e.armour - (e.boss ? 1 : 2)); break;
    case 'ice+shock': e.shred = Math.min(e.armour + 6, e.shred + 4); aoe(e.x, e.y, 60, dmg * 0.5, tsrc, '#bde0fe'); break;
    case 'ice+poison':
      forNear(e.x, e.y, 90, o => { if (!o.boss && !o.rival && !o.egg && !o.charmed && !o.dead && o.hp < o.maxHp * 0.15) damageEnemy(o, o.hp * 3 + 20, tsrc); });
      ring(e.x, e.y, 90, '#d0f4de', 0.35, 3); break;
    case 'arcane+ice': if (plain) { e.dazeT = Math.max(e.dazeT || 0, G.t + 1); floatText(e.x, e.y - e.r - 12, 'FAINTS', '#e0aaff', 11, 0.6); } break;
    case 'ice+phys': {
      e.chill = 2.5; e.chillAmt = Math.min(0.6, e.chillAmt + 0.2);
      if (plain) { const p = me(), dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; e.kx += dx / d * 420; e.ky += dy / d * 420; }
      break;
    }
    case 'poison+shock':
      IN_AOE = true;
      forNear(e.x, e.y, 65, o => { damageEnemy(o, dmg * 0.5, tsrc); if (!o.dead) { o.poison = 4; o.poisonStacks = Math.min(P.poisonCap, o.poisonStacks + 1); setPoison(o, dmg * 0.1, tw.name); } });
      IN_AOE = false;
      ring(e.x, e.y, 65, '#ffba08', 0.35, 4); break;
    case 'arcane+shock':
      if (plain && e.hp < e.maxHp * 0.3 && !e.charmed) { e.charmed = true; e.charmT = 5; e.frozen = 0; e.allyT = null; ring(e.x, e.y, e.r + 12, PAL.you, 0.4, 3); floatText(e.x, e.y - e.r - 12, 'POSSESSED', '#e0aaff', 11, 0.7); }
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
    case 'poison+poison': e.poison = 4; e.poisonStacks = Math.min(P.poisonCap, e.poisonStacks + 2); setPoison(e, dmg * 0.14, tw.name); break;
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
    if (n) { bolt(e.x, e.y, n.x, n.y, '#e0aaff', 0.25); damageEnemy(n, Math.min(e.maxHp * 0.5, (src.w && src.w.s ? src.w.s.dmg : 20) * 6), Object.assign({ elem: 'arcane' }, tsrc)); }
  }
  if (k === 'arcane+arcane' && e.mark > 0 && (G.hexBoomF !== G.frameN)) {
    G.hexBoomF = G.frameN;
    aoe(e.x, e.y, 75, Math.min(e.maxHp * 0.3, (src.w && src.w.s ? src.w.s.dmg : 20) * 5), Object.assign({ elem: 'arcane' }, tsrc), '#c77dff');
  }
}
// For a Switched at Birth card: what switching this weapon to elem would do to its combos (fused or not).
function elemTwistNote(w, elem) {
  const out = [];
  for (const c of COMBOS) {
    if (c.a !== w.id && c.b !== w.id) continue;
    const other = owned(c.a === w.id ? c.b : c.a);
    const eo = other ? wElemOf(other) : WEAPONS[c.a === w.id ? c.b : c.a].elem;
    const tw = c.a === w.id ? twistFor(c, elem, eo) : twistFor(c, eo, elem);
    if (tw) out.push(`${c.name} gets the ${tw.name} twist`);
  }
  return out.length ? ' Combo chemistry: ' + out.slice(0, 2).join('; ') + '.' : '';
}
