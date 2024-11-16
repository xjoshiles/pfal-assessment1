import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'collection_flashcard_sets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('collection_id')    // Foreign key to collections
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('collections')
        .onDelete('CASCADE')            // Del relation if collection is deleted
      table.integer('flashcard_set_id') // Foreign key to flashcard_sets
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('flashcard_sets')
        .onDelete('CASCADE')            // Del relation if set is deleted
      table.unique(['collection_id', 'flashcard_set_id'])
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}