import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  
  async handle({ request, response }: HttpContext) {
    const { username, password } = request.only(['username', 'password'])

    try {
      // Verify credentials and get user (throws exception if fail)
      const user = await User.verifyCredentials(username, password)

      //await User.accessTokens.delete

      // Generate a token for the user
      const token = await User.accessTokens.create(user)

      return response.ok(token)

    } catch (error) {
      return response.unauthorized({
        message: 'Invalid email or password',
      })
    }
  }
}