import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
@customElement('pdfjs-viewer-element')
export class PdfjsViewerElement extends LitElement {
  @property()
  src = ''
  
  @property()
  height = '600px'

  static styles = css`
    :host {
      width: 100%
    }
  `
  render() {
    return html`
      <iframe
        frameborder="0"
        width="100%"
        style="height: ${this.height}"
        src="/pdfjs-2.15.349-dist/web/viewer.html?file=${this.src}">
      </iframe>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pdfjs-viewer-element': PdfjsViewerElement
  }
}
