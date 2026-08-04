import { describe, expect, it } from 'vitest';
import { compilePrompt, hasMeaningfulContent, modeCompletion } from '../src/prompt';
import { runtimeTargetBlock } from '../src/prompt/shared-blocks';
import { readyArchitectProject, readyIterationProject } from './fixtures';

describe('meaningful input', () => {
  it.each(['.', '...', '-', '---', '!'])('treats %s as empty', (value) => {
    expect(hasMeaningfulContent(value)).toBe(false);
  });
});

describe('runtime target', () => {
  it('adapts to modern, legacy, and generic hosts without unsupported sections', () => {
    const project = readyArchitectProject();
    project.contract.hostProfileId = 'rjdsp-modern';
    expect(runtimeTargetBlock(project)).toContain('`@init`, `@slider`, `@block`, `@sample`');
    project.contract.hostProfileId = 'rjdsp-legacy';
    expect(runtimeTargetBlock(project)).toContain('`@init`, `@sample`');
    project.contract.hostProfileId = 'eel-vm-core';
    expect(runtimeTargetBlock(project)).toContain('No host-specific section contract predefined');
    const all = ['rjdsp-modern', 'rjdsp-legacy', 'eel-vm-core'].map((host) => {
      project.contract.hostProfileId = host as typeof project.contract.hostProfileId;
      return runtimeTargetBlock(project);
    }).join('\n');
    expect(all).not.toMatch(/@blocksize|@serialize|@restore/);
  });
});

describe('six prompt modes', () => {
  it('Architect requests architecture and forbids final code', () => {
    const project = readyArchitectProject();
    project.promptMode = 'architect';
    const prompt = compilePrompt(project);
    expect(prompt.readiness).toBe('ready');
    expect(prompt.text).toContain('Do not write the final EEL2 script yet');
    expect(prompt.text).toContain('**Recommended Build Specification**');
    expect(modeCompletion(project)).toEqual({ completed: 5, total: 5 });
  });

  it('Build requires an approved architecture and requests one complete script', () => {
    const project = readyIterationProject();
    project.promptMode = 'build';
    const prompt = compilePrompt(project);
    expect(prompt.readiness).toBe('ready');
    expect(prompt.text).toContain('one complete, working EEL2 script');
    expect(prompt.text).toContain('what you could not verify');
  });

  it('Repair requests diagnosis and one complete corrected script', () => {
    const project = readyIterationProject();
    project.promptMode = 'repair';
    const prompt = compilePrompt(project);
    expect(prompt.readiness).toBe('ready');
    expect(prompt.text).toContain('Root-cause diagnosis');
    expect(prompt.text).toContain('one complete corrected EEL2 script');
  });

  it('Refine preserves unspecified accepted behavior and controls', () => {
    const project = readyIterationProject();
    project.promptMode = 'refine';
    const prompt = compilePrompt(project);
    expect(prompt.text).toContain('without breaking existing controls or working behavior');
    expect(prompt.text).toContain('one complete refined EEL2 script');
  });

  it('Optimize labels performance claims measured or estimated with a basis', () => {
    const project = readyIterationProject();
    project.promptMode = 'optimize';
    project.iterationNote = '';
    const prompt = compilePrompt(project);
    expect(prompt.readiness).toBe('ready');
    expect(prompt.text).not.toContain('## Optimization notes');
    expect(prompt.text).toContain('labeled **measured** or **estimated**');
    expect(prompt.text).toContain('state the calculation or reasoning');
  });

  it('Review returns findings and never requests a rewrite', () => {
    const project = readyIterationProject();
    project.promptMode = 'review';
    project.contract.hostProfileId = 'rjdsp-legacy';
    const prompt = compilePrompt(project);
    expect(prompt.text).toContain('Do not rewrite the script');
    expect(prompt.text).toContain('severity-ranked review report');
    expect(prompt.text).toContain('sections and constraints listed in **Runtime target**');
    expect(prompt.text).not.toContain('@serialize');
  });

  it('omits empty optional blocks', () => {
    const project = readyArchitectProject();
    project.vision.preserve = '...';
    project.vision.avoid = '';
    const prompt = compilePrompt(project);
    expect(prompt.text).not.toContain('## Sonic boundaries');
  });
});
