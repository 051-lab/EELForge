interface FieldProps {
  label: string;
  path: string;
  value: string;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  onChange: (path: string, value: string) => void;
}

export function Field({ label, path, value, textarea, rows, placeholder, hint, onChange }: FieldProps) {
  const id = path.replaceAll('.', '-');
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {textarea ? (
        <textarea
          id={id}
          rows={rows ?? 3}
          placeholder={placeholder ?? ''}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(path, event.target.value)}
        />
      ) : (
        <input
          id={id}
          placeholder={placeholder ?? ''}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(path, event.target.value)}
        />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  path: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (path: string, value: string) => void;
}

export function SelectField({ label, path, value, options, onChange }: SelectFieldProps) {
  const id = path.replaceAll('.', '-');
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onChange(path, event.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CheckFieldProps {
  label: string;
  path: string;
  checked: boolean;
  onChange: (path: string, value: boolean) => void;
}

export function CheckField({ label, path, checked, onChange }: CheckFieldProps) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(path, event.target.checked)}
      />
      {label}
    </label>
  );
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(iso);
  } catch {
    return iso;
  }
}

export function hostLabel(id: string): string {
  const labels: Record<string, string> = {
    'rjdsp-modern': 'RJDSP Modern',
    'rjdsp-legacy': 'RJDSP Legacy',
    'eel-vm-core': 'EEL_VM Core',
  };
  return labels[id] ?? id;
}

export function modeLabel(mode: string): string {
  const labels: Record<string, string> = {
    architect: 'Architect',
    build: 'Build',
    repair: 'Repair',
    refine: 'Refine',
    optimize: 'Optimize',
    review: 'Review',
  };
  return labels[mode] ?? mode;
}
