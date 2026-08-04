import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hostLabels, type ProjectState, type PromptMode } from './domain';
import { projectExportFilename, promptExportFilename } from './filename';
import { parseProjectImport, ProjectImportError, serializeProjectExport } from './import-export';
import { compilePrompt, modeCompletion } from './prompt';
import { ProjectStore, type StoreResult } from './store';
import { Dashboard } from './components/Dashboard';
import { ContractPanel } from './components/ContractPanel';
import { PromptPanel } from './components/PromptPanel';
import { VersionPanel } from './components/VersionPanel';
import { VisionPanel } from './components/VisionPanel';
import { useToast } from './hooks/useToast';

export interface AppProps {
  store?: ProjectStore;
}

export function App({ store: providedStore }: AppProps = {}) {
  const { message: toastMessage, visible: toastVisible, show: showToast } = useToast();
  const storeRef = useRef<ProjectStore | null>(providedStore ?? null);
  if (!storeRef.current) {
    storeRef.current = new ProjectStore({
      storage: window.localStorage,
      onPersistenceError: showToast,
    });
  }
  const store = storeRef.current;
  const [, forceRender] = useState(0);
  const [view, setView] = useState<'dashboard' | 'workspace'>(store.activeId ? 'workspace' : 'dashboard');

  useEffect(() => store.subscribe(() => forceRender((value) => value + 1)), [store]);

  const activeProject = store.activeProject;
  const activeEntry = store.activeEntry;
  const compiled = useMemo(() => activeProject ? compilePrompt(activeProject) : null, [activeProject]);
  const completion = activeProject ? modeCompletion(activeProject) : { completed: 0, total: 0 };

  const reportResult = useCallback(<T,>(result: StoreResult<T>, success: string): boolean => {
    if (!result.ok) {
      showToast(result.message);
      return false;
    }
    const suffix = result.prunedVersions > 0
      ? ` ${result.prunedVersions} old version${result.prunedVersions === 1 ? '' : 's'} pruned to fit browser storage.`
      : '';
    showToast(`${success}${suffix}`);
    return true;
  }, [showToast]);

  const createProject = useCallback((templateBuild?: () => ProjectState) => {
    const result = store.createProject(templateBuild);
    setView('workspace');
    reportResult(result, 'Project created.');
  }, [reportResult, store]);

  const openProject = useCallback((id: string) => {
    const result = store.openProject(id);
    if (result.ok) setView('workspace');
    else showToast(result.message);
  }, [showToast, store]);

  const deleteProject = useCallback((id: string) => {
    reportResult(store.deleteProject(id), 'Project deleted.');
    if (!store.activeId) setView('dashboard');
  }, [reportResult, store]);

  const duplicateProject = useCallback((id: string) => {
    const result = store.duplicateProject(id);
    if (reportResult(result, 'Project duplicated.')) setView('workspace');
  }, [reportResult, store]);

  const renameProject = useCallback((id: string, name: string) => {
    reportResult(store.renameProject(id, name), 'Project renamed.');
  }, [reportResult, store]);

  const importProject = useCallback(async (file: File) => {
    try {
      const project = parseProjectImport(await file.text());
      const result = store.addImportedProject(project);
      if (reportResult(result, 'Project imported.')) setView('workspace');
    } catch (error) {
      showToast(error instanceof ProjectImportError ? error.message : 'This file is not a recognizable EELForge project.');
    }
  }, [reportResult, showToast, store]);

  const exportProject = useCallback((id?: string) => {
    const project = id
      ? store.entries.find((entry) => entry.project.id === id)?.project
      : store.activeProject;
    if (!project) {
      showToast('Project not found.');
      return;
    }
    try {
      downloadText(serializeProjectExport(project), projectExportFilename(project.name), 'application/json;charset=utf-8');
      showToast('Project exported.');
    } catch {
      showToast('Project export was blocked by the browser.');
    }
  }, [showToast, store]);

  const setPath = useCallback((path: string, value: string | boolean) => {
    const result = store.dispatch({ type: 'set-path', path, value });
    if (!result.ok) showToast(result.message);
  }, [showToast, store]);

  const setVisionPath = useCallback((path: string, value: string) => {
    const result = path === 'name'
      ? store.dispatch({ type: 'set-name', value })
      : store.dispatch({ type: 'set-path', path, value });
    if (!result.ok) showToast(result.message);
  }, [showToast, store]);

  const changeMode = useCallback((mode: PromptMode) => {
    const result = store.dispatch({ type: 'set-prompt-mode', value: mode });
    if (!result.ok) showToast(result.message);
  }, [showToast, store]);

  const copyPrompt = useCallback(async () => {
    if (!store.activeProject) return;
    try {
      await navigator.clipboard.writeText(compilePrompt(store.activeProject).text);
      showToast('Prompt copied to clipboard.');
    } catch {
      showToast('Clipboard access was blocked. Use Export .md instead.');
    }
  }, [showToast, store]);

  const exportPrompt = useCallback(() => {
    const project = store.activeProject;
    if (!project) return;
    try {
      const prompt = compilePrompt(project);
      downloadText(prompt.text, promptExportFilename(project.name, project.promptMode), 'text/markdown;charset=utf-8');
      showToast('Prompt exported.');
    } catch {
      showToast('Prompt export was blocked by the browser.');
    }
  }, [showToast, store]);

  const resetProject = useCallback(() => {
    if (!window.confirm('Reset this project to a blank state while preserving its project identity?')) return;
    reportResult(store.resetActiveProject(), 'Project reset.');
  }, [reportResult, store]);

  const saveVersion = useCallback((label: string) => {
    reportResult(store.saveVersion(label), 'Version saved.');
  }, [reportResult, store]);

  const restoreVersion = useCallback((versionId: string) => {
    if (!window.confirm('Restore this saved version? Current project content will be replaced.')) return;
    reportResult(store.restoreVersion(versionId), 'Version restored.');
  }, [reportResult, store]);

  const dismissOnboarding = useCallback(() => {
    const result = store.dispatch({ type: 'set-path', path: 'onboardingDismissed', value: true });
    if (result.ok) store.flush();
  }, [store]);

  if (view === 'dashboard' || !activeProject || !compiled) {
    return (
      <>
        <div className="sweep" aria-hidden="true" />
        <Header onBrand={() => setView('dashboard')} actions={<button type="button" onClick={() => createProject()}>New Project</button>} />
        <Dashboard
          entries={store.entries}
          onCreate={createProject}
          onOpen={openProject}
          onDelete={deleteProject}
          onDuplicate={duplicateProject}
          onRename={renameProject}
          onExport={exportProject}
          onImport={importProject}
        />
        <Toast message={toastMessage} visible={toastVisible} />
      </>
    );
  }

  const ready = compiled.readiness === 'ready';
  return (
    <>
      <div className="sweep" aria-hidden="true" />
      <Header
        onBrand={() => setView('dashboard')}
        actions={
          <>
            <button type="button" onClick={() => setView('dashboard')}>Dashboard</button>
            <button type="button" onClick={() => exportProject()}>Export</button>
            <button type="button" onClick={resetProject}>Reset</button>
          </>
        }
      />

      {!activeProject.onboardingDismissed && (
        <section className="onboarding" aria-label="EELForge onboarding">
          <h1>Welcome to EELForge</h1>
          <p>Describe an audio effect, compile a structured local handoff, then move through Architect, Build, and iteration modes with any AI agent.</p>
          <div className="onboarding-steps">
            <OnboardingStep number="1" title="Describe the plugin">Complete the vision and sonic boundaries.</OnboardingStep>
            <OnboardingStep number="2" title="Set the runtime contract">Choose the verified host profile, channels, CPU, and latency target.</OnboardingStep>
            <OnboardingStep number="3" title="Compile a handoff">Copy or export the deterministic prompt for your chosen AI platform.</OnboardingStep>
            <OnboardingStep number="4" title="Iterate safely">Use Build, Repair, Refine, Optimize, and Review as the project advances.</OnboardingStep>
          </div>
          <button className="dash-btn primary" type="button" onClick={dismissOnboarding}>Got it, let’s start</button>
        </section>
      )}

      <main className="workspace">
        <section className="column left-column">
          <VisionPanel state={activeProject} onChange={setVisionPath} />
          <ContractPanel state={activeProject} onChange={setPath} />
        </section>
        <section className="column right-column">
          <article className="panel architect-panel">
            <div className="panel-heading">
              <h2><span>03</span> · DSP Handoff</h2>
              <span className={`status ${ready ? 'good' : 'warn'}`}>{ready ? 'READY' : `${completion.completed}/${completion.total}`}</span>
            </div>
            <div className="summary-grid">
              <Summary label="HOST" value={hostLabels[activeProject.contract.hostProfileId]} />
              <Summary label="CHANNELS" value={activeProject.contract.channelMode} />
              <Summary label="CPU" value={activeProject.contract.cpuTarget} />
              <Summary label="LATENCY" value={activeProject.contract.latencyMode} />
            </div>
          </article>

          <PromptPanel
            state={activeProject}
            compiled={compiled}
            onModeChange={changeMode}
            onPathChange={(path, value) => setPath(path, value)}
            onCopy={copyPrompt}
            onExport={exportPrompt}
            onExportProject={() => exportProject()}
            onImportProject={importProject}
            onReset={resetProject}
            onBackToDashboard={() => setView('dashboard')}
          />
          <VersionPanel versions={activeEntry?.versions ?? []} onSave={saveVersion} onRestore={restoreVersion} />
        </section>
      </main>

      <footer>EELForge v0.2 · six local prompt modes · schema 3 · no AI calls · no EEL2 execution</footer>
      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}

function Header({ onBrand, actions }: { onBrand: () => void; actions: React.ReactNode }) {
  return (
    <header className="topbar">
      <button className="brand brand-button" type="button" onClick={onBrand} aria-label="EELForge dashboard">
        <span className="brand-mark">⌁</span><strong>EELFORGE</strong><em>v0.2</em>
      </button>
      <div className="top-actions">{actions}</div>
    </header>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="summary-item"><span>{label}</span><b>{value}</b></div>;
}

function OnboardingStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <div className="onboarding-step"><span>{number}</span><div><h4>{title}</h4><p>{children}</p></div></div>;
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return <div className={`toast ${visible ? 'visible' : ''}`} role="status" aria-live="polite">{message}</div>;
}

function downloadText(content: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
