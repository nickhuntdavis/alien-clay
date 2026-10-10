'use strict';
// Spawn Prawn - a new sequence decoded. Unlocking a sequence is one of the best moments in the game, so it gets a
// ceremony: the screen goes dark, the locked silhouette is scanned, it flashes and comes up in colour, the name
// slams in with a burst of its colour, and a fanfare plays. Then a short story in three cards (who they are,
// their weapons, their ability), then their page on the sequence screen. The story can be replayed from the
// sequence screen (STORY). Several unlocked at once go one after another.
// Hooks: seqlock.js seqNewHtml (seqReveal); seqsel.js seqRender (the STORY button: seqStoryShow).

const SEQ_STORY = {
  vanguard: { story: 'First out of the tube and it never lets anyone forget it. The Firstborn was the lab\'s control sample: the swimmer every other swimmer gets measured against, and found wanting.',
    weapons: { blaster: 'Honest, accurate gobs of whatever is in its mouth. Its mum would be appalled.', seeker: 'The little brothers and sisters it never asked for. They follow it everywhere and bite whoever it points at.', glaive: 'Goes out, comes back, goes out again. Like every January.' },
    ability: 'When in doubt, lead with the face. It works more often than it should.' },
  bruiser: { story: 'Somebody left the growth serum next to the Chonker\'s dish. Somebody else knocked it in. Now it is mostly membrane, partly attitude and entirely in your way.',
    weapons: { shotgun: 'Every hiccup comes out as a faceful of pellets. Doctors are baffled. Enemies are perforated.', paddle: 'A big floppy slab of afterbirth, swung with real intent.', onesie: 'A babygrow with spikes on. On the outside. Hopefully the outside.', mines: 'You do not want to know what is in them. Neither do they, until they swim into one.' },
    ability: 'It is fine. It is FINE. It is not fine. Everyone stand back.' },
  nerd: { story: 'Its mitochondria read physics at a very good university and will not shut up about it. The Bright Spark does not swim so much as hum, and everything near it gets a nasty shock.',
    weapons: { tesla: 'Rubs itself on a balloon and passes the charge on to everyone nearby. Whether they like it or not.', twin: 'A beam of pure brainwave between it and a twin who may or may not be imaginary.', void: 'It read about black holes and made one. For a toddler, it is very dense.' },
    ability: 'Grows a little cyst full of static and lets it go. It calls this "an experiment".' },
  eggseeker: { story: 'Mum\'s favourite. Dad\'s favourite. The scientist\'s favourite, which is creepier. The Favourite is slow, smug and deadly accurate, and it only bothers with the big ones.',
    weapons: { duedate: 'Marks a victim with a due date. When the date comes, so does the pain.', frost: 'A chalky blast that neutralises anything acidic, including personalities.', toothfairy: 'Leaves a tooth under the enemy\'s pillow. The tooth is loaded.' },
    ability: 'It finds the biggest thing on screen and tells on it. Loudly. With a critical hit.' },
  pusher: { story: 'The Good Eater was the only sample that ate its own agar. Then its neighbours\' agar. Then its neighbours. It heals like a wet dog dries: fast, everywhere and with a smell.',
    weapons: { parasite: 'Plants a tapeworm in whatever it kills. The tapeworm pays rent in bullets.', bubble: 'Blows bubbles that trap small enemies. They crawl along, furious and harmless, until someone pops them.', orbit: 'Things that came out too early, now circling it forever. Do not ask.' },
    ability: 'Latches on to the nearest six enemies and has a little snack. Very good for its skin.' },
  stealth: { story: 'Nobody saw the Quiet One leave the tube. Nobody sees it arrive. It does not spit and it does not shoot: it grows something sharp and swims straight through you.',
    weapons: { flail: 'A tail with a knot in the end, swung like a medieval weapon. Because it is one.', wake: 'Leaves a trail of something nasty wherever it goes, like a hen do.', peekaboo: 'It vanishes. Then it is behind you. Then you are in two pieces.' },
    ability: 'When something gets too close, it slips through to the other side and leaves a mess behind.' },
  acid: { story: 'The Problem Child was born angry and has been getting worse ever since. It dissolves what it touches, and the more it gets hurt, the more it wants to share.',
    weapons: { venom: 'Brings up something green and lobs it at you. Every morning. Without fail.', flamer: 'A burning jet straight from the gut. Antacids do nothing.', redtape: 'Ties its enemies together in red tape, so whatever happens to one happens to all of them.' },
    ability: 'Brings up a ring of acid all around itself. It says sorry. It is not sorry.' },
  splicer: { story: 'The Designer Baby came out of a catalogue. Every gene hand-picked, every trait optimised, every parent bankrupt. It is a little of everything and makes the rest of you better at being you.',
    weapons: { friend: 'A friend only it can see swims along behind it, copying its weapons. Nobody else is invited.', crayon: 'Draws shapes on the dish, then hurts whatever is inside them. Stay inside the lines.', siphon: 'A tube that drinks from whatever it is plugged into. Usually an enemy. Usually.', genegun: 'Fires two strands of DNA twisted together, each carrying the damage of another weapon you own.' },
    ability: 'A squirt of soap at the biggest crowd. Everything in it turns into a bar of something.' },
  redtail: { story: 'The Redtail comes from a very small family tree. Very small. It is lucky in the way that only the very inbred are lucky: everything goes its way, and something always goes a bit wrong too.',
    weapons: { wedding: 'Two barrels, both loaded, both aimed at the in-laws.', moonshine: 'A jug of homebrew that bursts into a puddle. One jug in six is a bad batch and goes up.', banjo: 'Twangs a ring of notes all around it. The low notes are the ones that hurt.' },
    ability: 'When it gets hit, a sister-cousin might split off and fight beside it. Swim into her to make up.' },
  reborn: { story: 'Prawn Again has done this before. Many times. It remembers the old runs in flashes, and the old runs remember it. Every life it has had is in there somewhere, shooting.',
    weapons: { dejavu: 'Fires a slow ghostly shot. Then the same shot happens again. You have seen this before.', ghosts: 'Everything that dies near it leaves a ghost, and the ghosts go hunting.', karma: 'Every hit it takes charges up the next ring of payback.' },
    ability: 'Once per run, when it should be dead, it is not. It has been here before and it knows the way out.' },
  twins: { story: 'Found in a sealed jar at the back of the oldest cabinet in the lab, labelled in faded copperplate: "The Twins. 1887. Do not open." Somebody opened it. They do not blink. They speak at the same time. They only ever want you to come and play.',
    weapons: { doubletrouble: 'They hold hands and come at you from both sides. The second one is always the one that hurts.', twin: 'The beam between them hums like a music box that will not stop.', seeker: 'Their little brothers and sisters. Nobody remembers them being born.' },
    ability: 'You blink, and you are where your twin was, and your twin is where you were. Was it always like that? Which one of you is it now?' },
};

