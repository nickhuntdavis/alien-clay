package com.alienclay.worms

enum class Weapon(val label: String, val startAmmo: Int, val usesPower: Boolean) {
    BAZOOKA("Bazooka", -1, true),
    GRENADE("Grenade", -1, true),
    CLUSTER("Cluster Bomb", 3, true),
    SHOTGUN("Shotgun", -1, false),
    DYNAMITE("Dynamite", 2, false),
}

enum class Kind { ROCKET, GRENADE, CLUSTER, BOMBLET, DYNAMITE }

class Worm(var x: Float, var y: Float, val team: Int, val name: String) {
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
