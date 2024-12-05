import { DateTime } from 'luxon'
import { afterDelete, afterSave, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import FlashcardSet from '#models/flashcard_set'

export default class SetReview extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare rating: number

  @column()
  declare review: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @column()
  declare flashcardSetId: number

  @belongsTo(() => FlashcardSet)
  declare flashcardSet: BelongsTo<typeof FlashcardSet>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @afterSave()
  @afterDelete()
  public static async updateAverageRatings(review: SetReview) {
    const flashcardSetId = review.flashcardSetId

    // Recalculate average rating for the flashcard set
    const result = await SetReview.query()
      .where('flashcard_set_id', flashcardSetId)
      .avg('rating as averageRating')
      .first()

    const averageRating = result?.$extras.averageRating || 0

    // Update the flashcard set's averageRating
    // await FlashcardSet.query()
    //   .where('id', flashcardSetId)
    //   .update({ averageRating })

    const set = await FlashcardSet.find(flashcardSetId)
    set!.averageRating = averageRating
    set!.save()
  }
}