'use strict';
// Spawn Prawn - weapon upgrade branches, batch 3 (spec: redesign docs/WEAPON_UPGRADES.md sections 9, 10, 11 and 20).
// Rent Free (v_soul_proj), Hot Mess (v_flame_pool), Family Ties (s_void) and Skill Issue (s_lard): each has three promises
// (Lv 3), two in-promise cards plus a wildcard per promise (Lv 6) and three masteries (Lv 10), registered with wupReg
// (weapons24.js). Cards add behaviour through wupOn(w, kind, fn) and read the slot's own state in w.w3.
// Rules every card follows (COMBAT_MATRIX 11.3, 11.5, 12.1 to 12.5):
//  - extra hits from a card are marked src.wupEcho so they never fire the hit hooks again; "echo" damage (12.1) is not used
//    where the card says build-up, so a card's bonus hit fills bars like any other hit;
//  - a collision hit is 40% of the weapon's hit size (W3_COL) to each body; a heavy hit sheds a Shell layer and fills Poise;
//  - pull follows 12.2 (elites 50%, bosses 25%, Squishy 50%); pets follow 12.3 (4 a weapon, 8 in all, 300 leash);
//  - every chain or repeat has a fixed depth (12.5), every list is capped.
// Hooks: none in shared files. All of it runs from the weapon-slot hooks in weapons24.js (stats, fire, hit, dmg, kill, tick).
// Simplifications are noted at each card (search "simplified").

const W3_COL = 0.4;                       // collision damage, as a share of the hit (matrix 11.5)
const W3_ERR = [];                        // exceptions swallowed by a card tick (tests read this; the game keeps running)
const w3S = w => w.w3 || (w.w3 = {});
const w3Big = e => !!(e.boss || e.elite || e.rival);
const w3Live = e => !!e && !e.dead && !e.phased && !e.egg;
const w3Foe = e => w3Live(e) && !e.charmed;
// A card function that must never take the frame loop down with it.
function w3On(w, kind, fn) {
  wupOn(w, kind, function () { try { return fn.apply(null, arguments); } catch (err) { if (W3_ERR.length < 20) W3_ERR.push(kind + ': ' + err.message + ' ' + String(err.stack).split('\n')[1]); return kind === 'dmg' ? 1 : undefined; } });
}
const w3Src = (w, extra) => Object.assign(weaponSrc(w), { wupEcho: true, noProc: true, knock: 0 }, extra || {});
function w3Hit(e, dmg, w, extra) { return w3Live(e) ? damageEnemy(e, dmg, w3Src(w, extra)) : 0; }
// A small blast: one hit on everything in r, bursts always land (no Evasion). onHit(e) runs for each enemy that took it.
function w3Blast(w, x, y, r, dmg, extra, color, onHit, skip) {
  const src = w3Src(w, Object.assign({ atk: 'burst', noCrit: true }, extra || {})), hit = [];
  const was = IN_AOE; IN_AOE = true;
  try { forNear(x, y, r, e => { if (e !== skip && w3Foe(e)) { hit.push(e); damageEnemy(e, dmg, src); } }); } finally { IN_AOE = was; }
  ring(x, y, r, color || w.def.color, 0.35, 4); fxParts('spark', x, y, color || w.def.color, 7, r * 3, 0.35, 2.5);
  if (onHit) for (const e of hit) onHit(e);
  return hit;
}
// Add to a build-up bar as if `raw` damage of that type had landed; returns the payoff that fired (or null).
function w3Bar(e, k, raw, w, src) {
  if (!w3Live(e)) return null;
  const cd = fightCd(e), size = COMBAT.barSize[k] * (k === 'acid' && cd.def === 'shell' && cd.layers > 0 ? cd.layers : 1) * COMBAT.rankBarK[cd.rank] * cd.maxHp;
  return w3BarFrac(e, k, raw / size, w, src, raw);
}
function w3BarFrac(e, k, frac, w, src, raw) {
  if (!w3Live(e)) return null;
  const cd = fightCd(e); cd.barQuietT[k] = 0; cd.bars[k] += frac;
  if (cd.bars[k] < 1) return null;
  cd.bars[k] = 0;
  if (k === 'fire' && w3Scene(w)) { w3SpinOut(w, e); (G.w3ign || (G.w3ign = [])).push(e); return 'ignite'; }
  if (k === 'soul' && w3Polter(w)) { w3Throw(w, e); return 'possess'; }
  const p = BAR_PAYOFF[k];
  fightPayoff(e, p, { raw: raw || cd.maxHp * 0.02 }, src || w3Src(w));
  if (p === 'ignite') (G.w3ign || (G.w3ign = [])).push(e);
  return p;
}
// Switched types (fitcheck.js lets Switched at Birth pick these): the weapon's own hits keep filling its home bar, and
// the full bar pays off as the new type. Hot Mess in Blood is a Crime Scene: a full Burn bar is a SPIN-OUT (the enemy
// slips, spins across the floor, cannot attack for 1 s and takes a hit), counted as an Ignite by the Ignite cards.
// Rent Free in Force is a Poltergeist: every 4th hit on one enemy, or a full Parasite bar from a card (Mass Possession: half
// a bar a hit), picks the enemy up and THROWS it at the nearest enemy (both take a collision hit when it lands).
const w3Scene = w => !!(w && w.def && w.def.elem === 'arcane' && w24Key(w) === 'v_flame_pool');
const w3Polter = w => !!(w && w.def && w.def.elem === 'phys' && w24Key(w) === 'v_soul_proj');
function w3TypeFeed(w) { // (each promise's Lv 3 card installs it; it reads the type at hit time)
  const st = w3S(w); if (st.feed) return; st.feed = 1;
  w3On(w, 'hit', (w, e, res, src) => {
    if ((!res.statusOk && !w3Polter(w)) || (src.wupEcho && !src.zoneHit)) return; // (Force hits carry no status, so the poltergeist feeds on every hit)
    if (w3Scene(w)) w3Bar(e, 'fire', res.raw, w, src);
    else if (w3Polter(w) && w3Foe(e)) { e.w3pg = (e.w3pg || 0) + 1; if (e.w3pg >= 4) { e.w3pg = 0; w3Throw(w, e); } else if (e.w3pg === 1) ring(e.x, e.y, e.r + 5, '#f1ecff', 0.3, 2); } // (every 4th hit on one enemy throws it)
  });
}
function w3SpinOut(w, e) {
  w3S(w).spun = (w3S(w).spun || 0) + 1;
  const a = Math.random() * Math.PI * 2;
  if (!e.boss) { e.kx += Math.cos(a) * 520; e.ky += Math.sin(a) * 520; }
  e.dazeT = Math.max(e.dazeT || 0, G.t + (e.boss ? 0.3 : 1));
  for (let i = 0; i < 3; i++) after(i * 0.1, () => { if (G && !e.dead) ring(e.x, e.y, e.r + 4 + i * 4, '#c9184a', 0.3, 3); });
  fxParts('drop', e.x, e.y, '#c9184a', 6, 120, 0.4, 3); floatText(e.x, e.y - e.r - 10, 'SPUN OUT', '#ff758f', 12, 0.7);
  w3Hit(e, w.s.dmg * 2, w, { atk: 'pool' });
}
function w3Throw(w, e) {
  w3S(w).thrown = (w3S(w).thrown || 0) + 1;
  const t = w3Near(e.x, e.y, 320, o => o !== e && w3Foe(o));
  floatText(e.x, e.y - e.r - 12, 'THROWN', '#f1ecff', 12, 0.7); ring(e.x, e.y, e.r + 8, '#f1ecff', 0.4, 3);
  if (!t || e.boss) { w3Hit(e, w.s.dmg * 2, w); return; }
  const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) || 1;
  if (!e.def.heavy && !e.def.spongy) { e.kx += dx / d * d * 3.9; e.ky += dy / d * d * 3.9; }
  if (typeof w2Line === 'function') w2Line(e.x, e.y, t.x, t.y, 2, '#f1ecff', 0.3);
  after(0.3, () => { if (!G) return; for (const q of [e, t]) w3Hit(q, w.s.dmg * W3_COL * 4, w, { atk: 'proj' }); if (!t.dead) { ring(t.x, t.y, t.r + 10, '#f1ecff', 0.4, 4); fxParts('spark', t.x, t.y, '#f1ecff', 6, 120, 0.3, 2); } });
}
// A heavy Force hit's side effects (11.3): knock off a Shell layer, a third of the Poise bar.
function w3Heavy(e, w) {
  if (!w3Foe(e)) return;
  const cd = fightCd(e);
  if (cd.layers > 0) { dropLayer(cd, { layersLost: 0 }); ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); }
  w3BarFrac(e, 'force', 0.34, w);
  if (!(e.w3heavyT > G.t)) { e.w3heavyT = G.t + 0.5; floatText(e.x, e.y - e.r - 8, 'HEAVY', w.def.color, 12, 0.5); }
}
// Pull (12.2): distance = strength / (radius / 12) a second, towards (x, y); never through a wall.
function w3Pull(e, x, y, str, R, dt) {
  if (!w3Live(e)) return;
  let f = str / (R / 12) * dt;
  if (e.boss) f *= 0.25; else if (e.elite) f *= 0.5;
  if (e.cd && e.cd.def === 'squishy') f *= 0.5;
  w3Move(e, x, y, f);
}
function w3Move(e, x, y, f) { // towards (x, y) by f (away if negative), never past it
  const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy) || 1, m = f > 0 ? Math.min(d, f) : f, nx = e.x + dx / d * m, ny = e.y + dy / d * m;
  if (G.lvl && lvSolidAt(nx, ny)) return;
  e.x = nx; e.y = ny;
}
// A wall at (x, y) for a body of radius r: { nx, ny } pointing out of it, or null. Solid terrain, level walls, test rects, the dish rim.
function w3Wall(x, y, r) {
  if (G.lvl && lvSolidAt(x, y)) { const px = lvSolidAt(x - 20, y), qx = lvSolidAt(x + 20, y), py = lvSolidAt(x, y - 20), qy = lvSolidAt(x, y + 20); const nx = (px ? 1 : 0) - (qx ? 1 : 0), ny = (py ? 1 : 0) - (qy ? 1 : 0), l = Math.hypot(nx, ny); return l ? { nx: nx / l, ny: ny / l } : { nx: 1, ny: 0 }; }
  if (G.m10walls) for (const q of G.m10walls) if (x + r >= q.x && x - r <= q.x + q.w && y + r >= q.y && y - r <= q.y + q.h) {
    const l = x - q.x, rr = q.x + q.w - x, t = y - q.y, b = q.y + q.h - y, m = Math.min(l, rr, t, b);
    return m === l ? { nx: -1, ny: 0 } : m === rr ? { nx: 1, ny: 0 } : m === t ? { nx: 0, ny: -1 } : { nx: 0, ny: 1 };
  }
  const c = G.terrain && tCell(x, y);
  if (c) for (const ob of c) { if (!ob.def.solid) continue; const dx = x - ob.x, dy = y - ob.y, d = Math.hypot(dx, dy) || 0.01; if (d < ob.r + r + 2) return { nx: dx / d, ny: dy / d }; }
  const o = Math.hypot(x, y); if (G.core && o > CORE.arena - r - 12) return { nx: -x / o, ny: -y / o };
  return null;
}
// Two bodies collide (matrix 11.5): each takes 40% of the hit. `base` is the weapon's hit size.
function w3Collide(w, a, b, base, heavy) {
  const d = base * W3_COL;
  w3Hit(a, d, w, { atk: 'burst' }); w3Hit(b, d, w, { atk: 'burst' });
  const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
  fxParts('spark', x, y, '#ffffff', 4, 140, 0.25, 2.5); ring(x, y, 12, w.def.color, 0.2, 3);
  if (heavy) { w3Heavy(a, w); w3Heavy(b, w); }
}
// Flung bodies (Family Ties: Let Go, Wormhole): a list of { e, w, until, hit, depth, base, heavy } run by w3FlyTick.
function w3Fling(e, w, vx, vy, depth, base, hit) {
  if (!w3Live(e) || e.boss || e.rival) return;
  const F = G.w3f || (G.w3f = []);
  e.kx += vx; e.ky += vy;
  if (F.length < 60 && !F.some(f => f.e === e)) F.push({ e, w, until: G.t + 0.9, hit: hit || new Set([e]), depth, base });
}
function w3FlyTick() {
  const F = G.w3f; if (!F || !F.length || G.w3fN === G.frameN) return;
  G.w3fN = G.frameN;
  for (let i = F.length - 1; i >= 0; i--) {
    const f = F[i], e = f.e;
    if (!w3Live(e) || G.t > f.until || Math.hypot(e.kx, e.ky) < 70) { F.splice(i, 1); continue; }
    forNear(e.x, e.y, e.r + 14, o => {
      if (o === e || !w3Foe(o) || f.hit.has(o)) return;
      f.hit.add(o);
      w3Collide(f.w, e, o, f.base, false);
      if (!o.boss && !o.rival) { o.kx += e.kx * 0.6; o.ky += e.ky * 0.6; if (f.depth > 1) w3Fling(o, f.w, e.kx * 0.2, e.ky * 0.2, f.depth - 1, f.base, f.hit); }
    });
  }
}
// Pets (12.3) of this batch: at most 4 a weapon and 8 in all (summoned pets from modifiers.js count too).
function w3PetCount() { let n = (G.m10 && G.m10.pets ? G.m10.pets.length : 0); for (const w of G.weapons) if (w && w.w3 && w.w3.pets) n += w.w3.pets.length; return n; }
function w3PetTick(w, dt, mk) { // mk(): the pet's bite; pets swim to the nearest enemy within the leash, else stay by you
  const st = w3S(w), p = G.player, s = w.s;
  st.pets = (st.pets || []).filter(q => q.until > G.t);
  for (const q of st.pets) {
    q.cd -= dt;
    let t = null, bd = 420 * 420;
    for (const e of G.enemies) { if (!w3Foe(e) || e.egg) continue; const d2 = (e.x - q.x) ** 2 + (e.y - q.y) ** 2; if (d2 < bd && Math.hypot(e.x - p.x, e.y - p.y) < 300) { bd = d2; t = e; } }
    const tx = t ? t.x : p.x + Math.cos(G.realT * 2 + q.seed) * 46, ty = t ? t.y : p.y + Math.sin(G.realT * 2 + q.seed) * 46;
    const away = Math.hypot(q.x - p.x, q.y - p.y) > 300, gx = away ? p.x : tx, gy = away ? p.y : ty, dx = gx - q.x, dy = gy - q.y, d = Math.hypot(dx, dy) || 1;
    q.x += dx / d * Math.min(d, 190 * dt); q.y += dy / d * Math.min(d, 190 * dt);
    if (t && !away && q.cd <= 0 && Math.hypot(t.x - q.x, t.y - q.y) < t.r + 12) { q.cd = 0.5; mk(q, t); }
    if (Math.random() < dt * 14) { spawnPart(q.x, q.y, w.def.color, 1, 20, 0.35, 3.5); }
    if (Math.random() < dt * 2.5) ring(q.x, q.y, 8, w.def.color, 0.3, 2);
  }
}
function w3PetAdd(w, x, y, life) {
  const st = w3S(w); st.pets = st.pets || [];
  if (st.pets.length >= 4 || w3PetCount() >= 8) return null;
  const q = { x, y, until: G.t + life, cd: 0.2, seed: Math.random() * 6 }; st.pets.push(q);
  ring(x, y, 22, w.def.color, 0.5, 3); fxParts('smoke', x, y, w.def.color, 6, 40, 0.8, 5);
  return q;
}
const w3Near = (x, y, R, pred) => { let b = null, bd = R * R; for (const e of G.enemies) { if (!w3Foe(e) || (pred && !pred(e))) continue; const d2 = (e.x - x) ** 2 + (e.y - y) ** 2; if (d2 < bd) { bd = d2; b = e; } } return b; };

