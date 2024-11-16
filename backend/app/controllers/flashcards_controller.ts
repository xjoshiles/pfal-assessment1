import type { HttpContext } from '@adonisjs/core/http'
import FlashcardSet from '#models/flashcard_set'
import { CreateFlashcardSetValidator } from '#validators/create_flashcard_set'

export default class TestsController {
  /**
   * Get all flashcard sets
   */
  async index({ response }: HttpContext) {
    try {
      const sets = await FlashcardSet.all()
      return response.json(sets)
    } catch (error) {
      return response.internalServerError({ message: 'Error fetching sets' })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(CreateFlashcardSetValidator)




  }

  /**
   * Get a flashcard set by ID
   */
  async show({ params, response }: HttpContext) {
    const id = params.id

    // try {
    const set = await FlashcardSet.find(id)

    if (!set) {
      return response.notFound({ message: `Set ${id} not found` })
    }

    return response.json(set)

    // } catch (error) {
    //     return response.badRequest(
    //         {message: 'Unable to delete user', errors: error.messages})
    // }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) { }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) { }
}