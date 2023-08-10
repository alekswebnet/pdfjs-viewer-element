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
    this.debouncedRenderViewer()
  }

  private debouncedRenderViewer = debounce(async () => {
    await elementReady('iframe', this.shadowRoot!)
    const updatedSrc = this.getIframeSrc()
    if (updatedSrc !== this.iframe.getAttribute('src')) {
      this.renderViewer(updatedSrc)
    }
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

    return `${viewerPath}${DEFAULTS.viewerEntry
      }?file=${src
      }#page=${page
      }&zoom=${zoom
      }&pagemode=${pagemode
      }&search=${search
      }&phrase=${phrase
      }&textLayer=${textLayer}${
        locale ? '&locale='+locale : ''
    }`
  }

  private renderViewer(src: string) {
    this.shadowRoot!.replaceChild(this.iframe.cloneNode(), this.iframe)
    this.iframe = this.shadowRoot!.querySelector('iframe') as PdfjsViewerElementIframe
    this.iframe.contentWindow.location.href = src
    console.log('ok')
  }

  private setEventListeners() {
    document.addEventListener('webviewerloaded', () => {
      if (this.getAttribute('src') !== DEFAULTS.src) this.iframe.contentWindow.PDFViewerApplicationOptions?.set('defaultUrl', '')
      this.iframe.contentWindow.PDFViewerApplicationOptions?.set('disablePreferences', true);
      this.iframe.contentWindow.PDFViewerApplicationOptions?.set('pdfBugEnabled', true);
      this.iframe.contentWindow.PDFViewerApplicationOptions?.set('eventBusDispatchToDOM', true);
    });
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
  PDFViewerApplication: any
}

export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
  contentWindow: PdfjsViewerElementIframeWindow
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.PdfjsViewerElement = PdfjsViewerElement
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}