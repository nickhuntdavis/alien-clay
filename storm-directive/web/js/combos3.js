'use strict';
// Spawn Prawn - Weapon Combos for the Armoury and the Playpen (batch 1: eight of them, one per starting sequence).
// They use the ordinary combo schema (combos.js: fused at Lv 5+ by the fusion ceremony in fusion.js, both weapons keep
// firing, bonus mount, Switched at Birth twists from chem.js TWISTS via comboSrc). The sum of what each one does:
//   c_driveby      Runaway Pram + Spitball          pram sprays Spitballs on the move, pile-up ends in a ring of 12
//   c_onetwo_deliv Gut Punch + Placenta Paddle      paddle hits throw a free Gut Punch at the toughest foe near
//   c_livemains    Fork in the Socket + Hairbrush   three prongs, auto brush swings along the beam, held foes overload
//   c_aunties_revenge Sticky Fingers + Wet Kiss     reeled foes get three kisses and a lip-print Cooties cloud
//   c_waterdelivery Waters Breaking + Bath Bomb     every gush flings four bath bombs; their pools pull and hit double
//   c_towel_snap   Hanky Panky + Flagellum Flail    the last quarter of a lash SNAPs: triple damage, stun, snot cloud
//   c_packed_lunch Juice Box + Upchuck              the carton lands in an Upchuck puddle and the puddle boils over
//   c_guthrie_test Heel Prick + Gene Gun            helices home on Heel Prick marks and CRISPR them
// Hooks: combos.js comboFire (combo3Fire), comboHit (combo3Hit), comboTick (combo3Tick), comboLash (combo3Lash);
// playpen.js penEnd (combo3Pram), penFire juicebox (combo3Carton, combo3Boil).

COMBOS.push(
  { id: 'c_driveby', a: 'pram', b: 'blaster', name: 'Drive-By Pramming', desc: 'A rolling pram spits Spitballs at the 2 nearest enemies every 0.12s. The pile-up ends in a ring of 12 piercing Spitballs. Unattended pushchair, loaded with biological projectiles.' },
  { id: 'c_onetwo_deliv', a: 'gutpunch', b: 'paddle', name: 'One-Two Delivery', desc: 'Paddle hits throw an automatic Gut Punch at the toughest enemy nearby. On a Melting enemy it hits 75% harder, strips 4 armour and shoves its neighbours back. First the blunt trauma, then the digestive juices.' },
  { id: 'c_livemains', a: 'fork', b: 'hairbrush', name: 'Live Mains', desc: 'The Fork beam splits into 3 prongs, and every 0.4s the Hairbrush swings along it, hitting everything between you and the target. Held for 1.5s, the target overloads and cannot move. Two hundred and forty volts through nylon bristles.' },
  { id: 'c_aunties_revenge', a: 'sticky', b: 'wetkiss', name: "Auntie's Revenge", desc: 'Whatever Sticky Fingers reels in gets 3 Wet Kisses, then a lip-print cloud (3.5s) that gives 2 doses of Cooties and glues everything in it for 1.5s. Unavoidable festive greeting from a distant relative.' },
  { id: 'c_waterdelivery', a: 'waters', b: 'bathbomb', name: 'Water Delivery', desc: 'Every Waters Breaking gush also flings 4 Bath Bombs north, south, east and west. Their puddles pull enemies in and hit twice as hard. Premature rupture of the amniotic sac, with lavender.' },
  { id: 'c_towel_snap', a: 'hanky', b: 'flail', name: 'Locker Room Towel', desc: 'Hit with the last quarter of a Flail lash and the towel SNAPs: triple damage, stunned for 1.2s, and a cloud of Cooties along the whole lash. Medically hazardous contact.' },
  { id: 'c_packed_lunch', a: 'juicebox', b: 'upchuck', name: 'Packed Lunch', desc: 'The empty Juice Box is thrown at the nearest Upchuck puddle, which boils over: 60% wider for 3s, hits harder and melts 1 armour every 0.3s. Warm apple juice and inevitable regret.' },
  { id: 'c_guthrie_test', a: 'heelprick', b: 'genegun', name: 'Guthrie Test', desc: 'Gene Gun helices home in on enemies Heel Prick has marked. A marked enemy hit by one loses 15% of its health (4% of a boss), bleeds at triple rate for 4s and passes its edit to 3 neighbours. Five drops on filter paper.' },
);
for (const c of COMBOS) COMBO_BY[c.id] = c;

const c3Seg = (px, py, x1, y1, x2, y2) => { // distance from a point to a line segment
  const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L2));
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
};
const c3Dose = (o, dps, n, src) => { o.poison = 4; o.poisonStacks = Math.min(G.P.poisonCap, (o.poisonStacks || 0) + n); setPoison(o, dps, src); };

