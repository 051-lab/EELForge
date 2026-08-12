# Project State

> Fast-changing operational truth. Repository and Git evidence are authoritative.

## Operating Rules

- Verified repository, Git, remote, CI, test, and build evidence overrides stale narrative state.
- Routine stale STATE mismatches are reported and reconciled during a bounded state/work update; they do not automatically stop work.
- Stop and report when a conflict materially affects scope, architecture, safety, acceptance criteria, destructive operations, or required approval.
- STATE contains exactly one independently verifiable atomic Next Action.
- Do not create recursive metadata-chasing STATE-only commits merely because a prior STATE commit changed HEAD; update state at a meaningful work or handoff boundary.
- Fast Path is for contained, low-risk, well-understood work. Deliberate Path is for ambiguous, architectural, risky, or cross-cutting work.
- Human chooses goals, priorities, and meaningful decisions. Planner/Reviewer handles scope, architecture, and evidence review. Operator performs bounded repository and terminal execution.
- Routine evidence inspection, bounded edits, tests, and ordinary scoped commits are allowed when in scope. Explicit authorization is required before `git reset --hard`, `git clean`, force push, branch deletion, history rewriting, global Git configuration changes, discarding unexplained work, broad destructive deletion, or bypassing failed validation.

## Current Verified State

- EELForge operates under AI Development Workflow Project Kit V1.2.0; state remains Markdown-owned and tool-independent.
- EELForge remains v0.2.0 with project schema 3.
- Local `main` and `origin/main` are synchronized at `bc3851508e6995020cc4f8702c18c8a6e0ad8b67`, the normal merge commit for PR #4.
- PR #4 merged the deterministic single-file EOL fix; the working tree is clean.
- Node 22 is available and verified locally. Dependency installation and the dependency tree are healthy.
- Local typecheck, tests, production build, portable build, and standalone portable verification pass.
- GitHub CI passes independently on Ubuntu 24.04 for the merged change.
- The portable artifact is deterministic across Windows and Ubuntu, with no known current application-source validation blocker based on completed evidence.

## Completed Recently

- EELForge V1.2 workflow migration was merged previously.
- Node 22 and dependency-environment repair completed; local validation was restored.
- Local typecheck, test, production-build, and portable-artifact validation completed.
- The deterministic single-file EOL bug was diagnosed and fixed in `09193640d6ae8a624091b73b870167b000ea6b65` (`Make single-file builds EOL-deterministic`).
- PR #4 merged that fix in `bc3851508e6995020cc4f8702c18c8a6e0ad8b67`.
- Windows and Ubuntu validation both passed, including portable-artifact reproducibility checks.

## Blockers / Risks

- No verified active blocker currently prevents normal EELForge development.
- The system Node 24 installation still exists; new PowerShell sessions must use the configured fnm environment when EELForge requires Node 22.
- Merged feature branches remain preserved pending explicit authorization for deletion; this is housekeeping, not a development blocker.

## Verification

### Local

- Node `v22.23.2`; npm `10.9.8`.
- Typecheck: PASS.
- Tests: 13 test files / 58 tests, PASS.
- Production build: PASS.
- Portable build: PASS.
- Standalone portable verification: PASS.

### CI

- PR #4 workflow run `31609076170`, Ubuntu 24.04, project Node `v22.23.1`.
- `validate`: SUCCESS.
- 58 / 58 tests, portable build, standalone verification, and generated-release Git diff gate: PASS.

### Artifact

- Canonical portable artifact SHA256: `3a9cf2acf667b742adb3e504f64307a5a81ac8e807108e0a9822511f5fe13da8`.
- Canonical Git blob: `83e51eed8b0c6c21cb991188cd2d3b76cefcf0e5`.

## Working Tree Notes

- `main` is synchronized and clean at merge commit `bc3851508e6995020cc4f8702c18c8a6e0ad8b67`.
- This reconciliation changes only `docs/ai/STATE.md` on documentation branch `docs/reconcile-state-after-eol-fix`.
- Existing merged feature branches are intentionally preserved pending explicit authorization.

## Updated

2026-08-12 — Post-merge state reconciliation after deterministic single-file reproducibility validation.

## Next Action

Human selects the next EELForge product-development priority.

**Acceptance:** One concrete next product-development goal or maintenance priority is selected by the human and can be converted into a bounded work item.

**Scope:** Planning/priority selection only; no repository modification is required by this action.
