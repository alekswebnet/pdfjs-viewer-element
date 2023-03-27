import { elementReady } from "./elementReady";

const DEFAULTS = {
  viewerPath: '/pdfjs',
  viewerEntry: '/web/viewer.html',
  src: '',
  page: '',
  search: '',
  phrase: '',
  zoom: '',
  pagemode: '',
  locale: '',
  textLayer: ''
}

const template = document.createElement('template')
template.innerHTML = `
  <iframe frameborder="0" width="100%"></iframe>
  <style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:100%}</style>
`

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  private iframe!: PdfjsViewerElementIframe

  static get observedAttributes() {
    return ['src', 'viewer-path', 'locale', 'page', 'search', 'phrase', 'zoom', 'pagemode', 'text-layer']
  }

  connectedCallback() {
    this.iframe = this.shadowRoot!.querySelector('iframe') as PdfjsViewerElementIframe
    this.setEventListeners()
  }

  attributeChangedCallback() {
    elementReady('iframe', this.shadowRoot!).then(() => this.setProps())
  }

  private setProps() {
    const src = this.getFullPath(this.getAttribute('src') || DEFAULTS.src)
    const viewerPath = this.getFullPath(this.getAttribute('viewer-path') || DEFAULTS.viewerPath)
    const page = this.getAttribute('page') || DEFAULTS.page
    const search = this.getAttribute('search') || DEFAULTS.search
    const phrase = this.getAttribute('phrase') || DEFAULTS.phrase
    const zoom = this.getAttribute('zoom') || DEFAULTS.zoom
    const pagemode = this.getAttribute('pagemode') || DEFAULTS.pagemode
    const locale = this.getAttribute('locale') || DEFAULTS.locale
    const textLayer = this.getAttribute('text-layer') || DEFAULTS.textLayer

    const updatedSrc = `${viewerPath}${DEFAULTS.viewerEntry}?file=${src}#page=${page}&zoom=${zoom}&pagemode=${pagemode}&search=${search}&phrase=${phrase}&textLayer=${textLayer}${locale ? '&locale='+locale : ''}`
    if (updatedSrc !== this.iframe.getAttribute('src')) {
      this.rerenderIframe(updatedSrc)
    }
  }

  private rerenderIframe(src: string) {
    this.shadowRoot!.replaceChild(this.iframe.cloneNode(), this.iframe)
    this.iframe = this.shadowRoot!.querySelector('iframe') as PdfjsViewerElementIframe
    this.iframe.contentWindow.location.href = src
  }

  private setEventListeners() {
    document.addEventListener('webviewerloaded', () => {
      if (this.getAttribute('src') !== DEFAULTS.src) this.iframe.contentWindow.PDFViewerApplicationOptions.set('defaultUrl', '')
      this.iframe.contentWindow.PDFViewerApplicationOptions.set('disablePreferences', true)
      this.iframe.contentWindow.PDFViewerApplicationOptions.set('pdfBugEnabled', true)
    })
  }

  private getFullPath(path: string) {
    return path.startsWith('/') ? `${window.location.origin}${path}` : path
  }
}

declare global {
  interface Window {
    PdfjsViewerElement: typeof PdfjsViewerElement
  }
}

export interface PdfjsViewerElementIframeWindow extends Window {
  PDFViewerApplicationOptions: {
    set: (name: string, value: string | boolean) => void
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