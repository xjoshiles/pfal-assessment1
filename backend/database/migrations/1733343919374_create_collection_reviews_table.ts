import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'collection_reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('rating').unsigned().notNullable().checkBetween([1, 5])
      table.string('review').notNullable()
      table.integer('user_id')        // Foreign key to users (author)
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')          // Delete reviews if user is deleted
      table.integer('collection_id')  // Foreign key to collections table
        .unsigned()
        .references('id')
        .inTable('collections')
        .onDelete('CASCADE')          // Delete reviews if collection is deleted
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}