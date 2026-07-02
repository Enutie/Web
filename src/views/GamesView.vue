<script setup lang="ts">
import SiteBanner from '@/components/SiteBanner.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import GameCard from '@/components/GameCard.vue'
import { games } from '@/data/games'

const nextNumber = String(games.length + 1).padStart(2, '0')
</script>

<template>
  <SiteBanner active="games" />

  <section class="hall">
    <div class="intro">
      <h1 class="title">The games hall of shame</h1>
      <p class="lede">
        Games created by me, just clones for now, following the 20 games challenge. Perhaps my own original game will be here one day, lets see.
      </p>
    </div>

    <div class="grid">
      <GameCard v-for="g in games" :key="g.number" :game="g" />

      <div class="empty-slot">
        <div class="empty-number">game #{{ nextNumber }}</div>
        <div class="empty-note">Idea in the works<br />When days get more hours, or less sleep is needed, we will continue</div>
      </div>
    </div>

    <div class="shelf">
      <div class="shelf-brass"></div>
      <div class="shelf-dark"></div>
    </div>

    <p class="footnote">
      Each game lives on its own subdomain (pong.enutie.com) and gets a devlog post on the blog when
      it ships.
    </p>
  </section>

  <SiteFooter />
</template>

<style scoped>
.hall {
  flex: 1;
  padding: 56px var(--page-x) 0;
  display: flex;
  flex-direction: column;
}

.intro {
  max-width: 1144px;
  box-sizing: border-box;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.title {
  font-family: var(--font-head);
  font-size: clamp(28px, 5.5vw, 38px);
  font-weight: 800;
  color: var(--text);
  line-height: 1.1;
}

.lede {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--body);
  line-height: 1.6;
  max-width: 560px;
}

.grid {
  max-width: 1144px;
  box-sizing: border-box;
  width: 100%;
  margin: 32px auto 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 340px));
  gap: 20px;
}

.empty-slot {
  border: 1px dashed var(--slot-line);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 290px;
  padding: 20px;
}

.empty-number {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 700;
  color: var(--muted);
}

.empty-note {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--muted);
  text-align: center;
  line-height: 1.7;
}

.shelf {
  max-width: 1144px;
  box-sizing: border-box;
  width: 100%;
  margin: 20px auto 0;
}

.shelf-brass {
  height: 5px;
  background: var(--brass);
}

.shelf-dark {
  height: 10px;
  background: var(--deep);
}

.footnote {
  max-width: 1144px;
  box-sizing: border-box;
  width: 100%;
  margin: 24px auto 0;
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.6;
}
</style>
