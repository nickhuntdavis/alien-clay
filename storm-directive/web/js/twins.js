'use strict';
// Spawn Prawn - The Twins, the eleventh sequence: Victorian ghost twins, found in a sealed specimen jar dated 1887.
// They never blink, they speak in unison and they only want you to come and play. Your twin swims beside you, steered
// by itself, firing copies of your weapons (Womb Mates: 25% / 40% / 60% damage at Rank I / II / III, half that
// spliced in). It has no health of its own: whatever hits your twin hurts you at half (TWINS.share). Its own kit:
// Hand in Hand (new: shots in pairs that curl in from both sides; the second of a pair hits twice as hard),
// plus Twin Telepathy and Seeker Siblings (shared with the Bright Spark and the Firstborn), and the ability
// Which One? (you and your twin swap places, each letting out a shockwave).
// Synergies: Two Heads Are Better (with the Firstborn), Something in the Corner (with the Quiet One).
// Hooks: twinsTick (update), twinsDraw (render), twinsDmgMul / twinsHit / twinsKill (sigs.js sigDamageMul,
// sigHit, sigKill), twinsSigStats (sigs.js applySigStats), TWINS_EVOLVE (evolve.js), twinsPortrait /
// twinsMods (seqsel.js). Unlock: rung 8 of the ladder (seqlock.js).

const TWINS = { color: '#cbc3d9', share: 0.5, near: 100, far: 170, touchCd: 0.5 };
const twinsCopy = k => Math.min(0.6, 0.1 + 0.15 * k); // Womb Mates: k is 1 / 2 / 4 at Rank I / II / III (0.5 spliced)

Object.assign(WEAPONS, {
  doubletrouble: { name: 'Hand in Hand', stars: [3, 3, 3, 3], play: 'Fires shots in pairs that hold hands and curl in on one target from both sides. The second of a pair to land hits twice as hard, so keep them on the same thing.', icon: 'DT', elem: 'phys', kind: 'gun', color: TWINS.color, dir: 'nearest', role: 'Duellist', seqOnly: 'twins',
    desc: 'They always come together. One from the left, one from the right. They meet in the middle of you.',
    base: { dmg: 10, cd: 0.42, mag: 8, reload: 1.3, count: 2, spread: 1.6, speed: 420, pierce: 0, range: 460, size: 4, homing: 4 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 2 }, 9: { pierce: 1 } }, sig: { 5: ['dtmatching', 'dthairpull'], 8: ['dtbunkbeds', 'dtsentences'], 10: ['dtconjoined', 'dtevil'] } },
});
Object.assign(SIGS, {
  dtmatching: { name: 'Matching Pinafores', desc: 'A doubled hit marks the enemy: it takes 20% more damage from everything for 3s.' },
  dthairpull: { name: 'Cold Little Hands', desc: 'A doubled hit freezes the enemy where it is for 0.6s (not bosses).' },
  dtbunkbeds: { name: 'Two Little Beds', desc: 'One more pair in every volley, each shot at 80% damage.' },
  dtsentences: { name: "Finishing Each Other's Sentences", desc: 'A doubled hit sets off a third: a small burst round the target for 60% of the hit.' },
  dtconjoined: { name: 'Conjoined', desc: 'Mastery. Doubled hits are tripled instead, and the pairs fly 30% faster.' },
  dtevil: { name: 'The Other One', desc: 'Mastery. An enemy that took a doubled hit explodes when it dies, for 150% of that hit.' },
});
if (typeof ICON_OF !== 'undefined') ICON_OF.doubletrouble = 'pair';
if (typeof IC !== 'undefined') IC.pair = '<path d="M4 18C7 12 9 8 12 6"/><path d="M20 18C17 12 15 8 12 6"/><circle cx="4" cy="18" r="1.6"/><circle cx="20" cy="18" r="1.6"/><path d="M10 4h4"/>';

