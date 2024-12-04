import vine from '@vinejs/vine'

export const LimitValidator = vine.compile(
  vine.object({
    limit: vine.number().withoutDecimals().min(0)
  })
)