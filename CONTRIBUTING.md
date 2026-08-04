# Contributing to EELForge

EELForge is local-first, provider-independent, and correctness-first.

## Development

```bash
npm ci
npm run dev
```

Before a pull request:

```bash
npm run typecheck
npm test
npm run build
npm run build:single
npm run verify:single
```

## Rules

- Add tests for behavioral changes.
- Keep prompt compilation deterministic and mode-specific.
- Do not add unsupported RootlessJamesDSP sections.
- Do not claim EEL2 compilation, true-peak compliance, CPU improvement, or audible behavior without evidence.
- Preserve schema migration and strict import rejection.
- Preserve focus during continuous typing.
- Keep the generated portable HTML offline and free of external assets.
- Do not commit `node_modules`, `dist`, `.vite`, `.eelforge_ref`, coverage, or temporary artifacts.

Use concise imperative commit messages.
