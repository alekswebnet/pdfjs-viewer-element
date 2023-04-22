<script setup lang="ts">
import { ref } from "vue";
import "pdfjs-viewer-element";

const src: string | null = ref("/sample-pdf-with-images.pdf");
const viewerPath: string | null = ref("/pdfjs-prebuilt");
const page: string | null = ref("2");
const locale: string | null = ref("de");
const zoom: string | null = ref("auto");
const pagemode: string | null = ref("none");
const search: string | null = ref(null);
const phrase: boolean = ref(true);
const textLayer: string | null = ref("hover");
</script>

<template>
  <main>
    <pdfjs-viewer-element
      class="viewer"
      :src="src"
      :viewer-path="viewerPath"
      :locale="locale"
      :page="page"
      :search="search"
      :phrase="phrase"
      :zoom="zoom"
      :pagemode="pagemode"
      :text-layer="textLayer"
    >
    </pdfjs-viewer-element>
  </main>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
.viewer {
  height: 100dvh;
}
</style>
