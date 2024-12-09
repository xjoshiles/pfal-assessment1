import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User Login', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const validUsername = 'username'
  const validPassword = 'password'
  const invalidUsername = 'invalidUser'
  const invalidPassword = 'invalidPassword'

  test('successfully login with valid credentials', async ({ assert, client }) => {
    // Create a valid user first
    const user = await UserFactory.merge({
      username: validUsername,
      password: validPassword
    }).create()

    const response = await client
      .post('/login')
      .json({ username: user.username, password: validPassword })

    assert.equal(response.response.statusCode, 200) // OK
    assert.property(response.response.body, 'token')
    assert.property(response.response.body, 'user')
  })

  test('return 401 when login with invalid username', async ({ assert, client }) => {
    // Create a valid user first
    await UserFactory.merge({
      username: validUsername,
      password: validPassword
    }).create()

    // Attempt to login with invalid username
    const response = await client
      .post('/login')
      .json({ username: invalidUsername, password: validPassword })

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(response.response.body.message, 'Invalid username or password')
  })

  test('return 401 when login with invalid password', async ({ assert, client }) => {
    // Create a valid user first
    await UserFactory.merge({
      username: validUsername,
      password: validPassword
    }).create()

    // Attempt to login with invalid password
    const response = await client
      .post('/login')
      .json({ username: validUsername, password: invalidPassword })

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(response.response.body.message, 'Invalid username or password')
  })

  test('return 422 when username is missing', async ({ assert, client }) => {
    const response = await client
      .post('/login')
      .json({ password: validPassword }) // Missing username

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(response.response.body.message, 'Username or password was not provided')
  })

  test('return 422 when password is missing', async ({ assert, client }) => {
    const response = await client
      .post('/login')
      .json({ username: validUsername }) // Missing password

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(response.response.body.message, 'Username or password was not provided')
  })

  test('return 422 when required fields are missing', async ({ assert, client }) => {
    const response = await client
      .post('/login')
      .json({}) // No username and password

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(response.response.body.message, 'Username or password was not provided')
  })

  test('return 422 for incorrect data types', async ({ assert, client }) => {
    const response = await client
      .post('/login')
      .json({ username: 12345, password: 'password' }) // Invalid username type

    assert.equal(response.response.statusCode, 422) // Unprocessable Entity
    assert.equal(response.response.body.message, 'Username or password was not provided')
  })
})
