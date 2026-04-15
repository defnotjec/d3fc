# CLAUDE.md - d3fc Fork (defnotjec/d3fc)

This is a fork of [d3fc/d3fc](https://github.com/d3fc/d3fc) used for contributing upstream fixes.

## Branch Topology (CRITICAL)

```
upstream/master        ← d3fc/d3fc (read-only, fetch-only)
    │
    ├── internal/workflow  ← OUR branch: CLAUDE.md, agents/, .claude/
    │                        NEVER PR this upstream
    │
    └── fix/*              ← Fix branches: created from upstream/master
                             ONLY code changes + changeset
                             These become upstream PRs
```

**Rules:**
- Fix branches MUST be created from `upstream/master`, NOT from `internal/workflow`
- Fix branches must NEVER contain agents/, CLAUDE.md, or .claude/ files
- Always `git fetch upstream` before creating fix branches to stay current
- `internal/workflow` is pushed to `origin` (our fork) but never PR'd upstream

## Git Configuration

```bash
git commit --author="defnotjec <defnotjec@users.noreply.github.com>"
```

- Never commit as "claude" or any other identity
- **No AI attribution** in commit messages

## Upstream Conventions

d3fc uses:
- **Conventional Commits**: `type(scope): description`
- **Lerna monorepo**: 21 packages under `packages/`
- **Changesets** for versioning: run `npx changeset` to create version bump files
- **Node 20.15.0**: pinned in CI (`.github/workflows/development.yml`)
- **Rollup 2.x** for bundling, **Jest 29** for testing
- **ESLint + Prettier**: single quotes, 4-space tab width

## Build & Test

```bash
# Must use Node 20.15.0
eval "$(fnm env --shell zsh)" && fnm use 20.15.0

npm ci                  # Install dependencies
npm run bundle          # Build all 21 packages
npm run bundle-min      # Minified builds
npm test                # Jest + type tests (run AFTER build)
npm run lint            # ESLint + markdownlint
```

**Important:** Tests require build artifacts. Always build before testing.

## PR Submission Checklist

Before submitting a PR to upstream `d3fc/d3fc`:
1. Branch created from latest `upstream/master`
2. Fix is minimal — no unrelated changes
3. `npm run bundle && npm run bundle-min` passes
4. `npm test` passes (377 tests)
5. `npm run lint` passes
6. Changeset added via `npx changeset`
7. Commit message follows Conventional Commits
8. NO agents/, CLAUDE.md, or .claude/ files in the branch

## Milestones

Milestones are **categorical** — they group work by product area or concern, NOT by release cycle or timeline. Create milestones as categories are discovered organically from the issues being tracked.

Examples of categorical milestones for d3fc contributions:
- `Axis Rendering` — bugs and improvements in axis/tick rendering
- `Build Infrastructure` — build tooling, CI, bundling issues
- `WebGL` — WebGL-specific rendering issues

Do NOT create milestones for sprints, versions, or deadlines.

## Workflow Pipeline

Uses happy-path pipeline commands for internal tracking on `internal/workflow` branch.
Fix implementation happens on clean fix branches.

| Workflow Label | Process |
|---------------|---------|
| `wf: direct` | Fix -> Commit -> `/ship` |
| `wf: abbr` | `/outline` -> `/spec --abbr` -> `/implement` -> `/ship` |

Pipeline commands and agent definitions loaded from happy-path via additionalDirectories.

## GitHub Repos

| Short Name | Full Name | Path |
|-----------|-----------|------|
| d3fc (fork) | `defnotjec/d3fc` | `/Users/jonathanharton/Code/d3fc` |
| d3fc (upstream) | `d3fc/d3fc` | — (remote only) |
| happy-path | `foxfintech/happy-path` | `/Users/jonathanharton/Code/happy-path/` |

## Shell Commands — No `cd` Prefix (MANDATORY)

**NEVER** use `cd /path && command`. Use flag-based targeting:

```bash
git -C /path/to/repo status
gh --repo owner/repo issue list
```
