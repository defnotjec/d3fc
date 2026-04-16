---
name: spec
description: Run specification team to produce PLAN for a d3fc fix or feature
---

Run the specification team to produce a PLAN artifact for a d3fc issue.

## Arguments

- `$ARGUMENTS` - OUTLINE file path or issue number

Options:
- `--abbr` — Abbreviated mode (default): ARCHITECT + TEST-STRATEGIST only, produces PLAN only
- `--full` — Full mode: all 4 agents including SCOPE-ANALYST and QUALITY-GATE
- `--resume` — Resume from last completed gate

## Workflow Integration

```
Pipeline: /outline → /spec → /implement → /ship
Position: ████████░░░░░░░░ Step 2 of 4
```

| Prerequisite | Required | Check |
|--------------|----------|-------|
| OUTLINE artifact | Yes | `agents/outlines/OUTLINE-{issue}.json` exists |
| Issue exists | Yes | GitHub issue in `defnotjec/d3fc` |

**Previous Step**: `/outline {issue}`
**Next Step**: `/implement {plan}`

## Modes

### Abbreviated Mode (default for d3fc)

```bash
/spec 42              # Default: --abbr
/spec OUTLINE-42.json
```

**Agents**: ARCHITECT + TEST-STRATEGIST
**Output**: PLAN-{issue}.json + .md (with embedded test strategy)
**Use for**: Most d3fc work — bug fixes, examples, single-package changes

### Full Mode

```bash
/spec 42 --full
```

**Agents**: SCOPE-ANALYST + ARCHITECT + TEST-STRATEGIST + QUALITY-GATE
**Output**: SCOPE + PLAN + VALIDATION + ASSESSMENT (JSON + MD each)
**Use for**: Epics, cross-package changes, breaking changes, API additions

## Agent Team

| Agent | Definition | Mode | Role |
|-------|-----------|------|------|
| SCOPE-ANALYST | `agents/scope-analyst.md` | Full only | Upstream acceptance, API surface, cross-package effects |
| ARCHITECT | `agents/architect.md` | Both | Codebase analysis, plan synthesis (leads team) |
| TEST-STRATEGIST | `agents/test-strategist.md` | Both | Jest/Puppeteer test strategy, visual testing |
| QUALITY-GATE | `agents/quality-gate.md` | Full only | Upstream merge readiness, convention adherence |

## Process

### Phase A: Parallel Research

Launch agents in parallel:

**Abbreviated mode**: ARCHITECT + TEST-STRATEGIST research simultaneously
**Full mode**: All 4 agents research simultaneously

Each agent analyzes the d3fc codebase at `upstream/master` HEAD:
- SCOPE-ANALYST: upstream acceptance, API surface, cross-package effects
- ARCHITECT: codebase impact, d3fc patterns, dependency mapping
- TEST-STRATEGIST: test infrastructure, coverage gaps, visual testing needs
- QUALITY-GATE: (waits for Phase B)

### GATE A: Approve Research

Present research findings to user:

```
═══════════════════════════════════════════════════════════════
GATE A: Research Findings
═══════════════════════════════════════════════════════════════

ARCHITECT:
  Files affected: {list}
  Packages: {list}
  Patterns: {d3fc patterns found}

TEST-STRATEGIST:
  Existing tests: {count}
  New tests needed: {list}
  Visual verification: {plan}

{Full mode only:}
SCOPE-ANALYST:
  Upstream acceptance: {assessment}
  API surface impact: {assessment}
  Cross-package effects: {list}

═══════════════════════════════════════════════════════════════
Approve research to proceed to plan synthesis? (yes/no/adjust)
═══════════════════════════════════════════════════════════════
```

### Phase B: Plan Synthesis

ARCHITECT synthesizes research into PLAN:
- Implementation phases with steps
- Commit strategy (clean, conventional, atomic)
- Cross-package coordination

**Full mode**: QUALITY-GATE runs adversarial review:
- YAGNI analysis (is this minimal enough for upstream?)
- Convention adherence (does this follow d3fc patterns?)
- Upstream merge readiness (would they accept this PR?)
- Git history quality (clean commit sequence?)
- Concern dialogue with ARCHITECT (max 3 rounds per concern)

### GATE B: Approve Plan

Present plan to user:

```
═══════════════════════════════════════════════════════════════
GATE B: Plan Review
═══════════════════════════════════════════════════════════════

PLAN: {phase count} phases, {step count} steps
Commits: {planned commit sequence}
Packages: {affected packages}

{Full mode only:}
QUALITY-GATE verdict: {APPROVED / APPROVED_WITH_NOTES / REVISION_REQUIRED}
Concerns: {resolved count} / {total count}
Unresolved: {list if any}

═══════════════════════════════════════════════════════════════
Approve plan to proceed? (yes/no/revise)
═══════════════════════════════════════════════════════════════
```

### Phase C: Write Artifacts

**Abbreviated mode**:
- `agents/plans/PLAN-{issue}.json`
- `agents/plans/PLAN-{issue}.md`

**Full mode** (additional):
- `agents/scopes/SCOPE-{issue}.json` + `.md`
- `agents/validations/VALIDATION-{issue}.json` + `.md`
- `agents/assessments/ASSESSMENT-{issue}.json` + `.md`

## Resume

`--resume` finds the last completed gate and continues from there:
- If Gate A not passed → re-run Phase A
- If Gate A passed but Gate B not → run Phase B
- If Gate B passed → run Phase C

## d3fc-Specific Guidance

- Default to `--abbr` — full mode is reserved for epics and breaking changes
- ARCHITECT should analyze from `upstream/master` HEAD
- Plans should result in upstream-acceptable PRs (minimal, conventional commits)
- Test strategy should account for d3fc's build-before-test requirement
- Cross-package changes need explicit dependency ordering in the plan
