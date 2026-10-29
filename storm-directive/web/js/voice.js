'use strict';
// Spawn Prawn v10 - narrative line tables and picker (voice.js).
// Owns: the caption lines for in-run events (VOICE, one pool per event under the 'sci' key), the enemy and
// boss first-sighting lines (SIGHTING), the Layer 2 first-time status hints (STATUS_HINT), the sample
// ID convention (sampleId) and the line picker (voiceLine). Canon: storm-directive/voice_and_tone.md
// (tone only, no personas since 29 Oct 2026). Rules baked in: lines are Tier 0 about
// 90% of the time (Tier 1 about 8%, Tier 2 about 2%); Tier 3 only for explicitly Tier 3 events
// (EVENT_TIER) or when ctx.tier3 is set; Tier 2 and 3 lines carry a flat `recover` line to show next.
// Pure data and logic: no DOM, no G, Math.random only.
// Hooks: none here; voice10.js calls voiceLine() and sampleId() (the wiring lives there).
//
// Line tokens: {s} = sample id (ctx.sample, default '1A'), {n} = wave number (ctx.wave).
// Line options (Scientist objects): needs:'wave' (only when ctx.wave is given), minRun:N (letter drift,
// only when ctx.run >= N). The consciousness lines are plain strings.

const VT0 = t => ({ t, tier: 0 });
const VT1 = t => ({ t, tier: 1 });
const VT2 = (t, recover) => ({ t, tier: 2, recover });
const VT3 = (t, recover) => ({ t, tier: 3, recover });
const VW = t => ({ t, tier: 0, needs: 'wave' });
const VRUN = (t, minRun) => ({ t, tier: 0, minRun });

// Events whose Scientist lines are all of one explicit tier (they skip the 90/8/2 roll).
const EVENT_TIER = { celestialDrop: 2, firstSpectralCombustion: 3, firstEggWin: 3 };