// ---------------------------------------------------------------- the overlay
const REVEAL = { q: [], id: null, t0: 0, raf: 0, page: -1, parts: [], flashed: false, story: false };
function revealEl() {
  let el = document.getElementById('seqReveal');
  if (el) return el;
  el = document.createElement('div'); el.id = 'seqReveal';
  el.innerHTML = '<canvas id="srFx"></canvas><div class="srbox"><div class="srkick" id="srKick"></div><canvas id="srPortrait"></canvas><div class="srname" id="srName"></div><div class="srtag" id="srTag"></div><div class="srbody" id="srBody"></div><div class="srbtns" id="srBtns"></div></div>';
  document.body.appendChild(el);
  return el;
}
// Queue newly decoded sequences (from the end-of-run screen).
function seqReveal(ids) {
  REVEAL.q.push(...ids.filter(id => PROFILES[id] && !REVEAL.q.includes(id) && REVEAL.id !== id));
  if (!REVEAL.id) revealNext();
}
function revealNext() {
  const id = REVEAL.q.shift();
  if (!id) { revealClose(); return; }
  REVEAL.id = id; REVEAL.t0 = performance.now(); REVEAL.page = -1; REVEAL.parts = []; REVEAL.flashed = false; REVEAL.story = false;
  const el = revealEl(), L = SEQ_LOOK[id] || {}, c = L.color || '#ffffff';
  el.style.setProperty('--rc', c); el.className = 'on decoding';
  document.getElementById('srKick').textContent = '';
  document.getElementById('srName').textContent = ''; document.getElementById('srTag').textContent = '';
  document.getElementById('srBody').innerHTML = ''; document.getElementById('srBtns').innerHTML = '';
  if (typeof vibrate === 'function') vibrate(40);
  cancelAnimationFrame(REVEAL.raf); REVEAL.raf = requestAnimationFrame(revealFrame);
}
function revealFrame(now) {
  const id = REVEAL.id; if (!id) return;
  const t = (now - REVEAL.t0) / 1000, L = SEQ_LOOK[id] || {}, c = L.color || '#ffffff', Pr = PROFILES[id];
  const pc = document.getElementById('srPortrait'), fx = document.getElementById('srFx');
  if (!pc || !fx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), PW = pc.clientWidth || 260, PH = pc.clientHeight || 220;
  if (pc.width !== Math.round(PW * dpr)) { pc.width = Math.round(PW * dpr); pc.height = Math.round(PH * dpr); }
  const g = pc.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const T = 1.6; // (the moment of decoding)
  drawSeqPortrait(g, PW, PH, id, t, t < T, false);
  if (t < T) { // the scanner runs over the silhouette
    const y = (t * 1.7 % 1) * PH; g.fillStyle = c; g.globalAlpha = 0.5; g.fillRect(0, y, PW, 2); g.globalAlpha = 0.12; g.fillRect(0, y - 26, PW, 26); g.globalAlpha = 1;
    const kick = 'DECODING SEQUENCE' + '.'.repeat(1 + Math.floor(t * 4) % 3), k = document.getElementById('srKick'); if (k.textContent !== kick) k.textContent = kick;
  } else if (!REVEAL.flashed) {
    REVEAL.flashed = true;
    const el = revealEl(); el.className = 'on decoded';
    document.getElementById('srKick').textContent = 'NEW SEQUENCE DECODED';
    document.getElementById('srName').textContent = Pr.name.toUpperCase();
    document.getElementById('srTag').textContent = (L.tag || '') + (L.quote ? ' | "' + L.quote + '"' : '');
    document.getElementById('srBody').innerHTML = Pr.unlock ? `<p class="srhow">Unlocked: ${esc(Pr.unlock.text)}</p>` : '';
    const fw = fx.clientWidth || window.innerWidth, fh = fx.clientHeight || window.innerHeight;
    for (let i = 0; i < 140; i++) { const a = Math.random() * TAU, v = 120 + Math.random() * 520; REVEAL.parts.push({ x: fw / 2, y: fh * 0.36, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: 1.2 + Math.random() * 1.4, r: 1.5 + Math.random() * 3.5, w: Math.random() < 0.3 }); }
    if (typeof sfx === 'function') sfx(id === 'twins' ? 'decodeTwins' : 'decode'); // (the Twins get a music box)
    if (typeof vibrate === 'function') vibrate([60, 40, 140]);
    setTimeout(() => { if (REVEAL.id === id && REVEAL.page < 0) revealButtons([['MEET ' + Pr.name.replace(/^The /, '').toUpperCase(), () => revealStory(0), true]]); }, 1100);
  }
  if (t >= T) { // a slow halo turning behind the portrait
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = c; g.globalAlpha = 0.35 * Math.max(0, 1 - (t - T) * 0.3) + 0.08; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(PW / 2, PH / 2, PH * (0.38 + i * 0.07) + Math.sin(t * 2 + i) * 3, t * (i + 1) * 0.6, t * (i + 1) * 0.6 + 4.2); g.stroke(); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  // Particles on the full-screen canvas.
  const fw = fx.clientWidth || window.innerWidth, fh = fx.clientHeight || window.innerHeight;
  if (fx.width !== Math.round(fw * dpr)) { fx.width = Math.round(fw * dpr); fx.height = Math.round(fh * dpr); }
  const f = fx.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0); f.clearRect(0, 0, fw, fh);
  if (t >= T && t < T + 0.25) { f.fillStyle = '#ffffff'; f.globalAlpha = 1 - (t - T) / 0.25; f.fillRect(0, 0, fw, fh); f.globalAlpha = 1; }
  const dt = 1 / 60;
  for (const q of REVEAL.parts) { if (q.life <= 0) continue; q.life -= dt; q.vy += 160 * dt; q.vx *= 0.985; q.x += q.vx * dt; q.y += q.vy * dt; f.globalAlpha = Math.min(1, q.life); f.fillStyle = q.w ? '#ffffff' : c; f.beginPath(); f.arc(q.x, q.y, q.r, 0, TAU); f.fill(); }
  f.globalAlpha = 1;
  REVEAL.raf = requestAnimationFrame(revealFrame);
}
function revealButtons(list) {
  const b = document.getElementById('srBtns'); if (!b) return;
  b.innerHTML = list.map(([l, , primary], i) => `<button class="btn ${primary ? 'primary' : ''}" data-i="${i}">${esc(l)}</button>`).join('');
  b.querySelectorAll('button').forEach(x => x.addEventListener('click', e => { e.stopPropagation(); if (typeof sfx === 'function') sfx('pickup'); list[+x.dataset.i][1](); }));
}
// The story: three cards, then their page.
function revealStory(i) {
  const id = REVEAL.id, S = SEQ_STORY[id] || {}, Pr = PROFILES[id], A = SEQ_ABILITY[id], L = SEQ_LOOK[id] || {}, c = L.color || '#ffffff';
  REVEAL.page = i;
  const el = revealEl(); el.className = 'on story';
  const kick = ['THEIR STORY', 'THEIR WEAPONS', 'THEIR GIFT'][i], body = document.getElementById('srBody');
  document.getElementById('srKick').textContent = kick + '  ' + (i + 1) + '/3';
  document.getElementById('srName').textContent = Pr.name.toUpperCase();
  document.getElementById('srTag').textContent = '';
  if (i === 0) body.innerHTML = `<p class="srstory">${esc(S.story || Pr.desc)}</p>`;
  else if (i === 1) body.innerHTML = Pr.weapons.map(w => `<div class="srwep">${typeof iconSVG === 'function' ? iconSVG(WEAPONS[w], 26, c) : ''}<div><b>${esc(WEAPONS[w].name)}</b><span>${esc((S.weapons && S.weapons[w]) || WEAPONS[w].desc)}</span></div></div>`).join('');
  else body.innerHTML = `<div class="srwep"><div><b>${esc(A.name)}</b><span>${esc(S.ability || A.desc)}</span><em>${esc(A.desc)}</em></div></div><div class="srwep"><div><b>${esc(Pr.trait)}</b><em>${esc(Pr.fmt(1).replace(/^./, ch => ch.toUpperCase()))} (at Rank I, as your Primary).</em></div></div>`;
  for (const el2 of [body]) { el2.classList.remove('srswap'); void el2.offsetWidth; el2.classList.add('srswap'); }
  const last = i === 2;
  revealButtons([['SKIP', () => revealDone(), false], [last ? (REVEAL.story ? 'BACK' : 'SEE THEIR PAGE') : 'NEXT', () => (last ? revealDone() : revealStory(i + 1)), true]]);
}
// Done with this one: the next one, or their page.
function revealDone() {
  const id = REVEAL.id;
  if (REVEAL.q.length && !REVEAL.story) { revealNext(); return; }
  const fromSeq = REVEAL.story;
  revealClose();
  if (fromSeq) return; // (replayed from the sequence screen: back where you were)
  META.profile = id; saveMeta();
  if (typeof UI !== 'undefined' && !UI.sample) UI.sample = 's002';
  if (typeof openSeq === 'function') openSeq();
}
function revealClose() {
  cancelAnimationFrame(REVEAL.raf); REVEAL.id = null; REVEAL.q = [];
  const el = document.getElementById('seqReveal'); if (el) el.className = '';
}
// Replay the story from the sequence screen.
function seqStoryShow(id) {
  if (!PROFILES[id]) return;
  REVEAL.id = id; REVEAL.q = []; REVEAL.story = true; REVEAL.parts = []; REVEAL.flashed = true; REVEAL.t0 = performance.now() - 5000;
  const el = revealEl(); el.style.setProperty('--rc', (SEQ_LOOK[id] || {}).color || '#ffffff');
  cancelAnimationFrame(REVEAL.raf); REVEAL.raf = requestAnimationFrame(revealFrame);
  revealStory(0);
}

