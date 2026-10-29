'use strict';
// Spawn Prawn v10 - wiring for the caption lines (voice10.js). The line tables are in voice.js.
// Owns: when and where each line is shown (one voice, no personas since 29 Oct 2026; 'sci' is the only who).
// In-run commentary is sparse: at most one line every VX_GAP seconds of
// run time, never a repeat (voiceLine remembers the last three), and forced moments (start, bosses, firsts, the end
// screen) still count towards the gap. Tier 2 and 3 lines show their `recover` line next.
// The old narrator (show.js) still runs underneath; vxSysLine swallows its chatter.
// Hooks: show.js sysLine -> vxSysLine (swallows the old chatter under V10); v10.js v10Tick -> vxTick (polls run events,
// first-time status hints); intro.js startFoeIntro -> vxSight; bosses.js startBossIntro -> vxBossIntro;
// ui.js showGameOver/showDishOver -> vxEnd; fight.js rxFired -> vxReaction, fightReact -> vxSpectral;
// meta.js runSummary -> vxSid.
// Save data: META.vxSt (statuses already hinted), META.vxEv (first-time events: firstBossKill, firstEggWin).

const VX_GAP = 20; // seconds of run time between commentary lines
const VX_HEAD = { sci: 'LAB LOG' };
const VX_COL = { sci: '#cfd8dc' };

// The sample's ID for this run ('1A', '2C'): strain from the sample, letter from META.s10runs (samples10.js).
const vxSid = g => { g = g || G; return g && g.s10 && typeof sampleId === 'function' ? sampleId(g.s10.strain, g.s10.run) : ''; };
const vxOn = () => !!G && !!G.show && !G.debug && !(G.lvl && G.lvl.L && G.lvl.L.school);
const vxs = () => G.vx || (G.vx = { next: 0, log: [], acc: 0, hintAcc: 0, hintCd: 0, ups: 0, quiet: 0 });
function vxCtx() {
  const c = {}, id = vxSid();
  if (id) { c.sample = id; c.run = G.s10.run; }
  if (G.wave && G.wave.n >= 1) c.wave = G.wave.n;
  return c;
}
function vxEv(k) { return !!(META.vxEv && META.vxEv[k]); }
function vxEvSet(k) { (META.vxEv || (META.vxEv = {}))[k] = 1; saveMeta(); }

// Put a line on the narrator strip (show.js msgQ, shown by ui.js while playing).
function vxPush(who, text, head, hold) {
  const q = G.show.msgQ;
  who = 'sci';
  q.push({ head: head || VX_HEAD.sci + (vxSid() ? ' · ' + vxSid() : ''), body: text, color: VX_COL.sci, who, hold: hold || Math.min(6, 2.2 + text.length / 24) });
  if (q.length > 6) q.shift();
}
function vxLog(event, who, text) {
  const S = vxs(); S.log.push({ t: G.t, event, who, text });
  if (S.log.length > 300) S.log.shift();
}
// Say a line for an event. opt.force skips the rate limit (it still restarts the gap). Returns the line or null.
function vxSay(event, who, opt) {
  if (!vxOn()) return null;
  opt = opt || {}; const S = vxs();
  if (!opt.force && G.t < S.next) return null;
  const L = opt.line || voiceLine(event, who, vxCtx());
  if (!L) return null;
  vxPush(who, L.text);
  if (L.recover) vxPush(who, L.recover, null, 2);
  S.next = G.t + VX_GAP;
  vxLog(event, who, L.text);
  return L;
}
// A line that stays Tier 0 (the death screen).
function vxTier0(event, ctx) {
  let L = null;
  for (let i = 0; i < 8; i++) { L = voiceLine(event, 'sci', ctx); if (!L || !L.tier) break; }
  return L;
}

// The old chatter (idle jokes, level and boss one-liners, low health) gives way to the new lines under V10.
const VX_SWALLOW = ['start', 'level', 'boss', 'lowhp', 'idle', 'death', 'cursed', 'gacha', 'grudge', 'slot', 'surge', 'rewind', 'fusion', 'mimic'];
function vxSysLine(kind) { return VX_SWALLOW.indexOf(kind) >= 0; }

