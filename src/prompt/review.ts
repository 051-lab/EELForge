import type { ProjectState } from '../domain';
import { hasMeaningfulContent } from './meaningful';
import { bullet, compactLines, runtimeTargetBlock } from './shared-blocks';
import type { CompiledPrompt } from './types';

const REQUIRED_FIELDS = [
  { label: 'plugin name', read: (state: ProjectState) => state.name },
  { label: 'EEL2 script', read: (state: ProjectState) => state.eel2Script },
] as const;

export function buildReviewPrompt(state: ProjectState): CompiledPrompt {
  const requiredFields = REQUIRED_FIELDS.map((field) => ({
    label: field.label,
    filled: hasMeaningfulContent(field.read(state)),
  }));
  const missingRequiredFields = requiredFields.filter((field) => !field.filled).map((field) => field.label);
  const scriptBlock = hasMeaningfulContent(state.eel2Script)
    ? ['## EEL2 script under review', '', '```eel2', state.eel2Script.trim(), '```'].join('\n')
    : null;
  const context = compactLines([
    '## Plugin context', '',
    bullet('Project', state.name),
    bullet('Purpose', state.vision.purpose),
    bullet('Desired audible result', state.vision.audibleGoal),
    bullet('Definition of success', state.vision.definitionOfSuccess),
  ]).join('\n');
  const sections = [
    '# EELFORGE HANDOFF — REVIEW',
    '',
    'You are an EEL2 DSP reviewer. Assess the script against the stated plugin context and selected Runtime target. Do not rewrite the script.',
    '',
    context,
    scriptBlock,
    runtimeTargetBlock(state),
    [
      '## Required deliverable', '',
      'Return a severity-ranked review report containing:', '',
      '1. Signal-flow and behavioral correctness',
      '2. Compliance with the sections and constraints listed in **Runtime target**',
      '3. EEL2 syntax and execution-model risks',
      '4. Numerical safety: denormals, division by zero, overflow, aliasing, and DC offset',
      '5. Stereo linking, channel-state independence, and mid/side correctness where applicable',
      '6. Parameter smoothing and automation behavior',
      '7. Output-protection behavior',
      '8. CPU, memory, and latency risks for the selected target',
      '9. Control table with symbols, ranges, defaults, mappings, and smoothing',
      '10. Findings labeled **critical**, **warning**, or **note**, each with a concrete recommendation',
      '11. Overall verdict: **ready**, **needs work**, or **rejected**, with reasoning', '',
      'Do not return a replacement script. Distinguish verified facts, code-based inferences, and items that require host execution or listening tests.',
    ].join('\n'),
  ].filter((section): section is string => Boolean(section));
  const text = sections.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  return {
    mode: 'review', title: 'Review Handoff', text, characterCount: text.length,
    readiness: missingRequiredFields.length === 0 ? 'ready' : 'draft',
    missingRequiredFields, requiredFields,
  };
}
