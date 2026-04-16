# ADR-001: Fork CI/CD Topology and Release Branch Strategy

**Status**: Accepted
**Date**: 2026-04-16
**Decision Makers**: Jonathan Harton, Claude
**Related Issues**: defnotjec/d3fc#43, defnotjec/d3fc#5, defnotjec/d3fc#6

---

## Context

The `defnotjec/d3fc` fork has shipped 33 upstream PRs to `d3fc/d3fc` covering build infrastructure modernization (Epic #5), D3 v7 upgrade (Epic #6), WebGL shader decoration examples, and axis label decoration examples. These PRs have no guaranteed merge timeline — upstream is a small team with infrequent releases.

If upstream doesn't adopt our changes, we need the ability to independently build, test, and release our improvements. After completing Epic #5, we have deep knowledge of the upstream CI/CD tooling (GitHub Actions, changesets, lerna monorepo, Jest, Rollup) and can replicate it efficiently.

### Current state

- `upstream/master` — read-only, fetch-only remote
- `internal/workflow` — our working branch for CLAUDE.md, agents/, .claude/ (never released)
- `fix/*` branches — clean fix branches created from `upstream/master` for upstream PRs
- `integration/full-stack` — all Epic #5 PRs merged (tagged `epic5-complete`)
- `fix/d3-v7` — D3 v6→v7 upgrade based on `integration/full-stack`
- No CI, no branch protection, no release pipeline on the fork

---

## Decision

### Branch topology

Adopt a four-branch release topology with version separation and staging gates:

```
upstream/master (read-only)
    │
    ├── d3fc-v6-latest    ← production: upstream master + accepted fixes
    │     └── d3fc-v6-staging  ← integration testing before promotion
    │
    ├── d3fc-v7-latest    ← production: full infrastructure + D3 v7
    │     └── d3fc-v7-staging  ← integration testing before promotion
    │
    ├── fix/*             ← upstream PR branches (from upstream/master)
    │
    └── internal/workflow ← CLAUDE.md, agents/, .claude/ (never released)
```

### CI replication

Two GitHub Actions workflows adapted from upstream:

**`development.yml`** — build, test, lint, commitlint. Triggers on pushes to all four release branches and PRs targeting them. Pinned to Node 20.15.0.

**`release.yml`** — calls development.yml as prerequisite, then runs `changesets/action` for changelog generation and version bump PRs. No npm publish.

### Changeset strategy

- Changelog generation only — no npm publish
- Use standard `changesets/action` (not upstream's `d3fc/changesets-action` fork, which includes npm-specific customizations we don't need)
- Install [Changeset Bot](https://github.com/apps/changeset-bot) GitHub App for PR comments
- Repo is public — consumers can find it — but we're not actively distributing packages

### Merge flow

```
fix/* branches ──► *-staging (CI required, review optional)
*-staging      ──► *-latest (CI required, promotion after integration pass)
internal/workflow   never merges into release branches
```

### Branch protection

All four release branches are protected:

| Rule | `*-staging` | `*-latest` |
|------|-------------|------------|
| Require status checks (CI) | ✅ | ✅ |
| Require PR (no direct push) | ✅ | ✅ |
| Restrict force push | ✅ | ✅ |
| Require linear history | — | ✅ |

`internal/workflow` remains unprotected.

---

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Single `defnotjec-latest` branch** | Simpler topology | Can't offer v6 (compatible) and v7 (modern) independently |
| **No staging branches** | Fewer branches to manage | No integration gate; broken merges go straight to production |
| **Fork upstream's `d3fc/changesets-action`** | Exact upstream parity | Unnecessary maintenance burden; we don't publish to npm |
| **Publish to npm under `@defnotjec`** | Users can `npm install` our fork | Premature; adds npm token management and release ceremony |

---

## Rationale

**v6/v7 split**: Our v7 branch includes the full infrastructure modernization stack (Node 20.19, Jest 30, Rollup 4, ESLint 9, Prettier 3, D3 v7) which is a significant departure from upstream. Consumers who want just our bug fixes without the infrastructure overhaul can use v6-latest. This mirrors how upstream might eventually adopt changes incrementally.

**Staging branches**: Cheap insurance. Merging multiple fix branches can surface integration issues that per-branch CI doesn't catch. The staging→latest promotion is a lightweight gate.

**Changelog only**: We're contributing upstream, not competing. The changelog documents what we've done and why, which is useful for our own tracking and for upstream maintainers reviewing our work.

**Standard `changesets/action`**: Upstream's fork (`d3fc/changesets-action@v1.4.9`) adds npm publish customizations. Since we're changelog-only, the standard action is simpler and maintained by the changesets team.

---

## Consequences

### Positive
- Fork can ship independently if upstream is slow to merge
- CI catches regressions on our release branches
- Branch protection prevents accidental direct pushes
- Changelog documents our work for both us and upstream maintainers
- v6/v7 split gives consumers flexibility

### Negative
- Four protected branches to maintain
- CI minutes consumed on every push/PR (GitHub Free: 2000 min/month)
- Changeset bot adds noise to PRs (but matches upstream convention)

### Neutral
- `fix/*` branches continue to target `upstream/master` for upstream PRs
- `internal/workflow` is completely isolated from release topology

---

## Implementation

1. ✅ Created `d3fc-v6-latest` from `upstream/master`
2. ✅ Created `d3fc-v6-staging` from `d3fc-v6-latest`
3. ✅ Created `d3fc-v7-latest` from `fix/d3-v7` (includes `integration/full-stack`)
4. ✅ Created `d3fc-v7-staging` from `d3fc-v7-latest`
5. Create `.github/workflows/development.yml` (adapted from upstream)
6. Create `.github/workflows/release.yml` (changelog only)
7. Configure `.changeset/config.json`
8. Set branch protection rules via `gh api`
9. Install Changeset Bot GitHub App

---

## Reassessment Trigger

- **Upstream accepts our PRs** → v6-latest becomes redundant; may collapse to v7 only
- **Decision to publish to npm** → switch to upstream's `d3fc/changesets-action` fork, configure npm tokens, add `@defnotjec` scope
- **CI minutes exhausted** → reduce branch triggers or switch to self-hosted runners
- **Upstream releases a major version** → re-evaluate v6/v7 split relevance

---

## References

- Upstream CI: `.github/workflows/development.yml`, `.github/workflows/release.yml`
- Upstream changeset action: `d3fc/changesets-action@v1.4.9`
- Standard changeset action: `changesets/action`
- Changeset Bot: https://github.com/apps/changeset-bot
- Epic #5 (Build Infrastructure): defnotjec/d3fc#5
- Epic #6 (D3 v7): defnotjec/d3fc#6
- This epic: defnotjec/d3fc#43
