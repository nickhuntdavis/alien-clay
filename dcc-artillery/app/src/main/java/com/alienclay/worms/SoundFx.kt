package com.alienclay.worms

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.Random
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin

/**
 * Sound effects and a dungeon ambience loop, all synthesised at start-up (no audio assets).
 * Each clip is rendered to a small WAV in the cache folder and loaded into a SoundPool.
 */
class SoundFx(context: Context) {
    private val pool = SoundPool.Builder()
        .setMaxStreams(8)
        .setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build(),
        )
        .build()
    private val ids = IntArray(Sfx.entries.size)
    private val volume = FloatArray(Sfx.entries.size) { 1f }
    private var ambienceId = 0
    private var ambienceStream = 0
    private var ambienceLoaded = false
    private val prefs = context.getSharedPreferences("settings", Context.MODE_PRIVATE)

    // Declared before init: synthesis runs there and needs it.
    private val rnd = Random(3)

    var muted = prefs.getBoolean("muted", false)
        private set

    init {
        pool.setOnLoadCompleteListener { _, id, status ->
            if (status == 0 && id == ambienceId) {
                ambienceLoaded = true
                startAmbience()
            }
        }
        val dir = File(context.cacheDir, "sfx").apply { mkdirs() }
        for (s in Sfx.entries) {
            val file = File(dir, "${s.name.lowercase()}.wav")
            writeWav(file, synth(s))
            ids[s.ordinal] = pool.load(file.path, 1)
        }
        volume[Sfx.BOUNCE.ordinal] = 0.5f
        volume[Sfx.WHIFF.ordinal] = 0.6f
        val amb = File(dir, "ambience.wav")
        writeWav(amb, ambience())
        ambienceId = pool.load(amb.path, 1)
    }

    fun play(s: Sfx) {
        if (muted) return
        val v = volume[s.ordinal]
        pool.play(ids[s.ordinal], v, v, 1, 0, 1f)
    }

    fun toggleMute() {
        muted = !muted
        prefs.edit().putBoolean("muted", muted).apply()
        if (muted) stopAmbience() else startAmbience()
    }

    fun pause() = pool.autoPause()

    fun resume() = pool.autoResume()

    fun release() = pool.release()

    private fun startAmbience() {
        if (muted || !ambienceLoaded || ambienceStream != 0) return
        ambienceStream = pool.play(ambienceId, 0.35f, 0.35f, 0, -1, 1f)
    }

    private fun stopAmbience() {
        if (ambienceStream != 0) pool.stop(ambienceStream)
        ambienceStream = 0
    }

    // -------------------------------------------------------------- synthesis

    private fun synth(s: Sfx): FloatArray = when (s) {
        Sfx.BOOM_BIG -> boom(0.9f, 0.35f, 80f)
        Sfx.BOOM_SMALL -> boom(0.45f, 0.55f, 120f)
        Sfx.THROW -> render(0.25f) { t, d -> noise() * bell(t / d) * 0.5f }
        Sfx.WHIFF -> render(0.2f) { t, d -> noise() * bell(t / d) * 0.35f }
        Sfx.ZAP -> sweep(0.4f, 1600f, 250f, 0.35f, square = true)
        Sfx.KICK -> render(0.18f) { t, _ ->
            val f = 150f - 500f * t
            (sin(2 * PI * f * t).toFloat() * 0.75f + noise() * 0.25f * exp(-t * 60f)) * exp(-t * 18f)
        }
        Sfx.BOUNCE -> render(0.08f) { t, _ -> sin(2 * PI * 520 * t).toFloat() * exp(-t * 50f) * 0.6f }
        Sfx.JUMP -> sweep(0.18f, 300f, 720f, 0.4f, square = false)
        Sfx.FALL -> sweep(0.8f, 900f, 180f, 0.4f, square = false)
        Sfx.ACHIEVEMENT -> notes(floatArrayOf(880f, 1320f), 0.18f, 0.45f)
        Sfx.LOOT -> notes(floatArrayOf(523f, 659f, 784f, 1047f), 0.08f, 0.35f)
        Sfx.TURN -> render(0.6f) { t, _ ->
            (sin(2 * PI * 220 * t) * 0.6 + sin(2 * PI * 331 * t) * 0.3 + sin(2 * PI * 587 * t) * 0.15).toFloat() *
                exp(-t * 5f) * 0.5f
        }
        Sfx.GATE -> {
            var ph = 0.0
            render(0.35f) { t, d ->
                ph += 2 * PI * (600f + 1400f * t / d) / RATE
                (sin(ph) + 0.4 * sin(ph * 1.5)).toFloat() * bell(t / d) * 0.3f * (0.7f + 0.3f * sin(2 * PI * 30 * t).toFloat())
            }
        }
        Sfx.ROAR -> {
            var lp = 0f
            render(0.9f) { t, d ->
                lp += (noise() - lp) * 0.08f
                val f = 85f + 25f * sin(2 * PI * 6 * t).toFloat()
                val saw = ((t * f) % 1f) * 2f - 1f
                (saw * 0.45f + lp * 2.2f) * bell(t / d) * 0.7f
            }
        }
        Sfx.WIN -> notes(floatArrayOf(523f, 659f, 784f, 1047f, 784f, 1047f), 0.14f, 0.4f)
    }

    private fun boom(dur: Float, bright: Float, thumpHz: Float): FloatArray {
        var lp = 0f
        return render(dur) { t, d ->
            val a = bright * (1f - t / d) + 0.02f
            lp += (noise() - lp) * a
            val thump = sin(2 * PI * (thumpHz - 40f * t / d) * t).toFloat() * exp(-t * 6f)
            (lp * 1.6f + thump * 0.8f) * exp(-t * 4.5f / d) * 0.7f
        }
    }

    private fun sweep(dur: Float, from: Float, to: Float, amp: Float, square: Boolean): FloatArray {
        var phase = 0.0
        return render(dur) { t, d ->
            val f = from + (to - from) * (t / d)
            phase += 2 * PI * f / RATE
            val v = sin(phase).toFloat()
            (if (square) (if (v > 0) 0.6f else -0.6f) + v * 0.4f else v) * amp * bell(t / d)
        }
    }

    private fun notes(freqs: FloatArray, each: Float, amp: Float): FloatArray = render(each * freqs.size + 0.3f) { t, _ ->
        var v = 0f
        for ((i, f) in freqs.withIndex()) {
            val start = i * each
            if (t >= start) {
                val lt = t - start
                v += (sin(2 * PI * f * lt) + 0.3 * sin(4 * PI * f * lt)).toFloat() * exp(-lt * 6f)
            }
        }
        v * amp
    }

    /** Six seconds of low drone with a few water drips; frequencies chosen so the loop is seamless. */
    private fun ambience(): FloatArray {
        val drips = floatArrayOf(0.7f, 2.9f, 4.4f)
        return render(6f) { t, _ ->
            val trem = 0.75f + 0.25f * sin(2 * PI * 0.5 * t).toFloat()
            var v = (sin(2 * PI * 55 * t) * 0.5 + sin(2 * PI * 82.5 * t) * 0.25 + sin(2 * PI * 110.5 * t) * 0.08).toFloat() * trem
            for (d in drips) {
                val lt = t - d
                if (lt in 0f..0.25f) v += sin(2 * PI * (1400 - 2400 * lt) * lt).toFloat() * exp(-lt * 30f) * 0.5f
            }
            v * 0.5f
        }
    }

    private inline fun render(dur: Float, fn: (Float, Float) -> Float): FloatArray {
        val n = (dur * RATE).toInt()
        return FloatArray(n) { i -> fn(i / RATE.toFloat(), dur) }
    }

    private fun noise() = rnd.nextFloat() * 2f - 1f

    private fun bell(k: Float) = sin(PI * k.coerceIn(0f, 1f)).toFloat()

    private fun writeWav(file: File, samples: FloatArray) {
        val data = ByteBuffer.allocate(44 + samples.size * 2).order(ByteOrder.LITTLE_ENDIAN)
        data.put("RIFF".toByteArray()).putInt(36 + samples.size * 2).put("WAVE".toByteArray())
        data.put("fmt ".toByteArray()).putInt(16).putShort(1).putShort(1)
            .putInt(RATE).putInt(RATE * 2).putShort(2).putShort(16)
        data.put("data".toByteArray()).putInt(samples.size * 2)
        for (s in samples) data.putShort((s.coerceIn(-1f, 1f) * 32000f).toInt().toShort())
        FileOutputStream(file).use { it.write(data.array()) }
    }

    companion object {
        private const val RATE = 22050
    }
}
