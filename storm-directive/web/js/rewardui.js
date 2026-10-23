'use strict';
// Spawn Prawn - one card language for every reward (user, 20 Oct).
//  - Every reward type has one colour, label and icon (RW_CAT), the same on cards, the Build panel and the HUD:
//    weapon, branch, Feat, mutation, modifier, defence, specialise (Catalyst, Concentration), Switched at Birth.
//    Lab view keeps colour in the UI; only the slide goes grey.
//  - Every card gets an icon (rwIco): its own where one exists (weapons, Feats, modifiers), otherwise a plain one
//    for what it does (a shield for defences, a droplet for Mucus mutations and so on).
//  - A fit line under the description (rwFit): Direct (works with something you own), Fits your build (your
//    sample's damage types), Wildcard (a new direction) or Trade-off. Feat upgrades show their numbers before and
//    after instead (rwDelta).
//  - Pending badge (rwHud): how many rewards the Reward Director is holding, top right. A reward held back says so
//    as it lands (director.js dirTick -> rwSaved).
//  - Choosing: a ring in the card's colour round you and its name, as the slide comes back (rwPicked).
// Hooks: ui.js renderLootCards -> rwCls, rwIcoHtml, rwFitHtml; ui.js pickLoot -> rwPicked; render.js drawHud -> rwHud;
// director.js dirTick -> rwSaved.

const RW_CAT = {
  weapon:   { col: '#e6edf2', label: 'WEAPON', ico: 'pistol' },
  branch:   { col: '#ffd23f', label: 'BRANCH', ico: 'link' },
  feat:     { col: '#b48cff', label: 'FEAT', ico: 'nova' },
  mutation: { col: '#e8a598', label: 'MUTATION', ico: 'dna' },
  modifier: { col: '#7fb7d9', label: 'MODIFIER', ico: 'gear' },
  defence:  { col: '#9be3b4', label: 'DEFENCE', ico: 'shield' },
  special:  { col: '#ffb86b', label: 'SPECIALISE', ico: 'flask' },
  switch:   { col: '#f2f2f2', label: 'SWITCHED', ico: 'twins' },
};
const RW_MOD_ICO = { homing: 'seeker', piercing: 'nail', chaining: 'link', ricochet: 'pinball', returning: 'boomerang', orbiting: 'orbit', delayed: 'mine',
  lobbed: 'mortar', trail: 'footprints', selfcentred: 'nova', sweep: 'cyclone', anchored: 'bigbeam', volley: 'gatling', nth: 'dice', growing: 'mitosis',
  scaling: 'hourglass', multiplying: 'twins', summoned: 'drone', gravity: 'singularity', lunge: 'comet' };
const RW_DEF_ICO = { latex: 'pill', thick: 'bubble', fast: 'clock', shell: 'shield', squishy: 'bubble', evasion: 'footprints', thorns: 'spike' };
const RW_TYPE_ICO = { force: 'hammer', mucus: 'droplet', static: 'bolt', blood: 'syringe', soul: 'ghost', acid: 'flask', fire: 'flame', any: 'spray' };
const RW_TYPE_NAME = { force: 'Force', mucus: 'Mucus', static: 'Static', blood: 'Blood', soul: 'Alien', acid: 'Acid', fire: 'Fire' };

