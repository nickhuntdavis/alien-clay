'use strict';
// Spawn Prawn - Alpha reimagined, part 2: hustle culture (ALPHA_REDESIGN.md, the user's design, 30 Oct 2026). Alpha-only sets for
// Unwanted Contact and Obligatory Podcast, plus four gated cards. Read baseline1.js for the pattern.
//  - Unwanted Contact (s_tesla, wupRegFor('alpha', ...)): Networking Event (2 more jumps, 25% weaker each; Business Card, Elevator Pitch;
//    wild Lanyard; mastery Rolodex), Cold Caller (furthest untouched first, range +40%; Follow-Up, Robo-Call; wild Do Not Call; Hard Sell),
//    Influencer (followers: +2% damage each up to 25, a hit loses 5; Going Viral, Brand Deal; wild Cancelled; Blue Tick). Once a branch is
//    taken the slot's own 'fire' hook (wupOn, the same way wup4.js ucFire does it) runs a bounded chain of its own (ucChain below).
//  - Obligatory Podcast (v_phys_podcast, wupRegFor('alpha', ...)): Hot Take (half as wide, 2.5x, Poise fills / staggers; Cancelled, Ratio;
//    wild Clip Farmer; Discourse), Three-Hour Episode (5 waves, each 35% weaker, reach +30%; Ad Read, Patreon Tier; wild Filler; Never Ends),
//    Call-In Show (every 3rd shot returns; Long-Time Listener, Dead Air; wild Caller on Hold; Live Studio Audience). A branch slot takes the
//    shot through a 'fire' hook at order 900 (after the modifiers, before podcast.js' own at 1000) and spawns the same piercing waves as
//    podcast.js (pr.pod), with per-wave width, count and damage. A wave that turns round or lingers is steered in a tick hook.
//  - Gated cards (the branch gate is a Do rule in cardrules.js, added at merge; eligible here is just "not held / not taken"): Feats
//    Morning Routine (al_morning, Red Flagship B) and Going Live (al_golive, Unwanted Contact C); passives Diamond Hands (al_diamond, Red
//    Flagship C: refunds 5 stamina on a Crypto Bro pump burst, through AL1.onPumpBurst from alpha1.js) and Main Character Energy (al_mce,
//    Obligatory Podcast A: staggered enemies take 20% more from everything).
//  - Copy: every card, fork and float text is TODO_COPY:<id>, looked up in AL_COPY (the user's copy file, loaded before this) first.
// Simplified: "cannot be slowed" (Morning Routine) clears the known player slows each frame (Snotty, tangle, sticky, snare) and floors
// mutSpeed at 1; "ignore you" (Do Not Call) is a 1.5 s lure to the enemy's own spot plus holding fire (newfeats.js nfLure / nfNoFireT);
// Brand Deal heals from the chain's intended damage, capped at 3% max health a chain; followers add damage to Unwanted Contact only.
// Hooks: wupRegFor (samplebranches.js), wupOn, hookOn('fire'), hookOn('tick'), hookOn('dmgMul'), hookOn('hurt'); wraps rateBonus (arsenal.js)
// and mutSpeed (mutations.js); AL1.onPumpBurst (alpha1.js; made here if it is not there yet). Loads after alpha1.js. Save data: none.

if (typeof AL1 === 'undefined') globalThis.AL1 = { onPumpBurst: [] };

const AL2 = { UC: 's_tesla', OP: 'v_phys_podcast', RF: 'v_shock_beam', cap: 25, folK: 0.02, fx: {} };

