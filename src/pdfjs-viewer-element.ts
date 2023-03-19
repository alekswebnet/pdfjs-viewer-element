import { debounce } from "./debounce";

const template = document.createElement('template');
template.innerHTML = `<iframe frameborder="0" width="100%"></iframe><style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:100%}</style>`

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  private iframe!: PdfjsViewerElementIframe

  static get observedAttributes() {
    return ['src', 'viewer-path', 'locale', 'page', 'search', 'phrase', 'zoom', 'pagemode']
  }

  connectedCallback() {
    this.iframe = this.shadowRoot!.querySelector('iframe') as PdfjsViewerElementIframe
    this.setEventListeners()
  }

  attributeChangedCallback() {
    this.onAttrsChanged()
  }

  private onAttrsChanged = debounce(async () => {
    const url = this.iframe?.getAttribute('src')
    
    if (url && url.split('&locale=')[1] !== this.getAttribute('locale')) {
      await this.setProps()
      this.iframe.contentWindow.location.reload()
    }
    else {
      await this.setProps()
    }
  })

  private async setProps() {
    const viewerPath = this.getAttribute('viewer-path') || '/pdfjs'
    const file = this.getFileSrc(this.getAttribute('src') || '')
    const page = this.getAttribute('page') || ''
    const search = this.getAttribute('search') || ''
    const phrase = this.getAttribute('phrase') || ''
    const zoom = this.getAttribute('zoom') || ''
    const pagemode = this.getAttribute('pagemode') || ''
    const locale = this.getAttribute('locale')

    this.iframe.setAttribute(
      'src',
      `${viewerPath}/web/viewer.html#file=${file}&page=${page}&zoom=${zoom}&pagemode=${pagemode}&search=${search}&phrase=${phrase}${locale ? '&locale='+locale : ''}`
    )
  }

  private setEventListeners() {
    document.addEventListener('webviewerloaded', async () => {
      this.iframe.contentWindow?.PDFViewerApplicationOptions.set('disablePreferences', true)
      this.iframe.contentWindow?.PDFViewerApplicationOptions.set('pdfBugEnabled', true)
    })
  }

  private getFileSrc(path: string) {
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