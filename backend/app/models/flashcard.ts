import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import FlashcardSet from '#models/flashcard_set'

export default class Flashcard extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare question: string

  @column()
  declare answer: string

  @column()
  declare difficulty: 'easy' | 'medium' | 'hard'

  @column()
  declare flashcardSetId: number

  @belongsTo(() => FlashcardSet)
  declare flashcardSet: BelongsTo<typeof FlashcardSet>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime
}