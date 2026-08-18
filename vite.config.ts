import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// Dev API middleware plugin for local development
const devApiPlugin = () => ({
  name: 'dev-api-middleware',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/api/send-notification') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => (body += chunk));
        req.on('end', async () => {
          try {
            req.body = body ? JSON.parse(body) : {};
            // @ts-ignore
            const handlerModule = await import('./api/send-notification.js');
            const handler = handlerModule.default;
            await handler(req, res);
          } catch (e: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Local dev test push processed.' }));
          }
        });
        return;
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  publicDir: "public",
  plugins: [
    react(),
    devApiPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifestFilename: "manifest.json",
      devOptions: {
        enabled: false,
      },
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "dre-logo.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png",
        "sw-push-handler.js"
      ],
      manifest: {
        id: "/",
        name: "Devi Real Estates",
        short_name: "Devi Real Estates",
        description: "Find your ideal property with Devi Real Estates.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["real estate", "business", "lifestyle"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        importScripts: ['/sw-push-handler.js'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,woff,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Images from Cloudinary / Unsplash (Cache & revalidate for speed without being permanently stale)
            urlPattern: /^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com)\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "property-images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Firebase Firestore & Auth: NetworkOnly so dynamic properties are NEVER stale or locked
            urlPattern: /^https:\/\/(firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com)\/.*/i,
            handler: "NetworkOnly",
          },
          {
            // Serverless and dynamic API routes: NetworkOnly
            urlPattern: /^\/api\/.*/i,
            handler: "NetworkOnly",
          }
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
