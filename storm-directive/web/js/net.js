'use strict';
// Spawn Prawn - online versus. 2 to 5 players race to the same egg. Everyone runs their own slide (their own
// monsters, bosses and Final Five); only the swimmers are shared. Other players appear on your slide as rival
// champions in their own colours: shoot them to hurt them, and whoever fertilises their egg first wins.
// A small relay server (storm-directive/server/relay.js) passes the messages between you.

const NET = { ws: null, url: '', name: '', code: '', you: 0, host: 0, players: [], status: '', remote: {}, hitAcc: {}, sendT: 0, pingT: 0, race: null };
const MP_GRACE = 60; // seconds before players can hurt each other
try { NET.url = localStorage.getItem('sd_server') || ''; NET.name = localStorage.getItem('sd_name') || 'Spermy'; } catch (e) { NET.name = 'Spermy'; }

// Deterministic random numbers, so everyone in a race meets the same bosses in the same order.
function seededRand(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- connection
function netConnect(then) {
  if (NET.ws && NET.ws.readyState === 1) { then(); return; }
  let url = (NET.url || '').trim();
  if (!url) { netStatus('Enter the relay server address first.'); return; }
  if (!/^wss?:\/\//.test(url)) url = (/^(localhost|127\.|10\.|192\.168\.)/.test(url) ? 'ws://' : 'wss://') + url;
  netStatus('Connecting...');
  let ws;
  try { ws = new WebSocket(url); } catch (e) { netStatus('That server address does not look right.'); return; }
  NET.ws = ws;
  ws.onopen = () => { netStatus('Connected.'); then(); };
  ws.onerror = () => netStatus('Could not reach the relay server. Check the address and your connection.');
  ws.onclose = () => {
    if (NET.ws !== ws) return;
    NET.ws = null;
    if (NET.race && G && G.mp) { banner('CONNECTION LOST: YOU ARE RACING ALONE', PAL.danger); netEndRace(); }
    NET.code = ''; NET.players = [];
    netStatus('Disconnected.');
  };
  ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch (e) { return; } netOnMessage(m); };
}
function netSend(m) { if (NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(m)); }
function netStatus(s) { NET.status = s; if (typeof UI !== 'undefined' && UI.renderLobby) UI.renderLobby(); }
function netCreate() { netConnect(() => netSend({ t: 'create', name: NET.name, ver: APP_VERSION })); }
function netJoin(code) { netConnect(() => netSend({ t: 'join', code, name: NET.name, ver: APP_VERSION })); }
function netStart() { netSend({ t: 'start' }); }
function netLeave() { netSend({ t: 'leave' }); NET.code = ''; NET.players = []; NET.race = null; if (NET.ws) { const w = NET.ws; NET.ws = null; try { w.close(); } catch (e) { /* closed */ } } netStatus(''); }
const netName = id => (NET.players.find(p => p.id === id) || {}).name || 'A swimmer';

function netOnMessage(m) {
  switch (m.t) {
    case 'room':
      NET.code = m.code; NET.you = m.you; NET.host = m.host; NET.players = m.players;
      netStatus(m.players.length < 2 ? 'Room made. Send the code to a friend.' : m.you === m.host ? 'Ready when you are.' : 'Waiting for the host to start.');
      break;
    case 'err': netStatus(m.msg); break;
    case 'start': netBeginRace(m); break;
    case 'left': {
      const e = G && G.mp && netEntity(m.id);
      if (e) { e.dead = true; sysMsg('RACE UPDATE', `${e.name} has left the race.`, e.color, true); }
      NET.players = NET.players.filter(p => p.id !== m.id);
      if (typeof UI !== 'undefined') UI.renderLobby();
      break;
    }
    case 'st': NET.remote[m.from] = Object.assign(NET.remote[m.from] || {}, m, { at: performance.now() }); break;
    case 'hit':
      if (G && G.mp && G.state === 'play' && G.t > MP_GRACE) {
        const e = netEntity(m.from);
        hurtPlayer(Math.min(28, 4 + Math.sqrt(Math.max(0, m.dmg)) * 1.2), (e ? e.name : netName(m.from)) + ' (player)', e);
      }
      break;
    case 'ev': netEvent(m); break;
  }
}

// ---------------------------------------------------------------- the race
function netBeginRace(m) {
  NET.race = { seed: m.seed, players: m.players };
  NET.remote = {}; NET.hitAcc = {};
  if (typeof UI !== 'undefined') UI.sample = 's001';
  UI.startGame(true);
  const others = m.players.filter(p => p.id !== NET.you), idx = m.players.findIndex(p => p.id === NET.you);
  G.mp = { seed: m.seed, others: others.map(p => p.id) };
  // Same bosses for everyone, in the same order.
  const rnd = seededRand(m.seed), ids = BOSSES.map(b => b.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  G.bossRoster = ids.slice(0, BOSSES_PER_RUN);
  // Everyone starts on the same ring round the egg, evenly spaced.
  const a = idx / m.players.length * TAU;
  G.player.x = Math.cos(a) * 650; G.player.y = Math.sin(a) * 650; cam.x = G.player.x; cam.y = G.player.y;
  for (const p of others) G.enemies.push(makeRemote(p, m.players.findIndex(q => q.id === p.id) / m.players.length * TAU));
}
function makeRemote(p, a) {
  const def = { id: 'remote', name: p.name, hp: 1, speed: 0, armour: 0, r: 15, dmg: 0, xp: 0, color: p.color, shape: 'sperm', ai: 'remote', patterns: [] };
  const e = makeEnemy(def, Math.cos(a) * 650, Math.sin(a) * 650);
  Object.assign(e, { rival: true, remote: p.id, lvl: 1, name: p.name, color: p.color, maxHp: 100, hp: 100, face: 0, mode: 'player' });
  return e;
}
const netEntity = id => G && G.enemies.find(e => e.remote === id && !e.dead);

// Other players' swimmers follow their broadcast state (from rivalAI).
function remoteAI(e, dt) {
  const s = NET.remote[e.remote];
  if (!s) return;
  if (s.dead) { e.dead = true; return; }
  const lag = Math.min(0.3, (performance.now() - s.at) / 1000);
  const tx = s.x + (s.vx || 0) * lag, ty = s.y + (s.vy || 0) * lag;
  const k = 1 - Math.pow(0.001, dt);
  if (Math.hypot(tx - e.x, ty - e.y) > 400) { e.x = tx; e.y = ty; } else { e.x = lerp(e.x, tx, k); e.y = lerp(e.y, ty, k); }
  e.face = s.hd || 0;
  e.lvl = s.lvl || 1;
  e.maxHp = s.mhp || 100; e.hp = Math.max(1, s.hp || 1);
  e.r = 12 * (1 + SWIM.hitGrowth * (e.lvl - 1));
  e.vis = Math.hypot(e.x - me().x, e.y - me().y) < 900;
  e.cnt = s.cnt;
}
// Your weapons hit another player: pile it up and send it a few times a second (from damageEnemy).
function netHit(e, dmg) {
  e.flash = 0.07;
  if (G.t < MP_GRACE) { if (!(e.graceT > G.realT)) { e.graceT = G.realT + 1.5; floatText(e.x, e.y - e.r - 10, 'NO FIGHTING YET', XR.white, 11, 0.8); } return 0; }
  NET.hitAcc[e.remote] = (NET.hitAcc[e.remote] || 0) + dmg;
  return dmg;
}
function netTick(dt) {
  if (!G.mp || !NET.race) return;
  NET.sendT -= dt;
  if (NET.sendT <= 0) {
    NET.sendT = 0.1;
    const p = me();
    netSend({ t: 'st', x: Math.round(p.x), y: Math.round(p.y), vx: Math.round(p.vx || 0), vy: Math.round(p.vy || 0), hd: +(p.hd != null ? p.hd : p.face).toFixed(2),
      lvl: G.level, hp: Math.round(p.hp), mhp: Math.round(G.P.maxHp), cnt: spermCount() });
    for (const id in NET.hitAcc) { if (NET.hitAcc[id] > 0) netSend({ t: 'hit', to: +id, dmg: Math.round(NET.hitAcc[id]) }); }
    NET.hitAcc = {};
  }
}
// Keep the connection alive in the lobby and while you are in a menu (from UI.tick).
function netKeepAlive(dt) {
  if (!NET.ws) return;
  NET.pingT -= dt;
  if (NET.pingT <= 0) { NET.pingT = 10; netSend({ t: 'ping' }); }
}
function netEvent(m) {
  const e = G && G.mp && netEntity(m.from), name = e ? e.name : netName(m.from);
  if (m.kind === 'won') {
    if (e) e.dead = true;
    if (G && G.mp && (G.state === 'play' || G.state === 'loot' || G.state === 'pause' || G.state === 'bossIntro')) {
      G.rivalWinner = name;
      netEndRace();
      gameOver();
    }
  } else if (m.kind === 'dead') {
    if (e) { e.dead = true; spawnPart(e.x, e.y, e.color, 40, 260, 0.8, 4); }
    if (G && G.mp) sysMsg('RACE UPDATE', `${name} has been absorbed${m.by ? ' by ' + m.by : ''}. One fewer.`, e ? e.color : XR.white, true);
  } else if (m.kind === 'final') {
    if (G && G.mp) sysMsg('RACE UPDATE', `${name} has reached the Final Five. Hurry.`, e ? e.color : XR.white, true);
  }
}
// Your race is over (won, absorbed, or someone else got there first).
function netFinish(won) {
  if (!G || !G.mp || !NET.race) return;
  netSend({ t: 'ev', kind: won ? 'won' : 'dead', by: G.stats.lastHit || '' });
  netEndRace();
}
function netEndRace() { NET.race = null; }
