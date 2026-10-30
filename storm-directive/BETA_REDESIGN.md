# Beta reimagined: near-death, A&E drama (30 Oct 2026)

The user's choices: theme 1 (near-death and hospital drama), Beta-only branches, builds delegated to other models. Beta's brief
(redesign docs/SAMPLES.md): "Absolutely useless until it isn't": looks like the weakest sample, then a nightmare to finish off. Blood
and Mucus. Passive Not Dead Yet (samples10.js 110/117): below 40% health, up to about +200% damage and some lifesteal, more the closer
to death. Unique Feat Second Wind (feats10.js `second_wind`). Every branch here pays off when Beta is low, or brings it back from low.

## How Beta-only works (built: web/js/samplebranches.js, as Alpha)
`wupRegFor('beta', weaponId, spec)` registers Beta's set with the weapons24.js card spec (A, B, C promises with lv3/lv6/wild, lv10
masteries). While a run is played as Beta (G.s10.id === 'beta'), WUP[weaponId] returns Beta's set; every other sample keeps the shared
set. Read web/js/alpha1.js first: it is the pattern (header comment, AL1 constants, al1T copy lookup, al1F slot state, wupOn hooks:
stats, fire, dmg, hit, kill, tick; hookOn('dmgMul' / 'kill' / 'hurt' / 'hurt:before' / 'fire:after')). Heavy hits and float text as
baseline1.js (bl1Heavy, bl1Say). Each weapon's existing behaviour stays; your branch code adds to it through the hooks, exactly as the
shared branches do: Little Prick's shared set is wup2.js `wupReg('v_arcane_proj'`, One of These Days' is wup5.js `wupReg(DD` (s_duedate:
the mark is e.due, its payout code is in wup5.js / fbdemo.js), Sister Cousin's is wup5.js `wupReg(SC` (s_seeker: seekers, splits on
kill via the 'multiplying' modifier). Read them for how each weapon's needles, marks and seekers are reached.
"Low" below means the Not Dead Yet line: G.player.hp < G.P.maxHp * 0.4. "Health %" is of G.P.maxHp. Heal with healPlayer(n, true).

## The tables (drafted names; numbers are the spec)
**Little Prick** (v_arcane_proj, Blood needle: 16 a hit, 0.45 s apart) prefix `be_lp`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A IV Drip | Needles leave a drip (Bleeding) on what they hit; while 3 or more enemies are dripping, you heal 1% a second | Saline Bag: the drip heal doubles while you are low. Cannula: needles pierce one more enemy | Air Bubble: a dripping enemy sometimes pops in a small Blood burst (radius 60) | Drip Feed: healing past full health becomes a shield, up to 20% |
| B Adrenaline Shot | Fire rate climbs as health falls: nothing at full, +80% at 10% health | Epinephrine: dropping below 40% gives 3 s of double fire rate (20 s cooldown). Racing Heart: while low, each needle that lands makes you 2% faster (up to 20%, fades in 2 s) | Overdose: at full health the needles are 15% weaker (a joke cost) | Crash Cart: once a wave, a hit that would kill you leaves you at 1 health and fires a ring of 16 needles |
| C Blood Draw | Each needle that lands on a Bleeding enemy fills a vial; at 10 vials the next needle is a heavy hit (x4) that heals you 3% | Phlebotomist: Elites fill vials twice as fast. Butterfly Needle: the heavy needle pierces everything in its line | Squeamish: enemies within 100 of a heavy needle's hit flee for 1 s | Blood Bank: up to 3 heavy needles stored; dropping below 40% fires them all at once |

**One of These Days** (s_duedate, a countdown mark on a big target) prefix `be_dd`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Flatline | The payout grows as your health falls: nothing at full, +150% at 10% health | Code Blue: if you are low when a mark pays out, the next strongest enemy is marked at once. Heart Monitor: the countdown runs 40% faster while you are low | Beep: each second of the countdown sends a small Blood pulse (radius 50) from the marked enemy | Time of Death: a marked enemy under 25% health when it pays out dies outright (bosses take x3 instead) |
| B DNR | While a mark is up you cannot heal from anything; the payout is x2.5 | Living Will: healing blocked while the mark was up is added to the payout (x3). Last Rites: the payout also makes everything within 120 Bleed | Paperwork: a mark sometimes (25%) pays out twice | Organ Harvest: a mark that kills splits its payout across the 3 nearest enemies |
| C Triage | Marks go on the 3 most wounded enemies at once, not the strongest; each countdown is half as long and each payout 40% | Waiting Room: marked enemies are slowed 30%. Walk-in Clinic: a kill by a payout heals you 2% | Wrong Patient: sometimes (15%) a mark lands on you instead and heals you 5% when it pays out | Mass Casualty: up to 5 marks |

