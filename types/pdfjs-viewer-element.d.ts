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
    initializedPromise: Promise<InitializationData>;
    private initializedResolver?;
    private initializedRejecter?;
    private localeResourceUrl?;
    private localeResourceLink?;
    static get observedAttributes(): string[];
    private getFullPath;
    private getCssThemeOption;
    private injectScript;
    private injectLocaleData;
    private cleanupLocaleResource;
    private resetInitializedPromise;
    private onViewerAppLoaded;
    private applyViewerOptions;
    private handleViewerLoaded;
    private getIframeLocationHash;
    private buildViewerEntry;
    private buildViewerApp;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): Promise<void>;
    adoptViewerStyles(styles: string): Promise<void>;
    initialize(): Promise<InitializationData>;
}
export interface IframeWindow extends Window {
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
    contentWindow: IframeWindow;
}
export interface InitializationData {
    viewerApp: IframeWindow['PDFViewerApplication'];
    viewerOptions: IframeWindow['PDFViewerApplicationOptions'];
}
export default PdfjsViewerElement;
