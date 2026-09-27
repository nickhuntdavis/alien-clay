package com.alienclay.worms

import android.content.res.AssetManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.LightingColorFilter
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.graphics.Shader
import kotlin.math.roundToInt

/**
 * Turns the fighters into illustrated sprites: each pose is drawn once at high resolution by [CreatureArt],
 * then given an ink outline and cel shading, cached, and blitted every frame.
 *
 * Real artwork can replace any fighter without code changes: put `assets/sprites/<species>.png`
 * (for example `carl.png`) in the app. See [BOX_LEFT] and friends for how the image maps onto the fighter.
 */
class SpriteCache(private val art: CreatureArt, private val assets: AssetManager) {
    companion object {
        // The box each sprite covers, in world units relative to the fighter's centre. Feet sit at y = +R (9),
        // so in a drop-in PNG the feet go 87.5% of the way down and the body is centred horizontally.
        const val BOX_LEFT = -22f
        const val BOX_TOP = -26f
        const val BOX_RIGHT = 22f
        const val BOX_BOTTOM = 14f
        private const val SCALE = 3f // pixels per world unit in the cached bitmaps
        private const val PHASES = 6 // frames for tails, tentacles, flames and shimmer
        private const val MAX_CACHED = 260
    }

    private val cache = object : LinkedHashMap<Int, Bitmap>(64, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<Int, Bitmap>?) = size > MAX_CACHED
    }
    private val overrides = HashMap<Species, Bitmap?>()
    private val blit = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)
    private val flashFilter = LightingColorFilter(0xFF808080.toInt(), 0x007F7F7F)
    private val dst = RectF()

    private val w = ((BOX_RIGHT - BOX_LEFT) * SCALE).roundToInt()
    private val h = ((BOX_BOTTOM - BOX_TOP) * SCALE).roundToInt()
    private val outline = 1.6f * SCALE
    private val ink = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF120C10.toInt() }
    private val shade = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP)
        shader = LinearGradient(0f, 0f, w * 0.8f, h.toFloat(),
            intArrayOf(0x55FFF4E0, 0x00000000, 0x66000000), floatArrayOf(0f, 0.45f, 1f), Shader.TileMode.CLAMP)
    }

    /** Draw [s] centred at (x, y) in world units, in the pose described by the animation inputs. */
    fun draw(
        c: Canvas, s: Species, x: Float, y: Float, facing: Int, t: Float, airborne: Boolean,
        walk: Float, walking: Float, blinking: Boolean, flash: Boolean,
    ) {
        blit.colorFilter = if (flash) flashFilter else null
        val custom = override(s)
        if (custom != null) {
            // Artist sprite: one pose facing right, mirrored for left.
            c.save()
            if (facing < 0) c.scale(-1f, 1f, x, y)
            dst.set(x + BOX_LEFT, y + BOX_TOP, x + BOX_RIGHT, y + BOX_BOTTOM)
            c.drawBitmap(custom, null, dst, blit)
            c.restore()
            return
        }
        // Quantise the pose so a handful of cached frames covers all the motion.
        val step = ((kotlin.math.sin(walk) * walking) * 2f).roundToInt().coerceIn(-2, 2) // -2..2
        val phase = ((t * PHASES).toInt() % PHASES + PHASES) % PHASES
        val blink = blinking && step == 0
        val key = ((((s.ordinal * 2 + (if (facing < 0) 1 else 0)) * 5 + (step + 2)) * 2 +
            (if (blink) 1 else 0)) * 2 + (if (airborne) 1 else 0)) * PHASES + phase
        val bmp = cache[key] ?: render(s, facing, step / 2f, blink, airborne, phase).also { cache[key] = it }
        dst.set(x + BOX_LEFT, y + BOX_TOP, x + BOX_RIGHT, y + BOX_BOTTOM)
        c.drawBitmap(bmp, null, dst, blit)
    }

    private fun override(s: Species): Bitmap? = overrides.getOrPut(s) {
        try {
            assets.open("sprites/${s.name.lowercase()}.png").use { BitmapFactory.decodeStream(it) }
        } catch (_: java.io.IOException) {
            null
        }
    }

    /** One pose: vector art at high resolution, then an ink outline behind it and cel shading over it. */
    private fun render(s: Species, facing: Int, step: Float, blink: Boolean, airborne: Boolean, phase: Int): Bitmap {
        val body = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val bc = Canvas(body)
        bc.scale(SCALE, SCALE)
        bc.translate(-BOX_LEFT, -BOX_TOP)
        val t = phase / PHASES.toFloat() * 2.1f // spread the time-driven motion over the frames
        art.draw(bc, s, 0f, 0f, facing.toFloat(), t, airborne, (Math.PI / 2).toFloat(), step, blink, false)
        bc.setMatrix(null)
        bc.drawRect(0f, 0f, w.toFloat(), h.toFloat(), shade)

        val out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val oc = Canvas(out)
        val mask = body.extractAlpha()
        for (k in 0 until 12) {
            val a = k * Math.PI * 2 / 12
            oc.drawBitmap(mask, (kotlin.math.cos(a) * outline).toFloat(), (kotlin.math.sin(a) * outline).toFloat(), ink)
        }
        oc.drawBitmap(body, 0f, 0f, null)
        mask.recycle()
        body.recycle()
        return out
    }
}
