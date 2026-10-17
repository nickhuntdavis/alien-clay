'use strict';
// Spawn Prawn - v10 enemies, brought to life (ENEMY_DESIGN 6.2 to 6.4, 7.1 to 7.4; matrix 10, 11.4 to 11.6, 13).
//
// Owns: the roster wiring (ENEMIES rebuilt from ROSTER under V10), the AI and drawings of the new enemies, the wax
// walls, and the Smouldering elite modifier.
//   Static Sock    Squishy chaser. Crackle builds by distance travelled in 3 visible steps (knockback adds none). At full,
//                  its next touch charges 0.3 s and delivers one heavy zap, then Crackle resets. Below full: a weak touch.
//   Stress Ball    Squishy tank. Every 5th qualifying Force hit (damage landed, not a tick, Pool or reaction, one per 0.1 s)
//                  squeezes it 0.5 s then rebounds: a fixed push, stopped at walls, hazards, the egg and the dish rim.
//                  4 squeeze stages; one stage relaxes after 2 s with no qualifying hit.
//   Mosquito       Fixed bite, then flies off. Kill it within 4 s of the bite for half the bite back (capped). Dies into a
//                  small Blood pool. Gone for good (and so is the health) if it leaves the screen. Cap 4.
//   Matchstick     Charger. Strikes (flare), shows its lit lane, charges in a straight line leaving a thin burning trail.
//   Birthday Candle Stationary. Drips wax that hardens into a short-lived wall (about 60 long, 6 s, 30 health, blocks
//                  movement and shots, 2 per Candle). Lights a Mucus patch beside it into a Burst. Cap 1.
//   Trapped Wind   Squishy Carrier. Drifts. A Fire hit, a Burning enemy touching it, or a Matchstick trail sets off ONE
//                  Burst (marked first) that sets Burning on everyone inside. No chain to other pockets. Cap 2.
//   Ingrown Hair   A plain chaser with Thorns (the defence comes from the roster).
//   Smouldering    ROSTER_ELITE_MODS.smouldering: a quarter of elites carry it; on death one marked Fire Burst.
// Types are capped by foes2.js (G.typeN, roster `cap`). Telegraphs: Contact charges show their lane, Bursts their area.
// Hooks: game.js update -> nfTick; damageEnemy -> nfHit (after fightHit); killEnemy -> nfKill;
//   v10.js v10Draw -> nfDraw. AI rides FOE_AI (game.js updateEnemies default branch); shapes ride MICROBES (render.js).
// Save data: none.

const NF_KEEP = ['wisp', 'paramecium', 'volvox', 'volvoxling', 'pepsinjr']; // cut from random spawns, kept because events and bosses spawn them by id
const NF = {
  wax: { len: 60, thick: 14, hp: 30, life: 6, soft: 1.5, max: 2, tele: 0.6, cd: 4, reach: 85 },
  burstWind: { r: 85, tele: 0.5, dmg: 14 },
  smoulder: { r: 60, tele: 0.6, dmg: 6, chance: 0.25 },
  lit: { cd: 3, tele: 0.6, dmg: 12, grow: 20 },
  trail: { step: 14, r: 9, life: 2.5, dmg: 0.35, tick: 0.5 },
  sockMult: 4.4, sockWind: 0.3,
  chargeLen: 0.6,
};

// ---------------------------------------------------------------- 1. roster wiring
function nfWire() {
  if (typeof V10 === 'undefined' || !V10 || typeof ROSTER === 'undefined') return;
  const old = Object.assign({}, ENEMIES), drop = { weak: 1, resist: 1, does: 1, armour: 1 };
  for (const id in ROSTER) {
    const r = ROSTER[id], o = old[id];
    if (r.cut && !NF_KEEP.includes(id)) { delete ENEMIES[id]; continue; }
    const d = {};
    if (o) for (const k in o) if (!drop[k]) d[k] = o[k]; // engine fields the roster does not restate (noCrit and the like)
    Object.assign(d, r, { armour: 0 });
    if (/^new_/.test(d.ai) && !FOE_AI[d.ai]) d.ai = o ? o.ai : 'chase'; // placeholder AI with no code yet: keep the old behaviour
    if (r.cut) { d.w = 0; d.from = 99999; d.nfKept = true; } // events and bosses still spawn it by id; the random director does not
    ENEMIES[id] = d;
  }
  // Tables keyed by def object were built at load: rebuild them.
  if (typeof ENEMY_KEY !== 'undefined') { ENEMY_KEY.clear(); for (const k in ENEMIES) ENEMY_KEY.set(ENEMIES[k], k); }
  if (typeof FOE_KEYS !== 'undefined') FOE_KEYS = null;
  if (typeof FIGHT_IDS !== 'undefined') FIGHT_IDS = null;
}

