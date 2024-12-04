import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Review from '#models/review'
import Flashcard from '#models/flashcard'
import User from '#models/user'

export default class FlashcardSet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @hasMany(() => Flashcard)
  declare flashcards: HasMany<typeof Flashcard>

  @hasMany(() => Review)
  declare reviews: HasMany<typeof Review>

  @column()
  declare averageRating: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare creator: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  declare updatedAt: DateTime

  @beforeSave()
  public static preventUpdatedAt(instance: FlashcardSet) {
    // Use $dirty to check which fields are being updated
    const changes = instance.$dirty

    // Prevent updating the 'updatedAt' column if
    // only the averageRating field has changed
    if (Object.keys(changes).length === 1 && 'averageRating' in changes) {
      return

    } else {
      // Manually update 'updatedAt' only when other fields are dirty
      instance.updatedAt = DateTime.local()
    }
  }
}
