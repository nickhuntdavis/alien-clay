// Weapon cells, part 4 (cellmods4.js): Acid Spit and Ewww, Gross. Card rules (dealt / N/A, no fork screens, a plain line for
// every cell, the Switched at Birth alternate), every cell at Lv 1 and at its mastery against a crowd (no errors, the weapon
// still deals damage), and the headline behaviours (each cell counts what it did in w.c4fx).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {}, fx: {} }, DMG = { n: 0 };
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce);
    damageEnemy = (orig => function (e, d, s) { if (s && s.w && G.weapons.includes(s.w) && !e.charmed) DMG.n += d || 0; return orig.apply(this, arguments); })(damageEnemy);
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    const set = (id, m, n) => { const w = fresh(id); w.m10 = Array(n).fill(m); computeStats(w); return w; };
    const fx = (w, k) => (w.c4fx && w.c4fx[k]) || 0;
    // 1. Card rules
    let w = fresh('v_fire_proj');
    out.asOk = ['ranged', 'range', 'sticky', 'connecting', 'orbiting', 'mines', 'turncoat'].map(id => modOk(w, id));
    if (out.asOk.join() !== 'false,true,true,true,true,true,true') bad.push('acid spit dealt ' + out.asOk);
    w = fresh('s_redtape');
    out.ewOk = ['sticky', 'connecting', 'ranged', 'range', 'knock', 'piercing', 'orbiting', 'melee'].map(id => modOk(w, id));
    if (out.ewOk.join() !== 'false,false,false,true,true,true,true,true') bad.push('ewww dealt ' + out.ewOk);
    for (const id of ['v_fire_proj', 's_redtape']) {
      w = fresh(id); SET.noLimits = true; modAdd(w, 'knock'); modAdd(w, 'knock'); modAdd(w, 'knock'); modAdd(w, 'knock'); SET.noLimits = false;
      if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on a cell ' + id);
      const D = XC_W[id];
      for (const m of D.cells) { const t = SLICE_COPY['cell_' + D.tag + '_' + m]; if (!t || /TODO_COPY/.test(t)) bad.push('no line cell_' + D.tag + '_' + m); }
      w = fresh(id); const c = modCard(w, 'area'); if (!c || !c.desc || /TODO_COPY/.test(c.desc)) bad.push('card text ' + id + ' ' + (c && c.desc));
      const alts = new Set(); for (let i = 0; i < 20; i++) { const k = sabCard(); if (k) alts.add(k.elem); } out['alt_' + D.tag] = [...alts];
      if (alts.size !== 1 || !alts.has(MM_SAB[id])) bad.push('alternate ' + id + ' ' + [...alts]);
    }
    if (MM_SAB.v_fire_proj !== 'soul' || MM_SAB.s_redtape !== 'fire') bad.push('alternates ' + MM_SAB.v_fire_proj + ' ' + MM_SAB.s_redtape);
    // 2. Every cell at Lv 1 and at mastery
    for (const id of ['v_fire_proj', 's_redtape']) for (const m of XC_W[id].cells) for (const n of [1, 4]) {
      w = set(id, m, n); crowd(); DMG.n = 0;
      const k = XC_W[id].tag + ':' + m + n;
      try { run(5); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(DMG.n); if (w.c4fx) out.fx[k] = w.c4fx;
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
    }
    // 3. Behaviours (each a cell's own effect, seen working)
    const need = (id, m, n, k, s, prep) => { const w = set(id, m, n); if (prep) prep(w); crowd(); run(s || 4); const v = fx(w, k); out[XC_W[id].tag + '_' + m + n + '_' + k] = v; if (!(v > 0)) bad.push(XC_W[id].tag + ' ' + m + n + ' never did ' + k); return w; };
    need('v_fire_proj', 'charged', 1, 'drops');
    need('v_fire_proj', 'connecting', 1, 'strand'); need('v_fire_proj', 'connecting', 3, 'drip');
    need('v_fire_proj', 'mines', 1, 'boom'); need('v_fire_proj', 'dfa', 1, 'rain'); need('v_fire_proj', 'orbiting', 1, 'orbit');
    need('v_fire_proj', 'melee', 1, 'kiss'); need('v_fire_proj', 'melee', 3, 'drool'); need('v_fire_proj', 'area', 1, 'puddle');
    need('v_fire_proj', 'ricochet', 1, 'bounce'); need('v_fire_proj', 'explode', 1, 'spray'); need('v_fire_proj', 'nth', 1, 'nth');
    need('v_fire_proj', 'pull', 1, 'pull'); need('v_fire_proj', 'knock', 1, 'shove'); need('v_fire_proj', 'extra', 1, 'extra');
    need('v_fire_proj', 'range', 4, 'puddle'); need('v_fire_proj', 'sticky', 3, 'snare');
    w = set('v_fire_proj', 'range', 1); { const p = G.player, e = foe(260, 0); e.speed = 0; const pr = spawnProj(w, p.x + 10, p.y, 0, weaponSrc(w)); for (let i = 0; i < 60; i++) update(1 / 60); out.lob = fx(w, 'lob'); if (!(out.lob > 0)) bad.push('no lob burst after a long flight'); }
    w = set('v_fire_proj', 'charged', 1); { const e = foe(200, 0); e.speed = 0; const p = G.player; const pr = spawnProj(w, p.x, p.y, 0, weaponSrc(w)); out.chSize = +(pr.r / 5).toFixed(2); if (!(pr.r > 5 * 1.4)) bad.push('charged glob not bigger ' + pr.r); }
    w = set('v_fire_proj', 'turncoat', 1); { const e = foe(150, 0); xcRise(w, e); const z = G.enemies.find(q => q.xcRun && q.xcRun.w === w); crowd(); for (let i = 0; i < 120; i++) update(1 / 60); out.spit = fx(w, 'spit'); if (!z || !(out.spit > 0)) bad.push('spitter never spat'); }
    w = set('v_fire_proj', 'mines', 1); w.m10 = ['mines', 'mines', 'mines']; computeStats(w); crowd(); run(4); out.asMineBoom = fx(w, 'boom'); if (!(out.asMineBoom > 0)) bad.push('acid mines never went off');
    // Ewww, Gross
    need('s_redtape', 'knock', 1, 'knock', 4);
    w = set('s_redtape', 'knock', 1); { const a = foe(150, 0), c = foe(300, 0); a.speed = c.speed = 0; C4.stamp(w, a); for (let i = 0; i < 60; i++) update(1 / 60); out.snap = [fx(w, 'snap'), Math.round(Math.hypot(a.x - c.x, a.y - c.y))]; if (!(out.snap[0] > 0)) bad.push('elastic tape never snapped ' + out.snap); }
    w = set('s_redtape', 'pull', 4); { w.s.chain = 2; const A = [foe(150, 0), foe(170, 10), foe(160, -15)], Bq = [foe(260, 0), foe(280, 10), foe(270, -15)]; for (const e of A.concat(Bq)) e.speed = 0; w.s.jump = 40; C4.stamp(w, A[0]); C4.stamp(w, Bq[0]); const n0 = TOYS().tapes.filter(q => q.w === w && !q.dead).length; for (let i = 0; i < 90; i++) update(1 / 60); out.merge = [n0, fx(w, 'merge')]; if (!(n0 === 2 && out.merge[1] > 0)) bad.push('bundles never merged ' + out.merge); }
    need('s_redtape', 'piercing', 1, 'pierce'); need('s_redtape', 'ricochet', 1, 'bounce');
    need('s_redtape', 'orbiting', 1, 'orb', 5); need('s_redtape', 'mines', 1, 'sprung', 5); need('s_redtape', 'dfa', 1, 'drop'); need('s_redtape', 'melee', 1, 'slap');
    need('s_redtape', 'nth', 1, 'nth', 7); need('s_redtape', 'explode', 1, 'blast'); need('s_redtape', 'area', 1, 'smear', 7); need('s_redtape', 'homing', 1, 'seek');
    need('s_redtape', 'extra', 1, 'extra'); w = set('s_redtape', 'upclose', 4); { crowd(); const e = foe(30, 0); e.speed = 0; tapeFire(w, e); out.pointblank = [fx(w, 'pointblank'), e.tape ? e.tape.members.length : 0]; if (!(out.pointblank[0] > 0 && out.pointblank[1] > 1)) bad.push('point-blank stamp ' + out.pointblank); }
    w = set('s_redtape', 'charged', 1); out.ewCharged = [w.s.chain, +w.s.cd.toFixed(2)]; if (!(w.s.chain >= 4)) bad.push('charged tape chain ' + w.s.chain);
    w = set('s_redtape', 'focus', 4); { crowd(); const e = G.enemies[0]; tapeFire(w, e); const B = TOYS().tapes.find(q => q.w === w); for (let i = 0; i < 4 * 60; i++) update(1 / 60); out.focusShare = B ? +C4.share(B).toFixed(2) : null; }
    w = set('s_redtape', 'turncoat', 1); { const e = foe(150, 0); xcRise(w, e); crowd(); for (let i = 0; i < 120; i++) update(1 / 60); out.hug = fx(w, 'hug'); if (!(out.hug > 0)) bad.push('sticky friend never hugged'); }
    w = set('s_redtape', 'range', 1); out.ewJump = w.s.jump; w = set('s_redtape', 'range', 4); out.ewJump4 = w.s.jump; if (!(out.ewJump4 >= 260)) bad.push('range mastery tape reach ' + out.ewJump4);
    w = set('s_redtape', 'nth', 4); { crowd(); for (let i = 0; i < 3; i++) { w.c4empP = 1; const t = G.enemies.find(o => !o.dead && !o.tape && !o.charmed); if (t) C4.stamp(w, t); } const B = TOYS().tapes.find(q => q.w === w && q.c4share); out.nthShare = B ? B.c4share : 0; if (out.nthShare !== 0.7) bad.push('nth mastery share ' + out.nthShare); }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out).slice(0, 4000));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
