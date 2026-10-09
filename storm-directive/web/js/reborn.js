'use strict';
// Spawn Prawn - Prawn Again, the ninth sequence (for Reece, who helped build this game).
// A reincarnation of ?????. Every few levels a memory of a past life surfaces, and with it something it used
// to be good at; the sixth memory says who it was. Unlocked by reaching Rank 3 with every other sequence.
// Its own kit: three weapons (Deja Vu, Ghosts of You, Karma), a spell (Out of Body), three upgrades that
// only turn up while it's in your genome, and the ability Second Life.

// ================================================================ weapons, spell, upgrades, signatures
Object.assign(WEAPONS, {
  dejavu: { name: 'Déjà Vu', stars: [3, 3, 4, 2], play: 'Fires a slow ghostly shot. A moment later the same shot happens again, from the same spot at the same angle. You have seen this before.', icon: 'DV', elem: 'arcane', kind: 'gun', color: '#d9c6ff', dir: 'nearest', role: 'Repeater', reborn: 1, seqOnly: 'reborn',
    desc: 'Every shot happens twice. The second time, it is a memory.',
    base: { dmg: 20, cd: 0.8, mag: 6, reload: 1.3, count: 1, spread: 0.12, speed: 330, pierce: 1, range: 420, size: 5, replay: 1 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { pierce: 2 } }, sig: { 5: ['rbthird', 'rbpremonition'], 10: ['rbgroundhog', 'rbsamedream'] } },
  ghosts: { name: 'Ghosts of You', stars: [3, 2, 4, 4], play: 'Every enemy that dies near you leaves a ghost behind. Each volley sends every stored ghost hunting, homing in on enemies. The busier it gets, the bigger the volley.', icon: 'GY', elem: 'ice', kind: 'gun', color: '#e0f7ff', dir: 'nearest', style: 'sperm', role: 'Haunter', reborn: 1, seqOnly: 'reborn',
    desc: 'The ones who came before you never really left.',
    base: { dmg: 15, cd: 1.1, mag: 4, reload: 1.6, count: 1, spread: 1.4, speed: 270, pierce: 0, range: 460, size: 5, homing: 6 },
    lv: { 3: { dmg: 0.3 }, 6: { count: 1 }, 9: { dmg: 0.4 } }, sig: { 5: ['rbunfinished', 'rbchills'], 10: ['rblegion', 'rbreunion'] } },
  karma: { name: 'Karma', stars: [3, 2, 1, 4], play: 'What goes around comes around. A ring bursts out all around you, and every hit you take charges the next ones up: up to three and a half times as hard.', icon: 'KA', elem: 'phys', kind: 'ring', color: '#ffe8a3', dir: 'nearest', role: 'Payback', reborn: 1, seqOnly: 'reborn',
    desc: 'Every hit you take comes back around. With interest.',
    base: { dmg: 18, cd: 1.6, mag: 3, reload: 1.8, count: 10, speed: 300, pierce: 2, range: 240, size: 5 },
    lv: { 3: { count: 4 }, 6: { dmg: 0.4 }, 9: { pierce: 2 } }, sig: { 5: ['rbinstant', 'rbgood'], 10: ['rbwheel', 'rbnirvana'] } },
});
Object.assign(SPELLS, {
  oob: { name: 'Out of Body', icon: 'OB', elem: 'arcane', kind: 'oob', color: '#e8dcff', dir: 'nearest', noTarget: 1, seqOnly: 'reborn',
    desc: 'You slip out of your body for a moment: nothing can touch you, you swim faster, and anything you pass through takes damage. Your body waits where you left it.',
    base: { dmg: 24, cd: 13, dur: 2.2, range: 0 },
    lv: { 3: { dur: 0.3 }, 5: { dmg: 0.5 }, 7: { cd: -0.2 } } },
});
SPELL_FORKS.oob = [{ name: 'Astral Projection', desc: 'You stay out of your body 60% longer.' },
  { name: 'Poltergeist', desc: 'When you snap back, your body bursts, blasting everything near it for four times the touch damage.' }];
