import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { minify } from 'terser'

const rootDir = resolve(import.meta.dirname, '..')
const sourceFile = resolve(rootDir, 'src', 'build', 'pdf.worker.mjs')
const distDir = resolve(rootDir, 'dist')
const targetFile = resolve(distDir, 'pdf.worker.min.mjs')

await mkdir(distDir, { recursive: true })

const workerCode = await readFile(sourceFile, 'utf8')
const result = await minify(workerCode, {
	module: true,
	compress: true,
	mangle: true,
	format: {
		comments: false
	}
})

if (!result.code) {
	throw new Error('Worker minification failed: empty output')
}

await writeFile(targetFile, result.code, 'utf8')
