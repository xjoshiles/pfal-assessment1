import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import SetReview from '#models/set_review'
import FlashcardSet from '#models/flashcard_set'
import Collection from '#models/collection'
import CollectionReview from '#models/collection_review'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })   // Primary key
  declare id: number

  @column()
  declare username: string

  @column({ serializeAs: null }) // Won't show show up in JSON output
  declare password: string

  @column({ serialize: (value: number) => {
    return Boolean(value)        // true/false in JSON output instead of 1/0
  }})
  declare admin: boolean

  @hasMany(() => SetReview)
  declare setReviews: HasMany<typeof SetReview>

  @hasMany(() => FlashcardSet)
  declare flashcardSets: HasMany<typeof FlashcardSet>

  @hasMany(() => CollectionReview)
  declare collectionReviews: HasMany<typeof CollectionReview>

  @hasMany(() => Collection)
  declare collections: HasMany<typeof Collection>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days'
  })
}