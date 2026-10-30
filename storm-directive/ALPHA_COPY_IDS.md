# Alpha copy: every placeholder id and its brief

Write each id into `web/js/alphacopy.js` as `ALPHA_COPY[id]`. Limits are characters. Alpha's voice: hustle culture and self-help gurus (ALPHA_REDESIGN.md); Alpha "thinks he's the main character in everyone's life"; the weapons sound like self-improvement advice and are gloriously insecure. Names (branch, card, Feat, passive) are already the user's; you write tags, costs, descriptions, gift lines, fork names and descriptions, flavours and floats.

## Red Flagship (Static beam)
- `al_rf_grind_tag` (tag, max 25), `al_rf_grind_costs` (costs, max 45; completes "Costs: ..."), `al_rf_grind_desc` (card text, max 150): **Grindset** (Lv 3 branch). Beam damage climbs while you keep swimming, up to +60% after about 3 s; resets after 1 s standing still. Costs: standing still throws the climb away.
- `al_rf_coach_tag` (tag, max 25), `al_rf_coach_costs` (costs, max 45; completes "Costs: ..."), `al_rf_coach_desc` (card text, max 150): **Life Coach** (Lv 3 branch). While the beam holds a target, your other weapons hit it 20% harder and fire 15% faster.
- `al_rf_crypto_tag` (tag, max 25), `al_rf_crypto_costs` (costs, max 45; completes "Costs: ..."), `al_rf_crypto_desc` (card text, max 150): **Crypto Bro** (Lv 3 branch). The beam pumps 50% of its damage into the target (fades after 2 s unfed); when it dies, the pump bursts on up to 10 neighbours within 110.
- `al_rf_4amclub_desc` (card text, max 150): **4am Club**. The first 10 s of each wave, the beam hits double.
- `al_rf_coldplunge_desc` (card text, max 150): **Cold Plunge**. The beam slows its target 40%.
- `al_rf_riseandgrind_desc` (card text, max 150): **Rise and Grind**. The beam leaves Static afterimages that keep zapping for 2 s.
- `al_rf_accountabilitypartner_desc` (card text, max 150): **Accountability Partner**. The held target takes a heavy Force hit every 3 s.
- `al_rf_visionboard_desc` (card text, max 150): **Vision Board**. Beam reach +40%.
- `al_rf_toxicpositivity_desc` (card text, max 150): **Toxic Positivity**. The beam heals you 1% of max health a second while it holds.
- `al_rf_hodl_desc` (card text, max 150): **HODL**. The pump never fades, and the burst grows 15% per second held, up to triple.
- `al_rf_rugpull_desc` (card text, max 150): **Rug Pull**. Switching targets dumps the pump at once.
- `al_rf_nft_desc` (card text, max 150): **NFT**. A pumped kill drops a token that drifts to you and pays 5 stamina.
- `al_rf_sigma_desc` (card text, max 150): **Sigma (Lv 9 mastery, best with Grindset)**. At full climb the beam forks onto a second target.
- `al_rf_breakthrough_desc` (card text, max 150): **Breakthrough (Lv 9 mastery, best with Life Coach)**. A held target that dies passes the bonus to the next one, stacking twice.
- `al_rf_tothemoon_desc` (card text, max 150): **To the Moon (Lv 9 mastery, best with Crypto Bro)**. The burst chains to the next pumped enemy.
- `al_rf_partner_float` (float: uppercase flash over an enemy or you, max 12): the Accountability Partner heavy hit lands
- `al_rf_burst_float` (float: uppercase flash over an enemy or you, max 12): a pump bursts
- `al_rf_rug_float` (float: uppercase flash over an enemy or you, max 12): Rug Pull dumps the pump
- `al_rf_nft_float` (float: uppercase flash over an enemy or you, max 12): an NFT token is collected