const VOICE = {
  runStart: {
    sci: [
      VT0('Sample {s} loaded. Slide temperature: 37.0 degrees. Mood of the slide: not recorded.'),
      VT0('Run begins. The consent form covers "unspecified outcomes". It covers this.'),
      VT0('Four hundred million others were not selected. They have been disposed of correctly.'),
      VT0('Recording started. Previous samples are on the shelf. Nobody has asked about the shelf.'),
      VT0('Sample {s} placed on the slide. The slide has not been cleaned since Tuesday.'),
      VT0('Begin. I have a flask of tea and no expectations.'),
      VT0('Sample {s}: motile, intact, unaware of the budget.'),
      VT0('Timer started. The immune system has been informed, in the sense that it lives here.'),
      VT1('Sample {s}. I have a good feeling about this one. That is not a scientific statement. Disregard it.'),
      VRUN('Sample {s} again. I have started leaving the lamp on for it. The lamp is on a timer. Disregard.', 4),
    ],
  },

  waveClear: {
    sci: [
      VW('Wave {n} of 20 complete. Casualties: all of them, on their side.'),
      VT0('Wave cleared. The slide has been wiped. The slide will not stay wiped.'),
      VT0('Hostiles removed. Residue logged as "organic". It is a generous category.'),
      VT0('Interval. Please do not interpret it as safety.'),
      VW('Wave {n} concluded. The sample is intact, which is the only column I was told to fill in.'),
      VT0('Count: none remaining. Count in thirty seconds: unknown.'),
      VT0('Cleared. Cleaning the slide would invalidate the data, so I will not.'),
      VT0('The next wave is already loading. I did not ask it to. It is very keen.'),
      VT1('Better than the model predicted. The model was written by me, so this is awkward.'),
    ],
  },

  levelUp: {
    sci: [
      VT0('Genetic modification continues. Quality control remains theoretical.'),
      VT0('Another mutation offered. The sample has not read the side effects. Nobody has.'),
      VT0('Genome altered. The change has not been peer reviewed. Peers have been invited.'),
      VT0('Gain recorded. The previous genome has been retired without ceremony.'),
      VT0('Selection pressure applied. Selection pressure was always going to be applied.'),
      VT0('New traits available. Choose one. The others will be discarded, as is traditional.'),
      VT0('Mutation rate: elevated. Cancer risk: not a metric in this study.'),
      VT0('A fresh strand of DNA. Handle it by the edges.'),
      VT1('The curve is steeper than I planned. I am choosing to find this interesting.'),
    ],
  },

  badCardTaken: {
    sci: [
      VT0('Selection noted. The alternative was not recorded. It was probably fine.'),
      VT0('Suboptimal. I am recording it as "exploratory".'),
      VT0('The sample selected the weaker trait. Natural selection has been informed.'),
      VT0('Interesting choice. I use "interesting" in the technical sense: I would not have done that.'),
      VT0('Error in the sample\'s judgement. The sample has no judgement. This is consistent.'),
      VT0('Trait acquired. Expected benefit: none. Expected cost: also none, which is something.'),
      VT0('Rejected options will be incinerated. Not the options. The paperwork.'),
      VT0('Choice logged. It will be misquoted in the discussion section.'),
      VT1('I would like it noted that I did not choose that one.'),
    ],
  },

  newWeapon: {
    sci: [
      VT0('Subject has acquired additional offensive capability. This is unlikely to improve its temperament.'),
      VT0('New apparatus attached. Warranty void on contact with biology.'),
      VT0('Weapon acquired. The risk assessment is on the desk. It is a short document.'),
      VT0('One more thing that can hurt people. The sample is becoming well-rounded.'),
      VT0('Additional armament logged. I did not authorise it. I also did not prevent it.'),
      VT0('The sample now has more ways to cause harm than the form has boxes for.'),
      VT0('Weapon mounted. Please keep limbs clear. The sample has no limbs. Please keep the tail clear.'),
      VT0('Equipment changed. The old equipment is not being returned to stores.'),
      VT1('That one is rather good. I mention it for the record.'),
      VT2('That is a weapon I did not know was in the pool. I will need to check the pool.', 'Equipment logged.'),
    ],
  },

  lowHp: {
    sci: [
      VT0('Vital signs: concerning. Data quality: excellent.'),
      VT0('Structural integrity of Sample {s} is now a matter of opinion.'),
      VT0('The membrane is compromised. It has been compromised before. It is a recurring theme.'),
      VT0('Condition: poor. The sample is still moving. This is not a good indicator, only a visible one.'),
      VT0('I have noted the damage. I have also noted that I cannot do anything about it.'),
      VT0('The immune system is winning. The immune system always thinks it is winning.'),
      VT0('Cell wall breach logged. Form pending.'),
      VT0('Cytoplasm is leaving the sample. Cytoplasm is not supposed to do that.'),
      VT1('Health is low. I find I am watching the number rather than the screen. Unprofessional.'),
    ],
  },

  surrounded: {
    sci: [
      VT0('Hostile density: high. Escape routes: a matter of definition.'),
      VT0('The sample is encircled. It is, technically, also at the centre of attention.'),
      VT0('Sixteen specimens within one body length. The count will be revised upward.'),
      VT0('Containment has been achieved by the specimens. Not by me. I want to be clear.'),
      VT0('Geometry is not on the sample\'s side.'),
      VT0('The enemy has achieved an even distribution around the sample. It is very tidy.'),
      VT0('Encirclement in progress. The terminology is military. The reality is mostly mucus.'),
      VT0('I recommend leaving. I note there is no recommended direction.'),
    ],
  },

  nearDeath: {
    sci: [
      VT0('The subject is a few hits from the end of the trial. I have prepared the paperwork in advance.'),
      VT0('Final readings are being taken. Please do not take this personally.'),
      VT0('Remaining health is in single figures. I am not going to say which.'),
      VT0('If the sample has a plan, now would be an acceptable time.'),
      VT0('Critical. I have started a new line on the death form.'),
      VT0('This is the portion of the experiment I describe as "the data".'),
      VT0('Integrity: negligible. Progress: unaffected. Biology does not read the room.'),
      VT0('I have already written "cause of death". I left the field blank. Do not make me fill it in.'),
    ],
  },

  bossArrive: {
    sci: [
      VT0('A larger specimen. The slide was already adequately occupied.'),
      VT0('New arrival. Mass: considerable. Welcome: not prepared.'),
      VT0('Principal specimen detected. I use the term because the form does. I did not write the form.'),
      VT0('The specimen is significantly larger than the sample. This is the part of the study where that matters.'),
      VT0('The slide has developed an occupant. It appears to own the slide.'),
      VT0('Unscheduled arrival. I would object, but nobody is listening to me.'),
      VT0('Size ratio: unfavourable. Recording continues.'),
      VT0('It has noticed the sample. I have noticed it noticing.'),
      VT0('Large. Hostile. Present. The three headings of today\'s report.'),
    ],
  },

  bossKill: {
    sci: [
      VT0('Specimen terminated. Sample intact. Report to follow.'),
      VT0('Large organism deceased. Disposal is a matter for the sink.'),
      VT0('The principal specimen is dead. I have updated the survey: slightly fewer large things.'),
      VT0('It had a name. It now has a cause of death. Both are on the form.'),
      VT0('Result: favourable. I distrust favourable results.'),
      VT0('That is a remarkable amount of cytoplasm. Please do not step in it.'),
      VT0('Sample {s} has killed something larger than itself. That is not a data point. That is a category.'),
      VT0('Hostility reduced to residue. Residue to be mopped in the morning.'),
      VT1('That was not in the model. Noted.'),
      VT2('It died. It actually died. I had it down as a stalemate.', 'Residue logged.'),
    ],
  },

  firstBossKill: {
    sci: [
      VT0('First principal specimen terminated. Added to the log as "unexpected".'),
      VT0('First large kill. Please remember this one. It sets the baseline for disappointment later.'),
      VT2('The sample has killed a specimen of that size. I will need to reweigh the sample.', 'Recorded.'),
    ],
  },

  death: {
    sci: [
      VT0('Cause of death: optimism.'),
      VW('Subject expired in wave {n} of 20. Promising. Get me another one.'),
      VT0('Time of death recorded. Time of death was inevitable.'),
      VT0('Sample {s} is no longer motile. This is the main property I was trying to preserve.'),
      VT0('End of run. The sample has been disposed of in the usual way. The usual way is a sink.'),
      VT0('Subject deceased. I am required to say the sample made a valuable contribution. It contributed.'),
      VT0('The sample has ceased. The slide continues. The slide, in fairness, was never invested.'),
      VT0('Result: death. Duration: short. Analysis: extensive and unnecessary.'),
      VT0('Sample {s} will not be needed again. I have written "needed" in pencil.'),
      VRUN('Sample {s} terminated. I have decided not to write an adjective. I know which one it would be.', 5),
      VRUN('Sample {s} is gone. Tomorrow I will use the next letter. I do not have to like the next letter.', 8),
    ],
  },

  firstEggWin: {
    sci: [
      VT3('IT REACHED THE EGG. Sample {s} reached the egg. After fourteen years of nothing. I need to check the slide. I need to check the slide.', 'Result recorded.'),
      VT3('Contact. It made contact. Fourteen years. Fourteen. I am going to sit down. I am sitting down.', 'Contact recorded.'),
      VT3('It is in. It is actually in. Somebody should be told. There is nobody. I will tell the kettle.', 'Result recorded.'),
    ],
  },

  eggWin: {
    sci: [
      VT0('Egg reached. Result recorded.'),
      VT0('Sample {s} has reached the egg. This is the expected outcome and I will treat it as one.'),
      VT0('Fertilisation event logged. I have not had a reaction. I have noted my not having a reaction.'),
      VT0('Contact with the ovum. I will write it up in the usual place. It is a drawer.'),
      VT0('Another success. The procedure is working. I am working on being less surprised by that.'),
      VT0('Sample {s} goes to the archive. The archive is also a drawer.'),
      VRUN('Sample {s} reached the egg. I have stopped saying "again". It was making the room feel strange.', 4),
    ],
  },

  celestialDrop: {
    sci: [
      VT2('Celestial. That should not be possible. It has been noted. Twice.', 'Item logged.'),
      VT2('That is a Celestial. I did not put a Celestial in the pool. I will check who did.', 'Item logged.'),
      VT2('I would like it noted that I am not excited. The pen disagrees.', 'Item logged.'),
    ],
  },

  firstSpectralCombustion: {
    sci: [
      VT3('NO. No, no, no. That is not a normal reaction. I have the papers. I have ALL the papers. There is nothing in the papers about that. What the FUCK am I supposed to put on the form?', 'Form 12B filed.'),
      VT3('That is a ghost. On fire. I do not have a heading for a ghost on fire. I do not have a heading for ANY of this. Fuck.', 'Form 12B filed.'),
      VT3('Hold on. HOLD ON. Holy/Damned does not do that with fire. Holy/Damned does not do anything with fire. It is not in the literature. Who wrote the literature. Oh, I did.', 'Form 12B filed.'),
    ],
  },

  firstReaction: {
    sci: [
      VT0('Unstable reaction logged. Two damage types have met and failed to agree.'),
      VT0('Reaction observed. The damage types were not introduced beforehand.'),
      VT0('That was an unstable reaction. Stability was not a design goal.'),
      VT0('Two inputs, one outcome. I will add a row to the table.'),
      VT0('A new reaction. The sample has discovered chemistry. The sample will be unbearable.'),
      VT0('Interaction noted. Please do not repeat it near the equipment.'),
    ],
  },

  quietMoment: {
    sci: [
      VT0('Nothing is happening. I am recording that nothing is happening.'),
      VT0('No hostiles in range. This is statistically unusual.'),
      VT0('The slide is quiet. Dust has been observed.'),
      VT0('Idle time noted. I will use it to refill the tea. I will not leave the room.'),
      VT0('Sample {s} is swimming. That is the whole entry.'),
      VT0('A pause in hostilities. The immune system is thinking. This is not a comfort.'),
      VT0('Quiet. The previous recording of quiet was inconclusive.'),
      VT0('Stillness. I will take the opportunity to examine my stationery.'),
    ],
  },

  campaignStart: {
    sci: [
      VT0('Campaign conditions: live. The sample will be exposed to an uncontrolled environment. The sample does not know that.'),
      VT0('Sample {s} has been introduced to the field. Please note the field is not sterile.'),
      VT0('A new phase begins. I have not run this phase before. I am proceeding as if I had.'),
    ],
  },
};