// ================================================================ Rent Free (Parasite, Projectile)
// Each shot gets a small record (pr.w3) on first sight: where it started, its damage before any card changed it, how many
// enemies it has hit (q.n) and how many this frame (q.d), and the furthest point it reached.
function w3RfScan(w) {
  const st = w3S(w); if (st.scanN === G.frameN) return st.shots;
  st.scanN = G.frameN; const out = st.shots = [];
  for (const pr of G.proj) {
    if (pr.w !== w || pr.dead || pr.lob || pr.mine) continue;
    let q = pr.w3;
    if (!q) { q = pr.w3 = { x0: pr.x, y0: pr.y, a0: Math.atan2(pr.vy, pr.vx), n: 0, base: pr.dmg, far: 0, fx: pr.x, fy: pr.y, re: !!pr.w3again, fresh: true }; }
    else q.fresh = false;
    const hits = pr.hits ? pr.hits.length : 0;
    q.d = hits > q.n ? hits - q.n : 0; q.n = hits;
    const dd = Math.hypot(pr.x - q.x0, pr.y - q.y0); if (dd > q.far) { q.far = dd; q.fx = pr.x; q.fy = pr.y; }
    out.push(pr);
  }
  return out;
}
function w3Wisp(w, pr, d) { // a faint wisp left in every enemy the ghost passed through
  const ids = pr.hits ? pr.hits.slice(-d) : [];
  forNear(pr.x, pr.y, 90, e => { if (ids.includes(e.id)) { ring(e.x, e.y, e.r + 3, w.def.color, 0.7, 2); fxParts('smoke', e.x, e.y, w.def.color, 4, 25, 0.9, 4); } });
}
const w3RfHit = (pr, d, fn) => { const ids = pr.hits ? pr.hits.slice(-d) : []; forNear(pr.x, pr.y, 90, e => { if (ids.includes(e.id) && w3Live(e)) fn(e); }); };

// ---- A. Ghost Through
function rfGhost(w, dt) {
  for (const pr of w3RfScan(w)) {
    const q = pr.w3; if (q.polt) continue;
    if (q.fresh) pr.dmg = q.base * 0.85;                       // costs: -15% to the first target
    if (q.d > 0) { pr.dmg = q.base * Math.pow(0.8, q.n); w3Wisp(w, pr, q.d); } // 20% less for each one after
  }
}
function rfColdSpot(w, dt) {
  for (const pr of w3RfScan(w)) if (pr.w3.d > 0) w3RfHit(pr, pr.w3.d, e => {
    w3Bar(e, 'soul', pr.w3.base * 0.8, w); fxParts('smoke', e.x, e.y - 4, '#d6f6ff', 5, 30, 0.7, 4); floatText(e.x, e.y - e.r - 6, 'COLD', '#d6f6ff', 10, 0.5);
  });
}
function rfSecond(w, dt) {
  for (const pr of w3RfScan(w)) {
    const q = pr.w3;
    if (!q.reDone && !q.polt && !q.re && pr.life > 0 && pr.life <= 0.045) {  // full range: fade, and re-form at the start of the path
      q.reDone = true; ring(pr.x, pr.y, 16, w.def.color, 0.5, 3); fxParts('smoke', pr.x, pr.y, w.def.color, 6, 40, 0.7, 4);
      const c = spawnProj(w, q.x0, q.y0, q.a0, weaponSrc(w), { w3again: true });
      if (c) { ring(q.x0, q.y0, 18, w.def.color, 0.5, 3); floatText(q.x0, q.y0 - 20, 'AGAIN', w.def.color, 11, 0.5); }
    }
  }
}
function rfNineTenths(w, dt) { // a Possessed enemy fires Rent Free shots at its mates
  const st = w3S(w), s = w.s; let inFlight = 0;
  for (const pr of G.proj) if (pr.w === w && !pr.dead && pr.w3from) inFlight++;
  for (const e of G.enemies) {
    if (!w3Live(e) || !e.charmed || e.zombie) continue;
    e.w3rf = (e.w3rf == null ? 0.35 : e.w3rf) - dt;
    if (e.w3rf > 0 || inFlight >= 8) continue;
    const t = w3Near(e.x, e.y, 420, o => o !== e);
    e.w3rf = 1.1; if (!t) continue;
    ring(e.x, e.y, e.r + 6, w.def.color, 0.3, 3);
    spawnProj(w, e.x, e.y, Math.atan2(t.y - e.y, t.x - e.x), weaponSrc(w), { w3from: e }); inFlight++;
    if ((st.nt = (st.nt || 0) + 1) % 3 === 1) floatText(e.x, e.y - e.r - 10, 'SQUATTERS', w.def.color, 10, 0.6);
  }
}

