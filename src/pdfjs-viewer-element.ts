const PDFJS_VERSION = '5.4.624'

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
  workerSrc: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`
} as const

export const ViewerCssTheme = { AUTOMATIC: 0, LIGHT: 1, DARK: 2 } as const
export const hardRefreshAttributes = [
  'src', 'locale', 'viewer-css-theme', 'worker-src'
]
export const allAttributes = [
  ...hardRefreshAttributes, 
  'page', 'search', 'phrase', 'zoom', 'pagemode', 'iframe-title'
]

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.innerHTML = `
      <style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:100%}</style>
      <iframe frameborder="0" width="100%" loading="lazy"></iframe>
    `
    this.resetInitializedPromise()
  }

  public iframe!: PdfjsViewerElementIframe
  public iframeLocationHash = ''
  public initPromise!: Promise<InitializationData>
  private initResolver?: (data: InitializationData) => void
  private initRejecter?: (reason?: unknown) => void
  private localeResourceUrl?: string
  private localeResourceLink?: HTMLLinkElement

  static get observedAttributes() {
    return allAttributes
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

  private injectScript(value: string, type = 'module') {
    const script = document.createElement('script')
    script.type = type
    script.textContent = value
    this.iframe.contentDocument?.head.appendChild(script)
  }

  private injectLocaleData = async () => {
    const doc = this.iframe.contentDocument as Document;
    const locale = this.getAttribute('locale')
    if (!locale) {
      this.cleanupLocaleResource()
      return
    }
    if (locale) {
      const localesData = await import('./web/locale/locale.json?raw')
      const supportedLocales = Object.keys(JSON.parse(localesData.default))
      if (!supportedLocales.includes(locale as string)) {
        this.cleanupLocaleResource()
        return
      }
      if (supportedLocales.includes(locale as string)) {
        const localeObject = {
          [String(locale)]: `https://raw.githubusercontent.com/mozilla-l10n/firefox-l10n/main/${locale}/toolkit/toolkit/pdfviewer/viewer.ftl`
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
    }
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

  private resetInitializedPromise(reason?: unknown) {
    if (this.initRejecter) {
      this.initRejecter(reason || new Error('[pdfjs-viewer-element] Initialization was reseted'))
    }
    if (this.initPromise) {
      this.initPromise.catch(() => undefined)
    }
    this.initPromise = new Promise((resolve, reject) => {
      this.initResolver = resolve
      this.initRejecter = reject
    })
  }

  private onViewerAppLoaded = async () => {
    const callback = this.handleViewerLoaded
    if (this.iframe.contentWindow?.PDFViewerApplication !== undefined) {
      await this.iframe.contentWindow.PDFViewerApplication?.initializedPromise
      await callback(this.iframe.contentWindow['PDFViewerApplication']);
    }
    Object.defineProperty(this.iframe.contentWindow, 'PDFViewerApplication', {
      async set(value: IframeWindow['PDFViewerApplication']) {
        await this.PDFViewerApplication?.initializedPromise
        await callback(value)
      },
      configurable: true
    })
  }

  private applyViewerOptions() {
    const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
    viewerOptions?.set('workerSrc', this.getAttribute('worker-src') || DEFAULTS.workerSrc)
    viewerOptions?.set('defaultUrl', this.getFullPath(this.getAttribute('src') || DEFAULTS.src))
    viewerOptions?.set('disablePreferences', true)
    viewerOptions?.set('pdfBugEnabled', true)
    viewerOptions?.set('eventBusDispatchToDOM', true)
    viewerOptions?.set('localeProperties', { lang: this.getAttribute('locale') || DEFAULTS.locale })
    viewerOptions?.set('viewerCssTheme', this.getCssThemeOption())
    return viewerOptions
  }

  private handleViewerLoaded = async (viewerApp: IframeWindow['PDFViewerApplication']) => {
    const viewerOptions = this.applyViewerOptions()
    await viewerApp.initializedPromise

    if (this.initResolver) {
      this.initResolver({ viewerApp, viewerOptions })
      this.initResolver = undefined
    }

    this.dispatchEvent(new CustomEvent('initialized', { 
      detail: { 
        viewerApp, 
        viewerOptions
      }, 
      bubbles: true,
      composed: true 
    }))
  }

  private getIframeLocationHash() {
    const params: Record<string, string> = {
      page: this.getAttribute('page') || DEFAULTS.page,
      zoom: this.getAttribute('zoom') || DEFAULTS.zoom,
      pagemode: this.getAttribute('pagemode') || DEFAULTS.pagemode,
      search: this.getAttribute('search') || DEFAULTS.search,
      phrase: this.getAttribute('phrase') || DEFAULTS.phrase
    }
    const locale = this.getAttribute('locale')
    if (locale) params.locale = locale
    return '#' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  }

  private async buildViewerEntry() {
    const [viewerEntry, viewerCss] = await Promise.all([
      import('./web/viewer-min.html?raw'),
      import('./web/viewer.css?inline'),
    ])
    const completeHtml = viewerEntry.default
      .replace('</head>', `
        <style>${viewerCss.default}</style>
      </head>`)
    this.iframe.srcdoc = completeHtml
  }

  private buildViewerApp = async () => {
    const [pdfjsBuild, viewerBuild] = await Promise.all([
      import('./build/pdf.min.mjs?raw'),
      import('./web/viewer.min.mjs?raw')
    ])
    await this.injectLocaleData()
    this.injectScript(pdfjsBuild.default)
    this.injectScript(viewerBuild.default)

    await this.onViewerAppLoaded()
  }

  async connectedCallback() {
    this.resetInitializedPromise()
    this.iframe = this.shadowRoot?.querySelector('iframe') as PdfjsViewerElementIframe
    this.iframe.setAttribute('title', this.getAttribute('iframe-title') || DEFAULTS.iframeTitle)
    this.iframeLocationHash = this.getIframeLocationHash()
    this.iframe.contentWindow.location.hash = this.iframeLocationHash

    this.iframe.addEventListener('load', this.buildViewerApp)
    await this.buildViewerEntry()
  }
  
  disconnectedCallback() {
    this.resetInitializedPromise(new Error('[pdfjs-viewer-element] Disconnected'))
    this.cleanupLocaleResource()
    this.iframe.removeEventListener('load', this.buildViewerApp)
    this.iframe.src = 'about:blank'
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
  }

  async attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return
    this.iframeLocationHash = this.getIframeLocationHash()
    if (this.iframe) {
      this.iframe.contentWindow.location.hash = this.iframeLocationHash
    }
    if (name === 'locale') {
      this.cleanupLocaleResource()
    }
    if (hardRefreshAttributes.includes(name)) {
      this.resetInitializedPromise()
      await this.iframe?.contentWindow?.PDFViewerApplication?.initializedPromise
      this.iframe?.contentWindow?.location.reload()
    }
  }

  public async adoptViewerStyles(styles: string) {
    await this.initPromise
    const doc = this.iframe.contentDocument
    if (!doc) return
    const sharedStyles = new CSSStyleSheet()
    sharedStyles.replaceSync(styles)
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sharedStyles]
  }

  public async initialize() {
    return this.initPromise
  }
}

export interface IframeWindow extends Window {
  PDFViewerApplication: {
    initializedPromise: Promise<void>;
    initialized: boolean;
    eventBus: Record<string, any>;
    open: (data: Uint8Array) => void;
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
  viewerApp: IframeWindow['PDFViewerApplication']
  viewerOptions: IframeWindow['PDFViewerApplicationOptions']
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}