// One sighting line per enemy (the consciousness line was retired, 29 Oct 2026).
// Keys are the code ids from ENEMY_DESIGN (kept ids) or lower-case ids for new enemies.
const SIGHTING = {
  // 5.1 Keep rows
  crawler: { sci: 'Also-Ran. A sperm that was not selected and has taken it personally.' },
  skitter: { sci: 'Sprinter. Motility above the reference range, direction unreliable. Evasion: present.' },
  paramecium: { sci: 'Paramecium. A single-celled organism covered in cilia. It does not know it is in the wrong body.' },
  spitter: { sci: 'Antibody. It binds to things it dislikes. The list is long and includes you.' },
  krill: { sci: 'Krill. Individually negligible. Collectively, a food source for whales.' },
  brute: { sci: 'Macrophage. Its job is to eat debris. The sample qualifies.' },
  amoeba: { sci: 'Amoeba. It engulfs. The word is "phagocytosis" and the sample will not enjoy it.' },
  splitter: { sci: 'Mitotic cell. Mid-division. Being shot does not interrupt it, only multiplies it.' },
  wisp: { sci: 'Spermlets. Relatives of the sample, in the loosest sense. Cousin-level hostility.' },
  bomber: { sci: 'Acid bubble. It bursts, then leaves a pool. pH: not recommended.' },
  blinker: { sci: 'Quantum swimmer. It is somewhere. Observing it changes where.' },
  rotifer: { sci: 'Rotifer. A microscopic animal with a wheel organ. It steals.' },
  medic: { sci: 'Nurse cell. It heals the others, which is a form of cruelty.' },
  charger: { sci: 'Headbutter. One behaviour: forward. It has learned nothing since.' },
  pinworm: { sci: 'Pinworm. A parasite. In this context, an unfortunate one.' },
  bulwark: { sci: 'Mucus wall. A moist barrier shielding those behind it. A mucous membrane doing its job.' },
  volvox: { sci: 'Volvox. A colony pretending to be one organism. A familiar pattern.' },
  warlock: { sci: 'Cytokine signaller. Its function is to tell other cells something is wrong. You are the something.' },
  diatom: { sci: 'Diatom. Cell wall of silica. Beautiful under a microscope. We are under a microscope.' },
  phantom: { sci: 'Ghost swimmer. Not a ghost. A swimmer with poor documentation.' },
  summoner: { sci: 'Mother cell. She produces offspring continuously and resents all of them.' },
  spire: { sci: 'Enzyme spire. A fixed structure which digests what passes. It has been waiting.' },
  plasmod: { sci: 'Plasmodium. Known for malaria. Here, merely locally irritating.' },
  lancer: { sci: 'Killer T-cell. It identifies infected cells and destroys them. The sample is a cell. It has been identified.' },
  waterbear: { sci: 'Water bear. A tardigrade. Survives vacuum and radiation. The sample\'s prospects are poorer.' },
  juggernaut: { sci: 'Alpha swimmer. Its membrane recovers when left alone. Do not leave it alone.' },
  splitling: { sci: 'Daughter cell. The result of an earlier decision.' },
  volvoxling: { sci: 'Daughter colony. Small, numerous, and entirely the fault of the parent.' },
  yeast: { sci: 'Candida. A yeast. Common, opportunistic, and nobody\'s favourite diagnosis.' },
  pepsinjr: { sci: 'Pepsinator, junior. A subset of the parent\'s repertoire, at a smaller pH-related scale.' },

  // 5.2 foes2 / foes
  litmus: { sci: 'Litmus cell. It changes colour in the presence of acid. It is therefore always changing colour.' },
  mirror: { sci: 'Mirror cell. A membrane that surrounds and recharges. No comment on the vanity.' },
  platelet: { sci: 'Platelet clump. Its purpose is clotting. The sample has no use for the clot.' },
  grease: { sci: 'Grease ball. Sebum. Everything slides off it, including blame.' },
  shell: { sci: 'Shell cell. Layered casing. The first lesson in why one wears a coat.' },
  callus: { sci: 'Callus. Dead skin that did the work of living skin. Respect, where due.' },
  interferon: { sci: 'Interferon. A signalling protein that warns its neighbours. It interferes with the sample.' },
  fibrin: { sci: 'Fibrin weaver. It forms the mesh that clots. It has found other uses.' },
  plasma: { sci: 'Plasma cell. It manufactures antibodies. The antibodies are in a hurry.' },
  cortisol: { sci: 'Cortisol puff. A stress hormone. Everything nearby is faster and more disagreeable.' },
  complement: { sci: 'Complement protein. It marks a target for destruction. The target is currently the sample.' },
  stem: { sci: 'Stem cell. Undifferentiated, in theory. In practice, it resurrects things.' },
  leech: { sci: 'Leech. An annelid. It drains. Today, that is stamina.' },
  puffball: { sci: 'Puffball. A fungus. When struck, it releases spores. The spores are the point.' },
  spore: { sci: 'Spore. Released by the puffball. Small, mobile and in the wrong place.' },
  tadpole: { sci: 'Lost tadpole. One hit point. Harmless. Disoriented. I am not saying whose fault.' },
  pube: { sci: 'A stray hair. Of the pubic kind. I will not be elaborating.' },
  fluff: { sci: 'Navel fluff. A mixture of cotton fibres, skin cells and bacteria. It does nothing.' },
  bogey: { sci: 'Bogey. Dried nasal mucus. It adheres to what it touches.' },
  sweetcorn: { sci: 'A piece of sweetcorn. Cellulose. It passes through everything undigested, as it is entitled to.' },
  glitter: { sci: 'Glitter. Once present, never fully removed. It will return after you kill it.' },
  sperminator: { sci: 'Booster. A second dose of aggression is already inside it.' },
  endoskeleton: { sci: 'Second dose. What the booster has been keeping in reserve.' },
  alien: { sci: 'Natural killer cell. Not a figure of speech. The cell is called that.' },
  hocker: { sci: 'Phlegm hocker. It lobs sticky matter. The matter lands where you are.' },
  hayfever: { sci: 'Hayfever cell. A hypersensitive reaction to the sample\'s existence.' },
  snotbubble: { sci: 'Snot bubble. It inflates on impact. The prognosis follows from there.' },

  // 6 and 7 prototypes, plus the Thorns chaser
  staticsock: { sci: 'Static sock. It accumulates charge by travelling. Eventually it discharges. Onto you.' },
  stressball: { sci: 'Stress ball. It absorbs five blows and returns one.' },
  mosquito: { sci: 'Mosquito. Female, since only females bite. The sample takes this personally.' },
  earwax: { sci: 'Earwax plug. Cerumen. A natural barrier. Charge arcs stop at it.' },
  bathduck: { sci: 'Bath duck. Rubber. Present on slippery surfaces and nowhere else.' },
  matchstick: { sci: 'Matchstick. Head: phosphorus. Intent: obvious.' },
  candle: { sci: 'Birthday candle. It drips wax. The wax sets. I have nothing to add about the occasion.' },
  trappedwind: { sci: 'Trapped wind. A pocket of gas in an unfortunate place. I will not name the place.' },
  ingrown: { sci: 'Thorny. Spines on the outside. The sample is encouraged to hit it from further away.' },

  // Bosses (flat Scientist, louder consciousness)
  queen: { sci: 'The Macrophage Queen. A white blood cell who ate her way to the top.' },
  colossus: { sci: 'The Antibody Colossus. It is Y-shaped. It is also a wall.' },
  eye: { sci: 'The Immune Eye. It will examine the sample\'s genome. The sample has none worth examining.' },
  matron: { sci: 'The Matron. She runs the ward and heals every patient in it.' },
  pepsin: { sci: 'The Pepsinator. pH 1.5. The sample is pH 7.4. This is the whole difference.' },
  alpha: { sci: 'Chad Prime. A sperm that has been to the gym, which is not a thing sperm can do.' },
  fever: { sci: 'The Fever. 39.5 degrees and rising. The sample is not insulated.' },
  twins: { sci: 'Mitch and Osis. Cell division, in the sense that both halves have opinions.' },
  ghost: { sci: 'The Phantom Pregnancy. A pregnancy which is, medically, a fiction.' },
  johnny: { sci: 'The Johnny. Latex. 98% effective.' },
  mucus: { sci: 'The Mucus Plug. Cervical in origin. It is a barrier. It is doing well.' },
  cramp: { sci: 'The Cramp. Smooth muscle contracting. Duration: until it stops.' },
  sneeze: { sci: 'The Sneeze. Droplets leave at tens of metres per second. The sample is smaller than a droplet.' },
  stone: { sci: 'The Kidney Stone. Calcium oxalate. Passing it is described by patients as worse than childbirth.' },
};
// The Litmus Strip boss shares the id 'litmus' with the Litmus Cell; callers pass 'litmusstrip' for the boss.
SIGHTING.litmusstrip = { sci: 'The Litmus Strip. A paper test. The sample is the sample.' };

