import type { HttpContext } from '@adonisjs/core/http'
import FlashcardSet from '#models/flashcard_set'
import Flashcard from '#models/flashcard'
import User from '#models/user'
import { FlashcardSetValidator } from '#validators/flashcard_set'
import db from '@adonisjs/lucid/services/db'
import { shuffle } from 'lodash-es'
import { errors } from '@vinejs/vine'

export default class FlashcardsController {
  /**
   * Get all flashcard sets
   */
  async index({ response }: HttpContext) {
    try {
      const sets = await FlashcardSet.query()
        .preload('flashcards')
        .preload('reviews')
      return response.json(sets)
    } catch (error) {
      return response.internalServerError({ message: 'Error fetching sets' })
    }
  }

  /**
   * Create a new flashcard set
   */
  async store({ request, response, auth }: HttpContext) {
    // Start a database transaction for atomic operations
    const trx = await db.transaction()
    console.log(request.body())
    try {
      const payload = await request.validateUsing(FlashcardSetValidator)

      // Create the flashcard set
      const set = await FlashcardSet.create({
        name: payload.name,
        description: payload.description,
        userId: auth.user!.id,
        username: auth.user!.username
      }, { client: trx })

      // Prepare the flashcards with the flashcard set ID
      const flashcardsData = payload.flashcards.map((flashcard) => ({
        ...flashcard,
        flashcardSetId: set.id,
      }))

      // Create flashcards in the flashcard table
      await Flashcard.createMany(flashcardsData, { client: trx })

      // Commit the transaction
      await trx.commit()

      // Load the flashcards to ensure they are included in the response
      await set.load('flashcards')

      return response.created(set)

    } catch (error) {
      // Roll back the transaction in case of errors
      await trx.rollback()

      console.log(error)

      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.badRequest({
        message: error.message || 'Error creating set'
      })
    }
  }

  /**
   * Get a flashcard set by ID
   */
  async show({ params, response }: HttpContext) {
    const id = params.id

    const set = await FlashcardSet.query()
      .where('id', id)
      .preload('flashcards').preload('reviews')
      .first()

    if (!set) {
      return response.notFound({ message: `Set ${id} not found` })
    }

    return response.json(set)
  }

  /**
   * Update a flashcard set by ID
   */
  async update({ params, request, response, auth }: HttpContext) {
    const { id } = params

    const payload = await request.validateUsing(FlashcardSetValidator)

    // Start a database transaction for atomic operations
    const trx = await db.transaction()

    try {
      // Find the flashcard set
      // Note that despite being a read operation, we use { client: trx }
      // here as it is part of a larger transaction, ensuring consistency 
      const set = await FlashcardSet.find(id, { client: trx })
      if (!set) {
        return response.notFound({ message: `Set ${id} not found` })
      }

      // If the current user is not the creator of the set nor an admin
      if (auth.user!.id != set.userId && !auth.user?.admin) {
        return response.unauthorized({
          message: "You are not authorised to perform this action",
          error: "Unauthorised"
        })
      }
      // Else
      set.name = payload.name
      await set.useTransaction(trx).save()

      // Process flashcards
      const { flashcards } = payload;

      // Separate flashcards with IDs (existing) and without IDs (new)
      const existingFlashcards = flashcards.filter((fc) => fc.id != null)
      const newFlashcards = flashcards.filter((fc) => !fc.id)

      // Update existing flashcards
      for (const flashcard of existingFlashcards) {
        const existingCard = await Flashcard.find(flashcard.id, { client: trx })

        if (!existingCard || existingCard.flashcardSetId !== set.id) {
          await trx.rollback();
          return response.badRequest(
            { message: `Flashcard with ID ${flashcard.id} is invalid` })
        }

        existingCard.merge({
          question: flashcard.question,
          answer: flashcard.answer,
          difficulty: flashcard.difficulty,
        })
        await existingCard.useTransaction(trx).save()
      }

      // Create new flashcards
      const newFlashcardData = newFlashcards.map((flashcard) => ({
        question: flashcard.question,
        answer: flashcard.answer,
        difficulty: flashcard.difficulty,
        flashcardSetId: set.id,
      }));
      await Flashcard.createMany(newFlashcardData, { client: trx })

      // Delete associated flashcards that are not in the payload 
      const payloadIds = flashcards.map(
        (flashcard) => flashcard.id).filter((id) => id != null)

      await Flashcard.query({ client: trx })
        .where('flashcard_set_id', set.id)
        .whereNotIn('id', payloadIds)
        .delete()

      // Commit the transaction
      await trx.commit()

      // Load the flashcards to ensure they are included in the response
      await set.load('flashcards')

      return response.ok(set)

    } catch (error) {
      // Roll back the transaction in case of errors
      await trx.rollback()

      return response.badRequest({
        message: 'Failed to update flashcard set',
        errors: error.messages || error.message,
      })
    }
  }

  /**
   * Delete a flashcard set by ID
   */
  async destroy({ params, response, auth }: HttpContext) {
    const id = params.id

    try {
      const set = await FlashcardSet.findOrFail(id)

      // If the current user is not the creator of the set nor an admin
      if (auth.user!.id != set.userId && !auth.user?.admin) {
        return response.unauthorized({
          message: "You are not authorised to perform this action",
          error: "Unauthorised"
        })
      }
      // Else delete set (flashcards are also deleted due to cascade rule)
      await set.delete()
      return response.noContent()

    } catch (error) {
      return response.notFound(
        { message: 'Unable to delete flashcard set', errors: error.messages })
    }
  }

  /**
   * Get all flashcard sets created by a user
   */
  async byUser({ params, response }: HttpContext) {
    const id = params.id

    try {
      const user = await User.find(id);

      if (!user) {
        return response.notFound({ message: `User ${id} not found` })
      }

      const sets = await FlashcardSet.query()
        .where('user_id', id)
        .preload('flashcards')  // No .first() call here as we want all sets

      return response.json(sets)

    } catch (error) {
      return response.internalServerError({
        message: 'Error fetching flashcard sets',
        errors: error.messages || error.message,
      })
    }
  }

  /**
   * Get all flashcards in a set
   */
  async inSet({ params, request, response }: HttpContext) {
    const id = params.id
    const shuffleCards = request.qs().shuffle === 'true'

    try {
      const set = await FlashcardSet.query()
        .where('id', id)
        .preload('flashcards')
        .first()

      if (!set) {
        return response.notFound({ message: `Set ${id} not found` })
      }

      if (shuffleCards) {
        return response.json(shuffle(set.flashcards))
      }
      return response.json(set.flashcards)

    } catch (error) {
      return response.internalServerError({
        message: 'Error fetching flashcard sets',
        errors: error.messages || error.message,
      })
    }
  }
}