import { describe, expect, it } from 'vitest';
import { templates } from '../src/templates';

describe('starter templates', () => {
  it('retains the four approved templates', () => {
    expect(templates.map((template) => template.name)).toEqual([
      'Warm Saturator', 'Transparent Limiter', 'Stereo Widener', 'Tape Character',
    ]);
  });

  it('uses supported contracts and avoids guaranteed implementation claims', () => {
    for (const template of templates) {
      const project = template.build();
      const text = JSON.stringify(project.vision).toLowerCase();
      expect(text).not.toContain('never exceeds 0 dbfs');
      expect(text).not.toContain('no audible distortion');
      expect(project.contract.hostProfileId).toBe('rjdsp-modern');
    }
    const limiter = templates.find((template) => template.id === 'transparent-limiter')!.build();
    expect(limiter.contract.latencyMode).toBe('low');
    expect(limiter.vision.definitionOfSuccess.toLowerCase()).not.toContain('zero latency');
  });
});
