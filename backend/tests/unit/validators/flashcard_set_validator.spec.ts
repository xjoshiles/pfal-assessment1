import { test } from '@japa/runner'
import { FlashcardSetValidator } from '#validators/flashcard_set'
import { errors } from '@vinejs/vine'

test.group('FlashcardSetValidator', () => {
  const validName = 'Test Set'
  const validDescription = 'This is a description'
  const invalidShortString = ''             // less than 1 character min
  const invalidLongString = 'A'.repeat(256) // exceeds 255 character max

  const validFlashcard = {
    question: 'What is the capital of France?',
    answer: 'Paris',
    difficulty: 'easy'
  }

  const invalidFlashcard = {
    question: '',
    answer: '',
    difficulty: 'invalidDifficulty'
  }

  test('fail when name is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        description: validDescription,
        flashcards: [validFlashcard]
      })
    })
  })

  test('fail when name is an empty string', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: invalidShortString,
        description: validDescription,
        flashcards: [validFlashcard]
      })
    })
  })

  test('fail when name exceeds 255 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: invalidLongString,
        description: validDescription,
        flashcards: [validFlashcard]
      })
    })
  })

  test('fail when description is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        flashcards: [validFlashcard]
      })
    })
  })

  test('fail when description is an empty string', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        description: invalidShortString,
        flashcards: [validFlashcard]
      })
    })
  })

  test('fail when description exceeds 255 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        description: invalidLongString,
        flashcards: [validFlashcard]
      })
    })
  })

  test('fail when flashcards are missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        description: validDescription
      })
    })
  })

  test('fail when flashcards array is empty', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        description: validDescription,
        flashcards: []
      })
    })
  })

  test('custom error message when flashcards array is empty', async ({ assert }) => {
    try {
      await FlashcardSetValidator.validate({
        name: validName,
        description: validDescription,
        flashcards: []
      })
      assert.fail('Validation should have thrown an error')

    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        assert.equal(
          error.messages[0].message,
          'The set must contain at least one flashcard'
        )
      } else {
        throw error
      }
    }
  })

  test('fail when a flashcard is invalid', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        description: validDescription,
        flashcards: [invalidFlashcard]
      })
    })
  })

  test('fail when a flashcard has an invalid difficulty', async ({ assert }) => {
    await assert.rejects(async () => {
      await FlashcardSetValidator.validate({
        name: 'Test Set',
        description: 'A test description',
        flashcards: [
          {
            question: 'Sample Question',
            answer: 'Sample Answer',
            difficulty: 'invalid'
          }
        ]
      })
    })
  })

  test('pass when a flashcard has an optional id', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        description: validDescription,
        flashcards: [
          {
            id: 1,
            question: 'Sample Question',
            answer: 'Sample Answer',
            difficulty: 'medium'
          }
        ]
      })
    })
  })

  test('pass when all fields are valid', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await FlashcardSetValidator.validate({
        name: validName,
        description: validDescription,
        flashcards: [
          validFlashcard,
          {
            question: 'What is 2 + 2?',
            answer: '4',
            difficulty: 'hard'
          }
        ]
      })
    })
  })
})
