/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: 'PdfjsViewerElement',
      fileName: 'pdfjs-viewer-element',
      entry: 'src/pdfjs-viewer-element.ts',
      formats: ['es']
    },
    copyPublicDir: false
  },
  test: {
    browser: {
      provider: 'webdriverio',
      enabled: true,
      // at least one instance is required
      instances: [
        { browser: 'firefox' }
      ]
    }
  },
  optimizeDeps: {
    // Prevent resolve external deps of the prebuild from v.4.0.189 
    exclude: ['canvas', 'path2d-polyfill', 'path2d']
  }
})
