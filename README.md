<p align="center">
<img src="https://alekswebnet.github.io/pdfjs-viewer-element/logo.svg" width="60"/>
</p>
<h1 align="center">pdfjs-viewer-element</h1>

The simplest integration of [PDF.js default viewer](https://mozilla.github.io/pdf.js/web/viewer.html) using the `iframe` element and web component. 
The package provides a custom element, based on PDF.js [viewer options](https://github.com/mozilla/pdf.js/wiki/Viewer-options) and [URL parameters](https://github.com/mozilla/pdf.js/wiki/Debugging-PDF.js#url-parameters) API. 
Supported in all [major browsers](https://caniuse.com/custom-elementsv1), and works with most [JS frameworks](https://custom-elements-everywhere.com/).

See [examples](https://alekswebnet.github.io/pdfjs-viewer-element/#demo) of usage in Vue, React, Svelte, or simple HTML pages.

⚠️ `pdfjs-viewer-element` requires PDF.js [prebuilt](http://mozilla.github.io/pdf.js/getting_started/), that includes the generic build of PDF.js and the viewer.

The prebuilt comes with each PDF.js release. Supported releases:

✅ [v4.0.379](https://github.com/mozilla/pdf.js/releases/tag/v4.0.379)

✅ [v4.0.269](https://github.com/mozilla/pdf.js/releases/tag/v4.0.269)

✅ [v4.0.189](https://github.com/mozilla/pdf.js/releases/tag/v4.0.189)


To use the package you should download and **place the prebuilt** files in the project.

Then specify the path to the directory with the `viewer-path` property (`/pdfjs` by default).

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
# With pnpm
pnpm add pdfjs-viewer-element
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
<pdfjs-viewer-element src="/file.pdf" viewer-path="/pdfjs-4.0.379-dist"></pdfjs-viewer-element>
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

`viewer-css-theme` - Apply automatic, light, or dark theme `AUTOMATIC | LIGHT | DARK`

`viewer-extra-styles` - Add your CSS rules to the viewer application

`viewer-extra-styles-urls` - Add external CSS files to the viewer application

Play with attributes on [Api docs page](https://alekswebnet.github.io/pdfjs-viewer-element/#api).

## Viewer CSS theme

Use `viewer-css-theme` attribute to set light or dark theme manually:

```html
<pdfjs-viewer-element 
  src="/file.pdf" 
  viewer-path="/pdfjs-4.0.379-dist"
  viewer-css-theme="DARK">
</pdfjs-viewer-element>
```

## Viewer extra styles 

You can add your own CSS rules to the viewer application using `viewer-extra-styles` or `viewer-extra-styles-urls` attribute:

```html
<pdfjs-viewer-element 
  src="/file.pdf" 
  viewer-path="/pdfjs-4.0.379-dist"
  viewer-extra-styles="#toolbarViewerMiddle { display: none; }"
  viewer-extra-styles-urls="['/demo/extra-styles-one.css', '/demo/extra-styles-two.css']">
</pdfjs-viewer-element>
```

## PDF.js Viewer Application

`initialize` - using this method you can access PDFViewerApplication and use methods and events of PDF.js default viewer

```html
<pdfjs-viewer-element viewer-path="/pdfjs-4.0.379-dist"></pdfjs-viewer-element>
```

```javascript
const viewer = document.querySelector('pdfjs-viewer-element')
// Wait for the viewer initialization, receive PDFViewerApplication
const viewerApp = await viewer.initialize()
// Open PDF file data using Uint8Array instead of URL
viewerApp.open({ data: pdfData })
```

## License
[MIT](http://opensource.org/licenses/MIT)
