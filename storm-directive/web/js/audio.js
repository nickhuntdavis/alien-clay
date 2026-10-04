'use strict';
// Spawn Prawn - sound and music, all synthesised in Web Audio (no files).
// Effects are layered: each one is a few short voices (a click or crack, a tonal body, a noisy tail), with a
// little random pitch so repeats don't machine-gun. Music is generated as you play: a pad that's always
// there, then bass, kick, hats, snare and an arpeggio fading in as the fight gets busier. Bosses switch it to
// a darker, faster mode with an alarm; the Final Five get a heartbeat and a rising drone. Menus duck it.
const MIX = { ac: null, sfx: null, mus: null, musF: null };
function mixInit() {
  const ac = AUDIO.ctx;
  if (!ac) return false;
  if (MIX.ac === ac) return true;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
  comp.connect(ac.destination);
  MIX.sfx = ac.createGain(); MIX.sfx.gain.value = 1; MIX.sfx.connect(comp);
  MIX.musF = ac.createBiquadFilter(); MIX.musF.type = 'lowpass'; MIX.musF.frequency.value = 16000; MIX.musF.connect(comp);
  MIX.mus = ac.createGain(); MIX.mus.gain.value = 0.0001; MIX.mus.connect(MIX.musF);
  MIX.ac = ac;
  return true;
}
const audioOk = () => !!(AUDIO.on && AUDIO.ctx && AUDIO.ctx.state === 'running' && mixInit());
const jit = (k = 0.06) => 1 + (Math.random() * 2 - 1) * k;

// ---------------------------------------------------------------- voices
function vTone(t, f0, f1, dur, vol, type, dest, att) {
  const ac = AUDIO.ctx, o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || MIX.sfx); o.start(t); o.stop(t + dur + 0.03);
}
function vNoise(t, dur, type, f0, f1, q, vol, dest, att) {
  const ac = AUDIO.ctx, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = sndNoiseBuf(); src.loop = true;
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (att || Math.min(0.006, dur / 4))); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(dest || MIX.sfx); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
}
// A filtered, wobbling tone (boss roars, drones).
function vGrowl(t, f0, f1, dur, vol, cut0, cut1, wob) {
  const ac = AUDIO.ctx, o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), f = ac.createBiquadFilter(), g = ac.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  lfo.frequency.value = wob || 9; lg.gain.value = f0 * 0.06; lfo.connect(lg); lg.connect(o.frequency);
  f.type = 'lowpass'; f.Q.value = 6; f.frequency.setValueAtTime(cut0, t); f.frequency.exponentialRampToValueAtTime(cut1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(MIX.sfx); o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
}