// ---------------------------------------------------------------- helpers
const nfAI = e => e.def.ai;
const nfViewR = () => Math.hypot(W / 2 / S0, H / 2 / S0);
function nfSegD(px, py, x1, y1, x2, y2) { // distance from a point to a segment, and the nearest point on it
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  const cx = x1 + dx * t, cy = y1 + dy * t; return { d: Math.hypot(px - cx, py - cy), cx, cy };
}
const nfEnds = w => { const c = Math.cos(w.a) * NF.wax.len / 2, s = Math.sin(w.a) * NF.wax.len / 2; return [w.x - c, w.y - s, w.x + c, w.y + s]; };
const nfHard = w => w.soft <= 0 && w.hp > 0 && w.life > 0;
function nfBlocked(x, y, r) { // somewhere a push must not carry you: walls, the dish rim, the egg, hard obstacles, hazards, wax
  if (G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y)) return true;
  if (Math.hypot(x - G.core.x, y - G.core.y) > CORE.arena - 60 && !G.lvl) return true;
  if (Math.hypot(x - G.core.x, y - G.core.y) < CORE.r + r) return true;
  const cell = tCell(x, y);
  if (cell) for (const ob of cell) if ((ob.def.solid || ob.type === 'acid') && Math.hypot(x - ob.x, y - ob.y) < ob.r + r) return true;
  for (const h of G.hazards) if (Math.hypot(x - h.x, y - h.y) < h.r) return true;
  for (const z of G.zones) if (z.life > 0 && (z.nfTrail || (z.dps > 0 && (z.elem === 'fire' || z.elem === 'flame'))) && Math.hypot(x - z.x, y - z.y) < z.r) return true;
  for (const w of G.nfWax || []) if (nfHard(w)) { const [a, b, c, d] = nfEnds(w); if (nfSegD(x, y, a, b, c, d).d < NF.wax.thick / 2 + r) return true; }
  return false;
}
// Push the player a fixed distance away from (fx, fy), stopping short of anything in the way.
function nfPush(p, fx, fy, dist) {
  const dx = p.x - fx, dy = p.y - fy, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  let moved = 0;
  for (let s = 8; s <= dist + 0.01; s += 8) { const nx = p.x + ux * 8, ny = p.y + uy * 8; if (nfBlocked(nx, ny, p.r)) break; p.x = nx; p.y = ny; moved = s; }
  return moved;
}

