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
        description: "l'association Ma Belle Promo (MBP) — Lomé, Togo · Promotion 1994–2000",
        theme_color: '#0a2218',
        background_color: '#0a2218',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        icons: [
          {
            src: '/Logo Redesign1.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/Logo Redesign1.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/Logo Redesign1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
        // Purge les anciens caches de précache à chaque activation d'un nouveau service worker.
        // Évite qu'un ancien index.html (pointant vers des JS disparus) reste servi.
        cleanupOutdatedCaches: true,
        // Pour les requêtes de navigation (la page elle-même), va d'abord chercher
        // la version fraîche sur le réseau ; ne retombe sur le cache que hors-ligne.
        // C'est ce qui élimine le bug du « bundle périmé » bloquant le démarrage de React.
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // index.html / navigation SPA : réseau d'abord
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
            },
          },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@tiptap') || id.includes('prosemirror')) return 'vendor-tiptap';
          if (id.includes('framer-motion'))   return 'vendor-motion';
          if (id.includes('@supabase'))       return 'vendor-supabase';
          if (id.includes('@tanstack'))       return 'vendor-query';
          if (id.includes('lucide-react'))    return 'vendor-icons';
          // Tout l'écosystème React ensemble — scheduler, react-is, @remix-run/router (dep de react-router)
          if (
            id.includes('react-dom') || id.includes('react-router') ||
            id.includes('/react/') || id.includes('/scheduler/') ||
            id.includes('/react-is/') || id.includes('@remix-run')
          ) return 'vendor-react';
          return 'vendor-libs';
        },
      },
    },
  },
});
