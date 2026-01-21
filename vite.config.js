import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['frontend-4rke.onrender.com'] // Add your Render domain here
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: ['frontend-4rke.onrender.com'] // Also add to preview config
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
