// Weapon cells part 8 (cellmods8.js): Unwanted Contact. Card rules (dealt / N/A, no fork screens, a plain card line for
// every cell), every cell at Lv 1 and at mastery against a crowd (no errors, still deals damage, the chain stays bounded),
// and the headline behaviours (one assertion per weapon-specific effect).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {}, maxHits: {} }, DMG = { n: 0, hits: 0 };
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce);
    damageEnemy = (orig => function (e, d, s) { if (s && s.w && G.weapons.includes(s.w) && !e.charmed) { DMG.n += d || 0; DMG.hits++; } return orig.apply(this, arguments); })(damageEnemy);
    const ID = 's_tesla', D = XC_W[ID];
    const fresh = () => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(ID, false, 3); computeStats(w); UCX.fx = {}; return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const still = (dx, dy, hp) => { const e = foe(dx, dy); e.speed = 0; e.hp = e.maxHp = hp || 5000; gridBuild(); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    const set = (w, m) => { w.m10 = m; computeStats(w); };
    const fire = (w, t) => { DMG.hits = 0; fireWeapon(w, t); return DMG.hits; };
    // 1. Card rules
    let w = fresh();
    const dealt = D.cells, na = ['primer', 'ranged', 'chaining'];
    out.dealt = dealt.filter(id => !modOk(w, id)); if (out.dealt.length) bad.push('not dealt ' + out.dealt);
    out.na = na.filter(id => modOk(w, id)); if (out.na.length) bad.push('dealt N/A ' + out.na);
    if (MM_SAB[ID]) bad.push('switched at birth dealt');
    SET.noLimits = true; for (const id of ['pull', 'pull', 'charged', 'charged']) modAdd(w, id); SET.noLimits = false;
    if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on a cell');
    for (const id of dealt) { const c = modCard(w, id); if (!c || !c.desc || /TODO_COPY/.test(c.desc)) bad.push('card text ' + id + ': ' + (c && c.desc)); }
    for (const id of dealt) if (!SLICE_COPY['cell_uc_' + id]) bad.push('no copy line cell_uc_' + id);
    // 2. Every cell at Lv 1 and at mastery
    for (const m of dealt) for (const n of [1, 4]) {
      w = fresh(); set(w, Array(n).fill(m)); crowd();
      DMG.n = 0; let most = 0;
      const k = m + n;
      try { for (let i = 0; i < 5 * 60; i++) { DMG.hits = 0; run(1 / 60); most = Math.max(most, DMG.hits); } } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(DMG.n); out.maxHits[k] = most;
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
      if (most > 120) bad.push('unbounded ' + k + ' ' + most); // (48 a volley; up to 2 volleys a frame plus bursts and links)
    }
    // 3. Behaviours (a still line of enemies 100 apart: a chain of 1 + 3 jumps hits 4)
    const line = (n, gap, y) => { const L = []; for (let i = 0; i < n; i++) L.push(still(120 + i * (gap || 100), y || 0)); return L; };
    w = fresh(); let L = line(10); out.base = fire(w, L[0]); if (out.base !== 4) bad.push('base chain hits ' + out.base);
    w = fresh(); set(w, ['charged']); L = line(10); out.charged = [fire(w, L[0]), +w.s.cd.toFixed(2)]; if (!(out.charged[0] === 5 && w.s.cd > 0.9)) bad.push('charged ' + out.charged);
    w = fresh(); set(w, ['range', 'range', 'range']); L = line(6, 190); out.range = fire(w, L[0]); if (!(out.range >= 4)) bad.push('range jumps ' + out.range);
    w = fresh(); set(w, ['upclose']); L = [still(60, 0), still(-100, 0)]; fire(w, L[0]); out.short = UCX.fx.short; if (!(UCX.fx.short === 1 && L[1].hp < L[1].maxHp)) bad.push('short circuit ' + out.short);
    w = fresh(); set(w, ['knock']); L = line(4); const x0 = L[2].x; fire(w, L[0]); update(1 / 60); update(1 / 60); out.knock = Math.round(L[2].x - x0); if (!(UCX.fx.shove >= 3 && out.knock > 0)) bad.push('knock ' + out.knock);
    w = fresh(); set(w, ['pull']); L = line(4); const p0 = L[2].x; fire(w, L[0]); out.pull = Math.round(p0 - L[2].x); if (!(out.pull > 10)) bad.push('pull ' + out.pull);
    w = fresh(); set(w, ['sticky']); L = [still(150, 0), still(250, 0)]; fire(w, L[0]); const c0 = Math.hypot(L[1].x - L[0].x, L[1].y - L[0].y); for (let i = 0; i < 60; i++) update(1 / 60); out.cling = [UCX.fx.cling, Math.round(c0), Math.round(Math.hypot(L[1].x - L[0].x, L[1].y - L[0].y)), L[0].chill > 0]; if (!(UCX.fx.cling >= 1 && out.cling[2] < c0 - 30 && out.cling[3])) bad.push('static cling ' + out.cling);
    w = fresh(); set(w, ['piercing']); L = [still(120, 0), still(200, 0), still(200, 120), still(200, 220), still(200, 320)]; fire(w, L[0]); out.pierce = UCX.fx.pierce; if (!(UCX.fx.pierce === 1 && L[3].hp < L[3].maxHp)) bad.push('piercing ' + out.pierce);
    w = fresh(); set(w, ['explode']); L = line(4); const q = still(L[3].x + 30, 30); fire(w, L[0]); out.explode = UCX.fx.lastburst; if (!(UCX.fx.lastburst === 1 && q.hp < q.maxHp && q.chargeT > G.t)) bad.push('explode last ' + out.explode);
    w = fresh(); set(w, ['area']); L = line(4); fire(w, L[0]); out.area = UCX.fx.arcflash; if (!(UCX.fx.arcflash === 4)) bad.push('arc flash ' + out.area);
    w = fresh(); set(w, ['ricochet', 'ricochet']); L = line(4); const far = still(120 + 300 + 240, 0); fire(w, L[0]); out.bounce = UCX.fx.bounce; if (!(UCX.fx.bounce >= 1 && far.hp < far.maxHp)) bad.push('ricochet ' + out.bounce);
    w = fresh(); set(w, ['ricochet', 'ricochet', 'ricochet', 'ricochet']); L = line(4); for (let i = 0; i < 25; i++) still(700 + (i % 5) * 60, -120 + Math.floor(i / 5) * 60); out.r4 = fire(w, L[0]); if (!(out.r4 <= 4 + 12)) bad.push('ricochet mastery not bounded ' + out.r4);
    w = fresh(); set(w, ['nth']); L = line(4); for (let i = 0; i < 4; i++) still(120 + i * 100, 108); const nh = []; for (let i = 0; i < 4; i++) nh.push(fire(w, L[0])); out.nth = nh; if (!(nh[0] === 4 && nh[1] === 4 && nh[2] === 4 && nh[3] >= 6 && UCX.fx.fork >= 2)) bad.push('forked bolt ' + nh);
    w = fresh(); set(w, ['extra']); L = [still(120, 0), still(220, 0), still(120, 100), still(320, 0), still(120, 200)]; out.extra = fire(w, L[0]); if (!(out.extra >= 5)) bad.push('extra chains ' + out.extra);
    w = fresh(); set(w, ['focus']); L = line(4); for (let i = 0; i < 4; i++) { fire(w, L[0]); G.t += 0.5; } { const h0 = L[0].hp; fire(w, L[0]); out.focusK = Math.round(h0 - L[0].hp); } out.weld = L[0].xcUcWeld && L[0].xcUcWeld.n; { const h2 = L[1].hp; L[0].hp = 1; damageEnemy(L[0], 500, weaponSrc(w)); if (!L[0].dead) killEnemy(L[0], weaponSrc(w)); out.weldpop = [L[0].dead, UCX.fx.weldpop, Math.round(h2 - L[1].hp)]; } if (!(out.focusK > w.s.dmg * 1.1 && out.weld >= 3 && UCX.fx.weldpop === 1 && out.weldpop[2] > 0)) bad.push('spot weld ' + out.weld + ' ' + out.weldpop);
    w = fresh(); set(w, ['connecting']); L = line(4); fire(w, L[0]); out.links = (w.xcUcL || []).length; { const h1 = L[3].hp; damageEnemy(L[1], 100, { elem: 'phys', w: null }); out.linkArc = Math.round(h1 - L[3].hp); } if (!(out.links === 1 && out.linkArc > 0)) bad.push('aftershocks ' + out.links + ' ' + out.linkArc);
    w = fresh(); set(w, ['melee']); L = [still(10, 0), still(110, 0), still(210, 0)]; for (let i = 0; i < 3; i++) update(1 / 60); out.melee = UCX.fx.badtouch; if (!(UCX.fx.badtouch >= 1 && L[2].hp < L[2].maxHp)) bad.push('bad touch ' + out.melee);
    w = fresh(); set(w, ['mines']); foe(300, 0); fireWeapon(w, G.enemies[0]); out.mines = (w.xcUcM || []).length; G.enemies.length = 0; { const m = w.xcUcM[0]; const e = still(m.x - G.player.x + 20, m.y - G.player.y); G.t += 0.5; update(1 / 60); out.mineGo = UCX.fx.mine; if (!(out.mines === 1 && UCX.fx.mine === 1 && e.hp < e.maxHp)) bad.push('mines ' + out.mines + ' ' + out.mineGo); }
    w = fresh(); set(w, ['orbiting']); update(1 / 60); { const sl = w.xcUcO.slots[0]; still(sl.x - G.player.x, sl.y - G.player.y); } update(1 / 60); out.orb = UCX.fx.orb; if (!(UCX.fx.orb >= 1)) bad.push('orbs ' + out.orb);
    w = fresh(); set(w, ['dfa']); L = line(4); fireWeapon(w, L[0]); out.dfaNow = Math.round(L[0].maxHp - L[0].hp); for (let i = 0; i < 30; i++) update(1 / 60); out.dfa = UCX.fx.strike; if (!(out.dfaNow === 0 && UCX.fx.strike === 1 && L[0].hp < L[0].maxHp)) bad.push('death from above ' + out.dfaNow + ' ' + out.dfa);
    w = fresh(); set(w, ['dfa', 'dfa', 'dfa']); L = line(4); fireWeapon(w, L[0]); for (let i = 0; i < 30; i++) update(1 / 60); out.dbl = L[0].xcUc2 > G.t; if (!out.dbl) bad.push('charged twice');
    w = fresh(); set(w, ['turncoat', 'turncoat', 'turncoat', 'turncoat']); { const e = still(150, 0, 1); still(200, 0); still(260, 0); const N = G.enemies.length; for (let i = 0; i < 400 && !G.enemies.some(z => z.xcRun); i++) { e.dead = false; e.hp = 1; xcKill(e, weaponSrc(w)); } const z = G.enemies.find(z => z.xcRun); out.zombie = !!z; if (z) { for (let i = 0; i < 70; i++) update(1 / 60); out.zap = UCX.fx.zombie; } if (!(z && UCX.fx.zombie >= 1)) bad.push('tesla zombie ' + out.zombie + ' ' + out.zap); }
    w = fresh(); set(w, ['catalyst']); L = line(4); fire(w, L[0]); { const h = L[2].hp; rxFired('arcflash', L[1]); out.conduct = [UCX.fx.conduct, Math.round(h - L[2].hp), Math.round(L[3].maxHp - L[3].hp)]; } if (!(UCX.fx.conduct === 1 && out.conduct[1] > 0)) bad.push('conductor ' + out.conduct);
    w = fresh(); set(w, ['homing']); out.homing = [Math.round(w.s.range)]; L = [still(w.s.range - 10, 0)]; out.homing.push(fire(w, L[0])); if (!(w.s.range > 330 && out.homing[1] === 1)) bad.push('homing reach ' + out.homing);
    w = fresh(); set(w, ['homing']); { const t = still(150, 0), q = still(150, 90); q.chargeT = G.t + 3; fire(w, t); out.rod = [UCX.fx.rod, q.hp < q.maxHp]; if (!(UCX.fx.rod === 1 && q.hp < q.maxHp)) bad.push('lightning rod ' + out.rod); }
    w = fresh(); set(w, ['range', 'range', 'range']); { const a = still(150, 0), pp = still(240, 6), b2 = still(330, 0); const V = UCX.volley(); DMG.hits = 0; UCX.shot(w, a, V, { src: weaponSrc(w), seen: new Set([pp]) }); out.longarc = [UCX.fx.longarc, pp.hp < pp.maxHp, b2.hp < b2.maxHp]; if (!(UCX.fx.longarc >= 1 && pp.hp < pp.maxHp)) bad.push('long arc ' + out.longarc); }
    w = fresh(); set(w, ['rapid']); L = line(4); for (let i = 0; i < 3; i++) fire(w, L[0]); out.hum = UCX.fx.hum; if (!(UCX.fx.hum >= 1)) bad.push('hum ' + out.hum);
    w = fresh(); set(w, ['kinship']); { G.weapons[1] = makeSlot('v_shock_beam', false, 1); computeStats(G.weapons[1]); L = line(10); fire(w, L[0]); damageEnemy(L[1], 5, weaponSrc(G.weapons[1])); out.cap = w.xcUcCap; const n2 = fire(w, L[0]); out.capHits = n2; if (!(out.cap === 1 && n2 === 5 && UCX.fx.capspend === 1)) bad.push('capacitor bank ' + out.cap + ' ' + n2); }
    w = fresh(); set(w, ['rapid', 'rapid', 'rapid', 'rapid']); { const A = [-60, 60, 180, 300, 420].map(y => still(150, y)), B2 = still(300, 0); out.crossA = fire(w, A[0]); fire(w, B2); out.cross = UCX.fx.cross || 0; if (!(out.crossA === 4 && out.cross === 1 && A[4].hp < A[4].maxHp)) bad.push('crossing chains ' + out.crossA + ' ' + out.cross); }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
  process.exit(r.bad.length || errors.length ? 1 : 0);
})();
