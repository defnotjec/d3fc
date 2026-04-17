# Sprint: Annotations & Interaction

## Issues

| # | Title | Workflow | Status |
|---|-------|----------|--------|
| #45 | Crosshair centered on band scale bar series (simple) | `wf: abbr` | Implement ✅ |
| #46 | Crosshair centered on stacked band scale bars | `wf: abbr` | Implement ✅ |
| #47 | Crosshair on WebGL bars via SVG overlay | `wf: abbr` | Implement ✅ |

## Progress

- [ ] #45: ~~Outline~~ → ~~Spec~~ → ~~Implement~~ → Test → Ship
- [ ] #46: ~~Outline~~ → ~~Spec~~ → ~~Implement~~ → Test → Ship
- [ ] #47: ~~Outline~~ → ~~Spec~~ → ~~Implement~~ → Test → Ship

## CodePen

https://codepen.io/defnotjec/pen/zxKbOxE — stacked bars with centered crosshair (matches d3fc/d3fc#1764 scenario)

## Sprint Notes

- All three share identical crosshair centering technique (`bandwidth() / 2`)
- #47 uses scaleLinear (not scaleBand) because WebGL bar series excludes `.align()`
- #47 documents why WebGL crosshairs use SVG overlay (in code comments + README)
- Browser tested: bars render, crosshair x-snaps to center, y tracks freely
- Upstream engagement: post CodePen + reference all three PRs on d3fc/d3fc#1764
