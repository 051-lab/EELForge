# EELForge: Bolt Intent vs. v0.2 Reality Assessment

**Date:** 2026-08-04  
**Baseline reviewed:** `main` at EELForge v0.2.0  
**Purpose:** Preserve the original Bolt overhaul intent, compare it against the hardened v0.2 implementation, and identify the correct product direction for v0.3.

## Sources

This assessment is based on:

1. The complete user-supplied Bolt conversation thread, including Bolt's repository analysis, the approved local-only rebuild plan, and Bolt's final completion summary.
2. The released v0.2 source on `main`, especially:
   - `src/App.tsx`
   - `src/components/Dashboard.tsx`
   - `src/components/PromptPanel.tsx`
   - `src/components/VersionPanel.tsx`
   - `src/store.ts`
   - `src/templates.ts`
   - `src/styles.css`
   - `docs/ROADMAP.md`
3. The v0.2 integration design, implementation plan, test suite, CI history, portable build verification, and user acceptance.

## Executive conclusion

EELForge v0.2 successfully delivered the core Bolt overhaul. It is recognizably the Bolt-designed product: a React, local-only, multi-project DSP workbench with six functional prompt modes, templates, onboarding, local persistence, and version restoration.

The hardened integration did not simply copy Bolt's output. It corrected host-contract errors, strengthened migration and import boundaries, added storage protection, removed unfinished controls, created a verified offline release, and established automated tests and CI.

The major remaining Bolt-intent gaps are not the React rebuild or the six modes. They are the continuity features around those modes:

- real version comparison,
- prompt evolution/history,
- dashboard readiness and dedicated filters,
- keyboard shortcuts,
- and a connected artifact-promotion workflow between Architect, Build, and iteration modes.

The most appropriate v0.3 theme is therefore **Workflow Continuity and Project Intelligence**, not another foundation rewrite.

---

## Status definitions

- **Fully implemented:** The approved intent exists and behaves as expected.
- **Implemented differently for safety:** The intent exists, but the final design was deliberately changed to protect correctness, storage, compatibility, or clarity.
- **Partially implemented:** A meaningful portion exists, but the original user-facing promise is incomplete.
- **Not implemented:** The feature does not exist in the released application.
- **Intentionally rejected:** The original idea was removed because it conflicted with a stronger product constraint.

---

## 1. Product boundary and foundation

### Local-only, no accounts, no server

**Status: Fully implemented**

The user explicitly rejected logins and cloud accounts. v0.2 stores projects in the browser, calls no AI provider, and requires no server for the portable edition.

### React component foundation

**Status: Fully implemented**

The full-page imperative rendering architecture was replaced with React components. Controlled inputs preserve focus and live values while the prompt updates.

### Preserve the original domain model and prompt core

**Status: Implemented differently for safety**

The original vision, contract, host profile, and prompt concepts remain central. The integration expanded them to schema 3 and corrected unsupported RootlessJamesDSP assumptions. Prompt compilation remains deterministic and separate from UI state.

### Multi-project local storage

**Status: Fully implemented**

The single-project storage slot became a local multi-project workspace with a persisted active project.

### Legacy save migration

**Status: Fully implemented**

The store checks official and legacy storage keys and migrates prior single-project data into schema 3.

### Punctuation-placeholder rejection

**Status: Fully implemented**

Punctuation-only content remains non-meaningful for readiness and optional prompt context.

---

## 2. Multi-project dashboard

### Project cards with name, host, CPU target, mode, and last-edited date

**Status: Fully implemented**

Cards show project identity, purpose, prompt mode, host profile, CPU target, saved-version count, and relative update time.

### Readiness status on project cards

**Status: Partially implemented**

The dashboard does not compute or display the active mode's actual prompt readiness. The green badge currently represents saved-version count, not readiness. This is an important semantic gap because Bolt's plan described project readiness as a dashboard-level signal.

### Create, open, rename, duplicate, and delete

**Status: Fully implemented**

All five lifecycle actions are available. Delete uses a named confirmation dialog, and duplication creates a fresh identity without copying version history.

### Project search

**Status: Fully implemented with narrower scope**

Search covers project name, purpose, host profile, and prompt mode.

### Dedicated filters by host, CPU target, and prompt mode

**Status: Partially implemented**

There is no dedicated filter UI. Host and mode can be found through free-text search, but CPU target is not included in the search fields. The original filtering promise is therefore incomplete.

---

