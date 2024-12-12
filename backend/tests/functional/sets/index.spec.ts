import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Get all flashcard sets', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let user: any
  let flashcardSets: any[]

  group.each.setup(async () => {
    // Create a user before each test
    user = await UserFactory.create()

    // Create 5 flashcard sets with 3 flashcards per set before each test
    flashcardSets = await FlashcardSetFactory.with('flashcards', 3)
      .with('reviews', 2) // Create 2 reviews per set
      .with('creator', 1) // Each set has a creator
      .createMany(5)
  })

  test('authenticated user can fetch all flashcard sets', async ({ assert, client }) => {
    // Send request to get all flashcard sets
    const response = await client
      .get('/sets')
      .loginAs(user) // Login as the created user

    assert.equal(response.response.statusCode, 200) // OK
    assert.isArray(response.response.body)          // list of sets
    assert.lengthOf(response.response.body, 5)      // 5 sets

    // Validate that each set contains the required data
    response.response.body.forEach((set: any) => {
      assert.property(set, 'flashcards') // Ensure flashcards are preloaded
      assert.property(set, 'creator')    // Ensure creator is preloaded
    })
  })

  test('return 401 when attempting to fetch flashcard sets without authentication', async ({ assert, client }) => {
    // Make an unauthenticated request
    const response = await client.get('/sets')

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })
})
