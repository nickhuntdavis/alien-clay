'use strict';
// Spawn Prawn - the new Feats (v9.23, FEAT_IDEAS.md): 36 Feats, all kind 'newfeat'. Their data is in data.js (SPELLS),
// their Lv 4 paths in spellfork.js (SPELL_FORKS; stat paths in spellForkStats, behaviour paths read here), and the
// stamina-paid ones are in STAM_FEATS (stamina.js). Everything a Feat leaves on the slide is one entry in G.nf.fx with
// a kind (NFK[kind]: tick, and under/over drawing). Big-world creatures (the mosquito, the ant, the beetle) come in as
// one huge blurred part from off screen, after a shadow.
// Also a small, reusable decoy system (nfDecoy): enemies that are not bosses swim at a decoy and aim their bullets at it,
// and bullets that reach it hit it instead (Polar Body uses it).
// Hooks: game.js fireWeapon (case 'newfeat': nfFire), update (nfTick, before updateEnemies), updateEnemies (nfSteer),
// shootPattern (nfAim, nfNoFire), enemy bullets (nfBullet), hurtPlayer (nfHurtMul, nfLethal), updatePlayer (nfSpeed),
// updateSpellList (nfWait), featTap (passive Feats perform themselves), damageEnemy (nfDamaged), killEnemy (nfKill);
// render.js (nfDrawUnder after drawToysUnder, nfDrawOver after drawTypeFx, nfYouAlpha on your body, the labour squeeze
// of Bloody Show); ui.js (a Feat slot shows w.nfCharge when it has one; the Field Guide's FEATS tab); audio.js (G.musCutT).

const NF_TYPES = ['fire', 'ice', 'shock', 'poison', 'oxi', 'salt', 'arcane', 'soul'];
const NF_WORDS = ['SPERM', 'MOIST', 'GONAD', 'UVULA', 'SMEGMA', 'TESTES', 'URETHRA'];
function NFS() { return G.nf || (G.nf = { fx: [], decoys: [], under: [], perished: [], inc: [], persist: [], id: 0 }); }
// A Lv 4 path, noted when it is read (G.nfPaths: the tests check every path is reached).
const nfPath = (w, k) => { const on = spellFork(w, k); if (on && w.id) (G.nfPaths || (G.nfPaths = {}))[w.id + k] = 1; return on; };
const nfAdd = o => { const N = NFS(); o.t0 = G.t; o.rt0 = G.realT; o.id = ++N.id; N.fx.push(o); return o; };
const nfFoe = e => !!e && !e.dead && !e.charmed && !e.egg && !e.phased;
const nfPlain = e => !e.boss && !e.rival && !e.egg && !e.bossDef && !e.final;
// Once per gap seconds per enemy and key.
const nfEvery = (e, key, gap) => { const H = e.nfH || (e.nfH = {}); if (H[key] > G.t) return false; H[key] = G.t + gap; return true; };
const nfZone = src => Object.assign({}, src, { noCrit: true, zoneHit: true, knock: 0 });
const nfAs = (src, elem, extra) => Object.assign({}, src, { elem }, extra || {});
// Stuck (the Mucus stuck state). Bosses are only slowed.
function nfStick(e, t) { if (nfPlain(e)) e.frozen = Math.max(e.frozen || 0, t); else e.dazeSlowT = Math.max(e.dazeSlowT || 0, G.t + t * 0.5); }
// The visible slide, in world units.
const nfHalfW = () => W / 2 / S, nfHalfH = () => H / 2 / S;
const nfOnView = (o, m) => Math.abs(o.x - cam.x) < nfHalfW() + (m || 0) && Math.abs(o.y - cam.y) < nfHalfH() + (m || 0);
const nfOwned = id => G.spells.find(w => w && w.id === id) || null;
const nfCountNear = (x, y, r) => { let n = 0; forNear(x, y, r, e => { if (nfFoe(e)) n++; }); return n; };
const nfBulletsNear = (x, y, r) => { let n = 0; for (const b of G.ebul) if (!b.dead && Math.abs(b.x - x) < r && Math.abs(b.y - y) < r && Math.hypot(b.x - x, b.y - y) < r) n++; return n; };
// Say an unstable reaction that has no single enemy behind it (Brown Fat's slick), like chemPlayerZones does.
function nfSayRx(id, x, y, r) {
  const R = REACTIONS[id];
  floatText(x, y - 20, R.name, R.color, 14, 0.9);
  G.stats.reactions++; G.stats.reactBy[id] = (G.stats.reactBy[id] || 0) + 1; inspectSeeRx(id); typeRxFx(x, y, r || 30, id); sfx('react');
}
// Along a line from a to b, width w: the enemies on it, nearest a first.
function nfLine(a, b, w) {
  const out = [];
  alongLine(a, b, w, e => { out.push(e); });
  const dx = b.x - a.x, dy = b.y - a.y;
  return out.map(e => [e, (e.x - a.x) * dx + (e.y - a.y) * dy]).sort((p, q) => p[1] - q[1]).map(p => p[0]);
}
// Enemies in a cone from (x, y) facing a.
function nfCone(x, y, a, len, half, fn) {
  forNear(x, y, len, e => { if (!nfFoe(e)) return; const d = Math.atan2(e.y - y, e.x - x); if (Math.abs(angDiff(d, a)) < half + Math.atan2(e.r, Math.max(1, Math.hypot(e.x - x, e.y - y)))) fn(e); });
}
// Pairs of enemies near (x, y): each with its nearest free neighbour.
function nfPairs(x, y, n, reach) {
  const pool = acquireMany('nearest', 300, x, y, n * 2 + 4), used = new Set(), out = [];
  for (const a of pool) {
    if (out.length >= n || used.has(a)) continue;
    let best = null, bd = reach;
    for (const b of pool) { if (b === a || used.has(b)) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < bd) { bd = d; best = b; } }
    if (best) { used.add(a); used.add(best); out.push([a, best]); }
  }
  return out;
}
// A dash you can't steer for a moment (Bombardier Beetle's recoil, Capacitation).
function nfDash(a, v, t) { const N = NFS(); N.dash = { vx: Math.cos(a) * v, vy: Math.sin(a) * v, a, end: G.t + t }; }

// ---------------------------------------------------------------- decoys (reusable)
// opts: x, y, r, dur, and optional onBullet(d, b), onTouch(d, e), onEnd(d), draw(d). Bosses are never fooled.
function nfDecoy(o) { const N = NFS(); o.end = G.t + (o.dur || 4); o.t0 = G.t; o.wob = 0; N.decoys.push(o); return o; }
function nfDecoyFor(e) {
  const N = G.nf;
  if (!N || !N.decoys.length || !nfPlain(e) || e.charmed) return null;
  let best = null, bd = 760;
  for (const d of N.decoys) { const dd = Math.hypot(d.x - e.x, d.y - e.y); if (dd < bd) { bd = dd; best = d; } }
  return best;
}
const NF_V = { x: 0, y: 0 };
const nfToward = (e, x, y, stop) => { const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy) || 1; if (d < (stop || 0)) { NF_V.x = 0; NF_V.y = 0; } else { NF_V.x = dx / d; NF_V.y = dy / d; } return NF_V; };
// From updateEnemies: where an enemy swims instead (fleeing, lured, mobbing a decoy). null: as usual.
function nfSteer(e) {
  if (!nfPlain(e)) return null;
  if (e.nfFearT > G.t) { const v = nfToward(e, e.nfFx, e.nfFy); NF_V.x = -v.x; NF_V.y = -v.y; return NF_V; }
  if (e.nfLureT > G.t && e.nfLure) return nfToward(e, e.nfLure.x, e.nfLure.y, 22);
  const d = nfDecoyFor(e);
  if (d) return nfToward(e, d.x, d.y, d.r + e.r * 0.6);
  return null;
}
// From shootPattern: where an enemy aims (a decoy), or null.
function nfAim(e) { const d = nfDecoyFor(e); return d ? Math.atan2(d.y - e.y, d.x - e.x) : null; }
// From shootPattern: scratching, gagged or clogged enemies hold their fire (bosses keep firing).
const nfNoFire = e => e.nfNoFireT > G.t && !e.boss;

// ---------------------------------------------------------------- performing
function nfFire(w, target, src) {
  const f = NF_FIRE[w.id];
  if (f) f(w, w.s, target, src, me());
}
const NF_FIRE = {
  slimemould(w, s, t, src, p) {
    const ts = acquireMany('strongest', s.range, p.x, p.y, s.count || 1);
    if (t && !ts.includes(t)) ts.unshift(t);
    for (const e of ts.slice(0, s.count || 1)) {
      const pts = nfRoute(p.x, p.y, e.x, e.y);
      nfAdd({ k: 'slime', pts, L: pts.length - 1, grow: 0, tgt: e, s, src, memory: nfPath(w, 'b'), wn: G.wave ? G.wave.n : 0, br: nfBranches(pts) });
    }
    floatText(p.x, p.y - 36, 'SLIME MOULD', w.def.color, 13, 0.8);
  },
  polarbody(w, s, t, src, p) {
    const a = (p.hd != null ? p.hd : p.face) + Math.PI, x = p.x + Math.cos(a) * 46, y = p.y + Math.sin(a) * 46;
    nfPolar(w, s, src, x, y, s.dur, nfPath(w, 'a'));
    floatText(x, y - 30, 'POLAR BODY', w.def.color, 13, 0.8);
  },
  hagfish(w, s, t, src, p) {
    const gill = nfPath(w, 'b');
    forNear(p.x, p.y, s.area, e => { if (!nfFoe(e)) return; damageEnemy(e, s.dmg, src); nfStick(e, 2); if (gill) e.nfNoFireT = G.t + 2; });
    for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < s.area) b.slowT = G.realT + 0.4;
    nfAdd({ k: 'hag', x: p.x, y: p.y, r: s.area, end: G.t + s.dur, s, src, gill, knot: nfPath(w, 'a') });
    cam.shake = Math.min(8, cam.shake + 3); floatText(p.x, p.y - 36, 'HAGFISH', w.def.color, 13, 0.8);
  },
  vanishingtwin(w, s, t, src, p) {
    const e = t && !t.dead ? (nfTakeable(t) || t.boss ? t : acquireMany('strongest', s.range, p.x, p.y, 6).find(nfTakeable) || t) : null;
    if (!e) return;
    nfAdd({ k: 'twin', e, x: e.x, y: e.y, end: G.t + 0.7, s, src, absorb: nfPath(w, 'a'), guilt: nfPath(w, 'b'), boss: !nfTakeable(e) });
  },
  mosquito(w, s, t, src, p) { nfMosquito(w, s, t, src, p); if (nfPath(w, 'a')) after(1, () => { if (G && G.state === 'play') nfMosquito(w, w.s, null, src, me()); }); },
  notlatex(w, s, t, src, p) { nfAdd({ k: 'sheen', x: t.x, y: t.y, r: 0, R: s.area, end: G.t + s.dur, s, src, expired: nfPath(w, 'b'), seed: Math.random() * 9 }); },
  donorsample(w, s, t, src, p) {
    damageEnemy(t, s.dmg * 0.6, nfAs(src, 'phys'));
    nfAdd({ k: 'vial', e: t, x: t.x, y: t.y, passes: 0, max: Math.max(2, (s.count || 4) - 1 + Math.floor(Math.random() * 3)), next: G.t + 0.6, hop: { fx: p.x, fy: p.y, t: 0 }, s, src, matched: nfPath(w, 'a'), split: nfPath(w, 'b') });
  },
  ouija(w, s, t, src, p) {
    const pool = nfPath(w, 'a') ? NF_WORDS.filter(x => x.length >= 6) : NF_WORDS, word = pick(pool), n = word.length;
    const a = Math.random() * TAU, gap = 54, bend = rand(-0.004, 0.004), L = [];
    for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * gap; L.push({ ch: word[i], x: t.x + Math.cos(a) * u - Math.sin(a) * bend * u * u + rand(-8, 8), y: t.y + Math.sin(a) * u + Math.cos(a) * bend * u * u + rand(-8, 8), lit: 0 }); }
    nfAdd({ k: 'ouija', L, word, i: 0, next: G.t + 0.45, px: L[0].x - Math.cos(a) * 60, py: L[0].y - Math.sin(a) * 60, cursed: new Set(), s, src, bye: nfPath(w, 'b'), end: 0 });
  },
  formicacid(w, s, t, src, p) {
    const ts = acquireMany('armour', s.range, p.x, p.y, s.count || 1);
    if (t && !ts.includes(t)) ts.unshift(t);
    ts.slice(0, s.count || 1).forEach((e, i) => nfAdd({ k: 'ant', e, x: e.x, y: e.y, a: Math.atan2(e.y - p.y, e.x - p.x) + (i ? 0.9 : 0), hit: false, end: G.t + 1.1, s, src, trail: nfPath(w, 'b') }));
  },
  fecaltransplant(w, s, t, src, p) {
    const N = NFS(), bad = nfPath(w, 'b');
    G.acidOn = 0; G.sizzle = 0; G.tangleT = 0; pstClear(); // (Snotty, Sick: pstatus.js)
    for (const b of G.enemies) if (b.stuck && !b.dead) { b.stuck = null; shove(b, p.x, p.y, 300); }
    if (!bad) healPlayer(G.P.maxHp * (nfPath(w, 'a') ? 0.2 : 0.1));
    N.shedT = G.t + s.dur; N.shedK = bad ? 3 : 2; N.shedDmg = s.dmg; N.shedSrc = nfAs(src, 'poison');
    nfAdd({ k: 'bloom', end: G.t + 0.9 });
    floatText(p.x, p.y - 36, 'FECAL TRANSPLANT', w.def.color, 13, 0.8);
  },
  bombardier(w, s, t, src, p) {
    const a = Math.atan2(t.y - p.y, t.x - p.x), esc = nfPath(w, 'b');
    nfDash(a + Math.PI, 640, 0.26);
    if (esc) p.iframes = Math.max(p.iframes || 0, 0.55);
    nfAdd({ k: 'beetle', a, n: 0, max: s.count + (nfPath(w, 'a') ? 10 : 0), next: G.t, turret: nfPath(w, 'a'), end: G.t + 2, s, src });
    cam.shake = Math.min(8, cam.shake + 3);
  },
  crabs(w, s, t, src, p) {
    const hosts = acquireMany('nearest', s.range, p.x, p.y, s.count);
    for (const e of hosts) nfCrab(e, p.x, p.y, s, src, w);
  },
  vandegraaff(w, s, t, src, p) { nfAdd({ k: 'vdg', x: p.x + 60, y: p.y - 40, end: G.t + s.dur, charge: 0, s, src, earth: nfPath(w, 'a'), gap: nfPath(w, 'b'), zap: [] }); },
  wanderingwomb(w, s, t, src, p) {
    const a0 = Math.atan2(t.y - p.y, t.x - p.x), two = nfPath(w, 'b');
    for (const a of two ? [a0 - 0.35, a0 + 0.35] : [a0]) nfAdd({ k: 'womb', x: p.x + Math.cos(a) * 30, y: p.y + Math.sin(a) * 30, a, v: 150, end: G.t + s.dur, s, src, ectopic: nfPath(w, 'a'), host: null, seed: Math.random() * 9 });
  },
  anhydrobiosis() { /* performs itself (nfLethal) */ },
  capacitation(w, s, t, src, p) {
    const a = Math.atan2(t.y - p.y, t.x - p.x), D = 300 * (s.reach || 1), T = 0.24 * Math.sqrt(s.reach || 1), A = { x: p.x, y: p.y }, B = { x: p.x + Math.cos(a) * D, y: p.y + Math.sin(a) * D };
    nfDash(a, D / T, T); p.iframes = Math.max(p.iframes || 0, T + 0.15);
    const line = nfLine(A, B, s.area), carry = new Set(), zona = nfPath(w, 'b');
    line.forEach((e, i) => after(T * Math.min(1, Math.hypot(e.x - A.x, e.y - A.y) / D), () => {
      if (!G || e.dead) return;
      e.ifn = 0;
      damageEnemy(e, s.dmg, Object.assign({}, src, { shred: 6, kx: Math.cos(a), ky: Math.sin(a), knock: 120 }));
      for (const k of carry) if (!e.dead) { e.reactCd = 0; applyElement(e, k, s.dmg * 0.35, src); }
      if (e.dead) return;
      const h = chemHas(e); for (const k of NF_TYPES) if (h[k]) carry.add(k);
      if (i === line.length - 1 && zona) { nfStick(e, 2); floatText(e.x, e.y - e.r - 12, 'BOUND', '#f2f6ff', 11, 0.7); }
    }));
    nfAdd({ k: 'tunnel', A, B, a, end: G.t + 0.8, cols: [] });
  },
  brownfat(w, s, t, src, p) { nfAdd({ k: 'fat', x0: p.x, y0: p.y, x: t.x, y: t.y, land: G.t + 0.35, ign: G.t + 0.35 + (nfPath(w, 'a') ? 0 : s.dur), r: s.area, st: 'fly', s, src }); },
  asymptomatic(w, s, t, src, p) {
    const N = NFS(), late = nfPath(w, 'b') ? 2 : 1, carrier = nfPath(w, 'a');
    const hosts = acquireMany('nearest', s.range, p.x, p.y, s.count * 2).filter(e => !e.nfInc).slice(0, s.count);
    for (const e of hosts) { e.nfInc = { end: G.t + s.dur, k: late, dmg: s.dmg, src, carrier }; N.inc.push(e); }
  },
  rupture(w, s, t, src, p) {
    nfWave(p.x, p.y, s, src);
    if (nfPath(w, 'b')) after(1, () => { if (G && G.state === 'play') { const q = me(); nfWave(q.x, q.y, s, src); } });
  },
  spinnbarkeit(w, s, t, src, p) {
    const fern = nfPath(w, 'b'), elastic = nfPath(w, 'a');
    for (const [a, b] of nfPairs(t.x, t.y, s.count, 320)) {
      damageEnemy(a, s.dmg, src); damageEnemy(b, s.dmg, src);
      nfAdd({ k: 'string', a, b, L0: Math.max(40, Math.hypot(a.x - b.x, a.y - b.y)), end: G.t + s.dur, s, src, elastic, carryT: G.t + 0.4, seed: Math.random() * 9 });
      if (fern) { const c = acquireMany('nearest', 220, (a.x + b.x) / 2, (a.y + b.y) / 2, 4).find(o => o !== a && o !== b); if (c) { damageEnemy(c, s.dmg, src); nfAdd({ k: 'string', a: b, b: c, L0: Math.max(40, Math.hypot(b.x - c.x, b.y - c.y)), end: G.t + s.dur, s, src, elastic, carryT: G.t + 0.4, seed: Math.random() * 9, fern: 1 }); } }
    }
  },
  tonic(w, s, t, src, p) {
    const movers = [];
    for (const e of G.enemies) {
      if (!nfFoe(e) || !nfOnView(e, 80)) continue;
      if (nfPlain(e)) { e.frozen = Math.max(e.frozen || 0, s.dur); e.nfTonicT = G.t + s.dur; damageEnemy(e, s.dmg * 0.25, src); }
      else { movers.push({ e, x: e.x, y: e.y }); damageEnemy(e, s.dmg * 0.25, src); }
    }
    nfAdd({ k: 'tonic', end: G.t + s.dur, movers, twitch: nfPath(w, 'b'), tick: G.t + 0.25, s, src });
    G.flashT = Math.max(G.flashT || 0, 0.1); floatText(p.x, p.y - 36, 'TONIC IMMOBILITY', w.def.color, 13, 0.9);
  },
  earcandling(w, s, t, src, p) {
    const hd = (p.hd != null ? p.hd : p.face) + Math.PI, two = nfPath(w, 'a');
    for (const a of two ? [hd - 0.7, hd + 0.7] : [hd]) nfAdd({ k: 'candle', x: p.x + Math.cos(a) * 70, y: p.y + Math.sin(a) * 70, end: G.t + s.dur, s, src, snuff: nfPath(w, 'b'), seed: Math.random() * 9 });
  },
  hostileenv(w, s, t, src, p) {
    const x = t.x + (p.x - t.x) * 0.35, y = t.y + (p.y - t.y) * 0.35;
    nfAdd({ k: 'acid', x, y, r: s.area, r0: s.area, end: G.t + s.dur, s, src, buffer: nfPath(w, 'a'), yeast: nfPath(w, 'b'), seed: Math.random() * 9 });
  },
  sharedplacenta(w, s, t, src, p) {
    for (const [a, b] of nfPairs(t.x, t.y, s.count, 340)) {
      damageEnemy(a, s.dmg, src); damageEnemy(b, s.dmg, src);
      const o = nfAdd({ k: 'tie', a, b, end: G.t + s.dur, s, src, full: nfPath(w, 'a'), cord: nfPath(w, 'b'), flashT: -9 });
      (a.nfTie || (a.nfTie = [])).push(o); (b.nfTie || (b.nfTie = [])).push(o);
    }
  },
  productivecough(w, s, t, src, p) {
    const n = s.globs || 1, ts = [t].concat(acquireMany('nearest', s.range, p.x, p.y, 3).filter(e => e !== t));
    for (let i = 0; i < n; i++) nfAdd({ k: 'glob', x: p.x, y: p.y, tgt: ts[i % ts.length], left: s.count, hit: new Set(), last: null, lastT: -9, s, src, hair: nfPath(w, 'b'), end: G.t + 8 });
    floatText(p.x, p.y - 30, 'HACK', w.def.color, 12, 0.6);
  },
  hirudotherapy(w, s, t, src, p) {
    for (const e of acquireMany('nearest', s.range, p.x, p.y, s.count)) {
      damageEnemy(e, s.dmg, src);
      nfAdd({ k: 'leech', host: e, end: G.t + s.dur, fed: 0, ang: Math.random() * TAU, lx: e.x, ly: e.y, tick: G.t + 0.25, s, src, engorge: nfPath(w, 'b'), hop: { fx: p.x, fy: p.y, t: 0 } });
    }
  },
  lipidbilayer(w, s, t, src, p) {
    const ring = nfPath(w, 'b'), c = acquire('cluster', 420, p.x, p.y) || acquire('nearest', 420, p.x, p.y), R = ring ? 78 : 130;
    const a = c ? Math.atan2(c.y - p.y, c.x - p.x) : (p.hd || 0);
    nfAdd({ k: 'wall', cx: p.x, cy: p.y, a, R, half: ring ? Math.PI : Math.min(1.35, s.area / R), end: G.t + s.dur, s, src, ion: nfPath(w, 'a'), ring, rip: [] });
  },
  biofilm(w, s, t, src, p) { nfAdd({ k: 'film', x: t.x, y: t.y, r: s.area * 0.55, R: s.area * 1.7, end: G.t + s.dur, s, src, quorum: nfPath(w, 'a'), persist: nfPath(w, 'b'), n: 0, seed: Math.random() * 9 }); },
  shedlining(w, s, t, src, p) {
    const c = acquire('cluster', 700, p.x, p.y) || acquire('nearest', 700, p.x, p.y), a = c ? Math.atan2(c.y - p.y, c.x - p.x) : (p.hd || 0);
    nfTide(p, a, s, src, nfPath(w, 'a'));
    if (nfPath(w, 'b')) after(0.8, () => { if (G && G.state === 'play') nfTide(me(), a + Math.PI, s, src, false); });
  },
  osmosis(w, s, t, src, p) {
    let best = t, bv = -1;
    for (const e of acquireMany('nearest', s.range, p.x, p.y, 20)) { const v = chemCount(e) * 1e6 + e.maxHp; if (v > bv) { bv = v; best = e; } }
    nfOsmose(best, s, src, nfPath(w, 'a'), nfPath(w, 'b'));
  },
  aerosol(w, s, t, src, p) {
    const a = Math.atan2(t.y - p.y, t.x - p.x);
    nfCone(p.x, p.y, a, s.area, 0.45, e => { damageEnemy(e, s.dmg, src); if (!e.dead) applyElement(e, 'poison', s.dmg, src); });
    const drops = [];
    for (let i = 0; i < 28; i++) { const b = a + rand(-0.45, 0.45), v = rand(160, 420) * s.area / 220; drops.push({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 14, vx: Math.cos(b) * v, vy: Math.sin(b) * v, r: rand(1.2, 3) }); }
    nfAdd({ k: 'aero', drops, a, drift: nfPath(w, 'a') ? 2 : 1, end: G.t + s.dur, tick: G.t + 0.6, s, src });
    floatText(p.x, p.y - 30, 'ACHOO', w.def.color, 12, 0.6);
  },
  selflube(w, s, t, src, p) { const N = NFS(); N.lubeT = G.t + s.dur; N.lube = { s, src, bowl: nfPath(w, 'a') }; floatText(p.x, p.y - 36, 'SELF-LUBRICATING', w.def.color, 13, 0.8); },
  anticoagulant(w, s, t, src, p) {
    nfThin(s, src, nfPath(w, 'a'));
    if (nfPath(w, 'b')) after(1, () => { if (G && G.state === 'play') nfThin(w.s, src, nfPath(w, 'a')); });
  },
  fertilewindow(w, s, t, src, p) {
    const a0 = p.hd != null ? p.hd : p.face, two = nfPath(w, 'a');
    for (const a of two ? [a0 - 0.35, a0 + 0.35] : [a0]) nfAdd({ k: 'lane', x0: p.x, y0: p.y, a, L: 520, w: s.area, end: G.t + s.dur, s, src, crypts: nfPath(w, 'b'), done: false, seed: Math.random() * 9 });
  },
  surfactant(w, s, t, src, p) {
    const follow = nfPath(w, 'b'), c = follow ? p : t;
    nfAdd({ k: 'surf', x: c.x, y: c.y, r: s.area, end: G.t + s.dur, s, src, follow, det: nfPath(w, 'a'), seed: Math.random() * 9 });
  },
  lacticacid(w, s, t, src, p) {
    const k = clamp(w.nfCharge || 0, 0, 1), r = s.area * (0.6 + 0.7 * k);
    aoe(p.x, p.y, r, s.dmg * (0.4 + 2.6 * k), src, w.def.color);
    if (nfPath(w, 'b') && G.stam) G.stam.cur = Math.min(stamMax(), G.stam.cur + stamMax() * 0.3);
    nfAdd({ k: 'vent', x: p.x, y: p.y, r, end: G.t + 0.7 });
    w.nfCharge = 0;
  },
};

