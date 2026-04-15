---
issue: 2
title: "Add WebGL bar interaction example (click/hover with scale inversion)"
workflow: "wf: abbr"
current_phase: outline
next_action: "/spec --abbr"
last_updated: "2026-04-15T00:00:00Z"
artifacts:
  scope: null
  plan: null
  validation: null
  assessment: null
  compliance: null
---

# Issue Outline: #2 - Add WebGL bar interaction example

> Generated: 2026-04-15
> Issue: https://github.com/defnotjec/d3fc/issues/2
> Workflow: wf: abbr

## Issue Summary

Add a well-documented example demonstrating scale-inversion-based click/hover interaction on `seriesWebglBar`. Addresses upstream d3fc/d3fc#1803.

## Scope Boundaries

### In Scope
- Scale-inversion hover detection using `xScale.invert()`
- Visual hover feedback via fill color change in `decorate` callback
- Click handler that displays clicked bar's index and value
- HTML tooltip overlay positioned near hovered bar
- 200 bars via `randomGeometricBrownianMotion`
- Code comments explaining the technique
- CodePen standalone version
- Comment on d3fc/d3fc#1803 with explanation and CodePen link

### Out of Scope
- SVG overlay approach
- Color picking / GPU-based hit testing
- Multi-series interaction
- Zoom or pan interaction
- Touch events / mobile support
- Performance benchmarking

### Uncertainties
- None significant — approach is validated by existing patterns in the codebase

## Acceptance Criteria

- Hovering a bar highlights it with a distinct fill color
- Tooltip shows bar index and value near cursor
- Clicking a bar logs/displays its data
- Mouse leave clears highlight and tooltip
- Example follows d3fc conventions exactly
- CodePen version works standalone with unpkg CDN imports
- All 377 existing d3fc tests continue to pass
- Screenshot test produces consistent snapshot

## Dependencies

### Blocked By
- None

### Blocks
- None

## Assumptions

- Bars have uniform width (linear x scale)
- `xScale.invert()` provides sufficient precision for bar identification
- `webglFillColor` utility supports per-bar coloring via `decorate`
- d3fc example test harness works for new examples

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| WebGL decorate may not support per-bar color | Low | Medium | webglFillColor exists in other examples |
| Screenshot test flaky with hover state | Medium | Low | Screenshot captures default state |
| Tooltip positioning with d3fc-canvas | Medium | Low | Absolute positioning relative to container |

### Effort Confidence
- **Level**: High
- **Rationale**: Core technique (scale inversion) proven in `interactive-small-multiples`, webglFillColor used in other examples

## Readiness Assessment

**Ready for /spec --abbr?**

- [x] Scope boundaries are clear
- [x] Acceptance criteria defined
- [x] Dependencies identified
- [x] Assumptions validated or flagged
- [x] Risks documented

**Recommendation**: READY

## Workflow Tracker

**Label**: wf: abbr

- [x] OUTLINE (this document) — `/outline`
- [ ] PLAN — `/spec --abbr`
- [ ] Code + commits — `/implement`
- [ ] PR + Review — `/ship`
