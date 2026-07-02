<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { themeOverride, systemTheme, activeTheme, type Theme } from '@/composables/theme'

// An explicit toggle choice always wins (persisted, site-wide). With no choice
// yet, the games hall defaults to its "lamplit" dark; every other page follows
// the visitor's OS colour-scheme preference.
const route = useRoute()

const effective = computed<Theme>(() => {
  if (themeOverride.value) return themeOverride.value
  return route.meta.theme === 'dark' ? 'dark' : systemTheme.value
})

watch(
  effective,
  (theme) => {
    activeTheme.value = theme
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : ''
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