## Soulmate Signal (a beam tethered to your twin)
- `al_ss_wing_tag` (tag, max 25), `al_ss_wing_costs` (costs, max 45; completes "Costs: ..."), `al_ss_wing_desc` (card text, max 150): **Wingman** (Lv 3 branch). The twin draws enemy fire within 120 and takes no damage (shots near it bend into it and vanish).
- `al_ss_situ_tag` (tag, max 25), `al_ss_situ_costs` (costs, max 45; completes "Costs: ..."), `al_ss_situ_desc` (card text, max 150): **Situationship** (Lv 3 branch). The tether flickers 1 s on, 1 s off, and hits 2.2 times as hard. Costs: half the time it is off.
- `al_ss_couple_tag` (tag, max 25), `al_ss_couple_costs` (costs, max 45; completes "Costs: ..."), `al_ss_couple_desc` (card text, max 150): **Power Couple** (Lv 3 branch). Both ends hit harder the closer you swim to the twin, up to +60% within 120.
- `al_ss_hypeman_desc` (card text, max 150): **Hype Man**. Enemies that attack the twin are Charged.
- `al_ss_brocode_desc` (card text, max 150): **Bro Code**. When you are hit, you swap places with the twin (6 s cooldown).
- `al_ss_pullup_desc` (card text, max 150): **Pull Up**. The twin dashes to the nearest Elite (once every 10 s).
- `al_ss_ghosting_desc` (card text, max 150): **Ghosting**. While the tether is off, the twin vanishes and reappears behind the crowd.
- `al_ss_breadcrumbing_desc` (card text, max 150): **Breadcrumbing**. Each flick-on leaves Static crumbs that zap.
- `al_ss_redflag_desc` (card text, max 150): **Red Flag**. Sometimes a flick-on turns on you and costs 2% of your max health (never below 1). A joke cost; say so.
- `al_ss_matchingoutfits_desc` (card text, max 150): **Matching Outfits**. Your hits and the twin's apply each other's status.
- `al_ss_couplestherapy_desc` (card text, max 150): **Couples Therapy**. Touching the twin heals 2%.
- `al_ss_pda_desc` (card text, max 150): **PDA**. Swimming through the twin sends out a Force pulse.
- `al_ss_rideordie_desc` (card text, max 150): **Ride or Die (Lv 9 mastery, best with Wingman)**. The twin also fires your Unwanted Contact.
- `al_ss_itscomplicated_desc` (card text, max 150): **It's Complicated (Lv 9 mastery, best with Situationship)**. The flicker speeds up as enemies die.
- `al_ss_soulmates_desc` (card text, max 150): **Soulmates (Lv 9 mastery, best with Power Couple)**. A second twin and a triangle tether.
- `al_ss_redflag_float` (float: uppercase flash over an enemy or you, max 12): the tether turns on you
- `al_ss_pullup_float` (float: uppercase flash over an enemy or you, max 12): the twin dashes to an Elite
- `al_ss_bro_float` (float: uppercase flash over an enemy or you, max 12): Bro Code swaps you
- `al_ss_pda_float` (float: uppercase flash over an enemy or you, max 12): the PDA pulse
- `al_ss_ride_float` (float: uppercase flash over an enemy or you, max 12): the twin fires Unwanted Contact

