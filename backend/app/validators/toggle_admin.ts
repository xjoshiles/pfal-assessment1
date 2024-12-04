import vine from '@vinejs/vine'

export const ToggleAdminValidator = vine.compile(
  vine.object({
    admin: vine.boolean()
  })
)
