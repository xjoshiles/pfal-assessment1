import type { HttpContext } from '@adonisjs/core/http'
import Collection from '#models/collection'
import FlashcardSet from '#models/flashcard_set'
import { CollectionValidator } from '#validators/collection'
import db from '@adonisjs/lucid/services/db'
import { errors } from '@vinejs/vine'

export default class CollectionsController {
  /**
   * Get all flashcard set collections
   */
  async index({ response }: HttpContext) {
    try {
      // Get all collections, ensuring flashcard sets and creators are loaded
      const collections = await Collection.query()
        .preload('flashcardSets', (query) => {
          query.preload('flashcards').preload('creator')
        })
        .preload('creator')

      return response.json(collections)

    } catch (error) {
      return response.internalServerError({
        message: 'Error fetching collections',
        error: error.message
      })
    }
  }

  /**
   * Create a new flashcard set collection
   */
  async store({ request, response, auth }: HttpContext) {
    // Start a database transaction for atomic operations
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(CollectionValidator)

      const existingSetIds = (await FlashcardSet.query({ client: trx })
        .whereIn('id', payload.flashcardSetIds))
        .map(set => set.id)

      // Find any missing IDs
      const missingSetIds = payload.flashcardSetIds.filter(
        (id) => !existingSetIds.includes(id)
      )

      if (missingSetIds.length > 0) {
        await trx.rollback()
        return response.notFound({
          message: 'One or more flashcard sets do not exist',
          missingIds: missingSetIds,
        })
      }

      // Create the collection
      const collection = await Collection.create({
        name: payload.name,
        description: payload.description,
        userId: auth.user!.id
      }, { client: trx })

      // Assign the many-to-many relationships in the pivot table
      if (payload.flashcardSetIds) {
        await collection.related('flashcardSets')
          .attach(payload.flashcardSetIds, trx)
      }

      // Commit the transaction
      await trx.commit()

      // Load the sets to ensure they are included in the response
      await collection.load('flashcardSets', (query) => {
        query.preload('flashcards')
      })

      return response.created(collection)

    } catch (error) {
      // Roll back the transaction in case of errors
      await trx.rollback()

      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return response.notFound({
          message: 'A flashcard set was not found'
        })
      }
      // Else...
      return response.badRequest({
        message: error.message || 'Error creating collection'
      })
    }
  }

  /**
   * Redirect to a random flashcard set collection
   */
  async random({ params }: HttpContext) { }

}