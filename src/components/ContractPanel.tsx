import type { ProjectState } from '../domain';
import { SelectField, CheckField, Field } from './Field';

interface ContractPanelProps {
  state: ProjectState;
  onChange: (path: string, value: string | boolean) => void;
}

export function ContractPanel({ state, onChange }: ContractPanelProps) {
  return (
    <article className="panel contract-panel">
      <div className="panel-heading">
        <h2><span>02</span> · Implementation Contract</h2>
        <span className="status good">LOCAL-FIRST</span>
      </div>
      <div className="contract-grid">
        <SelectField
          label="Host profile"
          path="contract.hostProfileId"
          value={state.contract.hostProfileId}
          onChange={(p, v) => onChange(p, v)}
          options={[
            { value: 'rjdsp-modern', label: 'RootlessJamesDSP Modern' },
            { value: 'rjdsp-legacy', label: 'RootlessJamesDSP Legacy' },
            { value: 'eel-vm-core', label: 'Generic EEL2 / EEL_VM' },
          ]}
        />
        <SelectField
          label="Channel mode"
          path="contract.channelMode"
          value={state.contract.channelMode}
          onChange={(p, v) => onChange(p, v)}
          options={[
            { value: 'mono', label: 'mono' },
            { value: 'stereo', label: 'stereo' },
            { value: 'linked-stereo', label: 'linked stereo' },
            { value: 'dual-mono', label: 'dual mono' },
            { value: 'mid-side', label: 'mid/side' },
          ]}
        />
        <SelectField
          label="Latency mode"
          path="contract.latencyMode"
          value={state.contract.latencyMode}
          onChange={(p, v) => onChange(p, v)}
          options={[
            { value: 'zero', label: 'zero' },
            { value: 'low', label: 'low' },
            { value: 'allowed', label: 'allowed' },
          ]}
        />
        <SelectField
          label="CPU target"
          path="contract.cpuTarget"
          value={state.contract.cpuTarget}
          onChange={(p, v) => onChange(p, v)}
          options={[
            { value: 'mobile-light', label: 'mobile-light' },
            { value: 'mobile-balanced', label: 'mobile-balanced' },
            { value: 'desktop-quality', label: 'desktop-quality' },
          ]}
        />
        <div className="span-2">
          <Field label="Device targets" path="contract.deviceTargets" value={state.contract.deviceTargets} placeholder="Galaxy S10; Galaxy S24 Ultra" onChange={(p, v) => onChange(p, v)} />
        </div>
        <div className="check-row span-2">
          <CheckField label="Parameter smoothing required" path="contract.parameterSmoothing" checked={state.contract.parameterSmoothing} onChange={(p, v) => onChange(p, v)} />
          <CheckField label="Output protection required" path="contract.outputProtection" checked={state.contract.outputProtection} onChange={(p, v) => onChange(p, v)} />
        </div>
        <div className="span-2">
          <Field label="Additional constraints" path="contract.constraints" value={state.contract.constraints} textarea rows={3} placeholder="Memory limits, frozen controls, prohibited algorithms, or host restrictions." onChange={(p, v) => onChange(p, v)} />
        </div>
      </div>
    </article>
  );
}