// ---- B. Return to Sender
function rfReturnTrail(w, dt) {
  for (const pr of w3RfScan(w)) if (pr.back && Math.random() < dt * 20) fxParts('smoke', pr.x, pr.y, w.def.color, 1, 12, 0.6, 5); // a translucent ghost reversing along its trail
}
function rfTug(w, dt) {
  const p = G.player;
  for (const pr of w3RfScan(w)) if (pr.back) forNear(pr.x, pr.y, 70, e => { if (w3Foe(e)) { w3Pull(e, p.x, p.y, 130, 70, dt); } });
}
function rfRide(w, dt) {
  const st = w3S(w), R = st.rides = (st.rides || []).filter(r => r.pr && !r.pr.dead && w3Live(r.e) && r.e.charmed && r.until > G.t);
  for (const pr of w3RfScan(w)) {
    if (!pr.back || R.length >= 4 || R.some(r => r.pr === pr)) continue;
    const e = w3Near(pr.x, pr.y, 36, o => o.charmed && !o.zombie && !R.some(r => r.e === o));
    if (e) { R.push({ pr, e, until: G.t + 1 }); floatText(e.x, e.y - e.r - 8, 'HITCHING', w.def.color, 10, 0.6); }
  }
  for (const r of R) {
    r.e.x = r.pr.x; r.e.y = r.pr.y; r.e.kx = r.e.ky = 0;
    forNear(r.e.x, r.e.y, r.e.r + 10, o => { if (o === r.e || !w3Foe(o)) return; const k = o.id + ':' + r.e.id; if ((st.rideT = st.rideT || {})[k] > G.t) return; st.rideT[k] = G.t + 0.6; w3Collide(w, r.e, o, w.s.dmg * 1.2); });
  }
}
function rfHaunted(w, dt) { // ghosts that miss sink into the floor and pop up under the next enemy that swims over them
  const st = w3S(w), H = st.haunts = (st.haunts || []).filter(h => h.until > G.t);
  for (const pr of w3RfScan(w)) {
    const q = pr.w3, near = pr.back && Math.hypot(pr.x - G.player.x, pr.y - G.player.y) < 44;
    if (!q.sunk && q.n === 0 && !q.polt && ((pr.life > 0 && pr.life <= 0.045) || near)) {
      q.sunk = true;
      if (H.length < 6) { H.push({ x: q.fx, y: q.fy, until: G.t + 8 }); ring(q.fx, q.fy, 16, w.def.color, 0.6, 3); floatText(q.fx, q.fy - 14, 'BOO-BY TRAP', w.def.color, 10, 0.7); }
    }
  }
  for (let i = H.length - 1; i >= 0; i--) {
    const h = H[i];
    if (Math.random() < dt * 3) ring(h.x, h.y, 9, w.def.color, 0.45, 2);
    const e = w3Near(h.x, h.y, 26);
    if (e) { H.splice(i, 1); ring(e.x, e.y, e.r + 12, w.def.color, 0.4, 4); w3Hit(e, w.s.dmg, w, { atk: 'proj', noCrit: true }); fxParts('smoke', e.x, e.y, w.def.color, 6, 60, 0.6, 5); }
  }
}

// ---- C. Unfinished Business
function rfMark(w, e, depth) {
  const st = w3S(w), M = st.marks || (st.marks = []);
  if (!w3Foe(e) || e.w3hm > G.t) { if (e.w3hm > G.t) e.w3hm = G.t + 3; return; }
  e.w3hm = G.t + 3; e.w3hd = depth || 0;
  if (!M.includes(e) && M.length < 60) M.push(e);
}
function rfSpirit(w, e) { // a marked enemy died: its spirit bursts out (radius 70, 60% damage, Parasite build-up)
  const st = w3S(w), s = w.s, U = w.up || {}, d = e.w3hd || 0;
  if (st.pet && (e.elite || e.boss || e.r >= 24)) { w3PetAdd(w, e.x, e.y, 4) && floatText(e.x, e.y - 16, 'FRIENDLY GHOST', w.def.color, 11, 0.9); return; }
  floatText(e.x, e.y - e.r - 4, 'UNFINISHED', w.def.color, 11, 0.7); fxParts('smoke', e.x, e.y, '#e8e0ff', 8, 70, 0.9, 6);
  w3Blast(w, e.x, e.y, 70, s.dmg * 0.6, { atk: 'burst' }, w.def.color, o => { if (st.spread && d < 1 && !o.dead) rfMark(w, o, d + 1); }, e);
}
function rfUnfinished(w, dt) {
  const st = w3S(w), M = st.marks || (st.marks = []);
  for (let i = M.length - 1; i >= 0; i--) {
    const e = M[i];
    if (e.dead) { M.splice(i, 1); if (!e.w3burst) { e.w3burst = true; rfSpirit(w, e); } continue; }
    if (!(e.w3hm > G.t)) { M.splice(i, 1); continue; }
    if (Math.random() < dt * 16) { const a = G.realT * 4 + e.id; spawnPart(e.x + Math.cos(a) * (e.r + 6), e.y + Math.sin(a) * (e.r + 6), '#e8e0ff', 1, 6, 0.3, 3); } // a pale wisp orbiting it
  }
}
function rfSeance(w, dt) {
  const st = w3S(w), R = st.recent || (st.recent = []);
  for (const e of G.enemies) if (e.dead && !e.w3seen && !e.egg) { e.w3seen = true; R.push({ x: e.x, y: e.y }); if (R.length > 5) R.shift(); }
  st.seT = (st.seT == null ? 8 : st.seT) - dt;
  if (st.seT <= 0 && R.length) { st.seT = 8; st.ghosts = R.map(r => ({ x: r.x, y: r.y, until: G.t + 1 })); floatText(G.player.x, G.player.y - 40, 'SEANCE', w.def.color, 13, 0.9); }
  const gs = st.ghosts = (st.ghosts || []).filter(g => g.until > G.t);
  for (const g of gs) {
    if (Math.random() < dt * 8) { ring(g.x, g.y, 14, w.def.color, 0.25, 3); fxParts('smoke', g.x, g.y, '#e8e0ff', 1, 20, 0.5, 5); }
    for (const b of G.ebul) {
      if (b.dead) continue;
      const dx = g.x - b.x, dy = g.y - b.y, d = Math.hypot(dx, dy);
      if (d > 230) continue;
      if (d < 20) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 3, 50, 0.3, 2); continue; }
      const sp = Math.hypot(b.vx, b.vy) || 1, ca = Math.atan2(b.vy, b.vx), na = ca + clamp(angDiff(Math.atan2(dy, dx), ca), -4 * dt, 4 * dt);
      b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
    }
  }
}

// ---- Lv 10
function rfMassPossession(w, dt) {
  for (const e of G.enemies) {
    if (!w3Live(e)) continue;
    if (e.charmed && !e.zombie) { if (!e.w3pd) { e.w3pd = 1; e.charmT *= 2; floatText(e.x, e.y - e.r - 20, 'x2 HAUNT', w.def.color, 11, 0.8); } }
    else e.w3pd = 0;
  }
}
function rfPoltergeist(w, dt) {
  for (const pr of w3RfScan(w)) {
    const q = pr.w3;
    if (q.fresh) { q.polt = true; pr.life = pr.max = 6; pr.pierce = 99; pr.boomerang = 0; pr.back = false; pr.mRet = 0; pr.mRetNP = 0; q.wt = 0; q.wa = 0; pr.dmg = q.base; }
    if (pr.hits && pr.hits.length >= 6) { pr.dead = true; ring(pr.x, pr.y, 16, w.def.color, 0.4, 3); continue; }
    q.wt -= dt; if (q.wt <= 0) { q.wt = 0.35; q.wa = rand(-1.4, 1.4); }
    let turn = q.wa;
    const t = w3Near(pr.x, pr.y, 300, e => !(pr.hits && pr.hits.includes(e.id)));
    const ca = Math.atan2(pr.vy, pr.vx);
    if (t) turn = clamp(angDiff(Math.atan2(t.y - pr.y, t.x - pr.x), ca), -2.6, 2.6) * 0.9 + q.wa * 0.3;
    const na = ca + turn * dt; pr.vx = Math.cos(na) * pr.speed; pr.vy = Math.sin(na) * pr.speed;
    if (Math.random() < dt * 14) fxParts('smoke', pr.x, pr.y, w.def.color, 1, 14, 0.6, 5);
  }
}
function rfGhostArmy(w, dt) {
  const st = w3S(w);
  w3PetTick(w, dt, () => {});                      // (their own movement; the Rent Free shots below are their attack)
  for (const q of st.pets || []) {
    q.fire = (q.fire == null ? 0.3 : q.fire) - dt;
    if (q.fire > 0) continue;
    const t = w3Near(q.x, q.y, 380); if (!t) { q.fire = 0.2; continue; }
    q.fire = 0.9; spawnProj(w, q.x, q.y, Math.atan2(t.y - q.y, t.x - q.x), weaponSrc(w), { w3from: q });
  }
}

