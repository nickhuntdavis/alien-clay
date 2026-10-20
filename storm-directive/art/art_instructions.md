# Art instructions: drawing for Spawn Prawn

How to draw creatures, sperm and effects in Procreate (and screens in Figma) so Claude can put them in the game.

Each section has two levels:
- **Bare minimum**: what must be there and correct, or the art can't go in.
- **Best case**: everything that makes the result match your drawing exactly. You couldn't give more than this.

Anything between the two is fine. More is always better, but the bare minimum is enough to start.

---

## 1. One-time setup (10 minutes)

1. AirDrop the `art/_kit` folder from the Mac to the iPad. Save it in Files (On My iPad or iCloud Drive).
2. In Files, tap each of the three `.swatches` files. Each one opens Procreate and adds a palette:
   - `Palette-Damage-Types`: Force, Acid, Static, Mucus, Blood, Alien, Fire, plus defence colours.
   - `Palette-Rarity-Signals`: rarity colours, reward gold, danger red.
   - `Palette-Slide-UI`: the slide, Darkfield black, and the menu colours.
3. Save `Palette-Key.png` to Photos. Procreate palettes don't show names, so this is your list of what each colour means.
4. In Procreate, tap **Import** (top right of the gallery) and import the three templates: `Template-Creature.psd`, `Template-Swimmer.psd`, `Template-Effect.psd`.
5. Open each template once and check the colour profile: **Actions (spanner) > Canvas > Canvas information > Colour profile**. It must be **sRGB**. If it says Display P3, the colours in the game will look different from your drawing.
6. Leave the three templates untouched. For each new drawing, swipe left on a template in the gallery and tap **Duplicate**.

---

## 2. Creatures (enemies and bosses)

### Steps

1. Duplicate `Template-Creature` and rename it after the creature's folder name (for example `brute`). Names are listed in section 7.
2. Optional: to redesign an existing creature, use **Actions > Add > Insert a file** and choose its PNG from `_kit/current-art/enemies/` or `/bosses/`. Lower that layer's opacity and draw on top.
3. Draw the creature facing right, centred on the cross, with its body inside the big circle. Spikes, legs and glows may go outside it.
4. Put each part that moves on its own layer, using the empty layers provided (`body`, `shell or armour`, `eyes`, `mouth`, `details`). Add more layers if you need them, and give each one a plain name: `leg front`, `jaw`, `spikes`.
5. On the `pivot` layer, put one small dot wherever a part turns or swings (where a jaw hinges, where a leg joins).
6. Check it on both fields: hide `REF Slide light` and show `REF Darkfield black`. It must read well on both.
7. Check it at actual size: pinch the canvas until the creature is about the size of the small square in the top-left guide (about 64 px on a phone). If you can't tell what it is from its outline alone, simplify the shape.
8. Before exporting, hide `REF Slide light`, `REF Darkfield black`, `GUIDE` and `NOTES`, and turn off the **Background colour** layer at the bottom of the layer list.
9. Export: **Actions > Share > PNG Files**. Procreate saves each layer as its own PNG.
10. Hand it over (section 6).

### Bare minimum

- [ ] One PNG of the whole creature with a **transparent background** (no slide, no colour behind it).
- [ ] **Facing right.**
- [ ] At least **1024 px** on its longest side.
- [ ] In the right folder, with the right name (`art/enemies/<name>/` or `art/bosses/<name>/`).
- [ ] One sentence on what it is and what it does, if it is a new creature.

### Best case

Everything in the bare minimum, plus:

- [ ] Drawn on the template at full size (2048 × 2048).
- [ ] **One layer per moving part**, exported as separate PNGs with plain names.
- [ ] **Pivot dots** wherever parts turn.
- [ ] **Poses**, each in its own subfolder (`idle/`, `windup/`, `attack/`, `hurt/`, `death/`):
  - idle: how it looks most of the time
  - windup: the warning before it attacks (players must be able to see it coming)
  - attack: the moment it hits or fires
  - hurt: a quick flinch
  - death: how it pops, splits or melts
- [ ] **A motion reference**: a short loop made with Procreate's Animation Assist (**Actions > Canvas > Animation Assist**), exported as a GIF or MP4, so the timing can be matched.
- [ ] **A notes file** (`notes.txt`, written in the Notes app and saved into the folder) answering:
  - What moves, and how? (for example "cilia ripple head to tail, 2 waves a second")
  - What glows, and in which colour?
  - How big is it compared with Spermy? (smaller, same, 3× bigger)
  - What should the player notice first?
  - Which damage type is it, if any? (use that colour from the palette)
- [ ] Checked on **both** the light slide and Darkfield.
- [ ] Checked at **actual size**.

### Leave out (the game draws these itself)

- Glows, drop shadows, the slide background.
- Health rings, armour rings, status effects (burning, frozen and so on), the hit flash.
- Elite versions (the game marks elites itself).

