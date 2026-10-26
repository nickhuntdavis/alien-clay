'use strict';
// Spawn Prawn - tier 2 boss signature beats (ENEMY_HANDOFF C3). Each of the seven tier 2 bosses loses its generic sprays
// (aimedFan, spiral, ring, flower, doubleSpiral) and gets one beat built from its own mechanic. Every beat shows its area
// first (COMBAT_MATRIX 13.4), keeps two or more answers, and uses no new boss HP, damage or rate number (damage is the
// boss's own bd, as the beats it replaces used).
//   crossfire (Mitch & Osis)   They take opposite sides of you (200 px out), light the lane between them 0.9 s, then ONE body's Beam runs it 0.4 s.
//                              Outside the lit lane they keep a boss's usual distance; no lane is lit from far away. Rebuilds come back weaker each time (60%, 36%, 22% ...).
//   fragment  (Kidney Stone)   Each shed Shell layer (any cause) rolls off as a gravel chunk down a lane marked 0.8 s; the pattern also calves one.
//   rounds    (Matron)         Her route is marked bed to bed (3 beds) for 0.9 s, then she walks it (240 px/s), healing what she passes (an add takes at most 6 ticks in its life).
//   falsepos  (Phantom)        Two see-through copies blink with her for 4 s; the real one is ringed. Copies are drawn only (not enemies).
//   saccade   (Immune Eye)     A 60 degree sector is marked 0.8 s, then the glare sweeps it over 1.2 s. One a slot; the rest of the slot it closes in as usual.
//   reflux    (Pepsinator)     One half of the arena is shaded 1 s, then acid pools roll out across it over 1 s.
//   dinner    (Macrophage Queen) Her line is marked 0.9 s, her adds queue up on it and rush down it 1 s, then she devours the survivors.
//                              Devour and both dinners share one snack budget a cycle (6 snacks, 18% of her health): past it she eats but does not heal.
// State lives on the boss (e.sg2), nothing is saved. Wraps bossAI (bosstells10.js's wrapper, game.js) and nf10Draw.
// Hooks: wraps bossAI, nf10Draw and updateRevive (bosses.js); data.js BOSSES / roster.js ROSTER_BOSSES patterns and campaign.js ENTOURAGE.twins.on are rewritten at load. Save data: none.

const SG2 = {
  ids: ['crossfire', 'fragment', 'rounds', 'falsepos', 'saccade', 'reflux', 'dinner'],
  window: 5.5, // (game.js: a pattern lasts 5.5 s, the first 0.6 s of it a pause)
  cfR: 200, cfMove: 1.8, cfMoveMax: 3.2, cfNear: 120, cfSpd: 260, cfTell: 0.9, cfFire: 0.4, cfTicks: 4, cfW: 36, cfBeam: 0.8, // (crossfire: distance from you, reposition cap and its stretch while a body is still more than cfNear outside the ring, swing speed, tell, Beam length, lane width, damage share per tick of bd)
  chunkTell: 0.8, chunkRoll: 0.8, chunkLen: 560, chunkR: 26, chunkEvery: 1.7, chunkMax: 4, // (fragment)
  bedR: 170, bedSpeed: 240, bedTell: 0.9, bedHeal: 0.012, bedRad: 160, bedPause: 0.2, bedCap: 6, // (rounds: bed ring radius round you, her walking speed, tell, heal per 0.25 s tick as a share of max HP, heal radius, ticks an add can take in its life: unlimited, the adds round you never died and bot fights ran 260 to 400 s)
  fpCopies: 2, fpLen: 4, fpTell: 0.5, fpGap: 1.6, fpRing: 0.3, fpR: 220, // (falsepos)
  scHalf: Math.PI / 6, scTell: 0.8, scSweep: 1.2, scLen: 950, // (saccade: half angle = 30 degrees, so a 60 degree sector)
  rfTell: 1.0, rfWave: 1.0, rfRows: 4, rfCols: 4, rfR: 52, rfLife: 4, // (reflux)
  dnTell: 0.9, dnRush: 1.0, dnSpeed: 360, dnGap: 46, noms: 6, nomsFall: 0.6, // (dinner; noms: snacks that heal her in the first pattern cycle, devour and both dinners together, 3% each: with each feed healing 18% she healed back everything the bot dealt; nomsFall: each later cycle's budget is 60% of the last (6, 4, 2, 1, 1, then none), so she heals at most 42% in a fight and a weak build still wins)
};

