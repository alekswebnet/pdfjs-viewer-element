# pdfjs-viewer-element

[![npm version](https://img.shields.io/npm/v/pdfjs-viewer-element?logo=npm&logoColor=fff)](https://www.npmjs.com/package/pdfjs-viewer-element)
[![Package Quality](https://packagequality.com/shield/pdfjs-viewer-element.svg)](https://packagequality.com/#?package=pdfjs-viewer-element)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/57ac3a0ca9134749a4000cc0fc3675ee)](https://www.codacy.com/gh/alekswebnet/pdfjs-viewer-element/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=alekswebnet/pdfjs-viewer-element&amp;utm_campaign=Badge_Grade)

A web component for viewing pdf files in the browser. The package is based on [PDF.js viewer](https://mozilla.github.io/pdf.js/web/viewer.html) build and works with any framework. See [demo](https://alekswebnet.github.io/pdfjs-viewer-element/index.html).

⚠️ `pdfjs-viewer-element` uses PDF.js [prebuilt](http://mozilla.github.io/pdf.js/getting_started/), that includes the generic build of PDF.js and the viewer. To use the package you should download and **place the prebuilt** files to some directory of your project. You may specify the path to this directory with `viewer-path` property (`/pdfjs` by default).

## Install
```
npm install --save pdfjs-viewer-element
```

```
yarn add pdfjs-viewer-element
```

or

```
<script type="module" src="https://cdn.skypack.dev/pdfjs-viewer-element"></script>
```

## Usage

Place **PDF.js prebuilt** files to some directory of your project (`pdfjs` used as the standard name). See demo [example](https://github.com/alekswebnet/pdfjs-viewer-element/tree/master/public). You may call the directory as you want, but then you should specify the `viewer-path` property.

```javascript
import 'pdfjs-viewer-element'
```

```javascript
<pdfjs-viewer-element src="/compressed.tracemonkey-pldi-09.pdf" viewer-path="/path-to-viewer"></pdfjs-viewer-element>
```

## Properties

`src` - path to pdf file.

`viewer-path` - path to prebuilt directory (`/pdfjs` by default).

`locale` - language localization (e.g. 'en', 'en-US', 'es', 'de'), see [pdf.js i10n files](https://github.com/mozilla/pdf.js/tree/master/l10n) (the language of your browser by default)
## License
For this package - [MIT](http://opensource.org/licenses/MIT).

For the `pdf.js` library - https://github.com/mozilla/pdf.js/blob/master/LICENSE.
