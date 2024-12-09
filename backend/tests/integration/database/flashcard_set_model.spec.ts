import { test } from '@japa/runner'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import { UserFactory } from '#database/factories/user_factory'
import { CollectionFactory } from '#database/factories/collection_factory'
import { FlashcardFactory } from '#database/factories/flashcard_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import FlashcardSet from '#models/flashcard_set'
import Collection from '#models/collection'
import User from '#models/user'

test.group('FlashcardSet Model', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('create a flashcard set', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 0
    }).create()

    assert.isDefined(flashcardSet.id)
    assert.isNumber(flashcardSet.id)
    assert.equal(flashcardSet.name, 'Test Flashcard Set')
    assert.equal(flashcardSet.description, 'A description')
    assert.equal(flashcardSet.userId, user.id)
    assert.equal(flashcardSet.averageRating, 0)
  })

  test('update a flashcard set', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Old Set',
      description: 'This is an old flashcard set',
      userId: user.id,
      averageRating: 0
    }).create()

    flashcardSet.name = 'Updated Set'
    flashcardSet.description = 'This is an updated flashcard set'
    flashcardSet.averageRating = 4
    await flashcardSet.save()

    const updatedSet = await FlashcardSet.find(flashcardSet.id)
    assert.equal(updatedSet?.name, 'Updated Set')
    assert.equal(updatedSet?.description, 'This is an updated flashcard set')
    assert.equal(updatedSet?.averageRating, 4)
  })

  test('delete a flashcard set', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 0
    }).create()

    await flashcardSet.delete()

    const deletedSet = await FlashcardSet.find(flashcardSet.id)
    assert.isNull(deletedSet)
  })

  test('flashcard set belongs to the correct user (creator)', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 0
    }).create()

    const creator = await flashcardSet.related('creator').query().first()
    assert.equal(creator?.id, user.id)
  })

  test('flashcard set has correct flashcards associated with it', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard1 = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4'
    }).create()

    const flashcard2 = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 3+5?',
      answer: '8'
    }).create()

    const flashcards = await flashcardSet.related('flashcards').query()
    assert.isArray(flashcards)
    assert.lengthOf(flashcards, 2)
    assert.includeMembers(
      flashcards.map((flashcard) => flashcard.id),
      [flashcard1.id, flashcard2.id]
    )
  })

  test('flashcard set is correctly associated with collections', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 0
    }).create()

    const collection = await CollectionFactory.merge({ userId: user.id }).create()

    await collection.related('flashcardSets').attach([flashcardSet.id])

    const collections = await flashcardSet.related('collections').query()
    assert.isArray(collections)
    assert.lengthOf(collections, 1)
    assert.includeMembers(collections.map((col) => col.id), [collection.id])
  })

  test('flashcard set has correct reviews associated with it', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 0
    }).create()

    // Create reviews for the flashcard set
    await flashcardSet.related('reviews').createMany([
      { rating: 5, review: 'Great set of flashcards!' },
      { rating: 4, review: 'Good set, but could use more questions' }
    ])

    const reviews = await flashcardSet.related('reviews').query()
    assert.isArray(reviews)
    assert.lengthOf(reviews, 2)
    assert.includeMembers(reviews.map((review) => review.review), [
      'Great set of flashcards!',
      'Good set, but could use more questions'
    ])
  })

  test('cannot create a FlashcardSet with a non-existent userId', async ({ assert }) => {
    try {
      // Attempt to create a FlashcardSet with a non-existent userId
      await FlashcardSet.create({
        name: 'Test Flashcard Set',
        description: 'A description',
        userId: 999,  // Non-existent user
        averageRating: 4.5
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  test('deleting a User should delete related FlashcardSet', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSet.create({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 4.5
    })

    // Ensure the flashcard set is created
    const foundSet = await FlashcardSet.find(flashcardSet.id)
    assert.isDefined(foundSet)

    // Now delete the user
    await user.delete()

    // After deletion, ensure the flashcard set is also deleted
    const deletedSet = await FlashcardSet.find(flashcardSet.id)
    assert.isNull(deletedSet)
  })

  test('deleting a FlashcardSet should not affect User', async ({ assert }) => {
    const user = await UserFactory.create()

    const flashcardSet = await FlashcardSet.create({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 4.5
    })

    // Delete the FlashcardSet
    await flashcardSet.delete()

    // Ensure the user still exists
    const foundUser = await User.find(user.id)
    assert.isDefined(foundUser)
  })

  test('deleting a FlashcardSet should delete related entries in the pivot table', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()
    const flashcardSet = await FlashcardSet.create({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 4.5
    })

    // Attach the flashcard set to the collection
    await collection.related('flashcardSets').attach([flashcardSet.id])

    // Verify the relation in the pivot table exists
    const relation = await collection.related('flashcardSets').query()
      .where('flashcard_set_id', flashcardSet.id).first()
    assert.isDefined(relation)

    // Now delete the flashcard set
    await flashcardSet.delete()

    // After deletion, ensure the pivot table relationship
    // is deleted, and that the collection still exists
    const deletedRelation = await collection.related('flashcardSets').query()
      .where('flashcard_set_id', flashcardSet.id).first()
    assert.isNull(deletedRelation)

    // Ensure the collection is still intact
    const foundCollection = await Collection.find(collection.id)
    assert.isDefined(foundCollection)
  })

  test('deleting a FlashcardSet should not affect the Collection', async ({ assert }) => {
    const user = await UserFactory.create()
    const collection = await CollectionFactory.merge({ userId: user.id }).create()
    const flashcardSet = await FlashcardSet.create({
      name: 'Test Flashcard Set',
      description: 'A description',
      userId: user.id,
      averageRating: 4.5
    })

    // Attach the flashcard set to the collection
    await collection.related('flashcardSets').attach([flashcardSet.id])

    // Delete the FlashcardSet
    await flashcardSet.delete()

    // Ensure the collection still exists and the FlashcardSet was deleted
    const foundCollection = await Collection.find(collection.id)
    assert.isDefined(foundCollection)
  })
})
