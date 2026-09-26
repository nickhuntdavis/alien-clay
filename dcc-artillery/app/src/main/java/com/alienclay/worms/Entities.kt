package com.alienclay.worms

enum class Weapon(val label: String, val startAmmo: Int, val usesPower: Boolean) {
    HOB_LOBBER("Hob-Lobber", -1, true),
    MISSILE("Magic Missile", -1, false),
    KICK("Kick", -1, false),
    POTION_BOMB("Potion Bomb", -1, true),
    SCATTER("Scatter Charge", 3, true),
    SATCHEL("Satchel Charge", 2, false),
}

enum class Kind { LOBBER, POTION, SCATTER, SHARD, SATCHEL }

/** The six fighters. [team] is the side each one is on. */
enum class Species(val label: String, val team: Int) {
    CARL("Carl", 0),
    DONUT("Princess Donut", 0),
    MONGO("Mongo", 0),
    GOBLIN("Goblin", 1),
    HOBGOBLIN("Hobgoblin", 1),
    OGRE("Ogre", 1),
    ;

    companion object {
        fun ofTeam(team: Int) = entries.filter { it.team == team }
    }
}

/** One fighter. Still called a worm internally: it is the genre's word for a player-controlled unit. */
class Worm(var x: Float, var y: Float, val team: Int, val species: Species) {
    val name: String get() = species.label
    var vx = 0f
    var vy = 0f
    var hp = 100
    var alive = true
    var drowned = false
    var onGround = false
    var facing = 1
}

class Projectile(
    val kind: Kind,
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var fuse: Float,
    val owner: Worm?,
) {
    var age = 0f
    var resting = false
    var dead = false
    var bounced = false
}

/** A loot box: 0 bronze, 1 silver, 2 gold. Falls until it lands; opened by whoever touches it. */
class LootBox(var x: Float, var y: Float, val tier: Int) {
    var vy = 0f
    var landed = false
    var dead = false
}

/** A pop-up from the System AI: an achievement or a loot box opening. */
class Announcement(val header: String, val title: String, val body: String)

/** Sound cues raised by the game logic and played by the view. */
enum class Sfx { THROW, ZAP, KICK, WHIFF, BOOM_BIG, BOOM_SMALL, BOUNCE, JUMP, FALL, ACHIEVEMENT, LOOT, TURN, WIN }

object PKind {
    const val FIRE = 0
    const val SMOKE = 1
    const val DIRT = 2
    const val SPARK = 3
    const val RING = 4
    const val SPLASH = 5
}

class Particle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var life: Float,
    val size: Float,
    val color: Int,
    val kind: Int,
    val gravity: Float,
) {
    val maxLife = life
}

/** Floating text such as damage numbers. [team] picks the colour, -1 for neutral. */
class FloatText(var x: Float, var y: Float, val text: String, val team: Int, var life: Float)
