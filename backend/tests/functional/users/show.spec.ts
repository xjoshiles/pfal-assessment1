import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Get a User by ID', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('successfully retrieve a user by ID when authenticated', async ({ assert, client }) => {
    const admin = await UserFactory.merge({ admin: true }).create()
    const user = await UserFactory.create()

    const response = await client.get(`/users/${user.id}`).loginAs(admin)

    assert.equal(response.response.statusCode, 200) // OK
    assert.containsSubset(response.response.body, {
      id: user.id,
      username: user.username,
    })
  })

  test('return 404 when retrieving a non-existent user by ID', async ({ assert, client }) => {
    const admin = await UserFactory.merge({ admin: true }).create()
    const nonExistentUserId = 9999

    const response = await client.get(`/users/${nonExistentUserId}`).loginAs(admin)

    assert.equal(response.response.statusCode, 404) // Not Found
    assert.equal(response.response.body.message, `User ${nonExistentUserId} not found`)
  })

  test('return 401 when trying to retrieve a user by ID without authentication', async ({ assert, client }) => {
    const user = await UserFactory.create()

    // Make an unauthenticated request
    const response = await client.get(`/users/${user.id}`)

    assert.equal(response.response.statusCode, 401) // Unauthorized
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })
})
