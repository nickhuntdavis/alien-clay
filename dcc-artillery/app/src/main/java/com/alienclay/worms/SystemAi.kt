package com.alienclay.worms

import java.util.Random

/** The System AI's commentary: achievement and loot box pop-ups. Original lines, written for this fan game. */
object SystemAi {
    const val BLAST = 0
    const val PIT = 1
    const val KICK = 2
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
    private val kick = listOf(
        "Foot Soldier" to "You kicked something to death. Your feet have been reclassified as weapons.",
        "Bare Minimum" to "No weapon, no shoes, no problem.",
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

    val tierNames = arrayOf("Bronze Box", "Silver Box", "Gold Box")

    fun knockout(rng: Random, cause: Int, ownGoal: Boolean): Announcement {
        val pool = when {
            ownGoal -> this.ownGoal
            cause == PIT -> pit
            cause == KICK -> kick
            cause == FALL -> fall
            else -> blast
        }
        return achievement(pool[rng.nextInt(pool.size)])
    }

    fun multiKill(rng: Random): Announcement = achievement(multi[rng.nextInt(multi.size)])

    fun loot(tier: Int, contents: String): Announcement = Announcement("LOOT BOX OPENED", tierNames[tier], contents)

    private fun achievement(p: Pair<String, String>) = Announcement("NEW ACHIEVEMENT!", p.first, p.second)
}
