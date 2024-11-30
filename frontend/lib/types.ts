export type UserType = {
  id: number,
  username: string,
  admin: boolean,
  createdAt: Date,
  updatedAt: Date
}

export const defaultUser: UserType = {
  id: 0,
  username: '',
  admin: false,
  createdAt: new Date(0),
  updatedAt: new Date(0),
}

export type FlashcardType = {
  id: number,
  question: string,
  answer: string,
  difficulty: string
}

export type FlashcardSetType = {
  id: number,
  name: string,
  description: string,
  averageRating: number,
  flashcards: FlashcardType[],
  userId: number,
  username: string,
  createdAt: Date,
  updatedAt: Date
}

export type ReviewType = {
  rating: number,
  review: string,
  userId: number,
  username: string,
  flashcardSetId: number,
  createdAt: Date,
  updatedAt: Date,
  id: number
}