export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    private iframe;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(): void;
    private onIframeReady;
    private getIframeSrc;
    private mountViewer;
    private setEventListeners;
    private getFullPath;
    initialize: () => Promise<unknown>;
}
declare global {
    interface Window {
        PdfjsViewerElement: typeof PdfjsViewerElement;
    }
}
export interface IPdfjsViewerElement extends HTMLElement {
    initialize: () => Promise<PdfjsViewerElementIframeWindow['PDFViewerApplication']>;
}
export interface PdfjsViewerElementIframeWindow extends Window {
    PDFViewerApplication: {
        initializedPromise: Promise<void>;
        initialized: boolean;
        open: (data: Uint8Array) => void;
        eventBus: Record<string, any>;
    };
    PDFViewerApplicationOptions: {
        set: (name: string, value: string | boolean) => void;
    };
}
export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
    contentWindow: PdfjsViewerElementIframeWindow;
}
export interface PdfjsViewerLoadedEvent extends Event {
    detail: {
        source: PdfjsViewerElementIframeWindow;
    };
}
export default PdfjsViewerElement;
