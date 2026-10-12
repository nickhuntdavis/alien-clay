'use strict';
// Spawn Prawn - Super Combos: two fused combos that fuse again. Super rare: you need both combos fused and every
// weapon in them at Lv 8+ (three weapons when the combos share one, four when they don't, which needs a splice
// and both bonus mounts). They unlock through the same ceremony as a combo (fusion.js), in gold.
// Hooks: combos.js comboTick (superTick), comboDamageMul (superMul), comboPulse (superPulse), comboLash
// (superLash), the teacup/partyline chains (superChain), the bubblehalo timer (superOn); fusion.js
// fusionCheck/fusionOpen/comboBonds (availableSupers, superOpt).

const SUPER_LEVEL = 8;
const SUPER_COLOR = '#ffd23f';
const SUPERS = [
  { id: 'reunion',      x: 'bigsib',   y: 'spityoyo',   name: 'Family Reunion',  desc: 'Every 2s, each yo-yo in flight launches a Big Sibling at the nearest enemy, and Big Siblings hit 50% harder.' },
  { id: 'perfectstorm', x: 'teacup',   y: 'partyline',  name: 'Perfect Storm',   desc: 'Your twins drag nearby enemies in towards themselves, and every Static Cling chain from either combo jumps 2 more times.' },
  { id: 'bathtime',     x: 'wormfarm', y: 'bubblehalo', name: 'Bath Time',       desc: 'Your angels blow bubbles twice as often, and Tapeworm spreads to the nearest healthy enemy every 2s, like nits at a primary school.' },
  { id: 'streaker',     x: 'whiplash', y: 'ghosttrail', name: 'Streaker',        desc: 'While you are hidden, every lash ends in a BOO! ring of viral trail (once a second).' },
  { id: 'nuclear',      x: 'bigsib',   y: 'porcupine',  name: 'Nuclear Family',  desc: 'Every Onesie pulse also launches a Big Sibling, and Porcupine Hug pellets hit 50% harder.' },
];
const SUPER_BY = Object.fromEntries(SUPERS.map(s => [s.id, s]));

const superOn = id => !!(G && G.superCombo && G.superCombo[id]);
const superWeapons = s => [...new Set([COMBO_BY[s.x].a, COMBO_BY[s.x].b, COMBO_BY[s.y].a, COMBO_BY[s.y].b])];
function availableSupers() {
  if (!G || !G.combo) return [];
  const on = G.superCombo || {};
  return SUPERS.filter(s => !on[s.id] && G.combo[s.x] && G.combo[s.y] && superWeapons(s).every(id => (owned(id) || {}).lvl >= SUPER_LEVEL));
}
function superOpt(s) {
  const X = COMBO_BY[s.x], Y = COMBO_BY[s.y];
  return { def: WEAPONS[X.a], rarity: 6, tag: 'SUPER COMBO', color: SUPER_COLOR, elem: WEAPONS[X.a].elem, title: s.name, fusion: true,
    sub: `${X.name} + ${Y.name}`, desc: s.desc, apply: () => superFuse(s) };
}
function superFuse(s) {
  G.superCombo = G.superCombo || {};
  G.superCombo[s.id] = true;
  META.supers = META.supers || {}; META.supers[s.id] = true; saveMeta();
  G.stats.supers = (G.stats.supers || 0) + 1;
  banner('SUPER COMBO: ' + s.name.toUpperCase(), SUPER_COLOR);
  const p = me();
  ring(p.x, p.y, 220, SUPER_COLOR, 0.7, 10); addLight(p.x, p.y, 380, SUPER_COLOR, 0.7);
  cam.shake = Math.min(14, cam.shake + 8); vibrate([40, 30, 120]);
  sysLine('fusion'); addViewers(40000);
  recomputeAll();
}

// A Big Sibling (as the Big Sibling combo throws them) from (x, y) at t.
function superSib(x, y, t, name) {
  const sw = comboW('seeker');
  if (!sw || !t) return;
  const pr = spawnProj(sw, x, y, Math.atan2(t.y - y, t.x - x), comboSrc(sw, name, { sup: true }), { dmg: sw.s.dmg * 3.5, r: 11, explode: 80, homing: 8, pierce: 0, noMods: true, color: '#5fd4e8' });
  if (pr) pr.tgt = t;
}

const superChain = () => superOn('perfectstorm') ? 2 : 0;
function superMul(e, src) {
  if (!G.superCombo) return 1;
  let m = 1;
  if ((superOn('reunion') || superOn('nuclear')) && (src.wname === 'Big Sibling' || src.sup)) m *= 1.5;
  if (superOn('nuclear') && src.wname === 'Porcupine Hug') m *= 1.5;
  return m;
}
function superPulse(w) {
  if (!superOn('nuclear')) return;
  const p = me(), t = acquire('nearest', 420, p.x, p.y);
  superSib(p.x, p.y, t, 'Nuclear Family');
}
function superLash(w, x, y) {
  if (superOn('streaker') && peekHidden() && cmbEvery('streak', 1)) comboBoo(w, x, y);
}

function superTick(dt) {
  if (!G.superCombo) return;
  if (superOn('reunion') && cmbEvery('reunion', 2)) {
    const gw = comboW('glaive');
    let n = 0;
    if (gw) for (const pr of G.proj) {
      if (pr.dead || pr.w !== gw || n >= 3) continue;
      const t = acquire('nearest', 360, pr.x, pr.y);
      if (t) { n++; superSib(pr.x, pr.y, t, 'Family Reunion'); }
    }
  }
  if (superOn('perfectstorm')) {
    const ww = comboW('twin');
    if (ww && ww.anchor) for (const q of twinPoints(ww)) forNear(q.x, q.y, 210, e => {
      if (e.boss || e.rival || e.charmed) return;
      const k = Math.min(1, dt * 1.6); e.x += (q.x - e.x) * k; e.y += (q.y - e.y) * k;
    });
  }
  if (superOn('bathtime') && cmbEvery('nits', 2)) {
    const pw = comboW('parasite');
    let n = 0;
    if (pw) for (const e of G.enemies) {
      if (n >= 12) break;
      if (e.dead || !(e.parasiteT > 0)) continue;
      n++;
      let best = null, bd = 170 * 170;
      for (const o of G.enemies) { if (o.dead || o.boss || o.parasiteT > 0) continue; const d = (o.x - e.x) ** 2 + (o.y - e.y) ** 2; if (d < bd) { bd = d; best = o; } }
      if (best) { best.parasiteW = pw; best.parasiteT = 6; floatText(best.x, best.y - best.r - 8, 'NITS', '#d9b38c', 11, 0.4); }
    }
  }
}
