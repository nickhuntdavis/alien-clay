package com.alienclay.worms

import java.util.Random
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.min

/**
 * CPU opponent. At the start of its turn it replays candidate bazooka shots
 * through the real physics (with the current wind), scores where each lands,
 * then aims visibly and fires with a little human-like error.
 */
class Ai(private val g: Game) {
    private val rnd = Random()
    private var angle = -0.7f
    private var power = 0.7f
    private var weapon = Weapon.BOULDER
    private var fired = false

    /** Best-scoring plan before noise is added; exposed for tests. */
    var plannedScore = 0f
        private set
    var plannedImpact: FloatArray? = null
        private set

    fun plan(noise: Boolean = true) {
        fired = false
        val me = g.active
        val enemies = g.worms.filter { it.alive && !it.drowned && it.team != me.team }
        val friends = g.worms.filter { it.alive && !it.drowned && it.team == me.team }
        if (enemies.isEmpty()) return

        var bestScore = -1e9f
        var bestAngle = -0.7f
        var bestPower = 0.7f
        var bestWeapon = Weapon.BOULDER
        var bestImpact: FloatArray? = null

        var deg = -200f
        while (deg <= 20f) {
            val a = (deg * PI / 180.0).toFloat()
            var pw = 0.3f
            while (pw <= 1.001f) {
                val hit = g.simulateImpact(Kind.ROCK, me, a, pw)
                if (hit != null) {
                    val s = score(hit[0], hit[1], 44f, 50f, enemies, friends)
                    if (s > bestScore) {
                        bestScore = s; bestAngle = a; bestPower = pw; bestWeapon = Weapon.BOULDER; bestImpact = hit
                    }
                }
                pw += 0.05f
            }
            deg += 3f
        }

        // Shotgun: a clear straight line to a nearby enemy.
        for (e in enemies) {
            val d = hypot(e.x - me.x, e.y - me.y)
            if (d < 450f && lineClear(me, e)) {
                val s = 25f + (if (e.hp <= 25) 30f else 0f) - d * 0.01f
                if (s > bestScore) {
                    bestScore = s; bestAngle = atan2(e.y - me.y, e.x - me.x); bestPower = 1f
                    bestWeapon = Weapon.FLASH; bestImpact = floatArrayOf(e.x, e.y)
                }
            }
        }

        // Dynamite: an enemy right next to us and no friends in the blast.
        if (g.ammoLeft(Weapon.FLARE) != 0) {
            val close = enemies.count { abs(it.x - me.x) < 40f && abs(it.y - me.y) < 30f }
            val mates = friends.count { it !== me && hypot(it.x - me.x, it.y - me.y) < 90f }
            if (close > 0 && mates == 0) {
                val s = 55f * close
                if (s > bestScore) {
                    bestScore = s; bestWeapon = Weapon.FLARE; bestPower = 1f
                    bestAngle = if (enemies.first().x > me.x) -0.3f else (-PI + 0.3).toFloat()
                    bestImpact = floatArrayOf(me.x, me.y)
                }
            }
        }

        plannedScore = bestScore
        plannedImpact = bestImpact
        angle = bestAngle
        power = bestPower
        weapon = bestWeapon
        if (noise && weapon == Weapon.BOULDER) {
            angle += (rnd.nextGaussian() * 0.025).toFloat()
            power = (power + (rnd.nextGaussian() * 0.025).toFloat()).coerceIn(0.2f, 1f)
        }
    }

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
