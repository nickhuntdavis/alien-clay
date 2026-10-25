'use strict';
// Spawn Prawn - elite affixes (ENEMY_DESIGN 11, ROSTER_ELITE_MODS in roster.js). An elite is a familiar enemy plus exactly
// one visible modifier, picked by the enemy's roster role:
//   trail   Trailing     chargers leave a short Pool behind a charge (G.elPools)
//   fan     Fanning      shooters swap every third volley for a telegraphed 5-shot, 60 degree Spread
//   gift    Gifting      tanks give one nearby ally a 25% Membrane for 3 s, with a drawn link
//   haste   Hasty        chasers run x1.5 below 30% health, with speed streaks
//   smouldering          any role (newfoes.js: nf10Kill bursts on death). Picked here; NF.smoulder.chance weights it when
//                        the role also has a specific affix; roles with none always get it, so every elite carries one.
// A small mark above the elite shows which (no words on screen). e.elMod holds the key.
// Hooks: hooks.js 'tick' -> el10Tick (registered below, order -1 so the pick lands before nf10Tick); v10.js v10Draw -> el10Draw;
// shootPattern is wrapped here (the Fanning volley counter).

const EL = {
  trail: { r: 18, life: 2, tick: 0.5, dmgK: 0.3, gap: 14, dashK: 2.2, cap: 90 },
  fan: { every: 3, count: 5, arc: 60, tele: 0.8, dmgK: 0.8 },
  gift: { pct: 0.25, dur: 3, every: 7, first: 1.5, range: 260 },
  haste: { below: 0.3, mult: 1.5 },
  col: { trail: '#ffb4a2', fan: '#ffd23f', gift: '#7fdcff', haste: '#ff8a5c', smouldering: '#ff6a2a' },
};

function el10Roles(e) { const id = typeof fightId === 'function' ? fightId(e.def) : null, r = id && ROSTER[id]; return r && r.role ? r.role : []; }

// Choose (or force) the elite's affix.
function el10Pick(e, force) {
  const roles = el10Roles(e);
  let key = force;
  if (!key) {
    const giver = typeof FOEAURA !== 'undefined' && FOEAURA.givers.includes(fightId(e.def)); // (a Mucus Wall or Interferon already grants Membranes: no Gifting on top, foeaura10.js)
    const specific = Object.keys(ROSTER_ELITE_MODS).filter(k => k !== 'smouldering' && !(giver && k === 'gift') && ROSTER_ELITE_MODS[k].appliesTo.some(a => roles.includes(a)));
    key = !specific.length || Math.random() < NF.smoulder.chance ? 'smouldering' : specific[Math.floor(Math.random() * specific.length)];
  }
  e.elMod = key; e.nfSm = key === 'smouldering'; // (newfoes.js reads nfSm; set before its own roll)
  e.elT = 0; e.elVol = 0; e.elFan = null; e.elPx = e.x; e.elPy = e.y;
  if (key === 'haste' && e.elHaste) { e.speed /= EL.haste.mult; e.elHaste = false; }
  return key;
}

// Fanning: every third volley from a shooter becomes a telegraphed spread instead.
const el10ShootPattern = shootPattern;
shootPattern = function (e, pat, a0) {
  if (e.elMod === 'fan' && e.elite && !e.boss && pat !== 'snipe' && !(e.soapT > G.t)) {
    if (e.elFan) return;
    e.elVol = (e.elVol || 0) + 1;
    if (e.elVol % EL.fan.every === 0) { e.elFan = { t: EL.fan.tele, a: Math.atan2(G.player.y - e.y, G.player.x - e.x) }; return; }
  }
  return el10ShootPattern(e, pat, a0);
};

