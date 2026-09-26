package com.alienclay.worms

import java.util.Random
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.min

/**
 * CPU opponent. At the start of its turn it tries every attack its fighter has:
 * throws are replayed through the real physics (with the current wind), melee and
 * area moves are scored from distances. Then it aims visibly and fires with a
 * little human-like error.
 */
class Ai(private val g: Game) {
    private val rnd = Random()
    private var angle = -0.7f
    private var power = 0.7f
    private var weapon = Weapon.HOB_LOBBER
    private var fired = false

    /** Best-scoring plan before noise is added; exposed for tests. */
    var plannedScore = 0f
        private set
    var plannedImpact: FloatArray? = null
        private set
    var plannedWeapon = Weapon.HOB_LOBBER
        private set

    private var bestScore = 0f
    private var bestAngle = 0f
    private var bestPower = 0f
    private var bestWeapon = Weapon.HOB_LOBBER
    private var bestImpact: FloatArray? = null

    fun plan(noise: Boolean = true) {
        fired = false
        val me = g.active
        val enemies = g.worms.filter { it.alive && !it.drowned && it.team != me.team }
        val friends = g.worms.filter { it.alive && !it.drowned && it.team == me.team }
        if (enemies.isEmpty()) return

        bestScore = -1e9f
        bestAngle = -0.7f
        bestPower = 0.7f
        bestWeapon = me.species.weapons.first { me.has(it) }
        bestImpact = null

        for (wpn in me.species.weapons) {
            if (!me.has(wpn)) continue
            when (wpn.action) {
                Action.ARC -> searchThrows(me, wpn, enemies, friends, 0f, 3f, 0.05f)
                Action.FUSE -> if (wpn != Weapon.SCATTER) searchThrows(me, wpn, enemies, friends, 3f, 5f, 0.08f)
                Action.BOLT -> for (e in enemies) {
                    val d = hypot(e.x - me.x, e.y - me.y)
                    if (d < 700f && lineClear(me, e)) {
                        val s = wpn.damage * 1.6f + (if (e.hp <= wpn.damage * 1.6f) 30f else 0f) - d * 0.01f
                        consider(s, atan2(e.y - me.y, e.x - me.x), 1f, wpn, floatArrayOf(e.x, e.y))
                    }
                }
                Action.MELEE -> for (e in enemies) {
                    if (hypot(e.x - me.x, e.y - me.y) < wpn.radius + 6f) {
                        val away = if (e.x >= me.x) 1f else -1f
                        val s = wpn.damage + (if (e.hp <= wpn.damage) 30f else 0f) + pitBonus(e, away) * wpn.launch / 400f
                        consider(s, if (away > 0) -0.35f else (-PI + 0.35).toFloat(), 1f, wpn, floatArrayOf(e.x, e.y))
                    }
                }
                Action.POUNCE -> searchPounce(me, wpn, enemies)
                Action.ROAR, Action.SLAM -> {
                    var s = 0f
                    for (e in enemies) {
                        val d = hypot(e.x - me.x, e.y - me.y)
                        if (d < wpn.radius) s += wpn.damage + pitBonus(e, if (e.x >= me.x) 1f else -1f)
                    }
                    for (f in friends) if (f !== me && hypot(f.x - me.x, f.y - me.y) < wpn.radius) s -= 25f
                    if (s > 0f) consider(s, -PI.toFloat() / 2, 1f, wpn, floatArrayOf(me.x, me.y))
                }
                Action.DROP -> {
                    val close = enemies.count { abs(it.x - me.x) < 40f && abs(it.y - me.y) < 30f }
                    val mates = friends.count { it !== me && hypot(it.x - me.x, it.y - me.y) < 90f }
                    if (close > 0 && mates == 0) {
                        consider(55f * close, if (enemies.first().x > me.x) -0.3f else (-PI + 0.3).toFloat(), 1f, wpn,
                            floatArrayOf(me.x, me.y))
                    }
                }
            }
        }

        plannedScore = bestScore
        plannedImpact = bestImpact
        plannedWeapon = bestWeapon
        angle = bestAngle
        power = bestPower
        weapon = bestWeapon
        if (noise && weapon.usesPower) {
            angle += (rnd.nextGaussian() * 0.025).toFloat()
            power = (power + (rnd.nextGaussian() * 0.025).toFloat()).coerceIn(0.2f, 1f)
        }
    }

