import UserLibrary from '@/components/UserLibrary'
import { getCollectionsByUserId, getFlashcardSetsByUserId, getUserById } from '@/lib/api'

interface LibraryProps {
  params: { id: string }
}

export default async function Library({ params }: LibraryProps) {
  const { id } = await params
  const user = await getUserById(id)
  const sets = await getFlashcardSetsByUserId(id)
  const collections = await getCollectionsByUserId(id)

  return <UserLibrary username={user.username} sets={sets} collections={collections} />
}