const rwCard = o => (o && o.card && typeof CARDS !== 'undefined' ? CARDS.find(c => c.id === o.card) : null);
const rwFeat = o => { const m = o && o.card && /^feat_(.+?)(_up)?$/.exec(o.card); return m && typeof F10 !== 'undefined' ? F10[m[1]] : null; };
function rwCatOf(o) {
  if (!o) return null;
  if (o.def && !o.tag.startsWith('MODIFIER')) return 'weapon';
  const t = o.tag || '';
  if (t === 'NEW FEAT' || t === 'FEAT UPGRADE') return 'feat';
  if (t === 'FORK') return UI.lootReq && UI.lootReq.key && UI.lootReq.key.startsWith('feat:') ? 'feat' : 'branch';
  if (['BRANCH', 'PROMISE', 'WILDCARD', 'MASTERY', 'WEAPON UPGRADE'].includes(t)) return 'branch';
  if (t === 'MUTATION' || t === 'SWAP') return 'mutation';
  if (t.startsWith('MODIFIER')) return 'modifier';
  if (t === 'DEFENCE') return 'defence';
  if (t === 'SPECIALISE') return 'special';
  if (t === 'SWITCHED AT BIRTH' || t === 'TYPE SWAP') return 'switch'; // (Type Swap: modmatrix.js)
  return null;
}
// The icon for a card (an IC key), or null.
function rwIco(o) {
  const cat = rwCatOf(o); if (!cat || cat === 'weapon') return null;
  if (cat === 'feat') { const d = rwFeat(o); return (d && typeof ICON_OF !== 'undefined' && ICON_OF[d.key]) || RW_CAT.feat.ico; }
  if (cat === 'modifier') { const id = String(o.card || '').replace('mod:', ''); return RW_MOD_ICO[id] || RW_CAT.modifier.ico; }
  if (cat === 'defence') return RW_DEF_ICO[o.defence] || RW_CAT.defence.ico;
  if (cat === 'mutation') {
    const c = rwCard(o); if (!c) return RW_CAT.mutation.ico;
    if (c.type) return RW_TYPE_ICO[c.type] || RW_CAT.mutation.ico;
    if (c.family === 'mut:trade') return 'dice';
    if (c.slot === 'weaponmut') return 'gear';
    if (/^r_/.test(c.id)) return 'virus';
    return 'heart';
  }
  if (cat === 'special') return o.family === 'catalyst' ? 'flask' : 'pipette';
  return RW_CAT[cat].ico;
}
const rwCol = o => { const c = rwCatOf(o); return c ? RW_CAT[c].col : null; };
const rwCls = o => { const c = rwCatOf(o); return c ? ' rw rw-' + c : ''; };
function rwIcoHtml(o) {
  const k = rwIco(o), col = rwCol(o);
  if (!k || !IC[k]) return '';
  return `<div class="cico" style="--ic:${col}"><svg class="wicon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="${col}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg></div>`;
}

// ---------------------------------------------------------------- fit lines
const rwHeld = () => (G ? G.weapons.filter(w => w && !w.isSpell && w.def) : []);
const rwInt = t => (typeof DRAFT_INT !== 'undefined' && DRAFT_INT[t]) || t;
function rwFit(o) {
  const cat = rwCatOf(o); if (!cat || !G) return null;
  const held = rwHeld(), T = G.sampleTypes || {};
  const sameType = el => held.filter(w => wElem(w) === el);
  if (cat === 'feat' && o.tag === 'NEW FEAT') {
    const d = rwFeat(o); if (!d) return null;
    if (!d.type) return { k: 'Fits your build', t: 'No damage type and no stamina. It just helps.' };
    const el = rwInt(d.type), same = sameType(el);
    if (same.length) return { k: 'Direct', t: `Same damage type as your ${same[0].def.name}.` };
    if (d.type === T.primary) return { k: 'Fits your build', t: "Your sample's main damage type." };
    if (d.type === T.support) return { k: 'Fits your build', t: "Your sample's second damage type." };
    return { k: 'Wildcard', t: 'A damage type you do not use yet.' };
  }
  if (cat === 'mutation') {
    if (o.tag === 'SWAP') return { k: 'Trade-off', t: o.sub + '. It goes for good.' };
    const c = rwCard(o); if (!c) return null;
    if (c.family === 'mut:trade') return { k: 'Trade-off', t: 'It costs you something. Read the second half.' };
    if (c.type && c.type !== 'any') {
      const n = sameType(rwInt(c.type)).length;
      return n ? { k: 'Direct', t: `Boosts your ${RW_TYPE_NAME[c.type] || c.type} weapons (${n}).` } : { k: 'Wildcard', t: `You have no ${RW_TYPE_NAME[c.type] || c.type} weapon yet.` };
    }
    if (c.slot === 'weaponmut') return { k: 'Direct', t: 'Grows on one of your weapons (3 each at most).' };
    return { k: 'Fits your build', t: 'Changes your body, so every weapon feels it.' };
  }
  if (cat === 'modifier') {
    const rk = /Rank (\d)/.exec(o.sub || '');
    return { k: 'Direct', t: rk ? `${o.modFor} already has it: this ranks it up.` : `Tunes ${o.modFor}. Three modifiers a weapon.` };
  }
  if (cat === 'defence') {
    const used = typeof mutsHeld === 'function' ? mutsHeld() + defsHeld() : 0;
    return /\bNew\b/.test(o.sub || '') ? { k: 'Fits your build', t: `Takes a Genome slot (${used}/${typeof DRAFT !== 'undefined' ? DRAFT.genome : 4} used).` } : { k: 'Direct', t: 'Ranks up a defence you have. No new slot.' };
  }
  if (cat === 'special') return o.family === 'catalyst' ? { k: 'Direct', t: 'A reaction you have already set off.' } : { k: 'Fits your build', t: 'Your statuses build faster and last longer.' };
  if (cat === 'switch') return { k: 'Wildcard', t: 'Same weapon, new damage type. Reactions change with it.' };
  return null;
}
// A Feat upgrade's numbers, before and after (two at most).
function rwDelta(o) {
  if (!o || o.tag !== 'FEAT UPGRADE' || !G) return null;
  const d = rwFeat(o), w = d && G.spells.find(s => s && s.def && s.def.f10 === d);
  if (!w || !w.s) return null;
  let s0, s1;
  try { s0 = Object.assign({}, w.s); w.lvl++; computeStats(w); s1 = Object.assign({}, w.s); } catch (e) { return null; } finally { w.lvl--; try { computeStats(w); } catch (e) { /* ignore */ } }
  const out = [], n = v => (Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10) / 10);
  if (s0.dmg > 0 && Math.abs(s1.dmg - s0.dmg) > 0.05) out.push(`Damage ${n(s0.dmg)} → ${n(s1.dmg)}`);
  if (s0.cd > 0 && Math.abs(s1.cd - s0.cd) > 0.05) out.push(`Cooldown ${s0.cd.toFixed(1)}s → ${s1.cd.toFixed(1)}s`);
  for (const [k, l] of [['area', 'Area'], ['range', 'Reach'], ['dur', 'Lasts']]) if (out.length < 2 && s0[k] > 0 && Math.abs(s1[k] - s0[k]) > 0.05) out.push(`${l} ${n(s0[k])} → ${n(s1[k])}`);
  return out.length ? out.slice(0, 2) : null;
}
function rwFitHtml(o) {
  const dl = rwDelta(o);
  if (dl) return `<div class="rwfit"><b>Next level</b> ${dl.map(esc).join(' · ')}</div>`;
  const f = rwFit(o); if (!f) return '';
  return `<div class="rwfit${f.k === 'Trade-off' ? ' trade' : ''}"><b>${esc(f.k)}</b> ${esc(f.t)}</div>`;
}

