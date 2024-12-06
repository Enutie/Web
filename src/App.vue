<script setup lang="ts">
import { ref } from 'vue';
import TopNav from './components/TopNavigation.vue'

const mainRef = ref<HTMLElement | null>(null)
const currentSection = ref(0)

const smoothScroll = (e: WheelEvent) => {
  if (!mainRef.value) return
  e.preventDefault()

  const direction = e.deltaY > 0 ? 1 : -1
  const sections = mainRef.value.children.length
  const newSection = Math.max(0, Math.min(sections - 1, currentSection.value + direction))
  
  if (newSection !== currentSection.value) {
    currentSection.value = newSection
    const targetPosition = newSection * window.innerHeight
    
    mainRef.value.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <div class="h-screen w-screen">
    <TopNav />
    <main
      ref="mainRef"
      @wheel.passive="smoothScroll"
      class="h-screen overflow-y-scroll no-scrollbar">
      <section class="h-screen w-screen flex items-center justify-center bg-slide-1">
        <div class="max-w-7xl mx-auto px-8 text-center">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            making websites work and games crash
          </h1>
        </div>
      </section>
      <section class="h-screen w-screen flex items-center justify-center bg-slide-2">
        <div class="max-w-7xl mx-auto px-8 text-center">
          <h2 class="text-3xl md:text-5xl lg:text-6xl text-white">
            learning to draw stick figures and write terrible first drafts
          </h2>
        </div>
      </section>
      <section class="h-screen w-screen flex items-center justify-center bg-slide-3">
        <div class="max-w-7xl mx-auto px-8 text-center">
          <div class="flex gap-8 text-2xl md:text-4xl lg:text-5xl text-white">
            <div>bugs</div>
            <div>experiments</div>
            <div>attempts</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>