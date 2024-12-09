import { test } from '@japa/runner'
import { LimitValidator } from '#validators/limit'

test.group('LimitValidator', () => {
  const validLimit = 10
  const invalidLimitDecimal = 5.5
  const invalidLimitNegative = -1

  test('fail when limit is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await LimitValidator.validate({})
    })
  })

  test('fail when limit is a decimal', async ({ assert }) => {
    await assert.rejects(async () => {
      await LimitValidator.validate({ limit: invalidLimitDecimal })
    })
  })

  test('fail when limit is a negative number', async ({ assert }) => {
    await assert.rejects(async () => {
      await LimitValidator.validate({ limit: invalidLimitNegative })
    })
  })

  test('pass when limit is a valid non-negative integer', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await LimitValidator.validate({ limit: validLimit })
    })
  })
})