**Sister Cousin** (s_seeker, homing siblings that split on kill) prefix `be_sc`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Next of Kin | When you would be hit, the nearest seeker within 150 takes it instead and dies (4 s cooldown) | Emergency Contact: every seeker turns on whatever just hurt you. Power of Attorney: while you are low, seekers deal +50% | Family Feud: two seekers that touch sometimes (10%) bump and scatter (a joke) | Bloodline: a seeker that takes a hit for you splits into two |
| B Organ Donor | A seeker that expires or dies heals you 1.5% | Spare Parts: a dying seeker leaves a Blood pool (radius 40, 3 s) that makes enemies Bleed. Compatible Match: donations heal double while you are low | Black Market: a donation sometimes (20%) pays 4 stamina instead | Living Donor: each seeker kill also heals 0.5% (at most 3% a second) |
| C Transfusion | Seekers share Not Dead Yet: they deal more as you lose health, up to +100% at 10% | Blood Type O: seekers make what they hit Bleed. Shared Circulation: while you are low, seeker damage heals you as your own Not Dead Yet lifesteal does | Rhesus Negative: seekers sometimes (15%) carry Mucus and make the target Snotty | Blood Brothers: a seeker that kills splits into three, not two |

Lv 9 masteries: one list per weapon (lv10), each "best" with its branch letter.

## Gated cards (dealt only on that branch, Beta only: Claude adds the Do rules to cardrules.js at merge)
1. Defibrillator (Feat `be_defib`, Static burst, tap: 20 stamina, 18 s cooldown): a Static ring (radius 140) stuns what it touches for 1 s and heals you 5% for each enemy it touches, up to 25%. Gate: Little Prick B (Adrenaline Shot).
2. Morphine Drip (sperm passive `be_morphine`, mutCard, maxRank 1): while you are low you take 20% less damage. Gate: Little Prick A (IV Drip).
3. Famous Last Words (sperm passive `be_lastwords`, mutCard, maxRank 1): the first time each wave you drop below 10% health, everything within 200 takes a Blood burst of 20 x your level and Bleeds. Gate: One of These Days A (Flatline).
4. Blood Bag (Feat `be_bloodbag`, Blood utility, tap: 16 stamina, 20 s cooldown): heal 15% over 3 s; if you are low when you perform it, you also swim 30% faster for those 3 s. Gate: Sister Cousin B (Organ Donor).
Feats use feats10.js `feat({...})` with Lv 3 and Lv 5 forks (two each; invent sensible fork effects in the spirit of the card). Passives
use `mutCard({...})` as alpha2.js's pass_al_diamond / pass_al_mce. Leave their `eligible` as normal: the branch gate is a card rule.
Feat and passive ids: alpha2.js uses ids `al_morning`, `al_golive`, `pass_al_diamond`, `pass_al_mce`; follow the same shape
(`be_defib`, `be_bloodbag`, `pass_be_morphine`, `pass_be_lastwords`).

## Costumes (web/js/betalook.js): one per branch, drawn like alphalook.js / baselinelook.js
Kinds: be_iv (an IV bag on a little pole, a tube to the head), be_adren (a big syringe strapped on), be_draw (a belt of blood vials that
fill as the vial count climbs), be_flatline (a heart-monitor trace floating over the head, flat when you are low), be_dnr (a toe tag on
the tail), be_triage (a coloured triage tag: green, amber, red by your health), be_kin (a sticking plaster), be_donor (an organ cool box),
be_transfusion (a blood bag with a tube). Shapes with a pale halo under a dark outline (they must read in Lab view), sized like
alphalook.js's (u = head half-length, about 1.5x body scale in the run). Beta's base body (kindred.js: the coiled tip, the crooked neck,
the drop) stays. Alpha's look file wraps blDrawLook, blPick and drawPlates: wrap after it, and only answer for be_ kinds and Beta.

## Placeholder ids (copy is written by a separate copy agent into betacopy.js: BETA_COPY)
Look copy up as alpha1.js does: `const be1T = id => (typeof BETA_COPY !== 'undefined' && BETA_COPY[id]) || 'TODO_COPY:' + id;`.
Branch: `<prefix>_<key>_tag`, `_costs`, `_desc` (key: iv, adren, draw, flatline, dnr, triage, kin, donor, transfusion). Lv 6, wild and
mastery cards keep their drafted names; their text is `<prefix>_<cardkey>_desc` (cardkey: the name in lower case, letters only, e.g.
be_lp_salinebag_desc, be_dd_timeofdeath_desc). Feats: `feat_<id>_line`, `feat_<id>_does`, forks `feat_<id>_<forkid>_name`, `_desc`.
Passives: `pass_<id>_desc`, `pass_<id>_flavour`. Floats: `<prefix>_<what>_float`. List every id you used in your report.

## Rules for the builders
- Work only in your file(s) (the script tags already exist: betacopy.js, beta1.js, beta2.js, betalook.js load after alphalook.js) and
  your test (`tests/beta1test.js`, `tests/beta2test.js`, `tests/betalooktest.js`). Do not touch index.html, ARCHITECTURE.md, NOTES.md,
  CHANGELOG.md, changes/, cardrules.js, meta.js, build.gradle, the APK or the planner. Claude merges, logs and ships.
- Tests: copy tests/alpha1test.js's harness; set G.s10 to Beta so Beta's set is live; one check per card plus a 300-frame ring run per
  branch with no errors; check another sample still gets the shared set; check that low health switches on what it should (set
  G.player.hp). Run `cd tests && ./run.sh <your test> samplebranchtest quick alpha1test`. Never install anything, never run
  playwright install, Gradle or lint.
- Commit on your worktree branch (`feat(beta): ...`), ending with the attribution lines from your system reminder. Report: branch name,
  files, test output, what you simplified, and the placeholder ids.
