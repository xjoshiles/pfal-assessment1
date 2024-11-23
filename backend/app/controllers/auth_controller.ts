import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {

  async login({ request, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      // Verify credentials and get user (throws exception if fail)
      const user = await User.verifyCredentials(username, password)

      // Generate a token for the user
      const token = await User.accessTokens.create(user)

      return response.ok(token)

    } catch (error) {
      return response.unauthorized({
        message: 'Invalid username or password',
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
    const user = await auth.authenticate()
    if (user) {
      console.log('hehe')
    }
    return response.ok(user)
  }
}