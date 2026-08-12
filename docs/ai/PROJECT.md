# EELForge

> Durable project identity and constraints. Slow-changing project truth.

## Project Name

EELForge (`eelforge` npm package; repository name EELForge).

## Purpose

EELForge is a local-first React workbench for turning an audio-effect idea, implementation contract, architecture report, or EEL2 script into a structured, deterministic handoff prompt for any AI development agent.

It targets RootlessJamesDSP (Modern and Legacy profiles) and generic EEL2 / EEL_VM workflows. It does **not** call an AI provider, execute EEL2, or prove that a script compiles. Output is evaluated by the receiving agent and, when applicable, a real EEL2 host or compiler.

MIT license; copyright 2026 051-lab (per `LICENSE`).

## Current Scope

**Release:** `0.2.0`  
**Project schema:** `3`  
**Historical context:** The README stage label “Bolt overhaul integration” describes the v0.2 release work; it is not a current project phase.

Implemented capabilities (v0.2, per README, `release.json`, and `docs/extra/ROADMAP.md`):

- Searchable multi-project dashboard
- Blank projects and four editable DSP starter templates (`src/templates.ts`)
- Six deterministic prompt modes: Architect, Build, Repair, Refine, Optimize, Review
- Verified RootlessJamesDSP Modern and Legacy host-section contracts (`src/domain.ts`)
- Generic EEL2 / EEL_VM targeting with no predefined host-section contract
- Strict schema-1/2/3 migration (`src/migrations.ts`)
- Strict JSON import validation; imported projects receive new identity and no imported version history (`src/import-export.ts`)
- Project duplication, rename, deletion, import, and export
- Ten manual snapshots per project with storage-budget pruning (`src/store.ts`)
- Offline single-file edition for AI-agent handoffs (`releases/EELForge-v0.2-Handoff.html`)
- Any-agent development guidance (`AGENTS.md`, embedded handoff header in portable HTML)

Explicit exclusions (product boundary):

- No AI inference
- No EEL2 execution or compiler truth
- No unfinished roadmap features as working UI or prompt behavior

Roadmap candidates not in scope until implemented (per `docs/extra/ROADMAP.md`): architecture recommendation engine, EEL2 import indexing/static analysis, host-backed validation research, structured artifact promotion between modes, real version comparison, optional cloud sync.

## Architecture

EELForge owns structured browser state, deterministic prompt compilation, local persistence, import/export, and portable packaging. It does not own AI inference, EEL2 execution, or compiler truth (per `docs/extra/ARCHITECTURE.md`).

**Presentation:** React components in `src/components/` — dashboard, vision/contract forms, mode-specific artifact fields, compiled prompt, manual versions. Controlled inputs preserve focus during live prompt updates.

**Domain:** `src/domain.ts` — schema 3, release `0.2.0`, defaults, prompt modes, host mappings. Host mappings are product contracts, not inferred from UI labels.

**Prompt compilation:** Pure functions under `src/prompt/` driven by `ProjectState`. `CompiledPrompt.requiredFields` is the only source for mode readiness counts. Optional punctuation-only context is omitted.

**Import boundary:** `src/import-export.ts` rejects arbitrary JSON; accepts recognizable EELForge projects and export envelopes; migrates content; assigns new ID and timestamps; never imports version history.

**Persistence:** Browser key `eelforge.projects.v3` stores a workspace envelope (`schemaVersion: 3`, `activeId`, `entries`). Active project survives reload. Legacy keys are read but left untouched after migration. Ten manual snapshots per project; global oldest-first pruning to a 3 MiB serialized envelope budget; active project content is never truncated.

**Portable artifact:** Vite produces one JS chunk and at most one CSS asset. `scripts/build-single-file.mjs` inlines them, inserts the any-agent header and release manifest, verifies temporary HTML, and publishes `releases/EELForge-v0.2-Handoff.html`. Accepted edits to the generated HTML must be backported to modular source before release (`AGENTS.md`).

**Source boundaries (AGENTS.md):**

| Area | Responsibility |
|------|----------------|
| `src/components/` | Presentation and browser interaction |
| `src/domain.ts` | Schema and verified host contracts |
| `src/migrations.ts` | Schema compatibility |
| `src/import-export.ts` | Strict file boundary |
| `src/store.ts` | Multi-project persistence and storage budget |
| `src/prompt/` | Deterministic mode compilers |
| `scripts/` | Portable artifact generation and verification |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript 5.6 |
| UI | React 18.3 |
| Bundler / dev server | Vite 6 (`base: './'`, `cssCodeSplit: false`, `inlineDynamicImports: true`) |
| Tests | Vitest 3, jsdom, Testing Library |
| CI | GitHub Actions (`ubuntu-latest`, Node 22) |
| Package manager | npm (`package-lock.json` present) |

Runtime dependencies: `react`, `react-dom` only. No database or external service dependencies in application code.

## Supported Environments

**Development:** Node.js 22 and npm (README, CI workflow). Local dev via `npm run dev`; Vite normally serves at `http://localhost:5173/`.

