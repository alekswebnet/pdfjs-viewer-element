# pdfjs-viewer-element

A web component for [PDF.js viewer](https://mozilla.github.io/pdf.js/web/viewer.html). See [demo](https://alekswebnet.github.io/pdfjs-viewer-element/index.html).

⚠️ `pdfjs-viewer-element` uses PDF.js [prebuilt](https://github.com/mozilla/pdf.js/releases/download/v3.4.120/pdfjs-3.4.120-dist.zip), that includes the generic build of PDF.js and the viewer. To use the package you should **extract the prebuilt** files into some directory of your project. You may specify the path to this directory with `viewer-path` property (by default is '/pdfjs').

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

Extract the PDF.js prebuilt. See demo [example](https://github.com/alekswebnet/pdfjs-viewer-element/tree/master/public).

```javascript
import 'pdfjs-viewer-element'
```

```javascript
<pdfjs-viewer-element src="/compressed.tracemonkey-pldi-09.pdf" viewer-path="/path-to-viewer"></pdfjs-viewer-element>
```

## Properties

`src` - path to pdf file.

`viewer-path` - path to prebuilt directory (by default is '/pdfjs').
## License
[MIT](http://opensource.org/licenses/MIT)
