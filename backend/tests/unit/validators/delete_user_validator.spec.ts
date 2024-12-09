import { test } from '@japa/runner'
import { DeleteUserValidator } from '#validators/delete_user'

test.group('DeleteUserValidator', () => {
  test('fail when password is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await DeleteUserValidator.validate({})
    })
  })

  test('fail when password is not a string', async ({ assert }) => {
    await assert.rejects(async () => {
      await DeleteUserValidator.validate({ password: 12345 })
    })
  })

  test('pass when password is a string', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await DeleteUserValidator.validate({ password: 'securePassword123' })
    })
  })
})
