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
    // Prevent resolve external deps of the prebuild v.4.0.189 
    exclude: ['canvas', 'path2d-polyfill']
  }
})
