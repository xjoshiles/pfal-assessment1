import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import FlashcardSet from '#models/flashcard_set'

test.group('Delete a flashcard Set by ID', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let user: any
  let admin: any
  let flashcardSet: FlashcardSet

  group.each.setup(async () => {
    // Create a regular user and an admin user before each test
    user = await UserFactory.create()
    admin = await UserFactory.merge({ admin: true }).create()

    // Generate a flashcard set associated with the
    // regular user in the database before each test
    flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()
  })

  test('authenticated user can delete their own flashcard set', async ({ assert, client }) => {
    const response = await client
      .delete(`/sets/${flashcardSet.id}`)
      .loginAs(user)

    assert.equal(response.response.statusCode, 204)  // No Content
    const deletedSet = await FlashcardSet.find(flashcardSet.id)
    assert.isNull(deletedSet)  // Ensure the set was deleted
  })

  test('return 401 when attempting to delete a flashcard set without authentication', async ({ assert, client }) => {
    // Make an unauthenticated request
    const response = await client
      .delete(`/sets/${flashcardSet.id}`)

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })

  test('return 403 if a user attempts to delete a set they do not own', async ({ assert, client }) => {
    const otherUser = await UserFactory.create()

    const response = await client
      .delete(`/sets/${flashcardSet.id}`)
      .loginAs(otherUser)

    assert.equal(response.response.statusCode, 403)
    assert.equal(response.response.body.message, 'You are not authorised to delete this set')
  })

  test('authenticated admin can delete any flashcard set', async ({ assert, client }) => {
    const response = await client
      .delete(`/sets/${flashcardSet.id}`) // owned by non-admin user
      .loginAs(admin)

    assert.equal(response.response.statusCode, 204)  // No Content
    const deletedSet = await FlashcardSet.find(flashcardSet.id)
    assert.isNull(deletedSet)  // Ensure the set was deleted
  })

  test('return 404 if the flashcard set does not exist', async ({ assert, client }) => {
    const response = await client
      .delete(`/sets/9999`)  // Non-existent ID
      .loginAs(user)

    assert.equal(response.response.statusCode, 404)
    assert.equal(response.response.body.message, 'Set 9999 not found')
  })
})
