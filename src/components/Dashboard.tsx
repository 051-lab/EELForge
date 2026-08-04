import { useState } from 'react';
import type { ProjectState } from '../domain';
import type { ProjectEntry } from '../store';
import { templates } from '../templates';
import { formatRelative, hostLabel, modeLabel } from './Field';

interface DashboardProps {
  entries: readonly ProjectEntry[];
  onCreate: (templateBuild?: () => ProjectState) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onExport: (id: string) => void;
  onImport: (file: File) => void;
}

export function Dashboard(props: DashboardProps) {
  const [search, setSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const normalized = search.trim().toLowerCase();
  const filtered = props.entries.filter((entry) => !normalized || [
    entry.project.name,
    entry.project.vision.purpose,
    hostLabel(entry.project.contract.hostProfileId),
    modeLabel(entry.project.promptMode),
  ].some((value) => value.toLowerCase().includes(normalized)));
  const pendingDelete = props.entries.find((entry) => entry.project.id === deleteTarget)?.project ?? null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) props.onImport(file);
    event.target.value = '';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div><h1>EELForge Projects</h1><p>Describe the sound, formalize the DSP, build the EEL2.</p></div>
        <div className="dashboard-actions">
          <button className="dash-btn" type="button" onClick={() => setShowTemplates(true)}>Templates</button>
          <label className="dash-btn inline-file-button">Import<input type="file" accept="application/json,.json" hidden onChange={handleFileChange} /></label>
          <button className="dash-btn primary" type="button" onClick={() => props.onCreate()}>New Project</button>
        </div>
      </div>

      <div className="search-bar">
        <input aria-label="Search projects" type="search" placeholder="Search projects by name, purpose, host, or mode..." value={search} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2>{normalized ? 'No matching projects' : 'No projects yet'}</h2>
          <p>{normalized ? 'Try a different search term.' : 'Create a blank project or start from a DSP template.'}</p>
          {!normalized && <button className="dash-btn primary" type="button" onClick={() => setShowTemplates(true)}>Browse Templates</button>}
        </div>
      ) : (
        <div className="project-grid">
          {filtered.map((entry) => (
            <article key={entry.project.id} className="project-card" onClick={() => props.onOpen(entry.project.id)}>
              <h3>{entry.project.name || 'Untitled EEL Effect'}</h3>
              <p className="project-purpose">{entry.project.vision.purpose || 'No purpose set yet.'}</p>
              <div className="meta">
                <span>{modeLabel(entry.project.promptMode)}</span>
                <span>{hostLabel(entry.project.contract.hostProfileId)}</span>
                <span>{entry.project.contract.cpuTarget}</span>
                {entry.versions.length > 0 && <span className="ready">{entry.versions.length} version{entry.versions.length === 1 ? '' : 's'}</span>}
              </div>
              <div className="date">Updated {formatRelative(entry.project.updatedAt)}</div>
              <div className="card-actions" onClick={(event: React.MouseEvent<HTMLElement>) => event.stopPropagation()}>
                <button type="button" onClick={() => props.onOpen(entry.project.id)}>Open</button>
                <button type="button" onClick={() => {
                  const name = prompt('Rename project:', entry.project.name || 'Untitled EEL Effect');
                  if (name !== null) props.onRename(entry.project.id, name);
                }}>Rename</button>
                <button type="button" onClick={() => props.onDuplicate(entry.project.id)}>Duplicate</button>
                <button type="button" onClick={() => props.onExport(entry.project.id)}>Export</button>
                <button type="button" className="danger" onClick={() => setDeleteTarget(entry.project.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showTemplates && (
        <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Project templates" onClick={(event: React.MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <h2>Start from a Template</h2>
            <p>Templates are editable starter briefs, not validated DSP specifications.</p>
            <div className="template-grid">
              {templates.map((template) => (
                <button key={template.id} type="button" className="template-card" onClick={() => { props.onCreate(template.build); setShowTemplates(false); }}>
                  <h4>{template.name}</h4><p>{template.description}</p>
                </button>
              ))}
            </div>
            <div className="modal-actions"><button type="button" onClick={() => setShowTemplates(false)}>Cancel</button></div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Delete project" onClick={(event: React.MouseEvent<HTMLElement>) => event.stopPropagation()}>
            <h2>Delete “{pendingDelete.name || 'Untitled EEL Effect'}”?</h2>
            <p>This permanently removes the project and its saved versions from this browser.</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="danger" onClick={() => { props.onDelete(pendingDelete.id); setDeleteTarget(null); }}>Delete Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