// Layer 2 first-time hints: the consciousness, about 12 words, tells you what to do.
const STATUS_HINT = {
  Corrosion: 'Acid is stripping its layers. Keep hitting it before they grow back.',
  Snared: 'Stuck in goo. Slower, not stopped. Keep swimming until it lets go.',
  Conjoined: "They are stuck to each other and can't move. Free shots. Take them.",
  Bleed: 'Bleeding hurts over time. Stay on it and let the red work.',
  Burning: 'It is on fire. Fill the bar and it flares. Keep hitting it.',
  Charge: 'Static is building on it. Keep zapping and the arcs start to jump.',
  Possessed: 'Briefly on our side. Let it hit its friends. Shoot the rest.',
  Fear: 'Two seconds of running away. Shoot them while they run. Nobody will mind.',
  Membrane: 'A shield that regrows. Do not let up or it grows back.',
  Shell: 'Hard layers. Acid strips them fast. So does one big hit.',
  Evasion: 'Some shots miss it. Bursts, beams and pools never do.',
  Thorns: 'It hurts us back for touching. Shoot it from over there.',
  Squishy: 'Soft. Force just sinks in. Use something sharper, hotter or weirder.',
};

// Sample IDs: strain number plus run letter. Run 1 = A ... 26 = Z, 27 = AA, 28 = AB (VOICE_GUIDE).
function sampleId(strain, run) {
  let n = Math.max(1, Math.floor(run) || 1), letters = '';
  while (n > 0) { const r = (n - 1) % 26; letters = String.fromCharCode(65 + r) + letters; n = Math.floor((n - 1) / 26); }
  return (Math.max(1, Math.floor(strain) || 1)) + letters;
}

