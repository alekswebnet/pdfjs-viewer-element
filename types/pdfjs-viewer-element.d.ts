export declare const ViewerCssTheme: {
    readonly AUTOMATIC: 0;
    readonly LIGHT: 1;
    readonly DARK: 2;
};
export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    iframe: PdfjsViewerElementIframe;
    private localeResourceUrl?;
    private localeResourceLink?;
    private viewerStyles;
    static get observedAttributes(): string[];
    private getFullPath;
    private getCssThemeOption;
    private applyIframeHash;
    private applyViewerTheme;
    private appendRuntimeStyle;
    private injectScript;
    private injectLocaleData;
    private cleanupLocaleResource;
    private onViewerAppCreated;
    private applyViewerOptions;
    private getIframeLocationHash;
    private buildViewerEntry;
    private setupViewerApp;
    private buildViewerApp;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): Promise<void>;
    injectViewerStyles(styles: string): Promise<void>;
}
export interface IframeWindow extends Window {
    PDFViewerApplication?: {
        initializedPromise: Promise<void>;
        initialized: boolean;
        eventBus: Record<string, any>;
        open: (params: {
            url: string;
            originalUrl?: string;
        } | {
            data: Uint8Array;
        } | Uint8Array) => void;
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
