export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    private iframe;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(): void;
    private debouncedRenderIframe;
    private getIframeSrc;
    private renderViewer;
    private setEventListeners;
    private getFullPath;
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
    PDFViewerApplication: any;
}
export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
    contentWindow: PdfjsViewerElementIframeWindow;
}
export default PdfjsViewerElement;
