import CollectionForm from "@/components/CollectionForm"
import { CollectionType } from "@/lib/types"
import { cookies } from "next/headers"

interface EditCollectionProps {
  params: { id: string }
}

export default async function EditCollection({ params }: EditCollectionProps) {
  const { id } = await params
  const collection = await getCollectionById(id) as CollectionType
  const sets = await getFlashcardSets()

  // Extract the flashcard set IDs to pass to the form component
  const flashcardSetIds = collection.flashcardSets.map(set => set.id)

  return (
    <section className="bg-gray-100">
      <div className="section_container min-h-screen-nonav bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Edit Flashcard Set Collection
        </h1>
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