// ---------------------------------------------------------------- 2. AI (FOE_AI, called from updateEnemies)
Object.assign(FOE_AI, {
  // Static Sock: Crackle by distance travelled. Full Crackle: the next touch charges 0.3 s, then one heavy zap.
  new_staticsock(e, dt, dist) {
    const C = ROSTER.staticsock.crackle, max = C.steps * C.distPerStep, p = me();
    if (e.nfD == null) { e.nfD = e.dmg; e.crk = 0; e.zapT = 0; e.lx = e.x; e.ly = e.y; }
    const mv = Math.hypot(e.x - e.lx, e.y - e.ly); e.lx = e.x; e.ly = e.y;
    if (mv < 400 * dt && Math.hypot(e.kx, e.ky) < 30) e.crk = Math.min(max, e.crk + mv); // knocked back, or recycled: adds nothing
    if (e.zapT > 0) {
      e.dmg = 0; e.zapT -= dt;
      if (e.zapT <= 0) {
        e.crk = 0; e.zapRT = G.realT;
        if (Math.hypot(p.x - e.x, p.y - e.y) < e.r + p.r + 14) { bolt(e.x, e.y, p.x, p.y, '#ffe94a', 0.2); hurtPlayer(e.nfD * NF.sockMult * G.evm.contact, e.name + ' zap', e, 'contact'); }
        else floatText(e.x, e.y - e.r - 10, 'fizzle', '#ffe94a', 11, 0.6);
        e.dmg = e.nfD;
      }
      return { x: 0, y: 0, s: 0 };
    }
    const full = e.crk >= max;
    e.dmg = full ? 0 : e.nfD; // below full, the touch is the ordinary weak one
    if (full && dist < e.r + p.r + 6) { e.zapT = NF.sockWind; e.zapStart = G.realT; return { x: 0, y: 0, s: 0 }; }
    return null;
  },
  // Stress Ball: counts Force hits (nfHit). On the 5th it squeezes, holds still, then springs back.
  new_stressball(e, dt) {
    const R = ROSTER.stressball.rebound;
    if (e.sb == null) { e.sb = 0; e.sbLast = -99; e.sbWind = 0; e.sbN = 0; }
    if (e.sbWind > 0) { e.sbWind -= dt; if (e.sbWind <= 0) nfRebound(e); return { x: 0, y: 0, s: 0 }; }
    if (e.sb > 0 && G.t - e.sbLast > R.relaxAfter) { e.sb--; e.sbLast = G.t; } // quiet for 2 s: one stage relaxes
    return null;
  },
  // Mosquito: closes, bites once (a fixed amount), then flies off. Gone for good once it leaves the screen.
  new_mosquito(e, dt, dist, ux, uy) {
    const B = ROSTER.mosquito.bite, p = me();
    if (e.nfD == null) { e.nfD = e.dmg; e.mq = 0; e.mqT = 0; }
    e.dmg = 0; // the bite is delivered here, not by the generic touch
    if (e.mq === 0) {
      if (dist < e.r + p.r + 3) {
        const h0 = p.hp; hurtPlayer(e.nfD * G.evm.contact, 'Mosquito bite', e, 'contact');
        e.mq = 1; e.mqT = 0; e.fedRT = G.realT;
        const lost = h0 - p.hp;
        if (lost > 0) { e.fed = lost; e.fedT = G.t + B.swellFor; floatText(e.x, e.y - e.r - 10, 'bzz', '#d9777f', 11, 0.7); }
      }
      return null;
    }
    e.mqT += dt;
    if (dist > nfViewR() * 1.1) { e.dead = true; return { x: 0, y: 0, s: 0 }; } // off the screen: it, and your health, are gone
    const w = Math.sin(e.mqT * 6 + e.id) * 0.5;
    return { x: -ux * Math.cos(w) + uy * Math.sin(w), y: -uy * Math.cos(w) - ux * Math.sin(w), s: e.speed * 1.1 };
  },
  // Matchstick: walks up, strikes (flare, lane lit), charges in a line, lays a thin burning trail.
  new_matchstick(e, dt, dist, ux, uy) {
    if (e.nfD == null) { e.nfD = e.dmg; e.st = 0; e.stT = rand(1, 2.2); }
    if (e.st === 0) {
      e.stT -= dt;
      if (e.stT <= 0 && dist < 280) { e.st = 1; e.stT = 0.7; e.dashX = ux; e.dashY = uy; e.msRT = G.realT; }
      return null;
    }
    if (e.st === 1) { // the strike: flare first, the lane lit all the while
      e.stT -= dt;
      if (e.stT <= 0) { e.st = 2; e.stT = NF.chargeLen; e.msX = e.x; e.msY = e.y; }
      return { x: 0, y: 0, s: 0 };
    }
    e.stT -= dt;
    if (Math.hypot(e.x - e.msX, e.y - e.msY) >= NF.trail.step) { nfTrail(e, e.x, e.y); e.msX = e.x; e.msY = e.y; }
    if (e.stT <= 0) { e.st = 0; e.stT = 2.6; }
    return { x: e.dashX, y: e.dashY, s: e.speed * ROSTER.matchstick.atk[0].speedMult };
  },
  // Birthday Candle: stationary. Drips wax that hardens into a wall; lights a Mucus patch beside it.
  new_candle(e, dt, dist, ux, uy) {
    const W_ = NF.wax;
    if (e.cdT == null) { e.cdT = rand(1.5, 3); e.litT = 0.3; e.dripW = 0; e.nfD = e.dmg; }
    e.litT -= dt;
    if (e.litT <= 0) { // scan for a Mucus patch beside it
      e.litT = 0.5;
      if (!(e.litCd > G.t)) for (const z of G.zones) if (z.elem === 'ice' && z.life > 0.8 && !z.nfLit && !z.stuck && Math.hypot(z.x - e.x, z.y - e.y) < ROSTER.candle.lights.range + z.r) {
        z.nfLit = 1; e.litCd = G.t + NF.lit.cd; e.flareRT = G.realT;
        (G.nfBurst || (G.nfBurst = [])).push({ x: z.x, y: z.y, r: z.r + NF.lit.grow, t: NF.lit.tele, max: NF.lit.tele, dmg: NF.lit.dmg, by: 'Lit Mucus', z, owner: e });
        break;
      }
    }
    if (e.dripW > 0) {
      e.dripW -= dt;
      if (e.dripW <= 0) nfDrip(e);
    } else {
      e.cdT -= dt;
      const mine = (G.nfWax || []).filter(w => w.owner === e && w.life > 0 && w.hp > 0).length;
      if (e.cdT <= 0 && dist < 520 && mine < W_.max) { e.dripW = W_.tele; e.cdT = W_.cd; e.flareRT = G.realT; }
      else if (e.cdT <= 0) e.cdT = 1;
    }
    return { x: 0, y: 0, s: 0 };
  },
  // Trapped Wind: drifts. Lit (nfIgnite), it swells for 0.5 s and goes up in one Burst.
  new_trappedwind(e, dt, dist, ux, uy) {
    if (e.wd == null) { e.wd = rand(0, TAU); e.windT = 0; e.nfLit = false; }
    if (e.windT > 0) { e.windT -= dt; if (e.windT <= 0) nfWindBurst(e); return { x: 0, y: 0, s: 0 }; }
    e.wd += rand(-1, 1) * dt * 2;
    return { x: ux * 0.45 + Math.cos(e.wd) * 0.8, y: uy * 0.45 + Math.sin(e.wd) * 0.8, s: e.speed };
  },
});

