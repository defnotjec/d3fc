---
sprint: infrastructure-bundle
issues: [24, 16, 17, 21, 23]
repo: defnotjec/d3fc
created: 2026-04-15
status: complete
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

## How: Execution Narrative

This section records the actual execution path — what happened, what broke, and why we made the decisions we did. The plan above was the map; this is the territory.

### PR Strategy Decision: Option C confirmed

Step 1 (#24, Node bump) shipped alone as d3fc/d3fc#1914 — a trivial 1-line change in 2 places. Steps 2-6 shipped as a single bundled PR because the entanglement proved even tighter than planned: canvas 3 is a peer dep for both jest-environment-jsdom@30 and jsdom@29, and the glsl-transpiler ESM config requires Jest 30's runtime. These cannot be merged independently.

### Step 1 (#24): Node 20.15.0 → 20.19.0 — Clean

Pinned `20.19.0` rather than `20.x` to match the upstream convention of exact version pins. All 5 verification checks passed on first try. Shipped as d3fc/d3fc#1914.

**Why this first:** Every other step has an `engines` or peer dep constraint on Node ≥20.19.0. This is the keystone that unblocks everything else.

### Step 2 (#16 Phase 1): Jest 30 + canvas 3 — Surprisingly clean

Bumped `jest`, `jest-environment-jsdom`, `canvas`, `@types/jest`, `jest-image-snapshot` simultaneously. All 377 tests passed immediately with zero code changes required.

**Why this order:** Jest 30 + canvas 3 must land before anything else because jest-environment-jsdom@30 bundles its own jsdom@26 which requires canvas@^3 as a peer dep. If canvas isn't bumped first, the peer dep tree is irreconcilable.

**Risks that didn't materialize:**
- `createCanvas()` zero-arg still works in canvas 3 (defaults to 300×150 per spec)
- `@types/jest` 26→30 jump was silent (d3fc tests don't use advanced type features)
- No jest-snapshot format changes affected the test suite

### Step 3 (#16 Phase 2): Example test infrastructure — Partial, scoped blast radius

**What the plan said:** Rewrite `toMatchPerformanceSnapshot.js` (private Jest internals), bump jest-puppeteer to 11, fix config conflict.

**What actually happened:**
- `toMatchPerformanceSnapshot.js` rewrite was NOT needed — `_snapshotData` and `_updateSnapshot` still exist as instance properties on `SnapshotState` in Jest 30. The internals survived.
- jest-puppeteer 11 can't be used — it depends on `jest-environment-node@^29.7.0`. No Jest 30-compatible version exists yet. Filed defnotjec/d3fc#25 to track this.
- Fixed the config conflict: removed `testEnvironment: 'jsdom'` from `examples/jest.config.js` which conflicted with `preset: 'jest-puppeteer'`.

**Why scoped:** The example tests are NOT part of CI (`npm test`). They require a live server + browser (Puppeteer). Fixing the config bug was correct and minimal; blocking on jest-puppeteer compatibility would have stalled the entire bundle for an out-of-scope non-CI test suite.

### Step 4 (#16 Phase 3 / #17): glsl-transpiler 3 + prepr override — Three-layer fix

**What the plan said:** Convert `require` → `import`, add `transformIgnorePatterns`.

**What actually happened — three layers of failure:**

1. **ESM import conversion**: `require('glsl-transpiler')` → `import Compiler from 'glsl-transpiler'` was necessary because glsl-transpiler 3.x is `"type": "module"`.

2. **transformIgnorePatterns alone wasn't enough**: Even with glsl-transpiler excluded from the ignore list, babel-jest processed the file with zero presets. Root cause: `babel.config.js` used `babelrcRoots: ['packages/*']` which scoped all `.babelrc` configs to package directories. Files in `node_modules/` had no Babel config in scope, so babel-jest ran but applied no transformations. Fix: added `presets: ['@babel/preset-env']` at the root level of `babel.config.js`. This is safe because the file's comment says "For Jest" — the build system uses Rollup with its own Babel plugin.

3. **prepr override**: Added `"overrides": { "glsl-transpiler": { "prepr": "^2.0.0" } }` to `package.json`. This forces glsl-transpiler to use prepr 2.x which doesn't depend on the deprecated `expression-eval`.

**Why this was Step 4 and not earlier:** glsl-transpiler is only used by 2 shader test files. Its ESM requirement forces Jest config changes that affect the entire test suite. Those changes (transformIgnorePatterns, babel config) needed to be made on top of a passing test suite so failures could be attributed to the right cause.

### Step 4→5 Forced Merge: The canvas peer dep entanglement

**What the plan said:** Steps 4 and 5 were separate.

**What actually happened:** When running `npm install` after adding glsl-transpiler 3.x, npm failed with an ERESOLVE error: `jsdom@24.1.0` wants `peerOptional canvas@^2.11.2`, but `canvas@3.2.3` was already hoisted. The root jsdom and the hoisted canvas had irreconcilable peer deps.

**Why they couldn't be separated:** The dependency resolver sees the ENTIRE tree simultaneously. With canvas@3 hoisted (required by jest-environment-jsdom@30), jsdom@24 can't install because it declares `peerOptional canvas@^2`. The fix was to bump jsdom at the same time. This is the core entanglement the map predicted — but the plan had them as separate steps because the map anticipated a possible sequential install order. In practice, npm resolves the full tree atomically.

### Step 5 (#23): jsdom 24→29 — Maximum friction

This was the hardest step. Seven compensations were needed, discovered through iterative failure:

**Layer 1 — sendTo→forwardTo (expected):** jsdom 29 renamed `VirtualConsole.sendTo()` to `forwardTo()`. Mechanical rename across 15 `bundleSpec.js` files.

**Layer 2 — Pre-existing TextDecoder bug (unexpected, latent):** `scripts/jest/setup.js` line 10 had `global.TextDecoder = require('util').TextEncoder` — a copy-paste error that has existed since the file was written. With jsdom 24, this was harmless because no code in the test dep chain ever constructed a `TextDecoder`. jsdom 29 loads `undici` for HTTP, and undici does `new TextDecoder('utf-8', { fatal: true }).decode.bind(...)`. Since `TextDecoder` was actually `TextEncoder`, `.decode` was `undefined`, causing `TypeError: Cannot read properties of undefined (reading 'bind')`.

**Why this was hard to find:** The error manifested deep in undici's websocket utils, with no indication that the global `TextDecoder` was the wrong class. The stack trace pointed at undici, not at setup.js. We had to reason backwards: undici works in plain Node → something in Jest's environment is wrong → what touches TextDecoder? → the setup.js polyfill.

**Layer 3 — Web API polyfills (unexpected):** jsdom 29's undici dependency expects `ReadableStream`, `WritableStream`, `TransformStream`, `MessageChannel`, `MessagePort`, `BroadcastChannel`, `Blob`, and `structuredClone` in the global scope. Jest's jsdom environment replaces `global` with jsdom's `window`, which doesn't expose these Node web APIs. Created `scripts/jest/globals.js` as a `setupFiles` entry (runs before test file imports, unlike `setupFilesAfterEnv`).

**Layer 4 — .mjs transform gap (unexpected):** `@csstools/css-tokenizer` ships `.mjs` files. Jest's default transform pattern (`\\.[jt]sx?$`) doesn't match `.mjs`. Added explicit `'\\.mjs$': 'babel-jest'` transform rule.

**Layer 5 — Nested node_modules (unexpected, the big one):** jsdom 29 has its own nested `node_modules/` containing ESM packages (e.g., `node_modules/jsdom/node_modules/parse5/`). The original `transformIgnorePatterns` regex `(?!(list)/)` only matched the FIRST `node_modules/` segment in a path. A nested path like `node_modules/cssstyle/node_modules/@csstools/css-tokenizer/dist/index.mjs` matched `cssstyle` (not in the exclusion list), so the file was ignored.

**The fix:** Changed `(?!(list)/)` to `(?!.*(list)/)`. The `.*` makes the negative lookahead scan the ENTIRE remaining path, matching ESM package names at any nesting depth. This was a one-character fix (`.*`) that resolved all nested node_modules issues.

**Layer 6 — ESM package enumeration:** Used a recursive Node script to walk the full transitive dependency trees of jsdom and glsl-transpiler, identifying all packages with `"type": "module"`. Found 16 ESM packages total. The agent analysis also revealed that some packages (`css-tree`, `tough-cookie`, `lru-cache`, `entities`) have CJS fallbacks via `exports.".".require`, but Jest's module resolver doesn't always use the `require` condition (confirmed with `@bramus/specificity` which has a CJS fallback but still loaded ESM). Kept all ESM packages in the transform list for safety.

**Layer 7 — Two jsdom trees:** jest-environment-jsdom@30 bundles its own jsdom@26 (nested), while the root has jsdom@29 (used by bundleSpec tests directly). Both trees have their own ESM transitive deps. The `(?!.*(list)/)` regex handles both because it matches package names regardless of nesting depth.

### Step 6 (#21): lerna 8→9 — Clean

Bumped lerna, ran `npx lerna repair`. Repair removed the deprecated `lerna` version key from `lerna.json` and added `$schema` for IDE validation. The Nx migration (17→22) reformatted `package.json` to 2-space indent; reverted to 4-space to match upstream convention.

**Why last:** lerna 9 is a build tool — it doesn't affect test code. If anything broke, we wanted it to be the last variable introduced. In practice, it was clean.

**Result:** Vulnerabilities dropped from 67 to 37 (lerna transitive highs resolved).

## Discovered Issues

| # | Title | Filed during | Status |
|---|-------|-------------|--------|
| #25 | jest-puppeteer 10/11 incompatible with Jest 30 | Step 3 | Deferred — waiting on upstream |

## Final Metrics

| Metric | Before | After |
|--------|--------|-------|
| npm deprecation warnings | 3 (abab, domexception, expression-eval) | 0 |
| npm vulnerabilities | 67 | 37 |
| Jest version | 29.7.0 | 30.3.0 |
| jsdom version | 24.1.0 | 29.0.2 |
| canvas version | 2.11.2 | 3.2.3 |
| lerna version | 8.1.2 | 9.0.7 |
| Test suites | 70 pass | 70 pass |
| Tests | 377 pass | 377 pass |
| Build (21 packages) | pass | pass |
| Lint | pass | pass |

## Session State

- Step 1 shipped as d3fc/d3fc#1914 (separate PR)
- Steps 2-6 on branch `fix/jest-30-canvas-3` — all checks green, awaiting PR
- All standalone M-tier items shipped (#18 markdownlint, #19 TypeScript, #20 puppeteer, #22 mockdate)
- T1-T9 trivial tier shipped (#1901-#1909)
- Total upstream PRs to date: 18 (after this PR ships)
