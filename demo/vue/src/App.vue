<script setup lang="ts">
import PdfViewer from './components/PdfViewer.vue'

const src: string | null = `${window.location.origin}/sample-pdf-file.pdf`
const viewerPath: string | null = '/pdfjs-viewer'
const page: string | null = '1'
const locale: string | null = 'uk'
const zoom: string | null = 'auto'
const pagemode: string | null = 'none'
const search: string | null = null
const phrase: boolean = true
const textLayer: string | null = 'hover'
</script>

<template>
  <main>
    <PdfViewer
      class="viewer" 
      :src="src"
      :viewerPath="viewerPath"
      :page="page"
      :locale="locale"
      :zoom="zoom"
      :pagemode="pagemode"
      :search="search"
      :phrase="phrase"
      :textLayer="textLayer">
    </PdfViewer>
  </main>
</template>

<style>
  html, body {
    margin: 0;
    padding: 0;
  }
</style>

<style scoped>
  .viewer {
    height: 100dvh
  }
</style>
