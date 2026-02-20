import { elementReady } from '../elementReady'
import { debounce } from 'perfect-debounce'

const PDFJS_VERSION = '5.4.624' // Keep in sync with the version used in the viewer

const DEFAULTS = {
  src: '',
  iframeTitle: 'PDF viewer window',
  page: '',
  search: '',
  phrase: '',
  zoom: '',
  pagemode: 'none',
  locale: '',
  disableWorker: '',
  textLayer: '',
  disableFontFace: '',
  disableRange: '',
  disableStream: '',
  disableAutoFetch: '',
  verbosity: '',
  viewerCssTheme: 'AUTOMATIC',
  viewerExtraStyles: '',
  viewerExtraStylesUrls: '',
  nameddest: ''
} as const

export const ViewerCssTheme = { AUTOMATIC: 0, LIGHT: 1, DARK: 2 } as const
export const hardRefreshAttributes = [
  'src', 'disable-worker', 'text-layer', 'disable-font-face', 'disable-range', 'disable-stream', 'disable-auto-fetch', 'verbosity', 'locale', 'viewer-css-theme', 'viewer-extra-styles', 'viewer-extra-styles-urls'
]
export const allAttributes = [
  ...hardRefreshAttributes, 
  'page', 'search', 'phrase', 'zoom', 'pagemode', 'nameddest', 'iframe-title'
]

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.createElement('template')
    template.innerHTML = `
      <style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:100%}</style>
      <iframe frameborder="0" width="100%" loading="lazy" title="${this.getAttribute('iframe-title') || DEFAULTS.iframeTitle}"></iframe>
    `
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  public iframe!: PdfjsViewerElementIframe

  static get observedAttributes() {
    return allAttributes
  }

  connectedCallback() {
    this.iframe = this.shadowRoot?.querySelector('iframe') as PdfjsViewerElementIframe
    document.addEventListener('webviewerloaded', async () => {
      this.iframe.contentWindow.PDFViewerApplicationOptions?.set('workerSrc', `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`)
      this.setCssTheme(this.getCssThemeOption())
      this.injectExtraStylesLinks(this.getAttribute('viewer-extra-styles-urls') ?? DEFAULTS.viewerExtraStylesUrls)
      this.setViewerExtraStyles(this.getAttribute('viewer-extra-styles') ?? DEFAULTS.viewerExtraStyles)
      if (this.getAttribute('src') !== DEFAULTS.src) this.iframe.contentWindow?.PDFViewerApplicationOptions?.set(
        'defaultUrl', 
        `${this.getAttribute('src')?.startsWith('/') ? window.location.origin : ''}${this.getAttribute('src')}` || DEFAULTS.src
      )
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('disablePreferences', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('pdfBugEnabled', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('eventBusDispatchToDOM', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('localeProperties', { lang: this.getAttribute('locale') || DEFAULTS.locale })
    })
  }

  attributeChangedCallback(name: string) {
    if (!hardRefreshAttributes.includes(name)) {
      this.onIframeReady(() => {
        this.iframe.src = this.getIframeSrc()
      })
      return
    }
    this.onIframeReady(async () => await this.mountViewer())
  }

  private onIframeReady = debounce(async (callback: () => void) => {
    await elementReady('iframe', this.shadowRoot!)
    callback()
  }, 0, { leading: true })

  private getIframeSrc() {
    const src = this.getFullPath(this.getAttribute('src') || DEFAULTS.src)
    const page = this.getAttribute('page') || DEFAULTS.page
    const search = this.getAttribute('search') || DEFAULTS.search
    const phrase = this.getAttribute('phrase') || DEFAULTS.phrase
    const zoom = this.getAttribute('zoom') || DEFAULTS.zoom
    const pagemode = this.getAttribute('pagemode') || DEFAULTS.pagemode

    const disableWorker = this.getAttribute('disable-worker') || DEFAULTS.disableWorker
    const textLayer = this.getAttribute('text-layer') || DEFAULTS.textLayer
    const disableFontFace = this.getAttribute('disable-font-face') || DEFAULTS.disableFontFace
    const disableRange = this.getAttribute('disable-range') || DEFAULTS.disableRange
    const disableStream = this.getAttribute('disable-stream') || DEFAULTS.disableStream
    const disableAutoFetch = this.getAttribute('disable-auto-fetch') || DEFAULTS.disableAutoFetch
    const verbosity = this.getAttribute('verbosity') || DEFAULTS.verbosity
    const locale = this.getAttribute('locale') || DEFAULTS.locale

    const viewerCssTheme = this.getAttribute('viewer-css-theme') || DEFAULTS.viewerCssTheme
    const viewerExtraStyles = Boolean(this.getAttribute('viewer-extra-styles') || DEFAULTS.viewerExtraStyles)
    const nameddest = this.getAttribute('nameddest') || DEFAULTS.nameddest

    return `?file=
  ${encodeURIComponent(src)}#page=${page}&zoom=${zoom}&pagemode=${pagemode}&search=${search}&phrase=${phrase}&textLayer=
  ${textLayer}&disableWorker=
  ${disableWorker}&disableFontFace=
  ${disableFontFace}&disableRange=
  ${disableRange}&disableStream=
  ${disableStream}&disableAutoFetch=
  ${disableAutoFetch}&verbosity=
  ${verbosity}
  ${locale ? '&locale='+locale : ''}&viewerCssTheme=
  ${viewerCssTheme}&viewerExtraStyles=
  ${viewerExtraStyles}
  ${nameddest ? '&nameddest=' + nameddest : ''}`
  }

  private async loadViewerResources() {
    return new Promise<void>(async (resolve) => {
      if (this.iframe.contentWindow?.PDFViewerApplication) resolve()

      const [viewerEntry, viewerCss, pdfjsBuild, viewerBuild] = await Promise.all([
        import('../web/viewer.html?raw'),
        import('../web/viewer.css?inline'),
        import('../build/pdf.mjs?raw'),
        import('./viewer.mjs?raw')
      ])

      this.iframe.srcdoc = viewerEntry.default

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

        const style = doc.createElement('style');
        style.textContent = viewerCss.default;
        doc.head.appendChild(style);

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
    })
  }

  private async mountViewer() {
    if (!this.iframe) return
    this.shadowRoot?.replaceChild(this.iframe.cloneNode(), this.iframe)
    this.iframe = this.shadowRoot?.querySelector('iframe') as PdfjsViewerElementIframe
    
    this.iframe.setAttribute('title', this.getAttribute('iframe-title') || DEFAULTS.iframeTitle)

    await this.loadViewerResources()
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

  public initialize = (): Promise<PdfjsViewerElementIframeWindow['PDFViewerApplication']> => new Promise(async (resolve) => {
    await elementReady('iframe', this.shadowRoot as ShadowRoot)
    this.iframe?.addEventListener('load', async () => {
      await this.iframe.contentWindow?.PDFViewerApplication?.initializedPromise
      resolve(this.iframe.contentWindow?.PDFViewerApplication)
    }, { once: true })
  })
}

declare global {
  interface Window {
    PdfjsViewerElement: typeof PdfjsViewerElement
  }
}

export interface IPdfjsViewerElement extends HTMLElement {
  initialize: () => Promise<PdfjsViewerElementIframeWindow['PDFViewerApplication']>
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
  window.PdfjsViewerElement = PdfjsViewerElement
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}