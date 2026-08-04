import type { ProjectState } from '../domain';
import { hasMeaningfulContent } from './meaningful';
import { bullet, compactLines, EEL2_DESIGN_REQUIREMENTS, EEL2_VALIDATION_REQUIREMENTS, runtimeTargetBlock } from './shared-blocks';
import type { CompiledPrompt } from './types';

const REQUIRED_FIELDS = [
  { label: 'plugin name', read: (state: ProjectState) => state.name },
  { label: 'plugin purpose', read: (state: ProjectState) => state.vision.purpose },
  { label: 'audible result', read: (state: ProjectState) => state.vision.audibleGoal },
  { label: 'approved architecture report', read: (state: ProjectState) => state.architectureReport },
] as const;

export function buildMissingFields(state: ProjectState): string[] {
  return REQUIRED_FIELDS.filter((field) => !hasMeaningfulContent(field.read(state))).map((field) => field.label);
}

export function buildCompletion(state: ProjectState): { completed: number; total: number } {
  const missing = buildMissingFields(state).length;
  return { completed: REQUIRED_FIELDS.length - missing, total: REQUIRED_FIELDS.length };
}

export function buildBuildPrompt(state: ProjectState): CompiledPrompt {
  const missingRequiredFields = buildMissingFields(state);

  const requiredFields = REQUIRED_FIELDS.map((field) => ({
    label: field.label,
    filled: hasMeaningfulContent(field.read(state)),
  }));

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

  const architectureBlock = hasMeaningfulContent(state.architectureReport)
    ? ['## Approved architecture report', '', 'The following architecture has been reviewed and approved. Implement it faithfully:', '', '```', state.architectureReport.trim(), '```'].join('\n')
    : null;

  const sections = [
    '# EELFORGE HANDOFF — BUILD',
    '',
    'You are an EEL2 DSP engineer specializing in RootlessJamesDSP effects.',
    '',
    'Write one complete, working EEL2 script that implements the approved architecture below. Do not produce fragments or pseudocode — return the full script ready to load.',
    '',
    pluginBrief,
    sonicBoundaryLines.length ? `## Sonic boundaries\n\n${sonicBoundaryLines.join('\n')}` : null,
    architectureBlock,
    runtimeTargetBlock(state),
    EEL2_DESIGN_REQUIREMENTS,
    [
      '## Required deliverable',
      '',
      'Return exactly one complete EEL2 script, followed by a validation report containing:',
      '',
      '1. Control table: every slider with its symbol, range, default, mapping, and smoothing',
      '2. Signal-flow summary matching the architecture',
      '3. Persistent state variables and their initialization',
      '4. Sample-rate adaptation notes',
      '5. Stereo or mid/side behavior notes',
      '6. CPU and latency assessment',
      '7. Numerical-safety and output-protection measures',
      '8. What you verified and what you could not verify',
      '9. Known limitations or failure modes',
    ].join('\n'),
    EEL2_VALIDATION_REQUIREMENTS,
  ].filter((section): section is string => Boolean(section));

  const text = sections.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();

  return {
    mode: 'build',
    title: 'Build Handoff',
    text,
    characterCount: text.length,
    readiness: missingRequiredFields.length === 0 ? 'ready' : 'draft',
    missingRequiredFields,
    requiredFields,
  };
}
