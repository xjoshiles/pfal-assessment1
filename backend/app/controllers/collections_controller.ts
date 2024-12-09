import type { HttpContext } from '@adonisjs/core/http'
import Collection from '#models/collection'
import FlashcardSet from '#models/flashcard_set'
import { CollectionValidator } from '#validators/collection'
import db from '@adonisjs/lucid/services/db'
import { errors } from '@vinejs/vine'
import User from '#models/user'
import { DateTime } from 'luxon'
import { areSetsEqual } from '#utils/array'

async function getCollectionAverageRating(collectionId: number) {
  // Consider caching this result using a caching library when the application
  // grows, as constantly calculating this for large datasets can be expensive
  // https://adonisjs.com/blog/future-plans-for-adonisjs-6#adonisjscache
  // https://bentocache.dev/docs/introduction
  const result = await db
    .from('collection_reviews')
    .where('collection_id', collectionId)
    .avg('rating as averageRating')
    .first()

  return result?.averageRating || 0
}

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
      await collection.related('flashcardSets')
        .attach(payload.flashcardSetIds, trx)

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
   * Get a flashcard set collection by ID
   */
  async show({ params, response }: HttpContext) {
    const id = params.id

    const collection = await Collection.query()
      .where('id', id)
      .preload('flashcardSets', (query) => {
        query.preload('creator')
      })
      .preload('reviews', (query) => {
        query.preload('author')
      })
      .first()

    if (!collection) {
      return response.notFound({ message: `Collection ${id} not found` })
    }

    return response.json(collection)

    // const averageRating = await getCollectionAverageRating(collection.id)

    // return response.json({
    //   ...collection.serialize(),
    //   averageRating
    // })
  }

  /**
   * Update a flashcard set collection by ID
   */
  async update({ params, request, response, auth }: HttpContext) {
    const { id } = params

    const payload = await request.validateUsing(CollectionValidator)

    // Start a database transaction for atomic operations
    const trx = await db.transaction()

    try {
      // Find the collection
      // Note that despite being a read operation, we use { client: trx }
      // here as it is part of a larger transaction, ensuring consistency 
      const collection = await Collection.find(id, { client: trx })
      if (!collection) {
        await trx.rollback()
        return response.notFound({ message: `Collection ${id} not found` })
      }

      // If the current user is not the creator of the collection nor an admin
      if (auth.user!.id != collection.userId && !auth.user?.admin) {
        await trx.rollback()
        return response.unauthorized({
          message: "You are not authorised to perform this action"
        })
      }
      // Else
      collection.name = payload.name
      collection.description = payload.description

      // Compare current sets with those in the payload to perform a manual
      // update of the updatedAt column when only the sets have changed
      await collection.load('flashcardSets')
      const currentIds = collection.flashcardSets.map(set => set.id)

      if (!areSetsEqual(currentIds, payload.flashcardSetIds)) {
        // Update the many-to-many relationships in the pivot table
        // Note that we set the detach flag to true to remove existing
        // sets in the collection that are not included in the payload
        await collection.related('flashcardSets')
          .sync(payload.flashcardSetIds, true, trx)

        collection.updatedAt = DateTime.local()  // required manual update
      }

      await collection.useTransaction(trx).save()

      // Commit the transaction
      await trx.commit()

      // Load the sets to ensure they are included in the response
      await collection.load('flashcardSets', (query) => {
        query.preload('flashcards')
      })

      return response.ok(collection)

    } catch (error) {
      // Roll back the transaction in case of errors
      await trx.rollback()

      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.badRequest({
        message: error.message || 'Error updating collection'
      })
    }
  }

  /**
   * Delete a flashcard set collection by ID
   */
  async destroy({ params, response, auth }: HttpContext) {
    const { id } = params

    try {
      // Find the collection
      const collection = await Collection.find(id)
      if (!collection) {
        return response.notFound({ message: `Collection ${id} not found` })
      }

      // If the current user is not the creator of the collection nor an admin
      if (auth.user!.id != collection.userId && !auth.user?.admin) {
        return response.unauthorized({
          message: "You are not authorised to perform this action"
        })
      }
      // Else delete set (many-to-many relationships to its
      // flashcard sets are also deleted due to cascade rule)
      await collection.delete()
      return response.noContent()

    } catch (error) {
      return response.internalServerError(
        { message: error.message || 'Error deleting collection' })
    }
  }

  /**
   * Get all flashcard set collections created by a user
   */
  async byUser({ params, response, auth }: HttpContext) {
    const id = params.id

    try {
      const user = await User.find(id)

      if (!user) {
        return response.notFound({ message: `User ${id} not found` })
      }

      const collections = await Collection.query()
        .where('user_id', id)
        .preload('creator')

      return response.json(collections)

    } catch (error) {
      return response.internalServerError({
        message: 'Error fetching collections',
        errors: error.messages || error.message,
      })
    }
  }

  /**
   * Redirect to a random flashcard set collection
   */
  async random({ params }: HttpContext) { }

}