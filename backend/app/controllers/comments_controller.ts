import type { HttpContext } from '@adonisjs/core/http'
import Comment from '#models/comment'
import FlashcardSet from '#models/flashcard_set'
import { CommentValidator } from '#validators/comment'

export default class CommentsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

  /**
   * Comment on a flashcard set, by the current user
   */
  async store({ request, params, response, auth }: HttpContext) {
    const payload = await request.validateUsing(CommentValidator)

    // Check if the flashcard set exists
    const set = await FlashcardSet.find(params.id)
    if (!set) {
      return response.notFound(
        { message: `Flashcard set ${params.id} not found` })
    }
    // Else
    const comment = await Comment.create({
      comment: payload.comment,
      flashcardSetId: set.id,
      userId: auth.user!.id,
    })
    
    return response.created(comment)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}