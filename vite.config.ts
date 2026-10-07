import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

/** GitHub Pages отдаёт 404.html при прямом заходе на /item/:id — копируем index. */
function spaGitHubPagesFallback() {
  return {
    name: 'spa-github-pages-fallback',
    closeBundle() {
      const dist = resolve(rootDir, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Prod: https://gh0st0fwar.github.io/signal-shelf/  |  dev: /
  base: command === 'serve' ? '/' : '/signal-shelf/',
  plugins: [react(), spaGitHubPagesFallback()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
}))
