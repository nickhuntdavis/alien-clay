# Samples: the eight playable characters

Working proposal (17 Oct 2026). Design only, nothing built yet.

A **sample** is the character you play. **Epigenetic Profiles** are build choices inside a sample. The eight samples replace the current sequences (Firstborn, Chonker, Bright Spark and the rest) as the thing you pick and unlock. They unlock in order, and the study gets harder to explain with each one: human variation first, then dubious material, then samples that shouldn't exist. The Scientist never explains where they came from.

## Rules that come with this
- **Profiles go by their trait names**, so they no longer read as characters: Quick Recovery, Puppy Fat, Early Developer, Favouritism, Under Your Feet, Healthy Appetite, Overtired, Good Genes. Ranks carry over.
- **Game modes become "Experiments"** (for example, "Experiment #002: The Petri Dish"). This frees the word "sample" for characters. Internal ids (`s002`) stay as they are.
- **The sperm doesn't speak** (`VOICE_GUIDE.md`). A sample's personality shows in how it moves and in how its pre-incarnate consciousness talks to it ("you"). Each sample's consciousness has its own personality under the shared voice rules.
- **The Scientist uses IDs.** The strain number is the roster position (Baseline is 1, the Other Half is 8). The letter is the run of that strain: 1A, 1B and so on.
- **Readable without colour.** Each sample must be recognisable at phone size by shape, movement and trail alone; colour (from its damage types' visual language in `DAMAGE_TYPES.md`, decision 20) reinforces it. Lab view is retired (decision 21).
- **Damage types:** only the seven in `DAMAGE_TYPES.md`, and every sample follows the reconciliation decisions in `COMBAT_MATRIX.md` section 10 (Soul possesses; Fire does not spread on its own; Acid's only ongoing damage is Pools).

## Changes from the first proposal
1. **The Overachiever and the Unsolicited were both Static + Force.** The Unsolicited now leads with Fire.
2. **Acid had no character of its own, and Fire only came with the final unlock.** Samples 1 to 7 now lead with one damage type each, and the Other Half mixes types.
3. **"Inner voice" wording became behaviour plus consciousness**, because the sperm doesn't speak.
4. **Scientist lines use IDs.**
5. **The old sequence names overlapped the new samples** (Firstborn and Baseline; Favourite and Family Friend; Bright Spark and Overachiever). Profiles now go by their trait names.
6. **The unlock triggers are now concrete**, mostly built on stats the game already tracks.

## Roster

| # | Sample | Provenance | Primary / support | Starting attack type | Passive | Unique Feat |
|---|---|---|---|---|---|---|
| 1 | The Baseline | Human | Force / Blood | Projectile | No gimmick: +5% to every base stat | **Standard Procedure**: a Force shove ring that knocks everything back |
| 2 | The Overachiever | Human | Static / Force | Beam | Fire rate rises while moving and drops when still | **Personal Best**: a burst sprint that leaves a Static wake; each hit extends it |
| 3 | The Late Starter | Human | Blood / Mucus | Contact | Below 30% health, lifesteal and damage rise with missing health | **Second Wind**: drains Blood from every wounded enemy nearby; heals more the more health is missing |
| 4 | The Family Friend | Human (paperwork sealed) | Acid / Soul | Projectile (single target) | Its Acid builds Corrosion faster, and enemies it Possesses deal extra damage to their mates (others do its fighting) | **Pulling Strings**: marks the toughest enemy; it gains Corrosion, and every enemy near it gains Soul build-up, so they turn on it |
| 5 | The Cold Parcel | Unknown | Mucus / Acid | Pool (a trail) | Leaves a sticky trail that slows enemies | **Shrink Wrap**: Snares a ring of enemies in Mucus, then leaves an Acid Pool under the stuck ones |
| 6 | The Unsolicited | Unknown | Fire / Static | Spread | Its Static hits also add Burn, so arcs warm up everything they chain through | **Reply All**: fills the nearest enemy's Burn bar, and Static arcs from it add Burn to everything near it |
| 7 | The Unaccounted | Impossible | Soul / Blood | Burst (delayed) | Enemies it Possesses make the enemies they hit Bleed | **Recount**: Possesses up to 6 enemies for 3 s; when it ends, each loses a chunk of health (the count corrects itself); kills refund stamina |
| 8 | The Other Half | Extraterrestrial | Shifts between Fire, Soul and Static | Beam | Its whole kit changes damage type every 20 s (shown on the HUD) | **First Contact**: shifts type now and sets off a reaction on every enemy carrying a status |

**Coverage:** every damage type leads exactly once (the Other Half aside), all six attack types from `ATTACK_TYPES.md` appear, and no two samples share a pair. The numbers here are starting points for playtesting.

## Scientist lines (flat tone, by ID)
1. "Sample 1A established as control. Expectations remain low."
2. "Sample 2A: motility exceeds the reference range. The subject appears pleased with itself."
3. "Sample 3A: initial results inconclusive. Subsequent results have become inconvenient."
4. "Sample 4A: donor details marked confidential. The handwriting is familiar."
5. "Sample 5A arrived cold. Supplier has not responded to three emails."
6. "Sample 6A located outside the laboratory. The door was locked. No further comment."
7. "One additional specimen observed. The original count remains correct."
8. "Sample 8A has responded to the target. The target has not yet been introduced."

## Unlocks, in order
1. **The Baseline:** available from the start.
2. **The Overachiever:** reach wave 10 of the Petri Dish in one run.
3. **The Late Starter:** recover from below 10% health to full health in one run.
4. **The Family Friend:** beat the Petri Dish with any sample. It turns up once the hard work is done.
5. **The Cold Parcel:** open a Mythical box.
6. **The Unsolicited:** survive one of the slide's rare big hazards.
7. **The Unaccounted:** shown as "???" until earned. Land a boss's killing blow with Soul damage.
8. **The Other Half:** beat the campaign's furthest level (Level 1 today).

The first few unlocks come early, so players get variety quickly. The last two reward curiosity and mastery.

---

# 1. The Baseline (Sample 1A)
**Origin:** Human. Ordinary donor, ordinary Tuesday, standard collection cup.

**Story:** The Baseline was picked to be the reference point: the sample every other sample is measured against. It has normal shape, motility near the population average, and nothing in the file that needs a second look. The Scientist logged it and expected it to die on schedule. It didn't, and it keeps not doing so. That is now the only unusual thing about it, and the Scientist has noted it with visible reluctance.

**Character:**
- **On screen:** swims in straight lines and turns cleanly. It never wobbles or shows off. When hit, it flinches and carries on.
- **Its consciousness:** plain, stubborn and dead set on the egg. It has no plan beyond "forward".
  > "That's the egg. Go at the egg. Why are you looking at anything else."

**Visual language:**
- **Silhouette:** the textbook sperm. Oval head, neat midpiece, even tail. It is the template the other seven are drawn as variations of.
- **Motion:** a regular, metronome tail beat. It is the only sample with a perfectly steady rhythm.
- **Trail:** a faint, even wake. Nothing else.
- **Colour:** Force's white and pale grey, with Blood red at the tail tip.
- **Select card prop:** a labelled specimen tube with a printed barcode, and "CONTROL" handwritten and underlined twice.

# 2. The Overachiever (Sample 2A)
**Origin:** Human. The donor form lists "competitive cycling, triathlon, supplements (various)" and runs onto a second page.

**Story:** Its motility is above the reference range, and it went into hyperactivation (the frantic whiplash swim real sperm use near the egg) before it had any reason to. The donor's history mentions a lot of things bought online. The Scientist has decided not to test for any of them, because the results would require paperwork.

**Character:**
- **On screen:** never idles. It drifts forward even when you stop steering, overtakes its own bullets and arcs through tight gaps.
- **Its consciousness:** impatient and treats everything as a race. It takes every obstacle personally.
  > "Faster. No, faster than that. Something just passed you. Nothing is allowed to pass you."

**Visual language:**
- **Silhouette:** a lean, slightly elongated head and an oversized, muscular midpiece (all mitochondria). The tail is longer than standard.
- **Motion:** a whip-crack tail beat at double tempo, with the head jittering slightly as if over-caffeinated.
- **Trail:** short streaks of crackle that snap off behind it. At top speed the streaks join into a single line.
- **Colour:** Static yellow, with white spark points along the tail.
- **Select card prop:** a sports bottle with the label peeled off, and a stopwatch.

# 3. The Late Starter (Sample 3A)
**Origin:** Human. Written off on the first count as "sluggish, low progressive motility".

**Story:** It sat on the slide doing almost nothing for long enough that the Scientist moved on. Real sperm can survive for days in cervical mucus, waiting. This one seems to have taken that as a personal philosophy. It recovers from things that should have finished it, every time, and always slightly too late to look intentional. It insists this was the plan.

**Character:**
- **On screen:** a slow first few seconds of every run, then it settles into a heavy, steady swim. At low health it visibly tightens up and swims harder.
- **Its consciousness:** defensive, touchy and resentful of being underestimated. It claims every near-death was deliberate.
  > "We're fine. This is fine. Being nearly dead is part of the strategy. Don't look at the health bar."

**Visual language:**
- **Silhouette:** a slightly lumpy, rounder head that looks like it has been through things. There is a small notch in the tail, an old injury.
- **Motion:** a lazy, wide tail beat that sharpens as health drops. Below 30% health the beat goes tight and fast, and the head pulses like a heartbeat.
- **Trail:** a thin wet smear that glistens (Mucus). When it heals, droplets are pulled back into it from wounded enemies.
- **Colour:** Blood red, brightening as health falls, with a Mucus green sheen on the smear.
- **Select card prop:** the original assessment sheet with "UNREMARKABLE" crossed out, and nothing written in its place.

# 4. The Family Friend (Sample 4A)
**Origin:** Human, officially. Donated with an immaculate consent form, a handwritten note and a phone number the Scientist was told not to call.

**Story:** It came through no supplier and no queue, with a note asking that it "be looked after". The donor fields are redacted. The handwriting on the note is familiar, and the Scientist has decided not to work out why. It behaves as though the egg has been told it is coming. Barriers in its way dissolve, as if someone made a call.

**Character:**
- **On screen:** unhurried and composed, swimming at a steady, entitled glide. It doesn't dodge so much as expect things to move. Its shots are few, precise and aimed at the most important target, and the enemies it turns start doing its fighting.
- **Its consciousness:** assumes doors will open, rules will bend and the egg is expecting it by name. It is genuinely confused when something resists.
  > "Why is that one still blocking us? Does it know who you are? Tell it who you are."

**Visual language:**
- **Silhouette:** a perfectly proportioned, almost polished head, the most symmetrical of the eight. It has a slight collar at the neck, like a tailored fit.
- **Motion:** a smooth, unhurried tail beat with no wasted movement. It glides between beats.
- **Trail:** almost none. Where its shots land, Shell fizzes and peels away (Acid); enemies it turns show a faint purple shimmer as they switch sides (Soul).
- **Colour:** Acid's shocking pink, with a thin gold rim.
- **Select card prop:** a sealed envelope with a wax-style stamp and a sticky note reading "VIP: do not discuss".

# 5. The Cold Parcel (Sample 5A)
**Origin:** Unknown. A mail-order cryo container: no supplier name, invoice reads "biological material", express delivery charged twice.

**Story:** It arrived in a frosted box still steaming with liquid nitrogen (stored at −196 °C, as real banked sperm is). Thawing kills a large share of a frozen sample. This one thawed, looked around and decided everything was trying to grab it. It slicks every surface it touches, so nothing can get a grip. The supplier has not replied to three emails, and the tracking number leads to a car park.

**Character:**
- **On screen:** slippery and evasive. It slides through turns rather than carving them and leaves a trail that slows anything that follows.
- **Its consciousness:** paranoid and suspicious of every surface. It thinks the slide itself is in on it.
  > "Don't touch that. Don't touch anything. Everything here wants to hold you and you are not to be held."

**Visual language:**
- **Silhouette:** a head with a frosted, crystalline outer coat that slowly melts during the run. There are tiny ice flecks on the tail.
- **Motion:** a sliding, skating motion with slight overshoot on turns. It shivers occasionally.
- **Trail:** a glossy, stretchy green ribbon (Mucus) that strings out when enemies pull free. Small Acid puddles bubble where its Feat lands.
- **Colour:** frost white over Mucus green, with Acid pink in its puddles.
- **Select card prop:** a dented polystyrene box, half a shipping label, frost on the corners and a "THIS WAY UP" arrow pointing sideways.

# 6. The Unsolicited (Sample 6A)
**Origin:** Unknown. Found outside the lab door before the Scientist arrived: no postage, no label, no fingerprints. Eleven minutes of security footage are missing.

**Story:** Nobody ordered it, and nobody admits to delivering it. It was there, in a container slightly too warm to touch. Since then it has been fascinated by everything, and everything it touches catches. It doesn't seem malicious, just very interested in what happens next. Its name is also the polite term for a kind of photo nobody asked to receive. The Scientist uses the name with a straight face.

**Character:**
- **On screen:** erratic and curious. It swerves towards new enemies and pickups with no regard for safety, then darts away again. Its arcs warm up whole crowds until they go up one after another.
- **Its consciousness:** hyperactive and distractible. It swings from terror to delight with no logic in between.
  > "Ooh. Ooh, what's that. Touch it. TOUCH IT. Oh no. Oh no, it's on fire. Brilliant. Do it again."

**Visual language:**
- **Silhouette:** a slightly too-wide head with a soft glowing core, like an ember inside a bean. The tail tip flickers.
- **Motion:** twitchy, with sudden direction changes and little curious loops. It never swims straight for long.
- **Trail:** drifting sparks and heat shimmer. Ignition flares bloom on enemies, and thin yellow Static threads jump between warm ones.
- **Colour:** Fire orange with white-hot flecks and yellow arcs.
- **Select card prop:** an unlabelled container on a doormat, slightly scorched, with a still frame of security footage showing an empty corridor.

# 7. The Unaccounted (Sample 7A)
**Origin:** Impossible. It appeared in a routine count (on the gridded counting chamber real labs use) despite never being put on the slide.

**Story:** The count was correct. Then it was one higher, and it still checked out as correct. The extra specimen casts its shadow in the wrong direction and doesn't show up in the second photograph. The Scientist has stopped recounting. It moves as if it has made this swim before and remembers how it ends. It seems certain the egg remembers it too.

**Character:**
- **On screen:** calm, almost slow, never panicked. Enemies it passes sometimes forget whose side they are on, and the ones it turns lose health a beat after they recover, as if something were taken from them on a delay.
- **Its consciousness:** quiet and ancient-feeling. It talks like it is remembering, not planning. Its lines are rare and short. This is the only consciousness that is ever gentle.
  > "You've done this before. You won't remember. I do. Left here."

**Visual language:**
- **Silhouette:** a standard shape that is slightly translucent, with a faint second outline offset by a frame, like a double exposure. Its shadow falls the wrong way (a lone wrong-way shadow reads well in greyscale).
- **Motion:** smooth and unhurried, with an occasional stutter where it seems to skip a frame and land slightly ahead.
- **Trail:** pale wisps that linger and drift towards the enemies it is turning. A Possessed enemy carries its double exposure: a faint ghostly copy, a beat behind.
- **Colour:** Soul's translucent, sparkly purple with a cold white rim; the health it takes back is Blood red.
- **Select card prop:** a counting-chamber grid with one cell circled in pencil, and "recount?" written beside it and crossed out.

# 8. The Other Half (Sample 8A)
**Origin:** Extraterrestrial. Recovered from a container with no seams, no opening and no measurable interior volume. The paperwork is in a script no one recognises.

**Story:** It doesn't understand human biology and doesn't need to. It reacted to the egg's location before the egg was on the slide. It swims as if following a signal no one else can hear. The name comes from the only phrase in its paperwork that the translation software would commit to. It is utterly sincere and every bit as obsessed with fertilisation as the others. It just got here from much further away.

**Character:**
- **On screen:** precise and unfamiliar. It cuts paths no other sample takes, as if it can see routes through the slide. It changes damage type on a cycle, and its body visibly reconfigures each time.
- **Its consciousness:** earnest and slightly mistranslated. It uses the right words in the wrong order and means every one.
  > "The egg is there. The egg is always there. You are the arriving. Proceed with the arriving."

**Visual language:**
- **Silhouette:** almost a sperm, but wrong. The head has a faceted, slightly geometric shape, the one deliberate break from the organic rule. It has two thin tails that beat out of phase.
- **Motion:** a smooth, gliding swim with no visible beat effort, plus a brief shimmer and reshape at each type shift.
- **Trail:** changes with its current type: shimmer for Fire, wisps for Soul, threads for Static. Each shift leaves a ring-shaped ripple on the slide.
- **Colour:** iridescent: a slow shift across the body that settles on the active type's colour (orange, purple or yellow).
- **Select card prop:** a smooth, seamless container, and paperwork covered in unreadable script with one line translated in pencil: "OTHER HALF".

---

## Silhouette check
With colour off, each sample still reads by one signature:
1. Steady beat (Baseline)
2. Whip-crack beat (Overachiever)
3. Notched, pulsing tail (Late Starter)
4. Polished glide (Family Friend)
5. Frosted coat and sticky ribbon (Cold Parcel)
6. Ember core and sparks (Unsolicited)
7. Double exposure and wrong-way shadow (Unaccounted)
8. Faceted head and twin tails (Other Half)

## Open decisions
1. **Redtail, the Twins and Prawn Again:** retire them as samples (recommended), or keep them as secret ninth and tenth samples.
2. **Profile weapons:** each Profile either keeps its old starting weapons or becomes a trait only. Trait-only is recommended, so the sample owns the kit.