(function () {
  const T = id => (typeof AL_COPY !== 'undefined' && AL_COPY[id]) || 'TODO_COPY:' + id;
  const YEL = '#ffe94a', PALE = '#f1ecff';
  const F = w => w.al2 || (w.al2 = {});
  const ST = () => G.al2 || (G.al2 = { fol: 0, morn: null, live: null });
  const slotOf = id => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === id) : null);
  const branchOf = id => { const w = slotOf(id); return w && w.up ? w.up.p || '' : ''; };
  const sayT = {};
  function say(key, x, y, txt, color, size, gap) { if ((sayT[key] || 0) > G.realT) return; sayT[key] = G.realT + (gap || 0.5); floatText(x, y, txt, color || YEL, size || 12, 0.7); }
  const isElite = e => !!(e && (e.elite || e.rival) && !e.boss);
  const stamAdd = n => { if (G && G.stam && typeof stamMax === 'function') G.stam.cur = Math.min(stamMax(), G.stam.cur + n); };
  const cardSrc = (w, over) => Object.assign(weaponSrc(w), { wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name }, over || {});
  function poise(e, fill) { // Force bar up by fill; true when it staggered
    if (!e || e.dead) return false;
    const c = fightCd(e); c.bars.force += fill; c.barQuietT.force = 0;
    if (c.bars.force >= 1) { c.bars.force = 0; fightPayoff(e, 'stagger', { raw: 0 }, {}); return true; }
    return false;
  }
  const stagger = e => { if (e.dead) return false; fightPayoff(e, 'stagger', { raw: 0 }, {}); return true; };
  function addFol(n) {
    const s = ST(), was = s.fol; s.fol = Math.min(AL2.cap, s.fol + n);
    if (was < AL2.cap && s.fol >= AL2.cap) { const p = G.player; ring(p.x, p.y, p.r + 18, YEL, 0.5, 4); say('fol25', p.x, p.y - 34, T('al_uc_followers_float'), YEL, 14, 1); }
  }
  AL2.addFol = addFol;

  // ================================================================ Unwanted Contact (Static chains)
  // A bounded chain (a copy of game.js doChain with the cards). Jump k (0 = the first enemy) deals dmg * keep^k, then the card changes.
  function ucStats(w, s) {
    const f = F(w);
    if (f.p === 'A') { f.baseJ = s.chain || 0; s.chain = (s.chain || 0) + 2; }
    if (f.p === 'B') s.jump *= 1.4;
  }
  function ucNext(w, cur, hit, jumpR) {
    const f = F(w); let best = null, bk = null;
    forNear(cur.x, cur.y, jumpR, (e, d2) => {
      if (e === cur || e.dead || e.charmed || e.egg || hit.has(e)) return false;
      let k;
      if (f.p === 'B') k = (e.chargeT > G.t ? 0 : 1e9) + d2; // untouched first, then the furthest
      else if (f.lanyard) k = (isElite(e) ? 1e9 : 0) - d2; // Elites first, then the nearest
      else k = -d2;
      if (bk === null || k > bk) { bk = k; best = e; }
      return false;
    });
    return best;
  }
  function ucChain(w, x0, y0, first, src) {
    const f = F(w), s = w.s, fol = ST().fol, hit = new Set(), p = G.player;
    const jumps = Math.max(0, s.chain || 0), jumpR = (s.jump || 140) * (f.viral && fol >= AL2.cap ? 2 : 1);
    const dmg0 = s.dmg * (f.p === 'C' ? 1 + AL2.folK * fol : 1);
    let cur = first, px = x0, py = y0, intended = 0;
    for (let k = 0; k <= jumps && cur; k++) {
      let m = f.rolodex ? 1 : f.hard ? Math.pow(1.25, k) : Math.pow(0.88, k);
      if (f.p === 'A' && !f.rolodex && f.baseJ != null && k > f.baseJ) m *= Math.pow(0.75, k - f.baseJ); // the extra jumps, each 25% weaker
      if (k === 0 && f.pitch) m *= 2;
      const wet = G.pair && G.pair.conductive && cur.wetT > G.t ? 2 : 1;
      bolt(px, py, cur.x, cur.y, YEL, 0.16);
      damageEnemy(cur, dmg0 * m * wet, Object.assign({}, src, { al2uc: 1 }, k ? { chainHop: 1 } : null));
      intended += dmg0 * m;
      hit.add(cur);
      if (!cur.dead) {
        if (f.bcard) cur.al2bc = G.t + 4; // Business Card
        if (f.followup) { // Follow-Up: a second chain hit within 3 s stuns for 0.5 s
          if (cur.al2ucT && G.t - cur.al2ucT < 3 && !(cur.al2fuT > G.t)) { stun(cur, 0.5); cur.al2fuT = G.t + 1; say('fu', cur.x, cur.y - cur.r - 10, T('al_uc_followup_float'), YEL, 11, 0.4); }
          cur.al2ucT = G.t;
        }
        if (f.dnc && !cur.boss && !cur.rival) { // Do Not Call: it stands where it is and holds fire for a moment
          if (typeof NFS === 'function') NFS();
          cur.nfLure = { x: cur.x, y: cur.y }; cur.nfLureT = Math.max(cur.nfLureT || 0, G.t + 1.5); cur.nfNoFireT = Math.max(cur.nfNoFireT || 0, G.t + 1.5);
          say('dnc', cur.x, cur.y - cur.r - 10, T('al_uc_donotcall_float'), YEL, 11, 0.5);
        }
      }
      px = cur.x; py = cur.y;
      cur = ucNext(w, cur, hit, jumpR);
    }
    if (f.p === 'C') {
      addFol(hit.size);
      if (f.brand && ST().fol > 0) { const h = Math.min(intended * ST().fol * 0.01, G.P.maxHp * 0.03); if (h > 0) { healPlayer(h, true); say('brand', p.x, p.y - 30, T('al_uc_branddeal_float'), '#8ac926', 11, 0.6); } }
    }
    return hit;
  }
  function ucFire(w, target, src) {
    const f = F(w); if (!f.p) return false;
    const s = w.s, p = G.player; f.shots = (f.shots || 0) + 1;
    let ts = s.count > 1 ? acquireMany(aimDir(w), s.range, p.x, p.y, s.count) : [target];
    if (f.robo && f.shots % 3 === 0) { // Robo-Call: every 3rd shot goes to a random enemy anywhere on screen
      const pool = G.enemies.filter(e => !e.dead && !e.egg && !e.charmed && f10OnView(e));
      if (pool.length) { ts = [pool[Math.floor(Math.random() * pool.length)]]; say('robo', p.x, p.y - 30, T('al_uc_robocall_float'), YEL, 12, 0.6); }
    }
    for (const t of ts) if (t && !t.dead) afterChain(w, [...ucChain(w, p.x, p.y, t, Object.assign({}, src))], src);
    sfx('zap');
    return true;
  }
  function ucInstall(w) { const f = F(w); if (f.inst) return; f.inst = 1; wupOn(w, 'stats', ucStats); wupOn(w, 'fire', ucFire); }
  // Business Card: a chained enemy takes 15% more from your other weapons.
  hookOn('dmgMul', 'alpha2:bcard', (e, src) => {
    if (!(e && e.al2bc > G.t) || !src || !src.w) return 1;
    const uc = slotOf(AL2.UC);
    return uc && uc.al2 && uc.al2.bcard && src.w !== uc ? 1.15 : 1;
  });
  // Influencer: a hit loses 5 followers (Blue Tick keeps them); Cancelled sets off a Static blast at 25.
  hookOn('hurt', 'alpha2:followers', () => {
    const uc = slotOf(AL2.UC); if (!uc || !uc.al2 || uc.al2.p !== 'C') return;
    const f = uc.al2, s = ST(), p = G.player;
    if (f.cancelled && s.fol >= AL2.cap && !(f.cancelT > G.t)) {
      f.cancelT = G.t + 0.5;
      aoe(p.x, p.y, 120, uc.s.dmg * 3, cardSrc(uc, { wname: 'Cancelled', atk: 'burst' }), YEL);
      ring(p.x, p.y, 120, YEL, 0.45, 5); say('cancel', p.x, p.y - 34, T('al_uc_cancelled_float'), YEL, 14, 0.8);
    }
    if (!f.bluetick) s.fol = Math.max(0, s.fol - 5);
  });

  // ================================================================ Obligatory Podcast (Force waves)
  function opStats(w, s) {
    const f = F(w);
    if (f.p === 'B') s.range *= 1.3;
    if (f.neverends && s.mag) s.mag = 9999;
  }
  const opBase = w => w.s.dmg * (w.s.count || 7) * POD.k / POD.pulses; // one wave of the plain weapon
  AL2.opBase = opBase;
  function opWave(w, x, y, a, src, o) {
    const s = w.s, sp = POD.speed * (s.speed || 520) / 520, life = (s.range || 340) * (o.reach || 1) / sp;
    return spawnProj(w, x, y, a, src, Object.assign({ pod: { a, half: o.half }, pierce: 999, r: POD.r0, speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life, max: life, dmg: o.dmg, style: 'pod', al2: 1 }, o.over || null));
  }
  function opFire(w, target, src) {
    const f = F(w); if (!f.p) return false;
    const p = G.player, s = w.s; f.shots = (f.shots || 0) + 1; f.waveN = f.waveN || 0;
    const a = target ? Math.atan2(target.y - p.y, target.x - p.x) : (p.face || 0);
    let n = (f.p === 'B' ? 5 : POD.pulses) + (f.hold || 0);
    if (f.hold) { say('hold', p.x, p.y - 30, T('al_op_calleronhold_float'), PALE, 12, 0.6); f.hold = 0; }
    const half = f.p === 'A' ? POD.half * 0.5 : POD.half;
    let k = opBase(w); if (f.p === 'A') k *= 2.5; if (f.p === 'B') k *= 0.65;
    if (f.deadair && f.lastT != null && G.t - f.lastT >= 2) { k *= 2; say('dead', p.x, p.y - 34, T('al_op_deadair_float'), PALE, 13, 0.8); }
    f.lastT = G.t;
    const ret = f.p === 'C' && (f.live || f.shots % 3 === 0), shot = f.shots;
    for (let i = 0; i < n; i++) {
      const go = () => {
        if (!G || !G.player || G.state === 'over') return;
        const q = G.player, idx = ++f.waveN;
        const sr = Object.assign({}, src, { al2pod: i, al2shot: shot, al2a: a, al2pull: f.adread && idx % 5 === 0 ? 1 : 0 });
        opWave(w, q.x, q.y, a, sr, { half, dmg: k, over: { al2ret: ret ? 1 : 0 } });
      };
      if (!i) go(); else after(POD.gap * i, go);
    }
    return true;
  }
  // Ratio: a second wave of one shot on the same enemy hits 30% harder.
  function opDmg(w, e, src) {
    if (!src || src.al2pod == null) return 1;
    const f = F(w);
    if (f.ratio) { if (e.al2rShot === src.al2shot) return 1.3; e.al2rShot = src.al2shot; }
    return 1;
  }
  function opHit(w, e, res, src) {
    if (src.al2pod == null) return;
    const f = F(w), p = G.player;
    if (f.p === 'A') {
      const st = f.discourse ? stagger(e) : poise(e, 0.5);
      if (st) {
        e.al2stagT = G.t;
        if (f.cancelled && !e.boss) { e.fearT = Math.max(e.fearT || 0, G.t + 2); say('cx', e.x, e.y - e.r - 12, T('al_op_cancelled_float'), PALE, 12, 0.4); }
        if (f.clip && !src.al2echo && !(e.al2echoT > G.t) && G.proj.length < 300) {
          e.al2echoT = G.t + 1;
          opWave(w, e.x, e.y, src.al2a, Object.assign({}, src, { al2echo: 1 }), { half: POD.half * 0.5, dmg: opBase(w) * 0.4, reach: 0.5 });
          say('clip', e.x, e.y - e.r - 12, T('al_op_clipfarmer_float'), PALE, 11, 0.5);
        }
      }
    }
    if (src.al2pull) { f10Shove(e, p.x, p.y, -420); }
    if (f.patreon) {
      e.al2hitN = (e.al2hitT && G.t - e.al2hitT < 5 ? e.al2hitN : 0) + 1; e.al2hitT = G.t;
      if (e.al2hitN >= 3) { e.al2hitN = 0; e.chargeT = Math.max(e.chargeT || 0, G.t + 3); ring(e.x, e.y, e.r + 8, YEL, 0.35, 3); say('pat', e.x, e.y - e.r - 12, T('al_op_patreontier_float'), YEL, 11, 0.5); }
    }
  }
  function opArrive(pr) { // a returning wave reaches you
    const f = pr.w && pr.w.al2; if (!f) return;
    const p = G.player;
    if (f.listener) { healPlayer(G.P.maxHp * 0.01, true); say('ltl', p.x, p.y - 30, T('al_op_longtimelistener_float'), '#8ac926', 11, 0.6); }
    if (f.callhold) f.hold = Math.min(3, (f.hold || 0) + 1);
  }
  hookOn('fire', 'alpha2:pod', (w, target, src) => !!(w && w.def && w.def.pod && w.al2 && w.al2.p) && opFire(w, target, src), 900);
  hookOn('tick', 'alpha2:pod', dt => {
    if (!G || G.state !== 'play') return;
    const p = G.player;
    for (const pr of G.proj) {
      if (pr.dead || !pr.al2 || !pr.pod) continue;
      const f = pr.w && pr.w.al2; if (!f) continue;
      if (pr.al2fixR) pr.r = pr.al2fixR; // (podcast.js grows the funnel each frame; a returning or lingering wave keeps the width it had)
      if (pr.al2back) {
        const dx = p.x - pr.x, dy = p.y - pr.y, d = Math.hypot(dx, dy) || 1;
        pr.vx = dx / d * pr.speed; pr.vy = dy / d * pr.speed;
        if (d < 24) { pr.dead = true; opArrive(pr); }
        continue;
      }
      if (pr.life > Math.max(0.05, dt * 2)) continue;
      if (pr.al2ret) { // turn round and come back to you
        const dx = p.x - pr.x, dy = p.y - pr.y, d = Math.hypot(dx, dy) || 1;
        pr.al2back = 1; pr.al2fixR = pr.r; pr.hits = null; pr.life = pr.max = d / pr.speed + 0.4;
        pr.vx = dx / d * pr.speed; pr.vy = dy / d * pr.speed; pr.pod = Object.assign({}, pr.pod, { a: Math.atan2(dy, dx) });
        ring(pr.x, pr.y, 18, PALE, 0.3, 3);
      } else if (f.filler && !pr.al2lg) { // Filler: it stays where it ended for a second
        pr.al2lg = 1; pr.al2fixR = pr.r; pr.vx = pr.vy = 0; pr.life += 1; pr.max += 1;
      }
    }
  }, 1100);
  function opInstall(w) {
    const f = F(w); if (f.inst) return; f.inst = 1; f.lastT = G.t;
    wupOn(w, 'stats', opStats); wupOn(w, 'dmg', opDmg); wupOn(w, 'hit', opHit);
  }
  // Main Character Energy: staggered enemies take 20% more from everything.
  hookOn('dmgMul', 'alpha2:mce', (e, src) => (G && G.muts && G.muts.pass_al_mce && e && e.dazeT > G.t ? 1.2 : 1));

  // ================================================================ the branch sets
  const C = (name, desc, apply) => ({ name, desc, apply });
  const set = k => w => { F(w)[k] = 1; };
  const UP = k => w => { F(w).p = k; ucInstall(w); recomputeAll(); };
  const OPP = k => w => { F(w).p = k; opInstall(w); recomputeAll(); };
  const nm = (pre, key, name, fn, best) => best ? { name, best, desc: T(pre + '_' + key + '_desc'), apply: fn } : C(name, T(pre + '_' + key + '_desc'), fn);

  wupRegFor('alpha', AL2.UC, {
    A: { name: 'Networking Event', tag: T('al_uc_network_tag'), costs: T('al_uc_network_costs'),
      lv3: { desc: T('al_uc_network_desc'), apply: UP('A') },
      lv6: [nm('al_uc', 'businesscard', 'Business Card', set('bcard')), nm('al_uc', 'elevatorpitch', 'Elevator Pitch', set('pitch'))],
      wild: nm('al_uc', 'lanyard', 'Lanyard', set('lanyard')) },
    B: { name: 'Cold Caller', tag: T('al_uc_cold_tag'), costs: T('al_uc_cold_costs'),
      lv3: { desc: T('al_uc_cold_desc'), apply: UP('B') },
      lv6: [nm('al_uc', 'followup', 'Follow-Up', set('followup')), nm('al_uc', 'robocall', 'Robo-Call', set('robo'))],
      wild: nm('al_uc', 'donotcall', 'Do Not Call', set('dnc')) },
    C: { name: 'Influencer', tag: T('al_uc_influencer_tag'), costs: T('al_uc_influencer_costs'),
      lv3: { desc: T('al_uc_influencer_desc'), apply: UP('C') },
      lv6: [nm('al_uc', 'goingviral', 'Going Viral', set('viral')), nm('al_uc', 'branddeal', 'Brand Deal', set('brand'))],
      wild: nm('al_uc', 'cancelled', 'Cancelled', set('cancelled')) },
    lv10: [nm('al_uc', 'rolodex', 'Rolodex', set('rolodex'), 'A'), nm('al_uc', 'hardsell', 'Hard Sell', set('hard'), 'B'), nm('al_uc', 'bluetick', 'Blue Tick', set('bluetick'), 'C')] });

  const never = w => { F(w).neverends = 1; computeStats(w); w.ammo = w.s.mag; w.reloadT = 0; };
  wupRegFor('alpha', AL2.OP, {
    A: { name: 'Hot Take', tag: T('al_op_hottake_tag'), costs: T('al_op_hottake_costs'),
      lv3: { desc: T('al_op_hottake_desc'), apply: OPP('A') },
      lv6: [nm('al_op', 'cancelled', 'Cancelled', set('cancelled')), nm('al_op', 'ratio', 'Ratio', set('ratio'))],
      wild: nm('al_op', 'clipfarmer', 'Clip Farmer', set('clip')) },
    B: { name: 'Three-Hour Episode', tag: T('al_op_threehour_tag'), costs: T('al_op_threehour_costs'),
      lv3: { desc: T('al_op_threehour_desc'), apply: OPP('B') },
      lv6: [nm('al_op', 'adread', 'Ad Read', set('adread')), nm('al_op', 'patreontier', 'Patreon Tier', set('patreon'))],
      wild: nm('al_op', 'filler', 'Filler', set('filler')) },
    C: { name: 'Call-In Show', tag: T('al_op_callin_tag'), costs: T('al_op_callin_costs'),
      lv3: { desc: T('al_op_callin_desc'), apply: OPP('C') },
      lv6: [nm('al_op', 'longtimelistener', 'Long-Time Listener', set('listener')), nm('al_op', 'deadair', 'Dead Air', set('deadair'))],
      wild: nm('al_op', 'calleronhold', 'Caller on Hold', set('callhold')) },
    lv10: [nm('al_op', 'discourse', 'Discourse', set('discourse'), 'A'), nm('al_op', 'neverends', 'Never Ends', never, 'B'), nm('al_op', 'livestudioaudience', 'Live Studio Audience', set('live'), 'C')] });

  // ================================================================ gated Feats
  const afk = (id, title, desc) => ({ id, title: T(title), desc: T(desc) });
  const gated = id => { const c = typeof CARDS !== 'undefined' && CARDS.find(x => x.id === 'feat_' + id); if (c) c.eligible = g => !f10Own(id); }; // (the branch gate is a Do rule in cardrules.js, added at merge)

  // Morning Routine: for 6 s every weapon fires 25% faster and you cannot be slowed.
  feat({ id: 'al_morning', name: 'Morning Routine', icon: 'MR', ico: 'clock', type: 'force', atk: 'burst', rar: 1, stam: 16, gate: () => branchOf(AL2.RF) === 'B',
    line: T('feat_al_morning_line'), does: T('feat_al_morning_does'),
    base: { dmg: 12, cd: 14, area: 120, dur: 6 },
    stat: (w, s) => { if (f10Fk(w, 'journal')) s.dur *= 1.5; if (f10Fk(w, 'alarm')) s.cd *= 0.65; },
    when: w => { const p = me(); return f10Near(p.x, p.y, 400).length ? {} : null; },
    fire: w => {
      const p = me(), s = w.s;
      ST().morn = { end: G.t + s.dur, k: f10Fk(w, 'cold') ? 1.4 : 1.25, smoothie: f10Fk(w, 'smoothie') };
      f10Burst(w, p.x, p.y, s.area, s.dmg, null); ring(p.x, p.y, s.area, w.def.color, 0.4, 3);
      floatText(p.x, p.y - 34, T('feat_al_morning_float'), w.def.color, 15, 0.8);
    },
    forks: { 3: [afk('journal', 'feat_al_morning_journal_name', 'feat_al_morning_journal_desc'), afk('cold', 'feat_al_morning_cold_name', 'feat_al_morning_cold_desc')],
      5: [afk('smoothie', 'feat_al_morning_smoothie_name', 'feat_al_morning_smoothie_desc'), afk('alarm', 'feat_al_morning_alarm_name', 'feat_al_morning_alarm_desc')] } });
  gated('al_morning');
  { const rate0 = rateBonus; rateBonus = function () { const m = G && G.al2 && G.al2.morn; return rate0() * (m && m.end > G.t ? m.k : 1); }; }
  { const spd0 = mutSpeed; mutSpeed = function () { const m = G && G.al2 && G.al2.morn, k = spd0(); return m && m.end > G.t ? Math.max(1, k) : k; }; }

  // Going Live: for 5 s a ring of Static round you Charges what it touches; each Charge adds a follower.
  feat({ id: 'al_golive', name: 'Going Live', icon: 'GL', ico: 'storm', type: 'static', atk: 'burst', rar: 1, stam: 18, gate: () => branchOf(AL2.UC) === 'C',
    line: T('feat_al_golive_line'), does: T('feat_al_golive_does'),
    base: { dmg: 10, cd: 16, area: 110, dur: 5 },
    stat: (w, s) => { if (f10Fk(w, 'collab')) s.area *= 1.45; if (f10Fk(w, 'stream')) s.dur *= 1.6; if (f10Fk(w, 'hype')) s.cd *= 0.65; },
    when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area + 150).length ? {} : null; },
    fire: w => {
      const p = me(), s = w.s, L = ST().live = { w, end: G.t + s.dur, seen: new Set() };
      f10().fx.push({ x: p.x, y: p.y, end: L.end, t0: G.t, dr: k => { const q = me(); ctx.strokeStyle = col(w.def.color); ctx.globalAlpha = 0.35 + 0.4 * k; ctx.lineWidth = 3; ctx.setLineDash([6 * S, 5 * S]); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), w.s.area * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); } });
      floatText(p.x, p.y - 34, T('feat_al_golive_float'), w.def.color, 15, 0.8);
    },
    forks: { 3: [afk('sponsor', 'feat_al_golive_sponsor_name', 'feat_al_golive_sponsor_desc'), afk('collab', 'feat_al_golive_collab_name', 'feat_al_golive_collab_desc')],
      5: [afk('stream', 'feat_al_golive_stream_name', 'feat_al_golive_stream_desc'), afk('hype', 'feat_al_golive_hype_name', 'feat_al_golive_hype_desc')] } });
  gated('al_golive');
  hookOn('tick', 'alpha2:feats', dt => {
    if (!G || G.state !== 'play' || !G.al2) return;
    const st = G.al2, p = G.player;
    const m = st.morn;
    if (m) {
      if (m.end > G.t) { // cannot be slowed
        if (typeof pstClear === 'function') pstClear();
        G.tangleT = 0; G.sticky = false; try { const D = pdef(); if (D) D.snareT = 0; } catch (err) { }
      } else { st.morn = null; if (m.smoothie) stamAdd(8); }
    }
    const L = st.live;
    if (L) {
      if (G.t >= L.end) st.live = null;
      else for (const e of f10Near(p.x, p.y, L.w.s.area)) {
        e.chargeT = Math.max(e.chargeT || 0, G.t + 1);
        if (!L.seen.has(e)) { L.seen.add(e); f10Hit(L.w, e, L.w.s.dmg, 'burst'); addFol(f10Fk(L.w, 'sponsor') ? 2 : 1); }
      }
    }
  });

  // ================================================================ gated passives
  if (typeof mutCard === 'function') {
    mutCard({ id: 'pass_al_diamond', title: 'Diamond Hands', icon: 'DH', rarity: 2, maxRank: 1, family: 'mut:body', flavour: T('pass_al_diamond_flavour'), desc: T('pass_al_diamond_desc'), why: () => '' });
    mutCard({ id: 'pass_al_mce', title: 'Main Character Energy', icon: 'MC', rarity: 2, maxRank: 1, family: 'mut:body', flavour: T('pass_al_mce_flavour'), desc: T('pass_al_mce_desc'), why: () => '' });
  }
  // Diamond Hands: a Crypto Bro pump burst (alpha1.js) also refunds 5 stamina.
  AL1.onPumpBurst.push((w, e) => {
    if (!G || !G.muts || !G.muts.pass_al_diamond) return;
    stamAdd(5); const p = G.player; say('diamond', p.x, p.y - 30, T('pass_al_diamond_float'), '#9be7ff', 12, 0.6);
  });
})();
