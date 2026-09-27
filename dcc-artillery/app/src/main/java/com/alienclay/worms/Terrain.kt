package com.alienclay.worms

import java.util.Random
import kotlin.math.PI
import kotlin.math.ceil
import kotlin.math.exp
import kotlin.math.floor
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Destructible pixel terrain. One cell per world unit.
 * [solid] drives physics; [pixels] is the ARGB image the renderer uploads.
 * Pure Kotlin (no Android types) so it can be unit tested on the JVM.
 */
class Terrain(val w: Int, val h: Int) {
    val solid = BooleanArray(w * h)
    val pixels = IntArray(w * h)
    private val base = IntArray(w * h)

    /** Crystals embedded in the rock, as (x, y, colour). They glow in the renderer until blasted out. */
    val crystals = ArrayList<IntArray>()

    // Region of [pixels] changed since the renderer last synced (left/top inclusive, right/bottom exclusive).
    var dirty = true
        private set
    var dirtyL = 0; private set
    var dirtyT = 0; private set
    var dirtyR = w; private set
    var dirtyB = h; private set

    fun isSolid(x: Int, y: Int): Boolean {
        if (x < 0 || x >= w || y < 0 || y >= h) return false
        return solid[y * w + x]
    }

    fun isSolid(x: Float, y: Float): Boolean = isSolid(floor(x).toInt(), floor(y).toInt())

    /** Original colour at a point, or 0 if there was never ground there. */
    fun baseColorAt(x: Float, y: Float): Int {
        val ix = x.toInt()
        val iy = y.toInt()
        if (ix < 0 || ix >= w || iy < 0 || iy >= h) return 0
        return base[iy * w + ix]
    }

    /** First solid row from the top at column [x], or [h] if the column is empty. */
    fun surfaceAt(x: Int): Int {
        if (x < 0 || x >= w) return h
        for (y in 0 until h) if (solid[y * w + x]) return y
        return h
    }

    fun generate(seed: Long, waterY: Int) {
        val rng = Random(seed)
        solid.fill(false)
        val ph = DoubleArray(4) { rng.nextDouble() * PI * 2 }
        val dip = if (rng.nextBoolean()) w * (0.3 + rng.nextDouble() * 0.4) else -1.0
        val edge = 130.0
        for (x in 0 until w) {
            val t = x.toDouble() / w
            var s = h * 0.55 -
                (100 * sin(t * PI * 2 * 1.3 + ph[0]) +
                    50 * sin(t * PI * 2 * 3.1 + ph[1]) +
                    20 * sin(t * PI * 2 * 7.3 + ph[2]) +
                    6 * sin(t * PI * 2 * 19.0 + ph[3]))
            if (dip > 0) {
                val d = (x - dip) / 50.0
                s += 280 * exp(-d * d)
            }
            // Slope down into the water at both edges so the map is an island.
            val e = smooth(x / edge) * smooth((w - 1 - x) / edge)
            val sea = waterY + 40.0
            s = sea + (s - sea) * e
            val top = s.toInt().coerceIn(60, h)
            for (y in top until h) solid[y * w + x] = true
        }

        // Caves under the surface.
        repeat(3 + rng.nextInt(3)) {
            val cx = 150 + rng.nextInt(w - 300)
            val top = surfaceAt(cx)
            val room = waterY - top
            if (room > 170) {
                val cy = top + 60 + rng.nextInt(room - 110)
                fillEllipse(cx.toFloat(), cy.toFloat(), 35f + rng.nextInt(55), 20f + rng.nextInt(20), false)
            }
        }

        // Floating islands in the sky, only where there is clear air below them.
        repeat(2) {
            val cx = 200 + rng.nextInt(w - 400)
            val cy = 120 + rng.nextInt(100)
            if (surfaceAt(cx) > cy + 110) {
                val rx = 55f + rng.nextInt(45)
                val ry = 12f + rng.nextInt(8)
                // Flat top, rounded underside.
                for (y in (cy - ry / 3).toInt()..(cy + ry).toInt()) {
                    val dy = (y - cy) / ry
                    val half = rx * sqrt(max(0f, 1f - dy * dy))
                    for (x in (cx - half).toInt()..(cx + half).toInt()) {
                        if (x in 0 until w && y in 0 until h) solid[y * w + x] = true
                    }
                }
            }
        }
        paint(rng)
    }

    /** Flat ground from [surfaceY] down. Used by tests. */
    fun fillFlat(surfaceY: Int) {
        for (y in 0 until h) for (x in 0 until w) solid[y * w + x] = y >= surfaceY
        paint(Random(1))
    }

