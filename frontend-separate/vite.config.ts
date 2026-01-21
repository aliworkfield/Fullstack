import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Ensure Authorization header is properly forwarded
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Preserve the original authorization header
            if (req.headers.authorization) {
              proxyReq.setHeader('authorization', req.headers.authorization);
            } else {
              console.log('No authorization header in original request');
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Ensure CORS headers are properly set
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
          });
        },
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
})