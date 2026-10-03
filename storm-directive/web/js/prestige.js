'use strict';
// Spawn Prawn - Immune Response (difficulty levels) and Being Born (prestige).
// Immune Response: crank up the host's immune system before a run (on the sequence screen). Every level adds
// one more rule on top of the last and +15% DNA. Being born at your highest level unlocks the next.
// Being Born: once you've won a run, the Gene Bank lets you be born. Your traits, wildcards, dyes and DNA are
// gone, but your Generation goes up for good (+10% DNA, +3% damage and +5 max HP a Generation) and you pick a
// Baby Trait to keep forever. The Codex, your sequences and their ranks, and your records all stay.

const IMMUNE = [
  { name: 'Inflammation',        desc: 'Enemies have 20% more health.' },
  { name: 'Running a Temperature',               desc: 'Enemies swim 10% faster.' },
  { name: 'Antibody Surge',      desc: 'Elites turn up twice as often.' },
  { name: 'Opsonisation',        desc: 'Enemy bullets fly 15% faster.' },
  { name: 'Complement Cascade',  desc: 'Bosses have 25% more health.' },
  { name: 'Cytokine Storm',      desc: 'Enemies hit 20% harder.' },
  { name: 'Starvation',          desc: 'Glucose Hits heal half as much.' },
  { name: 'Leukocytosis',        desc: '20% more enemies.' },
  { name: 'Memory B-Cells',      desc: 'Bosses hit 25% harder.' },
  { name: 'Antibody Rain',       desc: 'Elites burst into a ring of bullets when they die.' },
];
const IMMUNE_DNA = 0.15; // extra DNA per level
const heatLv = () => (G && G.heat) || 0;
const heatOn = n => heatLv() >= n;

// Hooks.
// Veterans: permanent Gene Bank upgrades make you much stronger, and a fully upgraded profile was winning
// three runs in four. Past 10 ranks (of 36) the monsters scale up to match: up to +30% HP and +15% damage
// (bosses and rivals +20% HP). New profiles never see it. vetK: 0 to 1.
const VET = { from: 10, hp: 0.3, dmg: 0.15, big: 0.2 };
function vetK() { const r = typeof META !== 'undefined' && META.ranks ? Object.values(META.ranks).reduce((a, b) => a + b, 0) : 0; const all = META_BONUSES.reduce((a, b) => a + b.max, 0); return Math.max(0, Math.min(1, (r - VET.from) / (all - VET.from))); }
function vetEnemy(e) { // (bosses and rivals: heatBoss, rivalStats)
  const k = vetK(); if (!k || e.def.patterns) return;
  e.hp *= 1 + VET.hp * k; e.maxHp *= 1 + VET.hp * k; e.dmg *= 1 + VET.dmg * k;
}
function heatEnemy(e) {
  vetEnemy(e);
  if (!heatLv()) return;
  if (heatOn(1)) { e.hp *= 1.2; e.maxHp *= 1.2; }
  if (heatOn(2)) e.speed *= 1.1;
  if (heatOn(6)) e.dmg *= 1.2;
}
function heatBoss(e) {
  { const k = vetK(); if (k) { e.hp *= 1 + VET.big * k; e.maxHp *= 1 + VET.big * k; e.dmg *= 1 + VET.dmg * k; } }
  if (heatOn(5)) { e.hp *= 1.25; e.maxHp *= 1.25; }
  if (heatOn(9)) e.dmg *= 1.25;
}
const heatElite = () => (heatOn(3) ? 2 : 1);
const heatBullet = () => (heatOn(4) ? 1.15 : 1);
const heatHeal = () => (heatOn(7) ? 0.5 : 1);
const heatSpawn = () => (heatOn(8) ? 1.2 : 1);
function heatKill(e) {
  if (!heatOn(10) || !e.elite || e.boss) return;
  const n = 10, off = Math.random() * TAU;
  for (let i = 0; i < n; i++) eBullet(e.x, e.y, off + i / n * TAU, 150, e.dmg * 0.25, 5, '#ff3b3b');
}
// DNA multiplier for a run: Immune Response and Generation.
const prestigeDna = G => (1 + IMMUNE_DNA * ((G && G.heat) || 0)) * (1 + 0.1 * (META.gen || 0));
// Being born at your highest unlocked level opens the next one; being born at all lets you prestige.
function prestigeBank(G, won) {
  if (!won) return;
  META.wonSinceBirth = true;
  if ((G.heat || 0) >= (META.heatMax || 0) && (META.heatMax || 0) < IMMUNE.length) { META.heatMax = (META.heatMax || 0) + 1; G.heatUnlocked = META.heatMax; }
  META.heatBest = Math.max(META.heatBest || 0, G.heat || 0);
}

