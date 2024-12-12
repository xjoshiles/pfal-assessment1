import type { HttpContext } from '@adonisjs/core/http'
import CollectionReview from '#models/collection_review'
import Collection from '#models/collection'
import { ReviewValidator } from '#validators/review'
import { errors } from '@vinejs/vine'

export default class CollectionReviewsController {
  /**
   * Post review on a collection, by the current user
   */
  async store({ request, params, response, auth }: HttpContext) {
    try {
      // Validate the request payload
      const payload = await request.validateUsing(ReviewValidator)

      // Check if the collection exists
      const collection = await Collection.find(params.id)
      if (!collection) {
        return response.notFound({
          message: `Collection ${params.id} not found`
        })
      }

      // Check if the user has already posted a review for this collection
      const existingReview = await CollectionReview.query()
        .where('userId', auth.user!.id)
        .where('collectionId', collection.id)
        .first()

      if (existingReview) {
        return response.conflict({
          message: 'You have already posted a review for this collection'
        })
      }

      // Create the new review
      const review = await CollectionReview.create({
        rating: payload.rating,
        review: payload.review,
        userId: auth.user!.id,
        collectionId: collection.id
      })

      // // Recalculate the average rating
      // const reviews = await collection.related('reviews').query()
      // const averageRating = reviews.reduce(
      //   (sum, review) => sum + review.rating, 0) / reviews.length

      // // Update the collection with the new average rating
      // collection.averageRating = averageRating
      // await collection.save()

      await review.load('author')
      return response.created(review)

    } catch (error) {
      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.internalServerError({
        message: error.message || 'Error saving review',
      })
    }
  }

  /**
   * Get all reviews for a collection
   */
  async show({ params, response }: HttpContext) {
    const collection = await Collection.find(params.id)

    if (!collection) {
      return response.notFound({
        message: `Collection ${params.id} not found`
      })
    }
    await collection.load('reviews', (query) => { query.preload('author') })
    return response.json(collection.reviews)
  }

  /**
   * Delete review of a collection by id
   */
  async destroy({ params, response, auth }: HttpContext) {
    const { id, reviewId } = params

    // Return 404 if the review doesn't exist
    const review = await CollectionReview.find(reviewId)
    if (!review) {
      return response.notFound({
        message: `Collection review ${reviewId} not found`
      })
    }

    // If the current user is neither the author of the review nor an admin
    if (auth.user?.id !== review.userId && !auth.user?.admin) {
      return response.forbidden('You are not permitted to delete this review')
    }

    // Return 404 if the collection doesn't exist
    const collection = await Collection.find(id)
    if (!collection) {
      return response.notFound({
        message: `Collection ${params.id} not found`
      })
    }

    // Return 404 if review was not found for this collection
    if (collection.id != review.collectionId) {
      return response.notFound({
        message: `Review ${reviewId} not found for collection ${collection.id}`
      })
    }

    // Else...
    await review.delete()

    // // Recalculate the average rating
    // const reviews = await collection.related('reviews').query()
    // const averageRating = reviews.reduce(
    //   (sum, review) => sum + review.rating, 0) / reviews.length

    // // Update the collection with the new average rating
    // collection.averageRating = reviews.length ? averageRating : 0
    // await collection.save()

    return response.noContent()
  }
}
