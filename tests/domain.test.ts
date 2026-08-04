import { describe, expect, it } from 'vitest';
import { APP_VERSION, PROJECT_SCHEMA_VERSION, createDefaultProject, hostSections } from '../src/domain';

describe('domain contracts', () => {
  it('locks release and schema literals', () => {
    expect(APP_VERSION).toBe('0.2.0');
    expect(PROJECT_SCHEMA_VERSION).toBe(3);
  });

  it('uses verified host sections', () => {
    expect(hostSections['rjdsp-modern']).toEqual(['@init', '@slider', '@block', '@sample']);
    expect(hostSections['rjdsp-legacy']).toEqual(['@init', '@sample']);
    expect(hostSections['eel-vm-core']).toEqual([]);
  });

  it('uses the established mobile defaults', () => {
    const project = createDefaultProject({ id: 'id', now: '2026-08-04T00:00:00.000Z' });
    expect(project.contract.sampleRates).toEqual([44100, 48000]);
    expect(project.contract.latencyMode).toBe('zero');
    expect(project.contract.cpuTarget).toBe('mobile-balanced');
    expect(project.contract.deviceTargets).toBe('Galaxy S10; Galaxy S24 Ultra');
    expect(project.contract.parameterSmoothing).toBe(true);
    expect(project.contract.outputProtection).toBe(true);
  });
});