// The fanfare: a rising arpeggio, a bright chord and a shimmer.
if (typeof SOUNDS !== 'undefined') SOUNDS.decode = [1, t => {
  [392, 523, 659, 784, 1047].forEach((f, i) => { vTone(t + i * 0.07, f, f, 0.35, 0.07, 'triangle'); vTone(t + i * 0.07, f * 2, f * 2, 0.15, 0.015, 'sine'); });
  [523, 659, 784, 1047].forEach(f => vTone(t + 0.42, f, f * 1.003, 1.1, 0.05, 'sawtooth'));
  vTone(t + 0.42, 131, 131, 1.2, 0.08, 'sine');
  vNoise(t + 0.4, 1.2, 'highpass', 6000, 9000, 0.6, 0.03);
}];
// The Twins' sting: a slow music box in a minor key, slightly out of tune, and a breath of cold air.
if (typeof SOUNDS !== 'undefined') SOUNDS.decodeTwins = [1, t => {
  [1319, 1175, 1047, 988, 880, 988, 1047, 659].forEach((f, i) => { vTone(t + i * 0.2, f, f * 0.996, 0.6, 0.05, 'sine'); vTone(t + i * 0.2, f * 2.01, f * 2, 0.25, 0.012, 'sine'); });
  vTone(t + 1.6, 220, 207, 1.8, 0.05, 'triangle');
  vNoise(t, 2.2, 'bandpass', 400, 900, 0.8, 0.02);
}];
