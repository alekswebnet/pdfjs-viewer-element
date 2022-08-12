import { LitElement } from 'lit';
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class PdfjsViewerElement extends LitElement {
    static styles: import("lit").CSSResult;
    /**
     * PDF file url
     */
    src: string;
    /**
     * Viewer height
     */
    height: string;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'pdfjs-viewer-element': PdfjsViewerElement;
    }
}
