# Weapon modifier no-op audit: handoff (25 Oct 2026)

Read `CLAUDE.md` and `NOTES.md` first. This file hands three tasks to later sessions. Task 1 suits Sonnet (medium effort).
Tasks 2 and 3 need Opus. Each task ends by rerunning the audit and quoting the new counts.

## The problem (user, 25 Oct)
Taking a modifier that already has another one often does nothing, changes a number silently, or is too subtle to see.
Example: the Laser with Mines, then Charge-Up: nothing changes at all.

## What the audit found
`tests/sim/modaudit.js` runs every matrix weapon x Delivery (none, Melee, Mines, Strike from Above, Ranged, Orbiting,
Extra Shots) x every other modifier the draft can offer, 20 s each in a fixed arena (16 slow crawlers walking in from
random distances, seeded, fresh page per trial), with and without the modifier, and compares damage, hits, typed hits,
statuses, reactions, shoves, mines/allies/marks/orbs, shots and hit sources.
- NO-OP: nothing measurable changed. NUMBERS: only damage or hit counts moved (over 8%). VISIBLE: anything else.
- Result (rank 1 only): 2810 combos, 761 NO-OP, 54 NUMBERS, 1995 VISIBLE. Full output: `tests/out/modaudit_r1.txt`
  (git-ignored; rerun to regenerate, about 20 minutes: `cd tests && NODE_PATH=/opt/node22/lib/node_modules node sim/modaudit.js`).
- One case: `node sim/modaudit.js --w v_flame_beam --mod charged` (10 s). `--all` adds rank 3.

Dead combos by cause, largest first:
1. **A Delivery modifier kills the shot modifiers (about 560).** NO-OP counts by base: Melee 191, Mines 160, Orbiting 111,
   Strike from Above 101, Extra Shots 78, Ranged 14, no Delivery 106. `mwFire` (modwide.js:123) returns before the normal
   shot for Melee (:139), Ranged (:140) and Mines (:141), so `modProj` (game.js:1931: Homing, Piercing, Bounce, Explosive
   Hits flags) and the Tempo multipliers never touch the replaced attack. The Laser does the same in its own `wupFire`
   wrapper (laserbeam.js:588): with Melee or Mines it returns before `lzBlast` (:369), the Laser's Charge-Up.
2. **Signature weapons ignore modifiers even with no Delivery (about 70).** Ewww, Gross (13 dead naked, including Mines,
   Strike from Above, Close Range), There Is No Spoon (11, including Melee, Mines, Strike from Above), One of These Days
   (11), Peekaboo (6, including Melee, Ranged, Mines, Strike from Above), Spark of Life (7), Little Prick (7), Rent Free (6).
   They fire through their own code (sigweap.js, sigs.js) that never reaches `wupFire`'s replacements or `modProj`.
3. **Invisible by design in open play (about 230, not bugs).** Bounce only bounces off walls (modifiers.js:190, `modWall`);
   Homing changes nothing when the shot already hits; Area needs a blast or pool; Status Boost needs a status (never on
   Force weapons); Same Type Bonus needs a second weapon of the type.
4. **Numbers only (54).** Empowered Attack, Close Range, Focus, Same Type Bonus: damage moves 8 to 35%, nothing to see.

Audit blind spots: one enemy kind (crawlers), no walls, no elites or bosses, no shooters, 20 s, rank 1, no branches.
A modifier whose whole effect is a branch or mastery (Rank 2 or 4) reads as NO-OP here.

## Task 1: draft filter (Sonnet). Never offer a card the audit says is dead.
Goal: a player never takes a modifier that does nothing on that weapon in its current form.
1. New file `web/js/moddead.js`, loaded after `cellmods4.js` and before `ui.js` (add the script tag to `index.html`; add a
   row to `ARCHITECTURE.md`). It holds a table `MOD_DEAD`: `{ '<weapon id>': { '<base>': ['mod', ...] } }` where base is
   `''` (no Delivery) or the Delivery modifier id, built from the NO-OP lines of `tests/out/modaudit_r1.txt` (a small node
   script in `tests/tools/moddead.js` that reads the audit file and prints the table; commit the generated table, not the
   audit file). Weapon ids and names: `MATRIX_ONLY.weapons` in matrixonly.js and `WEAPONS[id].name`.
2. Wrap `modOk` once in moddead.js (the wrap-and-replace pattern, as matrixonly.js:32 does): return false when
   `MOD_DEAD[w24Key(w)]` lists `id` under the weapon's current Delivery (the Delivery is the entry of `w.m10` whose
   `MM_GROUP` is `'delivery'`, or `''`). Leave the cause-3 modifiers (Homing, Bounce, Area, Status Boost, Same Type Bonus)
   in the table too: dead is dead for the player. Do not touch `modDraftCands` or the other `modOk` wraps.
