# pdfjs-viewer

A standalone, isolated, self-hostable, plug-in custom element for viewing PDF files, based on [PDF.js default viewer](https://mozilla.github.io/pdf.js/web/viewer.html).

[![npm version](https://img.shields.io/npm/v/@missing-elements/pdfjs-viewer?logo=npm&logoColor=fff)](https://www.npmjs.com/package/@missing-elements/pdfjs-viewer)
[![](https://data.jsdelivr.com/v1/package/npm/@missing-elements/pdfjs-viewer/badge)](https://www.jsdelivr.com/package/npm/@missing-elements/pdfjs-viewer)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/pdfjs-viewer-element)

![PDF.js viewer](image.webp)

## Features

- Standalone isolated web component with no runtime dependencies
- Drop-in, iframe-based PDF.js default viewer for any web app
- Self-hosted by default, no CDN needed. Built-in worker is enabled by default for stricter CSP compatibility
- Same-origin and cross-origin PDF URLs are supported
- Configure via attributes (page, zoom, search, pagemode, locale)
- Resource path attributes for PDF.js internals (`worker-src`, `c-map-url`, `icc-url`, `standard-font-data-url`, `wasm-url`, and more)
- Bundler friendly: Vite, Rollup and webpack pick up the viewer runtime files automatically, `assets-base` covers everything else
- Access to PDF.js viewer application - `PDFViewerApplication` via the `initPromise` property
- Configure PDF.js viewer instance options - `PDFViewerApplicationOptions` via the `setViewerOptions` method
- Built-in Paper & Ink default theme. Theme customisation, theme control (automatic/light/dark) and custom CSS injection
- Locale override support using PDF.js viewer locales
- Bundled PDF.js release version: `6.4.299`

## Docs

[Getting started](https://alekswebnet.github.io/pdfjs-viewer-element/)

[API playground](https://alekswebnet.github.io/pdfjs-viewer-element/#api)

[CodePen demo](https://codepen.io/redrobot753/pen/bNwVVvp)

[CodePen demo React](https://codepen.io/redrobot753/pen/xbEwNrO)

[CodePen demo Vue](https://codepen.io/redrobot753/pen/JoRYqwN)

[Usage examples](https://github.com/missing-elements/pdfjs-viewer/tree/master/demo)

[Accessibility guidance](./ACCESSIBILITY.md)

[Contributing](./CONTRIBUTING.md)

## Install

### Using module bundlers:

```bash
# With npm
npm install @missing-elements/pdfjs-viewer
# With pnpm
pnpm add @missing-elements/pdfjs-viewer
```

### Using browser and CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@missing-elements/pdfjs-viewer/dist/pdfjs-viewer-element.js"></script>
```

### Migrating from `pdfjs-viewer-element`

The package was previously published as [`pdfjs-viewer-element`](https://www.npmjs.com/package/pdfjs-viewer-element), which is now deprecated. Only the package name changed: the `<pdfjs-viewer-element>` tag, file names and API are the same.

```bash
npm uninstall pdfjs-viewer-element
npm install @missing-elements/pdfjs-viewer
```

Update imports and CDN URLs from `pdfjs-viewer-element` to `@missing-elements/pdfjs-viewer`.

## Usage

```html
<pdfjs-viewer-element
  src="https://alekswebnet.github.io/sample-pdf-with-images.pdf"
  style="height: 100dvh">
</pdfjs-viewer-element>
```

The element is block-level and needs an explicit height.

### Framework usage

- [React integration example](https://codepen.io/redrobot753/pen/xbEwNrO)
- [Vue integration example](https://codepen.io/redrobot753/pen/JoRYqwN)

## Attributes

| <div style="min-width: 19ch">Attribute</div> | <div style="min-width: 15ch">Description</div> | Default |
| --- | --- | --- |
| src | PDF file URL. | `''` |
| iframe&#8209;title | Title for the internal `iframe` (recommended for accessibility). | `PDF viewer window` |
| page | Page number. | `''` |
| search | Search query text. | `''` |
| phrase | Phrase search mode, set to `true` to enable phrase matching. | `''` |
| zoom | Zoom level (for example `auto`, `page-width`, `200%`). | `''` |
| pagemode | Sidebar mode: `thumbs`, `bookmarks`, `attachments`, `layers`, `none`. | `none` |
| locale | Viewer UI locale (for example `en-US`, `de`, `uk`). [Available locales](https://github.com/mozilla/pdf.js/tree/master/l10n) | `''` |
| locale&#8209;src&#8209;template | Locale file URL template. Must contain `{locale}` placeholder. Used together with `locale`. | `https://cdn.jsdelivr.net/gh/mozilla-l10n/firefox-l10n@main/{locale}/toolkit/toolkit/pdfviewer/viewer.ftl` |
| viewer&#8209;css&#8209;theme | Viewer theme: `AUTOMATIC`, `LIGHT`, `DARK`. | `AUTOMATIC` |
| assets&#8209;base | Directory URL of the viewer runtime files (`viewer.mjs`, `pdf.mjs`, `pdf.worker.min.mjs`, `viewer.css`, `paper-and-ink.css`). Only needed when your bundler does not handle `new URL('./file', import.meta.url)`, see [Bundlers](#bundlers-and-assets-base). | folder of `pdfjs-viewer-element.js` |
| worker&#8209;src | PDF.js worker URL override. | bundled worker (`./build/pdf.worker.mjs` in dev, `pdf.worker.min.mjs` next to the element or in `assets-base`) |
| pdf&#8209;src | PDF.js library module URL override. | bundled `pdf.mjs`, or `assets-base + pdf.mjs` |
| viewer&#8209;src | PDF.js viewer module URL override. | bundled `viewer.mjs`, or `assets-base + viewer.mjs` |
| viewer&#8209;css&#8209;src | PDF.js viewer stylesheet URL override. | bundled `viewer.css`, or `assets-base + viewer.css` |
| theme&#8209;css&#8209;src | Paper & Ink theme stylesheet URL override. | bundled `paper-and-ink.css`, or `assets-base + paper-and-ink.css` |
| debugger&#8209;src | PDF.js debugger script URL (`debuggerSrc` option). | `./debugger.mjs` |
| c&#8209;map&#8209;url | CMap directory URL (`cMapUrl` option). | `../web/cmaps/` |
| icc&#8209;url | ICC profile directory URL (`iccUrl` option). | `../web/iccs/` |
| image&#8209;resources&#8209;path | Image resources directory (`imageResourcesPath` option). Defaults to `assets-base + images/` when `assets-base` is set, otherwise `./images/`. | `./images/` |
| sandbox&#8209;bundle&#8209;src | Sandbox bundle URL (`sandboxBundleSrc` option). | `../build/pdf.sandbox.mjs` |
| standard&#8209;font&#8209;data&#8209;url | Standard fonts directory (`standardFontDataUrl` option). | `../web/standard_fonts/` |
| wasm&#8209;url | WASM assets directory (`wasmUrl` option). | `../web/wasm/` |

Play with attributes on [API docs page](https://alekswebnet.github.io/pdfjs-viewer-element/#api).

## Runtime updates

Most attributes can be updated dynamically:

- `src` updates by calling PDF.js `open({ url })` without rebuilding the viewer.
- `page`, `search`, `phrase`, `zoom`, `pagemode` update via hash parameters.
- `viewer-css-theme` updates the viewer theme at runtime.
- `worker-src`, `debugger-src`, `c-map-url`, `icc-url`, `image-resources-path`, `sandbox-bundle-src`, `standard-font-data-url`, `wasm-url` update viewer options for subsequent document loads.
- `locale` rebuilds the viewer so localization resources can be applied.
- `assets-base`, `pdf-src`, `viewer-src`, `viewer-css-src`, `theme-css-src` and `locale-src-template` are read when the viewer is (re)initialized, so set them before the element is attached. Changing them alone does not reload the viewer.

## Bundlers and assets base

The component loads the PDF.js viewer at runtime from five files shipped in the package `dist` folder: `viewer.mjs`, `pdf.mjs`, `pdf.worker.min.mjs`, `viewer.css` and `paper-and-ink.css`. They are referenced as `new URL('./file', import.meta.url)`, and each one is self-contained, so bundlers that understand this pattern emit them as hashed assets and rewrite the URLs on their own. Nothing to configure for Vite (build and dev), Rollup or webpack 5.

Bundlers that do not analyse `new URL(..., import.meta.url)`, esbuild among them, move the element into an app chunk without the files, and the viewer fails with 404s. Serve the package `dist` folder from a static path and point `assets-base` at it. The same attribute lets you load the files from a CDN:

```html
<pdfjs-viewer-element
  src="/file.pdf"
  assets-base="https://cdn.jsdelivr.net/npm/@missing-elements/pdfjs-viewer@4/dist/">
</pdfjs-viewer-element>
```

- The value is a directory URL, relative to the page or absolute. A trailing slash is added when missing.
- Individual runtime URL attributes take precedence over `assets-base` for their respective files, including `worker-src`.
- The attribute is read when the viewer is (re)initialized, so set it before the element is attached to the document.

PDF.js annotation icons are a separate case: the viewer loads them at runtime as `imageResourcesPath + 'annotation-' + name + '.svg'`, a dynamic name no bundler can emit. If `assets-base` is set, `imageResourcesPath` defaults to `assets-base + 'images/'`. Otherwise serve the package `dist/images` folder and set `image-resources-path` explicitly.

## Worker source

By default, the component uses the bundled worker (same-origin), which is CSP-friendly in strict `script-src 'self'` environments.

- Dev mode default: `./build/pdf.worker.mjs`
- Dist/default package default: `pdf.worker.min.mjs` next to `pdfjs-viewer-element.js`, or the hashed copy your bundler emitted
- With `assets-base`: `pdf.worker.min.mjs` inside that folder

Set `worker-src` only if you want to serve the worker from a custom location (for example your own CDN or static assets path).

- The URL must point to a valid PDF.js module worker file.
- The worker version should match the bundled PDF.js version.

```html
<pdfjs-viewer-element
  src="/file.pdf"
  worker-src="https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.worker.min.mjs">
</pdfjs-viewer-element>
```

## Locale source template

Use `locale-src-template` when you need to load localization files from a custom host.

- The template must include `{locale}`.
- `{locale}` is replaced by the `locale` attribute value (for example `de`, `uk`, `en-US`).
- If `locale` is not set, no locale file is loaded.
- Changes to `locale-src-template` are applied when the viewer is (re)initialized, for example after setting/changing `locale`.

Example:

```html
<pdfjs-viewer-element
  src="/file.pdf"
  locale="de"
  locale-src-template="https://cdn.example.com/pdfjs-locales/{locale}/viewer.ftl">
</pdfjs-viewer-element>
```

## Viewer CSS theme

The component includes and applies a default Paper & Ink theme from `src/themes/paper-and-ink.css`.

Use `viewer-css-theme` attribute to set light or dark theme manually:

```html
<pdfjs-viewer-element 
  src="/file.pdf" 
  viewer-css-theme="DARK">
</pdfjs-viewer-element>
```

Runtime example:

```javascript
const viewerElement = document.querySelector('pdfjs-viewer-element')
viewerElement.setAttribute('viewer-css-theme', 'DARK')
viewerElement.setAttribute('viewer-css-theme', 'LIGHT')
viewerElement.setAttribute('viewer-css-theme', 'AUTOMATIC')
```

## PDF.js resource attributes

You can override additional PDF.js viewer resource paths when needed:

```html
<pdfjs-viewer-element
  src="/file.pdf"
  worker-src="/pdf.worker.min.mjs"
  debugger-src="/debugger.mjs"
  c-map-url="/cmaps/"
  icc-url="/iccs/"
  image-resources-path="/images/"
  sandbox-bundle-src="/pdf.sandbox.mjs"
  standard-font-data-url="/standard_fonts/"
  wasm-url="/wasm/">
</pdfjs-viewer-element>
```

## Viewer custom styles

You can add your own CSS rules to the viewer application using `injectViewerStyles(styles: string)`:

```html
<pdfjs-viewer-element id="viewer" src="/file.pdf">
</pdfjs-viewer-element>
```

```javascript
const viewerElement = document.querySelector('#viewer')
viewerElement.injectViewerStyles(`
  #toolbarViewerMiddle, #toolbarViewerRight { display: none; }
`)
```

`injectViewerStyles(...)` applies styles immediately when the viewer document is ready, and keeps them for future rebuilds.

## Methods and properties

`injectViewerStyles(styles: string)` - Adds custom CSS to the viewer now (when ready) and for future rebuilds.

```javascript
const viewerElement = document.querySelector('pdfjs-viewer-element')

await viewerElement.injectViewerStyles(`
  #toolbarViewerRight { display: none; }
  #findbar { border-top: 2px solid #0200a8; }
`)
```

`initPromise: Promise<InitializationData>` - Resolves after internal viewer is completely loaded and initialized, returning `{ viewerApp }`, that gives a programmatic access to PDF.js viewer app (PDFViewerApplication).

```javascript
const viewerElement = document.querySelector('pdfjs-viewer-element')
const { viewerApp } = await viewerElement.initPromise

viewerApp.open({ url: '/sample.pdf' })
```

`setViewerOptions(options: Record<string, string | number>): Promise<{ viewerOptions: IframeWindow['PDFViewerApplicationOptions'] }>`

Updates PDF.js viewer options at runtime. Call this method with an object of key-value pairs to set options such as resource paths, rendering settings, or other PDFViewerApplicationOptions. Resolves after the viewer is initialized and returns the `viewerOptions` for testing purpose.

```javascript
const viewerElement = document.querySelector('pdfjs-viewer-element')
await viewerElement.setViewerOptions({
  enableComment: true,
  enableSignatureEditor: true
})
```

`iframe: PdfjsViewerElementIframe` - Public reference to the internal `iframe` element. Useful when you need direct access to `contentWindow`/`contentDocument`.

```javascript
const viewerElement = document.querySelector('pdfjs-viewer-element')

// Access iframe window directly when needed.
const iframeWindow = viewerElement.iframe.contentWindow

// Read current location hash applied to the viewer.
console.log(iframeWindow.location.hash)

// Inspect iframe document title.
console.log(viewerElement.iframe.contentDocument.title)
```

You can also react to source changes dynamically:

```javascript
const viewerElement = document.querySelector('pdfjs-viewer-element')
viewerElement.setAttribute('src', '/another-file.pdf')
```

## Accessibility

Use `iframe-title` to add a title to the `iframe` element and improve accessibility.

## License
[MIT](http://opensource.org/licenses/MIT)
