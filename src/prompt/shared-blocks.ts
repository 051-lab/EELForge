import { hostLabels, hostSections, type ProjectState } from '../domain';
import { meaningfulValue } from './meaningful';

function formatSampleRate(rate: number): string {
  const khz = rate / 1000;
  return `${Number.isInteger(khz) ? khz.toFixed(0) : khz} kHz`;
}

export function bullet(label: string, value: string): string | null {
  const meaningful = meaningfulValue(value);
  return meaningful ? `- **${label}:** ${meaningful}` : null;
}

export function compactLines(lines: Array<string | null | undefined>): string[] {
  return lines.filter((line): line is string => Boolean(line));
}

export function runtimeTargetBlock(state: ProjectState): string {
  const sections = hostSections[state.contract.hostProfileId];
  const sampleRates = state.contract.sampleRates.map(formatSampleRate).join(', ');

  return compactLines([
    '## Runtime target',
    '',
    `- **Host:** ${hostLabels[state.contract.hostProfileId]}`,
    sections.length
      ? `- **Available sections:** ${sections.map((section) => `\`${section}\``).join(', ')}`
      : '- **Available sections:** No host-specific section contract predefined',
    `- **Channel mode:** ${state.contract.channelMode}`,
    `- **Sample rates:** ${sampleRates || 'Not specified'}`,
    `- **Latency:** ${state.contract.latencyMode}`,
    `- **CPU target:** ${state.contract.cpuTarget}`,
    bullet('Device targets', state.contract.deviceTargets),
    `- **Parameter smoothing:** ${state.contract.parameterSmoothing ? 'required' : 'not required'}`,
    `- **Output protection:** ${state.contract.outputProtection ? 'required' : 'not required'}`,
    bullet('Additional constraints', state.contract.constraints),
  ]).join('\n');
}

export const EEL2_DESIGN_REQUIREMENTS = [
  '## EEL2 design requirements',
  '',
  '- Use EEL2-compatible syntax and execution patterns.',
  '- Do not rely on C/C++ braces or ordinary `if/else` statements.',
  '- Define helper functions before functions that call them.',
  '- Do not use recursion.',
  '- Initialize all persistent state explicitly.',
  '- Keep left and right channel state independent unless linking is intentional.',
  '- Move invariant and control-rate calculations out of `@sample` when possible.',
  '- Keep the per-sample path bounded, numerically safe, and suitable for real-time mobile processing.',
  '- State assumptions instead of silently inventing missing requirements.',
].join('\n');

export const EEL2_VALIDATION_REQUIREMENTS = [
  '## Validation and truthfulness requirements',
  '',
  '- Report exactly what you verified and what you did not.',
  '- Do not claim a behavior works without testing or reasoning through the code path.',
  '- Include a control table listing every slider with its symbol, range, default, mapping, and smoothing.',
  '- Note any numerical-safety risks (denormals, division by zero, overflow, aliasing).',
  '- Note any stereo or state-independence issues.',
  '- If you could not fully verify something, say so explicitly rather than omitting it.',
].join('\n');
