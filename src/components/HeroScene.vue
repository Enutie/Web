<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { activeTheme } from '@enutie/design/theme'
import type { RoomScene } from '@/three/room'

// Thin mount point for the hero diorama. The scene itself (and three.js)
// lives in src/three/room and is imported dynamically so it stays out of
// the initial bundle.

const mount = ref<HTMLDivElement | null>(null)
let alive = true
let scene: RoomScene | null = null

watch(activeTheme, (t) => scene?.setTheme(t))

onMounted(async () => {
  const el = mount.value
  if (!el) return
  const { createRoomScene } = await import('@/three/room')
  if (!alive || !mount.value) return
  scene = createRoomScene(el, {
    theme: activeTheme.value,
    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  })
})

onBeforeUnmount(() => {
  alive = false
  scene?.dispose()
  scene = null
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
