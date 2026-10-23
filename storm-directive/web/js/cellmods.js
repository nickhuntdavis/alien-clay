'use strict';
// Spawn Prawn - weapon cells: per-weapon modifier effects for Nappy Mines and Blowing Bubbles (redesign docs/MODIFIER_MATRIX.md,
// those two rows of every table, and 5.5 / 5.6; designed with the user on 23 Oct). Elsewhere every weapon gets the shared form
// of a modifier (modslice.js, modwide.js); on these two weapons the cells below replace it.
//  - MASKING: a cell that replaces the shared form hides that modifier from the shared code while it runs for this weapon
//    (XC_W[id].mask: w.m10 is swapped for a filtered copy, then restored; xcR always reads the real list). Cells that add
//    to the shared form (Catalyst, Kinship, Primer, Area; on Bubbles also Range, Up Close, Rapid Fire, Charged) keep it.
//  - LEVELS: Lv 1, 2, 3 and the mastery (rank 4) follow the cell's default path; the branch fork screens are skipped for
//    cell modifiers on these weapons. Rapid Fire, Sticky, Ricochet, Connecting, Extra Projectiles and Orbiting are dealt
//    on Nappy Mines although it is a Burst (XC_W.atkOk); Range, Up Close, Piercing, Exploding Rounds, Focused Intensity,
//    Mines and Ranged are not (N/A cells). Homing on Nappy Mines exists only beside Ricochet (no slot limits setting).
//  - SWITCHED AT BIRTH: two alternates each (user, 23 Oct): Nappy Mines Acid or Mucus, Bubbles Acid or Static; the card
//    deals one of the two. The ranked "Alternating" mastery is not built (Switched at Birth has no ranks).
//  - BUBBLES INFLATE before they are sent, on every bubble weapon (xcInflate). Melee's bubble round you is not the
//    Membrane: touched, it pops in a Force explosion, then grows back from tiny (3 s; 2 s from Lv 2).
//  - Card text: TODO_COPY:cell_nm_<modifier> and TODO_COPY:cell_bb_<modifier> (one per cell; the user writes it).
// Hooks: one line in toys.js bubblePop (a switched bubble pops in its new type). Wraps modOk, modAdd, modCard, sabCard,
// wupStats/wupFire/wupHit/wupKill/wupTick/wupDmgMul, msStats/msFire/msDmgMul/msHit/msKill/msTick (modslice.js),
// mwStats/mwFire/mwDmgMul/mwHit/mwKill/mwTick/mwDetonate (modwide.js), p11Range, modFire/modProj/modTick/modDraw
// (modifiers.js), updateStickyMine/mineScale/detonateMine (sigs.js), sigMine (sigweap.js), bubbleFire/bubbleTick/
// bubblePop/bubbleHit/bubbleSoak (toys.js). Loads after areamod.js.

