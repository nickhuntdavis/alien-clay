'use strict';
// Spawn Prawn - weapon upgrade branches, batch 2 (redesign docs/WEAPON_UPGRADES.md 5 to 8):
//   Acid Spit (v_fire_proj), Red Flagship (v_shock_beam), Nocturnal Emission (v_ice_pool), Little Prick (v_arcane_proj).
// Each weapon: 3 promises (Lv 3), 9 Lv 6 cards (two per promise plus its wildcard), 3 masteries (Lv 10), all registered with
// wupReg (weapons24.js) and acting through wupOn hooks. Everything here is namespaced w2* so it merges with the other wupN.js files.
// Conventions:
//   - per-slot state lives in w.w2 (w2s), per-enemy scratch in e.w2 (w2E); a counter per signature effect is kept in w.w2.fx
//     (w2Mark) so the test can see a card working.
//   - damage a card makes itself goes through damageEnemy with src.wupEcho (it never re-triggers hit hooks). W2_E is echo damage
//     (matrix 12.1: no bars, no reactions, no status); other secondary hits are ordinary hits that fill bars.
//   - every chain has a fixed depth; every card draws something (a ring, line, drip or floatText).
// Hooks: none added to shared files (everything runs from the wupOn hooks). Shared files read: fight.js (fightCd, fightPayoff,
// fightStatus, fightArc), combat.js (dropLayer, COMBAT), game.js (damageEnemy, spawnProj, forNear, acquire, zones, v10fx lines).

const W2_E = { echo: true, noStatus: true, noCrit: true, noArc: true, noProc: true, wupEcho: true };
const W2_RED = '#c9184a', W2_PINK = '#ff2fa8', W2_YEL = '#ffe94a', W2_GRN = '#7fd04a', W2_BSOD = '#2a5bd7';

// ---------------------------------------------------------------- helpers
const w2s = w => w.w2 || (w.w2 = { fx: {} });
const w2E = e => e.w2 || (e.w2 = {});
const w2Mark = (w, k) => { const S = w2s(w); S.fx[k] = (S.fx[k] || 0) + 1; };
const w2Cap = (a, n) => { while (a.length > n) a.shift(); };
// Other hooks of this slot may also replace the firing: the first to claim a frame's shot wins.
function w2Claim(w) { const S = w2s(w); if (S.tookF === G.frameN) return false; S.tookF = G.frameN; return true; }
// A secondary hit's source: the weapon's own, no knockback, no multiplier carried twice.
function w2Src(src, over) { return Object.assign({}, src, { knock: 0, kx: undefined, ky: undefined, mult: 1 }, over); }
function w2Base(w, over) { return Object.assign(weaponSrc(w), { knock: 0 }, over); }
function w2Line(x1, y1, x2, y2, wd, c, life, jit) {
  const F = G.v10fx || (G.v10fx = []);
  if (F.length > 160) return;
  F.push({ k: 'beam', x: x1, y: y1, x2, y2, w: wd, c, t: jit ? 'shock' : '', life: life || 0.12, max: life || 0.12 });
}
function w2Mix(c, k) { // a '#rrggbb' colour moved k of the way to white
  const m = /^#([0-9a-f]{6})$/i.exec(c || ''); if (!m) return '#ffffff';
  const n = parseInt(m[1], 16), f = v => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0');
  return '#' + f(n >> 16 & 255) + f(n >> 8 & 255) + f(n & 255);
}
function w2Pips(e, n, c, gap) { // n little dots over an enemy (throttled)
  const E = w2E(e); if (E.pipT > G.realT || G.fx.length > 220) return;
  E.pipT = G.realT + (gap || 0.3);
  for (let i = 0; i < n; i++) ring(e.x + (i - (n - 1) / 2) * 6, e.y - e.r - 9, 2, c, 0.32, 2);
}
function w2SegDist(px, py, x1, y1, x2, y2) { // distance from a point to a segment
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}
// Pull (matrix 12.2): reverse knockback; Squishy halves it, elites 50%, bosses 25%; never through a wall.
function w2Pull(e, tx, ty, str, dt) {
  if (e.egg || e.dead) return;
  let f = str / (e.r / 12) * dt;
  if (e.boss) f *= 0.25; else if (e.elite) f *= 0.5;
  if (fightCd(e).def === 'squishy') f *= 0.5;
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1, m = Math.min(d, f), nx = e.x + dx / d * m, ny = e.y + dy / d * m;
  if (G.lvl && lvSolidAt(nx, ny)) return;
  e.x = nx; e.y = ny;
}
// One shot of this weapon at a chosen enemy (for cards that choose their own target).
function w2Shoot(w, t, src, spread, over, ox, oy) {
  const p = G.player, x = ox == null ? p.x : ox, y = oy == null ? p.y : oy, a = Math.atan2(t.y - y, t.x - x) + (spread || 0);
  if (ox == null) p.face = a;
  return spawnProj(w, x, y, a + rand(-w.s.spread, w.s.spread) * 0.5, src, over);
}
// The shots of this slot: new ones this frame (fresh), ones that ended this frame (gone), ones still flying (live).
function w2Track(w) {
  const S = w2s(w);
  if (S.trkF === G.frameN) return S;
  S.trkF = G.frameN; S.fresh = []; S.gone = [];
  const live = S.live || (S.live = []);
  for (const pr of G.proj) if (pr.w === w && !pr.w2t && !pr.lob && !pr.dead) { pr.w2t = 1; S.fresh.push(pr); live.push(pr); }
  let j = 0;
  for (const pr of live) { if (pr.dead) S.gone.push(pr); else live[j++] = pr; }
  live.length = j;
  return S;
}
// Corrosion and Poise bars (combat.js): add a share of a bar and pay it off like the resolver does.
const w2AcidFrac = (e, raw) => { const cd = fightCd(e); return raw / (0.25 * (cd.def === 'shell' && cd.layers > 0 ? cd.layers : 1) * COMBAT.rankBarK[cd.rank || 'normal'] * cd.maxHp); };
function w2BarBump(e, k, frac, src, resetTo) {
  const cd = fightCd(e); cd.bars[k] += frac; cd.barQuietT[k] = 0;
  if (cd.bars[k] < 1) return null;
  cd.bars[k] = resetTo || 0;
  if (k === 'acid' && src && w2Snot(src.w)) { w2Snowball(src.w, e); return 'snow'; } // (Acid Spit switched to Mucus)
  if (k === 'acid') {
    if (cd.def === 'shell' && cd.layers > 0) { dropLayer(cd, { layersLost: 0 }); fst().layers++; ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3); return 'strip'; }
    fightPayoff(e, 'corrode', { raw: 0 }, src || {}); return 'corrode';
  }
  fightPayoff(e, 'stagger', { raw: 0 }, src || {}); return 'stagger';
}
// A bounded damage line (beams, zaps): everything within wd of the segment takes dmg once.
function w2Beam(w, ox, oy, a, L, wd, dmg, src, c, life) {
  const ca = Math.cos(a), sa = Math.sin(a), hit = [];
  for (const e of G.enemies) {
    if (e.dead || e.charmed || e.phased) continue;
    const t = Math.max(0, Math.min(L, (e.x - ox) * ca + (e.y - oy) * sa));
    if (Math.hypot(e.x - (ox + ca * t), e.y - (oy + sa * t)) <= e.r + wd) hit.push(e);
  }
  for (const e of hit) damageEnemy(e, dmg, src);
  w2Line(ox, oy, ox + ca * L, oy + sa * L, wd, c || w.def.color, life || 0.12, true);
  return hit;
}
function w2Zone(w, x, y, r, life, dps, over) {
  if (G.zones.length > 140) return null;
  const z = Object.assign({ x, y, r, life, max: life, dps, elem: w.def.elem, pull: 0, color: w.def.color, tick: 0, src: w2Base(w, { wupEcho: true }) }, over || {});
  G.zones.push(z); return z;
}
// A lobbed glob that lands as an ordinary lob (game.js landLob): damage in a small circle, and a pool when dur > 0.
function w2Lob(w, tx, ty, src, o) {
  const p = G.player, fake = Object.create(w, { s: { value: { area: o.area, dmg: o.dmg, dur: o.dur || 0 } } }); // (the slot, with the lob's own numbers)
  G.proj.push({ lob: true, sx: p.x, sy: p.y, tx, ty, x: p.x, y: p.y, t: 0, flight: o.flight || 0.5, w: fake, src, color: w.def.color, dead: false });
}
const w2Bleeding = e => !!(e.bleeds && e.bleeds.length);

