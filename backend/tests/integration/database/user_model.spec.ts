import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'
import { UserFactory } from '#database/factories/user_factory'

test.group('User Model', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('create a user', async ({ assert }) => {
    const user = await UserFactory.merge({
      username: 'test_user',
      admin: false
    }).create()

    assert.isDefined(user.id)
    assert.isNumber(user.id)
    assert.equal(user.username, 'test_user')
    assert.isFalse(user.admin)
  })

  test('validate password hashing', async ({ assert }) => {
    const user = await UserFactory.merge({
      password: 'securePassword123'
    }).create()

    assert.isTrue(await hash.verify(user.password, 'securePassword123'))
  })

  test('update user password', async ({ assert }) => {
    const user = await UserFactory.merge({
      password: 'securePassword123'
    }).create()

    const newPassword = 'newPassword123'
    user.password = newPassword
    await user.save()

    assert.isTrue(await hash.verify(user.password, newPassword))
  })

  test('query related models', async ({ assert }) => {
    const user = await UserFactory
      .merge({ id: 1 })
      .with('setReviews', 1,
        (review) => review.with('flashcardSet', 1,
          (flashcardSet) => flashcardSet.merge({ userId: 1 })))
      .with('collectionReviews', 1,
        (review) => review.with('collection', 1,
          (collection) => collection.merge({ userId: 1 })))
      .create()

    const setReviews = await user.related('setReviews').query()
    assert.isArray(setReviews)
    assert.lengthOf(setReviews, 1)

    const flashcardSets = await user.related('flashcardSets').query()
    assert.isArray(flashcardSets)
    assert.lengthOf(flashcardSets, 1)

    const collectionReviews = await user.related('collectionReviews').query()
    assert.isArray(collectionReviews)
    assert.lengthOf(collectionReviews, 1)

    const collections = await user.related('collections').query()
    assert.isArray(collections)
    assert.lengthOf(collections, 1)
  })

  test('load related models', async ({ assert }) => {
    const user = await UserFactory
      .merge({ id: 1 })
      .with('setReviews', 1,
        (review) => review.with('flashcardSet', 1,
          (flashcardSet) => flashcardSet.merge({ userId: 1 })))
      .with('collectionReviews', 1,
        (review) => review.with('collection', 1,
          (collection) => collection.merge({ userId: 1 })))
      .create()

    await user.load('setReviews')
    assert.isArray(user.setReviews)
    assert.lengthOf(user.setReviews, 1)

    await user.load('flashcardSets')
    assert.isArray(user.flashcardSets)
    assert.lengthOf(user.flashcardSets, 1)

    await user.load('collectionReviews')
    assert.isArray(user.collectionReviews)
    assert.lengthOf(user.collectionReviews, 1)

    await user.load('collections')
    assert.isArray(user.collections)
    assert.lengthOf(user.collections, 1)
  })
})
