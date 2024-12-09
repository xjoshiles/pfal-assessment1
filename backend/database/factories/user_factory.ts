import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { SetReviewFactory } from '#database/factories/set_review_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import { CollectionReviewFactory } from '#database/factories/collection_review_factory'
import { CollectionFactory } from '#database/factories/collection_factory'

export const UserFactory = factory
  .define(User, ({ faker }) => {
    return {
      username: faker.internet.username(),
      password: faker.internet.password(),
      admin: false  // Default is false, will be overridden when needed
    }
  })
  .relation('setReviews', () => SetReviewFactory)
  .relation('flashcardSets', () => FlashcardSetFactory)
  .relation('collectionReviews', () => CollectionReviewFactory)
  .relation('collections', () => CollectionFactory)
  .build()
