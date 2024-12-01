import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { RegisterUserValidator } from '#validators/register_user'
import { UpdateUserValidator } from '#validators/update_user'
import { errors } from '@vinejs/vine'
import hash from '@adonisjs/core/services/hash'
import { DeleteUserValidator } from '#validators/delete_user'

export default class UsersController {
  /**
   * Get all users
   */
  async index({ response }: HttpContext) {
    try {
      const users = await User.all()
      return response.json(users)
    } catch (error) {
      return response.internalServerError({ message: 'Error fetching users' })
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
        { message: error.messages[0].message })
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
  async update({ params, request, response, auth }: HttpContext) {
    const id = params.id

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: `User ${id} not found` })
    }

    // Authorisation: Check if the current user can perform the update
    const isAdmin = auth.user?.admin || false
    const isSelf = auth.user?.id == id

    // If current user is not the given user nor an admin
    if (!isSelf && !isAdmin) {
      return response.unauthorized({
        message: "You are not authorised to perform this action",
        error: "Unauthorised"
      })
    }

    try {
      const payload = await request.validateUsing(UpdateUserValidator)

      // Update fields based on the type of user
      if (isSelf) {
        // A user can update their password
        if (payload.password && payload.newPassword) {
          const isValid = await hash.verify(user.password, payload.password)
          if (isValid) {
            user.password = payload.newPassword

          } else {
            return response.unauthorized({
              message: "The current password was incorrect",
              error: "Unauthorised"
            })
          }
        }
      }

      if (isAdmin && payload.admin !== undefined) {
        // An admin can update the admin status of the user
        user.admin = payload.admin;
      }

      await user.save()
      return response.ok({ message: 'User updated successfully', user })

    } catch (error) {
      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.log(error.messages[0].message)
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }

      return response.internalServerError({
        message: 'Unable to update user',
        errors: error.messages || error.message,
      })
    }
  }

  /**
   * Delete user via ID
   */
  async destroy({ params, request, response, auth }: HttpContext) {
    const id = params.id
    console.log(id)
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

    try {
      console.log(request.toJSON())
      const payload = await request.validateUsing(DeleteUserValidator)

      const isValid = await hash.verify(user.password, payload.password)
      if (!isValid) {
        return response.unauthorized({
          message: "The current password was incorrect",
          error: "Unauthorised"
        })
      }
      await user.delete()
      return response.noContent()

    } catch (error) {
      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        console.log(error.messages[0].message)
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }

      return response.internalServerError({
        message: 'Unable to update user',
        errors: error.messages || error.message,
      })
    }
  }
}
