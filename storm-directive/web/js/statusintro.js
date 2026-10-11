'use strict';
// Spawn Prawn - first-time status cards. The first time ever a buff or debuff chip turns up on your HUD, the
// game stops for a short card explaining it (once per status, ever; Settings > Tutorial brings them back).
// With introductions set to Quiet it is a narrator message instead; Off skips them.
// Only the first two get the full card. After that a new one shows "NEW POWERUP UNLOCKED!" beside its chip for
// a few seconds, and tapping the chip or the message opens the same card (play carries on if you ignore it).
// Hooks: statusIntroCheck(chips), from the HUD each frame; stNewDraw (render.js, the chip), stNewTap (game.js, a tap on a chip).

const ST_FULL = 2; // (full cards before the quiet kind)
const STATUS_INTRO = {
  'OXYTOCIN':         { buff: 1, what: 'A rush of love hormone: double fire rate and no reloads.', tip: 'Spend it on whatever is biggest. When it wears off you get Post-Nut Clarity.' },
  'POST-NUT CLARITY': { buff: 0, what: 'The comedown after Oxytocin: your weapons fire slower, but you see every weak spot (+40% crit chance).', tip: 'It only lasts a few seconds. Big hitters still hit big.' },
  'STAIR GATE':       { buff: 1, what: 'Nothing can hurt you until it runs out.', tip: 'Swim straight through the crowd, or go and stand on the boss.' },
  'WARP':             { buff: 1, what: 'Nap Time: every enemy and bullet is slowed to a crawl.', tip: 'Reposition, line up your shots, get out of the corner.' },
  'AEGIS':            { buff: 1, what: 'The Latex Barrier is up: it reflects enemy bullets and blocks contact.', tip: 'Stand your ground for a moment. 98% effective.' },
  'ECHO':             { buff: 1, what: 'Your future self, left behind by a Rewind. It replays the erased timeline backwards, firing your weapons, then collapses in a bullet-clearing blast.', tip: 'Stay near it: its blast wipes bullets round it.' },
  'FAMILY':           { buff: 1, what: 'Keeping It in the Family: you recombined with your Sister-Cousin. +30% damage and +20% fire rate for a few seconds.', tip: 'Get it again by being hit and swimming into the copy that splits off.' },
  'SISTER-COUSIN':    { buff: 1, what: 'A copy of you split off when you were hit. She fights beside you for a while.', tip: 'Swim into her before she goes to recombine: a big buff.' },
  'CHARGED UP':       { buff: 1, what: 'An Acid and Static reaction made a battery, and some of the charge went to you: +12% fire rate for 3s.', tip: 'Keep mixing Acid and Static to keep it topped up.' },
  'CRUMPLE ZONE':     { buff: 1, what: 'A combo twist (Force + Static) charged a barrier. It blocks the next hit you take, then recharges after 8s.', tip: 'Free mistake. Take the risky line.' },
  'ARMOUR':           { buff: 0, what: 'Your armour is worn: every hit that lands knocks a point off (two from a boss). The chip shows what is left of it.', tip: 'Stay out of trouble for a couple of seconds and it grows back, about half a point a second.' },
  'BEHIND PACE':      { buff: 0, what: 'You are levels behind where you should be by now. Falling behind the curve is what loses runs.', tip: 'Pick up XP, take level and XP upgrades, and use the pickup magnet.' },
  'PILL':             { buff: 0, what: 'You are inside the Morning-After Pill: you swim slower and earn half the XP.', tip: 'Get out of the cloud. It grows, then fades.' },
  'STUCK IN YEAST':   { buff: 0, what: 'A yeast colony is gumming you up: you swim much slower while you are in it.', tip: 'Shoot your way out, then keep clear.' },
  'INFECTION':        { buff: 0, what: 'A yeast infection is spreading: every cell buds more cells.', tip: 'Clear it early with area damage before it doubles again.' },
};
// The key for a chip label ('ECHO x2', 'BEHIND PACE: 4 LV', 'GOLD RUSH 7' all have counts on the end).
function statusKey(label) {
  for (const k in STATUS_INTRO) if (label.startsWith(k)) return k;
  for (const id of (typeof PU_NEW !== 'undefined' ? PU_NEW : [])) if (POWERUPS[id] && label.startsWith(POWERUPS[id].name)) return POWERUPS[id].name;
  return null;
}
function statusInfo(key) {
  if (STATUS_INTRO[key]) return STATUS_INTRO[key];
  const id = Object.keys(POWERUPS).find(k => POWERUPS[k].name === key);
  return id ? { buff: 1, what: POWERUPS[id].desc + '.', tip: 'A pickup. Its countdown is on the chip.' } : null;
}
// Seconds left on a status, where it has a clock.
function statusTimer(key) {
  const left = t => (t > G.t ? t - G.t : null);
  switch (key) {
    case 'OXYTOCIN': return G.rage > 0 ? G.rage : null;
    case 'STAIR GATE': return G.shieldT > 0 ? G.shieldT : null;
    case 'WARP': return G.warp > 0 ? G.warp : null;
    case 'AEGIS': return G.barrier > 0 ? G.barrier : null;
    case 'POST-NUT CLARITY': return left(G.clarityT);
    case 'CHARGED UP': return left(G.chargeUpT);
    case 'ARMOUR': return null;
    case 'FAMILY': return left(G.familyT);
    case 'SISTER-COUSIN': return G.cousin ? left(G.cousin.end) : null;
  }
  const id = Object.keys(POWERUPS).find(k => POWERUPS[k].name === key);
  return id && G.pu && G.pu[id] > 0 ? G.pu[id] : null;
}
function statusIntroCheck(chips) {
  if (!G || G.state !== 'play' || G.debug || G.t < 1 || (typeof SET !== 'undefined' && SET.intros === 'off')) return;
  if (G.stIntroNext > G.t) return;
  for (const [label, colour] of chips) {
    const key = statusKey(label);
    if (!key || (META.seenSt && META.seenSt[key])) continue;
    const I = statusInfo(key);
    if (!I) continue;
    META.seenSt = META.seenSt || {}; META.seenSt[key] = 1;
    if (META.stFull == null) META.stFull = Object.keys(META.seenSt).length - 1; // (saves from before: they have had their cards)
    G.stIntroNext = G.t + 3;
    if (typeof SET !== 'undefined' && SET.intros === 'quiet') { saveMeta(); sysMsg((I.buff ? 'BUFF: ' : 'DEBUFF: ') + key, `${I.what} ${I.tip}`, colour, true); return; }
    if (META.stFull >= ST_FULL) { // (no more interruptions: flag the chip)
      saveMeta();
      (G.stNew = G.stNew || {})[key] = { until: G.realT + 12, colour };
      sfx('pickup');
      return;
    }
    META.stFull++; saveMeta();
    startStatusIntro(key, I, colour);
    return;
  }
}
// The card: the same stage as an enemy's first sighting, with the spotlight on you.
function startStatusIntro(key, I, colour) {
  const p = me(), spot = { x: p.x, y: p.y, r: p.r || 14, def: { color: colour, name: key }, age: 0, flash: 0, name: key };
  G.bossIntro = { e: spot, t: 0, idx: 0, roar: true, z0: ZOOM.z, foe: 'status', status: key };
  G.state = 'bossIntro';
  INPUT.active = false; G.manual = null;
  sfx('level'); vibrate(40);
  if (typeof UI !== 'undefined') UI.openStatusIntro(key, I, colour);
}
// A flagged chip (a status new to you, past the first two cards): a pulsing outline now, and a message beside it.
function stNewKey(label) {
  const key = statusKey(label), N = key && G.stNew && G.stNew[key];
  if (!N) return null;
  if (G.realT > N.until) { delete G.stNew[key]; return null; }
  return key;
}
function stNewOutline(key, x, y, w, h) {
  ctx.save(); ctx.globalAlpha = 0.55 + 0.45 * Math.sin(G.realT * 7); ctx.strokeStyle = G.stNew[key].colour; ctx.lineWidth = 2; ctx.strokeRect(x - 1, y - 1, w + 2, h + 2); ctx.restore();
}
// The message; returns its width.
function stNewMsg(key, x, y) {
  const I = statusInfo(key), msg = I && !I.buff ? 'NEW DEBUFF SPOTTED! TAP TO READ' : 'NEW POWERUP UNLOCKED! TAP TO READ';
  const mw = ctx.measureText(msg).width + 14;
  filmPanel(x, y, mw, 16); ctx.fillStyle = '#ffffff'; ctx.fillText(msg, x + 7, y + 12);
  return mw;
}
// A tap on a flagged chip or its message: the full card.
function stNewTap(key) {
  const N = G.stNew && G.stNew[key], I = statusInfo(key);
  if (!N || !I) return false;
  delete G.stNew[key];
  startStatusIntro(key, I, N.colour);
  return true;
}
