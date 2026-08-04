import { ProjectStore, type StorageLike } from '../src/store';

export class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

export function testStore(storage = new MemoryStorage()): ProjectStore {
  let id = 0;
  let minute = 0;
  return new ProjectStore({
    storage,
    schedule: (callback) => { callback(); return 0; },
    uuid: () => `test-id-${++id}`,
    now: () => `2026-08-04T10:${String(minute++).padStart(2, '0')}:00.000Z`,
  });
}
