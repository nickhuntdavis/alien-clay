// The slice's sperm passives and pairs (spslice.js): Personal Space pushes (Repel) or pulls (Attract, chosen on its Rank 2
// fork); Fever Pitch spreads Burn from a burning kill; Internal Ricochet needs the whole Membrane Shield and bounces shots
// back inside the bubble; Chain reaction sends a beam bounce to a linked enemy; pair halves are dealt more often.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; G.manual = { x: 0, y: 0 }; G.player.vx = G.player.vy = 0; G.weapons[0] = makeSlot('v_flame_beam', false, 9); for (let i = 1; i < G.weapons.length; i++) G.weapons[i] = null; computeStats(G.weapons[0]); G.level = 30; return G.weapons[0]; };
    const foe = (dx, dy, hp) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + (dy || 0), {}); e.speed = 0; e.hp = e.maxHp = hp || 1e5; G.enemies.push(e); return e; };
    const card = id => CARDS.find(c => c.id === id);
    const tick = n => { for (let i = 0; i < n; i++) wupTick(1 / 60); };
    // 1. Personal Space: Repel pushes out; the Rank 2 fork; Attract pulls in
    fresh(); const ps = card('sp_space'); ps.apply(G); const e1 = foe(50); tick(30); const d1 = Math.hypot(e1.x - G.player.x, e1.y - G.player.y);
    ps.apply(G); const fq = G.lootQueue.find(q => q.sp); out.fork = fq && genLoot(fq).map(c => c.title);
    if (!fq || out.fork.join() !== 'Repel,Attract') bad.push('Personal Space fork ' + out.fork); else genLoot(fq)[1].apply();
    const e2 = foe(75); tick(30); const d2 = Math.hypot(e2.x - G.player.x, e2.y - G.player.y);
    out.space = [Math.round(d1), Math.round(d2)]; if (!(d1 > 50) || !(d2 < 75)) bad.push('Personal Space push/pull ' + out.space);
    // 2. Fever Pitch: a burning kill sets a neighbour alight
    fresh(); card('sp_fever').apply(G); const k = foe(0, -150, 50), n = foe(30, -150); burnAdd(fightCd(k), 200); damageEnemy(k, 1e4, weaponSrc(G.weapons[0])); update(1 / 60);
    out.fever = [k.dead, n.cd && n.cd.burnT > 0]; if (!k.dead || !(n.cd && n.cd.burnT > 0)) bad.push('Fever Pitch ' + out.fever);
    // 3. Internal Ricochet: only with the whole Membrane Shield; shots bounce back inside the bubble
    fresh(); const ir = card('sp_iric'); if (ir.eligible(G)) bad.push('Internal Ricochet without the shield');
    for (const id of ['latex', 'thick', 'fast']) pdefCard(id).apply(); G.pd.mem.mem = G.pd.mem.memMax = 100;
    out.iricOk = ir.eligible(G); if (!out.iricOk) bad.push('Internal Ricochet not offered with the full shield');
    ir.apply(G); const R = pdefBubbleR(), p = G.player; G.proj.push({ x: p.x + R + 5, y: p.y, vx: 300, vy: 0, life: 1, w: G.weapons[0], src: weaponSrc(G.weapons[0]) }); tick(1);
    const pr = G.proj[G.proj.length - 1]; out.iric = [Math.round(R), pr.vx]; if (!(R > 0) || !(pr.vx < 0)) bad.push('Internal Ricochet bounce ' + out.iric);
    // 3b. Bigger Membrane: only with the shield; the bubble is wider; it uses no slot of its own
    fresh(); const hasWide = () => pdefOffer(99).some(o => o.defence === 'wide');
    out.wideNoShield = hasWide(); if (hasWide()) bad.push('Bigger Membrane offered without a shield');
    pdefCard('latex').apply(); G.pd.mem.mem = G.pd.mem.memMax = 100; const r0 = pdefBubbleR(), d0 = defsHeld();
    pdefCard('wide').apply(); const r1 = pdefBubbleR();
    out.wide = [Math.round(r0), Math.round(r1), d0, defsHeld()]; if (!(r1 > r0 * 1.5) || defsHeld() !== d0) bad.push('Bigger Membrane ' + out.wide);
    // 4. Chain reaction: Connecting + Ricochet sends the bounce down a link
    fresh(); const w = G.weapons[0]; modAdd(w, 'connecting'); modAdd(w, 'ricochet'); computeStats(w);
    const a = foe(150), c = foe(150, 200); msLinkAdd(w, a, c, 5); const hc = c.hp; w.lzFireT = G.t; v10Fire(w, a, weaponSrc(w)); // (lzFireT: the beam is already on, so it skips the charge-up, laserbeam.js v10.90)
    out.chain = Math.round(hc - c.hp); if (!(c.hp < hc)) bad.push('Chain reaction');
    // 5. Pair weight: holding Connecting makes Ricochet 50% likelier
    fresh(); const w2 = G.weapons[0]; const base = modDraftCands('level').find(x => x.fam === 'mod:ricochet'); const w0 = base && base.w;
    modAdd(w2, 'connecting'); computeStats(w2); const after1 = modDraftCands('level').find(x => x.fam === 'mod:ricochet');
    out.pairW = [w0, after1 && after1.w]; if (!(after1 && after1.w > w0 * 1.4)) bad.push('pair weight ' + out.pairW);
    // 6. Slice only: drafts deal the slice's modifiers, passives and Membrane Shield, plus Feats
    SLICE.force = true; fresh(); const seen = new Set();
    for (let i = 0; i < 60; i++) for (const c of genLoot({ kind: 'level' })) if (c) seen.add(c.card || (c.defence && 'def:' + c.defence) || c.id || c.title);
    SLICE.force = false;
    const stray = [...seen].filter(k => !(k.startsWith('feat') || k === 'switch' || (k.startsWith('mod:') && SLICE.mods.includes(k.slice(4))) || (k.startsWith('def:') && SLICE.defs.includes(k.slice(4))) || SLICE.muts.includes(k)));
    out.stray = stray; if (stray.length) bad.push('slice only dealt ' + stray);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
