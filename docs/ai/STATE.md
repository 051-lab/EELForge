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

- EELForge workflow migration began from synchronized `main` at baseline `c156317ec38ecfc988ebf257a90240f11fdd9ecd`.
- The docs relocation and earlier AI workflow-state work are already merged into `main`; no application source is being changed by this documentation-only V1.2 migration.
- The repository was clean before migration, and `docs/ai/` contains exactly five state files: `PROJECT.md`, `STATE.md`, `DECISIONS.md`, `REFERENCES.md`, and `INBOX.md`.
- The current workflow operating contract is AI Development Workflow Project Kit V1.2.0. State remains Markdown-owned and tool-independent.
- EELForge is a v0.2.0 application with project schema 3. Application validation is currently blocked by local dependency/environment state, not by a known application-source failure.

## Completed Recently

- EELForge v0.2.0 release and portable single-file handoff completed.
- `ec61019` — `Relocate docs and add AI workflow state`.
- `fb01180` — `Align AI workflow state with relocated docs`.
- `c156317` — merge of `docs/relocate-and-ai-workflow` into `main`.
- Earlier V1.1 pilot participation is historical context; V1.2 is the current operating contract.

## V1.2 Migration

The documentation-only reconciliation aligns EELForge's workflow state with the released AI Development Workflow Project Kit V1.2.0 operating contract. Application source changes, dependency changes, release-artifact changes, Git-configuration changes, and local environment repair remain outside this migration.

## Blockers / Risks

- Observed local shell: Node `v24.18.1`, npm `11.16.0`; project README and CI expect Node 22.
- `node_modules` exists but is invalid/incomplete. Observed `npm ls --depth=0` result: `ELSPROBLEMS`.
- Application validation must remain separate from this workflow-state migration. Tests and builds are not claimed to pass locally and are not claimed to fail because of source defects.

## Verification

- Pre-migration Git preflight: clean `main`, HEAD/local `main`/`origin/main` all at `c156317ec38ecfc988ebf257a90240f11fdd9ecd`.
- Exact five-file `docs/ai/` inventory confirmed.
- `DECISIONS.md` and `INBOX.md` preservation hashes recorded before migration.
- Application commands were not run because the dependency installation is invalid and the environment is Node 24 rather than the project/CI Node 22 expectation.

## Working Tree Notes

- The migration is limited to the three existing files `docs/ai/PROJECT.md`, `docs/ai/STATE.md`, and `docs/ai/REFERENCES.md`.
- `docs/ai/DECISIONS.md` and `docs/ai/INBOX.md` are preserved unchanged.

## Updated

2026-08-12 — EELForge workflow state reconciled to AI Development Workflow Project Kit V1.2.0.

## Next Action

Activate Node 22 for the EELForge shell and verify that `node --version` reports a v22.x runtime.

**Acceptance:** `node --version` reports a version whose major version is 22.

**Scope:** Environment only; no repository modification required.