// ---------------------------------------------------------------- 3. effects
function nfTrail(e, x, y) {
  if (G.zones.length > ZONE_CAP - 20) return;
  const T = NF.trail;
  G.zones.push({ x, y, r: T.r, life: T.life, max: T.life, dps: 0, elem: 'flame', pull: 0, color: ELEMENTS.flame.color, tick: 0, quiet: true, nfTrail: 1, nfDmg: e.nfD * T.dmg, nfT: 0, src: { elem: 'flame', noStatus: true, wname: 'Matchstick trail' } });
}
function nfDrip(e) { // a drop of wax lands between the Candle and you, across the line to you
  const p = me(), a = Math.atan2(p.y - e.y, p.x - e.x), d = Math.min(NF.wax.reach, Math.hypot(p.x - e.x, p.y - e.y) * 0.6 + e.r + 20);
  (G.nfWax || (G.nfWax = [])).push({ x: e.x + Math.cos(a) * d, y: e.y + Math.sin(a) * d, a: a + Math.PI / 2, soft: NF.wax.soft, hp: NF.wax.hp, life: NF.wax.life, owner: e });
  spawnPart(e.x + Math.cos(a) * (e.r + 4), e.y + Math.sin(a) * (e.r + 4), '#fbe9ef', 5, 60, 0.4, 2);
}
function nfRebound(e) {
  const R = ROSTER.stressball.rebound, p = me();
  e.sb = 0; e.sbN = (e.sbN || 0) + 1; e.sbRT = G.realT;
  ring(e.x, e.y, R.radius, '#f2a65a', 0.35, 4); spawnPart(e.x, e.y, '#f2a65a', 10, 150, 0.4, 3);
  const d = Math.hypot(p.x - e.x, p.y - e.y);
  if (d < R.radius + p.r) e.sbPushed = nfPush(p, e.x, e.y, R.push); else e.sbPushed = 0;
}
function nfIgnite(w) { // light a Trapped Wind pocket (once)
  if (w.dead || w.nfLit) return;
  w.nfLit = true; w.windT = NF.burstWind.tele; w.windRT = G.realT;
  floatText(w.x, w.y - w.r - 10, 'whoomph', '#ffb35a', 12, 0.6);
}
function nfWindBurst(w) {
  const B = NF.burstWind;
  nfDetonate({ x: w.x, y: w.y, r: B.r, dmg: B.dmg, by: 'Trapped Wind', owner: w, skipWind: true, noIgn: true });
  w.hp = 0; killEnemy(w, { wname: 'Trapped Wind' });
}
// One Burst going off: Fire on every enemy in it (which sets Burning), a hit on you if you stand in it.
function nfDetonate(b) {
  const p = me(), src = { elem: 'flame', atk: 'burst', noCrit: true, nfNoIgnite: !!b.noIgn, wname: b.by };
  ring(b.x, b.y, b.r, '#ff6a2a', 0.4, 5); spawnPart(b.x, b.y, '#ff8a3a', 14, 180, 0.5, 3);
  for (const o of G.enemies.slice()) {
    if (o.dead || o === b.owner || o.egg || (b.skipWind && nfAI(o) === 'new_trappedwind') || Math.hypot(o.x - b.x, o.y - b.y) > b.r + o.r) continue;
    damageEnemy(o, b.dmg, src);
  }
  if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + p.r * 0.5) hurtPlayer(b.dmg * dmgNow() * 0.5, b.by, null, 'blast');
  if (b.z) b.z.life = 0;
}

// ---------------------------------------------------------------- 4. hooks
// game.js damageEnemy, after fightHit: d is what reached health.
function nfHit(e, src, d) {
  const ai = nfAI(e);
  if (ai === 'new_stressball') {
    if (!(d > 0) || src.dot || src.zoneHit || src.rx || src.echo || src.env || e.sbWind > 0) return;
    if ((FIGHT_TYPE[src.elem || 'phys'] || 'force') !== 'force' || e.sbT > G.t) return;
    if (e.sb == null) { e.sb = 0; e.sbWind = 0; }
    e.sbT = G.t + ROSTER.stressball.rebound.minGap; e.sbLast = G.t; e.sb++;
    if (e.sb >= ROSTER.stressball.rebound.every) { e.sbWind = ROSTER.stressball.rebound.tele; e.sbWindRT = G.realT; floatText(e.x, e.y - e.r - 10, 'SQUEEZE', '#f2a65a', 12, 0.6); }
  } else if (ai === 'new_trappedwind') {
    if (src.elem === 'flame' && !src.dot && !src.nfNoIgnite) nfIgnite(e);
  }
}
// game.js killEnemy: refunds, pools, Smouldering.
function nfKill(e, src) {
  const ai = nfAI(e);
  if (ai === 'new_mosquito') {
    if (e.fedT > G.t && e.fed > 0) {
      const B = ROSTER.mosquito.bite, back = Math.min(e.fed * B.refund, B.refundCapPerBite * dmgNow());
      healPlayer(back, true); floatText(me().x, me().y - 26, '+' + Math.max(1, Math.round(back)) + ' back', '#8ac926', 13, 0.8);
    }
    if (G.zones.length < ZONE_CAP) G.zones.push({ x: e.x, y: e.y, r: 35, life: 3, max: 3, dps: 0, elem: 'arcane', pull: 0, color: ELEMENTS.arcane.color, tick: 0, quiet: true, blood: true, src: { elem: 'arcane', noStatus: true, wname: 'Mosquito' } });
  }
  if (e.nfSm) (G.nfBurst || (G.nfBurst = [])).push({ x: e.x, y: e.y, r: NF.smoulder.r, t: NF.smoulder.tele, max: NF.smoulder.tele, dmg: NF.smoulder.dmg, by: 'Smouldering', noIgn: true });
}

