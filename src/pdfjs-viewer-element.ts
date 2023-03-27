import { debounce } from "./debounce";

const defaults = {
  viewerPath: '/pdfjs',
  viewerEntry: '/web/viewer.html'
}

const template = document.createElement('template')
template.innerHTML = `<iframe frameborder="0" width="100%"></iframe><style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:100%}</style>`

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
    this.onAttrsChanged()
  }

  private onAttrsChanged = debounce(() => {
    const src = this.iframe.getAttribute('src')
    
    if (src && src.split('&locale=')[1] !== this.getAttribute('locale')) {
      this.setProps()
      this.iframe.contentWindow.location.reload()
    }
    else if (src && src.split(defaults.viewerEntry)[0] !== this.getFullPath(this.getAttribute('viewer-path') || '') ) {
      this.setProps()
      this.iframe.contentWindow.location.reload()
    }
    else {
      this.setProps()
    }
  })

  private async setProps() {
    const viewerPath = this.getAttribute('viewer-path') || defaults.viewerPath
    const page = this.getAttribute('page') || ''
    const search = this.getAttribute('search') || ''
    const phrase = this.getAttribute('phrase') || ''
    const zoom = this.getAttribute('zoom') || ''
    const pagemode = this.getAttribute('pagemode') || ''
    const locale = this.getAttribute('locale') || ''
    const textLayer = this.getAttribute('text-layer') || ''

    this.iframe.setAttribute(
      'src',
      `${this.getFullPath(viewerPath)}${defaults.viewerEntry}#page=${page}&zoom=${zoom}&pagemode=${pagemode}&search=${search}&phrase=${phrase}&textLayer=${textLayer}${locale ? '&locale='+locale : ''}`
    )
  }

  private setEventListeners() {
    document.addEventListener('webviewerloaded', () => {
      this.iframe.contentWindow.PDFViewerApplicationOptions.set('defaultUrl', this.getFullPath(this.getAttribute('src') || ''))
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