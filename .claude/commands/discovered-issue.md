---
name: discovered-issue
description: Document and track issues found during d3fc development — local-first with optional upstream filing
---

Document and track issues discovered during d3fc development work.

## Arguments

- `$ARGUMENTS` - Optional: `--defer` (create issue, continue work), `--immediate` (address now), `--upstream` (also file in d3fc/d3fc)

## Workflow Integration

```
Pipeline: [any step] → /discovered-issue → [decision point]
Position: Conditional — invoked as needed during any work
```

**Next Step**: Based on decision:
- **DEFER**: Continue current work, return to original pipeline step
- **IMMEDIATE (quick fix)**: Fix → Commit with `Closes #XXX` → Resume
- **IMMEDIATE (complex)**: `/outline` → `/spec` → `/implement` → `/ship`

## Two-Repo Awareness

d3fc work spans two repositories:
- **`defnotjec/d3fc`** (local fork) — where issues are filed first, iterated, and polished
- **`d3fc/d3fc`** (upstream) — nearly inviolable, only polished items go here

**Default**: File locally in `defnotjec/d3fc`. This is always the first step.

**`--upstream` flag**: After local filing and discussion, optionally create a polished version in `d3fc/d3fc`. The upstream issue should be well-written, reference prior art, and include concrete suggestions.

## Process

### 1. Gather Discovery Context

```
Discovery Context:
- What were you working on? (e.g., "Building axis decoration examples")
- How was it discovered? (e.g., "Badge rect positioned incorrectly")
- Error message or symptom? (e.g., "getBBox() doesn't account for dy offset")
```

### 2. Root Cause Analysis

```
Root Cause:
- What is the underlying problem?
- Which package(s) are affected?
- Is this a d3fc bug, a gap, or a design decision?
- Does this affect SVG, Canvas, WebGL, or all renderers?
```

### 3. Discussion & Reasoning

```
Discussion Summary:
- What options were considered?
- Is this something upstream should fix?
- Is there a workaround?
- Would this require a breaking change?
```

### 4. Resolution Plan

```
Resolution:
- Proposed fix approach
- Files affected
- Is this a patch, minor, or major change?
- Should this be filed upstream?
```

### 5. Fetch Milestones

```bash
gh api repos/defnotjec/d3fc/milestones --jq '.[] | "\(.number) \(.title) — \(.description // "no description")"'
```

Categorical milestones:
| Milestone | Scope |
|-----------|-------|
| Axis Rendering | Axis/tick rendering bugs and improvements |
| WebGL | WebGL-specific rendering and interaction |
| Build Infrastructure | CI, bundling, dependency modernization |
| Workflow Pipeline | Local commands, agent definitions, contribution workflow |

### 6. Create Local Issue

Always file in `defnotjec/d3fc` first:

```bash
gh --repo defnotjec/d3fc issue create \
  --title "Brief descriptive title" \
  --body "$(cat <<'EOF'
## Summary

{Brief description of the issue}

## Discovery Context

**Discovered during**: {Current work context}
**Manifestation**: {How the issue presented itself}

## Root Cause Analysis

{Detailed explanation}

## Resolution

### Proposed Fix

{Description}

### Files Affected

- `path/to/file` — {what changes}

## Issue Relationships

**Blocks**: {#numbers or "None"}
**Blocked by**: {#numbers or "None"}
**Related**: {#numbers or "None"}
EOF
)" \
  --label "is: bug" \
  --label "pri: medium" \
  --label "effort: moderate" \
  --label "flow: non-blocking" \
  --milestone "Axis Rendering"
```

### 7. Upstream Filing (optional, `--upstream`)

If `--upstream` is passed OR user decides to file upstream after local discussion:

1. **Polish the issue**: Remove internal references, clean up language
2. **Add context**: Reference upstream code, prior art, related issues
3. **Include concrete suggestions**: Code examples, proposed API changes
4. **File in `d3fc/d3fc`**:
   ```bash
   gh --repo d3fc/d3fc issue create --title "..." --body "..."
   ```
5. **Cross-reference**: Update local issue with upstream issue number

**Quality bar for upstream**: Would a d3fc maintainer find this useful, clear, and actionable? If not, iterate locally first.

### 8. Path Decision

#### IMMEDIATE Path
1. Create local issue
2. Pause current work
3. Implement fix (follow d3fc conventions)
4. Commit with `Closes #XXX`
5. Resume original work

#### DEFER Path
1. Create local issue
2. Continue current work
3. Address deferred issue in a future sprint

## Output

```
═══════════════════════════════════════════════════════════════
ISSUE DISCOVERED — {IMMEDIATE / DEFERRED}
═══════════════════════════════════════════════════════════════

Local:    defnotjec/d3fc#{number} — {title}
{If upstream:}
Upstream: d3fc/d3fc#{number} — {title}

Milestone: {milestone}
Priority: {immediate/deferred}

{If deferred:}
Continuing with: {current work description}
═══════════════════════════════════════════════════════════════
```

## Label Taxonomy

| Prefix | Labels |
|--------|--------|
| `is:` | `is: bug`, `is: feature`, `is: enhancement`, `is: chore`, `is: tooling` |
| `pri:` | `pri: high`, `pri: medium`, `pri: low` |
| `effort:` | `effort: simple`, `effort: moderate`, `effort: complex`, `effort: epic` |
| `flow:` | `flow: blocking`, `flow: non-blocking` |
| `status:` | `status: ready`, `status: internal`, `status: defer` |

Constraint: `is: tooling` requires `status: internal`
