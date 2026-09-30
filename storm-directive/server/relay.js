'use strict';
// Spawn Prawn - multiplayer relay. Zero dependencies: plain Node (18+), a hand-rolled WebSocket server.
// Players join a room by a 4-letter code (2 to 5 per room). Every client runs its own slide; the relay only
// passes swimmer states, hits and race events between the players in a room.
//
//   PORT=8787 node relay.js
//
// Messages are JSON. Client -> server:
//   { t: 'create', name, ver }             make a room (you are its host)
//   { t: 'join', code, name, ver }         join a room
//   { t: 'start' }                         host only: everyone starts now
//   { t: 'st', ... }                       your swimmer's state, relayed to the room
//   { t: 'hit', to, dmg }                  you hit another player, relayed to them only
//   { t: 'ev', kind, ... }                 race events (won, dead, level...), relayed to the room
// Server -> client:
//   { t: 'room', code, you, host, players: [{ id, name, color }] }
//   { t: 'start', seed, players }          the race begins
//   { t: 'left', id }                      a player disconnected
//   { t: 'err', msg }
//   anything relayed carries { from: id }

const http = require('http');
const crypto = require('crypto');

const PORT = +process.env.PORT || 8787;
const MAX = 5;
const COLOURS = ['#ffb347', '#9ef01a', '#c77dff', '#ff5d8f', '#ffe94a'];
const rooms = new Map(); // code -> { code, host, started, players: Map(id -> client) }
let seq = 1;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end(`Spawn Prawn relay: ${rooms.size} rooms, ${[...rooms.values()].reduce((a, r) => a + r.players.size, 0)} swimmers\n`);
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key || (req.headers.upgrade || '').toLowerCase() !== 'websocket') { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  socket.setNoDelay(true);
  const c = { id: seq++, socket, buf: Buffer.alloc(0), room: null, name: 'Swimmer', color: '#ffffff', seen: Date.now(), frags: [] };
  socket.on('data', d => { c.seen = Date.now(); c.buf = Buffer.concat([c.buf, d]); readFrames(c); });
  socket.on('close', () => leave(c));
  socket.on('error', () => leave(c));
});

// ---------------------------------------------------------------- WebSocket framing
function readFrames(c) {
  for (;;) {
    const b = c.buf;
    if (b.length < 2) return;
    const fin = b[0] & 0x80, op = b[0] & 0x0f, masked = b[1] & 0x80;
    let len = b[1] & 0x7f, off = 2;
    if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
    if (len > 1 << 20) { c.socket.destroy(); return; }
    const mo = off; if (masked) off += 4;
    if (b.length < off + len) return;
    const data = Buffer.from(b.subarray(off, off + len));
    if (masked) for (let i = 0; i < len; i++) data[i] ^= b[mo + (i & 3)];
    c.buf = b.subarray(off + len);
    if (op === 8) { sendFrame(c, 8, Buffer.alloc(0)); c.socket.end(); return; }
    if (op === 9) { sendFrame(c, 10, data); continue; }
    if (op === 10) continue;
    if (op === 1 || op === 0) {
      c.frags.push(data);
      if (!fin) continue;
      const text = Buffer.concat(c.frags).toString('utf8'); c.frags = [];
      let m; try { m = JSON.parse(text); } catch (e) { continue; }
      if (m && typeof m.t === 'string') onMessage(c, m);
    }
  }
}
function sendFrame(c, op, payload) {
  if (c.socket.destroyed) return;
  const n = payload.length;
  const head = n < 126 ? Buffer.from([0x80 | op, n]) : n < 65536 ? Buffer.from([0x80 | op, 126, n >> 8, n & 255]) : (() => { const h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); return h; })();
  c.socket.write(Buffer.concat([head, payload]));
}
const send = (c, m) => sendFrame(c, 1, Buffer.from(JSON.stringify(m)));

// ---------------------------------------------------------------- rooms
function roomInfo(r) { return [...r.players.values()].map(p => ({ id: p.id, name: p.name, color: p.color })); }
function broadcast(r, m, except) { for (const p of r.players.values()) if (p !== except) send(p, m); }
function newCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (;;) { let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; if (!rooms.has(s)) return s; }
}
function enter(c, r) {
  const used = new Set([...r.players.values()].map(p => p.color));
  c.color = COLOURS.find(x => !used.has(x)) || '#ffffff';
  c.room = r; r.players.set(c.id, c);
  for (const p of r.players.values()) send(p, { t: 'room', code: r.code, you: p.id, host: r.host, started: r.started, players: roomInfo(r) });
}
function leave(c) {
  const r = c.room;
  if (!r) return;
  c.room = null; r.players.delete(c.id);
  if (!r.players.size) { rooms.delete(r.code); return; }
  if (r.host === c.id) r.host = r.players.keys().next().value;
  broadcast(r, { t: 'left', id: c.id });
  for (const p of r.players.values()) send(p, { t: 'room', code: r.code, you: p.id, host: r.host, started: r.started, players: roomInfo(r) });
}
function onMessage(c, m) {
  const clean = s => String(s || '').replace(/[^\w '&-]/g, '').slice(0, 16) || 'Swimmer';
  switch (m.t) {
    case 'create': {
      leave(c); c.name = clean(m.name);
      const r = { code: newCode(), host: c.id, started: false, players: new Map() };
      rooms.set(r.code, r); enter(c, r);
      break;
    }
    case 'join': {
      const r = rooms.get(String(m.code || '').toUpperCase().trim());
      if (!r) return send(c, { t: 'err', msg: 'No room with that code.' });
      if (r.started) return send(c, { t: 'err', msg: 'That race has already started.' });
      if (r.players.size >= MAX) return send(c, { t: 'err', msg: 'That room is full (5 swimmers).' });
      leave(c); c.name = clean(m.name); enter(c, r);
      break;
    }
    case 'start': {
      const r = c.room;
      if (!r || r.host !== c.id || r.started) return;
      if (r.players.size < 2) return send(c, { t: 'err', msg: 'You need at least two swimmers.' });
      r.started = true;
      broadcast(r, { t: 'start', seed: Math.floor(Math.random() * 1e9), players: roomInfo(r) });
      break;
    }
    case 'leave': leave(c); break;
    case 'st': case 'ev': if (c.room) { m.from = c.id; broadcast(c.room, m, c); } break;
    case 'hit': {
      const r = c.room, to = r && r.players.get(m.to);
      if (to) send(to, { t: 'hit', from: c.id, dmg: +m.dmg || 0 });
      break;
    }
  }
}

// Drop sockets that have gone quiet (clients send a state several times a second while racing).
setInterval(() => {
  const now = Date.now();
  for (const r of rooms.values()) for (const p of r.players.values()) if (now - p.seen > 45000) p.socket.destroy();
}, 15000);

server.listen(PORT, () => console.log('Spawn Prawn relay on port ' + PORT));
