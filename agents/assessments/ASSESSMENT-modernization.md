# d3fc Dependency Modernization Audit

> Generated: 2026-04-15
> Repo: d3fc/d3fc (via defnotjec/d3fc fork)
> Node: 20.15.0 (pinned in CI)
> Related upstream issues: d3fc/d3fc#1814 ("Modernise libraries"), d3fc/d3fc#1773 ("Is it compatible with d3.js v7.6.1?")

---

## Current State

### Deprecation Warnings (3)

| Warning | Package | Source | Root Cause |
|---------|---------|--------|------------|
| `abab@2.0.6` — use native `atob()`/`btoa()` | abab | Transitive: `jest-environment-jsdom@29` → internal `jsdom@20.0.3` → abab | jest-environment-jsdom@29 bundles old jsdom@20 |
| `domexception@4.0.0` — use native `DOMException` | domexception | Transitive: same chain as abab | Same — fixed in jsdom ≥ 22 |
| `expression-eval@5.0.1` — no longer maintained | expression-eval | Transitive: `glsl-transpiler@1.8.6` → `prepr@1.2.5` → expression-eval | Requires glsl-transpiler upgrade to v3 (major) |

### Vulnerabilities (72)

| Severity | Count | Key Sources |
|----------|-------|-------------|
| Critical | 4 | puppeteer, lerna transitive |
| High | 46 | d3 (d3-interpolate, d3-color), jsdom, puppeteer, lerna, rollup, markdownlint |
| Moderate | 16 | commitizen (lodash), markdownlint (markdown-it) |
| Low | 6 | jest-environment-jsdom (jsdom) |

**Direct vulnerable devDependencies:**

| Package | Severity | Via |
|---------|----------|-----|
| d3 | high | d3-brush, d3-color, d3-interpolate, d3-scale, d3-scale-chromatic, d3-transition, d3-zoom |
| jsdom | high | canvas, http-proxy-agent |
| puppeteer | high | @puppeteer/browsers, puppeteer-core |
| lerna | high | @lerna/create, @npmcli/run-script, tar, minimatch, js-yaml |
| markdownlint-cli | high | markdownlint, minimatch |
| @rollup/plugin-terser | high | serialize-javascript |
| canvas | high | @mapbox/node-pre-gyp |
| @changesets/cli | high | external-editor, spawndamnit |
| rollup | high | rollup (self — prototype pollution in v2) |
| commitizen | moderate | inquirer, lodash |
| jest-environment-jsdom | low | jsdom (internal) |

### Dead Dependencies

| Package | Version | Status |
|---------|---------|--------|
| `babelrc-rollup` | ^3.0.0 | Listed in devDependencies but NOT imported anywhere. Fully dead. Safe to remove. |

---

## Epic 1: Build Infrastructure Modernization

> Scope: All tiers EXCEPT D3 v6→v7 upgrade
> Goal: Eliminate deprecation warnings, reduce vulnerability count, modernize tooling

### Tier: Trivial (zero risk, isolated PRs)

| # | Task | Current → Target | Risk | Notes |
|---|------|-----------------|------|-------|
| T1 | Remove dead `babelrc-rollup` | ^3.0.0 → remove | None | Not imported anywhere |
| T2 | Bump `@babel/core` | 7.24.7 → ^7.29 | None | Semver minor within ^7 |
| T3 | Bump `@babel/preset-env` | 7.22.5 → ^7.29 | None | Semver minor within ^7 |
| T4 | Bump `@babel/register` | 7.22.5 → ^7.28 | None | Semver minor within ^7 |
| T5 | Bump `@changesets/cli` | 2.27.6 → ^2.30 | None | Semver minor within ^2 |
| T6 | Bump `commitizen` | 4.3.0 → 4.3.1 | None | Patch |
| T7 | Bump `jest-image-snapshot` | 6.4.0 → 6.5.2 | None | Patch |
| T8 | Bump `eslint-plugin-import` | 2.27.5 → ^2.32 | None | Semver minor within ^2 |
| T9 | Bump `@commitlint/cli` + deps | 19.3.0 → ^19.8 | None | Semver minor within ^19 |

