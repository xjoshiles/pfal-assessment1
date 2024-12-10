import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Get a Flashcard Set by ID', (group) => {
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

  test('authenticated user can fetch a flashcard set by ID', async ({ assert, client }) => {
    // Select a set to fetch
    const setToFetch = flashcardSets[0]

    // Send request to get the flashcard set by ID
    const response = await client
      .get(`/sets/${setToFetch.id}`)
      .loginAs(user) // Login as the created user

    assert.equal(response.response.statusCode, 200) // OK
    assert.deepEqual(response.response.body.id, setToFetch.id) // correct set

    // Validate that the set contains the required preloaded data
    assert.property(response.response.body, 'flashcards')
    assert.property(response.response.body, 'reviews')
    assert.property(response.response.body, 'creator')
    assert.isArray(response.response.body.reviews)
    response.response.body.reviews.forEach((review: any) => {
      assert.property(review, 'author') // each review has author preloaded
    })
  })

  test('return 401 when attempting to fetch a flashcard set without authentication', async ({ assert, client }) => {
    // Select a set to fetch
    const setToFetch = flashcardSets[0]

    // Make an unauthenticated request
    const response = await client.get(`/sets/${setToFetch.id}`)

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })

  test('return 404 when the flashcard set does not exist', async ({ assert, client }) => {
    // Attempt to fetch a non-existent set ID
    const nonExistentId = 9999

    const response = await client
      .get(`/sets/${nonExistentId}`)
      .loginAs(user) // Login as the created user

    assert.equal(response.response.statusCode, 404) // Not Found
    assert.equal(
      response.response.body.message,
      `Set ${nonExistentId} not found`
    )
  })
})
