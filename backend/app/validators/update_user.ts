import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const UpdateUserValidator = vine.compile(
  vine.object({
    password: vine
      .string()
      .trim()
      .optional()
      .requiredIfExists('newPassword'),
    newPassword: vine
      .string()
      .trim()
      .minLength(6)
      .optional()
      .requiredIfExists('password'),
    admin: vine
      .boolean()
      .optional()
      .requiredIfMissing('password')
  })
)

UpdateUserValidator.messagesProvider = new SimpleMessagesProvider({
  'newPassword.minLength': 'The new password must be at least {{ min }} characters'
})

export { UpdateUserValidator }
