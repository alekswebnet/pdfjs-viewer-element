import { elementReady } from "./elementReady";
import { debounce } from 'perfect-debounce'

const DEFAULTS = {
  viewerPath: '/pdfjs',
  viewerEntry: '/web/viewer.html',
  src: '',
  page: '',
  search: '',
  phrase: '',
  zoom: 'auto',
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

export type ToolbarButtonId = 'sidebarToggle' | ''

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
    document.addEventListener('webviewerloaded', () => {
      this.dispatchEvent(new Event('loaded'))
      this.setViewerExtraStyles(this.getAttribute('viewer-extra-styles'))
      if (this.getAttribute('src') !== DEFAULTS.src) this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('defaultUrl', '')
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('viewerCssTheme', this.getCssThemeOption())
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('disablePreferences', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('pdfBugEnabled', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions?.set('eventBusDispatchToDOM', true)
    });
  }

  attributeChangedCallback() {
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

    const updatedSrc = `${viewerPath}${DEFAULTS.viewerEntry}?file=${encodeURIComponent(src)}#page=${page}&zoom=${zoom}&pagemode=${pagemode}&search=${search}&phrase=${phrase}&textLayer=${textLayer}${locale ? '&locale='+locale : ''}&viewerCssTheme=${viewerCssTheme}&viewerExtraStyles=${viewerExtraStyles}`
    if (updatedSrc !== this.iframe.getAttribute('src')) return updatedSrc
    return ''
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

  private setViewerExtraStyles = (styles?: string | null) => {
    if (!styles) {
      this.iframe.contentDocument?.head.querySelector('style[extra]')?.remove()
      return
    }
    if (this.iframe.contentDocument?.head.querySelector('style[extra]')?.innerHTML === styles) return
    const style = document.createElement('style')
    style.innerHTML = styles
    style.setAttribute('extra', '')
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