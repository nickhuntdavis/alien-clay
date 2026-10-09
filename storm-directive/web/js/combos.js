'use strict';
// Spawn Prawn - Weapon Combos. Two weapons you own, both at Lv 5 or more, can be fused into a combo (a
// guaranteed card in your next box). Both keep firing as they were, they gain the combo's new power, and
// the fusion opens a bonus weapon mount with a draft straight away (two bonus mounts a run at most).
// Most combos pair weapons from the same sequence, so any run can find them; a few need a splice.

const COMBO_LEVEL = 5;
const COMBO_MOUNTS = 2; // bonus mounts a run can earn from combos
const COMBOS = [
  // Vanguard
  { id: 'bigsib',     a: 'blaster', b: 'seeker',  name: 'Big Sibling',        desc: 'Every 5th Spitball volley also launches a huge homing Big Sibling that explodes on impact.' },
  { id: 'spityoyo',   a: 'blaster', b: 'glaive',  name: 'Swapping Spit',         desc: 'Yo-yos spit Spitballs at whatever is near them while they fly.' },
  // Bruiser
  { id: 'whackamole', a: 'paddle',  b: 'mines',   name: 'Whack-a-Mole',       desc: 'Paddle hits plant a Nappy Mine under the enemy, armed almost at once.' },
  { id: 'porcupine',  a: 'onesie',  b: 'shotgun', name: 'Porcupine Hug',      desc: 'Every Onesie pulse fires a ring of Scattergun pellets outwards.' },
  // Mitochondrial Nerd
  { id: 'teacup',     a: 'void',    b: 'tesla',   name: 'Storm in a Teacup',  desc: 'Gravity orbs crackle: each one throws a Static Cling chain at what it is pulling in.' },
  { id: 'partyline',  a: 'twin',    b: 'tesla',   name: 'Party Line',         desc: 'Every second, each twin sends a Static Cling chain into the crowd.' },
  // Egg-Seeker
  { id: 'coldcase',   a: 'duedate', b: 'frost',   name: 'Clean Slate',          desc: 'When a Due Date goes off, everything near it is saponified and takes a burst of antacid.' },
  { id: 'coldcomfort', a: 'toothfairy', b: 'frost', name: 'Soap in the Mouth',     desc: 'Tooth Fairy smites saponify their victim. A saponified victim takes double.' },
  // Stealth-Tadpole
  { id: 'whiplash',   a: 'flail',   b: 'wake',    name: 'Whiplash',           desc: 'Every lash leaves a strip of viral trail along its length.' },
  { id: 'ghosttrail', a: 'peekaboo', b: 'wake',   name: 'Silent but Deadly',        desc: 'While you are hidden, your viral trail hits 2.5x as hard. The BOO leaves a ring of it round the spot.' },
  // Enzyme-Pusher
  { id: 'wormfarm',   a: 'bubble',  b: 'parasite', name: 'Worm Farm',         desc: 'Anything trapped in a bubble catches Tapeworm. Bubble pops hit infected enemies 50% harder.' },
  { id: 'bubblehalo', a: 'orbit',   b: 'bubble',  name: 'Bubble Halo',        desc: 'Your angels blow bubbles at small enemies near them.' },
  // Acid-Burner
  { id: 'flashpoint', a: 'venom',   b: 'flamer',  name: 'Flash Point',        desc: 'Heartburn reacts with your puddles: each one in range erupts in an acid burst every second.' },
  { id: 'sticky',     a: 'redtape', b: 'venom',   name: 'Sticky Situation',   desc: 'Taped bundles drip: a boozy puddle forms under each one every second.' },
  // Gene-Splicer
  { id: 'jointhedots', a: 'crayon', b: 'friend',  name: 'Drawn Together',      desc: 'Every 3s, the shape between you and your Imaginary Friend is coloured in.' },
  { id: 'invisishield', a: 'friend', b: 'siphon', name: 'Fall Guy',   desc: 'Your Imaginary Friend catches enemy bullets and feeds them to the Siphon.' },
];
const COMBO_BY = Object.fromEntries(COMBOS.map(c => [c.id, c]));

const comboOn = id => !!(G && G.combo && G.combo[id]);
const comboW = id => owned(id);
const comboIdOf = name => { const c = COMBOS.find(x => x.name === name); return c ? c.id : null; };
const comboSrc = (w, name, extra) => Object.assign(weaponSrc(w), { wname: name, noProc: true, combo: comboIdOf(name) }, extra || {});

