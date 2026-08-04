import {
  PROJECT_SCHEMA_VERSION,
  createDefaultProject,
  type ProjectState,
  type PromptMode,
  type Stage,
} from './domain';
import { isRecord, migrateProject } from './migrations';

export const WORKSPACE_STORAGE_KEY = 'eelforge.projects.v3';
export const LEGACY_STORAGE_KEYS = [
  'eelforge.project.v1',
  'eelforge.project.v2',
  'eelforge.project',
  'eelforge.phase1a.project',
] as const;
export const DEFAULT_STORAGE_BUDGET = 3 * 1024 * 1024;
export const MAX_VERSIONS_PER_PROJECT = 10;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface ProjectVersion {
  id: string;
  savedAt: string;
  snapshot: ProjectState;
  label: string;
}

export interface ProjectEntry {
  project: ProjectState;
  versions: ProjectVersion[];
}

export interface WorkspaceEnvelope {
  schemaVersion: typeof PROJECT_SCHEMA_VERSION;
  activeId: string | null;
  entries: ProjectEntry[];
}

export type StoreResult<T = undefined> =
  | { ok: true; value: T; prunedVersions: number }
  | { ok: false; code: 'quota' | 'storage' | 'not-found'; message: string };

export type StoreAction =
  | { type: 'set-name'; value: string }
  | { type: 'set-path'; path: string; value: unknown }
  | { type: 'set-prompt-mode'; value: PromptMode }
  | { type: 'set-stage'; value: Stage };

export type StoreListener = () => void;
export type Scheduler = (callback: () => void, delay: number) => unknown;

export interface ProjectStoreOptions {
  storage: StorageLike;
  schedule?: Scheduler;
  now?: () => string;
  uuid?: () => string;
  measureBytes?: (value: string) => number;
  budgetBytes?: number;
  onPersistenceError?: (message: string) => void;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function safeNow(value: unknown, fallback: string): string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : fallback;
}

function setNestedPath(state: ProjectState, path: string, value: unknown): ProjectState {
  const next = clone(state);
  const segments = path.split('.').filter(Boolean);
  if (segments.length === 0) return next;

  let cursor = next as unknown as Record<string, unknown>;
  for (const segment of segments.slice(0, -1)) {
    const child = cursor[segment];
    if (!child || typeof child !== 'object' || Array.isArray(child)) return next;
    cursor = child as Record<string, unknown>;
  }
  const leaf = segments.at(-1);
  if (leaf) cursor[leaf] = value;
  return next;
}

function migrateVersion(value: unknown, now: () => string, uuid: () => string): ProjectVersion | null {
  if (!isRecord(value)) return null;
  try {
    return {
      id: typeof value.id === 'string' ? value.id : uuid(),
      savedAt: safeNow(value.savedAt, now()),
      snapshot: migrateProject(value.snapshot),
      label: typeof value.label === 'string' && value.label.trim() ? value.label.trim() : 'Untitled version',
    };
  } catch {
    return null;
  }
}

function migrateEntry(value: unknown, now: () => string, uuid: () => string): ProjectEntry | null {
  if (!isRecord(value)) return null;
  try {
    const project = migrateProject(value.project);
    const versions = Array.isArray(value.versions)
      ? value.versions
          .map((version) => migrateVersion(version, now, uuid))
          .filter((version): version is ProjectVersion => version !== null)
          .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
          .slice(0, MAX_VERSIONS_PER_PROJECT)
      : [];
    return { project, versions };
  } catch {
    return null;
  }
}

function validActiveId(activeId: unknown, entries: ProjectEntry[]): string | null {
  if (typeof activeId === 'string' && entries.some((entry) => entry.project.id === activeId)) return activeId;
  return entries[0]?.project.id ?? null;
}

