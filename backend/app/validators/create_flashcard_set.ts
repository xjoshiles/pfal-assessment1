import vine from '@vinejs/vine'

export const CreateFlashcardSetValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    flashcards: vine.array(
      vine.object({
        id: vine.number().optional(), // Optional id allows new flashcards
        question: vine.string().trim().minLength(1).maxLength(255),
        answer: vine.string().trim().minLength(1).maxLength(255),
        difficulty: vine.enum(['easy', 'medium', 'hard'])
      })
    )
  })
)
