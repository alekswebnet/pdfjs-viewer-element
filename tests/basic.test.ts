import { describe, expect, it } from 'vitest'
import { getFileData, getViewerElement, mountViewer, getIframe } from './utils'
import '../src/pdfjs-viewer-element'

describe('Basic tests', async () => {
  it('should render the PDF file', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="/pdfjs-5.3.93-dist"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerElement()).exist

    viewerApp.eventBus.on('pagesloaded', () => {
      expect(getViewerElement('#viewer .page')).exist
    })
  })

  it('should not render PDF with wrong url', async () => {
    await mountViewer(`
      <pdfjs-viewer-element 
        src="/fake-file.pdf" 
      ></pdfjs-viewer-element>`
    )
    expect(getViewerElement()).exist
    expect(getViewerElement('#viewer .page')).not.exist
  })

  it('should open the external file with base64 source', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element></pdfjs-viewer-element>`
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
        viewer-extra-styles="#downloadButton { display: none }"
      ></pdfjs-viewer-element>`
    )

    expect(getViewerElement()).exist
    expect(getComputedStyle(getViewerElement('#downloadButton')!).display).eq('none')
  })

  it('should add a title attribute to the iframe', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        iframe-title="Custom title"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerElement()).exist
    expect(getIframe().title).eq('Custom title')
  })
})