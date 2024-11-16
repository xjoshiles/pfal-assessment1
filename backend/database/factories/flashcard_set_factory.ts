import factory from '@adonisjs/lucid/factories'
import FlashcardSet from '#models/flashcard_set'

export const FlashcardSetFactory = factory
  .define(FlashcardSet, async ({ faker }) => {
    return {}
  })
  .build()