// The new patterns replace every generic spray slot (data.js BOSSES and roster.js ROSTER_BOSSES share one array).
const SG2_PATTERNS = {
  twins: ['crossfire', 'crossfire', 'charge', 'crossfire'],
  stone: ['stoneroll', 'gravel', 'fragment', 'stoneroll'],
  matron: ['wardround', 'rounds', 'rounds', 'wardround', 'rounds'],
  ghost: ['blink', 'falsepos', 'falsepos', 'falsepos'],
  eye: ['blink', 'glare', 'saccade', 'saccade'],
  pepsin: ['acidrain', 'reflux', 'acidrain', 'reflux'],
  queen: ['summon', 'devour', 'dinner', 'dinner'],
};
for (const id in SG2_PATTERNS) {
  const B = BOSSES.find(b => b.id === id), R = typeof ROSTER_BOSSES !== 'undefined' && ROSTER_BOSSES.find(b => b.id === id);
  if (!B) continue;
  B.patterns = SG2_PATTERNS[id].slice();
  if (R) R.patterns = B.patterns;
  B.strengths = (B.strengths || []).filter(s => !/crossfire/i.test(s)).slice(0, 2).concat('TODO_COPY:boss_' + id + '_sig'); // (copy: the user writes it)
}
if (typeof ENTOURAGE !== 'undefined' && ENTOURAGE.twins) ENTOURAGE.twins.on = ENTOURAGE.twins.on.filter(p => p !== 'spiral'); // (adds come on the charge and the lull timer only: the crossfire fills 3 slots in 4, and pulsing on it too put about 150 adds in the dish and the bot's boss damage near zero)

const sg2St = e => e.sg2 || (e.sg2 = { pat: null, last: 99, t: 0 });
const sg2Alive = e => e && !e.dead;
// Pulled inside the dish (waves only), nothing else: dishFix would also move a spot that sits near you, which these beats want.
function sg2In(x, y) {
  if (!G.wave || G.lvl) return { x, y };
  const c = G.core, R = CORE.arena - DISH_IN, d = Math.hypot(x - c.x, y - c.y);
  return d > R ? { x: c.x + (x - c.x) / d * R, y: c.y + (y - c.y) / d * R } : { x, y };
}
// Walk a boss towards a point (the original sets mvx/mvy/mvs each frame; this overrides them after it ran).
function sg2Go(e, tx, ty, spd) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
  if (d < 14) { e.mvx = 0; e.mvy = 0; e.mvs = 0; return true; }
  e.mvx = dx / d; e.mvy = dy / d; e.mvs = Math.min(spd, d * 6);
  return false;
}

// Swing round you on a circle of radius R by a share of the angle still to go (the crossfire's reposition: no cutting through you).
function sg2Swing(e, p, share, R, spd) {
  const th = Math.atan2(e.y - p.y, e.x - p.x), st = clamp(share, -0.4, 0.4), q = sg2In(p.x + Math.cos(th + st) * R, p.y + Math.sin(th + st) * R);
  sg2Go(e, q.x, q.y, spd);
}
const sg2AI0 = bossAI;
bossAI = function (e, dt, dist, ux, uy) {
  const d = e.def;
  if (!SG2_PATTERNS[d.id]) return sg2AI0(e, dt, dist, ux, uy);
  const s = sg2St(e);
  if (d.stone) sg2StoneTick(e, s, dt);
  // The partner twin: while the other body runs a crossfire it takes its side (its own attacks held, as bosstells10.js does).
  const tw = e.twin && sg2Alive(e.twin) ? e.twin : null, cfo = tw && tw.sg2 && tw.sg2.cf;
  if (d.twins && cfo && !s.cf) {
    const saved = e.patT;
    e.patT = 0; sg2AI0(e, dt, dist, ux, uy); e.patT = saved + dt;
    if (cfo.ph === 0) sg2Swing(e, G.player, cfo.delta / 2, SG2.cfR, SG2.cfSpd); else if (cfo.ph < 3) { e.mvx = 0; e.mvy = 0; e.mvs = 0; } // (still only while the lane is lit and fired; the breath keeps the usual distance)
    return;
  }
  const patT0 = e.patT, pat0 = d.patterns[e.pat], hp0 = e.hp;
  sg2AI0(e, dt, dist, ux, uy);
  const pat = d.patterns[e.pat];
  if (d.id === 'queen') sg2Noms(e, s, pat, pat0, hp0);
  if (e.patT < patT0 || pat !== pat0) { s.pat = null; s.cf = s.rd = s.fp = s.sc = s.rf = s.dn = null; } // (a new pattern run: every beat's state goes)
  if (!SG2.ids.includes(pat) || e.patT < 0.6) return;
  if (s.pat !== pat) { s.pat = pat; s.t = 0; s.cf = s.rd = s.fp = s.sc = s.rf = s.dn = null; s.n = 0; s.rfDone = false; }
  const p = G.player, bd = d.dmg * 0.35 * dmgNow() * (e.campK || 1), left = SG2.window - e.patT;
  switch (pat) {
    case 'crossfire': return sg2Crossfire(e, s, dt, bd, tw, p, left);
    case 'fragment': s.t += dt; if (s.t >= SG2.chunkEvery * (s.n || 0) && (s.n || 0) < 3) { s.n = (s.n || 0) + 1; sg2Chunk(e, s); } return;
    case 'rounds': return sg2Rounds(e, s, dt, p, left);
    case 'falsepos': return sg2FalsePos(e, s, dt, bd, p);
    case 'saccade': return sg2Saccade(e, s, dt, bd, p, left);
    case 'reflux': return sg2Reflux(e, s, dt, bd, p);
    case 'dinner': return sg2Dinner(e, s, dt, bd, dist, ux, uy, p);
  }
};

