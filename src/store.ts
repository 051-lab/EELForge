import { createDefaultProject, type ProjectState, type PromptMode } from './domain.js';
import { migrateProject } from './migrations.js';

export const STORAGE_KEY = 'eelforge.project.v2';
export const LEGACY_STORAGE_KEYS = ['eelforge.project', 'eelforge.phase1a.project'] as const;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export type StoreAction =
  | { type: 'set-name'; value: string }
  | { type: 'set-path'; path: string; value: unknown }
  | { type: 'set-prompt-mode'; value: PromptMode }
  | { type: 'replace'; value: ProjectState }
  | { type: 'reset' };

export type StoreListener = (state: ProjectState) => void;
export type Scheduler = (callback: () => void, delay?: number) => unknown;

function cloneState(state: ProjectState): ProjectState {
  return structuredClone(state);
}

function setNestedPath(state: ProjectState, path: string, value: unknown): ProjectState {
  const next = cloneState(state);
  const segments = path.split('.').filter(Boolean);
  if (!segments.length) return next;

  let cursor: Record<string, unknown> = next as unknown as Record<string, unknown>;
  for (const segment of segments.slice(0, -1)) {
    const child = cursor[segment];
    if (!child || typeof child !== 'object' || Array.isArray(child)) return next;
    cursor = child as Record<string, unknown>;
  }

  const leaf = segments.at(-1);
  if (leaf) cursor[leaf] = value;
  return next;
}

export function loadStoredProject(storage: StorageLike): ProjectState {
  for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    try {
      return migrateProject(JSON.parse(raw));
    } catch {
      // Ignore malformed entries and continue to the next compatible key.
    }
  }
  return createDefaultProject();
}

export class ProjectStore {
  #state: ProjectState;
  #listeners = new Set<StoreListener>();
  #storage: StorageLike;
  #schedule: Scheduler;
  #saveQueued = false;

  constructor(
    initialState: ProjectState,
    storage: StorageLike,
    schedule: Scheduler = (callback, delay) => globalThis.setTimeout(callback, delay),
  ) {
    this.#state = migrateProject(initialState);
    this.#storage = storage;
    this.#schedule = schedule;
  }

  getState(): ProjectState {
    return this.#state;
  }

  subscribe(listener: StoreListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  dispatch(action: StoreAction, notifyListeners = true): void {
    const now = new Date().toISOString();

    switch (action.type) {
      case 'set-name':
        this.#state = { ...this.#state, name: action.value, updatedAt: now };
        break;
      case 'set-path':
        this.#state = { ...setNestedPath(this.#state, action.path, action.value), updatedAt: now };
        break;
      case 'set-prompt-mode':
        this.#state = { ...this.#state, promptMode: action.value, updatedAt: now };
        break;
      case 'replace':
        this.#state = { ...migrateProject(action.value), updatedAt: now };
        break;
      case 'reset':
        this.#state = createDefaultProject();
        break;
      default: {
        const exhaustive: never = action;
        throw new Error(`Unknown store action: ${String(exhaustive)}`);
      }
    }

    this.#queueSave();
    if (notifyListeners) {
      for (const listener of this.#listeners) listener(this.#state);
    }
  }

  flush(): void {
    this.#storage.setItem(STORAGE_KEY, JSON.stringify(this.#state));
    this.#saveQueued = false;
  }

  #queueSave(): void {
    if (this.#saveQueued) return;
    this.#saveQueued = true;
    this.#schedule(() => this.flush(), 120);
  }
}
