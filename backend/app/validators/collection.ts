import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const CollectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().minLength(1).maxLength(255),
    flashcardSetIds: vine.array(
      vine.number()
        .withoutDecimals()
        .min(1)
    ).notEmpty()
  })
)

CollectionValidator.messagesProvider = new SimpleMessagesProvider({
  'flashcardSetIds.notEmpty': 'The collection must contain at least one set'
})

export { CollectionValidator }