PROFILES.twins = {
  name: 'The Twins', trait: 'Never Apart', fmt: k => `your ghostly twin swims beside you, firing copies of your weapons at ${pc(twinsCopy(k))} damage. Hits on your twin hurt you at half`,
  apply: (P, k) => { P.twinK = Math.max(P.twinK || 0, k); },
  desc: 'Found in a sealed jar at the back of the oldest cabinet in the lab. They never blink and they never let go. Your twin copies everything you do, and whatever hurts your twin, you feel.',
  weapons: ['doubletrouble', 'twin', 'seeker'],
};
if (typeof SEQ_LOOK !== 'undefined') SEQ_LOOK.twins = { short: 'Twins', color: TWINS.color, tag: 'COME PLAY WITH US', quote: 'Come and play with us. Forever. And ever. And ever.', stats: [3, 3, 3, 3] };
PROFILE_SYNERGIES.push(
  { a: 'twins', b: 'vanguard', name: 'Two Heads Are Better', desc: 'When Head First charges, your twin charges too, at the enemy nearest to it.' },
  { a: 'twins', b: 'stealth', name: 'Something in the Corner', desc: 'Your twin passes through whatever it swims into, chilling it to the bone for your melee damage.' });
const TWINS_EVOLVE = [
  { name: 'One Cot Between Us', desc: 'Your twin swims 20% closer and takes 10% less of the blame (hits on it hurt you at 40%).', apply: P => { P.twinShare = 0.4; } },
  { name: 'Mother\'s Lullaby', desc: '+10% fire rate.', apply: P => { P.haste += 0.1; } },
  { name: 'We Hear Each Other', desc: 'Your twin copies your weapons at 10% more damage.', apply: P => { P.twinBonus = (P.twinBonus || 0) + 0.1; } },
  { name: 'Forever and Ever', desc: '+20% damage, and Which One? heals you 5% each time.', apply: P => { P.might += 0.2; P.swapHeal = 1; } },
];

const twinsOn = () => !!(G && G.genes && G.genes.active.includes('twins') && G.P.twinK > 0);