// ---------------------------------------------------------------- feat helpers
// Slime Mould's route: round the walls on a campaign level (walking back down the player's route map from the target),
// straight (with a little wander) anywhere else. Autorun never uses it.
function nfRoute(x0, y0, x1, y1) {
  let pts = null;
  const V = G.lvl;
  if (V && V.dPl && typeof lvIdx === 'function') {
    let i = lvIdx(x1, y1), guard = 0;
    if (i >= 0 && V.dPl[i] > 0) {
      const cells = [];
      while (i >= 0 && V.dPl[i] > 0 && guard++ < 300) { cells.push(i); i = lvNext(V.dPl, i); }
      pts = [{ x: x0, y: y0 }];
      for (let k = cells.length - 1; k >= 0; k--) { const c = lvCentre(cells[k]); pts.push({ x: c.x + rand(-12, 12), y: c.y + rand(-12, 12) }); }
      pts.push({ x: x1, y: y1 });
    }
  }
  if (!pts) { const n = 4, a = Math.atan2(y1 - y0, x1 - x0), d = Math.hypot(x1 - x0, y1 - y0); pts = []; for (let i = 0; i <= n; i++) { const u = i / n, wv = i && i < n ? rand(-0.12, 0.12) * d : 0; pts.push({ x: x0 + (x1 - x0) * u - Math.sin(a) * wv, y: y0 + (y1 - y0) * u + Math.cos(a) * wv }); } }
  // Even spacing, smoothed.
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.round(d / 22));
    for (let k = 1; k <= n; k++) out.push({ x: a.x + (b.x - a.x) * k / n, y: a.y + (b.y - a.y) * k / n });
  }
  for (let pass = 0; pass < 2; pass++) for (let i = 1; i < out.length - 1; i++) { out[i].x = (out[i - 1].x + out[i].x * 2 + out[i + 1].x) / 4; out[i].y = (out[i - 1].y + out[i].y * 2 + out[i + 1].y) / 4; }
  return out;
}
// Side shoots that go nowhere and wither.
function nfBranches(pts) {
  const out = [];
  for (let i = 3; i < pts.length - 2; i += 3 + Math.floor(Math.random() * 3)) {
    const a = pts[i], b = pts[i + 1], d = Math.atan2(b.y - a.y, b.x - a.x) + (Math.random() < 0.5 ? 1 : -1) * rand(0.6, 1.2);
    out.push({ i, a: d, len: rand(30, 90), bend: rand(-0.6, 0.6) });
  }
  return out;
}
function nfPolar(w, s, src, x, y, dur, meiosis, half) {
  const zona = nfPath(w, 'b');
  return nfDecoy({ x, y, r: 17, dur, k: 'polar', hits: 0, max: zona ? 1e9 : 14, s, src, zona, meiosis: meiosis && !half,
    onBullet(d, b) {
      d.hits++; d.wob = 1;
      const o = b.owner;
      if (o && !o.dead && !o.charmed && Math.hypot(o.x - d.x, o.y - d.y) < 700) { damageEnemy(o, s.dmg * 0.5, src); bolt(d.x, d.y, o.x, o.y, '#9ec9ff', 0.1); }
      spawnPart(b.x, b.y, '#cfe6ff', 2, 60, 0.3, 2);
      if (d.hits >= d.max) d.end = G.t;
    },
    onTouch(d, e) { damageEnemy(e, s.dmg * 0.35, src); d.hits += 0.5; d.wob = Math.max(d.wob, 0.6); if (d.hits >= d.max) d.end = G.t; },
    onEnd(d) {
      forNear(d.x, d.y, s.area, e => { if (nfFoe(e)) damageEnemy(e, s.dmg * 2, Object.assign({}, src, { knock: 260, kx: e.x - d.x, ky: e.y - d.y })); });
      fxParts('drop', d.x, d.y, '#9ec9ff', 16, 220, 0.6, 3); G.fx.push({ type: 'flash', x: d.x, y: d.y, r: s.area * 0.7, color: '#cfe6ff', life: 0.2, max: 0.2 });
      sfx('boom');
    } });
}
// Vanishing Twin: can this one be taken out of play?
const nfTakeable = e => nfFoe(e) && nfPlain(e) && !e.worm && !e.guard && !e.evTag;
function nfMosquito(w, s, t, src, p) {
  // The line that crosses the most enemies.
  let best = t ? Math.atan2(t.y - p.y, t.x - p.x) : p.hd || 0, bn = -1;
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU, A = { x: p.x + Math.cos(a) * 40, y: p.y + Math.sin(a) * 40 }, B = { x: p.x + Math.cos(a) * s.range, y: p.y + Math.sin(a) * s.range };
    let n = 0; alongLine(A, B, s.area, () => { n++; });
    if (n > bn || (n === bn && t && Math.abs(angDiff(a, Math.atan2(t.y - p.y, t.x - p.x))) < 0.3)) { bn = n; best = a; }
  }
  if (bn <= 0 && !t) return;
  const a = best, A = { x: p.x + Math.cos(a) * 40, y: p.y + Math.sin(a) * 40 }, B = { x: p.x + Math.cos(a) * s.range, y: p.y + Math.sin(a) * s.range };
  nfAdd({ k: 'mosq', a, A, B, side: Math.random() < 0.5 ? 1 : -1, end: G.t + 1.45, hit: false, s, src, itch: nfPath(w, 'b') });
}
function nfCrab(e, fx, fy, s, src, w) {
  const N = NFS();
  if (!nfFoe(e) || (N.crabN || 0) >= 16) return;
  N.crabN = (N.crabN || 0) + 1;
  nfAdd({ k: 'crab', host: e, hop: { fx, fy, t: 0 }, end: G.t + s.dur, scr: G.t + rand(0.8, 1.6), jump: G.t + 0.6, ang: Math.random() * TAU, s, src, nits: nfPath(w, 'a'), grip: nfPath(w, 'b'), w });
}
function nfWave(x, y, s, src) { nfAdd({ k: 'wave', x, y, r: 0, R: s.area, hit: new Set(), s, src, seed: Math.random() * 9 }); sfx('boom'); }
function nfTide(p, a, s, src, heavy) {
  const hd = Math.hypot(nfHalfW(), nfHalfH()) + 60, ox = p.x - Math.cos(a) * hd, oy = p.y - Math.sin(a) * hd;
  nfAdd({ k: 'tide', ox, oy, a, d: 0, D: hd * 2, v: hd * 2 / s.dur, depth: s.area, hw: hd * 1.1, pools: 0, poolT: G.t + 0.3, s, src, heavy, seed: Math.random() * 9 });
}
function nfOsmose(e, s, src, burst, twice) {
  if (!nfFoe(e)) return;
  damageEnemy(e, s.dmg, src);
  if (e.dead) return;
  const spread = (from, r, n, done, gen) => {
    const h = chemHas(from), ks = NF_TYPES.filter(k => h[k]), to = neighbours(from, r, n).filter(o => !done.has(o) && nfFoe(o));
    for (const o of to) { done.add(o); o.reactCd = 0; for (const k of ks) if (!o.dead) applyElement(o, k, s.dmg * 0.6, src); }
    nfAdd({ k: 'motes', x: from.x, y: from.y, to: to.map(o => ({ x: o.x, y: o.y })), cols: ks.map(k => ELEMENTS[k].color), end: G.t + 0.7 });
    if (twice && gen === 0) after(0.4, () => { if (G) for (const o of to) if (!o.dead) spread(o, r * 0.8, 3, done, 1); });
  };
  spread(e, s.area, 8, new Set([e]), 0);
  if (burst) after(0.35, () => { if (G && !e.dead) aoe(e.x, e.y, 90, s.dmg * 2, src, '#90e0ef'); });
}
function nfThin(s, src, thinner) {
  for (const e of G.enemies) {
    if (!nfFoe(e) || !(e.bloodT > 0) || !nfOnView(e, 60)) continue;
    const dps = e.bloodDps || 0, d = dps * e.bloodT * 1.3 + s.dmg;
    for (const n of neighbours(e, s.area, 4)) { n.bloodT = Math.max(n.bloodT || 0, 3); n.bloodN = Math.min(5, (n.bloodN || 0) + 1); n.bloodDps = Math.max(n.bloodDps || 0, dps * 0.6 * (thinner ? 2 : 1), s.dmg * 0.2); n.bloodBy = 'Anticoagulant'; }
    e.bloodT = 0; e.bloodN = 0;
    damageEnemy(e, d, Object.assign({}, src, { noStatus: true }));
    nfAdd({ k: 'puff', x: e.x, y: e.y, r: s.area, end: G.t + 0.8, seed: Math.random() * 9 });
  }
}