const XC_W = {
  s_mines: { tag: 'nm',
    cells: ['orbiting', 'extra', 'melee', 'dfa', 'ricochet', 'pull', 'knock', 'sticky', 'connecting', 'turncoat', 'charged', 'rapid', 'nth', 'catalyst', 'kinship', 'primer', 'area', 'homing'],
    mask: ['orbiting', 'extra', 'melee', 'dfa', 'ricochet', 'pull', 'knock', 'sticky', 'connecting', 'turncoat', 'charged', 'rapid', 'nth', 'homing'],
    deny: ['range', 'upclose', 'piercing', 'explode', 'focus', 'mines', 'ranged'],
    atkOk: ['rapid', 'sticky', 'ricochet', 'connecting', 'extra', 'orbiting', 'homing'] },
  s_bubble: { tag: 'bb',
    cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
    mask: ['knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
    deny: ['ranged'], atkOk: [] },
};
const XC_ALT = { s_mines: ['fire', 'ice'], s_bubble: ['fire', 'shock'] }; // (Switched at Birth: Acid or Mucus; Acid or Static)
const XC_RAMP = n => [1, 3, 6, 12][Math.max(1, Math.min(4, n)) - 1];
const xcDef = w => (w && w.def && !w.isSpell ? XC_W[w24Key(w)] : null);
const xcIs = (w, tag) => { const D = xcDef(w); return !!D && D.tag === tag; };
const xcR = (w, id) => { const a = w && (w.xcReal || w.m10); if (!a) return 0; let n = 0; for (const x of a) if (x === id) n++; return Math.min(4, n); };
const xcAny = w => { const D = xcDef(w); return !!D && D.cells.some(id => xcR(w, id) > 0); };
const xcCell = (w, id) => { const D = xcDef(w); return !!D && D.cells.includes(id); };
const xcS = () => G.xcS || (G.xcS = { push: [], mach: [], rain: [], ham: [], gum: [] });
const xcLv = (arr, r) => arr[Math.max(1, Math.min(arr.length, r)) - 1];
const xcFoe = (x, y, R, not) => { let b = null, bd = R; for (const o of G.enemies) { if (o.dead || o.charmed || o.egg || (not && not.includes(o))) continue; const d = Math.hypot(o.x - x, o.y - y) - (o.r || 0); if (d < bd) { bd = d; b = o; } } return b; };
const xcArea = w => (typeof areaK === 'function' ? areaK(w) : 1);

// ---------------------------------------------------------------- masking the shared forms
function xcMaskW(w) {
  if (!w || !w.m10 || !w.m10.length) return false;
  const D = xcDef(w); if (!D) return false;
  if (w.xcDepth) { w.xcDepth++; return true; }
  w.xcReal = w.m10; w.m10 = w.m10.filter(id => !D.mask.includes(id)); w.xcDepth = 1;
  return true;
}
function xcUnmaskW(w) { if (--w.xcDepth === 0) { w.m10 = w.xcReal; w.xcReal = null; } }
const xcWrapW = (fn, pickW) => function (...a) {
  const w = pickW(a);
  if (!xcMaskW(w)) return fn.apply(this, a);
  try { return fn.apply(this, a); } finally { xcUnmaskW(w); }
};
const xcWrapAll = fn => function (...a) {
  const ws = G && G.weapons ? G.weapons.filter(w => w && xcMaskW(w)) : [];
  try { return fn.apply(this, a); } finally { for (const w of ws) xcUnmaskW(w); }
};
const xcW0 = a => a[0], xcSrcW = i => a => a[i] && a[i].w;
msStats = xcWrapW(msStats, xcW0); mwStats = xcWrapW(mwStats, xcW0);
msFire = xcWrapW(msFire, xcW0); mwFire = xcWrapW(mwFire, xcW0); modFire = xcWrapW(modFire, xcW0);
modProj = xcWrapW(modProj, a => a[1]);
msDmgMul = xcWrapW(msDmgMul, xcSrcW(1)); mwDmgMul = xcWrapW(mwDmgMul, xcSrcW(1));
msHit = xcWrapW(msHit, xcSrcW(2)); mwHit = xcWrapW(mwHit, xcSrcW(2));
msKill = xcWrapW(msKill, xcSrcW(1)); mwKill = xcWrapW(mwKill, xcSrcW(1));
msTick = xcWrapAll(msTick); mwTick = xcWrapAll(mwTick); modTick = xcWrapAll(modTick);
p11Range = xcWrapW(p11Range, xcSrcW(1));

// ---------------------------------------------------------------- cards: which modifiers, no fork screens, the text
modOk = (orig => function (w, id) {
  const D = xcDef(w); if (!D) return orig(w, id);
  if (D.deny.includes(id)) return false;
  if (id === 'homing' && D.tag === 'nm' && !(mmFree() && xcR(w, 'ricochet'))) return false; // (only to pair with Ricochet: 5.5)
  const m = MODS10[id], a = w.def.v10atk;
  if (!m || !D.atkOk.includes(id) || m.atk.includes(a)) return orig(w, id);
  m.atk.push(a); // (dealt on this weapon although its attack type is not on the modifier's list)
  try { return orig(w, id); } finally { m.atk.splice(m.atk.lastIndexOf(a), 1); }
})(modOk);
modAdd = (orig => function (w, id) {
  const ok = orig(w, id);
  if (ok && xcCell(w, id) && G && G.lootQueue) for (let i = G.lootQueue.length - 1; i >= 0; i--) { const q = G.lootQueue[i]; if (q.kind === 'fork' && q.ms && q.ms.w === w && q.ms.id === id) G.lootQueue.splice(i, 1); }
  return ok;
})(modAdd);
modCard = (orig => function (w, id) {
  const c = orig(w, id);
  if (c && xcCell(w, id)) c.desc = 'TODO_COPY:cell_' + xcDef(w).tag + '_' + id;
  return c;
})(modCard);
sabCard = (orig => function () {
  for (const k in XC_ALT) MM_SAB[k] = pick(XC_ALT[k]);
  return orig();
})(sabCard);

// ---------------------------------------------------------------- stats
wupStats = (orig => function (w, s) {
  orig(w, s);
  if (!xcAny(w)) return;
  w.uh = w.uh || {}; if (G) { G.msAny = true; G.mwAny = true; }
  const R = id => xcR(w, id);
  if (xcIs(w, 'nm')) {
    if (R('rapid')) { s.cd /= 1 + xcLv([0.4, 0.8, 1.2, 1.6], R('rapid')); s.dmg *= xcLv([0.75, 0.7, 0.65, 0.6], R('rapid')); } // Breadcrumbs: faster, smaller
    const ex = R('extra'); if (ex) { const n0 = s.count || 1, n1 = n0 + xcLv([1, 2, 2, 6], ex); s.dmg *= Math.pow(n0 / n1, 0.4); }
  } else {
    const ex = R('extra'); if (ex) { const n0 = s.count || 1, n1 = n0 + xcLv([1, 2, 2, 2], ex); s.count = n1; s.dmg *= Math.pow(n0 / n1, 0.4); }
    if (R('charged')) s.hold *= xcLv([1.2, 1.4, 1.6, 1.6], R('charged')); // Big breath: traps bigger enemies
    if (R('area')) { s.size *= xcArea(w); s.hold += 4 * R('area'); } // Bigger bubbles
  }
})(wupStats);

// ================================================================ NAPPY MINES
function xcMine(w, x, y) { return { mine: true, x, y, life: 1, arm: 0, r: 7, w, src: weaponSrc(w), color: w.def.color, dead: false }; }
function xcSpot(w, x, y, r, life) {
  return { x, y, r, life, max: life, dps: Math.max(3, w.s.dmg * 0.15), elem: w.def.elem, pull: 0, color: w.def.color, tick: 0,
    src: Object.assign(weaponSrc(w), { zoneHit: true, wname: 'Nappy Mines (pool)' }), xcNm: w };
}
function xcBoom(pr) { if (pr.dead) return; pr.dead = true; detonateMine(pr); }
function xcRipe(pr) {
  const r = pr.w ? xcR(pr.w, 'charged') : 0; if (!r || !pr.xcBorn) return 1;
  return 1 + Math.max(0, Math.min(xcLv([0.6, 1.2, 1.8, 1.8], r), 0.1 * (G.t - pr.xcBorn - 0.5)));
}
// One mine dropped (or landed) for this weapon, with every cell that marks a mine.
function xcDrop(w, x, y) {
  const pr = mineDrop(w, x, y), R = id => xcR(w, id);
  pr.xcBorn = G.t;
  if (R('nth')) { // Loaded nappy
    w.xcN = (w.xcN || 0) + 1;
    if (w.xcN % (R('nth') === 2 || R('nth') === 3 ? 3 : 4) === 0) { pr.xcLoaded = 1; if (R('nth') >= 3) pr.xcK = (pr.xcK || 1) * 2; if (R('nth') >= 4) pr.nuke = true; }
  }
  if ((w.xcNk || 0) >= 6) { w.xcNk -= 6; pr.nuke = true; } // (Ripening mastery: ripe mines count double towards it)
  if (R('rapid') >= 4) { // Breadcrumbs mastery: mines dropped close together fuse
    const q = G.proj.find(o => o.mine && !o.dead && o.w === w && !o.stick && !o.xcSlide && Math.hypot(o.x - x, o.y - y) < 40);
    if (q) { q.dead = true; pr.charge = Math.min(4, (q.charge || 1) + 1); }
  }
  if (R('ricochet') && !pr.stick) { pr.xcSlide = { seek: 1, n: xcLv([1, 2, 3, 4], R('ricochet')), hit: [], time: 0 }; pr.arm = 99; }
  G.proj.push(pr);
  return pr;
}
function xcNmFire(w) {
  const p = G.player, R = id => xcR(w, id);
  if (R('melee') || R('orbiting')) return; // (the suicide vest and the orbit go off in the tick)
  const n = (w.s.count || 1) + xcLv([0, 1, 2, 2, 6], R('extra') + 1);
  if (R('dfa')) { xcNmDfa(w, n); return; }
  const hd = p.hd != null ? p.hd : Math.atan2(p.vy || 0, p.vx || 1), ex = R('extra');
  for (let i = 0; i < n; i++) {
    let x, y;
    if (ex >= 3) { const sp = ex >= 4 ? 26 : 32; x = p.x - Math.cos(hd) * (20 + sp * i); y = p.y - Math.sin(hd) * (20 + sp * i); } // a line, then a long string
    else if (R('rapid')) { x = p.x - Math.cos(hd) * (18 + 10 * i) + rand(-6, 6); y = p.y - Math.sin(hd) * (18 + 10 * i) + rand(-6, 6); } // Breadcrumbs: a tight trail
    else { x = p.x + rand(-26, 26); y = p.y + rand(-26, 26); }
    xcDrop(w, x, y);
  }
  mineTrim();
}
// Death from Above: random artillery among the enemies; from Lv 3 a carpet across their path that goes off in order.
function xcNmDfa(w, n) {
  const p = G.player, r = xcR(w, 'dfa'), R = w.s.range || 380;
  w.xcDrops = (w.xcDrops || 0) + 1;
  const fall = (x, y, seq, nuke) => {
    G.fx.push({ type: 'warn', x, y, r: nuke ? 90 : 30, color: w.def.color, life: 0.6, max: 0.6 });
    after(0.6, () => {
      if (!G || !G.weapons.includes(w)) return;
      const pr = xcDrop(w, x, y); pr.arm = 0.3;
      if (nuke) { pr.nuke = true; pr.xcSlide = null; pr.xcBoomAt = G.t + 0.05; }
      else if (seq != null) { pr.xcSlide = null; pr.xcBoomAt = G.t + 0.15 + seq * 0.15; }
      mineTrim();
    });
  };
  if (r >= 3) {
    const t = acquire('nearest', R, p.x, p.y); if (!t) return;
    const a = Math.atan2(t.y - p.y, t.x - p.x) + Math.PI / 2, m = r >= 4 ? 6 : 4;
    for (let i = 0; i < m; i++) fall(t.x + Math.cos(a) * (i - (m - 1) / 2) * 40, t.y + Math.sin(a) * (i - (m - 1) / 2) * 40, i);
  } else {
    const fs = acquireMany('nearest', R, p.x, p.y, 8); if (!fs.length) return;
    for (let i = 0; i < Math.max(n, r >= 2 ? 2 : 1); i++) { const e = pick(fs); fall(e.x + rand(-40, 40), e.y + rand(-40, 40)); }
  }
  if (r >= 4 && w.xcDrops % 6 === 0) { const c = acquire('cluster', R, p.x, p.y); if (c) fall(c.x, c.y, null, true); }
}
wupFire = (orig => function (w, t, src) {
  if (xcIs(w, 'nm') && xcAny(w)) { xcNmFire(w); return true; }
  return orig(w, t, src);
})(wupFire);

// Each frame for a mine of a weapon with cells (sigs.js updateStickyMine is asked first).
function xcGo(pr, e) {
  if (pr.dead || pr.xcFuse != null) return;
  const w = pr.w, st = xcR(w, 'sticky');
  let fuse = 0;
  if (e && st) { // Fly paper: held before the blast, so it takes all of it
    const hold = xcLv([0.5, 0.6, 0.7, 0.7], st), held = [e];
    if (st >= 4) forNear(pr.x, pr.y, 44, o => { if (!o.charmed && o !== e) held.push(o); });
    for (const o of held) if (!o.boss) { o.xcHeldT = G.t + hold; o.xcHX = o.x; o.xcHY = o.y; }
    fuse = hold;
  }
  if (e && xcR(w, 'pull')) { fuse = Math.max(fuse, 0.3); pr.xcImp = 1; } // Implosion
  if (fuse > 0) { pr.xcFuse = fuse; pr.arm = 99; return; }
  xcBoom(pr);
}
const xcImpR = w => 70 * xcLv([1, 1.5, 2, 2], xcR(w, 'pull')) * xcArea(w); // (Area + Pulling: from further away)
function xcMineStep(pr, dt) {
  const w = pr.w;
  if (pr.xcBoomAt && G.t >= pr.xcBoomAt) { xcBoom(pr); return true; }
  if (pr.xcSlide) { xcSlide(pr, dt); return true; }
  if (pr.xcFuse != null) {
    pr.xcFuse -= dt;
    if (pr.xcImp) {
      const R = xcImpR(w);
      for (const o of G.enemies) if (!o.dead && !o.charmed && Math.hypot(o.x - pr.x, o.y - pr.y) < R) mwPull(o, pr.x, pr.y, 380 * dt);
      if (xcR(w, 'pull') >= 4) for (const q of G.proj) if (q !== pr && q.mine && !q.dead && q.w === w) { const d = Math.hypot(q.x - pr.x, q.y - pr.y); if (d < 140 && d > 20) { q.x += (pr.x - q.x) / d * 200 * dt; q.y += (pr.y - q.y) / d * 200 * dt; } }
    }
    if (pr.xcFuse <= 0) xcBoom(pr);
    return true;
  }
  pr.life -= dt; pr.arm -= dt;
  if (pr.arm > 0) return true;
  let trig = null;
  forNear(pr.x, pr.y, 34, e => { if (!e.charmed) { trig = e; return true; } });
  if (!trig && xcR(w, 'primer') >= 3) forNear(pr.x, pr.y, 68, e => { if (!e.charmed && e.mwPr && e.mwPr.t > G.t) { trig = e; return true; } }); // primed enemies set mines off from twice as far
  if (trig || pr.life <= 0) xcGo(pr, trig);
  return true;
}
// Ricochet: the mine bounces off the nearest enemy, slides away and arms where it stops. With Homing it bounces on to the
// next enemy and goes off there.
function xcSlide(pr, dt) {
  const S = pr.xcSlide, w = pr.w;
  if (S.seek) {
    let t = S.t && !S.t.dead ? S.t : null;
    if (!t) t = S.t = xcFoe(pr.x, pr.y, 260, S.hit);
    S.time += dt;
    if (!t || S.time > 2.5) { if (S.boom) { xcBoom(pr); return; } pr.xcSlide = null; pr.arm = 0.3; return; }
    const d = Math.hypot(t.x - pr.x, t.y - pr.y) || 1, st = Math.min(d, 420 * dt);
    pr.x += (t.x - pr.x) / d * st; pr.y += (t.y - pr.y) / d * st;
    if (d > t.r + 8) return;
    if (S.boom) { xcBoom(pr); return; }
    S.hit.push(t); S.n--; S.t = null;
    spawnPart(pr.x, pr.y, w.def.color, 3, 60, 0.2, 2);
    if (xcR(w, 'ricochet') >= 4 && G.zones.length < 150) G.zones.push(xcSpot(w, pr.x, pr.y, 22, 1.5)); // each bounce drops a small burning spot
    if (xcR(w, 'homing')) { S.boom = 1; S.time = 0; return; }
    if (S.n > 0) return;
    const a = Math.atan2(pr.y - t.y, pr.x - t.x) + rand(-0.4, 0.4);
    S.seek = 0; S.vx = Math.cos(a) * 320; S.vy = Math.sin(a) * 320;
    return;
  }
  const nx = pr.x + S.vx * dt, ny = pr.y + S.vy * dt;
  if (G.lvl && lvSolidAt(nx, ny)) { S.vx = S.vy = 0; } else { pr.x = nx; pr.y = ny; }
  const k = Math.exp(-4 * dt); S.vx *= k; S.vy *= k;
  if (Math.hypot(S.vx, S.vy) < 25) { pr.xcSlide = null; pr.arm = 0.3; }
}
updateStickyMine = (orig => function (pr, dt) {
  if (orig(pr, dt)) return true;
  return pr.w && xcIs(pr.w, 'nm') && xcAny(pr.w) ? xcMineStep(pr, dt) : false;
})(updateStickyMine);
mineScale = (orig => function (pr) {
  const o = orig(pr);
  if (pr.xcK) o.k *= pr.xcK;
  if (pr.xcRK) o.r *= pr.xcRK;
  const rp = xcRipe(pr); if (rp > 1) { o.k *= rp; o.r *= Math.sqrt(rp); } // Ripening
  return o;
})(mineScale);
detonateMine = (orig => function (pr) {
  const w = pr.w, mine = w && xcIs(w, 'nm');
  let R = 0, rp = 1;
  if (mine) { const k = mineScale(pr); R = (w.s.explode || 72) * k.r * Math.min(1.6, Math.sqrt(pr.charge || 1)) * xcArea(w); rp = xcRipe(pr); }
  orig(pr);
  if (mine && G) xcAfterBlast(pr, R, rp);
})(detonateMine);
function xcAfterBlast(pr, R, rp) {
  const w = pr.w, x = pr.x, y = pr.y, R_ = id => xcR(w, id);
  const kn = R_('knock');
  if (kn) { // Cannonball: thrown clear; what a thrown enemy lands on takes a hit too
    const f = xcLv([200, 260, 320, 320], kn);
    forNear(x, y, R, e => { if (!e.charmed && !e.boss && !e.dead) { shove(e, x, y, f); e.xcCan = { w, t: G.t + 0.6, f }; } });
  }
  if (xcArea(w) > 1) { // Area: a shockwave ring at twice the blast, pulling slightly inwards
    forNear(x, y, R * 2, o => { if (o.charmed || o.dead || Math.hypot(o.x - x, o.y - y) < R) return; damageEnemy(o, w.s.dmg * 0.3 * (pr.xcK || 1), weaponSrc(w)); mwPull(o, x, y, 20); });
    ring(x, y, R * 2, w.def.color, 0.4, 2);
  }
  if (w.def.sab && w.def.elem === 'fire') for (const z of G.zones) if (!z.xcFl && z.elem === 'flame' && Math.hypot(z.x - x, z.y - y) < R + z.r) { z.xcFl = 1; z.r *= 2; } // an Acid blast flares a burning patch
  if (R_('charged') >= 4) w.xcNk = (w.xcNk || 0) + (rp >= 1 + xcLv([0.6, 1.2, 1.8, 1.8], 4) - 1e-6 ? 2 : 1);
}
sigMine = (orig => function (pr) { // the patch each blast leaves
  const n = G.zones.length;
  orig(pr);
  if (!pr.w || !xcIs(pr.w, 'nm')) return;
  const w = pr.w, rp = xcRipe(pr);
  for (let i = n; i < G.zones.length; i++) {
    const z = G.zones[i]; if (!z.src || z.src.w !== w) continue;
    z.xcNm = w;
    if (pr.xcLoaded) { z.r *= 1.75; z.life *= 2; z.max *= 2; } // Loaded nappy
    if (pr.xcPatchK) z.r *= pr.xcPatchK;
    if (rp > 1) z.r *= Math.sqrt(rp);
    if (w.def.sab) { z.elem = w.def.elem; z.color = w.def.color; if (w.def.elem === 'ice') z.xcSlick = 1; } // Acid Pool or a Mucus slick
  }
})(sigMine);
mwDetonate = (orig => function (e, pw, M) {
  orig(e, pw, M);
  if (!G || !pw || !G.weapons.includes(pw)) return;
  if (xcIs(pw, 'nm') && xcR(pw, 'primer')) { // Walking mine: the primed enemy leaves a burning patch
    if (G.zones.length < 150) G.zones.push(xcSpot(pw, e.x, e.y, 40, 2.5));
    if (xcR(pw, 'primer') >= 4) for (const q of G.proj) if (q.mine && !q.dead && q.w === pw && Math.hypot(q.x - e.x, q.y - e.y) < 80) xcGo(q, null);
  }
  if (xcIs(pw, 'bb') && xcR(pw, 'primer') >= 4) { const t = xcTrappable(pw, e.x, e.y, 120); if (t) xcTrap(pw, t); }
})(mwDetonate);

function xcNmTick(w, dt) {
  const R = id => xcR(w, id), p = G.player;
  // Orbiting: mines circle you and go off on contact
  if (R('orbiting')) {
    const r = R('orbiting'), n = r >= 2 ? 3 : 2, rad = r >= 3 ? 90 : 72, O = w.xcOrb || (w.xcOrb = { a: 0, slots: [] });
    O.a += 3 * dt; while (O.slots.length < n) O.slots.push({ ready: 0, spot: 0 });
    O.slots.length = n;
    O.slots.forEach((sl, i) => {
      const a = O.a + i / n * TAU; sl.x = p.x + Math.cos(a) * rad; sl.y = p.y + Math.sin(a) * rad;
      if (sl.ready > G.t) return;
      let hit = null; forNear(sl.x, sl.y, 10, e => { if (!e.charmed) { hit = e; return true; } });
      if (hit) { xcBoom(xcMine(w, sl.x, sl.y)); sl.ready = G.t + Math.max(1, w.s.cd * 2); }
      else if (r >= 4 && !(sl.spot > G.t) && G.zones.length < 150) { sl.spot = G.t + 0.5; G.zones.push(xcSpot(w, sl.x, sl.y, 22, 1.5)); }
    });
  } else w.xcOrb = null;
  // Melee: the suicide vest
  if (R('melee') && !(w.xcVestT > G.t) && xcFoe(p.x, p.y, 90)) {
    const r = R('melee'); w.xcVestT = G.t + (r >= 3 ? 1.5 : 2);
    const pr = xcMine(w, p.x, p.y); if (r >= 2) pr.xcK = 1.3;
    let n = 0; forNear(p.x, p.y, (w.s.explode || 72) * xcArea(w), e => { if (!e.charmed) n++; });
    xcBoom(pr);
    const hurt = G.P.maxHp * 0.05 * (r >= 2 ? 1.3 : 1);
    if (r >= 4 && n >= 5) healPlayer(hurt); else hurtPlayer(hurt, 'Nappy Mines', null, 'blast');
  }
  // Connecting: tripwires between mines
  if (R('connecting')) {
    const r = R('connecting'), reach = r >= 2 ? 180 : 140, k = r >= 3 ? 2 : 1;
    const ms = G.proj.filter(q => q.mine && !q.dead && q.w === w && q.arm <= 0 && !q.xcSlide && q.xcFuse == null).slice(-40), edges = [], seen = new Set();
    ms.forEach((m, i) => {
      const near = ms.map((o, j) => [j, Math.hypot(o.x - m.x, o.y - m.y)]).filter(([j, d]) => j !== i && d < reach).sort((u, v) => u[1] - v[1]).slice(0, k);
      for (const [j] of near) { const key = Math.min(i, j) + ':' + Math.max(i, j); if (!seen.has(key)) { seen.add(key); edges.push([ms[Math.min(i, j)], ms[Math.max(i, j)]]); } }
    });
    w.xcWires = edges;
    for (const [a, b] of edges) {
      if (a.dead || b.dead) continue;
      const vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
      const cross = G.enemies.some(e => { if (e.dead || e.charmed) return false; const t = Math.max(0, Math.min(1, ((e.x - a.x) * vx + (e.y - a.y) * vy) / l2)); return Math.hypot(e.x - (a.x + vx * t), e.y - (a.y + vy * t)) < e.r + 3; });
      if (!cross) continue;
      const third = r >= 4 ? edges.map(([u, v]) => (u === a ? v : v === a ? u : null)).filter(c => c && c !== b && edges.some(([u, v]) => (u === b && v === c) || (v === b && u === c))) : [];
      for (const q of [a, b, ...third]) xcGo(q, null);
    }
  } else w.xcWires = null;
  // Catalyst, Hot nappy: Burn spreads from a burning enemy to any enemy touching it
  if (R('catalyst') && !(w.xcHotT > G.t)) {
    w.xcHotT = G.t + 0.25; let n = 0;
    for (const e of G.enemies) {
      if (n > 20 || e.dead || e.xcHotW !== w || !((e.cd && e.cd.bars.fire > 0.3) || e.v10burn > 0)) continue;
      forNear(e.x, e.y, e.r + 4, o => {
        if (o === e || o.charmed || o.xcHotW === w) return;
        const c = fightCd(o); c.bars.fire = Math.max(c.bars.fire, Math.min(0.99, ((e.cd && e.cd.bars.fire) || 0.4) * 0.5));
        v10Burn(o, w.s.dmg * 0.3, weaponSrc(w)); o.xcHotW = w; n++;
      });
    }
  }
  // Kinship: Hot Mess pools set mines off (+30%); Shared heat (mastery): touching patches and pools merge
  if (R('kinship') && !(w.xcKinT > G.t)) {
    w.xcKinT = G.t + 0.2;
    const pools = G.zones.filter(z => z.life > 0 && z.src && z.src.w && w24Key(z.src.w) === 'v_flame_pool');
    for (const q of G.proj) if (q.mine && !q.dead && q.w === w && q.arm <= 0 && pools.some(z => Math.hypot(z.x - q.x, z.y - q.y) < z.r)) { q.xcK = (q.xcK || 1) * 1.3; xcGo(q, null); }
    if (R('kinship') >= 4) {
      const zs = G.zones.filter(z => z.life > 0 && (z.xcNm === w || (z.src && z.src.w && w24Key(z.src.w) === 'v_flame_pool'))).slice(-30);
      for (let i = 0; i < zs.length; i++) for (let j = i + 1; j < zs.length; j++) {
        const a = zs[i], b = zs[j]; if (a.life <= 0 || b.life <= 0) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 0.8) { a.r = Math.min(220, Math.hypot(a.r, b.r)); a.life = Math.max(a.life, b.life); a.max = Math.max(a.max, b.max); b.life = 0; }
      }
    }
  }
  // Switched at Birth to Mucus: the slick Snares
  for (const z of G.zones) if (z.xcSlick && z.xcNm === w && z.life > 0) forNear(z.x, z.y, z.r, o => { if (!o.charmed && !(o.xcSlT > G.t)) { msSnare(o, 0.6); o.xcSlT = G.t + 1.2; } });
}
// Turncoat: a kill rises carrying a mine (or, on Bubbles, inside a hamster ball) and heads for the nearest enemy.
function xcRise(w, e) {
  if (G.enemies.filter(z => z.xcRun && z.xcRun.w === w && !z.dead).length >= 6) return;
  const z = makeEnemy(e.def, e.x, e.y);
  z.charmed = true; z.charmT = 1e9; z.zombie = true; z.xp = 0; z.mwAllyOf = w; z.name = e.name;
  z.hp = z.maxHp = z.maxHp * 0.5;
  z.xcRun = { w, end: G.t + 6, hits: 0 };
  G.enemies.push(z); ring(z.x, z.y, z.r + 8, w.def.color, 0.4, 3);
}
function xcRunTick(z, dt) {
  const w = z.xcRun.w, r = xcR(w, 'turncoat'), bb = xcIs(w, 'bb');
  if (!G.weapons.includes(w)) { z.dead = true; return; }
  const o = xcFoe(z.x, z.y, 420, [z]);
  if (o) { const d = Math.hypot(o.x - z.x, o.y - z.y) || 1, sp = bb ? 170 : 140; z.x += (o.x - z.x) / d * sp * dt; z.y += (o.y - z.y) / d * sp * dt; }
  const touch = o && Math.hypot(o.x - z.x, o.y - z.y) < z.r + o.r + 6;
  if (!bb) { // the suicide runner
    if (!touch && z.xcRun.end > G.t) return;
    const pr = xcMine(w, z.x, z.y); if (r >= 2) pr.xcK = 1.2; if (r >= 3) pr.xcRK = 1.3; if (r >= 4) pr.xcPatchK = Math.SQRT2;
    z.dead = true; xcBoom(pr);
    return;
  }
  // Hamster ball: bowls into enemies, then pops
  if (touch && !(o.xcHamT > G.t)) {
    o.xcHamT = G.t + 0.4; z.xcRun.hits++;
    damageEnemy(o, w.s.dmg * 1.2, toySrc(w, 'Bubble Wand')); shove(o, z.x, z.y, 220);
  }
  if (z.xcRun.hits > (r >= 3 ? 2 : 0) || z.xcRun.end <= G.t) {
    const dmg = w.s.dmg * 2.2 * (r >= 2 ? 1.3 : 1);
    forNear(z.x, z.y, 80, q => { if (q !== z && !q.charmed) damageEnemy(q, dmg, toySrc(w, 'Bubble pop', { knock: 140, kx: q.x - z.x, ky: q.y - z.y })); });
    ring(z.x, z.y, 80, w.def.color, 0.3, 3); fxParts('bubble', z.x, z.y, w.def.color, 8, 90, 0.5, 3);
    z.dead = true;
    if (r >= 4) { const t = xcTrappable(w, z.x, z.y, 150); if (t) xcTrap(w, t); }
  }
}