// ---------------------------------------------------------------- offering and fusing
function availableCombos() {
  if (!G.combo) G.combo = {};
  const out = [];
  for (const c of COMBOS) {
    if (G.combo[c.id]) continue;
    const a = owned(c.a), b = owned(c.b);
    if (a && b && a.lvl >= COMBO_LEVEL && b.lvl >= COMBO_LEVEL) out.push(c);
  }
  return out;
}
function optCombo(c) {
  const A = WEAPONS[c.a], B = WEAPONS[c.b], mount = (G.comboMounts || 0) < COMBO_MOUNTS, tw = comboTwist(c);
  return { def: A, rarity: 4, tag: 'COMBO', icon: A.icon + B.icon, color: '#ff3df2', elem: A.elem, title: c.name, fusion: true,
    sub: `${A.name} + ${B.name}`, desc: c.desc + (tw ? ` ${twistLabel(tw)}: ${tw.desc}` : '') + (mount ? ' Both keep firing, and you get a bonus weapon mount.' : ' Both keep firing.'),
    apply: () => comboFuse(c) };
}
function comboFuse(c) {
  G.combo = G.combo || {};
  G.combo[c.id] = true;
  for (const id of [c.a, c.b]) { const w = owned(id); if (w) w.combos = (w.combos || []).concat(c.id); }
  const first = !(META.combos || {})[c.id];
  META.combos = META.combos || {}; META.combos[c.id] = true; saveMeta();
  G.stats.merges = (G.stats.merges || 0) + 1;
  banner('COMBO: ' + c.name.toUpperCase(), '#ff3df2');
  const tw = comboTwist(c);
  sysMsg(first ? 'NEW COMBO' : 'COMBO', `${WEAPONS[c.a].name} + ${WEAPONS[c.b].name}: ${c.desc}` + (tw ? ` ${twistLabel(tw)}: ${tw.desc}` : ''), '#ff3df2', true);
  if (tw) { META.twists = META.twists || {}; META.twists[tw.key] = true; G.twistAt = 0; }
  const p = me();
  ring(p.x, p.y, 160, '#ff3df2', 0.6, 8); addLight(p.x, p.y, 300, '#ff3df2', 0.6);
  cam.shake = Math.min(12, cam.shake + 6); sfx('level'); vibrate([40, 30, 80]);
  achieve('fusion'); sysLine('fusion'); addViewers(15000);
  if ((G.comboMounts || 0) < COMBO_MOUNTS) {
    G.comboMounts = (G.comboMounts || 0) + 1;
    G.weapons.push(null);
    G.lootQueue.push({ kind: 'slot' });
  }
  recomputeAll();
}
// For a new-weapon card: what it combos with.
function comboHint(id) {
  // (Only partners you already own: the rest would just be noise on the card.)
  const cs = COMBOS.filter(c => (c.a === id && owned(c.b)) || (c.b === id && owned(c.a)));
  if (!cs.length) return '';
  return ' Combos with your ' + cs.map(c => WEAPONS[c.a === id ? c.b : c.a].name).join(' / ') + '.';
}

