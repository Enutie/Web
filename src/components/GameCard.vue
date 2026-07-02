<script setup lang="ts">
import type { Game } from '@/data/games'

defineProps<{ game: Game }>()
</script>

<template>
  <div class="cartridge">
    <img
      v-if="game.screenshot"
      class="shot"
      :src="game.screenshot"
      :alt="`${game.title} gameplay`"
    />
    <div v-else class="shot shot-empty"></div>
    <div class="oxblood-band"></div>
    <div class="body">
      <div class="title-row">
        <div class="title">{{ game.title }}</div>
        <div class="number">game #{{ game.number }}</div>
      </div>
      <div class="meta">{{ game.engine }} · shipped {{ game.shippedDate }} · {{ game.quip }}</div>
      <div class="actions">
        <a class="play" :href="game.playUrl">Play →</a>
        <a class="devlog" :href="game.devlogUrl">devlog</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cartridge {
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.shot {
  display: block;
  width: 100%;
  height: 170px;
  object-fit: cover;
  background: var(--deep);
}

.oxblood-band {
  height: 4px;
  background: var(--red);
}

.body {
  padding: 16px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
}

.title {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.number {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted);
}

.meta {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--muted);
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 4px;
}

.play {
  font-family: var(--font-head);
  font-size: 13px;
  font-weight: 700;
  color: #f7f3ea;
  background: var(--red);
  padding: 8px 18px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.play:hover {
  background: var(--red-hover);
}

.devlog {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--red-text);
  text-decoration: none;
  cursor: pointer;
}
</style>