function nfTick(dt) {
  if (typeof V10 === 'undefined' || !V10 || !G || G.state !== 'play') return;
  const p = me(), enemies = G.enemies;
  // Smouldering: a quarter of elites carry it, decided once.
  for (const e of enemies) if (e.elite && !e.boss && !e.dead && e.nfSm == null) e.nfSm = Math.random() < NF.smoulder.chance;
  // Bursts on a fuse (lit Mucus, Smouldering deaths).
  if (G.nfBurst) { for (const b of G.nfBurst) { b.t -= dt; if (b.t <= 0) { b.done = true; nfDetonate(b); } } G.nfBurst = G.nfBurst.filter(b => !b.done); }
  // Matchstick trails burn you; they can light a Trapped Wind. Trapped Wind: Burning things touching it light it.
  for (const z of G.zones) if (z.nfTrail && z.life > 0) {
    z.nfT -= dt;
    if (z.nfT <= 0 && Math.hypot(p.x - z.x, p.y - z.y) < z.r + p.r * 0.6) { z.nfT = NF.trail.tick; hurtPlayer(z.nfDmg, 'Matchstick trail', null, 'other'); }
  }
  for (const w of enemies) {
    if (w.dead || nfAI(w) !== 'new_trappedwind' || w.nfLit) continue;
    let near = 0;
    for (const o of enemies) if (o !== w && !o.dead && o.v10burn > 0 && nfAI(o) !== 'new_trappedwind') { const d = Math.hypot(o.x - w.x, o.y - w.y); if (d < w.r + o.r) { nfIgnite(w); break; } if (d < 130) near = 1; }
    if (!w.nfLit) for (const z of G.zones) if (z.nfTrail && z.life > 0 && Math.hypot(z.x - w.x, z.y - w.y) < z.r + w.r) { nfIgnite(w); break; }
    w.nfNear = w.nfLit ? 1 : near;
  }
  // Wax: softens, hardens, blocks you, enemies and shots, crumbles.
  const wax = G.nfWax;
  if (wax && wax.length) {
    for (const w of wax) {
      if (w.soft > 0) { w.soft -= dt; if (w.soft <= 0) w.hardRT = G.realT; continue; }
      w.life -= dt;
      const [x1, y1, x2, y2] = nfEnds(w), T = NF.wax.thick / 2;
      const push = (o, r) => { const s = nfSegD(o.x, o.y, x1, y1, x2, y2), ov = T + r - s.d; if (ov > 0) { let nx = o.x - s.cx, ny = o.y - s.cy, l = Math.hypot(nx, ny); if (l < 0.01) { nx = -Math.sin(w.a); ny = Math.cos(w.a); l = 1; } o.x += nx / l * ov; o.y += ny / l * ov; } };
      push(p, p.r);
      for (const o of enemies) if (!o.dead && !o.boss && !o.egg && !o.def.ethereal && !o.ghost && o !== w.owner) push(o, o.r * 0.8);
      const stop = (s, r) => { // swept over this frame's travel
        for (const k of [0, 0.5, 1]) { const px = s.x + (s.vx || 0) * dt * k, py = s.y + (s.vy || 0) * dt * k; if (nfSegD(px, py, x1, y1, x2, y2).d < T + r) return true; }
        return false;
      };
      for (const b of G.ebul) if (!b.dead && stop(b, b.r || 4)) { b.dead = true; w.hp -= 4; spawnPart(b.x, b.y, '#fbe9ef', 2, 50, 0.25, 2); }
      for (const s of G.proj) if (!s.dead && !s.lob && s.vx != null && stop(s, s.r || 3)) { s.dead = true; w.hp -= Math.min(15, s.dmg || 8); spawnPart(s.x, s.y, '#fbe9ef', 2, 50, 0.25, 2); }
      if (w.hp <= 0 && w.life > 0) { w.life = 0; spawnPart(w.x, w.y, '#fbe9ef', 8, 110, 0.4, 2); }
    }
    G.nfWax = wax.filter(w => w.life > 0 && w.hp > 0);
  }
}

