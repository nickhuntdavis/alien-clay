// v10 combat slice (fight.js + combat.js): the five defences work on real enemies, and each of the five slice
// reactions fires on its trigger (and not without it). Run stats (G.fst) count what happened.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; };
    const foe = (id, dx) => { const p = G.player, e = makeEnemy(ENEMIES[id], p.x + (dx || 90), p.y); e.hp = e.maxHp = 1000; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const hit = (e, elem, amt, atk) => damageEnemy(e, amt, { elem, atk: atk || 'proj', noCrit: true, wname: 'test' });
    // Defences
    fresh();
    const sq = foe('brute'), pl = foe('crawler', 140);
    out.squishy = [hit(sq, 'phys', 100), hit(pl, 'phys', 100)].map(Math.round);
    if (!(out.squishy[0] < out.squishy[1] * 0.7)) bad.push('Squishy did not soften Force: ' + out.squishy);
    if (Math.round(hit(sq, 'fire', 100)) < 99) bad.push('Squishy cut Acid');
    const mb = foe('bulwark');
    const d1 = hit(mb, 'fire', 100); out.membrane = [Math.round(d1), Math.round(mb.cd.mem)];
    if (d1 !== 0 || !(mb.cd.mem < mb.cd.memMax)) bad.push('Membrane did not absorb: ' + out.membrane);
    hit(mb, 'shock', 20); if (mb.chargeT > G.t) bad.push('status went through a fully soaked hit');
    const sh = foe('diatom'), L0 = sh.cd ? sh.cd.layers : fightCd(sh).layers;
    out.shell = [L0, Math.round(hit(sh, 'phys', 20))];
    hit(sh, 'phys', 200); // heavy: 20% of max health
    out.shell.push(sh.cd.layers);
    if (!(L0 >= 2) || !(sh.cd.layers < L0)) bad.push('Shell layers: ' + out.shell);
    const ev = foe('skitter'); let miss = 0;
    for (let i = 0; i < 200; i++) if (hit(ev, 'phys', 1) === 0) miss++;
    out.evasion = miss;
    if (miss < 40 || miss > 110) bad.push('Evasion misses out of 200: ' + miss);
    let burstMiss = 0; for (let i = 0; i < 50; i++) { IN_AOE = true; if (hit(ev, 'phys', 1, 'burst') === 0) burstMiss++; IN_AOE = false; }
    if (burstMiss) bad.push('Evasion dodged a Burst');
    pdef().mem.mem = 0; // (your own base Membrane would soak the recoil: pdef.js)
    const th = foe('ingrown'), hp0 = G.player.hp;
    hit(th, 'phys', 50, 'contact'); const hp1 = G.player.hp; G.player.iframes = 0;
    hit(th, 'phys', 50, 'proj'); const hp2 = G.player.hp;
    out.thorns = [Math.round(hp0 - hp1), Math.round(hp1 - hp2)];
    if (!(hp1 < hp0) || hp2 !== hp1) bad.push('Thorns: ' + out.thorns);
    // Reactions
    fresh();
    const a = foe('crawler'), n1 = foe('crawler', 130);
    a.corrodedT = G.t + 4; hit(a, 'phys', 20);
    if (!(G.fst.rx.splash === 1) || !(n1.cd && n1.cd.bars.acid > 0)) bad.push('Corrosive Splash: ' + JSON.stringify(G.fst.rx));
    hit(n1, 'phys', 20); if (G.fst.rx.splash !== 1 && !(n1.corrodedT > G.t) && !(n1.cd.bars.acid > 0.15)) bad.push('splash fired on a clean target');
    const s = foe('crawler', -100); hit(s, 'phys', 10); if (G.fst.rx.rocket) bad.push('Snot Rocket without Snared');
    hit(s, 'ice', 10); const kx0 = s.kx; hit(s, 'phys', 10);
    if (G.fst.rx.rocket !== 1 || !(Math.abs(s.kx - kx0) > 200)) bad.push('Snot Rocket: ' + JSON.stringify(G.fst.rx));
    fresh();
    const pool = { x: G.player.x + 90, y: G.player.y, r: 58, life: 3.5, max: 3.5, dps: 0, quiet: true, elem: 'fire', pull: 0, color: '#f0f', tick: 0, src: { elem: 'fire' } };
    G.zones.push(pool); const in1 = foe('crawler', 90), in2 = foe('crawler', 110);
    const h0 = in2.hp; hit(in1, 'shock', 20);
    if (G.fst.rx.cpool !== 1 || !(in2.hp < h0)) bad.push('Conductive Pool: ' + JSON.stringify(G.fst.rx));
    hit(in1, 'shock', 20); if (G.fst.rx.cpool !== 1) bad.push('Conductive Pool fired twice on one pool');
    fresh();
    G.zones.push(fightPatch(G.player.x + 90, G.player.y, 'test')); const m = foe('crawler', 90);
    hit(m, 'fire', 20);
    if (G.fst.rx.slick !== 1 || !G.zones.some(z => z.elem === 'fire' && z.life > 0)) bad.push('Slick Move: ' + JSON.stringify(G.fst.rx));
    fresh();
    const patch = fightPatch(G.player.x + 90, G.player.y, 'test'); G.zones.push(patch); const c = foe('crawler', 90);
    hit(c, 'shock', 5);
    if (!patch.charged) bad.push('Sticky Situation: patch not charged');
    const walker = foe('crawler', 300); fightTick(0.016); if (G.fst.rx.sticky) bad.push('sticky fired with nobody entering');
    walker.x = patch.x + 10; walker.y = patch.y; gridBuild(); fightTick(0.016);
    if (G.fst.rx.sticky !== 1 || !(walker.dazeT > G.t)) bad.push('Sticky Situation: ' + JSON.stringify(G.fst.rx));
    // Two types on one enemy are never enough on their own.
    fresh();
    const x = foe('crawler'); for (const el of ['fire', 'shock', 'ice', 'phys']) hit(x, el, 5);
    out.mixed = JSON.stringify(G.fst.rx);
    if (Object.keys(G.fst.rx).some(k => k !== 'rocket')) bad.push('mixed types reacted: ' + out.mixed); // (Mucus then Force is a real Snot Rocket)
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
