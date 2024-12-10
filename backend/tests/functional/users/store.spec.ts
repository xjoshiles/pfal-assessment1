import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User Registration (store)', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const validUsername = 'username'
  const invalidShortUsername = 'aa'          // less than 3 character min
  const invalidLongUsername = 'a'.repeat(13) // exceeds 12 character max
  const validPassword = 'password'
  const invalidShortPassowrd = '12345'       // less than 5 character min

  test('successfully register a new user with valid credentials', async ({ assert, client }) => {
    const user = await UserFactory.make()

    const response = await client
      .post('/users')
      .json({ username: user.username, password: user.password })

    assert.equal(response.response.statusCode, 201)
    assert.equal(response.response.body.username, user.username)
  })

  test('return 409 when trying to register with an already taken username', async ({ assert, client }) => {
    // Create a user first
    const existingUser = await UserFactory.create()

    const user = await UserFactory.merge({
      username: existingUser.username
    }).make()

    // Attempt to register user with same username as existingUser
    const response = await client
      .post('/users')
      .json({ username: user.username, password: user.password })

    assert.equal(response.response.statusCode, 409) // Conflict
    assert.equal(
      response.response.body.message,
      'The username has already been taken'
    )
  })

  test('return 422 when the username is too short', async ({ assert, client }) => {
    const response = await client
      .post('/users')
      .json({ username: invalidShortUsername, password: validPassword })

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
  })

  test('return 422 when the username is too long', async ({ assert, client }) => {
    const response = await client
      .post('/users')
      .json({ username: invalidLongUsername, password: validPassword })

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
  })

  test('return 422 when the password is too short', async ({ assert, client }) => {
    const response = await client
      .post('/users')
      .json({ username: validUsername, password: invalidShortPassowrd })

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
  })

  test('return 422 when required fields are missing', async ({ assert, client }) => {
    const response = await client
      .post('/users')
      .json({}) // No username and password

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
  })

  test('return 422 for incorrect data types', async ({ assert, client }) => {
    const response = await client
      .post('/users')
      .json({ username: 12345, password: 'password' })

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
  })
})
