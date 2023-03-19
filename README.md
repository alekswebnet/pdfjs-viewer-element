# pdfjs-viewer-element

[![npm version](https://img.shields.io/npm/v/pdfjs-viewer-element?logo=npm&logoColor=fff)](https://www.npmjs.com/package/pdfjs-viewer-element)
[![Package Quality](https://packagequality.com/shield/pdfjs-viewer-element.svg)](https://packagequality.com/#?package=pdfjs-viewer-element)

A web component for viewing pdf files in the browser. The package is based on [PDF.js default viewer](https://mozilla.github.io/pdf.js/web/viewer.html) build and works with any framework. See [demo](https://alekswebnet.github.io/pdfjs-viewer-element/).

⚠️ `pdfjs-viewer-element` uses PDF.js [prebuilt](http://mozilla.github.io/pdf.js/getting_started/), that includes the generic build of PDF.js and the viewer. To use the package you should download and **place the prebuilt** files to some directory of your project. Then specify the path to this directory with `viewer-path` property (`/pdfjs` by default).

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

`src` - Path to pdf file

`viewer-path` - Path to PDF.js prebuilt

`locale` - Language of the interface

`page` - Page number

`search` - Search text

`phrase` - Search by phrase

`zoom` - Zoom level

`pagemode` - Page mode

For more clarity, see the [demo playground]https://alekswebnet.github.io/pdfjs-viewer-element/#api).

## License
For this package - [MIT](http://opensource.org/licenses/MIT).

For the `pdf.js` library - https://github.com/mozilla/pdf.js/blob/master/LICENSE.