// ---------------------------------------------------------------- Mitch & Osis: crossfire
function sg2Crossfire(e, s, dt, bd, tw, p, left) {
  let cf = s.cf;
  if (!cf) {
    if (left < SG2.cfMove + SG2.cfTell + SG2.cfFire + 0.3) return; // (no time for a whole one: keep the usual distance until the next pattern. Standing still here and in the breath left the bodies parked 3.7 s of every 5.5 s while a kiting player walked off: bot fights ran 150 to 400 s)
    if (tw && tw.def.patterns[tw.pat] === 'charge' && tw.st) return; // (the partner is mid-dash: let it finish)
    s.n = (s.n || 0) + 1;
    cf = s.cf = { ph: 0, t: 0, tick: 0, delta: 0 };
  }
  cf.t += dt;
  if (cf.ph === 0) { // take opposite sides: each body swings round you by half of what is left (the partner does the same from its own call)
    const th = e.x === p.x && e.y === p.y ? 0 : Math.atan2(e.y - p.y, e.x - p.x), tp = tw ? Math.atan2(tw.y - p.y, tw.x - p.x) : th + Math.PI;
    cf.delta = Math.atan2(Math.sin(Math.PI - (tp - th)), Math.cos(Math.PI - (tp - th)));
    sg2Swing(e, p, -cf.delta / 2, SG2.cfR, SG2.cfSpd);
    const ok = r => Math.abs(r - SG2.cfR) < 30, near = r => r < SG2.cfR + SG2.cfNear;
    const de = Math.hypot(e.x - p.x, e.y - p.y), dtw = tw ? Math.hypot(tw.x - p.x, tw.y - p.y) : de;
    const set = near(de) && near(dtw), opp = Math.abs(cf.delta) < 0.35; // (both bodies close enough, and near enough to opposite that the lane runs through where you stood)
    if (cf.t >= SG2.cfMoveMax && !set) { s.cf = null; return; } // (you walked off: no lane lit from across the dish; close in and try again)
    if ((cf.t >= SG2.cfMoveMax && set) || (cf.t >= SG2.cfMove && set && opp) || (Math.abs(cf.delta) < 0.1 && ok(de) && (!tw || ok(dtw)))) {
      cf.ph = 1; cf.t = 0; cf.ax = e.x; cf.ay = e.y;
      cf.bx = tw ? tw.x : e.x + (p.x - e.x) * 2; cf.by = tw ? tw.y : e.y + (p.y - e.y) * 2; // (a lone twin lights the line through you)
      e.mvx = 0; e.mvy = 0; e.mvs = 0;
    }
  } else if (cf.ph === 1) { // the lane is lit and fixed; nothing hurts
    e.mvx = 0; e.mvy = 0; e.mvs = 0;
    if (cf.t >= SG2.cfTell) { cf.ph = 2; cf.t = 0; cf.tick = 0; }
  } else if (cf.ph === 2) { // one body's Beam: hits at fixed moments along the lane
    e.mvx = 0; e.mvy = 0; e.mvs = 0;
    const done = Math.min(SG2.cfTicks, Math.floor(cf.t / SG2.cfFire * SG2.cfTicks + 1e-6) + 1);
    while (cf.tick < done) {
      cf.tick++;
      const sd = nfSegD(p.x, p.y, cf.ax, cf.ay, cf.bx, cf.by);
      if (sd.d < SG2.cfW / 2 + p.r) {
        const hp0 = p.hp;
        hurtPlayer(bd * V10_DIFF.dmg * SG2.cfBeam / SG2.cfTicks * 2, e.name + ' crossfire', e, 'beam'); // (about one bd in all, as the fan it replaces)
        if (p.hp < hp0 && p.iframes > 0.1) p.iframes = 0.05;
      }
    }
    if (cf.t >= SG2.cfFire) { cf.ph = 3; cf.t = 0; }
  } else if (cf.t >= 0.3) s.cf = null; // (a breath at the usual distance, then the next one if there is time)
}

