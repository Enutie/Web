<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import SiteBanner from '@/components/SiteBanner.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import PursuitCard from '@/components/PursuitCard.vue'

// three.js is ~530 kB — stream the scene in after first paint instead of
// blocking the page on it. The hero has a fixed height, so nothing shifts.
const HeroScene = defineAsyncComponent(() => import('@/components/HeroScene.vue'))
import StateIndicator from '@/components/StateIndicator.vue'
import { useBlogFeed } from '@/composables/useBlogFeed'

const { items: pursuits } = useBlogFeed()
const BLOG = 'https://blog.enutie.com'
</script>

<template>
  <SiteBanner />

  <section class="hero">
    <HeroScene />
    <div class="hero-content">
      <div class="hero-copy">
        <h1 class="hero-title">Welcome Stranger</h1>
        <p class="hero-sub">
          I am a web dev by day. Delusionally ambitious in learning drawing, game dev, writing, music and tactical warfare within the Mortal Realms.
        <br>All tracked below.
        </p>
        <div class="hero-buttons">
          <a class="btn-primary" href="https://pong.enutie.com">Play pong →</a>
          <a class="btn-secondary" :href="BLOG">Read the blog</a>
        </div>
      </div>
    </div>
    <div class="hero-band"></div>
  </section>

  <section class="pursuits">
    <div class="section-head">
      <div class="head-left">
        <div class="head-title">The pursuits</div>
        <div class="head-note">See how far I've come. "A journey of a thousand miles begins with a single step."</div>
      </div>
      <div class="legend">
        <div class="legend-item"><StateIndicator state="active" />active</div>
        <div class="legend-item"><StateIndicator state="resting" />resting</div>
        <div class="legend-item"><StateIndicator state="queued" />queued</div>
      </div>
    </div>

    <div class="grid">
      <PursuitCard v-for="p in pursuits" :key="p.tag" :pursuit="p" />
    </div>

    <p class="board-note">
      Any suggestions for how to improve in what I am doing? Hit me up on enutie@gmail.com
    </p>
  </section>

  <SiteFooter />
</template>

<style scoped>
.hero {
  background: #211a13;
  position: relative;
  overflow: hidden;
  height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.hero-content {
  position: relative;
  padding: 0 var(--page-x) 32px;
  display: flex;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
  pointer-events: none;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-title {
  font-family: var(--font-head);
  font-size: clamp(28px, 5.5vw, 40px);
  font-weight: 800;
  color: #f0e9da;
  line-height: 1.1;
}

.hero-sub {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  color: #cfc5b0;
  max-width: 520px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  pointer-events: auto;
  margin-top: 8px;
}

.btn-primary {
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 700;
  color: #f7f3ea;
  background: var(--red);
  padding: 11px 22px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.btn-primary:hover {
  background: var(--red-hover);
}

.btn-secondary {
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 700;
  color: #f0e9da;
  border: 2px solid #5d5142;
  padding: 9px 20px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.btn-secondary:hover {
  border-color: #93876f;
}

.hero-band {
  position: relative;
  height: 4px;
  background: var(--red);
  margin-top: 24px;
}

.pursuits {
  padding: 44px var(--page-x) 56px;
  max-width: 1240px;
  box-sizing: border-box;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 2px solid var(--text);
  padding-top: 16px;
}

.head-left {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.head-title {
  font-family: var(--font-head);
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
}

.head-note {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--muted);
}

.legend {
  display: flex;
  gap: 14px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(212px, 1fr));
  gap: 16px;
}

.board-note {
  margin: 0;
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.6;
}
</style>
