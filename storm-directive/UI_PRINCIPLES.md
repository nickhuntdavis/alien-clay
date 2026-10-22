# UI principles: Spawn Prawn menus, overlays and HUD

Taken from Nick's hand-crafted screens in the Figma file (`waCztn7dWzQVMt7il1lwvB`, Screens page, 21 Oct 2026): 01 Title, 02 Sample Rack, 03 Mode Select, 04 Weapon Draft, 06 DNA Loot, 08 Pause (You), 09 Tackle Box, 10 Settings. Those screens are the reference: the game and every other screen should match them. If this file and those frames ever disagree, the frames win; update this file.

Scope: menus, overlays and HUD (the e-ink layer). The game world is not e-ink; see "Three layers" at the end. Visual style for things drawn on the slide is in `STYLE.md`.

## 1. Say it once

The biggest change across the eight screens was removal. Before adding a line, check it is not already on screen in another form.

1. **No written damage type beside its colour.** The swatch, or the icon drawn in the type colour, is the label. Write "POOL", not "MUCUS | POOL". The same goes for defence kinds. Keep a word only when there is no colour to carry it (Feats with no type say "NO TYPE").
2. **No stat values when a bar already shows them.** Weapon Draft stat bars have no "5/5" readout.
3. **No restating kicker.** The draft detail lost its "Projectile | Force" line: the selected option above already says it.
4. **No legend that repeats the buttons.** DNA Loot lost "Choose 1 of 3" and "3 genes spliced".
5. **No status meta on a section header** unless you can act on it. Autorun lost "Kite active": the lit option shows it.
6. **No box around a single block of text.** Pause's Sequences text sits on the page under its section header, not in a panel.
7. **No subtitle that repeats the title.** Settings and Pause have none; Pause uses that line for run stats instead.
8. **One way in per action.** The title screen dropped the Daily Challenge button.

## 2. Screen frame

- 390 x 844 portrait. Vertical auto layout, **20 px side gutters**, 28 px top padding.
- **14 to 16 px between blocks.** DNA Loot is deliberately airy (56) because it has three items to weigh.
- Long screens reserve **120 px bottom padding** so content clears the pinned actions.
- Screens scroll inside the frame; the header and pinned actions don't move.

## 3. Screen header

One component (Screen Header), used two ways.

**With a counter** (a step or a level):
```
02/02                              Step 2 of 2     <- counter: Display/Screen Title; context: Label/Kicker, sentence case, muted, right
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  <- 3 px rule, border/edge
CHOOSE EXPERIMENT                                  <- title: Display/Screen Title, upper case
This is how you'll fight.                          <- subtitle (optional): Body/Default, sentence case, one line
```
Counters: `01/02` and `02/02` for the start flow, `LV 01` and `LV 03` for level-up screens. Context: "Step 2 of 2", "Your first weapon", "Splice one gene", "Armoury".

**Without a counter:** the title moves up into the counter slot, above the rule (PAUSED, SETTINGS, TACKLE BOX). Under the rule goes either a one-line subtitle or a stats line ("Time 0:04 | Level 1 | Kills 0 | Rerolls 2"), or nothing.

## 4. Pinned actions

- Absolutely positioned at the bottom, **full bleed** (x 0, 390 wide), sheet fill, **2 px top rule** across the whole width.
- Padding 24 top, 16 sides, 24 to 28 bottom; 8 px gap.
- Buttons are 48 px tall. One action: full width. Two: equal halves, or a wide primary with a narrow secondary (REROLL / SKIP). Four: a 2 x 2 grid of equal halves (RESUME, TACKLE BOX / SETTINGS, QUIT).
- **One primary (lit) per screen**, normally the action that moves you forward: CHOOSE STANDARD ISSUE, RESUME, BACK TO THE RACE. A lone exit is primary too (Settings BACK). The exception is BACK inside the start flow (Sample Rack, Mode Select): it steps backwards and the cards are the way forward, so it stays secondary.
- DNA Loot is the one exception: its two buttons sit in the flow, not pinned.

## 5. Grids fill the row

- Tiles, options and tabs are **equal-width columns that fill the content width**. Never fixed-width tiles that leave dead space at the end of a row.
- **3 per row**, 6 to 8 px gaps: draft options, autorun directives (2 rows of 3), Pause stat tiles (3 x 3), Tackle Box loadout tabs (3 large tabs: icon above label).
- Tab chips across the top of a screen share the width equally (YOU, RUN, BUILD, THE LAB, GUIDE).

