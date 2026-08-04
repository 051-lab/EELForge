# EELForge Releases

## 0.2.0 — Bolt overhaul integration

- Migrates the application to React while retaining local-first operation.
- Activates six deterministic prompt modes.
- Adds a searchable multi-project dashboard and four starter templates.
- Introduces schema 3 and the `eelforge.projects.v3` workspace envelope.
- Migrates schema-1 and schema-2 projects and checks legacy browser keys.
- Rejects unrecognizable JSON imports and regenerates imported identity.
- Adds ten manual snapshots per project and a 3 MiB serialized workspace budget.
- Corrects RootlessJamesDSP host-section contracts.
- Removes the unfinished Compare placeholder.
- Generates an offline portable HTML for any AI agent.

### Legacy migration

EELForge checks `eelforge.project.v1`, `eelforge.project.v2`, `eelforge.project`, and `eelforge.phase1a.project` when no valid schema-3 workspace exists. Valid content is copied into schema 3. Legacy keys remain untouched for recovery.

### Storage recovery

When browser storage is full:

1. Keep the page open so in-memory work remains available.
2. Export important projects.
3. Delete old versions or unused projects.
4. Re-import exported projects after space is available.

EELForge never reports a version save as successful before the workspace write succeeds.
