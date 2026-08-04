import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateProject } from '../.test-dist/src/migrations.js';

test('schema 1 projects migrate without losing existing fields', () => {
  const legacy = {
    schemaVersion: 1,
    appVersion: '0.1.0-alpha.2',
    id: 'legacy-id',
    name: 'Axiom',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    activeStage: 'vision',
    promptMode: 'architect',
    vision: {
      purpose: 'Enhance playback.', audibleGoal: 'Open and immersive.', sourceMaterial: 'Stereo music.',
      preserve: 'Bass center.', avoid: 'Harshness.', useLocation: 'System wide.', references: 'Airwindows.'
    },
    contract: {
      hostProfileId: 'rjdsp-modern', channelMode: 'stereo', sampleRates: [44100, 48000],
      latencyMode: 'zero', cpuTarget: 'mobile-balanced', deviceTargets: 'Galaxy S10',
      parameterSmoothing: true, outputProtection: true, constraints: ''
    },
    onboardingDismissed: false
  };
  const migrated = migrateProject(legacy);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.appVersion, '0.1.0-alpha.3');
  assert.equal(migrated.name, 'Axiom');
  assert.equal(migrated.vision.preserve, 'Bass center.');
  assert.equal(migrated.vision.definitionOfSuccess, '');
  assert.equal(migrated.vision.desiredControls, '');
});
