'use strict';
// Spawn Prawn - branch combos for the 24 weapons (v10). Ten weapon pairs, three combos each: a combo needs BOTH weapons
// at Lv 5 (internal level, the ordinary COMBO_LEVEL) AND a particular Lv 3 promise on each (c.pa on c.a, c.pb on c.b).
// Each pair's three combos use every promise of both weapons once, so whatever the first weapon took, exactly one promise
// on the second fuses with it. Same attack types may fuse.
// Rules (COMBAT_MATRIX 10): a combo changes how two weapons behave together; it never sets off an unstable reaction
// itself. Every extra hit goes through damageEnemy -> fightHit (Evasion, Membrane, Shell and the rest), marked noRx
// (fight.js skips reactions for it), wupEcho and noProc (no hook re-triggers). Statuses and build-up bars still apply.
// Reachability:
//  - availableCombos only offers a branch combo when both promises match (wrapped here).
//  - The weapon draft (v10Loot 'slot') swaps one card for a combo partner of a weapon you hold, even one whose attack
//    type you already have (this also makes the old same-type combos, Storm in a Teacup and Worm Farm, reachable).
//  - A Lv 3 promise card says which of your weapons it fuses with; autorun prefers a card that completes a combo.
// Hooks (no shared file edited except one guard in fight.js): wraps fightHit (every hit), killEnemy, projHit, comboFire,
// comboTick, wupDmgMul, bubblePop, toothTaken, availableCombos, wupForkCards, v10Loot and UI.autoTick. Counters in G.c10n (tests).
// Simplifications: Running Stitch threads shots that pass within 24 of each other; Flashback's wave is any crossing of
// your own trail (cooldown 1 s); Screen Share's Codependency boost is its own +10% per enemy (2 s, up to +100%).

const C10_PB = '#f1ecff', C10_PINK = '#ff2fa8', C10_RED = '#c9184a', C10_YEL = '#ffe94a', C10_GRN = '#7fd04a', C10_ALIEN = '#b06cff', C10_FIRE = '#ff6a2a';
const C10 = [
  // 1. Standard Issue + Little Prick
  { id: 'c10_stitch', a: 'v_phys_proj', b: 'v_arcane_proj', pa: 'B', pb: 'B', name: 'Running Stitch',
    desc: 'A Standard Issue pellet that overtakes a Little Prick needle threads it: everything both of them pierce is sewn into one line, then the thread pulls tight and yanks them together. Seam allowance: none.' },
  { id: 'c10_popquiz', a: 'v_phys_proj', b: 'v_arcane_proj', pa: 'C', pb: 'C', name: 'Pop Quiz',
    desc: 'Needles count towards the bonk mark. A bonk that leaves its enemy under 30% bursts it into needles that fly at its neighbours. Nobody revised.' },
  { id: 'c10_papertrail', a: 'v_phys_proj', b: 'v_arcane_proj', pa: 'A', pb: 'A', name: 'Paper Trail',
    desc: 'Ricochets jump to the enemy bleeding most, and every bounce adds a Bleed stack. The paperwork follows you everywhere.' },
  // 2. Red Flagship + Soulmate Signal
  { id: 'c10_streams', a: 'v_shock_beam', b: 'twin', pa: 'A', pb: 'A', name: 'Crossing the Streams',
    desc: 'When Red Flagship\'s target sits on a twin beam, the beams cross there: a hot node zaps everything within 60, growing with Overclocked\'s build-up. You were told not to.' },
  { id: 'c10_groupchat', a: 'v_shock_beam', b: 'twin', pa: 'B', pb: 'C', name: 'Group Chat',
    desc: 'A Red Flagship kill throws a twin beam from the body to the nearest enemy for 1 s. Someone always replies to the dead.' },
  { id: 'c10_screenshare', a: 'v_shock_beam', b: 'twin', pa: 'C', pb: 'B', name: 'Screen Share',
    desc: 'Every glitch also zaps along the twin beam, and each enemy it hits adds 10% to the twin beam for 2 s (up to +100%). Can everyone see this.' },
  // 3. Hot Mess + The Runs
  { id: 'c10_flashback', a: 'v_flame_pool', b: 'wake', pa: 'C', pb: 'B', name: 'Flashback',
    desc: 'Cross your own trail and a flash runs down it: every Hot Mess patch within 100 of the trail goes off early, at full size. It comes back on you. They always do.' },
  { id: 'c10_hob', a: 'v_flame_pool', b: 'wake', pa: 'A', pb: 'C', name: 'Four-Ring Hob',
    desc: 'Trail that touches a Hot Mess patch becomes patch, so a looped route turns into one long burner. Setting: high.' },
  { id: 'c10_gossip', a: 'v_flame_pool', b: 'wake', pa: 'B', pb: 'A', name: 'Word Gets Around',
    desc: 'Burning footprints left by fleeing enemies become your trail, hotter the faster you swim. Nobody started it. Everyone has it.' },
  // 4. Family Ties + Skill Issue
  { id: 'c10_fatchance', a: 'void', b: 'lard', pa: 'A', pb: 'B', name: 'Fat Chance',
    desc: 'An elite or anything big that Skill Issue sends into a Family Ties vortex collapses it early into a supernova. The vortex was not built for this.' },
  { id: 'c10_cradle', a: 'void', b: 'lard', pa: 'B', pb: 'A', name: 'Newton\'s Cradle',
    desc: 'Enemies orbiting a vortex rebound off each other and never settle. Every bump is a collision hit. An executive toy, for a very small executive.' },
  { id: 'c10_foodcoma', a: 'void', b: 'lard', pa: 'C', pb: 'C', name: 'Food Coma',
    desc: 'Every collision inside a vortex\'s pull feeds it, so it grows towards its supernova. It will need a lie-down.' },
  // 5. Acid Spit + Rent Free
  { id: 'c10_gargle', a: 'v_fire_proj', b: 'v_soul_proj', pa: 'A', pb: 'A', name: 'Gargle',
    desc: 'A ghost passing through a Corroded enemy picks up its acid and adds Corrosion to everything it passes through after. Do not swallow.' },
  { id: 'c10_offender', a: 'v_fire_proj', b: 'v_soul_proj', pa: 'B', pb: 'B', name: 'Repeat Offender',
    desc: 'The returning ghost sweeps up Acid Spit\'s splatter on its way back and throws it again where it hits. Known to the slide.' },
  { id: 'c10_review', a: 'v_fire_proj', b: 'v_soul_proj', pa: 'C', pb: 'C', name: 'Posthumous Review',
    desc: 'A haunted enemy that dies with acid on it bursts its Corrosion out twice as far (140). The reviewer is dead. The review stands.' },
  // 6. Nappy Mines + Panic Button
  { id: 'c10_domino', a: 'mines', b: 'v_phys_burst', pa: 'B', pb: 'B', name: 'Domino Day',
    desc: 'Panic Button blasts set off any mine within 60 of their edge, and mine kills set off a small Panic Button blast (6 a second at most). One button. Several consequences.' },
  { id: 'c10_landing', a: 'mines', b: 'v_phys_burst', pa: 'A', pb: 'C', name: 'Hard Landing',
    desc: 'Enemies Panic Button flings set off any mine within 90 of where they land, at 50% more damage. Nobody checked the landing zone.' },
  { id: 'c10_firebreak', a: 'mines', b: 'v_phys_burst', pa: 'C', pb: 'A', name: 'Fire Break',
    desc: 'A Panic Button shockwave sweeps Nappy Mines\' burning patches out to its rim, three for each, burning fresh. A perimeter, of sorts.' },
  // 7. There Is No Spoon + Peekaboo
  { id: 'c10_noyou', a: 'siphon', b: 'peekaboo', pa: 'A', pb: 'B', name: 'There Is No You',
    desc: 'While you are hidden, There Is No Spoon holds its fire and shots that pass through you go into its store (25 at most); the BOO fires the whole store. You were never there. The bullets were.' },
  { id: 'c10_party', a: 'siphon', b: 'peekaboo', pa: 'C', pb: 'A', name: 'Surprise Party',
    desc: 'While you are hidden, There Is No Spoon holds its fire; the BOO launches every stored shot at the spot you vanished from, where each bursts (radius 60). Everyone came. Nobody had a good time.' },
  { id: 'c10_blanket', a: 'siphon', b: 'peekaboo', pa: 'B', pb: 'C', name: 'Comfort Blanket',
    desc: 'Feared enemies drop what they were holding: two shots into your store as the Fear lands, and every shot they fire while afraid. It is soft. It is yours now.' },
  // 8. Unwanted Contact + Sister Cousin
  { id: 'c10_reunion', a: 'tesla', b: 'seeker', pa: 'A', pb: 'A', name: 'Family Reunion',
    desc: 'The last enemy each Unwanted Contact chain reaches hatches a Sister Cousin seeker. Attendance was not optional.' },
  { id: 'c10_pet', a: 'tesla', b: 'seeker', pa: 'B', pb: 'B', name: 'Teacher\'s Pet',
    desc: 'Seekers count Charged enemies as the weakest and switch to them. Somebody told on them.' },
  { id: 'c10_sibstatic', a: 'tesla', b: 'seeker', pa: 'C', pb: 'C', name: 'Sibling Static',
    desc: 'Two seekers on one Charged enemy arc to each other through it, and the arc jumps on to a neighbour. They have never once shared.' },
  // 9. Blowing Bubbles + Nocturnal Emission
  { id: 'c10_snotbub', a: 'bubble', b: 'v_ice_pool', pa: 'C', pb: 'C', name: 'Snot Bubbles',
    desc: 'A bubble that pops with something inside strings a strand to the two nearest Nocturnal Emission traps for 3 s; anything crossing it is Snared. Nobody mentions it in the morning.' },
  { id: 'c10_clingfilm', a: 'bubble', b: 'v_ice_pool', pa: 'B', pb: 'B', name: 'Cling Film',
    desc: 'Anything (but a boss) held in a trap for 1.5 s gets bubbled, so it blocks shots. Freshness is not guaranteed.' },
  { id: 'c10_boil', a: 'bubble', b: 'v_ice_pool', pa: 'A', pb: 'A', name: 'Rolling Boil',
    desc: 'Bubbles that roll through a trap grow by half, so they pop wider, and an empty one closes round anything but a boss at once. Stir occasionally.' },
  // 10. Eggs + Chest Burster
  { id: 'c10_egghunt', a: 'toothfairy', b: 'parasite', pa: 'A', pb: 'B', name: 'Egg Hunt',
    desc: 'Undead pick up eggs and carry them into the crowd. There are rules. Nobody follows them.' },
  { id: 'c10_scrambled', a: 'toothfairy', b: 'parasite', pa: 'B', pb: 'C', name: 'Scrambled',
    desc: 'Undead chase eggs like enemies do and burst on the first greedy enemy that comes for one. Breakfast is cancelled.' },
  { id: 'c10_hatch', a: 'toothfairy', b: 'parasite', pa: 'C', pb: 'A', name: 'Hatchling',
    desc: 'An egg an enemy takes also hatches an undead beside it (once every 4 s), and still smites; one nobody takes for 2.5 s just hatches. Congratulations. Probably.' },
];
COMBOS.push(...C10);
for (const c of C10) COMBO_BY[c.id] = c;
const C10_BY = Object.fromEntries(C10.map(c => [c.id, c]));

