import { test } from '@japa/runner'
import { FlashcardFactory } from '#database/factories/flashcard_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import { UserFactory } from '#database/factories/user_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Flashcard from '#models/flashcard'
import FlashcardSet from '#models/flashcard_set'

test.group('Flashcard Model', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('create a flashcard', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'Set description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy'
    }).create()

    assert.isDefined(flashcard.id)
    assert.isNumber(flashcard.id)
    assert.equal(flashcard.question, 'What is 2+2?')
    assert.equal(flashcard.answer, '4')
    assert.equal(flashcard.difficulty, 'easy')
    assert.equal(flashcard.flashcardSetId, flashcardSet.id)
  })

  test('update a flashcard', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'Set description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy'
    }).create()

    flashcard.question = 'What is 3+3?'
    flashcard.answer = '6'
    flashcard.difficulty = 'medium'
    await flashcard.save()

    const updatedFlashcard = await Flashcard.find(flashcard.id)
    assert.equal(updatedFlashcard?.question, 'What is 3+3?')
    assert.equal(updatedFlashcard?.answer, '6')
    assert.equal(updatedFlashcard?.difficulty, 'medium')
  })

  test('delete a flashcard', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'Set description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy'
    }).create()

    await flashcard.delete()

    const deletedFlashcard = await Flashcard.find(flashcard.id)
    assert.isNull(deletedFlashcard)
  })

  test('flashcard belongs to the correct flashcard set', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'Set description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy'
    }).create()

    const relatedSet = await flashcard.related('flashcardSet').query().first()
    assert.equal(relatedSet?.id, flashcardSet.id)
  })

  test('cannot create a flashcard without a valid flashcardSetId', async ({ assert }) => {
    try {
      // Attempt to create a flashcard without a valid flashcardSetId
      await Flashcard.create({
        question: 'What is 2+2?',
        answer: '4',
        difficulty: 'easy',
        flashcardSetId: 999  // Non-existent flashcardSet
      })
    } catch (error) {
      assert.equal(error.code, 'SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  test('deleting a FlashcardSet should delete related Flashcards', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'Set description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard1 = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy'
    }).create()

    const flashcard2 = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 3+3?',
      answer: '6',
      difficulty: 'medium'
    }).create()

    await flashcardSet.delete()

    const deletedFlashcard1 = await Flashcard.find(flashcard1.id)
    const deletedFlashcard2 = await Flashcard.find(flashcard2.id)

    assert.isNull(deletedFlashcard1)
    assert.isNull(deletedFlashcard2)
  })

  test('deleting a Flashcard should not affect FlashcardSet', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'Set description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy'
    }).create()

    await flashcard.delete()

    // Ensure the FlashcardSet still exists
    const foundSet = await FlashcardSet.find(flashcardSet.id)
    assert.isDefined(foundSet)
  })

  test('deleting a User should delete related FlashcardSets and Flashcards', async ({ assert }) => {
    const user = await UserFactory.create()
    const flashcardSet = await FlashcardSetFactory.merge({
      name: 'Test Flashcard Set',
      description: 'Set description',
      userId: user.id,
      averageRating: 0
    }).create()

    const flashcard1 = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 2+2?',
      answer: '4',
      difficulty: 'easy'
    }).create()

    const flashcard2 = await FlashcardFactory.merge({
      flashcardSetId: flashcardSet.id,
      question: 'What is 3+3?',
      answer: '6',
      difficulty: 'medium'
    }).create()

    // Delete the user
    await user.delete()

    // After deletion, ensure that both the FlashcardSet and Flashcards are deleted
    const deletedSet = await FlashcardSet.find(flashcardSet.id)
    const deletedFlashcard1 = await Flashcard.find(flashcard1.id)
    const deletedFlashcard2 = await Flashcard.find(flashcard2.id)

    assert.isNull(deletedSet)
    assert.isNull(deletedFlashcard1)
    assert.isNull(deletedFlashcard2)
  })
})