    private fun consider(s: Float, a: Float, p: Float, w: Weapon, impact: FloatArray) {
        if (s > bestScore) {
            bestScore = s; bestAngle = a; bestPower = p; bestWeapon = w; bestImpact = impact
        }
    }

    private fun searchThrows(me: Worm, wpn: Weapon, enemies: List<Worm>, friends: List<Worm>, fuse: Float, degStep: Float, powStep: Float) {
        val kind = wpn.kind ?: return
        var deg = -200f
        while (deg <= 20f) {
            val a = (deg * PI / 180.0).toFloat()
            var pw = 0.3f
            while (pw <= 1.001f) {
                val hit = g.simulateImpact(kind, me, a, pw, fuse, wpn.launch)
                if (hit != null) {
                    consider(score(hit[0], hit[1], wpn.radius, wpn.damage * me.species.blastBonus, enemies, friends), a, pw, wpn, hit)
                }
                pw += powStep
            }
            deg += degStep
        }
    }

    /** Mongo's pounce flies like a thrown knife; score how close it lands to an enemy. */
    private fun searchPounce(me: Worm, wpn: Weapon, enemies: List<Worm>) {
        var deg = -170f
        while (deg <= -10f) {
            val a = (deg * PI / 180.0).toFloat()
            var pw = 0.3f
            while (pw <= 1.001f) {
                val hit = g.simulateImpact(Kind.KNIFE, me, a, pw, 0f, wpn.launch)
                if (hit != null && hit[1] < Game.WATER_Y - 10) {
                    val d = enemies.minOf { hypot(it.x - hit[0], it.y - hit[1]) }
                    if (d < wpn.radius) consider(wpn.damage + 5f - d * 0.2f, a, pw, wpn, hit)
                }
                pw += 0.07f
            }
            deg += 4f
        }
    }

    /** Extra value for knocking [e] towards a drop into the pit. */
    private fun pitBonus(e: Worm, away: Float): Float =
        if (g.terrain.surfaceAt((e.x + away * 60f).toInt()) >= Game.WATER_Y) 25f else 0f

    fun update(dt: Float) {
        if (fired) return
        val t = g.phaseTime
        if (t < 0.5f) return
        g.selectWeapon(weapon)
        g.aiming = true
        g.aimAngle += (angle - g.aimAngle) * min(1f, dt * 4f)
        g.aimPower = min(power, g.aimPower + dt * 0.8f)
        g.active.facing = if (cos(angle) >= 0f) 1 else -1
        val ready = abs(g.aimAngle - angle) < 0.02f && g.aimPower >= power - 0.001f
        if ((t > 2.2f && ready) || t > 5f) {
            g.aimAngle = angle
            g.aimPower = power
            fired = true
            g.fire()
        }
    }

    private fun score(x: Float, y: Float, radius: Float, dmg: Float, enemies: List<Worm>, friends: List<Worm>): Float {
        val reach = radius + 18f
        var s = 0f
        var nearest = Float.MAX_VALUE
        for (e in enemies) {
            val d = hypot(e.x - x, e.y - y)
            nearest = min(nearest, d)
            if (d < reach) {
                val hit = dmg * (1f - d / reach)
                s += hit + if (e.hp <= hit) 30f else 0f
            }
        }
        for (f in friends) {
            val d = hypot(f.x - x, f.y - y)
            if (d < reach) s -= 1.5f * dmg * (1f - d / reach)
        }
        return s - nearest * 0.01f
    }

    private fun lineClear(a: Worm, b: Worm): Boolean {
        val d = hypot(b.x - a.x, b.y - a.y)
        val dx = (b.x - a.x) / d
        val dy = (b.y - a.y) / d
        var s = Game.R + 2f
        while (s < d - Game.R) {
            if (g.terrain.isSolid(a.x + dx * s, a.y + dy * s)) return false
            for (o in g.worms) {
                if (o === a || o === b || !o.alive) continue
                if (hypot(o.x - (a.x + dx * s), o.y - (a.y + dy * s)) < Game.R) return false
            }
            s += 2f
        }
        return true
    }
}