// ================================================================ 5. ACID SPIT (Acid, Projectile)
// Switched to Mucus (fitcheck.js lets Switched at Birth pick it): Snowball. The weapon's own hits keep building the
// Corrosion bar, now drawn as a snot coat; a full coat snowballs the enemy instead of stripping it: it swells, is stuck
// fast for 1.5 s (bosses 0.4 s) and its sneeze Snares everything within 70. Acid Pools become snot puddles (zones take
// the weapon's damage type). Stripped Bare is not offered (fitcheck.js).
const W2_SNOT = '#b5e48c', w2Snot = w => !!(w && w.def && w.def.elem === 'ice' && w24Key(w) === 'v_fire_proj');
const w2AcidCol = w => (w2Snot(w) ? W2_SNOT : W2_PINK);
function w2Snowball(w, e) {
  w2E(e).snowT = G.t + 3; // (counts as carrying a coat for Snot House, Backsplash)
  e.frozen = Math.max(e.frozen || 0, e.boss ? 0.4 : 1.5);
  ring(e.x, e.y, e.r + 16, W2_SNOT, 0.6, 7); ring(e.x, e.y, e.r + 30, W2_SNOT, 0.4, 3); fxParts('bubble', e.x, e.y, W2_SNOT, 8, 90, 0.6, 4);
  if (e.dead) return;
  floatText(e.x, e.y - e.r - 12, 'SNOWBALLED', W2_SNOT, 13, 0.8); w2Mark(w, 'snowball');
  if (w2s(w).stripReset) { floatText(e.x, e.y - e.r - 26, 'SECONDS', W2_SNOT, 11, 0.6); w2Mark(w, 'seconds'); } // (Second Helping: the coat stays half on)
  forNear(e.x, e.y, 70, o => { if (o !== e && !o.dead && !o.charmed) { w2Snare(o); w2Line(e.x, e.y, o.x, o.y, 2, W2_SNOT, 0.25); } });
}
// The coat: Mucus hits do not fill Corrosion on their own, so the weapon's own hits do (every promise).
function w2SnotFeed(w) {
  const S = w2s(w); if (S.snotFeed) return; S.snotFeed = 1;
  wupOn(w, 'hit', (w, e, res, src) => {
    if (!w2Snot(w) || !res.statusOk || src.wupEcho || !e.cd) return; // (a killing hit still coats, so Snot House sees it)
    w2BarBump(e, 'acid', w2AcidFrac(e, res.raw), w2Base(w), w2s(w).stripReset);
    if (!(w2E(e).coatT > G.realT)) { w2E(e).coatT = G.realT + 0.3; const k = clamp(e.cd.bars.acid, 0, 1); ring(e.x, e.y, e.r + 2 + k * 10, W2_SNOT, 0.3, 2 + k * 5); }
  });
}
// A. Spit Take
function w2SpitTick(w, dt) {
  const S = w2s(w);
  if (S.lock && !S.lock.dead && !(S.lockT > G.realT)) { // the coat thickens with the bar
    S.lockT = G.realT + 0.25;
    const k = clamp(fightCd(S.lock).bars.acid, 0, 1);
    ring(S.lock.x, S.lock.y, S.lock.r + 3 + k * 8, w2AcidCol(w), 0.3, 2 + k * 4);
    fxParts('bubble', S.lock.x + rand(-1, 1) * S.lock.r, S.lock.y, w2AcidCol(w), 1 + Math.round(k * 3), 24, 0.6, 2.5, -Math.PI / 2, 0.6);
  }
}
wupReg('v_fire_proj', {
  A: { name: 'Spit Take', tag: 'HUNT', costs: 'the glob no longer re-targets until its target dies.', shows: 'a fizzing coat that thickens on the target.', modes: 'HUNT',
    lv3: { desc: 'Corrosion builds faster and each glob hurts more as the target\'s bar fills. You stay locked on one target until it dies.', apply(w) {
      const S = w2s(w); S.lock = null; w2SnotFeed(w);
      wupOn(w, 'dmg', (w, e, src) => 1 + 0.4 * clamp(fightCd(e).bars.acid, 0, 1));
      wupOn(w, 'hit', (w, e, res, src) => { // +50% Corrosion build-up
        if (!res.statusOk || res.payoffs.length || !e.cd) return;
        const r = w2BarBump(e, 'acid', 0.5 * w2AcidFrac(e, res.raw), src, w2s(w).stripReset);
        if (r) w2Mark(w, 'fastpay');
      });
      wupOn(w, 'fire', (w, t, src) => { // stays on its target until it dies
        if (S.fireMaster) return false;
        const p = G.player;
        if (!S.lock || S.lock.dead || Math.hypot(S.lock.x - p.x, S.lock.y - p.y) > w.s.range * 1.1) S.lock = t;
        if (S.lock === t || !w2Claim(w)) return false;
        w2Shoot(w, S.lock, src); w2Mark(w, 'locked'); return true;
      });
      wupOn(w, 'tick', w2SpitTick);
    } },
    lv6: [
      { name: 'Second Helping', desc: 'After Corrosion strips a Shell layer, the bar only drops halfway, so the next layer goes faster.', apply(w) {
        const S = w2s(w); S.stripReset = 0.5;
        wupOn(w, 'hit', (w, e, res) => {
          if (res.payoffs.includes('strip') && e.cd) { e.cd.bars.acid = Math.max(e.cd.bars.acid, 0.5); ring(e.x, e.y, e.r + 10, W2_PINK, 0.4, 3); floatText(e.x, e.y - e.r - 8, 'SECONDS', W2_PINK, 11, 0.6); w2Mark(w, 'seconds'); }
        });
      } },
      { name: 'Stripped Bare', desc: 'A target that loses its last Shell layer takes double damage from your globs for a few seconds.', apply(w) {
        wupOn(w, 'hit', (w, e, res) => {
          if (res.layersLost > 0 && e.cd && e.cd.layers === 0) { w2E(e).bareT = G.t + 4; ring(e.x, e.y, e.r + 12, W2_PINK, 0.5, 5); floatText(e.x, e.y - e.r - 8, 'STRIPPED', W2_PINK, 12, 0.7); w2Mark(w, 'bare'); }
        });
        wupOn(w, 'dmg', (w, e) => (e.w2 && e.w2.bareT > G.t ? 2 : 1));
      } },
    ],
    wild: { name: 'Spittoon', desc: 'Missed globs leave a puddle. Swim through it and your next few globs come out double size.', apply(w) {
      const S = w2s(w); S.bigN = 0;
      wupOn(w, 'tick', (w, dt) => {
        w2Track(w);
        for (const pr of S.gone) if (!pr.nHit && G.zones.length < 120) {
          const mine = G.zones.filter(z => z.w2spit === w && z.life > 0);
          if (mine.length >= 6) mine[0].life = 0.001;
          w2Zone(w, pr.x, pr.y, 40, 3.5, w.s.dmg * 0.3, { w2spit: w }); w2Mark(w, 'puddle');
        }
        const p = G.player;
        for (const z of G.zones) if (z.w2spit === w && z.life > 0 && !z.w2used && Math.hypot(z.x - p.x, z.y - p.y) < z.r + p.r) { z.w2used = 1; z.life = Math.min(z.life, 0.6); S.bigN = 3; ring(p.x, p.y, p.r + 14, W2_PINK, 0.4, 4); floatText(p.x, p.y - 30, 'LOADED', W2_PINK, 12, 0.7); w2Mark(w, 'loaded'); }
        for (const pr of S.fresh) if (S.bigN > 0) { S.bigN--; pr.r *= 2; w2Mark(w, 'big'); }
      });
    } } },
  B: { name: 'Splash Damage', tag: 'ORBIT', costs: '-15% damage on the direct hit.', shows: 'visible droplets arcing off the target.', modes: 'ORBIT',
    lv3: { desc: 'A direct hit splatters droplets onto nearby enemies, spreading Corrosion. The direct hit is 15% weaker.', apply(w) {
      const S = w2s(w); S.splat = 1; w2SnotFeed(w);
      wupOn(w, 'stats', (w, s) => { s.dmg *= 0.85; });
      wupOn(w, 'hit', (w, e, res, src) => w2Splat(w, e, res.raw, src, S.dip ? 2 : 1));
    } },
    lv6: [
      { name: 'Backsplash', desc: 'Droplets that land on an enemy already carrying Corrosion splatter again.', apply(w) { w2s(w).dip = 1; } },
      { name: 'Nasty Fifth', desc: 'Every fifth glob is lobbed and leaves an Acid Pool where it lands.', apply(w) {
        const S = w2s(w);
        wupOn(w, 'fire', (w, t, src) => {
          if (S.fireMaster) return false;
          S.n = (S.n || 0) + 1;
          if (S.n % 5 || !w2Claim(w)) return false;
          w2Lob(w, t.x, t.y, w2Src(src, { mult: src.mult, wupEcho: true }), { area: 50, dmg: w.s.dmg, dur: 3, flight: 0.5 });
          floatText(G.player.x, G.player.y - 30, 'NASTY', W2_PINK, 12, 0.6); w2Mark(w, 'fifth'); return true;
        });
      } },
    ],
    wild: { name: 'Mouthful', desc: 'With nothing in range for a moment, the next spit is a mouthful of several globs at once.', apply(w) {
      const S = w2s(w); S.idle = 0; S.gargle = false;
      wupOn(w, 'tick', (w, dt) => {
        const p = G.player, near = acquire('nearest', w.s.range, p.x, p.y);
        if (near) S.idle = 0; else S.idle += dt;
        if (S.idle >= 2 && !S.gargle) { S.gargle = true; floatText(p.x, p.y - 34, 'GARGLING', W2_PINK, 12, 0.9); ring(p.x, p.y, p.r + 12, W2_PINK, 0.5, 4); fxParts('bubble', p.x, p.y, W2_PINK, 6, 40, 0.8, 3, -Math.PI / 2, 0.8); }
        if (S.gargle && !(S.gtT > G.realT)) { S.gtT = G.realT + 0.4; ring(p.x, p.y, p.r + 6 + 4 * Math.sin(G.realT * 8), W2_PINK, 0.25, 2); }
      });
      wupOn(w, 'fire', (w, t, src) => {
        if (!S.gargle || S.fireMaster || !w2Claim(w)) return false;
        S.gargle = false; S.idle = 0;
        for (let i = -2; i <= 2; i++) w2Shoot(w, t, src, i * 0.16);
        floatText(G.player.x, G.player.y - 34, 'MOUTHFUL', W2_PINK, 14, 0.8); w2Mark(w, 'mouthful'); return true;
      });
    } } },
  C: { name: 'Bad Aftertaste', tag: 'COLLECT', costs: 'no help against the target itself.', shows: 'green-pink drips on marked enemies, a splat on death.', modes: 'COLLECT',
    lv3: { desc: 'Hits leave residue; when the target dies, it splashes its Corrosion onto enemies nearby. Does nothing extra to the target itself.', apply(w) {
      const S = w2s(w); S.marks = new Set(); w2SnotFeed(w);
      wupOn(w, 'hit', (w, e, res, src) => {
        const E = w2E(e); E.resT = G.t;
        if (!E.res) { E.res = 1; E.depth = 1; S.marks.add(e); if (S.marks.size > 60) S.marks.delete(S.marks.values().next().value); }
      });
      wupOn(w, 'tick', (w, dt) => {
        for (const e of S.marks) {
          const E = w2E(e);
          if (e.dead) { S.marks.delete(e); w2Aftertaste(w, e, E); continue; }
          if (G.t - E.resT > 20) { S.marks.delete(e); E.res = 0; continue; }
          if (!(E.dripT > G.realT)) { E.dripT = G.realT + 0.35; fxParts('drop', e.x + rand(-1, 1) * e.r * 0.6, e.y, Math.random() < 0.5 ? W2_PINK : W2_GRN, 1, 22, 0.7, 2.5, Math.PI / 2, 0.5); }
        }
      });
    } },
    lv6: [
      { name: 'Wet Floor', desc: 'The death splash also leaves a small Acid Pool where the enemy died.', apply(w) { w2s(w).wet = 1; } },
      { name: 'Pyramid Scheme', desc: 'Enemies hit by a death splash carry residue too, so their deaths splash again, a few deep.', apply(w) { w2s(w).pass = 1; } },
    ],
    wild: { name: 'Leapfrog', desc: 'Globs arc over the first enemy and land on the one behind it.', apply(w) {
      const S = w2s(w);
      wupOn(w, 'fire', (w, t, src) => {
        if (S.fireMaster || !w2Claim(w)) return false;
        const p = G.player, d0 = Math.hypot(t.x - p.x, t.y - p.y); let best = null, bd = 1e9;
        forNear(t.x, t.y, 170, o => { if (o === t || o.dead || o.charmed) return; if (Math.hypot(o.x - p.x, o.y - p.y) > d0 + 5) { const dd = Math.hypot(o.x - t.x, o.y - t.y); if (dd < bd) { bd = dd; best = o; } } });
        const T = best || t, fl = 0.5;
        w2Lob(w, T.x, T.y, w2Src(src, { mult: src.mult }), { area: 60, dmg: w.s.dmg, flight: fl });
        after(fl, () => { if (G) { ring(T.x, T.y, 30, W2_PINK, 0.35, 4); fxParts('drop', T.x, T.y, W2_PINK, 6, 120, 0.4, 3); } });
        p.face = Math.atan2(T.y - p.y, T.x - p.x); w2Mark(w, best ? 'behind' : 'lob'); return true;
      });
    } } },
  lv10: [
    { name: 'Battery Acid', best: 'A', desc: 'Every hit fills an enemy\'s Corrosion bar completely. Bosses fill half.', apply(w) {
      wupOn(w, 'hit', (w, e, res, src) => {
        if (!res.statusOk || !e.cd || e.dead || res.payoffs.length) return;
        const r = w2BarBump(e, 'acid', e.boss ? 0.5 : 1, src);
        if (r) w2Mark(w, 'battery');
      });
    } },
    { name: 'Projectile Vomit', best: 'AB', desc: 'Your spit becomes a continuous acid stream that pierces everything and builds Corrosion faster. Changes the attack to Beam.', apply(w) {
      const S = w2s(w); S.vomit = 1; S.fireMaster = true;
      wupOn(w, 'stats', (w, s) => { s.dmg *= 0.22; s.cd *= 0.22; s.mag = Math.round(s.mag * 3.5); s.pierce = 99; });
      wupOn(w, 'fire', (w, t, src) => {
        if (!w2Claim(w)) return false;
        const p = G.player, a = Math.atan2(t.y - p.y, t.x - p.x); p.face = a;
        w2Beam(w, p.x, p.y, a, w.s.range * 0.8, 10, w.s.dmg, w2Src(src, { mult: src.mult, atk: 'beam' }), W2_PINK, 0.12);
        fxParts('drop', p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20, W2_PINK, 1, 200, 0.4, 3, a, 0.25);
        w2Mark(w, 'stream'); return true;
      });
      wupOn(w, 'hit', (w, e, res, src) => { // Corrosion x1.5
        if (!res.statusOk || res.payoffs.length || !e.cd) return;
        w2BarBump(e, 'acid', 0.5 * w2AcidFrac(e, res.raw), src);
      });
    } },
    { name: 'Acid House', best: 'BC', desc: 'Every enemy that dies carrying Corrosion leaves an Acid Pool, and touching pools merge into one.', apply(w) {
      const S = w2s(w); S.carry = new Set();
      wupOn(w, 'hit', (w, e) => { if (e.cd && (e.cd.bars.acid > 0.04 || e.corrodedT > G.t || (e.w2 && e.w2.snowT > G.t))) { S.carry.add(e); if (S.carry.size > 80) S.carry.delete(S.carry.values().next().value); } });
      wupOn(w, 'tick', (w, dt) => {
        for (const e of S.carry) {
          if (!e.dead) { if (!e.cd || (e.cd.bars.acid < 0.02 && !(e.corrodedT > G.t) && !(e.w2 && e.w2.snowT > G.t))) S.carry.delete(e); continue; }
          S.carry.delete(e);
          const mine = G.zones.filter(z => z.w2house === w && z.life > 0), r = 60;
          let near = mine.find(z => Math.hypot(z.x - e.x, z.y - e.y) < z.r + r);
          if (near) { near.r = Math.min(100, Math.sqrt(near.r * near.r + r * r)); near.life = near.max = Math.max(near.life, 3); ring(near.x, near.y, near.r, W2_PINK, 0.4, 4); w2Mark(w, 'merge'); }
          else { w2Zone(w, e.x, e.y, r, 3, w.s.dmg * 0.6, { w2house: w }); ring(e.x, e.y, r, W2_PINK, 0.4, 3); w2Mark(w, 'house'); }
        }
      });
    } },
  ],
});
// Splatter: 3 droplets (30% damage, 30% Corrosion, so they are ordinary hits that fill the bar) onto others within 60.
function w2Splat(w, e, raw, src, gens) {
  const near = []; forNear(e.x, e.y, 60, o => { if (o !== e && !o.dead && !o.charmed) near.push(o); });
  for (let i = near.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [near[i], near[j]] = [near[j], near[i]]; }
  for (const o of near.slice(0, 3)) {
    const carrying = o.cd && (o.cd.bars.acid > 0.05 || o.corrodedT > G.t || (o.w2 && o.w2.snowT > G.t));
    w2Line(e.x, e.y, o.x, o.y, 3, W2_PINK, 0.18);
    fxParts('drop', e.x, e.y, W2_PINK, 2, 140, 0.3, 3, Math.atan2(o.y - e.y, o.x - e.x), 0.3);
    damageEnemy(o, raw * 0.3, w2Src(src, { atk: 'burst', wupEcho: true, noCrit: true }));
    if (w2Snot(w) && !o.dead && o.cd) w2BarBump(o, 'acid', 0.3 * w2AcidFrac(o, raw), w2Base(w)); // (snot droplets coat too)
    w2Mark(w, 'droplet');
    if (gens > 1 && carrying && !o.dead) w2Splat(w, o, raw, src, gens - 1);
  }
}
// Bad Aftertaste: the residue lets go (70 radius, the dead enemy's Corrosion bar).
function w2Aftertaste(w, e, E) {
  const S = w2s(w), bar = Math.max(e.cd ? e.cd.bars.acid : 0, 0.3), depth = E.depth || 1;
  ring(e.x, e.y, 70, W2_PINK, 0.4, 3); fxParts('drop', e.x, e.y, W2_PINK, 8, 150, 0.5, 3);
  floatText(e.x, e.y - e.r - 6, 'SPLAT', W2_PINK, 11, 0.5);
  const hit = []; forNear(e.x, e.y, 70, o => { if (o !== e && !o.dead && !o.charmed) hit.push(o); });
  for (const o of hit) {
    w2BarBump(o, 'acid', bar, w2Base(w, { wupEcho: true }));
    if (S.pass && depth < 3) { const O = w2E(o); if (!O.res) { O.res = 1; S.marks.add(o); } O.depth = Math.max(O.depth || 0, depth + 1); O.resT = G.t; }
    w2Line(e.x, e.y, o.x, o.y, 2, W2_GRN, 0.2);
  }
  if (S.wet) { w2Zone(w, e.x, e.y, 35, 2, w.s.dmg * 0.5); w2Mark(w, 'wet'); }
  w2Mark(w, 'aftertaste');
}

