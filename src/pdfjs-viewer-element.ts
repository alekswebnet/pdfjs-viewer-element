const template = document.createElement('template');
template.innerHTML = `<iframe frameborder="0" width="100%"></iframe><style>:host{width:100%;display:block;overflow:hidden}:host iframe{height:inherit}</style>`

export class PdfjsViewerElement extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  static get observedAttributes() {
    return ['src', 'viewer-path']
  }

  connectedCallback(): void {
    if (!this.hasAttribute('viewer-path')) this.setAttribute('viewer-path', '/pdfjs')
    this.updateIframe()
  }

  attributeChangedCallback(name: string): void {
    if (['src', 'viewer-path'].includes(name)) {
      this.updateIframe()
    }
  }

  updateIframe() {
    this.shadowRoot?.querySelector('iframe')?.setAttribute(
      'src', 
      `${this.getAttribute('viewer-path')}/web/viewer.html?file=${this.getAttribute('src') || ''}`
    )
  }
}

declare global {
  interface Window {
    PdfjsViewerElement: typeof PdfjsViewerElement
  }
}

export default PdfjsViewerElement

if (!window.customElements.get('pdfjs-viewer-element')) {
  window.PdfjsViewerElement = PdfjsViewerElement
  window.customElements.define('pdfjs-viewer-element', PdfjsViewerElement)
}