// Each rebuild brings the twin back weaker (60% of its health, then 36%, 22%, 13% ...), so a fight that keeps felling one body
// still ends: with the first body always back at 60%, bot fights with a weak build looped five rebuilds and ran past 400 s.
const sg2Revive0 = updateRevive;
updateRevive = function () {
  const R = G.revive, e = R && R.e;
  sg2Revive0();
  if (!e || G.revive || e.dead || !(e.hp > 0)) return; // (nothing happened, or the pair is finished)
  const n = ((e.twin && e.twin.rebuilt) || e.rebuilt || 0) + 1; // (one count for the pair, whichever body fell)
  e.rebuilt = n; if (e.twin) e.twin.rebuilt = n;
  if (n > 1) e.hp = Math.max(1, Math.round(e.hp * Math.pow(0.6, n - 1)));
};

// ---------------------------------------------------------------- Kidney Stone: fragment
function sg2Chunk(e, s) {
  s.chunks = s.chunks || [];
  if (s.chunks.length >= SG2.chunkMax) return;
  const p = G.player;
  s.chunks.push({ x: e.x, y: e.y, x0: e.x, y0: e.y, a: Math.atan2(p.y - e.y, p.x - e.x), t: 0, hit: false });
  spawnPart(e.x, e.y, e.color, 8, 120, 0.4);
}
function sg2StoneTick(e, s, dt) {
  const c = typeof fightCd === 'function' ? fightCd(e) : null, L = c ? c.layers : 0;
  if (s.layers == null) s.layers = L;
  for (let i = L; i < s.layers; i++) sg2Chunk(e, s); // (a layer came off, for any reason)
  s.layers = L;
  if (!s.chunks) return;
  const p = G.player;
  for (const ch of s.chunks) {
    ch.t += dt;
    if (ch.t < SG2.chunkTell) continue; // (the lane is marked, nothing rolls yet)
    const k = Math.min(1, (ch.t - SG2.chunkTell) / SG2.chunkRoll);
    ch.x = ch.x0 + Math.cos(ch.a) * SG2.chunkLen * k; ch.y = ch.y0 + Math.sin(ch.a) * SG2.chunkLen * k;
    if (!ch.hit && k < 1 && Math.hypot(p.x - ch.x, p.y - ch.y) < SG2.chunkR + p.r) {
      ch.hit = true;
      hurtPlayer(e.def.dmg * 0.35 * dmgNow() * (e.campK || 1) * V10_DIFF.dmg * 1.2, e.name + ' gravel', e, 'bullets');
    }
  }
  s.chunks = s.chunks.filter(ch => ch.t < SG2.chunkTell + SG2.chunkRoll + 0.1);
}

// ---------------------------------------------------------------- The Matron: rounds
function sg2Rounds(e, s, dt, p, left) {
  let rd = s.rd;
  if (!rd) {
    const th = Math.atan2(e.y - p.y, e.x - p.x), pts = [];
    for (let i = 0; i < 3; i++) { const b = sg2In(p.x + Math.cos(th + i * 2.1) * SG2.bedR, p.y + Math.sin(th + i * 2.1) * SG2.bedR); pts.push({ x: b.x, y: b.y }); }
    rd = s.rd = { ph: 0, t: 0, pts, leg: 0, pause: 0, heal: 0 };
  }
  rd.t += dt;
  if (rd.ph === 0) { e.mvx = 0; e.mvy = 0; e.mvs = 0; if (rd.t >= SG2.bedTell) { rd.ph = 1; rd.t = 0; } return; }
  if (rd.ph === 2) return;
  if (rd.pause > 0) { rd.pause -= dt; e.mvx = 0; e.mvy = 0; e.mvs = 0; }
  else if (sg2Go(e, rd.pts[rd.leg].x, rd.pts[rd.leg].y, SG2.bedSpeed)) { rd.leg++; rd.pause = SG2.bedPause; if (rd.leg >= 3) { rd.ph = 2; return; } }
  rd.heal -= dt; // she heals what she passes
  if (rd.heal <= 0) {
    rd.heal = 0.25;
    const k = e.poison > 0 ? 0.5 : 1;
    forNear(e.x, e.y, SG2.bedRad, o => { if (o === e || o.boss || o.rival || o.charmed || o.egg || o.dead || (o.rdN || 0) >= SG2.bedCap) return; o.rdN = (o.rdN || 0) + 1; o.hp = Math.min(o.maxHp, o.hp + o.maxHp * SG2.bedHeal * k); });
  }
}

