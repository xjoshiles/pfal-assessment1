import type { HttpContext } from '@adonisjs/core/http'
import FlashcardSet from '#models/flashcard_set'
import Flashcard from '#models/flashcard'
import User from '#models/user'
import { FlashcardSetValidator } from '#validators/flashcard_set'
import db from '@adonisjs/lucid/services/db'
import { shuffle } from 'lodash-es'
import { errors } from '@vinejs/vine'
import RateLimiter from '#services/rate_limiter'

async function getFlashcardSetAverageRating(flashcardSetId: number) {
  // Consider caching this result using a caching library when the application
  // grows, as constantly calculating this for large datasets can be expensive
  // https://adonisjs.com/blog/future-plans-for-adonisjs-6#adonisjscache
  // https://bentocache.dev/docs/introduction
  const result = await db
    .from('set_reviews')
    .where('flashcard_set_id', flashcardSetId)
    .avg('rating as averageRating')
    .first()

  return result?.averageRating || 0
}

export default class FlashcardsController {
  /**
   * Get all flashcard sets
   */
  async index({ response }: HttpContext) {
    try {
      const sets = await FlashcardSet.query()
        .preload('flashcards')
        .preload('creator')
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

    try {
      // Rate limiting for regular users
      if (!auth.user?.admin) {
        const canCreate = await RateLimiter.canCreateSet(trx)

        if (!canCreate) {
          await trx.rollback()
          return response.status(429).json({
            message: 'Daily set creation limit reached, please try again tomorrow',
          })
        }
      }

      const payload = await request.validateUsing(FlashcardSetValidator)

      // Create the flashcard set
      const set = await FlashcardSet.create({
        name: payload.name,
        description: payload.description,
        userId: auth.user!.id
      }, { client: trx })

      // Prepare the flashcards with the flashcard set ID
      const flashcardsData = payload.flashcards.map((flashcard) => ({
        ...flashcard,
        flashcardSetId: set.id,
      }))

      // Create flashcards in the flashcard table
      await Flashcard.createMany(flashcardsData, { client: trx })

      // Increment the daily set creation count
      await RateLimiter.incrementSetCount(trx)

      // Commit the transaction
      await trx.commit()

      // Load the flashcards to ensure they are included in the response
      await set.load('flashcards')

      return response.created(set)

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
      return response.internalServerError({
        message: error.message || 'Error creating set',
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
      .preload('reviews', (query) => {
        query.preload('author')
      })
      .preload('creator')
      .first()

    if (!set) {
      return response.notFound({ message: `Set ${id} not found` })
    }

    return response.json(set)

    // const averageRating = await getFlashcardSetAverageRating(set.id)

    // return response.json({
    //   ...set.serialize(),
    //   averageRating
    // })
  }


  /**
   * Update a flashcard set by ID
   */
  async update({ params, request, response, auth }: HttpContext) {
    const { id } = params

    // Start a database transaction for atomic operations
    const trx = await db.transaction()

    try {
      // Find the flashcard set
      // Note that despite being a read operation, we use { client: trx }
      // here as it is part of a larger transaction, ensuring consistency 
      const set = await FlashcardSet.find(id, { client: trx })
      if (!set) {
        await trx.rollback()
        return response.notFound({ message: `Set ${id} not found` })
      }

      // If the current user is not the creator of the set nor an admin
      if (auth.user!.id != set.userId && !auth.user?.admin) {
        await trx.rollback()
        return response.forbidden({
          message: "You are not authorised to update this set"
        })
      }

      // Ensure the request contains valid data
      const payload = await request.validateUsing(FlashcardSetValidator)

      set.name = payload.name
      set.description = payload.description
      await set.useTransaction(trx).save()

      // Process flashcards
      const { flashcards } = payload

      // Separate flashcards with IDs (existing) and without IDs (new)
      const existingFlashcards = flashcards.filter((fc) => fc.id != null)
      const newFlashcards = flashcards.filter((fc) => !fc.id)

      // Update existing flashcards
      for (const flashcard of existingFlashcards) {
        const existingCard = await Flashcard.find(flashcard.id, { client: trx })

        if (!existingCard || existingCard.flashcardSetId !== set.id) {
          await trx.rollback()
          return response.unprocessableEntity(
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
      }))
      const createdFlashcards = await Flashcard.createMany(
        newFlashcardData, { client: trx })
      const createdFlashcardIds = createdFlashcards.map((fc) => fc.id)

      // Delete associated flashcards that are not in the payload 
      const payloadIds = [
        ...flashcards.map((fc) => fc.id).filter((id) => id != null),
        ...createdFlashcardIds,
      ]
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

      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.internalServerError({
        message: error.message || 'Error updating set',
      })
    }
  }

  /**
   * Delete a flashcard set by ID
   */
  async destroy({ params, response, auth }: HttpContext) {
    const id = params.id

    try {
      // Find the flashcard set
      const set = await FlashcardSet.find(id)
      if (!set) {
        return response.notFound({ message: `Set ${id} not found` })
      }

      // If the current user is not the creator of the set nor an admin
      if (auth.user!.id != set.userId && !auth.user?.admin) {
        return response.forbidden({
          message: "You are not authorised to delete this set"
        })
      }
      // Else delete set (flashcards are also deleted due to cascade rule)
      await set.delete()
      return response.noContent()

    } catch (error) {
      return response.internalServerError(
        { message: error.message || 'Error deleting flashcard set' })
    }
  }

  /**
   * Get all flashcard sets created by a user
   */
  async byUser({ params, response }: HttpContext) {
    const id = params.id

    try {
      const user = await User.find(id)
      if (!user) {
        return response.notFound({ message: `User ${id} not found` })
      }

      const sets = await FlashcardSet.query()
        .where('user_id', id)
        .preload('flashcards')  // No .first() call for all sets

      return response.json(sets)

    } catch (error) {
      return response.internalServerError({
        message: error.message || 'Error fetching flashcard sets'
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
        message: error.message || 'Error fetching flashcards'
      })
    }
  }
}