import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const ToggleAdminValidator = vine.compile(
  vine.object({
    admin: vine.boolean()
  })
)

ToggleAdminValidator.messagesProvider = new SimpleMessagesProvider({
  'admin.boolean': 'The admin field must be a boolean value'
})

export { ToggleAdminValidator }
