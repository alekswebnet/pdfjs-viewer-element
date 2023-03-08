const template = document.createElement('template');
template.innerHTML = `
  <iframe
    frameborder="0"
    width="100%">
  </iframe>
  <style>
    :host {
      width: 100%;
      display: block;
    }
    :host iframe {
      height: inherit;
    }
  </style>
`

class PdfjsViewerElement extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'viewerPath']
  }

  constructor() {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback(): void {
    if (!this.hasAttribute('viewerPath')) this.setAttribute('viewerPath', '/pdfjs-3.4.120-dist')
    this.updateIframeSrc()
  }

  attributeChangedCallback(name: string): void {
    if (['src', 'viewerPath'].includes(name)) {
      this.updateIframeSrc()
    }
  }

  updateIframeSrc() {
    this.shadowRoot?.querySelector('iframe')?.setAttribute(
      'src', 
      `${this.getAttribute('viewerPath')}/web/viewer.html?file=${this.getAttribute('src') || ''}`
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
