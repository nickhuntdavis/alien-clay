package com.alienclay.worms

enum class Weapon(val label: String, val startAmmo: Int, val usesPower: Boolean) {
    BOULDER("Boulder", -1, true),
    GLOW_EGG("Glowing Egg", -1, true),
    EGG_CLUTCH("Egg Clutch", 3, true),
    FLASH("Camera Flash", -1, false),
    FLARE("Road Flare", 2, false),
}

enum class Kind { ROCK, EGG, CLUTCH, EGGLET, FLARE }

/** The six cryptids. [team] is the side each one fights for; [caption] labels its knockout photo. */
enum class Species(val label: String, val team: Int, val caption: String) {
    BIGFOOT("Bigfoot", 0, "Bigfoot, probably"),
    MOTHMAN("Mothman", 0, "Mothman? Or a big owl"),
    CHUPACABRA("Chupacabra", 0, "Chupacabra (or a mangy dog)"),
    NESSIE("Nessie", 1, "Nessie, or a floating log"),
    YETI("Yeti", 1, "Yeti, or a snowdrift"),
    JERSEY_DEVIL("Jersey Devil", 1, "The Jersey Devil, allegedly"),
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
}

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

/** Something large surfacing in the loch where a cryptid fell in. */
class Sighting(val x: Float, val facing: Int) {
    var age = 0f
}
