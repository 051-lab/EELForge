import './styles.css';
import {
  hostLabels,
  stages,
  type CpuTarget,
  type HostProfileId,
  type LatencyMode,
  type ProjectState,
} from './domain.js';
import { architectExportFilename, projectExportFilename } from './filename.js';
import { migrateProject } from './migrations.js';
import { architectCompletion, compilePrompt } from './prompt.js';
import { loadStoredProject, ProjectStore } from './store.js';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('EELForge requires an #app element.');
const appRoot: HTMLDivElement = app;

const store = new ProjectStore(loadStoredProject(localStorage), localStorage);
let advancedOpen = false;
let toastTimer: number | undefined;

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function option(value: string, current: string, label = value): string {
  return `<option value="${escapeHtml(value)}"${value === current ? ' selected' : ''}>${escapeHtml(label)}</option>`;
}

function field(
  label: string,
  path: string,
  value: string,
  options: { textarea?: boolean; rows?: number; placeholder?: string; hint?: string } = {},
): string {
  const id = path.replaceAll('.', '-');
  const control = options.textarea
    ? `<textarea id="${id}" data-path="${path}" rows="${options.rows ?? 3}" placeholder="${escapeHtml(options.placeholder ?? '')}">${escapeHtml(value)}</textarea>`
    : `<input id="${id}" data-path="${path}" value="${escapeHtml(value)}" placeholder="${escapeHtml(options.placeholder ?? '')}" />`;
  return `<label class="field" for="${id}"><span>${escapeHtml(label)}</span>${control}${options.hint ? `<small>${escapeHtml(options.hint)}</small>` : ''}</label>`;
}

function renderStageRail(state: ProjectState): string {
  return stages.map((stage, index) => {
    const active = stage === state.activeStage;
    return `<div class="stage${active ? ' active' : ''}"><span>${index + 1}</span><b>${stage}</b></div>${index < stages.length - 1 ? '<i></i>' : ''}`;
  }).join('');
}

function renderPromptModes(): string {
  const modes = [
    ['architect', 'Architect', 'active'],
    ['build', 'Build', 'next'],
    ['repair', 'Repair', 'locked'],
    ['refine', 'Refine', 'locked'],
    ['optimize', 'Optimize', 'locked'],
    ['review', 'Review', 'locked'],
  ] as const;

  return modes.map(([id, label, state]) => {
    const disabled = id !== 'architect';
    const suffix = state === 'next' ? '<small>NEXT</small>' : state === 'locked' ? '<small>PHASE 2B+</small>' : '';
    return `<button class="mode-tab ${state}" data-mode="${id}"${disabled ? ' disabled' : ''}>${label}${suffix}</button>`;
  }).join('');
}