function parseWorkspace(raw: string, now: () => string, uuid: () => string): WorkspaceEnvelope | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const entries = parsed
        .map((entry) => migrateEntry(entry, now, uuid))
        .filter((entry): entry is ProjectEntry => entry !== null);
      return { schemaVersion: PROJECT_SCHEMA_VERSION, activeId: entries[0]?.project.id ?? null, entries };
    }
    if (!isRecord(parsed) || parsed.schemaVersion !== PROJECT_SCHEMA_VERSION || !Array.isArray(parsed.entries)) {
      return null;
    }
    const entries = parsed.entries
      .map((entry) => migrateEntry(entry, now, uuid))
      .filter((entry): entry is ProjectEntry => entry !== null);
    return {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      activeId: validActiveId(parsed.activeId, entries),
      entries,
    };
  } catch {
    return null;
  }
}

function emptyEnvelope(): WorkspaceEnvelope {
  return { schemaVersion: PROJECT_SCHEMA_VERSION, activeId: null, entries: [] };
}

function globallyOldestVersion(envelope: WorkspaceEnvelope): { entryIndex: number; versionIndex: number } | null {
  let oldestEntry = -1;
  let oldestVersion = -1;
  let oldestTime = Number.POSITIVE_INFINITY;
  for (let entryIndex = 0; entryIndex < envelope.entries.length; entryIndex += 1) {
    const entry = envelope.entries[entryIndex];
    if (!entry) continue;
    for (let versionIndex = 0; versionIndex < entry.versions.length; versionIndex += 1) {
      const version = entry.versions[versionIndex];
      if (!version) continue;
      const parsed = Date.parse(version.savedAt);
      const time = Number.isFinite(parsed) ? parsed : 0;
      if (time < oldestTime) {
        oldestTime = time;
        oldestEntry = entryIndex;
        oldestVersion = versionIndex;
      }
    }
  }
  return oldestEntry >= 0 ? { entryIndex: oldestEntry, versionIndex: oldestVersion } : null;
}

export class ProjectStore {
  readonly #storage: StorageLike;
  readonly #schedule: Scheduler;
  readonly #now: () => string;
  readonly #uuid: () => string;
  readonly #measureBytes: (value: string) => number;
  readonly #budgetBytes: number;
  readonly #onPersistenceError: (message: string) => void;
  #envelope: WorkspaceEnvelope;
  #listeners = new Set<StoreListener>();
  #saveQueued = false;

