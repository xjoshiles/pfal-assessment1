import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('comment').notNullable()
      table.integer('flashcard_set_id') // Foreign key to flashcard_sets
        .unsigned()
        .references('id')
        .inTable('flashcard_sets')
        .onDelete('CASCADE')            // Delete comments if set is deleted
      table.integer('user_id')          // Foreign key to users (author)
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')            // Delete comments if user is deleted
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}