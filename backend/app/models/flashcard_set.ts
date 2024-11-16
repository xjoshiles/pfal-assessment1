import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Comment from '#models/comment'
import Flashcard from '#models/flashcard'
import User from '#models/user'

export default class FlashcardSet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @hasMany(() => Flashcard)
  declare flashcards: HasMany<typeof Flashcard>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare creator: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}