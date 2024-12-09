import { test } from '@japa/runner'
import { SetReviewFactory } from '#database/factories/set_review_factory'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import SetReview from '#models/set_review'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import FlashcardSet from '#models/flashcard_set'

test.group('SetReview Model', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('create a set review', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    const setReview = await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 4,
      review: 'Great set!'
    }).create()

    assert.isDefined(setReview.id)
    assert.isNumber(setReview.id)
    assert.equal(setReview.rating, 4)
    assert.equal(setReview.review, 'Great set!')
    assert.equal(setReview.userId, user.id)
    assert.equal(setReview.flashcardSetId, flashcardSet.id)
  })

  test('update a set review', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    const setReview = await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 4,
      review: 'Good set!'
    }).create()

    setReview.rating = 5
    setReview.review = 'Excellent set!'
    await setReview.save()

    const updatedReview = await SetReview.find(setReview.id)
    assert.equal(updatedReview?.rating, 5)
    assert.equal(updatedReview?.review, 'Excellent set!')
  })

  test('delete a set review', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    const setReview = await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 4,
      review: 'Good set!'
    }).create()

    await setReview.delete()
    const deletedReview = await SetReview.find(setReview.id)

    assert.isNull(deletedReview)
  })

  test('calculate and update average rating after saving', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    // Create three reviews with different ratings
    await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 5,
      review: 'Excellent!'
    }).create()

    await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 4,
      review: 'Good!'
    }).create()

    await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 3,
      review: 'Average'
    }).create()

    // Calculate expected average rating
    const averageRating = (5 + 4 + 3) / 3

    // Fetch the flashcard set and check if the average rating is updated
    const updatedFlashcardSet = await flashcardSet.refresh()

    assert.equal(updatedFlashcardSet.averageRating, averageRating)
  })

  test('calculate and update average rating after deleting a review', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    // Create three reviews with different ratings
    await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 5,
      review: 'Excellent!'
    }).create()

    await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 4,
      review: 'Good!'
    }).create()

    const review3 = await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 3,
      review: 'Average'
    }).create()

    // Delete one review (the one with rating 3)
    await review3.delete()

    // Recalculate the expected average rating (5 + 4) / 2
    const averageRating = (5 + 4) / 2

    // Fetch the flashcard set and check if the average rating is updated
    const updatedFlashcardSet = await flashcardSet.refresh()

    assert.equal(updatedFlashcardSet.averageRating, averageRating)
  })

  test('set review belongs to the correct user and flashcard set', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    const setReview = await SetReviewFactory.merge({
      userId: user.id,
      flashcardSetId: flashcardSet.id,
      rating: 5,
      review: 'Great flashcard set!'
    }).create()

    const author = await setReview.related('author').query().first()
    assert.equal(author?.id, user.id)

    const flashcardSetRelation = await setReview.related('flashcardSet').query().first()
    assert.equal(flashcardSetRelation?.id, flashcardSet.id)
  })

  test('cannot create a SetReview with a non-existent userId', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    try {
      // Attempt to create a SetReview with a non-existent userId
      await SetReview.create({
        rating: 5,
        review: 'Great flashcard set!',
        userId: 999,  // Non-existent user
        flashcardSetId: flashcardSet.id
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  test('cannot create a SetReview with a non-existent flashcardSetId', async ({ assert }) => {
    const user = await UserFactory.create()

    try {
      // Attempt to create a SetReview with a non-existent flashcardSetId
      await SetReview.create({
        rating: 5,
        review: 'Great flashcard set!',
        userId: user.id,
        flashcardSetId: 999  // Non-existent flashcard set
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  test('deleting a SetReview should not affect User or FlashcardSet', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    // Create a SetReview for the flashcard set
    const review = await SetReview.create({
      rating: 5,
      review: 'Great set!',
      userId: user.id,
      flashcardSetId: flashcardSet.id
    })

    // Delete the SetReview
    await review.delete()

    // Ensure that the user and flashcard set still exist
    const foundUser = await User.find(user.id)
    const foundFlashcardSet = await FlashcardSet.find(flashcardSet.id)

    assert.isDefined(foundUser)
    assert.isDefined(foundFlashcardSet)
  })

  test('deleting a User should delete related SetReview', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    const review = await SetReview.create({
      rating: 5,
      review: 'Great set!',
      userId: user.id,
      flashcardSetId: flashcardSet.id
    })

    // Ensure the review is created
    const foundReview = await SetReview.find(review.id)
    assert.isDefined(foundReview)

    // Now delete the user
    await user.delete()

    // After deletion, ensure the review is also deleted
    const deletedReview = await SetReview.find(review.id)
    assert.isNull(deletedReview)
  })

  test('deleting a FlashcardSet should delete related SetReview', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()

    const review = await SetReview.create({
      rating: 5,
      review: 'Great set!',
      userId: user.id,
      flashcardSetId: flashcardSet.id
    })

    // Ensure the review is created
    const foundReview = await SetReview.find(review.id)
    assert.isDefined(foundReview)

    // Now delete the flashcard set
    await flashcardSet.delete()

    // After deletion, ensure the review is also deleted
    const deletedReview = await SetReview.find(review.id)
    assert.isNull(deletedReview)
  })
})