// ================================================================ 6. RED FLAGSHIP (Static, Beam)
// How long the beam has held its target (Overclocked, Blue Screen). Called from a fire hook.
function w2Hold(w, target) {
  const S = w2s(w);
  if (S.hF === G.frameN) return S.hold;
  S.hF = G.frameN;
  if (S.hTgt !== target || G.t - (S.hLast || 0) > 1.6 || (S.hTgt && S.hTgt.dead)) {
    if (S.hTgt && !S.hTgt.dead && S.hold > 1.2) { ring(S.hTgt.x, S.hTgt.y, S.hTgt.r + 8, '#ffffff', 0.2, 2); w2Mark(w, 'snap'); }
    S.hTgt = target; S.hT0 = G.t; S.hold = 0;
  }
  S.hLast = G.t; S.hold = G.t - S.hT0;
  return S.hold;
}
const w2Full = w => { const S = w2s(w); return S.hTgt && !S.hTgt.dead && S.hold >= 3; };
function w2Charge(e) { e.chargeT = Math.max(e.chargeT || 0, G.t + 3); }
// One second of beam damage.
const w2Sec = w => w.s.dmg / Math.max(0.05, w.s.cd);
function w2Pulse(w, x, y, depth, src0) {
  const S = w2s(w);
  ring(x, y, 60, W2_YEL, 0.3, 3); fxParts('spark', x, y, W2_YEL, 8, 160, 0.3, 2);
  const src = w2Base(w, W2_E), dm = 0.5 * w2Sec(w);
  src.w2depth = depth; src.atk = 'burst';
  const hit = []; forNear(x, y, 60, o => { if (!o.dead && !o.charmed) hit.push(o); });
  for (const o of hit) damageEnemy(o, dm, src);
  w2Mark(w, 'pulse');
}
wupReg('v_shock_beam', {
  A: { name: 'Overclocked', tag: 'HUNT', costs: 'weak against crowds; every switch throws the charge away.', shows: 'the beam thickens and whitens as it charges, then snaps thin when switching.', modes: 'HUNT',
    lv3: { desc: 'The beam hits harder the longer it stays on one target, up to double. Switching targets loses the charge.', apply(w) {
      const S = w2s(w);
      wupOn(w, 'fire', (w, t, src) => {
        const h = w2Hold(w, t), k = clamp(h / 3, 0, 1), p = G.player;
        if (S.fireMaster) return false;
        const d = Math.hypot(t.x - p.x, t.y - p.y), a = Math.atan2(t.y - p.y, t.x - p.x);
        w2Line(p.x, p.y, p.x + Math.cos(a) * Math.min(w.s.range, d + 10), p.y + Math.sin(a) * Math.min(w.s.range, d + 10), 6 + 14 * k, w2Mix(w.def.color, k), 0.1, true);
        if (k >= 1 && !(S.fullT > G.realT)) { S.fullT = G.realT + 0.8; ring(t.x, t.y, t.r + 10, '#ffffff', 0.3, 3); w2Mark(w, 'full'); }
        return false;
      });
      wupOn(w, 'dmg', (w, e, src) => (e === S.hTgt && !src.wupEcho ? 1 + clamp(S.hold / 3, 0, 1) : 1));
    } },
    lv6: [
      { name: 'Hard Interrupt', desc: 'At full charge the beam turns white and carries Poise, so it can interrupt attacks.', apply(w) {
        wupOn(w, 'hit', (w, e, res, src) => {
          const S = w2s(w);
          if (e !== S.hTgt || S.hold < 3 || !res.statusOk || !e.cd) return;
          const r = w2BarBump(e, 'force', 0.2 / COMBAT.rankBarK[e.cd.rank || 'normal'], src);
          if (r) { w2Mark(w, 'interrupt'); floatText(e.x, e.y - e.r - 8, 'INTERRUPT', '#ffffff', 12, 0.7); }
        });
      } },
      { name: 'Static Cling', desc: 'At full charge the held target stays Charged and throws arcs at its neighbours while the beam holds.', apply(w) {
        wupOn(w, 'tick', (w, dt) => {
          const S = w2s(w);
          if (!w2Full(w)) return;
          w2Charge(S.hTgt);
          if (!(S.clingT > G.t)) { S.clingT = G.t + 0.5; fightArc(S.hTgt, w.s.dmg * 6, 3); w2Mark(w, 'cling'); }
        });
      } },
    ],
    wild: { name: 'Screen Burn', desc: 'Where the beam rests for a moment, a ghost of it stays burnt in for a few seconds and keeps zapping.', apply(w) {
      const S = w2s(w); S.ghosts = [];
      wupOn(w, 'fire', (w, t, src) => {
        const p = G.player, a = Math.atan2(t.y - p.y, t.x - p.x);
        if (!S.rest || Math.abs(angDiff(a, S.rest.a)) > 0.12 || Math.hypot(p.x - S.rest.x, p.y - S.rest.y) > 40) S.rest = { a, x: p.x, y: p.y, t0: G.t };
        else if (G.t - S.rest.t0 >= 1) {
          S.rest.t0 = G.t;
          S.ghosts.push({ x1: p.x, y1: p.y, x2: p.x + Math.cos(a) * w.s.range, y2: p.y + Math.sin(a) * w.s.range, life: 3, zt: 0 }); w2Cap(S.ghosts, 4);
          ring(p.x, p.y, 20, W2_YEL, 0.4, 3); w2Mark(w, 'burnin');
        }
        return false;
      });
      wupOn(w, 'tick', (w, dt) => {
        const src = w2Base(w, W2_E); src.atk = 'beam';
        for (const g of S.ghosts) {
          g.life -= dt; g.zt -= dt;
          if (!(g.dT > G.realT)) { g.dT = G.realT + 0.1; w2Line(g.x1, g.y1, g.x2, g.y2, 4, w2Mix(W2_YEL, 0.3), 0.14, true); }
          if (g.zt <= 0) { g.zt = 0.3; const hit = []; for (const e of G.enemies) if (!e.dead && !e.charmed && w2SegDist(e.x, e.y, g.x1, g.y1, g.x2, g.y2) <= e.r + 8) hit.push(e); for (const e of hit) { damageEnemy(e, w.s.dmg * 3, src); w2Mark(w, 'ghostzap'); } }
        }
        S.ghosts = S.ghosts.filter(g => g.life > 0);
      });
    } } },
  B: { name: 'Critical Error', tag: 'ORBIT', costs: '-10% beam damage.', shows: 'little static pops along the beam as enemies die.', modes: 'ORBIT',
    lv3: { desc: 'An enemy killed by the beam bursts in a small Static pulse that hits those nearby. The beam is 10% weaker.', apply(w) {
      const S = w2s(w); S.cascade = 1;
      wupOn(w, 'stats', (w, s) => { s.dmg *= 0.9; });
      wupOn(w, 'kill', (w, e, src) => {
        const d = src.w2depth || 0;
        if (d >= S.cascade) return;
        w2Pulse(w, e.x, e.y, d + 1, src);
      });
    } },
    lv6: [
      { name: 'Cascade Failure', desc: 'A pulse that kills sets off another pulse, a few deep.', apply(w) { w2s(w).cascade = 3; } },
      { name: 'Rolling Blackout', desc: 'Every ten kills, the next one flickers the lights and Charges every enemy you can see.', apply(w) {
        const S = w2s(w); S.kn = 0; S.flick = false;
        wupOn(w, 'kill', (w, e, src) => {
          if (src.w2depth || src.w2jump) return;
          if (S.flick) {
            S.flick = false; S.kn = 0; const p = G.player, R = 560; let n = 0;
            G.fx.push({ type: 'flash', x: p.x, y: p.y, r: R, color: W2_YEL, life: 0.18, max: 0.18 });
            for (const o of G.enemies) if (!o.dead && Math.hypot(o.x - p.x, o.y - p.y) < R) { w2Charge(o); if (n++ < 10) bolt(p.x, p.y, o.x, o.y, W2_YEL, 0.12); }
            floatText(p.x, p.y - 36, 'BLACKOUT', W2_YEL, 14, 0.9); w2Mark(w, 'blackout'); return;
          }
          if (++S.kn >= 10) { S.flick = true; floatText(G.player.x, G.player.y - 36, 'FLICKER READY', W2_YEL, 11, 0.8); }
        });
      } },
    ],
    wild: { name: 'Off and On Again', desc: 'Every few seconds the beam switches off and on again; the restart Charges everything on its line.', apply(w) {
      const S = w2s(w);
      wupOn(w, 'fire', (w, t, src) => {
        const now = G.t, p = G.player;
        if (S.offUntil > now) return true;
        if (!S.offNext) S.offNext = now + 6;
        if (now >= S.offNext) { S.offNext = now + 6.4; S.offUntil = now + 0.4; S.restart = true; floatText(p.x, p.y - 34, 'OFF', '#ffffff', 12, 0.5); ring(p.x, p.y, 16, '#ffffff', 0.4, 2); return true; }
        if (S.restart) {
          S.restart = false; const a = Math.atan2(t.y - p.y, t.x - p.x); let n = 0;
          floatText(p.x, p.y - 34, 'ON', W2_YEL, 12, 0.5);
          for (const e of G.enemies) {
            if (e.dead || e.charmed) continue;
            const tt = Math.max(0, Math.min(w.s.range, (e.x - p.x) * Math.cos(a) + (e.y - p.y) * Math.sin(a)));
            if (Math.hypot(e.x - (p.x + Math.cos(a) * tt), e.y - (p.y + Math.sin(a) * tt)) <= e.r + 12) { w2Charge(e); if (n++ < 10) bolt(p.x, p.y, e.x, e.y, W2_YEL, 0.15); }
          }
          if (n) w2Mark(w, 'restart');
        }
        return false;
      });
    } } },
  C: { name: 'Dead Pixels', tag: 'KITE', costs: '-30% damage on the main line.', shows: 'a jittery beam with sparks either side.', modes: 'KITE',
    lv3: { desc: 'The beam keeps glitching into short zaps either side of its line. The main line is 30% weaker.', apply(w) {
      const S = w2s(w); S.px = [];
      wupOn(w, 'dmg', (w, e, src) => (src.wupEcho || src.w2zap ? 1 : 0.7));
      wupOn(w, 'fire', (w, t, src) => {
        if (G.t - (S.glT || 0) < 0.5) return false;
        S.glT = G.t;
        const p = G.player, a = Math.atan2(t.y - p.y, t.x - p.x), nx = -Math.sin(a), ny = Math.cos(a), sgn = Math.random() < 0.5 ? -1 : 1;
        for (const off of [-34, 34, sgn * 66]) {
          const st = rand(40, 120), ox = p.x + Math.cos(a) * st + nx * off, oy = p.y + Math.sin(a) * st + ny * off;
          w2Beam(w, ox, oy, a, 130, 8, w.s.dmg * 0.5, w2Src(src, { mult: src.mult, wupEcho: true, atk: 'beam' }), w2Mix(w.def.color, 0.3), 0.16);
          if (S.pixels) { S.px.push({ x: ox + Math.cos(a) * 65, y: oy + Math.sin(a) * 65, life: 1, zt: 0 }); w2Cap(S.px, 18); }
        }
        w2Mark(w, 'glitch'); return false;
      });
      wupOn(w, 'tick', (w, dt) => {
        const src = w2Base(w, W2_E); src.atk = 'beam';
        for (const q of S.px) {
          q.life -= dt; q.zt -= dt;
          if (!(q.dT > G.realT)) { q.dT = G.realT + 0.1; w2Line(q.x, q.y, q.x, q.y, 9, W2_YEL, 0.12, false); }
          if (q.zt <= 0) { q.zt = 0.2; const hit = []; forNear(q.x, q.y, 14, e => { if (!e.dead && !e.charmed) hit.push(e); }); for (const e of hit) { damageEnemy(e, w.s.dmg * 2, src); w2Mark(w, 'pixelzap'); } }
        }
        if (S.px.length) S.px = S.px.filter(q => q.life > 0);
      });
    } },
    lv6: [
      { name: 'Stuck Pixels', desc: 'Glitches leave dead spots on the floor for a moment that zap anything crossing them.', apply(w) { w2s(w).pixels = 1; } },
      { name: 'Packet Loss', desc: 'The beam breaks up for good into a fan of short zaps in front of you. Changes the attack to Spread.', apply(w) {
        const S = w2s(w);
        wupOn(w, 'fire', (w, t, src) => {
          if (S.fireMaster || !w2Claim(w)) return false;
          const p = G.player, a = Math.atan2(t.y - p.y, t.x - p.x); p.face = a;
          for (let i = 0; i < 7; i++) w2Beam(w, p.x, p.y, a + (i - 3) * 0.14, 170, 7, w.s.dmg * 0.6, w2Src(src, { mult: src.mult, atk: 'spread', w2zap: 1 }), w.def.color, 0.1);
          w2Mark(w, 'spread'); return true;
        });
      } },
    ],
    wild: { name: 'Wrong Cable', desc: 'The beam fires backwards out of your tail.', apply(w) {
      const S = w2s(w);
      wupOn(w, 'fire', (w, t, src) => {
        if (S.fireMaster || !w2Claim(w)) return false;
        const p = G.player, mv = Math.hypot(p.vx || 0, p.vy || 0), head = mv > 20 ? Math.atan2(p.vy, p.vx) : (p.hd != null ? p.hd : p.face), a = head + Math.PI;
        const hit = w2Beam(w, p.x, p.y, a, w.s.range, 10, w.s.dmg, w2Src(src, { mult: src.mult, atk: 'beam', w2zap: 1 }), w2Mix(W2_YEL, 0.2), 0.12);
        if (!(S.wcT > G.realT)) { S.wcT = G.realT + 0.5; floatText(p.x + Math.cos(a) * 30, p.y + Math.sin(a) * 30 - 10, 'WRONG CABLE', W2_YEL, 10, 0.6); }
        w2Mark(w, hit.length ? 'tailhit' : 'tail'); return true;
      });
    } } },
  lv10: [
    { name: 'Blue Screen of Death', best: 'A', desc: 'An enemy held in the beam for a couple of seconds is staggered and takes five times the damage. Bosses need longer.', apply(w) {
      const S = w2s(w);
      wupOn(w, 'fire', (w, t) => {
        w2Hold(w, t);
        const T = S.hTgt;
        if (T && !T.dead && S.hold >= (T.boss ? 4 : 2)) {
          S.hT0 = G.t; S.hold = 0;
          const E = w2E(T), dur = T.boss ? 0.35 / 0.3 : T.elite ? 0.55 : 0.8;
          E.bsodT = G.t + dur; fightPayoff(T, 'stagger', { raw: 0 }, {});
          G.fx.push({ type: 'flash', x: T.x, y: T.y, r: T.r + 30, color: W2_BSOD, life: 0.2, max: 0.2 });
          ring(T.x, T.y, T.r + 20, W2_BSOD, 0.5, 6); floatText(T.x, T.y - T.r - 14, 'BLUE SCREEN', '#9ec0ff', 14, 1);
          w2Mark(w, 'bsod');
        }
        return false;
      });
      wupOn(w, 'dmg', (w, e, src) => (e.w2 && e.w2.bsodT > G.t ? 5 : 1));
    } },
    { name: 'Multi-Monitor Setup', best: 'BC', desc: 'Four beams in a cross, turning as you swim.', apply(w) {
      const S = w2s(w); S.fireMaster = true; S.cx = S.cx == null ? 0 : S.cx;
      wupOn(w, 'fire', (w, t, src) => {
        if (!w2Claim(w)) return false;
        const p = G.player, mv = Math.hypot(p.vx || 0, p.vy || 0);
        if (mv > 20) S.cx += clamp(angDiff(Math.atan2(p.vy, p.vx), S.cx), -0.25, 0.25);
        else S.cx += 0.01;
        for (let i = 0; i < 4; i++) w2Beam(w, p.x, p.y, S.cx + i * Math.PI / 2, w.s.range, 10, w.s.dmg, w2Src(src, { mult: src.mult, atk: 'beam', w2zap: 1 }), w.def.color, 0.12);
        w2Mark(w, 'cross'); return true;
      });
    } },
    { name: 'Kernel Panic', best: 'B', desc: 'An enemy killed by the beam Charges everything nearby, and the beam jumps to the nearest of them, a few times.', apply(w) {
      wupOn(w, 'kill', (w, e, src) => {
        if (src.w2jump || src.w2depth) return;
        const near = []; forNear(e.x, e.y, 150, o => { if (!o.dead && !o.charmed) near.push(o); });
        for (const o of near) w2Charge(o);
        ring(e.x, e.y, 150, W2_YEL, 0.4, 3);
        const done = new Set([e]), s2 = w2Base(w, { w2jump: 1, atk: 'beam' }); let cur = { x: e.x, y: e.y };
        for (let j = 0; j < 3; j++) {
          let nx = null, bd = 1e9;
          for (const o of near) if (!done.has(o) && !o.dead) { const d = Math.hypot(o.x - cur.x, o.y - cur.y); if (d < bd) { bd = d; nx = o; } }
          if (!nx) break;
          done.add(nx); bolt(cur.x, cur.y, nx.x, nx.y, W2_YEL, 0.18); cur = { x: nx.x, y: nx.y };
          damageEnemy(nx, w.s.dmg * 4, s2); w2Mark(w, 'jump');
        }
        floatText(e.x, e.y - 20, 'KERNEL PANIC', W2_YEL, 12, 0.8);
      });
    } },
  ],
});

