import vine from '@vinejs/vine'

export const CommentValidator = vine.compile(
  vine.object({
    comment: vine.string().trim().minLength(3).maxLength(500)
  })
)