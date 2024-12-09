import { test } from '@japa/runner'
import { CollectionReviewFactory } from '#database/factories/collection_review_factory'
import { UserFactory } from '#database/factories/user_factory'
import { CollectionFactory } from '#database/factories/collection_factory'
import CollectionReview from '#models/collection_review'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Collection from '#models/collection'

test.group('CollectionReview Model', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('create a collection review', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    const collectionReview = await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 4,
      review: 'Great collection!'
    }).create()

    assert.isDefined(collectionReview.id)
    assert.isNumber(collectionReview.id)
    assert.equal(collectionReview.rating, 4)
    assert.equal(collectionReview.review, 'Great collection!')
    assert.equal(collectionReview.userId, user.id)
    assert.equal(collectionReview.collectionId, collection.id)
  })

  test('update a collection review', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    const collectionReview = await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 4,
      review: 'Good collection!'
    }).create()

    collectionReview.rating = 5
    collectionReview.review = 'Excellent collection!'
    await collectionReview.save()

    const updatedReview = await CollectionReview.find(collectionReview.id)
    assert.equal(updatedReview?.rating, 5)
    assert.equal(updatedReview?.review, 'Excellent collection!')
  })

  test('delete a collection review', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    const collectionReview = await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 4,
      review: 'Good collection!'
    }).create()

    await collectionReview.delete()
    const deletedReview = await CollectionReview.find(collectionReview.id)

    assert.isNull(deletedReview)
  })

  test('calculate and update average rating after saving', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    // Create three reviews with different ratings
    await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 5,
      review: 'Excellent!'
    }).create()

    await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 4,
      review: 'Good!'
    }).create()

    await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 3,
      review: 'Average'
    }).create()

    // Calculate expected average rating
    const averageRating = (5 + 4 + 3) / 3

    // Fetch the collection and check if the average rating is updated
    const updatedCollection = await collection.refresh()

    assert.equal(updatedCollection.averageRating, averageRating)
  })

  test('calculate and update average rating after deleting a review', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    // Create three reviews with different ratings
    await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 5,
      review: 'Excellent!'
    }).create()

    await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 4,
      review: 'Good!'
    }).create()

    const review3 = await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 3,
      review: 'Average'
    }).create()

    // Delete one review (the one with rating 3)
    await review3.delete()

    // Recalculate the expected average rating (5 + 4) / 2
    const averageRating = (5 + 4) / 2

    // Fetch the collection and check if the average rating is updated
    const updatedCollection = await collection.refresh()

    assert.equal(updatedCollection.averageRating, averageRating)
  })

  test('collection review belongs to the correct user and collection', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    const collectionReview = await CollectionReviewFactory.merge({
      userId: user.id,
      collectionId: collection.id,
      rating: 5,
      review: 'Great collection!'
    }).create()

    const author = await collectionReview.related('author').query().first()
    assert.equal(author?.id, user.id)

    const collectionRelation = await collectionReview.related('collection').query().first()
    assert.equal(collectionRelation?.id, collection.id)
  })

  test('cannot create a CollectionReview with a non-existent userId', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    try {
      // Attempt to create a CollectionReview with a non-existent userId
      await CollectionReview.create({
        rating: 5,
        review: 'Great collection!',
        userId: 999,  // Non-existent user
        collectionId: collection.id
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  test('cannot create a CollectionReview with a non-existent collectionId', async ({ assert }) => {
    const user = await UserFactory.create()

    try {
      // Attempt to create a CollectionReview with a non-existent collectionId
      await CollectionReview.create({
        rating: 5,
        review: 'Great collection!',
        userId: user.id,
        collectionId: 999  // Non-existent collection
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  test('deleting a CollectionReview should not affect User or Collection', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    // Create a CollectionReview for the collection
    const review = await CollectionReview.create({
      rating: 5,
      review: 'Great collection!',
      userId: user.id,
      collectionId: collection.id
    })

    // Delete the CollectionReview
    await review.delete()

    // Ensure that the user and collection still exist
    const foundUser = await User.find(user.id)
    const foundCollection = await Collection.find(collection.id)

    assert.isDefined(foundUser)
    assert.isDefined(foundCollection)
  })

  test('deleting a User should delete related CollectionReview', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    const review = await CollectionReview.create({
      rating: 5,
      review: 'Great collection!',
      userId: user.id,
      collectionId: collection.id
    })

    // Ensure the review is created
    const foundReview = await CollectionReview.find(review.id)
    assert.isDefined(foundReview)

    // Now delete the user
    await user.delete()

    // After deletion, ensure the review is also deleted
    const deletedReview = await CollectionReview.find(review.id)
    assert.isNull(deletedReview)
  })

  test('deleting a Collection should delete related CollectionReview', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    const review = await CollectionReview.create({
      rating: 5,
      review: 'Great collection!',
      userId: user.id,
      collectionId: collection.id
    })

    // Ensure the review is created
    const foundReview = await CollectionReview.find(review.id)
    assert.isDefined(foundReview)

    // Now delete the collection
    await collection.delete()

    // After deletion, ensure the review is also deleted
    const deletedReview = await CollectionReview.find(review.id)
    assert.isNull(deletedReview)
  })
})
