'use strict';
// Spawn Prawn - Sequence select: the second step before a run (after the sample). A character-collection
// screen for the Epigenetic Profiles: a big animated portrait of each sequence's mutant, its rank, its trait,
// its weapons and synergies, and a collection grid (locked ones are silhouettes with their unlock progress).

const SEQ_LOOK = {
  vanguard:  { short: 'Firstborn', color: '#5fd4e8', tag: 'THE DEFAULT GENE', quote: 'Simple. Honest. Violent.', stats: [3, 3, 3, 3] },
  bruiser:   { short: 'Chonker', color: '#ff924c', tag: 'THE WALL OF MEAT', quote: 'Hit me. No, really. Go on.', stats: [3, 5, 2, 2] },
  nerd:      { short: 'Bright Spark', color: '#ffe94a', tag: 'POWERED BY ORGANELLES', quote: 'The mitochondria are doing the work.', stats: [3, 2, 3, 5] },
  eggseeker: { short: 'Favourite', color: '#ff4d6d', tag: 'THE BOSS EXECUTIONER', quote: 'One shot. One very large hole.', stats: [5, 2, 3, 2] },
  stealth:   { short: 'Quiet One', color: '#c77dff', tag: 'SHARP AND SILENT', quote: 'You will not hear it coming. It has no ears either.', stats: [4, 2, 5, 1] },
  pusher:    { short: 'Good Eater', color: '#8ac926', tag: 'IT HEALS ITSELF', quote: 'Cuts? Bruises? Gone. Mostly.', stats: [2, 4, 3, 4] },
  acid:      { short: 'Problem Child', color: '#d4ff5c', tag: 'ANGRIER WHEN HURT', quote: 'Every scratch makes it worse. For you.', stats: [5, 1, 3, 2] },
  splicer:   { short: 'Designer Baby', color: '#90e0ef', tag: 'MAKES EVERY GENE BETTER', quote: 'Clever, calculating, and a bit of everything.', stats: [2, 3, 3, 5] },
};
const SEQ = { id: 'vanguard', t: 0, parts: [], tiles: [] };
const ROMAN = ['I', 'II', 'III'];

