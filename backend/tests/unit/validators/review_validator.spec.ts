import { test } from '@japa/runner'
import { ReviewValidator } from '#validators/review'

test.group('ReviewValidator', () => {
  const validReview = 'This is a valid review'
  const invalidShortReview = 'Hi'           // less than 3 character min
  const invalidLongReview = 'A'.repeat(501) // exceeds 500 character max
  const validRating = 4
  const invalidLowRating = 0
  const invalidHighRating = 6

  test('fail when rating is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await ReviewValidator.validate({ review: validReview })
    })
  })

  test('fail when review is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await ReviewValidator.validate({ rating: validRating })
    })
  })

  test('fail when rating is not an integer', async ({ assert }) => {
    await assert.rejects(async () => {
      await ReviewValidator.validate({ rating: 4.5, review: validReview })
    })
  })

  test('fail when rating is less than 1', async ({ assert }) => {
    await assert.rejects(async () => {
      await ReviewValidator.validate({ rating: invalidLowRating, review: validReview })
    })
  })

  test('fail when rating is greater than 5', async ({ assert }) => {
    await assert.rejects(async () => {
      await ReviewValidator.validate({ rating: invalidHighRating, review: validReview })
    })
  })

  test('fail when review is less than 3 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await ReviewValidator.validate({ rating: validRating, review: invalidShortReview })
    })
  })

  test('fail when review is greater than 500 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await ReviewValidator.validate({ rating: validRating, review: invalidLongReview })
    })
  })

  test('pass when rating and review are both valid', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await ReviewValidator.validate({ rating: validRating, review: validReview })
    })
  })
})
