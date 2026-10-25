// Weapon cells part 5 (cellmods13.js): One of These Days (od) and Sister Cousin (sc). Card rules (dealt / N/A, no fork
// screens, a card line for every cell, the Switched at Birth types), every cell at rank 1 and at its mastery against a crowd
// (no errors, the weapon still deals damage), and the headline behaviours of each weapon's cells.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {} }, DMG = { n: 0 };
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce);
    damageEnemy = (orig => function (e, d, s) { if (s && s.w && G.weapons.includes(s.w) && !e.charmed) DMG.n += d || 0; return orig.apply(this, arguments); })(damageEnemy);
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy, big, still) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = still ? 0 : 40; e.hp = e.maxHp = big ? 4000 : 400; if (big) e.r = 30; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    const kill = (e, w) => { for (let i = 0; i < 30 && !e.dead; i++) damageEnemy(e, 1e5, weaponSrc(w)); };
    const quiet = fn => { const f = dueFire; dueFire = () => {}; try { fn(); } finally { dueFire = f; } }; // (the needle does not fire by itself)
    const set = (w, ids) => { w.m10 = (w24Key(w) === 's_seeker' ? ['multiplying'] : []).concat(ids); computeStats(w); return w; };
    // 1. Card rules
    let w = fresh('s_duedate');
    out.odOk = ['ranged', 'homing', 'piercing', 'mines', 'melee', 'orbiting', 'ricochet', 'explode'].map(id => modOk(w, id));
    if (out.odOk.join() !== 'false,true,true,true,true,true,true,true') bad.push('od dealt ' + out.odOk);
    w = fresh('s_seeker');
    out.scOk = ['homing', 'ranged', 'piercing', 'ricochet', 'explode', 'melee', 'orbiting'].map(id => modOk(w, id));
    if (out.scOk.join() !== 'false,false,true,true,true,true,true') bad.push('sc dealt ' + out.scOk);
    if (!(w.m10 || []).includes('multiplying')) bad.push('sc lost its split');
    for (const id of ['s_duedate', 's_seeker']) {
      w = fresh(id); SET.noLimits = true; modAdd(w, 'pull'); modAdd(w, 'pull'); SET.noLimits = false;
      if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on ' + id);
      for (const m of XC_W[id].cells) { const c = modCard(w, m); if (!c || !c.desc || /TODO_COPY/.test(c.desc)) bad.push('card text ' + id + ':' + m + ' ' + (c && c.desc)); }
    }
    if (MM_SAB.s_duedate !== 'ice' || MM_SAB.s_seeker !== 'flame') bad.push('switched at birth ' + MM_SAB.s_duedate + ' ' + MM_SAB.s_seeker);
    // 2. Every cell at rank 1 and at mastery
    for (const id of ['s_duedate', 's_seeker']) for (const m of XC_W[id].cells) for (const n of [1, 4]) { // (od runs 7 s: a 4 s countdown pays out inside it)
      w = set(fresh(id), Array(n).fill(m)); crowd(); DMG.n = 0;
      const k = XC_W[id].tag + ':' + m + n;
      try { run(id === 's_duedate' ? 7 : 5); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(DMG.n);
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
    }
    // 3. One of These Days
    const odB = {};
    w = set(fresh('s_duedate'), ['piercing']); { const far = foe(300, 0, true, true), mid = foe(150, 0, false, true); quiet(() => update(1 / 60)); dueFire(w, far); odB.pierce = [mid.hp < mid.maxHp, !!far.due]; }
    w = set(fresh('s_duedate'), ['ricochet']); { const a = foe(200, 0, false, true), c = foe(260, 0, false, true); xcOdMark(w, a, 'fire'); a.due.end = G.t; update(1 / 60); update(1 / 60); odB.bounce = !!(c.due && c.due.w === w); }
    w = set(fresh('s_duedate'), ['sticky']); { const a = foe(200, 0, true, true); xcOdMark(w, a, 'fire'); for (let i = 0; i < 60; i++) update(1 / 60); odB.fee = [a.chill > 0, !!(a.due && a.due.xcFee > 0.02)]; }
    w = set(fresh('s_duedate'), ['melee']); { const a = foe(14, 0, false, true); for (let i = 0; i < 20; i++) update(1 / 60); odB.melee = !!(a.due && a.due.tag === 'melee'); }
    w = set(fresh('s_duedate'), ['orbiting']); { const a = foe(100, 0, true, true); for (let i = 0; i < 20; i++) update(1 / 60); odB.orbit = !!(a.due && a.due.tag === 'orbit'); }
    w = set(fresh('s_duedate'), ['connecting']); { const a = foe(200, 0, true, true), c = foe(240, 0, false, true); const D = xcOdMark(w, a, 'fire'); const s0 = D.stored; damageEnemy(c, 50, weaponSrc(w)); odB.joint = [!!(c.xcJA && c.xcJA.D === D), D.stored > s0]; }
    w = set(fresh('s_duedate'), ['area']); { const a = foe(200, 0, true, true), c = foe(225, 0, false, true); xcOdMark(w, a, 'fire'); c.hp = c.maxHp; a.due.end = G.t; update(1 / 60); update(1 / 60); odB.area = c.hp < c.maxHp; }
    w = set(fresh('s_duedate'), ['homing', 'homing', 'homing', 'homing']); { const a = foe(200, 0, false, true), c = foe(260, 0, true, true); const D = xcOdMark(w, a, 'fire'); kill(a, w); update(1 / 60); odB.retarget = c.due === D; }
    w = set(fresh('s_duedate'), ['turncoat']); { const a = foe(150, 0, false, true), c = foe(-250, 0, true, true); xcOdMark(w, a, 'fire'); kill(a, w); let ally = false; quiet(() => { update(1 / 60); ally = G.enemies.some(z => z.xcRun && z.xcRun.w === w); for (let i = 0; i < 180; i++) { update(1 / 60); G.player.hp = 1e6; } }); odB.collector = [ally, !!(c.due && c.due.tag === 'turn')]; }
    w = set(fresh('s_duedate'), ['mines']); { const a = foe(200, 0, false, true); dueFire(w, a); const m = w.xcOd.mines[0]; const c = foe(0, 0, false, true); if (m) { c.x = m.x; c.y = m.y; } for (let i = 0; i < 40; i++) update(1 / 60); odB.mine = [!!m, !!(c.due && c.due.tag === 'mine')]; }
    // round 2 reworks
    w = set(fresh('s_duedate'), ['catalyst']); { const a = foe(200, 0, true, true); const D = xcOdMark(w, a, 'fire'); const e0 = D.end; rxFired('pressure', a); odB.interest = [D.end < e0 - 0.4, D.xcPct > 0]; }
    w = set(fresh('s_duedate'), ['kinship']); { const w2 = G.weapons[1] = makeSlot('v_arcane_proj', false, 3); computeStats(w2); const a = foe(200, 0, true, true), c = foe(260, 0, false, true); quiet(() => update(1 / 60)); xcOdMark(w, a, 'fire'); damageEnemy(c, 5, weaponSrc(w2)); const h0 = c.hp; a.due.end = G.t; quiet(() => { update(1 / 60); update(1 / 60); }); odB.debt = [c.xcKinT > 0, c.hp < h0]; }
    w = set(fresh('s_duedate'), ['primer']); { const a = foe(200, 0, true, true); const D = xcOdMark(w, a, 'fire'); const e0 = D.end; mwDetonate(a, w, { w, by: new Set(), steps: 0, t: G.t + 4 }); odB.collect = D.end <= e0 - 0.9; }
    w = set(fresh('s_duedate'), ['focus']); { const a = foe(200, 0, true, true); const D = xcOdMark(w, a, 'fire'); for (let i = 0; i < 12; i++) damageEnemy(a, 1, weaponSrc(w)); odB.tab = [!!D.xcEarly, D.end <= G.t]; }
    w = set(fresh('s_duedate'), ['rapid']); { const a = foe(200, 0, true, true); xcOdMark(w, a, 'fire'); let n = 0; const d0 = damageEnemy; damageEnemy = function (e, d, sr) { if (e === a && sr && sr.due) n++; return d0.apply(this, arguments); }; try { a.due.end = G.t; quiet(() => { for (let i = 0; i < 30; i++) update(1 / 60); }); } finally { damageEnemy = d0; } odB.instal = n >= 2; }
    w = set(fresh('s_duedate'), ['range']); { const a = foe(350, 0, true, true), c = foe(60, 0, false, true); quiet(() => update(1 / 60)); xcOdMark(w, a, 'fire'); const h0 = c.hp; a.due.end = G.t; quiet(() => { update(1 / 60); update(1 / 60); }); odB.forward = c.hp < h0; }
    w = set(fresh('s_duedate'), ['upclose']); { const a = foe(80, 0, true, true); const D = xcOdMark(w, a, 'fire'); const e0 = D.end; quiet(() => { for (let i = 0; i < 30; i++) update(1 / 60); }); odB.express = D.end < e0 - 0.4; }
    w = set(fresh('s_duedate'), ['extra']); { const a = foe(200, 0, true, true), c = foe(240, 0, false, true); quiet(() => update(1 / 60)); const D = xcOdMark(w, a, 'fire'); odB.copy = !!(c.due && c.due.xcCopyOf === D && c.due.end === D.end); }
    w = set(fresh('s_duedate'), ['melee']); crowd(); DMG.n = 0; run(7); const mel = DMG.n; w = set(fresh('s_duedate'), []); crowd(); DMG.n = 0; run(7); out.meleeK = +(mel / Math.max(1, DMG.n)).toFixed(2); odB.meleeDps = out.meleeK > 0.4 && out.meleeK < 1.6; // (rule 19: about the needle's damage per second)
    out.od = odB;
    for (const k in odB) if ([].concat(odB[k]).includes(false)) bad.push('od ' + k + ' ' + odB[k]);
    // 4. Sister Cousin
    const scB = {}, mine = w => G.proj.filter(q => q.w === w && !q.dead);
    w = set(fresh('s_seeker'), ['ricochet']); { const t = foe(250, 0, true, true); fireWeapon(w, t); scB.bounce = mine(w).length > 0 && mine(w).every(q => q.bounce >= 1); }
    w = set(fresh('s_seeker'), ['piercing']); { const t = foe(250, 0, true, true); fireWeapon(w, t); scB.pierce = mine(w).length > 0 && mine(w).every(q => q.pierce >= 1); }
    w = set(fresh('s_seeker'), ['melee']); { const t = foe(40, 0, true, true); for (let i = 0; i < 60; i++) update(1 / 60); scB.melee = [t.hp < t.maxHp, (w.xcSc && w.xcSc.cl.length) === 2]; }
    w = set(fresh('s_seeker'), ['mines']); { const t = foe(250, 0, true, true); fireWeapon(w, t); const n = w.xcSc.nests[0]; const c = foe(0, 0, false, true); if (n) { c.x = n.x + 30; c.y = n.y; } for (let i = 0; i < 40; i++) update(1 / 60); scB.nest = [!!n, !!n && n.end === 0, c.hp < c.maxHp]; }
    w = set(fresh('s_seeker'), ['dfa']); { const t = foe(250, 0, true, true); fireWeapon(w, t); const d0 = w.xcSc.dives.length; for (let i = 0; i < 40; i++) update(1 / 60); scB.dive = [d0 >= 1, t.hp < t.maxHp]; }
    w = set(fresh('s_seeker'), ['orbiting']); { update(1 / 60); const o0 = w.xcSc.orb.length; foe(90, 0, true, true); for (let i = 0; i < 30; i++) update(1 / 60); scB.orbit = [o0 === 2, G.proj.some(q => q.w === w)]; }
    w = set(fresh('s_seeker'), ['connecting']); { const a = foe(250, 0, false, true), c = foe(280, 0, false, true); a.xcFeud = { w, vol: 7, t: G.t + 4 }; c.xcFeud = { w, vol: 7, t: G.t + 4 }; kill(a, w); scB.feud = !!(c.bleeds && c.bleeds.length); }
    w = set(fresh('s_seeker'), ['extra', 'extra', 'extra', 'extra']); { const t = foe(250, 0, true, true); fireWeapon(w, t); const q = mine(w); scB.brood = [q.length >= 8, q.some(o => o.vx < 0), q.some(o => o.vx > 0)]; }
    w = set(fresh('s_seeker'), ['nth']); { const t = foe(250, 0, true, true); const n = []; for (let i = 0; i < 4; i++) { G.proj.length = 0; fireWeapon(w, t); n.push(mine(w).length); } scB.nth = n[3] > n[0] && mine(w).some(q => q.xcNth); out.nthN = n; }
    w = set(fresh('s_seeker'), ['area']); { const a = foe(250, 0, false, true); foe(270, 0, false, true); a.hp = 1; let A = 0; const a0 = aoe; aoe = function (...x) { if (x[4] && x[4].w === w) A++; return a0.apply(this, x); }; try { fireWeapon(w, a); for (let i = 0; i < 90; i++) update(1 / 60); } finally { aoe = a0; } scB.pulse = A > 0; }
    // round 2 reworks
    const shot = (w, e) => { const q = spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); q.pierce = 0; q.bounce = 0; damageEnemy(e, 1, weaponSrc(w)); modHit(q, e); return q; };
    w = set(fresh('s_seeker'), ['catalyst']); { const a = foe(200, 0, true, true); shot(w, a); const q = spawnProj(w, G.player.x + 100, G.player.y + 50, 0, weaponSrc(w)); rxFired('pressure', a); scB.gossip = [q.tgt === a, a.xcGosT > G.t]; }
    w = set(fresh('s_seeker'), ['kinship']); { const w2 = G.weapons[1] = makeSlot('v_arcane_proj', false, 3); computeStats(w2); const a = foe(200, 0, true, true); foe(260, 0, false, true); quiet(() => update(1 / 60)); shot(w, a); damageEnemy(a, 5, weaponSrc(w2)); scB.cousin = G.proj.some(q => q.w === w && q.xcCousin); }
    w = set(fresh('s_seeker'), ['primer']); { const a = foe(200, 0, true, true); foe(260, 0, false, true); quiet(() => update(1 / 60)); const n0 = G.proj.filter(q => q.w === w && q.mSplit).length; mwDetonate(a, w, { w, by: new Set(), steps: 0, t: G.t + 4 }); scB.hatch = G.proj.filter(q => q.w === w && q.mSplit).length > n0; }
    w = set(fresh('s_seeker'), ['focus']); { const a = foe(200, 0, true, true); for (let i = 0; i < 3; i++) shot(w, a); scB.dogpile = a.xcDog > G.t; }
    w = set(fresh('s_seeker'), ['sticky']); { const a = foe(200, 0, true, true); shot(w, a); shot(w, a); scB.hang = !!(a.xcHang && a.xcHang.length === 2); }
    w = set(fresh('s_seeker'), ['upclose']); { const a = foe(60, 0, true, true); a.kx = 0; shot(w, a); scB.huddle = a.kx > 0; }
    w = set(fresh('s_seeker'), ['rapid']); { const t = foe(250, 0, true, true); quiet(() => update(1 / 60)); xcSc(w).sq = 0; fireWeapon(w, t); for (let i = 0; i < 12; i++) update(1 / 60); scB.squabble = xcSc(w).sq > 0; }
    w = set(fresh('s_seeker'), ['range']); { const t = foe(250, 0, false, true); fireWeapon(w, t); G.enemies.length = 0; for (let i = 0; i < 40; i++) update(1 / 60); scB.wait = G.proj.some(q => q.w === w && q.xcWait > 0.3); }
    w = set(fresh('s_seeker'), ['nth']); { const t = foe(250, 0, true, true); for (let i = 0; i < 4; i++) fireWeapon(w, t); scB.bigSister = G.proj.some(q => q.w === w && q.xcNth && q.r > 6); }
    out.sc = scB;
    for (const k in scB) if ([].concat(scB[k]).includes(false)) bad.push('sc ' + k + ' ' + scB[k]);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK'); // (own line: run.sh drops lines that say ERRORS [])
  console.log('ERRORS', JSON.stringify(errors.slice(0, 5)));
  if (r.bad.length || errors.length) process.exitCode = 1;
  await b.close();
})();
