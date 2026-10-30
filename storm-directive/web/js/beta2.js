'use strict';
// Spawn Prawn - Beta reimagined, part 2: Sister Cousin's near-death branches and four gated cards (BETA_REDESIGN.md, 30 Oct 2026).
// Beta-only: wupRegFor('beta', ...) (samplebranches.js), so every other sample keeps wup5.js' shared Sister Cousin set.
//  - Sister Cousin (s_seeker, prefix be_sc). The seekers are wup5.js' homing gun with the 'multiplying' modifier (a kill splits it in
//    two, children never split). The branch code lives on the slot (w.be2) and reaches the seekers through wupOn hooks (dmg, phit,
//    hit, kill, tick), hurt:before / hurt, and a wrap of modHit (Blood Brothers). A tick hook keeps a list of the slot's live seekers
//    (f.live) and sees one end (it expires, or is spent on a hit, or is killed by Next of Kin): that is a "donation" for Organ Donor.
//      A Next of Kin   when you would be hit, the nearest seeker within 150 takes it instead and dies (4 s cooldown, hurt:before at
//                      order 50: after Cotton Wool). Lv 6: Emergency Contact (every seeker turns on whatever hurt you, hit or not),
//                      Power of Attorney (low: seekers +50%). Wild: Family Feud (two touching seekers sometimes bump and scatter).
//                      Mastery: Bloodline (the seeker that took the hit leaves two).
//      B Organ Donor   a seeker that ends heals 1.5%. Lv 6: Spare Parts (it leaves a Blood pool: radius 40, 3 s, Bleed), Compatible
//                      Match (double while low). Wild: Black Market (20%: 4 stamina instead). Mastery: Living Donor (a seeker kill
//                      heals 0.5%, at most 3% a second).
//      C Transfusion   seekers deal more as you lose health: +100% at 10% (linear from 0% at full). Lv 6: Blood Type O (a hit makes
//                      the target Bleed), Shared Circulation (low: a seeker hit heals as Not Dead Yet's own lifesteal does, on top
//                      of it). Wild: Rhesus Negative (15% of seekers carry Mucus: Snotty). Mastery: Blood Brothers (a seeker that
//                      kills splits into three).
//  - Gated cards (the branch gate is a Do rule in cardrules.js, added at merge; eligible here is just "not held"): Feats Defibrillator
//    (be_defib, Little Prick B) and Blood Bag (be_bloodbag, Sister Cousin B); passives Morphine Drip (pass_be_morphine, Little Prick A:
//    20% less damage while low) and Famous Last Words (pass_be_lastwords, One of These Days A: once a wave, below 10% health, a Blood burst
//    of 20 x your level within 200 that Bleeds).
//  - "Low" is G.player.hp < G.P.maxHp * 0.4 (the Not Dead Yet line). Copy: every card, fork and float is TODO_COPY:<id>, looked up in
//    BETA_COPY (betacopy.js, written by the copy agent) first.
// Simplified: "dies" for Organ Donor is any seeker that ends, and all donations share one cap of 5% of max health a second (a seeker
// fires twice a second and splits, so the plain rule would out-heal Not Dead Yet); Spare Parts' pool is a list of timed circles on the
// slot (it applies Bleed to what stands in it each half second) rather than a G.zones entry; Shared Circulation repeats Not Dead Yet's
// lifesteal formula for seeker hits (so seeker hits heal twice as much while low); Blood Bag is typed Blood but deals no damage (it
// is exempt from featstest's "typed Feats deal damage" rule, as Sofa Crevice is); Family Feud needs the seekers to have been out 0.15 s.
// Hooks: wupRegFor (samplebranches.js), wupOn; hookOn('hurt:before' / 'hurt' / 'hurtMul' / 'tick'); wraps modHit (modifiers.js, after
// wup5.js' wrap) and mutSpeed (mutations.js). Loads after samplebranches.js, wup5.js and alpha2.js. Save data: none.

const BE2 = { SC: 's_seeker', LP: 'v_arcane_proj', DD: 's_duedate', lowAt: 0.4, donCap: 0.05, ldCap: 0.03, fx: {} };
const be2T = id => (typeof BETA_COPY !== 'undefined' && BETA_COPY[id]) || 'TODO_COPY:' + id;

