import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import FlashcardSet from '#models/flashcard_set'
import CollectionReview from '#models/collection_review'

export default class Collection extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @hasMany(() => CollectionReview)
  declare reviews: HasMany<typeof CollectionReview>

  @column()
  declare averageRating: number

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare creator: BelongsTo<typeof User>

  @manyToMany(() => FlashcardSet, {
    pivotTable: 'collection_flashcard_sets',
    pivotTimestamps: true
  })
  declare flashcardSets: ManyToMany<typeof FlashcardSet>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}