<script setup lang="ts">
import { ref } from "vue";
import "pdfjs-viewer-element";

const src = ref("/sample-pdf-with-images.pdf");
const viewerPath = ref("/pdfjs-prebuilt");
const page = ref("2");
const locale = ref("uk");
const zoom = ref("auto");
const pagemode = ref("none");
const search = ref(null);
const phrase = ref(true);
const textLayer = ref("hover");
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
