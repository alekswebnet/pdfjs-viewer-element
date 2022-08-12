import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/pdfjs-viewer-element.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: /^lit/
    }
  }
})
