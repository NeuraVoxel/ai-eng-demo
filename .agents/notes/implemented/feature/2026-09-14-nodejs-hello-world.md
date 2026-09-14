# Agent Note: Node.js Hello World

Status: implemented

## Problem

The repository was scaffolded but shipped no runnable source. `package.json` declared `"main": "index.js"` and `"type": "module"`, yet no `index.js` existed, so the declared entry point resolved to nothing and `node index.js` failed. The only script was the placeholder `test`, which exits 1 by design. Nothing in the repository could be executed to confirm the Node.js setup worked end to end.

## Decision

`index.js` at the repository root is an ES module that writes `Hello World` to stdout and exits 0.

- Root placement matches the `main` field that `package.json` declares, so the entry point resolves with no path indirection.
- ES module syntax matches the repository's `"type": "module"`.
- The `start` script (`node index.js`) reaches the file through the repository's pinned package manager instead of a remembered path.

The proposal originated as an inbox spark: [2026-09-14-nodejs-hello-world.md](../../../inbox/2026-09-14-nodejs-hello-world.md).

## Alternatives considered

- **Leave the spark unbuilt.** Rejected: it was promoted deliberately, and the dangling `main` left the repository with no runnable state to verify the Node.js setup against.
- **Place the file at `src/index.js` and repoint `main`.** Rejected for now: it adds a directory and a manifest edit to serve a single file, while the declared `main` already names the root path. The layout is worth revisiting once a second module exists.
- **Build a CLI that takes the greeting as an argument.** Rejected: unstated scope. The spark asked for a Hello World, and argument handling can be proposed separately if it is wanted.

## Testing

- `node index.js` writes exactly `Hello World\n` to stdout and exits 0.
- `pnpm start` writes the same bytes and exits 0.
- The `main` field in `package.json` (`index.js`) resolves to a file that exists.

## Consequences

- The repository has a runnable entry point, so the declared `main` no longer dangles and the Node.js setup can be confirmed end to end.
- The entry file is trivial and is expected to be superseded once real functionality lands. Keeping `main` and the file aligned remains a manual step with no gate behind it.
- The repository is ESM, so a CommonJS example fails at runtime; a later switch of module system must update this file.
- No test lane is configured, so the behavior above is pinned only by the documented manual commands until a test framework is chosen.
