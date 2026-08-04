import type { ProjectState } from '../domain';
import { hasMeaningfulContent } from './meaningful';
import { bullet, compactLines, EEL2_DESIGN_REQUIREMENTS, EEL2_VALIDATION_REQUIREMENTS, runtimeTargetBlock } from './shared-blocks';
import type { CompiledPrompt } from './types';

const REQUIRED_FIELDS = [
  { label: 'plugin name', read: (state: ProjectState) => state.name },
  { label: 'EEL2 script', read: (state: ProjectState) => state.eel2Script },
] as const;

export function buildOptimizePrompt(state: ProjectState): CompiledPrompt {
  const requiredFields = REQUIRED_FIELDS.map((field) => ({
    label: field.label,
    filled: hasMeaningfulContent(field.read(state)),
  }));
  const missingRequiredFields = requiredFields.filter((field) => !field.filled).map((field) => field.label);
  const scriptBlock = hasMeaningfulContent(state.eel2Script)
    ? ['## Current EEL2 script', '', '```eel2', state.eel2Script.trim(), '```'].join('\n')
    : null;
  const notesBlock = hasMeaningfulContent(state.iterationNote)
    ? ['## Optimization notes', '', state.iterationNote.trim()].join('\n')
    : null;
  const context = compactLines([
    '## Plugin context', '',
    bullet('Project', state.name),
    bullet('Purpose', state.vision.purpose),
    bullet('Desired audible result', state.vision.audibleGoal),
  ]).join('\n');
  const sections = [
    '# EELFORGE HANDOFF — OPTIMIZE',
    '',
    'You are an EEL2 DSP performance engineer. Return one complete optimized script. Preserve intended sound, controls, and accepted behavior unless the notes explicitly authorize a change.',
    '',
    context,
    scriptBlock,
    notesBlock,
    runtimeTargetBlock(state),
    EEL2_DESIGN_REQUIREMENTS,
    [
      '## Required deliverable', '',
      'Return one complete optimized EEL2 script, followed by an optimization report containing:', '',
      '1. Bottlenecks identified and the basis for each finding',
      '2. Optimizations applied and the real-time cost each addresses',
      '3. CPU, operation-count, memory, or latency comparisons labeled **measured** or **estimated**',
      '4. For every estimate, state the calculation or reasoning used',
      '5. Audible and control behavior preserved',
      '6. Numerical-safety and output-protection status',
      '7. What was verified and what remains unverified',
    ].join('\n'),
    EEL2_VALIDATION_REQUIREMENTS,
  ].filter((section): section is string => Boolean(section));
  const text = sections.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  return {
    mode: 'optimize', title: 'Optimize Handoff', text, characterCount: text.length,
    readiness: missingRequiredFields.length === 0 ? 'ready' : 'draft',
    missingRequiredFields, requiredFields,
  };
}
