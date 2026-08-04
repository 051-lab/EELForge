# EELForge

**Describe the sound. Formalize the DSP. Build the EEL2.**

EELForge is a local-first workbench for turning an audio-effect idea into a structured DSP brief and a portable AI-agent handoff for EEL2 development.

The initial target is **RootlessJamesDSP LiveProg**, with host profiles for:

- RootlessJamesDSP Modern: `@init`, `@slider`, `@block`, `@sample`
- RootlessJamesDSP Legacy: `@init`, `@sample`
- Generic EEL2 / EEL_VM

EELForge does not call an AI provider in the current release. It compiles prompts that can be handed to ChatGPT, Codex, Claude, Qwen, Gemini, local coding agents, or another development environment.

## Current release

**Version:** `0.1.0-alpha.3`  
**Development stage:** Phase 2A — Architect Handoff

The current application provides:

- A structured Plugin Vision form
- An Implementation Contract for host, channels, latency, CPU, and target devices
- Five-field Architect readiness validation
- Punctuation-placeholder rejection
- A deterministic Architect Handoff compiler
- Host-aware EEL2 section requirements
- Focus-safe live prompt updates
- Local browser persistence
- Schema migration from Phase 1A projects
- Project JSON import/export
- Markdown prompt export
- Visible future modes for Build, Repair, Refine, Optimize, and Review

## Portable single-file edition

A self-contained AI-agent handoff edition is available at:

[`releases/EELForge-v0.1-Phase2A-Handoff.html`](releases/EELForge-v0.1-Phase2A-Handoff.html)

Download the file and open it directly in Chrome or Edge. It contains all required CSS, JavaScript, project metadata, and agent instructions, so it does not require Node.js, npm, Vite, a local server, or an internet connection.

The portable HTML can also be uploaded directly to Qwen, Mistral, Claude, Gemini, or another AI platform for review and proposed modifications. It is a generated handoff artifact; accepted changes should be backported into the modular TypeScript/Vite source before an official release is rebuilt.

## Run locally

### Requirements

- Node.js 22 or newer recommended
- npm

### Start development mode

```bash
npm install
npm run dev
```

Open the local address printed by Vite, normally:

```text
http://localhost:5173/
```

### Validate the project

```bash
npm run typecheck
npm test
npm run build
```

## Workflow

EELForge is organized around the following long-term development flow:

```text
VISION → ARCHITECT → PROMPT → ANALYZE → REFINE
```

The present release completes the first dependable prompt path:

```text
Plugin Vision + Runtime Contract → Architect Handoff
```

## Architect Handoff behavior

The generated prompt asks an agent to return an implementation-ready DSP architecture rather than prematurely writing production code. It includes:

1. Plugin concept and operating principle
2. Ordered signal flow
3. Algorithms for each stage
4. Controls, mappings, defaults, and smoothing
5. Persistent state and memory requirements
6. Sample-rate adaptation
7. Stereo or mid/side behavior
8. CPU and latency assessment
9. Numerical safety and output protection
10. Audible behavior and failure modes
11. Validation and listening tests
12. A final Build-agent specification

Optional sections are omitted when empty. Inputs containing only punctuation such as `.`, `...`, or `-` do not count as meaningful context.

## Repository structure

```text
EELForge/
├── .github/workflows/ci.yml
├── docs/
├── releases/
│   └── EELForge-v0.1-Phase2A-Handoff.html
├── src/
│   ├── prompt/
│   ├── domain.ts
│   ├── filename.ts
│   ├── main.ts
│   ├── migrations.ts
│   ├── store.ts
│   └── styles.css
├── tests/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.test.json
└── vite.config.ts
```

## Roadmap

- **Phase 2B:** Build Handoff
- **Phase 2C:** Repair, Refine, Optimize, and Review handoffs
- **Phase 3:** Explainable DSP architecture recommendation engine
- **Phase 4:** EEL2 import and heuristic static analysis
- **Phase 5:** Curated reference library
- **Phase 6:** Exact EEL_VM validation research

See [the roadmap](docs/ROADMAP.md) for details.

## Project principles

- Local-first and provider-independent
- Recommendations must be inspectable and overridable
- Host restrictions must be separated from project preferences
- No unsupported claim of successful EEL2 compilation
- Mobile CPU and latency constraints must affect recommendations
- Imported artifacts become verified context only through explicit user action

## License

EELForge is released under the [MIT License](LICENSE).
