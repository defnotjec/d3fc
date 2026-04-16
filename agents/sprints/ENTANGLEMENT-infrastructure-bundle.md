---
sprint: infrastructure-bundle
issues: [24, 16, 17, 21, 23]
repo: defnotjec/d3fc
created: 2026-04-15
status: not-started
---

# Infrastructure Bundle: Entanglement Map

> This document captures the full context needed to execute the coordinated infrastructure upgrade.
> Load this at session start to resume work.

## Issues in This Bundle

| # | Title | Effort | Key Change |
|---|-------|--------|-----------|
| #24 | Bump CI Node version 20.15.0 → ≥20.19.0 | trivial | `.github/workflows/development.yml` |
| #16 | Jest 29→30 + canvas 2→3 | complex | 3 phases (unit tests, example tests, glsl-transpiler) |
| #17 | Eliminate expression-eval warning | moderate | Phase 3 of #16 (glsl-transpiler 3.x + prepr override) |
| #21 | Lerna 8→9 | simple | Requires Node ≥20.19 |
| #23 | jsdom 24→29 | moderate | Requires Node ≥20.19 + canvas 3 |

## Dependency Graph

```
#24 (Node ≥20.19) ─── unblocks ──→ #16 (Jest 30 + canvas 3)
                  ├── unblocks ──→ #21 (lerna 9)
                  └── unblocks ──→ #23 (jsdom 29)

#16 Phase 1 (jest + jest-environment-jsdom + canvas 3 + @types/jest)
    ↓
#16 Phase 2 (jest-puppeteer 11 + rewrite toMatchPerformanceSnapshot + fix example test conflicts)
    ↓
#16 Phase 3 = #17 (glsl-transpiler 3.x + prepr ^2.0.0 override + Jest ESM config)

#23 (jsdom 29) ← requires canvas 3 (shared with #16) + sendTo→forwardTo rename in 15 files
```

## Execution Order

```
Step 1: #24 — Bump Node version in CI workflow
             File: .github/workflows/development.yml
             Change: 20.15.0 → 20.19.0 (or latest 20.x patch)
             Also update CLAUDE.md if it references 20.15.0

Step 2: #16 Phase 1 — Core Jest + canvas upgrade
             Packages: jest ^30, jest-environment-jsdom ^30, canvas ^3, 
                       @types/jest ^30, jest-image-snapshot ^6.5.2
             Verify: npm test (67 unit test files)
             Risk: canvas 3 native rebuild, jsdom 26 strictness,
                   createCanvas() zero-arg may need (300, 150)
             Files with createCanvas(): 5 test files in d3fc-annotation + d3fc-series

Step 3: #16 Phase 2 — Example test infrastructure
             Packages: jest-puppeteer ^11 (optional but recommended)
             REWRITE: examples/__helpers__/toMatchPerformanceSnapshot.js
                      (uses private jest-snapshot internals: _snapshotData, _updateSnapshot)
             FIX: examples/jest.config.js testEnvironment/preset conflict
             Verify: example screenshot test suite

Step 4: #16 Phase 3 = #17 — glsl-transpiler + prepr
             Packages: glsl-transpiler ^3.0.3
             Override: "glsl-transpiler": { "prepr": "^2.0.0" }
             CONVERT: packages/d3fc-webgl/test/util/vertextShaderUtil.js
                      require('glsl-transpiler') → import (ESM)
             CONFIGURE: Jest ESM support (transformIgnorePatterns or --experimental-vm-modules)
             Verify: 2 shader test files (line + errorbar shaderSpec.js)
             Risk: Float32Array precision change in glsl-transpiler 3.0

Step 5: #23 — jsdom 24→29
             Package: jsdom ^29.0.0
             RENAME: sendTo() → forwardTo() in 15 bundleSpec.js files
             Note: canvas 3 already done in Step 2
             Verify: 15 bundleSpec.js tests

Step 6: #21 — lerna 8→9
             Package: lerna ^9.0.0
             RUN: npx lerna repair (cleans lerna.json)
             Verify: npm run bundle, npm run bundle-min
             Note: Large package-lock.json diff (Nx 17→21)
```

## Shared Blockers Summary

| Blocker | Required by | Resolved in |
|---------|-------------|-------------|
| Node ≥20.19.0 | #16 (jest-environment-jsdom@30 via jsdom ≥28), #21 (lerna 9), #23 (jsdom ≥28) | Step 1 (#24) |
| canvas 2→3 | #16 (jest-environment-jsdom@30 peer dep), #23 (jsdom ≥26 peer dep) | Step 2 (#16 Phase 1) |
| Jest ESM support | #17 (glsl-transpiler 3.x is ESM-only, prepr 2.x is ESM-only) | Step 4 (#16 Phase 3) |

## Key Files to Modify

| File | Steps | Change |
|------|-------|--------|
| `.github/workflows/development.yml` | 1 | Node version bump |
| `package.json` | 1-6 | Version bumps, overrides |
| `package-lock.json` | 1-6 | Regenerated |
| `scripts/jest/jest.config.js` | 2, 4 | Possible ESM config |
| `lerna.json` | 6 | lerna repair cleanup |
| 5 test files using `createCanvas()` | 2 | May need explicit dimensions |
| `examples/__helpers__/toMatchPerformanceSnapshot.js` | 3 | **REWRITE** — private API |
| `examples/jest.config.js` | 3 | Fix preset conflict |
| `packages/d3fc-webgl/test/util/vertextShaderUtil.js` | 4 | require → import |
| 2 shader test files | 4 | Precision validation |
| 15 `packages/*/test/bundleSpec.js` | 5 | sendTo → forwardTo |

## PR Strategy

**Decision needed:** One mega-PR or multiple coordinated PRs?

Options:
- **A: Single PR** — all 6 steps in one commit or squashed. Large diff but one review cycle.
- **B: Sequential PRs** — each step as its own PR, each depending on the previous. Clean history but slow if maintainers are slow to merge.
- **C: Node bump PR + everything else PR** — #24 alone (trivial, easy to merge), then the rest bundled. Pragmatic middle ground.

Recommendation: Option C — ship #24 first (1-line change, obviously safe), then bundle Steps 2-6 into a single "modernize test infrastructure" PR once Node is bumped.

## Warnings Eliminated

After this bundle completes:
- ✓ `abab@2.0.6` (Step 2 — jest-environment-jsdom@30 bundles jsdom ≥26)
- ✓ `domexception@4.0.0` (Step 2 — same)
- ✓ `expression-eval@5.0.1` (Step 4 — glsl-transpiler 3.x + prepr ^2.0.0)

**All 3 deprecation warnings eliminated.**

## Vulnerabilities Addressed

- jest-environment-jsdom low vulns (Step 2)
- lerna transitive highs (Step 6)
- Remaining after this bundle: ~40-50 (mostly d3 v6 — deferred to Epic 2)

## Prior Investigation Docs

- `/tmp/M2-jest-30-upgrade.md` — Jest 30 detailed analysis
- `agents/assessments/ASSESSMENT-modernization.md` — full dependency audit
- Issue bodies on defnotjec/d3fc #16, #17, #21, #23, #24 — each has full context

## Session State

- Branch: start from `internal/workflow`, create `fix/infrastructure-bundle` from `upstream/master`
- All standalone M-tier items shipped (#18 markdownlint, #19 TypeScript, #20 puppeteer, #22 mockdate)
- T1-T9 trivial tier shipped (#1901-#1909)
- Total upstream PRs to date: 17
