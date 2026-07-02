import * as THREE from 'three'
import { P } from './palette'
import { Kit, lcg } from './kit'

// Drawabox-style exercise sheets pinned above the hobby bench: wobbly
// freehand boxes with extended construction lines, tables of ghosted
// ellipses, hatched planes. Drawn once onto small canvases.

const CW = 224
const CH = 288

type Draw = (ctx: CanvasRenderingContext2D, rng: () => number) => void

function wobbly(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  extend = 0.1,
) {
  // draw-through: lines start and end a little past their endpoints
  const ex1 = x1 - (x2 - x1) * extend
  const ey1 = y1 - (y2 - y1) * extend
  const ex2 = x2 + (x2 - x1) * extend
  const ey2 = y2 + (y2 - y1) * extend
  const segs = 5
  const nx = -(ey2 - ey1)
  const ny = ex2 - ex1
  const len = Math.hypot(nx, ny) || 1
  ctx.beginPath()
  ctx.moveTo(ex1, ey1)
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    const j = i === segs ? 0 : (rng() - 0.5) * 2.4
    ctx.lineTo(ex1 + (ex2 - ex1) * t + (nx / len) * j, ey1 + (ey2 - ey1) * t + (ny / len) * j)
  }
  ctx.stroke()
}

function sheetBoxes(ctx: CanvasRenderingContext2D, rng: () => number) {
  const cube = (cx: number, cy: number, w: number, ox: number, oy: number) => {
    const f = [
      [cx - w / 2, cy - w / 2],
      [cx + w / 2, cy - w / 2],
      [cx + w / 2, cy + w / 2],
      [cx - w / 2, cy + w / 2],
    ]
    const b = f.map(([x, y]) => [x + ox, y + oy])
    for (let i = 0; i < 4; i++) {
      wobbly(ctx, rng, f[i][0], f[i][1], f[(i + 1) % 4][0], f[(i + 1) % 4][1])
      wobbly(ctx, rng, b[i][0], b[i][1], b[(i + 1) % 4][0], b[(i + 1) % 4][1])
      wobbly(ctx, rng, f[i][0], f[i][1], b[i][0], b[i][1])
    }
  }
  cube(78, 84, 62, 30, -22)
  cube(150, 200, 48, -26, 18)
  cube(66, 226, 36, 20, -14)
}

function sheetEllipses(ctx: CanvasRenderingContext2D, rng: () => number) {
  let y = 34
  for (let row = 0; row < 4; row++) {
    const h = 34 + rng() * 14
    ctx.strokeRect(24, y, CW - 48, h)
    const n = 2 + Math.floor(rng() * 2)
    const w = (CW - 48) / n
    for (let i = 0; i < n; i++) {
      // ghosted: each ellipse drawn twice, slightly offset
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath()
        ctx.ellipse(
          24 + w * (i + 0.5) + (rng() - 0.5) * 2.5,
          y + h / 2 + (rng() - 0.5) * 2.5,
          w / 2 - 4,
          h / 2 - 4,
          0,
          0,
          Math.PI * 2,
        )
        ctx.globalAlpha = pass === 0 ? 0.45 : 0.85
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    y += h + 16
  }
}

function sheetPlanes(ctx: CanvasRenderingContext2D, rng: () => number) {
  for (let i = 0; i < 5; i++) {
    const x = 26 + rng() * (CW - 110)
    const y = 30 + i * 48 + rng() * 10
    const w = 58 + rng() * 26
    const h = 30 + rng() * 14
    const sk = (rng() - 0.5) * 18
    const q = [
      [x + sk, y],
      [x + w + sk, y + (rng() - 0.5) * 8],
      [x + w, y + h],
      [x, y + h + (rng() - 0.5) * 8],
    ]
    for (let k = 0; k < 4; k++) wobbly(ctx, rng, q[k][0], q[k][1], q[(k + 1) % 4][0], q[(k + 1) % 4][1])
    wobbly(ctx, rng, q[0][0], q[0][1], q[2][0], q[2][1], 0.02)
    wobbly(ctx, rng, q[1][0], q[1][1], q[3][0], q[3][1], 0.02)
  }
}

function makeSheetTexture(kit: Kit, draw: Draw, seed: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = CW
  canvas.height = CH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = P.paper
  ctx.fillRect(0, 0, CW, CH)
  // soft edge shading so the sheet reads as paper, not a white hole
  ctx.strokeStyle = 'rgba(74,66,56,0.25)'
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, CW - 3, CH - 3)
  ctx.strokeStyle = P.graphite
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.85
  draw(ctx, lcg(seed))
  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  return kit.track(texture)
}

/** three pinned sheets on the side wall (inner face at x = wallX) */
export function buildWallArt(kit: Kit, parent: THREE.Object3D, wallX: number) {
  const sheets: Array<{ draw: Draw; seed: number; y: number; z: number; tilt: number }> = [
    { draw: sheetBoxes, seed: 7, y: 1.64, z: 0.02, tilt: 0.03 },
    { draw: sheetEllipses, seed: 21, y: 1.52, z: 0.47, tilt: -0.04 },
    { draw: sheetPlanes, seed: 33, y: 1.68, z: 0.92, tilt: 0.02 },
  ]
  for (const sh of sheets) {
    const texture = makeSheetTexture(kit, sh.draw, sh.seed)
    const mat = kit.track(new THREE.MeshBasicMaterial({ map: texture }))
    const plane = kit.mesh(parent, new THREE.PlaneGeometry(0.34, 0.44), mat, wallX + 0.004, sh.y, sh.z)
    plane.rotation.y = Math.PI / 2
    plane.rotation.z = sh.tilt
    // oxblood pin
    kit.box(parent, 0.016, 0.016, 0.014, P.oxblood, wallX + 0.012, sh.y + 0.2, sh.z)
  }
}