wupReg('v_soul_proj', {
  A: { name: 'Ghost Through', tag: 'pass through the crowd', costs: '-15% damage to the first target.', shows: 'The ghost passes through bodies, leaving a faint wisp in each.', modes: 'KITE lines pursuers up',
    lv3: { desc: 'The ghost passes through up to 4 enemies, a little weaker after each one. First hit 15% weaker.', apply(w) { w3TypeFeed(w); w3On(w, 'stats', (w, s) => { s.pierce = Math.max(s.pierce || 0, 3); }); w3On(w, 'tick', rfGhost); } },
    lv6: [
      { name: 'Cold Spot', desc: 'Every enemy the ghost passes through also gains Holy/Damned build-up, so a long line fills several bars at once.', apply(w) { w3On(w, 'tick', rfColdSpot); } },
      { name: 'Second Sighting', desc: 'At full range the ghost fades and re-forms where it started, then flies the same line again.', apply(w) { w3On(w, 'tick', rfSecond); } }],
    wild: { name: 'Nine-Tenths of the Law', desc: 'A Possessed enemy fires your ghost shots at its own mates.', apply(w) { w3On(w, 'tick', rfNineTenths); } } },
  B: { name: 'Revolving Door', tag: 'twice the haunting', costs: 'The shot is 30% slower.', shows: 'A translucent ghost reversing along its trail.', modes: 'ORBIT keeps enemies on both legs of the path',
    lv3: { desc: 'After its hit the ghost turns and retraces its path back to you, hitting again. Shots are 30% slower.', apply(w) { w3TypeFeed(w); modAdd(w, 'returning'); w3On(w, 'stats', (w, s) => { s.speed *= 0.7; }); w3On(w, 'tick', rfReturnTrail); } },
    lv6: [
      { name: 'Ghostly Tug', desc: 'On the way back the ghost drags each enemy it passes a little towards you.', apply(w) { w3On(w, 'tick', rfTug); } },
      { name: 'Hitching a Ride', desc: 'A Possessed enemy the ghost passes on the way back is dragged along for a second, bumping its mates.', apply(w) { w3On(w, 'tick', rfRide); } }],
    wild: { name: 'Haunted House', desc: 'Ghosts that miss sink into the floor and pop up under the next enemy that swims over them.', apply(w) { w3On(w, 'tick', rfHaunted); } } },
  C: { name: 'Unfinished Business', tag: 'they come back for their friends', costs: '-20% direct damage.', shows: 'A pale wisp orbits marked enemies, then a ghostly puff on death.', modes: 'HUNT tags a big target; COLLECT enjoys the bursts',
    lv3: { desc: 'An enemy you hit is haunted for a few seconds; if it dies, its spirit bursts on its mates. Direct hits 20% weaker.',
      apply(w) { w3TypeFeed(w);
        w3On(w, 'stats', (w, s) => { s.dmg *= 0.8; });
        w3On(w, 'hit', (w, e, res, src) => { if (!src.wupEcho && !e.dead && e.hp - res.toHp > 0) rfMark(w, e, 0); });
        w3On(w, 'tick', rfUnfinished);
      } },
    lv6: [
      { name: 'Spreading Spooks', desc: 'The spirit\'s burst haunts the enemies it hits too, for two generations, then it stops.', apply(w) { w3S(w).spread = true; } },
      { name: 'Friendly Ghost', desc: 'The spirit of an elite or big enemy fights for you for a few seconds instead of bursting.', apply(w) { w3S(w).pet = true; w3On(w, 'tick', (w, dt) => w3PetTick(w, dt, (q, t) => { w3Hit(t, w.s.dmg * 0.9, w, { atk: 'contact' }); ring(t.x, t.y, t.r + 4, w.def.color, 0.25, 3); })); } }],
    wild: { name: 'Seance', desc: 'Every few seconds your last few kills flicker back as ghosts that draw enemy fire.', apply(w) { w3On(w, 'tick', rfSeance); } } },
  lv10: [
    { name: 'Mass Possession', best: 'AC', desc: 'Every hit fills half a Holy/Damned bar, and Possession lasts twice as long.', apply(w) { w3On(w, 'hit', (w, e, res, src) => { if (!src.wupEcho) w3BarFrac(e, 'soul', 0.5, w); }); w3On(w, 'tick', rfMassPossession); } },
    { name: 'Poltergeist', best: 'AB', desc: 'Ghosts never stop at a target: they wander for a while, hitting up to 6 things they touch.', apply(w) { w3On(w, 'tick', rfPoltergeist); } },
    { name: 'Ghost Army', best: 'C', desc: 'Each kill raises a ghost that fires ghost shots for a few seconds.', apply(w) { w3On(w, 'kill', (w, e) => { const q = w3PetAdd(w, e.x, e.y, 5); if (q) floatText(e.x, e.y - 14, 'RECRUITED', w.def.color, 11, 0.8); }); w3On(w, 'tick', rfGhostArmy); } }],
});

// ================================================================ Hot Mess (Fire, Pool)
// A patch (a zone made by this weapon) is adopted on first sight: z.w3 holds its base radius, damage, who is inside it and
// for how long. Footprints carry src.w3fp so they are not adopted as ordinary patches.
function w3HmScan(w) {
  const st = w3S(w); if (st.scanN === G.frameN) return st.patches;
  st.scanN = G.frameN; const out = st.patches = [];
  for (const z of G.zones) {
    if (!z.src || z.src.w !== w || z.src.w3fp || z.life <= 0) continue;
    if (!z.w3) {
      z.w3 = { r0: z.r, dps0: z.dps, born: G.t, t: new Map(), inside: [], fresh: true, in0: new Set() };
      z.src = Object.assign({}, z.src, { w3z: z });
      forNear(z.x, z.y, z.r, e => { z.w3.in0.add(e.id); });
    } else z.w3.fresh = false;
    z.w3.inside.length = 0;
    forNear(z.x, z.y, z.r, e => {
      if (!w3Foe(e)) return;
      const r = z.w3.t.get(e.id) || { t0: G.t, last: G.t }; r.last = G.t; z.w3.t.set(e.id, r); z.w3.inside.push(e); e.w3inT = G.t; e.w3inZ = z;
    });
    for (const [id, r] of z.w3.t) if (r.last < G.t - 0.35) z.w3.t.delete(id);
    out.push(z);
  }
  // ignition watch (a Burn bar that empties in one frame has paid off)
  const ign = st.ign = [];
  for (const e of G.enemies) {
    if (!e.cd || e.dead) continue;
    const b = e.cd.bars.fire;
    if (e.w3fb > 0.45 && b < e.w3fb - 0.4 && !(e.w3igT > G.t - 0.1)) ign.push(e);
    e.w3fb = b;
  }
  if (G.w3ign && G.w3ign.length) { for (const e of G.w3ign) if (!ign.includes(e)) ign.push(e); G.w3ign.length = 0; }
  for (const e of ign) e.w3igT = G.t;
  return out;
}
const w3HmPatch = (w, x, y, r, life, dpsK, flags) => {
  if (G.zones.length > 200) return null;
  const z = { x, y, r, life, max: life, dps: w.s.dmg * 0.9 * dpsK, elem: w.def.elem, pull: 0, color: w.def.color, tick: 0, src: weaponSrc(w) };
  Object.assign(z, flags || {}); G.zones.push(z); return z;
};
const w3Embers = (w, e, n) => fxParts('ember', e.x + rand(-e.r, e.r) * 0.6, e.y, w.def.color, n, 50, 0.6, 3, -Math.PI / 2, 0.5);

// ---- A. Hotter Mess
function hmHotter(w, dt) { w3HmScan(w); }
function hmHotterHit(w, e, res, src) {
  const z = src.w3z; if (!src.zoneHit || !z || !z.w3) return;
  const r = z.w3.t.get(e.id); if (!r) return;
  const k = 1 + Math.min(2, G.t - r.t0);                    // up to 3x after 2 s
  if (k > 1.05) { w3Bar(e, 'fire', res.raw * (k - 1), w, src); if (Math.random() < 0.4) w3Embers(w, e, Math.ceil(k)); }
  if (k >= 2.95 && !(e.w3x3 > G.t)) { e.w3x3 = G.t + 1.2; floatText(e.x, e.y - e.r - 8, 'x3', w.def.color, 11, 0.6); }
}
function hmFlare(w, dt) {
  for (const z of w3HmScan(w)) {
    if (z.w3.flare > G.t) z.dps = z.w3.dps0 * 1.5; else if (z.w3.flare) { z.w3.flare = 0; z.dps = z.w3.dps0; }
  }
  for (const e of w3S(w).ign) {
    const z = e.w3inT > G.t - 0.4 && e.w3inZ;
    if (z && z.w3 && z.life > 0) { z.w3.flare = G.t + 0.5; G.fx.push({ type: 'flash', x: z.x, y: z.y, r: z.r, color: w.def.color, life: 0.4, max: 0.4 }); ring(z.x, z.y, z.r, '#ffffff', 0.4, 5); floatText(z.x, z.y - z.r, 'FLARE', w.def.color, 12, 0.6); }
  }
}
function hmHotTub(w, dt) {
  for (const z of w3HmScan(w)) {
    forNear(z.x, z.y, z.r * 1.35, e => { if (w3Foe(e)) { const d = Math.hypot(e.x - z.x, e.y - z.y); if (d > z.r * 0.7 && d > 4) w3Pull(e, z.x, z.y, 170, z.r, dt); } });
    if (Math.random() < dt * 4) ring(z.x, z.y, z.r * 1.3, w.def.color, 0.5, 2);
  }
}
function hmFireDrill(w, dt) {
  for (const z of w3HmScan(w)) {
    const Z = z.w3;
    forNear(z.x, z.y, z.r + 30, e => {
      if (!w3Foe(e) || e.boss || Z.in0.has(e.id)) return;
      const dx = e.x - z.x, dy = e.y - z.y, d = Math.hypot(dx, dy) || 1, edge = z.r + e.r * 0.3 + 2;
      if (d < edge) { e.x = z.x + dx / d * edge; e.y = z.y + dy / d * edge; e.kx = e.ky = 0; if (!(e.w3fdT > G.t)) { e.w3fdT = G.t + 0.4; fxParts('spark', e.x, e.y, w.def.color, 3, 90, 0.3, 2.5); } }
    });
    if (Math.random() < dt * 14) { const a = Math.random() * TAU; fxParts('ember', z.x + Math.cos(a) * z.r, z.y + Math.sin(a) * z.r, w.def.color, 1, 40, 0.6, 3, -Math.PI / 2, 0.4); }
  }
}
function hmFireDrillHit(w, e, res, src) { const z = src.w3z; if (src.zoneHit && z && z.w3 && z.w3.in0.has(e.id)) w3Bar(e, 'fire', res.raw, w, src); } // already inside: burns twice as fast

// ---- B. Spreading Rumours
function hmRumours(w, dt) {
  const st = w3S(w), K = st.hot ? 1 : 0.35;
  w3HmScan(w);
  for (const e of G.enemies) {
    if (!w3Foe(e) || !e.cd) continue;
    const inside = e.w3inT > G.t - 0.2;
    if (inside) e.w3wasIn = G.t;
    else if (e.w3wasIn > G.t - 0.3 && (e.cd.burnT > 0 || w3Scene(w)) && !(e.w3tr > G.t)) { e.w3tr = G.t + 1.5; e.w3lx = e.x; e.w3ly = e.y; floatText(e.x, e.y - e.r - 8, w3Scene(w) ? 'BLOODY FEET' : 'RUMOUR', w.def.color, 10, 0.6); } // (Blood: anything that walked through leaves prints)
    if (e.w3tr > G.t && Math.hypot(e.x - e.w3lx, e.y - e.w3ly) > 20) {
      e.w3lx = e.x; e.w3ly = e.y;
      let n = 0; for (const z of G.zones) if (z.src && z.src.w3fp && z.life > 0 && z.src.w === w) n++;
      if (n < 36 && G.zones.length < 200) G.zones.push({ x: e.x, y: e.y, r: 16, life: 1.5, max: 1.5, dps: w.s.dmg * 0.9 * K, elem: w.def.elem, pull: 0, color: w.def.color, tick: 0, src: Object.assign(weaponSrc(w), { w3fp: 1 }) });
    }
  }
  for (const e of st.ign) if (st.bridge && e.w3tr > G.t && !e.w3sc) { e.w3sc = true; const z = w3HmPatch(w, e.x, e.y, w.s.area * 0.6, w.s.dur * 0.6, 0.8); if (z) { floatText(e.x, e.y - e.r - 8, 'NEW PATCH', w.def.color, 11, 0.7); ring(e.x, e.y, z.r, w.def.color, 0.4, 4); } }
}
function hmToasty(w, dt) {
  const p = G.player;
  for (const z of w3HmScan(w)) if (Math.hypot(z.x - p.x, z.y - p.y) < z.r) {
    healPlayer(G.P.maxHp * 0.01 * dt, true);
    const st = w3S(w); st.toastT = (st.toastT || 0) - dt; if (st.toastT <= 0) { st.toastT = 0.6; fxParts('plus', p.x, p.y - 8, '#ffb35c', 2, 40, 0.8, 6); }
  }
}

