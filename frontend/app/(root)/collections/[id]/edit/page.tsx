import CollectionForm from "@/components/CollectionForm"
import { getCurrentUser } from "@/lib/session"
import { CollectionType } from "@/lib/types"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface EditCollectionProps {
  params: { id: string }
}

export default async function EditCollection({ params }: EditCollectionProps) {
  const { id } = await params
  const collection = await getCollectionById(id) as CollectionType
  const user = await getCurrentUser()

  // Redirect user to the collection if they do not have permission to edit
  if (collection.userId != user.id) {
    redirect(`/collections/${id}`)
  }

  // Get the available sets to pass to the form component
  const sets = await getFlashcardSets()

  // Extract the flashcard set IDs to pass to the form component
  const flashcardSetIds = collection.flashcardSets.map(set => set.id)

  return (
    <section>
      <div className="min-h-screen">
        <h1 className="title title-background">
          Edit a Flashcard Set Collection
        </h1>
        <div className="section_container">
          <CollectionForm
            initialCollection={{
              name: collection.name,
              description: collection.description,
              flashcardSetIds: flashcardSetIds
            }}
            collectionId={id}
            sets={sets}
          />
        </div>
      </div>
    </section>
  )
}

async function getCollectionById(id: string) { // : Promise<FlashcardSetType> {
  const sessionToken = (await cookies()).get('sessionToken')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ADONIS_API}/collections/${id}`, {
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

async function getFlashcardSets() {
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