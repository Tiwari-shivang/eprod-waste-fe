import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.csv'],
  base: '/eprod-waste-fe/',
  define: {
    // Fix for sockjs-client: define global for browser environment
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