// ---------------------------------------------------------------- after a weapon fires (comboFire)
function combo3Fire(w, target) {
  if (w.id === 'fork' && comboOn('c_livemains')) { // how long the beam has sat on one target
    if (!(w.cmbSeen > G.t - 0.5) || w.cmbOn !== w.forkOn) { w.cmbT0 = G.t; w.cmbOv = 0; }
    w.cmbOn = w.forkOn; w.cmbSeen = G.t;
  }
  if (w.id === 'waters' && comboOn('c_waterdelivery')) {
    const bw = comboW('bathbomb');
    if (!bw || !bw.s) return;
    const p = me(), s = bw.s, src = comboSrc(bw, 'Water Delivery'), R = Math.max(130, (w.s.area || 100) * 0.8);
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      if (G.proj.length >= CAPS.proj) break;
      G.proj.push({ lob: true, sx: p.x, sy: p.y, tx: p.x + dx * R, ty: p.y + dy * R, x: p.x, y: p.y, t: 0, flight: s.flight || 0.65, w: bw, src, color: bw.def.color, dead: false });
    }
  }
}

// ---------------------------------------------------------------- every hit (comboHit)
function combo3Hit(e, dmg, src) {
  const id = src.w.id, p = me();
  if (id === 'paddle' && comboOn('c_onetwo_deliv') && cmbEvery('onetwo', 0.4)) {
    const gw = comboW('gutpunch');
    if (!gw || !gw.s) return;
    let best = e;
    forNear(e.x, e.y, 140, o => { if (!o.dead && !o.charmed && o.maxHp > best.maxHp) best = o; });
    const melting = best.burn > 0, gs = comboSrc(gw, 'One-Two Delivery', { knock: 0 });
    damageEnemy(best, gw.s.dmg * 1.5 * (melting ? 1.75 : 1), gs);
    floatText(best.x, best.y - best.r - 10, melting ? 'ONE-TWO!' : 'ONE-TWO', gw.def.color, melting ? 14 : 12, 0.6);
    fxParts('spark', best.x, best.y, gw.def.color, 8, 150, 0.5, 3);
    if (melting && !best.dead) {
      best.shred = Math.min(best.armour + 4, (best.shred || 0) + 4);
      forNear(best.x, best.y, 120, o => { if (o !== best) shove(o, best.x, best.y, 180); });
      ring(best.x, best.y, 120, gw.def.color, 0.4, 5); cam.shake = Math.min(8, cam.shake + 2); sfx('boom');
    }
  }
  if (id === 'sticky' && comboOn('c_aunties_revenge') && !e.dead && cmbEvery('aunt', 0.9)) {
    const wk = comboW('wetkiss');
    if (!wk || !wk.s) return;
    const a = Math.atan2(e.y - p.y, e.x - p.x), ks = comboSrc(wk, "Auntie's Revenge");
    for (let i = 0; i < 3; i++) { const pr = spawnProj(wk, p.x, p.y, a + (i - 1) * 0.12, ks, { dmg: wk.s.dmg * 0.8, noMods: true, homing: 6 }); if (pr) pr.tgt = e; }
    floatText(e.x, e.y - e.r - 10, 'MWAH', wk.def.color, 13, 0.6);
    after(0.35, () => {
      if (!G || !wk.s) return;
      const x = e.x, y = e.y;
      forNear(x, y, 90, o => { if (o.dead) return; glue(o, 1.5); c3Dose(o, wk.s.dmg * 0.3, 2, ks); });
      if (G.zones.length < 240) G.zones.push({ x, y, r: 90, life: 3.5, max: 3.5, dps: wk.s.dmg * 0.8, elem: 'poison', pull: 0, color: wk.def.color, tick: 0, src: ks });
      ring(x, y, 90, wk.def.color, 0.5, 5); fxParts('smoke', x, y, wk.def.color, 10, 90, 0.8, 5); sfx('hit');
    });
  }
  if (id === 'heelprick' && comboOn('c_guthrie_test')) e.weakT = G.t + 5;
  if (id === 'genegun' && comboOn('c_guthrie_test') && e.weakT > G.t && !e.dead) {
    const hw = comboW('heelprick'), gg = comboW('genegun');
    if (!hw || !gg) return;
    e.weakT = 0;
    const cap = e.boss ? e.maxHp * 0.04 : Infinity, ks = comboSrc(gg, 'Guthrie Test', { noCrit: true });
    damageEnemy(e, Math.min(e.hp * 0.15, cap), ks);
    if (e.dead) return;
    e.bloodT = 4; e.bloodN = Math.min(5, (e.bloodN || 0) + 1); e.bloodDps = (e.bloodDps || dmg * 0.25) * 3; e.bloodBy = 'Guthrie Test';
    e.edited = G.t + 2.5; e.editK = 0.3;
    let n = 0;
    forNear(e.x, e.y, 150, o => { if (o !== e && !o.dead && n < 3) { n++; o.edited = G.t + 2.5; o.editK = 0.3; ring(o.x, o.y, o.r + 10, '#90e0ef', 0.3, 2); } });
    ring(e.x, e.y, e.r + 20, '#ff3355', 0.4, 4); fxParts('spark', e.x, e.y, '#ff3355', 10, 170, 0.5, 3);
    floatText(e.x, e.y - e.r - 12, 'CRISPR', '#90e0ef', 13, 0.7); sfx('level');
  }
}

