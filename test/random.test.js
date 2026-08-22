import test from 'node:test';
import assert from 'node:assert/strict';
import { choose, chooseDifferent, randomInt } from '../src/utils/random.js';

test('randomInt includes both bounds with injected random values', () => {
  assert.equal(randomInt(-3, 4, () => 0), -3);
  assert.equal(randomInt(-3, 4, () => 0.999999), 4);
});

test('choose returns the element selected by its injected random source', () => {
  assert.equal(choose(['first', 'second'], () => 0.999), 'second');
});

test('chooseDifferent avoids the preceding signature when another item exists', () => {
  const items = [{ signature: 'A' }, { signature: 'B' }];
  assert.equal(chooseDifferent(items, 'A', item => item.signature, () => 0).signature, 'B');
});
