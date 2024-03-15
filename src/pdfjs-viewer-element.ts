import { elementReady } from "./elementReady";
import { debounce } from 'perfect-debounce'

const DEFAULTS = {
  viewerPath: '/pdfjs',
  viewerEntry: '/web/viewer.html',
  src: '',
  page: '',
  search: '',
  phrase: '',
  zoom: '',
  pagemode: 'none',
  locale: '',
  textLayer: '',
  viewerCssTheme: 'AUTOMATIC',
  viewerExtraStyles: ''
} as const

export const ViewerCssTheme = {
  AUTOMATIC: 0, // Default value.
  LIGHT: 1,
  DARK: 2,
} as const

export const hardRefreshAttributes = ['src', 'viewer-path', 'locale', 'viewer-css-theme', 'viewer-extra-styles']

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    const template = document.createElement('template')
    template.innerHTML = `
      <style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:100%}</style>
      <iframe frameborder="0" width="100%" loading="lazy"></iframe>
    `
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  public iframe!: PdfjsViewerElementIframe

  static get observedAttributes() {
    return ['src', 'viewer-path', 'locale', 'page', 'search', 'phrase', 'zoom', 'pagemode', 'text-layer', 'viewer-css-theme', 'viewer-extra-styles']
  }

  connectedCallback() {
    this.iframe = this.shadowRoot!.querySelector('iframe') as PdfjsViewerElementIframe
    document.addEventListener('webviewerloaded', async () => {
      this.setCssTheme(this.getCssThemeOption())
      this.setViewerExtraStyles(this.getAttribute('viewer-extra-styles'))
      if (this.getAttribute('src') !== DEFAULTS.src) this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('defaultUrl', '')
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('disablePreferences', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('pdfBugEnabled', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('eventBusDispatchToDOM', true)
    });
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
    const locale = this.getAttribute('locale') || DEFAULTS.locale
    const textLayer = this.getAttribute('text-layer') || DEFAULTS.textLayer
    const viewerCssTheme = this.getAttribute('viewer-css-theme') || DEFAULTS.viewerCssTheme
    const viewerExtraStyles = Boolean(this.getAttribute('viewer-extra-styles') || DEFAULTS.viewerExtraStyles)

    return `${viewerPath}${DEFAULTS.viewerEntry}?file=${encodeURIComponent(src)}#page=${page}&zoom=${zoom}&pagemode=${pagemode}&search=${search}&phrase=${phrase}&textLayer=${textLayer}${locale ? '&locale='+locale : ''}&viewerCssTheme=${viewerCssTheme}&viewerExtraStyles=${viewerExtraStyles}`
  }

  private mountViewer(src: string) {
    if (!src || !this.iframe) return
    this.shadowRoot!.replaceChild(this.iframe.cloneNode(), this.iframe)
    this.iframe = this.shadowRoot!.querySelector('iframe') as PdfjsViewerElementIframe
    this.iframe.src = src
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
      const styleSheet = this.iframe.contentDocument?.styleSheets[0];
      const cssRules = styleSheet?.cssRules || [];
      const rules = Object.keys(cssRules)
        .filter((key) => (cssRules[Number(key)] as CSSMediaRule)?.conditionText === "(prefers-color-scheme: dark)")
        .map((key) => {
          const rule = cssRules[Number(key)]
          return rule.cssText.split('@media (prefers-color-scheme: dark) {\n')[1].split('\n}')[0]
        })
      this.setViewerExtraStyles(rules.join(''), 'theme')
    }
    else {
      this.iframe.contentDocument?.head.querySelector('style[theme]')?.remove()
    }
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

  public initialize = (): Promise<PdfjsViewerElementIframeWindow['PDFViewerApplication']> => new Promise(async (resolve) => {
    await elementReady('iframe', this.shadowRoot!)
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
    open: (data: Uint8Array) => void;
    eventBus: Record<string, any>;
    setCssTheme: () => void
  },
  PDFViewerApplicationOptions: {
    set: (name: string, value: string | boolean | number) => void,
    getAll: () => Record<string, any>
  }
}

export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
  contentWindow: PdfjsViewerElementIframeWindow
}

export interface PdfjsViewerLoadedEvent extends Event {
  detail: {
    source: PdfjsViewerElementIframeWindow
  }
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.PdfjsViewerElement = PdfjsViewerElement
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}