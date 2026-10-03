'use strict';
// Spawn Prawn - Mythical and Celestial cards. On top of their (big) stats, each carries a unique bonus
// effect for the rest of the run. One or two turn up in a typical run, three at most (see rollRarity).

const BOONS = {
  // Mythical
  bloodmoon:  { tier: 5, name: 'Second Wind', desc: 'Every 40th kill sends you into OXYTOCIN for 5s (double fire rate, no reloads) and heals 10%.' },
  stormcrown: { tier: 5, name: 'Act of God', desc: 'Every 3s, lightning strikes the toughest enemy on screen for 8% of its max HP (4% on bosses, 6% on the Final Five).' },
  phoenix:    { tier: 5, name: 'Second Coming', desc: 'The first time you would die, you come back at full health. Unplanned.' },
  hormone:    { tier: 5, name: 'Growth Hormone', desc: '+50% max HP (and heal it), and +2 Headstrong. You are the weapon now.' },
  pocketvoid: { tier: 5, name: 'Bottomless Pit', desc: 'A small black hole circles you for the rest of the run, dragging enemies in and crushing them.' },
  technicolour: { tier: 5, name: 'Full Technicolour', desc: 'Everything goes full colour for the rest of the run: you, them, the bullets, the slide, the HUD. Also +10% damage.' },
  bullettime: { tier: 5, name: 'Tantric', desc: 'When you drop below 30% health, time slows for 4s (every 20s at most). Breathe.' },
  // Celestial
  supernova:  { tier: 6, name: 'Gender Reveal', desc: 'Every 12s a blast fills the screen: every enemy takes 18% of its max HP (4% on bosses, 6% on the Final Five) and every enemy bullet is wiped. Everyone finds out.' },
  godhand:    { tier: 6, name: 'Hand of God', desc: 'Every 5s, the three toughest enemies on screen are smitten for 15% of their max HP (4% on bosses, 6% on the Final Five).' },
  twinsoul:   { tier: 6, name: 'In Quick Succession', desc: 'Every weapon you own fires 60% faster. Forever.' },
  grace:      { tier: 6, name: 'State of Grace', desc: 'Every 15s: 2s of invulnerability and a 15% heal.' },
  starfall:   { tier: 6, name: 'Twinkle, Twinkle', desc: 'Stars fall on enemies near you, one every 0.4s, each for three times your best weapon\'s damage.' },
};

// Give a Mythical or Celestial card its bonus (from genLoot). Shown on the card; granted when taken.
function withBoon(o) {
  if (!o || !(o.rarity >= 5) || o.cursed) return o;
  const have = G.boons || {}, pool = Object.keys(BOONS).filter(id => BOONS[id].tier === o.rarity && !have[id]);
  if (!pool.length) { o.rarity = 4; return o; }
  G.mythN = (G.mythN || 0) + 1;
  o.boon = pick(pool);
  const base = o.apply;
  o.apply = () => { base(); grantBoon(o.boon); };
  return o;
}

function grantBoon(id) {
  const B = BOONS[id], P = G.P, p = me();
  (G.boons || (G.boons = {}))[id] = true;
  achieve('mythic');
  banner(B.name.toUpperCase() + '!', RARITIES[B.tier].color);
  sysMsg(RARITIES[B.tier].name.toUpperCase() + ' BONUS', `${B.name}: ${B.desc}`, PAL.upgrade, true);
  sfx('level'); vibrate([60, 40, 120]);
  ring(p.x, p.y, 120, RARITIES[B.tier].color, 0.8, 8);
  if (id === 'hormone') { const add = Math.round(P.maxHp * 0.5); P.maxHp += add; G.player.hp += add; P.ram += 2; }
  if (id === 'technicolour') { P.might += 0.1; refreshPalette(); }
  if (id === 'pocketvoid') G.zones.push({ x: p.x, y: p.y, r: 70, life: 1e9, max: 1e9, dps: 0, elem: 'arcane', pull: 160, color: '#7b2cbf', tick: 0, src: { elem: 'arcane', wname: 'Bottomless Pit', noCrit: true }, pocket: true });
}

const hasBoon = id => !!(G.boons && G.boons[id]);
// Twin Soul (from rateBonus).
function boonRate() { return hasBoon('twinsoul') ? 1.6 : 1; }

// From killEnemy.
function boonKill() {
  if (!hasBoon('bloodmoon')) return;
  G.bloodN = (G.bloodN || 0) + 1;
  if (G.bloodN % 40) return;
  G.rage = Math.max(G.rage, 5); healPlayer(G.P.maxHp * 0.1);
  floatText(me().x, me().y - 34, 'SECOND WIND', RARITIES[5].color, 15, 0.8);
}