// ---------------------------------------------------------------- the twin
function twinsTick(dt) {
  if (!twinsOn() || G.lvl && G.lvl.done) { G.twin = null; return; }
  const p = G.player;
  let T = G.twin;
  if (!T) T = G.twin = { x: p.x - 40, y: p.y + 30, vx: 0, vy: 0, face: p.face || 0, r: p.r, hp: 1, iframes: 0, weapons: [], sig: '', born: G.t, side: 1, touchT: 0, shoveT: 0, flash: 0, tailV: 0 };
  // Copies of every weapon you own (rebuilt when your build changes), like the Imaginary Friend's.
  const copy = twinsCopy(G.P.twinK) + (G.P.twinBonus || 0);
  const sig = copy.toFixed(2) + '|' + G.weapons.filter(x => x && !NOCOPY.has(x.def.kind)).map(x => x.uid + ':' + x.lvl + ':' + Object.values(x.perks || {}).join(',') + ':' + x.mods.map(m => m.id).join(',')).join('|');
  if (T.sig !== sig) {
    T.sig = sig;
    T.weapons = G.weapons.filter(x => x && !NOCOPY.has(x.def.kind)).map(x => {
      const k = makeSlot(x.id, false, x.lvl); k.dir = x.dir; k.echo = true; k.copyK = copy; k.twinCopy = true;
      k.mods = x.mods.slice(); k.perks = Object.assign({}, x.perks); k.wp = x.wp; computeStats(k); k.ammo = k.s.mag; return k;
    });
  }
  // Where it wants to be: beside you, on the flank of whatever is nearest you (or just behind you).
  const near = (G.P.twinShare ? 0.8 : 1) * TWINS.near, t = acquire('nearest', 520, p.x, p.y);
  if (t && Math.random() < dt * 0.15) T.side = -T.side; // (now and then it swaps sides)
  const a = t ? Math.atan2(t.y - p.y, t.x - p.x) + T.side * 1.15 : (p.face || 0) + Math.PI * 0.8;
  let gx = p.x + Math.cos(a) * near, gy = p.y + Math.sin(a) * near;
  const c = G.core, R = CORE.arena - 30, gd = Math.hypot(gx - c.x, gy - c.y); if (gd > R) { gx = c.x + (gx - c.x) / gd * R; gy = c.y + (gy - c.y) / gd * R; }
  const ax = (gx - T.x) * 4, ay = (gy - T.y) * 4;
  T.vx += (ax - T.vx) * Math.min(1, dt * 4); T.vy += (ay - T.vy) * Math.min(1, dt * 4);
  const sp = Math.hypot(T.vx, T.vy), cap = 420; if (sp > cap) { T.vx *= cap / sp; T.vy *= cap / sp; }
  T.x += T.vx * dt; T.y += T.vy * dt; T.tailV = Math.hypot(T.vx, T.vy);
  const dP = Math.hypot(T.x - p.x, T.y - p.y); if (dP > TWINS.far * 2.5) { T.x = p.x - 30; T.y = p.y + 30; } // (lost: back to your side)
  if (t) T.face = Math.atan2(t.y - T.y, t.x - T.x); else if (T.tailV > 10) T.face = Math.atan2(T.vy, T.vx);
  T.r = p.r; T.flash = Math.max(0, T.flash - dt);
  // It fires your weapons.
  const real = G.player;
  G.realPlayer = real; G.player = T;
  try { for (const k of T.weapons) updateWeapon(k, dt); } finally { G.player = real; G.realPlayer = null; }
  // Whatever hits it, you feel (at half).
  for (const b of G.ebul) if (!b.dead && Math.abs(b.x - T.x) < T.r + (b.r || 5) && Math.abs(b.y - T.y) < T.r + (b.r || 5) && Math.hypot(b.x - T.x, b.y - T.y) < T.r + (b.r || 5)) { b.dead = true; twinsHurt(b.dmg, b.from, b.owner); }
  if (G.t >= T.touchT) forNear(T.x, T.y, T.r + 40, e => {
    if (e.dead || e.charmed || e.egg || G.t < T.touchT || Math.hypot(e.x - T.x, e.y - T.y) > e.r + T.r) return false;
    T.touchT = G.t + TWINS.touchCd; twinsHurt(e.dmg, e.name, e); return false;
  });
  // Something in the Corner: it passes through what it swims into.
  if (synOn('twins', 'stealth') && G.t >= T.shoveT) {
    T.shoveT = G.t + 0.25;
    forNear(T.x, T.y, T.r + 30, e => { if (!e.charmed && !e.egg && Math.hypot(e.x - T.x, e.y - T.y) < e.r + T.r + 6) damageEnemy(e, (8 + G.level * 1.5) * G.P.might * (G.P.meleeK || 1), { elem: 'phys', wname: 'Something in the Corner', knock: 80, kx: e.x - T.x, ky: e.y - T.y }); return false; });
  }
}
function twinsHurt(dmg, from, ent) {
  const T = G.twin; if (!T || !(dmg > 0)) return;
  T.flash = 0.15;
  hurtPlayer(dmg * (G.P.twinShare || TWINS.share), 'Your twin (' + (from || 'something') + ')', ent && ent.boss ? ent : null);
}

// ---------------------------------------------------------------- Which One?
function twinsSwap(manual) {
  const T = G.twin, p = G.player;
  if (!T) return false;
  if (!manual) { // (on its own: only when you are being crowded or are low and something is close)
    let close = 0; forNear(p.x, p.y, 95, e => { if (!e.charmed && !e.egg && !e.dead) close++; return false; });
    if (close < 3 && !(p.hp < G.P.maxHp * 0.5 && close > 0)) return false;
  }
  const ox = p.x, oy = p.y;
  p.x = T.x; p.y = T.y; T.x = ox; T.y = oy; unstick(p, p.r + 4);
  p.iframes = Math.max(p.iframes, 0.4);
  for (const [x, y] of [[p.x, p.y], [T.x, T.y]]) { aoe(x, y, 110, abilDmg() * 1.5, abilSrc('Which One?', { knock: 220 }), TWINS.color); ring(x, y, 110, TWINS.color, 0.4, 5); }
  if (G.P.swapHeal) healPlayer(G.P.maxHp * 0.05);
  floatText(p.x, p.y - 36, pick(['WHICH ONE?', 'OVER HERE', 'BEHIND YOU', 'WE ARE BOTH HERE', 'COME AND PLAY']), TWINS.color, 15, 1);
  sfx('pickup'); cam.shake = Math.min(8, cam.shake + 3);
  return true;
}
SEQ_ABILITY.twins = { name: 'Which One?', short: 'SWAP', cd: 8,
  desc: 'Every 8s, when you are crowded or low with something close: you and your twin swap places, and each of you lets out a shockwave. Tap to swap whenever you like.',
  fire(manual) { return twinsSwap(manual); } };