// ================================================================ BLOWING BUBBLES
function xcCanTrap(w, b, e) {
  if (!toyCan(e) || !small(e) || e.bubT > G.t || e.thrownT > G.t || e.dazeT > G.t || e.def.ai === 'phase') return false;
  if (canBubble(w, e)) return true;
  if (e.elite && !(b && b.xcElite)) return false;
  if (b && b.xcAny) return true;
  return e.r <= w.s.hold * ((b && b.xcHoldK) || 1);
}
function xcTrappable(w, x, y, R, not) {
  let best = null, bd = R;
  for (const e of G.enemies) { if (e.dead || (not && not.includes(e)) || !xcCanTrap(w, null, e)) continue; const d = Math.hypot(e.x - x, e.y - y) - e.r; if (d < bd) { bd = d; best = e; } }
  return best;
}
function xcTrap(w, e, o) { // a bubble closes round e where it is
  const T = TOYS(), s = w.s;
  if (T.bubbles.length >= 40 || !e || e.dead) return null;
  const b = Object.assign({ x: e.x, y: e.y, vx: 0, vy: 0, r: e.r + 12, life: s.dur, w, e, seed: Math.random() * 10, heldAt: G.t, film: (s.film || 0) * s.dmg, soaked: 0, xcTag: 1 }, o || {});
  e.bubT = G.t + b.life; e.kx = 0; e.ky = 0;
  T.bubbles.push(b); fxParts('bubble', e.x, e.y, w.def.color, 5, 60, 0.4, 3);
  return b;
}
function xcHold(b, e) { // a free bubble catches e (as toys.js bubbleTick does)
  const s = b.w.s;
  b.e = e; e.bubT = G.t + s.dur; b.heldAt = G.t; b.life = s.dur; b.r = Math.max(b.r * 0.6, e.r + 12); b.x = e.x; b.y = e.y;
  b.film = (s.film || 0) * s.dmg; b.soaked = 0; e.kx = 0; e.ky = 0;
}
function xcBlow(w, x, y, a, o) {
  const T = TOYS(), s = w.s; o = o || {};
  if (T.bubbles.length >= 40) return null;
  const sp = s.speed * rand(0.9, 1.1) * (o.spK != null ? o.spK : 1);
  const b = Object.assign({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: s.size * rand(0.85, 1.15), life: 2.6, w, e: null, seed: Math.random() * 10 }, o);
  delete b.spK; T.bubbles.push(b);
  return b;
}
// Firing: true when a cell delivered the attack.
function xcBbFire(w, target) {
  const p = G.player, R = id => xcR(w, id), S = xcS(), s = w.s;
  if (R('melee') || R('orbiting')) return true; // (the bubble round you and the orbit run in the tick)
  if (R('mines')) { // Bubble machine
    if (S.mach.filter(m => m.w === w).length < xcLv([1, 2, 2, 2], R('mines'))) S.mach.push({ w, x: p.x, y: p.y, end: G.t + (R('mines') >= 3 ? 12 : 8), next: G.t + 0.3 });
    return true;
  }
  if (R('dfa')) { // Bubble rain
    if (S.rain.filter(q => q.w === w).length < 2) {
      const c = (R('dfa') >= 4 && acquire('cluster', s.range, p.x, p.y)) || target;
      if (c) S.rain.push({ w, x: c.x, y: c.y, r: 90 * (R('dfa') >= 3 ? 1.5 : 1) * xcArea(w), end: G.t + (R('dfa') >= 2 ? 3 : 2), next: 0 });
    }
    return true;
  }
  if (!target) return false;
  const a0 = Math.atan2(target.y - p.y, target.x - p.x);
  if (R('charged')) { xcBlow(w, p.x, p.y, a0, { r: s.size * 2.2, life: 3.5, spK: 0.8, xcBig: 1, xcList: [], xcElite: R('charged') >= 4, xcTag: 1, xcPress: 1 }); sfx('shot'); return true; } // Big breath
  if (R('extra') >= 3) { // to different small enemies; the mastery blows a ring
    const n = s.count, ts = G.enemies.filter(e => !e.dead && xcCanTrap(w, null, e) && Math.hypot(e.x - p.x, e.y - p.y) < s.range).slice(0, n);
    for (let i = 0; i < n; i++) after(i * 0.06, () => {
      if (!G || !G.weapons.includes(w)) return;
      const q = G.player, t = ts.length ? ts[i % ts.length] : target;
      xcBlow(w, q.x, q.y, R('extra') >= 4 ? a0 + i / n * TAU : Math.atan2(t.y - q.y, t.x - q.x));
    });
    sfx('shot'); return true;
  }
  return false;
}
bubbleFire = (orig => function (w, target) {
  if (xcIs(w, 'bb') && xcAny(w) && xcBbFire(w, target)) return;
  return orig(w, target);
})(bubbleFire);

