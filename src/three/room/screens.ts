import * as THREE from 'three'
import { P } from './palette'
import { lcg } from './kit'

// The monitor runs an endless arcade demo on a CanvasTexture — a nod to the
// shipped games. It alternates between pong (#01) and breakout (#02): each
// round plays itself out, then the screen switches to the other game.
// Simulated at 60hz, redrawn at ~30hz to keep texture uploads cheap.

const W = 288
const H = 176

// A self-playing mini-game living on the shared canvas. `done()` reports when
// the round has run its course so the screen can swap to the next game.
interface MiniGame {
  step(dt: number): void
  draw(ctx: CanvasRenderingContext2D): void
  done(): boolean
}

export interface ArcadeScreen {
  texture: THREE.CanvasTexture
  update(dt: number): void
  dispose(): void
}

// ---- Pong (#01) --------------------------------------------------------

const PADDLE_H = 36
const PADDLE_W = 8
const PONG_BALL = 9

function createPong(seed: number): MiniGame {
  const rng = lcg(seed)
  const s = { bx: W / 2, by: H / 2, vx: 74, vy: 46, p1: H / 2, p2: H / 2, s1: 0, s2: 0 }

  function serve(toLeft: boolean) {
    s.bx = W / 2
    s.by = H * (0.3 + rng() * 0.4)
    s.vx = (toLeft ? -1 : 1) * (68 + rng() * 22)
    s.vy = (rng() < 0.5 ? -1 : 1) * (34 + rng() * 30)
  }

  return {
    step(dt) {
      s.bx += s.vx * dt
      s.by += s.vy * dt
      if (s.by < PONG_BALL / 2 || s.by > H - PONG_BALL / 2) {
        s.vy *= -1
        s.by = Math.max(PONG_BALL / 2, Math.min(H - PONG_BALL / 2, s.by))
      }
      // paddles chase the ball on their half, drift home otherwise
      const chase = (py: number, mine: boolean) => {
        const targeting = mine ? true : Math.abs(s.bx - W / 2) < W * 0.2
        const target = targeting ? s.by : H / 2
        const speed = 85
        return py + Math.max(-speed * dt, Math.min(speed * dt, target - py))
      }
      s.p1 = chase(s.p1, s.vx < 0)
      s.p2 = chase(s.p2, s.vx > 0)
      // paddle hits
      if (s.bx < 12 + PADDLE_W + PONG_BALL / 2 && s.vx < 0 && Math.abs(s.by - s.p1) < PADDLE_H / 2 + PONG_BALL / 2) {
        s.vx = Math.abs(s.vx) * 1.02
        s.vy += (s.by - s.p1) * 2.2
      }
      if (s.bx > W - 12 - PADDLE_W - PONG_BALL / 2 && s.vx > 0 && Math.abs(s.by - s.p2) < PADDLE_H / 2 + PONG_BALL / 2) {
        s.vx = -Math.abs(s.vx) * 1.02
        s.vy += (s.by - s.p2) * 2.2
      }
      s.vy = Math.max(-160, Math.min(160, s.vy))
      s.vx = Math.max(-220, Math.min(220, s.vx))
      // scoring
      if (s.bx < -PONG_BALL) {
        s.s2++
        serve(false)
      } else if (s.bx > W + PONG_BALL) {
        s.s1++
        serve(true)
      }
    },
    draw(ctx) {
      ctx.fillStyle = P.pongFg
      // center line
      ctx.globalAlpha = 0.4
      for (let y = 6; y < H; y += 18) ctx.fillRect(W / 2 - 2, y, 4, 10)
      // score pips
      for (let i = 0; i < Math.min(s.s1, 5); i++) ctx.fillRect(W / 2 - 22 - i * 12, 10, 7, 7)
      for (let i = 0; i < Math.min(s.s2, 5); i++) ctx.fillRect(W / 2 + 15 + i * 12, 10, 7, 7)
      ctx.globalAlpha = 1
      // paddles + ball
      ctx.fillRect(12, s.p1 - PADDLE_H / 2, PADDLE_W, PADDLE_H)
      ctx.fillRect(W - 12 - PADDLE_W, s.p2 - PADDLE_H / 2, PADDLE_W, PADDLE_H)
      ctx.fillRect(s.bx - PONG_BALL / 2, s.by - PONG_BALL / 2, PONG_BALL, PONG_BALL)
    },
    // first to 3 wins the round
    done: () => s.s1 >= 3 || s.s2 >= 3,
  }
}

// ---- Breakout (#02) ----------------------------------------------------

const BK_BALL = 7
const BK_PADDLE_W = 46
const BK_PADDLE_H = 7
const BK_COLS = 9
const BK_ROWS = 4
const BK_TOP = 26
const BK_GAP = 3
const BK_SIDE = 10
const BK_ROW_H = 11

interface Brick {
  x: number
  y: number
  w: number
  h: number
  alive: boolean
  color: string
}