// ---------------------------------------------------------------- 5. world drawing (v10.js v10Draw): telegraphs, trails, walls
function nfDraw() {
  if (!G) return;
  const now = G.realT;
  ctx.save(); ctx.lineCap = 'round';
  for (const w of G.nfWax || []) { // wax: a soft puddle, then a pale hard bar that cracks as it wears
    const [x1, y1, x2, y2] = nfEnds(w);
    if (w.soft > 0) {
      ctx.globalAlpha = 0.75; ctx.fillStyle = 'rgba(251,233,239,0.8)'; ctx.beginPath(); ctx.ellipse(sx(w.x), sy(w.y), 24 * S, 11 * S, w.a, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5; ctx.setLineDash([4 * S, 4 * S]); ctx.stroke(); ctx.setLineDash([]);
    } else {
      const worn = w.life < 1.5 ? 0.5 + 0.5 * Math.sin(now * 30) : 1;
      ctx.globalAlpha = 0.95 * worn; ctx.strokeStyle = 'rgba(70,60,64,0.9)'; ctx.lineWidth = (NF.wax.thick + 4) * S; ctx.beginPath(); ctx.moveTo(sx(x1), sy(y1)); ctx.lineTo(sx(x2), sy(y2)); ctx.stroke();
      ctx.strokeStyle = 'rgba(250,236,240,1)'; ctx.lineWidth = NF.wax.thick * S; ctx.stroke();
      const k = w.hp / NF.wax.hp; if (k < 0.7) { ctx.strokeStyle = 'rgba(70,60,64,0.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sx(w.x - 6), sy(w.y - 4)); ctx.lineTo(sx(w.x + 2), sy(w.y + 3)); ctx.lineTo(sx(w.x + 8), sy(w.y - 2)); ctx.stroke(); }
    }
  }
  ctx.globalAlpha = 1;
  for (const z of G.zones) if (z.nfTrail && z.life > 0) { // a thin line of flame
    const k = Math.min(1, z.life / 0.6), f = 0.7 + 0.3 * Math.sin(now * 25 + z.x);
    ctx.globalAlpha = 0.85 * k; ctx.fillStyle = 'rgba(255,106,42,0.55)'; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S * f, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,224,130,0.9)'; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y) - 2 * S, z.r * 0.45 * S * f, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const b of G.nfBurst || []) { // an area about to go off
    const k = 1 - b.t / b.max;
    ctx.strokeStyle = '#ff6a2a'; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 22) ** 2; ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]);
    ctx.beginPath(); ctx.arc(sx(b.x), sy(b.y), b.r * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 0.12 + 0.2 * k; ctx.fillStyle = '#ff6a2a'; ctx.beginPath(); ctx.arc(sx(b.x), sy(b.y), b.r * k * S, 0, TAU); ctx.fill();
  }
  for (const e of G.enemies) {
    if (e.dead) continue;
    const x = sx(e.x), y = sy(e.y), ai = nfAI(e);
    if (e.nfSm) { // Smouldering elite: an ember glow
      ctx.globalAlpha = 0.35 + 0.2 * Math.sin(now * 6 + e.id); ctx.strokeStyle = '#ff6a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, e.r * S + 7 * S, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = '#ff8a3a'; for (let i = 0; i < 3; i++) { const ph = (now * 0.8 + i / 3 + e.id) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(x + Math.sin(e.id + i * 2) * e.r * S * 0.6, y - ph * e.r * S * 1.2, 1.8, 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (ai === 'new_matchstick' && e.st === 1) { // the lane, lit before it runs
      const L = e.speed * ROSTER.matchstick.atk[0].speedMult * NF.chargeLen, k = 1 - e.stT / 0.7;
      ctx.globalAlpha = 0.25 + 0.4 * k; ctx.strokeStyle = '#ff7a2f'; ctx.lineWidth = e.r * 2 * S; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + e.dashX * L * S, y + e.dashY * L * S); ctx.stroke();
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#ffe9a0'; ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]); ctx.stroke(); ctx.setLineDash([]);
    } else if (ai === 'new_stressball' && e.sbWind > 0) { // where the rebound reaches
      const R = ROSTER.stressball.rebound, k = 1 - e.sbWind / R.tele;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 25) ** 2; ctx.strokeStyle = '#f2a65a'; ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]); ctx.beginPath(); ctx.arc(x, y, R.radius * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.1 + 0.18 * k; ctx.fillStyle = '#f2a65a'; ctx.beginPath(); ctx.arc(x, y, R.radius * S * k, 0, TAU); ctx.fill();
    } else if (ai === 'new_trappedwind' && e.windT > 0) {
      const k = 1 - e.windT / NF.burstWind.tele;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 25) ** 2; ctx.strokeStyle = '#ff6a2a'; ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]); ctx.beginPath(); ctx.arc(x, y, NF.burstWind.r * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.1 + 0.2 * k; ctx.fillStyle = '#ff6a2a'; ctx.beginPath(); ctx.arc(x, y, NF.burstWind.r * S * k, 0, TAU); ctx.fill();
    } else if (ai === 'new_staticsock' && e.zapT > 0) { // the zap is about to land on whatever is in reach
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 40) ** 2; ctx.strokeStyle = '#ffe94a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, (e.r + 26) * S, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 6. shapes (MICROBES, called from render.js drawEnemy)
const nfRot = (x, y, a, fn) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); fn(); ctx.restore(); };
const nfBolts = (x, y, r, n, seed, col) => { // short jagged sparks round a body
  ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = seed + i * TAU / n + Math.floor(G.realT * 14) * 1.7, r0 = r * 0.95; ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a + 0.25) * (r0 + r * 0.3), y + Math.sin(a + 0.25) * (r0 + r * 0.3)); ctx.lineTo(x + Math.cos(a - 0.1) * (r0 + r * 0.55), y + Math.sin(a - 0.1) * (r0 + r * 0.55)); }
  ctx.stroke();
};
Object.assign(MICROBES, {
  ingrown(e, x, y, r) { // a dark curl of hair with a pale root bulb; its spines are the Thorns ring
    const t = G.realT * 0.6 + e.id;
    ctx.strokeStyle = e.flash > 0 ? '#ffffff' : eTone(e, 0.5); ctx.lineWidth = Math.max(2, r * 0.42); ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 22; i++) { const k = i / 22, a = k * 6.6 + t * 0.4, rr = r * (1.0 - 0.8 * k); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1, r * 0.12); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = e.flash > 0 ? '#ffffff' : 'rgba(228,186,176,0.95)'; ctx.beginPath(); ctx.arc(x + r, y, r * 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(190,80,80,0.7)'; ctx.beginPath(); ctx.arc(x + r * 1.05, y - r * 0.05, r * 0.12, 0, TAU); ctx.fill();
  },
  sock(e, x, y, r, face) { // a knitted sock: foot, heel, a ribbed cuff; Crackle shows as sparks in 3 steps
    const max = ROSTER.staticsock.crackle.steps * ROSTER.staticsock.crackle.distPerStep, step = Math.floor(Math.min(max, e.crk || 0) / ROSTER.staticsock.crackle.distPerStep), full = (e.crk || 0) >= max;
    nfRot(x, y, face, () => {
      ctx.fillStyle = mBody(e, 0.42);
      ctx.beginPath(); ctx.ellipse(r * 0.15, 0, r * 1.15, r * 0.62, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.stroke(); // foot
      ctx.beginPath(); ctx.arc(-r * 0.95, r * 0.15, r * 0.5, 0, TAU); ctx.fillStyle = mBody(e, 0.38); ctx.fill(); ctx.stroke(); // heel
      ctx.fillStyle = 'rgba(30,36,32,0.45)'; for (let i = 0; i < 3; i++) ctx.fillRect(-r * 1.25 - i * r * 0.18, -r * 0.45, r * 0.1, r * 0.95); // ribbed cuff
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(r * 0.85, -r * 0.1, r * 0.2, 0, TAU); ctx.fill(); // toe
    });
    if (step >= 1) nfBolts(x, y, r, step * 2, e.id, full ? '#ffffff' : '#ffe94a');
    if (full) { ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.realT * 30) ** 2; ctx.fillStyle = '#ffe94a'; ctx.beginPath(); ctx.arc(x, y, r * 1.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    if (e.zapT > 0) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, TAU); ctx.stroke(); }
  },
  stressball(e, x, y, r) { // a squeezy ball: flattens a stage per Force hit, pips above show the count
    const n = e.sbWind > 0 ? 4.5 : (e.sb || 0), sq = 0.075 * n, sh = e.sbWind > 0 ? Math.sin(G.realT * 60) * r * 0.04 : 0;
    ctx.save(); ctx.translate(x + sh, y); ctx.scale(1 + sq, 1 - sq * 1.2);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = mBody(e, 0.42 - 0.04 * Math.min(4, n)); ctx.fill(); mHalo(r * 0.12);
    ctx.strokeStyle = 'rgba(30,36,32,0.4)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0.5, 2.6); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 3.6, 5.7); ctx.stroke(); // the seams
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.25, r * 0.12, -0.6, 0, TAU); ctx.fill();
    ctx.restore();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + (i - 1.5) * r * 0.36, y - r * 1.35, r * 0.11, 0, TAU); ctx.fillStyle = i < Math.round(n) ? '#f2a65a' : 'rgba(255,255,255,0.28)'; ctx.fill(); }
  },
  mosquito(e, x, y, r, face) { // a gnat with a needle; the abdomen swells red while it holds the bite
    const fed = e.fedT > G.t ? Math.min(1, (G.t - (e.fedT - 4)) / 0.4 + 0.1) : e.fedT > G.t - 0.5 ? (e.fedT - G.t + 0.5) : 0, ab = r * (0.55 + 0.75 * fed), buzz = Math.sin(G.realT * 70 + e.id);
    nfRot(x, y, face, () => {
      ctx.fillStyle = 'rgba(235,240,245,0.5)'; ctx.beginPath(); ctx.ellipse(-r * 0.1, -r * 0.7, r * 0.95, r * (0.28 + 0.1 * buzz), -0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-r * 0.1, r * 0.7, r * 0.95, r * (0.28 - 0.1 * buzz), 0.4, 0, TAU); ctx.fill(); // wings
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : fed > 0 ? 'rgb(' + Math.round(110 + 90 * fed) + ',' + Math.round(70 - 40 * fed) + ',' + Math.round(75 - 30 * fed) + ')' : mBody(e, 0.4);
      ctx.beginPath(); ctx.ellipse(-r * 0.75, 0, ab, ab * 0.7, 0, 0, TAU); ctx.fill(); // abdomen
      ctx.fillStyle = mBody(e, 0.35); ctx.beginPath(); ctx.arc(r * 0.15, 0, r * 0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(r * 0.6, 0, r * 0.27, 0, TAU); ctx.fill(); // thorax, head
      ctx.strokeStyle = 'rgba(40,40,44,0.9)'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.beginPath(); ctx.moveTo(r * 0.8, 0); ctx.lineTo(r * 1.7, 0); ctx.stroke(); // proboscis
    });
  },
  matchstick(e, x, y, r, face) { // a wooden match: pale stick, red head; lit once it strikes
    const lit = e.st >= 1, a = e.st >= 1 ? Math.atan2(e.dashY, e.dashX) : face;
    nfRot(x, y, a, () => {
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : 'rgba(222,190,130,0.95)'; ctx.fillRect(-r * 1.5, -r * 0.28, r * 2.3, r * 0.56);
      ctx.strokeStyle = 'rgba(60,40,20,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(-r * 1.5, -r * 0.28, r * 2.3, r * 0.56);
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : lit ? '#ff5a2a' : '#b03a2a'; ctx.beginPath(); ctx.arc(r * 0.95, 0, r * 0.55, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.stroke();
    });
    if (lit) { // the flare, then a steady flame at the head
      const hx = x + Math.cos(a) * r * 0.95, hy = y + Math.sin(a) * r * 0.95, f = 0.8 + 0.3 * Math.sin(G.realT * 30 + e.id), big = e.st === 1 ? 1.5 : 1;
      ctx.fillStyle = 'rgba(255,150,40,0.85)'; ctx.beginPath(); ctx.arc(hx, hy, r * 0.6 * f * big, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,238,160,0.95)'; ctx.beginPath(); ctx.arc(hx, hy, r * 0.28 * f * big, 0, TAU); ctx.fill();
      if (e.st === 1) { ctx.strokeStyle = '#ffe9a0'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i < 5; i++) { const sa = i * 1.3 + G.realT * 20; ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(sa) * r * 1.1, hy + Math.sin(sa) * r * 1.1); } ctx.stroke(); }
    }
  },
  candle(e, x, y, r) { // a stubby pink birthday candle with a flame; the flame flares before each drip
    const k = G.realT - (e.flareRT || -9), flare = e.dripW > 0 ? 1.5 : k < 0.3 ? 1 + 0.4 * (1 - k / 0.3) : 1, f = 0.85 + 0.2 * Math.sin(G.realT * 14 + e.id);
    ctx.fillStyle = 'rgba(30,36,32,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.9, r * 0.25, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = e.flash > 0 ? '#ffffff' : mBody(e, 0.5); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - r * 0.55, y - r * 0.7, r * 1.1, r * 1.65, r * 0.25) : ctx.rect(x - r * 0.55, y - r * 0.7, r * 1.1, r * 1.65); ctx.fill(); mHalo(r * 0.1);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = Math.max(1.5, r * 0.14); ctx.beginPath(); for (let i = 0; i < 3; i++) { ctx.moveTo(x - r * 0.5, y - r * 0.2 + i * r * 0.45); ctx.lineTo(x + r * 0.5, y + r * 0.05 + i * r * 0.45); } ctx.stroke(); // the stripes
    ctx.fillStyle = 'rgba(251,233,239,0.9)'; ctx.beginPath(); ctx.ellipse(x - r * 0.45, y - r * 0.25 + (e.dripW > 0 ? (0.6 - e.dripW) * r : 0), r * 0.13, r * 0.28, 0, 0, TAU); ctx.fill(); // a drip down the side
    ctx.strokeStyle = 'rgba(40,30,30,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - r * 0.7); ctx.lineTo(x, y - r * 0.95); ctx.stroke(); // wick
    ctx.fillStyle = 'rgba(255,150,40,0.9)'; ctx.beginPath(); ctx.ellipse(x, y - r * 1.35, r * 0.28 * flare, r * 0.5 * flare * f, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,170,0.95)'; ctx.beginPath(); ctx.ellipse(x, y - r * 1.25, r * 0.13 * flare, r * 0.25 * flare * f, 0, 0, TAU); ctx.fill();
  },
  windpocket(e, x, y, r) { // a wobbling cloud of gas; flickers orange when something burning is near, and swells once lit
    const swell = e.windT > 0 ? 1 + 0.5 * (1 - e.windT / NF.burstWind.tele) : 1, t = G.realT * 3 + e.id;
    f2blob(x, y, r * swell, 16, 0.13, e.id, t); ctx.fillStyle = e.flash > 0 ? '#ffffff' : 'rgba(' + (e.nfLit ? '250,200,130' : '226,232,190') + ',0.62)'; ctx.fill(); mHalo(r * 0.1);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) { const a = t * 0.6 + i * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.4 * swell, y + Math.sin(a) * r * 0.35 * swell, r * (0.16 + 0.04 * i), 0, TAU); ctx.fill(); } // bubbles inside
    ctx.strokeStyle = 'rgba(150,170,100,0.55)'; ctx.lineWidth = 1.3; ctx.beginPath(); for (let i = 0; i < 2; i++) { const ox = (i ? 0.45 : -0.45) * r; ctx.moveTo(x + ox, y - r * 1.05); ctx.bezierCurveTo(x + ox + 4, y - r * 1.25, x + ox - 4, y - r * 1.4, x + ox, y - r * 1.6); } ctx.stroke(); // stink lines
    if (e.nfNear) { ctx.fillStyle = 'rgba(255,120,40,' + (0.25 + 0.3 * Math.sin(G.realT * 28) ** 2).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(x, y, r * 0.7 * swell, 0, TAU); ctx.fill(); }
  },
});