// ---------------------------------------------------------------- effects
const GEMRUN = { n: 0, t: 0 };
const SOUNDS = {
  shot: [0.06, t => { const r = jit(0.08); vNoise(t, 0.03, 'highpass', 3200 * r, 1600, 0.7, 0.03); vTone(t, 880 * r, 420, 0.045, 0.02, 'square'); }],
  hit: [0.045, t => { const r = jit(0.12); vNoise(t, 0.05, 'bandpass', 1500 * r, 500, 1.4, 0.06); vTone(t, 230 * r, 110, 0.05, 0.035, 'triangle'); }],
  crit: [0.08, t => { const r = jit(0.05); vNoise(t, 0.06, 'bandpass', 2400 * r, 700, 1.2, 0.08); vTone(t, 1900 * r, 2600 * r, 0.09, 0.035, 'sine'); vTone(t, 180, 80, 0.07, 0.05, 'triangle'); }],
  kill: [0.035, t => { const r = jit(0.1); vTone(t, 540 * r, 120, 0.13, 0.07, 'sine'); vNoise(t, 0.1, 'bandpass', 1000 * r, 260, 2.2, 0.07); }],
  killBig: [0.1, t => { vTone(t, 170, 38, 0.38, 0.2, 'sine'); vNoise(t, 0.32, 'lowpass', 2600, 180, 0.8, 0.16); vNoise(t, 0.04, 'highpass', 2500, 2500, 0.7, 0.08); vTone(t + 0.02, 640, 140, 0.18, 0.07, 'sine'); }],
  boom: [0.09, t => { const r = jit(0.08); vTone(t, 115 * r, 32, 0.42, 0.16, 'sine'); vNoise(t, 0.36, 'lowpass', 3200 * r, 140, 0.8, 0.15); vNoise(t, 0.05, 'highpass', 2200, 1800, 0.7, 0.07); }],
  gem: [0.03, t => {
    // A run of gems climbs the scale, so hoovering up a pile sounds like it.
    const now = AUDIO.ctx.currentTime; GEMRUN.n = now - GEMRUN.t < 0.35 ? Math.min(14, GEMRUN.n + 1) : 0; GEMRUN.t = now;
    const f = 1050 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33][GEMRUN.n] / 12);
    vTone(t, f, f * 1.01, 0.07, 0.03, 'sine'); vTone(t, f * 2, f * 2, 0.035, 0.008, 'sine');
  }],
  pickup: [0.1, t => { [660, 880, 1320].forEach((f, i) => vTone(t + i * 0.05, f, f, 0.12, 0.06, 'triangle')); vNoise(t, 0.2, 'highpass', 5000, 8000, 0.6, 0.02); }],
  hurt: [0.15, t => { vTone(t, 250, 70, 0.22, 0.1, 'square'); vNoise(t, 0.14, 'bandpass', 900, 200, 1, 0.12); vTone(t, 90, 45, 0.2, 0.12, 'sine'); }],
  react: [0.1, t => { vTone(t, 600, 1300, 0.13, 0.05, 'sine'); vNoise(t, 0.15, 'highpass', 4000, 7000, 0.6, 0.025); }],
  spell: [0.2, t => { vNoise(t, 0.32, 'bandpass', 300, 2200, 1.5, 0.07, null, 0.08); vTone(t, 300, 900, 0.22, 0.05, 'triangle'); }],
  level: [0.2, t => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => { vTone(t + i * 0.055, f, f, 0.3, 0.06, 'triangle'); vTone(t + i * 0.055, f * 2, f * 2, 0.12, 0.012, 'sine'); });
    vNoise(t + 0.1, 0.5, 'highpass', 6000, 9000, 0.5, 0.025); vTone(t, 131, 131, 0.4, 0.06, 'sine');
  }],
  mastery: [0.5, t => {
    [262, 330, 392, 523].forEach(f => vTone(t, f, f, 1.2, 0.045, 'sawtooth', null, 0.03));
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => vTone(t + 0.08 + i * 0.05, f, f, 0.5, 0.05, 'triangle'));
    vNoise(t, 1.4, 'highpass', 5000, 10000, 0.5, 0.04, null, 0.2); vTone(t, 65, 65, 1, 0.12, 'sine');
  }],
  boss: [0.5, t => { vGrowl(t, 95, 52, 1.1, 0.16, 1400, 260, 8); vGrowl(t + 0.03, 142, 70, 0.9, 0.08, 1800, 300, 11); vNoise(t, 0.9, 'lowpass', 900, 120, 3, 0.12, null, 0.08); vTone(t, 55, 38, 1, 0.16, 'sine'); }],
  bossKill: [0.5, t => {
    SOUNDS.boom[1](t); SOUNDS.boom[1](t + 0.18);
    [784, 659, 523, 392].forEach((f, i) => vTone(t + 0.3 + i * 0.09, f, f, 0.5, 0.05, 'triangle'));
    vTone(t + 0.3, 49, 35, 1.4, 0.2, 'sine');
  }],
  zap: [0.08, t => { vTone(t, 1400, 300, 0.08, 0.03, 'sawtooth'); vNoise(t, 0.06, 'highpass', 4000, 2000, 0.8, 0.025); }],
  rewind: [0.5, t => { vTone(t, 1800, 120, 1, 0.07, 'sawtooth'); vNoise(t, 1, 'bandpass', 4000, 300, 2, 0.05); }],
  crack: [0.06, t => { const r = jit(0.2); vNoise(t, 0.05, 'highpass', 2500 * r, 1500, 1, 0.09); vTone(t, 2200 * r, 1600, 0.04, 0.025, 'square'); }],
  death: [1, t => {
    vTone(t, 70, 30, 1.4, 0.22, 'sine');
    [392, 311, 262, 196].forEach((f, i) => vTone(t + 0.15 + i * 0.22, f, f * 0.97, 0.9, 0.05, 'sawtooth', null, 0.02));
    vNoise(t, 1.6, 'lowpass', 1200, 80, 0.8, 0.08, null, 0.05);
  }],
  win: [1, t => {
    vTone(t, 98, 98, 2.2, 0.1, 'sine');
    [523, 659, 784].forEach(f => vTone(t, f, f, 2.2, 0.035, 'sawtooth', null, 0.15));
    [784, 988, 1175, 1568, 1976, 2349].forEach((f, i) => vTone(t + 0.1 + i * 0.07, f, f, 0.9, 0.04, 'triangle'));
    vNoise(t, 2, 'highpass', 6000, 11000, 0.5, 0.04, null, 0.3);
  }],
};
// Play a named effect (rate-limited per name).
function sfx(name) {
  if (!audioOk()) return;
  const d = SOUNDS[name], now = AUDIO.ctx.currentTime;
  if (!d || (AUDIO.last[name] && now - AUDIO.last[name] < d[0])) return;
  AUDIO.last[name] = now;
  try { d[1](now + 0.005); } catch (e) { /* a voice failed: stay quiet */ }
}

