import type { ProjectState } from '../domain';
import { hasMeaningfulContent } from './meaningful';
import { bullet, compactLines, EEL2_DESIGN_REQUIREMENTS, EEL2_VALIDATION_REQUIREMENTS, runtimeTargetBlock } from './shared-blocks';
import type { CompiledPrompt } from './types';

const REQUIRED_FIELDS = [
  { label: 'plugin name', read: (state: ProjectState) => state.name },
  { label: 'EEL2 script', read: (state: ProjectState) => state.eel2Script },
  { label: 'problem description', read: (state: ProjectState) => state.iterationNote },
] as const;

export function repairMissingFields(state: ProjectState): string[] {
  return REQUIRED_FIELDS.filter((field) => !hasMeaningfulContent(field.read(state))).map((field) => field.label);
}

export function repairCompletion(state: ProjectState): { completed: number; total: number } {
  const missing = repairMissingFields(state).length;
  return { completed: REQUIRED_FIELDS.length - missing, total: REQUIRED_FIELDS.length };
}

export function buildRepairPrompt(state: ProjectState): CompiledPrompt {
  const missingRequiredFields = repairMissingFields(state);

  const requiredFields = REQUIRED_FIELDS.map((field) => ({
    label: field.label,
    filled: hasMeaningfulContent(field.read(state)),
  }));

  const scriptBlock = hasMeaningfulContent(state.eel2Script)
    ? ['## Current EEL2 script', '', '```eel2', state.eel2Script.trim(), '```'].join('\n')
    : null;

  const problemBlock = hasMeaningfulContent(state.iterationNote)
    ? ['## Reported problem', '', state.iterationNote.trim()].join('\n')
    : null;

  const contextBrief = compactLines([
    '## Plugin context',
    '',
    bullet('Project', state.name),
    bullet('Purpose', state.vision.purpose),
    bullet('Desired audible result', state.vision.audibleGoal),
  ]).join('\n');

  const sections = [
    '# EELFORGE HANDOFF — REPAIR',
    '',
    'You are an EEL2 DSP engineer. An existing script has a defect that must be fixed. Diagnose the root cause and return a corrected complete script.',
    '',
    contextBrief,
    scriptBlock,
    problemBlock,
    runtimeTargetBlock(state),
    EEL2_DESIGN_REQUIREMENTS,
    [
      '## Required deliverable',
      '',
      'Return one complete corrected EEL2 script, followed by a repair report containing:',
      '',
      '1. Root-cause diagnosis: what was wrong and why',
      '2. Exact changes made and why each is necessary',
      '3. What working behavior was preserved',
      '4. Control table confirming no controls changed unexpectedly',
      '5. Numerical-safety and output-protection status after the fix',
      '6. What you verified and what you could not verify',
    ].join('\n'),
    EEL2_VALIDATION_REQUIREMENTS,
  ].filter((section): section is string => Boolean(section));

  const text = sections.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();

  return {
    mode: 'repair',
    title: 'Repair Handoff',
    text,
    characterCount: text.length,
    readiness: missingRequiredFields.length === 0 ? 'ready' : 'draft',
    missingRequiredFields,
    requiredFields,
  };
}