### Tier: Medium (scoped breaking changes)

| # | Task | Current → Target | Risk | Notes |
|---|------|-----------------|------|-------|
| M1 | Upgrade jsdom | 24.1.0 → ^29 | Medium | Stricter HTML parsing, URL changes. Node 18+ required (satisfied). Only affects direct jsdom usage, NOT jest tests. |
| M2 | Upgrade Jest + jest-environment-jsdom | 29.7.0 → 30.x | Medium | **Eliminates abab + domexception warnings.** jest-environment-jsdom@30 bundles jsdom ≥ 25 internally. Jest 30 has config migration. |
| M3 | Upgrade markdownlint + markdownlint-cli | 0.16/0.17 → 0.40/0.48 | Medium | New rules, config format changes. May require `.markdownlint.json` updates. |
| M4 | Upgrade TypeScript | 4.9.5 → ^5.x | Medium | Check `tsd` type test compatibility. TS5 is largely backwards-compatible. |
| M5 | Upgrade canvas | 2.11.2 → ^3 | Medium | Native module rebuild. May need node-gyp changes. |
| M6 | Upgrade puppeteer | 22.11.2 → ^24 | Medium | **Reduces 46+ high vulns.** API changes in browser launch config. Affects screenshot tests. |
| M7 | Upgrade lerna | 8.1.2 → ^9 | Medium | Nx integration changes. Affects `npm run bundle` pipeline. |
| M8 | Upgrade glsl-transpiler | 1.8.6 → ^3 | Medium | **Eliminates expression-eval warning.** Major version — API may have changed. |
| M9 | Upgrade mockdate | 2.0.5 → ^3 | Low | Used in example test harness. Check API compatibility. |

### Tier: Large (cascading ecosystem changes)

