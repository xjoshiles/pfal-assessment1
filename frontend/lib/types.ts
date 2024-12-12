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
  updatedAt: new Date(0)
}

export type FlashcardType = {
  id?: number,
  question: string,
  answer: string,
  difficulty: string
}

export type FlashcardSetType = {
  id: number,
  name: string,
  description: string,
  flashcards: FlashcardType[],
  averageRating: number,
  reviews: ReviewType[],
  userId: number,
  creator?: UserType,
  createdAt: Date,
  updatedAt: Date
}

export type SetFormType = {
  name: string,
  description: string,
  flashcards: FlashcardType[]
}

export type CollectionType = {
  id: number,
  name: string,
  description: string,
  averageRating: number,
  reviews: ReviewType[],
  userId: number,
  creator?: UserType,
  flashcardSets: FlashcardSetType[],
  createdAt: Date,
  updatedAt: Date
}

export type CollectionFormType = {
  name: string,
  description: string,
  flashcardSetIds: number[]
}

type ReviewBaseType = {
  id: number,
  rating: number,
  review: string,
  userId: number,
  author: UserType,
  createdAt: Date,
  updatedAt: Date
}

export type ReviewType = ReviewBaseType & (
  | { flashcardSetId: number; collectionId?: never }  // `flashcardSetId` is required, `collectionId` must not exist
  | { flashcardSetId?: never; collectionId: number }  // `collectionId` is required, `flashcardSetId` must not exist
)

export type LimitsInfoType = {
  limit: number,
  today: number
}
