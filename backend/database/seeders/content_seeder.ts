import { BaseSeeder } from '@adonisjs/lucid/seeders'
import FlashcardSet from '#models/flashcard_set'

import sets from '#database/seeders/data/sets'
import { UserFactory } from '#database/factories/user_factory'
import Flashcard from '#models/flashcard'

export default class extends BaseSeeder {
  async run() {
    const user = await UserFactory.merge({
      username: 'admin',
      password: 'password',
      admin: true
    }).create()


    for (const s of sets) {
      // Create the flashcard set
      const set = await FlashcardSet.create({
        name: s.name,
        description: s.description,
        userId: user.id
      })

      // Prepare the flashcards with the flashcard set ID
      const flashcardsData = s.flashcards.map((flashcard) => ({
        ...flashcard,
        flashcardSetId: set.id,
      }))

      await Flashcard.createMany(flashcardsData)
    }
  }
}
