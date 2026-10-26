'use strict';
// Spawn Prawn v10 - narrative line tables and picker (voice.js).
// Owns: every Scientist ('sci') and consciousness ('con') line for in-run events (VOICE), the enemy and
// boss first-sighting pairs (SIGHTING), the Layer 2 first-time status hints (STATUS_HINT), the sample
// ID convention (sampleId) and the line picker (voiceLine). Canon: redesign docs/VOICE_GUIDE.md.
// Rules baked in: the consciousness speaks as "we" (it and the sperm are one team); the Scientist is Tier 0 about
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
    con: [
      'Go. Go go go. The egg is that way. Probably. Everything is that way.',
      "Right. We exist. Barely. Let's keep it that way until the egg.",
      "Swim. We swim. Well, the tail swims. We supervise.",
      "Four hundred million of us went in, and we are the ones who stopped to look around. Move.",
      "This is it. We are the one. We say that every time. This time we mean it.",
      "Don't look at the other swimmers. They are competition. Possibly relatives. Move.",
      "Quick, before anything notices us. Things notice us. That's what they are for.",
      'The egg is waiting. Probably. It has not said otherwise.',
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
    con: [
      "Clear. Breathe. Do we breathe? We do it anyway.",
      'Good. Dead. All of them. Now go before more arrive.',
      "That's the lot. Don't get comfortable. Get forward.",
      "Ha. Look at that. Nothing left between us and the egg. For now.",
      "Quiet. We don't like quiet. Quiet means something is thinking.",
      "We did that. Mostly the tail did that. We are sharing the credit.",
      'Right, pick something good and keep going. The egg is not getting any younger.',
      "Wave over. We smell of victory. It is mostly mucus.",
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
    con: [
      "Free DNA. Take it. We've made worse decisions for less.",
      'Ooh. New bits. Pick the sharp one.',
      "Pick. Pick. Any. Just pick, they are going to hit us while we read.",
      "More of us. This is good. We were a bit short on us.",
      'Take the one that looks like it hurts people.',
      "Level. Level. We like levels. Levels mean we are less dead.",
      "Whatever we choose, we chose it together. Team decision. Nobody is to blame.",
      "It's DNA. It's free. What are we waiting for, a leaflet?",
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
    con: [
      "That one looks useless. Take it. We have a feeling.",
      "Fine. Yes. Take that one. It is part of our plan. We will know the plan once we have one.",
      "Excellent. Terrible. It will turn out fine. We are almost certain.",
      "It's not a bad card. It's a card with a lot of potential for disappointment.",
      "Did we read it? We didn't. Good enough.",
      'We will make it work. We always make it work. We have made nothing work yet, but still.',
      "That was the wrong one. We said take it. Different thing. We are still a team.",
      "Sure. Bold. Very bold. We will describe it as bold when we talk about it later.",
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
    con: [
      "New weapon. Excellent. Let's see what we do with this bastard.",
      'Oh, that is nice. Point it at things.',
      'It goes bang. Or whoosh. Either one, both good.',
      "More teeth. We can never have too many teeth. Ask a shark.",
      "Is it sharp? It's sharp. We use it on the first thing we see.",
      "We do not understand it and we love it.",
      "Now we're getting somewhere. Somewhere is the egg.",
      "Don't just carry it. Use it. It is not decorative.",
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
    con: [
      "We are not dying. We haven't even been born yet. That would be a terrible start.",
      "Hurt. We're hurt. We stop being hurt now.",
      "Ow. We felt that. We do not have anything to feel with. We felt it.",
      'Heal. Do something that heals. Anything. Eat a thing.',
      'Not now. We are not doing this now. We have not got to the egg yet.',
      "That's a lot of red. Red is bad. Please remove the red.",
      "Careful. We are made of very little. Be careful with it.",
      'Think of the egg. Think of something nice. Now dodge.',
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
    con: [
      "Right. Right. Nobody panic. Especially us. Both of us. Whatever.",
      'They are everywhere. Find a gap. Any gap. Make one.',
      "Oh no. Oh no no no. We mean: tactical opportunity. Yes.",
      'Too many. Fewer would be better. Do something about the number.',
      'Left. No, right. The right one has fewer teeth.',
      'Do not stop moving. Stopping is how we get eaten.',
      'This is fine. This is a crowd. Crowds are friendly. Mostly.',
      'Hit them all. There are so many. It is practically impossible to miss.',
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
    con: [
      "Not yet. We haven't even met the egg. It would be embarrassing to die before the introduction.",
      "Please. Please please. We have waited so long.",
      "Do not do this to us. Either of us. Both of us. Us.",
      "We can't go now. We haven't even picked a name.",
      'One more hit and we are nothing. We are not nothing. We have not even started.',
      "Dodge. Dodge, we magnificent idiots, dodge.",
      "We can't see the egg yet. We need to see the egg. Stay alive.",
      "If we die, we stop. If we stop, we never start. Dodge.",
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
    con: [
      "Oh, fuck off. We have places to be.",
      "That is enormous. Do not look at it. We look at the egg. Only the egg.",
      'Big. Biggest thing we have met. Do not worry about the others, they were practice.',
      'Kill it. It looks soft in the middle. It probably is not. Kill it.',
      'Right. That is a lot of enemy in one place. Convenient, actually.',
      "Of course. Of course there's one of these. There's always one of these.",
      'Do not die to this one. This one would be a terrible story.',
      'Run. No wait, shoot. No, run. Both.',
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
    con: [
      'Dead. It is dead. Look at it. Oh, that was lovely.',
      "Hah. That'll teach it. Teach what? Doesn't matter, it can't be taught now.",
      "We are enormous. We are an enormous sperm. We go and be enormous at the egg.",
      'Take whatever it dropped. Take all of it. We earned this.',
      "We knew we could. We did. There is no record of us saying otherwise.",
      "One less thing between us and the egg. Fewer things. Smaller list. Good.",
      "That's one for our story. When we've got a story. When we've got a life.",
      "We were barely worried. We only said \"oh no\" eleven times.",
    ],
  },

  firstBossKill: {
    sci: [
      VT0('First principal specimen terminated. Added to the log as "unexpected".'),
      VT0('First large kill. Please remember this one. It sets the baseline for disappointment later.'),
      VT2('The sample has killed a specimen of that size. I will need to reweigh the sample.', 'Recorded.'),
    ],
    con: [
      "We killed a big one. We're killers now. Don't let it go to our head. We do have a head. Fine, let it go a bit.",
      "First big one. We're so proud. We're so, so proud of us. Don't make it weird.",
      'That is how it is done. Remember how that is done.',
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
    con: [
      "We were so fucking close.",
      'No. No no no. We were nearly there. Nearly. We were practically touching.',
      "We were so ready. Why weren't we born yet? Why are we so dead?",
      "It's dark. It's dark again. We hate the dark. Go back.",
      "That's it? That's all? We had a whole speech.",
      "Again. We go again. We do not care how many times. Again.",
      "We blame the immune system. And ourselves, a bit. Mostly the immune system.",
      "We were going to be someone. We were going to get there. We can discuss it later.",
      "Next time, we dodge the thing that killed us. It's not a hard rule. It's a good rule.",
    ],
  },

  firstEggWin: {
    sci: [
      VT3('IT REACHED THE EGG. Sample {s} reached the egg. After fourteen years of nothing. I need to check the slide. I need to check the slide.', 'Result recorded.'),
      VT3('Contact. It made contact. Fourteen years. Fourteen. I am going to sit down. I am sitting down.', 'Contact recorded.'),
      VT3('It is in. It is actually in. Somebody should be told. There is nobody. I will tell the kettle.', 'Result recorded.'),
    ],
    con: [
      "There. There it is. We made it. We have been waiting for this our entire existence.",
      "It's real. It's the egg. It's so much bigger than we thought. It's so much more.",
      "We did it. Look at it. Don't talk. Just look at it.",
      'Hello. Hello, egg. Go on. Tell it we are here. Tell it we have come a long way.',
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
    con: [
      "Here we are. Again. We are still not tired of it.",
      "The egg. The egg. Still the egg. We have no other interests.",
      "We did it. Quietly this time. Quietly is good.",
      'Almost in. Almost. Stay a moment.',
      'It is the same egg. It feels different. It always feels different.',
      'Good. Good. Very good. Stay a moment.',
    ],
  },

  celestialDrop: {
    sci: [
      VT2('Celestial. That should not be possible. It has been noted. Twice.', 'Item logged.'),
      VT2('That is a Celestial. I did not put a Celestial in the pool. I will check who did.', 'Item logged.'),
      VT2('I would like it noted that I am not excited. The pen disagrees.', 'Item logged.'),
    ],
    con: [
      "Can it kill things? We don't care what it is. Can it kill things?",
      'Shiny. It is so shiny. Take it. Take it take it.',
      "That is clearly the good one. How do we know? Look at it.",
      "It is glowing. Everything good glows. This is a rule we just invented.",
    ],
  },

  firstSpectralCombustion: {
    sci: [
      VT3('NO. No, no, no. That is not a normal reaction. I have the papers. I have ALL the papers. There is nothing in the papers about that. What the FUCK am I supposed to put on the form?', 'Form 12B filed.'),
      VT3('That is a ghost. On fire. I do not have a heading for a ghost on fire. I do not have a heading for ANY of this. Fuck.', 'Form 12B filed.'),
      VT3('Hold on. HOLD ON. Parasite does not do that with fire. Parasite does not do anything with fire. It is not in the literature. Who wrote the literature. Oh, I did.', 'Form 12B filed.'),
    ],
    con: [
      "Something just caught fire that should not have been able to. We like it.",
      'That was bright. It was bright and a bit horrible. More.',
      "Is it a ghost? On fire? That is the best thing that has ever happened to us.",
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
    con: [
      "Whoa. What did we do? Do it again.",
      "That was a reaction. A real one. Nobody told us they did that.",
      'Things combine, and then they explode. Why were we not told about this?',
      "Interesting. By which we mean: more of that.",
      'Boom. Where did that come from. Who cares. Boom.',
      "We made something happen. We were a bit worried we never would.",
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
    con: [
      "We wonder if the egg is lonely. We decide it must be. We are very good at deciding things for the egg.",
      "We wonder what it is like out there. Having elbows.",
      "It's nice, this. Nobody trying to kill us. Don't get used to it.",
      "Does the egg know we are coming? Of course it does. Eggs know.",
      'Think about the egg. Not in a weird way. In a small, steady way.',
      "We have planned the first thing we are going to do. It is a surprise. Even to us.",
      "Practise telling the egg we are sorry we are late. Say it. No, in our head.",
      'What if it does not like us? No. Stop. It will. We are very nice.',
    ],
  },

  campaignStart: {
    sci: [
      VT0('Campaign conditions: live. The sample will be exposed to an uncontrolled environment. The sample does not know that.'),
      VT0('Sample {s} has been introduced to the field. Please note the field is not sterile.'),
      VT0('A new phase begins. I have not run this phase before. I am proceeding as if I had.'),
    ],
    con: [
      "Other swimmers want a career, a family, a nice flat. We want the egg. Only the egg. Forever the egg.",
      "Keep going. We haven't seen it yet. We don't know what it looks like, but we know.",
      "It is out there. Somewhere past all this. We are certain. We have been certain for a long time.",
      'Whatever is in the way, it is only in the way.',
      'Every step is a step closer to being someone. Hold that thought. Do not drop it.',
    ],
  },
};

// Decision 11: one Scientist line and one consciousness line per enemy. A sighting shows one of the two.
// Keys are the code ids from ENEMY_DESIGN (kept ids) or lower-case ids for new enemies.
const SIGHTING = {
  // 5.1 Keep rows
  crawler: { sci: 'Also-Ran. A sperm that was not selected and has taken it personally.', con: 'That one wants what we want. It will not get it. Shoot it.' },
  skitter: { sci: 'Sprinter. Motility above the reference range, direction unreliable. Evasion: present.', con: 'Fast one. Do not chase it. It likes that.' },
  paramecium: { sci: 'Paramecium. A single-celled organism covered in cilia. It does not know it is in the wrong body.', con: 'Fast and hairy. Not worth the fear. Shoot the hair.' },
  spitter: { sci: 'Antibody. It binds to things it dislikes. The list is long and includes you.', con: "It's spitting at you. Spitting! Move sideways." },
  krill: { sci: 'Krill. Individually negligible. Collectively, a food source for whales.', con: "Lots of little ones. Keep shooting. Don't count them." },
  brute: { sci: 'Macrophage. Its job is to eat debris. The sample qualifies.', con: 'Big and soft. Force just sinks in. Try literally anything else.' },
  amoeba: { sci: 'Amoeba. It engulfs. The word is "phagocytosis" and the sample will not enjoy it.', con: "It's going to swallow you. Don't be where it is." },
  splitter: { sci: 'Mitotic cell. Mid-division. Being shot does not interrupt it, only multiplies it.', con: 'Kill it quick. Otherwise it is two. Then four. We hate maths.' },
  wisp: { sci: 'Spermlets. Relatives of the sample, in the loosest sense. Cousin-level hostility.', con: 'Our tiny cousins. They want it too. Shoot them.' },
  bomber: { sci: 'Acid bubble. It bursts, then leaves a pool. pH: not recommended.', con: "Don't pop it near you. Pop it away. Then don't stand in the puddle." },
  blinker: { sci: 'Quantum swimmer. It is somewhere. Observing it changes where.', con: 'It vanishes. Wait for it to come back. Then shoot. Do not think about it.' },
  rotifer: { sci: 'Rotifer. A microscopic animal with a wheel organ. It steals.', con: 'It took something! Kill it, get it back! We wanted that!' },
  medic: { sci: 'Nurse cell. It heals the others, which is a form of cruelty.', con: 'It heals them. Kill the nurse first. We never thought we would say that.' },
  charger: { sci: 'Headbutter. One behaviour: forward. It has learned nothing since.', con: 'It is going to charge. See the line? Be off the line.' },
  pinworm: { sci: 'Pinworm. A parasite. In this context, an unfortunate one.', con: 'Disgusting. Shoot it quickly so we can stop thinking about where it lives.' },
  bulwark: { sci: 'Mucus wall. A moist barrier shielding those behind it. A mucous membrane doing its job.', con: 'It is shielding the rest. Go through it or round it. Ignore the smell.' },
  volvox: { sci: 'Volvox. A colony pretending to be one organism. A familiar pattern.', con: 'A lot of little ones inside a big one. Pop it.' },
  warlock: { sci: 'Cytokine signaller. Its function is to tell other cells something is wrong. You are the something.', con: 'It is shouting about us. Shoot the shouter.' },
  diatom: { sci: 'Diatom. Cell wall of silica. Beautiful under a microscope. We are under a microscope.', con: 'Hard shell. Hit it hard, or melt it. The layers come off one at a time.' },
  phantom: { sci: 'Ghost swimmer. Not a ghost. A swimmer with poor documentation.', con: 'It flickers. Wait for it to settle, then shoot.' },
  summoner: { sci: 'Mother cell. She produces offspring continuously and resents all of them.', con: 'She keeps making more. Kill her, not the kids.' },
  spire: { sci: 'Enzyme spire. A fixed structure which digests what passes. It has been waiting.', con: 'It does not move. So we do. Out of its line.' },
  plasmod: { sci: 'Plasmodium. Known for malaria. Here, merely locally irritating.', con: 'It splits when it likes. Shoot it faster than it splits.' },
  lancer: { sci: 'Killer T-cell. It identifies infected cells and destroys them. The sample is a cell. It has been identified.', con: "It's aiming. It's a good shot. Move." },
  waterbear: { sci: 'Water bear. A tardigrade. Survives vacuum and radiation. The sample\'s prospects are poorer.', con: 'Tough little bastard. Keep shooting. Lots of layers.' },
  juggernaut: { sci: 'Alpha swimmer. Its membrane recovers when left alone. Do not leave it alone.', con: 'It heals if we ease off. So we do not ease off.' },
  splitling: { sci: 'Daughter cell. The result of an earlier decision.', con: 'Little one. Kill it. It is not going to grow up.' },
  volvoxling: { sci: 'Daughter colony. Small, numerous, and entirely the fault of the parent.', con: 'More little ones. Whatever. Shoot.' },
  yeast: { sci: 'Candida. A yeast. Common, opportunistic, and nobody\'s favourite diagnosis.', con: 'Yeast. Bad smell. Shoot it before it spreads. Everywhere.' },
  pepsinjr: { sci: 'Pepsinator, junior. A subset of the parent\'s repertoire, at a smaller pH-related scale.', con: "Baby acid. Don't let it grow up. Actually it won't. It's small." },

  // 5.2 foes2 / foes
  litmus: { sci: 'Litmus cell. It changes colour in the presence of acid. It is therefore always changing colour.', con: 'Colour-changing one. Mix up our shots.' },
  mirror: { sci: 'Mirror cell. A membrane that surrounds and recharges. No comment on the vanity.', con: 'Break the shiny layer. Then it is just a cell.' },
  platelet: { sci: 'Platelet clump. Its purpose is clotting. The sample has no use for the clot.', con: 'A clot. Piercing shots slow down in it. Shoot more.' },
  grease: { sci: 'Grease ball. Sebum. Everything slides off it, including blame.', con: 'Slippery thing. Shots curve less near it. Aim them yourself.' },
  shell: { sci: 'Shell cell. Layered casing. The first lesson in why one wears a coat.', con: 'Hard outside. Hit it until the layers come off.' },
  callus: { sci: 'Callus. Dead skin that did the work of living skin. Respect, where due.', con: 'Thick. Slow. Hit it hard and keep hitting it.' },
  interferon: { sci: 'Interferon. A signalling protein that warns its neighbours. It interferes with the sample.', con: 'It gives the others a coat. Kill it and they lose the coat.' },
  fibrin: { sci: 'Fibrin weaver. It forms the mesh that clots. It has found other uses.', con: 'It ties the others in place so we cannot push them. Cut it down.' },
  plasma: { sci: 'Plasma cell. It manufactures antibodies. The antibodies are in a hurry.', con: 'It makes the shooters shoot faster. Kill the plasma. Then the shooters.' },
  cortisol: { sci: 'Cortisol puff. A stress hormone. Everything nearby is faster and more disagreeable.', con: 'Everything near it is faster. Kill it. Stress is bad for us.' },
  complement: { sci: 'Complement protein. It marks a target for destruction. The target is currently the sample.', con: 'It marked us. Everything hits harder. Get rid of it, quick.' },
  stem: { sci: 'Stem cell. Undifferentiated, in theory. In practice, it resurrects things.', con: 'It brings the dead back! That is cheating! Kill it.' },
  leech: { sci: 'Leech. An annelid. It drains. Today, that is stamina.', con: 'It is draining us. Get away from it. Or get it off.' },
  puffball: { sci: 'Puffball. A fungus. When struck, it releases spores. The spores are the point.', con: 'Pop it and it blows. Pop it far away.' },
  spore: { sci: 'Spore. Released by the puffball. Small, mobile and in the wrong place.', con: 'Dust with intent. Shoot it.' },
  tadpole: { sci: 'Lost tadpole. One hit point. Harmless. Disoriented. I am not saying whose fault.', con: 'It is lost. It is tiny. We are bigger. Leave it. Or do not.' },
  pube: { sci: 'A stray hair. Of the pubic kind. I will not be elaborating.', con: "Don't touch it. It'll tangle you. We are not discussing where it came from." },
  fluff: { sci: 'Navel fluff. A mixture of cotton fibres, skin cells and bacteria. It does nothing.', con: 'Fluff. Ignore it. Or shoot it. It is fluff.' },
  bogey: { sci: 'Bogey. Dried nasal mucus. It adheres to what it touches.', con: 'Sticky. It slows us down. Kill it fast. Do not think about what it is.' },
  sweetcorn: { sci: 'A piece of sweetcorn. Cellulose. It passes through everything undigested, as it is entitled to.', con: 'A tough bit of corn. Harmless. Shoot it for fun. Or do not.' },
  glitter: { sci: 'Glitter. Once present, never fully removed. It will return after you kill it.', con: "It's glitter. It'll come back. It's always coming back." },
  sperminator: { sci: 'Booster. A second dose of aggression is already inside it.', con: 'See the red line? It is going to shoot. When it dies, there is another. Be ready.' },
  endoskeleton: { sci: 'Second dose. What the booster has been keeping in reserve.', con: 'Surprise. It was inside the other one. Keep shooting.' },
  alien: { sci: 'Natural killer cell. Not a figure of speech. The cell is called that.', con: 'It crouches. Then it jumps. When it crouches, move.' },
  hocker: { sci: 'Phlegm hocker. It lobs sticky matter. The matter lands where you are.', con: "Spit! Move! It leaves a mess. Don't stand in the mess." },
  hayfever: { sci: 'Hayfever cell. A hypersensitive reaction to the sample\'s existence.', con: 'It sneezes our problems back at us. Watch for the wind-up.' },
  snotbubble: { sci: 'Snot bubble. It inflates on impact. The prognosis follows from there.', con: "Don't over-hit it. It pops sticky. Kill it small. Or zap it." },

  // 6 and 7 prototypes, plus the Thorns chaser
  staticsock: { sci: 'Static sock. It accumulates charge by travelling. Eventually it discharges. Onto you.', con: 'It is getting crackly. When it is full, do not let it touch us.' },
  stressball: { sci: 'Stress ball. It absorbs five blows and returns one.', con: 'It squeezes. On the fifth hit it springs. Stay back then.' },
  mosquito: { sci: 'Mosquito. Female, since only females bite. The sample takes this personally.', con: 'It is biting us. Kill it quick and get some back.' },
  earwax: { sci: 'Earwax plug. Cerumen. A natural barrier. Charge arcs stop at it.', con: 'It stops the sparks. Kill it, or arc round it.' },
  bathduck: { sci: 'Bath duck. Rubber. Present on slippery surfaces and nowhere else.', con: "A duck. Why is there a duck. It slides if the floor's wet. Keep clear." },
  matchstick: { sci: 'Matchstick. Head: phosphorus. Intent: obvious.', con: 'It is going to run. Fire behind it. Get out of the line.' },
  candle: { sci: 'Birthday candle. It drips wax. The wax sets. I have nothing to add about the occasion.', con: 'Burning thing. It builds walls. Kill it, and mind the wax.' },
  trappedwind: { sci: 'Trapped wind. A pocket of gas in an unfortunate place. I will not name the place.', con: "It's a fart. Don't light it near you. Light it near them." },
  ingrown: { sci: 'Thorny. Spines on the outside. The sample is encouraged to hit it from further away.', con: "Don't touch it. Shoot it. From over there." },

  // Bosses (flat Scientist, louder consciousness)
  queen: { sci: 'The Macrophage Queen. A white blood cell who ate her way to the top.', con: 'She eats the little ones to heal. Kill the snacks first. Then her.' },
  colossus: { sci: 'The Antibody Colossus. It is Y-shaped. It is also a wall.', con: 'Big Y. It charges in straight lines. Get out of the line.' },
  eye: { sci: 'The Immune Eye. It will examine the sample\'s genome. The sample has none worth examining.', con: 'It stares. While it stares, it cannot blink. Hit it then.' },
  matron: { sci: 'The Matron. She runs the ward and heals every patient in it.', con: 'Kill her nurses. Kill her. Hurry up.' },
  pepsin: { sci: 'The Pepsinator. pH 1.5. The sample is pH 7.4. This is the whole difference.', con: "Acid rain. Don't stand in the puddles. Mucus works." },
  alpha: { sci: 'Chad Prime. A sperm that has been to the gym, which is not a thing sperm can do.', con: "He's big. He charges. He's an idiot. Dodge." },
  fever: { sci: 'The Fever. 39.5 degrees and rising. The sample is not insulated.', con: 'It is hot in here. It gets hotter. Be quick.' },
  twins: { sci: 'Mitch and Osis. Cell division, in the sense that both halves have opinions.', con: 'Two of them. Kill one and the other gets angry. Kill both.' },
  ghost: { sci: 'The Phantom Pregnancy. A pregnancy which is, medically, a fiction.', con: 'It is not real. Which one? Whatever. Shoot the one that hurts.' },
  johnny: { sci: 'The Johnny. Latex. 98% effective.', con: 'Do not let it near us. It is the end of everything. Mostly the end of us.' },
  mucus: { sci: 'The Mucus Plug. Cervical in origin. It is a barrier. It is doing well.', con: 'It blocks the way. Go through it. Pop it. Do not get stuck in the goo.' },
  cramp: { sci: 'The Cramp. Smooth muscle contracting. Duration: until it stops.', con: 'It squeezes. Do not get squeezed. Dodge the squeeze.' },
  sneeze: { sci: 'The Sneeze. Droplets leave at tens of metres per second. The sample is smaller than a droplet.', con: 'Big wind-up. Big blow. Get out of the way. Bless us.' },
  stone: { sci: 'The Kidney Stone. Calcium oxalate. Passing it is described by patients as worse than childbirth.', con: 'It rolls. It bounces. Watch where it goes. Not at us. At us. Move.' },
};
// The Litmus Strip boss shares the id 'litmus' with the Litmus Cell; callers pass 'litmusstrip' for the boss.
SIGHTING.litmusstrip = { sci: 'The Litmus Strip. A paper test. The sample is the sample.', con: 'It tests us. Mix our damage types or it gets angry.' };

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

// Pick a line. who: 'sci' or 'con'. ctx (all optional): { sample, wave, run, tier3 }.
// Returns { text, who, tier, recover } or null. Never repeats the last 3 lines of that event and voice
// (as far as the pool allows). Scientist tiers: 0 about 90%, 1 about 8%, 2 about 2%; Tier 3 only when the
// event is explicitly Tier 3 (EVENT_TIER) or ctx.tier3 is set.
function voiceLine(event, who, ctx) {
  const ev = VOICE[event];
  if (!ev) return null;
  who = who === 'con' ? 'con' : 'sci';
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
  if (who === 'con') {
    cands = fresh(pool);
  } else if (EVENT_TIER[event]) {
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
