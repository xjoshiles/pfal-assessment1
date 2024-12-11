import { cookies } from "next/headers"
import { CollectionType, FlashcardSetType, LimitsInfoType, UserType } from "@/lib/types"

export async function getFlashcardSets(): Promise<FlashcardSetType[]> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/sets/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })
  const data = await response.json()
  return data
}

export async function getFlashcardSetById(id: string): Promise<FlashcardSetType> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/sets/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch flashcard set')
  }

  return response.json()
}

export async function getFlashcardSetsByUserId(id: string): Promise<FlashcardSetType[]> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users/${id}/sets`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      }
    })

  const data = await response.json()
  return data
}

export async function getCollections(): Promise<CollectionType[]> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/collections`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    })

  const data = await response.json()
  return data
}

export async function getCollectionById(id: string): Promise<CollectionType> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/collections/${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    })

  if (!response.ok) {
    throw new Error('Failed to fetch collection')
  }

  return response.json()
}

export async function getCollectionsByUserId(id: string): Promise<CollectionType[]> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users/${id}/collections`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      }
    })

  const data = await response.json()
  return data
}

export async function getUsers(): Promise<UserType[]> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })

  const data = await response.json()
  return data
}

export async function getUserById(id: string): Promise<UserType> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users/${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    })

  const data = await response.json()
  return data
}

export async function getDailyLimitInfo(): Promise<LimitsInfoType> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/limits/sets`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch daily set creation limit info')
  }

  const data = await response.json()
  return data
}

export async function canCreateSet(): Promise<boolean> {
  const info = await getDailyLimitInfo()
  return info.today < info.limit ? true : false
}
