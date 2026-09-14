# Agent Note: ai-eng consumed from the released git tag

Status: implemented

## Problem

This repository pins pnpm in `devEngines.packageManager`. The `ai-eng` CI gate scaffolded by `init` invoked the CLI as `npx --yes @neuravoxel/ai-eng verify-notes .agents/notes`, and npm refuses to run any command in a tree whose `devEngines` names another manager: the gate exited 1 with `EBADDEVENGINES` and checked no notes at all. Upstream fixed that in `v0.1.16`, which resolves the declared manager and emits a pnpm gate that includes a `pnpm install` step.

Validating the fix before it was released required installing it from a local build, recorded as `file:../ai-eng-kit/dist/neuravoxel-ai-eng-0.1.15.tgz`. That path is outside this repository, and `dist/` is gitignored in `ai-eng-kit`, so the tarball exists in no clone and in no commit. The staging channel stayed invisible while the gate had no install step. Once the fixed workflow gained `pnpm install`, a clean checkout failed before the gate could run:

```
[ENOENT] ENOENT: no such file or directory,
  open '/private/tmp/ai-eng-kit/dist/neuravoxel-ai-eng-0.1.15.tgz'
[exit: 254]
```

A consumer whose gate cannot install cannot report a note-format result, so the failure surfaced as a broken dependency channel rather than as anything the notes gate said.

## Decision

The `@neuravoxel/ai-eng` dev dependency is `github:NeuraVoxel/ai-eng-kit#v0.1.16`. The lockfile resolves that tag to commit `ec5a50f`, so an install is reproducible without re-resolving the tag.

The scaffolded workflow is the manager-aware gate: `pnpm/action-setup` at an exact pnpm version, `actions/setup-node` at `'22'`, then `pnpm install` and `pnpm exec ai-eng verify-notes .agents/notes`.

That version is exact rather than a range. pnpm records the engine it ran under in the lockfile — `importers..packageManagerDependencies` pins `pnpm` and `@pnpm/exe` with integrity — and verifies at install time that the running engine matches that pin (`verifyEngineIdentity`, code `PNPM_ENGINE_IDENTITY_UNVERIFIABLE`). While the declaration was `^11.18.0` and the lockfile pinned `11.18.0`, the runner installed `11.27.0` (the newest `11.x`) and `pnpm install` failed before the gate could run:

```
Cannot verify the identity of pnpm@11.27.0: the environment lockfile does not pin it.
```

`package.json` declares `11.18.0` and both workflow files carry the same, matching the lockfile pin.

Bumping the kit is a deliberate act: change the tag in `package.json`, run `pnpm install` to re-pin the lockfile, and re-run `ai-eng init --upgrade .` when the release changes a scaffolded template.

## Testing

- `pnpm exec ai-eng verify-notes .agents/notes` exits 0.
- The gate discriminates: a conforming note passes, while a note missing a required section, carrying a `Status:` that disagrees with its lifecycle folder, or holding a proposal-era heading under `implemented/` each exits 1 with the offending rule named.
- `CI=true pnpm install --frozen-lockfile` exits 0 and leaves `pnpm-lock.yaml` unchanged after the declaration moved from `^11.18.0` to `11.18.0`, so the stricter declaration does not stale the lockfile.
- Clean-checkout simulation in a temporary directory with no sibling `ai-eng-kit`: `pnpm install --frozen-lockfile` exits 0 and the gate exits 0. The same simulation against the previous `file:` dependency exited 254.

## Alternatives considered

- **Vendor the tarball inside the repository and keep `file:`.** Deferred, not rejected. It is the kit's documented offline channel, but it commits a build artifact and needs a rebuild-and-revendor step on every kit change. It becomes the right choice if a runner without registry or git access must run this gate.
- **Keep `file:../ai-eng-kit/dist/…`.** Rejected: the target is outside the repository, and the tarball is gitignored upstream, so neither a clean checkout nor a CI runner can install it.
- **Pin the fix by commit SHA instead of the tag.** Rejected: this repository already framed the dependency as a release tag, and a bare SHA loses the release correspondence that makes the pin reviewable.

## Consequences

- CI fetches the kit from the tag rather than a sibling checkout. That removes the local-tarball dependency; it does not by itself make the job pass. The first run on `main` failed at `pnpm install` on the engine-version mismatch above.
- The gate becomes a real check once the install succeeds: it fails on format violations rather than on `EBADDEVENGINES` before reading any note.
- The dependency resolves to `git+ssh://git@github.com/NeuraVoxel/ai-eng-kit.git`, and that repository is private (its public API returns 404), so a runner has no credentials for it. Whether that blocks the install is unverified: the engine check fails first, so this has not been observed in CI.
- Local verification cannot cover either failure. The development machine's pnpm equals the lockfile pin, and its SSH key reaches the private repository, so every clean-checkout simulation passed while CI failed.

## Related

- Upstream fix and its record: the `ai-eng-kit` Agent Note *CI gate unusable when the consumer pins a non-npm package manager*, shipped in `v0.1.16`.
