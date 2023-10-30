export declare const ViewerCssTheme: {
    readonly AUTOMATIC: 0;
    readonly LIGHT: 1;
    readonly DARK: 2;
};
export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    iframe: PdfjsViewerElementIframe;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(): void;
    private onIframeReady;
    private getIframeSrc;
    private mountViewer;
    private getFullPath;
    private getCssThemeOption;
    private setViewerExtraStyles;
    initialize: () => Promise<PdfjsViewerElementIframeWindow['PDFViewerApplication']>;
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
        set: (name: string, value: string | boolean | number) => void;
        getAll: () => Record<string, any>;
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
