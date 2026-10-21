// acrocopy.js: all player-facing text for Sample 9 (acro.js weapons and cards, acrosample.js sample, Feats and gift X9).
// Loaded before acro.js. Hooks: acro.js and acrosample.js read ACRO_COPY[id] in their T() helper (missing ids show TODO_COPY:id).
// Briefs and limits: redesign docs/SAMPLE_9_ACRO.md section 6. Card ids follow <weapon>_<A|B|C><3|c|s|6a|6b|w>, masteries <weapon>_M1..3, each with _desc.
const ACRO_COPY = (function () {
  const C = {
    s9_name: 'Early Bird', acro_origin: 'Human, unpunctual', acro_passive: 'Jumping the Gun',
    acro_pdesc: 'Corrosion pays off at 70%: Shell layers strip early, and unshelled enemies turn Corroded early.',
    acro_line: 'Already there. Already done. Go, go, GO, before anyone notices we have not started.',
    acro_sci: 'Sample {id} released its enzymes before reaching the egg. A recognised cause of infertility. It seemed pleased.',
    acro_unlock: 'Strip 50 Shell layers in one run',
    acro_feat_name: 'Premature Evaporation', acro_feat_line: '"Everything out. Now. Do not read the label, just pour."',
    acro_feat_does: 'Acid burst: fills the Corrosion bar of enemies within 220 (bosses half), leaves a pool. Acid damage -25% for 4 s.',
    acro_feat_fk3_wide: 'Overshare', acro_feat_fk3_wide_desc: 'The burst reaches 40% further.',
    acro_feat_fk3_quick: 'Quick Recovery', acro_feat_fk3_quick_desc: 'The spent penalty is -10% for 2 s, not -25% for 4 s.',
    acro_feat_fk5_strip: 'Stripped Bare', acro_feat_fk5_strip_desc: 'The burst also strips one Shell layer from every enemy inside (not bosses).',
    acro_feat_fk5_regrow: 'Refractory Period', acro_feat_fk5_regrow_desc: 'While spent, each Shell layer you strip takes 1 s off the penalty and the cooldown.',
    acro_x9_name: 'Watched Pot', acro_x9_line: '"Standing still? Standing STILL? Fine. Look what you made me do."',
    acro_x9_does: 'Stay still for 1 s and an Acid Pool spills out around you (radius 90), corroding anything in it.',
    acro_x9_fk3_spill: 'Spill Over', acro_x9_fk3_spill_desc: 'The pool is 50% wider.',
    acro_x9_fk3_drip: 'Drip Feed', acro_x9_fk3_drip_desc: 'When you move off, the spill trails behind you for 3 s.',
    acro_x9_fk5_fidget: 'Fidget', acro_x9_fk5_fidget_desc: 'It spills after 0.5 s still, not 1 s.',
    acro_x9_fk5_topup: 'Topping Up', acro_x9_fk5_topup_desc: 'The spill refreshes every Acid Pool it touches to full lifetime.',
    w25_name: 'Enzyme Headbutt', acro_cap_desc: 'Headbutts the nearest enemy within 70 and corrodes it hard. Every 4th hit lunges through the target.',
    w26_name: 'Enzyme Sneeze', acro_spray_desc: 'Fires a short fan of 3 heavy droplets. Every droplet corrodes. Nobody says bless you.',
    w27_name: 'Spark of Life', acro_spark_desc: 'A short beam (180) that goes for Corroded enemies first and finishes them. Needs a setup.',
  };
  // [id, name, desc] rows; promise rows (A/B/C) carry [name, lv3 desc, costs, shows]
  const W = {
    acro_cap: {
      A: ['Root Canal', 'Consecutive hits on one target add +15% damage (cap +100%). A full stack strips a Shell layer outright.', 'Locked to a single target while the stack builds.', 'The cap spins and fizzes in a spiral.'],
      A6a: ['Next Appointment', 'Stripping the last layer launches you to the next nearest enemy, with the stack kept.'],
      A6b: ['Dental Dam', 'While drilling, contact damage to you is 40% lower.'],
      Aw: ['Chipped Tooth', 'Each stripped layer flicks 2 acid chips at nearby enemies.'],
      B: ['Forced Entry', 'Every hit is a lunge (140) through everything in the lane.', '-20% damage. You end up in the middle of the crowd.', 'A pink smear down the lane.'],
      B6a: ['Momentum', "Each enemy passed adds 10% to the next one's Corrosion fill (cap +100%)."],
      B6b: ['Slippery Slope', 'Lunging through an Acid Pool coats the cap: the next 3 hits leave small Acid Pools.'],
      Bw: ['Second Thoughts', 'At the end of a lunge, you bounce back once down the same lane.'],
      C: ['Hard Hat', 'Each Shell layer you strip gives you 1 Shell layer (max 3).', '-25% damage.', 'Pink bands on your head.'],
      C6a: ['Concussion', 'While you have Shell, your hits knock enemies back.'],
      C6b: ['Counter-Butt', "When an enemy's contact hit lands on your Shell, the cap hits back (once per 1 s)."],
      Cw: ['Blown Cap', 'Losing your last layer bursts it as an Acid splash (Corrosion to enemies within 80).'],
      M1: ['Every Fourth Time', 'Every 4th hit strips a layer outright, or Corrodes a target with no Shell at once.'],
      M2: ['Serial Offender', 'A lunge that kills lunges again to the nearest enemy (up to 6 in a row).'],
      M3: ['Thick Skull', 'Your Shell cap rises to 6. Each layer carried adds +15% damage.'],
    },
    acro_spray: {
      A: ['Close Contact', 'Gain +1 pellet per 40 units closer than 160 (max 7). Pellets inside 60 fill Corrosion twice as fast.', '-40% range.', 'The fan thickens up close.'],
      A6a: ['Merged Droplets', 'Two pellets on one target in a volley fuse into one hit at +50%.'],
      A6b: ['Kickback', "Each volley's recoil pushes you back to the sweet spot."],
      Aw: ['Full Circle', 'Every 6th volley is a full ring around you.'],
      B: ['Drizzle', 'Missed pellets land as small Acid Pools (2 s, max 8). Touching pools merge.', '-20% direct damage.', 'A field of pink speckles.'],
      B6a: ['Wet Floor', 'Enemies standing in your pools take +30% from your pellets.'],
      B6b: ['Rising Damp', 'A pellet landing in a pool grows it (up to radius 80) instead of making a new one.'],
      Bw: ['Splash Back', 'Swimming through your own pool makes the next volley 3 rapid volleys.'],
      C: ['Strip Search', 'Pellets lean towards Shelled enemies and fill Corrosion +50% against Shell.', 'Ignores unshelled enemies while Shelled ones are near.', 'Pellets curve towards armour.'],
      C6a: ['Free Sample', 'Stripping a layer gives a free volley (once per 1 s).'],
      C6b: ['Through and Through', 'A pellet hitting a Corroded enemy with no Shell carries on through it.'],
      Cw: ['Second Opinion', 'A pellet that strips a layer bounces to another Shelled enemy.'],
      M1: ['Spitting Distance', 'Point-blank pellets strip a layer outright (once per target per second).'],
      M2: ['Flood Warning', 'Your pools last until the wave ends (max 12).'],
      M3: ['Double Sneeze', 'Volleys are doubled, each pellet at 60%.'],
    },
    acro_spark: {
      A: ['Flashpoint', '+40% damage against Corroded targets. When the target stops being Corroded, the beam jumps to the next one.', '-30% damage against everything else.', 'The beam flares on pink-ringed enemies.'],
      A6a: ['Tinder', '+10% damage per Corroded enemy on screen (cap +100%).'],
      A6b: ['Double Evaporation', 'Setting off Premature Evaporation splits the beam in two for 2 s.'],
      Aw: ['Scorch Mark', "The beam's lane stays on fire for 1 s."],
      B: ['Spark Gap', 'The beam chains from you to the nearest Corroded enemy, then the next, hitting harder. Shelled anchors are not burnt.', 'Only as strong as your anchors. With none, an ordinary beam.', 'A line of fire from you through the enemies.'],
      B6a: ['Triangle', 'A third Corroded enemy turns the string into a triangle.'],
      B6b: ['Whiplash', 'When an anchor dies, the beam whips to the next Corroded enemy within 200.'],
      Bw: ['Attraction', 'The anchors are pulled towards each other.'],
      C: ['Paint the Slide', 'The beam points where you swim (260). Swept enemies burn 1.5 times faster.', 'No autoaim.', 'Burning lanes behind your path.'],
      C6a: ['Hard Left', 'Turning sharply widens the beam for 0.5 s.'],
      C6b: ['Tip Burn', "The beam's tip leaves short-lived fire behind it (1 s)."],
      Cw: ['Windscreen Wiper', 'While you stand still, it sweeps back and forth on its own.'],
      M1: ['Second Beam', 'A second beam on the second-best target.'],
      M2: ['Chain Ignition', 'Igniting a Corroded enemy half-fills the Corrosion bars of enemies within 80.'],
      M3: ['Wide and Fast', 'The beam is twice as fast and twice as wide.'],
    },
  };
  for (const w in W) for (const k in W[w]) {
    const r = W[w][k], id = w + '_' + k;
    C[id] = r[0];
    if (/^[ABC]$/.test(k)) { C[id + '3'] = r[1]; C[id + 'c'] = r[2]; C[id + 's'] = r[3]; } else C[id + '_desc'] = r[1];
  }
  return C;
})();
