import { useState } from 'react';
import type { ProjectState } from '../domain';
import { Field } from './Field';

interface VisionPanelProps {
  state: ProjectState;
  onChange: (path: string, value: string) => void;
}

export function VisionPanel({ state, onChange }: VisionPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <article className="panel vision-panel">
      <div className="panel-heading">
        <h2><span>01</span> · Plugin Vision</h2>
      </div>
      <div className="form-stack">
        <Field label="Plugin name" path="name" value={state.name} placeholder="RecordPath" onChange={onChange} />
        <Field label="What should this plugin do?" path="vision.purpose" value={state.vision.purpose} textarea placeholder="Describe its job in one or two clear sentences." onChange={onChange} />
        <Field label="What should it sound like?" path="vision.audibleGoal" value={state.vision.audibleGoal} textarea placeholder="Describe the audible result, character, and intensity." onChange={onChange} />
        <Field label="Where or on what material will it be used?" path="vision.sourceMaterial" value={state.vision.sourceMaterial} textarea placeholder="Full mixes, vocals, drums, system-wide playback…" onChange={onChange} />
        <Field label="What would make the result successful?" path="vision.definitionOfSuccess" value={state.vision.definitionOfSuccess} textarea placeholder="State the audible and technical acceptance criteria." onChange={onChange} />
      </div>
      <details open={advancedOpen} onToggle={(event: React.SyntheticEvent<HTMLDetailsElement>) => setAdvancedOpen(event.currentTarget.open)}>
        <summary>Advanced sonic context</summary>
        <div className="advanced-grid">
          <Field label="Preserve" path="vision.preserve" value={state.vision.preserve} textarea rows={2} placeholder="What must remain intact?" onChange={onChange} />
          <Field label="Avoid" path="vision.avoid" value={state.vision.avoid} textarea rows={2} placeholder="What must the effect never introduce?" onChange={onChange} />
          <Field label="Intended use / insertion point" path="vision.useLocation" value={state.vision.useLocation} placeholder="Master bus, track, system-wide playback…" onChange={onChange} />
          <Field label="Preferred controls" path="vision.desiredControls" value={state.vision.desiredControls} textarea rows={2} placeholder="Drive, Output Trim, Mix; minimal controls preferred." onChange={onChange} />
          <Field label="References / inspiration" path="vision.references" value={state.vision.references} textarea rows={2} placeholder="Plugins, hardware, records, or behavioral references." onChange={onChange} />
        </div>
      </details>
    </article>
  );
}