// ---------------------------------------------------------------- the portrait
// A big stylised mutant sperm facing right, its tail beating, with the sequence's own mutation on it.
function drawSeqPortrait(g, W, H, id, t, locked, mini) {
  const L = SEQ_LOOK[id], c = locked ? '#20252b' : L.color, U = Math.min(W, H * 1.4);
  g.clearRect(0, 0, W, H);
  // Background: a deep glow, a hex grid and a slow scan line.
  const bg = g.createRadialGradient(W * 0.55, H * 0.5, 0, W * 0.55, H * 0.5, Math.max(W, H) * 0.75);
  bg.addColorStop(0, locked ? '#0d1014' : c + '40'); bg.addColorStop(0.6, '#06080c'); bg.addColorStop(1, '#020305');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  if (!mini) {
    g.strokeStyle = locked ? '#ffffff08' : c + '14'; g.lineWidth = 1;
    const hs = 22;
    for (let y = -hs; y < H + hs; y += hs * 0.87) for (let x = (Math.round(y / (hs * 0.87)) % 2) * hs * 0.5 - hs; x < W + hs; x += hs) {
      g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; g.lineTo(x + Math.cos(a) * hs * 0.5, y + Math.sin(a) * hs * 0.5); } g.closePath(); g.stroke();
    }
    const sy = (t * 60) % (H + 40) - 20;
    const sl = g.createLinearGradient(0, sy - 20, 0, sy + 20); sl.addColorStop(0, '#0000'); sl.addColorStop(0.5, locked ? '#ffffff08' : c + '22'); sl.addColorStop(1, '#0000');
    g.fillStyle = sl; g.fillRect(0, sy - 20, W, 40);
  }
  const hx = W * 0.6, hy = H * 0.5 + Math.sin(t * 1.3) * U * 0.015, R = U * (mini ? 0.2 : 0.13);
  // Tail: a travelling wave, thick at the midpiece, thin at the tip.
  const tailN = 26, tailL = R * (mini ? 3.6 : 5.2), beat = id === 'stealth' ? 1.4 : 1;
  const pts = [];
  for (let i = 0; i <= tailN; i++) { const f = i / tailN, amp = R * 0.55 * f * (id === 'bruiser' ? 0.7 : 1); pts.push({ x: hx - R * 0.9 - tailL * f, y: hy + Math.sin(t * 9 * beat - f * 7) * amp, f }); }
  g.lineCap = 'round';
  if (!locked) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = c + '30'; g.lineWidth = R * 0.5; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke(); g.globalCompositeOperation = 'source-over'; }
  for (let i = 1; i < pts.length; i++) { const p = pts[i], q = pts[i - 1]; g.strokeStyle = locked ? '#2b3138' : i < 4 ? '#d9e2ec' : c; g.lineWidth = Math.max(1, R * (id === 'bruiser' ? 0.32 : 0.22) * (1 - p.f * 0.85)); g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(p.x, p.y); g.stroke(); }
  const tip = pts[pts.length - 1];
  // Afterimages (Stealth-Tadpole).
  if (id === 'stealth' && !locked) for (let k = 3; k >= 1; k--) { g.globalAlpha = 0.12 * (4 - k); g.fillStyle = c; g.beginPath(); g.ellipse(hx - k * R * 0.5, hy, R * 1.25, R * 0.85, 0, 0, TAU); g.fill(); } g.globalAlpha = 1;
  // Glow and head.
  if (!locked) { const gl = g.createRadialGradient(hx, hy, 0, hx, hy, R * 3); gl.addColorStop(0, c + '66'); gl.addColorStop(1, c + '00'); g.fillStyle = gl; g.beginPath(); g.arc(hx, hy, R * 3, 0, TAU); g.fill(); }
  const hg = g.createRadialGradient(hx + R * 0.3, hy - R * 0.3, R * 0.1, hx, hy, R * 1.3);
  hg.addColorStop(0, locked ? '#2c333b' : '#ffffff'); hg.addColorStop(0.35, locked ? '#1a1f25' : '#cfd8e3'); hg.addColorStop(1, locked ? '#0c0f13' : '#56606c');
  g.fillStyle = id === 'stealth' && !locked ? '#2b2440' : hg;
  const fat = id === 'bruiser' ? 1.3 : 1; // (the Chonker is a big lad: wide and tall)
  g.beginPath(); g.ellipse(hx, hy, R * 1.25 * fat, R * 0.85 * fat * 1.12, 0, 0, TAU); g.fill();
  g.strokeStyle = locked ? '#3a424b' : c; g.lineWidth = Math.max(1.5, R * 0.08); g.stroke();
  // Acrosome cap.
  g.fillStyle = locked ? '#161a1f' : c + 'aa'; g.beginPath(); g.ellipse(hx + R * 0.45, hy, R * 0.75, R * 0.72, 0, -Math.PI / 2, Math.PI / 2); g.fill();
  if (locked) {
    g.fillStyle = '#5c6670'; g.font = `900 ${Math.round(R * 1.1)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', hx, hy + R * 0.05); g.textBaseline = 'alphabetic';
    return;
  }
  // The mutation.
  g.lineWidth = Math.max(1.5, R * 0.07);
  switch (id) {
    case 'vanguard': {
      g.fillStyle = c; g.fillRect(hx - R * 0.6, hy - R * 0.62, R * 1.2, R * 0.22); // a headband
      g.beginPath(); g.moveTo(hx - R * 0.6, hy - R * 0.55); g.lineTo(hx - R * 1.3, hy - R * 0.9 + Math.sin(t * 8) * R * 0.15); g.lineTo(hx - R * 1.2, hy - R * 0.4); g.fill();
      for (let i = 0; i < 3; i++) { const k = (t * 1.6 + i / 3) % 1; g.globalAlpha = 1 - k; g.beginPath(); g.arc(hx + R * 1.4 + k * W * 0.3, hy + Math.sin(i * 2) * R * 0.3, R * 0.12, 0, TAU); g.fill(); } g.globalAlpha = 1;
      break;
    }
    case 'bruiser': break; // (no plating: the Chonker is just fat, see `fat` above)
    case 'nerd': {
      for (let i = 4; i < tailN - 6; i += 5) { const p = pts[i]; g.fillStyle = c; g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6 + i); g.beginPath(); g.ellipse(p.x, p.y, R * 0.22, R * 0.12, 0.3, 0, TAU); g.fill(); } g.globalAlpha = 1;
      g.strokeStyle = c; g.lineWidth = 1.5;
      for (let k = 0; k < 3; k++) { if (Math.sin(t * 13 + k * 2) < 0.2) continue; const a0 = t * 2 + k * 2.1; g.beginPath(); let x = hx + Math.cos(a0) * R * 1.3, y = hy + Math.sin(a0) * R * 1.0; g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += Math.cos(a0) * R * 0.25 + (Math.random() - 0.5) * R * 0.4; y += Math.sin(a0) * R * 0.25 + (Math.random() - 0.5) * R * 0.4; g.lineTo(x, y); } g.stroke(); }
      break;
    }
    case 'eggseeker': {
      const cx = hx + R * 2.6 + Math.sin(t * 0.9) * R * 0.3, cy = hy + Math.cos(t * 1.1) * R * 0.3, rr = R * 0.7;
      g.strokeStyle = c; g.save(); g.translate(cx, cy); g.rotate(t * 0.8);
      g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, rr * 0.35, 0, TAU); g.stroke();
      for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(rr * 0.55, 0); g.lineTo(rr * 1.3, 0); g.stroke(); }
      g.restore();
      g.fillStyle = '#10141a'; g.fillRect(hx + R * 0.1, hy - R * 0.2, R * 0.95, R * 0.22); g.fillStyle = c; g.fillRect(hx + R * 0.15 + ((t * 2) % 1) * R * 0.7, hy - R * 0.17, R * 0.18, R * 0.16);
      break;
    }
    case 'stealth': {
      g.fillStyle = c; g.beginPath(); g.moveTo(tip.x, tip.y); g.lineTo(tip.x - R * 0.9, tip.y - R * 0.35); g.lineTo(tip.x - R * 0.2, tip.y + R * 0.1); g.closePath(); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(hx + R * 0.6, hy - R * 0.15, R * 0.22, R * 0.07, -0.15, 0, TAU); g.fill();
      break;
    }
    case 'pusher': {
      g.fillStyle = c; g.strokeStyle = c;
      for (let i = 0; i < 6; i++) { const k = (t * 0.4 + i / 6) % 1, x = hx + Math.sin(i * 2.3) * R * 1.8, y = hy + R * 1.6 - k * R * 3.6; g.globalAlpha = Math.sin(k * Math.PI); const s = R * 0.16; if (i % 2) { g.fillRect(x - s, y - s * 0.3, s * 2, s * 0.6); g.fillRect(x - s * 0.3, y - s, s * 0.6, s * 2); } else { g.beginPath(); g.arc(x, y, s * 0.8, 0, TAU); g.stroke(); } }
      g.globalAlpha = 1;
      break;
    }
    case 'acid': {
      for (let i = 0; i < 5; i++) { const k = (t * 0.8 + i / 5) % 1, x = hx - R * 0.6 + i * R * 0.3; g.fillStyle = c; g.globalAlpha = 1 - k; g.beginPath(); g.ellipse(x, hy + R * 0.7 + k * R * 2.2, R * 0.08, R * 0.14, 0, 0, TAU); g.fill(); }
      g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.4, fl = R * (0.6 + 0.3 * Math.sin(t * 12 + i * 2)); const gl = g.createRadialGradient(hx + Math.cos(a) * R, hy + Math.sin(a) * R * 0.8, 0, hx + Math.cos(a) * R, hy + Math.sin(a) * R * 0.8 - fl * 0.5, fl); gl.addColorStop(0, '#ff9e00aa'); gl.addColorStop(1, '#ff540000'); g.fillStyle = gl; g.beginPath(); g.arc(hx + Math.cos(a) * R, hy + Math.sin(a) * R * 0.8 - fl * 0.4, fl, 0, TAU); g.fill(); }
      g.globalCompositeOperation = 'source-over';
      break;
    }
    case 'reborn': rebornPortrait(g, hx, hy, R, c, t); break;
    case 'redtail': redPortrait(g, hx, hy, R, c, t); break;
    case 'splicer': {
      // The double helix inside the head (clipped to it).
      g.save(); g.beginPath(); g.ellipse(hx, hy, R * 1.12, R * 0.74, 0, 0, TAU); g.clip();
      const px = f => hx - R * 0.95 + f * R * 1.9, py = (f, s) => hy + Math.sin(f * TAU * 1.25 + t * 2 + s * Math.PI) * R * 0.42;
      g.lineWidth = Math.max(1, R * 0.04); g.strokeStyle = c + '99'; for (let i = 1; i < 12; i++) { const f = i / 12; g.beginPath(); g.moveTo(px(f), py(f, 0)); g.lineTo(px(f), py(f, 1)); g.stroke(); }
      g.lineWidth = Math.max(1.5, R * 0.07);
      for (let s = 0; s < 2; s++) { g.strokeStyle = s ? c : '#ffffff'; g.beginPath(); for (let i = 0; i <= 40; i++) { const f = i / 40; g.lineTo(px(f), py(f, s)); } g.stroke(); }
      g.restore();
      break;
    }
  }
  // Drifting motes.
  if (!mini) {
    for (const q of SEQ.parts) { g.globalAlpha = q.a * (0.5 + 0.5 * Math.sin(t * 2 + q.s)); g.fillStyle = c; g.beginPath(); g.arc(q.x * W, q.y * H, q.r, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- the screen
function seqOrder() { return Object.keys(PROFILES); }
function openSeq() {
  if (!PROFILES[META.profile] || !profUnlocked(META.profile)) META.profile = 'vanguard';
  SEQ.id = META.profile;
  SEQ.parts = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, a: 0.2 + Math.random() * 0.5, s: Math.random() * 6, v: 0.01 + Math.random() * 0.03 }));
  const smp = SAMPLES.find(s => s.id === UI.sample);
  $('sqSample').textContent = smp ? smp.name : '';
  const ids = seqOrder(), open = ids.filter(profUnlocked).length;
  $('sqCount').innerHTML = `<b>${open}</b>/${ids.length} SEQUENCES DECODED`;
  META.seenProf = META.seenProf || {};
  $('sqGrid').innerHTML = ids.map(id => `<button class="sqtile ${profUnlocked(id) ? '' : 'locked'}" data-seq="${id}" style="--sc:${SEQ_LOOK[id].color}"><canvas></canvas><span>${profUnlocked(id) ? esc(SEQ_LOOK[id].short) : '???'}</span>${profUnlocked(id) ? `<em>${ROMAN[profRank(id) - 1]}</em>` : ''}${profUnlocked(id) && !META.seenProf[id] && id !== 'vanguard' ? '<i>NEW</i>' : ''}</button>`).join('');
  SEQ.tiles = [...$('sqGrid').querySelectorAll('.sqtile')];
  SEQ.tiles.forEach(b => b.addEventListener('click', () => seqPick(b.dataset.seq)));
  seqRender(false);
  UI.show('seqsel');
  $('seqsel').scrollTop = 0;
}
function seqPick(id) {
  if (id === SEQ.id) return;
  SEQ.id = id;
  seqRender(true);
  sfx('pickup');
}
function seqStep(d) { const ids = seqOrder(); seqPick(ids[(ids.indexOf(SEQ.id) + d + ids.length) % ids.length]); }
function seqRender(anim) {
  const id = SEQ.id, Pr = PROFILES[id], L = SEQ_LOOK[id], open = profUnlocked(id), r = profRank(id), kills = profKills(id);
  const box = $('seqsel');
  box.style.setProperty('--sc', open ? L.color : '#5c6670');
  SEQ.tiles.forEach(b => b.classList.toggle('sel', b.dataset.seq === id));
  if (open) { META.seenProf = META.seenProf || {}; if (!META.seenProf[id]) { META.seenProf[id] = true; saveMeta(); const t = SEQ.tiles.find(b => b.dataset.seq === id); const n = t && t.querySelector('i'); if (n) n.remove(); } }
  const lo = PROFILE_RANKS[r - 1], hi = PROFILE_RANKS[r];
  const bar = n => `<div class="sqbar">${Array.from({ length: 5 }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div>`;
  const stars = [0, 1, 2].map(k => `<b class="${k < r && open ? 'on' : ''}"><span>${ROMAN[k]}</span></b>`).join('');
  $('sqBadge').innerHTML = open ? `<div class="sqrank">${stars}</div><div class="sqrl">RANK ${ROMAN[r - 1]}</div>` : `<div class="sqlock">LOCKED</div>`;
  let h = `<div class="sqtag">${esc(L.tag)}</div><div class="sqname">${open ? esc(Pr.name) : esc(Pr.name.replace(/^The /, '').replace(/[A-Za-z]/g, (ch, i) => i % 3 ? '?' : ch))}</div>`;
  if (open) {
    h += `<div class="sqquote">"${esc(L.quote)}"</div>`;
    h += `<div class="sqtrait"><span>DOMINANT TRAIT</span><b>${esc(Pr.trait)}</b><em>${esc(Pr.fmt(profK(id, true)))}</em></div>`;
    h += `<div class="sqxp"><div class="sqxpl"><span>${hi ? `${fmtNum(kills)} / ${fmtNum(hi)} KILLS TO RANK ${ROMAN[r]}` : `${fmtNum(kills)} KILLS | MAX RANK`}</span><span>x${[1, 2, 4][r - 1]} TRAIT</span></div><div class="sqxpb"><i style="width:${hi ? ((kills - lo) / (hi - lo) * 100).toFixed(1) : 100}%"></i></div></div>`;
  } else {
    const u = Pr.unlock, have = Math.min(u.have(), u.need);
    h += `<div class="sqtrait locked"><span>TO DECODE THIS SEQUENCE</span><b>${esc(u.text)}</b><em>${fmtNum(have)} / ${fmtNum(u.need)}</em></div>`;
    h += `<div class="sqxp"><div class="sqxpb"><i style="width:${(have / u.need * 100).toFixed(1)}%"></i></div></div>`;
  }
  { const A = SEQ_ABILITY[id]; h += `<div class="sqabil"><span>STARTING ABILITY</span><b>${esc(A.name)}</b><em>${esc(A.desc)}</em></div>`; }
  h += `<div class="sqstats"><span>POWER</span>${bar(L.stats[0])}<span>TOUGHNESS</span>${bar(L.stats[1])}<span>SPEED</span>${bar(L.stats[2])}<span>SUPPORT</span>${bar(L.stats[3])}</div>`;
  h += `<p class="sqdesc">${esc(Pr.desc)} Only this sequence can draft its weapons. ${open ? 'Spliced in later, it works at half strength and adds them to your drafts.' : ''}</p>`;
  h += `<div class="sqh">EXCLUSIVE WEAPONS</div><div class="sqweps" style="grid-template-columns:repeat(${Pr.weapons.length}, 1fr)">${Pr.weapons.map(w => `<div class="sqwep">${iconSVG(WEAPONS[w], 26, open ? L.color : '#5c6670')}<span>${esc(WEAPONS[w].name)}</span></div>`).join('')}</div>`;
  const syn = PROFILE_SYNERGIES.filter(q => q.a === id || q.b === id);
  if (syn.length) h += `<div class="sqh">SPLICE SYNERGIES</div><div class="sqsyn">${syn.map(q => { const o = q.a === id ? q.b : q.a; return `<div class="sqs" style="--oc:${SEQ_LOOK[o].color}"><b>${esc(q.name)}</b><span>+ ${esc(PROFILES[o].name)}: ${esc(q.desc)}</span></div>`; }).join('')}</div>`;
  const info = $('sqInfo');
  info.innerHTML = h;
  seqHeat();
  const go = $('sqGo');
  go.disabled = !open;
  go.textContent = open ? `EXPRESS ${Pr.name.replace(/^The /, '').toUpperCase()}` : 'LOCKED';
  if (anim) { for (const el of [$('sqHero'), info]) { el.classList.remove('sqswap'); void el.offsetWidth; el.classList.add('sqswap'); } }
}
function seqTick(dt) {
  if (!$('seqsel').classList.contains('on')) return;
  SEQ.t += dt;
  for (const q of SEQ.parts) { q.y -= q.v * dt; q.x += Math.sin(SEQ.t + q.s) * 0.004 * dt; if (q.y < -0.05) { q.y = 1.05; q.x = Math.random(); } }
  const cv = $('sqCanvas'), dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
  if (w && h) {
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSeqPortrait(g, w, h, SEQ.id, SEQ.t, !profUnlocked(SEQ.id), false);
  }
  for (const b of SEQ.tiles) {
    const c = b.querySelector('canvas'), tw = c.clientWidth, th = c.clientHeight;
    if (!tw) continue;
    if (c.width !== Math.round(tw * dpr)) { c.width = Math.round(tw * dpr); c.height = Math.round(th * dpr); }
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSeqPortrait(g, tw, th, b.dataset.seq, SEQ.t * (b.dataset.seq === SEQ.id ? 1 : 0.4), !profUnlocked(b.dataset.seq), true);
  }
}
function seqGo() {
  if (!profUnlocked(SEQ.id)) return;
  META.profile = SEQ.id; saveMeta();
  const hero = $('sqHero'); hero.classList.remove('sqgo'); void hero.offsetWidth; hero.classList.add('sqgo');
  sfx('level');
  setTimeout(() => UI.startGame(true), 450);
}

// Immune Response: how hard the host fights back this run.
function seqHeat() {
  const max = META.heatMax || 0, lv = Math.min(META.heat || 0, max), box = $('sqHeat');
  META.heat = lv;
  let h = `<div class="sqh">IMMUNE RESPONSE</div><div class="sqheat"><button class="sqhb" data-h="-1" ${lv <= 0 ? 'disabled' : ''}>&minus;</button><div class="sqhv"><b>${lv}</b><span>${lv ? '+' + Math.round(IMMUNE_DNA * lv * 100) + '% DNA' : 'NORMAL'}</span></div><button class="sqhb" data-h="1" ${lv >= max ? 'disabled' : ''}>+</button></div>`;
  h += `<div class="sqhl">${IMMUNE.map((x, i) => `<div class="${i < lv ? 'on' : i < max ? '' : 'locked'}"><b>${i + 1}</b> ${i < max ? `${esc(x.name)}: ${esc(x.desc)}` : 'Locked: be born at level ' + i + ' to unlock.'}</div>`).join('')}</div>`;
  box.innerHTML = h;
  box.querySelectorAll('[data-h]').forEach(b => b.addEventListener('click', () => { META.heat = clamp(lv + +b.dataset.h, 0, max); saveMeta(); seqHeat(); sfx('pickup'); }));
}

// ---------------------------------------------------------------- the swimmer in play
// The active swimmer wears its sequences: the primary's colour rims the head, and every sequence you carry
// (the primary and each one you splice in) adds its own mutation, the same ones as on the portraits.
function drawSeqMods(x, y, face, alpha, scale, body, look) {
  face += (body && body.yaw) || 0; // (rocks with the head, drawShip)
  if (!G || !G.genes || !G.genes.active || !G.genes.active.length) return;
  const L = look || NOLOOK, k = S * (scale || 1), t = G.realT, ids = G.genes.active, pc = SEQ_LOOK[ids[0]].color;
  const sq = body && body === G.player && typeof headSquash === 'function' ? headSquash(body) : null;
  const sxs = L.head * L.stretch * (sq ? sq.x : 1), sys = L.head / Math.sqrt(L.stretch) * (sq ? sq.y : 1);
  ctx.save(); ctx.globalAlpha = alpha; RAW_COL = true;
  // Behind the body: afterimages (Stealth).
  if (ids.includes('stealth')) {
    const c = SEQ_LOOK.stealth.color, vx = (body && body.vx) || 0, vy = (body && body.vy) || 0;
    for (let j = 3; j >= 1; j--) {
      ctx.globalAlpha = alpha * 0.1 * (4 - j);
      ctx.save(); ctx.translate(x - vx * 0.035 * j * S, y - vy * 0.035 * j * S); ctx.rotate(face); ctx.scale(sxs, sys);
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(1 * k, 0, 7.5 * k, 5 * k, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    // A fin on the tail tip.
    const D = body && body.tailDraw;
    if (D && D.length > 3) {
      const a = D[D.length - 1], b = D[D.length - 4], ang = Math.atan2(sy(a.y) - sy(b.y), sx(a.x) - sx(b.x)), tx = sx(a.x), ty = sy(a.y);
      ctx.globalAlpha = alpha * 0.85; ctx.fillStyle = c; ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(-2 * k, 0); ctx.lineTo(5 * k, -3.5 * k); ctx.lineTo(3 * k, 0); ctx.lineTo(5 * k, 3.5 * k); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  ctx.globalAlpha = alpha;
  ctx.translate(x, y); ctx.rotate(face); ctx.scale(sxs, sys);
  // The primary's colour: a glowing rim round the head.
  ctx.globalCompositeOperation = 'lighter';
  const gl = ctx.createRadialGradient(1 * k, 0, 4 * k, 1 * k, 0, 14 * k); gl.addColorStop(0, pc + '55'); gl.addColorStop(1, pc + '00');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(1 * k, 0, 14 * k, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = pc; ctx.lineWidth = Math.max(1, 0.9 * k); ctx.beginPath(); ctx.ellipse(1 * k, 0, 7.9 * k, 5.4 * k, 0, 0, TAU); ctx.stroke();
  ctx.lineCap = 'round';
  for (const id of ids) {
    const c = SEQ_LOOK[id].color;
    switch (id) {
      case 'vanguard': {
        // A headband with tails streaming behind.
        ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(-1.5 * k, 0, 1.3 * k, 5.3 * k, 0, 0, TAU); ctx.fill();
        for (const s of [-1, 1]) { const w = Math.sin(t * 9 + s) * 1.6 * k; ctx.beginPath(); ctx.moveTo(-2 * k, s * 4 * k); ctx.quadraticCurveTo(-7 * k, s * 6 * k + w, -12 * k, s * 7.5 * k + w * 1.5); ctx.lineTo(-11 * k, s * 5 * k + w); ctx.closePath(); ctx.fill(); }
        break;
      }
      case 'bruiser': {
        // A Chonker: just fat. A big round belly under the head, a touch of wobble, no plating.
        ctx.fillStyle = '#e9ddd0'; ctx.strokeStyle = c; ctx.lineWidth = Math.max(0.8, 0.5 * k);
        ctx.beginPath(); ctx.ellipse(0.5 * k, 1.2 * k, 8.4 * k, 6.4 * k + Math.sin(t * 4) * 0.25 * k, 0, 0, TAU); ctx.fill(); ctx.stroke();
        break;
      }
      case 'nerd': {
        // Glowing mitochondria packed round the midpiece, and the odd spark.
        for (let i = 0; i < 3; i++) { ctx.fillStyle = c; ctx.globalAlpha = alpha * (0.6 + 0.4 * Math.sin(t * 6 + i * 2)); ctx.beginPath(); ctx.ellipse((-6.5 - i * 2.4) * k, (i % 2 ? 1.2 : -1.2) * k, 1.5 * k, 0.85 * k, 0.3, 0, TAU); ctx.fill(); }
        ctx.globalAlpha = alpha; ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, 0.5 * k);
        if (Math.sin(t * 13) > 0.3) { const a0 = t * 2.3; let px = 1 * k + Math.cos(a0) * 9 * k, py = Math.sin(a0) * 7 * k; ctx.beginPath(); ctx.moveTo(px, py); for (let j = 0; j < 3; j++) { px += Math.cos(a0) * 2 * k + rand(-1.5, 1.5) * k; py += Math.sin(a0) * 2 * k + rand(-1.5, 1.5) * k; ctx.lineTo(px, py); } ctx.stroke(); }
        break;
      }
      case 'eggseeker': {
        // A targeting visor with a scanning light, and a crosshair out front.
        ctx.fillStyle = '#10141a'; ctx.fillRect(0, -2.6 * k, 7 * k, 1.9 * k);
        ctx.fillStyle = c; ctx.fillRect((0.3 + ((t * 1.5) % 1) * 5.2) * k, -2.4 * k, 1.4 * k, 1.5 * k);
        ctx.strokeStyle = c + 'aa'; ctx.lineWidth = Math.max(1, 0.5 * k);
        ctx.save(); ctx.translate(22 * k, 0); ctx.rotate(t * 0.9);
        ctx.beginPath(); ctx.arc(0, 0, 3.5 * k, 0, TAU); ctx.stroke();
        for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(2 * k, 0); ctx.lineTo(5.5 * k, 0); ctx.stroke(); }
        ctx.restore();
        break;
      }
      case 'stealth': {
        // A shadowed head with a white slit of an eye.
        ctx.fillStyle = '#2b2440cc'; ctx.beginPath(); ctx.ellipse(1 * k, 0, 7.5 * k, 5 * k, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(4.5 * k, -1.2 * k, 1.8 * k, 0.55 * k, -0.15, 0, TAU); ctx.fill();
        break;
      }
      case 'pusher': {
        // Healing motes rising off the body: little crosses and rings.
        ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = Math.max(0.8, 0.45 * k);
        for (let i = 0; i < 4; i++) {
          const q = (t * 0.5 + i / 4) % 1, px = Math.sin(i * 2.3) * 9 * k, py = (7 - q * 18) * k, s = 1.4 * k;
          ctx.globalAlpha = alpha * Math.sin(q * Math.PI);
          if (i % 2) { ctx.fillRect(px - s, py - s * 0.3, s * 2, s * 0.6); ctx.fillRect(px - s * 0.3, py - s, s * 0.6, s * 2); } else { ctx.beginPath(); ctx.arc(px, py, s * 0.8, 0, TAU); ctx.stroke(); }
        }
        ctx.globalAlpha = alpha;
        break;
      }
      case 'acid': {
        // Drips falling from the head and little flames licking along its back.
        ctx.fillStyle = c;
        for (let i = 0; i < 3; i++) { const q = (t * 0.9 + i / 3) % 1; ctx.globalAlpha = alpha * (1 - q); ctx.beginPath(); ctx.ellipse((-2 + i * 3) * k, (5.5 + q * 7) * k, 0.7 * k, 1.1 * k, 0, 0, TAU); ctx.fill(); }
        // Flames are drawn solid so they read on a pale field as well as a dark one.
        for (let i = 0; i < 3; i++) {
          const fx = (-3 + i * 3.5) * k, fl = (2.6 + 0.9 * Math.sin(t * 12 + i * 2)) * k, sw = Math.sin(t * 9 + i) * 0.8 * k;
          for (const [cc, kk] of [['#ff5400', 1], ['#ffd166', 0.55]]) { ctx.globalAlpha = alpha * 0.9; ctx.fillStyle = cc; ctx.beginPath(); ctx.moveTo(fx - 1.3 * k * kk, -4.6 * k); ctx.quadraticCurveTo(fx - 1.1 * k * kk, -4.6 * k - fl * kk, fx + sw, -4.6 * k - fl * 1.5 * kk); ctx.quadraticCurveTo(fx + 1.1 * k * kk, -4.6 * k - fl * kk, fx + 1.3 * k * kk, -4.6 * k); ctx.closePath(); ctx.fill(); }
        }
        ctx.globalAlpha = alpha;
        break;
      }
      case 'reborn': rebornMods(k, c, t); break;
      case 'redtail': redMods(k, c, t); break;
      case 'splicer': {
        // A twisting double helix inside the head (clipped to it), with rungs.
        ctx.save(); ctx.beginPath(); ctx.ellipse(1 * k, 0, 6.6 * k, 4.3 * k, 0, 0, TAU); ctx.clip();
        const hxy = (f, s) => [(-4.5 + f * 11) * k, Math.sin(f * TAU * 1.25 + t * 3 + s * Math.PI) * 2.4 * k];
        ctx.lineWidth = Math.max(0.6, 0.3 * k); ctx.strokeStyle = c; ctx.globalAlpha = alpha * 0.6;
        for (let i = 1; i < 9; i++) { const [ax, ay] = hxy(i / 9, 0), [, by] = hxy(i / 9, 1); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, by); ctx.stroke(); }
        ctx.globalAlpha = alpha; ctx.lineWidth = Math.max(0.8, 0.55 * k);
        for (let s = 0; s < 2; s++) { ctx.strokeStyle = s ? c : '#ffffff'; ctx.beginPath(); for (let i = 0; i <= 18; i++) { const [px, py] = hxy(i / 18, s); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
        ctx.restore();
        break;
      }
    }
  }
  RAW_COL = false;
  ctx.restore();
}

// Your weapons' shots and effects take your Primary Sequence's colour for the run (seen once you have the GFP Tag).
function seqWeaponColour(id) {
  let c = (SEQ_LOOK[id] || SEQ_LOOK.vanguard).color;
  // Keep it out of the colours the slide treats specially (elements, static, alerts), so it's only ever "yours".
  const special = h => (typeof ELEM_OF !== 'undefined' && ELEM_OF.has(h)) || (typeof STATIC_HEX !== 'undefined' && STATIC_HEX[h]) || (typeof PAL_ALIAS !== 'undefined' && PAL_ALIAS[h]);
  while (special(c)) c = c.slice(0, 6) + ((parseInt(c[6], 16) + 1) % 16).toString(16);
  G.seqCol = c;
  weaponColours(c);
}