**Portable edition:** `releases/EELForge-v0.2-Handoff.html` — offline, directly openable via `file://`, intended for Chrome or Edge (README). No network requests; no external runtime assets.

**CI:** `push` to `main` or `integration/bolt-v0.2-overhaul`; all pull requests (`.github/workflows/ci.yml`).

**Default contract targets (product defaults in `src/domain.ts`):** stereo, 44.1/48 kHz sample rates, zero latency mode, mobile-balanced CPU target, Galaxy S10 and Galaxy S24 Ultra device targets, parameter smoothing and output protection enabled by default.

**Host profiles:**

| Profile ID | Label | Sections |
|------------|-------|----------|
| `rjdsp-modern` | RootlessJamesDSP Modern | `@init`, `@slider`, `@block`, `@sample` |
| `rjdsp-legacy` | RootlessJamesDSP Legacy | `@init`, `@sample` |
| `eel-vm-core` | Generic EEL2 / EEL_VM | none predefined |

**Repository-local workflow:** `docs/ai/` records tool-independent project state and agent handoff context. EELForge does not depend on Luna, Codex, OpenCode, ChatGPT, or another specific provider.

## Repository Conventions

- Work on a feature branch; never directly on `main` (`AGENTS.md`).
- Concise imperative commit messages (`CONTRIBUTING.md`).
- Do not commit `node_modules`, `dist`, `.vite`, `.eelforge_ref`, coverage, or temporary artifacts (`.gitignore`, `CONTRIBUTING.md`).
- Add tests for behavioral changes (`CONTRIBUTING.md`).
- Superpowers is an optional development methodology; not a project dependency (`README.md`, `AGENTS.md`).

**Directory layout (README):**

```text
src/                  React UI, domain, storage, migration, prompt compilers
tests/                Unit and interaction tests
scripts/              Portable build and verifier
handoff/              Embedded any-agent instructions
releases/             Verified standalone HTML
docs/                 Architecture, roadmap, release notes (see note below)
.github/workflows/    CI validation
```

**Note:** Canonical architecture/roadmap/release docs now live under `docs/extra/`; `README.md` and `AGENTS.md` have already been updated to reference the `docs/extra/` paths. `docs/ai/` holds the AI Development Workflow state files. `docs/superpowers/` holds existing Superpowers planning and design material.

**Release metadata:** `release.json` mirrors product version, schema, artifact name, and implemented prompt modes.

## Non-Negotiable Constraints

From `AGENTS.md`, `CONTRIBUTING.md`, and embedded handoff header:

- RootlessJamesDSP Modern: `@init`, `@slider`, `@block`, `@sample`
- RootlessJamesDSP Legacy: `@init`, `@sample`
- Generic EEL2 / EEL_VM: no predefined host-section contract
- EELForge compiles prompts only; no AI provider calls; no EEL2 execution/validation
- Architect requests design; must not request final code
- Review requests findings; must not silently become a rewrite mode
- Imported projects: new identity; no imported version history
- Reset and version restore: preserve project `id` and `createdAt`
- Punctuation-only values are empty; optional empty prompt sections omitted
- Portable HTML: offline, `file://` openable, no telemetry or hidden network calls
- Do not add unsupported RootlessJamesDSP sections
- Do not claim EEL2 compilation, true-peak compliance, CPU improvement, or audible behavior without evidence
- Preserve schema migration and strict import rejection
- Preserve focus during continuous typing
- Prompt compilation must remain deterministic and mode-specific

## Verification Commands

Authoritative sequence (`README.md`, `AGENTS.md`, `CONTRIBUTING.md`, CI):

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run build:single
npm run verify:single
```

CI additionally requires the committed `releases/EELForge-v0.2-Handoff.html` and `package-lock.json` to match a fresh `npm run build:single` (`git diff --exit-code`).

Individual scripts (`package.json`):

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | `vitest run` |
| `npm run test:watch` | `vitest` watch mode |
| `npm run build` | typecheck + `vite build` |
| `npm run build:single` | build + `scripts/build-single-file.mjs` |
| `npm run verify:single` | verify `releases/EELForge-v0.2-Handoff.html` |
| `npm run clean:single` | `scripts/clean-single-file.mjs` |

## Definition of Healthy

A healthy EELForge repository state:

1. **Branch discipline:** Active work on a feature branch; `main` reflects released artifacts.
2. **Dependencies:** `npm ci` succeeds on a clean tree.
3. **Validation green:** `typecheck`, `test`, `build`, `build:single`, and `verify:single` all exit 0.
4. **Release integrity:** `releases/EELForge-v0.2-Handoff.html` matches `npm run build:single` output and passes `verify:single`.
5. **Docs coherent:** Entry-point docs (`README.md`, `AGENTS.md`) link to existing architecture/roadmap/release files; `docs/ai/STATE.md` reflects current operational truth.
6. **Contracts preserved:** Host sections, prompt-mode behavior, migration/import rules, and offline portable policy unchanged unless intentionally versioned.
7. **Clean working tree** before handoff, except deliberate in-progress work recorded in `docs/ai/STATE.md`.
