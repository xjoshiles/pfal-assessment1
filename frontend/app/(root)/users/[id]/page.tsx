import { cookies } from 'next/headers'
import UserLibrary from '@/components/UserLibrary'

interface LibraryProps {
  params: { id: string }
}

export default async function Library({ params }: LibraryProps) {
  const { id } = await params
  const user = await getUser(id)
  const sets = await getUserFlashcardSets(id)
  const collections = await getUserCollections(id)

  return <UserLibrary username={user.username} sets={sets} collections={collections} />
}

async function getUserFlashcardSets(userId: string) {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users/${userId}/sets`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    }
  )
  const data = await response.json()
  return data
}

async function getUserCollections(userId: string) {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users/${userId}/collections`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    }
  )
  const data = await response.json()
  return data
}

async function getUser(userId: string) {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/users/${userId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
    }
  )
  const data = await response.json()
  return data
}
