'use strict';
// Spawn Prawn - targeting and autorun as sperm passives (user, 23 Oct).
//  - TARGETING starts with Nearest, Furthest, Densest cluster and Elites & bosses. ADVANCED TARGETING (a sperm passive)
//    adds Toughest and Fastest (Lv 1), Lowest health and Shooters first (Lv 2), and the rest (Lv 3). Mastery: each
//    weapon with a second rule ("Then") alternates its shots between the two rules, so shots go to different targets.
//  - AUTORUN starts with Kite and Hold (Hold is also what you get while steering by hand). AUTOPILOT (a sperm passive)
//    adds Collect (Lv 1), Orbit (Lv 2), Hunt and Nest (Lv 3). Mastery: a new mode, AUTO, that picks the mode for you
//    from moment to moment (Kite while a boss is alive or you are hurt, Collect when it is safe, Hunt an elite when
//    you are healthy, Orbit a big crowd).
//  - KEEPING: win a run holding one of them and you keep all its levels for good (META.spKeep.aim / .auto); holding both,
//    the end screen lets you pick one. A kept passive's card is gone; only its mastery card stays, from run Lv 10, and it uses no slot.
//  Tests and sims (window.TUT_OFF) and the School level get every option unless STEER.force.
// HOLD: no autorun movement at all (game.js autoSteer wrapped).
// Hooks: autorun.js aimList (reassigned; ui.js and loadout.js aim menus read it), moveModes, arMode, aimDir (wrapped); game.js autoSteer;
// weapons24.js wupTick (clamps rules no longer on offer); ui.js UI.showGameOver (wrapped: the keep choice).
// Save data: META.spKeep = { aim: 1, auto: 1 }. Loads after spfull.js.

const STEER = {
  aimBase: ['nearest', 'furthest', 'cluster', 'elite'],
  aimLv: [['strongest', 'fastest'], ['lowhp', 'shooters'], null], // (Lv 3: every other rule)
  moveBase: ['kite', 'hold'],
  moveLv: [['collect'], ['orbit'], ['hunt', 'defend']],
  masteryLv: 10, force: false,
};
MOVE_DIRECTIVES.push({ id: 'auto', name: 'AUTO', desc: 'Picks the best mode for the moment: kites when in danger, collects when safe, hunts elites when healthy' });
const steerOn = () => !(typeof window !== 'undefined' && window.TUT_OFF && !STEER.force) && !(G && G.lvl && G.lvl.L && G.lvl.L.school); // (the School teaches every mode)
const steerKept = k => !!(META.spKeep && META.spKeep[k]);
const steerRank = (id, k) => (steerKept(k) ? 3 : Math.min(3, mr(id)));
const steerMast = (id, k) => mr(id) >= 4 || !!(G && G.spMx && G.spMx[id + 'M']);
function aimAllowed(dir) {
  if (!steerOn() || !G) return true;
  const r = steerRank('sp_aim', 'aim');
  return STEER.aimBase.includes(dir) || r >= 3 || STEER.aimLv.slice(0, r).some(l => l && l.includes(dir));
}
function moveAllowed(id) {
  if (id === 'auto') return !!G && steerMast('sp_auto', 'auto');
  if (!steerOn() || !G) return true;
  const r = steerRank('sp_auto', 'auto');
  return STEER.moveBase.includes(id) || STEER.moveLv.slice(0, r).some(l => l.includes(id));
}
aimList = () => DIRECTIVES.filter(d => aimAllowed(d.id));
moveModes = (orig => function () { return orig().filter(m => moveAllowed(m.id)); })(moveModes);

// ---------------------------------------------------------------- cards
mutCard({ id: 'sp_aim', title: 'Advanced Targeting', icon: 'AT', rarity: 1, maxRank: 3, family: 'mut:rules', flavour: 'More ways to choose.',
  desc: 'Adds more targeting rules to every weapon\'s aim menu.', why: () => steerKept('aim') ? 'kept' : '' });
mutCard({ id: 'sp_auto', title: 'Autopilot', icon: 'AP', rarity: 1, maxRank: 3, family: 'mut:rules', flavour: 'More ways to swim.',
  desc: 'Adds more autorun modes.', why: () => steerKept('auto') ? 'kept' : '' });
mutCard({ id: 'sp_aimM', title: 'Advanced Targeting Mastery', icon: 'AT', rarity: 3, maxRank: 1, family: 'mut:rules', flavour: 'Two rules, every other shot.',
  desc: 'A weapon with a second targeting rule alternates its shots between the two.', why: () => steerKept('aim') && G.level >= STEER.masteryLv && spMasteryRoom('sperm') ? '' : 'not yet' });
mutCard({ id: 'sp_autoM', title: 'Autopilot Mastery', icon: 'AP', rarity: 3, maxRank: 1, family: 'mut:rules', flavour: 'It drives itself.',
  desc: 'Adds the AUTO mode: autorun picks the best mode for the moment.', why: () => steerKept('auto') && G.level >= STEER.masteryLv && spMasteryRoom('sperm') ? '' : 'not yet' });
