---
milestone: WebGL
sprint: webgl-opacity
repo: defnotjec/d3fc
created: 2026-04-15
---

# Sprint Progress: WebGL Opacity Helper

> Milestone: [WebGL](https://github.com/defnotjec/d3fc/milestone/2)
> Issues: 1 open | 0 closed
> Effort: 3 points (1 moderate)

## Issues

| # | Title | Effort | Priority | Workflow | Status |
|---|-------|--------|----------|----------|--------|
| #4 | Add webglOpacity() style helper | moderate | low | wf: abbr | Pending |

## Pipeline Progress

### #4 — webglOpacity() style helper (wf: abbr)

| Phase | Status | Artifact | Completed |
|-------|--------|----------|-----------|
| Outline | Complete | OUTLINE-4.json + .md | 2026-04-15 |
| Spec (abbr) | Pending | — | — |
| Implement | Pending | — | — |
| Ship | Pending | — | — |

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| SPRINT-webgl-opacity.json | `agents/sprints/` | Created |
| PROGRESS-webgl-opacity.md | `agents/sprints/` | Created |
| OUTLINE-4.json | `agents/outlines/` | Created |
| OUTLINE-4.md | `agents/outlines/` | Created |

## Branch Topology

```
upstream/master (must include d3fc/d3fc#1899 — blending fix)
    └── fix/webgl-opacity-helper  →  PR to d3fc/d3fc
```

## Dependencies

- Depends on d3fc/d3fc#1899 (blending must be enabled for opacity to have visible effect)
- If #1899 is not yet merged, this PR can still be submitted but should note the dependency