Object.assign(SIGS, {
  rbthird: { name: 'Third Time Lucky', desc: 'Every memory replays once more, at 70% damage.' },
  rbpremonition: { name: 'Premonition', desc: 'The replay arrives sooner (0.5s), flies 50% faster and pierces 2 more enemies.' },
  rbgroundhog: { name: 'Groundhog Day', desc: 'Mastery. Memories keep replaying, each at 60% of the last, until they fade (up to four times).' },
  rbsamedream: { name: 'Same Dream', desc: 'Mastery. Replays fire from wherever you are now, at the nearest enemy, at full damage.' },
  rbunfinished: { name: 'Unfinished Business', desc: 'An enemy killed by a ghost leaves two ghosts behind.' },
  rbchills: { name: 'Gave Me the Creeps', desc: 'Ghosts lather what they hit: 40% slower for 1.5s.' },
  rblegion: { name: 'We Are Legion', desc: 'Mastery. Store twice as many ghosts, and every volley sends two extra.' },
  rbreunion: { name: 'Family Reunion', desc: 'Mastery. Every ghost that hits heals you 0.4% of your max HP.' },
  rbinstant: { name: 'Instant Karma', desc: 'Getting hit fires a ring straight back at once (every 1.5s at most).' },
  rbgood: { name: 'Good Karma', desc: 'Kills near you charge Karma too, not just hits you take.' },
  rbwheel: { name: 'Wheel of Life', desc: 'Mastery. Every ring is followed by a second, turned half a step, 0.25s later.' },
  rbnirvana: { name: 'Nirvana', desc: 'Mastery. A fully charged ring also heals you 8% of your max HP.' },
});
Object.assign(PASSIVES, {
  oldsoul: { name: 'Old Soul', icon: 'OL', max: 5, v: 0.1, seq: 'reborn', fmt: v => `+${pc(v)} experience and +${pc(v / 2)} damage`, apply: (P, v) => { P.xp += v; P.might += v / 2; } },
  musclememory: { name: 'Muscle Memory', icon: 'MM', max: 5, v: 0.08, seq: 'reborn', fmt: v => `+${pc(v)} fire rate and reload speed`, apply: (P, v) => { P.haste += v; P.reloadSpd += v; } },
  ninelives: { name: 'Nine Lives', icon: 'NL', max: 3, v: 0.05, seq: 'reborn', fmt: v => `+${pc(v)} dodge and +${Math.round(v * 200)} max HP`, apply: (P, v) => { P.dodge = Math.min(0.7, P.dodge + v); P.maxHp += v * 200; } },
});
if (typeof ICON_OF !== 'undefined') Object.assign(ICON_OF, { dejavu: 'spiral', ghosts: 'ghost', karma: 'yin', oob: 'astral' });
if (typeof IC !== 'undefined') Object.assign(IC, {
  yin: '<circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 010 9 4.5 4.5 0 000 9"/><circle cx="12" cy="7.5" r="1"/><circle cx="12" cy="16.5" r="1"/>',
  astral: '<ellipse cx="9" cy="13" rx="4" ry="6"/><ellipse cx="15" cy="10" rx="4" ry="6" stroke-dasharray="2 2"/>',
});

