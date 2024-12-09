import factory from '@adonisjs/lucid/factories'
import Flashcard from '#models/flashcard'

export const FlashcardFactory = factory
  .define(Flashcard, async ({ faker }) => {
    return {
      question: faker.lorem.sentence(),
      answer: faker.lorem.word(),
      difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
    }
  })
  .build()