for (const id of ['sp_aim', 'sp_auto']) { // a 4th rank: the mastery, one a build, from run Lv 10 like the kept one
  const c = MUT_REG.find(x => x.id === id), el = c.eligible, ap = c.apply;
  c.maxRank = 4; c.eligible = G => el(G) && (mr(id) < 3 || (spMasteryRoom('sperm') && G.level >= STEER.masteryLv));
  c.apply = (G, t) => { const r0 = mr(id); ap(G, t); if (r0 === 3 && mr(id) === 4) (G.spM || (G.spM = [])).push(id); };
}
for (const id of ['sp_aimM', 'sp_autoM']) { // (a kept passive's mastery uses no slot: user, 23 Oct)
  const c = MUT_REG.find(x => x.id === id);
  c.rank = () => (G && G.spMx && G.spMx[id] ? 1 : 0);
  c.apply = G => { (G.spMx || (G.spMx = {}))[id] = 1; (G.spM || (G.spM = [])).push(id); };
}
SP_KEEP.push('sp_aim', 'sp_auto', 'sp_aimM', 'sp_autoM');
for (const id of ['sp_aim', 'sp_auto', 'sp_aimM', 'sp_autoM']) { const i = SP.cut.indexOf(id); if (i >= 0) SP.cut.splice(i, 1); }
if (typeof SLICE !== 'undefined') SLICE.muts.push('sp_aim', 'sp_auto', 'sp_aimM', 'sp_autoM');

// ---------------------------------------------------------------- Advanced Targeting mastery: alternate the two rules
aimDir = (orig => function (w) {
  if (!G || !w.dir2 || w.dir2 === w.dir || !steerMast('sp_aim', 'aim')) return orig(w);
  w.spAltN = (w.spAltN || 0) + 1;
  return w.spAltN % 2 ? w.dir + '>' + w.dir2 : w.dir2 + '>' + w.dir;
})(aimDir);

// ---------------------------------------------------------------- Autopilot mastery: AUTO picks the mode
function steerAutoPick() {
  const p = G.player, A = G.spAuto || (G.spAuto = { m: 'kite', t: -9 });
  if (G.t - A.t < 0.6) return A.m;
  A.t = G.t;
  const hp = p.hp / Math.max(1, G.P.maxHp), boss = G.boss && !G.boss.dead, near = arThreat(p.x, p.y, 220);
  let m = 'kite';
  if (!boss && hp > 0.35) {
    const elite = G.enemies.some(e => arFoe(e) && (e.elite || e.rival) && Math.hypot(e.x - p.x, e.y - p.y) < 600);
    const gems = (G.gems || []).filter(g => !g.dead && Math.hypot(g.x - p.x, g.y - p.y) < 300).length;
    if (elite && hp > 0.7) m = 'hunt';
    else if (gems >= 3 && near < 3) m = 'collect';
    else if (near >= 8 && hp > 0.6) m = 'orbit';
  }
  return A.m = m;
}
arMode = (orig => function () {
  if (G.moveDir !== 'auto') return orig();
  G.moveDir = steerAutoPick();
  try { return orig(); } finally { G.moveDir = 'auto'; }
})(arMode);

// ---------------------------------------------------------------- clamp choices that are no longer on offer
function steerClamp() {
  if (!moveAllowed(G.moveDir)) G.moveDir = 'kite';
  for (const w of (G.weapons || []).concat(G.spells || [])) {
    if (!w) continue;
    if (w.dir && !aimAllowed(w.dir)) w.dir = 'nearest';
    if (w.dir2 && !aimAllowed(w.dir2)) w.dir2 = null;
    if (w.dirs) for (let i = 0; i < w.dirs.length; i++) if (!aimAllowed(w.dirs[i])) w.dirs[i] = STEER.aimBase[i % STEER.aimBase.length];
  }
}
wupTick = (orig => function (dt) { orig(dt); if (G && G.state === 'play') steerClamp(); })(wupTick);

// ---------------------------------------------------------------- keeping one after a win
function steerKeep(k) {
  META.spKeep = Object.assign({}, META.spKeep, { [k]: 1 }); saveMeta();
}
function steerKeepHtml() {
  const held = [['aim', 'sp_aim', 'Advanced Targeting'], ['auto', 'sp_auto', 'Autopilot']].filter(([k, id]) => mr(id) > 0 && !steerKept(k));
  if (!held.length) return '';
  if (held.length === 1) { steerKeep(held[0][0]); return uiPanel('Kept for good', `<p>${held[0][2]}: every level is now open from the start of each run.</p>`, 'spkeep'); }
  return uiPanel('Keep one for good', `<p>Pick one. Every level of it is open from the start of each run.</p>${held.map(([k, , nm]) => uiButton(nm, { attrs: `data-spkeep="${k}"` })).join(' ')}`, 'spkeep');
}
if (typeof UI !== 'undefined' && UI.showGameOver) {
  const base = UI.showGameOver;
  UI.showGameOver = function (won) {
    const r = base.apply(this, arguments);
    const body = document.getElementById('overBody');
    if (won && G && body && !G.spKeepShown) {
      G.spKeepShown = 1;
      const h = steerKeepHtml();
      if (h) {
        body.insertAdjacentHTML('afterbegin', h);
        body.querySelectorAll('[data-spkeep]').forEach(b => b.addEventListener('click', () => {
          steerKeep(b.dataset.spkeep);
          const box = body.querySelector('.spkeep'); if (box) box.innerHTML = `<h3>Kept for good</h3><p>${b.textContent}: every level is now open from the start of each run.</p>`;
        }));
      }
    }
    return r;
  };
}

// ---------------------------------------------------------------- HOLD: no autorun at all (user, 23 Oct)
// Under HOLD the sperm stays where it is unless you steer it yourself: no dodging, no drifting back to a spot.
autoSteer = (orig => function () { return G && G.moveDir === 'hold' && G.state === 'play' ? { x: 0, y: 0 } : orig(); })(autoSteer);
{ const h = MOVE_DIRECTIVES.find(m => m.id === 'hold'); if (h) h.desc = 'Stay still and never dodge. You do all the steering'; }
