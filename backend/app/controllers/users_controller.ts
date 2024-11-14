import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'


export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    try {
      const users = await User.all()
      return response.json(users)
    } catch (error) {
      return response.status(500).json({message: 'Error fetching users'})
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}


  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}