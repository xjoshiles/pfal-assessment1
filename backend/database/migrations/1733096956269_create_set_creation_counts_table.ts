import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'set_creation_counts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.date('date').primary()  // Date as the primary key
      table.integer('total_created').unsigned().defaultTo(0)

      // Add an index on the 'date' column for faster lookups
      table.index('date', 'set_creation_counts_date_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}