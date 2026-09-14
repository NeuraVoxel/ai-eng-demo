# Agent Note: HTTP server example

Status: implemented

## Problem

The repository has a runnable entry point but no server. The canonical Node example for one is CommonJS (`var http = require('http')`), which cannot run here: `package.json` sets `"type": "module"`, so a `.js` file using `require` throws immediately.

Porting that example verbatim would also make it untestable. It starts listening on a hardcoded port `8888` at module load and returns no handle, so a test can neither choose its own port nor close the server, and two concurrent runs collide with `EADDRINUSE`.

## Decision

`server.js` is an ES module that carries the example's behaviour in importable pieces and reproduces the example when run directly.

- `requestHandler(request, response)` writes `200` with `Content-Type: text/plain` and ends with `Hello World\n`, for every request path. There is no routing.
- `createServer()` returns `http.createServer(requestHandler)` without starting it; the caller owns listening and closing.
- `node server.js` listens on `8888` and logs `Server running at http://127.0.0.1:8888/`.

Importing the module binds no port and prints nothing. Only direct execution starts the server.

Direct execution is detected by resolving `import.meta.url` and `process.argv[1]` through `realpathSync` before comparing them. The naive comparison against `pathToFileURL(process.argv[1]).href` is provably false through a symlink, because `argv[1]` reports the link path while `import.meta.url` reports its target. This kit already shipped and fixed that exact defect in its own CLI at `v0.1.14`.

## Testing

- `node server.js` logs `Server running at http://127.0.0.1:8888/`, answers `GET /` with `200`, `Content-Type: text/plain`, and body `Hello World\n`, and releases the port when killed.
- Importing the module exposes `createServer` and `requestHandler` and binds no port.
- `node <symlink to server.js>` still starts the server, which is what resolving both paths buys.
- `tests/server.test.js` exercises the response over an ephemeral port from `listen(0)`, so the suite never occupies `8888`.

## Alternatives considered

- **Ship the snippet verbatim as `server.cjs`.** Rejected: `require` works in a `.cjs` file, but the fixed port and the missing server handle force the test to spawn a real process on `8888`, which collides across runs and cannot be pointed at an ephemeral port.
- **Keep `server.js` pure and add a separate `start-server.js` entry.** Rejected: two files for one concept, and `node server.js` would then exit without serving, contradicting the example's contract.
- **Listen on import and export the server instance.** Rejected: importing the module would bind `8888` as a side effect, so a test could not import it without occupying the port.

## Consequences

- The repository has a server example that the suite exercises rather than relying on a hand-run command.
- The example answers `200` for unknown paths, so it is not a base to grow routing onto without revisiting the handler.
- The default-port path is not covered by a test, so a regression in the `8888` default or the startup log is caught only by running the server.
- Binding failure is unhandled: if `8888` is already in use, the process exits with `EADDRINUSE`, exactly as the original example does.
- The direct-run guard depends on resolving both paths; a later simplification back to a bare `argv[1]` comparison silently breaks `node server.js` through a symlinked path.

## Related

- [Vitest as the single test runner](../testing/2026-09-14-vitest-runner.md) — the lane this example is verified through.
