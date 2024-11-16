import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { RegisterValidator } from '#validators/register'

export default class UsersController {
  /**
   * Get all users
   */
  async index({ response }: HttpContext) {
    try {
      const users = await User.all()
      return response.json(users)
    } catch (error) {
      return response.internalServerError( { message: 'Error fetching users' })
    }
  }

  /**
   * Create a new user
   */
  async store({ request, response }: HttpContext) {

    try {
      const payload = await request.validateUsing(RegisterValidator)
      const user = await User.create(payload)
      return response.created(user)
    } catch (error) {
      return response.badRequest(
        { message: 'Unable to create user', errors: error.messages })
    }
  }

  /**
   * Get a user by ID
   */
  async show({ params, response }: HttpContext) {
    const id = params.id

    // try {
    const user = await User.find(id)

    if (!user) {
      return response.notFound({ message: `User ${id} not found` })
    }

    return response.json(user)

    // } catch (error) {
    //     return response.badRequest(
    //         {message: 'Unable to delete user', errors: error.messages})
    // }
  }

  // /**
  //  * Update a user by ID
  //  */
  // async update({ params, request, auth}: HttpContext) {

  // }

  /**
   * Delete user via ID
   */
  async destroy({ params, response }: HttpContext) {
    const id = params.id

    try {
      const user = await User.find(id)

      if (!user) {
        return response.notFound({ message: `User ${id} not found` })
      }

      // Else
      await user.delete()
      return response.noContent()

    } catch (error) {
      return response.badRequest(
        { message: 'Unable to delete user', errors: error.messages })
    }
  }
}