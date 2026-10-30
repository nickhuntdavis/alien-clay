# Alpha reimagined: hustle culture (30 Oct 2026)

The user's choices: theme 1 (hustle culture and self-help gurus), Alpha-only branches (decision 2), Obligatory Podcast is the podcaster,
"build as drafted". Alpha's design brief (redesign docs/SAMPLES.md 2): "Thinks he's the main character in everyone's life"; every
fight is a dominance contest; the weapons sound like self-improvement advice and are gloriously insecure. Static and Force; its
passive (No Days Off) fires faster while moving; its Unique Feat (Personal Best) is a sprint.

## How Alpha-only works (built: web/js/samplebranches.js, tests/samplebranchtest.js)
`wupRegFor('alpha', weaponId, spec)` registers Alpha's set with the weapons24.js card spec (A, B, C promises with lv3/lv6/wild, lv10
masteries). While a run is played as Alpha (G.s10.id === 'alpha'), WUP[weaponId] returns Alpha's set; every other sample keeps the
shared set. Obligatory Podcast (v_phys_podcast, podcast.js) has no shared set, so its branches exist only for Alpha.
Read web/js/baseline1.js first: it is the pattern (behaviour through wupOn hooks: stats, fire, dmg, hit, kill, tick; flags on the
slot; heavy hits via bl1Heavy; float text via bl1Say; card text TODO_COPY:<id>). Use wupRegFor('alpha', ...) where baseline1.js
used wupReg. Each weapon's existing behaviour (asdemo.js, sigweap.js, podcast.js, laserbeam.js where relevant) stays; your branch
code adds to it through the hooks, exactly as the shared branches do (Red Flagship's shared set is in wup2.js `wupReg('v_shock_beam'`,
Soulmate Signal's in wup4.js `wupReg(TW`, Unwanted Contact's in wup4.js `wupReg(UC`: read them for how each weapon's shots,
beams, tether and chains are reached).

## The tables (names are the user's; numbers are the spec)
**Red Flagship** (v_shock_beam, Static beam) prefix `al_rf`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Grindset | Beam damage climbs while you keep swimming, up to +60%; resets after 1 s standing still | 4am Club: the first 10 s of each wave, the beam hits double. Cold Plunge: the beam slows its target 40% | Rise and Grind: the beam leaves a Static trail that zaps | Sigma: at full climb the beam forks onto a second target |
| B Life Coach | While the beam holds a target, your other weapons hit it 20% harder and fire 15% faster | Accountability Partner: the held target takes a Force heavy hit every 3 s. Vision Board: beam reach +40% | Toxic Positivity: the beam heals you 1% a second while it holds | Breakthrough: a held target that dies passes the bonus to the next one, stacking twice |
| C Crypto Bro | The beam pumps 50% of its damage into the target; when it dies, the pump bursts on its neighbours | HODL: the pump never fades, and the burst grows the longer you held. Rug Pull: switching targets dumps the pump at once | NFT: a pumped kill drops a token that pays out stamina | To the Moon: the burst chains to the next pumped enemy |

**Soulmate Signal** (s_twin, a beam tethered to your twin) prefix `al_ss`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Wingman | The twin draws enemy fire within 120 and takes no damage | Hype Man: enemies that attack the twin are Charged. Bro Code: when you are hit, you swap places with the twin (6 s cooldown) | Pull Up: the twin dashes to the nearest Elite | Ride or Die: the twin also fires your Unwanted Contact |
| B Situationship | The tether flickers 1 s on, 1 s off, and hits 2.2 times as hard | Ghosting: while off, the twin vanishes and reappears behind the crowd. Breadcrumbing: each flick-on leaves Static crumbs | Red Flag: the tether sometimes turns on you for a moment (a joke cost) | It's Complicated: the flicker speeds up as enemies die |
| C Power Couple | Both ends hit harder the closer you swim to the twin, up to +60% within 120 | Matching Outfits: your hits and the twin's apply each other's status. Couples Therapy: touching the twin heals 2% | PDA: swimming through the twin sends out a Force pulse | Soulmates: a second twin and a triangle tether |

**Unwanted Contact** (s_tesla, Static chains) prefix `al_uc`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Networking Event | 2 more chain jumps, each 25% weaker | Business Card: chained enemies take 15% more from your other weapons. Elevator Pitch: the first jump hits double | Lanyard: chains favour Elites | Rolodex: chains never fall off in damage |
| B Cold Caller | Chains go for the furthest untouched enemies first; chain range +40% | Follow-Up: a second chain hit on one enemy stuns it for 0.5 s. Robo-Call: every 3rd shot hits a random enemy anywhere on screen | Do Not Call: Charged enemies ignore you briefly | Hard Sell: each jump hits harder than the last |
| C Influencer | Each enemy chained adds a follower: +2% damage each, up to 25; getting hit loses 5 | Going Viral: at 25 followers, chains jump twice as far. Brand Deal: followers add 1% lifesteal each | Cancelled: getting hit at 25 followers sets off a Static blast | Blue Tick: followers are never lost |

