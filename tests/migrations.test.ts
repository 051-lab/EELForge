import { describe, expect, it } from 'vitest';
import { migrateProject } from '../src/migrations';
import { schema1Project, schema2Project } from './fixtures';

describe('project migration', () => {
  it('migrates schema 1 and clears its legacy untitled name', () => {
    const migrated = migrateProject(schema1Project());
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.appVersion).toBe('0.2.0');
    expect(migrated.name).toBe('');
    expect(migrated.id).toBe('project-ready');
  });

  it('preserves schema 2 text and identity', () => {
    const migrated = migrateProject(schema2Project());
    expect(migrated.id).toBe('project-ready');
    expect(migrated.vision.purpose).toContain('cohesive');
    expect(migrated.architectureReport).toBe('');
    expect(migrated.eel2Script).toBe('');
  });

  it('accepts export envelopes and rejects unsupported structures', () => {
    expect(migrateProject({ project: schema2Project() }).id).toBe('project-ready');
    expect(() => migrateProject({})).toThrow('Unsupported EELForge project structure');
    expect(() => migrateProject({ schemaVersion: 99, vision: {}, contract: {} })).toThrow('Unsupported EELForge project schema');
  });
});
