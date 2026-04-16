# Sprint: Annotations & Interaction

## Issues

| # | Title | Workflow | Status |
|---|-------|----------|--------|
| #45 | Crosshair centered on band scale bar series (simple) | `wf: abbr` | Outline |
| #46 | Crosshair centered on stacked band scale bars | `wf: abbr` | Outline |
| #47 | Crosshair on WebGL bars via SVG overlay | `wf: abbr` | Outline |

## Progress

- [ ] #45: Outline → Spec → Implement → Test → Ship
- [ ] #46: Outline → Spec → Implement → Test → Ship
- [ ] #47: Outline → Spec → Implement → Test → Ship

## Sprint Notes

- All three share identical crosshair centering technique (`bandwidth() / 2`)
- CodePen for #1764 response uses stacked bars (matches user's scenario)
- #47 documents why WebGL crosshairs use SVG overlay (in code comments + README)
- Batch browser test all three before shipping
- Upstream engagement: post CodePen on d3fc/d3fc#1764, reference all three PRs
