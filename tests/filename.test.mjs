import test from 'node:test';
import assert from 'node:assert/strict';
import { architectExportFilename, safeProjectSlug } from '../.test-dist/src/filename.js';

test('project names are converted into safe architect export filenames', () => {
  assert.equal(safeProjectSlug(' RecordPath / Mobile! '), 'recordpath-mobile');
  assert.equal(architectExportFilename(' RecordPath / Mobile! '), 'recordpath-mobile-architect-handoff.md');
  assert.equal(architectExportFilename('.'), 'untitled-eel-effect-architect-handoff.md');
});
