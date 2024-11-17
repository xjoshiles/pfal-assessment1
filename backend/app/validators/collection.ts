import vine from '@vinejs/vine'

export const CollectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    flashcardSetIds: vine.array(vine.number()).optional()
  })
)