// Relics on v10 (relics10.js, ENEMY_HANDOFF.md A1b): in the Lab Bench, take every boss and rival relic (and the
// ported SPOILS) once and check its hook fires: Shell layers appear, a Burn or Corrosion bar fills, a heal lands,
// a hit is blocked, a kill pays out. Also: no relic still writes armour, Cooties, the old melting burn or a retired type.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    const bad = [], out = {};
    let base = null;
    const fresh = id => {
      UI.sample = 's000'; newGame(); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0; G.zones.length = 0; G.pickups.length = 0;
      G.debug.god = false; G.relics = {}; G.lsBudget = 1000;
      base = { maxHp: G.P.maxHp, P: Object.assign({}, G.P) };
      if (id) applyRelic(id);
      G.state = 'play'; G.lootQueue = [];
    };
    const p = () => G.player;
    const foe = (dx, dy, o) => { const e = makeEnemy(ENEMIES.brute, p().x + (dx || 0), p().y + (dy || 0)); Object.assign(e, o || {}); G.enemies.push(e); gridBuild(); return e; };
    const shellFoe = (dx, dy, n) => { const e = foe(dx, dy, { v10def: { kind: 'shell', layers: n || 3 } }); e.cd = null; fightCd(e); return e; };
    const src = () => ({ w: G.weapons[0], elem: 'phys', wname: 'test' });
    const hit = (e, d) => damageEnemy(e, d || 20, src());
    const tick = (s, f) => { for (let t = 0; t < s; t += 1 / 30) { if (f) f(); relicTick(1 / 30); G.frameN = (G.frameN || 0) + 1; G.t += 1 / 30; G.realT += 1 / 30; } };
    const hurt = (d, ent, kind) => { p().iframes = 0; G.shieldT = 0; const h = p().hp; hurtPlayer(d, 'test', ent, kind || 'contact'); return h - p().hp; };
    const hpUp = () => G.P.maxHp > base.maxHp * 1.05;
    const up = k => G.P[k] > base.P[k] + 1e-6;
    const down = k => G.P[k] < base.P[k] - 1e-6;
    const layers = () => pdef().layers;
    const healed = f => { p().hp = G.P.maxHp * 0.5; const h = p().hp; f(); return p().hp > h + 1e-6; };
    const hurtNear = f => { const e = foe(40, 0); e.hp = e.maxHp = 1e6; f(e); return e.hp < 1e6; };
    const P = {
      // The Macrophage Queen.
      secondstomach: () => hpUp() && healed(() => { const e = foe(30, 0); killEnemy(e, src()); }),
      swallow: () => { const e = foe(0, 0); e.r = 6; for (let i = 0; i < 20 && !e.dead; i++) { p().iframes = 0; update(1 / 60); G.state = 'play'; } return e.dead; },
      court: () => { tick(0.2); return (G.court || []).length === 3; },
      // The Antibody Colossus.
      borderwall: () => hpUp() && down('speed') && layers() === 3 && !(G.P.armour > base.P.armour),
      bouncer: () => hurtNear(e => hurt(10, e)),
      diplomatic: () => hurt(10, foe(30, 0)) === 0,
      // The Immune Eye.
      thirdeye: () => up('crit') && up('critDmg'),
      deathstare: () => hurtNear(() => tick(2.5)),
      precog: () => { if (!up('dodge')) return false; const bl = { x: p().x + 30, y: p().y, vx: 0, vy: 0, dead: false }; G.ebul.push(bl); relicDodge(); return bl.dead; },
      // The Matron.
      bedside: () => healed(() => tick(1)),
      triage: () => { p().hp = G.P.maxHp * 0.3; hurt(20, foe(30, 0)); return p().hp >= G.P.maxHp * 0.69; },
      transfusion: () => healed(() => hit(foe(60, 0), 100)),
      // The Pepsinator.
      corrosive: () => { const e = shellFoe(60, 0, 2); e.hp = e.maxHp = 1e4; e.cd = null; fightCd(e); for (let i = 0; i < 40; i++) hit(e, 200); return e.cd.layers < 2 || e.cd.bars.acid > 0; },
      acidblood: () => { const e = foe(40, 0); e.hp = e.maxHp = 1e6; e.cd = null; hurt(5, foe(500, 500)); return e.hp < 1e6 && fightCd(e).bars.acid > 0; },
      ulcer: () => { for (let i = 0; i < 30; i++) killEnemy(foe(80, 0), src()); return G.zones.some(z => z.src && z.src.wname === 'Ulcer' && z.elem === 'fire'); },
      // Chad Prime.
      proteinpro: () => up('speed') && up('momentum'),
      tailwhip: () => hurtNear(e => { p().hd = 0; e.x = p().x - 40; e.y = p().y; gridBuild(); tick(0.6); }),
      sprint: () => hurtNear(() => tick(3.2)),
      // The Fever.
      runninghot: () => { const e = foe(60, 0); e.hp = e.maxHp = 1e4; e.cd = null; hit(e, 100); return fightCd(e).burnT > 0 && !(e.burn > 0); },
      feverdream: () => { const e = foe(60, 0); e.hp = e.maxHp = 1e4; burnAdd(fightCd(e), 100); tick(0.5); return G.feverN >= 1; },
      heatstroke: () => { const e = foe(60, 0), n = foe(80, 0); n.hp = n.maxHp = 1e6; burnAdd(fightCd(e), 50); killEnemy(e, src()); return n.hp < 1e6; },
      // Mitch & Osis.
      mirror: () => { recomputeAll(); return G.weapons[0].s.mirror > 0; },
      doubletrouble: () => up('multishot') && up('pierce') && up('chain'),
      twinpick: () => pfTotal({ kind: 'chest' }) === 2,
      // The Phantom Pregnancy.
      seethrough: () => { if (!up('dodge')) return false; G.P.dodge = 0; let through = 0; for (let i = 0; i < 40; i++) if (hurt(1, foe(300, 0), 'bullets') === 0) through++; return through > 5 && through < 35; },
      poltergeist: () => { const a = foe(60, 0), c = foe(200, 0); c.hp = c.maxHp = 1e6; c.elite = true; tick(2.2); return c.hp < 1e6 || a.hp < a.maxHp; },
      ectoplasm: () => up('dodge'),
      // The Litmus Strip.
      indicator: () => up('might') && up('haste'),
      bluetored: () => { const e = foe(60, 0); e.hp = e.maxHp = 1e7; e.cd = null; for (let i = 0; i < 60; i++) hit(e, 50); return fightCd(e).bars.acid > 0 && snared(e); },
      teststrip: () => { const L = { def: { litmus: true }, lit: 'shock', soakUntil: 0 }; return bpDamageMul(L, { elem: 'fire' }) === 1; },
      // The Johnny.
      rubber: () => pdHasShield(pdef()),
      ribbed: () => up('ram') && layers() === 1 && !(G.P.armour > base.P.armour),
      reservoir: () => { hurt(10, foe(300, 300)); if (!(G.resv > 0)) return false; return hurtNear(() => tick(10.5)); },
      // The Mucus Plug.
      plugged: () => { const e = foe(30, 0); hurt(10, e); return e.stasisT > G.realT; },
      snotrocket: () => { foe(100, 0); tick(2.2); return G.zones.some(z => z.src && z.src.wname === 'Snot Rocket'); },
      membrane: () => hpUp() && up('magnet'),
      // The Cramp.
      stitch: () => { const e = foe(150, 0); tick(3.2); return e.dazeT > G.t - 1; },
      charleyhorse: () => up('speed') && down('sprintCost'),
      clench: () => healed(() => { p().vx = p().vy = 0; tick(1, () => { p().vx = p().vy = 0; }); }),
      // The Sneeze.
      blessyou: () => up('dodge') && hurtNear(e => { p().hd = 0; p().face = 0; e.x = p().x + 80; e.y = p().y; gridBuild(); relicDodge(); }),
      atishoo: () => hurtNear(e => { p().hd = 0; p().face = 0; e.x = p().x + 80; e.y = p().y; gridBuild(); tick(3.2); }),
      binit: () => { const e = foe(60, 0), n = foe(90, 0); killEnemy(e, src()); return n.mark > 0; },
      // The Kidney Stone.
      lithotripsy: () => { const e = shellFoe(60, 0, 3); e.hp = e.maxHp = 1e4; e.cd = null; fightCd(e); for (let i = 0; i < 20; i++) hit(e, 300); return e.cd.layers < 3; },
      calcified: () => hpUp() && down('speed') && layers() === 4 && !(G.P.armour > base.P.armour),
      razors: () => { const e = shellFoe(40, 0, 3); e.hp = e.maxHp = 100; e.cd = null; fightCd(e); hurt(10, foe(300, 300)); return e.cd.layers < 3 && e.hp < 100; },
      // Rival relics (data.js).
      personalbest: () => up('speed'),
      marathon: () => healed(() => tick(1, () => { p().vx = 200; p().vy = 0; })),
      gains: () => hpUp(),
      tailday: () => up('ram'),
      honorary: () => up('xp'),
      thesis: () => up('critDmg'),
      smallmercies: () => { update(1 / 60); const r1 = p().r; G.relics.smallmercies = false; update(1 / 60); return r1 < p().r; },
      wobbly: () => up('grit') && (() => { p().hp = G.P.maxHp * 0.3; return tankDamageIn() < 1; })(),
      justkevin: () => up('might') && up('haste') && up('speed') && up('crit') && hpUp(),
      kevinsmum: () => { const n = G.pickups.length; tick(11); return G.pickups.length > n; },
      // Rival relics (rrelics.js).
      headstart: () => { p().iframes = 0; tick(3.2, () => { p().vx = 200; p().vy = 0; }); return G.dashRT > G.t; },
      earlybird: () => { const e = foe(60, 0); return rrelicDmgMul(e, src()) > 1; },
      pickpocket: () => up('magnet') && up('xp'),
      fivefinger: () => { const n = G.pickups.length, e = foe(60, 0, { elite: true }); killEnemy(e, src()); return G.pickups.length > n; },
      mucuswall: () => down('speed') && layers() === 2 && !(G.P.armour > base.P.armour),
      loadbearing: () => { p().vx = p().vy = 0; return rrelicDamageIn(10, null) < 10; },
      eagleeye: () => rrelicDmgMul(foe(500, 0), src()) > 1,
      steadyhand: () => up('range') && up('projSpeed'),
      buckshot: () => up('multishot') && up('haste'),
      triggerhappy: () => up('haste') && up('reloadSpd'),
      nowyouseeme: () => { tick(6.2); return p().iframes > 0; },
      herboys: () => { tick(0.2); return (G.boys || []).length === 2; },
      packedlunch: () => healed(() => rrelicLevel()),
      bloodbank: () => healed(() => hit(foe(60, 0), 200)),
      undying: () => { p().hp = 5; hurt(9999, foe(30, 0)); return G.state === 'play' && p().hp >= 1; },
      slimetrail: () => { tick(0.5, () => { p().vx = 200; p().vy = 0; }); return G.zones.some(z => z.src && z.src.wname === 'Slime Trail' && z.elem === 'ice'); },
      stickysit: () => { const e = foe(30, 0); hurt(10, e); return e.soapT > G.t; },
      peptalk: () => up('might') && up('haste'),
      whistle: () => { const e = foe(100, 0); tick(5.2); return e.dazeT > G.t - 1; },
      encore: () => { let n = 0; for (let i = 0; i < 60; i++) { const o = foe(100, 0), e = foe(60, 0); o.hp = o.maxHp = 1e6; killEnemy(e, src()); if (o.hp < 1e6) n++; o.dead = true; } return n > 0; },
      exitstage: () => { p().hp = G.P.maxHp * 0.3; const x = p().x; hurt(5, foe(30, 0)); return Math.abs(p().x - x) > 100; },
      cardigan: () => hpUp() && up('regen'),
      nottoday: () => { p().hp = 5; hurt(9999, foe(30, 0)); return G.state === 'play' && p().hp > G.P.maxHp * 0.4; },
      espresso: () => up('speed') && up('haste') && rrelicDamageIn(10, null) > 10,
      meltdown: () => { p().hp = G.P.maxHp * 0.3; return rrelicHaste() > 1; },
      calculated: () => up('crit') && up('critDmg'),
      probcloud: () => { let z = 0; for (let i = 0; i < 70; i++) { p().iframes = 0; if (rrelicDamageIn(10, null) === 0) z++; } return z > 2; },
      powerhouse: () => { p().hp = G.P.maxHp; return rrelicDmgMul(foe(60, 0), src()) > 1 && rrelicHaste() > 1; },
      mourning: () => healed(() => killEnemy(foe(60, 0), src())),
    };
    const ids = new Set();
    for (const B of BOSSES) { if (B.relics.length < 3) bad.push(B.id + ' has ' + B.relics.length + ' relics'); for (const id of B.relics) ids.add(id); }
    for (const k in RIVAL_RELICS) for (const id of RIVAL_RELICS[k]) ids.add(id);
    let ok = 0;
    for (const id of ids) {
      if (!RELICS[id]) { bad.push('no RELICS entry: ' + id); continue; }
      if (!P[id]) { bad.push('no probe for ' + id); continue; }
      fresh(id);
      let res = false;
      try { res = P[id](); } catch (err) { bad.push(id + ' threw ' + err.message); continue; }
      if (res) ok++; else bad.push(id + ' hook did not fire');
    }
    out.relics = ok + '/' + ids.size;
    // Layers survive a refit (pdef.js pdRefit -> relShell) and stop at the cap.
    fresh('borderwall'); applyRelic('calcified'); pdRefit(pdef()); out.capLayers = layers();
    if (layers() !== RELIC10.shellCap) bad.push('refit layers ' + layers() + ', want ' + RELIC10.shellCap);
    // SPOILS: Trophy Hide grows a Shell layer, Lab Notes lifts reaction damage, Gene Swap only offers v10 types.
    fresh(); const hide = SPOILS.hide(); hide.apply(); if (layers() !== 1 || G.P.armour > base.P.armour) bad.push('Trophy Hide: layers ' + layers());
    fresh(); SPOILS.notes().apply(); if (!(relRxMul(null, { rx: 'splash' }) > 1.3)) bad.push('Lab Notes reaction multiplier');
    fresh(); for (let i = 0; i < 30; i++) { const o = optMod(G.weapons[0], 'elemental', 4); if (!V10_TYPES.includes(o.elem)) { bad.push('Gene Swap offered ' + o.elem); break; } }
    for (const k of ['trophy', 'blood', 'gland', 'lap', 'bounty', 'crit']) { fresh(); const s = SPOILS[k](); if (!s.ok || s.ok()) s.apply(); }
    // Nothing a relic does should touch retired v9 state.
    const txt = [applyRelic, relicHit, relicKill, relicHurt, relicTick, bpRelicApply, bpRelicHit, bpRelicHurt, bpRelicTick, rrelicApply, rrelicTick, rrelicKill].map(f => f.toString()).join('\n') + Object.values(SPOILS).map(f => f.toString()).join('\n');
    for (const re of [/armour \+=/, /shred/, /'poison'/, /setPoison/, /setBurn/, /e\.burn\b/]) if (re.test(txt)) bad.push('relic code still uses ' + re);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
