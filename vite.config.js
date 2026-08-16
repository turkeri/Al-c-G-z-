import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg'],
      manifest: {
        name: 'Araç Dedektifi',
        short_name: 'Araç Dedektifi',
        description: 'Aracı almadan önce riskleri öğren.',
        theme_color: '#3454d1',
        background_color: '#f3f5fa',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        // Android paylaş menüsünde, kurulu PWA'nın ilan bağlantısını almasını
        // sağlar. Uygulama URL'yi yalnızca içe aktarır; ilan sayfasına otomatik
        // istek atmaz veya platformun korumasını aşmaya çalışmaz.
        share_target: {
          action: './?share-url={url}&share-title={title}&share-text={text}',
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded'
        },
        icons: [
          {
            src: 'icons/pwa-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}']
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})