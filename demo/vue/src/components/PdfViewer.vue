<script setup lang="ts">
import 'pdfjs-viewer-element'

defineProps<{
  src: string | null,
  viewerPath: string | null,
  page?: string | null,
  locale?: string | null,
  zoom?: string | null,
  pagemode?: string | null,
  search?: string | null,
  phrase?: boolean,
  textLayer?: string
}>()
</script>

<template>
  <pdfjs-viewer-element
    :src="src"
    :viewer-path="viewerPath"
    :locale="locale"
    :page="page"
    :search="search"
    :phrase="phrase"
    :zoom="zoom"
    :pagemode="pagemode"
    :text-layer="textLayer">
  </pdfjs-viewer-element>
</template>
