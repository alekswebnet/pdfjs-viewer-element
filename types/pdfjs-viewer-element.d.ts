import type { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api';
import type { EventBus } from 'pdfjs-dist/types/web/event_utils';
export declare const ViewerCssTheme: {
    readonly AUTOMATIC: 0;
    readonly LIGHT: 1;
    readonly DARK: 2;
};
export type PdfViewerApplicationOpenParameters = (DocumentInitParameters & {
    originalUrl?: string;
}) | Uint8Array;
export type PdfViewerApplicationOptionValue = string | boolean | number | Record<string, unknown>;
export interface PdfViewerApplication {
    initializedPromise: Promise<void>;
    initialized: boolean;
    eventBus: EventBus;
    open: (params: PdfViewerApplicationOpenParameters) => void | Promise<void>;
}
export interface PdfViewerApplicationOptions {
    set: (name: string, value: PdfViewerApplicationOptionValue) => void;
    getAll: () => Record<string, unknown>;
}
export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    iframe: PdfjsViewerElementIframe;
    initPromise: Promise<InitializationData>;
    private localeResourceUrl?;
    private localeResourceLink?;
    private viewerStyles;
    private optionsToSet;
    static get observedAttributes(): string[];
    private formatTemplate;
    private getFullPath;
    private getAssetsBase;
    private getRuntimeFileUrls;
    private getImageResourcesPath;
    private getCssThemeOption;
    private applyIframeHash;
    private applyViewerTheme;
    private appendRuntimeStyle;
    private applyQueuedRuntimeStyles;
    private injectScript;
    private applyLocaleAtRuntime;
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
    setViewerOptions(options?: Record<string, PdfViewerApplicationOptionValue>): Promise<{
        viewerOptions: PdfViewerApplicationOptions;
    }>;
}
export interface IframeWindow extends Window {
    PDFViewerApplication?: PdfViewerApplication;
    PDFViewerApplicationOptions: PdfViewerApplicationOptions;
}
export interface PdfjsViewerElementIframe extends HTMLIFrameElement {
    contentWindow: IframeWindow;
}
export interface InitializationData {
    viewerApp?: PdfViewerApplication;
}
export default PdfjsViewerElement;
