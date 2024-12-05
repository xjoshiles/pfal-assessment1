import factory from '@adonisjs/lucid/factories'
import Comment from '#models/set_review'

export const CommentFactory = factory
  .define(Comment, async ({ faker }) => {
    return {}
  })
  .build()