import type { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api'
import type { EventBus } from 'pdfjs-dist/types/web/event_utils'

// The viewer runtime files ship next to this module (see scripts/copy-worker.mjs) and are
// resolved relative to `import.meta.url`. The production file names do not exist next to this
// source file at build time, so without `@vite-ignore` Vite would rewrite the calls to
// `new URL('./file', '' + import.meta.url)`, a form consumer bundlers skip. Kept as plain
// `new URL('./file', import.meta.url)`, Vite, Rollup and webpack in the consuming app emit the
// files as assets and rewrite the URLs themselves. Bundlers that do not analyse this pattern
// relocate the module without the files; those hosts serve the package `dist` folder from a
// static path and point `assets-base` at it.
const DEFAULT_BUILT_IN_WORKER_SRC = import.meta.env.DEV
  ? new URL('./build/pdf.worker.mjs', import.meta.url).href
  : new URL(/* @vite-ignore */ './pdf.worker.min.mjs', import.meta.url).href

const DEFAULT_PDF_SRC = import.meta.env.DEV
  ? new URL('./build/pdf.mjs', import.meta.url).href
  : new URL(/* @vite-ignore */ './pdf.mjs', import.meta.url).href

const DEFAULT_VIEWER_SRC = import.meta.env.DEV
  ? new URL('./web/viewer.mjs', import.meta.url).href
  : new URL(/* @vite-ignore */ './viewer.mjs', import.meta.url).href

const DEFAULT_VIEWER_CSS_SRC = import.meta.env.DEV
  ? new URL('./web/viewer.css', import.meta.url).href
  : new URL(/* @vite-ignore */ './viewer.css', import.meta.url).href

const DEFAULT_PAPER_AND_INK_THEME_CSS_SRC = import.meta.env.DEV
  ? new URL('./themes/paper-and-ink.css', import.meta.url).href
  : new URL(/* @vite-ignore */ './paper-and-ink.css', import.meta.url).href

// File names inside the package `dist` folder, used when `assets-base` is set.
const DIST_FILE_NAMES = {
  workerSrc: 'pdf.worker.min.mjs',
  pdfjsLibSrc: 'pdf.mjs',
  viewerSrc: 'viewer.mjs',
  viewerCssSrc: 'viewer.css',
  themeCssSrc: 'paper-and-ink.css'
} as const

type RuntimeFileUrls = Record<keyof typeof DIST_FILE_NAMES, string>

const DEFAULT_RUNTIME_FILE_URLS: RuntimeFileUrls = {
  workerSrc: DEFAULT_BUILT_IN_WORKER_SRC,
  pdfjsLibSrc: DEFAULT_PDF_SRC,
  viewerSrc: DEFAULT_VIEWER_SRC,
  viewerCssSrc: DEFAULT_VIEWER_CSS_SRC,
  themeCssSrc: DEFAULT_PAPER_AND_INK_THEME_CSS_SRC
}

const DEFAULTS = {
  src: '',
  iframeTitle: 'PDF viewer window',
  page: '',
  search: '',
  phrase: '',
  zoom: '',
  pagemode: 'none',
  locale: '',
  viewerCssTheme: 'AUTOMATIC',
  debuggerSrc: './debugger.mjs',
  cMapUrl: '../web/cmaps/',
  iccUrl: '../web/iccs/',
  imageResourcesPath: './images/',
  sandboxBundleSrc: '../build/pdf.sandbox.mjs',
  standardFontDataUrl: '../web/standard_fonts/',
  wasmUrl: '../web/wasm/',
  localeSrcTemplate: 'https://cdn.jsdelivr.net/gh/mozilla-l10n/firefox-l10n@main/{locale}/toolkit/toolkit/pdfviewer/viewer.ftl'
} as const

export const ViewerCssTheme = { AUTOMATIC: 0, LIGHT: 1, DARK: 2 } as const

export type PdfViewerApplicationOpenParameters =
  (DocumentInitParameters & { originalUrl?: string }) | Uint8Array

export type PdfViewerApplicationOptionValue =
  string | boolean | number | Record<string, unknown>

export interface PdfViewerApplication {
  initializedPromise: Promise<void>
  initialized: boolean
  eventBus: EventBus
  open: (params: PdfViewerApplicationOpenParameters) => void | Promise<void>
}

export interface PdfViewerApplicationOptions {
  set: (name: string, value: PdfViewerApplicationOptionValue) => void
  getAll: () => Record<string, unknown>
}

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.innerHTML = `
      <style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:100%}</style>
      <iframe frameborder="0" width="100%" loading="lazy"></iframe>
    `
  }

  public iframe!: PdfjsViewerElementIframe
  public initPromise: Promise<InitializationData> = Promise.resolve({})
  private localeResourceUrl?: string
  private localeResourceLink?: HTMLLinkElement
  private viewerStyles = new Set<string>()
  private optionsToSet: Record<string, PdfViewerApplicationOptionValue> = {}

  static get observedAttributes() {
    return[
      'src', 'locale', 'viewer-css-theme', 'worker-src',
      'debugger-src', 'c-map-url', 'icc-url', 'image-resources-path',
      'sandbox-bundle-src', 'standard-font-data-url', 'wasm-url',
      'page', 'search', 'phrase', 'zoom', 'pagemode', 'iframe-title'
    ]
  }

  private formatTemplate(template: string, params: Record<string, any>) {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      if (!(key in params)) throw new Error(`Missing param: ${key}`);
      return String(params[key]);
    });
  }

  private getFullPath(path: string) {
    if (!path) return path

    try {
      return new URL(path, window.location.href).href
    } catch {
      return path
    }
  }

  private getAssetsBase() {
    const value = this.getAttribute('assets-base')?.trim()
    if (!value) return ''
    return this.getFullPath(value.endsWith('/') ? value : `${value}/`)
  }

  // Read when the viewer is (re)built, so the attribute must be present before connection.
  private getRuntimeFileUrls(): RuntimeFileUrls {
    const assetsBase = this.getAssetsBase()

    const resolveFile = (field: keyof typeof DIST_FILE_NAMES) => {
      const attr = this.getAttribute(field.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`))?.trim()
      if (attr) return this.getFullPath(attr)
      if (!assetsBase) return DEFAULT_RUNTIME_FILE_URLS[field]

      const fileName = DIST_FILE_NAMES[field]
      try {
        return new URL(fileName, assetsBase).href
      } catch {
        return `${assetsBase}${fileName}`
      }
    }

    return {
      workerSrc: resolveFile('workerSrc'),
      pdfjsLibSrc: resolveFile('pdfjsLibSrc'),
      viewerSrc: resolveFile('viewerSrc'),
      viewerCssSrc: resolveFile('viewerCssSrc'),
      themeCssSrc: resolveFile('themeCssSrc')
    }
  }

  private getImageResourcesPath() {
    const imageResourcesPath = this.getAttribute('image-resources-path')
    if (imageResourcesPath) return imageResourcesPath

    const assetsBase = this.getAssetsBase()
    if (!assetsBase) return DEFAULTS.imageResourcesPath

    try {
      return new URL('images/', assetsBase).href
    } catch {
      return `${assetsBase}images/`
    }
  }

  private getCssThemeOption() {
    const attrValue = this.getAttribute('viewer-css-theme') as keyof typeof ViewerCssTheme
    return Object.keys(ViewerCssTheme).includes(attrValue) 
      ? ViewerCssTheme[attrValue] 
      : ViewerCssTheme[DEFAULTS.viewerCssTheme]
  }

  private applyIframeHash = async () =>{
    const contentWindow = this.iframe?.contentWindow
    if (!contentWindow) return

    const hash = this.getIframeLocationHash()
    if (contentWindow.location.hash === hash) return

    await new Promise<void>((resolve) => {
      let settled = false
      const onHashChange = () => {
        if (settled) return
        settled = true
        contentWindow.removeEventListener('hashchange', onHashChange)
        resolve()
      }

      contentWindow.addEventListener('hashchange', onHashChange)
      contentWindow.location.hash = hash

      queueMicrotask(() => {
        if (contentWindow.location.hash === hash) {
          onHashChange()
        }
      })
    })
  }

  private applyViewerTheme() {
    const theme = this.getCssThemeOption()
    const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
    viewerOptions?.set('viewerCssTheme', theme)

    const doc = this.iframe.contentDocument
    if (!doc?.documentElement) return
    const mode = theme === ViewerCssTheme.LIGHT ? 'light' : theme === ViewerCssTheme.DARK ? 'dark' : ''
    if (mode) {
      doc.documentElement.style.setProperty('color-scheme', mode)
    } else {
      doc.documentElement.style.removeProperty('color-scheme')
    }
  }

  private appendRuntimeStyle(styles: string) {
    const doc = this.iframe?.contentDocument
    if (!doc?.head || !styles) return

    const exists = Array.from(doc.querySelectorAll('style'))
      .some((styleNode) => styleNode.textContent === styles)
    if (exists) return

    const styleElement = doc.createElement('style')
    styleElement.setAttribute('data-pdfjs-viewer-runtime-style', 'true')
    styleElement.textContent = styles
    doc.head.appendChild(styleElement)
  }

  private applyQueuedRuntimeStyles() {
    this.viewerStyles.forEach((styles) => {
      this.appendRuntimeStyle(styles)
    })
  }

  private injectScript(src: string, type = 'module') {
    const doc = this.iframe.contentDocument
    if (!doc) return Promise.resolve()
    if (!doc.head) {
      const head = doc.createElement('head')
      doc.documentElement?.prepend(head)
    }

    return new Promise<void>((resolve, reject) => {
      let cspViolationDetails = ''

      const onSecurityPolicyViolation = (event: SecurityPolicyViolationEvent) => {
        const directive = event.effectiveDirective || event.violatedDirective || 'unknown-directive'
        const blockedUri = event.blockedURI || 'unknown-uri'
        cspViolationDetails = ` (CSP ${directive} blocked ${blockedUri})`
      }

      const cleanup = () => {
        doc.removeEventListener('securitypolicyviolation', onSecurityPolicyViolation)
      }

      doc.addEventListener('securitypolicyviolation', onSecurityPolicyViolation)

      const script = doc.createElement('script')
      script.type = type
      script.src = src
      script.addEventListener('load', () => {
        cleanup()
        resolve()
      }, { once: true })
      script.addEventListener('error', () => {
        cleanup()
        reject(new Error(`Unable to load script: ${src}${cspViolationDetails}`))
      }, { once: true })
      doc.head?.appendChild(script)
    })
  }

  private applyLocaleAtRuntime = async () => {
    const viewerApp = this.iframe.contentWindow?.PDFViewerApplication as unknown as {
      initializedPromise?: Promise<void>
      externalServices?: { createL10n?: () => Promise<any> }
      l10n?: { destroy?: () => Promise<void> }
      appConfig?: { appContainer?: HTMLElement }
    }

    const doc = this.iframe.contentDocument
    if (!viewerApp || !doc) return false

    await viewerApp.initializedPromise
    const createL10n = viewerApp.externalServices?.createL10n
    if (typeof createL10n !== 'function') return false

    const nextL10n = await createL10n()
    if (!nextL10n) return false

    await viewerApp.l10n?.destroy?.()
    viewerApp.l10n = nextL10n

    const root = viewerApp.appConfig?.appContainer || doc.documentElement
    if (!root) return false

    if (typeof nextL10n.getDirection === 'function') {
      doc.documentElement?.setAttribute('dir', nextL10n.getDirection())
    }

    if (typeof nextL10n.translate === 'function') {
      await nextL10n.translate(root)
    }

    return true
  }

  private injectLocaleData = async () => {
    const doc = this.iframe.contentDocument as Document
    const locale = this.getAttribute('locale')
    if (!locale) {
      this.cleanupLocaleResource()
      return
    }
    const localesData = await import('./web/locale/locale.json?raw')
    const supportedLocales = Object.keys(JSON.parse(localesData.default))
    if (!supportedLocales.includes(locale as string)) {
      this.cleanupLocaleResource()
      return
    }
    const localeUrl = this.formatTemplate(
      this.getAttribute('locale-src-template') || DEFAULTS.localeSrcTemplate, 
      { locale }
    )
    const localeObject = {
      [String(locale)]: localeUrl
    }
    const localeLink = doc.createElement('link')
    localeLink.rel = 'resource'
    localeLink.type = 'application/l10n'
    this.cleanupLocaleResource()
    this.localeResourceUrl = URL.createObjectURL(
      new Blob([JSON.stringify(localeObject)], { type: 'application/json' })
    )
    localeLink.href = this.localeResourceUrl
    this.iframe.contentDocument?.head.appendChild(localeLink)
    this.localeResourceLink = localeLink
  }

  private cleanupLocaleResource() {
    if (this.localeResourceLink) {
      this.localeResourceLink.remove()
      this.localeResourceLink = undefined
    }
    if (this.localeResourceUrl) {
      URL.revokeObjectURL(this.localeResourceUrl)
      this.localeResourceUrl = undefined
    }
  }

  private onViewerAppCreated = () =>
    new Promise<IframeWindow['PDFViewerApplication']>((resolve) => {
      const contentWindow = this.iframe.contentWindow as IframeWindow
      if (contentWindow.PDFViewerApplication) return resolve(contentWindow.PDFViewerApplication)

      let appValue: IframeWindow['PDFViewerApplication'] | undefined

      Object.defineProperty(contentWindow, 'PDFViewerApplication', {
        get() { return appValue },
        set(value: IframeWindow['PDFViewerApplication']) {
          appValue = value
          resolve(value)
          delete contentWindow.PDFViewerApplication
          contentWindow.PDFViewerApplication = value
        },
        configurable: true
      });
    });

  private applyViewerOptions = () => {
    const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
    viewerOptions?.set('workerSrc', this.getRuntimeFileUrls().workerSrc)
    viewerOptions?.set('debuggerSrc', this.getAttribute('debugger-src') || DEFAULTS.debuggerSrc)
    viewerOptions?.set('cMapUrl', this.getAttribute('c-map-url') || DEFAULTS.cMapUrl)
    viewerOptions?.set('iccUrl', this.getAttribute('icc-url') || DEFAULTS.iccUrl)
    viewerOptions?.set('imageResourcesPath', this.getImageResourcesPath())
    viewerOptions?.set('sandboxBundleSrc', this.getAttribute('sandbox-bundle-src') || DEFAULTS.sandboxBundleSrc)
    viewerOptions?.set('standardFontDataUrl', this.getAttribute('standard-font-data-url') || DEFAULTS.standardFontDataUrl)
    viewerOptions?.set('wasmUrl', this.getAttribute('wasm-url') || DEFAULTS.wasmUrl)
    viewerOptions?.set('defaultUrl', this.getFullPath(this.getAttribute('src') || DEFAULTS.src))
    viewerOptions?.set('disablePreferences', true)
    viewerOptions?.set('eventBusDispatchToDOM', true)
    viewerOptions?.set('localeProperties', { lang: this.getAttribute('locale') || DEFAULTS.locale })
    viewerOptions?.set('viewerCssTheme', this.getCssThemeOption())
    for (const [key, value] of Object.entries(this.optionsToSet)) {
      viewerOptions?.set(key, value)
    }
    this.optionsToSet = {}
  }

  private getIframeLocationHash = () => {
    const params: Record<string, string> = {
      page: this.getAttribute('page') || DEFAULTS.page,
      zoom: this.getAttribute('zoom') || DEFAULTS.zoom,
      pagemode: this.getAttribute('pagemode') || DEFAULTS.pagemode,
      search: this.getAttribute('search') || DEFAULTS.search,
      phrase: this.getAttribute('phrase') || DEFAULTS.phrase,
      locale: this.getAttribute('locale') || DEFAULTS.locale
    }
    return '#' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  }

  private buildViewerEntry = async () => {
    return new Promise<void>(async (resolve) => {
      const viewerEntry = await import('virtual:pdfjs-viewer-html')
      const resolveHttpOrigin = (url: string) => {
        try {
          const parsed = new URL(url, window.location.href)
          if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return parsed.origin
          }
        } catch {
          // Ignore invalid URLs and keep CSP fallback values.
        }
        return ''
      }

      const toSourceList = (sources: string[]) =>
        Array.from(new Set(sources.filter(Boolean))).join(' ')

      const { pdfjsLibSrc, viewerSrc, viewerCssSrc, themeCssSrc, workerSrc } = this.getRuntimeFileUrls()
      const workerSrcOrigin = resolveHttpOrigin(workerSrc)

      const scriptSources = toSourceList([
        "'self'",
        window.location.origin,
        resolveHttpOrigin(pdfjsLibSrc),
        resolveHttpOrigin(viewerSrc),
        workerSrcOrigin
      ])

      const styleSources = toSourceList([
        "'self'",
        window.location.origin,
        resolveHttpOrigin(viewerCssSrc),
        resolveHttpOrigin(themeCssSrc)
      ])

      const workerSources = toSourceList([
        "'self'",
        'blob:',
        window.location.origin,
        workerSrcOrigin
      ])

      const srcdocCsp = [
        "default-src 'none'",
        `script-src ${scriptSources} 'wasm-unsafe-eval'`,
        `script-src-elem ${scriptSources}`,
        `worker-src ${workerSources}`,
        `style-src ${styleSources} 'unsafe-inline'`,
        `img-src ${styleSources} blob: data:`,
        'media-src blob:',
        `font-src ${styleSources} data:`,
        'connect-src * blob: data:',
        "base-uri 'none'",
        "form-action 'none'"
      ].join('; ')

      const viewerHtmlWithSrcdocCsp = viewerEntry.default.replace(
        /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i,
        `<meta http-equiv="Content-Security-Policy" content="${srcdocCsp};" />`
      )

      const completeHtml = viewerHtmlWithSrcdocCsp
        .replace('</head>', `
          <link rel="stylesheet" href="${viewerCssSrc}">
          <link rel="stylesheet" href="${themeCssSrc}">
          ${Array.from(this.viewerStyles).map(style => `<style>${style}</style>`).join('\n')}
        </head>`)
      this.iframe.addEventListener('load', () => resolve(), { once: true })
      this.iframe.srcdoc = completeHtml
    })
  }

  private setupViewerApp = async () => {
    const viewerApp = await this.onViewerAppCreated()
    this.applyViewerOptions()
    await viewerApp?.initializedPromise

    this.applyViewerTheme()
    this.applyQueuedRuntimeStyles()

    return {
      viewerApp
    }
  }

  private buildViewerApp = async () => {
    await this.applyIframeHash()

    // Set viewer options as soon as PDFViewerApplication is created.
    const setupPromise = this.setupViewerApp()

    await this.injectLocaleData()

    const { pdfjsLibSrc, viewerSrc } = this.getRuntimeFileUrls()
    await this.injectScript(pdfjsLibSrc)
    await this.injectScript(viewerSrc)

    return await setupPromise
  }

  async connectedCallback() {
    this.iframe = this.shadowRoot?.querySelector('iframe') as PdfjsViewerElementIframe
    this.iframe.setAttribute('title', this.getAttribute('iframe-title') || DEFAULTS.iframeTitle)
    this.initPromise = (async () => {
      await this.buildViewerEntry()
      return await this.buildViewerApp()
    })()
  }
  
  disconnectedCallback() {
    this.cleanupLocaleResource()
    this.iframe.src = 'about:blank'
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
  }

  async attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return
    if (!this.iframe) return

    const optionByAttribute = {
      'debugger-src': { key: 'debuggerSrc', fallback: DEFAULTS.debuggerSrc },
      'c-map-url': { key: 'cMapUrl', fallback: DEFAULTS.cMapUrl },
      'icc-url': { key: 'iccUrl', fallback: DEFAULTS.iccUrl },
      'sandbox-bundle-src': { key: 'sandboxBundleSrc', fallback: DEFAULTS.sandboxBundleSrc },
      'standard-font-data-url': { key: 'standardFontDataUrl', fallback: DEFAULTS.standardFontDataUrl },
      'wasm-url': { key: 'wasmUrl', fallback: DEFAULTS.wasmUrl }
    } as const

    if (name === 'worker-src') {
      const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
      viewerOptions?.set('workerSrc', this.getRuntimeFileUrls().workerSrc)
      return
    }

    if (name in optionByAttribute) {
      const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
      const { key, fallback } = optionByAttribute[name as keyof typeof optionByAttribute]
      viewerOptions?.set(key, newValue || fallback)
      return
    }

    if (name === 'image-resources-path') {
      const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
      viewerOptions?.set('imageResourcesPath', newValue || this.getImageResourcesPath())
      return
    }

    switch (name) {
      case 'src': {
        const viewerApp = this.iframe.contentWindow?.PDFViewerApplication
        if (viewerApp) {
          await viewerApp.initializedPromise
          const url = this.getFullPath(newValue || DEFAULTS.src)
          if (url) {
            viewerApp.open({ url })
          }
        }
        return
      }
      case 'locale': {
        const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
        viewerOptions?.set('localeProperties', { lang: newValue || DEFAULTS.locale })
        this.cleanupLocaleResource()

        await this.injectLocaleData()
        const didApplyRuntimeLocale = await this.applyLocaleAtRuntime()
        if (!didApplyRuntimeLocale) {
          this.initPromise = (async () => {
            await this.buildViewerEntry()
            return await this.buildViewerApp()
          })()
          await this.initPromise
        }
        await this.applyIframeHash()
        return
      }
      case 'iframe-title':
        this.iframe.setAttribute('title', newValue || DEFAULTS.iframeTitle)
        return
      case 'viewer-css-theme':
        this.applyViewerTheme()
        return
      default:
        await this.applyIframeHash()
    }
  }

  public async injectViewerStyles(styles: string) {
    if (!styles) return
    this.viewerStyles.add(styles)
    this.appendRuntimeStyle(styles)
  }

  public async setViewerOptions(options: Record<string, PdfViewerApplicationOptionValue> = {}) {
    this.optionsToSet = options
    await this.initPromise
    return {
      viewerOptions: this.iframe.contentWindow?.PDFViewerApplicationOptions
    }
  }
}

export interface IframeWindow extends Window {
  PDFViewerApplication?: PdfViewerApplication
  PDFViewerApplicationOptions: PdfViewerApplicationOptions
}

export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
  contentWindow: IframeWindow
}

export interface InitializationData {
  viewerApp?: PdfViewerApplication
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}