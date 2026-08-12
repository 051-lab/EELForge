# Decisions

> Durable record of decisions supported by repository evidence. No invented historical rationale.

## How to Use This File

Append new entries when a decision is made or superseded. Include date when known from repository artifacts.

## Current Decisions

### Product boundary — prompts only, no AI or EEL2 execution

- **Decision:** EELForge compiles deterministic prompts from structured project state. It does not call AI providers, execute EEL2, or assert script validity.
- **Reason:** Stated consistently in `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `handoff/agent-handoff-header.html`, and `docs/extra/ARCHITECTURE.md`.
- **Consequences:** No provider SDKs, no EEL2 VM in the app; validation claims in prompt output must be framed for the receiving agent/host.

### Verified RootlessJamesDSP host-section contracts

- **Decision:** Modern profile sections are `@init`, `@slider`, `@block`, `@sample`; Legacy are `@init`, `@sample`; Generic EEL2 / EEL_VM has no predefined section contract.
- **Reason:** Encoded in `src/domain.ts` (`hostSections`) and repeated across agent guidance.
- **Consequences:** UI and compilers must not invent or imply additional host sections.

### Schema 3 workspace envelope

- **Decision:** Persist multi-project state under browser key `eelforge.projects.v3` with `schemaVersion: 3`, active project ID, and project entries.
- **Reason:** `docs/extra/ARCHITECTURE.md`, `docs/extra/RELEASES.md`, `src/domain.ts` (`PROJECT_SCHEMA_VERSION = 3`).
- **Consequences:** `src/migrations.ts` must continue migrating schema 1/2; legacy keys remain untouched after migration.

### Import identity regeneration

- **Decision:** Recognizable imports are migrated and assigned new project `id` and timestamps; version history is never imported.
- **Reason:** `AGENTS.md`, `src/import-export.ts` boundary description, `docs/extra/RELEASES.md`.
- **Consequences:** Export/import is not a full workspace clone with history.

### Prompt mode semantics

- **Decision:** Architect forbids final EEL2 code; Build/Repair/Refine/Optimize request one complete script; Review requests findings and forbids silent rewrite.
- **Reason:** `AGENTS.md`, prompt modules under `src/prompt/`, tests in `tests/prompts.test.ts`.
- **Consequences:** Mode compilers remain separate pure functions; readiness counts come only from `CompiledPrompt.requiredFields`.

### v0.2 React presentation layer

- **Decision:** v0.2.0 integrates a Bolt-exported React UI while preserving domain, migration, storage, and prompt logic as pure TypeScript modules.
- **Reason:** `docs/extra/RELEASES.md`, `docs/superpowers/specs/2026-08-04-bolt-v0.2-overhaul-design.md`, `docs/superpowers/plans/2026-08-04-bolt-v0.2-overhaul-implementation.md`.
- **Consequences:** `src/components/` owns presentation; business rules stay out of React components per architecture docs.

### Offline portable single-file artifact

- **Decision:** Official handoff artifact is `releases/EELForge-v0.2-Handoff.html`, built offline, `file://` compatible, with inlined assets and embedded agent header.
- **Reason:** `README.md`, `release.json`, `scripts/build-single-file.mjs`, CI verify step.
- **Consequences:** Vite config uses relative base and single-chunk output; direct HTML edits must be backported to source before release.

### Storage budget and snapshot policy

- **Decision:** Ten manual snapshots per project; global oldest-first pruning to 3 MiB serialized workspace budget; never truncate active project content.
- **Reason:** `docs/extra/ARCHITECTURE.md`, `docs/extra/RELEASES.md`, `src/store.ts` (per architecture doc).
- **Consequences:** Version save must not report success before workspace write succeeds.

### Any-agent, Superpowers-optional development

- **Decision:** No AI-specific skill is required to use or develop EELForge; Superpowers is optional workflow tooling only.
- **Reason:** `README.md`, `AGENTS.md`, handoff header.
- **Consequences:** Guidance uses plain language and standard web stack; no proprietary agent harness in the product.

### Compare feature removed in v0.2

- **Decision:** The unfinished Compare placeholder was removed for v0.2.0.
- **Reason:** `docs/extra/RELEASES.md` ("Removes the unfinished Compare placeholder").
- **Consequences:** Real version comparison remains a roadmap candidate, not current behavior.
