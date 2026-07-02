import { ref } from 'vue'

export type Theme = 'light' | 'dark'
const KEY = 'enutie-theme'

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function detectSystem(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const systemTheme = ref<Theme>(detectSystem())
try {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      systemTheme.value = e.matches ? 'dark' : 'light'
    })
} catch {
}

export const themeOverride = ref<Theme | null>(stored())

export const activeTheme = ref<Theme>('light')

export function setTheme(t: Theme) {
  themeOverride.value = t
  try {
    localStorage.setItem(KEY, t)
  } catch {
  }
}

export function toggleTheme() {
  setTheme(activeTheme.value === 'dark' ? 'light' : 'dark')
}
