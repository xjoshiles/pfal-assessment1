import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { FlashcardSetFactory } from '#database/factories/flashcard_set_factory'
import { FlashcardFactory } from '#database/factories/flashcard_factory'
import testUtils from '@adonisjs/core/services/test_utils'
import Flashcard from '#models/flashcard'
import FlashcardSet from '#models/flashcard_set'

test.group('Update a Flashcard Set by ID', (group) => {
  // Start a transaction before and roll back at the end for each test
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let user: any
  let admin: any
  let flashcardSet: FlashcardSet
  let flashcards: Flashcard[]

  group.each.setup(async () => {
    // Create a regular user and an admin user before each test
    user = await UserFactory.create()
    admin = await UserFactory.merge({ admin: true }).create()

    // Create a flashcard set associated with the regular user
    // with associated flashcards in the database before each test
    flashcardSet = await FlashcardSetFactory.merge({ userId: user.id }).create()
    flashcards = await FlashcardFactory.merge({ flashcardSetId: flashcardSet.id }).createMany(3)
  })

  test('authenticated user can update their own flashcard set', async ({ assert, client }) => {
    const updatedData = {
      name: 'Updated Flashcard Set',
      description: 'Updated Description',
      flashcards: [
        { id: flashcards[0].id, question: 'Updated Question 1', answer: 'Updated Answer 1', difficulty: 'medium' },
        { id: flashcards[1].id, question: 'Updated Question 2', answer: 'Updated Answer 2', difficulty: 'hard' },
        { question: 'New Question', answer: 'New Answer', difficulty: 'easy' }
      ]
    }

    const response = await client
      .put(`/sets/${flashcardSet.id}`)
      .loginAs(user)
      .json(updatedData)

    const responseData = response.response.body

    assert.equal(response.response.statusCode, 200)
    assert.equal(responseData.name, updatedData.name)
    assert.equal(responseData.description, updatedData.description)
    assert.lengthOf(responseData.flashcards, updatedData.flashcards.length)

    // Check flashcard data
    assert.equal(responseData.flashcards[0].question, updatedData.flashcards[0].question)
    assert.equal(responseData.flashcards[2].question, updatedData.flashcards[2].question) // New flashcard
  })

  test('return 401 when attempting to update a flashcard set without authentication', async ({ assert, client }) => {
    const updatedData = {
      name: 'Updated Flashcard Set',
      description: 'Updated Description',
      flashcards: [
        { id: flashcards[0].id, question: 'Updated Question 1', answer: 'Updated Answer 1', difficulty: 'medium' },
        { id: flashcards[1].id, question: 'Updated Question 2', answer: 'Updated Answer 2', difficulty: 'hard' },
        { question: 'New Question', answer: 'New Answer', difficulty: 'easy' }
      ]
    }

    // Make an unauthenticated request
    const response = await client
      .put(`/sets/${flashcardSet.id}`)
      .json(updatedData)

    assert.equal(response.response.statusCode, 401) // Unauthorised
    assert.equal(
      response.response.body.message,
      'Unauthorised: Missing or invalid authentication credentials'
    )
  })

  test('return 403 if a user attempts to update a set they do not own', async ({ assert, client }) => {
    const otherUser = await UserFactory.create()

    const updatedData = {
      name: 'Updated Name',
      description: 'Updated Description',
      flashcards: [
        { id: flashcards[0].id, question: 'Updated Question', answer: 'Updated Answer', difficulty: 'medium' },
      ],
    }

    const response = await client
      .put(`/sets/${flashcardSet.id}`)
      .loginAs(otherUser)
      .json(updatedData)

    assert.equal(response.response.statusCode, 403)
    assert.equal(response.response.body.message, 'You are not authorised to update this set')
  })

  test('authenticated admin can update any flashcard set', async ({ assert, client }) => {
    const updatedData = {
      name: 'Admin Updated Name',
      description: 'Admin Updated Description',
      flashcards: [
        { id: flashcards[0].id, question: 'Admin Question', answer: 'Admin Answer', difficulty: 'hard' },
      ],
    }

    const response = await client
      .put(`/sets/${flashcardSet.id}`) // owned by non-admin user
      .loginAs(admin)
      .json(updatedData)

    assert.equal(response.response.statusCode, 200)
    assert.equal(response.response.body.name, updatedData.name)
    assert.equal(response.response.body.description, updatedData.description)
  })

  test('return 404 if the flashcard set does not exist', async ({ assert, client }) => {
    const updatedData = {
      name: 'Non-existent Set',
      description: 'Non-existent Description',
      flashcards: [],
    }

    const response = await client
      .put(`/sets/9999`) // Non-existent ID
      .loginAs(user)
      .json(updatedData)

    assert.equal(response.response.statusCode, 404)
    assert.equal(response.response.body.message, 'Set 9999 not found')
  })

  test('return 422 when validation fails for required fields', async ({ assert, client }) => {
    const invalidData = {
      description: 'Missing name',
      flashcards: [],
    }

    const response = await client
      .put(`/sets/${flashcardSet.id}`)
      .loginAs(user)
      .json(invalidData)

    assert.equal(response.response.statusCode, 422)
    assert.equal(response.response.body.message, 'The name field must be defined')
  })

  test('return 400 when trying to update with an invalid flashcard ID', async ({ assert, client }) => {
    const invalidData = {
      name: 'Invalid Flashcard Update',
      description: 'Invalid Flashcard Description',
      flashcards: [
        { id: 9999, question: 'Invalid Question', answer: 'Invalid Answer', difficulty: 'easy' }, // Invalid ID
      ],
    }

    const response = await client
      .put(`/sets/${flashcardSet.id}`)
      .loginAs(user)
      .json(invalidData)

    assert.equal(response.response.statusCode, 400)
    assert.equal(response.response.body.message, 'Flashcard with ID 9999 is invalid')
  })

  test('deletes flashcards not included in the update payload', async ({ assert, client }) => {
    // New flashcard set should only contain 1 flashcard
    const updatedData = {
      name: 'Updated Name',
      description: 'Updated Description',
      flashcards: [
        { id: flashcards[0].id, question: 'Kept Question', answer: 'Kept Answer', difficulty: 'easy' },
      ]
    }

    const response = await client
      .put(`/sets/${flashcardSet.id}`)
      .loginAs(user)
      .json(updatedData)

    assert.equal(response.response.statusCode, 200)
    assert.lengthOf(response.response.body.flashcards, 1)
    assert.equal(response.response.body.flashcards[0].id, flashcards[0].id)
  })
})
