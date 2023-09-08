import { describe, expect, it } from 'vitest'
import { getViewerContainer, renderViewer } from './test-utils'
import '../src/pdfjs-viewer-element'

describe('Basic render process', async () => {
  it('should render the PDF file', async () => {
    await renderViewer(`
      <pdfjs-viewer-element 
        src="/sample-pdf-10MB.pdf" 
        viewer-path="/pdfjs-3.9.179-dist"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerContainer()?.querySelector('#numPages')?.textContent).contain('37')
    expect(getViewerContainer()?.querySelector('#viewer .page')).exist
  })

  it('should not render PDF with wrong url', async () => {
    await renderViewer(`
      <pdfjs-viewer-element 
        src="/fake-file.pdf" 
        viewer-path="/pdfjs-3.9.179-dist"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerContainer()?.querySelector('#viewer .page')).not.exist
  })

  it('should not render the viewer with wrong viewer-path attribute', async () => {
    await renderViewer(`
      <pdfjs-viewer-element 
      src="/sample-pdf-10MB.pdf" 
      viewer-path="/fake-dist"
      ></pdfjs-viewer-element>`
    )
    expect(getViewerContainer()).not.exist
  })
})