const _voiceRecent = {}; // 'event:who' -> last 3 raw texts shown

function _voiceFill(text, ctx) {
  return text.replace(/\{s\}/g, ctx.sample || '1A').replace(/\{n\}/g, ctx.wave != null ? String(ctx.wave) : '');
}

// Pick a line. who is kept for callers but ignored (one pool). ctx (all optional): { sample, wave, run, tier3 }.
// Returns { text, who, tier, recover } or null. Never repeats the last 3 lines of that event
// (as far as the pool allows). Tiers: 0 about 90%, 1 about 8%, 2 about 2%; Tier 3 only when the
// event is explicitly Tier 3 (EVENT_TIER) or ctx.tier3 is set.
function voiceLine(event, who, ctx) {
  const ev = VOICE[event];
  if (!ev) return null;
  who = 'sci';
  ctx = ctx || {};
  const raw = ev[who];
  if (!raw || !raw.length) return null;
  let pool = raw.map(l => typeof l === 'string' ? { t: l, tier: 0 } : l).filter(l =>
    (l.needs !== 'wave' || ctx.wave != null) && (!l.minRun || (ctx.run || 0) >= l.minRun));
  if (!pool.length) return null;
  const hist = _voiceRecent[event + ':' + who] || (_voiceRecent[event + ':' + who] = []);
  const fresh = list => {
    const k = Math.min(3, list.length - 1);
    const avoid = k > 0 ? hist.slice(-k) : [];
    const f = list.filter(l => avoid.indexOf(l.t) < 0);
    return f.length ? f : list;
  };
  let cands;
  if (EVENT_TIER[event]) {
    const forced = pool.filter(l => l.tier === EVENT_TIER[event]);
    cands = fresh(forced.length ? forced : pool);
  } else {
    pool = pool.filter(l => l.tier < 3 || ctx.tier3);
    const r = Math.random();
    const want = r < 0.02 ? 2 : r < 0.10 ? 1 : 0;
    let sub = want ? pool.filter(l => l.tier === want) : [];
    if (sub.length) {
      const avoid = hist.slice(-3);
      sub = sub.filter(l => avoid.indexOf(l.t) < 0);
    }
    if (!sub.length) sub = pool.filter(l => l.tier === 0);
    if (!sub.length) sub = pool;
    cands = fresh(sub);
  }
  const line = cands[Math.floor(Math.random() * cands.length)];
  hist.push(line.t);
  if (hist.length > 3) hist.shift();
  return { text: _voiceFill(line.t, ctx), who, tier: line.tier || 0, recover: line.recover ? _voiceFill(line.recover, ctx) : null };
}

if (typeof module !== 'undefined') module.exports = { VOICE, SIGHTING, STATUS_HINT, EVENT_TIER, sampleId, voiceLine };
