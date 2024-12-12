import type { HttpContext } from '@adonisjs/core/http'
import SetReview from '#models/set_review'
import FlashcardSet from '#models/flashcard_set'
import { ReviewValidator } from '#validators/review'
import { errors } from '@vinejs/vine'

export default class SetReviewsController {
  /**
   * Post review on a flashcard set, by the current user
   */
  async store({ request, params, response, auth }: HttpContext) {
    try {
      // Validate the request payload
      const payload = await request.validateUsing(ReviewValidator)

      // Check if the flashcard set exists
      const set = await FlashcardSet.find(params.id)
      if (!set) {
        return response.notFound({
          message: `Flashcard set ${params.id} not found`
        })
      }

      // Check if the user has already posted a review for this set
      const existingReview = await SetReview.query()
        .where('userId', auth.user!.id)
        .where('flashcardSetId', set.id)
        .first()

      if (existingReview) {
        return response.conflict({
          message: 'You have already posted a review for this set'
        })
      }

      // Create the new review
      const review = await SetReview.create({
        rating: payload.rating,
        review: payload.review,
        userId: auth.user!.id,
        flashcardSetId: set.id
      })

      // // Recalculate the average rating
      // const reviews = await set.related('reviews').query()
      // const averageRating = reviews.reduce(
      //   (sum, review) => sum + review.rating, 0) / reviews.length

      // // Update the set with the new average rating
      // set.averageRating = averageRating
      // await set.save()

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
   * Get all reviews for a flashcard set
   */
  async show({ params, response }: HttpContext) {
    const set = await FlashcardSet.find(params.id)

    if (!set) {
      return response.notFound({
        message: `Flashcard set ${params.id} not found`
      })
    }
    await set.load('reviews', (query) => { query.preload('author') })
    return response.json(set.reviews)
  }

  /**
   * Delete review of a flashcard set by id
   */
  async destroy({ params, response, auth }: HttpContext) {
    const { id, reviewId } = params

    // Return 404 if the review doesn't exist
    const review = await SetReview.find(reviewId)
    if (!review) {
      return response.notFound({
        message: `Flashcard set review ${reviewId} not found`
      })
    }

    // If the current user is neither the author of the review nor an admin
    if (auth.user?.id !== review.userId && !auth.user?.admin) {
      return response.forbidden('You are not permitted to delete this review')
    }

    // Return 404 if the set doesn't exist
    const set = await FlashcardSet.find(id)
    if (!set) {
      return response.notFound({
        message: `Flashcard set ${params.id} not found`
      })
    }

    // Return 404 if review was not found for this set
    if (set.id != review.flashcardSetId) {
      return response.notFound({
        message: `Review ${reviewId} not found for flashcard set ${set.id}`
      })
    }

    // Else...
    await review.delete()

    // // Recalculate the average rating
    // const reviews = await set.related('reviews').query()
    // const averageRating = reviews.reduce(
    //   (sum, review) => sum + review.rating, 0) / reviews.length

    // // Update the set with the new average rating
    // set.averageRating = reviews.length ? averageRating : 0
    // await set.save()

    return response.noContent()
  }
}
