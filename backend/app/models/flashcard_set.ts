import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import SetReview from '#models/set_review'
import Flashcard from '#models/flashcard'
import User from '#models/user'
import Collection from '#models/collection'

export default class FlashcardSet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @hasMany(() => Flashcard)
  declare flashcards: HasMany<typeof Flashcard>

  @hasMany(() => SetReview)
  declare reviews: HasMany<typeof SetReview>

  @column()
  declare averageRating: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare creator: BelongsTo<typeof User>

  @manyToMany(() => Collection, {
    pivotTable: 'collection_flashcard_sets',
    pivotTimestamps: true
  })
  declare collections: ManyToMany<typeof Collection>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: false })
  declare updatedAt: DateTime

  @beforeSave()
  public static preventUpdatedAt(instance: FlashcardSet) {
    const changes = instance.$dirty  // which fields are being updated

    // Prevent updating the updatedAt column if
    // only the averageRating field has changed
    if (Object.keys(changes).length === 1 && 'averageRating' in changes) {
      return

    } else {
      // Manually update 'updatedAt' only when other fields are dirty
      instance.updatedAt = DateTime.local()
    }
  }
}
