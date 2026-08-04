# EELForge Architecture

## Product boundary

EELForge is a prompt and artifact workbench, not an AI provider. The browser application owns structured project state, deterministic prompt compilation, local persistence, and future artifact analysis.

## Current modules

### `src/domain.ts`

Defines the project schema, supported host profiles, workflow stages, prompt modes, and defaults.

### `src/migrations.ts`

Converts prior project exports and browser state into the current schema. Phase 1A fields are retained while Phase 2A fields are added with safe defaults.

### `src/store.ts`

Owns project mutations, autosave, subscriber notification, and focus-safe silent dispatch. Text entry can update state and derived prompt regions without destroying the focused control.

### `src/prompt/`

Contains pure prompt logic:

- meaningful-content detection
- shared host/runtime blocks
- Architect readiness
- Architect prompt compilation
- compiler entry point

Prompt modules contain no DOM or persistence behavior.

### `src/main.ts`

Renders the application shell, binds browser events, updates derived views, and handles project/prompt import and export.

## Persistence

Current Phase 2A storage uses browser `localStorage` because the project contains bounded text state. A future artifact phase will move full imported scripts and reports to IndexedDB.

## State schema

The schema version is independent from the application version:

- `schemaVersion`: persistence compatibility
- `appVersion`: release identification

Current values:

```json
{
  "schemaVersion": 2,
  "appVersion": "0.1.0-alpha.3"
}
```

## Prompt compilation invariant

A compiled prompt is a pure function of the current project state. Copy and export actions compile from current state rather than relying on stale render-time text.

## Focus-safety invariant

Continuous text input dispatches with listener notification disabled. Only derived regions are updated:

- readiness count
- missing-field list
- prompt text
- character count

Selects, checkboxes, project import, and reset may perform a complete application render.
