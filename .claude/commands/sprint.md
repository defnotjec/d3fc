---
name: sprint
description: Plan and execute a batch of related d3fc fixes with integrated testing
---

Plan and execute a sprint of related d3fc fixes with batch browser testing.

## Arguments

- `$ARGUMENTS` - Milestone name or `--init` for sprint initialization

Options:
- `--init` — Full sprint initialization (fetch issues, create tracking, outline each)
- `--status` — Show current sprint progress
- `--test` — Create sprint test branch, build, and serve for browser testing

## Workflow Integration

```
Pipeline: /sprint --init → [per-issue: /outline → /spec → /implement] → /sprint --test → [per-issue: /ship]
```

## d3fc Sprint Topology

d3fc sprints batch related fix branches for integrated testing before shipping:

```
fix/issue-A ──┐
fix/issue-B ──┤── sprint/{batch-name} (local test branch)
fix/issue-C ──┘         │
                         ├── npm run bundle
                         ├── npx serve . -p 8080
                         └── browser verify all together
                                  │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              /ship issue-A  /ship issue-B  /ship issue-C
              (upstream +    (upstream +    (upstream +
               v6-staging +   v6-staging +   v6-staging +
               v7-staging)    v7-staging)    v7-staging)
```

## Process

### `--init`: Sprint Initialization

#### 1. Fetch Issues

```bash
gh --repo defnotjec/d3fc issue list --milestone "{milestone}" --state open \
  --json number,title,labels --jq '.[] | "\(.number) \(.title)"'
```

#### 2. Audit Workflow Labels

Check each issue for required labels:
- `wf:` label (direct/abbr/full)
- `effort:` label
- `pri:` label

Flag issues missing labels — suggest based on issue description.

#### 3. Create Sprint Tracking

Write sprint artifacts:
- `agents/sprints/SPRINT-{milestone}.json` — machine-readable state
- `agents/sprints/PROGRESS-{milestone}.md` — human-readable tracker

```markdown
# Sprint: {milestone}

## Issues

| # | Title | Workflow | Status |
|---|-------|----------|--------|
| {n} | {title} | {wf: label} | Outline / Spec / Implement / Ship |

## Progress

- [ ] #{n}: Outline → Spec → Implement → Ship
- [ ] #{n}: Outline → Spec → Implement → Ship
```

#### 4. Outline Each Issue

For each issue in the sprint:
1. Run `/outline {number}` (interactive — awaits user approval)
2. Update PROGRESS after each outline completes

#### 5. Create Task List

Generate tasks with dependencies:

```
Per issue (parallel tracks):
  Outline #{n} → Spec #{n} → Implement #{n}

Sprint-level (after all implementations):
  Sprint test → Ship all
```

### `--test`: Sprint Testing

#### 1. Create Sprint Test Branch

```bash
git fetch upstream
git checkout -b sprint/{batch-name} upstream/master
```

#### 2. Merge All Fix Branches

```bash
git merge --no-edit fix/issue-A fix/issue-B fix/issue-C
```

If merge conflicts: resolve or flag — this indicates the fixes aren't independent.

#### 3. Build

```bash
eval "$(fnm env --shell zsh)" && fnm use 20.15.0
npm run bundle
```

#### 4. Serve

```bash
npx serve . -p 8080
```

#### 5. Browser Verification

Present URLs for the user to check:
```
Ready for browser verification:

- http://localhost:8080/examples/{example-A}/
- http://localhost:8080/examples/{example-B}/
- http://localhost:8080/examples/{example-C}/

Verify all examples render correctly, then approve to proceed to shipping.
```

#### 6. Approval Gate

Wait for user to confirm all examples/fixes look correct. If issues found:
- Switch to the relevant fix branch
- Fix the issue
- Re-run `--test` to rebuild the sprint branch

### `--status`: Sprint Status

Display current progress:

```
═══════════════════════════════════════════════════════════════
SPRINT STATUS: {milestone}
═══════════════════════════════════════════════════════════════

| # | Title | Outline | Spec | Implement | Test | Ship |
|---|-------|---------|------|-----------|------|------|
| {n} | {title} | ✅ | ✅ | ✅ | ⏳ | — |
| {n} | {title} | ✅ | ✅ | 🔄 | — | — |

Sprint test branch: {exists/not created}
Browser verified: {yes/no}
═══════════════════════════════════════════════════════════════
```

### Ship Phase

After `--test` approval, ship each fix branch individually:

```bash
# For each fix branch in the sprint:
git checkout fix/issue-A
/ship
```

Each `/ship` creates:
- Upstream PR to `d3fc/d3fc:master`
- Fork PR to `defnotjec/d3fc:d3fc-v6-staging`
- Fork PR to `defnotjec/d3fc:d3fc-v7-staging`
- Closes local issue

### Cleanup

After all fixes shipped:
```bash
# Delete local sprint test branch
git branch -d sprint/{batch-name}
```

Update PROGRESS to mark sprint complete.

## Output

```
═══════════════════════════════════════════════════════════════
SPRINT COMPLETE: {milestone}
═══════════════════════════════════════════════════════════════

Issues: {count} shipped
Upstream PRs: {list}
Fork PRs: {v6-staging count} + {v7-staging count}
Local issues closed: {list}

Sprint test branch: cleaned up
═══════════════════════════════════════════════════════════════
```

## Constraints

- Sprint test branches are temporary — local only, never pushed
- Each fix branch must independently pass build/test/lint
- Browser verification is required before any shipping (especially for WebGL/Canvas)
- Ship one fix branch at a time via `/ship` — don't batch-create PRs