---

## 3. Sperm (samples and rivals)

### Steps

1. Duplicate `Template-Swimmer` and rename it after the folder name (for example `baseline` or `chad`).
2. Optional: insert the current version from `_kit/current-art/samples/` to trace or redesign over.
3. Draw the **head on the right** inside the oval, and the **tail running left** along the line.
4. Draw the tail **straight and at rest**. The game bends it into a travelling wave and lengthens it as Spermy levels up, so a curved tail can't be used.
5. Use separate layers: `tail (straight)`, `midpiece` (the neck section), `head`, `cap or hat`, `eyes`, `details`.
6. Put the `pivot` dot exactly where the tail meets the head.
7. Check on both fields and at actual size (a swimmer's head is tiny on screen: the head must read on its own).
8. Hide the REF, GUIDE and NOTES layers and the Background colour, then **Share > PNG Files**.

### Bare minimum

- [ ] One PNG with a **transparent background**: head on the right, tail straight to the left.
- [ ] At least **1500 px** wide.
- [ ] In `art/samples/<name>/` or `art/rivals/<name>/`.

### Best case

Everything in the bare minimum, plus:

- [ ] Drawn on the template at full size (3072 × 1024).
- [ ] The **tail on its own layer**, and the **head on its own layer**.
- [ ] **Pivot dot** at the neck.
- [ ] **Tail thickness** shown: how thick at the neck, how thin at the tip.
- [ ] **The sample's tell**: the one thing that marks it out at a glance (Acro's fizzing pink cap, Private Schooled's blazer stripes). Say what it is in `notes.txt`.
- [ ] **How it swims**: a GIF, or a note ("tail beats fast and short", "the head bobs").
- [ ] Any **extra parts** (a hat, wings, a halo) on their own layers, with a note on whether they move.
- [ ] Checked on both fields and at actual size.

---

## 4. Environmental effects (terrain, hazards, puddles, clouds)

Effects work differently from creatures. The game's style guide says a zone has **no border and no flat fill**: you see it through what is in it (bubbles, hairs, flecks, a sheen), and it fades out towards its edge. So the game needs the **pieces**, plus a rough of the whole.

### Steps

1. Duplicate `Template-Effect` and rename it after the folder name (for example `acid`).
2. On `rough of the whole zone`, paint what the whole effect should look like across the big circles, fading out towards the edge.
3. On `piece 1`, `piece 2` and `piece 3`, draw each small repeating part on its own, inside the small squares (one bubble, one hair, one fleck). Add more piece layers if needed.
4. Check on both fields.
5. Hide the REF, GUIDE and NOTES layers and the Background colour, then **Share > PNG Files**.

### Bare minimum

- [ ] The **rough of the whole zone** as a PNG.
- [ ] A **one-line note on how it moves** ("bubbles rise and pop", "hairs wave in a line").
- [ ] In `art/terrain/<name>/` or `art/hazards/<name>/`.

### Best case

Everything in the bare minimum, plus:

- [ ] Each **piece** as its own PNG with a transparent background, at least **256 px**.
- [ ] Two or three **sizes or versions** of each piece, so they don't look copy-pasted.
- [ ] **How it moves**, as a GIF or a clear note: speed, direction, how long a piece lives, how pieces appear and vanish.
- [ ] **How it shows danger by behaviour, not by colouring it red**: fizzing, bubbling, a glowing rim, steam.
- [ ] **What happens when Spermy touches it** (sizzles, slows, gets sticky): a sketch or a note.
- [ ] **Edges**: how it fades into the slide.
- [ ] Checked on both fields.

---

## 5. Screens and menus (Figma)

### Steps

1. Open the Figma file and duplicate the screen you want to change (right-click > **Duplicate**). Put the copy on its own page or to the right of the original.
2. Build with the existing **components** (Components page) and **colour variables** (Fill panel > the four-dot icon). Avoid typing hex values.
3. Write the final text yourself. Player-facing text is always yours to write.
4. Right-click the frame > **Copy link** and paste it to Claude.

### Bare minimum

- [ ] A **frame link**.
- [ ] One sentence on **what changed** and **why**.

### Best case

Everything in the bare minimum, plus:

- [ ] Built from **components and colour variables**, with nothing detached.
- [ ] **Every state** of anything interactive: default, pressed, selected, disabled, locked.
- [ ] Shown at **phone width (390)**, and in **landscape** if it changes there.
- [ ] Shown with the **longest real text** it will hold, so nothing gets cut off.
- [ ] **Final text** in place, not placeholder text.
- [ ] Notes on the canvas for **motion**: what animates in, in what order, and how fast.
- [ ] New components added to the Components page with their variants, if you made any.

---

## 6. Handing it over

1. AirDrop the exported PNGs (and any GIF or `notes.txt`) to the Mac.
2. Put them in `alien-clay-main/storm-directive/art/<group>/<name>/`, for example `art/enemies/brute/`. Create the folder if it doesn't exist.
3. Tell Claude: "New art in `art/enemies/brute`." For Figma, paste the frame link.
4. Claude builds it into the game and sends back a screenshot from the running game, on both the light slide and Darkfield, for you to approve or mark up.

---

## 7. Folder names

Use these exact names. Lower case, no spaces.

**Samples (`art/samples/`)**
baseline, alpha, beta, private (Private Schooled), ordered (Ordered Online), redtail, prawn (Prawn Again), alien (Not of This World), acro

**Rivals (`art/rivals/`)**
steve (Big Steve), chad (Chad Flagellum), wiggles (Professor Wiggles), zygo (Lil' Zygo), kevin (Kevin), dash (Dash Mitosis), sly (Sly Motility), brick (Brick Wallace), hawk (Hawkeye Harriet), bev (Buckshot Bev), casper (Casper Flagella), mama (Big Mama Morula), vlad (Vlad the Inhaler), ricky (Sticky Ricky), coach (Coach Kenny), delores (Diva Delores), nana (Nana Nucleus), turbo (Turbo Tadpole), norman (Norman Nucleotide), morticia (Morticia Mitochondria)

**Bosses (`art/bosses/`)**
queen (The Macrophage Queen), colossus (The Antibody Colossus), eye (The Immune Eye), matron (The Matron), pepsin (The Pepsinator), alpha (Chad Prime), fever (The Fever), twins (Mitch & Osis), ghost (The Phantom Pregnancy), litmus (The Litmus Strip), johnny (The Johnny), mucus (The Mucus Plug), cramp (The Cramp), sneeze (The Sneeze), stone (The Kidney Stone)

**Enemies (`art/enemies/`)**
crawler (Also-Ran), skitter (Sprinter), spitter (Antibody), brute (Macrophage), bomber (Acid Bubble), splitter (Mitotic Cell), splitling (Daughter Cell), krill (Krill), wisp (Spermlet Swarm), blinker (Quantum Swimmer), medic (Nurse Cell), charger (Headbutter), bulwark (Mucus Wall), warlock (Cytokine Caster), phantom (Ghost Swimmer), summoner (Mother Cell), spire (Enzyme Spire), lancer (Killer T-Cell), amoeba (Amoeba), diatom (Diatom), waterbear (Water Bear), paramecium (Paramecium), rotifer (Rotifer), volvox (Volvox), volvoxling (Daughter Colony), yeast (Candida), pepsinjr (Pepsinator Jr), juggernaut (Alpha Swimmer), sperminator (Booster), endoskeleton (Second Dose), brood (Brood Cyst), broodling (Broodling), planarian (Planarian), alien (Natural Killer), litmus (Litmus Cell), mirror (Mirror Cell), shell (Shell Cell), puffball (Puffball), spore (Spore), grease (Grease Ball), leech (Leech), platelet (Platelet Clump), callus (Callus), plasma (Plasma Cell), interferon (Interferon), cortisol (Cortisol Puff), fibrin (Fibrin Weaver), complement (Complement Protein), stem (Stem Cell), tadpole (Lost Tadpole), pube (Stray Pube), fluff (Navel Fluff), bogey (Bogey), sweetcorn (Bit of Sweetcorn), glitter (Glitter), hocker (Phlegm Hocker), snotbubble (Snot Bubble), hayfever (Hayfever Cell), mutans (Cavity Creep), strep (Strep Chain), thrush (Thrush Spore), amylase (Amylase Droplet), tartar (Tartar Crust), staticsock (Static Sock), stressball (Stress Ball), mosquito (Mosquito), matchstick (Matchstick), candle (Birthday Candle), trappedwind (Trapped Wind), ingrown (Ingrown Hair)

**Terrain (`art/terrain/`)**
ridge (cartilage), mito (mitochondrion), acid (acid pit), cilia, current, slick

**Big hazards (`art/hazards/`)**
acidlake, spermicide, hotflush, plughole, mucusplug

A brand-new creature or effect: make up a short lower-case name and say in `notes.txt` that it is new.

---

## 8. The style rules (from STYLE.md)

1. **It's a live microscope slide, not a game board.** Things sit in the fluid; nothing looks like a flat icon.
2. **Organic, not geometric.** Use wobbly blobs, bent beans and irregular clumps, not perfect circles or straight edges.
3. **Soft outer edges.** Use a thin bright rim or a lit top edge, never a heavy black outline.
4. **Everything alive moves a little.** Movement is slow and small; nothing bounces.
5. **Show danger through behaviour, not red.** Red is kept for bullets and warnings.
6. **Colour means something.** The damage-type and rarity colours are fixed; use them only for what they stand for.
7. **Readouts live inside the object.** A charge is a fill inside the body, not a bar floating under it.
8. **Check both fields.** It must work on the light grey slide and on Darkfield black. Darkfield is the reference look.
