import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Delete user via ID', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const validPassword = 'validPassword'
  const invalidPassword = 'wrongPassword'

  test('successfully delete the user with valid credentials', async ({ assert, client }) => {
    const user = await UserFactory.merge({ password: validPassword }).create()

    const response = await client
      .delete(`/users/${user.id}`)
      .json({ password: validPassword })
      .loginAs(user)

    assert.equal(response.response.statusCode, 204) // No Content

    // Ensure user no longer exists
    const deletedUser = await User.find(user.id)
    assert.isNull(deletedUser)
  })

  test('return 401 when attempting to delete user without authentication', async ({ assert, client }) => {
    const user = await UserFactory.merge({ password: validPassword }).create()

    // Make an unauthenticated request
    const response = await client
      .delete(`/users/${user.id}`)
      .json({ password: validPassword })

    assert.equal(response.response.statusCode, 401) // Unauthorized
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })

  test('return 404 if the user does not exist', async ({ assert, client }) => {
    const nonExistentUserId = 9999
    const user = await UserFactory.merge({ admin: true }).create()

    const response = await client
      .delete(`/users/${nonExistentUserId}`)
      .json({ password: validPassword })
      .loginAs(user)

    assert.equal(response.response.statusCode, 404) // Not Found
    assert.equal(
      response.response.body.message,
      `User ${nonExistentUserId} not found`
    )
  })

  test('return 403 if not authorised to delete another user', async ({ assert, client }) => {
    const user = await UserFactory.merge({ password: validPassword }).create()
    const otherUser = await UserFactory.merge({ admin: false }).create()

    const response = await client
      .delete(`/users/${user.id}`)
      .json({ password: validPassword })
      .loginAs(otherUser)

    assert.equal(response.response.statusCode, 403) // Forbidden
    assert.equal(
      response.response.body.message,
      'You are not authorised to delete this user'
    )
  })

  test('return 422 if the password is missing', async ({ assert, client }) => {
    const user = await UserFactory.merge({ password: validPassword }).create()

    const response = await client
      .delete(`/users/${user.id}`)
      .json({}) // No password
      .loginAs(user)

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(
      response.response.body.message,
      'The password field must be defined'
    )
  })

  test('return 422 if the password is an incorrect datatype', async ({ assert, client }) => {
    const user = await UserFactory.merge({ password: validPassword }).create()

    const response = await client
      .delete(`/users/${user.id}`)
      .json({ password: 12345 }) // Invalid data type for password
      .loginAs(user)

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(
      response.response.body.message,
      'The password field must be a string'
    )
  })

  test('return 401 if the password is incorrect', async ({ assert, client }) => {
    const user = await UserFactory.merge({ password: validPassword }).create()

    const response = await client
      .delete(`/users/${user.id}`)
      .json({ password: invalidPassword }) // Incorrect password
      .loginAs(user)

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(
      response.response.body.message,
      'The current password was incorrect'
    )
  })

  test('allow admin to delete any user', async ({ assert, client }) => {
    const admin = await UserFactory.merge({ admin: true }).create()
    const user = await UserFactory.create()

    const response = await client
      .delete(`/users/${user.id}`)
      .loginAs(admin) // Admin does not need to provide target user's password

    assert.equal(response.response.statusCode, 204) // No Content

    // Ensure user no longer exists
    const deletedUser = await User.find(user.id)
    assert.isNull(deletedUser)
  })
})
