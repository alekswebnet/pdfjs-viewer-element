/// <reference types="vitest" />
import { defineConfig } from 'vite'
import terser from '@rollup/plugin-terser'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: 'PdfjsViewerElement',
      fileName: 'pdfjs-viewer-element',
      entry: 'src/pdfjs-viewer-element.ts',
      formats: ['es']
    },
    copyPublicDir: false,
    rollupOptions: {
      plugins: [terser()]
    }
  },
  test: {
    browser: {
      enabled: true,
      name: 'firefox',
      headless: true
    },
  },
  optimizeDeps: {
    // Prevent resolve external deps of the prebuild from v.4.0.189 
    exclude: ['canvas', 'path2d-polyfill', 'path2d']
  },
})
