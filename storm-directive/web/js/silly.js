'use strict';
// Spawn Prawn - more power-ups and weapon modifiers, of the kind a tired lab technician would invent.
// Power-ups run on the same timers as pickups.js (G.pu[id]); the two instant ones are handled in sillyApply.
// Hooks: sillyApply (puApply), sillyTick (puTick), sillyDraw (puDraw), sillyKill (killEnemy),
// sillyModMul (damageEnemy), sillyProcs (modProcs), sillyInsure and sillyHurt (hurtPlayer).

Object.assign(POWERUPS, {
  decoy:     { name: 'CARDBOARD CUTOUT', letter: 'D', color: '#d4a373', desc: 'For 10s a life-size cardboard you stands where you were. Everything attacks it. It does not mind' },
  gossip:    { name: 'IDLE GOSSIP',      letter: 'T', color: '#ff8fab', desc: 'For 12s a rumour spreads: cells near you turn on each other' },
  conga:     { name: 'CONGA LINE',       letter: 'P', color: '#f4a261', desc: 'For 15s everything you kill joins a conga line behind you. The line hurts' },
  hiccups:   { name: 'HICCUPS',          letter: 'U', color: '#90e0ef', desc: 'For 12s you hiccup: a little jump forward and a shockwave, every 1.3s' },
  paperwork: { name: 'PAPERWORK',        letter: 'E', color: '#e5e5e5', desc: 'For 10s every enemy must fill in a form first: 60% slower (bosses 25%)' },
  insure:    { name: 'LIFE INSURANCE',   letter: 'I', color: '#a3b18a', desc: 'For 30s one fatal hit is covered. You wake up on 40% HP and a small payout. Excess applies' },
  sneeze:    { name: 'THE HOST SNEEZES', letter: 'A', color: '#bde0fe', desc: 'Everything is flung across the slide and enemy bullets are wiped. Bless you' },
  refund:    { name: 'TAX REFUND',       letter: '£', color: '#ffd23f', desc: 'Overpaid damage, returned as XP. Nobody knows how it was calculated' },
});
Object.assign(PU_TIME, { decoy: 10, gossip: 12, conga: 15, hiccups: 12, paperwork: 10, insure: 30 });
PU_NEW.push('decoy', 'gossip', 'conga', 'hiccups', 'paperwork', 'insure', 'sneeze', 'refund');

Object.assign(MODS, {
  trashtalk: { name: 'Trash Talk',           icon: 'TT', color: '#ffb4a2', desc: p => `Kills give this weapon +${Math.round(6 * p)}% damage (up to 10 stacks). Getting hit loses the lot` },
  passive:   { name: 'Passive Aggressive',   icon: 'PA', color: '#b8c0ff', desc: p => `2s after a hit, the target takes another ${Math.round(40 * p)}% of it. As per your last email` },
  trophy:    { name: 'Participation Trophy', icon: 'PT', color: '#ffd23f', desc: p => `Every 10th hit deals ${Math.round(200 + 100 * p)}% damage and drops a little XP. Everyone is a winner` },
  inherit:   { name: 'Inheritance',          icon: 'IN', color: '#a3b18a', desc: p => `Kills pass ${Math.round(25 * p)}% of the victim's max HP to the nearest enemy as damage. Next of kin` },
  clingy:    { name: 'Separation Anxiety',   icon: 'SA', color: '#cdb4db', desc: p => `+${Math.round(50 * p)}% damage to anything within 150 of you, -20% beyond 450. Do not leave` },
  snitch:    { name: 'Snitch',               icon: 'SN', color: '#e5e5e5', desc: p => `${Math.round(20 * p)}% of hits grass the target up: every weapon deals +30% to it for 3s` },
});
DUOS.push(
  { a: 'trashtalk', b: 'trophy',  name: 'Sore Winner',     desc: 'Trophy hits add two Trash Talk stacks, and say so.' },
  { a: 'passive',   b: 'snitch',  name: 'Office Politics', desc: 'Passive-aggressive follow-ups always grass the target up, and spread to one neighbour.' },
);

