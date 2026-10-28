// Specialist passives (specpass.js): Alpha charges harder while moving (and its fire rate is no longer boosted), Beta heals from the Bleed
// its enemies take below 40% health (no damage bonus, no hit lifesteal), Redtail ignites what its body touches (Static no longer adds to
// the burn), Prawn Again's Possessed enemies hit twice as hard and apply no Bleed; Private Schooled keeps its own x2.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const run = (id, k) => { META.profile = 's10_' + id; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; genLoot({ kind: 'start' })[k || 0].apply(); return G.weapons.find(Boolean); };
    const foe = (x, y) => { const e = makeEnemy(ENEMIES.crawler, G.player.x + x, G.player.y + y); e.hp = e.maxHp = 1e7; e.speed = 0; G.enemies.push(e); fightCd(e); gridBuild(); return e; };
    const src = w => ({ elem: 'shock', atk: 'proj', noCrit: true, wname: 't', w });
    const stand = () => { G.player.vx = 0; G.player.vy = 0; }, swim = () => { G.player.vx = 120; G.player.vy = 0; };
    if (SAMPLES10.length && (!S10_BY.alpha.pdesc || /TODO_COPY/.test(S10_BY.alpha.pdesc))) bad.push('alpha pdesc ' + S10_BY.alpha.pdesc);
    if (S10_BY.prawn.pdesc !== 'Enemies it Possesses hit their old friends twice as hard.') bad.push('prawn pdesc ' + S10_BY.prawn.pdesc);

    // ---- Alpha: a moving Static hit Charges longer and arcs harder; a moving Force hit Charges briefly; no fire-rate bonus
    { const w = run('alpha'); G.player.hp = G.P.maxHp;
      const charge = moving => {
        G.enemies.length = 0; const e = foe(80, 0), n = foe(150, 0); moving ? swim() : stand();
        const hp0 = n.hp; damageEnemy(e, 100, src(w)); return { t: e.chargeT - G.t, arc: hp0 - n.hp };
      };
      const still = charge(false), mv = charge(true); out.alpha = { still, mv };
      if (!(mv.t > still.t + 1.2)) bad.push('Alpha: moving Static Charge not longer ' + JSON.stringify({ still, mv }));
      if (!(still.arc > 0) || !(mv.arc > still.arc * 1.3)) bad.push('Alpha: moving arcs not harder ' + JSON.stringify({ still, mv }));
      G.enemies.length = 0; let e = foe(80, 0); swim(); damageEnemy(e, 100, { elem: 'phys', atk: 'proj', noCrit: true, wname: 't', w });
      if (!(e.chargeT > G.t && e.chargeT - G.t <= 1.01)) bad.push('Alpha: moving Force hit did not Charge for 1 s ' + (e.chargeT - G.t));
      G.enemies.length = 0; e = foe(80, 0); stand(); damageEnemy(e, 100, { elem: 'phys', atk: 'proj', noCrit: true, wname: 't', w });
      if (e.chargeT > G.t) bad.push('Alpha: standing Force hit Charged');
      swim(); s10Tick(0.016); if (w.rateK > 1) bad.push('Alpha: fire rate still boosted ' + w.rateK);
    }

    // ---- Beta: below 40% health, Bleed ticks heal; no damage bonus; no lifesteal on a plain hit
    { const w = run('beta'), P = G.P; P.maxHp = 1e5; /* (room to heal into) */
      G.enemies.length = 0; const e = foe(80, 0);
      G.player.hp = P.maxHp * 0.3; const k = s10DmgMul(e, { elem: 'arcane' }); if (Math.abs(k - 1) > 1e-6) bad.push('Beta: damage bonus still on ' + k);
      const hp1 = G.player.hp; damageEnemy(e, 200, { elem: 'phys', atk: 'proj', noCrit: true, wname: 't', w }); if (G.player.hp > hp1 + 1e-6) bad.push('Beta: lifesteal still on a plain hit');
      const bleed = hp => { e.bleeds = []; G.player.hp = P.maxHp * hp; fightStatus(e, 'arcane', 3000, { wname: 't' }); const h0 = G.player.hp, hp0 = e.hp; fightTick(1); return { gain: G.player.hp - h0, dealt: hp0 - e.hp }; };
      const lo = bleed(0.12), mid = bleed(0.3), hi = bleed(0.9); out.beta = { lo, mid, hi };
      if (!(mid.gain > 0 && mid.dealt > 0)) bad.push('Beta: no heal at 30% ' + JSON.stringify(mid));
      else if (Math.abs(mid.gain / mid.dealt / P.healMult - 0.25 - 0.25 * (0.4 - 0.3) / 0.3) > 0.02) bad.push('Beta: share at 30% ' + (mid.gain / mid.dealt));
      if (!(lo.gain / lo.dealt > mid.gain / mid.dealt)) bad.push('Beta: heal not larger nearer death');
      if (hi.gain > 1e-6) bad.push('Beta: healed above 40% ' + hi.gain);
    }

    // ---- Redtail: body contact ignites (once a second per enemy); a Static hit no longer adds to the burn
    { const w = run('redtail'); G.enemies.length = 0; const touch = foe(0, 0), far = foe(300, 0);
      hookSafe('tick', 0.016);
      if (!(touch.cd.burnT > 0)) bad.push('Redtail: body contact did not ignite');
      if (far.cd.burnT > 0) bad.push('Redtail: a far enemy ignited');
      const pool = touch.cd.burnPool; hookSafe('tick', 0.016); if (touch.cd.burnPool !== pool) bad.push('Redtail: ignited twice inside the cooldown');
      G.t += 1.2; hookSafe('tick', 0.016); if (!(touch.cd.burnPool > pool - 1e-9)) bad.push('Redtail: no second ignition after the cooldown');
      damageEnemy(far, 100, src(w)); if (far.cd.burnT > 0) bad.push('Redtail: Static still adds to the burn');
      out.redtail = touch.cd.burnPool;
    }

    // ---- Prawn Again: x2 on an ally-sourced hit, no Bleed; Private Schooled keeps its own x2; no stacking when both are held
    { const w = run('prawn'); G.enemies.length = 0; const e = foe(80, 0);
      if (s10DmgMul(e, { fromAlly: true }) !== 2) bad.push('Prawn: ally hit not x2 ' + s10DmgMul(e, { fromAlly: true }));
      if (s10DmgMul(e, {}) !== 1) bad.push('Prawn: plain hit not x1');
      damageEnemy(e, 100, { fromAlly: true, noCrit: true, wname: 't' });
      if (e.bleeds && e.bleeds.length) bad.push('Prawn: ally hit still applies Bleed');
      const hp0 = e.hp; damageEnemy(e, 100, { fromAlly: true, elem: 'phys', noCrit: true, wname: 't2' }); const x2 = hp0 - e.hp;
      damageEnemy(e, 100, { elem: 'phys', noCrit: true, wname: 't3', w }); const hp1 = e.hp; damageEnemy(e, 100, { elem: 'phys', noCrit: true, wname: 't4', w }); const x1 = hp1 - e.hp;
      out.prawn = { x2, x1 }; if (!(x2 > x1 * 1.6)) bad.push('Prawn: ally hit not about double ' + x2 + ' vs ' + x1);
      run('private'); G.enemies.length = 0; const f = foe(80, 0); if (s10DmgMul(f, { fromAlly: true }) !== 2) bad.push('Private Schooled lost its x2');
    }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
