const template = document.createElement('template');
template.innerHTML = `<iframe frameborder="0" width="100%"></iframe><style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:inherit}</style>`

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  private iframe!: PdfjsViewerElementIframe;

  static get observedAttributes() {
    return ["src", "viewer-path", "locale"];
  }

  connectedCallback() {
    this.iframe = this.shadowRoot?.querySelector(
    this.setAttributes();
    this.initEventListeners();
  }

  attributeChangedCallback(name: string) {
    if (['src', 'viewer-path'].includes(name)) {
      this.setAttributes()
      this.initEventListeners()
    }
  }

  setAttributes() {
    if (!this.hasAttribute('viewer-path')) this.setAttribute('viewer-path', '/pdfjs')
    this.iframe?.setAttribute(
      'src', 
      `${this.getAttribute('viewer-path')}/web/viewer.html?file=${this.getAttribute('src') || ''}`
    )
  }

  initEventListeners() {
    document.addEventListener("webviewerloaded", () => {
      this.setViewerOptions();
    });
  }

  setViewerOptions() {
    const locale = this.getAttribute("locale");
    if (locale)
  }
}

declare global {
  interface Window {
    PdfjsViewerElement: typeof PdfjsViewerElement
  }
}

export interface PdfjsViewerElementIframeWindow extends Window {
  PDFViewerApplicationOptions: {
    set: (name: string, value: string) => void;
  };
}

export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
  contentWindow: PdfjsViewerElementIframeWindow;
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.PdfjsViewerElement = PdfjsViewerElement
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}
