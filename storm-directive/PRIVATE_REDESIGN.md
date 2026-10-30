# Private Schooled reimagined: old money and the old school tie (30 Oct 2026)

The user's choices: theme 1 (privilege as a weapon: buy loyalty, inherit power, make problems go away), Private Schooled only,
builds delegated to other models. Brief (redesign docs/SAMPLES.md 4): "The little bastard who knows someone": refuse to fight fair,
make the toughest enemy a liability to its own team; targets the biggest threat; barely reacts to attacks. Acid and Holy/Damned (the
`soul` damage type; Possessed enemies fight for you). Passive (samples10.js 111/118): Acid builds Corrosion twice as fast; Possessed
enemies hit their old friends twice as hard. Unique Feat Pulling Strings (feats10.js `pulling_strings`).

## How Private-only works (as Alpha and Beta: web/js/samplebranches.js)
`wupRegFor('private', weaponId, spec)` registers the set with the weapons24.js card spec (A, B, C promises with lv3/lv6/wild, lv10
masteries). While a run is played as Private Schooled (G.s10.id === 'private'), WUP[weaponId] returns this set; every other sample
keeps the shared set. Read web/js/beta1.js and beta2.js first: they are the newest pattern (header comment, constants, copy lookup
`pv1T(id)` reading `PRIVATE_COPY`, slot state, wupOn hooks: stats, fire, dmg, hit, kill, tick; hookOn('dmgMul' / 'kill' / 'hurt' /
'hurt:before' / 'fire:after'); heavy hits and float text). Each weapon's existing behaviour stays; your code adds to it through the
hooks, as the shared branches do: Acid Spit's shared set is wup2.js `wupReg('v_fire_proj'`, Rent Free's is wup3.js
`wupReg('v_soul_proj'` (possession: `e.poss`, see wup3.js rfNineTenths and rfMassPossession for how a Possessed enemy is made, timed
and turned on its mates), Ewww, Gross's is wup5.js `wupReg(RT` (s_redtape: Mucus tape bundles enemies, 35% of damage shared). Corrosion
is the Acid status bar (chem.js; samples10.js 118 shows the bar). "Toughest" = highest max health in reach, Elites and bosses first.

## The tables (drafted names; numbers are the spec)
**Acid Spit** (v_fire_proj, Acid glob) prefix `pv_as`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Silver Spoon | Globs always go for the toughest enemy in reach, and deal +40% to Elites and bosses | Born to Rule: hits on the toughest enemy splash 30% onto enemies within 60. Entitled: one more glob a shot at bosses | Spoilt: every 5th glob is twice the size and damage, and slower | Head Boy: the toughest enemy's Corrosion bar fills 50% faster |
| B Trust Fund | An enemy's Acid damage over time compounds: +10% a second while it stays Corroded, up to +100% | Offshore Account: when a compounding enemy dies, its bonus moves to the nearest enemy. Inheritance: a kill by Acid damage heals you 1% | Gap Year: compounding sometimes (15%) stops for 2 s, then comes back doubled | Old Money: compounding never resets |
| C Hostile Takeover | An enemy whose Corrosion bar fills is Possessed for 6 s (one at a time) | Asset Stripping: a taken-over enemy takes double from Acid. Golden Handshake: when a takeover ends, the enemy bursts in Acid (radius 80) | Insider Trading: a takeover that ends drops 4 stamina | Conglomerate: up to 3 takeovers at once |

**Rent Free** (v_soul_proj, a spirit that Possesses) prefix `pv_rf`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Old Boys' Network | An enemy killed by a Possessed enemy is Possessed in turn (at most 4 Possessed at once) | Secret Handshake: your weapons deal 50% less to Possessed enemies. Nepotism: Possessed Elites recruit for twice as long | Blackballed: a recruit sometimes (15%) refuses and is Feared for 2 s instead | Old School Tie: up to 8 Possessed at once |
| B The Help | Possessed enemies stay within 120 of you, and enemy shots that pass within 40 of one stop on it | Butler: a Possessed enemy that dies heals you 2%. Live-in Staff: Possession lasts 50% longer | Below Stairs: Possessed enemies sometimes (every 3 s) give nearby enemies Holy/Damned build-up | Staff Quarters: a Possession that would end has a 25% chance to start again |
| C Legacy Admission | The first enemy you Possess each wave (outside waves, each minute) stays Possessed for the wave and is 50% bigger and stronger | Family Crest: the Legacy's hits build Corrosion. Endowment: the Legacy heals 2% of its health a second | Disinherited: when the Legacy dies it bursts in Holy/Damned (radius 100) | Dynasty: two Legacies a wave |