function render(state: ProjectState): void {
  const compiled = compilePrompt(state);
  const completion = architectCompletion(state);
  const ready = compiled.readiness === 'ready';
  const missingLabel = compiled.missingRequiredFields.length
    ? `${compiled.missingRequiredFields.length} required ${compiled.missingRequiredFields.length === 1 ? 'field' : 'fields'} missing`
    : 'ready';

  appRoot.innerHTML = `
    <div class="sweep"></div>
    <header class="topbar">
      <div class="brand">
        <div><span class="brand-mark">⌁</span><strong>EELFORGE</strong><em>v0.1</em></div>
        <p>Describe the sound · formalize the DSP · build the EEL2</p>
      </div>
      <nav class="stage-rail" aria-label="Development workflow">${renderStageRail(state)}</nav>
      <div class="top-actions">
        <button id="export-project">Export</button>
        <button id="import-project">Import</button>
        <button id="reset-project">Reset</button>
        <input id="project-file" type="file" accept="application/json,.json" hidden />
      </div>
    </header>

    <main class="workspace">
      <section class="column left-column">
        <article class="panel vision-panel">
          <div class="panel-heading">
            <h2><span>01</span> · Plugin Vision</h2>
            <span id="completion-status" class="status ${ready ? 'good' : ''}">${ready ? 'READY FOR ARCHITECT' : `${completion.completed}/${completion.total} essential fields`}</span>
          </div>
          <div class="form-stack">
            ${field('Plugin name', 'name', state.name, { placeholder: 'RecordPath' })}
            ${field('What should this plugin do?', 'vision.purpose', state.vision.purpose, { textarea: true, placeholder: 'Describe its job in one or two clear sentences.' })}
            ${field('What should it sound like?', 'vision.audibleGoal', state.vision.audibleGoal, { textarea: true, placeholder: 'Describe the audible result, character, and intensity.' })}
            ${field('Where or on what material will it be used?', 'vision.sourceMaterial', state.vision.sourceMaterial, { textarea: true, placeholder: 'Full mixes, vocals, drums, system-wide playback…' })}
            ${field('What would make the result successful?', 'vision.definitionOfSuccess', state.vision.definitionOfSuccess, { textarea: true, placeholder: 'State the audible and technical acceptance criteria.' })}
          </div>
          <details id="advanced-context"${advancedOpen ? ' open' : ''}>
            <summary>Advanced sonic context</summary>
            <div class="advanced-grid">
              ${field('Preserve', 'vision.preserve', state.vision.preserve, { textarea: true, rows: 2, placeholder: 'What must remain intact?' })}
              ${field('Avoid', 'vision.avoid', state.vision.avoid, { textarea: true, rows: 2, placeholder: 'What must the effect never introduce?' })}
              ${field('Intended use / insertion point', 'vision.useLocation', state.vision.useLocation, { placeholder: 'Master bus, track, system-wide playback…' })}
              ${field('Preferred controls', 'vision.desiredControls', state.vision.desiredControls, { textarea: true, rows: 2, placeholder: 'Drive, Output Trim, Mix; minimal controls preferred.' })}
              ${field('References / inspiration', 'vision.references', state.vision.references, { textarea: true, rows: 2, placeholder: 'Plugins, hardware, records, or behavioral references.' })}
            </div>
          </details>
        </article>

        <article class="panel contract-panel">
          <div class="panel-heading">
            <h2><span>02</span> · Implementation Contract</h2>
            <span class="status good">LOCAL-FIRST</span>
          </div>
          <div class="contract-grid">
            <label class="field"><span>Host profile</span><select data-path="contract.hostProfileId">
              ${option('rjdsp-modern', state.contract.hostProfileId, 'RootlessJamesDSP Modern')}
              ${option('rjdsp-legacy', state.contract.hostProfileId, 'RootlessJamesDSP Legacy')}
              ${option('eel-vm-core', state.contract.hostProfileId, 'Generic EEL2 / EEL_VM')}
            </select></label>
            <label class="field"><span>Channel mode</span><select data-path="contract.channelMode">
              ${option('mono', state.contract.channelMode)}
              ${option('stereo', state.contract.channelMode)}
              ${option('linked-stereo', state.contract.channelMode, 'linked stereo')}
              ${option('dual-mono', state.contract.channelMode, 'dual mono')}
              ${option('mid-side', state.contract.channelMode, 'mid/side')}
            </select></label>
            <label class="field"><span>Latency mode</span><select data-path="contract.latencyMode">
              ${option('zero', state.contract.latencyMode)}
              ${option('low', state.contract.latencyMode)}
              ${option('allowed', state.contract.latencyMode)}
            </select></label>
            <label class="field"><span>CPU target</span><select data-path="contract.cpuTarget">
              ${option('mobile-light', state.contract.cpuTarget)}
              ${option('mobile-balanced', state.contract.cpuTarget)}
              ${option('desktop-quality', state.contract.cpuTarget)}
            </select></label>
            <div class="span-2">${field('Device targets', 'contract.deviceTargets', state.contract.deviceTargets, { placeholder: 'Galaxy S10; Galaxy S24 Ultra' })}</div>
            <div class="check-row span-2">
              <label><input type="checkbox" data-path="contract.parameterSmoothing"${state.contract.parameterSmoothing ? ' checked' : ''} /> Parameter smoothing required</label>
              <label><input type="checkbox" data-path="contract.outputProtection"${state.contract.outputProtection ? ' checked' : ''} /> Output protection required</label>
            </div>
            <div class="span-2">${field('Additional constraints', 'contract.constraints', state.contract.constraints, { textarea: true, rows: 3, placeholder: 'Memory limits, frozen controls, prohibited algorithms, or host restrictions.' })}</div>
          </div>
        </article>
      </section>

      <section class="column right-column">
        <article class="panel architect-panel">
          <div class="panel-heading">
            <h2><span>03</span> · DSP Architect</h2>
            <span class="status warn">PHASE 3 ENGINE PENDING</span>
          </div>
          <div class="flow-strip">
            <div><b>INPUT</b><small>Vision and constraints</small></div><i>→</i>
            <div><b>INTERPRET</b><small>Traits and weighted signals</small></div><i>→</i>
            <div><b>CHAIN</b><small>Explainable DSP blocks</small></div>
          </div>
          <p class="panel-copy">The current release compiles a dependable Architect handoff. Phase 3 will add a visible recommendation ledger with CPU and latency conflicts.</p>
          <div class="summary-grid">
            <div><span>HOST</span><b id="summary-host">${escapeHtml(hostLabels[state.contract.hostProfileId])}</b></div>
            <div><span>CHANNELS</span><b id="summary-channels">${escapeHtml(state.contract.channelMode)}</b></div>
            <div><span>CPU</span><b id="summary-cpu">${escapeHtml(state.contract.cpuTarget)}</b></div>
            <div><span>LATENCY</span><b id="summary-latency">${escapeHtml(state.contract.latencyMode)}</b></div>
          </div>
        </article>

        <article class="panel prompt-panel">
          <div class="mode-tabs" aria-label="Prompt modes">${renderPromptModes()}</div>
          <div class="terminal-heading">
            <div><span class="live-dot"></span><strong>ARCHITECT HANDOFF</strong></div>
            <div class="prompt-meta">
              <span id="prompt-readiness" class="${ready ? 'ready' : 'draft'}">${escapeHtml(missingLabel.toUpperCase())}</span>
              <span id="prompt-character-count">${compiled.characterCount.toLocaleString()} chars</span>
            </div>
          </div>
          <div id="missing-fields" class="missing-fields"${ready ? ' hidden' : ''}>Missing: ${escapeHtml(compiled.missingRequiredFields.join(', '))}</div>
          <pre id="prompt-output">${escapeHtml(compiled.text)}</pre>
          <div class="terminal-actions">
            <button id="copy-prompt" class="primary">Copy prompt</button>
            <button id="export-prompt">Export .md</button>
          </div>
        </article>

        <article class="panel chain-panel">
          <div class="panel-heading">
            <h2><span>04</span> · Development Chain</h2>
            <span class="status warn">EMPTY</span>
          </div>
          <div class="chain-flow">
            <div><b>VISION</b><small>Current project contract</small></div><i>→</i>
            <div><b>PROMPT</b><small>Phase 2 compiled task</small></div><i>→</i>
            <div><b>EEL2</b><small>Phase 4 imported artifact</small></div>
          </div>
        </article>
      </section>
    </main>

    <footer>Phase 2A · Architect Handoff · focus-safe text entry · schema-migrated local save</footer>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;

  bindEvents();
}

function updateDerivedViews(): void {
  const state = store.getState();
  const compiled = compilePrompt(state);
  const completion = architectCompletion(state);
  const ready = compiled.readiness === 'ready';

  const completionStatus = document.querySelector<HTMLElement>('#completion-status');
  if (completionStatus) {
    completionStatus.textContent = ready ? 'READY FOR ARCHITECT' : `${completion.completed}/${completion.total} essential fields`;
    completionStatus.classList.toggle('good', ready);
  }

  const promptOutput = document.querySelector<HTMLElement>('#prompt-output');
  if (promptOutput) promptOutput.textContent = compiled.text;

  const charCount = document.querySelector<HTMLElement>('#prompt-character-count');
  if (charCount) charCount.textContent = `${compiled.characterCount.toLocaleString()} chars`;

  const readiness = document.querySelector<HTMLElement>('#prompt-readiness');
  if (readiness) {
    readiness.textContent = ready ? 'READY' : `${compiled.missingRequiredFields.length} REQUIRED ${compiled.missingRequiredFields.length === 1 ? 'FIELD' : 'FIELDS'} MISSING`;
    readiness.className = ready ? 'ready' : 'draft';
  }

  const missing = document.querySelector<HTMLElement>('#missing-fields');
  if (missing) {
    missing.hidden = ready;
    missing.textContent = ready ? '' : `Missing: ${compiled.missingRequiredFields.join(', ')}`;
  }
}

function bindEvents(): void {
  document.querySelector<HTMLInputElement>('[data-path="name"]')?.addEventListener('input', (event) => {
    store.dispatch({ type: 'set-name', value: (event.currentTarget as HTMLInputElement).value }, false);
    updateDerivedViews();
  });

  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-path]:not([data-path="name"])').forEach((element) => {
    const isCheckbox = element instanceof HTMLInputElement && element.type === 'checkbox';
    const isTextEntry = element instanceof HTMLTextAreaElement || (element instanceof HTMLInputElement && !isCheckbox);
    const eventName = isCheckbox || element instanceof HTMLSelectElement ? 'change' : 'input';

    element.addEventListener(eventName, () => {
      const path = element.dataset.path;
      if (!path) return;
      const value = isCheckbox && element instanceof HTMLInputElement ? element.checked : element.value;
      store.dispatch({ type: 'set-path', path, value }, !isTextEntry);
      if (isTextEntry) updateDerivedViews();
    });
  });

  document.querySelector<HTMLDetailsElement>('#advanced-context')?.addEventListener('toggle', (event) => {
    advancedOpen = (event.currentTarget as HTMLDetailsElement).open;
  });

  document.querySelector<HTMLButtonElement>('#copy-prompt')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(compilePrompt(store.getState()).text);
      showToast('Architect handoff copied');
    } catch {
      showToast('Clipboard access was blocked');
    }
  });

  document.querySelector<HTMLButtonElement>('#export-prompt')?.addEventListener('click', () => {
    const state = store.getState();
    download(new Blob([compilePrompt(state).text], { type: 'text/markdown;charset=utf-8' }), architectExportFilename(state.name));
    showToast('Architect handoff exported');
  });

  document.querySelector<HTMLButtonElement>('#export-project')?.addEventListener('click', () => {
    const state = store.getState();
    download(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' }), projectExportFilename(state.name));
    showToast('Project exported');
  });

  const projectInput = document.querySelector<HTMLInputElement>('#project-file');
  document.querySelector<HTMLButtonElement>('#import-project')?.addEventListener('click', () => projectInput?.click());
  projectInput?.addEventListener('change', async () => {
    const file = projectInput.files?.[0];
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const migrated = migrateProject(parsed);
      if (!confirm(`Replace the current project with “${migrated.name || 'Untitled EEL Effect'}”?`)) return;
      store.dispatch({ type: 'replace', value: migrated });
      showToast('Project imported and migrated');
    } catch {
      showToast('That file is not a valid EELForge project');
    } finally {
      projectInput.value = '';
    }
  });

  document.querySelector<HTMLButtonElement>('#reset-project')?.addEventListener('click', () => {
    if (!confirm('Reset EELForge and clear the current local project?')) return;
    advancedOpen = false;
    store.dispatch({ type: 'reset' });
    showToast('Project reset');
  });
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLElement>('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2200);
}

store.subscribe(render);
render(store.getState());
