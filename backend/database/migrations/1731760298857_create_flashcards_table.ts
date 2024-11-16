import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'flashcards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('question').notNullable()
      table.string('answer').notNullable()
      table.enum('difficulty', ['easy', 'medium', 'hard']).notNullable()
      table.integer('flashcard_set_id') // Foreign key to flashcard_sets table
        .unsigned()
        .references('id')
        .inTable('flashcard_sets')
        .onDelete('CASCADE')            // Delete flashcards if set is deleted
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}