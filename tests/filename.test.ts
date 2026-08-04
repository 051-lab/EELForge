import { describe, expect, it } from 'vitest';
import { projectExportFilename, promptExportFilename, safeProjectSlug } from '../src/filename';

describe('export filenames', () => {
  it('creates safe mode-specific names', () => {
    expect(promptExportFilename('Record Path', 'repair')).toBe('record-path-repair-handoff.md');
  });

  it('uses the untitled fallback for punctuation-only names', () => {
    expect(safeProjectSlug('...')).toBe('untitled-eel-effect');
    expect(projectExportFilename('...')).toBe('untitled-eel-effect-eelforge-project.json');
  });
});
