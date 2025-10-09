import { elementReady } from './elementReady'
import { debounce } from 'perfect-debounce'

const DEFAULTS = {
  viewerPath: '/pdfjs',
  viewerEntry: '/web/viewer.html',
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

export const ViewerCssTheme = {
  AUTOMATIC: 0, // Default value.
  LIGHT: 1,
  DARK: 2,
} as const

export const hardRefreshAttributes = [
  'src', 'viewer-path', 
  'disable-worker', 'text-layer', 'disable-font-face', 'disable-range', 'disable-stream', 'disable-auto-fetch', 'verbosity', 'locale',
  'viewer-css-theme', 'viewer-extra-styles', 'viewer-extra-styles-urls'
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
    return [
      'src', 'viewer-path', 'page', 'search', 'phrase', 'zoom', 'pagemode', 
      'disable-worker', 'text-layer', 'disable-font-face', 'disable-range', 'disable-stream', 'disable-auto-fetch', 'verbosity', 'locale',
      'viewer-css-theme', 'viewer-extra-styles', 'viewer-extra-styles-urls', 'nameddest', 'iframe-title'
    ]
  }

  connectedCallback() {
    this.iframe = this.shadowRoot?.querySelector('iframe') as PdfjsViewerElementIframe
    document.addEventListener('webviewerloaded', async () => {
      this.setCssTheme(this.getCssThemeOption())
      this.injectExtraStylesLinks(this.getAttribute('viewer-extra-styles-urls') ?? DEFAULTS.viewerExtraStylesUrls)
      this.setViewerExtraStyles(this.getAttribute('viewer-extra-styles') ?? DEFAULTS.viewerExtraStyles)
      if (this.getAttribute('src') !== DEFAULTS.src) this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('defaultUrl', '')
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('disablePreferences', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('pdfBugEnabled', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('eventBusDispatchToDOM', true)
    })
  }

  attributeChangedCallback(name: string) {
    if (!hardRefreshAttributes.includes(name)) {
      this.onIframeReady(() => {
        this.iframe.src = this.getIframeSrc()
      })
      return
    }
    this.onIframeReady(() => this.mountViewer(this.getIframeSrc()))
  }

  private onIframeReady = debounce(async (callback: () => void) => {
    await elementReady('iframe', this.shadowRoot!)
    callback()
  }, 0, { leading: true })

  private getIframeSrc() {
    const src = this.getFullPath(this.getAttribute('src') || DEFAULTS.src)
    const viewerPath = this.getFullPath(this.getAttribute('viewer-path') || DEFAULTS.viewerPath)
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

    return `
${viewerPath}${DEFAULTS.viewerEntry}?file=
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

  private mountViewer(src: string) {
    if (!src || !this.iframe) return
    this.shadowRoot?.replaceChild(this.iframe.cloneNode(), this.iframe)
    this.iframe = this.shadowRoot?.querySelector('iframe') as PdfjsViewerElementIframe
    this.iframe.src = src
    this.iframe.setAttribute('title', this.getAttribute('iframe-title') || DEFAULTS.iframeTitle)
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
    set: (name: string, value: string | boolean | number) => void,
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