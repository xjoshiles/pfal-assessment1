import { DateTime } from 'luxon'
import { afterDelete, afterSave, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Collection from '#models/collection'

export default class CollectionReview extends BaseModel {
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
  declare collectionId: number

  @belongsTo(() => Collection)
  declare collection: BelongsTo<typeof Collection>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @afterSave()
  @afterDelete()
  public static async updateAverageRating(review: CollectionReview) {
    const collectionId = review.collectionId

    // Recalculate average rating for the collection
    const result = await CollectionReview.query()
      .where('collection_id', collectionId)
      .avg('rating as averageRating')
      .first()

    const averageRating = result?.$extras.averageRating || 0

    // Update the collection's averageRating
    // Note that this won't trigger an update of the updatedAt column
    // of the collection as we are not calling save on a model
    // instance, but rather running a raw SQL UPDATE query
    await Collection.query()
      .where('id', collectionId)
      .update({ averageRating })
  }
}