(function () {
  const T = be2T;
  const BLOOD = '#c9184a', PALE = '#ffd6e0', MUC = '#bfe9ff', STAT = '#ffe94a';
  const F = w => w.be2 || (w.be2 = { fx: {} });
  const ST = () => G.be2 || (G.be2 = { don: 0, donT0: 0, ld: 0, ldT0: 0, lw: null, bag: null });
  const slotOf = id => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === id) : null);
  const branchOf = id => { const w = slotOf(id); return w && w.up ? w.up.p || '' : ''; };
  const low = () => !!(G && G.player && G.P && G.player.hp < G.P.maxHp * BE2.lowAt);
  const mark = (w, k) => { const m = F(w).fx; m[k] = (m[k] || 0) + 1; }; // (a counter per card, so the test can see it work)
  const sayT = {};
  function say(key, x, y, txt, color, size, gap) { if ((sayT[key] || 0) > G.realT) return; sayT[key] = G.realT + (gap || 0.6); floatText(x, y, txt, color || PALE, size || 12, 0.8); }
  const stamAdd = n => { if (G && G.stam && typeof stamMax === 'function') G.stam.cur = Math.min(stamMax(), G.stam.cur + n); };
  const live = w => { const o = []; for (const q of G.proj) if (q.w === w && !q.dead && !q.lob) o.push(q); return o; };
  const cap = w => (typeof modV === 'function' ? modV(w, 'multiplying', 'flight') : 12);

  // ================================================================ Sister Cousin
  function install(w) {
    const f = F(w); if (f.inst) return; f.inst = 1; f.live = []; f.pools = [];
    wupOn(w, 'dmg', scDmg); wupOn(w, 'phit', scPhit); wupOn(w, 'hit', scHit); wupOn(w, 'kill', scKill); wupOn(w, 'tick', scTick);
  }
  const P = k => w => { install(w); F(w).p = k; };
  const set = k => w => { install(w); F(w)[k] = 1; };

  // New seekers from (x, y), up to n, at the nearest other enemies (the multiplying modifier's own way of splitting).
  function kids(w, x, y, n, pr, avoid, dmg) {
    const room = Math.min(n, cap(w) + 2 - live(w).length); if (room <= 0) return 0;
    const ts = acquireMany('nearest', 300, x, y, 5).filter(t => t !== avoid);
    let made = 0;
    for (let i = 0; i < room; i++) {
      const t = ts.length ? ts[i % ts.length] : null, a = t ? Math.atan2(t.y - y, t.x - x) : Math.random() * Math.PI * 2;
      const before = G.proj.length;
      spawnProj(w, x, y, a, pr.src, { dmg: dmg != null ? dmg : pr.dmg, mSplit: 1, pierce: 0, hits: avoid ? [avoid.id] : null });
      if (G.proj.length > before) made++;
    }
    return made;
  }
  // Emergency Contact: every seeker turns on whatever hurt you.
  function turn(w, t) {
    if (!t || t.dead || !t.maxHp) return;
    const L = live(w); if (!L.length) return;
    for (const q of L) { q.tgt = t; q.life = Math.max(q.life, 1.2); }
    mark(w, 'emergency'); const p = G.player; ring(t.x, t.y, t.r + 8, BLOOD, 0.35, 4);
    say('emerg', p.x, p.y - 34, T('be_sc_emergency_float'), BLOOD, 12, 0.8);
  }
  // Next of Kin: the hit lands on the nearest seeker within 150 instead (returns null from hurt:before).
  hookOn('hurt:before', 'beta2:kin', (dmg, from, ent, kind) => {
    if (!G || G.state !== 'play' || !G.weapons || !(dmg > 0)) return dmg;
    const w = slotOf(BE2.SC); if (!w || !w.be2 || w.be2.p !== 'A') return dmg;
    const p = me(); if (p.iframes > 0 || G.shieldT > 0 || (G.debug && G.debug.god)) return dmg;
    const f = w.be2; if (G.t < (f.kinT || 0)) return dmg;
    let best = null, bd = 150 * 150;
    for (const q of G.proj) { if (q.w !== w || q.dead || q.lob) continue; const d2 = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (d2 < bd) { bd = d2; best = q; } }
    if (!best) return dmg;
    f.kinT = G.t + 4; best.dead = true; p.iframes = Math.max(p.iframes, 0.3);
    ring(best.x, best.y, 18, BLOOD, 0.35, 4); fxParts('spark', best.x, best.y, BLOOD, 8, 140, 0.4, 3);
    say('kin', p.x, p.y - 30, T('be_sc_kin_float'), BLOOD, 13, 0.6); mark(w, 'kin');
    const hf = G.hitFrom || ent;
    if (f.emergency) turn(w, hf);
    if (f.bloodline && kids(w, best.x, best.y, 2, best, null, best.dmg * 0.7)) { mark(w, 'bloodline'); say('bloodl', best.x, best.y - 14, T('be_sc_bloodline_float'), BLOOD, 12, 0.6); }
    return null;
  }, 50);
  // Emergency Contact on a hit that did land.
  hookOn('hurt', 'beta2:turn', (d, ent, hf) => {
    const w = slotOf(BE2.SC); if (!w || !w.be2 || !w.be2.emergency) return;
    turn(w, hf || ent);
  });

  function scDmg(w, e, src) {
    if (src && src.wupEcho) return 1;
    const f = F(w); let k = 1;
    if (f.p === 'C') k *= 1 + Math.max(0, Math.min(1, (1 - G.player.hp / G.P.maxHp) / 0.9)); // Transfusion: +100% at 10%, nothing at full
    if (f.poa && low()) k *= 1.5; // Power of Attorney
    return k;
  }
  function scPhit(w, pr, e) {
    const f = F(w); if (!e || e.dead) return;
    if (f.typeo) { fightStatus(e, 'arcane', pr.dmg, pr.src); mark(w, 'typeo'); } // Blood Type O
    if (f.rhesus && pr.be2muc) { fightStatus(e, 'ice', pr.dmg, pr.src); mark(w, 'rhesus'); say('rhs' + e.id, e.x, e.y - e.r - 10, T('be_sc_rhesus_float'), MUC, 11, 0.8); }
  }
  function scHit(w, e, res, src) {
    const f = F(w);
    if (f.circ && low() && res && res.toHp > 0) { // Shared Circulation: Not Dead Yet's lifesteal formula, again
      healPlayer(res.toHp * 0.08 * (1 - G.player.hp / G.P.maxHp), true); mark(w, 'circ');
      say('circ', G.player.x, G.player.y - 30, T('be_sc_circulation_float'), BLOOD, 11, 1.2);
    }
  }
  function scKill(w, e, src) {
    const f = F(w); if (!f.living) return; // Living Donor: 0.5% a kill, 3% a second at most
    const S = ST(), mx = G.P.maxHp;
    if (G.t - S.ldT0 >= 1) { S.ldT0 = G.t; S.ld = 0; }
    const h = Math.min(mx * 0.005, Math.max(0, mx * BE2.ldCap - S.ld)); if (h <= 0) return;
    S.ld += h; healPlayer(h, true); mark(w, 'living');
    say('living', G.player.x, G.player.y - 30, T('be_sc_livingdonor_float'), BLOOD, 11, 1.2);
  }
  // A seeker has ended: Organ Donor pays 1.5% (double while low with Compatible Match); Black Market sometimes pays 4 stamina instead.
  function donate(w, q) {
    const f = F(w), p = G.player;
    if (f.parts && f.pools.length < 8) { f.pools.push({ x: q.x, y: q.y, end: G.t + 3, nextT: 0, src: Object.assign(weaponSrc(w), { atk: 'pool', wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: 'Spare Parts' }) }); mark(w, 'pool'); }
    if (f.black && Math.random() < 0.2) { stamAdd(4); mark(w, 'black'); say('black', p.x, p.y - 30, T('be_sc_blackmarket_float'), STAT, 12, 0.8); return; }
    const S = ST(), mx = G.P.maxHp;
    if (G.t - S.donT0 >= 1) { S.donT0 = G.t; S.don = 0; }
    const h = Math.min(mx * 0.015 * (f.match && low() ? 2 : 1), Math.max(0, mx * BE2.donCap - S.don)); if (h <= 0) return;
    S.don += h; healPlayer(h, true); mark(w, 'donate');
    if (f.match && low()) { mark(w, 'match'); say('match', p.x, p.y - 34, T('be_sc_compatiblematch_float'), BLOOD, 12, 1); }
    else say('donor', p.x, p.y - 30, T('be_sc_donor_float'), BLOOD, 11, 1.2);
  }
  function scTick(w, dt) {
    const f = F(w), p = G.player;
    // adopt new seekers
    for (const q of G.proj) {
      if (q.w !== w || q.dead || q.lob || q.be2) continue;
      q.be2 = 1; f.live.push(q);
      if (f.rhesus && Math.random() < 0.15) { q.be2muc = 1; q.color = MUC; }
    }
    // reap the ones that ended
    if (f.live.length) {
      const inPlay = new Set(G.proj), keep = [];
      for (const q of f.live) { if (q.dead) { if (f.p === 'B') donate(w, q); } else if (inPlay.has(q)) keep.push(q); }
      f.live = keep.length > 60 ? keep.slice(-60) : keep;
    }
    if (f.feud && f.live.length > 1) { // Family Feud: two seekers that touch sometimes bump and scatter
      const L = f.live;
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
        const a = L[i], b = L[j];
        if ((a.be2feud || 0) > G.t || (b.be2feud || 0) > G.t || a.max - a.life < 0.15 || b.max - b.life < 0.15 || a.orbitT > 0 || b.orbitT > 0) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) > 10) continue;
        a.be2feud = b.be2feud = G.t + 0.6;
        if (Math.random() >= 0.1) continue;
        const ang = Math.atan2(a.y - b.y, a.x - b.x), sp = a.speed || 400;
        a.vx = Math.cos(ang + 0.6) * sp; a.vy = Math.sin(ang + 0.6) * sp; b.vx = Math.cos(ang + Math.PI - 0.6) * (b.speed || sp); b.vy = Math.sin(ang + Math.PI - 0.6) * (b.speed || sp);
        a.tgt = b.tgt = null; mark(w, 'feud'); ring(a.x, a.y, 12, BLOOD, 0.25, 3); say('feud', a.x, a.y - 12, T('be_sc_familyfeud_float'), PALE, 10, 0.6);
      }
    }
    if (f.pools.length) { // Spare Parts: Bleed on what stands in the pool
      for (const o of f.pools) {
        if (G.t < o.nextT) continue;
        o.nextT = G.t + 0.5; ring(o.x, o.y, 40, BLOOD, 0.3, 3);
        forNear(o.x, o.y, 40, e => { if (!e.dead && !e.charmed && !e.egg) { fightStatus(e, 'arcane', w.s.dmg * 2, o.src); mark(w, 'bleed'); } return false; });
      }
      f.pools = f.pools.filter(o => o.end > G.t);
    }
  }
  // Blood Brothers: a seeker that kills splits into three, not two (one more child than the modifier makes).
  {
    const mh0 = modHit;
    modHit = function (pr, e) {
      const w = pr.w, f = w && w.be2;
      if (!f || !f.bro) return mh0(pr, e);
      const was = pr.mSplitDone, n0 = G.proj.length;
      mh0(pr, e);
      if (!was && pr.mSplitDone && e.dead && !pr.mSplit && !pr.be2bro && G.proj.length > n0) {
        pr.be2bro = 1;
        const c = G.proj[n0], extra = kids(w, e.x, e.y, 1, pr, e, c ? c.dmg : pr.dmg * 0.5);
        if (extra) { mark(w, 'brothers'); say('bro', e.x, e.y - e.r - 10, T('be_sc_bloodbrothers_float'), BLOOD, 12, 0.5); }
      }
    };
  }

  // ================================================================ the branch set
  const C = (name, desc, apply) => ({ name, desc, apply });
  const nm = (pre, key, name, fn, best) => best ? { name, best, desc: T(pre + '_' + key + '_desc'), apply: fn } : C(name, T(pre + '_' + key + '_desc'), fn);
  wupRegFor('beta', BE2.SC, {
    A: { name: 'Next of Kin', tag: T('be_sc_kin_tag'), costs: T('be_sc_kin_costs'),
      lv3: { desc: T('be_sc_kin_desc'), apply: P('A') },
      lv6: [nm('be_sc', 'emergencycontact', 'Emergency Contact', set('emergency')), nm('be_sc', 'powerofattorney', 'Power of Attorney', set('poa'))],
      wild: nm('be_sc', 'familyfeud', 'Family Feud', set('feud')) },
    B: { name: 'Organ Donor', tag: T('be_sc_donor_tag'), costs: T('be_sc_donor_costs'),
      lv3: { desc: T('be_sc_donor_desc'), apply: P('B') },
      lv6: [nm('be_sc', 'spareparts', 'Spare Parts', set('parts')), nm('be_sc', 'compatiblematch', 'Compatible Match', set('match'))],
      wild: nm('be_sc', 'blackmarket', 'Black Market', set('black')) },
    C: { name: 'Transfusion', tag: T('be_sc_transfusion_tag'), costs: T('be_sc_transfusion_costs'),
      lv3: { desc: T('be_sc_transfusion_desc'), apply: P('C') },
      lv6: [nm('be_sc', 'bloodtypeo', 'Blood Type O', set('typeo')), nm('be_sc', 'sharedcirculation', 'Shared Circulation', set('circ'))],
      wild: nm('be_sc', 'rhesusnegative', 'Rhesus Negative', set('rhesus')) },
    lv10: [nm('be_sc', 'bloodline', 'Bloodline', set('bloodline'), 'A'), nm('be_sc', 'livingdonor', 'Living Donor', set('living'), 'B'), nm('be_sc', 'bloodbrothers', 'Blood Brothers', set('bro'), 'C')] });

  // ================================================================ gated Feats
  const bfk = (id, title, desc) => ({ id, title: T(title), desc: T(desc) });
  const gated = id => { const c = typeof CARDS !== 'undefined' && CARDS.find(x => x.id === 'feat_' + id); if (c) c.eligible = g => !f10Own(id); }; // (the branch gate is a Do rule in cardrules.js, added at merge)

  // Defibrillator: a Static ring (140) stuns what it touches for 1 s and heals you 5% for each enemy it touches, up to 25%.
  function defibRing(w) {
    const p = me(), s = w.s, list = f10Near(p.x, p.y, s.area);
    for (const e of list) { f10Hit(w, e, s.dmg, 'burst'); stun(e, 1); e.chargeT = Math.max(e.chargeT || 0, G.t + 1); }
    ring(p.x, p.y, s.area, w.def.color, 0.4, 5); fxParts('spark', p.x, p.y, w.def.color, 10, 220, 0.4, 3);
    const h = Math.min(f10Fk(w, 'sinus') ? 0.4 : 0.25, 0.05 * list.length);
    if (h > 0) { healPlayer(G.P.maxHp * h); mark(w, 'defib'); }
    return list.length;
  }
  feat({ id: 'be_defib', name: 'Defibrillator', icon: 'DF', ico: 'storm', type: 'static', atk: 'burst', rar: 1, stam: 20, gate: () => branchOf(BE2.LP) === 'B',
    line: T('feat_be_defib_line'), does: T('feat_be_defib_does'),
    base: { dmg: 10, cd: 18, area: 140 },
    stat: (w, s) => { if (f10Fk(w, 'paddles')) s.area *= 1.4; if (f10Fk(w, 'rhythm')) s.cd *= 0.65; },
    when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area + 40).length ? {} : null; },
    fire: w => {
      const p = me(); defibRing(w);
      floatText(p.x, p.y - 34, T('feat_be_defib_float'), w.def.color, 15, 0.8);
      if (f10Fk(w, 'clear')) after(0.6, () => { if (G && G.state === 'play') defibRing(w); });
    },
    forks: { 3: [bfk('paddles', 'feat_be_defib_paddles_name', 'feat_be_defib_paddles_desc'), bfk('clear', 'feat_be_defib_clear_name', 'feat_be_defib_clear_desc')],
      5: [bfk('rhythm', 'feat_be_defib_rhythm_name', 'feat_be_defib_rhythm_desc'), bfk('sinus', 'feat_be_defib_sinus_name', 'feat_be_defib_sinus_desc')] } });
  gated('be_defib');

  // Blood Bag: heal 15% over 3 s; performed while low, you also swim 30% faster for those 3 s.
  feat({ id: 'be_bloodbag', name: 'Blood Bag', icon: 'BB', ico: 'heart', type: 'blood', atk: 'burst', rar: 1, stam: 16, gate: () => branchOf(BE2.SC) === 'B',
    line: T('feat_be_bloodbag_line'), does: T('feat_be_bloodbag_does'),
    base: { dmg: 0, cd: 20, dur: 3 },
    stat: (w, s) => { if (f10Fk(w, 'fridge')) s.cd *= 0.7; if (f10Fk(w, 'drip')) s.dur *= 1.5; },
    when: w => (G.player.hp < G.P.maxHp * 0.95 ? {} : null),
    fire: w => {
      const p = me(), s = w.s, tot = 0.15 * (f10Fk(w, 'unit') ? 1.5 : 1) * (f10Fk(w, 'drip') ? 1.25 : 1);
      ST().bag = { end: G.t + s.dur, rate: tot / s.dur, swim: low() || f10Fk(w, 'warm') };
      ring(p.x, p.y, p.r + 16, w.def.color, 0.4, 4); floatText(p.x, p.y - 34, T('feat_be_bloodbag_float'), w.def.color, 15, 0.8);
    },
    forks: { 3: [bfk('unit', 'feat_be_bloodbag_unit_name', 'feat_be_bloodbag_unit_desc'), bfk('warm', 'feat_be_bloodbag_warm_name', 'feat_be_bloodbag_warm_desc')],
      5: [bfk('fridge', 'feat_be_bloodbag_fridge_name', 'feat_be_bloodbag_fridge_desc'), bfk('drip', 'feat_be_bloodbag_drip_name', 'feat_be_bloodbag_drip_desc')] } });
  gated('be_bloodbag');
  { const spd0 = mutSpeed; mutSpeed = function () { const m = G && G.be2 && G.be2.bag, k = spd0(); return m && m.swim && m.end > G.t ? k * 1.3 : k; }; }
  hookOn('tick', 'beta2:feats', dt => {
    if (!G || G.state !== 'play' || !G.be2) return;
    const m = G.be2.bag; if (!m) return;
    if (m.end > G.t) healPlayer(G.P.maxHp * m.rate * dt, true); else G.be2.bag = null;
  });

  // ================================================================ gated passives
  if (typeof mutCard === 'function') {
    mutCard({ id: 'pass_be_morphine', title: 'Morphine Drip', icon: 'MD', rarity: 2, maxRank: 1, family: 'mut:body', flavour: T('pass_be_morphine_flavour'), desc: T('pass_be_morphine_desc'), why: () => '' });
    mutCard({ id: 'pass_be_lastwords', title: 'Famous Last Words', icon: 'LW', rarity: 2, maxRank: 1, family: 'mut:body', flavour: T('pass_be_lastwords_flavour'), desc: T('pass_be_lastwords_desc'), why: () => '' });
  }
  // Morphine Drip: while you are low you take 20% less damage.
  hookOn('hurtMul', 'beta2:morphine', () => (G && G.muts && G.muts.pass_be_morphine && low() ? 0.8 : 1));
  // Famous Last Words: the first time each wave you drop below 10% health, everything within 200 takes 20 x your level in Blood and Bleeds.
  hookOn('hurt', 'beta2:lastwords', () => {
    if (!G || !G.muts || !G.muts.pass_be_lastwords) return;
    const p = G.player; if (!(p.hp > 0) || p.hp >= G.P.maxHp * 0.1) return;
    const S = ST(), key = G.wave && G.wave.n > 0 ? 'w' + G.wave.n : 'm' + Math.floor(G.t / 60);
    if (S.lw === key) return;
    S.lw = key;
    const dmg = 20 * (G.level || 1), src = { elem: 'arcane', wname: 'Famous Last Words', atk: 'burst', noCrit: true, noProc: true, noArc: true, mult: 1 };
    aoe(p.x, p.y, 200, dmg, src, BLOOD);
    forNear(p.x, p.y, 200, e => { if (!e.dead && !e.charmed && !e.egg) fightStatus(e, 'arcane', dmg, src); return false; });
    ring(p.x, p.y, 200, BLOOD, 0.5, 5); say('lastw', p.x, p.y - 36, T('pass_be_lastwords_float'), PALE, 14, 1);
    BE2.fx.lastwords = (BE2.fx.lastwords || 0) + 1;
  });
})();