// A new bubble from this weapon: the cells that mark a bubble.
function xcTag(b) {
  b.xcTag = 1;
  const w = b.w, R = id => xcR(w, id);
  if (b.e) return;
  if (R('rapid') && !b.xcNoSplit) { // a mixed string: big and small, about half of them pushers that block and shove
    if (!b.xcSized) b.r *= rand(0.6, 1.5);
    if (Math.random() < 0.5) { b.dead = true; xcS().push.push({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, r: b.r, life: 2.6, w }); return; }
  }
  if (R('charged')) b.xcPress = 1; // Pressurised
  if (R('nth')) { // Iron lung (and Golden bubble from Lv 3)
    w.xcN = (w.xcN || 0) + 1;
    if (w.xcN % (R('nth') >= 2 ? 3 : 4) === 0) { b.xcIron = 1; b.xcAny = 1; if (R('nth') >= 3) b.xcGold = 1; if (R('nth') >= 4) b.xcElite = 1; }
  }
}
// Free bubbles of a weapon with cells move here, not in toys.js (so they can pass, bounce, roll on and trap bigger).
function xcFree(list, dt) {
  for (const b of list) {
    if (b.dead) continue;
    const w = b.w, s = w.s, R = id => xcR(w, id);
    if (!s || (!G.weapons.includes(w) && !w.echo)) { for (const e of b.xcList || []) e.bubT = 0; b.dead = true; continue; }
    b.life -= dt;
    if (R('homing')) { // drifts towards small enemies
      const t = xcTrappable(w, b.x, b.y, 300);
      if (t) { const sp = Math.max(60, Math.hypot(b.vx, b.vy)), ca = Math.atan2(b.vy, b.vx), na = ca + clamp(angDiff(Math.atan2(t.y - b.y, t.x - b.x), ca), -2 * R('homing') * dt, 2 * R('homing') * dt); b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp; }
    }
    const wob = Math.sin(G.realT * 3 + b.seed) * 20;
    b.x += (b.vx + -b.vy / s.speed * wob) * dt; b.y += (b.vy + b.vx / s.speed * wob) * dt;
    const dk = Math.pow(b.xcBig ? 0.85 : 0.6, dt); b.vx *= dk; b.vy *= dk;
    if (b.xcList) b.xcList.forEach((e, i) => { if (!e.dead) { const a = G.realT * 1.5 + i * 2.1; e.x = b.x + Math.cos(a) * b.r * 0.4; e.y = b.y + Math.sin(a) * b.r * 0.4; e.bubT = G.t + 1; } });
    if (R('kinship') >= 4 && !b.xcFroth && G.zones.some(z => z.life > 0 && z.src && z.src.w && w24Key(z.src.w) === 'v_ice_pool' && Math.hypot(z.x - b.x, z.y - b.y) < z.r)) { b.xcFroth = 1; b.r *= 2; b.xcAny = 1; } // Puddle froth
    let caught = null, bump = null;
    forNear(b.x, b.y, b.r, e => {
      if (!toyCan(e) || (b.xcList && b.xcList.includes(e))) return;
      if (xcCanTrap(w, b, e)) { caught = e; return true; }
      if (!(b.xcPassed && b.xcPassed.has(e))) bump = bump || e;
    });
    if (caught) {
      if (b.xcBig) { b.xcList.push(caught); caught.kx = caught.ky = 0; if (b.xcList.length >= 3) xcBigClose(b); } // Big breath rolls on, up to 3
      else xcHold(b, caught);
      continue;
    }
    if (bump) {
      if (R('piercing')) (b.xcPassed || (b.xcPassed = new Set())).add(bump); // passes big enemies
      else if (R('ricochet') && (b.xcB || 0) < XC_RAMP(R('ricochet'))) { // Bubble pinball: bounce off, grow, trap bigger
        const nx = b.x - bump.x, ny = b.y - bump.y, d = Math.hypot(nx, ny) || 1, ux = nx / d, uy = ny / d, dot = b.vx * ux + b.vy * uy;
        b.vx -= 2 * Math.min(0, dot) * ux; b.vy -= 2 * Math.min(0, dot) * uy;
        const sp = Math.hypot(b.vx, b.vy); if (sp < 90) { b.vx = ux * 90; b.vy = uy * 90; }
        b.x = bump.x + ux * (bump.r + b.r + 1); b.y = bump.y + uy * (bump.r + b.r + 1);
        b.r *= 1.1; b.xcHoldK = (b.xcHoldK || 1) * 1.1; b.xcB = (b.xcB || 0) + 1;
      } else {
        if (R('explode')) aoe(bump.x, bump.y, 50, s.dmg * 0.8, toySrc(w, 'Bubble Wand'), w.def.color); // Bubble grenade
        else { damageEnemy(bump, s.dmg, toySrc(w, 'Bubble Wand')); if (!bump.boss) { bump.chill = Math.max(bump.chill, 1); bump.chillAmt = Math.max(bump.chillAmt, 0.3); } }
        if (b.xcList && b.xcList.length) xcBigClose(b); else bubblePop(b);
        continue;
      }
    }
    if (R('ricochet')) for (const o of list) { // bubbles bounce off each other too
      if (o === b || o.dead || o.e || o.w !== w || Math.hypot(o.x - b.x, o.y - b.y) > b.r + o.r) continue;
      if (b.xcPb && b.xcPb.has(o)) continue;
      (b.xcPb || (b.xcPb = new Set())).add(o); (o.xcPb || (o.xcPb = new Set())).add(b);
      [b.vx, o.vx] = [o.vx, b.vx]; [b.vy, o.vy] = [o.vy, b.vy];
      for (const q of [b, o]) { q.r *= 1.1; q.xcHoldK = (q.xcHoldK || 1) * 1.1; }
    }
    if (b.life <= 0) { if (b.xcList && b.xcList.length) xcBigClose(b); else bubblePop(b); }
  }
}
function xcBigClose(b) { // Big breath: the rolling bubble closes on what it has caught
  const list = (b.xcList || []).filter(e => !e.dead); b.xcList = null;
  if (!list.length) { bubblePop(b); return; }
  const s = b.w.s;
  b.e = list[0]; b.extra = list.slice(1); b.heldAt = G.t; b.life = s.dur; b.film = (s.film || 0) * s.dmg; b.soaked = 0; b.vx = b.vy = 0;
  for (const e of list) e.bubT = G.t + b.life;
}
// Held bubbles after toys.js has moved them: where a cell moves them instead, and what happens as one closes.
function xcHeld(saved, dt) {
  const T = TOYS(), p = G.player;
  const held = T.bubbles.filter(b => !b.dead && b.e && b.w && xcIs(b.w, 'bb'));
  for (const b of held) {
    const w = b.w, R = id => xcR(w, id), e = b.e;
    if (b.dead || !b.e) continue;
    if (!b.xcSeen) { b.xcSeen = 1; xcOnTrap(b); }
    const inside = bubIn(b);
    if (R('pull')) { const rr = xcLv([60, 90, 120, 150], R('pull')); for (const o of G.enemies) if (!o.dead && !o.charmed && !(o.bubT > G.t) && Math.hypot(o.x - b.x, o.y - b.y) < rr + o.r) mwPull(o, b.x, b.y, 60 * dt); } // Bubble magnet
    if (w.def.sab && w.def.elem === 'fire') for (const x of inside) { const c = fightCd(x); c.bars.acid = Math.min(0.99, c.bars.acid + 0.3 * dt); } // Acid bath
    const moves = R('homing') || R('range') || b.xcClump || b.xcV;
    if (!moves) continue;
    const sv = saved.get(b); if (sv) { b.x = sv[0]; b.y = sv[1]; }
    let tx = p.x, ty = p.y, sp = Math.min(60, e.speed * 0.3) / Math.sqrt(b.boost || 1), away = false;
    if (R('homing') >= 4) sp = 120; // Return to sender
    else if (R('homing')) { const c = acquire('cluster', 500, b.x, b.y, e); if (c) { tx = c.x; ty = c.y; sp = 70; } } // Homing balloon
    else if (R('range')) { away = true; sp = 40 + 20 * R('range'); } // Bubble post
    const dx = tx - b.x, dy = ty - b.y, dd = Math.hypot(dx, dy) || 1, sg = away ? -1 : 1;
    let nx = b.x + sg * dx / dd * sp * dt, ny = b.y + sg * dy / dd * sp * dt;
    if (b.xcClump) { // Bubble pack: drift together
      const mates = held.filter(o => o !== b && o.xcClump === b.xcClump && !o.dead);
      if (mates.length) { const cx = mates.reduce((u, o) => u + o.x, 0) / mates.length, cy = mates.reduce((u, o) => u + o.y, 0) / mates.length, d = Math.hypot(cx - b.x, cy - b.y) || 1; if (d > b.r) { nx += (cx - b.x) / d * 50 * dt; ny += (cy - b.y) / d * 50 * dt; } }
    }
    if (b.xcV) {
      const V = b.xcV; nx += V.x * dt; ny += V.y * dt;
      if (!V.rubber) { const k = Math.exp(-(V.decay || 4) * dt); V.x *= k; V.y *= k; if (Math.hypot(V.x, V.y) < 10) b.xcV = null; }
      const o = xcFoe(nx, ny, b.r, V.not ? inside.concat([V.not]) : inside);
      if (o && V.rubber && !(o.xcRubT > G.t)) { // Rubber bubble: bounces, hurting what it hits, without breaking
        o.xcRubT = G.t + 0.4; damageEnemy(o, w.s.dmg * 2.2, toySrc(w, 'Bubble pop', { knock: 140, kx: o.x - b.x, ky: o.y - b.y }));
        const ux = (b.x - o.x), uy = (b.y - o.y), l = Math.hypot(ux, uy) || 1, sp2 = Math.hypot(V.x, V.y) || 140; V.x = ux / l * sp2; V.y = uy / l * sp2;
      } else if (o && (V.pushM || (V.knockM && G.t - V.t0 > 0.1 && Math.hypot(V.x, V.y) > 100))) { bubblePop(b, Math.atan2(V.y, V.x), V.knockM); continue; } // (Personal space and Beach ball masteries)
    }
    if (G.lvl && lvSolidAt(nx, ny)) { if (b.xcV) { b.xcV.x *= -1; b.xcV.y *= -1; } } else { b.x = nx; b.y = ny; }
    e.x = b.x; e.y = b.y;
    if (b.extra) b.extra.forEach((x, i) => { const a = G.realT * 1.5 + i * 2.4; x.x = b.x + Math.cos(a) * b.r * 0.45; x.y = b.y + Math.sin(a) * b.r * 0.45; });
  }
  // Bubble pack and Stuck together: held bubbles that meet join one group
  let id = G.xcGid || 0;
  for (const b of held) {
    if (b.dead) continue;
    const w = b.w, cn = xcR(w, 'connecting'), st = xcR(w, 'sticky') >= 4;
    if (!cn && !st) continue;
    for (const o of held) {
      if (o === b || o.dead || o.w !== w) continue;
      const d = Math.hypot(o.x - b.x, o.y - b.y);
      if (cn && d < 140 && !(b.xcClump && b.xcClump === o.xcClump)) {
        const cap = cn >= 4 ? 5 : 3, k = b.xcClump || o.xcClump || ++id, size = held.filter(q => q.xcClump === k).length;
        if (size + (b.xcClump === k ? 0 : 1) + (o.xcClump === k ? 0 : 1) <= cap) { b.xcClump = k; o.xcClump = k; }
      }
      if (st && d < b.r + o.r) { const k = b.xcGrp || o.xcGrp || ++id; for (const q of held) if (q.xcGrp && (q.xcGrp === b.xcGrp || q.xcGrp === o.xcGrp)) q.xcGrp = k; b.xcGrp = o.xcGrp = k; }
    }
  }
  G.xcGid = id;
}
function xcOnTrap(b) {
  const w = b.w, R = id => xcR(w, id), p = G.player, e = b.e;
  if (R('upclose') && Math.hypot(b.x - p.x, b.y - p.y) < 120) { // Personal space: pushed away from you as it closes
    const a = Math.atan2(b.y - p.y, b.x - p.x), v = R('upclose') >= 4 ? 1000 : 500;
    b.xcV = { x: Math.cos(a) * v, y: Math.sin(a) * v, decay: 5, pushM: R('upclose') >= 4 };
  }
  if (R('ricochet') >= 4) { const a = Math.random() * TAU; b.xcV = { x: Math.cos(a) * 140, y: Math.sin(a) * 140, rubber: 1 }; }
  if (R('primer') && !(e.mwPr && e.mwPr.t > G.t)) e.mwPr = { w, t: G.t + b.life, by: new Set(), steps: 0 }; // Gift wrap
  if (R('piercing') >= 4 && !(b.extra && b.extra.length)) { const t = xcTrappable(w, b.x, b.y, b.r + 20, [e]); if (t) { b.extra = [t]; t.bubT = e.bubT; t.kx = t.ky = 0; } }
}
// Every bubble inflates before it is sent (user, 23 Oct): it grows from nothing on your nose (or the machine's nozzle, or
// its spot in the rain), then leaves. Inflating bubbles sit out of the tick: they can't trap or pop yet.
function xcInflate(dt) {
  const T = TOYS(), p = G.player, out = [];
  T.bubbles = T.bubbles.filter(b => {
    if (b.dead || b.e || b.xcInfDone) return true;
    let I = b.xcInf;
    if (!I) {
      I = b.xcInf = { t: 0, max: b.xcBig ? 0.6 : 0.25, r: b.r, vx: b.vx, vy: b.vy }; // (Big breath: a longer inhale)
      if (b.w && xcIs(b.w, 'bb') && xcR(b.w, 'rapid') && !b.xcNoSplit) { I.r *= rand(0.6, 1.5); b.xcSized = 1; } // (Rapid Fire's mixed sizes)
    }
    I.t += dt; const k = Math.min(1, I.t / I.max);
    b.r = Math.max(2, I.r * k); b.vx = b.vy = 0;
    if (b.xcAnchor) { b.x = b.xcAnchor.x; b.y = b.xcAnchor.y; }
    else { const a = Math.atan2(I.vy, I.vx); b.x = p.x + Math.cos(a) * (p.r + b.r); b.y = p.y + Math.sin(a) * (p.r + b.r); }
    if (k < 1) { out.push(b); return false; }
    b.xcInfDone = 1; b.vx = I.vx; b.vy = I.vy; b.r = I.r;
    return true;
  });
  return out;
}
bubbleTick = (orig => function (dt) {
  if (!G) return orig(dt);
  const infl = xcInflate(dt);
  try { xcBubbleTick(orig, dt); } finally { TOYS().bubbles.push(...infl); }
})(bubbleTick);
function xcBubbleTick(orig, dt) {
  if (!G.weapons.some(w => w && xcIs(w, 'bb') && xcAny(w))) return orig(dt);
  const T = TOYS(), own = [], keep = [], saved = new Map();
  for (const b of T.bubbles) {
    if (!b.dead && b.w && xcIs(b.w, 'bb') && xcAny(b.w)) {
      if (!b.xcTag) xcTag(b);
      if (b.dead) continue;
      if (!b.e) { own.push(b); continue; }
      saved.set(b, [b.x, b.y]);
    }
    keep.push(b);
  }
  T.bubbles = keep;
  xcFree(own, dt);
  const bw = G.weapons.filter(w => w && xcIs(w, 'bb')), eb = G.ebul, unpop = bw.every(w => xcR(w, 'piercing'));
  if (unpop) G.ebul = []; // Unpoppable: enemy shots pass through bubbles
  try { orig(dt); } finally { if (unpop) G.ebul = eb; }
  for (const b of own) if (!b.dead) TOYS().bubbles.push(b);
  xcHeld(saved, dt);
}
bubbleSoak = (orig => function (b, d) {
  const w = b && b.w;
  if (w && b.e && xcIs(w, 'bb')) {
    if (xcR(w, 'ricochet') >= 4) return true; // Rubber bubble
    if (xcR(w, 'knock')) { xcKnockB(b, null); return true; } // Beach ball: knocked away, not popped
  }
  return orig(b, d);
})(bubbleSoak);
function xcKnockB(b, a) {
  const r = xcR(b.w, 'knock');
  if (a == null) { const o = xcFoe(b.x, b.y, b.r + 40, bubIn(b)); a = o ? Math.atan2(b.y - o.y, b.x - o.x) : Math.random() * TAU; }
  const v = 250 * (1 + 0.5 * (Math.min(3, r) - 1));
  b.xcV = { x: Math.cos(a) * v, y: Math.sin(a) * v, decay: 4, knockM: r >= 4, t0: G.t, not: xcFoe(b.x, b.y, b.r + 40, bubIn(b)) };
}
const XCB = { gift: 0 };
bubbleHit = (orig => function (e, src, dmg) {
  const b = TOYS().bubbles.find(o => !o.dead && (o.e === e || (o.extra && o.extra.includes(e))));
  if (b && b.w && xcIs(b.w, 'bb')) {
    if (XCB.gift) return true;
    if (xcR(b.w, 'primer') && src && src.w && src.w !== b.w && !src.mwDet && e.mwPr && e.mwPr.w === b.w && e.mwPr.t > G.t) { // Gift wrap: it detonates, the bubble holds
      const M = e.mwPr; e.mwPr = null; XCB.gift = 1;
      try { mwDetonate(e, b.w, M); } finally { XCB.gift = 0; }
      return true;
    }
    if (xcR(b.w, 'knock') && src && !src.dot) { xcKnockB(b, Math.atan2(src.ky != null ? src.ky : e.y - G.player.y, src.kx != null ? src.kx : e.x - G.player.x)); return true; }
  }
  return orig(e, src, dmg);
})(bubbleHit);
wupDmgMul = (orig => function (e, src) { return orig(e, src) * (XCB.gift && src && src.mwDet ? 1.5 : 1); })(wupDmgMul);
bubblePop = (orig => function (b, throwA, fling) {
  if (!b || b.dead || !b.w || !xcIs(b.w, 'bb')) return orig(b, throwA, fling);
  const w = b.w, R = id => xcR(w, id), s = w.s, p = G.player, inside = bubIn(b);
  if (inside.length) {
    if (b.xcPress) { if (!b.xcPressT) { b.xcPressT = G.t; b.xcPress2 = 1; b.wob = G.realT; return; } if (G.t - b.xcPressT < 0.35) return; } // Pressurised: the first touch only dents it
    if (b.xcIron && G.t - (b.heldAt || G.t) < 3 && b.life > 0) return; // Iron lung
  }
  const boost = b.boost || 1, held = clamp((G.t - (b.heldAt || G.t)) / 3, 0, 1);
  if (b.xcPress2) b.soaked = (b.soaked || 0) + s.dmg * 2.2 * (1 + held); // (double damage)
  const Rp = (70 + b.r * 1.2) * Math.sqrt(boost), dmg = (s.dmg * 2.2 * (1 + held) + (b.soaked || 0)) * boost, x = b.x, y = b.y;
  const soup = R('catalyst') >= 4 ? inside.map(e => (e.cd ? Object.assign({}, e.cd.bars) : null)).filter(Boolean) : [], chill = Math.max(0, ...inside.map(e => e.chill || 0));
  if (R('explode') >= 4 && inside.length) { fling = true; if (throwA == null) throwA = Math.atan2(y - p.y, x - p.x); }
  const clump = b.xcClump, grp = b.xcGrp;
  orig(b, throwA, fling);
  if (!b.dead || !inside.length) return;
  const out = new Set(inside);
  const band = (r0, r1, k, name) => forNear(x, y, r1, o => { if (out.has(o) || !toyCan(o) || Math.hypot(o.x - x, o.y - y) < r0) return; damageEnemy(o, dmg * k, toySrc(w, name || 'Bubble pop', { knock: 100, kx: o.x - x, ky: o.y - y })); });
  if (R('explode')) { band(Rp, Rp * 2, 0.7); ring(x, y, Rp * 2, w.def.color, 0.35, 4); } // pops are full blasts
  const ak = xcArea(w);
  if (ak > 1) { band(Rp, Rp * ak, 1); after(1, () => { if (!G) return; band(0, Rp * ak, 0.5); ring(x, y, Rp * ak, w.def.color, 0.3, 2); fxParts('bubble', x, y, w.def.color, 10, 120, 0.6, 2); }); } // Area, Bubble cloud
  if (b.xcInfl) { band(Rp, Rp * 3, 1); ring(x, y, Rp * 3, w.def.color, 0.35, 4); } // Inflating mastery
  if (w.def.sab && w.def.elem === 'shock') { const seen = [...inside]; for (let i = 0; i < 2; i++) { const o = xcFoe(x, y, 140, seen); if (!o) break; seen.push(o); bolt(x, y, o.x, o.y, w.def.color, 0.16); damageEnemy(o, s.dmg, toySrc(w, 'Bubble pop', { elem: 'shock' })); } } // Static: the pop arcs
  if (soup.length) forNear(x, y, Rp, o => { if (out.has(o) || o.charmed) return; const c = fightCd(o); for (const B of soup) for (const k in B) if (k in c.bars) c.bars[k] = Math.max(c.bars[k], Math.min(0.99, B[k] * 0.6)); o.chill = Math.max(o.chill || 0, chill * 0.6); }); // Bubble soup
  if (R('sticky')) { const S = xcS(); if (S.gum.length < 12) S.gum.push({ w, x, y, r: 45, end: G.t + 4 }); } // Gum bubble
  if (R('primer') >= 3) forNear(x, y, Rp, o => { if (out.has(o) || !o.mwPr || o.mwPr.t <= G.t) return; const M = o.mwPr; o.mwPr = null; mwDetonate(o, M.w, M); });
  if (R('range') >= 4) for (const e of inside) if (!e.dead && !e.boss) shove(e, p.x, p.y, 500); // Bubble post: dropped far behind the front
  if (b.xcGold) forNear(x, y, Rp * 1.2, o => { o.xcGold = G.t + 1.5; }); // Golden bubble
  const T = TOYS();
  if (grp) { const g = T.bubbles.filter(o => !o.dead && o !== b && o.xcGrp === grp); for (const o of g) o.xcGrp = 0; g.forEach((o, i) => after(0.05 * (i + 1), () => bubblePop(o))); } // Stuck together
  if (clump) { // Bubble pack: the whole clump goes, each pop bigger than the last
    const g = T.bubbles.filter(o => !o.dead && o !== b && o.xcClump === clump), cn = R('connecting');
    for (const o of g) o.xcClump = 0;
    g.forEach((o, i) => after(0.08 * (i + 1), () => {
      if (o.dead) return; if (cn >= 3) o.boost = (o.boost || 1) * (1 + 0.2 * (i + 1));
      const ox = o.x, oy = o.y; bubblePop(o);
      if (cn >= 4 && i === g.length - 1) { const t = xcTrappable(w, ox, oy, 150); if (t) xcTrap(w, t); }
    }));
  }
})(bubblePop);

