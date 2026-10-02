'use strict';
// Spawn Prawn - Sequence select: the second step before a run (after the sample). A character-collection
// screen for the Epigenetic Profiles: a big animated portrait of each sequence's mutant, its rank, its trait,
// its weapons and synergies, and a collection grid (locked ones are silhouettes with their unlock progress).

const SEQ_LOOK = {
  vanguard:  { short: 'Vanguard', color: '#5fd4e8', tag: 'THE DEFAULT GENE', quote: 'Simple. Honest. Violent.', stats: [3, 3, 3, 3] },
  bruiser:   { short: 'Bruiser', color: '#ff924c', tag: 'THE WALL OF MEAT', quote: 'Hit me. No, really. Go on.', stats: [3, 5, 2, 2] },
  nerd:      { short: 'Mito Nerd', color: '#ffe94a', tag: 'POWERED BY ORGANELLES', quote: 'The mitochondria are doing the work.', stats: [3, 2, 3, 5] },
  eggseeker: { short: 'Egg-Seeker', color: '#ff4d6d', tag: 'THE BOSS EXECUTIONER', quote: 'One shot. One very large hole.', stats: [5, 2, 3, 2] },
  stealth:   { short: 'Stealth', color: '#c77dff', tag: 'SHARP AND SILENT', quote: 'You will not hear it coming. It has no ears either.', stats: [4, 2, 5, 1] },
  pusher:    { short: 'Pusher', color: '#8ac926', tag: 'IT HEALS ITSELF', quote: 'Cuts? Bruises? Gone. Mostly.', stats: [2, 4, 3, 4] },
  acid:      { short: 'Acid-Burner', color: '#d4ff5c', tag: 'ANGRIER WHEN HURT', quote: 'Every scratch makes it worse. For you.', stats: [5, 1, 3, 2] },
  splicer:   { short: 'Splicer', color: '#90e0ef', tag: 'MAKES EVERY GENE BETTER', quote: 'Cold, clever, and a bit of everything.', stats: [2, 3, 3, 5] },
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
  g.beginPath(); g.ellipse(hx, hy, R * 1.25, R * 0.85, 0, 0, TAU); g.fill();
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
    case 'bruiser': {
      g.strokeStyle = '#1b1e22'; g.fillStyle = c + 'dd';
      for (let i = 0; i < 5; i++) { const a = -1.1 + i * 0.55, px = hx + Math.cos(a) * R * 0.95, py = hy + Math.sin(a) * R * 0.66; g.beginPath(); for (let j = 0; j < 6; j++) { const b = j / 6 * TAU; g.lineTo(px + Math.cos(b) * R * 0.28, py + Math.sin(b) * R * 0.28); } g.closePath(); g.fill(); g.stroke(); }
      break;
    }
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
    case 'splicer': {
      g.lineWidth = Math.max(1.5, R * 0.06);
      for (let s = 0; s < 2; s++) { g.strokeStyle = s ? c : '#ffffff'; g.beginPath(); for (let i = 0; i <= 40; i++) { const f = i / 40, a = f * TAU * 1.5 + t * 2 + s * Math.PI; g.lineTo(hx - R * 1.6 + f * R * 3.2, hy - R * 1.35 + Math.sin(a) * R * 0.3); } g.stroke(); }
      g.strokeStyle = c + '88'; for (let i = 0; i <= 12; i++) { const f = i / 12, a = f * TAU * 1.5 + t * 2; g.beginPath(); g.moveTo(hx - R * 1.6 + f * R * 3.2, hy - R * 1.35 + Math.sin(a) * R * 0.3); g.lineTo(hx - R * 1.6 + f * R * 3.2, hy - R * 1.35 - Math.sin(a) * R * 0.3); g.stroke(); }
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
  h += `<div class="sqstats"><span>POWER</span>${bar(L.stats[0])}<span>TOUGHNESS</span>${bar(L.stats[1])}<span>SPEED</span>${bar(L.stats[2])}<span>SUPPORT</span>${bar(L.stats[3])}</div>`;
  h += `<p class="sqdesc">${esc(Pr.desc)} ${open ? 'Spliced in later, it works at half strength.' : ''}</p>`;
  h += `<div class="sqh">SIGNATURE WEAPONS</div><div class="sqweps">${Pr.weapons.map(w => `<div class="sqwep">${iconSVG(WEAPONS[w], 26, open ? L.color : '#5c6670')}<span>${esc(WEAPONS[w].name)}</span></div>`).join('')}</div>`;
  const syn = PROFILE_SYNERGIES.filter(q => q.a === id || q.b === id);
  if (syn.length) h += `<div class="sqh">SPLICE SYNERGIES</div><div class="sqsyn">${syn.map(q => { const o = q.a === id ? q.b : q.a; return `<div class="sqs" style="--oc:${SEQ_LOOK[o].color}"><b>${esc(q.name)}</b><span>+ ${esc(PROFILES[o].name)}: ${esc(q.desc)}</span></div>`; }).join('')}</div>`;
  const info = $('sqInfo');
  info.innerHTML = h;
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