## 6. Cards and selection

- Card: sheet fill, **2 px edge, radius 7** (radius/lg), padding 14 to 16. Buttons: radius 5 (radius/md), 3 px rule. Chips: radius 3 (radius/sm), 1.5 px rule.
- **Selected or primary = lit** (inverted: dark fill, light text). That goes for the selected draft option, the chosen autorun directive, the selected chip and the primary button. Nothing else uses the lit fill.
- Icon tiles: 48 or 64 px square, app fill, 2.5 px edge. Icons are drawn in the damage-type colour where they have one.
- **Rarity:** tile and rarity chip read as one unit (the chip sits flush under the tile). From Legendary up, the whole card takes the rarity ink: rarity-coloured edge and rarity-filled tile.
- **Catalogue cards** (samples, modes): number kicker on the left ("#001", "#001 | IN STOCK"), a short upper-case tag on the right ("RACE TO THE EGG", "WAVE MODE", "CAMPAIGN"), then an upper-case name and a one-line description.
- **Icons:** 24 px line icons, 1.5 stroke, round caps and joins, small fills only for eyes and droplets. Use them at 24 px and below. Tiles of 48 px and up use pictograms (bold, filled, 4.5 stroke).
- **Content cards:** 48 px lead tile; name and kicker on one row (space-between, baseline-aligned, swatch at the far right); padding 10 by 12; body Barlow Medium 12.

## 7. Section headers

- Upper-case Label/Section with a **2 px rule running to the right edge**.
- One header per group, even a short one (WEAPONS and FEATS each get their own; COMBOS TO BUILD too).
- No meta on the right unless you can act on it (section 1, rule 5).

## 8. Settings rows

- Always the **stacked** layout: label and the round "?" on the top line, options on the line below, **right-aligned**.
- Each row is its own card (sheet, 2 px edge, radius 7), 16 px apart.

## 9. Type and case

- **Upper case:** screen titles, section labels, buttons, chips, card names in catalogues (BASELINE, EVOLUTION), short tags.
- **Sentence case:** subtitles, header context, descriptions, kickers that read as phrases ("Lv 1/10 | Lv 3: pick an upgrade").
- Hand-break long names in narrow tiles so they wrap evenly ("Little / Prick", "Panic / Button").
- **Pipes** separate facts on one line, with spaces either side: "Level 3 strand | splice one gene".
- **Big numbers** (Numeric/Stat) sit above a small muted label in stat tiles: "126" over "MAX HP".

## 10. Copy changes in the reference screens

The user writes all player-facing copy (see `CLAUDE.md`). These are their changes, to carry into the game:

