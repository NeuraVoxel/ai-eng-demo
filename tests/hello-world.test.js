import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const entryPoint = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js')

test('the entry point writes exactly "Hello World" and exits 0', () => {
  const result = spawnSync(process.execPath, [entryPoint], { encoding: 'utf8' })

  assert.equal(result.status, 0, `expected exit 0, got ${String(result.status)}: ${result.stderr}`)
  assert.equal(result.stdout, 'Hello World\n')
})
