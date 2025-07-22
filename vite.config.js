import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