## 3. All six prompt modes

### Architect

**Status: Fully implemented**

Architect produces an implementation-ready DSP design request and does not request final EEL2 code.

### Build

**Status: Fully implemented**

Build accepts an approved architecture report and compiles a full-script implementation handoff with host-aware requirements and truthful validation expectations.

### Repair

**Status: Fully implemented**

Repair accepts the current script plus a defect description and requests a targeted correction that preserves working behavior.

### Refine

**Status: Fully implemented**

Refine accepts a working script plus a specific audible or behavioral goal.

### Optimize

**Status: Fully implemented**

Optimize accepts a complete script and optional priorities for CPU, memory, or latency reduction.

### Review

**Status: Fully implemented**

Review requests structured findings rather than silently becoming a rewrite mode.

### Functional mode switcher and mode-specific fields

**Status: Fully implemented**

All six tabs are active. Each mode displays only the source fields it needs and maintains a mode-specific readiness calculation.

### Connected handoff progression between modes

**Status: Partially implemented**

The modes exist, but they behave primarily as independent prompt compilers. Users manually copy AI output back into the architecture report, script, or iteration-note fields. The application does not yet provide explicit artifact promotion, provenance, or a guided Architect → Build → Iterate chain.

This is not a failure of Bolt's six-mode promise, but it is the main reason the application still feels like six tools sharing one project rather than one continuous DSP-development system.

---

## 4. Version history and comparison

### Version snapshots

**Status: Implemented differently for safety**

Bolt proposed creating a snapshot on every save. v0.2 uses explicit manual snapshots instead.

This was an intentional hardening decision because every keystroke or autosave could otherwise store repeated copies of large EEL2 scripts and exhaust `localStorage` rapidly.

### Snapshot retention and quota handling

**Status: Exceeds Bolt intent**

v0.2 limits each project to ten manual versions, applies a browser-storage budget, and prunes the globally oldest versions when needed. Persistence failures are surfaced rather than silently discarding work.

### Restore a prior project state

**Status: Fully implemented**

A version can be restored while preserving the current project identity, creation time, and onboarding state.

### Prompt comparison view

**Status: Not implemented**

The unfinished Bolt Compare control was removed rather than shipped as a misleading placeholder. The roadmap correctly lists real version comparison as future work.

### Prompt history/evolution list

**Status: Not implemented**

There is no timeline showing how the compiled prompt changed over time. Because automatic per-save history is unsafe for local storage, any future implementation should derive history from explicit milestones or compact prompt metadata rather than every text edit.

---

## 5. Templates, onboarding, and polish

### Warm Saturator template

**Status: Fully implemented**

### Transparent Limiter template

**Status: Fully implemented**

### Stereo Widener template

**Status: Fully implemented**

### Tape Character template

**Status: Fully implemented**

All four templates are editable starter briefs and avoid unsupported promises of hardware-identical emulation or verified limiter compliance.

### Guided first-run onboarding

**Status: Fully implemented**

The first-run sequence explains plugin description, runtime contract, prompt compilation, and safe iteration.

### Live prompt preview

**Status: Fully implemented**

The compiled prompt updates from controlled project state and exposes character count, readiness, required-field progress, and missing-field guidance.

### Responsive desktop, tablet, and phone layout

**Status: Fully implemented at the CSS architecture level**

The two-column workspace collapses below desktop width, contract fields become single-column on narrow screens, mode tabs reflow, actions wrap, and the dashboard becomes one card per row. Device-specific usability should remain part of future acceptance testing.

### Keyboard shortcuts

**Status: Not implemented**

No shortcut controller or shortcut-discovery interface exists for new project, copy prompt, export, mode switching, or dashboard navigation.

---

## 6. Hardening added beyond the Bolt implementation

The final v0.2 product includes important capabilities that were not established by Bolt's completion message:

1. **Correct host contracts**
   - RootlessJamesDSP Modern: `@init`, `@slider`, `@block`, `@sample`
   - RootlessJamesDSP Legacy: `@init`, `@sample`
   - Generic EEL2 / EEL_VM: no invented host-section list

2. **Strict import boundary**
   - malformed JSON is rejected,
   - arbitrary JSON is rejected,
   - schema-only objects are rejected,
   - imported projects receive fresh identity,
   - imported version history is not trusted or copied.

3. **Persistence safety**
   - schema-1/2/3 migration,
   - official legacy-key recovery,
   - storage-budget enforcement,
   - quota/error feedback,
   - ten-version cap.

