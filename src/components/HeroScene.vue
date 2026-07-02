<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const mount = ref<HTMLDivElement | null>(null)
let alive = true
let cleanup: (() => void) | null = null

onMounted(async () => {
  const el = mount.value
  if (!el) return

  const THREE = await import('three')
  if (!alive || !mount.value) return

  const prefersReduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0.2, 6)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.domElement.style.display = 'block'
  el.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xf0e9da, 0.12))
  const key = new THREE.DirectionalLight(0xffd9a0, 0.9)
  key.position.set(3, 4, 5)
  scene.add(key)
  const red = new THREE.PointLight(0xc8362b, 1.1, 30)
  red.position.set(-4, -2, 3)
  scene.add(red)

  const geo = new THREE.IcosahedronGeometry(1.55, 0)
  const group = new THREE.Group()
  group.add(
    new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: 0x2b2318,
        roughness: 0.55,
        metalness: 0.25,
        flatShading: true,
      }),
    ),
  )
  group.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0xb8862f, transparent: true, opacity: 0.75 }),
    ),
  )
  group.position.x = 1.6
  scene.add(group)

  const render = () => renderer.render(scene, camera)

  const resize = () => {
    const w = el.clientWidth
    const h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    if (prefersReduced) {
      group.position.x = camera.aspect < 1.05 ? 0 : 1.6
      render()
    }
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  if (prefersReduced) {
    group.rotation.set(0.35, 0.6, 0)
    render()
    cleanup = () => {
      ro.disconnect()
      renderer.dispose()
    }
    return
  }

  let targetRX = 0
  let targetRY = 0
  let smoothRX = 0
  let smoothRY = 0
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    targetRY = ((e.clientX - r.left) / r.width - 0.5) * 0.7
    targetRX = ((e.clientY - r.top) / r.height - 0.5) * 0.45
  }
  el.addEventListener('pointermove', onMove)

  let raf = 0
  let t = 0
  const animate = () => {
    raf = requestAnimationFrame(animate)
    const targetX = camera.aspect < 1.05 ? 0 : 1.6
    group.position.x += (targetX - group.position.x) * 0.08
    t += 0.5 * 0.004
    smoothRY += (targetRY - smoothRY) * 0.05
    smoothRX += (targetRX - smoothRX) * 0.05
    group.rotation.y = t + smoothRY
    group.rotation.x = 0.25 + smoothRX
    group.position.y = Math.sin(t * 1.7) * 0.12
    render()
  }
  animate()

  cleanup = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    el.removeEventListener('pointermove', onMove)
    renderer.dispose()
  }
})

onBeforeUnmount(() => {
  alive = false
  if (cleanup) cleanup()
})
</script>

<template>
  <div ref="mount" class="hero-canvas" aria-hidden="true"></div>
</template>

<style scoped>
.hero-canvas {
  position: absolute;
  inset: 0;
}
</style>
