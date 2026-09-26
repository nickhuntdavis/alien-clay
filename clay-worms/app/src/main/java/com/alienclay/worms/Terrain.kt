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
        val rim = 4f
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
                    pixels[i] = shade(base[i], 0.55f) // scorched rim
                }
            }
        }
        markDirty(x0, y0, x1 + 1, y1 + 1)
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
        val grass = intArrayOf(rgb(0xB4, 0xF0, 0x6A), rgb(0x8B, 0xE0, 0x4E), rgb(0x5F, 0xB8, 0x3A), rgb(0x3F, 0x8A, 0x2C))
        val clay = intArrayOf(rgb(0xC8, 0x65, 0x3E), rgb(0xB0, 0x52, 0x33), rgb(0xD9, 0x7A, 0x4A), rgb(0xA0, 0x4A, 0x3A))
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
                    pixels[i] = 0
                    continue
                }
                if (!inRun) {
                    inRun = true
                    run++
                    runStart = y
                }
                val depth = y - runStart
                var c = when {
                    run == 1 && depth < 8 -> grass[min(3, depth / 2)]
                    depth < 3 -> shade(clay[1], 0.7f)
                    else -> {
                        val band = (((y + wobble) / 18).toInt() % clay.size + clay.size) % clay.size
                        val fade = 1f - min(0.35f, (y - runStart) / 900f)
                        shade(clay[band], fade)
                    }
                }
                val n = rng.nextInt(100)
                if (n < 5) c = shade(c, 0.82f) else if (n < 8) c = shade(c, 1.12f)
                base[i] = c
                pixels[i] = c
            }
        }
        markAllDirty()
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
