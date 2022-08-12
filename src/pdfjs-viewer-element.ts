import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('pdfjs-viewer-element')
export class PdfjsViewerElement extends LitElement {
  static styles = css`
    :host {
      width: 100%
    }
  `

  /**
   * PDF file url
   */
  @property()
  src = ''

  /**
   * Viewer height
   */
   @property()
   height = '600px'

  render() {
    return html`
      <iframe
        frameborder="0"
        width="100%"
        style="height: ${this.height}"
        src="/pdfjs-2.15.349-dist/web/viewer.html?file=${this.src}"
      >
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pdfjs-viewer-element': PdfjsViewerElement
  }
}