const SILLY_LINES = {
  trash: ['NEXT.', 'NOTED.', 'SIT DOWN.', 'CALM DOWN.', 'EMBARRASSING.', 'WHO TAUGHT YOU TO SWIM?', 'GET A JOB.', 'IS THAT IT?'],
  gossip: ['DID YOU HEAR?', 'SHE SAID WHAT?', 'NOT TO SPREAD IT', 'HE CALLED YOU SQUISHY', 'APPARENTLY...'],
  decoy: ['I am fine.', 'Mm.', 'Carry on.', 'Nothing to report.', 'This is my best side.'],
  form: ['FORM 27B/6', 'SIGN HERE', 'IN TRIPLICATE', 'BLACK INK ONLY', 'PLEASE HOLD'],
  passive: ['AS PER MY LAST EMAIL', 'FRIENDLY REMINDER', 'PER OUR CONVERSATION', 'NO WORRIES IF NOT'],
};
const modP = (w, id) => { if (!w || !w.mods) return 0; const m = w.mods.find(x => x.id === id); return m ? m.p || 1 : 0; };
const duoOn = (w, n) => !!(w && w.s && w.s.duos && w.s.duos.includes(n));
// Throttled deadpan text, so a crowd doesn't bury the screen in it.
function sillySay(x, y, key, color, size) {
  if (G.sayT > G.t) return;
  G.sayT = G.t + 0.7;
  floatText(x, y, pick(SILLY_LINES[key]), color || XR.white, size || 12, 1.1);
}

