package com.alienclay.worms

import java.util.Random

/** The System AI's commentary: achievement and loot box pop-ups. Original lines, written for this fan game. */
object SystemAi {
    const val BLAST = 0
    const val PIT = 1
    const val MELEE = 2
    const val FALL = 3

    private val blast = listOf(
        "Crater Maker" to "You turned a living creature into a hole in the floor. Interior design is a valid career.",
        "Some Assembly Required" to "Your opponent is now in several places at once. The sponsors love a mess.",
        "Ratings Spike" to "That explosion added forty million viewers. Please do it again, but bigger.",
        "Overkill Is Underrated" to "Was that much explosive necessary? No. Did the audience scream? Yes.",
    )
    private val pit = listOf(
        "Gravity Always Wins" to "The pit has accepted your offering. It would like more.",
        "Mind the Gap" to "Walking is hard. Falling is easy. Somebody chose easy.",
        "Bottomless Enthusiasm" to "Nobody knows how deep that pit is. We have a new volunteer to find out.",
    )
    private val melee = listOf(
        "Foot Soldier" to "Up close and very personal. Your limbs have been reclassified as weapons.",
        "Bare Minimum" to "No ranged weapon, no problem.",
        "Hands-On Approach" to "Some crawlers use strategy. Others simply walk up and hit things. Both are valid.",
    )
    private val fall = listOf(
        "Stuck the Landing" to "Technically you landed. Technically you also died.",
    )
    private val ownGoal = listOf(
        "Friendly Fire Enthusiast" to "You killed a member of your own party. The audience is delighted. Your party is less so.",
        "Team Building Exercise" to "One fewer mouth to feed. Efficient, if a little cold.",
    )
    private val multi = listOf(
        "Two for One Special" to "More than one kill in a single turn. The sponsors are drafting a thank-you card.",
        "Bulk Discount" to "Why kill one thing when you could kill several? Economists everywhere nod.",
    )

    val tierNames = arrayOf(
        "Bronze Adventurer Box", "Silver Adventurer Box", "Gold Adventurer Box",
        "Legendary Adventurer Box", "Fan Box", "Benefactor Box",
    )

    private val fanNotes = listOf(
        "KICK IT INTO THE PIT",
        "My whole hab is rooting for the cat.",
        "Please explode more. Love, your biggest fan.",
        "I named my pet after you. It exploded too.",
        "Do the thing with the satchel again!",
    )
    private val benefactorNotes = listOf(
        "Your benefactor was entertained. Keep it up.",
        "A sponsor believes in you. Financially.",
        "Compliments of someone very rich and very bored.",
    )

    fun fanNote(rng: Random) = fanNotes[rng.nextInt(fanNotes.size)]
    fun benefactorNote(rng: Random) = benefactorNotes[rng.nextInt(benefactorNotes.size)]

    /** Announced once, the first turn a floor starts collapsing. */
    fun collapse(floor: Floor): Announcement = Announcement(
        "FLOOR ${floor.number} COLLAPSING",
        if (floor.pit == PitStyle.SEWAGE) "The water is rising" else "The floor is collapsing",
        "This floor is closing. Everything below the line is lost. Please continue fighting on the higher ground.",
    )

    fun knockout(rng: Random, cause: Int, ownGoal: Boolean): Announcement {
        val pool = when {
            ownGoal -> this.ownGoal
            cause == PIT -> pit
            cause == MELEE -> melee
            cause == FALL -> fall
            else -> blast
        }
        return achievement(pool[rng.nextInt(pool.size)])
    }

    fun multiKill(rng: Random): Announcement = achievement(multi[rng.nextInt(multi.size)])

    fun loot(tier: Int, contents: String): Announcement = Announcement("LOOT BOX OPENED", tierNames[tier], contents)

    private fun achievement(p: Pair<String, String>) = Announcement("NEW ACHIEVEMENT!", p.first, p.second)
}
