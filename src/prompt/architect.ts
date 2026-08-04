import type { ProjectState } from '../domain.js';
import { hasMeaningfulContent } from './meaningful.js';
import { bullet, compactLines, EEL2_DESIGN_REQUIREMENTS, runtimeTargetBlock } from './shared-blocks.js';
import type { CompiledPrompt } from './types.js';

const REQUIRED_FIELDS = [
  { label: 'plugin name', read: (state: ProjectState) => state.name },
  { label: 'plugin purpose', read: (state: ProjectState) => state.vision.purpose },
  { label: 'audible result', read: (state: ProjectState) => state.vision.audibleGoal },
  { label: 'source material', read: (state: ProjectState) => state.vision.sourceMaterial },
  { label: 'definition of success', read: (state: ProjectState) => state.vision.definitionOfSuccess },
] as const;

export function architectMissingFields(state: ProjectState): string[] {
  return REQUIRED_FIELDS
    .filter((field) => !hasMeaningfulContent(field.read(state)))
    .map((field) => field.label);
}

export function architectCompletion(state: ProjectState): { completed: number; total: number } {
  const missing = architectMissingFields(state).length;
  return { completed: REQUIRED_FIELDS.length - missing, total: REQUIRED_FIELDS.length };
}

export function buildArchitectPrompt(state: ProjectState): CompiledPrompt {
  const missingRequiredFields = architectMissingFields(state);

  const pluginBrief = compactLines([
    '## Plugin brief',
    '',
    bullet('Project', state.name),
    bullet('Purpose', state.vision.purpose),
    bullet('Intended use', state.vision.useLocation),
    bullet('Source material', state.vision.sourceMaterial),
    bullet('Desired audible result', state.vision.audibleGoal),
    bullet('Definition of success', state.vision.definitionOfSuccess),
  ]).join('\n');

  const sonicBoundaryLines = compactLines([
    bullet('Preserve', state.vision.preserve),
    bullet('Avoid', state.vision.avoid),
    bullet('Preferred controls', state.vision.desiredControls),
    bullet('References or inspiration', state.vision.references),
  ]);

  const sections = [
    '# EELFORGE HANDOFF — ARCHITECT',
    '',
    'You are an audio DSP architect specializing in EEL2 effects for RootlessJamesDSP.',
    '',
    'Design an implementation-ready architecture for the plugin below. Do not write the final EEL2 script yet.',
    '',
    pluginBrief,
    sonicBoundaryLines.length ? `## Sonic boundaries\n\n${sonicBoundaryLines.join('\n')}` : null,
    runtimeTargetBlock(state),
    EEL2_DESIGN_REQUIREMENTS,
    [
      '## Required deliverable',
      '',
      'Return an architecture report containing:',
      '',
      '1. Plugin concept and operating principle',
      '2. Ordered signal-flow diagram',
      '3. Algorithm proposed for each processing stage',
      '4. Control definitions, ranges, defaults, mappings, and smoothing',
      '5. Persistent state and memory requirements',
      '6. Sample-rate adaptation strategy',
      '7. Stereo-linking or mid/side behavior',
      '8. CPU and latency assessment',
      '9. Numerical-safety and output-protection strategy',
      '10. Expected audible behavior and possible failure modes',
      '11. Validation and listening-test plan',
      '12. Final implementation specification for the Build agent',
      '',
      'End with a concise **Recommended Build Specification** that another AI agent can use to write the complete EEL2 script.',
    ].join('\n'),
  ].filter((section): section is string => Boolean(section));

  const text = sections.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();

  return {
    mode: 'architect',
    title: 'Architect Handoff',
    text,
    characterCount: text.length,
    readiness: missingRequiredFields.length === 0 ? 'ready' : 'draft',
    missingRequiredFields,
  };
}
