import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include static assets the SW should cache on install
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Radix Networks',
        short_name: 'Radix',
        description: 'Radix ERP Partner Management System',
        theme_color: '#09090B',
        background_color: '#09090B',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache all built JS/CSS/HTML + image assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        // Never precache the FCM SW — if the PWA SW serves a stale cached
        // copy, push subscriptions silently break in production builds.
        globIgnores: ['firebase-messaging-sw.js'],
        // SPA fallback — serve index.html for all navigation requests
        navigateFallback: '/index.html',
        // Don't apply the HTML fallback to the FCM SW path
        navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js/],
        runtimeCaching: [
          {
            // Cache Cloudinary images for 30 days
            urlPattern: /^https:\/\/res\.cloudinary\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Cache Supabase Storage files (avatars, uploads) for 7 days
            urlPattern: /^https:\/\/[a-z]+\.supabase\.co\/storage\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    allowedHosts: ['c046-59-176-29-237.ngrok-free.app'],
  },
})