**Ewww, Gross** (s_redtape, Mucus tape that bundles enemies) prefix `pv_eg`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A NDA | Enemies in a bundle of 3 or more cannot attack; a bundle of 2 attacks 50% slower | Gagging Order: taped enemies move 30% slower. Confidentiality Clause: the bundle shares 50% of damage, not 35% | Leaked: a bundle sometimes (10%) bursts apart and every enemy in it is Feared for 2 s | Super-Injunction: bundles of 2 cannot attack either |
| B Hush Money | A taped enemy that dies pays 1 stamina (at most 5 a second) | Paid Off: taped enemies take 20% more from your other weapons. Bribe: a taped Elite is sometimes (25%) Possessed for 4 s | Brown Envelope: a bundle of 4 or more that dies within 1 s drops a heal of 5% | Slush Fund: payouts are doubled |
| C Daddy's Lawyers | When you are hit, half the damage goes to the nearest taped enemy within 200 instead | Countersue: damage redirected is dealt again to its bundle as Acid. Injunction: taped enemies are pushed back if they come within 60 of you | Billable Hours: each redirect costs 1 stamina (a joke cost) | Retainer: three quarters of the damage is redirected |

Lv 9 masteries: one list per weapon (lv10), each "best" with its branch letter.

## Gated cards (dealt only on that branch, Private Schooled only: Claude adds the Do rules to cardrules.js at merge)
1. Daddy's Credit Card (Feat `pv_card`, Acid utility, tap: 20 stamina, 20 s cooldown): for 6 s every weapon deals 30% more and enemies within 150 build Corrosion. Gate: Acid Spit B (Trust Fund).
2. Expelled (Feat `pv_expelled`, Holy/Damned burst, tap: 18 stamina, 15 s cooldown): everything within 160 is knocked away hard and Feared for 1.5 s; a Possessed enemy is left alone. Gate: Rent Free B (The Help).
3. Signet Ring (sperm passive `pass_pv_signet`, mutCard, maxRank 1): Possessed enemies deal 30% more. Gate: Rent Free A (Old Boys' Network).
4. Diplomatic Immunity (sperm passive `pass_pv_immunity`, mutCard, maxRank 1): once every 20 s, the first hit on you does nothing. Gate: Ewww, Gross C (Daddy's Lawyers).
Feats use feats10.js `feat({...})` with Lv 3 and Lv 5 forks (two each, in the spirit of the card), as beta2.js's be_defib / be_bloodbag.
Passives use `mutCard({...})` as beta2.js's pass_be_morphine. Leave their `eligible` as "not held": the branch gate is a card rule.

## Costumes (web/js/privatelook.js): one per branch, as betalook.js
Kinds: pv_spoon (a silver spoon in the mouth), pv_trust (a pocket watch on a gold chain), pv_takeover (a briefcase), pv_network (a
striped old school tie), pv_help (a butler's bow tie and a silver tray), pv_legacy (a crest on a blazer pocket), pv_nda (a red wax
seal), pv_hush (a brown envelope), pv_lawyers (a barrister's wig). Pale halo under a dark outline (they must read in Lab view), sized
like betalook.js's. Register each kind in BL_WEAP as betalook.js does (baselinelook.js's in-run pass calls BL_WEAP[kind](k, t, o)),
wrap blDrawLook and blPick after betalook.js's wraps, keep the costume on the three weapons' branch screens as betalook.js does, and
answer only for pv_ kinds while the run is Private Schooled. Private Schooled's base body (the polished head, the collar) stays.

## Placeholder ids (copy is written later by a copy agent into privatecopy.js: PRIVATE_COPY)
`const pv1T = id => (typeof PRIVATE_COPY !== 'undefined' && PRIVATE_COPY[id]) || 'TODO_COPY:' + id;` (pv2T in part 2).
Branch: `<prefix>_<key>_tag`, `_costs`, `_desc` (key: spoon, trust, takeover, network, help, legacy, nda, hush, lawyers). Lv 6, wild
and mastery cards keep their drafted names; their text is `<prefix>_<cardkey>_desc` (cardkey: the name in lower case, letters only,
e.g. pv_as_borntorule_desc). Feats: `feat_<id>_line`, `feat_<id>_does`, `feat_<id>_float`, forks `feat_<id>_<forkid>_name`, `_desc`.
Passives: `pass_<id>_desc`, `pass_<id>_flavour`. Floats: `<prefix>_<what>_float`. List every id you used in your report.

## Rules for the builders
- FIRST: your worktree may be cut from an older commit. Run `git fetch -q origin && git merge -q origin/claude/sharp-hypatia-icfi8l`
  before anything else (it has this file, the placeholder files and Beta). If that merge conflicts, stop and report.
- Work only in your file(s) (the script tags already exist: privatecopy.js, private1.js, private2.js, privatelook.js load after
  betalook.js) and your test (`tests/private1test.js`, `tests/private2test.js`, `tests/privatelooktest.js`). Do not touch index.html,
  ARCHITECTURE.md, NOTES.md, CHANGELOG.md, changes/, cardrules.js, meta.js, build.gradle, the APK or the planner. Claude merges, logs
  and ships.
- Tests: copy tests/beta1test.js's harness; set G.s10 to Private Schooled so its set is live; one check per card plus a 300-frame ring
  run per branch with no errors; check another sample still gets the shared set. Run
  `cd storm-directive/tests && ./run.sh <your test> samplebranchtest quick beta1test`. Never install anything, never run
  playwright install, Gradle or lint.
- Commit on your worktree branch (`feat(private): ...`), ending with the attribution lines from your system reminder. Report: branch
  name, commit, files, test output, what you simplified, and the placeholder ids.
