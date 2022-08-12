import { LitElement } from 'lit';
export declare class PdfjsViewerElement extends LitElement {
    src: string;
    height: string;
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'pdfjs-viewer-element': PdfjsViewerElement;
    }
}
