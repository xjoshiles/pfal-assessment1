import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'set_creation_counts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Use date as the primary key. This is automatically indexed
      // https://www.sqlite.org/lang_createtable.html
      table.date('date').primary()
      table.integer('total_created').unsigned().defaultTo(0)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}