**Obligatory Podcast** (v_phys_podcast, Force sound waves; Alpha only) prefix `al_op`
| Lv 3 | What changes | Lv 6 | Wild | Lv 9 mastery |
|---|---|---|---|---|
| A Hot Take | Waves half as wide but hit 2.5 times as hard, and stagger | Cancelled: a staggered enemy is Feared for 2 s. Ratio: an enemy hit by 2 waves of one shot takes +30% | Clip Farmer: a stagger spawns a smaller echo wave | Discourse: every wave staggers |
| B Three-Hour Episode | 5 waves a shot, each 35% weaker, reaching 30% further | Ad Read: every 5th wave pulls enemies in. Patreon Tier: an enemy hit 3 times is Charged | Filler: waves linger in place for a second | Never Ends: no reload |
| C Call-In Show | Every 3rd shot, the waves come back towards you, hitting again | Long-Time Listener: returning waves heal 1% each. Dead Air: after 2 s with nobody in range, the next shot is double | Caller on Hold: a returning wave stores and fires with the next shot | Live Studio Audience: every shot returns |

Lv 9 masteries: the three masteries are one list per weapon (lv10), each "best" with its branch letter.

## Gated cards (dealt only on that branch, Alpha only: Claude adds the Do rules to cardrules.js at merge)
1. Morning Routine (Feat `al_morning`, Force, utility-like but tap: 16 stamina, 14 s cooldown): for 6 s every weapon fires 25% faster and you cannot be slowed. Gate: Red Flagship B (Life Coach).
2. Diamond Hands (sperm passive `al_diamond`, mutCard, family mut:body, maxRank 1): pump bursts also refund 5 stamina. Gate: Red Flagship C (Crypto Bro).
3. Going Live (Feat `al_golive`, Static burst, tap: 18 stamina, 16 s cooldown): for 5 s a ring of Static (radius 110) around you Charges anything it touches, and each enemy it Charges adds a follower (Influencer's). Gate: Unwanted Contact C (Influencer).
4. Main Character Energy (sperm passive `al_mce`, mutCard, maxRank 1): staggered enemies take 20% more from everything. Gate: Obligatory Podcast A (Hot Take).
Feats use feats10.js `feat({...})` with Lv 3 and Lv 5 forks (two each; invent sensible fork effects in the spirit of the card). Passives
use spsteer.js-style `mutCard({...})`. Leave their `eligible` as normal: the branch gate is a card rule.

## Costumes (web/js/alphalook.js): one per branch, drawn like baselinelook.js
Kinds: al_grind (sweatband), al_coach (headset mic), al_crypto (glowing laser eyes), al_wing (wing pins), al_situ (a phone with a heart),
al_couple (matching hearts on you and the twin), al_network (lanyard and badge), al_cold (telephone headset), al_influencer (ring-light
halo), al_hottake (megaphone), al_threehour (big headphones), al_callin (desk mic on a boom). Shapes with a pale halo under a dark
outline (they must read in Lab view), sized like baselinelook.js's (u = head half-length, about 1.5x body scale in the run).

## Placeholder ids (player-facing text is the user's: TODO_COPY:<id>)
Branch: `<prefix>_<key>_tag`, `_costs`, `_desc` (key: grind, coach, crypto, wing, situ, couple, network, cold, influencer, hottake,
threehour, callin). Lv 6, wild and mastery cards keep their drafted names; their text is `<prefix>_<cardkey>_desc` (cardkey: the name in
lower case, letters only, e.g. al_rf_4amclub_desc, al_rf_sigma_desc). Feats: `feat_<id>_line`, `feat_<id>_does`, forks
`feat_<id>_<forkid>_name`, `_desc`. Passives: `pass_<id>_desc`, `pass_<id>_flavour`. Floats: `<prefix>_<what>_float`.
Feat and passive names are the drafted ones. List every id you used in your report.

## Rules for the builders
- Work only in your file(s) (the script tags already exist: alpha1.js, alpha2.js, alphalook.js load after samplebranches.js) and your
  test (`tests/alpha1test.js`, `tests/alpha2test.js`, `tests/alphalooktest.js`). Do not touch index.html, ARCHITECTURE.md, NOTES.md,
  CHANGELOG.md, changes/, cardrules.js, meta.js, build.gradle, the APK or the planner. Claude merges, logs and ships.
- Tests: copy tests/baseline1test.js's harness; set G.s10 = { id: 'alpha', ... } (or pick the Alpha sample) so Alpha's set is live; one
  check per card plus a 300-frame ring run per branch with no errors; check another sample still gets the shared set. Run
  `cd tests && ./run.sh <your test> samplebranchtest quick wup1test`. Never install anything, never run playwright install, Gradle or lint.
- Commit on your worktree branch (`feat(alpha): ...`), ending with the attribution lines from your system reminder. Report: branch name,
  files, test output, what you simplified, and the placeholder ids.