// Two Heads Are Better: when Head First charges, so does your twin.
{ const f0 = SEQ_ABILITY.vanguard.fire;
  SEQ_ABILITY.vanguard.fire = function (manual) {
    const ok = f0.call(this, manual), T = G.twin;
    if (ok && T && synOn('twins', 'vanguard')) {
      const t = acquire('nearest', 260, T.x, T.y), a = t ? Math.atan2(t.y - T.y, t.x - T.x) : T.face || 0, from = { x: T.x, y: T.y }, to = { x: T.x + Math.cos(a) * 180, y: T.y + Math.sin(a) * 180 };
      T.x = to.x; T.y = to.y; T.face = a;
      alongLine(from, to, 24, e => damageEnemy(e, abilDmg() * 2, abilSrc('Two Heads Are Better', { knock: 220, kx: Math.cos(a), ky: Math.sin(a) })));
      for (let i = 0; i < 5; i++) G.fx.push({ type: 'flash', x: lerp(from.x, to.x, i / 4), y: lerp(from.y, to.y, i / 4), r: 22 - i * 2, color: TWINS.color, life: 0.25, max: 0.25 });
    }
    return ok;
  }; }

// ---------------------------------------------------------------- Hand in Hand
const isDT = src => !!(src && src.w && src.w.id === 'doubletrouble');
function twinsSigStats(w, s) {
  if (w.id !== 'doubletrouble') return;
  if (hasSig(w, 'dtbunkbeds')) { s.count += 2; s.dmg *= 0.8; }
  if (hasSig(w, 'dtconjoined')) s.speed *= 1.3;
}
// The second shot of a pair (or any Hand in Hand hit within 0.6s of the first) is doubled.
function twinsDmgMul(e, src) {
  let m = e.matchT > G.t ? 1.2 : 1; // Matching Pinafores
  if (!isDT(src) || src.dtBurst) return m;
  if (e.dtT > G.t) { e.dtT = 0; e.dtDbl = G.frameN; return m * (hasSig(src.w, 'dtconjoined') ? 3 : 2); }
  return m;
}
function twinsHit(e, dmg, src) {
  if (!isDT(src) || src.dtBurst) return;
  const w = src.w;
  if (e.dtDbl !== G.frameN) { e.dtT = G.t + 0.6; return; }
  e.dtDbl = -1;
  if (!(e.dtTxtT > G.t)) { e.dtTxtT = G.t + 0.8; floatText(e.x, e.y - e.r - 8, 'DOUBLE', TWINS.color, 12, 0.5); }
  if (hasSig(w, 'dtmatching')) e.matchT = G.t + 3;
  if (hasSig(w, 'dthairpull') && !e.boss && !e.rival) e.frozen = Math.max(e.frozen, 0.6);
  if (hasSig(w, 'dtsentences')) aoe(e.x, e.y, 60, dmg * 0.6, Object.assign({}, src, { dtBurst: 1, noProc: true, noCrit: true, mult: 1, wname: "Finishing Each Other's Sentences" }), TWINS.color);
  if (hasSig(w, 'dtevil')) e.evilK = Math.max(e.evilK || 0, dmg * 1.5);
}
function twinsKill(e) {
  if (!(e.evilK > 0)) return;
  const k = e.evilK; e.evilK = 0;
  after(0.05, () => { aoe(e.x, e.y, 90, k, { elem: 'phys', wname: 'The Other One', noProc: true, dtBurst: 1 }, TWINS.color); ring(e.x, e.y, 90, TWINS.color, 0.35, 4); });
}

