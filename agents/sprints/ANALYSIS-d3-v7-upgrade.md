---
epic: 6
repo: defnotjec/d3fc
created: 2026-04-16
status: analysis-complete
---

# D3 v6→v7 Upgrade Analysis

## Overall Assessment: LOW RISK

Of the 15 D3 sub-modules directly imported by d3fc:
- **13 are transparent** (no code changes needed)
- **2 are minor** (small, well-scoped fixes)
- **0 are breaking**

## Current D3 Sub-Module Usage

| d3 Sub-Module | d3fc Package(s) | APIs Used |
|---|---|---|
| **d3-array** | d3fc-sample, d3fc-series, d3fc-extent, d3fc-label-layout, d3fc-technical-indicator | `max`, `range`, `mean`, `extent`, `pairs`, `min`, `ascending`, `scan`, `sum`, `deviation`, `zip` |
| **d3-scale** | d3fc-brush, d3fc-discontinuous-scale, d3fc-series, d3fc-annotation, d3fc-chart, d3fc-webgl | `scaleIdentity`, `scaleLinear`, `scaleTime`, `scaleBand`, `scaleOrdinal`, `scaleLog`, `scalePow` |
| **d3-selection** | d3fc-axis, d3fc-brush, d3fc-series, d3fc-annotation, d3fc-label-layout, d3fc-chart, d3fc-data-join, d3fc-pointer, d3fc-zoom | `select`, `selection`, `pointer` |
| **d3-shape** | d3fc-axis, d3fc-series, d3fc-annotation, d3fc-webgl | `line`, `symbol`, `area`, `symbolCircle`, `symbolSquare`, `symbolTriangle`, `symbolCross`, `symbolDiamond`, `symbolStar`, `symbolWye` |
| **d3-path** | d3fc-shape | `path` |
| **d3-dispatch** | d3fc-brush, d3fc-pointer, d3fc-zoom | `dispatch` |
| **d3-zoom** | d3fc-zoom | `zoom`, `zoomIdentity` |
| **d3-brush** | d3fc-brush | `brushX`, `brushY`, `brush` |
| **d3-time** | d3fc-discontinuous-scale, d3fc-random-data | `timeDay`, `timeSaturday`, `timeMonday`, `utcDay`, `utcSaturday`, `utcMonday`, `timeMillisecond`, `utcMillisecond`, `timeYear` |
| **d3-fetch** | d3fc-financial-feed | `json` |
| **d3-random** | d3fc-random-data | `randomNormal` |
| **d3-dsv** | d3fc-technical-indicator (test only) | `csvParse` |
| **d3-scale-chromatic** | d3fc-series | `interpolateViridis` |
| **d3-ease** | d3fc-data-join (test only) | `easeLinear` |
| **d3-axis** | d3fc-chart (types only) | `Axis` (TypeScript type) |

**Sub-modules NOT directly imported:** d3-color, d3-interpolate, d3-format, d3-force, d3-transition, d3-contour, d3-geo, d3-hierarchy, d3-chord, d3-polygon, d3-quadtree, d3-timer, d3-drag, d3-delaunay.

## Breaking Changes per Sub-Module

| Sub-Module | v6 → v7 | Risk | Notes |
|---|---|---|---|
| d3-array | 2.x → 3.x | **Minor** | `scan` deprecated (use `leastIndex`). `pairs`, `zip` still exported. |
| d3-scale | 3.x → 4.x | **Minor** | `scale.copy` for log() changed from function() to arrow. `scaleMapper.js` toString() pattern is internally consistent but fragile. |
| d3-selection | 2.x → 3.x | Transparent | `select`, `selection`, `pointer` unchanged |
| d3-shape | 2.x → 3.x | Transparent | All 7 symbol types + `area`, `line`, `symbol` preserved |
| d3-path | 2.x → 3.x | Transparent | `path` unchanged |
| d3-dispatch | 2.x → 3.x | Transparent | `dispatch` unchanged |
| d3-zoom | 2.x → 3.x | Transparent | `zoom`, `zoomIdentity` unchanged |
| d3-brush | 2.x → 3.x | Transparent | `brushX`, `brushY`, `brush` unchanged |
| d3-time | 2.x → 3.x | Transparent | All interval functions preserved |
| d3-fetch | 2.x → 3.x | Transparent | `json` unchanged |
| d3-random | 2.x → 3.x | Transparent | `randomNormal` unchanged |
| d3-dsv | 2.x → 3.x | Transparent | `csvParse` unchanged |
| d3-scale-chromatic | 2.x → 3.x | Transparent | `interpolateViridis` unchanged |
| d3-ease | 2.x → 3.x | Transparent | `easeLinear` unchanged |
| d3-axis | 2.x → 3.x | Transparent | Types only |

## ESM Implications

### Rollup: TRANSPARENT
D3 sub-modules are marked `external` in both rollup configs. Rollup never resolves or bundles them — just emits references. ESM-only nature is irrelevant for UMD builds.

### Jest moduleNameMapper: TRANSPARENT
`'^d3-(.*)$': 'd3-$1/dist/d3-$1'` maps to UMD dist files. D3 v7 sub-modules still ship `dist/d3-<name>.js` (UMD, non-minified). Confirmed for d3-array v3 and d3-selection v3.

### CJS: TRANSPARENT
D3 v7 sub-modules set `"type": "module"` with no CJS dist, but the UMD dist files work in CJS contexts. Jest bypasses `main` field via moduleNameMapper.

## Required Code Changes

1. **`packages/d3fc-label-layout/src/removeOverlaps.js`** line 2:
   - `import { scan } from 'd3-array'` → `import { leastIndex } from 'd3-array'`
   - Usage: `array[scan(array, comparator)]` → `array[leastIndex(array, comparator)]`
   - `leastIndex` is a drop-in replacement (same signature, same return value)

2. **`package.json`** root:
   - `"d3": "^6.7.0"` → `"d3": "^7.0.0"`
   - `"@types/d3": "^6.7.5"` → `"@types/d3": "^7.4.3"`

3. **`package-lock.json`** — regenerated

## Maintenance Notes

- `d3fc-webgl/src/scale/scaleMapper.js` uses `scale.copy.toString()` to detect scale types. This is fragile (relies on function stringification) but internally consistent since both reference and input scales come from the same d3-scale version. Not broken by v7 but worth refactoring in a future PR.
- `d3-array` v3 still exports `pairs`, `zip`, `scan` for backward compatibility, but they may be removed in a future major. Consider migrating `pairs` → manual iteration, `zip` → manual, `scan` → `leastIndex` proactively.

## Vulnerabilities Resolved

Upgrading d3 v6→v7 eliminates the remaining ~37 vulnerabilities (mostly from d3-color and d3-interpolate transitive chains).