function xcBbTick(w, dt) {
  const R = id => xcR(w, id), p = G.player, S = xcS(), s = w.s;
  // Melee: a bubble round you; touched, it pops (and from Lv 3 it eats shots first)
  if (R('melee')) {
    const r = R('melee'), Sh = w.xcSh || (w.xcSh = { up: true, g: 1, abs: xcLv([0, 0, 1, 3], r) }), rad = p.r + 26;
    if (!Sh.up) { Sh.g = Math.min(1, Sh.g + dt / (r >= 2 ? 2 : 3)); if (Sh.g >= 1) { Sh.up = true; Sh.abs = xcLv([0, 0, 1, 3], r); } } // (it grows back from tiny)
    if (Sh.up) {
      let pop = null;
      const o = xcFoe(p.x, p.y, rad); if (o) pop = o;
      if (!pop && r >= 3) for (const q of G.ebul) if (!q.dead && Math.hypot(q.x - p.x, q.y - p.y) < rad + q.r) { q.dead = true; Sh.abs--; if (Sh.abs <= 0) { pop = 'shot'; break; } }
      if (pop) {
        aoe(p.x, p.y, 80, s.dmg * 2.2, toySrc(w, 'Bubble pop', { elem: 'phys', knock: 180 }), V10_COL.phys); // a Force explosion (aoe adds Area itself)
        fxParts('bubble', p.x, p.y, w.def.color, 8, 90, 0.5, 3);
        if (r >= 4 && pop !== 'shot' && xcCanTrap(w, null, pop)) xcTrap(w, pop);
        Sh.up = false; Sh.g = 0;
      }
    }
  } else w.xcSh = null;
  // Orbiting: bubbles circle you and trap what touches them
  if (R('orbiting')) {
    const r = R('orbiting'), n = r >= 2 ? 3 : 2, rad = r >= 3 ? 90 : 72, O = w.xcOrb || (w.xcOrb = { a: 0, slots: [] });
    O.a += 2.4 * dt; while (O.slots.length < n) O.slots.push({ ready: 0 });
    O.slots.length = n;
    const cool = r >= 4 ? 2 : Math.max(1.5, s.cd * 2);
    O.slots.forEach((sl, i) => {
      const a = O.a + i / n * TAU; sl.x = p.x + Math.cos(a) * rad; sl.y = p.y + Math.sin(a) * rad;
      if (sl.ready > G.t) return;
      const e = xcFoe(sl.x, sl.y, s.size * 0.6);
      if (e) {
        if (xcCanTrap(w, null, e)) xcTrap(w, e);
        else { damageEnemy(e, s.dmg, toySrc(w, 'Bubble Wand')); fxParts('bubble', sl.x, sl.y, w.def.color, 5, 70, 0.4, 3); }
        sl.ready = G.t + cool; return;
      }
      if (r >= 3) for (const q of G.ebul) if (!q.dead && Math.hypot(q.x - sl.x, q.y - sl.y) < s.size * 0.6 + q.r) { q.dead = true; fxParts('bubble', sl.x, sl.y, w.def.color, 4, 60, 0.3, 3); sl.ready = G.t + cool; break; }
    });
  } else w.xcOrb = null;
  // Catalyst, Test tube: statuses tick faster inside the bubble
  if (R('catalyst') && !(w.xcTubeT > G.t)) {
    w.xcTubeT = G.t + 0.5;
    for (const b of TOYS().bubbles) if (!b.dead && b.w === w && b.e) for (const e of bubIn(b)) {
      const d = (e.v10bdps || 0) + (e.burnDps || 0) + (e.poisonDps || 0);
      if (d > 0) damageEnemy(e, d * 0.25, Object.assign(weaponSrc(w), { dot: true, noCrit: true, wname: 'Bubble Wand' }));
    }
  }
}
function xcBbShared(dt) { // pushers, machines, rain and gum (lists shared by every bubble weapon)
  const S = xcS();
  for (const q of S.push) { // Rapid Fire: pushers block and shove
    if (!G.weapons.includes(q.w)) { q.life = 0; continue; }
    q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; const k = Math.pow(0.75, dt); q.vx *= k; q.vy *= k;
    const sp = Math.hypot(q.vx, q.vy) || 1;
    forNear(q.x, q.y, q.r, e => {
      if (e.charmed) return;
      if (!(q.hit || (q.hit = new Set())).has(e)) { q.hit.add(e); damageEnemy(e, q.w.s.dmg * 0.5, toySrc(q.w, 'Bubble Wand')); } // (a light hit, once each)
      if (!e.boss) { e.kx += q.vx / sp * 40; e.ky += q.vy / sp * 40; msSlow(e, 0.3, 0.6); }
    });
    for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - q.x, b.y - q.y) < q.r + b.r) b.dead = true;
    if (xcR(q.w, 'rapid') >= 4) for (const o of S.push) { // two pushers that touch merge into one that traps larger enemies
      if (o === q || o.life <= 0 || q.life <= 0 || o.w !== q.w || Math.hypot(o.x - q.x, o.y - q.y) > q.r + o.r) continue;
      xcBlow(q.w, (q.x + o.x) / 2, (q.y + o.y) / 2, Math.atan2(q.vy + o.vy, q.vx + o.vx), { spK: 0.3, r: Math.hypot(q.r, o.r), xcHoldK: 1.6, xcNoSplit: 1, xcInfDone: 1 });
      q.life = o.life = 0;
    }
    if (q.life <= 0) fxParts('bubble', q.x, q.y, q.w.def.color, 3, 50, 0.3, 2);
  }
  S.push = S.push.filter(q => q.life > 0);
  for (const m of S.mach) { // Bubble machine
    if (m.end < G.t || !G.weapons.includes(m.w)) { m.end = 0; continue; }
    if (m.next > G.t) continue;
    const r = xcR(m.w, 'mines'); m.next = G.t + (r >= 3 ? 1 : 1.5);
    const t = xcTrappable(m.w, m.x, m.y, 350) || xcFoe(m.x, m.y, 350); if (!t) continue;
    const a = Math.atan2(t.y - m.y, t.x - m.x);
    for (let i = 0; i < (r >= 4 ? 2 : 1); i++) xcBlow(m.w, m.x, m.y, a + i * 0.25, { xcAnchor: { x: m.x + Math.cos(a + i * 0.25) * 12, y: m.y + Math.sin(a + i * 0.25) * 12 } });
  }
  S.mach = S.mach.filter(m => m.end > 0);
  for (const q of S.rain) { // Bubble rain
    if (q.end < G.t || !G.weapons.includes(q.w)) { q.end = 0; continue; }
    if (xcR(q.w, 'dfa') >= 4) { const c = acquire('cluster', q.w.s.range || 380, G.player.x, G.player.y); if (c) { q.x += (c.x - q.x) * Math.min(1, 1.5 * dt); q.y += (c.y - q.y) * Math.min(1, 1.5 * dt); } }
    if (q.next > G.t) continue;
    q.next = G.t + 0.12;
    const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * q.r, x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d;
    xcBlow(q.w, x, y, Math.random() * TAU, { spK: 0.05, life: 0.6, r: q.w.s.size * 0.7, xcAnchor: { x, y } });
  }
  S.rain = S.rain.filter(q => q.end > 0);
  for (const g of S.gum) forNear(g.x, g.y, g.r, o => { if (!o.charmed && !(o.xcGumT > G.t)) { msSnare(o, 1); o.xcGumT = G.t + 1.5; } }); // Gum bubble
  S.gum = S.gum.filter(g => g.end > G.t);
}

