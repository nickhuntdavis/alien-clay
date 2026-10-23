// The rest of the sperm passives (spfull.js): the kept list only; Pile-Up, Wet Floor, Chain Letter, Bleeding Heart, Peer
// Pressure, Leave a Little Something; the pairs Come Closer and Death Is Recycling; masteries; renames.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = 1000; G.player.hp = 500; G.manual = { x: 0, y: 0 }; G.player.vx = G.player.vy = 0; G.weapons[0] = makeSlot('v_phys_proj', false, 9); for (let i = 1; i < G.weapons.length; i++) G.weapons[i] = null; computeStats(G.weapons[0]); G.level = 30; return G.weapons[0]; };
    const foe = (dx, dy, hp) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + (dy || 0), {}); e.speed = 0; e.hp = e.maxHp = hp || 1e5; G.enemies.push(e); return e; };
    const card = id => CARDS.find(c => c.id === id);
    const tick = n => { for (let i = 0; i < n; i++) wupTick(1 / 60); };
    // 1. The list: cut cards never dealt, kept ones are; renames
    out.skip = ['m_fingers', 't_force', 't_blood', 'r_closer', 'x_qty', 'g_turbo', 'g_soup', 'g_greedyhands'].filter(id => card(id) && !mdDraftSkip(card(id)));
    out.keep = SP_KEEP.filter(id => !card(id) || mdDraftSkip(card(id)));
    if (out.skip.length || out.keep.length) bad.push('list ' + JSON.stringify([out.skip, out.keep]));
    out.names = ['m_excite', 't_mucus', 'x_once', 'x_hungry'].map(id => card(id).title);
    if (out.names.join() !== 'Overexcited,Stickier,All at Once,Hungry Hungry') bad.push('names ' + out.names);
    // 2. Pile-Up: further knockback; a flying enemy hurts the first it hits
    fresh(); card('sp_pile').apply(G); const a = foe(100), c = foe(400, 0);
    a.kx = 200; a.ky = 0; mutHit(a, 50, { elem: 'phys', w: G.weapons[0] }, 'force', {});
    out.pileK = Math.round(a.kx); if (out.pileK !== 260 || !a.spPile) bad.push('Pile-Up knock ' + out.pileK);
    c.x = a.x + a.r + c.r; const hc = c.hp; tick(1); out.pile = Math.round(hc - c.hp); if (!(c.hp < hc)) bad.push('Pile-Up collision');
    // 3. Wet Floor: Acid pools bigger and longer
    fresh(); card('sp_wet').apply(G); G.zones.push({ x: 0, y: 0, r: 40, life: 2, max: 2, dps: 10, elem: 'fire', pull: 0, color: '#fff', tick: 0, src: { w: G.weapons[0], elem: 'fire' } });
    tick(1); out.wet = [G.zones[0].r, +G.zones[0].life.toFixed(2)]; if (G.zones[0].r !== 52) bad.push('Wet Floor ' + out.wet);
    // 4. Chain Letter: one more jump, further
    fresh(); card('sp_chain').apply(G); const s1 = foe(0, -300), s2 = foe(125, -300), s3 = foe(250, -300);
    for (const e of [s1, s2, s3]) e.chargeT = G.t + 3; const h3 = s3.hp; fightArc(s1, 100, 1);
    out.chain = [s2.hp < 1e5, s3.hp < h3]; if (!(s2.hp < 1e5 && s3.hp < h3)) bad.push('Chain Letter ' + out.chain);
    // 5. Bleeding Heart: stronger Bleed; Extraction heals more
    fresh(); card('sp_bleed').apply(G); const bl = foe(0, 200); fightStatus(bl, 'arcane', 120, {});
    out.bleed = +bl.bleeds[0].dps.toFixed(2); if (Math.abs(out.bleed - 120 * 0.3 / 3 * 1.25) > 0.01) bad.push('Bleeding Heart bleed ' + out.bleed);
    const hp0 = G.player.hp; fightDeath(bl, {}); out.heal = Math.round(G.player.hp - hp0); if (!(out.heal >= 10)) bad.push('Bleeding Heart heal ' + out.heal);
    // 6. Peer Pressure: Possessed lasts longer; ally hits harder
    fresh(); card('sp_peer').apply(G); const pe = foe(0, 250); curseFoe(pe, 4); out.peer = [pe.charmed, +(pe.charmT || 0).toFixed(2), +wupDmgMul(pe, { fromAlly: true }).toFixed(2)];
    if (!pe.charmed || Math.abs(pe.charmT - 5.2) > 0.01 || Math.abs(out.peer[2] - 1.2) > 0.01) bad.push('Peer Pressure ' + out.peer);
    // 7. Leave a Little Something: longer pools and a last tick
    fresh(); card('sp_leave').apply(G); const lf = foe(0, 0); G.zones.push({ x: lf.x, y: lf.y, r: 40, life: 2, max: 2, dps: 50, elem: 'phys', pull: 0, color: '#fff', tick: 0, src: { w: G.weapons[0], elem: 'phys' } });
    tick(1); out.leave = +G.zones[0].life.toFixed(2); if (!(out.leave > 2.9)) bad.push('Leave life ' + out.leave);
    G.zones[0].life = 0.2; const hl = lf.hp; tick(1); out.leaveHit = Math.round(hl - lf.hp); if (!(lf.hp < hl)) bad.push('Leave last tick');
    // 8. Pairs: Come Closer bonus; the other half is weighted up
    fresh(); const pc = card('sp_pile'); out.startBefore = pc.start; card('t_mucus').apply(G); out.startAfter = pc.start;
    if (out.startBefore || !out.startAfter) bad.push('pair weight ' + [out.startBefore, out.startAfter]);
    pc.apply(G); const sn = foe(0, 300); sn.snareT = G.t + 2; out.closer = +wupDmgMul(sn, { elem: 'phys' }).toFixed(2); if (out.closer !== 1.25) bad.push('Come Closer ' + out.closer);
    // 9. Masteries: a 4th rank, counted
    fresh(); const pu = card('sp_pile'); for (let i = 0; i < 4; i++) if (pu.eligible(G)) pu.apply(G);
    out.mast = [mr('sp_pile'), (G.spM || []).join()]; if (mr('sp_pile') !== 4 || !(G.spM || []).includes('sp_pile')) bad.push('mastery ' + out.mast);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
