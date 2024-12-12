import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { RegisterUserValidator } from '#validators/register_user'
import { UpdateUserValidator } from '#validators/update_user'
import { errors } from '@vinejs/vine'
import hash from '@adonisjs/core/services/hash'
import { DeleteUserValidator } from '#validators/delete_user'
import { ToggleAdminValidator } from '#validators/toggle_admin'

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
      await user.refresh()
      return response.created(user)

    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {

        // Return 409 status code if username already exists
        if (error.messages[0].rule == 'database.unique') {
          return response.conflict({
            message: error.messages[0].message
          })
        }

        // Else return 422 for other validation errors
        return response.unprocessableEntity({
          message: error.messages[0].message
        })
      }

      return response.internalServerError({
        message: error.message || 'Unable to create user'
      })
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
   * Update a user's password by ID
   */
  async update({ params, request, response, auth }: HttpContext) {
    const id = params.id

    // Only allow users to change their own passwords
    if (auth.user?.id != id) {
      return response.forbidden({
        message: "You are not authorised to update this user's password"
      })
    }

    // Use the authenticated user since the ID matches
    const user = auth.user as User

    try {
      const payload = await request.validateUsing(UpdateUserValidator)

      // Ensure the given password is correct before continuing
      const isValid = await hash.verify(user.password, payload.password)
      if (!isValid) {
        return response.unauthorized({  // additional authentication failed
          message: "The current password was incorrect"
        })
      }

      // Set the new password
      user.password = payload.newPassword

      await user.save()
      return response.ok({ message: 'Password updated successfully' })

    } catch (error) {
      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.internalServerError({
        message: error.message || 'Unable to update user password'
      })
    }
  }

  /**
   * Delete user via ID
   */
  async destroy({ params, request, response, auth }: HttpContext) {
    const id = params.id
    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: `User ${id} not found` })
    }

    // If current user is not the given user nor an admin
    if (auth.user!.id != user.id && !auth.user?.admin) {
      return response.forbidden({
        message: "You are not authorised to delete this user",
      })
    }

    try {
      // Ensure that users provide their password if deleting their own account
      if (auth.user!.id == user.id) {
        const payload = await request.validateUsing(DeleteUserValidator)

        // Ensure the given password is correct before continuing
        const isValid = await hash.verify(user.password, payload.password)
        if (!isValid) {
          return response.unauthorized({  // additional authentication failed
            message: "The current password was incorrect"
          })
        }
      }

      // By this point the user has verified their password
      // or is admin deleting the account of another user
      await user.delete()
      return response.noContent()

    } catch (error) {
      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.internalServerError({
        message: error.message || 'Unable to delete user',
      })
    }
  }

  /**
   * Update admin status of user by ID
   */
  async updateAdmin({ params, request, response, auth }: HttpContext) {
    const id = params.id

    // Only admins can update the admin status of a user
    if (!auth.user?.admin) {
      return response.forbidden({
        message: "You are not authorised to make this user an admin"
      })
    }

    // Admins cannot remove their own admin status
    if (auth.user.id == id) {
      return response.forbidden({
        message: "Only another admin can remove your admin status"
      })
    }

    const user = await User.find(id)
    if (!user) {
      return response.notFound({ message: `User ${id} not found` })
    }

    try {
      const payload = await request.validateUsing(ToggleAdminValidator)

      // Update the admin status of the given user
      user.admin = payload.admin

      await user.save()
      return response.ok(user)

    } catch (error) {
      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.internalServerError({
        message: error.message || 'Unable to update admin status of user',
      })
    }
  }
}
