import { APP_VERSION, PROJECT_SCHEMA_VERSION, type ProjectState } from './domain';
import { isRecognizableProject, migrateProject, unwrapProjectCandidate } from './migrations';

export class ProjectImportError extends Error {
  constructor(message = 'This file is not a recognizable EELForge project.') {
    super(message);
    this.name = 'ProjectImportError';
  }
}

export interface ImportOptions {
  uuid?: () => string;
  now?: () => string;
}

export function parseProjectImport(raw: string, options: ImportOptions = {}): ProjectState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ProjectImportError();
  }

  const candidate = unwrapProjectCandidate(parsed);
  if (!isRecognizableProject(candidate)) throw new ProjectImportError();

  try {
    const migrated = migrateProject(candidate);
    const now = (options.now ?? (() => new Date().toISOString()))();
    return {
      ...migrated,
      id: (options.uuid ?? (() => crypto.randomUUID()))(),
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    throw new ProjectImportError();
  }
}

export function serializeProjectExport(project: ProjectState, exportedAt = new Date().toISOString()): string {
  return JSON.stringify(
    {
      schemaVersion: PROJECT_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      exportedAt,
      project,
    },
    null,
    2,
  );
}
