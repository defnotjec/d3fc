# d3fc Local Commands Analysis — happy-path Adaptation

**Status**: Draft for discussion
**Date**: 2026-04-16
**Context**: defnotjec/d3fc#43 (Fork CI/CD Epic)

---

## Problem

The happy-path pipeline is designed for **product development** (foxfintech/foxfincharts) — specification-driven, fintech-aware, with heavy artifact trails. d3fc is an **upstream contribution fork** — we fix, extend, and PR to someone else's repo. The workflow shape is fundamentally different:

| Concern | happy-path | d3fc |
|---------|-----------|------|
| **Goal** | Build product features | Contribute upstream fixes |
| **PR target** | Own `staging` branch | Upstream `d3fc/d3fc:master` + fork staging |
| **Git history** | Our repo, our rules | Must be clean for upstream acceptance |
| **Artifacts** | Heavy (SCOPE, PLAN, VALIDATION, ASSESSMENT, COMPLIANCE) | Light — upstream doesn't see our process |
| **Build tooling** | `bun` | `npm` + Node 20.15.0 |
| **Commit style** | Feature branches, squash OK | Conventional commits, minimal history, no AI attribution |
| **Workflow variants** | direct / abbr / full | direct / abbr (full is rarely justified) |
| **Milestones** | Version-based (v0.1.x → v1.0.x) | Categorical (Axis Rendering, WebGL, Build Infrastructure) |
| **Review value** | REVIEWER + CONTEXT dialogue is high-value | Same — keep this |
| **Spec value** | High for complex features | Occasionally useful for large upgrades (Epic #5, D3 v7) |
| **Trading semantics** | Required (fintech) | N/A |

---

## Command-by-Command Analysis

### 1. `/ship` — **NEEDS LOCAL OVERRIDE**

**What to keep from happy-path:**
- Phase 1: Automated checks (CHECKER agent) — adapt check names for d3fc CI
- Phase 2: DISCUSSION BLOCKs (REVIEWER + CONTEXT) — this is the crown jewel, keep entirely
- Phase 3: Document assembly — keep, useful for our records
- Phase 4: Remediation — keep, but remediations must:
  - Use `--author="defnotjec <...>"`, no AI attribution
  - Be squashed or logically folded into existing commits to avoid git noise
  - Follow conventional commit format
- Phase 5: PR comments — keep
- Phase 6: Verdict — keep

**What to change:**
- **Branch guard**: Verify `fix/*` branch based on `upstream/master`, no forbidden files (agents/, CLAUDE.md, .claude/), changeset exists
- **Pre-flight**: `npm run bundle && npm run bundle-min && npm test && npm run lint` (not `bun run pr-ready`)
- **PR creation**: Three-target flow:
  1. GATE: Draft upstream PR body → user approval
  2. Push to `origin` with explicit refspec
  3. Create PR to `d3fc/d3fc:master`
  4. Create PRs to `defnotjec/d3fc:d3fc-v6-staging` and `d3fc-v7-staging`
  5. Close local issue
- **Remove**: PLAN/VALIDATION/COMPLIANCE self-healing (we don't produce these artifacts for most work)
- **Remediation commits**: Must be logically clean — amend or squash fixups rather than adding "fix review finding" commits that pollute upstream git history

### 2. `/implement` — **NEEDS LOCAL OVERRIDE**

**What to keep:**
- Step-by-step execution with progress tracking
- `--resume` capability
- PROGRESS writeback to sprint tracking

**What to change:**
- **Commit conventions**: `--author="defnotjec <...>"`, conventional commits, no AI attribution, no `Co-Authored-By`
- **Build tooling**: `npm` commands, `eval "$(fnm env --shell zsh)" && fnm use 20.15.0` prefix
- **No subagent mode by default**: d3fc fixes are typically small enough for main agent. Subagent mode adds overhead without proportional benefit for upstream fixes.
- **Remove**: COMPLIANCE-CHECKER agent (we don't have specs to check against for most work), trading semantics, `bun` references
- **Worktree support**: Keep — useful for parallel fix branches (like we did with axis examples)
- **Commit granularity**: Default to `--commit-phase` since upstream wants clean history

### 3. `/outline` — **LIGHT ADAPTATION**

Mostly works as-is. Changes:
- **Milestones**: Categorical (Axis Rendering, WebGL, Build Infrastructure) not version-based
- **Remove**: Trading semantics prompts
- **Add**: Upstream context check — does this fix relate to an existing upstream issue? If so, link it.
- **Workflow labels**: Same taxonomy works (`wf: direct`, `wf: abbr`)

### 4. `/spec` — **LIGHT ADAPTATION**

The `--abbr` mode (ARCHITECT + TEST-STRATEGIST only, produces PLAN only) is the right weight for d3fc. Full mode is overkill except for epics.

Changes:
- **Remove**: SCOPE-ANALYST (trading semantics), QUALITY-GATE (fintech compliance)
- **`--abbr` as default**: For d3fc, abbreviated spec is the norm, full spec is the exception
- **ARCHITECT**: Focus on upstream codebase patterns rather than our own architecture
- **TEST-STRATEGIST**: Adapt to d3fc's Jest + Puppeteer snapshot testing
- **Remove**: Trading semantic propagation

### 5. `/discovered-issue` — **LIGHT ADAPTATION**

Works well as-is. Changes:
- **Milestones**: Categorical selection instead of version-based
- **Author**: d3fc commit conventions
- **Add**: When filing, consider whether this should also be filed upstream (two-repo awareness)
- **Labels**: Same taxonomy works

### 6. `/sprint` — **LIGHT ADAPTATION**

We've used sprint-like batching (axis examples, WebGL examples). Changes:
- **Milestones**: Categorical
- **Workflow variants**: Only `direct` and `abbr` (drop `full` as default)
- **PRD generation**: Skip — not relevant for upstream contribution batches
- **Batch testing**: Add the "build all, serve, browser-test together" pattern we established

### 7. `/new-issue` — **MINIMAL CHANGES**

- **Milestones**: Categorical
- **Otherwise**: Works as-is

### 8. `/milestone` — **NO LOCAL OVERRIDE NEEDED**

Our milestones are already set up and rarely change. Use happy-path version as-is.

### 9. Utility commands — **NO LOCAL OVERRIDES NEEDED**

- `/audit-insights` — not applicable (no subagent insights)
- `/generate-coverage-report` — not applicable (upstream test suite)
- `/setup-test-infrastructure` — not applicable (upstream infra exists)

---

## Priority for Local Overrides

| Priority | Command | Effort | Reason |
|----------|---------|--------|--------|
| **P0** | `/ship` | Moderate | Every PR goes through this. Three-target flow + clean history is critical. |
| **P1** | `/implement` | Moderate | Commit conventions, build tooling, no subagent overhead |
| **P2** | `/spec` | Light | Default to `--abbr`, remove trading semantics |
| **P3** | `/outline` | Light | Remove trading semantics, add upstream issue linking |
| **P4** | `/discovered-issue` | Light | Categorical milestones, two-repo awareness |
| **P5** | `/sprint` | Light | Categorical milestones, batch testing pattern |
| — | `/new-issue` | Trivial | Just milestone selection change |
| — | `/milestone` | None | Use happy-path as-is |

---

## Key Design Principles for d3fc Local Commands

1. **Upstream-first**: Everything we produce must be acceptable to upstream maintainers. Clean git history, conventional commits, no process artifacts in the PR.

2. **Keep the review dialogue**: REVIEWER + CONTEXT DISCUSSION BLOCKs are the highest-value part of happy-path. Keep them intact.

3. **Remediation = clean commits**: Review findings that need fixes should result in amended or squashed commits, not additional "fix lint" or "address review feedback" commits. Upstream maintainers judge git history quality.

4. **Light artifacts**: We keep artifacts locally (on `internal/workflow`) for our own tracking, but they never appear in upstream PRs. The `fix/*` branches are artifact-free.

5. **Two-repo awareness**: Every command should know about both `defnotjec/d3fc` (fork) and `d3fc/d3fc` (upstream). Issues may exist in either or both.

6. **Batch-friendly**: Related examples/fixes should be buildable and testable together before any ship individually (the pattern we established with axis examples).

---

## Decisions Made (from discussion 2026-04-16)

### 1. `wf: direct` skips review — `wf: abbr` is the norm

`wf: direct` is for **single obvious changes only** — dependency version bumps, typo fixes, trivial config changes. No REVIEWER/CONTEXT dialogue. Just pre-flight checks → push → create PR.

Most d3fc work is `wf: abbr`. The axis decoration examples were `abbr` work incorrectly run as `direct` — we discovered scope expansion (#41 API gap), design decisions (chartCartesian vs standalone), and positioning bugs (getBBox/dy offset) through iteration that `/outline` and `/spec --abbr` would have caught upfront.

### 2. Copy and customize agent definitions

Copy agent `.md` files from happy-path into `d3fc/.claude/agents/` (or equivalent) and customize. This enables:
- REVIEWER: evaluate upstream acceptance likelihood, not fintech compliance
- CONTEXT: reference d3fc conventions, upstream patterns, and contribution norms
- CHECKER: validate changeset presence, conventional commits, clean branch ancestry from upstream/master
- Remove trading semantics from all agent prompts

Accept drift from happy-path as a tradeoff — d3fc's contribution workflow is different enough that shared agents would be a forced fit. A team review of the customized definitions should catch gaps.

### 3. Sprint topology maps to staging branches

The batch-build-test-then-ship pattern maps naturally:

```
fix/* branches
  → sprint/{batch-name} (local test branch — build, serve, browser verify)
  → ship each fix/* as upstream PR to d3fc/d3fc:master
  → ship each fix/* as PR to defnotjec/d3fc:d3fc-v6-staging
  → ship each fix/* as PR to defnotjec/d3fc:d3fc-v7-staging
```

`/sprint --init` creates the sprint tracking, `/ship` handles the three-target PR flow per fix branch after batch verification passes.

### 4. Artifacts: keep `agents/` structure, lighter usage

Keep the `agents/` directory structure for consistency with happy-path conventions, but produce fewer artifacts:
- `agents/sprints/` — SPRINT JSON + PROGRESS MD (already in use)
- `agents/plans/` — PLAN JSON + MD (for `wf: abbr` and above)
- `agents/reviews/` — REVIEW artifacts (from `/ship` review dialogue)
- Skip: SCOPE, VALIDATION, ASSESSMENT, COMPLIANCE (not needed for upstream contribution workflow)

### 5. Resolved: Agent scope and customization

**ARCHITECT**: Point at `HEAD` of the `fix/*` branch, which is based on `upstream/master`. This gives the agent the actual upstream codebase to analyze, not our fork-specific files. If we truly fork in the future, this changes to our own latest branch.

**CHECKER**: Fully customized for d3fc — changeset validation, conventional commit linting, branch ancestry from `upstream/master`, no forbidden files. Replaces happy-path's type checking and coverage thresholds.

**SCOPE-ANALYST**: Don't remove — **repurpose**. Replace trading semantics with d3fc contribution analysis: upstream acceptance likelihood, API surface impact, breaking change assessment, d3fc monorepo cross-package effects (21 packages). The role shape is valuable; the domain context changes.

**QUALITY-GATE**: Don't remove — **repurpose**. Replace fintech compliance with upstream contribution quality: does the change follow d3fc conventions? Is the commit history clean enough? Will the changeset bot be satisfied? Does the PR body match upstream norms? Adversarial review focused on "would upstream merge this?"

### 6. Resolved: Cross-repo issue management

`d3fc/d3fc` is **nearly inviolable** — only polished, reviewed items go there. The workflow is always:

1. Create issue locally in `defnotjec/d3fc` first
2. Iterate, remediate, review locally
3. Only after the issue and its resolution are polished → file upstream in `d3fc/d3fc`

`/discovered-issue` should default to local filing. An explicit `--upstream` flag or a prompt after local filing ("ready to file upstream?") gates the upstream submission.

### 7. Resolved: PROGRESS tracking

Keep atomic tracking. Formalize sprint→staging→latest promotion in PROGRESS files — don't rely solely on git branch state. This gives us a readable audit trail of what went where and when.

### 8. Resolved: `/outline` domain prompts

Instead of generic prompts, direct the outline with d3fc-specific context:
- What makes d3/d3fc what they are — functional composition, decorate pattern, multi-renderer (SVG/Canvas/WebGL), lerna monorepo with 21 interdependent packages
- Upstream conventions — conventional commits, changesets, minimal PRs, CodePens for engagement
- Cross-package impact — does this change ripple across the monorepo?
- Renderer-awareness — does this affect SVG? Canvas? WebGL? All three?

### 9. Resolved: `/spec` agent repurposing

`--abbr` remains the default (ARCHITECT + repurposed TEST-STRATEGIST). Full mode uses all four agents but with d3fc domain context:

| Agent | happy-path role | d3fc role |
|-------|----------------|-----------|
| SCOPE-ANALYST | Trading semantics, stale data, market hours | Upstream acceptance, API surface, cross-package effects |
| ARCHITECT | Codebase impact, plan synthesis | Same — pointed at upstream/master HEAD |
| TEST-STRATEGIST | Test pyramid, fixture analysis | Jest 29 + Puppeteer snapshot testing, d3fc test conventions |
| QUALITY-GATE | Fintech compliance, YAGNI | Upstream merge readiness, convention adherence, git history quality |

---

## Implementation Plan

All local commands and agent definitions go on `internal/workflow` — never leaked to upstream.

### Files to create

```
.claude/commands/
  ship.md              — P0: three-target PR flow + review dialogue
  implement.md         — P1: d3fc commit conventions, npm tooling
  spec.md              — P2: default --abbr, repurposed agents
  outline.md           — P3: d3fc domain prompts, upstream issue linking
  discovered-issue.md  — P4: local-first, categorical milestones
  sprint.md            — P5: batch test pattern, staging integration

agents/
  reviewer.md          — upstream acceptance focus
  context.md           — d3fc conventions and patterns
  checker.md           — changeset, conventional commits, branch ancestry
  architect.md         — upstream/master HEAD analysis
  scope-analyst.md     — cross-package effects, API surface
  quality-gate.md      — upstream merge readiness
  test-strategist.md   — Jest + Puppeteer, d3fc test conventions
```

### Priority execution

| Phase | Commands | Agents | Effort |
|-------|----------|--------|--------|
| 1 | `/ship` | CHECKER, REVIEWER, CONTEXT | Moderate — core workflow |
| 2 | `/implement` | (none — main agent) | Light — convention changes |
| 3 | `/spec`, `/outline` | SCOPE-ANALYST, ARCHITECT, TEST-STRATEGIST, QUALITY-GATE | Moderate — agent repurposing |
| 4 | `/discovered-issue`, `/sprint` | (none) | Light — prompt changes |
