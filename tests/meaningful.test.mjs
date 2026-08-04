import test from 'node:test';
import assert from 'node:assert/strict';
import { hasMeaningfulContent, meaningfulValue } from '../.test-dist/src/prompt/meaningful.js';

test('punctuation-only placeholders are not meaningful', () => {
  for (const value of ['', '.', '...', '-', '—', '  .  ', '()']) {
    assert.equal(hasMeaningfulContent(value), false, value);
  }
});

test('real short requirements remain meaningful', () => {
  assert.equal(hasMeaningfulContent('N/A'), true);
  assert.equal(hasMeaningfulContent('Bus'), true);
  assert.equal(meaningfulValue('  Full mixes  '), 'Full mixes');
});
