# Beta copy: every id, where it appears, and the line

Written 30 Oct 2026 into `web/js/betacopy.js` as `BETA_COPY[id]` (looked up by `be1T` in beta1.js and `be2T` in beta2.js). Voice: `voice_and_tone.md`, speakerless hospital paperwork. Limits are characters: tag 25, costs 45 (completes "Costs: ..."), card text 150, float 12, Feat text 130, fork name 18, fork text 90, flavour 60. "Low" means below 40% health. Card, branch, Feat and passive names are the drafted ones and are not in this file.


## Little Prick
- `be_lp_iv_tag` (Lv 3 branch tag: **IV Drip**, 14 chars): Fluids running
- `be_lp_iv_costs` (Lv 3 branch cost line (after "Costs: "): **IV Drip**, 41 chars): healing waits for three dripping enemies.
- `be_lp_iv_desc` (Lv 3 branch card text: **IV Drip**, 129 chars): Needles leave a drip on what they hit, and a Bleed if there was none. While 3 or more enemies are dripping, you heal 1% a second.
- `be_lp_adren_tag` (Lv 3 branch tag: **Adrenaline Shot**, 10 chars): Push, stat
- `be_lp_adren_costs` (Lv 3 branch cost line (after "Costs: "): **Adrenaline Shot**, 31 chars): nothing happens at full health.
- `be_lp_adren_desc` (Lv 3 branch card text: **Adrenaline Shot**, 99 chars): Needle fire rate climbs as health falls: nothing at full health, +80% at 10%. A reason is required.
- `be_lp_draw_tag` (Lv 3 branch tag: **Blood Draw**, 13 chars): Sharp scratch
- `be_lp_draw_costs` (Lv 3 branch cost line (after "Costs: "): **Blood Draw**, 34 chars): only Bleeding enemies fill a vial.
- `be_lp_draw_desc` (Lv 3 branch card text: **Blood Draw**, 118 chars): Each needle that lands on a Bleeding enemy fills a vial. At 10, the next needle is a heavy hit (x4) that heals you 3%.
- `be_lp_salinebag_desc` (card text: **Saline Bag**, 79 chars): The drip heal doubles while you are low. Normal saline is 0.9% salt, by design.
- `be_lp_cannula_desc` (card text: **Cannula**, 61 chars): Needles pierce one more enemy. The green cannula is 18 gauge.
- `be_lp_airbubble_desc` (card text: **Air Bubble**, 127 chars): A needle landing on a dripping enemy sometimes (15%) pops it in a Blood burst, radius 60. Air in the line: dangerous in theory.
- `be_lp_dripfeed_desc` (card text: **Drip Feed**, 109 chars): Healing past full health becomes a shield, up to 20% of max health. Fluid overload is a recognised condition.
- `be_lp_epinephrine_desc` (card text: **Epinephrine**, 112 chars): Dropping below 40% health doubles needle fire rate for 3 s (20 s cooldown). Adrenaline, under its American name.
- `be_lp_racingheart_desc` (card text: **Racing Heart**, 121 chars): While low, each needle that lands adds 2% swim speed for 2 s, up to 20%. Tachycardia is anything over 100 beats a minute.
- `be_lp_overdose_desc` (card text: **Overdose**, 73 chars): At full health the needles deal 15% less. Only the dose makes the poison.
- `be_lp_crashcart_desc` (card text: **Crash Cart**, 120 chars): Once a wave, a killing hit leaves you on 1 health and fires a ring of 16 needles. Out-of-hospital survival is about 10%.
- `be_lp_phlebotomist_desc` (card text: **Phlebotomist**, 70 chars): Elites and bosses fill two vials a hit, not one. The veins are bigger.
- `be_lp_butterflyneedle_desc` (card text: **Butterfly Needle**, 98 chars): The heavy needle pierces everything in its line. Butterfly needles are for small, difficult veins.
- `be_lp_squeamish_desc` (card text: **Squeamish**, 110 chars): Enemies within 100 of a heavy needle's hit flee for 1 s (not bosses). Blood phobia affects about 3% of people.
- `be_lp_bloodbank_desc` (card text: **Blood Bank**, 117 chars): Full vials are stored as heavy needles, up to 3. Dropping below 40% health fires them all at once. Keep refrigerated.
- `be_lp_heavy_float` (float over an enemy or you: a full vial's heavy needle lands and heals you, 11 chars): BLOOD DRAWN
- `be_lp_squeamish_float` (float over an enemy or you: Squeamish scares the crowd round a heavy hit, 9 chars): SQUEAMISH
- `be_lp_airbubble_float` (float over an enemy or you: an Air Bubble pops, 10 chars): AIR BUBBLE
- `be_lp_epinephrine_float` (float over an enemy or you: Epinephrine starts its 3 s, 11 chars): EPINEPHRINE
- `be_lp_crashcart_float` (float over an enemy or you: Crash Cart saves you at 1 health, 10 chars): CRASH CART
- `be_lp_bloodbank_float` (float over an enemy or you: Blood Bank fires the stored needles, 10 chars): BLOOD BANK

## One of These Days
- `be_dd_flatline_tag` (Lv 3 branch tag: **Flatline**, 11 chars): Steady tone
- `be_dd_flatline_costs` (Lv 3 branch cost line (after "Costs: "): **Flatline**, 31 chars): full health pays nothing extra.
- `be_dd_flatline_desc` (Lv 3 branch card text: **Flatline**, 116 chars): The payout grows as health falls: nothing extra at full health, +150% at 10%. Clinically, the flat line is asystole.
- `be_dd_dnr_tag` (Lv 3 branch tag: **DNR**, 24 chars): Signed, witnessed, filed
- `be_dd_dnr_costs` (Lv 3 branch cost line (after "Costs: "): **DNR**, 44 chars): no healing from anything while a mark is up.
- `be_dd_dnr_desc` (Lv 3 branch card text: **DNR**, 94 chars): While a mark is up you cannot heal from anything. The payout is x2.5. The form was very clear.
- `be_dd_triage_tag` (Lv 3 branch tag: **Triage**, 17 chars): Red, amber, green
- `be_dd_triage_costs` (Lv 3 branch cost line (after "Costs: "): **Triage**, 36 chars): shorter countdowns, smaller payouts.
- `be_dd_triage_desc` (Lv 3 branch card text: **Triage**, 125 chars): Marks go on the 3 most wounded enemies, not the strongest. Countdowns are half as long and payouts 40% as large. Worst first.
- `be_dd_codeblue_desc` (card text: **Code Blue**, 122 chars): If you are low when a mark pays out, the strongest unmarked enemy in reach is marked at once. Announced to the whole ward.
- `be_dd_heartmonitor_desc` (card text: **Heart Monitor**, 93 chars): Countdowns run 40% faster while you are low. The beeping gets faster too, which helps nobody.
- `be_dd_beep_desc` (card text: **Beep**, 118 chars): Each second of a countdown, the marked enemy gives off a Blood pulse (radius 50). Every ward has one that never stops.
- `be_dd_timeofdeath_desc` (card text: **Time of Death**, 118 chars): A marked enemy under 25% health at its payout dies outright; bosses take triple instead. Logged to the nearest minute.
- `be_dd_livingwill_desc` (card text: **Living Will**, 102 chars): Healing blocked while a mark was up is added to the payout, tripled. Wishes were expressed in writing.
- `be_dd_lastrites_desc` (card text: **Last Rites**, 84 chars): A payout also makes everything within 120 Bleed. Administered to whoever is nearest.
- `be_dd_paperwork_desc` (card text: **Paperwork**, 68 chars): A mark sometimes (25%) pays out twice. Duplicate forms are standard.
- `be_dd_organharvest_desc` (card text: **Organ Harvest**, 88 chars): A payout that kills splits its damage across the 3 nearest enemies. Donation is opt-out.
- `be_dd_waitingroom_desc` (card text: **Waiting Room**, 68 chars): Marked enemies are slowed 30%. The four-hour target is aspirational.
- `be_dd_walkinclinic_desc` (card text: **Walk-in Clinic**, 58 chars): A kill by a payout heals you 2%. No appointment necessary.
- `be_dd_wrongpatient_desc` (card text: **Wrong Patient**, 96 chars): A mark sometimes (15%) lands on you and heals you 5% when it pays out. Officially a never event.
- `be_dd_masscasualty_desc` (card text: **Mass Casualty**, 58 chars): Up to 5 marks at once. A major incident has been declared.
- `be_dd_dnr_float` (float over an enemy or you: a heal is blocked by DNR, 3 chars): DNR
- `be_dd_codeblue_float` (float over an enemy or you: Code Blue marks a new enemy, 9 chars): CODE BLUE
- `be_dd_timeofdeath_float` (float over an enemy or you: Time of Death kills a marked enemy, 12 chars): DEATH CALLED
- `be_dd_lastrites_float` (float over an enemy or you: Last Rites sets everything nearby Bleeding, 10 chars): LAST RITES
- `be_dd_paperwork_float` (float over an enemy or you: Paperwork pays a second time, 9 chars): PAPERWORK
- `be_dd_organharvest_float` (float over an enemy or you: Organ Harvest splits a payout, 9 chars): HARVESTED
- `be_dd_walkinclinic_float` (float over an enemy or you: Walk-in Clinic heals you, 7 chars): WALK-IN
- `be_dd_wrong_float` (float over an enemy or you: a mark lands on you, 9 chars): WRONG BED
- `be_dd_wrongpay_float` (float over an enemy or you: the mark on you pays out and heals, 10 chars): DISCHARGED

## Sister Cousin
- `be_sc_kin_tag` (Lv 3 branch tag: **Next of Kin**, 15 chars): Contact on file
- `be_sc_kin_costs` (Lv 3 branch cost line (after "Costs: "): **Next of Kin**, 31 chars): the seeker dies (4 s cooldown).
- `be_sc_kin_desc` (Lv 3 branch card text: **Next of Kin**, 111 chars): When you would be hit, the nearest seeker within 150 takes it instead and dies. Next of kin were not consulted.
- `be_sc_donor_tag` (Lv 3 branch tag: **Organ Donor**, 12 chars): Tick the box
- `be_sc_donor_costs` (Lv 3 branch cost line (after "Costs: "): **Organ Donor**, 33 chars): healing is capped at 5% a second.
- `be_sc_donor_desc` (Lv 3 branch card text: **Organ Donor**, 81 chars): A seeker that expires or dies heals you 1.5%. Posthumous, and entirely voluntary.
- `be_sc_transfusion_tag` (Lv 3 branch tag: **Transfusion**, 15 chars): Type and screen
- `be_sc_transfusion_costs` (Lv 3 branch cost line (after "Costs: "): **Transfusion**, 31 chars): the bonus needs you to be hurt.
- `be_sc_transfusion_desc` (Lv 3 branch card text: **Transfusion**, 108 chars): Seekers deal more as you lose health: nothing at full health, up to +100% at 10%. Same blood, same problems.
- `be_sc_emergencycontact_desc` (card text: **Emergency Contact**, 87 chars): Every seeker turns on whatever just hurt you. Contact details were supplied in advance.
- `be_sc_powerofattorney_desc` (card text: **Power of Attorney**, 78 chars): While you are low, seekers deal +50%. Decisions are being made on your behalf.
- `be_sc_familyfeud_desc` (card text: **Family Feud**, 81 chars): Two seekers that touch sometimes (10%) bump and scatter. Christmas, in miniature.
- `be_sc_bloodline_desc` (card text: **Bloodline**, 74 chars): The seeker that takes a hit for you leaves two behind. The line continues.
- `be_sc_spareparts_desc` (card text: **Spare Parts**, 102 chars): A dying seeker leaves a Blood pool (radius 40, 3 s) that makes enemies Bleed. Whatever was not needed.
- `be_sc_compatiblematch_desc` (card text: **Compatible Match**, 89 chars): Donations heal double while you are low. Matched on blood group, tissue type and urgency.
- `be_sc_blackmarket_desc` (card text: **Black Market**, 94 chars): A donation sometimes (20%) pays 4 stamina instead. Prohibited under the Human Tissue Act 2004.
- `be_sc_livingdonor_desc` (card text: **Living Donor**, 89 chars): Each seeker kill also heals 0.5% (at most 3% a second). One kidney is enough, apparently.
- `be_sc_bloodtypeo_desc` (card text: **Blood Type O**, 64 chars): Seekers make what they hit Bleed. Type O is the universal donor.
- `be_sc_sharedcirculation_desc` (card text: **Shared Circulation**, 117 chars): While you are low, seeker hits also heal you, the way Not Dead Yet's lifesteal does. One circulation, many occupants.
- `be_sc_rhesusnegative_desc` (card text: **Rhesus Negative**, 106 chars): 15% of seekers carry Mucus and leave the target Snotty. About 15% of people in the UK are Rhesus negative.
- `be_sc_bloodbrothers_desc` (card text: **Blood Brothers**, 78 chars): A seeker that kills splits into three, not two. The oath involved a small cut.
- `be_sc_kin_float` (float over an enemy or you: a seeker takes a hit for you, 11 chars): NEXT OF KIN
- `be_sc_emergency_float` (float over an enemy or you: seekers turn on what hurt you, 9 chars): EMERGENCY
- `be_sc_bloodline_float` (float over an enemy or you: the seeker leaves two behind, 9 chars): BLOODLINE
- `be_sc_familyfeud_float` (float over an enemy or you: two seekers bump and scatter, 4 chars): FEUD
- `be_sc_donor_float` (float over an enemy or you: a seeker's end heals you, 7 chars): DONATED
- `be_sc_compatiblematch_float` (float over an enemy or you: a doubled donation (low), 10 chars): COMPATIBLE
- `be_sc_blackmarket_float` (float over an enemy or you: a donation pays stamina, 12 chars): BLACK MARKET
- `be_sc_livingdonor_float` (float over an enemy or you: a seeker kill heals you, 12 chars): LIVING DONOR
- `be_sc_circulation_float` (float over an enemy or you: a seeker hit heals you (low), 11 chars): CIRCULATING
- `be_sc_rhesus_float` (float over an enemy or you: a Mucus seeker lands, 11 chars): RH NEGATIVE
- `be_sc_bloodbrothers_float` (float over an enemy or you: a killing seeker splits into three, 8 chars): BROTHERS

## Gated Feats
- `feat_be_defib_line` (Defibrillator (Feat, only with Adrenaline Shot), hidden caption (the card shows `does` only), 39 chars): Indicated for ventricular fibrillation.
- `feat_be_defib_does` (Defibrillator (Feat, only with Adrenaline Shot), card text, 122 chars): A Static ring (radius 140) stuns what it touches for 1 s and heals you 5% per enemy, up to 25%. 20 stamina, 18 s cooldown.
- `feat_be_defib_float` (Defibrillator (Feat, only with Adrenaline Shot), float when performed, 5 chars): CLEAR
- `feat_be_defib_paddles_name` (Defibrillator (Feat, only with Adrenaline Shot) Lv 3 fork name, 13 chars): Adult Paddles
- `feat_be_defib_paddles_desc` (Defibrillator (Feat, only with Adrenaline Shot) Lv 3 fork text, 60 chars): Ring 40% wider. Paediatric paddles were considered, briefly.
- `feat_be_defib_clear_name` (Defibrillator (Feat, only with Adrenaline Shot) Lv 3 fork name, 11 chars): Stand Clear
- `feat_be_defib_clear_desc` (Defibrillator (Feat, only with Adrenaline Shot) Lv 3 fork text, 66 chars): A second ring follows 0.6 s later. Stand clear. Stand clear again.
- `feat_be_defib_rhythm_name` (Defibrillator (Feat, only with Adrenaline Shot) Lv 5 fork name, 16 chars): Shockable Rhythm
- `feat_be_defib_rhythm_desc` (Defibrillator (Feat, only with Adrenaline Shot) Lv 5 fork text, 79 chars): Cooldown about a third shorter. Ventricular fibrillation is a shockable rhythm.
- `feat_be_defib_sinus_name` (Defibrillator (Feat, only with Adrenaline Shot) Lv 5 fork name, 12 chars): Sinus Rhythm
- `feat_be_defib_sinus_desc` (Defibrillator (Feat, only with Adrenaline Shot) Lv 5 fork text, 79 chars): Heal cap 40% instead of 25%. Normal sinus rhythm: the best outcome on the form.
- `feat_be_bloodbag_line` (Blood Bag (Feat, only with Organ Donor), hidden caption (the card shows `does` only), 26 chars): One unit, type O negative.
- `feat_be_bloodbag_does` (Blood Bag (Feat, only with Organ Donor), card text, 128 chars): Heals 15% of max health over 3 s. Performed below 40% health, you also swim 30% faster for those 3 s. 16 stamina, 20 s cooldown.
- `feat_be_bloodbag_float` (Blood Bag (Feat, only with Organ Donor), float when performed, 11 chars): TRANSFUSING
- `feat_be_bloodbag_unit_name` (Blood Bag (Feat, only with Organ Donor) Lv 3 fork name, 11 chars): Second Unit
- `feat_be_bloodbag_unit_desc` (Blood Bag (Feat, only with Organ Donor) Lv 3 fork text, 56 chars): Heals 22.5% instead of 15%. A second unit was requested.
- `feat_be_bloodbag_warm_name` (Blood Bag (Feat, only with Organ Donor) Lv 3 fork name, 12 chars): Warmed Blood
- `feat_be_bloodbag_warm_desc` (Blood Bag (Feat, only with Organ Donor) Lv 3 fork text, 87 chars): The swim speed boost applies at any health, not only when low. Cold units are a hazard.
- `feat_be_bloodbag_fridge_name` (Blood Bag (Feat, only with Organ Donor) Lv 5 fork name, 10 chars): Cold Chain
- `feat_be_bloodbag_fridge_desc` (Blood Bag (Feat, only with Organ Donor) Lv 5 fork text, 61 chars): Cooldown 30% shorter. Stored between 1 and 6 degrees Celsius.
- `feat_be_bloodbag_drip_name` (Blood Bag (Feat, only with Organ Donor) Lv 5 fork name, 9 chars): Slow Drip
- `feat_be_bloodbag_drip_desc` (Blood Bag (Feat, only with Organ Donor) Lv 5 fork text, 72 chars): Lasts 50% longer and heals 25% more in total. Gravity is doing the work.

## Gated passives
- `pass_be_morphine_desc` (Morphine Drip (only with IV Drip), card text, 57 chars): While you are below 40% health, you take 20% less damage.
- `pass_be_morphine_flavour` (Morphine Drip (only with IV Drip), card flavour line, 38 chars): Pain score: 9 out of 10, revised to 4.
- `pass_be_lastwords_desc` (Famous Last Words (only with Flatline), card text, 137 chars): Once a wave, the first time you drop below 10% health, a Blood burst (radius 200) hits for 20 x your level. Everything it touches Bleeds.
- `pass_be_lastwords_flavour` (Famous Last Words (only with Flatline), card flavour line, 45 chars): Last words on record: "It is just a scratch."
- `pass_be_lastwords_float` (Famous Last Words (only with Flatline), float when it fires, 10 chars): LAST WORDS
