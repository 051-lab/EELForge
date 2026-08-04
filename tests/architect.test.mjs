import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProject } from '../.test-dist/src/domain.js';
import { buildArchitectPrompt, architectMissingFields } from '../.test-dist/src/prompt/architect.js';

function completeProject() {
  const state = createDefaultProject();
  state.name = 'RecordPath';
  state.vision.purpose = 'Add tape and console density with minimal controls.';
  state.vision.audibleGoal = 'Smooth, cohesive, dimensional, and never dull.';
  state.vision.sourceMaterial = 'Full stereo music playback.';
  state.vision.definitionOfSuccess = 'Adds depth on an S10 without choppy playback.';
  state.vision.preserve = 'Transient shape and low-end focus.';
  state.vision.desiredControls = 'Drive, Output Trim, Mix.';
  return state;
}

test('architect readiness requires five essential fields', () => {
  const state = createDefaultProject();
  state.name = '.';
  assert.deepEqual(architectMissingFields(state), [
    'plugin name',
    'plugin purpose',
    'audible result',
    'source material',
    'definition of success',
  ]);
  assert.equal(buildArchitectPrompt(completeProject()).readiness, 'ready');
});

test('architect prompt requests architecture rather than final code', () => {
  const compiled = buildArchitectPrompt(completeProject());
  assert.match(compiled.text, /Do not write the final EEL2 script yet\./);
  assert.doesNotMatch(compiled.text, /Return a complete script with no placeholders/);
  assert.match(compiled.text, /Recommended Build Specification/);
});

test('empty optional fields and punctuation placeholders are omitted', () => {
  const state = completeProject();
  state.vision.avoid = '.';
  state.vision.references = '';
  state.contract.constraints = '...';
  const compiled = buildArchitectPrompt(state);
  assert.doesNotMatch(compiled.text, /\*\*Avoid:\*\*/);
  assert.doesNotMatch(compiled.text, /References or inspiration/);
  assert.doesNotMatch(compiled.text, /Additional constraints/);
});

test('host section contract changes for legacy RootlessJamesDSP', () => {
  const state = completeProject();
  state.contract.hostProfileId = 'rjdsp-legacy';
  const compiled = buildArchitectPrompt(state);
  assert.match(compiled.text, /`@init`, `@sample`/);
  assert.doesNotMatch(compiled.text, /`@slider`/);
  assert.doesNotMatch(compiled.text, /`@block`/);
});
