# Baseline reimagined (29 Oct 2026)

The user's design (ideas.md, second batch; decisions below). Baseline stops being the plain control sample and becomes the
action-movie human: each of its weapons has three Lv 3 branches named after a film hero, each a different way to play the
weapon, and some Feats, modifiers and passives are only dealt once a branch is taken (gates). The sperm's body wears the branch.

Part 1 is BUILT (v10.221, `web/js/baseline1.js`, test `tests/baseline1test.js`): read it first, it is the pattern for parts 2 and 3
(re-register the weapon's `WUP` entry with `wupReg`, behaviour through `wupOn` hooks, sperm-wide passives through a `computeStats`
wrap, gates through the draft card's `eligible`, costumes through a `drawPlates` wrap, every player-facing string `TODO_COPY:<id>`).

## Decisions (the user, 29 Oct)
1. Replace the old branches (do not add). Marked for Bonking's mark was absorbed into Robocop.
2. One grudge/mark system shared by Robocop and Sperminator: a marked enemy wears a red crosshair, takes more damage, and aiming
   stays on it (part 1 built it: `bl1SetMark`, `bl1Mark`, `G.bl1.marks`, `e.bl1mk`; part 2 reuses those functions).
3. Improved targeting unlocks the FINISHER aim directive (built in part 1: `DIRECTIVES` id `finisher`, gated by `bl1Finisher()`);
   part 2's Sperminator Lv 6 Improved targeting must also unlock it (extend `bl1Finisher` by wrapping it).
4. "Punks" = Elites (`e.elite || e.rival`, never bosses).
5. Off-type Feats are fine (Acid bath on a Force sperm).
6. Evil Dead is two weapons in one: the fan keeps firing at range and a chainsaw runs in front of the head.
7. Hand-to-gland replaces Nervous Wreck (same slot id `v_phys_contact`, renamed, new branches; the old cards stay in wup1.js unreachable).
8. Come back (a revive) clears every status.
9. Every branch changes the body visually (a costume drawn on the sperm), readable as a silhouette in Lab view (no colour).

## Part 2: Shotgun (Maximum Gains renamed; id `v_phys_spread`; live base: 6 pellets of 8 damage, 1.3 volleys a second, magazine 4, reload 1.6 s, range 270, knock 70)
File `web/js/baseline2.js`, test `tests/baseline2test.js`. Rename: `W24_BY.v_phys_spread.name`, `WEAPONS.v_phys_spread.name` and the
Field Guide text (`W24_DESC`, w24look.js names) read "Shotgun"; the description is `TODO_COPY:mg_desc`.

| Lv 3 branch | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| Sperminator (`mg_sperm_*`) | Two Shell layers on you that regrow every 12 s (the player's Shell defence: pdef.js `pdef().shell` or the simplest equivalent; if the player has no Shell system, a 2-hit Membrane that regrows every 12 s). The first volley on an Elite marks it (part 1's mark): +60% to it, aim stays on it | Improved targeting (`mg_targ_desc`: unlocks FINISHER), Terminated (`mg_term_desc`: killing the mark heals 10% max health and marks the next Elite) | `mg_sperm_wild_*`: pellets that hit the mark ricochet into its neighbours (one bounce, 70%) | Judgement Day (`mg_judge_*`): three layers, and the mark explodes on death (Force, 120 area, 3x pellet damage) |
| Evil Dead (`mg_evil_*`) | Two weapons in one: the fan keeps firing at range; a chainsaw in front of the head (reach 60, 6 damage every 0.15 s, Force, Contact) runs whenever something is in reach | Groovy (`mg_groovy_desc`: chainsaw kills reload the shotgun), Boomstick (`mg_boom_desc`: a point-blank volley, target within 60, is a heavy hit with double knockback) | `mg_evil_wild_*`: an enemy killed by the chainsaw rises as an ally for 3 s (use `e.charmed` the way Turncoat does, modwide.js) | Hail to the King (`mg_hail_*`): reach 100, chainsaw hits Bleed, a Bleeding enemy hit by pellets bursts (Blood, 60 area, 2x pellet damage) |
| Riding shotgun (`mg_ride_*`) | Damage +1% per 1% of swim speed over base, capped +60% (read the player's current speed vs base speed each volley); pellets fired while moving get +30% range; sprinting while firing costs no stamina (stamina.js sprint cost hook or the simplest equivalent) | Drive-by (`mg_driveby_desc`: passing within 60 of an enemy at speed fires a free volley at it, once a second), Handbrake turn (`mg_handbrake_desc`: stopping dead fires a full ring of pellets, once every 3 s) | `mg_ride_wild_*`: a sidecar pet that fires a second, weaker fan while you move (modifiers.js summoned pets or a simple orbit body) | Getaway (`mg_getaway_*`): at full speed you take no Contact damage (hurt:before hook), and every volley kicks you forward (recoil, wup1.js `recoil` pattern) |

Gated: **Come back** (sperm passive, `pass_comeback_*`, dealt only once Sperminator is taken; register with `mutCard` like spsteer.js
does, family `mut:body`, maxRank 1, and gate its `eligible`): once a run, at 0 health you dry into an untouchable husk for 2 s and come
back at 50% health with every status cleared (hurt:before hook that cancels the killing hit; clear `G.player` statuses: burning,
snared, charged and the like, see fight.js player status fields), as the robot skeleton for the rest of the run (costume).
Costumes (`drawPlates` wrap, same transform as part 1's `bl1Costume`): Sperminator segmented metal plates on the head and a red eye;
after Come back the head is an outline with a red dot. Evil Dead: a toothed blade in front of the head that spins while it runs.
Riding shotgun: a speed streak behind the tail at speed, a puff on each drive-by.

## Part 3: Hand-to-gland (Nervous Wreck renamed; id `v_phys_contact`; Contact; retune base: reach 70, 14 damage, 2.2 hits a second via a stats hook)
File `web/js/baseline3.js`, test `tests/baseline3test.js`. Rename as part 2 does; description `TODO_COPY:hg_desc`.

| Lv 3 branch | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| Kung fu (`hg_kungfu_*`) | Twice the hit rate at 70% damage; every 5th hit is a kick that knocks back (wup1.js `shove` pattern) | Combo (`hg_combo_desc`: each hit on the same enemy +8%, up to +40%, reset when it dies or you switch), Flying kick (`hg_flying_desc`: the kick becomes a Lunge through the target, modifiers.js lunge) | `hg_kungfu_wild_*`: an enemy hit twice within a second has its next shot reflected back at it | Thousand fists (`hg_fists_*`): every hit lands on everything in reach, not one enemy |
| Samurai (`hg_samurai_*`) | One cut a second at triple damage in a 160 degree arc hitting all in reach; the first strike on a fresh enemy is a heavy hit (Force >= 15% of its max health counts as heavy, combat.js) | Iaijutsu (`hg_iai_desc`: a cut after 1.5 s of not cutting is x2), Parry (`hg_parry_desc`: a cut destroys enemy shots in its arc, `G.ebul`) | `hg_samurai_wild_*`: under 30% health every cut is a heavy hit | Clean cut (`hg_clean_*`): cuts strip a Shell layer and stagger (part 1's `bl1Heavy(e, w, 1)`) |
| Biting (`hg_biting_*`) | Bites Bleed (fightStatus(e, 'arcane', ...)) and heal you 4% of damage dealt (healPlayer) | Chew toy (`hg_chew_desc`: a bitten enemy is held for 0.5 s, `e.snareT`), Rabies (`hg_rabies_desc`: Bleeding enemies you bite spread Bleed to neighbours within 60) | `hg_biting_wild_*`: a bite on a Shelled enemy strips a layer | Jaws (`hg_jaws_*`): bites on enemies under 20% health kill outright (not bosses) and heal 10% |

Costumes: Kung fu two small fists circling the head; Samurai a thin blade beside the head and a topknot bump; Biting a row of teeth
along the head's leading edge that chomp on each bite.

## Rules for the builders
- Work only in your file, your test, `web/index.html` (one script tag right after `js/baseline1.js`), one row in `ARCHITECTURE.md`
  (next to the `baseline1.js` row, and your file in the script-order line), and one `## ` entry at the top of
  `changes/claude-sharp-hypatia-icfi8l.md`. Do not touch NOTES.md, CHANGELOG.md, meta.js, build.gradle, the APK or the planner.
- Player-facing text is `TODO_COPY:<id>` with exactly the ids above (`<prefix>_tag`, `<prefix>_costs`, `<prefix>_desc` for a branch;
  `<prefix>_name` and `<prefix>_desc` for wild cards and masteries; floating texts `<prefix>_float`). Names the user gave (the branch and
  card names in the tables) are real text, not placeholders. Placeholders must not crash or overflow.
- Tests: copy the harness of `tests/baseline1test.js`; one check per card; `cd tests && ./run.sh <yourtest> quick wup1test featstest`.
  Never install anything, never run `playwright install`, lint, emulators or Gradle.
- Commit on your worktree branch with a conventional message (`feat(baseline): ...`), ending with the attribution lines from your
  system reminder. Report the branch name, the files changed, the test output, and anything you could not do.

## Rules for the copy writer
Read `voice_and_tone.md`, `redesign docs/VOICE_GUIDE.md`, the existing card lines in `web/js/wup1.js` (Standard Issue, Maximum
Gains and Nervous Wreck sections) and the Feat lines in `web/js/feats10.js` for the voice. Write every placeholder listed in
`BASELINE_COPY_IDS.md` into `web/js/baselinecopy.js` as `const BL_COPY = { id: 'text', ... }` (plain JS, no modules), one entry per
id, British spelling, no British slang, no em dashes. Jokes are about bodies, sex, contraception and the microscopic world, dry and
deadpan (Dungeon Crawler Carl), never self-aware. Keep the facts in each brief exactly. Length limits in the briefs are hard.