// ================================================================ the sequence
const REBORN = { color: '#d9c6ff', who: 'Reece' };
const memMax = () => (typeof META !== 'undefined' && META.memMax) || 0;
const pastLife = () => (memMax() >= 6 ? REBORN.who : '?????');
PROFILES.reborn = {
  name: 'Prawn Again', trait: 'Past Life', fmt: k => `memories of a past life surface as you level (${Math.round(100 * k)}% strength), +${pc(0.05 * k)} experience`,
  apply: (P, k) => { P.xp += 0.05 * k; },
  get desc() { return `A reincarnation of ${pastLife()}. Every few levels a memory of a past life surfaces, and with it something it used to be good at.`; },
  weapons: ['dejavu', 'ghosts', 'karma'],
  unlock: { text: 'Reach Rank 3 with every other sequence', have: () => Object.keys(PROFILES).filter(id => id !== 'reborn' && profRank(id) >= 3).length, need: 8 },
};
if (typeof SEQ_LOOK !== 'undefined') SEQ_LOOK.reborn = { short: 'Old Soul', color: REBORN.color, tag: 'REMEMBERS A PAST LIFE', quote: 'Have we met? I feel like I have done this before.', stats: [3, 3, 3, 4] };
SEQ_ABILITY.reborn = { name: 'Second Life', short: 'REBORN', cd: 45,
  desc: 'When your health drops below 25%, you die a little and are prawn again: 40% of your health back, 2s in which nothing can hurt you, and a burst of light that hurts everything near you. Every 45s at most.',
  fire(manual) {
    const p = G.player, P = G.P;
    if (!manual && p.hp > P.maxHp * 0.25) return false;
    healPlayer(P.maxHp * 0.4); p.iframes = Math.max(p.iframes, 2);
    IN_AOE = true; forNear(p.x, p.y, 230, e => { if (!e.charmed && !e.egg) damageEnemy(e, abilDmg() * 2.5, abilSrc('Second Life', { elem: 'arcane', knock: 300, kx: e.x - p.x, ky: e.y - p.y })); }); IN_AOE = false;
    ring(p.x, p.y, 230, REBORN.color, 0.7, 8); G.fx.push({ type: 'flash', x: p.x, y: p.y, r: 200, color: '#ffffff', life: 0.4, max: 0.4 });
    floatText(p.x, p.y - 40, 'PRAWN AGAIN', REBORN.color, 18, 1.4); cam.shake = Math.min(14, cam.shake + 8); sfx('level');
    return true;
  } };

// Memories: at these levels a memory of the past life surfaces, with a small gift. Strength follows the
// sequence (half when it's spliced in). The sixth says who it was; your Codex and the sequence screen
// remember how far you've ever got (META.memMax).
const MEMORIES = [
  { lv: 6, text: 'Warm water, and a heartbeat that was not yours.', gift: '+6% damage', apply: (P, k) => { P.might += 0.06 * k; } },
  { lv: 14, text: 'You remember winning. The egg giving way. A crowd going wild.', gift: '+8% swim speed', apply: (P, k) => { P.speed += 0.08 * k; } },
  { lv: 24, text: 'Someone humming, very badly, through a wall of skin.', gift: '+20 max HP', apply: (P, k) => { P.maxHp += 20 * k; G.player.hp += 20 * k; } },
  { lv: 34, text: 'A name, almost. It starts with an R.', gift: '+6% crit chance', apply: (P, k) => { P.crit += 0.06 * k; } },
  { lv: 46, text: 'Playing this, over and over. Telling someone what was broken. Telling them what was fun.', gift: '+10% fire rate', apply: (P, k) => { P.haste += 0.1 * k; } },
  { lv: 56, text: `It all comes back. You were ${REBORN.who}. You have done this before, and you won.`, gift: '+10% damage and a full heal', apply: (P, k) => { P.might += 0.1 * k; healPlayer(P.maxHp); } },
];
function rebornK() { return G.genes && G.genes.active.includes('reborn') ? clamp(G.genes.k.reborn || 0.5, 0.5, 1.5) : 0; } // (half strength when spliced in)
// From gainXp.
function rebornLevel(lv) {
  const k = rebornK();
  if (!k) return;
  const m = MEMORIES.findIndex(x => x.lv === lv);
  if (m < 0) return;
  MEMORIES[m].apply(G.P, k); recomputeAll();
  G.memories = Math.max(G.memories || 0, m + 1);
  if (m + 1 > memMax()) { META.memMax = m + 1; saveMeta(); }
  const p = me();
  ring(p.x, p.y, 140, REBORN.color, 0.8, 5); floatText(p.x, p.y - 44, `MEMORY ${m + 1} OF 6`, REBORN.color, 15, 1.6);
  sysMsg('A MEMORY SURFACES', `${MEMORIES[m].text} (${MEMORIES[m].gift})`, REBORN.color, true);
}

