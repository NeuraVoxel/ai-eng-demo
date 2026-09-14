/**
 * The canonical Node HTTP server example, kept as an importable module.
 *
 * Importing this file binds no port and prints nothing; only direct execution starts the server on
 * the example's default port. Tests import `createServer` and listen on an ephemeral port instead,
 * so suite runs never contend for that default.
 */

import http from 'node:http'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PORT = 8888

/**
 * Answer every request with `200` and a plain-text `Hello World`, as the example does. There is no
 * routing: unknown paths receive the same response.
 */
export function requestHandler(request, response) {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Hello World\n')
}

/** Build the server without starting it; the caller owns listening and closing. */
export function createServer() {
  return http.createServer(requestHandler)
}

// Both sides are resolved before comparing: `import.meta.url` is symlink-resolved while `argv[1]` is
// not, so a bare comparison reports false whenever this file is reached through a symlink.
function isDirectRun() {
  if (process.argv[1] === undefined) return false
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])
  } catch {
    return false
  }
}

if (isDirectRun()) {
  createServer().listen(PORT)
  console.log(`Server running at http://127.0.0.1:${PORT}/`)
}
