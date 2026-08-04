import type { ProjectState, PromptMode } from '../domain';
import type { CompiledPrompt } from '../prompt';
import { Field } from './Field';

interface PromptPanelProps {
  state: ProjectState;
  compiled: CompiledPrompt;
  onModeChange: (mode: PromptMode) => void;
  onPathChange: (path: string, value: string) => void;
  onCopy: () => void;
  onExport: () => void;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
  onReset: () => void;
  onBackToDashboard: () => void;
}

const MODE_TABS: readonly { id: PromptMode; label: string }[] = [
  { id: 'architect', label: 'Architect' },
  { id: 'build', label: 'Build' },
  { id: 'repair', label: 'Repair' },
  { id: 'refine', label: 'Refine' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'review', label: 'Review' },
];

const MODE_FIELDS: Readonly<Record<PromptMode, readonly { label: string; path: keyof ProjectState; placeholder: string; rows: number }[]>> = {
  architect: [],
  build: [
    { label: 'Approved architecture report', path: 'architectureReport', placeholder: 'Paste the reviewed architecture report here.', rows: 8 },
  ],
  repair: [
    { label: 'Current EEL2 script', path: 'eel2Script', placeholder: 'Paste the complete EEL2 script that needs repair.', rows: 12 },
    { label: 'Problem description', path: 'iterationNote', placeholder: 'Describe the defect, when it occurs, and the intended behavior.', rows: 5 },
  ],
  refine: [
    { label: 'Current EEL2 script', path: 'eel2Script', placeholder: 'Paste the working EEL2 script to refine.', rows: 12 },
    { label: 'Refinement goal', path: 'iterationNote', placeholder: 'Describe the exact audible or behavioral change while preserving accepted behavior.', rows: 5 },
  ],
  optimize: [
    { label: 'Current EEL2 script', path: 'eel2Script', placeholder: 'Paste the complete EEL2 script to optimize.', rows: 12 },
    { label: 'Optimization notes (optional)', path: 'iterationNote', placeholder: 'Specify CPU, memory, or latency priorities, or leave blank for a general pass.', rows: 5 },
  ],
  review: [
    { label: 'EEL2 script to review', path: 'eel2Script', placeholder: 'Paste the complete EEL2 script for review.', rows: 12 },
  ],
};

export function PromptPanel(props: PromptPanelProps) {
  const { state, compiled } = props;
  const ready = compiled.readiness === 'ready';
  const completed = compiled.requiredFields.filter((field) => field.filled).length;
  const total = compiled.requiredFields.length;
  const modeFields = MODE_FIELDS[state.promptMode];

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) props.onImportProject(file);
    event.target.value = '';
  };

  return (
    <article className="panel prompt-panel">
      <div className="mode-tabs" aria-label="Prompt modes">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`mode-tab ${state.promptMode === tab.id ? 'active' : ''}`}
            aria-pressed={state.promptMode === tab.id}
            onClick={() => props.onModeChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="terminal-heading">
        <div><span className="live-dot" /><strong>{compiled.title.toUpperCase()}</strong></div>
        <div className="prompt-meta">
          <span className={ready ? 'ready' : 'draft'}>{ready ? 'READY' : `${compiled.missingRequiredFields.length} MISSING`}</span>
          <span>{compiled.characterCount.toLocaleString()} chars</span>
        </div>
      </div>

      <div className="readiness-bar">
        <div className="bar-bg"><div className="bar-fill" style={{ width: `${total ? (completed / total) * 100 : 100}%` }} /></div>
        <div className="bar-label"><span>{completed} of {total} required fields</span><span>{state.promptMode}</span></div>
      </div>
      {!ready && <div className="missing-fields">Missing: {compiled.missingRequiredFields.join(', ')}</div>}

      {modeFields.length > 0 && (
        <div className="form-stack mode-inputs">
          {modeFields.map((field) => (
            <Field
              key={`${state.promptMode}-${field.path}`}
              label={field.label}
              path={field.path}
              value={String(state[field.path] ?? '')}
              textarea
              rows={field.rows}
              placeholder={field.placeholder}
              onChange={props.onPathChange}
            />
          ))}
        </div>
      )}

      <pre data-testid="compiled-prompt">{compiled.text}</pre>
      <div className="terminal-actions">
        <button type="button" className="primary" onClick={props.onCopy}>Copy prompt</button>
        <button type="button" onClick={props.onExport}>Export .md</button>
        <button type="button" onClick={props.onExportProject}>Export Project</button>
        <label className="inline-file-button">
          Import Project
          <input type="file" accept="application/json,.json" hidden onChange={handleFileImport} />
        </label>
        <button type="button" onClick={props.onReset}>Reset</button>
        <button type="button" onClick={props.onBackToDashboard}>Dashboard</button>
      </div>
    </article>
  );
}
