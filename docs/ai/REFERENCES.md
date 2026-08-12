# References

> External and canonical in-repo context the project relies on. No URLs were found in markdown/source docs except localhost dev server; upstream project URLs are not recorded in this repository.

## How to Record a Reference

See template above in prior revisions; add label, location/URL, why it matters, and project-specific conclusion.

## Documentation

### `README.md`

- **Why it matters:** Primary product overview, run/validate commands, host contract table, repository layout.
- **Conclusion:** Start here for purpose, v0.2 scope, and verification commands.

### `AGENTS.md`

- **Why it matters:** Non-negotiable contracts and source boundaries for coding agents.
- **Conclusion:** Required reading before code changes; defines host sections and prompt-mode rules.

### `CONTRIBUTING.md`

- **Why it matters:** PR expectations, validation commands, behavioral rules for prompts and portable HTML.
- **Conclusion:** Tests required for behavior changes; portable artifact must stay offline.

### `docs/extra/ARCHITECTURE.md`

- **Why it matters:** v0.2 component boundaries, persistence envelope, portable build pipeline.
- **Note:** Relocated from `docs/ARCHITECTURE.md`; `README.md` now links to `docs/extra/ARCHITECTURE.md`.

### `docs/extra/ROADMAP.md`

- **Why it matters:** Implemented v0.2 features vs explicit next candidates.
- **Conclusion:** Unimplemented roadmap items must not appear as working controls or prompt behavior.

### `docs/extra/RELEASES.md`

- **Why it matters:** v0.2.0 release notes, legacy migration keys, storage recovery guidance.
- **Note:** Relocated from `docs/RELEASES.md`; `docs/extra/RELEASES.md` is the canonical repository path.

### `docs/extra/PHASE_2A_ARCHITECT_HANDOFF.md`

- **Why it matters:** Architect mode readiness fields and handoff structure from Phase 2A.
- **Conclusion:** Five required vision fields define Architect readiness; optional fields omitted when empty.

### `docs/superpowers/specs/2026-08-04-bolt-v0.2-overhaul-design.md`

- **Why it matters:** Bolt v0.2 integration design; source authority between Bolt export and `main` correctness.
- **Conclusion:** `main` contracts override Bolt when they conflict; Bolt UI structure otherwise preserved.

### `docs/superpowers/plans/2026-08-04-bolt-v0.2-overhaul-implementation.md`

- **Why it matters:** Task-level implementation plan for v0.2 Bolt overhaul (historical).
- **Conclusion:** Documents intended v0.2 toolchain, schema, and release artifact constraints.

### `handoff/agent-handoff-header.html`

- **Why it matters:** Embedded any-agent instructions inlined into the portable HTML artifact.
- **Conclusion:** Canonical policy for offline handoff behavior and backport requirement for HTML edits.

### `release.json`

- **Why it matters:** Machine-readable release manifest (version, schema, artifact name, modes).
- **Conclusion:** `0.2.0`, schema `3`, artifact `EELForge-v0.2-Handoff.html`, six prompt modes.

### AI Development Workflow Project Kit V1.2.0

- **Repository:** https://github.com/051-lab/ai-development-workflow-kit
- **Tag:** `v1.2.0`
- **Released source commit:** `090d9a64f6c2454ff611364e9c6c9c6082752d2d`
- **Why it matters:** Authoritative contract for the repository-state and agent-handoff workflow used by EELForge.
- **Conclusion:** EELForge uses the V1.2 operating contract for repository state and agent handoffs; the workflow kit is guidance/state infrastructure, not an application runtime dependency.


No upstream repository URLs (e.g. RootlessJamesDSP, EEL2, Bolt) are cited in project documentation or source files. Product names **RootlessJamesDSP**, **EEL2**, and **EEL_VM** are used as host/target labels only (`src/domain.ts`, prompts, README).

CI configuration: `.github/workflows/ci.yml` — validates on `ubuntu-latest` with Node 22.

## Research / Papers / Videos

None referenced in repository documentation or application source.

## Other

### `releases/EELForge-v0.2-Handoff.html`

- **Why it matters:** Verified offline single-file edition for AI-agent handoffs; open directly in Chrome or Edge via `file://`.
- **Conclusion:** Generated artifact; must match `npm run build:single` and pass `npm run verify:single`.

### `http://localhost:5173/`

- **Why it matters:** Default Vite dev server URL (`README.md`).
- **Conclusion:** Local development entry point after `npm run dev`.

### RootlessJamesDSP host profiles (conceptual)

- **Why it matters:** Primary deployment target for generated EEL2 scripts; section contracts are product law in `src/domain.ts`.
- **Conclusion:** Modern vs Legacy section sets are fixed; generic EEL2 has no invented section contract. Upstream specification URL not present in this repo.

### EEL2 / EEL_VM (conceptual)

- **Why it matters:** Script language and execution model assumed by all six prompt compilers (`src/prompt/shared-blocks.ts` design requirements).
- **Conclusion:** Prompts enforce EEL2 syntax patterns (no C braces, no recursion, explicit state, etc.); EELForge does not embed a compiler.

### Bolt (conceptual)

- **Why it matters:** Source of the React UI overhaul integrated as v0.2.0 (`docs/extra/RELEASES.md`, superpowers design spec).
- **Conclusion:** Bolt export informed presentation; repository `main` retained contracts, tests, and portable policy. Bolt repository URL not recorded here.

### Superpowers (conceptual)

- **Why it matters:** Optional agent development methodology referenced in README and superpowers plan front matter.
- **Conclusion:** Not a runtime dependency of EELForge.
