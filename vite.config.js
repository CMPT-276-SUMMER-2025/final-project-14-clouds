import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssTailwind from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        postcssTailwind(),  // ← the new Tailwind PostCSS plugin
        autoprefixer()
      ]
    }
  },
  server: {
    proxy: {
      '/translink_api': {
        target: 'https://gtfsapi.translink.ca',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/translink_api/, '')
      }
    }
  }
})