// ---------------------------------------------------------------- hits and kills
function xcHit(e, res, src) {
  if (!src || !G) return;
  const w = src.w;
  if (w && xcIs(w, 'nm') && xcR(w, 'catalyst')) e.xcHotW = w; // (Hot nappy reads it)
  for (const ow of G.weapons) {
    if (!ow || ow === w || !xcAny(ow)) continue;
    if (xcIs(ow, 'nm') && xcR(ow, 'kinship') && w && !w.isSpell && mwType(w) === mwType(ow) && !src.dot) // Family gathering
      for (const q of G.proj) if (q.mine && !q.dead && q.w === ow && q.arm <= 0 && Math.hypot(q.x - e.x, q.y - e.y) < e.r + 30) { q.xcK = (q.xcK || 1) * 1.3; xcGo(q, null); }
    if (xcIs(ow, 'bb') && xcR(ow, 'kinship') && w && !w.isSpell && mwType(w) === 'ice' && e.chill > 0 && !e.dead && !(ow.xcSnotT > G.t) && xcCanTrap(ow, null, e)) { ow.xcSnotT = G.t + 1; xcTrap(ow, e); } // Snot bubbles
  }
  if (!w || !xcIs(w, 'bb') || e.dead) return;
  const R = id => xcR(w, id);
  if (R('sticky') && src.wname === 'Bubble Wand' && !xcCanTrap(w, null, e)) { msSlow(e, 0.4, 2); e.shootCd = Math.max(e.shootCd || 0, 1.5); } // Gummed up
  if (R('focus') && !e.boss && !(e.bubT > G.t) && !xcCanTrap(w, null, e)) { // Inflating
    if (G.t - (e.xcInfT || 0) > 3) e.xcInfN = 0;
    e.xcInfN = (e.xcInfN || 0) + 1; e.xcInfT = G.t; msSlow(e, Math.min(0.6, 0.1 * e.xcInfN), 1.5);
    if (e.xcInfN >= xcLv([5, 4, 3, 3], R('focus')) && !e.elite) { e.xcInfN = 0; const b = xcTrap(w, e, { r: e.r + 16 }); if (b) b.xcInfl = R('focus') >= 4; }
  }
}
wupHit = (orig => function (e, res, src) { orig(e, res, src); xcHit(e, res, src); })(wupHit);
function xcKill(e, src) {
  if (!G) return;
  if (e.xcGold > G.t) dropGem(e.x, e.y, Math.max(1, e.xp || 1), 'x'); // Golden bubble: extra DNA
  const w = src && src.w;
  if (!w || !xcAny(w) || !xcR(w, 'turncoat') || e.elite || e.boss || e.rival || e.egg || e.charmed || e.mwAllyOf) return;
  if (Math.random() < MW_TURN_CH[xcR(w, 'turncoat') - 1]) xcRise(w, e);
}
wupKill = (orig => function (e, src) { orig(e, src); xcKill(e, src); })(wupKill);

