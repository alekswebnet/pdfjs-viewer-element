import { describe, expect, it } from 'vitest'
import { getFileData, getViewerElement, mountViewer } from './utils'
import '../src/pdfjs-viewer-element'

describe('Basic tests', async () => {
  it('should render the PDF file', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="pdfjs-4.0.379-dist"
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
        viewer-path="/pdfjs-4.0.379-dist"
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
        viewer-path="/pdfjs-4.0.379-dist"
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
    await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="/pdfjs-4.0.379-dist"
        viewer-css-theme="DARK"
      ></pdfjs-viewer-element>`
    )

    expect(getViewerElement()).exist
    expect(getComputedStyle(getViewerElement()!).getPropertyValue('--body-bg-color')).toMatch('rgb(42 42 46)')
  })

  it('should hide the download button', async () => {
    await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="/pdfjs-4.0.379-dist"
        viewer-extra-styles="#download { display: none }"
      ></pdfjs-viewer-element>`
    )

    expect(getViewerElement()).exist
    expect(getComputedStyle(getViewerElement('#download')!).display).eq('none')
  })
})