// ================================================================ weapon behaviour
const ownedW = id => G.weapons.find(w => w && w.id === id);
// Deja Vu: from spawnProj. The same shot happens again, later, from the same place.
function rebornReplay(w, x, y, a, src, over, pr) {
  if (!w.def.replay || (over && over.memory)) return;
  const pre = hasSig(w, 'rbpremonition'), same = hasSig(w, 'rbsamedream'), hog = hasSig(w, 'rbgroundhog');
  const times = hog ? 4 : hasSig(w, 'rbthird') ? 2 : 1, dmg0 = pr.dmg;
  for (let i = 1; i <= times; i++) {
    const k = hog ? Math.pow(0.6, i - 1) : i === 1 ? 1 : 0.7;
    if (k < 0.2) break;
    after((pre ? 0.5 : 1) * i, () => {
      if (!G || G.state === 'over') return;
      let ox = x, oy = y, oa = a;
      if (same) { const p = me(), t = acquire('nearest', w.s.range, p.x, p.y); ox = p.x; oy = p.y; if (t) oa = Math.atan2(t.y - p.y, t.x - p.x); }
      const o = Object.assign({}, over || {}, { memory: true, dmg: dmg0 * (same ? 1 : k), color: '#f3ecff' });
      if (pre) { o.pierce = (pr.pierce || 0) + 2; o.speed = pr.speed * 1.5; o.vx = Math.cos(oa) * o.speed; o.vy = Math.sin(oa) * o.speed; }
      const q = spawnProj(w, ox, oy, oa, src, o);
      if (q) ring(ox, oy, 10, '#e8dcff', 0.25, 1.5);
    });
  }
}
// Ghosts of You: kills near you store ghosts; each volley sends them all.
function ghostCap(w) { return (6 + w.lvl) * (hasSig(w, 'rblegion') ? 2 : 1); }
function rebornFire(w, target, src) {
  if (w.id !== 'ghosts') return false;
  const p = G.player, s = w.s, n = s.count + (w.souls || 0) + (hasSig(w, 'rblegion') ? 2 : 0);
  w.souls = 0;
  const a0 = Math.atan2(target.y - p.y, target.x - p.x);
  for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, a0 + (n > 1 ? (i / (n - 1) - 0.5) * s.spread : 0) + rand(-0.1, 0.1), src, { ghost: true });
  return true;
}
// From killEnemy (foeKill).
function rebornKill(e, src) {
  const g = ownedW('ghosts'), p = me();
  if (g && Math.hypot(e.x - p.x, e.y - p.y) < 380) {
    const add = src && src.w === g && hasSig(g, 'rbunfinished') ? 2 : 1;
    g.souls = Math.min(ghostCap(g), (g.souls || 0) + add);
    if (Math.random() < 0.5) fxParts('bubble', e.x, e.y, '#e0f7ff', 2, 40, 0.8, 3, -Math.PI / 2, 0.5);
  }
  const k = ownedW('karma');
  if (k && hasSig(k, 'rbgood') && Math.hypot(e.x - p.x, e.y - p.y) < 300) G.karma = (G.karma || 0) + G.P.maxHp * 0.012;
}
// From damageEnemy's hit hooks (via spawnProj's src): ghosts chill and heal.
function rebornHit(pr, e) {
  if (!pr.ghost || !pr.w) return;
  if (hasSig(pr.w, 'rbchills') && !e.boss) { e.chill = Math.max(e.chill, 1.5); e.chillAmt = Math.max(e.chillAmt, 0.4); }
  if (hasSig(pr.w, 'rbreunion')) healPlayer(G.P.maxHp * 0.004, true);
}
// Karma: charged by the hits you take (G.karma), decaying over a few seconds.
const karmaMul = () => 1 + Math.min(2.5, (G.karma || 0) / Math.max(1, G.P.maxHp * 0.4));
function rebornHurt(d) {
  const k = ownedW('karma');
  if (!k) return;
  G.karma = (G.karma || 0) + d;
  if (hasSig(k, 'rbinstant') && !(G.karmaT > G.t)) { G.karmaT = G.t + 1.5; karmaRing(k); }
}
function karmaRing(w, turn) {
  const p = G.player, s = w.s, src = weaponSrc(w), off = Math.random() * TAU + (turn ? Math.PI / s.count : 0);
  for (let i = 0; i < s.count; i++) spawnProj(w, p.x, p.y, off + i / s.count * TAU, src);
  ring(p.x, p.y, 40 + 30 * (karmaMul() - 1), w.def.color, 0.35, 3);
}
// From fireWeapon after Karma's ring: the follow-up ring, the heal, and spending the charge.
function rebornAfterFire(w) {
  if (w.id !== 'karma') return;
  const full = karmaMul() >= 3.4;
  if (hasSig(w, 'rbwheel')) after(0.25, () => { if (G && G.state !== 'over') karmaRing(w, true); });
  if (full && hasSig(w, 'rbnirvana')) { healPlayer(G.P.maxHp * 0.08); floatText(me().x, me().y - 36, 'NIRVANA', w.def.color, 14, 1); }
  G.karma = (G.karma || 0) * 0.35;
}

