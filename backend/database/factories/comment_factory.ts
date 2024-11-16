import factory from '@adonisjs/lucid/factories'
import Comment from '#models/comment'

export const CommentFactory = factory
  .define(Comment, async ({ faker }) => {
    return {}
  })
  .build()