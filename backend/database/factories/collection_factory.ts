import factory from '@adonisjs/lucid/factories'
import Collection from '#models/collection'
import { CollectionReviewFactory } from '#database/factories/collection_review_factory'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'

export const CollectionFactory = factory
  .define(Collection, async ({ faker }) => {
    return {
      name: faker.lorem.words(),
      description: faker.lorem.sentence(),
    }
  })
  .relation('reviews', () => CollectionReviewFactory)
  .relation('creator', () => UserFactory)
  .relation('flashcardSets', () => FlashcardSetFactory)
  .build()