// ---------------------------------------------------------------- run start
function vxRunStart() {
  if (G.lvl) { vxSay('campaignStart', 'sci', { force: true }); return; }
  const s = G.s10 && typeof S10_BY !== 'undefined' && S10_BY[G.s10.id], id = vxSid();
  if (s && G.s10.run === 1 && s.sci) { vxSay('runStart', 'sci', { force: true, line: { text: s.sci.replace('{id}', id), tier: 0 } }); return; }
  vxSay('runStart', 'sci', { force: true });
}

// ---------------------------------------------------------------- polling (v10Tick)
function vxTick(dt) {
  if (!vxOn() || G.state !== 'play') return;
  const S = vxs();
  S.hintAcc += dt; S.acc += dt;
  if (S.hintAcc >= 0.5) { S.hintAcc = 0; vxHints(); }
  if (S.acc < 0.25) return;
  const step = S.acc; S.acc = 0;
  const p = G.player, hp = p.hp / G.P.maxHp, tut = G.wave && G.wave.n === 0;
  if (!S.started) { if (G.t > 1.5) { S.started = 1; S.lv = G.level; S.bk = G.stats.bossKills || 0; S.wc = G.weapons.filter(w => w && !w.isSpell).length; vxRunStart(); } return; }
  if (tut) return;
  // Pressure.
  if (hp < 0.12) { if (!S.nd && G.t >= (S.ndCd || 0)) { S.nd = 1; S.ndCd = G.t + 30; vxSay('nearDeath', 'sci', { force: true }); } }
  else if (hp > 0.5) S.nd = 0;
  if (hp < 0.35) { if (!S.low) { S.low = 1; vxSay('lowHp', 'sci'); } } else if (hp > 0.6) S.low = 0;
  if (G.t >= (S.surCd || 0)) {
    let n = 0; for (const e of G.enemies) if (!e.dead && !e.charmed && !e.egg && Math.abs(e.x - p.x) < 170 && Math.abs(e.y - p.y) < 170 && Math.hypot(e.x - p.x, e.y - p.y) < 170) n++;
    if (n >= 7 && vxSay('surrounded', 'sci')) S.surCd = G.t + 45;
  }
  // A calm spell, rarely.
  let near = false; for (const e of G.enemies) if (!e.dead && !e.charmed && Math.hypot(e.x - p.x, e.y - p.y) < 450) { near = true; break; }
  S.quiet = near || hp < 0.6 ? 0 : S.quiet + step;
  if (S.quiet > 6 && G.t > 90 && G.t >= (S.quietCd || 0)) { S.quiet = 0; S.quietCd = G.t + 150; if (Math.random() < 0.5) vxSay('quietMoment', 'sci'); }
  // Progress.
  if (G.level > S.lv) { const n = G.level - S.lv; S.lv = G.level; S.ups += n; if (S.ups >= 4) { if (vxSay('levelUp', 'sci')) S.ups = 0; } }
  const wc = G.weapons.filter(w => w && !w.isSpell).length;
  if (wc > S.wc) vxSay('newWeapon', 'sci'); S.wc = wc;
  if (G.wave && G.wave.n >= 1 && !G.wave.active && G.wave.restT > 0 && S.wcN !== G.wave.n) { S.wcN = G.wave.n; vxSay('waveClear', 'sci'); }
  const bk = G.stats.bossKills || 0;
  if (bk > S.bk) { S.bk = bk; if (!vxEv('firstBossKill')) { vxEvSet('firstBossKill'); vxSay('firstBossKill', 'sci', { force: true }); } else vxSay('bossKill', 'sci', { force: true }); }
}