// ---- C. Flash in the Pan
function hmErupt(w, z, K) {
  const Z = z.w3 || {}; if (Z.done) return; Z.done = true;
  const R = Math.max(z.r, Z.r0 || z.r) * (K || 1);
  w3Blast(w, z.x, z.y, R, w.s.dmg * (K > 1 ? 3 : 0.6), { atk: 'burst' }, w.def.color, e => w3BarFrac(e, 'fire', 0.5, w));
  G.fx.push({ type: 'flash', x: z.x, y: z.y, r: R, color: w.def.color, life: 0.35, max: 0.35 }); floatText(z.x, z.y - 14, K > 1 ? 'KABOOM' : 'FLASH', w.def.color, 13, 0.7);
}
function hmFlash(w, dt) {
  const st = w3S(w);
  for (const z of w3HmScan(w)) {
    if (z.w3.fresh) {
      if (st.keg) { z.dps = 0; z.quiet = true; z.life = z.max = 1; }
      z.onEnd = zz => hmErupt(w, zz, st.keg ? 2 : 1);
    }
    if (z.life < 0.8) { const k = 1 - z.life / 0.8; z.r = z.w3.r0 * (1 + 0.3 * k); if (Math.random() < dt * 12) ring(z.x, z.y, z.r, '#ffffff', 0.2, 3); } // swells and glows
    if (st.hair && !z.w3.done && z.life > 0.2 && z.w3.inside.length >= 4) z.life = 0.05;
  }
}
function hmPotato(w, dt) {
  for (const z of w3HmScan(w)) {
    z.w3.pot = (z.w3.pot == null ? 0.8 : z.w3.pot) - dt;
    if (z.w3.pot > 0) continue;
    z.w3.pot = 2;
    const e = w3Near(z.x, z.y, 480, o => Math.hypot(o.x - z.x, o.y - z.y) > z.r);
    if (e) { ring(z.x, z.y, z.r, w.def.color, 0.4, 4); z.x = e.x; z.y = e.y; ring(z.x, z.y, z.r, '#ffffff', 0.4, 4); floatText(z.x, z.y - 14, 'HOT POTATO', w.def.color, 11, 0.6); }
  }
}

// ---- Lv 10
function hmHellmouth(w, dt) {
  const st = w3S(w);
  if (st.hell && st.hell.life > 0) {
    const z = st.hell, t = acquire('cluster', 700, z.x, z.y);
    if (t) { const dx = t.x - z.x, dy = t.y - z.y, d = Math.hypot(dx, dy) || 1, m = Math.min(d, 45 * dt); z.x += dx / d * m; z.y += dy / d * m; }
    if (Math.random() < dt * 10) { const a = Math.random() * TAU; fxParts('ember', z.x + Math.cos(a) * z.r * 0.8, z.y + Math.sin(a) * z.r * 0.8, w.def.color, 2, 60, 0.7, 4, -Math.PI / 2, 0.5); }
  }
  w3HmScan(w);
}
function hmHellFire(w, target) {
  const st = w3S(w);
  if (st.hell && st.hell.life > 0 && G.zones.includes(st.hell)) return true;
  if (G.zones.length > 200) return true;
  const z = { x: target.x, y: target.y, r: 200, life: 10, max: 10, dps: w.s.dmg * 1.2, elem: w.def.elem, pull: 0, color: w.def.color, tick: 0, src: weaponSrc(w) };
  G.zones.push(z); st.hell = z; ring(z.x, z.y, 200, w.def.color, 0.6, 6); floatText(z.x, z.y - 30, 'HELLMOUTH', w.def.color, 16, 1);
  return true;
}
function hmSpontaneous(w, dt) {
  w3HmScan(w);
  for (const e of w3S(w).ign) if (!e.w3sc && !e.dead) { e.w3sc = true; const z = w3HmPatch(w, e.x, e.y, w.s.area * 0.8, w.s.dur, 1); if (z) { ring(e.x, e.y, z.r, w.def.color, 0.4, 4); floatText(e.x, e.y - e.r - 8, 'COMBUSTED', w.def.color, 11, 0.7); } }
}
function hmScorched(w, dt) {
  const P = w3HmScan(w);
  for (const z of P) if (z.w3.inside.length) { z.life = Math.max(z.life, 0.4); z.w3.hold = (z.w3.hold || 0) + dt; if (z.w3.hold > 1) { z.w3.hold = 0; ring(z.x, z.y, z.r, w.def.color, 0.5, 3); } }
  if (P.length > 6) { P.sort((a, b) => a.w3.born - b.w3.born); for (let i = 0; i < P.length - 6; i++) { P[i].life = 0.001; P[i].w3.inside.length = 0; } }
}

wupReg('v_flame_pool', {
  A: { name: 'Hotter Mess', tag: "don't stand in it", costs: 'The patch is 20% smaller.', shows: 'The flames climb taller the longer someone stands in them.', modes: 'HOLD and NEST make enemies walk into it',
    lv3: { desc: 'The longer an enemy stays in the patch, the faster its Burn bar fills. Patch 20% smaller.', apply(w) { w3TypeFeed(w); w3On(w, 'stats', (w, s) => { s.area *= 0.8; }); w3On(w, 'tick', hmHotter); w3On(w, 'hit', hmHotterHit); } },
    lv6: [
      { name: 'Backdraft', desc: 'An enemy that Ignites in the patch makes the whole patch flare up briefly for extra damage.', apply(w) { w3On(w, 'tick', hmFlare); } },
      { name: 'Hot Tub', desc: 'The patch drags enemies standing at its edge back in.', apply(w) { w3On(w, 'tick', hmHotTub); } }],
    wild: { name: 'Fire Drill', desc: 'Enemies refuse to enter the patch, so it works as a wall; anything already inside burns twice as fast.', apply(w) { w3On(w, 'tick', hmFireDrill); w3On(w, 'hit', hmFireDrillHit); } } },
  B: { name: 'Spreading Rumours', tag: 'the fire leaves with them', costs: 'The patch burns out 30% sooner.', shows: 'Scorched footprints leading away from the patch.', modes: 'KITE makes pursuers walk through and out again',
    lv3: { desc: 'Enemies that leave the patch while Burning drop burning footprints behind them. Patch burns out 30% sooner.', apply(w) { w3TypeFeed(w); w3On(w, 'stats', (w, s) => { s.dur *= 0.7; }); w3On(w, 'tick', hmRumours); } },
    lv6: [
      { name: 'Hot Foot', desc: 'The burning footprints fill Burn bars as fast as the patch does.', apply(w) { w3S(w).hot = true; } },
      { name: 'Burning Bridges', desc: 'An enemy that Ignites while trailing footprints drops a fresh small patch where it stands (once each).', apply(w) { w3S(w).bridge = true; } }],
    wild: { name: 'Toasty', desc: 'Standing in your own patch slowly heals you.', apply(w) { w3On(w, 'tick', hmToasty); } } },
  C: { name: 'Flash in the Pan', tag: 'short fuse, big finish', costs: 'Very little steady damage.', shows: 'The patch swells and glows before it erupts.', modes: 'ORBIT gathers a crowd on top of it',
    lv3: { desc: 'Patches last half as long, but each one erupts across its whole area when it ends. Little steady damage.', apply(w) { w3TypeFeed(w); w3On(w, 'stats', (w, s) => { s.dur *= 0.5; }); w3On(w, 'tick', hmFlash); } },
    lv6: [
      { name: 'Short Fuse', desc: 'The eruption goes off early the moment 4 or more enemies stand in it.', apply(w) { w3S(w).hair = true; } },
      { name: 'Powder Keg', desc: 'Becomes a Burst: patches no longer burn, they erupt after a second at twice the size.', apply(w) { w3S(w).keg = true; } }],
    wild: { name: 'Hot Potato', desc: 'Every couple of seconds the patch jumps to under the nearest enemy outside it.', apply(w) { w3On(w, 'tick', hmPotato); } } },
  lv10: [
    { name: 'Hellmouth', best: 'A', desc: 'One huge patch that crawls after the thickest crowd and burns for a long time.', apply(w) { w3On(w, 'fire', hmHellFire); w3On(w, 'tick', hmHellmouth); } },
    { name: 'Spontaneous Combustion', best: 'B', desc: 'Every enemy that Ignites, from any source, drops a patch where it stands (once each).', apply(w) { w3On(w, 'tick', hmSpontaneous); } },
    { name: 'Scorched Earth', best: 'AC', desc: 'Patches stay lit as long as an enemy stands in them; up to 6 at once.', apply(w) { w3On(w, 'tick', hmScorched); } }],
});

