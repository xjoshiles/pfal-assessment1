import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory.define(User, ({ faker }) => {
  return {
    username: faker.internet.username(),
    password: faker.internet.password(),
    admin: false, // Default is false, will be overridden when needed
  }
}).build()
