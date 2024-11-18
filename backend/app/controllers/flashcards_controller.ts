import type { HttpContext } from '@adonisjs/core/http'
import FlashcardSet from '#models/flashcard_set'
import Flashcard from '#models/flashcard'
import User from '#models/user'
import { CreateFlashcardSetValidator } from '#validators/create_flashcard_set'
import db from '@adonisjs/lucid/services/db'

export default class FlashcardsController {
  /**
   * Get all flashcard sets
   */
  async index({ response }: HttpContext) {
    try {
      const sets = await FlashcardSet.query()
        .preload('flashcards')
        .preload('comments')
      return response.json(sets)
    } catch (error) {
      return response.internalServerError({ message: 'Error fetching sets' })
    }
  }

  /**
   * Create a new flashcard set
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(CreateFlashcardSetValidator)

    // Start a database transaction for atomic operations
    const trx = await db.transaction()

    try {
      // Create the flashcard set
      const set = await FlashcardSet.create({
        name: payload.name,
        userId: auth.user!.id}
        , { client: trx })

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

      return response.badRequest({
        message: 'Failed to create flashcard set',
        errors: error.messages || error.message,
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
      .preload('flashcards')

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

    const payload = await request.validateUsing(CreateFlashcardSetValidator)

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

      // Check for new flashcards to create...
      // Check for existing flashcards to update...
      // Check for removed flashcards to delete...

      
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

      // If the current user is the creator of the set or an admin
      if (auth.user!.id == set.userId || auth.user?.admin) {
        // Delete set (flashcards are also deleted due to cascade rule)
        await set.delete()
        return response.noContent()
      }
      // Else
      return response.unauthorized({
        message: "You are not authorised to perform this action",
        error: "Unauthorised"
      })

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
        .preload('flashcards')
      
      return response.json(sets)

    } catch(error) {
      return response.internalServerError({
        message: 'Error fetching flashcard sets',
        errors: error.messages || error.message,
      })
    }
  }
}