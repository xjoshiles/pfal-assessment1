import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group("Update Admin Status of User by ID", (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let adminUser: any
  let regularUser: any
  const validAdminStatus = true
  const invalidAdminStatus = false
  const invalidStatus = "invalid" // Invalid admin status for validation

  group.each.setup(async () => {
    // Create an admin user before each setup
    adminUser = await UserFactory.merge({ admin: true }).create()

    // Create a regular user before each setup
    regularUser = await UserFactory.create()
  })

  test('admin user can update another user to admin', async ({ assert, client }) => {
    // Admin user updates a regular user's admin status to true
    const response = await client
      .put(`/users/${regularUser.id}/admin`)
      .loginAs(adminUser) // Log in as an admin user
      .json({ admin: validAdminStatus })

    assert.equal(response.response.statusCode, 200) // OK
    assert.isTrue(response.response.body.admin)     // check returned user

    // Fetch updated user and check if admin status is true
    const updatedUser = await User.find(regularUser.id)
    assert.isTrue(Boolean(updatedUser!.admin))
  })

  test('Return 401 when attempting to update another user to admin without authentication', async ({ assert, client }) => {
    // Make an unauthenticated request
    const response = await client
      .put(`/users/${regularUser.id}/admin`)
      .json({ admin: validAdminStatus })

    assert.equal(response.response.statusCode, 401) // Unauthorized
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })

  test('admin cannot remove their own admin status', async ({ assert, client }) => {
    // Admin user tries to remove their own admin status
    const response = await client
      .put(`/users/${adminUser.id}/admin`)
      .loginAs(adminUser) // Log in as the same admin user
      .json({ admin: invalidAdminStatus })

    assert.equal(response.response.statusCode, 403) // Forbidden
    assert.equal(
      response.response.body.message,
      'Only another admin can remove your admin status')
  })

  test('only an admin can update a user\'s admin status', async ({ assert, client }) => {
    // Regular user tries to update another user’s admin status
    const response = await client
      .put(`/users/${regularUser.id}/admin`)
      .loginAs(regularUser) // Log in as a regular user
      .json({ admin: validAdminStatus })

    assert.equal(response.response.statusCode, 403) // Forbidden
    assert.equal(
      response.response.body.message,
      'You are not authorised to make this user an admin'
    )
  })

  test('return 404 if user to update does not exist', async ({ assert, client }) => {
    // Admin user tries to update a non-existent user’s admin status
    const nonExistentUserId = 9999
    const response = await client
      .put(`/users/${nonExistentUserId}/admin`)
      .loginAs(adminUser) // Log in as admin user
      .json({ admin: validAdminStatus })

    assert.equal(response.response.statusCode, 404) // Not Found
    assert.equal(
      response.response.body.message,
      `User ${nonExistentUserId} not found`
    )
  })

  test('return 422 when required fields are missing', async ({ assert, client }) => {
    // Admin user tries to set an invalid admin status
    const response = await client
      .put(`/users/${regularUser.id}/admin`)
      .loginAs(adminUser)  // Log in as admin user
      .json({})            // Missing admin status

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(
      response.response.body.message,
      'The admin field must be defined'
    )
  })

  test('return 422 if invalid admin status is provided', async ({ assert, client }) => {
    // Admin user tries to set an invalid admin status
    const response = await client
      .put(`/users/${regularUser.id}/admin`)
      .loginAs(adminUser) // Log in as admin user
      .json({ admin: invalidStatus }) // Invalid admin status

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(
      response.response.body.message,
      'The admin field must be a boolean value'
    )
  })
})
