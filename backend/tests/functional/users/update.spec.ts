import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group("Update a user's password by ID", (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let user: any
  let anotherUser: any
  const validPassword = 'validPassword123'
  const invalidPassword = 'wrongPassword123'
  const validNewPassword = 'validNewPassword123'
  const invalidNewPassword = 'new1'  // less than 6 character min

  // Create users for testing before each test
  group.each.setup(async () => {
    user = await UserFactory.merge({ password: validPassword }).create()
    anotherUser = await UserFactory.create()
  })

  test('successfully update password with correct current password', async ({ assert, client }) => {
    const response = await client
      .put(`/users/${user.id}`)
      .loginAs(user)  // Authenticated as user
      .json({
        password: validPassword,
        newPassword: validNewPassword,
      })

    assert.equal(response.status(), 200)
    assert.equal(response.body().message, 'Password updated successfully')
  })

  test('return 401 when attempting to update password without authentication', async ({ assert, client }) => {
    // Make an unauthenticated request
    const response = await client
      .put(`/users/${user.id}`)
      .json({
        password: validPassword,
        newPassword: validNewPassword,
      })

    assert.equal(response.response.statusCode, 401) // Unauthorized
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })

  test('return 403 when attempting to update someone else\'s password', async ({ assert, client }) => {
    const response = await client
      .put(`/users/${user.id}`)
      .loginAs(anotherUser)  // Authenticated as another user
      .json({
        password: validPassword,
        newPassword: validNewPassword,
      })

    assert.equal(response.status(), 403)  // Forbidden
    assert.equal(
      response.body().message,
      "You are not authorised to update this user's password"
    )
  })

  test('return 401 when the current password is incorrect', async ({ assert, client }) => {
    const response = await client
      .put(`/users/${user.id}`)
      .loginAs(user)  // Authenticated as user
      .json({
        password: invalidPassword,  // Incorrect password
        newPassword: validNewPassword,
      })

    assert.equal(response.status(), 401)  // Unauthorized
    assert.equal(response.body().message, 'The current password was incorrect')
  })

  test('return 422 when the new password does not meet the requirements', async ({ assert, client }) => {
    const response = await client
      .put(`/users/${user.id}`)
      .loginAs(user)  // Authenticated as user
      .json({
        password: validPassword,
        newPassword: invalidNewPassword,  // New password is too short
      })

    assert.equal(response.status(), 422)  // Unprocessable Entity
    assert.equal(
      response.body().message,
      'The new password must be at least 6 characters'
    )
  })

  test('return 422 when required fields are missing', async ({ assert, client }) => {
    const response = await client
      .put(`/users/${user.id}`)
      .loginAs(user)  // Authenticated as user
      .json({})       // Missing password and newPassword

    assert.equal(response.status(), 422)  // Unprocessable Entity
  })

  test('return 422 for incorrect data types in password fields', async ({ assert, client }) => {
    const response = await client
      .put(`/users/${user.id}`)
      .loginAs(user)      // Authenticated as user
      .json({
        password: 12345,  // Invalid data type for password
        newPassword: 'newValidPassword123',
      })

    assert.equal(response.status(), 422)  // Unprocessable Entity
    assert.equal(
      response.body().message,
      'The password field must be a string'
    )
  })
})
