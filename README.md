# pdfjs-viewer-element

A web component for [PDF.js viewer](https://mozilla.github.io/pdf.js/web/viewer.html). See [demo](https://alekswebnet.github.io/pdfjs-viewer-element/index.html).

⚠️ `pdfjs-viewer-element` uses PDF.js [prebuilt](https://github.com/mozilla/pdf.js/releases/download/v2.15.349/pdfjs-2.15.349-dist.zip), that includes the generic build of PDF.js and the viewer. To use the package you should to **extract the prebuilt** file into a public directory of your project.

## Install
```
npm install --save pdfjs-viewer-element
```

or

```
yarn add pdfjs-viewer-element
```

## Usage
Import to your project:

```javascript
import 'pdfjs-viewer-element'
```

Extract the PDF.js prebuilt. See [example](https://github.com/alekswebnet/pdfjs-viewer-element/tree/master/public).

Use the element inside your template:

```javascript
<pdfjs-viewer-element 
  src="/pdfjs-2.15.349-dist/web/compressed.tracemonkey-pldi-09.pdf"
  height="100vh">
</pdfjs-viewer-element>
```
## License
[MIT](http://opensource.org/licenses/MIT)