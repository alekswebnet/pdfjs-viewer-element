# pdfjs-viewer-element

Custom element that embeds [PDF.js default viewer](https://mozilla.github.io/pdf.js/web/viewer.html) using the `iframe`.

The package provides a custom element, based on PDF.js [viewer options](https://github.com/mozilla/pdf.js/wiki/Viewer-options) and [URL parameters](https://github.com/mozilla/pdf.js/wiki/Debugging-PDF.js#url-parameters) API. 

Supported in all [major browsers](https://caniuse.com/custom-elementsv1), and works with most [JS frameworks](https://custom-elements-everywhere.com/).

[![npm version](https://img.shields.io/npm/v/pdfjs-viewer-element?logo=npm&logoColor=fff)](https://www.npmjs.com/package/pdfjs-viewer-element)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/alekswebnet/pdfjs-viewer-element)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/pdfjs-viewer-element)

![PDF.js viewer](image.webp)

## Features

- Standalone web component with no runtime dependencies
- Drop-in, iframe-based PDF.js default viewer for any web app
- Works with same-origin and cross-origin PDF documents
- Configure via attributes and URL parameters (page, zoom, search, pagemode, locale)
- Programmatic access to `PDFViewerApplication` and `PDFViewerApplicationOptions` via the `initialized` event
- Theme control (automatic/light/dark) plus custom CSS injection
- Locale override support using PDF.js viewer locales
- Supports all modern browsers and most JS frameworks

## Docs

[Getting started](https://alekswebnet.github.io/pdfjs-viewer-element/)

[API playground](https://alekswebnet.github.io/pdfjs-viewer-element/#api)

[CodePen demo](https://codepen.io/redrobot753/pen/bNwVVvp)

[Various use cases](https://github.com/alekswebnet/pdfjs-viewer-element/tree/master/demo)

## Install

### Using module bundlers:

```bash
# With npm
npm install pdfjs-viewer-element
# With pnpm
pnpm add pdfjs-viewer-element
```

```javascript
import 'pdfjs-viewer-element'
```

### Using browser and CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/pdfjs-viewer-element/dist/pdfjs-viewer-element.js"></script>
```

## Usage

```html
<pdfjs-viewer-element
  src="/sample.pdf"
  style="height: 100dvh">
</pdfjs-viewer-element>
```

The element is block-level and needs an explicit height.

## Attributes

| Attribute | Description | Default |
| --- | --- | --- |
| `src` | PDF file URL. | `''` |
| `iframe-title` | Title for the internal `iframe` (recommended for accessibility). | `PDF viewer window` |
| `page` | Page number. | `''` |
| `search` | Search query text. | `''` |
| `phrase` | Phrase search mode, set to `true` to enable phrase matching. | `''` |
| `zoom` | Zoom level (for example `auto`, `page-width`, `200%`). | `''` |
| `pagemode` | Sidebar mode: `thumbs`, `bookmarks`, `attachments`, `layers`, `none`. | `none` |
| `locale` | Viewer UI locale (for example `en-US`, `de`, `uk`). [Available locales](https://github.com/mozilla/pdf.js/tree/master/l10n) | `''` |
| `viewer-css-theme` | Viewer theme: `AUTOMATIC`, `LIGHT`, `DARK`. | `AUTOMATIC` |
| `worker-src` | PDF.js worker URL override. | `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs` |

Play with attributes on [API docs page](https://alekswebnet.github.io/pdfjs-viewer-element/#api).

## Runtime updates

Most attributes can be updated dynamically:

- `src` updates by calling PDF.js `open({ url })` without rebuilding the viewer.
- `page`, `search`, `phrase`, `zoom`, `pagemode` update via hash parameters.
- `viewer-css-theme` updates the viewer theme at runtime.
- `worker-src` updates viewer options for subsequent document loads.
- `locale` rebuilds the viewer so localization resources can be applied.

## Viewer CSS theme

Use `viewer-css-theme` attribute to set light or dark theme manually:

```html
<pdfjs-viewer-element 
  src="/file.pdf" 
  viewer-css-theme="DARK">
</pdfjs-viewer-element>
```

Runtime example:

```javascript
const viewer = document.querySelector('pdfjs-viewer-element')
viewer.setAttribute('viewer-css-theme', 'DARK')
viewer.setAttribute('viewer-css-theme', 'AUTOMATIC')
```

## Viewer custom styles

You can add your own CSS rules to the viewer application using `injectViewerStyles(styles: string)`:

```html
<pdfjs-viewer-element id="viewer" src="/file.pdf">
</pdfjs-viewer-element>
```

```javascript
const viewer = document.querySelector('#viewer')
viewer.injectViewerStyles(`
  #toolbarViewerMiddle, #toolbarViewerRight { display: none; }
`)
```

`injectViewerStyles(...)` applies styles immediately when the viewer document is ready, and keeps them for future rebuilds.

Build your own theme with viewer custom variables and inject it via `injectViewerStyles(...)`:

```css
:root {
  --main-color: #5755FE;
  --toolbar-icon-bg-color: #0200a8;
  --field-color: #5755FE;
  --separator-color: #5755FE;
  --toolbar-border-color: #5755FE;
  --field-border-color: #5755FE;
  --toolbar-bg-color: rgba(139, 147, 255, .1);
  --body-bg-color: rgba(255, 247, 252, .7);
  --button-hover-color: rgba(139, 147, 255, .1);
  --toolbar-icon-hover-bg-color: #0200a8;
  --toggled-btn-color: #0200a8;
  --toggled-btn-bg-color: rgba(139, 147, 255, .1);
  --toggled-hover-active-btn-color: #5755FE;
  --doorhanger-hover-bg-color: rgba(139, 147, 255, .1);
  --doorhanger-hover-color: #0200a8;
  --dropdown-btn-bg-color: rgba(139, 147, 255, .1);
}
```

## Methods

`injectViewerStyles(styles: string)` - Adds custom CSS to the viewer now (when ready) and for future rebuilds.

## Programmatic access to PDF.js

```html
<pdfjs-viewer-element></pdfjs-viewer-element>
```

```javascript
// Open PDF file programmatically accessing the viewer application
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('pdfjs-viewer-element').addEventListener('initialized', (event) => {
    const { viewerApp, viewerOptions } = event.detail
    viewerApp.open({ data: pdfData })
  })
})
```

You can also react to source changes dynamically:

```javascript
const viewer = document.querySelector('pdfjs-viewer-element')
viewer.setAttribute('src', '/another-file.pdf')
```

## Events

`initialized` - Fired after the PDF.js viewer is ready (after `PDFViewerApplication.initializedPromise` resolves). The event `detail` contains:

- `viewerApp` (`PDFViewerApplication`)
- `viewerOptions` (`PDFViewerApplicationOptions`)

The event is emitted each time the internal viewer is rebuilt (for example after changing `locale`).

## Migration notes

If you are upgrading from an older version:

- `viewer-extra-styles` and `viewer-extra-styles-urls` attributes are removed.
- Use `injectViewerStyles(styles)` instead of style attributes.
- Use the `initialized` event for `viewerApp` / `viewerOptions` access.
- Runtime `src` updates are supported with `setAttribute('src', ...)`.

## Accessibility

Use `iframe-title` to add a title to the `iframe` element and improve accessibility.

## Known issues

### The `.mjs` files support

Since v4 PDF.js requires `.mjs` files support, make sure your server has it.

In case of `nginx` this may cause errors, see https://github.com/mozilla/pdf.js/issues/17296

Add `.mjs` files support for `nginx` example:

```bash
server {
    # ...

    location / {
        root   /usr/share/nginx/html;
        index  index.html;

        location ~* \.mjs$ {
            types {
                text/javascript mjs;
            }
        }
    }
}
```

## Support via Ko-fi

If you find `pdfjs-viewer-element` useful and want to support its development, consider making a donation via Ko-fi:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/oleksandrshevchuk)

> ❤️ Your support helps with maintenance, bug fixes, and long-term improvements.

## License
[MIT](http://opensource.org/licenses/MIT)
