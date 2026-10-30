'use strict';
// Spawn Prawn - Private Schooled reimagined, part 2: Ewww, Gross' branches and four gated cards (PRIVATE_REDESIGN.md, 30 Oct 2026).
// Private-Schooled-only: wupRegFor('private', ...) (samplebranches.js), so every other sample keeps wup5.js' shared Ewww, Gross set.
//  - Ewww, Gross (s_redtape, prefix pv_eg) is toys.js' Red Tape: a hit tapes a bundle of enemies (B in G.toy.tapes: B.w, B.members, B.end)
//    and toyHurt shares w.s.share of the damage along it. The branch code lives on the slot (w.pv2) and reaches the weapon through
//    wupOn hooks (stats, tick), hurt:before, kill, dmgMul, and a wrap of eBullet (a taped enemy that "cannot attack" also stops
//    shooting). A tick hook keeps the slot's live bundles (f.bl) and runs the per-bundle cards.
//      A NDA            in a bundle of 3 or more an enemy cannot attack (contact hits and shots stop); in a bundle of 2 it attacks half
//                       as often. Lv 6: Gagging Order (taped enemies swim 30% slower), Confidentiality Clause (share 50%). Wild: Leaked
//                       (10%, a second after it forms: the bundle bursts and its enemies are Feared 2 s). Mastery: Super-Injunction.
//      B Hush Money     a taped enemy that dies pays 1 stamina (at most 5 payments a second). Lv 6: Paid Off (taped enemies take 20%
//                       more from your other weapons), Bribe (a taped Elite is 25% Possessed 4 s, once a bundle). Wild: Brown Envelope
//                       (a bundle of 4+ that dies within 1 s: heal 5%). Mastery: Slush Fund (stamina payouts doubled).
//      C Daddy's Lawyers when you are hit, half the damage goes to the nearest taped enemy within 200 instead. Lv 6: Countersue (the
//                       redirected damage hits its bundle again as Acid), Injunction (taped enemies within 60 of you are pushed back).
//                       Wild: Billable Hours (each redirect costs 1 stamina). Mastery: Retainer (three quarters redirected).
//  - Gated cards (the branch gate is a Do rule in cardrules.js, added at merge; eligible here is just "not held"): Feats Daddy's Credit
//    Card (pv_card, Acid Spit B) and Expelled (pv_expelled, Rent Free B); passives Signet Ring (pass_pv_signet, Rent Free A) and
//    Diplomatic Immunity (pass_pv_immunity, Ewww, Gross C).
//  - Copy: every card, fork and float is TODO_COPY:<id>, looked up in PRIVATE_COPY (privatecopy.js, written by the copy agent) first.
// Slot state: w.pv2 = { p: 'A'|'B'|'C', <card flag>: 1, fx: { <card>: count }, bl: [live bundles] }. Run state: G.pv2 = { pay: [], immT,
// card: { end, k, r, rate, w, tickT }, fx: {} } (Credit Card, Diplomatic Immunity and Expelled counters live in G.pv2.fx).
// Simplified: "cannot attack" cancels the enemy's contact hits (hurt:before) and its shots (eBullet wrap) rather than freezing its
// AI; "attacks 50% slower" is a 1.4 s minimum gap between its contact hits and every other shot dropped; Leaked rolls once, a second
// after the bundle forms; Brown Envelope heals at once (no pickup) and counts a bundle as dead when all but its last member fell
// inside 1 s (a bundle of one dissolves); Slush Fund doubles the stamina paid, not the 5-a-second cap on payments; Credit Card is typed
// Acid but deals no damage (exempt from featstest's "typed Feats deal damage" rule, as Blood Bag is); Expelled's knock-back leaves
// Possessed enemies alone because f10Near skips them.
// Hooks: wupRegFor (samplebranches.js), wupOn; hookOn('hurt:before' / 'kill' / 'dmgMul' / 'tick'); wraps eBullet (game.js). Loads after
// samplebranches.js, wup5.js, wup3.js and beta2.js. Save data: none.

const PV2 = { RT: 's_redtape', AS: 'v_fire_proj', RF: 'v_soul_proj', payCap: 5, fx: {} };
const pv2T = id => (typeof PRIVATE_COPY !== 'undefined' && PRIVATE_COPY[id]) || 'TODO_COPY:' + id;

