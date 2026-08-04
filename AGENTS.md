# EELForge Agent Guide

EELForge can be developed by any capable coding agent. The Superpowers skill is an optional development methodology, not a project dependency. Do not assume a specific agent platform, hidden tool, or proprietary instruction format.

## Start here

1. Read `README.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md`.
2. Work on a feature branch, never directly on `main`.
3. Preserve local-first and offline behavior.
4. Run the full validation commands before claiming completion.

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run build:single
npm run verify:single
```

## Non-negotiable contracts

- RootlessJamesDSP Modern: `@init`, `@slider`, `@block`, `@sample`
- RootlessJamesDSP Legacy: `@init`, `@sample`
- Generic EEL2 / EEL_VM: no predefined host-section contract
- EELForge compiles prompts; it does not call AI providers or execute/validate EEL2.
- Architect requests design and must not request final code.
- Review requests findings and must not silently become a rewrite mode.
- Imported projects receive new identity and no imported version history.
- Reset and version restore preserve project identity and creation time.
- Punctuation-only values are empty; optional empty prompt sections are omitted.
- The portable HTML must remain offline and directly openable through `file://`.

## Source boundaries

- React components: presentation and browser interaction
- `src/domain.ts`: schema and verified host contracts
- `src/migrations.ts`: schema compatibility
- `src/import-export.ts`: strict file boundary
- `src/store.ts`: multi-project persistence and storage budget
- `src/prompt/`: deterministic mode compilers
- `scripts/`: portable artifact generation and verification

Accepted edits made directly to the generated HTML must be backported into modular source before release.
