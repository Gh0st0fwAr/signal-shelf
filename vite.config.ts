import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // явно IPv4 — Vite 8 по умолчанию слушает ::1
    port: 5173,
  },
})