// ---------------------------------------------------------------- The Phantom Pregnancy: false positive
function sg2FalsePos(e, s, dt, bd, p) {
  let fp = s.fp;
  if (!fp) {
    fp = s.fp = { t: 0, jump: 0, cp: [], dest: null, ringT: 0 };
    for (let i = 0; i < SG2.fpCopies; i++) { const a = (i ? 1 : -1) * 1.3 + Math.random() * 0.4; fp.cp.push({ x: e.x + Math.cos(a) * e.r * 2, y: e.y + Math.sin(a) * e.r * 2, ph: Math.random() * TAU }); }
  }
  fp.t += dt;
  const tJump = SG2.fpTell + fp.jump * SG2.fpGap;
  if (fp.t >= tJump - SG2.fpTell && !fp.dest && fp.t < SG2.fpLen) { // the tell: where the real one lands (copies pick their own spots)
    const a = Math.random() * TAU;
    fp.dest = { x: p.x + Math.cos(a) * SG2.fpR, y: p.y + Math.sin(a) * SG2.fpR, c: fp.cp.map((c, i) => ({ x: p.x + Math.cos(a + (i ? 2.1 : -2.1)) * SG2.fpR, y: p.y + Math.sin(a + (i ? 2.1 : -2.1)) * SG2.fpR })) };
  }
  if (fp.dest && fp.t >= tJump) { // everyone blinks together
    spawnPart(e.x, e.y, e.color, 14, 160, 0.4);
    for (const c of fp.cp) spawnPart(c.x, c.y, e.color, 8, 120, 0.4);
    e.x = fp.dest.x; e.y = fp.dest.y; fp.cp.forEach((c, i) => { c.x = fp.dest.c[i].x; c.y = fp.dest.c[i].y; });
    fp.dest = null; fp.jump++; fp.ringT = SG2.fpRing;
  }
  if (fp.ringT > 0) { // only the real one rings (copies deal nothing)
    fp.ringT -= dt;
    if (fp.ringT <= 0) { for (let i = 0; i < 14; i++) eBullet(e.x, e.y, i / 14 * TAU, 125, bd, 6, '#7b2cbf'); ring(e.x, e.y, 70, '#c77dff', 0.4, 4); }
  }
  for (const c of fp.cp) c.ph += dt * 2;
}

// ---------------------------------------------------------------- The Immune Eye: saccade
function sg2Saccade(e, s, dt, bd, p, left) {
  let sc = s.sc;
  if (!sc) { // one saccade a slot; the rest of the slot the Eye keeps its usual distance (held still all slot, it sat 450 px from a kiting player and the fight ran 4 minutes)
    if ((s.n || 0) >= 1 || left < SG2.scTell + SG2.scSweep + 0.1) return;
    s.n = (s.n || 0) + 1;
    sc = s.sc = { ph: 0, t: 0, a0: Math.atan2(p.y - e.y, p.x - e.x), dir: s.n % 2 ? 1 : -1, ang: 0 };
    sc.ang = sc.a0 - sc.dir * SG2.scHalf;
  }
  sc.t += dt;
  e.mvx = 0; e.mvy = 0; e.mvs = 0; // (still from the mark to the end of the sweep: the sector it showed is the sector it sweeps)
  if (sc.ph === 0) { if (sc.t >= SG2.scTell) { sc.ph = 1; sc.t = 0; sfx('zap'); } return; }
  if (sc.ph === 1) {
    sc.ang = sc.a0 + sc.dir * (-SG2.scHalf + 2 * SG2.scHalf * Math.min(1, sc.t / SG2.scSweep));
    const cx = Math.cos(sc.ang), cy = Math.sin(sc.ang), px = p.x - e.x, py = p.y - e.y, along = px * cx + py * cy, perp = Math.abs(px * cy - py * cx);
    if (along > 0 && along < SG2.scLen && perp < 15 + p.r) hurtPlayer(bd * 0.6 * V10_DIFF.dmg, e.name + ' saccade', e, 'beam'); // (the glare's own damage per hit)
    if (sc.t >= SG2.scSweep) { sc.ph = 2; sc.t = 0; }
  } else if (sc.t >= 0.3) s.sc = null;
}

