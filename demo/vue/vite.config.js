import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Define `pdfjs-viewer-element` as custom element
          isCustomElement: tag => tag === 'pdfjs-viewer-element',
        },
      },
    })
  ],
})
