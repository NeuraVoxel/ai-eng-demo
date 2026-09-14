import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const entryPoint = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.js')

test('the entry point writes exactly "Hello World" and exits 0', () => {
  // Spawn the entry point rather than importing it: the assertion must cover the artifact a user
  // runs, and an import would print into the test process instead of an observable child.
  const result = spawnSync(process.execPath, [entryPoint], { encoding: 'utf8' })

  expect(result.status).toBe(0)
  expect(result.stdout).toBe('Hello World\n')
})
