import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import FlashcardSet from '#models/flashcard_set'

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare rating: number

  @column()
  declare review: string

  @column()
  declare userId: number

  @column()
  declare username: string

  @column()
  declare flashcardSetId: number

  @belongsTo(() => FlashcardSet)
  declare flashcardSet: BelongsTo<typeof FlashcardSet>

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}