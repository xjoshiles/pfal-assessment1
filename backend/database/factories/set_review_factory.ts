import factory from '@adonisjs/lucid/factories'
import SetReview from '#models/set_review'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'

export const SetReviewFactory = factory
  .define(SetReview, async ({ faker }) => {
    return {
      rating: faker.number.int({ min: 1, max: 5 }),
      review: faker.lorem.sentence()
    }
  })
  .relation('author', () => UserFactory)
  .relation('flashcardSet', () => FlashcardSetFactory)
  .build()
