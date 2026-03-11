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

    viewerApp?.eventBus.on('pagesloaded', () => {
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
    viewerApp?.open(file)

    viewerApp?.eventBus.on('pagesloaded', () => {
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
    expect(getComputedStyle(getViewerElement()!).getPropertyValue('--body-bg-color')).toMatch('#0d1117')
  })

  it('should hide the download button', async () => {
    document.body.innerHTML = `
      <pdfjs-viewer-element
        src="/sample-pdf-10MB.pdf"
      ></pdfjs-viewer-element>`

    const viewer = document.body.querySelector('pdfjs-viewer-element') as HTMLElement & {
      injectViewerStyles: (styles: string) => Promise<void>
      initPromise: Promise<{ viewerApp?: { initializedPromise: Promise<void> } }>
    }

    await viewer.initPromise
    await viewer.injectViewerStyles('#downloadButton { display: none }')

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

  it('should apply hash-related attributes at runtime', async () => {
    await mountViewer(`
      <pdfjs-viewer-element src="/sample-pdf-10MB.pdf"></pdfjs-viewer-element>`
    )

    const viewer = document.body.querySelector('pdfjs-viewer-element') as HTMLElement
    viewer.setAttribute('page', '2')
    viewer.setAttribute('zoom', '200%')
    viewer.setAttribute('search', 'pdf')
    viewer.setAttribute('phrase', 'true')
    viewer.setAttribute('pagemode', 'thumbs')

    const hash = getIframe().contentWindow.location.hash
    expect(hash).toContain('page=2')
    expect(hash).toContain('zoom=200%')
    expect(hash).toContain('search=pdf')
    expect(hash).toContain('phrase=true')
    expect(hash).toContain('pagemode=thumbs')
  })

  it('should apply worker-src option at runtime', async () => {
    await mountViewer(`
      <pdfjs-viewer-element src="/sample-pdf-10MB.pdf"></pdfjs-viewer-element>`
    )

    const viewer = document.body.querySelector('pdfjs-viewer-element') as HTMLElement
    const workerSrc = 'https://example.com/pdf.worker.min.mjs'
    viewer.setAttribute('worker-src', workerSrc)

    const options = getIframe().contentWindow.PDFViewerApplicationOptions.getAll()
    expect(options.workerSrc).eq(workerSrc)
  })

  it('should apply extended option attributes at runtime and restore defaults on remove', async () => {
    await mountViewer(`
      <pdfjs-viewer-element src="/sample-pdf-10MB.pdf"></pdfjs-viewer-element>`
    )

    const viewer = document.body.querySelector('pdfjs-viewer-element') as HTMLElement
    const cases = [
      {
        attr: 'debugger-src',
        key: 'debuggerSrc',
        value: 'https://example.com/debugger.mjs',
        fallback: './debugger.mjs'
      },
      {
        attr: 'c-map-url',
        key: 'cMapUrl',
        value: 'https://example.com/cmaps/',
        fallback: '../web/cmaps/'
      },
      {
        attr: 'icc-url',
        key: 'iccUrl',
        value: 'https://example.com/iccs/',
        fallback: '../web/iccs/'
      },
      {
        attr: 'image-resources-path',
        key: 'imageResourcesPath',
        value: 'https://example.com/images/',
        fallback: './images/'
      },
      {
        attr: 'sandbox-bundle-src',
        key: 'sandboxBundleSrc',
        value: 'https://example.com/pdf.sandbox.mjs',
        fallback: '../build/pdf.sandbox.mjs'
      },
      {
        attr: 'standard-font-data-url',
        key: 'standardFontDataUrl',
        value: 'https://example.com/standard_fonts/',
        fallback: '../web/standard_fonts/'
      },
      {
        attr: 'wasm-url',
        key: 'wasmUrl',
        value: 'https://example.com/wasm/',
        fallback: '../web/wasm/'
      }
    ] as const

    for (const { attr, key, value, fallback } of cases) {
      viewer.setAttribute(attr, value)
      let options = getIframe().contentWindow.PDFViewerApplicationOptions.getAll() as Record<string, string>
      expect(options[key]).eq(value)

      viewer.removeAttribute(attr)
      options = getIframe().contentWindow.PDFViewerApplicationOptions.getAll() as Record<string, string>
      expect(options[key]).eq(fallback)
    }
  })

  it('should open a new document when src changes at runtime', async () => {
    const viewerApp = await mountViewer(`
      <pdfjs-viewer-element src="/sample-pdf-10MB.pdf"></pdfjs-viewer-element>`
    )

    const viewer = document.body.querySelector('pdfjs-viewer-element') as HTMLElement
    let openedUrl = ''
    const originalOpen = viewerApp?.open
    if (viewerApp) {
      viewerApp.open = ((params: { url: string } | { data: Uint8Array } | Uint8Array) => {
        if (typeof params === 'object' && 'url' in params) {
          openedUrl = params.url
        }
      }) as typeof viewerApp.open
    }

    viewer.setAttribute('src', '/sample-pdf-with-images.pdf')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(openedUrl).toContain('/sample-pdf-with-images.pdf')
    if (viewerApp && originalOpen) {
      viewerApp.open = originalOpen
    }
  })
})