// ---------------------------------------------------------------- The Pepsinator: reflux
function sg2Reflux(e, s, dt, bd, p) {
  let rf = s.rf;
  e.mvx = 0; e.mvy = 0; e.mvs = 0;
  if (!rf) {
    if (s.rfDone) return;
    rf = s.rf = { t: 0, rows: 0, x0: e.x, y0: e.y, a: Math.atan2(p.y - e.y, p.x - e.x) }; // (the half you are standing in)
  }
  rf.t += dt;
  const nx = Math.cos(rf.a), ny = Math.sin(rf.a);
  while (rf.t >= SG2.rfTell + rf.rows * SG2.rfWave / SG2.rfRows && rf.rows < SG2.rfRows) {
    const j = rf.rows++, dd = 110 + j * 170;
    for (let c = 0; c < SG2.rfCols; c++) {
      const off = (c - (SG2.rfCols - 1) / 2) * 270 + (j % 2 ? 70 : -70);
      addHazard(rf.x0 + nx * dd - ny * off, rf.y0 + ny * dd + nx * off, SG2.rfR, SG2.rfLife, bd * 0.8, e.def.color, e.name + ' reflux', 0.3);
    }
  }
  if (rf.rows >= SG2.rfRows) { s.rfDone = true; }
}

// ---------------------------------------------------------------- The Macrophage Queen: dinner bell
// One snack budget a pattern cycle (SG2.noms, 3% of her health each, shrinking by SG2.nomsFall each cycle) shared by devour and both dinners. She still eats past it
// (the adds go), it just stops healing her. Counted from her health rising while she feeds: devour's own code is untouched.
function sg2Noms(e, s, pat, pat0, hp0) {
  if (pat === 'summon' && pat0 !== 'summon') { s.nomCyc = (s.nomCyc || 0) + 1; s.noms = Math.round(SG2.noms * Math.pow(SG2.nomsFall, s.nomCyc - 1)); } // (the cycle starts with the summon; each one feeds her less)
  if (s.noms == null) { s.nomCyc = 1; s.noms = SG2.noms; }
  if (!(e.hp > hp0) || (pat !== 'devour' && pat !== 'dinner')) return;
  const per = e.maxHp * 0.03, ate = Math.max(1, Math.round((e.hp - hp0) / per)), ok = Math.max(0, Math.min(ate, s.noms));
  s.noms -= ok;
  e.hp = Math.min(e.maxHp, hp0 + per * ok);
}
function sg2Dinner(e, s, dt, bd, dist, ux, uy, p) {
  let dn = s.dn;
  const adds = () => G.enemies.filter(o => !o.dead && o.summonedBy === e && !o.charmed);
  if (!dn) {
    dn = s.dn = { ph: 0, t: 0, a: Math.atan2(p.y - e.y, p.x - e.x) };
    if (adds().length < 3) { // no snacks to send: a short order, the same cap as her summon
      const n0 = G.enemies.length;
      for (let i = 0; i < 4 && G.enemies.length < CAPS.enemies && boss10SummonOk(e); i++) { const a = i / 4 * TAU; G.enemies.push(makeEnemy(pick([ENEMIES.skitter, ENEMIES.crawler, ENEMIES.bomber]), e.x + Math.cos(a) * 70, e.y + Math.sin(a) * 70)); }
      G.enemies.slice(n0).forEach(o => (o.summonedBy = e));
    }
  }
  dn.t += dt;
  const dx = Math.cos(dn.a), dy = Math.sin(dn.a);
  if (dn.ph < 2) {
    e.mvx = 0; e.mvy = 0; e.mvs = 0;
    const slot = i => ({ x: e.x + dx * (e.r + 40 + i * SG2.dnGap), y: e.y + dy * (e.r + 40 + i * SG2.dnGap) });
    if (dn.ph === 0 && dn.t + dt >= SG2.dnTell) adds().forEach((o, i) => { const q = slot(i); o.x = q.x; o.y = q.y; }); // (in single file when the bell rings)
    adds().forEach((o, i) => {
      if (o.sg2Sp == null) o.sg2Sp = o.speed;
      o.speed = 0; // (held while it queues and rushes)
      if (dn.ph === 0) { // queue up in single file on the lane
        const q = slot(i), ddx = q.x - o.x, ddy = q.y - o.y, dd = Math.hypot(ddx, ddy) || 1;
        const st = Math.min(dd, 600 * dt); o.x += ddx / dd * st; o.y += ddy / dd * st;
      } else { o.x += dx * SG2.dnSpeed * dt; o.y += dy * SG2.dnSpeed * dt; }
    });
    if (dn.ph === 0 && dn.t >= SG2.dnTell) { dn.ph = 1; dn.t = 0; sfx('zap'); }
    else if (dn.ph === 1 && dn.t >= SG2.dnRush) { dn.ph = 2; dn.t = 0; e.st = 0; }
    return;
  }
  for (const o of G.enemies) if (o.sg2Sp != null && o.summonedBy === e) { o.speed = o.sg2Sp; o.sg2Sp = null; } // (let them go)
  const a = Math.atan2(p.y - e.y, p.x - e.x);
  for (const o of adds()) { // the dinner bell rings: the stragglers come in too (devour pulls the near ones in)
    const ddx = e.x - o.x, ddy = e.y - o.y, dd = Math.hypot(ddx, ddy) || 1;
    if (dd > 290) { o.x += ddx / dd * 180 * dt; o.y += ddy / dd * 180 * dt; }
  }
  const h0 = e.hp;
  bossSpecial(e, 'devour', dt, dist, ux, uy, a, bd); // (reuse devour: the pull, the heal, the ring)
  sg2Noms(e, s, 'dinner', 'dinner', h0); // (the cycle's snack budget applies here too: the wrapper's check ran before this call)
}
// A dinner cut short (the pattern rolled over) must not leave adds frozen.
function sg2Release(e) {
  if (!G) return;
  for (const o of G.enemies) if (o.sg2Sp != null && o.summonedBy === e) { o.speed = o.sg2Sp; o.sg2Sp = null; }
}
{
  const prev = bossAI;
  bossAI = function (e, dt, dist, ux, uy) {
    prev(e, dt, dist, ux, uy);
    if (e.def.id === 'queen' && e.sg2 && e.def.patterns[e.pat] !== 'dinner') sg2Release(e);
  };
}

