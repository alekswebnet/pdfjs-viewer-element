# Contributing

Thank you for contributing to `@missing-elements/pdfjs-viewer`.

## Prerequisites

- Node.js 22 or later
- pnpm 10 or later
- Firefox for browser tests

## Local Setup

```bash
git clone https://github.com/missing-elements/pdfjs-viewer.git
cd pdfjs-viewer
pnpm install --frozen-lockfile
pnpm exec playwright install firefox
```

The `dev`, `build`, and `test` scripts run `pnpm sync:pdfjs` first. On the first run it downloads the official PDF.js release matching the `pdfjs-dist` version in `package.json` into the gitignored `public/` folder, so an internet connection is required once per PDF.js version.

## Development

Start the development server:

```bash
pnpm dev
```

Run the test suite:

```bash
pnpm test -- --run
```

Build the package:

```bash
pnpm build
```

The test and build scripts synchronize the PDF.js runtime assets before
running. The PDF.js release archive is required because the viewer assets are
not published in this repository. Do not commit generated `dist` or `public`
output.

## Pull Requests

Before opening a pull request:

1. Keep the change focused and include tests for behavior changes.
2. Run the relevant test suite and build locally.
3. Update [README.md](./README.md), [ACCESSIBILITY.md](./ACCESSIBILITY.md),
   or other documentation when the public API, behavior, or user guidance
   changes.
4. Preserve keyboard accessibility and visible focus indicators when changing
   viewer markup or styles.
5. Do not disclose security vulnerabilities in public issues or pull requests;
   follow [SECURITY.md](./SECURITY.md) instead.

Describe the problem, the solution, and how you verified the change in the
pull request. For user-visible changes, include screenshots or a minimal
reproduction when they clarify the result.
