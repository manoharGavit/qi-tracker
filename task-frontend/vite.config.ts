import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Rarely-changing vendor code gets its own long-cacheable chunks.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
              priority: 30,
            },
            {
              name: 'ui',
              test: /node_modules[\\/](radix-ui|@radix-ui|@floating-ui|vaul|sonner|lucide-react|cn|class-variance-authority|react-remove-scroll[^\\/]*|aria-hidden|use-sidecar|use-callback-ref|tslib)[\\/]/,
              priority: 20,
            },
            {
              name: 'data',
              test: /node_modules[\\/](@tanstack|zod|react-hook-form|@hookform)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    testTimeout: 25000,
  },
})
