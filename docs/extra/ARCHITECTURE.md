# EELForge v0.2 Architecture

## Product boundary

EELForge owns structured browser state, deterministic prompt compilation, local persistence, import/export, and portable packaging. It does not own AI inference, EEL2 execution, or compiler truth.

## Presentation

React components in `src/components/` render the dashboard, vision and contract forms, mode-specific artifact fields, compiled prompt, and manual versions. Controlled inputs preserve focus and the complete typed value during live prompt updates.

## Domain

`src/domain.ts` defines schema 3, release `0.2.0`, defaults, prompt modes, and host mappings. Host mappings are product contracts and must not be inferred from UI labels.

## Prompt compilation

Each module under `src/prompt/` is a pure function of `ProjectState`. `CompiledPrompt.requiredFields` is the only source for mode readiness counts. Optional punctuation-only context is omitted.

## Import boundary

`src/import-export.ts` rejects arbitrary JSON. It accepts recognizable EELForge projects and export envelopes, migrates content, then assigns a new ID and timestamps. Version history is never imported.

## Persistence

The key `eelforge.projects.v3` stores:

```ts
interface WorkspaceEnvelope {
  schemaVersion: 3;
  activeId: string | null;
  entries: ProjectEntry[];
}
```

The active project survives reload. Legacy keys are read but left untouched after migration. Each project keeps ten manual snapshots. Before storage, old snapshots are pruned globally, oldest first, to a 3 MiB envelope budget. Active project content is never truncated.

## Portable artifact

Vite produces one JavaScript chunk and at most one CSS asset. `scripts/build-single-file.mjs` inlines them, inserts the any-agent header and release manifest, verifies the temporary HTML, and atomically publishes `releases/EELForge-v0.2-Handoff.html`.
