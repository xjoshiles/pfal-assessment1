import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { RegisterUserValidator } from '#validators/register_user'
import { UpdateUserValidator } from '#validators/update_user'

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
      const payload = await request.validateUsing(RegisterUserValidator)
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

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: `User ${id} not found` })
    }

    return response.json(user)
  }

  /**
   * Update a user by ID
   */
  async update({ params, request, response, auth}: HttpContext) {
    const id = params.id

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: `User ${id} not found` })
    }

    const payload = await request.validateUsing(UpdateUserValidator)

    // Authorisation: Check if the current user can perform the update
    const isAdmin = auth.user?.admin || false
    const isSelf = auth.user?.id === id

    // If current user is not the given user nor an admin
    if (!isSelf && !isAdmin) {
      return response.unauthorized({
        message: "You are not authorised to perform this action",
        error: "Unauthorised"
      })
    }

    try {
      // Update fields based on the type of user
      if (isSelf) {
        // A user can update their username and/or password
        if (payload.username) user.username = payload.username
        if (payload.password) user.password = payload.password
      }
  
      if (isAdmin && payload.admin !== undefined) {
        // An admin can update the admin status of the user
        user.admin = payload.admin;
      }

      await user.save()
      return response.ok({ message: 'User updated successfully', user })
  
    } catch (error) {
      return response.internalServerError({
        message: 'Unable to update user',
        errors: error.messages || error.message,
      })
    }
  }

  /**
   * Delete user via ID
   */
  async destroy({ params, response, auth }: HttpContext) {
    const id = params.id

    try {
      const user = await User.find(id)
      if (!user) {
        return response.notFound({ message: `User ${id} not found` })
      }

      // If current user is not the given user nor an admin
      if (auth.user!.id != user.id && !auth.user?.admin) {
        return response.unauthorized({
          message: "You are not authorised to perform this action",
          error: "Unauthorised"
        })
      }
      // Else
      await user.delete()
      return response.noContent()

    } catch (error) {
      return response.notFound(
        { message: 'Unable to delete user', errors: error.messages })
    }
  }
}