// ---------------------------------------------------------------- drawing
// Your twin is a ghost: see-through, pale, flickering now and then, trailing faint afterimages, with two hollow
// black eyes. Now and then it whispers.
const TWIN_WHISPERS = ['come and play with us', 'forever and ever', 'one, two, we are coming for you', 'we see you', 'ring a ring o\' roses', 'mother says hello', 'shall we play a game?', 'it is so cold in the jar'];
function twinsDraw() {
  const T = G.twin;
  if (!T || G.t - T.born < 0.1) return;
  const x = sx(T.x), y = sy(T.y), p = G.player, rt = G.realT;
  const tr = T.trail || (T.trail = []);
  if (!tr.length || Math.hypot(tr[0].x - T.x, tr[0].y - T.y) > 10) { tr.unshift({ x: T.x, y: T.y, f: T.face }); if (tr.length > 5) tr.pop(); }
  // A thin, cold thread back to you.
  ctx.globalAlpha = 0.18 + 0.08 * Math.sin(rt * 3); ctx.strokeStyle = TWINS.color; ctx.lineWidth = Math.max(1, S); ctx.setLineDash([2 * S, 6 * S]);
  ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  RAW_COL = typeof grantOn !== 'function' || grantOn('body');
  // Afterimages, then the ghost itself (it flickers out for a frame or two every few seconds).
  for (let i = tr.length - 1; i >= 1; i--) drawShip(sx(tr[i].x), sy(tr[i].y), tr[i].f, TWINS.color, 0.07 * (tr.length - i), playerScale() * 0.88);
  const flick = Math.sin(rt * 0.9) > 0.97 && Math.random() < 0.6;
  const a = flick ? 0.12 : 0.55 + 0.12 * Math.sin(rt * 5.3);
  ctx.globalCompositeOperation = 'lighter'; glow(x, y, 30 * S, TWINS.color, 0.22); ctx.globalCompositeOperation = 'source-over';
  drawShip(x, y, T.face, T.flash > 0 ? '#ff4d6d' : TWINS.color, a, playerScale() * 0.88, T);
  // Two hollow eyes on the head.
  const k = S * playerScale() * 0.88, f = T.face || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(f); ctx.globalAlpha = Math.min(1, a + 0.3); ctx.fillStyle = '#05060a';
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(3.2 * k, sd * 2.1 * k, 1.3 * k, 1.6 * k, 0, 0, TAU); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1;
  // A whisper, now and then.
  if (!(T.whisperT > G.t)) { T.whisperT = G.t + rand(16, 28); if (G.t - T.born > 4) T.whisper = { s: pick(TWIN_WHISPERS), t: G.t }; }
  if (T.whisper && G.t - T.whisper.t < 2.6) {
    const wa = Math.min(1, (G.t - T.whisper.t) * 2) * Math.min(1, (2.6 - (G.t - T.whisper.t)) * 1.5);
    ctx.globalAlpha = 0.75 * wa; ctx.fillStyle = TWINS.color; ctx.font = `italic ${Math.round(Math.max(10, 11 * S))}px Georgia, serif`; ctx.textAlign = 'center';
    ctx.fillText(T.whisper.s, x, y - 24 * S - (G.t - T.whisper.t) * 6 * S); ctx.globalAlpha = 1;
  }
  RAW_COL = false;
  drawWeaponFx(T.weapons, T.x, T.y, 0.3);
}
// Portrait: a second, paler swimmer tucked in below and behind, see-through, with hollow eyes.
function twinsPortrait(g, hx, hy, R, c, t) {
  const bx = hx - R * 0.5, by = hy + R * 1.25 + Math.sin(t * 1.3) * R * 0.05, r = R * 0.62;
  const a = Math.sin(t * 0.8) > 0.96 ? 0.15 : 0.62 + 0.1 * Math.sin(t * 4);
  g.globalAlpha = a; g.strokeStyle = c; g.lineWidth = Math.max(1.5, R * 0.07); g.lineCap = 'round';
  g.beginPath(); g.moveTo(bx - r * 0.9, by); for (let i = 1; i <= 8; i++) g.lineTo(bx - r * 0.9 - i * r * 0.45, by + Math.sin(t * 4 + i * 0.9) * r * 0.2 * (i / 8)); g.stroke();
  g.fillStyle = '#e9e5f2'; g.beginPath(); g.ellipse(bx, by, r, r * 0.7, 0, 0, TAU); g.fill(); g.stroke();
  g.globalAlpha = Math.min(1, a + 0.35); g.fillStyle = '#05060a';
  for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(bx + r * 0.42, by + sd * r * 0.26, r * 0.13, r * 0.17, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1; g.lineCap = 'butt';
}
// In play (drawSeqMods, turned to the head): you have the same hollow eyes.
function twinsMods(k) {
  ctx.fillStyle = '#05060a';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(3.2 * k, s * 2.1 * k, 1.1 * k, 1.4 * k, 0, 0, TAU); ctx.fill(); }
}
