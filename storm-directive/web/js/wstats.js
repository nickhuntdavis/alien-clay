'use strict';
// Spawn Prawn - per-weapon balance telemetry for the run log (runlog: meta.js runSummary / runText).
// Measures the user's Notion Score per weapon slot (DPS x Targets x Reach x Uptime), per run:
//   held seconds, damage and dps, uptime (0.25 s windows with any damage), attacks, distinct targets per active window,
//   projectile hit rate, average hit distance, kills, share of damage on bosses, tiers taken and when, weapon offers and picks.
// State is G.ws = { slots: { uid: rec }, offers: [] } (G is rebuilt each run, so it resets itself).
// Hooks: game.js damageEnemy -> wsHit, killEnemy -> wsKill, fireWeapon -> wsFire, spawnProj -> wsProj, update -> wsTick;
// ui.js pickLoot -> wsPick; meta.js runSummary -> wsSummary (stored as r.ws), runText -> wsHead, wsText.

const WS_WIN = 0.25;
const wsRoot = w => (w && (w.friendOf || w)) || null;
function wsRec(w) {
  w = wsRoot(w);
  if (!G || !w || w.isSpell || !G.weapons.includes(w)) return null;
  const S = G.ws || (G.ws = { slots: {}, offers: [] });
  let r = S.slots[w.uid];
  if (!r) r = S.slots[w.uid] = { w, key: w24Key(w), t0: G.t, tier: wTier(w), tiers: [], held: 0, dmg: 0, wins: 0, atk: 0, hits: 0, phit: 0, proj: 0, tgt: 0, dist: 0, kills: 0, boss: 0, win: -1, ids: new Set() };
  return r;
}
function wsBank(r) { if (r.win >= 0) { r.wins++; r.tgt += r.ids.size; r.ids.clear(); r.win = -1; } }
function wsTick(dt) {
  if (!G || G.state !== 'play') return;
  const idx = Math.floor(G.t / WS_WIN);
  for (const w of G.weapons) {
    const r = w && wsRec(w); if (!r) continue;
    r.held += dt;
    if (r.win >= 0 && r.win !== idx) wsBank(r);
    const t = wTier(w); if (t > r.tier) { r.tier = t; r.tiers.push([t, Math.round(G.t)]); }
  }
}
function wsHit(e, d, src, hp0) {
  const r = wsRec(src.w); if (!r) return;
  const idx = Math.floor(G.t / WS_WIN);
  if (r.win !== idx) { wsBank(r); r.win = idx; }
  r.ids.add(e);
  const dealt = Math.min(d, Math.max(0, hp0));
  r.dmg += dealt; r.hits++; if (e.boss) r.boss += dealt;
  if (!src.dot && !src.zoneHit) r.phit++;
  r.dist += Math.hypot(e.x - G.player.x, e.y - G.player.y);
}
function wsKill(e, src) { const r = src && src.w && wsRec(src.w); if (r) r.kills++; }
function wsFire(w) { const r = wsRec(w); if (r) r.atk++; }
function wsProj(w) { const r = wsRec(w); if (r) r.proj++; }
// A draft that offers weapons: remember what was on the table and what was taken.
function wsPick(req, opts, o) {
  if (!G || !req || (req.kind !== 'start' && req.kind !== 'slot')) return;
  const id = x => x && x.def && W24_IDS.find(k => WEAPONS[k] === x.def);
  const off = (opts || []).map(id).filter(Boolean), got = id(o);
  if (!got) return;
  (G.ws || (G.ws = { slots: {}, offers: [] })).offers.push({ k: req.kind, off, got, t: Math.round(G.t) });
}

// The log entry (JSON-safe, rounded).
function wsSummary(G) {
  const S = G.ws, out = {};
  if (S) {
    out.w = Object.values(S.slots).map(r => {
      wsBank(r);
      const w = r.w, held = Math.max(r.held, 1e-6), upS = r.wins * WS_WIN, atk = r.atk || r.wins; // (beams: one attack per active window)
      return { id: r.key, n: (WEAPONS[r.key] || {}).name || r.key, tier: wTier(w), up: w.up ? [w.up.p, w.up.l6, w.up.l10].filter(Boolean) : [],
        held: Math.round(r.held), dps: Math.round(r.dmg / held), upPct: Math.min(100, Math.round(upS / held * 100)), atk, hits: r.hits,
        tgt: r.wins ? +(r.tgt / r.wins).toFixed(2) : 0, hit: r.proj >= 5 ? Math.min(100, Math.round(r.phit / r.proj * 100)) : null,
        dist: r.hits ? Math.round(r.dist / r.hits) : 0, kills: r.kills, boss: r.dmg ? Math.round(r.boss / r.dmg * 100) : 0,
        at: Math.round(r.t0), tiers: r.tiers };
    });
    out.off = S.offers;
  }
  if (G.debug && G.debug.sb) out.sb = { heat: G.debug.sb.heat, names: G.weapons.filter(Boolean).map(w => w.def.name) };
  return out;
}
// Lines for runText: the sandbox marker (after the header), the weapon lines and the offers line (at the end).
function wsHead(r) {
  const s = r.ws && r.ws.sb; if (!s) return '';
  const n = (s.names || []).length;
  return ` [SANDBOX heat ${s.heat}] ${n} weapon${n === 1 ? '' : 's'}: ${(s.names || []).join(', ') || '-'}\n`;
}
function wsText(r) {
  const z = r.ws; if (!z) return '';
  let out = '';
  for (const x of z.w || []) {
    out += ` wpn ${x.n} T${x.tier}${x.up.length ? '{' + x.up.join('/') + '}' : ''} held ${x.held}s dps ${x.dps} up ${x.upPct}% tgt ${x.tgt} hit ${x.hit == null ? '-' : x.hit + '%'} dist ${x.dist} kills ${x.kills} boss ${x.boss}% picked@${x.at}s tiers ${x.tiers.length ? x.tiers.map(t => t[0] + '@' + t[1] + 's').join(' ') : '-'}\n`;
  }
  const nm = id => (W24_BY[id] || {}).name || id, o = z.off || [];
  const f = k => o.filter(x => x.k === k).map(x => x.off.map(nm).join(',') + '>' + nm(x.got)).join(' ');
  if (o.length) out += ` offers: start[${f('start')}] slot[${f('slot')}]\n`;
  return out;
}
