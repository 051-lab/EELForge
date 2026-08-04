import { createDefaultProject, type ProjectState } from '../src/domain';

export function readyArchitectProject(overrides: Partial<ProjectState> = {}): ProjectState {
  const project = createDefaultProject({ id: 'project-ready', now: '2026-08-04T08:00:00.000Z' });
  project.name = 'Record Path';
  project.vision.purpose = 'Add cohesive analog-style density to playback without obscuring detail.';
  project.vision.audibleGoal = 'Smooth, dimensional, stable, and subtly saturated.';
  project.vision.sourceMaterial = 'Full mixes and system-wide playback.';
  project.vision.definitionOfSuccess = 'Preserves transients, loads on RootlessJamesDSP, and remains efficient on Galaxy S10.';
  return { ...project, ...overrides };
}

export function readyIterationProject(): ProjectState {
  const project = readyArchitectProject();
  project.architectureReport = 'Input trim -> nonlinear density stage -> output protection.';
  project.eel2Script = '@init\ngain = 1;\n@sample\nspl0 *= gain; spl1 *= gain;';
  project.iterationNote = 'Fix the audible click when gain changes.';
  return project;
}

export function schema2Project(): Record<string, unknown> {
  const project = readyArchitectProject();
  return { ...project, schemaVersion: 2, appVersion: '0.1.0-alpha.3' };
}

export function schema1Project(): Record<string, unknown> {
  const project = readyArchitectProject();
  return {
    ...project,
    schemaVersion: 1,
    appVersion: 'alpha.2',
    name: 'Untitled EEL Effect',
  };
}
