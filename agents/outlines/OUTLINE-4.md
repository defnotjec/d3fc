---
issue: 4
title: "Add webglOpacity() style helper for WebGL series"
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

# Issue Outline: #4 - Add webglOpacity() style helper

> Generated: 2026-04-15
> Issue: https://github.com/defnotjec/d3fc/issues/4
> Workflow: wf: abbr

## Issue Summary

Add a `webglOpacity()` style helper that gives WebGL series a clean opacity API independent of fill/stroke color alpha, providing parity with how SVG (`selection.attr('opacity')`) and Canvas (`context.globalAlpha`) handle opacity.

## Scope Boundaries

### In Scope
- New `webglOpacity()` style module matching `webglFillColor`/`webglStrokeColor` API
- Support constant value (`.value(0.5)`) and per-datum function (`.value((d, i) => ...)`)
- Fragment shader snippet with opacity that multiplies `gl_FragColor.a`
- Wire through programBuilder and series decorate pattern
- Export from d3fc-webgl package index
- Example in `examples/` demonstrating constant and per-datum opacity
- Standalone PR — include `gl.BLEND` lines if not already present
- Before/after screenshots in PR body

### Out of Scope
- Changing webglFillColor or webglStrokeColor APIs
- Adding opacity to SVG or Canvas series
- Opacity animation or transitions

## Acceptance Criteria

- `fc.webglOpacity()` exported and available on `fc` global
- `.value(0.5)` sets constant 50% opacity for all elements
- `.value((d, i) => ...)` sets per-datum opacity
- Opacity multiplies with fillColor alpha (0.5 * 0.5 = 0.25 effective)
- Example demonstrates both constant and per-datum usage
- All 377 existing tests pass
- Build and lint pass
- Before/after screenshots in PR

## Dependencies

- d3fc/d3fc#1899 (blending fix) — included as idempotent lines

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Per-datum opacity may need float attribute not vec4 | Medium | Medium | Research attributeProjector |
| Shader snippet insertion order | Low | Medium | Append after fillColor/strokeColor |

## Readiness Assessment

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