// ================================================================ Out of Body (spell)
function rebornOOB(w) {
  const p = G.player, s = w.s;
  G.oob = { x: p.x, y: p.y, face: p.hd != null ? p.hd : p.face, t: s.dur, max: s.dur, w, hitT: 0 };
  p.iframes = Math.max(p.iframes, s.dur);
  ring(p.x, p.y, 60, w.def.color, 0.5, 4); sfx('level');
}
// Per frame (from update).
function rebornTick(dt) {
  if (G.karma) G.karma *= Math.pow(0.5, dt / 6);
  const O = G.oob;
  if (!O) return;
  const p = G.player, w = O.w;
  O.t -= dt; O.hitT -= dt;
  p.iframes = Math.max(p.iframes, Math.min(0.2, O.t));
  if (O.hitT <= 0) { O.hitT = 0.2; forNear(p.x, p.y, p.r + 22, e => { if (!e.charmed && !e.egg) damageEnemy(e, w.s.dmg, Object.assign(weaponSrc(w), { knock: 0 })); }); }
  if (O.t <= 0) {
    if (spellFork(w, 'b')) { IN_AOE = true; aoe(O.x, O.y, 150, w.s.dmg * 4, weaponSrc(w), w.def.color); IN_AOE = false; }
    ring(p.x, p.y, 40, w.def.color, 0.4, 3);
    G.oob = null;
  }
}
const oobSpeed = () => (G.oob ? 1.6 : 1);

// ================================================================ drawing
// Portrait (sequence screen): a halo, and a fainter self from a past life just behind.
function rebornPortrait(g, hx, hy, R, c, t) {
  g.save(); g.globalAlpha = 0.28 + 0.1 * Math.sin(t * 1.7);
  g.fillStyle = c; g.beginPath(); g.ellipse(hx - R * 0.9, hy - R * 0.5, R * 1.25, R * 0.85, -0.15, 0, TAU); g.fill();
  g.restore();
  g.strokeStyle = c; g.lineWidth = Math.max(1.5, R * 0.09);
  g.beginPath(); g.ellipse(hx, hy - R * 1.25 + Math.sin(t * 2) * R * 0.06, R * 0.8, R * 0.22, 0, 0, TAU); g.stroke();
  g.globalAlpha = 0.5; g.lineWidth = Math.max(1, R * 0.04); g.beginPath(); g.ellipse(hx, hy - R * 1.25 + Math.sin(t * 2) * R * 0.06, R * 1.0, R * 0.32, 0, 0, TAU); g.stroke(); g.globalAlpha = 1;
}
// In play (drawSeqMods, already turned to the head): a little halo over the head.
// The halo stays level and above the head on screen, however the head is turned: find where the head is in
// screen pixels, then draw without the head's rotation.
function rebornMods(k, c, t) {
  const m = ctx.getTransform(), hp = m.transformPoint(new DOMPoint(1 * k, 0)), u = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = c; ctx.lineWidth = Math.max(0.8, 0.7 * k) * u;
  ctx.beginPath(); ctx.ellipse(hp.x, hp.y - (9 * k + Math.sin(t * 2) * 0.5 * k) * u, 5 * k * u, 1.6 * k * u, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}
// Out of Body: your empty body, left behind where you slipped out.
function rebornDrawOOB() {
  const O = G.oob;
  if (!O) return;
  drawShip(sx(O.x), sy(O.y), O.face, null, 0.35 + 0.15 * Math.sin(G.realT * 8), playerScale());
}
