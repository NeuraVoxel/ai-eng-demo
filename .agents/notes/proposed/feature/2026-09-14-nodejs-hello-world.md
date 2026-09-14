# Agent Note: Node.js Hello World

Status: proposed

## Problem

The repository is scaffolded but ships no runnable source. `package.json` declares `"main": "index.js"` and `"type": "module"`, yet no `index.js` exists, so the declared entry point resolves to nothing and `node index.js` fails. The only script is the placeholder `test`, which exits 1 by design. Nothing in the repository can be executed to confirm the Node.js setup works end to end.

## Proposal

Add `index.js` at the repository root: an ES module that writes `Hello World` to stdout and exits 0.

- Root placement matches the `main` field that `package.json` already declares, so making the entry point resolve needs no manifest edit.
- ES module syntax matches the existing `"type": "module"`.
- A `start` script (`node index.js`) reaches the file through the repository's pinned package manager instead of a remembered path.

Source spark: [2026-09-14-nodejs-hello-world.md](../../../inbox/2026-09-14-nodejs-hello-world.md).

## Alternatives considered

- **Leave the spark unbuilt.** Rejected: it was promoted deliberately, and the dangling `main` means the repository has no runnable state to verify the Node.js setup against.
- **Place the file at `src/index.js` and repoint `main`.** Rejected for now: it adds a directory and a manifest edit to serve a single file, while the declared `main` already names the root path. The layout is worth revisiting once a second module exists.
- **Build a CLI that takes the greeting as an argument.** Rejected: unstated scope. The spark asks for a Hello World, and argument handling can be proposed separately if it is wanted.

## Acceptance criteria

- `node index.js` prints `Hello World` and exits 0.
- `pnpm start` produces the same output, so the capability is reachable through the repository's declared package manager.
- The `main` field in `package.json` resolves to a file that exists.

## Risks

- The entry file is trivial and is expected to be superseded once real functionality lands; keeping `main` and the file aligned is a manual step with no gate behind it.
- The repository is ESM, so a CommonJS example would fail at runtime. This proposal pins ES module syntax, and a later switch of module system must update it.
- No test lane is configured, so the accepted behavior is pinned only by a manual command until a test framework is chosen.
