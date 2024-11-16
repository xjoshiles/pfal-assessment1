import factory from '@adonisjs/lucid/factories'
import Collection from '#models/collection'

export const CollectionFactory = factory
  .define(Collection, async ({ faker }) => {
    return {}
  })
  .build()