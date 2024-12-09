import { test } from '@japa/runner'
import { areSetsEqual } from '#utils/array'

test.group('areSetsEqual', () => {
  test('returns true for two empty arrays', ({ assert }) => {
    assert.isTrue(areSetsEqual([], []))
  })

  test('returns true for two identical arrays', ({ assert }) => {
    assert.isTrue(areSetsEqual([1, 2, 3], [1, 2, 3]))
  })

  test('returns true for arrays with the same elements in different orders', ({ assert }) => {
    assert.isTrue(areSetsEqual([1, 3, 2], [2, 1, 3]))
  })

  test('returns false for arrays of different lengths', ({ assert }) => {
    assert.isFalse(areSetsEqual([1, 2], [1, 2, 3]))
  })

  test('returns false for arrays with different elements', ({ assert }) => {
    assert.isFalse(areSetsEqual([1, 2, 3], [1, 2, 4]))
  })

  test('returns false for arrays with the same length but different occurrences of elements', ({ assert }) => {
    assert.isFalse(areSetsEqual([1, 1, 2], [1, 2, 2]))
  })

  test('handles negative numbers correctly', ({ assert }) => {
    assert.isTrue(areSetsEqual([-1, -2, -3], [-3, -1, -2]))
    assert.isFalse(areSetsEqual([-1, -2, -3], [1, 2, 3]))
  })

  test('handles arrays with a single element correctly', ({ assert }) => {
    assert.isTrue(areSetsEqual([42], [42]))
    assert.isFalse(areSetsEqual([42], [43]))
  })
})
