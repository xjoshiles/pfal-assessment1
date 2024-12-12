import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory} from '#database/factories/user_factory'

export default class extends BaseSeeder {
  async run() {
    await UserFactory.merge({
      username: 'admin',
      password: 'password',
      admin: true
    }).create()
  }
}
