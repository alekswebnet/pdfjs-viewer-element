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
  }
})
