'use strict';
// Storm Directive - the Show: a sardonic System announcer, achievements with (occasionally real)
// rewards, a live viewer count and sponsors who send gifts at viewer milestones.

function newShow() {
  return { viewers: 1200, peak: 1200, lastKillT: 0, milestone: 0, idleT: 50, lowHpCd: 0, achieved: {}, order: [], msgQ: [] };
}

function fmtViewers(v) { return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : Math.round(v) + ''; }

function sysMsg(head, body, color, force) {
  if (!G) return;
  const q = G.show.msgQ;
  if (!force && q.length >= 2) return;
  q.push({ head: narratorHead(head), body, color: color || '#8dffc0' });
  if (q.length > 6) q.shift();
}
function sysLine(kind, force) { const L = SYSTEM_LINES[kind]; if (L) sysMsg('SYSTEM MESSAGE', pick(L), '#8dffc0', force); }

function addViewers(n) {
  if (!G) return;
  const s = G.show;
  s.viewers += n * G.P.viewers;
  if (s.viewers > s.peak) s.peak = s.viewers;
  while (s.milestone < VIEWER_MILESTONES.length && s.viewers >= VIEWER_MILESTONES[s.milestone]) sponsorGift(VIEWER_MILESTONES[s.milestone++]);
  if (s.viewers >= 1e6) achieve('viewers1m');
}

function sponsorGift(milestone) {
  const sponsor = pick(SPONSORS), type = pick(['heal', 'rage', 'shield', 'magnet', 'chest', 'nuke', 'chest']);
  const p = me(), a = Math.random() * TAU;
  G.pickups.push(makePickup(type, p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 70, { t: 'sponsor', name: sponsor }));
  sysMsg('SPONSOR GIFT', `${fmtViewers(milestone)} viewers! ${sponsor} has sent you a ${POWERUPS[type].name}. Please thank them by not dying immediately.`, '#ffb400', true);
  achieve('sponsor');
}

function achieve(id) {
  if (!G) return;
  const s = G.show, A = ACHIEVEMENTS[id];
  if (!A || s.achieved[id]) return;
  s.achieved[id] = true;
  s.order.push(id);
  let reward;
  switch (A.reward) {
    case 'box': G.lootQueue.push({ kind: 'chest', src: { t: 'ach', name: A.name } }); reward = 'Reward: a Gold Fan Box.'; break;
    case 'bossbox': G.lootQueue.push({ kind: 'boss', src: { t: 'ach', name: A.name } }); reward = 'Reward: a Gold Boss Box.'; break;
    case 'reroll': G.rerolls++; reward = 'Reward: +1 reroll token.'; break;
    case 'scrap': G.scrap += 40; reward = 'Reward: 40 scrap. Try not to spend it all at once.'; break;
    case 'heal': healPlayer(G.P.maxHp * 0.3, true); reward = 'Reward: 30% health. Use it responsibly.'; break;
    default: reward = pick(NO_REWARD);
  }
  sysMsg('NEW ACHIEVEMENT!', `${A.name}. ${A.desc} ${reward}`, '#ffd23f', true);
  addViewers(1000);
  sfx('level');
}

function onShowKill(e, src) {
  const s = G.show;
  s.lastKillT = G.t;
  addViewers((e.boss ? 25000 : e.elite ? 150 : 4) * (1 + G.t / 300));
  if (G.kills === 1) achieve('firstblood');
  else if (G.kills === 100) achieve('kills100');
  else if (G.kills === 1000) achieve('kills1000');
  else if (G.kills === 5000) achieve('kills5000');
  if (src.last) achieve('lastword');
  if (src.prequel) achieve('spoilers');
  if (src.echo) achieve('echokill');
  if (src.friendly) achieve('friendly');
  if (e === G.grudge) { if (src.grudge) { achieve('grudge'); sysLine('grudge'); } G.grudge = null; }
  if (e.boss) achieve('boss');
}

function updateShow(dt) {
  const s = G.show, p = me();
  if (G.t - s.lastKillT > 4) s.viewers = Math.max(500, s.viewers * (1 - 0.02 * dt));
  s.idleT -= dt;
  if (s.idleT <= 0) { s.idleT = rand(45, 75); sysLine('idle'); }
  s.lowHpCd -= dt;
  if (p.hp < G.P.maxHp * 0.25 && s.lowHpCd <= 0) { s.lowHpCd = 40; sysLine('lowhp'); }
  if (G.t >= 300) achieve('survive5');
  if (G.t >= 600) achieve('survive10');
}