// ---------------------------------------------------------------- Flail lash (comboLash)
function combo3Lash(w, x, y, a, L) {
  if (w.id !== 'flail' || w.echo || !comboOn('c_towel_snap')) return;
  const hw = comboW('hanky');
  if (!hw || !hw.s) return;
  const ca = Math.cos(a), sa = Math.sin(a), ks = comboSrc(w, 'Locker Room Towel', { knock: 0, noCrit: true });
  let snapped = 0;
  for (const e of G.enemies) {
    if (e.dead || e.charmed) continue;
    const dx = e.x - x, dy = e.y - y, along = dx * ca + dy * sa, perp = Math.abs(-dx * sa + dy * ca);
    if (along < L * 0.75 || along > L + e.r + 12 || perp > e.r + 30) continue;
    damageEnemy(e, w.s.dmg * 3, ks); stun(e, 1.2); snapped++;
    ring(e.x, e.y, e.r + 14, '#ffffff', 0.3, 4); fxParts('spark', e.x, e.y, '#ffffff', 6, 160, 0.3, 2.5);
    if (snapped === 1) floatText(e.x, e.y - e.r - 10, 'SNAP', '#ffffff', 15, 0.6);
  }
  if (!snapped) return;
  const zs = comboSrc(hw, 'Locker Room Towel');
  for (let k = 1; k <= 4 && G.zones.length < 280; k++) G.zones.push({ x: x + ca * L * k / 4, y: y + sa * L * k / 4, r: 38, life: 2.5, max: 2.5, dps: hw.s.dmg * 0.5, elem: 'poison', pull: 0, color: hw.def.color, tick: 0, src: zs });
  cam.shake = Math.min(8, cam.shake + 2); sfx('crack');
}

// ---------------------------------------------------------------- Runaway Pram and Juice Box (playpen.js)
function combo3Pram(pr) {
  if (!pr.w || pr.w.id !== 'pram' || pr.w.echo || !comboOn('c_driveby')) return;
  const bw = comboW('blaster');
  if (!bw || !bw.s) return;
  const src = comboSrc(bw, 'Drive-By Pramming');
  for (let i = 0; i < 12; i++) spawnProj(bw, pr.x, pr.y, i / 12 * TAU, src, { dmg: bw.s.dmg, pierce: 3, noMods: true });
  ring(pr.x, pr.y, 150, '#e8e8e8', 0.5, 6); fxParts('smoke', pr.x, pr.y, '#cfcfcf', 10, 130, 0.7, 5);
  cam.shake = Math.max(cam.shake, 6); hitStop(0.04); sfx('boom');
  floatText(pr.x, pr.y - 28, 'DRIVE-BY', '#e8e8e8', 14, 0.7);
}
// The carton goes for the nearest Upchuck puddle (an object with x and y, or null).
function combo3Carton(w, target) {
  if (!comboOn('c_packed_lunch') || w.echo) return null;
  const uw = comboW('upchuck'), p = me();
  if (!uw) return null;
  let best = null, bd = 520;
  for (const z of G.zones) { if (z.armUp !== uw.uid || z.life <= 0) continue; const d = Math.hypot(z.x - p.x, z.y - p.y); if (d < bd) { bd = d; best = z; } }
  return best ? { x: best.x, y: best.y } : null;
}
// The carton has landed: a puddle under it boils over.
function combo3Boil(x, y) {
  if (!comboOn('c_packed_lunch')) return;
  const uw = comboW('upchuck');
  if (!uw) return;
  for (const z of G.zones) {
    if (z.armUp !== uw.uid || z.life <= 0 || z.boilT > G.t || Math.hypot(z.x - x, z.y - y) > z.r + 24) continue;
    z.r0 = z.r; z.r = z.r * 1.6; z.boilT = G.t + 3; z.boilNext = 0; z.dps *= 1.6; z.life = Math.max(z.life, 3.2); z.max = Math.max(z.max, z.life);
    floatText(z.x, z.y - z.r * 0.5, 'BOILS OVER', uw.def.color, 13, 0.7); ring(z.x, z.y, z.r, uw.def.color, 0.5, 5); sfx('sizzle');
  }
}

