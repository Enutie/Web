<script setup lang="ts">
import { computed } from 'vue'
import type { Pursuit } from '@/data/pursuits'
import StateIndicator from '@/components/StateIndicator.vue'

const props = defineProps<{ pursuit: Pursuit }>()

const bandColor = computed(() =>
  props.pursuit.state === 'active'
    ? 'var(--red)'
    : props.pursuit.state === 'resting'
      ? 'var(--brass)'
      : 'var(--border)',
)
const stateColor = computed(() =>
  props.pursuit.state === 'active'
    ? 'var(--red)'
    : props.pursuit.state === 'resting'
      ? 'var(--brass)'
      : 'var(--muted)',
)
</script>

<template>
  <div class="card" :style="{ borderTopColor: bandColor }">
    <div class="title-row">
      <div class="name">{{ pursuit.name }}</div>
      <div class="state" :style="{ color: stateColor }">
        <StateIndicator :state="pursuit.state" />{{ pursuit.state }}
      </div>
    </div>

    <div class="stats">
      <template v-for="(line, i) in pursuit.stats" :key="i">
        <span v-if="line.text">{{ line.text }}</span>
        <a v-if="line.link" class="stats-link" :href="line.link.href">{{ line.link.label }}</a>
        <br v-if="i < pursuit.stats.length - 1" />
      </template>
    </div>

    <a v-if="pursuit.link" class="tool-link" :href="pursuit.link.href">{{ pursuit.link.label }}</a>

    <a v-if="pursuit.latest" class="latest" :href="pursuit.latest.url">
      <div class="latest-title">{{ pursuit.latest.title }}</div>
      <div class="latest-date">{{ pursuit.latest.date }} · latest entry</div>
    </a>
    <div v-else class="latest pending">
      <div class="latest-title pending-title">{{ pursuit.pending?.title }}</div>
      <div class="latest-date">{{ pursuit.pending?.note }}</div>
    </div>

    <a class="full-log" :href="pursuit.tagUrl">full log →</a>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 4px solid var(--border);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.name {
  font-family: var(--font-head);
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
}

.state {
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stats {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  line-height: 1.7;
}

.stats-link {
  color: var(--red-text);
  text-decoration: none;
}

.tool-link {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--red-text);
  text-decoration: none;
}

.latest {
  border-top: 1px solid var(--border-faint);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-decoration: none;
}

.latest-title {
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
  transition: color 0.15s ease;
}

a.latest:hover .latest-title {
  color: var(--red-text);
}

.pending-title {
  color: var(--muted);
  font-style: italic;
}

.latest-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted);
}

.full-log {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--red-text);
  text-decoration: none;
  margin-top: auto;
  cursor: pointer;
}
</style>
