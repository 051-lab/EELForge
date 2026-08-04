import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_STORAGE_BUDGET,
  LEGACY_STORAGE_KEYS,
  MAX_VERSIONS_PER_PROJECT,
  ProjectStore,
  WORKSPACE_STORAGE_KEY,
  type StorageLike,
} from '../src/store';
import { readyArchitectProject, schema2Project } from './fixtures';

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  writes: { key: string; value: string }[] = [];
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); this.writes.push({ key, value }); }
}

function sequence(values: string[]) {
  let index = 0;
  return () => values[index++] ?? `generated-${index}`;
}

function makeStore(storage = new MemoryStorage(), overrides: Partial<ConstructorParameters<typeof ProjectStore>[0]> = {}) {
  return new ProjectStore({
    storage,
    schedule: (callback) => { callback(); return 0; },
    now: () => '2026-08-04T10:00:00.000Z',
    uuid: sequence(['project-1', 'project-2', 'version-1', 'version-2', 'version-3', 'version-4', 'version-5', 'version-6', 'version-7', 'version-8', 'version-9', 'version-10', 'version-11', 'version-12']),
    budgetBytes: DEFAULT_STORAGE_BUDGET,
    ...overrides,
  });
}

describe('ProjectStore', () => {
  it('persists the active project in a schema-3 envelope', () => {
    const storage = new MemoryStorage();
    const store = makeStore(storage);
    const result = store.createProject();
    expect(result.ok).toBe(true);
    const saved = JSON.parse(storage.getItem(WORKSPACE_STORAGE_KEY)!);
    expect(saved.schemaVersion).toBe(3);
    expect(saved.activeId).toBe(store.activeId);
    expect(saved.entries).toHaveLength(1);

    const reloaded = makeStore(storage);
    expect(reloaded.activeId).toBe(store.activeId);
  });

  it('loads Bolt entry arrays and legacy keys without deleting recovery data', () => {
    const storage = new MemoryStorage();
    storage.values.set(WORKSPACE_STORAGE_KEY, JSON.stringify([{ project: readyArchitectProject(), versions: [] }]));
    expect(makeStore(storage).activeId).toBe('project-ready');

    const legacyStorage = new MemoryStorage();
    legacyStorage.values.set(LEGACY_STORAGE_KEYS[0], JSON.stringify(schema2Project()));
    const migrated = makeStore(legacyStorage);
    expect(migrated.activeProject?.id).toBe('project-ready');
    expect(legacyStorage.getItem(LEGACY_STORAGE_KEYS[0])).not.toBeNull();
    expect(legacyStorage.getItem(WORKSPACE_STORAGE_KEY)).not.toBeNull();
  });

  it('skips malformed legacy entries and checks later keys', () => {
    const storage = new MemoryStorage();
    storage.values.set(LEGACY_STORAGE_KEYS[0], '{bad');
    storage.values.set(LEGACY_STORAGE_KEYS[1], JSON.stringify(schema2Project()));
    expect(makeStore(storage).activeProject?.id).toBe('project-ready');
  });

  it('preserves identity across reset and restore', () => {
    const store = makeStore();
    store.createProject(() => readyArchitectProject());
    const id = store.activeProject!.id;
    const createdAt = store.activeProject!.createdAt;
    store.dispatch({ type: 'set-name', value: 'Before Version' });
    const saved = store.saveVersion('Known good');
    expect(saved.ok).toBe(true);
    store.dispatch({ type: 'set-name', value: 'Changed' });
    expect(store.restoreVersion(saved.ok ? saved.value : '').ok).toBe(true);
    expect(store.activeProject?.name).toBe('Before Version');
    expect(store.activeProject?.id).toBe(id);
    expect(store.activeProject?.createdAt).toBe(createdAt);

    expect(store.resetActiveProject().ok).toBe(true);
    expect(store.activeProject?.name).toBe('');
    expect(store.activeProject?.id).toBe(id);
    expect(store.activeProject?.createdAt).toBe(createdAt);
  });

  it('gives duplicate projects new identities and no versions', () => {
    const store = makeStore();
    const created = store.createProject(() => readyArchitectProject());
    expect(created.ok).toBe(true);
    store.saveVersion('Snapshot');
    const sourceId = store.activeId!;
    const duplicated = store.duplicateProject(sourceId);
    expect(duplicated.ok).toBe(true);
    expect(duplicated.ok && duplicated.value).not.toBe(sourceId);
    expect(store.activeEntry?.versions).toHaveLength(0);
  });

  it('caps each project at ten manual versions', () => {
    const store = makeStore(undefined, { uuid: sequence(['p', ...Array.from({ length: 20 }, (_, index) => `v${index}`)]) });
    store.createProject();
    for (let index = 0; index < 12; index += 1) store.saveVersion(`Version ${index}`);
    expect(store.activeEntry?.versions).toHaveLength(MAX_VERSIONS_PER_PROJECT);
  });

  it('prunes globally oldest versions to fit the budget without changing active content', () => {
    let tick = 0;
    const store = makeStore(undefined, {
      now: () => `2026-08-04T10:${String(tick++).padStart(2, '0')}:00.000Z`,
      measureBytes: (value) => 100 + (value.match(/"snapshot"/g)?.length ?? 0) * 100,
      budgetBytes: 250,
    });
    store.createProject(() => readyArchitectProject());
    store.dispatch({ type: 'set-name', value: 'Active Content' });
    store.saveVersion('Old');
    const result = store.saveVersion('New');
    expect(result.ok).toBe(true);
    expect(result.ok && result.prunedVersions).toBe(1);
    expect(store.activeProject?.name).toBe('Active Content');
    expect(store.activeEntry?.versions).toHaveLength(1);
    expect(store.activeEntry?.versions[0]?.label).toBe('New');
  });

  it('reports storage-full failures and keeps in-memory content', () => {
    const onError = vi.fn();
    const store = makeStore(undefined, { measureBytes: () => 999, budgetBytes: 1, onPersistenceError: onError });
    const result = store.createProject(() => readyArchitectProject());
    expect(result).toMatchObject({ ok: false, code: 'quota' });
    expect(store.activeProject?.name).toBe('Record Path');
    expect(onError).toHaveBeenCalled();
  });

  it('reports browser storage exceptions instead of claiming success', () => {
    const storage = new MemoryStorage();
    storage.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); };
    const onError = vi.fn();
    const store = makeStore(storage, { onPersistenceError: onError });
    const result = store.createProject();
    expect(result).toMatchObject({ ok: false, code: 'quota' });
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('storage is full'));
  });
});
