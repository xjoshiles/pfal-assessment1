import { test } from '@japa/runner'
import { CollectionFactory } from '#database/factories/collection_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Collection from '#models/collection'
import FlashcardSet from '#models/flashcard_set'
import User from '#models/user'

test.group('Collection Model', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('create a collection', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await CollectionFactory.merge({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    }).create()

    assert.isDefined(collection.id)
    assert.isNumber(collection.id)
    assert.equal(collection.name, 'Test Collection')
    assert.equal(collection.description, 'A description of the collection')
    assert.equal(collection.userId, user.id)
    assert.equal(collection.averageRating, 4.5)
  })

  test('update a collection', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await CollectionFactory.merge({
      name: 'Old Collection',
      description: 'An old collection',
      userId: user.id,
      averageRating: 3.0
    }).create()

    collection.name = 'Updated Collection'
    collection.description = 'This is the updated collection'
    collection.averageRating = 4.0
    await collection.save()

    const updatedCollection = await Collection.find(collection.id)
    assert.equal(updatedCollection?.name, 'Updated Collection')
    assert.equal(updatedCollection?.description, 'This is the updated collection')
    assert.equal(updatedCollection?.averageRating, 4.0)
  })

  test('delete a collection', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await CollectionFactory.merge({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    }).create()

    await collection.delete()

    const deletedCollection = await Collection.find(collection.id)
    assert.isNull(deletedCollection)
  })

  test('collection belongs to the correct user (creator)', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await CollectionFactory.merge({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    }).create()

    const creator = await collection.related('creator').query().first()
    assert.equal(creator?.id, user.id)
  })

  test('collection has correct flashcard sets associated with it', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await CollectionFactory.merge({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    }).create()

    const flashcardSet1 = await FlashcardSetFactory.merge({
      name: 'Flashcard Set 1',
      description: 'Set 1 description',
      userId: user.id,
      averageRating: 4
    }).create()

    const flashcardSet2 = await FlashcardSetFactory.merge({
      name: 'Flashcard Set 2',
      description: 'Set 2 description',
      userId: user.id,
      averageRating: 4.5
    }).create()

    // Attach flashcard sets to collection
    await collection.related('flashcardSets').attach(
      [flashcardSet1.id, flashcardSet2.id]
    )

    const flashcardSets = await collection.related('flashcardSets').query()
    assert.isArray(flashcardSets)
    assert.lengthOf(flashcardSets, 2)
    assert.includeMembers(
      flashcardSets.map((set) => set.id),
      [flashcardSet1.id, flashcardSet2.id]
    )
  })

  test('collection has correct reviews associated with it', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await CollectionFactory.merge({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    }).create()

    // Create reviews for collection
    await collection.related('reviews').createMany([
      { rating: 5, review: 'Excellent collection' },
      { rating: 4, review: 'Good collection, but can be improved' }
    ])

    const reviews = await collection.related('reviews').query()
    assert.isArray(reviews)
    assert.lengthOf(reviews, 2)
    assert.includeMembers(
      reviews.map((review) => review.review),
      ['Excellent collection', 'Good collection, but can be improved']
    )
  })

  test('cannot create a collection with a non-existent userId', async ({ assert }) => {
    try {
      // Attempt to create a Collection with a non-existent userId
      await Collection.create({
        name: 'Test Collection',
        description: 'A description of the collection',
        userId: 999,  // Non-existent user
        averageRating: 4.5
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  test('deleting a User should delete related Collection', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await Collection.create({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    })

    // Ensure the collection is created
    const foundCollection = await Collection.find(collection.id)
    assert.isDefined(foundCollection)

    // Now delete the user
    await user.delete()

    // After deletion, ensure the collection is also deleted
    const deletedCollection = await Collection.find(collection.id)
    assert.isNull(deletedCollection)
  })

  test('deleting a Collection should not affect the User', async ({ assert }) => {
    const user = await UserFactory.create()

    const collection = await Collection.create({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    })

    // Delete the collection
    await collection.delete()

    // Ensure the user still exists
    const foundUser = await User.find(user.id)
    assert.isDefined(foundUser)
  })

  test('deleting a Collection should delete related entries in the pivot table', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Flashcard Set 1',
      description: 'Set 1 description',
      userId: user.id,
      averageRating: 4
    }).create()

    const collection = await Collection.create({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    })

    // Attach the flashcard set to the collection
    await collection.related('flashcardSets').attach([flashcardSet.id])

    // Verify the relation exists in the pivot table
    const relation = await collection.related('flashcardSets').query()
      .where('flashcard_set_id', flashcardSet.id).first()
    assert.isDefined(relation)

    // Now delete the collection
    await collection.delete()

    // After deletion, ensure the pivot table relationship is deleted
    const deletedRelation = await collection.related('flashcardSets').query()
      .where('flashcard_set_id', flashcardSet.id).first()
    assert.isNull(deletedRelation)

    // Ensure the flashcard set still exists
    const foundFlashcardSet = await FlashcardSet.find(flashcardSet.id)
    assert.isDefined(foundFlashcardSet)
  })

  test('deleting a Collection should not affect the FlashcardSets', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Flashcard Set 1',
      description: 'Set 1 description',
      userId: user.id,
      averageRating: 4
    }).create()

    const collection = await Collection.create({
      name: 'Test Collection',
      description: 'A description of the collection',
      userId: user.id,
      averageRating: 4.5
    })

    // Attach the flashcard set to the collection
    await collection.related('flashcardSets').attach([flashcardSet.id])

    // Delete the collection
    await collection.delete()

    // Ensure the flashcard set still exists
    const foundFlashcardSet = await FlashcardSet.find(flashcardSet.id)
    assert.isDefined(foundFlashcardSet)
  })
})
