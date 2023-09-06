import { elementReady } from "../src/elementReady"

export const getIframe = (): HTMLIFrameElement | null | undefined => {
  return document.body.querySelector('pdfjs-viewer-element')?.shadowRoot?.querySelector('iframe') as HTMLIFrameElement
}

export const getViewerContainer = (): HTMLElement | null | undefined => {
  return getIframe()?.contentDocument?.querySelector('#outerContainer')
}

export const renderViewer = async (template: string) => {
  document.body.innerHTML = template
  await elementReady('iframe', document.querySelector('pdfjs-viewer-element')!.shadowRoot!)

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, 3000)
  })
}