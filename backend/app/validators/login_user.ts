import vine from '@vinejs/vine'

export const LoginUserValidator = vine.compile(
  vine.object({
      username: vine.string(),
      password: vine.string()
  })
)