// ---------------------------------------------------------------- every frame
function xcTick(dt) {
  if (!G || G.state !== 'play') return;
  for (const w of G.weapons) {
    if (!w || !xcAny(w)) continue;
    if (xcIs(w, 'nm')) xcNmTick(w, dt); else xcBbTick(w, dt);
  }
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (e.xcHeldT > G.t) { e.x = e.xcHX; e.y = e.xcHY; e.kx = 0; e.ky = 0; } // Fly paper
    if (e.xcRun) xcRunTick(e, dt);
    if (e.xcCan && e.xcCan.t > G.t) { // Cannonball
      const C = e.xcCan, o = msNear(e.x, e.y, e.r + 4, [e]);
      if (o && !o.charmed && G.weapons.includes(C.w)) { damageEnemy(o, C.w.s.dmg * 0.4, msEcho(weaponSrc(C.w))); shove(o, e.x, e.y, C.f * 0.6); e.xcCan = null; }
      else if (xcR(C.w, 'knock') >= 4) for (const q of G.proj) if (q.mine && !q.dead && q.w === C.w && q.arm <= 0 && Math.hypot(q.x - e.x, q.y - e.y) < e.r + 20) { xcGo(q, null); e.xcCan = null; break; }
    }
  }
  if (G.xcS) xcBbShared(dt);
}
wupTick = (orig => function (dt) { orig(dt); xcTick(dt); })(wupTick);