## Unwanted Contact (Static chains)
- `al_uc_network_tag` (tag, max 25), `al_uc_network_costs` (costs, max 45; completes "Costs: ..."), `al_uc_network_desc` (card text, max 150): **Networking Event** (Lv 3 branch). 2 more chain jumps, each 25% weaker. Costs: the extra jumps are weak.
- `al_uc_cold_tag` (tag, max 25), `al_uc_cold_costs` (costs, max 45; completes "Costs: ..."), `al_uc_cold_desc` (card text, max 150): **Cold Caller** (Lv 3 branch). Chains go for the furthest untouched enemies first; chain range +40%.
- `al_uc_influencer_tag` (tag, max 25), `al_uc_influencer_costs` (costs, max 45; completes "Costs: ..."), `al_uc_influencer_desc` (card text, max 150): **Influencer** (Lv 3 branch). Each enemy chained adds a follower: +2% Unwanted Contact damage each, up to 25; getting hit loses 5.
- `al_uc_businesscard_desc` (card text, max 150): **Business Card**. Chained enemies take 15% more from your other weapons.
- `al_uc_elevatorpitch_desc` (card text, max 150): **Elevator Pitch**. The first jump hits double.
- `al_uc_lanyard_desc` (card text, max 150): **Lanyard**. Chains favour Elites.
- `al_uc_rolodex_desc` (card text, max 150): **Rolodex (Lv 9 mastery, best with Networking Event)**. Chains never fall off in damage.
- `al_uc_followup_desc` (card text, max 150): **Follow-Up**. A second chain hit on one enemy stuns it for 0.5 s.
- `al_uc_robocall_desc` (card text, max 150): **Robo-Call**. Every 3rd shot hits a random enemy anywhere on screen.
- `al_uc_donotcall_desc` (card text, max 150): **Do Not Call**. Charged enemies leave you alone briefly (1.5 s, not bosses).
- `al_uc_hardsell_desc` (card text, max 150): **Hard Sell (Lv 9 mastery, best with Cold Caller)**. Each jump hits harder than the last.
- `al_uc_goingviral_desc` (card text, max 150): **Going Viral**. At 25 followers, chains jump twice as far.
- `al_uc_branddeal_desc` (card text, max 150): **Brand Deal**. Followers add 1% lifesteal each (up to 3% max health per chain).
- `al_uc_cancelled_desc` (card text, max 150): **Cancelled**. Getting hit at 25 followers sets off a Static blast.
- `al_uc_bluetick_desc` (card text, max 150): **Blue Tick (Lv 9 mastery, best with Influencer)**. Followers are never lost.
- `al_uc_followers_float` (float: uppercase flash over an enemy or you, max 12): 25 followers reached
- `al_uc_followup_float` (float: uppercase flash over an enemy or you, max 12): a Follow-Up stun
- `al_uc_robocall_float` (float: uppercase flash over an enemy or you, max 12): a Robo-Call lands
- `al_uc_donotcall_float` (float: uppercase flash over an enemy or you, max 12): enemies back off
- `al_uc_branddeal_float` (float: uppercase flash over an enemy or you, max 12): Brand Deal heals you
- `al_uc_cancelled_float` (float: uppercase flash over an enemy or you, max 12): the Cancelled blast

