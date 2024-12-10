import { test } from '@japa/runner'
import { UpdateUserValidator } from '#validators/update_user'
import { errors } from '@vinejs/vine'

test.group('UpdateUserValidator', () => {
  const invalidNewPassword = 'short'       // less than 6 character min
  const validNewPassword = 'newPassword123'

  test('fail when password is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await UpdateUserValidator.validate({
        newPassword: validNewPassword
      })
    })
  })

  test('fail when newPassword is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await UpdateUserValidator.validate({
        password: 'securePassword123'
      })
    })
  })

  test('pass when password and newPassword are both valid', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await UpdateUserValidator.validate({
        password: 'securePassword123',
        newPassword: validNewPassword
      })
    })
  })

  test('fail when newPassword is less than 6 characters', async ({ assert }) => {
    await assert.rejects(async () => {
      await UpdateUserValidator.validate({
        password: 'securePassword123',
        newPassword: invalidNewPassword
      })
    })
  })

  test('custom error message when newPassword is less than 6 characters', async ({ assert }) => {
    try {
      await UpdateUserValidator.validate({
        password: 'securePassword123',
        newPassword: invalidNewPassword
      })

      assert.fail('Validation should have thrown an error')

    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        assert.equal(
          error.messages[0].message,
          'The new password must be at least 6 characters'
        )
      } else {
        throw error
      }
    }
  })
})
