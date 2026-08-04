import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProject } from '../.test-dist/src/domain.js';
import { ProjectStore } from '../.test-dist/src/store.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

test('focus-safe dispatch updates state without notifying render listeners', () => {
  const store = new ProjectStore(createDefaultProject(), memoryStorage(), (fn) => fn());
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });
  store.dispatch({ type: 'set-path', path: 'vision.purpose', value: 'Warmth' }, false);
  assert.equal(store.getState().vision.purpose, 'Warmth');
  assert.equal(notifications, 0);
});

test('normal dispatch notifies render listeners once', () => {
  const store = new ProjectStore(createDefaultProject(), memoryStorage(), (fn) => fn());
  let notifications = 0;
  store.subscribe(() => { notifications += 1; });
  store.dispatch({ type: 'set-path', path: 'contract.hostProfileId', value: 'rjdsp-legacy' });
  assert.equal(store.getState().contract.hostProfileId, 'rjdsp-legacy');
  assert.equal(notifications, 1);
});