| Where | Now reads |
|---|---|
| Mode Select title | CHOOSE EXPERIMENT |
| Mode Select section | BASELINE SAMPLE (the sample's name + SAMPLE) |
| Race mode | #001, RACE TO THE EGG, EVOLUTION, "Four hundred million hopefuls, one egg." |
| Petri Dish | #002, WAVE MODE, ITERATION, "Twenty drops into the dish, a boss every fifth." |
| Endless | #006, NO END, ENDLESS, "The dish keeps topping itself up. Nobody has found the bottom." |
| Level 1 | #007, CAMPAIGN, LEVEL 1, "The first stretch of the way in. Mapped by nobody who came back." |
| Sample Rack | CHOOSE SPERM SAMPLE, "More samples are on their way. More to cum.", kicker "#001 \| IN STOCK" |
| Title | no Daily Challenge button; START SWIMMING and QUICK START carry the accent line "RANDOM EVERYTHING" |
| Weapon Draft | header LV 01 / "Your first weapon"; subtitle "This is how you'll fight." |
| DNA Loot | header LV 03 / "Splice one gene"; title LEVEL UP; "Level 3 strand \| splice one gene"; REROLL (2 LEFT) |
| Pause | PAUSED + stats line; section SEQUENCES AND ABILITIES; STATS |
| Tackle Box | TACKLE BOX / Armoury; "Set your directives. Your tail does the rest. You do the blaming."; sections AUTORUN, WEAPONS, FEATS, COMBOS TO BUILD; BACK TO THE RACE |

## 11. Three layers, three themes

| Layer | Look | Figma collection | Modes |
|---|---|---|---|
| Menus and overlays | e-ink | Color | Paper / Ink |
| HUD | e-ink, sits on the slide | HUD | On light field / On darkfield |
| Game world (the slide) | semi-realistic, true colours, never e-ink | Slide | Light field / Darkfield |

The three switch independently: white menus over a dark slide, both dark, or the reverse. Weapon and branch previews always sit on the white grid paper (Preview Stage).

## 12. Lab equipment: patterns adopted from the Lab drafts

The UI reads like bench kit: instrument readouts, safety signage and labelled equipment, not app cards.

1. **Pictograms at 64 x 64 wherever possible.** Lead tiles on cards, rows, options and signage are 64 px and the pictogram fills the tile (its 4 px margin is built in). Use 48 only where 64 cannot fit, 96 for hero moments. Pictogram Tile holds a bold scene, never a line icon. On a lit (selected) tile the pictogram flips: body in text/on-lit, cut-outs in bg/lit. Pictogram grammar: Spermy (solid head, thick wavy tail) doing one thing; solid masses (ground, bursts, droplets); marks at 4 px or more, tails at 4.5; fill the 64 px frame with a 4 px margin; three elements at most; cut-outs use the background token so they work in dark mode.
2. **Readouts for numbers.** Readout (Large over a muted label, or Small) inside a Readout Panel (3 or 4 equal cells with thin rules) or a Readout Grid (3 x 3). Use for run results, bank totals and stat sheets instead of boxed stat tiles.
3. **Segmented Tabs for tabs.** One ruled bar, equal segments, 1.5 px dividers, the selected segment lit. Text for Pause and Settings; Icon (icon over label) for Tackle Box slots. Filters (Field Guide) stay as wrapping chips.
4. **Signage Header for moments.** Counter, context line, 3 px rule, then the situation as a row of pictogram tiles. Wave start, Level zone entry, boss arrival, run-event warnings.
5. **HUD.** See section 14 (Immersive HUD). The Wave Banner, top bar, minimap and event chips belong to the full HUD (Immersive off) only.
6. **Restraint.** Thin rules (1.5 to 2 px; 3 px only on buttons and emphasis), modest type, plenty of air. Let numerals and pictograms carry the weight.

## 13. Where things live in Figma

Components page, in sections: 1 Icons and pictograms, 2 Actions and selection, 3 Structure and messages, 4 Cards, 5 Data and readouts, 6 HUD, 7 Game world, 8 Portraits, 9 Notation. Screens page in number order, each with numbered pins and a Notes stack under the frame (Note Pin and Note components: design notation only, never in the game). Content page for the data sheets. Superseded work goes to the Archive page, never deleted.

## 14. Immersive HUD (in run)

The default in-run HUD follows v10 Immersive: subtle, out of the way, and dark-only. The HUD collection has one look (translucent blue-black film, #d6e4f0 text, 1 px hairlines at 30%), whether the slide is light field or darkfield. It is separate from the menus' Paper / Ink.

- **Edges, not bars.** XP is a 3 px line along the top. HP is a 3 px line along the bottom, hidden at full health, white then yellow under 60% then red under 15%. Below 30% a faint red band pulses round the edge. Level is a faint 9 px number top-left.
- **Corners.** AUTO and speed top-left, Tackle Box and pause top-right. Ghost keys are 44 px, radius 12, at 50% opacity (85% when lit, 90% while pressed).
- **Bottom.** Weapons are 62 px round keys stacked bottom-right; Feats are the same round keys stacked bottom-left, opposite. A 2 px ring in the type colour fills as each reloads. Rewind (64 x 52) and Autorun (RUN / KITE, 140 x 52) are rounded rectangles side by side at the bottom centre; Autorun is the bigger. The starting ability sits above the Feats.
- **Narrator.** Lines wait behind a 34 px dot bottom-left (Whisper); tap to read and the game slows to 10%. No message boxes on the slide.
- **Nothing else by default.** No top bar, counters, map or event chips; those are the full HUD (a Settings option).
- **Over the slide.** Signs (wave start, zone) use the Ink UI mode on a film panel so they never flash white over darkfield. Intro cards and pause menus stay Paper over a dimmed slide.
