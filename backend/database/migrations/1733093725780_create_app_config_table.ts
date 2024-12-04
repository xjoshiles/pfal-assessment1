import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'app_config'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 255).primary()
      table.string('value', 255).notNullable()
      table.timestamp('created_at').defaultTo(this.now()).notNullable()
      table.timestamp('updated_at').defaultTo(this.now()).nullable()
    })

    // Insert the initial configuration value for flashcard set creation limit
    this.schema.raw(`
      INSERT INTO app_config (key, value)
      VALUES ('set_creation_daily_limit', '20')
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}