// ---------------------------------------------------------------- helpers
const c10St = c => { const S = G.c10s || (G.c10s = {}); return S[c.id] || (S[c.id] = {}); };
const c10Count = c => { const N = G.c10n || (G.c10n = {}); N[c.id] = (N[c.id] || 0) + 1; };
const c10Live = e => !!e && !e.dead && !e.charmed && !e.egg;
const c10Src = (w, c, extra) => Object.assign(weaponSrc(w), { knock: 0, wupEcho: true, noProc: true, noCrit: true, noArc: true, noRx: true, c10: c.id, wname: c.name }, extra || {});
function c10Hit(e, dmg, w, c, extra) { if (!c10Live(e) || !w.s) return 0; c10Count(c); return damageEnemy(e, dmg, c10Src(w, c, extra)); }
function c10Say(c, key, x, y, txt, col, gap) { const st = c10St(c); if (st['say' + key] > G.t) return; st['say' + key] = G.t + (gap || 1.5); floatText(x, y, txt, col, 13, 0.7); }
const c10Promise = w => (w && w.up && w.up.p) || null;
const c10Ready = c => { const A = owned(c.a), B = owned(c.b); return !!(A && B && c10Promise(A) === c.pa && c10Promise(B) === c.pb); };
const c10Prom = (wid, k) => { const S = WUP[W24_IDS.find(id => wl_old(id) === wid)]; return (S && S[k] && S[k].name) || k; };
const c10Need = c => `${WEAPONS[W24_IDS.find(id => wl_old(id) === c.a)].name} (${c10Prom(c.a, c.pa)}) + ${WEAPONS[W24_IDS.find(id => wl_old(id) === c.b)].name} (${c10Prom(c.b, c.pb)})`;
const c10Mines = A => G.proj.filter(pr => pr.mine && !pr.dead && pr.w === A);
const c10Zones = (w, f) => G.zones.filter(z => z.src && z.src.w === w && z.life > 0 && (!f || f(z)));
const c10Seg = (px, py, x1, y1, x2, y2) => w2SegDist(px, py, x1, y1, x2, y2);
function c10Shoot(w, c, x, y, a, over, mult) {
  const src = c10Src(w, c); if (mult) src.mult = (src.mult || 1) * mult;
  return spawnProj(w, x, y, a, src, Object.assign({ noMods: true }, over || {}));
}
function c10Bleed(e, w, n) { // Bleed stacks (fight.js: 30% of the hit over 3 s), the cap Bleeding Heart allows
  const b = e.bleeds || (e.bleeds = []);
  for (let i = 0; i < n; i++) { if (b.length >= 6) b.shift(); b.push({ dps: w.s.dmg * 0.3 / 3, t: 3, by: 'Paper Trail' }); }
}
// Panic Button blast centres this frame (from its hits: pbBlast hits carry kx/ky from the centre).
function c10PbBlasts() { const S = G.c10pb || (G.c10pb = { l: [] }); S.l = S.l.filter(b => b.t > G.t - 0.2); return S.l; }
const c10Fused = () => G && G.combo ? C10.filter(c => G.combo[c.id]) : [];