// ---------------------------------------------------------------- drawing (soft edges, no hard outlines: STYLE.md)
function sg2Lane(x1, y1, x2, y2, w, rgb, k) { // a soft lane, brighter as it nears landing
  const X1 = sx(x1), Y1 = sy(y1), X2 = sx(x2), Y2 = sy(y2), a = Math.atan2(Y2 - Y1, X2 - X1), ww = w * S / 2, ca = Math.cos(a), sa = Math.sin(a);
  const g = ctx.createLinearGradient(X1, Y1, X2, Y2);
  g.addColorStop(0, `rgba(${rgb},${(0.18 + 0.22 * k).toFixed(3)})`); g.addColorStop(0.5, `rgba(${rgb},${(0.1 + 0.2 * k).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},${(0.18 + 0.22 * k).toFixed(3)})`);
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(X1 - sa * ww, Y1 + ca * ww); ctx.lineTo(X2 - sa * ww, Y2 + ca * ww); ctx.lineTo(X2 + sa * ww, Y2 - ca * ww); ctx.lineTo(X1 + sa * ww, Y1 - ca * ww); ctx.closePath(); ctx.fill();
}
function sg2Disc(x, y, R, rgb, a) {
  const X = sx(x), Y = sy(y), r = R * S, g = ctx.createRadialGradient(X, Y, r * 0.3, X, Y, r * 1.5);
  g.addColorStop(0, `rgba(${rgb},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, r * 1.5, 0, TAU); ctx.fill();
}
const sg2Draw0 = nf10Draw;
nf10Draw = function () {
  sg2Draw0();
  if (!G) return;
  const now = G.realT, p = G.player;
  for (const e of G.enemies) {
    if (!e.boss || e.dead || !e.sg2) continue;
    const s = e.sg2, x = sx(e.x), y = sy(e.y);
    ctx.save();
    if (s.cf) { // the lane between the twins
      const cf = s.cf;
      if (cf.ph === 1) sg2Lane(cf.ax, cf.ay, cf.bx, cf.by, SG2.cfW, '255,70,90', cf.t / SG2.cfTell);
      else if (cf.ph === 2) { ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ff4660'; ctx.lineCap = 'round'; ctx.lineWidth = SG2.cfW * S * 0.8; ctx.beginPath(); ctx.moveTo(sx(cf.ax), sy(cf.ay)); ctx.lineTo(sx(cf.bx), sy(cf.by)); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, SG2.cfW * S * 0.3); ctx.stroke(); }
    }
    if (s.chunks) for (const ch of s.chunks) { // the chunk's lane, then the chunk
      const tx = ch.x0 + Math.cos(ch.a) * SG2.chunkLen, ty = ch.y0 + Math.sin(ch.a) * SG2.chunkLen;
      if (ch.t < SG2.chunkTell) sg2Lane(ch.x0, ch.y0, tx, ty, SG2.chunkR * 2, '224,196,138', ch.t / SG2.chunkTell);
      else { ctx.globalAlpha = 0.9; sg2Disc(ch.x, ch.y, SG2.chunkR, '224,196,138', 0.85); }
    }
    if (s.rd && s.rd.ph < 2) { // the route, bed to bed
      const rd = s.rd, k = rd.ph === 0 ? rd.t / SG2.bedTell : 1;
      ctx.setLineDash([8 * S, 7 * S]); ctx.lineWidth = Math.max(1.5, 3 * S); ctx.strokeStyle = `rgba(123,237,159,${(0.2 + 0.3 * k).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(x, y);
      for (let i = rd.ph === 0 ? 0 : rd.leg; i < 3; i++) ctx.lineTo(sx(rd.pts[i].x), sy(rd.pts[i].y));
      ctx.stroke(); ctx.setLineDash([]);
      for (let i = rd.ph === 0 ? 0 : rd.leg; i < 3; i++) sg2Disc(rd.pts[i].x, rd.pts[i].y, 46, '123,237,159', 0.18 + 0.3 * k);
      if (rd.ph === 1) sg2Disc(e.x, e.y, SG2.bedRad, '123,237,159', 0.14);
    }
    if (s.fp) { // the copies are see-through; the real one wears a ring
      const fp = s.fp, fade = clamp(fp.t / 0.3, 0, 1) * clamp((SG2.fpLen - fp.t) / 0.8, 0, 1);
      if (fade > 0) for (const c of fp.cp) { ctx.globalAlpha = 0.28 * fade; sg2Disc(c.x, c.y + Math.sin(c.ph) * 3, e.r, '232,228,255', 0.8); }
      ctx.globalAlpha = 1;
      if (fp.dest) { const k = clamp((fp.t - (SG2.fpTell + fp.jump * SG2.fpGap - SG2.fpTell)) / SG2.fpTell, 0, 1); sg2Disc(fp.dest.x, fp.dest.y, e.r * 1.3, '199,125,255', 0.15 + 0.4 * k); }
      if (fade > 0) { ctx.strokeStyle = `rgba(255,255,255,${(0.35 + 0.25 * Math.sin(now * 6)).toFixed(3)})`; ctx.lineWidth = Math.max(1.5, 2.5 * S); ctx.beginPath(); ctx.arc(x, y, e.r * S * 1.45, 0, TAU); ctx.stroke(); }
    }
    if (s.sc) { // the marked sector, then the sweep
      const sc = s.sc, R = SG2.scLen * S, a0 = sc.a0 - SG2.scHalf, a1 = sc.a0 + SG2.scHalf, k = sc.ph === 0 ? sc.t / SG2.scTell : 1;
      if (sc.ph < 2) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, `rgba(157,78,221,${(0.12 + 0.22 * k).toFixed(3)})`); g.addColorStop(1, `rgba(157,78,221,${(0.03 + 0.06 * k).toFixed(3)})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, R, a0, a1); ctx.closePath(); ctx.fill();
      }
      if (sc.ph === 1) { ctx.globalAlpha = 0.9; ctx.lineCap = 'round'; ctx.strokeStyle = '#c77dff'; ctx.lineWidth = 30 * S; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(sc.ang) * R, y + Math.sin(sc.ang) * R); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, 10 * S); ctx.stroke(); }
    }
    if (s.rf && s.rf.t < SG2.rfTell + SG2.rfWave + 0.2) { // the half that will be flooded, then the wave
      const rf = s.rf, k = clamp(rf.t / SG2.rfTell, 0, 1), nx = Math.cos(rf.a), ny = Math.sin(rf.a), L = 2200, X0 = sx(rf.x0), Y0 = sy(rf.y0), N = L * S;
      const g = ctx.createLinearGradient(X0, Y0, X0 + nx * N, Y0 + ny * N);
      g.addColorStop(0, `rgba(184,243,90,${(0.1 + 0.2 * k).toFixed(3)})`); g.addColorStop(1, `rgba(184,243,90,${(0.03 + 0.05 * k).toFixed(3)})`);
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(X0 - ny * N, Y0 + nx * N); ctx.lineTo(X0 + ny * N, Y0 - nx * N); ctx.lineTo(X0 + ny * N + nx * N, Y0 - nx * N + ny * N); ctx.lineTo(X0 - ny * N + nx * N, Y0 + nx * N + ny * N); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(214,255,140,${(0.25 + 0.4 * k).toFixed(3)})`; ctx.lineWidth = Math.max(1.5, 3 * S); ctx.beginPath(); ctx.moveTo(X0 - ny * N, Y0 + nx * N); ctx.lineTo(X0 + ny * N, Y0 - nx * N); ctx.stroke();
    }
    if (s.dn && s.dn.ph < 2) { // her line
      const dn = s.dn, k = dn.ph === 0 ? dn.t / SG2.dnTell : 1;
      sg2Lane(e.x, e.y, e.x + Math.cos(dn.a) * 620, e.y + Math.sin(dn.a) * 620, 70, '255,77,141', k);
    }
    ctx.restore();
  }
};
