import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increase warning limit to suppress Vercel deployment warnings
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large third-party libraries into a separate vendor chunk
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react', 'zustand']
        }
      }
    }
  }
})
