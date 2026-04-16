# Plan: #45 — Crosshair centered on band scale bar series

**Sprint**: Annotations & Interaction
**Issues**: #45 (simple), #46 (stacked), #47 (WebGL overlay)
**Upstream**: d3fc/d3fc#1764

---

## Phase 1: Simple bar + centered crosshair (#45)

**Branch**: `fix/crosshair-band-center-example`

Create `examples/crosshair-band-center/` — SVG bar chart with `scaleBand` and centered crosshair.

**Pattern**: `chartCartesian` + `seriesSvgBar` + `annotationSvgCrosshair`

Key technique:
```js
// scaleBand returns left edge — add bandwidth/2 to center
var crosshair = fc.annotationSvgCrosshair()
    .x(function(d) { return xScale(d.x) + xScale.bandwidth() / 2; })
    .y(function(d) { return yScale(d.y); });
```

Snap logic: on pointer move, find nearest band category from mouse x position and look up the corresponding data point.

**Files**: index.html, index.js, README.md, __tests__/index.js, changeset

---

## Phase 2: Stacked bar + centered crosshair (#46)

**Branch**: `fix/crosshair-band-center-stacked-example`

Create `examples/crosshair-band-center-stacked/` — stacked SVG bars with centered crosshair. Uses `d3.stack()` + `seriesSvgRepeat(seriesSvgBar)`. Same bandwidth/2 centering.

This matches the upstream user's exact scenario from #1764.

**Files**: index.html, index.js, README.md, __tests__/index.js, changeset

---

## Phase 3: WebGL bar + SVG crosshair overlay (#47)

**Branch**: `fix/crosshair-band-center-webgl-example`

Create `examples/crosshair-band-center-webgl/` — WebGL bars with SVG crosshair overlay. Uses `chartCartesian` with both `.webglPlotArea(bars)` and `.svgPlotArea(crosshair)`.

Code comments in index.js must document:
- d3fc crosshairs exist for SVG and Canvas only — no WebGL implementation
- This is by design: crosshairs are interactive/DOM-based, only one instance, no GPU benefit
- SVG provides free label rendering, CSS styling, and DOM events
- chartCartesian supports simultaneous WebGL + SVG plot areas for exactly this pattern

**Files**: index.html, index.js, README.md, __tests__/index.js, changeset

---

## Phase 4: CodePen for upstream engagement

Create a single CodePen using the **stacked bar** pattern (matches #1764 user scenario). Use CodePen prefill API served locally. Post as comment on d3fc/d3fc#1764.

---

## Phase 5: Sprint test

1. Merge all three fix branches into `sprint/crosshair-band-center`
2. `npm run bundle && npx serve . -p 8080`
3. Browser verify all three examples — crosshair must center on bars, not snap to left edge

---

## Test Strategy

- **Screenshot tests**: Standard `__tests__/index.js` per example (captures initial render, no crosshair visible)
- **Browser verification**: Required before shipping — verify crosshair follows mouse and centers on bars
- **Determinism**: seedrandom + mockdate for data; crosshair position is interactive (not in screenshot)

## Commit Strategy

- One commit per phase (feat commit + changeset)
- Author: `defnotjec <defnotjec@users.noreply.github.com>`
- No AI attribution
- Conventional commit format

## Next Step

`/implement --worktree` for each phase
