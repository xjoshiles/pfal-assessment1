import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Collection from '#models/collection'
import { CollectionValidator } from '#validators/collection'
import db from '@adonisjs/lucid/services/db'

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
    const { userId, collectionId } = params

    try {
      // Find the collection and ensure it belongs to the specified user
      const collection = await Collection.query()
        .where('id', collectionId)
        .andWhere('userId', userId)
        .preload('flashcardSets', (query) => query.preload('flashcards'))

      if (!collection) {
        return response.notFound(
          { message: `Collection ${collectionId} not found for user ${userId}` })
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
  async update({ params, request, response, auth }: HttpContext) {
    const { userId, collectionId } = params

    // Start a database transaction for atomic operations
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(CollectionValidator)

      // Find the collection
      // Note that despite being a read operation, we use { client: trx }
      // here as it is part of a larger transaction, ensuring consistency 
      const collection = await Collection.find(collectionId, { client: trx })

      if (!collection) {
        return response.notFound(
          { message: `Collection ${collectionId} not found` })
      }

      // If the current user is not the creator of the collection nor an admin
      if (auth.user!.id != collection.userId && !auth.user?.admin) {
        return response.unauthorized({
          message: "You are not authorised to perform this action",
          error: "Unauthorised"
        })
      }
      // Else
      collection.name = payload.name
      await collection.useTransaction(trx).save()

      // Update the many-to-many relationships in the pivot table
      // Note that we do not need to specify trx here as it is
      // persistent after the previous useTransaction call
      if (payload.flashcardSetIds) {
        await collection.related('flashcardSets').sync(payload.flashcardSetIds)
      }

      // Commit the transaction
      await trx.commit();

      // Load the sets to ensure they are included in the response
      await collection.load((loader) => {
        loader.preload('flashcardSets',
          (query) => query.preload('flashcards'))
      })

      return response.ok(collection)

    } catch (error) {
      // Roll back the transaction in case of errors
      await trx.rollback();

      return response.badRequest({
        message: 'Failed to update collection',
        errors: error.messages || error.message,
      });
    }
  }

  /**
   * Delete a flashcard set collection by ID
   */
  async destroy({ params, response, auth }: HttpContext) {
    const { userId, collectionId } = params

    try {
      // Find the collection and ensure it belongs to the specified user
      const collection = await Collection.query()
        .where('id', collectionId)
        .preload('flashcardSets', (query) => query.preload('flashcards'))
        .first()

      if (!collection) {
        return response.notFound(
          { message: `Collection ${collectionId} not found for user ${userId}` });
      }

      // If the current user is not the creator of the collection nor an admin
      if (auth.user!.id != collection.userId && !auth.user?.admin) {
        return response.unauthorized({
          message: "You are not authorised to perform this action",
          error: "Unauthorised"
        })
      }
      //Else 
      await collection.delete()
      return response.ok(collection)

    } catch (error) {
      return response.internalServerError(
        { message: 'Error deleting collection', errors: error.message });
    }
  }
}