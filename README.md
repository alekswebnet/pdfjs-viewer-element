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
- Configure via attributes and URL parameters (page, zoom, search, pagemode, locale, named destination)
- Programmatic access to `PDFViewerApplication` and `PDFViewerApplicationOptions` via the `initialized` event
- Theme control (automatic/light/dark) plus custom CSS injection or external stylesheets
- Locale override support using PDF.js viewer locales
- Works in modern browsers and most JS frameworks

## Docs

[Getting started](https://alekswebnet.github.io/pdfjs-viewer-element/)

[API playground](https://alekswebnet.github.io/pdfjs-viewer-element/#api)

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
<pdfjs-viewer-element src="path-to/file.pdf"></pdfjs-viewer-element>
```

## Attributes

`src` - PDF file URL, should refer to the [same origin](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#can-i-load-a-pdf-from-another-server-cross-domain-request) 

`iframe-title` - The title of the `iframe` element, required for better accessibility

`page` - Page number.

`search` - Search text.

`phrase` - Search by phrase, `true` to enable.

`zoom` - Zoom level.

`pagemode` - Page mode, `thumbs | bookmarks | attachments | layers | none`.

`locale` -  Specifies which language to use in the viewer UI, `en-US | ...`. [Available locales](https://github.com/mozilla/pdf.js/tree/master/l10n)

`viewer-css-theme` - Apply automatic, light, or dark theme, `AUTOMATIC | LIGHT | DARK`

`viewer-extra-styles` - Add your CSS rules to the viewer application, pass a string with styles.

`viewer-extra-styles-urls` - Add external CSS files to the viewer application, pass an array with URLs.

Play with attributes on [API docs page](https://alekswebnet.github.io/pdfjs-viewer-element/#api).

## Viewer CSS theme

Use `viewer-css-theme` attribute to set light or dark theme manually:

```html
<pdfjs-viewer-element 
  src="/file.pdf" 
  viewer-css-theme="DARK">
</pdfjs-viewer-element>
```

## Viewer custom styles 

You can add your own CSS rules to the viewer application using `viewer-extra-styles` or `viewer-extra-styles-urls` attribute:

```html
<pdfjs-viewer-element 
  src="/file.pdf" 
  viewer-extra-styles="#toolbarViewerMiddle { display: none; }"
  viewer-extra-styles-urls="['/demo/viewer-custom-theme.css']">
</pdfjs-viewer-element>
```
Build your own theme with viewer's custom variables and `viewer-extra-styles-urls` attribute: 

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

## PDF.js Viewer Application and Options

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

## Events

`initialized` - Fired after the PDF.js viewer is ready (after `PDFViewerApplication.initializedPromise` resolves). The event `detail` contains:

- `viewerApp` (`PDFViewerApplication`)
- `viewerOptions` (`PDFViewerApplicationOptions`)

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
