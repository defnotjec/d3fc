---
name: ship
description: Run pre-flight checks, review dialogue, and create upstream + fork PRs for a d3fc fix branch
---

Ship a d3fc fix branch as upstream PR(s) with optional review dialogue.

## Arguments

- `$ARGUMENTS` - Optional: `--pr-only` (skip review), `--phase N` (resume review from phase N)

## Workflow Integration

```
Pipeline: /outline → /spec → /implement → /ship
Position: ████████████████ Step 4 of 4
```

| Prerequisite | Required | Check |
|--------------|----------|-------|
| On a `fix/*` branch | Yes | `git branch --show-current` starts with `fix/` |
| Based on `upstream/master` | Yes | `git merge-base --is-ancestor upstream/master HEAD` |
| Implementation complete | Yes | Code exists, changeset added |

## Workflow Variant Behavior

| Variant | Review Dialogue | PR Targets |
|---------|----------------|------------|
| `wf: direct` | **Skip** — pre-flight + GATE + create PRs only | upstream + fork staging |
| `wf: abbr` | **Full** — CHECKER + REVIEWER/CONTEXT dialogue | upstream + fork staging |

## Process

### Phase 0: Branch Guard

1. Verify current branch starts with `fix/`
2. Verify branch is based on `upstream/master`:
   ```bash
   git merge-base --is-ancestor upstream/master HEAD
   ```
3. If either fails, STOP with error.

### Phase 1: Pre-Flight Checks (CHECKER Agent)

Launch CHECKER agent (`agents/checker.md`) to run 4 parallel checks:

1. **Branch ancestry** — clean linear history from `upstream/master`
2. **Contribution compliance** — changeset exists, no forbidden files, conventional commits, correct author
3. **Build & test** — `npm run bundle && npm run bundle-min && npm test && npm run lint` (Node 20.15.0 via fnm)
4. **File risk assessment** — categorize changed files, flag cross-package impact

Display bot summary block. If any **blocker** found, STOP.

```
┌─ CONTRIBUTION CHECKS ─────────────────────────────────────────┐
│ Branch       │ {✓/✗} fix/* from upstream/master               │
│ Changeset    │ {✓/✗} 'd3fc': patch                            │
│ Commits      │ {✓/✗} conventional format                      │
│ Build/Test   │ {✓/✗} {count} passed                           │
│ Lint         │ {✓/✗} clean                                    │
└────────────────────────────────────────────────────────────────┘
```

**For `wf: direct`**: After Phase 1 passes, skip to Phase 4 (GATE).

### Phase 2: Review Dialogue (REVIEWER + CONTEXT Agents)

**Only for `wf: abbr` and above.**

Launch REVIEWER (`agents/reviewer.md`) and CONTEXT (`agents/context.md`) agents.

For each finding, present a DISCUSSION BLOCK:

```
═══════════════════════════════════════════════════════════════
DISCUSSION BLOCK {n} of {total} — F-{id} ({severity})
═══════════════════════════════════════════════════════════════

REVIEWER: {observation — what was found and why it matters for upstream}

CONTEXT: {d3fc conventions, prior art, cross-package effects}

REVIEWER: {synthesized assessment after context}

SUGGESTION: {concrete recommendation}

═══════════════════════════════════════════════════════════════
```

Present findings in severity order: BLOCKER → MUST-FIX → QUESTION → SUGGESTION → NIT → PRAISE

User responds per finding: Accept | Fix | Create follow-up issue | Provide context

### Phase 3: Remediation (Conditional)

If any findings marked "Fix":

1. Apply the fix
2. **Critical**: Do NOT create new "fix review feedback" commits. Instead:
   - If the fix is small: `git commit --amend` to fold into the relevant existing commit
   - If the fix spans commits: interactive rebase to keep history clean
   - Goal: upstream sees a clean commit history, not our review process
3. Re-run affected checks (build/test/lint) to verify
4. Author: `--author="defnotjec <defnotjec@users.noreply.github.com>"`
5. No AI attribution in any commit message

### Phase 4: GATE — Draft PR for Approval

Present the upstream PR draft to the user:

```
═══════════════════════════════════════════════════════════════
GATE: PR DRAFT — Review before push
═══════════════════════════════════════════════════════════════

Target: d3fc/d3fc:master
Branch: {current branch}

Title: {title}

Body:
## Summary
{2-3 bullets}

## Test plan
{checklist}

═══════════════════════════════════════════════════════════════
```

Wait for user approval. Do NOT push or create PRs until approved.

### Phase 5: Push & Create PRs

After GATE approval:

1. **Push** to origin with explicit refspec:
   ```bash
   git push origin {branch}:{branch}
   ```

2. **Create upstream PR** to `d3fc/d3fc:master`:
   ```bash
   gh pr create --repo d3fc/d3fc --head defnotjec:{branch} --base master \
     --title "{title}" --body "{body}"
   ```

3. **Create fork staging PRs** (both v6 and v7):
   ```bash
   gh pr create --repo defnotjec/d3fc --head {branch} --base d3fc-v6-staging \
     --title "{title}" --body "{body}"
   gh pr create --repo defnotjec/d3fc --head {branch} --base d3fc-v7-staging \
     --title "{title}" --body "{body}"
   ```

4. **Close local issue** (if linked):
   ```bash
   gh --repo defnotjec/d3fc issue close {number} --comment "Shipped as d3fc/d3fc#{pr}"
   ```

### Phase 6: Summary

```
═══════════════════════════════════════════════════════════════
SHIP COMPLETE
═══════════════════════════════════════════════════════════════

Upstream PR: d3fc/d3fc#{number} — {title}
Fork PRs:   defnotjec/d3fc#{v6} (v6-staging)
            defnotjec/d3fc#{v7} (v7-staging)
Local issue: #{issue} closed

Review: {n} findings ({n} accepted, {n} fixed, {n} deferred)
═══════════════════════════════════════════════════════════════
```

## Resume (`--phase N`)

Resume from any phase:
- `--phase 1`: Re-run pre-flight checks
- `--phase 2`: Re-do review dialogue
- `--phase 3`: Re-do remediations
- `--phase 4`: Re-present GATE draft
- `--phase 5`: Re-push and create PRs

## Agent Team

| Agent | Definition | Role |
|-------|-----------|------|
| CHECKER | `agents/checker.md` | Pre-flight automated checks |
| REVIEWER | `agents/reviewer.md` | Code review with upstream acceptance focus |
| CONTEXT | `agents/context.md` | d3fc conventions, prior art, cross-package context |

## Batch Mode (Sprint)

When shipping multiple fix branches from a sprint:

1. All fix branches should already be browser-tested via the sprint test branch
2. Run `/ship` on each fix branch sequentially
3. Phase 1 (pre-flight) runs per branch; Phase 2 (review) can reference shared sprint context
4. Each branch gets its own upstream PR + fork staging PRs

## Project Standards

- **Author**: `--author="defnotjec <defnotjec@users.noreply.github.com>"`
- **No AI attribution**: No "Generated with", "Co-Authored-By", or similar
- **Conventional commits**: `type(scope): description`
- **Changeset**: Always include `'d3fc': patch` (or minor/major)
- **Minimal diff**: No unrelated changes in the PR