// ---------------------------------------------------------------- per frame (comboTick)
function combo3Tick(dt) {
  const p = me();
  if (comboOn('c_driveby') && cmbEvery('driveby', 0.12)) {
    const pw = comboW('pram'), bw = comboW('blaster');
    if (pw && bw && bw.s) {
      let n = 0;
      const src = comboSrc(bw, 'Drive-By Pramming');
      for (const pr of G.proj) {
        if (pr.dead || pr.w !== pw || n >= 3) continue;
        n++;
        for (const t of acquireMany('nearest', 340, pr.x, pr.y, 2)) if (t) spawnProj(bw, pr.x, pr.y, Math.atan2(t.y - pr.y, t.x - pr.x), src, { dmg: bw.s.dmg * 0.4, noMods: true });
      }
    }
  }
  if (comboOn('c_livemains')) {
    const fw = comboW('fork'), hw = comboW('hairbrush');
    if (fw && hw && hw.s && fw.cmbSeen > G.t - 0.35 && fw.cmbOn && !fw.cmbOn.dead) {
      const t = fw.cmbOn, held = G.t - fw.cmbT0, dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      if (cmbEvery('lm_vis', 0.1)) for (const o of [-22, 22]) bolt(p.x + nx * o, p.y + ny * o, t.x + nx * o * 0.3, t.y + ny * o * 0.3, held > 1.5 ? '#ffffff' : fw.def.color, 0.1);
      if (cmbEvery('lm_swing', 0.4)) {
        const src = comboSrc(hw, 'Live Mains', { knock: 0 });
        let n = 0;
        for (const e of G.enemies) {
          if (e.dead || e.charmed || n >= 14 || c3Seg(e.x, e.y, p.x, p.y, t.x, t.y) > e.r + 30) continue;
          n++; damageEnemy(e, hw.s.dmg * 0.9, src);
          fxParts('spark', e.x, e.y, hw.def.color, 3, 110, 0.3, 2.5);
        }
        if (held > 1.5 && !t.dead) {
          stun(t, 0.5);
          if (!fw.cmbOv) { fw.cmbOv = 1; floatText(t.x, t.y - t.r - 12, 'OVERLOAD', '#ffe94a', 14, 0.8); ring(t.x, t.y, t.r + 18, '#ffe94a', 0.4, 4); }
        }
        sfx('zap');
      }
    }
  }
  if (comboOn('c_waterdelivery')) {
    for (const z of G.zones) if (!z.cwd && z.src && z.src.combo === 'c_waterdelivery') { z.cwd = 1; z.dps *= 2; z.pull = Math.max(z.pull || 0, 90); }
  }
  if (comboOn('c_packed_lunch')) {
    const uw = comboW('upchuck');
    for (const z of G.zones) {
      if (!z.boilT) continue;
      if (z.boilT <= G.t || z.life <= 0) { z.r = z.r0 || z.r; z.boilT = 0; continue; }
      if (G.t >= z.boilNext) {
        z.boilNext = G.t + 0.3;
        forNear(z.x, z.y, z.r, o => { if (!o.dead) o.shred = Math.min(o.armour + 1, (o.shred || 0) + 1); });
        if (uw) fxParts('smoke', z.x + rand(-z.r, z.r) * 0.6, z.y + rand(-z.r, z.r) * 0.6, uw.def.color, 1, 40, 0.6, 4);
      }
    }
  }
  if (comboOn('c_guthrie_test')) {
    const gg = comboW('genegun');
    let marked = null;
    for (const e of G.enemies) if (!e.dead && e.weakT > G.t) { (marked || (marked = [])).push(e); }
    if (marked && gg) {
      if (cmbEvery('gt_ring', 0.5)) for (let i = 0; i < Math.min(6, marked.length); i++) ring(marked[i].x, marked[i].y, marked[i].r + 8, '#ff3355', 0.3, 2);
      for (const pr of G.proj) {
        if (pr.dead || pr.w !== gg || pr.cmbHome) continue;
        let best = null, bd = 520;
        for (const e of marked) { const d = Math.hypot(e.x - pr.x, e.y - pr.y); if (d < bd) { bd = d; best = e; } }
        if (best) { pr.cmbHome = 1; pr.homing = Math.max(pr.homing || 0, 7); pr.tgt = best; }
      }
    }
  }
}