// ---------------------------------------------------------------- every frame
function nfTick(dt) {
  const N = G.nf;
  if (!N) { nfCharge(dt); return; }
  const p = me();
  nfCharge(dt);
  if (N.dash) { if (N.dash.end > G.t) { p.vx = N.dash.vx; p.vy = N.dash.vy; p.hd = N.dash.a; } else { const v = Math.hypot(N.dash.vx, N.dash.vy), k = Math.min(1, 240 / Math.max(1, v)); p.vx = N.dash.vx * k; p.vy = N.dash.vy * k; N.dash = null; } }
  // Decoys: mobbed, popped.
  for (const d of N.decoys) {
    d.wob = Math.max(0, d.wob - dt * 3);
    if (d.meiosis && G.t > d.t0 + (d.end - d.t0) / 2) { d.meiosis = false; const a = Math.random() * TAU; const o = nfPolar({ isSpell: 1, fork: d.zona ? 'b' : 'a' }, d.s, d.src, d.x + Math.cos(a) * 34, d.y + Math.sin(a) * 34, d.end - G.t, false, true); o.max = d.max; d.x -= Math.cos(a) * 34; d.y -= Math.sin(a) * 34; floatText(d.x, d.y - 26, 'MEIOSIS II', '#9ec9ff', 11, 0.7); }
    if (d.onTouch) forNear(d.x, d.y, d.r + 6, e => { if (nfFoe(e) && nfEvery(e, 'dc', 0.5)) d.onTouch(d, e); });
  }
  if (N.decoys.length) { for (const d of N.decoys) if (d.end <= G.t && !d.gone) { d.gone = true; if (d.onEnd) d.onEnd(d); } compactArr(N.decoys, d => !d.gone); }
  // Out of play (Vanishing Twin), then back.
  if (N.under.length) {
    for (const u of N.under) {
      if (G.t < u.back) continue;
      const e = u.e; u.done = true; e.phased = false; e.nfGone = false; e.x = u.x; e.y = u.y; e.kx = 0; e.ky = 0; e.frozen = 0;
      G.enemies.push(e);
      fxParts('smoke', u.x, u.y, '#bff4ff', 4, 60, 0.8, 7, -Math.PI / 2, 0.6);
      if (u.absorb && !e.elite && Math.random() < 0.25) { floatText(u.x, u.y - 20, 'ABSORBED', '#bff4ff', 12, 0.9); e.hp = 0; killEnemy(e, u.src); continue; }
      damageEnemy(e, u.dmg, u.src); // (it comes back cursed: six Alien hits' worth, so Full Possession)
      if (e.dead) continue;
      e.curse = Math.max(e.curse || 0, 3); e.reactCd = 0;
      react(e, 'possession', u.src); curseFoe(e, 6);
      if (u.guilt) N.guilt = e;
    }
    compactArr(N.under, u => !u.done);
  }
  // Perished shields (Not Latex-Safe): no armour, no shield.
  if (N.perished.length) { for (const e of N.perished) if (!e.dead && e.nfPerishT > G.t) { e.shred = Math.max(e.shred || 0, (e.armour || 0) + 4); e.ifn = 0; e.auraArm = 0; e.tunT = 0; } compactArr(N.perished, e => !e.dead && e.nfPerishT > G.t); }
  // Incubating (Asymptomatic).
  if (N.inc.length) {
    for (const e of N.inc) {
      const I = e.nfInc;
      if (!I || e.dead) continue;
      if (I.carrier && nfEvery(e, 'car', 0.4) && N.inc.length < 16) forNear(e.x, e.y, e.r + 16, o => { if (o !== e && nfFoe(o) && !o.nfInc && Math.hypot(o.x - e.x, o.y - e.y) < o.r + e.r + 6) { o.nfInc = Object.assign({}, I, { carrier: false }); N.inc.push(o); } });
      if (G.t < I.end) continue;
      e.nfInc = null;
      if (e.charmed) continue;
      const k = I.k;
      damageEnemy(e, I.dmg * 1.5 * k, I.src);
      if (e.dead) continue;
      addSick(e, 4 * k, I.dmg * 0.2 * k, I.src);
      e.reactCd = 0;
      if (react(e, 'pandemic', I.src)) { e.pandT = G.t + 6; for (const n of neighbours(e, 170, 6)) { addSick(n, 2 * k, I.dmg * 0.15 * k, I.src); bolt(e.x, e.y, n.x, n.y, ELEMENTS.poison.color, 0.15); } }
      fxParts('bubble', e.x, e.y, '#b9d39b', 10, 120, 0.8, 3);
    }
    compactArr(N.inc, e => !e.dead && e.nfInc);
  }
  // Persister Cells (Biofilm): still snotty after leaving.
  if (N.persist.length) { for (const e of N.persist) if (!e.dead && e.nfPersistT > G.t) { e.chill = Math.max(e.chill || 0, 0.3); e.chillAmt = Math.max(e.chillAmt || 0, 0.25); } compactArr(N.persist, e => !e.dead && e.nfPersistT > G.t); }
  // Shedding Cooties (Fecal Transplant).
  if (N.shedT > G.t) {
    forNear(p.x, p.y, p.r + 30, e => { if (nfFoe(e) && Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r + 6 && nfEvery(e, 'shed', 0.5)) for (let i = 0; i < N.shedK; i++) if (!e.dead) applyElement(e, 'poison', N.shedDmg, N.shedSrc); });
    if (Math.random() < dt * 12) (N.wake || (N.wake = [])).push({ x: p.x - Math.cos(p.hd || 0) * 10 + rand(-4, 4), y: p.y - Math.sin(p.hd || 0) * 10 + rand(-4, 4), t: G.realT, r: rand(6, 11) });
  }
  if (N.wake) { while (N.wake.length && (G.realT - N.wake[0].t > 1.2 || N.wake[0].t > G.realT)) N.wake.shift(); if (N.wake.length > 40) N.wake.splice(0, N.wake.length - 40); }
  // Self-Lubricating: things slide off you.
  if (N.lubeT > G.t) {
    const L = N.lube;
    forNear(p.x, p.y, p.r + 40, e => {
      if (!nfFoe(e) || Math.hypot(e.x - p.x, e.y - p.y) > e.r + p.r + 8 || !nfEvery(e, 'lube', 0.4)) return;
      if (L.bowl && nfPlain(e)) chemBowl(e, p, 650, L.s.dmg * 1.5, L.src); else shove(e, p.x, p.y, 650);
      damageEnemy(e, L.s.dmg, L.src);
    });
    if (Math.random() < dt * 14) { const a = (p.hd || 0) + Math.PI + rand(-0.4, 0.4); G.parts.length < qualParts() && G.parts.push({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 14, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, life: 0.6, max: 0.6, color: '#d8b4fe', size: 2.2, k: 'drop' }); }
  }
  for (const o of N.fx) { const K = NFK[o.k]; if (!K.tick || K.tick(o, dt, p) === false) o.dead = true; }
  compactArr(N.fx, o => !o.dead);
}
// Lactic Acid's charge: swimming fills it (three times as fast sprinting).
function nfCharge(dt) {
  const w = nfOwned('lacticacid'), p = me();
  if (!w) return;
  const mv = w.nfLx != null ? Math.hypot(p.x - w.nfLx, p.y - w.nfLy) : 0;
  w.nfLx = p.x; w.nfLy = p.y;
  if (mv > 60) return; // (a jump, not a swim)
  w.nfCharge = Math.min(1, (w.nfCharge || 0) + mv * (G.stam && G.stam.sprint ? 1 : 0.33) / 900);
}

