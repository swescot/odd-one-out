import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Served from https://<user>.github.io/odd-one-out/ in production, but at the
  // root during local dev (keeps the dev server + preview tooling working).
  base: command === "build" ? "/odd-one-out/" : "/",
  // Expose on the LAN so other devices (phones) can join during testing.
  server: { host: true },
}))