// ---------------------------------------------------------------- drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  const p = G.player;
  ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * S);
  for (const w of G.weapons) {
    if (!w || !xcAny(w)) continue;
    const c = col(w.def.color);
    if (w.xcOrb) for (const sl of w.xcOrb.slots) { // orbiting mines and bubbles
      if (sl.x == null) continue;
      ctx.globalAlpha = sl.ready > G.t ? 0.25 : 0.9; ctx.strokeStyle = c; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx(sl.x), sy(sl.y), (xcIs(w, 'bb') ? w.s.size * 0.6 : 7) * S, 0, TAU);
      if (xcIs(w, 'bb')) ctx.stroke(); else ctx.fill();
    }
    if (w.xcWires) { ctx.globalAlpha = 0.6; ctx.strokeStyle = c; ctx.setLineDash([4 * S, 4 * S]); for (const [a, b] of w.xcWires) { if (a.dead || b.dead) continue; ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y)); ctx.lineTo(sx(b.x), sy(b.y)); ctx.stroke(); } ctx.setLineDash([]); } // tripwires
    if (xcIs(w, 'nm') && xcR(w, 'charged')) for (const q of G.proj) if (q.mine && !q.dead && q.w === w) { const k = xcRipe(q) - 1; if (k > 0.05) { ctx.globalAlpha = 0.25 + 0.35 * k / 1.8; ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), (9 + 6 * k) * S, 0, TAU); ctx.stroke(); } } // ripening
    if (w.xcSh && w.xcSh.g > 0.02) { const r = (p.r + 26) * Math.max(0.05, w.xcSh.g) * S, a = w.xcSh.up ? 1 : 0.6; ctx.globalAlpha = 0.18 * a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), r, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.7 * a; ctx.strokeStyle = c; ctx.stroke(); } // the bubble round you (growing back after a pop)
  }
  if (G.xcS) {
    const X = G.xcS;
    for (const q of X.push) { ctx.globalAlpha = 0.35; ctx.fillStyle = col(q.w.def.color); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.r * S, 0, TAU); ctx.fill(); }
    for (const m of X.mach) { const c = col(m.w.def.color); ctx.globalAlpha = 0.9; ctx.strokeStyle = c; ctx.strokeRect(sx(m.x) - 7 * S, sy(m.y) - 5 * S, 14 * S, 10 * S); ctx.beginPath(); ctx.arc(sx(m.x) + 7 * S, sy(m.y) - 5 * S, 4 * S, 0, TAU); ctx.stroke(); }
    for (const q of X.rain) { ctx.globalAlpha = 0.35; ctx.strokeStyle = col(q.w.def.color); ctx.setLineDash([5 * S, 5 * S]); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.r * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    for (const g of X.gum) { ctx.globalAlpha = 0.25 * Math.min(1, (g.end - G.t) / 1); ctx.fillStyle = col('#ff8fc8'); ctx.beginPath(); ctx.arc(sx(g.x), sy(g.y), g.r * S, 0, TAU); ctx.fill(); }
  }
  for (const z of G.enemies) if (z.xcRun && !z.dead && xcIs(z.xcRun.w, 'bb')) { ctx.globalAlpha = 0.6; ctx.strokeStyle = col(z.xcRun.w.def.color); ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), (z.r + 10) * S, 0, TAU); ctx.stroke(); } // hamster balls
  ctx.restore();
})(modDraw);