    fun carve(cx: Float, cy: Float, r: Float) {
        val rim = min(10f, 4f + r * 0.12f)
        val x0 = max(0, floor(cx - r - rim).toInt())
        val x1 = min(w - 1, ceil(cx + r + rim).toInt())
        val y0 = max(0, floor(cy - r - rim).toInt())
        val y1 = min(h - 1, ceil(cy + r + rim).toInt())
        if (x0 > x1 || y0 > y1) return
        val r2 = r * r
        val rr2 = (r + rim) * (r + rim)
        for (y in y0..y1) {
            val dy = y + 0.5f - cy
            for (x in x0..x1) {
                val dx = x + 0.5f - cx
                val d2 = dx * dx + dy * dy
                val i = y * w + x
                if (d2 <= r2) {
                    solid[i] = false
                    pixels[i] = 0
                } else if (d2 <= rr2 && solid[i]) {
                    // Scorched rim: darkest at the crater edge, fading outwards, with soot flecks.
                    val k = (sqrt(d2) - r) / rim
                    val soot = if (((x * 73856093) xor (y * 19349663)) and 7 == 0) 0.7f else 1f
                    pixels[i] = shade(base[i], (0.3f + 0.6f * k) * soot)
                }
            }
        }
        markDirty(x0, y0, x1 + 1, y1 + 1)
        crystals.removeAll { (it[0] - cx) * (it[0] - cx) + (it[1] - cy) * (it[1] - cy) <= (r + 2f) * (r + 2f) }
    }

    /** Outward surface normal near a point, written to [out] as (nx, ny). */
    fun normalAt(x: Float, y: Float, out: FloatArray) {
        val cx = x.toInt()
        val cy = y.toInt()
        var sx = 0f
        var sy = 0f
        for (dy in -4..4) for (dx in -4..4) {
            if (dx * dx + dy * dy <= 16 && isSolid(cx + dx, cy + dy)) {
                sx -= dx
                sy -= dy
            }
        }
        val l = hypot(sx, sy)
        if (l < 0.001f) {
            out[0] = 0f; out[1] = -1f
        } else {
            out[0] = sx / l; out[1] = sy / l
        }
    }

    fun markAllDirty() = markDirty(0, 0, w, h)

    fun clearDirty() {
        dirty = false
    }

    private fun markDirty(l: Int, t: Int, r: Int, b: Int) {
        if (!dirty) {
            dirtyL = l; dirtyT = t; dirtyR = r; dirtyB = b
            dirty = true
        } else {
            dirtyL = min(dirtyL, l); dirtyT = min(dirtyT, t)
            dirtyR = max(dirtyR, r); dirtyB = max(dirtyB, b)
        }
    }

    private fun fillEllipse(cx: Float, cy: Float, rx: Float, ry: Float, value: Boolean) {
        for (y in (cy - ry).toInt()..(cy + ry).toInt()) {
            for (x in (cx - rx).toInt()..(cx + rx).toInt()) {
                if (x !in 0 until w || y !in 0 until h) continue
                val dx = (x - cx) / rx
                val dy = (y - cy) / ry
                if (dx * dx + dy * dy <= 1f) solid[y * w + x] = value
            }
        }
    }

    private fun paint(rng: Random) {
        // Cobbled floor over packed earth and bedrock.
        val stone = intArrayOf(rgb(0x9A, 0x94, 0x8C), rgb(0x86, 0x80, 0x78), rgb(0x72, 0x6C, 0x66), rgb(0x4E, 0x4A, 0x46))
        val clay = intArrayOf(rgb(0x5E, 0x4C, 0x40), rgb(0x52, 0x43, 0x38), rgb(0x6A, 0x58, 0x4A), rgb(0x46, 0x3B, 0x33))
        for (x in 0 until w) {
            var run = 0
            var runStart = 0
            var inRun = false
            val wobble = sin(x * 0.013) * 10 + sin(x * 0.051) * 3
            for (y in 0 until h) {
                val i = y * w + x
                if (!solid[i]) {
                    inRun = false
                    base[i] = 0
                    continue
                }
                if (!inRun) {
                    inRun = true
                    run++
                    runStart = y
                }
                val depth = y - runStart
                var c = when {
                    run == 1 && depth < 10 -> cobble(x, depth, stone)
                    depth < 3 -> shade(clay[1], 0.7f)
                    else -> {
                        val band = (((y + wobble) / 18).toInt() % clay.size + clay.size) % clay.size
                        val fade = 1f - min(0.35f, (y - runStart) / 900f)
                        shade(clay[band], fade)
                    }
                }
                // Floors of caves sit in the shadow of the rock above them.
                if (run > 1 && depth < 14) c = shade(c, 0.45f + 0.55f * depth / 14f)
                val n = rng.nextInt(100)
                if (n < 5) c = shade(c, 0.82f) else if (n < 8) c = shade(c, 1.12f)
                base[i] = c
            }
            // Undersides (cave ceilings, overhangs, floating islands) fall into shadow.
            var below = 99
            for (y in h - 1 downTo 0) {
                val i = y * w + x
                if (!solid[i]) {
                    below = 0
                    continue
                }
                below++
                if (below <= 6) base[i] = shade(base[i], 0.5f + 0.08f * below)
            }
        }
        crystals.clear()
        repeat(22) { tryDecorate(rng) { x, y -> bone(x, y, rng) } }
        repeat(12) { tryDecorate(rng) { x, y -> crystalCluster(x, y, rng) } }
        System.arraycopy(base, 0, pixels, 0, base.size)
        markAllDirty()
    }

