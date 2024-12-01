import vine from '@vinejs/vine'

export const DeleteUserValidator = vine.compile(
  vine.object({
    password: vine.string().trim()
  })
)
