# Agent Note: Vitest as the single test runner

Status: implemented

## Problem

The check lane ran `node --test "tests/**/*.test.js"` and depended on nothing. A new HTTP server example must be tested with Vitest, and running two runners side by side would mean two assertion styles, two configurations, and two parallel-execution behaviours for a small suite.

The lane note anticipated this: it recorded adopting Vitest under `## Deferred`, to be revisited if the suite outgrew the built-in runner.

## Decision

Vitest is the repository's only test runner, installed as a devDependency here (`vitest` 5.x).

- `package.json` `test` runs `vitest run`.
- `tests/hello-world.test.js` spawns the entry point and asserts its exit status and exact stdout.
- The consumer-owned `.github/workflows/ci.yml` keeps its shape; it runs `pnpm test`, so it follows the script.

No Vitest configuration file is needed: the default discovery rules pick up `tests/*.test.js`, so further test files under `tests/` run without additional wiring.

This supersedes the runner decision in [Runnable check lane for code and notes](2026-09-14-runnable-check-lane.md). The parts of that note that remain current — the `verify-notes` script, and running tests from the consumer-owned workflow rather than the kit-owned one — are unchanged.

## Testing

- `pnpm test` runs the suite through Vitest and exits 0.
- The lane rejects a real regression: replacing the entry point's output fails `tests/hello-world.test.js`.
- No `node --test` invocation remains in `package.json` or in CI.

## Alternatives considered

- **Run both runners, `node --test … && vitest run`.** Rejected: two assertion styles and two configurations for one small suite, and a failure that no longer names a single runner.
- **Keep `node:test` and skip Vitest.** Rejected: it contradicts the requirement that the new example be tested with Vitest.
- **Add Vitest for the new test only and leave the old file on `node:test`.** Rejected: it is the two-runner option with an added footgun, since each file would be discovered by one runner and not the other.

## Consequences

- A single runner covers the suite, so assertion style and configuration have one home.
- Vitest brings a dependency tree to a repository with very little source, in exchange for the runner the kit documents and this repository standardises on.
- The lane note stays in the tree, partially superseded; its cross-link to this note is what keeps the older runner decision from being read as current.
