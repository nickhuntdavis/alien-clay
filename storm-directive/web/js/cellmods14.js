'use strict';
// Spawn Prawn - weapon cells, part 6: Rent Free and Chest Burster (redesign docs/MODIFIER_MATRIX.md 5.12, plus those two
// rows of every table in sections 3 and 4; Claude's picks, built 24 Oct). Same engine as cellmods.js (XC_W masking, rank 1
// to 3 then the mastery, no fork screens). Card text: cell_rn_<modifier> / cell_cb_<modifier> in cellcopy14.js.
//  - RENT FREE (v_soul_proj, tag rf): a slow Alien ghost. A cell possession (c6Poss) uses the game's own Possessed state
//    (chem.js curseFoe: the enemy fights its mates), at most 6 hosts a weapon, never bosses, half as long on elites.
//    Possessions from the Alien bar (fight.js fightPayoff) count as this weapon's too, so every cell that reads "possessed"
//    works on them. When a possession ends (c6End) the cells that fire then do (Sticky, Connecting, Mines masteries).
//  - CHEST BURSTER (s_parasite, tag cb): shots infect (e.parasiteT); an infected enemy that dies rises as an undead turret
//    (game.js killEnemy, G.turrets). This file adopts those turrets (t.c6), keeps them out of sigweap.js's cap (4, or 6 with
//    Kinship's mastery or Orbiting from rank 3), moves them (bodyguards, Death from Above) and reads their shots
//    (src.c6U) for the undead cells (Knockback, Sticky, Primer, Catalyst).
// Changed from the table (written into MODIFIER_MATRIX.md 5.12): both weapons' reach is 300 in code, so Range adds +40 reach
// a rank; Chest Burster's Ricochet mastery infects what lies along each bounce's path (every shot infects what it hits).
// Round 2 (24 Oct): the plain cells have their own behaviour now (5.9 "Round 2"): Rent Free Range (haunts), Rapid Fire
// (Crowded house), Catalyst (Exorcism), Kinship (Shared custody), Sticky (Ectoplasm), Homing (Unfinished business), Focused
// Intensity (Eviction notice), Primer (Squatter's rights); Chest Burster Rapid Fire (larvae), Range (Spore cough), Charged
// (Bigger brood), Catalyst (Incubator), Kinship (Host family), Sticky (Egg sac), Homing (seeks a host), Focused Intensity
// (Gestation), Primer (Water breaking).
// Hooks: none in shared files. Wraps game.js spawnProj, killEnemy; sigs.js projHit, projEnd; fight.js rxFired; wupHit, wupKill; fight.js fightPayoff; sigweap.js
// sigwTick; cellmods.js xcKill; modwide.js mwDetonate; wupTick and modDraw; fills cellmods.js XC_TICK/XC_FIRE/XC_STATS.
// Loads after cellmods2.js. Tests reach the internals through C6.
(function () {
  const RF = 'v_soul_proj', CB = 's_parasite', CB_COL = '#b5e48c';
  XC_W[RF] = { tag: 'rn',
    cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
    mask: ['knock', 'pull', 'piercing', 'explode', 'ricochet', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
    deny: ['ranged'], atkOk: [] };
  XC_W[CB] = { tag: 'cb',
    cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
    mask: ['knock', 'pull', 'sticky', 'piercing', 'explode', 'ricochet', 'connecting', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
    deny: ['turncoat', 'ranged'], atkOk: [] };

  const C = () => G.c6 || (G.c6 = { pg: [], mines: [], dives: [], traps: [], links: [], clouds: [], haunts: [], goo: [], larva: [], glue: [] });
  const isRF = w => xcIs(w, 'rn'), isCB = w => xcIs(w, 'cb');
  const mine6 = w => !!w && (isRF(w) || isCB(w)) && xcAny(w);
  const held = w => !!(G && G.weapons && G.weapons.includes(w));
  const foeOk = e => !!e && !e.dead && !e.charmed && !e.egg && !e.phased;
  const imp = d => d * 4; // (a shove impulse that moves an enemy about d)
  const L = xcLv;
  const src6 = (w, extra) => Object.assign(weaponSrc(w), { wupEcho: true, noProc: true, c6x: 1 }, extra || {});
  const flown = pr => (pr.c6sx == null ? 0 : Math.hypot(pr.x - pr.c6sx, pr.y - pr.c6sy));
  const dfaRoll = w => Math.random() < 1 - Math.exp(-MW_DFA_RATE[Math.min(4, xcR(w, 'dfa')) - 1] * Math.max(0.1, (w.s && w.s.cd) || 1));
  function near(x, y, r, max, pred) { // enemies in r (not charmed), nearest first, at most max
    const out = [];
    forNear(x, y, r, e => { if (foeOk(e) && (!pred || pred(e))) out.push(e); });
    out.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    if (out.length > max) out.length = max;
    return out;
  }
  // A small blast: one hit on each enemy in r (16 at most); onHit(e) runs for each one still alive.
  function blast(w, x, y, r, dmg, onHit, skip, primary) {
    const s = primary ? weaponSrc(w) : src6(w, { atk: 'burst', noCrit: true }), hit = near(x, y, r, 16, e => e !== skip);
    for (const e of hit) { damageEnemy(e, dmg, s); if (onHit && !e.dead) onHit(e); }
    ring(x, y, r, w.def.color, 0.35, 3);
    return hit;
  }
  // True reflection off an enemy (Ricochet): the shot is kept alive by one pierce the engine then spends.
  function reflect(pr, e) {
    const nx = pr.x - e.x, ny = pr.y - e.y, d = Math.hypot(nx, ny) || 1, ux = nx / d, uy = ny / d, dot = pr.vx * ux + pr.vy * uy;
    if (dot < 0) { pr.vx -= 2 * dot * ux; pr.vy -= 2 * dot * uy; }
    pr.c6Ric--; pr.pierce = (pr.pierce || 0) + 1; pr.dmg *= 0.8; pr.life = Math.max(pr.life, 0.8); pr.tgt = null;
    spawnPart(pr.x, pr.y, pr.color, 3, 60, 0.2, 2);
  }

  // ================================================================ RENT FREE: possession
  const hosts = w => { const out = []; for (const e of G.enemies) if (!e.dead && e.charmed && e.c6H === w) out.push(e); return out; };
  function durK(w, e) {
    let k = 1;
    if (xcR(w, 'charged')) k *= 1 + L([0.6, 0.9, 1.2, 1.5], xcR(w, 'charged'));
    if (e.elite) k *= 0.5;
    return k;
  }
  function poss(w, e, t, raw) {
    if (!e || e.dead || e.boss || e.rival || e.egg || e.zombie || e.mwAllyOf || e.phased || e.xcRun) return false;
    if (!raw) t *= durK(w, e);
    if (e.charmed) { e.charmT = Math.min(20, Math.max(e.charmT || 0, t)); if (!e.c6H) onPoss(w, e); return true; }
    if (hosts(w).length >= 6) return false;
    curseFoe(e, t);
    if (!e.charmed) return false;
    onPoss(w, e);
    return true;
  }
  function onPoss(w, e) {
    e.c6H = w; if (e.c6Spd == null) e.c6Spd = e.speed;
    ring(e.x, e.y, e.r + 8, w.def.color, 0.4, 3);
    const ak = xcR(w, 'area') ? xcArea(w) : 0;
    if (ak) { // Area, Cold spot: the host's neighbours are shoved outward and flinch
      const rr = 60 * ak;
      for (const o of near(e.x, e.y, rr, 12, o => o !== e)) { shove(o, e.x, e.y, imp(20)); o.frozen = Math.max(o.frozen || 0, 0.25); }
      ring(e.x, e.y, rr, w.def.color, 0.45, 2); fxParts('smoke', e.x, e.y, w.def.color, 5, 60, 0.5, 4);
    }
  }
  function c6End(w, e) { // a possession by this weapon has ended (or its host died)
    if (e.c6Spd != null) { e.speed = e.c6Spd; e.c6Spd = null; }
    e.c6Perm = 0; e.c6Away = 0;
    if (!held(w)) return;
    if (e.c6Carry) { e.c6Carry = 0; rfMine(w, e.x, e.y); }
    if (e.dead) return;
    if (xcR(w, 'connecting') >= 4) { // Conjoined: the bunch can't move apart for 2 s
      const g = [e, ...near(e.x, e.y, 60, 7, o => !o.boss)];
      for (const o of g) { o.xcHeldT = G.t + 2; o.xcHX = o.x; o.xcHY = o.y; }
      ring(e.x, e.y, 60, w.def.color, 0.5, 4);
    }
  }
  fightPayoff = (orig => function (e, p, res, src) { // a full Alien bar from this weapon is a possession of this weapon
    const w = src && src.w, was = !!(e && e.charmed);
    orig(e, p, res, src);
    if (p !== 'possess' || !G || !w || !isRF(w) || !xcAny(w) || was || !e.charmed || e.dead) return;
    e.charmT *= durK(w, e);
    onPoss(w, e);
  })(fightPayoff);

  function rfMine(w, x, y) {
    const S = C(), mine = S.mines.filter(q => q.w === w), cap = xcR(w, 'mines') >= 2 ? 5 : 3;
    while (mine.length >= cap) { const o = mine.shift(); o.end = 0; }
    S.mines.push({ w, x, y, end: G.t + 14, arm: G.t + 0.4 });
    S.mines = S.mines.filter(q => q.end > G.t);
  }
  function rfPolter(w, e) { // Turncoat: the ghost rises, no body
    const S = C(), mine = S.pg.filter(q => q.w === w);
    if (mine.length >= 6) mine[0].end = 0;
    S.pg.push({ w, x: e.x, y: e.y, end: G.t + (xcR(w, 'turncoat') >= 2 ? 7 : 5), seen: [], poss: false, a: Math.random() * TAU });
    S.pg = S.pg.filter(q => q.end > G.t);
    ring(e.x, e.y, e.r + 10, w.def.color, 0.5, 3);
  }
  function dive(w, t, k) { // Death from Above: a 0.4 s reticle that follows its target, then the ghost lands
    C().dives.push({ w, t, at: G.t + 0.4, k, x: t.x, y: t.y });
  }
  function rfLand(D) {
    const w = D.w, t = D.t, x = t && !t.dead ? t.x : D.x, y = t && !t.dead ? t.y : D.y, r = xcR(w, 'dfa'), dur = r >= 2 ? 3 : 2;
    bolt(x, y - 140, x, y, w.def.color, 0.2); ring(x, y, 30, w.def.color, 0.35, 4);
    if (t && !t.dead) { damageEnemy(t, w.s.dmg * 1.4, weaponSrc(w)); poss(w, t, dur); }
    if (r >= 4) for (const o of near(x, y, 60, 8, o => o !== t)) poss(w, o, dur);
  }
  function cbLand(D) {
    const w = D.w, t = D.t, x = t && !t.dead ? t.x : D.x, y = t && !t.dead ? t.y : D.y, r = xcR(w, 'dfa'), inf = r >= 2 ? 8 : 6;
    bolt(x, y - 140, x, y, w.def.color, 0.2);
    if (r >= 3) blast(w, x, y, 40 * xcArea(w), w.s.dmg * 1.4, o => infect(w, o, inf), null, true);
    else if (t && !t.dead) { damageEnemy(t, w.s.dmg * 1.4, weaponSrc(w)); infect(w, t, inf); ring(x, y, 22, w.def.color, 0.3, 3); }
  }

  XC_STATS.rn = function (w, s) {
    const R = id => xcR(w, id);
    if (R('range')) s.range += 40 * R('range');
    if (R('piercing')) s.pierce = Math.max(s.pierce || 0, XC_RAMP(R('piercing')));
    if (R('charged') >= 4) s.pierce = Math.max(s.pierce || 0, 6); // (it passes through, possessing each)
    const ex = R('extra'); if (ex) { const n0 = s.count || 1; s.count = n0 + 1; s.dmg *= Math.pow(n0 / (n0 + (ex >= 2 ? 2 : 1)), 0.4); }
    if (R('orbiting')) s.orbitMod = 1.05; // (one lap round you, then off: game.js spawnProj)
  };
  XC_FIRE.rn = function (w, target, src) {
    const R = id => xcR(w, id), p = G.player;
    if (R('melee')) return true; // (Haunted touch runs in the tick)
    if (R('mines')) { rfMine(w, p.x + rand(-20, 20), p.y + rand(-20, 20)); return true; }
    if (!target) return false;
    if (R('dfa') && dfaRoll(w)) {
      const ts = acquireMany('strongest', w.s.range || 400, p.x, p.y, R('dfa') >= 3 ? 2 : 1);
      for (const t of ts) dive(w, t);
    }
    if (R('nth')) { w.c6N = (w.c6N || 0) + 1; if (w.c6N % (R('nth') >= 2 ? 3 : 4) === 0) { w.c6Mark = Object.assign({ c6Emp: 1, r: (w.s.size || 10) * 1.4 }, R('nth') >= 4 ? { pierce: 6 } : null); w.c6MarkF = G.frameN; } }
    const ex = R('extra');
    if (ex >= 2) {
      const a0 = Math.atan2(target.y - p.y, target.x - p.x);
      if (ex >= 4) for (let i = 0; i < 8; i++) spawnProj(w, p.x, p.y, a0 + (i + 0.5) / 8 * TAU, Object.assign({}, src, { mult: (src.mult || 1) * 0.5 }));
      else { const b = acquireMany('nearest', w.s.range || 300, p.x, p.y, 8).find(e => Math.cos(Math.atan2(e.y - p.y, e.x - p.x) - a0) < 0); spawnProj(w, p.x, p.y, b ? Math.atan2(b.y - p.y, b.x - p.x) : a0 + Math.PI, src); } // a rear ghost
    }
    return false;
  };
  function rfHit(w, pr, e) {
    const R = id => xcR(w, id), p = G.player, d = Math.hypot(e.x - p.x, e.y - p.y);
    if (R('sticky')) e.c6GooT = G.t + 3; // (Ectoplasm: it leaves a trail)
    if (R('rapid') && !pr.c6Child) { // Crowded house: too many ghosts in one enemy burst back out
      if (!(e.c6TenT > G.t - 2)) e.c6Ten = 0;
      e.c6TenT = G.t; e.c6Ten = (e.c6Ten || 0) + 1;
      const need = R('rapid') >= 3 ? 2 : 3;
      if (e.c6Ten >= need) {
        e.c6Ten = 0; ring(e.x, e.y, e.r + 10, w.def.color, 0.35, 3); fxParts('smoke', e.x, e.y, w.def.color, 6, 80, 0.5, 4);
        for (const o of near(e.x, e.y, 220, need, o => o !== e)) { const a = Math.atan2(o.y - e.y, o.x - e.x), v = pr.speed || 240; spawnProj(w, e.x, e.y, a, pr.src, { c6Child: 1, c6Esc: R('rapid') >= 4 ? 1 : 0, noMods: true, dmg: pr.dmg * (R('rapid') >= 2 ? 0.7 : 0.5), homing: 8, tgt: o, life: 1.4, hits: [e.id], vx: Math.cos(a) * v, vy: Math.sin(a) * v }); }
      }
    }
    if (pr.c6Esc) poss(w, e, 0.5, true);
    if (R('homing') >= 4 && e.dead && (pr.c6Kn || 0) < 2) { // a ghost that kills its target flies on to the next
      const o = xcFoe(e.x, e.y, 200, [e]); if (o) { pr.c6Kn = (pr.c6Kn || 0) + 1; pr.pierce = (pr.pierce || 0) + 1; pr.tgt = o; pr.c6T = o; pr.mHlost = 0; pr.life = Math.max(pr.life, 1); }
    }
    if (R('upclose') && d < 120 && !(e.c6UcT > G.t)) {
      e.c6UcT = G.t + 5;
      if (poss(w, e, L([1, 2, 3, 3], R('upclose'))) && R('upclose') >= 4 && d < 60) { // point-blank: the host attacks its nearest mate at once
        const m = xcFoe(e.x, e.y, 160, [e]);
        if (m) { damageEnemy(m, e.maxHp * 0.2, { fromAlly: true, noCrit: true, wname: 'Mind-controlled allies', knock: 60, kx: m.x - e.x, ky: m.y - e.y }); bolt(e.x, e.y, m.x, m.y, w.def.color, 0.15); e.allyT = m; e.atkCd = 0.5; }
      }
    }
    if (R('charged')) poss(w, e, 1);
    if (R('knock') && !e.boss) {
      shove(e, p.x, p.y, imp(L([30, 60, 90, 90], R('knock'))));
      if (R('knock') >= 4 && e.charmed && e.c6H === w) { const m = xcFoe(e.x, e.y, 200, [e]); if (m) { xcToward(e, m.x, m.y, 360); e.xcCan = { w, t: G.t + 0.6, f: 160, k: 0.4 }; } }
    }
    if (R('piercing')) { pr.c6Last = e; pr.dmg *= 0.85; track(w, pr); if (R('piercing') >= 4) poss(w, e, 1, true); }
    if (pr.c6Ric > 0) { reflect(pr, e); pr.c6Last = e; track(w, pr); if (R('ricochet') >= 4) poss(w, e, 0.5, true); }
    else if (pr.c6Ric === 0 && R('ricochet')) { pr.c6Last = e; track(w, pr); }
    if (R('explode')) { // the ghost bursts out of its host
      const k = L([0.4, 0.6, 0.8, 0.8], R('explode')), rr = L([40, 60, 80, 90], R('explode')) * xcArea(w), dmg = w.s.dmg * k, x0 = e.x, y0 = e.y;
      after(0.25, () => {
        if (!G || !held(w)) return;
        const x = e.dead ? x0 : e.x, y = e.dead ? y0 : e.y, hit = blast(w, x, y, rr, dmg, null, e.charmed ? e : null);
        fxParts('smoke', x, y, w.def.color, 6, 90, 0.5, 4);
        if (R('explode') >= 4) { const weak = hit.filter(o => !o.dead).sort((a, b) => a.hp - b.hp)[0]; if (weak) poss(w, weak, 1, true); }
      });
    }
    if (pr.c6Emp) { // Every Nth: the empowered ghost possesses three times as long
      poss(w, e, 3);
      if (R('nth') >= 3 && !pr.c6Two) { pr.c6Two = 1; for (const o of near(e.x, e.y, 140, 2, o => o !== e)) { poss(w, o, 3); bolt(e.x, e.y, o.x, o.y, w.def.color, 0.15); } }
    }
    if (pr.c6Split) { // Extra Projectiles rank 3: the ghost splits at its first hit
      pr.c6Split = 0; const a = Math.atan2(pr.vy, pr.vx);
      for (const da of [-0.6, 0.6]) spawnProj(w, pr.x, pr.y, a + da, pr.src, { c6Child: 1, noMods: true, dmg: pr.dmg * 0.5, hits: [e.id], life: 0.9, r: (pr.r || 10) * 0.7 });
    }
  }
  function track(w, pr) { const T = w.c6Trk || (w.c6Trk = []); if (!T.includes(pr)) { T.push(pr); if (T.length > 30) T.shift(); } }

  XC_TICK.rn = function (w, dt) {
    const R = id => xcR(w, id), p = G.player, S = C(), s = w.s, col0 = w.def.color;
    // possessions: ended ones, and what the hosts do
    for (const e of G.enemies) if (e.c6H === w && (e.dead || !e.charmed)) { e.c6H = null; c6End(w, e); }
    const hs = hosts(w), q4 = !(w.c6Q > G.t); if (q4) w.c6Q = G.t + 0.25;
    for (const h of hs) {
      if (h.c6Spd == null) h.c6Spd = h.speed;
      if (R('pull') >= 4) forNear(h.x, h.y, 80, o => { if (foeOk(o)) mwPull(o, h.x, h.y, 60 * dt); });
      if (R('primer') && !(h.mwPr && h.mwPr.t > G.t)) h.mwPr = { w, t: G.t + 4, by: new Set(), steps: 0 }; // possessed enemies are primed
      if (h.c6Away > G.t) { // Haunted touch rank 3: swims away from you, dragging its mates
        const dx = h.x - p.x, dy = h.y - p.y, d = Math.hypot(dx, dy) || 1, nx = h.x + dx / d * 70 * dt, ny = h.y + dy / d * 70 * dt;
        if (!(G.lvl && lvSolidAt(nx, ny))) { h.x = nx; h.y = ny; }
        forNear(h.x, h.y, 50, o => { if (foeOk(o)) mwPull(o, h.x, h.y, 50 * dt); });
      }
    }
    if (R('focus') && w._f && msFocusFull(w)) { // Eviction notice: at full ramp the target is Possessed and its mates flee from it
      const e = w._f.e;
      if (e && !e.dead && !e.charmed && !e.boss && !(e.c6FoT > G.t)) {
        e.c6FoT = G.t + 6;
        const perm = R('focus') >= 4 && !hs.some(h => h.c6Perm);
        if (poss(w, e, perm ? 20 : 2, true)) {
          if (perm) e.c6Perm = 1; // (20 s at most, so a wave can still end)
          const rr = L([100, 120, 140, 140], R('focus')); TOYS();
          for (const o of near(e.x, e.y, rr, 12, o => o !== e && !o.boss)) o.fearT = Math.max(o.fearT || 0, G.t + 1);
          ring(e.x, e.y, rr, w.def.color, 0.5, 3);
        }
      }
    }
    // Ectoplasm (Sticky): enemies the ghost hit leave a slowing trail
    if (R('sticky')) {
      for (const e of G.enemies) {
        if (!(e.c6GooT > G.t) || e.dead) continue;
        if (e.c6GooX == null || Math.hypot(e.x - e.c6GooX, e.y - e.c6GooY) > 30) { e.c6GooX = e.x; e.c6GooY = e.y; const mine = S.goo.filter(q => q.w === w); if (mine.length >= 30) mine[0].end = 0; S.goo.push({ w, x: e.x, y: e.y, r: 18, end: G.t + L([1.5, 2, 2.5, 2.5], R('sticky')), max: L([1.5, 2, 2.5, 2.5], R('sticky')) }); }
      }
      S.goo = S.goo.filter(q => q.end > G.t);
      if (q4) for (const q of S.goo) if (q.w === w) forNear(q.x, q.y, q.r, o => {
        if (!foeOk(o)) return; msSlow(o, L([0.3, 0.5, 0.7, 0.7], R('sticky')), 0.4);
        if (R('sticky') >= 4 && !(o.c6GsT > G.t)) { o.c6GsT = G.t + 2; msSnare(o, 1); }
      });
    }
    // Long-distance haunting (Range): ghosts that ran out of reach linger
    for (const q of S.haunts) {
      if (q.w !== w || q.end < G.t) continue;
      if (R('range') >= 4) { const o = xcFoe(q.x, q.y, 150); if (o) { const d = Math.hypot(o.x - q.x, o.y - q.y) || 1; q.x += (o.x - q.x) / d * 60 * dt; q.y += (o.y - q.y) / d * 60 * dt; } }
      const o = xcFoe(q.x, q.y, 14); if (!o) continue;
      q.end = 0; damageEnemy(o, s.dmg, weaponSrc(w)); poss(w, o, q.dur); ring(o.x, o.y, o.r + 8, col0, 0.35, 3);
    }
    // Connecting, Hive mind: possessed enemies gather at one point, bunching their mates
    if (R('connecting')) {
      const list = hs.slice(0, R('connecting') >= 2 ? 3 : 2), sp = R('connecting') >= 3 ? 120 : 60;
      w.c6Hive = list.length >= 2 ? list : null;
      if (w.c6Hive) {
        const cx = list.reduce((u, h) => u + h.x, 0) / list.length, cy = list.reduce((u, h) => u + h.y, 0) / list.length;
        for (const h of list) { const d = Math.hypot(cx - h.x, cy - h.y) || 1; if (d > h.r) { h.x += (cx - h.x) / d * sp * dt; h.y += (cy - h.y) / d * sp * dt; } forNear(h.x, h.y, 60, o => { if (foeOk(o)) mwPull(o, cx, cy, sp * 0.5 * dt); }); }
      }
    } else w.c6Hive = null;
    // ghosts in flight
    for (const pr of G.proj) {
      if (pr.dead || pr.w !== w || pr.lob || pr.mine || pr.c6U) continue;
      const v = Math.hypot(pr.vx, pr.vy) || 1, ux = pr.vx / v, uy = pr.vy / v;
      if (R('pull') && !(pr.orbitT > 0)) forNear(pr.x, pr.y, pr.r + 14, o => { // drags what it passes along its path
        if (!foeOk(o)) return; const D = pr.c6Dr || (pr.c6Dr = []); if (D.includes(o.id) || D.length > 20) return; D.push(o.id);
        mwPull(o, o.x + ux * 999, o.y + uy * 999, 40 * Math.min(3, R('pull'))); spawnPart(o.x, o.y, col0, 2, 50, 0.2, 2);
      });
      if (R('orbiting') >= 2 && pr.orbitT > 0) forNear(pr.x, pr.y, pr.r + 6, o => { const D = pr.c6Op || (pr.c6Op = []); if (!foeOk(o) || D.includes(o.id) || D.length > 12) return; D.push(o.id); poss(w, o, 0.5, true); });
      if (R('homing') && pr.mH) { // Unfinished business: a ghost whose target dies on the way takes the nearest enemy there instead
        if (pr.tgt && !pr.tgt.dead) pr.c6T = pr.tgt;
        else if (pr.c6T && pr.c6T.dead && !pr.c6UB) {
          pr.c6UB = 1; const T = pr.c6T, o = xcFoe(T.x, T.y, L([160, 200, 240, 240], R('homing')));
          if (o) { bolt(pr.x, pr.y, o.x, o.y, col0, 0.2); damageEnemy(o, pr.dmg, pr.src); poss(w, o, 1.5); pr.dead = true; }
        }
      }
    }
    if (w.c6Trk) { // Piercing and Ricochet: the last enemy the ghost reached is possessed
      w.c6Trk = w.c6Trk.filter(pr => { if (!pr.dead && G.proj.includes(pr)) return true; if (pr.c6Last && !pr.c6Last.dead) poss(w, pr.c6Last, 1.5); return false; });
    }
    // Haunted touch
    if (R('melee') && !(w.c6MT > G.t)) {
      w.c6MT = G.t + 0.1; const r = R('melee'), msrc = Object.assign(weaponSrc(w), { atk: 'contact' });
      forNear(p.x, p.y, p.r + 10, e => {
        if (!foeOk(e) || e.c6TT > G.t || Math.hypot(e.x - p.x, e.y - p.y) > p.r + e.r + 10) return;
        e.c6TT = G.t + 1; damageEnemy(e, s.dmg * 1.2, msrc);
        if (poss(w, e, r >= 2 ? 3 : 2) && r >= 3) e.c6Away = G.t + 3;
      });
      if (r >= 4 && !(w.c6M4 > G.t) && xcFoe(p.x, p.y, 60)) { w.c6M4 = G.t + 3; ring(p.x, p.y, 60 + p.r, col0, 0.45, 4); for (const e of near(p.x, p.y, 60 + p.r, 12)) { damageEnemy(e, s.dmg * 1.2, msrc); poss(w, e, 3); } }
    }
    // Orbiting rank 3: three ghosts stay in orbit; the mastery makes enemies near you flee
    if (R('orbiting') >= 3) {
      const O = w.c6Orb || (w.c6Orb = { a: 0, slots: [{}, {}, {}] }); O.a += 3 * dt;
      O.slots.forEach((sl, i) => {
        const a = O.a + i / 3 * TAU; sl.x = p.x + Math.cos(a) * 72; sl.y = p.y + Math.sin(a) * 72;
        if (sl.ready > G.t) return;
        const o = xcFoe(sl.x, sl.y, 10); if (!o) return;
        sl.ready = G.t + 0.5; damageEnemy(o, s.dmg * 0.6, weaponSrc(w)); poss(w, o, 0.5, true);
      });
      if (R('orbiting') >= 4 && q4) { TOYS(); forNear(p.x, p.y, 110, o => { if (foeOk(o) && !o.boss) o.fearT = Math.max(o.fearT || 0, G.t + 1); }); }
    } else w.c6Orb = null;
    // ghost mines
    for (const q of S.mines) {
      if (q.w !== w || q.end < G.t || q.arm > G.t) continue;
      const o = xcFoe(q.x, q.y, 40); if (!o) continue;
      q.end = 0; ring(q.x, q.y, 40, col0, 0.4, 3);
      damageEnemy(o, s.dmg * 1.2, weaponSrc(w));
      if (poss(w, o, R('mines') >= 3 ? 3 : 2) && R('mines') >= 4) o.c6Carry = 1;
    }
    // dives
    for (const D of S.dives) if (D.w === w && D.at <= G.t && !D.done) { D.done = 1; rfLand(D); }
    for (const D of S.dives) if (D.w === w && !D.done && D.t && !D.t.dead) { D.x = D.t.x; D.y = D.t.y; }
    // poltergeists
    for (const g of S.pg) {
      if (g.w !== w || g.end < G.t) continue;
      const t = xcFoe(g.x, g.y, 400, g.seen);
      g.a += dt * 2;
      const tx = t ? t.x : p.x + Math.cos(g.a) * 60, ty = t ? t.y : p.y + Math.sin(g.a) * 60, d = Math.hypot(tx - g.x, ty - g.y) || 1;
      g.x += (tx - g.x) / d * Math.min(d, 150 * dt); g.y += (ty - g.y) / d * Math.min(d, 150 * dt);
      forNear(g.x, g.y, 16, o => {
        if (!foeOk(o) || o.boss || g.seen.includes(o)) return;
        if (g.seen.length < 40) g.seen.push(o);
        TOYS(); o.fearT = Math.max(o.fearT || 0, G.t + (R('turncoat') >= 3 ? 2 : 1)); fxParts('smoke', o.x, o.y, col0, 3, 40, 0.4, 3);
        if (R('turncoat') >= 4 && !g.poss) { g.poss = poss(w, o, 2, true); }
      });
    }
  };

  // ================================================================ CHEST BURSTER: infection and the undead
  function infect(w, e, t) { if (!e || e.dead || e.charmed || e.egg || e.rival) return; e.parasiteW = w; e.parasiteT = Math.max(e.parasiteT || 0, t || 6); }
  const infBy = (e, w) => !e.dead && e.parasiteT > 0 && e.parasiteW === w;
  const undead = w => G.turrets.filter(t => t.c6 && t.w === w && t.life > 0);
  const capOf = w => (xcR(w, 'kinship') >= 4 || xcR(w, 'orbiting') >= 3 ? 6 : 4);
  function adopt(w, t) {
    if (t.c6) return;
    t.c6 = { w, born: G.t }; t.sigPet = true; t.born = G.t;
    t.src = Object.assign({}, t.src, { elem: w.def.elem, c6U: t });
    t.life = Math.min(t.life, 6); t.max = t.life;
  }
  function rise(w, t, e) {
    adopt(w, t);
    const R = id => xcR(w, id);
    let k = e.c6K || 1;
    if (e.c6Strong) { k *= 1.5; t.life += 2; t.c6.strong = 1; }
    t.dmg *= k;
    if (e.c6Elite) { t.dmg *= 2; t.life *= 2; t.rate *= 0.75; t.c6.elite = 1; }
    t.max = t.life; t.c6.k = k;
    if (R('dfa') >= 4) { // they rise by dropping onto an enemy
      const o = xcFoe(t.x, t.y, 220);
      if (o) { bolt(o.x, o.y - 140, o.x, o.y, w.def.color, 0.2); t.x = o.x; t.y = o.y; damageEnemy(o, w.s.dmg, src6(w)); ring(o.x, o.y, 26, w.def.color, 0.35, 3); }
    }
    if (R('knock') >= 4) { for (const o of near(t.x, t.y, 70 * xcArea(w), 12)) { damageEnemy(o, w.s.dmg * 0.5, src6(w)); shove(o, t.x, t.y, imp(60)); } ring(t.x, t.y, 70 * xcArea(w), w.def.color, 0.4, 4); }
    if (R('area')) { const S = C(); if (S.clouds.length < 20) S.clouds.push({ w, x: t.x, y: t.y, r: 40 * xcArea(w), end: G.t + 1 }); } // Rot cloud
    if (R('mines') >= 4 && e.c6Trap) cbTrap(w, t.x, t.y);
  }
  function cbDied(w, e, n0) {
    const R = id => xcR(w, id);
    if (R('explode')) { // bursts as it dies, infecting what it hits
      const k = L([0.4, 0.6, 0.8, 0.8], R('explode')), rr = L([40, 60, 80, 90], R('explode')) * xcArea(w);
      blast(w, e.x, e.y, rr, w.s.dmg * k, o => infect(w, o));
      fxParts('drop', e.x, e.y, CB_COL, 6, 120, 0.5, 3);
    }
    if (e.c6Egg) { // Host family: eggs laid by your other Alien weapons hatch as spit shots
      const ts = near(e.x, e.y, 260, e.c6Egg); e.c6Egg = 0;
      for (const o of ts) { const a = Math.atan2(o.y - e.y, o.x - e.x); spawnProj(w, e.x, e.y, a, weaponSrc(w), { c6Child: 1, noMods: true, dmg: w.s.dmg * (R('kinship') >= 3 ? 1 : 0.6), homing: 8, tgt: o, life: 1.4, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, speed: 300, color: CB_COL }); }
    }
    if (R('focus') && e.c6R0 != null && e.r >= e.c6R0 * 1.2) { blast(w, e.x, e.y, 60 * xcArea(w), w.s.dmg * 0.6, o => infect(w, o)); fxParts('drop', e.x, e.y, CB_COL, 10, 150, 0.5, 3); } // Gestation: a swollen host bursts
    for (let i = n0; i < G.turrets.length; i++) { const t = G.turrets[i]; if (t.w === w && !t.c6) rise(w, t, e); }
  }
  killEnemy = (orig => function (e, src) {
    const w = e && !e.dead && e.parasiteT > 0 && e.parasiteW, mine = !!(G && w && isCB(w) && xcAny(w) && held(w)), n0 = G && G.turrets ? G.turrets.length : 0;
    const r = orig.apply(this, arguments);
    if (mine && e.dead && !e.c6Died) { e.c6Died = 1; try { cbDied(w, e, n0); } catch (err) { if (C6.err.length < 10) C6.err.push('died: ' + err.message); } }
    return r;
  })(killEnemy);
  sigwTick = (orig => function (dt) { // our undead are out of sigweap.js's cap (it would cut them to 4); ours is below
    if (!G || !G.turrets) return orig(dt);
    for (const t of G.turrets) if (!t.c6 && mine6(t.w) && isCB(t.w)) adopt(t.w, t);
    const hold = [];
    for (let i = G.turrets.length - 1; i >= 0; i--) if (G.turrets[i].c6 && mine6(G.turrets[i].w)) hold.push(G.turrets.splice(i, 1)[0]);
    try { orig(dt); } finally { for (let i = hold.length - 1; i >= 0; i--) G.turrets.push(hold[i]); }
    for (const w of G.weapons) if (w && isCB(w) && xcAny(w)) { const a = undead(w).sort((u, v) => v.c6.born - u.c6.born); for (let i = capOf(w); i < a.length; i++) a[i].life = 0; }
  })(sigwTick);
  function cbTrap(w, x, y) {
    const S = C(), mine = S.traps.filter(q => q.w === w), cap = xcR(w, 'mines') >= 2 ? 5 : 3;
    while (mine.length >= cap) { const o = mine.shift(); o.end = 0; }
    S.traps.push({ w, x, y, end: G.t + 14, arm: G.t + 0.4 });
    S.traps = S.traps.filter(q => q.end > G.t);
  }
  function contagion(w, e, depth) { // Connecting: an infected enemy links to its neighbours, who catch it
    const S = C(), n = xcR(w, 'connecting') >= 2 ? 3 : 2, life = xcR(w, 'connecting') >= 3 ? 5 : 3;
    e.c6CgT = G.t + life;
    for (const o of near(e.x, e.y, 140, n, o => o !== e && !(o.c6CgT > G.t) && !S.links.some(l => l.b === o && l.end > G.t))) {
      if (S.links.length >= 16) S.links.shift();
      S.links.push({ w, a: e, b: o, end: G.t + life, depth, next: 0 });
      infect(w, o, 6);
    }
  }
  XC_STATS.cb = function (w, s) {
    const R = id => xcR(w, id);
    if (R('range')) s.range += 40 * R('range');
    if (R('piercing')) s.pierce = R('piercing') >= 4 ? 99 : Math.max(s.pierce || 0, XC_RAMP(R('piercing')));
    const ex = R('extra'); if (ex) { const n0 = s.count || 1, n1 = ex >= 4 ? 8 : n0 + L([1, 2, 2], ex); s.count = n1; s.dmg *= Math.pow(n0 / n1, 0.4); }
  };
  XC_FIRE.cb = function (w, target, src) {
    const R = id => xcR(w, id), p = G.player, s = w.s;
    if (R('melee')) return true; // (the facehugger runs in the tick)
    if (R('mines')) { cbTrap(w, p.x + rand(-20, 20), p.y + rand(-20, 20)); return true; }
    if (!target) return false;
    if (R('dfa') && dfaRoll(w)) C().dives.push({ w, t: target, at: G.t + 0.4, x: target.x, y: target.y });
    if (R('nth')) { w.c6N = (w.c6N || 0) + 1; if (w.c6N % (R('nth') >= 2 ? 3 : 4) === 0) { w.c6Mark = { c6Emp: 1, r: (s.size || 3.5) * 2 }; w.c6MarkF = G.frameN; } }
    const ex = R('extra');
    if (ex >= 3) {
      const a0 = Math.atan2(target.y - p.y, target.x - p.x);
      if (ex >= 4) for (let i = 0; i < s.count; i++) spawnProj(w, p.x, p.y, a0 + i / s.count * TAU, src); // shots in every direction
      else { const ts = acquireMany(w.dir || 'strongest', s.range || 300, p.x, p.y, s.count); if (!ts.length) ts.push(target); for (let i = 0; i < s.count; i++) { const t = ts[i % ts.length]; spawnProj(w, p.x, p.y, Math.atan2(t.y - p.y, t.x - p.x), src); } } // to different targets
      sfx('shot'); p.face = a0;
      return true;
    }
    return false;
  };
  function cbHit(w, pr, e) {
    const R = id => xcR(w, id), p = G.player, d = Math.hypot(e.x - p.x, e.y - p.y);
    if (e.c6Pop && !e.dead && !e.boss && !e.elite && !(w.c6PopT > G.t)) { // Up Close mastery: a point-blank infection bursts on the next hit
      w.c6PopT = G.t + 0.5; e.c6Pop = 0; fxParts('drop', e.x, e.y, CB_COL, 8, 140, 0.5, 3); damageEnemy(e, e.hp * 10 + 50, src6(w)); if (e.dead) return;
    }
    if (R('charged') && !pr.c6Child) { // Bigger brood: the charged shot carries a fat larva that splits into worms
      for (const o of near(e.x, e.y, 160, L([2, 3, 4, 4], R('charged')), o => o !== e)) { const a = Math.atan2(o.y - e.y, o.x - e.x); spawnProj(w, e.x, e.y, a, weaponSrc(w), { c6Child: 1, noMods: true, dmg: pr.dmg * 0.3, homing: 6, tgt: o, life: 1.6, hits: [e.id], r: 3, speed: 160, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, color: CB_COL }); }
      if (R('charged') >= 4) { for (const o of near(e.x, e.y, 60, 10, o => o !== e)) infect(w, o); ring(e.x, e.y, 60, CB_COL, 0.35, 3); }
    }
    if (R('range') && !pr.c6Child && flown(pr) > 250) e.c6Cough = G.t + 6; // Spore cough: a long-range infection makes it cough spores
    if (R('homing') >= 4 && pr.mH && !pr.c6Pass && !e.dead) { const o = near(e.x, e.y, 200, 1, o => o !== e && !infBy(o, w))[0]; if (o) { pr.c6Pass = 1; pr.pierce = (pr.pierce || 0) + 1; pr.tgt = o; pr.mHlost = 0; } } // hops on to an uninfected enemy
    if (R('upclose') && d < 120) { e.c6K = Math.max(e.c6K || 1, 1 + 0.3 * Math.min(3, R('upclose'))); if (R('upclose') >= 4 && d < 60) e.c6Pop = 1; }
    if (R('focus')) { e.c6K = Math.max(e.c6K || 1, 1 + msFocusRamp(w)); if (R('focus') >= 4 && msFocusFull(w) && !e.c6Elite) { e.c6Elite = 1; ring(e.x, e.y, e.r + 8, '#ffd60a', 0.4, 3); } }
    if (R('piercing')) pr.dmg *= R('piercing') >= 4 ? 0.92 : 0.85;
    if (pr.c6Ric > 0) {
      if (R('ricochet') >= 4) { // the path since the last bounce: everything along it is infected
        const ax = pr.c6Bx != null ? pr.c6Bx : pr.c6sx, ay = pr.c6By != null ? pr.c6By : pr.c6sy, vx = e.x - ax, vy = e.y - ay, l2 = vx * vx + vy * vy || 1; let n = 0;
        for (const o of G.enemies) { if (n >= 6 || !foeOk(o) || o === e) continue; const t = clamp(((o.x - ax) * vx + (o.y - ay) * vy) / l2, 0, 1); if (Math.hypot(o.x - ax - vx * t, o.y - ay - vy * t) < o.r + 30) { infect(w, o); n++; } }
      }
      reflect(pr, e); pr.c6Bx = e.x; pr.c6By = e.y;
    }
    if (pr.c6Emp) { // Every Nth: the empowered shot infects everything round its target
      const rr = R('nth') >= 3 ? 80 : 50, hit = near(e.x, e.y, rr, 12);
      for (const o of hit) { infect(w, o); if (R('nth') >= 4 && !o.boss) o.c6Elite = 1; }
      ring(e.x, e.y, rr, CB_COL, 0.4, 3);
    }
    if (R('connecting') && !(e.c6CgT > G.t)) contagion(w, e, 0);
  }
  function undeadHit(w, pr, e) {
    const R = id => xcR(w, id), t = pr.c6U;
    if (R('knock') && !e.boss) shove(e, t.x, t.y, imp(L([30, 60, 90, 90], R('knock'))));
    if (R('sticky') >= 4 && !(e.c6SnT > G.t)) { e.c6SnT = G.t + 2; msSnare(e, 1); }
  }
  XC_TICK.cb = function (w, dt) {
    const R = id => xcR(w, id), p = G.player, S = C(), s = w.s, und = undead(w), q4 = !(w.c6Q > G.t);
    if (q4) w.c6Q = G.t + 0.25;
    // undead: bodyguards, pull, bursts as they expire
    und.forEach((t, i) => {
      if (R('orbiting')) {
        const a = G.realT * 1.5 + i / und.length * TAU, tx = p.x + Math.cos(a) * 72, ty = p.y + Math.sin(a) * 72, dx = tx - t.x, dy = ty - t.y, dd = Math.hypot(dx, dy);
        if (dd > 1) { const m = Math.min(dd, 320 * dt); t.x += dx / dd * m; t.y += dy / dd * m; }
        if (R('orbiting') >= 2) for (const b of G.ebul) if (!b.dead && Math.abs(b.x - t.x) < 14 && Math.abs(b.y - t.y) < 14) { b.dead = true; spawnPart(b.x, b.y, CB_COL, 2, 50, 0.2, 2); }
        t.c6.guard = 1;
      } else t.c6.guard = 0;
      if (R('pull')) { const rr = 60 * Math.min(3, R('pull')) * xcArea(w); forNear(t.x, t.y, rr, o => { if (foeOk(o)) mwPull(o, t.x, t.y, 40 * Math.min(3, R('pull')) * dt); }); }
    });
    for (const t of G.turrets) {
      if (!t.c6 || t.w !== w || t.life > 0 || t.c6.popped) continue;
      t.c6.popped = 1;
      if (R('explode') >= 4 || R('orbiting') >= 4) { blast(w, t.x, t.y, 80 * xcArea(w), s.dmg * (R('explode') >= 4 ? 0.8 : 0.6), o => infect(w, o)); fxParts('drop', t.x, t.y, CB_COL, 6, 110, 0.5, 3); }
    }
    // infected enemies: slowed (Sticky), primed (Primer), pulling and spreading by touch (Pulling mastery)
    if (q4 && (R('sticky') || R('primer') || R('pull') >= 4 || R('range'))) {
      let spread = 0;
      for (const e of G.enemies) {
        if (!infBy(e, w) || e.charmed) continue;
        if (R('sticky')) forNear(e.x, e.y, e.r + 4, o => { // Egg sac: two infected enemies that touch are glued together
          if (o === e || !infBy(o, w) || o.charmed || S.glue.length >= 16 || Math.hypot(o.x - e.x, o.y - e.y) > o.r + e.r + 4) return;
          const n = q => S.glue.filter(g => g.end > G.t && (g.a === q || g.b === q)).length, cap = R('sticky') >= 3 ? 2 : 1;
          if (n(e) >= cap || n(o) >= cap || S.glue.some(g => (g.a === e && g.b === o) || (g.a === o && g.b === e))) return;
          S.glue.push({ w, a: e, b: o, end: G.t + L([2, 3, 3, 3], R('sticky')) });
        });
        if (R('range') && e.c6Cough > G.t && !(e.c6CoT > G.t) && S.clouds.length < 20) { e.c6CoT = G.t + (R('range') >= 2 ? 1 : 1.5); S.clouds.push({ w, x: e.x, y: e.y, r: R('range') >= 3 ? 45 : 30, end: G.t + 0.6, slow: R('range') >= 4 }); }
        if (R('primer') && !(e.mwPr && e.mwPr.t > G.t)) e.mwPr = { w, t: G.t + 4, by: new Set(), steps: 0 };
        if (R('pull') >= 4) forNear(e.x, e.y, 50, o => {
          if (o === e || !foeOk(o)) return; mwPull(o, e.x, e.y, 10);
          if (spread < 3 && !infBy(o, w) && Math.hypot(o.x - e.x, o.y - e.y) < o.r + e.r + 4) { infect(w, o, 3); spread++; spawnPart(o.x, o.y, CB_COL, 2, 40, 0.3, 2); }
        });
      }
    }
    // Contagion links
    for (const l of S.links) {
      if (l.w !== w || l.end < G.t || l.a.dead || l.b.dead || l.next > G.t) continue;
      l.next = G.t + 0.5; infect(w, l.b, 3);
      if (R('connecting') >= 4 && l.depth === 0 && !l.spread && !(l.b.c6CgT > G.t)) { l.spread = 1; contagion(w, l.b, 1); }
    }
    S.links = S.links.filter(l => l.end > G.t && !l.a.dead && !l.b.dead);
    // traps
    for (const q of S.traps) {
      if (q.w !== w || q.end < G.t || q.arm > G.t || !xcFoe(q.x, q.y, 30)) continue;
      q.end = 0;
      blast(w, q.x, q.y, 50 * xcArea(w), s.dmg * 1.2, o => { infect(w, o, R('mines') >= 3 ? 8 : 6); if (R('mines') >= 4) o.c6Trap = 1; }, null, true);
      fxParts('drop', q.x, q.y, CB_COL, 6, 100, 0.4, 3);
    }
    // Rot clouds
    for (const c of S.clouds) if (c.w === w && c.end > G.t && q4) for (const o of near(c.x, c.y, c.r, 10)) { infect(w, o); if (c.slow) msSlow(o, 0.3, 0.5); }
    // glue
    for (const g of S.glue) {
      if (g.w !== w || g.end < G.t || g.a.dead || g.b.dead) { g.end = 0; continue; }
      const k = R('sticky') >= 3 ? 0.7 : 0.5; msSlow(g.a, k, 0.3); msSlow(g.b, k, 0.3);
      const d = Math.hypot(g.a.x - g.b.x, g.a.y - g.b.y); if (d > g.a.r + g.b.r) { mwPull(g.a, g.b.x, g.b.y, 30 * dt); mwPull(g.b, g.a.x, g.a.y, 30 * dt); }
    }
    S.glue = S.glue.filter(g => g.end > G.t);
    // larvae (Rapid Fire): shots that found nothing burrow in and wait
    for (const q of S.larva) {
      if (q.w !== w || q.end < G.t) continue;
      if (R('rapid') >= 4) { const o = xcFoe(q.x, q.y, 150); if (o) { const d = Math.hypot(o.x - q.x, o.y - q.y) || 1; q.x += (o.x - q.x) / d * 40 * dt; q.y += (o.y - q.y) / d * 40 * dt; } }
      const o = xcFoe(q.x, q.y, 10); if (!o) continue;
      q.end = 0; damageEnemy(o, s.dmg, weaponSrc(w)); spawnPart(q.x, q.y, CB_COL, 4, 60, 0.3, 2);
    }
    S.larva = S.larva.filter(q => q.end > G.t);
    // Gestation (Focused Intensity): the focused enemy swells with the ramp
    if (R('focus')) {
      const f = w._f, e = f && f.e && !f.e.dead && !f.e.boss ? f.e : null;
      if (w.c6Sw && w.c6Sw !== e) { const o = w.c6Sw; if (!o.dead && o.c6R0 != null) o.r = o.c6R0; w.c6Sw = null; }
      if (e && infBy(e, w)) { if (e.c6R0 == null) e.c6R0 = e.r; e.r = e.c6R0 * (1 + 0.3 * Math.min(1, msFocusRamp(w) / L([0.4, 0.8, 1.2, 1.2], R('focus')))); w.c6Sw = e; }
    }
    S.clouds = S.clouds.filter(c => c.end > G.t);
    // dives
    for (const D of S.dives) if (D.w === w && D.at <= G.t && !D.done) { D.done = 1; cbLand(D); }
    for (const D of S.dives) if (D.w === w && !D.done && D.t && !D.t.dead) { D.x = D.t.x; D.y = D.t.y; }
    // shots: Homing turns them towards the nearest enemy not yet infected
    if (R('homing') && q4) for (const pr of G.proj) {
      if (pr.dead || pr.w !== w || !pr.mH || pr.c6U) continue;
      if (pr.mHlost || !pr.tgt || pr.tgt.dead || infBy(pr.tgt, w)) { const o = near(pr.x, pr.y, 380, 1, o => !infBy(o, w))[0]; if (o) { pr.tgt = o; pr.mHlost = 0; } }
    }
    // Melee: the facehugger
    if (R('melee')) {
      const F = w.c6Fh || (w.c6Fh = { host: null, cd: 0, x: p.x, y: p.y }), reach = (R('melee') >= 2 ? 80 : 60) + p.r;
      if (F.host && (F.host.dead || F.host.charmed || Math.hypot(F.host.x - p.x, F.host.y - p.y) > 500)) {
        const x = F.host.x, y = F.host.y, gone = F.host.dead; F.host = null;
        if (gone && R('melee') >= 4) { const o = xcFoe(x, y, 160); if (o) { bolt(x, y, o.x, o.y, CB_COL, 0.2); latch(w, F, o); } } // jumps to a new host
      }
      if (!F.host) { F.x = p.x; F.y = p.y; const o = xcFoe(p.x, p.y, reach); if (o) latch(w, F, o); }
      if (F.host) {
        F.x = F.host.x; F.y = F.host.y; F.cd -= dt;
        if (F.cd <= 0) { F.cd = Math.max(0.25, s.cd); damageEnemy(F.host, s.dmg, Object.assign(weaponSrc(w), { atk: 'contact' })); spawnPart(F.x, F.y, CB_COL, 2, 50, 0.2, 2); }
      }
    } else w.c6Fh = null;
  };
  function latch(w, F, o) {
    F.host = o; F.cd = 0; infect(w, o, 6);
    o.c6K = Math.max(o.c6K || 1, xcR(w, 'melee') >= 3 ? 1.8 : 1.5);
    ring(o.x, o.y, o.r + 6, CB_COL, 0.3, 3);
  }

  // ================================================================ shared wraps
  spawnProj = (orig => function (w, x, y, a, src, over) {
    const pr = orig.apply(this, arguments);
    if (!pr || !G || !mine6(w)) return pr;
    pr.c6sx = x; pr.c6sy = y;
    if (src && src.c6U) { pr.c6U = src.c6U; return pr; } // (an undead's shot)
    if (over && over.c6Child) return pr;
    if (w.c6MarkF === G.frameN && w.c6Mark) Object.assign(pr, w.c6Mark);
    const ric = xcR(w, 'ricochet'); if (ric) pr.c6Ric = XC_RAMP(ric);
    if (isRF(w) && xcR(w, 'extra') >= 3) pr.c6Split = 1;
    return pr;
  })(spawnProj);
  projHit = (orig => function (pr, e) {
    orig(pr, e);
    const w = pr && pr.w;
    if (!G || !e || !mine6(w)) return;
    try {
      if (pr.c6U) { if (isCB(w)) undeadHit(w, pr, e); }
      else if (isRF(w)) rfHit(w, pr, e); else cbHit(w, pr, e);
    } catch (err) { if (C6.err.length < 10) C6.err.push('hit: ' + err.message + ' ' + String(err.stack).split('\n')[1]); }
  })(projHit);
  xcKill = (orig => function (e, src) { // Rent Free's Turncoat is the poltergeist, not cellmods.js's riser
    const w = src && src.w;
    if (!G || !w || !isRF(w) || !xcAny(w)) return orig(e, src);
    if (e.xcGold > G.t) dropGem(e.x, e.y, Math.max(1, e.xp || 1), 'x'); // (Golden bubble and Golden egg: as orig)
    const r = xcR(w, 'turncoat');
    if (r && !e.elite && !e.boss && !e.rival && !e.egg && !e.charmed && !e.mwAllyOf && Math.random() < MW_TURN_CH[Math.min(4, r) - 1]) rfPolter(w, e);
  })(xcKill);
  mwDetonate = (orig => function (e, pw, M) {
    orig(e, pw, M);
    if (!G || !pw || !held(pw) || !mine6(pw) || !xcR(pw, 'primer')) return;
    const r = xcR(pw, 'primer');
    if (isRF(pw) && e.c6H === pw && e.charmed && !e.dead) { // Squatter's rights: the detonation moves the ghost on
      const hop = e.c6Hop || 0, to = near(e.x, e.y, 120, r >= 4 ? 2 : 1, o => o !== e);
      for (const o of to) if (poss(pw, o, 2, true)) { bolt(e.x, e.y, o.x, o.y, pw.def.color, 0.2); o.c6Hop = hop + 1; if (r >= 3 && hop < 2) o.mwPr = { w: pw, t: G.t + 4, by: new Set(), steps: 0 }; }
      if (to.length && r < 4) { e.charmT = 0.01; e.frozen = Math.max(e.frozen || 0, 0.5); } // (the mastery: the old host keeps its ghost too)
    }
    if (isCB(pw) && infBy(e, pw) && !e.dead && !e.boss && !e.elite && e.hp < e.maxHp * L([0.25, 0.35, 0.45, 0.45], r)) { // Water breaking: the chest bursts early
      fxParts('drop', e.x, e.y, CB_COL, 10, 150, 0.5, 3); ring(e.x, e.y, e.r + 10, CB_COL, 0.35, 4); damageEnemy(e, e.hp * 10 + 50, src6(pw));
    }
    if (isCB(pw) && r >= 4) { for (const o of near(e.x, e.y, 60, 8)) infect(pw, o); ring(e.x, e.y, 60, CB_COL, 0.35, 3); } // detonations spread the infection
  })(mwDetonate);
  rxFired = (orig => function (id, e) { // Catalyst: what a reaction does to the ghost or the parasite
    orig(id, e);
    if (!G || !e || !G.weapons) return;
    for (const w of G.weapons) {
      if (!mine6(w) || !xcR(w, 'catalyst')) continue;
      const r = xcR(w, 'catalyst');
      if (isRF(w) && e.c6H === w && e.charmed && !(e.c6ExT > G.t) && (e.c6ExN || 0) < (r >= 4 ? 3 : 1)) { // Exorcism: the reaction blows the ghost out into the nearest enemy
        e.c6ExT = G.t + 1; const o = xcFoe(e.x, e.y, 150, [e]);
        if (o) { bolt(e.x, e.y, o.x, o.y, w.def.color, 0.25); e.charmT = 0.01; if (r >= 3) damageEnemy(o, w.s.dmg, src6(w)); if (poss(w, o, r >= 2 ? 2 : 1, true)) o.c6ExN = (e.c6ExN || 0) + 1; }
      }
      if (isCB(w) && infBy(e, w) && !(e.c6HatchT > G.t)) { // Incubator: the reaction hatches a worm out of it early
        e.c6HatchT = G.t + 4; hatch(w, e, r);
        if (r >= 4) for (const o of near(e.x, e.y, 60, 2, o => o !== e && infBy(o, w) && !(o.c6HatchT > G.t))) { o.c6HatchT = G.t + 4; hatch(w, o, r); }
      }
    }
  })(rxFired);
  function hatch(w, e, r) {
    if (G.turrets.length >= 24) return;
    const life = r >= 2 ? 3 : 2, t = { x: e.x + rand(-8, 8), y: e.y + rand(-8, 8), life, max: life, cd: 0.2, rate: 0.35, dmg: w.s.dmg * 1.2 * (r >= 3 ? 1 : 0.5), range: 320, w, src: { elem: w.def.elem, wname: 'Tapeworm turrets', crit: G.P.crit }, face: 0, color: CB_COL };
    G.turrets.push(t); adopt(w, t); t.life = life; t.max = life; t.c6.worm = 1;
    fxParts('drop', e.x, e.y, CB_COL, 5, 90, 0.4, 3);
  }
  projEnd = (orig => function (pr) { // a shot that found nothing: Rent Free's Range haunt, Chest Burster's Rapid Fire larva
    orig(pr);
    const w = pr && pr.w;
    if (!G || !mine6(w) || pr.nHit || pr.c6Child || pr.c6U || pr.mine || pr.lob) return;
    const S = C();
    if (isRF(w) && xcR(w, 'range')) { const r = xcR(w, 'range'), mine = S.haunts.filter(q => q.w === w); if (mine.length >= 6) mine[0].end = 0; S.haunts = S.haunts.filter(q => q.end > G.t); S.haunts.push({ w, x: pr.x, y: pr.y, end: G.t + L([2, 3, 4, 4], r), dur: L([1, 1.5, 2, 2], r) }); }
    if (isCB(w) && xcR(w, 'rapid')) { const mine = S.larva.filter(q => q.w === w); if (mine.length >= 12) mine[0].end = 0; S.larva = S.larva.filter(q => q.end > G.t); S.larva.push({ w, x: pr.x, y: pr.y, end: G.t + L([4, 6, 8, 8], xcR(w, 'rapid')) }); }
  })(projEnd);
  wupHit = (orig => function (e, res, src) { // Kinship: what your other Alien weapons do to this weapon's hosts
    orig(e, res, src);
    const ow = src && src.w;
    if (!G || !ow || ow.isSpell || src.dot || src.echo || src.wupEcho || !res || mwType(ow) !== 'soul') return;
    for (const w of G.weapons) {
      if (!w || w === ow || !mine6(w) || !xcR(w, 'kinship')) continue;
      const r = xcR(w, 'kinship');
      if (isRF(w) && e.c6H === w && e.charmed && !(e.c6KiT > G.t)) { // Shared custody: the hit passes through the host into what it is fighting
        e.c6KiT = G.t + 0.25; e.charmT = Math.min(10, e.charmT + 0.5);
        const t = e.allyT && !e.allyT.dead && !e.allyT.charmed ? e.allyT : xcFoe(e.x, e.y, 160, [e]);
        if (t && res.toHp > 0) { damageEnemy(t, res.toHp * L([0.4, 0.6, 0.8, 0.8], r), msEcho(src)); bolt(e.x, e.y, t.x, t.y, w.def.color, 0.15); }
      }
      if (isCB(w) && infBy(e, w) && !(e.c6EggT > G.t) && (e.c6Egg || 0) < (r >= 2 ? 4 : 2)) { e.c6EggT = G.t + 0.3; e.c6Egg = (e.c6Egg || 0) + 1; spawnPart(e.x, e.y, CB_COL, 2, 40, 0.3, 2); } // Host family: it lays an egg
    }
  })(wupHit);
  wupKill = (orig => function (e, src) { // Rent Free Kinship mastery: your other Alien weapons' kills free a ghost
    orig(e, src);
    const ow = src && src.w;
    if (!G || !ow || ow.isSpell || mwType(ow) !== 'soul') return;
    for (const w of G.weapons) if (w && w !== ow && isRF(w) && xcAny(w) && xcR(w, 'kinship') >= 4) { const o = xcFoe(e.x, e.y, 100, [e]); if (o) poss(w, o, 1, true); }
  })(wupKill);
  wupTick = (orig => function (dt) { // lists of a weapon no longer held go
    orig(dt);
    if (!G || !G.c6 || G.state !== 'play') return;
    const S = G.c6, ok = q => held(q.w);
    S.pg = S.pg.filter(q => q.end > G.t && ok(q)); S.mines = S.mines.filter(q => q.end > G.t && ok(q)); S.traps = S.traps.filter(q => q.end > G.t && ok(q));
    S.dives = S.dives.filter(q => !q.done && ok(q)); S.links = S.links.filter(ok); S.clouds = S.clouds.filter(ok);
    S.haunts = S.haunts.filter(q => q.end > G.t && ok(q)); S.goo = S.goo.filter(ok); S.larva = S.larva.filter(q => q.end > G.t && ok(q)); S.glue = S.glue.filter(ok);
  })(wupTick);

  // ================================================================ drawing (world space)
  modDraw = (orig => function () {
    orig();
    if (!G || !G.weapons) return;
    const k = S_(), S = G.c6;
    ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * k);
    for (const w of G.weapons) {
      if (!mine6(w)) continue;
      const c = col(w.def.color);
      if (w.c6Hive) { ctx.globalAlpha = 0.55; ctx.strokeStyle = c; ctx.setLineDash([5 * k, 4 * k]); ctx.beginPath(); w.c6Hive.forEach((h, i) => { if (i) ctx.lineTo(sx(h.x), sy(h.y)); else ctx.moveTo(sx(h.x), sy(h.y)); }); if (w.c6Hive.length > 2) ctx.closePath(); ctx.stroke(); ctx.setLineDash([]); } // the hive mind
      if (isRF(w) && xcR(w, 'kinship') >= 4) { ctx.globalAlpha = 0.3; ctx.strokeStyle = c; for (const h of G.enemies) if (h.c6H === w && h.charmed && h.allyT && !h.allyT.dead) { ctx.beginPath(); ctx.moveTo(sx(h.x), sy(h.y)); ctx.lineTo(sx(h.allyT.x), sy(h.allyT.y)); ctx.stroke(); } }
      if (w.c6Orb) for (const sl of w.c6Orb.slots) if (sl.x != null) ghost(sl.x, sl.y, 8, c, sl.ready > G.t ? 0.3 : 0.75);
      if (w.c6Fh) { const F = w.c6Fh, x = sx(F.x), y = sy(F.y) - (F.host ? (F.host.r || 10) * 0.6 * k : 0); ctx.globalAlpha = 0.95; ctx.strokeStyle = col(CB_COL); ctx.fillStyle = col(CB_COL); for (let i = 0; i < 4; i++) { const a = G.realT * 3 + i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 8 * k, y + Math.sin(a) * 8 * k); ctx.stroke(); } ctx.beginPath(); ctx.arc(x, y, 4 * k, 0, TAU); ctx.fill(); } // the facehugger
      if (isCB(w)) for (const t of G.turrets) if (t.c6 && t.w === w && t.life > 0) {
        if (t.c6.elite) { ctx.globalAlpha = 0.8; ctx.strokeStyle = col('#ffd60a'); ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), 13 * k, 0, TAU); ctx.stroke(); }
        if (t.c6.guard) { ctx.globalAlpha = 0.35; ctx.strokeStyle = col(CB_COL); ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), 16 * k, 0, TAU); ctx.stroke(); }
        if (xcR(w, 'pull')) { ctx.globalAlpha = 0.12; ctx.strokeStyle = col(CB_COL); ctx.beginPath(); ctx.arc(sx(t.x), sy(t.y), 60 * Math.min(3, xcR(w, 'pull')) * xcArea(w) * k, 0, TAU); ctx.stroke(); }
      }
    }
    if (S) {
      for (const g of S.pg) if (g.end > G.t) ghost(g.x, g.y, 12, col(g.w.def.color), 0.45 * Math.min(1, (g.end - G.t) / 0.5)); // poltergeists
      for (const q of S.mines) if (q.end > G.t) { ctx.globalAlpha = q.arm > G.t ? 0.3 : 0.7; ctx.strokeStyle = col(q.w.def.color); ctx.setLineDash([3 * k, 3 * k]); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 7 * k, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 40 * k, 0, TAU); ctx.stroke(); } // ghost mines
      for (const q of S.traps) if (q.end > G.t) { const x = sx(q.x), y = sy(q.y); ctx.globalAlpha = q.arm > G.t ? 0.35 : 0.8; ctx.strokeStyle = col(CB_COL); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 4 * k, y + Math.sin(a) * 4 * k); ctx.lineTo(x + Math.cos(a) * 9 * k, y + Math.sin(a) * 9 * k); ctx.stroke(); } ctx.beginPath(); ctx.arc(x, y, 4 * k, 0, TAU); ctx.stroke(); } // infection traps
      for (const D of S.dives) if (!D.done) { const r = (18 + 30 * Math.max(0, D.at - G.t)) * k, x = sx(D.x), y = sy(D.y); ctx.globalAlpha = 0.8; ctx.strokeStyle = col(D.w.def.color); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.moveTo(x - r * 1.3, y); ctx.lineTo(x + r * 1.3, y); ctx.moveTo(x, y - r * 1.3); ctx.lineTo(x, y + r * 1.3); ctx.stroke(); } // reticles
      ctx.strokeStyle = col(CB_COL);
      for (const l of S.links) if (l.end > G.t && !l.a.dead && !l.b.dead) { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(sx(l.a.x), sy(l.a.y)); ctx.lineTo(sx(l.b.x), sy(l.b.y)); ctx.stroke(); } // contagion
      for (const q of S.haunts) if (q.end > G.t) ghost(q.x, q.y, 9, col(q.w.def.color), 0.25 + 0.15 * Math.sin(G.realT * 5)); // lingering haunts
      for (const q of S.goo) if (q.end > G.t) { ctx.globalAlpha = 0.18 * Math.min(1, (q.end - G.t) / q.max * 2); ctx.fillStyle = col(q.w.def.color); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.r * k, 0, TAU); ctx.fill(); } // ectoplasm
      for (const q of S.larva) if (q.end > G.t) { ctx.globalAlpha = 0.8; ctx.strokeStyle = col(CB_COL); ctx.lineWidth = 2 * k; ctx.beginPath(); const x = sx(q.x), y = sy(q.y), wv = Math.sin(G.realT * 8 + q.x) * 2 * k; ctx.moveTo(x - 5 * k, y + wv); ctx.quadraticCurveTo(x, y - wv, x + 5 * k, y + wv); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * k); } // larvae
      for (const g of S.glue) if (g.end > G.t) { ctx.globalAlpha = 0.7; ctx.strokeStyle = col(CB_COL); ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(sx(g.a.x), sy(g.a.y)); ctx.lineTo(sx(g.b.x), sy(g.b.y)); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * k); } // egg-sac glue
      ctx.strokeStyle = col(CB_COL);
      for (const e of G.enemies) if (e.c6Egg > 0 && !e.dead) { ctx.globalAlpha = 0.9; ctx.fillStyle = col(CB_COL); for (let i = 0; i < e.c6Egg; i++) { const a = i / e.c6Egg * TAU + G.realT; ctx.beginPath(); ctx.arc(sx(e.x + Math.cos(a) * e.r * 0.5), sy(e.y + Math.sin(a) * e.r * 0.5), 2 * k, 0, TAU); ctx.fill(); } } // eggs
      for (const c of S.clouds) if (c.end > G.t) { ctx.globalAlpha = 0.22 * Math.min(1, (c.end - G.t) / 0.4); ctx.fillStyle = col(CB_COL); ctx.beginPath(); ctx.arc(sx(c.x), sy(c.y), c.r * k, 0, TAU); ctx.fill(); } // rot clouds
    }
    ctx.restore();
  })(modDraw);
  function ghost(x, y, r, c, a) { // a small sheet ghost with two eyes
    const k = S_(), X = sx(x), Y = sy(y), R = r * k;
    ctx.globalAlpha = a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X, Y - R * 0.2, R, Math.PI, 0); ctx.lineTo(X + R, Y + R * 0.8); ctx.lineTo(X + R * 0.33, Y + R * 0.5); ctx.lineTo(X - R * 0.33, Y + R * 0.8); ctx.lineTo(X - R, Y + R * 0.5); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.arc(X - R * 0.35, Y - R * 0.25, R * 0.16, 0, TAU); ctx.arc(X + R * 0.35, Y - R * 0.25, R * 0.16, 0, TAU); ctx.fill();
  }

  globalThis.C6 = { err: [], C, poss, hatch, hosts, infect, undead, rfPolter, rfMine, cbTrap, dive, contagion, capOf };
})();