// ================================================================ Family Ties (Force, Projectile, gravity well)
// Orbs are the shots of style 'void'. Each gets a record (pr.w3) on first sight; ended orbs are noticed once through st.orbs.
// An orb "ends" when its life runs out (merged and supernova'd orbs are dead too, but with life left: they are not endings).
const w3FtBase = w => w.s.dmg * 4;              // "the hit" for collisions: a second of orb ticks
function w3FtScan(w) {
  const st = w3S(w); if (st.scanN === G.frameN) return st.live;
  st.scanN = G.frameN; const live = st.live = [], known = st.orbs = st.orbs || [], ended = st.ended = [], nova = st.nova = [];
  for (let i = known.length - 1; i >= 0; i--) {
    const o = known[i];
    if (o.dead) { known.splice(i, 1); if (o.life <= 0) ended.push(o); else if ((o.mass || 1) >= VOID_MERGE.supernova) nova.push(o); }
  }
  for (const pr of G.proj) {
    if (pr.w !== w || pr.style !== 'void' || pr.lob || pr.dead) continue;
    if (!pr.w3) { pr.w3 = { fresh: true, mass: pr.mass || 1, orbiters: new Set(), n: st.orbN = (st.orbN || 0) + 1 }; known.push(pr); } else pr.w3.fresh = false;
    live.push(pr);
  }
  return live;
}
const w3Core = (o, e) => Math.hypot(e.x - o.x, e.y - o.y) < Math.max(o.r, o.aura * 0.22) + e.r * 0.3;
function ftMarkOrbit(w, o) { // enemies inside the aura, remembered for a moment (Lost Property, Let Go, Roach Motel read this)
  forNear(o.x, o.y, o.aura, e => { if (w3Foe(e)) { e.w3orb = G.t; e.w3orbO = o; } });
}
// ---- A. Event Horizon
function ftHorizon(w, dt) {
  for (const o of w3FtScan(w)) forNear(o.x, o.y, o.aura, e => {
    if (!w3Foe(e) || e.boss) return;
    const d = Math.hypot(e.x - o.x, e.y - o.y);
    if (d < o.aura * 0.5) w3Move(e, o.x, o.y, o.pull * dt);          // x2 near the centre
    else w3Move(e, o.x, o.y, -o.pull * 0.3 * dt);                    // 30% weaker at the edge
  });
  for (const o of w3S(w).live) if (Math.random() < dt * 5) ring(o.x, o.y, o.aura * 0.5, w.def.color, 0.4, 2);
}
function ftRoach(w, dt) {
  for (const o of w3FtScan(w)) {
    forNear(o.x, o.y, o.aura, e => {
      if (!w3Foe(e) || e.boss) return;
      if (!(e.w3held && e.w3held.o === o) && w3Core(o, e)) { e.w3held = { o, until: e.elite ? G.t + 1 : 1e9 }; floatText(e.x, e.y - e.r - 6, 'STUCK', w.def.color, 10, 0.6); }
    });
  }
  for (const e of G.enemies) {
    const h = e.w3held; if (!h) continue;
    if (!w3Live(e) || h.o.dead || G.t > h.until) { e.w3held = null; continue; }
    e.x = h.o.x; e.y = h.o.y; e.kx = e.ky = 0; stun(e, 0.2);
  }
}
function ftCompaction(w, dt) {
  w3FtScan(w);
  for (const o of w3S(w).ended) {
    const R = o.aura * 0.55, got = []; forNear(o.x, o.y, R, e => { if (w3Foe(e)) got.push(e); });
    const base = w3FtBase(w);
    w3Blast(w, o.x, o.y, R, w.s.dmg * 2, { atk: 'burst' }, w.def.color);
    for (const e of got) w3Hit(e, base * W3_COL * Math.min(3, got.length), w, { atk: 'burst' });
    if (got.length) floatText(o.x, o.y - 20, 'CRUSHED x' + got.length, w.def.color, 13, 0.8);
  }
}
function ftLost(w, dt) {
  w3FtScan(w);
  for (const o of w3S(w).live) ftMarkOrbit(w, o);
  for (const o of w3S(w).ended) ftMarkOrbit(w, o);
  for (const e of G.enemies) if (e.dead && !e.w3lp && e.w3orb > G.t - 0.35) {
    e.w3lp = true; let n = 0;
    for (const g of G.gems) if (!g.w3 && Math.hypot(g.x - e.x, g.y - e.y) < e.r + 30) { g.w3 = 1; g.x = G.player.x + rand(-8, 8); g.y = G.player.y + rand(-8, 8); n++; }
    if (n) { ring(e.x, e.y, e.r + 8, w.def.color, 0.4, 3); floatText(G.player.x, G.player.y - 22, 'LOST PROPERTY', w.def.color, 11, 0.7); }
  }
}
// ---- B. Orbituary
function ftOrbit(w, dt) {
  for (const o of w3FtScan(w)) {
    o.pull = 0;
    o.w3.orbiters.clear();
    forNear(o.x, o.y, o.aura, e => {
      if (!w3Foe(e) || e.boss) return;
      o.w3.orbiters.add(e); e.w3orb = G.t; e.w3orbO = o;
      const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx) + 1.7 * dt, rt = d + (Math.max(o.r + e.r + 8, o.aura * 0.6) - d) * Math.min(1, dt * 2.5);
      const nx = o.x + Math.cos(a) * rt, ny = o.y + Math.sin(a) * rt;
      if (!(G.lvl && lvSolidAt(nx, ny))) { e.x = nx; e.y = ny; }
    });
    if (Math.random() < dt * 8 && o.w3.orbiters.size) { const e = [...o.w3.orbiters][0]; spawnPart(e.x, e.y, w.def.color, 1, 10, 0.4, 3); }
  }
}
function ftBumper(w, dt) {
  const st = w3S(w), T = st.bump = st.bump || {};
  for (const o of w3FtScan(w)) for (const e of o.w3.orbiters) {
    forNear(e.x, e.y, e.r + 8, x => {
      if (x === e || !w3Foe(x)) return;
      const k = Math.min(e.id, x.id) + ':' + Math.max(e.id, x.id);
      if (T[k] > G.t) return; T[k] = G.t + 0.7;
      w3Collide(w, e, x, w3FtBase(w), false);
    });
  }
  if (Object.keys(T).length > 200) for (const k in T) if (T[k] < G.t) delete T[k];
}
function ftLetGo(w, dt) {
  w3FtScan(w);
  for (const o of w3S(w).ended) for (const e of o.w3.orbiters) {
    if (!w3Live(e)) continue;
    const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1;
    w3Fling(e, w, dx / d * 520, dy / d * 520, 1, w3FtBase(w));
  }
  if (w3S(w).ended.length) floatText(G.player.x, G.player.y - 30, 'LET GO', w.def.color, 12, 0.7);
  w3FlyTick();
}
function ftAssist(w, dt) {
  const st = w3S(w), p = G.player;
  for (const o of w3FtScan(w)) if (!(st.assistCd > G.t) && Math.hypot(p.vx, p.vy) > 50 && Math.hypot(p.x - o.x, p.y - o.y) < o.aura * 1.1) {
    st.assistCd = G.t + 2; st.assistT = G.t + 1; ring(p.x, p.y, 30, w.def.color, 0.4, 4); floatText(p.x, p.y - 26, 'SLINGSHOT', w.def.color, 12, 0.7);
  }
  if (st.assistT > G.t) { const nx = p.x + p.vx * 0.6 * dt, ny = p.y + p.vy * 0.6 * dt; if (!(G.lvl && lvSolidAt(nx, ny))) { p.x = nx; p.y = ny; } if (Math.random() < dt * 30) spawnPart(p.x, p.y, w.def.color, 1, 30, 0.35, 3); }
}
// ---- C. Big Bang, Eventually
function ftBigBang(w, dt) {
  for (const o of w3FtScan(w)) {
    const q = o.w3;
    if (q.fresh) { o.life *= 1.2; o.max = o.life; q.m0 = o.mass || 1; }
    const m = o.mass || 1;
    if (m > q.m0) { q.m0 = m; o.dmg *= 1.25; o.pull *= 1.06; o.aura *= 1.05; o.aura0 = (o.aura0 || o.aura) * 1.05; }   // merged orbs gain power 50% faster
    if (m > 1 && !(q.lbl > G.t)) { q.lbl = G.t + 0.5; floatText(o.x, o.y - o.r - 10, 'x' + m, w.def.color, 11 + Math.min(6, m), 0.55); }  // the merge count shows on the orb
  }
}
function ftAppetite(w, dt) {
  for (const o of w3FtScan(w)) if ((o.mass || 1) >= 3) for (const b of G.ebul) {
    if (b.dead) continue;
    if (Math.hypot(b.x - o.x, b.y - o.y) < o.aura) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 2, 40, 0.3, 2); if (!(o.w3.eatT > G.t)) { o.w3.eatT = G.t + 0.6; ring(o.x, o.y, o.r + 8, w.def.color, 0.3, 3); } }
  }
}
function ftAfterglow(w, dt) {
  w3FtScan(w);
  for (const o of w3S(w).nova) {
    const dealt = G.stats.wdmg ? (G.stats.wdmg[w.uid] || 0) : 0, k = 1 + Math.min(1, dealt / (w.s.dmg * 120)), R = Math.max(220, o.aura * 3.5) * k;
    w3Blast(w, o.x, o.y, R, (o.dmg * (o.mass || 5) * 2 + (o.dealt || 0) * 0.25) * (k - 1) + w.s.dmg, { atk: 'burst' }, '#ffffff');
    floatText(o.x, o.y - 50, 'x' + k.toFixed(1), '#ffffff', 18, 1.2);
    if (G.zones.length < 200) G.zones.push({ x: o.x, y: o.y, r: 110, life: 3, max: 3, dps: w.s.dmg * 6, elem: w.def.elem, pull: 160, color: w.def.color, tick: 0, src: weaponSrc(w) });
    modWell(o.x, o.y, 110, 600, 3, w, true, false);
  }
}
function ftWhiteHole(w, dt) {
  for (const o of w3FtScan(w)) {
    if (o.w3.fresh && o.w3.n % 3 === 0) { o.w3.white = true; o.color = '#ffffff'; floatText(o.x, o.y - 20, 'WHITE HOLE', '#ffffff', 12, 0.8); }
    if (o.w3.white) { o.pull = -Math.abs(o.pull || 95); if (Math.random() < dt * 6) ring(o.x, o.y, o.aura * 0.7, '#ffffff', 0.4, 2); }
  }
}
// ---- Lv 10
function ftSupermassive(w, dt) {
  for (const o of w3FtScan(w)) {
    const q = o.w3;
    if (q.fresh) { o.r *= 2; o.aura *= 2; o.r0 = (o.r0 || o.r / 2) * 2; o.aura0 = (o.aura0 || o.aura / 2) * 2; o.pull *= 2.5; }
    if ((o.mass || 1) >= 3 && !q.nova && G.t >= (G.novaT || 0)) { q.nova = true; G.novaT = G.t + VOID_MERGE.gap; o.dmg *= 3; voidSupernova(o); }
  }
}
function ftSpaghetti(w, dt) {
  for (const o of w3FtScan(w)) forNear(o.x, o.y, o.aura, e => {
    if (!w3Foe(e) || !w3Core(o, e)) return;
    e.w3core = G.t;
    if (!(e.w3spT > G.t)) { e.w3spT = G.t + 0.7; fxParts('smoke', e.x, e.y, w.def.color, 3, 40, 0.5, 4); }
    if (!e.boss && !e.rival && e.hp < e.maxHp * 0.3) { e.hp = 0; floatText(e.x, e.y - e.r, 'GULP', w.def.color, 13, 0.7); killEnemy(e, o.src); }
  });
}
function ftWormhole(w, dt) {
  const p = G.player;
  for (const o of w3FtScan(w)) {
    const q = o.w3;
    if (q.fresh && !o.w3twin) {
      const a = Math.atan2(o.vy, o.vx) + 2.2, t = spawnProj(w, p.x, p.y, a, weaponSrc(w), { w3twin: true });
      if (t) { t.w3 = { fresh: true, mass: 1, orbiters: new Set(), n: 0, link: o }; q.link = t; w3S(w).orbs.push(t); }
    }
  }
  for (const o of w3S(w).live) {
    const L = o.w3.link; if (!L || L.dead) continue;
    if (!(o.w3.bt > G.t)) { o.w3.bt = G.t + 0.35; bolt(o.x, o.y, L.x, L.y, w.def.color, 0.2); }
    forNear(o.x, o.y, o.aura, e => {
      if (!w3Foe(e) || e.boss || e.w3wt > G.t || !w3Core(o, e)) return;
      e.w3wt = G.t + 0.9; e.x = L.x; e.y = L.y;
      const t = w3Near(L.x, L.y, 500, x => x !== e && Math.hypot(x.x - L.x, x.y - L.y) > 60), a = t ? Math.atan2(t.y - L.y, t.x - L.x) : Math.random() * TAU;
      w3Fling(e, w, Math.cos(a) * 600, Math.sin(a) * 600, 1, w3FtBase(w));
      ring(L.x, L.y, 26, w.def.color, 0.4, 4); floatText(L.x, L.y - 20, 'WORMHOLE', w.def.color, 11, 0.6);
    });
  }
  w3FlyTick();
}

