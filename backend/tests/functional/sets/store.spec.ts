import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import { FlashcardFactory } from '#database/factories/flashcard_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import RateLimiter from '#services/rate_limiter'
import Flashcard from '#models/flashcard'
import FlashcardSet from '#models/flashcard_set'

test.group('Create a flashcard set', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let user: any
  let admin: any
  let flashcardSet: FlashcardSet
  let flashcards: Flashcard[]

  group.each.setup(async () => {
    // Create a regular user and an admin user before each test
    user = await UserFactory.create()
    admin = await UserFactory.merge({ admin: true }).create()

    // Generate a flashcard set and flashcards before each test
    flashcardSet = await FlashcardSetFactory.make()
    flashcards = await FlashcardFactory.makeMany(2)
  })

  test('authenticated user can create a flashcard set', async ({ assert, client }) => {
    // Send request to create the flashcard set
    const response = await client
      .post('/sets')
      .loginAs(user) // Login as the created user
      .json({
        name: flashcardSet.name,
        description: flashcardSet.description,
        flashcards: flashcards,
      })

    const responseData = response.response.body

    assert.equal(response.response.statusCode, 201) // Created
    assert.property(responseData, 'id')             // Ensure set has an ID
    assert.equal(responseData.name, flashcardSet.name)
    assert.equal(responseData.description, flashcardSet.description)

    // Validate flashcards were created with the set
    assert.lengthOf(responseData.flashcards, flashcards.length)
    flashcards.forEach((flashcard, index) => {
      assert.equal(responseData.flashcards[index].question, flashcard.question)
      assert.equal(responseData.flashcards[index].answer, flashcard.answer)
      assert.equal(responseData.flashcards[index].difficulty, flashcard.difficulty)
    })
  })

  test('return 401 when attempting to create a flashcard set without authentication', async ({ assert, client }) => {
    // Make an unauthenticated request
    const response = await client
      .post('/sets')
      .json({
        name: flashcardSet.name,
        description: flashcardSet.description,
        flashcards: flashcards,
      })

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })

  test('return 429 when the user exceeds the daily flashcard set creation limit', async ({ assert, client }) => {
    // Set limit to zero to simulate rate-limiting
    await RateLimiter.updateDailyLimit(0)

    // Send request to create the flashcard set
    const response = await client
      .post('/sets')
      .loginAs(user) // Login as the created regular user
      .json({
        name: flashcardSet.name,
        description: flashcardSet.description,
        flashcards: flashcards
      })

    assert.equal(response.response.statusCode, 429) // Too Many Requests
    assert.equal(
      response.response.body.message,
      'Daily set creation limit reached, please try again tomorrow'
    )
  })

  test('authenticated admin can create a flashcard set without rate limiting', async ({ assert, client }) => {
    // Set limit to zero to simulate rate-limiting
    await RateLimiter.updateDailyLimit(0)

    // Send request to create the flashcard set as an admin
    const response = await client
      .post('/sets')
      .loginAs(admin) // Login as the created admin user
      .json({
        name: flashcardSet.name,
        description: flashcardSet.description,
        flashcards: flashcards
      })

    const responseData = response.response.body

    assert.equal(response.response.statusCode, 201) // Created
    assert.property(responseData, 'id')             // Ensure set has an ID
    assert.equal(responseData.name, flashcardSet.name)
    assert.equal(responseData.description, flashcardSet.description)

    // Validate flashcards were created with the set
    assert.lengthOf(responseData.flashcards, flashcards.length)
    flashcards.forEach((flashcard, index) => {
      assert.equal(responseData.flashcards[index].question, flashcard.question)
      assert.equal(responseData.flashcards[index].answer, flashcard.answer)
      assert.equal(responseData.flashcards[index].difficulty, flashcard.difficulty)
    })
  })

  test('return 422 when validation fails for required fields', async ({ assert, client }) => {
    // Send request missing the 'name' field
    const response = await client
      .post('/sets')
      .loginAs(user) // Login as the created user
      .json({
        description: flashcardSet.description,
        flashcards: flashcards
      })

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(response.response.body.message, 'The name field must be defined')
  })
})
