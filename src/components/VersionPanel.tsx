import type { ProjectVersion } from '../store';
import { formatRelative } from './Field';

interface VersionPanelProps {
  versions: ProjectVersion[];
  onSave: (label: string) => void;
  onRestore: (versionId: string) => void;
}

export function VersionPanel({ versions, onSave, onRestore }: VersionPanelProps) {
  const handleSave = () => {
    const label = prompt('Version label:', `Version ${versions.length + 1}`);
    if (label) onSave(label);
  };

  return (
    <article className="panel version-panel">
      <div className="panel-heading">
        <h2><span>04</span> · Version History</h2>
        <button
          className="dash-btn"
          style={{ padding: '6px 12px', fontSize: '10px' }}
          onClick={handleSave}
        >
          Save Version
        </button>
      </div>
      <div className="version-list">
        {versions.length === 0 ? (
          <p style={{ color: 'var(--faint)', fontSize: '11px', textAlign: 'center', padding: '16px 0' }}>
            No saved versions yet. Click "Save Version" to snapshot the current project state.
          </p>
        ) : (
          versions.map((v) => (
            <div key={v.id} className="version-item">
              <div className="info">
                <span className="label">{v.label}</span>
                <span className="date">{formatRelative(v.savedAt)} · {v.snapshot.promptMode}</span>
              </div>
              <button onClick={() => onRestore(v.id)}>Restore</button>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