wupReg('s_void', {
  A: { name: 'Event Horizon', tag: 'nothing gets out', costs: 'The outer pull is 30% weaker, so fewer enemies are caught.', shows: 'A dark core with enemies pinned on it.', modes: 'HOLD and NEST, where the orbs fill up with enemies coming at you',
    lv3: { desc: 'The orb pulls twice as hard near its centre but 30% weaker at the edge, so it catches fewer enemies.', apply(w) { w3On(w, 'tick', ftHorizon); } },
    lv6: [
      { name: 'Roach Motel', desc: 'An enemy pulled into the centre is held there until the orb ends (elites briefly, never bosses).', apply(w) { w3On(w, 'tick', ftRoach); } },
      { name: 'Compaction', desc: 'When the orb ends, everything at its centre is crushed together in one Burst, with a collision hit each.', apply(w) { w3On(w, 'tick', ftCompaction); } }],
    wild: { name: 'Lost Property', desc: 'Enemies swallowed or crushed by an orb drop their gems right next to you.', apply(w) { w3On(w, 'tick', ftLost); } } },
  B: { name: 'Orbituary', tag: 'a moving hazard', costs: 'The orb does 40% less damage of its own.', shows: 'A ring of enemies whirling round the orb.', modes: 'ORBIT keeps the crowd feeding the ring',
    lv3: { desc: 'Enemies near the orb whirl round it instead of falling in. The orb itself does 40% less damage.', apply(w) { w3On(w, 'stats', (w, s) => { s.dmg *= 0.6; }); w3On(w, 'tick', ftOrbit); } },
    lv6: [
      { name: 'Fender Bender', desc: 'Orbiting enemies crash into each other and anything they swing into, a collision hit each.', apply(w) { w3On(w, 'tick', ftBumper); } },
      { name: 'Let Go', desc: 'When the orb ends, orbiting enemies are flung outwards, knocking back whatever they hit.', apply(w) { w3On(w, 'tick', ftLetGo); } }],
    wild: { name: 'Gravity Assist', desc: 'Swimming past an orb slingshots you: a short burst of extra swim speed.', apply(w) { w3On(w, 'tick', ftAssist); } } },
  C: { name: 'Big Bang, Eventually', tag: 'wait for it', costs: 'Slow, back-loaded damage.', shows: 'A growing orb with a merge counter, then the supernova.', modes: 'KITE keeps you alive while it grows',
    lv3: { desc: 'Merged orbs build power 50% faster, but orbs last longer and drift 30% slower. Slow, back-loaded damage.', apply(w) { w3On(w, 'stats', (w, s) => { s.speed *= 0.7; }); w3On(w, 'tick', ftBigBang); } },
    lv6: [
      { name: 'Midnight Feast', desc: 'The orb shows how many orbs it has merged; at 3 it starts eating enemy shots.', apply(w) { w3On(w, 'tick', ftAppetite); } },
      { name: 'Afterglow', desc: 'The supernova grows with everything the orbs dealt and leaves a pulling well behind for a few seconds.', apply(w) { w3On(w, 'tick', ftAfterglow); } }],
    wild: { name: 'White Hole', desc: 'Every 3rd orb pushes enemies away instead of pulling.', apply(w) { w3On(w, 'tick', ftWhiteHole); } } },
  lv10: [
    { name: 'Supermassive', best: 'C', desc: 'Orbs are twice the size and pull far harder; 3 merges make a supernova with triple damage.', apply(w) { w3On(w, 'tick', ftSupermassive); } },
    { name: 'Spaghettification', best: 'A', desc: 'Enemies at the centre take four times the damage and are swallowed whole when nearly dead (not bosses).', apply(w) { w3On(w, 'dmg', (w, e) => (e.w3core > G.t - 0.2 ? 4 : 1)); w3On(w, 'tick', ftSpaghetti); } },
    { name: 'Wormhole', best: 'B', desc: 'Orbs come in linked pairs: an enemy pulled into one shoots out of the other at speed, hitting what it meets.', apply(w) { w3On(w, 'tick', ftWormhole); } }],
});

// ================================================================ Skill Issue (Force, Burst, collisions)
// The engine already launches enemies and bowls them (armoury.js: armLand shoves, bowlTick, G.armBowl entries { e, w, until,
// hit, n, d }). We watch those entries: a collision (flier e meets o) calls every st.col callback; new entries call st.launch.
const w3SiBase = w => w.s.dmg * 1.4;
const w3SizeK = e => clamp(e.r / 13, 1, 2);
function w3SiScan(w) {
  const st = w3S(w); if (st.scanN === G.frameN) return;
  st.scanN = G.frameN;
  const B = G.armBowl || [];
  for (const b of B) {
    if (b.w !== w || !w3Live(b.e)) continue;
    const e = b.e;
    if (!b.w3) { b.w3 = { c: {}, n: 0, rb: 0, dep: b.d || 1 }; for (const f of st.launch || []) f(w, e, b); }
    if (Math.hypot(e.kx, e.ky) < 70) continue;
    for (const f of st.wallf || []) f(w, e, b);
    forNear(e.x, e.y, e.r + 16, o => {
      if (o === e || !w3Foe(o) || b.w3.c[o.id] > G.t - 0.5) return;
      b.w3.c[o.id] = G.t;
      for (const f of st.col || []) f(w, e, o, b);
    });
  }
}
function siOn(w, kind, fn) { const st = w3S(w); (st[kind] || (st[kind] = [])).push(fn); }
function siTick(w, dt) { w3SiScan(w); }
const w3SiPush = (w, o, dir, depth) => { const B = G.armBowl || (G.armBowl = []); if (B.length < 80 && !B.some(b => b.e === o && b.until > G.t)) B.push({ e: o, w, until: G.t + 0.6, hit: new Set([o]), n: { v: 0 }, d: depth || 2 }); };
function w3Spark(e, w, txt) { fxParts('spark', e.x, e.y, '#ffffff', 5, 160, 0.3, 2.5); if (txt && !(e.w3txtT > G.t)) { e.w3txtT = G.t + 0.6; floatText(e.x, e.y - e.r - 8, txt, w.def.color, 11, 0.5); } }

