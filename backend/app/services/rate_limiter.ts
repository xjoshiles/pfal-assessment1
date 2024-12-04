import db from "@adonisjs/lucid/services/db"
import { TransactionClientContract } from "@adonisjs/lucid/types/database"
import logger from "@adonisjs/core/services/logger"
import { DateTime } from "luxon"

export default class RateLimiter {
  // Default daily limit if no record is found
  private static readonly DEFAULT_DAILY_LIMIT = 20

  /**
   * Get the current daily creation limit for flashcard sets
   */
  public static async getDailyLimit(trx?: TransactionClientContract): Promise<number> {
    const client = trx || db // Use trx if provided, else fall back to Database

    const limitRecord = await client
      .from('app_config')
      .where('key', 'set_creation_daily_limit')
      .select('value')
      .first()

    if (!limitRecord) {
      logger.warn(`set_creation_daily_limit in app_config table not found, `
        + `defaulting to DEFAULT_DAILY_LIMIT of ${this.DEFAULT_DAILY_LIMIT}`)
      return this.DEFAULT_DAILY_LIMIT
    }

    return parseInt(limitRecord.value, 10)
  }

  /**
   * Get the total number of flashcard sets created today
   */
  public static async getDailyCount(trx?: TransactionClientContract): Promise<number> {
    const client = trx || db // Use trx if provided, else fall back to Database

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Fetch the record for today (if it exists)
    const record = await client
      .from('set_creation_counts')
      .where('date', today)
      .first()

    // Return the total sets created today (default to 0 if no record exists)
    return record?.total_created || 0
  }

  /**
   * Check if the number of sets created today is less than the daily limit
   */
  public static async canCreateSet(trx: TransactionClientContract): Promise<boolean> {
    const dailyCount = await this.getDailyCount(trx)
    const dailyLimit = await this.getDailyLimit(trx)
    return dailyCount < dailyLimit
  }

  /**
   * Increment the total set creation count for today
   */
  public static async incrementSetCount(trx: TransactionClientContract): Promise<void> {
    const today = new Date().toISOString().split('T')[0]

    // Fetch the record for today (if it exists)
    const record = await trx
      .from('set_creation_counts')
      .where('date', today)
      .first()

    if (record) {
      // If the record exists, increment the count
      await trx
        .from('set_creation_counts')
        .where('date', today)
        .increment('total_created', 1)

    } else {
      // If the record doesn't exist, create a new record with count = 1
      await trx
        .table('set_creation_counts')
        .insert({
          date: today,
          total_created: 1,
        })
    }
  }

  /**
   * Update the daily creation limit
   */
  public static async updateDailyLimit(newLimit: number): Promise<boolean> {
    // Update the limit in the app_config table
    const rowsUpdated = await db
      .from('app_config')
      .where('key', 'set_creation_daily_limit')
      .update({
        value: newLimit.toString(),
        updated_at: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss')
      })

    if (!rowsUpdated) {
      logger.warn(`Failed to update set_creation_daily_limit in app_config `
        + `table to ${newLimit}. No rows were affected`)
      return false
    }

    return true
  }
}
