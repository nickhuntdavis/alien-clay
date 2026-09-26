package com.alienclay.worms

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapShader
import android.graphics.Matrix
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.os.Build
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Owns the game loop thread, the camera, touch controls and all drawing. */
@SuppressLint("ViewConstructor")
class GameView(context: Context) : SurfaceView(context), SurfaceHolder.Callback, Runnable {
    private enum class Screen { MENU, GAME }

    private val lock = Any()
    private var thread: Thread? = null
    @Volatile private var running = false

    private var screen = Screen.MENU
    private var game: Game? = null
    private val menuGame = Game(Mode.VS_CPU, 7L)

    private val dp = resources.displayMetrics.density
    private var vw = 1f
    private var vh = 1f

    // Camera: world point at screen centre, and pixels per world unit.
    private var camX = Game.W / 2f
    private var camY = Game.H / 2f
    private var scale = 1f
    private var fullScale = 1f
    private var closeScale = 1f
    private var zoomedOut = false

    private var terrainBmp: Bitmap? = null
    private var bmpOwner: Terrain? = null

    // Controls
    private val btnLeft = RectF()
    private val btnRight = RectF()
    private val btnJump = RectF()
    private val btnWeapon = RectF()
    private val btnZoom = RectF()
    private val btnPause = RectF()
    private val btnSound = RectF()
    private val windBox = RectF()
    private val btnResume = RectF()
    private val btnCpu = RectF()
    private val btnTwo = RectF()
    private val btnAgain = RectF()
    private val btnToMenu = RectF()
    private val pickerRows = Array(3) { RectF() } // no fighter carries more than three attacks
    private var pickerOpen = false

    private val roles = HashMap<Int, Int>()
    private var aimStartX = 0f
    private var aimStartY = 0f
    private var aimCurX = 0f
    private var aimCurY = 0f

