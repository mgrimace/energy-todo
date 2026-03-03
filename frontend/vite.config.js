import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Energy Todo',
        short_name: 'EnergyTodo',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6b21a8',
        icons: [
          { src: '/icons/icon-light.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-dark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist'
  }
})
