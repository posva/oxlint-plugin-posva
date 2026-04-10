import { describe, it, expect } from 'vitest'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { execaSync } from 'execa'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..', '..')
const PLUGIN_PATH = join(ROOT, 'dist', 'index.mjs')

function runOxlint(code: string) {
  const tmpDir = join(ROOT, '.test-fixtures')
  const tmpFile = join(tmpDir, 'test.js')
  const tmpConfig = join(tmpDir, '.oxlintrc.json')

  mkdirSync(tmpDir, { recursive: true })
  writeFileSync(tmpFile, code)
  writeFileSync(
    tmpConfig,
    JSON.stringify({
      jsPlugins: [PLUGIN_PATH],
      rules: {
        'posva/vitest-prefer-to-have-been-called-times': 'error',
      },
    }),
  )

  try {
    const result = execaSync('pnpm', ['exec', 'oxlint', tmpFile, '-c', tmpConfig], {
      cwd: ROOT,
      reject: false,
    })
    return {
      exitCode: result.exitCode,
      output: result.stdout + result.stderr,
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

function expectLintError(code: string) {
  const { output } = runOxlint(code)
  expect(output).toContain('vitest-prefer-to-have-been-called-times')
}

function expectNoLintError(code: string) {
  const { output } = runOxlint(code)
  expect(output).not.toContain('vitest-prefer-to-have-been-called-times')
}

describe('vitest-prefer-to-have-been-called-times', () => {
  describe('invalid', () => {
    it('reports expect(spy).toHaveBeenCalledOnce()', () => {
      expectLintError('expect(spy).toHaveBeenCalledOnce()')
    })

    it('reports expect(spy).not.toHaveBeenCalled()', () => {
      expectLintError('expect(spy).not.toHaveBeenCalled()')
    })
  })

  describe('valid', () => {
    it('allows expect(spy).toHaveBeenCalledTimes(1)', () => {
      expectNoLintError('expect(spy).toHaveBeenCalledTimes(1)')
    })

    it('allows expect(spy).toHaveBeenCalledTimes(0)', () => {
      expectNoLintError('expect(spy).toHaveBeenCalledTimes(0)')
    })

    it('allows expect(spy).toHaveBeenCalledTimes(3)', () => {
      expectNoLintError('expect(spy).toHaveBeenCalledTimes(3)')
    })

    it('allows expect(spy).toHaveBeenCalled()', () => {
      expectNoLintError('expect(spy).toHaveBeenCalled()')
    })

    it('allows expect(spy).toHaveBeenCalledWith("arg")', () => {
      expectNoLintError('expect(spy).toHaveBeenCalledWith("arg")')
    })
  })
})
