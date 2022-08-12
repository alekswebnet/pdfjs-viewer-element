# pdfjs-viewer-element

Simple webcomponent for [PDF.js viewer](https://mozilla.github.io/pdf.js/web/viewer.html).
⚠️ `pdfjs-viewer-element` uses PDF.js [prebuilt](https://github.com/mozilla/pdf.js/releases/download/v2.15.349/pdfjs-2.15.349-dist.zip), that includes the generic build of PDF.js and the viewer. To use the webcomponent you should to extract the prebuilt file into a public directory of your project.

## Install

`yarn add pdfjs-viewer-element`

## Usage
Import the webcomponent to your project:

`import 'pdfjs-viewer-element'`

And pass a `src` property:

`<pdfjs-viewer-element src="/compressed.tracemonkey-pldi-09.pdf"></pdfjs-viewer-element>`