// ---------------------------------------------------------------- Baby Traits and Generations
const BABY_TRAITS = {
  colic:      { name: 'Colic', desc: 'Every 20s you scream: everything within 200 is knocked flying and takes damage.' },
  chubby:     { name: 'Chubby Cheeks', desc: '+25 max HP.', apply: P => { P.maxHp += 25; } },
  teething:   { name: 'Teething', desc: '+20% crit damage.', apply: P => { P.critDmg += 0.2; } },
  terrible:   { name: 'Terrible Twos', desc: '+8% damage.', apply: P => { P.might += 0.08; } },
  babytalk:   { name: 'Baby Talk', desc: '+10% XP.', apply: P => { P.xp += 0.1; } },
  cradlecap:  { name: 'Cradle Cap', desc: '+1 armour.', apply: P => { P.armour += 1; } },
  grabby:     { name: 'Grabby Hands', desc: '+25% pickup range.', apply: P => { P.magnet += 0.25; } },
  naptime:    { name: 'Sleeps Through', desc: '+0.6 HP/s regeneration.', apply: P => { P.regen += 0.6; } },
  vomit:      { name: 'Chatterbox', desc: '+6% fire rate.', apply: P => { P.haste += 0.06; } },
  silverspoon:{ name: 'Silver Spoon', desc: '+1 reroll every run and +10% luck.', apply: (P, G) => { P.luck += 0.1; G.rerolls += 1; } },
  dummy:      { name: 'The Dummy', desc: '+5% dodge chance. Suck on that.', apply: P => { P.dodge += 0.05; } },
};
const GEN_NAMES = ['Sperm', 'Newborn', 'Infant', 'Crawler', 'Toddler', 'Preschooler', 'Big Kid', 'Tween', 'Teenager', 'Adult', 'Parent'];
const genName = g => GEN_NAMES[Math.min(GEN_NAMES.length - 1, g)] + (g >= GEN_NAMES.length ? ' ' + (g - GEN_NAMES.length + 2) : '');
// From applyMeta: what every Generation and Baby Trait gives.
function babyApply(G) {
  const P = G.P, g = META.gen || 0;
  if (g) { P.might += 0.03 * g; P.maxHp += 5 * g; G.player.hp += 5 * g; }
  for (const id of META.baby || []) { const B = BABY_TRAITS[id]; if (B && B.apply) B.apply(P, G); }
  if ((META.baby || []).includes('chubby')) G.player.hp += 25;
}
// Per frame: Colic.
function babyTick(dt) {
  if (!(META.baby || []).includes('colic') || G.debug) return;
  G.colicT = (G.colicT == null ? 20 : G.colicT) - dt;
  if (G.colicT > 0) return;
  if (!acquire('nearest', 200, G.player.x, G.player.y)) { G.colicT = 1; return; }
  G.colicT = 20;
  const p = G.player;
  aoe(p.x, p.y, 200, (20 + G.level * 2) * G.P.might, { wname: 'Colic', knock: 520, noProc: true, noCrit: true }, '#ffd6e8');
  floatText(p.x, p.y - 40, 'WAAAAH!', '#ffd6e8', 22, 1);
}
// Being born: the reset, the new Generation and the chosen Baby Trait.
function prestigeBirth(traitId) {
  META.gen = (META.gen || 0) + 1;
  META.baby = (META.baby || []).concat(traitId && BABY_TRAITS[traitId] ? [traitId] : []);
  META.dna = 0; META.ranks = {}; META.starters = {}; META.dyes = { egfp: true }; META.dye = 'egfp';
  META.wonSinceBirth = false;
  setYouColour(META_DYES[0].color);
  saveMeta();
}
function babyChoices() {
  const own = new Set(META.baby || []);
  return shuffle(Object.keys(BABY_TRAITS).filter(id => !own.has(id))).slice(0, 3);
}

