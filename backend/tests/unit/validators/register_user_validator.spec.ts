import { test } from '@japa/runner'
import { RegisterUserValidator } from '#validators/register_user'
import db from '@adonisjs/lucid/services/db'
import { UserFactory } from '#database/factories/user_factory'

test.group('RegisterUserValidator', (group) => {
  // Clean up database before and after each test
  group.each.setup(async () => {
    await db.connection().truncate('users')
  })

  const validUsername = 'TestUser'
  const invalidShortUsername = 'ab'          // less than 3 character min
  const invalidLongUsername = 'a'.repeat(13) // exceeds 12 character max
  const validPassword = 'securePassword123'
  const invalidShortPassword = '12345'       // less than 6 character min

  test('fail when username is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await RegisterUserValidator.validate({
        password: validPassword
      })
    })
  })

  test('fail when username is less than 3 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await RegisterUserValidator.validate({
        username: invalidShortUsername,
        password: validPassword
      })
    })
  })

  test('fail when username exceeds 12 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await RegisterUserValidator.validate({
        username: invalidLongUsername,
        password: validPassword
      })
    })
  })

  test('fail when password is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await RegisterUserValidator.validate({
        username: validUsername
      })
    })
  })

  test('fail when password is less than 6 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await RegisterUserValidator.validate({
        username: validUsername,
        password: invalidShortPassword
      })
    })
  })

  test('fail when username is not unique', async ({ assert }) => {
    // Create a user with the same username
    await UserFactory.merge({ username: validUsername }).create()

    // Should fail as user with that username now already exists
    await assert.rejects(async () => {
      await RegisterUserValidator.validate({
        username: validUsername,
        password: validPassword
      })
    })
  })

  test('pass when username and password are valid and username is unique', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await RegisterUserValidator.validate({
        username: validUsername,
        password: validPassword
      })
    })
  })
})