// ---------------------------------------------------------------- feedback
const RW_SAVED = { level: 'LEVEL-UP SAVED', chest: 'DNA STRAND SAVED', wup: 'WEAPON UPGRADE SAVED', slot: 'WEAPON SLOT SAVED', boss: 'BOSS DNA SAVED' };
function rwSaved(q) {
  const t = RW_SAVED[q.kind]; if (!t || !G.player) return;
  floatText(G.player.x, G.player.y - G.player.r - 30, t, '#dfe6e2', 11, 1.1);
}
const RW_WAIT = new Set(['level', 'chest', 'boss', 'mutation', 'wup', 'slot']);
function rwHud(top) {
  if (!G || G.state !== 'play') return;
  const n = G.lootQueue.filter(q => RW_WAIT.has(q.kind)).length;
  if (!n) { G.rwN = 0; return; }
  if (n > (G.rwN || 0)) G.rwPulse = 0.5;
  G.rwN = n;
  const txt = n + ' WAITING', y = top + 58;
  ctx.save(); ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.font = 'bold 10px ' + MONO; ctx.textAlign = 'left';
  const w = ctx.measureText(txt).width + 26, x = W - w - 8, k = G.rwPulse > 0 ? 1 + G.rwPulse * 0.3 : 1;
  if (G.rwPulse > 0) G.rwPulse -= 1 / 60;
  const rawc = RAW_COL; RAW_COL = true;
  ctx.globalAlpha = 0.85; filmPanel(x, y, w, 16);
  ctx.fillStyle = RW_CAT.mutation.col; ctx.beginPath(); ctx.arc(x + 9, y + 8, 3.5 * k, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.fillText(txt, x + 17, y + 12);
  RAW_COL = rawc; ctx.restore();
}
function rwPicked(o) {
  if (!G || !G.player || !o) return;
  const col = rwCol(o) || PAL.upgrade, p = G.player;
  ring(p.x, p.y, p.r + 30, col, 0.45, 3); ring(p.x, p.y, p.r + 12, col, 0.3, 2);
  floatText(p.x, p.y - p.r - 26, String(o.title || '').toUpperCase(), col, 12, 1);
}