    /** Two staggered rows of rounded cobbles with mortar between them. */
    private fun cobble(x: Int, depth: Int, stone: IntArray): Int {
        val row = depth / 5
        val off = if (row == 0) 0 else 5
        val cx = (x + off) / 10
        val inRow = depth % 5
        if ((x + off) % 10 == 0 || inRow == 4) return shade(stone[3], 0.55f)
        val tone = ((cx * 7919 + row * 104729) ushr 3) and 3
        var c = stone[min(2, tone)]
        if (inRow == 0) c = shade(c, 1.15f) else if (inRow == 3) c = shade(c, 0.85f)
        return c
    }

    /** Pick a spot buried in rock (not right at the surface) and draw something there. */
    private inline fun tryDecorate(rng: Random, draw: (Int, Int) -> Unit) {
        for (attempt in 0 until 30) {
            val x = 20 + rng.nextInt(w - 40)
            val top = surfaceAt(x)
            if (top >= h - 60) continue
            val y = top + 16 + rng.nextInt(min(260, h - top - 40))
            if (!isSolid(x, y) || !isSolid(x, y - 10) || !isSolid(x, y + 6)) continue
            draw(x, y)
            return
        }
    }

    private fun stamp(x: Int, y: Int, c: Int) {
        if (x < 0 || x >= w || y < 0 || y >= h) return
        val i = y * w + x
        if (solid[i]) base[i] = c
    }

    private fun bone(x: Int, y: Int, rng: Random) {
        val col = rgb(0xD8, 0xCF, 0xB8)
        val dark = shade(col, 0.7f)
        if (rng.nextInt(5) == 0) {
            // A skull.
            for (dy in -3..3) for (dx in -3..3) if (dx * dx + dy * dy <= 10) stamp(x + dx, y + dy, if (dy == 3) dark else col)
            stamp(x - 1, y, 0xFF1A1210.toInt()); stamp(x - 2, y, 0xFF1A1210.toInt())
            stamp(x + 1, y, 0xFF1A1210.toInt()); stamp(x + 2, y, 0xFF1A1210.toInt())
            return
        }
        val a = rng.nextFloat() * PI.toFloat()
        val len = 6 + rng.nextInt(6)
        val ca = kotlin.math.cos(a)
        val sa = kotlin.math.sin(a)
        var t = 0f
        while (t <= len) {
            stamp((x + ca * t).toInt(), (y + sa * t).toInt(), col)
            stamp((x + ca * t - sa).toInt(), (y + sa * t + ca).toInt(), dark)
            t += 0.5f
        }
        for (end in floatArrayOf(0f, len.toFloat())) {
            for (side in floatArrayOf(-1.5f, 1.5f)) {
                val ex = (x + ca * end - sa * side).toInt()
                val ey = (y + sa * end + ca * side).toInt()
                stamp(ex, ey, col); stamp(ex + 1, ey, col); stamp(ex, ey + 1, dark)
            }
        }
    }

    private fun crystalCluster(x: Int, y: Int, rng: Random) {
        val hue = if (rng.nextBoolean()) rgb(0x5A, 0xD8, 0xC8) else rgb(0xB0, 0x7C, 0xFF)
        for (shard in 0 until 3) {
            val bx = x + (shard - 1) * 3
            val height = 5 + rng.nextInt(6)
            val lean = (rng.nextFloat() - 0.5f) * 0.8f
            for (k in 0 until height) {
                val half = 1.6f * (1f - k.toFloat() / height) + 0.4f
                val cx = bx + lean * k
                var px = (cx - half).toInt()
                while (px <= (cx + half).toInt()) {
                    val edge = px <= (cx - half).toInt()
                    val tip = k.toFloat() / height
                    stamp(px, y - k, if (edge) shade(hue, 1.4f) else shade(hue, 0.7f + 0.6f * tip))
                    px++
                }
            }
        }
        crystals.add(intArrayOf(x, y - 3, hue))
    }

    companion object {
        private fun smooth(v: Double): Double {
            val t = v.coerceIn(0.0, 1.0)
            return t * t * (3 - 2 * t)
        }

        fun rgb(r: Int, g: Int, b: Int): Int = (0xFF shl 24) or (r shl 16) or (g shl 8) or b

        fun shade(c: Int, f: Float): Int {
            val r = min(255, (((c shr 16) and 0xFF) * f).toInt())
            val g = min(255, (((c shr 8) and 0xFF) * f).toInt())
            val b = min(255, ((c and 0xFF) * f).toInt())
            return (c and 0xFF000000.toInt()) or (r shl 16) or (g shl 8) or b
        }
    }
}
