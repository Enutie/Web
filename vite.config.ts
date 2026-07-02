import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// GitHub Pages has no server-side rewrite: a direct load of /games would 404.
// Serving a copy of index.html as 404.html lets the SPA boot and vue-router
// (history mode) resolve the path client-side.
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const index = fileURLToPath(new URL('./dist/index.html', import.meta.url))
      const notFound = fileURLToPath(new URL('./dist/404.html', import.meta.url))
      if (existsSync(index)) copyFileSync(index, notFound)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueDevTools(),
    spaFallback(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})