// ================================================================ 7. NOCTURNAL EMISSION (Mucus, Pool)
// The traps of this slot, oldest first.
const w2Traps = w => G.zones.filter(z => z.life > 0 && z.src && z.src.w === w);
const w2Snare = e => { fightStatus(e, 'ice', 0, {}); };
// Switched to Parasite (fitcheck.js lets Switched at Birth pick it): Ectoplasm. Pale ghost hands rise out of each puddle and
// grip whatever is in it (held at 50% speed: the Snare's stand-in, since Parasite damage Snares nothing); strands and bogeys
// grip the same way; stuck enemies are PULLED UNDER (two hands hold them down as they sink).
const W2_ECTO = '#e6e0ff', w2Ecto = w => !!(w && w.def && w.def.elem === 'soul' && w24Key(w) === 'v_ice_pool');
const w2NocCol = w => (w2Ecto(w) ? W2_ECTO : W2_GRN);
function w2Grip(w, e, dur) { // the Snare, or a ghost hand's grip
  if (!w2Ecto(w)) return w2Snare(e);
  const E = w2E(e); E.gripT = Math.max(E.gripT || 0, G.t + (dur || 1.5));
  e.chillAmt = Math.max(e.chillAmt || 0, e.boss ? 0.25 : 0.5); e.chill = Math.max(e.chill || 0, dur || 1.5);
  if (!(E.handT > G.realT)) { E.handT = G.realT + 0.35; const a = rand(-1, 1) * 0.6; w2Line(e.x + Math.sin(a) * e.r, e.y + e.r + 10, e.x + Math.sin(a) * e.r * 0.5, e.y, 4, W2_ECTO, 0.25); fxParts('spark', e.x, e.y + e.r, W2_ECTO, 2, 40, 0.4, 2, -Math.PI / 2, 0.4); w2Mark(w, 'grip'); }
}
const w2Gripped = (w, e) => (w2Ecto(w) ? !!(e.w2 && e.w2.gripT > G.t) : snared(e));
// Everything the trap cards share runs here, once a frame, driven by flags the cards set on the slot.
function w2Noc(w, dt) {
  const S = w2s(w), p = G.player, now = G.t, traps = w2Traps(w);
  if (S.maxT && traps.length > S.maxT) { const n = traps.length - S.maxT; for (let i = 0; i < n; i++) traps[i].life = 0.001; traps.splice(0, n); }
  const inside = new Map();
  for (const z of traps) forNear(z.x, z.y, z.r, e => { if (!e.dead && !e.charmed && !e.egg && !inside.has(e)) inside.set(e, z); });
  const prev = S.ins || new Map();
  if (S.grow) { const occ = new Set(inside.values()); for (const z of occ) { z.w2r0 = z.w2r0 || z.r; if (z.r < z.w2r0 * 2) { z.r = Math.min(z.w2r0 * 2, z.r + z.w2r0 * 0.1 * dt); if (!(z.gT > G.realT)) { z.gT = G.realT + 0.5; w2Mark(w, 'grew'); } } } }
  for (const [e, z] of inside) {
    const E = w2E(e);
    if (w2Ecto(w)) w2Grip(w, e, 1);
    if (S.drag) {
      e.chillAmt = Math.max(e.chillAmt, e.boss ? 0.3 : 0.6); e.chill = Math.max(e.chill, 4);
      if (!(E.dragT > G.realT)) { E.dragT = G.realT + 0.3; w2Line(z.x, z.y, e.x, e.y, 3, W2_GRN, 0.16); }
    }
    E.inT = (E.inT || 0) + dt;
    if (S.stick && E.inT >= 1.5 && !(E.stuckCd > now)) w2Stick(w, e, e.boss ? 0.5 : 1.5, 4);
    if (S.glue && !e.boss && !(E.glueCd > now)) { E.glueCd = now + 5; w2Stick(w, e, e.elite ? 1 : 2, 0); e.dazeT = Math.max(e.dazeT || 0, now + (e.elite ? 1 : 2)); w2Mark(w, 'glue'); }
  }
  for (const [e, z] of prev) {
    if (inside.has(e)) continue;
    const E = w2E(e); E.inT = 0;
    if (e.dead) { if (S.bogey && w2Gripped(w, e) && S.bogeys.length < 5) { S.bogeys.push({ x: e.x, y: e.y, a: Math.random() * TAU, life: 6 }); ring(e.x, e.y, 14, W2_GRN, 0.4, 3); floatText(e.x, e.y - 12, 'BOGEY', W2_GRN, 11, 0.7); w2Mark(w, 'bogey'); } continue; }
    if (S.drag) { w2Line(z.x, z.y, e.x, e.y, 5, W2_GRN, 0.4); w2Mark(w, 'snapback'); }
    if (S.strand) { S.strands.push({ x1: z.x, y1: z.y, x2: e.x, y2: e.y, life: 2.5, got: new Set() }); w2Cap(S.strands, 10); w2Mark(w, 'strand'); }
  }
  S.ins = inside;
  // stuck enemies: held where they are
  for (const e of G.enemies) {
    const E = e.w2; if (!E || !(E.stuckUntil > now) || e.dead) continue;
    e.chillAmt = 1; e.chill = Math.max(e.chill, 0.2); e.kx = 0; e.ky = 0;
    if (S.gag) e.dazeT = Math.max(e.dazeT || 0, now + 0.2);
    if (w2Ecto(w) && !(E.ghT > G.realT)) { E.ghT = G.realT + 0.2; w2Line(e.x - e.r, e.y + e.r, e.x - e.r * 0.3, e.y, 3, W2_ECTO, 0.22); w2Line(e.x + e.r, e.y + e.r, e.x + e.r * 0.3, e.y, 3, W2_ECTO, 0.22); } // (two hands holding it down)
    if (!(E.sinkT > G.realT)) { E.sinkT = G.realT + 0.3; ring(e.x, e.y + e.r * 0.4, e.r * 0.7, w2NocCol(w), 0.35, 3); fxParts('bubble', e.x, e.y + e.r * 0.3, w2NocCol(w), 1, 20, 0.6, 2.5, -Math.PI / 2, 0.5); }
  }
  if (S.conj) w2Conjoin(w);
  if (S.guard) for (const z of traps) if (!(z.w2bt > now)) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - z.x, b.y - z.y) < z.r) { b.dead = true; z.w2bt = now + 0.3; spawnPart(b.x, b.y, W2_GRN, 3, 60, 0.25, 2); ring(b.x, b.y, 8, W2_GRN, 0.25, 2); w2Mark(w, 'guard'); break; }
  // strands: left-behind strings, and the net between traps
  if (S.strand || S.net) {
    const segs = [];
    if (S.strand) { for (const g of S.strands) { g.life -= dt; segs.push(g); } S.strands = S.strands.filter(g => g.life > 0); }
    if (S.net) {
      const R = S.netR || 200;
      for (let i = 0; i < traps.length; i++) for (let j = i + 1; j < traps.length; j++) {
        const a = traps[i], b = traps[j]; if (Math.hypot(a.x - b.x, a.y - b.y) > R) continue;
        segs.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, net: 1 });
      }
    }
    S.stT = (S.stT || 0) - dt;
    if (S.stT <= 0) {
      S.stT = 0.1;
      for (const g of segs) {
        w2Line(g.x1, g.y1, g.x2, g.y2, g.net ? 3 : 2.5, w2Ecto(w) ? W2_ECTO : w2Mix(W2_GRN, 0.4), 0.16);
        for (const e of G.enemies) {
          if (e.dead || e.charmed || e.egg) continue;
          if (Math.abs(e.x - (g.x1 + g.x2) / 2) > Math.abs(g.x1 - g.x2) / 2 + e.r + 8 || Math.abs(e.y - (g.y1 + g.y2) / 2) > Math.abs(g.y1 - g.y2) / 2 + e.r + 8) continue;
          if (w2SegDist(e.x, e.y, g.x1, g.y1, g.x2, g.y2) > e.r + 6) continue;
          const E = w2E(e);
          if (g.net) { if (E.netT > now) continue; E.netT = now + 1.2; } else { if (g.got.has(e)) continue; g.got.add(e); }
          w2Grip(w, e); w2Mark(w, g.net ? 'netsnare' : 'strandsnare');
          ring(e.x, e.y, e.r + 4, w2NocCol(w), 0.3, 3);
          if (S.twang && g.net) { let bt = null, bd = 1e9; for (const z of traps) { const d = Math.hypot(z.x - e.x, z.y - e.y); if (d < bd) { bd = d; bt = z; } } if (bt) { E.pull = { x: bt.x, y: bt.y, t: 0.5 }; w2Mark(w, 'twang'); } }
        }
      }
    }
  }
  for (const e of G.enemies) { const E = e.w2; if (E && E.pull && !e.dead) { E.pull.t -= dt; w2Pull(e, E.pull.x, E.pull.y, 260, dt); if (E.pull.t <= 0) E.pull = null; } }
  // bogeys roll slowly, Snaring what they touch for 3 s
  if (S.bogey) {
    for (const b of S.bogeys) {
      b.life -= dt; b.x += Math.cos(b.a) * 40 * dt; b.y += Math.sin(b.a) * 40 * dt;
      if (!(b.dT > G.realT)) { b.dT = G.realT + 0.1; w2Line(b.x, b.y, b.x, b.y, 12, W2_GRN, 0.12); }
      forNear(b.x, b.y, 12, e => { if (e.dead || e.charmed) return; w2Grip(w, e, 3); e.snareT = Math.max(e.snareT, now + 3); e.chill = Math.max(e.chill, 3); if (!(b.tT > G.realT)) { b.tT = G.realT + 0.5; ring(e.x, e.y, e.r + 4, W2_GRN, 0.3, 3); w2Mark(w, 'bogeysnare'); } });
    }
    S.bogeys = S.bogeys.filter(b => b.life > 0);
  }
  // Snot Bubbles drift after the nearest enemy and splat
  if (S.bubbles && S.bubbles.length) {
    for (const b of S.bubbles) {
      b.life -= dt;
      const t = acquire('nearest', 700, b.x, b.y);
      if (t) { const d = Math.hypot(t.x - b.x, t.y - b.y) || 1; b.x += (t.x - b.x) / d * 90 * dt; b.y += (t.y - b.y) / d * 90 * dt; if (d < t.r + 14) { b.life = 0; w2Splat2(w, b.x, b.y, t); continue; } }
      else { b.x += (p.x - b.x) * 0.5 * dt; b.y += (p.y - b.y) * 0.5 * dt - 10 * dt; }
      if (!(b.dT > G.realT)) { b.dT = G.realT + 0.1; w2Line(b.x, b.y, b.x, b.y, 16 + 2 * Math.sin(G.realT * 6), w2Mix(W2_GRN, 0.3), 0.12); }
    }
    S.bubbles = S.bubbles.filter(b => b.life > 0);
  }
  // Snotwork Everywhere: a trap every second as you swim
  if (S.carpet) {
    S.cpT = (S.cpT || 0) - dt;
    if (S.cpT <= 0) {
      if (S.cpX == null || Math.hypot(p.x - S.cpX, p.y - S.cpY) > 12) { S.cpX = p.x; S.cpY = p.y; S.cpT = 1; w2Zone(w, p.x, p.y, w.s.area, w.s.dur, w.s.dmg * 0.9, { src: weaponSrc(w) }); ring(p.x, p.y, w.s.area, W2_GRN, 0.4, 3); w2Mark(w, 'carpet'); }
      else S.cpT = 0.2;
    }
  }
}
function w2Splat2(w, x, y, t) { // a Snot Bubble lands
  ring(x, y, 30, W2_GRN, 0.4, 4); fxParts('drop', x, y, W2_GRN, 8, 140, 0.5, 3); floatText(x, y - 14, 'SPLAT', W2_GRN, 11, 0.6);
  damageEnemy(t, w.s.dmg * 2, w2Base(w, { wupEcho: true, atk: 'pool' }));
  w2Zone(w, x, y, w.s.area * 0.5, w.s.dur * 0.6, w.s.dmg * 0.9, { src: weaponSrc(w) });
  w2Mark(w, 'bubblesplat');
}
function w2Stick(w, e, dur, cd) {
  const E = w2E(e); E.stuckUntil = G.t + dur; E.stuckCd = G.t + cd;
  const c = w2NocCol(w); ring(e.x, e.y, e.r + 6, c, 0.5, 4); floatText(e.x, e.y - e.r - 8, w2Ecto(w) ? 'PULLED UNDER' : 'STUCK', c, 11, 0.7); w2Mark(w, 'stuck');
}
function w2Conjoin(w) {
  const now = G.t, st = G.enemies.filter(e => !e.dead && e.w2 && e.w2.stuckUntil > now && !(e.conjT > now) && !(e.conjCd > now));
  for (let i = 0; i < st.length; i++) {
    const a = st[i]; if (a.conjT > now) continue;
    for (let j = i + 1; j < st.length; j++) {
      const b = st[j]; if (b.conjT > now || Math.hypot(a.x - b.x, a.y - b.y) > a.r + b.r + 50) continue;
      const grp = [a, b];
      for (let k = j + 1; k < st.length && grp.length < 3; k++) { const c = st[k]; if (!(c.conjT > now) && grp.some(g => Math.hypot(g.x - c.x, g.y - c.y) < g.r + c.r + 50)) grp.push(c); }
      for (const q of grp) { q.conjT = now + 3; q.conjCd = now + 6; q.conjWith = grp.find(o => o !== q); q.frozen = Math.max(q.frozen, q.boss ? 0.5 : 3); }
      for (let k = 1; k < grp.length; k++) w2Line(grp[0].x, grp[0].y, grp[k].x, grp[k].y, 4, W2_GRN, 0.5);
      floatText((a.x + b.x) / 2, (a.y + b.y) / 2 - 14, 'CONJOINED', W2_GRN, 11, 0.7); w2Mark(w, 'conjoined');
      break;
    }
  }
}
// Registers the shared trap engine on a slot, once.
function w2NocOn(w) { const S = w2s(w); if (S.nocOn) return S; S.nocOn = 1; S.strands = []; S.bogeys = []; S.bubbles = []; wupOn(w, 'tick', w2Noc); return S; }
wupReg('v_ice_pool', {
  A: { name: 'Extra Strength Snot', tag: 'KITE', costs: 'the trap lasts 25% less time.', shows: 'thick green drag lines and strands snapping back.', modes: 'KITE',
    lv3: { desc: 'Snared enemies crawl through the trap and stay slowed after leaving it. Traps last a quarter less time.', apply(w) {
      const S = w2NocOn(w); S.drag = 1;
      wupOn(w, 'stats', (w, s) => { s.dur *= 0.75; });
    } },
    lv6: [
      { name: 'Stringy', desc: 'Enemies leaving the trap drag a strand behind them, and the next enemy to cross it is Snared too.', apply(w) { w2NocOn(w).strand = 1; } },
      { name: 'Rising Damp', desc: 'The trap grows every second something is Snared in it, up to double size.', apply(w) { w2NocOn(w).grow = 1; } },
    ],
    wild: { name: 'Floater', desc: 'Now and then a trap floats up as a bubble, drifts after the nearest enemy and splats on it.', apply(w) {
      const S = w2NocOn(w);
      wupOn(w, 'fire', (w, t, src) => {
        S.bn = (S.bn || 0) + 1;
        if (S.bn % 4 || !w2Claim(w)) return false;
        const p = G.player; S.bubbles.push({ x: p.x, y: p.y - 20, life: 7 }); w2Cap(S.bubbles, 3);
        floatText(p.x, p.y - 34, 'BUBBLE', W2_GRN, 11, 0.7); w2Mark(w, 'bubble'); return true;
      });
    } } },
  B: { name: 'Bogged Down', tag: 'HOLD', costs: 'one trap at a time.', shows: 'a stuck enemy sinks a little into the snot.', modes: 'HOLD, NEST',
    lv3: { desc: 'An enemy that stays in the trap a moment gets stuck fast. Only one trap down at a time.', apply(w) {
      const S = w2NocOn(w); S.stick = 1; S.maxT = 1;
    } },
    lv6: [
      { name: 'Bad Company', desc: 'Two stuck enemies close together become Conjoined, up to three in a group.', apply(w) { w2NocOn(w).conj = 1; } },
      { name: 'Gag Reflex', desc: 'Stuck enemies cannot attack.', apply(w) { w2NocOn(w).gag = 1; } },
    ],
    wild: { name: 'Sneeze Guard', desc: 'Traps block enemy shots that cross them.', apply(w) { w2NocOn(w).guard = 1; } } },
  C: { name: 'Snotwork', tag: 'KITE', costs: 'each trap is 30% smaller.', shows: 'glistening strands between puddles, enemies twanging into them.', modes: 'KITE, ORBIT',
    lv3: { desc: 'Nearby traps are joined by stretchy strands that Snare anything crossing them. Each trap is 30% smaller.', apply(w) {
      const S = w2NocOn(w); S.net = 1; S.netR = 200; S.maxT = 2;
      wupOn(w, 'stats', (w, s) => { s.area *= 0.7; });
    } },
    lv6: [
      { name: 'Spare Hankies', desc: 'Twice as many traps can be down at once.', apply(w) { w2NocOn(w).maxT = 4; } },
      { name: 'Twang', desc: 'An enemy crossing a strand is pulled along it to the nearest trap.', apply(w) { w2NocOn(w).twang = 1; } },
    ],
    wild: { name: 'Bogey Man', desc: 'An enemy that dies Snared in a trap leaves a bogey that rolls along, Snaring what it touches.', apply(w) { w2NocOn(w).bogey = 1; } } },
  lv10: [
    { name: 'Snot Ocean', best: 'A', desc: 'Traps are three times the size and last twice as long.', apply(w) {
      wupOn(w, 'stats', (w, s) => { s.area *= 3; s.dur *= 2; });
      wupOn(w, 'tick', (w, dt) => { const S = w2s(w); if (!(S.ocT > G.realT)) { S.ocT = G.realT + 0.8; for (const z of w2Traps(w)) if (!z.w2oc) { z.w2oc = 1; ring(z.x, z.y, z.r, W2_GRN, 0.6, 6); w2Mark(w, 'ocean'); } } });
    } },
    { name: 'Superglue', best: 'B', desc: 'Anything Snared in a trap is stuck solid for a moment: no moving, no attacking. Elites for less; bosses are only slowed.', apply(w) { w2NocOn(w).glue = 1; } },
    { name: 'Snotwork Everywhere', best: 'C', desc: 'A trap drops every second as you swim, and strands join all of them.', apply(w) { const S = w2NocOn(w); S.carpet = 1; S.net = 1; S.netR = 360; S.maxT = 8; } },
  ],
});