// ---------------------------------------------------------------- first-time hints for the v10 statuses and defences
function vxStatusOf(e) {
  const out = [];
  if (typeof corroded === 'function' && corroded(e)) out.push('Corrosion');
  if (typeof snared === 'function' && snared(e)) out.push('Snared');
  if (e.conjT > G.t) out.push('Conjoined');
  if (typeof f_bleeding === 'function' && f_bleeding(e)) out.push('Bleed');
  if (typeof f_burning === 'function' && f_burning(e)) out.push('Burning');
  if (typeof charged === 'function' && charged(e)) out.push('Charge');
  if (typeof f_possessed === 'function' && f_possessed(e)) out.push('Possessed');
  if (e.fearT > G.t || e.nfFearT > G.t) out.push('Fear');
  const r = typeof ROSTER !== 'undefined' && typeof fightId === 'function' && ROSTER[fightId(e.def)], k = r && r.def && r.def.kind;
  if (k) out.push(k.charAt(0).toUpperCase() + k.slice(1));
  return out;
}
function vxHints() {
  const S = vxs();
  if (G.t < 5 || G.t < S.hintCd || (typeof SET !== 'undefined' && SET.intros === 'off')) return;
  const p = G.player, seen = META.vxSt || (META.vxSt = {});
  for (const e of G.enemies) {
    if (e.dead || Math.abs(e.x - p.x) > 700 || Math.abs(e.y - p.y) > 700) continue;
    for (const k of vxStatusOf(e)) {
      if (seen[k] || !STATUS_HINT[k]) continue;
      seen[k] = 1; saveMeta();
      S.hintCd = G.t + 8;
      vxPush('sci', STATUS_HINT[k], 'NEW: ' + k.toUpperCase(), 4);
      vxLog('statusHint', 'sci', STATUS_HINT[k]);
      return;
    }
  }
}

// ---------------------------------------------------------------- first sightings (intro.js startFoeIntro)
// Returns the SIGHTING line for an enemy or boss key, or null (the caller keeps its own text).
function vxSight(key) {
  if (!vxOn() || !SIGHTING[key]) return null;
  const s = SIGHTING[key];
  vxLog('sighting', 'sci', s.sci);
  return s.sci;
}
// Boss intro card (bosses.js startBossIntro): a first meeting shows the SIGHTING line, later ones a bossArrive line.
function vxBossIntro(e) {
  if (!vxOn() || e.egg) return;
  const id = e.def.id === 'litmus' ? 'litmusstrip' : e.def.id, first = (META.bosses && META.bosses[e.def.id]) === 1;
  let text = first ? vxSight(id) : null;
  if (!text) { const L = voiceLine('bossArrive', 'sci', vxCtx()); if (L) { text = L.text; vxLog('bossArrive', 'sci', text); } }
  const box = text && typeof $ === 'function' && $('biReward');
  if (box) box.insertAdjacentHTML('beforeend', `<div style="margin-top:8px;font-style:italic;opacity:0.85">"${esc(text)}"</div>`);
  vxs().next = G.t + VX_GAP;
}

// ---------------------------------------------------------------- reactions (fight.js)
function vxReaction(id, first) {
  if (!first || id === 'spectral') return;
  vxSay('firstReaction', 'sci', { force: true });
}
// Spectral Combustion's first trigger: the Tier 3 line and its recovery in one call (replaces "Form 12B filed.").
function vxSpectral() {
  if (!vxOn()) return false;
  return !!vxSay('firstSpectralCombustion', 'sci', { force: true });
}

// ---------------------------------------------------------------- end screen (ui.js showGameOver / showDishOver)
function vxEnd(won) {
  if (!G || !G.show || G.debug || typeof $ !== 'function') return;
  const body = $('overBody'); if (!body) return;
  const ctx = vxCtx(), sid = vxSid(), S = vxs();
  const row = (who, L) => L ? `<div class="vxl" style="margin:6px 0;font-style:italic;opacity:0.9;color:#cfd8dc">${esc(L.text)}${L.recover ? ' <span style="opacity:0.7">' + esc(L.recover) + '</span>' : ''}</div>` : '';
  let lines = '';
  const egg = won && !G.lvl;
  if (egg) {
    const first = !vxEv('firstEggWin'), ev = first ? 'firstEggWin' : 'eggWin';
    if (first) vxEvSet('firstEggWin');
    const sci = voiceLine(ev, 'sci', ctx);
    lines = row('sci', sci);
    if (sci) vxLog(ev, 'sci', sci.text);
  } else if (!won) {
    const sci = vxTier0('death', ctx);
    lines = row('sci', sci);
    if (sci) vxLog('death', 'sci', sci.text);
  }
  body.insertAdjacentHTML('afterbegin', `<div class="vxend">${sid ? `<div class="hint">SAMPLE ${esc(sid)}${G.s10 && typeof S10_BY !== 'undefined' && S10_BY[G.s10.id] ? ' | ' + esc(S10_BY[G.s10.id].name) : ''}</div>` : ''}${lines}</div>`);
}

if (typeof module !== 'undefined') module.exports = { vxSid };
