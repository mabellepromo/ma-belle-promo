import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Logo Redesign1.webp', 'robots.txt'],
      manifest: {
        name: 'Ma Belle Promo',
        short_name: 'MBP',
        description: 'Association FDD Ma Belle Promo — Lomé, Togo · Promotion 1994–2000',
        theme_color: '#0a2218',
        background_color: '#0a2218',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        icons: [
          {
            src: '/Logo Redesign1.webp',
            sizes: '192x192',
            type: 'image/webp',
          },
          {
            src: '/Logo Redesign1.webp',
            sizes: '512x512',
            type: 'image/webp',
          },
          {
            src: '/Logo Redesign1.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