// ---------------------------------------------------------------- power-ups
// From puApply: instant ones, plus set-up for the timed ones. Returns true if it fully handled the type.
function sillyApply(type) {
  const p = me();
  if (type === 'sneeze') {
    const a = Math.random() * TAU, ux = Math.cos(a), uy = Math.sin(a);
    for (const e of G.enemies) {
      if (e.dead || e.egg || e.charmed || Math.hypot(e.x - p.x, e.y - p.y) > 1100) continue;
      if (!e.boss && !e.rival) { e.kx += ux * 1400; e.ky += uy * 1400; e.dazeT = G.t + 0.8; }
      damageEnemy(e, puDmg(1.5), puSrc('The Host Sneezes', { elem: 'phys' }));
    }
    for (const b of G.ebul) b.dead = true;
    for (let i = 0; i < 40; i++) spawnPart(p.x - ux * 300 + rand(-300, 300), p.y - uy * 300 + rand(-300, 300), '#ffffff', 1, 900, 0.6, 3);
    cam.shake = 22; G.flashT = 0.2; sfx('boom');
    floatText(p.x, p.y - 50, 'BLESS YOU.', '#ffffff', 20, 1.6, true);
    return true;
  }
  if (type === 'refund') {
    const v = G.xpNeed * 0.35 / 10;
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; dropGem(p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 70, v); }
    for (const g of G.gems) g.mag = true;
    floatText(p.x, p.y - 50, 'PROCESSED IN 6-8 WEEKS', PAL.reward, 14, 1.6);
    return true;
  }
  if (type === 'decoy') {
    G.decoy = { x: p.x, y: p.y, end: G.t + PU_TIME.decoy, face: p.face || 0, sayT: G.t + 1 };
    floatText(p.x, p.y - 40, 'LOOK, OVER THERE', '#d4a373', 14, 1.2);
  }
  if (type === 'conga') G.conga = { trail: [], n: 0, rec: 0, hitT: 0 };
  if (type === 'hiccups') G.hicT = G.t + 0.6;
  return false; // (timed: puApply sets the clock)
}
function sillyTick(dt) {
  const p = me();
  // Cardboard cutout: soaks up enemy fire, then falls over and everyone feels silly.
  const D = G.decoy;
  if (D) {
    for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - D.x, b.y - D.y) < 22) { b.dead = true; spawnPart(b.x, b.y, '#d4a373', 2, 60, 0.3); }
    if (G.t > D.sayT) { D.sayT = G.t + 2.5; floatText(D.x, D.y - 30, pick(SILLY_LINES.decoy), '#d4a373', 12, 1.4); }
    if (G.t > D.end || !puOn('decoy')) {
      G.decoy = null;
      floatText(D.x, D.y - 30, 'IT WAS CARDBOARD.', '#d4a373', 15, 1.6, true);
      ring(D.x, D.y, 170, '#d4a373', 0.5, 4);
      forNear(D.x, D.y, 170, e => { if (!e.boss && !e.charmed) e.stasisT = G.realT + 2; }); // (embarrassed)
    }
  }
  // Idle gossip: cells near you turn on each other for a few seconds at a time.
  if (puOn('gossip') && !(G.gossipT > G.t)) {
    G.gossipT = G.t + 0.8;
    let busy = G.enemies.filter(e => e.gossip && e.charmed).length;
    forNear(p.x, p.y, 380, e => {
      if (busy >= 6 || e.charmed || e.boss || e.rival || e.elite || e.egg || e.dead || Math.random() > 0.35) return;
      e.charmed = true; e.charmT = 3; e.gossip = true; e.allyT = null; busy++;
      sillySay(e.x, e.y - e.r - 10, 'gossip', '#ff8fab');
    });
  }
  // Conga line: your recent path, with a dancer every few steps.
  const C = G.conga;
  if (C) {
    C.rec -= dt;
    if (C.rec <= 0) { C.rec = 0.04; C.trail.unshift({ x: p.x, y: p.y }); if (C.trail.length > 160) C.trail.length = 160; }
    if (!(C.hitT > G.t)) {
      C.hitT = G.t + 0.3;
      for (const d of congaDancers()) forNear(d.x, d.y, 24, e => { if (!e.charmed && !e.egg) damageEnemy(e, puDmg(0.7), puSrc('Conga Line', { elem: 'phys', knock: 120, kx: e.x - d.x, ky: e.y - d.y })); });
    }
    if (!puOn('conga')) {
      for (const d of congaDancers()) aoe(d.x, d.y, 60, puDmg(1), puSrc('Conga Line', { elem: 'phys' }), '#f4a261');
      if (C.n) floatText(p.x, p.y - 40, 'THE PARTY IS OVER', '#f4a261', 13, 1.2);
      G.conga = null;
    }
  }
  // Hiccups: hop forward, shockwave, a moment of invulnerability.
  if (puOn('hiccups') && G.t > (G.hicT || 0)) {
    G.hicT = G.t + 1.3;
    const a = p.hd != null ? p.hd : p.face || 0;
    p.x += Math.cos(a) * 80; p.y += Math.sin(a) * 80;
    p.iframes = Math.max(p.iframes, 0.25);
    aoe(p.x, p.y, 95, puDmg(1.6), puSrc('Hiccups', { elem: 'phys', knock: 200 }), '#90e0ef');
    ring(p.x, p.y, 95, '#90e0ef', 0.35, 4); cam.shake = Math.min(10, cam.shake + 4);
    floatText(p.x, p.y - 30, 'HIC', '#90e0ef', 15, 0.7);
  }
  // Paperwork: everyone slows down to fill in their forms (game.js reads e.formT).
  if (puOn('paperwork')) {
    for (const e of G.enemies) if (!e.charmed) e.formT = G.t + 0.25;
    if (!(G.formSayT > G.t)) { G.formSayT = G.t + 1.2; const v = onScreen(1); if (v.length) { const e = pick(v); floatText(e.x, e.y - e.r - 12, pick(SILLY_LINES.form), '#e5e5e5', 11, 1.2); } }
  }
}
// The dancers: one every few steps back along your path, as many as you've killed (up to 12).
function congaDancers() {
  const C = G.conga, out = [];
  if (!C) return out;
  for (let i = 0; i < C.n; i++) { const q = C.trail[(i + 1) * 9]; if (q) out.push(q); }
  return out;
}
function sillyDraw() {
  const D = G.decoy;
  if (D) {
    const x = sx(D.x), y = sy(D.y), s = playerScale();
    ctx.fillStyle = '#5a4632'; ctx.fillRect(x - 2 * S, y + 6 * S, 4 * S, 16 * S); // the stand
    drawShip(x, y, D.face, '#d4a373', 0.9, s);
    ctx.strokeStyle = '#d4a373'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(x, y, 22 * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  const C = G.conga;
  if (C) {
    const ds = congaDancers();
    ds.forEach((d, i) => {
      const x = sx(d.x), y = sy(d.y) + Math.sin(G.realT * 9 + i) * 3 * S, prev = i ? ds[i - 1] : G.player, f = Math.atan2(prev.y - d.y, prev.x - d.x);
      drawShip(x, y, f, '#f4a261', 0.7, 0.85);
      // A party hat, in colour whatever your stains say.
      RAW_COL = true; ctx.fillStyle = i % 2 ? '#ff8fab' : '#90e0ef';
      ctx.beginPath(); ctx.moveTo(x - 5 * S, y - 6 * S); ctx.lineTo(x + 5 * S, y - 6 * S); ctx.lineTo(x, y - 19 * S); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y - 19 * S, 2.5 * S, 0, TAU); ctx.fill(); RAW_COL = false;
    });
  }
}
// Kills: conga recruits, Trash Talk stacks, Inheritance.
function sillyKill(e, src) {
  if (G.conga && puOn('conga') && G.conga.n < 12 && !e.boss) G.conga.n++;
  const w = src && src.w;
  if (!w || !w.mods || !w.mods.length) return;
  const tt = modP(w, 'trashtalk');
  if (tt) { w.ttN = Math.min(10, (w.ttN || 0) + 1); sillySay(e.x, e.y - e.r - 8, 'trash', '#ffb4a2', 12); }
  const ih = modP(w, 'inherit');
  if (ih && !src.inherited) {
    const n = acquire('nearest', 420, e.x, e.y, e);
    if (n) {
      bolt(e.x, e.y, n.x, n.y, '#a3b18a', 0.18);
      damageEnemy(n, e.maxHp * 0.25 * ih, { noProc: true, noCrit: true, inherited: true, wname: 'Inheritance', w });
      if (Math.random() < 0.15) floatText(n.x, n.y - n.r - 10, 'NEXT OF KIN', '#a3b18a', 11, 1);
    }
  }
}
// Damage multiplier for this hit from this weapon's silly modifiers.
function sillyModMul(e, src) {
  const w = src.w;
  if (!w || !w.mods || !w.mods.length || src.dot) return 1;
  let k = 1;
  const cl = modP(w, 'clingy');
  if (cl) { const d = Math.hypot(e.x - G.player.x, e.y - G.player.y); k *= d < 150 ? 1 + 0.5 * cl : d > 450 ? 0.8 : 1; }
  const tt = modP(w, 'trashtalk');
  if (tt && w.ttN) k *= 1 + 0.06 * tt * w.ttN;
  const tr = modP(w, 'trophy');
  if (tr && !src.inherited) {
    w.trN = (w.trN || 0) + 1;
    if (w.trN >= 10) {
      w.trN = 0; k *= 2 + tr;
      dropGem(e.x, e.y, 1 + G.level * 0.15);
      floatText(e.x, e.y - e.r - 14, duoOn(w, 'Sore Winner') ? 'WINNER. OBVIOUSLY.' : 'WELL DONE YOU', PAL.reward, 13, 1);
      if (duoOn(w, 'Sore Winner')) w.ttN = Math.min(10, (w.ttN || 0) + 2);
    }
  }
  return k;
}
// On hit (from modProcs): Passive Aggressive follow-ups and Snitch marks.
function sillyProcs(e, dmg, src) {
  const w = src.w;
  if (!w || !w.mods || !w.mods.length) return;
  const sn = modP(w, 'snitch');
  if (sn && Math.random() < 0.2 * sn) { e.mark = Math.max(e.mark || 0, 3); if (Math.random() < 0.1) floatText(e.x, e.y - e.r - 10, 'GRASSED UP', '#e5e5e5', 11, 0.9); }
  const pa = modP(w, 'passive');
  if (pa) {
    e.paAcc = (e.paAcc || 0) + dmg * 0.4 * pa;
    if (e.paPend) return; // (one follow-up at a time per target; it adds up)
    e.paPend = true;
    const politics = duoOn(w, 'Office Politics');
    after(2, () => {
      e.paPend = false;
      const v = e.paAcc; e.paAcc = 0;
      if (e.dead || !(v > 0)) return;
      damageEnemy(e, v, { noProc: true, noCrit: true, wname: 'Passive Aggressive', w });
      if (Math.random() < 0.25) floatText(e.x, e.y - e.r - 12, pick(SILLY_LINES.passive), '#b8c0ff', 11, 1.2);
      if (politics) {
        e.mark = Math.max(e.mark || 0, 3);
        const n = acquire('nearest', 200, e.x, e.y, e); if (n) n.mark = Math.max(n.mark || 0, 3);
      }
    });
  }
}
// Life insurance: a fatal hit is covered (from hurtPlayer; true = the hit is cancelled).
function sillyInsure(d) {
  const p = G.player;
  if (!puOn('insure') || p.hp - d > 0) return false;
  G.pu.insure = 0;
  p.hp = G.P.maxHp * 0.4; p.iframes = 1.5;
  ring(p.x, p.y, 160, '#a3b18a', 0.6, 6); G.flashT = 0.2;
  for (let i = 0; i < 6; i++) dropGem(p.x + rand(-60, 60), p.y + rand(-60, 60), G.xpNeed * 0.04);
  floatText(p.x, p.y - 50, 'CLAIM APPROVED', '#a3b18a', 18, 1.6, true);
  sfx('pickup');
  return true;
}
// After you take a hit: Trash Talk loses its nerve.
function sillyHurt() {
  for (const w of G.weapons) if (w && w.ttN) { w.ttN = 0; }
}

// ---------------------------------------------------------------- Post-Nut Clarity
// When Oxytocin wears off: a calm, slightly ashamed comedown. Your weapons fire 35% slower for 6s, but you see
// every weak spot: +40% crit chance. The colour drains out of the slide a little while it lasts.
const CLARITY_LEN = 6;
const CLARITY_LINES = ['You feel calm. Reflective. A little ashamed.', 'What were you doing? Why were you doing it?', 'Everything is very clear now. Too clear.', 'You stare into the middle distance. The middle distance stares back.'];
function startClarity() {
  if (!G || !G.player) return;
  G.clarityT = G.t + CLARITY_LEN;
  const p = G.player;
  floatText(p.x, p.y - 44, 'POST-NUT CLARITY', '#cfd8dc', 15, 1.6, true);
  sysMsg('POST-NUT CLARITY', pick(CLARITY_LINES) + ' (35% slower fire, +40% crit chance for 6s.)', XR.dim, true);
}
