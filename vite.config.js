import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV,
    strictPort: false,
    middlewareMode: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
