import { describe, expect, it } from 'vitest'
import { getFileData, getIframe, getViewerElement, mountViewer } from './utils'
import '../src/pdfjs-viewer-element'

describe('Basic tests', async () => {
  it('should render the PDF file', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="/pdfjs-3.9.179-dist"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerElement()).exist

    viewerApp.eventBus.on('pagesloaded', () => {
      expect(getViewerElement('#numPages')?.textContent).contain('37')
    })
  })

  it('should not render PDF with wrong url', async () => {
    await mountViewer(`
      <pdfjs-viewer-element 
        src="/fake-file.pdf" 
        viewer-path="/pdfjs-3.9.179-dist"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerElement()).exist
    expect(getViewerElement('#viewer .page')).not.exist
  })

  it('should not render the viewer with wrong viewer path', async () => {
    await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="/fake-dist"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerElement()).not.exist
  })

  it('should open the external file with base64 source', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element 
        viewer-path="/pdfjs-3.9.179-dist"
      ></pdfjs-viewer-element>`
    )

    expect(getViewerElement()).exist

    const file = await getFileData()
    viewerApp.open(file)

    viewerApp.eventBus.on('pagesloaded', () => {
      expect(getViewerElement('#viewer .page')).exist
    })
  })

  it('should load the dark theme', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="/pdfjs-3.9.179-dist"
        viewer-css-theme="DARK"
      ></pdfjs-viewer-element>`
    )

    expect(getViewerElement()).exist
    expect(getComputedStyle(getViewerElement()!).getPropertyValue('--loading-icon')).toMatch('dark')
  })
})