<script setup lang="ts">
import type { PursuitState } from '@/data/pursuits'

defineProps<{ state: PursuitState }>()
</script>

<template>
  <span class="sq" :class="state" aria-hidden="true"></span>
</template>

<style scoped>
/* Each state gets its own fill pattern, not just its own color, so the
   legend↔card mapping works for colorblind visitors too. */
.sq {
  display: inline-block;
  width: 8px;
  height: 8px;
  flex: none;
  box-sizing: border-box;
}

.sq.active {
  background: var(--red);
}

.sq.resting {
  border: 1px solid var(--brass);
  background: repeating-linear-gradient(45deg, var(--brass) 0 1.5px, transparent 1.5px 3.5px);
}

.sq.queued {
  border: 1px solid var(--muted);
  background: transparent;
}
</style>
