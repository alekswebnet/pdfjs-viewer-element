# pdfjs-viewer-element

A custom element, based on [PDF.js default viewer](https://mozilla.github.io/pdf.js/web/viewer.html) and supported in all [major browsers](https://caniuse.com/custom-elementsv1), works with most used [JS frameworks](https://custom-elements-everywhere.com/). 

See [examples](https://alekswebnet.github.io/pdfjs-viewer-element/#demo) of usage in Vue, React and Svelte or static HTML page.

⚠️ `pdfjs-viewer-element` requires PDF.js [prebuilt](http://mozilla.github.io/pdf.js/getting_started/), that includes the generic build of PDF.js and the viewer.

The prebuilt comes with each PDF.js release. Supported releases:

🚧 [v3.11.174](https://github.com/mozilla/pdf.js/releases/tag/v3.11.174) (partial)

✅ [v3.10.111](https://github.com/mozilla/pdf.js/releases/tag/v3.10.111)

✅ [v3.9.179](https://github.com/mozilla/pdf.js/releases/tag/v3.9.179)

To use the package you should download and **place the prebuilt** files to some directory of your project.

Then specify the path to this directory with `viewer-path` property (`/pdfjs` by default).

## Status

[![npm version](https://img.shields.io/npm/v/pdfjs-viewer-element?logo=npm&logoColor=fff)](https://www.npmjs.com/package/pdfjs-viewer-element)
[![Package Quality](https://packagequality.com/shield/pdfjs-viewer-element.svg)](https://packagequality.com/#?package=pdfjs-viewer-element)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/pdfjs-viewer-element)

## Docs

[Getting started](https://alekswebnet.github.io/pdfjs-viewer-element/)

[API](https://alekswebnet.github.io/pdfjs-viewer-element/#api)

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

## Attributes

`src` - PDF file URL, should refer to the [same origin](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#can-i-load-a-pdf-from-another-server-cross-domain-request) 

`viewer-path` - Path to PDF.js [prebuilt](http://mozilla.github.io/pdf.js/getting_started/)

`locale` -  Specifies which language to use in the viewer UI `en-US | ...`. [Available locales](https://github.com/mozilla/pdf.js/tree/master/l10n)

`text-layer` - Text layer, that is used for text selection `off | visible | shadow | hover`

`page` - Page number

`search` - Search text

`phrase` - Search by phrase

`zoom` - Zoom level

`pagemode` - Page mode `thumbs | bookmarks | attachments | layers | none`

`viewer-css-theme` - Apply automatic, light or dark theme `AUTOMATIC | LIGHT | DARK`. Default is `AUTOMATIC`

`viewer-extra-styles` - Add your CSS rules to viewer application

For more clarity, see the [Api docs page](https://alekswebnet.github.io/pdfjs-viewer-element/#api).

## Viewer extra styles 

You can add your own CSS rules to the viewer application using `viewer-extra-styles` attribute:

```html
<!-- Hide open file button -->
<pdfjs-viewer-element 
  src="/file.pdf" 
  viewer-path="/path-to-viewer"
  viewer-extra-styles="#openFile { display: none }">
</pdfjs-viewer-element>
```

## PDF.js Viewer Application

`initialize` - using this method you can access PDFViewerApplication and use methods and events of PDF.js default viewer

```html
<pdfjs-viewer-element viewer-path="/path-to-viewer"></pdfjs-viewer-element>
```

```javascript
const viewer = document.querySelector('pdfjs-viewer-element')
// Wait for the viewer initialization, receive PDFViewerApplication
const viewerApp = await viewer.initialize()
// Open PDF file data using Uint8Array instead of URL
viewerApp.open(pdfData)
// Use event bus to handle viewer application events
viewerApp.eventBus.on('pagesloaded', () => {
  console.log('Viewer pages loaded')
})
```

## License
[MIT](http://opensource.org/licenses/MIT)