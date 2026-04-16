---
name: implement
description: Execute a plan or fix on a d3fc fix branch with proper commit conventions
---

Implement a fix or feature on a d3fc fix branch.

## Arguments

- `$ARGUMENTS` - Optional: PLAN file path, issue number, or `--resume`

Options:
- `--resume` — Continue from first unchecked step
- `--commit-phase` — Auto-commit after each phase (default)
- `--commit-step` — Auto-commit after each step (granular)
- `--worktree` — Create isolated git worktree for this fix

## Workflow Integration

```
Pipeline: /outline → /spec → /implement → /ship
Position: ████████████████░░ Step 3 of 4
```

| Prerequisite | Required | Check |
|--------------|----------|-------|
| On a `fix/*` branch | Yes | Based on `upstream/master` |
| PLAN artifact | Recommended | For `wf: abbr` and above |

**Next Step**: `/ship` to create PRs and run review

## Process

### 0. Branch Setup

If not already on a `fix/*` branch:
1. Fetch upstream: `git fetch upstream`
2. Create branch: `git checkout -b fix/{name} upstream/master`
3. Verify clean ancestry

If `--worktree` specified:
1. Create worktree: `git worktree add ../d3fc-{name} -b fix/{name} upstream/master`
2. Work in the worktree directory

### 1. Input Resolution

Resolve the implementation context:
- **Explicit PLAN path**: Read `agents/plans/PLAN-{issue}.json`
- **Issue number**: Find PLAN for that issue, or work from issue description
- **No input**: Infer from current branch name (`fix/{name}` → find matching issue)
- **`--resume`**: Find first unchecked `[ ]` step in existing progress

### 2. Environment Setup

```bash
eval "$(fnm env --shell zsh)" && fnm use 20.15.0
```

Verify build works before starting:
```bash
npm run bundle && npm test
```

### 3. Step-by-Step Execution

For each step in the plan (or each logical unit of work):

1. **Implement** the change
2. **Verify** locally: does it build? do tests pass?
3. **Commit** per the commit granularity setting:
   - `--commit-phase` (default): commit after completing a logical phase
   - `--commit-step`: commit after each step

### 4. Commit Conventions

Every commit MUST follow:

```bash
git commit \
  --author="defnotjec <defnotjec@users.noreply.github.com>" \
  -m "type(scope): description"
```

**Rules:**
- Conventional commit format: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`
- **No AI attribution** — no `Co-Authored-By`, no "Generated with"
- **No `cd` prefix** — use `git -C /path` or flag-based targeting per CLAUDE.md
- Scope should be the affected package or area (e.g., `examples`, `axis`, `webgl`)
- Keep commits logically atomic — one commit per logical change

### 5. Changeset

Before completing implementation, create a changeset:

```bash
# For examples and patches:
cat > .changeset/{descriptive-name}.md << 'EOF'
---
'd3fc': patch
---

Brief description of the change.
EOF
```

Use `patch` for examples, bug fixes, and non-breaking changes.
Use `minor` for new features or API additions.
Use `major` for breaking changes (rare for upstream contributions).

### 6. Pre-Ship Verification

Before marking implementation complete:

```bash
npm run bundle && npm run bundle-min  # Build all packages
npm test                               # Run all tests
npm run lint                           # Lint check
```

All three must pass before proceeding to `/ship`.

### 7. Progress Tracking

If a PROGRESS file exists (`agents/sprints/PROGRESS-*.md`), update it:
- Mark implementation steps as complete
- Note any discovered issues (invoke `/discovered-issue --defer` if needed)

## Example Conventions (for example PRs)

When implementing examples:
- Directory: `examples/{name}/` with `index.html`, `index.js`, `README.md`, `__tests__/index.js`
- HTML: `<div id="chart">` for chartCartesian, `<d3fc-svg>` for standalone SVG
- Data: 30 bars, bandwidth 10 for visual clarity
- Colors: Blue (#2164C2) / Orange (#D6591C) palette
- Style: `var` not `const`/`let`, function expressions not arrow functions
- README: 1-2 sentence description
- Test: Puppeteer screenshot snapshot (`d3fc.loadExample(module)`)

## Output

```
═══════════════════════════════════════════════════════════════
IMPLEMENTATION COMPLETE
═══════════════════════════════════════════════════════════════

Branch: fix/{name}
Commits: {n} ({list of commit subjects})
Changeset: {path}
Build: ✓ | Tests: ✓ ({count}) | Lint: ✓

Next: /ship
═══════════════════════════════════════════════════════════════
```

## Constraints

- Never commit as "claude" or any identity other than defnotjec
- Never include agents/, CLAUDE.md, or .claude/ files on fix branches
- Keep changes minimal — don't refactor adjacent code
- Don't add error handling, comments, or type annotations beyond what's needed
- Test in real browser for WebGL/Canvas examples before marking complete
