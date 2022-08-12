import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: 'PdfjsViewerElement',
      fileName: 'index',
      entry: 'src/index.ts',
      formats: ['es', 'umd']
    }
  }
})
