const DEFAULT_WORKER_SRC = import.meta.env.DEV
  ? new URL('./build/pdf.worker.mjs', import.meta.url).href
  : new URL('./pdf.worker.min.mjs', import.meta.url).href

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
  workerSrc: DEFAULT_WORKER_SRC,
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
    return path.startsWith('/') ? `${window.location.origin}${path}` : path
  }

  private getCssThemeOption() {
    const attrValue = this.getAttribute('viewer-css-theme') as keyof typeof ViewerCssTheme
    return Object.keys(ViewerCssTheme).includes(attrValue) 
      ? ViewerCssTheme[attrValue] 
      : ViewerCssTheme[DEFAULTS.viewerCssTheme]
  }

  private applyIframeHash = async () =>{
    return new Promise<void>((resolve) => {
      if (!this.iframe?.contentWindow) return resolve()
      this.iframe.contentWindow?.addEventListener('hashchange', () => {
        resolve()
      }, { once: true })
      this.iframe.contentWindow.location.hash = this.getIframeLocationHash()
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

  private injectScript(value: string, type = 'module') {
    const doc = this.iframe.contentDocument
    if (!doc) return
    if (!doc.head) {
      const head = doc.createElement('head')
      doc.documentElement?.prepend(head)
    }
    const script = document.createElement('script')
    script.type = type
    script.textContent = value
    doc.head?.appendChild(script)
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
    viewerOptions?.set('workerSrc', this.getAttribute('worker-src') || DEFAULTS.workerSrc)
    viewerOptions?.set('debuggerSrc', this.getAttribute('debugger-src') || DEFAULTS.debuggerSrc)
    viewerOptions?.set('cMapUrl', this.getAttribute('c-map-url') || DEFAULTS.cMapUrl)
    viewerOptions?.set('iccUrl', this.getAttribute('icc-url') || DEFAULTS.iccUrl)
    viewerOptions?.set('imageResourcesPath', this.getAttribute('image-resources-path') || DEFAULTS.imageResourcesPath)
    viewerOptions?.set('sandboxBundleSrc', this.getAttribute('sandbox-bundle-src') || DEFAULTS.sandboxBundleSrc)
    viewerOptions?.set('standardFontDataUrl', this.getAttribute('standard-font-data-url') || DEFAULTS.standardFontDataUrl)
    viewerOptions?.set('wasmUrl', this.getAttribute('wasm-url') || DEFAULTS.wasmUrl)
    viewerOptions?.set('defaultUrl', this.getFullPath(this.getAttribute('src') || DEFAULTS.src))
    viewerOptions?.set('disablePreferences', true)
    viewerOptions?.set('eventBusDispatchToDOM', true)
    viewerOptions?.set('localeProperties', { lang: this.getAttribute('locale') || DEFAULTS.locale })
    viewerOptions?.set('viewerCssTheme', this.getCssThemeOption())
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
      const [viewerEntry, viewerCss, paperAndInkTheme] = await Promise.all([
        import('./web/viewer.html?raw'),
        import('./web/viewer.css?inline'),
        import('./themes/paper-and-ink.css?inline')
      ])
      const completeHtml = viewerEntry.default
        .replace('</head>', `
          <style>${viewerCss.default}</style>
          <style>${paperAndInkTheme.default}</style>
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

    this.applyQueuedRuntimeStyles()

    return {
      viewerApp
    }
  }

  private buildViewerApp = async () => {
    await this.applyIframeHash()

    const [pdfjsBuild, viewerBuild] = await Promise.all([
      import('./build/pdf.mjs?raw'),
      import('./web/viewer.mjs?raw')
    ])
    await this.injectLocaleData()
    this.injectScript(pdfjsBuild.default)
    this.injectScript(viewerBuild.default)

    return await this.setupViewerApp()
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
      'worker-src': { key: 'workerSrc', fallback: DEFAULTS.workerSrc },
      'debugger-src': { key: 'debuggerSrc', fallback: DEFAULTS.debuggerSrc },
      'c-map-url': { key: 'cMapUrl', fallback: DEFAULTS.cMapUrl },
      'icc-url': { key: 'iccUrl', fallback: DEFAULTS.iccUrl },
      'image-resources-path': { key: 'imageResourcesPath', fallback: DEFAULTS.imageResourcesPath },
      'sandbox-bundle-src': { key: 'sandboxBundleSrc', fallback: DEFAULTS.sandboxBundleSrc },
      'standard-font-data-url': { key: 'standardFontDataUrl', fallback: DEFAULTS.standardFontDataUrl },
      'wasm-url': { key: 'wasmUrl', fallback: DEFAULTS.wasmUrl }
    } as const

    if (name in optionByAttribute) {
      const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
      const { key, fallback } = optionByAttribute[name as keyof typeof optionByAttribute]
      viewerOptions?.set(key, newValue || fallback)
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
      case 'locale':
        this.cleanupLocaleResource()
        this.initPromise = (async () => {
          await this.buildViewerEntry()
          return await this.buildViewerApp()
        })()
        await this.initPromise
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
}

export interface IframeWindow extends Window {
  PDFViewerApplication?: {
    initializedPromise: Promise<void>;
    initialized: boolean;
    eventBus: Record<string, any>;
    open: (params: { url: string; originalUrl?: string } | { data: Uint8Array } | Uint8Array) => void;
  },
  PDFViewerApplicationOptions: {
    set: (name: string, value: string | boolean | number | Record<string, any>) => void,
    getAll: () => Record<string, any>
  }
}

export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
  contentWindow: IframeWindow
}

export interface InitializationData {
  viewerApp?: IframeWindow['PDFViewerApplication']
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}