| # | Task | Current → Target | Risk | Notes |
|---|------|-----------------|------|-------|
| L1 | Rollup 2→4 migration | 2.79.1 → ^4.60 | High | **Eliminates rollup self-vulnerability.** Requires simultaneous upgrade of @rollup/plugin-babel (6→7), @rollup/plugin-node-resolve (15→16), @rollup/plugin-terser (0.4→1). Two rollup configs to update. ESM-first config format. |
| L2 | ESLint 7→9 + Prettier 1→3 | 7.32/1.19 → 10.x/3.x | High | Requires flat config migration. Simultaneously upgrade: eslint-config-standard (14→17), eslint-config-semistandard (15→17), eslint-config-prettier (6→10), eslint-plugin-prettier (3→5), eslint-plugin-promise (4→7), replace eslint-plugin-standard (deprecated) + eslint-plugin-node (deprecated) with eslint-plugin-n, upgrade @typescript-eslint/* (4→8). **All tightly coupled — must be done as one unit.** |
| L3 | chalk upgrade | 2.4.2 → ^5 | Low-Medium | chalk 5 is ESM-only. Need to verify it's only used in scripts that can be ESM or find CJS-compatible alternative. |

### Not Directly Fixable

| Issue | Reason |
|-------|--------|
| d3-color, d3-interpolate vulns | Fixed in D3 v7 — deferred to Epic 2 |
| @changesets/cli → external-editor → tmp vuln | Requires upstream changesets fix |

---

## Epic 2: D3 v6 → v7 Upgrade (DEFERRED — separate effort)

> Scope: Upgrade d3 from v6.7.0 to v7.9.0
> Related: d3fc/d3fc#1773

### Why This Is Separate

D3 v7 is the single largest upgrade. It affects:
- **All 21 d3fc packages** — each depends on d3 sub-modules (d3-selection, d3-scale, d3-shape, etc.)
- **d3 sub-module major versions**: d3-array 2→3, d3-selection 2→3, d3-scale 3→4, d3-shape 2→3, d3-zoom 2→3, d3-brush 2→3, d3-dispatch 2→3, d3-time 2→3, d3-random 2→3, d3-path 2→3, d3-fetch 2→3, d3-scale-chromatic 2→3
- **ESM-only modules** — D3 v7 sub-packages are ESM-only, which may conflict with Rollup 2's CJS-first config (reinforcing that L1 should be done first)
- **API changes** — d3-array gained new methods, d3-scale changed some defaults, d3-selection TypeScript types changed

### What We Know So Far

| D3 Sub-Package | d3fc Current | Latest | Packages Affected |
|----------------|-------------|--------|-------------------|
| d3-array | 2.12.1 | 3.2.4 | d3fc-extent, d3fc-label-layout, d3fc-sample, d3fc-series, d3fc-technical-indicator |
| d3-selection | 2.0.0 | 3.0.0 | d3fc-axis, d3fc-data-join, d3fc-brush, d3fc-annotation, d3fc-label-layout, d3fc-chart, d3fc-pointer, d3fc-series, d3fc-zoom |
| d3-scale | 3.3.0 | 4.0.2 | d3fc-annotation, d3fc-axis, d3fc-brush, d3fc-label-layout, d3fc-discontinuous-scale, d3fc-chart, d3fc-series, d3fc-webgl |
| d3-shape | 2.1.0 | 3.2.0 | d3fc-axis, d3fc-series, d3fc-webgl |
| d3-brush | 2.1.0 | 3.0.0 | d3fc-brush |
| d3-zoom | 2.0.0 | 3.0.0 | d3fc-zoom |
| d3-dispatch | 2.0.0 | 3.0.1 | d3fc-brush, d3fc-pointer, d3fc-zoom |
| d3-time | 2.1.1 | 3.1.0 | d3fc-discontinuous-scale, d3fc-random-data |
| d3-random | 2.2.2 | 3.0.1 | d3fc-random-data |
| d3-path | 2.0.0 | 3.1.0 | d3fc-shape |
| d3-fetch | 2.0.0 | 3.0.1 | d3fc-financial-feed |
| d3-scale-chromatic | 2.0.0 | 3.1.0 | d3fc-series |

### Gap Assessment

This section to be expanded when Epic 2 is scoped. Key investigation areas:
- Which D3 v7 API changes actually affect d3fc's usage patterns
- Whether Rollup 4 (from L1) is a prerequisite for ESM-only D3 v7 sub-modules
- Package-by-package compatibility testing strategy
- Whether d3fc can support both D3 v6 and v7 via peer dependencies or if it's a hard cutover

### Resolves

- d3fc/d3fc#1773 ("Is it compatible with d3.js v7.6.1?")
- 46 high vulnerabilities from d3-color, d3-interpolate via d3-brush/d3-scale/d3-transition/d3-zoom
- @types/d3 upgrade from 6.7.5 → 7.4.3

---

## Dependency Chain: What Blocks What

```
Epic 1 ordering (recommended):

  T1-T9 (trivial)    ← can all be done immediately, independent PRs
       │
       ▼
  M1-M9 (medium)     ← independent of each other, can be parallelized
       │
       ▼
  L1 (Rollup 2→4)    ← should come before L2 (ESLint changes may touch rollup config)
       │
       ▼
  L2 (ESLint+Prettier) ← touches every file via formatting, do last
       │
       ▼
  L3 (chalk)          ← trivial after ESM is established

Epic 2 (D3 v6→v7):
  Prerequisite: L1 (Rollup 4) should be complete — D3 v7 sub-modules are ESM-only
  Prerequisite: All 377 tests passing on modernized tooling
```

---

## Summary

| Metric | Current | After Epic 1 | After Epic 2 |
|--------|---------|-------------|-------------|
| Deprecation warnings | 3 | 0 | 0 |
| Vulnerabilities | 72 | ~10-15 (d3 vulns remain) | 0 |
| Rollup | 2.79 (EOL) | 4.x | 4.x |
| ESLint | 7.32 | 9.x+ | 9.x+ |
| Prettier | 1.19 | 3.x | 3.x |
| Jest | 29 | 30 | 30 |
| D3 | 6.7 | 6.7 (unchanged) | 7.9 |
| Node | 20.15 | 20.15 | 20.15+ |