4. **Portable release system**
   - self-contained HTML,
   - direct offline use,
   - no external runtime assets,
   - no network calls,
   - literal-safe JavaScript bundle insertion,
   - final-script parsing and verification.

5. **Browser compatibility**
   - UUID generation fallback when `crypto.randomUUID()` is unavailable,
   - portable file import compatibility,
   - focus-safe controlled inputs.

6. **Automated evidence**
   - TypeScript checking,
   - unit and interaction tests,
   - production Vite build,
   - portable build verification,
   - byte-for-byte generated-release check,
   - CI on pull requests and `main`.

7. **Any-agent compatibility**
   - plain-language `AGENTS.md`,
   - no Superpowers runtime dependency,
   - provider-independent prompt export.

---

## 7. Final feature classification

### Fully implemented

- Local-only and account-free product boundary
- React foundation
- Multi-project local workspace
- Legacy migration
- Punctuation-only rejection
- Core project lifecycle
- All six prompt modes
- Four templates
- Onboarding
- Live preview and readiness
- Version restore
- Responsive layout architecture

### Implemented differently for safety

- Original domain and prompt core expanded into schema 3
- Automatic snapshotting replaced with manual milestones
- Version retention limited and storage-budgeted
- Unfinished Compare control removed

### Partially implemented

- Dashboard readiness status
- Dedicated dashboard filters
- Connected artifact progression between modes

### Not implemented

- Real version/prompt comparison
- Prompt evolution/history
- Keyboard shortcuts

### Intentionally rejected

- User accounts and cloud-first storage
- Shipping placeholder controls as though they worked
- Automatic unbounded snapshot creation
- Unsupported host sections or unverifiable DSP claims

---

## 8. Recommended v0.3 direction

### Theme: Workflow Continuity and Project Intelligence

v0.3 should complete the product workflow that the Bolt overhaul made possible. It should not replace React, rewrite storage again, or jump immediately to speculative AI/DSP intelligence.

### Priority 1: Structured artifact promotion

Create explicit, user-confirmed transitions:

- Architect response → approved architecture report
- Build response → current EEL2 script
- Repair/Refine/Optimize response → candidate replacement script
- Review response → review report or iteration note

Each promotion should record:

- source mode,
- timestamp,
- user confirmation,
- optional label,
- and destination field.

EELForge must not automatically trust pasted AI output. Promotion is a human-controlled provenance action.

### Priority 2: Real version comparison

Implement comparison as a first-class feature rather than restoring Bolt's placeholder.

The comparison should support:

- current project vs. saved version,
- saved version vs. saved version,
- field-level changes,
- contract changes,
- mode/source-artifact changes,
- and compiled-prompt differences.

Large EEL2 scripts should use line-oriented diffing with size safeguards.

### Priority 3: Dashboard intelligence

Add:

- actual active-mode readiness,
- explicit host filter,
- explicit CPU-target filter,
- explicit prompt-mode filter,
- clear-filter action,
- and sorting by updated date, name, readiness, or mode.

### Priority 4: Milestone-based prompt history

Do not record every keystroke. Instead, store compact prompt metadata and optional prompt text when the user:

- saves a version,
- promotes an artifact,
- or explicitly records a milestone.

This preserves the original prompt-history goal without creating unbounded local storage growth.

### Priority 5: Keyboard workflow

Add discoverable, conflict-safe shortcuts for:

- copy prompt,
- export prompt,
- save version,
- new project,
- dashboard navigation,
- and mode switching.

Shortcuts must not fire while the user is typing unless the combination includes a control/meta modifier.

---

## 9. Items deferred beyond v0.3

The following remain valuable but should come after workflow continuity is complete:

- explainable DSP architecture recommendations,
- EEL2 indexing and heuristic static analysis,
- exact EEL_VM or host-backed validation research,
- optional cloud synchronization.

Cloud synchronization remains especially low priority because the user explicitly chose a local-only product. It should not return without a new product decision.

---

## Decision recommendation

Approve **Workflow Continuity and Project Intelligence** as the v0.3 product theme and proceed to a detailed design covering:

1. artifact promotion and provenance,
2. version/prompt comparison,
3. dashboard readiness and filters,
4. milestone-based history,
5. keyboard shortcuts,
6. schema migration and storage budgets,
7. test and portable-release requirements.

No implementation should begin until that design is reviewed and approved.