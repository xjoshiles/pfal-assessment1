import factory from '@adonisjs/lucid/factories'
import FlashcardSet from '#models/flashcard_set'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardFactory } from '#database/factories/flashcard_factory'
import { SetReviewFactory } from '#database/factories/set_review_factory'

export const FlashcardSetFactory = factory
  .define(FlashcardSet, async ({ faker }) => {
    return {
      name: faker.lorem.words(),
      description: faker.lorem.sentence(),
      // userId: faker.number.int({ min: 1 })
    }
  })
  .relation('flashcards', () => FlashcardFactory)
  .relation('reviews', () => SetReviewFactory)
  .relation('creator', () => UserFactory)
  .build()
