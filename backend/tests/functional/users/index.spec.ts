import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Get All Users', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('successfully retrieve all users when authenticated', async ({ assert, client }) => {
    const admin = await UserFactory.merge({ admin: true }).create()
    await UserFactory.createMany(3) // Create additional users

    const response = await client.get('/users').loginAs(admin)

    assert.equal(response.response.statusCode, 200) // OK
    assert.isArray(response.response.body)
    assert.lengthOf(response.response.body, 4) // 1 admin + 3 users
  })

  test('return 401 when trying to retrieve all users without authentication', async ({ assert, client }) => {
    const response = await client.get('/users')

    assert.equal(response.response.statusCode, 401) // Unauthorized
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })
})
