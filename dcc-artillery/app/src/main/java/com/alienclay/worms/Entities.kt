package com.alienclay.worms

/** How a weapon is used. */
enum class Action {
    ARC, // thrown, explodes on contact
    FUSE, // thrown, bounces, explodes when the fuse runs out
    BOLT, // straight-line magic, no gravity
    DROP, // placed at your feet with a fuse
    MELEE, // hits whoever is right in front of you
    POUNCE, // you are the projectile
    ROAR, // pushes everyone nearby away
    SLAM, // shockwave around you
}

/**
 * Every attack in the game. Which ones a fighter can use comes from its [Species] loadout.
 * [damage] and [radius] describe the hit; [launch] scales throw speed or melee knockback.
 */
enum class Weapon(
    val label: String,
    val action: Action,
    val kind: Kind?,
    val damage: Float,
    val radius: Float,
    val launch: Float = 1f,
) {
    HOB_LOBBER("Hob-Lobber", Action.ARC, Kind.LOBBER, 50f, 44f),
    KICK("Kick", Action.MELEE, null, 30f, 22f, 520f),
    SATCHEL("Satchel Charge", Action.DROP, Kind.SATCHEL, 70f, 70f),
    MISSILE("Magic Missile", Action.BOLT, Kind.BOLT, 22f, 14f),
    POTION_BOMB("Potion Bomb", Action.FUSE, Kind.POTION, 45f, 44f),
    BITE("Bite", Action.MELEE, null, 32f, 22f, 220f),
    POUNCE("Pounce", Action.POUNCE, null, 30f, 24f, 0.65f),
    ROAR("Roar", Action.ROAR, null, 6f, 75f, 420f),
    KNIFE("Throwing Knife", Action.ARC, Kind.KNIFE, 22f, 8f, 1.1f),
    SCATTER("Scatter Charge", Action.FUSE, Kind.SCATTER, 25f, 28f),
    SPEAR("Spear", Action.ARC, Kind.SPEAR, 38f, 14f),
    SHIELD_BASH("Shield Bash", Action.MELEE, null, 15f, 22f, 620f),
    BOULDER("Boulder", Action.ARC, Kind.BOULDER, 55f, 52f, 0.8f),
    CLUB("Club", Action.MELEE, null, 30f, 24f, 450f),
    SLAM("Ground Slam", Action.SLAM, null, 28f, 48f, 380f),
    ;

    /** Whether dragging further means a harder throw (otherwise only the direction matters). */
    val usesPower: Boolean get() = action == Action.ARC || action == Action.FUSE || action == Action.POUNCE
}

enum class Kind { LOBBER, POTION, SCATTER, SHARD, SATCHEL, KNIFE, SPEAR, BOULDER, BOLT }

/** The six fighters: stats, a passive trait, and the attacks each one can use (ammo -1 = unlimited). */
enum class Species(
    val label: String,
    val team: Int,
    val maxHp: Int,
    val walk: Float,
    val jump: Float,
    val trait: String,
    val loadout: List<Pair<Weapon, Int>>,
    val fallProof: Boolean = false,
    val blastBonus: Float = 1f,
) {
    CARL("Carl", 0, 110, 1f, 1f, "Explosives expert: +25% blast damage",
        listOf(Weapon.KICK to -1, Weapon.HOB_LOBBER to -1, Weapon.SATCHEL to 2), blastBonus = 1.25f),
    DONUT("Princess Donut", 0, 80, 1.1f, 1.35f, "Always lands on her feet",
        listOf(Weapon.MISSILE to -1, Weapon.POTION_BOMB to -1), fallProof = true),
    MONGO("Mongo", 0, 120, 1.4f, 1.3f, "Fast, fierce and very good at pouncing",
        listOf(Weapon.BITE to -1, Weapon.POUNCE to -1, Weapon.ROAR to 2)),
    GOBLIN("Goblin", 1, 70, 1.3f, 1.1f, "Quick, sneaky and fragile",
        listOf(Weapon.KNIFE to -1, Weapon.POTION_BOMB to -1, Weapon.SCATTER to 2)),
    HOBGOBLIN("Hobgoblin", 1, 100, 1f, 1f, "Drilled soldier",
        listOf(Weapon.SPEAR to -1, Weapon.SHIELD_BASH to -1, Weapon.SATCHEL to 1)),
    OGRE("Ogre", 1, 150, 0.6f, 0.7f, "Huge, slow and hits like a landslide",
        listOf(Weapon.BOULDER to -1, Weapon.CLUB to -1, Weapon.SLAM to 2)),
    ;

    val weapons: List<Weapon> get() = loadout.map { it.first }

    companion object {
        fun ofTeam(team: Int) = entries.filter { it.team == team }
    }
}

