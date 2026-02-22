export declare const ViewerCssTheme: {
    readonly AUTOMATIC: 0;
    readonly LIGHT: 1;
    readonly DARK: 2;
};
export declare const hardRefreshAttributes: string[];
export declare const allAttributes: string[];
export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    iframe: PdfjsViewerElementIframe;
    iframeLocationHash: string;
    static get observedAttributes(): string[];
    private applyViewerOptions;
    private handleViewerLoaded;
    connectedCallback(): Promise<void>;
    attributeChangedCallback(name: string): Promise<void>;
    private getIframeLocationHash;
    private loadViewerResources;
    private getFullPath;
    private getCssThemeOption;
    private setCssTheme;
    private setViewerExtraStyles;
    private injectExtraStylesLinks;
}
export interface PdfjsViewerElementIframeWindow extends Window {
    PDFViewerApplication: {
        initializedPromise: Promise<void>;
        initialized: boolean;
        eventBus: Record<string, any>;
        open: (data: Uint8Array) => void;
    };
    PDFViewerApplicationOptions: {
        set: (name: string, value: string | boolean | number | Record<string, any>) => void;
        getAll: () => Record<string, any>;
    };
}
export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
    contentWindow: PdfjsViewerElementIframeWindow;
}
export default PdfjsViewerElement;
