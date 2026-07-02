import * as THREE from 'three'
import { P } from './palette'
import { lcg } from './kit'

// The monitor runs an endless game of pong on a CanvasTexture — a nod to
// game #01. Simulated at 60hz, redrawn at ~30hz to keep texture uploads cheap.

const W = 288
const H = 176
const PADDLE_H = 36
const PADDLE_W = 8
const BALL = 9

interface PongState {
  bx: number
  by: number
  vx: number
  vy: number
  p1: number
  p2: number
  s1: number
  s2: number
}

export interface PongScreen {
  texture: THREE.CanvasTexture
  update(dt: number): void
  dispose(): void
}

export function createPongScreen(reducedMotion: boolean): PongScreen {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const rng = lcg(42)

  const s: PongState = { bx: W / 2, by: H / 2, vx: 74, vy: 46, p1: H / 2, p2: H / 2, s1: 2, s2: 1 }

  function draw() {
    ctx.fillStyle = P.pongBg
    ctx.fillRect(0, 0, W, H)
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
    ctx.fillRect(s.bx - BALL / 2, s.by - BALL / 2, BALL, BALL)
    texture.needsUpdate = true
  }

  function serve(toLeft: boolean) {
    s.bx = W / 2
    s.by = H * (0.3 + rng() * 0.4)
    s.vx = (toLeft ? -1 : 1) * (68 + rng() * 22)
    s.vy = (rng() < 0.5 ? -1 : 1) * (34 + rng() * 30)
  }

  function step(dt: number) {
    s.bx += s.vx * dt
    s.by += s.vy * dt
    if (s.by < BALL / 2 || s.by > H - BALL / 2) {
      s.vy *= -1
      s.by = Math.max(BALL / 2, Math.min(H - BALL / 2, s.by))
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
    if (s.bx < 12 + PADDLE_W + BALL / 2 && s.vx < 0 && Math.abs(s.by - s.p1) < PADDLE_H / 2 + BALL / 2) {
      s.vx = Math.abs(s.vx) * 1.02
      s.vy += (s.by - s.p1) * 2.2
    }
    if (s.bx > W - 12 - PADDLE_W - BALL / 2 && s.vx > 0 && Math.abs(s.by - s.p2) < PADDLE_H / 2 + BALL / 2) {
      s.vx = -Math.abs(s.vx) * 1.02
      s.vy += (s.by - s.p2) * 2.2
    }
    s.vy = Math.max(-160, Math.min(160, s.vy))
    s.vx = Math.max(-220, Math.min(220, s.vx))
    // scoring
    if (s.bx < -BALL) {
      s.s2 = (s.s2 + 1) % 6
      serve(false)
    } else if (s.bx > W + BALL) {
      s.s1 = (s.s1 + 1) % 6
      serve(true)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  draw()

  let acc = 0
  let sinceDraw = 0
  function update(dt: number) {
    if (reducedMotion) return
    acc += dt
    sinceDraw += dt
    const h = 1 / 60
    let steps = 0
    while (acc >= h && steps < 8) {
      step(h)
      acc -= h
      steps++
    }
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