// From hurtPlayer, before death is final. Returns true if it saved you.
function boonSave() {
  if (!hasBoon('phoenix') || G.phoenixUsed) return false;
  G.phoenixUsed = true;
  const p = me();
  p.hp = G.P.maxHp; p.iframes = 2;
  aoe(p.x, p.y, 260, 60 * hpNow(), { elem: 'fire', wname: 'Second Coming', noCrit: true, knock: 400 }, '#ff7a2f');
  for (const b of G.ebul) b.dead = true;
  ring(p.x, p.y, 260, '#ff7a2f', 1, 10); banner('SECOND COMING', '#ff7a2f'); cam.shake = 16; sfx('boss');
  return true;
}
function boonHurt() {
  if (hasBoon('bullettime') && G.player.hp < G.P.maxHp * 0.3 && !(G.btT > G.t)) { G.btT = G.t + 20; G.warp = Math.max(G.warp, 4); banner('TANTRIC', RARITIES[5].color); }
}

// Strongest things on screen (for the smiting boons).
function onScreen(n) {
  const p = me(), R = Math.hypot(W / S, H / S) / 2;
  return G.enemies.filter(e => !e.dead && !e.charmed && !e.phased && !e.egg && Math.hypot(e.x - p.x, e.y - p.y) < R).sort((a, b) => b.maxHp - a.maxHp).slice(0, n);
}
const smiteDmg = (e, k, kb) => e.maxHp * (e.boss || e.final ? kb : k);

function boonTick(dt) {
  if (!G.boons) return;
  const p = me(), T = id => { G.boonT = G.boonT || {}; G.boonT[id] = (G.boonT[id] || 0) + dt; return G.boonT[id]; }, reset = id => { G.boonT[id] = 0; };
  if (hasBoon('stormcrown') && T('stormcrown') >= 3) {
    reset('stormcrown');
    for (const e of onScreen(1)) { bolt(e.x + rand(-40, 40), e.y - 500, e.x, e.y, '#ffe94a', 0.3); damageEnemy(e, smiteDmg(e, 0.08, 0.015), { elem: 'shock', wname: 'Act of God', noCrit: true }); }
  }
  if (hasBoon('godhand') && T('godhand') >= 5) {
    reset('godhand');
    for (const e of onScreen(3)) { ring(e.x, e.y, e.r + 30, RARITIES[6].color, 0.6, 8); floatText(e.x, e.y - e.r - 14, 'SMITE', RARITIES[6].color, 15, 0.7); damageEnemy(e, smiteDmg(e, 0.15, 0.03), { elem: 'arcane', wname: 'Hand of God', noCrit: true, knock: 200 }); }
    cam.shake = Math.min(10, cam.shake + 4);
  }
  if (hasBoon('supernova') && T('supernova') >= 12) {
    reset('supernova');
    for (const e of onScreen(240)) damageEnemy(e, smiteDmg(e, 0.18, 0.02), { elem: 'fire', wname: 'Gender Reveal', noCrit: true, knock: 300, kx: e.x - p.x, ky: e.y - p.y });
    for (const b of G.ebul) b.dead = true;
    ring(p.x, p.y, 600, RARITIES[6].color, 1, 14); addLight(p.x, p.y, 900, '#ffffff', 0.6);
    banner('GENDER REVEAL', RARITIES[6].color); cam.shake = 14; sfx('boom');
  }
  if (hasBoon('grace') && T('grace') >= 15) {
    reset('grace');
    G.shieldT = Math.max(G.shieldT, 2); healPlayer(G.P.maxHp * 0.15);
    ring(p.x, p.y, 70, RARITIES[6].color, 0.8, 6);
  }
  if (hasBoon('starfall') && T('starfall') >= 0.4) {
    reset('starfall');
    const t = acquire('random', 420, p.x, p.y);
    const best = G.weapons.reduce((m, w) => Math.max(m, w ? w.s.dmg * weaponMult(w) : 0), 10);
    if (t) {
      G.fx.push({ type: 'warn', x: t.x, y: t.y, r: 34, color: '#fff3b0', life: 0.25, max: 0.25 });
      after(0.25, () => { if (!t.dead) { bolt(t.x - 120, t.y - 420, t.x, t.y, '#ffffff', 0.2); aoe(t.x, t.y, 40, best * 3, { elem: 'arcane', wname: 'Twinkle, Twinkle', noCrit: true }, '#fff3b0'); } });
    }
  }
  // The Pocket Black Hole circles you.
  if (hasBoon('pocketvoid')) {
    const z = G.zones.find(q => q.pocket);
    if (z) { const a = G.realT * 1.4; z.x = p.x + Math.cos(a) * 120; z.y = p.y + Math.sin(a) * 120; z.dps = (25 + G.level * 10) * G.P.might; z.life = 1e9; }
  }
}
