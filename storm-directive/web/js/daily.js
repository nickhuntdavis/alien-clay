'use strict';
// Spawn Prawn - the Daily Challenge. Everyone gets the same run each day: the same sequence (locked ones
// included, as a taster), the same five rivals, the same boss order, the same slide and the same three
// starting weapons to pick from, plus the day's Immune Response level. Your best for the day is kept, with
// a streak for days in a row you've played. (Each piece is drawn from its own seed, so your own unlocks
// can't knock the rest out of step.)
const DAILY = { on: false, rand: null };
function dailyDate(d) { d = d || new Date(); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function dailyRng(key) {
  let h = 2166136261;
  for (const c of 'spawnprawn:' + key) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Run fn with Math.random replaced by the day's seed for that part.
function withSeed(key, fn) {
  const keep = Math.random;
  Math.random = dailyRng(dailyDate() + ':' + key);
  try { return fn(); } finally { Math.random = keep; }
}
// Today's setup (the same on every phone).
function dailySetup() {
  const r = dailyRng(dailyDate() + ':rules'), seqs = Object.keys(PROFILES).sort();
  const shuffled = withSeed('rivals', () => shuffle(RIVALS.slice()).slice(0, 5));
  return { date: dailyDate(), seq: seqs[Math.floor(r() * seqs.length)], heat: Math.floor(r() * 4), rivals: shuffled };
}
function dailyStore() { return META.daily || (META.daily = { days: {}, streak: 0, last: '' }); }
function startDaily() {
  const D = dailySetup(), keep = META.profile;
  META.profile = D.seq; DAILY.on = true; UI.sample = 's001';
  try {
    initAudio();
    withSeed('run', () => newGame());
  } finally { META.profile = keep; DAILY.on = false; }
  G.daily = D.date;
  G.terrain = withSeed('terrain', () => makeTerrain());
  G.bossRoster = withSeed('bosses', () => bossRoster());
  G.rivalSet = D.rivals;
  G.heat = D.heat;
  const start = G.lootQueue.find(q => q.kind === 'start');
  if (start) start.fixed = withSeed('draft', () => genLoot({ kind: 'start' }));
  // Tries and the streak count from the moment you start.
  const S = dailyStore(), day = S.days[D.date] || (S.days[D.date] = { tries: 0 });
  day.tries++;
  if (S.last !== D.date) { S.streak = S.last === dailyDate(new Date(Date.now() - 864e5)) ? S.streak + 1 : 1; S.last = D.date; }
  const keys = Object.keys(S.days).sort(); while (keys.length > 60) delete S.days[keys.shift()]; // keep two months
  saveMeta();
  UI.msgT = 0; $('sysmsg').classList.remove('on');
  UI.afterIntro();
  sysMsg('DAILY CHALLENGE ' + D.date, `${SEQ_LOOK[D.seq].short} against ${D.rivals.map(R => R.name).join(', ')}.${D.heat ? ' Immune Response ' + D.heat + '.' : ''} Same run for everyone today.`, PAL.reward, true);
}
// Better result? A birth beats any death; faster births and longer swims are better.
function dailyBetter(a, b) { if (!b) return true; if (!!a.won !== !!b.won) return !!a.won; return a.won ? a.t < b.t : a.t > b.t; }
// At the end of a daily run: returns { best, isBest } for the end screen.
function dailyRecord(won) {
  if (!G || !G.daily) return null;
  const S = dailyStore(), day = S.days[G.daily] || (S.days[G.daily] = { tries: 1 });
  const res = { won: !!won, t: Math.round(G.t), level: G.level, kills: G.kills };
  const isBest = dailyBetter(res, day.best);
  if (isBest) day.best = res;
  saveMeta();
  return { best: day.best, isBest, tries: day.tries, streak: S.streak };
}
const dailyFmt = b => b ? (b.won ? 'Born in ' + fmtTime(b.t) : 'Swam ' + fmtTime(b.t) + ', Lv ' + b.level) : 'no result yet';
// The title button's second line.
function dailyLine() {
  const D = dailySetup(), S = dailyStore(), day = S.days[D.date];
  return `${SEQ_LOOK[D.seq].short}${D.heat ? ' | Immune ' + D.heat : ''} | ${day && day.best ? 'Best: ' + dailyFmt(day.best) : 'not played yet'}${S.streak > 1 && (S.last === D.date || S.last === dailyDate(new Date(Date.now() - 864e5))) ? ' | ' + S.streak + '-day streak' : ''}`;
}
