# Contributing to EELForge

EELForge is in active architectural development. Contributions should preserve its local-first, explainable, host-aware design.

## Development setup

```bash
npm install
npm run dev
```

Before submitting a change, run:

```bash
npm run typecheck
npm test
npm run build
```

## Development rules

- Add or update tests for behavior changes.
- Keep prompt compilation deterministic.
- Do not claim that heuristic analysis proves a script compiles.
- Separate RootlessJamesDSP host requirements from general EEL2 rules.
- Preserve focus-safe text entry: continuous typing must not replace the entire application DOM.
- Keep optional prompt context omitted when it is empty or punctuation-only.
- Document schema changes and provide migration behavior.

## Commit style

Use concise, imperative commit messages, for example:

```text
Add Build handoff compiler
Fix legacy host section contract
Document project schema migration
```
