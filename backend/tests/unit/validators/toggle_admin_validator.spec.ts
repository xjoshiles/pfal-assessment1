import { test } from '@japa/runner'
import { ToggleAdminValidator } from '#validators/toggle_admin'

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
