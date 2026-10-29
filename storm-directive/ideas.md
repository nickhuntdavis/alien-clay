# Loadout ideas

Ideas pasted from the Loadout Planner (https://claude.ai/artifact/6nudTiGo14jVZ8TjaprBk3, Copy ideas). The user's words are kept as typed.
How it gets here: the planner's Save to ideas.md button writes each block (with the type the user picked: Weapon, Lv 3 branch, Modifier fork and so on) to the artifact's database, collection `ideas`, status `queued`, then sends Claude a comment. The session that owns the planner then reads the queued rows (ArtifactData list on the artifact URL), appends them here as a dated batch, commits, and marks each row `filed` (update `status`, pinned to its version). Copy ideas pasted into chat is folded the same way by hand.
How it is kept: each paste is a dated batch below, newest first. Status is `new`, `briefed` (a spec exists), `built vX`, or `dropped (why)`. When an idea is built, say which file and card, and leave the row in place so the planner's "under X" paths still make sense. Companion to `WEAPON_IDEAS.md` and `FEAT_IDEAS.md` (older idea banks).

## 29 Oct 2026, second batch (saved from the planner), Baseline, v10.220 data

Standard Issue: three Lv 3 branches, each with its own follow-ons.

| # | Type | Name | Under | Idea | Status |
|---|---|---|---|---|---|
| 1 | Lv 3 branch | Rambo | Standard Issue | Focus on rapid fire. faster reload. more bullets. bigger magazine. / Passive increases rate of fire. | new |
| 2 | Modifier | Faster and faster | Standard Issue > Rambo | Rate of fire increases until magazine empties, then resets | new |
| 3 | Modifier | First blood | Standard Issue > Rambo | Bullets now also cause bleeding | new |
| 4 | Lv 3 branch | Dirty harry | Standard Issue | Focus on accuracy and big hits. longer range. more damage per shot. smaller magazine. / Passive increases crit. | new |
| 5 | Modifier | Lucky shot | Standard Issue > Dirty harry | Guaranteed crit on Punks | new |
| 6 | Feat | Quick draw | Standard Issue > Dirty harry | Every X seconds/stamina, any time an enemy is about to shoot at you, you shoot them first with a double crit. | new |
| 7 | Lv 3 branch | Robocop | Standard Issue | Every Nth shot is a small (unfinished) / Passive, places a target (grudge) on a random enemy ever X seconds. | new |
| 8 | Modifier | Improved targeting | Standard Issue > Robocop | In UI, can do more advanced targeting like "nearest unless there's enemny in range who's about to die" - not sure how to do it in the UI, but that sort of thing | new |
| 9 | Feat | Acid bath (variant of Formic Acid) | Standard Issue > Robocop | The most-Shelled enemy get's sprayed with acid. Leaves an acid puddle. | new |

Maximum Gains, renamed Shotgun (an edit of the card: name only, text unchanged), with three Lv 3 branches.

| # | Type | Name | Under | Idea | Status |
|---|---|---|---|---|---|
| 10 | Weapon (edit of Maximum Gains) | Shotgun | the sperm | Rename only; the text stays "A wide fan of blunt pellets. The closer you get, the more of them connect. Leg day, every day." | new |
| 11 | Lv 3 branch | Sperminator | Shotgun | Metalic armor. Highlights one specific target at a time in red for buig damage (grudge) | new |
| 12 | Sperm passive | Come back | Shotgun > Sperminator | If dies, comes back once as a robot skeleton form | new |
| 13 | Lv 6 branch | Improved targeting | Shotgun > Sperminator | (same text as 8) | new |
| 14 | Lv 3 branch | Evild Dead | Shotgun | Gets a chainsaw attached to its head for close up damage in addition to the shotgun. | new |
| 15 | Lv 3 branch | Riding shotgun | Shotgun | Focus on speed, drive-bys, blitz attacks | new |

A new Contact weapon with three Lv 3 branches.

| # | Type | Name | Under | Idea | Status |
|---|---|---|---|---|---|
| 16 | Weapon | Hand-to-gland | the sperm | (no text yet) | new |
| 17 | Lv 3 branch | Kung fu | Hand-to-gland | Fist and masturbation jokes. | new |
| 18 | Lv 3 branch | Samurai | Hand-to-gland | (no text yet) | new |
| 19 | Lv 3 branch | Biting | Hand-to-gland | (no text yet) | new |

Notes (Claude): the first batch's Rambo, Dirty harry, Robocop, Sperminator, Evild Dead and Melee/Kung fu/Samurai/Biting are superseded by these rows (Melee became Hand-to-gland; the branches now carry their follow-ons). The planner saved each row twice (a double click while the first save was still writing; guarded since), so 38 database rows were filed as these 19.

## 29 Oct 2026, Baseline, v10.220 data

Weapon upgrades (the planner's "Custom upgrade": a branch or modifier on an existing weapon).

| # | Name | Under | Idea | Status |
|---|---|---|---|---|
| 1 | Rambo | Standard Issue | Focus on rapid fire. faster reload. more bullets. bigger magazine. | new |
| 2 | Dirty harry | Standard Issue | Focus on accuracy and big hits. longer range. more damage per shot. smaller magazine. | new |
| 3 | Robocop | Standard Issue | Homing, enhanced, exploding rounds. | new |
| 4 | Sperminator | Maximum Gains | Metalic armor. Highlights one specific target at a time in red for buig damage (grudge) | new |
| 5 | Evild Dead | Maximum Gains | Gets a chainsaw attached to its head for close up damage in addition to the shotgun. | new |

New weapon (the planner's "Custom weapon", with its follow-ons as branches).

| # | Name | Under | Idea | Status |
|---|---|---|---|---|
| 6 | Melee | the sperm (a new weapon) | (no text yet) | new |
| 7 | Kung fu | Melee | Fist and masturbation jokes. | new |
| 8 | Samurai | Melee | (no text yet) | new |
| 9 | Biting | Melee | (no text yet) | new |

Notes (Claude, not ideas): 1 to 3 read as a three-way Lv 3 branch set for Standard Issue in the movie-cop mould (its live promises are Ricochet Brain, Through and Through, Marked for Bonking). 4 and 5 read the same way for Maximum Gains. 6 to 9 are a Contact weapon with three Lv 3 branches; the live Contact weapons are Nervous Wreck and Enzyme Headbutt, and Laser Sword is the built-in Melee Delivery form.
