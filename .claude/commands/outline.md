---
name: outline
description: Scope clarification dialogue for a d3fc issue before specification
---

Surface hidden requirements, implicit assumptions, and scope boundaries for a d3fc issue BEFORE specification.

## Arguments

- `$ARGUMENTS` - GitHub issue number (e.g., `42`) or `--update` to refine existing outline

## Workflow Integration

```
Pipeline: /outline → /spec → /implement → /ship
Position: ████░░░░░░░░░░░░ Step 1 of 4
```

| Prerequisite | Required | Check |
|--------------|----------|-------|
| GitHub issue exists | Yes | In `defnotjec/d3fc` |
| Issue has workflow label | Recommended | `wf: direct`, `wf: abbr`, or `wf: full` |

**Next Step**: `/spec {outline}` or `/spec {outline} --full`

## Process

### 1. Fetch Issue Context

```bash
gh --repo defnotjec/d3fc issue view {number} --json title,body,labels,milestone
```

Also check for related upstream issue:
```bash
# Search for related upstream issues
gh --repo d3fc/d3fc issue list --search "{keywords}" --json number,title --limit 5
```

### 2. Scope Clarification Dialogue

Interactive dialogue covering d3fc-specific concerns:

#### a. Scope Boundaries

```
IN SCOPE:
- {what this issue will address}

OUT OF SCOPE:
- {what this issue will NOT address}

UNCERTAINTIES:
- {things that need investigation}
```

**d3fc-specific prompts:**
- Which packages are affected? (of the 21 in the monorepo)
- Which renderers are involved? (SVG, Canvas, WebGL, or all three?)
- Does this touch the decorate pattern? The element lifecycle? chartCartesian?
- Is this a new feature, bug fix, example, or infrastructure change?

#### b. Upstream Context

- Does this relate to an existing upstream issue in `d3fc/d3fc`? If so, link it.
- Has upstream discussed this topic before? (Check git log, issues, PRs)
- Is this something upstream would accept? Or is this fork-only?
- If upstream-bound: what's the minimal change that would be accepted?

#### c. Acceptance Criteria

```
DONE WHEN:
- [ ] {specific, testable criterion}
- [ ] {specific, testable criterion}
```

**d3fc-specific criteria to consider:**
- Build passes (`npm run bundle && npm run bundle-min`)
- Tests pass (`npm test`)
- Lint passes (`npm run lint`)
- Changeset included
- Example has screenshot test (if applicable)
- Visual verification in real browser (if WebGL/Canvas)

#### d. Dependencies

```
BLOCKS: #{issues this blocks}
BLOCKED BY: #{issues blocking this}
RELATED: #{related issues}
```

Check both local (`defnotjec/d3fc`) and upstream (`d3fc/d3fc`) issues.

#### e. Cross-Package Impact

- Does this change ripple across packages?
- Does the `d3fc` meta-package need updates?
- Are there internal dependencies that need coordinated changes?

#### f. Renderer Awareness

- SVG-only change? Canvas-only? WebGL-only?
- Does this need to work across all renderers?
- Axes are always SVG regardless of plot area renderer — is that relevant?

#### g. Risks & Complexity

- What could block implementation?
- Are there known quirks in this area? (e.g., #41 axis label positioning gap)
- Is this a breaking change? If so, semver impact?

### 3. Workflow Label Assessment

Based on the dialogue, recommend a workflow variant:

| Variant | When |
|---------|------|
| `wf: direct` | Single obvious change — typo, version bump, trivial config |
| `wf: abbr` | Most d3fc work — bug fix, example, single-package change |
| `wf: full` | Epic, cross-package change, breaking change, API addition |

If the issue doesn't have a workflow label, suggest one.

### 4. Write OUTLINE Artifact

Write dual-layer artifacts:
1. `agents/outlines/OUTLINE-{issue}.json` — structured scope data
2. `agents/outlines/OUTLINE-{issue}.md` — human-readable summary

### 5. Milestone Verification

Verify the issue is assigned to a categorical milestone:

| Milestone | Scope |
|-----------|-------|
| Axis Rendering | Axis/tick rendering bugs and improvements |
| WebGL | WebGL-specific rendering and interaction |
| Build Infrastructure | CI, bundling, dependency modernization |
| Workflow Pipeline | Local commands, agent definitions, contribution workflow |

If the issue has no milestone, prompt to assign one.

## Resume (`--update`)

`/outline 42 --update` loads the existing OUTLINE and re-enters the dialogue to refine incomplete sections. Useful when:
- New information emerged during spec or implementation
- Scope expanded or narrowed
- Dependencies changed

## Output

```
═══════════════════════════════════════════════════════════════
OUTLINE COMPLETE
═══════════════════════════════════════════════════════════════

Issue: #{number} — {title}
Outline: agents/outlines/OUTLINE-{number}.json
Packages: {affected packages}
Renderers: {SVG/Canvas/WebGL}
Workflow: {wf: direct / wf: abbr / wf: full}
Upstream related: {d3fc/d3fc#{number} or "none"}

Next: /spec {number}
═══════════════════════════════════════════════════════════════
```