/** One fighter. Still called a worm internally: it is the genre's word for a player-controlled unit. */
class Worm(var x: Float, var y: Float, val team: Int, val species: Species) {
    val name: String get() = species.label
    var vx = 0f
    var vy = 0f
    var hp = species.maxHp
    var alive = true
    var drowned = false
    var onGround = false
    var facing = 1

    /** Ammo per [Weapon] ordinal: -1 unlimited, 0 none (or not in this fighter's loadout). */
    val ammo = IntArray(Weapon.entries.size).also { a -> for ((w, n) in species.loadout) a[w.ordinal] = n }
    var weapon = species.loadout.first().first

    /** Mid-pounce: lands (or collides) with a bite. */
    var pouncing = false

    // Animation state, advanced by the game and read by the renderer.
    var walkPhase = 0f
    var walkTimer = 0f // > 0 while walking
    var squash = 0f // 0..1, set on landing and decays
    var hitFlash = 0f // > 0 just after taking damage
    var spin = 0f // degrees, while tumbling from a hit

    fun has(w: Weapon) = ammo[w.ordinal] != 0
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

    /** Damage multiplier (blast radius grows with its square root). Changed by gates and passives. */
    var power = 1f

    /** Explodes into healing instead of damage. */
    var healing = false

    /** Ids of gates already passed through, so each gate affects a projectile once. */
    val passed = HashSet<Int>()

    fun copyTraitsFrom(o: Projectile) {
        power = o.power
        healing = o.healing
        passed.addAll(o.passed)
    }
}

/** What a gate does to projectiles passing through it. [MYSTERY] rolls a random outcome, including ones no gate shows. */
enum class GateEffect(val label: String, val color: Int) {
    TRIPLE("×3", 0xFF6AE86A.toInt()),
    PLUS_TWO("+2", 0xFF6AE86A.toInt()),
    BIG("BIG", 0xFFFF9A3A.toInt()),
    TINY("tiny", 0xFF9AA0B0.toInt()),
    FAST("FAST", 0xFF5AD8FF.toInt()),
    SLOW("SLOW", 0xFF5A7AFF.toInt()),
    FLIP("FLIP", 0xFFE05AE0.toInt()),
    MYSTERY("?", 0xFFFFD34A.toInt()),
}

/** A floating portal in the air. Lasts [turnsLeft] more turn starts. */
class Gate(val id: Int, val x: Float, val y: Float, val effect: GateEffect, var turnsLeft: Int) {
    val halfHeight = 30f
    var flash = 0f
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
enum class Sfx { THROW, ZAP, KICK, WHIFF, BOOM_BIG, BOOM_SMALL, BOUNCE, JUMP, FALL, ACHIEVEMENT, LOOT, TURN, WIN, GATE, ROAR }

object PKind {
    const val FIRE = 0
    const val SMOKE = 1
    const val DIRT = 2
    const val SPARK = 3
    const val RING = 4
    const val SPLASH = 5
    const val CHUNK = 6 // rock debris that bounces off the ground
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
    var rot = 0f
}

/** Floating text such as damage numbers. [team] picks the colour, -1 for neutral. */
class FloatText(var x: Float, var y: Float, val text: String, val team: Int, var life: Float)
