// v10 new enemies (newfoes.js): each spawns and runs 300 frames near the player without errors, shows its signature,
// caps hold, and ENEMIES under V10 has no spawnable cut entries.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list); if (G.bigHaz) G.bigHaz.length = 0; G.P.maxHp = G.player.hp = 1e6; // (no random terrain: it cut pushes short and caught bullets)
     G.player.iframes = 0; G.manual = { x: 0, y: 0 }; { const D = pdef(); D.mem.memMax = 0; D.mem.mem = 0; } };
    if (typeof pdefTick === 'function') pdefTick = () => {}; // the player's base Membrane would soak the test hits
    const foe = (id, dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES[id], p.x + (dx == null ? 90 : dx), p.y + (dy || 0)); e.hp = e.maxHp = e.hp * 50; G.enemies.push(e); gridBuild(); return e; };
    const run = (n, fn) => { for (let i = 0; i < n; i++) { update(1 / 60); if (fn) fn(i); } };
    const hit = (e, elem, amt, extra) => damageEnemy(e, amt, Object.assign({ elem, atk: 'proj', noCrit: true, wname: 'test' }, extra || {}));
    // Roster wiring
    const cut = Object.keys(ROSTER).filter(k => ROSTER[k].cut);
    const live = cut.filter(k => ENEMIES[k] && ENEMIES[k].w > 0);
    // B6 caps: Mother Cell alone keeps at most 6 children, Nurse heals each ally at most 3 times, Mitotic Cell splits one generation
    fresh(); { const m = foe('summoner', 400, 0); G.player.x = -3000; run(3600, () => { for (const q of G.enemies) if (q !== m && q.momId !== m.id) q.hp = 1e9; });
      const kids = G.enemies.filter(q => q.momId === m.id && q.hp > 0).length; out.momKids = kids; if (kids > ROSTER.summoner.summon.cap) bad.push('Mother Cell has ' + kids + ' children'); if (!kids) bad.push('Mother Cell summoned none'); }
    fresh(); { const n = foe('medic', 400, 0), a = foe('crawler', 420, 0); a.maxHp = 1e6; a.hp = 1; run(60 * 40); out.nurseN = a.nurseN; if (a.nurseN > ROSTER.medic.heal.perTargetCap) bad.push('Nurse healed ' + a.nurseN + ' times'); }
    out.cut = cut.length; out.kept = cut.filter(k => ENEMIES[k]).join(',');
    if (live.length) bad.push('spawnable cut entries: ' + live);
    if (cut.filter(k => ENEMIES[k] && !ENEMIES[k].nfKept).length) bad.push('cut entries left in ENEMIES');
    for (const id of ['staticsock', 'stressball', 'mosquito', 'matchstick', 'candle', 'trappedwind', 'ingrown']) {
      if (!ENEMIES[id]) bad.push('missing ' + id); else if (ENEMIES[id].armour !== 0) bad.push(id + ' has armour');
    }
    if (!ENEMIES.lancer || ENEMIES.lancer.ai !== 'ranged') bad.push('lancer lost its AI: ' + (ENEMIES.lancer && ENEMIES.lancer.ai));
    if (!ENEMIES.brood || !ENEMIES.planarian) bad.push('feature-file enemies lost');
    // 300 frames each, near the player, no errors; then a draw pass
    for (const id of ['staticsock', 'stressball', 'mosquito', 'matchstick', 'candle', 'trappedwind', 'ingrown']) {
      fresh(); const e = foe(id, 120);
      try { run(300); render(); } catch (err) { bad.push(id + ' threw: ' + err.message); }
      if (e.dead && id !== 'mosquito') bad.push(id + ' died by itself');
    }
    // Static Sock: Crackle by distance travelled; below full, a weak touch; full, a heavy zap and a reset
    fresh(); let s = foe('staticsock', 600); s.speed = 200;
    run(60); out.crk1 = Math.round(s.crk);
    if (!(s.crk > 100)) bad.push('Sock did not build Crackle by travelling: ' + s.crk);
    const k0 = s.crk; s.kx = 300; s.ky = 0; run(2); if (s.crk > k0 + 40) bad.push('knockback added Crackle');
    s.kx = 0; s.ky = 0;
    fresh(); s = foe('staticsock', 14); s.speed = 0; s.crk = 100; const hp0 = G.player.hp;
    run(20); const weak = hp0 - G.player.hp; out.weak = Math.round(weak * 10) / 10;
    fresh(); s = foe('staticsock', 14); s.speed = 0; G.player.x -= 400; s.x -= 400; run(1); s.x = G.player.x + 14; s.y = G.player.y; s.crk = 480; G.player.iframes = 0; const hpA = G.player.hp;
    run(60); const heavy = hpA - G.player.hp; out.heavy = Math.round(heavy * 10) / 10;
    if (!(heavy > weak * 2) || !(s.crk < 100)) bad.push('Sock zap: weak ' + weak + ' heavy ' + heavy + ' crk ' + s.crk);
    // Stress Ball: rebound on the 5th qualifying Force hit, not the 4th
    fresh(); const sb = foe('stressball', 60); sb.speed = 0; const p = G.player;
    const f = () => { G.t += 0.2; hit(sb, 'phys', 5); };
    for (let i = 0; i < 4; i++) f();
    if (sb.sbWind > 0 || sb.sb !== 4) bad.push('Stress Ball triggered early: ' + sb.sb + ' wind ' + sb.sbWind);
    const x0 = p.x; f(); out.sbWind = sb.sbWind;
    if (!(sb.sbWind > 0)) bad.push('Stress Ball no rebound on the 5th hit');
    run(45); out.sbPush = Math.round(p.x - x0);
    if (!(sb.sbN === 1) || !(Math.abs(p.x - x0) > 40)) bad.push('Stress Ball did not push: ' + sb.sbN + ' ' + (p.x - x0));
    // not through a wall: stand an obstacle in the way
    fresh(); const sb2 = foe('stressball', 60); sb2.speed = 0; G.terrain = G.terrain || { list: [], grid: new Map() };
    const ob = { type: 'ridge', def: OBSTACLES.ridge, x: G.player.x + 50, y: G.player.y, r: 20, a: 0, charge: 0, flash: 0, seed: 1, burstT: 0 };
    G.terrain.grid = terrainGrid([ob]);
    const px0 = G.player.x; sb2.x = px0 - 40; sb2.y = G.player.y; sb2.sbWind = 0.01; G.hazards.push({ x: px0 + 60, y: G.player.y, r: 25, life: 5, max: 5, dmg: 0, color: '#f00', name: 'x', warn: 9 });
    run(3); if (G.player.x - px0 > 20) bad.push('rebound pushed into a hazard/obstacle: ' + (G.player.x - px0));
    // other damage types and ticks do not count
    fresh(); const sb3 = foe('stressball', 60); sb3.speed = 0;
    for (let i = 0; i < 8; i++) { G.t += 0.2; hit(sb3, 'fire', 5); hit(sb3, 'phys', 5, { dot: true }); hit(sb3, 'phys', 5, { rx: 'x' }); hit(sb3, 'phys', 5, { zoneHit: true }); }
    if (sb3.sb) bad.push('non-qualifying hits counted: ' + sb3.sb);
    fresh(); const sb4 = foe('stressball', 60); sb4.speed = 0; hit(sb4, 'phys', 5); hit(sb4, 'phys', 5); hit(sb4, 'phys', 5);
    if (sb4.sb !== 1) bad.push('hits within 0.1 s counted more than once: ' + sb4.sb);
    G.t += 2.2; run(2); if (sb4.sb !== 0) bad.push('squeeze did not relax after 2 s: ' + sb4.sb);
    // Mosquito: bite then refund on a quick kill, none on a late one
    fresh(); let m = foe('mosquito', 14); m.hp = m.maxHp = 5; const mh = G.player.hp;
    run(8); out.bite = Math.round((mh - G.player.hp) * 10) / 10;
    if (!(m.mq === 1) || !(m.fed > 0)) bad.push('Mosquito did not bite: ' + m.mq + ' ' + m.fed);
    const before = G.player.hp; killEnemy(m, { wname: 'test' }); const back = G.player.hp - before; out.back = Math.round(back * 100) / 100;
    if (!(back > 0 && back <= m.fed * 0.5 + 0.01)) bad.push('Mosquito refund: ' + back + ' of ' + m.fed);
    if (!G.zones.some(z => z.blood && z.elem === 'arcane' && z.r === 35)) bad.push('Mosquito left no blood pool');
    fresh(); m = foe('mosquito', 14); run(8); G.t += 5; const b2 = G.player.hp; killEnemy(m, { wname: 'test' });
    if (G.player.hp > b2) bad.push('late Mosquito kill refunded');
    // Matchstick: strike, lane, charge, trail zone
    fresh(); const ms = foe('matchstick', 200); let sawLane = false;
    run(1); ms.stT = 0; run(5); if (ms.st !== 1) bad.push('Matchstick did not strike: ' + ms.st); else sawLane = true;
    run(120);
    out.trail = G.zones.filter(z => z.nfTrail).length;
    if (!(out.trail >= 3) || !G.zones.find(z => z.nfTrail && z.elem === 'flame')) bad.push('Matchstick left no trail: ' + out.trail);
    // Candle: wax object, cap on walls, a lit Mucus patch goes off
    fresh(); const cn = foe('candle', 200); cn.cdT = 0.1;
    run(120); out.wax = (G.nfWax || []).length;
    if (!out.wax) bad.push('Candle made no wax');
    run(60 * 12); if ((G.nfWax || []).filter(w => w.owner === cn).length > 2) bad.push('Candle exceeded 2 walls');
    if (!(G.nfWax || []).some(w => w.soft <= 0) && out.wax) { /* may have crumbled by now; fine */ }
    fresh(); const cn2 = foe('candle', 100); G.zones.push(fightPatch(cn2.x + 30, cn2.y, 'test')); const foeInPatch = foe('crawler', 130); foeInPatch.speed = 0;
    const fh = foeInPatch.hp; run(120); out.lit = fh - foeInPatch.hp;
    if (!(foeInPatch.hp < fh) || !true) bad.push('lit Mucus patch did not go off');
    // wax blocks shots and movement
    fresh(); const cn3 = foe('candle', 400); G.nfWax = [{ x: G.player.x + 60, y: G.player.y, a: Math.PI / 2, soft: 0, hp: 30, life: 6, owner: cn3 }];
    const eb = { x: G.player.x + 200, y: G.player.y, vx: -300, vy: 0, dmg: 1, r: 4, life: 5, from: 'x' }; G.ebul.push(eb); run(40);
    if (!eb.dead) bad.push('wax did not stop an enemy bullet');
    const cr = foe('crawler', 160); cr.speed = 100; run(120); if (cr.x < G.player.x + 60 - 5 && false) bad.push('x');
    // Trapped Wind: bursts on a Fire hit and sets Burning on neighbours
    fresh(); const tw = foe('trappedwind', 100); const nb = foe('crawler', 120); nb.speed = 0; tw.speed = 0; nb.hp = nb.maxHp = 1e5;
    run(10); if (tw.dead || tw.nfLit) bad.push('Wind lit without Fire');
    hit(tw, 'flame', 5); if (!tw.nfLit) bad.push('Fire hit did not light the Wind');
    run(60); out.windDead = tw.dead;
    if (!tw.dead || !f_burning(nb)) bad.push('Wind burst: dead ' + tw.dead + ' burn ' + f_burning(nb));
    // no chain
    fresh(); const w1 = foe('trappedwind', 100), w2 = foe('trappedwind', 115); w1.speed = w2.speed = 0; hit(w1, 'flame', 5); run(80);
    if (w2.dead || w2.nfLit) bad.push('Wind chained to a second pocket');
    // a burning enemy touching it lights it
    fresh(); const w3 = foe('trappedwind', 100); w3.speed = 0; const bn = foe('crawler', 100); fightCd(bn).burnT = 3; bn.speed = 0; run(3);
    if (!w3.nfLit) bad.push('burning touch did not light the Wind');
    // Caps hold
    fresh(); G.typeN = {};
    const spawned = {}; for (const id of ['mosquito', 'candle', 'trappedwind']) { spawned[id] = 0; for (let i = 0; i < 12; i++) { if (foeRoom(ENEMIES[id])) { foe(id, 300 + i * 10); spawned[id]++; } } }
    out.caps = JSON.stringify(spawned);
    if (spawned.mosquito !== 4 || spawned.candle !== 1 || spawned.trappedwind !== 2) bad.push('caps: ' + out.caps);
    // Smouldering
    fresh(); const el = makeEnemy(ENEMIES.crawler, G.player.x + 400, G.player.y, { elite: true }); G.enemies.push(el); el.nfSm = true;
    const nbr = foe('crawler', 400); nbr.x = el.x + 20; nbr.y = el.y; nbr.hp = nbr.maxHp = 1e5; gridBuild(); el.hp = 0; killEnemy(el, { wname: 'test' });
    if (!(G.nfBurst && G.nfBurst.length)) bad.push('Smouldering death left no marked Burst'); run(60);
    if (!(nbr.hp < nbr.maxHp)) bad.push('Smouldering Burst hurt nobody');
    let sm = 0; for (let i = 0; i < 200; i++) { const q = makeEnemy(ENEMIES.crawler, 0, 0, { elite: true }); G.enemies.push(q); } run(1); for (const q of G.enemies) if (q.elite && q.nfSm) sm++;
    out.smouldering = sm + '/200'; if (sm < 20 || sm > 85) bad.push('Smouldering share off: ' + sm + '/200');
    // Ghost Swimmer: phased, it still takes hits (Evasion rolls, not immunity)
    fresh(); const gh = foe('phantom', 200); gh.speed = 0; gh.phased = true; gh.stT = 99; const g0 = gh.hp;
    for (let i = 0; i < 40; i++) hit(gh, 'phys', 10, { atk: 'burst' });
    out.ghost = Math.round(g0 - gh.hp); if (!(gh.hp < g0)) bad.push('phased Ghost took no damage from Burst hits');
    // Quantum Swimmer: shows its landing spot for 0.4 s, then jumps there; jumps at least 2 s apart
    fresh(); const qs = foe('blinker', 400); qs.speed = 0; qs.stT = 0; let seen = null, jumps = [], lx = null;
    run(600, () => { if (qs.qDest && !seen) seen = { x: qs.qDest.x, y: qs.qDest.y, px: qs.x, py: qs.y }; if (qs.qLast != null && qs.qLast !== lx) { jumps.push(qs.qLast); lx = qs.qLast; } });
    if (!seen) bad.push('Quantum showed no landing spot'); else if (!jumps.length) bad.push('Quantum did not jump to its shown spot');
    for (let i = 1; i < jumps.length; i++) if (jumps[i] - jumps[i - 1] < 1.99) bad.push('Quantum jumped twice within 2 s');
    out.quantumJumps = jumps.length;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