// ---------------------------------------------------------------- the behaviours (A = weapon a, B = weapon b)
const C10_FX = {
  c10_stitch: {
    tick(c, A, B, dt) {
      const st = c10St(c), T = st.th || (st.th = []);
      if (T.length < 6) {
        const sh = G.proj.filter(pr => pr.w === A && !pr.dead && !pr.c10t && !pr.lob && !(pr.src && pr.src.c10));
        const nd = sh.length ? G.proj.filter(pr => pr.w === B && !pr.dead && !pr.c10t && !pr.lob && !(pr.src && pr.src.c10)) : [];
        for (const p of sh) for (const q of nd) {
          if (q.c10t || p.c10t || Math.hypot(p.x - q.x, p.y - q.y) > 24) continue;
          const th = { es: [], t: G.t }; p.c10t = q.c10t = th; T.push(th);
          ring(p.x, p.y, 14, C10_RED, 0.3, 2); c10Say(c, 't', p.x, p.y - 14, 'THREADED', C10_RED, 0.8);
        }
      }
      for (let i = T.length - 1; i >= 0; i--) {
        const th = T[i], es = th.es.filter(c10Live);
        for (let j = 1; j < es.length; j++) w2Line(es[j - 1].x, es[j - 1].y, es[j].x, es[j].y, 1.5, C10_RED, 0.05);
        if (!th.done && G.t - th.t > 0.5) {
          th.done = true;
          if (es.length >= 2) {
            const cx = es.reduce((s, e) => s + e.x, 0) / es.length, cy = es.reduce((s, e) => s + e.y, 0) / es.length;
            for (const e of es) {
              if (!e.boss) { const dx = cx - e.x, dy = cy - e.y, d = Math.hypot(dx, dy) || 1; e.kx += dx / d * Math.min(260, d * 4); e.ky += dy / d * Math.min(260, d * 4); }
              c10Hit(e, B.s.dmg * 0.8, B, c);
            }
            floatText(cx, cy - 18, 'RUNNING STITCH', C10_RED, 14, 0.8);
          }
        }
        if (G.t - th.t > 0.9) T.splice(i, 1);
      }
    },
    phit(c, A, B, pr, e) { const th = pr.c10t; if (th && !th.done && !th.es.includes(e) && th.es.length < 10) th.es.push(e); },
  },
  c10_popquiz: {
    hit(c, A, B, e, src, r) {
      if (src.w === B && !src.wupEcho && r >= 0 && !e.w1mk && !e.dead) {
        e.w1n = (e.w1n || 0) + 1;
        if (e.w1n >= 4) { e.w1n = 0; e.w1mk = 1; e.w1by = A; e.w1soft = A.w1 && A.w1.soft ? 1 : 0; ring(e.x, e.y, e.r + 8, C10_PB, 0.3, 4); floatText(e.x, e.y - e.r - 12, 'DENTED', C10_PB, 12, 0.6); c10Count(c); }
      }
      if (src.w === A && e.c10bonk === G.frameN && r >= 0 && e.hp - r < e.maxHp * 0.3) {
        e.c10bonk = 0;
        const ns = acquireMany('nearest', 240, e.x, e.y, 7).filter(o => o !== e && c10Live(o)).slice(0, 6);
        for (let i = 0; i < 6; i++) { const o = ns[i], a = o ? Math.atan2(o.y - e.y, o.x - e.x) : i / 6 * TAU; c10Shoot(B, c, e.x, e.y, a, { dmg: B.s.dmg * 0.8, pierce: 0, homing: o ? 6 : 0, life: 0.6 }); }
        fxParts('spark', e.x, e.y, C10_RED, 10, 200, 0.4, 2.5); floatText(e.x, e.y - e.r - 18, 'POP QUIZ', C10_RED, 14, 0.8); c10Count(c);
      }
    },
    mul(c, A, B, e, src) { if (src.w === A && e.w1mk && !src.wupEcho) e.c10bonk = G.frameN; return 1; },
  },
  c10_papertrail: {
    phit(c, A, B, pr, e) {
      if (pr.w !== A || (pr.src && pr.src.wupEcho) || !((pr.wb || 0) > (pr.c10wb || 0))) return;
      pr.c10wb = pr.wb;
      c10Bleed(e, B, 1); ring(e.x, e.y, e.r + 5, C10_RED, 0.3, 2); c10Count(c);
      const ex = pr.hits || []; let best = null, bn = 0, bd = 1e9;
      forNear(e.x, e.y, 110, (o, d2) => { if (o === e || !c10Live(o) || ex.includes(o.id)) return false; const n = o.bleeds ? o.bleeds.length : 0; if (n > bn || (n === bn && n > 0 && d2 < bd)) { bn = n; bd = d2; best = o; } return false; });
      if (best && bn > 0) { const sp = Math.hypot(pr.vx, pr.vy) || pr.speed, a = Math.atan2(best.y - pr.y, best.x - pr.x); pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp; bolt(e.x, e.y, best.x, best.y, C10_RED, 0.2); c10Say(c, 'p', e.x, e.y - 16, 'PAPER TRAIL', C10_RED, 2); }
    },
  },
  c10_streams: {
    tick(c, A, B, dt) {
      const st = c10St(c), t = A.curTarget, p = G.player;
      if (!(A.firedT > G.t - 0.3) || !c10Live(t) || !B.anchor) { st.hold = 0; return; }
      if (st.tg !== t) { st.tg = t; st.hold = 0; } else st.hold = (st.hold || 0) + dt;
      const k = Math.min(1, st.hold / 3);
      st.zt = (st.zt || 0) - dt;
      for (const [u, v] of twinSegs(B).slice(0, 4)) {
        if (c10Seg(t.x, t.y, u.x, u.y, v.x, v.y) > t.r + 30) continue; // (both beams start at you, so they cross where Red Flagship's target meets a twin beam)
        const n = { x: t.x, y: t.y };
        const R = 60 * (1 + 0.5 * k);
        if (Math.random() < dt * 20) ring(n.x, n.y, R * 0.4, C10_YEL, 0.15, 3);
        if (st.zt > 0) continue;
        IN_AOE = true; try { forNear(n.x, n.y, R, o => { if (c10Live(o)) c10Hit(o, A.s.dmg * (1 + k) * 0.6, A, c, { atk: 'burst' }); return false; }); } finally { IN_AOE = false; }
        ring(n.x, n.y, R, C10_YEL, 0.25, 4); G.fx.push({ type: 'flash', x: n.x, y: n.y, r: R * 0.6, color: C10_YEL, life: 0.12, max: 0.12 });
        c10Say(c, 'n', n.x, n.y - 20, 'CROSSED', C10_YEL, 3);
      }
      if (st.zt <= 0) st.zt = 0.25;
    },
  },
  c10_groupchat: {
    kill(c, A, B, e, src) {
      if (!src || src.w !== A) return;
      const st = c10St(c), L = st.links || (st.links = []); if (L.length >= 6) return;
      const o = acquire('nearest', 220, e.x, e.y, e); if (!o) return;
      L.push({ x: e.x, y: e.y, to: o, t: 1, z: 0 }); c10Say(c, 'g', e.x, e.y - 16, 'GROUP CHAT', C10_YEL, 1.5); c10Count(c);
    },
    tick(c, A, B, dt) {
      const L = c10St(c).links || [];
      for (let i = L.length - 1; i >= 0; i--) {
        const k = L[i]; k.t -= dt; k.z -= dt;
        if (k.t <= 0 || !c10Live(k.to)) { L.splice(i, 1); continue; }
        w2Line(k.x, k.y, k.to.x, k.to.y, 4, B.def.color, 0.05, true);
        if (k.z > 0) continue; k.z = 0.2;
        for (const e of G.enemies) if (c10Live(e) && c10Seg(e.x, e.y, k.x, k.y, k.to.x, k.to.y) <= e.r + 6) c10Hit(e, B.s.dmg * 0.5, B, c, { atk: 'beam' });
      }
    },
  },
  c10_screenshare: {
    tick(c, A, B, dt) {
      const st = c10St(c);
      if (st.codT < G.t) st.cod = 0;
      st.zt = (st.zt || 0) - dt;
      if (st.zt > 0 || !(A.firedT > G.t - 0.3) || !B.anchor) return;
      st.zt = 0.5;
      let n = 0;
      for (const [u, v] of twinSegs(B)) {
        const a = Math.atan2(v.y - u.y, v.x - u.x), ox = -Math.sin(a) * 9, oy = Math.cos(a) * 9;
        for (const k of [-1, 0, 1]) w2Line(u.x + ox * k, u.y + oy * k, v.x + ox * k, v.y + oy * k, 2, A.def.color, 0.12, true);
        for (const e of G.enemies) if (c10Live(e) && c10Seg(e.x, e.y, u.x, u.y, v.x, v.y) <= e.r + 12) { c10Hit(e, A.s.dmg * 0.5, A, c, { atk: 'beam' }); n++; }
      }
      if (n) { st.cod = Math.min(1, (st.cod || 0) + 0.1 * n); st.codT = G.t + 2; c10Say(c, 's', G.player.x, G.player.y - 30, 'SCREEN SHARE +' + Math.round(st.cod * 100) + '%', A.def.color, 2); }
    },
    mul(c, A, B, e, src) { const st = c10St(c); return src.w === B && st.codT > G.t ? 1 + (st.cod || 0) : 1; },
  },
  c10_flashback: {
    tick(c, A, B, dt) {
      const st = c10St(c), p = G.player;
      if (st.cd > G.t) return;
      const trail = c10Zones(B, z => z.trail);
      if (!trail.some(z => z.max - z.life > 0.4 && Math.hypot(z.x - p.x, z.y - p.y) < z.r + 6)) return;
      st.cd = G.t + 1;
      let n = 0;
      for (const z of w3HmScan(A)) {
        if (n >= 4 || (z.w3 && z.w3.done)) continue;
        if (!trail.some(t => Math.hypot(t.x - z.x, t.y - z.y) < z.r + t.r + 100)) continue;
        hmErupt(A, z, 1); z.life = Math.min(z.life, 0.02); n++; c10Count(c);
      }
      if (n) floatText(p.x, p.y - 34, 'FLASHBACK', C10_FIRE, 14, 0.8);
    },
  },
  c10_hob: {
    tick(c, A, B, dt) {
      const st = c10St(c); st.zt = (st.zt || 0) - dt; if (st.zt > 0) return; st.zt = 0.2;
      const P = w3HmScan(A); if (!P.length) return;
      let live = 0; for (const z of P) if (z.c10hob) live++;
      let n = 0;
      for (const t of c10Zones(B, z => z.trail && !z.c10)) {
        if (n >= 6 || live >= 40 || G.zones.length > 190) break;
        if (!P.some(z => Math.hypot(z.x - t.x, z.y - t.y) < z.r + t.r * 0.5)) continue;
        const z = w3HmPatch(A, t.x, t.y, Math.max(26, t.r * 1.2), A.s.dur * 0.5, 0.6, { c10hob: 1 });
        if (!z) break;
        t.life = 0; n++; live++; c10Count(c);
      }
      if (n) c10Say(c, 'h', G.player.x, G.player.y - 30, 'FOUR-RING HOB', C10_FIRE, 3);
    },
  },
  c10_gossip: {
    tick(c, A, B, dt) {
      const p = G.player, sp = Math.min(1, Math.hypot(p.vx || 0, p.vy || 0) / 200);
      for (const z of G.zones) {
        if (z.c10 || !z.src || !z.src.w3fp || z.src.w !== A || z.life <= 0) continue;
        z.c10 = 1;
        if (G.zones.length > 200) continue;
        const t = wakeZone(B, z.x, z.y); t.c10 = 1; t.life = t.max = 1.5; t.dps *= 0.5 + sp;
        G.zones.push(t); c10Count(c);
        c10Say(c, 'w', z.x, z.y - 14, 'WORD GETS AROUND', C10_FIRE, 3);
      }
    },
  },
  c10_fatchance: {
    hit(c, A, B, e, src) { if (src.w === B) e.c10fl = G.t + 1; },
    tick(c, A, B, dt) {
      const st = c10St(c); if (st.cd > G.t) return;
      const orbs = G.proj.filter(pr => pr.style === 'void' && !pr.dead && pr.w === A && pr.aura);
      if (!orbs.length) return;
      for (const e of G.enemies) {
        if (!(e.c10fl > G.t) || !(e.elite || e.r >= 18) || !c10Live(e)) continue;
        const o = orbs.find(o => Math.hypot(o.x - e.x, o.y - e.y) < o.aura);
        if (!o) continue;
        st.cd = G.t + 6; o.mass = Math.max(o.mass || 1, 10 + e.r / 3);
        floatText(o.x, o.y - 30, 'FAT CHANCE', A.def.color, 16, 0.9); c10Count(c);
        voidSupernova(o); return;
      }
    },
  },
  c10_cradle: {
    tick(c, A, B, dt) {
      const st = c10St(c), cd = st.cd || (st.cd = new Map());
      st.win = (st.win || 0) - dt; if (st.win <= 0) { st.win = 0.25; st.n = 0; }
      for (const o of G.proj) {
        if (o.style !== 'void' || o.dead || o.w !== A || !o.aura) continue;
        const ins = []; forNear(o.x, o.y, o.aura, e => { if (c10Live(e) && ins.length < 12) ins.push(e); return false; });
        for (let i = 0; i < ins.length; i++) for (let j = i + 1; j < ins.length; j++) {
          if (st.n >= 8) return;
          const a = ins[i], b = ins[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
          if (d > a.r + b.r + 2) continue;
          const key = Math.min(a.id, b.id) + ':' + Math.max(a.id, b.id); if (cd.get(key) > G.t) continue;
          cd.set(key, G.t + 0.35); st.n++;
          const ux = dx / d, uy = dy / d;
          if (!a.boss) { a.kx -= ux * 160; a.ky -= uy * 160; } if (!b.boss) { b.kx += ux * 160; b.ky += uy * 160; }
          c10Hit(a, B.s.dmg * 0.4, B, c, { atk: 'contact' }); c10Hit(b, B.s.dmg * 0.4, B, c, { atk: 'contact' });
          ring((a.x + b.x) / 2, (a.y + b.y) / 2, 14, '#ffffff', 0.2, 3); c10Say(c, 'k', (a.x + b.x) / 2, (a.y + b.y) / 2 - 12, 'CLACK', B.def.color, 0.6);
        }
      }
      if (cd.size > 200) cd.clear();
    },
  },
  c10_foodcoma: {
    tick(c, A, B, dt) {
      if (!G.armBowl) return;
      const orbs = G.proj.filter(pr => pr.style === 'void' && !pr.dead && pr.w === A && pr.aura);
      for (const b of G.armBowl) {
        if (b.w !== B || !b.hit) continue;
        const n = b.hit.size, d = n - (b.c10n == null ? n : b.c10n); b.c10n = n;
        if (d <= 0 || !(b.until > G.t)) continue;
        const o = orbs.find(o => Math.hypot(o.x - b.e.x, o.y - b.e.y) < o.aura);
        if (!o) continue;
        if (o.c10r0 == null) o.c10r0 = o.r;
        o.mass = (o.mass || 1) + 0.5 * d; o.r = Math.min(o.c10r0 * 2, o.r * 1.03); c10Count(c);
        ring(o.x, o.y, o.r + 6, A.def.color, 0.3, 3); c10Say(c, 'f', o.x, o.y - o.r - 12, 'NOM', A.def.color, 0.8);
        if (o.mass >= VOID_MERGE.supernova && G.t >= (G.novaT || 0)) { G.novaT = G.t + VOID_MERGE.gap; floatText(o.x, o.y - 30, 'FOOD COMA', A.def.color, 16, 0.9); voidSupernova(o); }
      }
    },
  },
  c10_gargle: {
    phit(c, A, B, pr, e) {
      if (pr.w !== B) return;
      if (pr.c10acid) { if (c10Live(e)) { w3BarFrac(e, 'acid', 0.3, A); ring(e.x, e.y, e.r + 4, C10_PINK, 0.3, 2); c10Count(c); } return; }
      if (corroded(e)) { pr.c10acid = 1; pr.color = C10_PINK; c10Say(c, 'g', e.x, e.y - e.r - 12, 'GARGLE', C10_PINK, 1); }
    },
  },
  c10_offender: {
    hit(c, A, B, e, src, r) {
      if (src.w !== A || src.wupEcho || r < 0) return;
      const D = c10St(c).drops || (c10St(c).drops = []); D.push({ x: e.x, y: e.y, t: G.t + 3 }); if (D.length > 12) D.shift();
    },
    tick(c, A, B, dt) {
      const st = c10St(c), D = st.drops || (st.drops = []);
      for (let i = D.length - 1; i >= 0; i--) if (D[i].t < G.t) D.splice(i, 1);
      if (Math.random() < dt * 4) for (const d of D) ring(d.x, d.y, 5, C10_PINK, 0.25, 2);
      for (const pr of G.proj) {
        if (pr.w !== B || !pr.back || pr.dead) continue;
        for (let i = D.length - 1; i >= 0; i--) if ((pr.c10d || 0) < 6 && Math.hypot(D[i].x - pr.x, D[i].y - pr.y) < 30) { pr.c10d = (pr.c10d || 0) + 1; fxParts('bubble', D[i].x, D[i].y, C10_PINK, 3, 40, 0.3, 2); D.splice(i, 1); }
      }
    },
    phit(c, A, B, pr, e) {
      if (pr.w !== B || !(pr.c10d > 0)) return;
      const ts = acquireMany('nearest', 90, e.x, e.y, pr.c10d).filter(c10Live); if (c10Live(e) && !ts.includes(e)) ts.unshift(e);
      for (const o of ts.slice(0, pr.c10d)) { c10Hit(o, A.s.dmg * 0.3, A, c); w3BarFrac(o, 'acid', 0.15, A); bolt(e.x, e.y, o.x, o.y, C10_PINK, 0.15); }
      pr.c10d = 0; floatText(e.x, e.y - e.r - 14, 'REPEAT OFFENDER', C10_PINK, 13, 0.7);
    },
  },
  c10_review: {
    hit(c, A, B, e, src, r) { if (src.w === A && r >= 0) e.c10asT = G.t + 4; },
    kill(c, A, B, e) {
      if (!(e.w3hm > G.t) || !(e.c10asT > G.t)) return;
      const x = e.x, y = e.y;
      after(0.05, () => {
        if (!G || !A.s) return;
        IN_AOE = true; try { forNear(x, y, 140, o => { if (c10Live(o)) { c10Hit(o, A.s.dmg * 0.3, A, c, { atk: 'burst' }); w3BarFrac(o, 'acid', 0.35, A); } return false; }); } finally { IN_AOE = false; }
        ring(x, y, 140, C10_PINK, 0.4, 4); floatText(x, y - 20, 'POSTHUMOUS REVIEW', C10_PINK, 13, 0.8);
      });
    },
  },
  c10_domino: {
    tick(c, A, B, dt) {
      const st = c10St(c);
      if (st.secT < G.t) { st.secT = G.t + 1; st.n = 0; }
      for (const bl of c10PbBlasts()) {
        if (bl.dom) continue; bl.dom = 1;
        let n = 0;
        for (const m of c10Mines(A)) if (n < 4 && Math.hypot(m.x - bl.x, m.y - bl.y) < B.s.area + 60) { m.dead = true; n++; after(0.06 * n, () => { if (G && A.s) detonateMine(m); }); c10Count(c); }
        if (n) c10Say(c, 'd', bl.x, bl.y - 24, 'DOMINO DAY', B.def.color, 1.5);
      }
    },
    kill(c, A, B, e, src) {
      if (!src || src.w !== A) return;
      const st = c10St(c); if ((st.n || 0) >= 6) return; st.n = (st.n || 0) + 1;
      const x = e.x, y = e.y, R = B.s.area * 0.4;
      after(0.1, () => {
        if (!G || !B.s) return;
        IN_AOE = true; try { forNear(x, y, R, o => { if (c10Live(o)) c10Hit(o, B.s.dmg * 0.5, B, c, { atk: 'burst' }); return false; }); } finally { IN_AOE = false; }
        ring(x, y, R, B.def.color, 0.3, 3); fxParts('spark', x, y, B.def.color, 5, R * 4, 0.25, 2);
        for (const m of c10Mines(A)) if (Math.hypot(m.x - x, m.y - y) < R) { m.dead = true; after(0.06, () => { if (G && A.s) detonateMine(m); }); break; }
      });
    },
  },
  c10_landing: {
    hit(c, A, B, e, src) { if (src.w === B && src.kx != null) e.c10fly = G.t + 1.2; },
    tick(c, A, B, dt) {
      const ms = c10Mines(A); if (!ms.length) return;
      for (const e of G.enemies) {
        if (!(e.c10fly > G.t) || !c10Live(e)) continue;
        const m = ms.find(m => !m.dead && Math.hypot(m.x - e.x, m.y - e.y) < 90);
        if (!m) continue;
        m.dead = true; m.charge = 1.5; e.c10fly = 0; c10Count(c);
        after(0.05, () => { if (G && A.s) detonateMine(m); });
        c10Say(c, 'l', m.x, m.y - 20, 'HARD LANDING', A.def.color, 1.5);
      }
    },
  },
  c10_firebreak: {
    tick(c, A, B, dt) {
      for (const bl of c10PbBlasts()) {
        if (bl.fb) continue; bl.fb = 1;
        const R = B.s.area; let n = 0;
        for (const z of c10Zones(A, z => z.src.zoneHit && !z.c10fb)) {
          if (n >= 3 || G.zones.length > 195 || Math.hypot(z.x - bl.x, z.y - bl.y) > R) continue;
          const a0 = Math.atan2(z.y - bl.y, z.x - bl.x) || rand(0, TAU);
          for (const da of [0, -0.35, 0.35]) {
            const q = da ? Object.assign({}, z) : z;
            q.x = bl.x + Math.cos(a0 + da) * R * 0.9; q.y = bl.y + Math.sin(a0 + da) * R * 0.9; q.life = q.max; q.c10fb = 1;
            if (da) G.zones.push(q);
          }
          n++; c10Count(c);
        }
        if (n) { ring(bl.x, bl.y, R, C10_FIRE, 0.4, 5); c10Say(c, 'f', bl.x, bl.y - 24, 'FIRE BREAK', C10_FIRE, 1.5); }
      }
    },
  },
  c10_noyou: {
    tick(c, A, B, dt) {
      const k = G.peek, p = G.player;
      if (k && k.t > G.t && k.w === B) {
        A.cd = Math.max(A.cd, 0.1); // (it holds its fire while you are hidden)
        const q = A.q || (A.q = []);
        for (const b of G.ebul) if (!b.dead && q.length < 25 && Math.hypot(b.x - p.x, b.y - p.y) < p.r + 14) { b.dead = true; q.push(siphonStrength(b)); A.stored = q.length; c10Count(c); fxParts('spark', b.x, b.y, A.def.color, 2, 40, 0.2, 2); }
      }
      if (k && k.boo && !k.c10noyou && k.w === B) {
        k.c10noyou = 1;
        const q = A.q || []; if (!q.length) return;
        const ks = q.splice(0); A.stored = 0; c10Count(c);
        const ts = acquireMany('nearest', A.s.range, p.x, p.y, 8).filter(c10Live);
        ks.forEach((m, i) => after(i * 0.03, () => { if (!G || !A.s) return; const q2 = G.player, t = ts[i % Math.max(1, ts.length)], a = t ? Math.atan2(t.y - q2.y, t.x - q2.x) : rand(0, TAU); c10Shoot(A, c, q2.x, q2.y, a + rand(-0.08, 0.08), null, m); }));
        floatText(p.x, p.y - 40, 'THERE IS NO YOU', A.def.color, 15, 0.9);
      }
    },
  },
  c10_party: {
    tick(c, A, B, dt) {
      const k = G.peek, p = G.player;
      if (k && k.t > G.t && k.w === B) A.cd = Math.max(A.cd, 0.1); // (it holds its fire while you are hidden)
      if (!k || !k.boo || k.c10party || k.w !== B) return;
      k.c10party = 1;
      const q = A.q || []; if (!q.length) return;
      const ks = q.splice(0); A.stored = 0; c10Count(c);
      ks.forEach((m, i) => after(i * 0.03, () => {
        if (!G || !A.s) return;
        const q2 = G.player, tx = k.x + rand(-30, 30), ty = k.y + rand(-30, 30), d = Math.max(40, Math.hypot(tx - q2.x, ty - q2.y)), a = Math.atan2(ty - q2.y, tx - q2.x);
        c10Shoot(A, c, q2.x, q2.y, a, { speed: 600, vx: Math.cos(a) * 600, vy: Math.sin(a) * 600, life: d / 600, explode: 60, pierce: 99 }, m);
      }));
      floatText(k.x, k.y - 30, 'SURPRISE', A.def.color, 16, 0.9);
    },
  },
  c10_blanket: {
    tick(c, A, B, dt) {
      let n = 0;
      for (const e of G.enemies) {
        if (!(e.fearT > G.t) || e.dead) { e.c10fear = 0; continue; }
        if (e.c10fear) continue;
        e.c10fear = 1; if (siphonStore(A, 1)) n++; if (siphonStore(A, 1)) n++;
      }
      for (const b of G.ebul) {
        if (b.dead || b.c10seen || !b.owner || !(b.owner.fearT > G.t)) continue;
        b.c10seen = 1; if (siphonStore(A, siphonStrength(b))) { b.dead = true; n++; fxParts('spark', b.x, b.y, A.def.color, 2, 40, 0.2, 2); }
      }
      if (n) { for (let i = 0; i < n; i++) c10Count(c); c10Say(c, 'b', G.player.x, G.player.y - 30, 'DROPPED IT', A.def.color, 2); }
    },
  },
  c10_reunion: {
    fire(c, A, B, w) { if (w === A) c10St(c).fireT = G.t; },
    hit(c, A, B, e, src, r) { if (src.w === A && r >= 0) { const st = c10St(c), H = st.hits || (st.hits = []); if (H.length < 12 && !H.includes(e)) H.push(e); } },
    tick(c, A, B, dt) {
      const st = c10St(c);
      if (st.secT < G.t) { st.secT = G.t + 1; st.n = 0; }
      if (!st.hits || !st.hits.length || G.t < (st.fireT || 0) + 0.35) return;
      const e = st.hits[st.hits.length - 1]; st.hits = [];
      if ((st.n || 0) >= 4) return; st.n = (st.n || 0) + 1;
      const o = acquire('nearest', 380, e.x, e.y, e), a = o ? Math.atan2(o.y - e.y, o.x - e.x) : rand(0, TAU);
      const pr = c10Shoot(B, c, e.x, e.y, a, { homing: 8 });
      if (pr && o) pr.tgt = o;
      ring(e.x, e.y, e.r + 8, B.def.color, 0.3, 3); c10Count(c); c10Say(c, 'r', e.x, e.y - e.r - 12, 'FAMILY REUNION', B.def.color, 2);
    },
  },
  c10_pet: {
    tick(c, A, B, dt) {
      const st = c10St(c); st.zt = (st.zt || 0) - dt; if (st.zt > 0) return; st.zt = 0.1;
      for (const pr of G.proj) {
        if (pr.w !== B || pr.dead || !pr.homing || (pr.tgt && c10Live(pr.tgt) && charged(pr.tgt))) continue;
        let best = null, bd = 320 * 320;
        forNear(pr.x, pr.y, 320, (e, d2) => { if (c10Live(e) && charged(e) && d2 < bd) { bd = d2; best = e; } return false; });
        if (best) { pr.tgt = best; c10Count(c); c10Say(c, 'p', best.x, best.y - best.r - 12, 'TEACHER\'S PET', B.def.color, 2.5); }
      }
    },
  },
  c10_sibstatic: {
    tick(c, A, B, dt) {
      const st = c10St(c); st.zt = (st.zt || 0) - dt; if (st.zt > 0) return; st.zt = 0.3;
      const by = new Map();
      for (const pr of G.proj) if (pr.w === B && !pr.dead && pr.tgt && c10Live(pr.tgt) && charged(pr.tgt) && Math.hypot(pr.x - pr.tgt.x, pr.y - pr.tgt.y) < 200) { const l = by.get(pr.tgt) || []; l.push(pr); by.set(pr.tgt, l); }
      for (const [e, l] of by) {
        if (l.length < 2 || e.c10ss > G.t) continue;
        e.c10ss = G.t + 0.5;
        bolt(l[0].x, l[0].y, e.x, e.y, C10_YEL, 0.15); bolt(e.x, e.y, l[1].x, l[1].y, C10_YEL, 0.15);
        c10Hit(e, A.s.dmg * 0.6, A, c, { atk: 'beam' });
        const o = acquire('nearest', 110, e.x, e.y, e);
        if (o) { bolt(e.x, e.y, o.x, o.y, C10_YEL, 0.15); c10Hit(o, A.s.dmg * 0.3, A, c, { atk: 'beam' }); }
        c10Say(c, 's', e.x, e.y - e.r - 12, 'SIBLING STATIC', C10_YEL, 2);
      }
    },
  },
  c10_snotbub: {
    pop(c, A, B, b) {
      if (b.w !== A) return;
      const S = c10St(c).str || (c10St(c).str = []);
      const traps = c10Zones(B).map(z => [z, Math.hypot(z.x - b.x, z.y - b.y)]).filter(q => q[1] < 260).sort((p, q) => p[1] - q[1]).slice(0, 2);
      for (const [z] of traps) { S.push({ x1: b.x, y1: b.y, x2: z.x, y2: z.y, t: 3, zt: 0 }); if (S.length > 8) S.shift(); c10Count(c); }
      if (traps.length) c10Say(c, 's', b.x, b.y - 16, 'SNOT BUBBLES', C10_GRN, 1.5);
    },
    tick(c, A, B, dt) {
      const S = c10St(c).str || [];
      for (let i = S.length - 1; i >= 0; i--) {
        const s = S[i]; s.t -= dt; s.zt -= dt;
        if (s.t <= 0) { S.splice(i, 1); continue; }
        w2Line(s.x1, s.y1, s.x2, s.y2, 2.5, C10_GRN, 0.05);
        if (s.zt > 0) continue; s.zt = 0.4;
        for (const e of G.enemies) if (c10Live(e) && !(e.c10sb > G.t) && c10Seg(e.x, e.y, s.x1, s.y1, s.x2, s.y2) <= e.r + 6) { e.c10sb = G.t + 0.8; c10Hit(e, B.s.dmg * 0.4, B, c, { atk: 'pool' }); }
      }
    },
  },
  c10_clingfilm: {
    tick(c, A, B, dt) {
      const st = c10St(c); st.zt = (st.zt || 0) - dt; if (st.zt > 0) return; st.zt = 0.2;
      const zs = c10Zones(B); if (!zs.length) return;
      const T = TOYS();
      for (const e of G.enemies) {
        if (!c10Live(e) || e.boss) continue;
        const inside = zs.some(z => Math.hypot(z.x - e.x, z.y - e.y) < z.r);
        if (!inside) { e.c10inT = 0; continue; }
        e.c10inT = (e.c10inT || 0) + 0.2;
        if (e.c10inT < 1.5 || e.bubT > G.t || e.c10cf > G.t || !toyCan(e) || T.bubbles.length >= 40) continue;
        e.c10cf = G.t + 5;
        T.bubbles.push({ x: e.x, y: e.y, vx: 0, vy: 0, r: e.r + 12, life: A.s.dur, w: A, e, seed: Math.random() * 10, heldAt: G.t, film: (A.s.film || 0) * A.s.dmg, soaked: 0 });
        e.bubT = G.t + A.s.dur; e.kx = 0; e.ky = 0; c10Count(c);
        c10Say(c, 'c', e.x, e.y - e.r - 14, 'CLING FILM', A.def.color, 1.5);
      }
    },
  },
  c10_boil: {
    tick(c, A, B, dt) {
      const zs = c10Zones(B); if (!zs.length) return;
      for (const b of TOYS().bubbles) {
        if (b.dead || b.w !== A) continue;
        if (!zs.some(z => Math.hypot(z.x - b.x, z.y - b.y) < z.r)) continue;
        if (b.c10r0 == null) { b.c10r0 = b.r; c10Count(c); }
        b.r = Math.min(b.c10r0 * 1.5, b.r + 30 * dt); b.c10boil = 1; // (a fuller bubble pops wider: toys.js bubblePop)
      }
      for (const b of TOYS().bubbles) {
        if (b.dead || !b.c10boil || b.e || !A.s) continue;
        let got = null; forNear(b.x, b.y, b.r, e => { if (c10Live(e) && !e.boss && !(e.bubT > G.t) && toyCan(e)) { got = e; return true; } return false; });
        if (!got) continue;
        b.e = got; got.bubT = G.t + A.s.dur; b.heldAt = G.t; b.life = A.s.dur; b.r = got.r + 12; b.x = got.x; b.y = got.y; b.film = (A.s.film || 0) * A.s.dmg; b.soaked = 0; got.kx = 0; got.ky = 0;
        c10Count(c); c10Say(c, 'b', got.x, got.y - got.r - 14, 'ROLLING BOIL', A.def.color, 1.5);
      }
    },
  },
  c10_egghunt: {
    tick(c, A, B, dt) {
      const eggs = TOYS().teeth.filter(t => !t.dead && t.w === A);
      for (const t of G.turrets) {
        if (t.w !== B || !(t.life > 0)) { if (t.c10egg) { t.c10egg.c10c = null; t.c10egg = null; } continue; }
        let g = t.c10egg;
        if (g && (g.dead || g.c10c !== t)) g = t.c10egg = null;
        if (!g) {
          g = eggs.find(q => !q.c10c && !q.c10drop && Math.hypot(q.x - t.x, q.y - t.y) < 160);
          if (!g) continue;
          t.c10egg = g; g.c10c = t; c10Count(c); c10Say(c, 'e', t.x, t.y - 20, 'EGG HUNT', A.def.color, 2);
        }
        const k = acquire('cluster', 400, t.x, t.y);
        if (!k || Math.hypot(k.x - t.x, k.y - t.y) < 50) { g.c10c = null; g.c10drop = 1; t.c10egg = null; continue; }
        const dx = k.x - t.x, dy = k.y - t.y, d = Math.hypot(dx, dy) || 1, nx = t.x + dx / d * 130 * dt, ny = t.y + dy / d * 130 * dt;
        if (!(G.lvl && lvSolidAt(nx, ny))) { t.x = nx; t.y = ny; }
        g.x = t.x; g.y = t.y + 6; g.end = Math.max(g.end, G.t + 1);
      }
    },
  },
  c10_scrambled: {
    tick(c, A, B, dt) {
      const eggs = TOYS().teeth.filter(t => !t.dead && t.w === A);
      if (!eggs.length) return;
      for (const t of G.turrets) {
        if (t.w !== B || !(t.life > 0) || (t.w6 && t.w6.popped)) continue;
        let g = null, gd = 400;
        for (const q of eggs) { const d = Math.hypot(q.x - t.x, q.y - t.y); if (d < gd) { gd = d; g = q; } }
        if (!g) continue;
        if (gd > 30) { const nx = t.x + (g.x - t.x) / gd * 150 * dt, ny = t.y + (g.y - t.y) / gd * 150 * dt; if (!(G.lvl && lvSolidAt(nx, ny))) { t.x = nx; t.y = ny; } }
        let greedy = null; forNear(g.x, g.y, 70, e => { if (c10Live(e)) { greedy = e; return true; } return false; });
        if (!greedy || gd > 70) continue;
        IN_AOE = true; try { forNear(t.x, t.y, 70, o => { if (c10Live(o)) c10Hit(o, B.s.dmg * 1.2, B, c, { atk: 'burst' }); return false; }); } finally { IN_AOE = false; }
        ring(t.x, t.y, 70, B.def.color, 0.35, 4); fxParts('smoke', t.x, t.y, '#e8e0ff', 6, 60, 0.6, 5);
        if (t.w6) t.w6.popped = true; t.life = 0;
        c10Say(c, 's', t.x, t.y - 24, 'SCRAMBLED', B.def.color, 1.5);
      }
    },
  },
  c10_hatch: {
    taken(c, A, B, t) { const st = c10St(c); if (t.w === A && !t.c10h && !(st.cd > G.t)) { st.cd = G.t + 4; t.c10h = 1; c10Hatch(c, B, t.x, t.y); } },
    tick(c, A, B, dt) {
      for (const t of TOYS().teeth) {
        if (t.dead || t.w !== A || t.c10h) continue;
        if (G.t - t.born < Math.min(2.5, (t.end - t.born) - 0.2)) continue;
        t.c10h = 1;
        if (G.turrets.length >= 24) continue;
        t.dead = true; c10Hatch(c, B, t.x, t.y);
      }
    },
  },
};

function c10Hatch(c, B, x, y) {
  if (G.turrets.length >= 24) return;
  G.turrets.push({ x, y, life: 12, max: 12, cd: 0.3, rate: 0.35, dmg: B.s.dmg * 1.2, range: 320, w: B, src: { elem: B.def.elem, wname: 'Hatchling', crit: G.P.crit }, face: 0, color: B.def.color });
  ring(x, y, 30, B.def.color, 0.4, 4); fxParts('smoke', x, y, '#e8e0ff', 6, 50, 0.6, 4);
  floatText(x, y - 20, 'HATCHED', B.def.color, 13, 0.8); c10Count(c);
}

// ---------------------------------------------------------------- dispatch
function c10Each(kind, fn) {
  for (const c of c10Fused()) {
    const F = C10_FX[c.id]; if (!F || !F[kind]) continue;
    const A = owned(c.a), B = owned(c.b); if (!A || !B || !A.s || !B.s) continue;
    try { fn(F[kind], c, A, B); } catch (err) { const E = G.c10err || (G.c10err = []); if (E.length < 20) E.push(c.id + ' ' + kind + ': ' + err.message); }
  }
}
(function c10Wrap() {
  const fh = fightHit;
  fightHit = function (e, d, src, crit) {
    const r = fh(e, d, src, crit);
    if (G && G.combo && src && src.w && !src.c10 && !src.dot) {
      if (src.w.id === 'v_phys_burst' && src.kx != null && r >= 0) { // a Panic Button blast hit: note its centre
        const L = c10PbBlasts(), x = e.x - src.kx, y = e.y - src.ky;
        if (!L.some(b => Math.hypot(b.x - x, b.y - y) < 8)) L.push({ x, y, t: G.t });
      }
      c10Each('hit', (f, c, A, B) => f(c, A, B, e, src, r));
    }
    return r;
  };
  const ke = killEnemy;
  killEnemy = function (e, src) {
    const was = e && !e.dead, r = ke(e, src);
    if (was && e.dead && G && G.combo) c10Each('kill', (f, c, A, B) => f(c, A, B, e, src || {}));
    return r;
  };
  const ph = projHit;
  projHit = function (pr, e) {
    ph(pr, e);
    if (G && G.combo && pr && pr.w && !(pr.src && pr.src.c10)) c10Each('phit', (f, c, A, B) => f(c, A, B, pr, e));
  };
  const cf = comboFire;
  comboFire = function (w, target) { cf(w, target); if (G && G.combo && w) c10Each('fire', (f, c, A, B) => f(c, A, B, w, target)); };
  const ct = comboTick;
  comboTick = function (dt) { ct(dt); if (G && G.combo) c10Each('tick', (f, c, A, B) => f(c, A, B, dt)); };
  const dm = wupDmgMul;
  wupDmgMul = function (e, src) {
    let k = dm(e, src);
    if (G && G.combo && src && src.w && !src.dot && !src.c10) c10Each('mul', (f, c, A, B) => { k *= f(c, A, B, e, src) || 1; });
    return k;
  };
  const tt = toothTaken;
  toothTaken = function (t, e) { const r = tt(t, e); if (G && G.combo) c10Each('taken', (f, c, A, B) => f(c, A, B, t, e)); return r; };
  const bp = bubblePop;
  bubblePop = function (b, throwA, fling) {
    const full = b && !b.dead && bubIn(b).length > 0, r = bp(b, throwA, fling);
    if (full && G && G.combo) c10Each('pop', (f, c, A, B) => f(c, A, B, b));
    return r;
  };
  // Offer a branch combo only when both promises match.
  const ac = availableCombos;
  availableCombos = function () { return ac().filter(c => !c.pa || c10Ready(c)); };
  // The Lv 3 promise cards say which of your weapons they fuse with (and mark the one that completes a combo).
  const wf = wupForkCards;
  wupForkCards = function (req) {
    const cards = wf(req);
    if (!cards || !req || req.lv !== 3 || !req.w || !G) return cards;
    const w = req.w, S = WUP[w24Key(w)];
    for (const card of cards) {
      const k = ['A', 'B', 'C'].find(k => S && S[k] && S[k].name === card.title); if (!k) continue;
      for (const c of C10) {
        const mine = c.a === w.id ? 'a' : c.b === w.id ? 'b' : null; if (!mine) continue;
        const need = mine === 'a' ? c.pa : c.pb, oid = mine === 'a' ? c.b : c.a, onP = mine === 'a' ? c.pb : c.pa, o = owned(oid);
        if (need !== k || !o) continue;
        const op = c10Promise(o);
        if (op && op !== onP) continue;
        card.desc += ` Fuses with your ${o.def.name}${op ? '' : ` if it takes ${c10Prom(oid, onP)}`}: ${c.name}.`;
        if (op === onP) card.c10 = true;
      }
    }
    return cards;
  };
  // The weapon draft: one card is a combo partner of a weapon you hold (any attack type).
  const vl = v10Loot;
  v10Loot = function (req) {
    const opts = vl(req);
    if (!req || req.kind !== 'slot' || !Array.isArray(opts) || !opts.length || !G || (typeof sbOn === 'function' && sbOn())) return opts;
    try {
      const own = G.weapons.filter(Boolean), ownIds = new Set(own.map(w => w.id)), pool = v10Pool();
      const partners = [];
      for (const c of wl_combos()) {
        if (G.combo && G.combo[c.id]) continue;
        for (const [x, y] of [[c.a, c.b], [c.b, c.a]]) if (ownIds.has(x) && !ownIds.has(y)) { const pid = pool.find(id => wl_old(id) === y); if (pid && !partners.includes(pid)) partners.push(pid); }
      }
      if (!partners.length) return opts;
      const have = opts.find(o => o.def && partners.includes(W24_IDS.find(id => WEAPONS[id] === o.def)));
      if (have) { have.c10 = true; return opts; }
      const pid = pick(partners), o = optNewWeapon(pid, 0); o.c10 = true;
      opts[Math.floor(Math.random() * opts.length)] = o;
    } catch (err) { const E = G.c10err || (G.c10err = []); if (E.length < 20) E.push('slot: ' + err.message); }
    return opts;
  };
  // Autorun takes a card that completes a combo (a partner weapon, or the promise that matches).
  const at = UI.autoTick;
  UI.autoTick = function () {
    if (SET.auto && G && G.state === 'loot' && !FUSION.req) {
      const now = performance.now();
      if (now - UI.lootOpenT >= 1100 && now - (UI.autoAt || 0) >= 700) {
        const i = (UI.lootOpts || []).findIndex(o => o && !o.taken && o.c10);
        if (i >= 0) { UI.autoAt = now; UI.pickLoot(i); return; }
      }
    }
    return at.apply(this, arguments);
  };
})();
// Branch combos name their promises in the Field Guide and Tackle Box.
for (const c of C10) c.desc = c.desc + ` Needs ${c10Need(c)}.`;
