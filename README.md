# pdfjs-viewer-element

A custom element, based on [PDF.js default viewer](https://mozilla.github.io/pdf.js/web/viewer.html). Supported in all [major browsers](https://caniuse.com/custom-elementsv1) and works with most [JS frameworks](https://custom-elements-everywhere.com/). See [examples](https://alekswebnet.github.io/pdfjs-viewer-element/#demo) of usage in the different frameworks.

⚠️ `pdfjs-viewer-element` requires PDF.js [prebuilt](http://mozilla.github.io/pdf.js/getting_started/), that includes the generic build of PDF.js and the viewer. To use the package you should [download](http://mozilla.github.io/pdf.js/getting_started/) and **place the prebuilt** files to some directory of your project. Then specify the path to this directory with `viewer-path` property (`/pdfjs` by default).

You have full access to PDF.js viewer application using `initialize` method. 

## Status

[![npm version](https://img.shields.io/npm/v/pdfjs-viewer-element?logo=npm&logoColor=fff)](https://www.npmjs.com/package/pdfjs-viewer-element)
[![Package Quality](https://packagequality.com/shield/pdfjs-viewer-element.svg)](https://packagequality.com/#?package=pdfjs-viewer-element)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/pdfjs-viewer-element)

## Docs

[Getting started](https://alekswebnet.github.io/pdfjs-viewer-element/)

[Api](https://alekswebnet.github.io/pdfjs-viewer-element/#api)

[Live examples](https://alekswebnet.github.io/pdfjs-viewer-element/#demo)

## Install

Using module bundlers:

```bash
# With npm
npm install pdfjs-viewer-element
# With yarn
yarn add pdfjs-viewer-element
```

```javascript
import 'pdfjs-viewer-element'
```

Using browser:

```html
<script type="module" src="https://cdn.skypack.dev/pdfjs-viewer-element"></script>
```

## Usage

```html
<pdfjs-viewer-element src="/file.pdf" viewer-path="/path-to-viewer"></pdfjs-viewer-element>
```

## Properties

`src` - PDF file URL, should refer to the [same origin](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#can-i-load-a-pdf-from-another-server-cross-domain-request) 

`viewer-path` - Path to PDF.js [prebuilt](http://mozilla.github.io/pdf.js/getting_started/)

`locale` -  Specifies which language to use in the viewer UI. For a list of the available locales, see [all l10n files](https://github.com/mozilla/pdf.js/tree/master/l10n)

`text-layer` - Text layer, that is used for text selection

`page` - Page number

`search` - Search text

`phrase` - Search by phrase

`zoom` - Zoom level

`pagemode` - Page mode

For more clarity, see the [Api docs page](https://alekswebnet.github.io/pdfjs-viewer-element/#api).

## PDF.js Viewer Application

`initialize` - using this method you can access PDFViewerApplication and use methods and events of PDF.js default viewer

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const viewer = document.querySelector('pdfjs-viewer-element')
  // Wait for the viewer initialization, receive PDFViewerApplication
  const viewerApp = await viewer.initialize()
  // Open PDF file data using Uint8Array instead of URL
  viewerApp.open(pdfData)
})
```

## License
[MIT](http://opensource.org/licenses/MIT)
