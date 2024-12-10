import { test } from '@japa/runner'
import { ToggleAdminValidator } from '#validators/toggle_admin'
import { errors } from '@vinejs/vine'

test.group('ToggleAdminValidator', () => {
  test('fail when admin is missing', async ({ assert }) => {
    await assert.rejects(async () => {
      await ToggleAdminValidator.validate({})
    })
  })

  test('fail when admin is not a boolean', async ({ assert }) => {
    await assert.rejects(async () => {
      await ToggleAdminValidator.validate({ admin: 'notABoolean' })
    })
  })

  test('custom error message when admin is not a boolean', async ({ assert }) => {
    try {
      await ToggleAdminValidator.validate({ admin: 'notABoolean' })
      assert.fail('Validation should have thrown an error')

    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        assert.equal(
          error.messages[0].message,
          'The admin field must be a boolean value'
        )
      } else {
        throw error
      }
    }
  })

  test('pass when admin is true', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await ToggleAdminValidator.validate({ admin: true })
    })
  })

  test('pass when admin is false', async ({ assert }) => {
    assert.doesNotThrow(async () => {
      await ToggleAdminValidator.validate({ admin: false })
    })
  })
})