// ================================================================ 8. LITTLE PRICK (Blood, Projectile)
const W2_BLEED_BY = 'Little Prick';
// Little Prick switched to Parasite (fitcheck.js lets Switched at Birth pick it): voodoo pins. Bleed stacks stay, drawn as
// pale pins; a full pincushion is Possessed; Open Wound's pool makes crossers flinch; Sutures yanks crossers back;
// Reef Knot Possesses the knot; Terminal Clause's spirit slams the nearest enemy; Exsanguinate's Possessed burst in pins.
const W2_PIN = '#e6e0ff', w2Voodoo = w => !!(w && w.def && w.def.elem === 'soul');
function w2Possess(w, e) { if (e.dead || e.boss || e.charmed) return false; fightPayoff(e, 'possess', { raw: 0 }, Object.assign(weaponSrc(w), { wupEcho: true, noProc: true })); if (!e.charmed) return false; const S = w2s(w); (S.poss || (S.poss = new Set())).add(e); return true; }
// A Bleed stack beyond the engine's three: the engine's own list holds 3, extras wait in e.w2.bx and tick the same way.
function w2BleedAdd(e, dps, cap) {
  const E = w2E(e), b = e.bleeds || (e.bleeds = []), bx = E.bx || (E.bx = []);
  if (b.length < 3) { b.push({ dps, t: 3, by: W2_BLEED_BY }); return true; }
  if (b.length + bx.length < cap) { bx.push({ dps, t: 3, by: W2_BLEED_BY }); return true; }
  const o = bx.length ? bx[0] : b[0]; o.t = 3; o.dps = Math.max(o.dps, dps); return false;
}
const w2Stacks = e => (e.bleeds ? e.bleeds.length : 0) + (e.w2 && e.w2.bx ? e.w2.bx.length : 0);
// Runs before the engine adds this hit's own stack: stash the one it will push out, so the total can reach the cap.
function w2BleedHit(w, e, res, src, extra, cap) {
  if (!res.statusOk || src.noStatus || e.dead) return;
  const dps = res.raw * 0.3 / 3, b = e.bleeds || (e.bleeds = []), E = w2E(e), bx = E.bx || (E.bx = []);
  for (let i = 0; i < extra + (w2Voodoo(w) ? 1 : 0); i++) w2BleedAdd(e, dps, cap); // (Parasite: the engine adds no Bleed of its own, so the pin is added here)
  if (b.length >= 3 && b.length + bx.length < cap) bx.push(b[0]);
  const S = w2s(w); S.bled.add(e); if (S.bled.size > 80) S.bled.delete(S.bled.values().next().value);
}
// Parasite stands in for Blood's own Bleed on the promises that do not add stacks themselves (Needlework, Final Prick):
// each hit leaves a pin (cap 3), checked at hit time so a later switch counts too.
function w2PinBase(w) {
  const S = w2BleedOn(w, 3); if (S.pinBase) return; S.pinBase = 1;
  wupOn(w, 'hit', (w, e, res, src) => { if (w2Voodoo(w)) w2BleedHit(w, e, res, src, 0, w2s(w).cap); });
}
// Registers the shared Bleed bookkeeping on a slot, once: extra stacks tick, dots over the target, deaths are noticed.
function w2BleedOn(w, cap) {
  const S = w2s(w);
  S.cap = Math.max(S.cap || 3, cap);
  if (S.bleedOn) return S; S.bleedOn = 1; S.bled = new Set();
  wupOn(w, 'tick', (w, dt) => {
    for (const e of S.bled) {
      const E = w2E(e), n = w2Stacks(e);
      if (e.dead) { S.bled.delete(e); if (n > 0 || E.hadBleed) w2BleedDeath(w, e, E, n); continue; }
      if (E.bx && E.bx.length) {
        let d = 0; for (const b of E.bx) { d += b.dps * Math.min(dt, b.t); b.t -= dt; }
        E.bx = E.bx.filter(b => b.t > 0);
        if (d > 0) damageEnemy(e, d, { elem: w2Voodoo(w) ? 'soul' : 'arcane', dot: true, noCrit: true, noStatus: true, noArc: true, wname: W2_BLEED_BY + ' (bleeding)' });
        if (e.dead) continue;
      }
      if (n > 0) { E.hadBleed = 1; w2Pips(e, n, w2Voodoo(w) ? W2_PIN : W2_RED); if (w2Voodoo(w) && S.cap >= 6 && n >= S.cap && w2Possess(w, e)) { floatText(e.x, e.y - e.r - 12, 'PINCUSHION', W2_PIN, 12, 0.8); ring(e.x, e.y, e.r + 8, W2_PIN, 0.5, 4); w2Mark(w, 'voodoo'); } } else if (!(E.bx && E.bx.length)) S.bled.delete(e);
      if (S.exsang && w2Voodoo(w) && S.poss) for (const q of S.poss) if (q.dead || !q.charmed) { // Voodoo Doll: a Possessed enemy's end bursts in pins
        S.poss.delete(q); ring(q.x, q.y, 90, W2_PIN, 0.5, 4); fxParts('spark', q.x, q.y, W2_PIN, 10, 160, 0.4, 2); w2Mark(w, 'pinburst');
        forNear(q.x, q.y, 90, o => { if (o !== q && !o.dead && !o.charmed) { w2BleedAdd(o, w.s.dmg * 0.1, S.cap); S.bled.add(o); } });
      }
      if (S.leak && n >= S.cap && !(E.leakT > G.t)) {
        E.leakT = G.t + 1;
        let o = null, bd = 170; for (const q of G.enemies) { if (q.dead || q === e || q.charmed) continue; const d = Math.hypot(q.x - e.x, q.y - e.y); if (d < bd) { bd = d; o = q; } }
        if (o) { const dps = (e.bleeds && e.bleeds[0] ? e.bleeds[0].dps : w.s.dmg * 0.1); w2BleedAdd(o, dps, S.cap); S.bled.add(o); w2Line(e.x, e.y, o.x, o.y, 2, w2Voodoo(w) ? W2_PIN : W2_RED, 0.3); fxParts(w2Voodoo(w) ? 'spark' : 'drop', e.x, e.y, W2_RED, 2, 80, 0.5, 2.5, Math.atan2(o.y - e.y, o.x - e.x), 0.4); w2Mark(w, 'leak'); }
      }
    }
  });
  return S;
}
function w2BleedDeath(w, e, E, n) {
  const S = w2s(w), maxHp = G.P.maxHp;
  if (S.pool) { // Open Wound: twice the blood pool, and it makes the next crossers bleed
    const z = w2Zone(w, e.x, e.y, 70, 3, 0, { quiet: true, w2wound: 1, got: new Set() });
    if (z) { z.src = w2Base(w, W2_E); ring(e.x, e.y, 70, W2_RED, 0.5, 4); w2Mark(w, 'woundpool'); }
  }
  if (S.exsang) { // kills of bleeding enemies heal you double
    const win = S.hw || (S.hw = { t0: G.t, amt: 0 });
    if (G.t - win.t0 > 1) { win.t0 = G.t; win.amt = 0; }
    const h = Math.min(0.01 * maxHp, 6 - win.amt);
    if (h > 0) { win.amt += h; healPlayer(h, true); floatText(e.x, e.y - 14, '+' + Math.max(1, Math.round(h)), '#ff758f', 11, 0.6); w2Mark(w, 'exsang'); }
  }
}
function w2PoolTick(w) { // Open Wound: pools hand out a Bleed stack to each enemy that crosses them once
  const S = w2s(w);
  for (const z of G.zones) if (z.w2wound && z.life > 0 && z.src && z.src.w === w) {
    forNear(z.x, z.y, z.r, e => { if (e.dead || z.got.has(e)) return; z.got.add(e); w2BleedAdd(e, w.s.dmg * 0.1, S.cap); S.bled.add(e); if (w2Voodoo(w) && !e.boss) { e.frozen = Math.max(e.frozen || 0, 0.5); floatText(e.x, e.y - e.r - 8, '!', W2_PIN, 12, 0.5); } ring(e.x, e.y, e.r + 4, w2Voodoo(w) ? W2_PIN : W2_RED, 0.3, 3); w2Mark(w, 'woundbleed'); });
  }
}
// A needle's damage climbs with every enemy it has passed through (Needlework).
function w2Ramp(pr, k) {
  let base = pr.dmg;
  Object.defineProperty(pr, 'dmg', { configurable: true, enumerable: true, get() { return base * Math.pow(1 + k, this.nHit || 0); }, set(v) { base = v / Math.pow(1 + k, this.nHit || 0); } });
}
function w2Needlework(w) { // threads, knots and the red line behind a piercing needle
  const S = w2s(w);
  w2Track(w);
  for (const pr of S.fresh) { w2Ramp(pr, 0.1); }
  for (const pr of S.live.concat(S.gone)) { // (a needle that dies on its 5th enemy still ties its knot)
    if (!pr.nHit) continue;
    if (pr.w2fx == null) { pr.w2fx = pr.x; pr.w2fy = pr.y; }
    w2Line(pr.w2fx, pr.w2fy, pr.x, pr.y, 2, W2_RED, 0.1);
    if (S.thread && pr.nHit >= 3 && !pr.w2th) { pr.w2th = 1; S.threads.push({ x1: pr.w2fx, y1: pr.w2fy, x2: pr.x, y2: pr.y, life: 2, got: new Set() }); w2Cap(S.threads, 8); w2Mark(w, 'thread'); }
    if (S.knot && pr.nHit >= 5 && !pr.w2kn) {
      pr.w2kn = 1;
      const es = G.enemies.filter(e => !e.dead && pr.hits && pr.hits.includes(e.id)).slice(0, 5);
      if (es.length >= 2) {
        const cx = es.reduce((a, e) => a + e.x, 0) / es.length, cy = es.reduce((a, e) => a + e.y, 0) / es.length;
        S.knots.push({ es, cx, cy, t: 0.45 }); w2Cap(S.knots, 4);
        const vd = w2Voodoo(w);
        for (const e of es) { w2BleedAdd(e, w.s.dmg * 0.1, S.cap); S.bled.add(e); w2Line(e.x, e.y, cx, cy, 2.5, vd ? W2_PIN : W2_RED, 0.4); if (vd) w2Possess(w, e); } // (Parasite: the knot is a ragdoll on your side)
        ring(cx, cy, 24, vd ? W2_PIN : W2_RED, 0.5, 4); floatText(cx, cy - 16, vd ? 'RAGDOLL' : 'KNOT', vd ? W2_PIN : W2_RED, 12, 0.7); w2Mark(w, 'knot');
      }
    }
  }
}
function w2NeedleTick(w, dt) {
  const S = w2s(w);
  w2Needlework(w);
  for (const t of S.threads) {
    t.life -= dt;
    if (!(t.dT > G.realT)) { t.dT = G.realT + 0.1; w2Line(t.x1, t.y1, t.x2, t.y2, 1.8, W2_RED, 0.14); }
    for (const e of G.enemies) if (!e.dead && !e.charmed && !t.got.has(e) && w2SegDist(e.x, e.y, t.x1, t.y1, t.x2, t.y2) <= e.r + 4) { t.got.add(e); w2BleedAdd(e, w.s.dmg * 0.1, S.cap); S.bled.add(e); ring(e.x, e.y, e.r + 4, W2_RED, 0.3, 3); w2Mark(w, 'threadbleed');
      if (w2Voodoo(w) && !e.boss) { const dx = t.x1 - t.x2, dy = t.y1 - t.y2, l = Math.hypot(dx, dy) || 1; e.kx += dx / l * 420; e.ky += dy / l * 420; w2Mark(w, 'yank'); } }
  }
  S.threads = S.threads.filter(t => t.life > 0);
  for (const k of S.knots) { k.t -= dt; for (const e of k.es) if (!e.dead) w2Pull(e, k.cx, k.cy, 320, dt); }
  S.knots = S.knots.filter(k => k.t > 0);
}
wupReg('v_arcane_proj', {
  A: { name: 'Bleeding Heart', tag: 'KITE', costs: '-30% direct damage.', shows: 'growing pulsing marks on the target, drips between enemies.', modes: 'KITE',
    lv3: { desc: 'Every hit adds a Bleed stack and the Bleed cap doubles. Direct hits are 30% weaker.', apply(w) {
      const S = w2BleedOn(w, 6);
      wupOn(w, 'dmg', (w, e, src) => (src.wupEcho ? 1 : 0.7));
      wupOn(w, 'hit', (w, e, res, src) => w2BleedHit(w, e, res, src, 0, S.cap));
    } },
    lv6: [
      { name: 'Leaky', desc: 'An enemy at the Bleed cap leaks, splashing Bleed stacks onto the nearest enemy.', apply(w) { w2s(w).leak = 1; } },
      { name: 'Open Wound', desc: 'A bleeding enemy that dies leaves a large blood pool; enemies crossing it gain a Bleed stack.', apply(w) {
        const S = w2s(w); S.pool = 1;
        wupOn(w, 'tick', w2PoolTick);
      } },
    ],
    wild: { name: 'Sewing Circle', desc: 'Needles that miss loop round you once and fly out again.', apply(w) {
      wupOn(w, 'tick', (w, dt) => {
        const S = w2Track(w);
        for (const pr of S.fresh) pr.reunion = 1;
        for (const pr of S.live) if (pr.reunited && !pr.w2fix) { pr.w2fix = 1; pr.orbitT = Math.min(pr.orbitT, 1.05); ring(pr.x, pr.y, 10, W2_RED, 0.3, 2); w2Mark(w, 'circle'); }
      });
    } } },
  B: { name: 'Needlework', tag: 'KITE', costs: 'fires 25% slower.', shows: 'a red thread trailing the needle through the line.', modes: 'KITE',
    lv3: { desc: 'Needles pierce a line of enemies, each one taking a little more than the last. Fires 25% slower.', apply(w) {
      const S = w2s(w); S.threads = []; S.knots = [];
      w2PinBase(w);
      wupOn(w, 'stats', (w, s) => { s.pierce = Math.max(s.pierce || 0, 4); s.cd *= 1.25; });
      wupOn(w, 'tick', w2NeedleTick);
    } },
    lv6: [
      { name: 'Sutures', desc: 'A needle that pierces three or more leaves a thread between the first and last enemy that Bleeds anything crossing it.', apply(w) { w2s(w).thread = 1; } },
      { name: 'Reef Knot', desc: 'A needle that pierces five enemies sews them together into a knot, and each takes a Bleed stack.', apply(w) { w2s(w).knot = 1; } },
    ],
    wild: { name: 'Tattoo', desc: 'An enemy hit five times gets a small heart tattoo; when it dies you heal a little.', apply(w) {
      const S = w2s(w); S.tat = new Set();
      wupOn(w, 'hit', (w, e) => {
        const E = w2E(e); E.tc = (E.tc || 0) + 1;
        if (E.tc >= 5 && !E.tattoo) { E.tattoo = 1; S.tat.add(e); ring(e.x, e.y, e.r + 8, W2_RED, 0.5, 4); floatText(e.x, e.y - e.r - 10, 'TATTOO', W2_RED, 11, 0.8); w2Mark(w, 'tattoo'); }
      });
      wupOn(w, 'tick', (w, dt) => {
        for (const e of S.tat) {
          if (e.dead) { S.tat.delete(e); healPlayer(G.P.maxHp * 0.01, true); floatText(e.x, e.y - 14, '<3', '#ff758f', 12, 0.8); ring(e.x, e.y, e.r + 10, '#ff758f', 0.5, 3); w2Mark(w, 'tattooheal'); continue; }
          const E = w2E(e); if (!(E.heartT > G.realT)) { E.heartT = G.realT + 0.7; floatText(e.x, e.y - e.r - 6, '<3', W2_RED, 9, 0.6); }
        }
      });
    } } },
  C: { name: 'Final Prick', tag: 'COLLECT', costs: '-25% damage to enemies above half health.', shows: 'a red pinprick flash and a ding on the finishing blow.', modes: 'COLLECT',
    lv3: { desc: 'Double damage to badly hurt enemies, but 25% less to healthy ones.', apply(w) {
      w2PinBase(w);
      wupOn(w, 'dmg', (w, e, src) => { const f = e.hp / e.maxHp; return f < 0.3 ? 2 : f > 0.5 ? 0.75 : 1; });
      wupOn(w, 'hit', (w, e) => { if (e.hp / e.maxHp < 0.3) { G.fx.push({ type: 'flash', x: e.x, y: e.y, r: 10 + e.r * 0.4, color: '#ff3d5a', life: 0.1, max: 0.1 }); w2Mark(w, 'pinprick'); } });
      wupOn(w, 'kill', (w, e) => { floatText(e.x, e.y - e.r - 8, 'ding', '#ff758f', 11, 0.6); w2Mark(w, 'ding'); });
    } },
    lv6: [
      { name: 'Next, Please', desc: 'A kill fires a free needle at the next-weakest enemy nearby.', apply(w) {
        wupOn(w, 'kill', (w, e, src) => {
          if (src.w2free) return;
          const t = acquire('lowhp', 300, e.x, e.y, e); if (!t) return;
          const s2 = w2Base(w, { w2free: 1 }); s2.mult = weaponSrc(w).mult;
          if (w2Shoot(w, t, s2, 0, {}, e.x, e.y)) { w2Line(e.x, e.y, t.x, t.y, 1.5, W2_RED, 0.2); floatText(e.x, e.y - 14, 'NEXT', W2_RED, 10, 0.5); w2Mark(w, 'next'); }
        });
      } },
      { name: 'Terminal Clause', desc: 'A needle that hits a bleeding enemy on very low health kills it outright. Never bosses.', apply(w) {
        wupOn(w, 'hit', (w, e, res) => {
          if (e.boss || e.dead || !w2Bleeding(e)) return;
          if (e.hp < e.maxHp * (e.elite ? 0.08 : 0.15)) {
            e.hp = 0; ring(e.x, e.y, e.r + 8, W2_RED, 0.4, 4); floatText(e.x, e.y - e.r - 10, w2Voodoo(w) ? 'GAVE UP THE GHOST' : 'FINE PRINT', w2Voodoo(w) ? W2_PIN : W2_RED, 11, 0.7); w2Mark(w, 'clause');
            if (w2Voodoo(w)) { const o = acquire('nearest', 260, e.x, e.y, e); if (o) { w2Line(e.x, e.y, o.x, o.y, 3, W2_PIN, 0.3); damageEnemy(o, w.s.dmg * 3, Object.assign(weaponSrc(w), { wupEcho: true, wname: 'Little Prick (spirit)' })); w2Mark(w, 'spirit'); } }
          }
        });
      } },
    ],
    wild: { name: 'Vaccination', desc: 'Each needle kill makes you immune to the next status that would hit you for a few seconds.', apply(w) {
      const S = w2s(w); S.vacc = 0; S.vseen = new WeakSet();
      wupOn(w, 'kill', (w, e, src) => {
        const D = pdef(); S.vacc = G.t + 3; S.vsnap = null;
        S.vseen = new WeakSet(); if (D.bleeds) for (const b of D.bleeds) S.vseen.add(b);
        const p = G.player; ring(p.x, p.y, p.r + 12, '#8ac926', 0.5, 3); w2Mark(w, 'armed');
      });
      wupOn(w, 'tick', (w, dt) => {
        if (!(S.vacc > G.t)) return;
        const D = pdef(), pv = S.vsnap || { sn: D.snareT || 0, bu: D.burnT || 0, ch: D.chargeT || 0, bp: D.burnPool || 0 };
        let hit = false;
        if ((D.snareT || 0) > pv.sn && D.snareT > G.t) { D.snareT = pv.sn; hit = true; }
        if (D.bleeds) { const fresh = D.bleeds.filter(b => !S.vseen.has(b)); if (fresh.length) { D.bleeds = D.bleeds.filter(b => S.vseen.has(b)); hit = true; } }
        if ((D.burnT || 0) > pv.bu + 1e-6) { D.burnT = pv.bu; D.burnPool = pv.bp; hit = true; }
        if ((D.chargeT || 0) > pv.ch && D.chargeT > G.t) { D.chargeT = pv.ch; hit = true; }
        if (hit) { S.vacc = 0; S.vsnap = null; const p = G.player; ring(p.x, p.y, p.r + 16, '#8ac926', 0.6, 5); floatText(p.x, p.y - 34, 'IMMUNE', '#8ac926', 13, 0.9); w2Mark(w, 'immune'); }
        else { S.vsnap = { sn: D.snareT || 0, bu: D.burnT || 0, ch: D.chargeT || 0, bp: D.burnPool || 0 }; if (D.bleeds) for (const b of D.bleeds) S.vseen.add(b); }
      });
    } } },
  lv10: [
    { name: 'Exsanguinate', best: 'A', desc: 'Every hit adds several Bleed stacks, and killing bleeding enemies heals you twice as much.', apply(w) {
      const S = w2BleedOn(w, 6); S.exsang = 1;
      wupOn(w, 'hit', (w, e, res, src) => w2BleedHit(w, e, res, src, 2, S.cap));
    } },
    { name: 'Pin Cushion', best: 'B', desc: 'Each shot is a volley of eight needles, each homing on a different enemy.', apply(w) {
      const S = w2s(w); S.fireMaster = true;
      wupOn(w, 'fire', (w, t, src) => {
        if (!w2Claim(w)) return false;
        const p = G.player, ts = acquireMany(aimDir(w), w.s.range, p.x, p.y, 8);
        if (!ts.length) return false;
        for (let i = 0; i < 8; i++) {
          const q = ts[i % ts.length], pr = w2Shoot(w, q, src, 0, { homing: 8, tgt: q, dmg: w.s.dmg * 0.5 });
          if (pr && ts.length > 1 && i < ts.length) w2Line(p.x, p.y, q.x, q.y, 1.5, W2_RED, 0.12);
        }
        w2Mark(w, 'volley'); return true;
      });
    } },
    { name: 'Coup de Grace', best: 'C', desc: 'Any badly hurt enemy hit by a needle dies. Elites must be lower; bosses take triple damage instead.', apply(w) {
      wupOn(w, 'dmg', (w, e) => (e.boss && e.hp < e.maxHp * 0.25 ? 3 : 1));
      wupOn(w, 'hit', (w, e) => {
        if (e.boss || e.dead) return;
        if (e.hp < e.maxHp * (e.elite ? 0.12 : 0.25)) { e.hp = 0; ring(e.x, e.y, e.r + 10, W2_RED, 0.5, 5); floatText(e.x, e.y - e.r - 10, 'COUP DE GRACE', W2_RED, 12, 0.8); w2Mark(w, 'coup'); }
      });
    } },
  ],
});
