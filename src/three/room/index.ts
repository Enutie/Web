import * as THREE from 'three'
import { Kit } from './kit'
import { buildStructure } from './structure'
import { buildDevDesk } from './devDesk'
import { buildHobbyDesk } from './hobbyDesk'
import { buildShelf } from './shelf'
import { buildGuitar } from './guitar'
import { buildWallArt } from './wallArt'
import { ROOM } from './structure'
import { createPongScreen } from './screens'
import { createLights, type RoomTheme } from './lights'

// The hero diorama: an isometric-ish corner of the owner's room, assembled
// from low-poly primitives. Slow bob + mouse parallax; pong plays on the
// monitor; the lighting follows the site theme (day ↔ lamplit night).
//
// Honors prefers-reduced-motion by rendering stills instead of animating,
// and pauses the render loop entirely while the hero is scrolled off-screen.

export interface RoomScene {
  setTheme(theme: RoomTheme): void
  dispose(): void
}

const BASE_ROT_Y = -Math.PI / 4 + 0.06
const BASE_ROT_X = 0.015

export function createRoomScene(
  container: HTMLElement,
  opts: { theme: RoomTheme; reducedMotion: boolean },
): RoomScene {
  const kit = new Kit()

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
  camera.position.set(0, 3.85, 5.9)
  camera.lookAt(0, 0.8, 0)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  })
  // cap by device ratio AND canvas area — a 3000px-wide hero at dpr 2 is
  // pure fill-rate waste for a slow decorative scene
  const effectiveDpr = (w: number, h: number) =>
    Math.max(1, Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2.2e6 / (w * h))))
  renderer.setPixelRatio(effectiveDpr(container.clientWidth || 1, container.clientHeight || 1))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.domElement.style.display = 'block'
  container.appendChild(renderer.domElement)

  // --- build the room ---
  const room = new THREE.Group()
  room.rotation.set(BASE_ROT_X, BASE_ROT_Y, 0)
  scene.add(room)

  const pong = createPongScreen(opts.reducedMotion)
  buildStructure(kit, room)
  const dev = buildDevDesk(kit, room, pong.texture)
  const hobby = buildHobbyDesk(kit, room)
  buildShelf(kit, room)
  buildGuitar(kit, room)
  buildWallArt(kit, room, ROOM.wallX)

  const rig = createLights(scene, room, hobby.lampLight, hobby.bulbMaterial, dev.screenPosition, opts.theme)
  rig.jumpToTarget()

  // --- placement: shift right & full-size on wide heroes; on narrow ones
  //     scale down and lift the room so the overlay text sits on dark
  //     background below it. Continuous so tablets aren't cramped. ---
  function placementTargets() {
    const a = camera.aspect
    return {
      x: Math.min(Math.max((a - 1.05) * 2.35, 0), 1.95),
      // on narrow screens lift the room decisively clear of the overlay text
      y: Math.min(Math.max((1.05 - a) * 6.5, 0), 1.15),
      // mid widths shrink harder so the bright wall clears the headline
      scale:
        a < 1.05
          ? Math.max(0.52, 0.52 + (a - 1.05) * 0.57)
          : Math.min(1, 0.52 + (a - 1.05) * 0.31),
    }
  }
  let placeY = 0
  function applyPlacementInstant() {
    const t = placementTargets()
    room.position.x = t.x
    placeY = t.y
    room.position.y = t.y
    room.scale.setScalar(t.scale)
    rig.setScaleCompensation(t.scale)
  }

  function render() {
    renderer.render(scene, camera)
  }

  // --- resize ---
  let appliedDpr = 0
  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    appliedDpr = window.devicePixelRatio || 1
    renderer.setPixelRatio(effectiveDpr(w, h))
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    if (!running) {
      applyPlacementInstant()
      render()
    }
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  // --- parallax ---
  let targetRX = 0
  let targetRY = 0
  let smoothRX = 0
  let smoothRY = 0
  const onMove = (e: PointerEvent) => {
    const r = container.getBoundingClientRect()
    targetRY = ((e.clientX - r.left) / r.width - 0.5) * 0.26
    targetRX = ((e.clientY - r.top) / r.height - 0.5) * 0.09
  }
  if (!opts.reducedMotion) container.addEventListener('pointermove', onMove)

  // --- animation loop, paused while off-screen ---
  const clock = new THREE.Clock()
  let raf = 0
  let running = false
  let elapsed = 0

  let carry = 0
  function frame() {
    raf = requestAnimationFrame(frame)
    // cap at ~60fps — a slow bob and a 30hz pong gain nothing from 144hz
    carry += clock.getDelta()
    if (carry < 1 / 62) return
    const dt = Math.min(carry, 0.05)
    carry = 0
    elapsed += dt

    // catch monitor-DPR changes that don't alter CSS size
    if (Math.abs((window.devicePixelRatio || 1) - appliedDpr) > 0.001) resize()

    const t = placementTargets()
    room.position.x += (t.x - room.position.x) * 0.08
    placeY += (t.y - placeY) * 0.08
    const s = room.scale.x + (t.scale - room.scale.x) * 0.08
    room.scale.setScalar(s)
    rig.setScaleCompensation(s)

    smoothRY += (targetRY - smoothRY) * 0.05
    smoothRX += (targetRX - smoothRX) * 0.05
    room.rotation.y = BASE_ROT_Y + smoothRY
    room.rotation.x = BASE_ROT_X + smoothRX
    room.position.y = placeY + Math.sin(elapsed * 0.8) * 0.045

    pong.update(dt)
    dev.ledMaterial.emissiveIntensity = 0.65 + 0.35 * (0.5 + 0.5 * Math.sin(elapsed * 2.3))
    rig.update(dt, elapsed)

    render()
  }

  function start() {
    if (running || opts.reducedMotion) return
    running = true
    clock.getDelta() // swallow the pause gap
    frame()
  }
  function stop() {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) start()
        else stop()
      }
    },
    { threshold: 0.02 },
  )
  io.observe(container)

  // initial still (also covers the reduced-motion path)
  resize()
  applyPlacementInstant()
  render()

  return {
    setTheme(theme) {
      rig.setTheme(theme)
      if (!running) {
        rig.jumpToTarget()
        render()
      }
    },
    dispose() {
      stop()
      io.disconnect()
      ro.disconnect()
      container.removeEventListener('pointermove', onMove)
      kit.dispose()
      pong.dispose()
      renderer.dispose()
      // renderer.dispose() alone doesn't release the WebGL context —
      // without this, Home↔Games navigation piles up live contexts
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