    // Drawing
    private val fill = Paint(Paint.ANTI_ALIAS_FLAG)
    private val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
    private val text = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        textAlign = Paint.Align.CENTER
    }
    private val bmpPaint = Paint(Paint.FILTER_BITMAP_FLAG)
    private val sky = Paint()
    private val pitGlow = Paint()
    private val art = CreatureArt()
    private val wall = Paint().apply { shader = BitmapShader(brickTile(), Shader.TileMode.REPEAT, Shader.TileMode.REPEAT) }
    private val wallMatrix = Matrix()

    /** Sound effects; created here so the activity can pause and release them. */
    val sound = SoundFx(context)
    private val path = Path()
    private val rect = RectF()
    private val preview = FloatArray(80)
    private var shownViewers = Game.START_VIEWERS.toFloat()

    init {
        holder.addCallback(this)
        isFocusable = true
    }

    // ------------------------------------------------------------ lifecycle

    override fun surfaceCreated(holder: SurfaceHolder) {
        running = true
        thread = Thread(this, "game-loop").also { it.start() }
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        synchronized(lock) { layout(width.toFloat(), height.toFloat()) }
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        running = false
        try {
            thread?.join(500)
        } catch (_: InterruptedException) {
        }
        thread = null
    }

    /** Back button: leave the match for the menu. Returns false to let the app close. */
    fun onBack(): Boolean = synchronized(lock) {
        if (screen == Screen.GAME) {
            screen = Screen.MENU
            clearInput()
            true
        } else {
            false
        }
    }

    override fun run() {
        var last = System.nanoTime()
        var acc = 0f
        while (running) {
            val now = System.nanoTime()
            acc += min(0.1f, (now - last) / 1e9f)
            last = now
            synchronized(lock) {
                while (acc >= Game.DT) {
                    tick(Game.DT)
                    acc -= Game.DT
                }
            }
            val c = try {
                if (Build.VERSION.SDK_INT >= 26) holder.lockHardwareCanvas() else holder.lockCanvas()
            } catch (_: Exception) {
                null
            }
            if (c == null) {
                Thread.sleep(10)
                continue
            }
            try {
                synchronized(lock) { render(c) }
            } finally {
                holder.unlockCanvasAndPost(c)
            }
        }
    }

    private fun layout(w: Float, h: Float) {
        vw = w
        vh = h
        fullScale = min(vw / Game.W, vh / (Game.H + 20f))
        closeScale = max(fullScale, vh / 360f)
        scale = if (screen == Screen.GAME && !zoomedOut) closeScale else fullScale
        sky.shader = LinearGradient(0f, 0f, 0f, vh,
            intArrayOf(0xFF0A0706.toInt(), 0xFF140E0C.toInt(), 0xFF22160F.toInt(), 0xFF3A1E12.toInt()),
            floatArrayOf(0f, 0.45f, 0.75f, 1f), Shader.TileMode.CLAMP)
        // Red glow rising out of the pit, in world coordinates.
        pitGlow.shader = LinearGradient(0f, Game.WATER_Y - 110f, 0f, Game.WATER_Y.toFloat(),
            0x00FF4A1A, 0x66FF4A1A, Shader.TileMode.CLAMP)

        val m = 16 * dp
        val b = 64 * dp
        btnLeft.set(m, vh - m - b, m + b, vh - m)
        btnRight.set(btnLeft.right + 14 * dp, btnLeft.top, btnLeft.right + 14 * dp + b, btnLeft.bottom)
        btnJump.set(btnRight.right + 24 * dp, btnLeft.top, btnRight.right + 24 * dp + b, btnLeft.bottom)
        btnWeapon.set(vw - m - 200 * dp, vh - m - 60 * dp, vw - m, vh - m)
        btnZoom.set(vw - m - 52 * dp, btnWeapon.top - 14 * dp - 52 * dp, vw - m, btnWeapon.top - 14 * dp)
        btnPause.set(vw - m - 44 * dp, m, vw - m, m + 44 * dp)
        btnSound.set(btnPause.left - 10 * dp - 44 * dp, m, btnPause.left - 10 * dp, m + 44 * dp)
        windBox.set(btnSound.left - 12 * dp - 170 * dp, m, btnSound.left - 12 * dp, m + 44 * dp)
        val rowH = 36 * dp
        for (i in pickerRows.indices) {
            val bottom = btnWeapon.top - 8 * dp - (pickerRows.size - 1 - i) * (rowH + 4 * dp)
            pickerRows[i].set(btnWeapon.left, bottom - rowH, btnWeapon.right, bottom)
        }

        val bw = min(340 * dp, vw * 0.6f)
        val bh = 52 * dp
        val cx = vw / 2
        layoutMenuButtons()
        btnAgain.set(cx - bw / 2, vh * 0.55f, cx + bw / 2, vh * 0.55f + bh)
        btnToMenu.set(cx - bw / 2, btnAgain.bottom + 14 * dp, cx + bw / 2, btnAgain.bottom + 14 * dp + bh)
    }

    /** Stack the menu buttons, with RESUME on top only while a match is in progress. */
    private fun layoutMenuButtons() {
        val bw = min(340 * dp, vw * 0.6f)
        val bh = 52 * dp
        val gap = 12 * dp
        val cx = vw / 2
        val resume = game.let { it != null && it.phase != Phase.GAME_OVER }
        var top = vh * 0.36f
        if (resume) {
            btnResume.set(cx - bw / 2, top, cx + bw / 2, top + bh)
            top += bh + gap
        } else {
            btnResume.setEmpty()
        }
        btnCpu.set(cx - bw / 2, top, cx + bw / 2, top + bh)
        btnTwo.set(cx - bw / 2, btnCpu.bottom + gap, cx + bw / 2, btnCpu.bottom + gap + bh)
    }

    private fun startGame(mode: Mode) {
        val g = Game(mode)
        game = g
        screen = Screen.GAME
        zoomedOut = false
        pickerOpen = false
        clearInput()
        scale = closeScale
        camX = g.active.x
        camY = g.active.y
    }

    private fun clearInput() {
        roles.clear()
        game?.let {
            it.moveDir = 0
            if (it.humanTurn) it.aiming = false
        }
    }

    // --------------------------------------------------------------- update

    private fun tick(dt: Float) {
        val g = game
        if (screen == Screen.GAME && g != null) {
            g.update(dt)
            for (sfx in g.sounds) sound.play(sfx)
            g.sounds.clear()
            shownViewers += (g.viewers - shownViewers) * min(1f, dt * 3f)
            if (!g.humanTurn || g.phase == Phase.GAME_OVER) {
                roles.clear()
                g.moveDir = 0
                pickerOpen = false
            }
            updateCamera(g, dt)
        } else {
            scale = fullScale
            camX = Game.W / 2f
            camY = Game.H - vh / 2f / scale
        }
    }

    private fun updateCamera(g: Game, dt: Float) {
        val target = if (zoomedOut) fullScale else closeScale
        scale += (target - scale) * min(1f, dt * 5f)
        var tx: Float
        var ty: Float
        var speed = 3.5f
        val p = g.projectiles.firstOrNull()
        val flying = g.knocked.lastOrNull()
        if (zoomedOut) {
            tx = Game.W / 2f
            ty = Game.H / 2f
        } else if (flying != null) {
            // A worm thrown by a blast: watch it until it lands.
            tx = flying.x
            ty = flying.y
            speed = 6f
        } else if (p != null) {
            tx = p.x
            ty = p.y
            speed = 6f
        } else {
            tx = g.active.x
            ty = g.active.y - 40f
            if (g.aiming) {
                tx += cos(g.aimAngle) * 120f
                ty += sin(g.aimAngle) * 80f
            }
        }
        camX += (tx - camX) * min(1f, dt * speed)
        camY += (ty - camY) * min(1f, dt * speed)
        val hw = vw / 2f / scale
        val hh = vh / 2f / scale
        camX = if (hw * 2 >= Game.W) Game.W / 2f else camX.coerceIn(hw, Game.W - hw)
        val maxY = Game.H - hh
        val minY = hh - 260f
        camY = if (maxY <= minY) maxY else camY.coerceIn(minY, maxY)
    }

    // ---------------------------------------------------------------- input

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(e: MotionEvent): Boolean {
        synchronized(lock) {
            when (e.actionMasked) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    val i = e.actionIndex
                    down(e.getPointerId(i), e.getX(i), e.getY(i))
                }
                MotionEvent.ACTION_MOVE -> for (i in 0 until e.pointerCount) {
                    if (roles[e.getPointerId(i)] == ROLE_AIM) aimMove(e.getX(i), e.getY(i))
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    val i = e.actionIndex
                    up(e.getPointerId(i))
                }
                MotionEvent.ACTION_CANCEL -> clearInput()
            }
            updateMove()
        }
        return true
    }

    private fun down(id: Int, x: Float, y: Float) {
        // The open weapon picker sits over the top-right buttons, so it gets the tap first.
        if (!(screen == Screen.GAME && pickerOpen) && btnSound.contains(x, y)) {
            sound.toggleMute()
            return
        }
        if (screen == Screen.MENU) {
            layoutMenuButtons()
            when {
                btnResume.contains(x, y) -> screen = Screen.GAME
                btnCpu.contains(x, y) -> startGame(Mode.VS_CPU)
                btnTwo.contains(x, y) -> startGame(Mode.TWO_PLAYER)
            }
            return
        }
        val g = game ?: return
        if (g.phase == Phase.GAME_OVER) {
            if (btnAgain.contains(x, y)) startGame(g.mode)
            else if (btnToMenu.contains(x, y)) {
                screen = Screen.MENU
                game = null
            }
            return
        }
        if (btnPause.contains(x, y)) {
            screen = Screen.MENU
            clearInput()
            return
        }
        if (btnZoom.contains(x, y)) {
            zoomedOut = !zoomedOut
            return
        }
        if (!g.humanTurn) return
        if (pickerOpen) {
            pickerOpen = false
            for ((i, w) in g.loadout.withIndex()) {
                if (pickerRows[i].contains(x, y)) g.selectWeapon(w)
            }
            return
        }
        when {
            btnLeft.contains(x, y) -> roles[id] = ROLE_LEFT
            btnRight.contains(x, y) -> roles[id] = ROLE_RIGHT
            btnJump.contains(x, y) -> {
                roles[id] = ROLE_JUMP
                g.jumpRequested = true
            }
            btnWeapon.contains(x, y) -> {
                if (g.phase == Phase.PLAYING || g.phase == Phase.BANNER) pickerOpen = true
            }
            g.phase == Phase.PLAYING && !roles.containsValue(ROLE_AIM) -> {
                roles[id] = ROLE_AIM
                aimStartX = x; aimStartY = y
                aimCurX = x; aimCurY = y
                g.aiming = true
                g.aimPower = 0f
            }
        }
    }

    private fun aimMove(x: Float, y: Float) {
        val g = game ?: return
        aimCurX = x
        aimCurY = y
        if (!g.aiming) return
        val dx = aimStartX - x
        val dy = aimStartY - y
        val len = hypot(dx, dy)
        val dead = 12 * dp
        if (len > dead) {
            g.aimAngle = atan2(dy, dx)
            g.active.facing = if (dx >= 0) 1 else -1
        }
        g.aimPower = ((len - dead) / (150 * dp)).coerceIn(0f, 1f)
    }

    private fun up(id: Int) {
        val role = roles.remove(id) ?: return
        val g = game ?: return
        if (role == ROLE_AIM && g.aiming) {
            if (g.aimPower > 0.04f) g.fire() else g.aiming = false
        }
    }

    private fun updateMove() {
        val g = game ?: return
        if (!g.humanTurn) return
        val l = roles.containsValue(ROLE_LEFT)
        val r = roles.containsValue(ROLE_RIGHT)
        g.moveDir = (if (r) 1 else 0) - (if (l) 1 else 0)
    }

    // --------------------------------------------------------------- render

    private fun sx(wx: Float) = (wx - camX) * scale + vw / 2f
    private fun sy(wy: Float) = (wy - camY) * scale + vh / 2f

    private fun render(c: Canvas) {
        val g = if (screen == Screen.GAME) game ?: menuGame else menuGame
        drawWorld(c, g)
        if (screen == Screen.GAME && game != null) {
            drawLabels(c, g)
            drawHud(c, g)
        } else {
            drawMenu(c)
        }
    }

    private fun drawWorld(c: Canvas, g: Game) {
        c.drawRect(0f, 0f, vw, vh, sky)

        c.save()
        var shx = 0f
        var shy = 0f
        if (g.shake > 0f) {
            shx = (Math.random().toFloat() - 0.5f) * g.shake * scale
            shy = (Math.random().toFloat() - 0.5f) * g.shake * scale
        }
        c.translate(vw / 2f + shx, vh / 2f + shy)
        c.scale(scale, scale)
        c.translate(-camX, -camY)

        val left = camX - vw / 2f / scale - 40f
        val right = camX + vw / 2f / scale + 40f
        val top = camY - vh / 2f / scale - 40f

        // Back wall of the dungeon, scrolling slower than the floor for depth.
        val par = camX * 0.4f
        wallMatrix.setTranslate(par, 0f)
        wall.shader.setLocalMatrix(wallMatrix)
        c.drawRect(left, top, right, Game.WATER_Y.toFloat(), wall)
        drawTorches(c, g, par, left, right)
        c.drawRect(left, Game.WATER_Y - 110f, right, Game.WATER_Y.toFloat(), pitGlow)

        syncTerrain(g.terrain)
        terrainBmp?.let {
            rect.set(0f, 0f, Game.W.toFloat(), Game.H.toFloat())
            c.drawBitmap(it, null, rect, bmpPaint)
        }

        for (w in g.worms) drawWorm(c, g, w)
        for (gate in g.gates) drawGate(c, g, gate)
        for (p in g.projectiles) drawProjectile(c, p)
        drawParticles(c, g)
        if (screen == Screen.GAME) drawAim(c, g)
        for (b in g.boxes) drawBox(c, g, b)
        drawPit(c, g, left, right)
        c.restore()
    }

    private fun syncTerrain(t: Terrain) {
        var bmp = terrainBmp
        if (bmp == null) {
            bmp = Bitmap.createBitmap(t.w, t.h, Bitmap.Config.ARGB_8888)
            terrainBmp = bmp
        }
        if (bmpOwner !== t) {
            bmpOwner = t
            t.markAllDirty()
        }
        if (t.dirty) {
            val l = t.dirtyL
            val top = t.dirtyT
            bmp!!.setPixels(t.pixels, top * t.w + l, t.w, l, top, t.dirtyR - l, t.dirtyB - top)
            t.clearDirty()
        }
    }

    /** Iron sconces on the back wall with flickering flames. */
    private fun drawTorches(c: Canvas, g: Game, par: Float, left: Float, right: Float) {
        val spacing = 320f
        var k = kotlin.math.floor((left - par) / spacing).toInt()
        while (k * spacing + par < right) {
            val x = k * spacing + par + 60f
            val y = 170f + (((k % 3) + 3) % 3) * 40f
            val flick = sin(g.time * 13f + k * 1.7f) * 0.15f + sin(g.time * 7.3f + k) * 0.1f
            fill.color = 0x22FFA040
            c.drawCircle(x, y - 8f, 60f * (1f + flick), fill)
            fill.color = 0x33FFB050
            c.drawCircle(x, y - 8f, 30f * (1f + flick), fill)
            fill.color = 0xFF3A302A.toInt()
            c.drawRect(x - 2f, y - 4f, x + 2f, y + 12f, fill)
            c.drawRect(x - 5f, y - 5f, x + 5f, y - 2f, fill)
            path.reset()
            path.moveTo(x - 4f, y - 5f)
            path.quadTo(x - 3f, y - 14f - flick * 10f, x + flick * 6f, y - 20f - flick * 8f)
            path.quadTo(x + 4f, y - 12f, x + 4f, y - 5f)
            path.close()
            fill.color = 0xFFFF8A2A.toInt()
            c.drawPath(path, fill)
            fill.color = 0xFFFFE070.toInt()
            c.drawCircle(x, y - 8f, 2.2f, fill)
            k++
        }
    }

    /** The bottomless pit: jagged spikes over darkness, with embers drifting up. */
    private fun drawPit(c: Canvas, g: Game, left: Float, right: Float) {
        val base = Game.WATER_Y.toFloat()
        fill.color = 0xFF0A0504.toInt()
        c.drawRect(left, base + 6f, right, Game.H + 2000f, fill)
        path.reset()
        path.moveTo(left, base + 12f)
        var x = kotlin.math.floor(left / 14f) * 14f
        var i = 0
        while (x <= right + 14f) {
            val h = 10f + ((i * 7919) % 5) * 3f
            path.lineTo(x, base + 12f)
            path.lineTo(x + 7f, base + 12f - h)
            x += 14f
            i++
        }
        path.lineTo(right + 14f, base + 30f)
        path.lineTo(left, base + 30f)
        path.close()
        fill.color = 0xFF2A1812.toInt()
        c.drawPath(path, fill)
        for (e in 0 until 24) {
            val ex = left + ((e * 97.3f + g.time * 7f) % (right - left + 1f))
            val life = (g.time * 0.4f + e * 0.173f) % 1f
            fill.color = 0xFFFF7A3A.toInt()
            fill.alpha = (200 * (1f - life)).toInt()
            c.drawCircle(ex + sin(g.time * 2f + e) * 4f, base + 10f - life * 90f, 1.4f, fill)
        }
        fill.alpha = 255
    }

    /** A floating portal: glowing ring, orbiting motes, brighter for a moment after something passes. */
    private fun drawGate(c: Canvas, g: Game, gate: Gate) {
        val fading = gate.turnsLeft <= 1 && sin(g.time * 10f) > 0f
        val a = if (fading) 0.45f else 1f
        val hh = gate.halfHeight
        val pulse = 1f + 0.06f * sin(g.time * 4f + gate.id) + gate.flash * 0.3f
        fill.color = gate.effect.color
        fill.alpha = ((40 + 80 * gate.flash) * a).toInt()
        rect.set(gate.x - 18f * pulse, gate.y - hh * 1.15f * pulse, gate.x + 18f * pulse, gate.y + hh * 1.15f * pulse)
        c.drawOval(rect, fill)
        fill.color = 0xFF0A0610.toInt()
        fill.alpha = (200 * a).toInt()
        rect.set(gate.x - 8f, gate.y - hh, gate.x + 8f, gate.y + hh)
        c.drawOval(rect, fill)
        stroke.color = gate.effect.color
        stroke.alpha = (255 * a).toInt()
        stroke.strokeWidth = 3f
        c.drawOval(rect, stroke)
        fill.color = gate.effect.color
        for (i in 0 until 6) {
            val t = g.time * 2.5f + i * PI.toFloat() / 3f
            fill.alpha = (200 * a).toInt()
            c.drawCircle(gate.x + cos(t) * 5f, gate.y + sin(t) * (hh - 6f), 1.4f, fill)
        }
        fill.alpha = 255
        stroke.alpha = 255
    }

    private fun drawBox(c: Canvas, g: Game, b: LootBox) {
        val col = when (b.tier) {
            0 -> 0xFFCD7F32.toInt()
            1 -> 0xFFC8D0DA.toInt()
            else -> 0xFFFFD34A.toInt()
        }
        val glow = 0.5f + 0.5f * sin(g.time * 5f + b.x)
        fill.color = col
        fill.alpha = (60 + 60 * glow).toInt()
        c.drawCircle(b.x, b.y, 14f, fill)
        fill.alpha = 255
        rect.set(b.x - 7f, b.y - 6f, b.x + 7f, b.y + 6f)
        c.drawRoundRect(rect, 1.5f, 1.5f, fill)
        fill.color = 0xFF3A2A1A.toInt()
        c.drawRect(b.x - 7f, b.y - 1.5f, b.x + 7f, b.y - 0.5f, fill)
        c.drawRect(b.x - 1.5f, b.y - 6f, b.x + 1.5f, b.y + 6f, fill)
        fill.color = 0xFFFFFFFF.toInt()
        c.drawCircle(b.x - 4f, b.y - 3.5f, 0.9f, fill)
        if (!b.landed) {
            // A little parachute while it drops in.
            stroke.color = 0xAAE8E2D0.toInt()
            stroke.strokeWidth = 0.8f
            c.drawLine(b.x - 7f, b.y - 6f, b.x - 10f, b.y - 18f, stroke)
            c.drawLine(b.x + 7f, b.y - 6f, b.x + 10f, b.y - 18f, stroke)
            fill.color = 0xFFD63A3A.toInt()
            rect.set(b.x - 13f, b.y - 26f, b.x + 13f, b.y - 12f)
            c.drawArc(rect, 180f, 180f, true, fill)
        }
    }

    private fun drawWorm(c: Canvas, g: Game, w: Worm) {
        if (w.drowned) return
        val x = w.x
        val y = w.y
        if (!w.alive) {
            // Skull and crossbones where the fighter fell.
            stroke.color = 0xFFE8E2D0.toInt()
            stroke.strokeWidth = 2f
            c.drawLine(x - 6f, y + 3f, x + 6f, y + 9f, stroke)
            c.drawLine(x + 6f, y + 3f, x - 6f, y + 9f, stroke)
            fill.color = 0xFFE8E2D0.toInt()
            c.drawCircle(x, y, 5.5f, fill)
            c.drawRect(x - 3f, y + 3f, x + 3f, y + 6.5f, fill)
            fill.color = 0xFF1A1210.toInt()
            c.drawCircle(x - 2f, y - 0.5f, 1.5f, fill)
            c.drawCircle(x + 2f, y - 0.5f, 1.5f, fill)
            return
        }
        val isActive = w === g.active && g.phase != Phase.GAME_OVER
        val bob = if (w.onGround) sin(g.time * 4f + x) * 0.5f else 0f

        // Team-coloured glow on the ground marks whose side each fighter is on.
        fill.color = TEAM_COLORS[w.team]
        fill.alpha = 150
        rect.set(x - 10f, y + 7.5f, x + 10f, y + 11f)
        c.drawOval(rect, fill)
        fill.alpha = 255

        art.draw(c, w.species, x, y + bob, w.facing.toFloat(), g.time, !w.onGround)

        // What it is holding while it takes aim.
        val held = g.weapon.action in listOf(Action.ARC, Action.FUSE, Action.BOLT) ||
            g.weapon == Weapon.CLUB || g.weapon == Weapon.SHIELD_BASH
        if (isActive && g.phase == Phase.PLAYING && held) {
            val hx = x + cos(g.aimAngle) * 11f
            val hy = y + sin(g.aimAngle) * 11f
            c.save()
            c.translate(hx, hy)
            c.rotate((g.aimAngle * 180 / PI).toFloat())
            drawThrowable(c, g.weapon)
            c.restore()
        }
    }

    /** Small in-hand version of each weapon, centred on the origin. */
    private fun drawThrowable(c: Canvas, w: Weapon) {
        when (w) {
            Weapon.HOB_LOBBER -> {
                fill.color = 0xFF2A2A30.toInt()
                c.drawCircle(0f, 0f, 3.6f, fill)
                fill.color = 0xFF8A6A4A.toInt()
                c.drawRect(-0.5f, -5.5f, 0.5f, -3f, fill)
                fill.color = 0xFFFFC04A.toInt()
                c.drawCircle(0f, -6f, 1f, fill)
            }
            Weapon.POTION_BOMB -> {
                fill.color = 0xFFE05AA0.toInt()
                c.drawCircle(0f, 1f, 3.4f, fill)
                fill.color = 0xFFB0C8D0.toInt()
                c.drawRect(-1f, -4.5f, 1f, -2f, fill)
                fill.color = 0xFFFFFFFF.toInt()
                c.drawCircle(-1.2f, 0f, 0.8f, fill)
            }
            Weapon.SCATTER -> {
                fill.color = 0xFF8A6A4A.toInt()
                rect.set(-4f, -3f, 4f, 4f)
                c.drawOval(rect, fill)
                fill.color = 0xFF5A4030.toInt()
                c.drawRect(-1.5f, -4.5f, 1.5f, -2.5f, fill)
                fill.color = 0xFF2A2A30.toInt()
                c.drawCircle(-1.3f, 1f, 1.1f, fill)
                c.drawCircle(1.5f, 1.5f, 1.1f, fill)
            }
            Weapon.MISSILE -> {
                fill.color = 0x55C08AFF
                c.drawCircle(0f, 0f, 5.5f, fill)
                fill.color = 0xFFD8B8FF.toInt()
                c.drawCircle(0f, 0f, 2.6f, fill)
            }
            Weapon.KICK -> {
                fill.color = 0xFFE8B894.toInt()
                rect.set(-4.5f, -2f, 4.5f, 2.5f)
                c.drawOval(rect, fill)
                c.drawRect(-4.5f, -6f, -1.5f, 0f, fill)
            }
            Weapon.SATCHEL -> {
                fill.color = 0xFF7A5634.toInt()
                rect.set(-4f, -3f, 4f, 4f)
                c.drawRoundRect(rect, 1.5f, 1.5f, fill)
                fill.color = 0xFF5A4030.toInt()
                c.drawRect(-4f, -3f, 4f, -1f, fill)
                fill.color = 0xFFFF4A4A.toInt()
                c.drawCircle(3f, -4f, 1f, fill)
            }
            Weapon.BITE -> {
                fill.color = 0xFF8A2A3A.toInt()
                rect.set(-5f, -3.5f, 5f, 3.5f)
                c.drawOval(rect, fill)
                fill.color = 0xFFF4F0E0.toInt()
                for (i in -2..1) {
                    path.reset()
                    path.moveTo(i * 2f, -3f); path.lineTo(i * 2f + 2f, -3f); path.lineTo(i * 2f + 1f, -0.5f); path.close()
                    c.drawPath(path, fill)
                    path.reset()
                    path.moveTo(i * 2f, 3f); path.lineTo(i * 2f + 2f, 3f); path.lineTo(i * 2f + 1f, 0.5f); path.close()
                    c.drawPath(path, fill)
                }
            }
            Weapon.POUNCE -> {
                fill.color = 0xFF5E8A4E.toInt()
                c.drawCircle(0f, 1.5f, 2.8f, fill)
                for (i in -1..1) c.drawCircle(i * 2.6f, -2.5f + kotlin.math.abs(i) * 0.8f, 1.2f, fill)
            }
            Weapon.ROAR -> {
                stroke.color = 0xFFFFE0A0.toInt()
                stroke.strokeWidth = 1f
                for (k in 1..3) {
                    rect.set(-k * 1.8f, -k * 1.8f, k * 1.8f, k * 1.8f)
                    c.drawArc(rect, -45f, 90f, false, stroke)
                }
                fill.color = 0xFFFFE0A0.toInt()
                c.drawCircle(-1f, 0f, 1.2f, fill)
            }
            Weapon.KNIFE -> {
                fill.color = 0xFFC8CCD4.toInt()
                path.reset()
                path.moveTo(-1f, -1.2f); path.lineTo(6f, 0f); path.lineTo(-1f, 1.2f); path.close()
                c.drawPath(path, fill)
                fill.color = 0xFF6A4A2E.toInt()
                c.drawRect(-4.5f, -1f, -1f, 1f, fill)
            }
            Weapon.SPEAR -> {
                fill.color = 0xFF8A6A4A.toInt()
                c.drawRect(-8f, -0.6f, 5f, 0.6f, fill)
                fill.color = 0xFFC8CCD4.toInt()
                path.reset()
                path.moveTo(5f, -1.8f); path.lineTo(9f, 0f); path.lineTo(5f, 1.8f); path.close()
                c.drawPath(path, fill)
            }
            Weapon.SHIELD_BASH -> {
                fill.color = 0xFF6E747C.toInt()
                c.drawCircle(0f, 0f, 4.5f, fill)
                fill.color = 0xFF7A5634.toInt()
                c.drawCircle(0f, 0f, 3.5f, fill)
                fill.color = 0xFF9AA0A8.toInt()
                c.drawCircle(0f, 0f, 1.2f, fill)
            }
            Weapon.BOULDER -> {
                fill.color = 0xFF8A8578.toInt()
                c.drawCircle(0f, 0f, 5f, fill)
                fill.color = 0xFF6A665C.toInt()
                c.drawCircle(1.5f, 1.2f, 1.6f, fill)
                c.drawCircle(-2f, -1.5f, 1f, fill)
            }
            Weapon.CLUB -> {
                fill.color = 0xFF7A5634.toInt()
                c.drawRect(-5f, -0.9f, 1f, 0.9f, fill)
                rect.set(0f, -2.5f, 7f, 2.5f)
                c.drawOval(rect, fill)
            }
            Weapon.SLAM -> {
                fill.color = 0xFFFFE0A0.toInt()
                path.reset()
                for (k in 0 until 10) {
                    val a = k * PI.toFloat() / 5f
                    val rr = if (k % 2 == 0) 5f else 2.2f
                    if (k == 0) path.moveTo(cos(a) * rr, sin(a) * rr) else path.lineTo(cos(a) * rr, sin(a) * rr)
                }
                path.close()
                c.drawPath(path, fill)
            }
        }
    }

    private fun drawProjectile(c: Canvas, p: Projectile) {
        c.save()
        c.translate(p.x, p.y)
        if (p.healing) {
            fill.color = 0x557AFF9A
            c.drawCircle(0f, 0f, 9f, fill)
        }
        if (p.power != 1f) {
            val k = kotlin.math.sqrt(p.power).coerceIn(0.6f, 2.2f)
            c.scale(k, k)
            if (p.power > 1.3f) {
                fill.color = 0x44FF9A3A
                c.drawCircle(0f, 0f, 7f, fill)
            }
        }
        val heading = (atan2(p.vy, p.vx) * 180 / PI).toFloat()
        when (p.kind) {
            Kind.KNIFE -> {
                c.rotate(heading)
                drawThrowable(c, Weapon.KNIFE)
            }
            Kind.SPEAR -> {
                c.rotate(heading)
                drawThrowable(c, Weapon.SPEAR)
            }
            Kind.BOULDER -> {
                c.rotate(p.age * 300f)
                drawThrowable(c, Weapon.BOULDER)
            }
            Kind.BOLT -> {
                fill.color = 0x55C08AFF
                c.drawCircle(0f, 0f, 7f, fill)
                fill.color = 0xFFD8B8FF.toInt()
                c.drawCircle(0f, 0f, 3f, fill)
                fill.color = 0xFFFFFFFF.toInt()
                c.drawCircle(0f, 0f, 1.4f, fill)
            }
            Kind.LOBBER -> {
                c.rotate(p.age * 400f)
                drawThrowable(c, Weapon.HOB_LOBBER)
            }
            Kind.POTION -> {
                c.rotate(p.age * 300f)
                drawThrowable(c, Weapon.POTION_BOMB)
            }
            Kind.SCATTER -> drawThrowable(c, Weapon.SCATTER)
            Kind.SHARD -> {
                fill.color = 0xFF2A2A30.toInt()
                c.drawCircle(0f, 0f, 2.2f, fill)
                fill.color = 0xFFFFC04A.toInt()
                c.drawCircle(0f, -2.6f, 0.7f, fill)
            }
            Kind.SATCHEL -> {
                fill.color = 0x44FF4A1A
                c.drawCircle(0f, -4f, 9f, fill)
                drawThrowable(c, Weapon.SATCHEL)
            }
        }
        c.restore()
    }

    private fun drawParticles(c: Canvas, g: Game) {
        for (p in g.particles) {
            val f = (p.life / p.maxLife).coerceIn(0f, 1f)
            when (p.kind) {
                PKind.FIRE -> {
                    fill.color = p.color
                    fill.alpha = (255 * f).toInt()
                    c.drawCircle(p.x, p.y, p.size * (0.4f + 0.6f * f), fill)
                }
                PKind.SMOKE -> {
                    fill.color = p.color
                    fill.alpha = (130 * f).toInt()
                    c.drawCircle(p.x, p.y, p.size * (1.6f - f), fill)
                }
                PKind.RING -> {
                    stroke.color = p.color
                    stroke.alpha = (255 * f).toInt()
                    stroke.strokeWidth = 3f
                    c.drawCircle(p.x, p.y, p.size * (0.3f + 0.9f * (1f - f)), stroke)
                }
                else -> {
                    fill.color = p.color
                    fill.alpha = (255 * min(1f, f * 2f)).toInt()
                    c.drawRect(p.x - p.size / 2, p.y - p.size / 2, p.x + p.size / 2, p.y + p.size / 2, fill)
                }
            }
        }
        fill.alpha = 255
        stroke.alpha = 255
    }

    private fun drawAim(c: Canvas, g: Game) {
        if (g.phase != Phase.PLAYING || !g.aiming) return
        val w = g.active
        val action = g.weapon.action
        if (action == Action.ROAR || action == Action.SLAM) {
            stroke.color = TEAM_COLORS[g.team]
            stroke.strokeWidth = 1.5f
            stroke.alpha = 160
            c.drawCircle(w.x, w.y, g.weapon.radius, stroke)
            stroke.alpha = 255
            return
        }
        if (action == Action.DROP) return
        val dx = cos(g.aimAngle)
        val dy = sin(g.aimAngle)
        val color = TEAM_COLORS[g.team]
        // Crosshair
        val reach = if (action == Action.MELEE) 20f else 48f
        val cx = w.x + dx * reach
        val cy = w.y + dy * reach
        stroke.color = color
        stroke.strokeWidth = 2f
        c.drawCircle(cx, cy, 6f, stroke)
        c.drawLine(cx - 9f, cy, cx - 3f, cy, stroke)
        c.drawLine(cx + 3f, cy, cx + 9f, cy, stroke)
        c.drawLine(cx, cy - 9f, cx, cy - 3f, stroke)
        c.drawLine(cx, cy + 3f, cx, cy + 9f, stroke)
        // Trajectory dots (no wind, first part only)
        val n = g.previewPath(preview)
        fill.color = 0xFFFFFFFF.toInt()
        for (i in 0 until n) {
            fill.alpha = 220 - i * 200 / max(1, n)
            c.drawCircle(preview[i * 2], preview[i * 2 + 1], 2.2f, fill)
        }
        fill.alpha = 255
    }

    // ------------------------------------------------------------------ HUD

    private fun drawLabels(c: Canvas, g: Game) {
        for (w in g.worms) {
            if (!w.alive) continue
            val x = sx(w.x)
            val y = sy(w.y - 22f)
            val col = TEAM_COLORS[w.team]
            text.textSize = 12 * dp
            val hp = w.hp.toString()
            val tw = text.measureText(hp) + 10 * dp
            rect.set(x - tw / 2, y - 14 * dp, x + tw / 2, y + 2 * dp)
            fill.color = 0xCC140A30.toInt()
            c.drawRoundRect(rect, 4 * dp, 4 * dp, fill)
            text.color = col
            c.drawText(hp, x, y - 2 * dp, text)
            text.textSize = 11 * dp
            text.color = 0xFFFFFFFF.toInt()
            c.drawText(w.name, x, y - 18 * dp, text)
        }
        // Bouncing arrow over the worm whose turn it is.
        if ((g.phase == Phase.BANNER || g.phase == Phase.PLAYING) && !g.aiming) {
            val w = g.active
            val ax = sx(w.x)
            val ay = sy(w.y - 22f) - 40 * dp + sin(g.time * 6f) * 5 * dp
            path.reset()
            path.moveTo(ax - 9 * dp, ay - 10 * dp)
            path.lineTo(ax + 9 * dp, ay - 10 * dp)
            path.lineTo(ax, ay)
            path.close()
            fill.color = TEAM_COLORS[g.team]
            c.drawPath(path, fill)
        }
        for (gate in g.gates) {
            text.textSize = 15 * dp
            text.color = gate.effect.color
            shadowText(c, gate.effect.label, sx(gate.x), sy(gate.y - gate.halfHeight) - 8 * dp)
        }
        for (p in g.projectiles) {
            if (g.bounces(p.kind)) {
                text.textSize = 12 * dp
                text.color = 0xFFFFFFFF.toInt()
                c.drawText(ceil(p.fuse).toInt().toString(), sx(p.x), sy(p.y) - 14 * dp, text)
            }
        }
        for (t in g.texts) {
            text.textSize = 16 * dp
            text.color = if (t.team >= 0) TEAM_COLORS[t.team] else 0xFFFFFFFF.toInt()
            text.alpha = (255 * min(1f, t.life * 2f)).toInt()
            shadowText(c, t.text, sx(t.x), sy(t.y))
        }
        text.alpha = 255
    }

    private fun drawHud(c: Canvas, g: Game) {
        val m = 16 * dp
        // Team panels
        for (t in 0..1) {
            val top = m + t * 36 * dp
            rect.set(m, top, m + 250 * dp, top + 30 * dp)
            fill.color = 0xAA140A30.toInt()
            c.drawRoundRect(rect, 8 * dp, 8 * dp, fill)
            if (t == g.team && g.phase != Phase.GAME_OVER) {
                stroke.color = TEAM_COLORS[t]
                stroke.strokeWidth = 2 * dp
                c.drawRoundRect(rect, 8 * dp, 8 * dp, stroke)
            }
            text.textAlign = Paint.Align.LEFT
            text.textSize = 12 * dp
            text.color = TEAM_COLORS[t]
            val label = Game.TEAM_NAMES[t] + if (g.isCpu(t)) " (CPU)" else ""
            c.drawText(label, m + 8 * dp, top + 19 * dp, text)
            text.textAlign = Paint.Align.CENTER
            val barL = m + 150 * dp
            val barR = m + 240 * dp
            fill.color = 0x55FFFFFF
            c.drawRect(barL, top + 11 * dp, barR, top + 19 * dp, fill)
            fill.color = TEAM_COLORS[t]
            val frac = g.teamHp(t) / g.teamMaxHp(t).toFloat()
            c.drawRect(barL, top + 11 * dp, barL + (barR - barL) * frac, top + 19 * dp, fill)
        }

        // Turn timer
        if (g.phase != Phase.GAME_OVER) {
            val tx = vw / 2
            val ty = m + 24 * dp
            fill.color = if (g.phase == Phase.RETREAT) 0xFFFFC04A.toInt() else TEAM_COLORS[g.team]
            c.drawCircle(tx, ty, 24 * dp, fill)
            text.textSize = 20 * dp
            text.color = 0xFF140A30.toInt()
            val secs = if (g.phase == Phase.PLAYING || g.phase == Phase.RETREAT) ceil(max(0f, g.turnTime)).toInt() else Game.TURN_TIME.toInt()
            c.drawText(secs.toString(), tx, ty + 7 * dp, text)
        }
        text.textSize = 11 * dp
        text.color = 0xFFFF6A6A.toInt()
        shadowText(c, "\u25CF LIVE  ${formatViewers(shownViewers)} viewers", vw / 2, m + 64 * dp)

        // Wind
        fill.color = 0xAA140A30.toInt()
        c.drawRoundRect(windBox, 8 * dp, 8 * dp, fill)
        text.textSize = 10 * dp
        text.color = 0xFFFFFFFF.toInt()
        c.drawText("WIND", windBox.centerX(), windBox.top + 14 * dp, text)
        val mid = windBox.centerX()
        val barY = windBox.top + 26 * dp
        val half = windBox.width() / 2 - 12 * dp
        fill.color = 0x44FFFFFF
        c.drawRect(mid - half, barY - 4 * dp, mid + half, barY + 4 * dp, fill)
        val wl = g.wind / Game.MAX_WIND * half
        fill.color = 0xFF7FE8FF.toInt()
        c.drawRect(min(mid, mid + wl), barY - 4 * dp, max(mid, mid + wl), barY + 4 * dp, fill)
        if (kotlin.math.abs(wl) > 2 * dp) {
            path.reset()
            val tip = mid + wl + (if (wl > 0) 7 * dp else -7 * dp)
            path.moveTo(tip, barY)
            path.lineTo(mid + wl, barY - 7 * dp)
            path.lineTo(mid + wl, barY + 7 * dp)
            path.close()
            c.drawPath(path, fill)
        }

        // Pause
        fill.color = 0xAA140A30.toInt()
        c.drawRoundRect(btnPause, 8 * dp, 8 * dp, fill)
        fill.color = 0xFFFFFFFF.toInt()
        c.drawRect(btnPause.centerX() - 7 * dp, btnPause.centerY() - 9 * dp, btnPause.centerX() - 3 * dp, btnPause.centerY() + 9 * dp, fill)
        c.drawRect(btnPause.centerX() + 3 * dp, btnPause.centerY() - 9 * dp, btnPause.centerX() + 7 * dp, btnPause.centerY() + 9 * dp, fill)

        drawSoundButton(c)

        // Zoom
        fill.color = 0xAA140A30.toInt()
        c.drawCircle(btnZoom.centerX(), btnZoom.centerY(), btnZoom.width() / 2, fill)
        stroke.color = 0xFFFFFFFF.toInt()
        stroke.strokeWidth = 3 * dp
        c.drawCircle(btnZoom.centerX() - 3 * dp, btnZoom.centerY() - 3 * dp, 9 * dp, stroke)
        c.drawLine(btnZoom.centerX() + 4 * dp, btnZoom.centerY() + 4 * dp, btnZoom.centerX() + 11 * dp, btnZoom.centerY() + 11 * dp, stroke)
        stroke.strokeWidth = 2 * dp
        c.drawLine(btnZoom.centerX() - 7 * dp, btnZoom.centerY() - 3 * dp, btnZoom.centerX() + 1 * dp, btnZoom.centerY() - 3 * dp, stroke)
        if (!zoomedOut) c.drawLine(btnZoom.centerX() - 3 * dp, btnZoom.centerY() - 7 * dp, btnZoom.centerX() - 3 * dp, btnZoom.centerY() + 1 * dp, stroke)

        val human = g.humanTurn && g.phase != Phase.GAME_OVER
        if (human) {
            drawControlButton(c, btnLeft, roles.containsValue(ROLE_LEFT)) { cx, cy, s -> arrow(c, cx, cy, s, -1f) }
            drawControlButton(c, btnRight, roles.containsValue(ROLE_RIGHT)) { cx, cy, s -> arrow(c, cx, cy, s, 1f) }
            drawControlButton(c, btnJump, roles.containsValue(ROLE_JUMP)) { cx, cy, s ->
                path.reset()
                path.moveTo(cx, cy - s)
                path.lineTo(cx + s, cy + s * 0.2f)
                path.lineTo(cx - s, cy + s * 0.2f)
                path.close()
                c.drawPath(path, fill)
                text.textSize = 11 * dp
                text.color = 0xFFFFFFFF.toInt()
                c.drawText("JUMP", cx, cy + s * 1.1f, text)
            }
            drawWeaponButton(c, g)
            if (pickerOpen) drawPicker(c, g)
        }

        // Power meter and slingshot band while dragging.
        if (human && g.aiming && g.phase == Phase.PLAYING) {
            stroke.color = 0x88FFFFFF.toInt()
            stroke.strokeWidth = 2 * dp
            c.drawLine(aimStartX, aimStartY, aimCurX, aimCurY, stroke)
            fill.color = 0x88FFFFFF.toInt()
            c.drawCircle(aimStartX, aimStartY, 6 * dp, fill)
            val bw = 220 * dp
            val bx = vw / 2 - bw / 2
            val by = vh - 40 * dp
            fill.color = 0xAA140A30.toInt()
            rect.set(bx - 4 * dp, by - 4 * dp, bx + bw + 4 * dp, by + 16 * dp)
            c.drawRoundRect(rect, 6 * dp, 6 * dp, fill)
            val p = if (g.weapon.usesPower) g.aimPower else if (g.aimPower > 0.04f) 1f else 0f
            fill.color = blend(0xFF8BE04E.toInt(), 0xFFFF5A5A.toInt(), p)
            c.drawRect(bx, by, bx + bw * p, by + 12 * dp, fill)
        }

        // Hints
        text.textSize = 13 * dp
        text.color = 0xFFFFFFFF.toInt()
        val hint = when {
            g.phase == Phase.GAME_OVER -> null
            !g.humanTurn -> "The dungeon is taking aim..."
            g.phase == Phase.PLAYING && !g.aiming && !pickerOpen ->
                when (g.weapon.action) {
                    Action.DROP -> "Drag and release to drop the ${g.weapon.label.lowercase()}, then run!"
                    Action.MELEE -> "Get close, drag back and release: ${g.weapon.label}"
                    Action.POUNCE -> "Drag back and release to pounce"
                    Action.ROAR, Action.SLAM -> "Drag and release: ${g.weapon.label} hits everyone in the circle"
                    else -> "Drag back anywhere and release to fire"
                }
            g.phase == Phase.RETREAT -> "Retreat!"
            else -> null
        }
        if (hint != null) shadowText(c, hint, vw / 2, vh - 22 * dp - if (g.aiming) 30 * dp else 0f)

        // Turn banner
        if (g.phase == Phase.BANNER) {
            val a = min(1f, min(g.phaseTime * 4f, (1.3f - g.phaseTime) * 4f)).coerceIn(0f, 1f)
            text.textSize = 30 * dp
            text.color = TEAM_COLORS[g.team]
            text.alpha = (255 * a).toInt()
            shadowText(c, "${Game.TEAM_NAMES[g.team]}: ${g.active.name}", vw / 2, vh * 0.3f)
            text.textSize = 14 * dp
            text.color = 0xFFFFFFFF.toInt()
            text.alpha = (255 * a).toInt()
            shadowText(c, if (g.humanTurn) "Your move, crawler" else "The dungeon's move", vw / 2, vh * 0.3f + 26 * dp)
            text.textSize = 12 * dp
            text.color = 0xFFFFD34A.toInt()
            text.alpha = (255 * a).toInt()
            shadowText(c, g.active.species.trait, vw / 2, vh * 0.3f + 46 * dp)
            text.alpha = 255
        }

        drawAnnouncement(c, g)

        if (g.phase == Phase.GAME_OVER) {
            fill.color = 0xAA0A0518.toInt()
            c.drawRect(0f, 0f, vw, vh, fill)
            text.textSize = 40 * dp
            text.color = if (g.winner >= 0) TEAM_COLORS[g.winner] else 0xFFFFFFFF.toInt()
            val msg = when {
                g.winner < 0 -> "It's a draw!"
                g.mode == Mode.VS_CPU && g.winner == 0 -> "Floor cleared!"
                g.mode == Mode.VS_CPU -> "The dungeon wins"
                else -> "${Game.TEAM_NAMES[g.winner]} wins!"
            }
            shadowText(c, msg, vw / 2, vh * 0.4f)
            drawMenuButton(c, btnAgain, "PLAY AGAIN", 0xFF8BE04E.toInt())
            drawMenuButton(c, btnToMenu, "MENU", 0xFFFFFFFF.toInt())
        }
    }

    private inline fun drawControlButton(c: Canvas, r: RectF, pressed: Boolean, icon: (Float, Float, Float) -> Unit) {
        fill.color = if (pressed) 0x99FFFFFF.toInt() else 0x55140A30
        c.drawCircle(r.centerX(), r.centerY(), r.width() / 2, fill)
        stroke.color = 0xAAFFFFFF.toInt()
        stroke.strokeWidth = 2 * dp
        c.drawCircle(r.centerX(), r.centerY(), r.width() / 2, stroke)
        fill.color = 0xFFFFFFFF.toInt()
        icon(r.centerX(), r.centerY() - if (r === btnJump) 6 * dp else 0f, 12 * dp)
    }

    private fun arrow(c: Canvas, cx: Float, cy: Float, s: Float, dir: Float) {
        path.reset()
        path.moveTo(cx + dir * s, cy)
        path.lineTo(cx - dir * s * 0.6f, cy - s)
        path.lineTo(cx - dir * s * 0.6f, cy + s)
        path.close()
        c.drawPath(path, fill)
    }

    private fun drawWeaponButton(c: Canvas, g: Game) {
        fill.color = 0xCC140A30.toInt()
        c.drawRoundRect(btnWeapon, 12 * dp, 12 * dp, fill)
        stroke.color = TEAM_COLORS[g.team]
        stroke.strokeWidth = 2 * dp
        c.drawRoundRect(btnWeapon, 12 * dp, 12 * dp, stroke)
        drawWeaponRow(c, btnWeapon, g.weapon, g.ammoLeft(g.weapon), true)
    }

    private fun drawPicker(c: Canvas, g: Game) {
        for ((i, w) in g.loadout.withIndex()) {
            val r = pickerRows[i]
            val left = g.ammoLeft(w)
            fill.color = if (w == g.weapon) 0xEE3A2160.toInt() else 0xEE140A30.toInt()
            c.drawRoundRect(r, 10 * dp, 10 * dp, fill)
            if (left == 0) {
                fill.color = 0x88000000.toInt()
                c.drawRoundRect(r, 10 * dp, 10 * dp, fill)
            }
            drawWeaponRow(c, r, w, left, false)
        }
    }

    private fun drawWeaponRow(c: Canvas, r: RectF, w: Weapon, ammo: Int, hint: Boolean) {
        val ix = r.left + 26 * dp
        val iy = r.centerY()
        drawWeaponIcon(c, w, ix, iy, 1.6f * dp)
        text.textAlign = Paint.Align.LEFT
        text.textSize = 15 * dp
        text.color = 0xFFFFFFFF.toInt()
        c.drawText(w.label, r.left + 50 * dp, iy + (if (hint) 0f else 5 * dp), text)
        if (hint) {
            text.textSize = 10 * dp
            text.color = 0xAAFFFFFF.toInt()
            c.drawText("tap to change", r.left + 50 * dp, iy + 15 * dp, text)
        }
        text.textAlign = Paint.Align.RIGHT
        text.textSize = 14 * dp
        text.color = 0xFFFFC04A.toInt()
        c.drawText(if (ammo < 0) "∞" else "x$ammo", r.right - 12 * dp, iy + 5 * dp, text)
        text.textAlign = Paint.Align.CENTER
    }

    private fun drawWeaponIcon(c: Canvas, w: Weapon, x: Float, y: Float, s: Float) {
        c.save()
        c.translate(x, y)
        c.scale(s * 1.7f, s * 1.7f)
        drawThrowable(c, w)
        c.restore()
    }

    private fun drawSoundButton(c: Canvas) {
        fill.color = 0xAA140A30.toInt()
        c.drawRoundRect(btnSound, 8 * dp, 8 * dp, fill)
        val cx = btnSound.centerX() - 4 * dp
        val cy = btnSound.centerY()
        fill.color = 0xFFFFFFFF.toInt()
        path.reset()
        path.moveTo(cx - 8 * dp, cy - 4 * dp)
        path.lineTo(cx - 4 * dp, cy - 4 * dp)
        path.lineTo(cx + 2 * dp, cy - 10 * dp)
        path.lineTo(cx + 2 * dp, cy + 10 * dp)
        path.lineTo(cx - 4 * dp, cy + 4 * dp)
        path.lineTo(cx - 8 * dp, cy + 4 * dp)
        path.close()
        c.drawPath(path, fill)
        stroke.color = 0xFFFFFFFF.toInt()
        stroke.strokeWidth = 2 * dp
        if (sound.muted) {
            c.drawLine(cx + 6 * dp, cy - 5 * dp, cx + 14 * dp, cy + 5 * dp, stroke)
            c.drawLine(cx + 14 * dp, cy - 5 * dp, cx + 6 * dp, cy + 5 * dp, stroke)
        } else {
            rect.set(cx - 2 * dp, cy - 8 * dp, cx + 10 * dp, cy + 8 * dp)
            c.drawArc(rect, -50f, 100f, false, stroke)
            rect.set(cx - 6 * dp, cy - 12 * dp, cx + 14 * dp, cy + 12 * dp)
            c.drawArc(rect, -50f, 100f, false, stroke)
        }
    }

    /** System AI pop-up: a notification panel that slides in from the right. */
    private fun drawAnnouncement(c: Canvas, g: Game) {
        val a = g.announcement ?: return
        val age = g.announceAge
        if (age > Game.ANNOUNCE_TIME) return
        val slide = min(1f, age * 5f) * min(1f, (Game.ANNOUNCE_TIME - age) * 4f)
        val pw = min(300 * dp, vw * 0.42f)
        val pad = 12 * dp
        text.textAlign = Paint.Align.LEFT
        text.textSize = 12 * dp
        val lines = wrap(a.body, pw - pad * 2)
        val ph = 58 * dp + lines.size * 16 * dp
        val right = vw - 16 * dp + (1f - slide) * (pw + 40 * dp)
        val top = 72 * dp
        rect.set(right - pw, top, right, top + ph)
        fill.color = 0xEE0E0A14.toInt()
        c.drawRoundRect(rect, 8 * dp, 8 * dp, fill)
        stroke.color = 0xFFFFD34A.toInt()
        stroke.strokeWidth = 2 * dp
        c.drawRoundRect(rect, 8 * dp, 8 * dp, stroke)
        text.textSize = 11 * dp
        text.color = 0xFFFFD34A.toInt()
        c.drawText(a.header, rect.left + pad, top + 20 * dp, text)
        text.textSize = 16 * dp
        text.color = 0xFFFFFFFF.toInt()
        c.drawText(a.title, rect.left + pad, top + 40 * dp, text)
        text.textSize = 12 * dp
        text.color = 0xFFCFC8D8.toInt()
        for ((i, l) in lines.withIndex()) c.drawText(l, rect.left + pad, top + 60 * dp + i * 16 * dp, text)
        text.textAlign = Paint.Align.CENTER
    }

    /** Greedy word wrap using the current text paint. */
    private fun wrap(s: String, width: Float): List<String> {
        val out = ArrayList<String>()
        var line = ""
        for (word in s.split(" ")) {
            val next = if (line.isEmpty()) word else "$line $word"
            if (text.measureText(next) > width && line.isNotEmpty()) {
                out.add(line)
                line = word
            } else {
                line = next
            }
        }
        if (line.isNotEmpty()) out.add(line)
        return out
    }

    private fun formatViewers(v: Float): String =
        if (v >= 1e9f) String.format(java.util.Locale.UK, "%.2fB", v / 1e9f)
        else String.format(java.util.Locale.UK, "%.1fM", v / 1e6f)

    private fun drawMenu(c: Canvas) {
        fill.color = 0x88140A30.toInt()
        c.drawRect(0f, 0f, vw, vh, fill)
        text.textSize = 40 * dp
        text.color = 0xFFFFD34A.toInt()
        shadowText(c, "DUNGEON CRAWLER CARL", vw / 2, vh * 0.36f - 44 * dp)
        text.textSize = 14 * dp
        text.color = 0xFFFFFFFF.toInt()
        shadowText(c, "ARTILLERY EDITION  \u2022  unofficial fan game", vw / 2, vh * 0.36f - 18 * dp)

        layoutMenuButtons()
        drawSoundButton(c)
        if (!btnResume.isEmpty) drawMenuButton(c, btnResume, "RESUME", 0xFF8BE04E.toInt())
        drawMenuButton(c, btnCpu, "1 PLAYER VS CPU", 0xFFFFFFFF.toInt())
        drawMenuButton(c, btnTwo, "2 PLAYERS (PASS & PLAY)", 0xFFFFFFFF.toInt())

        text.textSize = 12 * dp
        text.color = 0xCCFFFFFF.toInt()
        shadowText(c, "Arrows walk  •  Jump  •  Drag back and release to fire  •  Tap the weapon to switch",
            vw / 2, vh - 18 * dp)
    }

    private fun drawMenuButton(c: Canvas, r: RectF, label: String, color: Int) {
        fill.color = 0xDD2A1650.toInt()
        c.drawRoundRect(r, 14 * dp, 14 * dp, fill)
        stroke.color = color
        stroke.strokeWidth = 2 * dp
        c.drawRoundRect(r, 14 * dp, 14 * dp, stroke)
        text.textSize = 18 * dp
        text.color = color
        c.drawText(label, r.centerX(), r.centerY() + 6 * dp, text)
    }

    private fun shadowText(c: Canvas, s: String, x: Float, y: Float) {
        val col = text.color
        val a = text.alpha
        text.color = 0xFF140A30.toInt()
        text.alpha = a
        c.drawText(s, x + 1.5f * dp, y + 1.5f * dp, text)
        text.color = col
        text.alpha = a
        c.drawText(s, x, y, text)
    }

    private fun blend(a: Int, b: Int, t: Float): Int {
        fun ch(c: Int, s: Int) = (c shr s) and 0xFF
        val r = (ch(a, 16) + (ch(b, 16) - ch(a, 16)) * t).toInt()
        val g = (ch(a, 8) + (ch(b, 8) - ch(a, 8)) * t).toInt()
        val bl = (ch(a, 0) + (ch(b, 0) - ch(a, 0)) * t).toInt()
        return (0xFF shl 24) or (r shl 16) or (g shl 8) or bl
    }

    /** One tile of mortared stone bricks for the back wall. */
    private fun brickTile(): Bitmap {
        val bmp = Bitmap.createBitmap(64, 32, Bitmap.Config.ARGB_8888)
        val c = Canvas(bmp)
        c.drawColor(0xFF100B09.toInt())
        val p = Paint()
        val shades = intArrayOf(0xFF2A201C.toInt(), 0xFF251C18.toInt(), 0xFF2F2420.toInt(), 0xFF221A16.toInt())
        for (row in 0..1) {
            val off = if (row == 0) 0f else -16f
            for (col in 0..2) {
                p.color = shades[(row * 3 + col) % shades.size]
                val l = off + col * 32f + 1f
                c.drawRect(l, row * 16f + 1f, l + 30f, row * 16f + 15f, p)
            }
        }
        return bmp
    }

    companion object {
        private const val ROLE_LEFT = 1
        private const val ROLE_RIGHT = 2
        private const val ROLE_JUMP = 3
        private const val ROLE_AIM = 4
        private val TEAM_COLORS = intArrayOf(0xFFFF5A5A.toInt(), 0xFF4DA6FF.toInt())
    }
}
