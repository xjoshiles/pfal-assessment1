import factory from '@adonisjs/lucid/factories'
import CollectionReview from '#models/collection_review'
import { UserFactory } from '#database/factories/user_factory'
import { CollectionFactory } from '#database/factories/collection_factory'

export const CollectionReviewFactory = factory
  .define(CollectionReview, async ({ faker }) => {
    return {
      rating: faker.number.int({ min: 1, max: 5 }),
      review: faker.lorem.sentence()
    }
  })
  .relation('author', () => UserFactory)
  .relation('collection', () => CollectionFactory)
  .build()