// ---------------------------------------------------------------- the birth screen
const BIRTH = { t: 0, picks: [] };
function openBirth() {
  BIRTH.t = 0; BIRTH.picks = babyChoices();
  const next = (META.gen || 0) + 1;
  $('bornKick').textContent = `GENERATION ${next}: ${genName(next).toUpperCase()}`;
  $('bornCards').innerHTML = BIRTH.picks.length ? BIRTH.picks.map(id => `<button class="bcard" data-baby="${id}"><b>${esc(BABY_TRAITS[id].name)}</b><span>${esc(BABY_TRAITS[id].desc)}</span></button>`).join('')
    : '<p class="hint">You have every Baby Trait already. Being born still raises your Generation.</p><button class="bcard" data-baby=""><b>Just be born</b><span>+1 Generation.</span></button>';
  $('bornCards').querySelectorAll('[data-baby]').forEach(b => b.addEventListener('click', () => {
    prestigeBirth(b.dataset.baby);
    sfx('level'); vibrate([60, 40, 120]);
    UI.toast(`Born! Generation ${META.gen}: ${genName(META.gen)}.`);
    UI.show('title'); UI.renderBest();
  }));
  UI.show('born');
}
// A swaddled baby, screaming its head off.
function drawBaby(dt) {
  if (!$('born').classList.contains('on')) return;
  BIRTH.t += dt;
  const cv = $('bornCanvas'), dpr = Math.min(2, window.devicePixelRatio || 1), W2 = cv.clientWidth, H2 = cv.clientHeight;
  if (!W2) return;
  if (cv.width !== Math.round(W2 * dpr)) { cv.width = Math.round(W2 * dpr); cv.height = Math.round(H2 * dpr); }
  const g = cv.getContext('2d'), t = BIRTH.t; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = g.createRadialGradient(W2 / 2, H2 / 2, 0, W2 / 2, H2 / 2, Math.max(W2, H2) * 0.7); bg.addColorStop(0, '#ffd6e855'); bg.addColorStop(1, '#05070a'); g.fillStyle = bg; g.fillRect(0, 0, W2, H2);
  // Rays of glory.
  g.save(); g.translate(W2 / 2, H2 / 2); g.rotate(t * 0.2);
  for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.fillStyle = i % 2 ? '#ffd23f18' : '#ffd6e812'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W2, -40); g.lineTo(W2, 40); g.fill(); }
  g.restore();
  const cx = W2 / 2, cy = H2 / 2 + 10, wob = Math.sin(t * 14) * 2, R = Math.min(W2, H2) * 0.18;
  // Blanket.
  g.fillStyle = '#bde0fe'; g.beginPath(); g.ellipse(cx, cy + R * 0.9, R * 1.05, R * 1.25, 0, 0, TAU); g.fill();
  g.strokeStyle = '#90b8e0'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - R, cy + R * 0.3); g.quadraticCurveTo(cx, cy + R * 1.1, cx + R, cy + R * 0.3); g.stroke();
  // Head.
  g.fillStyle = '#ffd6c2'; g.beginPath(); g.arc(cx + wob, cy - R * 0.2, R * 0.8, 0, TAU); g.fill();
  g.fillStyle = '#ff9eb5aa'; g.beginPath(); g.arc(cx - R * 0.42 + wob, cy - R * 0.02, R * 0.16, 0, TAU); g.arc(cx + R * 0.42 + wob, cy - R * 0.02, R * 0.16, 0, TAU); g.fill();
  // Screwed-up eyes and a screaming mouth.
  g.strokeStyle = '#4a3b35'; g.lineWidth = 3; g.lineCap = 'round';
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * R * 0.42 + wob - R * 0.14, cy - R * 0.35); g.lineTo(cx + s * R * 0.42 + wob + R * 0.14, cy - R * 0.25); g.stroke(); }
  const open = 0.55 + 0.45 * Math.abs(Math.sin(t * 5));
  g.fillStyle = '#7a2d3a'; g.beginPath(); g.ellipse(cx + wob, cy + R * 0.12, R * 0.22, R * 0.2 * open, 0, 0, TAU); g.fill();
  // One heroic curl of hair.
  g.strokeStyle = '#6b4f3a'; g.beginPath(); g.arc(cx + wob, cy - R * 1.02, R * 0.12, Math.PI * 0.2, Math.PI * 1.7); g.stroke();
  // WAAH.
  g.fillStyle = '#ffffff'; g.font = `900 ${Math.round(R * 0.4 + Math.sin(t * 10) * 3)}px sans-serif`; g.textAlign = 'center';
  g.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(t * 5)); g.fillText('WAAAAH!', cx + R * 1.3, cy - R * 1.1 + Math.sin(t * 3) * 6); g.globalAlpha = 1;
}
