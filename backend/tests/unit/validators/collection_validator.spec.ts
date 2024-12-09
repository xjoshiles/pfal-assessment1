import { test } from '@japa/runner'
import { CollectionValidator } from '#validators/collection'
import { errors } from '@vinejs/vine'

test.group('CollectionValidator', () => {
  const validName = 'Test Collection'
  const validDescription = 'This is a description'
  const invalidShortString = ''             // less than 1 character min
  const invalidLongString = 'A'.repeat(256) // exceeds 255 character max

  const validFlashcardSetIds = [1, 2, 3]
  const invalidFlashcardSetIds = [0, -1, 3.5]

  test('fail when name is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        description: validDescription,
        flashcardSetIds: validFlashcardSetIds
      })
    })
  })

  test('fail when name is an empty string', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: invalidShortString,
        description: validDescription,
        flashcardSetIds: validFlashcardSetIds
      })
    })
  })

  test('fail when name exceeds 255 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: invalidLongString,
        description: validDescription,
        flashcardSetIds: validFlashcardSetIds
      })
    })
  })

  test('fail when description is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: validName,
        flashcardSetIds: validFlashcardSetIds
      })
    })
  })

  test('fail when description is an empty string', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: validName,
        description: invalidShortString,
        flashcardSetIds: validFlashcardSetIds
      })
    })
  })

  test('fail when description exceeds 255 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: validName,
        description: invalidLongString,
        flashcardSetIds: validFlashcardSetIds
      })
    })
  })

  test('fail when flashcardSetIds is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: validName,
        description: validDescription
      })
    })
  })

  test('fail when flashcardSetIds array is empty', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: validName,
        description: validDescription,
        flashcardSetIds: []
      })
    })
  })

  test('custom error message when flashcardSetIds array is empty', async ({ assert }) => {
    try {
      await CollectionValidator.validate({
        name: validName,
        description: validDescription,
        flashcardSetIds: []
      })
      assert.fail('Validation should have thrown an error')

    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        assert.equal(
          error.messages[0].message,
          'The collection must contain at least one set'
        )
      } else {
        throw error
      }
    }
  })

  test('fail when flashcardSetIds contains non-positive integers', async ({ assert }) => {
    await assert.rejects(async () => {
      await CollectionValidator.validate({
        name: validName,
        description: validDescription,
        flashcardSetIds: invalidFlashcardSetIds
      })
    })
  })

  test('pass when all fields are valid', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await CollectionValidator.validate({
        name: validName,
        description: 'A test description',
        flashcardSetIds: validFlashcardSetIds
      })
    })
  })
})