// ---------------------------------------------------------------- hooks
// After one of your weapons fires.
function comboFire(w, target) {
  if (!G.combo || w.echo || !target) return;
  if (w.id === 'blaster' && comboOn('bigsib')) {
    w.sibN = (w.sibN || 0) + 1;
    const sw = comboW('seeker');
    if (sw && w.sibN % 5 === 0) {
      const p = me(), a = Math.atan2(target.y - p.y, target.x - p.x);
      const pr = spawnProj(sw, p.x, p.y, a, comboSrc(sw, 'Big Sibling'), { dmg: sw.s.dmg * 3.5, r: 11, explode: 80, homing: 8, pierce: 0, noMods: true, color: '#5fd4e8' });
      if (pr) { pr.tgt = target; floatText(p.x, p.y - 30, 'BIG SIBLING', '#5fd4e8', 13, 0.6); }
    }
  }
}
// Every hit by one of your weapons (not damage over time).
function comboHit(e, dmg, src) {
  if (!G.combo || !src.w || src.w.echo || e.dead) return;
  const id = src.w.id;
  if (id === 'paddle' && comboOn('whackamole') && !(G.moleT > G.t) && G.proj.length < CAPS.proj) {
    const mw = comboW('mines');
    if (mw) { G.moleT = G.t + 1; const m = mineDrop(mw, e.x, e.y); m.arm = 0.15; G.proj.push(m); floatText(e.x, e.y - e.r - 10, 'WHACK', '#ff924c', 12, 0.4); }
  }
  if (id === 'duedate' && src.due && comboOn('coldcase')) {
    const fw = comboW('frost');
    if (fw) {
      const fs = comboSrc(fw, 'Clean Slate');
      IN_AOE = true;
      forNear(e.x, e.y, 150, o => { if (!o.charmed) { if (!o.boss && !o.rival) o.frozen = Math.max(o.frozen, 1.8); damageEnemy(o, fw.s.dmg, fs); } });
      IN_AOE = false;
      ring(e.x, e.y, 150, '#bde0fe', 0.5, 5); fxParts('shard', e.x, e.y, '#bde0fe', 10, 220, 0.5, 4);
    }
  }
  if (id === 'toothfairy' && comboOn('coldcomfort') && !e.boss && !e.rival) e.frozen = Math.max(e.frozen, 1.5);
}
function comboDamageMul(e, src) {
  if (!G.combo || !src.w) return 1;
  const id = src.w.id;
  let m = 1;
  if (id === 'wake' && comboOn('ghosttrail') && peekHidden()) m *= 2.5;
  if (id === 'toothfairy' && comboOn('coldcomfort') && e.frozen > 0) m *= 2;
  if (id === 'bubble' && comboOn('wormfarm') && e.parasiteT > 0) m *= 1.5;
  return m;
}
// From onesiePulse.
function comboPulse(w) {
  if (!comboOn('porcupine') || w.echo) return;
  const sg = comboW('shotgun');
  if (!sg) return;
  const p = me(), src = comboSrc(sg, 'Porcupine Hug'), n = 12, off = Math.random() * TAU;
  for (let i = 0; i < n; i++) spawnProj(sg, p.x, p.y, off + i / n * TAU, src, { dmg: sg.s.dmg * 0.7, noMods: true });
}
// From meleeLash.
function comboLash(w, x, y, a, L) {
  if (w.id !== 'flail' || w.echo || !comboOn('whiplash') || G.zones.length > 300) return;
  const ww = comboW('wake');
  if (!ww) return;
  for (let k = 1; k <= 3; k++) { const z = wakeZone(ww, x + Math.cos(a) * L * k / 3, y + Math.sin(a) * L * k / 3); z.dps *= 0.7; z.src = Object.assign({}, z.src, { wname: 'Whiplash' }); G.zones.push(z); }
}
// From peekBoo.
function comboBoo(w, x, y) {
  if (w.echo || !comboOn('ghosttrail') || G.zones.length > 300) return;
  const ww = comboW('wake');
  if (!ww) return;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const z = wakeZone(ww, x + Math.cos(a) * 95, y + Math.sin(a) * 95); z.life = z.max = z.max * 1.5; G.zones.push(z); }
}
const cmbEvery = (key, gap) => { const T = G.cmbT || (G.cmbT = {}); if ((T[key] || 0) > G.t) return false; T[key] = G.t + gap; return true; };
// Per frame.
function comboTick(dt) {
  if (!G.combo) return;
  const p = me();
  if (comboOn('spityoyo') && cmbEvery('spit', 0.35)) {
    const bw = comboW('blaster'), gw = comboW('glaive');
    if (bw && gw) {
      let n = 0;
      for (const pr of G.proj) {
        if (pr.dead || pr.w !== gw || n >= 4) continue;
        const t = acquire('nearest', 260, pr.x, pr.y);
        if (!t) continue;
        n++;
        spawnProj(bw, pr.x, pr.y, Math.atan2(t.y - pr.y, t.x - pr.x), comboSrc(bw, 'Swapping Spit'), { dmg: bw.s.dmg * 0.6, noMods: true });
      }
    }
  }
  if (comboOn('teacup') && cmbEvery('teacup', 0.6)) {
    const vw = comboW('void'), tw = comboW('tesla');
    if (vw && tw) {
      let n = 0;
      for (const pr of G.proj) {
        if (pr.dead || pr.w !== vw || pr.style !== 'void' || n >= 5) continue;
        const t = acquire('nearest', 220, pr.x, pr.y);
        if (!t) continue;
        n++;
        doChain(pr.x, pr.y, t, tw.s.dmg * 0.7, 2, tw.s.jump || 150, comboSrc(tw, 'Storm in a Teacup'));
      }
    }
  }
  if (comboOn('partyline') && cmbEvery('party', 1)) {
    const ww = comboW('twin'), tw = comboW('tesla');
    if (ww && tw && ww.anchor) for (const q of twinPoints(ww)) {
      const t = acquire('nearest', 260, q.x, q.y);
      if (t) doChain(q.x, q.y, t, tw.s.dmg * 0.8, tw.s.chain || 2, tw.s.jump || 150, comboSrc(tw, 'Party Line'));
    }
  }
  if (comboOn('wormfarm')) {
    const pw = comboW('parasite');
    if (pw) for (const B of (G.toy && G.toy.bubbles) || []) { const e = B.e; if (e && !e.dead && !e.boss && !(e.parasiteT > 0)) { e.parasiteW = pw; e.parasiteT = 6; } }
  }
  if (comboOn('bubblehalo') && cmbEvery('halo', 2.5)) {
    const ow = comboW('orbit'), bw = comboW('bubble'), T = TOYS();
    if (ow && bw && ow.blades.length) for (let i = 0; i < ow.blades.length && T.bubbles.length < 40; i += 3) {
      const x = ow.blades[i], y = ow.blades[i + 1], t = acquire('nearest', 240, x, y);
      if (!t || !canBubble(bw, t)) continue;
      const a = Math.atan2(t.y - y, t.x - x), sp = bw.s.speed || 260;
      T.bubbles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: bw.s.size, life: 2.6, w: bw, e: null, seed: Math.random() * 10 });
    }
  }
  if (comboOn('flashpoint') && cmbEvery('flash', 1)) {
    const fw = comboW('flamer');
    if (fw) {
      const R = (fw.s.range || 200) * 1.6, src = comboSrc(fw, 'Flash Point', { elem: 'fire', noCrit: true });
      let n = 0;
      for (const z of G.zones) {
        if (!z.venom || z.life <= 0 || n >= 4 || Math.hypot(z.x - p.x, z.y - p.y) > R) continue;
        n++;
        aoe(z.x, z.y, z.r * 1.1, fw.s.dmg * 3.5, src, '#ff7a2f');
        fxParts('ember', z.x, z.y, '#ff9e00', 6, 160, 0.5, 3);
      }
    }
  }
  if (comboOn('sticky') && cmbEvery('sticky', 1) && G.zones.length < 280) {
    const vw = comboW('venom');
    if (vw) for (const B of ((G.toy && G.toy.tapes) || []).slice(0, 6)) {
      const m = B.members && B.members.find(e => !e.dead);
      if (!m) continue;
      const z = venomZone(vw, m.x, m.y); z.r *= 0.7; z.life = z.max = 2.5; G.zones.push(z);
    }
  }
  if (comboOn('jointhedots') && cmbEvery('dots', 3)) {
    const fw = comboW('friend'), cw = comboW('crayon'), f = fw && fw.friends && fw.friends.find(q => G.t - q.born > (q.delay || 2));
    if (cw && f) {
      const dx = f.x - p.x, dy = f.y - p.y, d = Math.hypot(dx, dy);
      if (d > 90) {
        const mx = (p.x + f.x) / 2, my = (p.y + f.y) / 2, nx = -dy / d * d * 0.45, ny = dx / d * d * 0.45;
        colourIn(cw, [{ x: p.x, y: p.y }, { x: mx + nx, y: my + ny }, { x: f.x, y: f.y }, { x: mx - nx, y: my - ny }], false);
      }
    }
  }
  if (comboOn('invisishield')) {
    const fw = comboW('friend'), sw = comboW('siphon');
    if (fw && sw) for (const f of fw.friends || []) {
      if (G.t - f.born < (f.delay || 2)) continue;
      for (const b of G.ebul) {
        if (b.dead || Math.abs(b.x - f.x) > 34 || Math.abs(b.y - f.y) > 34) continue;
        b.dead = true; siphonStore(sw, siphonStrength(b)); siphonAte(sw, b);
        spawnPart(b.x, b.y, sw.def.color, 2, 60, 0.3);
      }
    }
  }
}
