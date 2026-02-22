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
  viewerExtraStyles: '',
  viewerExtraStylesUrls: '',
  nameddest: ''
} as const

export const ViewerCssTheme = { AUTOMATIC: 0, LIGHT: 1, DARK: 2 } as const
export const hardRefreshAttributes = [
  'src', 'locale', 'viewer-css-theme', 'viewer-extra-styles', 'viewer-extra-styles-urls'
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
  }

  public iframe!: PdfjsViewerElementIframe
  public iframeLocationHash = ''

  static get observedAttributes() {
    return allAttributes
  }

  private applyViewerOptions() {
    const viewerOptions = this.iframe.contentWindow?.PDFViewerApplicationOptions
    viewerOptions?.set('workerSrc', `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`)
    this.setCssTheme(this.getCssThemeOption())
    this.injectExtraStylesLinks(this.getAttribute('viewer-extra-styles-urls') ?? DEFAULTS.viewerExtraStylesUrls)
    this.setViewerExtraStyles(this.getAttribute('viewer-extra-styles') ?? DEFAULTS.viewerExtraStyles)
    if (this.getAttribute('src') !== DEFAULTS.src) {
      viewerOptions?.set(
        'defaultUrl',
        this.getFullPath(this.getAttribute('src') || DEFAULTS.src)
      )
    }
    viewerOptions?.set('disablePreferences', true)
    viewerOptions?.set('pdfBugEnabled', true)
    viewerOptions?.set('eventBusDispatchToDOM', true)
    viewerOptions?.set('localeProperties', { lang: this.getAttribute('locale') || DEFAULTS.locale })
    return viewerOptions
  }

  private handleViewerLoaded = async (viewerApp: PdfjsViewerElementIframeWindow['PDFViewerApplication']) => {
    const viewerOptions = this.applyViewerOptions()
    await viewerApp.initializedPromise
    this.dispatchEvent(new CustomEvent('initialized', { 
      detail: { viewerApp, viewerOptions }, 
      bubbles: true,
      composed: true 
    }))
  }

  async connectedCallback() {
    this.iframe = this.shadowRoot?.querySelector('iframe') as PdfjsViewerElementIframe
    this.iframe.setAttribute('title', this.getAttribute('iframe-title') || DEFAULTS.iframeTitle)
    this.iframeLocationHash = this.getIframeLocationHash()
    this.iframe.contentWindow.location.hash = this.iframeLocationHash
    if (!this.iframe.contentWindow?.PDFViewerApplication) {
      await this.loadViewerResources()
    }
    this.iframe.addEventListener('load', () => {
      const loadedCallback = this.handleViewerLoaded
      Object.defineProperty(this.iframe.contentWindow, 'PDFViewerApplication', {
        async set(value: PdfjsViewerElementIframeWindow['PDFViewerApplication']) {
          await this.PDFViewerApplication?.initializedPromise
          await loadedCallback(value)
          return true
        },
        configurable: true
      });
    });
  }

  async attributeChangedCallback(name: string) {
    this.iframeLocationHash = this.getIframeLocationHash()
    if (this.iframe) {
      this.iframe.contentWindow.location.hash = this.iframeLocationHash
    }
    if (hardRefreshAttributes.includes(name)) {
      await this.iframe?.contentWindow?.PDFViewerApplication?.initializedPromise
      this.iframe?.contentWindow?.location.reload()
    }
  }

  private getIframeLocationHash() {
    const params: Record<string, string> = {
      page: this.getAttribute('page') || DEFAULTS.page,
      zoom: this.getAttribute('zoom') || DEFAULTS.zoom,
      pagemode: this.getAttribute('pagemode') || DEFAULTS.pagemode,
      search: this.getAttribute('search') || DEFAULTS.search,
      phrase: this.getAttribute('phrase') || DEFAULTS.phrase,
      viewerCssTheme: this.getAttribute('viewer-css-theme') || DEFAULTS.viewerCssTheme,
      viewerExtraStyles: String(Boolean(this.getAttribute('viewer-extra-styles') || DEFAULTS.viewerExtraStyles)),
    }
    const locale = this.getAttribute('locale')
    if (locale) params.locale = locale
    return '#' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  }

  private async loadViewerResources() {
    return new Promise<void>(async (resolve) => {
      const [viewerEntry, viewerCss, pdfjsBuild, viewerBuild] = await Promise.all([
        import('../web/viewer-min.html?raw'),
        import('../web/viewer.css?inline'),
        import('../build/pdf.min.mjs?raw'),
        import('./viewer.min.mjs?raw')
      ])
      const completeHtml = viewerEntry.default
        .replace('</head>', `
          <style>${viewerCss.default}</style>
        </head>`)
      this.iframe.srcdoc = completeHtml
      this.iframe.addEventListener('load', async () => {
        const doc = this.iframe.contentDocument as Document;
        const locale = this.getAttribute('locale')
        if (locale) {
          const localesData = await import('../web/locale/locale.json?raw')
          const supportedLocales = Object.keys(JSON.parse(localesData.default))
          if (supportedLocales.includes(locale as string)) {
            const localeObject = {
              [String(locale)]: `https://raw.githubusercontent.com/mozilla-l10n/firefox-l10n/main/${locale}/toolkit/toolkit/pdfviewer/viewer.ftl`
            }
            const localeLink = doc.createElement('link')
            localeLink.rel = 'resource'
            localeLink.type = 'application/l10n'
            localeLink.href = URL.createObjectURL(new Blob([JSON.stringify(localeObject)], { type: 'application/json' }))
            doc.head.appendChild(localeLink)
          }
        }
        const pdfjsScript = doc.createElement('script');
        pdfjsScript.type = 'module';
        pdfjsScript.textContent = pdfjsBuild.default;
        doc.head.appendChild(pdfjsScript);
        const viewerScript = doc.createElement('script');
        viewerScript.type = 'module';
        viewerScript.textContent = viewerBuild.default;
        doc.head.appendChild(viewerScript);
        resolve()
      })
    }), { once: true }
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

  private setCssTheme(theme: 0 | 1 | 2) {
    if (theme === ViewerCssTheme.DARK) {
      if (!this.iframe.contentDocument?.styleSheets.length) return
      for (const styleSheet of Array.from(this.iframe.contentDocument.styleSheets)) {
        if (styleSheet.href?.includes('/web/viewer.css')) {
          const cssRules = styleSheet?.cssRules || []
          const rules = Object.keys(cssRules)
            .filter((key) => (cssRules[Number(key)] as CSSMediaRule)?.conditionText === "(prefers-color-scheme: dark)")
            .map((key) => {
              const rule = cssRules[Number(key)]
              return rule.cssText.split('@media (prefers-color-scheme: dark) {\n')[1].split('\n}')[0]
            })
          this.setViewerExtraStyles(rules.join(''), 'theme')
        }
      }
    }
    else {
      this.iframe.contentDocument?.head.querySelector('style[theme]')?.remove()
    }
    this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('viewerCssTheme', theme)
  }

  private setViewerExtraStyles = (styles?: string | null, id = 'extra') => {
    if (!styles) {
      this.iframe.contentDocument?.head.querySelector(`style[${id}]`)?.remove()
      return
    }
    if (this.iframe.contentDocument?.head.querySelector(`style[${id}]`)?.innerHTML === styles) return
    const style = document.createElement('style')
    style.innerHTML = styles
    style.setAttribute(id, '')
    this.iframe.contentDocument?.head.appendChild(style)
  }

  private injectExtraStylesLinks = (rawLinks?: string) => {
    if (!rawLinks) return
    const linksArray = rawLinks.replace(/'|]|\[/g, '').split(',').map((link) => link.trim())
    linksArray.forEach((url) => {
      const linkExists = this.iframe.contentDocument?.head.querySelector(`link[href="${url}"]`);
      if (linkExists) return
      const linkEl = document.createElement('link')
      linkEl.rel = 'stylesheet'
      linkEl.href = url
      this.iframe.contentDocument?.head.appendChild(linkEl)
    })
  }
}

export interface PdfjsViewerElementIframeWindow extends Window {
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
  contentWindow: PdfjsViewerElementIframeWindow
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}