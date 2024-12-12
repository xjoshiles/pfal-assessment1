import type { HttpContext } from '@adonisjs/core/http'
import { LimitValidator } from '#validators/limit'
import { errors } from '@vinejs/vine'
import RateLimiter from '#services/rate_limiter'

export default class LimitsController {
  /**
   * Get the daily limit and today's count
   */
  public async getDailyLimitInfo({ response }: HttpContext) {
    return response.ok({
      limit: await RateLimiter.getDailyLimit(),
      today: await RateLimiter.getDailyCount(),
    })
  }

  /**
   * Update the daily creation limit (only accessible by admin users)
   */
  public async updateDailyLimit({ auth, request, response }: HttpContext) {
    // Ensure the user is authenticated as an admin
    if (!auth.user?.admin) {
      return response.forbidden({ message: 'Access denied' })
    }

    try {
      // Validate the new limit
      const payload = await request.validateUsing(LimitValidator)

      // Attempt to update the limit using the RateLimiter service
      const success = await RateLimiter.updateDailyLimit(payload.limit)

      if (!success) {
        return response.notFound({
          message: 'Failed to update daily creation limit'
        })
      }

      return response.ok({
        message: `Daily creation limit set to ${payload.limit}`
      })

    } catch (error) {
      // Return first error message if it's a validation error
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          message: error.messages[0].message  // (VineJS SimpleErrorReporter)
        })
      }
      // Else...
      return response.internalServerError({
        message: error.message || 'Error updating limit',
      })
    }
  }
}