import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Collection from '#models/collection'

export default class UserCollectionsController {
  /**
   * Get all flashcard set collections created by a user
   */
  async index({ params, response }: HttpContext) {
    const id = params.id

    try {
      const user = await User.find(id)

      if (!user) {
        return response.notFound({ message: `User ${id} not found` })
      }

      // Get collections created by the user and preload related flashcard sets
      const collections = await Collection.query()
        .where('user_id', id)
        .preload('flashcardSets', (flashcardSetQuery) => {
          flashcardSetQuery.preload('flashcards');
        });

      return response.ok(collections);
    
    } catch (error) {
      return response.internalServerError({
        message: 'Error fetching collections',
        errors: error.messages || error.message,
      });
    }
  }

  /**
   * Get a flashcard set collection by ID
   */
  async show({ params, response }: HttpContext) {
    const { userId, collectionId } = params;

    try {
      // Find the collection and ensure it belongs to the specified user
      const collection = await Collection.query()
        .where('id', collectionId)
        .andWhere('userId', userId)
        .preload('flashcardSets', (query) => query.preload('flashcards'))
      
      if (!collection) {
        return response.notFound(
          { message: `Collection ${collectionId} not found for user ${userId}` });
      }

      return response.ok(collection);
    
    } catch (error) {
      return response.internalServerError(
        { message: 'Error fetching collection', errors: error.message });
    }
  }

  /**
   * Update a flashcard set collection by ID
   */
  async update({ params, request }: HttpContext) {
    
  }

  /**
   * Delete a flashcard set collection by ID
   */
  async destroy({ params }: HttpContext) { }
  }