// ---- A. Pinball Wizard
function siRebound(w, e, o, b) {
  if (b.w3.rb >= 4) return; b.w3.rb++;
  const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1, sp = Math.hypot(e.kx, e.ky) * 0.7;
  e.kx = dx / d * sp; e.ky = dy / d * sp; b.until = Math.max(b.until, G.t + 0.6);
  w3Spark(e, w, 'BOING');
}
function siBank(w, e, o, b) { w3Collide(w, e, o, w3SiBase(w), false); }       // each rebound adds a collision hit
function siBankWall(w, e, b) {
  const n = w3Wall(e.x, e.y, e.r); if (!n || b.w3.wt > G.t - 0.25) return;
  b.w3.wt = G.t; const dot = e.kx * n.nx + e.ky * n.ny; if (dot >= 0) return;
  e.kx = (e.kx - 2 * dot * n.nx) * 0.7; e.ky = (e.ky - 2 * dot * n.ny) * 0.7; b.until = Math.max(b.until, G.t + 0.6);
  w3Hit(e, w3SiBase(w) * W3_COL, w, { atk: 'burst' }); w3Spark(e, w, 'BANK'); ring(e.x, e.y, e.r + 4, w.def.color, 0.25, 3);
}
function siHat(w, e, o, b) {
  b.w3.n++;
  if (b.w3.n === 3) { w3Blast(w, e.x, e.y, 56, w3SiBase(w) * 0.6, { atk: 'burst' }, w.def.color, null, e); floatText(e.x, e.y - e.r - 10, 'HAT TRICK', w.def.color, 12, 0.7); }
}
function siSausage(w, dt) {
  w3SiScan(w);
  const st = w3S(w), T = st.tugs = (st.tugs || []).filter(t => w3Live(t.o) && w3Live(t.e) && t.until > G.t);
  for (const b of G.armBowl || []) {
    if (b.w !== w || !w3Live(b.e) || Math.hypot(b.e.kx, b.e.ky) < 70 || T.length >= 20 || T.some(t => t.e === b.e)) continue;
    const o = w3Near(b.e.x, b.e.y, b.e.r + 22, x => x !== b.e && !T.some(t => t.o === x) && !(x.w3tugd > G.t));
    if (o) { T.push({ e: b.e, o, until: G.t + 0.8 }); o.w3tugd = G.t + 2; }
  }
  for (const t of T) { t.o.x += (t.e.x - t.o.x) * Math.min(1, 6 * dt); t.o.y += (t.e.y - t.o.y) * Math.min(1, 6 * dt); if (!(t.bt > G.t)) { t.bt = G.t + 0.08; bolt(t.e.x, t.e.y, t.o.x, t.o.y, w.def.color, 0.1); } }
}
// ---- B. Heavy Meat
function siHeavy(w, e, o, b) { const k = w3SizeK(e); if (k > 1.02) { w3Hit(o, w3SiBase(w) * W3_COL * k, w, { atk: 'burst' }); w3Spark(o, w, k > 1.7 ? 'x2' : null); } }
function siSmallLaunch(w, e, b) { if (!w3Big(e) && e.r < 11) { e.kx *= 0.35; e.ky *= 0.35; } }
function siWeight(w, e, o, b) { if (e.r > o.r * 1.25 && !o.boss && !o.rival) { o.kx += e.kx * 0.8; o.ky += e.ky * 0.8; w3Spark(o, w, 'OOF'); } }
function siPrime(w, e, o, b) { if (e.elite) { w3Heavy(o, w); w3Hit(o, w3SiBase(w) * W3_COL, w, { atk: 'burst' }); } }
function siPrimeLaunch(w, e, b) { if (e.elite) { e.kx *= 1.5; e.ky *= 1.5; ring(e.x, e.y, e.r + 6, w.def.color, 0.4, 4); } }
function siMeatShield(w, dt) {
  const st = w3S(w), W = st.walls = (st.walls || []).filter(x => x.until > G.t);
  for (const z of G.zones) if (z.src && z.src.w === w && !z.w3sk) { z.w3sk = 1; if (Math.hypot(z.x - G.player.x, z.y - G.player.y) < 170 && W.length < 3) { W.push({ x: z.x, y: z.y, until: G.t + 2 }); floatText(z.x, z.y - 20, 'MEAT WALL', w.def.color, 12, 0.8); } }
  for (const m of W) {
    if (Math.random() < dt * 14) { const a = Math.random() * TAU; spawnPart(m.x + Math.cos(a) * 30, m.y + Math.sin(a) * 30, w.def.color, 1, 4, 0.3, 4); }
    if (Math.random() < dt * 4) ring(m.x, m.y, 34, w.def.color, 0.3, 4);
    for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - m.x, b.y - m.y) < 36) { b.dead = true; fxParts('spark', b.x, b.y, w.def.color, 3, 80, 0.25, 2); }
  }
}
// ---- C. Meat Grinder
function siMarkOne(w, e, dep) {
  const st = w3S(w); if (!w3Foe(e)) return;
  e.w3im = (e.w3im || 0) + 1; e.w3imd = dep;
  if (e.w3im < 3) { ring(e.x, e.y, e.r + 2 + e.w3im * 3, w.def.color, 0.5, 2); floatText(e.x, e.y - e.r - 6, e.w3im + '/3', w.def.color, 10, 0.5); return; }
  e.w3im = 0;
  after(dep > 1 ? 0.15 : 0, () => { if (G && w3Live(e)) siGrind(w, e, dep); });
}
function siGrind(w, e, dep) {
  const st = w3S(w), R = 60;
  const hit = w3Blast(w, e.x, e.y, R, w3SiBase(w) * 0.5, { atk: 'burst' }, w.def.color, null, e);
  floatText(e.x, e.y - e.r - 8, 'TENDERISED', w.def.color, 12, 0.7);
  for (const o of hit) {
    if (st.launchN && dep <= 2 && !o.boss && !o.rival) { const dx = o.x - e.x, dy = o.y - e.y, d = Math.hypot(dx, dy) || 1; o.kx += dx / d * 260; o.ky += dy / d * 260; w3SiPush(w, o, 0, dep + 1); }
    if (st.chain && dep < 3) siMarkOne(w, o, dep + 1);
  }
}
function siMark(w, e, o, b) { siMarkOne(w, e, b.w3.dep); siMarkOne(w, o, b.w3.dep); }
function siLeftovers(w, dt) {
  const st = w3S(w), C = st.chunks = (st.chunks || []).filter(c => c.until > G.t), p = G.player;
  for (let i = C.length - 1; i >= 0; i--) {
    const c = C[i];
    if (Math.random() < dt * 12) spawnPart(c.x, c.y, w.def.color, 1, 2, 0.25, 3.5);
    if (Math.hypot(c.x - p.x, c.y - p.y) < p.r + 14) { healPlayer(G.P.maxHp * 0.005); C.splice(i, 1); fxParts('plus', p.x, p.y, '#8ac926', 2, 40, 0.7, 6); }
  }
}
function siChunk(w, e, o, b) { const C = w3S(w).chunks = (w3S(w).chunks || []); if (C.length < 12) C.push({ x: e.x, y: e.y, until: G.t + 8 }); }
// ---- Lv 10
function siPerfect(w, dt) {
  const st = w3S(w); st.pg = true;
  for (const b of G.armBowl || []) if (b.w === w && w3Live(b.e) && b.w3 && b.w3.dep >= 2 && !b.w3.pgd) b.w3.pgd = 1;
}
function siPerfectLaunch(w, e, b) { e.kx *= 2; e.ky *= 2; b.until = Math.max(b.until, G.t + 1.1); }
function siPerfectCol(w, e, o, b) {                 // knock on to depth 4 (the engine stops at 2)
  if (b.w3.dep >= 2 && b.w3.dep < 4 && !o.boss && !o.rival) { o.kx += e.kx * 0.8; o.ky += e.ky * 0.8; w3SiPush(w, o, 0, b.w3.dep + 1); }
}
function siTender(w, e, o, b) { w3Heavy(o, w); w3Heavy(e, w); }
function siCannonball(w, dt) {
  const st = w3S(w), p = G.player, S_ = G.m10 || (G.m10 = { wells: [], mines: [], lobs: [], pets: [], lunge: null, wid: 0 });
  st.cbT = (st.cbT == null ? 2 : st.cbT) - dt;
  if (st.cbT <= 0) {
    const t = acquire('cluster', 520, p.x, p.y) || acquire('nearest', 520, p.x, p.y);
    if (t) {
      st.cbT = 4; const a = Math.atan2(t.y - p.y, t.x - p.x);
      S_.lunge = { ux: Math.cos(a), uy: Math.sin(a), left: 320, v: 320 / 0.3 }; st.cb = { until: G.t + 0.35, hit: new Set(), ux: Math.cos(a), uy: Math.sin(a) };
      floatText(p.x, p.y - 30, 'CANNONBALL', w.def.color, 14, 0.8);
    } else st.cbT = 0.5;
  }
  if (st.cb && st.cb.until > G.t) {
    p.iframes = Math.max(p.iframes, 0.1);
    if (Math.random() < dt * 40) spawnPart(p.x, p.y, w.def.color, 1, 20, 0.4, 4);
    forNear(p.x, p.y, p.r + 20, e => {
      if (!w3Foe(e) || st.cb.hit.has(e)) return; st.cb.hit.add(e);
      w3Hit(e, w3SiBase(w), w, { atk: 'burst', kx: st.cb.ux, ky: st.cb.uy });
      if (!e.boss && !e.rival) { e.kx += st.cb.ux * 420; e.ky += st.cb.uy * 420; w3SiPush(w, e, 0, 2); }
      w3Spark(e, w, 'BOWLED');
    });
  }
}

wupReg('s_lard', {
  A: { name: 'Pinball Wizard', tag: 'rebound everything', costs: '-20% blast damage.', shows: 'Enemies ricochet round the group.', modes: 'ORBIT keeps the group close enough to bounce',
    lv3: { desc: 'Enemies that crash into others bounce on at 70% speed instead of stopping. Blasts 20% weaker.', apply(w) { w3On(w, 'stats', (w, s) => { s.dmg *= 0.8; }); siOn(w, 'col', siRebound); w3On(w, 'tick', siTick); } },
    lv6: [
      { name: 'Bank Shot', desc: 'Rebounds off walls count too, and each rebound adds a collision hit.', apply(w) { siOn(w, 'col', siBank); siOn(w, 'wallf', siBankWall); } },
      { name: 'Hat Trick', desc: 'An enemy that bounces into 3 others bursts in a small Force blast.', apply(w) { siOn(w, 'col', siHat); } }],
    wild: { name: 'Sausage Link', desc: 'A launched enemy trails a string that drags the next enemy it passes along behind it.', apply(w) { w3On(w, 'tick', siSausage); } } },
  B: { name: 'Heavy Meat', tag: 'big enemies make the best ammunition', costs: 'Small enemies barely move.', shows: 'Big enemies cannon through little ones.', modes: 'HUNT finds the big ones',
    lv3: { desc: 'Collision damage grows with the size of the flying enemy, up to double for elites. Small enemies barely move.', apply(w) { siOn(w, 'col', siHeavy); siOn(w, 'launch', siSmallLaunch); w3On(w, 'tick', siTick); } },
    lv6: [
      { name: 'Weight Class', desc: 'Big enemies send small ones flying twice as far.', apply(w) { siOn(w, 'col', siWeight); } },
      { name: 'Prime Cut', desc: 'Elites launch harder (never bosses), and a launched elite is a heavy hit to everything it strikes.', apply(w) { siOn(w, 'col', siPrime); siOn(w, 'launch', siPrimeLaunch); } }],
    wild: { name: 'Meat Shield', desc: 'Dollops that land near you set into a short-lived wall of meat that blocks enemy shots.', apply(w) { w3On(w, 'tick', siMeatShield); } } },
  C: { name: 'Meat Grinder', tag: 'hits build up', costs: '-30% knockback distance.', shows: 'Tenderised enemies swell with each mark, then pop.', modes: 'HOLD lets the crowd pile in',
    lv3: { desc: 'Each collision marks an enemy; at 3 marks it bursts in a small Force shockwave. Knockback 30% shorter.', apply(w) { siOn(w, 'launch', (w, e, b) => { e.kx *= 0.7; e.ky *= 0.7; }); siOn(w, 'col', siMark); w3On(w, 'tick', siTick); } },
    lv6: [
      { name: 'Splatter Zone', desc: 'The shockwave launches the enemies next to it too.', apply(w) { w3S(w).launchN = true; } },
      { name: 'Chain Tenderising', desc: 'The shockwave counts as a collision, so it marks what it hits too (3 deep).', apply(w) { w3S(w).chain = true; } }],
    wild: { name: 'Leftovers', desc: 'Bowled enemies drop chunks; swimming through one heals you a little.', apply(w) { siOn(w, 'col', siChunk); w3On(w, 'tick', siLeftovers); } } },
  lv10: [
    { name: 'Perfect Game', best: 'A', desc: 'Everything you launch flies twice as hard and knocks on 4 deep.', apply(w) { siOn(w, 'launch', siPerfectLaunch); siOn(w, 'col', siPerfectCol); w3On(w, 'tick', siTick); } },
    { name: 'Tenderiser', best: 'BC', desc: 'Every collision is a heavy hit.', apply(w) { siOn(w, 'col', siTender); w3On(w, 'tick', siTick); } },
    { name: 'Human Cannonball', best: 'A', desc: 'You are the missile: every few seconds you launch yourself a long way, untouchable mid-flight, bowling over all you touch.', apply(w) { w3On(w, 'tick', siCannonball); } }],
});
