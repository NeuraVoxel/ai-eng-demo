# Agent Note: Runnable check lane for code and notes

Status: implemented

## Problem

The repository had no runnable check for its own code. `package.json` carried npm's placeholder `test` script (`echo "Error: no test specified" && exit 1`), no test dependency was installed, and no test file existed, so the behavior of `index.js` was pinned only by commands someone typed by hand. The standing order that requires the smallest relevant check before push names package tests for code; that half had nothing to invoke.

The notes gate had the same shape one step milder. It worked, but only when someone retyped `pnpm exec ai-eng verify-notes .agents/notes`. `AGENTS.md` asks for a `verify-notes` script, and the repeated retyping was the evidence that one was wanted.

## Decision

`pnpm test` runs `node --test "tests/**/*.test.js"`, using the test runner built into Node 22. No test dependency is installed and none is needed.

- `tests/hello-world.test.js` pins the observable behavior of the entry point: running `index.js` writes exactly `Hello World\n` to stdout and exits 0. It spawns the entry point as a child process rather than importing it, so the assertion covers the artifact a user runs instead of an internal function.
- `pnpm verify-notes` runs `ai-eng verify-notes .agents/notes`.
- Tests run from a consumer-owned workflow, `.github/workflows/ci.yml`. The kit-owned `.github/workflows/ai-eng.yml` keeps the notes gate and is deliberately untouched: `ai-eng init --upgrade` rewrites that file unconditionally, so a test step placed there would be deleted by the next upgrade with no signal.

## Testing

- `pnpm test` runs one test and passes.
- The lane rejects real regressions instead of passing everything: replacing the output with `Goodbye` fails it, and printing the correct text with a non-zero exit fails it with `expected exit 0, got 3`.
- `pnpm verify-notes` reports the notes tree and exits 0.

## Alternatives considered

- **Install Vitest, matching the kit's own stack.** Deferred, not rejected: the kit documents a Vitest recipe, but it brings a dependency tree to a repository whose only source is a three-line entry point, while Node 22 already ships a runner that covers this behavior with no supply-chain surface. It becomes the better trade when the suite needs watch mode, mocking, or the documented coverage thresholds.
- **Add the test step to the existing `.github/workflows/ai-eng.yml`.** Rejected: `ai-eng init --upgrade` rewrites that file unconditionally, so the step would vanish on the next upgrade without any signal.
- **Keep the placeholder `test` script and rely on hand-run commands.** Rejected: it satisfies neither half of the check requirement, and a command retyped by hand is not a lane.

## Consequences

- A code change now has a command that can fail, so "package tests for code" has a referent in this repository.
- The test asserts exact stdout, so changing the greeting is a deliberate change that must update the test in the same change.
- The lane covers one behavior of one file. It is a lane, not a suite: there is no coverage gate, no type checking, and nothing tests the scaffolded documentation.
- `node --test` in Node 22.23.2 rejects a bare directory argument, which is why the script names a glob rather than `tests/`.
- CI runs the lane from a file the kit never rewrites, so the check survives `ai-eng init --upgrade`.

## Deferred

- Coverage gating. The testing policy prefers per-source threshold gates; `node --test` needs `--experimental-test-coverage` or an added tool to supply them, and no threshold has been chosen yet.
- Adopting the kit's Vitest recipe, if the suite outgrows the built-in runner.

## Related

- The runner choice above is superseded by [Vitest as the single test runner](2026-09-14-vitest-runner.md), which realises the Vitest item under `## Deferred`. The `verify-notes` script and the consumer-owned workflow placement recorded here still stand.