## Obligatory Podcast (Force sound waves; Alpha only)
- `al_op_hottake_tag` (tag, max 25), `al_op_hottake_costs` (costs, max 45; completes "Costs: ..."), `al_op_hottake_desc` (card text, max 150): **Hot Take** (Lv 3 branch). Waves half as wide but hit 2.5 times as hard, and stagger (an enemy staggers on its second wave). Costs: a narrow cone.
- `al_op_threehour_tag` (tag, max 25), `al_op_threehour_costs` (costs, max 45; completes "Costs: ..."), `al_op_threehour_desc` (card text, max 150): **Three-Hour Episode** (Lv 3 branch). 5 waves a shot, each 35% weaker, reaching 30% further.
- `al_op_callin_tag` (tag, max 25), `al_op_callin_costs` (costs, max 45; completes "Costs: ..."), `al_op_callin_desc` (card text, max 150): **Call-In Show** (Lv 3 branch). Every 3rd shot, the waves come back towards you, hitting again.
- `al_op_cancelled_desc` (card text, max 150): **Cancelled**. A staggered enemy is Feared for 2 s.
- `al_op_ratio_desc` (card text, max 150): **Ratio**. An enemy hit by 2 waves of one shot takes +30%.
- `al_op_clipfarmer_desc` (card text, max 150): **Clip Farmer**. A stagger spawns a smaller echo wave.
- `al_op_discourse_desc` (card text, max 150): **Discourse (Lv 9 mastery, best with Hot Take)**. Every wave staggers.
- `al_op_adread_desc` (card text, max 150): **Ad Read**. Every 5th wave pulls enemies in.
- `al_op_patreontier_desc` (card text, max 150): **Patreon Tier**. An enemy hit 3 times is Charged.
- `al_op_filler_desc` (card text, max 150): **Filler**. Waves linger in place for a second.
- `al_op_neverends_desc` (card text, max 150): **Never Ends (Lv 9 mastery, best with Three-Hour Episode)**. No reload.
- `al_op_longtimelistener_desc` (card text, max 150): **Long-Time Listener**. Returning waves heal 1% each.
- `al_op_deadair_desc` (card text, max 150): **Dead Air**. After 2 s with nobody in range, the next shot is double.
- `al_op_calleronhold_desc` (card text, max 150): **Caller on Hold**. A returning wave stores and fires with the next shot.
- `al_op_livestudioaudience_desc` (card text, max 150): **Live Studio Audience (Lv 9 mastery, best with Call-In Show)**. Every shot returns.
- `al_op_cancelled_float` (float: uppercase flash over an enemy or you, max 12): a staggered enemy is Feared
- `al_op_clipfarmer_float` (float: uppercase flash over an enemy or you, max 12): an echo wave spawns
- `al_op_patreontier_float` (float: uppercase flash over an enemy or you, max 12): an enemy is Charged by Patreon Tier
- `al_op_deadair_float` (float: uppercase flash over an enemy or you, max 12): the doubled shot after Dead Air
- `al_op_longtimelistener_float` (float: uppercase flash over an enemy or you, max 12): a returning wave heals you
- `al_op_calleronhold_float` (float: uppercase flash over an enemy or you, max 12): a stored wave fires

## Gated Feats and passives (dealt only on their branch, only for Alpha)
- `feat_al_morning_line` (gift line in double quotes, the consciousness talking, max 45), `feat_al_morning_does` (Feat text, max 130), `feat_al_morning_float` (float, max 12): **Morning Routine** (Feat, only with Life Coach): tap, 16 stamina, 14 s cooldown. For 6 s every weapon fires 25% faster and you cannot be slowed; a small Force burst (radius 120) as it starts.
- Morning Routine forks (name max 18, desc max 90): `feat_al_morning_journal_name/_desc` (Lv 3: lasts 1.5 times as long), `feat_al_morning_cold_name/_desc` (Lv 3: +40% fire rate instead of +25%), `feat_al_morning_smoothie_name/_desc` (Lv 5: refunds 8 stamina when it ends), `feat_al_morning_alarm_name/_desc` (Lv 5: cooldown about a third shorter).
- `feat_al_golive_line`, `feat_al_golive_does`, `feat_al_golive_float` (as above): **Going Live** (Feat, only with Influencer): tap, 18 stamina, 16 s cooldown. For 5 s a ring of Static (radius 110) round you Charges anything it touches, and each enemy it Charges adds an Influencer follower.
- Going Live forks: `feat_al_golive_sponsor_name/_desc` (Lv 3: 2 followers per Charge), `feat_al_golive_collab_name/_desc` (Lv 3: ring 45% wider), `feat_al_golive_stream_name/_desc` (Lv 5: lasts 60% longer), `feat_al_golive_hype_name/_desc` (Lv 5: cooldown about a third shorter).
- `pass_al_diamond_desc` (card text, max 150), `pass_al_diamond_flavour` (one-line quip, max 60), `pass_al_diamond_float` (float, max 12): **Diamond Hands** (sperm passive, only with Crypto Bro): pump bursts also refund 5 stamina.
- `pass_al_mce_desc`, `pass_al_mce_flavour`: **Main Character Energy** (sperm passive, only with Hot Take): staggered enemies take 20% more from everything.