  constructor(options: ProjectStoreOptions) {
    this.#storage = options.storage;
    this.#schedule = options.schedule ?? ((callback, delay) => globalThis.setTimeout(callback, delay));
    this.#now = options.now ?? (() => new Date().toISOString());
    this.#uuid = options.uuid ?? (() => crypto.randomUUID());
    this.#measureBytes = options.measureBytes ?? ((value) => new TextEncoder().encode(value).byteLength);
    this.#budgetBytes = options.budgetBytes ?? DEFAULT_STORAGE_BUDGET;
    this.#onPersistenceError = options.onPersistenceError ?? (() => undefined);

    const official = this.#storage.getItem(WORKSPACE_STORAGE_KEY);
    const loaded = official ? parseWorkspace(official, this.#now, this.#uuid) : null;
    if (loaded) {
      this.#envelope = loaded;
      return;
    }

    this.#envelope = this.#loadLegacyWorkspace();
    if (this.#envelope.entries.length > 0) this.#persistCurrent(false);
  }

  get envelope(): WorkspaceEnvelope {
    return clone(this.#envelope);
  }

  get entries(): readonly ProjectEntry[] {
    return this.#envelope.entries;
  }

  get activeId(): string | null {
    return this.#envelope.activeId;
  }

  get activeEntry(): ProjectEntry | null {
    return this.#envelope.entries.find((entry) => entry.project.id === this.#envelope.activeId) ?? null;
  }

  get activeProject(): ProjectState | null {
    return this.activeEntry?.project ?? null;
  }

  subscribe(listener: StoreListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  createProject(template?: () => ProjectState): StoreResult<string> {
    const now = this.#now();
    const generatedId = this.#uuid();
    const source = template ? template() : createDefaultProject({ id: generatedId, now });
    const project = migrateProject(source);
    project.id = generatedId;
    project.createdAt = now;
    project.updatedAt = now;
    const next = this.envelope;
    next.entries.unshift({ project, versions: [] });
    next.activeId = project.id;
    return this.#applyImmediate(next, project.id);
  }

  addImportedProject(project: ProjectState): StoreResult<string> {
    const next = this.envelope;
    next.entries.unshift({ project: clone(project), versions: [] });
    next.activeId = project.id;
    return this.#applyImmediate(next, project.id);
  }

  openProject(id: string): StoreResult {
    if (!this.#envelope.entries.some((entry) => entry.project.id === id)) return this.#notFound('Project not found.');
    const next = this.envelope;
    next.activeId = id;
    return this.#applyImmediate(next, undefined);
  }

  deleteProject(id: string): StoreResult {
    if (!this.#envelope.entries.some((entry) => entry.project.id === id)) return this.#notFound('Project not found.');
    const next = this.envelope;
    next.entries = next.entries.filter((entry) => entry.project.id !== id);
    if (next.activeId === id) next.activeId = next.entries[0]?.project.id ?? null;
    return this.#applyImmediate(next, undefined);
  }

  duplicateProject(id: string): StoreResult<string> {
    const sourceIndex = this.#envelope.entries.findIndex((entry) => entry.project.id === id);
    if (sourceIndex < 0) return this.#notFound('Project not found.');
    const now = this.#now();
    const copy = clone(this.#envelope.entries[sourceIndex]!.project);
    copy.id = this.#uuid();
    copy.name = `${copy.name || 'Untitled EEL Effect'} (copy)`;
    copy.createdAt = now;
    copy.updatedAt = now;
    const next = this.envelope;
    next.entries.splice(sourceIndex + 1, 0, { project: copy, versions: [] });
    next.activeId = copy.id;
    return this.#applyImmediate(next, copy.id);
  }

  renameProject(id: string, name: string): StoreResult {
    const next = this.envelope;
    const entry = next.entries.find((candidate) => candidate.project.id === id);
    if (!entry) return this.#notFound('Project not found.');
    entry.project.name = name;
    entry.project.updatedAt = this.#now();
    return this.#applyImmediate(next, undefined);
  }

  resetActiveProject(): StoreResult {
    const next = this.envelope;
    const entry = next.entries.find((candidate) => candidate.project.id === next.activeId);
    if (!entry) return this.#notFound('No active project to reset.');
    const current = entry.project;
    const reset = createDefaultProject({ id: current.id, now: this.#now() });
    reset.createdAt = current.createdAt;
    reset.onboardingDismissed = current.onboardingDismissed;
    entry.project = reset;
    return this.#applyImmediate(next, undefined);
  }

  saveVersion(label: string): StoreResult<string> {
    const next = this.envelope;
    const entry = next.entries.find((candidate) => candidate.project.id === next.activeId);
    if (!entry) return this.#notFound('No active project to version.');
    const version: ProjectVersion = {
      id: this.#uuid(),
      savedAt: this.#now(),
      snapshot: clone(entry.project),
      label: label.trim() || `Version ${entry.versions.length + 1}`,
    };
    entry.versions = [version, ...entry.versions]
      .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
      .slice(0, MAX_VERSIONS_PER_PROJECT);
    return this.#applyImmediate(next, version.id);
  }

  restoreVersion(versionId: string): StoreResult {
    const next = this.envelope;
    const entry = next.entries.find((candidate) => candidate.project.id === next.activeId);
    if (!entry) return this.#notFound('No active project to restore.');
    const version = entry.versions.find((candidate) => candidate.id === versionId);
    if (!version) return this.#notFound('Saved version not found.');
    const current = entry.project;
    entry.project = {
      ...clone(version.snapshot),
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: this.#now(),
      onboardingDismissed: current.onboardingDismissed,
    };
    return this.#applyImmediate(next, undefined);
  }

  dispatch(action: StoreAction): StoreResult {
    const next = this.envelope;
    const entry = next.entries.find((candidate) => candidate.project.id === next.activeId);
    if (!entry) return this.#notFound('No active project.');
    const now = this.#now();
    switch (action.type) {
      case 'set-name':
        entry.project.name = action.value;
        break;
      case 'set-path':
        entry.project = setNestedPath(entry.project, action.path, action.value);
        break;
      case 'set-prompt-mode':
        entry.project.promptMode = action.value;
        entry.project.activeStage = action.value === 'architect' ? 'architect' : action.value === 'build' ? 'build' : 'iterate';
        break;
      case 'set-stage':
        entry.project.activeStage = action.value;
        break;
      default: {
        const exhaustive: never = action;
        throw new Error(`Unhandled store action: ${JSON.stringify(exhaustive)}`);
      }
    }
    entry.project.updatedAt = now;
    this.#envelope = next;
    this.#notify();
    this.#queueSave();
    return { ok: true, value: undefined, prunedVersions: 0 };
  }

  flush(): StoreResult {
    this.#saveQueued = false;
    return this.#persistCurrent(true);
  }

  #loadLegacyWorkspace(): WorkspaceEnvelope {
    for (const key of LEGACY_STORAGE_KEYS) {
      const raw = this.#storage.getItem(key);
      if (!raw) continue;
      try {
        const parsed: unknown = JSON.parse(raw);
        const project = migrateProject(parsed);
        return {
          schemaVersion: PROJECT_SCHEMA_VERSION,
          activeId: project.id,
          entries: [{ project, versions: [] }],
        };
      } catch {
        // Skip malformed legacy values and continue checking recovery keys.
      }
    }
    return emptyEnvelope();
  }

  #queueSave(): void {
    if (this.#saveQueued) return;
    this.#saveQueued = true;
    this.#schedule(() => {
      const result = this.flush();
      if (!result.ok) this.#onPersistenceError(result.message);
    }, 120);
  }

  #applyImmediate<T>(next: WorkspaceEnvelope, value: T): StoreResult<T> {
    this.#envelope = next;
    this.#notify();
    const persisted = this.#persistCurrent(true);
    if (!persisted.ok) return persisted;
    return { ok: true, value, prunedVersions: persisted.prunedVersions };
  }

  #persistCurrent(reportError: boolean): StoreResult {
    const candidate = this.envelope;
    let serialized = JSON.stringify(candidate);
    let prunedVersions = 0;

    while (this.#measureBytes(serialized) > this.#budgetBytes) {
      const oldest = globallyOldestVersion(candidate);
      if (!oldest) {
        const message = 'Browser storage is full. Export your projects and remove content or old projects before continuing.';
        if (reportError) this.#onPersistenceError(message);
        return { ok: false, code: 'quota', message };
      }
      candidate.entries[oldest.entryIndex]!.versions.splice(oldest.versionIndex, 1);
      prunedVersions += 1;
      serialized = JSON.stringify(candidate);
    }

    try {
      this.#storage.setItem(WORKSPACE_STORAGE_KEY, serialized);
      this.#envelope = candidate;
      if (prunedVersions > 0) this.#notify();
      return { ok: true, value: undefined, prunedVersions };
    } catch (error) {
      const quota = error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      const message = quota
        ? 'Browser storage is full. Export your projects and delete old versions before continuing.'
        : 'EELForge could not save to browser storage. Your current in-memory work is still available; export it before closing the page.';
      if (reportError) this.#onPersistenceError(message);
      return { ok: false, code: quota ? 'quota' : 'storage', message };
    }
  }

  #notFound(message: string): StoreResult<never> {
    return { ok: false, code: 'not-found', message };
  }

  #notify(): void {
    for (const listener of this.#listeners) listener();
  }
}
