# EELForge

**Describe the sound. Formalize the DSP. Build the EEL2.**

EELForge is a local-first React workbench for turning an audio-effect idea, implementation contract, architecture report, or EEL2 script into a structured handoff for any AI development agent.

## Current release

**Version:** `0.2.0`  
**Project schema:** `3`  
**Stage:** Bolt overhaul integration

EELForge provides:

- A searchable multi-project dashboard
- Blank projects and four editable DSP starter templates
- Architect, Build, Repair, Refine, Optimize, and Review prompt modes
- Verified RootlessJamesDSP Modern and Legacy host contracts
- Generic EEL2 / EEL_VM targeting without invented host sections
- Strict schema-1/2/3 migration and JSON import validation
- Project duplication, rename, deletion, import, and export
- Ten manual snapshots per project with storage-budget pruning
- An offline single-file edition for AI-agent handoffs

EELForge does **not** call an AI provider, execute EEL2, or prove that a script compiles. Its output is a deterministic prompt and must be evaluated by the receiving agent and, when applicable, a real EEL2 host or compiler.

## Any-agent compatibility

No AI-specific skill is required. The repository includes `AGENTS.md` and an embedded plain-language handoff inside the portable HTML. ChatGPT, Codex, Claude, Gemini, Qwen, Mistral, Bolt, local agents, and human developers can use the same application and contracts.

Superpowers is used optionally as a development workflow; it is not installed by or required by EELForge.

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Vite normally opens at `http://localhost:5173/`.

## Validate

```bash
npm run typecheck
npm test
npm run build
npm run build:single
npm run verify:single
```

## Portable single-file edition

The generated artifact is:

[`releases/EELForge-v0.2-Handoff.html`](releases/EELForge-v0.2-Handoff.html)

Download it and open it directly in Chrome or Edge. It contains its CSS, JavaScript, manifest, and agent guidance and makes no network request.

## Verified host contracts

| Profile | Available sections |
|---|---|
| RootlessJamesDSP Modern | `@init`, `@slider`, `@block`, `@sample` |
| RootlessJamesDSP Legacy | `@init`, `@sample` |
| Generic EEL2 / EEL_VM | No host-specific section contract predefined |

## Repository structure

```text
src/                  React UI, domain, storage, migration, and prompt compilers
tests/                Unit and interaction tests
scripts/              Portable build and verifier
handoff/              Embedded any-agent instructions
releases/             Verified standalone HTML
docs/                 Architecture, roadmap, and release notes
.github/workflows/    CI validation
```

See [Architecture](docs/ARCHITECTURE.md), [Roadmap](docs/ROADMAP.md), and [Release Notes](docs/RELEASES.md).

## License

MIT © 2026 051-lab