(function () {
  const T = pv2T;
  const RED = '#e01e2b', GOLD = '#e8c547', PALE = '#fff3c4', ACID = '#9be15d', SOUL = '#cfe7ff';
  const F = w => w.pv2 || (w.pv2 = { fx: {}, bl: [] });
  const ST = () => G.pv2 || (G.pv2 = { pay: [], immT: 0, card: null, fx: {} });
  const slotOf = id => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === id) : null);
  const branchOf = id => { const w = slotOf(id); return w && w.up ? w.up.p || '' : ''; };
  const mark = (w, k) => { const m = F(w).fx; m[k] = (m[k] || 0) + 1; };
  const gmark = k => { const m = ST().fx; m[k] = (m[k] || 0) + 1; };
  const sayT = {};
  function say(key, x, y, txt, color, size, gap) { if ((sayT[key] || 0) > G.realT) return; sayT[key] = G.realT + (gap || 0.6); floatText(x, y, txt, color || PALE, size || 12, 0.8); }
  const stamAdd = n => { if (G && G.stam && typeof stamMax === 'function') G.stam.cur = Math.max(0, Math.min(stamMax(), G.stam.cur + n)); };
  const tapedBy = (e, w) => !!(e && e.tape && !e.tape.dead && e.tape.w === w);
  const aliveN = B => { let n = 0; for (const m of B.members) if (!m.dead) n++; return n; };
  const foe = e => e && !e.dead && !e.charmed && !e.egg;
  const rtSlot = () => { const w = slotOf(PV2.RT); return w && w.pv2 ? w : null; };
  // A hit a card makes: real damage, tagged taped (so toyHurt never shares it again) and echo (so it never fires the hit hooks).
  const hitSrc = (w, extra) => Object.assign(weaponSrc(w), { atk: 'burst', knock: 0, mult: 1, wupEcho: true, taped: true, noCrit: true, noProc: true, noArc: true, wname: 'Daddy\'s Lawyers' }, extra);

  // ================================================================ Ewww, Gross
  function install(w) {
    const f = F(w); if (f.inst) return; f.inst = 1;
    wupOn(w, 'stats', rtStats); wupOn(w, 'tick', rtTick);
  }
  const P = k => w => { install(w); F(w).p = k; };
  const set = k => w => { install(w); F(w)[k] = 1; };
  function rtStats(w, s) {
    const f = F(w);
    if (f.clause) s.share = Math.max(s.share, 0.5); // Confidentiality Clause
  }
  function rtTick(w, dt) {
    const f = F(w), T0 = TOYS(), p = G.player;
    for (const B of T0.tapes) if (B.w === w && !B.pvSeen && !B.dead) { B.pvSeen = 1; f.bl.push(B); if (f.leaked) B.pvLeakAt = G.t + 1; }
    f.bl = f.bl.filter(B => !B.dead);
    for (const B of f.bl) {
      const mem = B.members.filter(e => !e.dead);
      B.pvMax = Math.max(B.pvMax || 0, mem.length);
      if (f.p === 'A' && f.gag) for (const e of mem) if (!e.boss) { e.chill = Math.max(e.chill || 0, 0.3); e.chillAmt = Math.max(e.chillAmt || 0, 0.3); mark(w, 'gag'); }
      if (f.leaked && B.pvLeakAt && G.t >= B.pvLeakAt) { // Leaked: 10%, once, a second after it forms
        B.pvLeakAt = 0;
        if (Math.random() < 0.1) {
          for (const e of mem) { if (!e.boss && !e.charmed) e.fearT = Math.max(e.fearT || 0, G.t + 2); ring(e.x, e.y, e.r + 8, RED, 0.35, 4); }
          B.end = G.t; mark(w, 'leaked'); const c = mem[0];
          if (c) say('leak', c.x, c.y - c.r - 14, T('pv_eg_leaked_float'), RED, 12, 0.6);
        }
      }
      if (f.p === 'B' && f.bribe) for (const e of mem) { // Bribe: a taped Elite is sometimes Possessed (rolled once a bundle)
        if (!e.elite || e.boss || e.pvBribe === B) continue;
        e.pvBribe = B;
        if (!e.charmed && Math.random() < 0.25) { curseFoe(e, 4); if (e.charmed) { mark(w, 'bribe'); say('bribe' + e.id, e.x, e.y - e.r - 24, T('pv_eg_bribe_float'), GOLD, 12, 0.6); } }
      }
      if (f.p === 'C' && f.injunction) for (const e of mem) { // Injunction: pushed back inside 60
        if (e.boss || (e.pvInjT || 0) > G.t) continue;
        if (Math.hypot(e.x - p.x, e.y - p.y) < 60) { e.pvInjT = G.t + 0.5; shove(e, p.x, p.y, 320); mark(w, 'injunction'); say('inj' + e.id, e.x, e.y - e.r - 10, T('pv_eg_injunction_float'), PALE, 11, 0.8); }
      }
    }
  }

  // NDA: is this taped enemy barred from attacking right now? (shot = true for a bullet, which drops every other one in a bundle of 2)
  function muted(e, shot) {
    const w = rtSlot(); if (!w) return false;
    const f = w.pv2; if (f.p !== 'A' || !tapedBy(e, w)) return false;
    const n = aliveN(e.tape);
    if (n >= 3 || (n === 2 && f.super)) return true;
    if (n === 2 && shot) { e.pvBul = (e.pvBul || 0) + 1; return e.pvBul % 2 === 0; }
    return false;
  }
  { const eb0 = eBullet; eBullet = function () { if (G && G.toy && typeof shooterEnt !== 'undefined' && shooterEnt && muted(shooterEnt, true)) { const w = rtSlot(); if (w) mark(w, 'nda'); return; } return eb0.apply(this, arguments); }; }
  // Hits on you: NDA (order 30), Diplomatic Immunity (35), Daddy's Lawyers (55).
  const live = () => { const p = G && G.player; return !!(G && G.state === 'play' && p && !(p.iframes > 0) && !(G.shieldT > 0) && !(G.debug && G.debug.god)); };
  hookOn('hurt:before', 'private2:nda', (dmg, from, ent, kind) => {
    if (!(dmg > 0) || !live() || !ent) return dmg;
    const w = rtSlot(); if (!w || w.pv2.p !== 'A' || !tapedBy(ent, w)) return dmg;
    const f = w.pv2, n = aliveN(ent.tape);
    if (n >= 3 || (n === 2 && f.super)) { if ((ent.pvNdaT || 0) < G.t) { ent.pvNdaT = G.t + 0.6; mark(w, 'nda'); say('nda' + ent.id, ent.x, ent.y - ent.r - 10, T('pv_eg_nda_float'), RED, 11, 0.8); } return null; }
    if (n === 2) { if (G.t < (ent.pvAtkT || 0)) return null; ent.pvAtkT = G.t + 1.4; mark(w, 'slow'); }
    return dmg;
  }, 30);
  hookOn('hurt:before', 'private2:immunity', dmg => {
    if (!(dmg > 0) || !live() || !G.muts || !G.muts.pass_pv_immunity) return dmg;
    const S = ST(); if (G.t < S.immT) return dmg;
    const p = G.player; S.immT = G.t + 20; p.iframes = Math.max(p.iframes, 0.7); gmark('immunity');
    ring(p.x, p.y, p.r + 16, GOLD, 0.4, 4); say('immune', p.x, p.y - 30, T('pass_pv_immunity_float'), GOLD, 13, 1);
    return null;
  }, 35);
  hookOn('hurt:before', 'private2:lawyers', dmg => {
    if (!(dmg > 0) || !live()) return dmg;
    const w = rtSlot(); if (!w || w.pv2.p !== 'C') return dmg;
    const f = w.pv2, p = G.player; let best = null, bd = 200 * 200;
    for (const e of G.enemies) { if (!foe(e) || !tapedBy(e, w)) continue; const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2; if (d2 < bd) { bd = d2; best = e; } }
    if (!best) return dmg;
    const red = dmg * (f.retainer ? 0.75 : 0.5), B = best.tape, src = hitSrc(w);
    damageEnemy(best, red, src);
    if (f.countersue) for (const o of B.members) if (o !== best && !o.dead) damageEnemy(o, red, hitSrc(w, { elem: 'fire', wname: 'Countersue' }));
    if (f.countersue) mark(w, 'countersue');
    if (f.billable && G.stam) { G.stam.cur = Math.max(0, G.stam.cur - 1); mark(w, 'billable'); }
    mark(w, 'redirect'); bolt(p.x, p.y, best.x, best.y, RED, 0.2);
    say('lawyers', p.x, p.y - 30, T('pv_eg_lawyers_float'), RED, 12, 0.6);
    return dmg - red;
  }, 55);

  // Hush Money: a taped enemy that dies pays stamina; Brown Envelope: a bundle that falls together heals.
  hookOn('kill', 'private2:hush', (e, src) => {
    const w = rtSlot(); if (!w || !G || !tapedBy(e, w)) return;
    const f = w.pv2, B = e.tape, p = G.player;
    if (f.p !== 'B') return;
    const S = ST(); S.pay = S.pay.filter(t => G.t - t < 1);
    if (S.pay.length < PV2.payCap) {
      S.pay.push(G.t); stamAdd(f.slush ? 2 : 1); mark(w, 'pay');
      say('hush', p.x, p.y - 30, T('pv_eg_hush_float'), GOLD, 11, 0.8);
    }
    if (f.envelope) {
      const D = B.pvDeaths || (B.pvDeaths = []); D.push(G.t);
      const recent = D.filter(t => G.t - t <= 1).length, n0 = Math.max(B.pvMax || 0, aliveN(B) + D.length);
      if (!B.pvEnv && n0 >= 4 && recent >= n0 - 1) {
        B.pvEnv = 1; healPlayer(G.P.maxHp * 0.05, true); mark(w, 'envelope');
        say('env', p.x, p.y - 34, T('pv_eg_brownenvelope_float'), GOLD, 13, 0.8); ring(e.x, e.y, 30, GOLD, 0.4, 4);
      }
    }
  });
  // Paid Off: taped enemies take 20% more from your other weapons. Credit Card: every weapon deals 30% more. Signet Ring: allies 30% more.
  hookOn('dmgMul', 'private2:dmg', (e, src) => {
    if (!src || !G) return 1;
    let k = 1;
    const w = rtSlot();
    if (w && w.pv2.paid && src.w && src.w !== w && !src.fromAlly && tapedBy(e, w)) { k *= 1.2; mark(w, 'paid'); }
    const c = G.pv2 && G.pv2.card;
    if (c && c.end > G.t && src.w && !src.fromAlly) k *= 1 + c.k;
    if (src.fromAlly && G.muts && G.muts.pass_pv_signet) k *= 1.3;
    return k;
  });

  // ================================================================ the branch set
  const C = (name, desc, apply) => ({ name, desc, apply });
  const nm = (pre, key, name, fn, best) => best ? { name, best, desc: T(pre + '_' + key + '_desc'), apply: fn } : C(name, T(pre + '_' + key + '_desc'), fn);
  wupRegFor('private', PV2.RT, {
    A: { name: 'NDA', tag: T('pv_eg_nda_tag'), costs: T('pv_eg_nda_costs'),
      lv3: { desc: T('pv_eg_nda_desc'), apply: P('A') },
      lv6: [nm('pv_eg', 'gaggingorder', 'Gagging Order', set('gag')), nm('pv_eg', 'confidentialityclause', 'Confidentiality Clause', set('clause'))],
      wild: nm('pv_eg', 'leaked', 'Leaked', set('leaked')) },
    B: { name: 'Hush Money', tag: T('pv_eg_hush_tag'), costs: T('pv_eg_hush_costs'),
      lv3: { desc: T('pv_eg_hush_desc'), apply: P('B') },
      lv6: [nm('pv_eg', 'paidoff', 'Paid Off', set('paid')), nm('pv_eg', 'bribe', 'Bribe', set('bribe'))],
      wild: nm('pv_eg', 'brownenvelope', 'Brown Envelope', set('envelope')) },
    C: { name: "Daddy's Lawyers", tag: T('pv_eg_lawyers_tag'), costs: T('pv_eg_lawyers_costs'),
      lv3: { desc: T('pv_eg_lawyers_desc'), apply: P('C') },
      lv6: [nm('pv_eg', 'countersue', 'Countersue', set('countersue')), nm('pv_eg', 'injunction', 'Injunction', set('injunction'))],
      wild: nm('pv_eg', 'billablehours', 'Billable Hours', set('billable')) },
    lv10: [nm('pv_eg', 'superinjunction', 'Super-Injunction', set('super'), 'A'), nm('pv_eg', 'slushfund', 'Slush Fund', set('slush'), 'B'), nm('pv_eg', 'retainer', 'Retainer', set('retainer'), 'C')] });

  // ================================================================ gated Feats
  const fk = (id, title, desc) => ({ id, title: T(title), desc: T(desc) });
  const gated = id => { const c = typeof CARDS !== 'undefined' && CARDS.find(x => x.id === 'feat_' + id); if (c) c.eligible = g => !f10Own(id); }; // (the branch gate is a Do rule in cardrules.js, added at merge)
  const gfeat = (w, n) => { const S = ST(); S.fx[n] = (S.fx[n] || 0) + 1; };

  // Daddy's Credit Card: for 6 s every weapon deals 30% more and enemies within 150 build Corrosion.
  feat({ id: 'pv_card', name: "Daddy's Credit Card", icon: 'CC', ico: 'flask', type: 'acid', atk: 'burst', rar: 1, stam: 20, gate: () => branchOf(PV2.AS) === 'B',
    line: T('feat_pv_card_line'), does: T('feat_pv_card_does'),
    base: { dmg: 0, cd: 20, dur: 6, area: 150 },
    stat: (w, s) => { if (f10Fk(w, 'limit')) s.dur *= 1.5; if (f10Fk(w, 'overdraft')) s.cd *= 0.7; },
    when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area + 150).length ? {} : null; },
    fire: w => {
      const p = me(), s = w.s;
      ST().card = { end: G.t + s.dur, k: 0.3 * (f10Fk(w, 'platinum') ? 1.5 : 1), r: s.area, rate: f10Fk(w, 'interest') ? 0.1 : 0.05, w, tickT: 0 };
      ring(p.x, p.y, s.area, w.def.color, 0.5, 5); floatText(p.x, p.y - 34, T('feat_pv_card_float'), w.def.color, 15, 0.8); gfeat(w, 'card');
    },
    forks: { 3: [fk('limit', 'feat_pv_card_limit_name', 'feat_pv_card_limit_desc'), fk('platinum', 'feat_pv_card_platinum_name', 'feat_pv_card_platinum_desc')],
      5: [fk('interest', 'feat_pv_card_interest_name', 'feat_pv_card_interest_desc'), fk('overdraft', 'feat_pv_card_overdraft_name', 'feat_pv_card_overdraft_desc')] } });
  gated('pv_card');
  hookOn('tick', 'private2:card', dt => {
    if (!G || G.state !== 'play' || !G.pv2 || !G.pv2.card) return;
    const c = G.pv2.card; if (c.end <= G.t) { G.pv2.card = null; return; }
    c.tickT -= dt; if (c.tickT > 0) return; c.tickT = 0.25;
    const p = me(), src = f10Src(c.w, { atk: 'burst', wupEcho: true, noProc: true });
    for (const e of f10Near(p.x, p.y, c.r)) { w3BarFrac(e, 'acid', c.rate, c.w, src); gmark('cardbar'); }
  });

  // Expelled: everything within 160 is knocked away hard and Feared for 1.5 s; Possessed enemies are left alone.
  feat({ id: 'pv_expelled', name: 'Expelled', icon: 'EX', ico: 'storm', type: 'soul', atk: 'burst', rar: 1, stam: 18, gate: () => branchOf(PV2.RF) === 'B',
    line: T('feat_pv_expelled_line'), does: T('feat_pv_expelled_does'),
    base: { dmg: 8, cd: 15, area: 160, dur: 1.5 },
    stat: (w, s) => { if (f10Fk(w, 'suspension')) s.dur *= 2; if (f10Fk(w, 'detention')) s.area *= 1.4; if (f10Fk(w, 'headmaster')) s.cd *= 0.7; },
    when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area + 40).length ? {} : null; },
    fire: w => {
      const p = me(), s = w.s, list = f10Near(p.x, p.y, s.area);
      for (const e of list) {
        f10Hit(w, e, s.dmg, 'burst');
        if (e.dead) continue;
        f10Shove(e, p.x, p.y, 700);
        if (!e.boss) e.fearT = Math.max(e.fearT || 0, G.t + s.dur);
        if (f10Fk(w, 'letter')) { const c = fightCd(e); c.bars.soul = Math.min(0.99, (c.bars.soul || 0) + 0.25); }
      }
      ring(p.x, p.y, s.area, w.def.color, 0.45, 5); fxParts('spark', p.x, p.y, w.def.color, 10, 240, 0.4, 3);
      floatText(p.x, p.y - 34, T('feat_pv_expelled_float'), w.def.color, 15, 0.8); gfeat(w, 'expelled');
      return list.length;
    },
    forks: { 3: [fk('suspension', 'feat_pv_expelled_suspension_name', 'feat_pv_expelled_suspension_desc'), fk('detention', 'feat_pv_expelled_detention_name', 'feat_pv_expelled_detention_desc')],
      5: [fk('headmaster', 'feat_pv_expelled_headmaster_name', 'feat_pv_expelled_headmaster_desc'), fk('letter', 'feat_pv_expelled_letter_name', 'feat_pv_expelled_letter_desc')] } });
  gated('pv_expelled');

  // ================================================================ gated passives (Signet Ring: the dmgMul above; Diplomatic Immunity: the hurt:before above)
  if (typeof mutCard === 'function') {
    mutCard({ id: 'pass_pv_signet', title: 'Signet Ring', icon: 'SR', rarity: 2, maxRank: 1, family: 'mut:body', flavour: T('pass_pv_signet_flavour'), desc: T('pass_pv_signet_desc'), why: () => '' });
    mutCard({ id: 'pass_pv_immunity', title: 'Diplomatic Immunity', icon: 'DI', rarity: 2, maxRank: 1, family: 'mut:body', flavour: T('pass_pv_immunity_flavour'), desc: T('pass_pv_immunity_desc'), why: () => '' });
  }
})();
