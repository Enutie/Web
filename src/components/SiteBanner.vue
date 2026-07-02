<script setup lang="ts">
import { activeTheme, toggleTheme } from '@/composables/theme'

defineProps<{ active?: 'posts' | 'games' }>()

const BLOG = 'https://blog.enutie.com'
</script>

<template>
  <header>
    <div class="banner">
      <RouterLink to="/" class="wordmark">ENUTIE</RouterLink>
      <nav class="nav">
        <a :href="BLOG" class="nav-link" :class="{ active: active === 'posts' }">Posts</a>
        <RouterLink to="/games" class="nav-link" :class="{ active: active === 'games' }">
          Games
        </RouterLink>
        <button
          type="button"
          class="theme-switch"
          :class="{ dark: activeTheme === 'dark' }"
          role="switch"
          :aria-checked="activeTheme === 'dark'"
          aria-label="Toggle dark theme"
          @click="toggleTheme"
        >
          <span class="track"></span>
          <span class="knob"></span>
        </button>
      </nav>
    </div>
    <div class="brass-band"></div>
  </header>
</template>

<style scoped>
.banner {
  background: var(--red);
  padding: 16px var(--page-x);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.wordmark {
  font-family: var(--font-head);
  font-size: 24px;
  font-weight: 800;
  color: #f7f3ea;
  letter-spacing: 0.01em;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 24px;
  align-items: center;
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 600;
}

.nav-link {
  color: #d9a8a0;
  text-decoration: none;
  cursor: pointer;
  padding-bottom: 2px;
  border-bottom: 3px solid transparent;
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: #f7f3ea;
}

.nav-link.active {
  color: #f7f3ea;
  border-bottom-color: var(--brass);
}

.theme-switch {
  position: relative;
  width: 46px;
  height: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  flex: none;
}

.theme-switch .track {
  position: absolute;
  inset: 0;
  border: 1px solid #9c5750;
  transition: border-color 0.15s ease;
}

.theme-switch:hover .track {
  border-color: #d9a8a0;
}

.theme-switch .knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: var(--brass);
  transition: transform 0.2s ease;
}

.theme-switch.dark .knob {
  transform: translateX(24px);
}

.theme-switch .knob::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2b2118;
  transform: translate(-50%, -50%);
}

.theme-switch .knob::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brass);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.2s ease;
}

.theme-switch.dark .knob::after {
  transform: translate(-15%, -75%) scale(1);
}

.brass-band {
  height: 4px;
  background: var(--brass);
}
</style>
