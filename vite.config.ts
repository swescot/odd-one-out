import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose on the LAN so other devices (phones) can join during testing.
  server: { host: true },
})
