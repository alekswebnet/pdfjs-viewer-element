export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    private iframe;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(): void;
    private onAttrsChanged;
    private setProps;
    private setEventListeners;
    private getFileSrc;
}
declare global {
    interface Window {
        PdfjsViewerElement: typeof PdfjsViewerElement;
    }
}
export interface PdfjsViewerElementIframeWindow extends Window {
    PDFViewerApplicationOptions: {
        set: (name: string, value: string | boolean) => void;
    };
}
export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
    contentWindow: PdfjsViewerElementIframeWindow;
}
export default PdfjsViewerElement;
