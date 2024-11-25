import vine from '@vinejs/vine'

export const ReviewValidator = vine.compile(
  vine.object({
    rating: vine.number().withoutDecimals().min(1).max(5),
    review: vine.string().trim().minLength(3).maxLength(500)
  })
)