// ---------------------------------------------------------------- music
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
// Chord roots (MIDI) and quality per bar. Calm: A minor, i-VI-III-VII. Boss: a grinding i-bII. Final: i-iv-i-V.
const PROG = {
  run: [[57, 'm'], [53, 'M'], [60, 'M'], [55, 'M']],
  boss: [[57, 'm'], [58, 'M'], [57, 'm'], [56, 'd']],
  final: [[57, 'm'], [62, 'm'], [57, 'm'], [64, 'M']],
};
const TRIAD = { m: [0, 3, 7], M: [0, 4, 7], d: [0, 3, 6] };
const MUSIC = { on: false, next: 0, step: 0, I: 0, mode: 'run', vol: 0, lv: {} };
// How busy the fight is, 0..1: the crowd, how hurt you are, and bosses.
function musicTarget() {
  const n = G.enemies.length, p = G.player;
  let I = Math.min(1, n / 110) * 0.7 + Math.min(1, PT() / 300) * 0.25;
  if (p && G.P && p.hp < G.P.maxHp * 0.35) I += 0.2;
  if (G.boss && !G.boss.dead) I = Math.max(I, 0.8);
  if (G.showdown) I = 1;
  return Math.min(1, I);
}
const lay = (I, from) => Math.max(0, Math.min(1, (I - from) / 0.15));
function musicStep(s, t, sd) {
  const ac = AUDIO.ctx, out = MIX.mus, I = MUSIC.I, mode = MUSIC.mode, prog = PROG[mode];
  const pos = s % 16, bar = Math.floor(s / 16), [root, q] = prog[bar % prog.length], tri = TRIAD[q];
  const hot = mode !== 'run';
  // Pad: a slow detuned chord every bar, always there.
  if (pos === 0) {
    for (const iv of tri) for (const dt of [-6, 6]) {
      const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), len = sd * 16;
      o.type = 'sawtooth'; o.frequency.value = mtof(root + iv); o.detune.value = dt;
      f.type = 'lowpass'; f.frequency.value = 500 + 900 * I + (mode === 'final' ? 600 * ((bar % 4) / 3) : 0); f.Q.value = 1;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.018, t + len * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + len * 1.05);
      o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + len * 1.1);
    }
  }
  // Bass: driving eighths (sixteenths with a boss).
  const lb = hot ? 1 : lay(I, 0.2);
  if (lb > 0 && (hot ? true : pos % 2 === 0)) {
    const f = mtof(root - 12 + (pos === 6 || pos === 14 ? 7 : 0));
    const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = mode === 'boss' ? 'sawtooth' : 'square'; o.frequency.value = f;
    fl.type = 'lowpass'; fl.frequency.value = mode === 'boss' ? 900 : 520; fl.Q.value = 4;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045 * lb, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + sd * 1.8);
    o.connect(fl); fl.connect(g); g.connect(out); o.start(t); o.stop(t + sd * 2);
  }
  // Kick: four to the floor; the Final Five get a heartbeat instead.
  const lk = hot ? 1 : lay(I, 0.35);
  const kick = mode === 'final' ? (pos === 0 || pos === 3 || pos === 8 || pos === 11) : pos % 4 === 0;
  if (lk > 0 && kick) vTone(t, 150, 42, 0.2, 0.13 * lk, 'sine', out, 0.002);
  // Hats.
  const lh = lay(I, 0.45);
  if (lh > 0 && pos % 2 === 1) vNoise(t, pos % 4 === 3 ? 0.06 : 0.03, 'highpass', 8000, 7000, 0.7, 0.018 * lh * (pos % 4 === 3 ? 1.4 : 1), out, 0.002);
  // Snare on 2 and 4.
  const ls = hot ? 1 : lay(I, 0.6);
  if (ls > 0 && pos % 8 === 4) { vNoise(t, 0.14, 'bandpass', 1900, 1200, 0.9, 0.05 * ls, out, 0.002); vTone(t, 210, 160, 0.08, 0.03 * ls, 'triangle', out, 0.002); }
  // Arpeggio up through the chord.
  const la = mode === 'final' ? 1 : lay(I, 0.75);
  if (la > 0 && pos % 2 === 0) { const k = (pos / 2) % 6, m = root + 12 + tri[k % 3] + (k >= 3 ? 12 : 0); vTone(t, mtof(m), mtof(m), sd * 1.6, 0.02 * la, 'triangle', out, 0.003); }
  // Boss alarm: a falling two-tone pulse every bar.
  if (mode === 'boss' && pos === 8) { vTone(t, 880, 830, sd * 3, 0.014, 'square', out, 0.01); vTone(t + sd * 3, 784, 740, sd * 3, 0.012, 'square', out, 0.01); }
  // Final Five: a high drone that swells over every four bars.
  if (mode === 'final' && pos === 0 && bar % 4 === 0) {
    const o = ac.createOscillator(), g = ac.createGain(), len = sd * 64;
    o.type = 'sawtooth'; o.frequency.value = mtof(root + 24);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012, t + len * 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05);
  }
}
// Called every frame (game.js frame()). Starts, steers, ducks and stops the music.
function musicTick(dt) {
  const ac = AUDIO.ctx;
  const live = !!(G && ['play', 'pause', 'loot', 'draft', 'bossIntro', 'rewind', 'armoury'].includes(G.state));
  const want = live && SET.music !== false && audioOk();
  if (!MIX.mus) return;
  const now = ac.currentTime;
  if (!want) {
    if (MUSIC.on) { MUSIC.on = false; MIX.mus.gain.cancelScheduledValues(now); MIX.mus.gain.setTargetAtTime(0.0001, now, 0.4); }
    return;
  }
  const menu = G.state !== 'play' && G.state !== 'rewind';
  MUSIC.mode = G.showdown ? 'final' : G.boss && !G.boss.dead ? 'boss' : 'run';
  MUSIC.I += (musicTarget() - MUSIC.I) * Math.min(1, dt * 0.6);
  if (!MUSIC.on) { MUSIC.on = true; MUSIC.next = now + 0.1; MUSIC.step = 0; }
  // Ducked and muffled under menus; full in play.
  MIX.mus.gain.setTargetAtTime(menu ? 0.22 : 0.55, now, 0.25);
  MIX.musF.frequency.setTargetAtTime(menu ? 900 : 16000, now, 0.25);
  const bpm = MUSIC.mode === 'final' ? 138 : MUSIC.mode === 'boss' ? 130 : 104 + 18 * MUSIC.I, sd = 60 / bpm / 4;
  if (MUSIC.next < now - 0.3) MUSIC.next = now + 0.05; // (we fell behind: a hitch, or the tab was away)
  while (MUSIC.next < now + 0.18) { try { musicStep(MUSIC.step, MUSIC.next, sd); } catch (e) { /* skip a step */ } MUSIC.next += sd; MUSIC.step++; }
}
// Nothing plays while the app is in the background.
document.addEventListener('visibilitychange', () => {
  if (!AUDIO.ctx) return;
  try { if (document.hidden) AUDIO.ctx.suspend(); else if (AUDIO.on) AUDIO.ctx.resume(); } catch (e) { /* ignore */ }
});