function createBreakout(seed: number): MiniGame {
  const rng = lcg(seed)
  const bw = (W - BK_SIDE * 2 - BK_GAP * (BK_COLS - 1)) / BK_COLS
  const bricks: Brick[] = []
  for (let r = 0; r < BK_ROWS; r++) {
    for (let c = 0; c < BK_COLS; c++) {
      bricks.push({
        x: BK_SIDE + c * (bw + BK_GAP),
        y: BK_TOP + r * (BK_ROW_H + BK_GAP),
        w: bw,
        h: BK_ROW_H,
        alive: true,
        color: P.bricks[r % P.bricks.length],
      })
    }
  }

  const px = W / 2
  const py = H - 14
  const s = { bx: W / 2, by: py - 12, vx: 58 + rng() * 20, vy: -96, px }

  function alive() {
    return bricks.reduce((n, b) => n + (b.alive ? 1 : 0), 0)
  }

  return {
    step(dt) {
      // paddle tracks the ball with a capped speed (and a touch of lag)
      const target = s.bx - BK_PADDLE_W * (0.3 + rng() * 0.4)
      s.px += Math.max(-150 * dt, Math.min(150 * dt, target - s.px))
      s.px = Math.max(BK_PADDLE_W / 2, Math.min(W - BK_PADDLE_W / 2, s.px))

      s.bx += s.vx * dt
      s.by += s.vy * dt

      // walls
      if (s.bx < BK_BALL / 2) { s.bx = BK_BALL / 2; s.vx = Math.abs(s.vx) }
      if (s.bx > W - BK_BALL / 2) { s.bx = W - BK_BALL / 2; s.vx = -Math.abs(s.vx) }
      if (s.by < BK_BALL / 2) { s.by = BK_BALL / 2; s.vy = Math.abs(s.vy) }

      // paddle bounce — reflect and steer by contact point
      if (s.vy > 0 && s.by > py - BK_PADDLE_H / 2 - BK_BALL / 2 && s.by < py + BK_PADDLE_H && Math.abs(s.bx - s.px) < BK_PADDLE_W / 2 + BK_BALL / 2) {
        s.vy = -Math.abs(s.vy)
        s.vx += (s.bx - s.px) * 2.4
        s.by = py - BK_PADDLE_H / 2 - BK_BALL / 2
      }

      // dropped ball — re-serve from the paddle
      if (s.by > H + BK_BALL) {
        s.bx = s.px
        s.by = py - 12
        s.vx = (rng() < 0.5 ? -1 : 1) * (48 + rng() * 26)
        s.vy = -96
      }

      // brick collisions — bounce off the shallower penetration axis
      for (const b of bricks) {
        if (!b.alive) continue
        if (s.bx + BK_BALL / 2 < b.x || s.bx - BK_BALL / 2 > b.x + b.w) continue
        if (s.by + BK_BALL / 2 < b.y || s.by - BK_BALL / 2 > b.y + b.h) continue
        b.alive = false
        const overlapX = Math.min(s.bx + BK_BALL / 2 - b.x, b.x + b.w - (s.bx - BK_BALL / 2))
        const overlapY = Math.min(s.by + BK_BALL / 2 - b.y, b.y + b.h - (s.by - BK_BALL / 2))
        if (overlapX < overlapY) s.vx *= -1
        else s.vy *= -1
        break
      }

      s.vx = Math.max(-150, Math.min(150, s.vx))
      s.vy = Math.max(-150, Math.min(150, s.vy))
    },
    draw(ctx) {
      for (const b of bricks) {
        if (!b.alive) continue
        ctx.fillStyle = b.color
        ctx.fillRect(b.x, b.y, b.w, b.h)
      }
      ctx.fillStyle = P.pongFg
      ctx.fillRect(s.px - BK_PADDLE_W / 2, py - BK_PADDLE_H / 2, BK_PADDLE_W, BK_PADDLE_H)
      ctx.fillRect(s.bx - BK_BALL / 2, s.by - BK_BALL / 2, BK_BALL, BK_BALL)
    },
    // one brick always survives — the round ends when it's the last one standing
    done: () => alive() <= 1,
  }
}

// ---- Screen ------------------------------------------------------------

const GAME_TIME_CAP = 12 // seconds — always move on even if a round drags

export function createArcadeScreen(reducedMotion: boolean): ArcadeScreen {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const builders = [createPong, createBreakout]
  let which = 0
  let seed = 42
  let game = builders[which](seed)
  let elapsed = 0

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  function draw() {
    ctx.fillStyle = P.pongBg
    ctx.fillRect(0, 0, W, H)
    game.draw(ctx)
    texture.needsUpdate = true
  }

  function nextGame() {
    which = (which + 1) % builders.length
    seed += 1
    game = builders[which](seed)
    elapsed = 0
  }

  draw()

  let acc = 0
  let sinceDraw = 0
  function update(dt: number) {
    if (reducedMotion) return
    acc += dt
    sinceDraw += dt
    elapsed += dt
    const h = 1 / 60
    let steps = 0
    while (acc >= h && steps < 8) {
      game.step(h)
      acc -= h
      steps++
    }
    if (game.done() || elapsed >= GAME_TIME_CAP) nextGame()
    if (sinceDraw >= 1 / 30) {
      sinceDraw = 0
      draw()
    }
  }

  return {
    texture,
    update,
    dispose() {
      texture.dispose()
    },
  }
}
