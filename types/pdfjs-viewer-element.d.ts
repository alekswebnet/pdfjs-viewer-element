export declare class PdfjsViewerElement extends HTMLElement {
    constructor();
    static get observedAttributes(): string[];
    connectedCallback(): void;
    attributeChangedCallback(name: string): void;
    updateIframe(): void;
}
declare global {
    interface Window {
        PdfjsViewerElement: typeof PdfjsViewerElement;
    }
}
export default PdfjsViewerElement;
