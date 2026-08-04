import { describe, expect, it } from 'vitest';
import { parseProjectImport, ProjectImportError, serializeProjectExport } from '../src/import-export';
import { readyArchitectProject, schema2Project } from './fixtures';

describe('project import and export', () => {
  it('rejects arbitrary JSON with the exact message', () => {
    expect(() => parseProjectImport('{}')).toThrowError(new ProjectImportError());
  });

  it('regenerates import identity and timestamps', () => {
    const imported = parseProjectImport(JSON.stringify({ project: schema2Project() }), {
      uuid: () => 'new-id',
      now: () => '2026-08-04T09:00:00.000Z',
    });
    expect(imported.id).toBe('new-id');
    expect(imported.createdAt).toBe('2026-08-04T09:00:00.000Z');
    expect(imported.updatedAt).toBe('2026-08-04T09:00:00.000Z');
    expect(imported.vision.purpose).toContain('cohesive');
  });

  it('exports a versioned envelope', () => {
    const parsed = JSON.parse(serializeProjectExport(readyArchitectProject(), '2026-08-04T10:00:00.000Z'));
    expect(parsed.schemaVersion).toBe(3);
    expect(parsed.appVersion).toBe('0.2.0');
    expect(parsed.exportedAt).toBe('2026-08-04T10:00:00.000Z');
    expect(parsed.project.id).toBe('project-ready');
  });
});