// ---------------------------------------------------------------- the kinds: tick (false: it's over), under and over
const NFK = {
  slime: {
    tick(o, dt) {
      const s = o.s;
      if (!o.arrived) {
        o.grow += dt * 30; // (points a second: about 660 units)
        if (o.tgt && !o.tgt.dead && !o.tgt.nfGone) { const q = o.pts[o.L]; q.x += (o.tgt.x - q.x) * Math.min(1, dt * 4); q.y += (o.tgt.y - q.y) * Math.min(1, dt * 4); }
        if (o.grow >= o.L) {
          o.grow = o.L; o.arrived = G.t;
          const e = o.tgt;
          if (nfFoe(e)) {
            nfStick(e, 2); o.eng = e;
            for (let i = 0; i < 3; i++) after(0.2 * i, () => { if (G && !e.dead) damageEnemy(e, s.dmg, o.src); });
            floatText(e.x, e.y - e.r - 12, 'ENGULFED', '#e9e36a', 12, 0.8);
          }
          o.until = o.memory ? (G.wave ? 1e9 : G.t + 20) : G.t + s.dur;
        }
      } else if (o.memory && G.wave && (G.wave.n !== o.wn || !G.wave.active) && o.until > G.t + 1) o.until = G.t + 1;
      if (o.until && G.t > o.until + 1) return false;
      if (o.withT == null && o.until && G.t > o.until) o.withT = G.t;
      if (o.withT == null && nfEvery(o, 'tick', 0.5)) {
        const n = Math.floor(o.grow);
        for (let i = 0; i <= n; i += 2) { const q = o.pts[i]; forNear(q.x, q.y, s.area, e => { if (!nfFoe(e) || !nfEvery(e, 'sl' + o.id, 0.5)) return; damageEnemy(e, s.dmg * 0.12, nfZone(o.src)); e.dazeSlowT = Math.max(e.dazeSlowT || 0, G.t + 0.6); }); }
      }
    },
    under(o, df) {
      const t = G.realT, n = Math.min(o.L, o.grow), wk = o.withT != null ? clamp(1 - (G.t - o.withT), 0, 1) : 1, col = df ? '#fff6a8' : '#d9cf3a', age = G.t - o.t0;
      if (wk <= 0) return;
      const P = o.pts, step = (i, x) => { const a = P[Math.floor(i)], b = P[Math.min(o.L, Math.floor(i) + 1)], f = i - Math.floor(i); return x ? a.x + (b.x - a.x) * f : a.y + (b.y - a.y) * f; };
      if (df) ctx.globalCompositeOperation = 'lighter';
      // The vein: thickens on the route once it works, with pulses running out along it.
      const thick = (o.arrived ? 1 + Math.min(1, (G.t - o.arrived) * 2) * 0.8 : 1) * wk;
      ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(sx(P[0].x), sy(P[0].y));
      for (let i = 1; i <= Math.floor(n); i++) ctx.lineTo(sx(P[i].x) + Math.sin(i * 1.7 + t * 2) * 1.2 * S, sy(P[i].y) + Math.cos(i * 1.3 + t * 2) * 1.2 * S);
      ctx.lineTo(sx(step(n, 1)), sy(step(n, 0)));
      softStroke(3.2 * S * thick, col, (df ? 0.55 : 0.7) * wk);
      for (let k = 0; k < 3; k++) { const u = ((t * 0.7 + k / 3) % 1) * n, i = Math.floor(u); if (i >= o.L) continue; soft(sx(step(u, 1)), sy(step(u, 0)), 7 * S * thick, df ? '#ffffff' : '#fff9c4', 0.5 * wk); }
      // Dead-end shoots: grow, then wither.
      for (const b of o.br) {
        if (b.i > n) continue;
        const life = clamp((age - b.i / 30) / 0.5, 0, 1), wither = clamp(1 - (age - b.i / 30 - 0.6) / 0.8, 0, 1), L = b.len * life, q = P[b.i];
        if (wither <= 0) continue;
        ctx.beginPath(); ctx.moveTo(sx(q.x), sy(q.y));
        ctx.quadraticCurveTo(sx(q.x + Math.cos(b.a) * L * 0.5), sy(q.y + Math.sin(b.a) * L * 0.5), sx(q.x + Math.cos(b.a + b.bend) * L), sy(q.y + Math.sin(b.a + b.bend) * L));
        softStroke(1.5 * S * wither, col, 0.5 * wither * wk);
      }
      // The growing tip, and the target held in it.
      if (!o.arrived) softBlob(sx(step(n, 1)), sy(step(n, 0)), 10 * S, o.id, t, 0.18, col, 0.6);
      if (o.eng && !o.eng.dead && G.t - o.arrived < 2.2) { const e = o.eng, k = clamp(1 - (G.t - o.arrived - 1.6) / 0.6, 0, 1); softBlob(sx(e.x), sy(e.y), e.r * 1.9 * S, e.id, t * 2, 0.16, col, 0.55 * k); }
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  hag: {
    tick(o, dt, p) {
      o.x = p.x; o.y = p.y;
      if (G.t < o.end) return true;
      if (o.knot) { G.sprintT = G.t + 0.7; p.iframes = Math.max(p.iframes || 0, 0.4); floatText(p.x, p.y - 30, 'KNOT TYING', '#c8d27a', 12, 0.7); }
      return false;
    },
    bullet(o, b, dt) { if (Math.abs(b.x - o.x) < o.r && Math.hypot(b.x - o.x, b.y - o.y) < o.r) { b.slowT = G.realT + 0.12; b.life -= dt * 2.5; b.vx *= 0.985; b.vy *= 0.985; } return false; },
    under(o, df) {
      const t = G.realT, age = G.realT - o.rt0, life = o.end - o.t0, k = clamp((o.end - G.t) / 0.6, 0, 1), x = sx(o.x), y = sy(o.y), R = o.r * S;
      const open = clamp(age / 0.22, 0, 1), swell = clamp((age - 0.12) / 0.4, 0, 1);
      // Threads unravel outward in a blink, then swell into a soft cloud.
      if (df) ctx.globalCompositeOperation = 'lighter';
      const col = df ? '#f2f7d8' : '#9aa36a';
      ctx.beginPath();
      const nT = df ? 46 : 30;
      for (let i = 0; i < nT; i++) {
        const a = i / nT * TAU + Math.sin(i * 7.3) * 0.3, L = R * open * (0.6 + 0.4 * Math.sin(i * 3.1 + 1)), w = Math.sin(i * 1.9 + t * 1.5) * 0.4;
        ctx.moveTo(x + Math.cos(a) * 6 * S, y + Math.sin(a) * 6 * S);
        ctx.quadraticCurveTo(x + Math.cos(a + w) * L * 0.55, y + Math.sin(a + w) * L * 0.55, x + Math.cos(a + w * 0.5) * L, y + Math.sin(a + w * 0.5) * L);
      }
      ctx.lineWidth = Math.max(0.8, 0.9 * S); ctx.strokeStyle = ha(col, (df ? 0.5 : 0.4) * k); ctx.stroke();
      if (swell > 0) for (let i = 0; i < 5; i++) { const a = i * 1.3 + o.id, d = R * 0.35 * swell; softBlob(x + Math.cos(a) * d, y + Math.sin(a) * d, R * (0.45 + 0.2 * swell), o.id + i, t * 0.6, 0.14, df ? '#e8f0c0' : '#c8d27a', (df ? 0.16 : 0.24) * swell * k); }
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  twin: {
    tick(o) {
      const e = o.e;
      if (G.t < o.end) { if (!e.dead && !e.nfGone) { o.x = e.x; o.y = e.y; if (!o.boss) e.dazeSlowT = G.t + 0.3; } return true; }
      if (o.taken) return G.t < o.end2;
      o.taken = true; o.end2 = G.t + o.s.dur + 0.6;
      if (e.dead) return false;
      if (o.boss) {
        damageEnemy(e, o.s.dmg * 3, o.src);
        if (!e.dead) { e.spookT = G.t + 4; e.dazeSlowT = G.t + 1.5; floatText(e.x, e.y - e.r - 14, 'SPOOKED', ELEMENTS.soul.color, 12, 0.8); }
        o.end2 = G.t + 0.8;
        return true;
      }
      if (e.charmed || e.dead || !G.enemies.includes(e)) return false;
      // Out of play: off the slide, untouchable, not counted. Back in s.dur.
      const i = G.enemies.indexOf(e); G.enemies.splice(i, 1);
      e.nfGone = true; e.phased = true;
      NFS().under.push({ e, x: o.x, y: o.y, back: G.t + o.s.dur, src: o.src, dmg: o.s.dmg, absorb: o.absorb, guilt: o.guilt });
      forNear(o.x, o.y, 230, n => { if (nfFoe(n) && nfPlain(n)) { n.nfFearT = G.t + 2; n.nfFx = o.x; n.nfFy = o.y; } });
      floatText(o.x, o.y - 24, 'TAKEN', '#bff4ff', 12, 0.8); sfx('spell');
      return true;
    },
    under(o, df) {
      const age = G.t - o.t0, x = sx(o.x), y = sy(o.y), r = (o.e.r + 14) * S;
      const k = o.taken ? clamp((o.end2 - G.t) / 0.6, 0, 1) : clamp(age / 0.3, 0, 1);
      // A soft dark pool: no ring.
      if (df) { ctx.globalCompositeOperation = 'lighter'; softBlob(x, y + 3 * S, r * 1.4, o.id, G.realT, 0.15, '#bff4ff', 0.08 * k); ctx.globalCompositeOperation = 'source-over'; soft(x, y + 3 * S, r * 1.1, '#000000', 0.9 * k); }
      else softBlob(x, y + 3 * S, r * 1.4, o.id, G.realT, 0.15, '#0c1418', 0.45 * k);
    },
    over(o, df) {
      const age = G.t - o.t0, e = o.e;
      if (o.boss && o.taken) return;
      // A copy of you, faint, rising and wrapping the enemy; then sinking with it.
      const rise = clamp(age / 0.5, 0, 1), sink = o.taken ? clamp((G.t - (o.end2 - o.s.dur - 0.6)) / 0.5, 0, 1) : 0;
      if (sink >= 1) return;
      const a = age * 5 + o.id, R = (e.r + 6) * (1 - sink * 0.6), x = sx(o.x + Math.cos(a) * R), y = sy(o.y + Math.sin(a) * R + (1 - rise) * 18 + sink * 10);
      const raw = RAW_COL; RAW_COL = true;
      drawShip(x, y, a + Math.PI / 2, df ? '#bff4ff' : '#8fd8ea', 0.35 * rise * (1 - sink), playerScale() * 0.95);
      RAW_COL = raw;
      if (o.taken && !o.boss) soft(sx(o.x), sy(o.y), e.r * S * (1 - sink), df ? '#bff4ff' : '#203038', 0.4 * (1 - sink)); // (the enemy, going under)
    },
  },
  mosq: {
    tick(o) {
      const age = G.t - o.t0;
      if (!o.hit && age >= 0.6) {
        o.hit = true;
        let n = 0;
        for (const e of nfLine(o.A, o.B, o.s.area)) {
          damageEnemy(e, o.s.dmg, o.src);
          if (!e.dead) { e.reactCd = 0; applyElement(e, 'poison', o.s.dmg * 0.5, o.src); } // (Blood and Cooties in the same hit)
          if (o.itch && !e.dead && nfPlain(e)) { e.dazeT = Math.max(e.dazeT || 0, G.t + 1); e.nfNoFireT = G.t + 1; e.nfScratchT = G.realT + 1; }
          n++;
        }
        if (n) healPlayer(G.P.maxHp * 0.01 * Math.min(n, 12));
        cam.shake = Math.min(10, cam.shake + 5); hitStop(0.05, 0.4); sfx('boom');
      }
      return G.t < o.end;
    },
    over(o, df) { nfDrawNeedle(o, df); },
  },
  sheen: {
    tick(o) {
      o.r = Math.min(o.R, o.R * (G.t - o.t0) / 0.8);
      if (G.t > o.end + 0.6) return false;
      if (G.t < o.end && nfEvery(o, 't', 0.5)) forNear(o.x, o.y, o.r, e => {
        if (!nfFoe(e)) return;
        damageEnemy(e, o.s.dmg * 0.5, nfZone(o.src));
        if (e.dead) return;
        const fresh = !(e.nfPerishT > G.t), had = (e.ifn || 0) + Math.max(0, (e.armour || 0) - (e.shred || 0)) * (e.armK || 1);
        e.nfPerishT = G.t + 6;
        if (fresh) { e.nfPerishR = G.realT; NFS().perished.push(e); if (had > 0) floatText(e.x, e.y - e.r - 12, 'PERISHED', '#c8a2ff', 11, 0.7); }
        e.ifn = 0; e.shred = (e.armour || 0) + 4;
        if (fresh && o.expired && had > 0) after(0.25, () => { if (!G) return; forNear(e.x, e.y, 90, n => { if (n !== e && nfFoe(n)) damageEnemy(n, o.s.dmg * 1.5 + had * 2, Object.assign({}, o.src, { knock: 160, kx: n.x - e.x, ky: n.y - e.y })); }); spawnPart(e.x, e.y, '#e9d8ff', 8, 160, 0.4, 2.5); });
      });
    },
    under(o, df) {
      const t = G.realT, x = sx(o.x), y = sy(o.y), r = o.r * S, k = clamp((o.end + 0.6 - G.t) / 0.6, 0, 1);
      if (r < 2) return;
      if (df) ctx.globalCompositeOperation = 'lighter';
      softBlob(x, y, r * 0.9, o.seed, t * 0.5, 0.12, df ? '#b9a6ff' : '#c8b6ff', (df ? 0.16 : 0.3) * k);
      // A glossy band slides across the sheen, and fine beads catch the light.
      const ba = t * 0.6 + o.seed;
      soft(x + Math.cos(ba) * r * 0.4, y + Math.sin(ba) * r * 0.4, r * 0.35, '#ffffff', (df ? 0.18 : 0.22) * k);
      ctx.fillStyle = ha(df ? '#f4eeff' : '#ffffff', 0.55 * k); ctx.beginPath();
      for (let i = 0; i < 18; i++) { const a = tfR(o.id, i) * TAU, d = Math.sqrt(tfR(o.id, i + 40)) * r * 0.95; ctx.moveTo(x + Math.cos(a) * d + 1.3 * S, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (0.8 + tfR(o.id, i + 7)) * S, 0, TAU); }
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  vial: {
    tick(o, dt) {
      const s = o.s;
      const e = o.e;
      if (o.hop.t < 1) o.hop.t = Math.min(1, o.hop.t + dt / 0.25);
      if (e && !e.dead) { o.x = e.x; o.y = e.y; }
      if (o.boomT) {
        if (G.t < o.boomT) return true;
        if (e && !e.dead) {
          let el = pick(NF_TYPES);
          if (o.matched) { const h = chemHas(e), ok = NF_TYPES.filter(k => NF_TYPES.some(j => h[j] && j !== k && RX_PAIR[k + '+' + j])); if (ok.length) el = pick(ok); }
          e.reactCd = 0;
          damageEnemy(e, s.dmg * 3.5, nfAs(o.src, el));
          floatText(o.x, o.y - 34, ELEMENTS[el].name.toUpperCase(), ELEMENTS[el].color, 14, 1);
          G.fx.push({ type: 'flash', x: o.x, y: o.y, r: 60, color: ELEMENTS[el].color, life: 0.2, max: 0.2 }); sfx('boom');
        }
        return false;
      }
      if (G.t < o.next && e && !e.dead) return true;
      o.passes++;
      if (o.passes >= o.max) { o.boomT = G.t + 0.5; G.musCutT = G.t + 0.9; return true; }
      const n = acquireMany('nearest', 300, o.x, o.y, 4).find(x => x !== e && x !== o.prev && nfFoe(x)) || acquireMany('nearest', 300, o.x, o.y, 3).find(x => x !== e && nfFoe(x));
      if (!n) { if (!e || e.dead) return false; o.next = G.t + 0.6; return true; }
      o.prev = e; o.hop = { fx: o.x, fy: o.y, t: 0 }; o.e = n; o.next = G.t + 0.6;
      damageEnemy(n, s.dmg * 0.6, nfAs(o.src, 'phys'));
      if (o.split && !n.dead) damageEnemy(n, s.dmg * 0.4, nfAs(o.src, pick(NF_TYPES)));
      return true;
    },
    over(o, df) {
      const k = o.hop.t, e = o.e, tx = e ? e.x : o.x, ty = e ? e.y - e.r - 14 : o.y - 20;
      const x = sx(lerp(o.hop.fx, tx, k)), y = sy(lerp(o.hop.fy - 20, ty, k) - Math.sin(k * Math.PI) * 40), sc = Math.max(0.8, S);
      nfVial(x, y, sc, df, o.boomT ? 1 : 0);
    },
  },
  ouija: {
    tick(o) {
      if (o.end) return G.t < o.end;
      if (G.t < o.next) { const L = o.L[o.i], f = clamp(1 - (o.next - G.t) / 0.32, 0, 1) ** 0.6; o.px += (L.x - o.px) * Math.min(1, f); o.py += (L.y - o.py) * Math.min(1, f); return true; }
      const L = o.L[o.i]; L.lit = G.realT;
      forNear(L.x, L.y, o.s.area, e => { if (!nfFoe(e)) return; damageEnemy(e, o.s.dmg, o.src); if (!e.dead) { e.curse = Math.max(e.curse || 0, 3); o.cursed.add(e); } });
      o.i++; o.next = G.t + 0.32;
      if (o.i >= o.L.length) {
        o.i = o.L.length - 1; o.end = G.t + 1.2;
        const m = o.L[Math.floor(o.L.length / 2)]; floatText(m.x, m.y - 40, o.word, '#e6fbff', 18, 1.4, true);
        if (o.bye) after(0.4, () => { if (!G) return; for (const e of o.cursed) if (!e.dead && !e.charmed) damageEnemy(e, o.s.dmg * 0.5 * o.L.length, o.src); floatText(m.x, m.y - 20, 'GOODBYE', '#e6fbff', 14, 1); });
      }
      return true;
    },
    under(o, df) {
      const t = G.realT, fade = o.end ? clamp((o.end - G.t) / 0.6, 0, 1) : 1;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < o.L.length; i++) {
        const L = o.L[i], lit = L.lit ? clamp(1 - (G.realT - L.lit) / 1.5, 0.35, 1) : 0.18, x = sx(L.x) + Math.sin(t * 0.8 + i) * 2 * S, y = sy(L.y) + Math.cos(t * 0.7 + i * 1.3) * 2 * S;
        soft(x, y, 20 * S, df ? '#bff4ff' : '#4a6a78', (df ? 0.16 : 0.12) * fade * (0.5 + lit));
        ctx.font = `700 ${Math.round(24 * Math.max(0.8, S))}px Georgia, serif`;
        ctx.fillStyle = ha(df ? '#e6fbff' : '#24343c', (df ? 0.9 : 0.75) * lit * fade); ctx.fillText(L.ch, x, y);
      }
    },
    over(o, df) {
      if (o.end && G.t > o.end - 0.3) return;
      const x = sx(o.px), y = sy(o.py), sc = Math.max(0.8, S), a = Math.sin(G.realT * 1.7) * 0.15;
      if (df) { ctx.globalCompositeOperation = 'lighter'; soft(x, y, 30 * sc, '#bff4ff', 0.3); ctx.globalCompositeOperation = 'source-over'; } else soft(x, y + 6 * sc, 28 * sc, '#000000', 0.18);
      // The planchette: a cartoon prop, a rounded heart with a lens.
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, -20 * sc); ctx.bezierCurveTo(16 * sc, -18 * sc, 20 * sc, 4 * sc, 0, 18 * sc); ctx.bezierCurveTo(-20 * sc, 4 * sc, -16 * sc, -18 * sc, 0, -20 * sc); ctx.closePath();
      ctx.fillStyle = df ? '#e9dcc4' : '#d8c3a0'; ctx.fill();
      ctx.lineWidth = 1.2 * sc; ctx.strokeStyle = df ? '#ffffff' : '#7a6448'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -4 * sc, 6 * sc, 0, TAU); ctx.fillStyle = df ? '#1a2a30' : '#f2fbff'; ctx.fill(); ctx.strokeStyle = df ? '#bff4ff' : '#5a4630'; ctx.stroke();
      ctx.restore();
    },
  },
  ant: {
    tick(o) {
      const e = o.e, age = G.t - o.t0, s = o.s;
      if (!o.hit && e && !e.dead) { o.x = e.x; o.y = e.y; }
      if (!o.hit && age >= 0.45) {
        o.hit = true;
        if (e && !e.dead) damageEnemy(e, s.dmg, Object.assign({}, o.src, { shred: 8 }));
        // Acid along a line behind it (from the head's side, through the target and on).
        const b = o.a + Math.PI, A = { x: o.x, y: o.y }, B = { x: o.x + Math.cos(b) * 260, y: o.y + Math.sin(b) * 260 };
        o.B = B;
        for (const n of nfLine(A, B, s.area)) if (n !== e) damageEnemy(n, s.dmg * 0.4, Object.assign({}, o.src, { shred: 4 }));
        for (let i = 0; i < 14; i++) { const u = Math.random(); fxParts('bubble', A.x + (B.x - A.x) * u + rand(-10, 10), A.y + (B.y - A.y) * u + rand(-10, 10), '#c6ff3d', 1, 40, 0.8, 2.5); }
        if (o.trail) nfAdd({ k: 'trail', A, B, end: G.t + 4 });
        cam.shake = Math.min(10, cam.shake + 4); hitStop(0.05, 0.4); sfx('boom');
      }
      return G.t < o.end;
    },
    over(o, df) { nfDrawAnt(o, df); },
  },
  trail: {
    tick(o) {
      if (nfEvery(o, 't', 0.25)) forNear((o.A.x + o.B.x) / 2, (o.A.y + o.B.y) / 2, 300, e => {
        if (!nfFoe(e) || !nfPlain(e)) return;
        const dx = o.B.x - o.A.x, dy = o.B.y - o.A.y, l2 = dx * dx + dy * dy || 1, u = clamp(((e.x - o.A.x) * dx + (e.y - o.A.y) * dy) / l2 + 0.25, 0, 1);
        e.nfLure = { x: o.A.x + dx * u, y: o.A.y + dy * u }; e.nfLureT = G.t + 0.35;
      });
      return G.t < o.end;
    },
    under(o, df) {
      const k = clamp((o.end - G.t) / 0.8, 0, 1), t = G.realT;
      ctx.fillStyle = ha(df ? '#e2ff9a' : '#7fbf2a', 0.45 * k); ctx.beginPath();
      for (let i = 0; i < 22; i++) { const u = (i / 22 + t * 0.05) % 1, x = sx(o.A.x + (o.B.x - o.A.x) * u) + Math.sin(i * 2.1) * 5 * S, y = sy(o.A.y + (o.B.y - o.A.y) * u) + Math.cos(i * 1.7) * 5 * S; ctx.moveTo(x + 1.5 * S, y); ctx.arc(x, y, 1.5 * S, 0, TAU); }
      ctx.fill();
    },
  },
  bloom: { tick(o) { return G.t < o.end; }, over(o, df) { const p = me(), k = (G.t - o.t0) / 0.9, x = sx(p.x), y = sy(p.y); for (let i = 0; i < 4; i++) { const a = i * 1.6 + k * 3; soft(x + Math.cos(a) * 6 * S * k, y + Math.sin(a) * 6 * S * k, (5 + 9 * k) * S, df ? '#e8d6c0' : '#7a6650', 0.45 * (1 - k)); } } },
  beetle: {
    tick(o, dt, p) {
      if (G.t < o.next) return true;
      if (o.n >= o.max) return G.t < o.next + 0.25;
      o.n++; o.next = G.t + (o.turret ? 0.09 : 0.06);
      if (o.turret && o.n > 2) { const c = acquire('cluster', 360, p.x, p.y); if (c) o.a += angDiff(Math.atan2(c.y - p.y, c.x - p.x), o.a) * 0.4; }
      nfCone(p.x, p.y, o.a, o.s.area, 0.36, e => damageEnemy(e, o.s.dmg, nfZone(o.src)));
      for (let i = 0; i < 3; i++) { const b = o.a + rand(-0.35, 0.35), v = rand(280, 520); G.parts.length < qualParts() && G.parts.push({ x: p.x, y: p.y, vx: Math.cos(b) * v, vy: Math.sin(b) * v, life: 0.35, max: 0.35, color: '#d4ff6b', size: 2.5, k: 'spark' }); }
      if (o.n % 2) fxParts('smoke', p.x + Math.cos(o.a) * 40, p.y + Math.sin(o.a) * 40, '#e8f0e0', 1, 60, 0.6, 8);
      o.flick = G.realT;
      return true;
    },
    over(o, df) { nfDrawBeetle(o, df); },
  },
  crab: {
    tick(o, dt) {
      const N = NFS(), e = o.host;
      if (o.hop) {
        o.hop.t += dt / 0.3;
        if (o.hop.t >= 1) { o.hop = null; if (nfFoe(e)) damageEnemy(e, o.s.dmg, o.src); }
        return true;
      }
      if (!e || e.dead || e.nfGone) {
        if (e && e.dead && o.nits && !o.laid) { o.laid = true; nfAdd({ k: 'nits', x: e.x, y: e.y, end: G.t + 2, s: o.s, src: o.src, w: o.w }); }
        const n = e ? acquire('nearest', 140, e.x, e.y) : null;
        if (n && G.t < o.end && !(e && e.nfGone)) { o.hop = { fx: e.x, fy: e.y, t: 0 }; o.host = n; return true; }
        N.crabN = Math.max(0, (N.crabN || 1) - 1); return false;
      }
      if (G.t > o.end) { N.crabN = Math.max(0, (N.crabN || 1) - 1); return false; }
      o.ang += rand(-6, 6) * dt + dt * 2;
      if (G.t > o.scr && nfPlain(e)) { o.scr = G.t + 2.2; e.nfNoFireT = G.t + 1; e.nfScratchT = G.realT + 1; e.dazeSlowT = Math.max(e.dazeSlowT || 0, G.t + 1); }
      if (G.t > o.jump) {
        o.jump = G.t + 0.7;
        forNear(e.x, e.y, e.r + 20, n => { if (n !== e && nfFoe(n) && !(n.nfCrabT > G.t) && Math.hypot(n.x - e.x, n.y - e.y) < n.r + e.r + 6) { n.nfCrabT = G.t + 0.5; nfCrab(n, e.x, e.y, o.s, o.src, o.w); return true; } });
      }
      e.nfCrabT = G.t + 0.5;
      if (o.grip && nfPlain(e)) { const m = acquireMany('nearest', 260, e.x, e.y, 6).find(n => n !== e && n.nfCrabT > G.t); if (m) { const v = nfToward(e, m.x, m.y); e.kx += v.x * 260 * dt; e.ky += v.y * 260 * dt; } }
      return true;
    },
    over(o, df) {
      const e = o.host;
      let x, y;
      if (o.hop) { const k = clamp(o.hop.t, 0, 1), tx = e ? e.x : o.hop.fx, ty = e ? e.y : o.hop.fy; x = sx(lerp(o.hop.fx, tx, k)); y = sy(lerp(o.hop.fy, ty, k) - Math.sin(k * Math.PI) * 26); }
      else { if (!e || e.dead) return; const sc = e.nfScratchT > G.realT ? 3 : 1, a = o.ang + Math.sin(G.realT * 9 * sc + o.id) * 0.3, d = e.r * (0.55 + 0.15 * Math.sin(G.realT * 5 + o.id)); x = sx(e.x + Math.cos(a) * d); y = sy(e.y + Math.sin(a) * d); }
      nfCrabSprite(x, y, Math.max(0.8, S) * 1.5, o.ang * 2, df);
    },
  },
  nits: {
    tick(o) { if (G.t < o.end) return true; for (const e of acquireMany('nearest', 160, o.x, o.y, 2)) nfCrab(e, o.x, o.y, o.s, o.src, o.w); return false; },
    over(o, df) { const x = sx(o.x), y = sy(o.y), sc = Math.max(0.8, S), w = Math.sin(G.realT * 10) * (G.t > o.end - 0.5 ? 1 : 0.2); ctx.fillStyle = df ? '#e6e6e6' : '#6a6a6a'; ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = i * 2.1 + w * 0.2; ctx.moveTo(x + Math.cos(a) * 5 * sc + 2 * sc, y + Math.sin(a) * 5 * sc); ctx.ellipse(x + Math.cos(a) * 5 * sc, y + Math.sin(a) * 5 * sc, 2 * sc, 3 * sc, a, 0, TAU); } ctx.fill(); },
  },
  vdg: {
    tick(o, dt, p) {
      const n = acquire('nearest', 300, p.x, p.y), a = n ? Math.atan2(n.y - p.y, n.x - p.x) : -Math.PI / 3, tx = p.x + Math.cos(a) * 70, ty = p.y + Math.sin(a) * 70;
      o.x += (tx - o.x) * Math.min(1, dt * 3); o.y += (ty - o.y) * Math.min(1, dt * 3);
      if (o.earth) forNear(o.x, o.y, o.s.area * 0.8, e => { if (nfFoe(e) && nfPlain(e) && e.r <= 18) { const v = nfToward(e, o.x, o.y, 20); e.kx += v.x * 260 * dt; e.ky += v.y * 260 * dt; } });
      forNear(o.x, o.y, 30, e => { if (nfFoe(e) && nfEvery(e, 'vdg', 0.5)) damageEnemy(e, o.s.dmg * 0.4, nfZone(o.src)); });
      if (o.zap.length) o.zap = o.zap.filter(z => G.realT - z.t < 0.15);
      if (G.t < o.end) return true;
      // Discharge: one arc per bullet caught (at least two).
      const ts = acquireMany('nearest', 450, o.x, o.y, 8), n2 = Math.max(o.gap ? 0 : 2, o.gap ? 0 : o.charge);
      for (let i = 0; i < n2 && ts.length; i++) { const e = ts[i % ts.length]; if (e.dead) continue; bolt(o.x, o.y, e.x, e.y, '#ffe94a', 0.2); damageEnemy(e, o.s.dmg, o.src); }
      G.fx.push({ type: 'flash', x: o.x, y: o.y, r: 60, color: '#fff3b0', life: 0.2, max: 0.2 }); sfx('zap');
      return false;
    },
    bullet(o, b, dt) {
      const dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy);
      if (d > o.s.area) return false;
      if (d < 24) {
        b.dead = true; o.charge = Math.min(30, o.charge + 1); o.zap.push({ x: b.x, y: b.y, t: G.realT });
        if (o.gap) { const e = acquire('nearest', 420, o.x, o.y); if (e) { bolt(o.x, o.y, e.x, e.y, '#ffe94a', 0.14); damageEnemy(e, o.s.dmg, o.src); } }
        return true;
      }
      const sp = Math.hypot(b.vx, b.vy), cur = Math.atan2(b.vy, b.vx), want = Math.atan2(dy, dx), na = cur + clamp(angDiff(want, cur), -5 * dt, 5 * dt);
      b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
      return false;
    },
    over(o, df) {
      const x = sx(o.x), y = sy(o.y), sc = Math.max(0.8, S), t = G.realT, ch = Math.min(1, o.charge / 12), k = clamp((o.end - G.t) / 0.3, 0, 1) || 1, R = (18 + 4 * ch) * sc;
      ctx.globalCompositeOperation = 'lighter';
      soft(x, y, R * 2.4, '#ffe94a', (df ? 0.22 : 0.3) * (0.6 + 0.4 * ch) * k);
      soft(x, y, R, '#fff8d6', (df ? 0.6 : 0.7) * k, 0.6);
      for (let i = 0; i < 3; i++) { const a = t * (1.5 + i) + i * 2; soft(x + Math.cos(a) * R * 0.5, y + Math.sin(a) * R * 0.5, R * 0.4, '#ffffff', 0.35 * k); }
      ctx.globalCompositeOperation = 'source-over';
      for (const z of o.zap) { ctx.strokeStyle = ha('#fff3b0', 0.9); ctx.lineWidth = 1.4 * sc; ctx.beginPath(); ctx.moveTo(x, y); const zx = sx(z.x), zy = sy(z.y); ctx.lineTo((x + zx) / 2 + rand(-6, 6) * sc, (y + zy) / 2 + rand(-6, 6) * sc); ctx.lineTo(zx, zy); ctx.stroke(); }
      if (Math.random() < 0.3) { const a = Math.random() * TAU; ctx.strokeStyle = ha('#ffffff', 0.7); ctx.lineWidth = 1 * sc; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * R * 0.8, y + Math.sin(a) * R * 0.8); ctx.lineTo(x + Math.cos(a + 0.2) * R * 1.5, y + Math.sin(a + 0.2) * R * 1.5); ctx.stroke(); }
    },
  },
  womb: {
    tick(o, dt) {
      const s = o.s;
      if (o.host) { if (o.host.dead || o.host.nfGone || G.t > o.stopEnd) o.host = null; else { o.x += (o.host.x - o.x) * Math.min(1, dt * 6); o.y += (o.host.y - o.y) * Math.min(1, dt * 6); } }
      else { o.x += Math.cos(o.a) * o.v * dt; o.y += Math.sin(o.a) * o.v * dt + Math.sin((G.t - o.t0) * 3 + o.seed) * 14 * dt; }
      if (G.t > o.end) return false;
      if (nfEvery(o, 't', 0.4)) forNear(o.x, o.y, s.area, e => {
        if (!nfFoe(e)) return;
        damageEnemy(e, s.dmg, nfZone(o.src)); if (!e.dead) e.curse = Math.max(e.curse || 0, 3);
        if (o.ectopic && !o.stopped && !e.dead) { const top = acquire('strongest', 300, o.x, o.y); if (top === e) { o.stopped = true; o.host = e; o.stopEnd = G.t + 3; o.end = Math.max(o.end, G.t + 3); floatText(e.x, e.y - e.r - 12, 'ECTOPIC', '#dff8ff', 11, 0.7); } }
      });
      if (!o.host) forNear(o.x, o.y, s.area * 2.4, e => {
        if (!nfFoe(e) || !nfPlain(e)) return;
        const rx = e.x - o.x, ry = e.y - o.y, ux = Math.cos(o.a), uy = Math.sin(o.a), side = -rx * uy + ry * ux; // (pulled in to its path)
        e.kx += uy * side * 2.2 * dt * (s.pull / 140) * 6 - rx * 0.6 * dt; e.ky += -ux * side * 2.2 * dt * (s.pull / 140) * 6 - ry * 0.6 * dt;
      });
      return true;
    },
    over(o, df) { nfDrawWomb(o, df); },
  },
  husk: {
    tick(o, dt, p) {
      p.iframes = Math.max(p.iframes || 0, o.end - G.t + 0.05);
      if (G.t < o.end) return true;
      forNear(p.x, p.y, o.s.area, e => { if (nfFoe(e)) damageEnemy(e, o.s.dmg, Object.assign({}, o.src, { knock: 450, kx: e.x - p.x, ky: e.y - p.y })); });
      for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < o.s.area * 0.6) b.dead = true;
      if (o.rehyd) healPlayer(G.P.maxHp * 0.15);
      fxParts('drop', p.x, p.y, '#7fb3ff', 18, 260, 0.6, 3); G.fx.push({ type: 'flash', x: p.x, y: p.y, r: o.s.area * 0.6, color: '#cfe6ff', life: 0.25, max: 0.25 });
      floatText(p.x, p.y - 36, 'REHYDRATED', '#7fb3ff', 13, 0.8); sfx('boom'); cam.shake = Math.min(8, cam.shake + 4);
      return false;
    },
    bullet(o, b) {
      if (!o.vac) return false;
      const p = me();
      if (Math.hypot(b.x - p.x, b.y - p.y) > 34) return false;
      b.dead = true;
      const e = b.owner;
      if (e && !e.dead && !e.charmed) { bolt(p.x, p.y, e.x, e.y, '#cfe6ff', 0.12); damageEnemy(e, Math.max(o.s.dmg, b.dmg * 2), o.src); }
      return true;
    },
    over(o, df) { nfDrawHusk(o, df); },
  },
  tunnel: {
    tick(o, dt, p) { if (G.t < o.t0 + 0.3) o.cur = { x: p.x, y: p.y }; return G.t < o.end; },
    under(o, df) {
      const k = clamp((o.end - G.t) / 0.6, 0, 1), c = o.cur || o.B;
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath(); ctx.moveTo(sx(o.A.x), sy(o.A.y)); ctx.lineTo(sx(c.x), sy(c.y));
      softStroke(10 * S * k, df ? '#f2f6ff' : '#ffffff', 0.35 * k);
      ctx.globalCompositeOperation = 'source-over';
    },
    over(o) { if (G.t < o.t0 + 0.3) { const p = me(); ctx.globalCompositeOperation = 'lighter'; soft(sx(p.x + Math.cos(o.a) * 10), sy(p.y + Math.sin(o.a) * 10), 26 * S, '#ffffff', 0.7); ctx.globalCompositeOperation = 'source-over'; } },
  },
  fat: {
    tick(o) {
      const s = o.s;
      if (o.st === 'fly') { if (G.t < o.land) return true; o.st = 'slick'; spawnPart(o.x, o.y, '#d99a2b', 8, 120, 0.4, 3); }
      if (o.st === 'slick') {
        if (nfEvery(o, 't', 0.5)) forNear(o.x, o.y, o.r, e => { if (nfFoe(e)) damageEnemy(e, s.dmg * 0.25, nfZone(o.src)); });
        if (G.t >= o.ign) {
          o.st = 'fire'; o.fT = G.t;
          aoe(o.x, o.y, o.r, s.dmg * 1.6, nfAs(o.src, 'fire'), '#ff9e00');
          if (G.zones.length < 200) G.zones.push({ x: o.x, y: o.y, r: o.r * 0.8, life: 3, max: 3, dps: s.dmg * 0.6, elem: 'fire', pull: 0, color: '#ff9e00', tick: 0, src: nfAs(o.src, 'fire', { noStatus: true }), flame: true });
          nfSayRx('greasefire', o.x, o.y, o.r * 0.5);
        }
        return true;
      }
      return G.t < (o.fT || G.t) + 0.6;
    },
    under(o, df) {
      const t = G.realT, s = o.s;
      if (o.st === 'fly') { const k = clamp(1 - (o.land - G.t) / 0.35, 0, 1), x = sx(lerp(o.x0, o.x, k)), y = sy(lerp(o.y0, o.y, k) - Math.sin(k * Math.PI) * 60); softBlob(x, y, 12 * S, o.id, t, 0.12, '#d99a2b', 0.8); return; }
      const x = sx(o.x), y = sy(o.y), R = o.r * S, spread = clamp((G.t - o.land) / 0.6, 0, 1), heat = o.st === 'slick' ? clamp(1 - (o.ign - G.t) / Math.max(0.1, o.ign - o.land), 0, 1) : 1;
      const k = o.st === 'fire' ? clamp(1 - (G.t - o.fT) / 0.6, 0, 1) : 1;
      if (df) ctx.globalCompositeOperation = 'lighter';
      softBlob(x, y, R * spread, o.id, t * 0.5, 0.12, df ? '#b9a6ff' : '#c8b6ff', (df ? 0.14 : 0.26) * k); // (the slick's sheen)
      const beat = 0.5 + 0.5 * Math.sin(t * (4 + 14 * heat));
      softBlob(x, y, (14 + 6 * heat + 3 * beat) * S, o.id + 3, t * (1 + 3 * heat), 0.14, heat > 0.6 ? '#ffb347' : '#d99a2b', 0.85 * k);
      for (let i = 0; i < 2 + Math.floor(heat * 5); i++) { const a = tfR(o.id, i) * TAU + t * 0.4, d = ((t * (0.6 + heat) + tfR(o.id, i + 9)) % 1) * 18 * S; soft(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 * S, '#fff1c9', 0.6 * k); }
      ctx.globalCompositeOperation = 'source-over';
      if (o.st === 'fire') { ctx.globalCompositeOperation = 'lighter'; soft(x, y, R * 1.2, '#ff9e00', 0.5 * k); ctx.globalCompositeOperation = 'source-over'; }
    },
  },
  wave: {
    tick(o, dt) {
      const r0 = o.r; o.r += dt * 900;
      forNear(o.x, o.y, o.r + 30, e => {
        if (!nfFoe(e) || o.hit.has(e)) return;
        const d = Math.hypot(e.x - o.x, e.y - o.y);
        if (d > o.r + e.r || d < r0 - 60) return;
        o.hit.add(e); damageEnemy(e, o.s.dmg, Object.assign({}, o.src, { knock: 520, kx: e.x - o.x, ky: e.y - o.y }));
      });
      for (const b of G.ebul) {
        if (b.dead || b.nfSwept) continue;
        const dx = b.x - o.x, dy = b.y - o.y, d = Math.hypot(dx, dy) || 1;
        if (d < o.r) { const v = Math.max(200, Math.hypot(b.vx, b.vy)); b.vx = dx / d * v; b.vy = dy / d * v; b.nfSwept = true; }
      }
      return o.r < o.R + 60;
    },
    under(o, df) {
      const x = sx(o.x), y = sy(o.y), R = o.r * S, k = clamp(1 - o.r / (o.R + 60), 0, 1), t = G.realT;
      if (R < 4) return;
      // Foam and bubbles racing out, a frothy lip, thinning behind: never one hard line.
      const g = ctx.createRadialGradient(x, y, Math.max(0, R - 70 * S), x, y, R);
      g.addColorStop(0, 'rgba(160,200,255,0)'); g.addColorStop(0.8, `rgba(170,205,255,${(df ? 0.1 : 0.16) * k})`); g.addColorStop(1, 'rgba(220,235,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
      const n = Math.min(90, 24 + Math.round(o.r / 7));
      ctx.fillStyle = ha('#ffffff', (df ? 0.7 : 0.6) * k); ctx.beginPath();
      for (let i = 0; i < n; i++) { const a = i / n * TAU + tfR(o.id, i) * 0.2, rr = R - tfR(o.id, i + 3) * 18 * S + Math.sin(a * 7 + t * 4) * 3 * S, b = (1 + tfR(o.id, i + 5) * 2.5) * S; ctx.moveTo(x + Math.cos(a) * rr + b, y + Math.sin(a) * rr); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, b, 0, TAU); }
      ctx.fill();
    },
  },
  string: {
    tick(o, dt) {
      const a = o.a, b = o.b;
      if (!nfFoe(a) || !nfFoe(b) || G.t > o.end) { nfSnap(o); return false; }
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      if (d > o.L0 * 2.6 + 120) { nfSnap(o); return false; }
      if (d > o.L0 * 0.8) { const f = Math.min(500, (d - o.L0 * 0.8) * 4) * dt; if (nfPlain(a)) { a.kx += ux * f; a.ky += uy * f; } if (nfPlain(b)) { b.kx -= ux * f; b.ky -= uy * f; } }
      a.dazeSlowT = Math.max(a.dazeSlowT || 0, G.t + 0.3); b.dazeSlowT = Math.max(b.dazeSlowT || 0, G.t + 0.3);
      if (G.t > o.carryT) { // (statuses run along the string)
        o.carryT = G.t + 0.6;
        const ha_ = chemHas(a), hb = chemHas(b); let n = 0;
        for (const k of NF_TYPES) {
          if (n >= 2) break;
          if (ha_[k] && !hb[k]) { b.reactCd = 0; applyElement(b, k, o.s.dmg * 0.3, o.src); n++; }
          else if (hb[k] && !ha_[k]) { a.reactCd = 0; applyElement(a, k, o.s.dmg * 0.3, o.src); n++; }
          if (a.dead || b.dead) break;
        }
      }
      return true;
    },
    under(o, df) {
      const a = o.a, b = o.b;
      if (a.dead || b.dead) return;
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1, slack = clamp(1 - d / (o.L0 * 1.3), 0, 1), w = clamp(o.L0 / d, 0.3, 1.2) * 2.2 * S, k = clamp((o.end - G.t) / 0.4, 0, 1);
      const x0 = sx(a.x), y0 = sy(a.y), x1 = sx(b.x), y1 = sy(b.y), sag = (slack * 24 + 4) * S * (1 + 0.15 * Math.sin(G.realT * 3 + o.seed));
      if (df) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = ha(df ? '#eef3c8' : '#a8b84a', (df ? 0.45 : 0.55) * k); strand(x0, y0, x1, y1, w * 1.8, sag);
      ctx.fillStyle = ha('#ffffff', (df ? 0.6 : 0.5) * k); strand(x0, y0 - w * 0.4, x1, y1 - w * 0.4, w * 0.5, sag);
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  tonic: {
    tick(o) {
      if (G.t > o.end) return false;
      if (G.t >= o.tick) {
        o.tick = G.t + 0.25;
        for (const m of o.movers) { const e = m.e; if (e.dead) continue; const mv = Math.hypot(e.x - m.x, e.y - m.y); m.x = e.x; m.y = e.y; if (mv > 6) { damageEnemy(e, o.s.dmg * (o.twitch ? 3 : 1), o.src); bolt(e.x + rand(-30, 30), e.y - 40, e.x, e.y, '#fff3b0', 0.12); } }
      }
      return true;
    },
    over(o, df) {
      const k = clamp((o.end - G.t) / 0.3, 0, 1);
      ctx.strokeStyle = ha(df ? '#ffffff' : '#fff3b0', 0.8 * k); ctx.lineWidth = Math.max(1, S); ctx.beginPath();
      let n = 0;
      for (const e of G.enemies) {
        if (n > 40 || !(e.nfTonicT > G.t) || e.dead || Math.random() > 0.25 || !nfOnView(e)) continue;
        n++; const x = sx(e.x), y = sy(e.y), r = e.r * S, a = Math.random() * TAU;
        ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a + 0.4) * r * 1.3 + rand(-3, 3), y + Math.sin(a + 0.4) * r * 1.3 + rand(-3, 3)); ctx.lineTo(x + Math.cos(a + 0.7) * r * 1.05, y + Math.sin(a + 0.7) * r * 1.05);
      }
      ctx.stroke();
    },
  },
  candle: {
    tick(o) {
      const s = o.s;
      if (nfEvery(o, 'lure', 0.25)) forNear(o.x, o.y, s.pull, e => { if (nfFoe(e) && nfPlain(e)) { e.nfLure = o; e.nfLureT = G.t + 0.35; } });
      if (nfEvery(o, 'drip', 0.5)) forNear(o.x, o.y, s.area, e => { if (!nfFoe(e)) return; damageEnemy(e, s.dmg, nfZone(o.src)); if (!e.dead) addBurn(e, s.dmg * 0.3, 'Ear Candling'); });
      if (G.t < o.end) return true;
      if (o.snuff) { aoe(o.x, o.y, s.area * 2.2, s.dmg * 3, o.src, '#f0c27a'); floatText(o.x, o.y - 30, 'SNUFFED', '#f0c27a', 12, 0.7); }
      return false;
    },
    over(o, df) { nfDrawCandle(o, df); },
  },
  acid: {
    tick(o, dt, p) {
      if (o.yeast) { const c = acquire('cluster', 500, o.x, o.y); if (c) { const v = nfToward(o, c.x, c.y, 10); o.x += v.x * 45 * dt; o.y += v.y * 45 * dt; } }
      if (nfEvery(o, 't', 0.5)) forNear(o.x, o.y, o.r, e => { if (nfFoe(e)) damageEnemy(e, o.s.dmg, Object.assign(nfZone(o.src), { shred: 2 })); });
      if (o.buffer && Math.hypot(p.x - o.x, p.y - o.y) < o.r) { NFS().bufT = G.t + 0.1; G.acidOn = 0; }
      return G.t < o.end + 0.5;
    },
    under(o, df) {
      const t = G.realT, x = sx(o.x), y = sy(o.y), R = o.r * S, k = clamp((o.end + 0.5 - G.t) / 0.5, 0, 1) * clamp((G.t - o.t0) / 0.4, 0, 1);
      // No border: the fluid fizzes, bubbles rise, and it glows most in the middle.
      if (df) ctx.globalCompositeOperation = 'lighter';
      soft(x, y, R, df ? '#9fd61a' : '#7fbf2a', (df ? 0.2 : 0.28) * k, 0.25);
      const n = 26;
      ctx.strokeStyle = ha(df ? '#e2ff9a' : '#3d5a1f', 0.6 * k); ctx.lineWidth = Math.max(0.8, 0.9 * S); ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = tfR(o.id, i) * TAU, d = Math.sqrt(tfR(o.id, i + 30)) * R * 0.9, u = (t * (0.5 + tfR(o.id, i + 60)) + tfR(o.id, i + 90)) % 1, bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d - u * 16 * S, br = (1 + 2 * u) * S * (1 - d / R * 0.5);
        ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, TAU);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  tie: {
    tick(o, dt) {
      const a = o.a, b = o.b;
      if (G.t > o.end || a.dead || b.dead) { for (const e of [a, b]) if (e.nfTie) e.nfTie = e.nfTie.filter(x => x !== o); return false; }
      if (o.cord) { const v = nfToward(a, b.x, b.y, a.r + b.r); if (nfPlain(a)) { a.kx += v.x * 300 * dt; a.ky += v.y * 300 * dt; } if (nfPlain(b)) { b.kx -= v.x * 300 * dt; b.ky -= v.y * 300 * dt; } }
      return true;
    },
    under(o, df) {
      const a = o.a, b = o.b; if (a.dead || b.dead || a.nfGone || b.nfGone) return;
      const hot = clamp(1 - (G.realT - o.flashT) / 0.3, 0, 1), k = clamp((o.end - G.t) / 0.4, 0, 1), t = G.realT;
      const x0 = sx(a.x), y0 = sy(a.y), x1 = sx(b.x), y1 = sy(b.y), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      ctx.beginPath(); ctx.moveTo(x0, y0);
      for (let i = 1; i <= 12; i++) { const u = i / 12, wv = Math.sin(u * 9 + t * 4 + o.id) * 3 * S * Math.sin(u * Math.PI); ctx.lineTo(x0 + dx * u + nx * wv, y0 + dy * u + ny * wv); }
      if (df) ctx.globalCompositeOperation = 'lighter';
      softStroke((1.2 + 0.5 * Math.sin(t * 6 + o.id) + 2.2 * hot) * S, df ? '#ff8fa3' : '#c9184a', (0.6 + 0.4 * hot) * k);
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  glob: {
    tick(o, dt) {
      let e = o.tgt;
      if (!nfFoe(e) || o.hit.has(e)) { e = o.tgt = acquireMany('nearest', 280, o.x, o.y, 6).find(n => !o.hit.has(n) && nfFoe(n)) || null; if (!e) { nfGlobEnd(o); return false; } }
      const v = nfToward(o, e.x, e.y), sp = 560;
      o.vx = v.x * sp; o.vy = v.y * sp; o.x += o.vx * dt; o.y += o.vy * dt;
      if (Math.hypot(e.x - o.x, e.y - o.y) < e.r + 8) {
        damageEnemy(e, o.s.dmg, o.src);
        if (!e.dead) { e.chill = Math.max(e.chill || 0, 2.5); e.chillAmt = Math.min(0.6, (e.chillAmt || 0) + 0.08); }
        o.hit.add(e); o.last = { x: e.x, y: e.y, e }; o.lastT = G.realT; o.left--;
        spawnPart(e.x, e.y, '#b5c96a', 4, 90, 0.4, 2.5);
        if (o.left <= 0) { nfGlobEnd(o); return false; }
        o.tgt = acquireMany('nearest', 280, e.x, e.y, 6).find(n => !o.hit.has(n) && nfFoe(n)) || null;
        if (!o.tgt) { nfGlobEnd(o); return false; }
      }
      return G.t < o.end;
    },
    over(o, df) {
      const x = sx(o.x), y = sy(o.y), a = Math.atan2(o.vy || 0, o.vx || 1), r = 7 * S;
      if (o.last && G.realT - o.lastT < 0.25 && !o.last.e.dead) { ctx.fillStyle = ha(df ? '#e6eebb' : '#8a9a3a', 0.6 * (1 - (G.realT - o.lastT) / 0.25)); strand(sx(o.last.e.x), sy(o.last.e.y), x, y, 2 * S, 6 * S); }
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(1.45, 0.85);
      ctx.fillStyle = gloss(0, 0, r, df ? '#ffffff' : '#e6eebb', df ? '#c8d27a' : '#a8b84a', df ? '#6a7330' : '#5c6628'); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.restore();
    },
  },
  leech: {
    tick(o, dt) {
      const e = o.host, s = o.s;
      if (o.hop) { o.hop.t += dt / 0.3; if (o.hop.t >= 1) o.hop = null; return true; }
      if (!e || e.dead || e.nfGone || G.t > o.end) { if (o.engorge && e && o.fed > 1) nfBurstLeech(o, e); return false; }
      if (G.t < o.tick) return true;
      o.tick = G.t + 0.25;
      e.bloodT = Math.max(e.bloodT || 0, s.bleedK ? 8 : 4); e.bloodDps = Math.max(e.bloodDps || 0, s.dmg * 0.4); e.bloodBy = 'Hirudotherapy';
      const still = Math.hypot(e.x - o.lx, e.y - o.ly) < 3; o.lx = e.x; o.ly = e.y;
      if (still) damageEnemy(e, e.bloodDps * 0.25, { dot: true, noCrit: true, noStatus: true, noArc: true, elem: 'arcane', wname: 'Hirudotherapy (bleeding)' }); // (bleeding normally needs it to move)
      healPlayer(G.P.maxHp * 0.0008, true);
      o.fed += 0.25;
      if (o.engorge && o.fed >= 3) { nfBurstLeech(o, e); return false; }
      return true;
    },
    over(o, df) {
      const e = o.host;
      let x, y, a;
      if (o.hop) { const k = clamp(o.hop.t, 0, 1); x = sx(lerp(o.hop.fx, e.x, k)); y = sy(lerp(o.hop.fy, e.y, k) - Math.sin(k * Math.PI) * 30); a = 0; }
      else { if (!e || e.dead) return; a = o.ang + Math.sin(G.realT * 0.7 + o.id) * 0.3; x = sx(e.x + Math.cos(a) * e.r * 1.05); y = sy(e.y + Math.sin(a) * e.r * 1.05); }
      nfLeechSprite(x, y, Math.max(0.8, S) * 1.5 * (1 + Math.min(0.6, o.fed * 0.15)), a, df, o.id);
    },
  },
  wall: {
    tick(o, dt, p) {
      if (o.ring) { o.cx = p.x; o.cy = p.y; }
      if (o.rip.length) o.rip = o.rip.filter(r => G.realT - r.t < 0.5);
      if (G.t > o.end) return false;
      forNear(o.cx, o.cy, o.R + 60, e => {
        if (!nfFoe(e)) return;
        const d = Math.hypot(e.x - o.cx, e.y - o.cy), inArc = Math.abs(angDiff(Math.atan2(e.y - o.cy, e.x - o.cx), o.a)) <= o.half;
        const prev = e.nfWid === o.id ? e.nfWallD : null;
        e.nfWid = o.id; e.nfWallD = d;
        if (prev != null && inArc && prev >= o.R && d < o.R) {
          damageEnemy(e, o.s.dmg, o.src); if (!e.dead) e.dazeSlowT = Math.max(e.dazeSlowT || 0, G.t + 2);
          if (o.ion && !e.dead) damageEnemy(e, o.s.dmg, nfAs(o.src, 'shock'));
          o.rip.push({ a: Math.atan2(e.y - o.cy, e.x - o.cx), t: G.realT });
        }
      });
      return true;
    },
    bullet(o, b) {
      const dx = b.x - o.cx, dy = b.y - o.cy, d = Math.hypot(dx, dy) || 1;
      if (Math.abs(d - o.R) > b.r + 7) return false;
      const ang = Math.atan2(dy, dx);
      if (Math.abs(angDiff(ang, o.a)) > o.half) return false;
      const nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny;
      if (vn >= 0) return false; // (going out: your side of it)
      b.vx -= vn * nx * 1.1; b.vy -= vn * ny * 1.1; b.x = o.cx + nx * (o.R + b.r + 7); b.y = o.cy + ny * (o.R + b.r + 7);
      if (o.rip.length < 8) o.rip.push({ a: ang, t: G.realT });
      return false;
    },
    under(o, df) { nfDrawWall(o, df); },
  },
  film: {
    tick(o, dt) {
      o.r = Math.min(o.R, o.r + 12 * (o.quorum && o.n >= 5 ? 2 : 1) * dt);
      const c = acquire('nearest', o.r + 200, o.x, o.y);
      if (c) { const v = nfToward(o, c.x, c.y, 10); o.x += v.x * 18 * dt; o.y += v.y * 18 * dt; }
      if (nfEvery(o, 't', 0.5)) {
        let n = 0;
        forNear(o.x, o.y, o.r, e => {
          if (!nfFoe(e)) return; n++;
          damageEnemy(e, o.s.dmg, nfZone(o.src)); if (e.dead) return;
          e.dazeSlowT = Math.max(e.dazeSlowT || 0, G.t + 0.6);
          if (o.persist) { if (!(e.nfPersistT > G.t)) NFS().persist.push(e); e.nfPersistT = G.t + 3.5; }
        });
        o.n = n;
      }
      return G.t < o.end + 0.6;
    },
    under(o, df) {
      const t = G.realT, x = sx(o.x), y = sy(o.y), R = o.r * S, k = clamp((o.end + 0.6 - G.t) / 0.6, 0, 1);
      if (df) ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const a = o.seed + i * 1.25, d = R * 0.35 * tfR(o.id, i);
        blobPathT(x + Math.cos(a) * d, y + Math.sin(a) * d, R * (0.62 + 0.2 * tfR(o.id, i + 5)), o.seed + i, t * 0.4, 0.13, 12);
        ctx.fillStyle = ha(df ? '#d8e0a0' : '#a8b84a', (df ? 0.07 : 0.12) * k); ctx.fill();
      }
      ctx.fillStyle = ha(df ? '#eef3c8' : '#6c7a30', (df ? 0.3 : 0.22) * k); ctx.beginPath();
      for (let i = 0; i < 16; i++) { const a = tfR(o.id, i + 20) * TAU, d = Math.sqrt(tfR(o.id, i + 40)) * R * 0.85, r = (1.5 + tfR(o.id, i + 60) * 2.5) * S; ctx.moveTo(x + Math.cos(a) * d + r, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, TAU); }
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  tide: {
    tick(o, dt) {
      o.d += o.v * dt;
      const ux = Math.cos(o.a), uy = Math.sin(o.a), push = o.heavy ? 1050 : 700;
      const fx = o.ox + ux * (o.d - o.depth / 2), fy = o.oy + uy * (o.d - o.depth / 2);
      forNear(fx, fy, o.hw, e => {
        if (!nfFoe(e)) return;
        const rx = e.x - o.ox, ry = e.y - o.oy, along = rx * ux + ry * uy, lat = Math.abs(-rx * uy + ry * ux);
        if (along > o.d || along < o.d - o.depth || lat > o.hw) return;
        if (nfPlain(e)) { e.kx += ux * push * dt; e.ky += uy * push * dt; }
        if (nfEvery(e, 'tide' + o.id, 0.4)) damageEnemy(e, o.s.dmg, nfZone(o.src));
      });
      if (G.t > o.poolT && o.pools < 4 && G.zones.length < 190) {
        o.poolT = G.t + 0.5; o.pools++;
        const lat = rand(-0.5, 0.5) * o.hw, d = o.d - o.depth * 0.6, x = o.ox + ux * d - uy * lat, y = o.oy + uy * d + ux * lat;
        if (nfOnView({ x, y })) G.zones.push({ x, y, r: 46, life: 5, max: 5, dps: o.s.dmg * 0.25, elem: 'arcane', pull: 0, color: '#a4133c', tick: 0, src: nfZone(o.src), heal: 0.006, quiet: true });
      }
      return o.d < o.D + o.depth;
    },
    under(o, df) { nfDrawTide(o, df); },
  },
  motes: {
    tick(o) { return G.t < o.end; },
    over(o, df) {
      const k = clamp((G.t - o.t0) / 0.6, 0, 1), x0 = sx(o.x), y0 = sy(o.y);
      ctx.globalCompositeOperation = 'lighter';
      if (k < 0.5) soft(x0, y0, (20 + 50 * k) * S, df ? '#cfe6ff' : '#90e0ef', 0.35 * (1 - k * 2)); // (the swell of water)
      o.to.forEach((q, i) => o.cols.forEach((c, j) => { const u = clamp(k * 1.2 - j * 0.08, 0, 1), x = lerp(x0, sx(q.x), u) + Math.sin(i + j + k * 6) * 3 * S, y = lerp(y0, sy(q.y), u); soft(x, y, 5 * S, c, 0.8 * (1 - Math.max(0, k - 0.8) * 5)); }));
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  aero: {
    tick(o, dt) {
      const ux = Math.cos(o.a), uy = Math.sin(o.a), drift = 14 * o.drift;
      let cx = 0, cy = 0;
      for (const d of o.drops) { const dr = Math.pow(0.06, dt); d.vx = d.vx * dr + ux * drift * (1 - dr); d.vy = d.vy * dr + uy * drift * (1 - dr); d.x += d.vx * dt; d.y += d.vy * dt; cx += d.x; cy += d.y; }
      cx /= o.drops.length; cy /= o.drops.length;
      if (G.t > o.tick) {
        o.tick = G.t + 0.6;
        let R = 30; for (const d of o.drops) R = Math.max(R, Math.hypot(d.x - cx, d.y - cy));
        forNear(cx, cy, Math.min(160, R * 0.8), e => { if (nfFoe(e)) damageEnemy(e, o.s.dmg * 0.5, nfZone(o.src)); });
      }
      return G.t < o.end;
    },
    under(o, df) {
      const k = clamp((o.end - G.t) / 0.8, 0, 1), t = G.realT;
      if (df) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = ha(df ? '#ffe0ef' : '#8a6070', (df ? 0.55 : 0.45) * k); ctx.beginPath();
      for (const d of o.drops) { const x = sx(d.x) + Math.sin(t * 2 + d.r * 9) * 1.5 * S, y = sy(d.y) + Math.cos(t * 1.7 + d.r * 7) * 1.5 * S, r = d.r * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  puff: { tick(o) { return G.t < o.end; }, over(o, df) { const k = (G.t - o.t0) / 0.8; if (df) ctx.globalCompositeOperation = 'lighter'; softBlob(sx(o.x), sy(o.y), o.r * S * (0.3 + 0.7 * k), o.seed, G.realT, 0.15, df ? '#ff8fa3' : '#a4133c', 0.45 * (1 - k)); ctx.globalCompositeOperation = 'source-over'; } },
  lane: {
    tick(o, dt, p) {
      if (G.t > o.end + 0.5) return false;
      if (G.t > o.end) return true;
      const ux = Math.cos(o.a), uy = Math.sin(o.a), rx = p.x - o.x0, ry = p.y - o.y0, along = rx * ux + ry * uy, lat = Math.abs(-rx * uy + ry * ux);
      if (along > -10 && along < o.L && lat < o.w) { NFS().laneT = G.t + 0.1; NFS().laneA = o.a; if (o.crypts && !o.done && along > o.L - 60) { o.done = true; if (G.stam) G.stam.cur = Math.min(stamMax(), G.stam.cur + stamMax() * 0.3); floatText(p.x, p.y - 30, 'CRYPTS', '#dfe7a0', 12, 0.7); } }
      forNear(o.x0 + ux * o.L / 2, o.y0 + uy * o.L / 2, o.L / 2 + o.w, e => {
        if (!nfFoe(e)) return;
        const ex = e.x - o.x0, ey = e.y - o.y0, al = ex * ux + ey * uy, la = Math.abs(-ex * uy + ey * ux);
        if (al < 0 || al > o.L || la > o.w + e.r) return;
        if (nfEvery(e, 'lane' + o.id, 1)) { damageEnemy(e, o.s.dmg, nfZone(o.src)); if (!e.dead) nfStick(e, 1.2); }
      });
      return true;
    },
    under(o, df) { nfDrawLane(o, df); },
  },
  surf: {
    tick(o, dt, p) {
      if (o.follow) { o.x = p.x; o.y = p.y; }
      if (G.t > o.end + 0.5) return false;
      if (G.t > o.end) return true;
      forNear(o.x, o.y, o.r, e => {
        if (!nfFoe(e)) return;
        if (o.det && e.nfSurf !== o.id) {
          e.nfSurf = o.id;
          const h = chemHas(e), ks = NF_TYPES.filter(k => h[k]);
          if (ks.length) {
            e.burn = 0; e.chill = 0; e.chillAmt = 0; e.shock = 0; e.poison = 0; e.poisonStacks = 0; e.pickle = 0; e.bloodT = 0; e.curse = 0; e.fizz = 0;
            const out = neighbours(e, o.r + 140, 6).filter(n => Math.hypot(n.x - o.x, n.y - o.y) > o.r && nfFoe(n)).slice(0, 2);
            for (const n of out) { n.reactCd = 0; for (const k of ks) if (!n.dead) applyElement(n, k, o.s.dmg, o.src); bolt(e.x, e.y, n.x, n.y, '#cdb4db', 0.12); }
          }
        }
        if (nfPlain(e)) { const v = nfToward(o, e.x, e.y); e.kx += v.x * 380 * dt; e.ky += v.y * 380 * dt; }
        if (nfEvery(e, 'surf' + o.id, 0.5)) damageEnemy(e, o.s.dmg, nfZone(o.src));
      });
      return true;
    },
    bullet(o, b, dt) {
      if (Math.abs(b.x - o.x) > o.r || Math.hypot(b.x - o.x, b.y - o.y) > o.r || G.t > o.end) return false;
      const a = Math.atan2(b.vy, b.vx) + (b.nfSkid || (b.nfSkid = Math.random() < 0.5 ? 2.2 : -2.2)) * dt, sp = Math.hypot(b.vx, b.vy);
      b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
      return false;
    },
    under(o, df) {
      const t = G.realT, x = sx(o.x), y = sy(o.y), R = o.r * S, k = clamp((o.end + 0.5 - G.t) / 0.5, 0, 1) * clamp((G.t - o.t0) / 0.4, 0, 1);
      if (df) ctx.globalCompositeOperation = 'lighter';
      soft(x, y, R, df ? '#b9a6ff' : '#cdb4db', (df ? 0.1 : 0.14) * k, 0.4);
      ctx.fillStyle = ha(df ? '#f4eeff' : '#8e7aa8', 0.6 * k); ctx.beginPath();
      for (let i = 0; i < 34; i++) { const a = tfR(o.id, i) * TAU + t * 0.1, u = (tfR(o.id, i + 50) + t * 0.12) % 1, d = Math.sqrt(u) * R, r = (0.8 + tfR(o.id, i + 9) * 1.2) * S; ctx.moveTo(x + Math.cos(a) * d + r, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, TAU); } // (beads flow outward, scattering)
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    },
  },
  vent: {
    tick(o) { return G.t < o.end; },
    under(o, df) {
      const k = (G.t - o.t0) / 0.7, x = sx(o.x), y = sy(o.y), R = o.r * S * (0.3 + 0.7 * Math.sqrt(k));
      if (df) ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, R * 0.6, x, y, R);
      g.addColorStop(0, 'rgba(198,255,61,0)'); g.addColorStop(0.75, `rgba(198,255,61,${0.3 * (1 - k)})`); g.addColorStop(1, 'rgba(198,255,61,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    },
  },
};
function nfSnap(o) {
  if (!o.elastic) return;
  const a = o.a, b = o.b;
  if (!nfFoe(a) || !nfFoe(b)) return;
  for (const [e, f] of [[a, b], [b, a]]) if (nfPlain(e)) chemBowl(e, { x: e.x * 2 - f.x, y: e.y * 2 - f.y }, 600, o.s.dmg * 1.5, o.src);
  floatText((a.x + b.x) / 2, (a.y + b.y) / 2 - 10, 'SNAP', '#d6dc8f', 11, 0.6);
}
function nfGlobEnd(o) {
  if (!o.hair) return;
  const c = o.last || o;
  forNear(c.x, c.y, 110, e => { if (!nfFoe(e)) return; damageEnemy(e, o.s.dmg * 1.2, o.src); if (!e.dead) nfStick(e, 1.5); });
  fxParts('drop', c.x, c.y, '#b5c96a', 12, 180, 0.6, 3); floatText(c.x, c.y - 20, 'HAIRBALL', '#b5c96a', 12, 0.7);
}
function nfBurstLeech(o, e) {
  for (const n of neighbours(e, 120, 5)) { n.bloodT = Math.max(n.bloodT || 0, 3); n.bloodN = Math.min(5, (n.bloodN || 0) + 2); n.bloodDps = Math.max(n.bloodDps || 0, (e.bloodDps || o.s.dmg * 0.3) * 0.8); n.bloodBy = 'Hirudotherapy'; }
  fxParts('drop', e.x, e.y, '#a4133c', 12, 180, 0.6, 3); floatText(e.x, e.y - e.r - 12, 'ENGORGED', '#a4133c', 11, 0.7);
}

// ---------------------------------------------------------------- hooks
// From the enemy bullet loop: true if this bullet is used up.
function nfBullet(b, dt) {
  const N = G.nf;
  for (const d of N.decoys) if (Math.abs(b.x - d.x) < d.r + b.r && Math.hypot(b.x - d.x, b.y - d.y) < d.r + b.r) { b.dead = true; if (d.onBullet) d.onBullet(d, b); return true; }
  for (const o of N.fx) { const K = NFK[o.k]; if (K.bullet && K.bullet(o, b, dt)) return true; }
  return false;
}
// From hurtPlayer: what a hit is worth (1: as usual).
function nfHurtMul(ent, kind, from) {
  const N = G.nf;
  let k = 1;
  const w = nfOwned('lacticacid');
  if (w && nfPath(w, 'a')) w.nfCharge = Math.min(1, (w.nfCharge || 0) + 0.15); // (Anaerobic)
  if (!N) return k;
  if (N.guilt) { if (N.guilt.dead || !N.guilt.charmed) N.guilt = null; else k *= 0.75; } // (Survivor's Guilt)
  if (kind === 'contact' && N.lubeT > G.t) k *= 0.5; // (they slide off)
  if (N.bufT > G.t && from && /acid/i.test(from)) k = 0; // (Buffer)
  if (kind === 'contact' && ent && !ent.dead) for (const o of N.fx) if (o.k === 'hag' && G.t < o.end) { nfStick(ent, 2); if (o.gill) ent.nfNoFireT = G.t + 2; floatText(ent.x, ent.y - ent.r - 10, 'GAG', '#c8d27a', 11, 0.6); k *= 0.5; break; } // (Hagfish: it gags)
  return k;
}
// From hurtPlayer, before the hit lands: Anhydrobiosis takes it instead (true: no damage).
function nfLethal(d) {
  const w = nfOwned('anhydrobiosis'), p = me();
  if (!w || w.cd > 0 || p.hp - d >= G.P.maxHp * 0.2 || G.state !== 'play') return false;
  w.cd = w.s.cd; w.reloadMax = w.s.cd; G.stats.casts = (G.stats.casts || 0) + 1;
  nfAdd({ k: 'husk', end: G.t + w.s.dur, s: w.s, src: weaponSrc(w), vac: nfPath(w, 'a'), rehyd: nfPath(w, 'b') });
  p.iframes = Math.max(p.iframes || 0, w.s.dur + 0.05);
  floatText(p.x, p.y - 36, 'ANHYDROBIOSIS', w.def.color, 14, 1); sfx('spell'); vibrate(40);
  return true;
}
// From updatePlayer: swim speed.
function nfSpeed() {
  const N = G.nf;
  if (!N) return 1;
  let k = 1;
  if (N.lubeT > G.t) k *= 1.3;
  if (N.laneT > G.t) { const p = me(), v = Math.hypot(p.vx, p.vy); if (!v || (p.vx * Math.cos(N.laneA) + p.vy * Math.sin(N.laneA)) / v > 0.3) k *= 1.4; }
  if (N.bufT > G.t) k *= 1.2;
  for (const o of N.fx) if (o.k === 'husk') return 0.05; // (a dry husk does not swim)
  return k;
}
// From updateSpellList: hold an automatic Feat until it is worth performing (true: wait).
function nfWait(w, target) {
  const p = me(), id = w.id;
  switch (id) {
    case 'anhydrobiosis': return true;
    case 'polarbody': return nfCountNear(p.x, p.y, 300) < 3 && nfBulletsNear(p.x, p.y, 220) < 3;
    case 'hagfish': return nfCountNear(p.x, p.y, 170) < 3 && nfBulletsNear(p.x, p.y, 140) < 4;
    case 'vandegraaff': case 'lipidbilayer': return nfBulletsNear(p.x, p.y, 320) < 3 && nfCountNear(p.x, p.y, 300) < 4;
    case 'rupture': return nfCountNear(p.x, p.y, 230) < 4 && nfBulletsNear(p.x, p.y, 230) < 6;
    case 'tonic': return nfCountNear(p.x, p.y, 450) < 5 && !G.enemies.some(e => e.boss && !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 450);
    case 'earcandling': return nfCountNear(p.x, p.y, 260) < 3;
    case 'selflube': return nfCountNear(p.x, p.y, 160) < 3;
    case 'shedlining': return nfCountNear(p.x, p.y, 500) < 4;
    case 'fertilewindow': return !acquire('nearest', 450, p.x, p.y);
    case 'fecaltransplant': return p.hp > G.P.maxHp * 0.7 && !(G.acidOn > G.t) && !(G.tangleT > G.t) && !G.bogeyN && !pstOn();
    case 'anticoagulant': { let n = 0; for (const e of G.enemies) if (!e.dead && e.bloodT > 0 && !e.charmed && nfOnView(e)) { n += e.boss ? 2 : 1; if (n >= 2) return false; } return true; }
    case 'lacticacid': return (w.nfCharge || 0) < 0.5 || !acquire('nearest', w.s.area, p.x, p.y);
    case 'osmosis': return !acquireMany('nearest', w.s.range, p.x, p.y, 12).some(e => chemCount(e) > 0);
  }
  return false;
}
// From damageEnemy, after a hit lands: Shared Placenta copies it; Water sets off Brown Fat; shedding shots give Cooties.
function nfDamaged(e, d, src) {
  const N = G.nf;
  if (e.nfTie && e.nfTie.length && !src.nfCopy) {
    for (const o of e.nfTie) { const q = o.a === e ? o.b : o.a; if (q.dead || q.nfGone) continue; o.flashT = G.realT; damageEnemy(q, d * (o.full ? 1 : 0.5), { elem: 'arcane', noStatus: true, noArc: true, noCrit: true, nfCopy: true, dot: !!src.dot, wname: 'Shared Placenta' }); }
  }
  if (src.elem === 'salt' && !src.nfCopy) for (const o of N.fx) if (o.k === 'fat' && o.st === 'slick' && Math.hypot(e.x - o.x, e.y - o.y) < o.r) {
    o.st = 'fire'; o.fT = G.t;
    forNear(o.x, o.y, o.r * 1.6, n => { if (!nfFoe(n)) return; shove(n, o.x, o.y, 650); damageEnemy(n, o.s.dmg * 1.4, nfAs(o.src, 'salt', { nfCopy: true })); });
    nfSayRx('dontmix', o.x, o.y, o.r * 0.6); cam.shake = Math.min(10, cam.shake + 5);
  }
  if (N.shedT > G.t && src.w && !src.w.isSpell && !src.dot && !src.nfCopy && !e.dead && nfEvery(e, 'shs', 0.25)) applyElement(e, 'poison', Math.max(2, d * 0.3), N.shedSrc);
}
// From killEnemy: an enemy died inside a Hostile Environment (it grows).
function nfKill(e, src) {
  for (const o of G.nf.fx) if (o.k === 'acid' && G.t < o.end && Math.hypot(e.x - o.x, e.y - o.y) < o.r) o.r = Math.min(o.r0 * 2, o.r + 14);
}
// Your swimmer fades while you are a husk (render.js).
const nfYouAlpha = () => (G.nf && G.nf.fx.some(o => o.k === 'husk') ? 0 : 1);

// ---------------------------------------------------------------- drawing (render.js)
function nfDraw(layer) {
  const N = G && G.nf;
  if (!N || (!N.fx.length && !N.decoys.length && !(N.wake && N.wake.length) && !(N.lubeT > G.t))) return;
  const df = !!SET.darkfield, wdf = WORLD_DF, a0 = ctx.globalAlpha;
  WORLD_DF = false; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  try {
    if (layer === 'under') {
      if (N.wake) for (const q of N.wake) { const k = 1 - (G.realT - q.t) / 1.2; soft(sx(q.x), sy(q.y), q.r * S * (1.4 - k * 0.4), df ? '#cbb9a4' : '#6e5f4e', (df ? 0.14 : 0.18) * k); }
      for (const d of N.decoys) nfDrawPolar(d, df);
    } else if (N.lubeT > G.t) { const p = me(), k = clamp((N.lubeT - G.t) / 0.5, 0, 1), x = sx(p.x), y = sy(p.y); if (df) ctx.globalCompositeOperation = 'lighter'; soft(x, y, 26 * S, '#d8b4fe', (df ? 0.25 : 0.3) * k); soft(x + Math.cos(G.realT * 3) * 6 * S, y - 5 * S, 9 * S, '#ffffff', 0.4 * k); ctx.globalCompositeOperation = 'source-over'; }
    for (const o of N.fx) { const f = NFK[o.k][layer]; if (f) { f(o, df); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } }
    if (layer === 'over') nfDrawCharge(df);
  } finally { WORLD_DF = wdf; ctx.globalAlpha = a0; ctx.globalCompositeOperation = 'source-over'; }
}
const nfDrawUnder = () => nfDraw('under');
const nfDrawOver = () => nfDraw('over');
// Lactic Acid: fizz building inside your body as it charges.
function nfDrawCharge(df) {
  const w = nfOwned('lacticacid'), k = w ? w.nfCharge || 0 : 0;
  if (k < 0.05) return;
  const p = me(), x = sx(p.x), y = sy(p.y), t = G.realT;
  ctx.fillStyle = ha(df ? '#e2ff9a' : '#7fbf2a', 0.5 * k); ctx.beginPath();
  for (let i = 0; i < Math.round(3 + k * 8); i++) { const a = i * 2.4 + t * 2, d = ((t * 1.5 + i * 0.37) % 1) * 7 * S; ctx.moveTo(x + Math.cos(a) * d + S, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (0.7 + k) * S, 0, TAU); }
  ctx.fill();
}
function nfDrawPolar(d, df) {
  const x = sx(d.x), y = sy(d.y), t = G.realT, k = clamp((d.end - G.t) / 0.3, 0, 1) * clamp((G.t - d.t0) / 0.2, 0, 1), w = d.wob, R = d.r * S;
  const sxk = 1 + 0.12 * w * Math.sin(t * 30), syk = 1 - 0.12 * w * Math.sin(t * 30);
  ctx.save(); ctx.translate(x, y); ctx.scale(sxk, syk);
  // A pale, smooth sphere with a soft glassy rim: dark middle, bright rim in Darkfield.
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R);
  if (df) { g.addColorStop(0, `rgba(30,40,60,${0.6 * k})`); g.addColorStop(0.8, `rgba(120,160,220,${0.35 * k})`); g.addColorStop(1, `rgba(230,240,255,${0.8 * k})`); }
  else { g.addColorStop(0, `rgba(255,255,255,${0.95 * k})`); g.addColorStop(0.7, `rgba(214,226,240,${0.9 * k})`); g.addColorStop(1, `rgba(150,170,195,${0.85 * k})`); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = ha('#ffffff', (df ? 0.7 : 0.5) * k); ctx.lineWidth = Math.max(1, 1.6 * S); ctx.beginPath(); ctx.arc(0, 0, R * 1.18, 0, TAU); ctx.stroke(); // (the zona: a clear halo)
  ctx.globalAlpha = 0.6 * k; soft(-R * 0.35, -R * 0.4, R * 0.35, '#ffffff', 0.8);
  ctx.restore();
}
// The mosquito: its shadow crosses first (the wind-up), then a proboscis the size of the screen stabs in at an angle,
// pauses, and withdraws. One huge blurred part from off screen.
function nfDrawNeedle(o, df) {
  const age = G.t - o.t0, ux = Math.cos(o.a), uy = Math.sin(o.a), nx = -uy * o.side, ny = ux * o.side;
  const far = Math.hypot(nfHalfW(), nfHalfH()) * 1.6;
  // Where it comes from: off screen, past the far end of the line and off to one side.
  const Fx = o.B.x + ux * far * 0.5 + nx * far * 0.5, Fy = o.B.y + uy * far * 0.5 + ny * far * 0.5;
  if (age < 0.75) { // the shadow
    const k = clamp(age / 0.6, 0, 1), cx = lerp(Fx, (o.A.x + o.B.x) / 2, k), cy = lerp(Fy, (o.A.y + o.B.y) / 2, k), R = 260 * S, op = Math.sin(Math.min(1, age / 0.75) * Math.PI);
    ctx.save(); ctx.translate(sx(cx), sy(cy)); ctx.rotate(Math.atan2(o.A.y - Fy, o.A.x - Fx));
    if (df) { ctx.globalCompositeOperation = 'lighter'; ctx.scale(1.6, 0.6); soft(0, 0, R, '#ffffff', 0.05 * op); }
    else { ctx.scale(1.6, 0.6); soft(0, 0, R, '#000000', 0.22 * op, 0.5); }
    ctx.restore();
  }
  if (age < 0.5) return;
  // The stab: in fast, a pause, out slowly.
  const inK = clamp((age - 0.5) / 0.1, 0, 1), outK = clamp((age - 1.0) / 0.45, 0, 1), reach = inK * (1 - outK * outK);
  if (reach <= 0) return;
  const Tx = lerp(Fx, o.A.x, reach), Ty = lerp(Fy, o.A.y, reach);
  const x0 = sx(Fx), y0 = sy(Fy), x1 = sx(Tx), y1 = sy(Ty), dx = x0 - x1, dy = y0 - y1, L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
  // Tapered from a hair at the tip to the width of a finger off screen; soft-edged (a wide faint pass, then the body).
  const shaft = k => { ctx.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16, w = Math.min(90, 2 + u * L / S * 0.11) * S * k; ctx[i ? 'lineTo' : 'moveTo'](x1 + dx * u + px * w, y1 + dy * u + py * w); } for (let i = 16; i >= 0; i--) { const u = i / 16, w = Math.min(90, 2 + u * L / S * 0.11) * S * k; ctx.lineTo(x1 + dx * u - px * w, y1 + dy * u - py * w); } ctx.closePath(); };
  if (df) { ctx.globalCompositeOperation = 'lighter'; shaft(1.5); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); shaft(1); ctx.fillStyle = 'rgba(255,235,230,0.14)'; ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
  else { shaft(1.6); ctx.fillStyle = 'rgba(30,22,18,0.18)'; ctx.fill(); shaft(1.25); ctx.fillStyle = 'rgba(30,22,18,0.35)'; ctx.fill(); shaft(1); ctx.fillStyle = 'rgba(40,30,24,0.9)'; ctx.fill(); }
  // Light along one side of the shaft (it is a tube).
  ctx.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16, w = Math.min(90, 2 + u * L / S * 0.11) * S * 0.45; ctx[i ? 'lineTo' : 'moveTo'](x1 + dx * u + px * w, y1 + dy * u + py * w); }
  ctx.strokeStyle = ha('#ffffff', df ? 0.7 : 0.3); ctx.lineWidth = 1.5 * S; ctx.stroke();
  if (age > 0.62 && age < 1.2) soft(x1, y1, 9 * S, df ? '#ff8fa3' : '#c9184a', 0.7);
}
// The ant: a head far too big for the slide at the screen edge, two blurred mandibles closing on the target.
function nfDrawAnt(o, df) {
  const age = G.t - o.t0, far = 520, hx = o.x + Math.cos(o.a) * far, hy = o.y + Math.sin(o.a) * far;
  const inK = clamp(age / 0.35, 0, 1), outK = clamp((age - 0.75) / 0.35, 0, 1), k = inK * (1 - outK), close = clamp((age - 0.25) / 0.2, 0, 1);
  if (k <= 0) { nfDrawSpray(o, df, age); return; }
  // The head: mostly off screen, its rim in, soft at the edge.
  const cx = lerp(hx + Math.cos(o.a) * 300, hx, k), cy = lerp(hy + Math.sin(o.a) * 300, hy, k), R = 300 * S, X = sx(cx), Y = sy(cy);
  ctx.save(); ctx.translate(X, Y); ctx.rotate(o.a); ctx.scale(1, 0.8);
  const g = ctx.createRadialGradient(0, 0, R * 0.6, 0, 0, R * 1.08);
  if (df) { g.addColorStop(0, 'rgba(255,255,255,0.03)'); g.addColorStop(0.85, 'rgba(255,255,255,0.12)'); g.addColorStop(0.95, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); }
  else { g.addColorStop(0, 'rgba(30,22,16,0.92)'); g.addColorStop(0.9, 'rgba(40,30,22,0.85)'); g.addColorStop(1, 'rgba(40,30,22,0)'); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 1.08, 0, TAU); ctx.fill();
  ctx.restore();
  // Mandibles: thick curved blades from the head's rim to the target, open, then snapping shut.
  if (df) ctx.globalCompositeOperation = 'lighter';
  for (const sd of [1, -1]) {
    const bx = cx - Math.cos(o.a) * 250 + Math.cos(o.a + Math.PI / 2) * 80 * sd, by = cy - Math.sin(o.a) * 250 + Math.sin(o.a + Math.PI / 2) * 80 * sd;
    const tx = o.x + Math.cos(o.a + Math.PI / 2) * (100 * (1 - close) + 3) * sd, ty = o.y + Math.sin(o.a + Math.PI / 2) * (100 * (1 - close) + 3) * sd;
    const Tx = lerp(bx, tx, k), Ty = lerp(by, ty, k), bow = (60 + 50 * (1 - close)) * sd, mx = (bx + Tx) / 2 + Math.cos(o.a + Math.PI / 2) * bow, my = (by + Ty) / 2 + Math.sin(o.a + Math.PI / 2) * bow;
    const blade = w => { ctx.beginPath(); ctx.moveTo(sx(bx) + Math.cos(o.a) * w * S, sy(by) + Math.sin(o.a) * w * S); ctx.quadraticCurveTo(sx(mx), sy(my), sx(Tx), sy(Ty)); ctx.quadraticCurveTo(sx(mx) - Math.cos(o.a + Math.PI / 2) * w * 0.7 * S * sd, sy(my) - Math.sin(o.a + Math.PI / 2) * w * 0.7 * S * sd, sx(bx) - Math.cos(o.a) * w * S, sy(by) - Math.sin(o.a) * w * S); ctx.closePath(); };
    blade(70); ctx.fillStyle = df ? 'rgba(255,240,220,0.08)' : 'rgba(46,32,20,0.25)'; ctx.fill();
    blade(46); ctx.fillStyle = df ? 'rgba(255,240,220,0.3)' : 'rgba(52,36,22,0.95)'; ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  nfDrawSpray(o, df, age);
}
function nfDrawSpray(o, df, age) {
  if (!o.B || age > 1.1) return;
  const k = clamp(1 - (age - 0.45) / 0.65, 0, 1);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) { const u = clamp((age - 0.45) * 3 - i * 0.05, 0, 1) * (0.2 + i / 9); soft(sx(lerp(o.x, o.B.x, u)), sy(lerp(o.y, o.B.y, u)), (18 + i * 2) * S, '#c6ff3d', 0.22 * k); }
  ctx.globalCompositeOperation = 'source-over';
}
// The beetle: the tip of an enormous abdomen poking in behind you, then a stuttering cone of boiling spray.
function nfDrawBeetle(o, df) {
  const p = me(), age = G.t - o.t0, k = clamp(age / 0.12, 0, 1) * clamp((o.next + 0.25 - G.t) / 0.25, 0, 1), b = o.a + Math.PI;
  if (k <= 0) return;
  const far = Math.hypot(nfHalfW(), nfHalfH()) + 200, tipX = p.x + Math.cos(b) * 26, tipY = p.y + Math.sin(b) * 26, baseX = tipX + Math.cos(b) * far * k, baseY = tipY + Math.sin(b) * far * k;
  const x0 = sx(baseX), y0 = sy(baseY), x1 = sx(tipX), y1 = sy(tipY), dx = x1 - x0, dy = y1 - y0, ang = Math.atan2(dy, dx);
  // Ringed segments, each a soft-edged ellipse, narrowing to the tip.
  for (let i = 0; i < 9; i++) {
    const u = 0.3 + i * 0.08, cx = x0 + dx * u, cy = y0 + dy * u, w = (1 - u) * 420 * S + 24 * S;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.scale(0.55, 1);
    const g = ctx.createRadialGradient(0, 0, w * 0.2, 0, 0, w);
    if (df) { g.addColorStop(0, 'rgba(255,255,255,0.03)'); g.addColorStop(0.8, `rgba(255,255,255,${0.1 + i * 0.02})`); g.addColorStop(1, 'rgba(255,255,255,0)'); }
    else { g.addColorStop(0, `rgba(${60 + i * 8},${46 + i * 5},${30 + i * 3},0.95)`); g.addColorStop(0.75, `rgba(${34 + i * 6},${26 + i * 4},${18 + i * 3},0.9)`); g.addColorStop(1, 'rgba(30,22,16,0)'); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // The cone: it flickers with every pulse.
  const fl = clamp(1 - (G.realT - (o.flick || 0)) / 0.06, 0, 1);
  if (fl > 0) { const x = sx(p.x), y = sy(p.y), R = o.s.area * S; ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, `rgba(230,255,170,${0.45 * fl})`); g.addColorStop(1, 'rgba(198,255,61,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, R, o.a - 0.34, o.a + 0.34); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
}
function nfVial(x, y, sc, df, tell) {
  const sh = tell ? Math.sin(G.realT * 50) * 2 * sc : 0;
  ctx.save(); ctx.translate(x + sh, y); ctx.rotate(Math.sin(G.realT * 3) * 0.12);
  // Frost and a little steam (a cartoon prop).
  for (let i = 0; i < 2; i++) { const u = (G.realT * 0.8 + i * 0.5) % 1; soft(Math.sin(u * 6 + i) * 4 * sc, -16 * sc - u * 16 * sc, (3 + u * 5) * sc, '#ffffff', 0.35 * (1 - u)); }
  ctx.fillStyle = df ? 'rgba(220,235,255,0.55)' : 'rgba(226,238,250,0.95)'; ctx.strokeStyle = df ? '#ffffff' : '#6c7f93'; ctx.lineWidth = 1.2 * sc;
  ctx.beginPath(); ctx.moveTo(-5 * sc, -12 * sc); ctx.lineTo(5 * sc, -12 * sc); ctx.lineTo(5 * sc, 8 * sc); ctx.arc(0, 8 * sc, 5 * sc, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = df ? '#9fb7d0' : '#3d5a7a'; ctx.fillRect(-6 * sc, -16 * sc, 12 * sc, 4 * sc); // (the cap)
  ctx.fillStyle = df ? '#ffffff' : '#ffffff'; ctx.fillRect(-4 * sc, -6 * sc, 8 * sc, 8 * sc); // (the label)
  ctx.fillStyle = '#20262c'; for (let i = 0; i < 6; i++) ctx.fillRect((-3.4 + i * 1.25) * sc, -5 * sc, (i % 3 ? 0.5 : 0.9) * sc, 5 * sc); // (barcode)
  ctx.restore();
}
function nfCrabSprite(x, y, sc, a, df) {
  // Pale and crab-shaped (a louse is greyish white), dark legs, so it reads on a dark body and on the slide.
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.strokeStyle = df ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.95)'; ctx.lineWidth = 0.9 * sc; ctx.beginPath();
  for (let i = 0; i < 3; i++) for (const sd of [1, -1]) { const lx = (i - 1) * 2 * sc, wig = Math.sin(G.realT * 20 + i + sd) * 0.9 * sc; ctx.moveTo(lx, sd * 2 * sc); ctx.lineTo(lx + wig, sd * 4 * sc); ctx.lineTo(lx + wig + (i - 1) * 1.2 * sc, sd * 5.6 * sc); }
  ctx.stroke();
  ctx.fillStyle = df ? '#f0f0f0' : '#e6e2da'; ctx.beginPath(); ctx.ellipse(0, 0, 3.2 * sc, 2.6 * sc, 0, 0, TAU); ctx.fill();
  ctx.lineWidth = 0.8 * sc; ctx.stroke();
  ctx.restore();
}
function nfLeechSprite(x, y, sc, a, df, id) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
  const pulse = 1 + 0.12 * Math.sin(G.realT * 6 + id);
  ctx.scale(pulse, 1 / pulse);
  ctx.fillStyle = df ? 'rgba(255,170,190,0.55)' : gloss(0, 0, 5 * sc, '#6a2a34', '#2a0c12', '#12050a');
  ctx.beginPath(); ctx.ellipse(0, 0, 3 * sc, 7 * sc, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = df ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.9 * sc; ctx.stroke(); // (a glossy rim, so it reads on a dark body)
  ctx.strokeStyle = df ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.6 * sc; ctx.beginPath();
  for (let i = -2; i <= 2; i++) { ctx.moveTo(-2.6 * sc, i * 2.2 * sc); ctx.lineTo(2.6 * sc, i * 2.2 * sc); } // (segments)
  ctx.stroke();
  ctx.restore();
}
// The wandering womb: a translucent pear with two trailing tubes, drifting and bumping like a lost jellyfish.
function nfDrawWomb(o, df) {
  const x = sx(o.x), y = sy(o.y), t = G.realT, k = clamp((o.end - G.t) / 0.5, 0, 1) * clamp((G.t - o.t0) / 0.3, 0, 1), sc = Math.max(0.8, S) * 1.3, pulse = 1 + 0.08 * Math.sin(t * 3 + o.seed);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.a + Math.PI / 2 + Math.sin(t * 1.3 + o.seed) * 0.15);
  if (df) ctx.globalCompositeOperation = 'lighter';
  const c = df ? '#dff8ff' : '#6a8fa0';
  // Tubes curling back from the top corners, with a little ovary at each end.
  for (const sd of [1, -1]) {
    ctx.beginPath(); ctx.moveTo(sd * 14 * sc, -10 * sc);
    for (let i = 1; i <= 10; i++) { const u = i / 10; ctx.lineTo(sd * (14 + u * 22) * sc + Math.sin(u * 6 + t * 3 + sd) * 4 * sc, (-10 + u * 26 + Math.sin(u * 4 + t * 2) * 5) * sc); }
    softStroke(1.6 * sc, c, 0.45 * k);
    soft(sd * 36 * sc, 16 * sc + Math.sin(t * 2) * 5 * sc, 5 * sc, c, 0.5 * k);
  }
  // The pear.
  ctx.beginPath(); ctx.moveTo(0, 22 * sc * pulse); ctx.bezierCurveTo(10 * sc, 18 * sc, 20 * sc * pulse, 0, 16 * sc * pulse, -12 * sc); ctx.bezierCurveTo(10 * sc, -20 * sc, -10 * sc, -20 * sc, -16 * sc * pulse, -12 * sc); ctx.bezierCurveTo(-20 * sc * pulse, 0, -10 * sc, 18 * sc, 0, 22 * sc * pulse); ctx.closePath();
  ctx.fillStyle = ha(df ? '#bff4ff' : '#dff2f8', (df ? 0.22 : 0.5) * k); ctx.fill();
  ctx.strokeStyle = ha(df ? '#ffffff' : '#3a5a68', 0.75 * k); ctx.lineWidth = 1.4 * sc; ctx.stroke();
  soft(0, -2 * sc, 9 * sc, '#ffffff', 0.25 * k);
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
}
// Anhydrobiosis: you dry into a crinkled barrel (a tun), then swell back.
function nfDrawHusk(o, df) {
  const p = me(), x = sx(p.x), y = sy(p.y), sc = Math.max(0.8, S) * playerScale(), age = G.t - o.t0, left = o.end - G.t;
  const dry = clamp(age / 0.3, 0, 1) * clamp(left / 0.25, 0, 1), sw = 1 - dry;
  ctx.save(); ctx.translate(x, y); ctx.rotate((p.hd || 0) + Math.PI / 2);
  const w = (10 + 3 * sw) * sc, h = (15 + 4 * sw) * sc;
  if (!df) soft(0, 3 * sc, h * 1.4, '#000000', 0.25);
  for (let i = 0; i < 5; i++) { const a = i * 1.3 + o.id, d = h * (1.1 + 0.3 * ((G.realT * 0.3 + i * 0.2) % 1)); ctx.fillStyle = ha(df ? '#e8dcc0' : '#5a4e3a', 0.6 * dry); ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 1.6 * sc, 1.1 * sc); } // (dry flakes)
  ctx.fillStyle = df ? 'rgba(220,210,190,0.55)' : gloss(0, 0, h, '#b8a888', '#7d6f55', '#4a412f');
  ctx.beginPath(); ctx.ellipse(0, 0, w, h, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = df ? 'rgba(255,255,255,0.7)' : 'rgba(30,24,16,0.8)'; ctx.lineWidth = 1.1 * sc; ctx.beginPath();
  for (let i = -3; i <= 3; i++) { const yy = i * h / 4; ctx.moveTo(-w * Math.sqrt(1 - (yy / h) ** 2), yy); for (let j = 1; j <= 6; j++) { const xx = -w * Math.sqrt(1 - (yy / h) ** 2) + j / 6 * 2 * w * Math.sqrt(1 - (yy / h) ** 2); ctx.lineTo(xx, yy + (j % 2 ? 1 : -1) * 0.8 * sc); } }
  ctx.stroke();
  ctx.restore();
}
function nfDrawCandle(o, df) {
  const x = sx(o.x), y = sy(o.y), sc = Math.max(0.8, S) * 1.3, t = G.realT, k = clamp((o.end - G.t) / 0.4, 0, 1), fl = 1 + 0.15 * Math.sin(t * 23 + o.seed) + 0.1 * Math.sin(t * 37);
  // A cartoon cone candle, wax running down it, a soft flickering flame.
  if (!df) soft(x, y + 30 * sc, 18 * sc, '#000000', 0.15);
  ctx.beginPath(); ctx.moveTo(x - 7 * sc, y + 30 * sc); ctx.lineTo(x - 2 * sc, y - 18 * sc); ctx.lineTo(x + 2 * sc, y - 18 * sc); ctx.lineTo(x + 7 * sc, y + 30 * sc); ctx.closePath();
  ctx.fillStyle = df ? 'rgba(240,220,180,0.6)' : '#e8d3a8'; ctx.fill();
  ctx.strokeStyle = df ? '#ffffff' : '#9a7d4c'; ctx.lineWidth = 1 * sc; ctx.stroke();
  ctx.fillStyle = df ? 'rgba(255,240,200,0.8)' : '#f6e6c4'; ctx.beginPath();
  for (let i = 0; i < 3; i++) { const dx = (i - 1) * 3 * sc, L = (6 + ((t * 0.4 + i * 0.3) % 1) * 10) * sc; ctx.moveTo(dx, y - 12 * sc); ctx.moveTo(x + dx - 1.2 * sc, y - 14 * sc + i * 4 * sc); ctx.lineTo(x + dx + 1.2 * sc, y - 14 * sc + i * 4 * sc); ctx.lineTo(x + dx + 0.6 * sc, y - 14 * sc + i * 4 * sc + L); ctx.arc(x + dx, y - 14 * sc + i * 4 * sc + L, 1 * sc, 0, Math.PI); ctx.closePath(); }
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  soft(x, y - 26 * sc, 26 * sc * fl, '#ffb347', 0.35 * k);
  ctx.beginPath(); ctx.moveTo(x, y - (36 * fl) * sc); ctx.quadraticCurveTo(x + 5 * sc, y - 24 * sc, x, y - 18 * sc); ctx.quadraticCurveTo(x - 5 * sc, y - 24 * sc, x, y - (36 * fl) * sc); ctx.fillStyle = ha('#fff1c9', 0.9 * k); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}
// Lipid Bilayer: a curving double line of beads (the phospholipid heads), a soft sheen between, rippling where touched.
function nfDrawWall(o, df) {
  const t = G.realT, k = clamp((o.end - G.t) / 0.4, 0, 1) * clamp((G.t - o.t0) / 0.25, 0, 1), cx = sx(o.cx), cy = sy(o.cy), n = Math.max(12, Math.round(o.R * o.half * 2 / 9));
  const rip = a => { let d = 0; for (const r of o.rip) { const u = (G.realT - r.t) / 0.5, da = Math.abs(angDiff(a, r.a)); d += Math.sin(da * 30 - u * 12) * Math.exp(-da * 6) * (1 - u) * 4; } return d; };
  if (df) ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const a = o.a - o.half + i / n * o.half * 2, r = (o.R + rip(a)) * S; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  softStroke(5 * S, df ? '#e0c3fc' : '#c8b6ff', 0.3 * k);
  for (const off of [-5, 5]) {
    ctx.fillStyle = ha(df ? '#f4eeff' : '#8e7aa8', 0.75 * k); ctx.beginPath();
    for (let i = 0; i <= n; i++) { const a = o.a - o.half + (i + (off > 0 ? 0.5 : 0)) / n * o.half * 2, r = (o.R + off + rip(a) + Math.sin(i * 1.3 + t * 3) * 0.6) * S, bx = cx + Math.cos(a) * r, by = cy + Math.sin(a) * r; ctx.moveTo(bx + 2.3 * S, by); ctx.arc(bx, by, 2.3 * S, 0, TAU); }
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}
function nfDrawTide(o, df) {
  const ux = Math.cos(o.a), uy = Math.sin(o.a), t = G.realT, k = clamp((o.D + o.depth - o.d) / (o.depth * 0.8), 0, 1);
  const fx = o.ox + ux * o.d, fy = o.oy + uy * o.d, bx = fx - ux * o.depth, by = fy - uy * o.depth;
  // A soft wash behind a darker, frilled leading edge.
  const g = ctx.createLinearGradient(sx(bx), sy(by), sx(fx), sy(fy));
  g.addColorStop(0, 'rgba(164,19,60,0)'); g.addColorStop(0.75, `rgba(164,19,60,${(df ? 0.08 : 0.12) * k})`); g.addColorStop(1, `rgba(120,10,40,${(df ? 0.16 : 0.22) * k})`);
  if (df) ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g; ctx.beginPath();
  const px = -uy * o.hw, py = ux * o.hw;
  ctx.moveTo(sx(bx + px), sy(by + py)); ctx.lineTo(sx(fx + px), sy(fy + py)); ctx.lineTo(sx(fx - px), sy(fy - py)); ctx.lineTo(sx(bx - px), sy(by - py)); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const u = i / 40 * 2 - 1, f = Math.sin(u * 23 + t * 3 + o.seed) * 9 + Math.sin(u * 61 - t * 2) * 4, x = fx + px * u + ux * f, y = fy + py * u + uy * f; i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y)); }
  softStroke(3 * S, df ? '#ff8fa3' : '#800f2f', 0.55 * k);
  for (let i = 0; i < 12; i++) { const u = tfR(o.id, i) * 2 - 1, back = tfR(o.id, i + 20) * o.depth * 0.9; softBlob(sx(fx + px * u - ux * back), sy(fy + py * u - uy * back), (4 + 5 * tfR(o.id, i + 40)) * S, i, t, 0.2, df ? '#ff8fa3' : '#6a0d25', 0.5 * k); }
  ctx.globalCompositeOperation = 'source-over';
}
function nfDrawLane(o, df) {
  const t = G.realT, k = clamp((o.end + 0.5 - G.t) / 0.5, 0, 1) * clamp((G.t - o.t0) / 0.3, 0, 1), ux = Math.cos(o.a), uy = Math.sin(o.a), px = -uy, py = ux;
  const x0 = sx(o.x0), y0 = sy(o.y0), L = o.L * S, Wd = o.w * S;
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(o.a);
  if (df) ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, -Wd, 0, Wd);
  g.addColorStop(0, 'rgba(223,231,160,0)'); g.addColorStop(0.5, `rgba(223,231,160,${(df ? 0.14 : 0.22) * k})`); g.addColorStop(1, 'rgba(223,231,160,0)');
  ctx.fillStyle = g; ctx.fillRect(0, -Wd, L, Wd * 2);
  // Fine aligned strands drifting along it, like a current you can see.
  ctx.strokeStyle = ha(df ? '#f4f8d8' : '#8a9a3a', 0.45 * k); ctx.lineWidth = Math.max(0.7, 0.8 * S); ctx.beginPath();
  for (let i = 0; i < 14; i++) { const yy = (tfR(o.id, i) * 1.6 - 0.8) * Wd, u = ((t * 0.35 + tfR(o.id, i + 9)) % 1) * L, len = (30 + 40 * tfR(o.id, i + 20)) * S; ctx.moveTo(u, yy); ctx.quadraticCurveTo(u + len / 2, yy + Math.sin(t * 2 + i) * 3 * S, Math.min(L, u + len), yy); }
  ctx.stroke();
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
  void px; void py;
}
