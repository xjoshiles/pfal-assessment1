import type { HttpContext } from '@adonisjs/core/http'
import Collection from '#models/collection'
import FlashcardSet from '#models/flashcard_set'
import { CollectionValidator } from '#validators/collection'
import db from '@adonisjs/lucid/services/db'

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
    const payload = await request.validateUsing(CollectionValidator)

    // Start a database transaction for atomic operations
    const trx = await db.transaction()

    try {
      // Create the collection
      const collection = await Collection.create({
        name: payload.name,
        userId: auth.user!.id}
        , { client: trx })
  
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

      return response.badRequest({
        message: 'Failed to create collection',
        errors: error.messages || error.message,
      })
    }
  }

  /**
   * Redirect to a random flashcard set collection
   */
  async random({ params }: HttpContext) {}

}