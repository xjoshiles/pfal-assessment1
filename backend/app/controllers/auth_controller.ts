import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { LoginUserValidator } from '#validators/login_user'

export default class AuthController {

  async login({ request, response }: HttpContext) {
    try {
      // Validate that a username and password was provided (error if fail)
      const { username, password } = await request.validateUsing(
        LoginUserValidator
      )

      // Verify credentials and get user (error if fail)
      const user = await User.verifyCredentials(username, password)

      // Generate a token for the user
      const token = await User.accessTokens.create(user)

      // Return session token and user data
      return response.ok({ token, user })

    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.unauthorized({
          message: 'Invalid username or password'
        })
      }
      return response.internalServerError({
        message: error.message || 'Unable to login'
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      User.accessTokens.delete(user, user.currentAccessToken.identifier)

      return response.ok({ message: 'logged out successfully' })

    } catch (error) {
      return response.unauthorized({
        message: error.messages[0].message,
      })
    }
  }

  async authorised({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      return response.ok(user)

    } catch (error) {
      return response.unauthorized({
        message: error.message,
      })
    }
  }
}