3. A Playwright test `tests/moddead.js` (copy the shape of an existing short test, run with `./run.sh moddead quick`):
   a Laser slot with `m10 = ['mines']` gets `modOk(w, 'charged') === false`; a naked Laser gets `true`; Standard Issue
   naked still offers Charge-Up, Knockback and Rapid Fire. Also assert `modsFor(w)` is never empty for any matrix
   weapon with each Delivery (a weapon must always have something to draft).
4. Rerun `node sim/modaudit.js` and quote: combos tested (should drop by about 760) and NO-OP (should be near 0).
5. Change log fragment `changes/<branch>.md` (Systems: modifier cards, tests; Files; Save data: none; Hooks: none).
Acceptance: the test passes, the audit's NO-OP count is under 20, and no weapon x Delivery has an empty draft.
Known cost: the Delivery cards themselves (Melee, Mines and so on) stay offered; this only hides what dies after them.

## Task 2: route the Delivery replacements through the modifier path (Opus, high effort)
Status (25 Oct): done on `ccr-01uaxx2k-delivmods`: 761 -> 670 NO-OP. Step 4 (regenerate MOD_DEAD) waits for task 1 to merge.
Goal: Charge-Up, Empowered Attack, Focus, Close Range, Long Range, Status Boost, Explosive Hits and Piercing apply to
melee swings, mines, ranged strikes and the Laser's mine beams and sword, so taking them after a Delivery does something.
1. In `mwFire` (modwide.js:123) the Charge-Up block (:127) already runs before the early returns, but Mines and Melee then
   build their own `src`. Make `mwLay`, `mwMelee` and the Ranged strike carry the `src` multipliers (`src.mult`,
   `src.mwFull`) and the Empowered flag (`w.m10emp`, modifiers.js `modAtk`) into their hits, and give their hits the
   `modProj` flags that make sense on a blast: Piercing (melee arc hits everything in its line), Explosive Hits (a blast on
   the hit), Status Boost (status fill). Skip Homing and Bounce here: see task 3.
2. Laser: in the `wupFire` wrapper (laserbeam.js:588), when `mwR(w, 'charged')` and Mines or Melee are held, run the
   charge (`lzCharge`, `lzCharging`) and fire the mine or sword as a Charge-Up blast (`lzBlast`'s share and heat) instead
   of the plain lay or swing. Keep the LZ_BLAST heat rule so a mine-laying Laser still overheats.
3. Prove it: `node sim/modaudit.js --w v_flame_beam` and `--w v_phys_proj` before and after; quote Laser + Mines and
   Standard Issue + Melee NO-OP counts (11 and 8 before). Then the full run. Expect about 400 of the 760 to clear, half
   to VISIBLE and half to NUMBERS.
4. If task 1 shipped first, regenerate `MOD_DEAD` from the new audit so the freed combos are offered again.
Order-of-operations traps: `mwFire` runs after the weapon's own `wupFire` (modwide.js:154); `cellmods*.js` mask shared
modifiers per weapon (`XC_W` in cellmods.js); the Laser's `lzIs` guard in the Charge-Up block (:127) is deliberate.

## Task 3: per-Delivery forms for Flight and Crowd modifiers (Opus, design conversation first)
Goal: Homing, Bounce, Returning, Link, Pull, Knockback and Extra Shots each have a stated form on Mines, Melee, Strike
from Above and Orbiting, so no combo is "the flag is set but nothing can use it".
Start as a design chat with the user, not code: propose one line per cell (Homing on Mines = mines creep towards enemies,
as Smart Mines already does; Bounce on Mines = shrapnel that hits a second enemy; Bounce on Melee = the swing's last hit
rebounds to one more enemy within 100...), get the table agreed, then build it as one shared table `XD[delivery][mod]`
in modwide.js that the four Delivery paths read, with the per-weapon cells (`MODIFIER_MATRIX.md` 5.x, cellmods*.js)
overriding. Several days, in batches of one Delivery at a time; rerun the audit after each batch and shrink `MOD_DEAD`.

## Also open
- Something in the game carries one run's weapon modifiers into the next `newGame()` on the same page (identical sim
  trials drift until the page is reloaded; the audit reloads per trial to dodge it). Not a player bug (one game per page
  load) but it can corrupt any sim that runs several games per page. Not found yet: META, uidSeq, HOOKS, QUAL/FPS, the
  weapon defs and every top-level object global were ruled out by snapshot diff.
- The audit does not cover ranks 2 to 4 (branches and masteries) or walls. A second arena with a wall and a boss would
  catch Bounce and the boss-only lines.