function el10Tick(dt) {
  if (!G || G.state !== 'play') return;
  const p = G.player, en = G.enemies;
  for (const e of en) {
    if (e.dead || !e.elite || e.boss || e.rival || e.egg) continue;
    if (e.elMod == null) el10Pick(e);
    const k = e.elMod;
    if (k === 'trail') {
      const mv = Math.hypot(e.x - e.elPx, e.y - e.elPy);
      if (dt > 0 && mv / dt > e.speed * EL.trail.dashK && !(e.frozen > 0)) {
        const P = G.elPools || (G.elPools = []);
        if (!e.elLx || Math.hypot(e.x - e.elLx, e.y - e.elLy) >= EL.trail.gap) {
          e.elLx = e.x; e.elLy = e.y;
          if (P.length < EL.trail.cap) P.push({ x: e.x, y: e.y, r: EL.trail.r, life: EL.trail.life, max: EL.trail.life, t: 0, dmg: e.dmg * EL.trail.dmgK, col: e.def.color || EL.col.trail });
        }
      } else if (mv / (dt || 1) < e.speed * 1.2) e.elLx = null;
      e.elPx = e.x; e.elPy = e.y;
    } else if (k === 'fan' && e.elFan) {
      const f = e.elFan;
      if (!(e.frozen > 0)) f.t -= dt;
      if (f.t <= 0) {
        const sh = e.def.shoot || {}, bd = (sh.dmg || e.def.dmg * 0.4 || 8) * dmgNow() * EL.fan.dmgK, n = EL.fan.count, arc = EL.fan.arc * Math.PI / 180;
        shooterEnt = e; shooterName = e.name;
        for (let i = 0; i < n; i++) eBullet(e.x, e.y, f.a + (i / (n - 1) - 0.5) * arc, sh.speed || 170, bd, 5, EL.col.fan);
        e.elFan = null;
      }
    } else if (k === 'gift') {
      if (e.elT == null || e.elT === 0) e.elT = G.t + EL.gift.first;
      if (e.elG && (G.t > e.elG.until || e.elG.ally.dead)) { el10GiftEnd(e.elG.ally); e.elG = null; }
      if (!e.elG && G.t >= e.elT) {
        let best = null, bd = EL.gift.range;
        for (const o of en) {
          if (o === e || o.dead || o.boss || o.egg || o.elGift) continue;
          const d = Math.hypot(o.x - e.x, o.y - e.y), c = typeof fightCd === 'function' ? fightCd(o) : null;
          if (c && c.def == null && d < bd) { bd = d; best = o; }
        }
        if (best) {
          const c = fightCd(best); c.def = 'membrane'; c.memMax = c.mem = best.maxHp * EL.gift.pct; c.memQuietT = 0; best.elGift = true;
          e.elG = { ally: best, until: G.t + EL.gift.dur }; e.elT = G.t + EL.gift.every;
        } else e.elT = G.t + 1;
      }
    } else if (k === 'haste') {
      const low = e.hp <= e.maxHp * EL.haste.below;
      if (low && !e.elHaste) { e.elHaste = true; e.speed *= EL.haste.mult; }
      if (e.elHaste && Math.random() < dt * 20) spawnPart(e.x - (e.mvx || 0) * e.r, e.y - (e.mvy || 0) * e.r, EL.col.haste, 1, 40, 0.3, 2);
    }
  }
  const P = G.elPools;
  if (P && P.length) {
    for (const z of P) {
      z.life -= dt; z.t -= dt;
      if (z.t <= 0 && Math.hypot(p.x - z.x, p.y - z.y) < z.r + p.r * 0.6) { z.t = EL.trail.tick; hurtPlayer(z.dmg, 'Trailing pool', null, 'other'); }
    }
    G.elPools = P.filter(z => z.life > 0);
  }
}
function el10GiftEnd(a) {
  const c = a.cd; a.elGift = false;
  if (c && c.def === 'membrane') { c.def = null; c.mem = c.memMax = 0; }
}
hookOn('tick', 'el10Tick', dt => el10Tick(dt), -1);

// ---------------------------------------------------------------- drawing (world space)
function el10Mark(k, x, y, s) { // a small glyph per affix
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = ctx.strokeStyle = col(EL.col[k]); ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (k === 'trail') { for (let i = -1; i <= 1; i++) { ctx.moveTo(i * s * 0.9 + s * 0.35, 0); ctx.arc(i * s * 0.9, 0, s * 0.35, 0, 6.3); } ctx.fill(); }
  else if (k === 'fan') { ctx.moveTo(0, s * 0.7); ctx.lineTo(-s, -s * 0.7); ctx.lineTo(s, -s * 0.7); ctx.closePath(); ctx.stroke(); }
  else if (k === 'gift') { ctx.arc(0, 0, s * 0.8, 0, 6.3); ctx.moveTo(-s * 0.45, 0); ctx.lineTo(s * 0.45, 0); ctx.moveTo(0, -s * 0.45); ctx.lineTo(0, s * 0.45); ctx.stroke(); }
  else if (k === 'haste') { for (const o of [-s * 0.6, s * 0.2]) { ctx.moveTo(o, -s * 0.7); ctx.lineTo(o + s * 0.6, 0); ctx.lineTo(o, s * 0.7); } ctx.stroke(); }
  else { ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.9, 0, 0, s * 0.8); ctx.quadraticCurveTo(-s * 0.9, 0, 0, -s); ctx.fill(); }
  ctx.restore();
}
function el10Draw() {
  if (!G) return;
  const now = G.realT;
  ctx.save();
  for (const z of G.elPools || []) { // pools, fading
    const k = z.life / z.max;
    ctx.globalAlpha = 0.15 + 0.4 * k; ctx.fillStyle = col(z.col); ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S, 0, 6.3); ctx.fill();
    ctx.globalAlpha = 0.6 * k; ctx.strokeStyle = col(z.col); ctx.lineWidth = 1.5; ctx.stroke();
  }
  for (const e of G.enemies) {
    if (e.dead || !e.elite || !e.elMod) continue;
    const x = sx(e.x), y = sy(e.y);
    ctx.globalAlpha = 0.95; el10Mark(e.elMod, x, y - (e.r + 11) * S, 4.5 * S);
    if (e.elFan) { // the wedge the volley will fill
      const f = e.elFan, a = EL.fan.arc * Math.PI / 180 / 2, k = 1 - f.t / EL.fan.tele, L = 260 * S;
      ctx.globalAlpha = 0.12 + 0.2 * k; ctx.fillStyle = col(EL.col.fan); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, L, f.a - a, f.a + a); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 30) ** 2; ctx.strokeStyle = col(EL.col.fan); ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (e.elG && !e.elG.ally.dead) { // the link to the one it shields
      const a = e.elG.ally; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(now * 12); ctx.strokeStyle = col(EL.col.gift); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(sx(a.x), sy(a.y)); ctx.stroke();
    }
    if (e.elHaste) { ctx.globalAlpha = 0.4 + 0.3 * Math.sin(now * 25); ctx.strokeStyle = col(EL.col.haste); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, (e.r + 4) * S, 0, 6.3); ctx.stroke(); }
  }
  ctx.restore();
}
