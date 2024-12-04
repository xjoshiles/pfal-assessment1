import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const UpdateUserValidator = vine.compile(
  vine.object({
    password: vine.string().trim(),
    newPassword: vine.string().trim().minLength(6)
  })
)

UpdateUserValidator.messagesProvider = new SimpleMessagesProvider({
  'newPassword.minLength': 'The new password must be at least {{ min }} characters'
})

export { UpdateUserValidator }
