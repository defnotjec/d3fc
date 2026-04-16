# Outline: #45 — Crosshair centered on band scale bar series

**Sprint**: Annotations & Interaction
**Workflow**: `wf: abbr`
**Upstream**: d3fc/d3fc#1764
**Related**: #46 (stacked), #47 (WebGL overlay)

---

## Scope

### In scope
- **CodePen**: stacked bar crosshair centering (matches upstream user's scenario)
- **Repo example** #45: `examples/crosshair-band-center/` — SVG simple bars + crosshair
- **Repo example** #46: `examples/crosshair-band-center-stacked/` — SVG stacked bars + crosshair
- **Repo example** #47: `examples/crosshair-band-center-webgl/` — WebGL bars + SVG crosshair overlay
- Code comments documenting WebGL overlay pattern rationale
- Upstream comment on d3fc/d3fc#1764 with CodePen

### Out of scope
- d3fc source changes (xyBase.js, crosshair.js)
- WebGL-native crosshair (not needed — SVG overlay is correct pattern)
- Canvas crosshair variant (same `.x()` pattern, SVG examples sufficient)

## Key Technique

`d3.scaleBand(value)` returns the left edge of the band. Center the crosshair by adding half the bandwidth:

```js
crosshair.x(function(d) {
    return xScale(d.x) + xScale.bandwidth() / 2;
});
```

## Acceptance Criteria

- [ ] Crosshair centers on bar for all three examples
- [ ] CodePen demonstrates stacked bar centering
- [ ] WebGL example uses SVG overlay with code comments explaining why
- [ ] d3fc conventions: 30 bars, bandwidth 10, seedrandom, mockdate
- [ ] Changeset per PR, screenshot tests included
- [ ] Browser verified before shipping

## WebGL Overlay Documentation (in code comments)

The WebGL example must document in its `index.js` comments:
- d3fc crosshairs exist for SVG and Canvas, not WebGL
- This is by design: crosshairs are interactive/DOM-based, only ever one instance
- No GPU performance benefit for a single overlay element
- `chartCartesian` supports `.webglPlotArea()` + `.svgPlotArea()` simultaneously
- The SVG layer renders the crosshair on top of the WebGL data layer

## Next Step

`/spec 45` — ARCHITECT + TEST-STRATEGIST produce PLAN
