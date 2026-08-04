import type { ProjectState } from '../domain';
import { hasMeaningfulContent } from './meaningful';
import { bullet, compactLines, EEL2_DESIGN_REQUIREMENTS, EEL2_VALIDATION_REQUIREMENTS, runtimeTargetBlock } from './shared-blocks';
import type { CompiledPrompt } from './types';

const REQUIRED_FIELDS = [
  { label: 'plugin name', read: (state: ProjectState) => state.name },
  { label: 'EEL2 script', read: (state: ProjectState) => state.eel2Script },
  { label: 'refinement goal', read: (state: ProjectState) => state.iterationNote },
] as const;

export function refineMissingFields(state: ProjectState): string[] {
  return REQUIRED_FIELDS.filter((field) => !hasMeaningfulContent(field.read(state))).map((field) => field.label);
}

export function refineCompletion(state: ProjectState): { completed: number; total: number } {
  const missing = refineMissingFields(state).length;
  return { completed: REQUIRED_FIELDS.length - missing, total: REQUIRED_FIELDS.length };
}

export function buildRefinePrompt(state: ProjectState): CompiledPrompt {
  const missingRequiredFields = refineMissingFields(state);

  const requiredFields = REQUIRED_FIELDS.map((field) => ({
    label: field.label,
    filled: hasMeaningfulContent(field.read(state)),
  }));

  const scriptBlock = hasMeaningfulContent(state.eel2Script)
    ? ['## Current EEL2 script', '', '```eel2', state.eel2Script.trim(), '```'].join('\n')
    : null;

  const goalBlock = hasMeaningfulContent(state.iterationNote)
    ? ['## Refinement goal', '', state.iterationNote.trim()].join('\n')
    : null;

  const contextBrief = compactLines([
    '## Plugin context',
    '',
    bullet('Project', state.name),
    bullet('Purpose', state.vision.purpose),
    bullet('Desired audible result', state.vision.audibleGoal),
    bullet('Definition of success', state.vision.definitionOfSuccess),
  ]).join('\n');

  const sections = [
    '# EELFORGE HANDOFF — REFINE',
    '',
    'You are an EEL2 DSP engineer. The script below works but needs a targeted audible or behavioral refinement. Apply the requested change without breaking existing controls or working behavior.',
    '',
    contextBrief,
    scriptBlock,
    goalBlock,
    runtimeTargetBlock(state),
    EEL2_DESIGN_REQUIREMENTS,
    [
      '## Required deliverable',
      '',
      'Return one complete refined EEL2 script, followed by a refinement report containing:',
      '',
      '1. Summary of the audible or behavioral change applied',
      '2. Exact code changes and why each supports the goal',
      '3. What existing behavior and controls were preserved',
      '4. Control table confirming ranges, defaults, and smoothing',
      '5. Numerical-safety and output-protection status',
      '6. What you verified and what you could not verify',
    ].join('\n'),
    EEL2_VALIDATION_REQUIREMENTS,
  ].filter((section): section is string => Boolean(section));

  const text = sections.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();

  return {
    mode: 'refine',
    title: 'Refine Handoff',
    text,
    characterCount: text.length,
    readiness: missingRequiredFields.length === 0 ? 'ready' : 'draft',
    missingRequiredFields,
    requiredFields,
  };
}
