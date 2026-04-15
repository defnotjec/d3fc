---
issue: 1
title: "Axis sets invalid SVG visibility=\"false\" on visible tick elements"
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

# Issue Outline: #1 - Axis sets invalid SVG visibility="false" on visible tick elements

> Generated: 2026-04-15
> Issue: https://github.com/defnotjec/d3fc/issues/1
> Workflow: wf: abbr

## Issue Summary

Two lines in `axisBase.js` use `&&` which returns `false` (not `null`) for visible ticks, causing D3 to set `visibility="false"` — an invalid CSS value that produces console parse errors on every re-render.

## Scope Boundaries

### In Scope
- Fix visibility attribute assignment in `axisBase.js` lines 124 and 130
- Replace `&&` short-circuit with ternary returning `null` for non-hidden case

### Out of Scope
- Refactoring other axis code
- Adding tests beyond verifying the fix
- Changing any other packages

### Uncertainties
- None — root cause and fix are fully understood

## Acceptance Criteria

### From Issue
- `tickPaths` visibility returns `'hidden'` when `hidden=true`, `null` when `hidden=false`
- `labelOffsets` visibility returns `'hidden'` when `hidden=true`, `null` when `hidden=false`
- No `visibility="false"` attributes appear in rendered SVG

### Definition of Done
- All 377 existing tests pass
- Build (`bundle` + `bundle-min`) succeeds
- Changeset added

## Dependencies

### Blocked By
- None

### Blocks
- None

## Assumptions

### Implicit Assumptions
- D3 `.attr()` removes attribute when value is `null` (documented D3 behavior)
- No downstream code relies on `visibility="false"` being set

### Assumptions Needing Validation
- None — both are well-documented behaviors

## Risk Assessment

### Identified Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Existing tests may not cover visibility attribute | Low | Low | Two-character fix, behavior well-understood |

### Effort Confidence
- **Level**: High
- **Rationale**: Known fix, verified in downstream project, trivial change

## Backend Deployment
- **Required**: No
- **Indicators**: N/A
- **Affected Services**: N/A

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