Object.assign(ENEMY_INTRO, {
  staticsock: { what: 'A sock that has been dragged across every carpet in the body. The further it travels, the more it crackles.', tip: 'Kill it before it is fully charged, or step aside when it stops to zap. Being shoved does not charge it.' },
  stressball: { what: 'A stress ball. It takes every hit personally and, on the fifth Force hit, springs back and shoves you.', tip: 'Use another damage type, or keep your distance once it is fully squeezed. The rebound never pushes you through a wall.' },
  mosquito: { what: 'Bites once, then flies off with your blood. It is only borrowing it.', tip: 'Kill it within four seconds for half the bite back. Once it leaves the screen, the blood goes with it.' },
  matchstick: { what: 'Strikes itself on whatever is nearest, then charges in a straight line trailing fire. Safety was never a priority.', tip: 'Step out of the lit lane, and do not swim back through the trail.' },
  candle: { what: 'A birthday candle, lit, with a wax problem. It drips wax that sets into short-lived walls, and it lights any Mucus beside it.', tip: 'Kill it, keep Mucus away from it, and swim round the wax. Wax blocks shots too.' },
  trappedwind: { what: 'A pocket of trapped gas. Handle with care, and do not light it near anything you are fond of.', tip: 'A Fire hit or a Burning enemy touching it sets it off, once, setting Burning on everyone inside. Light it among enemies.' },
  ingrown: { what: 'An ingrown hair. It has curled the wrong way and taken it badly.', tip: 'Contact weapons take damage back from its spines. Use anything that is not Contact.' },
});

nfWire();
